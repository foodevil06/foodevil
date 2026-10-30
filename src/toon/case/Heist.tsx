// Sets for the money-heist explainer ("Ограбление века", Binance 2026): flat, outline-free night look with gold money,
// red danger and ice cyan for the freeze. Kinetic numbers in the spirit of sport/history infographics.
// Screen space 1080x1920, key content inside SAFE (TikTok zones).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, mulberry32, spring01, wobble} from '../lib/anim';
import {C, MONO, MONT, SAFE, UI} from './Kit';
import {Icon} from '../ui/Icons';

export const M = {
  bg: '#070b14', navy: '#0f1730', navy2: '#16213f', gold: '#f2c14e', goldDark: '#b8862a', bill: '#9fbf8a', billDark: '#6f8f5e', band: '#e8dcb0',
  red: '#e23b3b', ice: '#8fe3ff', iceDark: '#3aa6d0', steel: '#5b6b80', steelLit: '#8796ab', soil0: '#3a2a1e', soil1: '#2c1f16', soil2: '#22180f',
};

export const Backdrop: React.FC<{t: number; tint?: string; glow?: [number, number]}> = ({t, tint = M.navy, glow = [500, 820]}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 85% 60% at ${glow[0] / 10.8}% ${glow[1] / 19.2}%, ${tint} 0%, ${M.bg} 72%)`}}>
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.5}}>
      {Array.from({length: 46}, (_, i) => { const r = mulberry32(i * 3 + 1); const x = r() * 1080, y = r() * 1920;
        return <circle key={i} cx={x + wobble(t * 0.3, i) * 12} cy={(y - t * (8 + r() * 10) + 1920 * 3) % 1920} r={1.5 + r() * 2.5} fill="#cfd8ff" opacity={0.25 + 0.2 * Math.sin(t + i)} />; })}
    </svg>
  </AbsoluteFill>
);

// big kinetic label "• БРАЗИЛИЯ · 2005"
export const Tag: React.FC<{f: number; fps: number; at: number; text: string; x?: number; y?: number; color?: string}> = ({f, fps, at, text, x = SAFE.cx, y = SAFE.top + 40, color = M.gold}) => {
  const p = spring01(f, at * fps, fps, 2.4, 0.5);
  if (p <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, transform: `translateX(-50%) scale(${0.85 + 0.15 * clamp(p)})`, opacity: clamp(p * 2), whiteSpace: 'nowrap',
    fontFamily: MONO, fontSize: 34, letterSpacing: 3, color, background: 'rgba(7,11,20,0.82)', border: `2px solid ${color}55`, borderRadius: 10, padding: '8px 20px'}}>
    <span style={{color: M.red}}>●</span> {text}</div>;
};

// huge number in the middle (years, sums)
export const BigNum: React.FC<{f: number; fps: number; at: number; text: string; y?: number; size?: number; color?: string; sub?: string}> = ({f, fps, at, text, y = 700, size = 170, color = '#fff', sub}) => {
  const p = spring01(f, at * fps, fps, 2.2, 0.5);
  if (p <= 0) return null;
  return <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: y, textAlign: 'center', opacity: clamp(p * 2), transform: `scale(${1.25 - 0.25 * clamp(p)})`}}>
    <div style={{fontFamily: MONT, fontWeight: 900, fontSize: size, lineHeight: 1, color, letterSpacing: -2, textShadow: `0 0 40px ${color}55, 0 8px 0 rgba(0,0,0,0.5)`}}>{text}</div>
    {sub && <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 40, color: M.gold, letterSpacing: 4, marginTop: 10}}>{sub}</div>}
  </div>;
};

// ---------- vault door (opening shot) ----------
export const Vault: React.FC<{t: number; open: number; spin?: number}> = ({t, open, spin = 0}) => {
  const cx = SAFE.cx, cy = 820, R = 330;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="vt-l" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={M.gold} stopOpacity={0.8 * open} /><stop offset="1" stopColor={M.gold} stopOpacity="0" /></radialGradient>
        <radialGradient id="vt-d" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor={M.steelLit} /><stop offset="1" stopColor={M.steel} /></radialGradient>
      </defs>
      <rect x={cx - R - 90} y={cy - R - 90} width={2 * R + 180} height={2 * R + 180} rx={40} fill="#1a2133" />
      <circle cx={cx} cy={cy} r={R + 30} fill="#0a0e18" />
      <circle cx={cx} cy={cy} r={R} fill="url(#vt-l)" />
      {Array.from({length: 7}, (_, i) => <rect key={i} x={cx - 160 + i * 50} y={cy + 80} width={40} height={140 - (i % 3) * 30} fill={M.gold} opacity={open} />)}
      <g transform={`translate(${cx - R * 0.9 * open} 0) translate(${cx} ${cy}) scale(${1 - 0.75 * open} 1) translate(${-cx} ${-cy})`}>
        <circle cx={cx} cy={cy} r={R} fill="url(#vt-d)" />
        <circle cx={cx} cy={cy} r={R - 40} fill="none" stroke="#45536a" strokeWidth={10} />
        {Array.from({length: 12}, (_, i) => { const a = (i / 12) * Math.PI * 2; return <circle key={i} cx={cx + Math.cos(a) * (R - 20)} cy={cy + Math.sin(a) * (R - 20)} r={12} fill="#3d4a5e" />; })}
        <g transform={`rotate(${spin} ${cx} ${cy})`}>
          {[0, 60, 120].map((a) => <rect key={a} x={cx - 150} y={cy - 12} width={300} height={24} rx={12} fill="#2b3446" transform={`rotate(${a} ${cx} ${cy})`} />)}
          <circle cx={cx} cy={cy} r={58} fill="#2b3446" /><circle cx={cx} cy={cy} r={30} fill={M.steelLit} />
        </g>
      </g>
    </svg>
  );
};

// three things this robbery did not need: mask, tunnel, a shot — each crossed out on its word
export const NoNeed: React.FC<{f: number; fps: number; at: [number, number, number]}> = ({f, fps, at}) => {
  const t = f / fps;
  const items: [string, string][] = [['mask', 'МАСКИ'], ['shovel', 'ТОННЕЛЬ'], ['crosshair', 'ВЫСТРЕЛЫ']];
  return (
    <AbsoluteFill>
      {items.map(([ic, label], i) => {
        const p = spring01(f, at[i] * fps, fps, 2.4, 0.5), x = easeOut((t - at[i] - 0.25) / 0.25);
        if (p <= 0) return null;
        const y = 420 + i * 300;
        return <div key={ic} style={{position: 'absolute', left: SAFE.cx - 300, top: y, width: 600, height: 240, opacity: clamp(p * 2), transform: `translateX(${(1 - clamp(p)) * -200}px)`,
          display: 'flex', alignItems: 'center', gap: 40, background: 'rgba(15,23,48,0.85)', borderRadius: 30, padding: '0 40px', boxSizing: 'border-box'}}>
          <Icon name={ic} size={150} color="#cfd8ef" stroke={1.4} />
          <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 60, color: '#cfd8ef'}}>{label}</div>
          <svg width={600} height={240} style={{position: 'absolute', left: 0, top: 0}}>
            <line x1={30} y1={210} x2={30 + 540 * x} y2={210 - 180 * x} stroke={M.red} strokeWidth={18} strokeLinecap="round" />
          </svg>
        </div>;
      })}
    </AbsoluteFill>
  );
};

// ---------- money ----------
// one wrapped stack of banknotes (side view)
const Stack: React.FC<{x: number; y: number; w?: number; h?: number}> = ({x, y, w = 150, h = 40}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={4} fill={M.bill} />
    {Array.from({length: 4}, (_, i) => <line key={i} x1={x + 4} x2={x + w - 4} y1={y + 8 + i * 8} y2={y + 8 + i * 8} stroke={M.billDark} strokeWidth={2} />)}
    <rect x={x + w / 2 - 14} y={y} width={28} height={h} fill={M.band} />
  </g>
);
// a tower of stacks that grows with `p` (0..1); `n` stacks when full
export const MoneyTower: React.FC<{x: number; base: number; n: number; p: number; w?: number}> = ({x, base, n, p, w = 150}) => {
  const k = Math.floor(n * clamp(p));
  return <g>{Array.from({length: k}, (_, i) => <Stack key={i} x={x + ((i * 7) % 3) * 3 - 3} y={base - (i + 1) * 42} w={w} />)}</g>;
};

// odometer-like counter: digits roll to their value
export const Odometer: React.FC<{value: string; p: number; y: number; size?: number; color?: string}> = ({value, p, y, size = 120, color = M.gold}) => (
  <div style={{position: 'absolute', left: SAFE.left - 20, width: SAFE.right - SAFE.left + 40, top: y, display: 'flex', justifyContent: 'center', fontFamily: MONT, fontWeight: 900, fontSize: size, color,
    textShadow: `0 0 30px ${color}66`}}>
    {value.split('').map((ch, i) => {
      if (ch === ' ') return <span key={i} style={{display: 'inline-block', width: size * 0.22}} />;
      if (!/\d/.test(ch)) return <span key={i} style={{opacity: clamp(p * 3)}}>{ch}</span>;
      const d = Number(ch), q = clamp(p * 1.4 - i * 0.03);
      const shown = q >= 1 ? d : Math.floor((d + 10 * (1 - q) * 3) % 10);
      return <span key={i} style={{display: 'inline-block', minWidth: size * 0.62, textAlign: 'center', opacity: clamp(p * 3), transform: `translateY(${q >= 1 ? 0 : wobble(i + p * 40, i) * 6}px)`}}>{shown}</span>;
    })}
  </div>
);

export const Stopwatch: React.FC<{p: number; label: string; x: number; y: number; r?: number; color?: string}> = ({p, label, x, y, r = 120, color = M.red}) => (
  <svg width={1080} height={1920} style={{position: 'absolute'}}>
    <circle cx={x} cy={y} r={r} fill="rgba(7,11,20,0.85)" stroke="#2a3552" strokeWidth={14} />
    <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={14} strokeDasharray={2 * Math.PI * r} strokeDashoffset={2 * Math.PI * r * (1 - clamp(p))} transform={`rotate(-90 ${x} ${y})`} strokeLinecap="round" />
    <rect x={x - 16} y={y - r - 40} width={32} height={26} rx={6} fill="#2a3552" />
    <text x={x} y={y + 22} fontFamily={MONT} fontWeight={900} fontSize={r * 0.55} fill="#fff" textAnchor="middle">{label}</text>
  </svg>
);

// ---------- the old ways: tunnel cross-section, three trucks ----------
export const Tunnel: React.FC<{t: number; p: number; ruler?: number; small?: boolean}> = ({t, p, ruler = 0}) => {
  const gy = 860;
  const pts: [number, number][] = [[200, 1010], [300, 1070], [520, 1090], [700, 1070], [780, 1000]];
  const path = 'M 200 1010 C 260 1080 420 1095 560 1085 C 680 1078 760 1060 780 1000';
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect width={1080} height={gy} fill="#0c1428" />
      <circle cx={860} cy={260} r={50} fill="#e9e1c6" opacity={0.8} />
      {/* house (left) and the bank (right) */}
      <rect x={110} y={gy - 190} width={200} height={190} fill="#2a3346" /><path d={`M 95 ${gy - 190} L 210 ${gy - 280} L 325 ${gy - 190} Z`} fill="#1f2738" />
      <rect x={180} y={gy - 120} width={60} height={70} fill={C.window} opacity={0.8} />
      <rect x={560} y={gy - 330} width={380} height={330} fill="#2c3550" />
      <path d={`M 540 ${gy - 330} L 750 ${gy - 420} L 960 ${gy - 330} Z`} fill="#222a40" />
      {Array.from({length: 5}, (_, i) => <rect key={i} x={590 + i * 70} y={gy - 300} width={34} height={280} fill="#3b4664" />)}
      <text x={750} y={gy - 345} fontFamily={MONT} fontWeight={900} fontSize={34} fill={M.gold} textAnchor="middle">БАНК</text>
      {/* soil layers */}
      <rect y={gy} width={1080} height={1060} fill={M.soil0} />
      <path d={`M 0 ${gy + 260} C 300 ${gy + 220} 700 ${gy + 300} 1080 ${gy + 250} L 1080 1920 L 0 1920 Z`} fill={M.soil1} />
      <path d={`M 0 ${gy + 520} C 300 ${gy + 480} 700 ${gy + 560} 1080 ${gy + 500} L 1080 1920 L 0 1920 Z`} fill={M.soil2} />
      {Array.from({length: 60}, (_, i) => { const r = mulberry32(i + 50); return <circle key={i} cx={r() * 1080} cy={gy + 30 + r() * 900} r={3 + r() * 8} fill="#4a3626" opacity={0.6} />; })}
      {/* vault under the bank */}
      <rect x={700} y={940} width={180} height={120} fill="#1a1f2a" /><rect x={720} y={960} width={140} height={80} fill={M.gold} opacity={0.75} />
      {/* the tunnel, dug up to p */}
      <path d={path} stroke="#120c07" strokeWidth={46} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" />
      <path d={path} stroke="#e9c77a" strokeOpacity={0.35} strokeWidth={4} fill="none" pathLength={1} strokeDasharray="0.012 0.02" strokeDashoffset={-t * 0.05} style={{opacity: p > 0.02 ? 1 : 0}} />
      {/* ruler */}
      {ruler > 0 && <g opacity={ruler}>
        <line x1={200} x2={200 + 580 * ruler} y1={1150} y2={1150} stroke="#fff" strokeWidth={4} />
        {Array.from({length: 9}, (_, i) => <line key={i} x1={200 + i * 72.5} x2={200 + i * 72.5} y1={1138} y2={1162} stroke="#fff" strokeWidth={3} opacity={i * 72.5 <= 580 * ruler ? 1 : 0} />)}
        <text x={300} y={540} fontFamily={MONT} fontWeight={900} fontSize={140} fill="#fff" textAnchor="middle" style={{paintOrder: 'stroke'}} stroke="#0c1428" strokeWidth={10}>{Math.round(78 * ruler)} М</text>
      </g>}
      {pts.length && null}
    </svg>
  );
};

const Truck: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 14 + x) * 2}) scale(${s})`}>
    <rect x={0} y={-150} width={300} height={150} rx={8} fill="#c8c2b0" />
    <text x={150} y={-60} fontFamily={MONT} fontWeight={900} fontSize={70} fill="#9d977f" textAnchor="middle">$</text>
    <path d="M 300 -110 L 370 -110 L 410 -60 L 410 0 L 300 0 Z" fill="#8b3a2e" />
    <rect x={318} y={-98} width={50} height={36} fill="#9fc7e6" opacity={0.7} />
    {[60, 240, 360].map((cx) => <g key={cx}><circle cx={cx} cy={4} r={34} fill="#111" /><circle cx={cx} cy={4} r={14} fill="#555" /></g>)}
    <path d="M 410 -40 L 700 -90 L 700 40 Z" fill="#fff6c8" opacity={0.12} />
  </g>
);
export const Trucks: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  const lt = t - t0;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect width={1080} height={1920} fill="#0b1224" />
      <circle cx={820} cy={330} r={46} fill="#e9e1c6" opacity={0.8} />
      {Array.from({length: 8}, (_, i) => <rect key={i} x={((i * 160 - lt * 60) % 1300 + 1300) % 1300 - 100} y={760 - (i % 3) * 80} width={120} height={300 + (i % 3) * 80} fill="#121a30" />)}
      <rect y={1080} width={1080} height={840} fill="#151515" />
      {Array.from({length: 10}, (_, i) => <rect key={i} x={((i * 180 - lt * 520) % 1800 + 1800) % 1800 - 200} y={1250} width={100} height={12} fill="#e9c77a" opacity={0.6} />)}
      {[0, 1, 2].map((i) => <Truck key={i} t={t} x={-450 + lt * 260 + i * 480 - (i === 1 ? 40 : 0)} y={1180 + i * 0} s={0.95} />)}
    </svg>
  );
};

