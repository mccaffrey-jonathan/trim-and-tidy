import { levels } from '../levels/levelData.js';

export default class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super('LevelCompleteScene');
  }

  init(data) {
    this.result = data;
  }

  create() {
    this.scene.stop('GameScene');
    this.scene.stop('HUDScene');
    this.cameras.main.setBackgroundColor('#1a1a2e');

    const { success, levelIndex, score, timeBonus, percent, stars } = this.result;

    if (success) {
      this.showSuccess(levelIndex, score, timeBonus, percent, stars);
    } else {
      this.showFailure(levelIndex, score, percent);
    }
  }

  showSuccess(levelIndex, score, timeBonus, percent, stars) {
    this.add.text(195, 180, 'Level Complete!', {
      font: 'bold 32px Arial', color: '#32CD32'
    }).setOrigin(0.5);

    const info = [
      `Trimmed: ${percent}%`,
      `Score: ${score - timeBonus}`,
      `Time Bonus: +${timeBonus}`,
      `Total: ${score}`
    ];
    info.forEach((line, i) => {
      this.add.text(195, 260 + i * 30, line, {
        font: '16px Arial', color: '#ffffff'
      }).setOrigin(0.5);
    });

    // Stars
    const starY = 400;
    for (let i = 0; i < 3; i++) {
      this.add.text(155 + i * 40, starY, i < stars ? '★' : '☆', {
        font: '32px Arial', color: i < stars ? '#FFD700' : '#666666'
      }).setOrigin(0.5);
    }

    // Save progress
    this.saveProgress(levelIndex, stars);

    // Buttons
    const isLast = levelIndex >= levels.length - 1;
    if (!isLast) {
      this.createButton(195, 500, 'Next Level', () => {
        this.scene.start('GameScene', { level: levelIndex + 1 });
      });
    } else {
      this.add.text(195, 490, 'You Win!', {
        font: 'bold 24px Arial', color: '#FFD700'
      }).setOrigin(0.5);
    }

    this.createButton(195, 560, 'Menu', () => {
      this.scene.start('MenuScene');
    });
  }

  showFailure(levelIndex, score, percent) {
    this.add.text(195, 200, "Time's Up!", {
      font: 'bold 32px Arial', color: '#FF4444'
    }).setOrigin(0.5);

    this.add.text(195, 280, `Trimmed: ${percent}%`, {
      font: '16px Arial', color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(195, 310, `Score: ${score}`, {
      font: '16px Arial', color: '#ffffff'
    }).setOrigin(0.5);

    this.createButton(195, 420, 'Retry', () => {
      this.scene.start('GameScene', { level: levelIndex });
    });

    this.createButton(195, 480, 'Menu', () => {
      this.scene.start('MenuScene');
    });
  }

  createButton(x, y, label, callback) {
    const bg = this.add.rectangle(x, y, 200, 40, 0x444444, 0.9)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      font: 'bold 16px Arial', color: '#ffffff'
    }).setOrigin(0.5);

    // Hover feedback
    bg.on('pointerover', () => { bg.setFillStyle(0x666666, 0.9); });
    bg.on('pointerout', () => { bg.setFillStyle(0x444444, 0.9); });

    // Debounced click — disable after first press to prevent double navigation
    bg.on('pointerdown', () => {
      if (this._navigating) return;
      this._navigating = true;
      bg.setFillStyle(0x888888, 0.9);
      text.setColor('#aaaaaa');
      bg.disableInteractive();
      callback();
    });
  }

  saveProgress(levelIndex, stars) {
    let progress;
    try {
      progress = JSON.parse(localStorage.getItem('trimTidyProgress')) ||
        { unlockedLevel: 0, stars: [] };
    } catch (e) {
      progress = { unlockedLevel: 0, stars: [] };
    }
    progress.unlockedLevel = Math.max(progress.unlockedLevel, levelIndex + 1);
    progress.stars[levelIndex] = Math.max(progress.stars[levelIndex] || 0, stars);
    localStorage.setItem('trimTidyProgress', JSON.stringify(progress));
  }
}
