# Notes: Tailwind CSS v4 implementation

## Usage

The design system adds one utility for `--scale` and one for each group factor:

| Utility | Sets |
| --- | --- |
| `scaling-<n>` | `--scale` |
| `scaling-group1-<n>` … `scaling-group7-<n>` | `--scale-group1` … `--scale-group7` |

Bare values must be steps of 0.25, which are the steps `PRINCIPLE.md` rule 10 recommends. For any other value, use brackets.

```tsx
<main className="scaling-1.25">…</main>

<section className="scaling-group5-1.5">
  <Button>Save</Button>
</section>

<Button className="scaling-group5-[1.2]"><Icon>{bookmark}</Icon>Save</Button>

<Button className="scaling-group3-0.5">Inbox<Badge>12</Badge></Button>

<Checkbox className="scaling-group2-1" defaultChecked aria-label="Agree" />
```

- A utility on a container scales every component inside it. A utility on a component scales that component.
- A group factor set on a component replaces the factor the component passes down, as rule 7 says. In the last example the checkmark is 16px instead of 8px.
- The CSS variables still work in `style`, for example `style={{ "--scale-group5": 1.2 }}`. They are what the utilities set.
- Spacing, font-size and radius utilities in your own markup (`p-4`, `text-sm`, `rounded-md`) follow `--scale` as well. See decision 3.

## Decisions

1. **Effective scale.** Each component root has a `component-group-<N>` utility. It sets `--effective-scale: calc(var(--scale, 1) * var(--scale-group<N>, 1))` once. Parts inherit that value and never compute it again, so `--scale` or a group factor set on a part doesn't change the part (rules 8 and 9).
2. **Sizes scale where they are used.** `@theme inline` redefines `--spacing`, `--text-*` (with line heights) and `--radius-*` as `calc(<base> * var(--effective-scale, …))`. Because the theme is `inline`, Tailwind writes the expression into each utility instead of a `var(--spacing)` reference. The value then resolves on the element that uses the class, and Tailwind doesn't emit any scaled value on `:root`. So the standard utilities scale with no extra work: `h-8` is 32px × the effective scale, `px-3` is 12px × the effective scale, and `translate-x-4`, `top-1`, `min-w-32`, `max-w-45` and `gap-2` scale the same way.
3. **Fallback outside components.** The fallback is `var(--effective-scale, var(--scale, 1))`, so spacing utilities on a user's own layout follow `--scale`. The alternative, a fallback of `1`, would have left page layout fixed while the components grow. Layout that follows the UI seemed more useful.
4. **Passing factors down.** `component-group-<N>` sets every smaller group's factor to `--scale-group<N> × --default-group<M>`. It sets them inside a nested `:where(&)`, which has zero specificity. A user's utility (`.scaling-group2-1`) or a `style` value on the same element therefore always wins, whatever order Tailwind gives the utilities.
5. **Default factors that are not 1** use non-inheriting registered properties `--default-group1` … `--default-group5`, with an initial value of 1. A component sets one with an arbitrary property, for example `[--default-group2:0.5]` on `Checkbox` and `[--default-group2:0.75]` on `Callout`. They don't inherit, so a component nested deeper doesn't pick up its parent's defaults.
6. **Part-level defaults** (`Select-trigger` with Avatar at 0.75, and `Field-label`, `Field-help` and `Field-error` with Inline at 0.8) are arbitrary properties on the part, such as `[--scale-group4:calc(var(--scale-group5,1)*0.75)]`. Each one reads the component's factor, which the part inherits.
7. **No preflight.** `styles.css` imports only `tailwindcss/theme.css` and `tailwindcss/utilities.css`. A design system shouldn't reset the host page, and preflight would restyle the shared kit pages. Components therefore set `box-border`, `m-0`, `p-0` and `border-0` themselves where the user agent has defaults.
8. **Markup.** Elements are found by `data-slot`. There are no `class="Button"` names, because the brief asks for utilities rather than hand-written component classes (see the unclear points below).
9. **Switch.** The root is a `span` track (40×24). It holds a transparent native `input` (`data-slot="Switch-input"`) that fills the track, and a `Switch-thumb` element. The track colour uses `has-checked:` and the thumb uses `peer-checked:translate-x-4`. I chose a real element over a `::before` thumb on the input, because pseudo-elements on an `<input>` are not something every browser guarantees.
10. **Checkbox.** The native input is `absolute inset-0 size-full` and draws the box. The checkmark `Icon` is centered with `inline-grid place-items-center` and shown with `peer-checked:visible`. The checkmark uses stroke width 2 in its 16-unit view box, so it stays 1px wide at 8px.
11. **Callout.** The icon sits in a `Callout-icon` part that is one text line tall (`h-5`) and centers the icon (`flex items-center`). This is rule 8's "row exactly one line tall". A margin offset would break once the Icon factor changes.
12. **Select.** The `Popup` is absolutely positioned (`top-full mt-1`), so it overlays content like a real menu. In the gallery it overlaps the next row. Items are `role="option"` and the trigger is a `button` with `aria-expanded`.
13. **Field.** It is a column with `items-start`. Only Input and Select stretch, through a custom variant `in-field` (`[data-slot="Field"] > &`), matching the spec's "an Input, TextArea or Select trigger directly inside a Field stretches". `Field` clones its child to add `id`, `aria-describedby` and `aria-invalid`. For `Input` these reach the native input, so the label and help text are linked.
14. **Rule 8 margins.** No scaled spacing class is put on a child component. A class on an element uses that element's effective scale, so `ml-2` on an `Icon` inside a `Button` would scale with the Icon, not the Button. The chevron uses `ml-auto`, and every other placement uses the parent's `gap` or padding.
15. **Group 7.** `scaling-group7-*` exists although no group 7 component is built yet, so the user API covers every group in `SPEC.md`.

