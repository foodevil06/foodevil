#!/usr/bin/env bash
# Ask ChatGPT through the Codex CLI signed in with the user's ChatGPT plan (no API key).
#   bash .claude/skills/ask-chatgpt/scripts/ask.sh "вопрос" [файл ...]
# Text files are inlined into the prompt (up to MAX_BYTES each); .png/.jpg/.webp are attached as images. Codex runs read-only and forgets the session.
# Prints only ChatGPT's final answer. Env: CHATGPT_MODEL (optional), MAX_BYTES (default 60000).
set -euo pipefail
[ $# -ge 1 ] || { echo 'usage: ask.sh "вопрос" [файл ...]' >&2; exit 2; }
command -v codex >/dev/null || { echo 'Codex CLI не установлен: npm install -g @openai/codex' >&2; exit 3; }
if ! codex login status 2>&1 | grep -qi '^logged in'; then   # the status goes to stderr; «Not logged in» must not match
  echo 'Codex не авторизован: codex login --device-auth (ссылка и код для входа в ChatGPT)' >&2; exit 4
fi
q="$1"; shift
max=${MAX_BYTES:-60000}
prompt="$q"
imgs=()
for f in "$@"; do
  [ -f "$f" ] || { echo "нет файла: $f" >&2; exit 5; }
  # pictures (stills, contact sheets of a video) go to ChatGPT as images, not as text
  case "${f,,}" in *.png|*.jpg|*.jpeg|*.webp) imgs+=(-i "$(cd "$(dirname "$f")" && pwd)/$(basename "$f")"); continue;; esac
  size=$(wc -c < "$f")
  prompt+=$'\n\n'"----- файл: $(basename "$f") ($size байт) -----"$'\n'"$(head -c "$max" "$f")"
  [ "$size" -gt "$max" ] && prompt+=$'\n'"[файл обрезан до $max байт]"
done
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
model=()
[ -n "${CHATGPT_MODEL:-}" ] && model=(-m "$CHATGPT_MODEL")
cd "$tmp"
if ! printf '%s' "$prompt" | codex exec --sandbox read-only --skip-git-repo-check --ephemeral --color never "${model[@]}" "${imgs[@]}" -o "$tmp/answer.txt" - > "$tmp/log.txt" 2>&1; then
  echo 'Codex завершился с ошибкой:' >&2; tail -20 "$tmp/log.txt" >&2; exit 6
fi
cat "$tmp/answer.txt"
