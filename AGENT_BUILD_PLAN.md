# Nemo Claw - Tree Trimmer Game: Agent Build Plan

## Introduction for Executing Agent

You are building a complete JavaScript top-down 2D game called **"Trim & Tidy"** from scratch in an empty repository. The game uses **Phaser 3** loaded via CDN — no npm, no bundler, no build step. All graphics are procedurally generated (colored shapes) — there are zero image assets to download.

**Your workflow for each step:**
1. Read the step instructions carefully
2. Create/modify the listed files with the exact code described
3. After each step, the game should be openable in a browser via `index.html` (or tests via `tests/test.html`)
4. Do NOT skip steps or combine steps — execute them in order
5. Keep every file under 150 lines. If a file is getting long, you're doing too much in it
6. Use `export`/`import` (ES modules) for all project files. Phaser is loaded as a global `<script>` (UMD), so `Phaser` is available on `window`

**Platform:** Windows 11, directory `E:/nemo-claw/`. Use forward slashes in import paths. The game runs in a browser — no Node.js runtime needed.

**When you see `[THINK EXTENDED]`**, that section requires careful reasoning. Pause and think through the design before writing code. These are spots where bugs are likely if you rush.

---

## Visual Theme & Gameplay Vision

**The Vibe:** Imagine a sun-drenched Saturday morning. You're the neighborhood's wildest lawn care hero — armed with an unstoppable trimmer, blazing through overgrown yards like a tiny orange tornado. Gardens haven't been touched in months. Hedges are out of control. The HOA is furious. Only you can save these homes from botanical chaos.

**Color Palette:** Think **Saturday morning cartoon** — nothing subtle. Lawns are *electric lime green* (`#32CD32`), bursting with life. Flowers pop in *hot pink* and *golden yellow*. Hedges are deep *forest green* walls of defiance. Houses have *candy-red* roofs and *warm gray* walls. Cleared ground is a satisfying *warm tan* — proof of your work. Water features shimmer in *royal blue*. The sky background is *bright cerulean*. Everything is bold, flat, and cheerful — like a game board come to life.

**Gameplay Feel:**
- **The Mow:** Walking over tall grass should feel *satisfying* — the bright green tile instantly snaps to clean tan with a crisp scissor-snip sound. You're painting order onto chaos, one tile at a time.
- **Flower Bonus:** Flowers burst with a cheerful *ding!* and award bonus points — like finding coins in the grass. They're scattered rewards that make you explore every corner.
- **Hedge Battle:** Low hedges fight back — they take a moment of sustained contact to trim, rewarding patience with big points and a crunchy *crackle* sound. You feel the resistance.
- **The Maze:** Hedge maze levels flip the script — now the hedges are walls, and you're navigating tight corridors hunting every last blade of grass. It's claustrophobic and thrilling.
- **The Rush:** The countdown timer adds urgency. At 15 seconds it turns *angry red*. The music of snipping and crunching becomes frantic as you race to hit 80%. Making it with seconds to spare is a genuine rush.
- **The Stars:** Three gold stars gleaming on the level select screen. You *earned* those. 100% trimmed, not a blade left standing. Perfection.

**Player Character:** A bright orange square with energy — think of it as a top-down view of someone in a high-vis vest. The direction indicator (a small line extending from the front) shows which way you're facing, like the business end of your trimmer. You're small, fast, and relentless.

**Level Progression Feeling:**
1. **Front Yard** — Easy, breezy, tutorial vibes. "I got this."
2. **Backyard** — Ponds and hedges appear. "Okay, this takes strategy."
3. **Hedge Maze** — Tight corridors, every second counts. "Which way?!"
4. **Neighborhood** — Two yards, double the chaos. "So much grass..."
5. **Grand Garden** — The final boss yard. Water features, dense flower beds, hedge fortresses. "This is my masterpiece."

---

## Tech Stack

- **Phaser 3** via CDN: `https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js`
- **ES Modules** (`<script type="module">`) for all project JS files
- **Procedural textures** via `Phaser.Graphics.generateTexture()` — no image files
- **Web Audio API** for procedural sound effects (later step)
- Target viewport: **390 x 844 pixels** (iPhone portrait, 9:16 aspect ratio)

---

## Project Structure

