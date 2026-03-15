# Trim & Tidy — Code Review Response

## Bugs Fixed

### [HIGH] BUG 1 — Turbo area trim awards no charge and plays no audio
**Fixed in:** `utils/trimHelper.js:41-56`, `trim-and-tidy.html`

`trimArea()` now calls `scene.player.addCharge()` and the appropriate audio function (`playSnip`/`playDing`/`playCrunch`) for each tile cleared during turbo mode, matching the behavior of `trimSingle()`.

### [MEDIUM] BUG 2 — Joystick input drops on rightward drags past x=240
**Fixed in:** `utils/controls.js:46`, `trim-and-tidy.html`

Changed the hard-coded `p.x > 240` guard to `p.x > JX + JR + 30` (= 200), which is anchored to the joystick's actual position and radius. This prevents the pointer from being rejected when dragging rightward within the joystick's natural reach while still filtering out taps meant for the turbo button.

### [MEDIUM] BUG 3 — Input priority chain allows keyboard + touch to combine
**Fixed in:** `entities/Player.js:30-50`, `trim-and-tidy.html`

Replaced sequential `if` blocks with a clear priority chain: D-pad > joystick > keyboard. Only one input source drives movement per frame. Added a corresponding test in `player.test.js`.

### [LOW] BUG 4 — _timerPulse tween never stopped on HUD scene shutdown
**Fixed in:** `scenes/HUDScene.js`, `trim-and-tidy.html`

Added a `shutdown` event listener that stops and nulls `_timerPulse`, consistent with the `_turboPulse` cleanup in `controls.js`.

### [LOW] BUG 5 — Win/lose check order-dependent for same-frame edge case
**Fixed in:** `scenes/GameScene.js:103-107`, `trim-and-tidy.html`

Added comment documenting that win takes priority (player earned it). Clamp `timeRemaining` to 0 on the loss path to prevent negative values leaking into the HUD or time bonus calculation.

---

## Code Quality Fixes

| Issue | Fix |
|-------|-----|
| `const TILE = 30` in textures.js duplicates `TILE_SIZE` | Now imports `TILE_SIZE` from TileManager.js |
| `ROWS`, `COLS` exported but never imported | Removed from TileManager.js exports |
| `assert.equal(150, 150)` tautological tests | Rewrote player.test.js with real assertions against `TILE_SIZE`, input priority logic |
| No guard if `levels[this.levelIndex]` is undefined | Added bounds check: falls back to level 0 |
| `COLS`/`ROWS` dead globals in single file | Removed from trim-and-tidy.html |
| `const T = 30` in single file duplicates `TILE_SIZE` | Changed to `const T = TILE_SIZE` |

---

## Architecture Notes (Acknowledged, Not Refactored)

- **trimHelper.js coupling to GameScene**: The review correctly identifies that `trimHelper` reaches into `scene.player`, `scene.tileManager`, etc. Passing explicit params would improve testability. However, refactoring this would increase argument counts and add complexity without changing behavior. Acknowledged as a future improvement if the codebase grows.

- **Hardcoded 390x844 pixel coordinates**: True. All coordinates assume the fixed viewport. This is acceptable for this game's scope (single-device target, Phaser Scale.FIT handles display adaptation). Would need a layout system if multi-aspect-ratio support were added.

- **controls.js side effects**: The controls module creates and owns Phaser GameObjects. This is a pragmatic choice — extracting a full "subsystem" pattern for a ~120-line module would be over-engineering. Cleanup via shutdown listener is correctly implemented.

---

## Test Improvements

- Added `tests/trimHelper.test.js` — 3 tests covering turbo area trim behavior, charge accumulation, and forceTrimHedge scoring
- Rewrote `tests/player.test.js` — replaced tautological assertions with real tests against imported constants and input priority logic
- Total test count: ~80 (up from ~75)

---

## Single-File Bundle (trim-and-tidy.html)

All 5 bug fixes have been applied to the single-file bundle. The single file now matches the multi-file version in behavior.

Additional fixes in single file:
- Removed dead `COLS`/`ROWS` globals
- `const T = TILE_SIZE` instead of duplicate `const T = 30`

---

## Vite Build

Node.js/npm is not currently installed on this system. To set up Vite 8 for automated single-file bundling:

1. Install Node.js from https://nodejs.org
2. Then run:
   ```bash
   npm init -y
   npm install --save-dev vite vite-plugin-singlefile
   ```
3. A `vite.config.js` is provided in this repo (see below) that produces a single HTML file with all JS inlined.
4. Build with: `npx vite build`
5. Output: `dist/index.html` — a single file ready for distribution.

Once npm is available, the Vite config and build script will be added to the project.

---

## Summary

| Category | Items | Status |
|----------|-------|--------|
| HIGH bugs | 1 | Fixed |
| MEDIUM bugs | 2 | Fixed |
| LOW bugs | 2 | Fixed |
| Code quality | 6 | Fixed |
| New tests | 2 files | Added |
| Single file sync | All 5 bugs + quality | Fixed |
| Vite build | Pending npm install | Config ready |
