const QUARTER_STEPS = [0.75, 1.25, 1.5];
const TOLERANCE = 0.05;
const BOX_PROPERTIES_EXEMPT_FROM_WHOLE_PIXELS = new Set(["font-size", "border-top-left-radius"]);
const USER_SETTING_FIXTURES = ["ButtonWithBadge", "ButtonScaled"];
const UTILITY_SUFFIX = "ViaUtility";

const BRIEF = [
  ["StatusDot", "StatusDot", "width", 8],
  ["Icon", "Icon", "width", 16],
  ["Spinner", "Spinner", "width", 16],
  ["Badge", "Badge", "height", 20],
  ["Badge", "Badge", "padding-left", 8],
  ["Kbd", "Kbd", "height", 20],
  ["Kbd", "Kbd", "min-width", 20],
  ["Kbd", "Kbd", "padding-left", 4],
  ["Checkbox", "Checkbox", "width", 16],
  ["Checkbox", "Checkbox Icon", "width", 8],
  ["Switch", "Switch", "width", 40],
  ["Switch", "Switch", "height", 24],
  ["Avatar", "Avatar", "width", 32],
  ["Button", "Button", "height", 32],
  ["Button", "Button", "padding-left", 12],
  ["Button", "Button Icon", "width", 16],
  ["IconButton", "IconButton", "width", 32],
  ["IconButton", "IconButton", "height", 32],
  ["IconButton", "IconButton Icon", "width", 16],
  ["Input", "Input", "width", 180],
  ["Input", "Input", "height", 32],
  ["Select", "Select-trigger", "height", 32],
  ["Select", "Select-trigger Avatar", "width", 24],
  ["Field", "Field", "width", 240],
  ["Field", "Field Input", "height", 32],
  ["Callout", "Callout", "padding-top", 16],
  ["Callout", "Callout Icon", "width", 12],
];

const MARKERS = {
  StatusDot: { StatusDot: { check: "width height" } },
  Icon: { Icon: { check: "width height" } },
  Spinner: { Spinner: { check: "width height" } },
  Badge: { Badge: { check: "height padding-left font-size" } },
  Kbd: { Kbd: { check: "height min-width padding-left font-size" } },
  Checkbox: { Checkbox: { check: "width height", centerBoth: "Icon" }, "Checkbox Icon": { check: "width height" } },
  Switch: { Switch: { check: "width height", part: "Switch-thumb", inset: true } },
  Avatar: { Avatar: { check: "width height font-size" } },
  Button: { Button: { check: "height padding-left font-size", centerY: "Icon" }, "Button Icon": { check: "width height" } },
  IconButton: { IconButton: { check: "width height", centerBoth: "Icon" }, "IconButton Icon": { check: "width height" } },
  Input: { Input: { check: "width height padding-left font-size", centerY: "Icon" }, "Input Icon": { check: "width" } },
  Select: { "Select-trigger": { check: "height padding-left font-size", centerY: "Avatar" }, "Select-trigger Avatar": { check: "width height" }, "Select-trigger Icon": { check: "width" } },
  Field: { Field: { check: "width" }, "Field-label": { check: "font-size line-height" }, "Field Input": { check: "height", spaceBefore: true }, "Field-help": { check: "font-size" } },
  Callout: { Callout: { check: "padding-top font-size line-height", iconOnFirstLine: true }, "Callout Icon": { check: "width height" } },
  CheckboxOverride: { Checkbox: { check: "width" }, "Checkbox Icon": { check: "width" } },
  ButtonScaled: { Button: { check: "height" }, "Button Icon": { check: "width" } },
  ButtonWithBadge: { Button: { check: "height" }, "Button Badge": { check: "height" } },
};

const results = [];
const stage = document.querySelector("[data-stage]");

function record(test, label, passed, detail = "") {
  results.push({ test, label, passed, detail });
}

function slot(path) {
  return path.split(" ").map((name) => `[data-slot="${name}"]`).join(" ");
}

function nameOf(element) {
  return element.dataset.slot ?? element.getAttribute("class");
}

function templateOf(name) {
  return document.querySelector(`template[data-fixture="${name}"]`);
}

function allFixtureNames() {
  return [...document.querySelectorAll("template[data-fixture]")].map((template) => template.dataset.fixture);
}

function fixtureNames() {
  return allFixtureNames().filter((name) => !name.endsWith(UTILITY_SUFFIX));
}

function groupOf(name) {
  return Number(templateOf(name).dataset.group);
}

