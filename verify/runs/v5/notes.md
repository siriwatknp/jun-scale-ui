# Notes on scale.css

## How the scaling works

- `--scale` and `--scale-group1` to `--scale-group6` are registered with `@property` as `<number>`, inherited, with an initial value of 1. A registered property with a value that is not a number becomes invalid at computed-value time, so the element inherits the value from its parent. That gives rule 5's "the valid value set further out applies instead, or 1" without extra code. I checked it in Chromium: `--scale: foo` inside `--scale: 1.5` gives a 48px Button, and `--scale: 2px` on its own gives 32px.
- Each component of group N copies the factor in force on its own root into `--_groupN-factor`. A component never declares the factor copy for a bigger group, so a smaller component inherits the copy made by the nearest enclosing component of that bigger group. A component that is not inside any group N component gets the initial value of 1. This implements "each group counts once" and "read at the nearest component of that group".
- Each component works out its effective scale once on its root, as `--_groupN-scale` = `--scale` × its own factor copy × the inherited copies of every bigger group. Rule 9 allows this. Parts read the same variable, so `--scale` or a factor set on a part does not change the part.
- The effective scale variable is named per group, not shared. A parent can then apply a size to a child component with its own scale, as rule 8 requires, because the child does not override the parent's variable. In practice no rule needed this: Callout places its Icon with a grid row sized on the Callout's scale (see below).
- Component defaults for smaller groups use `:where()`, so they have zero specificity. An inline style or any user rule on the component element wins (rule 7). A value set on an ancestor loses, because a value declared on the element always beats an inherited one.
- `box-sizing: border-box` on every component and part, so heights are outer sizes ("a 32px box with a 1px border is 32px tall in total").

Checked in headless Chromium:

- Every base size in the brief at `--scale` 1 and 1.5.
- `--scale-group5: 1.5` on a container: Button 48px, its Icon 24px, a standalone Icon still 16px.
- `--scale-group2: 1.5` on a container: the Checkbox checkmark stays 8px because the Checkbox's own default is nearer. Icons in a Button and standalone Icons become 24px.
- A Field with `--scale-group5: 1.5`: the Input inside is 1.5, not 2.25.
- `--scale-group5: 2` on `Select-trigger`: no change to the trigger or the Avatar. `--scale: 2` on `Select-trigger`: the trigger is unchanged, and the Avatar and chevron double.
- `--scale-group4: 1` on a container around Select: the Avatar stays 24px. The same value on the trigger part: the Avatar becomes 32px.

## Sizes and factors I chose for inner parts

| Where | Choice | Reason |
| --- | --- | --- |
| Checkbox checkmark | `--scale-group2: 0.5` on `.Checkbox` → 8px | Rule 10 gives this exact case: "A 16px Icon centered in a 16px box needs 0.5". 0.75 (12px) would leave a 2px gap, which is off the 8px rule. |
| Radio dot | `::before`, 8×8, centered with grid alignment | 16 − 8 = 8. Only 8 or 0 fit the rule, and a 0 difference would not be "visibly smaller". |
| Switch thumb | `::before`, 16×16, left margin 4, centered vertically by flex alignment, moves by `translate` 16 when checked | Gap 4 on top, bottom and left. 24 − 16 = 8. The checked position mirrors it: 40 − 4 − 16 = 20, so the move is 16. |
| Select Avatar | `--scale-group4: 0.75` on `.Select` → 24px | Rule 10 gives this case: "A 32px Avatar centered in a 32px box can take 0.75". 32 − 24 = 8, so there is 4px above and below. |
| Select chevron | full size, 16px, pushed to the end with `margin-left: auto` | The brief gives no size. 32 − 16 = 16 keeps it on the grid. |
| Callout icon | `--scale-group2: 0.75` on `.Callout` → 12px | Rule 10: "A 16px Icon centered on a 20px text line needs 0.75". |
| Callout icon position | Grid with a first row of exactly 20 × the Callout's scale. The icon sits in that row with `align-self: center`. The text spans both rows. | Rule 8 asks for layout alignment, not a fixed offset. A row the height of the first line gives a box to center in, so the icon stays centered when a user changes its factor. |
| Button, Input icons | No factor set, so they stay at full size | The brief says "at full size". Not pinning them means a page-level `--scale-group2` still reaches them, as rule 6 describes. |
| Input-field | Stretches to the full content height of Input (30px at scale 1, inside the 1px borders), with no fixed height | A 20px field centered in 32px would differ by 12, which breaks the multiple-of-8 rule for centered boxes. A stretched box is not centered, so the rule doesn't apply. |
| Field's Input | `width: auto` with the default flex stretch | The brief says it "stretches to the Field's width". |
| Borders | 1px, not scaled, on Input, Select-trigger, Checkbox-input and Radio | Rule 2. Button, Badge, Switch, Avatar and Callout have no border, so none is drawn. |
| Circles and full rounding | `border-radius` = half the base size × scale, for example 12px for the Switch | Rule 2 lists border radius as base × scale. `50%` would give the same result. |

