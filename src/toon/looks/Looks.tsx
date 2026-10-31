// Three drawing looks for the channel, one character system (docs/strategy/ТРИ_СТИЛЯ.md).
// A character is a `Person` (skin, hair, clothes, age, kid, mustache, glasses): the same parts make the hero, a grandma,
// a neighbour, a kid. `Fig` draws a person in one of three looks:
//   fast  flat cut-out: no outlines, dot eyes, flat fills; motion is slides and pops (cheapest to render)
//   mid   ink outline, white eyes with pupils, one cel shadow, legs swing when walking, blinking
//   heavy no outlines, soft gradient volume, soft shadows, light cones, dust, grain; gradients only, no blur filters,
//         so it stays reasonably fast to render
// Feet at (x, y); an adult is about 480 px tall at s = 1. Sets are in world coordinates 1080x1920.
import React from 'react';
import {mixColor} from '../sleep/Hero';
import {mulberry32, wobble} from '../lib/anim';
import {MONT} from '../case/Kit';

export type LookId = 'fast' | 'mid' | 'heavy';
export const INK = '#151821';
const dk = (c: string, k = 0.22) => mixColor(c, '#0b0e16', k);
const lt = (c: string, k = 0.18) => mixColor(c, '#ffffff', k);

// ---------- people ----------
export type Person = {
  skin: string; hair: 'short' | 'messy' | 'scarf' | 'bun' | 'pigtails' | 'bald' | 'long'; hairColor: string; scarf?: string;
  top: 'hoodie' | 'jacket' | 'coat' | 'dress'; topColor: string; bottom: 'pants' | 'skirt'; bottomColor: string; shoes: string;
  kid?: boolean; female?: boolean; mustache?: boolean; glasses?: boolean; age?: number;
  lids?: number;        // heavy upper eyelids 0..1 (the right eye a bit less: faces are not symmetric)
  nose?: 'long';
};
export const CAST = {
  hero: {skin: '#f0c39b', hair: 'messy', hairColor: '#2b211c', top: 'hoodie', topColor: '#3f6f73', bottom: 'pants', bottomColor: '#2c3646', shoes: '#e9ecef'},
  grandma: {skin: '#eac2a0', hair: 'scarf', hairColor: '#c9c6c0', scarf: '#6e4a68', top: 'coat', topColor: '#6b6250', bottom: 'skirt', bottomColor: '#3b3546', shoes: '#3a2f2a', female: true, age: 1, lids: 0.45},
  neighbour: {skin: '#e3b48e', hair: 'bald', hairColor: '#8a8178', top: 'jacket', topColor: '#3b4a3a', bottom: 'pants', bottomColor: '#2a2f38', shoes: '#1d1f24', mustache: true, glasses: true, age: 0.6, lids: 0.38, nose: 'long'},
  girl: {skin: '#f2cdb0', hair: 'pigtails', hairColor: '#6b3f22', top: 'dress', topColor: '#8a9bb5', bottom: 'skirt', bottomColor: '#e6e0d8', shoes: '#c9c2b8', kid: true, female: true},
} satisfies Record<string, Person>;

export type Face = {eyes?: 'open' | 'wide' | 'closed' | 'happy'; lx?: number; ly?: number; brow?: number; mouth?: 'flat' | 'smile' | 'o' | 'frown' | 'creepy'; blink?: number};
export type Arm = {sh: number; el: number};          // degrees: sh 0 = hanging down, + = raised outwards; el + = forearm bends in and up
export type Pose = {armL?: Arm; armR?: Arm; walk?: number; tilt?: number; plate?: boolean};
export const ARMS = {
  down: {sh: 8, el: 6}, plate: {sh: 12, el: 78}, mouth: {sh: 150, el: 230}, wave: {sh: 150, el: 25}, cheek: {sh: 18, el: 150},
} satisfies Record<string, Arm>;

const rad = (d: number) => (d * Math.PI) / 180;

