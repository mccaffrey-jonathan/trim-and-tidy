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

export default class TileManager {
  constructor(levelData) {
    this.grid = levelData.grid.map(row => [...row]);
    this.rows = this.grid.length;
    this.cols = this.grid[0].length;
    this.trimmedCount = 0;
    this.score = 0;
    this.trimTimers = {};

    this.trimmableTotal = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (TRIMMABLE.includes(this.grid[r][c])) this.trimmableTotal++;
      }
    }
  }

  getTile(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return -1;
    return this.grid[row][col];
  }

  isTrimmable(row, col) {
    return TRIMMABLE.includes(this.getTile(row, col));
  }

  isImpassable(row, col) {
    return IMPASSABLE.includes(this.getTile(row, col));
  }

  getTrimmablePercent() {
    if (this.trimmableTotal === 0) return 100;
    return Math.floor((this.trimmedCount / this.trimmableTotal) * 100);
  }

  trimTile(row, col) {
    const type = this.getTile(row, col);
    if (!TRIMMABLE.includes(type)) return { cleared: false };
    if (type === 3) return { cleared: false, needsTime: true, timeRequired: 300 };

    this.grid[row][col] = 0;
    this.trimmedCount++;
    this.score += POINTS[type];
    return { cleared: true, points: POINTS[type] };
  }

  trimHedge(row, col, deltaMs) {
    if (this.getTile(row, col) !== 3) return { cleared: false };
    const key = `${row},${col}`;
    const accumulated = (this.trimTimers[key] || 0) + deltaMs;

    if (accumulated >= 300) {
      this.grid[row][col] = 0;
      this.trimmedCount++;
      this.score += POINTS[3];
      delete this.trimTimers[key];
      return { cleared: true, points: 50 };
    }

    this.trimTimers[key] = accumulated;
    return { cleared: false, remaining: 300 - accumulated };
  }

  forceTrimHedge(row, col) {
    if (this.getTile(row, col) !== 3) return { cleared: false };
    this.grid[row][col] = 0;
    this.trimmedCount++;
    this.score += POINTS[3];
    delete this.trimTimers[`${row},${col}`];
    return { cleared: true, points: 50 };
  }

  resetHedgeTimer(row, col) {
    delete this.trimTimers[`${row},${col}`];
  }

  toPixelX(col) { return col * TILE_SIZE; }
  toPixelY(row) { return row * TILE_SIZE; }
  toCol(pixelX) { return Math.floor(pixelX / TILE_SIZE); }
  toRow(pixelY) { return Math.floor(pixelY / TILE_SIZE); }
}
