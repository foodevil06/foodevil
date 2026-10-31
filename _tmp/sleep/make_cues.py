# writes src/toon/episodes/sleep.cues.json for «Что будет, если не спать 7 дней?» (mirrors SleepDeprivation.tsx).
# Sound plan: docs/sleep-deprivation/sound-design.md. The horn uses "pan" (outside the fx ceiling): its gain is final.
import json, math
V = json.load(open('src/toon/episodes/sleep.voice.json', encoding='utf-8')); Ls = V['lines']
def W(w, frm=0):
    for ln in Ls[frm:]:
        for x in ln['words']:
            if x['w'].lower().strip('«»"…:,.?!').startswith(w): return x['t']
    raise SystemExit('no word ' + w)
def rel(t):
    k = max([i for i, l in enumerate(Ls) if l['start'] <= t + 1e-6] or [0]); d = round(t - Ls[k]['start'], 3)
    return f"line:{k}{'+' if d >= 0 else '-'}{abs(d)}"
L = lambda i: Ls[i]; cut = lambda i: Ls[i]['start'] - 0.1
S2, S3, S4, S5, S6, S7, S7B, S8, S8B, S8C, S9 = [cut(i) for i in (2, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14)]
SHUT = W('моргаешь', 15) + 0.15; HORN = L(16)['start'] - 0.85; CAR_END = L(16)['end'] + 0.2; S10, S10B, S11 = cut(17), cut(19), cut(20)
SLEEP_SHUT = L(19)['end'] + 0.2
MICRO = [(W('засыпает', 9) + 0.1, 0.6), (W('секунду', 9) + 0.12, 0.42), (W('три', 9) + 0.12, 0.5)]
TOTAL = math.ceil((V['total'] + 0.9) * 10) / 10
S = lambda f: f'public/sfx/{f}.opus'
ev = []
def smp(file, t, gain, **k): ev.append({'type': 'sample', 'file': S(file), 't': rel(t), 'gain': gain, **k})
def tick(t, g=0.06, f1=2100, f2=3300, decay=0.012): ev.append({'type': 'tick', 't': rel(t), 'gain': g, 'f1': f1, 'f2': f2, 'decay': decay})
def thump(t, g, f0=70, f1=38, decay=0.2): ev.append({'type': 'thump', 't': rel(t), 'gain': g, 'f0': f0, 'f1': f1, 'decay': decay})
def notes(t, ns, g=0.05, step=0.09): ev.append({'type': 'notes', 't': rel(t), 'gain': g, 'notes': ns, 'step': step, 'decay': 0.2})
def glide(t, f0, f1, d, g): ev.append({'type': 'glide', 't': rel(t), 'gain': g, 'f0': f0, 'f1': f1, 'dur': d})

