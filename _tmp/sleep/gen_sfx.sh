# new sounds for «Что если не спать 7 дней» (Lumean SFX), one at a time
set -u
cd /home/user/foodevil
gen() { LUMEAN_API_KEY=dummy python3 scripts/lumean.py sfx "$1" "_tmp/sleep/sfx_raw/$2.mp3" --dur "$3" --influence "${4:-0.6}" >> _tmp/sleep/sfx.log 2>&1 || echo "FAIL $2" >> _tmp/sleep/sfx.log; }
gen "a young man yawning loudly and long, close microphone, dry room, no music" yawn 2.5
gen "opening an aluminum energy drink can, crisp pop and fizz, close up, no music" can_open 1.5
gen "inside a car at night driving at 60 km/h, steady low engine hum and road noise, no music, seamless" car_hum 8 0.5
gen "a loud long car horn blast approaching fast with a car passing by very close, doppler whoosh, night street, no music" horn_pass 3
gen "early morning birds chirping softly outside a window, calm, distant city, no music" birds 8 0.5
gen "a single button press on a computer keyboard, then a low error buzzer beep, no music" late_buzz 1.2
echo DONE >> _tmp/sleep/sfx.log
