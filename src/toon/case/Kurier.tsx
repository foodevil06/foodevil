// Sets for «Курьер» in the "Красная нить" look: lock screen with stacked notifications and a glowing frame,
// empty order history, courier map with a moving dot, stairwell with a dead lift, peephole view, dark hallway
// with the bedroom door. Screen space 1080x1920, all key content inside SAFE.
import React from 'react';
import {clamp, mulberry32, spring01, wobble} from '../lib/anim';
import {C, MONO, MONT, SAFE, UI} from './Kit';
import {H} from './Hybrid';

const PW = 800, PH = 1150, PX = SAFE.cx - PW / 2, PY = 165;

export type Note = {at: number; app: string; title: string; text: string; color?: string; stars?: boolean};

// phone body shared by lock screen and app screens; `glow` tints the frame (green = trusted, red = danger)
export const Body: React.FC<{t: number; glow?: string; children: React.ReactNode; shake?: number}> = ({t, glow, children, shake = 0}) => (
  <div style={{position: 'absolute', left: PX + wobble(t * 40, 2) * shake * 14, top: PY + wobble(t * 0.6, 4) * 6, width: PW, height: PH, borderRadius: 96, background: '#05070b',
    boxShadow: `0 0 0 4px ${glow ?? '#2a303c'}, 0 0 ${glow ? 70 : 0}px ${glow ?? 'transparent'}, 0 40px 80px rgba(0,0,0,0.6)`}}>
    <div style={{position: 'absolute', inset: 18, borderRadius: 80, overflow: 'hidden', background: '#0e1320', fontFamily: UI}}>{children}</div>
    <div style={{position: 'absolute', left: PW / 2 - 100, top: 30, width: 200, height: 54, borderRadius: 27, background: '#000'}} />
  </div>
);

export const LockScreen: React.FC<{f: number; fps: number; time: string; date: string; notes: Note[]; glow?: string; shake?: number}> =
  ({f, fps, time, date, notes, glow, shake}) => {
  const t = f / fps;
  const shown = notes.filter((n) => t >= n.at).reverse();  // newest on top
  return (
    <Body t={t} glow={glow} shake={shake}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 70%, #23314f 0, transparent 35%), radial-gradient(circle at 75% 35%, #1e2a44 0, transparent 30%), #0b0f19'}} />
      <div style={{position: 'absolute', left: 60, top: 44, fontSize: 30, fontWeight: 700, color: '#cfd6e2'}}>{time}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontSize: 190, fontWeight: 800, color: '#e8edf5', letterSpacing: -4}}>{time}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontSize: 36, color: '#9aa6b8'}}>{date}</div>
      <div style={{position: 'absolute', left: 30, right: 30, top: 470, display: 'flex', flexDirection: 'column', gap: 18}}>
        {shown.map((n, i) => {
          const p = spring01(f, n.at * fps, fps, 2.2, 0.55);
          return (
            <div key={n.at} style={{background: 'rgba(30,36,50,0.92)', borderRadius: 34, padding: '24px 28px', transform: `translateY(${(1 - clamp(p)) * -80}px) scale(${0.92 + 0.08 * clamp(p)})`,
              opacity: clamp(p * 2) * (i > 2 ? 0 : 1), border: `2px solid ${(n.color ?? '#ffffff') + '33'}`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10}}>
                <div style={{width: 48, height: 48, borderRadius: 12, background: n.color ?? '#f5b324', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28}}>🛍</div>
                <div style={{fontSize: 28, fontWeight: 700, color: '#cfd6e2', flex: 1}}>{n.app}</div>
                <div style={{fontSize: 26, color: '#7d8899'}}>сейчас</div>
              </div>
              <div style={{fontSize: 36, fontWeight: 800, color: '#fff'}}>{n.title}</div>
              <div style={{fontSize: 34, color: '#d6dbe4', marginTop: 4, lineHeight: 1.25}}>{n.text}</div>
              {n.stars && <div style={{fontSize: 52, color: '#f5b324', marginTop: 10, letterSpacing: 6}}>★★★★★</div>}
            </div>
          );
        })}
      </div>
    </Body>
  );
};

