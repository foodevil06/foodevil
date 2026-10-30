// Sets added in «Курьер уже внутри», part 3 «Я и есть доставка» (the finale): the two of you in the dark hallway with
// the phone glowing on the floor between you and dust in the light from the corridor; the double's face close (it
// "swims" for a moment); the old wardrobe from the front (ajar, cold light in the gap, an eye); your hand on its handle;
// the inside, deeper than a wardrobe can be, and the old face in it; the closing titles. Flat, cold, low-key like
// Vnutri.tsx / VnutriHall.tsx; every value is a pure function of time.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, mulberry32, wobble} from '../lib/anim';
import {MONT, SAFE} from './Kit';
import {V} from './Vnutri';
import {Back, LowKey, Person, PersonSpec} from './VnutriHall';

// dust drifting in a slanted beam of light from the corridor
export const Dust: React.FC<{t: number; n?: number; x0?: number; x1?: number; k?: number}> = ({t, n = 46, x0 = 120, x1 = 760, k = 1}) => {
  const r = mulberry32(5);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', pointerEvents: 'none'}}>
      <defs><linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#cfd8e6" stopOpacity={0.16 * k} /><stop offset="1" stopColor="#cfd8e6" stopOpacity="0" /></linearGradient></defs>
      <path d={`M ${x0 - 120} 0 L ${x0 + 120} 0 L ${x1 + 220} 1920 L ${x1 - 180} 1920 Z`} fill="url(#beam)" />
      {Array.from({length: n}, (_, i) => {
        const u = r(), v = r(), sp = 0.01 + r() * 0.02, ph = r() * 6;
        const yy = ((v + t * sp) % 1) * 1920, xx = lerp(x0, x1, yy / 1920) + (u - 0.5) * 260 + Math.sin(t * 0.6 + ph) * 18;
        return <circle key={i} cx={xx} cy={yy} r={1.2 + r() * 2.4} fill="#e6edf7" opacity={(0.25 + 0.5 * r()) * k} />;
      })}
    </svg>
  );
};

// the two of you: you from behind (left, close), him facing you, the phone glowing on the floor between you
export const TwoShot: React.FC<{t: number; smirk: number; glint: number; talk?: number; push?: number}> = ({t, smirk, glint, talk = 0, push = 0}) => (
  <AbsoluteFill style={{transform: `scale(${1 + 0.25 * push})`, transformOrigin: '600px 900px'}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect width={1080} height={1920} fill={V.black} />
      <rect x={0} y={1180} width={1080} height={740} fill={V.floor} />
      <rect x={0} y={0} width={1080} height={1180} fill="#121519" />
      <rect x={760} y={420} width={300} height={760} fill="#0d0f13" /><rect x={780} y={440} width={260} height={740} fill="#1a1e25" />
      {/* the phone on the floor between you: «ДОСТАВКА ЗАВЕРШЕНА» */}
      <ellipse cx={560} cy={1420} rx={260} ry={70} fill="#8fb4ff" opacity={0.12} />
      <path d="M 500 1440 L 610 1404 L 680 1424 L 570 1462 Z" fill="#0a0c10" stroke="#2a2f38" strokeWidth={3} />
      <path d="M 512 1438 L 608 1408 L 666 1424 L 572 1456 Z" fill="#b9c8e0" opacity={0.8} />
      <Person id="two-dbl" x={640} y={760} s={0.92} phone="none" glow={0} smirk={smirk} glint={glint} talk={talk} full />
      <Back x={250} y={1240} s={1.45} phone={false} />
    </svg>
    <Dust t={t} x0={60} x1={720} k={0.9} />
    <LowKey x={620} y={760} r={70} k={0.86} />
  </AbsoluteFill>
);

// his face, close; warp 0..1 makes it swim (as if something moves under the skin)
export const FaceClose: React.FC<{t: number; f: number; warp: number; glint: number; talk?: number; smirk?: number; person?: Partial<PersonSpec>; blur?: number}> =
  ({t, f, warp, glint, talk = 0, smirk = 0.3, person = {}, blur = 1}) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <filter id="face-warp" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.018" numOctaves={2} seed={f % 7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={warp * 90} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <rect width={1080} height={1920} fill="#07080a" />
      <g opacity={0.6} style={{filter: `blur(${10 * blur}px)`}}>
        <rect x={720} y={300} width={360} height={1300} fill="#1a1e25" /><rect x={0} y={1400} width={1080} height={520} fill="#0f1114" />
      </g>
      <g filter={warp > 0.01 ? 'url(#face-warp)' : undefined} transform={`translate(${wobble(t * 0.4, 3) * 6} 0)`}>
        <Person id="face" x={540} y={1180} s={3.1} phone="chest" glow={1} smirk={smirk} glint={glint} talk={talk} {...person} />
      </g>
    </svg>
    <LowKey x={540} y={860} r={62} k={0.9} />
  </AbsoluteFill>
);