```
E:/nemo-claw/
  index.html                -- Entry point, loads Phaser CDN then game.js
  game.js                   -- Phaser.Game config, scene registration
  scenes/
    BootScene.js             -- Generates all procedural textures, then starts MenuScene
    MenuScene.js             -- Title screen, level select grid
    GameScene.js             -- Core gameplay: tile rendering, player, trimming, timer
    HUDScene.js              -- Overlay scene: score, timer, trim percentage
    LevelCompleteScene.js    -- End-of-level results, star rating, next button
  levels/
    levelData.js             -- Array of 5 level objects (grid + metadata)
  entities/
    Player.js                -- Player class: movement, facing, physics body
    TileManager.js           -- Tile grid state, queries, trim logic (pure methods)
  utils/
    controls.js              -- Arrow keys + mobile virtual D-pad
    textures.js              -- Helper functions for procedural texture creation
    audio.js                 -- Web Audio procedural sound effects
  tests/
    test.html                -- In-browser test runner (loads Phaser + test files)
    testFramework.js         -- Minimal describe/it/assert framework
    tileManager.test.js      -- TileManager unit tests
    player.test.js           -- Player logic tests
    levelData.test.js        -- Level grid validation tests
    gameScene.test.js        -- Integration tests
```

---

## Game Design Reference

### Tile Types

Every cell in a level grid is an integer 0-9:

| Value | Type | Hex Color | Behavior | Points |
|-------|------|-----------|----------|--------|
| 0 | Cleared ground | `#D2B48C` (tan) | Walkable, already cleared | — |
| 1 | Tall grass | `#32CD32` (lime green) | Trimmable, instant | 10 |
| 2 | Flower/plant | `#FF69B4` (hot pink) | Trimmable, instant | 25 |
| 3 | Low hedge | `#228B22` (forest green) | Trimmable, 300ms hold | 50 |
| 4 | Tall hedge wall | `#0B3B0B` (very dark green) | Impassable, not trimmable | — |
| 5 | House wall | `#808080` (gray) | Impassable | — |
| 6 | House door | `#8B4513` (saddle brown) | Impassable | — |
| 7 | House roof | `#CC3333` (red) | Impassable | — |
| 8 | Path/sidewalk | `#C0C0C0` (silver) | Walkable, no points | — |
| 9 | Water/pond | `#4169E1` (royal blue) | Impassable | — |

### Grid Dimensions
- **TILE_SIZE:** 30 pixels
- **COLS:** 13 (13 × 30 = 390px width)
- **ROWS:** 28 (28 × 30 = 840px height, 4px spare)

### Impassable tile types: `[4, 5, 6, 7, 9]`
### Trimmable tile types: `[1, 2, 3]`

### Controls
- Arrow keys move the player continuously (velocity-based, not grid-snapping)
- Player auto-trims tiles by walking over them
- Grass and flowers clear instantly on overlap
- Low hedges require ~300ms of continuous overlap to clear

### Progression
- 5 levels, each with a `requiredPercent` (default 80%) and `timeLimit` in seconds
- Star rating: 80% trimmed = 1 star, 90% = 2 stars, 100% = 3 stars
- Time bonus: `Math.floor(timeRemaining) * 10` points
- Progress saved to `localStorage`

---

## Step 1: Project Skeleton + Procedural Textures + Test Framework

### Goal
Create the HTML entry point, Phaser boot config, procedural texture generation, and a minimal in-browser test framework. After this step, opening `index.html` shows a sky-blue canvas, and `tests/test.html` runs with zero tests passing.

### Files to Create

#### `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Trim & Tidy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; overflow: hidden; touch-action: none; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
  <script type="module" src="game.js"></script>
