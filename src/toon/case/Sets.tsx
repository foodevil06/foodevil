// Sets for the case look: night facade with floors lighting up one by one, the hero's polaroid portrait,
// and the dark room seen from below (ceiling lamp that swings and sheds dust on every knock).
import React from 'react';
import {clamp, easeOut, kick, mulberry32, spring01, wobble} from '../lib/anim';
import {C, MONO, MONT} from './Kit';

// floors light up bottom to top between `count[0]` and `count[1]`; the counter plate shows the lit number.
// `ghost`: time when a dim window above the roof flickers on (it should not exist).
export const Facade: React.FC<{f: number; fps: number; floors: number; count: [number, number]; ghost?: number; label: string}> =
  ({f, fps, floors, count, ghost, label}) => {
  const t = f / fps;
  const cols = 4, ww = 96, wh = 84, gx = 46, gy = 34;
  const bw = cols * ww + (cols + 1) * gx, bh = floors * wh + (floors + 1) * gy + 90;
  const bx = 500 - bw / 2, by = 1500 - bh;
  const lit = Math.floor(clamp((t - count[0]) / (count[1] - count[0])) * floors + (t >= count[1] ? 0 : 0.0001));
  const g = ghost !== undefined ? clamp((t - ghost) / 0.15) * (0.55 + 0.45 * (Math.sin(t * 23) > -0.2 ? 1 : 0.2)) : 0;
  const r = mulberry32(4);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="fc-moon" r="0.5"><stop offset="0.35" stopColor="#f3ecd2" stopOpacity="0.5" /><stop offset="1" stopColor="#f3ecd2" stopOpacity="0" /></radialGradient>
        <linearGradient id="fc-wall" x1="0" x2="1"><stop offset="0" stopColor="#1d2538" /><stop offset="1" stopColor="#151b2a" /></linearGradient>
      </defs>
      <circle cx={880} cy={260} r={150} fill="url(#fc-moon)" />
      <circle cx={880} cy={260} r={62} fill="#efe6c8" />
      {/* the window that should not exist: right above the roof */}
      {g > 0 && <g opacity={g}>
        <rect x={bx + gx + (ww + gx) * 2} y={by - gy - wh} width={ww} height={wh} fill={C.window} opacity={0.35} />
        <rect x={bx + gx + (ww + gx) * 2} y={by - gy - wh} width={ww} height={wh} fill="none" stroke="#f6dc9a" strokeWidth={3} opacity={0.5} />
      </g>}
      <rect x={bx} y={by} width={bw} height={bh} fill="url(#fc-wall)" />
      <rect x={bx - 14} y={by - 18} width={bw + 28} height={22} fill="#0f1420" />
      {Array.from({length: floors}, (_, fl) => {
        const y = by + bh - 90 - (fl + 1) * (wh + gy);
        const on = fl < lit;
        const pop = on ? easeOut((t - (count[0] + (fl / floors) * (count[1] - count[0]))) / 0.25) : 0;
        return (
          <g key={fl}>
            {Array.from({length: cols}, (_, c) => {
              const x = bx + gx + c * (ww + gx);
              const warm = 0.75 + r() * 0.25;
              return <rect key={c} x={x} y={y} width={ww} height={wh} rx={3}
                fill={on ? C.window : '#0b0f19'} opacity={on ? 0.35 + 0.65 * pop * warm : 1} />;
            })}
            <text x={bx - 40} y={y + wh / 2 + 16} fontFamily={MONO} fontSize={44} fill="#8d97ad" textAnchor="end" opacity={on ? 1 : 0.25}>{fl + 1}</text>
          </g>
        );
      })}
      {/* door */}
      <rect x={500 - 70} y={by + bh - 150} width={140} height={150} fill="#0a0d15" />
      <rect x={500 - 90} y={by + bh - 170} width={180} height={18} fill="#2a3246" />
      <rect x={0} y={1500} width={1080} height={420} fill="#07090e" />
      {/* counter plate */}
      <g transform="translate(500 245)">
        <rect x={-230} y={-70} width={460} height={150} rx={16} fill="#121827" stroke="#2c3447" strokeWidth={4} />
        <text y={-22} fontFamily={MONT} fontWeight={800} fontSize={30} letterSpacing={8} fill="#8d97ad" textAnchor="middle">{label}</text>
        <text y={58} fontFamily={MONO} fontSize={86} fill="#ffffff" textAnchor="middle">{lit}</text>
      </g>
    </svg>
  );
};

