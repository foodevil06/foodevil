// The Shorts kit on hero A (docs/strategy/НАБОР_SHORTS.md). One Short = a set + hero A with an emotion and a pose +
// screen overlays timed to the voice. Everything here is built once; an episode only picks presets and times.
//   HeroA       hero A with emotion/pose presets, automatic blinking and breathing, and three looks: normal,
//               shadow (hero B as a mode: horror moments) and x-ray (hero C as a mode: "inside" moments, or split by a scan line)
//   Bedroom, Landing, Kitchen (+ Hallway in StyleKit)  night sets in world coordinates 1080x1920, filmed by WorldCam
//   ThreadProgress  the red thread with pins at the top: rules 1..N or time steps (0 Ч, 1 Ч, СУТКИ); the channel sign
//   TopChip, Clock, Bubble, Mark, FactTag, RuleCard  pop-up overlays (screen space, inside the TikTok safe zone)
//   EndCard     the closing card: question, the list of rules, "write the number", what comes next
//   CoverA      the 1080x1920 cover in the same look
// Overlays read the frame themselves (useCurrentFrame), so an episode passes only times in seconds.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Hero, HeroSpec, Hand} from '../sleep/Hero';
import {clamp, easeOut, lerp, mulberry32, spring01, wobble} from '../lib/anim';
import {MONO, MONT, SAFE} from '../case/Kit';
import {PAL, Silhouette, XRayBody} from './StyleKit';

// ---------- hero A: the channel look ----------
// slate hoodie (the rival's hero wears a navy jacket, so we stay off pure blue) and red drawstrings: the red thread is on the hero himself
// `string` is the light stripe along the sleeves: here it equals the hoodie colour, so there is no stripe
export const HERO_A = {hood: '#3b4656', hoodShade: '#2a3340', hoodDark: '#1c232d', string: '#3b4656', cord: PAL.thread};
export const HERO_A_NAVY = {hood: '#2c3e5c', hoodShade: '#1f2d44', hoodDark: '#16202f', string: '#2c3e5c', cord: PAL.thread};

type Face = Pick<HeroSpec, 'lid' | 'lidR' | 'brow' | 'browUp' | 'mouth' | 'mo' | 'pupil' | 'lookX' | 'lookY' | 'tilt' | 'blush' | 'bags' | 'slump' | 'nod' | 'turn'>;
export const EMO = {
  calm: {brow: 0, browUp: 0, mouth: 'flat', pupil: 1},
  smile: {brow: 0.1, browUp: 0.3, mouth: 'smile', blush: 0.5},
  alert: {brow: 0.35, browUp: 0.55, mouth: 'flat', pupil: 0.85, tilt: -3},
  scared: {brow: 0.8, browUp: 0.7, mouth: 'open', mo: 0.3, pupil: 0.6, tilt: -4},
  terror: {brow: 1, browUp: 1, mouth: 'open', mo: 0.85, pupil: 0.42, tilt: -6},
  suspicious: {brow: -0.35, browUp: -0.2, lid: 0.38, lidR: 0.18, mouth: 'flat', lookX: 0.6, tilt: 4},
  angry: {brow: -0.85, browUp: -0.4, mouth: 'grit', pupil: 0.9},
  sad: {brow: 0.9, browUp: 0.1, mouth: 'frown', lookY: 0.4, nod: 0.25},
  tired: {lid: 0.48, bags: 0.55, brow: 0.3, mouth: 'flat', slump: 0.35, nod: 0.1},
  shock: {brow: 0.5, browUp: 1, mouth: 'open', mo: 0.55, pupil: 0.5, lid: 0},
} satisfies Record<string, Face>;
export type Emo = keyof typeof EMO;

