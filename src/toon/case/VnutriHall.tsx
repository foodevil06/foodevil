// Sets added in «Курьер уже внутри», part 2 «За дверью стою я»: the front door from inside (handle, chain, the light
// under it), the incoming call from your own number, the hero (front and back, the same hoodie on the double), the TV
// with his reflection, the doormat with the key, the dark flat behind you, the fallen phone. Same flat cold look as
// Vnutri.tsx: low-key light from the phone screen, red only on the key details. Every value is a pure function of time.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, mulberry32, wobble} from '../lib/anim';
import {MONT, SAFE, UI} from './Kit';
import {Icon} from '../ui/Icons';
import {V, Phone, Notif} from './Vnutri';

const HOOD = '#262c36', HOOD2 = '#1b2028', SKIN = '#2f3238', LIT = '#b9c5d6', HAIR = '#111317';

// low-key light: everything outside a soft pool goes to black
export const LowKey: React.FC<{x?: number; y?: number; r?: number; k?: number}> = ({x = 540, y = 900, r = 70, k = 0.88}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse ${r}% ${r * 0.62}% at ${x / 10.8}% ${y / 19.2}%, rgba(0,0,0,0) 35%, rgba(0,0,0,${k}) 100%)`, pointerEvents: 'none'}} />
);

// ---------- the hero, front view (also the double and the reflection) ----------
// neck at (x, y); phone: 'ear' (held to the right ear, lights that side of the face), 'chest' (held low, lights the face
// from below), 'none'. smile 0..1 is the reflection's grin, talk 0..1 opens the lips, look -1..1 turns the face a little.
export type PersonSpec = {id: string; x: number; y: number; s?: number; phone?: 'ear' | 'chest' | 'none'; glow?: number; smile?: number; talk?: number; look?: number; full?: boolean};
export const Person: React.FC<PersonSpec> = ({id, x, y, s = 1, phone = 'none', glow = 1, smile = 0, talk = 0, look = 0, full = false}) => {
  const lx = look * 14;
  // low-key: the screen lights only the cheek by the ear, or only the chin and the underside of the nose from below
  const light = phone === 'ear' ? {cx: 140, cy: -105, r: 125} : phone === 'chest' ? {cx: 0, cy: 0, r: 118} : {cx: 0, cy: -300, r: 10};
  const eyeLit = phone === 'chest' ? 0.22 : 0.35 + 0.65 * glow;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id={`${id}-face`}><ellipse cx={0} cy={-120} rx={82} ry={104} /></clipPath>
        <radialGradient id={`${id}-lit`} cx={light.cx} cy={light.cy} r={light.r} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={LIT} stopOpacity={0.95 * glow} /><stop offset="1" stopColor={LIT} stopOpacity="0" />
        </radialGradient>
      </defs>
      {full && <>
        {[-1, 1].map((k) => <path key={k} d={`M ${k * 20} 540 L ${k * 150} 540 L ${k * 130} 1150 L ${k * 40} 1150 Z`} fill="#15181e" />)}
        {[-1, 1].map((k) => <ellipse key={k} cx={k * 88} cy={1162} rx={70} ry={26} fill="#0b0c0f" />)}
      </>}
      {/* hood lying on the shoulders, torso, kangaroo pocket, the light drawstrings (the same on the double) */}
      <ellipse cx={0} cy={-30} rx={130} ry={80} fill={HOOD2} />
      <path d="M -200 560 L -205 120 C -200 50 -120 20 -60 10 L 60 10 C 120 20 200 50 205 120 L 200 560 Z" fill={HOOD} />
      <path d="M -110 400 L 110 400 L 130 520 L -130 520 Z" fill={HOOD2} />
      {[-1, 1].map((k) => <g key={k}><line x1={k * 22} y1={30} x2={k * 27} y2={150} stroke="#9aa3b0" strokeWidth={5} /><rect x={k * 27 - 4} y={150} width={8} height={18} rx={3} fill="#c9ced6" /></g>)}
      {/* arms */}
      {phone === 'none' && [-1, 1].map((k) => <path key={k} d={`M ${k * 190} 90 C ${k * 235} 250 ${k * 235} 420 ${k * 220} 560`} stroke={HOOD} strokeWidth={78} fill="none" strokeLinecap="round" />)}
      {phone === 'ear' && <>
        <path d="M -190 90 C -235 250 -235 420 -220 560" stroke={HOOD} strokeWidth={78} fill="none" strokeLinecap="round" />
        <path d="M 190 90 C 250 230 250 330 230 340 C 200 300 150 150 112 -70" stroke={HOOD} strokeWidth={76} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>}
      {phone === 'chest' && [-1, 1].map((k) => <path key={k} d={`M ${k * 190} 90 C ${k * 240} 260 ${k * 230} 330 ${k * 60} 300`} stroke={HOOD} strokeWidth={76} fill="none" strokeLinecap="round" />)}
      {/* head */}
      <ellipse cx={-84} cy={-118} rx={14} ry={24} fill={SKIN} /><ellipse cx={84} cy={-118} rx={14} ry={24} fill={SKIN} />
      <rect x={-40} y={-40} width={80} height={60} fill={SKIN} />
      <ellipse cx={0} cy={-120} rx={82} ry={104} fill={SKIN} />
      <g clipPath={`url(#${id}-face)`}><rect x={-100} y={-240} width={200} height={260} fill={`url(#${id}-lit)`} /></g>
      <path d="M -86 -118 C -92 -238 92 -238 86 -118 C 74 -170 30 -186 -10 -176 C -40 -170 -70 -160 -86 -118 Z" fill={HAIR} />
      <g transform={`translate(${lx} 0)`}>
        {[-1, 1].map((k) => <g key={k}>
          <path d={`M ${k * 30 - 16} -152 Q ${k * 30} ${-158} ${k * 30 + 16} -151`} stroke="#0c0d10" strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={k * 30} cy={-128} rx={11} ry={6} fill="#0a0b0d" />
          <circle cx={k * 30 + 3} cy={-130} r={2.4} fill="#dfe8f5" opacity={eyeLit} />
        </g>)}
        <path d="M -2 -120 L 8 -92 L -6 -88" stroke="#16181c" strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={0.7} />
        <path d="M -22 -64 Q 0 -61 22 -64" stroke="#141518" strokeWidth={4} fill="none" strokeLinecap="round" opacity={1 - smile} />
        {talk > 0 && smile < 0.5 && <ellipse cx={0} cy={-62} rx={14} ry={2 + 7 * talk} fill="#08090a" />}
        {smile > 0 && <g opacity={smile}>
          <path d="M -46 -76 Q 0 -26 46 -76 Q 0 -50 -46 -76 Z" fill="#d6d2c8" stroke="#0a0b0c" strokeWidth={3} />
          <path d="M -46 -76 Q -54 -86 -50 -92 M 46 -76 Q 54 -86 50 -92" stroke="#0a0b0c" strokeWidth={3} fill="none" />
        </g>}
      </g>
      {/* the phone */}
      {phone === 'ear' && <g transform="translate(104 -120) rotate(-12)">
        <rect x={-16} y={-70} width={32} height={128} rx={8} fill="#050608" />
        <rect x={-18} y={-72} width={4} height={132} fill={LIT} opacity={0.6 * glow} />
        <ellipse cx={0} cy={24} rx={30} ry={38} fill={SKIN} />
      </g>}
      {phone === 'chest' && <g transform="translate(0 255)">
        <rect x={-48} y={-90} width={96} height={180} rx={14} fill="#050608" />
        <ellipse cx={0} cy={-100} rx={110} ry={40} fill={LIT} opacity={0.22 * glow} />
        {[-1, 1].map((k) => <ellipse key={k} cx={k * 52} cy={20} rx={26} ry={34} fill={SKIN} />)}
      </g>}
    </g>
  );
};