// 63 tonnes: pallets of cash pile up, a crane scale counts kilograms
export const Weight: React.FC<{t: number; p: number; dissolve?: number}> = ({t, p, dissolve = 0}) => {
  const pallets: [number, number][] = [];
  for (let row = 0; row < 4; row++) for (let i = 0; i < 4 - row; i++) pallets.push([200 + i * 170 + row * 85, 1260 - row * 130]);
  const n = Math.floor(pallets.length * clamp(p));
  const kg = Math.round(63000 * clamp(p * 1.1));
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect y={1300} width={1080} height={620} fill="#10141f" />
      {pallets.slice(0, n).map(([x, y], i) => {
        const r = mulberry32(i + 9), d = clamp(dissolve * 1.6 - r() * 0.6);
        const tx = lerp(x, 500, d), ty = lerp(y, 1500, d), sc = 1 - d;
        return <g key={i} transform={`translate(${tx} ${ty}) scale(${sc})`} opacity={1 - d * 0.6}>
          <rect x={0} y={0} width={160} height={20} fill="#6b4a2e" />
          {Array.from({length: 3}, (_, k) => <Stack key={k} x={2} y={-36 - k * 36} w={156} h={34} />)}
        </g>;
      })}
      {/* crane scale */}
      <line x1={500} y1={150} x2={500} y2={330} stroke="#3a4560" strokeWidth={10} />
      <rect x={340} y={330} width={320} height={150} rx={20} fill="#1b2235" stroke="#3a4560" strokeWidth={6} />
      <rect x={365} y={355} width={270} height={80} rx={8} fill="#08140c" />
      <text x={500} y={415} fontFamily={MONO} fontSize={60} fill="#3cff8a" textAnchor="middle">{String(kg).padStart(5, '0')}</text>
      <text x={500} y={466} fontFamily={MONT} fontWeight={800} fontSize={24} fill="#8a96b0" textAnchor="middle">КГ</text>
      {dissolve > 0 && <path d="M 500 1500 C 520 1600 700 1650 1100 1640" stroke={M.gold} strokeWidth={6} fill="none" opacity={dissolve} strokeDasharray="20 14" strokeDashoffset={-t * 120} />}
    </svg>
  );
};

