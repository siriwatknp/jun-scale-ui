# Scaling principle

Version 10

This document states the rules of the jun-scale-ui scaling system. It says what must be true, not how to write it. `SPEC.md` describes the components themselves: their groups, base sizes, parts and default factors. An implementation is correct when it follows both.

## Terms

- **Component**: a reusable piece of UI with a name, such as a button or an icon.
- **Part**: a box that belongs to one component and is never used on its own, such as the thumb of a switch. A part is a child element or a pseudo-element. It is never only painted, for example with a background gradient, because painted shapes don't snap to whole pixels the way boxes do.
- **Base size**: a size of a component when every scale is 1. Sizes are outer sizes: a 32px box with a 1px border is 32px tall in total.
- **Global scale**: the number in `--scale`.
- **Group**: a numbered size class. Every component belongs to exactly one group.
- **Group factor**: the number in `--scale-group<N>` for group N.
- **Effective scale**: the scale a component renders at.

## Rules

### 1. One size per component

Each component has one default size, made of its base sizes. There are no size variants. To make a component bigger or smaller, change a scale.

### 2. What scales

These properties equal base size × effective scale: width, height, minimum and maximum width and height, margin, padding, gap, position offsets (top, right, bottom, left and translations), font size, line height and border radius. Line heights are lengths, so they scale like any other size.

Border widths and outline widths do not scale. They are not part of the base size arithmetic: a 1px border on both sides of a box does not change where its centered content lands.

Shadows and outline offsets are decoration. They may scale or not. An SVG drawing scales with the box it is drawn in, including its strokes.

### 3. The global scale

`--scale` is a number. It is 1 unless set. It can be set on the root or on any element, and it applies to that element and every component inside it. When an element inside sets `--scale` again, that nearer value replaces the outer one for that element and everything inside it.

### 4. Groups

Groups are numbered from 1 upward. `SPEC.md` lists the groups and assigns each component to one.

A component may contain components of a smaller group or of its own group. It never contains a component of a bigger group. A group is defined by what its components can hold, not by their height alone: components of a bigger group are usually bigger, but a thin control such as a progress bar still belongs with the other controls.

### 5. Effective scale

A component in group N renders at `--scale × --scale-group<N>`, using the values in force at the component. A group factor that no element sets is 1. The global scale always applies, so a group factor of 0.5 under a global scale of 1.5 gives 0.75.

### 6. The nearest value wins

Every factor, and `--scale`, takes the value set by the nearest element that sets it, counting the element itself. A value set on an element applies to that element and everything inside it, at any depth, until an element nearer sets the same variable.

### 7. Components pass their scale down

Any element may set `--scale-group<N>`: a page container, a component or a part.

- A component of group N sets the factor of every smaller group, so that the components inside it scale with it. Each of those factors is the component's own group factor times a default for that group. The default is 1, unless a child must be smaller to fit. `SPEC.md` lists the defaults that are not 1. A component of group 5 with no such defaults sets `--scale-group1` to `--scale-group4` to its own `--scale-group5`. A checkbox whose checkmark should be half its usual size sets the icon group's factor to 0.5 × its own factor.
- A component sets these factors on its own root element. When only the children inside one part need a different default, that part sets it, still multiplied by the component's own group factor, which the part inherits from the component. For example, a label part can make the badges inside it smaller without changing a checkbox next to the label.
- A component never sets the factor of its own group, because that would also change the component itself. Components of the same group inside one another share one factor, so they render at the same scale.
- A factor a user sets on the component element itself replaces the factor the component sets, and is used as it is. To keep the child following the component, the user multiplies by the component's factor as well, for example `--scale-group2` set to 0.8 × `--scale-group5` on a group 5 component.

For example, take a button in group 5 that sets the factor of its icon, in group 2, to 0.75 × its own factor:

- Nothing set: the button renders at 1 and its icon at 0.75.
- `--scale-group5: 1.5` on the button or on a container around it: the button renders at 1.5 and its icon at 0.75 × 1.5 = 1.125. The icon keeps its proportion to the button.
- `--scale: 1.25` on a container: the button renders at 1.25 and its icon at 1.25 × 0.75 = 0.9375.
- `--scale-group2: 1.5` on a page container: a standalone icon renders at 1.5. The icon inside the button still renders at 0.75, because the button sets that factor nearer to it.

