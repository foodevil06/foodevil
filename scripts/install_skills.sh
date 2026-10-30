#!/usr/bin/env bash
# Official Remotion skills (not stored in this repo): clones remotion-dev/skills into .claude/skills/.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
git clone -q --depth 1 https://github.com/remotion-dev/skills "$tmp/remotion"
for d in "$tmp"/remotion/skills/*/; do cp -r "$d" ".claude/skills/$(basename "$d")"; done
rm -rf "$tmp"
echo "remotion skills installed into .claude/skills/"
