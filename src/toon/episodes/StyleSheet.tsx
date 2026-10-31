// Style sheet for choosing the channel look (docs/strategy/СТИЛЬ_И_ФОРМАТ.md). One frame per panel:
//   0 = hero A (big head, the sleep hero in navy), 1 = hero B (silhouette), 2 = hero C (pictogram), all in the same
//   everyday-horror shot; 3 = the "inside" format: hero A under an x-ray scan with the red thread of damage.
//   node scripts/render.mjs stills StyleSheet out/style 0 1 2 3
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Hero, HeroSpec} from '../sleep/Hero';
import {MONO} from '../case/Kit';
import {Callout, Hallway, Hud, NAVY, PAL, Pictogram, RuleCard, Silhouette, Sub, Thread, Title, XRayBody} from '../style/StyleKit';

const Badge: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 40, top: 40, fontFamily: MONO, fontSize: 36, color: PAL.ice, background: 'rgba(0,0,0,0.55)', padding: '10px 18px', borderRadius: 8}}>{text}</div>
);

const HORROR = {x: 720, y: 1120, s: 1.1};
const heroA: HeroSpec = {id: 'a', ...HORROR, pal: NAVY, lookX: -0.75, lookY: 0.1, brow: 0.75, browUp: 0.5, mouth: 'open', mo: 0.25, tilt: -5, turn: -0.35,
  rim: 0.6, rimColor: PAL.cold, handL: {x: -40, y: 300, grip: 'open'}, handR: {x: 190, y: 560}};

const HorrorPanel: React.FC<{v: 0 | 1 | 2}> = ({v}) => (
  <AbsoluteFill style={{background: PAL.night}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <Hallway />
      <Thread pts={[{x: 482, y: 1070}, {x: 436, y: 1330}, {x: 396, y: 1588}]} sag={0.4} />
      {v === 0 && <Hero {...heroA} />}
      {v === 1 && <Silhouette {...HORROR} lookX={-0.8} lookY={0.1} tilt={-5} handL={{x: -40, y: 300}} handR={{x: 190, y: 560}} />}
      {v === 2 && <Pictogram {...HORROR} tilt={-8} handL={{x: -60, y: 300}} handR={{x: 180, y: 560}} />}
    </svg>
    <Title lines={['ЕСЛИ ДОМОФОН', 'ЗВОНИТ ИЗ', ['ПУСТОЙ КВАРТИРЫ', 'red']]} size={74} />
    <RuleCard y={520} text="НЕ НАЗЫВАЙ СВОЁ ИМЯ" />
    <Sub words={['ТАМ', 'НИКТО', 'НЕ ЖИВЁТ']} hot={2} />
    <Badge text={['ВАРИАНТ A · БОЛЬШЕГОЛОВЫЙ', 'ВАРИАНТ B · СИЛУЭТ', 'ВАРИАНТ C · ЧЕЛОВЕК ИЗ ИНСТРУКЦИИ'][v]} />
  </AbsoluteFill>
);

const SCAN = 520;    // the scan line (x): to the right of it the body is shown from the inside, the face stays on the left
const INSIDE = {x: 540, y: 900, s: 1.35, handL: {x: -200, y: 560}, handR: {x: 200, y: 560}};
const InsidePanel: React.FC = () => (
  <AbsoluteFill style={{background: PAL.night}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="in-vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.6} /></radialGradient>
        <linearGradient id="in-band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={PAL.xLine} stopOpacity={0.3} /><stop offset="1" stopColor={PAL.xLine} stopOpacity={0} /></linearGradient>
        <clipPath id="in-above"><rect x={SCAN} y={0} width={1080 - SCAN} height={1920} /></clipPath>
        <clipPath id="in-below"><rect x={0} y={0} width={SCAN} height={1920} /></clipPath>
      </defs>
      {Array.from({length: 19}, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1920} stroke="#1a2a40" strokeWidth={2} opacity={0.6} />)}
      {Array.from({length: 33}, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1080} y2={i * 60} stroke="#1a2a40" strokeWidth={2} opacity={0.6} />)}
      <g clipPath="url(#in-below)">
        <Hero id="d" {...INSIDE} pal={NAVY} lid={0.35} bags={0.45} red={0.3} pale={0.2} brow={0.4} mouth="flat" rim={0.5} rimColor={PAL.cold} handL={{...INSIDE.handL}} handR={{...INSIDE.handR}} />
      </g>
      <g clipPath="url(#in-above)">
        <XRayBody {...INSIDE} hot={{brain: true, hippo: true}} />
      </g>
      <rect x={SCAN} y={430} width={150} height={1090} fill="url(#in-band)" />
      <rect x={SCAN - 4} y={420} width={8} height={1110} rx={4} fill={PAL.xLine} />
      {/* the red thread of damage: frontal lobe (attention) and hippocampus (memory) to their labels */}
      <Thread pts={[{x: 600, y: 600}, {x: 680, y: 548}, {x: 736, y: 560}]} sag={0.05} w={4} />
      <Thread pts={[{x: 562, y: 704}, {x: 650, y: 770}, {x: 736, y: 790}]} sag={0.05} w={4} />
      <rect x={0} y={0} width={1080} height={1920} fill="url(#in-vig)" />
    </svg>
    <Title lines={['ЧТО БУДЕТ, ЕСЛИ', ['НЕ СПАТЬ 7 ДНЕЙ', 'red']]} size={80} />
    <Hud text="БЕЗ СНА: 24 Ч" y={500} />
    <Callout x={752} y={520} title="МОЗГ" text="внимание падает" />
    <Callout x={752} y={750} title="ГИППОКАМП" text="новое запоминается хуже" />
    <Sub words={['СУТКИ', 'БЕЗ', 'СНА']} hot={0} tone="white" />
    <Badge text="ФОРМАТ «ИЗНУТРИ» · ГЕРОЙ A" />
  </AbsoluteFill>
);

export const StyleSheet: React.FC = () => {
  const f = useCurrentFrame();
  return f >= 3 ? <InsidePanel /> : <HorrorPanel v={f as 0 | 1 | 2} />;
};
