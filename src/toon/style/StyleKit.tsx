// The «Красная нить» style kit (docs/strategy/СТИЛЬ_И_ФОРМАТ.md): a cold night palette where red is used only for the
// thread and for danger, three candidate heroes (A big head = sleep/Hero.tsx, B silhouette, C pictogram), the x-ray
// "inside" body with the red thread of damage, and the shared text pieces (title, rule card, subtitle, HUD).
// Every figure uses the sleep hero's coordinates: origin = the base of the neck, head centre at y -150, `s` scales.
import React from 'react';
import {ik2, P} from '../lib/anim';
import {MONO, MONT} from '../case/Kit';

export const PAL = {
  night: '#0a111c', wallTop: '#1d2a3d', wallLow: '#142031', floor: '#0d141f', line: '#2a3a52',
  cold: '#9fc3ff', ice: '#cfe0f5', paper: '#f3ecdc', ink: '#10141c', thread: '#ff3b47', threadGlow: '#ff2d3d',
  door: '#2a3243', doorQuilt: '#1f2633', metal: '#b9c2cf',
  xBody: '#0f2c48', xLine: '#8fd8ff', xBone: '#cfe9ff', brain: '#e9a9b9', brainFold: '#b9788a', lung: '#8fb8d8', heart: '#b34a5c',
};

// a navy hoodie for hero A in this world (the sleep video keeps its ochre one)
export const NAVY = {hood: '#2c3e5c', hoodShade: '#1f2d44', hoodDark: '#16202f', string: '#e8eef6'};

export type Arm = {x: number; y: number} | null | undefined;
// the same elbow rule as the sleep hero: the elbow goes to the outside of the body
export const armPts = (k: number, sh: P, h: {x: number; y: number}, l1 = 176, l2 = 166) => {
  const A = ik2(sh, h, l1, l2, 1), B = ik2(sh, h, l1, l2, -1);
  return k * A.mid.x > k * B.mid.x ? A : B;
};

// ---------- the red thread: a sagging string between pins ----------
export const Thread: React.FC<{pts: P[]; sag?: number; pins?: boolean; o?: number; w?: number}> = ({pts, sag = 0.12, pins = true, o = 1, w = 3.5}) => {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], dx = Math.abs(b.x - a.x);
    d += ` Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + 10 + dx * sag} ${b.x} ${b.y}`;
  }
  return (
    <g opacity={o}>
      <path d={d} stroke={PAL.threadGlow} strokeWidth={w * 4} strokeOpacity={0.22} fill="none" strokeLinecap="round" />
      <path d={d} stroke={PAL.thread} strokeWidth={w} fill="none" strokeLinecap="round" />
      {pins && [pts[0], pts[pts.length - 1]].map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r={9} fill={PAL.thread} /><circle cx={p.x - 2} cy={p.y - 2} r={3} fill="#fff" opacity={0.8} /></g>)}
    </g>
  );
};

// ---------- hero B: a dark silhouette, white eyes, one red detail ----------
export type FigSpec = {x: number; y: number; s?: number; lookX?: number; lookY?: number; tilt?: number; handL?: Arm; handR?: Arm; rim?: string};
export const Silhouette: React.FC<FigSpec> = ({x, y, s = 1, lookX = 0, lookY = 0, tilt = 0, handL, handR, rim = PAL.cold}) => {
  const body = '#05070b';
  const arm = (k: number, h: Arm) => {
    if (!h) return null;
    const sh = {x: k * 120, y: 70}, {mid, end} = armPts(k, sh, h);
    return <g key={k}>
      <path d={`M ${sh.x} ${sh.y} L ${mid.x} ${mid.y} L ${end.x} ${end.y}`} stroke={body} strokeWidth={60} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={end.x} cy={end.y} r={30} fill={body} />
      {/* the one red detail: a thread tied around the wrist */}
      {k === 1 && (() => { const wx = mid.x + (end.x - mid.x) * 0.8, wy = mid.y + (end.y - mid.y) * 0.8, a = Math.atan2(end.y - mid.y, end.x - mid.x) * 180 / Math.PI + 90;
        return <g transform={`translate(${wx} ${wy}) rotate(${a})`}><rect x={-33} y={-5} width={66} height={10} rx={5} fill={PAL.thread} /><path d="M 30 0 q 22 18 10 44" stroke={PAL.thread} strokeWidth={5} fill="none" strokeLinecap="round" /></g>; })()}
    </g>;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -150 84 C -150 36 -110 14 -58 8 L 58 8 C 110 14 150 36 150 84 L 170 640 L -170 640 Z" fill={body} />
      <path d="M 116 22 C 146 38 154 70 158 130" stroke={rim} strokeWidth={6} fill="none" opacity={0.7} strokeLinecap="round" />
      <rect x={-30} y={-40} width={60} height={56} fill={body} />
      <g transform={`translate(0 -150) rotate(${tilt})`}>
        <ellipse cx={0} cy={0} rx={114} ry={128} fill={body} />
        <path d="M -70 -112 C -30 -132 40 -132 84 -104" stroke={rim} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
        {[-1, 1].map((k) => <g key={k} transform={`translate(${k * 42 + lookX * 14} ${-6 + lookY * 8})`}>
          <ellipse cx={0} cy={0} rx={20} ry={27} fill="#f4f7fb" />
          <circle cx={lookX * 8} cy={lookY * 8} r={7} fill={body} />
        </g>)}
      </g>
      {arm(-1, handL)}{arm(1, handR)}
    </g>
  );
};

