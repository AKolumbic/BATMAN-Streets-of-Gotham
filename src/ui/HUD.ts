import Batman from '../entities/Batman';

/**
 * HUD — Heads-Up Display rendered on top of the game.
 * Uses the Game UI collection PNG assets for health bars
 * with colored fill that changes based on HP level.
 * Fixed to camera (scrollFactor 0).
 */
export default class HUD {
  private scene: Phaser.Scene;
  private batman: Batman;

  // Health bar
  private healthBarBg!: Phaser.GameObjects.Image;
  private healthBarFill!: Phaser.GameObjects.Rectangle;
  private healthLabel!: Phaser.GameObjects.Text;

  // Score
  private scoreText!: Phaser.GameObjects.Text;

  // Rescue counter
  private rescueText!: Phaser.GameObjects.Text;

  // Layout constants
  private static readonly BAR_X = 20;
  private static readonly BAR_Y = 20;
  private static readonly BAR_WIDTH = 150;
  private static readonly BAR_HEIGHT = 16;
  private static readonly DEPTH = 100;

  constructor(scene: Phaser.Scene, batman: Batman) {
    this.scene = scene;
    this.batman = batman;
    this.createHealthBar();
    this.createScoreDisplay();
    this.createRescueCounter();
  }

  private createHealthBar(): void {
    // Check if UI bar images are loaded; use them if available, else fallback
    const hasBarBg = this.scene.textures.exists('ui-bar-bg');

    if (hasBarBg) {
      // Image-based health bar background
      this.healthBarBg = this.scene.add
        .image(HUD.BAR_X + 2, HUD.BAR_Y + 2, 'ui-bar-bg')
        .setOrigin(0, 0)
        .setDisplaySize(HUD.BAR_WIDTH + 8, HUD.BAR_HEIGHT + 8)
        .setScrollFactor(0)
        .setDepth(HUD.DEPTH);
    } else {
      // Fallback rectangle background
      this.healthBarBg = this.scene.add
        .image(0, 0, '__DEFAULT') // placeholder
        .setVisible(false);

      this.scene.add
        .rectangle(
          HUD.BAR_X + HUD.BAR_WIDTH / 2,
          HUD.BAR_Y + HUD.BAR_HEIGHT / 2,
          HUD.BAR_WIDTH,
          HUD.BAR_HEIGHT,
          0x333333
        )
        .setScrollFactor(0)
        .setDepth(HUD.DEPTH);
    }

    // HP label
    this.healthLabel = this.scene.add
      .text(HUD.BAR_X, HUD.BAR_Y - 16, 'HP', {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH + 2);

    // Health bar fill (colored rectangle that shrinks)
    this.healthBarFill = this.scene.add
      .rectangle(
        HUD.BAR_X + HUD.BAR_WIDTH / 2,
        HUD.BAR_Y + HUD.BAR_HEIGHT / 2,
        HUD.BAR_WIDTH,
        HUD.BAR_HEIGHT,
        0x00cc44
      )
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH + 1);
  }

  private createScoreDisplay(): void {
    this.scoreText = this.scene.add
      .text(780, HUD.BAR_Y - 10, 'SCORE: 0', {
        fontSize: '16px',
        color: '#ffcc00',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH);
  }

  private createRescueCounter(): void {
    this.rescueText = this.scene.add
      .text(780, HUD.BAR_Y + 14, 'RESCUED: 0', {
        fontSize: '12px',
        color: '#00ff88',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(HUD.DEPTH);
  }

  update(): void {
    // Update health bar fill width
    const hpPercent = this.batman.hp / this.batman.maxHp;
    const fillWidth = HUD.BAR_WIDTH * hpPercent;
    this.healthBarFill.setSize(fillWidth, HUD.BAR_HEIGHT);
    this.healthBarFill.setPosition(
      HUD.BAR_X + fillWidth / 2,
      HUD.BAR_Y + HUD.BAR_HEIGHT / 2
    );

    // Change color based on HP level — green > yellow > orange > red
    if (hpPercent > 0.6) {
      this.healthBarFill.setFillStyle(0x00cc44); // Green
    } else if (hpPercent > 0.35) {
      this.healthBarFill.setFillStyle(0xffcc00); // Yellow
    } else if (hpPercent > 0.15) {
      this.healthBarFill.setFillStyle(0xff6600); // Orange
    } else {
      this.healthBarFill.setFillStyle(0xff0000); // Red (critical)
    }

    // Update score
    this.scoreText.setText('SCORE: ' + this.batman.score);
  }

  /**
   * Update the rescue counter display.
   */
  setRescueCount(count: number): void {
    this.rescueText.setText('RESCUED: ' + count);
  }

  destroy(): void {
    this.healthBarBg.destroy();
    this.healthBarFill.destroy();
    this.healthLabel.destroy();
    this.scoreText.destroy();
    this.rescueText.destroy();
  }
}
