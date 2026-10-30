// Hybrid look "Красная нить": the flat, outline-free night world of the survival series (ref 2) seen through
// the case-file props of the mystery (ref 1). Signature device: a red thread that ties evidence together and
// leads the camera from one clue to the next. Everything is screen space 1080x1920, TikTok safe zones from Kit.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, easeOut, mulberry32, spring01, wobble} from '../lib/anim';
import {C, MONO, MONT, SAFE, UI} from './Kit';

export const H = {
  sky0: '#0d1320', sky1: '#1b2740', fog: '#8fa3b8', pine0: '#0f1a1a', pine1: '#16241f', pine2: '#22332b',
  ground: '#1a2620', wall: '#2a3346', wallLit: '#34405a', win: '#f0c56e', winDim: '#141a26',
  map: '#2c3d2c', mapDark: '#223222', road: '#6f7a6a', river: '#2f5a7a', roof: '#7a3b34', thread: '#e0383b',
};

// film grain + vignette on top of every shot (kept light so text stays crisp). The grain is one of four pre-made
// noise tiles (public/fx/grain*.png) jittered per frame: same look as feTurbulence, but nothing to compute per frame.
export const Grain: React.FC<{f: number; k?: number}> = ({f, k = 0.08}) => {
  const r = mulberry32(f * 7 + 1);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{opacity: k * 1.6, mixBlendMode: 'overlay', overflow: 'hidden'}}>
        <Img src={staticFile(`fx/grain${f % 4}.png`)} style={{position: 'absolute', left: -Math.floor(r() * 60), top: -Math.floor(r() * 60), width: 1140, height: 1980, imageRendering: 'pixelated'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 78% 62% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.62) 100%)'}} />
    </AbsoluteFill>
  );
};

// "• НОЧЬ 1 — 03:00" chip at the top of the safe area
export const DayChip: React.FC<{text: string; o?: number}> = ({text, o = 1}) => (
  <div style={{position: 'absolute', left: SAFE.cx, top: SAFE.top + 24, transform: 'translateX(-50%)', opacity: o, fontFamily: MONO, fontSize: 30, color: '#f5d27a',
    background: 'rgba(10,12,18,0.78)', border: '2px solid rgba(245,210,122,0.35)', borderRadius: 10, padding: '6px 18px', whiteSpace: 'nowrap', letterSpacing: 2}}>
    <span style={{color: C.red}}>●</span> {text}
  </div>
);