// hands relative to the base of the neck (shoulders at x ±126, y 66; an arm reaches about 340)
const DOWN_L: Hand = {x: -205, y: 390}, DOWN_R: Hand = {x: 205, y: 390};
export const POSE = {
  none: {handL: null, handR: null},
  down: {handL: DOWN_L, handR: DOWN_R},
  phone: {handL: DOWN_L, handR: {x: 70, y: 60, grip: 'fist', hold: 'phone', rot: 6}},
  phoneEar: {handL: DOWN_L, handR: {x: 132, y: -150, grip: 'fist', hold: 'phone', rot: -60}},
  listen: {handL: DOWN_L, handR: {x: 150, y: -160, grip: 'open', rot: -100}},
  shush: {handL: DOWN_L, handR: {x: 8, y: -66, grip: 'fist', rot: -90}},
  stop: {handL: DOWN_L, handR: {x: 290, y: 30, grip: 'open', rot: -90}},
  mouth: {handL: {x: -70, y: 170, grip: 'fist'}, handR: {x: 6, y: -58, grip: 'open', rot: -150}},
  reach: {handL: DOWN_L, handR: {x: 320, y: 110, grip: 'open'}},
  hold: {handL: {x: -90, y: 160, grip: 'fist'}, handR: {x: 90, y: 160, grip: 'fist'}},
  mug: {handL: DOWN_L, handR: {x: 110, y: 40, grip: 'fist', hold: 'mug', rot: 10}},
  shrug: {handL: {x: -260, y: 60, grip: 'open', rot: -40}, handR: {x: 260, y: 60, grip: 'open', rot: -140}},
} satisfies Record<string, {handL: Hand | null; handR: Hand | null}>;
export type Pose = keyof typeof POSE;

// a blink about every 3.3 s with a fixed random offset: 1 = open
const blinkOpen = (t: number, seed: number) => {
  let v = 1;
  const n = Math.floor(t / 3.3);
  for (const k of [n - 1, n]) {
    if (k < 0) continue;
    const bt = k * 3.3 + 0.9 + mulberry32(seed + k * 13)() * 1.3, d = (t - bt) / 0.22;
    if (d >= 0 && d <= 1) v = Math.min(v, Math.abs(d - 0.5) * 2);
  }
  return v;
};

export type HeroAProps = {
  id: string; x: number; y: number; s?: number; t: number;
  emo?: Emo; pose?: Pose; mode?: 'normal' | 'shadow' | 'xray' | 'split';
  scan?: number;                               // split mode: world x of the scan line (x-ray to the right of it)
  hot?: {brain?: boolean; hippo?: boolean};
  pal?: Partial<typeof HERO_A>;
  o?: Partial<HeroSpec>;                       // any raw override (look, tilt, hands...)
  shake?: number;                              // trembling 0..1
};
export const HeroA: React.FC<HeroAProps> = ({id, x, y, s = 1, t, emo = 'calm', pose = 'down', mode = 'normal', scan = 0, hot, pal = HERO_A, o = {}, shake = 0}) => {
  const face: Face = EMO[emo];
  const hands = POSE[pose];
  const sx = shake ? wobble(t * 40, 3) * 6 * shake : 0;
  const breath = Math.sin((t * 2 * Math.PI) / 3.6);
  const lidBase = o.lid ?? face.lid ?? 0;
  const open = blinkOpen(t, id.length * 7 + 3);
  const spec: HeroSpec = {id, x: x + sx, y, s, breath, rim: 0, rimColor: PAL.cold, pal,   // no edge light unless a scene has a real light source (o={{rim: 0.6}})
    ...face, ...hands, ...o,
    lid: 1 - (1 - lidBase) * open, lidR: face.lidR !== undefined || o.lidR !== undefined ? 1 - (1 - (o.lidR ?? face.lidR ?? 0)) * open : undefined};
  const arm = (h: Hand | null | undefined) => (h ? {x: h.x, y: h.y} : null);
  if (mode === 'shadow') return <Silhouette rim="none" x={x + sx} y={y} s={s} lookX={spec.lookX} lookY={spec.lookY} tilt={spec.tilt} handL={arm(spec.handL)} handR={arm(spec.handR)} />;
  if (mode === 'xray') return <XRayBody x={x + sx} y={y} s={s} handL={arm(spec.handL)} handR={arm(spec.handR)} hot={hot} />;
  if (mode === 'split') return (
    <g>
      <defs>
        <clipPath id={`${id}-l`}><rect x={-2000} y={-2000} width={2000 + scan} height={6000} /></clipPath>
        <clipPath id={`${id}-r`}><rect x={scan} y={-2000} width={4000} height={6000} /></clipPath>
      </defs>
      <g clipPath={`url(#${id}-l)`}><Hero {...spec} /></g>
      <g clipPath={`url(#${id}-r)`}><XRayBody x={x + sx} y={y} s={s} handL={arm(spec.handL)} handR={arm(spec.handR)} hot={hot} /></g>
      <rect x={scan - 4} y={y - 330 * s} width={8} height={960 * s} rx={4} fill={PAL.xLine} />
    </g>
  );
  return <Hero {...spec} />;
};

