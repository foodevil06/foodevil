// «Курьер уже внутри», часть 2 «За дверью стою я» (~2 min, 9:16, psychological horror). After the knocks in the
// wardrobe: someone is behind the front door, and your own number is calling. The voice behind the door says "don't
// open, it isn't me", the voice in the phone says "I am you, the one who already opened". A key under the mat that
// you never put there. The handle goes down by itself, the chain pulls taut; "он уже внутри" — a bang behind you.
// You turn around: you are standing there, with the same phone. "Доставка завершена." Black, a knock, "Часть 3".
// Every voice is Nikolay (narrator, door, phone, the double, whispers); timings from vnutri2.voice.json
// (_tmp/vnutri2/assemble.py). Each mini-screamer sits on one picture event; after each strong sound, silence.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './vnutri2.voice.json';
import {CaseSubs, Push, SafeZones} from '../case/Kit';
import {Grain} from '../case/Hybrid';
import {V, Phone, Corridor, EndCard} from '../case/Vnutri';
import {FrontDoor, CallContent, HallStage, TvShot, Doormat, Behind, FloorPhone, Question, Nightstand, LowKey} from '../case/VnutriHall';
import {clamp, easeInOut, easeOut, lerp, ramp} from '../lib/anim';

export const VN2_FPS = 30;
const L = (i: number) => voice.lines[i];
const W = (w: string, from = 0) => voice.lines.slice(from).flatMap((l) => l.words)
  .find((x) => x.w.toLowerCase().replace(/[«»"…]/g, '').startsWith(w))!.t;
const cut = (i: number) => L(i).start - 0.1;

// the beats (vnutri2.cues.json uses the same offsets)
const BANGS = [1.0, 2.3, 3.8].map((d) => L(1).end + d);     // three heavy blows on the front door, each heavier
const HJ = L(2).end + 0.25;                                  // mini-screamer 1: the handle jerks down
const PH0 = L(2).end + 2.0;                                  // the phone on the night stand
const RING = PH0 + 0.6;
const CLICK = L(5).start - 0.8;                              // you answer: a click, then 0.4 s of nothing
const TV0 = L(13).start - 0.1;
const SM = L(13).end + 0.35;                                 // mini-screamer 2: the reflection grins, glass hit
const KEY0 = L(14).start - 1.6;                              // walk to the door, the mat
const TAKE = L(16).end + 0.4;                                // the key is picked up
const P0 = L(22).end + 0.6;                                  // the pressure on the door starts
const PB = [2.2, 3.8, 5.4].map((d) => L(22).end + d);       // three more blows, heavier
const BEHIND = W('внутри', 25) + 0.12;                       // mini-screamer 4: the bang right behind you
const TURN0 = L(26).start - 1.2, TURN1 = L(26).end + 0.4;    // the slow turn
const DROP = L(27).end + 0.35;                               // mini-screamer 5 just before: the inhale and the bass hit
const FLOOR = DROP + 0.75;
const BLACK = FLOOR + 2.6;
const Q = BLACK + 1.6, P3 = Q + 2.6;
export const VN2_SEC = Math.ceil((L(28).end + 2.6) * 10) / 10;

const ROLE_TONE: Record<string, 'white' | 'yellow' | 'red' | 'blue'> = {N: 'white', NW: 'white', D: 'yellow', P: 'blue', X: 'red', W: 'red'};

const Cut: React.FC<{t: number; from: number; to: number; children: React.ReactNode}> = ({t, from, to, children}) =>
  t >= from && t < to ? <AbsoluteFill style={{opacity: from <= 0 ? 1 : easeOut((t - from) / 0.12)}}>{children}</AbsoluteFill> : null;  // frame 0 is the cover: no fade-in

const pulse = (t: number, at: number, k = 6) => (t >= at ? Math.exp(-k * (t - at)) : 0);
const buzz = (t: number, at: number, d = 0.7) => (t >= at && t < at + d ? Math.sin((t - at) * 95) * (1 - (t - at) / d) : 0);
const talking = (t: number, i: number) => (t >= L(i).start && t < L(i).end ? 0.45 + 0.55 * Math.abs(Math.sin(t * 17)) : 0);

export const Vnutri2: React.FC<{audio?: boolean; safe?: boolean}> = ({audio = false, safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;

  const flexHook = BANGS.reduce((a, b, i) => a + (0.6 + 0.2 * i) * pulse(t, b, 7), 0);
  const handleJerk = clamp((t - HJ) / 0.06) * (1 - clamp((t - HJ - 0.14) / 0.35));
  const flexPress = PB.reduce((a, b, i) => a + (0.8 + 0.25 * i) * pulse(t, b, 6), 0);
  // the phone keeps buzzing in short bursts until you answer
  const ringing = t >= RING && t < CLICK - 0.6 ? buzz(t, RING + Math.floor((t - RING) / 1.1) * 1.1, 0.75) : 0;
  const lift = ramp(t, L(4).end + 0.3, CLICK, easeInOut);
  const orbit = lerp(-1, 1, ramp(t, CLICK, L(12).end));
  const turn = ramp(t, TURN0, TURN1, easeInOut);
  const turnSpeed = Math.sin(Math.PI * turn);

  return (
    <AbsoluteFill style={{background: V.black}}>
      {audio && <Audio src={staticFile('vnutri2/mix.wav')} />}

      {/* 1. from the wardrobe to the front door; breathing; three heavy blows */}
      <Cut t={t} from={0} to={BANGS[1] - 0.05}>
        <Corridor t={t} walk={0.55 * ramp(t, 1.2, L(1).end + 0.6, easeInOut)} wardrobe={1 - ramp(t, 0.3, 3.6, easeInOut)} jolt={pulse(t, BANGS[0], 7)} />
        <LowKey x={540} y={860} r={70} k={0.8} />
      </Cut>
      <Cut t={t} from={BANGS[1] - 0.05} to={PH0}>
        <Push t={t} t0={BANGS[1]} k={0.08} shake={0.5 * flexHook + 0.9 * pulse(t, HJ, 9)}>
          <FrontDoor t={t} flex={flexHook} feet={ramp(t, L(2).start - 0.5, L(2).start + 0.2)} handle={handleJerk} zoom={1 + 0.12 * ramp(t, BANGS[1], PH0)} fx={700} fy={1000} />
        </Push>
        <LowKey x={640} y={980} r={72} k={0.75} />
      </Cut>

      {/* 2. the night stand: an incoming call from your own number; you answer */}
      <Cut t={t} from={PH0} to={CLICK}>
        <Nightstand t={t} />
        <AbsoluteFill style={{transform: `translateY(${-160 * lift}px) scale(${1 + 0.55 * lift})`, transformOrigin: '50% 45%'}}>
          <Push t={t} t0={PH0} k={0.1} shake={0.25 * pulse(t, W('мой', 3), 4)}>
            <Phone x={500} y={860} w={440} rot={-6 + 1.3 * ringing} on={ramp(t, RING - 0.1, RING + 0.15)}>
              <CallContent s={440 / 400} t={t} markAt={W('мой', 3)} acceptAt={CLICK - 0.12} glitch={pulse(t, W('мой', 3), 3)} />
            </Phone>
          </Push>
        </AbsoluteFill>
        <LowKey x={500} y={860} r={78} k={0.85} />
      </Cut>

      {/* 3. two voices: the camera circles you, phone at your ear; the door speaks; the TV grins */}
      <Cut t={t} from={CLICK} to={cut(8)}>
        <Push t={t} t0={CLICK} k={0.06}><HallStage t={t} orbit={orbit} person={{phone: 'ear', glow: 0.5 + 0.5 * ramp(t, CLICK, CLICK + 1.2)}} /></Push>
      </Cut>
      <Cut t={t} from={cut(8)} to={cut(10)}>
        <Push t={t} t0={cut(8)} k={0.1}><FrontDoor t={t} feet={1} zoom={1.15} fx={540} fy={1500} /></Push>
        <LowKey x={540} y={1400} r={70} k={0.85} />
      </Cut>
      <Cut t={t} from={cut(10)} to={TV0}>
        <Push t={t} t0={cut(10)} k={0.12}><HallStage t={t} orbit={orbit} person={{phone: 'ear', glow: 1}} /></Push>
      </Cut>
      <Cut t={t} from={TV0} to={KEY0}>
        <Push t={t} t0={TV0} k={0.08} shake={0.8 * pulse(t, SM, 8)}>
          <TvShot t={t} smile={t >= SM - 0.02 && t < SM + 0.25 ? 1 : 0} crack={ramp(t, SM, SM + 0.05)} flash={pulse(t, SM, 6)} />
        </Push>
      </Cut>

      {/* 4. the key under the mat */}
      <Cut t={t} from={KEY0} to={cut(20)}>
        <AbsoluteFill style={{transform: `translateY(${(1 - easeOut((t - KEY0) / 1.2)) * -260}px)`}}>
          <Push t={t} t0={KEY0} k={0.14}>
            <Doormat t={t} lift={ramp(t, W('коврик', 14) + 0.05, W('коврик', 14) + 0.9)} glint={pulse(t, W('ключ', 15), 2.5)} take={ramp(t, TAKE, TAKE + 0.7, easeInOut)} />
          </Push>
        </AbsoluteFill>
      </Cut>
      <Cut t={t} from={cut(20)} to={P0}>
        <Push t={t} t0={cut(20)} k={0.1}><FrontDoor t={t} zoom={2.1} fx={793} fy={1060} /></Push>
        <LowKey x={760} y={1060} r={60} k={0.9} />
      </Cut>

      {/* 5. pressure: the door trembles, the handle goes down by itself, the chain pulls taut; "он уже внутри" — a bang behind */}
      <Cut t={t} from={P0} to={TURN0}>
        <Push t={t} t0={P0} k={0.1} shake={0.35 * flexPress + 1.4 * pulse(t, BEHIND, 7)}>
          <FrontDoor t={t} rattle={ramp(t, P0, P0 + 1.2) * (t < BEHIND ? 1 : 0.2)} handle={0.85 * ramp(t, P0 + 0.9, P0 + 4.4)} chain={ramp(t, P0 + 2.4, P0 + 4.9)}
            flex={flexPress} feet={1} zoom={1.05 + 0.1 * ramp(t, P0, TURN0)} fx={700} fy={900} />
        </Push>
        <LowKey x={700} y={950} r={74} k={0.8} />
      </Cut>

      {/* 6. you turn around: you. "Доставка завершена." Your phone falls */}
      <Cut t={t} from={TURN0} to={FLOOR}>
        <AbsoluteFill style={{transform: `translateX(${-1080 * turn}px)`, filter: `blur(${10 * turnSpeed}px)`}}>
          <FrontDoor t={t} handle={0.85} chain={1} feet={1} zoom={1.15} fx={700} fy={900} /><LowKey x={700} y={950} r={74} k={0.8} />
        </AbsoluteFill>
        <AbsoluteFill style={{transform: `translateX(${1080 * (1 - turn)}px)`, filter: `blur(${10 * turnSpeed}px)`}}>
          <Push t={t} t0={TURN1} k={0.12} shake={1.2 * pulse(t, L(27).end + 0.1, 7)}>
            <Behind t={t} figure={0.35 + 0.65 * ramp(t, TURN1 - 0.4, TURN1 + 1.6)} talk={talking(t, 27)} breathe={1} />
          </Push>
          {/* your own phone, low in your hand (the call is still running); it slips and falls */}
          <AbsoluteFill style={{transform: `translateY(${900 * ramp(t, DROP, DROP + 0.45, (x) => x * x)}px) rotate(${50 * ramp(t, DROP, DROP + 0.45)}deg)`, transformOrigin: '860px 1150px'}}>
            <Phone x={860} y={1150} w={170} rot={-12} glow>
              <CallContent s={170 / 400} t={t} markAt={-1} acceptAt={CLICK - 0.12} />
            </Phone>
          </AbsoluteFill>
        </AbsoluteFill>
      </Cut>
      <Cut t={t} from={FLOOR} to={BLACK}>
        <Push t={t} t0={FLOOR} k={0.06}><FloorPhone t={t} at={FLOOR + 0.4} /></Push>
      </Cut>

      {/* 7. black; a quiet knock; the question; "Часть 3"; a whisper */}
      <Cut t={t} from={BLACK} to={P3}><Question k={easeOut((t - Q) / 0.5)} text="А ты бы открыл дверь?" /></Cut>
      <Cut t={t} from={P3} to={1e9}><EndCard k={easeOut((t - P3) / 0.5)} part={3} /></Cut>

      <Grain f={f} k={0.07} />
      {t < DROP && <CaseSubs lines={voice.lines} f={f} fps={fps} total={voice.total} tone={(i) => ROLE_TONE[L(i).role] ?? 'white'} />}
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
