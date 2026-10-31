// Three candidate looks for the channel, proposed by ChatGPT as director (docs/strategy/ТРИ_СТИЛЯ.md), on one silent
// 20 s scene with the same four people (hero, grandma Valya, the neighbour, the girl) built from one character system:
//   StylePuppet «Кукольный театр теней», StyleLino «Ночная гравюра», StyleXray «Рентген бытового кошмара».
// Story: 03:12, three knocks at the front door; behind it grandma Valya from flat 19 with a pie; but she was buried in
// March (the death notice); she comes closer and two more stand behind her, they were buried too; the rule.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grain} from '../case/Hybrid';
import {MONO, MONT} from '../case/Kit';
import {camAt, Cam, WorldCam} from '../sleep/Sets';
import {clamp, easeOut, lerp} from '../lib/anim';
import {ARMS, CAST, Fig, LookDefs} from '../looks/Looks';
import {stepT} from '../looks/parts';
import {CurtainWipe, HallFlat, LandingFlat, PARMS, PU, PuppetFig, Stage} from '../looks/Puppet';
import {LARMS, LI, LinoDefs, LinoFig, LinoHall, LinoLanding, LinoNotice} from '../looks/Linocut';
import {Building, CW, DangerPath, FL, ghost, stairY} from '../looks/Cutaway';
import {Clock} from '../style/ShortKit';
import {Caption, Peephole} from './LookTest';

export const ST_FPS = 30, ST_SEC = 20;
const KNOCKS = [0.2, 0.7, 1.2];
const shakeAt = (t: number) => KNOCKS.reduce((a, k) => Math.max(a, t >= k && t < k + 0.18 ? 1 - (t - k) / 0.18 : 0), 0);

// the same text track for every look
const Texts: React.FC<{name: string}> = ({name}) => (
  <>
    <Clock text="03:12" at={0} until={5} />
    <Caption text="03:12. В дверь стучат *три раза*" at={0.15} until={5} />
    <Caption text="За дверью баба Валя из *19-й*" at={5.15} until={10} />
    <Caption text="Но её похоронили *в марте*" at={10.15} until={14} />
    <Caption text="Их тоже *похоронили*" at={15.9} until={17.3} />
    <Caption text="Правило: не открывай *мёртвым*" at={17.3} until={20.1} />
    <div style={{position: 'absolute', left: 30, top: 36, fontFamily: MONO, fontSize: 30, color: '#cfe0f5', background: 'rgba(0,0,0,0.55)', padding: '6px 14px', borderRadius: 8}}>{name}</div>
  </>
);
const Knock: React.FC<{t: number; x: number; y: number; color: string}> = ({t, x, y, color}) => <>{KNOCKS.map((k, i) => t >= k && t < k + 0.5
  ? <text key={i} x={x + i * 30} y={y - i * 60} fontFamily={MONT} fontWeight={900} fontSize={56} fill={color} opacity={1 - (t - k) / 0.5} transform={`rotate(-8 ${x} ${y})`}>ТУК</text> : null)}</>;

