import { Scene } from 'phaser';
import Button from '../ui/Button';
import { LEVELS, LEVEL_ORDER } from '../data/levels';
import { isUnlocked, loadProgress } from '../systems/Progress';

/**
 * Level selection screen.
 * Displays all 8 episodes with noir titles. Sequential unlock via saved progress.
 * Clicking an unlocked episode routes to EpisodeIntro, which then transitions to GameLevel.
 */
export default class LevelSelect extends Scene {
  constructor() {
    super({ key: 'LevelSelect' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.cameras.main.setBackgroundColor('#0f0f23');

    // Title
    this.add
      .text(width / 2, 40, 'STREETS OF GOTHAM', {
        fontSize: '28px',
        color: '#ffcc00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, 75, 'Select an episode', {
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Episode buttons — 2 columns x 4 rows
    const startX = 200;
    const startY = 130;
    const colWidth = 400;
    const rowHeight = 105;

    const progress = loadProgress();

    LEVEL_ORDER.forEach((levelId, index) => {
      const level = LEVELS[levelId];
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * colWidth;
      const y = startY + row * rowHeight;

      const unlocked = isUnlocked(levelId, LEVEL_ORDER);
      const result = progress.levels[levelId];
      const label = unlocked
        ? `EP. ${level.episode} \u2014 ${level.title}`
        : `EP. ${level.episode} \u2014 ${level.title} (LOCKED)`;

      new Button({
        scene: this,
        x,
        y,
        text: label,
        width: 340,
        height: 80,
        fontSize: '16px',
        bgColor: unlocked ? 0x1a2a3a : 0x222222,
        color: unlocked ? '#ffffff' : '#555555',
        disabled: !unlocked,
        onClick: () => {
          if (unlocked) {
            this.scene.start('EpisodeIntro', { levelId });
          }
        },
      });

      if (result?.completed) {
        this.add
          .text(x, y + 50, `BEST: ${result.bestScore}`, {
            fontSize: '12px',
            color: '#888888',
          })
          .setOrigin(0.5)
          .setDepth(51);
      }

      // Episode number badge
      this.add
        .text(x - 140, y - 15, `${level.episode}`, {
          fontSize: '32px',
          color: unlocked ? '#ffcc00' : '#555555',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setDepth(51);
    });

    // Back button
    new Button({
      scene: this,
      x: width / 2,
      y: height - 45,
      text: 'BACK TO MENU',
      width: 200,
      height: 40,
      fontSize: '14px',
      bgColor: 0x2a1a1a,
      onClick: () => {
        this.scene.start('GameMenu');
      },
    });
  }
}
