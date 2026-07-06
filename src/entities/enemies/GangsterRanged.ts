import { Animations } from 'phaser';
import Enemy, { EnemyConfig, EnemyState } from '../Enemy';
import Batman from '../Batman';
import { ENEMY } from '../../constants/physics';

/**
 * Ranged gangster enemy (Gangsters_3 sprite pack).
 * Fires bullets at Batman from a distance, recharges between shots.
 */
export default class GangsterRanged extends Enemy {
  private bullets: Phaser.Physics.Arcade.Group;
  private isRecharging = false;

  private static readonly SHOT_RANGE = 250;
  private static readonly BULLET_SPEED = 300;
  private static readonly RECHARGE_MS = 2500;

  constructor(config: EnemyConfig) {
    super(config);

    this.walkAnimKey = 'gangster3-walk-anim';
    this.attackAnimKey = 'gangster3-shot-anim';

    // Bullet pool
    this.bullets = config.scene.physics.add.group({
      maxSize: 5,
      allowGravity: false,
    });

    // Re-start walk with the correct anim key
    if (this.sprite.active) {
      this.sprite.play(this.walkAnimKey, true);
    }
  }

  protected override onAnimationComplete(anim: Animations.Animation): void {
    if (!this.isAlive) return;

    if (anim.key === this.attackAnimKey) {
      this.isRecharging = true;
      this.sprite.setVelocityX(0);
      this.sprite.play('gangster3-recharge-anim');
      return;
    }

    if (anim.key === 'gangster3-recharge-anim') {
      this.isRecharging = false;
      this.resumePatrol();
    }
  }

  protected override createSprite(
    config: EnemyConfig
  ): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    const sprite = config.scene.physics.add
      .sprite(config.x, config.y, 'gangster3-idle')
      .setScale(0.8) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    sprite.body.setSize(60, 100);
    sprite.body.setOffset(34, 28);
    sprite.setCollideWorldBounds(true);
    sprite.body.setGravityY(200);

    return sprite;
  }

  override update(batman: Batman): void {
    if (!this.isAlive || this.state === EnemyState.DEAD) return;

    // Skip normal patrol AI if recharging
    if (this.isRecharging) return;

    // Ranged enemies check a longer range
    if (this.state === EnemyState.PATROL) {
      // Standard patrol movement
      if (this.sprite.x >= this.patrolRightBound) {
        this.facingRight = false;
        this.sprite.setVelocityX(-ENEMY.PATROL_SPEED);
        this.sprite.setFlipX(true);
      } else if (this.sprite.x <= this.patrolLeftBound) {
        this.facingRight = true;
        this.sprite.setVelocityX(ENEMY.PATROL_SPEED);
        this.sprite.setFlipX(false);
      }

      const distX = Math.abs(this.sprite.x - batman.sprite.x);
      const distY = Math.abs(this.sprite.y - batman.sprite.y);

      if (
        distX < GangsterRanged.SHOT_RANGE &&
        distY < ENEMY.ATTACK_RANGE_Y &&
        !this.attackCooldown
      ) {
        this.shoot(batman);
      }
    }

    // Check punch hitbox
    const punchHitbox = batman.getPunchHitbox();
    if (punchHitbox && this.isAlive && !this.hitStunned) {
      const enemyBounds = this.sprite.getBounds();
      if (Phaser.Geom.Rectangle.Overlaps(punchHitbox, enemyBounds)) {
        this.takeDamage(1, batman);
      }
    }
  }

  private shoot(batman: Batman): void {
    this.state = EnemyState.ATTACKING;
    this.sprite.setVelocityX(0);

    // Face Batman
    this.facingRight = batman.sprite.x > this.sprite.x;
    this.sprite.setFlipX(!this.facingRight);

    this.sprite.play(this.attackAnimKey);

    // Spawn bullet at animation midpoint
    this.scene.time.delayedCall(200, () => {
      if (!this.isAlive) return;

      const bullet = this.bullets.create(
        this.sprite.x + (this.facingRight ? 40 : -40),
        this.sprite.y,
        'gangster3-shot'
      ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null;

      if (bullet) {
        bullet.setScale(0.5);
        bullet.body.setAllowGravity(false);
        const vx = this.facingRight
          ? GangsterRanged.BULLET_SPEED
          : -GangsterRanged.BULLET_SPEED;
        bullet.setVelocityX(vx);

        // Destroy bullet after 2 seconds
        this.scene.time.delayedCall(2000, () => {
          if (bullet.active) bullet.destroy();
        });

        // Overlap with Batman
        this.scene.physics.add.overlap(
          batman.sprite,
          bullet,
          () => {
            if (!batman.isInvulnerable && !batman.isDead()) {
              batman.takeDamage(ENEMY.DAMAGE_TO_BATMAN, bullet.x);
              bullet.destroy();
            }
          },
          undefined,
          this
        );
      }
    });

    this.attackCooldown = true;
    this.scene.time.delayedCall(GangsterRanged.RECHARGE_MS, () => {
      this.attackCooldown = false;
    });
  }
}
