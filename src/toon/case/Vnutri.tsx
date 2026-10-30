// Sets for «Курьер уже внутри» (psychological horror series): flat, outline-free, cold greys and black shadows;
// the only warm/red accents are notifications, the timer and the key details (tomorrow's date, the courier's name).
// Screen space 1080x1920, key content inside SAFE. Every value is a pure function of time.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, mulberry32, spring01, wobble} from '../lib/anim';
import {MONO, MONT, SAFE, UI} from './Kit';
import {Icon} from '../ui/Icons';

export const V = {
  black: '#060709', bg: '#0c0e12', wall: '#1b1f26', wallLit: '#272c35', wall2: '#14171c', floor: '#121418', wood: '#1f1c19', woodLit: '#2c2723',
  screen: '#d9e6ff', glow: '#8fb4ff', gray: '#8a93a3', ink: '#e8ecf2', red: '#e23b3b', redDim: '#7a1f22', window: '#16202f', city: '#2a3a55',
};

// ---------- phone ----------
export type PhoneSpec = {x: number; y: number; w: number; rot?: number; on?: number; old?: boolean; children?: React.ReactNode; glow?: boolean};
export const Phone: React.FC<PhoneSpec> = ({x, y, w, rot = 0, on = 1, old = false, children, glow = true}) => {
  const h = w * 2.05, r = w * 0.13;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`}}>
      {glow && on > 0 && <div style={{position: 'absolute', left: -w * 0.9, top: -h * 0.5, width: w * 2.8, height: h * 2, borderRadius: '50%',
        background: `radial-gradient(ellipse at center, rgba(143,180,255,${0.22 * on}) 0%, rgba(143,180,255,0) 65%)`}} />}
      <div style={{position: 'absolute', inset: 0, borderRadius: r, background: old ? '#1d1f22' : '#05060a', boxShadow: `0 ${w * 0.05}px ${w * 0.12}px rgba(0,0,0,0.7), inset 0 0 0 ${w * 0.012}px ${old ? '#3a3d42' : '#2a2f38'}`}} />
      <div style={{position: 'absolute', left: w * (old ? 0.07 : 0.04), right: w * (old ? 0.07 : 0.04), top: w * (old ? 0.22 : 0.04), bottom: w * (old ? 0.22 : 0.04),
        borderRadius: old ? w * 0.03 : r * 0.8, overflow: 'hidden', background: '#020304', fontFamily: UI}}>
        <div style={{position: 'absolute', inset: 0, opacity: on}}>{children}</div>
        {old && <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.35}}>
          <path d={`M ${w * 0.1} ${w * 0.3} L ${w * 0.55} ${w * 0.9}`} stroke="#9aa3b0" strokeWidth={1.5} /><path d={`M ${w * 0.6} ${w * 1.2} L ${w * 0.8} ${w * 1.05}`} stroke="#9aa3b0" strokeWidth={1} /></svg>}
      </div>
      {old ? <div style={{position: 'absolute', left: w * 0.4, bottom: w * 0.07, width: w * 0.2, height: w * 0.08, borderRadius: w * 0.04, border: '2px solid #3a3d42'}} />
        : <div style={{position: 'absolute', left: w * 0.36, top: w * 0.07, width: w * 0.28, height: w * 0.07, borderRadius: w * 0.04, background: '#000'}} />}
    </div>
  );
};

// notification card (red accent optional); `k` 0..1 pops it in
export const Notif: React.FC<{k: number; app?: string; title: string; text?: string; red?: boolean; scale?: number; icon?: string; hot?: boolean}> = ({k, app = 'Доставка', title, text, red, scale = 1, icon = 'shopping-bag', hot}) => {
  if (k <= 0) return null;
  const s = scale;
  return (
    <div style={{opacity: clamp(k * 2), transform: `translateY(${(1 - clamp(k)) * -40 * s}px) scale(${0.94 + 0.06 * clamp(k)})`, background: 'rgba(28,32,40,0.94)', borderRadius: 26 * s,
      padding: `${16 * s}px ${20 * s}px`, border: `${2 * s}px solid ${red ? V.red : 'rgba(255,255,255,0.08)'}`, boxShadow: red ? `0 0 ${24 * s}px rgba(226,59,59,0.45)` : undefined}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10 * s, marginBottom: 6 * s}}>
        <div style={{width: 30 * s, height: 30 * s, borderRadius: 8 * s, background: red ? V.red : '#3a414c', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon name={icon} size={20 * s} color="#fff" stroke={2.2} /></div>
        <div style={{fontSize: 18 * s, fontWeight: 700, color: '#aab3c2', flex: 1}}>{app}</div><div style={{fontSize: 16 * s, color: '#6f7887'}}>сейчас</div>
      </div>
      <div style={{fontSize: 24 * s, fontWeight: 800, color: red ? '#ffd9d9' : '#fff', lineHeight: 1.2}}>{title}</div>
      {text && <div style={{fontSize: (hot ? 40 : 21) * s, fontWeight: hot ? 900 : 400, color: hot ? V.red : '#c7cfdb', marginTop: 4 * s, lineHeight: 1.25, letterSpacing: hot ? 2 * s : 0}}>{text}</div>}
    </div>
  );
};

// lock screen content (fits any phone; s = phone width / 400)
export const LockContent: React.FC<{s: number; time: string; date: string; notes: React.ReactNode; flicker?: number}> = ({s, time, date, notes, flicker = 0}) => (
  <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 40% 30%, #1d2638 0, #0a0d14 70%)', filter: flicker ? `brightness(${1 - 0.5 * flicker})` : undefined}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 70 * s, textAlign: 'center', fontSize: 96 * s, fontWeight: 800, color: '#e8edf5', letterSpacing: -2 * s}}>{time}</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 182 * s, textAlign: 'center', fontSize: 20 * s, color: '#8f9aab'}}>{date}</div>
    <div style={{position: 'absolute', left: 16 * s, right: 16 * s, top: 250 * s, display: 'flex', flexDirection: 'column', gap: 10 * s}}>{notes}</div>
  </div>
);

// ---------- top-down table ----------
export const Table: React.FC<{t: number; lampOn?: number}> = ({t, lampOn = 0}) => {
  const r = mulberry32(4);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${V.woodLit} 0%, ${V.wood} 45%, ${V.black} 100%)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.35}}>
        {Array.from({length: 22}, (_, i) => <path key={i} d={`M -20 ${i * 92 + 30} C 300 ${i * 92 + 30 + (r() - 0.5) * 40} 700 ${i * 92 + 30 + (r() - 0.5) * 40} 1100 ${i * 92 + 36}`} stroke="#0d0b09" strokeWidth={2 + (i % 3)} fill="none" />)}
      </svg>
      {/* desk lamp base and cable (the same lamp appears in the video later) */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M 160 260 C 260 420 120 700 40 900" stroke="#0a0a0b" strokeWidth={8} fill="none" />
        <circle cx={170} cy={250} r={95} fill="#15171b" /><circle cx={170} cy={250} r={60} fill="#23262c" />
        <circle cx={170} cy={250} r={300} fill="#ffd9a0" opacity={0.08 * lampOn} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the order in the app ----------
export const OrderContent: React.FC<{s: number; t: number; hi: number[]; timerAt: number; msgAt: number; flash?: number}> = ({s, t, hi, timerAt, msgAt, flash = 0}) => {
  const rows: [string, string, number][] = [['Получатель', 'ТЫ', hi[0]], ['Адрес', 'твой адрес  ✓', hi[1]], ['Оплата', 'оплачено  ✓', hi[2]], ['Отправитель', '', hi[3]]];
  const left = Math.max(0, 120 - Math.floor(Math.max(0, t - timerAt)));
  const msg = easeOut((t - msgAt) / 0.3);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0b0e14', color: '#fff'}}>
      <div style={{position: 'absolute', left: 22 * s, top: 70 * s, fontSize: 34 * s, fontWeight: 800}}>Заказ</div>
      <div style={{position: 'absolute', left: 22 * s, top: 112 * s, fontSize: 18 * s, color: '#7b8596', fontFamily: MONO}}>№ 2347-1103</div>
      <div style={{position: 'absolute', left: 16 * s, right: 16 * s, top: 160 * s, display: 'flex', flexDirection: 'column', gap: 10 * s}}>
        {rows.map(([k, v, at], i) => {
          const on = t >= at, empty = i === 3;
          const blink = empty && on ? 0.5 + 0.5 * Math.sin(t * 7) : 0;
          return <div key={k} style={{background: on ? (empty ? 'rgba(226,59,59,0.08)' : '#1a2130') : '#121722', borderRadius: 14 * s, padding: `${12 * s}px ${16 * s}px`,
            border: `${2 * s}px solid ${empty && on ? `rgba(226,59,59,${0.4 + 0.6 * blink})` : on ? '#3d5a8a' : 'transparent'}`, transition: 'none'}}>
            <div style={{fontSize: 15 * s, color: '#7b8596', letterSpacing: 1 * s}}>{k.toUpperCase()}</div>
            <div style={{fontSize: 24 * s, fontWeight: 700, color: empty ? V.red : '#e8ecf2', minHeight: 28 * s}}>{empty ? (on ? '—' : '') : v}</div>
          </div>;
        })}
      </div>
      {msg > 0 && <div style={{position: 'absolute', left: 14 * s, right: 14 * s, top: 20 * s, transform: `translateY(${(1 - msg) * -60 * s}px)`, opacity: msg}}>
        <Notif k={1} title="Курьер будет у вашей двери" text="через 2 минуты" red scale={s} /></div>}
      {t >= timerAt && <div style={{position: 'absolute', left: 0, right: 0, bottom: 34 * s, textAlign: 'center'}}>
        <div style={{fontSize: 15 * s, color: '#7b8596', letterSpacing: 2 * s}}>ДО ПРИБЫТИЯ</div>
        <div style={{fontFamily: MONO, fontSize: 76 * s, color: V.red, textShadow: `0 0 ${20 * s}px rgba(226,59,59,${0.5 + 0.5 * flash})`}}>
          {`${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`}</div>
      </div>}
    </div>
  );
};

// ---------- the apartment, side view (also what the impossible video shows) ----------
// hero: null = empty room; otherwise the person at the table seen from behind:
// turn 0..1 turns the head towards the camera, stand 0..1 gets up, walk 0..1 goes to the front door, reach 0..1 takes the handle
export type Hero = {turn?: number; stand?: number; walk?: number; reach?: number} | null;
export const Room: React.FC<{t: number; hero?: Hero; phoneGlow?: number; lamp?: number; behind?: boolean}> = ({t, hero = null, phoneGlow = 1, lamp = 0.7, behind = false}) => {
  const doorX = 860;
  const sx = hero ? lerp(500, doorX - 70, easeInOut(hero.walk ?? 0)) : 0;
  const sc = hero ? lerp(1, 0.62, easeInOut(hero.walk ?? 0)) : 1;
  const up = hero ? easeInOut(hero.stand ?? 0) : 0;
  const by = lerp(1420, 1330, up) - (hero?.walk ?? 0) * 60;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="rm-ph" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={V.glow} stopOpacity={0.5 * phoneGlow} /><stop offset="1" stopColor={V.glow} stopOpacity="0" /></radialGradient>
        <radialGradient id="rm-lamp" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ffd9a0" stopOpacity={0.22 * lamp} /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={V.wall2} />
      <rect y={1180} width={1080} height={740} fill={V.floor} />
      {/* window with the night city (left), front door and the hallway wardrobe (right) */}
      <rect x={90} y={420} width={320} height={460} fill={V.window} />
      {Array.from({length: 14}, (_, i) => { const r = mulberry32(i + 2); return <rect key={i} x={100 + r() * 290} y={600 + r() * 260} width={18} height={14} fill="#c9a86a" opacity={0.25 + 0.25 * r()} />; })}
      <rect x={244} y={420} width={10} height={460} fill={V.wall2} /><rect x={90} y={640} width={320} height={10} fill={V.wall2} />
      <rect x={doorX - 110} y={520} width={220} height={660} fill="#101216" />
      <rect x={doorX - 92} y={540} width={184} height={640} fill="#191c22" /><circle cx={doorX - 70} cy={880} r={8} fill="#5a606b" />
      {!behind && <><rect x={560} y={560} width={150} height={620} fill="#16191f" /><line x1={635} y1={560} x2={635} y2={1180} stroke="#0d0f12" strokeWidth={4} /></>}
      {/* table, lamp, the first phone */}
      <rect x={300} y={1150} width={480} height={26} fill={V.woodLit} />
      <rect x={330} y={1176} width={20} height={250} fill={V.wood} /><rect x={730} y={1176} width={20} height={250} fill={V.wood} />
      <path d="M 640 1150 L 650 1010 L 720 980" stroke="#2a2d33" strokeWidth={10} fill="none" />
      <path d="M 690 960 L 770 960 L 750 1010 L 700 1010 Z" fill="#2a2d33" />
      <ellipse cx={725} cy={1060} rx={170} ry={140} fill="url(#rm-lamp)" />
      <rect x={470} y={1140} width={80} height={10} rx={4} fill="#000" />
      <ellipse cx={510} cy={1120} rx={150} ry={90} fill="url(#rm-ph)" />
      {/* the person (from behind) */}
      {hero && <g transform={`translate(${sx} ${by}) scale(${sc})`}>
        {(hero.stand ?? 0) < 0.5 && <rect x={-90} y={10} width={180} height={140} rx={10} fill="#0e1014" />}
        <path d="M -120 160 C -115 20 -70 -40 0 -40 C 70 -40 115 20 120 160 Z" fill="#20252e" />
        <rect x={-120} y={140} width={240} height={140 * up} fill="#1a1e25" />
        {up > 0.4 && [-1, 1].map((k) => <rect key={k} x={k * 50 - 25} y={140 + 140 * up} width={50} height={160 * up} fill="#16191f" />)}
        {/* arm towards the handle */}
        {(hero.reach ?? 0) > 0 && <path d={`M 90 0 Q 150 ${-10} ${150 + 120 * (hero.reach ?? 0)} ${-30 - 20 * (hero.reach ?? 0)}`} stroke="#20252e" strokeWidth={34} fill="none" strokeLinecap="round" />}
        <g transform={`translate(0 -110)`}>
          <circle r={86} fill="#262b34" />
          <path d="M -86 0 C -86 -70 86 -70 86 0 C 70 -30 -70 -30 -86 0 Z" fill="#1b1f27" />
          {/* turning head: the edge of a face appears on the right */}
          {(hero.turn ?? 0) > 0 && <g opacity={clamp((hero.turn ?? 0) * 1.4)}>
            <path d={`M ${86 - 60 * (hero.turn ?? 0)} -50 C ${100 - 40 * (hero.turn ?? 0)} -20 ${104 - 40 * (hero.turn ?? 0)} 10 ${92 - 50 * (hero.turn ?? 0)} 50 L 80 60 L 80 -60 Z`} fill="#c9a98c" opacity={0.55} />
            <circle cx={78 - 50 * (hero.turn ?? 0)} cy={-6} r={6} fill="#0b0b0c" />
          </g>}
        </g>
      </g>}
    </svg>
  );
};

// ---------- POV corridor to the front door (also turns to the wardrobe) ----------
export const Corridor: React.FC<{t: number; walk: number; jolt?: number; wardrobe?: number; shake?: number; underLight?: number; ajar?: number}> = ({t, walk, jolt = 0, wardrobe = 0, shake = 0, underLight = 0, ajar = 0}) => {
  const s = 1 + 0.55 * easeInOut(walk), bob = Math.sin(t * 6.2) * 10 * (walk > 0 && walk < 1 ? 1 : 0);
  const pan = 560 * easeInOut(wardrobe);  // turn the head left: the world slides right until the wardrobe is in the middle
  const jx = wobble(t * 50, 3) * 14 * jolt, jy = wobble(t * 47, 7) * 10 * jolt;
  const cx = 540, vy = 860;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <g transform={`translate(${jx + pan} ${jy + bob}) translate(${cx} ${vy}) scale(${s}) translate(${-cx} ${-vy})`}>
        <rect x={-900} y={-200} width={2900} height={2400} fill={V.black} />
        {/* floor, ceiling, walls converging to the door */}
        <path d={`M -400 1920 L ${cx - 150} ${vy + 330} L ${cx + 150} ${vy + 330} L 1480 1920 Z`} fill={V.floor} />
        <path d={`M -400 -100 L ${cx - 150} ${vy - 330} L ${cx + 150} ${vy - 330} L 1480 -100 Z`} fill="#0e1014" />
        <path d={`M -400 -100 L ${cx - 150} ${vy - 330} L ${cx - 150} ${vy + 330} L -400 1920 Z`} fill={V.wall} />
        <path d={`M 1480 -100 L ${cx + 150} ${vy - 330} L ${cx + 150} ${vy + 330} L 1480 1920 Z`} fill="#171a20" />
        {/* the front door at the end: no light under it, no shadow */}
        <rect x={cx - 150} y={vy - 330} width={300} height={660} fill="#0d0f13" />
        <rect x={cx - 120} y={vy - 300} width={240} height={630} fill="#1a1d23" />
        <circle cx={cx + 90} cy={vy + 30} r={9} fill="#5a606b" /><circle cx={cx} cy={vy - 140} r={7} fill="#2c3038" />
        <rect x={cx - 120} y={vy + 326} width={240} height={4} fill="#f0d9a8" opacity={underLight} />
        {/* the built-in wardrobe on the left wall (Chekhov's wardrobe): two doors in perspective, the seam between them
            (u = 0.47 across the face), round knobs; `ajar` opens a black gap along the seam */}
        <g transform={`translate(${wobble(t * 30, 1) * 3 * shake} 0)`}>
          <path d={`M -260 120 L ${cx - 260} ${vy - 250} L ${cx - 260} ${vy + 280} L -260 1700 Z`} fill="#14171c" />
          <path d={`M -150 260 L ${cx - 300} ${vy - 200} L ${cx - 300} ${vy + 240} L -150 1560 Z`} fill="#20252d" />
          <path d={`M -150 260 L ${cx - 300} ${vy - 200} L ${cx - 300} ${vy - 180} L -150 300 Z`} fill="#2b313b" />
          <path d={`M -150 260 L -150 1560`} stroke="#2e343e" strokeWidth={6} />
          {(() => {
            const u = 0.47, x = -150 + 390 * u, y0 = 260 + 400 * u + 30, y1 = 1560 - 460 * u - 20, g = 3 + 16 * ajar;
            const r = wobble(t * 40, 4) * 2 * shake;
            return <>
              <path d={`M ${x - g / 2 + r} ${y0} L ${x + g / 2 + r} ${y0 + 4} L ${x + g / 2 + r} ${y1 - 4} L ${x - g / 2 + r} ${y1} Z`} fill="#030304" />
              <circle cx={x - 26 + r} cy={(y0 + y1) / 2} r={9} fill="#59606b" /><circle cx={x + 24 + r} cy={(y0 + y1) / 2 + 2} r={8} fill="#4c525c" />
            </>;
          })()}
        </g>
      </g>
    </svg>
  );
};

// ---------- the landing outside, the floor with the thermal bag ----------
export const Landing: React.FC<{t: number; open: number; tilt: number; lift: number}> = ({t, open, tilt, lift}) => {
  const ty = -900 * easeInOut(tilt);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <g transform={`translate(0 ${ty})`}>
        <rect y={-200} width={1080} height={3200} fill="#101317" />
        <rect y={0} width={1080} height={1250} fill="#1c2129" />
        <rect y={560} width={1080} height={8} fill="#11151b" />
        <ellipse cx={540} cy={60} rx={60} ry={16} fill="#cfd8e6" opacity={0.55} />
        <path d="M 0 1250 L 1080 1250 L 1080 2900 L 0 2900 Z" fill="#14171b" />
        {Array.from({length: 7}, (_, i) => <line key={i} x1={0} x2={1080} y1={1300 + i * i * 30} y2={1300 + i * i * 30} stroke="#0c0e11" strokeWidth={4} />)}
        <rect x={380} y={300} width={320} height={950} fill="#15191f" /><rect x={400} y={320} width={280} height={930} fill="#1d222a" />
        {/* the small black thermal bag on the floor */}
        <g transform={`translate(540 ${1980 - 160 * easeOut(lift)}) rotate(${-6 + 6 * lift})`}>
          <ellipse cx={0} cy={140} rx={170} ry={22} fill="#000" opacity={0.5 * (1 - lift)} />
          <rect x={-150} y={-60} width={300} height={200} rx={18} fill="#0b0c0e" />
          <rect x={-150} y={-60} width={300} height={34} rx={14} fill="#16181c" />
          <rect x={-90} y={10} width={180} height={80} fill="#d9dde3" opacity={0.85} />
          <rect x={-70} y={30} width={110} height={8} fill="#555" /><rect x={-70} y={50} width={80} height={8} fill="#555" />
        </g>
      </g>
      {/* the door frame swinging open (we look out from inside) */}
      <rect x={0} y={0} width={1080 * (1 - easeInOut(open)) * 0.5} height={1920} fill="#0d0f13" />
      <rect x={1080 - 1080 * (1 - easeInOut(open)) * 0.5} y={0} width={1080 * (1 - easeInOut(open)) * 0.5} height={1920} fill="#0d0f13" />
    </svg>
  );
};

// the bag on the table, top-down: `drop` 0..1 lands it, `open` unzips the slit along the top edge,
// `out` slides the old phone out through the slit (only the part above the slit is visible)
export const TopBag: React.FC<{t: number; drop: number; open: number; out: number}> = ({t, drop, open, out}) => {
  const d = easeOut(drop), o = easeInOut(open), p = easeInOut(out);
  const bx = 500, by = 1040, w = 560, h = 420, slit = by - h / 2 + 46;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - d) * -700}px) scale(${1 + 0.1 * (1 - d)})`, transformOrigin: `${bx}px ${by}px`, opacity: clamp(drop * 3)}}>
        <div style={{position: 'absolute', left: bx - w / 2 + 20, top: by - h / 2 + 40, width: w, height: h, borderRadius: 30, background: 'rgba(0,0,0,0.55)', filter: 'blur(18px)'}} />
        <div style={{position: 'absolute', left: bx - w / 2, top: by - h / 2, width: w, height: h, borderRadius: 30, background: 'linear-gradient(170deg, #17191d, #08090b)'}}>
          {Array.from({length: 7}, (_, i) => <div key={i} style={{position: 'absolute', left: 40 + i * 80, top: 70, bottom: 20, width: 2, background: 'rgba(255,255,255,0.025)'}} />)}
          <div style={{position: 'absolute', left: 120, top: 190, width: 320, height: 150, background: '#cfd3d8', opacity: 0.85, transform: 'rotate(-2deg)'}}>
            <div style={{position: 'absolute', left: 24, top: 30, width: 200, height: 14, background: '#666'}} /><div style={{position: 'absolute', left: 24, top: 64, width: 140, height: 14, background: '#666'}} />
            <div style={{position: 'absolute', left: 24, top: 98, width: 90, height: 14, background: V.red}} /></div>
        </div>
        {/* zipper: closed it is a seam, open it is a black gap with the flap edge above it */}
        <div style={{position: 'absolute', left: bx - w / 2 + 30, width: w - 60, top: slit - 4 - 22 * o, height: 8 + 30 * o, borderRadius: 6, background: o > 0.02 ? '#000' : '#26292f'}} />
        <div style={{position: 'absolute', left: bx - w / 2 + 30, width: w - 60, top: slit - 4 - 22 * o - 10, height: 10, borderRadius: 5, background: '#2a2d33', opacity: o}} />
        <div style={{position: 'absolute', left: bx - w / 2 + 30 + (w - 90) * o, top: slit - 18, width: 26, height: 36, borderRadius: 6, background: '#5a5f68'}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: slit, overflow: 'hidden'}}>
          {p > 0 && <Phone x={bx + 10} y={lerp(slit + 300, 600, p)} w={270} rot={lerp(2, -7, p)} old on={0} glow={false} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// the label on the bag, close: your name (grey), then tomorrow's date (red)
export const BagLabel: React.FC<{t: number; nameAt: number; dateAt: number}> = ({t, nameAt, dateAt}) => {
  const n = easeOut((t - nameAt) / 0.4), d = easeOut((t - dateAt) / 0.3);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 55% at 50% 45%, #1a1c20 0%, #060709 80%)'}}>
      <div style={{position: 'absolute', left: SAFE.cx - 400, top: 420, width: 800, height: 760, borderRadius: 50, background: 'linear-gradient(160deg, #141518, #08090a)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.8)'}}>
        {Array.from({length: 9}, (_, i) => <div key={i} style={{position: 'absolute', left: 30 + i * 85, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.03)'}} />)}
        <div style={{position: 'absolute', left: 110, top: 190, width: 580, height: 380, background: '#d6dade', transform: 'rotate(-3deg)', padding: '36px 44px', boxSizing: 'border-box', fontFamily: MONO}}>
          <div style={{fontSize: 30, color: '#666'}}>ДОСТАВКА · ЗАКАЗ</div>
          <div style={{fontSize: 30, color: '#666', marginTop: 34}}>ПОЛУЧАТЕЛЬ</div>
          <div style={{fontSize: 64, color: '#2a2d33', fontFamily: MONT, fontWeight: 900, opacity: n}}>ТЫ</div>
          <div style={{fontSize: 30, color: '#666', marginTop: 20}}>ДАТА</div>
          <div style={{fontSize: 64, color: V.red, fontFamily: MONO, opacity: d, transform: `scale(${1 + 0.15 * (1 - d)})`, transformOrigin: '0 50%'}}>31.10</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// the impossible video inside the old phone: the room from behind your back, with a timestamp and a REC dot
export const VideoContent: React.FC<{t: number; s: number; hero: Hero; noise?: number; frozen?: boolean; stamp: string}> = ({t, s, hero, noise = 0, frozen = false, stamp}) => (
  <div style={{position: 'absolute', inset: 0, background: '#000'}}>
    <div style={{position: 'absolute', left: '50%', top: '50%', width: 1080, height: 1920, transform: `translate(-50%, -50%) scale(${s}) translate(0, -120px) scale(1.15)`, transformOrigin: '50% 50%',
      filter: `grayscale(0.6) contrast(1.15) brightness(${frozen ? 0.8 : 1})`}}><Room t={t} hero={hero} phoneGlow={1} lamp={0.8} /></div>
    {noise > 0 && <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(0deg, rgba(255,255,255,${0.08 * noise}) 0 2px, rgba(0,0,0,0) 2px 5px)`,
      transform: `translateY(${(t * 400) % 10}px)`}} />}
    <div style={{position: 'absolute', left: 12, top: 12, display: 'flex', gap: 8, alignItems: 'center', fontFamily: MONO, fontSize: 18, color: '#e8ecf2'}}>
      <span style={{width: 12, height: 12, borderRadius: 6, background: frozen ? '#777' : V.red, opacity: Math.sin(t * 6) > 0 || frozen ? 1 : 0.2}} />{frozen ? 'II' : 'REC'}</div>
    <div style={{position: 'absolute', right: 12, top: 12, fontFamily: MONO, fontSize: 18, color: '#e8ecf2'}}>{stamp}</div>
  </div>
);

// red end card
export const EndCard: React.FC<{k: number; part?: number}> = ({k, part = 2}) => (
  <AbsoluteFill style={{background: V.black, alignItems: 'center', justifyContent: 'center', paddingRight: 1080 - 2 * SAFE.cx, paddingBottom: 200}}>
    <div style={{opacity: k, fontFamily: MONT, fontWeight: 900, fontSize: 92, color: V.red, letterSpacing: 2, textShadow: '0 0 30px rgba(226,59,59,0.5)'}}>ЧАСТЬ {part}</div>
    <div style={{opacity: k, fontFamily: MONT, fontWeight: 800, fontSize: 44, color: V.red, letterSpacing: 8, marginTop: 10}}>СКОРО</div>
  </AbsoluteFill>
);
