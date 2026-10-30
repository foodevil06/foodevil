// «Нитка», the channel mascot (MASCOT.md): a ball of red yarn in a detective hat. Acting follows the cartoon-acting
// skill: every mood change goes squint (anticipation) -> new face under the squint -> a take with overshoot -> the
// emotion's own idle motion; reactions are painted emotes, not words; hat and thread follow through after the body.
// Drawn around the feet at (0, 0), ~420 units tall at scale 1. All values are pure functions of time.
import React from 'react';
import {clamp, easeInOut, easeOut, lerp, mulberry32, spring01} from '../lib/anim';

export type Emo = 'neutral' | 'happy' | 'excited' | 'laugh' | 'proud' | 'playful' | 'smug' | 'mischief' | 'suspicious'
  | 'sad' | 'scared' | 'nervous' | 'surprised' | 'confused' | 'thinking' | 'idea' | 'determined' | 'angry';
export type Emote = '!' | '?' | '!!' | 'sweat' | 'bulb' | 'spark' | 'dots' | 'anger' | null;
export type Arm = 'idle' | 'wave' | 'point' | 'shrug' | 'chin' | 'whisper' | 'tug' | 'hips';
type Eye = 'normal' | 'happy' | 'wide' | 'narrow' | 'closed' | 'sad' | 'angry' | 'spark';
type Mouth = 'smile' | 'grin' | 'o' | 'flat' | 'frown' | 'smirk' | 'wobble';
type Idle = (t: number) => {dy: number; sq: number; rot: number; dx: number};
type Def = {eyes: [Eye, Eye]; brow: [number, number, number?]; mouth: Mouth; blush: number; emote: Emote; take: number; idle: Idle; look?: [number, number]};

const S = Math.sin, A = Math.abs;
const I = (dy = 0, sq = 0, rot = 0, dx = 0) => ({dy, sq, rot, dx});
// eyes [left, right]; brow [lift, tilt (+ inner down = cross, - inner up = worried), extra lift of the right brow]
export const EMO: Record<Emo, Def> = {
  neutral: {eyes: ['normal', 'normal'], brow: [0, 0], mouth: 'smile', blush: 0.3, emote: null, take: 0.3, idle: (t) => I(S(t * 2.2) * 4, S(t * 2.2) * 0.015, S(t * 0.9) * 1.5)},
  happy: {eyes: ['happy', 'happy'], brow: [-6, 0], mouth: 'grin', blush: 0.7, emote: null, take: 0.6, idle: (t) => I(-A(S(t * 4.4)) * 10, A(S(t * 4.4)) * 0.03, S(t * 2.2) * 3)},
  excited: {eyes: ['wide', 'wide'], brow: [-14, 0], mouth: 'grin', blush: 0.8, emote: 'spark', take: 1, idle: (t) => I(-A(S(t * 6)) * 22, A(S(t * 6)) * 0.05, S(t * 3) * 5)},
  laugh: {eyes: ['closed', 'closed'], brow: [-8, 0], mouth: 'grin', blush: 0.8, emote: null, take: 0.8, idle: (t) => I(-A(S(t * 9)) * 8, A(S(t * 9)) * 0.04, S(t * 9) * 4)},
  proud: {eyes: ['closed', 'closed'], brow: [-6, 0], mouth: 'smile', blush: 0.6, emote: 'spark', take: 0.5, idle: (t) => I(S(t * 1.6) * 3, 0.03, -4 + S(t * 1.6))},
  playful: {eyes: ['normal', 'normal'], brow: [-6, 0, -8], mouth: 'smirk', blush: 0.6, emote: null, take: 0.6, idle: (t) => I(-A(S(t * 3)) * 8, A(S(t * 3)) * 0.03, S(t * 3) * 7)},
  smug: {eyes: ['narrow', 'narrow'], brow: [0, 6, -10], mouth: 'smirk', blush: 0.4, emote: null, take: 0.4, idle: (t) => I(S(t * 1.2) * 2, 0.01, -5 + S(t * 1.2) * 1.5)},
  mischief: {eyes: ['narrow', 'narrow'], brow: [-4, 10], mouth: 'grin', blush: 0.5, emote: null, take: 0.5, idle: (t) => I(S(t * 2) * 2, 0, 6 + S(t * 2) * 2, S(t * 2) * 4)},
  suspicious: {eyes: ['narrow', 'narrow'], brow: [2, 4, -12], mouth: 'flat', blush: 0.2, emote: 'dots', take: 0.4, idle: (t) => I(0, 0, 4, S(t * 0.8) * 6)},
  sad: {eyes: ['sad', 'sad'], brow: [-4, -12], mouth: 'frown', blush: 0.1, emote: null, take: 0.4, idle: (t) => I(8 + S(t) * 2, -0.04, -2)},
  scared: {eyes: ['wide', 'wide'], brow: [-16, -10], mouth: 'wobble', blush: 0, emote: 'sweat', take: 1, idle: (t) => I(S(t * 37) * 2, -0.03, 0, S(t * 40) * 2.5)},
  nervous: {eyes: ['normal', 'normal'], brow: [-8, -8], mouth: 'wobble', blush: 0.2, emote: 'sweat', take: 0.5, idle: (t) => I(0, 0, S(t * 1.5) * 2, S(t * 25) * 1.5)},
  surprised: {eyes: ['wide', 'wide'], brow: [-18, 0], mouth: 'o', blush: 0.2, emote: '!', take: 1.1, idle: (t) => I(-6, 0.05, 0, S(t * 30) * 0.8)},
  confused: {eyes: ['normal', 'normal'], brow: [-6, 0, -14], mouth: 'wobble', blush: 0.2, emote: '?', take: 0.6, idle: (t) => I(0, 0, S(t * 1.4) * 8)},
  thinking: {eyes: ['normal', 'normal'], brow: [-4, 5, -8], mouth: 'flat', blush: 0.2, emote: 'dots', take: 0.4, idle: (t) => I(S(t) * 2, 0, -6 + S(t * 0.8) * 2), look: [-0.6, -0.7]},
  idea: {eyes: ['spark', 'spark'], brow: [-14, 0], mouth: 'grin', blush: 0.6, emote: 'bulb', take: 1, idle: (t) => I(-A(S(t * 5)) * 12, 0.03, S(t * 2.5) * 3)},
  determined: {eyes: ['angry', 'angry'], brow: [2, 12], mouth: 'flat', blush: 0.3, emote: null, take: 0.7, idle: (t) => I(S(t * 3) * 2, -0.02, 3)},
  angry: {eyes: ['angry', 'angry'], brow: [6, 14], mouth: 'frown', blush: 0.9, emote: 'anger', take: 0.9, idle: (t) => I(0, -0.03, 0, S(t * 30) * 1.5)},
};