export const Fig: React.FC<{id: string; p: Person; look: LookId; x: number; y: number; s?: number; face?: Face; pose?: Pose; headOnly?: boolean}> =
  ({id, p, look, x, y, s = 1, face = {}, pose = {}, headOnly}) => {
  const line = look === 'mid' ? 5 : 0, flat = look === 'fast', soft = look === 'heavy';
  const R = flat ? 60 : 70, K = p.kid ? 0.68 : 1, hk = p.kid ? 1.22 : 1;
  const hipY = -165, shY = -318, headCY = shY - 14 - R * 1.02;
  const sw = p.female ? 54 : 62, hw = 44;
  const legC = p.bottom === 'skirt' ? (p.kid ? p.bottomColor : '#3a3036') : p.bottomColor;
  const g = (k: string) => `${id}-${k}`;
  const fillOf = (c: string, key: string) => (soft ? `url(#${g(key)})` : c);
  const grad = (key: string, c: string, radial = false) => radial
    ? <radialGradient key={key} id={g(key)} cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor={lt(c, 0.16)} /><stop offset="0.6" stopColor={c} /><stop offset="1" stopColor={dk(c, 0.35)} /></radialGradient>
    : <linearGradient key={key} id={g(key)} x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stopColor={lt(c, 0.12)} /><stop offset="0.55" stopColor={c} /><stop offset="1" stopColor={dk(c, 0.4)} /></linearGradient>;

  // ----- head -----
  const H = (() => {
    const eyes = face.eyes ?? 'open', blink = face.blink ?? 0, lx = face.lx ?? 0, ly = face.ly ?? 0, brow = face.brow ?? 0;
    const hair = p.hairColor, hairF = fillOf(hair, 'hair');
    const back = p.hair === 'long' ? <rect x={-R * 1.02} y={-R * 0.6} width={R * 2.04} height={R * 1.9} rx={R * 0.5} fill={hairF} stroke={INK} strokeWidth={line} />
      : p.hair === 'scarf' ? <path d={`M ${-R * 1.12} ${R * 0.1} C ${-R * 1.3} ${-R * 1.35} ${R * 1.3} ${-R * 1.35} ${R * 1.12} ${R * 0.1} L ${R * 0.95} ${R * 1.25} L ${-R * 0.95} ${R * 1.25} Z`} fill={fillOf(p.scarf!, 'scarf')} stroke={INK} strokeWidth={line} />
      : p.hair === 'pigtails' ? <>{[-1, 1].map((k) => <ellipse key={k} cx={k * R * 1.12} cy={R * 0.25} rx={R * 0.3} ry={R * 0.5} fill={hairF} stroke={INK} strokeWidth={line} transform={`rotate(${k * -18} ${k * R * 1.12} ${R * 0.25})`} />)}</>
      : p.hair === 'bun' ? <circle cx={0} cy={-R * 1.05} r={R * 0.36} fill={hairF} stroke={INK} strokeWidth={line} /> : null;
    const cap = `M ${-R * 0.98} ${-R * 0.1} C ${-R * 1.06} ${-R * 1.22} ${R * 1.06} ${-R * 1.22} ${R * 0.98} ${-R * 0.1} Q ${R * 0.55} ${-R * 0.62} ${R * 0.05} ${-R * 0.52} Q ${-R * 0.5} ${-R * 0.64} ${-R * 0.98} ${-R * 0.1} Z`;
    const front = p.hair === 'bald' ? <>{[-1, 1].map((k) => <ellipse key={k} cx={k * R * 0.9} cy={-R * 0.12} rx={R * 0.18} ry={R * 0.32} fill={hairF} stroke={INK} strokeWidth={line} />)}</>
      : p.hair === 'scarf' ? <>
          <path d={`M ${-R * 0.7} ${-R * 0.5} Q 0 ${-R * 0.72} ${R * 0.7} ${-R * 0.5} L ${R * 0.6} ${-R * 0.38} Q 0 ${-R * 0.55} ${-R * 0.6} ${-R * 0.38} Z`} fill={hair} />
          <path d={`M ${-R * 1.1} ${R * 0.15} C ${-R * 1.22} ${-R * 1.3} ${R * 1.22} ${-R * 1.3} ${R * 1.1} ${R * 0.15} Q ${R * 0.85} ${-R * 0.5} 0 ${-R * 0.55} Q ${-R * 0.85} ${-R * 0.5} ${-R * 1.1} ${R * 0.15} Z`} fill={fillOf(p.scarf!, 'scarf')} stroke={INK} strokeWidth={line} />
          <path d={`M ${-R * 0.25} ${R * 1.02} L ${R * 0.25} ${R * 1.02} L ${R * 0.12} ${R * 1.36} L ${-R * 0.12} ${R * 1.36} Z`} fill={dk(p.scarf!, 0.15)} stroke={INK} strokeWidth={line} />
          {!flat && Array.from({length: 7}, (_, i) => <circle key={i} cx={-R * 0.75 + i * R * 0.25} cy={-R * 0.85 + Math.abs(i - 3) * R * 0.12} r={R * 0.05} fill={lt(p.scarf!, 0.35)} />)}
        </>
      : <>
          <path d={cap} fill={hairF} stroke={INK} strokeWidth={line} />
          {p.hair === 'messy' && [[-0.6, -0.95, -25], [-0.15, -1.12, -6], [0.35, -1.08, 14], [0.75, -0.8, 35]].map(([cx, cy, a], i) =>
            <path key={i} d={`M ${cx * R - R * 0.14} ${cy * R + R * 0.1} L ${cx * R} ${cy * R - R * 0.22} L ${cx * R + R * 0.14} ${cy * R + R * 0.1} Z`} fill={hair} transform={`rotate(${a} ${cx * R} ${cy * R})`} />)}
        </>;
    // eyes
    const eye = (k: number) => {
      const ex = k * R * 0.36, ey = R * 0.04;
      const closed = eyes === 'closed' || blink > 0.6;
      if (closed) return <path key={k} d={`M ${ex - R * 0.14} ${ey} Q ${ex} ${ey + R * 0.08} ${ex + R * 0.14} ${ey}`} stroke={INK} strokeWidth={R * 0.06} fill="none" strokeLinecap="round" />;
      if (eyes === 'happy') return <path key={k} d={`M ${ex - R * 0.14} ${ey + R * 0.04} Q ${ex} ${ey - R * 0.12} ${ex + R * 0.14} ${ey + R * 0.04}`} stroke={INK} strokeWidth={R * 0.06} fill="none" strokeLinecap="round" />;
      if (flat) return <circle key={k} cx={ex + lx * R * 0.06} cy={ey + ly * R * 0.05} r={R * (eyes === 'wide' ? 0.11 : 0.085)} fill={INK} />;
      const rx = R * (eyes === 'wide' ? 0.22 : 0.19), ry = R * (eyes === 'wide' ? 0.27 : 0.23);
      return <g key={k}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#fbfaf7" stroke={INK} strokeWidth={Math.max(2.5, line * 0.7)} />
        <circle cx={ex + lx * R * 0.08} cy={ey + ly * R * 0.07} r={R * (eyes === 'wide' ? 0.065 : 0.09)} fill={INK} />
        {soft && <circle cx={ex + lx * R * 0.08 + R * 0.03} cy={ey + ly * R * 0.07 - R * 0.04} r={R * 0.03} fill="#fff" />}
      </g>;
    };
    const browY = -R * 0.3;
    const mouthY = R * 0.48, m = face.mouth ?? 'flat', mw = R * 0.22;
    const mouth = m === 'smile' ? <path d={`M ${-mw} ${mouthY - 4} Q 0 ${mouthY + R * 0.18} ${mw} ${mouthY - 4}`} stroke={INK} strokeWidth={R * 0.06} fill="none" strokeLinecap="round" />
      : m === 'o' ? <ellipse cx={0} cy={mouthY + 4} rx={R * 0.1} ry={R * 0.14} fill="#3b1714" stroke={INK} strokeWidth={line ? 3 : 0} />
      : m === 'frown' ? <path d={`M ${-mw} ${mouthY + 8} Q 0 ${mouthY - R * 0.1} ${mw} ${mouthY + 8}`} stroke={INK} strokeWidth={R * 0.06} fill="none" strokeLinecap="round" />
      : m === 'creepy' ? <g><path d={`M ${-R * 0.52} ${mouthY - R * 0.12} Q 0 ${mouthY + R * 0.38} ${R * 0.52} ${mouthY - R * 0.12} Q 0 ${mouthY + R * 0.1} ${-R * 0.52} ${mouthY - R * 0.12} Z`} fill="#f4f1ea" stroke={INK} strokeWidth={Math.max(3, line)} strokeLinejoin="round" />
          {[-0.3, -0.1, 0.1, 0.3].map((u) => <line key={u} x1={u * R} y1={mouthY - R * 0.02} x2={u * R} y2={mouthY + R * 0.14} stroke={INK} strokeWidth={2} opacity={0.5} />)}</g>
      : <path d={`M ${-mw * 0.8} ${mouthY} L ${mw * 0.8} ${mouthY}`} stroke={INK} strokeWidth={R * 0.06} strokeLinecap="round" />;
    const skin = p.skin;
    return (
      <g transform={`translate(0 ${headCY}) scale(${hk}) rotate(${pose.tilt ?? 0})`}>
        {back}
        {!flat && [-1, 1].map((k) => <ellipse key={k} cx={k * R * 0.95} cy={R * 0.08} rx={R * 0.14} ry={R * 0.22} fill={dk(skin, 0.08)} stroke={INK} strokeWidth={line} />)}
        <clipPath id={g('hc')}><ellipse cx={0} cy={0} rx={flat ? R : R * 0.94} ry={R} /></clipPath>
        <ellipse cx={0} cy={0} rx={flat ? R : R * 0.94} ry={R} fill={fillOf(skin, 'skin')} />
        {look === 'mid' && <ellipse cx={R * 0.7} cy={R * 0.1} rx={R * 0.5} ry={R * 1.2} fill={dk(skin, 0.3)} opacity={0.28} clipPath={`url(#${g('hc')})`} />}
        <ellipse cx={0} cy={0} rx={flat ? R : R * 0.94} ry={R} fill="none" stroke={INK} strokeWidth={line} />
        {(p.age ?? 0) > 0.3 && !flat && <g stroke={dk(skin, 0.35)} strokeWidth={2.5} fill="none" opacity={0.7} strokeLinecap="round">
          <path d={`M ${-R * 0.3} ${-R * 0.55} Q 0 ${-R * 0.6} ${R * 0.3} ${-R * 0.55}`} /><path d={`M ${-R * 0.62} ${R * 0.05} l ${-R * 0.1} ${R * 0.06}`} /><path d={`M ${R * 0.62} ${R * 0.05} l ${R * 0.1} ${R * 0.06}`} />
          <path d={`M ${-R * 0.3} ${R * 0.38} q ${-R * 0.06} ${R * 0.08} ${-R * 0.02} ${R * 0.18}`} /><path d={`M ${R * 0.3} ${R * 0.38} q ${R * 0.06} ${R * 0.08} ${R * 0.02} ${R * 0.18}`} />
        </g>}
        <g transform={`translate(${(face.lx ?? 0) * R * 0.06} 0)`}>
          {[-1, 1].map((k) => <ellipse key={k} cx={k * R * 0.6} cy={R * 0.32} rx={R * 0.13} ry={R * 0.08} fill="#e88f7e" opacity={0.35} />)}
          {eye(-1)}{eye(1)}
          {p.glasses && <g fill="none" stroke={INK} strokeWidth={Math.max(3, line * 0.8)}>{[-1, 1].map((k) => <circle key={k} cx={k * R * 0.36} cy={R * 0.04} r={R * 0.26} />)}<path d={`M ${-R * 0.1} ${R * 0.02} Q 0 ${-R * 0.04} ${R * 0.1} ${R * 0.02}`} /></g>}
          {[-1, 1].map((k) => {
            const inner = {x: k * R * 0.18, y: browY - brow * R * 0.1}, outer = {x: k * R * 0.55, y: browY + brow * R * 0.05};
            return <path key={k} d={`M ${inner.x} ${inner.y} Q ${k * R * 0.36} ${browY - R * 0.1} ${outer.x} ${outer.y}`} stroke={p.hair === 'scarf' ? '#8f8a82' : p.hair === 'bald' ? hair : dk(hair, 0.1)} strokeWidth={R * 0.075} fill="none" strokeLinecap="round" />;
          })}
          {!flat && <path d={`M ${-R * 0.03} ${R * 0.14} Q ${-R * 0.1} ${R * 0.3} ${R * 0.02} ${R * 0.32}`} stroke={dk(skin, 0.45)} strokeWidth={3} fill="none" strokeLinecap="round" />}
          {p.mustache && <path d={`M ${-R * 0.3} ${R * 0.42} Q ${-R * 0.15} ${R * 0.26} 0 ${R * 0.36} Q ${R * 0.15} ${R * 0.26} ${R * 0.3} ${R * 0.42} Q 0 ${R * 0.48} ${-R * 0.3} ${R * 0.42} Z`} fill={hair} stroke={INK} strokeWidth={line * 0.6} />}
          {mouth}
        </g>
        {front}
      </g>
    );
  })();

  const defs = soft ? <defs>{grad('skin', p.skin, true)}{grad('hair', p.hairColor, true)}{p.scarf && grad('scarf', p.scarf, true)}{grad('top', p.topColor)}{grad('bot', legC)}</defs> : null;
  if (headOnly) return <g transform={`translate(${x} ${y}) scale(${s}) translate(0 ${-headCY})`}>{defs}{H}</g>;   // (x, y) = the centre of the head

  // ----- body -----
  const w = pose.walk;
  const legs = [-1, 1].map((k) => {
    const ph = (w ?? 0) + (k > 0 ? Math.PI : 0), walking = w !== undefined && look !== 'fast';
    const a = walking ? Math.sin(ph) * 0.32 : 0, lift = walking ? Math.max(0, Math.cos(ph)) * 10 : 0;
    const hx = k * 22, hy = hipY + 10, fx = hx + k * 2 + Math.sin(a) * 160, fy = -14 - lift;
    const d = `M ${hx} ${hy} L ${fx} ${fy}`;
    return <g key={k}>
      {line > 0 && <path d={d} stroke={INK} strokeWidth={36 + line * 2} strokeLinecap="round" />}
      <path d={d} stroke={soft ? `url(#${g('bot')})` : legC} strokeWidth={36} strokeLinecap="round" />
      <ellipse cx={fx + k * 8} cy={fy + 4} rx={27} ry={13} fill={p.shoes} stroke={INK} strokeWidth={line} />
    </g>;
  });
  const dress = p.top === 'dress' || p.bottom === 'skirt';
  const torsoD = `M ${-sw} ${shY + 20} Q ${-sw} ${shY} ${-sw + 22} ${shY} L ${sw - 22} ${shY} Q ${sw} ${shY} ${sw} ${shY + 20} L ${hw + 6} ${hipY + 20} L ${-hw - 6} ${hipY + 20} Z`;
  const skirtD = `M ${-hw - 4} ${hipY - 4} L ${hw + 4} ${hipY - 4} L ${hw + 34} -86 Q 0 -74 ${-hw - 34} -86 Z`;
  const arm = (k: number, A: Arm = ARMS.down) => {
    const sx = k * (sw - 14), sy = shY + 18, a1 = rad(A.sh), a2 = rad(A.sh - A.el);
    const ex = sx + k * Math.sin(a1) * 100, ey = sy + Math.cos(a1) * 100, hx = ex + k * Math.sin(a2) * 92, hy = ey + Math.cos(a2) * 92;
    const d = `M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`;
    return <g key={k}>
      {line > 0 && <path d={d} stroke={INK} strokeWidth={30 + line * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      <path d={d} stroke={soft ? `url(#${g('top')})` : p.topColor} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hx} cy={hy} r={16} fill={soft ? `url(#${g('skin')})` : p.skin} stroke={INK} strokeWidth={line * 0.8} />
    </g>;
  };
  const bob = w !== undefined ? Math.abs(Math.sin(w)) * -6 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * K})`}>
      {defs}
      {soft && <ellipse cx={0} cy={0} rx={110} ry={22} fill="url(#lk-shadow)" />}
      {flat && <ellipse cx={0} cy={0} rx={80} ry={10} fill="#000" opacity={0.25} />}
      <g transform={`translate(0 ${bob})`}>
        {legs}
        {dress && <path d={skirtD} fill={p.top === 'dress' ? (soft ? `url(#${g('top')})` : p.topColor) : (soft ? `url(#${g('bot')})` : p.bottomColor)} stroke={INK} strokeWidth={line} strokeLinejoin="round" />}
        <rect x={-13} y={shY - 16} width={26} height={22} fill={dk(p.skin, 0.12)} />
        <path d={torsoD} fill={soft ? `url(#${g('top')})` : p.topColor} stroke={INK} strokeWidth={line} strokeLinejoin="round" />
        {look === 'mid' && <path d={`M ${sw - 26} ${shY + 6} L ${sw} ${shY + 20} L ${hw + 6} ${hipY + 20} L ${hw - 18} ${hipY + 20} Z`} fill={dk(p.topColor, 0.35)} opacity={0.5} />}
        {p.top === 'hoodie' && <><path d={`M -42 ${shY + 2} Q 0 ${shY + 36} 42 ${shY + 2}`} stroke={dk(p.topColor, 0.3)} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d={`M -38 ${hipY - 40} L 38 ${hipY - 40} L 46 ${hipY + 4} L -46 ${hipY + 4} Z`} fill={dk(p.topColor, 0.18)} stroke={INK} strokeWidth={line * 0.6} /></>}
        {p.top === 'jacket' && <><line x1={0} y1={shY + 6} x2={0} y2={hipY + 18} stroke={dk(p.topColor, 0.4)} strokeWidth={5} />
          {[-1, 1].map((k) => <path key={k} d={`M ${k * 6} ${shY} L ${k * 34} ${shY} L ${k * 12} ${shY + 40} Z`} fill={dk(p.topColor, 0.25)} stroke={INK} strokeWidth={line * 0.6} />)}</>}
        {p.top === 'coat' && [0, 1, 2].map((i) => <circle key={i} cx={6} cy={shY + 40 + i * 42} r={6} fill={dk(p.topColor, 0.45)} />)}
        {pose.plate && <g transform={`translate(0 ${hipY - 30})`}>
          <ellipse cx={0} cy={10} rx={70} ry={12} fill="#e8e4dc" stroke={INK} strokeWidth={line} />
          <path d="M -50 8 Q -46 -34 0 -38 Q 46 -34 50 8 Z" fill={soft ? '#c98a4a' : '#c58a4e'} stroke={INK} strokeWidth={line} />
          {[-24, 0, 24].map((u) => <path key={u} d={`M ${u - 8} -16 L ${u + 8} -22`} stroke="#8a5a2e" strokeWidth={4} strokeLinecap="round" />)}
        </g>}
        {arm(-1, pose.armL)}{arm(1, pose.armR)}
        {H}
      </g>
    </g>
  );
};