// delivery app: "Мои заказы" with nothing in it
export const OrdersEmpty: React.FC<{t: number}> = ({t}) => (
  <Body t={t}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 100, padding: '0 50px', fontSize: 54, fontWeight: 800, color: '#fff'}}>Мои заказы</div>
    <div style={{position: 'absolute', left: 50, right: 50, top: 190, display: 'flex', gap: 16}}>
      {['Активные', 'Завершённые'].map((s, i) => <div key={s} style={{padding: '12px 26px', borderRadius: 30, fontSize: 30, fontWeight: 700,
        background: i ? '#1c2432' : '#f5b324', color: i ? '#9aa6b8' : '#111'}}>{s}</div>)}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center'}}>
      <div style={{fontSize: 150, opacity: 0.35}}>🛍</div>
      <div style={{fontSize: 44, fontWeight: 800, color: '#e8edf5', marginTop: 20}}>Здесь пока пусто</div>
      <div style={{fontSize: 32, color: '#7d8899', marginTop: 12}}>Вы ещё ничего не заказывали</div>
    </div>
  </Body>
);

// courier map: route as a polyline, dot moves by `p` (0..1); `zoom` closes in on the house at the end
const ROUTE: [number, number][] = [[150, 1500], [260, 1380], [300, 1180], [470, 1060], [520, 860], [640, 760], [700, 620], [560, 560]];
const along = (p: number): [number, number] => {
  const seg = ROUTE.slice(1).map((b, i) => Math.hypot(b[0] - ROUTE[i][0], b[1] - ROUTE[i][1]));
  let d = clamp(p) * seg.reduce((a, b) => a + b, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) { const k = d / seg[i], a = ROUTE[i], b = ROUTE[i + 1]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
    d -= seg[i];
  }
  return ROUTE[ROUTE.length - 1];
};
export const CourierMap: React.FC<{t: number; p: number; zoom?: number; danger?: number}> = ({t, p, zoom = 1, danger = 0}) => {
  const r = mulberry32(5);
  const blocks = Array.from({length: 80}, () => ({x: r() * 1200 - 60, y: r() * 2000 - 40, w: 50 + r() * 70, h: 40 + r() * 60}));
  const trees = Array.from({length: 150}, () => ({x: r() * 1200 - 60, y: r() * 2000 - 40, s: 12 + r() * 24}));
  const [dx, dy] = along(p);
  const home = ROUTE[ROUTE.length - 1];
  const fx = home[0] + (dx - home[0]) * (1 - (zoom - 1)), fy = home[1] + (dy - home[1]) * (1 - (zoom - 1));
  const pts = ROUTE.map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <g transform={`translate(${SAFE.cx} 820) scale(${zoom}) translate(${-(zoom > 1 ? fx : SAFE.cx)} ${-(zoom > 1 ? fy : 820)})`}>
        <rect x={-500} y={-500} width={2200} height={3000} fill={H.map} />
        {trees.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={q.s} fill={i % 3 ? H.mapDark : '#2f4630'} />)}
        <path d="M -100 1700 C 300 1600 600 1800 1200 1640" stroke={H.river} strokeWidth={44} fill="none" />
        {['M -100 1250 C 300 1300 700 1180 1200 1260', 'M 300 -100 C 260 600 330 1300 260 2100', 'M 760 -100 C 700 700 760 1300 680 2100', 'M -100 700 C 400 760 800 640 1200 700'].map((d, i) =>
          <path key={i} d={d} stroke={H.road} strokeWidth={20} fill="none" opacity={0.8} />)}
        {blocks.map((b, i) => <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={i % 4 ? '#4a4a44' : H.roof} opacity={0.85} />)}
        <polyline points={pts} stroke="#000" strokeOpacity={0.35} strokeWidth={14} fill="none" />
        <polyline points={pts} stroke="#f5d27a" strokeWidth={9} fill="none" strokeDasharray="22 14" strokeDashoffset={-t * 40} />
        <g transform={`translate(${home[0]} ${home[1]})`}>
          <circle r={60 + 8 * Math.sin(t * 4)} fill={danger ? C.red : '#f5d27a'} opacity={0.2} />
          <rect x={-34} y={-34} width={68} height={68} rx={12} fill={danger ? C.red : '#f5d27a'} />
          <path d="M -20 4 L 0 -16 L 20 4 V 20 H -20 Z" fill="#111" />
        </g>
        <g transform={`translate(${dx} ${dy})`}>
          <circle r={44 + 10 * Math.sin(t * 6)} fill="#fff" opacity={0.18} />
          <circle r={26} fill="#fff" /><circle r={16} fill={C.red} />
        </g>
      </g>
    </svg>
  );
};

