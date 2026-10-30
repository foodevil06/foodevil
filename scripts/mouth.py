# Lip sync for the mascot: a voice recording -> mouth openness 0..1 per video frame (JSON), from loudness alone.
#   python scripts/mouth.py <voice.wav|mp3> <out.json> [--fps 30] [--offset 0.95]
# offset: where the voice starts in the episode (s); the JSON keeps it, so the component reads mouth[frame - offset].
import argparse, json, subprocess
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument('audio'); ap.add_argument('out')
ap.add_argument('--fps', type=int, default=30); ap.add_argument('--offset', type=float, default=0.0)
a = ap.parse_args()
SR = 16000
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', a.audio, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout, np.float32)
hop = SR // a.fps
n = len(x) // hop
db = np.array([20 * np.log10(np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) + 1e-9) for i in range(n)])
voiced = db[db > -60]
lo, hi = (np.percentile(voiced, 20), np.percentile(voiced, 95)) if len(voiced) else (-60, -20)
v = np.clip((db - lo) / max(1e-6, hi - lo), 0, 1) ** 0.8
v[db < lo] = 0
# fast to open, a little slower to close, so syllables read as separate shapes
out = np.zeros(n)
for i in range(n):
    prev = out[i - 1] if i else 0
    out[i] = prev + (v[i] - prev) * (0.75 if v[i] > prev else 0.45)
json.dump({'fps': a.fps, 'offset': a.offset, 'mouth': [round(float(m), 3) for m in out]}, open(a.out, 'w'))
print('ok', a.out, n, 'frames, open', round(float(np.mean(out > 0.15)) * 100), '% of the time')
