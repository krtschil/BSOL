# CHANGELOG

## Updates

### ddummy6.js (recommended by Claude)

- Replaced constructions `eval("(" + x + ")")` with `JSON.parse(x)`
- In a call to `calculateBridgeScore()` replaced `level: level` with `level: Number(level)` to ensure that a string is converted to a number. Without the conversion the calculation of the slam bonus was wrong.

### functions.js
- Changed `\'` to `"` in `buildPage()` calls
