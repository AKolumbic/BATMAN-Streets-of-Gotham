import { Animations, Geom } from 'phaser';
import Batman from './Batman';

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

export default class Enemy {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public state: EnemyState = EnemyState.PATROL;
  public hp: number;
  public maxHp: number;
  public isAlive = true;

  private scene: Phaser.Scene;
  private facingRight: boolean;
  private patrolLeftBound: number;
  private patrolRightBound: number;
  private attackCooldown = false;
  private hitStunned = false;

  private static readonly PATROL_SPEED = 60;
  private static readonly ATTACK_RANGE = 100;
  private static readonly DAMAGE_TO_BATMAN = 1;
  private static readonly SCORE_VALUE = 100;

  constructor(config: EnemyConfig) {
    this.scene = config.scene;
    this.maxHp = 3;
    this.hp = this.maxHp;
    this.patrolLeftBound = config.patrolLeftBound;
    this.patrolRightBound = config.patrolRightBound;
    this.facingRight = true;

    // Create physics sprite
    this.sprite = config.scene.physics.add
      .sprite(config.x, config.y, 'enemy')
      .setScale(0.4) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    // Adjust the physics body to be smaller than the visual sprite
    this.sprite.body.setSize(150, 200);
    this.sprite.body.setOffset(35, 20);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setGravityY(200);

    // Collide with platforms
    config.scene.physics.add.collider(this.sprite, config.platforms);

    // Start walking
    this.sprite.play('enemy-walk', true);
    this.sprite.setVelocityX(Enemy.PATROL_SPEED);

    // Listen for attack animation completion
    this.sprite.on(
      Animations.Events.ANIMATION_COMPLETE,
      (anim: Animations.Animation) => {
        if (anim.key === 'enemy-punch' && this.isAlive) {
          this.state = EnemyState.PATROL;
          this.sprite.play('enemy-walk', true);
          // Resume patrol movement in current facing direction
          const speed = this.facingRight
            ? Enemy.PATROL_SPEED
            : -Enemy.PATROL_SPEED;
          this.sprite.setVelocityX(speed);
        }
      }
    );
  }

  update(batman: Batman): void {
    if (!this.isAlive || this.state === EnemyState.DEAD) return;

    // --- Patrol logic ---
    if (this.state === EnemyState.PATROL) {
      // Reverse direction at patrol bounds
      if (this.sprite.x >= this.patrolRightBound) {
        this.facingRight = false;
        this.sprite.setVelocityX(-Enemy.PATROL_SPEED);
        this.sprite.setFlipX(true);
      } else if (this.sprite.x <= this.patrolLeftBound) {
        this.facingRight = true;
        this.sprite.setVelocityX(Enemy.PATROL_SPEED);
        this.sprite.setFlipX(false);
      }

      // Check if Batman is in attack range
      const distX = Math.abs(this.sprite.x - batman.sprite.x);
      const distY = Math.abs(this.sprite.y - batman.sprite.y);

      if (distX < Enemy.ATTACK_RANGE && distY < 80 && !this.attackCooldown) {
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

  private attack(): void {
    this.state = EnemyState.ATTACKING;
    this.sprite.setVelocityX(0);
    this.sprite.play('enemy-punch');

    // Cooldown so the enemy doesn't spam attacks
    this.attackCooldown = true;
    this.scene.time.delayedCall(1500, () => {
      this.attackCooldown = false;
    });
  }

  /**
   * Check if Batman's body overlaps with this enemy's body.
   * Called from the scene's overlap handler.
   */
  handleBatmanOverlap(batman: Batman): void {
    if (!this.isAlive || batman.isInvulnerable || batman.isDead()) return;

    batman.takeDamage(Enemy.DAMAGE_TO_BATMAN, this.sprite.x);
  }

  private takeDamage(amount: number, batman: Batman): void {
    if (!this.isAlive || this.hitStunned) return;

    this.hp -= amount;
    this.hitStunned = true;

    // Flash red on hit
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(400, () => {
      this.hitStunned = false;
      if (this.isAlive) this.sprite.clearTint();
    });

    if (this.hp <= 0) {
      this.die(batman);
    }
  }

  private die(batman: Batman): void {
    this.isAlive = false;
    this.state = EnemyState.DEAD;
    batman.score += Enemy.SCORE_VALUE;

    // Death effect: fade out and destroy
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