// ---------- the laptop and the system that sends transfers ----------
export const Laptop: React.FC<{t: number; t0: number; link?: number; red?: number}> = ({t, t0, link = 0, red = 0}) => {
  const lines = Array.from({length: 14}, (_, i) => i);
  const scroll = Math.floor((t - t0) * 6);
  const r = mulberry32(3);
  const widths = lines.map(() => 80 + r() * 300);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs><radialGradient id="lp-g" cx="50%" cy="40%" r="60%"><stop offset="0" stopColor={red > 0.5 ? '#ff4a3a' : '#5fb7ff'} stopOpacity="0.28" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
      <rect width={1080} height={1920} fill={M.bg} />
      <rect width={1080} height={1920} fill="url(#lp-g)" />
      <rect y={1240} width={1080} height={680} fill="#1a140f" />
      {/* screen */}
      <g transform="translate(160 640)">
        <rect x={0} y={0} width={680} height={440} rx={22} fill="#1c2230" />
        <rect x={20} y={20} width={640} height={400} rx={8} fill="#060a10" />
        {lines.map((i) => {
          const k = (i + scroll) % 40;
          const w = widths[(k * 7) % widths.length];
          return <rect key={i} x={44} y={44 + i * 26} width={w} height={12} rx={4} fill={k % 9 === 0 ? (red > 0.5 ? M.red : M.gold) : '#3cff8a'} opacity={0.75} />;
        })}
        <rect x={44 + ((t * 4) % 1 > 0.5 ? 0 : 0)} y={44 + 14 * 26} width={20} height={14} fill="#3cff8a" opacity={Math.sin(t * 9) > 0 ? 1 : 0} />
        {/* base */}
        <path d="M -60 440 L 740 440 L 800 500 L -120 500 Z" fill="#2a3142" />
        <rect x={-120} y={500} width={920} height={14} rx={7} fill="#151a24" />
        <rect x={510} y={330} width={120} height={60} rx={8} fill={M.gold} transform="rotate(-6 570 360)" />
        <text x={570} y={370} fontFamily={MONO} fontSize={24} fill="#111" textAnchor="middle" transform="rotate(-6 570 360)">DEVOPS</text>
      </g>
      {/* link from the laptop to the vault-like server */}
      {link > 0 && <g>
        <path d="M 500 640 C 500 450 760 420 760 300" stroke={red > 0.5 ? M.red : M.ice} strokeWidth={8} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - link} />
        <g opacity={clamp(link * 3 - 2)} transform="translate(640 150)">
          <rect x={0} y={0} width={240} height={150} rx={18} fill="#141c30" stroke={red > 0.5 ? M.red : '#2e3b5a'} strokeWidth={4} />
          {[0, 1, 2].map((k) => <rect key={k} x={24} y={22 + k * 40} width={192} height={26} rx={6} fill="#1f2a44" />)}
          {[0, 1, 2].map((k) => <circle key={k} cx={196} cy={35 + k * 40} r={7} fill={red > 0.5 && Math.sin(t * 12 + k) > 0 ? M.red : '#3cff8a'} />)}
        </g>
      </g>}
    </svg>
  );
};

