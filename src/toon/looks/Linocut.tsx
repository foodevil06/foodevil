// Look «Ночная гравюра»: a two-colour linocut print. Black ink and warm paper; light is carved out as white hatching,
// shadow on lit things is black hatching; red is a second print colour used only for the key detail.
// Motion is stepped (12 drawings a second), like printed frames. Patterns, no blur: cheap to render.
import React from 'react';
import {Person} from './Looks';
import {creepyMouth, hairPaths, headPath, mustachePath} from './parts';
import {MONT} from '../case/Kit';

export const LI = {ink: '#15120e', paper: '#ece2cb', paperDim: '#cfc2a4', ochre: '#d9a441', red: '#e2353f'};

export const LinoDefs: React.FC = () => (
  <defs>
    <pattern id="li-w" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width={14} height={4} fill={LI.paper} /></pattern>
    <pattern id="li-wf" width={22} height={22} patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width={22} height={3} fill={LI.paper} /></pattern>
    <pattern id="li-b" width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width={12} height={4} fill={LI.ink} /></pattern>
    <pattern id="li-bh" width={18} height={18} patternUnits="userSpaceOnUse"><rect width={18} height={5} fill={LI.ink} /></pattern>
    <pattern id="li-wh" width={26} height={26} patternUnits="userSpaceOnUse"><rect width={26} height={3} fill={LI.paper} opacity={0.6} /></pattern>
  </defs>
);

export type LFace = {eyes?: 'open' | 'wide' | 'closed'; lx?: number; mouth?: 'flat' | 'smile' | 'o' | 'creepy'; brow?: number};
export type LArm = {sh: number; el: number};
export const LARMS = {down: {sh: 8, el: 4}, plate: {sh: 10, el: 80}, mouth: {sh: 150, el: 230}} satisfies Record<string, LArm>;

