const QUARTER_STEPS = [0.75, 1.25, 1.5];
const TOLERANCE = 0.05;
const BOX_PROPERTIES_EXEMPT_FROM_WHOLE_PIXELS = new Set(["font-size", "border-top-left-radius"]);
const BRIEF = [
  ["StatusDot", ".StatusDot", "width", 8],
  ["Icon", ".Icon", "width", 16],
  ["Badge", ".Badge", "height", 20],
  ["Badge", ".Badge", "padding-left", 8],
  ["Checkbox", ".Checkbox", "width", 16],
  ["Radio", ".Radio", "width", 16],
  ["Switch", ".Switch", "width", 40],
  ["Switch", ".Switch", "height", 24],
  ["Avatar", ".Avatar", "width", 32],
  ["Button", ".Button", "height", 32],
  ["Button", ".Button", "padding-left", 12],
  ["Button", ".Button .Icon", "width", 16],
  ["Input", ".Input", "width", 180],
  ["Input", ".Input", "height", 32],
  ["Select", ".Select-trigger", "height", 32],
  ["Field", ".Field", "width", 240],
  ["Field", ".Field .Input", "height", 32],
  ["Callout", ".Callout", "padding-top", 16],
];

const results = [];
const stage = document.querySelector("[data-stage]");

function record(test, label, passed, detail = "") {
  results.push({ test, label, passed, detail });
}

function fixtureNames() {
  return [...document.querySelectorAll("template[data-fixture]")].map((template) => template.dataset.fixture);
}

function groupOf(name) {
  return Number(document.querySelector(`template[data-fixture="${name}"]`).dataset.group);
}

function mount(name, style = "", innerStyle = null) {
  const outer = document.createElement("div");
  outer.className = "case";
  outer.setAttribute("style", style);
  let target = outer;
  if (innerStyle !== null) {
    target = document.createElement("div");
    target.setAttribute("style", innerStyle);
    outer.append(target);
  }
  target.append(document.querySelector(`template[data-fixture="${name}"]`).content.cloneNode(true));
  stage.append(outer);
  return outer;
}

function px(element, property, pseudo = null) {
  return parseFloat(getComputedStyle(element, pseudo).getPropertyValue(property));
}

const near = (a, b) => Math.abs(a - b) <= TOLERANCE;
const whole = (value) => near(value, Math.round(value));
const round = (value) => Math.round(value * 100) / 100;

function checkedElements(root) {
  return [...root.querySelectorAll("[data-check]")];
}

function visiblePseudo(element) {
  return ["::before", "::after"].find((pseudo) => {
    const style = getComputedStyle(element, pseudo);
    return style.content !== "none" && parseFloat(style.width) > 0;
  });
}

function rectOf(element) {
  return element.getBoundingClientRect();
}

function testBrief() {
  BRIEF.forEach(([name, selector, property, expected]) => {
    const element = mount(name).querySelector(selector);
    const actual = element ? px(element, property) : NaN;
    record("brief sizes at scale 1", `${name} ${selector} ${property}`, near(actual, expected), `${round(actual)} expected ${expected}`);
  });
}

function testProportionalAndWhole() {
  fixtureNames()
    .filter((name) => name !== "ButtonWithBadge")
    .forEach((name) => {
    const base = checkedElements(mount(name, "--scale: 1"));
    QUARTER_STEPS.forEach((scale) => {
      const scaled = checkedElements(mount(name, `--scale: ${scale}`));
      base.forEach((element, index) => {
        const label = element.getAttribute("class");
        element.dataset.check.split(" ").forEach((property) => {
          const v1 = px(element, property);
          const vs = px(scaled[index], property);
          record("scales with --scale", `${name} .${label} ${property} at ${scale}`, near(vs, v1 * scale), `${round(vs)} expected ${round(v1 * scale)}`);
          if (!BOX_PROPERTIES_EXEMPT_FROM_WHOLE_PIXELS.has(property)) {
            record("whole pixels at 0.25 steps", `${name} .${label} ${property} at ${scale}`, whole(vs), `${round(vs)}`);
          }
        });
        const pseudo = visiblePseudo(element);
        if (pseudo) {
          ["width", "height"].forEach((property) => {
            const v1 = px(element, property, pseudo);
            const vs = px(scaled[index], property, pseudo);
            record("scales with --scale", `${name} .${label}${pseudo} ${property} at ${scale}`, near(vs, v1 * scale), `${round(vs)} expected ${round(v1 * scale)}`);
            record("whole pixels at 0.25 steps", `${name} .${label}${pseudo} ${property} at ${scale}`, whole(vs), `${round(vs)}`);
          });
        }
      });
    });
  });
}

