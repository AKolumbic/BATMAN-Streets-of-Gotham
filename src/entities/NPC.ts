import Batman from './Batman';
import { NPC as NPCConstants } from '../constants/physics';

export enum NPCState {
  IDLE = 'IDLE',
  RESCUED = 'RESCUED',
  FLEEING = 'FLEEING',
  GONE = 'GONE',
}

export interface NPCConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  type: string; // e.g. 'homeless-1', 'homeless-2', 'homeless-3'
  platforms: Phaser.Physics.Arcade.StaticGroup;
}

/**
 * NPC civilian that Batman can rescue by approaching.
 * When rescued, plays the "special" animation, then flees off-screen.
 */
export default class NPC {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public state: NPCState = NPCState.IDLE;
  public isRescued = false;

  private scene: Phaser.Scene;
  private animPrefix: string;
  private hasSpecialAnim: boolean;

  constructor(config: NPCConfig) {
    this.scene = config.scene;

    // Map type string to animation prefix
    // 'homeless-1' -> 'homeless1', 'homeless-3' -> 'homeless3'
    this.animPrefix = config.type.replace('-', '');

    // Only homeless1 and homeless3 have "special" animations
    this.hasSpecialAnim =
      config.type === 'homeless-1' || config.type === 'homeless-3';

    // Create physics sprite
    const idleKey = `${this.animPrefix}-idle`;
    this.sprite = config.scene.physics.add
      .sprite(config.x, config.y, idleKey)
      .setScale(0.7) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    this.sprite.body.setSize(50, 100);
    this.sprite.body.setOffset(39, 28);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setGravityY(200);

    // Collide with platforms
    config.scene.physics.add.collider(this.sprite, config.platforms);

    // Start idle animation
    this.sprite.play(`${this.animPrefix}-idle-anim`, true);

    // Rescue indicator — small floating text
    const indicator = config.scene.add
      .text(config.x, config.y - 50, '?', {
        fontSize: '16px',
        color: '#ffcc00',
        fontStyle: 'bold',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(50);

    // Floating animation for the indicator
    config.scene.tweens.add({
      targets: indicator,
      y: config.y - 60,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Store the indicator so we can remove it on rescue
    (this.sprite as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
      _indicator?: Phaser.GameObjects.Text;
    })._indicator = indicator;
  }

  update(batman: Batman): void {
    if (this.state === NPCState.GONE || this.state === NPCState.FLEEING) {
      // Check if the NPC has fled off-screen (use world bounds + margin)
      const worldWidth = this.scene.physics.world.bounds.width;
      if (
        this.state === NPCState.FLEEING &&
        (this.sprite.x < -100 || this.sprite.x > worldWidth + 100)
      ) {
        this.state = NPCState.GONE;
        this.sprite.destroy();
      }
      return;
    }

    if (this.state === NPCState.RESCUED) return;

    // Check if Batman is close enough to rescue
    const distX = Math.abs(this.sprite.x - batman.sprite.x);
    const distY = Math.abs(this.sprite.y - batman.sprite.y);

    if (distX < NPCConstants.RESCUE_RANGE && distY < NPCConstants.RESCUE_RANGE) {
      this.rescue(batman);
    }
  }

  private rescue(batman: Batman): void {
    this.state = NPCState.RESCUED;
    this.isRescued = true;
    batman.score += NPCConstants.RESCUE_SCORE;

    // Remove the indicator
    const indicator = (
      this.sprite as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
        _indicator?: Phaser.GameObjects.Text;
      }
    )._indicator;
    if (indicator) {
      indicator.destroy();
    }

    // Show "+150" score popup
    const popup = this.scene.add
      .text(this.sprite.x, this.sprite.y - 40, `+${NPCConstants.RESCUE_SCORE}`, {
        fontSize: '14px',
        color: '#00ff00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.scene.tweens.add({
      targets: popup,
      y: popup.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => popup.destroy(),
    });

    // Play special animation if available, then flee
    if (this.hasSpecialAnim) {
      this.sprite.play(`${this.animPrefix}-special-anim`);
      this.sprite.once(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        () => {
          this.startFleeing(batman);
        }
      );
    } else {
      // No special anim — flee immediately
      this.startFleeing(batman);
    }
  }

  private startFleeing(batman: Batman): void {
    this.state = NPCState.FLEEING;

    // Flee away from Batman
    const fleeRight = this.sprite.x > batman.sprite.x;
    this.sprite.setFlipX(!fleeRight);
    this.sprite.play(`${this.animPrefix}-run-anim`, true);
    this.sprite.setVelocityX(
      fleeRight ? NPCConstants.RUN_SPEED : -NPCConstants.RUN_SPEED
    );
    this.sprite.setCollideWorldBounds(false);
  }

  destroy(): void {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
}
