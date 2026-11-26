# Notes: plain CSS

## Decisions

### How the scale is computed

- Each component root declares two private custom properties:
  - `--_factor` is the component's own group factor, `var(--scale-groupN, 1)`.
  - `--_scale` is `calc(var(--scale, 1) * var(--_factor))`, the effective scale.
- Every scaled property is written as `calc(<base>px * var(--_scale))`. This covers sizes, padding, gap, offsets, font size, line height and radius.
- Custom properties resolve `var()` on the element that declares them. Each part therefore inherits the component's finished number. Setting `--scale` or a group factor on a part does not resize the part, which is what rules 8 and 9 ask for.
- Each root sets `--scale-group1` up to `--scale-group<N-1>`, either to `var(--_factor)` or to a default times `var(--_factor)`. The defaults that are not 1:
  - `Checkbox` sets group 2 to 0.5.
  - `Callout` sets group 2 to 0.75.
  - `Select-trigger` sets group 4 to 0.75. The `Popup` is a sibling of the trigger, so avatars in the popup keep 1.
  - `Field-label`, `Field-help` and `Field-error` set group 3 to 0.8.
- A user's inline `style` beats the class rule. A factor that the user sets on the component element therefore replaces the factor the component sets, as rule 7 requires. The `CheckboxOverride` fixture checks this.
- `Icon` and `Spinner` also set `--scale-group1`, even though they hold nothing. I followed rule 7 literally.

### Component details

- **Spinner.** The root carries a faint 2px ring as its border. The spinning arc is a `::before` with `inset: -2px` and its own 2px border. I first rotated the root, but a rotated root reports a bounding box of about 17.9px at scale 1, which would fail any size check. The 2px offset is a border width, so it is not scaled.
- **Checkbox.** The root is a 16×16 `inline-grid`. The native input and the checkmark `Icon` share one grid cell, so the icon centers through layout and needs no offset. The checkmark is hidden with `.Checkbox-input:not(:checked) + .Icon`. Its path uses `stroke-width="2"`, which draws a 1px stroke at 8px.
- **Switch.** The root `span` is the 40×24 track. The native `input role="switch"` fills it and paints the track. The thumb is a sibling `span` (`Switch-thumb`), moved with `.Switch-input:checked + .Switch-thumb { translate: 16px × scale }`. The input has `data-slot="Switch-input"`, a name I made up.
- **Callout.** The root is a two-column grid. The first row is exactly one text line tall (`20px × scale`), and the icon is centered in it with `align-self: center`. `Callout-text` spans both rows. This centers the icon on the first line without adding a wrapper part that `SPEC.md` does not list. When there is no icon, the text spans both columns.
- **Select.** The trigger is a `button`, and the chevron is the last `Icon`, pushed right with `margin-inline-start: auto`. The `Popup` is absolutely positioned 4px × scale below the trigger, so it overlays content like a real popup. In the gallery, it covers part of the next row.
- **Field.** The root is a flex column with `align-items: flex-start`, so a Button inside does not stretch. `.Field > .Input` and `.Field > .Select` stretch to the Field's width. A small React context passes `id`, `aria-describedby` and `aria-invalid` to the Input, Checkbox, Switch and Select trigger, and the label uses `htmlFor`. `data-invalid` goes on the root when `invalid` is set.
- **Button.** `SPEC.md` lists no border, so the button has none. It uses a solid accent background. IconButton uses a neutral gray background.
- "Fully rounded" is `border-radius: 9999px`, which does not scale. Borders and focus outlines are 1px and 2px and do not scale.
- I don't round with `round()`. The base sizes are multiples of 4, so the 0.25 steps land on whole pixels without it. I measured this in the gallery at 0.75, 1, 1.25 and 1.5.

## Where the documents were unclear or conflicted

