// 7.6 s mascot test: «Нитка» rolls onto the case board, greets the viewer, ties a polaroid from «Курьер» and the
// «$6,3 млрд» card from «Ограбление века» together with her red thread, tugs it ("потянем за ниточку?") and rolls out.
// Timing follows the voice (nitka_test.voice.json, starts at 0.95 s); the mouth follows nitka_test.mouth.json.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './nitka_test.voice.json';
import mouth from './nitka_test.mouth.json';
import {Nitka, act, Key} from '../rig/Nitka';
import {Polaroid, Card, K} from '../case/KurierSeries';
import {CaseSubs, SafeZones, C, MONT} from '../case/Kit';
import {Grain} from '../case/Hybrid';
import {clamp, easeInOut, easeOut, lerp, mulberry32, ramp, spring01} from '../lib/anim';

export const NT_FPS = 30;
export const NT_SEC = voice.total;
const W = (i: number, k: number) => voice.lines[i].words[k].t;
const X0 = 330, FEET = 1330, SC = 1.55;
const PIN_A: [number, number] = [300, 300], PIN_B: [number, number] = [740, 362];
const IN_END = 0.75, OUT_AT = W(2, 4) + 0.95, END = NT_SEC - 0.45;

const KEYS: Key[] = [
  [0, 'neutral'],
  [IN_END + 0.03, 'happy'],
  [W(0, 0) - 0.05, 'mischief', {arm: 'whisper', look: [0.5, 0.1]}],
  [W(0, 1), 'happy', {arm: 'wave', look: [0.2, 0]}],
  [W(0, 3) - 0.05, 'proud', {arm: 'hips'}],
  [W(1, 0), 'smug', {arm: 'point', look: [0.1, -0.9]}],
  [W(1, 3), 'idea', {arm: 'point', look: [0.4, -0.7]}],
  [W(2, 0), 'playful', {arm: 'tug', look: [0, 0]}],
  [W(2, 4), 'excited', {arm: 'tug', emote: '?'}],
  [OUT_AT - 0.15, 'laugh'],
];

const Board: React.FC<{t: number; f: number; fps: number; litA: number; litB: number; swing: number}> = ({t, f, fps, litA, litB, swing}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 65% at 50% 40%, #4a3524 0%, ${K.cork} 45%, #120c07 100%)`}} />
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.25}}>
      {Array.from({length: 420}, (_, i) => { const r = mulberry32(i + 3); return <circle key={i} cx={r() * 1080} cy={r() * 1920} r={1 + r() * 2.5} fill={i % 2 ? '#1a1108' : '#6b4d30'} />; })}
    </svg>
    <div style={{position: 'absolute', left: 150, top: 290, transform: `rotate(${-6 + swing * 4}deg)`, transformOrigin: '50% 0%',
      filter: `drop-shadow(0 0 ${30 * litA}px rgba(226,59,59,${0.8 * litA}))`}}><div style={{position: 'relative', width: 300, height: 360}}><Polaroid t={t} x={0} y={0} w={300} /></div></div>
    <div style={{position: 'absolute', left: 590, top: 352, transform: `rotate(${5 - swing * 5}deg)`, transformOrigin: '50% 0%',
      filter: `drop-shadow(0 0 ${30 * litB}px rgba(226,59,59,${0.8 * litB}))`}}>
      <Card w={300}><span style={{fontFamily: MONT, fontWeight: 900, fontSize: 52, color: C.ink}}>$6,3 МЛРД</span><br /><span style={{fontSize: 24}}>ОГРАБЛЕНИЕ ВЕКА</span></Card>
    </div>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {[PIN_A, PIN_B].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={14} fill="#b8262a" /><circle cx={x - 4} cy={y - 4} r={5} fill="#ff8a8a" /></g>)}
    </svg>
  </AbsoluteFill>
);

export const NitkaTest: React.FC<{audio?: boolean; safe?: boolean}> = ({audio = true, safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  // enter: roll in from the left with a little bounce; exit: roll out to the right
  const inK = easeOut(t / IN_END), outK = easeInOut((t - OUT_AT) / 0.7);
  const x = lerp(-260, X0, inK) + lerp(0, 1100, clamp(outK));
  const rolling = t < IN_END - 0.05 ? 1 : t > OUT_AT ? 1 : 0;
  const hop = t < IN_END ? -Math.abs(Math.sin(t * 9)) * 40 * (1 - inK) : t > OUT_AT ? -Math.abs(Math.sin((t - OUT_AT) * 9)) * 30 : 0;
  const spin = t < IN_END ? -720 * (1 - inK) : 760 * clamp(outK);
  const st = act(t, KEYS);
  const mi = Math.round(t * mouth.fps);
  const talk = mouth.mouth[Math.min(mouth.mouth.length - 1, Math.max(0, mi))] ?? 0;
  // the thread: to the polaroid pin, then to the card pin; taut on the tug
  const reachP = ramp(t, W(1, 0) - 0.05, W(1, 3) + 0.15, easeInOut);
  const taut = ramp(t, W(2, 2) - 0.05, W(2, 2) + 0.2);
  const tug = t > W(2, 2) ? Math.sin((t - W(2, 2)) * 14) * Math.exp(-3 * (t - W(2, 2))) : 0;
  const litB = clamp(reachP * 2.2 - 1), litA = clamp(reachP * 2.2 - 1.6);  // the thread reaches the card first, then the polaroid
  const iris = clamp((t - END) / 0.4);
  return (
    <AbsoluteFill style={{background: '#0d0805'}}>
      {audio && <Audio src={staticFile('nitka/mix.wav')} />}
      <Board t={t} f={f} fps={fps} litA={litA} litB={litB} swing={tug} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Nitka t={t} x={x} y={FEET + hop} s={SC} st={st} talk={rolling ? 0 : talk} roll={rolling} spin={spin}
          reach={reachP > 0 ? {pts: [PIN_B, PIN_A], p: reachP, taut, fade: 1 - ramp(t, OUT_AT - 0.2, OUT_AT + 0.3)} : null} />
      </svg>
      {iris > 0 && <AbsoluteFill style={{background: `radial-gradient(circle at 520px 700px, rgba(0,0,0,0) ${Math.max(0, 900 * (1 - iris))}px, #050302 ${Math.max(1, 900 * (1 - iris) + 4)}px)`}} />}
      <Grain f={f} k={0.05} />
      {t < END && <CaseSubs lines={voice.lines} f={f} fps={fps} total={voice.total} tone={() => 'red'} />}
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
