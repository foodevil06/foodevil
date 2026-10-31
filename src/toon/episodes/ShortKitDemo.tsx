// The Shorts kit on hero A, shown two ways (docs/strategy/НАБОР_SHORTS.md):
//   ShortKitSheet: one still per panel, 60 frames apart (frame = panel * 60 + 50):
//     0 emotions, 1 poses and outfit, 2 three looks (normal / shadow / x-ray split), 3 bedroom, 4 landing, 5 kitchen,
//     6 the "inside" format, 7 the end card, 8 the cover
//     node scripts/render.mjs stills ShortKitSheet out/kit 50 110 170 230 290 350 410 470 530
//   ShortKitDemo: a silent 22 s Short with fixed times that shows the grammar: hook in the first second, the thread
//     progress, a new element every 2-3 s, rule cards, a shadow beat, the end card. A real episode takes the times
//     from its voice (W('слово'), L(i).start) instead of the numbers below.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {MONO, MONT, SafeZones} from '../case/Kit';
import {Grain} from '../case/Hybrid';
import {Cam, camAt, drift, WorldCam} from '../sleep/Sets';
import {Hallway, PAL, Sub} from '../style/StyleKit';
import {Bedroom, Bubble, Clock, CoverA, EMO, Emo, EndCard, FactTag, HERO_A_NAVY, HeroA, Kitchen, Landing, Mark, Pose, RuleCard, ThreadProgress, TopChip} from '../style/ShortKit';

const Label: React.FC<{x: number; y: number; text: string; size?: number}> = ({x, y, text, size = 30}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translateX(-50%)', fontFamily: MONO, fontSize: size, color: PAL.ice, whiteSpace: 'nowrap'}}>{text}</div>
);
const Badge: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 30, top: 30, fontFamily: MONO, fontSize: 32, color: PAL.ice, background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: 8}}>{text}</div>
);
const Frame: React.FC<{children: React.ReactNode}> = ({children}) => <svg width={1080} height={1920} style={{position: 'absolute'}}>{children}</svg>;

// ---------- the sheet ----------
const EMOS = Object.keys(EMO) as Emo[];
const EMO_RU: Record<Emo, string> = {calm: 'спокоен', smile: 'улыбка', alert: 'насторожился', scared: 'страх', terror: 'ужас', suspicious: 'подозрение', angry: 'злость', sad: 'грусть', tired: 'устал', shock: 'шок'};
const POSES: [Pose, string][] = [['down', 'стоит'], ['phone', 'телефон'], ['phoneEar', 'звонок'], ['listen', 'слушает'], ['shush', 'тише'], ['stop', 'стоп'], ['mouth', 'зажал рот'], ['reach', 'тянется'], ['shrug', 'не знаю']];

