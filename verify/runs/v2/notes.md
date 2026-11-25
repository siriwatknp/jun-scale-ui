# Notes on scale.css

## How the stylesheet works

- `--scale` and `--scale-group1` to `--scale-group7` are registered with `@property` as `<number>`, inherited, with an initial value of 1. Registration is what makes rule 5 hold: a value that is not a number becomes invalid when the browser computes it, so the element takes the inherited value, or 1 when nothing outside sets one.
- Each component root computes its effective scale once, into a private variable named after the component, such as `--_button: calc(var(--scale) * var(--scale-group5))`. That variable is also registered as a `<number>`, so it holds a plain number by the time it is inherited.
- Every size on the root and on its parts is `base px × that private variable`. Parts read the variable their root computed, so setting `--scale` or a group factor on a part changes nothing about the part. It only reaches components inside the part, which compute their own variable (rule 8, first bullet).
- Each component has its own variable name instead of one shared name. If two components shared a name, a rule like `.Field > .Input { margin: ... }` would read the Input's value instead of the Field's, which breaks rule 8, second bullet. The current stylesheet sets no scaled size on a child component, but the naming keeps that possible.
- A factor that a component sets for a smaller group is declared with `:where(.Checkbox) { --scale-group2: 0.5 }`. `:where()` has zero specificity, so any user rule that targets the component wins, as well as an inline style.
- All components use `box-sizing: border-box`, so a 1px border sits inside the base size ("Sizes are outer sizes"). Borders and outlines are 1px or 2px and do not scale. Shadows do not scale.

## Sizes and factors I chose for inner parts

| Where | Choice | Why |
| --- | --- | --- |
| Checkbox checkmark | `--scale-group2: 0.5` on `.Checkbox`, so the Icon is 8px in a 16px box | Rule 10 requires a centered box to differ from its container by a multiple of 8px. 16 − 8 = 8 works. 0.75 gives 12px, and 16 − 12 = 4 breaks the rule: at `--scale: 1.25` it would sit 2.5px from each edge. |
| Checkbox box | The `Checkbox-input` part fills the 16×16 root, with the 1px border and radius 3. The Icon shares the same grid cell and is centered with `place-items: center`. | Rule 8 asks for layout alignment, not a fixed offset. |
| Radio dot | `::before` part, 8×8, centered with `place-items: center` | Same multiple-of-8 rule: 16 − 8 = 8. |
| Switch thumb | `::before` part, 16×16. The track has 4px left padding and centers the thumb vertically. When checked, the thumb moves by `translateX(16px × scale)`. | 24 − 16 = 8, so the gap is 4px on the top, bottom and left, and also on the right when checked (40 − 4 − 16 − 4 = 16). |
| Avatar in Select | `--scale-group4: 0.75` on `.Select`, so the Avatar is 24px in the 32px trigger | 32 − 24 = 8, so there is 4px above and below. This matches rule 10's own example ("0.75 on a 32px Avatar"). 0.5 would give 16px, which also centers, but leaves it smaller than needed. |
| Callout icon | `--scale-group2: 0.75` on `.Callout`, so the Icon is 12px, centered on the first 20px line | 20 − 12 = 8. 0.5 gives 8px, and 20 − 8 = 12 is not a multiple of 8, so 0.75 is the only factor that is visibly smaller and fits rule 10. |
| Callout layout | A grid with columns `auto 1fr` and rows `20px × scale` then `auto`. The Icon sits in row 1 with `align-self: center`. The text spans both rows. Column gap 12, row gap 0. | The markup has no wrapper around the Icon, so a grid row the height of one text line is the only way to center it on the first line with layout alignment rather than a `margin-top`. |
| Select chevron | `margin-inline-start: auto` | Keeps it at the end if the trigger is ever wider than its content. It is not a size, so it does not scale. |
| Field and Input | The Input keeps its own 180px width inside the 240px Field | See unclear point 7. |
| ButtonWithBadge | No special rule. The user's `--scale-group3: 0.5` makes the Badge 10px tall, 6px text, 1.5px radius, centered by the Button's `align-items: center`. | This is the case rule 10 warns about. At `--scale: 1.5` the Badge is 15px in a 48px Button, so it sits 16.5px from the top: half a pixel off, as the principle predicts. |

## Checks I ran (Chromium, through playwright-cli)

- At `--scale` 0.75, 1, 1.25 and 1.5, every component's outer size equals base × scale. Every centered part or child sits a whole number of pixels from each edge, except the Badge inside ButtonWithBadge, as expected.
- `--scale: foo` inside an element with `--scale: 1.5` gives 1.5. With nothing outside it gives 1.
- A group factor set on an outer element does not reach the Checkbox checkmark. The same factor set on the `.Checkbox` itself does.
- `--scale: 2` on the `Select-trigger` part leaves the trigger at 32px and makes the Avatar inside it 48px.
- `--scale-group5: 0.5` on a Button makes it 16px tall and leaves its Icon at 16px.
- `--scale: 1.2` with `--scale-group5: 0.8` gives an effective scale of 0.96.
- A nearer group factor replaces an outer one.
- `--scale: 2` on an Input inside a Field makes the Input 64px tall and leaves the Field's gap at 8px.
- I could not check Firefox or Safari, because those browsers are not installed here. See unclear point 3.

