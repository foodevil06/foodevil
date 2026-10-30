# one Lumean order per line (each role has its own model/settings): _tmp/vnutri2/lines/NN.mp3
#   python _tmp/vnutri2/tts_lines.py [indices...]   (no indices = all missing lines)
import json, os, sys, types, concurrent.futures as cf
src = open('scripts/lumean.py', encoding='utf-8').read().split('\nap = argparse.ArgumentParser()')[0]
L = types.ModuleType('lumean'); L.__dict__['__file__'] = os.path.abspath('scripts/lumean.py'); exec(src, L.__dict__)
C = json.load(open('_tmp/vnutri2/lines.json', encoding='utf-8'))
want = [int(x) for x in sys.argv[1:]] or [i for i in range(len(C['lines'])) if not os.path.exists(f'_tmp/vnutri2/lines/{i:02d}.mp3')]
# templates first, one by one (the cache file is shared)
for i in want:
    r = C['roles'][C['lines'][i]['role']]
    L.template_for({'voice': '3EuKHIEZbSzrHGNmdYsx', 'model': r['model'], 'stability': r['stability'], 'similarity': 0.8, 'speed': 1.0})
def one(i):
    ln = C['lines'][i]; r = C['roles'][ln['role']]
    tag = ln.get('tag', r.get('tag', ''))
    text = (tag + ' ' if tag else '') + ln['say']
    try:
        tid = L.template_for({'voice': '3EuKHIEZbSzrHGNmdYsx', 'model': r['model'], 'stability': r['stability'], 'similarity': 0.8, 'speed': 1.0})
        oid = L.call('POST', '/orders', {'template_id': tid, 'input_text': text})['data']['id']
        o = L.wait_order(oid, f'line {i}')
        L.fetch_files(o, f'_tmp/vnutri2/lines/{i:02d}.mp3')
        return f'ok {i:02d} {ln["role"]} {text}'
    except SystemExit as e:
        return f'FAIL {i:02d} {str(e)[:200]}'
with cf.ThreadPoolExecutor(4) as ex:
    for msg in ex.map(one, want): print(msg, flush=True)
