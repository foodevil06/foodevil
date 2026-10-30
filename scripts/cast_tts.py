# Several voices in one episode: one Lumean order per line, each role with its own voice, model and settings.
#   python scripts/cast_tts.py <episode_dir> [line indices...]     (no indices = every line not recorded yet)
# <episode_dir>/lines.json: {"roles": {"N": {"voice": "<voice_id>", "model": "eleven_v3", "stability": 0.5, "tag": "[whispers]"}, ...},
#                            "lines": [{"role": "N", "say": "...", "gap": 0.5, "tag"?: "[desperate]", "sub"?: "..."}]}
# eleven_v3 takes audio tags ([whispers], [softly], [tired]...) and does not read them aloud; stability 0 follows them most.
# -> <episode_dir>/lines/NN.mp3, then scripts/cast_assemble.py lays them out.
import json, os, sys, types, concurrent.futures as cf
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'lumean.py'), encoding='utf-8').read().split('\nap = argparse.ArgumentParser()')[0]
L = types.ModuleType('lumean'); L.__dict__['__file__'] = os.path.join(HERE, 'lumean.py'); exec(src, L.__dict__)
D = sys.argv[1]
C = json.load(open(f'{D}/lines.json', encoding='utf-8'))
os.makedirs(f'{D}/lines', exist_ok=True)
NIKOLAY = '3EuKHIEZbSzrHGNmdYsx'
want = [int(x) for x in sys.argv[2:]] or [i for i in range(len(C['lines'])) if not os.path.exists(f'{D}/lines/{i:02d}.mp3')]
cfg = lambda r: {'voice': r.get('voice', NIKOLAY), 'model': r['model'], 'stability': r['stability'], 'similarity': r.get('similarity', 0.8), 'speed': r.get('speed', 1.0)}
for i in want: L.template_for(cfg(C['roles'][C['lines'][i]['role']]))  # templates first, one by one (shared cache file)
def one(i):
    ln = C['lines'][i]; r = C['roles'][ln['role']]
    tag = ln.get('tag', r.get('tag', ''))
    text = (tag + ' ' if tag else '') + ln['say']
    try:
        oid = L.call('POST', '/orders', {'template_id': L.template_for(cfg(r)), 'input_text': text})['data']['id']
        L.fetch_files(L.wait_order(oid, f'line {i}'), f'{D}/lines/{i:02d}.mp3')
        return f'ok {i:02d} {ln["role"]} {text}'
    except SystemExit as e:
        return f'FAIL {i:02d} {str(e)[:200]}'
with cf.ThreadPoolExecutor(4) as ex:
    for msg in ex.map(one, want): print(msg, flush=True)
