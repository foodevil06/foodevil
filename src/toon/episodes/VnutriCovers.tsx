// Covers of «Курьер уже внутри» (remake of parts 2-3) and the closing question card, as one-frame stills:
//   node scripts/render.mjs stills VnutriCover2 out/covers 0   (and VnutriCover3, VnutriEndCard)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Cover, EndQuestion} from '../case/Covers';
import {WardrobeFront, FaceClose} from '../case/VnutriEnd';
import {Grain} from '../case/Hybrid';

export const VnutriCover2: React.FC = () => (
  <AbsoluteFill>
    <Cover series="КУРЬЕР УЖЕ ВНУТРИ" part={2} hook={'КТО\n*СНИМАЛ?*'.replace('\n', ' ')}
      art={<WardrobeFront t={0.4} ajar={1} light={1} eye={1} zoom={1.55} />} />
    <Grain f={3} k={0.06} />
  </AbsoluteFill>
);

export const VnutriCover3: React.FC = () => (
  <AbsoluteFill>
    <Cover series="КУРЬЕР УЖЕ ВНУТРИ" part={3} hook="ТВОЯ *СМЕНА*"
      art={<AbsoluteFill style={{transform: 'translateY(160px)'}}><FaceClose t={0.4} f={5} warp={0} glint={0} smirk={0} person={{wrong: 1, smile: 1}} /></AbsoluteFill>} />
    <Grain f={5} k={0.06} />
  </AbsoluteFill>
);

export const VnutriEndCard: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#050608'}}>
      <AbsoluteFill style={{opacity: 0.5}}><WardrobeFront t={1} ajar={0.3} light={0.6} /></AbsoluteFill>
      <EndQuestion t={f / 30 + 3} at={0} q="ВЗЯЛ БЫ *ПАКЕТ?*" a="ДА" b="БЕЖАЛ БЫ" next="ПОДПИШИСЬ — ЧАСТЬ 3 СКОРО" />
      <Grain f={f} k={0.06} />
    </AbsoluteFill>
  );
};