// ================= 1. puppet theatre =================
export const StylePuppet: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps, q = stepT(t, 8);
  const wipe = [5, 10, 12.2, 14].reduce((a, c) => Math.max(a, 1 - Math.abs(t - c) / 0.3), 0);
  const shadowOf = (node: (sil: boolean) => React.ReactNode) => <><g opacity={0.3} transform="translate(40 -70) scale(1.0 1.0)">{node(true)}</g>{node(false)}</>;
  const rise = (at: number) => lerp(1950, 1560, clamp((q - at) / 0.6));
  let world: React.ReactNode;
  if (t < 5 || (t >= 12.2 && t < 14)) {
    const close = t >= 12.2;
    const hx = close ? 720 : lerp(1150, 720, clamp((q - 1.4) / 1.6));
    const walking = !close && q > 1.4 && q < 3;
    const cam: Cam = close ? {cx: 720, cy: 1010, z: 2.0} : camAt(t, [[0, {cx: 540, cy: 960, z: 1}], [3.5, {cx: 540, cy: 960, z: 1.03}], [4.7, {cx: 360, cy: 930, z: 1.8}]]);
    world = <WorldCam cam={cam}><Stage t={t}>
      <HallFlat t={t} shake={close ? 0 : shakeAt(t)} />
      {!close && <Knock t={t} x={300} y={800} color={PU.edge} />}
      {shadowOf((sil) => <PuppetFig p={CAST.hero} x={hx} y={1560} s={1.3} sil={sil} strings="red"
        face={close ? {eyes: 'wide', mouth: 'o', brow: 1, lx: -0.3} : {eyes: 'wide', mouth: 'o', brow: 0.6, lx: -1}}
        pose={close ? {armR: PARMS.mouth} : {legA: walking ? (Math.floor(q * 8) % 2 ? 12 : -12) : 0, tilt: q > 3.2 ? -8 : 0}} />)}
    </Stage></WorldCam>;
  } else if (t < 10 || t >= 14) {
    const late = t >= 14;
    world = <WorldCam cam={late ? camAt(t, [[14, {cx: 540, cy: 1000, z: 1}], [20, {cx: 540, cy: 1060, z: 1.12}]]) : {cx: 540, cy: 980, z: 1}}><Stage t={t}>
      <LandingFlat />
      {late && shadowOf((sil) => <>
        <PuppetFig p={CAST.neighbour} x={860} y={rise(15.2)} s={1.05} sil={sil} strings="rods" face={{mouth: 'creepy', lx: -0.5}} />
        <PuppetFig p={CAST.girl} x={230} y={rise(15.4)} s={1.3} sil={sil} strings="rods" face={{mouth: 'creepy', lx: 0.5}} />
      </>)}
      {shadowOf((sil) => <PuppetFig p={CAST.grandma} x={540} y={late ? 1720 : rise(5.2)} s={late ? 1.6 : 1.3} sil={sil} strings="rods"
        face={late ? {mouth: 'creepy', brow: -0.2} : {mouth: 'smile'}}
        pose={late ? {tilt: 10} : {plate: true, armL: PARMS.plate, armR: PARMS.plate, tilt: q > 8 ? 8 : 0}} />)}
    </Stage></WorldCam>;
  } else {
    // the death notice is lowered on two strings
    const ny = lerp(-900, 420, clamp((q - 10.1) / 0.8));
    world = <WorldCam cam={{cx: 540, cy: 1010, z: 1.05}}><Stage t={t}>
      <HallFlat t={t} />
      <g transform={`translate(0 ${ny - 420}) rotate(${Math.sin(q * 3) * 1.5} 540 800)`}>
        {[330, 750].map((x) => <line key={x} x1={x} y1={-2000} x2={x} y2={430} stroke="#cfd3d8" strokeWidth={2} opacity={0.6} />)}
        <rect x={257} y={429} width={580} height={860} fill="#000" opacity={0.3} />
        <rect x={250} y={420} width={580} height={860} fill="#efe6d4" stroke={PU.edge} strokeWidth={6} />
        <rect x={370} y={480} width={340} height={400} fill="#b9b2a4" />
        <PuppetFig p={CAST.grandma} x={540} y={690} s={1.5} headOnly face={{mouth: 'flat'}} />
        <path d="M 630 480 L 710 480 L 710 560 Z" fill="#111" />
        <text x={540} y={970} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={44} fill={PU.ink}>ВАЛЕНТИНА ИВАНОВНА</text>
        <text x={540} y={1040} textAnchor="middle" fontFamily={MONT} fontWeight={800} fontSize={34} fill="#5a5048">КВАРТИРА 19</text>
        <text x={540} y={1130} textAnchor="middle" fontFamily={MONT} fontWeight={900} fontSize={40} fill="#8a1c22">СКОНЧАЛАСЬ 14 МАРТА</text>
      </g>
    </Stage></WorldCam>;
  }
  return <AbsoluteFill style={{background: '#050403'}}>{world}<CurtainWipe k={wipe} /><Texts name="КУКОЛЬНЫЙ ТЕАТР ТЕНЕЙ" /></AbsoluteFill>;
};

