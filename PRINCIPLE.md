# Scaling principle

Version 8

This document states how jun-scale-ui scales components. It says what must be true, not how to write it. An implementation is correct when every rule here holds.

## Terms

- **Component**: a reusable piece of UI with a PascalCase name, such as `Button` or `Icon`.
- **Part**: a box that belongs to one component and is never used on its own, such as the thumb of a `Switch`. A part is a child element or a pseudo-element. It is never only painted, for example with a background gradient, because painted shapes don't snap to whole pixels the way boxes do.
- **Base size**: a size of a component when every scale is 1. Sizes are outer sizes: a 32px box with a 1px border is 32px tall in total.
- **Global scale**: the number in `--scale`.
- **Group**: a numbered size class. Every component belongs to exactly one group.
- **Group factor**: the number in `--scale-group<N>` for group N.
- **Effective scale**: the scale a component renders at.

## Rules

### 1. One size per component

Each component has one default size, made of its base sizes. There are no size variants. To make a component bigger or smaller, change a scale.

### 2. What scales

These properties equal base size × effective scale: width, height, minimum and maximum width and height, margin, padding, gap, position offsets (top, right, bottom, left and translations), font size, line height and border radius.

Border widths and outline widths do not scale. They are not part of the base size arithmetic: a 1px border on both sides of a box does not change where its centered content lands.

Shadows and outline offsets are decoration. They may scale or not. An SVG drawing scales with the box it is drawn in, including its strokes.

### 3. The global scale

`--scale` is a number. It is 1 unless set. It can be set on the root or on any element, and it applies to every component inside that element. When an element inside sets `--scale` again, that nearer value replaces the outer one for everything inside it.

### 4. Groups

Groups are numbered from 1, the smallest, upward. A component may contain components of a smaller group or of its own group. It never contains a component of a bigger group.

The base size column gives the height of the component's main box. Widths, and the heights of components that stack several rows, can be larger.

| N | Group | Base size | Components |
| --- | --- | --- | --- |
| 1 | Dot | 8px | StatusDot |
| 2 | Icon | 16px | Icon, Spinner |
| 3 | Inline | 16–24px | Badge, Kbd, Checkbox, Radio, Switch |
| 4 | BigInline | 24–32px | Avatar |
| 5 | Control | 32–64px | Button, IconButton, Input, Select, Combobox, TextArea, Slider, Progress, Field |
| 6 | Panel | fits its content | Callout, DropdownMenu |
| 7 | Container | layout | Card, Dialog, Popover |

### 5. Effective scale

A component in group N renders at `--scale × --scale-group<N>`, using the values in force at the component. A group factor that no element sets is 1. The global scale always applies, so a group factor of 0.5 under a global scale of 1.5 gives 0.75.

### 6. The nearest value wins

Every factor, and `--scale`, takes the value set by the nearest element that sets it. A value set on an element applies inside that element, at any depth, until an element nearer sets the same variable.

### 7. Components pass their scale down

Any element may set `--scale-group<N>`: a page container, a component or a part.

- A component of group N sets the factor of every smaller group, so that the components inside it scale with it. Each of those factors is the component's own group factor times a default for that group. The default is 1, unless a child must be smaller to fit. A `Button` sets `--scale-group1` to `--scale-group4` to its own `--scale-group5`. A `Checkbox` sets `--scale-group2` to 0.5 × its own `--scale-group3`, so its checkmark `Icon` is half the size it would otherwise be.
- A component sets these factors on its own root element. When only the children inside one part need a different default, that part sets it, still multiplied by the component's own group factor. A `Field` label sets the Inline factor to 0.8 × the `Field`'s factor, so a `Badge` in the label fits the text line, while a `Checkbox` next to the label keeps the `Field`'s factor.
- A component never sets the factor of its own group, because that would also change the component itself. Components of the same group inside one another share one factor: an `Input` inside a `Field` renders at the same scale as the `Field`.
- A factor a user sets on the component element itself replaces the factor the component sets, and is used as it is. To keep the child following the component, the user multiplies by the component's factor as well, for example `--scale-group2` set to 0.8 × `--scale-group5` on a `Button`.

Some examples, with a `Button` that sets the factor of its `Icon` to 0.75 × its own factor:

- Nothing set: the `Button` renders at 1 and its `Icon` at 0.75.
- `--scale-group5: 1.5` on the `Button` or on a container around it: the `Button` renders at 1.5 and its `Icon` at 0.75 × 1.5 = 1.125. The `Icon` keeps its proportion to the `Button`.
- `--scale: 1.25` on a container: the `Button` renders at 1.25 and its `Icon` at 1.25 × 0.75 = 0.9375.
- `--scale-group2: 1.5` on a page container: a standalone `Icon` renders at 1.5. The `Icon` inside the `Button` still renders at 0.75, because the `Button` sets that factor nearer to it.