## Where PRINCIPLE.md was unclear, incomplete, or conflicting

1. **Invalid factor on a component that sets a default.** Rule 5 says: "A value that is not a valid number is ignored. The valid value set further out applies instead". Rule 7 says the component's default is nearer than any value further out. With `style="--scale-group2: foo"` on a Checkbox, it is unclear whether the Checkbox default (0.5) or the ancestor's value (1) should apply. Taken literally, "further out" means an ancestor, and that is what `@property` does: the checkmark becomes 16px. The other reading would need the default to be a lower-priority declaration on the same element, which plain CSS can't express once an invalid value has replaced it.
2. **The fixtures break rule 10.** `ButtonScaled` sets `--scale-group5: 1.2`, which gives 1.2 at scale 1 and 1.8 at scale 1.5. Both are off the 0.25 steps that rule 10 asks for, and the Button ends up 38.39px and 57.59px tall. `ButtonWithBadge` sets `--scale-group3: 0.5`, which rule 10 names as a bad value: "0.8 gives 16px, but 0.5 gives 10px". The Badge is 10px tall in a 32px Button, a difference of 22, and its font is 6px. I kept both settings as the brief says. The output follows the rules, but the fixtures show the 1px offsets that rule 10 warns about.
3. **`--scale` set on a part.** Rule 8 says that setting `--scale` on a part "changes a component inside the part". That means `--scale: 2` on `Select-trigger` gives a 48px Avatar inside a 32px trigger, which overflows. I followed the rule, but it is odd that the rule lets a part setting break the parent's fit.
4. **Whether horizontal padding includes the border.** Rule 2 says borders "are not part of the base size arithmetic". I kept the padding at 8px inside the 1px border, so the Input icon sits 9px from the outer edge. For vertical centering this makes no difference. For horizontal padding the rule doesn't say whether the border should eat into the padding.
5. **Centering on a text line is not centering in a box.** Rule 8 says to center "inside a box of its parent", and rule 10 talks about "the box or text line it is centered in". A text line is not a box, so with the markup fixed I had to make one: a grid row of the line's height. This is a layout box, not an element, so it is a judgment call whether it meets "a box of its parent".
6. **Parts on `<input>` elements.** Radio and Switch are `<input>` elements with no children, so the dot and thumb must be pseudo-elements. The principle allows this ("A part is a child element or a pseudo-element"), but `::before` on an `<input>` with `appearance: none` is a browser behavior, not a standard guarantee. I checked it only in Chromium. Firefox was not installed on this machine.
7. **Groups 1, 2 and 7.** The principle lists `--scale-group7` among the values users write, but no group 7 component is in the brief. I didn't register it, and no formula reads it. If Card, Dialog or Popover were added, every formula would also need to multiply by a group 7 factor copy. Group 1 and group 2 components can't contain anything (an Icon is an `<svg>`), so they don't make a factor copy.
8. **Which box is the main box of Select.** The brief gives every size to the trigger part, and none to the `Select` root. The principle's group table says the base size is "the height of the component's main box". I read the trigger as the main box. The root only holds the scale variables and the Avatar factor.
9. **"Icon chevron at the end".** It is unclear whether "at the end" means after the name or pinned to the right edge of a wider trigger. The trigger fits its content, so both readings look the same. `margin-left: auto` covers a wider trigger too.
10. **Button's border.** The brief gives no border for Button, while Input and Select do. I drew none.
