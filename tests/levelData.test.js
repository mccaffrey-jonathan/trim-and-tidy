import { describe, it, assert } from './testFramework.js';
import { levels } from '../levels/levelData.js';
import { IMPASSABLE } from '../entities/TileManager.js';

describe('Level Data - Level 1', () => {
  const level = levels[0];

  it('grid has exactly 28 rows', () => {
    assert.equal(level.grid.length, 28);
  });

  it('every row has exactly 13 columns', () => {
    for (let r = 0; r < level.grid.length; r++) {
      assert.equal(level.grid[r].length, 13,
        `Row ${r} has ${level.grid[r].length} cols, expected 13`);
    }
  });

  it('all cell values are integers 0-9', () => {
    for (let r = 0; r < level.grid.length; r++) {
      for (let c = 0; c < level.grid[r].length; c++) {
        const v = level.grid[r][c];
        assert.ok(Number.isInteger(v) && v >= 0 && v <= 9,
          `Invalid value ${v} at row ${r}, col ${c}`);
      }
    }
  });

  it('player start is not on an impassable tile', () => {
    const { row, col } = level.playerStart;
    const tile = level.grid[row][col];
    assert.ok(!IMPASSABLE.includes(tile),
      `Player starts on impassable tile type ${tile}`);
  });

  it('has at least 1 trimmable tile', () => {
    let count = 0;
    for (const row of level.grid) {
      for (const cell of row) {
        if ([1, 2, 3].includes(cell)) count++;
      }
    }
    assert.ok(count > 0, `No trimmable tiles found`);
  });
});
