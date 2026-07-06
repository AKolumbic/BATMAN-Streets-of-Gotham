import { Scene } from 'phaser';
import Button from '../ui/Button';
import { loadProgress, recordResult } from '../systems/Progress';

/**
 * Displayed when a level is completed successfully.
 * Shows final score, rescue count, and navigation options.
 * Accepts `levelId` so "PLAY AGAIN" can re-launch the same episode.
 */
export default class LevelComplete extends Scene {
  constructor() {
    super({ key: 'LevelComplete' });
  }

  create(data: {
    score: number;
    rescued: number;
    levelName: string;
    levelId: string;
  }): void {
    const { width, height } = this.cameras.main;
    const {
      score = 0,
      rescued = 0,
      levelName = 'Unknown',
      levelId = 'level-01',
    } = data;

    const previousBest = loadProgress().levels[levelId]?.bestScore ?? 0;
    recordResult(levelId, score, rescued);
    const isNewBest = score > previousBest;

    this.cameras.main.setBackgroundColor('#0f1a0f');

    // Title
    this.add
      .text(width / 2, height / 2 - 120, 'GOTHAM IS SAFE', {
        fontSize: '42px',
        color: '#ffcc00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Level name
    this.add
      .text(width / 2, height / 2 - 70, levelName, {
        fontSize: '18px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5);

    // Score
    this.add
      .text(width / 2, height / 2 - 20, `SCORE: ${score}`, {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    if (isNewBest) {
      this.add
        .text(width / 2, height / 2 + 5, 'NEW BEST!', {
          fontSize: '16px',
          color: '#ffcc00',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    }

    // Rescued count
    this.add
      .text(width / 2, height / 2 + 20, `CIVILIANS RESCUED: ${rescued}`, {
        fontSize: '18px',
        color: '#00ff88',
      })
      .setOrigin(0.5);

    // Buttons
    new Button({
      scene: this,
      x: width / 2,
      y: height / 2 + 90,
      text: 'LEVEL SELECT',
      width: 250,
      height: 45,
      bgColor: 0x1a2a3a,
      onClick: () => {
        this.scene.start('LevelSelect');
      },
    });

    new Button({
      scene: this,
      x: width / 2,
      y: height / 2 + 150,
      text: 'PLAY AGAIN',
      width: 250,
      height: 45,
      bgColor: 0x2a3a1a,
      onClick: () => {
        this.scene.start('GameLevel', { levelId });
      },
    });
  }
}
