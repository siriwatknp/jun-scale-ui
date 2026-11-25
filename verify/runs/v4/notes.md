# Notes on scale.css (principle version 4)

## How the scale is worked out

- `--scale` and `--scale-group1` to `--scale-group6` are registered with `@property` as `<number>`, inherited, with an initial value of 1. A value that is not a number is then invalid when the browser computes it, so the element inherits the value from its parent, or gets 1 when nobody further out sets one. This gives the "value that is not a valid number is ignored" rule from section 5 without extra code. `--scale-group7` is not registered because no group 7 component is built.
- Each component root copies its own group factor into a private variable, `--_in-group3` to `--_in-group6`. Descendants inherit that copy, so they see the factor that was in force at the nearest enclosing component of that group, not the factor in force at their own element. This is what makes "each group counts once" and "the factor at the nearest enclosing component" work. Groups 1 and 2 need no copy, because nothing is built inside a `StatusDot` or an `Icon`.
- Each component root computes `--_scale` once: `--scale` × its own group factor × the copied factors of every bigger group. A group N component ignores the copy for its own group, so an `Input` inside a `Field` uses group 5 once. Parts read the inherited `--_scale` of their component, so setting `--scale` or a factor on a part does not change the part.
- Every scaled property is written as `calc(<base>px * var(--_scale))` in the property that uses it. No scaled size is stored in a shared variable.
- The factors a component sets for smaller groups are wrapped in `:where()`, so a user rule on the component element wins whatever its selector weight.

Checks run in a headless browser: every fixture at `--scale` 0.75, 1, 1.25, 1.5 and 2; `--scale-group5` on a container (the `Button` and its `Icon` change, a standalone `Icon` does not); `--scale-group5: 1.25` on a `Field` (the `Input` is 40px, not 50px); `--scale-group2` on a page container (the `Checkbox` checkmark stays 8px); `--scale` and `--scale-group5` set on `Select-trigger` (the trigger stays 32px, the `Avatar` inside follows the new `--scale`); invalid `--scale` values (the outer value applies, or 1); nested `--scale` values (the nearer one wins). Every box edge landed on a whole pixel at scales in steps of 0.25, except in the two fixtures that use factors outside those steps (see points 2 and 3 below).

## Sizes and factors chosen for inner parts

| Component | Inner piece | Choice | Result at scale 1 | Why |
| --- | --- | --- | --- | --- |
| Checkbox | `Icon` checkmark | `--scale-group2: 0.5` on the root | 8px in a 16px box | Section 10 names 0.5 for a 16px `Icon` centered in a 16px box. |
| Radio | dot part (`::before`) | 8px | 8px in 16px, 4px each side | It must be visibly smaller and differ by a multiple of 8px. |
| Switch | thumb part (`::before`) | 16px, inset 4px by padding, moved 16px by `translate` when checked | 4px gap on top, bottom, left, and on the right when checked | 24 − 16 = 8, so the thumb sits on whole pixels. |
| Select | `Avatar` | `--scale-group4: 0.75` on the `Select` root, not on the trigger part | 24px in a 32px trigger | Section 10 names 0.75 for this case. |
| Select | chevron `Icon` | no factor, full 16px | 16px in 32px | The brief gives no size. 16px is already 16px smaller than the trigger. |
| Button, Input | `Icon` | no factor, full 16px | 16px in 32px | The brief says "at full size". |
| Callout | `Icon` | `--scale-group2: 0.75` on the root | 12px on a 20px line | Section 10 names 0.75 for a 20px text line. |
| Input | text field part | stretched to the full height of the `Input`, not given its own height | | A 20px field box centered in 32px would differ by 12px, which breaks section 10. A stretched box is not centered, and the text inside it is exempt. |
| Field | `Input` | `width: auto` so the flex column stretches it | 240px | The brief says the `Input` stretches to the `Field`'s width. |

The `Checkbox`, `Radio` and `Input` borders are 1px and do not scale. The `Switch` has no border (see point 9).

To center the `Callout` icon on the first text line by layout alignment, the `Callout` is a two-column grid whose first row is one line high (`20px × scale`). The icon sits in that row with `align-self: center`. The text spans both rows.

## Places where PRINCIPLE.md was unclear or seemed to conflict

1. **The 0.8 Icon factor in the section 5 examples breaks section 10.** Section 5 says: "Some examples, with a `Button` (group 5) whose default `Icon` factor is 0.8". 0.8 × 16 = 12.8px, which is not a multiple of 4px, and 32 − 12.8 is not a multiple of 8px. The brief also says the `Button` holds "an `Icon` at full size". I followed the brief, so `Button` sets no `Icon` factor. As a result, `--scale-group2` set on a page container does reach the `Icon` inside a `Button`. If the example meant that `Button` should always set its own `Icon` factor to shield it, the principle does not say so.