// ---------- hero C: a safety-instruction pictogram (no face, head apart from the body) ----------
export const Pictogram: React.FC<FigSpec & {color?: string}> = ({x, y, s = 1, tilt = 0, handL, handR, color = '#dfe6ee'}) => {
  const arm = (k: number, h: Arm) => {
    if (!h) return null;
    const sh = {x: k * 96, y: 70}, {mid, end} = armPts(k, sh, h, 168, 160);
    return <path key={k} d={`M ${sh.x} ${sh.y} L ${mid.x} ${mid.y} L ${end.x} ${end.y}`} stroke={color} strokeWidth={66} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-112} y={0} width={224} height={640} rx={70} fill={color} />
      <circle cx={0} cy={-150} r={108} fill={color} transform={`rotate(${tilt} 0 0)`} />
      {arm(-1, handL)}{arm(1, handR)}
    </g>
  );
};

// ---------- the x-ray body, in hero A's coordinates (pose: tilt 0, turn 0) ----------
// `hot` marks the parts the red thread runs through; the thread itself is drawn by the episode on top.
export const XRayBody: React.FC<{x: number; y: number; s?: number; handL?: Arm; handR?: Arm; hot?: {brain?: boolean; hippo?: boolean}}> = ({x, y, s = 1, handL, handR, hot = {}}) => {
  const sleeve = (k: number, h: Arm) => {
    if (!h) return null;
    const sh = {x: k * 126, y: 66}, {mid, end} = armPts(k, sh, h);
    const d = `M ${sh.x} ${sh.y} L ${mid.x} ${mid.y} L ${end.x} ${end.y}`;
    return <g key={k}>
      <path d={d} stroke={PAL.xLine} strokeWidth={66} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
      <path d={d} stroke={PAL.xBody} strokeWidth={56} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={PAL.xBone} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
    </g>;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* torso: hoodie outline, ribs, lungs, heart, spine */}
      <path d="M -150 84 C -150 36 -110 14 -58 8 L 58 8 C 110 14 150 36 150 84 L 176 620 L -176 620 Z" fill={PAL.xBody} stroke={PAL.xLine} strokeWidth={5} />
      {[-1, 1].map((k) => <path key={k} d={`M ${k * 14} 150 C ${k * 92} 120 ${k * 118} 210 ${k * 104} 330 C ${k * 92} 400 ${k * 36} 410 ${k * 18} 360 Z`} fill={PAL.lung} opacity={0.55} />)}
      {Array.from({length: 6}, (_, i) => [-1, 1].map((k) => <path key={`${i}${k}`} d={`M ${k * 10} ${120 + i * 46} C ${k * 70} ${100 + i * 46} ${k * 130} ${130 + i * 46} ${k * 126} ${170 + i * 48}`} stroke={PAL.xBone} strokeWidth={8} fill="none" opacity={0.42} strokeLinecap="round" />))}
      <path d="M -26 230 C -70 200 -86 260 -46 300 L -6 336 L 18 290 C 36 250 10 214 -26 230 Z" fill={PAL.heart} opacity={0.9} />
      {Array.from({length: 13}, (_, i) => <rect key={i} x={-11} y={-40 + i * 40} width={22} height={30} rx={8} fill={PAL.xBone} opacity={0.55} />)}
      {/* head: outline, skull, brain with folds, hippocampus, eyes */}
      <g transform="translate(0 -150)">
        <path d="M -118 -10 C -122 -92 -80 -140 0 -140 C 80 -140 122 -92 118 -10 C 114 72 70 126 0 129 C -70 126 -114 72 -118 -10 Z" fill={PAL.xBody} stroke={PAL.xLine} strokeWidth={5} />
        <path d="M -100 -14 C -104 -82 -66 -122 0 -122 C 66 -122 104 -82 100 -14 C 98 40 70 70 40 82 L -40 82 C -70 70 -98 40 -100 -14 Z" fill="none" stroke={PAL.xBone} strokeWidth={6} opacity={0.5} />
        <path d="M -86 -10 C -92 -70 -56 -108 0 -108 C 58 -108 92 -70 86 -10 C 84 16 60 30 30 26 C 10 36 -14 36 -30 26 C -60 30 -84 16 -86 -10 Z"
          fill={PAL.brain} stroke={hot.brain ? PAL.thread : PAL.brainFold} strokeWidth={hot.brain ? 6 : 4} opacity={0.95} />
        {['M -60 -70 C -40 -86 -10 -70 -20 -50 C -30 -30 0 -24 10 -40', 'M 20 -92 C 40 -70 70 -80 66 -50 C 62 -24 40 -30 34 -10',
          'M -70 -20 C -50 -36 -30 -10 -50 6', 'M 0 -100 C -6 -80 14 -70 4 -56'].map((d, i) => <path key={i} d={d} stroke={PAL.brainFold} strokeWidth={4} fill="none" strokeLinecap="round" />)}
        <path d="M -8 4 C 6 -12 30 -10 34 6 C 38 18 22 24 12 16" stroke={hot.hippo ? PAL.thread : '#f2c14e'} strokeWidth={hot.hippo ? 9 : 7} fill="none" strokeLinecap="round" />
        {[-1, 1].map((k) => <circle key={k} cx={k * 50} cy={44} r={24} fill="none" stroke={PAL.xLine} strokeWidth={4} opacity={0.8} />)}
      </g>
      {sleeve(-1, handL)}{sleeve(1, handR)}
    </g>
  );
};

