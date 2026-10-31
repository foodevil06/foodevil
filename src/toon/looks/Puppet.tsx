// Look «Кукольный театр теней»: cardboard puppets on a small stage. Every body part is a paper piece with a light
// cardboard edge, a hard drop shadow and a brass split pin at the joint; faces are painted on. The hero hangs on red
// strings from above (the channel's red thread); the dead come up on dark rods from under the stage.
// Light: warm footlights from below, so each puppet throws a big soft-edged shadow up onto the painted backdrop.
// Motion is stepped (8 poses a second), like a hand-moved puppet. No blur filters: cheap to render.
import React from 'react';
import {Person} from './Looks';
import {creepyMouth, hairPaths, headPath, mustachePath} from './parts';
import {mixColor} from '../sleep/Hero';
import {MONT} from '../case/Kit';

export const PU = {ink: '#17130f', edge: '#efe2c4', pin: '#c9a24a', pinDark: '#5a4520', velvet: '#1c2848', velvetDark: '#111a33', plank: '#5b412c', red: '#ff3b47', backdrop: '#c9cdbf'};
const dk = (c: string, k = 0.25) => mixColor(c, '#0b0906', k);

export type PArm = {sh: number; el: number};
export type PFace = {eyes?: 'open' | 'wide' | 'closed'; lx?: number; mouth?: 'flat' | 'smile' | 'o' | 'creepy'; brow?: number};
export type PPose = {armL?: PArm; armR?: PArm; legA?: number; tilt?: number; plate?: boolean};
export const PARMS = {down: {sh: 8, el: 4}, plate: {sh: 10, el: 80}, mouth: {sh: 150, el: 230}, up: {sh: 160, el: 10}} satisfies Record<string, PArm>;

// one paper piece: hard shadow, fill, cardboard edge
const Piece: React.FC<{d: string; fill: string; shadow?: boolean; sil?: boolean}> = ({d, fill, shadow = true, sil}) => sil
  ? <path d={d} fill="#000" />
  : <>{shadow && <path d={d} fill="#000" opacity={0.32} transform="translate(7 9)" />}<path d={d} fill={fill} stroke={PU.edge} strokeWidth={5} strokeLinejoin="round" /></>;
