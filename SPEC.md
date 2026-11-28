# Component spec

Version 3

This document describes the jun-scale-ui components: their groups, base sizes, parts and default factors. `PRINCIPLE.md` states the scaling rules they follow. All sizes are base sizes, at scale 1.

## Naming

- Every component has a PascalCase name, such as `Button`. Every part has the component name, a hyphen and the part name, such as `Select-trigger`.
- The markup carries these names, so that styles, tests and people can find each element. How it carries them depends on the implementation: `src/` uses the name as the class (`class="Button"`), and the framework evals use `data-slot="Button"`.
- `Popup`, `Popup-item`, `Popup-shortcut` and `Popup-separator` are parts shared by `Select`, `Combobox` and `DropdownMenu`. They take the scale of the component that holds them.

## Type and spacing

- Every box size, gap and offset is a multiple of 4px.
- Font sizes: 12px on a 16px line, 14px on a 20px line, and 16px on a 24px line.
- Border radius: 3px, 4px, 6px, 8px, or fully rounded. Fully rounded needs no scaling: any radius of half the box or more looks the same.
- Borders and outlines are 1px and do not scale. Lines drawn like a border, such as a separator, are 1px and do not scale either.
- Padding is measured inside the border. Content in a box with a 1px border and a padding of 8 starts 9px from the outer edge.
- Any padding or margin this spec doesn't list is 0. That includes the defaults browsers give to controls such as `<button>` and `<input>`, which differ between browsers.

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
| 7 | Container | fits its content | Card, Dialog, Popover |

## Components

Every component passes its own group factor down to all smaller groups, as `PRINCIPLE.md` rule 7 says. The "Default factors" column lists only the defaults that are not 1.

| Component | Group | Base sizes | Parts | Contains | Default factors |
| --- | --- | --- | --- | --- | --- |
| StatusDot | 1 | 8×8, fully rounded | – | – | – |
| Icon | 2 | 16×16 SVG drawn with `currentColor` | – | – | – |
| Spinner | 2 | 16×16, fully rounded, with a 2px ring drawn as a border, which does not scale. The whole Spinner rotates | – | – | – |
| Badge | 3 | height 20, padding 8 left and right, gap 4, radius 3, font 12 on a 16 line | – | text, an Icon | Icon 0.75, so it is 12px |
| Kbd | 3 | height 20, minimum width 20, padding 4 left and right, 1px border, radius 3, font 12 on a 16 line | – | text | – |
| Checkbox | 3 | 16×16 box | `Checkbox-input`, the native checkbox, fills the box and draws it, with a 1px border and radius 3 | an Icon checkmark, centered, shown only when checked | Icon 0.5, so the checkmark is 8px |
| Radio | 3 | 16×16 circle, 1px border | a dot, 8×8, centered, shown when checked | – | – |
| Switch | 3 | track 40×24, fully rounded. The track is the Switch's root | `Switch-input`, the native checkbox with `role="switch"`, which can be the root itself; `Switch-thumb`, 16×16, inset 4 on the top, bottom and left, moving 16 to the right when checked. The thumb can be an element or a pseudo-element | – | – |
| Avatar | 4 | 32×32 circle, initials in font 14 on a 20 line | – | text | – |
| Button | 5 | height 32, padding 12 left and right, gap 8, no border, radius 4, font 14 on a 20 line. An Icon that comes first has a margin of -4 on its left, so it sits 8 from the edge | – | an Icon at full size, text, a Badge or Kbd | – |
| IconButton | 5 | 32×32, radius 4 | – | an Icon at full size, centered | – |
| Input | 5 | width 180, height 32, padding 8 left and right, gap 8, 1px border, radius 4, font 14 on a 20 line | `Input-field`, the native text field, which fills the width left over and uses the Input's font; `Input-action`, a 24×24 button with radius 3, whose right edge sits 4 inside the Input's right border, overlapping half of the right padding | an Icon, a Kbd, a Spinner | – |
| Select | 5 | – | `Select-trigger`: height 32, padding 12 left and right, gap 8, 1px border, radius 4, font 14 on a 20 line, as wide as its content; a `Popup` 4 below it | in the trigger: an Avatar, a StatusDot, text, an Icon chevron pushed to the right end | Avatar 0.75, set on `Select-trigger`, so an Avatar in the trigger is 24px. Avatars in the `Popup` keep the factor 1 |
| Combobox | 5 | – | `Combobox-field`: width 180, height 32, padding 8 left and right, gap 8, 1px border, radius 4; a `Popup` 180 wide, 4 below it | an Icon chevron | – |
| TextArea | 5 | width 180, minimum height 64, padding 8, 1px border, radius 4, font 14 on a 20 line | – | text | – |
| Slider | 5 | width 160, height 20 | track 8 tall, fully rounded; thumb 16×16, centered on the track | – | – |
| Progress | 5 | width 160, height 8, fully rounded | – | – | – |
| Field | 5 | width 240, a gap of 8 between label, control and help text, font 14 on a 20 line | see the Field section | an Input, Button, Select, TextArea, Checkbox, Switch, Radio, Badge, Kbd | Inline 0.8 in `Field-label`, `Field-help` and `Field-error` |
| Callout | 6 | padding 16, a gap of 12 between the Icon and the text, radius 6, maximum width 180, font 14 on a 20 line | `Callout-text`; the Icon sits in a first row exactly one text line tall, and if that row is an element, it is the part `Callout-icon` | an Icon centered on the first text line | Icon 0.75, so it is 12px |
| DropdownMenu | 6 | the menu is a `Popup` 4 below the trigger | a `Popup` | a Button as the trigger | – |
| Card | 7 | padding 16, a gap of 12 between its children, 1px border, radius 8, font 14 on a 20 line | – | any smaller component | – |
| Dialog | 7 | width 400, padding 24, a gap of 16 between its parts, 1px border, radius 8, font 14 on a 20 line | `Dialog-title`: font 16 on a 24 line; `Dialog-description`: font 14 on a 20 line; `Dialog-actions`: a row at the end of the Dialog, its children pushed to the right end, a gap of 8 | any smaller component, usually a Field and Buttons | – |
| Popover | 7 | width 240, padding 12, a gap of 8 between its children, 1px border, radius 6, font 14 on a 20 line, 4 below its trigger | `Popover-content`, the floating box with those sizes | a Button as the trigger; any smaller component inside | – |