2. **The `ButtonWithBadge` fixture uses the factor that section 10 calls wrong.** Section 10 says: "When you set a factor for a small group directly, such as the factor for a 20px `Badge`, pick one that keeps that group's base sizes on multiples of 4px: 0.8 gives 16px, but 0.5 gives 10px." The fixture sets `--scale-group3: 0.5` on the `Button`. The `Badge` becomes 10px tall with a 6px font, centered in 32px with 11px on each side, and its width is fractional. I left the user setting as it is.

3. **The `ButtonScaled` fixture breaks the user rule in section 10.** Section 10 says: "keep their product in steps of 0.25". With `--scale-group5: 1.2` the product is 1.2 at `--scale: 1` and 1.8 at `--scale: 1.5`. The `Button` is 38.4px and 57.6px tall. I did not round anything, because section 2 says scaled properties "equal base size × effective scale". Rounding would also break the 8px difference between the `Button` and its `Icon`.

4. **No `Badge` factor works inside a `Button`.** Section 10 says a centered box "differs from it by a multiple of 8px". A 20px `Badge` in a 32px `Button` differs by 12px. To fix it, a factor f would need 32 − 20f to be a multiple of 8 while 20f, 8f and 16f stay multiples of 4. Only whole numbers keep 20f and 8f on multiples of 4, and f = 1 gives the 12px difference. 0.8 gives a 16px height but 6.4px padding and a 12.8px line height. So `Button` sets no `Badge` factor, and the default `Badge` in a `Button` sits 6px from the top and bottom. The principle does not say whether padding counts as a "box size" in the third bullet of section 10 ("keeps the child's box sizes on multiples of 4px").

5. **An invalid value on the component element drops the component's own default.** Section 5 says: "A value that is not a valid number is ignored. The valid value set further out applies instead, or 1 when no element further out sets one." With `style="--scale-group2: abc"` on a `Checkbox`, the checkmark takes the value from outside the `Checkbox`, or 1, so it becomes 16px instead of the `Checkbox`'s default 8px. That follows the sentence literally, and it is what the browser does with a registered property. Section 7 suggests the component default should apply unless a user overrides it, and an invalid value is arguably not an override. The principle does not say whether the component's own default counts as "further out".

6. **A bigger group factor set on a part does not reach components inside the part.** Section 8 says: "Setting `--scale` or a group factor on a part does not change the part itself. It only changes components inside the part." Section 5 says a bigger group's factor is taken "at the nearest component of that group that encloses this component". These disagree for `--scale-group5` set on `Select-trigger`. The `Avatar` inside the trigger is inside the `Select`, so section 5 says it uses the `Select`'s group 5 factor, and the value on the part has no effect. I followed section 5. A factor for the inner component's own group, such as `--scale-group4` on the trigger, does change the `Avatar`. So does `--scale` on the trigger.

7. **The element that sets `--scale` is not said to be "inside" itself.** Section 3 says `--scale` "applies to every component inside that element". I treated the element itself as included, so `--scale` on a `Button` element scales that `Button`. This matches how section 7 treats a factor set "on the component element itself".

8. **Where the global scale is read is not stated.** Section 5 multiplies "the global scale" without saying whether it is read at the component, or at some enclosing component as the group factors are. I read it at the component root. Section 8 supports this for parts, but the principle never says it for components.

9. **"Borders do not count" holds for centering, not for insets.** Section 2 says: "a 1px border on both sides of a box does not change where its centered content lands." That is true for centered content. For the `Switch` thumb, which is centered vertically but placed by padding on the left, a border would add 1px to the left gap but not to the top and bottom gaps measured from the outer edge. That would break the brief's "same gap on the top, bottom and left". I gave the `Switch` no border. The principle does not say how a border interacts with an offset that is not centering.

10. **Single-element components can only have pseudo-element parts.** `Radio` and `Switch` are a lone `<input>`, so the dot and the thumb are `::before` on the input. The principle allows pseudo-element parts. It depends on the browser drawing `::before` on an `<input>` with `appearance: none`. Chromium does.

11. **The `Field` width override might count as a size variant.** Section 1 says "There are no size variants". The `Input` is 180px wide alone and 240px wide inside a `Field`, because the brief asks for it to stretch. I set `width: auto` from the `Field`. Section 8 covers sizes a parent applies to a child, but only scaled sizes such as margins, not a width the parent replaces.

12. **The brief gives no size for the `Select` root.** The brief only gives the trigger part's sizes. The root is an inline flex box that wraps the trigger.

13. **Components in the group table but not in the brief were not built.** These are `Kbd`, `IconButton`, `Combobox`, `TextArea`, `Slider`, `Progress`, `DropdownMenu`, `Card`, `Dialog` and `Popover`. Group 7 therefore has no copied factor. Adding a group 7 component means adding `--_in-group7` and multiplying it into every smaller group's formula.