// the old wardrobe from the front: ajar 0..1 opens the right door a few centimetres, light is the cold glow in the gap,
// shake trembles the doors, eye shows an eye in the gap, edge 0..1 brings his lit silhouette in at the left edge
export const WardrobeFront: React.FC<{t: number; ajar: number; light: number; shake?: number; eye?: number; edge?: number; zoom?: number}> =
  ({t, ajar, light, shake = 0, eye = 0, edge = 0, zoom = 1}) => {
  const gap = 6 + 46 * ajar, jx = wobble(t * 34, 1) * 4 * shake;
  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 900px'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs><linearGradient id="wf-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1d1a17" /><stop offset="0.5" stopColor="#26221d" /><stop offset="1" stopColor="#1b1815" /></linearGradient></defs>
        <rect width={1080} height={1920} fill="#111317" />
        <rect y={1640} width={1080} height={280} fill="#0c0d10" />
        <rect x={170} y={220} width={740} height={1440} fill="#0f0e0c" />
        <rect x={150} y={200} width={780} height={60} fill="#221e1a" />
        {/* the cold light from inside, through the gap */}
        <rect x={540 - gap / 2} y={290} width={gap} height={1330} fill="#a9c2e6" opacity={0.25 + 0.5 * light} />
        <ellipse cx={540} cy={1660} rx={140 + 120 * ajar} ry={30} fill="#a9c2e6" opacity={0.18 * light} />
        {/* the eye in the gap */}
        {eye > 0 && <g opacity={eye}>
          <rect x={540 - gap / 2} y={760} width={gap} height={90} fill="#050505" />
          <ellipse cx={540} cy={805} rx={Math.min(30, gap / 2 - 1)} ry={17} fill="#d9d6cc" />
          <circle cx={540} cy={805} r={11} fill="#141414" /><circle cx={544} cy={800} r={3} fill="#fff" />
        </g>}
        {/* left door, right door (opens by the gap) */}
        <g transform={`translate(${jx} 0)`}>
          <rect x={190} y={280} width={350 - gap / 2} height={1360} fill="url(#wf-wood)" />
          <rect x={230} y={340} width={270 - gap / 2} height={560} fill="none" stroke="#16130f" strokeWidth={10} />
          <rect x={230} y={960} width={270 - gap / 2} height={600} fill="none" stroke="#16130f" strokeWidth={10} />
          <rect x={500 - gap / 2} y={860} width={14} height={110} rx={6} fill="#4a4740" />
        </g>
        <g transform={`translate(${-jx + gap / 2} 0)`}>
          <rect x={540} y={280} width={350 - gap / 2} height={1360} fill="url(#wf-wood)" />
          <rect x={580} y={340} width={270 - gap / 2} height={560} fill="none" stroke="#16130f" strokeWidth={10} />
          <rect x={580} y={960} width={270 - gap / 2} height={600} fill="none" stroke="#16130f" strokeWidth={10} />
          <rect x={566} y={860} width={14} height={110} rx={6} fill="#4a4740" />
        </g>
      </svg>
      {edge > 0 && <svg width={1080} height={1920} style={{position: 'absolute', opacity: edge}}>
        <Person id="ward-dbl" x={lerp(-260, -60, easeInOut(edge))} y={760} s={1.5} phone="chest" glow={1} smirk={0.4} />
      </svg>}
      <LowKey x={540} y={900} r={66} k={0.88} />
    </AbsoluteFill>
  );
};

