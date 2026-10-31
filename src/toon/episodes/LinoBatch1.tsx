// First Shorts batch in «Ночная гравюра» (31.10.2026), scripts written with ChatGPT as director, 35…45 s each.
// Every beat is taken from the voice (L(i).start, W('слово')), so a re-voice does not break the picture.
//   LinoKnock «Три стука», LinoElevator «Девятнадцатый этаж», LinoPhoto «Фото из угла», LinoGames «Если играть всю ночь»
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CaseSubs} from '../case/Kit';
import {Grain} from '../case/Hybrid';
import {camAt, Cam, WorldCam} from '../sleep/Sets';
import {clamp, lerp} from '../lib/anim';
import {CAST, Person} from '../looks/Looks';
import {stepT} from '../looks/parts';
import {LARMS, LI, LinoDefs, LinoFig, LinoHall, LinoLanding} from '../looks/Linocut';
import {DeskFront, LiftPanel, LinoLift, LinoRoom, LinoRule, LinoStamp, MatShoes, PhoneHand} from '../looks/LinoSets';
import {FactTag} from '../style/ShortKit';
import {Peephole} from './LookTest';
import vKnock from './b1_knock.voice.json';
import vLift from './b1_lift.voice.json';
import vPhoto from './b1_photo.voice.json';
import vGames from './b1_games.voice.json';

