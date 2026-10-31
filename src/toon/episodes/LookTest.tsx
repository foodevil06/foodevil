// One 20 s scene drawn in three looks (docs/strategy/ТРИ_СТИЛЯ.md): LookFast, LookMid, LookHeavy. Silent, the story is
// told by on-screen text. Four people from one character system: the hero, grandma Valya, the neighbour, the girl.
//   0-5 s    the hallway, 03:12: three knocks at the front door, the hero comes to the peephole
//   5-10 s   through the peephole: grandma Valya from flat 19 with a pie
//   10-14 s  the death notice at the entrance (she died on 14 March); the hero's face
//   14-20 s  the peephole again: she is closer, two more stand behind her; they were buried too; the rule
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Grain} from '../case/Hybrid';
import {MONO, MONT, SAFE} from '../case/Kit';
import {camAt, Cam, WorldCam} from '../sleep/Sets';
import {clamp, easeOut, lerp, spring01, wobble} from '../lib/anim';
import {ARMS, CAST, Fig, Hallway, Landing, LookDefs, LookId, Notice} from '../looks/Looks';
import {Clock, RuleCard, TopChip} from '../style/ShortKit';

export const LT_FPS = 30, LT_SEC = 20;
const RED = '#ff3b47';
const NAME: Record<LookId, string> = {fast: '1 · БЫСТРЫЙ', mid: '2 · СРЕДНИЙ', heavy: '3 · ТЯЖЁЛЫЙ'};

// caption: one phrase, the word in asterisks is red
export const Caption: React.FC<{text: string; at: number; until: number}> = ({text, at, until}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  if (t < at || t >= until) return null;
  const k = easeOut((t - at) / 0.15);
  return (
    <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 1280, textAlign: 'center', opacity: k, transform: `translateY(${(1 - k) * 12}px)`,
      fontFamily: MONT, fontWeight: 900, fontSize: 66, lineHeight: 1.12, color: '#fff', textTransform: 'uppercase', WebkitTextStroke: '12px #0b0e16', paintOrder: 'stroke fill'}}>
      {text.split(/(\*[^*]+\*)/).map((p, i) => p.startsWith('*') ? <span key={i} style={{color: RED}}>{p.slice(1, -1)}</span> : <React.Fragment key={i}>{p}</React.Fragment>)}
    </div>
  );
};

// what the peephole shows: a round window in a dark door, darker at the edge
export const Peephole: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#07090d'}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <clipPath id="ph-clip"><circle cx={540} cy={860} r={470} /></clipPath>
        <radialGradient id="ph-ring" cx="540" cy="860" r="470" gradientUnits="userSpaceOnUse"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="0.93" stopColor="#000" stopOpacity={0.75} /><stop offset="1" stopColor="#000" stopOpacity={1} /></radialGradient>
      </defs>
      <g clipPath="url(#ph-clip)">{children}<rect width={1080} height={1920} fill="url(#ph-ring)" /></g>
      <circle cx={540} cy={860} r={474} fill="none" stroke="#2a2f38" strokeWidth={10} />
    </svg>
  </AbsoluteFill>
);

const blinkAtT = (t: number, seed: number) => {
  const n = Math.floor(t / 3.1);
  for (const k of [n - 1, n]) { const bt = k * 3.1 + 1.2 + ((seed * 7 + k * 13) % 10) / 10; if (t >= bt && t < bt + 0.16) return 1; }
  return 0;
};

