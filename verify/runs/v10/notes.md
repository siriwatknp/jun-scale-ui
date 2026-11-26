# Notes on scale.css

## How the stylesheet works

- Each component root declares one private number, `--_scale`, equal to `var(--scale, 1) * var(--scale-groupN, 1)` for its group. Every size on the component and its parts is `calc(<base>px * var(--_scale))`. Parts never redeclare `--_scale`, so they inherit the component's number. A `--scale` or group factor set on a part does not change the part (rule 8, rule 9).
- Each component root also sets `--scale-group1` up to `--scale-group(N-1)` to `var(--scale-groupN, 1)` times the default from SPEC.md (rule 7). It never sets its own group's factor.
- Those factor declarations sit inside `:where()`, so they have no specificity. Any rule or inline style a user writes on the component element replaces them, as rule 7 asks ("A factor a user sets on the component element itself replaces the factor the component sets").
- Part-level defaults are set on the part, multiplied by the component's group factor the part inherits: `Select-trigger` sets `--scale-group4` to 0.75 × `--scale-group5`, and `Field-label`, `Field-help` and `Field-error` set `--scale-group3` to 0.8 × `--scale-group5`.
- Borders and outlines are 1px and not scaled. "Fully rounded" is `border-radius: 9999px`, also not scaled.
- Every component and part uses `box-sizing: border-box`, so base sizes are outer sizes as PRINCIPLE.md defines.
- Centering uses layout alignment only: flex `align-items: center`, grid `place-items: center`, or `inset: 0; margin: auto`.
- Radio's dot and Switch's thumb are `::before` pseudo-elements on the `<input>`, because the markup has no child element for them and rule 1 of the terms forbids painting a part with a background gradient.
- Checkbox is a 16×16 grid with one cell. `Checkbox-input` (with `appearance: none`) and the Icon share that cell, and the Icon is centered in it.
- Callout is a two-column grid. Its first row is exactly one text line tall (20 × scale). The Icon sits in that row and is centered in it, and `Callout-text` spans that row and the next one. This follows rule 8: "give it a row exactly one line tall and center it in that row".
- `Field-label` is a flex row with `min-height` equal to one line and `align-items: center`, so anything inside it is centered on the line.
- An Input or Select directly inside a Field gets `width: auto` and stretches to the Field's width.

## Checked in a headless browser (Chromium)

- Fixture sizes at `--scale` 1 and 1.5 match SPEC.md. For example, the Button is 32 and 48 tall, the Input is 180×32 and 270×48, the Switch is 40×24 and 60×36, and the Callout is 180 and 270 wide.
- I also checked `--scale` 0.75, 1.25 and 1.5, each combined with `--scale-group5: 1.5`, `--scale-group2: 1.5`, `--scale-group3: 0.5` or `--scale-group6: 1.5` on a container:
  - The Button icon follows `--scale-group5` and ignores an outer `--scale-group2`. A standalone Icon follows `--scale-group2`.
  - The Avatar in `Select-trigger` is 0.75 of the trigger's factor.
  - A Badge in `Field-label` is 0.8 of the Field's factor.
  - The Callout icon is 0.75 of the Callout's factor, and it stays centered on the first line.
- With `--scale: 3; --scale-group5: 3` set on `Select-trigger`, the trigger kept the Select's size, and the Avatar inside it read the values set on the part. This matches rule 8.
- CheckboxOverride: the checkmark is 16px in a 16px box, so the user's value is used as given.
- ButtonWithBadge: the Badge is 10px tall at scale 1 and 15px at scale 1.5.
- ButtonScaled: the Button is 38.391px tall at scale 1 and 57.594px at scale 1.5. These are not whole pixels; see point 1 below.

## Unclear points, gaps and contradictions

1. **The ButtonScaled fixture breaks the rule 10 advice to users.** Rule 10 says "keep the product of the values you set in steps of 0.25". The fixture sets `--scale-group5: 1.2` under `--scale` 1 and 1.5, which gives 1.2 and 1.8. The Button is then 38.4px and 57.6px tall. Rule 10's own example uses 1.2 under `--scale: 1.25`, which gives 1.5, but the fixture page has no 1.25 column. I built it as written and accepted the fractional sizes.

2. **The ButtonWithBadge fixture breaks the other rule 10 advice to users.** Rule 10 says "When you set a factor for a group directly, pick one that keeps that group's base sizes on multiples of 4px." `--scale-group3: 0.5` makes the Badge 10px tall with 4px padding and a 6px font, and it is centered in a 32px Button. I used the factor as given, as rule 7 says ("used as it is"). The value also does not multiply by the Button's factor, so the Badge would not follow a `--scale-group5` change on the Button. Rule 7 describes this.

