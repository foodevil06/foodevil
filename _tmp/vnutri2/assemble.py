# Builds the part-2 voice from one file per line (_tmp/vnutri2/lines/NN.mp3, see tts_lines.py):
# trims each line, evens the speech level, applies the role's sound (door: muffled + landing echo, phone: dry band,
# whispers: thin and quiet), lays the lines out with the pauses from lines.json ("gap" after each line, may be negative
# to overlap), and finds word times per line with Whisper. Whispers (role W) go to their own files, so the mix can pan them.
#   python _tmp/vnutri2/assemble.py  ->  _tmp/vnutri2/final/voice.wav, final/w_NN.wav, src/toon/episodes/vnutri2.voice.json
import json, os, subprocess, numpy as np, wave
from faster_whisper import WhisperModel
SR = 48000
C = json.load(open('_tmp/vnutri2/lines.json', encoding='utf-8'))
os.makedirs('_tmp/vnutri2/final', exist_ok=True)

def dec(p, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', p] + (['-af', af] if af else []) + ['-f', 'f32le', '-ac', '1', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)

def levels(x):
    h = int(0.01 * SR)
    return np.array([20 * np.log10(np.sqrt(np.mean(x[k:k + h] ** 2)) + 1e-9) for k in range(0, len(x) - h, h)])

def write(p, x):
    with wave.open(p, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

model = WhisperModel('small', device='cpu', compute_type='int8')
clips, t = [], C['lead']
for i, ln in enumerate(C['lines']):
    raw = dec(f'_tmp/vnutri2/lines/{i:02d}.mp3')
    db = levels(raw)
    on = max(0, int(np.argmax(db > -45)) - 3); off = len(db) - int(np.argmax(db[::-1] > -45)) + 8
    x = raw[on * SR // 100: off * SR // 100]
    sp = levels(x); x *= 10 ** ((-20 - np.mean(sp[sp > -45])) / 20)        # speech at -20 dBFS
    tmp = f'_tmp/vnutri2/final/_clip.wav'; write(tmp, x)
    fx = C['fx'][ln['role']]
    y = dec(tmp, fx['af']) * 10 ** (fx['db'] / 20)
    # word times on the clean clip (16 kHz for Whisper), matched to the subtitle words
    text = ln.get('sub', ln['say']); toks = []
    for k in text.split():  # a lone dash rides with the previous word ("Я —")
        if k in ('—', '-') and toks: toks[-1] += ' —'
        else: toks.append(k)
    x16 = x[::3].astype(np.float32)
    segs, _ = model.transcribe(x16, language='ru', word_timestamps=True)
    ws = [w for s in segs for w in (s.words or [])]
    dur = len(x) / SR
    if len(ws) == len(toks):
        st = [max(0.0, min(w.start, dur - 0.05)) for w in ws]
    else:  # proportional by letters inside the spoken part
        L = np.cumsum([0] + [len(k) + 1 for k in toks]); st = [0.03 + (dur - 0.15) * L[k] / L[-1] for k in range(len(toks))]
    st[0] = 0.0
    for k in range(1, len(st)): st[k] = max(st[k], st[k - 1] + 0.06)
    clips.append({'i': i, 'role': ln['role'], 'y': y, 'start': t, 'dur': dur, 'text': text, 'words': [{'w': w, 't': round(t + s + 0.03, 3)} for w, s in zip(toks, st)]})
    print(f'{i:02d} {ln["role"]:2s} {t:6.2f}-{t + dur:6.2f} {"whisper" if len(ws) == len(toks) else "prop"}  {text}', flush=True)
    t += dur + ln['gap']
total = round(t, 2)
N = int(total * SR) + SR
voice = np.zeros(N)
for c in clips:
    k = int(c['start'] * SR)
    if c['role'] == 'W':
        write(f'_tmp/vnutri2/final/w_{c["i"]:02d}.wav', c['y'])
    else:
        voice[k:k + len(c['y'])] += c['y'][:N - k]
write('_tmp/vnutri2/final/voice.wav', voice[:int(total * SR)])
out = {'total': total, 'lines': [{'start': round(c['start'] + 0.03, 3), 'end': round(c['start'] + c['dur'] - 0.08, 3), 'text': c['text'], 'role': c['role'], 'words': c['words']} for c in clips]}
json.dump(out, open('src/toon/episodes/vnutri2.voice.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
os.remove('_tmp/vnutri2/final/_clip.wav')
print('total', total)
