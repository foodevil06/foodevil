# Insert short mascot lines («Нитка») into a narrated episode: the narrator's voice is pulled apart after the chosen
# lines, each mascot line plays in the gap, and every timing is shifted, so scenes, subtitles and sound cues (all keyed
# to words and lines) follow by themselves.
#
#   python scripts/insert_mascot.py <narrator.wav> <narrator.json> <out_dir> <out_voice.json> <out_mascot.json> \
#          --seg seg0.wav:seg0.json:3 --seg seg1.wav:seg1.json:13 ... [--enter 0.5] [--exit 0.55]
#   seg = mascot line audio : its voice.json (one line; both from align.py, so word times match) : narrator line it follows
#   -> out_dir/voice.wav  (narrator + mascot, for the mix and ducking)
#   -> out_dir/mascot.wav (mascot only, for scripts/mouth.py)
#   -> out_voice.json     (narrator lines, shifted)      -> out_mascot.json (mascot lines on the same timeline)
import argparse, copy, json, subprocess, wave
import numpy as np

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument('narr_wav'); ap.add_argument('narr_json'); ap.add_argument('out_dir'); ap.add_argument('out_voice'); ap.add_argument('out_mascot')
ap.add_argument('--seg', action='append', required=True); ap.add_argument('--enter', type=float, default=0.5); ap.add_argument('--exit', type=float, default=0.55)
a = ap.parse_args()


def load(p):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).astype(np.float64)


V = json.load(open(a.narr_json, encoding='utf-8'))
narr = load(a.narr_wav)
segs = []
for s in a.seg:
    wav, js, after = s.split(':')
    j = json.load(open(js, encoding='utf-8'))
    segs.append({'audio': load(wav), 'line': j['lines'][0], 'after': int(after)})
segs.sort(key=lambda g: g['after'])

# cut points in the narrator timeline: halfway into the pause after the chosen line (or just after the last line)
for g in segs:
    i = g['after']; ln = V['lines'][i]
    nxt = V['lines'][i + 1]['start'] if i + 1 < len(V['lines']) else None
    g['cut'] = (ln['end'] + nxt) / 2 if nxt is not None else ln['end'] + 0.3
    g['dur'] = len(g['audio']) / SR
    g['gap'] = a.enter + g['dur'] + a.exit

shift = lambda t: t + sum(g['gap'] for g in segs if g['cut'] <= t)
out = copy.deepcopy(V)
for ln in out['lines']:
    ln['start'] = round(shift(ln['start']), 3); ln['end'] = round(shift(ln['end']), 3)
    for w in ln['words']: w['t'] = round(shift(w['t']), 3)
out['total'] = round(V['total'] + sum(g['gap'] for g in segs), 3)

N = int(out['total'] * SR) + 1
voice, mascot = np.zeros(N), np.zeros(N)
src, dst = 0, 0
mlines = []
for g in segs:  # copy narrator audio up to the cut, then leave the gap
    c = int(g['cut'] * SR); n = c - src
    voice[dst:dst + n] = narr[src:c]; src, dst = c, dst + n
    m0 = dst / SR + a.enter
    k = int(m0 * SR); mascot[k:k + len(g['audio'])] = g['audio'][:N - k]
    ln = copy.deepcopy(g['line'])
    ln['start'] = round(m0 + (ln['words'][0]['t'] if ln['words'] else 0), 3); ln['end'] = round(m0 + g['dur'], 3)
    for w in ln['words']: w['t'] = round(m0 + w['t'], 3)
    ln['after'] = g['after']
    mlines.append(ln)
    dst += int(g['gap'] * SR)
rest = narr[src:]
voice[dst:dst + len(rest)] = rest[:N - dst]


def write(p, x):
    with wave.open(p, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


write(f'{a.out_dir}/voice.wav', voice + mascot)
write(f'{a.out_dir}/mascot.wav', mascot)
json.dump(out, open(a.out_voice, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump({'total': out['total'], 'enter': a.enter, 'exit': a.exit, 'lines': mlines}, open(a.out_mascot, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for ln in mlines: print(f"mascot {ln['start']:6.2f}-{ln['end']:6.2f}  {ln['text']}")
print('ok total', V['total'], '->', out['total'])
