// Mascot concepts: frames 0-29 line-up, 30-59 «Нитка», 60-89 «Полночь», 90-119 «Архивариус» in an episode shot.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Yarn, Cat, Archivist, MascotProps} from '../rig/Mascots';
import {Backdrop, Network} from '../case/Heist';
import {Grain} from '../case/Hybrid';
import {SAFE, MONT, MONO, UI, C} from '../case/Kit';

const NAMES: [string, string, string][] = [['А', 'НИТКА', 'клубок\nкрасной нити'], ['Б', 'ПОЛНОЧЬ', 'чёрный\nкот-полуночник'], ['В', 'АРХИВАРИУС', 'хранитель\nстарых дел']];
const LINES = {
  yarn: 'Десять блокчейнов разом. Я столько узлов даже за год не завяжу!',
  cat: 'Десять блокчейнов разом. Даже я ночью так быстро не бегаю.',
  archivist: 'Десять блокчейнов разом. Такого дела в моём архиве ещё не было.',
};

const Bubble: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 400, top: 860, width: 520, background: '#fff', borderRadius: '40px 40px 40px 10px', padding: '28px 34px',
    fontFamily: UI, fontWeight: 800, fontSize: 40, lineHeight: 1.2, color: C.ink, boxShadow: '0 16px 30px rgba(0,0,0,0.5)'}}>{text}</div>
);

export const MascotConcepts: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const view = Math.floor(f / 30);
  const act: Omit<MascotProps, 'x' | 'y' | 's'> = {t, mouth: 0.45, blink: 1, look: [0.6, -0.4], pose: 'point', emo: 'sly'};
  if (view === 0) return (
    <AbsoluteFill>
      <Backdrop t={t} />
      <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 220, textAlign: 'center', fontFamily: MONT, fontWeight: 900, fontSize: 72, color: '#fff'}}>МАСКОТ КАНАЛА</div>
      <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 320, textAlign: 'center', fontFamily: MONO, fontSize: 34, color: '#f5d27a'}}>3 варианта</div>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Yarn t={t} x={200} y={1150} s={0.72} look={[0.3, 0]} emo="neutral" flip />
        <Cat t={t} x={530} y={1150} s={0.72} look={[0, 0]} />
        <Archivist t={t} x={850} y={1150} s={0.72} pose="wave" emo="neutral" mouth={0.3} />
      </svg>
      {NAMES.map(([k, n, d], i) => (
        <div key={n} style={{position: 'absolute', left: [200, 530, 850][i] - 160, width: 320, top: 1190, textAlign: 'center'}}>
          <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 40, color: '#fff'}}><span style={{color: C.red}}>{k}</span> · {n}</div>
          <div style={{fontFamily: UI, fontSize: 30, color: '#9aa6b8', marginTop: 8, whiteSpace: 'pre-line'}}>{d}</div>
        </div>
      ))}
      <Grain f={f} k={0.05} />
    </AbsoluteFill>
  );
  const key = (['yarn', 'cat', 'archivist'] as const)[view - 1];
  const M = {yarn: Yarn, cat: Cat, archivist: Archivist}[key];
  return (
    <AbsoluteFill>
      <Backdrop t={t} tint="#2a0d10" />
      <div style={{position: 'absolute', inset: 0, opacity: 0.55}}><Network f={f + 200} fps={fps} at={0} /></div>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,11,20,0) 40%, rgba(7,11,20,0.85) 75%)'}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}><M {...act} x={key === 'yarn' ? 230 : 240} y={1480} s={0.95} /></svg>
      <Bubble text={LINES[key]} />
      <Grain f={f} k={0.05} />
    </AbsoluteFill>
  );
};
