# Notes: plain CSS implementation

## Decisions

### File layout

- One `.tsx` and one `.css` file per component in `src/components/`. Each component imports its own CSS. `Popup.css` holds the shared `Popup` parts and is imported by `Select`.
- `index.ts` imports `layers.css` first. That file declares the `jun-scale` layer, so the layer exists before any component CSS or user CSS that is imported later.
- Components are styled by class (`.Button`, `.Select-trigger`). Every element also carries `data-slot` with the same name, which the shared pages use.

### How the scale is computed

- Each component root declares its effective scale once, under a name that only that component uses: `--Button-scale: calc(var(--scale, 1) * var(--scale-group5, 1))`. Every size on the root and its parts is `calc(<base>px * var(--Button-scale))`.
- An unregistered custom property substitutes its `var()` references on the element that declares it. Parts inherit the resolved number from the root. So a `--scale` or group factor set on a part does not change the part, as rule 8 requires.
- The name has to be unique to each component. A shared name such as `--s` would be declared again by every child component. A size the parent applies to a child, such as the Button's `-4px` margin on its leading Icon, would then read the child's scale instead of the parent's (rule 8).
- `Select` also sets `--Popup-scale: var(--Select-scale)`, so the shared `Popup` CSS doesn't need to know which component holds it.
- Defaults come from `var()` fallbacks: `var(--scale, 1)` and `var(--scale-groupN, 1)`. Nothing is set on `:root`, and no scaled length is ever stored in a variable (rule 9).

### Passing factors down

- Each component root sets `--scale-group1` through `--scale-group(N-1)` to `var(--scale-groupN, 1)`, or to that value times its default factor. I did this even for Icon and Spinner, which only set group 1 and hold nothing, so every component follows the same pattern.
- Part defaults are set on the part: `Select-trigger` sets `--scale-group4: calc(var(--scale-group5, 1) * 0.75)`, and `Field-label`, `Field-help` and `Field-error` set `--scale-group3` to `0.8 × group 5`.
- Defaults that are not 1: Badge Icon 0.75, Checkbox Icon 0.5, Select-trigger Avatar 0.75, Field label, help and error Inline 0.8, Callout Icon 0.75.

### Making the user's factor win

- All component CSS is in `@layer jun-scale`. Unlayered declarations beat layered ones whatever their specificity or order. So a user's class, utility or inline style on the same element beats the factor the component sets.
- I checked this in the browser. A `.u { --scale-group2: 1 }` rule inserted before the component styles still made the Checkbox's checkmark 16px. A `--scale-group3` class on a `Field` did not change the Badge inside `Field-label` (the part's default is nearer). The same class on `Field-label` did change it.

### Centering and layout

- Children are centered with flex or grid alignment, never with fixed offsets: the Checkbox mark, the Switch thumb's vertical position, icons in IconButton and `Input-action`, and the Callout icon.
- `Callout-icon` is an element exactly one text line tall (`20px × scale`), with the Icon centered in it.
- The Switch thumb's 4px left inset is a margin, and its checked position is `translate: 16px × scale`. Both are offsets within one component, so they use the Switch's own scale.
- `Input-action` gets `margin-right: -4px × scale`, so its right edge sits 4 inside the border, in the right padding.
- The Popover root is `inline-flex` and the Select root is `inline-grid`. That way `top: 100%` is the bottom of the trigger. An `inline-block` root would add the line box's descender space below the trigger.
- Card, Dialog, Popover-content and Field use `align-items: flex-start`, so an inline component such as a Badge is not stretched across the box. `Dialog-actions` stretches with `align-self`. `Input` and `Select` stretch inside `Field` through `.Field > .Input` and `.Field > .Select`.
- Card has `width: fit-content` because the spec says "fits its content".

### Button's leading icon

- The spec gives "an Icon that comes first" a `-4px` left margin. CSS cannot see text nodes, so `.Icon:first-child` also matches the Icon in `<Button>Save<Icon/></Button>`.
- `Button` therefore checks in React whether its first child is an `Icon`. If it is, it adds the class `Button--startIcon`, and the CSS uses `.Button--startIcon > .Icon:first-child`. This class is not a spec name. It is a state class.

### Field wiring

- `Field` provides a React context with the control id, the help or error id, and `invalid`. `Input`, `Checkbox` and `Switch` put these on their native input unless the user passes them. `Select` puts them on `Select-trigger`, because a `div` cannot be labelled.
- `Field-label` is a `<label htmlFor>`. The help or error has an id that the control references with `aria-describedby`. The control gets `aria-invalid` when the Field is invalid.

### Other choices

