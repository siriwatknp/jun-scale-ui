# AGENTS.md

jun-scale-ui is a minimal CSS framework built around a scaling system. UI scales without fixed sizes, and scaled parts can be composed together. It is plain HTML and CSS: no build step, no server, no dependencies.

## Layout

- `src/` is the framework, plain CSS. `src/index.css` imports everything.
  - `src/scale.css` registers `--scale`, `--scale-group1` to `--scale-group7` and `--component-scale` as numbers with `@property`, so DevTools shows their computed values.
  - `src/tokens.css` holds base sizes (`--space-*`, `--font-size-*`, `--line-height-*`, `--radius-*`) and colors. Base sizes are constants, never scaled.
  - `src/groups.css` is the group map. It sets `--component-scale` on each component root from its group.
  - `src/components/<name>.css` is one file per component. Every size is `calc(<base> * var(--component-scale))`. Borders stay 1px.
- `playground/` shows the components to the owner.
  - `playground/index.html` is the component sheet, sorted by group. `?group=5` shows one group, `?component=Field` shows one component, and `?scales=0.5,1,2` changes the columns.
  - `playground/groups.html` shows how group factors combine.
  - `playground/sheet.js` builds each sheet from `<template data-component>` elements and checks every `data-spec` value.
- `experiments/NNN-name/index.html` holds one-off experiments. Number them in order and add a link to `index.html` at the root.
- `tools/annotate.js` draws value labels over a page, for experiments.
- `tools/scale-control.js` sets `--scale` on the root from the `?scale=` URL parameter and from any `[data-scale-input]` slider.
- `scripts/shot.sh` takes screenshots into `screenshots/`, which git ignores.

## Scaling model

Every component has one default size. To change size, change `--scale` on the root or on a container. These properties follow the scale: width, height, margin, padding, gap, font-size, line-height and border-radius.

Components are sorted into groups. A bigger group may contain a smaller group, never the other way round. A bigger group controls the scale of the smaller groups inside it with `--scale-group<N>`, which defaults to `1`.

- A component in group N renders at `--scale × --scale-group<N>`. The global scale always applies, so a group at 0.8 under a global scale of 1.2 renders at 0.96.
- The nearest ancestor that sets `--scale-group<N>` wins, through normal CSS inheritance. Flat CSS rules are enough. No rule needs to know the nesting depth.
- A component may set the factor for a smaller group it contains. `Checkbox` sets `--scale-group2: 0.667`, so its checkmark `Icon` is 10px instead of 15px.
- A component may contain components of its own group, and they share one factor. It cannot set that factor for them, because the same variable also sets its own scale. `Field` holds `Input`, `Button` and `Select`, and they all follow `--scale-group5` together. When a same-group child would not fit, build it as a part instead: the button inside `Input` is the part `.Input-action` (24px), not an `IconButton` (32px).
- Text has no group. It follows the component that renders it.

Components multiply base tokens where they use them, never inside the tokens. A custom property is resolved on the element that declares it, so a scaled token declared on the root would ignore every scale set lower in the tree.

Groups, smallest first. Each component has one default size, which is its base size:

| N | Group | Base size | Components |
| --- | --- | --- | --- |
| 1 | Dot | 8px | StatusDot |
| 2 | Icon | 15–16px | Icon, Spinner |
| 3 | Inline | 16–20px | Badge, Kbd, Checkbox, Radio, Switch |
| 4 | BigInline | 24–32px | Avatar |
| 5 | Control | 32–64px | Button, IconButton, Input, Select, Combobox, TextArea, Slider, Progress, Field |
| 6 | Panel | fits its content | Callout, DropdownMenu |
| 7 | Container | layout | Card, Dialog, Popover (not built yet) |

## Naming components

- Refer to components by their PascalCase name: `Button`, `IconButton`, `DropdownMenu`, `StatusDot`. CSS classes use the same name: `.Button`.
- A part's class is the component name, a hyphen and the part name: `.Select-trigger`, `.Checkbox-input`. `.Popup`, `.Popup-item` and `.Popup-separator` are parts shared by `Select`, `Combobox` and `DropdownMenu`.
- `Field` parts: `.Field-label`, `.Field-help`, `.Field-error`, `.Field-group` (controls joined on a shared edge) and `.Field-addon` (prefix or suffix text in a group). Its layout is set with `data-layout`: stacked by default, `horizontal`, or `inline` for a `Checkbox` or `Switch` beside its label. `data-invalid` on `Field` shows the error state.
- A component's parts belong to it and are never listed as components. The Slider thumb is part of `Slider`, and the Switch thumb is part of `Switch`.
- A glyph inside a component is the `Icon` component. The chevron in `Select` and the checkmark in `Checkbox` are each an `Icon` inside that component.

