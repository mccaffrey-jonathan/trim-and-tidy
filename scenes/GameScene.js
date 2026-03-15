export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.add.text(195, 422, 'Trim & Tidy - Loading...', {
      font: '16px Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
