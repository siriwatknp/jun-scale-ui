# Eval brief: __TITLE__

Build a small React design system that follows `PRINCIPLE.md` and `SPEC.md`, styled with __TITLE__.

Read only the files in this folder. Don't open anything outside it, and don't commit.

## Components

Build these 14 components with the groups, base sizes, parts and default factors that `SPEC.md` gives them:

StatusDot, Icon, Spinner, Badge, Kbd, Checkbox, Switch, Avatar, Button, IconButton, Input, Select, Field, Callout.

`SPEC.md` describes more components, which you can skip. For `Field`, build only the vertical layout with a label, one control, help text and an error. `Field-group`, `Field-addon`, `Field-option` and the horizontal and inline layouts are out of scope. For `Select`, build the trigger and a `Popup` with items. It doesn't need to open on click; an `open` prop is enough.

## API

The shared pages in `src/kit/` use this API, so keep it exactly. Export every component by name from `src/components/index.ts`.

| Component | Element | Props |
| --- | --- | --- |
| `StatusDot` | `span` | – |
| `Icon` | `svg` with `viewBox="0 0 16 16"` | `children`: the SVG content |
| `Spinner` | `span` | – |
| `Badge` | `span` | `children` |
| `Kbd` | `kbd` | `children` |
| `Checkbox` | a box that holds a native checkbox and a checkmark `Icon` | input props such as `defaultChecked`, `checked`, `onChange`, `aria-label` |
| `Switch` | the track, which holds or is a native checkbox with `role="switch"` | input props, as for `Checkbox` |
| `Avatar` | `span` | `children`: initials |
| `Button` | `button` | `children` |
| `IconButton` | `button` | `children`: one `Icon`; `aria-label` |
| `Input` | `label` that holds the `input` | `start` and `end`: optional content before and after the field, such as an `Icon`, `Kbd` or `Spinner`; other props go to the `input` |
| `Select` | `div` | `children`: the trigger content, such as an `Avatar` or `StatusDot` and text; `open`: show the `Popup`; `items`: an array of item contents |
| `Field` | `div` | `label`, `help`, `error`: content; `invalid`: show `error` instead of `help`; `children`: the control |
| `Callout` | `div` | `icon`: an `Icon`; `children`: the text |

Every component also takes `className` and `style`, and both go on the component's root element. Other props go to the root, except for `Checkbox`, `Switch` and `Input`, where they go to the native `input`. Users scale a component by setting `--scale` or `--scale-group<N>` in `style`, on the component or on any element around it, so those variables must work.

## Markup

The shared pages find elements by `data-slot`, not by class:

- Every component root has `data-slot` set to the component name, for example `data-slot="Button"`.
- Every part has `data-slot` set to its name in `SPEC.md`: `Checkbox-input`, `Input-field`, `Select-trigger`, `Popup`, `Popup-item`, `Field-label`, `Field-help`, `Field-error`, `Callout-text`.
- If the `Switch` thumb is an element, it has `data-slot="Switch-thumb"`. It can also be a pseudo-element of the `Switch` root.
- The element with `data-slot="Checkbox"` is the 16×16 box, and the element with `data-slot="Switch"` is the 40×24 track.
- `Field` renders the label, the control and the help or error text as its direct children, in that order.
- The checkmark in `Checkbox` and the chevron in `Select` are `Icon` components.

## Framework

__FRAMEWORK__

## Files

- Don't edit `PRINCIPLE.md`, `SPEC.md`, `src/kit/`, `index.html` or `fixtures.html`. They are shared by every eval.
- Write the components in `src/components/`, with `src/components/index.ts` exporting all 14. Put your styles wherever the framework section says.
- `src/extra-fixtures.tsx` is empty unless the framework section asks for more fixtures.
- You may add dependencies with `pnpm add` and change `vite.config.ts`, as long as `index.html` and `fixtures.html` still build.

## Checking your work

- `pnpm build` must pass. `pnpm dev` serves the pages.
- `index.html` is a gallery of the fixtures in `src/kit/fixtures.tsx` and the compositions in `src/kit/demos.tsx`, at `--scale` 0.75, 1, 1.25 and 1.5. You can screenshot it with `playwright-cli`.
- `fixtures.html` is used to check your work after you finish. It only renders the fixtures; the checks are not part of this folder.

## Deliverable

- The components and their styles.
- `notes.md` with:
  - the decisions you made,
  - where `PRINCIPLE.md` or `SPEC.md` was unclear, or seemed to contradict itself or the other document,
  - where __TITLE__ made a rule easy or hard to follow, and any workaround you needed.
