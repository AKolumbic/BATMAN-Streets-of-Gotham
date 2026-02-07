import { Scene } from 'phaser';

/**
 * Boot scene — the very first scene that runs.
 * Shows a loading progress bar while all shared assets are loaded,
 * then transitions to the MainMenu.
 */
export default class Boot extends Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // --- Build a loading bar UI ---
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    this.cameras.main.setBackgroundColor('#192424');

    // Title text
    this.add
      .text(centerX, centerY - 60, 'BATMAN: STREETS OF GOTHAM', {
        fontSize: '24px',
        color: '#ffcc00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // "Loading..." text
    const loadingText = this.add
      .text(centerX, centerY + 40, 'Loading...', {
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Progress bar background
    const barWidth = 320;
    const barHeight = 20;
    const barX = centerX - barWidth / 2;
    const barY = centerY;

    this.add
      .rectangle(centerX, barY + barHeight / 2, barWidth, barHeight, 0x333333)
      .setOrigin(0.5);

    // Progress bar fill
    const progressBar = this.add
      .rectangle(barX, barY, 0, barHeight, 0xffcc00)
      .setOrigin(0, 0);

    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      progressBar.width = barWidth * value;
      loadingText.setText(`Loading... ${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      loadingText.setText('Ready!');
    });

    // No assets to preload in Boot itself — the menu scene loads its own.
    // Boot exists primarily as the loading-bar host for future shared assets.
  }

  create(): void {
    this.scene.start('GameMenu');
  }
}
