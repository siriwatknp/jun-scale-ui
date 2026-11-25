#!/usr/bin/env bash
set -euo pipefail

[[ $# -eq 1 ]] || { echo "Usage: verify/run.sh <implementation-folder-relative-to-verify>" >&2; exit 1; }

root="$(cd "$(dirname "$0")" && pwd)"
url="file://$root/index.html?impl=$1"
session="verify-$$"

playwright-cli -s="$session" open >/dev/null
trap 'playwright-cli -s="$session" close >/dev/null 2>&1' EXIT
playwright-cli -s="$session" run-code "async page => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('$url');
  await page.waitForSelector('[data-done]', { state: 'attached', timeout: 60000 });
  const results = await page.evaluate(() => window.verifyResults ?? { error: document.querySelector('[data-summary]').textContent });
  return JSON.stringify(results);
}" | python3 "$root/report.py"
