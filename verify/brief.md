# Component brief

This brief lists the components to build and how each looks at scale 1. Scale them by following `PRINCIPLE.md`. Style the markup in `fixtures.html` exactly as written. Don't change it.

Colors and fonts are up to you. Keep the look minimal. Use `system-ui` for text.

| Component | Group | Base sizes at scale 1 | Contains |
| --- | --- | --- | --- |
| StatusDot | 1 | 8×8 circle | nothing |
| Icon | 2 | 16×16 SVG, drawn with `currentColor` | nothing |
| Badge | 3 | height 20, padding left and right 8, font 12 on a 16 line, radius 3 | text |
| Checkbox | 3 | 16×16 box, radius 3 | an `Icon` checkmark, visibly smaller than the box and centered in it |
| Radio | 3 | 16×16 circle | when checked, a dot part, visibly smaller than the circle and centered in it |
| Switch | 3 | track 40×24, fully rounded | a round thumb part, inset by the same gap on the top, bottom and left |
| Avatar | 4 | 32×32 circle, initials in font 14 on a 20 line | text |
| Button | 5 | height 32, padding left and right 12, gap 8, font 14 on a 20 line, radius 4 | an `Icon` at full size, then text |
| Input | 5 | width 180, height 32, padding left and right 8, gap 8, 1px border, font 14 on a 20 line, radius 4 | an `Icon` at full size, then a text field |
| Select | 5 | trigger part: height 32, padding left and right 12, gap 8, 1px border, font 14 on a 20 line, radius 4 | in the trigger: an `Avatar` that fits inside the trigger with room above and below and is centered vertically, a name, and an `Icon` chevron at the end |
| Field | 5 | width 240, a gap of 8 between label, control and help text; label font 14 on a 20 line; help font 12 on a 16 line | a label part, an `Input` that stretches to the Field's width, a help part |
| Callout | 6 | padding 16, a gap of 12 between the icon and the text, font 14 on a 20 line, radius 6, maximum width 180 | an `Icon`, visibly smaller than full size and centered vertically on the first 20px text line, then text |

A `Button` may also hold a `Badge`, as in the `ButtonWithBadge` fixture. The inline styles in the `ButtonWithBadge`, `ButtonScaled` and `CheckboxOverride` fixtures are user settings. Leave them in place.

## Deliverable

- `scale.css`: one stylesheet that styles every fixture and follows every rule in `PRINCIPLE.md`.
- `notes.md`: the decisions you made, and any place where `PRINCIPLE.md` was unclear or seemed to contradict itself or this brief.