// ---------- 50 signatures, one works ----------
export const Signatures: React.FC<{f: number; fps: number; at: number; pick: number; win: number; fade: number}> = ({f, fps, at, pick, win, fade}) => {
  const t = f / fps;
  const W = 152, Hh = 92;
  return (
    <AbsoluteFill>
      {Array.from({length: 50}, (_, i) => {
        const col = i % 5, row = Math.floor(i / 5);
        const p = spring01(f, (at + i * 0.035) * fps, fps, 2.6, 0.55);
        if (p <= 0) return null;
        const chosen = i === 34;
        const dim = chosen ? 0 : clamp((t - pick) / 0.3);
        const ok = chosen && t >= win;
        const x = SAFE.left + 30 + col * (W + 18), y = 300 + row * (Hh + 16);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: W, height: Hh, borderRadius: 12, boxSizing: 'border-box', padding: '10px 12px',
          background: ok ? '#1f8f53' : chosen && t >= pick ? '#2a3a66' : '#1a2340', border: `3px solid ${ok ? '#4dff9a' : chosen && t >= pick ? M.gold : '#2e3b5a'}`,
          opacity: clamp(p * 2) * (1 - 0.8 * dim) * (chosen ? 1 : 1 - fade), transform: `scale(${(0.6 + 0.4 * clamp(p)) * (chosen && t >= pick ? 1.25 + (ok ? 0.1 * Math.exp(-6 * (t - win)) : 0) : 1)})`,
          zIndex: chosen ? 2 : 1, boxShadow: chosen && t >= pick ? `0 0 40px ${ok ? '#4dff9a' : M.gold}` : undefined}}>
          <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 15, color: '#8a96b0', letterSpacing: 2}}>ПОДПИСЬ</div>
          <div style={{fontFamily: MONO, fontSize: 22, color: '#fff'}}>#{(18914775 + i).toLocaleString('ru-RU')}</div>
          <svg width={120} height={26}><path d={`M 4 18 C 20 ${4 + (i % 5) * 3} 34 26 52 12 S 86 ${20 - (i % 4) * 4} 116 8`} stroke={ok ? '#fff' : M.gold} strokeWidth={3} fill="none" /></svg>
          {ok && <div style={{position: 'absolute', right: -18, top: -22, width: 54, height: 54, borderRadius: 27, background: '#4dff9a', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="check" size={38} color="#06301a" stroke={3.2} /></div>}
        </div>;
      })}
    </AbsoluteFill>
  );
};

