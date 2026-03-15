import { TILE_SIZE } from '../entities/TileManager.js';
const TILE = TILE_SIZE;
const PLAYER = 24;

const tileConfigs = [
  { key: 'tile_0', color: 0xD2B48C, detail: null },
  { key: 'tile_1', color: 0x32CD32, detail: 'grass' },
  { key: 'tile_2', color: 0x32CD32, detail: 'flower' },
  { key: 'tile_3', color: 0x228B22, detail: 'hedgeLow' },
  { key: 'tile_4', color: 0x0B3B0B, detail: null },
  { key: 'tile_5', color: 0x808080, detail: 'brick' },
  { key: 'tile_6', color: 0x8B4513, detail: 'door' },
  { key: 'tile_7', color: 0xCC3333, detail: 'roof' },
  { key: 'tile_8', color: 0xC0C0C0, detail: 'sidewalk' },
  { key: 'tile_9', color: 0x4169E1, detail: 'water' }
];

function drawDetail(g, detail) {
  if (detail === 'grass') {
    g.lineStyle(1, 0x228B22);
    for (const x of [7, 15, 22]) {
      g.lineBetween(x, 25, x - 2, 10);
      g.lineBetween(x, 25, x + 2, 12);
    }
  } else if (detail === 'flower') {
    g.fillStyle(0xFF69B4);
    g.fillCircle(15, 15, 8);
    g.fillStyle(0xFFD700);
    g.fillCircle(15, 15, 3);
  } else if (detail === 'hedgeLow') {
    g.lineStyle(2, 0x2EAA2E);
    g.strokeRect(2, 2, 26, 26);
  } else if (detail === 'brick') {
    g.lineStyle(1, 0x606060);
    g.lineBetween(0, 10, 30, 10);
    g.lineBetween(0, 20, 30, 20);
    g.lineBetween(15, 0, 15, 10);
    g.lineBetween(8, 10, 8, 20);
    g.lineBetween(22, 20, 22, 30);
  } else if (detail === 'door') {
    g.fillStyle(0x6B3410);
    g.fillRect(5, 3, 20, 24);
    g.fillStyle(0xFFD700);
    g.fillCircle(21, 15, 2);
  } else if (detail === 'roof') {
    g.lineStyle(1, 0xAA2222);
    for (let y = 5; y < 30; y += 8) {
      g.lineBetween(0, y, 30, y + 6);
    }
  } else if (detail === 'sidewalk') {
    g.lineStyle(1, 0xD0D0D0);
    g.lineBetween(0, 15, 30, 15);
    g.lineBetween(15, 0, 15, 30);
  } else if (detail === 'water') {
    g.lineStyle(2, 0x6495ED);
    g.lineBetween(5, 10, 25, 10);
    g.lineBetween(3, 20, 27, 20);
  }
}

export function generateTextures(scene) {
  for (const cfg of tileConfigs) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(cfg.color);
    g.fillRect(0, 0, TILE, TILE);
    if (cfg.detail) drawDetail(g, cfg.detail);
    g.generateTexture(cfg.key, TILE, TILE);
    g.destroy();
  }

  const pg = scene.make.graphics({ add: false });
  pg.fillStyle(0xFF8C00);
  pg.fillRect(0, 0, PLAYER, PLAYER);
  pg.lineStyle(2, 0xCC7000);
  pg.strokeRect(1, 1, PLAYER - 2, PLAYER - 2);
  pg.generateTexture('player', PLAYER, PLAYER);
  pg.destroy();
}
