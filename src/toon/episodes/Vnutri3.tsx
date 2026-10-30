// «Курьер уже внутри», часть 3 «Я и есть доставка» — the finale (~2 min, 9:16). You and your double face each other
// over the phone «ДОСТАВКА ЗАВЕРШЕНА». "You were the parcel; I used your body to get inside." His face swims for a
// moment. The wardrobe from the first night: knocks, scratching, an eye in the gap. "Open it. I want to watch." You
// open it: deeper than a wardrobe can be, a child's voice — "Пап… ты вернулся?" — and your own face, old and worn.
// The double is gone; the phone: «СЛЕДУЮЩАЯ ДОСТАВКА НАЗНАЧЕНА», "Спасибо, что открыл. Теперь я могу остаться."
// Behind you stands the old one, smiling. Black. "Ты был всего лишь дверью." «КУРЬЕР УЖЕ ВНУТРИ — ФИНАЛ».
// Voices: Nikolay (narrator whisper, the double, the old one through the phone), the child from a soft female voice
// pitched up and distorted; timings from vnutri3.voice.json (scripts/cast_assemble.py). Four mini-screamers, each on
// one picture event, silence after each.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './vnutri3.voice.json';
import {CaseSubs, Push, SafeZones} from '../case/Kit';
import {Grain} from '../case/Hybrid';
import {V} from '../case/Vnutri';
import {HallStage, Behind, FloorPhone, Question} from '../case/VnutriHall';
import {TwoShot, FaceClose, WardrobeFront, HandOnHandle, Inside, FinalCard, Dust} from '../case/VnutriEnd';
import {clamp, easeInOut, easeOut, lerp, ramp, wobble} from '../lib/anim';

