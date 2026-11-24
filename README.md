# jun-scale-ui

A minimal CSS framework built around a scaling system. UI scales without fixed sizes, and scaled parts can be composed together.

Set `--scale` on the root, or on any container, to resize every component inside it. Each component has one default size and follows the scale for width, height, margin, padding, font size, line height and border radius.

The project is plain HTML and CSS. Open any `experiments/*/index.html` file in a browser, or start from `index.html` at the root. Add `?annotate` to the URL to show value labels, and `?scale=1.1` to set the scale. The playground renders components with the [Radix Themes](https://www.radix-ui.com/themes) stylesheet.

See `AGENTS.md` for the experiment workflow, annotations, and the screenshot script.