// ---------- sets (world coordinates 1080x1920; the hero usually stands at x 540, neck at y 1150) ----------
const wallGrad = (id: string, top: string, low: string) => <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={low} /></linearGradient>;
const glow = (id: string, c: string, o: number) => <radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity={o} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient>;
const Wide: React.FC<{fill: string}> = ({fill}) => <rect x={-1200} y={-1200} width={3480} height={4320} fill={fill} />;

// bedroom at night: wardrobe (ajar 0..1, eyes in the gap), window with the moon behind blinds, bed and a phone on the nightstand
export const Bedroom: React.FC<{t: number; ajar?: number; eyes?: number; phone?: number; moon?: number}> = ({t, ajar = 0, eyes = 0, phone = 0.8, moon = 1}) => (
  <g>
    <defs>{wallGrad('br-wall', '#1b2638', '#121b29')}{glow('br-moon', PAL.cold, 0.35)}{glow('br-phone', PAL.cold, 0.7)}</defs>
    <Wide fill="url(#br-wall)" />
    {Array.from({length: 22}, (_, i) => <rect key={i} x={-200 + i * 70} y={-200} width={2} height={1800} fill="#fff" opacity={0.03} />)}
    <rect x={-1200} y={1600} width={3480} height={1600} fill={PAL.floor} /><rect x={-1200} y={1590} width={3480} height={12} fill={PAL.line} />
    {/* window: night sky, the moon, blinds */}
    <rect x={640} y={330} width={350} height={500} rx={8} fill="#0c1220" />
    <rect x={656} y={346} width={318} height={468} fill="#101a2e" />
    <circle cx={880} cy={440} r={46} fill="#dfe8f6" opacity={0.9 * moon} />
    {Array.from({length: 13}, (_, i) => <rect key={i} x={652} y={350 + i * 36} width={326} height={14} fill="#2a3850" opacity={0.85} />)}
    <ellipse cx={760} cy={1100} rx={520} ry={700} fill="url(#br-moon)" opacity={moon} />
    {/* wardrobe: two doors, the right one opens into darkness */}
    <rect x={40} y={500} width={390} height={1100} rx={6} fill="#151c28" />
    <rect x={56} y={516} width={176} height={1076} fill="#26303f" />
    <rect x={56 + 180} y={516} width={176} height={1076} fill="#020305" />
    <g transform={`translate(${236 + 176} 516) scale(${1 - 0.55 * ajar} 1) translate(-176 0)`}>
      <rect x={0} y={0} width={176} height={1076} fill="#2b3647" stroke="#151c28" strokeWidth={3} />
      <rect x={18} y={490} width={14} height={100} rx={7} fill={PAL.metal} opacity={0.7} />
    </g>
    <rect x={200} y={1006} width={14} height={100} rx={7} fill={PAL.metal} opacity={0.7} />
    {eyes > 0 && [0, 1].map((k) => <ellipse key={k} cx={262 + k * 34} cy={900} rx={9} ry={6} fill="#f4f7fb" opacity={eyes * (0.6 + 0.4 * Math.sin(t * 2.1))} />)}
    {/* bed and nightstand */}
    <rect x={520} y={1380} width={700} height={50} rx={14} fill="#2a3346" />
    <rect x={520} y={1430} width={700} height={190} fill="#3a4a66" />
    <path d="M 560 1440 Q 860 1380 1220 1450 L 1220 1620 L 560 1620 Z" fill="#4b5f82" />
    <rect x={560} y={1330} width={210} height={90} rx={40} fill="#dfe4ec" />
    <rect x={400} y={1440} width={130} height={170} rx={6} fill="#1d2533" />
    <rect x={430} y={1418} width={70} height={22} rx={5} fill="#0b0e14" />
    <rect x={438} y={1421} width={54} height={14} rx={3} fill={PAL.cold} opacity={phone} />
    <ellipse cx={465} cy={1420} rx={150} ry={90} fill="url(#br-phone)" opacity={phone * 0.8} />
  </g>
);

