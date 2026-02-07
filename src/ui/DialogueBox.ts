/**
 * DialogueBox — displays text in a styled box, used for NPC interactions
 * and game messages. Uses the UI kit dialogue images when available.
 */

export interface DialogueConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string;
  textureKey?: string; // Optional UI kit dialogue image
  autoHideMs?: number; // Auto-hide after this many ms (0 = manual)
}

export default class DialogueBox {
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private scene: Phaser.Scene;

  constructor(config: DialogueConfig) {
    const {
      scene,
      x,
      y,
      width = 400,
      height = 100,
      text,
      textureKey,
      autoHideMs = 0,
    } = config;

    this.scene = scene;

    // Background
    if (textureKey && scene.textures.exists(textureKey)) {
      this.bg = scene.add
        .image(0, 0, textureKey)
        .setDisplaySize(width, height);
    } else {
      this.bg = scene.add
        .rectangle(0, 0, width, height, 0x1a1a2e, 0.9)
        .setStrokeStyle(2, 0xffcc00);
    }

    // Text
    this.label = scene.add
      .text(0, 0, text, {
        fontSize: '14px',
        color: '#ffffff',
        wordWrap: { width: width - 40 },
        align: 'center',
      })
      .setOrigin(0.5);

    // Container
    this.container = scene.add
      .container(x, y, [this.bg, this.label])
      .setDepth(150)
      .setAlpha(0);

    // Fade in
    scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200,
    });

    // Auto-hide
    if (autoHideMs > 0) {
      scene.time.delayedCall(autoHideMs, () => this.hide());
    }
  }

  setText(text: string): void {
    this.label.setText(text);
  }

  hide(): void {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      onComplete: () => this.container.destroy(),
    });
  }

  destroy(): void {
    this.container.destroy();
  }
}