// ---------- acting: emotion keys -> current face, squint, take ----------
export type Key = [number, Emo, {look?: [number, number]; arm?: Arm; emote?: Emote}?];
export type ActState = {emo: Emo; squint: number; take: number; emoteK: number; emoteAge: number; look: [number, number]; arm: Arm; armAt: number; emote: Emote};
const ANT = 0.1;  // anticipation before every change
export const act = (t: number, keys: Key[]): ActState => {
  let k = 0;
  for (let i = 0; i < keys.length; i++) if (t >= keys[i][0]) k = i;
  const [kt, emo, over] = keys[k];
  const next = keys[k + 1];
  const def = EMO[emo];
  const dt = t - kt;
  // squint closes the eyes just before the next key (anticipation) and opens right after this one
  const pre = next ? clamp((t - (next[0] - ANT)) / ANT) : 0;
  const post = k > 0 ? 1 - clamp(dt / 0.12) : 0;
  const squint = Math.max(pre, post) * 0.3;  // a light squint only: the eyes stay open
  const take = k > 0 ? def.take * S(Math.min(dt * 13, Math.PI)) * Math.exp(-3.2 * dt) - pre * 0.35 * (next ? EMO[next[1]].take : 0) : 0;
  return {emo, squint, take, emoteK: clamp(spring01(dt * 30, 0, 30, 2.4, 0.45)), emoteAge: dt, look: over?.look ?? def.look ?? [0, 0],
    arm: over?.arm ?? 'idle', armAt: kt, emote: over?.emote !== undefined ? over.emote : def.emote};
};

// irregular blinks (seeded), occasional double blink
export const blink = (t: number, seed = 7) => {
  const r = mulberry32(seed);
  let bt = 0.6 + r() * 1.2, v = 1;
  while (bt < t + 1) {
    for (const b of r() < 0.25 ? [bt, bt + 0.22] : [bt]) { const d = t - b; if (d >= 0 && d <= 0.16) v = Math.min(v, A(d - 0.08) / 0.08); }
    bt += 1.8 + r() * 2.8;
  }
  return v;
};