const Pin: React.FC<{x: number; y: number; sil?: boolean}> = ({x, y, sil}) => sil ? null : <g><circle cx={x} cy={y} r={7} fill={PU.pin} stroke={PU.pinDark} strokeWidth={2} /><circle cx={x - 2} cy={y - 2} r={2} fill="#fff3c4" /></g>;
const rr = (x: number, y: number, w: number, h: number, r: number) => `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

export const PuppetFig: React.FC<{p: Person; x: number; y: number; s?: number; face?: PFace; pose?: PPose; strings?: 'red' | 'grey' | 'rods' | 'none'; sil?: boolean; headOnly?: boolean}> =
  ({p, x, y, s = 1, face = {}, pose = {}, strings = 'none', sil, headOnly}) => {
  const K = p.kid ? 0.68 : 1, hk = p.kid ? 1.25 : 1, R = 64;
  const hipY = -190, shY = -330, neckY = -345, headCY = neckY - R * hk * 0.98;
  const sw = p.female ? 54 : 62;
  const legC = p.bottom === 'skirt' && !p.kid ? '#3a3036' : p.bottomColor;
  const hp = hairPaths(R, p);
  const eyes = face.eyes ?? 'open', lx = face.lx ?? 0, brow = face.brow ?? 0;
  const head = (
    <g transform={`translate(0 ${headCY}) scale(${hk}) rotate(${pose.tilt ?? 0} 0 ${R})`}>
      {hp.back.map((d, i) => <Piece key={`b${i}`} d={d} fill={p.hair === 'scarf' ? p.scarf! : p.hairColor} sil={sil} />)}
      <Piece d={headPath(R)} fill={p.skin} sil={sil} />
      {!sil && <g>
        {[-1, 1].map((k) => <ellipse key={k} cx={k * R * 0.58} cy={R * 0.34} rx={R * 0.16} ry={R * 0.1} fill="#d97f6e" opacity={0.45} />)}
        {[-1, 1].map((k) => {
          const ex = k * R * 0.34 + lx * R * 0.05, ey = R * 0.04;
          if (eyes === 'closed') return <path key={k} d={`M ${ex - R * 0.14} ${ey} Q ${ex} ${ey + R * 0.1} ${ex + R * 0.14} ${ey}`} stroke={PU.ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
          const big = eyes === 'wide';
          return <g key={k}><ellipse cx={ex} cy={ey} rx={R * (big ? 0.2 : 0.17)} ry={R * (big ? 0.24 : 0.2)} fill="#f7f1e3" stroke={PU.ink} strokeWidth={3} />
            <circle cx={ex + lx * R * 0.07} cy={ey} r={R * (big ? 0.06 : 0.085)} fill={PU.ink} /></g>;
        })}
        {[-1, 1].map((k) => <path key={k} d={`M ${k * R * 0.16} ${-R * 0.3 - brow * R * 0.1} Q ${k * R * 0.34} ${-R * 0.42} ${k * R * 0.52} ${-R * 0.3 + brow * R * 0.05}`} stroke={dk(p.hairColor, 0.3)} strokeWidth={6} fill="none" strokeLinecap="round" />)}
        {p.glasses && <g fill="none" stroke={PU.ink} strokeWidth={3}>{[-1, 1].map((k) => <circle key={k} cx={k * R * 0.34} cy={R * 0.04} r={R * 0.25} />)}</g>}
        {p.mustache && <path d={mustachePath(R)} fill={p.hairColor} stroke={PU.edge} strokeWidth={3} />}
        {face.mouth === 'creepy' ? <path d={creepyMouth(R, R * 0.5)} fill="#f4efe2" stroke={PU.ink} strokeWidth={3} />
          : face.mouth === 'o' ? <ellipse cx={0} cy={R * 0.52} rx={R * 0.1} ry={R * 0.14} fill="#3b1714" />
          : face.mouth === 'smile' ? <path d={`M ${-R * 0.22} ${R * 0.46} Q 0 ${R * 0.64} ${R * 0.22} ${R * 0.46}`} stroke={PU.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
          : <path d={`M ${-R * 0.16} ${R * 0.5} L ${R * 0.16} ${R * 0.5}`} stroke={PU.ink} strokeWidth={4} strokeLinecap="round" />}
      </g>}
      {hp.front.map((d, i) => <Piece key={`f${i}`} d={d} fill={p.hair === 'scarf' ? p.scarf! : p.hairColor} shadow={false} sil={sil} />)}
      {hp.extra.map((d, i) => <Piece key={`e${i}`} d={d} fill={dk(p.scarf ?? p.hairColor, 0.15)} shadow={false} sil={sil} />)}
      {!sil && p.hair === 'scarf' && Array.from({length: 7}, (_, i) => <circle key={i} cx={-R * 0.75 + i * R * 0.25} cy={-R * 0.85 + Math.abs(i - 3) * R * 0.12} r={R * 0.05} fill="#e9d8c0" opacity={0.7} />)}
    </g>
  );
  if (headOnly) return <g transform={`translate(${x} ${y}) scale(${s}) translate(0 ${-headCY})`}>{head}</g>;

  const arm = (k: number, A: PArm = PARMS.down) => {
    const sx = k * (sw - 12), sy = shY + 14;
    return <g key={k} transform={`translate(${sx} ${sy}) rotate(${-k * A.sh})`}>
      <Piece d={rr(-17, -10, 34, 118, 15)} fill={p.topColor} sil={sil} />
      <g transform={`translate(0 100) rotate(${k * A.el})`}>
        <Piece d={rr(-15, -8, 30, 104, 14)} fill={p.topColor} sil={sil} />
        <Piece d={`M -17 98 a 17 17 0 1 0 34 0 a 17 17 0 1 0 -34 0 Z`} fill={p.skin} sil={sil} />
        <Pin x={0} y={0} sil={sil} />
      </g>
      <Pin x={0} y={0} sil={sil} />
    </g>;
  };
  const leg = (k: number) => <g key={k} transform={`translate(${k * 24} ${hipY}) rotate(${k * (pose.legA ?? 0)})`}>
    <Piece d={rr(-22, -6, 44, 176, 12)} fill={legC} sil={sil} />
    <Piece d={`M ${-24 + k * 4} 160 L ${26 + k * 10} 160 Q ${34 + k * 12} 186 ${18 + k * 10} 192 L ${-24 + k * 4} 192 Z`} fill={p.shoes} shadow={false} sil={sil} />
    <Pin x={0} y={6} sil={sil} />
  </g>;
  const dress = p.top === 'dress' || p.bottom === 'skirt';
  const torso = `M ${-sw} ${shY + 12} Q ${-sw} ${shY - 8} ${-sw + 22} ${shY - 8} L ${sw - 22} ${shY - 8} Q ${sw} ${shY - 8} ${sw} ${shY + 12} L 50 ${hipY + 20} L -50 ${hipY + 20} Z`;
  const ctrl = (px: number, py: number, key: string) => strings === 'none' ? null
    : strings === 'rods' ? <line key={key} x1={px} y1={py} x2={px + 10} y2={900} stroke="#1a140f" strokeWidth={6} />
    : <line key={key} x1={px} y1={py} x2={px * 0.6} y2={-3000} stroke={strings === 'red' ? PU.red : '#cfd3d8'} strokeWidth={strings === 'red' ? 3 : 2} opacity={strings === 'red' ? 0.95 : 0.5} />;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * K})`}>
      {!sil && strings !== 'rods' && strings !== 'none' && <>{ctrl(0, headCY - R * 1.1, 'h')}{ctrl(-sw - 30, shY + 200, 'l')}{ctrl(sw + 30, shY + 200, 'r')}</>}
      {!sil && strings === 'rods' && <>{ctrl(-20, hipY, 'a')}{ctrl(20, hipY, 'b')}</>}
      {leg(-1)}{leg(1)}
      {dress && <Piece d={`M -52 ${hipY - 6} L 52 ${hipY - 6} L 86 -70 Q 0 -60 -86 -70 Z`} fill={p.top === 'dress' ? p.topColor : p.bottomColor} sil={sil} />}
      <Piece d={torso} fill={p.topColor} sil={sil} />
      {!sil && <path d={`M ${-sw + 10} ${shY + 8} L -44 ${hipY + 10} M ${sw - 10} ${shY + 8} L 44 ${hipY + 10}`} stroke="#000" strokeOpacity={0.35} strokeWidth={3} strokeDasharray="10 8" fill="none" />}
      {!sil && p.top === 'hoodie' && <path d={`M -40 ${shY - 6} Q 0 ${shY + 30} 40 ${shY - 6}`} stroke={dk(p.topColor, 0.35)} strokeWidth={10} fill="none" strokeLinecap="round" />}
      {!sil && p.top === 'coat' && [0, 1, 2].map((i) => <circle key={i} cx={6} cy={shY + 34 + i * 40} r={7} fill={dk(p.topColor, 0.45)} stroke={PU.edge} strokeWidth={2} />)}
      {!sil && p.top === 'jacket' && <line x1={0} y1={shY} x2={0} y2={hipY + 16} stroke={dk(p.topColor, 0.45)} strokeWidth={5} />}
      {pose.plate && !sil && <g transform={`translate(0 ${hipY - 40})`}>
        <Piece d="M -72 4 Q 0 26 72 4 L 64 18 Q 0 34 -64 18 Z" fill="#ece6d8" />
        <Piece d="M -52 6 Q -46 -36 0 -40 Q 46 -36 52 6 Z" fill="#c3864a" />
      </g>}
      {head}
      <Pin x={0} y={neckY} sil={sil} />
      {arm(-1, pose.armL)}{arm(1, pose.armR)}
    </g>
  );
};