</body>
</html>
```

#### `game.js`
- Import BootScene and GameScene
- Create `new Phaser.Game` with:
  - `type: Phaser.AUTO`
  - `width: 390, height: 844`
  - `backgroundColor: '#87CEEB'` (sky blue)
  - `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }`
  - `physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } }`
  - `scene: [BootScene, GameScene]`
- Note: More scenes will be added in later steps

#### `scenes/BootScene.js`
- Export a class extending `Phaser.Scene` with key `'BootScene'`
- In `create()`: call `generateTextures(this)` (imported from `utils/textures.js`)
- Then call `this.scene.start('GameScene')`

#### `utils/textures.js`

**`[THINK EXTENDED]` — Procedural texture generation with Phaser Graphics API:**

Export a function `generateTextures(scene)` that creates textures for each tile type and the player. For each texture:
1. Create a `scene.make.graphics({ add: false })` object
2. Draw colored shapes on it
3. Call `graphics.generateTexture('textureName', width, height)`
4. Call `graphics.destroy()`

Textures to generate (all 30×30 except player which is 24×24):
- `tile_0`: Fill tan `#D2B48C` rectangle
- `tile_1`: Fill lime green `#32CD32` rectangle, then draw a few darker green lines (blades of grass detail)
- `tile_2`: Fill green `#32CD32` background, draw a hot pink `#FF69B4` circle (radius 8) in center, yellow `#FFD700` dot (radius 3) in center of that
- `tile_3`: Fill forest green `#228B22` rectangle, draw lighter green `#2EAA2E` border (2px inset) for depth
- `tile_4`: Fill very dark green `#0B3B0B` rectangle
- `tile_5`: Fill gray `#808080` rectangle, draw darker gray lines for brick pattern
- `tile_6`: Fill saddle brown `#8B4513` rectangle, draw darker brown rectangle inset for door panel, small yellow dot for knob
- `tile_7`: Fill red `#CC3333` rectangle, draw slightly darker diagonal lines for roof shingle pattern
- `tile_8`: Fill silver `#C0C0C0` rectangle, draw slightly lighter lines for sidewalk cracks
- `tile_9`: Fill royal blue `#4169E1` rectangle, draw lighter blue `#6495ED` wavy highlights
- `player`: Fill bright orange `#FF8C00` 24×24 rectangle, draw darker outline

Each texture generation follows the same pattern. Keep the function clean — one helper per texture or a loop with a config array.

#### `scenes/GameScene.js` (placeholder)
- Export a class extending `Phaser.Scene` with key `'GameScene'`
- In `create()`: add a text "Trim & Tidy - Loading..." centered at (195, 422), white color, font `'16px Arial'`
- This is a placeholder — will be replaced in Step 3

#### `tests/testFramework.js`

Export a minimal test framework as a module. It should provide:
- `describe(name, fn)` — groups tests, renders a heading
- `it(name, fn)` — runs a single test, catches exceptions, renders pass/fail
- `assert.equal(actual, expected, msg)` — strict equality check, throws on fail
- `assert.ok(value, msg)` — truthy check
- `assert.deepEqual(actual, expected, msg)` — JSON.stringify comparison
- `runTests()` — triggers all registered describes, writes results to the DOM
- Results rendered as colored text: green for pass, red for fail with error message

Write it to be usable like:
```js
import { describe, it, assert, runTests } from './testFramework.js';
describe('Example', () => {
  it('should pass', () => { assert.equal(1, 1); });
});
runTests();
```

#### `tests/test.html`
```html
<!DOCTYPE html>
<html><head><title>Tests</title>
<style>
  body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #eee; }
  .pass { color: #32CD32; } .fail { color: #FF4444; }
  .describe { font-weight: bold; margin-top: 10px; }
</style>
</head><body>
<h1>Trim & Tidy — Tests</h1>
<div id="results"></div>
<script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
<script type="module" src="./runAll.js"></script>
</body></html>
```

#### `tests/runAll.js`
- Imports and runs all test files (initially empty — just imports testFramework and calls `runTests()`)
- Will import test files as they're created in later steps

### Verification
- Open `index.html` → sky-blue canvas scaled to fit window, text "Trim & Tidy - Loading..." visible
- Open `tests/test.html` → shows "Trim & Tidy — Tests" header, 0 tests (no errors)

---

## Step 2: TileManager + Level 1 Data + Tests

### Goal
Create the TileManager class (pure logic, no Phaser dependency for core methods) and Level 1 grid data. Write tests to validate both.

### Files to Create

#### `entities/TileManager.js`

**`[THINK EXTENDED]` — This is the core game logic class. Design it carefully:**

Export a class `TileManager` with these members:

**Constructor:** `constructor(levelData)`
- Stores a deep copy of `levelData.grid` as `this.grid` (2D array)
- Calculates `this.trimmableTotal` — count of all cells with trimmable types (1, 2, 3)
- Sets `this.trimmedCount = 0`
- Sets `this.score = 0`
- Stores `this.rows` and `this.cols` from grid dimensions
- Creates `this.trimTimers = {}` — object keyed by `"row,col"` for hedge trim progress

**Constants (static or at top of module):**
```js
export const TILE_SIZE = 30;
export const COLS = 13;
export const ROWS = 28;
export const TILE_TYPES = {
  EMPTY: 0, GRASS: 1, FLOWER: 2, HEDGE_LOW: 3, HEDGE_WALL: 4,
  HOUSE_WALL: 5, HOUSE_DOOR: 6, HOUSE_ROOF: 7, PATH: 8, WATER: 9
};
export const TRIMMABLE = [1, 2, 3];
export const IMPASSABLE = [4, 5, 6, 7, 9];
export const POINTS = { 1: 10, 2: 25, 3: 50 };
```