function gapsAround(parent, child) {
  const p = rectOf(parent);
  const c = rectOf(child);
  return { top: c.top - p.top, bottom: p.bottom - c.bottom, left: c.left - p.left, right: p.right - c.right };
}

function testCentering() {
  [1, ...QUARTER_STEPS].forEach((scale) => {
    fixtureNames().forEach((name) => {
      const root = mount(name, `--scale: ${scale}`);
      root.querySelectorAll("[data-center-both], [data-center-y]").forEach((parent) => {
        const both = parent.hasAttribute("data-center-both");
        const child = parent.querySelector(parent.dataset.centerBoth ?? parent.dataset.centerY);
        const gaps = gapsAround(parent, child);
        const label = `${name} ${child.getAttribute("class")} in .${parent.getAttribute("class")} at ${scale}`;
        record("centered with equal gaps", `${label} (top, bottom)`, near(gaps.top, gaps.bottom), `${round(gaps.top)} vs ${round(gaps.bottom)}`);
        if (both) {
          record("centered with equal gaps", `${label} (left, right)`, near(gaps.left, gaps.right), `${round(gaps.left)} vs ${round(gaps.right)}`);
        }
        if (scale !== 1) {
          record("whole pixels at 0.25 steps", `${label} gap`, whole(gaps.top), `${round(gaps.top)}`);
        } else {
          const outerBox = both ? rectOf(parent).width : rectOf(parent).height;
          const innerBox = both ? rectOf(child).width : rectOf(child).height;
          const difference = outerBox - innerBox;
          record("centered pairs differ by a multiple of 8", label, near(difference % 8, 0) || near(difference % 8, 8), `difference ${round(difference)}`);
        }
      });
      root.querySelectorAll("[data-pseudo-center]").forEach((element) => {
        const pseudo = visiblePseudo(element);
        const label = `${name} .${element.getAttribute("class")} part at ${scale}`;
        if (!pseudo) {
          record("centered with equal gaps", label, false, "no visible ::before or ::after part");
          return;
        }
        const outer = rectOf(element).height;
        const inner = px(element, "height", pseudo);
        const gap = (outer - inner) / 2;
        if (scale === 1) {
          record("centered pairs differ by a multiple of 8", label, near((outer - inner) % 8, 0) || near((outer - inner) % 8, 8), `difference ${round(outer - inner)}`);
        } else {
          record("whole pixels at 0.25 steps", `${label} gap`, whole(gap), `${round(gap)}`);
        }
        if (element.hasAttribute("data-pseudo-inset")) {
          const style = getComputedStyle(element, pseudo);
          const top = parseFloat(style.top);
          const left = parseFloat(style.left);
          const transform = new DOMMatrix(style.transform === "none" ? undefined : style.transform);
          const insetTop = top + px(element, "border-top-width") + transform.m42;
          const insetLeft = left + px(element, "border-left-width") + transform.m41;
          record("centered with equal gaps", `${label} (top, bottom, left)`, near(insetTop, gap) && near(insetLeft, gap), `top ${round(insetTop)}, bottom ${round(outer - inner - insetTop)}, left ${round(insetLeft)}`);
        }
      });
      root.querySelectorAll("[data-icon-on-first-line]").forEach((element) => {
        const icon = element.querySelector(".Icon");
        const contentTop = rectOf(element).top + px(element, "border-top-width") + px(element, "padding-top");
        const lineHeight = px(element, "line-height");
        const offset = rectOf(icon).top - contentTop;
        const expected = (lineHeight - rectOf(icon).height) / 2;
        const label = `${name} Icon on the first line at ${scale}`;
        record("centered with equal gaps", label, near(offset, expected), `offset ${round(offset)} expected ${round(expected)}`);
        if (scale === 1) {
          record("centered pairs differ by a multiple of 8", label, near((lineHeight - rectOf(icon).height) % 8, 0), `difference ${round(lineHeight - rectOf(icon).height)}`);
        } else {
          record("whole pixels at 0.25 steps", `${label} gap`, whole(offset), `${round(offset)}`);
        }
      });
      root.querySelectorAll("[data-space-before]").forEach((element) => {
        const previous = element.previousElementSibling;
        const space = rectOf(element).top - rectOf(previous).bottom;
        const base = 8 * scale;
        record("scales with --scale", `${name} space before .${element.getAttribute("class")} at ${scale}`, near(space, base), `${round(space)} expected ${round(base)}`);
      });
    });
  });
}