// light from the left: the left half of things is carved (white hatching), the right half of faces is hatched black
export const LinoFig: React.FC<{id: string; p: Person; x: number; y: number; s?: number; face?: LFace; armL?: LArm; armR?: LArm; tilt?: number; plate?: boolean; headOnly?: boolean; pale?: boolean}> =
  ({id, p, x, y, s = 1, face = {}, armL = LARMS.down, armR = LARMS.down, tilt = 0, plate, headOnly, pale}) => {
  const K = p.kid ? 0.68 : 1, hk = p.kid ? 1.25 : 1, R = 64;
  const hipY = -180, shY = -325, headCY = shY - 16 - R * hk;
  const sw = p.female ? 52 : 60;
  const hp = hairPaths(R, p);
  const eyes = face.eyes ?? 'open', lx = face.lx ?? 0, brow = face.brow ?? 0;
  const skin = pale ? '#d9d6cc' : LI.paper;
  const head = (
    <g transform={`translate(0 ${headCY}) scale(${hk}) rotate(${tilt} 0 ${R})`}>
      {hp.back.map((d, i) => <path key={i} d={d} fill={LI.ink} stroke={LI.paper} strokeWidth={3} />)}
      <clipPath id={`${id}-hd`}><path d={headPath(R)} /></clipPath>
      <path d={headPath(R)} fill={skin} />
      <rect x={R * 0.2} y={-R * 1.2} width={R * 1.2} height={R * 2.4} fill="url(#li-b)" clipPath={`url(#${id}-hd)`} opacity={0.85} />
      <path d={headPath(R)} fill="none" stroke={LI.ink} strokeWidth={5} />
      {[-1, 1].map((k) => {
        const ex = k * R * 0.34 + lx * R * 0.05, ey = R * 0.04;
        if (eyes === 'closed') return <path key={k} d={`M ${ex - R * 0.16} ${ey} Q ${ex} ${ey + R * 0.12} ${ex + R * 0.16} ${ey}`} stroke={LI.ink} strokeWidth={7} fill="none" />;
        const big = eyes === 'wide';
        return <g key={k}><path d={`M ${ex - R * (big ? 0.22 : 0.19)} ${ey} Q ${ex} ${ey - R * (big ? 0.28 : 0.2)} ${ex + R * (big ? 0.22 : 0.19)} ${ey} Q ${ex} ${ey + R * (big ? 0.28 : 0.2)} ${ex - R * (big ? 0.22 : 0.19)} ${ey} Z`} fill={LI.ink} />
          <circle cx={ex + lx * R * 0.06 + R * 0.03} cy={ey - R * 0.03} r={R * (big ? 0.05 : 0.04)} fill={LI.paper} />
          {(p.lids ?? 0) > 0 && (() => { const lid = (p.lids ?? 0) * (k > 0 ? 0.8 : 1), top = ey - R * 0.3, cut = ey - R * 0.2 + R * 0.4 * lid;
            return <><path d={`M ${ex - R * 0.26} ${top} L ${ex + R * 0.26} ${top} L ${ex + R * 0.26} ${cut} Q ${ex} ${cut + R * 0.06} ${ex - R * 0.26} ${cut} Z`} fill={skin} />
              <path d={`M ${ex - R * 0.22} ${cut} Q ${ex} ${cut + R * 0.06} ${ex + R * 0.22} ${cut}`} stroke={LI.ink} strokeWidth={6} fill="none" /></>; })()}</g>;
      })}
      {[-1, 1].map((k) => <path key={k} d={`M ${k * R * 0.12} ${-R * 0.28 - brow * R * 0.12} L ${k * R * 0.56} ${-R * 0.34 + brow * R * 0.06} L ${k * R * 0.5} ${-R * 0.24 + brow * R * 0.06} Z`} fill={LI.ink} />)}
      <path d={p.nose === 'long' ? `M ${-R * 0.02} ${R * 0.02} L ${-R * 0.2} ${R * 0.42} L ${R * 0.06} ${R * 0.4}` : `M ${-R * 0.04} ${R * 0.1} L ${-R * 0.14} ${R * 0.34} L ${R * 0.04} ${R * 0.34}`} stroke={LI.ink} strokeWidth={p.nose === 'long' ? 6 : 4} fill="none" />
      {p.glasses && <g fill="none" stroke={LI.ink} strokeWidth={5}>{[-1, 1].map((k) => <circle key={k} cx={k * R * 0.34} cy={R * 0.04} r={R * 0.27} />)}</g>}
      {p.mustache && <path d={mustachePath(R)} fill={LI.ink} />}
      {face.mouth === 'creepy' ? <><path d={creepyMouth(R, R * 0.52)} fill={LI.paper} stroke={LI.ink} strokeWidth={5} />{[-0.3, -0.1, 0.1, 0.3].map((u) => <line key={u} x1={u * R} y1={R * 0.48} x2={u * R} y2={R * 0.66} stroke={LI.ink} strokeWidth={3} />)}</>
        : face.mouth === 'o' ? <ellipse cx={0} cy={R * 0.55} rx={R * 0.11} ry={R * 0.15} fill={LI.ink} />
        : face.mouth === 'smile' ? <path d={`M ${-R * 0.24} ${R * 0.48} Q 0 ${R * 0.68} ${R * 0.24} ${R * 0.48}`} stroke={LI.ink} strokeWidth={7} fill="none" />
        : <path d={`M ${-R * 0.18} ${R * 0.54} L ${R * 0.18} ${R * 0.52}`} stroke={LI.ink} strokeWidth={7} />}
      {(p.age ?? 0) > 0.3 && <g stroke={LI.ink} strokeWidth={3} fill="none"><path d={`M ${-R * 0.3} ${-R * 0.56} Q 0 ${-R * 0.62} ${R * 0.3} ${-R * 0.56}`} /><path d={`M ${-R * 0.34} ${R * 0.4} q ${-R * 0.05} ${R * 0.1} 0 ${R * 0.2}`} /></g>}
      {hp.front.map((d, i) => <path key={i} d={d} fill={LI.ink} stroke={LI.paper} strokeWidth={3} />)}
      {hp.front.length > 0 && p.hair !== 'bald' && <path d={`M ${-R * 0.7} ${-R * 0.55} q ${R * 0.2} ${-R * 0.25} ${R * 0.5} ${-R * 0.32} M ${-R * 0.55} ${-R * 0.38} q ${R * 0.25} ${-R * 0.2} ${R * 0.55} ${-R * 0.25}`} stroke={LI.paper} strokeWidth={3} fill="none" opacity={0.8} />}
      {hp.extra.map((d, i) => <path key={i} d={d} fill={LI.ink} stroke={LI.paper} strokeWidth={3} />)}
    </g>
  );
  if (headOnly) return <g transform={`translate(${x} ${y}) scale(${s}) translate(0 ${-headCY})`}>{head}</g>;
  const arm = (k: number, A: LArm) => {
    const sx = k * (sw - 12), sy = shY + 16, a1 = (A.sh * Math.PI) / 180, a2 = ((A.sh - A.el) * Math.PI) / 180;
    const ex = sx + k * Math.sin(a1) * 100, ey = sy + Math.cos(a1) * 100, hx = ex + k * Math.sin(a2) * 92, hy = ey + Math.cos(a2) * 92;
    return <g key={k}>
      <path d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`} stroke={LI.paper} strokeWidth={38} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${sx} ${sy} L ${ex} ${ey} L ${hx} ${hy}`} stroke={LI.ink} strokeWidth={31} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hx} cy={hy} r={17} fill={skin} stroke={LI.ink} strokeWidth={4} />
    </g>;
  };
  const dress = p.top === 'dress' || p.bottom === 'skirt';
  const torso = `M ${-sw} ${shY + 18} Q ${-sw} ${shY} ${-sw + 22} ${shY} L ${sw - 22} ${shY} Q ${sw} ${shY} ${sw} ${shY + 18} L 50 ${hipY + 20} L -50 ${hipY + 20} Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * K})`}>
      <ellipse cx={0} cy={0} rx={90} ry={10} fill={LI.ink} />
      {[-1, 1].map((k) => <g key={k}><path d={`M ${k * 24} ${hipY + 10} L ${k * 26} -16`} stroke={LI.ink} strokeWidth={38} strokeLinecap="round" />
        <ellipse cx={k * 34} cy={-10} rx={28} ry={13} fill={LI.ink} stroke={LI.paper} strokeWidth={2.5} /></g>)}
      {dress && <path d={`M -52 ${hipY - 6} L 52 ${hipY - 6} L 86 -76 Q 0 -66 -86 -76 Z`} fill={LI.ink} stroke={LI.paper} strokeWidth={3} />}
      {dress && <path d={`M -52 ${hipY - 6} L 0 ${hipY - 6} L 0 -68 Q -40 -70 -86 -76 Z`} fill="url(#li-wf)" />}
      <rect x={-12} y={shY - 16} width={24} height={22} fill={LI.ink} />
      <path d={torso} fill={LI.ink} stroke={LI.paper} strokeWidth={3} />
      <clipPath id={`${id}-to`}><path d={torso} /></clipPath>
      <rect x={-sw - 10} y={shY - 10} width={sw} height={hipY - shY + 40} fill="url(#li-w)" clipPath={`url(#${id}-to)`} opacity={0.85} />
      {plate && <g transform={`translate(0 ${hipY - 46}) scale(1.35)`}><ellipse cx={0} cy={10} rx={74} ry={14} fill={LI.paper} stroke={LI.ink} strokeWidth={5} />
        <path d="M -54 8 Q -48 -40 0 -44 Q 48 -40 54 8 Z" fill={LI.ochre} stroke={LI.ink} strokeWidth={5} />
        <path d="M -34 -16 l 16 -8 M -4 -24 l 16 -8 M 24 -14 l 14 -8" stroke={LI.ink} strokeWidth={5} strokeLinecap="round" />
        <path d="M -40 -6 Q -30 -34 0 -38" stroke={LI.paper} strokeWidth={4} fill="none" opacity={0.85} />
        {[-22, 0, 22].map((u) => <path key={u} d={`M ${u} -52 q 10 -14 0 -28 q -10 -14 0 -28`} stroke={LI.paper} strokeWidth={4} fill="none" opacity={0.7} />)}</g>}
      {arm(-1, armL)}{arm(1, armR)}
      {head}
    </g>
  );
};

