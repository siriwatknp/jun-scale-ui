# Notes: CSS Modules implementation

## Decisions

### How each component works out its scale

- Each component root declares its effective scale once, under a name that only that component uses: `--Button-scale: calc(var(--scale, 1) * var(--scale-group5, 1))`. Every size on the root and on its parts is `calc(<base>px * var(--Button-scale))`.
- The custom properties are not registered with `@property`. An unregistered custom property still has `var()` replaced when its value is computed, so parts inherit the number worked out on the root. Setting `--scale` or a group factor on a part therefore does not change the part (rule 8). I checked this in the browser: `--scale: 2` on `Select-trigger` leaves the trigger at 32px and makes the Avatar inside it 48px.
- Each root sets every smaller group factor to its own factor times the default, for example `--scale-group2: calc(var(--scale-group3, 1) * 0.5)` on Checkbox. Components never set their own group's factor.
- Part-level defaults sit on the part: `--scale-group4: calc(var(--scale-group5, 1) * 0.75)` on `Select-trigger`, and `--scale-group3: calc(var(--scale-group5, 1) * 0.8)` on `Field-label`, `Field-help` and `Field-error`.

### Letting the user's factor win

- All component rules are inside one cascade layer, `@layer jun-scale-ui`. Unlayered user rules of any specificity beat them, and so do inline styles. User rules in a layer that is created after `jun-scale-ui` also win. I checked a plain class and a class in a later layer: both set the Checkbox checkmark back to 16px.
- I chose a layer over `:where()`. A zero-specificity rule would lose to user classes in any order, but it would beat every layered user rule, such as Tailwind v4 utilities.

### Markup and API

- Roots and parts carry `data-slot`. Class names come from the modules and are hashed.
- When one component styles a child component, it selects the child by `data-slot`, for example `.iconStart > [data-slot="Icon"]:first-child` in Button. CSS Modules has no way to name another module's hashed class in a selector.
- Button's "Icon that comes first" is found in React: if the first child in `children` is an `Icon` element, the Button adds the `iconStart` class. CSS `:first-child` ignores text nodes, so `<Button>Save<Icon/></Button>` would otherwise match too. The -4 margin uses `--Button-scale`, not the Icon's scale (rule 8).
- The Checkbox checkmark and the Select chevron are `Icon` components that get a class from the parent's module (`styles.check`, `styles.chevron`) for color, grid placement, and hiding the checkmark when unchecked.
- Checkbox: a `span` 16×16 grid that holds the native input (`appearance: none`, draws the border and fill) and the Icon in the same grid cell, so the Icon is centered by layout.
- Switch: a `span` track that holds the native input (`role="switch"`, fills the track) and a `span` thumb. The checked thumb moves with `translateX(16px × scale)`.
- Input: the `label` root holds `start`, the field, `end`, then the `Input-action` button. The action has a right margin of -4 × scale, so its right edge sits 4 inside the border. I added an optional `onAction` prop so the action button can do something; the brief's props are unchanged.
- Select: `div` root, `button` trigger with `aria-haspopup="listbox"`, `Popup` with `role="listbox"` and `Popup-item` with `role="option"`. The `Popup` styles live in `Select.module.css` and read `--Select-scale`, because Select is the only component here that holds a Popup.
- Field: gives the control an id (unless it has one) and ties `Field-label` to it with `htmlFor`. It also sets `aria-describedby` to the help or error text and `aria-invalid` when invalid. An Input or Select directly inside stretches to the Field's width. A stretched Select's trigger fills the root because the trigger has `flex: 1`.
- Dialog: `role="dialog"`, labelled by `Dialog-title` (an `h2`) and described by `Dialog-description`. Title, description, body children and actions are all flex items with the 16 gap.
- Popover: the trigger gets `aria-haspopup`, `aria-expanded` and `aria-controls` through `cloneElement`.
- Card is `width: fit-content` and its children align to the start, so a Badge inside does not stretch.
- Popups and `Popover-content` are absolutely positioned 4 × scale below the trigger, so they take no layout space.
- Spinner has `role="status"` and `aria-label="Loading"` by default and slows down under `prefers-reduced-motion`.

### Global CSS

None. `@layer jun-scale-ui { ... }` sits inside each module file. CSS Modules leaves layer names alone, so every module joins the same layer. No `@property` rules were needed.