// your hand on the wardrobe handle (fingers tremble), then the door opens away into the dark
export const HandOnHandle: React.FC<{t: number; tremble: number; open: number}> = ({t, tremble, open}) => {
  const o = easeInOut(open), tx = wobble(t * 26, 4) * 5 * tremble, ty = wobble(t * 23, 8) * 4 * tremble;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs><linearGradient id="hh-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2a251f" /><stop offset="1" stopColor="#1b1815" /></linearGradient></defs>
        <rect width={1080} height={1920} fill="#020203" />
        {/* the door swings away: it narrows towards its hinge on the right, the black inside grows on the left */}
        <g transform={`translate(1080 0) scale(${1 - 0.86 * o} 1) translate(-1080 0)`}>
          <rect x={0} y={0} width={1080} height={1920} fill="url(#hh-wood)" />
          {Array.from({length: 14}, (_, i) => <path key={i} d={`M 0 ${i * 150 + 40} C 360 ${i * 150 + 20} 700 ${i * 150 + 70} 1080 ${i * 150 + 50}`} stroke="#15120e" strokeWidth={4} fill="none" />)}
          <rect x={380} y={620} width={56} height={520} rx={24} fill="#4a4740" /><rect x={392} y={630} width={14} height={500} rx={7} fill="#7a766c" opacity={0.6} />
        </g>
        {/* the hand: back of the hand, four fingers around the handle */}
        <g transform={`translate(${tx + 410 - 900 * o} ${ty + 880}) rotate(${-8 - 30 * o})`} opacity={1 - clamp((o - 0.5) * 3)}>
          <path d="M 420 -120 C 260 -150 120 -110 60 -60 L 60 160 C 140 200 300 210 440 170 Z" fill="#9a9fa8" />
          {[-90, -20, 50, 120].map((yy, i) => <g key={i}>
            <rect x={-30} y={yy - 30 + i * 2} width={130} height={58} rx={29} fill={i % 2 ? '#8c919a' : '#959aa3'} />
            <ellipse cx={-14} cy={yy - 2 + i * 2} rx={16} ry={20} fill="#b4b9c1" />
          </g>)}
          <path d="M 420 -120 C 260 -150 120 -110 60 -60 L 60 160" fill="none" stroke="#2a2d33" strokeWidth={3} opacity={0.5} />
          <rect x={300} y={-160} width={700} height={360} fill="#262c36" />
        </g>
      </svg>
      <LowKey x={500} y={900} r={70} k={0.85} />
    </AbsoluteFill>
  );
};

// inside the wardrobe: darker and deeper than it should be (frames recede far away); face 0..1 throws the old face at you
export const Inside: React.FC<{t: number; depth: number; face: number; faceS?: number}> = ({t, depth, face, faceS = 2.8}) => (
  <AbsoluteFill>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <rect width={1080} height={1920} fill="#010102" />
      {Array.from({length: 12}, (_, i) => {
        const z = (i + (depth * 4) % 1) / 12, s = Math.pow(1 - z, 2.2);
        return <rect key={i} x={540 - 520 * s} y={900 - 860 * s} width={1040 * s} height={1720 * s} fill="none" stroke="#1d2027" strokeWidth={6 * s + 1} opacity={0.15 + 0.6 * (1 - z) * clamp(depth * 3)} />;
      })}
      <ellipse cx={540} cy={900} rx={60} ry={100} fill="#a9c2e6" opacity={0.05} />
      {face > 0 && <g opacity={face}><Person id="old" x={540} y={1140} s={faceS} phone="chest" glow={1} age={1} glint={0.6} /></g>}
    </svg>
    <LowKey x={540} y={900} r={58} k={0.9} />
  </AbsoluteFill>
);

// closing titles: "КУРЬЕР УЖЕ ВНУТРИ" / "ФИНАЛ"
export const FinalCard: React.FC<{k: number}> = ({k}) => (
  <AbsoluteFill style={{background: V.black, alignItems: 'center', justifyContent: 'center', paddingRight: 1080 - 2 * SAFE.cx, paddingBottom: 200}}>
    <div style={{opacity: k, fontFamily: MONT, fontWeight: 900, fontSize: 70, color: '#e8ecf2', letterSpacing: 2, textAlign: 'center', lineHeight: 1.1}}>КУРЬЕР<br />УЖЕ ВНУТРИ</div>
    <div style={{opacity: easeOut(k * 1.4 - 0.4), fontFamily: MONT, fontWeight: 900, fontSize: 64, color: V.red, letterSpacing: 10, marginTop: 30, textShadow: '0 0 30px rgba(226,59,59,0.5)'}}>ФИНАЛ</div>
  </AbsoluteFill>
);
