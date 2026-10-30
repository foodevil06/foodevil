// Series kit for «Курьер» (parts 2+): pieces that recur from episode to episode so the series reads as one show.
//  - SeriesTag: "КУРЬЕР · ЧАСТЬ N" logo with the three-knock mark (the channel sign);
//  - FloorDial: big floor number that flips on every change; KnockMarks: three red slashes, one per knock;
//  - Radar: delivery app "courier nearby" with the distance that never changes;
//  - Mailboxes (1st floor), BagClose, Receipt, Polaroid (bedroom shot with the hidden clue), EntranceDoor;
//  - EvidenceBoard: the case board that grows every part (cards + red threads); CommentBubble for the ending.
// Palette of part 2 adds cold fluorescent teal (stairwell paint) and courier amber to the night + red of part 1.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, easeOut, mulberry32, spring01, wobble} from '../lib/anim';
import {C, HAND, MONO, MONT, SAFE, UI} from './Kit';
import {Body} from './Kurier';
import {Icon} from '../ui/Icons';

export const K = {
  teal: '#1f4a4f', tealDark: '#14343a', tealLit: '#2f6b70', white: '#a9ab9c', tube: '#e4fff0', tubeGlow: '#bff5d6',
  amber: '#f2a516', amberDark: '#b87508', bag: '#e9b44c', bagDark: '#b5832a', metal: '#4c5a66', metalLit: '#6d7d8a',
  tile0: '#2a2725', tile1: '#332f2c', door: '#3b2c25', doorDark: '#261b16', cork: '#3a2a1c', corkDark: '#2a1d13',
};

// ---------- series identity ----------
export const KnockMarks: React.FC<{n: number; x: number; y: number; size?: number; color?: string; at?: number[]; t?: number}> = ({n, x, y, size = 1, color = C.red, at, t = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', gap: 14 * size, transform: 'rotate(-8deg)'}}>
    {[0, 1, 2].map((i) => {
      const on = at ? t >= at[i] : i < n;
      const p = at ? easeOut((t - at[i]) / 0.12) : 1;
      return <div key={i} style={{width: 14 * size, height: 70 * size, borderRadius: 4 * size, background: color, opacity: on ? 1 : 0.15,
        transform: `scaleY(${on ? 0.6 + 0.4 * p : 1})`, boxShadow: on ? `0 0 ${24 * size}px ${color}` : undefined}} />;
    })}
  </div>
);

export const SeriesTag: React.FC<{part: number; t: number; at?: number; until?: number; y?: number}> = ({part, t, at = 0, until = 1e9, y = SAFE.top + 24}) => {
  const o = clamp((t - at) / 0.25) * (1 - clamp((t - until) / 0.3));
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: SAFE.cx, top: y, transform: 'translateX(-50%)', opacity: o, display: 'flex', alignItems: 'center', gap: 16,
      background: 'rgba(10,12,18,0.84)', border: '2px solid rgba(226,59,59,0.5)', borderRadius: 12, padding: '8px 22px', whiteSpace: 'nowrap'}}>
      <div style={{display: 'flex', gap: 5, transform: 'rotate(-8deg)'}}>{[0, 1, 2].map((i) => <div key={i} style={{width: 6, height: 28, borderRadius: 2, background: C.red}} />)}</div>
      <span style={{fontFamily: MONT, fontWeight: 900, fontSize: 34, color: '#fff', letterSpacing: 4}}>КУРЬЕР</span>
      <span style={{fontFamily: MONO, fontSize: 28, color: '#f5d27a', letterSpacing: 2}}>ЧАСТЬ {part}</span>
    </div>
  );
};