export const ShortKitSheet: React.FC = () => {
  const f = useCurrentFrame();
  const panel = Math.floor(f / 60), t = f / 30, at = panel * 2;    // overlays of a panel appear at its start
  const bg = (c = PAL.night) => ({background: c});
  if (panel === 0) return (
    <AbsoluteFill style={bg()}>
      <Frame>{EMOS.map((e, i) => <HeroA key={e} id={`e${i}`} t={t} emo={e} x={200 + (i % 3) * 340} y={420 + Math.floor(i / 3) * 400} s={0.95} o={{headOnly: true}} />)}</Frame>
      {EMOS.map((e, i) => <Label key={e} x={200 + (i % 3) * 340} y={430 + Math.floor(i / 3) * 400} text={EMO_RU[e]} />)}
      <Badge text="ГЕРОЙ A · 10 ЭМОЦИЙ (EMO)" />
    </AbsoluteFill>
  );
  if (panel === 1) return (
    <AbsoluteFill style={bg()}>
      <Frame>{POSES.map(([p], i) => <HeroA key={p} id={`p${i}`} t={t} emo={p === 'mouth' ? 'terror' : p === 'shrug' ? 'suspicious' : 'alert'} pose={p} x={200 + (i % 3) * 340} y={250 + Math.floor(i / 3) * 560} s={0.48} />)}</Frame>
      {POSES.map(([p, ru], i) => <Label key={p} x={200 + (i % 3) * 340} y={590 + Math.floor(i / 3) * 560} text={`${p} · ${ru}`} size={26} />)}
      <Badge text="ГЕРОЙ A · ПОЗЫ (POSE)" />
    </AbsoluteFill>
  );
  if (panel === 2) return (
    <AbsoluteFill style={bg()}>
      <Frame>
        <HeroA id="m1" t={t} emo="alert" x={190} y={760} s={0.62} />
        <HeroA id="m0" t={t} emo="alert" x={190} y={1460} s={0.62} pal={HERO_A_NAVY} />
        <HeroA id="m2" t={t} emo="alert" mode="shadow" x={540} y={760} s={0.62} />
        <HeroA id="m3" t={t} emo="tired" mode="split" scan={890} x={890} y={760} s={0.62} hot={{brain: true}} />
        <HeroA id="m4" t={t} emo="scared" mode="xray" x={890} y={1460} s={0.62} hot={{hippo: true}} />
      </Frame>
      <Label x={190} y={1170} text="обычный (серый)" /><Label x={190} y={1870} text="обычный (синий)" />
      <Label x={540} y={1170} text="тень: хоррор" /><Label x={890} y={1170} text="скан: изнутри" /><Label x={890} y={1870} text="рентген" />
      <Badge text="ТРИ ВИДА ОДНОГО ГЕРОЯ (MODE)" />
    </AbsoluteFill>
  );
  if (panel === 3) return (
    <AbsoluteFill style={bg()}>
      <Frame><Bedroom t={t} ajar={0.5} eyes={1} /><HeroA id="b" t={t} emo="scared" pose="phone" x={640} y={1180} s={1} o={{lookX: -0.9}} /></Frame>
      <ThreadProgress steps={['1', '2', '3', '4']} at={[at - 3, at - 1]} />
      <Clock text="03:12" at={at - 1} />
      <TopChip text="ШКАФ БЫЛ *ЗАКРЫТ*" at={at - 1} y={460} />
      <Sub words={['ДВЕРЬ', 'ПРИОТКРЫТА']} hot={1} />
      <Badge text="СПАЛЬНЯ · Bedroom" />
    </AbsoluteFill>
  );
  if (panel === 4) return (
    <AbsoluteFill style={bg()}>
      <Frame><Landing t={t} upstairs={1} /><HeroA id="l" t={t} emo="suspicious" pose="listen" x={560} y={1150} s={1} o={{lookX: 0.9, lookY: -0.4}} /></Frame>
      <ThreadProgress steps={['1', '2', '3', '4']} at={[at - 3, at - 2, at - 1]} />
      <TopChip text="ШАГИ *СВЕРХУ*" at={at - 1} />
      <Mark kind="x" at={at - 1} x={250} y={760} size={120} />
      <Bubble text="Это сосед, открой" at={at - 1} x={760} y={900} who="thing" />
      <Badge text="ПОДЪЕЗД · Landing" />
    </AbsoluteFill>
  );
  if (panel === 5) return (
    <AbsoluteFill style={bg()}>
      <Frame><Kitchen t={t} fridge={0.7} kettle={1} /><HeroA id="k" t={t} emo="shock" pose="mouth" x={500} y={1180} s={1} o={{lookX: 0.8}} /></Frame>
      <RuleCard n={2} text="НЕ ЗАГЛЯДЫВАЙ В *ХОЛОДИЛЬНИК*" at={at - 1} />
      <Sub words={['ОН', 'ОТКРЫЛСЯ', 'САМ']} hot={2} />
      <Badge text="КУХНЯ · Kitchen + RuleCard" />
    </AbsoluteFill>
  );
  if (panel === 6) return (
    <AbsoluteFill style={bg()}>
      <Frame>
        {Array.from({length: 19}, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1920} stroke="#1a2a40" strokeWidth={2} opacity={0.6} />)}
        <HeroA id="x" t={t} emo="tired" pose="none" mode="split" scan={560} x={540} y={980} s={1.3} hot={{brain: true, hippo: true}} o={{handL: {x: -200, y: 560}, handR: {x: 200, y: 560}}} />
      </Frame>
      <ThreadProgress steps={['0 Ч', '24 Ч', '48 Ч', '72 Ч']} at={[at - 3, at - 1]} />
      <FactTag kind="fact" at={at - 1} y={330} src="Van Dongen, 2003" />
      <TopChip text="ВНИМАНИЕ *ПАДАЕТ*" at={at - 1} y={470} tone="paper" />
      <Sub words={['СУТКИ', 'БЕЗ', 'СНА']} hot={0} tone="white" />
      <Badge text="ФОРМАТ «ИЗНУТРИ»" />
    </AbsoluteFill>
  );
  if (panel === 7) return (
    <AbsoluteFill style={bg()}>
      <Frame><Landing t={t} /></Frame>
      <EndCard at={at - 1.6} q="КАКОЕ ПРАВИЛО ТЫ *НАРУШИШЬ* ПЕРВЫМ?" items={['Не смотри в глазок', 'Не отвечай на своё имя', 'Не заглядывай в холодильник', 'Не открывай до рассвета']} next="ЧАСТЬ 5 ЗАВТРА" />
    </AbsoluteFill>
  );
  return (
    <CoverA series="КУРЬЕР УЖЕ ВНУТРИ" part={4} hook={['ОН УЖЕ', '*ВНУТРИ*']}
      art={<Frame><g transform="translate(-200 -300) scale(1.4)"><Landing t={1} upstairs={1} /></g><HeroA id="c" t={1} emo="terror" pose="mouth" x={600} y={1250} s={1.25} o={{lookX: -0.9}} /></Frame>} />
  );
};

// ---------- the demo Short (silent, fixed times) ----------
export const KD_FPS = 30, KD_SEC = 22;
const B = {rule1: 3.4, landing: 6.6, room: 10.4, rule2: 12.6, shadow: 15.2, end: 17.4};
const MS: Cam = {cx: 540, cy: 1020, z: 1}, CU: Cam = {cx: 560, cy: 960, z: 1.45};

