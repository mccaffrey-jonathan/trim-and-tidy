export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUDScene');
  }

  init(data) {
    this.levelName = data.levelName || '';
  }

  create() {
    // Fixed overlay - don't scroll with camera
    this.cameras.main.setScroll(0, 0);

    // Semi-transparent bar at top
    this.add.rectangle(195, 18, 390, 36, 0x000000, 0.5).setDepth(100);

    const style = { font: '14px Arial', color: '#ffffff' };

    this.scoreText = this.add.text(10, 8, 'Score: 0', style).setDepth(101);
    this.levelText = this.add.text(195, 8, this.levelName, {
      ...style, align: 'center'
    }).setOrigin(0.5, 0).setDepth(101);
    this.percentText = this.add.text(380, 8, '0%', style)
      .setOrigin(1, 0).setDepth(101);

    // Timer text (below HUD bar)
    this.timerText = this.add.text(195, 30, '', {
      font: '12px Arial', color: '#ffffff'
    }).setOrigin(0.5, 0).setDepth(101);

    // Charge bar background
    this.add.rectangle(195, 832, 120, 8, 0x333333, 0.7).setDepth(100);
    this.chargeBar = this.add.rectangle(136, 832, 0, 6, 0xFFFF00)
      .setOrigin(0, 0.5).setDepth(101);
    this.chargeLabel = this.add.text(195, 822, '', {
      font: '10px Arial', color: '#FFD700'
    }).setOrigin(0.5, 1).setDepth(101);

    // Listen for HUD updates from GameScene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('updateHUD', this.onUpdate, this);
  }

  onUpdate(data) {
    this.scoreText.setText('Score: ' + data.score);
    this.percentText.setText(data.percent + '%');

    if (data.timeRemaining !== undefined) {
      const t = Math.max(0, Math.ceil(data.timeRemaining));
      const min = Math.floor(t / 60);
      const sec = String(t % 60).padStart(2, '0');
      this.timerText.setText(`${min}:${sec}`);
      this.timerText.setColor(t < 15 ? '#FF4444' : '#ffffff');
    }

    if (data.chargePercent !== undefined) {
      const w = Math.floor((data.chargePercent / 100) * 118);
      this.chargeBar.setSize(w, 6);
      this.chargeLabel.setText(
        data.chargePercent >= 100 ? 'TURBO READY!' : ''
      );
    }
  }
}