- **Icon inside a Badge breaks rule 10, and SPEC doesn't list it.** A Badge is 20px tall and "contains an Icon" with no default factor. A 16px icon in a 20px box differs by 4px, not by a multiple of 8. The accepted deviations cover group 3 boxes in a 32px box and boxes on a 20px text line, but not a box inside a group 3 box.
- **The Spinner spec does not say what rotates.** "16×16 … with a 2px ring drawn as a border" suggests the root has the border, but rotating the root changes its measured box. I moved the rotation to a pseudo-element part.
- **Switch parts.** SPEC lists only the thumb. BRIEF allows the root to be the input. A thumb drawn as a pseudo-element of an `<input>` isn't reliable across browsers, so I used a wrapper and gave the input an unlisted `Switch-input` slot.
- **Callout centering.** Rule 8 says to give a child "a row exactly one line tall", but SPEC lists only `Callout-text` as a part. A wrapper element would be an unlisted part. A grid row satisfies the rule without one.
- **Popup position.** "4 below it" does not say whether the popup overlays the content below it or takes up space in the layout. I chose to overlay.
- **Rule 7 for groups 1 and 2.** "A component of group N sets the factor of every smaller group" also covers Icon and Spinner, which can't hold anything. This is harmless, but it isn't clear whether the rule is meant to apply to them.
- **The `ButtonScaled` fixture uses `--scale-group5: 1.2`.** At `--scale: 1` this gives a 38.4px button and a 19.2px icon, off the pixel grid. Rule 10 only shows 1.2 as safe when combined with `--scale: 1.25`. This is consistent with the rules, but it is a fixture that lands on part of a pixel at three of the four gallery scales.
- **Two labels on one input.** The Input root is a `label` (BRIEF), and the Field also renders a `<label for>`. The input ends up with two labels. This works, but it may be worth stating as intended.

## Plain CSS: what was easy, what was hard

### Easy

- Rules 3 and 6 (the nearest value wins and applies at any depth) come for free with inherited custom properties.
- Rule 9 also comes for free. `--_scale` is resolved where it is declared, so parts reuse the root's number and ignore values set on themselves.
- The user override in rule 7 needs no extra work, because an inline `style` beats a class rule.
- Rule 8 child centering works with flex and grid alignment. No component needed a fixed offset.

### Hard or verbose

- **Repetition.** Every size is written as `calc(Npx * var(--_scale))`, and each component repeats a four to six line block for the factor, the scale and the pass-down. Plain CSS has no mixin, so there are 14 copies.
- **One shared private name has a trap.** Every component uses the same `--_scale` name. A rule written on a child component, such as `.Field > .Input { margin-top: calc(4px * var(--_scale)) }`, resolves the child's own `--_scale`, not the parent's. That breaks the part of rule 8 that says a size applied to a child uses the parent's scale. The workaround is to place child components only through the parent's own `gap`, `padding` or grid, which resolve on the parent. No component in this set needed more than that. Per-component names such as `--Select-scale` would avoid the trap, but then the shared `Popup` would not know which name to read.
- **The rule 7 limitation is real in CSS.** A component can't multiply its factor into an outer `--scale-group3`. A page-level `--scale-group3` reaches standalone Badges but not Badges inside a Button. I measured this. A Badge inside a Button stayed at its button-set size.
- **No type checking on values.** An invalid `--scale` makes every `calc()` invalid at computed-value time, so widths fall back to `auto` and font sizes to inherited values. Registering the variables with `@property { syntax: "<number>" }` would guard against this. I kept unregistered variables with `var(--scale, 1)` fallbacks to stay minimal.
- **Global class names.** `.Icon` or `.Button` can collide with app CSS. The shared reset uses `:where()`, so it adds no specificity. Components style child components through their global class, for example `.Checkbox > .Icon` and `.Select-trigger > .Icon:last-child`, which ties them to the Icon's class name.
- **No build-time check that base sizes are multiples of 4.** I checked by measuring the gallery with `getBoundingClientRect` at all four scales.
