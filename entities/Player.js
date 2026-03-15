import { TILE_SIZE } from './TileManager.js';

export default class Player {
  constructor(scene, col, row) {
    const x = col * TILE_SIZE + TILE_SIZE / 2;
    const y = row * TILE_SIZE + TILE_SIZE / 2;
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.body.setSize(24, 24);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.speed = 150;
    this.facing = 'down';
    this.currentTile = { row, col };

    // Direction indicator line
    this.dirLine = scene.add.graphics().setDepth(11);

    // Turbo ability
    this.chargePercent = 0;
    this.turboActive = false;
    this.turboTimer = 0;
  }

  update(controls, delta) {
    const { cursors, touch } = controls;
    let vx = 0;
    let vy = 0;

    // Keyboard input
    if (cursors.left.isDown) { vx = -1; this.facing = 'left'; }
    if (cursors.right.isDown) { vx = 1; this.facing = 'right'; }
    if (cursors.up.isDown) { vy = -1; this.facing = 'up'; }
    if (cursors.down.isDown) { vy = 1; this.facing = 'down'; }

    // Touch joystick (analog)
    if (Math.abs(touch.x) > 0.1 || Math.abs(touch.y) > 0.1) {
      vx = touch.x;
      vy = touch.y;
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? 'right' : 'left';
      } else {
        this.facing = vy > 0 ? 'down' : 'up';
      }
    }

    // Touch D-pad (digital)
    if (touch.left) { vx = -1; this.facing = 'left'; }
    if (touch.right) { vx = 1; this.facing = 'right'; }
    if (touch.up) { vy = -1; this.facing = 'up'; }
    if (touch.down) { vy = 1; this.facing = 'down'; }

    // Turbo speed
    const speed = this.turboActive ? this.speed * 2 : this.speed;
    this.sprite.setVelocity(vx * speed, vy * speed);

    // Update current tile
    this.currentTile = {
      row: Math.floor(this.sprite.y / TILE_SIZE),
      col: Math.floor(this.sprite.x / TILE_SIZE)
    };

    // Turbo timer
    if (this.turboActive) {
      this.turboTimer -= delta;
      if (this.turboTimer <= 0) {
        this.turboActive = false;
        this.turboTimer = 0;
        this.sprite.clearTint();
      }
    }

    // Direction indicator
    this.drawDirectionLine();
  }

  drawDirectionLine() {
    this.dirLine.clear();
    this.dirLine.lineStyle(2, 0xFFFFFF);
    const cx = this.sprite.x;
    const cy = this.sprite.y;
    const len = 14;
    let ex = cx, ey = cy;
    if (this.facing === 'up') ey -= len;
    else if (this.facing === 'down') ey += len;
    else if (this.facing === 'left') ex -= len;
    else if (this.facing === 'right') ex += len;
    this.dirLine.lineBetween(cx, cy, ex, ey);
  }

  getTilePosition() {
    return this.currentTile;
  }

  addCharge(amount) {
    this.chargePercent = Math.min(100, this.chargePercent + amount);
  }

  activateTurbo() {
    if (this.chargePercent < 100) return false;
    this.turboActive = true;
    this.turboTimer = 3000;
    this.chargePercent = 0;
    this.sprite.setTint(0xFFFF00);
    return true;
  }
}
