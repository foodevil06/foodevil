# Lays out a several-voice episode from one file per line (scripts/cast_tts.py): trims each line, evens the speech
# level, gives each role its sound (ffmpeg filter chain: muffled door, phone speaker, pitch for a child or an old man),
# places the lines with the pauses from lines.json and finds word times per line with Whisper.
#   python scripts/cast_assemble.py <episode_dir> <out voice.json>
# lines.json: "lead": s before the first line; per line "gap" (s after it, may be negative to overlap);
#   "fx": {role: {"af": "<ffmpeg filters>", "db": gain, "solo": true}} — solo roles (whispers in one ear) are written to
#   their own files <dir>/final/<role>_NN.wav instead of voice.wav, so the cue sheet can pan them ("pan" in sfx.py).
# -> <dir>/final/voice.wav and the voice.json for the episode (lines with start/end/text/role/words).
import json, os, subprocess, sys, numpy as np, wave
from faster_whisper import WhisperModel
SR = 48000
D, OUT = sys.argv[1], sys.argv[2]
C = json.load(open(f'{D}/lines.json', encoding='utf-8'))
os.makedirs(f'{D}/final', exist_ok=True)

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
clips, t = [], C.get('lead', 0.5)
for i, ln in enumerate(C['lines']):
    raw = dec(f'{D}/lines/{i:02d}.mp3')
    db = levels(raw)
    on = max(0, int(np.argmax(db > -45)) - 3); off = len(db) - int(np.argmax(db[::-1] > -45)) + 8
    x = raw[on * SR // 100: off * SR // 100]
    sp = levels(x); x *= 10 ** ((-20 - np.mean(sp[sp > -45])) / 20)  # speech at -20 dBFS before the role's gain
    tmp = f'{D}/final/_clip.wav'; write(tmp, x)
    fx = C.get('fx', {}).get(ln['role'], {})
    y = dec(tmp, fx.get('af')) * 10 ** (fx.get('db', 0) / 20)
    text = ln.get('sub', ln['say']); toks = []
    for k in text.split():  # a lone dash rides with the previous word ("Я —")
        if k in ('—', '-') and toks: toks[-1] += ' —'
        else: toks.append(k)
    segs, _ = model.transcribe(x[::3].astype(np.float32), language='ru', word_timestamps=True)
    ws = [w for s in segs for w in (s.words or [])]
    dur = len(x) / SR
    if len(ws) == len(toks):
        st = [max(0.0, min(w.start, dur - 0.05)) for w in ws]
    else:  # proportional by letters inside the spoken part
        cum = np.cumsum([0] + [len(k) + 1 for k in toks]); st = [0.03 + (dur - 0.15) * cum[k] / cum[-1] for k in range(len(toks))]
    st[0] = 0.0
    for k in range(1, len(st)): st[k] = max(st[k], st[k - 1] + 0.06)
    clips.append({'i': i, 'role': ln['role'], 'y': y, 'solo': fx.get('solo', False), 'start': t, 'dur': dur, 'text': text,
                  'words': [{'w': w, 't': round(t + s + 0.03, 3)} for w, s in zip(toks, st)]})
    print(f'{i:02d} {ln["role"]:2s} {t:6.2f}-{t + dur:6.2f} {"whisper" if len(ws) == len(toks) else "prop"}  {text}', flush=True)
    t += dur + ln.get('gap', 0.4)
total = round(t, 2)
N = int(total * SR) + SR
voice = np.zeros(N)
for c in clips:
    if c['solo']: write(f'{D}/final/{c["role"]}_{c["i"]:02d}.wav', c['y'])
    else:
        k = int(c['start'] * SR); voice[k:k + len(c['y'])] += c['y'][:N - k]
write(f'{D}/final/voice.wav', voice[:int(total * SR)])
json.dump({'total': total, 'lines': [{'start': round(c['start'] + 0.03, 3), 'end': round(c['start'] + c['dur'] - 0.08, 3), 'text': c['text'], 'role': c['role'],
           'words': c['words']} for c in clips]}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
os.remove(f'{D}/final/_clip.wav')
print('total', total)
