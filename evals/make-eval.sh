#!/usr/bin/env bash
set -euo pipefail

[[ $# -eq 2 || $# -eq 3 ]] || { echo "Usage: evals/make-eval.sh <plain-css|css-modules|tailwind> <title> [output-folder]" >&2; exit 1; }

evals="$(cd "$(dirname "$0")" && pwd)"
repo="$(dirname "$evals")"
framework="$1"
title="$2"
folder="${3:-$evals/$framework}"
[[ -e "$folder" ]] && { echo "Exists: $folder" >&2; exit 1; }

mkdir -p "$folder"
cp -R "$evals/kit/." "$folder/"
cp "$repo/PRINCIPLE.md" "$repo/SPEC.md" "$folder/"
mkdir -p "$folder/src/components"

python3 - "$evals/brief.md" "$evals/frameworks/$framework.md" "$title" > "$folder/BRIEF.md" <<'PY'
import sys
from pathlib import Path
brief = Path(sys.argv[1]).read_text()
section = Path(sys.argv[2]).read_text().strip()
print(brief.replace("__FRAMEWORK__", section).replace("__TITLE__", sys.argv[3]), end="")
PY

plugins="react()"
imports='import react from "@vitejs/plugin-react";'
tailwind_deps=""
if [[ "$framework" == "tailwind" ]]; then
  plugins="react(), tailwindcss()"
  imports="$imports
import tailwindcss from \"@tailwindcss/vite\";"
  tailwind_deps=', "tailwindcss": "^4.3.5", "@tailwindcss/vite": "^4.3.5"'
fi

cat > "$folder/vite.config.ts" <<TS
import { defineConfig } from "vite";
$imports

export default defineConfig({
  plugins: [$plugins],
  build: {
    rollupOptions: {
      input: { index: "index.html", fixtures: "fixtures.html" },
    },
  },
});
TS

cat > "$folder/package.json" <<JSON
{
  "name": "jun-scale-ui-eval-$framework",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.3.1",
    "react-dom": "^19.3.1"
  },
  "devDependencies": {
    "@types/react": "^19.3.3",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.3.0",
    "typescript": "^5.9.0",
    "vite": "^8.3.8"$tailwind_deps
  }
}
JSON

pnpm -C "$folder" install >/dev/null
echo "$folder"
