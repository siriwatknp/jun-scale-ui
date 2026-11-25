import re
import shutil
import sys
from pathlib import Path

verify = Path(__file__).resolve().parent
kit = Path(sys.argv[1])
kit.mkdir(parents=True, exist_ok=True)

shutil.copy(verify.parent / "PRINCIPLE.md", kit / "PRINCIPLE.md")
shutil.copy(verify / "brief.md", kit / "brief.md")

fixtures = (verify / "fixtures.part.html").read_text()
fixtures = re.sub(r'\s(data-check|data-center-both|data-center-y|data-pseudo-center|data-pseudo-inset|data-icon-on-first-line|data-space-before|data-group)(="[^"]*")?', "", fixtures)
blocks = re.findall(r'<template data-fixture="([^"]+)">\s*(.*?)\s*</template>', fixtures, re.S)

rows = "\n".join(
    f'      <tr>\n        <th>{name}</th>\n'
    + "".join(f'        <td style="--scale: {scale}">\n          {markup}\n        </td>\n' for scale in ("1", "1.5"))
    + "      </tr>"
    for name, markup in blocks
)

(kit / "fixtures.html").write_text(f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Fixtures</title>
    <link rel="stylesheet" href="./scale.css" />
    <style>
      body {{ margin: 24px; font-family: system-ui, sans-serif; }}
      th {{ padding: 8px 16px 8px 0; text-align: left; font: 600 12px system-ui, sans-serif; }}
      td {{ padding: 8px 16px; vertical-align: top; }}
    </style>
  </head>
  <body>
    <p>Each row shows one fixture at <code>--scale: 1</code> and <code>--scale: 1.5</code>. Style this markup with <code>scale.css</code>. Don't change the markup.</p>
    <table>
{rows}
    </table>
  </body>
</html>
""")
print(kit)