// coins pouring out of an open wallet; `flow` 0..1 controls the stream, `freeze` stops it in ice
export const CoinStream: React.FC<{time: number; flow: number; freeze?: number; from?: [number, number]; to?: [number, number]; n?: number; label?: string}> =
  ({time, flow, freeze = 0, from = [200, 820], to = [1100, 760], n = 70, label = '$'}) => {
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: n}, (_, i) => {
        const r = mulberry32(i * 13 + 7);
        const speed = 0.35 + r() * 0.35, ph = r();
        const tf = time;
        const u = ((tf * speed + ph) % 1);
        if (flow <= 0 || u > flow * 1.2) return null;
        const x = lerp(from[0], to[0], u) + Math.sin(u * 9 + i) * 40, y = lerp(from[1], to[1], u) + (r() - 0.5) * 380 * u + Math.sin(u * 6 + i) * 30;
        const ice = freeze > 0 ? clamp(freeze * 1.5 - r() * 0.5) : 0;
        return <g key={i} transform={`translate(${x} ${y}) rotate(${(tf * 200 * (r() - 0.5))})`}>
          {ice > 0 && <rect x={-40} y={-40} width={80} height={80} rx={10} fill={M.ice} opacity={0.35 * ice} transform={`rotate(${r() * 40})`} />}
          <circle r={24} fill={ice > 0.5 ? '#bfefff' : M.gold} /><circle r={17} fill={ice > 0.5 ? '#9ad8f0' : M.goldDark} />
          <text y={9} fontFamily={MONT} fontWeight={900} fontSize={24} fill={ice > 0.5 ? '#2a6f8f' : '#3d2a08'} textAnchor="middle">{label}</text>
        </g>;
      })}
    </svg>
  );
};

