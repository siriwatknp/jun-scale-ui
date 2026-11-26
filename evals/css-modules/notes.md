# Notes: CSS Modules eval

## Decisions

### How the scale is computed

- Every component root declares a private variable, `--_scale: calc(var(--scale, 1) * var(--scale-group<N>, 1))`, where N is the component's group. Every size in the component and its parts is `calc(<base>px * var(--_scale))`. This is rule 9: the effective scale is worked out once, on the root, and the parts reuse it.
- `--_scale` is an unregistered custom property. The browser substitutes the `var()` references where `--_scale` is declared, so a part inherits the already resolved number. Setting `--scale` or a group factor on a part does not change the part. I checked this in the browser: `--scale: 2` and `--scale-group5: 2` on `Select-trigger` leave it 32px tall.
- Every component root also sets the factor of each smaller group to its own group factor, for example `--scale-group2: var(--scale-group5, 1)` on Button. A default that is not 1 multiplies that value: Checkbox sets `--scale-group2: calc(var(--scale-group3, 1) * 0.5)` and Callout sets `--scale-group2: calc(var(--scale-group6, 1) * 0.75)`.
- When a default applies to one part only, the part sets it: `Select-trigger` sets `--scale-group4` to 0.75 × the group 5 factor, and `Field-label`, `Field-help` and `Field-error` set `--scale-group3` to 0.8 × the group 5 factor.
- A component never sets its own group's factor. A value the user puts in `style` on the root is inline, so it beats the module class and is used as it is (rule 7). The `CheckboxOverride` fixture shows this: its checkmark is 16px.
- `--scale` and the group factors are never given a default value on `:root`. Every read uses a `var(..., 1)` fallback. Because of this, the design system has no global CSS at all.

### Components

- **Spinner**: the ring is a 2px border on the 16×16 root. The animation changes which side of the border is dark instead of rotating the element. A rotated box has a bigger bounding box, so measurements would change while it spins.
- **Checkbox**: the root `span` is the 16×16 box. It is an `inline-grid` that stacks the native input and the checkmark `Icon` in one cell. The input fills the cell and draws the border, the radius and the checked fill. The checkmark is centered by `place-items: center`, with no offsets. It is hidden with `visibility` until `:checked`.
- **Switch**: the root `span` is the 40×24 track. The native input (`role="switch"`, `data-slot="Switch-input"`) fills it and paints the track. The thumb is a real element (`data-slot="Switch-thumb"`). It is centered vertically by `align-self: center`, which gives the 4px inset at the top and bottom, and it has a 4px scaled left margin. When the input is checked, it moves with `translate: calc(16px * var(--_scale))`.
- **Input**: the root is the `label`. `start` and `end` are rendered as direct children on either side of `Input-field`. `Input-action` is not built, because the API has no prop for it.
- **Select**: the trigger is a `button`. A chevron `Icon` with `margin-left: auto` comes after the children. The `Popup` is absolutely positioned at `top: calc(100% + 4px * var(--_scale))`, so it floats like a real popup. In the gallery, this means the open popup covers part of the next row ("Field with Badge and error").
- **Field**: the root is a flex column with a scaled gap of 8px. The label, the control, and the help or error text are its direct children. Field gives the control an `id` (unless it has one) and an `aria-describedby`, through `cloneElement`. The `Field-label` is a `label` element with `htmlFor` pointing at that `id`. When `invalid` is true, `error` is shown instead of `help`, and `data-invalid` is set on the root. An `Input` or `Select` directly inside the Field stretches to the Field's width.
- **Callout**: the root is a two-column grid. Row 1 is exactly one line tall (`calc(20px * var(--_scale))`) and row 2 is `auto`. The icon sits in row 1 with `align-self: center`. `Callout-text` spans both rows, and its extra lines go into row 2. This centers the icon on the first line of text without a fixed offset and without an extra wrapper element.
- Button and IconButton have no border, because SPEC.md gives them none. Their focus ring is a 1px outline that does not scale.
- Text colors, backgrounds and hover states are fixed values inside each module. They are not part of the scaling rules.

### Checks I ran

