# writes src/toon/episodes/vnutri3r.v2.cues.json (mirrors Vnutri3R.tsx); stingers use "pan" so they skip the fx ceiling
# v2: breath and vibrations under the voice, short screamer tails, then a clear silence; the ding and the room bed at DING
import json, math
V=json.load(open('src/toon/episodes/vnutri3r.voice.json',encoding='utf-8')); Ls=V['lines']
def W(w, frm=0):
    for ln in Ls[frm:]:
        for x in ln['words']:
            if x['w'].lower().strip('«»"…:').startswith(w): return x['t']
    raise SystemExit('no word '+w)
def rel(t):
    k=max([i for i,l in enumerate(Ls) if l['start']<=t+1e-6] or [0]); d=round(t-Ls[k]['start'],3)
    return f"line:{k}{'+' if d>=0 else '-'}{abs(d)}"
L=lambda i: Ls[i]; cut=lambda i: Ls[i]['start']-0.1
BAG=L(0)['end']+0.15; APP=W('открылось',4); BLINK=W('моргаешь',8)+0.25; KN=[L(13)['end']+d for d in (0.3,0.67,1.04)]
MEM=L(15)['start']-0.05; THRU=W('сквозь',19); SIT=L(25)['start']; SCR=L(28)['end']+0.2; NEXT=SCR+0.8; QA=NEXT+2.6; COVER=QA+4.2
DING=SCR+1.72  # the calm ding of the next order, after ~1.1 s of silence (the card is already on screen)
TOTAL=math.ceil((COVER+0.2)*10)/10
S=lambda f: f'public/sfx/{f}.opus'
ev=[]
def smp(file,t,gain,**k): ev.append({'type':'sample','file':file,'t':rel(t),'gain':gain,**k})
def thump(t,g,f0=70,f1=38,decay=0.2): ev.append({'type':'thump','t':rel(t),'gain':g,'f0':f0,'f1':f1,'decay':decay})
def tick(t,g=0.07,f1=2100,f2=3300,decay=0.012): ev.append({'type':'tick','t':rel(t),'gain':g,'f1':f1,'f2':f2,'decay':decay})
# his face, the bag pushed into your hands; something faint inside the warm bag
thump(0.05,0.2); smp(S('v_static'),0.0,0.3,dur=0.35,fade=0.15)
smp(S('kv_bag_hand'),BAG-0.1,1.0); smp(S('whoosh'),BAG-0.15,0.2,dur=0.4,fade=0.2)
thump(W('тёплый',2)+0.45,0.1,50,40,0.12)
# the phone: vibration, the app, «Смена начата», the rows; "almost midnight"
smp(S('vibrate'),L(3)['start']-0.05,0.4,**{'from':1.6,'dur':0.9,'fade':0.2})
smp(S('notify'),APP-0.05,0.5); smp(S('ping'),L(5)['start']-0.05,0.45)
for w in ('ты','адрес','время'): tick(W(w,6)-0.05)
ev.append({'type':'glide','t':rel(W('двадцать',6)),'gain':0.05,'f0':150,'f1':90,'dur':1.8})
tick(W('полночь',7),0.08,1500,2400,0.01)
# the blink: 23:47 again — a piano sting
smp(S('kv_piano_stab'),L(9)['start']-0.05,0.28,pan=0)
# the landing: «Постучите», the three knocks of part 1, your phone buzzing behind the door; flashes of part 1
smp(S('notify'),W('постучите',12)-0.1,0.45)
for k in KN: smp(S('v_knock'),k,1.6)
smp(S('kv_vib_muffled'),L(14)['start']-0.35,0.09)  # below the fx ceiling, or the ceiling keeps it at voice level
smp(S('v_static'),MEM,0.5,dur=0.3,fade=0.1); smp(S('v_static'),MEM+0.8,0.45,dur=0.3,fade=0.1)
smp(S('v_thermo'),W('кладёшь',16)+0.1,0.8); thump(W('кладёшь',16)+0.6,0.12,60,40,0.12)  # the bag touches the floor
# the door opens; he looks through you (a sting); you walk in; «Курьер уже внутри» (title sting); the wardrobe creaks
smp(S('kv_door_open_out'),L(17)['start']-0.34,1.0)
smp(S('kv_piano_stab'),THRU,0.35,pan=0); thump(THRU,0.25,60,34,0.25)
smp(S('v_steps'),L(21)['start'],0.8,dur=2.2,fade=0.5)
smp(S('kv_piano_stab2'),L(22)['start']-0.05,0.3,pan=0); smp(S('whoosh'),L(22)['start']-0.1,0.2,dur=0.5,fade=0.2)
smp(S('v3_ward_creak'),L(23)['end']-0.1,0.7)
# inside: the REC beep; the chair; the realization; the breath on your neck (left ear)
tick(cut(24)+0.25,0.09,2000,3000,0.03)
smp(S('v2_creak'),SIT+1.7,0.4)
ev.append({'type':'glide','t':rel(L(26)['start']),'gain':0.06,'f0':82,'f1':65,'dur':2.4})
smp(S('kv_neck_breath'),L(27)['start']+0.8,0.2,pan=-0.8); smp(S('kv_neck_breath'),L(27)['end']+0.3,0.35,pan=-0.9,dur=1.75,fade=0.4)  # ends before «Подвинься»
# the screamer, then silence; the calm ding of the next order
smp(S('kv_piano_stab2'),SCR,0.5,pan=0,dur=0.55,fade=0.25); smp(S('kv_screech'),SCR+0.02,0.4,pan=0,dur=0.45,fade=0.2); thump(SCR,0.45,52,28,0.25)
smp(S('notify'),DING,0.5)
pieces=[(0.0,cut(10),'v_room_bed',0.4),(cut(10),L(17)['start'],'v_vent_bed',0.35),(L(17)['start'],L(28)['start']-0.25,'v_room_bed',0.38),(DING,TOTAL,'v_room_bed',0.12)]
music=[{'file':f'public/sfx/{fn}.opus','gain':g,'t0':rel(a),'t1':rel(b) if b<TOTAL else 'end','from':round(a%15,2),'loop':True,'fade':0.05} for a,b,fn,g in pieces]
pads=[{'t0':rel(0.0),'t1':rel(L(28)['start']-0.25),'notes':[55,82.4],'gain':0.03,'attack':1.5,'release':0.05},
      {'t0':rel(L(27)['start']),'t1':rel(SCR),'notes':[110,116.5,164.8],'gain':0.035,'attack':SCR-L(27)['start'],'release':0.02}]
C={'total':TOTAL,'pads':pads,'events':ev,'music':music,'duck':{'db':3,'music_db':3,'smooth':0.15,'fx_db':9,'fx_gap':5}}
json.dump(C,open('src/toon/episodes/vnutri3r.v2.cues.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('total',TOTAL,'events',len(ev))