// stairwell landing (podъезд): two-tone Soviet paint, apartment door with a peephole, stairs going up, a flickering lamp
export const Landing: React.FC<{t: number; flicker?: number; door?: string; upstairs?: number}> = ({t, flicker = 0, door = '47', upstairs = 0}) => {
  const on = flicker > 0 ? (Math.sin(t * 37) * Math.sin(t * 13.3) > 0.55 * flicker ? 1 : 0.25) : 1;
  return (
    <g>
      <defs>{glow('ld-lamp', '#d9e6ff', 0.45)}</defs>
      <Wide fill="#1c2738" />
      <rect x={-1200} y={980} width={3480} height={700} fill="#1f3236" />
      <rect x={-1200} y={972} width={3480} height={10} fill="#2c4448" />
      <rect x={-1200} y={1600} width={3480} height={1600} fill="#141b24" /><rect x={-1200} y={1590} width={3480} height={12} fill={PAL.line} />
      {/* stairs going up to the right, with a rail */}
      <path d="M 620 1600 L 620 1560 L 690 1560 L 690 1500 L 760 1500 L 760 1440 L 830 1440 L 830 1380 L 900 1380 L 900 1320 L 970 1320 L 970 1260 L 1040 1260 L 1040 1200 L 1300 1200 L 1300 1600 Z" fill="#26323f" />
      <path d="M 640 1300 L 1080 960" stroke="#3b4a5a" strokeWidth={14} strokeLinecap="round" />
      {Array.from({length: 6}, (_, i) => <line key={i} x1={680 + i * 70} y1={1268 - i * 54} x2={680 + i * 70} y2={1540 - i * 60} stroke="#3b4a5a" strokeWidth={6} />)}
      {/* a figure upstairs: only feet on the top step */}
      {upstairs > 0 && <g opacity={upstairs}><rect x={1050} y={1150} width={40} height={50} fill="#05070b" /><rect x={1100} y={1150} width={40} height={50} fill="#05070b" /></g>}
      {/* window on the stairs */}
      <rect x={780} y={420} width={210} height={330} rx={6} fill="#0c1220" stroke="#2c3a4c" strokeWidth={10} />
      <line x1={885} y1={420} x2={885} y2={750} stroke="#2c3a4c" strokeWidth={8} />
      {/* apartment door */}
      <rect x={70} y={560} width={360} height={1040} rx={6} fill="#141b27" />
      <rect x={86} y={576} width={328} height={1024} fill="#3a2a24" />
      {Array.from({length: 6}, (_, i) => <rect key={i} x={110} y={610 + i * 160} width={280} height={130} rx={4} fill="none" stroke="#2a1d18" strokeWidth={5} />)}
      <circle cx={250} cy={760} r={11} fill="#0b0f16" stroke={PAL.metal} strokeWidth={3} />
      <rect x={360} y={1080} width={34} height={14} rx={7} fill={PAL.metal} />
      <rect x={210} y={640} width={80} height={46} rx={4} fill="#d9dee6" />
      <text x={250} y={676} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={34} fill={PAL.ink}>{door}</text>
      {/* the lamp */}
      <line x1={540} y1={-400} x2={540} y2={-60} stroke="#0b0f16" strokeWidth={6} />
      <circle cx={540} cy={-40} r={26} fill="#e8eef8" opacity={on} />
      <ellipse cx={540} cy={260} rx={560} ry={720} fill="url(#ld-lamp)" opacity={on} />
      <rect x={-1200} y={-1200} width={3480} height={4320} fill="#000" opacity={(1 - on) * 0.45} />
    </g>
  );
};

