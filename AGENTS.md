# AGENTS.md

jun-scale-ui is a minimal CSS framework built around a scaling system. UI scales without fixed sizes, and scaled parts can be composed together. It is plain HTML and CSS: no build step, no server, no dependencies.

## Layout

- `experiments/NNN-name/index.html` holds one experiment per folder. Number them in order and add a link to `index.html` at the root.
- `src/scale.css` is the framework. It defines `--scale`, a plain number that defaults to `1`.
- `adapters/radix-themes.css` makes Radix Themes components follow `--scale`. It points Radix's `--scaling` at `--scale` and scales the icons that Radix sizes with HTML attributes.
- `vendor/radix-themes@3.3.0/` is the Radix Themes stylesheet, used only to render components in the playground. Its license is next to it.
- `tools/annotate.js` draws value labels on a page for screenshots.
- `tools/scale-control.js` sets `--scale` on the root from the `?scale=` URL parameter and from any `[data-scale-input]` slider.
- `scripts/shot.sh` takes screenshots into `screenshots/`, which git ignores.

## Scaling model

Every component has one default size. To change size, change `--scale` on the root or on a container. These properties follow the scale: width, height, margin, padding, font-size, line-height and border-radius.

Components are sorted into groups. A bigger group may contain a smaller group, never the other way round. A bigger group controls the scale of the smaller groups inside it with `--scale-group<N>`, which falls back to `1`.

- A component in group N renders at `--scale × var(--scale-group<N>, 1)`. The global scale always applies, so a group at 0.8 under a global scale of 1.2 renders at 0.96.
- The nearest ancestor that sets `--scale-group<N>` wins, through normal CSS inheritance. A group 2 component that sets `--scale-group1` hides the `--scale-group1` set by a group 3 component further out. Flat CSS rules with fallbacks are enough. No rule needs to know the nesting depth.
- Text has no group. It follows the component that renders it.

The group list is still a proposal: see `experiments/002-group-map`. Only the global scale is built so far.

## Workflow

1. Code the experiment.
2. Take screenshots with `scripts/shot.sh`. Use `--annotate` when the screenshot must prove values or tokens. Take extra widths with `--width` when the experiment is about scaling.
3. Look at every screenshot before sending it. Check that labels don't cover the content they describe, and that no label is red unless the experiment shows a mismatch on purpose.
4. Send the screenshots to the user with SendUserFile.

## Annotations

Load `tools/annotate.js` in the experiment page:

```html
<script src="../../tools/annotate.js" defer></script>
```

Mark elements with `data-annotate`, a space-separated list of entries. `data-annotate-name` adds a title line to the label, and `data-annotate-place="right"` puts the label to the right of the element instead of below it.

| Entry | Label | Check |
| --- | --- | --- |
| `height` | `height: 32px` | none |
| `height:--space-6` | `height: 32px ← --space-6 ✓` | the computed value equals the token |
| `height=32` | `height: 35.2px = 32 × 1.1 ✓` | the computed value equals `32px × --scale` |

```html
<button data-annotate="height=32 font-size=14"></button>
```

Annotations show only when the URL has `?annotate`, so the plain page stays clean. The expected value is resolved on a hidden copy of the element, in the same place in the page, so it uses the same `--scale` and tokens. A label turns red with the expected value when the check fails. Labels round values to one decimal place, and the check allows 0.05px of difference, because browsers round layout sizes to 1/64px.

Use longhand properties (`padding-top`, `border-top-left-radius`), because computed values of shorthand properties can be empty.

## Screenshots

```bash
scripts/shot.sh experiments/000-pipeline-check                      # 1280×800, full page
scripts/shot.sh experiments/000-pipeline-check --annotate           # with value labels
scripts/shot.sh experiments/000-pipeline-check --width 390 --height 844 --name mobile
scripts/shot.sh experiments/001-global-scale --annotate --param scale=1.1   # adds ?scale=1.1
```

Output goes to `screenshots/<experiment>-<width>w[-name][-key-value]...[-annotated].png`. The script uses `agent-browser`.

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
