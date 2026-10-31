// Second batch in «Ночная гравюра» (31.10.2026): four more everyday-horror stories written with ChatGPT (plots in the
// spirit of Pikabu CreepyStory and Reddit NoSleep, retold), and the 4-minute compilation of seven stories with a
// paper-print transition between them and a subscribe ending.
//   LinoBell «Звонок», LinoSteps «Шаги сверху», LinoWindow «Окно напротив», LinoCloset «Свет в шкафу», LinoNight (all seven)
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CaseSubs, MONO, MONT, SAFE} from '../case/Kit';
import {Grain} from '../case/Hybrid';
import {camAt, WorldCam} from '../sleep/Sets';
import {clamp, easeInOut, easeOut, lerp, mulberry32} from '../lib/anim';
import {CAST, Person} from '../looks/Looks';
import {stepT} from '../looks/parts';
import {LI, LinoDefs, LinoFig, LinoHall, LinoLanding} from '../looks/Linocut';
import {LinoRoom, LinoRule, LinoStamp, PhoneHand} from '../looks/LinoSets';
import {Peephole} from './LookTest';
import {LB_FPS, LB_SEC, LinoElevator, LinoKnock, LinoPhoto} from './LinoBatch1';
import vBell from './b1_bell.voice.json';
import vSteps from './b1_steps.voice.json';
import vWindow from './b1_window.voice.json';
import vCloset from './b1_closet.voice.json';

