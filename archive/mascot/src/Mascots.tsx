// Channel mascot concepts (flat, outline-free, "Красная нить" palette). Each is drawn around its feet at (0, 0),
// about 420 units tall at scale 1, and takes the same acting props so the chosen one can host any episode:
//   mouth 0..1 (lip sync from the voice), blink 0..1 (1 = open), look [-1..1, -1..1] (pupils), pose, emo.
//   - Yarn «Нитка»: a ball of red yarn in a detective hat; its loose thread is the channel's red thread and can point.
//   - Cat «Полночь»: a black night cat with a red thread scarf and a pocket torch.
//   - Archivist «Архивариус»: a small round-headed keeper of case files, glasses, cap, trench coat, red scarf.
import React from 'react';

export type MascotPose = 'idle' | 'point' | 'wave' | 'shrug';
export type MascotEmo = 'neutral' | 'surprised' | 'sly' | 'worried';
export type MascotProps = {t: number; mouth?: number; blink?: number; look?: [number, number]; pose?: MascotPose; emo?: MascotEmo; x: number; y: number; s?: number; flip?: boolean};

const RED = '#e23b3b', RED_D = '#a8232a', RED_L = '#ff7a72', INK = '#16181f', EYE = '#fbfbf7';

const Eye: React.FC<{x: number; y: number; rx: number; ry: number; look: [number, number]; blink: number; lid: string; iris?: string; pupil?: 'round' | 'slit'; emo: MascotEmo}> =
  ({x, y, rx, ry, look, blink, lid, iris, pupil = 'round', emo}) => {
  const open = Math.max(0.05, blink) * (emo === 'sly' ? 0.55 : 1);
  const pr = emo === 'surprised' ? 0.32 : 0.45;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={iris ?? EYE} />
      {pupil === 'round'
        ? <><circle cx={x + look[0] * rx * 0.35} cy={y + look[1] * ry * 0.3} r={rx * pr} fill={INK} />
            <circle cx={x + look[0] * rx * 0.35 - rx * 0.15} cy={y + look[1] * ry * 0.3 - ry * 0.18} r={rx * 0.14} fill="#fff" /></>
        : <><ellipse cx={x + look[0] * rx * 0.3} cy={y + look[1] * ry * 0.2} rx={rx * (emo === 'surprised' ? 0.42 : 0.24)} ry={ry * 0.78} fill={INK} />
            <circle cx={x + look[0] * rx * 0.3 - rx * 0.2} cy={y - ry * 0.35} r={rx * 0.15} fill="#fff" /></>}
      {/* upper lid closes from the top */}
      <path d={`M ${x - rx - 2} ${y - ry - 2} L ${x + rx + 2} ${y - ry - 2} L ${x + rx + 2} ${y - ry + 2 * ry * (1 - open)} Q ${x} ${y - ry + 2 * ry * (1 - open) + ry * 0.25 * open} ${x - rx - 2} ${y - ry + 2 * ry * (1 - open)} Z`} fill={lid} />
    </g>
  );
};

const Brows: React.FC<{y: number; dx: number; w: number; emo: MascotEmo; color: string; th?: number}> = ({y, dx, w, emo, color, th = 9}) => {
  const lift = emo === 'surprised' ? -16 : emo === 'worried' ? -6 : 0;
  const tilt = emo === 'sly' ? 10 : emo === 'worried' ? -12 : 0;
  return <g stroke={color} strokeWidth={th} strokeLinecap="round">
    <line x1={-dx - w / 2} y1={y + lift + tilt * (emo === 'sly' ? -0.5 : 1)} x2={-dx + w / 2} y2={y + lift - tilt * (emo === 'sly' ? 0.5 : 1)} />
    <line x1={dx - w / 2} y1={y + lift - tilt} x2={dx + w / 2} y2={y + lift + tilt} />
  </g>;
};

