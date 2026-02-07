import Batman from '../entities/Batman';

export default class HUD {
  private scene: Phaser.Scene;
  private batman: Batman;

  // Health bar
  private healthBarBg: Phaser.GameObjects.Rectangle;
  private healthBarFill: Phaser.GameObjects.Rectangle;
  private healthLabel: Phaser.GameObjects.Text;

  // Score
  private scoreText: Phaser.GameObjects.Text;

  private static readonly BAR_X = 20;
  private static readonly BAR_Y = 20;
  private static readonly BAR_WIDTH = 150;
  private static readonly BAR_HEIGHT = 16;

  constructor(scene: Phaser.Scene, batman: Batman) {
    this.scene = scene;
    this.batman = batman;

    // --- Health bar ---
    // Label
    this.healthLabel = scene.add
      .text(HUD.BAR_X, HUD.BAR_Y - 16, 'HP', {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Background (dark)
    this.healthBarBg = scene.add
      .rectangle(
        HUD.BAR_X + HUD.BAR_WIDTH / 2,
        HUD.BAR_Y + HUD.BAR_HEIGHT / 2,
        HUD.BAR_WIDTH,
        HUD.BAR_HEIGHT,
        0x333333
      )
      .setScrollFactor(0)
      .setDepth(100);

    // Fill (red)
    this.healthBarFill = scene.add
      .rectangle(
        HUD.BAR_X + HUD.BAR_WIDTH / 2,
        HUD.BAR_Y + HUD.BAR_HEIGHT / 2,
        HUD.BAR_WIDTH,
        HUD.BAR_HEIGHT,
        0xcc0000
      )
      .setScrollFactor(0)
      .setDepth(101);

    // --- Score ---
    this.scoreText = scene.add
      .text(780, HUD.BAR_Y - 10, 'SCORE: 0', {
        fontSize: '16px',
        color: '#ffcc00',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);
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

    // Change color based on HP level
    if (hpPercent > 0.5) {
      this.healthBarFill.setFillStyle(0xcc0000); // Red
    } else if (hpPercent > 0.25) {
      this.healthBarFill.setFillStyle(0xff6600); // Orange
    } else {
      this.healthBarFill.setFillStyle(0xff0000); // Bright red (critical)
    }

    // Update score
    this.scoreText.setText('SCORE: ' + this.batman.score);
  }

  destroy(): void {
    this.healthBarBg.destroy();
    this.healthBarFill.destroy();
    this.healthLabel.destroy();
    this.scoreText.destroy();
  }
}