function decorate() {
  allFixtureNames().forEach((name) => {
    const markers = MARKERS[name.replace(UTILITY_SUFFIX, "")];
    if (!markers) {
      return;
    }
    const content = templateOf(name).content;
    Object.entries(markers).forEach(([path, marker]) => {
      const element = content.querySelector(slot(path));
      record("markup carries data-slot", `${name} ${path}`, Boolean(element), element ? "" : "not found");
      if (!element) {
        return;
      }
      element.dataset.check = marker.check;
      if (marker.centerBoth) element.dataset.centerBoth = slot(marker.centerBoth);
      if (marker.centerY) element.dataset.centerY = slot(marker.centerY);
      if (marker.iconOnFirstLine) element.dataset.iconOnFirstLine = "";
      if (marker.spaceBefore) element.dataset.spaceBefore = "";
      if (marker.inset) element.dataset.pseudoInset = "";
      if (marker.part) {
        const part = element.querySelector(slot(marker.part));
        if (part) {
          element.dataset.partCenter = slot(marker.part);
          part.dataset.check = "width height";
        } else {
          element.dataset.pseudoCenter = "";
        }
      }
    });
  });
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
  target.append(templateOf(name).content.cloneNode(true));
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
  BRIEF.forEach(([name, path, property, expected]) => {
    const element = mount(name).querySelector(slot(path));
    const actual = element ? px(element, property) : NaN;
    record("brief sizes at scale 1", `${name} ${path} ${property}`, near(actual, expected), `${round(actual)} expected ${expected}`);
  });
}