const Mouth: React.FC<{x: number; y: number; w: number; open: number; emo: MascotEmo; dark: string; tongue: string; smile?: number}> = ({x, y, w, open, emo, dark, tongue, smile = 1}) => {
  const h = 4 + open * w * 0.55;
  if (open < 0.08 && emo !== 'surprised') {
    const c = emo === 'worried' ? -8 : emo === 'sly' ? 10 : 12 * smile;
    return <path d={`M ${x - w / 2} ${y} Q ${x} ${y + c} ${x + w / 2} ${y - (emo === 'sly' ? 6 : 0)}`} stroke={dark} strokeWidth={7} fill="none" strokeLinecap="round" />;
  }
  const hh = emo === 'surprised' ? Math.max(h, w * 0.5) : h;
  return <g>
    <path d={`M ${x - w / 2} ${y} Q ${x} ${y - 6} ${x + w / 2} ${y} Q ${x + w * 0.42} ${y + hh} ${x} ${y + hh} Q ${x - w * 0.42} ${y + hh} ${x - w / 2} ${y} Z`} fill={dark} />
    {hh > 18 && <ellipse cx={x} cy={y + hh * 0.75} rx={w * 0.22} ry={hh * 0.22} fill={tongue} />}
  </g>;
};

const wrap = (p: MascotProps, children: React.ReactNode) => (
  <g transform={`translate(${p.x} ${p.y}) scale(${(p.s ?? 1) * (p.flip ? -1 : 1)} ${p.s ?? 1})`}>{children}</g>
);

// ---------------- «Нитка»: ball of red yarn ----------------
export const Yarn: React.FC<MascotProps> = (p) => {
  const {t, mouth = 0, blink = 1, look = [0, 0], pose = 'idle', emo = 'neutral'} = p;
  const breathe = Math.sin(t * 2.2) * 0.02, bob = Math.sin(t * 2.2) * 4;
  const sq = 1 + breathe + mouth * 0.015;
  const cy = -175 + bob;
  const tail = `M 112 ${cy + 60} C 190 ${cy + 120} 170 -20 260 -14 S 360 ${-4 + Math.sin(t * 2) * 8} 420 -10`;
  const pointArm = pose === 'point';
  const id = `yr${Math.round(p.x)}`;
  return wrap(p, <>
    <ellipse cx={0} cy={4} rx={130} ry={18} fill="#000" opacity={0.35} />
    {/* legs + shoes */}
    {[-1, 1].map((k) => <g key={k}><rect x={k * 38 - 8} y={-60} width={16} height={56} rx={8} fill={RED_D} /><ellipse cx={k * 42 + k * 6} cy={-4} rx={30} ry={15} fill={INK} /></g>)}
    {/* the loose thread: the channel's red thread */}
    <path d={tail} stroke={RED} strokeWidth={8} fill="none" strokeLinecap="round" />
    {/* body */}
    <defs>
      <radialGradient id={`${id}g`} cx="38%" cy="32%" r="75%"><stop offset="0" stopColor={RED_L} /><stop offset="0.55" stopColor={RED} /><stop offset="1" stopColor={RED_D} /></radialGradient>
      <clipPath id={`${id}c`}><ellipse cx={0} cy={cy} rx={132 / sq} ry={132 * sq} /></clipPath>
    </defs>
    <ellipse cx={0} cy={cy} rx={132 / sq} ry={132 * sq} fill={`url(#${id}g)`} />
    <g clipPath={`url(#${id}c)`} fill="none" strokeLinecap="round">
      {[-90, -50, -10, 30, 70].map((o, i) => <path key={i} d={`M -150 ${cy + o} Q 0 ${cy + o - 70} 150 ${cy + o + 20}`} stroke={i % 2 ? RED_D : RED_L} strokeWidth={7} opacity={0.55} />)}
      {[-60, 0, 60].map((o, i) => <path key={`v${i}`} d={`M ${o - 40} ${cy - 150} Q ${o + 50} ${cy} ${o - 20} ${cy + 150}`} stroke={i % 2 ? RED_L : RED_D} strokeWidth={6} opacity={0.4} />)}
    </g>
    {/* arms: thread with a small knot for a hand */}
    <path d={`M -118 ${cy + 30} Q -165 ${cy + 60} -170 ${cy + (pose === 'wave' ? -40 + Math.sin(t * 9) * 20 : 95)}`} stroke={RED_D} strokeWidth={9} fill="none" strokeLinecap="round" />
    <circle cx={-170} cy={cy + (pose === 'wave' ? -40 + Math.sin(t * 9) * 20 : 95)} r={15} fill={RED} />
    {pointArm
      ? <><path d={`M 120 ${cy + 10} Q 190 ${cy - 30} 250 ${cy - 80}`} stroke={RED_D} strokeWidth={9} fill="none" strokeLinecap="round" /><circle cx={252} cy={cy - 82} r={15} fill={RED} />
          <path d={`M 262 ${cy - 92} L 300 ${cy - 130}`} stroke="#d9dde6" strokeWidth={5} strokeLinecap="round" /></>
      : <><path d={`M 118 ${cy + 30} Q 165 ${cy + 60} 170 ${cy + (pose === 'shrug' ? -10 : 95)}`} stroke={RED_D} strokeWidth={9} fill="none" strokeLinecap="round" /><circle cx={170} cy={cy + (pose === 'shrug' ? -10 : 95)} r={15} fill={RED} /></>}
    {/* face */}
    <Eye x={-44} y={cy - 12} rx={30} ry={38} look={look} blink={blink} lid={RED} emo={emo} />
    <Eye x={44} y={cy - 12} rx={30} ry={38} look={look} blink={blink} lid={RED} emo={emo} />
    <Brows y={cy - 66} dx={44} w={38} emo={emo} color={INK} />
    <ellipse cx={-80} cy={cy + 30} rx={16} ry={9} fill={RED_L} opacity={0.6} /><ellipse cx={80} cy={cy + 30} rx={16} ry={9} fill={RED_L} opacity={0.6} />
    <Mouth x={0} y={cy + 48} w={56} open={mouth} emo={emo} dark="#3a0d10" tongue="#ff8f8f" />
    {/* detective hat */}
    <g transform={`translate(12 ${cy - 120}) rotate(-8)`}>
      <ellipse cx={0} cy={0} rx={92} ry={16} fill={INK} />
      <path d="M -58 -2 C -60 -70 58 -76 56 -2 Z" fill={INK} />
      <rect x={-58} y={-24} width={114} height={16} fill={RED} />
      <path d="M -30 -60 Q 0 -48 30 -60" stroke="#2a2e3a" strokeWidth={6} fill="none" />
    </g>
  </>);
};

