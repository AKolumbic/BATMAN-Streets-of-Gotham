import { Animations, Geom } from 'phaser';
import Batman from './Batman';
import { ENEMY } from '../constants/physics';

export enum EnemyState {
  PATROL = 'PATROL',
  ATTACKING = 'ATTACKING',
  DEAD = 'DEAD',
}

export interface EnemyConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  platforms: Phaser.Physics.Arcade.StaticGroup;
  patrolLeftBound: number;
  patrolRightBound: number;
}

/**
 * Base enemy class. Handles patrol, attack-range detection, damage,
 * hit stun, death, and score. Subclasses override animation keys
 * and attack behaviour.
 */
export default class Enemy {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public state: EnemyState = EnemyState.PATROL;
  public hp: number;
  public maxHp: number;
  public isAlive = true;

  protected scene: Phaser.Scene;
  protected facingRight: boolean;
  protected patrolLeftBound: number;
  protected patrolRightBound: number;
  protected attackCooldown = false;
  protected hitStunned = false;

  // Subclasses may override these for their own sprite sheets
  protected walkAnimKey = 'enemy-walk';
  protected attackAnimKey = 'enemy-punch';

  constructor(config: EnemyConfig) {
    this.scene = config.scene;
    this.maxHp = ENEMY.MAX_HP;
    this.hp = this.maxHp;
    this.patrolLeftBound = config.patrolLeftBound;
    this.patrolRightBound = config.patrolRightBound;
    this.facingRight = true;

    // Create physics sprite — subclasses call initSprite() after super()
    this.sprite = this.createSprite(config);

    // Collide with platforms
    config.scene.physics.add.collider(this.sprite, config.platforms);

    // Start walking
    this.sprite.play(this.walkAnimKey, true);
    this.sprite.setVelocityX(ENEMY.PATROL_SPEED);

    // Listen for attack animation completion
    this.sprite.on(
      Animations.Events.ANIMATION_COMPLETE,
      (anim: Animations.Animation) => this.onAnimationComplete(anim)
    );
  }

  protected onAnimationComplete(anim: Animations.Animation): void {
    if (anim.key === this.attackAnimKey && this.isAlive) {
      this.resumePatrol();
    }
  }

  protected resumePatrol(): void {
    this.state = EnemyState.PATROL;
    this.sprite.play(this.walkAnimKey, true);
    const speed = this.facingRight ? ENEMY.PATROL_SPEED : -ENEMY.PATROL_SPEED;
    this.sprite.setVelocityX(speed);
  }

  /**
   * Create the physics sprite. Subclasses can override to use different
   * textures and body sizes.
   */
  protected createSprite(
    config: EnemyConfig
  ): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    const sprite = config.scene.physics.add
      .sprite(config.x, config.y, 'enemy')
      .setScale(ENEMY.SCALE) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    sprite.body.setSize(150, 200);
    sprite.body.setOffset(35, 20);
    sprite.setCollideWorldBounds(true);
    sprite.body.setGravityY(200);

    return sprite;
  }

  update(batman: Batman): void {
    if (!this.isAlive || this.state === EnemyState.DEAD) return;

    // --- Patrol logic ---
    if (this.state === EnemyState.PATROL) {
      if (this.sprite.x >= this.patrolRightBound) {
        this.facingRight = false;
        this.sprite.setVelocityX(-ENEMY.PATROL_SPEED);
        this.sprite.setFlipX(true);
      } else if (this.sprite.x <= this.patrolLeftBound) {
        this.facingRight = true;
        this.sprite.setVelocityX(ENEMY.PATROL_SPEED);
        this.sprite.setFlipX(false);
      }

      // Check if Batman is in attack range
      const distX = Math.abs(this.sprite.x - batman.sprite.x);
      const distY = Math.abs(this.sprite.y - batman.sprite.y);

      if (
        distX < ENEMY.ATTACK_RANGE &&
        distY < ENEMY.ATTACK_RANGE_Y &&
        !this.attackCooldown
      ) {
        this.attack();
      }
    }

    // --- Check if Batman's punch hits this enemy ---
    const punchHitbox = batman.getPunchHitbox();
    if (punchHitbox && this.isAlive && !this.hitStunned) {
      const enemyBounds = this.sprite.getBounds();
      if (Geom.Rectangle.Overlaps(punchHitbox, enemyBounds)) {
        this.takeDamage(1, batman);
      }
    }
  }

  protected attack(): void {
    this.state = EnemyState.ATTACKING;
    this.sprite.setVelocityX(0);
    this.sprite.play(this.attackAnimKey);

    this.attackCooldown = true;
    this.scene.time.delayedCall(ENEMY.ATTACK_COOLDOWN_MS, () => {
      this.attackCooldown = false;
    });
  }

  handleBatmanOverlap(batman: Batman): void {
    if (!this.isAlive || batman.isInvulnerable || batman.isDead()) return;
    batman.takeDamage(ENEMY.DAMAGE_TO_BATMAN, this.sprite.x);
  }

  protected takeDamage(amount: number, batman: Batman): void {
    if (!this.isAlive || this.hitStunned) return;

    this.hp -= amount;
    this.hitStunned = true;

    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(ENEMY.HIT_STUN_MS, () => {
      this.hitStunned = false;
      if (this.isAlive) this.sprite.clearTint();
    });

    if (this.hp <= 0) {
      this.die(batman);
    }
  }

  protected die(batman: Batman): void {
    this.isAlive = false;
    this.state = EnemyState.DEAD;
    batman.score += ENEMY.SCORE_VALUE;

    this.sprite.setVelocity(0, 0);
    this.sprite.body.enable = false;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }

  destroy(): void {
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }
}
