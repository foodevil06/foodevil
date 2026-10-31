// Sets for the remade parts 2-3 of «Курьер уже внутри» (the loop: the courier is you from tomorrow, nobody can see
// him, and he films you from the wardrobe). Same flat cold low-key look as Vnutri*.tsx; every value is a pure
// function of time.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, wobble} from '../lib/anim';
import {MONO, MONT, UI} from './Kit';
import {V, Notif} from './Vnutri';
import {LowKey, Person} from './VnutriHall';

// looking out through the gap between the wardrobe doors: gap 0..1 (a crack .. half open), rec draws a viewfinder
export const SlitPOV: React.FC<{t: number; gap: number; children: React.ReactNode; rec?: boolean; stamp?: string}> = ({t, gap, children, rec = false, stamp}) => {
  const w = lerp(70, 760, easeInOut(gap)), x0 = 540 - w / 2, x1 = 540 + w / 2;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill>{children}</AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="sl-l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" /><stop offset="0.85" stopColor="#0d0b09" /><stop offset="1" stopColor="#1c1814" /></linearGradient>
          <linearGradient id="sl-r" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#000" /><stop offset="0.85" stopColor="#0d0b09" /><stop offset="1" stopColor="#1c1814" /></linearGradient>
        </defs>
        <rect x={-10} y={0} width={x0 + 10} height={1920} fill="url(#sl-l)" />
        <rect x={x1} y={0} width={1090 - x1} height={1920} fill="url(#sl-r)" />
        <rect x={x0 - 3} y={0} width={3} height={1920} fill="#3a3229" opacity={0.6} /><rect x={x1} y={0} width={3} height={1920} fill="#3a3229" opacity={0.6} />
      </svg>
      {rec && <>
        <div style={{position: 'absolute', left: 120, top: 260, fontFamily: MONO, fontSize: 40, color: '#e8ecf2', display: 'flex', gap: 14, alignItems: 'center'}}>
          <span style={{width: 26, height: 26, borderRadius: 13, background: V.red, opacity: Math.sin(t * 6) > 0 ? 1 : 0.25}} />REC</div>
        {stamp && <div style={{position: 'absolute', right: 120, top: 262, fontFamily: MONO, fontSize: 36, color: '#e8ecf2'}}>{stamp}</div>}
      </>}
      {rec && <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[[100, 230, 1, 1], [980, 230, -1, 1], [100, 1700, 1, -1], [980, 1700, -1, -1]].map(([x, y, a, b], i) =>
          <path key={i} d={`M ${x} ${y + 70 * b} L ${x} ${y} L ${x + 70 * a} ${y}`} stroke="#e8ecf2" strokeWidth={5} fill="none" opacity={0.8} />)}
      </svg>}
    </AbsoluteFill>
  );
};

// the corridor as seen from inside the wardrobe: you stand facing it (front view). back 0..1 = one step back.
export const CorridorFromWardrobe: React.FC<{t: number; back: number; glow?: number; face?: Partial<React.ComponentProps<typeof Person>>}> = ({t, back, glow = 0.4, face = {}}) => {
  const b = easeInOut(back);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect width={1080} height={1920} fill="#13161b" />
        <rect y={1380} width={1080} height={540} fill="#0e1013" />
        <rect x={120} y={420} width={300} height={960} fill="#0f1216" /><rect x={140} y={440} width={260} height={940} fill="#181c22" />
        <rect x={700} y={500} width={220} height={300} fill="#16202f" />
        <g transform={`translate(540 ${1380 - 40 * b}) scale(${1 - 0.16 * b}) translate(-540 -1380)`}>
          <Person id="cfw" x={540} y={760} s={0.95} phone="none" glow={glow} full {...face} />
        </g>
      </svg>
      <LowKey x={540} y={800} r={60} k={0.85} />
    </AbsoluteFill>
  );
};

// the old phone's screen: a live stream from the wardrobe (greyscale, REC, the wardrobe edges in frame; gap widens
// when "the door opens" in the video)
export const LiveContent: React.FC<{t: number; s: number; back: number; gap: number; stamp: string}> = ({t, s, back, gap, stamp}) => (
  <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: '50%', top: '50%', width: 1080, height: 1920, transform: `translate(-50%, -50%) scale(${s})`, transformOrigin: '50% 50%', filter: 'grayscale(0.85) contrast(1.15)'}}>
      <SlitPOV t={t} gap={0.35 + 0.65 * gap}><CorridorFromWardrobe t={t} back={back} /></SlitPOV>
    </div>
    <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
    <div style={{position: 'absolute', left: 12, top: 12, display: 'flex', gap: 8, alignItems: 'center', fontFamily: MONO, fontSize: 18, color: '#e8ecf2'}}>
      <span style={{width: 12, height: 12, borderRadius: 6, background: V.red, opacity: Math.sin(t * 6) > 0 ? 1 : 0.2}} />LIVE</div>
    <div style={{position: 'absolute', right: 12, top: 12, fontFamily: MONO, fontSize: 18, color: '#e8ecf2'}}>{stamp}</div>
  </div>
);

