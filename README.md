# toon-studio — мульты кодом для TikTok

Студия на Remotion: ролики 9:16 в стиле «Красная нить» (расследование + выживание, см. `STYLE-CARD.md`),
озвучка, звук и рендер с учётом безопасных зон TikTok (`CHANNEL.md`).

## Продолжить работу в новой сессии
1. `npm install`, `pip install edge-tts numpy faster-whisper piper-tts`
2. Ключ Lumean — переменная окружения `LUMEAN_API_KEY`, сеть: `api.lumean.app`; проверка: `python scripts/lumean.py check`
3. Рендер в облаке: `TOON_BROWSER=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome TOON_GL=swangle node scripts/render.mjs stills|preview|render <Comp> <out>`
4. Скиллы лежат в `.claude/skills/` (toon-stories, remotion-*, ElevenLabs и др.) и подхватываются автоматически.

## Что есть
- `out/case01_tiktok.mp4` — «Дело №1: квартира 36» (тест, голос edge-tts Светлана)
- `src/toon/case/` — компоненты стиля: Kit (бумага, штампы, субтитры, безопасные зоны), Phone (мессенджер), Sets, Hybrid (мир без контуров, карта, нить, выбор, «Часть N»)
- `src/toon/episodes/StyleFrames.tsx` — стиль-кадры «Красной нити»
- `scripts/lumean.py` — голоса/звуки/музыка через Lumean; `scripts/align.py` — тайминги слов (Whisper); `scripts/draft_timing.py` — черновые тайминги без голоса
- `refs/` — разбор трёх роликов-образцов, `STYLE-CARD.md` — общая формула

## Следующий шаг
Выбрать сюжет (рекомендован «Курьер»), подобрать голос через `lumean.py voices`, сделать звуки `sfx` и мистическую музыку `music`.