export const LB_FPS = 30;
type V = typeof vKnock;
const secOf = (v: V) => Math.ceil((v.total + 0.8) * 10) / 10;
export const LB_SEC = {knock: secOf(vKnock), lift: secOf(vLift as V), photo: secOf(vPhoto as V), games: secOf(vGames as V)};
const tools = (v: V) => ({
  L: (i: number) => v.lines[i],
  W: (w: string, from = 0) => { const x = v.lines.slice(from).flatMap((l) => l.words).find((x) => x.w.toLowerCase().replace(/[«»"…:,.?!]/g, '').startsWith(w)); return x ? x.t : v.lines[from].start; },
});
const LENA: Person = {skin: '#f0c9a8', hair: 'long', hairColor: '#2a1f1a', top: 'hoodie', topColor: '#6a5a7a', bottom: 'pants', bottomColor: '#2c3646', shoes: '#e9ecef', female: true};
const SASHA: Person = {skin: '#f0c39b', hair: 'short', hairColor: '#3a2a20', top: 'hoodie', topColor: '#3f6f73', bottom: 'pants', bottomColor: '#2c3646', shoes: '#e9ecef', kid: false};

const Frame: React.FC<{v: V; wav: string; children: React.ReactNode; rule?: string; ruleAt?: number; extra?: React.ReactNode}> = ({v, wav, children, rule, ruleAt = 0, extra}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: LI.ink}}>
      <Audio src={staticFile(`b1/${wav}.wav`)} />
      {children}
      <Grain f={Math.floor((f / fps) * 12)} k={0.09} />
      {extra}
      {rule && <LinoRule at={ruleAt} text={rule} />}
      {!(rule && f / fps >= ruleAt) && <CaseSubs lines={v.lines} f={f} fps={fps} total={v.total} />}
    </AbsoluteFill>
  );
};
const sfx = (file: string, at: number, vol = 0.5) => <Sequence key={file + at} from={Math.max(0, Math.round(at * LB_FPS))}><Audio src={staticFile(`sfx/${file}`)} volume={vol} /></Sequence>;

// ================= 1. Три стука =================
export const LinoKnock: React.FC = () => {
  const {L, W} = tools(vKnock);
  const f = useCurrentFrame(), t = f / LB_FPS, q = stepT(t, 12);
  const knocks = [W('стучат') - 0.1, W('стучат') + 0.25, W('стучат') + 0.6];
  const shake = knocks.reduce((a, k) => Math.max(a, t >= k && t < k + 0.18 ? 1 - (t - k) / 0.18 : 0), 0);
  let world: React.ReactNode;
  if (t < L(1).start - 0.1) {
    world = <WorldCam cam={camAt(q, [[0, {cx: 560, cy: 1060, z: 1.05}], [L(1).start, {cx: 480, cy: 1000, z: 1.25}]])}><LinoDefs />
      <LinoHall t={q} shake={shake} feet={1} /><LinoFig id="h" p={CAST.hero} x={760} y={1560} s={1.35} face={{eyes: 'wide', mouth: 'o', brow: 0.7, lx: -1}} /></WorldCam>;
  } else if (t < L(2).start - 0.1) {
    // the memory: grandma gives the keys, in a round frame
    world = <Peephole><WorldCam cam={{cx: 560, cy: 1120, z: 1.0}}><LinoDefs /><LinoHall t={0} feet={0} />
      <LinoFig id="b" p={CAST.grandma} x={420} y={1560} s={1.35} face={{mouth: 'flat', brow: -0.4}} armR={{sh: 60, el: 40}} />
      <g transform="translate(650 1150)"><circle r={18} fill="none" stroke={LI.red} strokeWidth={6} /><rect x={14} y={-5} width={60} height={10} fill={LI.red} /><rect x={56} y={4} width={8} height={16} fill={LI.red} /></g>
      <LinoFig id="h" p={CAST.hero} x={830} y={1560} s={1.35} face={{mouth: 'flat', lx: -1}} /></WorldCam></Peephole>;
  } else if (t < L(4).start - 0.1) {
    // the first night: the peephole, nobody, a note on the floor
    const noteK = clamp((q - W('записка', 3) + 0.2) / 0.3);
    world = t < L(3).start + 0.4
      ? <WorldCam cam={camAt(q, [[L(2).start, {cx: 560, cy: 1080, z: 1}], [L(3).start + 0.4, {cx: 340, cy: 900, z: 2.6}]])}><LinoDefs /><LinoHall t={q} feet={0} />
          <LinoFig id="h" p={CAST.hero} x={lerp(760, 470, clamp((q - L(2).start) / 1.4))} y={1560} s={1.35} face={{mouth: 'flat', lx: -1}} tilt={-6} /></WorldCam>
      : <Peephole><WorldCam cam={camAt(q, [[L(3).start, {cx: 540, cy: 1060, z: 0.95}], [W('записка', 3), {cx: 540, cy: 1300, z: 1.3}]])}><LinoDefs /><LinoLanding t={q} />
          <g opacity={noteK} transform="translate(560 1520) rotate(-8)"><rect x={-110} y={-36} width={220} height={72} fill={LI.paper} /><text x={0} y={16} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={44} fill={LI.red}>ОТКРОЙ</text></g>
        </WorldCam></Peephole>;
  } else if (t < L(5).start - 0.1) {
    world = <WorldCam cam={{cx: 640, cy: 1000, z: 0.75}}><LinoDefs /><LinoHall t={q} feet={1} />
      <LinoFig id="h" p={CAST.hero} x={1050} y={1560} s={1.2} face={{eyes: 'wide', mouth: 'flat', lx: -1}} /></WorldCam>;
  } else if (t < L(6).start - 0.1) {
    // the peephole goes dark
    const dark = clamp((q - W('потемнел', 5)) / 0.6);
    world = <WorldCam cam={camAt(q, [[L(5).start, {cx: 340, cy: 900, z: 2.4}], [L(6).start, {cx: 340, cy: 900, z: 4.2}]])}><LinoDefs /><LinoHall t={q} feet={1} />
      <circle cx={340} cy={900} r={13} fill={LI.ink} opacity={dark} /><circle cx={340} cy={900} r={22} fill="none" stroke={LI.paper} strokeWidth={4} /></WorldCam>;
  } else if (t < L(7).start - 0.1) {
    world = <WorldCam cam={{cx: 760, cy: 1050, z: 1.75}}><LinoDefs /><LinoHall t={q} feet={1} />
      <LinoFig id="h" p={CAST.hero} x={760} y={1560} s={1.35} face={{eyes: 'wide', mouth: 'o', brow: 1, lx: -1}} tilt={q % 0.5 < 0.25 ? -2 : 2} /></WorldCam>;
  } else {
    // morning: three scratches on the inside of the door
    const sc = (i: number) => clamp((q - L(7).start - 0.4 - i * 0.25) / 0.2);
    world = <WorldCam cam={camAt(q, [[L(7).start, {cx: 340, cy: 1050, z: 1.4}], [L(9).start, {cx: 340, cy: 1050, z: 2.2}]])}><LinoDefs /><LinoHall t={q} feet={0} />
      <rect x={-1500} y={-1500} width={4080} height={4920} fill={LI.paper} opacity={0.08} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${270 + i * 40} ${980} L ${260 + i * 44} ${980 + 220 * sc(i)}`} stroke={LI.red} strokeWidth={9} strokeLinecap="round" />)}</WorldCam>;
  }
  return <Frame v={vKnock} wav="knock" rule="После трёх стуков *не смотри* в глазок" ruleAt={L(9).start}
    extra={<>{t < L(1).start && <LinoStamp text="03:07" red />}{knocks.map((k) => sfx('knock.opus', k, 0.35))}</>}>{world}</Frame>;
};

// ================= 2. Девятнадцатый этаж =================
export const LinoElevator: React.FC = () => {
  const {L, W} = tools(vLift as V);
  const f = useCurrentFrame(), t = f / LB_FPS, q = stepT(t, 12);
  let world: React.ReactNode;
  const pair = (gmFace: object, gmArm = LARMS.down) => <>
    <LinoFig id="h" p={CAST.hero} x={680} y={1560} s={1.3} face={{eyes: 'wide', mouth: 'flat', lx: -0.6}} />
    <LinoFig id="b" p={CAST.grandma} x={380} y={1560} s={1.3} face={gmFace} armR={gmArm} /></>;
  if (t < L(1).start - 0.1) {
    world = <LiftPanel red19={q > W('девятнадцатый') - 0.3 ? 1 : 0} />;
  } else if (t < L(2).start - 0.1) {
    world = <WorldCam cam={camAt(q, [[L(1).start, {cx: 540, cy: 1000, z: 1}], [L(2).start, {cx: 620, cy: 980, z: 1.1}]])}><LinoDefs />
      <LinoLift t={q} flicker={1} red19={1} />{pair({mouth: 'flat', brow: -0.3, lx: 0.6})}</WorldCam>;
  } else if (t < L(4).start - 0.1) {
    const open = clamp((q - L(2).start) / 0.6);
    world = <WorldCam cam={t < L(3).start ? {cx: 540, cy: 1050, z: 0.95} : camAt(q, [[L(3).start, {cx: 540, cy: 1150, z: 1}], [L(3).start + 0.8, {cx: 540, cy: 1470, z: 2}]])}><LinoDefs />
      <LinoLanding t={q} /><MatShoes x={540} y={1500} />
      <rect x={-200} y={-200} width={740 * (1 - open)} height={2400} fill={LI.ink} stroke={LI.paper} strokeWidth={4} />
      <rect x={540 + 740 * open} y={-200} width={800} height={2400} fill={LI.ink} stroke={LI.paper} strokeWidth={4} /></WorldCam>;
  } else if (t < L(5).start - 0.1) {
    world = <WorldCam cam={{cx: 400, cy: 1000, z: 1.7}}><LinoDefs /><LinoLift t={q} red19={1} />{pair({mouth: 'flat', brow: -0.9, lx: 0.7}, {sh: 80, el: 10})}</WorldCam>;
  } else if (t < L(6).start - 0.1) {
    const kn = [L(5).start + 0.4, L(5).start + 0.75, L(5).start + 1.1];
    const shake = kn.reduce((a, k) => Math.max(a, t >= k && t < k + 0.18 ? 1 : 0), 0);
    world = <WorldCam cam={{cx: 540 + shake * 6, cy: 1050, z: 1.05}}><LinoDefs /><LinoLanding t={q} /><MatShoes x={540} y={1500} /></WorldCam>;
  } else if (t < L(7).start - 0.1) {
    const close = clamp((q - L(6).start - 1.2) / 0.8);
    world = <><WorldCam cam={{cx: 540, cy: 1000, z: 1}}><LinoDefs /><LinoLift t={q} />{pair({mouth: 'flat', brow: -0.6, lx: 0.8}, {sh: 70, el: 20})}</WorldCam>
      <svg width={1080} height={1920} style={{position: 'absolute'}}><rect x={0} y={0} width={540 * close} height={1920} fill={LI.ink} stroke={LI.paper} strokeWidth={4} /><rect x={1080 - 540 * close} y={0} width={540 * close} height={1920} fill={LI.ink} stroke={LI.paper} strokeWidth={4} /></svg></>;
  } else {
    // home: the same shoes at our door, wet
    world = <WorldCam cam={camAt(q, [[L(7).start, {cx: 540, cy: 1150, z: 1}], [L(8).start, {cx: 540, cy: 1480, z: 2.1}]])}><LinoDefs /><LinoLanding t={q} />
      <MatShoes x={540} y={1500} wet={q > W('мокрые', 8) - 0.2 ? 1 : 0} /></WorldCam>;
  }
  return <Frame v={vLift as V} wav="lift" rule="Если лифт везёт на этаж, которого нет, *не выходи*" ruleAt={L(9).start}
    extra={<>{t >= L(1).start && t < L(2).start && <LinoStamp text="ЭТАЖ 19" red />}{[0.4, 0.75, 1.1].map((d) => sfx('knock.opus', L(5).start + d, 0.35))}</>}>{world}</Frame>;
};

// ================= 3. Фото из угла =================
export const LinoPhoto: React.FC = () => {
  const {L, W} = tools(vPhoto as V);
  const f = useCurrentFrame(), t = f / LB_FPS, q = stepT(t, 12);
  const lena = (o: object = {}) => <LinoFig id="l" p={LENA} x={560} y={1560} s={1.3} {...o} />;
  const photo = <g>
    <rect width={508} height={1030} fill="#0b0a08" />
    <text x={20} y={50} fontFamily="PT Mono" fontSize={30} fill={LI.paper}>03:00 · МИНУТУ НАЗАД</text>
    <g transform="translate(254 560) scale(0.62) rotate(8)">
      <rect x={-330} y={-420} width={660} height={860} fill={LI.ink} stroke={LI.paper} strokeWidth={6} />
      <path d="M -300 -120 Q 0 -160 300 -110 L 300 400 L -300 400 Z" fill={LI.paper} /><path d="M -300 -120 Q 0 -160 300 -110 L 300 400 L -300 400 Z" fill="url(#li-b)" opacity={0.5} />
      <rect x={-200} y={-380} width={400} height={180} rx={70} fill={LI.paper} stroke={LI.ink} strokeWidth={5} />
      <LinoFig id="ph" p={LENA} x={0} y={-230} s={1.25} headOnly face={{eyes: 'closed', mouth: 'flat'}} />
    </g>
    <rect width={508} height={1030} fill="url(#li-wf)" opacity={0.15} />
  </g>;
  let world: React.ReactNode;
  if (t < L(1).start - 0.1) {
    world = <WorldCam cam={{cx: 600, cy: 1250, z: 1.6}}><LinoDefs /><LinoRoom t={q} phone={0.6} /></WorldCam>;
  } else if (t < L(2).start - 0.1) {
    const lamp = q < W('выключила', 1) ? 1 : 0;
    world = <WorldCam cam={{cx: 560, cy: 1050, z: 1}}><LinoDefs /><LinoRoom t={q} lamp={lamp} />{lena({face: {mouth: 'flat', lx: 0.5}})}
      {!lamp && <rect x={-1500} y={-1500} width={4080} height={4920} fill="#000" opacity={0.45} />}</WorldCam>;
  } else if (t < L(3).start - 0.1) {
    world = <WorldCam cam={{cx: 560, cy: 1150, z: 1}}><LinoDefs /><LinoRoom t={q} phone={1} /><rect x={-1500} y={-1500} width={4080} height={4920} fill="#000" opacity={0.3} /></WorldCam>;
  } else if (t < L(5).start - 0.1) {
    world = <PhoneHand><LinoDefs />{t < L(4).start ? <><rect width={508} height={1030} fill="#0b0a08" />{[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={20 + (i % 3) * 162} y={120 + Math.floor(i / 3) * 170} width={150} height={150} fill={i === 0 ? LI.paper : '#26221c'} />)}<text x={20} y={60} fontFamily="Montserrat" fontWeight={900} fontSize={40} fill={LI.paper}>ГАЛЕРЕЯ</text><circle cx={150} cy={140} r={12} fill={LI.red} /></> : photo}</PhoneHand>;
  } else if (t < L(6).start - 0.1) {
    // shot from above: the corner over the wardrobe
    world = <WorldCam cam={camAt(q, [[L(5).start, {cx: 560, cy: 1100, z: 0.9}], [L(6).start, {cx: 900, cy: 440, z: 2.2}]])}><LinoDefs /><LinoRoom t={q} phone={1} />
      <rect x={-1500} y={-1500} width={4080} height={4920} fill="#000" opacity={0.35} />
      <path d="M 760 300 L 1080 300 L 1080 480 L 760 480 Z" fill="url(#li-b)" opacity={0.9} /></WorldCam>;
  } else if (t < L(8).start - 0.1) {
    // under the blanket
    world = <WorldCam cam={{cx: 360, cy: 1330, z: 1.6}}><LinoDefs /><LinoRoom t={q} />
      <path d={`M 80 1330 Q 200 ${1180 + (q % 0.5 < 0.25 ? 4 : 0)} 360 1210 Q 520 1200 590 1320 L 590 1470 L 80 1470 Z`} fill={LI.paper} stroke={LI.ink} strokeWidth={5} />
      <path d="M 80 1330 Q 200 1180 360 1210 Q 520 1200 590 1320 L 590 1470 L 80 1470 Z" fill="url(#li-b)" opacity={0.5} />
      <rect x={-1500} y={-1500} width={4080} height={4920} fill="#000" opacity={0.35} /></WorldCam>;
  } else {
    // morning: the top of the wardrobe, dust and two handprints
    const hand = (x: number, r: number) => <g transform={`translate(${x} 470) rotate(${r})`} opacity={q > W('следы', 8) - 0.3 ? 1 : 0}>
      <ellipse cx={0} cy={0} rx={30} ry={36} fill={LI.ink} />{[-24, -8, 8, 24].map((dx, i) => <ellipse key={i} cx={dx} cy={-48 - (i % 3) * 4} rx={8} ry={20} fill={LI.ink} />)}<ellipse cx={-40} cy={-6} rx={8} ry={18} fill={LI.ink} transform="rotate(-40 -40 -6)" /></g>;
    world = <WorldCam cam={camAt(q, [[L(8).start, {cx: 900, cy: 600, z: 1.2}], [L(9).start, {cx: 910, cy: 470, z: 2.4}]])}><LinoDefs /><LinoRoom t={q} dawn={0.5} />
      <rect x={760} y={440} width={300} height={40} fill={LI.paperDim} />{Array.from({length: 60}, (_, i) => <circle key={i} cx={770 + ((i * 53) % 280)} cy={446 + ((i * 17) % 28)} r={2} fill={LI.ink} opacity={0.5} />)}
      {hand(860, -10)}{hand(980, 12)}</WorldCam>;
  }
  return <Frame v={vPhoto as V} wav="photo" rule="Не ищи того, *кто тебя снимает*" ruleAt={L(9).start}
    extra={t >= L(2).start && t < L(3).start ? <LinoStamp text="03:00" red /> : null}>{world}</Frame>;
};

// ================= 4. Если играть всю ночь =================
export const LinoGames: React.FC = () => {
  const {L, W} = tools(vGames as V);
  const f = useCurrentFrame(), t = f / LB_FPS, q = stepT(t, 12);
  const micro = [[W('выключается', 4), 0.45], [W('микросон', 4), 0.35]].some(([a, d]) => t >= a && t < a + d);
  const stage = t < L(2).start ? 0 : t < L(4).start ? 1 : t < L(6).start ? 2 : 3;
  const face = [{eyes: 'wide' as const, mouth: 'smile' as const, lx: 0.8}, {eyes: 'open' as const, mouth: 'flat' as const, lx: 0.8, brow: 0.3}, {eyes: 'closed' as const, mouth: 'flat' as const, lx: 0.8}, {eyes: 'open' as const, mouth: 'o' as const, lx: 0.2, brow: 0.8}][stage];
  const lost = t >= L(5).start && t < L(6).start;
  const cam: Cam = t < L(1).start ? {cx: 420, cy: 1050, z: 1.2} : t < L(4).start ? camAt(q, [[L(1).start, {cx: 420, cy: 1000, z: 1.4}], [L(4).start, {cx: 420, cy: 950, z: 1.8}]]) : t < L(6).start ? {cx: 420, cy: 930, z: 2.1} : {cx: 480, cy: 1000, z: 1};
  const world = <WorldCam cam={cam}><LinoDefs /><LinoRoom t={q} desk bed={false} screen={stage === 3 ? 0.2 : 1} dawn={stage === 3 ? 0.7 : 0} />
    <LinoFig id="s" p={SASHA} x={380} y={1560} s={1.35} face={stage === 2 && q % 1.4 > 0.6 ? {...face, eyes: 'open'} : face} armR={{sh: 40, el: 70}} tilt={stage >= 2 ? 6 : 0} />
    <DeskFront />
    {stage === 3 && <g transform="translate(260 1210) rotate(-6)"><rect x={-120} y={-30} width={240} height={34} fill={LI.paper} /><text x={0} y={-3} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={24} fill={LI.ink}>КОНТРОЛЬНАЯ</text></g>}
  </WorldCam>;
  const clock = t < L(1).start ? '' : t < L(2).start ? '00:00' : t < L(4).start ? '03:00' : t < L(6).start ? '05:00' : '08:00';
  return <Frame v={vGames as V} wav="games" extra={<>
    {clock && <LinoStamp text={t >= L(2).start && t < L(4).start ? `${clock} · БЕЗ СНА 19 Ч` : clock} red={stage === 2} />}
    {lost && <div style={{position: 'absolute', left: 140, top: 520, width: 800, textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 96, color: LI.red, background: LI.ink, border: `6px solid ${LI.paper}`, padding: '20px 0'}}>ПОРАЖЕНИЕ</div>}
    <FactTag kind="fact" at={L(3).start} until={L(4).start} y={330} src="Williamson, Feyer, 2000" />
    <FactTag kind="fact" at={L(4).start + 1} until={L(5).start} y={330} src="микросон: доли секунды сна" />
    <FactTag kind="fact" at={W('опыте', 6) - 0.3} until={L(7).start} y={330} src="Yoo и др., Nature Neuroscience, 2007" />
    {micro && <AbsoluteFill style={{background: '#000'}} />}
  </>}>{world}</Frame>;
};