// ---------------- «Полночь»: black night cat ----------------
export const Cat: React.FC<MascotProps> = (p) => {
  const {t, mouth = 0, blink = 1, look = [0, 0], pose = 'idle', emo = 'neutral'} = p;
  const B = '#1e2231', B2 = '#2b3146', RIM = '#56658a';
  const bob = Math.sin(t * 2.2) * 4, hy = -280 + bob;
  const scarfTail = `M -40 -170 C -100 -150 ${-150 + Math.sin(t * 3) * 10} -110 ${-200 + Math.sin(t * 3.3) * 14} -120`;
  const wave = pose === 'wave' ? Math.sin(t * 9) * 18 : 0;
  return wrap(p, <>
    <ellipse cx={0} cy={4} rx={120} ry={16} fill="#000" opacity={0.35} />
    {/* tail */}
    <path d={`M 60 -50 C 160 -60 150 -200 ${190 + Math.sin(t * 1.8) * 10} -240`} stroke={B} strokeWidth={26} fill="none" strokeLinecap="round" />
    {/* body */}
    <ellipse cx={0} cy={-105 + bob * 0.5} rx={86} ry={102} fill={B} />
    <ellipse cx={0} cy={-90 + bob * 0.5} rx={50} ry={66} fill={B2} />
    {[-1, 1].map((k) => <ellipse key={k} cx={k * 44} cy={-6} rx={34} ry={18} fill={B} />)}
    {/* paws */}
    <ellipse cx={-80} cy={-110 + bob} rx={22} ry={40} fill={B} transform={`rotate(20 -80 ${-110 + bob})`} />
    {pose === 'point'
      ? <g transform={`rotate(-55 70 ${-150 + bob})`}><ellipse cx={70} cy={-90 + bob} rx={22} ry={60} fill={B} /><circle cx={70} cy={-34 + bob} r={20} fill={B2} /></g>
      : <g transform={`rotate(${pose === 'wave' ? -140 + wave : pose === 'shrug' ? -60 : -20} 70 ${-150 + bob})`}><ellipse cx={70} cy={-110 + bob} rx={22} ry={44} fill={B} /></g>}
    {/* scarf = red thread */}
    <path d={scarfTail} stroke={RED} strokeWidth={18} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-172 + bob} rx={88} ry={22} fill={RED} />
    <ellipse cx={0} cy={-176 + bob} rx={80} ry={12} fill={RED_L} opacity={0.4} />
    {/* head */}
    <path d={`M -112 ${hy - 40} L -96 ${hy - 150} L -36 ${hy - 104} Z`} fill={B} /><path d={`M -96 ${hy - 70} L -90 ${hy - 128} L -54 ${hy - 100} Z`} fill="#c46a7a" />
    <path d={`M 112 ${hy - 40} L 96 ${hy - 150} L 36 ${hy - 104} Z`} fill={B} /><path d={`M 96 ${hy - 70} L 90 ${hy - 128} L 54 ${hy - 100} Z`} fill="#c46a7a" />
    <ellipse cx={0} cy={hy} rx={130} ry={118} fill={B} />
    <path d={`M 70 ${hy - 95} A 130 118 0 0 1 125 ${hy + 30}`} stroke={RIM} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.8} />
    <Eye x={-50} y={hy - 4} rx={36} ry={42} look={look} blink={blink} lid={B} iris="#f5d27a" pupil="slit" emo={emo} />
    <Eye x={50} y={hy - 4} rx={36} ry={42} look={look} blink={blink} lid={B} iris="#f5d27a" pupil="slit" emo={emo} />
    <Brows y={hy - 62} dx={50} w={34} emo={emo} color={B2} th={8} />
    <path d={`M -10 ${hy + 42} L 10 ${hy + 42} L 0 ${hy + 54} Z`} fill="#e08a9a" />
    {mouth < 0.08 && emo !== 'surprised'
      ? <path d={`M -24 ${hy + 62} Q -12 ${hy + 74} 0 ${hy + 60} Q 12 ${hy + 74} 24 ${hy + 62}`} stroke="#0c0e15" strokeWidth={5} fill="none" strokeLinecap="round" />
      : <Mouth x={0} y={hy + 60} w={44} open={mouth} emo={emo} dark="#0c0e15" tongue="#e08a9a" />}
    <g stroke="#7c86a3" strokeWidth={3} strokeLinecap="round" opacity={0.7}>
      {[-1, 1].map((k) => <g key={k}><line x1={k * 60} y1={hy + 48} x2={k * 140} y2={hy + 36} /><line x1={k * 60} y1={hy + 58} x2={k * 140} y2={hy + 64} /></g>)}
    </g>
  </>);
};

