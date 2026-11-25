# Notes on scale.css

## How the scale is computed

Each component element resolves its own effective scale once and every size multiplies a base size by it in the property that uses it:

```css
.Button {
  --_scale-global: var(--scale);
  --_scale-factor: var(--scale-group5);
  --_scale-effective: calc(var(--_scale-global) * var(--_scale-factor));
  height: calc(32px * var(--_scale-effective));
}
```

- `--scale` and `--scale-group1` to `--scale-group7` stay unregistered, so they inherit at any depth and the nearest value wins (rules 3 and 6).
- `--_scale-global` and `--_scale-factor` are registered with `@property` as `<number>`, `inherits: false`, initial value 1. A value that is not set, or not a valid number, makes the declaration invalid at computed-value time, and the property falls back to its initial value 1. This is how rule 5 ("is not a valid number, counts as 1") holds without JavaScript. A plain `var(--scale-group5, 1)` would only cover the "not set" case; an invalid value would break every size of the component.
- `--_scale-effective` is registered as an inherited `<number>`. Parts don't declare it, so they inherit the value of their component (rule 8, first bullet). Each component declares its own, so a child component never uses its parent's value.
- The stored value is a unitless scale, resolved on the component itself, not a scaled size stored high in the tree. I read rule 9 as allowing this.

Checked in headless Chromium: every base size in the brief at `--scale` 1, 1.25, 1.5 and 0.75; `--scale-group5: foo` and `--scale: bar` both give a 32px `Button`; `--scale: 1.2` with `--scale-group5: 0.8` gives 30.72px (0.96); `--scale-group5: 0.5` halves a `Button` but leaves its `Icon` at 16px; an outer `--scale-group2: 2` does not reach the `Checkbox` checkmark, but `--scale-group2` set on the `Checkbox` itself does; a nearer `--scale` replaces an outer one. `screenshot.png` shows the fixtures.

## Sizes and factors I chose for inner parts

| Where | Choice | Why |
| --- | --- | --- |
| `Checkbox` checkmark | `Checkbox` sets `--scale-group2: 0.5`, so the `Icon` is 8px in the 16px box | Rule 10 needs a centered child to differ by a multiple of 8px. 16 − 8 = 8 is the only option that is smaller than the box. 0.75 (12px) differs by 4 and is ruled out. |
| `Radio` dot | 8px, centered | Same rule: 16 − 8 = 8. |
| `Switch` thumb | 16px circle, 4px inset on top, bottom and left; 4px from the right when checked | 24 − 16 = 8, so the vertical gap is 4px, and the brief asks for the same gap on the left. |
| `Select` avatar | `Select` sets `--scale-group4: 0.75`, so the `Avatar` is 24px in the 32px trigger, 4px above and below | 32 − 24 = 8. 0.5 (16px) also works but makes the initials 7px. I set the factor on `.Select`, not on `.Select-trigger`, so a user can override it on the component itself (rule 7, third bullet). |
| `Callout` icon | `Callout` sets `--scale-group2: 0.75`, so the `Icon` is 12px | Centered on a 20px line: 20 − 12 = 8. |
| `Callout` icon centering | A grid whose first row is `20px × Callout scale`; the icon is centered in that row and the text spans both rows | The row height is a size the `Callout` applies, so it uses the `Callout` scale (rule 8, second bullet). The icon stays centered on the first line even if a user changes either factor, with no formula that depends on the child's size. |
| `Field` → `Input` width | The `Input` stretches to the `Field` width (240) instead of its own 180 | The brief gives `Field` a width of 240 and does not say the `Input` stays at 180. Stretching is a size the `Field` applies, so it uses the `Field` scale. |
| Box sizing | `border-box` on every component and on the input parts | The brief gives outer sizes (height 32 with a 1px border). With `border-box` the 1px border eats into the 32, so the content is 30px; the centered `Icon` still sits on whole pixels because the border is the same on both sides. |
| Focus rings | 2px outline, 2px offset, not scaled | Rule 2 says outline widths do not scale and does not mention `outline-offset`. I treated the offset as part of the outline. |
| Fully rounded `Switch` | `border-radius: 12px × scale` | Equal to half the height at any scale. Circles (`StatusDot`, `Radio`, `Avatar`) use `50%`, which scales by itself. |

## Places where PRINCIPLE.md was unclear, incomplete, or contradictory

1. **Parts with no element.** "**Part**: an element that belongs to one component". The brief asks for a `Radio` "dot part" and a `Switch` "thumb part", but the markup gives each only a single `<input>`, and I may not change the markup. Pseudo-elements on `<input>` are not reliable across browsers, so I drew both as a `radial-gradient` background sized and placed with the component's scale. The principle does not say whether a part can be something other than an element, or whether `background-size` and `background-position` count as sizes. I treated them as sizes and position offsets and scaled them.

