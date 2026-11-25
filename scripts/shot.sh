#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: scripts/shot.sh <page-dir-or-html-file> [--width <px>] [--height <px>] [--annotate] [--wait <selector>] [--param <key=value>]... [--name <suffix>]" >&2
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

while [[ $# -gt 0 ]]; do
  case "$1" in
    --width) width="$2"; shift 2 ;;
    --height) height="$2"; shift 2 ;;
    --annotate) annotate=true; shift ;;
    --name) suffix="-$2"; shift 2 ;;
    --param) params+=("$2"); shift 2 ;;
    --wait) wait_selector="$2"; shift 2 ;;
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
playwright-cli -s="$session" run-code "async page => {
  await page.setViewportSize({ width: $width, height: $height });
  await page.goto('$url');
  $wait_step
  await page.screenshot({ path: '$out', fullPage: true });
}" >/dev/null
[[ -f "$out" ]] || { echo "Screenshot failed: $out" >&2; exit 1; }

echo "$out"
