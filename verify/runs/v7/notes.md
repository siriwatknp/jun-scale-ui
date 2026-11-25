# Notes on scale.css (principle v7)

## How the stylesheet works

Each component root works out its effective scale once and stores it in `--_s`:

```css
.Button { --_s: calc(var(--scale, 1) * var(--scale-group5, 1)); }
```

Every scaled property on the root and on its parts is written as `calc(<base px> * var(--_s))`. Rule 9 allows this ("Working out a component's effective scale once, on the component's own root, and reusing that number for the component and its parts is fine"). A custom property inherits as its resolved value, so a part keeps its component's scale even if a user sets `--scale` or a group factor on the part. That is what rule 8 asks for. I checked it in the browser: `--scale: 2` on `Select-trigger` leaves the trigger at 32px and grows only the `Avatar` inside it.

Each component root also sets `--scale-group1` up to `--scale-group<N-1>`, each one equal to its own `--scale-group<N>` times a default. It never sets its own group's factor. A user's inline factor on the component element beats the class rule, so it is "used as it is" (rule 7, bullet 4). The `CheckboxOverride` fixture shows this: the checkmark is 16px instead of 8px.

Borders (1px) and outlines (2px focus ring) are not scaled. Every box uses `box-sizing: border-box`, so base sizes are outer sizes.

## Factors each component sets

| Component | Sets | Reason |
| --- | --- | --- |
| Icon (2) | g1 = 1 × g2 | 8px dot in a 16px box: 8px difference. |
| Badge (3) | g1 = 0.5 × g3, g2 = 0.75 × g3 | Children are centered in the 20px box. A 4px dot and a 12px icon are each a multiple of 8px smaller. |
| Checkbox (3) | g1 = 1, g2 = 0.5 × g3 | g2 is given by rule 7. An 8px checkmark in a 16px box. |
| Radio (3) | g1 = 1, g2 = 1 | It is an `<input>`, so it can hold no children. The values only meet the "sets every smaller group" rule. |
| Switch (3) | g1 = 1, g2 = 1 | Same as Radio. |
| Avatar (4) | g1, g2, g3 = 1 × g4 | 8px and 16px fit a 32px box. g3 has a Badge problem, see point 1. |
| Button (5) | g1 to g4 = 1 × g5 | Rule 7 states this exactly. The brief asks for a full-size Icon. |
| Input (5) | g1 to g3 = 1, g4 = 0.75 × g5 | A 32px Avatar would cover the 1px border, so it gets 24px. See point 7. |
| Select (5), on root | g1 to g3 = 1, g4 = 0.75 × g5 | The brief asks for an Avatar with room above and below. 24px in a 32px trigger gives 4px each side, counted from the outer edge. The chevron Icon stays 16px. |
| Field (5), on root | g1 to g4 = 1 × g5 | The Input inside shares the Field's g5 and sets its own factors. |
| Field-label part | g1 = 0.5, g2 = 0.75, g3 = 0.8, g4 = 0.625 (each × g5) | g3 is given by rule 7. The others put a child on the 20px text line: dot 4px, icon 12px, avatar 20px. |
| Field-help part | g3 = 0.8, g4 = 0.5 (each × g5) | On a 16px line, a Badge becomes 16px and an Avatar 16px. A 16px Icon and an 8px dot already fit with g = 1. |
| Callout (6) | g2 = 0.75 × g6, g1, g3, g4, g5 = 1 × g6 | The brief asks for a smaller icon on the first 20px line. 12px on a 20px line gives 4px each side. |

## Other decisions

- **Checkbox**: the `span.Checkbox` root is the 16×16 grid cell. The `Checkbox-input` part fills the cell and draws the border and fill. The checkmark `Icon` sits in the same cell and is centered with `place-items: center`. While unchecked, the Icon is hidden.
- **Radio**: the dot is the `::before` of the `<input>`. It is 8px in a 16px circle and is centered with `display: inline-grid; place-content: center`.
- **Switch**: the thumb is the `::before` of the `<input>`. It is a 16px thumb in a 40×24 track. The track uses `align-items: center` and has 4px left and right padding, so the gap is 4px on the top, bottom and left. When checked, the thumb moves with `translate: 16px × scale`. The track has no border, because the brief gives none.
- **Callout**: I used a grid with columns `auto 1fr` and rows `20px × scale` then `auto`. The Icon sits in row 1 with `align-self: center`. The text spans both rows. This centers the icon on the first text line by layout alignment, not by a fixed offset. `max-width: 180` is an outer size, because the box uses `border-box`.
- **Field**: the Field is a flex column with an 8px gap. The `Input` inside gets `width: auto` and stretches. That width is set by the Field on a child, and it is not scaled, which follows rule 8, bullet 2. The label is a flex row with `align-items: center` and a 4px gap, so any component placed in it is centered on the text line. The brief gives no gap for this, so 4px is my choice.
- **Select**: the trigger is as wide as its content. The brief gives no width. The chevron gets `margin-left: auto`, so it stays at the end if the trigger is ever stretched.
- **Button**: the brief gives no border, so there is none. The text is an unwrapped text node, which is why the text follows the Button (rule 8: "Text has no group").
- I checked the fixtures, and these cases, in headless Chromium: `--scale: 0.75` and `--scale: 1.25` on a container, `--scale-group2: 1.5` on a container (a standalone Icon becomes 24px, the Icon in a Button stays 16px), `--scale-group5: 1.5` on a container and on a Field, and a nested `--scale: 1` inside `--scale: 1.5`. Every case matched rules 5 to 8. At 0.25 steps, every box edge landed on a whole pixel, except in the cases listed below.

