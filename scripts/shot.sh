#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: scripts/shot.sh <page-dir-or-html-file> [--width <px>] [--height <px>] [--annotate] [--wait <selector>] [--selector <css>] [--param <key=value>]... [--name <suffix>]" >&2
  exit 1
}

[[ $# -ge 1 ]] || usage
target="${1%/}"
shift

width=1280
height=800
annotate=false
suffix=""
params=()
wait_selector=""
element_selector=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --width) width="$2"; shift 2 ;;
    --height) height="$2"; shift 2 ;;
    --annotate) annotate=true; shift ;;
    --name) suffix="-$2"; shift 2 ;;
    --param) params+=("$2"); shift 2 ;;
    --wait) wait_selector="$2"; shift 2 ;;
    --selector) element_selector="$2"; shift 2 ;;
    *) usage ;;
  esac
done

root="$(cd "$(dirname "$0")/.." && pwd)"
if [[ "$target" == *.html ]]; then
  page="$root/$target"
  slug="$(basename "$(dirname "$target")")-$(basename "$target" .html)"
else
  page="$root/$target/index.html"
  slug="$(basename "$target")"
fi
[[ -f "$page" ]] || { echo "Not found: $page" >&2; exit 1; }

out="$root/screenshots/$slug-${width}w$suffix"
query=()
for param in ${params[@]+"${params[@]}"}; do
  query+=("$param")
  out="$out-${param/=/-}"
done
if $annotate; then
  query+=("annotate")
  out="$out-annotated"
fi
out="$out.png"
url="file://$page"
if [[ ${#query[@]} -gt 0 ]]; then
  url="$url?$(IFS='&'; echo "${query[*]}")"
fi
mkdir -p "$root/screenshots"

if $annotate && [[ -z "$wait_selector" ]]; then
  wait_selector="[data-annotated]"
fi
wait_step=""
if [[ -n "$wait_selector" ]]; then
  wait_step="await page.waitForSelector('$wait_selector', { state: 'attached' });"
fi

session="jun-scale-ui-$$"
playwright-cli -s="$session" open >/dev/null
trap 'playwright-cli -s="$session" close >/dev/null 2>&1' EXIT
if [[ -n "$element_selector" ]]; then
  rm -f "${out%.png}"-[0-9]*.png
  capture="const items = page.locator('$element_selector');
  const count = await items.count();
  for (let index = 0; index < count; index++) {
    await items.nth(index).screenshot({ path: '${out%.png}-' + (index + 1) + '.png' });
  }"
else
  capture="await page.screenshot({ path: '$out', fullPage: true });"
fi

playwright-cli -s="$session" run-code "async page => {
  await page.setViewportSize({ width: $width, height: $height });
  await page.goto('$url');
  $wait_step
  $capture
}" >/dev/null

if [[ -n "$element_selector" ]]; then
  ls "${out%.png}"-[0-9]*.png 2>/dev/null | sort -V || { echo "No element matched: $element_selector" >&2; exit 1; }
else
  [[ -f "$out" ]] || { echo "Screenshot failed: $out" >&2; exit 1; }
  echo "$out"
fi