**Methods:**
- `getTile(row, col)` — returns tile type at position, or -1 if out of bounds
- `isTrimmable(row, col)` — returns true if tile type is in TRIMMABLE
- `isImpassable(row, col)` — returns true if tile type is in IMPASSABLE
- `getTrimmablePercent()` — returns `Math.floor((this.trimmedCount / this.trimmableTotal) * 100)`
- `trimTile(row, col)` — if tile is grass (1) or flower (2): set grid[row][col] = 0, increment trimmedCount, add points to score, return `{ cleared: true, points: POINTS[type] }`. If tile is hedge (3): return `{ cleared: false, needsTime: true, timeRequired: 300 }`. If not trimmable: return `{ cleared: false }`.
- `trimHedge(row, col, deltaMs)` — manages timed hedge trimming. Uses `this.trimTimers`. Adds deltaMs to timer for this cell. If accumulated time >= 300, clears the hedge (set to 0, increment count, add points), deletes timer, returns `{ cleared: true, points: 50 }`. Otherwise returns `{ cleared: false, remaining: 300 - accumulated }`.
- `resetHedgeTimer(row, col)` — deletes timer for this cell (called when player moves off)
- `toPixelX(col)` — returns `col * TILE_SIZE`
- `toPixelY(row)` — returns `row * TILE_SIZE`
- `toCol(pixelX)` — returns `Math.floor(pixelX / TILE_SIZE)`
- `toRow(pixelY)` — returns `Math.floor(pixelY / TILE_SIZE)`

#### `levels/levelData.js`

**`[THINK EXTENDED]` — Level 1 grid design. The grid must be 28 rows × 13 cols. Plan the layout on paper first:**

Export an array `levels` containing one level object:

```js
{
  id: 1,
  name: "Front Yard",
  timeLimit: 90,
  requiredPercent: 80,
  playerStart: { col: 6, row: 26 },
  grid: [ /* 28 rows of 13-element arrays */ ]
}
```

**Level 1 "Front Yard" layout guide:**
- Rows 0-1: House roof (7,7,7,7,7,7,7,7,7,7,7,7,7)
- Row 2: House walls with door in center (5,5,5,5,5,6,5,5,5,5,5,5,5) — door at col 5
- Row 3: Path/sidewalk across full width (8,8,8,8,8,8,8,8,8,8,8,8,8)
- Rows 4-6: Mix of grass(1) with a few flowers(2) scattered
- Row 7: Grass with a small pond — cols 9-11 are water(9)
- Rows 8-10: More grass, a couple flowers
- Rows 11-13: Low hedges(3) forming a small garden bed in center (cols 4-8)
- Rows 14-20: Open grass field with occasional flowers
- Rows 21-23: A row of low hedges(3) along bottom area
- Rows 24-26: Grass
- Row 27: Hedge wall border across bottom (4,4,4,4,4,4,4,4,4,4,4,4,4)
- Left column (col 0): All hedge wall (4) from row 4 down
- Right column (col 12): All hedge wall (4) from row 4 down

Make sure `playerStart` position (row 26, col 6) is on a walkable/trimmable tile, not on a wall. Ensure all trimmable tiles are reachable from the player start (no grass locked behind impassable walls).

#### `tests/tileManager.test.js`

Test these scenarios:
1. Constructor correctly counts trimmable tiles
2. `getTile` returns correct types and -1 for out-of-bounds
3. `isTrimmable` returns true for types 1,2,3 and false for others
4. `isImpassable` returns true for types 4,5,6,7,9 and false for others
5. `trimTile` on grass: returns cleared=true with 10 points, tile becomes 0
6. `trimTile` on flower: returns cleared=true with 25 points
7. `trimTile` on hedge: returns needsTime=true
8. `trimHedge` accumulates time and clears at 300ms
9. `getTrimmablePercent` updates correctly after trimming
10. Coordinate conversion methods are correct

#### `tests/levelData.test.js`

Test these:
1. Level 1 grid has exactly 28 rows
2. Every row has exactly 13 columns
3. All cell values are integers 0-9
4. Player start position is not on an impassable tile
5. There is at least 1 trimmable tile

