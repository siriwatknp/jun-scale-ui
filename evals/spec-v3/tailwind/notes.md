# Notes: Tailwind CSS v4 implementation

## Files

- `src/components/styles.css`: the Tailwind entry. It imports Tailwind's theme and utilities (not Preflight), changes the spacing, type and radius tokens, and defines the scaling utilities.
- `src/components/small.tsx`: StatusDot, Icon, Spinner, Badge, Kbd, Avatar.
- `src/components/toggles.tsx`: Checkbox, Switch.
- `src/components/controls.tsx`: Button, IconButton, Input, Select, Field.
- `src/components/containers.tsx`: Callout, Card, Dialog, Popover.
- `src/components/index.ts`: imports `styles.css` and exports all 17 components.
- `src/extra-fixtures.tsx`: the three fixtures that use utilities instead of `style`.

## Usage

Scale with the `ui-scale-*` utilities. They set the same CSS variables that `PRINCIPLE.md` describes, so they work on any element, and they combine with values set in `style`.

| Utility | Sets |
| --- | --- |
| `ui-scale-<n>` | `--scale` |
| `ui-scale-group1-<n>` to `ui-scale-group7-<n>` | `--scale-group1` to `--scale-group7` |

`<n>` can be a plain number in steps of 0.25, such as `ui-scale-1.25` or `ui-scale-group3-0.5`. For any other value, use square brackets, such as `ui-scale-group5-[1.2]` or `ui-scale-group2-[calc(0.8*var(--scale-group5))]`. Tailwind only accepts plain decimal values in steps of 0.25, which are also the steps `PRINCIPLE.md` recommends, so a value in brackets is a reminder that it can land off whole pixels.

```tsx
// Everything inside the page at 1.25
<main className="ui-scale-1.25">…</main>

// One button at 1.2, its icon follows
<Button className="ui-scale-group5-[1.2]"><Icon>{bookmark}</Icon>Save</Button>

// Smaller badges inside one button
<Button className="ui-scale-group3-0.5">Inbox<Badge>12</Badge></Button>

// A full-size checkmark: replaces the 0.5 the Checkbox passes to its Icon
<Checkbox className="ui-scale-group2-1" aria-label="Agree" />

// Keep a child following the component: multiply by the component's factor
<Button className="ui-scale-group2-[calc(0.8*var(--scale-group5,1))]">…</Button>
```

The CSS variables still work in `style`, for example `style={{ "--scale-group5": 1.2 }}`.

If the design system is installed as a package, the app's Tailwind build must read `styles.css` (for example `@import "<package>/styles.css";`). The `@source "./"` line in it makes Tailwind scan the component files even though they sit in `node_modules`. An app that doesn't use Tailwind can still scale everything with the CSS variables, but it only gets the `ui-scale-*` classes that the package's own build generated.

## Decisions

### Scaled tokens through `@theme inline`

The spec's sizes match Tailwind's default scale: a 4px spacing step, text at 12/16, 14/20 and 16/24, and radius 4, 6 and 8. So the components use Tailwind's own utility names (`h-8`, `px-3`, `gap-2`, `text-sm`, `rounded-md`). `styles.css` redefines those tokens as base size × effective scale:

```css
@theme inline {
  --spacing: calc(4px * var(--ui-effective-scale, 1));
  --text-sm: calc(14px * var(--ui-effective-scale, 1));
  --text-sm--line-height: calc(20px * var(--ui-effective-scale, 1));
  --radius-xs: calc(3px * var(--ui-effective-scale, 1));
  …
}
```

`inline` matters for rule 9. Without it, utilities would read `var(--spacing)`, which is declared once on `:root` and so resolved there, before any component sets its scale. With `inline`, Tailwind copies the expression into each utility, for example `.h-8 { height: calc(calc(4px * var(--ui-effective-scale, 1)) * 8) }`, so the multiplication happens on the element that uses the size. Tailwind 4.3 only writes theme variables to `:root` when something reads them with `var()`, so no scaled size is stored on `:root` at all (checked in the build output).

The only token that changes value is `--radius-xs`, from Tailwind's 2px to the spec's 3px.

### One effective scale per component

Each component root has a `ui-group-<N>` utility:

```css
--ui-factor: var(--scale-group<N>, 1);
--ui-effective-scale: calc(var(--scale, 1) * var(--ui-factor));
```

