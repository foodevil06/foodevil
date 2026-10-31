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