// kitchen at night: tiles, window with the city, a fridge (its light leaks when it opens), the table and a kettle
export const Kitchen: React.FC<{t: number; fridge?: number; kettle?: number; city?: number}> = ({t, fridge = 0, kettle = 0, city = 0.5}) => {
  const r = mulberry32(5);
  return (
    <g>
      <defs>{glow('kt-fr', '#e9f3ff', 0.7)}</defs>
      <Wide fill="#1d2838" />
      <rect x={-1200} y={1000} width={3480} height={600} fill="#223044" />
      {Array.from({length: 30}, (_, i) => <line key={`v${i}`} x1={-200 + i * 60} y1={1000} x2={-200 + i * 60} y2={1600} stroke="#2c3b52" strokeWidth={3} />)}
      {Array.from({length: 10}, (_, i) => <line key={`h${i}`} x1={-1200} y1={1000 + i * 60} x2={2280} y2={1000 + i * 60} stroke="#2c3b52" strokeWidth={3} />)}
      <rect x={-1200} y={1600} width={3480} height={1600} fill={PAL.floor} />
      {/* window */}
      <rect x={100} y={380} width={430} height={520} rx={8} fill="#0c1220" stroke="#2c3a4c" strokeWidth={12} />
      {[[120, 650, 110, 240], [240, 600, 90, 290], [340, 680, 170, 210]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill="#141c2c" />)}
      {Array.from({length: 22}, (_, i) => { const x = 130 + r() * 370, y = 620 + r() * 250; return r() < city ? <rect key={i} x={x} y={y} width={10} height={9} fill="#ffd58a" opacity={0.8} /> : null; })}
      <line x1={315} y1={380} x2={315} y2={900} stroke="#2c3a4c" strokeWidth={10} />
      {/* counter and kettle */}
      <rect x={-1200} y={1180} width={1900} height={30} fill="#3a4658" /><rect x={-1200} y={1210} width={1900} height={390} fill="#283244" />
      <g transform="translate(160 1180)">
        <path d="M -60 0 L -50 -110 Q 0 -140 50 -110 L 60 0 Z" fill="#c9d2de" stroke="#141b27" strokeWidth={4} />
        <path d="M 52 -90 q 40 10 30 60" stroke="#141b27" strokeWidth={8} fill="none" />
        <circle cx={-20} cy={-20} r={6} fill={PAL.thread} opacity={kettle} />
        {kettle > 0 && [0, 1, 2].map((i) => <path key={i} d={`M ${-10 + i * 12} -140 q ${wobble(t * 3 + i, i) * 14} -40 0 -80`} stroke="#e8eef8" strokeWidth={6} fill="none" opacity={0.25 * kettle} strokeLinecap="round" />)}
      </g>
      {/* fridge */}
      <rect x={760} y={620} width={300} height={980} rx={18} fill="#c3ccd8" stroke="#141b27" strokeWidth={5} />
      <line x1={760} y1={960} x2={1060} y2={960} stroke="#141b27" strokeWidth={5} />
      <rect x={790} y={760} width={14} height={140} rx={7} fill="#7d8796" /><rect x={790} y={1000} width={14} height={180} rx={7} fill="#7d8796" />
      {fridge > 0 && <><rect x={756} y={964} width={10 + 40 * fridge} height={632} fill="#f4f8ff" opacity={0.9} /><ellipse cx={740} cy={1300} rx={420 * fridge} ry={500} fill="url(#kt-fr)" /></>}
    </g>
  );
};

// ---------- screen overlays ----------
const useT = () => { const f = useCurrentFrame(), {fps} = useVideoConfig(); return {f, fps, t: f / fps}; };
const life = (t: number, at: number, until?: number, d = 0.18) => clamp(Math.min((t - at) / d, until === undefined ? 1 : (until - t) / d));

// "*СЛОВО*" -> red word
const red = (text: string, color = PAL.thread) => text.split(/(\*[^*]+\*)/).map((p, i) => p.startsWith('*') ? <span key={i} style={{color}}>{p.slice(1, -1)}</span> : <React.Fragment key={i}>{p}</React.Fragment>);

// the progress at the top: a red thread through pins. steps = ['1','2','3','4'] (rules) or ['0 Ч','1 Ч','СУТКИ','3 ДНЯ'] (time)
export const ThreadProgress: React.FC<{steps: string[]; at: number[]; y?: number; from?: number}> = ({steps, at, y = SAFE.top + 30, from = 0}) => {
  const {t} = useT();
  if (t < from) return null;
  const x0 = SAFE.left + 60, x1 = SAFE.right - 60, n = steps.length, xs = steps.map((_, i) => lerp(x0, x1, n === 1 ? 0.5 : i / (n - 1)));
  const reached = at.filter((a) => t >= a).length;                 // how many pins are done
  const cur = reached - 1;
  const grow = cur < 0 ? 0 : cur === 0 ? 1 : easeOut((t - at[cur]) / 0.5);
  const xEnd = cur < 0 ? x0 : cur === 0 ? x0 : lerp(xs[cur - 1], xs[cur], grow);
  const o = easeOut((t - from) / 0.3);
  return (
    <svg width={1080} height={160} style={{position: 'absolute', left: 0, top: y - 40, opacity: o}}>
      <line x1={x0} y1={40} x2={x1} y2={40} stroke="#ffffff" strokeOpacity={0.18} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />
      {cur >= 0 && <><path d={`M ${x0} 40 L ${xEnd} 40`} stroke={PAL.threadGlow} strokeWidth={14} strokeOpacity={0.25} strokeLinecap="round" /><path d={`M ${x0} 40 L ${xEnd} 40`} stroke={PAL.thread} strokeWidth={4} strokeLinecap="round" /></>}
      {xs.map((x, i) => {
        const done = i <= cur, now = i === cur, pop = now ? spring01((t - at[i]) * 30, 0, 30, 2.6, 0.35) : 1;
        return <g key={i} transform={`translate(${x} 40) scale(${done ? 0.7 + 0.3 * pop : 1})`}>
          {now && <circle r={30} fill="none" stroke={PAL.thread} strokeWidth={3} opacity={0.5 + 0.4 * Math.sin(t * 5)} />}
          <circle r={done ? 22 : 16} fill={done ? PAL.thread : '#0b111b'} stroke={done ? PAL.thread : '#ffffff'} strokeOpacity={done ? 1 : 0.35} strokeWidth={3} />
          {steps[i].length <= 2
            ? <text y={9} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={done ? 26 : 20} fill={done ? '#fff' : '#9aa6b8'}>{steps[i]}</text>
            : <text y={66} textAnchor="middle" fontFamily={MONO} fontSize={24} fill={done ? '#fff' : '#9aa6b8'}>{steps[i]}</text>}
        </g>;
      })}
    </svg>
  );
};