Parts never set these, so they inherit the component's values (rules 8 and 9). A `--scale` or group factor set on a part reaches only the components inside that part. A child component sets its own `--ui-effective-scale`, so the name is shared but each component reads its own value.

Rule 8 asks for a private name when a component sizes a child component. No component here needs one. The Button's leading icon is the only case in the spec, and I solved it with padding on the Button (see below), as rule 8 recommends.

### Passing factors down, and letting the user win

Two kinds of utilities set the factors for smaller groups:

- `ui-pass-below-<N>` sets `--scale-group1` to `--scale-group<N-1>` to `var(--ui-factor)`.
- `ui-pass-group<K>-<v>` sets `--scale-group<K>` to `<v> × var(--ui-factor)`, for a default that isn't 1. Badge uses `ui-pass-group2-0.75`, Checkbox `ui-pass-group2-0.5`, Callout `ui-pass-group2-0.75`, `Select-trigger` `ui-pass-group4-0.75`, and the three Field text parts `ui-pass-group3-[0.8]`.

Both put their declarations inside a nested `@layer ui-defaults`, which Tailwind outputs inside `@layer utilities`. A layer nested inside `utilities` loses to everything written directly in `utilities`, so:

- inline `style` wins;
- any `ui-scale-*` utility, or any other Tailwind utility, wins whatever the order of the classes;
- any CSS the user writes outside layers wins, whatever its specificity.

Inside `ui-defaults`, `ui-pass-below-<N>` uses `:where(&)` (no specificity) and `ui-pass-group<K>-<v>` uses `&`, so a non-1 default beats the general pass-down on the same element.

A part that sets a default, such as `Field-label`, reads `--ui-factor` from the component. That keeps the factor tied to the component's group even if a user sets `--scale-group5` on the part.

### Components

- No Preflight. A design system shouldn't reset the user's whole page, so each component resets its own native elements (`m-0`, `p-0`, `border-0`, `appearance-none`, `box-border`, inherited font).
- Button: the spec gives a leading Icon a -4 margin so it sits 8 from the edge. I used padding instead: the Button sets `data-start-icon` when its first child is an `Icon` element, and `data-start-icon:ps-2` changes its left padding from 12 to 8. The icon lands in the same place, and no part of the Button's styling has to be written onto the Icon.
- Checkbox: a `span` box holds the native input, which fills it and draws the border and fill, and the checkmark `Icon`. The checkmark uses `invisible peer-checked:visible`, so it is hidden but keeps its box.
- Switch: a `span` track holds the native input (`role="switch"`), which fills the track and draws it, and a `Switch-thumb` element that moves with `peer-checked:translate-x-4`.
- Input: the `Input-action` button has `-me-1`, so its right edge sits 4 inside the border (5 from the outer edge) and covers half of the 8 right padding.
- Select and Popover: `Popup` and `Popover-content` are absolutely positioned at `top-full` with `mt-1`, so they take no space. `Popup` is `w-max min-w-32`, so it can be wider than the trigger.
- Field: the label's `htmlFor` and the control's `id`, `aria-describedby` and `aria-invalid` are added with `cloneElement`. `[&>[data-slot=Input]]:w-full` and the matching Select rule stretch the control to the Field's width.
- Card uses `items-start`, so a Badge keeps its own width instead of stretching across the Card.
- Dialog puts its body children directly between the description and the actions, so the 16 gap applies to them too.
- Spinner is a 2px `border-current` ring with a transparent right side, rotated by `animate-spin`.

## Where PRINCIPLE.md or SPEC.md was unclear