#### `tests/runAll.js`
- Update to import `tileManager.test.js` and `levelData.test.js`

### Verification
- Open `tests/test.html` → all TileManager and levelData tests pass green

---

## Step 3: Tile Rendering in GameScene

### Goal
Replace the placeholder GameScene with real tile rendering using TileManager and the generated textures.

### Files to Modify

#### `scenes/GameScene.js`

**`[THINK EXTENDED]` — Phaser scene lifecycle and sprite management:**

Rewrite GameScene to:

**In `init(data)`:**
- Store `this.levelIndex = data.level || 0`

**In `create()`:**
- Import and instantiate TileManager with `levels[this.levelIndex]`
- Store as `this.tileManager`
- Create a 2D array `this.tileSprites = []`
- Loop through every grid cell. For each cell:
  - Create a sprite: `this.add.image(col * 30, row * 30, 'tile_' + tileType).setOrigin(0, 0)`
  - Store in `this.tileSprites[row][col]`
- Create a `this.impassableGroup = this.physics.add.staticGroup()`
- Loop through grid again. For each impassable tile (types 4,5,6,7,9):
  - Get the sprite from `this.tileSprites[row][col]`
  - Add it to the static group: `this.impassableGroup.add(sprite)`
  - The sprite needs a physics body. Since it was added with `add.image`, convert it or create a separate physics zone

**`[THINK EXTENDED]` — Static physics group with image sprites:**
Phaser's `staticGroup.add()` works with sprites that have physics bodies. Since `add.image` doesn't create a physics body, you have two approaches:
1. Use `this.physics.add.staticImage(x, y, texture)` instead of `this.add.image` for impassable tiles, then add to the group
2. Create all tiles as `this.add.image` for rendering, then for impassable tiles, create invisible physics rectangles in the static group at the same position

Approach 1 is simpler. Use `this.add.image` for walkable tiles, `this.physics.add.staticImage` for impassable tiles. Add the static images to the group. Call `this.impassableGroup.refresh()` after adding all.

### Verification
- Open `index.html` → see Level 1 rendered as a colorful top-down grid: red roof at top, gray house walls, brown door, green grass filling the yard, dark hedge borders, blue pond

---

## Step 4: Player + Movement + Collision + Tests

### Goal
Add the player character that moves with arrow keys and collides with impassable tiles.

### Files to Create

#### `utils/controls.js`

Export a function `setupControls(scene)` that:
- Creates cursor keys: `scene.input.keyboard.createCursorKeys()`
- Returns the cursor object
- (Touch D-pad added in Step 7)

#### `entities/Player.js`

**`[THINK EXTENDED]` — Player physics and movement feel:**

Export a class `Player`:

**Constructor:** `constructor(scene, col, row)`
- Create an arcade physics sprite: `scene.physics.add.sprite(col * 30 + 15, row * 30 + 15, 'player')`
- Store as `this.sprite`
- Set body size: `this.sprite.body.setSize(24, 24)`
- `this.sprite.setCollideWorldBounds(true)`
- `this.speed = 150` (pixels per second)
- `this.facing = 'down'` (direction the player faces)
- `this.currentTile = { row, col }` — tracks which tile center overlaps

**Method:** `update(cursors)`
- Set velocity to 0,0 first
- Check cursors: if left.isDown → velocity.x = -speed, facing = 'left'. Etc for right, up, down
- Only allow one direction at a time (priority: check all four, last assignment wins — OR check in priority order and use else-if)
- Update `this.currentTile`: `{ row: Math.floor(sprite.y / 30), col: Math.floor(sprite.x / 30) }`

**Method:** `getTilePosition()` — returns `this.currentTile`

### Files to Modify

#### `scenes/GameScene.js`

In `create()` (after tile rendering):
- Import Player and controls
- Create player: `this.player = new Player(this, startCol, startRow)`
- Setup controls: `this.cursors = setupControls(this)`
- Add collider: `this.physics.add.collider(this.player.sprite, this.impassableGroup)`

In `update()`:
- Call `this.player.update(this.cursors)`

### Tests

#### `tests/player.test.js`

Test Player logic (without Phaser — test the pure logic parts):
1. `currentTile` calculation from pixel position is correct
2. Speed constant is 150
3. Facing direction tracking logic

Note: Full movement testing requires Phaser running, so keep unit tests focused on pure logic. The real test is opening the game and moving with arrow keys.

### Verification
- Open `index.html` → orange player square at bottom-center of level
- Arrow keys move player smoothly
- Player stops at hedge wall borders, cannot walk through house or water
- All tests pass in `tests/test.html`

