# Frame-by-frame breakdown of a reference video (a competitor's Short or long video).
#   py -3.12 scripts/rival_frames.py <video.mp4> <out_dir> [--every 2] [--scene 0.3] [--from 0 --to 0]
# Writes into out_dir:
#   cuts.txt      every cut (scene change) with its time, plus shot lengths: how often the picture changes
#   sheet.jpg     a contact sheet: one frame every N seconds, the time under each frame
#   hook.jpg      the first 3 seconds, 6 frames per second (what the viewer sees before deciding to scroll)
#   speech.txt    if <video>.ru.vtt is next to the video: words per second, pauses, the first lines of the text
#   summary.json  the numbers above, for the report
# Needs ffmpeg and ffprobe in PATH.
import argparse, json, os, re, subprocess, sys

def run(args):
    r = subprocess.run(args, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0:
        print('ffmpeg failed:', r.stderr[-400:], file=sys.stderr)
    return r

def duration(path):
    r = run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path])
    return float(r.stdout.strip())

def cuts(path, thr, t0, t1):
    rng = ['-ss', str(t0)] + (['-to', str(t1)] if t1 else [])
    r = run(['ffmpeg', '-hide_banner', *rng, '-i', path, '-vf', f"scale=270:-2,select='gt(scene,{thr})',showinfo", '-an', '-f', 'null', '-'])
    return [round(float(m) + t0, 2) for m in re.findall(r'pts_time:([\d.]+)', r.stderr)]

def vtt_words(vtt):
    # YouTube auto-subs: lines with <00:00:01.234><c> word</c> timings; take each word once with its time
    words, seen = [], set()
    txt = open(vtt, encoding='utf-8').read()
    for block in txt.split('\n\n'):
        m = re.match(r'(\d+):(\d+):([\d.]+) -->', block.strip())
        if not m or '<c>' not in block:
            continue
        start = int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])
        line = [l for l in block.split('\n') if '<c>' in l][0]
        first = re.match(r'^([^<]+)<', line)
        items = ([(start, first[1].strip())] if first and first[1].strip() else []) + \
            [(int(h) * 3600 + int(mi) * 60 + float(s), w.strip()) for h, mi, s, w in re.findall(r'<(\d+):(\d+):([\d.]+)><c>([^<]+)</c>', line)]
        for t, w in items:
            k = (round(t, 2), w)
            if k not in seen and w:
                seen.add(k); words.append((t, w))
    return sorted(words)

# Windows ffmpeg builds have no fontconfig: give drawtext a font file
FONT = r"fontfile='C\:/Windows/Fonts/arial.ttf':" if os.name == 'nt' else ''

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video'); ap.add_argument('out')
    ap.add_argument('--every', type=float, default=2); ap.add_argument('--scene', type=float, default=0.3)
    ap.add_argument('--from', dest='t0', type=float, default=0); ap.add_argument('--to', dest='t1', type=float, default=0)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    dur = duration(a.video)
    t1 = a.t1 or dur
    span = t1 - a.t0

    c = cuts(a.video, a.scene, a.t0, a.t1)
    edges = [a.t0] + c + [t1]
    shots = [round(edges[i + 1] - edges[i], 2) for i in range(len(edges) - 1)]
    with open(os.path.join(a.out, 'cuts.txt'), 'w', encoding='utf-8') as f:
        f.write(f'duration {dur:.1f} s, analysed {a.t0:.0f}..{t1:.0f} s, scene threshold {a.scene}\n')
        f.write(f'cuts {len(c)}, one every {span / max(1, len(c)):.1f} s\n')
        for i, s in enumerate(shots):
            f.write(f'shot {i + 1:3d}  {edges[i]:7.2f} s  {s:5.2f} s\n')

    n = int(span // a.every) + 1
    cols = 6 if n > 12 else 4
    rows = -(-n // cols)
    vf = (f"fps=1/{a.every},scale=300:-2,drawtext={FONT}text='%{{pts\\:hms}}':x=6:y=h-30:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6,"
          f"tile={cols}x{rows}:padding=4:margin=4:color=0x202020")
    run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a.t0), '-t', str(span), '-i', a.video, '-vf', vf, '-frames:v', '1', '-q:v', '3', os.path.join(a.out, 'sheet.jpg')])
    run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a.t0), '-t', '3', '-i', a.video, '-vf',
         f"fps=6,scale=270:-2,drawtext={FONT}text='%{{pts\\:hms}}':x=6:y=h-28:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x3:padding=4:margin=4:color=0x202020",
         '-frames:v', '1', '-q:v', '3', os.path.join(a.out, 'hook.jpg')])

    summary = {'video': os.path.basename(a.video), 'duration': round(dur, 1), 'analysed': [a.t0, round(t1, 1)], 'cuts': len(c),
               'sec_per_shot': round(span / max(1, len(c)), 2), 'shots_over_5s': sum(1 for s in shots if s > 5),
               'first_cut': c[0] if c else None}
    vtt = os.path.splitext(a.video)[0] + '.ru.vtt'
    if os.path.exists(vtt):
        w = [x for x in vtt_words(vtt) if a.t0 <= x[0] <= t1]
        if w:
            gaps = [(round(w[i][0], 1), round(w[i + 1][0] - w[i][0], 2)) for i in range(len(w) - 1) if w[i + 1][0] - w[i][0] > 1.2]
            talk = w[-1][0] - w[0][0]
            first3 = ' '.join(x[1] for x in w if x[0] < a.t0 + 3)
            first10 = ' '.join(x[1] for x in w if x[0] < a.t0 + 10)
            summary.update({'words': len(w), 'words_per_sec': round(len(w) / max(1, talk), 2), 'first_word_at': round(w[0][0], 2),
                            'pauses_over_1_2s': len(gaps), 'first_3s': first3, 'first_10s': first10})
            with open(os.path.join(a.out, 'speech.txt'), 'w', encoding='utf-8') as f:
                f.write(f"words {len(w)}, {summary['words_per_sec']} per second, first word at {w[0][0]:.2f} s\n")
                f.write(f'pauses over 1.2 s: {gaps}\n\n')
                line, t_line = [], w[0][0]
                for t, x in w:
                    if t - t_line > 5 and line:
                        f.write(f'{t_line:6.1f}  {" ".join(line)}\n'); line, t_line = [], t
                    line.append(x)
                if line:
                    f.write(f'{t_line:6.1f}  {" ".join(line)}\n')
    with open(os.path.join(a.out, 'summary.json'), 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=1)
    print(json.dumps(summary, ensure_ascii=False))

if __name__ == '__main__':
    sys.exit(main())