// data plate: tiny caption over a big value ("КВАРТИР В ДОМЕ / 36")
export const DataChip: React.FC<{f: number; fps: number; at: number; x: number; y: number; label: string; value: string; tone?: 'plain' | 'red' | 'gold'; icon?: string}> =
  ({f, fps, at, x, y, label, value, tone = 'plain', icon}) => {
  const p = spring01(f, at * fps, fps, 2.4, 0.5);
  if (p <= 0) return null;
  const bc = {plain: 'rgba(255,255,255,0.22)', red: C.red, gold: '#f5d27a'}[tone];
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${0.85 + 0.15 * clamp(p)}) translateY(${(1 - clamp(p)) * 20}px)`, opacity: clamp(p * 2), transformOrigin: '0 0',
      background: 'rgba(10,12,18,0.84)', border: `3px solid ${bc}`, borderRadius: 14, padding: '10px 22px 12px', minWidth: 190}}>
      <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: tone === 'red' ? C.red : '#9aa6b8'}}>{label}</div>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 52, color: '#fff', lineHeight: 1.05, display: 'flex', gap: 12, alignItems: 'center'}}>
        {icon && <span style={{color: tone === 'red' ? C.red : '#f5d27a'}}>{icon}</span>}{value}
      </div>
    </div>
  );
};

// night panel house in the flat, outline-free look; layered pines and fog give depth (parallax via `cam`)
export const FlatHouse: React.FC<{t: number; floors: number; lit: (fl: number, c: number) => number; cam?: number; ghost?: number}> =
  ({t, floors, lit, cam = 0, ghost = 0}) => {
  const cols = 4, ww = 80, wh = 72, gx = 40, gy = 30;
  const bw = cols * ww + (cols + 1) * gx, bh = floors * (wh + gy) + gy + 80;
  const bx = SAFE.cx - bw / 2, by = 1450 - bh;
  const r = mulberry32(7);
  const pines = (n: number, y: number, h: number, color: string, shift: number, seed: number) => {
    const rr = mulberry32(seed);
    return <g transform={`translate(${shift} 0)`}>{Array.from({length: n}, (_, i) => {
      const x = -80 + i * (1240 / n) + rr() * 40, hh = h * (0.7 + rr() * 0.5);
      return <path key={i} d={`M ${x} ${y} L ${x + 46} ${y - hh} L ${x + 92} ${y} Z`} fill={color} />;
    })}<rect x={-200} y={y - 2} width={1500} height={600} fill={color} /></g>;
  };
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="fh-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={H.sky0} /><stop offset="1" stopColor={H.sky1} /></linearGradient>
        <linearGradient id="fh-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={H.fog} stopOpacity="0" /><stop offset="1" stopColor={H.fog} stopOpacity="0.32" /></linearGradient>
        <radialGradient id="fh-moon" r="0.5"><stop offset="0.3" stopColor="#efe6c8" stopOpacity="0.35" /><stop offset="1" stopColor="#efe6c8" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#fh-sky)" />
      <g transform={`translate(${cam * -10} 0)`}><circle cx={820} cy={330} r={170} fill="url(#fh-moon)" /><circle cx={820} cy={330} r={58} fill="#e9e1c6" /></g>
      {pines(9, 1260, 300, H.pine2, cam * -20, 3)}
      <rect y={1060} width={1080} height={300} fill="url(#fh-fog)" />
      <g transform={`translate(${cam * -40} 0)`}>
        {ghost > 0 && <rect x={bx + gx + 2 * (ww + gx)} y={by - gy - wh} width={ww} height={wh} fill={H.win} opacity={0.3 * ghost} />}
        <rect x={bx} y={by} width={bw} height={bh} fill={H.wall} />
        <rect x={bx + bw - 26} y={by} width={26} height={bh} fill="#222a3a" />
        <rect x={bx - 10} y={by - 14} width={bw + 20} height={16} fill="#1a2030" />
        {Array.from({length: floors}, (_, fl) => Array.from({length: cols}, (_, c) => {
          const l = lit(fl, c), warm = 0.8 + r() * 0.2;
          const x = bx + gx + c * (ww + gx), y = by + bh - 80 - (fl + 1) * (wh + gy);
          return <g key={`${fl}-${c}`}>
            <rect x={x} y={y} width={ww} height={wh} fill={H.winDim} />
            {l > 0 && <rect x={x} y={y} width={ww} height={wh} fill={H.win} opacity={l * warm} />}
            {l > 0 && <rect x={x - 14} y={y - 10} width={ww + 28} height={wh + 20} fill={H.win} opacity={0.08 * l} />}
          </g>;
        }))}
        <rect x={SAFE.cx - 55} y={by + bh - 120} width={110} height={120} fill="#10141e" />
        <rect x={SAFE.cx - 70} y={by + bh - 136} width={140} height={14} fill="#3a4560" />
      </g>
      {pines(7, 1500, 380, H.pine1, cam * -70, 9)}
      {pines(5, 1640, 460, H.pine0, cam * -120, 21)}
      <rect y={1380} width={1080} height={200} fill="url(#fh-fog)" opacity={0.7 + 0.3 * Math.sin(t * 0.4)} />
    </svg>
  );
};

// top-down map of the district: blocks, roads, river, our house as a pin; `route` draws a dashed path 0..1
export const MapTop: React.FC<{t: number; route?: number; zoom?: number; focus?: [number, number]}> = ({t, route = 0, zoom = 1, focus = [500, 900]}) => {
  const r = mulberry32(13);
  const blocks = Array.from({length: 70}, () => ({x: r() * 1300 - 110, y: r() * 2100 - 90, w: 50 + r() * 70, h: 40 + r() * 60, rot: r() * 20 - 10}));
  const trees = Array.from({length: 160}, () => ({x: r() * 1300 - 110, y: r() * 2100 - 90, s: 14 + r() * 26}));
  const routeD = 'M 500 900 C 560 780 700 700 720 560 C 740 430 640 360 650 250';
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <g transform={`translate(540 960) scale(${zoom}) translate(${-focus[0]} ${-focus[1]})`}>
        <rect x={-600} y={-600} width={2400} height={3200} fill={H.map} />
        {trees.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={i % 3 ? H.mapDark : '#2f4630'} />)}
        <path d="M -200 1250 C 200 1150 500 1350 800 1200 C 1000 1100 1150 1180 1300 1120" stroke={H.river} strokeWidth={46} fill="none" />
        {['M -100 400 C 300 500 700 380 1200 460', 'M 300 -100 C 360 500 420 1300 380 2100', 'M 900 -100 C 820 700 860 1400 760 2100'].map((d, i) =>
          <path key={i} d={d} stroke={H.road} strokeWidth={22} fill="none" opacity={0.85} />)}
        {blocks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={i % 4 ? '#4a4a44' : H.roof} opacity={0.9} transform={`rotate(${b.rot} ${b.x} ${b.y})`} />)}
        <path d={routeD} stroke="#f5d27a" strokeWidth={9} fill="none" strokeDasharray="22 16" pathLength={1000}
          strokeDashoffset={0} style={{opacity: route > 0 ? 1 : 0}} clipPath="url(#mt-rt)" />
        <defs><clipPath id="mt-rt"><rect x={-600} y={900 - route * 700} width={2400} height={route * 700 + 40} /></clipPath></defs>
        {[[500, 900, 'ДОМ', '#f5d27a'], [650, 250, '?', C.red]].map(([x, y, s, c], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r={46 + 6 * Math.sin(t * 3 + i)} fill={c as string} opacity={0.18} />
            <circle r={26} fill={c as string} /><text y={10} fontFamily={MONT} fontWeight={900} fontSize={i ? 30 : 0} fill="#111" textAnchor="middle">{s}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};

// red thread with a gentle sag between pins; `p` 0..1 draws it from a to b
export const Thread: React.FC<{a: [number, number]; b: [number, number]; p: number; sag?: number}> = ({a, b, p, sag = 80}) => {
  if (p <= 0) return null;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + sag;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', pointerEvents: 'none'}}>
      <path d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`} stroke="#000" strokeOpacity={0.35} strokeWidth={8} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform="translate(4 8)" />
      <path d={`M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`} stroke={H.thread} strokeWidth={6} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" />
      {[a, ...(p >= 1 ? [b] : [])].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={14} fill="#b8262a" /><circle cx={x - 4} cy={y - 4} r={5} fill="#ff8a8a" /></g>)}
    </svg>
  );
};

