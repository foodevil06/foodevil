// «Курьер уже внутри», часть 2 «Кто снимал» (remake, ~70 s). Starts on the last frame of part 1 (the knock in the
// wardrobe): the video was shot from in there. The old phone switches on by itself — a live stream from the wardrobe,
// three seconds ahead of you. On the video the wardrobe door opens; in the corridor it is shut. 3, 2, 1. It opens:
// a courier with the same black bag lifts his head — it is you, with a grin too wide. "Твоя смена." Screamer, the
// question card, the cover as the last frames. One narrator (Nikolay, one take, scripts/voice_pauses.py for the pauses).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './vnutri2r.voice.json';
import {CaseSubs, Push, SafeZones, SAFE} from '../case/Kit';
import {Grain, DataChip} from '../case/Hybrid';
import {V, Phone, Corridor, Room} from '../case/Vnutri';
import {LowKey, Person} from '../case/VnutriHall';
import {FaceClose} from '../case/VnutriEnd';
import {SlitPOV, LiveContent, CorridorFromWardrobe, BigCount, Flash} from '../case/VnutriLoop';
import {EndQuestion, Vhs} from '../case/Covers';
import {VnutriCover2} from './VnutriCovers';
import {clamp, easeInOut, easeOut, lerp, ramp, wobble} from '../lib/anim';

