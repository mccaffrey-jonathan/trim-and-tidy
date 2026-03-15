import TileManager, { TILE_SIZE, IMPASSABLE } from '../entities/TileManager.js';
import { levels } from '../levels/levelData.js';
import Player from '../entities/Player.js';
import { setupControls, updateTurboButton } from '../utils/controls.js';
import { playSnip, playCrunch, playDing, playComplete, playFail } from '../utils/audio.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelIndex = data.level || 0;
  }

  create() {
    this.cameras.main.fadeIn(300);
    const levelData = levels[this.levelIndex];
    this.tileManager = new TileManager(levelData);
    this.tileSprites = [];
    this.impassableGroup = this.physics.add.staticGroup();
    this.buildTileGrid();

    const { col, row } = levelData.playerStart;
    this.player = new Player(this, col, row);
    this.controls = setupControls(this);
    this.physics.add.collider(this.player.sprite, this.impassableGroup);

    this.scene.launch('HUDScene', { levelName: levelData.name });

    this.prevTile = { row, col };
    this.levelComplete = false;
    this.timeRemaining = levelData.timeLimit;
    this.requiredPercent = levelData.requiredPercent;

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Pause on blur
    this.game.events.on('blur', () => { this.scene.pause(); });
    this.game.events.on('focus', () => { this.scene.resume(); });
  }

  buildTileGrid() {
    const tm = this.tileManager;
    for (let r = 0; r < tm.rows; r++) {
      this.tileSprites[r] = [];
      for (let c = 0; c < tm.cols; c++) {
        const type = tm.getTile(r, c);
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
  }

  update(time, delta) {
    if (this.levelComplete) return;

    this.player.update(this.controls, delta);

    // Turbo activation (space or touch button)
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.controls.turboPressed) {
      if (this.player.activateTurbo()) {
        this.cameras.main.shake(100, 0.005);
      }
      this.controls.turboPressed = false;
    }

    updateTurboButton(this.controls, this.player.chargePercent);

    const { row, col } = this.player.getTilePosition();
    this.handleTrimming(row, col, delta);

    this.timeRemaining -= delta / 1000;
    const percent = this.tileManager.getTrimmablePercent();

    this.events.emit('updateHUD', {
      score: this.tileManager.score,
      percent,
      timeRemaining: this.timeRemaining,
      chargePercent: this.player.chargePercent
    });

    if (percent >= this.requiredPercent) {
      this.completeLevel(true, percent);
    } else if (this.timeRemaining <= 0) {
      this.completeLevel(false, percent);
    }

    this.prevTile = { row, col };
  }

  handleTrimming(row, col, delta) {
    if (row !== this.prevTile.row || col !== this.prevTile.col) {
      this.tileManager.resetHedgeTimer(this.prevTile.row, this.prevTile.col);
    }

    if (this.player.turboActive) {
      this.trimArea(row, col, delta);
    } else {
      this.trimSingle(row, col, delta);
    }
  }

  trimSingle(row, col, delta) {
    if (!this.tileManager.isTrimmable(row, col)) return;
    const type = this.tileManager.getTile(row, col);

    if (type === 1 || type === 2) {
      const result = this.tileManager.trimTile(row, col);
      if (result.cleared) {
        this.swapTileTexture(row, col);
        this.player.addCharge(type === 1 ? 1 : 2.5);
        if (type === 2) playDing(); else playSnip();
      }
    } else if (type === 3) {
      const result = this.tileManager.trimHedge(row, col, delta);
      if (result.cleared) {
        this.swapTileTexture(row, col);
        this.player.addCharge(5);
        playCrunch();
        this.cameras.main.shake(50, 0.002);
      }
    }
  }

  trimArea(row, col) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (!this.tileManager.isTrimmable(r, c)) continue;
        const type = this.tileManager.getTile(r, c);
        if (type === 1 || type === 2) {
          const result = this.tileManager.trimTile(r, c);
          if (result.cleared) this.swapTileTexture(r, c);
        } else if (type === 3) {
          this.tileManager.grid[r][c] = 0;
          this.tileManager.trimmedCount++;
          this.tileManager.score += 50;
          delete this.tileManager.trimTimers[`${r},${c}`];
          this.swapTileTexture(r, c);
        }
      }
    }
  }

  swapTileTexture(row, col) {
    const sprite = this.tileSprites[row]?.[col];
    if (!sprite) return;
    sprite.setTexture('tile_0');
    this.tweens.add({
      targets: sprite, scaleX: 0.8, scaleY: 0.8,
      duration: 50, yoyo: true
    });
  }

  completeLevel(success, percent) {
    this.levelComplete = true;
    this.cameras.main.fadeOut(300);
    if (success) playComplete(); else playFail();

    const stars = percent >= 100 ? 3 : percent >= 90 ? 2 : 1;
    const timeBonus = success ? Math.floor(Math.max(0, this.timeRemaining)) * 10 : 0;

    this.time.delayedCall(300, () => {
      this.scene.start('LevelCompleteScene', {
        success, levelIndex: this.levelIndex,
        score: this.tileManager.score + timeBonus,
        timeBonus, percent, stars
      });
    });
  }
}