// a short chip under the progress: the key fact of the phrase, 2-5 words
export const TopChip: React.FC<{text: string; at: number; until?: number; tone?: 'dark' | 'red' | 'paper'; y?: number}> = ({text, at, until, tone = 'dark', y = SAFE.top + 120}) => {
  const {t} = useT();
  const k = life(t, at, until);
  if (k <= 0) return null;
  const st = tone === 'red' ? {background: PAL.thread, color: '#fff'} : tone === 'paper' ? {background: PAL.paper, color: PAL.ink} : {background: 'rgba(8,12,20,0.82)', color: '#fff', border: '2px solid rgba(255,255,255,0.18)'};
  return (
    <div style={{position: 'absolute', left: SAFE.cx, top: y, transform: `translate(-50%, ${(1 - k) * -14}px) scale(${0.9 + 0.1 * k})`, opacity: k, whiteSpace: 'nowrap',
      fontFamily: MONT, fontWeight: 900, fontSize: 40, letterSpacing: 1, padding: '8px 22px', borderRadius: 10, ...st}}>{red(text)}</div>
  );
};

// a red digital time: "03:12"
export const Clock: React.FC<{text: string; at: number; until?: number; x?: number; y?: number}> = ({text, at, until, x = SAFE.cx, y = SAFE.top + 200}) => {
  const {t} = useT();
  const k = life(t, at, until);
  if (k <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, transform: 'translateX(-50%)', opacity: k, fontFamily: MONO, fontSize: 64, color: PAL.thread, letterSpacing: 4,
    background: 'rgba(5,7,11,0.85)', padding: '2px 20px', borderRadius: 8, border: `2px solid ${PAL.thread}55`, textShadow: `0 0 18px ${PAL.thread}`}}>{text}</div>;
};