// stairwell on the 9th floor: flat, no outlines; lift doors with a taped sign; empty steps going down
export const Stairwell: React.FC<{t: number; flicker?: boolean}> = ({t, flicker = true}) => {
  const lamp = flicker && Math.sin(t * 17) > 0.93 ? 0.45 : 1;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="sw-l" cx="50%" cy="22%" r="70%"><stop offset="0" stopColor="#d9c99a" stopOpacity={0.45 * lamp} /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="#1b2130" />
      <rect y={1150} width={1080} height={770} fill="#141924" />
      <rect x={120} y={380} width={300} height={770} fill="#2a3246" />
      <rect x={150} y={420} width={115} height={730} fill="#5a6378" /><rect x={275} y={420} width={115} height={730} fill="#525b70" />
      <rect x={190} y={560} width={160} height={110} fill="#efe6c8" transform="rotate(-4 270 615)" />
      <text x={270} y={605} fontFamily={MONO} fontSize={26} fill="#222" textAnchor="middle" transform="rotate(-4 270 615)">ЛИФТ</text>
      <text x={270} y={645} fontFamily={MONO} fontSize={22} fill={C.red} textAnchor="middle" transform="rotate(-4 270 615)">НЕ РАБОТАЕТ</text>
      <rect x={140} y={330} width={260} height={40} fill="#0f131c" /><text x={270} y={360} fontFamily={MONO} fontSize={30} fill="#7a1f1f" textAnchor="middle">— 9 —</text>
      {Array.from({length: 8}, (_, i) => <rect key={i} x={560 + i * 46} y={1150 + i * 60} width={420} height={60} fill={i % 2 ? '#1d2331' : '#232a3a'} />)}
      <path d="M 560 1100 L 960 1100 L 1000 1600" stroke="#3a4560" strokeWidth={10} fill="none" />
      <rect x={640} y={420} width={260} height={600} fill="#3a2a22" /><circle cx={870} cy={740} r={10} fill="#c8a868" />
      <text x={770} y={500} fontFamily={MONO} fontSize={40} fill="#c8a868" textAnchor="middle">36</text>
      <rect width={1080} height={1920} fill="url(#sw-l)" />
      <rect x={500} y={0} width={80} height={60} fill="#0f131c" /><ellipse cx={540} cy={70} rx={50} ry={16} fill="#efe2b0" opacity={lamp} />
    </svg>
  );
};