---

## Step 5: Trimming Mechanic + HUD + Score

### Goal
Walking over trimmable tiles clears them and awards points. A HUD overlay shows score, percentage, and level name.

### Files to Create

#### `scenes/HUDScene.js`

Export a class extending `Phaser.Scene` with key `'HUDScene'`:

**In `create()`:**
- Set this scene's camera to NOT scroll (it's a fixed overlay)
- Create a semi-transparent black rectangle across the top 36 pixels: `this.add.rectangle(195, 18, 390, 36, 0x000000, 0.5)`
- Create text objects:
  - `this.scoreText` at (10, 8): `'Score: 0'`, white, 14px
  - `this.percentText` at (380, 8): `'0%'`, white, 14px, right-aligned
  - `this.levelText` at (195, 8): level name, white, 14px, center-aligned
- Listen for events from GameScene: `this.scene.get('GameScene').events.on('updateHUD', this.onUpdate, this)`

**Method:** `onUpdate(data)` — updates scoreText, percentText with data.score, data.percent

### Files to Modify

#### `scenes/GameScene.js`

**`[THINK EXTENDED]` — Trim-on-overlap logic in the update loop:**

In `create()`:
- Launch HUD: `this.scene.launch('HUDScene', { levelName: currentLevel.name })`
- Initialize: `this.score = 0`

In `update(time, delta)`:
- After `player.update(cursors)`:
- Get player tile: `const { row, col } = this.player.getTilePosition()`
- Check if tile is trimmable via `this.tileManager.isTrimmable(row, col)`
- If trimmable:
  - Get tile type: `this.tileManager.getTile(row, col)`
  - If grass (1) or flower (2): call `this.tileManager.trimTile(row, col)`. If result.cleared, update the sprite texture: `this.tileSprites[row][col].setTexture('tile_0')`. Update score.
  - If hedge (3): call `this.tileManager.trimHedge(row, col, delta)`. If result.cleared, swap texture.
- If player moved OFF a hedge tile they were on, call `this.tileManager.resetHedgeTimer(prevRow, prevCol)`. Track `this.prevTile` to detect this.
- Emit HUD update: `this.events.emit('updateHUD', { score: this.tileManager.score, percent: this.tileManager.getTrimmablePercent() })`

#### `game.js`
- Import and register HUDScene

### Tests

#### `tests/gameScene.test.js`

Test the trim logic flow using TileManager directly (no Phaser needed):
1. Trimming a grass tile: score increases by 10, tile becomes 0, trimmedCount increases
2. Trimming a flower tile: score increases by 25
3. Hedge trimming: after 300ms accumulated delta, tile clears for 50 points
4. Percentage calculation after trimming several tiles
5. Non-trimmable tiles don't change score

### Verification
- Open `index.html` → walk over green grass with arrow keys → tiles turn tan, score increases in HUD
- Flowers give 25 pts, hedges take a moment to clear (50 pts)
- HUD shows percentage climbing toward 100%
- All tests pass

---

## Step 6: Timer + Level Complete + Menu + Level 2

### Goal
Add countdown timer, level completion/failure, menu screen, and a second level. This completes the full game loop.

### Files to Create

#### `scenes/MenuScene.js`

Export class extending `Phaser.Scene` with key `'MenuScene'`:
- Background: fill with green gradient (or solid bright green `#228B22`)
- Title: "TRIM & TIDY" in large bold white text (32px), centered horizontally at y=200
- Subtitle: "A Lawn Care Adventure" smaller text at y=250
- Play button: A white-bordered rectangle at y=400 with "PLAY" text inside. Use `setInteractive()` with pointer-down handler that calls `this.scene.start('GameScene', { level: 0 })`
- Simple animated decoration: maybe a small rectangle that moves back and forth (mower animation)

#### `scenes/LevelCompleteScene.js`

**`[THINK EXTENDED]` — Scene transition data flow:**

This scene receives data from GameScene when a level ends. It must handle both success and failure.

Export class with key `'LevelCompleteScene'`:

**In `init(data)`:** Store `data` — expects `{ success, levelIndex, score, timeBonus, percent, stars }`

**In `create()`:**
- Stop GameScene and HUDScene: `this.scene.stop('GameScene'); this.scene.stop('HUDScene')`
- Dark background
- If success:
  - Show "Level Complete!" in large green text
  - Show score, time bonus, total
  - Show star rating as "★" characters (yellow for earned, gray for unearned)
  - Show "Next Level" button (or "You Win!" if last level)
  - Save progress to localStorage: `{ unlockedLevel: max(current+1, saved), stars: [...] }`