## Where PRINCIPLE.md was unclear, incomplete, or in tension

1. **Rule 10's factor examples clash with its own centering rule.** The third bullet says "0.5 or 0.75 on a 16px `Icon`", and the user advice says "0.5 or 0.75 for a 16px or 32px component". But a 12px Icon (0.75) centered in a 16px or 32px box differs by 4 or 20px, which breaks the second bullet ("differs from it by a multiple of 8px"). So 0.75 on an Icon is only safe when the Icon is centered in a box of 20, 28, 36px and so on. I had to work this out case by case. A factor alone does not guarantee whole pixels; the factor and the box it is centered in together do.

2. **"Every size the components define then lands on a whole pixel" is not quite true for line heights.** The Avatar's 20px line height at the Select's 0.75 factor is 15px, and at `--scale: 1.25` it is 18.75px. The third bullet only promises that a factor maps "the child's box sizes" to multiples of 4. It does not say whether a line height counts as a box size. The first bullet says line heights must be multiples of 4 "so stacked lines stay on whole pixels". I accepted the fractional line height because the Avatar's text is one line centered in a fixed box, so no box edge moves.

3. **Parts on elements that cannot have children.** Terms says "A part is a child element or a pseudo-element" and never painted. The Radio and Switch markup is a bare `<input>`, so the dot and the thumb can only be `::before`. Pseudo-elements on an `<input>` are not covered by the CSS specifications. They render in Chromium (checked). I believe they also render in Safari and current Firefox when `appearance: none` is set, but I could not check that here. The principle doesn't say what to do when the markup leaves no room for a child element.

4. **Invalid factor on a component that sets its own default.** Rule 5: "A value that is not a valid number is ignored, as if it were not set. The value set further out then applies." Rule 7 says a component sets some factors on its own root. If a user writes `--scale-group2: foo` on a `.Checkbox`, "as if it were not set" suggests the Checkbox's own 0.5 should apply, but "the value set further out" suggests the outer value. With `@property` the browser takes the inherited value from outside the Checkbox, so the checkmark grows to the outer factor (16px by default). I kept that behavior, because it follows the literal sentence, but the two halves of the sentence point at different values here.

5. **How a user override beats a component's own factor.** Rule 7: "It sets the factor on its own root element, not on a part, so that a user can still override it on the component." The principle doesn't say how the override wins the cascade. A user rule with the same specificity that loads earlier would lose. I used `:where()` so that any user selector wins. That is a guess about intent.

6. **Storing the effective scale.** Rule 9: "Never store an already scaled size in a shared value that is set high in the tree." Rule 8 needs parts to ignore `--scale` set on themselves, which in CSS means the component root must store its effective scale for its parts to read. I read rule 9 as allowing this, because the stored value is a scale, not a size, and it is set on the component root, not high in the tree. The principle doesn't state this mechanism, and a reader could take rule 9 as forbidding it.

7. **Field width vs Input width.** The brief gives Field a width of 240 and Input a width of 180, and says Field contains "an `Input`". It doesn't say whether the Input stretches to the Field's width. Rule 1 ("There are no size variants") suggests the Input keeps its own size, so I left it at 180px. A stretched Input would look more usual, and making it fill would need only `width: auto` on `.Field > .Input`, which uses no scaled size.

8. **Padding vs border.** Terms: "Sizes are outer sizes: a 32px box with a 1px border is 32px tall in total." Rule 2: a border "does not change where its centered content lands". Neither says whether horizontal padding is measured from the outer edge or from inside the border. I followed normal CSS, so the Input's Icon starts 9px from the outer edge (1px border + 8px padding). On the centered axis this makes no difference, as rule 2 says. On the start edge it does.

9. **Base sizes of parts are not given.** Terms defines base size for a component, and the brief gives only "visibly smaller" for the checkmark, the radio dot and the callout icon, and "inset by the same gap" for the thumb. Rule 10 is what pins them down (8px dot, 16px thumb, factor 0.5 and 0.75). The answers were unique once rule 10 was applied, but it took that derivation to get there.

10. **Gap in a two-row layout.** The brief says Callout has "gap 12". The grid I needed for first-line centering has rows and columns, so I applied 12 as the column gap only and set the row gap to 0. The brief didn't say which axis the gap is on.

11. **Fully rounded radius.** The brief says the Switch track is "fully rounded". Rule 2 says border radius scales. I used `12px × scale` (half the height) rather than a large fixed value or `50%`, so it scales with the track. For the StatusDot, Radio and Avatar circles I used `50%`, which follows the box and needs no scaling.

12. **Very small text from a user factor.** The ButtonWithBadge fixture gives the Badge 6px text at scale 1. The principle allows any user factor and only warns about centering. It says nothing about a minimum readable text size, so the stylesheet doesn't enforce one.

13. **`--scale` steps vs non-step values.** Rule 5's example (0.8 × 1.2 = 0.96) uses values outside the 0.25 steps that rule 10 recommends. That is consistent ("Other factors work, but a centered child can then be 1px off"), but the example and the advice sit in different rules with no cross-reference.
