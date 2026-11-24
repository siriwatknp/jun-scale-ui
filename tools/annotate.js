const LABEL_COLOR = "#e5007a";
const MISMATCH_COLOR = "#d40000";

function parseSpec(spec) {
  return spec
    .trim()
    .split(/\s+/)
    .map((entry) => {
      const [property, token] = entry.split(":");
      return { property, token };
    });
}

function resolveTokenOnSibling(element, property, token) {
  const probe = element.cloneNode(false);
  probe.removeAttribute("id");
  probe.removeAttribute("data-annotate");
  probe.style.setProperty(property, `var(${token})`);
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  element.after(probe);
  const value = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return value;
}

function describe(element, { property, token }) {
  const actual = getComputedStyle(element).getPropertyValue(property);
  if (!token) {
    return { text: `${property}: ${actual}`, matches: true };
  }
  const expected = resolveTokenOnSibling(element, property, token);
  const matches = expected === actual;
  const verdict = matches ? "✓" : `✗ token = ${expected}`;
  return { text: `${property}: ${actual} ← ${token} ${verdict}`, matches };
}

function drawOverlay(element, layer) {
  const rect = element.getBoundingClientRect();
  const lines = parseSpec(element.dataset.annotate).map((entry) => describe(element, entry));
  const allMatch = lines.every((line) => line.matches);
  const color = allMatch ? LABEL_COLOR : MISMATCH_COLOR;

  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "absolute",
    left: `${rect.left + scrollX}px`,
    top: `${rect.top + scrollY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    outline: `1px dashed ${color}`,
  });

  const label = document.createElement("div");
  Object.assign(label.style, {
    position: "absolute",
    left: "0",
    top: "100%",
    marginTop: "2px",
    padding: "2px 4px",
    background: color,
    color: "white",
    font: "500 11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace",
    whiteSpace: "pre",
    borderRadius: "2px",
  });
  const name = element.dataset.annotateName;
  label.textContent = [name, ...lines.map((line) => line.text)].filter(Boolean).join("\n");

  box.append(label);
  layer.append(box);
}

function annotate() {
  document.getElementById("annotation-layer")?.remove();
  const layer = document.createElement("div");
  layer.id = "annotation-layer";
  Object.assign(layer.style, {
    position: "absolute",
    inset: "0 auto auto 0",
    pointerEvents: "none",
    zIndex: "2147483647",
  });
  document.body.append(layer);
  document.querySelectorAll("[data-annotate]").forEach((element) => drawOverlay(element, layer));
  document.documentElement.dataset.annotated = "true";
}

if (new URLSearchParams(location.search).has("annotate")) {
  addEventListener("load", annotate);
}