function firstMeasure(root) {
  const element = root.querySelector("[data-check]");
  const property = element.dataset.check.split(" ")[0];
  return { element, property, value: px(element, property) };
}

function testGroupMembership() {
  for (let group = 1; group <= 7; group++) {
    fixtureNames().forEach((name) => {
      if (name === "ButtonWithBadge") {
        return;
      }
      const base = firstMeasure(mount(name)).value;
      const { property, value } = firstMeasure(mount(name, `--scale-group${group}: 0.5`));
      const expected = groupOf(name) === group ? base * 0.5 : base;
      record("only its own group factor changes it", `${name} ${property} with --scale-group${group}: 0.5`, near(value, expected), `${round(value)} expected ${round(expected)}`);
    });
  }
}

function measure(name, style, selector, property, innerStyle = null) {
  const element = mount(name, style, innerStyle).querySelector(selector);
  return element ? px(element, property) : NaN;
}

function expectEqual(test, label, actual, expected) {
  record(test, label, near(actual, expected), `${round(actual)} expected ${round(expected)}`);
}

function testFactorBehavior() {
  const buttonHeight = measure("Button", "", ".Button", "height");
  const buttonIcon = measure("Button", "", ".Button .Icon", "width");
  const badgeHeight = measure("Badge", "", ".Badge", "height");
  const icon = measure("Icon", "", ".Icon", "width");
  const checkboxIcon = measure("Checkbox", "", ".Checkbox .Icon", "width");
  const calloutIcon = measure("Callout", "", ".Callout .Icon", "width");
  const fieldWidth = measure("Field", "", ".Field", "width");
  const fieldInput = measure("Field", "", ".Field .Input", "height");
  const fieldLabel = measure("Field", "", ".Field-label", "font-size");

  expectEqual("factors don't multiply along nesting", "Button with --scale-group5: 0.75", measure("Button", "--scale-group5: 0.75", ".Button", "height"), buttonHeight * 0.75);
  expectEqual("factors don't multiply along nesting", "Icon inside that Button keeps its size", measure("Button", "--scale-group5: 0.75", ".Button .Icon", "width"), buttonIcon);

  const both = "--scale: 1.25; --scale-group5: 0.75";
  expectEqual("global scale times group factor", `Button with ${both}`, measure("Button", both, ".Button", "height"), buttonHeight * 1.25 * 0.75);
  expectEqual("global scale times group factor", `Icon in that Button`, measure("Button", both, ".Button .Icon", "width"), buttonIcon * 1.25);
  expectEqual("global scale times group factor", `Badge with ${both}`, measure("Badge", both, ".Badge", "height"), badgeHeight * 1.25);

  expectEqual("nearest value wins", "standalone Icon with --scale-group2: 1.5", measure("Icon", "--scale-group2: 1.5", ".Icon", "width"), icon * 1.5);
  expectEqual("nearest value wins", "Icon in Button with --scale-group2: 1.5", measure("Button", "--scale-group2: 1.5", ".Button .Icon", "width"), buttonIcon * 1.5);
  expectEqual("nearest value wins", "Checkbox Icon keeps the factor Checkbox sets", measure("Checkbox", "--scale-group2: 1.5", ".Checkbox .Icon", "width"), checkboxIcon);
  expectEqual("nearest value wins", "Callout Icon keeps the factor Callout sets", measure("Callout", "--scale-group2: 1.5", ".Callout .Icon", "width"), calloutIcon);
  expectEqual("nearest value wins", "inner --scale-group5: 1.5 inside outer 0.5", measure("Button", "--scale-group5: 0.5", ".Button", "height", "--scale-group5: 1.5"), buttonHeight * 1.5);
  expectEqual("nearest value wins", "inner --scale: 0.75 inside outer 1.5", measure("Button", "--scale: 1.5", ".Button", "height", "--scale: 0.75"), buttonHeight * 0.75);

  expectEqual("a component sets a smaller group's factor", "Badge inside a Button that sets --scale-group3: 0.5", measure("ButtonWithBadge", "", ".Badge", "height"), badgeHeight * 0.5);
  expectEqual("a component sets a smaller group's factor", "same, with --scale: 1.5", measure("ButtonWithBadge", "--scale: 1.5", ".Badge", "height"), badgeHeight * 0.5 * 1.5);

  expectEqual("same group shares one factor", "Field width with --scale-group5: 0.75", measure("Field", "--scale-group5: 0.75", ".Field", "width"), fieldWidth * 0.75);
  expectEqual("same group shares one factor", "Input in Field with --scale-group5: 0.75", measure("Field", "--scale-group5: 0.75", ".Field .Input", "height"), fieldInput * 0.75);
  expectEqual("same group shares one factor", "Field label text with --scale-group5: 0.75", measure("Field", "--scale-group5: 0.75", ".Field-label", "font-size"), fieldLabel * 0.75);

  expectEqual("an unset or invalid value counts as 1", "Button with --scale-group5: oops", measure("Button", "--scale-group5: oops", ".Button", "height"), buttonHeight);
  expectEqual("an unset or invalid value counts as 1", "Button with --scale: oops", measure("Button", "--scale: oops", ".Button", "height"), buttonHeight);
  expectEqual("an invalid value is ignored", "inner --scale-group5: oops inside outer 0.5", measure("Button", "--scale-group5: 0.5", ".Button", "height", "--scale-group5: oops"), buttonHeight * 0.5);
  expectEqual("an invalid value is ignored", "inner --scale: oops inside outer 1.5", measure("Button", "--scale: 1.5", ".Button", "height", "--scale: oops"), buttonHeight * 1.5);
}

