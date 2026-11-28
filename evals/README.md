# Framework evals

Each eval asks a fresh agent to build a small React design system from `PRINCIPLE.md` and `SPEC.md`, styled with one framework. The agent gets `BRIEF.md`, a shared kit of fixtures and a gallery, and nothing else.

- `make-eval.sh <framework> <title> [folder]` creates a kit from `kit/`, `brief.md` and `frameworks/<framework>.md`. Create kits outside this repo, so that the agent doesn't load the repo's `AGENTS.md`.
- `run.sh <folder>` builds the folder and runs `harness/harness.js` on its `fixtures.html` in Chrome, WebKit and Firefox. Set `BROWSERS="chrome"` to run fewer. The harness finds elements by `data-slot`, so it works with hashed or utility class names. `run.sh reference` runs it on `src/`.
- `harness/mutations.py` breaks a copy of `src/` in 26 ways, one rule each, and checks that the harness catches every break.
- `shot.sh <folder> <selector>` screenshots blocks of the folder's gallery.

## Results

### SPEC v3 and PRINCIPLE v12, blind

The kits were built outside the repo. Each agent reported that it saw no notes about another implementation, only a one-line memory entry naming the project.

| Eval | Components | Chrome | WebKit | Firefox |
| --- | --- | --- | --- | --- |
| `reference` (`src/`) | 22 | 936 checks, 0 failed | 0 failed | 0 failed |
| `spec-v3/plain-css` | 17 | 940 checks, 0 failed | 0 failed | 0 failed |
| `spec-v3/css-modules` | 17 | 940 checks, 0 failed | 0 failed | 0 failed |
| `spec-v3/tailwind` | 17 | 958 checks, 1 failed | 15 failed | 1 failed |

Tailwind's failures:

- The Button with a leading Icon has a left padding of 8 instead of the spec's 12 with a -4 margin on the Icon. The Icon lands in the right place at every scale, so this is a deliberate departure from the spec's wording, not from the rule.
- In WebKit, the Icon in a Button and the Avatar in the Select trigger sit 0.5px off center. WebKit gives `<button>` 2px top and 3px bottom padding by default. `px-3` sets only the horizontal padding, and the eval doesn't use Tailwind's preflight, so the default stays. SPEC v3 says unlisted padding is 0, so this is a real failure. `src/` and the first Tailwind eval had the same bug.

### SPEC v2 and PRINCIPLE v10, not blind

The first round ran inside the repo, so the agents had `AGENTS.md` loaded.

| Eval | Result then (Chrome) | Result now |
| --- | --- | --- |
| `plain-css` | 568 checks, 0 failed | 16 failed: 13 for SPEC v3 components it doesn't have, plus the Icon position and the rule that a user's class wins |
| `css-modules` | 568 checks, 0 failed | 16 failed, the same as `plain-css` |
| `tailwind` | 586 checks, 0 failed | 14 failed: the SPEC v3 components and the Icon position. WebKit adds the button padding bug |

## What the harness now covers

- **Three browsers.** WebKit found the default `<button>` padding bug, which Chrome hides because its default padding is even. With that fixed, the whole-pixel rules hold in all three browsers.
- **Deliberate breaks.** The first mutation run caught 14 of 20 breaks. Borders that scale, line heights and radii that don't scale, a part that computes its own scale, and a missing Field label default went unnoticed. The harness now checks each of them, and catches all 26 breaks.
- **Rules added in SPEC v3 and PRINCIPLE v12:**
  - the Badge Icon default,
  - the leading Icon position at the Button's scale,
  - the `Input-action` inset,
  - popups that take no space,
  - group 7 pass-down,
  - a user's class winning, both unlayered and in a later cascade layer.

## What all three blind agents did the same way

- Each component computes its scale once on its root, under a name only that component declares, such as `--Button-scale`. A shared name lets a child component's scale shadow the parent's.
- Plain CSS and CSS Modules put every component rule in a cascade layer, so that any user rule wins. `src/` now does the same, because `:where()` alone still beats layered rules such as Tailwind utilities.
- The Button finds a leading Icon in React, because CSS can't see text nodes: `:first-child` also matches an Icon that comes after text.

## Open points for the next version

Found by two or three agents:

1. Rule 7 says the user's factor wins "in any order". With cascade layers, a user rule in a layer declared before the component's layer still loses. The rule should say "unlayered, or in a later layer".
2. The 0.8 factor in `Field-label` also shrinks an Icon inside a Badge in the label, to 9.6px. It isn't in the accepted deviations.
3. "An Icon that comes first" can't be written as a selector. The spec should say what the user sees (the Icon sits 8 from the edge) and leave the method open, as the harness now does.
4. "The right edge sits 4 inside the Input's right border" can be read from either edge of the border. The agents and the harness used the inner edge.

Found by one agent:

5. Whether a part's default multiplies the group factor read at the part or at the component root.
6. The Spinner's 2px ring against "borders are 1px".
7. A rotating Spinner's `getBoundingClientRect()` changes as it spins. The harness measures computed sizes, which don't.
8. Unspecified sizes: `Input-field` height, Popup width compared with its trigger, alignment inside Card, and which element `Field-label` points to when the control is a Select.

## Framework notes

### Plain CSS

- Inherited custom properties give rules 3, 6 and 9 for free, and inline `style` gives the user override.
- There are no mixins, so the factor and pass-down block repeats in every component.
- A per-component scale name is needed for rule 8. A shared name such as `--_scale` resolves to the child's scale on a child component.
- Making every user rule win needs `@layer`.

### CSS Modules

- Custom property names aren't hashed, so the scale variables cross module boundaries and work from `style`. No global CSS was needed.
- Sharing the group factors through `composes` broke in the production build, because Vite placed the shared module after the component's CSS. Both rounds repeated the factors in each module instead.
- Styling another component's elements needs `data-slot` selectors.
- Private names such as `--Button-scale` aren't scoped by the module, so they rely on a naming convention.

### Tailwind CSS v4

- `@theme inline` redefines `--spacing`, `--text-*` and `--radius-*` as base × the component's scale. Every built-in utility (`h-8`, `px-3`, `text-sm`, `rounded-sm`) then scales on the element that uses it, and nothing scaled is stored on `:root`. Both rounds found this independently.
- Users scale with utilities: `scaling-*` in the first round, `ui-scale-*` and `ui-scale-group<N>-*` in the blind round. Bare values only accept steps of 0.25, which matches rule 10. Other values need brackets, such as `ui-scale-group5-[1.2]`.
- Tailwind orders utilities on one element itself, so the component's own factors must lose by construction. The rounds used `:where(&)`, a nested `@layer` inside `utilities`, and non-inheriting `@property` defaults.
- `--value()` can't build a variable name, so each group needs its own utility.
- Without preflight, every control has to reset browser padding itself. Both rounds missed it on `<button>`.
