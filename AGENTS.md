# AGENTS.md

jun-scale-ui is a minimal CSS framework built around a scaling system. UI scales without fixed sizes, and scaled parts can be composed together. It is plain HTML and CSS: no build step, no server, no dependencies.

## Layout

- `PRINCIPLE.md` states the scaling rules without saying how to code them. `SPEC.md` describes the components. `src/` is one implementation of both. When they disagree, fix the implementation or raise the question with the owner.
- `verify/` checks that the principle is complete. `verify/make-kit.py <folder>` copies the principle, the spec, `verify/brief.md` and the fixture markup into a folder for a fresh agent, which writes `scale.css` from them alone. `verify/run.sh <folder>` runs black-box checks on that `scale.css`. `verify/runs/` keeps what each principle version produced. `verify/run.sh runs/v0-src` checks `src/` itself.
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

## Scaling rules and components

- `PRINCIPLE.md` holds the scaling rules. `SPEC.md` holds the groups, components, base sizes, parts, default factors and accepted centering deviations. Read both before changing `src/`, and don't restate them in this file.
- To add or change a component, update `SPEC.md` first, then `src/`, then its template in `playground/index.html`.
- Notes on how `src/` implements them:
  - `src/groups.css` sets `--component-scale` to `--scale × --scale-group<N>` on every component root, and passes the component's factor down to every smaller group.
  - Component files override the defaults the spec lists, multiplied by their own factor, for example `.Checkbox { --scale-group2: calc(0.5 * var(--scale-group3)); }`.
  - A child component that must be centered on a text line sits in a grid row one line tall, with `align-self: center`, as in `Callout` and the inline `Field`. A fixed offset would be wrong once the child's factor changes.
  - `experiments/004-pixel-snapping` measures why sizes must land on whole pixels.
- In conversation, refer to components by their PascalCase names, as `SPEC.md` does. A component's parts are never listed as components, and a glyph inside a component is the `Icon` component.

## Workflow

1. Change the components in `src/`, or write an experiment.
2. Add or update the component's `<template>` in `playground/index.html`, with a `data-spec` of base values on each element to check.
3. Screenshot only what changed or was added, never whole pages. Each rendered block has a `data-block` attribute with its title, so `--selector` can pick the new or changed blocks and save one image each: `scripts/shot.sh playground --width 1800 --wait '[data-measured]' --param component=Field --selector '[data-block*="Kbd shortcut"], [data-block*="Spinner"]'`. For `playground/groups.html`, pass the file path instead of the folder.
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
scripts/shot.sh playground --width 1800 --wait '[data-measured]' --param component=Field --selector '[data-block*="Kbd"]'   # one image per matching block
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
