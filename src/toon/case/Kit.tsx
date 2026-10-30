// "Case file" look (STYLE-CARD.md): dark desk or night backdrop, paper props, tilted stamps, big clock,
// and subtitles of 1-3 words with the spoken word in a coloured box. All screen space, vertical 1080x1920.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont as loadMont} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadMono} from '@remotion/google-fonts/PTMono';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadHand} from '@remotion/google-fonts/Caveat';
import {clamp, easeOut, mulberry32, spring01, wobble} from '../lib/anim';
import {VLine} from '../ui/Captions';

export const {fontFamily: MONT} = loadMont('normal', {weights: ['800', '900'], subsets: ['cyrillic', 'latin']});
export const {fontFamily: MONO} = loadMono('normal', {weights: ['400'], subsets: ['cyrillic', 'latin']});
export const {fontFamily: UI} = loadInter('normal', {weights: ['400', '700', '800'], subsets: ['cyrillic', 'latin']});
export const {fontFamily: HAND} = loadHand('normal', {weights: ['700'], subsets: ['cyrillic', 'latin']});

// TikTok covers these strips of a 1080x1920 frame with its own UI (top tabs, right buttons, caption + music at the bottom).
// Keep text and key props inside SAFE; draw <SafeZones /> on top to check stills.
export const SAFE = {left: 60, right: 940, top: 150, bottom: 1500, cx: 500};
export const SafeZones: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {[{left: 0, top: 0, width: 1080, height: SAFE.top}, {left: 0, top: SAFE.bottom, width: 1080, height: 1920 - SAFE.bottom},
      {left: SAFE.right, top: SAFE.top, width: 1080 - SAFE.right, height: SAFE.bottom - SAFE.top}, {left: 0, top: SAFE.top, width: SAFE.left, height: SAFE.bottom - SAFE.top}]
      .map((r, i) => <div key={i} style={{position: 'absolute', ...r, background: 'rgba(255,40,80,0.28)', outline: '2px dashed rgba(255,80,120,0.9)'}} />)}
  </AbsoluteFill>
);

export const C = {
  night: '#0b0f17', night2: '#141a26', paper: '#f3ecdc', paperShade: '#e2d8c2', card: '#d8b878', wood: '#5a3e28',
  ink: '#16181f', red: '#e23b3b', yellow: '#f5b324', window: '#e9c77a', blue: '#3b82f6',
};

// warm desk under a single lamp: wood grain, strong vignette, floating dust
export const Desk: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 55% at 50% 42%, #7a5636 0%, ${C.wood} 38%, #24170e 78%, #0d0805 100%)`}}>
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.22}}>
      {Array.from({length: 26}, (_, i) => (
        <path key={i} d={`M -20 ${i * 76 + 20} C 300 ${i * 76 + 20 + wobble(i, 1) * 30} 700 ${i * 76 + 20 - wobble(i, 4) * 30} 1100 ${i * 76 + 24}`}
          stroke="#1c120a" strokeWidth={2 + (i % 3)} fill="none" />
      ))}
    </svg>
    <Dust t={t} seed={3} color="#ffe2b0" />
  </AbsoluteFill>
);

// cold night backdrop for the phone and the house
export const Night: React.FC<{t: number; stars?: boolean}> = ({t, stars = true}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 60% at 50% 40%, #1b2333 0%, ${C.night2} 45%, ${C.night} 100%)`}}>
    {stars && <Dust t={t} seed={9} color="#c9d6ff" n={60} />}
  </AbsoluteFill>
);

export const Dust: React.FC<{t: number; seed: number; color: string; n?: number}> = ({t, seed, color, n = 40}) => {
  const r = mulberry32(seed);
  const pts = Array.from({length: n}, () => ({x: r() * 1080, y: r() * 1920, s: 1.5 + r() * 3.5, v: 6 + r() * 14, p: r() * 10}));
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {pts.map((p, i) => (
        <circle key={i} cx={p.x + wobble(t * 0.4, p.p) * 30} cy={(p.y - t * p.v + 1920 * 4) % 1920} r={p.s}
          fill={color} opacity={0.18 + 0.2 * (0.5 + 0.5 * Math.sin(t * 1.3 + p.p))} />
      ))}
    </svg>
  );
};