// the hero from behind (over-the-shoulder shots); turn 0..1 shows the edge of his face
export const Back: React.FC<{x: number; y: number; s?: number; phone?: boolean; glow?: number; turn?: number}> = ({x, y, s = 1, phone = true, glow = 1, turn = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -210 600 L -215 140 C -205 50 -120 10 -60 0 L 60 0 C 120 10 205 50 215 140 L 210 600 Z" fill={HOOD} stroke="#3b4351" strokeWidth={6} />
    <path d="M -120 20 C -110 110 110 110 120 20 C 80 -10 -80 -10 -120 20 Z" fill={HOOD2} />
    <path d="M -190 90 C -235 250 -235 420 -220 600" stroke={HOOD} strokeWidth={80} fill="none" strokeLinecap="round" />
    {phone && <path d="M 190 90 C 250 230 250 330 230 340 C 200 300 150 150 110 -80" stroke={HOOD} strokeWidth={78} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    <ellipse cx={0} cy={-120} rx={84} ry={104} fill={HAIR} stroke="#353c48" strokeWidth={5} />
    {turn > 0 && <path d={`M ${84 - 50 * turn} -60 C ${96 - 30 * turn} -100 ${96 - 30 * turn} -150 ${80 - 40 * turn} -190 L 70 -190 L 70 -40 Z`} fill={SKIN} opacity={clamp(turn * 1.5)} />}
    <ellipse cx={-84} cy={-118} rx={12} ry={22} fill="#1a1c20" />
    {phone && <>
      <rect x={96} y={-200} width={20} height={120} rx={6} fill="#050608" transform="rotate(-10 106 -140)" />
      <ellipse cx={112} cy={-140} rx={34} ry={70} fill={LIT} opacity={0.14 * glow} />
    </>}
  </g>
);

// ---------- the front door from inside ----------
// handle 0..1 presses the lever down, chain 0..1 pulls the chain taut while the door gives a little (a sliver of the
// landing light at the lock edge), rattle shakes it, flex is a knock pulse, feet puts two shadows into the light under it
export const FrontDoor: React.FC<{t: number; handle?: number; chain?: number; rattle?: number; flex?: number; feet?: number; zoom?: number; fx?: number; fy?: number}> =
  ({t, handle = 0, chain = 0, rattle = 0, flex = 0, feet = 0, zoom = 1, fx = 540, fy = 1000}) => {
  const jx = wobble(t * 40, 2) * 4 * rattle + wobble(t * 60, 9) * 6 * flex, jy = wobble(t * 37, 5) * 2 * rattle;
  const gap = 4 + 22 * easeInOut(chain);
  const sag = 140 * (1 - easeInOut(chain));
  const links = Array.from({length: 16}, (_, i) => {
    const u = i / 15, ax = 712, ay = 760, bx = 900 + gap, by = 770;
    return {x: lerp(ax, bx, u) + wobble(t * 25, i) * 2 * rattle, y: lerp(ay, by, u) + sag * 4 * u * (1 - u)};
  });
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="fd-slab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1e25" /><stop offset="0.6" stopColor="#252b34" /><stop offset="1" stopColor="#1d2128" /></linearGradient>
      </defs>
      <g transform={`translate(${fx} ${fy}) scale(${zoom}) translate(${-fx} ${-fy})`}>
        <rect x={-400} y={-400} width={1880} height={2720} fill={V.wall2} />
        <rect x={-400} y={1720} width={1880} height={600} fill="#0e1013" />
        {/* the landing light in the gap at the lock edge (the door gives inwards on the chain) */}
        <rect x={900} y={262} width={gap} height={1440} fill="#cfd8e6" opacity={0.08 + 0.5 * easeInOut(chain)} />
        <rect x={168} y={228} width={744} height={1494} fill="#0b0d10" />
        <g transform={`translate(${jx} ${jy}) translate(540 980) scale(${1 + 0.006 * flex}) translate(-540 -980)`}>
          <rect x={196} y={256} width={704} height={1446} fill="url(#fd-slab)" />
          {[[250, 320, 600, 560], [250, 940, 600, 700]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} rx={6} fill="none" stroke="#161a20" strokeWidth={10} />)}
          {/* peephole */}
          <circle cx={548} cy={600} r={16} fill="#0a0b0d" stroke="#3d434d" strokeWidth={5} />
          {/* lock and lever handle (rotates down around its rose) */}
          <rect x={782} y={1060} width={22} height={50} rx={6} fill="#3a3f48" />
          <g transform={`translate(793 1000) rotate(${-34 * handle})`}>
            <circle r={28} fill="#4b515b" />
            <rect x={-170} y={-11} width={176} height={22} rx={11} fill="#6a717c" />
            <rect x={-170} y={-11} width={176} height={6} rx={3} fill="#9aa1ab" opacity={0.5} />
          </g>
          {/* chain: slider plate on the door */}
          <rect x={660} y={748} width={110} height={22} rx={6} fill="#3a3f48" />
        </g>
        {/* chain plate on the frame and the links */}
        <rect x={902 + gap} y={752} width={34} height={40} rx={6} fill="#3a3f48" />
        {links.map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx={9} ry={6} fill="none" stroke="#8a919c" strokeWidth={4} transform={`rotate(${i % 2 ? 70 : 0} ${p.x} ${p.y})`} />)}
        {/* the light under the door, and two shadows of feet in it */}
        <rect x={196} y={1702} width={704} height={10} fill="#cfd8e6" opacity={0.55} />
        {feet > 0 && [440, 600].map((x, i) => <rect key={i} x={x} y={1700} width={90} height={14} fill="#05060a" opacity={feet} />)}
        <ellipse cx={548} cy={1760} rx={420} ry={40} fill="#cfd8e6" opacity={0.05} />
      </g>
    </svg>
  );
};