// big floor number: flips with a pop on each change; `n` can be fractional, shown floored
export const FloorDial: React.FC<{f: number; fps: number; at: number; floor: number; changedAt: number; x: number; y: number; tone?: 'plain' | 'red'}> =
  ({f, fps, at, floor, changedAt, x, y, tone = 'plain'}) => {
  const p = spring01(f, at * fps, fps, 2.4, 0.5);
  if (p <= 0) return null;
  const pop = spring01(f, changedAt * fps, fps, 3, 0.45);
  const col = tone === 'red' ? C.red : '#f5d27a';
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: clamp(p * 2), transform: `scale(${0.85 + 0.15 * clamp(p)})`, transformOrigin: '0 0',
      background: 'rgba(10,12,18,0.86)', border: `3px solid ${col}`, borderRadius: 18, padding: '12px 26px 8px', display: 'flex', gap: 18, alignItems: 'center'}}>
      <div>
        <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: '#9aa6b8'}}>ЭТАЖ</div>
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 30, color: col, marginTop: -2}}>▼ ВНИЗ</div>
      </div>
      <div style={{fontFamily: MONO, fontSize: 110, lineHeight: 1, color: '#fff', minWidth: 70, textAlign: 'center',
        transform: `translateY(${(1 - clamp(pop)) * 30}px) scale(${1.25 - 0.25 * clamp(pop)})`, textShadow: `0 0 26px ${col}`}}>{Math.floor(floor)}</div>
    </div>
  );
};

// ---------- delivery app: courier proximity radar ----------
export const Radar: React.FC<{t: number; dist: string; floor: number; alarm?: number}> = ({t, dist, floor, alarm = 0}) => {
  const ring = (k: number) => ((t * 0.7 + k / 3) % 1);
  const ang = t * 2.2;
  return (
    <Body t={t} glow={alarm > 0.5 ? C.red : undefined}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 46%, #18222f 0, #0b0f19 62%)'}} />
      <div style={{position: 'absolute', left: 50, right: 50, top: 100, display: 'flex', alignItems: 'center', gap: 18}}>
        <div style={{width: 72, height: 72, borderRadius: 18, background: K.amber, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="shopping-bag" size={46} color="#111" stroke={2.2} /></div>
        <div style={{flex: 1}}>
          <div style={{fontSize: 40, fontWeight: 800, color: '#fff'}}>Доставка</div>
          <div style={{fontSize: 28, color: alarm > 0.5 ? C.red : '#9aa6b8'}}>Курьер Артём рядом с вами</div>
        </div>
      </div>
      <svg width={764} height={760} style={{position: 'absolute', left: 0, top: 220}}>
        <defs>
          <radialGradient id="rd-sw" cx="0" cy="0" r="1"><stop offset="0" stopColor={K.amber} stopOpacity="0.35" /><stop offset="1" stopColor={K.amber} stopOpacity="0" /></radialGradient>
        </defs>
        {[110, 210, 310].map((r) => <circle key={r} cx={382} cy={380} r={r} fill="none" stroke="#2a3446" strokeWidth={3} />)}
        <line x1={382} y1={60} x2={382} y2={700} stroke="#1f2836" strokeWidth={2} /><line x1={62} y1={380} x2={702} y2={380} stroke="#1f2836" strokeWidth={2} />
        {[0, 1, 2].map((k) => <circle key={k} cx={382} cy={380} r={40 + 300 * ring(k)} fill="none" stroke={K.amber} strokeWidth={4} opacity={0.5 * (1 - ring(k))} />)}
        <path d={`M 382 380 L ${382 + 330 * Math.cos(ang)} ${380 + 330 * Math.sin(ang)} A 330 330 0 0 0 ${382 + 330 * Math.cos(ang - 0.6)} ${380 + 330 * Math.sin(ang - 0.6)} Z`} fill={K.amber} opacity={0.14} />
        {/* you: arrow in the centre; courier: a dot right behind you that never falls back */}
        <path d="M 382 340 L 410 410 L 382 395 L 354 410 Z" fill="#fff" />
        <g transform={`translate(${382 + 18 * Math.sin(t * 1.3)} ${452 + 4 * Math.sin(t * 5)})`}>
          <circle r={34 + 6 * Math.sin(t * 8)} fill={C.red} opacity={0.25} />
          <circle r={20} fill={C.red} /><circle r={8} fill="#fff" />
        </g>
        <text x={382 + 60} y={480} fontFamily={UI} fontWeight={800} fontSize={26} fill={C.red}>Артём</text>
      </svg>
      <div style={{position: 'absolute', left: 40, right: 40, bottom: 60, background: '#141b28', borderRadius: 34, padding: '26px 34px', display: 'flex', alignItems: 'center', gap: 26,
        border: `3px solid ${alarm > 0.5 ? C.red : '#263044'}`}}>
        <Icon name="scooter" size={70} color={alarm > 0.5 ? C.red : K.amber} stroke={1.8} />
        <div style={{flex: 1}}>
          <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: '#9aa6b8'}}>ДО КУРЬЕРА</div>
          <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 92, color: alarm > 0.5 ? C.red : '#fff', lineHeight: 1}}>{dist}</div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{fontFamily: MONT, fontWeight: 800, fontSize: 22, letterSpacing: 3, color: '#9aa6b8'}}>ВЫ</div>
          <div style={{fontFamily: MONO, fontSize: 52, color: '#f5d27a'}}>{floor} ЭТ.</div>
        </div>
      </div>
    </Body>
  );
};

