# writes src/toon/episodes/vnutri2.cues.json; times are "line:N±s" (they follow the voice) and mirror Vnutri2.tsx
import json
V=json.load(open('src/toon/episodes/vnutri2.voice.json',encoding='utf-8')); Ls=V['lines']
def W(w, frm=0):
    for ln in Ls[frm:]:
        for x in ln['words']:
            if x['w'].lower().strip('«»"…').startswith(w): return x['t']
    raise SystemExit('no word '+w)
def rel(t):
    k=max([i for i,l in enumerate(Ls) if l['start']<=t+1e-6] or [0]); d=round(t-Ls[k]['start'],3)
    return f"line:{k}{'+' if d>=0 else '-'}{abs(d)}"
L=lambda i: Ls[i]
BANGS=[L(1)['end']+d for d in (1.0,2.3,3.8)]
HJ=L(2)['end']+0.25; PH0=L(2)['end']+2.0; RING=PH0+0.6; CLICK=L(5)['start']-0.8
SM=L(13)['end']+0.35; KEY0=L(14)['start']-1.6; TAKE=L(16)['end']+0.4
P0=L(22)['end']+0.6; PB=[L(22)['end']+d for d in (2.2,3.8,5.4)]
BEHIND=W('внутри',25)+0.12; TURN0=L(26)['start']-1.2; TURN1=L(26)['end']+0.4
INH=L(27)['end']+0.1; DROP=L(27)['end']+0.35; FLOOR=DROP+0.75; BLACK=FLOOR+2.6
TOTAL=int((L(28)['end']+2.6)*10+0.999)/10
S=lambda f: f'public/sfx/{f}.opus'
ev=[]
def smp(file,t,gain,**k): ev.append({'type':'sample','file':file,'t':rel(t),'gain':gain,**k})
def thump(t,g,f0=70,f1=38,decay=0.35): ev.append({'type':'thump','t':rel(t),'gain':g,'f0':f0,'f1':f1,'decay':decay})
# hook: breathing, one floor creak, three blows (each heavier), the handle jerks
smp(S('v_breath'),0.3,0.6,dur=4.0,fade=1.0)
smp(S('v2_creak'),2.4,0.5)
for b,g,tg in zip(BANGS,(0.7,0.95,1.2),(0.12,0.2,0.3)): smp(S('v2_bang'),b,g,dur=0.4,fade=0.12); thump(b,tg,decay=0.12)
smp(S('v2_handle'),HJ-0.34,1.1)
# the phone: buzzing on wood in bursts, a short alarm beep, digital crackle on "мой", the connect click
k=0
while RING+k*1.1 < CLICK-0.6:
    smp(S('v2_phone_wood'),RING+k*1.1,0.9,dur=0.75,fade=0.1); k+=1
ev.append({'type':'notes','t':rel(RING+0.05),'gain':0.05,'notes':[988,740],'step':0.13,'decay':0.08})
smp(S('v_static'),W('мой',3)-0.05,0.5,dur=0.4,fade=0.15)
ev.append({'type':'tick','t':rel(CLICK),'gain':0.14,'f1':1200,'f2':2400,'decay':0.012})
# two voices: the whisper behind the right ear; the reflection grins, a hit on the glass
smp('_tmp/vnutri2/final/w_13.wav',L(13)['start']-0.03,0.6,pan=0.85)
smp(S('v2_glass'),SM,1.1,dur=0.5,fade=0.2); ev.append({'type':'tick','t':rel(SM),'gain':0.08,'f1':3400,'f2':5200,'decay':0.03})
# the key: steps, the mat, the key's clink when it shows and when it is picked up; the whisper behind the left ear
smp(S('v2_creak'),KEY0+0.3,0.45)
smp(S('v2_mat'),W('коврик',14)+0.05,0.9)
smp(S('v2_key'),W('ключ',15)-0.3,0.6)
smp(S('v2_key'),TAKE-0.3,0.9)
smp('_tmp/vnutri2/final/w_22.wav',L(22)['start']-0.03,0.8,pan=-0.85)
# pressure: the door trembles, the handle creaks down, the chain pulls taut, three heavier blows, breathing outside
smp(S('v2_rattle'),P0,0.7,fade=0.4); smp(S('v2_rattle'),P0+2.9,0.8,fade=0.6)
smp(S('v2_handle_creak'),P0+0.9,0.8)
smp(S('v2_chain'),P0+2.4-0.2,0.9)
for b,g,tg in zip(PB,(1.0,1.2,1.4),(0.2,0.27,0.34)): smp(S('v2_bang'),b,g,dur=0.5,fade=0.15); thump(b,tg)
smp(S('v2_breath_out'),P0+5.8,0.9,dur=3.4,fade=0.8)
# "он уже внутри": a bang right behind you, then nothing at all for half a second
smp(S('v2_bang_behind'),BEHIND,1.6,dur=0.35,fade=0.1); thump(BEHIND,0.32,60,32,0.12)
# the turn: only the breathing of two; the double's sharp inhale and a low hit; your phone hits the floor; the calm ding
smp(S('v2_two_breath'),TURN1-0.2,0.9,dur=5.5,fade=1.0)
smp(S('v_breath'),TURN1+0.4,0.4,dur=3.5,fade=1.0)
smp(S('v2_inhale'),INH,1.4,dur=0.6,fade=0.15); thump(INH+0.02,0.42,55,28,0.5)
smp(S('v2_drop'),DROP+0.38,1.0)
smp(S('notify'),FLOOR+0.38,0.5)
# black: 1.2 s, one quiet knock behind the door; at the end the whisper, close
smp(S('v_knock'),BLACK+1.2,0.6)
smp('_tmp/vnutri2/final/w_28.wav',L(28)['start']-0.03,0.6,pan=0.45)
# the room tone and the low drone stop dead for each silence: after the third blow, after the click,
# after the glass hit, after the bang behind you, and for the black screen
SIL=[(BANGS[2]+0.3,BANGS[2]+0.9),(CLICK+0.02,CLICK+0.45),(SM+0.35,SM+0.9),(L(25)['end']+0.05,L(25)['end']+0.55),(BLACK,BLACK+1.2)]
edges=[0.0]+[x for a,b in SIL for x in (a,b)]+[TOTAL]
pieces=[(edges[i],edges[i+1]) for i in range(0,len(edges),2)]
music=[{'file':'public/sfx/v_room_bed.opus','gain':(0.15 if a>=BLACK else 0.45),'t0':rel(a),'t1':rel(b) if b<TOTAL else 'end','from':round(a%60,2),'loop':True,'fade':0.02} for a,b in pieces]
music.append({'file':'public/sfx/v_vent_bed.opus','gain':0.35,'t0':rel(0.0),'t1':rel(BANGS[1]),'loop':True,'fade':0.8})
pads=[{'t0':rel(a),'t1':rel(b) if b<TOTAL else 'end','notes':[55,82.4],'gain':0.03,'attack':0.6,'release':0.02} for a,b in pieces if a<BLACK]
pads.append({'t0':rel(P0),'t1':rel(L(25)['end']+0.05),'notes':[110,116.5,164.8],'gain':0.03,'attack':L(25)['end']-P0,'release':0.02})
C={'total':TOTAL,'pads':pads,'events':ev,'music':music,'duck':{'db':3,'music_db':3,'smooth':0.15,'fx_db':9,'fx_gap':5}}
json.dump(C,open('src/toon/episodes/vnutri2.cues.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('total',TOTAL,'events',len(ev),'bed pieces',len(pieces))