// two case folders to choose from + "Я бы…" comment bubble
export const Choice: React.FC<{f: number; fps: number; at: number; a: string; b: string; t: number}> = ({f, fps, at, a, b, t}) => {
  const pa = spring01(f, at * fps, fps, 2, 0.5), pb = spring01(f, (at + 0.18) * fps, fps, 2, 0.5), pc = spring01(f, (at + 0.6) * fps, fps, 2, 0.6);
  if (pa <= 0) return null;
  const card = (txt: string, tag: string, col: string, p: number, x: number, rot: number) => (
    <div style={{position: 'absolute', left: x, top: 560, width: 390, height: 470, transform: `translateY(${(1 - clamp(p)) * 300}px) rotate(${rot}deg)`, opacity: clamp(p * 2),
      background: `linear-gradient(170deg, ${C.card}, #c9a565)`, borderRadius: '10px 10px 12px 12px', boxShadow: '0 20px 30px rgba(0,0,0,0.5)'}}>
      <div style={{position: 'absolute', left: 0, top: -34, width: 170, height: 40, background: C.card, borderRadius: '10px 10px 0 0'}} />
      <div style={{position: 'absolute', left: 28, top: 26, fontFamily: MONO, fontSize: 30, color: '#3d2f1a', letterSpacing: 3}}>{tag}</div>
      <div style={{position: 'absolute', left: 20, right: 20, top: 150, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 54, lineHeight: 1.08, color: C.ink}}>{txt}</div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, display: 'flex', justifyContent: 'center'}}>
        <div style={{border: `6px solid ${col}`, color: col, fontFamily: MONT, fontWeight: 900, fontSize: 34, padding: '4px 18px', borderRadius: 10, transform: 'rotate(-5deg)'}}>{tag === 'ВАРИАНТ А' ? 'А' : 'Б'}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      {card(a, 'ВАРИАНТ А', '#2f8f5a', pa, SAFE.left + 10, -3)}
      {card(b, 'ВАРИАНТ Б', C.red, pb, SAFE.cx + 20, 3)}
      <div style={{position: 'absolute', left: SAFE.cx - 48, top: 750, width: 96, height: 96, borderRadius: 48, background: '#fff', color: C.ink, fontFamily: MONT, fontWeight: 900,
        fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: clamp(pb * 2), boxShadow: '0 8px 20px rgba(0,0,0,0.5)'}}>ИЛИ</div>
      {pc > 0 && <div style={{position: 'absolute', left: SAFE.cx - 260, top: 1110, width: 520, transform: `scale(${clamp(pc)})`, transformOrigin: '20% 100%',
        background: '#fff', borderRadius: '34px 34px 34px 8px', padding: '22px 30px', fontFamily: UI, fontSize: 40, color: '#333', display: 'flex', justifyContent: 'space-between'}}>
        <span>Я бы…</span><span style={{letterSpacing: 4, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 4))}}>•••</span></div>}
    </AbsoluteFill>
  );
};