// the stage: velvet curtains, the valance, planks, footlights; `children` = the painted backdrop and the puppets
export const Stage: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => (
  <g>
    <defs>
      <radialGradient id="pu-foot" cx="0.5" cy="1" r="1"><stop offset="0" stopColor="#ffd38a" stopOpacity={0.55} /><stop offset="1" stopColor="#ffd38a" stopOpacity={0} /></radialGradient>
      <linearGradient id="pu-velvet" x1="0" y1="0" x2="1" y2="0">{Array.from({length: 9}, (_, i) => <stop key={i} offset={i / 8} stopColor={i % 2 ? PU.velvetDark : PU.velvet} />)}</linearGradient>
    </defs>
    <rect x={-1500} y={-1500} width={4080} height={4920} fill="#0a0806" />
    <g>{children}</g>
    {/* footlight glow over the lower half of the stage */}
    <rect x={40} y={900} width={1000} height={680} fill="url(#pu-foot)" opacity={0.75 + 0.05 * Math.sin(t * 9)} />
    <rect x={-200} y={1560} width={1480} height={150} fill={PU.plank} />
    {Array.from({length: 12}, (_, i) => <line key={i} x1={-200 + i * 130} y1={1560} x2={-260 + i * 130} y2={1710} stroke="#3a2818" strokeWidth={4} />)}
    <rect x={-200} y={1556} width={1480} height={8} fill="#2a1d12" />
    {Array.from({length: 9}, (_, i) => <g key={i}><rect x={92 + i * 112} y={1592} width={40} height={22} rx={6} fill="#2a2a2a" /><ellipse cx={112 + i * 112} cy={1592} rx={16} ry={8} fill="#ffe3a8" /></g>)}
    <rect x={-200} y={1710} width={1480} height={1000} fill="#050403" />
    {/* side curtains and the valance */}
    <path d="M -400 -400 L 70 -400 L 70 1560 Q 20 1500 -400 1560 Z" fill="url(#pu-velvet)" />
    <path d="M 1010 -400 L 1480 -400 L 1480 1560 Q 1060 1500 1010 1560 Z" fill="url(#pu-velvet)" />
    <path d={`M -400 -400 L 1480 -400 L 1480 300 ${Array.from({length: 9}, (_, i) => `Q ${1420 - i * 210 - 105} 380 ${1420 - (i + 1) * 210} 300`).join(' ')} L -400 300 Z`} fill={PU.velvet} />
    <path d={`M -400 300 ${Array.from({length: 9}, (_, i) => `Q ${-400 + i * 210 + 105} 380 ${-400 + (i + 1) * 210} 300`).join(' ')}`} stroke="#c9a24a" strokeWidth={6} fill="none" opacity={0.7} />
  </g>
);