2. **Rule 10 against the brief: text line boxes.** "Every base size and offset of a box is a multiple of 4px. This includes line heights." and "A part or child centered inside another box differs from it by a multiple of 8px". If a line box counts as a centered child, the brief breaks the rule in many places: a 20px line in a 32px `Button`, `Input`, `Select` trigger and `Avatar` (difference 12), and a 16px line in a 20px `Badge` (difference 4). At `--scale: 1.25` the `Button` text line is 25px in 40px, so it sits on a half pixel (measured: the `Input-field` top lands at y = 471.5). I kept the brief's sizes. The principle should say whether text line boxes are covered by the 8px rule.

3. **Rule 10, third bullet, cannot be met for the `Avatar` in `Select`.** "Every group factor that a component sets is a multiple of 0.25, and it keeps the child's sizes on multiples of 4px." The `Avatar` has a 20px line height. For 20 × f to be a multiple of 4, f must be a multiple of 0.2. Combined with "a multiple of 0.25", f must be a whole number, so no factor below 1 shrinks the `Avatar`, yet the brief requires it to fit inside the trigger. I chose 0.75, which gives a 15px line in a 24px circle (a 4.5px gap).

4. **Rule 10's promise to users does not hold when child and container scale differently.** "keep the effective scale of every component, `--scale × --scale-group<N>`, in steps of 0.25 ... Every size and every centered gap then lands on a whole pixel." In `ButtonWithBadge` at `--scale: 1.5`, the `Button` is at 1.5 and the `Badge` at 0.75, both valid steps. The `Badge` is 15px tall in a 48px `Button`, a 16.5px gap on each side (measured: the `Badge` top lands at y = 912.5). The "differ by a multiple of 8" rule only guarantees whole gaps when parent and child share an effective scale.

5. **Component-set factors take a user's scale off the 0.25 steps.** The rule for users says to keep every effective scale in steps of 0.25, but the `Checkbox` sets `--scale-group2: 0.5`. At a valid user `--scale: 1.25`, the checkmark's effective scale is 0.625. The user cannot avoid this. It happens to land on whole pixels here (10px in a 20px box), but the principle's own rule is broken by its own example.

6. **"Counts as 1" vs "nearest value wins" for invalid values.** Rule 5: "A group factor that is not set, or is not a valid number, counts as 1." Rule 6: "When an element nearer to a component sets the same factor, the nearer value wins." If an outer element sets `--scale-group5: 0.5` and a nearer one sets `--scale-group5: foo`, it is unclear whether the result is 1 or 0.5. I followed rule 5 literally: the result is 1.

7. **`--scale` set on a part.** Rule 3: `--scale` "applies to everything inside that element." Rule 8: "A part uses the effective scale of its component." If a user sets `--scale` on a part, the two rules disagree. I followed rule 8: parts inherit the component's resolved scale and ignore a `--scale` set on themselves. Text inside the part follows the part.

8. **Rule 8, second bullet, and sizes that depend on the child.** "A size that a component applies to a child component, such as a margin that places the child, uses the effective scale of the component that applies it, not the child's." A margin that centers a child (the `Callout` icon on its first line) depends on both sizes: (20 × callout scale − 16 × icon scale) / 2. The rule does not cover this. I avoided the question with a grid row sized by the `Callout` and `align-self: center`.

9. **What the group table's "Base size" column measures.** Group 3 is "16–24px" but the `Switch` is 40 wide. Group 5 is "32–64px" but the `Input` is 180 wide and the `Field` is 84px tall (20 + 8 + 32 + 8 + 16). I assumed the column means the height of a single-line control, and that `Field` is in group 5 only so it can contain an `Input` of the same group. The principle does not say whether a component may fall outside its group's range.

10. **Properties rule 2 does not list.** Rule 2 lists the properties that scale and says "Border widths and outline widths do not scale." It does not mention `outline-offset`, `box-shadow`, `background-size`, `background-position`, or SVG stroke widths. Strokes inside an `Icon` scale with the SVG because of its `viewBox`, so the `Checkbox` checkmark stroke is 1px at scale 1 and 1.5px at 1.5. The principle may or may not intend strokes to stay fixed like borders.

11. **`box-sizing` and borders.** The brief gives "height 32 ... 1px border" for `Input` and the `Select` trigger. The principle does not say whether base sizes include the border. Because borders don't scale, the content area is `32 × scale − 2`, which is not a multiple of 4. Centering still lands on whole pixels because the border is symmetric, but rule 10's "every base size ... is a multiple of 4px" is ambiguous here. The same applies to `max-width: 180` on `Callout`, which I treated as including padding.

12. **"Visibly smaller" leaves only one choice.** The brief says the `Checkbox` checkmark must be "visibly smaller than the box", and rule 10 (difference a multiple of 8) leaves exactly 8px in a 16px box. The result is a small checkmark with a 1px stroke. It works, but the brief and the principle together leave no room for a design decision.

13. **Where a component sets a factor: the component or its part.** Rule 7 says "Any element may set `--scale-group<N>`: a page container, a component or a part." For `Select`, setting the `Avatar` factor on the `.Select-trigger` part would mean a user override on `.Select` is ignored, which contradicts the third bullet ("set it on that component or nearer"). I set it on the component. The principle could say a component sets factors on its root element.