// ---------- drawing ----------
const RED = '#e23b3b', RED_D = '#a8232a', RED_L = '#ff7a72', INK = '#16181f', EYE = '#fbfbf7';

const EyeG: React.FC<{x: number; y: number; shape: Eye; open: number; look: [number, number]}> = ({x, y, shape, open, look}) => {
  const rx = 33, ry = shape === 'wide' ? 47 : 42;
  if (shape === 'happy') return <path d={`M ${x - 24} ${y + 8} Q ${x} ${y - 22} ${x + 24} ${y + 8}`} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />;
  if (shape === 'closed' || open < 0.08) return <path d={`M ${x - 24} ${y + 2} Q ${x} ${y + 16} ${x + 24} ${y + 2}`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />;
  const o = open * (shape === 'narrow' ? 0.8 : shape === 'angry' ? 0.85 : 1);
  const pr = shape === 'wide' ? 0.3 : 0.45;
  const px = x + look[0] * rx * 0.38, py = y + look[1] * ry * 0.32 + (shape === 'sad' ? 8 : 0);
  // the lid: straight for narrow, slanted for sad (inner high) and angry (inner low)
  const side = x < 0 ? 1 : -1;  // +1 for the left eye: its inner corner is on the right
  const top = y - ry + 2 * ry * (1 - o);
  const slant = shape === 'sad' ? -16 : shape === 'angry' ? 18 : 0;
  const inner = top + slant, outer = top - slant * 0.4;
  const lidL = side > 0 ? outer : inner, lidR = side > 0 ? inner : outer;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={EYE} />
      {shape === 'spark'
        ? <path d={`M ${x} ${y - 22} L ${x + 7} ${y - 6} L ${x + 22} ${y} L ${x + 7} ${y + 6} L ${x} ${y + 22} L ${x - 7} ${y + 6} L ${x - 22} ${y} L ${x - 7} ${y - 6} Z`} fill="#f5c84b" />
        : <><circle cx={px} cy={py} r={rx * pr} fill={INK} /><circle cx={px - rx * 0.15} cy={py - ry * 0.18} r={rx * 0.15} fill="#fff" /></>}
      <path d={`M ${x - rx - 3} ${y - ry - 4} L ${x + rx + 3} ${y - ry - 4} L ${x + rx + 3} ${lidR} Q ${x} ${(lidL + lidR) / 2 + 6 * o} ${x - rx - 3} ${lidL} Z`} fill={RED} />
    </g>
  );
};

const MouthG: React.FC<{y: number; shape: Mouth; open: number; t: number}> = ({y, shape, open, t}) => {
  const w = shape === 'grin' ? 64 : shape === 'o' ? 30 : 54;
  const curve = {smile: 12, grin: 18, o: 0, flat: 2, frown: -12, smirk: 8, wobble: -4}[shape];
  const h = Math.max(shape === 'o' ? 26 : shape === 'grin' ? 14 : 0, open * 46);
  const wob = shape === 'wobble' ? S(t * 22) * 3 : 0;
  if (h < 4) {
    const lift = shape === 'smirk' ? 8 : 0;
    return <path d={`M ${-w / 2} ${y - curve * 0.3} Q 0 ${y + curve + wob} ${w / 2} ${y - curve * 0.3 - lift}`} stroke="#3a0d10" strokeWidth={7} fill="none" strokeLinecap="round" />;
  }
  const lw = shape === 'o' ? w * 0.75 + open * 10 : w;
  return <g>
    <path d={`M ${-lw / 2} ${y - curve * 0.25} Q 0 ${y + curve * 0.25 - 4 + wob} ${lw / 2} ${y - curve * 0.25 - (shape === 'smirk' ? 6 : 0)} Q ${lw * 0.45} ${y + h} 0 ${y + h + curve * 0.3} Q ${-lw * 0.45} ${y + h} ${-lw / 2} ${y - curve * 0.25} Z`} fill="#3a0d10" />
    {h > 16 && <ellipse cx={0} cy={y + h * 0.78} rx={lw * 0.22} ry={h * 0.2} fill="#ff8f8f" />}
  </g>;
};

