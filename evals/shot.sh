#!/usr/bin/env bash
set -euo pipefail

[[ $# -ge 2 ]] || { echo "Usage: evals/shot.sh <eval-folder> <css-selector> [query]" >&2; exit 1; }

evals="$(cd "$(dirname "$0")" && pwd)"
repo="$(dirname "$evals")"
folder="${1%/}"
[[ "$folder" == /* ]] || folder="$evals/$folder"
selector="$2"
query="${3:-}"
name="$(basename "$folder")"
out="$repo/screenshots/eval-$name"
port=$((20000 + RANDOM % 20000))

pnpm -C "$folder" build >/dev/null
python3 -m http.server "$port" --bind 127.0.0.1 --directory "$folder/dist" >/dev/null 2>&1 &
disown
server=$!
session="evals-shot-$$"
trap 'kill $server 2>/dev/null; playwright-cli -s="$session" close >/dev/null 2>&1' EXIT
sleep 1
mkdir -p "$repo/screenshots"
rm -f "$out"-[0-9]*.png

playwright-cli -s="$session" open >/dev/null
playwright-cli -s="$session" run-code "async page => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('http://127.0.0.1:$port/index.html${query:+?$query}');
  await page.waitForSelector('[data-ready]');
  await page.evaluate(() => document.fonts.ready);
  const items = page.locator('$selector');
  const count = await items.count();
  for (let index = 0; index < count; index++) {
    await items.nth(index).screenshot({ path: '$out-' + (index + 1) + '.png' });
  }
}" >/dev/null
ls "$out"-[0-9]*.png | sort -V