1. **"The user's factor wins however the user sets it ... with a class or a utility of any specificity, in any order."** With cascade layers, specificity and order are not the whole story. A user rule inside an earlier layer, such as Tailwind's `base` or `components`, loses to my defaults in `utilities.ui-defaults`. Inline styles, utilities and CSS outside layers all win. The principle doesn't mention layers.
2. **Input-action "right edge sits 4 inside the Input's right border".** I read this as 4 from the inner edge of the border (5 from the outer edge), which also matches "overlapping half of the right padding". 4 from the outer edge would overlap 5 of the 8.
3. **Button "An Icon that comes first".** CSS can't see text nodes, so `:first-child` also matches an Icon that comes after text. I detect it in React instead. An Icon wrapped in another element isn't detected.
4. **Field-label factor.** The spec says "Inline 0.8" for `Field-label`, `Field-help` and `Field-error`. I set only `--scale-group3` there. The Icon inside a Badge in the label is then 0.8 × 0.75 = 0.6, which gives 9.6px, off the 4px grid. The spec doesn't list this in the accepted deviations, though it follows from the 0.8 deviation that is listed.
5. **Field's `label` and Select.** The brief sends other props to the Select root `div`, so the label's `for` points at a `div` and does nothing. It works for Input, Checkbox and Switch.
6. **Card alignment.** The spec gives padding and gap but no alignment. Stretching, the flex default, would make an inline Badge as wide as the Card, so I chose `items-start`.
7. **Dialog gap.** "a gap of 16 between its parts" doesn't say whether body children count. I treated them as the same column.
8. **Popup width.** The spec gives a minimum of 128 but no maximum and no rule for how it relates to the trigger. I used the content's width.
9. **Rule 8, parts.** "Setting `--scale` on a part does not change the part itself" is true here, but a part grows when a component inside it grows. For example, `--scale: 3` on `Field-label` keeps its text at 14/20, but the Badge inside reads the new `--scale` and becomes 48px tall, so the label does too. I think that is what the rule means, but it could be read as "the part's box doesn't change".

## Tailwind CSS v4: what was easy, what was hard

### Easy

- `@theme inline` does rule 9 for free: every size is multiplied on the element that uses it, and nothing scaled lands on `:root`.
- The spec's spacing, type and radius values match Tailwind's default scale, so component markup reads like ordinary Tailwind (`h-8 px-3 gap-2 rounded-sm text-sm`).
- Functional utilities with `--value(number, [*])` give `ui-scale-1.25` and `ui-scale-group5-[1.2]` from one definition.
- `data-start-icon:`, `peer-checked:`, `has-[…]:` and `[&>…]:` variants cover the state and structure rules without hand-written selectors.

### Hard, and the workarounds

- **No variable names built from values.** `--value()` can fill a value but not a property name, so `ui-scale-group<N>-*`, `ui-group-<N>` and `ui-pass-*` are written out once per group: about 20 utilities, which I generated rather than typed.
- **Making component defaults lose.** Plain utilities in `className` all live in one layer, where specificity ties and Tailwind's own sort order decides, so a component's pass-down could beat a user's `ui-scale-group2-1`. The fix is a nested `@layer ui-defaults` inside the `@utility` body. Tailwind passes it through and the browser treats it as a layer nested in `utilities`. This works in Tailwind 4.3.5, but I didn't find it documented.
- **Conflicting utilities in one `className`.** When two classes set the same property, such as `border-0` and `border`, the one Tailwind prints later wins, not the one written later. I avoided such pairs inside components. A user who passes `className="px-6"` to override a component's `px-3` gets the same problem, so overriding the component's own sizes reliably needs something like `tailwind-merge`. Scaling isn't affected, because the components never set `--scale` or their own group factor.
- **Bare decimals.** Tailwind only accepts plain decimals in steps of 0.25 (`ui-scale-group5-1.2` generates nothing). `ui-scale-group5-[1.2]` works.
- **Changing the theme affects the user's utilities too.** Because `--spacing`, `--text-*` and `--radius-*` are scaled, a user's own `p-4` inside a component scales with that component, and outside any component it is 4px × 4 = 16px as usual. I think this is useful (content in a scaled Card scales with it), but it is a change to Tailwind's normal behavior, and `--spacing` is now in px instead of rem.
- **Shipping.** Tailwind skips `node_modules` when it scans for class names, so `styles.css` needs `@source "./"`.

### Places that needed plain CSS

There are no hand-written component classes or `[data-slot]` selectors in the stylesheet. Plain CSS appears in these places:

- The `@utility` bodies in `styles.css` are plain declarations of custom properties (`--ui-factor`, `--ui-effective-scale`, `--scale-group<N>`), because Tailwind has no built-in utility for setting a custom property by name, other than an arbitrary property such as `[--scale:1.2]`, which can't be named or reused.
- The `ui-pass-*` utilities contain a nested `@layer ui-defaults { :where(&) { … } }`, which is how the defaults lose to the user (see above). Tailwind has no variant or option to put a utility in a lower layer.
- The `@theme inline` values are `calc()` expressions, because the tokens are formulas, not fixed values.
- Three arbitrary properties in `className`: `[font-family:inherit]` on buttons and Kbd, and `[font:inherit]` on the native text field. Tailwind has no `font-inherit` utility, and `font-[inherit]` is ambiguous between `font-family` and `font-weight`.