function testProportionalAndWhole() {
  fixtureNames()
    .filter((name) => !USER_SETTING_FIXTURES.includes(name))
    .forEach((name) => {
      const base = checkedElements(mount(name, "--scale: 1"));
      QUARTER_STEPS.forEach((scale) => {
        const scaled = checkedElements(mount(name, `--scale: ${scale}`));
        base.forEach((element, index) => {
          const label = nameOf(element);
          element.dataset.check.split(" ").forEach((property) => {
            const v1 = px(element, property);
            const vs = px(scaled[index], property);
            record("scales with --scale", `${name} ${label} ${property} at ${scale}`, near(vs, v1 * scale), `${round(vs)} expected ${round(v1 * scale)}`);
            if (!BOX_PROPERTIES_EXEMPT_FROM_WHOLE_PIXELS.has(property)) {
              record("whole pixels at 0.25 steps", `${name} ${label} ${property} at ${scale}`, whole(vs), `${round(vs)}`);
            }
          });
          const pseudo = element.hasAttribute("data-pseudo-center") ? visiblePseudo(element) : null;
          if (pseudo) {
            ["width", "height"].forEach((property) => {
              const v1 = px(element, property, pseudo);
              const vs = px(scaled[index], property, pseudo);
              record("scales with --scale", `${name} ${label}${pseudo} ${property} at ${scale}`, near(vs, v1 * scale), `${round(vs)} expected ${round(v1 * scale)}`);
              record("whole pixels at 0.25 steps", `${name} ${label}${pseudo} ${property} at ${scale}`, whole(vs), `${round(vs)}`);
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

function differsByEight(difference) {
  return near(difference % 8, 0) || near(difference % 8, 8);
}

function testCentering() {
  [1, ...QUARTER_STEPS].forEach((scale) => {
    fixtureNames().forEach((name) => {
      const root = mount(name, `--scale: ${scale}`);
      root.querySelectorAll("[data-center-both], [data-center-y]").forEach((parent) => {
        const both = parent.hasAttribute("data-center-both");
        const child = parent.querySelector(parent.dataset.centerBoth ?? parent.dataset.centerY);
        const label = `${name} ${child ? nameOf(child) : "child"} in ${nameOf(parent)} at ${scale}`;
        if (!child) {
          record("centered with equal gaps", label, false, "child not found");
          return;
        }
        const gaps = gapsAround(parent, child);
        record("centered with equal gaps", `${label} (top, bottom)`, near(gaps.top, gaps.bottom), `${round(gaps.top)} vs ${round(gaps.bottom)}`);
        if (both) {
          record("centered with equal gaps", `${label} (left, right)`, near(gaps.left, gaps.right), `${round(gaps.left)} vs ${round(gaps.right)}`);
        }
        if (scale !== 1) {
          record("whole pixels at 0.25 steps", `${label} gap`, whole(gaps.top), `${round(gaps.top)}`);
        } else {
          const outerBox = both ? rectOf(parent).width : rectOf(parent).height;
          const innerBox = both ? rectOf(child).width : rectOf(child).height;
          record("centered pairs differ by a multiple of 8", label, differsByEight(outerBox - innerBox), `difference ${round(outerBox - innerBox)}`);
        }
      });
      root.querySelectorAll("[data-part-center]").forEach((element) => {
        const part = element.querySelector(element.dataset.partCenter);
        const gaps = gapsAround(element, part);
        const label = `${name} ${nameOf(part)} in ${nameOf(element)} at ${scale}`;
        record("centered with equal gaps", `${label} (top, bottom)`, near(gaps.top, gaps.bottom), `${round(gaps.top)} vs ${round(gaps.bottom)}`);
        if (scale === 1) {
          record("centered pairs differ by a multiple of 8", label, differsByEight(rectOf(element).height - rectOf(part).height), `difference ${round(rectOf(element).height - rectOf(part).height)}`);
        } else {
          record("whole pixels at 0.25 steps", `${label} gap`, whole(gaps.top), `${round(gaps.top)}`);
        }
      });
      root.querySelectorAll("[data-pseudo-center]").forEach((element) => {
        const pseudo = visiblePseudo(element);
        const label = `${name} ${nameOf(element)} part at ${scale}`;
        if (!pseudo) {
          record("centered with equal gaps", label, false, "no child part and no visible ::before or ::after part");
          return;
        }
        const outer = rectOf(element).height;
        const inner = px(element, "height", pseudo);
        if (scale === 1) {
          record("centered pairs differ by a multiple of 8", label, differsByEight(outer - inner), `difference ${round(outer - inner)}`);
        } else {
          record("whole pixels at 0.25 steps", `${label} gap`, whole((outer - inner) / 2), `${round((outer - inner) / 2)}`);
        }
      });
      root.querySelectorAll("[data-icon-on-first-line]").forEach((element) => {
        const icon = element.querySelector(slot("Icon"));
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
        const space = previous ? rectOf(element).top - rectOf(previous).bottom : NaN;
        const base = 8 * scale;
        record("scales with --scale", `${name} space before ${nameOf(element)} at ${scale}`, near(space, base), `${round(space)} expected ${round(base)}`);
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
      if (USER_SETTING_FIXTURES.includes(name)) {
        return;
      }
      const base = firstMeasure(mount(name)).value;
      const { property, value } = firstMeasure(mount(name, `--scale-group${group}: 0.5`));
      const expected = groupOf(name) === group ? base * 0.5 : base;
      record("only its own group factor changes it", `${name} ${property} with --scale-group${group}: 0.5`, near(value, expected), `${round(value)} expected ${round(expected)}`);
    });
  }
}

function measure(name, style, path, property, innerStyle = null) {
  const element = mount(name, style, innerStyle).querySelector(slot(path));
  return element ? px(element, property) : NaN;
}

function expectEqual(test, label, actual, expected) {
  record(test, label, near(actual, expected), `${round(actual)} expected ${round(expected)}`);
}

function testFactorBehavior() {
  const buttonHeight = measure("Button", "", "Button", "height");
  const buttonIcon = measure("Button", "", "Button Icon", "width");
  const badgeHeight = measure("Badge", "", "Badge", "height");
  const icon = measure("Icon", "", "Icon", "width");
  const checkboxIcon = measure("Checkbox", "", "Checkbox Icon", "width");
  const calloutIcon = measure("Callout", "", "Callout Icon", "width");
  const fieldWidth = measure("Field", "", "Field", "width");
  const fieldInput = measure("Field", "", "Field Input", "height");
  const fieldLabel = measure("Field", "", "Field-label", "font-size");
  const checkboxWidth = measure("Checkbox", "", "Checkbox", "width");
  const iconButtonIcon = measure("IconButton", "", "IconButton Icon", "width");

  const carries = "a group factor carries into the components inside";
  expectEqual(carries, "Button with --scale-group5: 0.75", measure("Button", "--scale-group5: 0.75", "Button", "height"), buttonHeight * 0.75);
  expectEqual(carries, "Icon inside that Button", measure("Button", "--scale-group5: 0.75", "Button Icon", "width"), buttonIcon * 0.75);
  expectEqual(carries, "Icon inside IconButton with --scale-group5: 0.75", measure("IconButton", "--scale-group5: 0.75", "IconButton Icon", "width"), iconButtonIcon * 0.75);
  expectEqual(carries, "Button with --scale-group5: 1.2 set on itself", measure("ButtonScaled", "", "Button", "height"), buttonHeight * 1.2);
  expectEqual(carries, "Icon inside that Button", measure("ButtonScaled", "", "Button Icon", "width"), buttonIcon * 1.2);
  expectEqual("a user factor on the component is used as it is", "Badge factor 0.5 set on a Button, with --scale-group5: 0.75 around it", measure("ButtonWithBadge", "--scale-group5: 0.75", "Badge", "height"), badgeHeight * 0.5);
  expectEqual(carries, "Checkbox with --scale-group3: 0.5", measure("Checkbox", "--scale-group3: 0.5", "Checkbox", "width"), checkboxWidth * 0.5);
  expectEqual(carries, "checkmark Icon inside that Checkbox", measure("Checkbox", "--scale-group3: 0.5", "Checkbox Icon", "width"), checkboxIcon * 0.5);
  expectEqual(carries, "Avatar inside Select with --scale-group5: 0.75", measure("Select", "--scale-group5: 0.75", "Avatar", "width"), measure("Select", "", "Avatar", "width") * 0.75);
  expectEqual(carries, "standalone Icon with --scale-group5: 0.75 is unchanged", measure("Icon", "--scale-group5: 0.75", "Icon", "width"), icon);

  const both = "--scale: 1.25; --scale-group5: 0.75";
  expectEqual("global scale times group factor", `Button with ${both}`, measure("Button", both, "Button", "height"), buttonHeight * 1.25 * 0.75);
  expectEqual("global scale times group factor", "Icon in that Button", measure("Button", both, "Button Icon", "width"), buttonIcon * 1.25 * 0.75);
  expectEqual("global scale times group factor", `Badge with ${both}`, measure("Badge", both, "Badge", "height"), badgeHeight * 1.25);

  expectEqual("nearest value wins", "standalone Icon with --scale-group2: 1.5", measure("Icon", "--scale-group2: 1.5", "Icon", "width"), icon * 1.5);
  expectEqual("nearest value wins", "Icon in Button ignores a page --scale-group2: 1.5, because the Button passes its own", measure("Button", "--scale-group2: 1.5", "Button Icon", "width"), buttonIcon);
  expectEqual("nearest value wins", "Checkbox Icon keeps the factor Checkbox sets", measure("Checkbox", "--scale-group2: 1.5", "Checkbox Icon", "width"), checkboxIcon);
  expectEqual("nearest value wins", "Callout Icon keeps the factor Callout sets", measure("Callout", "--scale-group2: 1.5", "Callout Icon", "width"), calloutIcon);
  expectEqual("nearest value wins", "inner --scale-group5: 1.5 inside outer 0.5", measure("Button", "--scale-group5: 0.5", "Button", "height", "--scale-group5: 1.5"), buttonHeight * 1.5);
  expectEqual("nearest value wins", "inner --scale: 0.75 inside outer 1.5", measure("Button", "--scale: 1.5", "Button", "height", "--scale: 0.75"), buttonHeight * 0.75);

  expectEqual("a component sets a smaller group's factor", "Badge inside a Button that sets --scale-group3: 0.5", measure("ButtonWithBadge", "", "Badge", "height"), badgeHeight * 0.5);
  expectEqual("a component sets a smaller group's factor", "same, with --scale: 1.5", measure("ButtonWithBadge", "--scale: 1.5", "Badge", "height"), badgeHeight * 0.5 * 1.5);
  expectEqual("a user factor on the component wins over its default", "Checkbox Icon with --scale-group2: 1 on the Checkbox", measure("CheckboxOverride", "", "Checkbox Icon", "width"), icon);

  expectEqual("same group shares one factor", "Field width with --scale-group5: 0.75", measure("Field", "--scale-group5: 0.75", "Field", "width"), fieldWidth * 0.75);
  expectEqual("same group shares one factor", "Input in Field with --scale-group5: 0.75", measure("Field", "--scale-group5: 0.75", "Field Input", "height"), fieldInput * 0.75);
  expectEqual("same group shares one factor", "Field label text with --scale-group5: 0.75", measure("Field", "--scale-group5: 0.75", "Field-label", "font-size"), fieldLabel * 0.75);
}

function testUtilities() {
  allFixtureNames()
    .filter((name) => name.endsWith(UTILITY_SUFFIX))
    .forEach((name) => {
      const original = name.replace(UTILITY_SUFFIX, "");
      [1, 1.5].forEach((scale) => {
        const expected = checkedElements(mount(original, `--scale: ${scale}`));
        const actual = checkedElements(mount(name, `--scale: ${scale}`));
        expected.forEach((element, index) => {
          element.dataset.check.split(" ").forEach((property) => {
            const value = actual[index] ? px(actual[index], property) : NaN;
            expectEqual("a utility equals the CSS variable", `${name} ${nameOf(element)} ${property} at ${scale}`, value, px(element, property));
          });
        });
      });
    });
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
  decorate();
  testBrief();
  testProportionalAndWhole();
  testCentering();
  testGroupMembership();
  testFactorBehavior();
  testUtilities();
  report();
}

window.runHarness = () => document.fonts.ready.then(run);