function report() {
  const failed = results.filter((result) => !result.passed);
  document.querySelector("[data-summary]").textContent = `${results.length} checks, ${failed.length} failed`;
  const byTest = {};
  results.forEach((result) => {
    byTest[result.test] ??= { total: 0, failed: 0 };
    byTest[result.test].total += 1;
    byTest[result.test].failed += result.passed ? 0 : 1;
  });
  const list = document.querySelector("[data-results]");
  Object.entries(byTest).forEach(([test, counts]) => {
    const row = document.createElement("li");
    row.textContent = `${counts.failed ? "✗" : "✓"} ${test}: ${counts.total - counts.failed}/${counts.total}`;
    row.className = counts.failed ? "is-fail" : "is-pass";
    list.append(row);
  });
  failed.forEach((result) => {
    const row = document.createElement("li");
    row.className = "is-fail detail";
    row.textContent = `  ${result.test} · ${result.label} · ${result.detail}`;
    list.append(row);
  });
  window.verifyResults = { total: results.length, failed: failed.length, byTest, failures: failed };
  document.documentElement.dataset.done = "true";
}

function run() {
  testBrief();
  testProportionalAndWhole();
  testCentering();
  testGroupMembership();
  testFactorBehavior();
  report();
}

const implementation = new URLSearchParams(location.search).get("impl");
const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = `${implementation}/scale.css`;
stylesheet.addEventListener("load", () => document.fonts.ready.then(run));
stylesheet.addEventListener("error", () => {
  document.querySelector("[data-summary]").textContent = `could not load ${stylesheet.href}`;
  document.documentElement.dataset.done = "true";
});
document.head.append(stylesheet);