// a big red count in the middle of the frame ("3", "2", "1")
export const BigCount: React.FC<{t: number; at: number; n: string}> = ({t, at, n}) => {
  const k = t - at;
  if (k < 0 || k > 0.9) return null;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 380, pointerEvents: 'none'}}>
      <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 420, color: V.red, opacity: 1 - clamp((k - 0.5) / 0.4), transform: `scale(${1.25 - 0.25 * easeOut(k / 0.25)})`,
        textShadow: '0 0 60px rgba(226,59,59,0.6)'}}>{n}</div>
    </AbsoluteFill>
  );
};

// the courier app that opens by itself: «Смена начата», the order for you, at 23:47
export const ShiftContent: React.FC<{s: number; t: number; at: number; rows: number[]; clock: string}> = ({s, t, at, rows, clock}) => {
  const k = easeOut((t - at) / 0.3);
  const R: [string, string, boolean][] = [['ПОЛУЧАТЕЛЬ', 'ТЫ', false], ['АДРЕС', 'твой адрес', false], ['ВРЕМЯ', '23:47', true]];
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0b0e14', color: '#fff', fontFamily: UI}}>
      <div style={{position: 'absolute', left: 22 * s, right: 22 * s, top: 16 * s, display: 'flex', justifyContent: 'space-between', fontSize: 18 * s, color: '#c7cfdb', fontWeight: 700}}>
        <span>{clock}</span><span>КУРЬЕР</span></div>
      <div style={{position: 'absolute', left: 16 * s, right: 16 * s, top: 70 * s, opacity: k, transform: `translateY(${(1 - k) * -30 * s}px)`}}>
        <div style={{background: V.red, borderRadius: 16 * s, padding: `${14 * s}px ${18 * s}px`, fontSize: 30 * s, fontWeight: 800}}>Смена начата</div>
      </div>
      <div style={{position: 'absolute', left: 22 * s, top: 160 * s, fontSize: 30 * s, fontWeight: 800, opacity: k}}>Новый заказ</div>
      <div style={{position: 'absolute', left: 22 * s, top: 200 * s, fontSize: 17 * s, color: '#7b8596', fontFamily: MONO, opacity: k}}>№ 2347-1104</div>
      <div style={{position: 'absolute', left: 16 * s, right: 16 * s, top: 240 * s, display: 'flex', flexDirection: 'column', gap: 10 * s}}>
        {R.map(([a, b, red], i) => { const on = t >= rows[i]; return (
          <div key={a} style={{background: on ? (red ? 'rgba(226,59,59,0.12)' : '#1a2130') : '#121722', borderRadius: 14 * s, padding: `${12 * s}px ${16 * s}px`,
            border: `${2 * s}px solid ${on ? (red ? V.red : '#3d5a8a') : 'transparent'}`}}>
            <div style={{fontSize: 15 * s, color: '#7b8596', letterSpacing: 1 * s}}>{a}</div>
            <div style={{fontSize: 26 * s, fontWeight: 800, color: red ? V.red : '#e8ecf2', minHeight: 30 * s, fontFamily: red ? MONO : UI}}>{on ? b : ''}</div>
          </div>); })}
      </div>
    </div>
  );
};

// looking down at your own hands holding the black thermal bag (it is warm: it breathes a little)
export const HandsBag: React.FC<{t: number; breathe: number; label?: boolean}> = ({t, breathe, label = true}) => {
  const b = 1 + 0.012 * breathe * Math.sin(t * 2.4);
  const hand = (k: number) => (
    <g transform={`translate(${540 + k * 330} 1030) scale(${k} 1)`}>
      <path d="M 120 -150 C 40 -170 -10 -110 -20 -40 L -20 160 C 30 220 110 220 160 170 Z" fill="#9a9fa8" />
      {[-120, -50, 20, 90].map((yy, i) => <rect key={i} x={-75} y={yy} width={100} height={52} rx={26} fill={i % 2 ? '#8c919a' : '#959aa3'} />)}
      <rect x={110} y={-200} width={400} height={420} fill="#262c36" />
    </g>
  );
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect width={1080} height={1920} fill="#0c0e11" />
        <g transform={`translate(540 1030) scale(${b}) translate(-540 -1030)`}>
          <rect x={250} y={760} width={580} height={540} rx={34} fill="#09090b" />
          <rect x={250} y={760} width={580} height={70} rx={30} fill="#16181c" />
          {label && <><rect x={360} y={960} width={360} height={190} fill="#cfd3d8" opacity={0.85} transform="rotate(-2 540 1055)" />
            <rect x={390} y={1000} width={230} height={16} fill="#555" /><rect x={390} y={1040} width={160} height={16} fill="#555" /><rect x={390} y={1080} width={110} height={16} fill={V.red} /></>}
        </g>
        {hand(-1)}{hand(1)}
      </svg>
      <LowKey x={540} y={1030} r={64} k={0.85} />
    </AbsoluteFill>
  );
};

