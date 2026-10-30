// «Ограбление века»: the Binance hack of 29.10.2026 (~90 s, 9:16). The biggest robbery in history without masks or a
// tunnel: $6.3bn, most of it in ~20 minutes. Then vs now (Brazil 2005 tunnel, Iraq 2003 trucks, 63 tonnes of cash),
// one laptop, 50 signatures so that one works, ten chains, Lazarus and the "fandation" typo, the freeze after 37 minutes,
// Binance covering the rest, and one useful habit. Facts and sources: _tmp/binance/ФАКТЫ.md.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import voice from './binance.voice.json';
import nitka from './binance.nitka.json';
import nitkaMouth from './binance.nitka.mouth.json';
import {CaseSubs, Desk, Paper, Push, SafeZones, Stamp, SAFE, C, MONO, MONT} from '../case/Kit';
import {Grain, DataChip} from '../case/Hybrid';
import {CommentBubble} from '../case/KurierSeries';
import {M, Backdrop, Tag, BigNum, Vault, NoNeed, MoneyTower, Odometer, Stopwatch, Tunnel, Trucks, Weight, Laptop, Signatures, CoinStream, Network, Bars, Typo, Shield, Offer} from '../case/Heist';
import {Icon} from '../ui/Icons';
import {Nitka, act, Key, Emo, Arm, Emote} from '../rig/Nitka';
import {clamp, easeInOut, easeOut, ramp, spring01, wobble} from '../lib/anim';

