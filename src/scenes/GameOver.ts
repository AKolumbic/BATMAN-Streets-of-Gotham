import { Scene } from 'phaser';
import Button from '../ui/Button';

/**
 * Game Over screen -- displayed when Batman's HP reaches 0.
 * Offers retry (routes through EpisodeIntro) and level select options.
 * Accepts `levelId` so retry can re-launch the correct episode.
 */
export default class GameOver extends Scene {
  constructor() {
    super({ key: 'GameOver' });
  }

  create(data: { score: number; levelName: string; levelId: string }): void {
    const { width, height } = this.cameras.main;
    const { score = 0, levelId = 'level-01' } = data;

    this.cameras.main.setBackgroundColor('#1a0f0f');

    // Title
    this.add
      .text(width / 2, height / 2 - 100, 'GAME OVER', {
        fontSize: '48px',
        color: '#ff0000',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Score
    this.add
      .text(width / 2, height / 2 - 30, `SCORE: ${score}`, {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Buttons
    new Button({
      scene: this,
      x: width / 2,
      y: height / 2 + 50,
      text: 'RETRY',
      width: 250,
      height: 45,
      bgColor: 0x3a1a1a,
      onClick: () => {
        this.scene.start('EpisodeIntro', { levelId });
      },
    });

    new Button({
      scene: this,
      x: width / 2,
      y: height / 2 + 110,
      text: 'LEVEL SELECT',
      width: 250,
      height: 45,
      bgColor: 0x1a2a3a,
      onClick: () => {
        this.scene.start('LevelSelect');
      },
    });
  }
}
