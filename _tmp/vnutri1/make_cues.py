# writes src/toon/episodes/vnutri1.cues.json; every time is "line:N±s" so it follows the voice (mirrors Vnutri1.tsx)
import json
V=json.load(open('src/toon/episodes/vnutri1.voice.json',encoding='utf-8'))
Ls=V['lines']
def W(w, frm=0):
    for ln in Ls[frm:]:
        for x in ln['words']:
            if x['w'].lower().strip('«»"').startswith(w): return x['t']
    raise SystemExit('no word '+w)
def rel(t):
    k=max(i for i,l in enumerate(Ls) if l['start']<=t+1e-6) if t>=Ls[0]['start'] else 0
    d=round(t-Ls[k]['start'],3); return f"line:{k}{'+' if d>=0 else '-'}{abs(d)}"
L=lambda i: Ls[i]; cut=lambda i: Ls[i]['start']-0.1
KN=[L(14)['end']+d for d in (0.25,0.62,0.99)]
FREEZE=L(39)['end']+0.05
WK0=L(48)['end']+0.25
BLACK=WK0+0.72+0.12
TOTAL=max(V['total'], BLACK+3.2); TOTAL=int(TOTAL*10+0.999)/10
S=lambda f: f'public/sfx/{f}.opus'
ev=[]
def smp(file,t,gain,**k): ev.append({'type':'sample','file':file,'t':rel(t),'gain':gain,**k})
# 1. the phone vibrates, the notification
smp(S('vibrate'),0.0,1.6,**{'from':1.6,'dur':0.9,'fade':0.2})
smp(S('vibrate'),W('вибрирует',0)-0.05,1.6,**{'from':1.6,'dur':0.9,'fade':0.2})
smp(S('notify'),L(1)['start']-0.08,0.5)
ev.append({'type':'thump','t':rel(W('ничего',3)),'gain':0.18,'f0':60,'f1':38,'decay':0.5})
# 2. the order: rare digital clicks on each row, the red popup, the timer
for w,i in [('имя',4),('адрес',5),('оплата',6)]: ev.append({'type':'tick','t':rel(W(w,i)-0.1),'gain':0.07})
ev.append({'type':'tick','t':rel(W('отправитель',7)+0.1),'gain':0.09,'f1':900,'f2':1400,'decay':0.03})
smp(S('ping'),L(8)['start']-0.08,0.45)
T0=W('минуты',8)
for k in range(0,int(L(13)['start']-T0)):
    if k%2==0: ev.append({'type':'tick','t':rel(T0+k),'gain':0.035,'f1':1500,'f2':2400,'decay':0.008})
ev.append({'type':'glide','t':rel(W('двери',8)+0.1),'gain':0.05,'f0':180,'f1':90,'dur':1.6})
# 3. corridor: steps, the ventilation hum, the vibration, "Курьер прибыл", three knocks, silence
smp(S('v_steps'),cut(9)-0.15,0.9,dur=2.4,fade=0.5)
smp(S('v_vent_bed'),cut(9),0.7,dur=cut(15)-cut(9),fade=0.4)
smp(S('vibrate'),W('вибрирует',12)-0.05,1.4,**{'from':1.6,'dur':0.9,'fade':0.2})
smp(S('notify'),L(13)['start']-0.1,0.55)
ev.append({'type':'thump','t':rel(L(13)['start']-0.05),'gain':0.22,'f0':58,'f1':36,'decay':0.6})
for t in KN: smp(S('v_knock'),t,1.6)
# 4. peephole, the door creaks open, the bag; the date; tomorrow
smp(S('v_creak'),W('открываешь',18)-0.95+0.2,0.8,fade=0.4)
ev.append({'type':'thump','t':rel(W('дата',21)),'gain':0.16,'f0':62,'f1':40,'decay':0.4})
ev.append({'type':'glide','t':rel(L(22)['start']-0.1),'gain':0.06,'f0':92,'f1':74,'dur':2.0})
# 5. the bag on the table, the zip, the old phone, static, a breath behind your back
smp(S('v_thermo'),cut(23)+0.45-0.47,0.9)
smp(S('v_zip'),W('вскрываешь',23)-0.06,0.9)
smp(S('v_drop'),L(24)['start']+0.75-0.2,0.35)
smp(S('v_static'),W('загорается',26)-0.18,0.55,dur=1.3,fade=0.6)
smp(S('v_breath'),W('спины',30)+0.25-0.19,0.75,dur=2.6,fade=0.8)
# 6. the whip turn, back to the screen, the glitch, the rise, then the cut
smp(S('whoosh'),cut(31)-0.05,0.25,dur=0.7,fade=0.3)
smp(S('whoosh'),cut(33)-0.05,0.2,dur=0.7,fade=0.3)
smp(S('v_static'),W('показывает',36)-0.1,0.45,dur=0.45,fade=0.2)
# 7. the throw, the vibration, the messages, the knock in the corridor, the wardrobe
smp(S('whoosh'),W('отбрасываешь',40)-0.1,0.25,dur=0.6,fade=0.3)
smp(S('v_drop'),W('отбрасываешь',40)+0.35-0.2,0.6)
smp(S('vibrate'),W('вибрирует',41)-0.05,1.6,**{'from':1.6,'dur':0.9,'fade':0.2})
smp(S('notify'),L(42)['start']-0.08,0.45)
smp(S('notify'),L(43)['start']-0.08,0.35)
ev.append({'type':'thump','t':rel(W('твоё',44)-0.05),'gain':0.2,'f0':60,'f1':36,'decay':0.6})
smp(S('ping'),L(45)['start']-0.08,0.45)
smp(S('v_knock'),W('стук',46)+0.45,0.7)
smp(S('v_wardrobe'),WK0,1.5)
ev.append({'type':'thump','t':rel(BLACK+0.05),'gain':0.15,'f0':50,'f1':32,'decay':0.9})
C={
 'total': TOTAL,
 # low hum: an A1/E2 drone until the freeze, a rise while the video runs ahead, cut dead on "И открываешь её"
 'pads':[
  {'t0':rel(0.0),'t1':rel(FREEZE),'notes':[55,82.4],'gain':0.035,'attack':2.0,'release':0.03},
  {'t0':rel(L(36)['start']),'t1':rel(FREEZE),'notes':[110,116.5,164.8],'gain':0.035,'attack':FREEZE-L(36)['start'],'release':0.03},
  {'t0':rel(L(40)['start']-0.1),'t1':'end','notes':[55,82.4],'gain':0.03,'attack':3.0,'release':0.8},
 ],
 'events':ev,
 'music':[
  {'file':'public/sfx/v_room_bed.opus','gain':0.5,'t0':rel(0.0),'t1':rel(FREEZE),'loop':True,'fade':0.02},
  {'file':'public/sfx/v_room_bed.opus','gain':0.45,'t0':rel(L(40)['start']-0.2),'t1':rel(BLACK),'from':30,'loop':True,'fade':0.05},
  {'file':'public/sfx/v_room_bed.opus','gain':0.3,'t0':rel(BLACK),'t1':'end','from':60,'loop':True,'fade':1.0},
 ],
 'duck':{'db':3,'music_db':3,'smooth':0.15,'fx_db':9,'fx_gap':5},
}
json.dump(C,open('src/toon/episodes/vnutri1.cues.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('total',TOTAL,'events',len(ev),'freeze',round(FREEZE,2),'black',round(BLACK,2))