const Scene: React.FC<{look: LookId}> = ({look}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const anim = look !== 'fast';                                  // fast: slides and pops only, no blinking, no stride
  const bl = (seed: number) => (anim ? blinkAtT(t, seed) : 0);
  const knocks = [0.2, 0.7, 1.2];
  const shake = knocks.reduce((a, k) => Math.max(a, t >= k && t < k + 0.18 ? 1 - (t - k) / 0.18 : 0), 0);
  const appear = (at: number) => (look === 'fast' ? (t >= at ? Math.min(1, spring01(f, at * fps, fps, 3, 0.5)) : 0) : clamp((t - at) / 0.5));

  let world: React.ReactNode;
  if (t < 5 || (t >= 12.2 && t < 14)) {
    // the hallway: the hero walks to the door and looks into the peephole; later his face when he remembers
    const close = t >= 12.2;
    const walkT = clamp((t - 1.4) / 1.6);
    const hx = close ? 700 : lerp(1040, 700, walkT);
    const walking = !close && t > 1.4 && t < 3.0;
    const cam: Cam = close ? camAt(t, [[12.2, {cx: 700, cy: 1040, z: 2.1}], [14, {cx: 700, cy: 1030, z: 2.3}]])
      : camAt(t, [[0, {cx: 560, cy: 1080, z: 1}], [3.4, {cx: 560, cy: 1080, z: 1.04}], [4.6, {cx: 330, cy: 900, z: 2.6}]]);
    world = <WorldCam cam={cam}>
      <LookDefs />
      <Hallway look={look} t={t} shake={shake} />
      {!close && knocks.map((k, i) => t >= k && t < k + 0.5 ? <text key={i} x={300 + i * 30} y={760 - i * 60} fontFamily={MONT} fontWeight={900} fontSize={56} fill="#fff" opacity={1 - (t - k) / 0.5} transform={`rotate(-8 300 760)`}>ТУК</text> : null)}
      <Fig id="hero" p={CAST.hero} look={look} x={hx} y={1560} s={1.35}
        face={close ? {eyes: 'wide', brow: 1, mouth: 'o', lx: -0.4, blink: bl(1)} : {eyes: t > 0.2 ? 'wide' : 'open', brow: 0.6, mouth: t > 3 ? 'flat' : 'o', lx: -1, blink: bl(1)}}
        pose={close ? {armR: ARMS.mouth, armL: ARMS.down} : {walk: walking ? (t - 1.4) * 9 : undefined, tilt: t > 3.2 ? -6 : 0}} />
    </WorldCam>;
  } else if (t < 10 || t >= 14) {
    // the peephole: grandma with the pie; later closer, with two more behind her
    const late = t >= 14;
    const sway = anim ? wobble(t * 0.8, 2) * 4 : 0;
    world = <Peephole>
      <WorldCam cam={late ? camAt(t, [[14, {cx: 540, cy: 1010, z: 1}], [20, {cx: 540, cy: 960, z: 1.08}]]) : camAt(t, [[5, {cx: 540, cy: 1090, z: 0.92}], [10, {cx: 540, cy: 1060, z: 0.98}]])}>
        <LookDefs />
        <Landing look={look} t={t} />
        {late && <g opacity={appear(15.2)}>
          <Fig id="nb" p={CAST.neighbour} look={look} x={900} y={1310} s={1.05} face={{eyes: 'open', mouth: 'creepy', lx: -0.5}} />
          <Fig id="girl" p={CAST.girl} look={look} x={190} y={1560} s={1.3} face={{eyes: 'open', mouth: 'creepy', lx: 0.4}} />
        </g>}
        <Fig id="gm" p={CAST.grandma} look={look} x={540} y={late ? 1700 : 1550} s={late ? 1.8 : 1.3}
          face={late ? {eyes: 'open', mouth: 'creepy', brow: -0.2} : {eyes: 'open', mouth: 'smile', blink: bl(4)}}
          pose={late ? {tilt: 10 + sway} : {plate: true, armL: ARMS.plate, armR: ARMS.plate, tilt: t > 8 ? lerp(0, 9, clamp((t - 8) / 1.2)) + sway : sway}} />
      </WorldCam>
    </Peephole>;
  } else {
    // the death notice
    world = <WorldCam cam={camAt(t, [[10, {cx: 540, cy: 860, z: 1.05}], [12.2, {cx: 540, cy: 820, z: 1.2}]])}>
      <Notice look={look} photo={<Fig id="ph" p={CAST.grandma} look={look} x={170} y={210} s={1.45} headOnly face={{eyes: 'open', mouth: 'flat'}} />} />
    </WorldCam>;
  }

  return (
    <AbsoluteFill style={{background: '#07090d'}}>
      {world}
      {look === 'heavy' && <Grain f={f} k={0.07} />}
      <Clock text="03:12" at={0} until={5} />
      <Caption text="03:12. В дверь стучат *три раза*" at={0.15} until={5} />
      <TopChip text="БАБА ВАЛЯ ИЗ *19-Й*" at={5.3} until={10} />
      <Caption text="В глазок видно *соседку*" at={5.15} until={7.6} />
      <Caption text="Она принесла *пирог*" at={7.6} until={10} />
      <TopChip text="ОБЪЯВЛЕНИЕ У ПОДЪЕЗДА" at={10.15} until={12.2} />
      <Caption text="Но её похоронили *в марте*" at={10.15} until={14} />
      <Caption text="За ней стоят *ещё двое*" at={14.15} until={15.9} />
      <Caption text="Их тоже *похоронили*" at={15.9} until={17.3} />
      <RuleCard n={1} text="НЕ ОТКРЫВАЙ ТЕМ, КОГО *ПОХОРОНИЛИ*" at={17.3} y={1180} />
      <div style={{position: 'absolute', left: 30, top: 36, fontFamily: MONO, fontSize: 30, color: '#cfe0f5', background: 'rgba(0,0,0,0.55)', padding: '6px 14px', borderRadius: 8}}>{NAME[look]}</div>
    </AbsoluteFill>
  );
};

export const LookFast: React.FC = () => <Scene look="fast" />;
export const LookMid: React.FC = () => <Scene look="mid" />;
export const LookHeavy: React.FC = () => <Scene look="heavy" />;