// "ЧАСТЬ 2 — УЖЕ СКОРО" + subscribe pill that flips to "ВЫ ПОДПИСАНЫ" with a bell
export const NextPart: React.FC<{f: number; fps: number; at: number; part: number}> = ({f, fps, at, part}) => {
  const p = spring01(f, at * fps, fps, 2, 0.5);
  if (p <= 0) return null;
  const flip = clamp((f / fps - at - 1.2) / 0.25);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingRight: 1080 - 2 * SAFE.cx, paddingBottom: 240, flexDirection: 'column', gap: 18}}>
      <div style={{opacity: clamp(p * 2), transform: `scale(${1.3 - 0.3 * clamp(p)})`, fontFamily: MONT, fontWeight: 900, fontSize: 120, color: '#fff'}}>ЧАСТЬ {part}</div>
      <div style={{width: 300 * clamp(p), height: 8, background: C.red, borderRadius: 4}} />
      <div style={{opacity: clamp(p * 2), fontFamily: MONT, fontWeight: 800, fontSize: 40, color: C.red, letterSpacing: 4}}>УЖЕ СКОРО</div>
      <div style={{marginTop: 80, display: 'flex', gap: 20, alignItems: 'center', opacity: clamp((f / fps - at - 0.5) / 0.3)}}>
        <div style={{background: flip < 0.5 ? C.red : '#3a3f4a', color: '#fff', fontFamily: MONT, fontWeight: 900, fontSize: 40, padding: '20px 44px', borderRadius: 50,
          transform: `scale(${1 - 0.08 * Math.sin(Math.PI * flip)})`}}>{flip < 0.5 ? 'ПОДПИСАТЬСЯ' : 'ВЫ ПОДПИСАНЫ'}</div>
        <div style={{width: 84, height: 84, borderRadius: 42, background: flip < 0.5 ? '#3a3f4a' : '#f5b324', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44,
          transform: `rotate(${flip >= 0.5 ? wobble(f * 0.6, 1) * 14 * Math.exp(-3 * Math.max(0, f / fps - at - 1.45)) : 0}deg)`}}>🔔</div>
      </div>
    </AbsoluteFill>
  );
};

// subtitles in the middle of the frame (ref 2 position): white caps, key word in a colour box (ref 1)
export const MidSubs: React.FC<{words: string[]; on: number; tone?: 'white' | 'yellow' | 'red'; y?: number}> = ({words, on, tone = 'yellow', y = 1240}) => {
  const box = {white: ['#fff', C.ink], yellow: [C.yellow, C.ink], red: [C.red, '#fff']}[tone];
  return (
    <div style={{position: 'absolute', left: SAFE.left, right: 1080 - SAFE.right, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 16px'}}>
      {words.map((w, i) => <span key={i} style={{fontFamily: MONT, fontWeight: 900, fontSize: 86, lineHeight: 1.1, padding: i === on ? '0 14px' : 0, borderRadius: 10,
        background: i === on ? box[0] : 'transparent', color: i === on ? box[1] : '#fff', textShadow: i === on ? undefined : '0 0 3px #000, 0 6px 0 rgba(0,0,0,0.65), 3px 0 0 #000, -3px 0 0 #000, 0 3px 0 #000, 0 -3px 0 #000'}}>{w}</span>)}
    </div>
  );
};

export const fadeIn = (t: number, a: number, d = 0.3) => easeOut((t - a) / d);
