import { describe, it, assert } from './testFramework.js';
import TileManager, { TILE_SIZE, COLS, ROWS, TRIMMABLE, IMPASSABLE, POINTS }
  from '../entities/TileManager.js';
import { levels } from '../levels/levelData.js';

const makeTM = () => new TileManager(levels[0]);

describe('TileManager - Constructor', () => {
  it('counts trimmable tiles correctly', () => {
    const tm = makeTM();
    let count = 0;
    for (const row of levels[0].grid) {
      for (const cell of row) {
        if (TRIMMABLE.includes(cell)) count++;
      }
    }
    assert.equal(tm.trimmableTotal, count);
    assert.ok(tm.trimmableTotal > 0, 'should have trimmable tiles');
  });
});

describe('TileManager - getTile', () => {
  it('returns correct tile type', () => {
    const tm = makeTM();
    assert.equal(tm.getTile(0, 0), 7); // roof
    assert.equal(tm.getTile(3, 0), 8); // path
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
    const tm = makeTM();
    // Find a grass tile
    assert.ok(TRIMMABLE.includes(1));
    assert.ok(TRIMMABLE.includes(2));
    assert.ok(TRIMMABLE.includes(3));
    assert.ok(!TRIMMABLE.includes(0));
    assert.ok(!TRIMMABLE.includes(4));
  });

  it('identifies impassable types', () => {
    assert.ok(IMPASSABLE.includes(4));
    assert.ok(IMPASSABLE.includes(5));
    assert.ok(IMPASSABLE.includes(6));
    assert.ok(IMPASSABLE.includes(7));
    assert.ok(IMPASSABLE.includes(9));
    assert.ok(!IMPASSABLE.includes(0));
    assert.ok(!IMPASSABLE.includes(1));
    assert.ok(!IMPASSABLE.includes(8));
  });
});

describe('TileManager - trimTile', () => {
  it('trims grass for 10 points', () => {
    const tm = makeTM();
    // row 4 col 1 is grass (1)
    const result = tm.trimTile(4, 1);
    assert.equal(result.cleared, true);
    assert.equal(result.points, 10);
    assert.equal(tm.getTile(4, 1), 0);
    assert.equal(tm.score, 10);
    assert.equal(tm.trimmedCount, 1);
  });

  it('trims flower for 25 points', () => {
    const tm = makeTM();
    // row 4 col 3 is flower (2)
    const result = tm.trimTile(4, 3);
    assert.equal(result.cleared, true);
    assert.equal(result.points, 25);
    assert.equal(tm.score, 25);
  });

  it('returns needsTime for hedge', () => {
    const tm = makeTM();
    // row 11 col 4 is hedge (3)
    const result = tm.trimTile(11, 4);
    assert.equal(result.cleared, false);
    assert.ok(result.needsTime);
    assert.equal(result.timeRequired, 300);
  });

  it('returns cleared=false for non-trimmable', () => {
    const tm = makeTM();
    const result = tm.trimTile(0, 0); // roof
    assert.equal(result.cleared, false);
  });
});

describe('TileManager - trimHedge', () => {
  it('accumulates time and clears at 300ms', () => {
    const tm = makeTM();
    // row 11 col 4 is hedge (3)
    let result = tm.trimHedge(11, 4, 100);
    assert.equal(result.cleared, false);
    assert.equal(result.remaining, 200);

    result = tm.trimHedge(11, 4, 100);
    assert.equal(result.cleared, false);
    assert.equal(result.remaining, 100);

    result = tm.trimHedge(11, 4, 100);
    assert.equal(result.cleared, true);
    assert.equal(result.points, 50);
    assert.equal(tm.getTile(11, 4), 0);
  });

  it('resets timer on resetHedgeTimer', () => {
    const tm = makeTM();
    tm.trimHedge(11, 4, 200);
    tm.resetHedgeTimer(11, 4);
    const result = tm.trimHedge(11, 4, 100);
    assert.equal(result.cleared, false);
    assert.equal(result.remaining, 200);
  });
});

describe('TileManager - getTrimmablePercent', () => {
  it('starts at 0%', () => {
    const tm = makeTM();
    assert.equal(tm.getTrimmablePercent(), 0);
  });

  it('updates after trimming', () => {
    const tm = makeTM();
    tm.trimTile(4, 1); // trim one grass
    assert.ok(tm.getTrimmablePercent() >= 0);
    assert.ok(tm.trimmedCount === 1);
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
});