// ---------- scene: a flat hallway at night (front door, intercom handset, ceiling lamp) ----------
export const Hallway: React.FC<{blink?: number; underDoor?: number}> = ({blink = 1, underDoor = 0.8}) => (
  <g>
    <defs>
      <linearGradient id="hw-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.wallTop} /><stop offset="1" stopColor={PAL.wallLow} /></linearGradient>
      <radialGradient id="hw-lamp" cx="0.5" cy="0"><stop offset="0" stopColor={PAL.cold} stopOpacity={0.32} /><stop offset="1" stopColor={PAL.cold} stopOpacity={0} /></radialGradient>
      <radialGradient id="hw-red"><stop offset="0" stopColor={PAL.thread} stopOpacity={0.55} /><stop offset="1" stopColor={PAL.thread} stopOpacity={0} /></radialGradient>
      <clipPath id="hw-door"><rect x={60} y={520} width={340} height={1080} rx={6} /></clipPath>
    </defs>
    <rect x={0} y={0} width={1080} height={1920} fill="url(#hw-wall)" />
    {Array.from({length: 18}, (_, i) => <rect key={i} x={i * 64 + 20} y={0} width={3} height={1600} fill="#fff" opacity={0.035} />)}
    <rect x={0} y={1600} width={1080} height={320} fill={PAL.floor} />
    <rect x={0} y={1590} width={1080} height={14} fill={PAL.line} />
    <ellipse cx={640} cy={0} rx={700} ry={1300} fill="url(#hw-lamp)" />
    {/* the front door: padded with a quilted diamond pattern and studs */}
    <rect x={44} y={504} width={372} height={1100} rx={8} fill="#141b27" />
    <rect x={60} y={520} width={340} height={1080} rx={6} fill={PAL.door} />
    <g clipPath="url(#hw-door)">
      {Array.from({length: 16}, (_, i) => <g key={i}>
        <line x1={60 + (i - 8) * 90} y1={520} x2={60 + (i - 8) * 90 + 1080} y2={1600} stroke={PAL.doorQuilt} strokeWidth={6} />
        <line x1={400 - (i - 8) * 90} y1={520} x2={400 - (i - 8) * 90 - 1080} y2={1600} stroke={PAL.doorQuilt} strokeWidth={6} />
      </g>)}
      {Array.from({length: 13}, (_, j) => Array.from({length: 5}, (_, i) => <circle key={`${i}-${j}`} cx={60 + i * 90 + (j % 2) * 45} cy={520 + j * 90} r={5} fill={PAL.metal} opacity={0.35} />))}
    </g>
    <ellipse cx={230} cy={600} rx={58} ry={34} fill="#d9dee6" stroke="#141b27" strokeWidth={4} />
    <text x={230} y={614} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={38} fill={PAL.ink}>84</text>
    <circle cx={230} cy={760} r={11} fill="#0b0f16" stroke={PAL.metal} strokeWidth={3} />
    <rect x={350} y={1040} width={36} height={14} rx={7} fill={PAL.metal} />
    {/* light from under the door: something stands behind it */}
    <ellipse cx={230} cy={1600} rx={220} ry={30} fill="url(#hw-red)" opacity={underDoor} />
    <rect x={70} y={1594} width={320} height={6} fill={PAL.thread} opacity={0.5 * underDoor} />
    {/* the intercom handset on the wall, its red LED */}
    <rect x={440} y={860} width={84} height={210} rx={10} fill="#d8dde5" stroke="#141b27" strokeWidth={4} />
    <rect x={428} y={884} width={30} height={160} rx={14} fill="#c3cad5" stroke="#141b27" strokeWidth={4} />
    <circle cx={500} cy={884} r={8} fill={PAL.thread} opacity={blink} />
    <circle cx={500} cy={884} r={26} fill="url(#hw-red)" opacity={blink} />
    {Array.from({length: 4}, (_, i) => <rect key={i} x={474} y={940 + i * 22} width={36} height={6} rx={3} fill="#9aa3b1" />)}
  </g>
);

