import { Scene } from 'phaser';
import { registerAnimations, createInputKeys } from '../controls/controls.utils';
import { loadGameplayAssets } from '../systems/AssetLoader';
import {
  LevelData,
  createPlatformsFromData,
  createBackgroundLayers,
  createFloor,
} from '../systems/LevelLoader';
import ParallaxBackground from '../systems/ParallaxBackground';
import { LEVELS } from '../data/levels';
import Batman from '../entities/Batman';
import Enemy from '../entities/Enemy';
import GangsterMelee from '../entities/enemies/GangsterMelee';
import GangsterRanged from '../entities/enemies/GangsterRanged';
import NPC from '../entities/NPC';
import HUD from '../ui/HUD';

/**
 * Generic gameplay scene that loads any level by ID.
 *
 * Accepts `{ levelId: string }` in its init data, looks up the level
 * from the registry, and builds the world accordingly. Legacy level-01
 * uses hand-placed background images; all other levels use the
 * ParallaxBackground system with city themes.
 */
export default class GameLevel extends Scene {
  private levelId!: string;
  private levelData!: LevelData;
  private batman!: Batman;
  private enemies: Enemy[] = [];
  private npcs: NPC[] = [];
  private hud!: HUD;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private gameMusic!: Phaser.Sound.BaseSound;
  private parallax: ParallaxBackground | null = null;
  private gameOver = false;
  private levelComplete = false;

  constructor() {
    super({ key: 'GameLevel' });
  }

  init(data: { levelId: string }): void {
    this.levelId = data.levelId;
    this.levelData = LEVELS[this.levelId];
  }

  preload(): void {
    // Core gameplay assets (sprites, platforms, audio)
    loadGameplayAssets(this.load);

    // Preload city parallax backgrounds for non-legacy levels
    if (this.levelData.background.theme !== 'legacy') {
      const themeNum = parseInt(this.levelData.background.theme, 10);
      ParallaxBackground.preloadTheme(this.load, themeNum, 'Night');
    }
  }

  create(): void {
    this.gameOver = false;
    this.levelComplete = false;
    this.enemies = [];
    this.npcs = [];
    this.parallax = null;

    // Music
    this.gameMusic = this.sound.add(this.levelData.music);
    this.gameMusic.play({ volume: 0.35, loop: true });

    // Background — legacy or parallax
    if (this.levelData.background.theme === 'legacy') {
      createBackgroundLayers(this, this.levelData.background.layers);
    } else {
      const themeNum = parseInt(this.levelData.background.theme, 10);
      this.parallax = new ParallaxBackground(this);
      this.parallax.createCityBackground(
        themeNum,
        'Night',
        this.levelData.worldWidth,
        this.levelData.worldHeight
      );
    }

    // Register all animations (Batman + enemies + NPCs)
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

    if (this.levelData.floor) {
      createFloor(
        this.physics,
        this.platforms,
        this.levelData.floor,
        this.levelData.worldWidth
      );
    }

    // Batman at spawn point
    this.batman = new Batman({
      scene: this,
      x: this.levelData.player.x,
      y: this.levelData.player.y,
      platforms: this.platforms,
    });

    // Enemies from level data — dispatch by type
    this.enemies = this.levelData.enemies.map((e) => {
      const config = {
        scene: this,
        x: e.x,
        y: e.y,
        platforms: this.platforms,
        patrolLeftBound: e.patrolLeftBound,
        patrolRightBound: e.patrolRightBound,
      };

      switch (e.type) {
        case 'gangster-melee':
          return new GangsterMelee(config, (Math.random() > 0.5 ? 2 : 1) as 1 | 2);
        case 'gangster-ranged':
          return new GangsterRanged(config);
        default:
          return new Enemy(config);
      }
    });

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

    // World bounds — only set width; height stays at game config (600)
    // so ground platforms at y=600 remain reachable
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

    // Update parallax scrolling
    if (this.parallax) {
      this.parallax.update();
    }

    // Update HUD
    this.hud.update();
    this.hud.setRescueCount(this.npcs.filter((n) => n.isRescued).length);

    // Check for game over
    if (this.batman.isDead()) {
      this.handleGameOver();
      return;
    }

    // Check for win — all enemies defeated
    if (this.enemies.every((e) => !e.isAlive)) {
      this.handleWin();
    }
  }

  private handleWin(): void {
    if (this.gameOver || this.levelComplete) return;

    this.levelComplete = true;
    this.gameMusic.stop();

    const rescuedCount = this.npcs.filter((n) => n.isRescued).length;

    this.time.delayedCall(500, () => {
      this.scene.start('LevelComplete', {
        score: this.batman.score,
        rescued: rescuedCount,
        levelName: this.levelData.name,
        levelId: this.levelId,
      });
    });
  }

  private handleGameOver(): void {
    if (this.gameOver || this.levelComplete) return;

    this.gameOver = true;
    this.batman.sprite.setVelocity(0, 0);
    this.batman.sprite.setTint(0xff0000);
    this.gameMusic.stop();

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOver', {
        score: this.batman.score,
        levelName: this.levelData.name,
        levelId: this.levelId,
      });
    });
  }
}
