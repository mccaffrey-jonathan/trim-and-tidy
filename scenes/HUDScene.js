export default class HUDScene extends Phaser.Scene {
  constructor() {
    super('HUDScene');
  }

  init(data) {
    this.levelName = data.levelName || '';
  }

  create() {
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

    // Timer text
    this.timerText = this.add.text(195, 30, '', {
      font: '12px Arial', color: '#ffffff'
    }).setOrigin(0.5, 0).setDepth(101);
    this._timerPulse = null;

    // Charge bar
    this.add.rectangle(195, 832, 120, 8, 0x333333, 0.7).setDepth(100);
    this.chargeBar = this.add.rectangle(136, 832, 0, 6, 0xFFFF00)
      .setOrigin(0, 0.5).setDepth(101);
    this.chargeLabel = this.add.text(195, 822, '', {
      font: 'bold 10px Arial', color: '#FFD700'
    }).setOrigin(0.5, 1).setDepth(101);

    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('updateHUD', this.onUpdate, this);
  }

  onUpdate(data) {
    this.scoreText.setText('Score: ' + data.score);

    // Percent with color feedback
    const pct = data.percent;
    this.percentText.setText(pct + '%');
    if (pct >= 80) {
      this.percentText.setColor('#32CD32');
    } else if (pct >= 50) {
      this.percentText.setColor('#FFD700');
    } else {
      this.percentText.setColor('#ffffff');
    }

    // Timer with progressive warning
    if (data.timeRemaining !== undefined) {
      const t = Math.max(0, Math.ceil(data.timeRemaining));
      const min = Math.floor(t / 60);
      const sec = String(t % 60).padStart(2, '0');
      this.timerText.setText(`${min}:${sec}`);

      if (t < 15) {
        this.timerText.setColor('#FF4444');
        this.timerText.setFontSize(14);
        if (!this._timerPulse) {
          this._timerPulse = this.tweens.add({
            targets: this.timerText, alpha: 0.4,
            duration: 400, yoyo: true, repeat: -1
          });
        }
      } else if (t < 30) {
        this.timerText.setColor('#FFAA00');
        this.timerText.setFontSize(13);
      } else {
        this.timerText.setColor('#ffffff');
        this.timerText.setFontSize(12);
      }
    }

    // Charge bar — use Math.round for visual accuracy
    if (data.chargePercent !== undefined) {
      const w = Math.round((data.chargePercent / 100) * 118);
      this.chargeBar.setSize(w, 6);
      if (data.chargePercent >= 100) {
        this.chargeLabel.setText('TURBO READY!');
        this.chargeBar.setFillStyle(0x00FF00);
      } else {
        this.chargeLabel.setText('');
        this.chargeBar.setFillStyle(0xFFFF00);
      }
    }
  }
}
