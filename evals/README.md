# Framework evals

Each eval asks a fresh agent to build a small React design system from `PRINCIPLE.md` (version 10) and `SPEC.md` (version 2), styled with one framework. The agent gets `BRIEF.md`, a shared kit of fixtures and a gallery, and nothing else.

- `make-eval.sh <framework> <title>` creates a folder from `kit/`, `brief.md` and `frameworks/<framework>.md`.
- `run.sh <folder>` builds the folder and runs `harness/harness.js` on its `fixtures.html`. The harness finds elements by `data-slot`, so it works with hashed or utility class names. `run.sh reference` runs it on `src/` to check the harness itself.
- `shot.sh <folder> <selector>` screenshots blocks of the folder's gallery, `index.html`.

## Results

| Eval | Framework | Result | Notes |
| --- | --- | --- | --- |
| `reference` | `src/`, hand-written | 564 checks, 0 failed | Checks the harness. |
| `plain-css` | plain CSS, global classes | 568 checks, 0 failed | Correct on the first try. |
| `css-modules` | CSS Modules | 568 checks, 0 failed | Correct on the first try. |
| `tailwind` | Tailwind CSS v4 | 586 checks, 0 failed | Correct on the first try, including 12 checks that its `scaling-*` utilities match the CSS variables. |

Each eval has more checks than `reference` because its Switch thumb is a child element, which the harness can measure directly.

**Caveat.** The evals ran inside this repo, so each agent had the repo's `AGENTS.md` loaded automatically. Its notes on `src/` describe the pass-down pattern and the grid-row centering, so the agents were not fully blind. Running the next evals from a folder outside the repo would remove that hint.

## What all three agreed on

All three agents built the scale in the same way, without seeing each other's work:

- Each component root declares a private `--_scale` or `--effective-scale` as `--scale × --scale-group<N>`, and every size is `calc(<base> * var(--_scale))`. Parts inherit the resolved number, so rule 9 holds without extra work.
- Each root sets the smaller groups' factors from its own factor. A user value in `style` wins because inline styles beat classes.
- The Switch thumb is a real element, not a pseudo-element of the `input`, because pseudo-elements on `<input>` are not reliable across browsers.
- The Select `Popup` overlays the content below it.

## What is missing or unclear in SPEC.md and PRINCIPLE.md

Found by more than one agent:

1. **An Icon inside a Badge breaks rule 10.** A 16px Icon in a 20px Badge differs by 4px, so it sits half a pixel off at 0.75. The accepted deviations list doesn't include it.
2. **Unnamed parts.** The Switch's native input has no part name. All three called it `Switch-input`. The Callout's one-line row for the Icon isn't a part either: two agents used a grid row, and Tailwind added a `Callout-icon` wrapper.
3. **Popup placement.** "A `Popup` 4 below it" doesn't say whether it overlays content or takes space.
4. **Spinner rotation.** Rotating a box changes its bounding box, and rule 2 doesn't mention rotation. The agents chose three different answers: rotate a `::before`, animate the border colors, or rotate the root.
5. **Labels.** It is unclear whether `Field-label` is a `<label>`. The Input root is also a `<label>`, so the field ends up with two labels.

Found by one agent:

6. **A part-level default versus a user factor on the component** (CSS Modules). Select sets its Avatar default on `Select-trigger`. So a user's `--scale-group4` on the Select root doesn't reach the trigger Avatar, though rule 7 says a user factor on the component wins.
7. **A group factor set on a part** (CSS Modules). `--scale-group5` set on `Select-trigger` changes the Avatar inside it, because the trigger computes `--scale-group4` from it. Rule 8 says a factor set on a part does not change the part; it doesn't say what happens to the components inside it.
8. **Padding and borders** (CSS Modules). It is unclear whether padding is measured inside the 1px border. Content in the Input starts 9px from its outer edge.
9. **Naming** (Tailwind). `SPEC.md` names components by class (`class="Button"`), which doesn't fit CSS Modules or Tailwind. Naming by `data-slot`, or by a framework-neutral name, would fit all three.
10. **Rule 7 for groups 1 and 2** (plain CSS). Icon and Spinner hold nothing, so passing their factor down does nothing. It is unclear whether the rule is meant to apply to them.
11. **Very small text** (Tailwind). Text is exempt from rule 10, but nothing sets a lower bound. A Badge at `--scale-group3: 0.5` has 6px text.

Gaps in the eval itself:

- The brief's API has no prop for `Input-action`, so no eval built it.
- The `ButtonScaled` fixture uses `--scale-group5: 1.2`, which lands on part of a pixel at three of the four gallery scales.

## Framework notes

### Plain CSS

- Easy: inherited custom properties give rules 3, 6 and 9 for free, and inline `style` gives the rule 7 user override.
- Hard: there are no mixins, so the four-to-six-line factor and pass-down block is repeated in all 14 components.
- Trap: every component uses the same `--_scale` name. A rule written on a child component, such as `.Field > .Input { margin-top: … }`, reads the child's scale, not the parent's, which breaks rule 8. The agent placed children only with the parent's `gap`, `padding` or grid.
- The variables aren't registered with `@property`, so an invalid `--scale` breaks every `calc()` silently.

### CSS Modules

- Easy: custom property names aren't hashed, so the scale variables cross module boundaries and work from `style` with no setup. No global CSS was needed.
- Broke at first: sharing the group factors with `composes` failed in the production build. Vite placed the shared module after the component's CSS, and with equal specificity it overrode Checkbox's 0.5 default. The agent repeated the factors in each module's `.root` instead.
- Styling another component's elements needs `data-slot` selectors, because a module can't name another module's hashed class. They also win on specificity whatever the CSS order.
- The same `--_scale` trap as plain CSS.

### Tailwind CSS v4

- Key feature: `@theme inline` redefines `--spacing`, `--text-*` and `--radius-*` as `calc(base * var(--effective-scale, var(--scale, 1)))`. Every built-in utility (`h-8`, `px-3`, `gap-2`, `translate-x-4`, `text-sm`, `rounded-sm`) then scales where it is used, and nothing scaled is stored on `:root`.
- User API: `scaling-<n>` sets `--scale` and `scaling-group<N>-<n>` sets a group factor. Bare values only accept steps of 0.25, so `scaling-group5-1.2` produces no CSS and needs brackets: `scaling-group5-[1.2]`. That matches rule 10's 0.25 steps.
- Hard: Tailwind orders utilities on the same element itself, so a user's `scaling-group2-1` and the component's own factor could win in either order. The agent set the component's factors inside `:where(&)` for zero specificity. It moved non-1 defaults into registered, non-inheriting `--default-group<N>` properties, because a second class on the same element can't reliably override the first.
- Names `scale-*` and `group-*` clash with Tailwind's own utilities and variants, hence `scaling-*` and `component-group-*`.
- No preflight, so that the design system doesn't reset the host page. Every bordered or padded box sets `box-border` itself.
- The same child-scale trap: `ml-2` on an Icon inside a Button scales with the Icon.