// ---------- shared filters (put once per frame) ----------
export const LookDefs: React.FC = () => (
  <defs>
    <radialGradient id="lk-shadow"><stop offset="0" stopColor="#000" stopOpacity={0.55} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient>
  </defs>
);

// ---------- sets ----------
const WALL = '#2b3447', WALL_LOW = '#24303c', FLOOR = '#1a2029';
const Plain: React.FC<{c: string}> = ({c}) => <rect x={-1500} y={-1500} width={4080} height={4920} fill={c} />;

// hallway inside the flat: the front door with a peephole, a coat on a hook, a ceiling lamp
export const Hallway: React.FC<{look: LookId; t: number; shake?: number}> = ({look, t, shake = 0}) => {
  const line = look === 'mid' ? 5 : 0, soft = look === 'heavy';
  const dx = shake ? Math.sin(t * 90) * 6 * shake : 0;
  return (
    <g>
      {soft && <defs>
        <linearGradient id="hw2-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141a26" /><stop offset="0.45" stopColor={WALL} /><stop offset="1" stopColor="#1a2130" /></linearGradient>
        <linearGradient id="hw2-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe7b8" stopOpacity={0.45} /><stop offset="1" stopColor="#ffe7b8" stopOpacity={0} /></linearGradient>
      </defs>}
      <Plain c={soft ? 'url(#hw2-wall)' : WALL} />
      {look !== 'fast' && Array.from({length: 26}, (_, i) => <rect key={i} x={-300 + i * 70} y={-300} width={3} height={1900} fill="#000" opacity={0.12} />)}
      <rect x={-1500} y={1560} width={4080} height={1500} fill={FLOOR} />
      <rect x={-1500} y={1548} width={4080} height={16} fill={look === 'fast' ? '#323b4c' : '#3a4356'} />
      {/* the front door */}
      <g transform={`translate(${dx} 0)`}>
        <rect x={110} y={540} width={420} height={1024} rx={6} fill="#151b26" stroke={INK} strokeWidth={line} />
        <rect x={130} y={560} width={380} height={1000} fill={soft ? '#5a3b2e' : '#5e4032'} stroke={INK} strokeWidth={line} />
        {look !== 'fast' && [0, 1].map((i) => <rect key={i} x={170} y={610 + i * 470} width={300} height={420} rx={6} fill="none" stroke="#3e2920" strokeWidth={6} />)}
        <circle cx={320} cy={880} r={13} fill="#0b0f16" stroke="#b9c2cf" strokeWidth={4} />
        <rect x={450} y={1080} width={46} height={16} rx={8} fill="#c9ced6" stroke={INK} strokeWidth={line * 0.6} />
        <rect x={460} y={1120} width={20} height={34} rx={4} fill="#9aa3b1" />
      </g>
      {/* coat on a hook */}
      <rect x={760} y={760} width={150} height={14} rx={7} fill="#6f5a48" />
      <path d="M 780 770 L 890 770 L 920 1180 L 750 1180 Z" fill="#4a3b52" stroke={INK} strokeWidth={line} strokeLinejoin="round" />
      {/* ceiling lamp */}
      <line x1={680} y1={-400} x2={680} y2={180} stroke="#0b0f16" strokeWidth={6} />
      <path d="M 630 180 L 730 180 L 700 220 L 660 220 Z" fill="#c9ced6" stroke={INK} strokeWidth={line} />
      <circle cx={680} cy={226} r={14} fill="#fff4d6" />
      {soft && <path d="M 660 226 L 700 226 L 1000 1560 L 360 1560 Z" fill="url(#hw2-cone)" />}
    </g>
  );
};