// ten chains around a ring, streams into the red drain in the middle
export const CHAINS = ['ETH', 'BTC', 'TRON', 'XRP', 'SOL', 'ARB', 'AVAX', 'OP', 'BASE', 'POL'];
export const Network: React.FC<{f: number; fps: number; at: number}> = ({f, fps, at}) => {
  const t = f / fps;
  const cx = SAFE.cx, cy = 800, R = 340;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs><radialGradient id="nw-h" r="0.5"><stop offset="0" stopColor={M.red} stopOpacity="0.8" /><stop offset="1" stopColor={M.red} stopOpacity="0" /></radialGradient></defs>
      <circle cx={cx} cy={cy} r={170 + 10 * Math.sin(t * 5)} fill="url(#nw-h)" />
      <circle cx={cx} cy={cy} r={60} fill="#000" stroke={M.red} strokeWidth={6} />
      {CHAINS.map((c, i) => {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        const p = spring01(f, (at + i * 0.12) * fps, fps, 2.4, 0.5);
        if (p <= 0) return null;
        return <g key={c}>
          <line x1={x} y1={y} x2={cx} y2={cy} stroke={M.gold} strokeOpacity={0.25} strokeWidth={4} />
          {Array.from({length: 4}, (_, k) => { const u = ((t * 0.9 + k / 4 + i * 0.07) % 1); return <circle key={k} cx={lerp(x, cx, u)} cy={lerp(y, cy, u)} r={8 * (1 - u) + 3} fill={M.gold} opacity={1 - u} />; })}
          <g transform={`translate(${x} ${y}) scale(${clamp(p)})`}>
            <circle r={62} fill="#141c30" stroke={M.gold} strokeWidth={4} />
            <text y={12} fontFamily={MONT} fontWeight={900} fontSize={c.length > 3 ? 26 : 32} fill="#fff" textAnchor="middle">{c}</text>
          </g>
        </g>;
      })}
    </svg>
  );
};

