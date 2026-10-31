// Look «Рентген бытового кошмара»: the block of flats as a technical section on graphite. The hero's flat is the only
// warm, lived-in room; everything else is concrete in cut (hatched) and steel-blue lines. A scan line removes the
// facade to show what stands behind the wall; the dead are drawn pale, as on an x-ray. Red is only the path of the danger.
// World: floors at y 500 (6th), 1560 (5th, the hero), 2620 (4th); flat 18 x 0..900, wall with the door x 900..960,
// landing x 960..1500, stairwell x 1500..2060. Layers and gradients only, no blur: medium render cost.
import React from 'react';
import {MONO} from '../case/Kit';
import {Person} from './Looks';

export const CW = {bg: '#121821', line: '#7fa6c9', slab: '#2b3644', hatch: '#3e4c60', label: '#9fb6cf', warm: '#3b3328', lamp: '#ffcf8a', landing: '#1c2838', red: '#ff3b47'};
export const FL = {f6: 500, f5: 1560, f4: 2620};

// the dead: the same person, drawn pale
export const ghost = (p: Person): Person => ({...p, skin: '#c9d6e3', hairColor: '#e3ebf3', scarf: p.scarf ? '#9fb3c8' : undefined, topColor: '#8fa8c2', bottomColor: '#6f87a2', shoes: '#5d7290'});

const Lbl: React.FC<{x: number; y: number; t: string; a?: 'start' | 'middle'}> = ({x, y, t, a = 'start'}) => <text x={x} y={y} fontFamily={MONO} fontSize={26} fill={CW.label} textAnchor={a} letterSpacing={2}>{t}</text>;

// stair flights: a zigzag between floors (points on the steps for standing figures: stairY)
const flight = (x0: number, y0: number, x1: number, y1: number, n = 14) => {
  const dx = (x1 - x0) / n, dy = (y1 - y0) / n;
  let d = `M ${x0} ${y0}`;
  for (let i = 0; i < n; i++) d += ` L ${x0 + dx * i} ${y0 + dy * (i + 1)} L ${x0 + dx * (i + 1)} ${y0 + dy * (i + 1)}`;
  return d + ` L ${x1} ${y1 + 50} L ${x0} ${y0 + 50} Z`;
};
export const stairY = (x: number, x0: number, y0: number, x1: number, y1: number) => y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
export const FLIGHTS = {up: [1520, FL.f5, 2040, 1030], down: [2040, 2090, 1520, FL.f5]} as const;

