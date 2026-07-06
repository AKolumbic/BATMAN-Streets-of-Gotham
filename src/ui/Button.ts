/**
 * Reusable button component.
 * Can use a UI kit image as background or fall back to a styled rectangle.
 */

export interface ButtonConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  text: string;
  textureKey?: string; // Optional UI kit button image
  width?: number;
  height?: number;
  fontSize?: string;
  color?: string;
  bgColor?: number;
  disabled?: boolean;
  onClick: () => void;
}

export default class Button {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;

  constructor(config: ButtonConfig) {
    const {
      scene,
      x,
      y,
      text,
      textureKey,
      width = 200,
      height = 50,
      fontSize = '20px',
      color = '#ffffff',
      bgColor = 0x333333,
      disabled = false,
      onClick,
    } = config;

    // Background — image or rectangle
    if (textureKey && scene.textures.exists(textureKey)) {
      this.bg = scene.add
        .image(0, 0, textureKey)
        .setDisplaySize(width, height);
    } else {
      this.bg = scene.add.rectangle(0, 0, width, height, bgColor);
    }

    if (!disabled) {
      this.bg.setInteractive({ useHandCursor: true });
    }

    // Label
    this.label = scene.add
      .text(0, 0, text, {
        fontSize,
        color,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Container
    this.container = scene.add
      .container(x, y, [this.bg, this.label])
      .setDepth(50);

    if (disabled) {
      return;
    }

    // Click handler
    this.bg.on('pointerdown', onClick);

    // Hover effects
    this.bg.on('pointerover', () => {
      this.label.setColor('#ffcc00');
      scene.tweens.add({
        targets: this.container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    this.bg.on('pointerout', () => {
      this.label.setColor(color);
      scene.tweens.add({
        targets: this.container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }
}
