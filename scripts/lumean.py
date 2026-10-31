# Lumean (lumean.app) — voices (ElevenLabs / Cartesia / Fish Audio / HeyGen), sound effects and music through one key.
# Key: LUMEAN_API_KEY in the environment or in .env of the studio (never in code or chat).
#
#   python scripts/lumean.py check                                   -> is the key alive, what can it do, balance
#   python scripts/lumean.py voices <out_dir> [--search низкий] [--gender male] [--age middle_aged] [--n 8]
#        ElevenLabs library voices that speak Russian: list + preview mp3 files to listen to
#   python scripts/lumean.py tts <lines.json> <out_dir>              -> out_dir/voice.wav + voice.json (same format as tts.py)
#        lines.json: {"engine": "lumean", "voice": "<voice_id>", "model": "eleven_multilingual_v2",
#                     "stability": 0.45, "similarity": 0.8, "speed": 0.95, "lines": [{"say", "gap"}]}
#        word timings come from scripts/align.py (Whisper) on the finished audio, so subtitles follow the script.
#   python scripts/lumean.py sfx "<english prompt>" <out.mp3> [--dur 2] [--influence 0.5] [--loop]
#   python scripts/lumean.py music "<prompt>" <out.mp3> [--sec 30] [--variants 1]
#        a music order is at most 30 s; longer beds: several orders, crossfaded by sfx.py "music" pieces.
import argparse, json, os, subprocess, sys, time, urllib.error, urllib.request

BASE = 'https://api.lumean.app/api/public'
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(os.getcwd(), '.lumean.json')  # template ids per voice, so we do not create one per run


def key():
    k = (os.environ.get('LUMEAN_API_KEY') or '').strip()
    # .env in the current folder or in the project root; utf-8-sig: Windows Notepad may save a BOM before the first line
    for env in ('.env', os.path.join(HERE, '..', '.env'), '.env.txt', os.path.join(HERE, '..', '.env.txt')):
        if k: break
        if os.path.exists(env):
            for ln in open(env, encoding='utf-8-sig', errors='ignore'):
                ln = ln.strip().lstrip('\ufeff')
                if ln.replace(' ', '').startswith('LUMEAN_API_KEY='): k = ln.split('=', 1)[1].strip().strip('"\'')
    if not k: sys.exit('LUMEAN_API_KEY not found: add it to the environment (or .env as LUMEAN_API_KEY=...)')
    return k


def call(method, path, body=None, raw_url=None):
    url = raw_url or BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={'X-API-KEY': key(), 'Accept': 'application/json',
                                                                          **({'Content-Type': 'application/json'} if data else {})})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            txt = e.read().decode(errors='ignore')
            try: j = json.loads(txt)
            except ValueError: j = {'message': txt[:300]}
            if e.code == 429 and e.headers.get('Retry-After'):
                time.sleep(min(60, int(e.headers['Retry-After']))); continue
            sys.exit(f'{method} {path}: HTTP {e.code} {j.get("reason") or ""} {j.get("message") or ""}\n{json.dumps(j.get("errors") or {}, ensure_ascii=False)[:600]}')
        except urllib.error.URLError as e:
            if attempt == 3: sys.exit(f'{method} {path}: {e}')
            time.sleep(2 ** attempt)


def download(url, out):
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with urllib.request.urlopen(url, timeout=300) as r, open(out, 'wb') as f: f.write(r.read())


def wait_order(oid, label):
    t0 = time.time()
    while True:
        o = call('GET', f'/orders/{oid}')['data']
        st = o['status']
        if st in ('completed', 'result_delivered'): return o
        if st in ('failed', 'cancelled', 'compensated'): sys.exit(f'{label}: order {oid} {st}: {(o.get("result") or {}).get("user_message")}')
        if st == 'partially_completed':  # some chunks failed: retry them once (billed only for those chunks)
            call('POST', f'/orders/{oid}/items/retry-failed', {})
        if time.time() - t0 > 900: sys.exit(f'{label}: order {oid} still {st} after 15 min')
        time.sleep(3)


def fetch_files(o, out_main, extra_dir=None):
    files = (o.get('result') or {}).get('files') or []
    if not files: sys.exit('order has no files')
    outs = []
    for i, p in enumerate(files):
        url = call('POST', '/storage/url', {'path': p, 'download': True})['data']['url']
        dst = out_main if len(files) == 1 else out_main.replace('.mp3', f'_{i + 1}.mp3')
        download(url, dst); outs.append(dst)
    for p in (o.get('result') or {}).get('service_files') or []:
        if extra_dir:
            url = call('POST', '/storage/url', {'path': p, 'download': True})['data']['url']
            download(url, os.path.join(extra_dir, os.path.basename(p)))
    return outs


def cmd_check(a):
    k = call('GET', '/key')['data']
    print('key ok:', k.get('name'), '| permissions:', ', '.join(k.get('permissions') or []))
    try:
        for u in call('GET', '/usage').get('data') or []:
            name = u.get('service_name') or u.get('service') or u.get('service_code') or u.get('service_key')
            left = u.get('remaining', u.get('tokens_remaining'))
            kind = {'hourly': 'в час', 'concurrent': 'одновременно', 'daily': 'в день', 'monthly': 'в месяц'}.get(u.get('limit_type'), u.get('limit_type') or '')
            print(f"  {name}: свободно {left} из {u.get('limit_value', '?')} {kind}".rstrip())
    except SystemExit as e: print('usage: n/a', str(e)[:120])