// growing bars by year (Lazarus record)
export const Bars: React.FC<{f: number; fps: number; at: number; rows: {year: string; label: string; value: number; text: string; hi?: number}[]}> = ({f, fps, at, rows}) => {
  const t = f / fps;
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <div style={{position: 'absolute', left: SAFE.left + 20, right: 1080 - SAFE.right + 20, top: 820, display: 'flex', flexDirection: 'column', gap: 26}}>
      {rows.map((r, i) => {
        const p = easeOut((t - at - i * 0.35) / 0.6);
        const hi = r.hi !== undefined && t >= r.hi;
        return <div key={i} style={{opacity: clamp(p * 3)}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONT, fontWeight: 800, fontSize: 30, color: hi ? M.gold : '#cfd8ef', marginBottom: 6}}>
            <span>{r.year} · {r.label}</span><span>{r.text}</span></div>
          <div style={{height: 34, borderRadius: 17, background: '#1a2340'}}>
            <div style={{width: `${Math.max(3, (r.value / max) * 100 * p)}%`, height: '100%', borderRadius: 17, background: hi ? M.gold : i === rows.length - 1 ? M.red : '#5b6b8a', boxShadow: hi ? `0 0 24px ${M.gold}` : undefined}} />
          </div>
        </div>;
      })}
    </div>
  );
};

// typed word with a typo: the misspelt letter gets a red ring
export const Typo: React.FC<{t: number; at: number; ringAt: number}> = ({t, at, ringAt}) => {
  const word = 'FANDATION';
  const n = Math.floor(clamp((t - at) / 0.8) * word.length);
  const ring = easeOut((t - ringAt) / 0.35);
  return (
    <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 640, textAlign: 'center'}}>
      <div style={{fontFamily: MONO, fontSize: 30, color: '#6b5f4a', letterSpacing: 4, marginBottom: 20}}>ПЕРЕВОД $20 000 000 · ПОЛУЧАТЕЛЬ:</div>
      <div style={{position: 'relative', display: 'inline-block', fontFamily: MONO, fontSize: 118, color: '#1d1a15', letterSpacing: 6}}>
        {word.slice(0, n)}<span style={{opacity: Math.sin(t * 9) > 0 ? 1 : 0}}>|</span>
        <svg width={170} height={190} style={{position: 'absolute', left: 40, top: -30, overflow: 'visible'}}>
          <ellipse cx={85} cy={95} rx={70} ry={88} fill="none" stroke={M.red} strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} />
        </svg>
      </div>
      <div style={{fontFamily: MONO, fontSize: 52, color: '#2f7a46', marginTop: 30, opacity: clamp((t - ringAt - 0.3) / 0.3)}}>F<span style={{color: M.red}}>OU</span>NDATION ✓</div>
    </div>
  );
};

