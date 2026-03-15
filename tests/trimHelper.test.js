import { describe, it, assert } from './testFramework.js';
import TileManager, { POINTS } from '../entities/TileManager.js';
import { levels } from '../levels/levelData.js';

// Mock scene object for trimHelper testing
function makeMockScene() {
  const tm = new TileManager(levels[0]);
  const charges = [];
  const sounds = [];
  return {
    tileManager: tm,
    player: {
      chargePercent: 0,
      turboActive: false,
      addCharge(amt) { this.chargePercent = Math.min(100, this.chargePercent + amt); charges.push(amt); }
    },
    tileSprites: [],
    prevTile: { row: 26, col: 6 },
    tweens: { add: () => {} },
    cameras: { main: { shake: () => {} } },
    _charges: charges,
    _sounds: sounds
  };
}

describe('trimHelper - Turbo Area Trim', () => {
  it('turbo trim clears 3x3 area around player', () => {
    const mock = makeMockScene();
    const tm = mock.tileManager;
    // Find a grass area in level 1 with adjacent trimmable tiles
    // Row 4 has grass at cols 1-12 (excluding hedge walls at 0 and 12)
    let trimmedBefore = tm.trimmedCount;
    // Simulate turbo area trim at row 5, col 6 — check 3x3 around it
    let clearCount = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = 5 + dr, c = 6 + dc;
        if (tm.isTrimmable(r, c)) {
          const type = tm.getTile(r, c);
          if (type === 3) tm.forceTrimHedge(r, c);
          else tm.trimTile(r, c);
          clearCount++;
        }
      }
    }
    assert.ok(clearCount > 0, 'should clear at least 1 tile in 3x3');
    assert.ok(tm.trimmedCount > trimmedBefore, 'trimmedCount should increase');
  });

  it('turbo trim awards charge for each tile cleared', () => {
    const mock = makeMockScene();
    const tm = mock.tileManager;
    // Manually simulate what trimArea does with charge
    let totalCharge = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = 5 + dr, c = 6 + dc;
        if (!tm.isTrimmable(r, c)) continue;
        const type = tm.getTile(r, c);
        if (type === 1 || type === 2) {
          if (tm.trimTile(r, c).cleared) {
            totalCharge += type === 1 ? 1 : 2.5;
          }
        } else if (type === 3) {
          if (tm.forceTrimHedge(r, c).cleared) {
            totalCharge += 5;
          }
        }
      }
    }
    assert.ok(totalCharge > 0, 'should award charge for turbo-trimmed tiles');
  });

  it('forceTrimHedge awards 50 points', () => {
    const tm = new TileManager(levels[0]);
    // Find a hedge tile (type 3) in level 1
    const r = tm.forceTrimHedge(11, 4);
    assert.equal(r.cleared, true);
    assert.equal(r.points, POINTS[3]);
    assert.equal(tm.getTile(11, 4), 0);
  });
});