// a piece of paper that slides up and settles with a small spring; children are laid out inside
export const Paper: React.FC<{f: number; fps: number; at: number; x: number; y: number; w: number; h: number; rot?: number;
  torn?: boolean; tape?: boolean; color?: string; from?: number; children?: React.ReactNode}> =
  ({f, fps, at, x, y, w, h, rot = 0, torn, tape, color = C.paper, from = 500, children}) => {
  const p = spring01(f, at * fps, fps, 1.6, 0.55);
  if (p <= 0) return null;
  const tornEdge = torn ? `polygon(0 3%, 6% 0, 14% 2%, 22% 0, 31% 2.5%, 40% 0.5%, 50% 2%, 60% 0, 70% 2.5%, 80% 0.5%, 90% 2%, 100% 0, 100% 100%, 0 100%)` : undefined;
  return (
    <div style={{position: 'absolute', left: x, top: y + (1 - p) * from, width: w, height: h, opacity: clamp(p * 3),
      transform: `rotate(${rot + (1 - p) * 6}deg)`, filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.45))'}}>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(170deg, ${color} 0%, ${color} 70%, ${C.paperShade} 100%)`, clipPath: tornEdge, borderRadius: torn ? 0 : 6}} />
      {tape && <div style={{position: 'absolute', left: w / 2 - 90, top: -26, width: 180, height: 52, background: 'rgba(238,226,180,0.72)', transform: 'rotate(-3deg)'}} />}
      <div style={{position: 'absolute', inset: 0}}>{children}</div>
    </div>
  );
};

