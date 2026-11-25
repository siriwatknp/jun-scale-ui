import json
import re
import sys

raw = sys.stdin.read()
match = re.search(r"### Result\s*\n(.*?)\n(###|$)", raw, re.S)
if not match:
    print(raw)
    sys.exit(1)
text = match.group(1).strip()
data = json.loads(json.loads(text)) if text.startswith('"') else json.loads(text)
if "error" in data:
    print(data["error"])
    sys.exit(1)
print(f"{data['total']} checks, {data['failed']} failed")
for test, counts in data["byTest"].items():
    mark = "x" if counts["failed"] else "ok"
    print(f"  [{mark}] {test}: {counts['total'] - counts['failed']}/{counts['total']}")
for failure in data["failures"]:
    print(f"    - {failure['test']} | {failure['label']} | {failure['detail']}")
sys.exit(1 if data["failed"] else 0)