### Checks run

- `pnpm build` passes.
- In the gallery at `--scale` 0.75, 1, 1.25 and 1.5 I measured every `data-slot` box. Every size is base × scale, for example Button 24/32/40/48, Checkbox checkmark 6/8/10/12, Badge in `Field-label` 12/16/20/24, Select trigger Avatar 18/24/30/36, Popup Avatars 24/32/40/48, `ButtonWithBadge` Badge 10px tall at scale 1, `CheckboxOverride` checkmark 16px.
- Offsets at scale 1: Button icon 8 from the left edge; Callout icon 20 from the top (padding 16 plus 4 to center 12px on a 20px line); `Input-action` right edge 4 inside the border; Popup and `Popover-content` 4 below the trigger; checked Switch thumb at 20 from the left.
- `fixtures.html` renders all 25 fixtures.

## Where the documents were unclear or in tension

1. **"The user's factor wins in any order" versus layers.** Rule 7 asks the component's own factors to lose to every user declaration on the same element. Inline styles and unlayered rules always win. A user rule inside a cascade layer that was created before `jun-scale-ui` still loses, because layer order is set by where each layer name first appears. A plain CSS file cannot fully guarantee this; the user would need to declare `@layer jun-scale-ui;` first. No CSS approach meets this in every case, and the documents don't say which setups must be supported.
2. **Rule 7 asks for every smaller group, including ones a component can never hold.** For example, Icon sets `--scale-group1`, and Kbd sets groups 1 and 2 though it only holds text. I set them all, as written.
3. **"Inline 0.8" in Field parts affects icons inside a Badge in the label.** The Badge sets its Icon to 0.75 × its own factor, so an Icon in a Badge in `Field-label` is 0.8 × 0.75 × 16 = 9.6px. The spec lists 0.8 as an accepted deviation for padding and gap, but not for this icon size.
4. **Kbd in a Button.** Group 3 is passed at 1, so a 20px Kbd is centered in a 32px Button and differs by 12px. The spec lists this as an accepted deviation for group 3 in general.
5. **`Input-action` position.** "Right edge sits 4 inside the Input's right border" could mean 4 from the outer edge or from the inner edge of the border. I took the inner edge (5 from the outer edge at scale 1), which matches "overlapping half of the right padding".
6. **Field width versus a stretched Select.** The spec says a stretched Select's trigger fills the Field with the chevron at the right end, but `Select` itself has no base width. I let the root stretch and the trigger fill the root.
7. **Popup and its holder.** SPEC says Popup parts "take the scale of the component that holds them" and are shared by Select, Combobox and DropdownMenu. With one module per component, a shared part's CSS would need to read a scale name that every holder sets. With only Select in scope, I kept it in Select's module.
8. **Spinner bounding box.** A rotating element's `getBoundingClientRect()` is bigger than its layout box (about 16.8px at 16px). Rule 2 says a rotation doesn't change the layout box, which is true, but any check that measures with `getBoundingClientRect()` will see the rotated size. `offsetWidth` gives 16.
9. **Button and IconButton styles.** There are no size or color variants, so both use one neutral gray look. The documents don't say anything about color.

## Where CSS Modules helped or got in the way

- **Easy:** One module per component keeps every rule for that component in one file. The private scale name and the factor declarations sit next to the sizes that use them. Keyframes are hashed, so `spin` can't collide.
- **Easy:** Custom properties are not hashed, so `--scale` and `--scale-group<N>` stay the public names users write without any setup.
- **Hard:** Because custom properties are not hashed, the private names (`--Button-scale` and so on) are not scoped either. Their uniqueness rests on a naming convention.
- **Hard:** A component cannot select another component's class, because it is hashed in another module. Styling a child component (Button's leading Icon margin, Field stretching an Input or Select, Field's red border on an invalid Input) uses `[data-slot="..."]` attribute selectors. Using `composes` or exporting classes would couple modules more tightly.
- **Hard:** Layer order is global, and CSS Modules gives no control over it. The order depends on the order in which the bundle includes CSS files (see item 1 above).
- **Workaround:** To style a child component the parent renders itself (the checkmark and the chevron), the parent passes a class from its own module through the child's `className`. That avoids attribute selectors for those cases.