// tilted sticker plate: "ПРАВИЛО №1" style. kind: paper (dark text on paper) or red (white on red)
export const Stamp: React.FC<{f: number; fps: number; at: number; x: number; y: number; text: string; kind?: 'paper' | 'red' | 'outline';
  rot?: number; size?: number}> = ({f, fps, at, x, y, text, kind = 'paper', rot = -5, size = 56}) => {
  const p = spring01(f, at * fps, fps, 2.4, 0.4);
  if (p <= 0) return null;
  const st = kind === 'red' ? {background: C.red, color: '#fff'}
    : kind === 'outline' ? {background: 'transparent', color: C.red, border: `7px solid ${C.red}`, borderRadius: 14}
    : {background: C.paper, color: C.ink};
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${2 - p})`, opacity: clamp(p * 2),
      fontFamily: MONT, fontWeight: 900, fontSize: size, letterSpacing: 1, padding: '10px 26px', whiteSpace: 'nowrap',
      boxShadow: kind === 'outline' ? undefined : '0 10px 18px rgba(0,0,0,0.4)', ...st}}>{text}</div>
  );
};

// red hand-drawn ring that draws itself around something
export const Ring: React.FC<{f: number; fps: number; at: number; x: number; y: number; rx: number; ry: number}> = ({f, fps, at, x, y, rx, ry}) => {
  const p = easeOut((f - at * fps) / (0.45 * fps));
  if (p <= 0) return null;
  const len = 2 * Math.PI * Math.max(rx, ry) * 1.15;
  return (
    <svg style={{position: 'absolute', left: x - rx - 20, top: y - ry - 20, overflow: 'visible'}} width={rx * 2 + 40} height={ry * 2 + 40}>
      <path d={`M ${rx * 2 + 10} ${ry + 14} C ${rx * 2 + 24} ${-ry * 0.2} ${10} ${-4} ${12} ${ry + 20} C ${14} ${ry * 2 + 40} ${rx * 2 + 30} ${ry * 2 + 34} ${rx * 2 + 18} ${ry * 0.5}`}
        fill="none" stroke={C.red} strokeWidth={7} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </svg>
  );
};

// big monospace clock, the rhythm marker of the genre
export const BigClock: React.FC<{time: string; y?: number; size?: number; o?: number}> = ({time, y = 180, size = 200, o = 1}) => (
  <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: y, textAlign: 'center', fontFamily: MONO, fontSize: size, color: '#fff', opacity: o,
    letterSpacing: 10, textShadow: '0 0 40px rgba(255,255,255,0.25)'}}>{time}</div>
);

// subtitles: the current phrase in chunks of 1-4 words, up to ~16 letters (break after punctuation); the spoken word sits in a box.
// tone per line: 'white' | 'yellow' | 'red'. `y` is the bottom edge: a second line grows upwards, never into the TikTok caption strip.
export const CaseSubs: React.FC<{lines: VLine[]; f: number; fps: number; total: number; tone?: (i: number) => 'white' | 'yellow' | 'red'; y?: number}> =
  ({lines, f, fps, total, tone = () => 'white', y = SAFE.bottom - 20}) => {
  const t = f / fps;
  const li = lines.findIndex((l, i) => t >= l.start - 0.06 && t < (i + 1 < lines.length ? lines[i + 1].start - 0.06 : total));
  if (li < 0) return null;
  const line = lines[li];
  const chunks: number[][] = [[]];
  line.words.forEach((w, i) => {
    const cur = chunks[chunks.length - 1];
    cur.push(i);
    const next = line.words[i + 1];
    const chars = cur.reduce((a, k) => a + line.words[k].w.length + 1, 0);
    if (next && (cur.length >= 4 || chars + next.w.length > 16 || /[,.:?!»]$/.test(w.w))) chunks.push([]);
  });
  let wi = 0;
  line.words.forEach((w, i) => { if (t >= w.t - 0.04) wi = i; });
  const chunk = chunks.find((c) => c.includes(wi))!;
  const box = {white: ['#ffffff', C.ink], yellow: [C.yellow, C.ink], red: [C.red, '#ffffff']}[tone(li)];
  const pop = spring01(f, line.words[wi].t * fps - 1, fps, 3.4, 0.55);
  const lastWord = line.words.length - 1 === wi;
  const fade = lastWord ? 1 - clamp((t - line.end - 0.25) / 0.2) : 1;
  return (
    <div style={{position: 'absolute', left: SAFE.left, right: 1080 - SAFE.right, bottom: 1920 - y, display: 'flex', justifyContent: 'center', alignContent: 'flex-end', flexWrap: 'wrap', gap: '6px 18px', opacity: fade}}>
      {chunk.map((i) => {
        const on = i === wi, said = i <= wi;
        return (
          <span key={i} style={{fontFamily: MONT, fontWeight: 900, fontSize: 88, lineHeight: 1.12, textTransform: 'uppercase',
            padding: on ? '0 16px' : '0 2px', borderRadius: 10, background: on ? box[0] : 'transparent',
            color: on ? box[1] : '#ffffff', opacity: said ? 1 : 0.92,
            WebkitTextStroke: on ? undefined : `3px ${C.ink}`, paintOrder: 'stroke fill',
            textShadow: on ? undefined : `0 0 2px ${C.ink}, 0 6px 0 rgba(0,0,0,0.6), 4px 0 0 ${C.ink}, -4px 0 0 ${C.ink}, 0 4px 0 ${C.ink}, 0 -4px 0 ${C.ink}`,
            boxShadow: on ? '0 8px 0 rgba(0,0,0,0.45)' : undefined,
            transform: on ? `scale(${0.86 + 0.14 * pop}) rotate(${(1 - pop) * -2}deg)` : undefined, display: 'inline-block'}}>{line.words[i].w}</span>
        );
      })}
    </div>
  );
};

// slow push-in + breathing drift for a whole scene
export const Push: React.FC<{t: number; t0: number; k?: number; children: React.ReactNode; shake?: number}> = ({t, t0, k = 0.035, children, shake = 0}) => {
  const lt = t - t0;
  const s = 1 + k * clamp(lt / 6) + 0.004 * Math.sin(lt * 0.8);
  const sx = wobble(t * 30, 2) * shake * 14, sy = wobble(t * 27, 5) * shake * 14;
  return <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${s})`, transformOrigin: '50% 45%'}}>{children}</AbsoluteFill>;
};
