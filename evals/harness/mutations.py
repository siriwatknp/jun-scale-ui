import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

repo = Path(__file__).resolve().parents[2]

MUTATIONS = [
    ("Button doesn't pass its factor to group 2", [("src/groups.css", "  --scale-group2: var(--scale-group5);\n", "")]),
    ("Checkbox loses its 0.5 Icon default", [("src/components/checkbox.css", "  --scale-group2: calc(0.5 * var(--scale-group3));\n", "")]),
    ("Callout Icon dropped", [("src/components/callout.css", "  --scale-group2: calc(0.75 * var(--scale-group6));\n", "")]),
    ("Select trigger Avatar default dropped", [("src/components/select.css", "  --scale-group4: calc(0.75 * var(--scale-group5));\n", "")]),
    ("Field label Inline default dropped", [("src/components/field.css", "  --scale-group3: calc(0.8 * var(--scale-group5));\n  display: flex;", "  display: flex;")]),
    ("Callout Icon placed with a fixed offset", [("src/components/callout.css", "  grid-row: 1;\n  align-self: center;", "  grid-row: 1;\n  align-self: start;\n  margin-top: 4px;")]),
    ("Input border scales", [("src/components/input.css", "  border: 1px solid var(--color-border);\n  border-radius: calc(var(--radius-2)", "  border: calc(1px * var(--component-scale)) solid var(--color-border);\n  border-radius: calc(var(--radius-2)")]),
    ("Badge padding doesn't scale", [("src/components/badge.css", "  padding: 0 calc(var(--space-2) * var(--component-scale));", "  padding: 0 8px;")]),
    ("Badge line height doesn't scale", [("src/components/badge.css", "  line-height: calc(var(--line-height-1) * var(--component-scale));", "  line-height: 16px;")]),
    ("Button radius doesn't scale", [("src/components/button.css", "  border-radius: calc(var(--radius-2) * var(--component-scale));", "  border-radius: 4px;")]),
    ("Avatar in group 3 instead of 4", [("src/groups.css", ".Avatar {\n  --component-scale: calc(var(--scale) * var(--scale-group4));\n  --scale-group1: var(--scale-group4);\n  --scale-group2: var(--scale-group4);\n  --scale-group3: var(--scale-group4);\n}", ".Avatar {\n  --component-scale: calc(var(--scale) * var(--scale-group3));\n  --scale-group1: var(--scale-group3);\n  --scale-group2: var(--scale-group3);\n}")]),
    ("Group factor ignores the global scale", [("src/groups.css", "  --component-scale: calc(var(--scale) * var(--scale-group5));", "  --component-scale: var(--scale-group5);")]),
    ("Select trigger computes its own scale", [("src/components/select.css", ".Select-trigger {\n", ".Select-trigger {\n  --component-scale: calc(var(--scale) * var(--scale-group5));\n")]),
    ("Scaled size stored on :root", [
        ("src/tokens.css", "  --space-6: 32px;", "  --space-6: calc(32px * var(--scale));"),
        ("src/components/button.css", "  height: calc(var(--space-6) * var(--component-scale));", "  height: var(--space-6);"),
    ]),
    ("Switch thumb inset doesn't scale", [("src/components/switch.css", "  top: calc(var(--space-1) * var(--component-scale));\n  left: calc(var(--space-1) * var(--component-scale));", "  top: 4px;\n  left: 4px;")]),
    ("Field resets group 5 for its children", [("src/components/field.css", ".Field > .Input,\n.Field > .TextArea {\n  width: auto;", ".Field > .Input,\n.Field > .TextArea {\n  --scale-group5: 1;\n  width: auto;")]),
    ("Checkbox default beats the user with !important", [("src/components/checkbox.css", "  --scale-group2: calc(0.5 * var(--scale-group3));", "  --scale-group2: calc(0.5 * var(--scale-group3)) !important;")]),
    ("Button padding off the 4px grid", [("src/components/button.css", "  padding: 0 calc(var(--space-3) * var(--component-scale));", "  padding: 0 calc(13px * var(--component-scale));")]),
    ("Button sets its own group factor", [("src/components/button.css", ".Button {\n", ".Button {\n  --scale-group5: 1;\n")]),
    ("Kbd font size doesn't scale", [("src/components/kbd.css", "  font-size: calc(var(--font-size-1) * var(--component-scale));", "  font-size: 12px;")]),
]


def run(root):
    env = dict(os.environ, BROWSERS="chrome")
    result = subprocess.run([str(repo / "evals/run.sh"), "reference", str(root)], capture_output=True, text=True, env=env)
    match = re.search(r"(\d+) checks, (\d+) failed", result.stdout)
    if not match:
        return None, result.stdout + result.stderr
    failures = [line.strip()[2:] for line in result.stdout.splitlines() if line.strip().startswith("- ")]
    return int(match.group(2)), failures


def main():
    selected = sys.argv[1:]
    rows = []
    with tempfile.TemporaryDirectory(dir=os.environ.get("TMPDIR")) as temp:
        for name, edits in MUTATIONS:
            if selected and not any(term.lower() in name.lower() for term in selected):
                continue
            root = Path(temp) / re.sub(r"\W+", "-", name)
            shutil.copytree(repo / "src", root / "src")
            shutil.copytree(repo / "evals/harness", root / "evals/harness")
            for file, old, new in edits:
                path = root / file
                text = path.read_text()
                if text.count(old) != 1:
                    sys.exit(f"{name}: expected one match in {file}")
                path.write_text(text.replace(old, new))
            failed, detail = run(root)
            caught = bool(failed)
            first = detail[0] if isinstance(detail, list) and detail else ""
            rows.append((name, caught, failed, first))
            print(f"{'caught' if caught else 'MISSED'}  {name}  ({failed} failed)  {first}", flush=True)
    missed = [row for row in rows if not row[1]]
    print(f"\n{len(rows) - len(missed)}/{len(rows)} caught")
    sys.exit(1 if missed else 0)


main()