## Where the documents were unclear or disagreed

- **Class names.** `SPEC.md` names components by class (`class="Button"`, `class="Select-trigger"`), but the brief asks for Tailwind utilities and `data-slot`. I followed the brief and used `data-slot` for every name.
- **Parts the spec doesn't list.** Rule 8 requires centering on a line with a row one line tall, which needs a box around the Callout Icon. `SPEC.md` lists only `Callout-text`. I added `Callout-icon`. The Switch needs a native input to take input props, but `SPEC.md` lists only the thumb. I added `Switch-input`.
- **Badge with an Icon.** `SPEC.md` says a Badge can contain an Icon. With the default factor 1, a 16px Icon in a 20px Badge differs by 4px, not 8px. At `--scale: 0.75` that is 15px around 12px, so the Icon sits half a pixel off. This case is not in the "Accepted deviations" list, which mentions only Badge or Kbd inside a 32px box.
- **Popup position.** "a `Popup` 4 below it" doesn't say whether the Popup is in the flow or an overlay. I chose an overlay.
- **Field width rule vs. other controls.** "An Input, TextArea or Select trigger stretches" suggests a Button, Checkbox or Switch in a Field does not. I read it that way and aligned the other controls to the start.
- **Rule 7 vs. rule 8 on parts.** Rule 7 lets a part set a group factor, and rule 8 says a factor set on a part doesn't change the part. These agree, but only if the part never computes its own effective scale. The principle says this in rule 9, not where parts are defined, and it is easy to miss.
- **Very small text.** The Avatar in the Select trigger at 0.75 gets 10.5px initials, and a Badge at `scaling-group3-0.5` gets 6px text. Rule 10 says text is exempt, but the spec doesn't set a lower bound for readability.

## Tailwind CSS v4: what was easy, what was hard

Easy:

- `@theme inline` is the key feature. It turns the standard spacing, text and radius scales into "base × effective scale, resolved at the element" (rule 9) with one declaration each. It also emits nothing scaled on `:root`.
- Borders (`border`, `border-2`), outlines (`outline-2`) and shadows are fixed pixel values in Tailwind, so they don't scale. That matches rule 2 without extra work.
- `rounded-full` is `calc(infinity * 1px)`, which needs no scaling.
- The variants `peer-checked:`, `has-checked:`, `has-focus-visible:`, `has-aria-invalid:` and `focus-within:` cover the Checkbox, Switch and Input states without custom CSS.
- `@custom-variant in-field ([data-slot="Field"] > &)` expresses "directly inside a Field" cleanly.

Hard, and the workarounds:

- **Bare values must be steps of 0.25.** `--value(number)` in a functional `@utility` only accepts bare numbers in steps of 0.25. `scaling-group5-1.2` produces no CSS, and you have to write `scaling-group5-[1.2]`. I kept this behaviour on purpose, because it matches the steps rule 10 recommends, and the brackets mark a value that is off those steps. I noted it in Usage.
- **Order of utilities on the same element.** A user's `scaling-group2-1` and the component's own factor both live in the utilities layer. Tailwind decides their order itself, so which one wins was unpredictable. The workaround is a nested `:where(&)` inside `@utility component-group-<N>`, which gives the component's factors zero specificity.
- **Non-1 defaults on the same element.** For the same reason, a Checkbox can't override `component-group-3`'s `--scale-group2` with a second class. The workaround is the registered, non-inheriting `--default-group<N>` properties. Tailwind also adds a fallback for browsers without `@property` support on its own: `--default-group<N>: 1` on `*` in `@layer properties`.
- **Classes are found by scanning.** Factor declarations must be written out in full in the source, not built from strings at runtime. This is why each component lists its arbitrary properties literally.
- **Naming.** Tailwind already has `scale-*` for transforms and `group-*` as a variant prefix. That ruled out `scale-group5-*` and `group-5`, hence `scaling-*` and `component-group-*`.
- **No preflight** (decision 7) means writing `box-border` on every bordered or padded box, because base sizes are outer sizes.

### Plain CSS used, and why

- Five `@property --default-group<N>` rules in `styles.css`. Tailwind has no utility or directive that registers a non-inheriting custom property. Inheritance has to stop, or a nested component would use its ancestor's default factors.
- The nested `:where(&) { … }` blocks inside each `@utility component-group-<N>`. They live inside a Tailwind `@utility`, but the zero-specificity selector is hand-written. Tailwind has no built-in variant for it.

No other component styles are hand-written. Everything else is utility classes in `className`, `@theme inline`, `@utility` and `@custom-variant`.

## Verification

- `pnpm build` passes.
- In the gallery at `--scale: 1.25`, every measured size equals base × effective scale. Examples: Button 40 tall with 15px padding; Select-trigger Avatar 30px (0.75); Popup 5px below the trigger at 1.25 and 3px at 0.75; Field-label Badge 20px (0.8); Callout Icon 15px (0.75); CheckboxOverride and CheckboxOverrideViaUtility checkmarks 20px. The utility fixtures measure the same as their `style` versions.
- `fixtures.html` renders all 20 fixtures with no errors, apart from the `harness.js` 404 the page expects.