// ---------- 1st floor: mailboxes, radiator, the bag on the floor in a cone of cold light ----------
export const Mailboxes: React.FC<{t: number; push?: number; bag?: number}> = ({t, push = 0, bag = 1}) => {
  const flick = Math.sin(t * 19) > 0.9 || Math.sin(t * 7.3) > 0.97 ? 0.55 : 1;
  const r = mulberry32(31);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="mb-cone" cx="50%" cy="0%" r="100%"><stop offset="0" stopColor={K.tubeGlow} stopOpacity={0.42 * flick} /><stop offset="0.7" stopColor={K.tubeGlow} stopOpacity="0" /></radialGradient>
        <linearGradient id="mb-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1817" /><stop offset="1" stopColor="#0c0b0b" /></linearGradient>
      </defs>
      <g transform={`translate(${540 - 540 * (1 + push)} ${900 - 900 * (1 + push)}) scale(${1 + push})`}>
        <rect width={1080} height={1920} fill={K.tealDark} />
        <rect y={0} width={1080} height={560} fill={K.white} opacity={0.32} />
        <rect y={556} width={1080} height={10} fill="#0f2a2d" />
        {/* mailbox wall: 4 rows x 6, metal doors with numbers; #36 is ours, its door ajar */}
        <rect x={110} y={600} width={820} height={520} fill="#1c252d" />
        {Array.from({length: 4}, (_, row) => Array.from({length: 6}, (_, col) => {
          const num = 13 + row * 6 + col + (row > 2 ? 0 : 0), x = 130 + col * 133, y = 618 + row * 124, ours = num === 36;
          return <g key={`${row}-${col}`}>
            <rect x={x} y={y} width={120} height={110} fill={ours ? K.metalLit : K.metal} />
            <rect x={x + 14} y={y + 16} width={92} height={14} rx={7} fill="#20282f" />
            <text x={x + 60} y={y + 76} fontFamily={MONO} fontSize={30} fill={ours ? '#f5d27a' : '#a8b3bd'} textAnchor="middle">{num}</text>
            <circle cx={x + 100} cy={y + 90} r={6} fill="#2a333b" />
            {r() > 0.7 && <rect x={x + 20} y={y + 36} width={50 + r() * 30} height={8} fill="#d8cfb8" opacity={0.7} transform={`rotate(${r() * 6 - 3} ${x + 40} ${y + 40})`} />}
          </g>;
        }))}
        {/* radiator */}
        <g transform="translate(130 1180)">{Array.from({length: 8}, (_, i) => <rect key={i} x={i * 32} y={0} width={24} height={160} rx={10} fill="#3c4a4c" />)}</g>
        {/* floor tiles */}
        <rect y={1350} width={1080} height={570} fill="url(#mb-floor)" />
        {Array.from({length: 7}, (_, i) => <path key={i} d={`M ${-200 + i * 220} 1350 L ${-700 + i * 380} 1920`} stroke="#000" strokeOpacity={0.3} strokeWidth={4} />)}
        {Array.from({length: 5}, (_, i) => <line key={i} x1={0} x2={1080} y1={1350 + i * i * 28 + i * 30} y2={1350 + i * i * 28 + i * 30} stroke="#000" strokeOpacity={0.3} strokeWidth={4} />)}
        {/* the bag: yellow paper delivery bag with a sticker */}
        <g transform={`translate(640 ${1190 + (1 - bag) * 40})`} opacity={bag}>
          <ellipse cx={0} cy={250} rx={170} ry={26} fill="#000" opacity={0.5} />
          <path d="M -140 30 L 140 30 L 160 250 L -160 250 Z" fill={K.bag} />
          <path d="M -140 30 L -100 -10 L 100 -10 L 140 30 Z" fill={K.bagDark} />
          <path d="M -60 30 C -60 -60 60 -60 60 30" stroke="#7a5a1e" strokeWidth={10} fill="none" />
          <rect x={-80} y={110} width={160} height={90} fill="#f3ecdc" transform="rotate(-4)" />
          <text x={0} y={152} fontFamily={MONO} fontSize={26} fill="#222" textAnchor="middle" transform="rotate(-4)">кв. 36</text>
          <rect x={-50} y={168} width={100} height={8} fill="#222" transform="rotate(-4)" />
        </g>
        {/* lamp + cold cone */}
        <rect x={380} y={60} width={320} height={26} rx={6} fill="#1b1f24" /><rect x={392} y={84} width={296} height={12} rx={6} fill={K.tube} opacity={flick} />
        <path d="M 380 96 L 700 96 L 1080 1920 L 0 1920 Z" fill="url(#mb-cone)" />
        {/* entrance door at the right edge, street light leaking under it */}
        <rect x={930} y={480} width={150} height={870} fill={K.doorDark} />
        <rect x={930} y={1340} width={150} height={10} fill="#e9c77a" opacity={0.6} />
      </g>
    </svg>
  );
};

