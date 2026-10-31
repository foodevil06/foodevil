set -u
cd /home/user/foodevil
gen() { for k in 1 2; do LUMEAN_API_KEY=dummy python3 scripts/lumean.py sfx "$1" "_tmp/sleep/sfx_raw/$2.mp3" --dur "$3" --influence "${4:-0.6}" >> _tmp/sleep/sfx2.log 2>&1 && return; sleep 20; done; echo "FAIL $2" >> _tmp/sleep/sfx2.log; }
gen "car engine humming inside the cabin, road noise, steady" car_hum 8 0.5
gen "loud car horn honking close" horn 2
gen "fast car passing by whoosh" pass 2
gen "short low electronic error buzzer" late_buzz 1
echo DONE >> _tmp/sleep/sfx2.log