// polaroid head-and-shoulders portrait (our own hero: messy chestnut hair, olive hoodie, tired eyes)
export const Portrait: React.FC<{t: number; scared?: number}> = ({t, scared = 0}) => {
  const blink = Math.abs(Math.sin(t * 0.9)) > 0.985 ? 0.1 : 1;
  const ink = '#1c1a22';
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%">
      <rect width={400} height={400} fill="#3e5370" />
      <rect width={400} height={400} fill="url(#pt-v)" />
      <defs><radialGradient id="pt-v" r="0.7"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient></defs>
      {/* shoulders, hoodie */}
      <path d="M 40 400 C 50 300 120 270 200 270 C 280 270 350 300 360 400 Z" fill="#6b7a3e" stroke={ink} strokeWidth={4} />
      <path d="M 150 278 C 170 320 230 320 250 278" fill="#56632f" stroke={ink} strokeWidth={4} />
      <path d="M 178 300 L 172 360 M 222 300 L 228 360" stroke="#f1efe6" strokeWidth={6} strokeLinecap="round" />
      {/* neck + head */}
      <rect x={176} y={230} width={48} height={50} fill="#e9b98f" stroke={ink} strokeWidth={4} />
      <ellipse cx={128} cy={178} rx={18} ry={24} fill="#e9b98f" stroke={ink} strokeWidth={4} />
      <ellipse cx={272} cy={178} rx={18} ry={24} fill="#e9b98f" stroke={ink} strokeWidth={4} />
      <path d="M 132 160 C 132 90 268 90 268 160 L 266 200 C 260 250 140 250 134 200 Z" fill="#f2c79a" stroke={ink} strokeWidth={4} />
      {/* messy hair */}
      <path d="M 124 168 C 104 92 170 58 214 70 C 262 58 300 104 276 168 C 270 140 254 124 236 120 C 240 134 230 140 222 128 C 212 142 196 146 186 128 C 176 146 156 146 150 132 C 140 140 132 152 124 168 Z"
        fill="#6a3d26" stroke={ink} strokeWidth={4} strokeLinejoin="round" />
      {/* brows, eyes with bags, mouth */}
      <path d={`M 160 ${150 - scared * 8} L 190 ${154 - scared * 4}`} stroke={ink} strokeWidth={7} strokeLinecap="round" />
      <path d={`M 210 ${154 - scared * 4} L 240 ${150 - scared * 8}`} stroke={ink} strokeWidth={7} strokeLinecap="round" />
      {[176, 224].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={176} rx={15 + scared * 3} ry={(13 + scared * 4) * blink} fill="#fff" stroke={ink} strokeWidth={3.5} />
          <circle cx={x + wobble(t * 0.5, x) * 2} cy={177} r={5.5 * Math.max(blink, 0.3) - scared * 1.2} fill={ink} />
          <path d={`M ${x - 13} 196 Q ${x} 202 ${x + 13} 196`} stroke="#c58e6c" strokeWidth={3} fill="none" />
        </g>
      ))}
      <path d="M 196 186 Q 200 204 206 206" stroke="#c58e6c" strokeWidth={4} fill="none" strokeLinecap="round" />
      {scared > 0.5 ? <ellipse cx={200} cy={226} rx={12} ry={9} fill="#5a2a26" stroke={ink} strokeWidth={3} />
        : <path d="M 184 224 Q 200 220 216 224" stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />}
      <path d="M 150 210 l 3 3 M 160 216 l 2 3 M 240 214 l -2 3 M 248 208 l -3 3" stroke="#a87a5a" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
};