// the stairwell landing, seen through the peephole: two-tone paint, a door opposite, stairs up, a lamp
export const Landing: React.FC<{look: LookId; t: number}> = ({look, t}) => {
  const line = look === 'mid' ? 5 : 0, soft = look === 'heavy';
  const flick = soft ? 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.1) : 1;
  return (
    <g>
      {soft && <defs>
        <radialGradient id="ld2-lamp" cx="0.5" cy="0.15" r="0.75"><stop offset="0" stopColor="#d9e6ff" stopOpacity={0.4} /><stop offset="1" stopColor="#d9e6ff" stopOpacity={0} /></radialGradient>
      </defs>}
      <Plain c="#2a3a4a" />
      <rect x={-1500} y={1000} width={4080} height={560} fill={look === 'fast' ? '#2e4a44' : '#2a4540'} />
      <rect x={-1500} y={994} width={4080} height={10} fill="#3d5a54" />
      <rect x={-1500} y={1550} width={4080} height={1500} fill="#1e252e" />
      {/* door opposite, flat 20 */}
      <rect x={360} y={600} width={340} height={950} fill="#3c3a46" stroke={INK} strokeWidth={line} />
      <rect x={490} y={660} width={80} height={44} rx={4} fill="#d9dee6" />
      <text x={530} y={694} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={32} fill={INK}>20</text>
      <circle cx={530} cy={820} r={9} fill="#0b0f16" />
      {/* stairs up on the right */}
      <path d="M 760 1550 L 760 1490 L 830 1490 L 830 1430 L 900 1430 L 900 1370 L 970 1370 L 970 1310 L 1040 1310 L 1040 1250 L 1110 1250 L 1110 1190 L 1600 1190 L 1600 1550 Z" fill="#33404c" stroke={INK} strokeWidth={line} strokeLinejoin="round" />
      <path d="M 760 1360 L 1200 1000" stroke="#55606e" strokeWidth={12} strokeLinecap="round" />
      {/* stairs down on the left */}
      <path d="M -400 1550 L 260 1550 L 260 1600 L -400 1600 Z" fill="#161c24" />
      {/* the lamp */}
      <circle cx={540} cy={240} r={22} fill="#eef3fb" opacity={flick} />
      {soft && <ellipse cx={540} cy={700} rx={700} ry={1000} fill="url(#ld2-lamp)" opacity={flick} />}
      {soft && Array.from({length: 40}, (_, i) => { const r = mulberry32(i + 3); const px = 200 + r() * 700, py = (r() * 1300 + t * (8 + r() * 14)) % 1300 + 260; return <circle key={i} cx={px + wobble(t * 0.5, i) * 20} cy={py} r={1.5 + r() * 2.5} fill="#e8f0ff" opacity={0.25 + 0.25 * Math.sin(t + i)} />; })}
    </g>
  );
};

