import { levels } from '../levels/levelData.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor('#228B22');

    // Title
    this.add.text(195, 160, 'TRIM & TIDY', {
      font: 'bold 36px Arial', color: '#ffffff',
      stroke: '#0B3B0B', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(195, 210, 'A Lawn Care Adventure', {
      font: '16px Arial', color: '#D2B48C'
    }).setOrigin(0.5);

    // Animated mower
    const mower = this.add.rectangle(100, 270, 20, 14, 0xFF8C00);
    this.tweens.add({
      targets: mower, x: 290, duration: 2000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Level select
    this.add.text(195, 320, 'SELECT LEVEL', {
      font: 'bold 18px Arial', color: '#ffffff'
    }).setOrigin(0.5);

    const progress = this.loadProgress();

    levels.forEach((level, i) => {
      const y = 370 + i * 60;
      const unlocked = i <= progress.unlockedLevel;
      const stars = progress.stars[i] || 0;
      const bg = this.add.rectangle(195, y, 300, 48, unlocked ? 0x32CD32 : 0x555555, 0.8)
        .setStrokeStyle(2, 0xffffff);

      const label = `${level.id}. ${level.name}`;
      const starStr = unlocked && stars > 0
        ? ' ' + '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';

      this.add.text(60, y, label + starStr, {
        font: '14px Arial', color: unlocked ? '#ffffff' : '#999999'
      }).setOrigin(0, 0.5);

      if (!unlocked) {
        this.add.text(330, y, '🔒', { font: '18px Arial' }).setOrigin(0.5);
      }

      if (unlocked) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
          this.scene.start('GameScene', { level: i });
        });
      }
    });
  }

  loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem('trimTidyProgress'));
      if (saved) return saved;
    } catch (e) { /* ignore */ }
    return { unlockedLevel: 0, stars: [] };
  }
}
