// Covers and the closing question card for TikTok and YouTube Shorts (the same file goes to both platforms).
// Cover: 1080x1920, everything that matters inside the centre 3:4 crop (y 240-1680) that the profile grid shows, the
// hook in 2-4 words, one word in red; the bottom-left corner stays free for the view counter of the grid.
// EndQuestion: text only (no platform icons — the buttons differ between TikTok and YouTube): a two-way choice to answer
// with one digit in the comments, and a "subscribe, the next part is coming" line.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeOut, mulberry32} from '../lib/anim';
import {MONT, MONO, SAFE} from './Kit';

const RED = '#e23b3b';

// "КТО *СНИМАЛ*?" -> the word in asterisks is red
const Hook: React.FC<{text: string; size: number}> = ({text, size}) => (
  <div style={{fontFamily: MONT, fontWeight: 900, fontSize: size, lineHeight: 1.0, color: '#fff', textAlign: 'center', letterSpacing: 1,
    textShadow: '0 6px 0 rgba(0,0,0,0.65), 0 0 40px rgba(0,0,0,0.9)'}}>
    {text.split(/(\*[^*]+\*)/).map((p, i) => p.startsWith('*') ? <span key={i} style={{color: RED, textShadow: '0 0 30px rgba(226,59,59,0.6), 0 6px 0 rgba(0,0,0,0.65)'}}>{p.slice(1, -1)}</span> : p)}
  </div>
);

// tape noise lines and a red/cyan split (the "found footage" look)
export const Vhs: React.FC<{k?: number; seed?: number}> = ({k = 1, seed = 3}) => {
  const r = mulberry32(seed);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `repeating-linear-gradient(0deg, rgba(255,255,255,${0.035 * k}) 0 2px, rgba(0,0,0,0) 2px 6px)`}} />
      {Array.from({length: 4}, (_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: r() * 1920, height: 2 + r() * 10, background: `rgba(220,230,255,${0.08 * k})`}} />)}
    </AbsoluteFill>
  );
};

export const Cover: React.FC<{art: React.ReactNode; series: string; hook: string; part?: number}> = ({art, series, hook, part}) => (
  <AbsoluteFill style={{background: '#050608'}}>
    <AbsoluteFill style={{filter: 'drop-shadow(5px 0 0 rgba(226,59,59,0.35)) drop-shadow(-5px 0 0 rgba(80,200,255,0.25))'}}>{art}</AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.7) 100%)'}} />
    <Vhs k={1} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: MONO, fontSize: 34, letterSpacing: 6, color: '#e8ecf2', background: 'rgba(0,0,0,0.55)', border: `2px solid ${RED}`, padding: '8px 22px'}}>
        <span style={{color: RED}}>● </span>{series}{part ? ` · ${part}` : ''}</div>
    </div>
    <div style={{position: 'absolute', left: 50, right: 50, top: 400}}><Hook text={hook} size={128} /></div>
  </AbsoluteFill>
);

// the closing card: "Взял бы пакет?" / "1 — ДА · 2 — БЕЖАЛ БЫ" / "пиши цифру в комментариях" / "подпишись — часть 3 скоро"
export const EndQuestion: React.FC<{t: number; at: number; q: string; a: string; b: string; next?: string}> = ({t, at, q, a, b, next}) => {
  const k = (d: number) => easeOut((t - at - d) / 0.4);
  return (
    <AbsoluteFill style={{background: 'rgba(4,5,7,0.9)', alignItems: 'center', justifyContent: 'center', paddingRight: 1080 - 2 * SAFE.cx, paddingBottom: 260}}>
      <div style={{opacity: k(0), transform: `translateY(${(1 - k(0)) * 20}px)`, maxWidth: 860}}><Hook text={q} size={84} /></div>
      <div style={{display: 'flex', gap: 28, marginTop: 50}}>
        {[['1', a], ['2', b]].map(([n, s], i) => <div key={n} style={{opacity: k(0.35 + 0.15 * i), transform: `scale(${0.9 + 0.1 * k(0.35 + 0.15 * i)})`, minWidth: 330,
          border: `4px solid ${i ? '#e8ecf2' : RED}`, borderRadius: 22, padding: '18px 26px', textAlign: 'center', background: 'rgba(0,0,0,0.5)'}}>
          <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 92, color: i ? '#e8ecf2' : RED, lineHeight: 1}}>{n}</div>
          <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 38, color: '#e8ecf2', marginTop: 6}}>{s}</div>
        </div>)}
      </div>
      <div style={{opacity: k(0.7), fontFamily: MONT, fontWeight: 800, fontSize: 40, color: '#aab3c2', marginTop: 44, letterSpacing: 1}}>ПИШИ ЦИФРУ В КОММЕНТАРИЯХ</div>
      {next && <div style={{opacity: k(1.1), fontFamily: MONT, fontWeight: 900, fontSize: 46, color: RED, marginTop: 70, letterSpacing: 3, textAlign: 'center'}}>{next}</div>}
    </AbsoluteFill>
  );
};