// the death notice taped at the entrance: a photo with a black ribbon, the name and the date
export const Notice: React.FC<{look: LookId; photo: React.ReactNode}> = ({look, photo}) => {
  const line = look === 'mid' ? 5 : 0;
  return (
    <g>
      <Plain c="#3a4658" />
      {look !== 'fast' && Array.from({length: 30}, (_, i) => <rect key={i} x={-300 + i * 60} y={-300} width={60} height={2400} fill={i % 2 ? '#000' : '#fff'} opacity={0.02} />)}
      <g transform="rotate(-2 540 900)">
        <rect x={250} y={420} width={580} height={860} fill="#efeae0" stroke={INK} strokeWidth={line} />
        {[[260, 400], [770, 400]].map(([x, y], i) => <rect key={i} x={x} y={y} width={90} height={36} fill="#e8dfb8" opacity={0.85} transform={`rotate(${i ? 8 : -8} ${x + 45} ${y + 18})`} />)}
        <rect x={370} y={480} width={340} height={400} fill="#d7d2c8" stroke={INK} strokeWidth={line * 0.6} />
        <svg x={370} y={480} width={340} height={400} viewBox="0 0 340 400"><rect width={340} height={400} fill="#b9b4aa" />{photo}</svg>
        <path d="M 640 480 L 710 480 L 710 550 Z" fill="#111" />
        <path d="M 600 480 L 710 590" stroke="#111" strokeWidth={18} />
        <text x={540} y={960} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={44} fill={INK}>ВАЛЕНТИНА</text>
        <text x={540} y={1012} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={44} fill={INK}>ИВАНОВНА</text>
        <text x={540} y={1080} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={34} fill="#5a5048">КВАРТИРА 19</text>
        <text x={540} y={1160} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={40} fill="#8a1c22">СКОНЧАЛАСЬ 14 МАРТА</text>
      </g>
    </g>
  );
};

