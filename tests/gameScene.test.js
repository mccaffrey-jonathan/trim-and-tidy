import { describe, it, assert } from './testFramework.js';
import TileManager, { POINTS } from '../entities/TileManager.js';
import { levels } from '../levels/levelData.js';

describe('GameScene - Trim Logic Flow', () => {
  it('trimming grass increases score by 10 and clears tile', () => {
    const tm = new TileManager(levels[0]);
    // row 4, col 1 is grass
    assert.equal(tm.getTile(4, 1), 1);
    const result = tm.trimTile(4, 1);
    assert.equal(result.cleared, true);
    assert.equal(result.points, 10);
    assert.equal(tm.score, 10);
    assert.equal(tm.getTile(4, 1), 0);
    assert.equal(tm.trimmedCount, 1);
  });

  it('trimming flower increases score by 25', () => {
    const tm = new TileManager(levels[0]);
    // row 4, col 3 is flower
    assert.equal(tm.getTile(4, 3), 2);
    const result = tm.trimTile(4, 3);
    assert.equal(result.points, 25);
    assert.equal(tm.score, 25);
  });

  it('hedge requires 300ms accumulated to clear for 50 pts', () => {
    const tm = new TileManager(levels[0]);
    // row 11, col 4 is hedge
    assert.equal(tm.getTile(11, 4), 3);
    tm.trimHedge(11, 4, 150);
    assert.equal(tm.getTile(11, 4), 3); // not yet
    const r = tm.trimHedge(11, 4, 150);
    assert.equal(r.cleared, true);
    assert.equal(r.points, 50);
    assert.equal(tm.getTile(11, 4), 0);
  });

  it('percentage updates correctly after trimming', () => {
    const tm = new TileManager(levels[0]);
    const initial = tm.getTrimmablePercent();
    assert.equal(initial, 0);
    tm.trimTile(4, 1);
    assert.ok(tm.getTrimmablePercent() >= 0);
    assert.equal(tm.trimmedCount, 1);
  });

  it('non-trimmable tiles do not change score', () => {
    const tm = new TileManager(levels[0]);
    const result = tm.trimTile(0, 0); // roof tile
    assert.equal(result.cleared, false);
    assert.equal(tm.score, 0);
    assert.equal(tm.trimmedCount, 0);
  });
});
