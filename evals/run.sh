#!/usr/bin/env bash
set -euo pipefail

[[ $# -ge 1 && $# -le 2 ]] || { echo "Usage: BROWSERS='chrome webkit firefox' evals/run.sh <eval-folder | reference> [root-for-reference]" >&2; exit 1; }

evals="$(cd "$(dirname "$0")" && pwd)"
repo="$(dirname "$evals")"
port=$((20000 + RANDOM % 20000))

if [[ "$1" == "reference" ]]; then
  serve="${2:-$repo}"
  path="evals/harness/reference.html"
else
  folder="${1%/}"
  [[ "$folder" == /* ]] || folder="$evals/$folder"
  pnpm --silent -C "$folder" build >/dev/null
  cp "$evals/harness/harness.js" "$folder/dist/harness.js"
  serve="$folder/dist"
  path="fixtures.html"
fi

python3 -m http.server "$port" --bind 127.0.0.1 --directory "$serve" >/dev/null 2>&1 &
disown
server=$!
session="evals-$$"
trap 'kill $server 2>/dev/null; playwright-cli -s="$session" close >/dev/null 2>&1' EXIT
sleep 1

status=0
for browser in ${BROWSERS:-chrome webkit firefox}; do
  printf '%-8s ' "$browser"
  playwright-cli -s="$session" open --browser="$browser" >/dev/null
  playwright-cli -s="$session" run-code "async page => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto('http://127.0.0.1:$port/$path');
    await page.waitForSelector('[data-done]', { state: 'attached', timeout: 60000 });
    let results = await page.evaluate(() => window.verifyResults ?? { error: document.querySelector('[data-summary]').textContent });
    if (!results.error) {
      results = await ($(cat "$evals/harness/pixels.js"))(page, results);
    }
    return JSON.stringify(results);
  }" | python3 "$repo/verify/report.py" ${VERBOSE:+--verbose} || status=1
  playwright-cli -s="$session" close >/dev/null 2>&1
done
exit $status