def cmd_voices(a):
    q = {'required_languages': 'ru', 'page_size': a.n, 'page': 0}
    for k in ('search', 'gender', 'age'):
        if getattr(a, k): q[k] = getattr(a, k)
    qs = '&'.join(f'{k}={urllib.request.quote(str(v))}' for k, v in q.items())
    vs = call('GET', f'/voices/elevenlabs/library?{qs}')['data']['voices']
    os.makedirs(a.out, exist_ok=True)
    rows = []
    for i, v in enumerate(vs):
        name = (v.get('name') or 'voice').replace('/', '-')
        line = f"{i + 1}. {name} | {v.get('gender')} {v.get('age')} {v.get('accent') or ''} | {(v.get('description') or '')[:70]} | voice_id={v['voice_id']}"
        print(line); rows.append(line)
        if v.get('preview_url'):
            try: download(v['preview_url'], os.path.join(a.out, f'{i + 1:02d}_{name}.mp3'))
            except Exception as e: print('   preview failed:', e)
    open(os.path.join(a.out, 'голоса.txt'), 'w', encoding='utf-8').write('\n'.join(rows) + '\n')


def template_for(cfg):
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    sig = json.dumps([cfg['voice'], cfg.get('model', 'eleven_multilingual_v2'), cfg.get('stability', 0.45), cfg.get('similarity', 0.8), cfg.get('speed', 1.0)])
    if sig in cache: return cache[sig]
    body = {'service_key': cfg.get('service', 'elevenlabs'), 'name': f'toon {cfg["voice"][:8]}', 'config': {'tts_settings': {
        'mode': 'mode_v1', 'model_id': cfg.get('model', 'eleven_multilingual_v2'), 'voice_id': cfg['voice'], 'advanced_voice_settings': True,
        'prev_next_text': True, 'voice_settings': {'stability': cfg.get('stability', 0.45), 'similarity_boost': cfg.get('similarity', 0.8),
                                                   'use_speaker_boost': True, 'speed': cfg.get('speed', 1.0)}}}}
    tid = call('POST', '/templates', body)['data']['id']
    cache[sig] = tid; json.dump(cache, open(CACHE, 'w'), indent=1)
    return tid


def cmd_tts(a):
    cfg = json.load(open(a.lines, encoding='utf-8'))
    # one order for the whole episode: lines joined with free {{pause}} marks, so the voice keeps one intonation
    text = ''.join(ln['say'] + (f' {{{{pause={ln.get("gap", 0.3):.2f}}}}} ' if i < len(cfg['lines']) - 1 else '')
                   for i, ln in enumerate(cfg['lines']))
    tid = template_for(cfg)
    oid = call('POST', '/orders', {'template_id': tid, 'input_text': text})['data']['id']
    print('order', oid, '…')
    o = wait_order(oid, 'tts')
    os.makedirs(a.out, exist_ok=True)
    raw = fetch_files(o, os.path.join(a.out, 'lumean_raw.mp3'), extra_dir=os.path.join(a.out, 'lumean_service'))[0]
    # word timings + voice.wav (48 kHz, lead/tail like tts.py) from our own aligner, following the script
    r = subprocess.run([sys.executable, os.path.join(HERE, 'align.py'), raw, a.out, '--lines', a.lines, '--lead', str(cfg.get('lead', 0.4)),
                        '--tail', str(cfg.get('tail', 1.2))])
    if r.returncode: sys.exit('align failed')


def cmd_sfx(a):
    td = {'text': a.prompt, 'prompt_influence': a.influence, 'loop': a.loop, 'output_format': 'mp3_44100_192'}
    if a.dur: td['duration_seconds'] = a.dur
    o = wait_order(call('POST', '/orders', {'task_type': 'sfx', 'task_data': td})['data']['id'], 'sfx')
    print('ok', fetch_files(o, a.out))


def cmd_music(a):
    td = {'prompt': a.prompt, 'force_instrumental': True, 'music_length_ms': int(a.sec * 1000), 'n_variants': a.variants}
    o = wait_order(call('POST', '/orders', {'task_type': 'music', 'task_data': td})['data']['id'], 'music')
    print('ok', fetch_files(o, a.out))


ap = argparse.ArgumentParser()
sp = ap.add_subparsers(dest='cmd', required=True)
sp.add_parser('check').set_defaults(fn=cmd_check)
v = sp.add_parser('voices'); v.add_argument('out'); v.add_argument('--search'); v.add_argument('--gender'); v.add_argument('--age'); v.add_argument('--n', type=int, default=8); v.set_defaults(fn=cmd_voices)
t = sp.add_parser('tts'); t.add_argument('lines'); t.add_argument('out'); t.set_defaults(fn=cmd_tts)
s = sp.add_parser('sfx'); s.add_argument('prompt'); s.add_argument('out'); s.add_argument('--dur', type=float); s.add_argument('--influence', type=float, default=0.5); s.add_argument('--loop', action='store_true'); s.set_defaults(fn=cmd_sfx)
m = sp.add_parser('music'); m.add_argument('prompt'); m.add_argument('out'); m.add_argument('--sec', type=float, default=30); m.add_argument('--variants', type=int, default=1); m.set_defaults(fn=cmd_music)
a = ap.parse_args()
a.fn(a)