// ---------- sets ----------
const Dark: React.FC = () => <rect x={-1500} y={-1500} width={4080} height={4920} fill={LI.ink} />;

// the hallway in the dark: carved door, light under the door with two feet in it, the hero's phone light
export const LinoHall: React.FC<{t: number; shake?: number; feet?: number}> = ({t, shake = 0, feet = 1}) => {
  const dx = shake ? Math.sin(t * 80) * 6 * shake : 0;
  return <g>
    <Dark />
    {/* the bulb over the hero: the only warm light in the flat */}
    <line x1={760} y1={-400} x2={760} y2={330} stroke={LI.paper} strokeWidth={3} opacity={0.6} />
    <circle cx={760} cy={350} r={22} fill={LI.ochre} />
    {Array.from({length: 12}, (_, i) => { const a = Math.PI * (0.15 + (0.7 * i) / 11); return <line key={i} x1={760 + Math.cos(a) * 40} y1={350 + Math.sin(a) * 40} x2={760 + Math.cos(a) * (110 + (i % 3) * 30)} y2={350 + Math.sin(a) * (110 + (i % 3) * 30)} stroke={LI.ochre} strokeWidth={4} opacity={0.8} />; })}
    <path d="M 700 380 L 820 380 L 1060 1560 L 460 1560 Z" fill="url(#li-wf)" opacity={0.35} />
    <ellipse cx={760} cy={1600} rx={330} ry={46} fill={LI.ochre} opacity={0.35} />
    <ellipse cx={760} cy={1600} rx={330} ry={46} fill="url(#li-bh)" opacity={0.5} />
    <g transform={`translate(${dx} 0)`}>
      <rect x={150} y={600} width={380} height={958} fill={LI.ink} stroke={LI.paper} strokeWidth={6} />
      {[0, 1].map((i) => <rect key={i} x={200} y={660 + i * 460} width={280} height={400} fill="none" stroke={LI.paper} strokeWidth={4} opacity={0.75} />)}
      {[0, 1].map((i) => <rect key={i} x={200} y={660 + i * 460} width={60} height={400} fill="url(#li-wf)" />)}
      <circle cx={340} cy={900} r={10} fill={LI.paper} />
      <rect x={455} y={1090} width={50} height={16} rx={8} fill={LI.paper} />
    </g>
    {/* light under the door, cut by two feet */}
    <rect x={150} y={1556} width={380} height={10} fill={LI.ochre} />
    <path d="M 150 1566 L 530 1566 L 760 1700 L -80 1700 Z" fill={LI.ochre} opacity={0.75} />
    <path d="M 150 1566 L 530 1566 L 760 1700 L -80 1700 Z" fill="url(#li-bh)" opacity={0.6} />
    {feet > 0 && [270, 380].map((fx) => <path key={fx} d={`M ${fx} 1566 L ${fx + 34} 1566 L ${fx + 58 + (fx - 340) * 0.5} 1700 L ${fx - 20 + (fx - 340) * 0.5} 1700 Z`} fill={LI.ink} opacity={feet} />)}
  </g>;
};

