// More «Ночная гравюра» sets for the first Shorts batch: a bedroom (window, wardrobe, bed, nightstand, desk with a
// monitor seen from behind), the lift cabin and its button panel, shoes on a mat, a phone in hand, a paper rule card.
// Same rules as Linocut.tsx: ink and paper, ochre only for warm light, red only for the key detail.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {MONO, MONT, SAFE} from '../case/Kit';
import {easeOut} from '../lib/anim';
import {LI} from './Linocut';

const Dark: React.FC = () => <rect x={-1500} y={-1500} width={4080} height={4920} fill={LI.ink} />;

// bedroom: window with the moon (top left), wardrobe (right), bed (bottom left), nightstand with the phone
export const LinoRoom: React.FC<{t: number; lamp?: number; phone?: number; desk?: boolean; screen?: number; dawn?: number; bed?: boolean}> =
  ({t, lamp = 0, phone = 0, desk = false, screen = 0, dawn = 0, bed = true}) => <g>
  <Dark />
  {/* window */}
  <rect x={90} y={360} width={360} height={460} fill={dawn > 0 ? LI.paperDim : '#0b0a08'} stroke={LI.paper} strokeWidth={6} />
  {dawn > 0 && <rect x={90} y={360} width={360} height={460} fill={LI.paper} opacity={dawn} />}
  <circle cx={340} cy={470} r={42} fill={LI.paper} opacity={1 - dawn} />
  <line x1={270} y1={360} x2={270} y2={820} stroke={LI.paper} strokeWidth={6} /><line x1={90} y1={590} x2={450} y2={590} stroke={LI.paper} strokeWidth={6} />
  <path d="M 90 820 L 450 820 L 620 1560 L -80 1560 Z" fill="url(#li-wf)" opacity={0.25 + 0.4 * dawn} />
  {/* wardrobe */}
  <rect x={760} y={480} width={300} height={1080} fill={LI.ink} stroke={LI.paper} strokeWidth={5} />
  <line x1={910} y1={480} x2={910} y2={1560} stroke={LI.paper} strokeWidth={4} />
  <rect x={890} y={980} width={8} height={70} fill={LI.paper} /><rect x={922} y={980} width={8} height={70} fill={LI.paper} />
  <rect x={760} y={480} width={150} height={1080} fill="url(#li-wf)" opacity={0.3} />
  <rect x={-1500} y={1560} width={4080} height={1500} fill="#0e0c09" />
  {bed && <g>
    <rect x={40} y={1250} width={560} height={310} fill={LI.ink} stroke={LI.paper} strokeWidth={5} />
    <path d="M 40 1300 Q 320 1250 600 1310 L 600 1470 L 40 1470 Z" fill={LI.paper} />
    <path d="M 40 1300 Q 320 1250 600 1310 L 600 1470 L 40 1470 Z" fill="url(#li-b)" opacity={0.55} />
    <rect x={60} y={1220} width={160} height={70} rx={30} fill={LI.paper} stroke={LI.ink} strokeWidth={4} />
  </g>}
  {/* nightstand, lamp, phone */}
  {!desk && <g>
    <rect x={620} y={1360} width={130} height={200} fill={LI.ink} stroke={LI.paper} strokeWidth={4} />
    <path d="M 650 1250 L 720 1250 L 735 1300 L 635 1300 Z" fill={lamp > 0 ? LI.ochre : LI.ink} stroke={LI.paper} strokeWidth={4} />
    <line x1={685} y1={1300} x2={685} y2={1360} stroke={LI.paper} strokeWidth={5} />
    {lamp > 0 && <path d="M 640 1300 L 730 1300 L 900 1560 L 470 1560 Z" fill={LI.ochre} opacity={0.25 * lamp} />}
    <rect x={650} y={1338} width={70} height={22} rx={5} fill={phone > 0 ? LI.paper : '#26221c'} stroke={LI.paper} strokeWidth={2} />
    {phone > 0 && Array.from({length: 9}, (_, i) => { const a = Math.PI * (1.1 + (0.8 * i) / 8); return <line key={i} x1={685 + Math.cos(a) * 40} y1={1338 + Math.sin(a) * 30} x2={685 + Math.cos(a) * (120 + (i % 2) * 50)} y2={1338 + Math.sin(a) * (90 + (i % 2) * 40)} stroke={LI.paper} strokeWidth={3} opacity={0.7 * phone} />; })}
  </g>}
  {/* desk with a monitor seen from behind: its light falls back onto the player */}
  {desk && <g>
    {screen > 0 && <path d="M 640 820 L 640 1220 L 140 1500 L 140 520 Z" fill={LI.paper} opacity={0.16 * screen} />}
    {screen > 0 && <path d="M 640 820 L 640 1220 L 140 1500 L 140 520 Z" fill="url(#li-wf)" opacity={0.6 * screen} />}
    <rect x={600} y={820} width={70} height={400} fill={LI.ink} stroke={LI.paper} strokeWidth={4} />
    <rect x={590} y={1220} width={90} height={20} fill={LI.ink} stroke={LI.paper} strokeWidth={3} />
  </g>}
