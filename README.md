# jun-scale-ui

A minimal CSS framework built around a scaling system. UI scales without fixed sizes, and scaled parts can be composed together.

Set `--scale` on the root, or on any container, to resize every component inside it. Each component has one default size and follows the scale for width, height, margin, padding, font size, line height and border radius.

Components are sorted into seven groups, from `Dot` to `Container`. Set `--scale-group<N>` on a container to resize one group inside it. A component in group N renders at `--scale × --scale-group<N>`.

Use steps of 0.25 for `--scale` and every `--scale-group<N>`, such as 0.75, 1, 1.25 or 1.5. All base sizes are multiples of 4px, so these values keep every edge on a whole pixel. Other values work too, but a centered part such as a `Switch` thumb can end up 1px off.

The project is plain HTML and CSS, with no build step and no dependencies. Use it with `src/index.css`.

Open `playground/index.html` to see every component at several scales, with each measured size checked against its base value. `playground/groups.html` shows how group factors combine.

See `AGENTS.md` for the scaling model, the group list, the workflow and the screenshot script.
