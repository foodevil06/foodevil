# writes src/toon/episodes/vnutri3.cues.json; times are "line:N±s" (they follow the voice) and mirror Vnutri3.tsx
import json
V=json.load(open('src/toon/episodes/vnutri3.voice.json',encoding='utf-8')); Ls=V['lines']
def W(w, frm=0):
    for ln in Ls[frm:]:
        for x in ln['words']:
            if x['w'].lower().strip('«»"…').startswith(w): return x['t']
    raise SystemExit('no word '+w)
def rel(t):
    k=max([i for i,l in enumerate(Ls) if l['start']<=t+1e-6] or [0]); d=round(t-Ls[k]['start'],3)
    return f"line:{k}{'+' if d>=0 else '-'}{abs(d)}"
L=lambda i: Ls[i]
WET=W('попасть',6)+0.25; WARP=L(8)['end']+0.4; WARD0=L(8)['end']+1.6; KN=[L(10)['end']+0.7,L(10)['end']+1.9]
SNAP=L(12)['end']+0.6; CH0=L(12)['end']+2.4; HAND0=L(17)['end']+0.8; OPEN1=L(18)['end']+1.3; FACE=L(19)['end']+0.8
BACK0=FACE+0.9; NEXT=L(21)['end']+0.4; WHIP=L(23)['end']+0.9; BLACK=WHIP+0.7
TOTAL=int((L(24)['end']+2.8)*10+0.999)/10
S=lambda f: f'public/sfx/{f}.opus'
ev=[]
def smp(file,t,gain,**k): ev.append({'type':'sample','file':file,'t':rel(t),'gain':gain,**k})
def thump(t,g,f0=70,f1=38,decay=0.3): ev.append({'type':'thump','t':rel(t),'gain':g,'f0':f0,'f1':f1,'decay':decay})
# 1. only two people breathing
smp(S('v2_two_breath'),0.2,0.8,dur=6.0,fade=1.5); smp(S('v2_two_breath'),6.0,0.6,dur=6.0,fade=2.0)
# 2. something shifts under the skin; mini-screamer 1: the skin stretches as his face swims
smp(S('v3_skin_wet'),WET-0.4,0.8)
smp(S('v3_skin_stretch'),WARP-0.05,1.3,dur=0.45,fade=0.1); thump(WARP,0.18,62,40,0.15)
# 3. you step back; two knocks inside, slow scratching; mini-screamer 2: the door pops, a sharp inhale, a dry click
smp(S('v2_creak'),WARD0+0.2,0.5)
for k in KN: smp(S('v_knock'),k,0.8)
smp(S('v3_scratch'),KN[1]+0.6-0.79,0.9,dur=3.4,fade=0.8)
smp(S('v3_ward_snap'),SNAP,1.2); smp(S('v2_inhale'),SNAP+0.02,1.0,dur=0.6,fade=0.15)
# 4. the lamp buzzes and fails; the heartbeat comes up and speeds up; breathing; his whisper in your right ear
smp(S('v3_flicker'),CH0+0.5,0.45); smp(S('v3_flicker'),CH0+7.0,0.45); smp(S('v3_flicker'),CH0+13.5,0.5)
t, end = L(13)['start'], L(18)['start']
while t < end - 0.2:
    p=(t-L(13)['start'])/(end-L(13)['start'])
    g=0.10+0.16*p; thump(t,g,58,38,0.12); thump(t+0.17,0.7*g,58,38,0.1)
    t+=1.0-0.45*p
smp(S('v_breath'),L(15)['start']-0.2,0.5,dur=4.0,fade=1.0)
smp('_tmp/vnutri3/final/XW_17.wav',L(17)['start']-0.03,0.8,pan=0.9)
# 5. the handle, the long creak of the door, then almost nothing; the child, far away; mini-screamer 3: the old face
ev.append({'type':'tick','t':rel(HAND0+0.6),'gain':0.06,'f1':2600,'f2':4100,'decay':0.02})
smp(S('v2_key'),HAND0+0.55,0.25)
smp(S('v3_ward_creak'),L(18)['start']-0.25,0.9)
smp('_tmp/vnutri3/final/C_19.wav',L(19)['start']-0.03,2.2,pan=-0.25)
smp(S('v3_stinger'),FACE-0.11,1.0,dur=0.6,fade=0.2); smp(S('v3_exhale_old'),FACE+0.15,1.0)
# 6. unnaturally quiet; you back away; the calm notification; mini-screamer 4: the whip, an inhale, a low hit, black
smp(S('v2_creak'),BACK0+0.3,0.35)
smp(S('notify'),NEXT-0.05,0.5)
smp(S('whoosh'),WHIP-0.15,0.3,dur=0.4,fade=0.15)
smp(S('v2_inhale'),WHIP+0.08,1.4,dur=0.6,fade=0.15); thump(WHIP+0.1,0.45,55,28,0.45)
# 7. the whisper at the very end, close
smp('_tmp/vnutri3/final/OW_24.wav',L(24)['start']-0.03,0.8,pan=0.4)
# room tone: cut dead for the silences after each strong sound, almost nothing inside the wardrobe and at the end
pieces=[(0.0,WARP+0.3,0.4),(WARP+0.8,SNAP+0.05,0.4),(SNAP+0.95,OPEN1+0.4,0.4),(OPEN1+0.4,FACE,0.06),(BACK0+0.3,WHIP,0.12),(BLACK+0.6,TOTAL,0.07)]
music=[{'file':'public/sfx/v_room_bed.opus','gain':g,'t0':rel(a),'t1':rel(b) if b<TOTAL else 'end','from':round(a%60,2),'loop':True,'fade':0.02} for a,b,g in pieces]
pads=[{'t0':rel(a),'t1':rel(b),'notes':[55,82.4],'gain':0.03,'attack':0.8,'release':0.02} for a,b,g in pieces[:3]]
pads.append({'t0':rel(CH0),'t1':rel(L(18)['start']),'notes':[110,116.5,164.8],'gain':0.03,'attack':L(18)['start']-CH0,'release':0.02})
C={'total':TOTAL,'pads':pads,'events':ev,'music':music,'duck':{'db':3,'music_db':3,'smooth':0.15,'fx_db':9,'fx_gap':5}}
json.dump(C,open('src/toon/episodes/vnutri3.cues.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('total',TOTAL,'events',len(ev))