# 1. hook: the wall clock ticks; a shape passes behind him (a low whoosh); push into the eyes (a soft low hit)
for k in range(7): smp('k2_tick', 0.15 + k * 1.0, 0.26, dur=0.3, fade=0.1)
smp('whoosh', W('спойлер', 1) - 0.05, 0.16, dur=0.9, fade=0.4)
thump(W('глазам', 1) - 0.05, 0.22, 60, 36, 0.3)
# 2. day 1: a bright little chime on the decision; 3. night: the can, the yawn
notes(S2 + 0.05, [523.3, 659.3, 784.0], 0.045)
smp('sl_can_open', S3 + 0.35, 0.48)
smp('sl_yawn', W('тормозить', 4) + 0.43, 0.33, dur=1.25, fade=0.4)  # in the pause after the word
# 4. reaction test: the GO beep, the late press and a low error buzz
notes(W('реакцию', 5) - 0.1, [880.0], 0.06)
tick(W('реакцию', 5) + 1.0, 0.09, 1500, 2400, 0.02); glide(W('реакцию', 5) + 1.02, 190, 140, 0.4, 0.05)
# 5. attention: a soft tick on every pass over the same line
for p in (S5 + 0.2, W('ты', 6) - 0.2, W('строчку', 6) - 0.1, W('пятый', 6) - 0.25, W('пятый', 6) + 0.1): tick(p, 0.05)
smp('typing', S5 + 0.1, 0.35, dur=1.4, fade=0.4)
# 6. reminders (paper), two pings, the phone slammed on the desk
smp('paper', W('запоминается', 7), 0.5, dur=0.5, fade=0.2)
smp('ping', W('мелочь', 7) - 0.4, 0.3); smp('ping', W('бесит', 7) - 0.45, 0.32)
smp('v2_phone_wood', W('бесит', 7) + 0.15, 0.4); thump(W('бесит', 7) + 0.15, 0.12, 80, 50, 0.12)
# 7. microsleep: a slow breath; during the third blackout the keys are mashed; «микросон» lands low
smp('v_breath', S7 + 0.3, 0.42)
smp('h_keys', MICRO[2][0] + 0.05, 0.27, dur=0.9, fade=0.2)
thump(W('микросон', 10), 0.18, 55, 32, 0.35)
# 8. perception: the pattern crawls (glitch), a shape at the edge (whoosh), the clock jumps (ticks), the light flickers
smp('h_glitch', W('шевелится', 12) - 0.1, 0.08, dur=0.6, fade=0.2)
smp('whoosh', W('краем', 12) - 0.1, 0.15, dur=0.8, fade=0.3)
for k, dt in enumerate((0.0, 0.22, 0.42, 0.62)): smp('k2_tick', W('время', 12) + dt, 0.5, dur=0.25, fade=0.08)
smp('v3_flicker', S8C + 0.1, 0.35, dur=2.0, fade=0.6); smp('v3_heartbeat', S8C + 1.2, 0.45)
# 9. the car: engine (bed below), the eyes shut: two muffled heartbeats in the dark, a swell into the horn, the car passing
smp('v3_heartbeat', SHUT + 0.8, 0.55); smp('v3_heartbeat', SHUT + 2.0, 0.6)
smp('kv_rev_swell', HORN - 1.4, 0.25)
smp('sl_horn', HORN, 0.11, pan=0, dur=0.8, fade=0.25)  # ends before the next line
smp('sl_pass', HORN + 0.3, 0.045, pan=-0.4, dur=0.9, fade=0.4)
# 10. day 7: almost nothing; a slow heartbeat on the close-up; the long exhale when he finally falls asleep
smp('v3_heartbeat', S10B + 0.9, 0.4); smp('v3_heartbeat', S10B + 2.3, 0.4)
smp('v2_breath_out', SLEEP_SHUT + 0.1, 0.5)
# 11. after sleep: birds (bed), a soft clock, the last chime under «СОН НЕ ПАУЗА»
for k in range(10): smp('k2_tick', S11 + 0.8 + k * 1.2, 0.1, dur=0.25, fade=0.08)
notes(L(22)['end'] + 0.3, [392.0, 523.3, 659.3], 0.05, 0.12)

# beds: room tone with holes for the microsleep blackouts and for the silences; the car; the birds
room = [(0.0, S9)]
for s, d in MICRO:
    a, b = room[-1]; room[-1] = (a, s); room.append((s + d, b))
pieces = [(a, b, 'v_room_bed', 0.28) for a, b in room]
pieces += [(S9, SHUT, 'sl_car_hum', 0.5), (SHUT, HORN, 'sl_car_hum', 0.16), (HORN, CAR_END, 'sl_car_hum', 0.5),
           (S10, SLEEP_SHUT, 'v_room_bed', 0.18), (S11 + 0.3, TOTAL, 'sl_birds', 0.55)]
music = [{'file': S(fn), 'gain': g, 't0': rel(a), 't1': rel(b) if b < TOTAL else 'end', 'from': round(a % 6, 2), 'loop': True, 'fade': 0.15} for a, b, fn, g in pieces]
# tonal pads per act: calm warm, tension, unstable, near silence at the wheel, resolution
pads = [
    {'t0': rel(0.0), 't1': rel(S2), 'notes': [55.0, 58.27, 82.41], 'gain': 0.035, 'attack': 0.3, 'release': 0.15},
    {'t0': rel(S2), 't1': rel(S4), 'notes': [130.81, 164.81, 196.0, 246.94], 'gain': 0.03, 'attack': 1.2, 'release': 0.6},
    {'t0': rel(S4), 't1': rel(S8), 'notes': [110.0, 130.81, 164.81], 'gain': 0.035, 'attack': 1.0, 'release': 0.6},
    {'t0': rel(S8), 't1': rel(S9), 'notes': [110.0, 116.54, 155.56], 'gain': 0.04, 'attack': 1.0, 'release': 0.4},
    {'t0': rel(S9), 't1': rel(SHUT), 'notes': [55.0, 82.41], 'gain': 0.03, 'attack': 0.8, 'release': 0.2},
    {'t0': rel(S10), 't1': rel(SLEEP_SHUT), 'notes': [55.0, 61.74], 'gain': 0.03, 'attack': 1.5, 'release': 0.5},
    {'t0': rel(S11 + 0.5), 't1': 'end', 'notes': [130.81, 196.0, 261.63, 329.63, 392.0], 'gain': 0.04, 'attack': 2.5, 'release': 1.5},
]
C = {'total': TOTAL, 'pads': pads, 'events': ev, 'music': music, 'duck': {'db': 5, 'music_db': 4, 'smooth': 0.12, 'fx_db': 9, 'fx_gap': 5}}
json.dump(C, open('src/toon/episodes/sleep.cues.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('total', TOTAL, 'events', len(ev), 'beds', len(music))