const EmoteG: React.FC<{kind: Emote; k: number; age: number; x: number; y: number}> = ({kind, k, age, x, y}) => {
  if (!kind || k <= 0.01) return null;
  const s = k, wig = S(age * 18) * 4 * Math.exp(-2 * age);
  const g = (c: React.ReactNode) => <g transform={`translate(${x + wig} ${y}) scale(${s})`}>{c}</g>;
  switch (kind) {
    case '!': return g(<><rect x={-8} y={-62} width={16} height={46} rx={8} fill={RED} /><circle cx={0} cy={-4} r={9} fill={RED} /></>);
    case '!!': return g(<>{[-14, 14].map((dx) => <g key={dx}><rect x={dx - 7} y={-60} width={14} height={42} rx={7} fill={RED} /><circle cx={dx} cy={-6} r={8} fill={RED} /></g>)}</>);
    case '?': return g(<><path d="M -18 -48 Q -18 -72 4 -72 Q 26 -72 24 -52 Q 22 -38 4 -32 L 4 -20" stroke="#f5d27a" strokeWidth={12} fill="none" strokeLinecap="round" /><circle cx={4} cy={-4} r={8} fill="#f5d27a" /></>);
    case 'sweat': { const d = (age * 30) % 26; return g(<path d={`M 0 ${-40 + d} Q 14 ${-16 + d} 0 ${-8 + d} Q -14 ${-16 + d} 0 ${-40 + d} Z`} fill="#8fd3ff" opacity={1 - d / 30} />); }
    case 'bulb': return g(<><circle cx={0} cy={-52} r={40 + 4 * S(age * 6)} fill="#f5d27a" opacity={0.25} /><circle cx={0} cy={-52} r={24} fill="#f5d27a" /><rect x={-10} y={-30} width={20} height={14} rx={3} fill="#8a8f99" />
      {[0, 1, 2, 3, 4].map((i) => { const a = -Math.PI / 2 + (i - 2) * 0.55; return <line key={i} x1={Math.cos(a) * 34} y1={-52 + S(a) * 34} x2={Math.cos(a) * 46} y2={-52 + S(a) * 46} stroke="#f5d27a" strokeWidth={5} strokeLinecap="round" />; })}</>);
    case 'spark': return g(<>{[[0, -50, 1], [30, -24, 0.6], [-26, -20, 0.5]].map(([sx, sy, sc], i) => { const q = 18 * sc * (0.8 + 0.2 * S(age * 8 + i));
      return <path key={i} d={`M ${sx} ${sy - q} L ${sx + q * 0.3} ${sy - q * 0.3} L ${sx + q} ${sy} L ${sx + q * 0.3} ${sy + q * 0.3} L ${sx} ${sy + q} L ${sx - q * 0.3} ${sy + q * 0.3} L ${sx - q} ${sy} L ${sx - q * 0.3} ${sy - q * 0.3} Z`} fill="#f5d27a" />; })}</>);
    case 'dots': return g(<>{[0, 1, 2].map((i) => <circle key={i} cx={-24 + i * 24} cy={-24} r={8} fill="#cfd8ef" opacity={clamp(age * 3 - i * 0.6)} />)}</>);
    case 'anger': return g(<g stroke={RED} strokeWidth={8} strokeLinecap="round">{[0, 1, 2, 3].map((i) => { const a = i * Math.PI / 2 + Math.PI / 4;
      return <path key={i} d={`M ${Math.cos(a) * 10} ${-40 + S(a) * 10} Q ${Math.cos(a) * 24} ${-40 + S(a) * 24} ${Math.cos(a + 0.6) * 28} ${-40 + S(a + 0.6) * 28}`} fill="none" />; })}</g>);
    default: return null;
  }
};

// thread arm from the body to a hand position; the knot is the hand
const ArmG: React.FC<{from: [number, number]; to: [number, number]; bend: number}> = ({from, to, bend}) => {
  const mx = (from[0] + to[0]) / 2 + bend, my = (from[1] + to[1]) / 2 + Math.abs(bend) * 0.4;
  return <g><path d={`M ${from[0]} ${from[1]} Q ${mx} ${my} ${to[0]} ${to[1]}`} stroke={RED_D} strokeWidth={9} fill="none" strokeLinecap="round" />
    <circle cx={to[0]} cy={to[1]} r={15} fill={RED} /><circle cx={to[0] - 4} cy={to[1] - 5} r={5} fill={RED_L} opacity={0.7} /></g>;
};

