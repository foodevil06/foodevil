// "Дело №1: квартира 36" (~30 s, 9:16), case-file look from STYLE-CARD.md.
// Dossier -> neighbour from flat 40 writes in the house chat -> the house has only 9 floors -> "над нами только крыша"
// -> long typing -> "почему вы стучите мне в пол?" -> knocks from the ceiling. Beats come from case01.voice.json.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './case01.voice.json';
import {Desk, Night, Paper, Stamp, Ring, BigClock, CaseSubs, Push, SafeZones, SAFE, C, MONO, HAND, MONT} from '../case/Kit';
import {Phone, Msg} from '../case/Phone';
import {Facade, Portrait, Ceiling} from '../case/Sets';
import {clamp, easeOut, spring01} from '../lib/anim';

export const C1_FPS = 30;
export const C1_SEC = Math.ceil(voice.total * 10) / 10;
const L = (i: number) => voice.lines[i];
const W = (w: string, from = 0) => voice.lines.slice(from).flatMap((l) => l.words).find((x) => x.w.toLowerCase().startsWith(w))!.t;

const B = {
  note: W('последнем') - 0.1, ring: L(1).start,
  phone1: L(2).start - 0.1, notify: W('написали'), msg40: L(3).start,
  house: L(4).start - 0.1, count0: L(4).start + 0.2, count1: L(5).start + 0.3, nine: W('девять'), ghost: L(5).end + 0.35,
  phone2: L(6).start - 0.1, reply: W('над'), typing: L(7).start - 0.2, long: W('долго'), why: L(8).start, floor: W('пол?', 8),
  ceiling: L(9).start - 0.1,
};
const KNOCKS = [L(10).end + 0.15, L(10).end + 0.49, L(10).end + 0.83]; // spacing of the three hits in public/sfx/knock.opus
const END = KNOCKS[2] + 0.7;
const TONE: ('white' | 'yellow' | 'red')[] = ['white', 'yellow', 'white', 'yellow', 'white', 'red', 'white', 'yellow', 'red', 'white', 'red'];

const MSGS: Msg[] = [
  {at: -1, day: 'Вчера', name: 'Света, кв. 12', color: '#5fbf7a', text: 'Чей велосипед у лифта?', time: '18:42'},
  {at: -1, name: 'Олег, кв. 21', color: '#e0736b', text: 'Не мой', time: '18:50'},
  {at: -1, name: 'Управдом', color: '#b58cf0', text: 'Миша из 36-й теперь с нами. Добро пожаловать!', time: '21:15'},
  {at: B.msg40, day: 'Сегодня', name: 'Кв. 40', color: '#9aa7bd', avatar: '40', text: 'Можно потише? Вы мешаете спать.', time: '02:47'},
  {at: B.reply, out: true, text: 'Над нами только крыша.', time: '02:48'},
  {at: B.why, name: 'Кв. 40', color: '#9aa7bd', avatar: '40', text: 'Тогда почему вы стучите мне в пол?', time: '02:52'},
];

// scene wrapper: quick fade-in on the cut
const Cut: React.FC<{t: number; from: number; to: number; children: React.ReactNode}> = ({t, from, to, children}) =>
  t >= from && t < to ? <AbsoluteFill style={{opacity: easeOut((t - from) / 0.12)}}>{children}</AbsoluteFill> : null;

