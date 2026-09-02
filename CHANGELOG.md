# CHANGELOG

## Updates

### ddummy6.js

- Replaced eval constructions `eval("(" + x + ")")` with `JSON.parse(x)`
- Replaced level: `Number(level)` with `level: Number(level)` to ensure that a string is converted to a number

### functions.js
- Changed `\'` to `"` in `buildPage()` calls
