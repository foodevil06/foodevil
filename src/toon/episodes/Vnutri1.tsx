// «Курьер уже внутри», часть 1 «Заказ из будущего» (~96 s, 9:16, psychological horror). At 23:47 an order you never
// made is on its way: your name, your address, paid, no sender, the courier in 2 minutes. Three knocks, an empty
// landing, a black thermal bag dated tomorrow. Inside, an old phone plays a video of you shot from behind your back,
// and then shows what has not happened yet: you get up and open the front door. Freeze, silence. "Спасибо, что
// воспользовались доставкой", the courier is you, "Следующий заказ уже внутри" — knocks from inside the wardrobe.
// No intro, no screamer; cold greys, red only on notifications, the timer and the key details.
// Every beat comes from vnutri1.voice.json (Nikolay, ElevenLabs via Lumean, aligned by Whisper).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './vnutri1.voice.json';
import {CaseSubs, Push, SafeZones, SAFE} from '../case/Kit';
import {Grain, DataChip} from '../case/Hybrid';
import {Peephole} from '../case/Kurier';
import {V, Phone, Notif, LockContent, Table, OrderContent, Room, Corridor, Landing, TopBag, BagLabel, VideoContent, EndCard} from '../case/Vnutri';
import {clamp, easeInOut, easeOut, lerp, ramp} from '../lib/anim';