export const Building: React.FC<{t: number; reveal: number; revealAll: number; shake?: number; lampWarm?: number}> = ({t, reveal, revealAll, shake = 0, lampWarm = 1}) => {
  const dx = shake ? Math.sin(t * 80) * 5 * shake : 0;
  const slab = (y: number) => <rect x={-120} y={y} width={2260} height={60} fill="url(#cw-hatch)" stroke={CW.line} strokeWidth={3} />;
  return (
    <g>
      <defs>
        <pattern id="cw-hatch" width={16} height={16} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width={16} height={16} fill={CW.slab} /><rect width={16} height={3} fill={CW.hatch} /></pattern>
        <pattern id="cw-grid" width={60} height={60} patternUnits="userSpaceOnUse"><rect width={60} height={60} fill={CW.bg} /><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1b2430" strokeWidth={2} /></pattern>
        <radialGradient id="cw-lamp" cx="0.5" cy="0" r="1"><stop offset="0" stopColor={CW.lamp} stopOpacity={0.45} /><stop offset="1" stopColor={CW.lamp} stopOpacity={0} /></radialGradient>
        <radialGradient id="cw-cold" cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#cfe0ff" stopOpacity={0.3} /><stop offset="1" stopColor="#cfe0ff" stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-2000} y={-2000} width={6200} height={7000} fill="url(#cw-grid)" />
      {/* rooms: other floors are dim, flat 18 is warm */}
      {[FL.f6, FL.f4].map((fy) => <g key={fy}>
        <rect x={0} y={fy - 1000} width={900} height={1000} fill="#1a222e" />
        <rect x={960} y={fy - 1000} width={1100} height={1000} fill={CW.landing} opacity={0.8} />
        <rect x={120} y={fy - 260} width={300} height={260} fill="#222c3a" stroke={CW.line} strokeWidth={2} opacity={0.6} />
        <rect x={560} y={fy - 700} width={180} height={700} fill="#222c3a" stroke={CW.line} strokeWidth={2} opacity={0.6} />
      </g>)}
      <rect x={0} y={560} width={900} height={1000} fill={CW.warm} />
      {Array.from({length: 15}, (_, i) => <rect key={i} x={i * 60} y={560} width={2} height={1000} fill="#000" opacity={0.18} />)}
      <ellipse cx={560} cy={600} rx={520} ry={900} fill="url(#cw-lamp)" opacity={lampWarm} />
      <line x1={560} y1={560} x2={560} y2={700} stroke="#0b0f16" strokeWidth={5} /><circle cx={560} cy={712} r={14} fill={CW.lamp} opacity={lampWarm} />
      <rect x={740} y={760} width={130} height={12} fill="#6f5a48" /><path d="M 760 770 L 860 770 L 885 1150 L 735 1150 Z" fill="#4a3b52" stroke="#0b0f16" strokeWidth={4} />
      <rect x={960} y={560} width={1100} height={1000} fill={CW.landing} />
      <ellipse cx={1230} cy={560} rx={420} ry={800} fill="url(#cw-cold)" />
      <circle cx={1230} cy={590} r={12} fill="#e8f0ff" />
      {/* stairs */}
      {[[1520, FL.f5, 2040, 1030], [2040, 1030, 1520, FL.f6], [1520, FL.f4, 2040, 2090], [2040, 2090, 1520, FL.f5]].map(([a, b, c, d], i) =>
        <path key={i} d={flight(a, b, c, d)} fill="#273444" stroke={CW.line} strokeWidth={3} strokeLinejoin="round" opacity={i % 2 ? 0.7 : 1} />)}
      {[1030, 2090].map((y) => <rect key={y} x={2000} y={y} width={60} height={50} fill="#273444" stroke={CW.line} strokeWidth={3} />)}
      {/* slabs and walls in cut */}
      {slab(FL.f6)}{slab(FL.f5)}{slab(FL.f4)}{slab(FL.f6 - 1060)}
      <rect x={-60} y={-600} width={60} height={3300} fill="url(#cw-hatch)" stroke={CW.line} strokeWidth={3} />
      <rect x={2060} y={-600} width={60} height={3300} fill="url(#cw-hatch)" stroke={CW.line} strokeWidth={3} />
      {[FL.f6, FL.f5, FL.f4].map((fy) => <g key={fy}>
        <rect x={900} y={fy - 1000} width={60} height={300} fill="url(#cw-hatch)" stroke={CW.line} strokeWidth={3} />
      </g>)}
      {/* the door in the wall (seen edge on) */}
      <g transform={`translate(${dx} 0)`}>
        <rect x={912} y={FL.f5 - 700} width={36} height={700} fill="#5e4032" stroke={CW.line} strokeWidth={3} />
        <rect x={944} y={FL.f5 - 360} width={30} height={12} rx={5} fill="#c9ced6" />
        <circle cx={930} cy={FL.f5 - 520} r={6} fill="#0b0f16" stroke="#c9ced6" strokeWidth={2} />
      </g>
      {[FL.f6, FL.f4].map((fy) => <rect key={fy} x={912} y={fy - 700} width={36} height={700} fill="#33303a" stroke={CW.line} strokeWidth={2} />)}
      <Lbl x={30} y={600} t="КВ. 18 · ТЫ" />
      <Lbl x={990} y={600} t="ПЛОЩАДКА · 5 ЭТАЖ" />
      <Lbl x={30} y={-460} t="6 ЭТАЖ" /><Lbl x={30} y={1660} t="4 ЭТАЖ" />
      {/* facade: closed until the scan passes */}
      <FacadeCover x0={960 + reveal * 1200} y0={560} y1={1560} />
      <FacadeCover x0={-120 + revealAll * 2300} y0={-1000} y1={500} />
      <FacadeCover x0={-120 + revealAll * 2300} y0={1620} y1={2700} />
      {reveal > 0 && reveal < 1 && <rect x={960 + reveal * 1200 - 4} y={560} width={8} height={1000} fill={CW.line} />}
      {revealAll > 0 && revealAll < 1 && <rect x={-120 + revealAll * 2300 - 4} y={-1000} width={8} height={3700} fill={CW.line} />}
    </g>
  );
};
const FacadeCover: React.FC<{x0: number; y0: number; y1: number}> = ({x0, y0, y1}) => x0 >= 2120 ? null
  : <rect x={x0} y={y0} width={2120 - x0} height={y1 - y0} fill="url(#cw-hatch)" stroke={CW.line} strokeWidth={2} />;

// the red path of the danger: dashes that crawl along
export const DangerPath: React.FC<{d: string; t: number; o: number}> = ({d, t, o}) => o <= 0 ? null : <g opacity={o}>
  <path d={d} stroke={CW.red} strokeOpacity={0.25} strokeWidth={16} fill="none" strokeLinecap="round" />
  <path d={d} stroke={CW.red} strokeWidth={6} fill="none" strokeDasharray="22 16" strokeDashoffset={-t * 60} strokeLinecap="round" />
</g>;
