import { describe, it, assert } from './testFramework.js';
import TileManager, { TILE_SIZE, TRIMMABLE, IMPASSABLE }
  from '../entities/TileManager.js';
import { levels } from '../levels/levelData.js';

const makeTM = () => new TileManager(levels[0]);

describe('TileManager - Constructor', () => {
  it('counts trimmable tiles correctly', () => {
    const tm = makeTM();
    let count = 0;
    for (const row of levels[0].grid)
      for (const cell of row)
        if (TRIMMABLE.includes(cell)) count++;
    assert.equal(tm.trimmableTotal, count);
    assert.ok(tm.trimmableTotal > 0);
  });

  it('deep copies grid (source unaffected)', () => {
    const tm = makeTM();
    tm.grid[4][1] = 0;
    assert.equal(levels[0].grid[4][1], 1);
  });
});

describe('TileManager - getTile', () => {
  it('returns correct tile type', () => {
    const tm = makeTM();
    assert.equal(tm.getTile(0, 0), 7);
    assert.equal(tm.getTile(3, 0), 8);
  });
  it('returns -1 for out of bounds', () => {
    const tm = makeTM();
    assert.equal(tm.getTile(-1, 0), -1);
    assert.equal(tm.getTile(0, -1), -1);
    assert.equal(tm.getTile(99, 0), -1);
    assert.equal(tm.getTile(0, 99), -1);
  });
});

describe('TileManager - isTrimmable / isImpassable', () => {
  it('identifies trimmable types', () => {
    for (const t of [1,2,3]) assert.ok(TRIMMABLE.includes(t));
    for (const t of [0,4,8]) assert.ok(!TRIMMABLE.includes(t));
  });
  it('identifies impassable types', () => {
    for (const t of [4,5,6,7,9]) assert.ok(IMPASSABLE.includes(t));
    for (const t of [0,1,8]) assert.ok(!IMPASSABLE.includes(t));
  });
  it('out-of-bounds is neither', () => {
    const tm = makeTM();
    assert.equal(tm.isTrimmable(-1, 0), false);
    assert.equal(tm.isImpassable(-1, 0), false);
  });
});

describe('TileManager - trimTile', () => {
  it('trims grass for 10 points', () => {
    const tm = makeTM();
    const r = tm.trimTile(4, 1);
    assert.equal(r.cleared, true);
    assert.equal(r.points, 10);
    assert.equal(tm.getTile(4, 1), 0);
    assert.equal(tm.score, 10);
  });
  it('trims flower for 25 points', () => {
    const tm = makeTM();
    const r = tm.trimTile(4, 3);
    assert.equal(r.points, 25);
  });
  it('returns needsTime for hedge', () => {
    const tm = makeTM();
    const r = tm.trimTile(11, 4);
    assert.equal(r.cleared, false);
    assert.ok(r.needsTime);
  });
  it('returns cleared=false for non-trimmable', () => {
    assert.equal(makeTM().trimTile(0, 0).cleared, false);
  });
  it('double-trimming same tile has no effect', () => {
    const tm = makeTM();
    tm.trimTile(4, 1);
    const r = tm.trimTile(4, 1);
    assert.equal(r.cleared, false);
    assert.equal(tm.trimmedCount, 1);
  });
});

describe('TileManager - trimHedge', () => {
  it('accumulates time and clears at 300ms', () => {
    const tm = makeTM();
    tm.trimHedge(11, 4, 100);
    tm.trimHedge(11, 4, 100);
    const r = tm.trimHedge(11, 4, 100);
    assert.equal(r.cleared, true);
    assert.equal(r.points, 50);
  });
  it('resets timer on resetHedgeTimer', () => {
    const tm = makeTM();
    tm.trimHedge(11, 4, 200);
    tm.resetHedgeTimer(11, 4);
    assert.equal(tm.trimHedge(11, 4, 100).remaining, 200);
  });
  it('returns cleared=false for non-hedge', () => {
    assert.equal(makeTM().trimHedge(4, 1, 500).cleared, false);
  });
  it('clears in one call if delta >= 300', () => {
    assert.equal(makeTM().trimHedge(11, 4, 300).cleared, true);
  });
});

describe('TileManager - forceTrimHedge', () => {
  it('instantly clears hedge for 50 pts', () => {
    const tm = makeTM();
    const r = tm.forceTrimHedge(11, 4);
    assert.equal(r.cleared, true);
    assert.equal(r.points, 50);
    assert.equal(tm.getTile(11, 4), 0);
  });
  it('returns cleared=false for non-hedge', () => {
    assert.equal(makeTM().forceTrimHedge(4, 1).cleared, false);
  });
  it('cleans up existing trim timer', () => {
    const tm = makeTM();
    tm.trimHedge(11, 4, 100);
    tm.forceTrimHedge(11, 4);
    assert.equal(tm.getTile(11, 4), 0);
  });
});

describe('TileManager - getTrimmablePercent', () => {
  it('starts at 0%', () => {
    assert.equal(makeTM().getTrimmablePercent(), 0);
  });
  it('reaches 100% when all trimmed', () => {
    const tm = makeTM();
    for (let r = 0; r < tm.rows; r++)
      for (let c = 0; c < tm.cols; c++)
        if (tm.isTrimmable(r, c)) {
          if (tm.getTile(r, c) === 3) tm.forceTrimHedge(r, c);
          else tm.trimTile(r, c);
        }
    assert.equal(tm.getTrimmablePercent(), 100);
  });
  it('returns 100 for empty level', () => {
    assert.equal(new TileManager({ grid: [[0,0],[0,0]] }).getTrimmablePercent(), 100);
  });
});

describe('TileManager - coordinate conversion', () => {
  it('converts correctly', () => {
    const tm = makeTM();
    assert.equal(tm.toPixelX(3), 90);
    assert.equal(tm.toPixelY(2), 60);
    assert.equal(tm.toCol(95), 3);
    assert.equal(tm.toRow(65), 2);
  });
  it('handles boundaries', () => {
    const tm = makeTM();
    assert.equal(tm.toCol(0), 0);
    assert.equal(tm.toCol(29), 0);
    assert.equal(tm.toCol(30), 1);
  });
});
