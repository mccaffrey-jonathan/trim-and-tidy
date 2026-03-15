import { playSnip, playCrunch, playDing } from './audio.js';

export function handleTrimming(scene, row, col, delta) {
  const tm = scene.tileManager;
  const prev = scene.prevTile;

  if (row !== prev.row || col !== prev.col) {
    tm.resetHedgeTimer(prev.row, prev.col);
  }

  if (scene.player.turboActive) {
    trimArea(scene, row, col);
  } else {
    trimSingle(scene, row, col, delta);
  }
}

function trimSingle(scene, row, col, delta) {
  const tm = scene.tileManager;
  if (!tm.isTrimmable(row, col)) return;
  const type = tm.getTile(row, col);

  if (type === 1 || type === 2) {
    const result = tm.trimTile(row, col);
    if (result.cleared) {
      swapTile(scene, row, col);
      scene.player.addCharge(type === 1 ? 1 : 2.5);
      if (type === 2) playDing(); else playSnip();
    }
  } else if (type === 3) {
    const result = tm.trimHedge(row, col, delta);
    if (result.cleared) {
      swapTile(scene, row, col);
      scene.player.addCharge(5);
      playCrunch();
      scene.cameras.main.shake(50, 0.002);
    }
  }
}

function trimArea(scene, row, col) {
  const tm = scene.tileManager;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr;
      const c = col + dc;
      if (!tm.isTrimmable(r, c)) continue;
      const type = tm.getTile(r, c);
      if (type === 1 || type === 2) {
        if (tm.trimTile(r, c).cleared) swapTile(scene, r, c);
      } else if (type === 3) {
        tm.grid[r][c] = 0;
        tm.trimmedCount++;
        tm.score += 50;
        delete tm.trimTimers[`${r},${c}`];
        swapTile(scene, r, c);
      }
    }
  }
}

function swapTile(scene, row, col) {
  const sprite = scene.tileSprites[row]?.[col];
  if (!sprite) return;
  sprite.setTexture('tile_0');
  scene.tweens.add({
    targets: sprite, scaleX: 0.8, scaleY: 0.8,
    duration: 50, yoyo: true
  });
}