export const Case01: React.FC<{audio?: boolean; safe?: boolean}> = ({audio = false, safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const shake2 = spring01(f, B.floor * fps, fps, 6, 0.2) * Math.exp(-3 * Math.max(0, t - B.floor)) * (t > B.floor ? 1 : 0);
  const knockShake = KNOCKS.reduce((a, k) => a + (t > k ? Math.exp(-7 * (t - k)) : 0), 0);
  const endP = easeOut((t - END) / 0.6);
  return (
    <AbsoluteFill style={{background: C.night}}>
      {audio && <Audio src={staticFile('case01/mix.wav')} />}

      {/* 1. dossier on the desk */}
      <Cut t={t} from={0} to={B.phone1}>
        <Desk t={t} />
        <Push t={t} t0={0} k={0.05}>
          <Paper f={f} fps={fps} at={0} x={70} y={170} w={860} h={1120} color={C.card} rot={-1.5} from={700}>
            <div style={{position: 'absolute', left: 50, top: 40, fontFamily: MONO, fontSize: 42, color: '#3d2f1a', letterSpacing: 3}}>ДЕЛО №1: КВАРТИРА 36</div>
          </Paper>
          <Paper f={f} fps={fps} at={0.25} x={120} y={290} w={480} h={580} rot={-4} tape color="#fbfaf6">
            <div style={{position: 'absolute', left: 36, top: 36, width: 408, height: 408}}><Portrait t={t} /></div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 64, color: '#24317a'}}>Миша</div>
          </Paper>
          <Paper f={f} fps={fps} at={B.note} x={360} y={880} w={560} h={300} rot={2.5} torn>
            <div style={{position: 'absolute', left: 54, top: 60, fontFamily: MONO, fontSize: 46, lineHeight: 1.5, color: C.ink}}>
              МИША, 27 ЛЕТ<br />КВ. 36 · <span style={{position: 'relative'}}>9 ЭТАЖ</span><br />ЗАЕХАЛ ВЧЕРА
            </div>
            <div style={{position: 'absolute', left: 30, top: 30, bottom: 30, width: 3, background: '#e6a0a0'}} />
          </Paper>
          <Ring f={f} fps={fps} at={B.ring} x={752} y={1054} rx={108} ry={40} />
          <Stamp f={f} fps={fps} at={B.ring + 0.15} x={330} y={1235} text="ПОСЛЕДНИЙ ЭТАЖ" kind="red" rot={-6} size={52} />
        </Push>
      </Cut>

      {/* 2. the house chat at night */}
      <Cut t={t} from={B.phone1} to={B.house}>
        <Night t={t} />
        <Push t={t} t0={B.phone1} k={0.03}>
          <Phone f={f} fps={fps} t0={B.phone1} title="Дом · Садовая 7" sub="36 участников" clock="02:47" msgs={MSGS}
            notify={{at: B.notify, until: B.msg40 + 0.2, title: 'Дом · Садовая 7', text: 'Кв. 40: Можно потише?…'}} />
        </Push>
      </Cut>

      {/* 3. counting the floors */}
      <Cut t={t} from={B.house} to={B.phone2}>
        <Night t={t} />
        <Push t={t} t0={B.house} k={0.04}>
          <Facade f={f} fps={fps} floors={9} count={[B.count0, B.count1]} ghost={B.ghost} label="ЭТАЖЕЙ В ДОМЕ" />
          <Stamp f={f} fps={fps} at={B.nine} x={SAFE.cx} y={1250} text="КВ. 40 — НЕ СУЩЕСТВУЕТ" kind="red" rot={-4} size={50} />
        </Push>
      </Cut>

      {/* 4. reply, long typing, the answer */}
      <Cut t={t} from={B.phone2} to={B.ceiling}>
        <Night t={t} />
        <Push t={t} t0={B.phone2} k={0.05} shake={shake2}>
          <Phone f={f} fps={fps} t0={B.phone2 - 1} title="Дом · Садовая 7" sub="36 участников" clock={t < B.why ? '02:48' : '02:52'}
            msgs={MSGS} typing={[B.typing, B.why]} typingName="Кв. 40" />
          <Stamp f={f} fps={fps} at={B.long} x={SAFE.cx} y={600} text="ПЕЧАТАЕТ 4 МИНУТЫ" kind="paper" rot={-5} size={50} />
        </Push>
      </Cut>

      {/* 5. knocks from above */}
      <Cut t={t} from={B.ceiling} to={1e9}>
        <Push t={t} t0={B.ceiling} k={0.03} shake={knockShake * 0.6}>
          <Ceiling f={f} fps={fps} knocks={KNOCKS} hideAt={END - 0.25} />
          <BigClock time="02:53" y={1160} size={150} o={0.85} />
        </Push>
        {endP > 0 && (
          <AbsoluteFill style={{background: `rgba(5,6,9,${0.82 * endP})`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30, paddingRight: 1080 - 2 * SAFE.cx, paddingBottom: 200}}>
            <div style={{opacity: endP, fontFamily: MONO, fontSize: 44, letterSpacing: 10, color: '#8d97ad'}}>ДЕЛО №1 · КВ. 36</div>
            <div style={{opacity: endP, transform: `rotate(-4deg) scale(${1.6 - 0.6 * spring01(f, END * fps, fps, 2.2, 0.45)})`, fontFamily: MONT, fontWeight: 900, fontSize: 84,
              color: C.red, border: `8px solid ${C.red}`, padding: '10px 34px', borderRadius: 14}}>ДЕЛО ОТКРЫТО</div>
            <div style={{opacity: clamp((t - END - 0.5) / 0.4), fontFamily: MONT, fontWeight: 800, fontSize: 40, color: '#fff', marginTop: 30, textAlign: 'center', lineHeight: 1.3}}>ЧАСТЬ 2 — ПОДПИШИСЬ,<br />ЧТОБЫ НЕ ПРОПУСТИТЬ</div>
          </AbsoluteFill>
        )}
      </Cut>

      <CaseSubs lines={voice.lines} f={f} fps={fps} total={voice.total} tone={(i) => TONE[i] ?? 'white'} />
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
