import { levels } from '../levels/levelData.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#228B22');
    this.cameras.main.fadeIn(300);

    // Title
    this.add.text(195, 120, 'TRIM & TIDY', {
      font: 'bold 36px Arial', color: '#ffffff',
      stroke: '#0B3B0B', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(195, 170, 'A Lawn Care Adventure', {
      font: '16px Arial', color: '#D2B48C'
    }).setOrigin(0.5);

    // Animated mower
    const mower = this.add.rectangle(100, 220, 20, 14, 0xFF8C00);
    this.tweens.add({
      targets: mower, x: 290, duration: 2000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Level select heading
    this.add.text(195, 270, 'SELECT LEVEL', {
      font: 'bold 18px Arial', color: '#ffffff'
    }).setOrigin(0.5);

    const progress = this.loadProgress();

    levels.forEach((level, i) => {
      const y = 320 + i * 55;
      const unlocked = i <= progress.unlockedLevel;
      const stars = progress.stars[i] || 0;

      const bg = this.add.rectangle(195, y, 300, 44, unlocked ? 0x32CD32 : 0x555555, 0.8)
        .setStrokeStyle(2, 0xffffff);

      const starStr = unlocked && stars > 0
        ? '  ' + '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';

      this.add.text(60, y, `${level.id}. ${level.name}${starStr}`, {
        font: '14px Arial', color: unlocked ? '#ffffff' : '#999999'
      }).setOrigin(0, 0.5);

      if (!unlocked) {
        this.add.text(330, y, '🔒', { font: '16px Arial' }).setOrigin(0.5);
      }

      if (unlocked) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
          this.cameras.main.fadeOut(300);
          this.time.delayedCall(300, () => {
            this.scene.start('GameScene', { level: i });
          });
        });
      }
    });

    // Instructions
    this.add.text(195, 620, 'Arrow Keys / Touch to Move', {
      font: '12px Arial', color: '#AADDAA'
    }).setOrigin(0.5);

    this.add.text(195, 640, 'Space / Tap Turbo Button for Turbo Trim!', {
      font: '12px Arial', color: '#AADDAA'
    }).setOrigin(0.5);
  }

  loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem('trimTidyProgress'));
      if (saved) return saved;
    } catch (e) { /* ignore */ }
    return { unlockedLevel: 0, stars: [] };
  }
}
