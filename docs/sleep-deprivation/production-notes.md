# Производственные заметки

## Где что лежит

| Что | Путь |
|---|---|
| Композиция ролика | `SleepDeprivation` (src/toon/episodes/SleepDeprivation.tsx) |
| Проверка безопасных зон | `SleepDeprivationSafe` |
| Обложка | `SleepDeprivationCover` (1 кадр) |
| Герой | src/toon/sleep/Hero.tsx |
| Комната, экраны, машина, табло, плашки, веки, цвет | src/toon/sleep/Sets.tsx |
| Текст для озвучки | _tmp/sleep/lines.json |
| Тайминги слов (с паузами) | src/toon/episodes/sleep.voice.json |
| Генератор звуковых событий | _tmp/sleep/make_cues.py → src/toon/episodes/sleep.cues.json |
| Новые звуки | public/sfx/sl_*.opus (Lumean SFX); генерация: _tmp/sleep/gen_sfx.sh, gen_sfx2.sh |
| Сведённый звук | public/sleep/mix.wav (в git не хранится) |
| Итоговое видео | out/sleep_deprivation_final.mp4 |
| Обложка | out/covers/sleep_deprivation_cover.png (папка в git не хранится) |

Существующие файлы проекта не менялись, кроме:
- `src/Root.tsx`: три новые композиции;
- `.gitignore`: тяжёлые файлы нового ролика.

## Как собрать заново

```bash
# 1. голос (Николай, одним заказом) и тайминги
LUMEAN_API_KEY=dummy python3 scripts/lumean.py tts _tmp/sleep/lines.json _tmp/sleep/voice
python3 scripts/voice_pauses.py _tmp/sleep/voice/voice.wav _tmp/sleep/voice/voice.json _tmp/sleep/voice_final.wav \
  src/toon/episodes/sleep.voice.json --after 10:0.3 --after 13:0.4 --after 15:3.4 --after 16:0.6 --after 19:0.4 --tail 1.4
# 2. звук
python3 _tmp/sleep/make_cues.py
python3 scripts/sfx.py _tmp/sleep/voice_final.wav src/toon/episodes/sleep.voice.json src/toon/episodes/sleep.cues.json _tmp/sleep/mixwork public/sleep/mix.wav
# 3. стоп-кадры, рендер, сборка (облако: программный GL)
export TOON_BROWSER=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome TOON_GL=swangle TOON_THREADS=4
node scripts/render.mjs stills SleepDeprivationSafe _tmp/sleep/stills 0 900 1500 2550
node scripts/render.mjs render SleepDeprivation _tmp/sleep/raw_final.mp4
ffmpeg -i _tmp/sleep/raw_final.mp4 -i public/sleep/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 20 -preset slow -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart \
  -af "volume=-0.6dB,alimiter=limit=0.7:attack=1:release=40:level=disabled,lowpass=f=18000" -c:a aac -b:a 256k -ar 48000 -shortest out/sleep_deprivation_final.mp4
node scripts/render.mjs stills SleepDeprivationCover out/covers 0   # затем переименовать f0000.png
```

## Решения

- **Озвучка:** Николай, eleven_multilingual_v2, stability 0,5, одним заказом (правило канала: один рассказчик).
  Распознавание совпало с текстом на 94 % (181 из 192 слов).
- **Паузы под события:** 3,4 с черноты за рулём, тишина после гудка, короткие паузы перед сменой акта.
- **Персонаж:** векторный, без генерации изображений: он не «плывёт» между кадрами, а усталость меняется числами.
- **Субтитры:** существующий `CaseSubs` без изменений.
- **Сборка:** crf 20 вместо прежних 22. Тёмные градиенты хуже переживают повторное сжатие платформы (вывод аудита
  части 3), поэтому файл чуть тяжелее.
- **Обложка для YouTube:** в конец ролика не добавлялась, чтобы финальный кадр остался завершением истории.
  Кадр 0 подходит как превью.

## Проверки по ходу работы

- Стоп-кадры всех сцен (27 кадров) и повторные после правок (9 кадров).
- Четыре тестовых фрагмента в половинном размере: 0…15 с, 31…45 с, 57…72 с, 80…95 с.
  Движение проверено по кадрам через 0,5 с.
- Найдено и исправлено по стоп-кадрам:
  - руки перекрывали лицо (локоть шёл внутрь, рукава слишком толстые);
  - тень в крючке проходила точно за головой;
  - счётчик «×5» уходил под кнопки TikTok;
  - лестница симптомов прилипала к табло;
  - тень «краем глаза» стояла за безопасной зоной;
  - жест «нет» не читался: добавлено покачивание головой.
- Найдено и исправлено по замеру звука:
  - гудок и проезд машины были на 13…15 LU громче голоса и залезали на фразу;
  - зевок, глитч, стук клавиш, уведомления, удар телефона и банка были громче правила.

## Итоговая проверка готового видео

Заполняется после рендера (раздел ниже).