This has one limitation. A factor for a smaller group set further out, such as `--scale-group3` on a page container, reaches the components of that group that are not inside a bigger component. It does not reach those inside one, because every bigger component sets that factor itself. To change the `Badge` components inside `Button` components, set the factor on the `Button` components. CSS cannot read the outer value of a variable while setting the same variable, so a component cannot multiply its own factor into a value set further out.

### 8. Parts, glyphs and text

- A part uses the effective scale of its component. Setting `--scale` or a group factor on a part does not change the part itself. A component inside the part reads `--scale` and its own group factor at the nearest element that sets them, as everywhere else.
- A size that a component applies to a child component, such as a margin that places the child, uses the effective scale of the component that applies it, not the child's. The child's own sizes still use the child's effective scale.
- When a child component must be centered inside a box of its parent, center it with layout alignment rather than a fixed offset. The child's size depends on its own group factor, which a user can change, so a fixed offset worked out for one size would be wrong for another.
- A glyph inside a component, such as a chevron or a checkmark, is the `Icon` component, not a part. It follows group 2.
- Text has no group. It follows the component or part that renders it.
- When a child of the same group would not fit inside a component, build it as a part instead. For example, a small button inside `Input` is a part of `Input`, not an `IconButton`.

### 9. Scale where the size is used

Base sizes are constants. Multiply a base size by the effective scale in the property that uses it. Never store an already scaled size in a shared value that is set high in the tree, such as on the root. A value is resolved where it is declared, so a scale set lower in the tree would not reach it.

Working out a component's effective scale once, on the component's own root, and reusing that number for the component and its parts is fine. It is a scale, not a size, and it is declared on the component it belongs to.

### 10. Whole pixels

Browsers snap box edges to whole CSS pixels. A size or gap that lands on half a pixel rounds up on one side and down on the other, so a centered part ends up 1px off. These constraints keep box edges on whole pixels:

- Every base size and offset of a box is a multiple of 4px. Base line heights are multiples of 4px too, so stacked lines stay on whole pixels. Font sizes and border radius are exempt, because they never shift an edge.
- A box centered inside another box, whether a part or a child component, differs from it by a multiple of 8px, so the gap on each side is a multiple of 4px.
- Every default factor that a component sets is chosen for the child it is designed around: it keeps that child's box sizes on multiples of 4px, and keeps the child a multiple of 8px smaller than the box or text line it is centered in. Which factor works depends on that box. A 16px `Icon` centered in a 16px box needs 0.5, which gives 8px. A 16px `Icon` centered on a 20px text line needs 0.75, which gives 12px. A 32px `Avatar` centered in a 32px box can take 0.75, which gives 24px.

Text is exempt. A line of text centered in a box, or a line height that a factor shrinks off the 4px grid, may land on half a pixel. Text does not shift by a whole pixel the way a box edge does.

These constraints cannot hold for every child in every box, and the remaining cases are accepted:

- Components of one group can have different heights. Group 3 holds the 16px `Checkbox`, the 20px `Badge` and `Kbd`, and the 24px `Switch`, but a bigger component passes one factor to the whole group. Centered in a 32px box, the 16px and 24px members differ by a multiple of 8px, but a 20px `Badge` or `Kbd` differs by 12px. At a scale such as 0.75 or 1.25 its gap lands on half a pixel, so it can sit 1px off center.
- Text lines are 20px tall, which is not a multiple of 8px away from 16px or 32px boxes. A box centered on a 20px line, such as a `Badge` in a `Field` label at 0.8, which gives 16px, differs from the line by 4px. It can also sit 1px off center at those scales.

In both cases every size still scales correctly. Only the centering of that one child can be off by 1px.

The rules for users follow:

- Set `--scale` in steps of 0.25, such as 0.75, 1, 1.25 or 1.5. Every size the components define then lands on a whole pixel, including sizes changed by the factors components set themselves. Centered children land on whole pixels too, apart from the accepted cases above.
- The values you set multiply with each other and with the factors components pass down, so keep the product of the values you set in steps of 0.25. `--scale: 1.25` with `--scale-group5: 1.2` around a `Button` gives 1.5 for the `Button` and everything in it, which is fine. `--scale: 1.25` with `--scale-group5: 1.25` gives 1.5625, which can leave a centered child 1px off.
- When you set a factor for a small group directly, such as the factor for a 20px `Badge`, pick one that keeps that group's base sizes on multiples of 4px: 0.8 gives 16px, but 0.5 gives 10px.

## What users write

- `--scale` and `--scale-group1` to `--scale-group7`, on any element.
- The class of a component is its name: `class="Button"`.
- The class of a part is the component name, a hyphen and the part name: `class="Select-trigger"`.