export type NitkaProps = {
  t: number; x: number; y: number; s?: number;
  st: ActState; talk?: number;
  roll?: number;             // 0 = standing; while rolling the ball spins and the eyes are shut
  spin?: number;             // spin angle of the yarn pattern, degrees
  reach?: {pts: [number, number][]; p: number; taut?: number; pinFrom?: number; fade?: number} | null;  // the loose thread goes through these points (world coords); pins from index pinFrom
  flip?: boolean;
};

export const Nitka: React.FC<NitkaProps> = ({t, x, y, s = 1, st, talk = 0, roll = 0, spin = 0, reach = null, flip = false}) => {
  const def = EMO[st.emo];
  const id = def.idle(t), lag = def.idle(t - 0.09);
  const tk = st.take;
  const sy = 1 + id.sq + tk * 0.12 + talk * 0.02 - roll * 0.05, sx = 1 / Math.sqrt(Math.max(0.6, sy));
  const cy = -175 + id.dy - tk * 18;
  const R = 132;
  const open = blink(t) * (1 - st.squint) * (1 - roll);
  const rot = id.rot + (roll ? 0 : 0);
  const eyesY = cy - 14, look = st.look;
  const lift = def.brow[0] - tk * 6, tilt = def.brow[1], extra = def.brow[2] ?? 0;
  // hands (body-local): left arm small, right arm acts (no twinning)
  const armK = easeOut((t - st.armAt) / 0.3);
  const wave = S(t * 10) * 18;
  const L0: [number, number] = [-118, cy + 30], R0: [number, number] = [118, cy + 30];
  const restL: [number, number] = [-168, cy + 96 + S(t * 2.3 + 1) * 3], restR: [number, number] = [168, cy + 92 + S(t * 2.1) * 3];
  const poseR: Record<Arm, [number, number]> = {
    idle: restR, wave: [190, cy - 70 + wave], point: [262, cy - 70], shrug: [196, cy - 10], chin: restR, whisper: [70, cy + 52], tug: [150, cy + 70], hips: [130, cy + 70],
  };
  const poseL: Record<Arm, [number, number]> = {
    idle: restL, wave: restL, point: [-160, cy + 104], shrug: [-196, cy - 14], chin: [-40, cy + 74], whisper: restL, tug: [110, cy + 80], hips: [-130, cy + 70],
  };
  const mix = (a: [number, number], b: [number, number], k: number): [number, number] => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const hR = mix(restR, poseR[st.arm], armK), hL = mix(restL, poseL[st.arm], easeOut((t - st.armAt - 0.06) / 0.3));
  // hat: follows the body late, pops off on big takes
  const hatRot = -8 + lag.rot * 0.7 - tk * 10;
  const hatY = cy - 120 * sy - Math.max(0, tk) * 46;
  // the thread comes out of the right hand only when she reaches for clues; world-space points -> rig space
  const toLocal = ([wx, wy]: [number, number]): [number, number] => [((wx - x) / s) * (flip ? -1 : 1), (wy - y) / s];
  let tailD = '';  // no dangling tail: the thread only appears when she reaches for a clue
  if (reach && reach.p > 0) {
    const pts = [hR, ...reach.pts.map(toLocal)];
    tailD = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], sag = (1 - (reach.taut ?? 0)) * 70;
      tailD += ` Q ${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + sag} ${b[0]} ${b[1]}`;
    }
  }
  const sid = `nk${Math.round(x)}${Math.round(y)}`;
  return (
    <g transform={`translate(${x + id.dx * s} ${y}) scale(${s * (flip ? -1 : 1)} ${s})`}>
      <ellipse cx={0} cy={4} rx={130 * (1 - roll * 0.1)} ry={18} fill="#000" opacity={0.35} />
      {/* legs + shoes (tucked while rolling) */}
      {roll < 0.5 && [-1, 1].map((k) => <g key={k}><rect x={k * 38 - 8} y={-60 - tk * 10} width={16} height={56 + tk * 10} rx={8} fill={RED_D} /><ellipse cx={k * 48} cy={-4} rx={30} ry={15} fill={INK} /></g>)}
      {/* the loose thread: the channel's red thread */}
      {tailD && <path d={tailD} stroke={RED_D} strokeWidth={5 / s} fill="none" strokeLinecap="round" opacity={0.9 * (reach?.fade ?? 1)} pathLength={reach ? 1 : undefined}
        strokeDasharray={reach ? 1 : undefined} strokeDashoffset={reach ? 1 - clamp(reach.p) : undefined} />}
      {reach && reach.p > 0 && reach.pts.map((pt, i) => { const [lx, ly] = toLocal(pt); return i >= (reach.pinFrom ?? 0) && reach.p >= (i + 1) / reach.pts.length ? <circle key={i} cx={lx} cy={ly} r={6} fill={RED_D} opacity={reach.fade ?? 1} /> : null; })}
      <g transform={`rotate(${rot} 0 ${cy})`}>
        {/* body */}
        <defs>
          <radialGradient id={`${sid}g`} cx="38%" cy="32%" r="75%"><stop offset="0" stopColor={RED_L} /><stop offset="0.55" stopColor={RED} /><stop offset="1" stopColor={RED_D} /></radialGradient>
          <clipPath id={`${sid}c`}><ellipse cx={0} cy={cy} rx={R * sx} ry={R * sy} /></clipPath>
        </defs>
        <ellipse cx={0} cy={cy} rx={R * sx} ry={R * sy} fill={`url(#${sid}g)`} />
        <g clipPath={`url(#${sid}c)`} fill="none" strokeLinecap="round">
          <g transform={`rotate(${spin} 0 ${cy})`}>
            {[-90, -50, -10, 30, 70].map((o, i) => <path key={i} d={`M -150 ${cy + o} Q 0 ${cy + o - 70} 150 ${cy + o + 20}`} stroke={i % 2 ? RED_D : RED_L} strokeWidth={7} opacity={0.55} />)}
            {[-60, 0, 60].map((o, i) => <path key={`v${i}`} d={`M ${o - 40} ${cy - 150} Q ${o + 50} ${cy} ${o - 20} ${cy + 150}`} stroke={i % 2 ? RED_L : RED_D} strokeWidth={6} opacity={0.4} />)}
          </g>
        </g>
        {/* arms: left one first (behind), right one acts */}
        {roll < 0.5 && <ArmG from={L0} to={hL} bend={-20} />}
        {roll < 0.5 && <ArmG from={R0} to={hR} bend={st.arm === 'wave' ? 30 : 20} />}
        {roll < 0.5 && st.arm === 'point' && <path d={`M ${hR[0] + 10} ${hR[1] - 10} L ${hR[0] + 46} ${hR[1] - 48}`} stroke="#d9dde6" strokeWidth={5} strokeLinecap="round" />}
        {/* face */}
        <g transform={`translate(0 ${-tk * 4})`}>
          <EyeG x={-44} y={eyesY} shape={roll > 0.5 ? 'closed' : def.eyes[0]} open={open} look={look} />
          <EyeG x={44} y={eyesY} shape={roll > 0.5 ? 'closed' : def.eyes[1]} open={open} look={look} />
          <g stroke={INK} strokeWidth={9} strokeLinecap="round">
            <line x1={-64} y1={eyesY - 56 + lift + tilt * -0.4} x2={-24} y2={eyesY - 56 + lift + tilt} />
            <line x1={24} y1={eyesY - 56 + lift + extra + tilt} x2={64} y2={eyesY - 56 + lift + extra + tilt * -0.4} />
          </g>
          <ellipse cx={-82} cy={cy + 30} rx={17} ry={9} fill={RED_L} opacity={def.blush} /><ellipse cx={82} cy={cy + 30} rx={17} ry={9} fill={RED_L} opacity={def.blush} />
          <MouthG y={cy + 48} shape={def.mouth} open={talk} t={t} />
        </g>
      </g>
      {/* hat: follow-through and a pop on big takes */}
      <g transform={`translate(${12 + id.dx * 0.3} ${hatY}) rotate(${hatRot})`}>
        <ellipse cx={0} cy={0} rx={92} ry={16} fill={INK} />
        <path d="M -58 -2 C -60 -70 58 -76 56 -2 Z" fill={INK} />
        <rect x={-58} y={-24} width={114} height={16} fill={RED} />
        <path d="M -30 -60 Q 0 -48 30 -60" stroke="#2a2e3a" strokeWidth={6} fill="none" />
      </g>
      <g transform={`scale(${flip ? -1 : 1} 1)`}><EmoteG kind={roll > 0.5 ? null : st.emote} k={st.emoteK} age={st.emoteAge} x={(flip ? -1 : 1) * 150} y={cy - 150} /></g>
    </g>
  );
};
