// «Курьер уже внутри», часть 3 «Смена» (remake, ~95 s): the loop closes. He hands you the bag; the courier app opens
// by itself — «Смена начата», recipient: you, 23:47 — you blink and it is 23:47 again. You knock three times on your
// own door (the knocks of part 1), lay the bag down; he opens and looks straight through you: nobody ever sees the
// courier. You walk past him — «Курьер уже внутри» — into the wardrobe; through the crack you film him sitting down:
// it was you who shot that video. Then someone breathes on your neck: «Подвинься.» Screamer; «Следующий заказ уже
// внутри»; the question card; the cover as the last frames. One narrator (Nikolay, one take).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './vnutri3r.voice.json';
import {CaseSubs, Push, SafeZones, SAFE, MONT, MONO} from '../case/Kit';
import {Grain, DataChip} from '../case/Hybrid';
import {Peephole} from '../case/Kurier';
import {V, Phone, Notif, LockContent, Table, Corridor, Room, Landing} from '../case/Vnutri';
import {LowKey} from '../case/VnutriHall';
import {FaceClose} from '../case/VnutriEnd';
import {SlitPOV, ShiftContent, HandsBag, DoorFromLanding, TitleDrop, Flash} from '../case/VnutriLoop';
import {EndQuestion, Vhs} from '../case/Covers';
import {VnutriCover3} from './VnutriCovers';
import {clamp, easeInOut, easeOut, lerp, ramp, wobble} from '../lib/anim';

