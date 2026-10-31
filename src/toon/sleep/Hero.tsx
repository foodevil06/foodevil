// The hero of «Что будет, если не спать 7 дней?»: a big-head cartoon guy in an ochre hoodie (model Б in
// docs/reference-analysis/CHARACTER_DESIGN_GUIDE.md). One drawing for every shot: tiredness is a set of numbers
// (lid, bags, red, pale, messy, slump), never a new design. Origin = the base of the neck; `s` scales the whole figure.
// Pure function of its props: the same frame always renders the same.
import React from 'react';
import {clamp, ik2, lerp, P} from '../lib/anim';

export const HC = {
  skin: '#f1c7a1', skinShade: '#d6a07c', pale: '#d2cbbd', paleShade: '#ada694', hair: '#261e1a', hood: '#d49a35',
  hoodShade: '#a9741f', hoodDark: '#6f4c14', string: '#f6f0e4', ink: '#17120f', sclera: '#fbf7f0', bags: '#6a4a6c',
  vein: '#c8352d', mouth: '#3b1714', tongue: '#c4544a', blush: '#e88f7e',
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixColor = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b), k = clamp(t);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
};

export type Mouth = 'smile' | 'grin' | 'flat' | 'frown' | 'open' | 'yawn' | 'grit';
export type Hand = {x: number; y: number; grip?: 'fist' | 'open'; hold?: 'can' | 'phone' | 'mug' | null; bend?: number; rot?: number};
export type HeroSpec = {
  id: string; x: number; y: number; s?: number;
  lid?: number; lidR?: number;     // upper eyelids 0 open .. 1 closed (lidR overrides the right eye)
  bags?: number; red?: number; pale?: number; messy?: number;   // 0..1 each: the toll of the sleepless days
  pupil?: number; lookX?: number; lookY?: number;               // pupil size (1 = normal), gaze -1..1
  brow?: number; browUp?: number;  // brow: -1 angry .. 0 calm .. 1 worried; browUp: -1 low .. 1 raised
  mouth?: Mouth; mo?: number;      // mo: how open (open, yawn)
  tilt?: number; turn?: number; nod?: number; rest?: number;   // head roll (deg), face turn -1..1, chin down 0..1, head lying on the arms 0..1
  slump?: number; breath?: number; // shoulders drop 0..1, breathing phase -1..1
  handL?: Hand | null; handR?: Hand | null;
  rim?: number; rimColor?: string; // cold edge light from the laptop
  blush?: number;
  mid?: React.ReactNode;           // drawn after the body and before the arms (desk, steering wheel), in the hero's own coordinates
  headOnly?: boolean;
};

const Eye: React.FC<{id: string; k: number; lid: number; bags: number; red: number; pupil: number; lx: number; ly: number; skin: string}> =
  ({id, k, lid, bags, red, pupil, lx, ly, skin}) => {
  const rx = 34, ry = 30, e = -ry + 2 * ry * clamp(lid);
  return (
    <g transform={`translate(${k * 50} -2)`}>
      {/* bags under the eye grow with the days */}
      <path d={`M ${-rx - 2} ${ry * 0.35} Q 0 ${ry * 1.55 + bags * 14} ${rx + 2} ${ry * 0.35} Q 0 ${ry * 1.05} ${-rx - 2} ${ry * 0.35} Z`} fill={HC.bags} opacity={0.1 + 0.6 * bags} />
      <clipPath id={`${id}-eye${k}`}><ellipse cx={0} cy={0} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={mixColor(HC.sclera, '#f3c9bf', red * 0.6)} />
      <g clipPath={`url(#${id}-eye${k})`}>
        {red > 0 && <g stroke={HC.vein} strokeWidth={2.2} fill="none" opacity={red} strokeLinecap="round">
          <path d={`M ${-rx} -4 q 10 -4 17 1 q 4 3 8 1`} /><path d={`M ${rx} 7 q -11 1 -19 -4`} /><path d={`M ${-rx * 0.7} ${ry * 0.8} q 6 -7 9 -15`} /><path d={`M ${rx * 0.65} ${-ry * 0.75} q -5 8 -11 10`} />
        </g>}
        <circle cx={lx * 12} cy={ly * 8} r={12.5 * pupil} fill={HC.ink} />
        <circle cx={lx * 12 + 4} cy={ly * 8 - 5} r={4} fill="#fff" opacity={0.9} />
        {/* the upper lid: a skin-coloured curtain with a dark lash line */}
        <path d={`M ${-rx - 4} ${-ry - 4} L ${rx + 4} ${-ry - 4} L ${rx + 4} ${e} Q 0 ${e + 12 * (1 - lid * 0.6)} ${-rx - 4} ${e} Z`} fill={skin} />
        {lid > 0.02 && <path d={`M ${-rx - 4} ${e} Q 0 ${e + 12 * (1 - lid * 0.6)} ${rx + 4} ${e}`} stroke={HC.ink} strokeWidth={4.5} fill="none" />}
      </g>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke={HC.ink} strokeWidth={3.5} />
    </g>
  );
};