// your own front door from the landing; open 0..1 swings it in, showing the dark hall and him (he does not see you)
export const DoorFromLanding: React.FC<{t: number; open: number; flex?: number; him?: number}> = ({t, open, flex = 0, him = 0}) => {
  const o = easeInOut(open), jx = wobble(t * 60, 9) * 6 * flex;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect width={1080} height={1920} fill="#1c2129" />
        <rect y={1500} width={1080} height={420} fill="#14171b" />
        <ellipse cx={540} cy={140} rx={70} ry={20} fill="#cfd8e6" opacity={0.6} />
        <ellipse cx={540} cy={700} rx={600} ry={700} fill="#cfd8e6" opacity={0.04} />
        <rect x={250} y={320} width={580} height={1180} fill="#0c0e11" />
        {/* the hall behind the door, and him in it */}
        <rect x={270} y={340} width={540} height={1160} fill="#07080a" />
        {him > 0 && <g opacity={him}><Person id="dfl" x={540} y={840} s={0.82} phone="chest" glow={1} full /></g>}
        <g transform={`translate(${jx} 0) translate(270 0) scale(${1 - 0.92 * o} 1) translate(-270 0)`}>
          <rect x={270} y={340} width={540} height={1160} fill="#232830" />
          <rect x={310} y={400} width={460} height={480} fill="none" stroke="#1a1e25" strokeWidth={10} />
          <rect x={310} y={940} width={460} height={500} fill="none" stroke="#1a1e25" strokeWidth={10} />
          <circle cx={540} cy={640} r={14} fill="#0a0b0d" stroke="#3d434d" strokeWidth={4} />
          <rect x={720} y={960} width={70} height={18} rx={9} fill="#6a717c" />
          <rect x={490} y={290} width={100} height={30} fill="#2a2f38" /><text x={540} y={313} fill="#8a93a3" fontFamily={MONO} fontSize={24} textAnchor="middle">47</text>
        </g>
      </svg>
      <LowKey x={540} y={900} r={70} k={0.8} />
    </AbsoluteFill>
  );
};

// the series title dropped in the middle of the story: «КУРЬЕР УЖЕ ВНУТРИ», a short red glitch
export const TitleDrop: React.FC<{t: number; at: number; d?: number}> = ({t, at, d = 1.6}) => {
  const k = t - at;
  if (k < 0 || k > d) return null;
  const o = clamp(k / 0.1) * (1 - clamp((k - d + 0.3) / 0.3)), jx = k < 0.35 ? wobble(t * 80, 4) * 16 : 0;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 300, pointerEvents: 'none', opacity: o}}>
      {[['rgba(80,200,255,0.5)', -6], ['rgba(226,59,59,0.9)', 6], ['#fff', 0]].map(([c, dx], i) =>
        <div key={i} style={{position: 'absolute', transform: `translate(${jx + (dx as number)}px, 0)`, fontFamily: MONT, fontWeight: 900, fontSize: 120, color: c as string, textAlign: 'center', lineHeight: 1}}>КУРЬЕР<br />УЖЕ ВНУТРИ</div>)}
    </AbsoluteFill>
  );
};

// a full-frame flash of a face (2-4 frames) for the screamers
export const Flash: React.FC<{t: number; at: number; d?: number; color?: string}> = ({t, at, d = 0.1, color = '#fff'}) =>
  t >= at && t < at + d ? <AbsoluteFill style={{background: color, opacity: 0.85 * (1 - (t - at) / d)}} /> : null;

export const NoteCard: React.FC<{k: number; title: string; red?: boolean}> = ({k, title, red}) => (
  <div style={{position: 'absolute', left: 120, right: 160, top: 360}}><Notif k={k} title={title} red={red} scale={1.6} /></div>
);