### Popups

`Popup`, `DropdownMenu`'s menu and `Popover-content` float over the content below them. They take no space in the layout, so opening one doesn't move anything.

`Popup`: minimum width 128, padding 4, 1px border, radius 6, font 14 on a 20 line. `Popup-item`: height 32, padding 12 left and right, gap 8, radius 4, an optional Icon at the end. `Popup-shortcut`: 16 of space before it, pushed to the end. `Popup-separator`: a 1px line drawn like a border, which does not scale, with 4 above and below and 12 in from each side.

### Field

- `Field-label`: a `<label>` element tied to the control, font 14 on a 20 line, a gap of 4 between its text and anything inside it.
- `Field-help` and `Field-error`: font 12 on a 16 line. `data-invalid` on the `Field` shows the error state.
- `Field-group` joins controls on a shared edge, such as an Input and a Button, or a Select and an Input. The controls overlap by their 1px border, and the corners where they meet are square. A Button in a `Field-group` gets a 1px border so that it can share the edge.
- `Field-addon`: prefix or suffix text inside a `Field-group`, height 32, padding 12 left and right, 1px border, radius 4.
- `Field-option`: one row in a list of Radio or Checkbox options, gap 8.
- An Input, TextArea or Select directly inside a `Field` stretches to the `Field`'s width. A stretched Select's trigger fills it, with the chevron at the right end.
- `data-layout="horizontal"`: the label sits in a column 80 wide, 12 before the control, with 8 between rows.
- `data-layout="inline"`: a Checkbox or Switch sits before the label, 8 apart. The label is font 14 on a 24 line, and the Checkbox or Switch is centered on that line. Help text sits under the label.

## Accepted deviations from rule 10

`PRINCIPLE.md` rule 10 asks every box size to stay on multiples of 4px and every centered box to differ from its container by a multiple of 8px. This spec cannot meet that in four cases. All of them scale correctly, but a size can land on part of a pixel, and a centered child can sit 1px off center at scales such as 0.75 or 1.25:

- Group 3 holds the 16px Checkbox and Radio, the 20px Badge and Kbd, and the 24px Switch. A bigger component passes one factor to the whole group, so a 20px Badge or Kbd centered in a 32px box differs by 12px.
- Text lines are 20px tall, which is not a multiple of 8px away from 16px or 32px boxes. A box centered on a 20px line, such as a Badge in a `Field-label` at 0.8, which gives 16px, differs from the line by 4px.
- The Inline factor 0.8 in `Field-label`, `Field-help` and `Field-error` keeps a Badge or Kbd at 16px tall, but puts their padding at 6.4px and their gap at 3.2px.
- The Slider is 20 tall. Its 16px thumb differs from it by 4px, and its 8px track by 12px.
