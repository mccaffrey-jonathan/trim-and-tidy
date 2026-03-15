import TileManager, { TILE_SIZE, IMPASSABLE } from '../entities/TileManager.js';
import { levels } from '../levels/levelData.js';
import Player from '../entities/Player.js';
import { setupControls } from '../utils/controls.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelIndex = data.level || 0;
  }

  create() {
    const levelData = levels[this.levelIndex];
    this.tileManager = new TileManager(levelData);
    this.tileSprites = [];
    this.impassableGroup = this.physics.add.staticGroup();

    for (let r = 0; r < this.tileManager.rows; r++) {
      this.tileSprites[r] = [];
      for (let c = 0; c < this.tileManager.cols; c++) {
        const type = this.tileManager.getTile(r, c);
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        const key = 'tile_' + type;

        if (IMPASSABLE.includes(type)) {
          const img = this.physics.add.staticImage(
            x + TILE_SIZE / 2, y + TILE_SIZE / 2, key
          );
          img.body.setSize(TILE_SIZE, TILE_SIZE);
          img.setDisplaySize(TILE_SIZE, TILE_SIZE);
          this.impassableGroup.add(img);
          this.tileSprites[r][c] = img;
        } else {
          this.tileSprites[r][c] = this.add.image(x, y, key).setOrigin(0, 0);
        }
      }
    }
    this.impassableGroup.refresh();

    // Player
    const { col, row } = levelData.playerStart;
    this.player = new Player(this, col, row);
    this.controls = setupControls(this);
    this.physics.add.collider(this.player.sprite, this.impassableGroup);
  }

  update(time, delta) {
    this.player.update(this.controls, delta);
  }
}