// ---------------- «Архивариус»: keeper of the case files ----------------
export const Archivist: React.FC<MascotProps> = (p) => {
  const {t, mouth = 0, blink = 1, look = [0, 0], pose = 'idle', emo = 'neutral'} = p;
  const SK = '#f2c79a', SK_D = '#d9a676', COAT = '#c9a86a', COAT_D = '#a8884e', CAP = '#2b2f3a';
  const bob = Math.sin(t * 2.2) * 3, hy = -300 + bob;
  return wrap(p, <>
    <ellipse cx={0} cy={4} rx={110} ry={16} fill="#000" opacity={0.35} />
    {[-1, 1].map((k) => <g key={k}><rect x={k * 30 - 12} y={-70} width={24} height={66} fill="#2a2f3d" /><ellipse cx={k * 36} cy={-4} rx={30} ry={14} fill={INK} /></g>)}
    {/* coat */}
    <path d={`M -90 ${-60} L -70 ${-215 + bob} Q 0 ${-245 + bob} 70 ${-215 + bob} L 90 -60 Z`} fill={COAT} />
    <path d={`M 0 ${-230 + bob} L 0 -60`} stroke={COAT_D} strokeWidth={5} />
    {[-150, -115, -80].map((y) => <circle key={y} cx={14} cy={y + bob * 0.5} r={6} fill={COAT_D} />)}
    <rect x={-90} y={-130 + bob * 0.5} width={180} height={14} fill={COAT_D} />
    {/* arms */}
    <path d={`M -70 ${-200 + bob} Q -110 -150 -100 ${pose === 'wave' ? -260 + Math.sin(t * 9) * 16 : -100}`} stroke={COAT} strokeWidth={30} fill="none" strokeLinecap="round" />
    <circle cx={-100} cy={pose === 'wave' ? -270 + Math.sin(t * 9) * 16 : -90} r={17} fill={SK} />
    {pose === 'point'
      ? <><path d={`M 70 ${-200 + bob} Q 140 -230 200 -270`} stroke={COAT} strokeWidth={30} fill="none" strokeLinecap="round" /><circle cx={210} cy={-276} r={17} fill={SK} /></>
      : <><path d={`M 70 ${-200 + bob} Q 110 -150 100 -100`} stroke={COAT} strokeWidth={30} fill="none" strokeLinecap="round" />
          <rect x={70} y={-150} width={70} height={90} rx={6} fill="#efe6cc" transform="rotate(-8 105 -105)" /><rect x={78} y={-140} width={54} height={10} fill={RED} transform="rotate(-8 105 -105)" /></>}
    {/* red scarf */}
    <path d={`M -60 ${-222 + bob} Q 0 ${-200 + bob} 60 ${-222 + bob}`} stroke={RED} strokeWidth={24} fill="none" strokeLinecap="round" />
    <path d={`M 40 ${-215 + bob} C 70 -180 ${60 + Math.sin(t * 3) * 6} -150 ${80 + Math.sin(t * 3) * 8} -130`} stroke={RED} strokeWidth={18} fill="none" strokeLinecap="round" />
    {/* head */}
    <circle cx={0} cy={hy} r={105} fill={SK} />
    <ellipse cx={-104} cy={hy + 10} rx={16} ry={24} fill={SK_D} /><ellipse cx={104} cy={hy + 10} rx={16} ry={24} fill={SK_D} />
    <Eye x={-38} y={hy + 2} rx={20} ry={24} look={look} blink={blink} lid={SK} emo={emo} />
    <Eye x={38} y={hy + 2} rx={20} ry={24} look={look} blink={blink} lid={SK} emo={emo} />
    {[-38, 38].map((x) => <circle key={x} cx={x} cy={hy + 2} r={34} fill="#cfe6ff" fillOpacity={0.12} stroke={INK} strokeWidth={6} />)}
    <line x1={-4} y1={hy} x2={4} y2={hy} stroke={INK} strokeWidth={6} />
    <Brows y={hy - 46} dx={38} w={34} emo={emo} color="#5a3e28" th={8} />
    <path d={`M -26 ${hy + 46} Q 0 ${hy + 36} 26 ${hy + 46} Q 12 ${hy + 54} 0 ${hy + 50} Q -12 ${hy + 54} -26 ${hy + 46} Z`} fill="#6b4a2e" />
    <Mouth x={0} y={hy + 62} w={34} open={mouth} emo={emo} dark="#5a2a1a" tongue="#e08a7a" />
    {/* flat cap */}
    <path d={`M -100 ${hy - 50} Q -96 ${hy - 120} 0 ${hy - 122} Q 96 ${hy - 120} 104 ${hy - 54} Q 0 ${hy - 76} -100 ${hy - 50} Z`} fill={CAP} />
    <path d={`M 40 ${hy - 62} Q 120 ${hy - 72} 150 ${hy - 44} Q 100 ${hy - 40} 40 ${hy - 50} Z`} fill="#20232c" />
  </>);
};

export const MASCOTS = {yarn: Yarn, cat: Cat, archivist: Archivist};
