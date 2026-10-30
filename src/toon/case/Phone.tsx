// Dark messenger on a phone, vertical close-up. Messages appear at their time and push the chat up;
// "печатает…" bubble, a push notification from the top, ticks on your own messages.
import React from 'react';
import {clamp, easeOut, spring01, wobble} from '../lib/anim';
import {C, SAFE, UI} from './Kit';

export type Msg = {at: number; text: string; name?: string; color?: string; time: string; out?: boolean; day?: string; avatar?: string};

const PW = 800, PH = 1150;

const Typing: React.FC<{t: number}> = ({t}) => (
  <div style={{display: 'flex', gap: 10, padding: '24px 30px', background: '#1f2735', borderRadius: '30px 30px 30px 8px', width: 'fit-content'}}>
    {[0, 1, 2].map((i) => <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: '#9aa7bd', opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 7 - i * 0.9))}} />)}
  </div>
);

export const Phone: React.FC<{f: number; fps: number; t0: number; title: string; sub: string; clock: string; msgs: Msg[];
  typing?: [number, number] | null; typingName?: string; notify?: {at: number; until: number; title: string; text: string} | null;
  shake?: number; glow?: string; icon?: string; iconBg?: string}> = ({f, fps, t0, title, sub, clock, msgs, typing, typingName, notify, shake = 0, glow, icon, iconBg}) => {
  const t = f / fps;
  const enter = easeOut((t - t0) / 0.45);
  const typingOn = typing && t >= typing[0] && t < typing[1];
  const sx = wobble(t * 0.7, 3) * 5 + wobble(t * 40, 1) * shake * 16, sy = wobble(t * 0.6, 8) * 6 + (1 - enter) * 220;
  const shown = msgs.filter((m) => t >= m.at);
  const n = notify ? spring01(f, notify.at * fps, fps, 1.8, 0.6) * (1 - easeOut((t - notify.until) / 0.35)) : 0;
  return (
    <div style={{position: 'absolute', left: SAFE.cx - PW / 2 + sx, top: 165 + sy, width: PW, height: PH, opacity: clamp(enter * 2)}}>
      {/* body */}
      <div style={{position: 'absolute', inset: 0, borderRadius: 96, background: '#05070b', boxShadow: glow ? `0 0 0 4px ${glow}, 0 0 70px ${glow}, 0 40px 80px rgba(0,0,0,0.6)` : '0 0 0 4px #2a303c, 0 40px 80px rgba(0,0,0,0.6)'}} />
      <div style={{position: 'absolute', inset: 18, borderRadius: 80, overflow: 'hidden', background: '#0f141d', fontFamily: UI}}>
        {/* status bar */}
        <div style={{position: 'absolute', left: 70, top: 34, fontSize: 36, fontWeight: 700, color: '#fff'}}>{clock}</div>
        <div style={{position: 'absolute', left: PW / 2 - 18 - 100, top: 26, width: 200, height: 56, borderRadius: 28, background: '#000'}} />
        <div style={{position: 'absolute', right: 70, top: 42, width: 56, height: 26, borderRadius: 7, border: '3px solid #cfd6e2'}}>
          <div style={{position: 'absolute', left: 3, top: 3, width: 14, height: 14, borderRadius: 3, background: '#cfd6e2'}} />
        </div>
        {/* header */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 100, height: 130, display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px',
          borderBottom: '2px solid #1c2330', background: '#121924'}}>
          <div style={{fontSize: 64, color: '#cfd6e2', fontWeight: 400, marginTop: -8}}>‹</div>
          <div style={{width: 84, height: 84, borderRadius: 42, background: iconBg ?? C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {icon ? <span style={{fontSize: 44}}>{icon}</span> : <svg width={46} height={46} viewBox="0 0 24 24"><path d="M3 11 L12 3 L21 11 V21 H15 V15 H9 V21 H3 Z" fill="#fff" /></svg>}
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 40, fontWeight: 800, color: '#fff'}}>{title}</div>
            <div style={{fontSize: 30, color: typingOn ? '#7fb2ff' : '#7d8899', marginTop: 4}}>{typingOn ? `${typingName} печатает…` : sub}</div>
          </div>
          <div style={{fontSize: 50, color: '#cfd6e2', fontWeight: 800}}>⋮</div>
        </div>
        {/* messages, stacked from the bottom */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 232, bottom: 150, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          gap: 22, padding: '0 34px 28px', overflow: 'hidden'}}>
          {shown.map((m, i) => {
            const p = spring01(f, m.at * fps, fps, 2.2, 0.6);
            return (
              <React.Fragment key={i}>
                {m.day && <div style={{alignSelf: 'center', fontSize: 28, color: '#c7cfdb', background: '#1c2432', padding: '8px 22px', borderRadius: 20}}>{m.day}</div>}
                <div style={{display: 'flex', gap: 18, alignItems: 'flex-end', alignSelf: m.out ? 'flex-end' : 'flex-start', maxWidth: '84%',
                  transform: `translateY(${(1 - clamp(p)) * 60}px) scale(${0.9 + 0.1 * clamp(p)})`, transformOrigin: m.out ? '100% 100%' : '0 100%', opacity: clamp(p * 2.5)}}>
                  {!m.out && <div style={{width: 62, height: 62, flex: 'none', borderRadius: 31, background: m.color ?? '#556', color: '#fff', fontWeight: 800, fontSize: 26,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{m.avatar ?? (m.name ?? '?')[0]}</div>}
                  <div style={{background: m.out ? '#2b5fb8' : '#1f2735', borderRadius: m.out ? '30px 30px 8px 30px' : '30px 30px 30px 8px', padding: '20px 28px 14px'}}>
                    {m.name && !m.out && <div style={{fontSize: 30, fontWeight: 800, color: m.color, marginBottom: 6}}>{m.name}</div>}
                    <div style={{fontSize: 40, color: '#f1f4f9', lineHeight: 1.25}}>{m.text}</div>
                    <div style={{fontSize: 24, color: m.out ? '#bcd3ff' : '#7d8899', textAlign: 'right', marginTop: 6}}>{m.time}{m.out ? '  ✓✓' : ''}</div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          {typingOn && <div style={{display: 'flex', gap: 18, alignItems: 'flex-end'}}>
            <div style={{width: 62}} /><Typing t={t} />
          </div>}
        </div>
        {/* input */}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: '#121924', borderTop: '2px solid #1c2330', display: 'flex', alignItems: 'center', gap: 20, padding: '0 34px 20px'}}>
          <div style={{flex: 1, height: 84, borderRadius: 42, background: '#1c2432', color: '#5d6879', fontSize: 34, display: 'flex', alignItems: 'center', padding: '0 34px'}}>Сообщение</div>
          <div style={{width: 84, height: 84, borderRadius: 42, background: '#1c2432', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7d8899', fontSize: 34}}>➤</div>
        </div>
        {/* glass */}
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%)'}} />
      </div>
      {/* push notification above the phone */}
      {notify && n > 0.001 && (
        <div style={{position: 'absolute', left: 40, right: 40, top: 110 + (1 - n) * -200, opacity: clamp(n * 2), background: 'rgba(32,38,50,0.97)', borderRadius: 40,
          padding: '26px 32px', display: 'flex', gap: 24, alignItems: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontFamily: UI}}>
          <div style={{width: 80, height: 80, borderRadius: 40, background: C.blue, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={44} height={44} viewBox="0 0 24 24"><path d="M3 11 L12 3 L21 11 V21 H15 V15 H9 V21 H3 Z" fill="#fff" /></svg>
          </div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 32, fontWeight: 800, color: '#fff'}}>{notify.title}<span style={{fontWeight: 400, color: '#8a95a8', fontSize: 28}}>сейчас</span></div>
            <div style={{fontSize: 32, color: '#c7cfdb', marginTop: 6}}>{notify.text}</div>
          </div>
        </div>
      )}
    </div>
  );
};