export const ShortKitDemo: React.FC<{safe?: boolean}> = ({safe = false}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const scene = t < B.landing ? 0 : t < B.room ? 1 : t < B.shadow ? 2 : 3;
  const knock = [0.25, 0.75, 1.25].some((k) => t > k && t < k + 0.12) ? 1 : 0;
  return (
    <AbsoluteFill style={{background: PAL.night}}>
      {scene === 0 && <WorldCam cam={camAt(t, [[0, CU], [1.5, {...CU, z: 1.3}], [B.rule1, MS], [B.landing, {...MS, z: 1.05}]])}>
        <Hallway blink={knock ? 1 : 0.4} underDoor={1} />
        <HeroA id="h" t={t} x={720 + knock * 6} y={1120} s={1.1} emo={t < B.rule1 ? 'scared' : 'alert'} pose={t < B.rule1 ? 'down' : 'shush'} o={{lookX: -0.8}} shake={t < B.rule1 ? 0.4 : 0} />
      </WorldCam>}
      {scene === 1 && <WorldCam cam={camAt(t, [[B.landing, {cx: 540, cy: 980, z: 0.9}], [B.room, {cx: 600, cy: 900, z: 1.05}]])}>
        <Landing t={t} flicker={1} upstairs={t > B.landing + 1.8 ? 1 : 0} />
      </WorldCam>}
      {scene === 2 && <WorldCam cam={camAt(t, [[B.room, MS], [B.shadow, {...MS, z: 1.12}]])}>
        <Bedroom t={t} ajar={t > B.rule2 ? 0.4 : 0} eyes={t > B.rule2 + 1 ? 1 : 0} />
        <HeroA id="h" t={t} x={640} y={1180} s={1} emo={t < B.rule2 ? 'alert' : 'terror'} pose={t < B.rule2 ? 'phoneEar' : 'mouth'} o={{lookX: t < B.rule2 ? 0.3 : -0.9}} />
      </WorldCam>}
      {scene === 3 && <WorldCam cam={(() => { const a = camAt(t, [[B.shadow, MS], [B.end, CU]]), d = drift(t, 0.6); return {cx: a.cx + d.cx, cy: a.cy + d.cy, z: a.z, rot: d.rot}; })()}>
        <Bedroom t={t} ajar={1} moon={0.5} />
        <HeroA id="h" t={t} x={640} y={1180} s={1} mode="shadow" o={{lookX: -0.9}} pose="down" />
      </WorldCam>}

      <ThreadProgress steps={['1', '2', '3']} at={[B.rule1, B.rule2, B.shadow]} from={1.2} />
      <Clock text="03:12" at={0.1} until={B.rule1} />
      <Bubble text="ТУК. ТУК. ТУК." at={0.2} until={1.9} x={330} y={760} who="thing" />
      <TopChip text="СТУЧАТ *ИЗНУТРИ* ШКАФА?" at={1.9} until={B.rule1} />
      <RuleCard n={1} text="НЕ СМОТРИ В *ГЛАЗОК*" at={B.rule1} until={B.landing} />
      <TopChip text="НА ПЛОЩАДКЕ *НИКОГО*" at={B.landing + 0.2} until={B.landing + 1.8} />
      <Mark kind="x" at={B.landing + 0.3} until={B.landing + 1.8} x={250} y={830} size={120} />
      <TopChip text="ШАГИ *НАД ТОБОЙ*" at={B.landing + 1.8} until={B.room} />
      <Bubble text="Это сосед. Открой." at={B.room + 0.4} until={B.rule2} x={760} y={760} who="other" />
      <RuleCard n={2} text="НЕ ОТВЕЧАЙ НА *СВОЁ ИМЯ*" at={B.rule2} until={B.shadow} />
      <RuleCard n={3} text="НЕ ВКЛЮЧАЙ *СВЕТ*" at={B.shadow} until={B.end} last />
      {t < B.end && <Sub words={t < B.rule1 ? ['ТРИ', 'СТУКА'] : t < B.landing ? ['ПРАВИЛО', 'ПЕРВОЕ'] : t < B.room ? ['ТАМ', 'ПУСТО'] : t < B.rule2 ? ['ЗВОНИТ', 'СОСЕД'] : t < B.shadow ? ['ШКАФ', 'ОТКРЫТ'] : ['СВЕТ', 'НЕ', 'НУЖЕН']} hot={1} />}
      <EndCard at={B.end} q="КАКОЕ ПРАВИЛО ТЫ *НАРУШИШЬ* ПЕРВЫМ?" items={['Не смотри в глазок', 'Не отвечай на своё имя', 'Не включай свет']} next="ЧАСТЬ 2 ЗАВТРА" />
      <Grain f={f} k={0.06} />
      {safe && <SafeZones />}
      <div style={{position: 'absolute', right: 150, top: 1540, fontFamily: MONT, fontWeight: 900, fontSize: 26, color: '#ffffff40'}}>ДЕМО НАБОРА</div>
    </AbsoluteFill>
  );
};