</g>;

// the front edge of a desk: hides the legs of a seated figure
export const DeskFront: React.FC = () => <g>
  <rect x={-200} y={1240} width={1000} height={30} fill={LI.paper} />
  <rect x={-200} y={1270} width={1000} height={400} fill={LI.ink} stroke={LI.paper} strokeWidth={4} />
  <rect x={-200} y={1270} width={1000} height={400} fill="url(#li-bh)" opacity={0.3} />
</g>;

// inside the lift cabin: walls with carved panels, a flickering lamp, the button panel on the right wall
export const LinoLift: React.FC<{t: number; flicker?: number; red19?: number}> = ({t, flicker = 0, red19 = 0}) => {
  const on = flicker > 0 ? (Math.sin(t * 31) * Math.sin(t * 11.7) > 0.4 * flicker ? 0.35 : 1) : 1;
  return <g>
    <Dark />
    <rect x={80} y={300} width={920} height={1260} fill="#1d1913" stroke={LI.paper} strokeWidth={6} />
    {[0, 1, 2].map((i) => <rect key={i} x={140 + i * 290} y={380} width={230} height={1100} fill="none" stroke={LI.paper} strokeWidth={3} opacity={0.5} />)}
    <rect x={80} y={300} width={920} height={1260} fill="url(#li-wf)" opacity={0.18 * on} />
    <rect x={380} y={300} width={320} height={30} fill={LI.ochre} opacity={on} />
    <path d="M 380 330 L 700 330 L 900 1560 L 180 1560 Z" fill={LI.ochre} opacity={0.12 * on} />
    <rect x={900} y={760} width={70} height={360} rx={6} fill={LI.ink} stroke={LI.paper} strokeWidth={3} />
    {Array.from({length: 9}, (_, i) => <circle key={i} cx={935} cy={790 + i * 36} r={11} fill="none" stroke={LI.paper} strokeWidth={2.5} />)}
    {red19 > 0 && <><circle cx={935} cy={790 - 40} r={14} fill={LI.red} opacity={red19} /><circle cx={935} cy={750} r={30} fill={LI.red} opacity={0.25 * red19} /></>}
    <rect x={-1500} y={1560} width={4080} height={1500} fill="#0e0c09" />
    <rect x={-1500} y={-1500} width={4080} height={4920} fill="#000" opacity={(1 - on) * 0.5} />
  </g>;
};

// the button panel close up (screen space): 1..9 and a red 19 that should not be there
export const LiftPanel: React.FC<{red19: number; pressed?: number}> = ({red19, pressed = 0}) => (
  <AbsoluteFill style={{background: LI.ink}}>
    <svg width={1080} height={1920}>
      <rect x={290} y={300} width={500} height={1100} rx={20} fill="#1d1913" stroke={LI.paper} strokeWidth={6} />
      {Array.from({length: 10}, (_, i) => {
        const n = i < 9 ? 9 - i : 19, cx = i < 9 ? (i % 2 ? 640 : 440) : 540, cy = i < 9 ? 520 + Math.floor(i / 2) * 170 : 380;
        const red = n === 19, lit = n === pressed;
        return <g key={i} opacity={red ? red19 : 1}>
          <circle cx={cx} cy={cy} r={58} fill={red ? LI.red : lit ? LI.ochre : LI.ink} stroke={LI.paper} strokeWidth={5} />
          <text x={cx} y={cy + 18} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={red ? 52 : 50} fill={red || lit ? LI.ink : LI.paper}>{n}</text>
          {red && <circle cx={cx} cy={cy} r={110} fill={LI.red} opacity={0.18} />}
        </g>;
      })}
    </svg>
  </AbsoluteFill>
);

