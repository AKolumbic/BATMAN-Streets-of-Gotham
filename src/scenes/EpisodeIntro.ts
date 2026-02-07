import { Scene } from 'phaser';
import { LEVELS } from '../data/levels';
import { LevelData } from '../systems/LevelLoader';

/**
 * Cinematic interstitial scene that plays before each episode.
 *
 * Visual sequence on a black background:
 *   1. Fade in "EPISODE N" in small gold caps
 *   2. Fade in the noir title in large italic text
 *   3. Typewriter narration lines one at a time
 *   4. Pulsing "PRESS SPACE" prompt when narration completes
 *
 * SPACE or click at any point skips directly to GameLevel.
 */
export default class EpisodeIntro extends Scene {
  private levelId!: string;
  private levelData!: LevelData;
  private typewriterEvent: Phaser.Time.TimerEvent | null = null;
  private narrationTimers: Phaser.Time.TimerEvent[] = [];
  private skipBound = false;

  constructor() {
    super({ key: 'EpisodeIntro' });
  }

  init(data: { levelId: string }): void {
    this.levelId = data.levelId;
    this.levelData = LEVELS[this.levelId];
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Reset state from prior runs
    this.typewriterEvent = null;
    this.narrationTimers = [];
    this.skipBound = false;

    // Black background
    this.cameras.main.setBackgroundColor('#000000');

    // ---- Episode number ----
    const episodeText = this.add
      .text(width / 2, height * 0.25, `EPISODE ${this.levelData.episode}`, {
        fontSize: '18px',
        color: '#d4a017',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: episodeText,
      alpha: 1,
      duration: 800,
      ease: 'Sine.easeIn',
    });

    // ---- Noir title ----
    const titleText = this.add
      .text(width / 2, height * 0.35, this.levelData.title, {
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'italic',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 1000,
      delay: 1000,
      ease: 'Sine.easeIn',
    });

    // ---- Narration (typewriter) ----
    const narrationStartDelay = 2500;
    const charDelay = 40; // ms per character
    const linePause = 500; // ms between lines
    const narrationLines = this.levelData.narration;

    let cumulativeDelay = narrationStartDelay;

    narrationLines.forEach((line, lineIndex) => {
      const yPos = height * 0.52 + lineIndex * 28;
      const lineText = this.add
        .text(80, yPos, '', {
          fontSize: '16px',
          color: '#cccccc',
          wordWrap: { width: width - 160 },
        })
        .setAlpha(0.9);

      // Schedule typewriter for this line
      const startDelay = cumulativeDelay;
      const timer = this.time.delayedCall(startDelay, () => {
        let charIndex = 0;
        this.typewriterEvent = this.time.addEvent({
          delay: charDelay,
          repeat: line.length - 1,
          callback: () => {
            charIndex++;
            lineText.setText(line.substring(0, charIndex));
          },
        });
      });

      this.narrationTimers.push(timer);
      cumulativeDelay += line.length * charDelay + linePause;
    });

    // ---- "PRESS SPACE" prompt after narration ----
    const promptDelay = cumulativeDelay + 500;
    const promptTimer = this.time.delayedCall(promptDelay, () => {
      const prompt = this.add
        .text(width / 2, height - 60, 'PRESS SPACE', {
          fontSize: '14px',
          color: '#888888',
        })
        .setOrigin(0.5)
        .setAlpha(0);

      this.tweens.add({
        targets: prompt,
        alpha: { from: 0, to: 0.8 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
    this.narrationTimers.push(promptTimer);

    // ---- Skip handlers ----
    this.bindSkip();
  }

  private bindSkip(): void {
    if (this.skipBound) return;
    this.skipBound = true;

    const skip = () => this.startLevel();

    // Keyboard
    this.input.keyboard?.on('keydown-SPACE', skip, this);

    // Click / tap
    this.input.on('pointerdown', skip, this);
  }

  private startLevel(): void {
    // Clean up timers
    if (this.typewriterEvent) {
      this.typewriterEvent.destroy();
      this.typewriterEvent = null;
    }
    this.narrationTimers.forEach((t) => t.destroy());
    this.narrationTimers = [];

    this.scene.start('GameLevel', { levelId: this.levelId });
  }
}
