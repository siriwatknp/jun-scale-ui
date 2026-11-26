# Component spec

Version 1

This document describes the jun-scale-ui components: their groups, base sizes, parts and default factors. `PRINCIPLE.md` states the scaling rules they follow. All sizes are base sizes, at scale 1.

## Naming

- The class of a component is its PascalCase name: `class="Button"`.
- The class of a part is the component name, a hyphen and the part name: `class="Select-trigger"`.
- `Popup`, `Popup-item`, `Popup-shortcut` and `Popup-separator` are parts shared by `Select`, `Combobox` and `DropdownMenu`. They take the scale of the component that holds them.

## Type and spacing

- Spacing and box sizes come from multiples of 4px: 4, 8, 12, 16, 24, 32, 40, 48, 64.
- Font sizes: 12px on a 16px line, 14px on a 20px line, and 16px on a 24px line.
- Border radius: 3px, 4px, 6px, 8px, or fully rounded.
- Borders and outlines are 1px and do not scale.

## Groups

The group number is what users write in `--scale-group<N>`. The base size column gives the height of each component's main box. Widths, and the heights of components that stack several rows, can be larger.

| N | Group | Base size | Components |
| --- | --- | --- | --- |
| 1 | Dot | 8px | StatusDot |
| 2 | Icon | 16px | Icon, Spinner |
| 3 | Inline | 16–24px | Badge, Kbd, Checkbox, Radio, Switch |
| 4 | BigInline | 24–32px | Avatar |
| 5 | Control | 32–64px | Button, IconButton, Input, Select, Combobox, TextArea, Slider, Progress, Field |
| 6 | Panel | fits its content | Callout, DropdownMenu |
| 7 | Container | layout | Card, Dialog, Popover (not built yet) |

## Components

Every component passes its own group factor down to all smaller groups, as `PRINCIPLE.md` rule 7 says. The "Default factors" column lists only the defaults that are not 1.

| Component | Group | Base sizes | Parts | Contains | Default factors |
| --- | --- | --- | --- | --- | --- |
| StatusDot | 1 | 8×8, fully rounded | – | – | – |
| Icon | 2 | 16×16 SVG drawn with `currentColor` | – | – | – |
| Spinner | 2 | 16×16, fully rounded, 2px ring | – | – | – |
| Badge | 3 | height 20, padding 8 left and right, gap 4, radius 3, font 12 on a 16 line | – | text, an Icon | – |
| Kbd | 3 | height 20, minimum width 20, padding 4 left and right, 1px border, radius 3, font 12 on a 16 line | – | text | – |
| Checkbox | 3 | 16×16 box, 1px border, radius 3 | `Checkbox-input` fills the box | an Icon checkmark, centered | Icon 0.5, so the checkmark is 8px |
| Radio | 3 | 16×16 circle, 1px border | a dot, 8×8, centered, shown when checked | – | – |
| Switch | 3 | track 40×24, fully rounded | a thumb, 16×16, inset 4 on the top, bottom and left; moves 16 to the right when checked | – | – |
| Avatar | 4 | 32×32 circle, initials in font 14 on a 20 line | – | text | – |
| Button | 5 | height 32, padding 12 left and right, gap 8, radius 4, font 14 on a 20 line | – | an Icon at full size, text, a Badge or Kbd | – |
| IconButton | 5 | 32×32, radius 4 | – | an Icon at full size, centered | – |
| Input | 5 | width 180, height 32, padding 8 left and right, gap 8, 1px border, radius 4, font 14 on a 20 line | `Input-field` (the text field); `Input-action`, a 24×24 button with radius 3, 4 past the right padding | an Icon, a Kbd, a Spinner | – |
| Select | 5 | – | `Select-trigger`: height 32, padding 12 left and right, gap 8, 1px border, radius 4, font 14 on a 20 line; a `Popup` 4 below it | in the trigger: an Avatar, a StatusDot, text, an Icon chevron at the end | Avatar 0.75 in the trigger, so it is 24px |
| Combobox | 5 | – | `Combobox-field`: width 180, height 32, padding 8 left and right, gap 8, 1px border, radius 4; a `Popup` 180 wide, 4 below it | an Icon chevron | – |
| TextArea | 5 | width 180, minimum height 64, padding 8, 1px border, radius 4, font 14 on a 20 line | – | text | – |
| Slider | 5 | width 160, height 20 | track 8 tall, fully rounded; thumb 16×16, centered on the track | – | – |
| Progress | 5 | width 160, height 8, fully rounded | – | – | – |
| Field | 5 | width 240, a gap of 8 between label, control and help text, font 14 on a 20 line | see the Field section | an Input, Button, Select, TextArea, Checkbox, Switch, Radio, Badge, Kbd | Inline 0.8 in `Field-label`, `Field-help` and `Field-error` |
| Callout | 6 | padding 16, a gap of 12 between the Icon and the text, radius 6, maximum width 180, font 14 on a 20 line | `Callout-text` | an Icon centered on the first text line | Icon 0.75, so it is 12px |
| DropdownMenu | 6 | a gap of 4 between the trigger and the menu | a `Popup` | a Button as the trigger | – |

### Popup

`Popup`: minimum width 128, padding 4, 1px border, radius 6, font 14 on a 20 line. `Popup-item`: height 32, padding 12 left and right, gap 8, radius 4, an optional Icon at the end. `Popup-shortcut`: 16 of space before it, pushed to the end. `Popup-separator`: 1px tall, 4 above and below, 12 in from each side.

### Field

- `Field-label`: font 14 on a 20 line, a gap of 4 between its text and anything inside it.
- `Field-help` and `Field-error`: font 12 on a 16 line. `data-invalid` on the `Field` shows the error state.
- `Field-group` joins controls on a shared edge, such as an Input and a Button, or a Select and an Input. The controls overlap by their 1px border, and the corners where they meet are square.
- `Field-addon`: prefix or suffix text inside a `Field-group`, height 32, padding 12 left and right, 1px border, radius 4.
- `Field-option`: one row in a list of Radio or Checkbox options, gap 8.
- An Input, TextArea or Select trigger directly inside a `Field` stretches to the `Field`'s width.
- `data-layout="horizontal"`: the label sits in a column 80 wide, 12 before the control, with 8 between rows.
- `data-layout="inline"`: a Checkbox or Switch sits before the label, 8 apart. The label line is 24 tall. A Checkbox sits 4 below the top of that line.

## Accepted centering deviations

`PRINCIPLE.md` rule 10 asks every centered box to differ from its container by a multiple of 8px. This spec cannot meet that for two cases. Both scale correctly, but can sit 1px off center at scales such as 0.75 or 1.25:

- Group 3 holds the 16px Checkbox and Radio, the 20px Badge and Kbd, and the 24px Switch. A bigger component passes one factor to the whole group, so a 20px Badge or Kbd centered in a 32px box differs by 12px.
- Text lines are 20px tall, which is not a multiple of 8px away from 16px or 32px boxes. A box centered on a 20px line, such as a Badge in a `Field-label` at 0.8, which gives 16px, differs from the line by 4px.