// two pairs of shoes on a door mat (world coordinates, centred on x, mat top at y)
export const MatShoes: React.FC<{x: number; y: number; wet?: number; s?: number}> = ({x, y, wet = 0, s = 1}) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={-200} y={0} width={400} height={90} fill={LI.ink} stroke={LI.paper} strokeWidth={4} />
  {Array.from({length: 12}, (_, i) => <line key={i} x1={-190 + i * 33} y1={8} x2={-190 + i * 33} y2={82} stroke={LI.paper} strokeWidth={2} opacity={0.4} />)}
  {[-130, -60].map((sx) => <path key={sx} d={`M ${sx} 70 L ${sx} 20 Q ${sx + 10} 0 ${sx + 26} 6 L ${sx + 40} 50 L ${sx + 56} 56 Q ${sx + 62} 70 ${sx + 50} 74 Z`} fill={LI.paper} stroke={LI.ink} strokeWidth={4} />)}
  {[50, 110].map((sx) => <path key={sx} d={`M ${sx} 72 L ${sx + 4} 40 Q ${sx + 20} 30 ${sx + 36} 42 L ${sx + 46} 72 Z`} fill={LI.paper} stroke={LI.ink} strokeWidth={4} />)}
  {wet > 0 && <g opacity={wet}><ellipse cx={0} cy={110} rx={240} ry={22} fill={LI.paper} opacity={0.35} />
    {[-110, -40, 70, 130].map((dx, i) => <path key={i} d={`M ${dx} ${90} q 6 14 0 22 q -6 -8 0 -22 Z`} fill={LI.paper} />)}</g>}
</g>;

// a phone held in a hand, screen content inside (screen space)
export const PhoneHand: React.FC<{children: React.ReactNode; k?: number}> = ({children, k = 1}) => (
  <AbsoluteFill style={{background: LI.ink, opacity: k}}>
    <svg width={1080} height={1920}>
      <rect x={250} y={260} width={580} height={1180} rx={60} fill="#0b0a08" stroke={LI.paper} strokeWidth={8} />
      <circle cx={540} cy={300} r={9} fill={LI.paper} opacity={0.6} />
      <svg x={286} y={340} width={508} height={1030} viewBox="0 0 508 1030">{children}</svg>
      <path d="M 200 1300 Q 160 1500 300 1700 L 700 1700 Q 860 1500 840 1320 L 830 1440 Q 600 1460 260 1440 Z" fill={LI.paper} stroke={LI.ink} strokeWidth={6} />
      <path d="M 200 1300 Q 160 1500 300 1700 L 380 1700 Q 300 1500 260 1440 Z" fill="url(#li-b)" opacity={0.7} />
    </svg>
  </AbsoluteFill>
);

// the closing rule: a paper strip with a carved word in red
export const LinoRule: React.FC<{at: number; text: string}> = ({at, text}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  if (t < at) return null;
  const k = easeOut((t - at) / 0.35);
  return (
    <AbsoluteFill style={{background: `rgba(21,18,14,${0.8 * k})`, alignItems: 'center', justifyContent: 'center', paddingBottom: 300}}>
      <div style={{opacity: k, transform: `translateY(${(1 - k) * 30}px) rotate(-2deg)`, background: LI.paper, padding: '34px 40px', maxWidth: SAFE.right - SAFE.left - 60, boxShadow: '0 14px 0 rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: MONO, fontSize: 30, letterSpacing: 8, color: LI.red, marginBottom: 12}}>ПРАВИЛО</div>
        <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 64, lineHeight: 1.05, color: LI.ink, textTransform: 'uppercase'}}>
          {text.split(/(\*[^*]+\*)/).map((p, i) => p.startsWith('*') ? <span key={i} style={{color: LI.red}}>{p.slice(1, -1)}</span> : <React.Fragment key={i}>{p}</React.Fragment>)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// a mono stamp at the top: time or a status ("03:00", "БЕЗ СНА 19 Ч")
export const LinoStamp: React.FC<{text: string; red?: boolean}> = ({text, red}) => (
  <div style={{position: 'absolute', left: SAFE.cx, top: SAFE.top + 40, transform: 'translateX(-50%)', fontFamily: MONO, fontSize: 52, letterSpacing: 4,
    color: red ? LI.red : LI.paper, background: 'rgba(10,9,7,0.85)', border: `3px solid ${red ? LI.red : LI.paper}`, padding: '4px 22px', whiteSpace: 'nowrap'}}>{text}</div>
);
