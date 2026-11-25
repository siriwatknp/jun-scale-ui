const GROUPS = {
  1: { name: "Dot", base: "8px", contains: "nothing", components: ["StatusDot"] },
  2: { name: "Icon", base: "15–16px", contains: "Dot", components: ["Icon", "Spinner"] },
  3: { name: "Inline", base: "16–20px", contains: "Icon, Dot", components: ["Badge", "Kbd", "Checkbox", "Radio", "Switch"] },
  4: { name: "BigInline", base: "24–32px", contains: "Inline, Icon, Dot", components: ["Avatar"] },
  5: {
    name: "Control",
    base: "32–64px",
    contains: "BigInline, Inline, Icon, Dot",
    components: ["Button", "IconButton", "Input", "Select", "Combobox", "TextArea", "Slider", "Progress", "Field"],
  },
  6: { name: "Panel", base: "fits its content", contains: "Control and below", components: ["Callout", "DropdownMenu"] },
  7: { name: "Container", base: "layout", contains: "everything", components: [] },
};

const PIXEL_TOLERANCE = 0.05;
const SCALE_TOLERANCE = 0.001;
const DEFAULT_SCALES = ["0.75", "1", "1.25", "1.5"];

const groupOf = (componentName) =>
  Number(Object.keys(GROUPS).find((number) => GROUPS[number].components.includes(componentName)));

const componentClassOf = (element) => [...element.classList].find((name) => groupOf(name));

function ownerOf(element) {
  let current = element;
  while (current && !componentClassOf(current)) {
    current = current.parentElement;
  }
  return current;
}

const round = (value) => Math.round(value * 100) / 100;

function readNumber(element, property) {
  return parseFloat(getComputedStyle(element).getPropertyValue(property));
}

function parseSpec(spec) {
  return spec
    .trim()
    .split(/\s+/)
    .map((entry) => {
      const [property, base] = entry.split("=");
      return { property, base: Number(base) };
    });
}

function contextsFor(template) {
  if (template.dataset.contexts) {
    return JSON.parse(template.dataset.contexts);
  }
  const scales = new URLSearchParams(location.search).get("scales")?.split(",") ?? DEFAULT_SCALES;
  return scales.map((scale) => ({ label: `--scale: ${scale}`, style: `--scale: ${scale}` }));
}

function cell(className, content = "") {
  const element = document.createElement("div");
  element.className = className;
  element.textContent = content;
  return element;
}

function labelCell(name, detail) {
  const element = cell("Sheet-label");
  const strong = document.createElement("strong");
  strong.textContent = name;
  element.append(strong, detail ? ` ${detail}` : "");
  return element;
}

function resultCell(text, passed) {
  const element = cell(`Sheet-value ${passed ? "is-pass" : "is-fail"}`, `${text} ${passed ? "✓" : "✗"}`);
  return element;
}

function specRows(columns) {
  const firstColumnTargets = [...columns[0].querySelectorAll("[data-spec]")];
  const rows = [];
  firstColumnTargets.forEach((target, targetIndex) => {
    const owner = ownerOf(target);
    const component = componentClassOf(owner);
    const group = groupOf(component);
    const partName = [...target.classList].find((name) => /^[A-Z]/.test(name)) ?? component;
    const container = owner.parentElement && columns[0].contains(owner.parentElement) ? ownerOf(owner.parentElement) : null;
    const path = [container && componentClassOf(container), component, partName === component ? null : partName];
    const name = path.filter(Boolean).join(" › ");
    const targetsPerColumn = columns.map((column) => column.querySelectorAll("[data-spec]")[targetIndex]);

    rows.push([
      labelCell(name, `scale × g${group}`),
      ...targetsPerColumn.map((element) => {
        const ownerElement = ownerOf(element);
        const scale = readNumber(ownerElement, "--scale");
        const groupFactor = readNumber(ownerElement, `--scale-group${group}`);
        const componentScale = readNumber(ownerElement, "--component-scale");
        const passed = Math.abs(componentScale - scale * groupFactor) <= SCALE_TOLERANCE;
        return resultCell(`${round(scale)} × ${round(groupFactor)}`, passed);
      }),
    ]);

    parseSpec(target.dataset.spec).forEach(({ property, base }) => {
      rows.push([
        labelCell(property, `base ${base}`),
        ...targetsPerColumn.map((element) => {
          const componentScale = readNumber(ownerOf(element), "--component-scale");
          const actual = readNumber(element, property);
          const expected = base * componentScale;
          const passed = Math.abs(actual - expected) <= PIXEL_TOLERANCE;
          return resultCell(passed ? `${round(actual)}` : `${round(actual)} ≠ ${round(expected)}`, passed);
        }),
      ]);
    });
  });
  return rows;
}

function buildBlock(template) {
  const component = template.dataset.component;
  const contexts = contextsFor(template);
  const block = document.createElement("section");
  block.className = "Sheet-block";
  block.dataset.block = template.dataset.title ?? component;

  const header = document.createElement("header");
  header.className = "Sheet-header";
  const title = document.createElement("h3");
  title.textContent = template.dataset.title ?? component;
  header.append(title);
  if (template.dataset.note) {
    header.append(cell("Sheet-note", template.dataset.note));
  }

  const grid = document.createElement("div");
  grid.className = "Sheet-grid";
  grid.style.setProperty("--Sheet-columns", contexts.length);
  grid.append(cell("Sheet-corner"), ...contexts.map((context) => cell("Sheet-context", context.label)));

  const columns = contexts.map((context) => {
    const column = cell("Sheet-render");
    column.setAttribute("style", context.style);
    column.append(template.content.cloneNode(true));
    return column;
  });
  grid.append(cell("Sheet-label Sheet-render-label", "render"), ...columns);
  block.append(header, grid);
  return { block, grid, columns };
}

function buildGroupSection(number, blocks) {
  const group = GROUPS[number];
  const section = document.createElement("section");
  section.className = "Sheet-group";
  section.dataset.group = number;
  const heading = document.createElement("h2");
  heading.innerHTML = `<span class="Sheet-group-number">${number}</span>${group.name}`;
  const facts = cell("Sheet-group-facts", `Base size ${group.base} · May contain ${group.contains}`);
  section.append(heading, facts, ...blocks);
  return section;
}

function render() {
  const root = document.querySelector("[data-sheet]");
  const templates = [...document.querySelectorAll("template[data-component]")];
  const params = new URLSearchParams(location.search);
  const onlyGroup = params.get("group");
  const onlyComponent = params.get("component");
  const built = templates
    .filter((template) => !onlyComponent || template.dataset.component === onlyComponent)
    .map((template) => ({ template, ...buildBlock(template) }));

  if (root.dataset.sheet === "by-group") {
    Object.keys(GROUPS)
      .filter((number) => !onlyGroup || number === onlyGroup)
      .forEach((number) => {
        const blocks = built.filter(({ template }) => groupOf(template.dataset.component) === Number(number));
        if (blocks.length) {
          root.append(buildGroupSection(number, blocks.map(({ block }) => block)));
        }
      });
  } else {
    built.forEach(({ block }) => root.append(block));
  }

  document.fonts.ready.then(() => {
    built
      .filter(({ block }) => block.isConnected)
      .forEach(({ grid, columns }) => grid.append(...specRows(columns).flat()));
    const failures = document.querySelectorAll(".Sheet-value.is-fail").length;
    const checks = document.querySelectorAll(".Sheet-value").length;
    document.querySelector("[data-summary]").textContent = `${checks} checks, ${failures} failed`;
    document.documentElement.dataset.measured = "true";
  });
}

addEventListener("DOMContentLoaded", render);
