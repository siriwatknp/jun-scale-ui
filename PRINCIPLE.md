# Scaling principle

Version 3

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

A component in group N renders at `--scale × --scale-group<N>`. The global scale always applies, so a group factor of 0.5 under a global scale of 1.5 gives 0.75.

A value that is not a valid number is ignored. The valid value set further out applies instead, or 1 when no element further out sets one. The same holds for `--scale`.

### 6. The nearest value wins

A group factor applies to every component of that group inside the element that sets it, at any depth. When an element nearer to a component sets the same factor, the nearer value wins.

Factors do not multiply along the nesting. A factor for group 5 changes components of group 5 only. An `Icon` inside a `Button` keeps its own group factor when the `Button` shrinks.

### 7. Who sets group factors

Any element may set `--scale-group<N>`: a page container, a component or a part.

- A component may set the factor for a smaller group it contains, so that the child fits. For example, `Checkbox` sets the `Icon` factor so its checkmark is smaller than the box. It sets the factor on its own root element, not on a part.
- A factor a user sets on the component element itself wins over the default the component sets. A factor a user sets on a container further out does not, because the component's default is nearer.
- A component never sets the factor of its own group, because that would also change the component itself. Components of the same group inside one another share one factor.

### 8. Parts, glyphs and text

- A part uses the effective scale of its component. Setting `--scale` or a group factor on a part does not change the part itself. It only changes components inside the part.
- A size that a component applies to a child component, such as a margin that places the child, uses the effective scale of the component that applies it, not the child's. The child's own sizes still use the child's effective scale.
- When a child component must be centered inside a box of its parent, center it with layout alignment rather than a fixed offset. The child's size depends on its own group factor, which a user can change, so a fixed offset worked out for one size would be wrong for another.
- A glyph inside a component, such as a chevron or a checkmark, is the `Icon` component, not a part. It follows group 2.
- Text has no group. It follows the component or part that renders it.
- When a child of the same group would not fit inside a component, build it as a part instead. For example, a small button inside `Input` is a part of `Input`, not an `IconButton`.

### 9. Scale where the size is used

Base sizes are constants. Multiply a base size by the effective scale in the property that uses it. Never store an already scaled size in a shared value that is set high in the tree, such as on the root. A value is resolved where it is declared, so a scale set lower in the tree would not reach it.

Working out a component's effective scale once, on the component's own root, and reusing that number for the component and its parts is fine. It is a scale, not a size, and it is declared on the component it belongs to.

### 10. Whole pixels

Browsers snap box edges to whole CSS pixels. A size or gap that lands on half a pixel rounds up on one side and down on the other, so a centered part ends up 1px off. Three constraints keep every edge on a whole pixel:

- Every base size and offset of a box is a multiple of 4px. Base line heights are multiples of 4px too, so stacked lines stay on whole pixels. Font sizes and border radius are exempt, because they never shift an edge.
- A box centered inside another box, whether a part or a child component, differs from it by a multiple of 8px, so the gap on each side is a multiple of 4px.
- Every group factor that a component sets keeps the child's box sizes on multiples of 4px, and keeps the child a multiple of 8px smaller than the box or text line it is centered in. Which factor works depends on that box. A 16px `Icon` centered in a 16px box needs 0.5, which gives 8px. A 16px `Icon` centered on a 20px text line needs 0.75, which gives 12px. A 32px `Avatar` centered in a 32px box can take 0.75, which gives 24px.
- Text is exempt from all three. A line of text centered in a box, or a line height that a factor shrinks off the 4px grid, may land on half a pixel. Text does not shift by a whole pixel the way a box edge does.

The rules for users follow:

- Set `--scale` in steps of 0.25, such as 0.75, 1, 1.25 or 1.5. Every size the components define then lands on a whole pixel, including sizes changed by the factors components set themselves.
- When you set a group factor yourself, pick one that maps that group's base sizes to multiples of 4px: for example 0.5 or 0.75 for a 16px or 32px component, but not 0.5 for a 20px `Badge`, which gives 10px. Other factors work, but a centered child can then be 1px off.

## What users write

- `--scale` and `--scale-group1` to `--scale-group7`, on any element.
- The class of a component is its name: `class="Button"`.
- The class of a part is the component name, a hyphen and the part name: `class="Select-trigger"`.