export const LinoLanding: React.FC<{t: number; open?: number; inDoor?: React.ReactNode}> = ({t, open = 0, inDoor}) => <g>
  <Dark />
  <circle cx={540} cy={260} r={30} fill={LI.paper} />
  {Array.from({length: 16}, (_, i) => { const a = (i / 16) * Math.PI * 2 + 0.1; return <line key={i} x1={540 + Math.cos(a) * 50} y1={260 + Math.sin(a) * 50} x2={540 + Math.cos(a) * (130 + (i % 3) * 40)} y2={260 + Math.sin(a) * (130 + (i % 3) * 40)} stroke={LI.paper} strokeWidth={4} opacity={0.8 + 0.2 * Math.sin(t * 20 + i)} />; })}
  <path d="M 60 300 L 330 300 L 260 1550 L 60 1550 Z" fill="url(#li-wf)" opacity={0.5} />
  <path d="M 340 520 Q 540 420 740 520 L 760 1550 L 320 1550 Z" fill="url(#li-wf)" opacity={0.22} />
  <rect x={380} y={620} width={320} height={930} fill={LI.ink} stroke={LI.paper} strokeWidth={5} />
  {open > 0 && <rect x={386} y={626} width={308} height={918} fill="#050403" />}
  {inDoor}
  {open > 0 && <path d={`M 700 620 L ${700 - 308 * (1 - 0.75 * open)} 640 L ${700 - 308 * (1 - 0.75 * open)} 1535 L 700 1550 Z`} fill={LI.ink} stroke={LI.paper} strokeWidth={4} />}
  <rect x={490} y={680} width={80} height={44} fill={LI.paper} />
  <text x={530} y={714} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill={LI.ink}>19</text>
  <ellipse cx={540} cy={1580} rx={420} ry={40} fill={LI.paper} opacity={0.18} />
  <path d="M 760 1550 L 760 1490 L 830 1490 L 830 1430 L 900 1430 L 900 1370 L 970 1370 L 970 1310 L 1040 1310 L 1040 1250 L 1500 1250 L 1500 1550 Z" fill={LI.ink} stroke={LI.paper} strokeWidth={4} />
</g>;

export const LinoNotice: React.FC<{photo: React.ReactNode}> = ({photo}) => <g>
  <Dark />
  {Array.from({length: 30}, (_, i) => <line key={i} x1={-200 + i * 50} y1={0} x2={-260 + i * 50} y2={1920} stroke={LI.paper} strokeWidth={2} opacity={0.12} />)}
  <g transform="rotate(-2 540 900)">
    <rect x={220} y={300} width={640} height={900} fill={LI.paper} />
    <svg x={290} y={360} width={500} height={500} viewBox="0 0 340 340"><rect width={340} height={340} fill={LI.paperDim} />{photo}</svg>
    <path d="M 690 360 L 790 360 L 790 460 Z" fill={LI.ink} />
    <text x={540} y={940} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={58} fill={LI.ink}>БАБА ВАЛЯ</text>
    <text x={540} y={1000} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={36} fill={LI.ink}>КВАРТИРА 19</text>
    <text x={540} y={1090} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={50} fill={LI.red}>УМЕРЛА 14 МАРТА</text>
  </g>
</g>;
