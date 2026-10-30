# Draft word timings without a voice: lines.json -> voice.json with estimated times (about 2.6 words per second,
# longer words take longer). Lets you build and check the picture while the real voice is not ready yet;
# after tts.py or align.py the real voice.json replaces it and every beat moves by itself.
#
#   python scripts/draft_timing.py <lines.json> <voice.json> [--wps 2.6]
import json, re, sys

src, dst = sys.argv[1], sys.argv[2]
wps = float(sys.argv[sys.argv.index('--wps') + 1]) if '--wps' in sys.argv else 2.6
cfg = json.load(open(src, encoding='utf-8'))
t = cfg.get('lead', 0.4)
out = []
for i, ln in enumerate(cfg['lines']):
    text = ln.get('sub') or ln['say']
    words = text.split()
    # each word: a base share plus a share by its length; punctuation adds a small pause
    per = [0.55 + 0.45 * len(re.sub(r'\W', '', w)) / 6 for w in words]
    k = len(words) / wps / sum(per)
    start, ws = t, []
    for w, p in zip(words, per):
        ws.append({'w': w, 't': round(t, 3)})
        t += p * k + (0.12 if re.search(r'[,.:?!»]$', w) else 0)
    out.append({'i': i, 'text': text, 'start': round(start, 3), 'end': round(t, 3), 'words': ws})
    t += ln.get('gap', 0.3)
json.dump({'voice': 'draft', 'total': round(t + cfg.get('tail', 1.2), 3), 'lines': out}, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('draft timing', round(t + cfg.get('tail', 1.2), 2), 's ->', dst)