const MouthShape: React.FC<{m: Mouth; mo: number}> = ({m, mo}) => {
  const ln = {stroke: HC.ink, strokeWidth: 7, fill: 'none', strokeLinecap: 'round' as const};
  if (m === 'smile') return <path d="M -40 -6 Q 0 26 40 -6" {...ln} />;
  if (m === 'flat') return <path d="M -30 4 L 30 4" {...ln} />;
  if (m === 'frown') return <path d="M -34 14 Q 0 -8 34 14" {...ln} />;
  if (m === 'grin') return <g><path d="M -46 -8 Q 0 46 46 -8 Q 0 6 -46 -8 Z" fill={HC.mouth} stroke={HC.ink} strokeWidth={5} /><path d="M -40 -4 Q 0 8 40 -4 L 36 6 Q 0 16 -36 6 Z" fill="#fff" /></g>;
  if (m === 'grit') return <g><rect x={-38} y={-12} width={76} height={26} rx={9} fill="#fff" stroke={HC.ink} strokeWidth={5} />{[-19, 0, 19].map((x) => <line key={x} x1={x} y1={-10} x2={x} y2={12} stroke={HC.ink} strokeWidth={3} />)}<line x1={-36} y1={1} x2={36} y2={1} stroke={HC.ink} strokeWidth={3} /></g>;
  if (m === 'open') return <ellipse cx={0} cy={4} rx={15 + 4 * mo} ry={9 + 13 * mo} fill={HC.mouth} stroke={HC.ink} strokeWidth={5} />;
  // yawn: a tall open mouth with the tongue
  return <g><ellipse cx={0} cy={10 + 10 * mo} rx={22 + 8 * mo} ry={14 + 34 * mo} fill={HC.mouth} stroke={HC.ink} strokeWidth={5} /><ellipse cx={0} cy={22 + 34 * mo} rx={16 + 4 * mo} ry={6 + 8 * mo} fill={HC.tongue} /></g>;
};

const HandShape: React.FC<{p: P; h: Hand; skin: string; ang: number}> = ({p, h, skin, ang}) => (
  <g transform={`translate(${p.x} ${p.y}) rotate(${ang + (h.rot ?? 0)})`}>
    {h.hold === 'can' && <g transform="rotate(-90) translate(-6 -44)"><rect x={-22} y={-40} width={44} height={84} rx={8} fill="#2f6fd6" stroke={HC.ink} strokeWidth={4} /><rect x={-22} y={-8} width={44} height={22} fill="#f2c541" /><rect x={-14} y={-46} width={28} height={8} rx={3} fill="#c9ced6" stroke={HC.ink} strokeWidth={3} /></g>}
    {h.hold === 'mug' && <g transform="rotate(-90) translate(-4 -46)"><rect x={-30} y={-34} width={60} height={68} rx={10} fill="#e9e3d6" stroke={HC.ink} strokeWidth={4} /><path d="M 30 -16 q 22 0 22 16 q 0 16 -22 16" stroke={HC.ink} strokeWidth={6} fill="none" /></g>}
    {h.hold === 'phone' && <g transform="rotate(-90) translate(0 -40)"><rect x={-28} y={-52} width={56} height={104} rx={10} fill="#111318" stroke={HC.ink} strokeWidth={4} /><rect x={-22} y={-44} width={44} height={86} rx={6} fill="#9fc3ff" opacity={0.85} /></g>}
    <circle cx={0} cy={0} r={30} fill={skin} stroke={HC.ink} strokeWidth={4.5} />
    {h.grip === 'open'
      ? <g fill={skin} stroke={HC.ink} strokeWidth={4}>{[-16, 0, 16].map((y) => <ellipse key={y} cx={30} cy={y} rx={14} ry={8} />)}<ellipse cx={4} cy={-28} rx={9} ry={13} /></g>
      : <ellipse cx={8} cy={-24} rx={10} ry={8} fill={skin} stroke={HC.ink} strokeWidth={4} />}
  </g>
);