type V = typeof vBell;
const secOf = (v: V) => Math.ceil((v.total + 0.8) * 10) / 10;
export const LB2_SEC = {bell: secOf(vBell), steps: secOf(vSteps as V), window: secOf(vWindow as V), closet: secOf(vCloset as V)};
const tools = (v: V) => ({
  L: (i: number) => v.lines[i],
  W: (w: string, from = 0) => { const x = v.lines.slice(from).flatMap((l) => l.words).find((x) => x.w.toLowerCase().replace(/[«»"…:,.?!]/g, '').startsWith(w)); return x ? x.t : v.lines[from].start; },
});
const shot = (v: V, t: number) => { let i = 0; v.lines.forEach((l, k) => { if (t >= l.start - 0.1) i = k; }); return i; };

const DENIS: Person = {skin: '#f0c39b', hair: 'short', hairColor: '#1d1712', top: 'hoodie', topColor: '#3f6f73', bottom: 'pants', bottomColor: '#2c3646', shoes: '#e9ecef'};
const ANYA: Person = {skin: '#f0c9a8', hair: 'bun', hairColor: '#2a1f1a', top: 'hoodie', topColor: '#6a5a7a', bottom: 'pants', bottomColor: '#2c3646', shoes: '#e9ecef', female: true};
const MASHA: Person = {skin: '#f0c9a8', hair: 'long', hairColor: '#4a2f1f', top: 'hoodie', topColor: '#6a5a7a', bottom: 'pants', bottomColor: '#2c3646', shoes: '#e9ecef', female: true};
const STRANGER: Person = {skin: '#d9d6cc', hair: 'short', hairColor: '#15120e', top: 'jacket', topColor: '#222', bottom: 'pants', bottomColor: '#222', shoes: '#222', lids: 0.2};

const Frame: React.FC<{v: V; wav: string; children: React.ReactNode; rule: string; extra?: React.ReactNode}> = ({v, wav, children, rule, extra}) => {
  const f = useCurrentFrame(), t = f / LB_FPS, ruleAt = v.lines[v.lines.length - 1].end + 0.25;
  return (
    <AbsoluteFill style={{background: LI.ink}}>
      <Audio src={staticFile(`b1/${wav}.wav`)} />
      {children}
      <Grain f={Math.floor(t * 12)} k={0.09} />
      {extra}
      <LinoRule at={ruleAt} text={rule} />
      {t < ruleAt && <CaseSubs lines={v.lines} f={f} fps={LB_FPS} total={v.total} />}
    </AbsoluteFill>
  );
};
const sfx = (file: string, at: number, vol = 0.4) => <Sequence key={file + at} from={Math.max(0, Math.round(at * LB_FPS))}><Audio src={staticFile(`sfx/${file}`)} volume={vol} /></Sequence>;
const Dim: React.FC<{o: number}> = ({o}) => <rect x={-1500} y={-1500} width={4080} height={4920} fill="#000" opacity={o} />;

// a bed with someone lying in it: the head on the pillow, the blanket up to the chin (room coordinates)
const InBed: React.FC<{p: Person; id: string; eyes?: 'open' | 'wide' | 'closed'; under?: boolean}> = ({p, id, eyes = 'open', under}) => <g>
  {!under && <LinoFig id={id} p={p} x={150} y={1238} s={0.8} headOnly face={{eyes, mouth: 'flat'}} />}
  <path d="M 70 1290 Q 330 1240 600 1300 L 600 1470 L 60 1470 Z" fill={LI.paper} stroke={LI.ink} strokeWidth={5} />
  <path d="M 70 1290 Q 330 1240 600 1300 L 600 1470 L 60 1470 Z" fill="url(#li-b)" opacity={0.5} />
</g>;

// ================= Звонок =================
export const LinoBell: React.FC = () => {
  const {L, W} = tools(vBell);
  const f = useCurrentFrame(), t = f / LB_FPS, q = stepT(t, 12), s = shot(vBell, t);
  const gm = CAST.grandma;
  let world: React.ReactNode;
  if (s === 0 || s === 2 || s === 5 || s === 6) {
    const cam = s === 0 ? {cx: 540, cy: 1060, z: 1.05} : s === 2 ? {cx: 420, cy: 1000, z: 1.7} : s === 5 ? {cx: 560, cy: 1020, z: 1.45} : {cx: 480, cy: 1050, z: 1.2};
    world = <WorldCam cam={cam}><LinoDefs /><LinoHall t={q} feet={s === 2 ? 1 : 0} />
      <LinoFig id="g" p={gm} x={s === 5 ? 720 : 560} y={1560} s={1.3} face={s === 5 ? {eyes: 'wide', mouth: 'o', brow: 1, lx: -1} : {mouth: 'flat', brow: -0.3, lx: -1}}
        armL={s === 6 ? {sh: 100, el: 30} : {sh: 8, el: 4}} tilt={s === 2 ? -10 : 0} />
      {s === 6 && <Dim o={0.25} />}</WorldCam>;
  } else if (s === 1) {
    world = <Peephole><WorldCam cam={{cx: 540, cy: 1060, z: 0.95}}><LinoDefs /><LinoLanding t={q} /></WorldCam></Peephole>;
  } else if (s === 3) {
    world = <WorldCam cam={{cx: 560, cy: 1050, z: 1}}><LinoDefs /><LinoLanding t={q} open={1}
      inDoor={<LinoFig id="n" p={CAST.neighbour} x={500} y={1540} s={1.15} face={{mouth: 'flat', brow: 0.4, lx: 0.6}} armL={{sh: 40, el: 10}} armR={{sh: 40, el: 10}} />} /></WorldCam>;
  } else if (s === 4) {
    world = <Peephole><WorldCam cam={{cx: 540, cy: 900, z: 1}}><LinoDefs /><LinoLanding t={q} />
      <LinoFig id="g2" p={gm} x={540} y={880} s={3.2} headOnly pale face={{mouth: 'flat', lx: 0}} /></WorldCam></Peephole>;
  } else {
    // morning: a red palm print on the outside of the door
    world = <WorldCam cam={camAt(q, [[L(7).start, {cx: 540, cy: 1050, z: 1}], [L(7).end, {cx: 540, cy: 980, z: 1.8}]])}><LinoDefs /><LinoLanding t={q} />
      <g transform="translate(560 980) rotate(-8)" opacity={q > W('след', 7) - 0.2 ? 1 : 0}>
        <ellipse cx={0} cy={0} rx={42} ry={52} fill={LI.red} />{[-33, -11, 11, 33].map((dx, i) => <ellipse key={i} cx={dx} cy={-70 - (i % 3) * 6} rx={10} ry={28} fill={LI.red} />)}
        <ellipse cx={-56} cy={-6} rx={11} ry={26} fill={LI.red} transform="rotate(-40 -56 -6)" /></g></WorldCam>;
  }
  return <Frame v={vBell} wav="bell" rule="Не жди *третьего звонка*"
    extra={<>{s <= 1 && <LinoStamp text="00:00" />}{s === 6 && <LinoStamp text="05:00" />}{sfx('ping.opus', 0.1, 0.25)}{sfx('ping.opus', L(2).start, 0.25)}</>}>{world}</Frame>;
};

// ================= Шаги сверху =================
export const LinoSteps: React.FC = () => {
  const {L} = tools(vSteps as V);
  const f = useCurrentFrame(), t = f / LB_FPS, q = stepT(t, 12), s = shot(vSteps as V, t);
  // dark footprints crossing the ceiling (room y ~ 300)
  const ceilingSteps = (t0: number, toX: number) => Array.from({length: 7}, (_, i) => {
    const at = t0 + i * 0.45, x = lerp(100, toX, i / 6);
    return q > at ? <ellipse key={i} cx={x} cy={300 + (i % 2) * 26} rx={22} ry={12} fill={LI.paper} opacity={0.35} /> : null;
  });
  let world: React.ReactNode;
  if (s <= 2) {
    world = <WorldCam cam={s === 1 ? {cx: 540, cy: 760, z: 1} : {cx: 520, cy: 1000, z: 1.05}}><LinoDefs /><LinoRoom t={q} />
      <rect x={-1500} y={240} width={4080} height={10} fill={LI.paper} opacity={0.5} />
      {s !== 1 && ceilingSteps(L(s === 0 ? 0 : 2).start + 0.3, s === 2 ? 520 : 900)}
      <LinoFig id="d" p={DENIS} x={560} y={1560} s={1.3} face={{eyes: 'wide', mouth: s === 2 ? 'o' : 'flat', brow: 0.7, lx: 0.2}} tilt={-8} />
      {s === 1 && <g><rect x={420} y={-200} width={240} height={420} fill={LI.ink} stroke={LI.paper} strokeWidth={5} />
        <rect x={500} y={120} width={80} height={60} rx={10} fill="none" stroke={LI.paper} strokeWidth={6} /><rect x={490} y={160} width={100} height={70} fill={LI.paper} /></g>}</WorldCam>;
  } else if (s === 3) {
    // the attic door: dust, not a single print
    world = <WorldCam cam={{cx: 540, cy: 1000, z: 1.25}}><LinoDefs /><LinoLanding t={q} />
      {Array.from({length: 90}, (_, i) => { const r = mulberry32(i + 7); return <circle key={i} cx={390 + r() * 300} cy={640 + r() * 900} r={2 + r() * 2} fill={LI.paper} opacity={0.4} />; })}
      <rect x={500} y={1050} width={80} height={60} rx={10} fill="none" stroke={LI.paper} strokeWidth={6} /><rect x={490} y={1090} width={100} height={70} fill={LI.paper} /></WorldCam>;
  } else if (s <= 5) {
    const dust = s === 5;
    world = <WorldCam cam={{cx: 300, cy: 1100, z: 1.6}}><LinoDefs /><LinoRoom t={q} /><Dim o={0.3} />
      <rect x={-1500} y={240} width={4080} height={10} fill={LI.paper} opacity={0.5} />
      {ceilingSteps(L(4).start + 0.2, 160)}
      <InBed p={DENIS} id="db" eyes="wide" />
      {dust && Array.from({length: 40}, (_, i) => { const r = mulberry32(i + 31); const y = 260 + ((q - L(5).start) * (300 + r() * 400)) % 1000; return <circle key={i} cx={100 + r() * 120} cy={y} r={2 + r() * 3} fill={LI.paper} opacity={0.7} />; })}</WorldCam>;
  } else {
    // morning: bare footprints from the bed to the door, none back
    const cam = camAt(q, [[L(6).start, {cx: 360, cy: 1500, z: 1.4}], [L(7).end, {cx: -200, cy: 1500, z: 1.4}]]);
    world = <WorldCam cam={cam}><LinoDefs /><LinoRoom t={q} dawn={0.6} />
      <rect x={-1500} y={1560} width={4080} height={300} fill={LI.paperDim} opacity={0.25} />
      {Array.from({length: 10}, (_, i) => <g key={i} transform={`translate(${520 - i * 110} ${1600 + (i % 2) * 40}) rotate(-90)`}>
        <ellipse cx={0} cy={0} rx={18} ry={34} fill={LI.ink} />{[-12, -4, 4, 12].map((dx, k) => <circle key={k} cx={dx} cy={-44} r={5} fill={LI.ink} />)}</g>)}</WorldCam>;
  }
  return <Frame v={vSteps as V} wav="steps" rule="Не считай *шаги над собой*"
    extra={<>{s === 1 && <LinoStamp text="9 ЭТАЖ · ВЫШЕ ЧЕРДАК" />}{sfx('k2_steps.opus', L(0).start + 0.3, 0.3)}{sfx('k2_steps.opus', L(4).start, 0.35)}</>}>{world}</Frame>;
};

// ================= Окно напротив =================
// her window: the opposite block at night, one lit window with a man in it (world coordinates)
const Opposite: React.FC<{man: React.ReactNode; lit?: number}> = ({man, lit = 1}) => <g>
  <rect x={-1500} y={-1500} width={4080} height={4920} fill="#0b0a08" />
  <rect x={-200} y={300} width={1480} height={2000} fill="#1d1913" />
  {Array.from({length: 7}, (_, r) => Array.from({length: 6}, (_, c) => <rect key={`${r}${c}`} x={-120 + c * 230} y={380 + r * 260} width={150} height={190} fill="#0e0c09" stroke={LI.paper} strokeWidth={3} opacity={0.6} />))}
  <rect x={340} y={640} width={150} height={190} fill={LI.ochre} opacity={lit} />
  <clipPath id="opp-win"><rect x={340} y={640} width={150} height={190} /></clipPath>
  <g clipPath="url(#opp-win)">{man}</g>
  <rect x={340} y={640} width={150} height={190} fill="none" stroke={LI.paper} strokeWidth={4} />
</g>;
const MyWindow: React.FC = () => <g>
  <path d="M -1500 -1500 L 2580 -1500 L 2580 3420 L -1500 3420 Z M 120 260 L 120 1300 L 960 1300 L 960 260 Z" fill={LI.ink} fillRule="evenodd" />
  <rect x={120} y={260} width={840} height={1040} fill="none" stroke={LI.paper} strokeWidth={8} /><line x1={540} y1={260} x2={540} y2={1300} stroke={LI.paper} strokeWidth={8} />
  <rect x={100} y={1300} width={880} height={40} fill={LI.paper} />
</g>;
export const LinoWindow: React.FC = () => {
  const {L, W} = tools(vWindow as V);
  const f = useCurrentFrame(), t = f / LB_FPS, q = stepT(t, 12), s = shot(vWindow as V, t);
  const raise = s === 2 && q > W('тоже', 2) - 0.1, back = s === 3 && q > W('тоже', 3) - 0.1, turn = s >= 6;
  const man = <LinoFig id="m" p={STRANGER} x={back ? 425 : 415} y={back ? 840 : 860} s={back ? 0.26 : 0.32} face={{mouth: 'flat', lx: turn ? 1 : 0}} armR={raise ? {sh: 150, el: 10} : {sh: 8, el: 4}} tilt={turn ? 14 : 0} />;
  const herCam = s === 2 && !raise || s === 3 && !back;
  let world: React.ReactNode;
  if (s === 0 || s === 1 || s === 5 || s === 6 || raise || back) {
    const cam = s === 0 ? {cx: 540, cy: 780, z: 1} : s === 5 ? {cx: 540, cy: 780, z: 1.2} : {cx: 415, cy: 740, z: 3.2};
    world = <WorldCam cam={cam}><LinoDefs /><Opposite man={man} />{(s === 0 || s === 5) && <MyWindow />}</WorldCam>;
  } else if (herCam || s === 4) {
    world = <WorldCam cam={{cx: 540, cy: 1020, z: s === 4 ? 1 : 1.5}}><LinoDefs /><LinoRoom t={q} bed={false} />
      <LinoFig id="a" p={ANYA} x={s === 3 ? 600 : 540} y={1560} s={1.3} face={{eyes: 'wide', mouth: 'flat', brow: 0.6}} armR={s === 2 ? {sh: 150, el: 10} : {sh: 8, el: 4}} />
      {s === 4 && <Dim o={0.45} />}</WorldCam>;
  } else {
    // behind her: the wardrobe door opens a crack
    const gap = clamp((q - W('скрипнул', 7)) / 0.5) * 40;
    world = <WorldCam cam={{cx: 910, cy: 1000, z: 1.6}}><LinoDefs /><LinoRoom t={q} /><rect x={906} y={480} width={gap} height={1080} fill="#000" /><Dim o={0.3} /></WorldCam>;
  }
  return <Frame v={vWindow as V} wav="window" rule="Если кто-то в окне повторяет за тобой, *задёрни шторы*"
    extra={s === 1 ? <LinoStamp text="02:00" /> : null}>{world}</Frame>;
};

// ================= Свет в шкафу =================
const ClosetGlow: React.FC<{on: number; open?: number; inside?: React.ReactNode}> = ({on, open = 0, inside}) => <g>
  {open > 0 && <rect x={764} y={484} width={292} height={1072} fill="#050403" />}
  {open > 0 && inside}
  {open > 0 && <><path d={`M 764 484 L ${764 - 120 * open} 520 L ${764 - 120 * open} 1520 L 764 1556 Z`} fill={LI.ink} stroke={LI.paper} strokeWidth={4} />
    <path d={`M 1056 484 L ${1056 + 120 * open} 520 L ${1056 + 120 * open} 1520 L 1056 1556 Z`} fill={LI.ink} stroke={LI.paper} strokeWidth={4} /></>}
  {on > 0 && open === 0 && <><rect x={906} y={490} width={8} height={1060} fill={LI.paper} opacity={on} />
    <path d="M 780 1560 L 1040 1560 L 1160 1700 L 640 1700 Z" fill={LI.paper} opacity={0.35 * on} /></>}
</g>;
export const LinoCloset: React.FC = () => {
  const {L} = tools(vCloset as V);
  const f = useCurrentFrame(), t = f / LB_FPS, q = stepT(t, 12), s = shot(vCloset as V, t);
  const shake = s === 3 ? (Math.floor(q * 12) % 3 === 0 ? 3 : 0) : 0;
  const robe = <LinoFig id="r" p={{...MASHA, hair: 'bald', hairColor: '#15120e'}} x={910} y={1540} s={1.2} pale face={{eyes: 'open', mouth: 'flat'}} />;
  let world: React.ReactNode;
  if (s === 4 || s === 5) {
    world = <PhoneHand><LinoDefs /><g transform="scale(0.47) translate(-560 -230)"><LinoRoom t={q} /><ClosetGlow on={1} open={s === 5 ? 1 : 0} inside={robe} /></g>
      <circle cx={40} cy={40} r={14} fill={LI.red} opacity={q % 1 < 0.6 ? 1 : 0} /><text x={64} y={52} fontFamily="PT Mono" fontSize={30} fill={LI.paper}>REC</text></PhoneHand>;
  } else if (s === 1) {
    world = <WorldCam cam={{cx: 330, cy: 1300, z: 1.7}}><LinoDefs /><LinoRoom t={q} /><InBed p={MASHA} id="mb" eyes="wide" /><ClosetGlow on={1} /><Dim o={0.25} /></WorldCam>;
  } else if (s === 7) {
    const under = q > L(7).start + 1.2;
    world = <WorldCam cam={under ? {cx: 330, cy: 1500, z: 2} : {cx: 560, cy: 1150, z: 1}}><LinoDefs /><LinoRoom t={q} /><InBed p={MASHA} id="mb" eyes="wide" /><Dim o={0.5} />
      {under && [0, 1].map((k) => <ellipse key={k} cx={300 + k * 36} cy={1515} rx={7} ry={5} fill={LI.paper} />)}</WorldCam>;
  } else {
    const cam = s === 0 ? {cx: 600, cy: 1100, z: 1} : s === 6 ? {cx: 600, cy: 1100, z: 1} : {cx: 910 + shake, cy: 1080, z: 1.6};
    world = <WorldCam cam={cam}><LinoDefs /><LinoRoom t={q} />{(s === 0 || s === 6) && <InBed p={MASHA} id="mb" eyes={s === 6 ? 'wide' : 'closed'} />}
      <ClosetGlow on={s === 6 ? 0 : 1} /><Dim o={0.25} /></WorldCam>;
  }
  return <Frame v={vCloset as V} wav="closet" rule="Если шкаф светится, *не открывай дверцы*">{world}</Frame>;
};

// ================= the compilation: seven stories, a print between them, the ending =================
const STORIES: {C: React.FC; sec: number}[] = [
  {C: LinoKnock, sec: LB_SEC.knock}, {C: LinoBell, sec: LB2_SEC.bell}, {C: LinoElevator, sec: LB_SEC.lift}, {C: LinoSteps, sec: LB2_SEC.steps},
  {C: LinoPhoto, sec: LB_SEC.photo}, {C: LinoWindow, sec: LB2_SEC.window}, {C: LinoCloset, sec: LB2_SEC.closet},
];
const GAP = 0.9;                      // black pause with the print sheet between stories
const END_SEC = 7.5;
const starts = STORIES.reduce<number[]>((a, s, i) => [...a, i === 0 ? 0 : a[i - 1] + STORIES[i - 1].sec + GAP], []);
export const NIGHT_SEC = starts[starts.length - 1] + STORIES[STORIES.length - 1].sec + GAP + END_SEC;

// a paper sheet passes through the frame and leaves a red thread mark: the transition between stories
const PrintSheet: React.FC<{k: number}> = ({k}) => k <= 0 || k >= 1 ? null : (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={1080} height={1920}>
      <rect x={lerp(-1200, 1200, easeInOut(k))} y={-100} width={1100} height={2120} fill={LI.paper} transform={`rotate(-4 540 960)`} />
      <rect x={lerp(-1200, 1200, easeInOut(k))} y={-100} width={1100} height={2120} fill="url(#li-wf)" opacity={0.25} transform={`rotate(-4 540 960)`} />
      <path d={`M ${lerp(-1100, 1300, easeInOut(k))} 900 q 160 80 320 0 t 320 0`} stroke={LI.red} strokeWidth={8} fill="none" />
    </svg>
  </AbsoluteFill>
);
const Ending: React.FC = () => {
  const f = useCurrentFrame(), t = f / LB_FPS, k = (d: number) => easeOut((t - d) / 0.5);
  return (
    <AbsoluteFill style={{background: LI.ink, alignItems: 'center', justifyContent: 'center', paddingBottom: 260}}>
      <Audio src={staticFile('b1/ending.wav')} />
      <Img src={staticFile('channel/avatar.png')} style={{width: 420, height: 420, borderRadius: 210, opacity: k(0), transform: `scale(${0.9 + 0.1 * k(0)})`, border: `6px solid ${LI.paper}`}} />
      <div style={{opacity: k(0.6), fontFamily: MONT, fontWeight: 900, fontSize: 96, color: LI.paper, marginTop: 50, letterSpacing: 2}}>КРАСНАЯ <span style={{color: LI.red}}>НИТЬ</span></div>
      <div style={{opacity: k(1.2), fontFamily: MONT, fontWeight: 900, fontSize: 54, lineHeight: 1.15, color: LI.paper, marginTop: 30, textAlign: 'center', maxWidth: SAFE.right - SAFE.left}}>Подпишись. У каждой двери своё правило.</div>
      <Grain f={Math.floor(t * 12)} k={0.09} />
    </AbsoluteFill>
  );
};
// a Shorts part (under 3 minutes): some of the stories, the print between them, the ending, then 0.6 s of the vertical cover
const COVER_SEC = 0.6;
const layout = (ids: number[]) => {
  const st = ids.reduce<number[]>((a, id, i) => [...a, i === 0 ? 0 : a[i - 1] + STORIES[ids[i - 1]].sec + GAP], []);
  const endAt = st[st.length - 1] + STORIES[ids[ids.length - 1]].sec + GAP;
  return {st, endAt, total: endAt + END_SEC + COVER_SEC};
};
export const PARTS = [[0, 1, 2, 3], [4, 5, 6]];
export const PART_SEC = PARTS.map((ids) => layout(ids).total);
export const NightCoverV: React.FC<{part: number}> = ({part}) => (
  <AbsoluteFill style={{background: LI.ink, overflow: 'hidden'}}>
    <Img src={staticFile('channel/cover_art.png')} style={{position: 'absolute', height: 1920, width: 1920 * 1672 / 941, left: -2019, top: 120}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(21,18,14,0.95) 0%, rgba(21,18,14,0.6) 26%, rgba(21,18,14,0) 42%, rgba(21,18,14,0) 70%, rgba(21,18,14,0.85) 100%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: MONT, fontWeight: 900, lineHeight: 0.95, textShadow: '0 8px 0 rgba(0,0,0,0.6)'}}>
      <div style={{fontSize: 170, color: LI.paper}}>НЕ</div>
      <div style={{fontSize: 170, color: LI.red}}>СМОТРИ</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1450, textAlign: 'center'}}>
      <span style={{fontFamily: MONO, fontSize: 52, letterSpacing: 6, color: LI.paper, background: 'rgba(0,0,0,0.6)', border: `3px solid ${LI.red}`, padding: '8px 28px'}}>ЧАСТЬ {part}</span>
    </div>
  </AbsoluteFill>
);
export const LinoNightPart: React.FC<{part: number}> = ({part}) => {
  const ids = PARTS[part - 1], {st, endAt} = layout(ids);
  const f = useCurrentFrame(), t = f / LB_FPS;
  const marks = [...st.slice(1).map((s) => s - GAP), endAt - GAP];
  return (
    <AbsoluteFill style={{background: LI.ink}}>
      <svg width={0} height={0}><LinoDefs /></svg>
      {ids.map((id, i) => { const {C, sec} = STORIES[id]; return <Sequence key={i} from={Math.round(st[i] * LB_FPS)} durationInFrames={Math.round(sec * LB_FPS)}><C /></Sequence>; })}
      {marks.map((a, i) => <Sequence key={`p${i}`} from={Math.round(a * LB_FPS)} durationInFrames={Math.round(GAP * LB_FPS)}><Audio src={staticFile('sfx/paper.opus')} volume={0.5} /></Sequence>)}
      <Sequence from={Math.round(endAt * LB_FPS)} durationInFrames={Math.round(END_SEC * LB_FPS)}><Ending /></Sequence>
      <Sequence from={Math.round((endAt + END_SEC) * LB_FPS)}><NightCoverV part={part} /></Sequence>
      {marks.map((a, i) => <PrintSheet key={i} k={clamp((t - a) / GAP)} />)}
    </AbsoluteFill>
  );
};
export const LinoNight: React.FC = () => {
  const f = useCurrentFrame(), t = f / LB_FPS;
  const endAt = starts[starts.length - 1] + STORIES[STORIES.length - 1].sec + GAP;
  const trans = [...starts.slice(1).map((s) => s - GAP), endAt - GAP].map((a) => clamp((t - a) / GAP));
  return (
    <AbsoluteFill style={{background: LI.ink}}>
      <svg width={0} height={0}><LinoDefs /></svg>
      {STORIES.map(({C, sec}, i) => <Sequence key={i} from={Math.round(starts[i] * LB_FPS)} durationInFrames={Math.round(sec * LB_FPS)}><C /></Sequence>)}
      {[...starts.slice(1).map((s) => s - GAP), endAt - GAP].map((a, i) => <Sequence key={`p${i}`} from={Math.round(a * LB_FPS)} durationInFrames={Math.round(GAP * LB_FPS)}><Audio src={staticFile('sfx/paper.opus')} volume={0.5} /></Sequence>)}
      <Sequence from={Math.round(endAt * LB_FPS)}><Ending /></Sequence>
      {trans.map((k, i) => <PrintSheet key={i} k={k} />)}
    </AbsoluteFill>
  );
};