- If failure:
  - Show "Time's Up!" in red
  - Show "Retry" button → restarts same level
  - Show "Menu" button → returns to MenuScene

**Button handlers:**
- "Next Level": `this.scene.start('GameScene', { level: this.levelIndex + 1 })`
- "Retry": `this.scene.start('GameScene', { level: this.levelIndex })`
- "Menu": `this.scene.start('MenuScene')`

#### `levels/levelData.js` — Add Level 2

**`[THINK EXTENDED]` — Level 2 "Backyard" grid design (28×13):**

Add a second level object:
```js
{
  id: 2,
  name: "Backyard",
  timeLimit: 120,
  requiredPercent: 80,
  playerStart: { col: 6, row: 26 },
  grid: [ /* 28 rows */ ]
}
```

Layout guide for Level 2:
- Top rows: Back of house (walls, no roof visible from back)
- A patio area (path tiles)
- Central area: mix of grass, flowers, low hedges
- A pond (water tiles) in one corner (3×3 block)
- Fence border (hedge walls) on left, right, and bottom
- More low hedges than Level 1 — requires more trimming effort
- Ensure player start is reachable and all trimmable tiles are accessible

### Files to Modify

#### `scenes/GameScene.js`

Add timer logic:

**In `create()`:**
- `this.timeRemaining = currentLevel.timeLimit`
- `this.requiredPercent = currentLevel.requiredPercent`
- `this.levelComplete = false`

**In `update(time, delta)`:**
- If `this.levelComplete` return early
- Decrement timer: `this.timeRemaining -= delta / 1000`
- Emit timer to HUD: include `timeRemaining` in updateHUD event
- Check win: if `percent >= requiredPercent`:
  - Set `this.levelComplete = true`
  - Calculate time bonus, stars
  - Start LevelCompleteScene with success data
- Check lose: if `timeRemaining <= 0`:
  - Set `this.levelComplete = true`
  - Start LevelCompleteScene with failure data

#### `scenes/HUDScene.js`
- Display timer as `MM:SS` format, update from event data
- Timer text turns red when < 15 seconds

#### `scenes/BootScene.js`
- Change to start `'MenuScene'` instead of `'GameScene'`

#### `game.js`
- Register MenuScene and LevelCompleteScene

### Verification
- Open `index.html` → Menu with "TRIM & TIDY" title and Play button
- Click Play → Level 1 starts with timer counting down
- Trim 80%+ of tiles → Level Complete screen with stars and score
- Click "Next Level" → Level 2 loads
- Let timer expire → "Time's Up" with Retry option
- `tests/test.html` → all tests still pass

---

## Step 7: Touch Controls + Mobile Polish + Audio

### Goal
Make the game fully playable on mobile with a virtual D-pad. Add visual feedback for trimming and procedural sound effects.

### Files to Create

#### `utils/audio.js`

Export an object with methods for procedural sounds using Web Audio API:

```js
let ctx = null;
function getContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}
```

- `playSnip()` — short white noise burst (50ms) through a bandpass filter at 2000Hz. Sounds like scissors/grass cut.
- `playCrunch()` — lower noise burst (100ms) through bandpass at 500Hz. Sounds like cutting through hedge.
- `playDing()` — sine wave oscillator at 800Hz, 100ms, quick gain fadeout. Flower bonus sound.
- `playComplete()` — ascending three-note melody (C5, E5, G5, each 150ms). Level complete.
- `playFail()` — descending two-note (G4, C4, each 200ms). Time's up.

**`[THINK EXTENDED]` — Web Audio noise generation:**
For white noise: create an AudioBuffer, fill with random values (-1 to 1), play through a BiquadFilterNode (bandpass). Apply a GainNode envelope that ramps to 0 over the duration.

### Files to Modify

#### `utils/controls.js`

**`[THINK EXTENDED]` — Virtual D-pad implementation:**

Expand to detect touch and render a D-pad:

`setupControls(scene)` now:
1. Creates cursor keys (keyboard) as before
2. Checks `scene.sys.game.device.input.touch`
3. If touch available, creates a virtual D-pad:
   - A container positioned at bottom-center (x=195, y=740)
   - Four arrow buttons arranged in a cross pattern (up/down/left/right)
   - Each button is a semi-transparent circle or rounded-rect with an arrow triangle inside
   - `setAlpha(0.4)`, `setInteractive()`, `setScrollFactor(0)` (fixed to camera)
   - On `pointerdown`: set a direction flag (`controls.touchLeft = true`)
   - On `pointerup` and `pointerout`: clear the flag