- `pnpm build` passes (`tsc` and `vite build`).
- In the built gallery at `--scale: 1.25`, every base size measures base × 1.25. For example, Button is 40 tall, Badge and Kbd 25, Checkbox 20 with a 10px checkmark, Switch 50×30 with a 20px thumb, the Select trigger Avatar 30, the Callout Icon 15, and the Field label Badge 20 (0.8 × 25).
- At scale 1, the Switch thumb is inset 4px at the left, top and bottom, the Popup sits 4px below the trigger, and the Callout icon is centered on the first 20px line.
- Across all four scales, the only heights that are not whole pixels come from fixtures where the user chose a factor that is not a step of 0.25: `ButtonScaled` (1.2) and `ButtonWithBadge` (0.5 × 1.25 = 0.625).

## Where the documents were unclear or in tension

1. **Defaults set on a part, and a user factor on the root.** Rule 7 says a factor the user sets on the component element replaces the factor the component sets. SPEC.md says Select sets its Avatar 0.75 on `Select-trigger`, not on the root. So `--scale-group4: 1` set on the Select root does not reach the trigger Avatar, because the trigger sets the value nearer to it. It does reach Avatars in the `Popup`. I followed SPEC.md. Doing the opposite (setting 0.75 on the root and resetting it on `Popup`) would honor the user's value in the trigger but drop it in the popup.
2. **A group factor set on a part.** Rule 8 says a group factor set on a part does not change the part, and the part does not change. But `Select-trigger` computes `--scale-group4` from `--scale-group5` as read at the trigger itself. So `--scale-group5` set on the trigger does change the Avatar inside it. Rule 7 says the part "inherits" the component's factor, which assumes nobody sets it on the part. The documents don't say which value should win.
3. **Text placement versus base sizes.** SPEC.md gives Button a height of 32 and a padding of 12, but no border. Input has a 1px border and a padding of 8. Rule 2 says a border doesn't change where centered content lands, but horizontal padding is not centering. With the border, content starts 9px from the outer edge of Input, not 8px. I read padding as measured inside the border.
4. **"An Icon centered on the first text line".** Rule 8 says to give the child a row one line tall. SPEC.md lists only `Callout-text` as a Callout part, so a wrapper element would be an unlisted part. A grid row avoided the question.
5. **Spinner.** A spinning ring is usually done with `transform: rotate`, but rule 2 counts translations as sizes and says nothing about rotation. A rotating box also changes its bounding box. I avoided the question by animating border colors.
6. **Switch input.** The BRIEF says other props go to the native input. SPEC.md doesn't name the input as a Switch part. I gave it `data-slot="Switch-input"`, by analogy with `Checkbox-input`.
7. **Field-label and the label element.** SPEC.md doesn't say whether `Field-label` is a `<label>`. Input's root is already a `<label>`. Nesting labels is invalid HTML, but here they are siblings, so `Field-label` can be a `<label>` with `htmlFor`.

## CSS Modules: what was easy, what was hard

- **Custom properties pass through unchanged.** The module compiler hashes class names and keyframe names, but not custom property names. So `--scale`, `--scale-group<N>` and `--_scale` work across modules and from user `style` with no extra setup. The cost is that `--_scale` is a global name. It works only because every component root declares it again, so a part always reads its own component's value. A component that forgot to declare it would silently use its parent's scale.
- **`composes` could not hold the group factors.** My first version put one class per group in `groups.module.css` (`--_scale` plus the smaller-group factors) and used `composes: group5 from "./groups.module.css"`. Components with a non-1 default (Checkbox and Callout) overrode one factor in their own `.root`. In the production build, Vite placed `groups.module.css` after the component CSS, so the shared class won and the Checkbox checkmark went back to 16px. Both selectors have the same specificity, so the result depended on bundle order. The workaround was to drop `composes` and declare the factors in each component's `.root`. It is five or six repeated lines per module, but the result no longer depends on CSS order.
- **Styling another component from a module.** A module can't name another module's hashed class without importing it. Field needs to stretch an `Input` or `Select` that is its direct child and color its border red when invalid. Callout needs to place its icon. I used the `data-slot` attributes (`.root > [data-slot="Input"]`) and structural selectors (`.root > :not(.text)`). Since `data-slot` is part of the public markup, this is stable. A selector like `.root > [data-slot="Input"]` is also more specific (0,2,0) than Input's own `.root` (0,1,0), so the Field override wins whatever the CSS order.
- **Passing a class to a child component.** Checkbox and Select pass their own module class (`styles.check`, `styles.chevron`) to `Icon` through `className`. This works as long as the two classes don't set the same property, because neither one is guaranteed to come later in the CSS.
- **Global CSS**: none. No `@property` rules or `:root` values were needed, because every read of a scale variable has a fallback of 1.
