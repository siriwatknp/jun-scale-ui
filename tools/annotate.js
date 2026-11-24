const LABEL_COLOR = "#e5007a";
const MISMATCH_COLOR = "#d40000";
const PIXEL_TOLERANCE = 0.05;

function parseSpec(spec) {
  return spec
    .trim()
    .split(/\s+/)
    .map((entry) => {
      const base = entry.match(/^([a-z-]+)=([\d.]+)$/);
      if (base) {
        return { property: base[1], base: Number(base[2]) };
      }
      const [property, token] = entry.split(":");
      return { property, token };
    });
}

function valuesMatch(actual, expected) {
  if (actual === expected) {
    return true;
  }
  const actualPixels = parseFloat(actual);
  const expectedPixels = parseFloat(expected);
  return (
    actual.endsWith("px") &&
    expected.endsWith("px") &&
    Math.abs(actualPixels - expectedPixels) <= PIXEL_TOLERANCE
  );
}

function resolveOnSibling(element, property, cssValue) {
  const probe = element.cloneNode(false);
  probe.removeAttribute("id");
  probe.removeAttribute("data-annotate");
  probe.style.setProperty(property, cssValue);
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  element.after(probe);
  const value = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return value;
}

function formatPixels(value) {
  return value.endsWith("px") ? `${Math.round(parseFloat(value) * 10) / 10}px` : value;
}

function describe(element, { property, token, base }) {
  const style = getComputedStyle(element);
  const actual = style.getPropertyValue(property);
  if (base !== undefined) {
    const scale = style.getPropertyValue("--scale").trim();
    const expected = resolveOnSibling(element, property, `calc(${base}px * var(--scale))`);
    const matches = valuesMatch(actual, expected);
    const verdict = matches ? "✓" : `✗ expected ${formatPixels(expected)}`;
    return { text: `${property}: ${formatPixels(actual)} = ${base} × ${scale} ${verdict}`, matches };
  }
  if (!token) {
    return { text: `${property}: ${formatPixels(actual)}`, matches: true };
  }
  const expected = resolveOnSibling(element, property, `var(${token})`);
  const matches = valuesMatch(actual, expected);
  const verdict = matches ? "✓" : `✗ token = ${expected}`;
  return { text: `${property}: ${formatPixels(actual)} ← ${token} ${verdict}`, matches };
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

  const placeRight = element.dataset.annotatePlace === "right";
  const label = document.createElement("div");
  Object.assign(label.style, {
    position: "absolute",
    left: placeRight ? "100%" : "0",
    top: placeRight ? "0" : "100%",
    marginLeft: placeRight ? "6px" : "0",
    marginTop: placeRight ? "0" : "2px",
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
