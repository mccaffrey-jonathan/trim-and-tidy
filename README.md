# Trim & Tidy

A tile-based lawn care game where you race against the clock to trim overgrown yards. Navigate your character across a grid, mowing grass, clipping flowers, and battling stubborn hedges — all before time runs out.

## Play Instantly

No install required. Download [`trim-and-tidy-vite.html`](trim-and-tidy-vite.html) and open it in any modern browser. The entire game is bundled into a single 24KB HTML file.

## How to Play

**Goal:** Trim at least 80% of trimmable tiles before the timer runs out.

| Tile | Points | Notes |
|------|--------|-------|
| Grass | 10 | Clears instantly on contact |
| Flower | 25 | Clears instantly, bonus points |
| Low Hedge | 50 | Hold position for ~300ms to cut |

**Controls:**
- **Desktop:** Arrow keys to move, Space to activate Turbo
- **Mobile:** Virtual joystick (default) or D-pad — toggle with the button in the bottom-right corner

**Turbo ability:** Trimming tiles charges your meter. At 100%, activate Turbo for 3 seconds of double speed and a 3×3 area trim. Great for dense hedge clusters.

**Star ratings:** 1 star = 80%, 2 stars = 90%, 3 stars = 100% trimmed.

## Levels

1. **Front Yard** — Easy intro. Get your bearings.
2. **Backyard** — Ponds and hedges. Requires strategy.
3. **Hedge Maze** — Tight corridors. Every second counts.
4. **Neighborhood** — Two yards, double the chaos.
5. **Grand Garden** — Water features, flower beds, hedge fortresses. 90% required.

Progress and star ratings are saved in `localStorage`.

## Dev Setup

```bash
npm install
npm run dev      # Start local dev server
npm run build    # Build single-file HTML to dist/
```

Requires Node.js. The game also runs directly from `index.html` via any static file server (Phaser 3 is loaded from CDN).

## Project Structure

```
index.html              # Entry point
game.js                 # Phaser config + scene registration
scenes/
  BootScene.js          # Texture generation → MenuScene
  MenuScene.js          # Level select, progress display
  GameScene.js          # Main gameplay loop
  HUDScene.js           # Score, timer, completion % overlay
  LevelCompleteScene.js # Results, star rating, progress save
entities/
  Player.js             # Movement, turbo ability, charge system
  TileManager.js        # Grid state, trimming mechanics, scoring
levels/
  levelData.js          # Levels 1–2
  levelsAdvanced.js     # Levels 3–5
utils/
  controls.js           # Keyboard + touch input (joystick/D-pad)
  textures.js           # Procedural sprite generation
  audio.js              # Web Audio API sound effects
  trimHelper.js         # Turbo area trim logic
tests/
  test.html             # In-browser test runner
  *.test.js             # Unit and integration tests
```

## Tech Stack

- **[Phaser 3](https://phaser.io/)** — game engine (loaded via CDN)
- **[Vite](https://vite.dev/) + [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile)** — single-file build
- **Web Audio API** — procedural sound effects (no audio assets)
- **localStorage** — progress persistence

All graphics are procedurally generated — zero image assets.

## Tests

Open `tests/test.html` in a browser. Tests cover tile trimming logic, level grid validation, player movement, and turbo mechanics.

## License

MIT — see [LICENSE](LICENSE).