4. Returns an object: `{ cursors, touch: { left, right, up, down } }`

Update `Player.update` to accept this combined controls object and check both keyboard and touch state.

#### `entities/Player.js`
- Accept combined controls (keyboard + touch flags)
- Check: `if (cursors.left.isDown || touch.left)` etc.
- Add a direction indicator: a small Graphics line extending 10px from player center in facing direction (update each frame)

#### `scenes/GameScene.js`
- On tile trim: play appropriate sound from `audio.js`
- On tile trim: add a quick scale tween on the old tile sprite (1.0 → 0.8 → set texture → 1.0) over 100ms
- On hedge trim: subtle camera shake (1px, 50ms)

#### `scenes/BootScene.js`
- Generate D-pad textures if needed

### Verification
- Open in Chrome DevTools with iPhone device simulation
- D-pad appears at bottom of screen
- Tapping D-pad arrows moves the player
- Trimming plays satisfying audio and visual effects
- No scrolling or zooming on touch
- Keyboard still works on desktop

---

## Step 8: Levels 3-5 + Level Select + Final Polish

### Goal
Complete the game with all 5 levels, a level select screen, and final polish.

### Files to Modify

#### `levels/levelData.js`

**`[THINK EXTENDED]` — Design 3 more level grids (each 28×13). Each must be solvable — all trimmable tiles reachable from playerStart via walkable/trimmable tiles:**

**Level 3: "Hedge Maze"**
- Maze walls made of tall hedges (type 4)
- Corridors filled with grass (1) and low hedges (3)
- Tighter time limit (75 seconds)
- Player starts at bottom-left
- Maze should have branching paths and dead ends (but all reachable)

**Level 4: "Neighborhood"**
- Two houses side by side (top-left and top-right)
- Shared yard in center
- Path connecting the houses
- Mix of all trimmable types
- Time limit: 100 seconds

**Level 5: "Grand Garden"**
- Complex layout: water features, multiple hedge sections, flower gardens
- Largest variety of obstacles
- Generous time (150s) but requires 90% trim to complete
- Satisfying finale level

#### `scenes/MenuScene.js`

Add level select:
- Below the Play button, show a vertical list of 5 level buttons
- Each button shows: level number, name, star rating (if completed)
- Locked levels appear grayed out with a lock symbol
- Read progress from localStorage
- Tapping an unlocked level starts it directly

#### `scenes/GameScene.js` and other scenes
- Add camera fade transitions: `fadeOut(300)` on exit, `fadeIn(300)` on enter
- Handle pause when tab loses focus: `this.game.events.on('blur', ...)` — pause physics and timer
- Resume on focus

#### `tests/levelData.test.js`
- Update to validate all 5 levels
- Add flood-fill reachability test: from playerStart, BFS through walkable+trimmable tiles — assert all trimmable tiles are visited

### Final Verification Checklist
1. `index.html` — game loads, menu appears with title and level select
2. All 5 levels playable start to finish
3. Star ratings display correctly on level select
4. Progress persists across browser refreshes (localStorage)
5. `tests/test.html` — ALL tests pass green
6. Mobile simulation — D-pad works, portrait layout correct
7. Sound effects play on trim actions
8. Timer works, level complete/failure flows work
9. Scene transitions are smooth (fade in/out)

---

## Important Reminders for the Agent

1. **File size limit:** Keep every `.js` file under 150 lines. If approaching the limit, extract logic into a utility module.
2. **ES Modules:** All project files use `export`/`import`. Phaser is a global (loaded via `<script>` tag before modules).
3. **No npm/node:** This runs entirely in the browser. No `require()`, no `package.json`, no build step.
4. **Test after each step:** Run the tests mentally or note what should pass. Tests are critical for catching regressions.
5. **Grid dimensions:** Always 13 cols × 28 rows. Every level grid must match exactly.
6. **Phaser version:** Use Phaser 3 API. Key classes: `Phaser.Scene`, `Phaser.Physics.Arcade`, `Phaser.GameObjects.Image/Sprite/Graphics/Text`.
7. **`[THINK EXTENDED]` sections:** These require careful design thinking. Don't rush through them — they mark where subtle bugs tend to appear.
