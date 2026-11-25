# Scaling principle

Version 1

This document states how jun-scale-ui scales components. It says what must be true, not how to write it. An implementation is correct when every rule here holds.

## Terms

- **Component**: a reusable piece of UI with a PascalCase name, such as `Button` or `Icon`.
- **Part**: an element that belongs to one component and is never used on its own, such as the thumb of a `Switch`.
- **Base size**: a size of a component when every scale is 1.
- **Global scale**: the number in `--scale`.
- **Group**: a numbered size class. Every component belongs to exactly one group.
- **Group factor**: the number in `--scale-group<N>` for group N.
- **Effective scale**: the scale a component renders at.

## Rules

### 1. One size per component

Each component has one default size, made of its base sizes. There are no size variants. To make a component bigger or smaller, change a scale.

### 2. What scales

These properties equal base size × effective scale: width, height, minimum and maximum width and height, margin, padding, gap, position offsets (top, right, bottom, left and translations), font size, line height and border radius.

Border widths and outline widths do not scale.

### 3. The global scale

`--scale` is a number. It is 1 unless set. It can be set on the root or on any element, and it applies to everything inside that element. When an element inside sets `--scale` again, that nearer value replaces the outer one for everything inside it.

### 4. Groups

Groups are numbered from 1, the smallest, upward. A component may contain components of a smaller group or of its own group. It never contains a component of a bigger group.

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

A component in group N renders at `--scale × --scale-group<N>`. A group factor that is not set, or is not a valid number, counts as 1. The same holds for `--scale`. The global scale always applies, so a group factor of 0.8 under a global scale of 1.2 gives 0.96.

### 6. The nearest value wins

A group factor applies to every component of that group inside the element that sets it, at any depth. When an element nearer to a component sets the same factor, the nearer value wins.

Factors do not multiply along the nesting. A factor for group 5 changes components of group 5 only. An `Icon` inside a `Button` keeps its own group factor when the `Button` shrinks.

### 7. Who sets group factors

Any element may set `--scale-group<N>`: a page container, a component or a part.

- A component may set the factor for a smaller group it contains, so that the child fits. For example, `Checkbox` sets the `Icon` factor so its checkmark is smaller than the box.
- A component never sets the factor of its own group, because that would also change the component itself. Components of the same group inside one another share one factor.
- A user who wants to change a factor that a component sets must set it on that component or nearer, because the component's own value is nearer to its children than any outer container.

### 8. Parts, glyphs and text

- A part uses the effective scale of its component.
- A size that a component applies to a child component, such as a margin that places the child, uses the effective scale of the component that applies it, not the child's. The child's own sizes still use the child's effective scale.
- A glyph inside a component, such as a chevron or a checkmark, is the `Icon` component, not a part. It follows group 2.
- Text has no group. It follows the component or part that renders it.
- When a child of the same group would not fit inside a component, build it as a part instead. For example, a small button inside `Input` is a part of `Input`, not an `IconButton`.

### 9. Scale where the size is used

Base sizes are constants. Multiply a base size by the effective scale in the property that uses it. Never store an already scaled size in a shared value that is set high in the tree, such as on the root. A value is resolved where it is declared, so a scale set lower in the tree would not reach it.

### 10. Whole pixels

Browsers snap box edges to whole CSS pixels. A size or gap that lands on half a pixel rounds up on one side and down on the other, so a centered part ends up 1px off. Three constraints keep every edge on a whole pixel:

- Every base size and offset of a box is a multiple of 4px. This includes line heights. Font sizes and border radius are exempt, because they never shift an edge.
- A part or child centered inside another box differs from it by a multiple of 8px, so the gap on each side is a multiple of 4px.
- Every group factor that a component sets is a multiple of 0.25, and it keeps the child's sizes on multiples of 4px.

The rule for users follows: keep the effective scale of every component, `--scale × --scale-group<N>`, in steps of 0.25, such as 0.75, 1, 1.25 or 1.5. Every size and every centered gap then lands on a whole pixel. Setting each value in steps of 0.25 is not enough on its own: 0.75 × 0.5 gives 0.375. Other values work, but a centered part can be 1px off.

## What users write

- `--scale` and `--scale-group1` to `--scale-group7`, on any element.
- The class of a component is its name: `class="Button"`.
- The class of a part is the component name, a hyphen and the part name: `class="Select-trigger"`.