## Workflow

1. Change the components in `src/`, or write an experiment.
2. Add or update the component's `<template>` in `playground/index.html`, with a `data-spec` of base values on each element to check.
3. Screenshot only what changed or was added, never whole pages. Capture each new or changed block on its own with `--selector '.Sheet-block'`, filtered to the component with `?component=<Name>`: `scripts/shot.sh playground --width 1800 --wait '[data-measured]' --param component=Field --selector '.Sheet-block'   # one image per block --selector '.Sheet-block'`. For `playground/groups.html`, pass the file path instead of the folder.
4. Look at every screenshot before sending it. Every value must show ✓, unless a failure is the point. Check the page summary (`N checks, 0 failed`) for the whole sheet as well, since a change can break other components.
5. Send only the screenshots of the changes to the user with SendUserFile.

## Playground sheet

Each `<template data-component="Button">` becomes one block. The block's columns are contexts: by default one column per scale, or the list in the template's `data-contexts` attribute. Its rows come from `data-spec` attributes inside the template:

```html
<template data-component="Button" data-note="contains Icon">
  <button class="Button" data-spec="height=32 padding-left=12">
    <svg class="Icon" viewBox="0 0 15 15" data-spec="width=15"><use href="#icon-bookmark" /></svg>
    Bookmark
  </button>
</template>
```

For each element with `data-spec`, the sheet shows:

- a `scale × gN` row, which passes when the element's `--component-scale` equals `--scale × --scale-group<N>` for its group, so it also checks `src/groups.css`,
- one row per entry, which passes when the measured value equals `base × --component-scale`, within 0.05px.

The group of each component is listed in `GROUPS` in `playground/sheet.js`. Keep it in step with `src/groups.css`.

Use longhand properties (`padding-left`, `border-top-left-radius`), because computed values of shorthand properties can be empty.

## Annotations

Experiments can load `tools/annotate.js` and mark elements with `data-annotate`, a space-separated list of entries. `data-annotate-name` adds a title line to the label, and `data-annotate-place="right"` puts the label to the right of the element instead of below it.

| Entry | Label | Check |
| --- | --- | --- |
| `height` | `height: 32px` | none |
| `height:--space-6` | `height: 32px ← --space-6 ✓` | the computed value equals the token |
| `height=32` | `height: 35.2px = 32 × 1.1 ✓` | the computed value equals `32px × --scale` |
| `height=32@5` | `height: 24px = 32 × 1 × g5 0.75 ✓` | the computed value equals `32px × --scale × --scale-group5` |

Annotations show only when the URL has `?annotate`. The expected value is resolved on a hidden copy of the element, in the same place in the page. Labels round values to one decimal place, and the check allows 0.05px of difference, because browsers round layout sizes to 1/64px.

## Screenshots

```bash
scripts/shot.sh playground --width 1440 --wait '[data-measured]' --param group=5
scripts/shot.sh playground --width 1800 --wait '[data-measured]' --param component=Field --selector '.Sheet-block'   # one image per block
scripts/shot.sh playground/groups.html --width 1440 --wait '[data-measured]'
scripts/shot.sh experiments/000-pipeline-check --annotate
scripts/shot.sh experiments/000-pipeline-check --width 390 --height 844 --name mobile
```

The first argument is a folder with an `index.html`, or an HTML file. With `--selector`, the script saves one image per matching element, numbered `-1`, `-2` and so on, instead of the full page. Output goes to `screenshots/<page>-<width>w[-name][-key-value]...[-annotated].png`. The script uses `playwright-cli`.

## Permissions

The agent drives this repo: coding, screenshots, commits, pushes and GitHub settings. Every action inside this repo is allowed without asking first. The allow rules live in `.claude/settings.local.json`, which git ignores, so they stay on the owner's machine.

## Git

Work in this checkout and commit straight to `main`. Don't create worktrees or feature branches. Push after each commit.

## Public repo

This repo is public. Before each commit, check the staged changes and keep these out:

- secrets: tokens, API keys, passwords, private URLs,
- personal details: real names, email addresses, absolute paths with a home folder such as `/Users/<name>/`,
- local-only files: screenshots, `.claude/settings.local.json`.

Commits use the GitHub noreply email set in this repo's git config. Don't change it.