// painted backdrops (cardboard flats). x 70..1010, y 300..1560
const Paint: React.FC<{c: string; seed: number}> = ({c, seed}) => <>
  <rect x={70} y={280} width={940} height={1290} fill={c} />
  {Array.from({length: 14}, (_, i) => <rect key={i} x={70 + ((i * 97 + seed * 31) % 900)} y={300 + ((i * 173 + seed * 57) % 1200)} width={160 + (i % 3) * 60} height={30 + (i % 4) * 14} rx={14} fill={i % 2 ? '#000' : '#fff'} opacity={0.05} transform={`rotate(${(i % 5) - 2} 540 900)`} />)}
</>;
export const HallFlat: React.FC<{shake?: number; t: number}> = ({shake = 0, t}) => {
  const dx = shake ? Math.sin(t * 80) * 7 * shake : 0;
  return <g>
    <Paint c="#8f9aa6" seed={1} />
    <rect x={70} y={1300} width={940} height={260} fill="#6f7884" />
    <g transform={`translate(${dx} 0)`}>
      <Piece d={rr(170, 700, 330, 860, 6)} fill="#6d4a36" />
      <Piece d={rr(210, 760, 250, 340, 4)} fill="#5c3e2d" shadow={false} />
      <Piece d={rr(210, 1150, 250, 340, 4)} fill="#5c3e2d" shadow={false} />
      <circle cx={335} cy={900} r={12} fill="#141414" stroke={PU.edge} strokeWidth={3} />
      <Piece d={rr(430, 1100, 46, 18, 8)} fill="#c9ced6" shadow={false} />
    </g>
    <Piece d="M 760 760 L 900 760 L 930 1180 L 740 1180 Z" fill="#5b4a68" />
    <Piece d={rr(745, 740, 170, 22, 10)} fill="#7a5d44" shadow={false} />
  </g>;
};
export const LandingFlat: React.FC = () => <g>
  <Paint c="#7f8f8a" seed={2} />
  <rect x={70} y={980} width={940} height={580} fill="#4f6e64" />
  <Piece d={rr(380, 620, 300, 940, 4)} fill="#4a4652" />
  <Piece d={rr(490, 680, 80, 44, 4)} fill="#e6e2d8" shadow={false} />
  <text x={530} y={714} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={30} fill={PU.ink}>19</text>
  <Piece d="M 760 1560 L 760 1500 L 830 1500 L 830 1440 L 900 1440 L 900 1380 L 970 1380 L 970 1320 L 1010 1320 L 1010 1560 Z" fill="#5d6a74" />
  <circle cx={540} cy={420} r={26} fill="#fff3d0" stroke={PU.edge} strokeWidth={4} />
  <line x1={540} y1={300} x2={540} y2={394} stroke={PU.ink} strokeWidth={4} />
</g>;

// the curtain closes and opens around a cut (k 0 open .. 1 closed), screen space
export const CurtainWipe: React.FC<{k: number}> = ({k}) => k <= 0 ? null : (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <defs><linearGradient id="pu-wipe" x1="0" y1="0" x2="1" y2="0">{Array.from({length: 7}, (_, i) => <stop key={i} offset={i / 6} stopColor={i % 2 ? PU.velvetDark : PU.velvet} />)}</linearGradient></defs>
    <rect x={-20} y={0} width={560 * k + 20} height={1920} fill="url(#pu-wipe)" />
    <rect x={1080 - 560 * k} y={0} width={560 * k + 20} height={1920} fill="url(#pu-wipe)" />
  </svg>
);