- `Input` takes an extra optional `onAction` prop for the action button. Without it, a "Clear" button could not do anything.
- `Spinner` gets `role="status"` and `aria-label="Loading"`. The user can override both.
- `Icon` defaults to `aria-hidden="true"`.
- `Popup` uses `role="listbox"`, and each `Popup-item` uses `role="option"`.
- The Spinner and Switch animations slow down or stop under `prefers-reduced-motion`.
- I checked the gallery at `--scale` 0.75, 1, 1.25 and 1.5. I measured every fixture at 1 and 1.25, and all box sizes and centered offsets land on whole pixels. The exceptions are the accepted deviations: the Badge in `Field-label` sits 2.5px from the top at 1.25, and the Badge and Kbd sit 7.5px from the top inside a Button. The `ButtonScaled` fixture is off-grid on purpose (1.2).

## Where the documents were unclear or in tension

1. **"The user's factor wins however the user sets it."** Plain CSS can only promise this through cascade layers. Unlayered user CSS and inline styles always win. A user's own layer wins only if it is declared after `jun-scale`. If the user's CSS declares its layers first, for example a Tailwind-style `@layer theme, base, components, utilities;` loaded before this library, those layers have lower priority than ours, and the component's factor wins over the user's utility. The principle doesn't say whether this has to hold for layered user CSS.
2. **Which group factor a part multiplies by.** Rule 7 says a part's default is "still multiplied by the component's own group factor, which the part inherits from the component". I read `var(--scale-group5)` on the part itself. If a user sets `--scale-group5` on the part, that value is used for the children inside the part. A stricter reading would capture the factor on the root under a private name. The documents don't decide between the two.
3. **"An Icon that comes first."** As the previous section explains, CSS cannot tell whether text comes before an Icon. The spec reads as if a selector could express it.
4. **Border and outline widths.** SPEC says "Borders and outlines are 1px", but the Spinner has a 2px ring drawn as a border. I treated the Spinner line as a named exception. Focus outlines are also 1px to follow the spec, which is thin for a focus ring.
5. **Group 3 holds parts of different sizes.** The spec lists this as an accepted deviation, but rule 10 still says every default factor keeps "the child it is designed around" on the grid. The 0.8 factor in `Field-label` gives a 16px Badge on a 20px line, which is 4px from the line instead of a multiple of 8. This is listed, but it is a second deviation in the same place.
6. **Field label tied to an Input that is itself a `<label>`.** The spec makes the Input's root a `label` and asks `Field-label` to be a `<label>` tied to the control. The native input then has two labels, and its accessible name joins both. Any text in the Input's `start` or `end`, such as a Kbd, becomes part of the name.
7. **Height of `Input-field`.** It isn't given. I stretched it to the Input's inner height (30px at scale 1) so the whole box is clickable. A 20px line height is set through `font: inherit`.
8. **Popup width.** The spec gives only a minimum width of 128. It doesn't say whether the Popup should be at least as wide as the trigger, so it isn't.
9. **Rule 7 for components with nothing inside.** "A component of group N sets the factor of every smaller group." For Icon and Spinner this has no effect, but I followed it so every component has the same structure.
10. **Rotation versus measured size.** Rule 2 says a rotation doesn't change the layout box. That is true, but `getBoundingClientRect` on a rotating Spinner reports a larger box (19.5px at scale 1). Any check should use `offsetWidth` or measure a non-rotating element.
11. **BRIEF versus Field wiring for Select.** The brief says Select's other props go to the root. Field still has to label the trigger, so the trigger takes the Field's id from context, not from props.

## Plain CSS: what was easy, what was hard

### Easy

- Custom properties inherit, and `var(--x, 1)` gives the default. "The nearest value wins" (rule 6) and "1 unless set" need no code.
- Rule 9 matches how unregistered custom properties work: `--Button-scale: calc(var(--scale, 1) * var(--scale-group5, 1))` is resolved on the root, and parts inherit the number. No `@property` registration was needed.
- Flex and grid alignment handle every "center it with layout, not an offset" case.

### Hard, and the workarounds

- **Precedence (rule 7).** Equal-specificity selectors depend on source order, so without help a user class loaded before the library would lose. Workaround: everything goes in `@layer jun-scale`, declared first from `index.ts`. See item 1 above for the remaining gap with layered user CSS.
- **Repetition.** Plain CSS has no mixins, so every component repeats the `--scale-group1 … N-1` lines. Card, Dialog and Popover each repeat six identical lines. A shared selector list such as `.Card, .Dialog, .Popover { … }` would cut this down. I kept each file self-contained instead.
- **Private scale names.** Each component needs its own `--<Name>-scale`, as explained above. This is easy to get wrong with a shared short name, and nothing in plain CSS warns about it.
- **Text nodes.** There is no selector for "first child including text", so the leading-icon rule needs help from React.
- **Self-reference.** A component cannot write `--scale-group3: calc(var(--scale-group3) * 0.8)`, because a property that refers to itself is invalid at computed-value time. This is the limitation the principle already names: outer smaller-group factors don't reach inside bigger components.
- **Specificity inside the layer.** The Field's stretch rules (`.Field > .Input { width: auto }`) rely on the selector weighing more than `.Input { width: … }` inside the same layer. That works, but it is the kind of rule that breaks quietly if someone flattens selectors.
