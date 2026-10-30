// «Курьер», часть 1 (~40 s, 9:16, "Красная нить" look). A courier brings an order you never made; support says
// it cannot be cancelled; the dot reaches your door, nobody is there, the order is "left in the bedroom".
// Ends on a choice and "Часть 2". Every beat comes from kurier.voice.json (draft timings until the real voice).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './kurier.voice.json';
import {Paper, Stamp, CaseSubs, Push, SafeZones, SAFE, C, HAND} from '../case/Kit';
import {Phone, Msg} from '../case/Phone';
import {Grain, DayChip, DataChip, Thread, Choice, NextPart} from '../case/Hybrid';
import {LockScreen, OrdersEmpty, CourierMap, Stairwell, Peephole, Hallway, Ecg, Note} from '../case/Kurier';
import {easeInOut, easeOut, ramp} from '../lib/anim';

export const KU_FPS = 30;
export const KU_SEC = Math.ceil(voice.total * 10) / 10;
const L = (i: number) => voice.lines[i];
const W = (w: string, from = 0) => voice.lines.slice(from).flatMap((l) => l.words)
  .find((x) => x.w.toLowerCase().replace(/[«»"]/g, '').startsWith(w))!.t;
const cut = (i: number) => L(i).start - 0.1;
const END = L(16).end + 0.6;
const TONE: ('white' | 'yellow' | 'red')[] = ['white', 'yellow', 'red', 'white', 'white', 'red', 'yellow', 'yellow', 'red', 'red', 'white', 'yellow', 'red', 'red', 'white', 'red', 'yellow'];

const NOTE1: Note = {at: W('уведомление') + 0.2, app: 'Доставка', title: 'Ваш заказ передан курьеру', text: 'Курьер Артём уже в пути. Прибытие через 4 мин.', color: '#f5b324'};
const NOTE2: Note = {at: W('доставлен', 12), app: 'Доставка', title: 'Заказ доставлен', text: 'Оставлен в спальне.', color: '#f5b324'};
const NOTE3: Note = {at: W('оцените', 15), app: 'Доставка', title: 'Оцените курьера', text: 'Артём останется до утра.', color: C.red, stars: true};

const SUPPORT: Msg[] = [
  {at: -1, day: 'Сегодня', name: 'Поддержка', color: '#f5b324', avatar: '🛍', text: 'Здравствуйте! Чем можем помочь?', time: '02:58'},
  {at: W('отмените', 4), out: true, text: 'Отмените заказ. Я ничего не заказывал.', time: '03:01'},
  {at: L(5).start + 0.15, name: 'Поддержка', color: '#f5b324', avatar: '🛍', text: 'Невозможно. Курьер знает дорогу.', time: '03:01'},
];
const COURIER: Msg[] = [
  {at: -1, day: 'Сегодня', name: 'Курьер Артём', color: '#9aa7bd', avatar: 'А', text: 'Заказ у меня. Выезжаю.', time: '02:59'},
  {at: L(9).start, name: 'Курьер Артём', color: '#9aa7bd', avatar: 'А', text: 'Я у двери. Откройте.', time: '03:04'},
];

const Cut: React.FC<{t: number; from: number; to: number; children: React.ReactNode}> = ({t, from, to, children}) =>
  t >= from && t < to ? <AbsoluteFill style={{opacity: easeOut((t - from) / 0.12)}}>{children}</AbsoluteFill> : null;

export const Kurier: React.FC<{audio?: boolean; safe?: boolean}> = ({audio = false, safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const dist = t < L(7).start - 0.05 ? '200 М' : t < L(8).start - 0.05 ? '50 М' : '0 М';
  const mapP = t < cut(6) ? 0.05 + 0.3 * ramp(t, cut(3), cut(4)) : 0.72 + 0.2 * ramp(t, L(6).start, L(7).start, easeInOut) + 0.08 * ramp(t, L(7).start, L(8).start + 0.3, easeInOut);
  const shadow = ramp(t, W('шуршит', 14) - 0.1, W('шуршит', 14) + 0.9);
  const decide = Math.max(0, 59 - Math.floor((t - L(16).start) * 3));
  return (
    <AbsoluteFill style={{background: C.night}}>
      {audio && <Audio src={staticFile('kurier/mix.wav')} />}

      {/* 1. 03:00, notification */}
      <Cut t={t} from={0} to={cut(2)}>
        <Push t={t} t0={0} k={0.04}><LockScreen f={f} fps={fps} time="03:00" date="четверг, 30 октября" notes={[NOTE1]} /></Push>
        <DayChip text="НОЧЬ 1 — 03:00" />
      </Cut>

      {/* 2. you never ordered anything */}
      <Cut t={t} from={cut(2)} to={cut(3)}>
        <Push t={t} t0={cut(2)} k={0.04}><OrdersEmpty t={t} /></Push>
        <Stamp f={f} fps={fps} at={W('ничего', 2)} x={SAFE.cx} y={1000} text="ЗАКАЗОВ: 0" kind="red" rot={-6} size={64} />
      </Cut>

      {/* 3. the dot is already moving */}
      <Cut t={t} from={cut(3)} to={cut(4)}>
        <Push t={t} t0={cut(3)} k={0.05}><CourierMap t={t} p={mapP} /></Push>
        <DataChip f={f} fps={fps} at={L(3).start + 0.3} x={SAFE.left + 10} y={SAFE.top + 90} label="КУРЬЕР · В ПУТИ" value="2,4 КМ" tone="gold" />
        <DayChip text="НОЧЬ 1 — 03:01" />
      </Cut>

      {/* 4. support: "cannot cancel" + red thread to the map */}
      <Cut t={t} from={cut(4)} to={cut(6)}>
        <Push t={t} t0={cut(4)} k={0.04}>
          <Phone f={f} fps={fps} t0={cut(4)} title="Поддержка" sub="онлайн" clock="03:01" msgs={SUPPORT} icon="🛍" iconBg="#f5b324" />
        </Push>
        <Paper f={f} fps={fps} at={W('дорогу', 5) - 0.2} x={640} y={700} w={290} h={300} rot={6} tape color="#fbfaf6">
          <svg viewBox="0 0 250 220" style={{position: 'absolute', left: 20, top: 20, width: 250, height: 220}}>
            <rect width={250} height={220} fill="#2c3d2c" /><path d="M 20 200 L 80 150 L 120 100 L 190 60" stroke="#f5d27a" strokeWidth={6} fill="none" strokeDasharray="12 8" />
            <rect x={175} y={45} width={30} height={30} rx={6} fill="#f5d27a" /><circle cx={80} cy={150} r={10} fill={C.red} />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 244, textAlign: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 40, color: '#7a1f1f'}}>знает дорогу?</div>
        </Paper>
        <Thread a={[470, 1050]} b={[760, 760]} p={ramp(t, W('дорогу', 5), W('дорогу', 5) + 0.5)} sag={60} />
      </Cut>

      {/* 5. 200 m, 50 m, zero */}
      <Cut t={t} from={cut(6)} to={cut(9)}>
        <CourierMap t={t} p={mapP} zoom={1 + 0.7 * ramp(t, L(6).start, L(8).start + 0.4, easeInOut)} danger={t > L(8).start ? 1 : 0} />
        <DataChip f={f} fps={fps} at={L(6).start} x={SAFE.left + 10} y={SAFE.top + 90} label="ДИСТАНЦИЯ" value={dist} tone={dist === '0 М' ? 'red' : 'gold'} />
        <DayChip text="НОЧЬ 1 — 03:04" />
      </Cut>

      {/* 6. "I'm at the door" */}
      <Cut t={t} from={cut(9)} to={cut(10)}>
        <Push t={t} t0={cut(9)} k={0.05}>
          <Phone f={f} fps={fps} t0={cut(9) - 1} title="Курьер Артём" sub="на месте" clock="03:04" msgs={COURIER} icon="🛵" iconBg="#3a3f4a" glow={C.red} />
        </Push>
      </Cut>

      {/* 7. 9th floor, lift is dead, no steps */}
      <Cut t={t} from={cut(10)} to={cut(11)}>
        <Push t={t} t0={cut(10)} k={0.04}><Stairwell t={t} /></Push>
        <DataChip f={f} fps={fps} at={W('девятом', 10)} x={500} y={SAFE.top + 40} label="ЭТАЖ" value="9" />
        <DataChip f={f} fps={fps} at={W('лифт', 10)} x={500} y={SAFE.top + 180} label="ЛИФТ" value="НЕ РАБОТАЕТ" tone="red" icon="✕" />
        <DataChip f={f} fps={fps} at={W('шагов', 10)} x={500} y={SAFE.top + 320} label="ШАГИ · ПОДЪЕЗД" value="ТИШИНА" tone="gold" />
      </Cut>

      {/* 8. empty landing in the peephole */}
      <Cut t={t} from={cut(11)} to={cut(12)}>
        <Push t={t} t0={cut(11)} k={0.08}><Peephole t={t} /></Push>
      </Cut>

      {/* 9. delivered: left in the bedroom */}
      <Cut t={t} from={cut(12)} to={cut(13)}>
        <Push t={t} t0={cut(12)} k={0.04}><LockScreen f={f} fps={fps} time="03:05" date="четверг, 30 октября" notes={[NOTE1, NOTE2]} glow={t > NOTE2.at ? C.red : undefined} /></Push>
        <Stamp f={f} fps={fps} at={W('спальне', 12)} x={SAFE.cx} y={1200} text="ДОСТАВЛЕНО" kind="outline" rot={-7} size={80} />
      </Cut>

      {/* 10. you live alone; the bag rustles behind the bedroom door */}
      <Cut t={t} from={cut(13)} to={cut(15)}>
        <Push t={t} t0={cut(13)} k={0.06}><Hallway t={t} shadow={shadow} /></Push>
        <DataChip f={f} fps={fps} at={L(13).start + 0.1} x={SAFE.left + 10} y={SAFE.top + 60} label="ЖИЛЬЦОВ" value="1" />
        <DataChip f={f} fps={fps} at={L(14).start} x={560} y={SAFE.top + 60} label="ПУЛЬС" value="153" tone="red" icon="♥" />
        {t > L(14).start && <Ecg t={t} x={560} y={SAFE.top + 250} w={360} />}
      </Cut>

      {/* 11. rate the courier: he stays till morning */}
      <Cut t={t} from={cut(15)} to={cut(16)}>
        <Push t={t} t0={cut(15)} k={0.05} shake={t > NOTE3.at ? 0.3 * Math.exp(-4 * (t - NOTE3.at)) : 0}>
          <LockScreen f={f} fps={fps} time="03:06" date="четверг, 30 октября" notes={[NOTE2, NOTE3]} glow={C.red} />
        </Push>
      </Cut>

      {/* 12. choice + part 2 */}
      <Cut t={t} from={cut(16)} to={1e9}>
        <Hallway t={t} shadow={0} light={0.6} />
        <AbsoluteFill style={{background: 'rgba(6,8,12,0.55)'}} />
        <DataChip f={f} fps={fps} at={L(16).start} x={SAFE.cx - 150} y={SAFE.top + 160} label="НА РЕШЕНИЕ" value={`00:${String(decide).padStart(2, '0')}`} tone="gold" />
        <Choice f={f} fps={fps} at={L(16).start + 0.1} a="ОТКРЫТЬ СПАЛЬНЮ" b="БЕЖАТЬ В ПОДЪЕЗД" t={t} />
        {t > END && <AbsoluteFill style={{background: `rgba(5,6,9,${0.85 * easeOut((t - END) / 0.4)})`}} />}
        <NextPart f={f} fps={fps} at={END + 0.1} part={2} />
      </Cut>

      <Grain f={f} k={0.07} />
      {t < END && <CaseSubs lines={voice.lines} f={f} fps={fps} total={voice.total} tone={(i) => TONE[i] ?? 'white'} />}
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};

