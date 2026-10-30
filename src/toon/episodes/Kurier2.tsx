// «Курьер», часть 2 (~43 s, 9:16, "Красная нить" look). Cold open "А ты куда побежал?": you run down the stairwell
// (3D well, CC0 props), the courier stays 2 m away, your own bag waits at the mailboxes with an order from 03:07
// while it is 03:06, a polaroid of your bedroom from inside ("НАЙДИ УЛИКУ": the figure in the mirror), three knocks
// on the entrance door from outside, "заказ ещё не доставлен" — then who left the bag in the bedroom? Evidence board,
// comment prompt, "Часть 3". Every beat comes from kurier2.voice.json (ElevenLabs voice aligned by Whisper).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import voice from './kurier2.voice.json';
import {CaseSubs, Desk, Push, SafeZones, Stamp, SAFE, C, MONO, MONT} from '../case/Kit';
import {Phone, Msg} from '../case/Phone';
import {Grain, DayChip, DataChip, NextPart} from '../case/Hybrid';
import {LockScreen, Note} from '../case/Kurier';
import {SeriesTag, FloorDial, KnockMarks, Radar, Mailboxes, BagClose, Receipt, Polaroid, Lens, EntranceDoor, EvidenceBoard, Card, CommentBubble, K} from '../case/KurierSeries';
import {Stairwell3D, FLOOR_H} from '../three/Stairwell3D';
import {clamp, easeInOut, easeOut, lerp, ramp, wobble} from '../lib/anim';