export const VN3_FPS = 30;
const L = (i: number) => voice.lines[i];
const W = (w: string, from = 0) => voice.lines.slice(from).flatMap((l) => l.words)
  .find((x) => x.w.toLowerCase().replace(/[«»"…]/g, '').startsWith(w))!.t;
const cut = (i: number) => L(i).start - 0.1;

// the beats (vnutri3.cues.json uses the same offsets)
const WET = W('попасть', 6) + 0.25;                         // something shifts under the skin
const WARP = L(8).end + 0.4;                                 // mini-screamer 1: his face swims
const WARD0 = L(8).end + 1.6;                                // you back away: the wardrobe
const KN = [L(10).end + 0.7, L(10).end + 1.9];              // two knocks inside, then scratching
const SNAP = L(12).end + 0.6;                                // mini-screamer 2: the door pops open, an eye
const CH0 = L(12).end + 2.4;                                 // the choice: he comes close, the light flickers
const HAND0 = L(17).end + 0.8;                               // your hand on the handle
const OPEN1 = L(18).end + 1.3;                               // inside
const FACE = L(19).end + 0.8;                                // mini-screamer 3: the old face
const BACK0 = FACE + 0.9;                                    // you back away, turn: he is gone
const PHONE0 = L(21).end - 0.2;                              // the phone on the floor
const NEXT = L(21).end + 0.4;                                // «СЛЕДУЮЩАЯ ДОСТАВКА НАЗНАЧЕНА»
const WHIP = L(23).end + 0.9;                                // mini-screamer 4: the camera whips round, the old one
const BLACK = WHIP + 0.7;
const TXT = BLACK + 0.8, FIN = BLACK + 4.0;
export const VN3_SEC = Math.ceil((L(24).end + 2.8) * 10) / 10;

const ROLE_TONE: Record<string, 'white' | 'yellow' | 'red' | 'blue'> = {N: 'white', X: 'blue', XW: 'red', C: 'yellow', O: 'red', OW: 'red'};

const Cut: React.FC<{t: number; from: number; to: number; children: React.ReactNode}> = ({t, from, to, children}) =>
  t >= from && t < to ? <AbsoluteFill style={{opacity: from <= 0 ? 1 : easeOut((t - from) / 0.12)}}>{children}</AbsoluteFill> : null;  // frame 0 is the cover: no fade-in

const pulse = (t: number, at: number, k = 6) => (t >= at ? Math.exp(-k * (t - at)) : 0);
const spike = (t: number, at: number, d: number) => (t >= at && t < at + d ? 1 : 0);
const talking = (t: number, roles: string[]) => voice.lines.some((l) => roles.includes(l.role) && t >= l.start && t < l.end) ? 0.4 + 0.6 * Math.abs(Math.sin(t * 16)) : 0;
// a faulty lamp: short dips, deterministic
const flick = (t: number) => (Math.sin(t * 7.3) + Math.sin(t * 13.1 + 1) > 1.55 ? 0.75 : Math.sin(t * 3.1) > 0.97 ? 0.4 : 0);

export const Vnutri3: React.FC<{audio?: boolean; safe?: boolean}> = ({audio = false, safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const xTalk = talking(t, ['X']);
  const near = ramp(t, CH0, L(17).start, easeInOut);          // the double comes almost face to face
  const whip = ramp(t, WHIP - 0.12, WHIP + 0.1);

  return (
    <AbsoluteFill style={{background: V.black}}>
      {audio && <Audio src={staticFile('vnutri3/mix.wav')} />}

      {/* 1. after the blow: the two of you, the phone between you, dust in the light; he smiles a little */}
      <Cut t={t} from={0} to={cut(3)}>
        <TwoShot t={t} push={ramp(t, 0, cut(3))} smirk={0.25 + 0.45 * ramp(t, W('улыбался', 2), L(2).end)} glint={0.35} />
      </Cut>

      {/* 2. the truth: his face, closer and closer, eyes that do not blink; it swims for a moment */}
      <Cut t={t} from={cut(3)} to={WARD0}>
        <Push t={t} t0={cut(3)} k={0.22}>
          <FaceClose t={t} f={f} warp={0.14 * pulse(t, WET, 3) + spike(t, WARP, 0.3) * (0.8 + 0.2 * Math.sin(t * 60))} glint={0.75}
            talk={xTalk} smirk={0.35} blur={1 + ramp(t, cut(3), WARD0)} />
        </Push>
        {t >= WARP + 0.3 && <AbsoluteFill style={{background: `rgba(0,0,0,${0.6 * ramp(t, WARP + 0.3, WARD0)})`}} />}
      </Cut>

      {/* 3. the wardrobe: knocks, scratching; he follows you; the door pops open: an eye */}
      <Cut t={t} from={WARD0} to={CH0}>
        <AbsoluteFill style={{transform: `translateX(${(1 - easeOut((t - WARD0) / 1.4)) * 500}px)`}}>
          <Push t={t} t0={WARD0} k={0.12} shake={0.8 * pulse(t, SNAP, 7)}>
            <WardrobeFront t={t} ajar={t >= SNAP ? 1 : 0.08} zoom={1 + 0.35 * ramp(t, SNAP, SNAP + 0.12)} light={0.35 + 0.2 * Math.sin(t * 1.3)} shake={KN.reduce((a, k) => a + pulse(t, k, 5), 0) + 0.25 * ramp(t, KN[1] + 0.6, KN[1] + 1.4)}
              eye={spike(t, SNAP, 0.3)} edge={ramp(t, L(11).start - 0.6, L(11).start + 0.8)} />
          </Push>
        </AbsoluteFill>
        <Dust t={t} x0={300} x1={640} k={0.5} />
      </Cut>

      {/* 4. the choice: the camera circles you, he comes almost face to face, the lamp fails */}
      <Cut t={t} from={CH0} to={HAND0}>
        <Push t={t} t0={CH0} k={0.1} shake={0.06 + 0.1 * ramp(t, L(15).start, HAND0)}>
          <HallStage t={t} orbit={lerp(1, -1, ramp(t, CH0, HAND0))} person={{phone: 'none', glow: 0.35}}
            second={{x: lerp(1250, 800, near), y: lerp(900, 760, near), s: lerp(1.6, 2.0, near), phone: 'chest', glow: 1, smirk: 0.45, glint: 0.6, talk: xTalk}} />
        </Push>
        <AbsoluteFill style={{background: `rgba(0,0,0,${flick(t)})`}} />
      </Cut>

      {/* 5. your hand on the handle; the door; inside it is deeper than a wardrobe; a child's voice; the old face */}
      <Cut t={t} from={HAND0} to={OPEN1}>
        <Push t={t} t0={HAND0} k={0.1}><HandOnHandle t={t} tremble={1} open={ramp(t, L(18).start - 0.2, L(18).end + 1.2)} /></Push>
      </Cut>
      <Cut t={t} from={OPEN1} to={BACK0}>
        <Inside t={t} depth={ramp(t, OPEN1, FACE, (x) => x)} face={t >= FACE && t < FACE + 0.55 ? 1 : 0} faceS={lerp(2.5, 3.1, ramp(t, FACE, FACE + 0.5))} />
        {t >= FACE + 0.55 && <AbsoluteFill style={{background: V.black}} />}
      </Cut>

      {/* 6. you back away and turn: he is gone; only the phone on the floor; the next delivery; the old one behind you */}
      <Cut t={t} from={BACK0} to={PHONE0}>
        <Push t={t} t0={BACK0} k={-0.08}><Behind t={t} figure={0} floorPhone={1} /></Push>
      </Cut>
      <Cut t={t} from={PHONE0} to={WHIP}>
        <Push t={t} t0={PHONE0} k={0.08}><FloorPhone t={t} at={-1} next={{at: NEXT, title: 'Следующая доставка назначена'}} /></Push>
      </Cut>
      <Cut t={t} from={WHIP} to={BLACK}>
        <AbsoluteFill style={{transform: `translateX(${(1 - whip) * 900}px)`, filter: `blur(${(1 - whip) * 18}px)`}}>
          <Push t={t} t0={WHIP} k={0.2} shake={0.9 * pulse(t, WHIP + 0.1, 6)}>
            <Behind t={t} figure={1} person={{s: 1.9, y: 1010, phone: 'chest', age: 1, smile: 1, glint: 0.7, glow: 1}} />
          </Push>
        </AbsoluteFill>
      </Cut>

      {/* 7. black; "Ты был всего лишь дверью."; «КУРЬЕР УЖЕ ВНУТРИ — ФИНАЛ»; the whisper */}
      <Cut t={t} from={BLACK} to={FIN}><Question k={easeOut((t - TXT) / 0.6)} text="Ты был всего лишь дверью." /></Cut>
      <Cut t={t} from={FIN} to={1e9}><FinalCard k={easeOut((t - FIN) / 0.7)} /></Cut>

      <Grain f={f} k={0.07} />
      {t < WHIP && <CaseSubs lines={voice.lines} f={f} fps={fps} total={voice.total} tone={(i) => ROLE_TONE[L(i).role] ?? 'white'} />}
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
