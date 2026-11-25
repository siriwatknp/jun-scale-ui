# Scaling principle

Version 5

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

A component renders at its effective scale: the global scale, times the factor of its own group, times the factor of the group of each bigger component it sits inside.

Each group counts once. For each group, the factor used is the one in force at the nearest component of that group that encloses this component, or at the component itself for its own group. A group with no such component counts as 1.

Some examples, with a `Button` (group 5) that sets the factor of its `Icon` to 0.75:

- Nothing set: the `Button` renders at 1 and its `Icon` at 0.75.
- `--scale-group5: 1.5` on the `Button` or on a container around it: the `Button` renders at 1.5 and its `Icon` at 1.5 × 0.75 = 1.125. The `Icon` keeps its proportion to the `Button`.
- `--scale: 1.25` on a container: the `Button` renders at 1.25 and its `Icon` at 1.25 × 0.75 = 0.9375.
- An `Input` (group 5) inside a `Field` (group 5) with `--scale-group5: 1.5` renders at 1.5, not 1.5 × 1.5, because group 5 counts once.
- A standalone `Icon` next to the `Button` is not inside a group 5 component, so `--scale-group5` does not change it.

A value that is not a valid number is ignored. The valid value set further out applies instead, or 1 when no element further out sets one. The same holds for `--scale`.

### 6. The nearest value wins

Every factor, and `--scale`, takes the value set by the nearest element that sets it. A value set on an element applies inside that element, at any depth, until an element nearer sets the same variable.

A factor reaches the components of its own group directly. It reaches smaller components only through a component of that group around them: setting `--scale-group5` on a container scales every `Button` inside it, and each `Button` takes its `Icon` along. A factor for a smaller group that a component sets for its children is nearer to them than any value set further out, so `--scale-group2: 1.5` on a page container does not change the `Icon` inside a `Button` that sets its own `Icon` factor.

### 7. Who sets group factors

Any element may set `--scale-group<N>`: a page container, a component or a part.

- A component may set the factor for a smaller group it contains, so that the child fits. For example, `Checkbox` sets the `Icon` factor so its checkmark is smaller than the box. It sets the factor on its own root element, not on a part.
- A factor a user sets on the component element itself wins over the default the component sets. A factor a user sets on a container further out does not, because the component's default is nearer.
- A component never sets the factor of its own group, because that would also change the component itself. Components of the same group inside one another use that group's factor once, so they scale together.

### 8. Parts, glyphs and text

- A part uses the effective scale of its component. Setting `--scale` or a group factor on a part does not change the part itself. It changes a component inside the part only where rule 5 reads that value there: `--scale`, and the factor of that component's own group. The factor of a bigger group is read at the component of that group, so setting `--scale-group5` on a part of a `Select` does not change the `Avatar` inside it.
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
- The values you set multiply along the nesting, so keep their product in steps of 0.25. `--scale: 1.25` with `--scale-group5: 1.2` around a `Button` gives 1.5, which is fine. `--scale: 1.25` with `--scale-group5: 1.25` gives 1.5625, which can leave a centered child 1px off.
- When you set a factor for a small group directly, such as the factor for a 20px `Badge`, pick one that keeps that group's base sizes on multiples of 4px: 0.8 gives 16px, but 0.5 gives 10px.

## What users write

- `--scale` and `--scale-group1` to `--scale-group7`, on any element.
- The class of a component is its name: `class="Button"`.
- The class of a part is the component name, a hyphen and the part name: `class="Select-trigger"`.
