#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: scripts/shot.sh <experiment-dir> [--width <px>] [--height <px>] [--annotate] [--name <suffix>]" >&2
  exit 1
}

[[ $# -ge 1 ]] || usage
experiment="${1%/}"
shift

width=1280
height=800
annotate=false
suffix=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --width) width="$2"; shift 2 ;;
    --height) height="$2"; shift 2 ;;
    --annotate) annotate=true; shift ;;
    --name) suffix="-$2"; shift 2 ;;
    *) usage ;;
  esac
done

root="$(cd "$(dirname "$0")/.." && pwd)"
page="$root/$experiment/index.html"
[[ -f "$page" ]] || { echo "Not found: $page" >&2; exit 1; }

slug="$(basename "$experiment")"
url="file://$page"
out="$root/screenshots/$slug-${width}w$suffix"
if $annotate; then
  url="$url?annotate"
  out="$out-annotated"
fi
out="$out.png"
mkdir -p "$root/screenshots"

session="jun-scale-ui-$$"
agent-browser --session "$session" set viewport "$width" "$height" >/dev/null
agent-browser --session "$session" open "$url" >/dev/null
if $annotate; then
  agent-browser --session "$session" wait '[data-annotated]' >/dev/null
fi
agent-browser --session "$session" screenshot "$out" --full >/dev/null
agent-browser --session "$session" close >/dev/null

echo "$out"