export const VN3R_FPS = 30;
const L = (i: number) => voice.lines[i];
const W = (w: string, from = 0) => voice.lines.slice(from).flatMap((l) => l.words)
  .find((x) => x.w.toLowerCase().replace(/[«»"…:]/g, '').startsWith(w))!.t;
const cut = (i: number) => L(i).start - 0.1;

// the beats (vnutri3r.cues.json uses the same offsets)
const BAG = L(0).end + 0.15;                        // the bag pushed into your hands
const APP = W('открылось', 4);                       // the courier app opens by itself
const BLINK = W('моргаешь', 8) + 0.25;               // eyes shut for a moment
const KN = [0.3, 0.67, 1.04].map((d) => L(13).end + d);  // the three knocks of part 1
const MEM = L(15).start - 0.05;                      // flashes of part 1: the peephole, the bag
const THRU = W('сквозь', 19);                        // he looks through you
const SIT = L(25).start;                             // through the crack: he goes back to the table and sits
const SCR = L(28).end + 0.2;                         // «Подвинься» -> the screamer
const NEXT = SCR + 0.8, QA = NEXT + 2.6, COVER = QA + 4.2;
export const VN3R_SEC = Math.ceil((COVER + 0.2) * 10) / 10;
const TONE: Record<number, 'white' | 'red'> = {0: 'red', 9: 'red', 20: 'red', 22: 'red', 28: 'red'};

const Cut: React.FC<{t: number; from: number; to: number; children: React.ReactNode}> = ({t, from, to, children}) =>
  t >= from && t < to ? <AbsoluteFill style={{opacity: from <= 0 ? 1 : easeOut((t - from) / 0.1)}}>{children}</AbsoluteFill> : null;  // frame 0 is the cover: no fade-in
const pulse = (t: number, at: number, k = 6) => (t >= at ? Math.exp(-k * (t - at)) : 0);
const buzz = (t: number, at: number, d = 0.7) => (t >= at && t < at + d ? Math.sin((t - at) * 95) * (1 - (t - at) / d) : 0);
const sq = (x: number) => clamp(x) ** 2;
const stamp = (t: number) => { const s = 23 * 3600 + 51 * 60 + 10 + Math.max(0, t - SIT); return `30.10 ${String(Math.floor(s / 3600) % 24).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };

export const Vnutri3R: React.FC<{audio?: boolean; safe?: boolean}> = ({audio = false, safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const thrust = ramp(t, BAG, BAG + 0.25, sq);
  const lunge = ramp(t, SCR, SCR + 0.14, sq);
  const eyelid = t >= BLINK && t < BLINK + 0.32 ? Math.sin(Math.PI * (t - BLINK) / 0.32) : 0;
  const ret = ramp(t, SIT, SIT + 1.8, easeInOut), sit = ramp(t, SIT + 1.6, SIT + 2.4, easeInOut);

  return (
    <AbsoluteFill style={{background: V.black}}>
      {audio && <Audio src={staticFile('vnutri3r/mix.wav')} />}

      {/* 1. the last frame of part 2: his face. «Твоя смена.» He pushes the bag at you */}
      <Cut t={t} from={0} to={cut(1)}>
        <Push t={t} t0={0} k={0.06}><FaceClose t={t} f={f} warp={0} glint={0} smirk={0} person={{wrong: 1, smile: 1, talk: t < L(0).end ? 0.5 : 0}} /></Push>
        <Vhs k={0.7} />
        {thrust > 0 && <AbsoluteFill style={{background: '#050506', transform: `scale(${0.2 + 0.8 * thrust})`, borderRadius: 60 * (1 - thrust), opacity: clamp(thrust * 3)}} />}
      </Cut>
      {/* the bag in your hands; it is warm */}
      <Cut t={t} from={cut(1)} to={cut(3)}>
        <Push t={t} t0={cut(1)} k={0.08} shake={0.4 * pulse(t, cut(1), 6)}><HandsBag t={t} breathe={ramp(t, L(2).start, L(2).end)} /></Push>
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 54%, rgba(255,150,110,${0.08 + 0.05 * Math.sin(t * 2.4)}) 0%, rgba(0,0,0,0) 40%)`, opacity: ramp(t, L(2).start, L(2).end)}} />
      </Cut>

      {/* 2. the phone: the courier app opened by itself. «Смена начата». Recipient: you. 23:47. But it is almost midnight */}
      <Cut t={t} from={cut(3)} to={cut(9)}>
        <Push t={t} t0={cut(3)} k={0.1}>
          <AbsoluteFill style={{background: '#0a0b0d'}}>
            <Phone x={540} y={860} w={560} rot={-2 + 1.3 * buzz(t, L(3).start)}>
              {t < APP ? <LockContent s={560 / 400} time="23:58" date="суббота, 31 октября" notes={<Notif k={easeOut((t - L(3).start) / 0.3)} title="Доставка" text="Новая смена для вас" scale={560 / 400} />} />
                : <ShiftContent s={560 / 400} t={t} at={L(5).start} rows={[W('ты', 6), W('адрес', 6), W('время', 6)]} clock="23:58" />}
            </Phone>
            <LowKey x={540} y={860} r={72} k={0.82} />
          </AbsoluteFill>
        </Push>
        <DataChip f={f} fps={fps} at={W('полночь', 7) - 0.2} x={SAFE.left + 10} y={SAFE.top + 40} label="СЕЙЧАС" value="23:58" />
        {eyelid > 0 && <AbsoluteFill style={{background: '#000', opacity: eyelid}} />}
      </Cut>
      {/* you blink: 23:47 again (the first frame of part 1) */}
      <Cut t={t} from={cut(9)} to={cut(10)}>
        <Table t={t} />
        <Push t={t} t0={cut(9)} k={0.1}><Phone x={SAFE.cx} y={840} w={430} rot={-4}><LockContent s={430 / 400} time="23:47" date="пятница, 30 октября" notes={null} /></Phone></Push>
        <Vhs k={0.6} />
      </Cut>

      {/* 3. on the landing, in front of your own door. «Постучите». Three short knocks. Your phone buzzes inside */}
      <Cut t={t} from={cut(10)} to={MEM}>
        <Push t={t} t0={cut(10)} k={0.1} shake={0.6 * KN.reduce((a, k) => a + pulse(t, k, 8), 0)}>
          <DoorFromLanding t={t} open={0} flex={KN.reduce((a, k) => a + pulse(t, k, 8), 0)} />
        </Push>
        <AbsoluteFill style={{transform: `translateY(${lerp(1400, 0, ramp(t, L(12).start - 0.3, L(12).start + 0.2, easeOut))}px)`}}>
          <Phone x={790} y={1120} w={240} rot={-6}><LockContent s={240 / 400} time="23:47" date="" notes={<Notif k={easeOut((t - W('постучите', 12) + 0.1) / 0.25)} title="Постучите" red scale={240 / 400} />} /></Phone>
        </AbsoluteFill>
      </Cut>
      {/* you remember what happens next (part 1: the peephole, the bag) */}
      <Cut t={t} from={MEM} to={MEM + 0.8}><AbsoluteFill style={{filter: 'grayscale(1) brightness(0.9)'}}><Peephole t={t} /></AbsoluteFill><Vhs k={1.2} /></Cut>
      <Cut t={t} from={MEM + 0.8} to={cut(16)}><AbsoluteFill style={{filter: 'grayscale(1) brightness(0.9)'}}><Landing t={t} open={1} tilt={1} lift={0} /></AbsoluteFill><Vhs k={1.2} /></Cut>
      <Cut t={t} from={cut(16)} to={cut(17)}><Push t={t} t0={cut(16)} k={0.06}><Landing t={t} open={1} tilt={1} lift={0} /></Push></Cut>

      {/* 4. the door opens: him. He looks straight through you. Nobody ever sees the courier */}
      <Cut t={t} from={cut(17)} to={THRU - 0.05}>
        <Push t={t} t0={cut(17)} k={0.2}><DoorFromLanding t={t} open={ramp(t, L(17).start, L(17).end + 0.7)} him={ramp(t, L(17).start + 0.3, L(17).end + 0.6)} /></Push>
      </Cut>
      <Cut t={t} from={THRU - 0.05} to={cut(21)}>
        <Push t={t} t0={THRU} k={0.14} shake={0.6 * pulse(t, THRU, 6)}>
          <FaceClose t={t} f={f} warp={0} glint={0} smirk={0} person={{look: 0.9, glow: 1, wrong: 0.4}} blur={1.4} />
        </Push>
        <Flash t={t} at={THRU} d={0.08} color="#cfd8e6" />
      </Cut>

      {/* 5. you walk past him into the flat: «Курьер уже внутри». You know your place: the wardrobe */}
      <Cut t={t} from={cut(21)} to={cut(24)}>
        <Corridor t={t} walk={ramp(t, L(21).start, L(22).end, easeInOut) * 0.4} wardrobe={ramp(t, L(23).start, L(23).end + 0.6, easeInOut)} ajar={ramp(t, L(23).end, L(23).end + 0.6)} />
        <LowKey x={560} y={900} r={70} k={0.8} />
        <TitleDrop t={t} at={L(22).start - 0.05} d={1.8} />
      </Cut>

      {/* 6. inside the wardrobe: the old phone records; through the crack he sits down at the table, back to you —
          the very video of part 1 */}
      <Cut t={t} from={cut(24)} to={L(28).start - 0.25}>
        <AbsoluteFill style={{filter: `grayscale(${0.3 + 0.5 * ramp(t, L(26).start, L(26).end)})`}}>
          <SlitPOV t={t} gap={0.5 - 0.46 * ramp(t, L(27).start, L(28).start - 0.4, easeInOut)} rec={t < L(27).start + 1} stamp={stamp(t)}>
            <AbsoluteFill style={{filter: 'brightness(1.3)'}}><Room t={t} hero={{walk: 1 - ret, stand: 1 - sit}} phoneGlow={sit} lamp={0.6} /></AbsoluteFill>
          </SlitPOV>
        </AbsoluteFill>
        <Vhs k={0.5 + 0.5 * ramp(t, L(26).start, L(26).end)} />
        {/* a pale face, barely there, right behind you */}
        <AbsoluteFill style={{opacity: 0.12 * ramp(t, L(27).start + 1.2, L(28).start - 0.4), transform: 'translateX(380px) scale(1.4)', transformOrigin: '540px 760px'}}>
          <FaceClose t={t} f={f} warp={0} glint={0} smirk={0} person={{wrong: 1, smile: 0.6, age: 0.35}} />
        </AbsoluteFill>
      </Cut>
      {/* «Подвинься.» */}
      <Cut t={t} from={L(28).start - 0.25} to={SCR + 0.25}>
        <AbsoluteFill style={{background: '#000'}} />
        <AbsoluteFill style={{opacity: ramp(t, SCR - 0.02, SCR + 0.06), transform: `scale(${1 + 0.9 * lunge}) translate(${wobble(t * 40, 3) * 12 * lunge}px, 0)`, transformOrigin: '540px 760px'}}>
          <FaceClose t={t} f={f} warp={0.3 * lunge} glint={0} smirk={0} person={{wrong: 1, smile: 1, age: 0.35}} />
        </AbsoluteFill>
        <Vhs k={0.6 + lunge} />
      </Cut>
      <Flash t={t} at={SCR + 0.12} d={0.12} />

      {/* «Следующий заказ уже внутри»; the question; the cover */}
      <Cut t={t} from={NEXT} to={QA}>
        <AbsoluteFill style={{background: V.black, alignItems: 'center', justifyContent: 'center', paddingRight: 1080 - 2 * SAFE.cx, paddingBottom: 200}}>
          <div style={{opacity: easeOut((t - NEXT) / 0.5), transform: `scale(${1.06 - 0.06 * easeOut((t - NEXT) / 0.8)})`, textAlign: 'center'}}>
            <div style={{fontFamily: MONO, fontSize: 30, letterSpacing: 6, color: '#aab3c2', marginBottom: 26}}>● ДОСТАВКА · СЕЙЧАС</div>
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: V.red, textShadow: '0 0 40px rgba(226,59,59,0.55)'}}>СЛЕДУЮЩИЙ<br />ЗАКАЗ<br />УЖЕ ВНУТРИ</div>
          </div>
        </AbsoluteFill>
      </Cut>
      <Cut t={t} from={QA} to={COVER}>
        <EndQuestion t={t} at={QA} q="КТО ДЫШАЛ *В ШКАФУ?*" a="ЗАВТРАШНИЙ ТЫ" b="КТО-ТО ДРУГОЙ" next="ПОДПИШИСЬ — ЗАКАЗЫ ЕЩЁ БУДУТ" />
      </Cut>
      <Cut t={t} from={COVER} to={1e9}><VnutriCover3 /></Cut>

      <Grain f={f} k={0.07} />
      {t < L(28).end + 0.2 && <CaseSubs lines={voice.lines} f={f} fps={fps} total={voice.total} tone={(i) => TONE[i] ?? 'white'} />}
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