## Unclear points, gaps and contradictions in PRINCIPLE.md

1. **One factor cannot fit every member of a group.** Rule 10 says: "Every group factor that a component sets keeps the child's box sizes on multiples of 4px, and keeps the child a multiple of 8px smaller than the box or text line it is centered in." Group 3 holds a 16px Checkbox and Radio, a 20px Badge and a 24px Switch, and one `--scale-group3` serves all of them. In a 32px Button, factor 1 suits the Checkbox (16px difference) and the Switch (8px), but leaves the Badge 12px smaller. No single factor works for all three: the Badge needs 0.4, 0.8 or 1.2, and the Checkbox needs 0.5, 1 or 1.5. Rule 7 then says outright: "A `Button` sets `--scale-group1` to `--scale-group4` to its own `--scale-group5`." I followed rule 7 and set factor 1. As a result, a Badge in a Button at `--scale: 1.25` has 7.5px above and below it, which is the 1px error rule 10 exists to prevent.

2. **The Field label example breaks rule 10.** Rule 7 says: "A `Field` label sets the Inline factor to 0.8 × the `Field`'s factor, so a `Badge` in the label fits the text line." A 16px Badge on a 20px line differs by 4px, not by a multiple of 8px. The Badge's 8px padding becomes 6.4px, which is not a multiple of 4px, and a Checkbox in the label would be 12.8px. That also contradicts rule 10's user rule: "Every size the components define then lands on a whole pixel, including sizes changed by the factors components set themselves." At scale 1, the label's Badge padding is 6.4px. Rule 10's advice "0.8 gives 16px, but 0.5 gives 10px" seems to look at height only. I kept 0.8 because rule 7 names it. Factor 1 (a 20px Badge on a 20px line, difference 0) would have met rule 10.

3. **The fixtures use values that the user rules warn against.** `ButtonScaled` sets `--scale-group5: 1.2`. At `--scale: 1` the product is 1.2 and at 1.5 it is 1.8. Neither is a step of 0.25, and the Button measures 38.39px and 57.59px tall. `ButtonWithBadge` sets `--scale-group3: 0.5`. That gives a 10px Badge, which is rule 10's own bad example ("0.5 gives 10px"), and at scale 1.5 the Badge sits at 16.5px. The brief says to leave these values in place, so I did. As a result, those fixtures cannot be pixel-exact.

4. **"Fit" is not defined.** Rule 7 says: "The default is 1, unless a child must be smaller to fit." It does not say whether a 32px Avatar "fits" a 32px Button with no border (it fills the full height), or a 32px Input whose 1px border leaves a 30px content box. Rule 10 says "A 32px `Avatar` centered in a 32px box can take 0.75". "Can" makes this optional. I kept 1 for Button, because rule 7 states that value, and used 0.75 for Input and Select.

5. **Parts on `<input>` elements.** The Terms section says "A part is a child element or a pseudo-element." The Radio and Switch fixtures are bare `<input>` elements, so the dot and the thumb have to be `::before` on an input. CSS does not promise pseudo-elements on inputs. They work in Chromium and WebKit when `appearance: none` is set. Neither PRINCIPLE.md nor the brief mentions this.

6. **Centering on a text line by layout alignment.** Rule 8 says: "center it with layout alignment rather than a fixed offset." The brief asks for the Callout icon to be "centered vertically on the first 20px text line". No alignment keyword centers a box on the first line of a sibling paragraph. I made a grid row the height of one line and centered the icon in that row. Another reader could just as well use `margin-top: 4px × scale`, a fixed offset that is wrong once a user changes `--scale-group2`.

7. **Which box a child of a Badge is centered in.** A Badge is 20px tall with a 16px text line. Rule 10 says "the box or text line it is centered in", and both apply here. I used the 20px box (icon 0.75, dot 0.5). Using the 16px line would give factor 1 for both.

8. **Every component sets every smaller factor, even with no children.** Rule 7 says "A component of group N sets the factor of every smaller group". Radio and Switch are `<input>` elements and cannot hold components. An Avatar holds only initials. I set the factors anyway, with values chosen on paper. Nothing can test them.

9. **Part factors still read the variable at the part.** Rule 7 says a part sets a factor "still multiplied by the component's own group factor". Rule 8 says "Setting `--scale` or a group factor on a part does not change the part itself." I wrote the Field label's factors as `calc(0.8 * var(--scale-group5))`, read at the label. If a user sets `--scale-group5` on the label itself, the label's own sizes do not change, which is correct. Its child factors do change, because they read the new value. The principle does not say whether that is wanted.

10. **"Three constraints" has four bullets.** Rule 10 says "Three constraints keep every edge on a whole pixel:" and then lists four bullets. The fourth is the text exemption, so the count may mean the first three. It is a small wording issue.

11. **Properties missing from rule 2.** Rule 2 lists the properties that scale, but grid track sizes and `flex-basis` are not on the list. I scaled the Callout's first row track (`20px × scale`) and treated it as a height.

12. **Brief gaps, filled by choice.** These were not given, so I chose them: no border on Button or Switch; Select width left to content; a 4px gap between items in the Field label; colors and font weights. The brief says the Field's Input "stretches to the Field's width". The Input's base width of 180 is then overridden by `width: auto` from the Field.