// ================= 2. night linocut =================
export const StyleLino: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps, q = stepT(t, 12);
  const pop = (at: number) => (q >= at ? 1 : 0);
  let world: React.ReactNode;
  if (t < 5 || (t >= 12.2 && t < 14)) {
    const close = t >= 12.2;
    const hx = close ? 720 : lerp(1100, 720, clamp((q - 1.4) / 1.6));
    const cam: Cam = close ? {cx: 720, cy: 1060, z: 1.65} : camAt(q, [[0, {cx: 560, cy: 1080, z: 1}], [3.5, {cx: 560, cy: 1080, z: 1.04}], [4.7, {cx: 340, cy: 900, z: 2.5}]]);
    world = <WorldCam cam={cam}><LinoDefs />
      <LinoHall t={q} shake={close ? 0 : shakeAt(t)} feet={close ? 0 : 1} />
      {!close && <Knock t={t} x={300} y={800} color={LI.paper} />}
      <LinoFig id="h" p={CAST.hero} x={hx} y={1560} s={1.35} face={close ? {eyes: 'wide', mouth: 'o', brow: 1, lx: -0.3} : {eyes: 'wide', mouth: 'o', brow: 0.6, lx: -1}}
        armR={LARMS.down} tilt={!close && q > 3.2 ? -7 : close ? 4 : 0} />
    </WorldCam>;
  } else if (t < 10 || t >= 14) {
    const late = t >= 14;
    const open = late ? clamp((q - 14.5) / 0.6) : 0;
    world = <Peephole><WorldCam cam={late ? camAt(q, [[14, {cx: 540, cy: 1010, z: 1}], [20, {cx: 540, cy: 960, z: 1.08}]]) : camAt(q, [[5, {cx: 540, cy: 1090, z: 0.92}], [6.8, {cx: 540, cy: 1090, z: 0.94}], [7.8, {cx: 540, cy: 1250, z: 1.5}], [10, {cx: 540, cy: 1240, z: 1.56}]])}>
      <LinoDefs /><LinoLanding t={q} open={open}
        inDoor={late && <g opacity={pop(15.0)}><LinoFig id="n" p={CAST.neighbour} x={490} y={1530} s={1.1} face={{mouth: 'creepy', lx: 0.2}} /></g>} />
      {late && <g opacity={pop(15.5)}><LinoFig id="g" p={CAST.girl} x={960} y={1380} s={1.3} face={{mouth: 'creepy', lx: -0.6}} /></g>}
      <LinoFig id="v" p={CAST.grandma} x={late ? 720 : 540} y={late ? 1700 : 1550} s={late ? 1.8 : 1.3} face={late ? {mouth: 'creepy', brow: -0.2} : {mouth: 'smile'}}
        plate={!late} armL={late ? LARMS.down : LARMS.plate} armR={late ? LARMS.down : LARMS.plate} tilt={late ? 10 : q > 8 ? 8 : 0} />
    </WorldCam></Peephole>;
  } else {
    world = <WorldCam cam={camAt(q, [[10, {cx: 540, cy: 1000, z: 1.02}], [12.2, {cx: 540, cy: 980, z: 1.1}]])}><LinoDefs />
      <LinoNotice photo={<LinoFig id="ph" p={CAST.grandma} x={170} y={185} s={1.55} headOnly face={{mouth: 'flat'}} />} />
    </WorldCam>;
  }
  return <AbsoluteFill style={{background: LI.ink}}>{world}<Grain f={Math.floor(q * 12)} k={0.09} /><Texts name="НОЧНАЯ ГРАВЮРА" /></AbsoluteFill>;
};