3. **SPEC.md lists no border for Button, but `Field-group` suggests it has one.** The Button row gives no border. The `Field-group` text says "joins controls on a shared edge, such as an Input and a Button ... The controls overlap by their 1px border". I gave Button a 1px border in the same color as its fill. Because sizes are outer sizes, the height is still 32.

4. **Select has no width.** The Select row's base sizes are "–", and `Select-trigger` lists only height, padding, gap, border, radius and font. The trigger's chevron is "pushed to the right end", which only shows when the trigger is wider than its content. I let the trigger size to its content, used `margin-inline-start: auto` on the last Icon, and made the trigger fill its Select, so the chevron moves to the end when the Select is stretched. Input and Combobox say 180 wide; I didn't copy that width to Select because SPEC.md doesn't give it.

5. **"A Select trigger directly inside a Field" can't happen with the shown structure.** SPEC.md says "An Input, TextArea or Select trigger directly inside a `Field` stretches". The trigger is always inside `.Select`, so it is never a direct child of `.Field`. I stretch `.Field > .Select` instead, and the trigger fills the Select.

6. **Should the checkmark show when the Checkbox is unchecked?** SPEC.md says Checkbox has "an Icon checkmark, centered", but it does not say when it is visible. Radio says its dot is "shown when checked", and Checkbox has no such sentence. I hide the Icon when `Checkbox-input` is not checked.

7. **Parts on `<input>` elements depend on browser support.** Radio and Switch are bare `<input>` elements, so the dot and thumb can only be pseudo-elements. PRINCIPLE.md allows pseudo-elements as parts. However, `::before` on an `<input>` is not defined by the CSS standard. It works in Chromium and WebKit when `appearance: none` is set. I only tested in Chromium.

8. **Rule 8 says "a row exactly one line tall", but doesn't say how when the markup has no row element.** In the Callout, the Icon and `Callout-text` are siblings, and there's no wrapper to use as the row. I used a grid row with a fixed height of one line. In `Field-label` I used `min-height` instead of a fixed height, because a fixed height would clip a label that wraps to two lines. That makes the row "at least" one line tall rather than "exactly" one line.

9. **Rule 10 says "Every size the components define then lands on a whole pixel" in 0.25 steps. This is true only because of the children SPEC.md pairs with each factor.** A factor of 0.75 times a 0.25 step is 0.1875, and 4px × 0.1875 = 0.75px. Whole pixels hold only because the designed-for child has larger base sizes (Avatar 32 under 0.75, the Callout Icon 16 under 0.75). If a component with other base sizes lands under the same factor, for example a StatusDot inside an Avatar in `Select-trigger`, the claim no longer holds. Rule 10's third bullet hints at this ("chosen for the child it is designed around"), but the user-facing bullet states it without that limit.

10. **The Slider is a rule 10 case that SPEC.md doesn't list.** It was not in the fixtures and I did not build it. SPEC.md gives the Slider a height of 20, a track 8 tall and a thumb 16×16 centered on the track. 20 − 16 = 4 and 20 − 8 = 12, and neither is a multiple of 8. "Accepted deviations from rule 10" lists three cases and leaves this one out.

11. **The Field inline layout conflicts with `Field-label`'s line height.** It was not in the fixtures. SPEC.md says `Field-label` is "font 14 on a 20 line", but in `data-layout="inline"` "The label line is 24 tall". It doesn't say whether the label's line height changes to 24 or whether a 24-tall row wraps a 20px line.

12. **SPEC.md doesn't size `Input-field`.** It is "the text field" with no base sizes. I made it fill the remaining width (`flex: 1`), stretched it to the Input's inner height, and gave it the Input's font. This adds no scaled size of its own.

13. **"Fully rounded" and the radius list.** SPEC.md lists radii as "3px, 4px, 6px, 8px, or fully rounded", and rule 2 says border radius scales. A fully rounded radius doesn't need to scale, so I used a large fixed value. A scaled radius looks the same.

14. **Shadows and outline offsets.** Rule 2 lets these scale or not. I used a fixed 1px focus outline with a fixed 1px offset and no shadows.

15. **Specificity is not covered.** Rule 7 says a user's factor on the component element replaces the component's own factor. That only holds if the user's rule wins the cascade. Inline styles always win. A user's class rule with the same specificity would win or lose depending on source order. PRINCIPLE.md doesn't address this, so I put the component's factor declarations in `:where()`.