// ---------- channel avatars (1080x1080, everything inside the central circle; no text: avatars are tiny) ----------
// the red thread: a red core, darker twist marks and a thin light edge, with a soft glow
const Thread: React.FC<{d: string; w?: number}> = ({d, w = 18}) => (
  <g style={{filter: 'drop-shadow(0 0 14px rgba(226,59,59,0.55))'}}>
    <path d={d} fill="none" stroke={RED} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke="#8e1b1b" strokeWidth={w} strokeLinecap="butt" strokeDasharray="3 10" strokeLinejoin="round" />
    <path d={d} fill="none" stroke="#ff9a9a" strokeWidth={w * 0.18} strokeLinecap="round" opacity={0.7} transform={`translate(${-w * 0.2} ${-w * 0.2})`} />
  </g>
);

// 1) the red thread laid out as a keyhole, cold light on the other side
export const AvatarKeyhole: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #12151b 0%, #060709 70%)'}}>
    <svg width={1080} height={1080} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="kh-light" cx="540" cy="560" r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#bcd2f2" stopOpacity="0.55" /><stop offset="0.6" stopColor="#8fb4ff" stopOpacity="0.12" /><stop offset="1" stopColor="#8fb4ff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="kh-in"><path d="M 440 800 L 640 800 L 596 579 A 150 150 0 1 0 484 579 Z" /></clipPath>
      </defs>
      <g transform="translate(540 600) scale(1.22) translate(-540 -600)">
      <rect width={1080} height={1080} fill="url(#kh-light)" clipPath="url(#kh-in)" />
      <Thread d="M 150 1080 C 250 980 380 900 440 800 L 640 800 L 596 579 A 150 150 0 1 0 484 579 L 432 812 C 420 860 470 900 530 905 C 600 910 640 960 610 1010" />
      </g>
    </svg>
    <Vhs k={0.6} seed={7} />
  </AbsoluteFill>
);

// 2) the wardrobe gap with an eye, the handles tied shut with the red thread
export const AvatarEye: React.FC = () => (
  <AbsoluteFill style={{background: '#0b0a09'}}>
    <svg width={1080} height={1080} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="ae-wl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0e0d0b" /><stop offset="1" stopColor="#2a251f" /></linearGradient>
        <linearGradient id="ae-wr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2a251f" /><stop offset="1" stopColor="#0e0d0b" /></linearGradient>
        <radialGradient id="ae-glow" cx="540" cy="540" r="240" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#bcd2f2" stopOpacity="0.5" /><stop offset="1" stopColor="#bcd2f2" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform="translate(540 560) scale(1.75) translate(-540 -560)">
      <rect x={-400} y={-400} width={900} height={1880} fill="url(#ae-wl)" />
      <rect x={580} y={-400} width={900} height={1880} fill="url(#ae-wr)" />
      <rect x={500} y={-400} width={80} height={1880} fill="#9fb6d8" opacity={0.55} />
      <rect x={500} y={470} width={80} height={140} fill="#030303" />
      <ellipse cx={540} cy={540} rx={36} ry={24} fill="#dcd8ce" />
      <circle cx={540} cy={540} r={15} fill="#111" /><circle cx={545} cy={533} r={4.5} fill="#fff" />
      <circle cx={540} cy={540} r={240} fill="url(#ae-glow)" />
      {[[430, 470], [610, 470]].map(([x, y], i) => <rect key={i} x={x} y={y} width={40} height={220} rx={16} fill="#8a8378" stroke="#2a2620" strokeWidth={4} />)}
      <Thread d="M 450 640 C 520 700 560 700 630 640 C 600 600 560 590 540 620 C 520 650 480 640 450 600 M 630 600 C 680 700 700 820 650 980" w={12} />
      </g>
    </svg>
    <Vhs k={0.6} seed={9} />
  </AbsoluteFill>
);
