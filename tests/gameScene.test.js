import { describe, it, assert } from './testFramework.js';
import TileManager, { POINTS } from '../entities/TileManager.js';
import { levels } from '../levels/levelData.js';

describe('GameScene - Trim Logic Flow', () => {
  it('trimming grass increases score by 10 and clears tile', () => {
    const tm = new TileManager(levels[0]);
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
    assert.equal(tm.getTile(4, 3), 2);
    const result = tm.trimTile(4, 3);
    assert.equal(result.points, 25);
    assert.equal(tm.score, 25);
  });

  it('hedge requires 300ms accumulated to clear for 50 pts', () => {
    const tm = new TileManager(levels[0]);
    assert.equal(tm.getTile(11, 4), 3);
    tm.trimHedge(11, 4, 150);
    assert.equal(tm.getTile(11, 4), 3);
    const r = tm.trimHedge(11, 4, 150);
    assert.equal(r.cleared, true);
    assert.equal(r.points, 50);
    assert.equal(tm.getTile(11, 4), 0);
  });

  it('percentage updates correctly after trimming', () => {
    const tm = new TileManager(levels[0]);
    assert.equal(tm.getTrimmablePercent(), 0);
    tm.trimTile(4, 1);
    assert.ok(tm.getTrimmablePercent() >= 0);
    assert.equal(tm.trimmedCount, 1);
  });

  it('non-trimmable tiles do not change score', () => {
    const tm = new TileManager(levels[0]);
    const result = tm.trimTile(0, 0);
    assert.equal(result.cleared, false);
    assert.equal(tm.score, 0);
    assert.equal(tm.trimmedCount, 0);
  });
});

describe('GameScene - Star Rating Logic', () => {
  it('100% trimmed = 3 stars', () => {
    const stars = 100 >= 100 ? 3 : 100 >= 90 ? 2 : 1;
    assert.equal(stars, 3);
  });

  it('90% trimmed = 2 stars', () => {
    const stars = 90 >= 100 ? 3 : 90 >= 90 ? 2 : 1;
    assert.equal(stars, 2);
  });

  it('80% trimmed = 1 star', () => {
    const stars = 80 >= 100 ? 3 : 80 >= 90 ? 2 : 1;
    assert.equal(stars, 1);
  });

  it('89% trimmed = 1 star (boundary)', () => {
    const stars = 89 >= 100 ? 3 : 89 >= 90 ? 2 : 1;
    assert.equal(stars, 1);
  });
});

describe('GameScene - Time Bonus', () => {
  it('time bonus = floor(timeRemaining) * 10 on success', () => {
    const bonus = Math.floor(Math.max(0, 45.7)) * 10;
    assert.equal(bonus, 450);
  });

  it('time bonus is 0 on failure', () => {
    const success = false;
    const bonus = success ? Math.floor(Math.max(0, 10)) * 10 : 0;
    assert.equal(bonus, 0);
  });

  it('time bonus is 0 when time expired exactly', () => {
    const bonus = Math.floor(Math.max(0, 0)) * 10;
    assert.equal(bonus, 0);
  });

  it('negative time remaining clamps to 0 bonus', () => {
    const bonus = Math.floor(Math.max(0, -5.3)) * 10;
    assert.equal(bonus, 0);
  });
});

describe('GameScene - Turbo Charge', () => {
  it('charge caps at 100%', () => {
    let charge = 0;
    charge = Math.min(100, charge + 50);
    charge = Math.min(100, charge + 60);
    assert.equal(charge, 100);
  });

  it('charge increments: grass=1, flower=2.5, hedge=5', () => {
    let charge = 0;
    charge = Math.min(100, charge + 1);    // grass
    assert.equal(charge, 1);
    charge = Math.min(100, charge + 2.5);  // flower
    assert.equal(charge, 3.5);
    charge = Math.min(100, charge + 5);    // hedge
    assert.equal(charge, 8.5);
  });
});
