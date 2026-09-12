# CHANGELOG

## Updates

### 2026-09 current intermediate state

- Split the static page into source fragments under `html/`, with
  `scripts/build-html.js` generating the delivered `index.html`.
- Added Node regression tests, HTML validation, generated-HTML checks, and the
  browser-based XML smoke test.
- Refined responsive layout behavior for import controls, navigation, board/results
  views, and dialogs. Wide content now scrolls locally on narrow screens.
- Added the teal color palette and preserved a visual distinction between read-only
  legends and action buttons.
- Standardized application typography and restored a softer Arial-based sans-serif
  font for the board and play view.
- Added keyboard focus indicators, accessible names, live regions, dialog semantics,
  and reduced-motion support.
- Added structured DDS/WASM worker error reporting and localized UI feedback for
  main-worker and background-worker failures.

### Legacy refactoring notes

- Added [DOMPurify](https://github.com/cure53/dompurify) functionality to sanitize strings for `.innerHTML` usage
- Modernized `Object` and `Array` creation
- Replaced constructions `eval("(" + x + ")")` with `JSON.parse(x)`
- In a call to `calculateBridgeScore()` replaced `level: level` with `level: Number(level)` to ensure that a string is converted to a number. Without the conversion the calculation of the slam bonus was wrong.

### functions.js
- Changed `\'` to `"` in `buildPage()` calls
