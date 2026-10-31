// «Что будет, если не спать 7 дней?» (~95 s, 9:16): a science-pop story with a psychological-horror edge. One hero, one
// room; the toll of the sleepless days is driven by numbers on the same drawing. Facts and their wording:
// docs/sleep-deprivation/research.md; shots and sound: script.md, sound-design.md. One narrator (Nikolay, one take).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './sleep.voice.json';
import {CaseSubs, SafeZones, SAFE, MONT} from '../case/Kit';
import {Grain} from '../case/Hybrid';
import {Hero, Hand, HeroSpec} from '../sleep/Hero';
import {Room, RoomLook, WorldCam, Cam, camAt, drift, ScreenFrame, ReactionTest, ReadAgain, CarCabin, Wheel, Road, Eyelids, SleepHud, Tape, Ladder, Grade, EdgeShadow,
  fadeK, inOut, SC} from '../sleep/Sets';
import {blinkAt, clamp, easeInOut, easeOut, lerp, ramp, spring01, wobble} from '../lib/anim';

export const SLEEP_FPS = 30;
const L = (i: number) => voice.lines[i];
const W = (w: string, from = 0) => voice.lines.slice(from).flatMap((l) => l.words)
  .find((x) => x.w.toLowerCase().replace(/[«»"…:,.?!]/g, '').startsWith(w))!.t;
const cut = (i: number) => L(i).start - 0.1;

// ---------- beats (sleep.cues.json uses the same ones, see _tmp/sleep/make_cues.py) ----------
const S2 = cut(2), S3 = cut(4), S4 = cut(5), S5 = cut(6), S6 = cut(7), S7 = cut(8), S7B = cut(10), S8 = cut(11), S8B = cut(12), S8C = cut(13), S9 = cut(14);
const ROAD = W('шестьдесят', 15) - 0.1;
const SHUT = W('моргаешь', 15) + 0.15;            // eyelids close at the wheel
const HORN = L(16).start - 0.85;                  // 3 s later: the horn, the eyes snap open
const CAR_END = L(16).end + 0.2, S10 = cut(17), S10B = cut(19), S11 = cut(20);
const SLEEP_SHUT = L(19).end + 0.2;               // he finally falls asleep
const MICRO = [[W('засыпает', 9) + 0.1, 0.6], [W('секунду', 9) + 0.12, 0.42], [W('три', 9) + 0.12, 0.5]] as const;  // blackouts: start, length
export const SLEEP_SEC = Math.ceil((voice.total + 0.9) * 10) / 10;
const TONE: Record<number, 'white' | 'yellow' | 'red'> = {1: 'red', 10: 'red', 16: 'red', 21: 'yellow'};

const Cut: React.FC<{t: number; from: number; to: number; children: React.ReactNode}> = ({t, from, to, children}) =>
  t >= from && t < to ? <AbsoluteFill style={{opacity: from <= 0 ? 1 : easeOut((t - from) / 0.1)}}>{children}</AbsoluteFill> : null;
const pulse = (t: number, at: number, k = 6) => (t >= at ? Math.exp(-k * (t - at)) : 0);
const add = (a: Cam, b: Cam): Cam => ({cx: a.cx + b.cx, cy: a.cy + b.cy, z: a.z + b.z, rot: (a.rot ?? 0) + (b.rot ?? 0)});

// the hero's look at each stage (the same face, more worn)
type Toll = Pick<HeroSpec, 'bags' | 'red' | 'pale' | 'messy' | 'slump'> & {lid: number};
const D1: Toll = {lid: 0, bags: 0, red: 0, pale: 0, messy: 0, slump: 0};
const N1: Toll = {lid: 0.28, bags: 0.15, red: 0.1, pale: 0.05, messy: 0.1, slump: 0.1};
const D2: Toll = {lid: 0.3, bags: 0.35, red: 0.2, pale: 0.15, messy: 0.3, slump: 0.2};
const N2: Toll = {lid: 0.5, bags: 0.45, red: 0.3, pale: 0.25, messy: 0.45, slump: 0.3};
const D3: Toll = {lid: 0.22, bags: 0.65, red: 0.5, pale: 0.45, messy: 0.65, slump: 0.4};
const D5: Toll = {lid: 0.4, bags: 0.8, red: 0.6, pale: 0.55, messy: 0.75, slump: 0.45};
const D7: Toll = {lid: 0.18, bags: 1, red: 0.9, pale: 0.7, messy: 1, slump: 0.55};
const blinks = (t: number, t0: number, every = 3.4) => Array.from({length: 40}, (_, i) => Math.round((t0 + 0.8 + i * every + Math.sin(i * 2.1) * 0.7) * SLEEP_FPS));
const lidOf = (base: number, f: number, frames: number[]) => 1 - (1 - base) * blinkAt(f, frames, 7);

const HERO = {x: 560, y: 1070, s: 1.15};
const MS: Cam = {cx: 560, cy: 960, z: 1}, WIDE: Cam = {cx: 560, cy: 1050, z: 0.62}, CU: Cam = {cx: 560, cy: 905, z: 2.0}, EYES: Cam = {cx: 560, cy: 897, z: 4.1};

const room = (o: Partial<RoomLook> & {t: number}): RoomLook => ({wall: '#2b2f40', wallpaper: 0.6, wave: 0, sky: 1, cityLights: 0.4, lamp: 0, screen: 0.8, clock: 3, notes: 0, cans: 0, ...o});
const hour = (h: number) => `${h} Ч`;

export const SleepDeprivation: React.FC<{audio?: boolean; safe?: boolean; cover?: boolean}> = ({audio = false, safe = false, cover = false}) => {
  const frame = useCurrentFrame();
  const f = cover ? 0 : frame;
  const {fps} = useVideoConfig();
  const t = f / fps;
  const breath = Math.sin((t * 2 * Math.PI) / 3.6);
  const bl = blinks(t, 0);

  const hero = (o: Partial<HeroSpec>, toll: Toll) => <Hero id="h" {...HERO} breath={breath} {...toll} {...o} lid={lidOf(o.lid ?? toll.lid, f, bl)} />;

  // ---------- the HUD: hours without sleep ----------
  const hud = (() => {
    if (t < S2) return {label: 'БЕЗ СНА', value: hour(168), day: 'ДЕНЬ 7', tone: 'red' as const, at: 0};
    if (t < S3) return {label: 'БЕЗ СНА', value: hour(Math.round(lerp(0, 8, ramp(t, L(3).start, L(3).end)))), day: 'ДЕНЬ 1', tone: 'plain' as const, at: S2};
    if (t < S4) return {label: 'БЕЗ СНА', value: hour(18), day: 'ДЕНЬ 1', tone: 'plain' as const, at: S3};
    if (t < S5) return {label: 'БЕЗ СНА', value: hour(24), day: 'ДЕНЬ 1', tone: 'gold' as const, at: S4};
    if (t < S6) return {label: 'БЕЗ СНА', value: hour(26), day: 'ДЕНЬ 2', tone: 'gold' as const, at: S5};
    if (t < S7) return {label: 'БЕЗ СНА', value: hour(36), day: 'ДЕНЬ 2', tone: 'gold' as const, at: S6};
    if (t < S8) return {label: 'БЕЗ СНА', value: hour(44), day: 'ДЕНЬ 2', tone: 'gold' as const, at: S7};
    if (t < S9) return {label: 'БЕЗ СНА', value: hour(72), day: 'ДЕНЬ 3', tone: 'red' as const, at: S8};
    if (t < S10) return null;                                           // the car is hypothetical: no counter
    if (t < S11) return {label: 'БЕЗ СНА', value: hour(168), day: 'ДЕНЬ 7', tone: 'red' as const, at: S10};
    return {label: 'СОН', value: hour(8), day: 'ВОССТАНОВЛЕНИЕ', tone: 'gold' as const, at: S11 + 0.6};
  })();
  const blackout = MICRO.reduce((a, [s, d]) => Math.max(a, inOut(t, s, s + d, 0.12)), 0);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {audio && <Audio src={staticFile('sleep/mix.wav')} />}

      {/* 1. HOOK: day 7 first. Red eyes, a shape passes behind him, push into the eyes */}
      <Cut t={t} from={0} to={S2}>
        <WorldCam cam={add(camAt(t, [[0, {...CU, z: 2.0}], [W('глазам', 1) - 0.1, {...CU, z: 2.3}], [W('глазам', 1) + 0.45, EYES]]), drift(t, 0.5))}>
          <Room L={room({t, wall: '#2a2f2f', sky: 2.1, cityLights: 0.05, screen: 1, clock: 7, notes: 9, cans: 10, wave: 0.25})}
            hero={<>
              <EdgeShadow x={lerp(900, 230, ramp(t, W('спойлер', 1) - 0.1, W('спойлер', 1) + 1.1))} y={1000} o={0.75 * inOut(t, W('спойлер', 1) - 0.1, W('спойлер', 1) + 1.1, 0.25)} s={0.9} />
              {hero({mouth: 'flat', pupil: 0.72, lookX: t < W('спойлер', 1) - 0.1 ? 0 : t < W('спойлер', 1) + 1.3 ? lerp(0.9, -0.9, ramp(t, W('спойлер', 1), W('спойлер', 1) + 1.1)) : lerp(-0.9, 0, ramp(t, W('спойлер', 1) + 1.3, W('спойлер', 1) + 1.7)),
                tilt: wobble(t * 6, 2) * 1.2, rim: 1, lid: 0.12}, D7)}
            </>} />
        </WorldCam>
        <Grade color="#9fb0a0" o={0.22} vignette={0.75} />
      </Cut>

      {/* 2. DAY 1, 07:00: fresh, sure of himself. Coffee, series, no bed */}
      <Cut t={t} from={S2} to={S3}>
        <WorldCam cam={add(camAt(t, [[S2, MS], [S3, {...MS, z: 1.06}]]), drift(t, 0.1))}>
          <Room L={room({t, wall: '#3e3a52', sky: 2, cityLights: 0, lamp: 0, screen: 0.45, clock: lerp(7, 7.3, ramp(t, S2, S3)), screenTint: t > W('сериалы', 2) && t < W('никакой', 2) ? ['#ff8f6b', '#8fd1ff', '#c49bff'][Math.floor(t * 6) % 3] : undefined})}
            hero={(() => {
              const up = ramp(t, L(2).start - 0.2, L(2).start + 0.4, easeOut), sip = inOut(t, W('кофе', 2) - 0.1, W('сериалы', 2) + 0.1, 0.25);
              const no = inOut(t, W('никакой', 2) - 0.15, L(2).end + 0.3, 0.2), pump = spring01(f, (W('доволен', 3) - 0.15) * fps, fps, 2.4, 0.4);
              const handR: Hand = {x: lerp(lerp(150, 120, up), 50, sip), y: lerp(lerp(120, 10, up), -48, sip), grip: 'fist', hold: 'mug', rot: 10};
              const handL: Hand | null = no > 0 ? {x: -215 + Math.sin(t * 16) * 12 * no, y: lerp(60, -90, no), grip: 'open', rot: -80} : t > L(3).start ? {x: -205, y: lerp(60, -120, clamp(pump)), grip: 'fist'} : null;
              return hero({mouth: t > L(3).start ? 'grin' : 'smile', lid: sip > 0.6 ? 0.7 : 0, turn: (0.45 + 0.35 * Math.sin(t * 13)) * no, lookX: no, tilt: 4 * Math.sin(t * 13) * no, browUp: t > L(3).start ? 0.4 : 0.2, blush: 0.45, handR, handL}, D1);
            })()} />
        </WorldCam>
        <Grade color="#ffe2bf" o={0.1} vignette={0.32} />
      </Cut>

      {/* 3. NIGHT 1, 01:00: wide; city lights go out; a can; the first yawn */}
      <Cut t={t} from={S3} to={S4}>
        <WorldCam cam={add(camAt(t, [[S3, WIDE], [S4, {...WIDE, z: 0.65}]]), drift(t, 0.15))}>
          <Room L={room({t, wall: '#232638', sky: 1, cityLights: lerp(0.45, 0.12, ramp(t, S3, S4)), lamp: 0.8, screen: 0.85, clock: lerp(0.8, 1.0, ramp(t, S3, S4)), cans: 1})}
            hero={(() => {
              const yawn = inOut(t, W('тормозить', 4) + 0.35, S4 + 0.3, 0.25);
              return hero({mouth: yawn > 0.05 ? 'yawn' : 'flat', mo: yawn, lid: lerp(0.28, 0.9, yawn), tilt: -7 * yawn, nod: -0.2 * yawn,
                handR: {x: 130, y: lerp(20, -10, ramp(t, S3, S3 + 0.5)), grip: 'fist', hold: 'can', rot: 10}}, N1);
            })()} />
        </WorldCam>
        <Grade color="#7380b8" o={0.18} vignette={0.55} />
      </Cut>

      {/* 4. 24 h: the reaction test on the laptop; GO turns green, the press comes late */}
      <Cut t={t} from={S4} to={S5}>
        <ScreenFrame clock="07:02"><ReactionTest t={t} go={W('реакцию', 5) - 0.1} press={W('реакцию', 5) + 1.0} /></ScreenFrame>
        <Grade color="#000" o={0} vignette={0.45} />
      </Cut>

      {/* 5. attention: one line, the fifth time */}
      <Cut t={t} from={S5} to={S6}>
        <ScreenFrame clock="09:40"><ReadAgain t={t} t0={S5} passes={[S5 + 0.2, W('ты', 6) - 0.2, W('строчку', 6) - 0.1, W('пятый', 6) - 0.25, W('пятый', 6) + 0.1]} /></ScreenFrame>
        <Tape k={fadeK(t, W('внимание', 6) - 0.1)} text="ВНИМАНИЕ" y={150 + 260} />
        <Grade color="#000" o={0} vignette={0.45} />
      </Cut>

      {/* 6. 36 h, 19:00: reminders pile up on the laptop; the phone pings, he slams it down */}
      <Cut t={t} from={S6} to={S7}>
        <WorldCam cam={add(add(camAt(t, [[S6, {...MS, cy: 940, z: 1.1}], [S7, {...MS, cy: 940, z: 1.16}]]), drift(t, 0.3)), {cx: 0, cy: 18 * pulse(t, W('бесит', 7) + 0.1, 9), z: 0})}>
          <Room L={room({t, wall: '#2b2f40', sky: 0.6, cityLights: 0.5, lamp: 1, screen: 0.7, clock: 19, cans: 3, notes: lerp(2, 9, ramp(t, W('запоминается', 7), W('хуже', 7) + 0.6))})}
            hero={(() => {
              const mad = ramp(t, W('мелочь', 7), W('бесит', 7)), slam = ramp(t, W('бесит', 7) + 0.05, W('бесит', 7) + 0.2, easeInOut);
              return hero({mouth: mad > 0.5 ? 'grit' : 'frown', brow: lerp(0.4, -1, mad), lookY: lerp(0.5, 0.2, mad), lookX: 0.3,
                handR: {x: lerp(80, 140, slam), y: lerp(-10, 80, slam), grip: 'fist', hold: 'phone', rot: 0}}, D2);
            })()} />
        </WorldCam>
        <Grade color="#8090c0" o={0.14} vignette={0.5} />
      </Cut>

      {/* 7. 44 h, 03:00: microsleep. Close-up, heavy lids; the world goes black for a second, again, again */}
      <Cut t={t} from={S7} to={S7B}>
        <WorldCam cam={add(camAt(t, [[S7, {...CU, z: 1.85}], [S7B, {...CU, z: 2.35}]]), drift(t, 0.45))}>
          <Room L={room({t, wall: '#1d2230', sky: 1, cityLights: 0.08, lamp: 0, screen: 1, clock: 3.2, cans: 5, notes: 9})}
            hero={hero({mouth: 'flat', lid: Math.max(N2.lid + 0.15 * Math.sin(t * 1.3), ...MICRO.map(([s, d]) => inOut(t, s - 0.25, s + d, 0.2))), lookY: 0.45,
              nod: 0.15 + 0.25 * Math.max(...MICRO.map(([s, d]) => inOut(t, s, s + d, 0.2))), rim: 1}, N2)} />
        </WorldCam>
        <Grade color="#7d8fc4" o={0.25} vignette={0.7} />
      </Cut>
      {/* he never noticed: the line he was typing is «аааааа», the clock jumped three seconds */}
      <Cut t={t} from={S7B} to={S8}>
        <ScreenFrame clock={t < S7B + 0.9 ? '03:14:07' : '03:14:10'} tint={0.05}><ReadAgain t={t} t0={S7B - 10} passes={[S7B - 9]} gib={{at: S7B - 1, until: S7B + 0.8}} /></ScreenFrame>
        <Tape k={fadeK(t, W('микросон', 10) - 0.05)} text="МИКРОСОН" red y={150 + 260} />
        <Grade color="#000" o={0} vignette={0.5} />
      </Cut>

      {/* 8. 72 h: perception slips. Wide and grey; then the wallpaper crawls, something at the edge, the clock jumps */}
      <Cut t={t} from={S8} to={S8B}>
        <WorldCam cam={add(camAt(t, [[S8, {...WIDE, z: 0.6}], [S8B, {...WIDE, z: 0.68}]]), drift(t, 0.6))}>
          <Room L={room({t, wall: '#2a3132', sky: 2.05, cityLights: 0, lamp: 0, screen: 0.8, clock: 7, cans: 7, notes: 9, wave: 0.18})}
            hero={hero({mouth: 'flat', lookX: wobble(t * 1.5, 4) * 0.6, nod: 0.2}, D3)} />
        </WorldCam>
        <Grade color="#a6b89c" o={0.24} vignette={0.7} />
      </Cut>
      <Cut t={t} from={S8B} to={S8C}>
        {(() => {
          const edge = W('краем', 12), jump = W('время', 12), look = ramp(t, edge + 0.35, edge + 0.6, easeOut);
          const pan = ramp(t, edge + 0.55, edge + 1.05, easeInOut) * (1 - ramp(t, jump - 0.2, jump + 0.3, easeInOut));
          const clock = t < jump ? 7.05 : t < jump + 0.22 ? 10.6 : t < jump + 0.42 ? 8.25 : t < jump + 0.62 ? 12.9 : 6.4;
          return <>
            <WorldCam cam={add(add(MS, {cx: 170 * pan, cy: -40 * ramp(t, jump - 0.2, jump + 0.3), z: 0.05}), drift(t, 0.6))}>
              <Room L={room({t, wall: '#2a3132', sky: 2.05, cityLights: 0, lamp: 0, screen: 0.8, clock, cans: 7, notes: 9, wave: lerp(0.25, 1, ramp(t, W('шевелится', 12) - 0.3, W('шевелится', 12) + 0.4))})}
                hero={<>
                  <EdgeShadow x={905} y={1230} o={0.85 * inOut(t, edge - 0.1, edge + 0.85, 0.2)} s={1} />
                  {hero({mouth: look > 0.5 ? 'open' : 'flat', mo: 0.2, lookX: lerp(0, 1, look) * (1 - ramp(t, jump - 0.4, jump)) + (t > jump - 0.4 ? -0.4 : 0), lookY: t > jump - 0.4 ? -0.7 : 0,
                    pupil: lerp(1, 0.7, look), browUp: look * 0.8, turn: 0.35 * look}, D3)}
                </>} />
            </WorldCam>
            <Grade color="#a6b89c" o={0.24 + 0.08 * Math.max(0, Math.sin(t * 23))} vignette={0.72} />
          </>;
        })()}
      </Cut>
      <Cut t={t} from={S8C} to={S9}>
        <WorldCam cam={add(camAt(t, [[S8C, {...CU, z: 1.9}], [S9, {...CU, z: 2.2}]]), drift(t, 0.7))}>
          <Room L={room({t, wall: '#262c2c', sky: 2.05, cityLights: 0, lamp: 0, screen: 0.9, clock: 6.4, cans: 7, notes: 9, wave: 0.7})}
            hero={hero({mouth: 'flat', pupil: 0.68, lookX: wobble(t * 3, 9) * 0.8, lid: 0.12, tilt: wobble(t * 7, 3) * 1.5, rim: 1}, D3)} />
        </WorldCam>
        <Ladder k={fadeK(t, L(13).start)} step={t < W('искажения', 13) - 0.05 ? 0 : t < W('галлюцинации', 13) - 0.05 ? 1 : 2} />
        <Grade color="#a6b89c" o={0.28 + 0.1 * Math.max(0, Math.sin(t * 17))} vignette={0.78} />
      </Cut>

      {/* 9. CULMINATION: imagine you are driving. 60 km/h. A blink: 3 s of black is 50 m blind; the horn */}
      <Cut t={t} from={S9} to={ROAD}>
        <CarCabin t={t} dash={0.9}>
          <g transform={`translate(${wobble(t * 9, 1) * 2} ${wobble(t * 11, 2) * 2})`}>
            <Hero id="hc" x={540} y={1000} s={1.0} breath={breath} {...D5} lid={lidOf(D5.lid, f, bl)} mouth="flat" lookY={-0.1} rim={0.6} rimColor="#5fd6d0"
              mid={<Wheel />} handL={{x: -170, y: 230, grip: 'fist'}} handR={{x: 170, y: 230, grip: 'fist'}} />
          </g>
        </CarCabin>
        <Grade color="#000" o={0} vignette={0.55} />
      </Cut>
      <Cut t={t} from={ROAD} to={CAR_END}>
        {(() => {
          const wake = ramp(t, HORN, HORN + 0.08), swerve = ramp(t, HORN + 0.12, HORN + 1.1, easeInOut);
          const lights = t < HORN ? 0 : lerp(0.95, 0, ramp(t, HORN + 0.5, HORN + 1.2));
          return <>
            <Road t={t} speed={1} drift={t < HORN ? 0 : lerp(300, 0, swerve)} lights={lights} tilt={t < HORN ? 0 : lerp(-5, 0, swerve) + 3 * Math.sin(swerve * Math.PI)} />
            <AbsoluteFill style={{background: '#fff', opacity: 0.85 * pulse(t, HORN, 7) * wake}} />
            <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 300, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 92, color: '#e8f4ff',
              opacity: fadeK(t, W('шестьдесят', 15) - 0.1) * (t < SHUT ? 1 : t >= HORN ? 1 : 0), textShadow: '0 0 30px rgba(95,214,208,0.6)'}}>60 КМ/Ч</div>
            <Eyelids close={t < SHUT ? 0 : t < HORN ? ramp(t, SHUT, SHUT + 0.28, easeInOut) : 1 - wake} />
            {/* in the dark: the metres travelled blind */}
            {t >= SHUT + 0.28 && t < HORN && <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 760, textAlign: 'center', fontFamily: MONT, fontWeight: 900}}>
              <div style={{fontSize: 40, letterSpacing: 8, color: '#8b97ab'}}>ВСЛЕПУЮ</div>
              <div style={{fontSize: 190, color: SC.red, lineHeight: 1.05}}>{Math.min(50, Math.round(clamp((t - SHUT - 0.3) / (HORN - SHUT - 0.35)) * 50))} М</div>
            </div>}
          </>;
        })()}
      </Cut>
      {/* black: one breath of silence after the horn */}

      {/* 10. DAY 7: wide, grey, tiny in the room. Then his face: the lids finally close */}
      <Cut t={t} from={S10} to={S10B}>
        <AbsoluteFill style={{filter: 'saturate(0.35)'}}>
          <WorldCam cam={add(camAt(t, [[S10, {cx: 560, cy: 1100, z: 0.5}], [S10B, {cx: 560, cy: 1080, z: 0.56}]]), drift(t, 0.25))}>
            <Room L={room({t, wall: '#2a2a2a', sky: 2.02, cityLights: 0, lamp: 0, screen: 0.9, clock: 7, cans: 10, notes: 9, wave: 0.3})}
              hero={hero({mouth: 'flat', nod: 0.3, lookY: 0.4}, D7)} />
          </WorldCam>
        </AbsoluteFill>
        <Tape k={fadeK(t, L(18).start - 0.1) * (1 - ramp(t, S10B - 0.4, S10B - 0.1))} text="НЕ ПОВТОРЯЙ ЭТО" red y={430} rot={-3} />
        <Grade color="#9a9a9a" o={0.2} vignette={0.82} />
      </Cut>
      <Cut t={t} from={S10B} to={S11}>
        <AbsoluteFill style={{filter: 'saturate(0.45)'}}>
          <WorldCam cam={add(camAt(t, [[S10B, {...CU, z: 2.1}], [SLEEP_SHUT, {...CU, z: 2.5}]]), drift(t, 0.35))}>
            <Room L={room({t, wall: '#262626', sky: 2.02, cityLights: 0, lamp: 0, screen: 0.9, clock: 7, cans: 10, notes: 9, wave: 0.6})}
              hero={hero({mouth: 'flat', lid: lerp(0.3, 1, ramp(t, W('верить', 19), SLEEP_SHUT + 0.4)), pupil: 0.7, nod: lerp(0.1, 0.5, ramp(t, W('верить', 19), SLEEP_SHUT + 0.4)), rim: 1}, D7)} />
          </WorldCam>
        </AbsoluteFill>
        <Grade color="#9a9a9a" o={0.2} vignette={0.85} />
        <Eyelids close={ramp(t, SLEEP_SHUT, SLEEP_SHUT + 0.7, easeInOut)} />
      </Cut>

      {/* 11. after sleep: warm light, asleep on the desk; the same frame as day 1, a different meaning */}
      <Cut t={t} from={S11} to={1e9}>
        <WorldCam cam={add(camAt(t, [[S11, {...MS, cy: 1050, z: 1.0}], [SLEEP_SEC, {...MS, cy: 1040, z: 0.86}]]), drift(t, 0.08))}>
          <Room L={room({t, wall: '#4a3f3c', sky: 2.2, cityLights: 0, lamp: 0, screen: 0, clock: 15, cans: 10, notes: 9, laptop: 'closed'} as RoomLook)}
            hero={<Hero id="hs" {...HERO} breath={Math.sin((t * 2 * Math.PI) / 4.6)} {...D2} lid={1} mouth={t > W('сон', 21) ? 'smile' : 'open'} mo={0.15} rest={1} tilt={6} slump={0.3}
              handL={{x: -150, y: 200, grip: 'open', rot: 90}} handR={{x: 120, y: 214, grip: 'open', rot: 90}} />} />
        </WorldCam>
        <AbsoluteFill style={{background: 'linear-gradient(120deg, rgba(255,214,150,0.35) 0%, rgba(255,214,150,0) 55%)', opacity: fadeK(t, S11, 1.2) * (0.75 + 0.25 * ramp(t, W('сон', 21), SLEEP_SEC))}} />
        <Grade color="#ffd9a8" o={0.1} vignette={0.32} />
        <Tape k={fadeK(t, L(22).end + 0.3)} text="СОН НЕ ПАУЗА" y={430} rot={-2} />
      </Cut>

      {/* microsleep blackouts (the world goes dark for a moment) */}
      {t >= S7 && t < S7B && <AbsoluteFill style={{background: '#000', opacity: blackout}} />}

      {cover && <AbsoluteFill style={{alignItems: 'center', paddingTop: SAFE.top + 70, fontFamily: MONT, fontWeight: 900, textAlign: 'center'}}>
        <div style={{fontSize: 104, lineHeight: 1.02, color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,0.85), 0 0 4px #000', width: SAFE.right - SAFE.left, marginRight: 1080 - 2 * SAFE.cx}}>
          ЧТО БУДЕТ,<br />ЕСЛИ НЕ СПАТЬ<br /><span style={{color: SC.red}}>7 ДНЕЙ?</span></div>
      </AbsoluteFill>}
      <Grain f={f} k={0.05} />
      {!cover && hud && <SleepHud label={hud.label} value={hud.value} day={hud.day} tone={hud.tone} flash={pulse(t, hud.at, 5)} />}
      {!cover && t < L(22).end + 0.4 && <CaseSubs lines={voice.lines} f={f} fps={fps} total={voice.total} tone={(i) => TONE[i] ?? 'white'} />}
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