// speech bubble (who: 'hero' white, 'other' cold blue, 'thing' red: the voice of what should not speak)
export const Bubble: React.FC<{text: string; at: number; until?: number; x: number; y: number; tail?: 'left' | 'right' | 'down'; who?: 'hero' | 'other' | 'thing'}> =
  ({text, at, until, x, y, tail = 'down', who = 'other'}) => {
  const {t, f, fps} = useT();
  const k = life(t, at, until, 0.12), p = spring01(f, at * fps, fps, 3, 0.45);
  if (k <= 0) return null;
  const bg = {hero: '#ffffff', other: '#cfe0f5', thing: PAL.thread}[who], fg = who === 'thing' ? '#fff' : PAL.ink;
  const tailPos = {left: {left: 30, bottom: -20, transform: 'skewX(30deg)'}, right: {right: 30, bottom: -20, transform: 'skewX(-30deg)'}, down: {left: '50%', bottom: -20, marginLeft: -16}}[tail];
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -100%) scale(${0.6 + 0.4 * p})`, transformOrigin: '50% 100%', opacity: k, maxWidth: 620}}>
      <div style={{position: 'relative', background: bg, color: fg, fontFamily: MONT, fontWeight: 800, fontSize: 40, lineHeight: 1.15, padding: '16px 26px', borderRadius: 26, boxShadow: '0 10px 0 rgba(0,0,0,0.35)', textAlign: 'center'}}>
        {text}
        <div style={{position: 'absolute', width: 32, height: 24, background: bg, clipPath: 'polygon(0 0, 100% 0, 50% 100%)', ...tailPos}} />
      </div>
    </div>
  );
};

// a red cross or a check that draws itself over something
export const Mark: React.FC<{kind: 'x' | 'ok'; at: number; until?: number; x: number; y: number; size?: number}> = ({kind, at, until, x, y, size = 160}) => {
  const {t} = useT();
  const k = life(t, at, until, 0.1);
  if (k <= 0) return null;
  const d1 = easeOut((t - at) / 0.18), d2 = easeOut((t - at - 0.12) / 0.18), h = size / 2;
  const c = kind === 'x' ? PAL.thread : '#5ad08a';
  const L = (x1: number, y1: number, x2: number, y2: number, p: number) => <line x1={x1} y1={y1} x2={lerp(x1, x2, p)} y2={lerp(y1, y2, p)} stroke={c} strokeWidth={size * 0.13} strokeLinecap="round" />;
  return (
    <svg width={size + 40} height={size + 40} style={{position: 'absolute', left: x - h - 20, top: y - h - 20, opacity: k, filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.4))'}}>
      <g transform="translate(20 20)">{kind === 'x'
        ? <>{L(0, 0, size, size, d1)}{d2 > 0 && L(size, 0, 0, size, d2)}</>
        : <>{L(0, h, h * 0.75, size * 0.9, d1)}{d2 > 0 && L(h * 0.75, size * 0.9, size, size * 0.1, d2)}</>}</g>
    </svg>
  );
};

// the honesty stamp of the "inside" format: what is known, what is estimated, what is made up
export const FactTag: React.FC<{kind: 'fact' | 'est' | 'fiction'; at: number; until?: number; x?: number; y?: number; src?: string}> = ({kind, at, until, x = SAFE.left + 10, y = SAFE.top + 200, src}) => {
  const {t, f, fps} = useT();
  const k = life(t, at, until), p = spring01(f, at * fps, fps, 2.6, 0.4);
  if (k <= 0) return null;
  const [label, c] = {fact: ['ФАКТ', '#5ad08a'], est: ['ПО ОЦЕНКАМ', '#f2c14e'], fiction: ['ВЫДУМКА', PAL.thread]}[kind];
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: k, transform: `rotate(-4deg) scale(${1.6 - 0.6 * p})`, transformOrigin: '0 50%'}}>
      <div style={{display: 'inline-block', fontFamily: MONT, fontWeight: 900, fontSize: 40, letterSpacing: 3, color: c, border: `5px solid ${c}`, borderRadius: 10, padding: '2px 16px', background: 'rgba(5,8,14,0.7)'}}>{label}</div>
      {src && <div style={{fontFamily: MONO, fontSize: 24, color: PAL.ice, marginTop: 8, opacity: 0.85}}>{src}</div>}
    </div>
  );
};

// the rule card: a big red pin with the number, "ПРАВИЛО", the rule on paper; it lands with a spring and leaves upwards
export const RuleCard: React.FC<{n: number; text: string; at: number; until?: number; y?: number; last?: boolean}> = ({n, text, at, until, y = 430, last}) => {
  const {t, f, fps} = useT();
  const k = life(t, at, until, 0.2), p = spring01(f, at * fps, fps, 2.2, 0.42);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: y, opacity: k, display: 'flex', flexDirection: 'column', alignItems: 'center',
      transform: `translateY(${(1 - p) * 60 - (until !== undefined && t > until - 0.2 ? (1 - k) * 40 : 0)}px)`}}>
      <div style={{width: 132, height: 132, borderRadius: 66, background: PAL.thread, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.4 + 0.6 * p})`,
        boxShadow: `0 0 50px ${PAL.threadGlow}88, 0 8px 0 rgba(0,0,0,0.35)`, fontFamily: MONT, fontWeight: 900, fontSize: 84, color: '#fff'}}>{n}</div>
      <div style={{fontFamily: MONO, fontSize: 30, letterSpacing: 8, color: PAL.thread, marginTop: 14, textShadow: '0 2px 6px #000'}}>{last ? 'ПОСЛЕДНЕЕ ПРАВИЛО' : 'ПРАВИЛО'}</div>
      <div style={{marginTop: 12, background: PAL.paper, color: PAL.ink, fontFamily: MONT, fontWeight: 900, fontSize: 46, padding: '14px 28px', transform: 'rotate(-2deg)', boxShadow: '0 10px 0 rgba(0,0,0,0.4)', textAlign: 'center', maxWidth: 820, lineHeight: 1.1}}>{red(text)}</div>
    </div>
  );
};