// ================= 3. x-ray of an everyday nightmare =================
export const StyleXray: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const reveal = clamp((t - 5.0) / 0.9), revealAll = clamp((t - 14.3) / 1.0);
  const late = t >= 14;
  const close = t >= 12.2 && t < 14;
  const cam: Cam = t < 5 ? camAt(t, [[0, {cx: 520, cy: 1180, z: 1.25}], [3.4, {cx: 520, cy: 1180, z: 1.28}], [4.8, {cx: 780, cy: 1150, z: 1.3}]])
    : t < 10 ? camAt(t, [[5, {cx: 960, cy: 1170, z: 0.95}], [10, {cx: 960, cy: 1160, z: 1.0}]])
    : t < 12.2 ? {cx: 1100, cy: 1120, z: 1.15}
    : close ? {cx: 760, cy: 1010, z: 2.0}
    : camAt(t, [[14, {cx: 960, cy: 1170, z: 0.95}], [15.6, {cx: 1000, cy: 1560, z: 0.46}], [20, {cx: 1000, cy: 1540, z: 0.48}]]);
  const hx = t < 5 ? lerp(280, 760, clamp((t - 1.4) / 1.6)) : 760;
  const walking = t > 1.4 && t < 3.0;
  const gm = late ? ghost(CAST.grandma) : CAST.grandma;
  const nbX = 1780, girlX = 1760;
  const nbY = stairY(nbX, 1520, FL.f5, 2040, 1030), girlY = stairY(girlX, 2040, 2090, 1520, FL.f5);
  const show = (at: number) => clamp((t - at) / 0.4);
  return (
    <AbsoluteFill style={{background: CW.bg}}>
      <WorldCam cam={cam}>
        <LookDefs />
        <Building t={t} reveal={reveal} revealAll={revealAll} shake={t < 5 ? shakeAt(t) : 0} />
        {t < 5 && <Knock t={t} x={780} y={900} color="#fff" />}
        <Fig id="hero" p={CAST.hero} look="mid" x={hx} y={FL.f5} s={1.35}
          face={close ? {eyes: 'wide', brow: 1, mouth: 'o', lx: 0.3} : {eyes: 'wide', brow: 0.6, mouth: t > 3 && t < 5 ? 'flat' : 'o', lx: 1}}
          pose={close ? {armR: ARMS.mouth} : {walk: walking ? (t - 1.4) * 9 : undefined, tilt: t > 3.2 && t < 5 ? 6 : 0}} />
        {t >= 5 && <Fig id="gm" p={gm} look="mid" x={1110} y={FL.f5} s={1.35}
          face={late ? {eyes: 'open', mouth: 'creepy', lx: -1} : {eyes: 'open', mouth: 'smile', lx: -1}}
          pose={late ? {tilt: 8} : {plate: true, armL: ARMS.plate, armR: ARMS.plate, tilt: t > 8 ? 7 : 0}} />}
        {late && <g opacity={show(15.2)}>
          <Fig id="nb" p={ghost(CAST.neighbour)} look="mid" x={nbX} y={nbY} s={1.3} face={{eyes: 'open', mouth: 'creepy', lx: -1}} />
          <Fig id="girl" p={ghost(CAST.girl)} look="mid" x={girlX} y={girlY} s={1.35} face={{eyes: 'open', mouth: 'creepy', lx: -1}} />
        </g>}
        {late && <DangerPath t={t} o={show(15.8)} d={`M ${girlX} ${girlY - 200} Q 1500 1700 1180 ${FL.f5 - 300} M ${nbX} ${nbY - 300} Q 1500 900 1180 ${FL.f5 - 420} M 1080 ${FL.f5 - 360} L 965 ${FL.f5 - 354}`} />}
      </WorldCam>
      {t >= 10 && t < 12.2 && (() => {
        const k = easeOut((t - 10.1) / 0.3);
        return <>
          <svg width={1080} height={1920} style={{position: 'absolute', opacity: k}}><path d="M 540 900 L 540 1010" stroke={CW.line} strokeWidth={4} strokeDasharray="10 8" /><circle cx={540} cy={1020} r={10} fill={CW.line} /></svg>
          <div style={{position: 'absolute', left: 140, top: 250, width: 800, opacity: k, transform: `translateY(${(1 - k) * 20}px)`, background: 'rgba(12,17,25,0.95)', border: `3px solid ${CW.line}`, padding: '24px 28px', display: 'flex', gap: 26}}>
            <svg width={250} height={300} viewBox="0 0 250 300" style={{flex: '0 0 250px', background: '#b9b4aa'}}>
              <LookDefs /><Fig id="ph" p={CAST.grandma} look="mid" x={125} y={160} s={1.15} headOnly face={{eyes: 'open', mouth: 'flat'}} />
              <path d="M 190 0 L 250 0 L 250 60 Z" fill="#111" />
            </svg>
            <div style={{fontFamily: MONO, color: CW.label, fontSize: 28, lineHeight: 1.35}}>
              <div style={{color: '#fff', fontFamily: MONT, fontWeight: 900, fontSize: 36, lineHeight: 1.1}}>ВАЛЕНТИНА ИВАНОВНА</div>
              <div style={{marginTop: 10}}>КВАРТИРА 19</div>
              <div style={{marginTop: 10}}>ОБЪЯВЛЕНИЕ У ПОДЪЕЗДА</div>
              <div style={{marginTop: 18, color: CW.red, fontFamily: MONT, fontWeight: 900, fontSize: 34}}>СКОНЧАЛАСЬ 14 МАРТА</div>
            </div>
          </div>
        </>;
      })()}
      <Texts name="РЕНТГЕН БЫТОВОГО КОШМАРА" />
    </AbsoluteFill>
  );
};
