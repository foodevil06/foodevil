// Style frames for the hybrid look "Красная нить" (one still per 30 frames): world, evidence + thread, chat,
// choice, next part. Render stills at frames 20, 50, 80, 110, 160 to review the look before a real episode.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Night, Desk, Paper, Stamp, SafeZones, SAFE, C, MONO, HAND} from '../case/Kit';
import {Phone} from '../case/Phone';
import {Portrait} from '../case/Sets';
import {Grain, DayChip, DataChip, FlatHouse, MapTop, Thread, Choice, NextPart, MidSubs} from '../case/Hybrid';

export const StyleFrames: React.FC<{safe?: boolean}> = ({safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const k = Math.floor(f / 30), lf = f % 30, lt = lf / fps;
  const at = (k * 30) / fps;
  const lit = (fl: number, c: number) => ((fl * 7 + c * 3) % 5 < 2 ? 1 : 0) + (fl === 8 && c === 2 ? 1 : 0);
  let shot: React.ReactNode = null;
  if (k === 0) shot = (<>
    <FlatHouse t={t} floors={9} lit={lit} cam={0.4} ghost={1} />
    <DayChip text="НОЧЬ 1 — 03:00" />
    <DataChip f={f} fps={fps} at={at - 1} x={SAFE.left + 10} y={300} label="ЭТАЖЕЙ" value="9" />
    <DataChip f={f} fps={fps} at={at - 1} x={SAFE.left + 10} y={430} label="КВАРТИР" value="36" />
    <DataChip f={f} fps={fps} at={at - 1} x={560} y={300} label="ПИШЕТ ИЗ" value="КВ. 40" tone="red" icon="⚠" />
    <MidSubs words={['А', 'ВЫ', 'ЖИВЁТЕ', 'НА', 'ДЕВЯТОМ']} on={4} />
  </>);
  if (k === 1) shot = (<>
    <MapTop t={t} route={1} zoom={1.05} focus={[560, 640]} />
    <Paper f={f} fps={fps} at={at - 1} x={SAFE.left + 20} y={250} w={330} h={400} rot={-6} tape color="#fbfaf6">
      <div style={{position: 'absolute', left: 24, top: 24, width: 282, height: 282}}><Portrait t={t} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 318, textAlign: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 50, color: '#24317a'}}>Вы</div>
    </Paper>
    <Thread a={[300, 330]} b={[640, 560]} p={1} sag={120} />
    <DataChip f={f} fps={fps} at={at - 1} x={560} y={330} label="СЛЕДЫ ВЕДУТ" value="НАВЕРХ" tone="red" icon="↑" />
    <DayChip text="НОЧЬ 1 — 03:12" />
    <MidSubs words={['НИТЬ', 'ВЕДЁТ', 'НА', 'КРЫШУ']} on={3} tone="red" />
  </>);
  if (k === 2) shot = (<>
    <Night t={t} />
    <AbsoluteFill style={{transform: 'scale(0.86) rotate(-3deg)', transformOrigin: '42% 30%'}}>
      <Phone f={f} fps={fps} t0={-5} title="Дом · Садовая 7" sub="Кв. 40 печатает…" clock="03:14"
        msgs={[{at: -1, name: 'Кв. 40', color: '#9aa7bd', avatar: '40', text: 'Вы опять стучите.', time: '03:12'},
               {at: -1, out: true, text: 'Это не я.', time: '03:12'},
               {at: -1, name: 'Кв. 40', color: '#9aa7bd', avatar: '40', text: 'Тогда поднимитесь и посмотрите.', time: '03:14'}]} />
    </AbsoluteFill>
    <Paper f={f} fps={fps} at={at - 1} x={600} y={820} w={300} h={360} rot={7} tape color="#fbfaf6">
      <svg viewBox="0 0 260 260" style={{position: 'absolute', left: 20, top: 20, width: 260, height: 260}}>
        <rect width={260} height={260} fill="#1b2232" /><rect x={70} y={40} width={120} height={220} fill="#4a3426" />
        <rect x={104} y={70} width={52} height={30} fill="#d9c27a" /><text x={130} y={93} fontFamily={MONO} fontSize={24} textAnchor="middle" fill="#222">40</text>
        <circle cx={172} cy={160} r={6} fill="#d9c27a" /><rect x={70} y={252} width={120} height={8} fill="#f0c56e" opacity={0.8} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 292, textAlign: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 44, color: '#7a1f1f'}}>крыша?</div>
    </Paper>
    <Thread a={[520, 760]} b={[740, 850]} p={1} sag={40} />
    <MidSubs words={['ТОГДА', 'ПОДНИМИТЕСЬ']} on={1} y={1300} />
  </>);
  if (k === 3) shot = (<>
    <FlatHouse t={t} floors={9} lit={() => 0.35} cam={-0.3} />
    <AbsoluteFill style={{background: 'rgba(6,8,12,0.55)'}} />
    <DayChip text="НОЧЬ 1 — 03:15" />
    <DataChip f={f} fps={fps} at={at - 1} x={SAFE.cx - 150} y={300} label="НА РЕШЕНИЕ" value="00:59" tone="gold" />
    <Choice f={f} fps={fps} at={at - 2} a="ПОДНЯТЬСЯ НА КРЫШУ" b="ВЫЗВАТЬ ПОЛИЦИЮ" t={t} />
    <MidSubs words={['А', 'ЧТО', 'СДЕЛАЕТЕ', 'ВЫ?']} on={3} y={1300} />
  </>);
  if (k >= 4) shot = (<>
    <Desk t={t} />
    <AbsoluteFill style={{background: 'rgba(5,6,9,0.7)'}} />
    <Stamp f={f} fps={fps} at={at - 1} x={SAFE.cx} y={330} text="ДЕЛО №1 · КВ. 40" kind="outline" rot={-4} size={50} />
    <NextPart f={f} fps={fps} at={at - 2} part={2} />
  </>);
  return (
    <AbsoluteFill style={{background: C.night}}>
      {shot}
      <Grain f={f} />
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