// the closing card. items = the rules of the episode (or two choices); the viewer answers with a number
export const EndCard: React.FC<{at: number; q: string; items: string[]; ask?: string; next?: string}> = ({at, q, items, ask = 'ПИШИ НОМЕР В КОММЕНТАРИЯХ', next}) => {
  const {t} = useT();
  if (t < at) return null;
  const k = (d: number) => easeOut((t - at - d) / 0.35);
  const thread = easeOut((t - at) / 0.9);
  return (
    <AbsoluteFill style={{background: `rgba(6,9,15,${0.92 * k(0)})`}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d={`M ${SAFE.left + 40} 250 Q 500 ${290} ${SAFE.right - 40} 250`} stroke={PAL.thread} strokeWidth={4} fill="none" strokeDasharray={1000} strokeDashoffset={1000 * (1 - thread)} />
        {thread > 0.99 && [SAFE.left + 40, SAFE.right - 40].map((x) => <circle key={x} cx={x} cy={250} r={9} fill={PAL.thread} />)}
      </svg>
      <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 300, textAlign: 'center', opacity: k(0.1), transform: `translateY(${(1 - k(0.1)) * 20}px)`,
        fontFamily: MONT, fontWeight: 900, fontSize: 72, lineHeight: 1.05, color: '#fff'}}>{red(q)}</div>
      <div style={{position: 'absolute', left: SAFE.left + 50, width: SAFE.right - SAFE.left - 100, top: 560, display: 'flex', flexDirection: 'column', gap: 22}}>
        {items.map((s, i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, opacity: k(0.35 + i * 0.12), transform: `translateX(${(1 - k(0.35 + i * 0.12)) * -30}px)`}}>
          <div style={{flex: '0 0 76px', height: 76, borderRadius: 38, background: PAL.thread, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 46, color: '#fff'}}>{i + 1}</div>
          <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 40, color: '#e8eef6', lineHeight: 1.1}}>{s}</div>
        </div>)}
      </div>
      <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 590 + items.length * 98 + 40, textAlign: 'center', opacity: k(0.4 + items.length * 0.12),
        fontFamily: MONT, fontWeight: 900, fontSize: 40, color: '#aab6c8', letterSpacing: 1}}>{ask}</div>
      {next && <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 590 + items.length * 98 + 130, textAlign: 'center', opacity: k(0.8 + items.length * 0.12),
        fontFamily: MONT, fontWeight: 900, fontSize: 46, color: PAL.thread, letterSpacing: 2}}>{next}</div>}
    </AbsoluteFill>
  );
};

// ---------- cover 1080x1920: what matters sits inside y 240..1680 (the 3:4 grid crop) ----------
export const CoverA: React.FC<{art: React.ReactNode; series?: string; part?: number; hook: string[]}> = ({art, series, part, hook}) => (
  <AbsoluteFill style={{background: PAL.night}}>
    {art}
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,8,14,0.85) 0%, rgba(5,8,14,0.35) 34%, rgba(5,8,14,0) 55%, rgba(5,8,14,0.5) 100%)'}} />
    {series && <div style={{position: 'absolute', left: 0, right: 0, top: 290, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: MONO, fontSize: 34, letterSpacing: 5, color: PAL.ice, background: 'rgba(0,0,0,0.6)', border: `2px solid ${PAL.thread}`, padding: '8px 22px'}}>
        <span style={{color: PAL.thread}}>● </span>{series}{part ? ` · ЧАСТЬ ${part}` : ''}</div>
    </div>}
    <div style={{position: 'absolute', left: 50, right: 50, top: 380, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 118, lineHeight: 1.0, color: '#fff', textShadow: '0 8px 0 rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.8)'}}>
      {hook.map((l, i) => <div key={i}>{red(l)}</div>)}
      <svg width={420} height={48} style={{display: 'block', margin: '18px auto 0'}}><path d="M 16 24 Q 110 46 210 24 Q 310 2 404 24" stroke={PAL.thread} strokeWidth={6} fill="none" strokeLinecap="round" /><circle cx={16} cy={24} r={9} fill={PAL.thread} /><circle cx={404} cy={24} r={9} fill={PAL.thread} /></svg>
    </div>
  </AbsoluteFill>
);