export const Hero: React.FC<HeroSpec> = (o) => {
  const {id, x, y, s = 1, lid = 0, bags = 0, red = 0, pale = 0, messy = 0, pupil = 1, lookX = 0, lookY = 0, brow = 0, browUp = 0, mouth = 'flat', mo = 0,
    tilt = 0, turn = 0, nod = 0, rest = 0, slump = 0, breath = 0, rim = 0, rimColor = '#bcd4ff', blush = 0.35} = o;
  const skin = mixColor(HC.skin, HC.pale, pale), skinShade = mixColor(HC.skinShade, HC.paleShade, pale);
  const sy = slump * 26 + breath * 4;                 // shoulders drop with tiredness and move with the breath
  const headY = -150 + nod * 34 + sy * 0.6 + rest * 215;   // rest: the head lies on the folded arms
  const fx = turn * 22;                                // the face slides sideways when the head turns
  const head = (
    <g transform={`translate(${rest * 30} ${headY}) rotate(${tilt + nod * 9 - rest * 80})`}>
      {/* ears behind the face */}
      {[-1, 1].map((k) => <ellipse key={k} cx={k * 117 - turn * 10} cy={4} rx={19} ry={29} fill={skinShade} stroke={HC.ink} strokeWidth={4.5} />)}
      <path d="M -118 -10 C -122 -92 -80 -140 0 -140 C 80 -140 122 -92 118 -10 C 114 72 70 126 0 129 C -70 126 -114 72 -118 -10 Z" fill={skin} stroke={HC.ink} strokeWidth={5} />
      {rim > 0 && <path d="M 92 -96 C 118 -66 124 10 104 66" stroke={rimColor} strokeWidth={7} fill="none" opacity={0.75 * rim} strokeLinecap="round" />}
      {/* hair: a dark cap with a front tuft; messy pushes spikes out */}
      <path d="M -123 -18 C -130 -112 -80 -152 0 -154 C 86 -154 130 -112 123 -20 C 112 -62 88 -88 58 -94 C 34 -78 -6 -98 -38 -90 C -76 -86 -108 -60 -123 -18 Z" fill={HC.hair} stroke={HC.ink} strokeWidth={4} />
      {[[-80, -122, -20], [-30, -150, -6], [24, -152, 8], [76, -130, 22], [104, -96, 40], [-108, -88, -40]].map(([cx, cy, a], i) => {
        const L = 14 + messy * (18 + (i % 3) * 9);
        return <path key={i} d={`M ${cx - 16} ${cy + 8} L ${cx} ${cy - L} L ${cx + 16} ${cy + 8} Z`} fill={HC.hair} transform={`rotate(${a} ${cx} ${cy})`} />;
      })}
      <g transform={`translate(${fx} 0)`}>
        {blush > 0 && [-1, 1].map((k) => <ellipse key={k} cx={k * 70} cy={40} rx={20} ry={12} fill={HC.blush} opacity={blush * (1 - pale)} />)}
        {[-1, 1].map((k) => <Eye key={k} id={id} k={k} lid={k === 1 && o.lidR !== undefined ? o.lidR : lid} bags={bags} red={red} pupil={pupil} lx={lookX} ly={lookY} skin={skin} />)}
        {/* brows: angry = inner ends down, worried = inner ends up */}
        {[-1, 1].map((k) => {
          const by = -54 - browUp * 14;
          const inner = {x: k * 18, y: by + (brow < 0 ? -brow * 16 : -brow * 14)}, outer = {x: k * 84, y: by + (brow > 0 ? brow * 10 : brow * 4)};
          return <path key={k} d={`M ${inner.x} ${inner.y} Q ${k * 52} ${by - 12} ${outer.x} ${outer.y}`} stroke={HC.hair} strokeWidth={14} fill="none" strokeLinecap="round" />;
        })}
        <path d="M -4 18 Q -14 44 0 50 Q 10 52 14 46" stroke={HC.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.75} />
        <g transform="translate(0 76)"><MouthShape m={mouth} mo={mo} /></g>
      </g>
    </g>
  );
  if (o.headOnly) return <g transform={`translate(${x} ${y}) scale(${s})`}>{head}</g>;

  const arm = (k: number, h: Hand | null | undefined) => {
    if (!h) return null;
    const sh = {x: k * 126, y: 66 + sy};
    // the elbow always goes to the outside of the body unless a bend is given
    const A = ik2(sh, {x: h.x, y: h.y}, 176, 166, 1), B = ik2(sh, {x: h.x, y: h.y}, 176, 166, -1);
    const {mid, end} = h.bend !== undefined ? ik2(sh, {x: h.x, y: h.y}, 176, 166, h.bend) : (k * A.mid.x > k * B.mid.x ? A : B);
    const ang = (Math.atan2(end.y - mid.y, end.x - mid.x) * 180) / Math.PI;
    return (
      <g key={k}>
        <path d={`M ${sh.x} ${sh.y} L ${mid.x} ${mid.y} L ${end.x} ${end.y}`} stroke={HC.ink} strokeWidth={70} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M ${sh.x} ${sh.y} L ${mid.x} ${mid.y} L ${end.x} ${end.y}`} stroke={HC.hood} strokeWidth={61} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* a light stripe along the sleeve: the pose reads on any background */}
        <path d={`M ${sh.x} ${sh.y} L ${mid.x} ${mid.y} L ${end.x} ${end.y}`} stroke={HC.string} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
        <circle cx={lerp(mid.x, end.x, 0.86)} cy={lerp(mid.y, end.y, 0.86)} r={27} fill={HC.hoodShade} stroke={HC.ink} strokeWidth={4} />
        <HandShape p={end} h={h} skin={skin} ang={ang} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* torso: the hoodie, collar and drawstrings */}
      <path d={`M -150 ${84 + sy} C -150 ${36 + sy} -110 ${14 + sy * 0.6} -58 ${8 + sy * 0.4} L 58 ${8 + sy * 0.4} C 110 ${14 + sy * 0.6} 150 ${36 + sy} 150 ${84 + sy} L 176 620 L -176 620 Z`}
        fill={HC.hood} stroke={HC.ink} strokeWidth={5} transform={`scale(${1 + breath * 0.006} 1)`} />
      <path d={`M 128 ${90 + sy} L 150 600`} stroke={HC.hoodShade} strokeWidth={26} opacity={0.7} />
      {rim > 0 && <path d={`M 112 ${22 + sy} C 146 ${40 + sy} 152 ${70 + sy} 156 ${120 + sy}`} stroke={rimColor} strokeWidth={7} fill="none" opacity={0.7 * rim} strokeLinecap="round" />}
      <rect x={-31} y={-42} width={62} height={56} fill={skinShade} stroke={HC.ink} strokeWidth={4.5} />
      <path d="M -82 12 C -62 58 62 58 82 12 C 62 -8 -62 -8 -82 12 Z" fill={HC.hoodShade} stroke={HC.ink} strokeWidth={4.5} />
      {[-1, 1].map((k) => <g key={k}><path d={`M ${k * 22} 44 Q ${k * 26} 120 ${k * 28} 196`} stroke={HC.string} strokeWidth={7} fill="none" strokeLinecap="round" /><rect x={k * 28 - 6} y={194} width={12} height={20} rx={4} fill={HC.string} /></g>)}
      {o.mid}
      {rest > 0.5
        ? <>{arm(-1, o.handL)}{arm(1, o.handR)}{head}</>   /* asleep: the head lies on top of the arms */
        : <>{head}{arm(-1, o.handL)}{arm(1, o.handR)}</>}
    </g>
  );
};