// close shot of the bag: sticker with the order and the flat number
export const BagClose: React.FC<{t: number}> = ({t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute'}}>
    <defs><radialGradient id="bc-l" cx="50%" cy="30%" r="70%"><stop offset="0" stopColor="#fff3cf" stopOpacity="0.25" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
    <rect width={1080} height={1920} fill="#0f0d0c" />
    <g transform={`translate(${SAFE.cx} ${880 + Math.sin(t * 1.2) * 4}) rotate(${-3 + wobble(t * 0.4, 2)})`}>
      <path d="M -330 -260 L 330 -260 L 380 520 L -380 520 Z" fill={K.bag} />
      <path d="M -330 -260 L -250 -360 L 250 -360 L 330 -260 Z" fill={K.bagDark} />
      <path d="M -130 -260 C -130 -480 130 -480 130 -260" stroke="#7a5a1e" strokeWidth={22} fill="none" />
      {Array.from({length: 9}, (_, i) => <line key={i} x1={-300 + i * 75} y1={-240} x2={-320 + i * 80} y2={500} stroke={K.bagDark} strokeOpacity={0.25} strokeWidth={3} />)}
      <g transform="rotate(-5)">
        <rect x={-240} y={-60} width={480} height={300} fill="#f6f1e4" />
        <text x={-210} y={-6} fontFamily={MONO} fontSize={34} fill="#555">ЗАКАЗ №3607</text>
        <text x={-210} y={64} fontFamily={MONT} fontWeight={900} fontSize={76} fill={C.ink}>кв. 36</text>
        <text x={-210} y={124} fontFamily={MONO} fontSize={32} fill={C.red}>ПОЛУЧАТЕЛЬ: ТЫ</text>
        {Array.from({length: 26}, (_, i) => <rect key={i} x={-210 + i * 16} y={150} width={i % 3 ? 6 : 10} height={66} fill="#222" />)}
      </g>
    </g>
    <rect width={1080} height={1920} fill="url(#bc-l)" />
  </svg>
);

// thermal receipt: lines print in one by one (`p` 0..1), your number marked, order time ringed in red
export const Receipt: React.FC<{f: number; fps: number; at: number; ringAt: number; markAt: number}> = ({f, fps, at, ringAt, markAt}) => {
  const t = f / fps;
  const p = spring01(f, at * fps, fps, 1.4, 0.6);
  const rows: [string, string, string?][] = [
    ['ДОСТАВКА 24/7', ''], ['ЗАКАЗ №3607', ''], ['--------------------', ''], ['Получатель', 'кв. 36'], ['Телефон', '+7 •••-36-07', 'mark'],
    ['Адрес', 'СПАЛЬНЯ'], ['Курьер', 'Артём'], ['--------------------', ''], ['Время заказа', '03:07', 'ring'], ['Оплачено', '✓'],
  ];
  const ring = easeOut((t - ringAt) / 0.4), mark = easeOut((t - markAt) / 0.3);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #2a2420 0%, #120f0d 70%)'}}>
      <div style={{position: 'absolute', left: SAFE.cx - 300, top: 230 + (1 - clamp(p)) * 600, width: 600, height: 1180, transform: `rotate(${2 - 2 * clamp(p)}deg)`,
        background: 'linear-gradient(180deg, #fbf9f2 0%, #f1ecdf 100%)', filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.6))',
        clipPath: 'polygon(0 0, 100% 0, 100% 97%, 95% 100%, 90% 97%, 85% 100%, 80% 97%, 75% 100%, 70% 97%, 65% 100%, 60% 97%, 55% 100%, 50% 97%, 45% 100%, 40% 97%, 35% 100%, 30% 97%, 25% 100%, 20% 97%, 15% 100%, 10% 97%, 5% 100%, 0 97%)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 50, display: 'flex', justifyContent: 'center'}}><Icon name="shopping-bag" size={90} color="#222" stroke={1.6} /></div>
        {rows.map(([a, b, kind], i) => {
          const y = 180 + i * 84;
          return (
            <div key={i} style={{position: 'absolute', left: 50, right: 50, top: y, display: 'flex', justifyContent: b ? 'space-between' : 'center', fontFamily: MONO, fontSize: 38, color: '#222',
              opacity: clamp((t - at - 0.1 - i * 0.07) / 0.1)}}>
              <span style={{fontWeight: i < 2 ? 700 : 400, fontSize: i < 2 ? 44 : 38}}>{a}</span>
              {b && <span style={{position: 'relative', color: kind === 'ring' ? C.red : '#222', fontSize: kind === 'ring' ? 54 : 38, marginTop: kind === 'ring' ? -8 : 0}}>
                {kind === 'mark' && <span style={{position: 'absolute', left: -8, right: -8, top: 8, bottom: 2, background: '#f5e04a', opacity: 0.85, transform: `scaleX(${mark})`, transformOrigin: '0 50%', zIndex: -1}} />}
                <span style={{position: 'relative'}}>{b}</span>
              </span>}
            </div>
          );
        })}
        {/* hand-drawn red ring around 03:07 */}
        <svg width={600} height={1180} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <path d="M 560 832 C 580 760 360 750 352 820 C 345 890 560 900 572 836 C 578 800 520 770 470 772" fill="none" stroke={C.red} strokeWidth={7} strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} />
        </svg>
        <div style={{position: 'absolute', left: 60, right: 60, top: 1040, display: 'flex', gap: 5, height: 80, opacity: clamp((t - at - 0.9) / 0.2)}}>
          {Array.from({length: 40}, (_, i) => <div key={i} style={{flex: i % 4 ? 1 : 2.5, background: '#222'}} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- the polaroid: the bedroom shot from inside; the clue is in the wardrobe mirror ----------
// Drawn in its own 600x600 space; `clue` 0..1 scales how readable the figure in the mirror is (always subtle).
export const BedroomShot: React.FC<{t: number; clue?: number}> = ({t, clue = 1}) => (
  <svg viewBox="0 0 600 600" width="100%" height="100%" style={{display: 'block'}}>
    <defs>
      <radialGradient id="bs-flash" cx="45%" cy="55%" r="65%"><stop offset="0" stopColor="#fff6dc" stopOpacity="0.38" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></radialGradient>
      <linearGradient id="bs-mirror" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b4656" /><stop offset="1" stopColor="#1d242f" /></linearGradient>
    </defs>
    <rect width={600} height={600} fill="#2b2a33" />
    <rect y={380} width={600} height={220} fill="#3a2e28" />
    {/* window with the moon */}
    <rect x={40} y={70} width={150} height={190} fill="#18213a" /><circle cx={140} cy={120} r={22} fill="#e9e1c6" opacity={0.85} />
    <rect x={112} y={70} width={6} height={190} fill="#2b2a33" /><rect x={40} y={160} width={150} height={6} fill="#2b2a33" />
    {/* bed with the same yellow bag on it */}
    <path d="M 150 380 L 430 380 L 470 520 L 110 520 Z" fill="#c9c3b5" />
    <rect x={140} y={330} width={300} height={60} rx={10} fill="#a49c8d" />
    <rect x={120} y={510} width={360} height={30} fill="#5a4234" />
    <rect x={180} y={340} width={110} height={44} rx={16} fill="#ecebe4" />
    <g transform="translate(330 352)"><path d="M -38 0 L 38 0 L 44 62 L -44 62 Z" fill={K.bag} /><path d="M -16 0 C -16 -26 16 -26 16 0" stroke="#7a5a1e" strokeWidth={4} fill="none" /></g>
    {/* nightstand with the clock 03:07 (a decoy) */}
    <rect x={40} y={380} width={90} height={110} fill="#4a3428" />
    <rect x={48} y={350} width={74} height={34} rx={4} fill="#111" /><text x={85} y={376} fontFamily={MONO} fontSize={24} fill="#ff3b3b" textAnchor="middle">03:07</text>
    {/* wardrobe with a mirror door: the reflected doorway shows a figure in a courier cap with a yellow box bag */}
    <rect x={470} y={90} width={130} height={420} fill="#4f3a2c" />
    <rect x={484} y={110} width={102} height={380} fill="url(#bs-mirror)" />
    <g opacity={0.55 + 0.45 * clue}>
      <rect x={518} y={196} width={56} height={210} fill="#4a5262" /><rect x={518} y={196} width={56} height={210} fill="#e9c77a" opacity={0.12} />
      <g transform="translate(546 268)">
        <ellipse cx={0} cy={0} rx={13} ry={15} fill="#07080b" />
        <path d="M -15 -6 Q 0 -22 15 -6 L 24 -3 L -15 -2 Z" fill="#0a0c10" />
        <path d="M -18 14 L 18 14 L 22 80 L -22 80 Z" fill="#0a0c10" />
        <rect x={12} y={12} width={24} height={30} fill={K.amber} opacity={0.75 * clue} />
      </g>
    </g>
    <path d="M 490 120 L 520 120 L 490 200 Z" fill="#fff" opacity={0.12} />
    <rect width={600} height={600} fill="url(#bs-flash)" />
  </svg>
);

export const Polaroid: React.FC<{t: number; x: number; y: number; w: number; rot?: number; caption?: string; clue?: number; dev?: number}> =
  ({t, x, y, w, rot = 0, caption = 'кв. 36 · 03:07', clue = 1, dev = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: w * 1.2, transform: `rotate(${rot}deg)`, background: '#f4f1ea', padding: w * 0.06,
    boxShadow: '0 24px 40px rgba(0,0,0,0.6)', boxSizing: 'border-box'}}>
    <div style={{width: '100%', aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden', background: '#111'}}>
      <div style={{position: 'absolute', inset: 0, opacity: dev, filter: `saturate(${0.4 + 0.6 * dev}) brightness(${0.6 + 0.4 * dev})`}}><BedroomShot t={t} clue={clue} /></div>
    </div>
    <div style={{fontFamily: HAND, fontWeight: 700, fontSize: w * 0.085, color: '#2a2a40', textAlign: 'center', marginTop: w * 0.035}}>{caption}</div>
    <div style={{position: 'absolute', left: w / 2 - w * 0.18, top: -w * 0.05, width: w * 0.36, height: w * 0.09, background: 'rgba(238,226,180,0.72)', transform: 'rotate(-3deg)'}} />
  </div>
);

// magnifier ring for "НАЙДИ УЛИКУ"
export const Lens: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', pointerEvents: 'none', opacity: o}}>
    <circle cx={x} cy={y} r={r} fill="none" stroke="#f5d27a" strokeWidth={8} />
    <circle cx={x} cy={y} r={r + 10} fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={6} />
    <line x1={x + r * 0.72} y1={y + r * 0.72} x2={x + r * 1.25} y2={y + r * 1.25} stroke="#f5d27a" strokeWidth={22} strokeLinecap="round" />
  </svg>
);

// ---------- entrance door from inside: knocks shake it, a shadow of feet in the street light under it ----------
export const EntranceDoor: React.FC<{t: number; knocks: number[]; feet?: number; handle?: number; zoom?: number}> = ({t, knocks, feet = 0, handle = 0, zoom = 0}) => {
  const hit = knocks.reduce((a, k) => a + (t >= k ? Math.exp(-14 * (t - k)) : 0), 0);
  const sx = Math.sin(t * 90) * hit * 10;
  const hy = handle > 0 ? Math.sin(t * 38) * 10 * handle : 0;
  const s = 1 + zoom;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="ed-under" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0c56e" stopOpacity="0.55" /><stop offset="1" stopColor="#f0c56e" stopOpacity="0" /></linearGradient>
        <radialGradient id="ed-flash" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#ff5a4a" stopOpacity={0.35 * Math.min(1, hit)} /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={`translate(${540 - 540 * s} ${1300 - 1300 * s}) scale(${s})`}>
        <rect width={1080} height={1920} fill={K.tealDark} />
        <rect width={1080} height={520} fill={K.white} opacity={0.26} />
        <rect y={516} width={1080} height={10} fill="#0f2a2d" />
        <rect y={1340} width={1080} height={580} fill="#151312" />
        {/* steps up to the door */}
        <rect x={180} y={1320} width={720} height={40} fill="#2a2724" />
        <g transform={`translate(${sx} 0)`}>
          <rect x={250} y={300} width={580} height={1030} fill={K.door} />
          <rect x={280} y={330} width={520} height={460} fill="#44332b" /><rect x={280} y={820} width={520} height={470} fill="#44332b" />
          {Array.from({length: 14}, (_, i) => <circle key={i} cx={270 + (i % 2) * 540} cy={340 + Math.floor(i / 2) * 140} r={7} fill="#5c483c" />)}
          {/* handle (rattles) and lock */}
          <g transform={`rotate(${hy} 300 820)`}><rect x={290} y={808} width={110} height={24} rx={12} fill="#b9b2a2" /></g>
          <rect x={290} y={860} width={30} height={60} rx={6} fill="#8f897b" />
          {/* intercom: calls flat 36 by itself */}
          <rect x={660} y={600} width={120} height={180} rx={10} fill="#1c1f24" />
          <rect x={675} y={615} width={90} height={44} fill={Math.sin(t * 6) > 0 ? '#3cff8a' : '#123d24'} opacity={0.9} />
          <text x={720} y={648} fontFamily={MONO} fontSize={30} fill="#06200f" textAnchor="middle">36</text>
          {Array.from({length: 9}, (_, i) => <circle key={i} cx={690 + (i % 3) * 30} cy={690 + Math.floor(i / 3) * 28} r={9} fill="#3a3f47" />)}
        </g>
        {/* street light under the door + shadow of two feet */}
        <rect x={250} y={1326} width={580} height={8} fill="#f0c56e" opacity={0.9} />
        <path d="M 250 1334 L 830 1334 L 960 1600 L 120 1600 Z" fill="url(#ed-under)" />
        {feet > 0 && <g opacity={feet}>
          <rect x={430} y={1326} width={80} height={8} fill="#0b0a09" /><rect x={570} y={1326} width={80} height={8} fill="#0b0a09" />
          <path d="M 430 1334 L 510 1334 L 560 1600 L 420 1600 Z" fill="#000" opacity={0.55} />
          <path d="M 570 1334 L 650 1334 L 720 1600 L 580 1600 Z" fill="#000" opacity={0.55} />
        </g>}
        <rect width={1080} height={1920} fill="url(#ed-flash)" />
      </g>
    </svg>
  );
};

// ---------- evidence board: grows every part ----------
export type Pin = {id: string; x: number; y: number; at: number; rot?: number; pinDy?: number; node: React.ReactNode};
export const EvidenceBoard: React.FC<{f: number; fps: number; title: string; pins: Pin[]; threads: [string, string, number][]; center?: [number, number]}> =
  ({f, fps, title, pins, threads}) => {
  const t = f / fps;
  const pos = Object.fromEntries(pins.map((p) => [p.id, [p.x, p.y]]));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 65% at 50% 45%, #4a3524 0%, ${K.cork} 45%, #120c07 100%)`}} />
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.25}}>
        {Array.from({length: 500}, (_, i) => { const r = mulberry32(i + 3); return <circle key={i} cx={r() * 1080} cy={r() * 1920} r={1 + r() * 2.5} fill={i % 2 ? '#1a1108' : '#6b4d30'} />; })}
      </svg>
      <div style={{position: 'absolute', left: SAFE.cx, top: SAFE.top + 30, transform: 'translateX(-50%) rotate(-2deg)', background: C.paper, padding: '10px 30px',
        fontFamily: MONT, fontWeight: 900, fontSize: 44, color: C.ink, letterSpacing: 2, whiteSpace: 'nowrap', boxShadow: '0 10px 18px rgba(0,0,0,0.5)'}}>{title}</div>
      <svg width={1080} height={1920} style={{position: 'absolute', pointerEvents: 'none'}}>
        {threads.map(([a, b, at], i) => {
          const p = easeInOut((t - at) / 0.5);
          if (p <= 0 || !pos[a] || !pos[b]) return null;
          const [ax, ay] = pos[a], [bx, by] = pos[b], mx = (ax + bx) / 2, my = (ay + by) / 2 + 60;
          return <g key={i}>
            <path d={`M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`} stroke="#000" strokeOpacity={0.35} strokeWidth={8} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} transform="translate(4 8)" />
            <path d={`M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`} stroke="#e0383b" strokeWidth={6} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" />
          </g>;
        })}
      </svg>
      {pins.map((p) => {
        const k = spring01(f, p.at * fps, fps, 2, 0.55);
        if (k <= 0) return null;
        return <div key={p.id} style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%, -50%) rotate(${p.rot ?? 0}deg) scale(${0.7 + 0.3 * clamp(k)})`, opacity: clamp(k * 2)}}>{p.node}</div>;
      })}
      <svg width={1080} height={1920} style={{position: 'absolute', pointerEvents: 'none'}}>
        {pins.filter((p) => t >= p.at).map((p) => <g key={p.id}><circle cx={p.x} cy={p.y + (p.pinDy ?? 0)} r={14} fill="#b8262a" /><circle cx={p.x - 4} cy={p.y + (p.pinDy ?? 0) - 4} r={5} fill="#ff8a8a" /></g>)}
      </svg>
    </AbsoluteFill>
  );
};

// small paper card for the board
export const Card: React.FC<{w: number; children: React.ReactNode; bg?: string; color?: string}> = ({w, children, bg = C.paper, color = C.ink}) => (
  <div style={{width: w, background: bg, color, padding: '18px 22px', fontFamily: MONO, fontSize: 32, lineHeight: 1.2, boxShadow: '0 14px 22px rgba(0,0,0,0.55)', textAlign: 'center'}}>{children}</div>
);

// comment bubble with a typing reveal: "Я нашёл улику: …"
export const CommentBubble: React.FC<{f: number; fps: number; at: number; text: string; x: number; y: number}> = ({f, fps, at, text, x, y}) => {
  const t = f / fps;
  const p = spring01(f, at * fps, fps, 2, 0.6);
  if (p <= 0) return null;
  const n = Math.floor(clamp((t - at - 0.3) / 1.2) * text.length);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 620, transform: `scale(${clamp(p)})`, transformOrigin: '10% 100%', display: 'flex', gap: 18, alignItems: 'flex-end'}}>
      <div style={{width: 76, height: 76, flex: 'none', borderRadius: 38, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="user" size={44} color="#fff" /></div>
      <div style={{background: '#fff', borderRadius: '34px 34px 34px 8px', padding: '20px 28px', fontFamily: UI, fontSize: 38, color: '#222', flex: 1}}>
        <div style={{fontSize: 26, fontWeight: 800, color: '#3b82f6', marginBottom: 4}}>ты</div>
        {text.slice(0, n)}<span style={{opacity: Math.sin(t * 9) > 0 ? 1 : 0}}>|</span>
      </div>
    </div>
  );
};