export const HE_FPS = 30;
export const HE_SEC = Math.ceil(voice.total * 10) / 10;
const L = (i: number) => voice.lines[i];
const W = (w: string, from = 0) => voice.lines.slice(from).flatMap((l) => l.words)
  .find((x) => x.w.toLowerCase().replace(/[«»"$]/g, '').startsWith(w))!.t;
const cut = (i: number) => L(i).start - 0.1;
const END = L(25).end + 0.3;

// «Нитка» (MASCOT.md) pops in four times: rolls in from the left in the gap made for her line, acts on her words, rolls out.
// Each line: [word index, emotion, extras] keys; the first key is the take on her first word.
const NL = nitka.lines;
const NW = (i: number, k: number) => NL[i].words[k].t;
const NKEYS: [number, Emo, {arm?: Arm; look?: [number, number]; emote?: Emote}?][][] = [
  [[0, 'surprised', {look: [0.7, -0.4]}], [2, 'laugh', {arm: 'shrug'}]],
  [[0, 'thinking', {arm: 'chin', look: [0.8, -0.5]}], [5, 'excited', {arm: 'point', look: [0.6, -0.3]}]],
  [[0, 'surprised', {emote: '!', look: [0.6, -0.2]}], [2, 'proud', {arm: 'hips'}]],
  [[0, 'happy', {arm: 'wave'}], [3, 'playful', {arm: 'tug'}]],
];
const NX = [240, 240, 240, 470], NFEET = 1330, NSC = 1.3;  // the sign-off takes the centre
const NitkaInsert: React.FC<{t: number}> = ({t}) => {
  const i = NL.findIndex((l) => t >= l.start - nitka.enter - 0.05 && t < l.end + nitka.exit + 0.1);
  if (i < 0) return null;
  const ln = NL[i], t0 = ln.start - nitka.enter, t1 = ln.end + 0.15;
  const inK = easeOut((t - t0) / (nitka.enter - 0.05)), outK = easeInOut((t - t1) / (nitka.exit - 0.1));
  const x = NX[i] - (NX[i] + 180) * (1 - inK) - (NX[i] + 280) * clamp(outK);
  const rolling = t < t0 + nitka.enter - 0.08 || t > t1 ? 1 : 0;
  const keys: Key[] = [[0, 'neutral'], ...NKEYS[i].map(([k, e, o]) => [NW(i, k) - 0.05, e, o] as Key)];
  const st = act(t, keys);
  const talk = rolling ? 0 : nitkaMouth.mouth[Math.min(nitkaMouth.mouth.length - 1, Math.max(0, Math.round(t * nitkaMouth.fps)))] ?? 0;
  const spin = -540 * (1 - inK) - 600 * clamp(outK);
  const hop = rolling ? -Math.abs(Math.sin(t * 10)) * 26 : 0;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 55% 40% at 20% 72%, rgba(7,11,20,${0.75 * inK * (1 - clamp(outK))}) 0%, rgba(7,11,20,0) 70%)`}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Nitka t={t} x={x} y={NFEET + hop} s={NSC} st={st} talk={talk} roll={rolling} spin={spin} />
      </svg>
    </AbsoluteFill>
  );
};

// narrator and mascot subtitles on one track; the mascot's lines get her red word box
const SUBS = [...voice.lines.map((l, i) => ({...l, who: i})), ...NL.map((l) => ({...l, who: -1}))].sort((a, b) => a.start - b.start);
const SUBS_END = Math.max(END, NL[NL.length - 1].end + 0.35);
const TONE: ('white' | 'yellow' | 'red')[] = ['yellow', 'white', 'yellow', 'red', 'white', 'white', 'white', 'yellow', 'red', 'white', 'white', 'yellow', 'white',
  'red', 'white', 'red', 'white', 'yellow', 'white', 'white', 'yellow', 'white', 'yellow', 'white', 'yellow', 'yellow'];

const Cut: React.FC<{t: number; from: number; to: number; children: React.ReactNode}> = ({t, from, to, children}) =>
  t >= from && t < to ? <AbsoluteFill style={{opacity: from <= 0 ? 1 : easeOut((t - from) / 0.12)}}>{children}</AbsoluteFill> : null;  // frame 0 is the cover: no fade-in

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export const BinanceHeist: React.FC<{audio?: boolean; safe?: boolean}> = ({audio = false, safe = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const freezeAt = W('замораживать', 19);
  const streamT = Math.min(t, freezeAt) + Math.max(0, t - freezeAt) * 0.04;
  const clockMin = Math.round(20 * 60 + 24 + 37 * easeInOut((t - cut(18) - 0.3) / 2.2));
  const winAt = L(13).start;

  return (
    <AbsoluteFill style={{background: M.bg}}>
      {audio && <Audio src={staticFile('binance/mix.wav')} />}

      {/* 1. the vault opens: the biggest robbery in history */}
      <Cut t={t} from={0} to={cut(1)}>
        <Backdrop t={t} />
        <Push t={t} t0={0} k={0.08}><Vault t={t} open={ramp(t, 0.6, 2.1, easeInOut)} spin={-160 * ramp(t, 0, 1.2, easeInOut)} /></Push>
        <Tag f={f} fps={fps} at={0.15} text="29 ОКТЯБРЯ 2026" />
      </Cut>

      {/* 2. no masks, no tunnel, not a single shot */}
      <Cut t={t} from={cut(1)} to={cut(2)}>
        <Backdrop t={t} />
        <NoNeed f={f} fps={fps} at={[W('масок', 1) - 0.1, W('тоннеля', 1) - 0.1, W('выстрела', 1) - 0.15]} />
      </Cut>

      {/* 3. $6,300,000,000, most of it in 20 minutes */}
      <Cut t={t} from={cut(2)} to={cut(4)}>
        <Backdrop t={t} tint="#2a2208" glow={[500, 1100]} />
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          {[[90, 9], [260, 15], [430, 26], [600, 18], [770, 11]].map(([x, n], i) => <MoneyTower key={i} x={x} base={1450} n={n} p={ramp(t, cut(2) + i * 0.1, L(2).end + 0.3)} />)}
        </svg>
        <Odometer value="$6 300 000 000" p={ramp(t, L(2).start, L(2).end - 0.2)} y={240} size={100} />
        {t >= L(3).start - 0.1 && <Stopwatch p={ramp(t, W('20', 3) - 0.3, W('20', 3) + 0.6)} label="20 МИН" x={SAFE.cx} y={560} r={130} />}
      </Cut>

      {/* 4. the old way: a tunnel. Brazil 2005, 78 m */}
      <Cut t={t} from={cut(4)} to={cut(6)}>
        <Push t={t} t0={cut(4)} k={0.04}><Tunnel t={t} p={ramp(t, cut(4) + 0.3, W('78', 5) + 0.6)} ruler={ramp(t, W('78', 5) - 0.1, W('метров', 5) + 0.3)} /></Push>
        <Tag f={f} fps={fps} at={L(5).start} text="БРАЗИЛИЯ · 2005" />
      </Cut>

      {/* 5. Iraq 2003: three trucks of cash */}
      <Cut t={t} from={cut(6)} to={cut(7)}>
        <Trucks t={t} t0={cut(6)} />
        <Tag f={f} fps={fps} at={L(6).start} text="ИРАК · 2003" />
        <DataChip f={f} fps={fps} at={W('три', 6)} x={SAFE.cx - 160} y={SAFE.top + 160} label="ТРИ ГРУЗОВИКА" value="≈ $1 МЛРД" tone="gold" />
      </Cut>

      {/* 6. 63 tonnes of cash ... carried out without a single truck */}
      <Cut t={t} from={cut(7)} to={cut(9)}>
        <Backdrop t={t} />
        <Weight t={t} p={ramp(t, L(7).start, W('63', 7) + 0.3)} dissolve={ramp(t, L(8).start + 0.2, L(8).end + 0.3, easeInOut)} />
        <BigNum f={f} fps={fps} at={W('63', 7)} text="63 ТОННЫ" y={560} size={130} sub="КУПЮРАМИ ПО $100" />
      </Cut>

      {/* 7. one laptop -> the system that sends transfers (Binance's version) */}
      <Cut t={t} from={cut(9)} to={cut(11)}>
        <Push t={t} t0={cut(9)} k={0.05}><Laptop t={t} t0={cut(9)} link={ramp(t, W('системы', 10) - 0.3, W('системы', 10) + 0.6)} red={t > W('переводы', 10) ? 1 : 0} /></Push>
        <Tag f={f} fps={fps} at={L(9).start + 0.1} text="ПО ВЕРСИИ BINANCE" color="#cfd8ef" />
        <DataChip f={f} fps={fps} at={W('ноутбука', 9)} x={SAFE.left + 10} y={1120} label="ТОЧКА ВХОДА" value="1 НОУТБУК" tone="red" />
      </Cut>

      {/* 8-9. fifty signatures in a row, so that one works; it works: $2.5bn in under 4 minutes */}
      <Cut t={t} from={cut(11)} to={cut(14)}>
        <Backdrop t={t} />
        {t >= winAt + 0.5 && <CoinStream time={t} flow={ramp(t, winAt + 0.5, winAt + 1.5)} from={[560, 1000]} to={[1150, 700]} label="Ξ" />}
        <Signatures f={f} fps={fps} at={L(11).start} pick={W('одна', 12) - 0.25} win={winAt} fade={ramp(t, winAt + 0.2, winAt + 0.7)} />
        {t < winAt + 0.6 && <BigNum f={f} fps={fps} at={W('50', 11)} text="50" y={140} size={110} sub="ПОДПИСЕЙ ПОДРЯД" />}
        {t >= winAt + 0.6 && <>
          <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 170, textAlign: 'center', fontFamily: MONO, fontSize: 130, color: '#fff',
            textShadow: `0 0 30px ${M.red}`}}>{mmss(204 * ramp(t, winAt + 0.6, L(13).end - 0.2))}</div>
          <DataChip f={f} fps={fps} at={W('млрд', 13)} x={SAFE.cx - 210} y={340} label="ETHEREUM · ОДИН КОШЕЛЁК" value="$2,5 МЛРД" tone="red" />
        </>}
      </Cut>

      {/* 10. ten blockchains at once */}
      <Cut t={t} from={cut(14)} to={cut(15)}>
        <Backdrop t={t} tint="#2a0d10" />
        <Network f={f} fps={fps} at={L(14).start} />
        <DataChip f={f} fps={fps} at={W('10', 14)} x={SAFE.cx - 140} y={1230} label="БЛОКЧЕЙНОВ" value="10 РАЗОМ" tone="red" />
      </Cut>

      {/* 11. the case file: North Korea, Lazarus; their record */}
      <Cut t={t} from={cut(15)} to={cut(17)}>
        <Desk t={t} />
        <Paper f={f} fps={fps} at={L(15).start} x={SAFE.left + 30} y={220} w={820} h={520} rot={-2} tape color="#efe6cc">
          <div style={{position: 'absolute', left: 50, top: 50, fontFamily: MONO, fontSize: 34, color: '#6b5f4a', letterSpacing: 3}}>ДЕЛО</div>
          <div style={{position: 'absolute', left: 50, top: 100, fontFamily: MONT, fontWeight: 900, fontSize: 92, color: C.ink}}>LAZARUS</div>
          <div style={{position: 'absolute', left: 50, top: 230, fontFamily: MONO, fontSize: 32, color: '#2a2620', lineHeight: 1.6}}>
            Подразделение: TraderTraitor<br />Уверенность: высокая*<br /><span style={{fontSize: 24, color: '#7a6f5a'}}>* TRM Labs, Chainalysis. Власти пока не подтверждали</span></div>
        </Paper>
        <Stamp f={f} fps={fps} at={W('северная', 15)} x={720} y={300} text="КНДР" kind="red" rot={-8} size={70} />
        {t >= L(16).start - 0.2 && <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(7,11,20,0.92) 46%)'}} />}
        {t >= L(16).start - 0.2 && <Bars f={f} fps={fps} at={L(16).start} rows={[
          {year: '2016', label: 'Банк Бангладеш', value: 0.95, text: 'попытка ≈ $1 млрд', hi: W('бангладеш', 16) - 0.3},
          {year: '2025', label: 'Bybit', value: 1.46, text: '$1,5 млрд'},
          {year: '2026', label: 'Binance', value: 6.3, text: '$6,3 млрд'}]} />}
      </Cut>

      {/* 12. 2016: one typo gave them away */}
      <Cut t={t} from={cut(17)} to={cut(18)}>
        <Desk t={t} />
        <Paper f={f} fps={fps} at={cut(17)} x={SAFE.left} y={480} w={880} h={620} rot={1} color="#f3ecdc" from={200} />
        <Typo t={t} at={cut(17) + 0.15} ringAt={W('опечатка', 17)} />
      </Cut>

      {/* 13. but not everything went to plan: 20:24 -> 21:01 */}
      <Cut t={t} from={cut(18)} to={cut(19)}>
        <Backdrop t={t} tint={t > cut(18) + 2 ? '#0c2c3a' : '#2a0d10'} />
        <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 600, textAlign: 'center', fontFamily: MONO, fontSize: 210, color: '#fff', letterSpacing: 6,
          textShadow: '0 0 40px rgba(143,227,255,0.35)'}}>{`${Math.floor(clockMin / 60)}:${String(clockMin % 60).padStart(2, '0')}`}</div>
        <div style={{position: 'absolute', left: SAFE.left, width: SAFE.right - SAFE.left, top: 880, textAlign: 'center', fontFamily: MONT, fontWeight: 800, fontSize: 34, color: '#8a96b0', letterSpacing: 4}}>UTC · 29 ОКТЯБРЯ</div>
        <Tag f={f} fps={fps} at={cut(18) + 2.3} text="+37 МИНУТ" y={1000} color={M.ice} />
      </Cut>

      {/* 14. digital dollars get frozen: ~$3bn stuck */}
      <Cut t={t} from={cut(19)} to={cut(21)}>
        <Backdrop t={t} tint={t > freezeAt ? '#0c2c3a' : '#16213f'} />
        <CoinStream time={streamT} flow={1} freeze={ramp(t, freezeAt - 0.1, freezeAt + 0.8)} from={[-60, 1000]} to={[1140, 820]} n={80} />
        {t > freezeAt && <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 50% at 50% 50%, rgba(143,227,255,${0.18 * ramp(t, freezeAt, freezeAt + 0.6)}) 0%, rgba(143,227,255,0) 70%)`}} />}
        <div style={{position: 'absolute', left: SAFE.cx - 70, top: 250, opacity: ramp(t, freezeAt - 0.2, freezeAt + 0.3), transform: `rotate(${t * 20}deg)`}}><Icon name="snowflake" size={140} color={M.ice} stroke={1.6} /></div>
        <BigNum f={f} fps={fps} at={W('3', 20) - 0.1} text="≈ $3 МЛРД" y={1150} size={120} color={M.ice} sub="ЗАМОРОЖЕНО" />
      </Cut>

      {/* 15. Binance promises to cover the rest */}
      <Cut t={t} from={cut(21)} to={cut(22)}>
        <Backdrop t={t} tint="#14305a" />
        <Shield f={f} fps={fps} at={L(21).start} />
        <Tag f={f} fps={fps} at={L(21).start + 0.4} text="ОБЕЩАНИЕ БИРЖИ" color="#cfd8ef" y={1100} />
      </Cut>

      {/* 16. then: a tunnel. now: one laptop */}
      <Cut t={t} from={cut(22)} to={cut(23)}>
        <AbsoluteFill style={{background: M.bg}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: 540, height: 1920, overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: -270, top: 0, width: 1080, height: 1920, transform: 'scale(0.82)', transformOrigin: '50% 50%'}}><Tunnel t={t} p={1} /></div>
        </div>
        <div style={{position: 'absolute', left: 540, top: 0, width: 540, height: 1920, overflow: 'hidden', clipPath: `inset(0 0 0 ${100 - 100 * ramp(t, W('теперь', 22) - 0.2, W('теперь', 22) + 0.3)}%)`}}>
          <div style={{position: 'absolute', left: -270, top: 0, width: 1080, height: 1920, transform: 'scale(0.82)', transformOrigin: '50% 50%'}}><Laptop t={t} t0={cut(22)} /></div>
        </div>
        <div style={{position: 'absolute', left: 538, top: 0, width: 4, height: 1920, background: M.gold}} />
        <Tag f={f} fps={fps} at={L(22).start} text="ТОГДА" x={290} y={SAFE.top + 60} />
        <Tag f={f} fps={fps} at={W('теперь', 22)} text="СЕЙЧАС" x={760} y={SAFE.top + 60} color={M.red} />
      </Cut>

      {/* 17. a dream-job offer with a file: check who is writing first */}
      <Cut t={t} from={cut(23)} to={cut(25)}>
        <Backdrop t={t} />
        <Offer t={t} t0={cut(23)} stopAt={W('проверь', 24)} />
        <Stamp f={f} fps={fps} at={W('проверь', 24)} x={SAFE.cx} y={1180} text="СНАЧАЛА ПРОВЕРЬ, КТО ПИШЕТ" kind="paper" rot={-5} size={46} />
      </Cut>

      {/* 18. ending: comment prompt + subscribe */}
      <Cut t={t} from={cut(25)} to={1e9}>
        <Backdrop t={t} tint="#2a2208" />
        <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.5}}>
          {[[120, 10], [300, 16], [480, 24], [660, 14], [840, 8]].map(([x, n], i) => <MoneyTower key={i} x={x - 60} base={1500} n={n} p={1} w={120} />)}
        </svg>
        <AbsoluteFill style={{background: 'rgba(7,11,20,0.55)'}} />
        <BigNum f={f} fps={fps} at={L(25).start} text="≈ $3,3 МЛРД" y={360} size={110} sub="НЕ ЗАМОРОЖЕНЫ" />
        <div style={{position: 'absolute', inset: 0, opacity: 1 - ramp(t, NL[3].start - 1.0, NL[3].start - 0.45)}}>
        <CommentBubble f={f} fps={fps} at={L(25).start + 0.5} text="Думаю, найдут, потому что…" x={SAFE.left + 20} y={760} />
        {(() => {
          const p = spring01(f, (L(25).start + 1.4) * fps, fps, 2, 0.5), flip = clamp((t - L(25).start - 2.6) / 0.25);
          return p > 0 ? <div style={{position: 'absolute', left: SAFE.cx, top: 1000, transform: `translateX(-50%) scale(${clamp(p)})`, display: 'flex', gap: 20, alignItems: 'center'}}>
            <div style={{background: flip < 0.5 ? C.red : '#3a3f4a', color: '#fff', fontFamily: MONT, fontWeight: 900, fontSize: 40, padding: '20px 44px', borderRadius: 50}}>{flip < 0.5 ? 'ПОДПИСАТЬСЯ' : 'ВЫ ПОДПИСАНЫ'}</div>
            <div style={{width: 84, height: 84, borderRadius: 42, background: flip < 0.5 ? '#3a3f4a' : M.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `rotate(${flip >= 0.5 ? wobble(f * 0.6, 1) * 14 : 0}deg)`}}><Icon name="bell" size={44} color="#fff" /></div>
          </div> : null;
        })()}
        </div>
      </Cut>

      <NitkaInsert t={t} />
      <Grain f={f} k={0.06} />
      {t < SUBS_END && <CaseSubs lines={SUBS} f={f} fps={fps} total={voice.total} tone={(i) => SUBS[i].who < 0 ? 'red' : TONE[SUBS[i].who] ?? 'white'} />}
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