export const K2_FPS = 30;
export const K2_SEC = Math.ceil((voice.total + 1.6) * 10) / 10;
const L = (i: number) => voice.lines[i];
const W = (w: string, from = 0) => voice.lines.slice(from).flatMap((l) => l.words)
  .find((x) => x.w.toLowerCase().replace(/[«»"]/g, '').startsWith(w))!.t;
const cut = (i: number) => L(i).start - 0.1;
const END = L(15).end + 0.25;
const TONE: ('white' | 'yellow' | 'red')[] = ['red', 'white', 'yellow', 'yellow', 'red', 'white', 'yellow', 'yellow', 'red', 'white', 'yellow', 'red', 'white', 'red', 'red', 'yellow'];
const TUK = voice.lines[11].words.map((w) => w.t);

const COURIER: Msg[] = [
  {at: -1, day: 'Сегодня', name: 'Курьер Артём', color: '#9aa7bd', avatar: 'А', text: 'Я у двери. Откройте.', time: '03:04'},
  {at: 0.05, name: 'Курьер Артём', color: C.red, avatar: 'А', text: 'А ты куда побежал?', time: '03:05'},
];
const OLD: Note = {at: -1, app: 'Доставка', title: 'Заказ доставлен', text: 'Оставлен в спальне.', color: '#f5b324'};
const NEW: Note = {at: W('уведомление', 13) + 0.15, app: 'Доставка', title: 'Курьер у подъезда', text: 'Заказ ещё не доставлен.', color: C.red};

// floor shown on the dial: [time, floor]
const FLOORS: [number, number][] = [[0, 9], [W('8-й', 2), 8], [W('7-й', 2), 7], [cut(4) + 0.1, 6], [cut(4) + 0.6, 5], [cut(4) + 1.1, 4], [cut(4) + 1.6, 3], [cut(4) + 2.1, 2], [L(5).start, 1]];
const floorAt = (t: number) => FLOORS.filter(([a]) => t >= a).pop()!;
// camera height in floors (piecewise linear between knots, eased inside each span)
const pw = (t: number, k: [number, number][]) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], easeInOut((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])) * 0.6 + 0.4 * (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
  return k[k.length - 1][1];
};
const RUN1: [number, number][] = [[cut(1), 9.75], [W('9-й', 2), 9.05], [W('8-й', 2), 8.05], [W('7-й', 2), 7.05], [cut(3), 6.5]];
const RUN2: [number, number][] = [[cut(4), 6.3], [cut(4) + 0.6, 5.05], [cut(4) + 1.1, 4.05], [cut(4) + 1.6, 3.05], [cut(4) + 2.1, 2.05], [cut(5), 1.4]];

const Cut: React.FC<{t: number; from: number; to: number; children: React.ReactNode}> = ({t, from, to, children}) =>
  t >= from && t < to ? <AbsoluteFill style={{opacity: from <= 0 ? 1 : easeOut((t - from) / 0.12)}}>{children}</AbsoluteFill> : null;  // frame 0 is the cover: no fade-in

// 3D stairwell shot + 2D glow, speed lines and HUD on top
const Stairs: React.FC<{t: number; f: number; fps: number; knots: [number, number][]; alarm: number; t0: number}> = ({t, f, fps, knots, alarm, t0}) => {
  const fl = pw(t, knots);
  const yaw = 0.55 * (t - t0) + (knots === RUN2 ? 2.2 : 0);
  const speed = Math.abs(pw(t + 0.05, knots) - fl) * 20;
  const lit = (n: number) => (n === 6 || n === 4 ? 0 : n === 8 ? (Math.sin(t * 23) > 0.6 ? 0.25 : 1) : 1);
  return (
    <AbsoluteFill>
      <ThreeCanvas flat width={1080} height={1920} gl={{antialias: true, preserveDrawingBuffer: true}} camera={{fov: 72, position: [0, 30, 0]}}>
        <Stairwell3D cam={{y: fl * FLOOR_H + 1.5, yaw, bob: Math.sin(t * 11)}} lit={lit} alarm={alarm} camLed={Math.sin(t * 5) > 0 ? 1 : 0} />
      </ThreeCanvas>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(255,40,30,${0.12 + 0.35 * alarm}) 0%, rgba(255,40,30,0) 22%)`, mixBlendMode: 'screen'}} />
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: clamp(speed * 0.25) * 0.5}}>
        {Array.from({length: 26}, (_, i) => {
          const a = i * 2.4 + 0.3, r0 = 380 + ((i * 97 + f * 41) % 300), r1 = r0 + 260;
          return <line key={i} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={960 + Math.sin(a) * r1} stroke="#d8f5e6" strokeWidth={3} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const Kurier2: React.FC<{audio?: boolean; safe?: boolean}> = ({audio = false, safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const [flAt, fl] = floorAt(t);
  // the polaroid hunt: focus points in screen space of the 820 px polaroid (photo 600 units -> 721.6 px from 139,349)
  const ph = (u: number, v: number): [number, number] => [139.2 + u * 1.2027, 349.2 + v * 1.2027];
  const hunt: [number, number, [number, number]][] = [[cut(10), 1, [500, 820]], [cut(10) + 0.5, 2.3, ph(85, 372)], [cut(10) + 1.1, 2.1, ph(330, 380)],
    [cut(10) + 1.55, 2.5, ph(540, 300)], [cut(10) + 3.05, 2.5, ph(546, 300)], [cut(11), 1.2, [500, 820]]];
  const hi = Math.max(0, hunt.findIndex((h) => h[0] > t) - 1);
  const h0 = hunt[hi], h1 = hunt[Math.min(hunt.length - 1, hi + 1)];
  const hk = easeInOut(clamp((t - h0[0]) / Math.max(0.01, Math.min(0.45, h1[0] - h0[0]))));
  const zs = lerp(h0[1], h1[1], hk), zx = lerp(h0[2][0], h1[2][0], hk), zy = lerp(h0[2][1], h1[2][1], hk);
  const decide = Math.max(0, 3 - Math.floor(t - L(10).start));

  return (
    <AbsoluteFill style={{background: C.night}}>
      {audio && <Audio src={staticFile('kurier2/mix.wav')} />}

      {/* 1. cold open: the courier sees you running */}
      <Cut t={t} from={0} to={cut(1)}>
        <Push t={t} t0={0} k={0.06} shake={0.35 * Math.exp(-5 * t)}>
          <Phone f={f} fps={fps} t0={-1} title="Курьер Артём" sub="в сети" clock="03:05" msgs={COURIER} icon="А" iconBg="#3a3f4a" glow={C.red} />
        </Push>
        <SeriesTag part={2} t={t} y={1322} />
      </Cut>

      {/* 2. 3D: down the well, 9 → 8 → 7 */}
      <Cut t={t} from={cut(1)} to={cut(3)}>
        <Stairs t={t} f={f} fps={fps} knots={RUN1} alarm={0} t0={cut(1)} />
        <FloorDial f={f} fps={fps} at={cut(1) + 0.1} floor={fl} changedAt={flAt} x={SAFE.left + 10} y={SAFE.top + 40} />
        <DayChip text="03:05" />
      </Cut>

      {/* 3. the app: "до курьера 2 м" */}
      <Cut t={t} from={cut(3)} to={cut(4)}>
        <Push t={t} t0={cut(3)} k={0.05}><Radar t={t} dist="2 М" floor={7} alarm={ramp(t, W('2', 3), W('2', 3) + 0.2)} /></Push>
      </Cut>

      {/* 4. 3D again, faster and red: floors fly by, the number does not change */}
      <Cut t={t} from={cut(4)} to={cut(5)}>
        <Stairs t={t} f={f} fps={fps} knots={RUN2} alarm={ramp(t, cut(4), cut(5))} t0={cut(4)} />
        <FloorDial f={f} fps={fps} at={cut(4)} floor={fl} changedAt={flAt} x={SAFE.left + 10} y={SAFE.top + 40} tone="red" />
        <DataChip f={f} fps={fps} at={W('цифра', 4) - 0.1} x={SAFE.left + 10} y={SAFE.top + 260} label="ДО КУРЬЕРА" value="2 М" tone="red" icon="●" />
      </Cut>

      {/* 5. 1st floor: mailboxes, the bag */}
      <Cut t={t} from={cut(5)} to={cut(6)}>
        <Mailboxes t={t} push={0.06 * ramp(t, cut(5), cut(6))} bag={ramp(t, W('пакет', 5) - 0.3, W('пакет', 5) + 0.1)} />
        <FloorDial f={f} fps={fps} at={cut(5)} floor={1} changedAt={L(5).start} x={SAFE.left + 10} y={SAFE.top + 40} />
      </Cut>

      {/* 6. your bag */}
      <Cut t={t} from={cut(6)} to={cut(7)}>
        <Push t={t} t0={cut(6)} k={0.12}><BagClose t={t} /></Push>
      </Cut>

      {/* 7. receipt: your number, order at 03:07 */}
      <Cut t={t} from={cut(7)} to={cut(8)}>
        <Push t={t} t0={cut(7)} k={0.05}><Receipt f={f} fps={fps} at={cut(7)} markAt={W('номер', 7)} ringAt={W('три', 7)} /></Push>
      </Cut>

      {/* 8. now it is 03:06 */}
      <Cut t={t} from={cut(8)} to={cut(9)}>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 42%, #1b2333 0%, #0b0f17 70%)'}} />
        <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 560, textAlign: 'center', fontFamily: MONO, fontSize: 230, color: '#fff',
          letterSpacing: 6, textShadow: '0 0 50px rgba(255,255,255,0.25)', transform: `scale(${1.08 - 0.08 * easeOut((t - cut(8)) / 0.4)})`}}>
          03<span style={{opacity: Math.floor(t * 2) % 2 ? 0.25 : 1}}>:</span>06</div>
        <DataChip f={f} fps={fps} at={cut(8) + 0.1} x={SAFE.left + 30} y={900} label="СЕЙЧАС" value="03:06" />
        <DataChip f={f} fps={fps} at={W('шесть', 8) - 0.2} x={SAFE.cx + 50} y={900} label="ЗАКАЗ" value="03:07" tone="red" />
        <Stamp f={f} fps={fps} at={W('шесть', 8) + 0.15} x={SAFE.cx} y={1180} text="ИЗ БУДУЩЕГО" kind="outline" rot={-7} size={74} />
      </Cut>

      {/* 9. polaroid from the bag: your bedroom, from inside (it develops) */}
      <Cut t={t} from={cut(9)} to={cut(10)}>
        <Desk t={t} />
        <Push t={t} t0={cut(9)} k={0.06}>
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - easeOut((t - cut(9)) / 0.5)) * 700}px) rotate(${-4 + 3 * easeOut((t - cut(9)) / 0.6)}deg)`}}>
            <Polaroid t={t} x={90} y={300} w={820} dev={ramp(t, cut(9) + 0.3, W('спальня', 9) + 0.2)} />
          </div>
        </Push>
        <Stamp f={f} fps={fps} at={W('изнутри', 9)} x={SAFE.cx} y={1290} text="ИЗНУТРИ" kind="red" rot={-5} size={70} />
      </Cut>

      {/* 10. НАЙДИ УЛИКУ: the camera hunts over the photo; it lingers 1.5 s on the mirror, no hint in the voice */}
      <Cut t={t} from={cut(10)} to={cut(11)}>
        <Desk t={t} />
        <div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${500 - zx * zs}px, ${820 - zy * zs}px) scale(${zs})`}}>
          <Polaroid t={t} x={90} y={300} w={820} />
        </div>
        {/* the lens only ever frames the decoys (clock, bag): it leaves before the camera drifts to the mirror */}
        <Lens x={500} y={820} r={150} o={clamp((t - cut(10) - 0.4) / 0.2) * (1 - clamp((t - cut(10) - 1.35) / 0.2))} />
        <Stamp f={f} fps={fps} at={L(10).start} x={SAFE.cx} y={SAFE.top + 90} text="НАЙДИ УЛИКУ" kind="red" rot={-4} size={66} />
        <DataChip f={f} fps={fps} at={L(10).start + 0.2} x={SAFE.cx - 120} y={SAFE.top + 190} label="НА ПОИСК" value={`00:0${decide}`} tone="gold" icon="⌕" />
      </Cut>

      {/* 11. three knocks on the entrance door, from outside; feet in the light under the door; the handle moves */}
      <Cut t={t} from={cut(11)} to={cut(13)}>
        <EntranceDoor t={t} knocks={TUK} feet={ramp(t, L(12).start, L(12).start + 0.5)} handle={ramp(t, W('снаружи', 12), W('снаружи', 12) + 0.2) * (1 - ramp(t, L(12).end + 0.2, L(12).end + 0.4))}
          zoom={0.45 * ramp(t, L(12).start - 0.1, L(12).start + 1.2, easeInOut)} />
        <KnockMarks n={3} x={SAFE.cx - 70} y={SAFE.top + 110} size={1.5} at={TUK} t={t} />
        <DayChip text="03:06" o={clamp((t - L(12).start) / 0.3)} />
      </Cut>

      {/* 12. "Курьер у подъезда. Заказ ещё не доставлен" over the old "Оставлен в спальне" */}
      <Cut t={t} from={cut(13)} to={cut(14)}>
        <Push t={t} t0={cut(13)} k={0.05} shake={t > NEW.at ? 0.3 * Math.exp(-4 * (t - NEW.at)) : 0}>
          <LockScreen f={f} fps={fps} time="03:06" date="четверг, 30 октября" notes={[OLD, NEW]} glow={t > NEW.at ? C.red : undefined} />
        </Push>
        <Stamp f={f} fps={fps} at={W('доставлен', 13)} x={SAFE.cx} y={1250} text="НЕ ДОСТАВЛЕН" kind="outline" rot={-6} size={78} />
      </Cut>

      {/* 13. the case board: who left the bag in the bedroom? */}
      <Cut t={t} from={cut(14)} to={1e9}>
        <Push t={t} t0={cut(14)} k={0.04}>
          <EvidenceBoard f={f} fps={fps} title="ДЕЛО: КУРЬЕР" threads={[['pol', 'q', W('кто', 14) + 0.2], ['rec', 'q', W('кто', 14) + 0.35], ['bed', 'q', W('кто', 14) + 0.5], ['door', 'q', W('кто', 14) + 0.65]]}
            pins={[
              {id: 'pol', x: 300, y: 560, at: cut(14), rot: -6, pinDy: -150, node: <div style={{position: 'relative', width: 300, height: 360}}><Polaroid t={t} x={0} y={0} w={300} /></div>},
              {id: 'rec', x: 730, y: 520, at: cut(14) + 0.12, rot: 5, pinDy: -40, node: <Card w={300}>ЗАКАЗ <b style={{color: C.red}}>03:07</b><br />СЕЙЧАС 03:06</Card>},
              {id: 'bed', x: 270, y: 1110, at: cut(14) + 0.24, rot: 4, pinDy: -40, node: <Card w={320}>ДОСТАВЛЕН:<br /><b>В СПАЛЬНЕ</b></Card>},
              {id: 'door', x: 740, y: 1100, at: cut(14) + 0.36, rot: -4, pinDy: -40, node: <Card w={320}>КУРЬЕР<br /><b>У ПОДЪЕЗДА</b></Card>},
              {id: 'q', x: 500, y: 850, at: W('кто', 14), rot: -3, pinDy: -62, node: <Card w={400} bg={C.red} color="#fff"><span style={{fontFamily: MONT, fontWeight: 900, fontSize: 52}}>КТО В СПАЛЬНЕ?</span></Card>},
            ]} />
        </Push>
        {/* 14. ending: comment prompt, then "Часть 3" */}
        {t > cut(15) && <AbsoluteFill style={{background: `rgba(6,8,12,${0.7 * easeOut((t - cut(15)) / 0.4)})`}} />}
        <CommentBubble f={f} fps={fps} at={L(15).start + 0.1} text="Нашёл! Улика — это…" x={SAFE.left + 20} y={980} />
        {t > END && <AbsoluteFill style={{background: `rgba(5,6,9,${0.9 * easeOut((t - END) / 0.35)})`}} />}
        <NextPart f={f} fps={fps} at={END + 0.05} part={3} />
      </Cut>

      <Grain f={f} k={0.07} />
      {t < END && <CaseSubs lines={voice.lines} f={f} fps={fps} total={voice.total} tone={(i) => TONE[i] ?? 'white'} />}
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