export const VN2R_FPS = 30;
const L = (i: number) => voice.lines[i];
const W = (w: string, from = 0) => voice.lines.slice(from).flatMap((l) => l.words)
  .find((x) => x.w.toLowerCase().replace(/[«»"…]/g, '').startsWith(w))!.t;
const cut = (i: number) => L(i).start - 0.1;

// the beats (vnutri2r.cues.json uses the same offsets)
const VSTEP = W('назад', 6) - 0.25;               // on the video you step back...
const RSTEP = VSTEP + 3;                           // ...and three seconds later you do it
const VOPEN = W('открываться', 11);                // on the video the door starts to open
const SCR = L(24).end + 0.25;                      // the screamer after «Твоя смена»
const QA = SCR + 0.8;                              // the question card
const COVER = QA + 4.2;                            // the cover, last frames (pick it as the YouTube thumbnail)
export const VN2R_SEC = Math.ceil((COVER + 0.2) * 10) / 10;
const TONE: Record<number, 'white' | 'red'> = {13: 'red', 15: 'red', 17: 'red', 22: 'red', 24: 'red'};

const Cut: React.FC<{t: number; from: number; to: number; children: React.ReactNode}> = ({t, from, to, children}) =>
  t >= from && t < to ? <AbsoluteFill style={{opacity: from <= 0 ? 1 : easeOut((t - from) / 0.1)}}>{children}</AbsoluteFill> : null;  // frame 0 is the cover: no fade-in
const pulse = (t: number, at: number, k = 6) => (t >= at ? Math.exp(-k * (t - at)) : 0);
const stamp = (t: number) => { const s = 23 * 3600 + 53 * 60 + 2 + Math.max(0, t); return `31.10 ${String(Math.floor(s / 3600) % 24).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`; };

// the old phone, big in frame, playing the live stream (tv = the time the video shows: three seconds ahead)
const LivePhone: React.FC<{t: number; back: number; gap: number; zoom?: number}> = ({t, back, gap, zoom = 1}) => (
  <AbsoluteFill style={{background: '#0a0b0d', transform: `scale(${zoom})`, transformOrigin: '540px 860px'}}>
    <Phone x={540} y={860} w={560} old>
      <LiveContent t={t} s={0.47} back={back} gap={gap} stamp={stamp(t + 3)} />
    </Phone>
    <LowKey x={540} y={860} r={70} k={0.8} />
  </AbsoluteFill>
);

// the wardrobe from the corridor, the right door swinging open on a dark inside with him in it (head down, then up)
const WardrobeOpen: React.FC<{t: number; open: number; who: number; lift: number}> = ({t, open, who, lift}) => {
  const o = easeInOut(open);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs><linearGradient id="wo-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1d1a17" /><stop offset="1" stopColor="#26221d" /></linearGradient></defs>
        <rect width={1080} height={1920} fill="#111317" />
        <rect y={1640} width={1080} height={280} fill="#0c0d10" />
        <rect x={170} y={220} width={740} height={1440} fill="#020203" />
        <rect x={150} y={200} width={780} height={60} fill="#221e1a" />
        {who > 0 && <g opacity={who}>
          <Person id="wo" x={640} y={760} s={1.05} phone="none" glow={0.15 + 0.85 * lift} courier full />
          <ellipse cx={640} cy={640} rx={92} ry={115} fill="#000" opacity={0.85 * (1 - lift)} />
        </g>}
        <rect x={190} y={280} width={350} height={1360} fill="url(#wo-wood)" />
        <rect x={230} y={340} width={270} height={560} fill="none" stroke="#16130f" strokeWidth={10} /><rect x={230} y={960} width={270} height={600} fill="none" stroke="#16130f" strokeWidth={10} />
        <rect x={500} y={860} width={14} height={110} rx={6} fill="#4a4740" />
        <g transform={`translate(890 0) scale(${1 - 0.86 * o} 1) translate(-890 0)`}>
          <rect x={540} y={280} width={350} height={1360} fill="url(#wo-wood)" />
          <rect x={580} y={340} width={270} height={560} fill="none" stroke="#16130f" strokeWidth={10} /><rect x={580} y={960} width={270} height={600} fill="none" stroke="#16130f" strokeWidth={10} />
          <rect x={566} y={860} width={14} height={110} rx={6} fill="#4a4740" />
        </g>
      </svg>
      <LowKey x={600} y={900} r={66} k={0.88} />
    </AbsoluteFill>
  );
};

export const Vnutri2R: React.FC<{audio?: boolean; safe?: boolean}> = ({audio = false, safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const vback = ramp(t, VSTEP, VSTEP + 0.6, easeInOut);
  const rback = ramp(t, RSTEP, RSTEP + 0.6, easeInOut);
  const vgap = ramp(t, VOPEN, L(17).end + 0.3);
  const lunge = ramp(t, SCR, SCR + 0.14, (x) => clamp(x) ** 2);

  return (
    <AbsoluteFill style={{background: V.black}}>
      {audio && <Audio src={staticFile('vnutri2r/mix.wav')} />}

      {/* 1. the last frame of part 1: the knock in the wardrobe */}
      <Cut t={t} from={0} to={cut(2)}>
        <Push t={t} t0={0} k={0.08}><Corridor t={t} walk={0} wardrobe={1} shake={pulse(t, 0.05, 4) + 0.6 * pulse(t, 1.0, 5)} ajar={0.15} jolt={pulse(t, 0.05, 8)} /></Push>
        <LowKey x={560} y={900} r={70} k={0.8} />
      </Cut>
      {/* the video from part 1 was shot from in there: the room through the crack, REC */}
      <Cut t={t} from={cut(2)} to={cut(3)}>
        <Push t={t} t0={cut(2)} k={0.1}>
          <SlitPOV t={t} gap={0.45} rec stamp="30.10 23:51:14"><AbsoluteFill style={{filter: 'grayscale(0.6) contrast(1.15) brightness(1.35)'}}><Room t={t} hero={{}} phoneGlow={1} lamp={0.6} /></AbsoluteFill></SlitPOV>
        </Push>
        <Vhs k={0.8} />
      </Cut>

      {/* 2. the old phone switches on by itself: a live stream from the wardrobe */}
      <Cut t={t} from={cut(3)} to={cut(7)}>
        <LivePhone t={t} back={vback} gap={0} zoom={lerp(0.8, 1.35, ramp(t, cut(3), L(5).end, easeInOut))} />
        {t < W('загорается', 3) && <AbsoluteFill style={{background: 'rgba(0,0,0,0.75)'}} />}
      </Cut>
      {/* you stand still... three seconds later you take the same step */}
      <Cut t={t} from={cut(7)} to={cut(10)}>
        <AbsoluteFill style={{transform: `scale(${1 - 0.08 * rback}) translateY(${-30 * rback}px)`, transformOrigin: '540px 900px'}}>
          <Corridor t={t} walk={0} wardrobe={1} jolt={0.6 * pulse(t, RSTEP, 6)} />
        </AbsoluteFill>
        <LowKey x={560} y={900} r={70} k={0.8} />
        <DataChip f={f} fps={fps} at={RSTEP - 0.2} x={SAFE.left + 10} y={SAFE.top + 40} label="ВИДЕО" value="−3 С" tone="red" />
      </Cut>
      <Cut t={t} from={cut(10)} to={cut(12)}>
        <LivePhone t={t} back={1} gap={vgap} zoom={1.35} />
        <DataChip f={f} fps={fps} at={W('опережает', 10)} x={SAFE.left + 10} y={SAFE.top + 40} label="ВИДЕО ОПЕРЕЖАЕТ" value="3 С" tone="red" />
      </Cut>

      {/* 3. in the corridor the door is shut; on the video it opens. 3, 2, 1 */}
      <Cut t={t} from={cut(12)} to={cut(13)}><Corridor t={t} walk={0.1} wardrobe={1} /><LowKey x={560} y={900} r={70} k={0.8} /></Cut>
      <Cut t={t} from={cut(13)} to={cut(14)}><LivePhone t={t} back={1} gap={vgap} zoom={1.45} /></Cut>
      <Cut t={t} from={cut(14)} to={cut(15)}><Push t={t} t0={cut(14)} k={0.06} shake={0.25}><Corridor t={t} walk={0.1} wardrobe={1} shake={0.3} /></Push><LowKey x={560} y={900} r={70} k={0.8} /></Cut>
      <Cut t={t} from={cut(15)} to={cut(16)}><LivePhone t={t} back={1} gap={vgap} zoom={1.55} /></Cut>
      <Cut t={t} from={cut(16)} to={cut(17)}><Push t={t} t0={cut(16)} k={0.08} shake={0.35}><Corridor t={t} walk={0.1} wardrobe={1} shake={0.6} /></Push><LowKey x={560} y={900} r={70} k={0.8} /></Cut>
      <Cut t={t} from={cut(17)} to={cut(18)}><LivePhone t={t} back={1} gap={vgap} zoom={1.7} /></Cut>
      <BigCount t={t} at={L(13).start} n="3" /><BigCount t={t} at={L(15).start} n="2" /><BigCount t={t} at={L(17).start} n="1" />

      {/* 4. the door opens: a courier in the dark, the same black bag; he lifts his head */}
      <Cut t={t} from={cut(18)} to={cut(22)}>
        <Push t={t} t0={cut(18)} k={0.18}>
          <WardrobeOpen t={t} open={ramp(t, L(18).start - 0.1, L(18).end + 0.8)} who={ramp(t, L(18).end, L(19).start + 0.6)} lift={ramp(t, W('поднимает', 21), L(21).end + 0.6, easeInOut)} />
        </Push>
      </Cut>
      {/* it is you. The grin is wider than a human one. «Твоя смена.» */}
      <Cut t={t} from={cut(22)} to={SCR + 0.2}>
        <AbsoluteFill style={{transform: `scale(${1 + 0.9 * lunge}) translate(${wobble(t * 40, 3) * 10 * lunge}px, 0)`, transformOrigin: '540px 760px'}}>
          <Push t={t} t0={cut(22)} k={0.16}>
            <FaceClose t={t} f={f} warp={0.06 * Math.max(0, Math.sin(t * 2.3))} glint={0} smirk={0}
              person={{wrong: 0.4 + 0.6 * ramp(t, L(23).start, L(23).end), smile: ramp(t, W('улыбка', 23), W('шире', 23) + 0.4), talk: t >= L(24).start && t < L(24).end ? 0.6 : 0}} />
          </Push>
        </AbsoluteFill>
        <Vhs k={0.6 + lunge} />
      </Cut>
      <Flash t={t} at={SCR + 0.12} d={0.12} />

      {/* the question card, then the cover */}
      <Cut t={t} from={QA} to={COVER}>
        <EndQuestion t={t} at={QA} q="ВЗЯЛ БЫ *ПАКЕТ?*" a="ДА" b="БЕЖАЛ БЫ" next="ПОДПИШИСЬ, ЧАСТЬ 3 СКОРО" />
      </Cut>
      <Cut t={t} from={COVER} to={1e9}><VnutriCover2 /></Cut>

      <Grain f={f} k={0.07} />
      {t < L(24).end + 0.2 && <CaseSubs lines={voice.lines} f={f} fps={fps} total={voice.total} tone={(i) => TONE[i] ?? 'white'} />}
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