// ---------- incoming call from your own number ----------
// s = phone width / 400; markAt shows "ваш номер", acceptAt turns it into a running call, glitch tears the number
export const CallContent: React.FC<{s: number; t: number; markAt: number; acceptAt: number; glitch?: number}> = ({s, t, markAt, acceptAt, glitch = 0}) => {
  const on = t >= acceptAt, sec = Math.max(0, Math.floor(t - acceptAt));
  const num = '+7 9•• •••-23-47';
  const g = glitch > 0.05 ? Math.round(wobble(t * 90, 3) * 14 * glitch) : 0;
  return (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1a2231 0%, #0b0e14 75%)', color: '#fff', textAlign: 'center', fontFamily: UI}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120 * s, fontSize: 20 * s, color: '#8f9aab'}}>{on ? `0:${String(sec).padStart(2, '0')}` : 'входящий вызов'}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160 * s, fontSize: 40 * s, fontWeight: 700, letterSpacing: 1 * s, whiteSpace: 'nowrap'}}>
        {g !== 0 && <span style={{position: 'absolute', left: 0, right: 0, transform: `translateX(${g * s}px)`, color: 'rgba(226,59,59,0.8)'}}>{num}</span>}
        <span style={{position: 'relative'}}>{num}</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 220 * s, opacity: clamp((t - markAt) / 0.2)}}>
        <span style={{fontSize: 18 * s, fontWeight: 800, color: '#fff', background: V.red, borderRadius: 8 * s, padding: `${4 * s}px ${12 * s}px`, letterSpacing: 2 * s}}>ВАШ НОМЕР</span>
      </div>
      <div style={{position: 'absolute', left: '50%', top: 300 * s, width: 150 * s, height: 150 * s, marginLeft: -75 * s, borderRadius: '50%', background: '#2a3240',
        display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="user" size={80 * s} color="#8f9aab" stroke={1.6} /></div>
      {!on ? <div style={{position: 'absolute', left: 50 * s, right: 50 * s, bottom: 90 * s, display: 'flex', justifyContent: 'space-between'}}>
        {[['#c4383a', 'x'], ['#3b7d5e', 'phone-call']].map(([c, ic], i) => <div key={i} style={{width: 92 * s, height: 92 * s, borderRadius: '50%', background: c,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transform: i ? `scale(${1 + 0.06 * Math.sin(t * 9)})` : undefined}}><Icon name={ic} size={44 * s} color="#fff" stroke={2.4} /></div>)}
      </div> : <div style={{position: 'absolute', left: '50%', bottom: 90 * s, width: 92 * s, height: 92 * s, marginLeft: -46 * s, borderRadius: '50%', background: '#c4383a',
        display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon name="x" size={44 * s} color="#fff" stroke={2.4} /></div>}
    </div>
  );
};

// ---------- medium shot in the hallway: the hero between the door and the phone; orbit -1..1 circles him ----------
export const HallStage: React.FC<{t: number; orbit: number; person: Omit<PersonSpec, 'x' | 'y' | 'id'>; door?: number}> = ({t, orbit, person, door = 0}) => {
  const bx = -orbit * 240, px = orbit * 50;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(${bx} 0)`}>
          <rect x={-400} y={0} width={1880} height={1920} fill="#14171c" />
          <rect x={-400} y={1500} width={1880} height={420} fill="#0f1114" />
          {/* wardrobe (left), nightstand, front door (right) with the light under it */}
          <rect x={-60} y={360} width={360} height={1140} fill="#1a1e25" /><line x1={120} y1={380} x2={120} y2={1480} stroke="#0b0d10" strokeWidth={6} />
          <circle cx={100} cy={930} r={8} fill="#4b515b" /><circle cx={140} cy={930} r={8} fill="#4b515b" />
          <rect x={380} y={1200} width={170} height={300} fill="#1c1916" /><rect x={370} y={1190} width={190} height={14} fill="#26221e" />
          <rect x={720} y={380} width={360} height={1120} fill="#0b0d10" /><rect x={740} y={400} width={320} height={1100} fill="#20252d" />
          <path d={`M 1010 960 l ${-120 * Math.cos(0.6 * door)} ${120 * Math.sin(0.6 * door)}`} stroke="#6a717c" strokeWidth={18} strokeLinecap="round" />
          <rect x={740} y={1494} width={320} height={8} fill="#cfd8e6" opacity={0.5} />
        </g>
        <Person id="hall" x={540 + px} y={830} s={1.32} look={-orbit * 0.5} {...person} />
      </svg>
      <LowKey x={600} y={720} r={62} k={0.9} />
    </AbsoluteFill>
  );
};

// ---------- over the shoulder: the black TV screen and his reflection, which grins for a moment ----------
export const TvShot: React.FC<{t: number; smile: number; crack: number; flash: number}> = ({t, smile, crack, flash}) => {
  const r = mulberry32(11);
  const cx = 660, cy = 640;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs>
          <clipPath id="tv-scr"><rect x={164} y={474} width={752} height={420} /></clipPath>
          <linearGradient id="tv-gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1a1f27" /><stop offset="0.5" stopColor="#0b0d10" /><stop offset="1" stopColor="#111419" /></linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="#101317" />
        <rect x={150} y={460} width={780} height={448} rx={8} fill="#060708" />
        <rect x={164} y={474} width={752} height={420} fill="url(#tv-gl)" />
        <g clipPath="url(#tv-scr)">
          {/* the reflection: the hero facing the screen (he stands still; only the reflection grins) */}
          <g opacity={0.45 + 0.4 * smile} style={{filter: 'grayscale(1)'}}><Person id="refl" x={440} y={860} s={0.86} phone="ear" glow={0.6 + 0.4 * smile} smile={smile} /></g>
          <path d="M 164 474 L 520 474 L 300 894 L 164 894 Z" fill="#ffffff" opacity={0.035} />
          {crack > 0 && <g stroke="#8a95a6" strokeWidth={2} opacity={0.7 * crack} fill="none">
            {Array.from({length: 9}, (_, i) => { const a = i * 0.7 + r(), l = 60 + r() * 140; return <path key={i} d={`M ${cx} ${cy} l ${Math.cos(a) * l * 0.5} ${Math.sin(a) * l * 0.5} l ${Math.cos(a + 0.3) * l * 0.5} ${Math.sin(a + 0.3) * l * 0.5}`} />; })}
            <circle cx={cx} cy={cy} r={26} />
          </g>}
          {flash > 0 && <circle cx={cx} cy={cy} r={40 + 200 * (1 - flash)} fill="#dfe8f5" opacity={0.25 * flash} />}
        </g>
        <rect x={420} y={908} width={240} height={30} fill="#0b0c0f" /><rect x={240} y={938} width={600} height={160} fill="#16191e" />
        {/* the hero in the foreground, back to us, phone at his ear */}
        <Back x={300} y={1330} s={1.75} phone glow={0.8} />
      </svg>
      <LowKey x={540} y={760} r={75} k={0.85} />
    </AbsoluteFill>
  );
};

// ---------- looking down at the doormat: lift raises it, the key lies underneath; glint 0..1 ----------
export const Doormat: React.FC<{t: number; lift: number; glint: number; take?: number}> = ({t, lift, glint, take = 0}) => {
  const l = easeInOut(lift);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect width={1080} height={1920} fill="#16191d" />
        {Array.from({length: 10}, (_, i) => <line key={`h${i}`} x1={0} x2={1080} y1={260 + i * 180} y2={260 + i * 180} stroke="#0e1013" strokeWidth={4} />)}
        {Array.from({length: 7}, (_, i) => <line key={`v${i}`} x1={i * 180 + 90} x2={i * 180 + 90} y1={260} y2={1920} stroke="#0e1013" strokeWidth={4} />)}
        {/* bottom of the front door with the light under it */}
        <rect x={0} y={0} width={1080} height={250} fill="#1f242c" /><rect x={0} y={244} width={1080} height={10} fill="#cfd8e6" opacity={0.55} />
        {/* the key */}
        <g transform={`translate(500 ${900 - 500 * easeInOut(take)}) rotate(${-14 + 20 * take})`} opacity={1 - clamp((take - 0.7) / 0.3)}>
          <circle cx={-110} cy={0} r={42} fill="none" stroke="#8d949e" strokeWidth={18} />
          <rect x={-72} y={-10} width={200} height={20} rx={6} fill="#8d949e" />
          <path d="M 70 10 L 70 34 L 88 34 L 88 22 L 104 22 L 104 38 L 128 38 L 128 10 Z" fill="#8d949e" />
          <rect x={-72} y={-10} width={200} height={6} fill="#c7ccd3" opacity={0.6} />
          <g transform="translate(-130 -30)" opacity={glint}>
            <path d="M 0 -40 L 6 -6 L 40 0 L 6 6 L 0 40 L -6 6 L -40 0 L -6 -6 Z" fill="#eef3fb" />
          </g>
        </g>
        {/* the mat, lifted from its near edge */}
        <g transform={`translate(540 ${1100 - 380 * l}) rotate(${-7 * l}) scale(1 ${1 - 0.35 * l}) translate(-540 -1100)`}>
          <rect x={210} y={620} width={660} height={460} rx={24} fill="#000" opacity={0.4 * l} transform="translate(20 30)" />
          <rect x={210} y={620} width={660} height={460} rx={24} fill="#121316" stroke="#1d1f23" strokeWidth={10} />
          {Array.from({length: 13}, (_, i) => <line key={i} x1={250} x2={830} y1={660 + i * 30} y2={660 + i * 30} stroke="#0b0c0e" strokeWidth={8} />)}
        </g>
        {/* your slippers at the bottom of the frame (POV) */}
        {[370, 720].map((x, i) => <ellipse key={i} cx={x} cy={1880} rx={110} ry={170} fill="#232831" />)}
      </svg>
      <LowKey x={540} y={850} r={70} k={0.85} />
    </AbsoluteFill>
  );
};

// ---------- you turn around: the dark flat behind you, and him ----------
export const Behind: React.FC<{t: number; figure: number; talk?: number; breathe?: number; smile?: number}> = ({t, figure, talk = 0, breathe = 0}) => {
  const cx = 540, vy = 820, b = Math.sin(t * 2.2) * 4 * breathe;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect width={1080} height={1920} fill={V.black} />
        <path d={`M -400 1920 L ${cx - 170} ${vy + 380} L ${cx + 170} ${vy + 380} L 1480 1920 Z`} fill={V.floor} />
        <path d={`M -400 -100 L ${cx - 170} ${vy - 380} L ${cx + 170} ${vy - 380} L 1480 -100 Z`} fill="#0e1014" />
        <path d={`M -400 -100 L ${cx - 170} ${vy - 380} L ${cx - 170} ${vy + 380} L -400 1920 Z`} fill="#171a20" />
        <path d={`M 1480 -100 L ${cx + 170} ${vy - 380} L ${cx + 170} ${vy + 380} L 1480 1920 Z`} fill={V.wall} />
        {/* the room doorway at the end: the window, the night city */}
        <rect x={cx - 170} y={vy - 380} width={340} height={760} fill="#0f141c" />
        <rect x={cx - 90} y={vy - 260} width={180} height={260} fill={V.window} />
        {Array.from({length: 8}, (_, i) => { const r = mulberry32(i + 30); return <rect key={i} x={cx - 84 + r() * 160} y={vy - 140 + r() * 120} width={12} height={9} fill="#c9a86a" opacity={0.3} />; })}
        {/* the wardrobe, now on the right wall */}
        <path d={`M 1340 120 L ${cx + 260} ${vy - 250} L ${cx + 260} ${vy + 280} L 1340 1700 Z`} fill="#14171c" />
        <path d={`M 1230 260 L ${cx + 300} ${vy - 200} L ${cx + 300} ${vy + 240} L 1230 1560 Z`} fill="#20252d" />
        {figure > 0 && <g opacity={figure} transform={`translate(0 ${b})`}>
          <Person id="dbl" x={cx} y={830} s={0.74} phone="chest" glow={1} talk={talk} full />
        </g>}
      </svg>
      <LowKey x={540} y={760} r={64} k={0.9} />
    </AbsoluteFill>
  );
};

// ---------- your phone on the floor, screen up: «ДОСТАВКА ЗАВЕРШЕНА» ----------
export const FloorPhone: React.FC<{t: number; at: number}> = ({t, at}) => {
  const k = easeOut((t - at) / 0.3);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect width={1080} height={1920} fill="#14171b" />
        {Array.from({length: 12}, (_, i) => <line key={i} x1={0} x2={1080} y1={i * 170 + 40} y2={i * 170 + 40} stroke="#0d0f12" strokeWidth={4} />)}
        <defs><radialGradient id="fp-g"><stop offset="0" stopColor="#8fb4ff" stopOpacity={0.12 * k} /><stop offset="1" stopColor="#8fb4ff" stopOpacity="0" /></radialGradient></defs>
        <ellipse cx={500} cy={820} rx={520} ry={680} fill="url(#fp-g)" />
      </svg>
      <Phone x={SAFE.cx} y={800} w={430} rot={11}>
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 40%, #1b2333 0, #0a0d14 75%)', fontFamily: UI, textAlign: 'center'}}>
          <div style={{position: 'absolute', left: 16, right: 16, top: 60}}><Notif k={k} title="Доставка завершена" icon="check" scale={430 / 400} /></div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 380, opacity: k}}>
            <div style={{width: 90, height: 90, margin: '0 auto 26px', borderRadius: '50%', border: '5px solid #e8ecf2', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Icon name="check" size={56} color="#e8ecf2" stroke={2.6} /></div>
            <div style={{fontFamily: MONT, fontWeight: 900, fontSize: 44, color: '#e8ecf2', lineHeight: 1.1, letterSpacing: 1}}>ДОСТАВКА<br />ЗАВЕРШЕНА</div>
          </div>
          {/* cracked glass from the fall */}
          <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
            <g stroke="#cfd8e6" strokeWidth={1.6} opacity={0.45} fill="none">
              <path d="M 300 640 L 250 560 L 270 470 M 300 640 L 380 600 L 400 520 M 300 640 L 330 720 L 300 800 M 300 640 L 200 680 L 120 660 M 300 640 L 360 700 L 400 760" />
            </g>
          </svg>
        </div>
      </Phone>
      <LowKey x={500} y={800} r={80} k={0.8} />
    </AbsoluteFill>
  );
};

// black card with a line of white text (the question before "Часть 3")
export const Question: React.FC<{k: number; text: string}> = ({k, text}) => (
  <AbsoluteFill style={{background: V.black, alignItems: 'center', justifyContent: 'center', paddingRight: 1080 - 2 * SAFE.cx, paddingBottom: 200}}>
    <div style={{opacity: k, transform: `translateY(${(1 - k) * 14}px)`, fontFamily: MONT, fontWeight: 800, fontSize: 58, color: '#e8ecf2', textAlign: 'center', lineHeight: 1.2, maxWidth: 820}}>{text}</div>
  </AbsoluteFill>
);

// the night-stand top, seen from above (the phone lies on it)
export const Nightstand: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 65% 45% at 50% 46%, #2a2520 0%, #1b1815 50%, ${V.black} 100%)`}}>
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.3}}>
      {Array.from({length: 18}, (_, i) => <path key={i} d={`M -20 ${i * 110 + 20} C 400 ${i * 110 + 6} 700 ${i * 110 + 34} 1100 ${i * 110 + 22}`} stroke="#0d0b09" strokeWidth={3} fill="none" />)}
    </svg>
  </AbsoluteFill>
);

