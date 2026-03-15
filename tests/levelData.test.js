import { describe, it, assert } from './testFramework.js';
import { levels } from '../levels/levelData.js';
import { IMPASSABLE, TRIMMABLE } from '../entities/TileManager.js';

function floodFill(grid, startRow, startCol) {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set();
  const queue = [[startRow, startCol]];
  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited.has(key)) continue;
      if (IMPASSABLE.includes(grid[nr][nc])) continue;
      visited.add(key);
      queue.push([nr, nc]);
    }
  }
  return visited;
}

levels.forEach((level, idx) => {
  describe(`Level ${level.id}: ${level.name}`, () => {
    it('grid has exactly 28 rows', () => {
      assert.equal(level.grid.length, 28);
    });

    it('every row has exactly 13 columns', () => {
      for (let r = 0; r < level.grid.length; r++) {
        assert.equal(level.grid[r].length, 13,
          `Row ${r} has ${level.grid[r].length} cols`);
      }
    });

    it('all cell values are integers 0-9', () => {
      for (let r = 0; r < level.grid.length; r++) {
        for (let c = 0; c < level.grid[r].length; c++) {
          const v = level.grid[r][c];
          assert.ok(Number.isInteger(v) && v >= 0 && v <= 9,
            `Invalid value ${v} at [${r}][${c}]`);
        }
      }
    });

    it('player start is not on an impassable tile', () => {
      const { row, col } = level.playerStart;
      const tile = level.grid[row][col];
      assert.ok(!IMPASSABLE.includes(tile),
        `Player on impassable type ${tile}`);
    });

    it('has trimmable tiles', () => {
      let count = 0;
      for (const row of level.grid) {
        for (const cell of row) {
          if (TRIMMABLE.includes(cell)) count++;
        }
      }
      assert.ok(count > 0);
    });

    it('all trimmable tiles are reachable from player start', () => {
      const { row, col } = level.playerStart;
      const visited = floodFill(level.grid, row, col);

      for (let r = 0; r < level.grid.length; r++) {
        for (let c = 0; c < level.grid[r].length; c++) {
          if (TRIMMABLE.includes(level.grid[r][c])) {
            assert.ok(visited.has(`${r},${c}`),
              `Unreachable trimmable at [${r}][${c}]`);
          }
        }
      }
    });
  });
});
