import { Scene } from 'phaser';
import { registerAnimations, createInputKeys } from '../../controls/controls.utils';
import { getSceneAssets, createPlatforms } from './LevelOne.utils';
import Batman from '../../entities/Batman';
import Enemy from '../../entities/Enemy';
import HUD from '../../ui/HUD';

export default class LevelOne extends Scene {
  private batman!: Batman;
  private enemies: Enemy[] = [];
  private hud!: HUD;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private gameMusic!: Phaser.Sound.BaseSound;
  private gameOver = false;
  private levelComplete = false;

  constructor() {
    super({ key: 'LevelOne' });
  }

  preload(): void {
    getSceneAssets(this.load);
  }

  create(): void {
    this.gameOver = false;
    this.levelComplete = false;

    // Music
    this.gameMusic = this.sound.add('gameMusic');
    this.gameMusic.play({ volume: 0.35, loop: true });

    // Parallax background layers
    this.add.image(1411, 185, 'starry-night');
    this.add.image(1411, 310, 'background');
    this.add.image(1411, 390, 'foreground');

    // Register all animations (Batman + Enemy)
    registerAnimations(this.anims);

    // Input
    const input = createInputKeys(this);
    this.cursors = input.cursors;
    this.keys = input.keys;

    // Platforms
    this.platforms = createPlatforms(this.physics);

    // Batman
    this.batman = new Batman({
      scene: this,
      x: 100,
      y: 450,
      platforms: this.platforms,
    });

    // Enemies — placed on ground and platforms
    this.enemies = [
      new Enemy({
        scene: this,
        x: 600,
        y: 450,
        platforms: this.platforms,
        patrolLeftBound: 450,
        patrolRightBound: 750,
      }),
      new Enemy({
        scene: this,
        x: 1500,
        y: 450,
        platforms: this.platforms,
        patrolLeftBound: 1400,
        patrolRightBound: 1700,
      }),
      new Enemy({
        scene: this,
        x: 2300,
        y: 100,
        platforms: this.platforms,
        patrolLeftBound: 2200,
        patrolRightBound: 2550,
      }),
    ];

    // Batman-Enemy overlap for contact damage
    this.enemies.forEach((enemy) => {
      this.physics.add.overlap(
        this.batman.sprite,
        enemy.sprite,
        () => {
          enemy.handleBatmanOverlap(this.batman);
        },
        undefined,
        this
      );
    });

    // World bounds
    this.physics.world.bounds.width = 2822;

    // Camera
    this.cameras.main.setBounds(0, 0, 2822, 384);
    this.cameras.main.startFollow(this.batman.sprite);

    // HUD
    this.hud = new HUD(this, this.batman);
  }

  update(): void {
    if (this.gameOver || this.levelComplete) return;

    // Update Batman
    this.batman.update(this.cursors, this.keys);

    // Update enemies
    this.enemies.forEach((enemy) => {
      enemy.update(this.batman);
    });

    // Update HUD
    this.hud.update();

    // Check for game over
    if (this.batman.isDead()) {
      this.handleGameOver();
    }

    // Check for win — all enemies defeated
    if (this.enemies.every((e) => !e.isAlive)) {
      this.handleWin();
    }
  }

  private handleWin(): void {
    this.levelComplete = true;

    const centerX = this.cameras.main.scrollX + 400;
    const centerY = this.cameras.main.scrollY + 150;

    this.add
      .text(centerX, centerY, 'GOTHAM IS SAFE', {
        fontSize: '42px',
        color: '#ffcc00',
        fontStyle: 'bold',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(200);

    this.add
      .text(centerX, centerY + 50, 'SCORE: ' + this.batman.score, {
        fontSize: '24px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(200);

    const restartText = this.add
      .text(centerX, centerY + 100, 'Press SPACE to play again', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(200);

    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        restartText.setAlpha(restartText.alpha === 1 ? 0.3 : 1);
      },
    });

    this.input.keyboard.once('keydown-SPACE', () => {
      this.gameMusic.stop();
      this.scene.restart();
    });
  }

  private handleGameOver(): void {
    this.gameOver = true;
    this.batman.sprite.setVelocity(0, 0);
    this.batman.sprite.setTint(0xff0000);

    // Display game over text
    const centerX = this.cameras.main.scrollX + 400;
    const centerY = this.cameras.main.scrollY + 200;

    this.add
      .text(centerX, centerY, 'GAME OVER', {
        fontSize: '48px',
        color: '#ff0000',
        fontStyle: 'bold',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(200);

    const restartText = this.add
      .text(centerX, centerY + 60, 'Press SPACE to restart', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(200);

    // Flicker the restart text
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        restartText.setAlpha(restartText.alpha === 1 ? 0.3 : 1);
      },
    });

    // Listen for restart
    this.input.keyboard.once('keydown-SPACE', () => {
      this.gameMusic.stop();
      this.scene.restart();
    });
  }
}