// dark room seen from below: ceiling, hanging lamp. Each knock time shakes the lamp and drops dust.
export const Ceiling: React.FC<{f: number; fps: number; knocks: number[]; hideAt?: number}> = ({f, fps, knocks, hideAt = 1e9}) => {
  const t = f / fps;
  const k = knocks.reduce((a, kt) => a + kick(f, kt * fps, fps, 2.2, 3.2), 0);
  const flick = knocks.some((kt) => t > kt && t < kt + 0.12) ? 0.35 : 1;
  const r = mulberry32(11);
  const dust = knocks.flatMap((kt, ki) => Array.from({length: 18}, () => ({kt, x: 380 + r() * 320, v: 300 + r() * 500, s: 2 + r() * 4, d: r() * 0.2, ki})));
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="cl-glow" cx="50%" cy="38%" r="60%"><stop offset="0" stopColor="#f6d79a" stopOpacity={0.55 * flick} /><stop offset="0.5" stopColor="#6b4a2a" stopOpacity={0.25 * flick} /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="#0a0b10" />
      {/* ceiling plane with plaster cracks, perspective lines */}
      <path d="M 0 0 L 1080 0 L 1080 760 L 0 760 Z" fill="#1b1a1f" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${120 + i * 280} 0 L ${200 + i * 230} 760`} stroke="#14131a" strokeWidth={6} />)}
      <path d="M 520 240 l 40 60 l -20 50 l 50 80" stroke="#0d0c12" strokeWidth={4} fill="none" opacity={clamp(knocks.filter((kt) => t > kt).length / 3)} />
      <rect x={0} y={760} width={1080} height={30} fill="#26242b" />
      <rect width={1080} height={1920} fill="url(#cl-glow)" />
      {/* lamp */}
      <g transform={`translate(540 0) rotate(${k * 4 + wobble(t * 0.6, 1) * 0.8})`}>
        <line x1={0} y1={0} x2={0} y2={620} stroke="#0c0c10" strokeWidth={6} />
        <path d="M -150 760 C -130 660 -60 620 0 620 C 60 620 130 660 150 760 Z" fill="#3a3330" stroke="#0c0c10" strokeWidth={6} />
        <ellipse cx={0} cy={760} rx={150} ry={22} fill={flick < 1 ? '#3a3330' : '#f6d79a'} />
        <ellipse cx={0} cy={770} rx={48} ry={26} fill={flick < 1 ? '#555' : '#fff6dc'} />
      </g>
      {dust.map((d, i) => {
        const lt = t - d.kt - d.d;
        if (lt < 0 || lt > 1.6) return null;
        return <circle key={i} cx={d.x + wobble(lt * 2, i) * 14} cy={40 + lt * d.v + lt * lt * 120} r={d.s} fill="#cfc6b8" opacity={0.7 * (1 - lt / 1.6)} />;
      })}
      {/* TUK on each knock */}
      {knocks.map((kt, i) => {
        const p = spring01(f, kt * fps, fps, 3, 0.5);
        if (p <= 0) return null;
        return <text key={i} x={[300, 720, 500][i % 3]} y={[860, 960, 1070][i % 3]} fontFamily={MONT} fontWeight={900} fontSize={130} fill={C.red}
          textAnchor="middle" transform={`rotate(${[-8, 6, -3][i % 3]} ${[300, 720, 500][i % 3]} ${[860, 960, 1070][i % 3]})`}
          opacity={clamp(p * 2) * (1 - clamp((t - kt - 1.4) / 0.4)) * (1 - clamp((t - hideAt) / 0.25))} style={{paintOrder: 'stroke'}} stroke="#0a0b10" strokeWidth={14}>ТУК</text>;
      })}
    </svg>
  );
};