This has one limitation. A factor for a smaller group set further out, such as `--scale-group3` on a page container, reaches the components of that group that are not inside a bigger component. It does not reach those inside one, because every bigger component sets that factor itself. To change the group 3 components inside a group 5 component, set the factor on the group 5 component. CSS cannot read the outer value of a variable while setting the same variable, so a component cannot multiply its own factor into a value set further out.

### 8. Parts, glyphs and text

- A part uses the effective scale of its component. Setting `--scale` or a group factor on a part does not change the part itself. A component inside the part reads `--scale` and its own group factor at the nearest element that sets them, as everywhere else.
- A size that a component applies to a child component, such as a margin that places the child, uses the effective scale of the component that applies it, not the child's. The child's own sizes still use the child's effective scale.
- When a child component must be centered inside a box of its parent, or on a line of its text, center it with layout alignment rather than a fixed offset. The child's size depends on its own group factor, which a user can change, so a fixed offset worked out for one size would be wrong for another. To center a child on a line of text, give it a row exactly one line tall and center it in that row.
- A glyph inside a component, such as a chevron or a checkmark, is the icon component, not a part. It follows the icon's group.
- Text has no group. It follows the component or part that renders it.
- When a child of the same group would not fit inside a component, build it as a part instead. For example, a small button inside an input is a part of the input, not a separate button component.

### 9. Scale where the size is used

Base sizes are constants. Multiply a base size by the effective scale in the property that uses it. Never store an already scaled size in a shared value that is set high in the tree, such as on the root. A value is resolved where it is declared, so a scale set lower in the tree would not reach it.

Work out a component's effective scale once, on the component's own root, and reuse that number for the component and its parts. It is a scale, not a size, and it is declared on the component it belongs to. This is also what keeps a part from following a `--scale` or group factor set on the part itself, as rule 8 requires.

### 10. Whole pixels

Browsers snap box edges to whole CSS pixels. A size or gap that lands on half a pixel rounds up on one side and down on the other, so a centered part ends up 1px off. Users scale in steps of 0.25, and 4px × 0.25 = 1px, so sizes built from 4px stay on whole pixels at every step. These constraints keep box edges on whole pixels:

- Every base size and offset of a box is a multiple of 4px. Base line heights are multiples of 4px too, so stacked lines stay on whole pixels. Font sizes and border radius are exempt, because they never shift an edge.
- A box centered inside another box, whether a part or a child component, differs from it by a multiple of 8px, so the gap on each side is a multiple of 4px.
- Every default factor that a component sets is chosen for the child it is designed around: it keeps that child's box sizes on multiples of 4px, and keeps the child a multiple of 8px smaller than the box or text line it is centered in. Which factor works depends on that box: a 16px icon centered in a 16px box needs 0.5, which gives 8px, and a 16px icon centered on a 20px text line needs 0.75, which gives 12px.

Text is exempt. A line of text centered in a box, or a line height that a factor shrinks off the 4px grid, may land on half a pixel. Text does not shift by a whole pixel the way a box edge does.

A spec may not be able to meet these constraints everywhere, for example when one group holds components of different heights. `SPEC.md` lists each such case. Those sizes or gaps can land on part of a pixel, and a centered child can sit 1px off center at some scales. Every size still scales correctly.

The rules for users follow:

- Set `--scale` in steps of 0.25, such as 0.75, 1, 1.25 or 1.5. Every size the components define then lands on a whole pixel, including sizes changed by the factors components set themselves. Centered children land on whole pixels too, apart from the cases `SPEC.md` lists.
- The values you set multiply with each other and with the factors components pass down, so keep the product of the values you set in steps of 0.25. `--scale: 1.25` with `--scale-group5: 1.2` around a group 5 component gives 1.5 for it and everything in it, which is fine. `--scale: 1.25` with `--scale-group5: 1.25` gives 1.5625, which can leave a centered child 1px off.
- When you set a factor for a group directly, pick one that keeps that group's base sizes on multiples of 4px.

## What users write

`--scale`, and `--scale-group<N>` for each group in `SPEC.md`, on any element.
