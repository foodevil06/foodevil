# One-take narration -> the episode's voice: finds each line's real speech edges in the audio (Whisper only says which
# line a stretch of speech belongs to), inserts silence after chosen lines (room for knocks, screamers, slow shots),
# can give single lines their own sound (a quieter, closer double), and moves every word time along.
#   python scripts/voice_pauses.py <voice.wav> <voice.json> <out.wav> <out.json> --after 2:0.8 --after 13:1.6 \
#          [--fx 24:"volume=-5dB,equalizer=f=160:t=q:w=1:g=3"] [--tail 1.0]
# Cuts are made in the middle of the pause between two lines, so no word is ever clipped.
import argparse, json, subprocess, numpy as np, wave
SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument('wav'); ap.add_argument('json'); ap.add_argument('out_wav'); ap.add_argument('out_json')
ap.add_argument('--after', action='append', default=[]); ap.add_argument('--fx', action='append', default=[]); ap.add_argument('--tail', type=float, default=1.0)
a = ap.parse_args()

def dec(p, af=None, data=None):
    cmd = ['ffmpeg', '-v', 'error'] + (['-f', 'f64le', '-ar', str(SR), '-ac', '1'] if data is not None else []) + ['-i', '-' if data is not None else p] \
        + (['-af', af] if af else []) + ['-f', 'f32le', '-ac', '1', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, input=data, capture_output=True, check=True).stdout, np.float32).astype(np.float64)

x = dec(a.wav); V = json.load(open(a.json, encoding='utf-8')); L = V['lines']; n = len(L)
h = int(0.01 * SR); db = np.array([20 * np.log10(np.sqrt(np.mean(x[k:k + h] ** 2)) + 1e-9) for k in range(0, len(x) - h, h)])
loud = db > -42
reg = []; i = 0
while i < len(loud):  # speech regions: loud runs, gaps under 0.12 s merged, blips under 0.04 s dropped
    if loud[i]:
        j = i
        while j < len(loud) and loud[j]: j += 1
        if reg and i - reg[-1][1] < 12: reg[-1][1] = j
        else: reg.append([i, j])
        i = j
    else: i += 1
reg = [r for r in reg if r[1] - r[0] >= 4]
own = [[] for _ in range(n)]
for r0, r1 in reg:
    s0, s1 = r0 * 0.01, r1 * 0.01
    ov = [max(0, min(s1, L[k]['end'] + 0.05) - max(s0, L[k]['start'] - 0.05)) for k in range(n)]
    k = int(np.argmax(ov)) if max(ov) > 0 else int(np.argmin([min(abs(s0 - L[q]['end']), abs(s1 - L[q]['start'])) for q in range(n)]))
    own[k].append((s0, s1))
bounds = [(own[k][0][0], own[k][-1][1]) if own[k] else (L[k]['start'], L[k]['end']) for k in range(n)]
for k in range(n):
    if not own[k]: print('warning: no speech found for line', k, L[k]['text'])

# per-line sound
for spec in a.fx:
    k, af = spec.split(':', 1); k = int(k)
    s0, s1 = int((bounds[k][0] - 0.03) * SR), int((bounds[k][1] + 0.08) * SR)
    y = dec(None, af, x[s0:s1].tobytes()); y = y[:s1 - s0]
    x[s0:s0 + len(y)] = y

# silence after chosen lines, cut in the middle of the pause that follows
ins = {}
for spec in a.after:
    k, d = spec.split(':'); ins[int(k)] = ins.get(int(k), 0) + float(d)
cuts = []
for k, d in sorted(ins.items()):
    c = (bounds[k][1] + bounds[k + 1][0]) / 2 if k + 1 < n else bounds[k][1] + 0.15
    cuts.append((c, d))
shift = lambda t: t + sum(d for c, d in cuts if c <= t)
out, prev = [], 0
for c, d in cuts:
    ci = int(c * SR); out += [x[prev:ci], np.zeros(int(d * SR))]; prev = ci
out.append(x[prev:])
y = np.concatenate(out)
for k, ln in enumerate(L):
    st, en = round(shift(bounds[k][0]) + 0.02, 3), round(shift(bounds[k][1]) - 0.04, 3)
    ln['start'], ln['end'] = st, en
    ws = ln['words']
    for j, w in enumerate(ws): w['t'] = round(shift(w['t']), 3)
    ws[0]['t'] = st
    for j in range(1, len(ws)): ws[j]['t'] = round(min(max(ws[j]['t'], ws[j - 1]['t'] + 0.08), en - 0.1 * (len(ws) - j)), 3)
V['total'] = round(L[-1]['end'] + a.tail, 2)
y = np.concatenate([y, np.zeros(SR * 3)])[:int(V['total'] * SR)]
with wave.open(a.out_wav, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
json.dump(V, open(a.out_json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', round(len(x) / SR, 2), '->', V['total'], 's; inserted', round(sum(d for _, d in cuts), 2), 's')