export const VN1_FPS = 30;
const L = (i: number) => voice.lines[i];
const W = (w: string, from = 0) => voice.lines.slice(from).flatMap((l) => l.words)
  .find((x) => x.w.toLowerCase().replace(/[«»"]/g, '').startsWith(w))!.t;
const cut = (i: number) => L(i).start - 0.1;

// sound-led moments (the same offsets are used in vnutri1.cues.json)
const KNOCKS = [0.25, 0.62, 0.99].map((d) => L(14).end + d);  // three short knocks on the front door
const FREEZE = L(39).end + 0.05;                                // the video stops, the sound is cut
const WK0 = L(48).end + 0.25;                                   // wardrobe sample start, knocks inside it at +0.38/+0.72/+1.07
const WARD = [0.38, 0.72, 1.07].map((d) => WK0 + d);
const BLACK = WARD[1] + 0.12;                                   // black before the last knock
export const VN1_SEC = Math.ceil(Math.max(voice.total, BLACK + 3.2) * 10) / 10;

const TONE: Record<number, 'white' | 'yellow' | 'red'> = {3: 'red', 13: 'red', 22: 'red', 30: 'red', 44: 'red', 45: 'red', 48: 'red'};

const Cut: React.FC<{t: number; from: number; to: number; children: React.ReactNode}> = ({t, from, to, children}) =>
  t >= from && t < to ? <AbsoluteFill style={{opacity: from <= 0 ? 1 : easeOut((t - from) / 0.12)}}>{children}</AbsoluteFill> : null;  // frame 0 is the cover: no fade-in

const pulse = (t: number, at: number, k = 6) => (t >= at ? Math.exp(-k * (t - at)) : 0);
const buzz = (t: number, at: number, d = 0.7) => (t >= at && t < at + d ? Math.sin((t - at) * 95) * (1 - (t - at) / d) : 0);
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
// impossible video: the timestamp runs with the clip, and jumps ahead once it starts showing the future
const stampAt = (t: number) => {
  const s = 23 * 3600 + 51 * 60 + 10 + Math.max(0, t - cut(27)) + (t >= W('показывает', 36) ? 117 : 0);
  return `30.10 ${String(Math.floor(s / 3600) % 24).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

// the order timer: 02:00 counting down from "минуты", snaps to 00:00 on "Курьер прибыл"
const TIMER0 = W('минуты', 8);
const ARRIVED = L(13).start - 0.05;
const timerText = (t: number) => (t >= ARRIVED ? '00:00' : mmss(Math.max(0, 120 - Math.max(0, t - TIMER0)) + 0.999));

export const Vnutri1: React.FC<{audio?: boolean; safe?: boolean}> = ({audio = false, safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;

  // scene 2 -> zoom out from the phone to the dark apartment
  const zo = ramp(t, W('двери', 8) + 0.1, cut(9), easeInOut);
  // scene 3: knocks jolt the picture
  const jolt = KNOCKS.reduce((a, k) => a + pulse(t, k, 7), 0) + WARD.reduce((a, k) => a + 0.8 * pulse(t, k, 7), 0) + 0.35 * pulse(t, W('стук', 46) + 0.45, 7);
  // scenes 5-6: what the video shows (frozen at FREEZE)
  const tv = Math.min(t, FREEZE);
  const walk = ramp(tv, L(38).start, L(38).end + 0.3, easeInOut);
  const hero = {
    turn: ramp(tv, W('поворачиваешь', 34) - 0.3, W('голову', 34) + 0.5) * (1 - walk),
    stand: ramp(tv, L(37).start, L(37).end + 0.2),
    walk,
    reach: ramp(tv, W('открываешь', 39) - 0.2, W('её', 39) + 0.1),
  };
  const frozen = t >= FREEZE;
  const glitch = pulse(t, W('показывает', 36), 5);
  const noise = frozen ? 0.05 : Math.max(0.12, pulse(t, W('загорается', 26) - 0.1, 2.5)) + 0.6 * glitch;
  // the old phone in hand: still, then trembling as the video runs ahead
  const tremble = frozen ? 0 : 0.04 + 0.16 * ramp(t, L(36).start, FREEZE);
  const throwK = ramp(t, W('отбрасываешь', 40) - 0.05, W('отбрасываешь', 40) + 0.4, (x) => x * x);
  // the first phone wakes up again
  const wake = ramp(t, L(41).start, L(41).start + 0.4);
  const named = t >= W('твоё', 44) - 0.05;

  return (
    <AbsoluteFill style={{background: V.black}}>
      {audio && <Audio src={staticFile('vnutri1/mix.wav')} />}

      {/* 1. 23:47, the phone on the table vibrates: "Ваш заказ передан курьеру" */}
      <Cut t={t} from={0} to={cut(4)}>
        <Table t={t} />
        <Push t={t} t0={0} k={0.12}>
          <Phone x={SAFE.cx} y={840} w={430} rot={-4 + 1.4 * (buzz(t, 0, 0.8) + buzz(t, W('вибрирует', 0)))}>
            <LockContent s={430 / 400} time="23:47" date="пятница, 30 октября" flicker={0.8 * pulse(t, W('ничего', 3), 4)}
              notes={<Notif k={easeOut((t - L(1).start + 0.05) / 0.3)} title="Ваш заказ передан курьеру" text="Заказ № 2347-1103" scale={430 / 400} />} />
          </Phone>
        </Push>
      </Cut>

      {/* 2. the order: your name, your address, paid, no sender; "через 2 минуты"; zoom out to the dark flat */}
      <Cut t={t} from={cut(4)} to={cut(9)}>
        {zo > 0 && <AbsoluteFill style={{background: V.floor, transform: `scale(${lerp(2.6, 1, zo)})`, transformOrigin: '510px 890px', opacity: clamp(zo * 3)}}>
          <AbsoluteFill style={{transform: 'translateY(-240px)'}}><Room t={t} hero={{}} phoneGlow={1} lamp={0.5} /></AbsoluteFill>
        </AbsoluteFill>}
        <AbsoluteFill style={{transform: `scale(${lerp(1, 0.12, zo)})`, transformOrigin: '510px 890px', opacity: 1 - clamp((zo - 0.35) * 3)}}>
          <Push t={t} t0={cut(4)} k={0.06}>
            <Phone x={SAFE.cx} y={790} w={500}>
              <OrderContent s={500 / 400} t={t} hi={[W('имя', 4) - 0.1, W('адрес', 5) - 0.05, W('оплата', 6) - 0.05, W('отправитель', 7) + 0.1]}
                timerAt={TIMER0} msgAt={L(8).start - 0.05} flash={pulse(t, TIMER0, 3)} />
            </Phone>
          </Push>
        </AbsoluteFill>
        {zo > 0.6 && <DataChip f={f} fps={fps} at={W('двери', 8) + 0.9} x={SAFE.left + 10} y={SAFE.top + 40} label="ДО ПРИБЫТИЯ" value={timerText(t)} tone="red" />}
      </Cut>

      {/* 3. POV to the front door: silence, "Курьер прибыл", three knocks */}
      <Cut t={t} from={cut(9)} to={cut(15)}>
        <Corridor t={t} walk={ramp(t, cut(9), L(10).end + 0.2)} jolt={jolt} />
        <Phone x={770} y={lerp(2400, 1080, ramp(t, L(12).start - 0.3, L(12).start + 0.3, easeOut))} w={250} rot={-6 + 1.5 * buzz(t, W('вибрирует', 12))}>
          <LockContent s={250 / 400} time="23:49" date="пятница, 30 октября"
            notes={<Notif k={easeOut((t - ARRIVED) / 0.25)} title="Курьер прибыл" red scale={250 / 400} />} />
        </Phone>
        <DataChip f={f} fps={fps} at={cut(9) - 0.5} x={SAFE.left + 10} y={SAFE.top + 40} label={t >= ARRIVED ? 'КУРЬЕР ПРИБЫЛ' : 'ДО ПРИБЫТИЯ'} value={timerText(t)} tone="red" />
      </Cut>

      {/* 4. the peephole: an empty corridor */}
      <Cut t={t} from={cut(15)} to={cut(18)}>
        <Push t={t} t0={cut(15)} k={0.1}><AbsoluteFill style={{filter: 'grayscale(0.85) brightness(0.85)'}}><Peephole t={t} /></AbsoluteFill></Push>
      </Cut>

      {/* the door opens: nobody; the view goes down to the small black bag */}
      <Cut t={t} from={cut(18)} to={cut(20)}>
        <Landing t={t} open={ramp(t, W('открываешь', 18), W('открываешь', 18) + 1.1)} tilt={ramp(t, L(19).start, L(19).start + 1.5)} lift={0} />
      </Cut>

      {/* the label: your name, and tomorrow's date */}
      <Cut t={t} from={cut(20)} to={cut(23)}>
        <Push t={t} t0={cut(20)} k={0.08 + 0.1 * ramp(t, L(22).start, L(22).end)}><BagLabel t={t} nameAt={W('имя', 20) - 0.1} dateAt={W('дата', 21)} /></Push>
        <DataChip f={f} fps={fps} at={L(22).start} x={SAFE.left + 10} y={SAFE.top + 40} label="СЕГОДНЯ" value="30.10" />
      </Cut>

      {/* 5. on the table: unzip, an old phone, switched off, no SIM */}
      <Cut t={t} from={cut(23)} to={cut(26)}>
        <Table t={t} lampOn={0.6} />
        <Push t={t} t0={cut(24)} k={0.1}>
          <TopBag t={t} drop={ramp(t, cut(23), cut(23) + 0.45)} open={ramp(t, W('вскрываешь', 23), W('вскрываешь', 23) + 0.5)} out={ramp(t, L(24).start - 0.1, L(24).start + 0.9)} />
        </Push>
        <DataChip f={f} fps={fps} at={W('сим', 25)} x={SAFE.left + 10} y={SAFE.top + 40} label="СИМ-КАРТА" value="НЕТ" />
      </Cut>

      {/* the screen lights up: a video of your flat, you at the table, filmed from behind your back */}
      <Cut t={t} from={cut(26)} to={cut(31)}>
        <Table t={t} lampOn={0.6} />
        <Push t={t} t0={cut(27)} k={0.1} shake={0.04}>
          <Phone x={SAFE.cx} y={800} w={520} old on={t >= W('загорается', 26) - 0.1 ? 1 : 0}>
            <VideoContent t={t} s={0.436} hero={{}} noise={noise} stamp={stampAt(t)} />
          </Phone>
        </Push>
      </Cut>

      {/* 6. you turn around: nobody behind */}
      <Cut t={t} from={cut(31)} to={cut(33)}>
        <AbsoluteFill style={{transform: `translateX(${(1 - easeOut((t - cut(31)) / 0.3)) * 600}px)`, filter: `blur(${(1 - clamp((t - cut(31)) / 0.3)) * 14}px)`}}>
          <Push t={t} t0={cut(31)} k={0.06}><Room t={t} behind phoneGlow={0.5} lamp={0.6} /></Push>
        </AbsoluteFill>
      </Cut>

      {/* back to the screen: the video turns its head, gets up, goes to the door and opens it — freeze */}
      <Cut t={t} from={cut(33)} to={cut(40)}>
        <Table t={t} lampOn={0.6} />
        <AbsoluteFill style={{transform: `translateX(${(1 - easeOut((t - cut(33)) / 0.3)) * -600}px)`, filter: `blur(${(1 - clamp((t - cut(33)) / 0.3)) * 14}px)`}}>
          <Push t={t} t0={cut(33)} k={0.12} shake={tremble}>
            <Phone x={SAFE.cx} y={800} w={520} old>
              <VideoContent t={tv} s={0.436} hero={hero} noise={noise} frozen={frozen} stamp={stampAt(tv)} />
            </Phone>
          </Push>
        </AbsoluteFill>
      </Cut>

      {/* 7. you throw it; the first phone vibrates again: thanks for the delivery, the courier is you, the next order is inside */}
      <Cut t={t} from={cut(40)} to={cut(46)}>
        <Table t={t} lampOn={0.6} />
        <Push t={t} t0={L(41).start} k={0.14}>
          <Phone x={SAFE.cx} y={880} w={440} rot={-3 + 1.4 * buzz(t, W('вибрирует', 41))} on={0.15 + 0.85 * wake} glow={wake > 0}>
            <LockContent s={440 / 400} time="23:52" date="пятница, 30 октября"
              notes={<>
                <Notif k={easeOut((t - L(42).start + 0.05) / 0.3)} title="Спасибо, что воспользовались доставкой" text="Заказ доставлен" scale={440 / 400} />
                <Notif k={easeOut((t - L(43).start + 0.05) / 0.3)} title="Ваш курьер" text={named ? 'ТЫ' : '···'} red={named} hot={named} icon="user" scale={440 / 400} />
                <Notif k={easeOut((t - L(45).start + 0.05) / 0.3)} title="Следующий заказ уже внутри" red scale={440 / 400} />
              </>} />
          </Phone>
        </Push>
        {throwK < 1 && <AbsoluteFill style={{filter: `blur(${throwK * 10}px)`}}>
          <Phone x={lerp(SAFE.cx, 1500, throwK)} y={lerp(800, 1900, throwK)} w={520} rot={160 * throwK} old>
            <VideoContent t={FREEZE} s={0.436} hero={hero} frozen stamp={stampAt(FREEZE)} />
          </Phone>
        </AbsoluteFill>}
      </Cut>

      {/* the corridor: a quiet knock; this time from inside the wardrobe */}
      <Cut t={t} from={cut(46)} to={BLACK}>
        <Push t={t} t0={cut(46)} k={0.05}>
          <Corridor t={t} walk={0} jolt={jolt} wardrobe={ramp(t, L(47).start - 0.1, L(48).start + 0.4, easeInOut)} shake={WARD.reduce((a, k) => a + pulse(t, k, 5), 0) + 0.3 * ramp(t, L(48).start, WK0)}
            ajar={0.5 * ramp(t, WARD[0], WARD[1] + 0.1)} />
        </Push>
      </Cut>
      <Cut t={t} from={BLACK} to={1e9}><EndCard k={easeOut((t - BLACK - 0.45) / 0.5)} /></Cut>

      <Grain f={f} k={0.06} />
      {t < BLACK && <CaseSubs lines={voice.lines} f={f} fps={fps} total={voice.total} tone={(i) => TONE[i] ?? 'white'} />}
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