// ---------- text pieces (screen space, inside the TikTok safe zone) ----------
export const Title: React.FC<{lines: (string | [string, 'red'])[]; y?: number; size?: number}> = ({lines, y = 190, size = 84}) => (
  <div style={{position: 'absolute', left: 60, width: 880, top: y, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: size, lineHeight: 1.02, color: '#fff', letterSpacing: -1, textShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>
    {lines.map((l, i) => <div key={i} style={{color: Array.isArray(l) ? PAL.thread : '#fff'}}>{Array.isArray(l) ? l[0] : l}</div>)}
    {/* the brand stitch under every title: a short red thread with two pins */}
    <svg width={340} height={40} style={{display: 'block', margin: '14px auto 0'}}><path d="M 14 20 Q 90 38 170 20 Q 250 2 326 20" stroke={PAL.thread} strokeWidth={4} fill="none" strokeLinecap="round" /><circle cx={14} cy={20} r={7} fill={PAL.thread} /><circle cx={326} cy={20} r={7} fill={PAL.thread} /></svg>
  </div>
);

export const RuleCard: React.FC<{text: string; y: number; n?: number}> = ({text, y, n = 1}) => (
  <div style={{position: 'absolute', left: 120, width: 760, top: y, transform: 'rotate(-2.5deg)', background: PAL.paper, padding: '18px 26px', boxShadow: '0 10px 0 rgba(0,0,0,0.35)',
    fontFamily: MONT, fontWeight: 800, fontSize: 38, color: PAL.ink, display: 'flex', gap: 18, alignItems: 'center'}}>
    <span style={{fontFamily: MONO, fontSize: 30, color: '#fff', background: PAL.ink, padding: '4px 10px', whiteSpace: 'nowrap'}}>ПРАВИЛО {n}</span><span style={{whiteSpace: 'nowrap'}}>{text}</span>
  </div>
);

export const Sub: React.FC<{words: string[]; hot?: number; y?: number; tone?: 'red' | 'white'}> = ({words, hot = -1, y = 1330, tone = 'red'}) => (
  <div style={{position: 'absolute', left: 60, width: 880, top: y, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 70, lineHeight: 1.15}}>
    {words.map((w, i) => i === hot
      ? <span key={i} style={{background: tone === 'red' ? PAL.thread : '#fff', color: tone === 'red' ? '#fff' : PAL.ink, padding: '0 14px', margin: '0 6px', borderRadius: 8}}>{w}</span>
      : <span key={i} style={{color: '#fff', margin: '0 6px', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'}}>{w}</span>)}
  </div>
);

export const Hud: React.FC<{text: string; y: number; x?: number}> = ({text, y, x = 60}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: MONO, fontSize: 34, color: PAL.ice, background: 'rgba(5,9,16,0.6)', padding: '8px 16px', borderLeft: `6px solid ${PAL.thread}`}}>
    <span style={{color: PAL.thread}}>● </span>{text}
  </div>
);

export const Callout: React.FC<{x: number; y: number; title: string; text: string}> = ({x, y, title, text}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 940 - x, fontFamily: MONO, color: PAL.ice}}>
    <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 36, color: '#fff'}}>{title}</div>
    <div style={{fontSize: 30, lineHeight: 1.2, marginTop: 6}}>{text}</div>
  </div>
);
