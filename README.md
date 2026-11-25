# jun-scale-ui

A minimal CSS framework built around a scaling system. UI scales without fixed sizes, and scaled parts can be composed together.

Set `--scale` on the root, or on any container, to resize every component inside it. Each component has one default size and follows the scale for width, height, margin, padding, font size, line height and border radius.

The project is plain HTML and CSS, with no build step and no dependencies. Use it with `src/index.css`.

Open `playground/index.html` to see every component at several scales, with each measured size checked against its base value. `playground/groups.html` shows how group factors combine.

See `AGENTS.md` for the scaling model, the group list, the workflow and the screenshot script.