// what you see through the peephole: barrel-warped empty landing inside a dark circle
export const Peephole: React.FC<{t: number}> = ({t}) => {
  const cx = SAFE.cx, cy = 820, R = 380;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <clipPath id="ph-c"><circle cx={cx} cy={cy} r={R} /></clipPath>
        <radialGradient id="ph-v" r="0.5"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.95" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="#05060a" />
      <g clipPath="url(#ph-c)" transform={`translate(${wobble(t * 0.5, 3) * 6} 0)`}>
        <rect x={cx - R} y={cy - R} width={2 * R} height={2 * R} fill="#1d2433" />
        <ellipse cx={cx} cy={cy + 420} rx={560} ry={260} fill="#141924" />
        {[-1, 1].map((s) => <path key={s} d={`M ${cx + s * 140} ${cy - 220} Q ${cx + s * 330} ${cy} ${cx + s * 150} ${cy + 240} L ${cx + s * 60} ${cy + 220} Q ${cx + s * 170} ${cy} ${cx + s * 70} ${cy - 200} Z`} fill={s > 0 ? '#3a2a22' : '#2e3446'} />)}
        <path d={`M ${cx - 70} ${cy - 200} Q ${cx} ${cy - 230} ${cx + 70} ${cy - 200} L ${cx + 60} ${cy + 220} Q ${cx} ${cy + 240} ${cx - 60} ${cy + 220} Z`} fill="#2a3246" />
        <ellipse cx={cx} cy={cy - 300} rx={36} ry={14} fill="#efe2b0" opacity={0.9} />
        <circle cx={cx} cy={cy - 260} r={240} fill="#efe2b0" opacity={0.06} />
      </g>
      <circle cx={cx} cy={cy} r={R} fill="url(#ph-v)" />
      <circle cx={cx} cy={cy} r={R + 4} fill="none" stroke="#2a2a30" strokeWidth={14} />
    </svg>
  );
};

// dark hallway, hero from behind, bedroom door with a strip of light; `shadow` 0..1 sweeps a shadow through the strip
export const Hallway: React.FC<{t: number; shadow: number; light?: number}> = ({t, shadow, light = 1}) => {
  const sx = 360 + 360 * clamp(shadow);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="hw-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9c77a" stopOpacity={0.35 * light} /><stop offset="1" stopColor="#e9c77a" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="#0b0e15" />
      <path d="M 0 0 L 300 380 L 780 380 L 1080 0 Z" fill="#10141d" />
      <path d="M 0 1920 L 300 1180 L 780 1180 L 1080 1920 Z" fill="#0e121a" />
      <rect x={300} y={380} width={480} height={800} fill="#131926" />
      <rect x={380} y={460} width={320} height={700} fill="#1c2232" />
      <rect x={380} y={1150} width={320} height={10} fill="#e9c77a" opacity={light} />
      <rect x={sx} y={1150} width={70} height={10} fill="#0b0e15" opacity={shadow > 0 && shadow < 1 ? 1 : 0} />
      <path d="M 380 1160 L 700 1160 L 820 1400 L 260 1400 Z" fill="url(#hw-f)" />
      <circle cx={660} cy={820} r={10} fill="#5a6378" />
      {/* hero from behind: round head, hood, shoulders */}
      <g transform={`translate(${SAFE.cx} ${1230 + Math.sin(t * 1.6) * 3}) scale(0.9)`}>
        <path d="M -260 520 C -250 300 -170 200 0 200 C 170 200 250 300 260 520 Z" fill="#1d2433" />
        <circle cx={0} cy={60} r={150} fill="#232a3a" />
        <path d="M -150 60 C -150 -60 150 -60 150 60 C 120 0 -120 0 -150 60 Z" fill="#161b27" />
      </g>
    </svg>
  );
};

// ECG line for the pulse chip
export const Ecg: React.FC<{t: number; x: number; y: number; w?: number; color?: string}> = ({t, x, y, w = 300, color = C.red}) => {
  const pts = Array.from({length: 60}, (_, i) => {
    const u = (i / 60 + t * 0.9) % 1, beat = u > 0.45 && u < 0.55 ? Math.sin((u - 0.45) * Math.PI * 20) * 36 : 0;
    return `${x + (i / 59) * w},${y - beat}`;
  }).join(' ');
  return <svg width={1080} height={1920} style={{position: 'absolute', pointerEvents: 'none'}}><polyline points={pts} stroke={color} strokeWidth={4} fill="none" /></svg>;
};

