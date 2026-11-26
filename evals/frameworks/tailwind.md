Use Tailwind CSS v4 as the engine, through `@tailwindcss/vite`. Build the design system so that it ships the scaling system as a feature:

- Users control the scale with Tailwind utilities that you define, for example with `@utility`: one for `--scale` and one for each `--scale-group<N>`, with any value, such as `0.75` or `1.2`. Choose the names, and avoid clashing with Tailwind's own utilities.
- The CSS variables must still work when set directly in `style`, because the shared fixtures set them that way.
- Write the component styles with Tailwind: utility classes in `className`, plus `@theme`, `@utility` and `@custom-variant` where you need them. Avoid hand-written component classes, and list in `notes.md` each place where you needed plain CSS and why.
- Put the stylesheet at `src/components/styles.css` and import it from `src/components/index.ts`.

Fill `src/extra-fixtures.tsx` with three fixtures that repeat shared ones with your utilities instead of `style`. Each one must render the same markup as the original, with the utility in `className` in place of the `style` prop:

- `ButtonScaledViaUtility`, group 5: the `ButtonScaled` fixture, with `--scale-group5: 1.2` as a utility.
- `ButtonWithBadgeViaUtility`, group 5: the `ButtonWithBadge` fixture, with `--scale-group3: 0.5` as a utility.
- `CheckboxOverrideViaUtility`, group 3: the `CheckboxOverride` fixture, with `--scale-group2: 1` as a utility.

In `notes.md`, add a "Usage" section that shows a user how to scale with your utilities.
