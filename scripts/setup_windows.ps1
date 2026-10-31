# Установка студии «Красная нить» на Windows (docs/НОУТБУК.md).
# Запуск: powershell -ExecutionPolicy Bypass -File setup_windows.ps1
# Ставит Git, Node.js, Python 3.12, ffmpeg (winget), клонирует проект, ставит зависимости, Claude Code и Codex CLI,
# затем проверяет скорость рендера. Ключи сюда не вписываются: озвучка читает LUMEAN_API_KEY из файла .env проекта.
$ErrorActionPreference = 'Stop'
$Branch = 'claude/kurier-part2-voiceover-mqiv7l'
$Repo = Join-Path $HOME 'foodevil'

function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
}
function Need($cmd, $id) {
  if (Get-Command $cmd -ErrorAction SilentlyContinue) { Write-Host "есть: $cmd"; return }
  Write-Host "ставлю $id ..."
  winget install --id $id -e --silent --accept-source-agreements --accept-package-agreements
  Refresh-Path
}

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { throw 'Нет winget: обнови «Установщик приложений» в Microsoft Store и запусти снова.' }
Need git Git.Git
Need node OpenJS.NodeJS.LTS
Need py Python.Python.3.12
Need ffmpeg Gyan.FFmpeg
Refresh-Path

if (-not (Test-Path $Repo)) {
  Write-Host 'клонирую проект (Git попросит войти в GitHub в браузере) ...'
  git clone https://github.com/foodevil06/foodevil.git $Repo
}
Set-Location $Repo
git fetch origin $Branch
git checkout $Branch
git pull origin $Branch

Write-Host 'зависимости проекта ...'
npm install
py -3.12 -m pip install --user --upgrade faster-whisper numpy

Write-Host 'Claude Code и Codex CLI ...'
npm install -g @anthropic-ai/claude-code @openai/codex

if (-not (Test-Path (Join-Path $Repo '.env'))) {
  Write-Host 'Создай в папке проекта файл .env со строкой LUMEAN_API_KEY=твой_ключ (для озвучки).' -ForegroundColor Yellow
}

[Environment]::SetEnvironmentVariable('TOON_THREADS', '8', 'User')
$env:TOON_THREADS = '8'
Write-Host 'проверка скорости: рендер ролика про сон (95 секунд видео) ...'
$t = Measure-Command { node scripts/render.mjs render SleepDeprivationSafe out/bench_laptop.mp4 | Out-Host }
Write-Host ('Готово. Рендер занял {0:N0} с (в облаке было 2894 с).' -f $t.TotalSeconds) -ForegroundColor Green
Write-Host 'Дальше: codex login (вход в ChatGPT), затем claude remote-control в этой папке, чтобы управлять с телефона.'
