import { Scene } from 'phaser';
import { registerAnimations, createInputKeys } from '../../controls/controls.utils';
import { getSceneAssets } from './LevelOne.utils';
import {
  LevelData,
  createPlatformsFromData,
  createBackgroundLayers,
} from '../../systems/LevelLoader';
import Batman from '../../entities/Batman';
import Enemy from '../../entities/Enemy';
import NPC from '../../entities/NPC';
import HUD from '../../ui/HUD';
import levelOneData from '../../data/levels/level-01.json';

export default class LevelOne extends Scene {
  private batman!: Batman;
  private enemies: Enemy[] = [];
  private npcs: NPC[] = [];
  private hud!: HUD;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private gameMusic!: Phaser.Sound.BaseSound;
  private gameOver = false;
  private levelComplete = false;
  private levelData: LevelData = levelOneData as LevelData;

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
    this.gameMusic = this.sound.add(this.levelData.music);
    this.gameMusic.play({ volume: 0.35, loop: true });

    // Parallax background layers from level data
    createBackgroundLayers(this, this.levelData.background.layers);

    // Register all animations (Batman + Enemy)
    registerAnimations(this.anims);

    // Input
    const input = createInputKeys(this);
    this.cursors = input.cursors;
    this.keys = input.keys;

    // Platforms from level data
    this.platforms = createPlatformsFromData(
      this.physics,
      this.levelData.platforms
    );

    // Batman at spawn point from level data
    this.batman = new Batman({
      scene: this,
      x: this.levelData.player.x,
      y: this.levelData.player.y,
      platforms: this.platforms,
    });

    // Enemies from level data
    this.enemies = this.levelData.enemies.map(
      (e) =>
        new Enemy({
          scene: this,
          x: e.x,
          y: e.y,
          platforms: this.platforms,
          patrolLeftBound: e.patrolLeftBound,
          patrolRightBound: e.patrolRightBound,
        })
    );

    // NPCs from level data
    this.npcs = this.levelData.npcs.map(
      (n) =>
        new NPC({
          scene: this,
          x: n.x,
          y: n.y,
          type: n.type,
          platforms: this.platforms,
        })
    );

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

    // World bounds from level data
    this.physics.world.bounds.width = this.levelData.worldWidth;

    // Camera
    this.cameras.main.setBounds(
      0,
      0,
      this.levelData.worldWidth,
      this.levelData.worldHeight
    );
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

    // Update NPCs
    this.npcs.forEach((npc) => {
      npc.update(this.batman);
    });

    // Update HUD
    this.hud.update();
    this.hud.setRescueCount(this.npcs.filter((n) => n.isRescued).length);

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
    this.gameMusic.stop();

    const rescuedCount = this.npcs.filter((n) => n.isRescued).length;

    // Brief delay before transitioning to the victory scene
    this.time.delayedCall(500, () => {
      this.scene.start('LevelComplete', {
        score: this.batman.score,
        rescued: rescuedCount,
        levelName: this.levelData.name,
      });
    });
  }

  private handleGameOver(): void {
    this.gameOver = true;
    this.batman.sprite.setVelocity(0, 0);
    this.batman.sprite.setTint(0xff0000);
    this.gameMusic.stop();

    // Brief delay before transitioning to the game over scene
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOver', {
        score: this.batman.score,
        levelName: this.levelData.name,
      });
    });
  }
}
