// Sets and overlays for «Что будет, если не спать 7 дней?». The room is drawn in world coordinates and filmed by
// `WorldCam`, so the same drawing gives the wide shot, the medium shot, the close-up and the eyes. Every value is a pure
// function of time (no timers, no random per render: `mulberry32` with fixed seeds).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, mulberry32, wobble} from '../lib/anim';
import {MONT, MONO, SAFE} from '../case/Kit';
import {mixColor} from './Hero';

export const SC = {red: '#e5484d', gold: '#f2c14e', ink: '#0d0f14', screen: '#9fc3ff', lamp: '#ffcf8a', paper: '#f6e7a1'};

// ---------- camera: world -> frame. cx, cy = the world point in the centre of the frame, z = zoom ----------
export type Cam = {cx: number; cy: number; z: number; rot?: number};
export const camAt = (t: number, keys: [number, Cam][], ease = easeInOut): Cam => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, A] = keys[i], [b, B] = keys[i + 1];
    if (t < b) { const k = ease((t - a) / (b - a)); return {cx: lerp(A.cx, B.cx, k), cy: lerp(A.cy, B.cy, k), z: lerp(A.z, B.z, k), rot: lerp(A.rot ?? 0, B.rot ?? 0, k)}; }
  }
  return keys[keys.length - 1][1];
};
// a hand-held drift that grows with tiredness (k 0..1), in frame pixels
export const drift = (t: number, k: number, seed = 0): Cam => ({cx: wobble(t * 0.7, seed) * 14 * k, cy: wobble(t * 0.55, seed + 3) * 10 * k, z: 0, rot: wobble(t * 0.4, seed + 7) * 0.6 * k});
export const WorldCam: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <svg width={1080} height={1920} style={{position: 'absolute'}}>
    <g transform={`translate(540 960) rotate(${cam.rot ?? 0}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>{children}</g>
  </svg>
);

// ---------- the room (world coordinates; the hero sits at x 560, neck at y 1070) ----------
export type RoomLook = {
  wall: string; wallpaper: number; wave: number; t: number;  // wave 0..1: the pattern starts to crawl (artistic metaphor)
  sky: number;                     // 0 evening, 1 deep night, 2 dawn
  cityLights: number; lamp: number; screen: number; screenTint?: string;
  clock: number;                   // hours as a float (3.5 = 03:30)
  notes: number; cans: number; bedTidy?: number; laptop?: 'open' | 'closed';
};
const GLOW = (id: string, c: string, o: number) => <radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity={o} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient>;

export const Room: React.FC<{L: RoomLook; hero: React.ReactNode; front?: React.ReactNode}> = ({L, hero, front}) => {
  const r = mulberry32(7);
  const sky = L.sky <= 1 ? [mixColor('#3a2d55', '#0b1020', L.sky), mixColor('#c46f6a', '#16203a', L.sky)] : [mixColor('#0b1020', '#4a6fa5', L.sky - 1), mixColor('#16203a', '#f2b27a', L.sky - 1)];
  const ang = (L.clock % 12) / 12 * 360, mang = (L.clock % 1) * 360;
  return (
    <g>
      <defs>
        <linearGradient id="sl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
        {GLOW('sl-lamp', SC.lamp, 0.55)}{GLOW('sl-scr', L.screenTint ?? SC.screen, 0.6)}{GLOW('sl-dawn', '#ffcf8a', 0.5)}
      </defs>
      <rect x={-600} y={-600} width={2400} height={3200} fill={L.wall} />
      {/* wallpaper: thin vertical vines with dots; `wave` makes them crawl */}
      <g opacity={L.wallpaper} stroke="#000" strokeOpacity={0.22} fill="none" strokeWidth={4}>
        {Array.from({length: 19}, (_, i) => {
          const x0 = -520 + i * 120;
          const pts = Array.from({length: 26}, (_, j) => {
            const y = -560 + j * 80;
            const dx = Math.sin(j * 0.9 + i) * 10 + L.wave * Math.sin(L.t * 2.3 + j * 0.55 + i * 1.7) * 26;
            return `${x0 + dx} ${y}`;
          });
          return <g key={i}><path d={`M ${pts.join(' L ')}`} />{pts.filter((_, j) => j % 2 === 0).map((p, j) => { const [px, py] = p.split(' ').map(Number); return <circle key={j} cx={px + 14} cy={py + 20} r={6} fill="#000" fillOpacity={0.18} stroke="none" />; })}</g>;
        })}
      </g>
      {/* window with the city */}
      <rect x={30} y={290} width={400} height={580} rx={10} fill="#1c2029" />
      <rect x={50} y={310} width={360} height={540} fill="url(#sl-sky)" />
      {L.sky > 1 && <circle cx={320} cy={760} r={140} fill="url(#sl-dawn)" opacity={L.sky - 1} />}
      {[[50, 620, 90, 230], [140, 560, 80, 290], [220, 650, 110, 200], [330, 590, 80, 260]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={mixColor('#0d1220', '#2a3550', L.sky > 1 ? L.sky - 1 : 0)} />)}
      {Array.from({length: 26}, (_, i) => { const x = 60 + r() * 330, y = 580 + r() * 240, on = r() < L.cityLights; return on ? <rect key={i} x={x} y={y} width={12} height={10} fill="#ffd58a" opacity={0.85} /> : null; })}
      <rect x={224} y={310} width={12} height={540} fill="#1c2029" /><rect x={50} y={570} width={360} height={12} fill="#1c2029" />
      {/* poster: a planet */}
      <rect x={720} y={250} width={190} height={250} rx={6} fill="#22324f" stroke="#0e1420" strokeWidth={6} />
      <circle cx={815} cy={360} r={56} fill="#e0805d" /><ellipse cx={815} cy={360} rx={88} ry={16} fill="none" stroke="#f2c14e" strokeWidth={6} />
      {/* wall clock */}
      <g transform="translate(860 660)">
        <circle r={82} fill="#f3eee4" stroke="#0e1014" strokeWidth={10} />
        {Array.from({length: 12}, (_, i) => <rect key={i} x={-3} y={-72} width={6} height={14} fill="#2b2b2b" transform={`rotate(${i * 30})`} />)}
        <rect x={-5} y={-44} width={10} height={50} rx={5} fill="#16181c" transform={`rotate(${ang})`} />
        <rect x={-3.5} y={-64} width={7} height={70} rx={3} fill="#16181c" transform={`rotate(${mang})`} />
        <circle r={8} fill={SC.red} />
      </g>
      {/* shelf and bed on the right (seen in the wide shot) */}
      <rect x={1000} y={760} width={360} height={18} fill="#3b2a1f" />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={1012 + i * 46} y={652 + (i % 2) * 12} width={36} height={108 - (i % 2) * 12} fill={['#7b4b3a', '#365b7a', '#c9a24a', '#4c6b4a', '#8a3b3b', '#5a5f75'][i]} />)}
      <g transform="translate(1010 1080)">
        <rect x={0} y={0} width={480} height={60} rx={16} fill="#2c2433" />
        <rect x={0} y={60} width={480} height={300} fill="#46536b" />
        <rect x={30} y={30} width={150} height={70} rx={30} fill="#e9e6df" />
        <path d={`M 0 120 Q 240 ${90 + 30 * (L.bedTidy ?? 1)} 480 120 L 480 360 L 0 360 Z`} fill="#6f86a8" />
      </g>
      {/* desk lamp */}
      <ellipse cx={230} cy={1330} rx={300} ry={220} fill="url(#sl-lamp)" opacity={L.lamp} />
      <rect x={150} y={1310} width={120} height={22} rx={8} fill="#2a2a2e" />
      <path d="M 210 1312 L 190 1170 L 250 1110" stroke="#2a2a2e" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M 210 1080 L 300 1100 L 285 1150 L 215 1140 Z" fill="#2f3138" />
      {L.lamp > 0 && <ellipse cx={258} cy={1146} rx={34} ry={10} fill="#fff1c9" opacity={L.lamp} />}
      {hero}
      {/* the desk and the laptop seen from behind (its glow lights the hero) */}
      <ellipse cx={560} cy={1080} rx={420} ry={360} fill="url(#sl-scr)" opacity={0.55 * L.screen} />
      <rect x={-600} y={1330} width={2400} height={36} fill="#6b4a32" /><rect x={-600} y={1366} width={2400} height={1300} fill="#4a3324" />
      <rect x={-600} y={1366} width={2400} height={14} fill="#000" opacity={0.25} />
      {L.laptop === 'closed'
        ? <rect x={372} y={1300} width={376} height={30} rx={8} fill="#2b2f36" stroke="#15171c" strokeWidth={5} />
        : <><path d="M 382 1330 L 400 1108 L 720 1108 L 738 1330 Z" fill="#2b2f36" stroke="#15171c" strokeWidth={6} /><circle cx={560} cy={1215} r={20} fill="#3c424c" /></>}
      {L.laptop !== 'closed' && Array.from({length: Math.min(9, Math.floor(L.notes))}, (_, i) => {
        const q = mulberry32(40 + i); const nx = 420 + q() * 250, ny = 1124 + q() * 120;
        return <g key={i} transform={`rotate(${(q() - 0.5) * 22} ${nx + 30} ${ny + 30})`}><rect x={nx} y={ny} width={62} height={62} fill={SC.paper} /><path d={`M ${nx + 8} ${ny + 20} h 40 M ${nx + 8} ${ny + 34} h 30`} stroke="#6b5b2a" strokeWidth={4} /></g>;
      })}
      {Array.from({length: Math.min(10, Math.floor(L.cans))}, (_, i) => {
        const q = mulberry32(90 + i); const x = i < 5 ? 790 + i * 58 + q() * 14 : 70 + (i - 5) * 56 + q() * 12, tipped = q() < 0.35;
        return <g key={i} transform={`translate(${x} ${1330}) rotate(${tipped ? 90 : 0} 0 -20)`}><rect x={-20} y={-80} width={40} height={80} rx={7} fill="#2f6fd6" stroke="#10131a" strokeWidth={4} /><rect x={-20} y={-50} width={40} height={18} fill="#f2c541" /></g>;
      })}
      {front}
    </g>
  );
};

// ---------- laptop screen, seen by the hero (frame coordinates) ----------
export const ScreenFrame: React.FC<{children: React.ReactNode; clock?: string; tint?: number}> = ({children, clock, tint = 0}) => (
  <AbsoluteFill style={{background: '#0a0c11'}}>
    <div style={{position: 'absolute', left: 40, right: 40, top: 230, bottom: 380, borderRadius: 28, background: '#11151d', border: '10px solid #22262e', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, background: '#1a1f29', display: 'flex', alignItems: 'center', padding: '0 26px', gap: 12}}>
        {['#e5484d', '#f2c14e', '#46a758'].map((c) => <div key={c} style={{width: 18, height: 18, borderRadius: 9, background: c, opacity: 0.8}} />)}
        <div style={{flex: 1}} />{clock && <div style={{fontFamily: MONO, fontSize: 34, color: '#c9d3e3'}}>{clock}</div>}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 64, bottom: 0}}>{children}</div>
      <div style={{position: 'absolute', inset: 0, background: '#7fa36a', opacity: tint, mixBlendMode: 'multiply'}} />
    </div>
  </AbsoluteFill>
);

// reaction test: wait, GO (green), the late press, the bars
export const ReactionTest: React.FC<{t: number; go: number; press: number}> = ({t, go, press}) => {
  const on = t >= go, pressed = t >= press, k = easeOut((t - press) / 0.5);
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, fontFamily: MONT}}>
      <div style={{fontSize: 36, fontWeight: 800, letterSpacing: 6, color: '#8b97ab'}}>ТЕСТ РЕАКЦИИ</div>
      <div style={{marginTop: 50, width: 380, height: 380, borderRadius: 190, background: on ? '#46a758' : '#3a404c', boxShadow: on ? '0 0 90px rgba(70,167,88,0.6)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 84, fontWeight: 900, color: '#fff', transform: `scale(${pressed ? 0.94 : 1})`}}>{on ? 'ЖМИ' : 'ЖДИ'}</div>
      <div style={{marginTop: 60, width: 760, opacity: k}}>
        {[['ОБЫЧНО', 0.34, '#8b97ab'], ['СЕЙЧАС', 0.86, SC.red]].map(([lab, w, c]) => (
          <div key={lab as string} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 26}}>
            <div style={{width: 210, fontSize: 38, fontWeight: 900, color: c as string}}>{lab}</div>
            <div style={{height: 46, width: `${(w as number) * 520 * k}px`, background: c as string, borderRadius: 10}} />
          </div>
        ))}
      </div>
    </div>
  );
};

// one line read again and again: a highlight sweeps it, a counter counts the passes
export const ReadAgain: React.FC<{t: number; t0: number; passes: number[]; gib?: {at: number; until: number}}> = ({t, t0, passes, gib}) => {
  const n = passes.filter((p) => t >= p).length;
  const last = passes.filter((p) => t >= p).slice(-1)[0] ?? t0;
  const sweep = clamp((t - last) / 0.7);
  const gibN = gib ? Math.floor(clamp((t - gib.at) / (gib.until - gib.at)) * 22) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, padding: '70px 60px', fontFamily: MONT}}>
      {[0.9, 0.75, 0.82].map((w, i) => <div key={i} style={{height: 26, width: `${w * 100}%`, background: '#2a3040', borderRadius: 8, marginBottom: 34}} />)}
      <div style={{position: 'relative', fontSize: 50, fontWeight: 800, color: '#e8edf5', lineHeight: 1.25, marginBottom: 34}}>
        <div style={{position: 'absolute', left: -10, top: 0, bottom: 0, width: `${sweep * 104}%`, background: 'rgba(242,193,78,0.28)', borderRadius: 8}} />
        Сон нужен мозгу так же, как еда и вода.
      </div>
      {gib && t >= gib.at && <div style={{fontSize: 50, fontWeight: 800, color: '#e8edf5', marginBottom: 34, wordBreak: 'break-all'}}>{'а'.repeat(Math.max(1, gibN))}<span style={{opacity: Math.sin(t * 9) > 0 ? 1 : 0}}>|</span></div>}
      {[0.86, 0.7, 0.92, 0.6].map((w, i) => <div key={i} style={{height: 26, width: `${w * 100}%`, background: '#2a3040', borderRadius: 8, marginBottom: 34}} />)}
      {n > 1 && <div style={{position: 'absolute', right: 90, top: 20, fontSize: 120, fontWeight: 900, color: n >= 5 ? SC.red : SC.gold}}>×{n}</div>}
    </div>
  );
};

// ---------- the car: the driver from the front, and the road ----------
export const CarCabin: React.FC<{t: number; dash: number; children: React.ReactNode}> = ({t, dash, children}) => (
  <svg width={1080} height={1920} style={{position: 'absolute'}}>
    <defs>{GLOW('sl-dash', '#5fd6d0', 0.45)}</defs>
    <rect width={1080} height={1920} fill="#070a12" />
    {/* the rear window behind him: street lights sliding past */}
    <rect x={180} y={420} width={720} height={420} rx={60} fill="#0e1424" />
    {Array.from({length: 4}, (_, i) => { const p = ((t * 0.9 + i * 0.25) % 1); return <ellipse key={i} cx={900 - p * 720} cy={520} rx={60} ry={14} fill="#ffcf8a" opacity={0.5 * Math.sin(Math.PI * p)} />; })}
    <rect x={300} y={760} width={480} height={420} rx={70} fill="#151a24" />
    {children}
    <ellipse cx={540} cy={1500} rx={520} ry={300} fill="url(#sl-dash)" opacity={dash} />
    {/* windshield frame: A-pillars and the dashboard edge */}
    <path d="M 0 0 L 120 0 L 0 1500 Z" fill="#05070c" /><path d="M 1080 0 L 960 0 L 1080 1500 Z" fill="#05070c" />
    <rect x={0} y={1640} width={1080} height={280} fill="#05070c" />
  </svg>
);

export const Wheel: React.FC = () => (
  <g>
    <circle cx={0} cy={300} r={210} fill="none" stroke="#111318" strokeWidth={44} />
    <circle cx={0} cy={300} r={210} fill="none" stroke="#2a2e36" strokeWidth={10} />
    <path d="M -200 300 L -60 330 L 60 330 L 200 300" stroke="#111318" strokeWidth={36} fill="none" />
    <circle cx={0} cy={330} r={56} fill="#1a1d23" />
  </g>
);

// POV: the road ahead. `drift` pushes the car into the oncoming lane; `lights` 0..1 the oncoming headlights grow
export const Road: React.FC<{t: number; speed: number; drift: number; lights: number; tilt: number}> = ({t, speed, drift, lights, tilt}) => {
  const hz = 820;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="sl-nightsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05070d" /><stop offset="1" stopColor="#141c2e" /></linearGradient>
        <radialGradient id="sl-hl"><stop offset="0" stopColor="#ffffff" stopOpacity={1} /><stop offset="0.25" stopColor="#fff6dc" stopOpacity={0.8} /><stop offset="1" stopColor="#fff6dc" stopOpacity={0} /></radialGradient>
      </defs>
      <g transform={`rotate(${tilt} 540 1400) translate(${drift} 0)`}>
        <rect x={-400} y={0} width={1880} height={hz} fill="url(#sl-nightsky)" />
        <rect x={-400} y={hz} width={1880} height={1100} fill="#0b0d12" />
        <path d={`M 500 ${hz} L 580 ${hz} L 1500 1920 L -420 1920 Z`} fill="#1a1d24" />
        {Array.from({length: 7}, (_, i) => {
          const p = ((i / 7) + t * speed * 0.35) % 1, q = p * p;
          const y = hz + q * 1100, w = 6 + q * 50, h = 10 + q * 140;
          return <rect key={i} x={540 - w / 2} y={y} width={w} height={h} fill="#e6e2d3" opacity={0.85} />;
        })}
        {Array.from({length: 5}, (_, i) => { const p = ((i / 5) + t * speed * 0.35) % 1, q = p * p; return <rect key={i} x={600 + q * 900} y={hz - 40 - q * 500} width={8 + q * 30} height={60 + q * 600} fill="#2a2f3a" />; })}
        {lights > 0 && [-1, 1].map((k) => <circle key={k} cx={430 + k * (14 + lights * 150)} cy={hz + 30 + lights * 260} r={30 + lights * 520} fill="url(#sl-hl)" opacity={clamp(lights * 1.4)} />)}
      </g>
      <rect x={0} y={1560} width={1080} height={360} fill="#05070c" />
      <path d="M 300 1920 Q 540 1600 780 1920" stroke="#111318" strokeWidth={48} fill="none" />
    </svg>
  );
};

// ---------- overlays ----------
// eyelids: black curtains with a curved edge, close 0 (open) .. 1 (shut)
export const Eyelids: React.FC<{close: number}> = ({close}) => {
  if (close <= 0.001) return null;
  const h = 960 * clamp(close), bow = 260 * (1 - clamp(close));
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <path d={`M -10 -10 L 1090 -10 L 1090 ${h} Q 540 ${h + bow} -10 ${h} Z`} fill="#000" />
      <path d={`M -10 1930 L 1090 1930 L 1090 ${1920 - h} Q 540 ${1920 - h - bow} -10 ${1920 - h} Z`} fill="#000" />
    </svg>
  );
};

// the counter of hours without sleep (top left, inside the safe area)
export const SleepHud: React.FC<{label: string; value: string; day?: string; tone: 'plain' | 'gold' | 'red'; flash: number; o?: number}> = ({label, value, day, tone, flash, o = 1}) => {
  const c = {plain: '#c9d3e3', gold: SC.gold, red: SC.red}[tone];
  return (
    <div style={{position: 'absolute', left: SAFE.left + 10, top: SAFE.top + 30, opacity: o, transform: `scale(${1 + 0.08 * flash})`, transformOrigin: '0 0',
      background: 'rgba(8,10,15,0.82)', border: `3px solid ${c}`, borderRadius: 16, padding: '12px 24px 14px', minWidth: 230}}>
      <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 22, letterSpacing: 4, color: '#8b97ab'}}>{label}</div>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 64, color: c, lineHeight: 1.0}}>{value}</div>
      {day && <div style={{fontFamily: MONO, fontSize: 26, color: '#c9d3e3', marginTop: 4}}>{day}</div>}
    </div>
  );
};

// a taped label (chapter / warning), centred on the composition axis
export const Tape: React.FC<{k: number; text: string; red?: boolean; y?: number; rot?: number}> = ({k, text, red, y = 420, rot = -2}) => k <= 0 ? null : (
  <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: y, display: 'flex', justifyContent: 'center', opacity: clamp(k * 2)}}>
    <div style={{transform: `rotate(${rot}deg) scale(${1.15 - 0.15 * easeOut(k)})`, background: red ? SC.red : '#efe6cf', color: red ? '#fff' : '#1a1712', fontFamily: MONT, fontWeight: 900,
      fontSize: 50, letterSpacing: 3, padding: '12px 30px', boxShadow: '0 8px 24px rgba(0,0,0,0.45)'}}>{text}</div>
  </div>
);

// the order of symptoms from the review (distortions -> hallucinations -> delusions); `step` 0..3
export const Ladder: React.FC<{k: number; step: number}> = ({k, step}) => k <= 0 ? null : (
  <div style={{position: 'absolute', left: SAFE.left + 10, top: 410, opacity: clamp(k * 2), fontFamily: MONT, fontWeight: 900}}>
    {['ИСКАЖЕНИЯ', 'ГАЛЛЮЦИНАЦИИ', 'БРЕД'].map((s, i) => {
      const on = step >= i + 1;
      return (
        <div key={s} style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, marginLeft: i * 28, opacity: on ? 1 : 0.35}}>
          <div style={{width: 22, height: 22, borderRadius: 11, background: on ? SC.red : '#5a6272'}} />
          <div style={{fontSize: 50, color: on ? '#fff' : '#9aa3b2', background: 'rgba(8,10,15,0.75)', padding: '4px 14px', borderRadius: 8}}>{s}</div>
        </div>
      );
    })}
  </div>
);

// colour grade and vignette: one layer per mood, cheap (no filters)
export const Grade: React.FC<{color: string; o: number; vignette: number}> = ({color, o, vignette}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {o > 0 && <AbsoluteFill style={{background: color, opacity: o, mixBlendMode: 'multiply'}} />}
    <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${vignette}) 100%)`}} />
  </AbsoluteFill>
);

// a tall dark shape at the edge of vision (artistic metaphor for a perceptual distortion, not a literal creature)
export const EdgeShadow: React.FC<{x: number; y: number; o: number; s?: number}> = ({x, y, o, s = 1}) => o <= 0 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <defs><radialGradient id="sl-shade"><stop offset="0" stopColor="#000" stopOpacity={0.95} /><stop offset="0.7" stopColor="#000" stopOpacity={0.6} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient></defs>
    <ellipse cx={0} cy={-330} rx={70} ry={84} fill="url(#sl-shade)" />
    <ellipse cx={0} cy={60} rx={150} ry={420} fill="url(#sl-shade)" />
  </g>
);

export const fadeK = (t: number, a: number, d = 0.35) => easeOut((t - a) / d);
export const inOut = (t: number, a: number, b: number, d = 0.3) => clamp(Math.min((t - a) / d, (b - t) / d));
