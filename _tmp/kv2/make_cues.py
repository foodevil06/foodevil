# writes src/toon/episodes/vnutri2r.cues.json (mirrors the beats in Vnutri2R.tsx); stingers use "pan": 0 so they skip
# the fx ceiling and land about as loud as the voice (short, with silence after)
import json, math
V=json.load(open('src/toon/episodes/vnutri2r.voice.json',encoding='utf-8')); Ls=V['lines']
def W(w, frm=0):
    for ln in Ls[frm:]:
        for x in ln['words']:
            if x['w'].lower().strip('«»"…').startswith(w): return x['t']
    raise SystemExit('no word '+w)
def rel(t):
    k=max([i for i,l in enumerate(Ls) if l['start']<=t+1e-6] or [0]); d=round(t-Ls[k]['start'],3)
    return f"line:{k}{'+' if d>=0 else '-'}{abs(d)}"
L=lambda i: Ls[i]; cut=lambda i: Ls[i]['start']-0.1
VSTEP=W('назад',6)-0.25; RSTEP=VSTEP+3; VOPEN=W('открываться',11); SCR=L(24)['end']+0.25; QA=SCR+0.8; COVER=QA+4.2
TOTAL=math.ceil((COVER+0.2)*10)/10
S=lambda f: f'public/sfx/{f}.opus'
ev=[]
def smp(file,t,gain,**k): ev.append({'type':'sample','file':file,'t':rel(t),'gain':gain,**k})
def thump(t,g,f0=70,f1=38,decay=0.2): ev.append({'type':'thump','t':rel(t),'gain':g,'f0':f0,'f1':f1,'decay':decay})
# the knock in the wardrobe, breathing; the realization: a piano sting and tape noise
smp(S('v_knock'),0.05,1.0); smp(S('v_knock'),1.0,0.6); smp(S('v_breath'),0.3,0.5,dur=3.0,fade=1.0)
smp(S('v_static'),cut(2),0.3,dur=0.4,fade=0.15); smp(S('kv_piano_stab'),W('оттуда',2),0.3,pan=0)
# the phone switches on by itself; the real step three seconds after the video's one
smp(S('v_static'),W('загорается',3)-0.05,0.5,dur=0.6,fade=0.2); ev.append({'type':'tick','t':rel(W('загорается',3)),'gain':0.08})
smp(S('v2_creak'),RSTEP,0.8); thump(RSTEP+0.05,0.15)
ev.append({'type':'tick','t':rel(W('опережает',10)),'gain':0.07,'f1':1500,'f2':2400,'decay':0.01})
# on the video the door creaks (thin, from the phone); the countdown with a heartbeat that speeds up
smp(S('v3_ward_creak'),VOPEN,0.35)
for k in (13,15,17): thump(L(k)['start'],0.3,64,36,0.18); ev.append({'type':'tick','t':rel(L(k)['start']),'gain':0.1,'f1':900,'f2':1400,'decay':0.03})
t=L(12)['end']+0.3
while t < L(18)['start']-0.4:
    p=(t-L(12)['end'])/(L(18)['start']-L(12)['end']); g=0.08+0.12*p
    thump(t,g,58,38,0.1); thump(t+0.16,0.7*g,58,38,0.08); t+=0.95-0.45*p
# the real door opens; breathing in the dark; the swell into "Это ты" with a piano hit; the skin stretches on the grin
smp(S('v3_ward_creak'),L(18)['start']-0.1,0.9)
smp(S('kv_neck_breath'),L(19)['start']-0.3,0.5)
smp(S('kv_rev_swell'),L(22)['start']-1.8,0.3,pan=0); smp(S('kv_piano_stab'),L(22)['start']-0.02,0.32,pan=0)
smp(S('v3_skin_stretch'),W('шире',23),0.7,dur=0.5,fade=0.1)
# the screamer: piano slam + string screech + low hit, then nothing
smp(S('kv_piano_stab2'),SCR,0.5,pan=0); smp(S('kv_screech'),SCR+0.02,0.4,pan=0); thump(SCR,0.45,52,28,0.4)
pieces=[(0.0,SCR,0.4),(QA,TOTAL,0.12)]
music=[{'file':'public/sfx/v_room_bed.opus','gain':g,'t0':rel(a),'t1':rel(b) if b<TOTAL else 'end','from':round(a%60,2),'loop':True,'fade':0.02} for a,b,g in pieces]
pads=[{'t0':rel(0.0),'t1':rel(SCR),'notes':[55,82.4],'gain':0.03,'attack':1.5,'release':0.02},
      {'t0':rel(VOPEN),'t1':rel(L(18)['start']),'notes':[110,116.5,164.8],'gain':0.03,'attack':L(18)['start']-VOPEN,'release':0.05},
      {'t0':rel(L(21)['start']),'t1':rel(SCR),'notes':[73.4,77.8],'gain':0.035,'attack':SCR-L(21)['start'],'release':0.02}]
C={'total':TOTAL,'pads':pads,'events':ev,'music':music,'duck':{'db':3,'music_db':3,'smooth':0.15,'fx_db':9,'fx_gap':5}}
json.dump(C,open('src/toon/episodes/vnutri2r.cues.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('total',TOTAL,'events',len(ev))