// shield for "Binance promises to cover the rest"
export const Shield: React.FC<{f: number; fps: number; at: number}> = ({f, fps, at}) => {
  const p = spring01(f, at * fps, fps, 2, 0.5);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: SAFE.cx - 260, top: 380, width: 520, height: 620, opacity: clamp(p * 2), transform: `scale(${0.8 + 0.2 * clamp(p)})`}}>
      <svg width={520} height={620}><path d="M 260 20 L 480 100 L 470 330 C 460 470 360 560 260 600 C 160 560 60 470 50 330 L 40 100 Z" fill="#14305a" stroke={M.gold} strokeWidth={10} /></svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center'}}>
        <Icon name="shield-check" size={110} color={M.gold} stroke={1.6} />
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 78, color: '#fff', marginTop: 10}}>$6,34 МЛРД</div>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 28, color: M.gold, letterSpacing: 3}}>ОТЛОЖЕНО НА ВЫПЛАТЫ</div>
      </div>
    </div>
  );
};

// chat with a "dream job" offer and an attachment
export const Offer: React.FC<{t: number; t0: number; stopAt: number}> = ({t, t0, stopAt}) => {
  const msg = (at: number, children: React.ReactNode, key: string) => {
    const p = easeOut((t - at) / 0.3);
    return p > 0 ? <div key={key} style={{alignSelf: 'flex-start', maxWidth: '86%', background: '#1f2735', borderRadius: '30px 30px 30px 8px', padding: '20px 28px', opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>{children}</div> : null;
  };
  const stop = t >= stopAt;
  return (
    <div style={{position: 'absolute', left: SAFE.cx - 400, top: 220, width: 800, height: 1080, borderRadius: 90, background: '#05070b', boxShadow: `0 0 0 4px ${stop ? '#2f8f5a' : '#2a303c'}, 0 0 ${stop ? 60 : 0}px #2f8f5a`}}>
      <div style={{position: 'absolute', inset: 18, borderRadius: 74, overflow: 'hidden', background: '#0f141d', fontFamily: UI}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 70, height: 120, display: 'flex', alignItems: 'center', gap: 20, padding: '0 34px', background: '#121924', borderBottom: '2px solid #1c2330'}}>
          <div style={{width: 76, height: 76, borderRadius: 38, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="briefcase" size={42} color="#fff" /></div>
          <div><div style={{fontSize: 36, fontWeight: 800, color: '#fff'}}>HR · Crypto Jobs</div><div style={{fontSize: 26, color: '#7d8899'}}>новый контакт</div></div>
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, top: 230, display: 'flex', flexDirection: 'column', gap: 20}}>
          {msg(t0 + 0.2, <div style={{fontSize: 38, color: '#f1f4f9'}}>Здравствуйте! Вы нам идеально подходите.</div>, 'a')}
          {msg(t0 + 0.8, <div style={{fontSize: 38, color: '#f1f4f9'}}>Оклад <b style={{color: M.gold}}>$250 000</b> в год.</div>, 'b')}
          {msg(t0 + 1.4, <div style={{fontSize: 38, color: '#f1f4f9'}}>Откройте тестовое задание:</div>, 'c')}
          {msg(t0 + 1.9, <div style={{display: 'flex', gap: 18, alignItems: 'center'}}><Icon name="file-text" size={64} color={stop ? M.red : '#cfd6e2'} stroke={1.6} />
            <div><div style={{fontSize: 36, fontWeight: 800, color: stop ? M.red : '#fff'}}>offer_task.pdf</div><div style={{fontSize: 26, color: '#7d8899'}}>2,4 МБ</div></div></div>, 'd')}
        </div>
      </div>
    </div>
  );
};
