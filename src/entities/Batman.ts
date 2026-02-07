import { Animations, Geom } from 'phaser';

export enum BatmanState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  JUMPING = 'JUMPING',
  FALLING = 'FALLING',
  PUNCHING = 'PUNCHING',
  CROUCHING = 'CROUCHING',
}

export interface BatmanConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  platforms: Phaser.Physics.Arcade.StaticGroup;
}

export default class Batman {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public state: BatmanState = BatmanState.IDLE;
  public facingRight = true;
  public hp: number;
  public maxHp: number;
  public isInvulnerable = false;
  public score = 0;

  private scene: Phaser.Scene;
  private invulnerabilityTimer: Phaser.Time.TimerEvent | null = null;
  private flickerTimer: Phaser.Time.TimerEvent | null = null;

  private static readonly MOVE_SPEED = 160;
  private static readonly JUMP_VELOCITY = -400;
  private static readonly EXTRA_GRAVITY = 200;
  private static readonly INVULNERABILITY_MS = 1000;
  private static readonly KNOCKBACK_X = 200;
  private static readonly KNOCKBACK_Y = -150;

  constructor(config: BatmanConfig) {
    this.scene = config.scene;
    this.maxHp = 5;
    this.hp = this.maxHp;

    // Create physics sprite
    this.sprite = config.scene.physics.add
      .sprite(config.x, config.y, 'stand')
      .setScale(1.15) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setGravityY(Batman.EXTRA_GRAVITY);

    // Collide with platforms
    config.scene.physics.add.collider(this.sprite, config.platforms);

    // Listen for punch animation completion
    this.sprite.on(
      Animations.Events.ANIMATION_COMPLETE,
      (anim: Animations.Animation) => {
        if (anim.key === 'punch' || anim.key === 'punch-left') {
          this.state = BatmanState.IDLE;
        }
      }
    );
  }

  update(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    keys: { [key: string]: Phaser.Input.Keyboard.Key }
  ): void {
    const onGround = this.sprite.body.touching.down;

    // Handle state transitions based on physics
    if (this.state === BatmanState.JUMPING && this.sprite.body.velocity.y > 0) {
      this.state = BatmanState.FALLING;
    }
    if (
      (this.state === BatmanState.FALLING || this.state === BatmanState.JUMPING) &&
      onGround
    ) {
      this.state = BatmanState.IDLE;
    }

    // Punching locks out other actions until animation completes
    if (this.state === BatmanState.PUNCHING) {
      this.sprite.setVelocityX(0);
      // Animation is already playing; wait for ANIMATION_COMPLETE
      return;
    }

    // --- Input handling ---

    const leftDown = cursors.left.isDown || keys.A.isDown;
    const rightDown = cursors.right.isDown || keys.D.isDown;
    const jumpDown = cursors.up.isDown || cursors.space.isDown || keys.W.isDown;
    const crouchDown = cursors.down.isDown || keys.S.isDown;
    const punchDown = keys.ONE.isDown;

    // Punch (only when grounded — PUNCHING state already returned above)
    if (punchDown && onGround) {
      this.state = BatmanState.PUNCHING;
      this.sprite.setVelocityX(0);
      const punchAnim = this.facingRight ? 'punch' : 'punch-left';
      this.sprite.play(punchAnim);
      return;
    }

    // Jump (only when grounded)
    if (jumpDown && onGround) {
      this.state = BatmanState.JUMPING;
      this.sprite.setVelocityY(Batman.JUMP_VELOCITY);
    }

    // Horizontal movement (allowed during all states except punching)
    if (leftDown) {
      this.sprite.setVelocityX(-Batman.MOVE_SPEED);
      this.facingRight = false;
      if (onGround && this.state !== BatmanState.JUMPING) {
        this.state = BatmanState.RUNNING;
      }
    } else if (rightDown) {
      this.sprite.setVelocityX(Batman.MOVE_SPEED);
      this.facingRight = true;
      if (onGround && this.state !== BatmanState.JUMPING) {
        this.state = BatmanState.RUNNING;
      }
    } else if (onGround) {
      this.sprite.setVelocityX(0);
      if (
        this.state !== BatmanState.JUMPING &&
        this.state !== BatmanState.CROUCHING
      ) {
        // Crouch
        if (crouchDown) {
          this.state = BatmanState.CROUCHING;
        } else {
          this.state = BatmanState.IDLE;
        }
      }
    }

    // Release crouch
    if (this.state === BatmanState.CROUCHING && !crouchDown) {
      this.state = BatmanState.IDLE;
    }

    // --- Animation selection ---
    this.playAnimation();
  }

  private playAnimation(): void {
    const currentKey = this.sprite.anims.currentAnim?.key;

    switch (this.state) {
      case BatmanState.IDLE:
        if (currentKey !== 'stand') {
          this.sprite.play('stand');
        }
        break;
      case BatmanState.RUNNING:
        if (this.facingRight) {
          this.sprite.play('right', true);
        } else {
          this.sprite.play('left', true);
        }
        break;
      case BatmanState.JUMPING:
      case BatmanState.FALLING:
        if (this.facingRight) {
          this.sprite.play('up', true);
        } else {
          this.sprite.play('up-left', true);
        }
        break;
      case BatmanState.CROUCHING:
        // Play once and hold last frame — check by key to prevent restart loop
        if (currentKey !== 'crouch') {
          this.sprite.play('crouch');
        }
        break;
      // PUNCHING animation is triggered directly in update(), not here
    }
  }

  takeDamage(amount: number, enemyX: number): void {
    if (this.isInvulnerable || this.hp <= 0) return;

    this.hp = Math.max(0, this.hp - amount);
    this.isInvulnerable = true;

    // Knockback away from enemy
    const knockbackDir = this.sprite.x < enemyX ? -1 : 1;
    this.sprite.setVelocityX(Batman.KNOCKBACK_X * knockbackDir);
    this.sprite.setVelocityY(Batman.KNOCKBACK_Y);
    this.state = BatmanState.FALLING;

    // Flicker effect during i-frames
    this.flickerTimer = this.scene.time.addEvent({
      delay: 80,
      repeat: Math.floor(Batman.INVULNERABILITY_MS / 80),
      callback: () => {
        this.sprite.setAlpha(this.sprite.alpha === 1 ? 0.3 : 1);
      },
    });

    // End invulnerability
    this.invulnerabilityTimer = this.scene.time.delayedCall(
      Batman.INVULNERABILITY_MS,
      () => {
        this.isInvulnerable = false;
        this.sprite.setAlpha(1);
        if (this.flickerTimer) {
          this.flickerTimer.destroy();
          this.flickerTimer = null;
        }
      }
    );
  }

  /**
   * Returns a rectangle representing the punch hitbox
   * in world coordinates, or null if not punching.
   */
  getPunchHitbox(): Geom.Rectangle | null {
    if (this.state !== BatmanState.PUNCHING) return null;

    const punchRange = 40;
    const punchWidth = 30;
    const punchHeight = 30;

    const x = this.facingRight
      ? this.sprite.x + punchRange
      : this.sprite.x - punchRange - punchWidth;
    const y = this.sprite.y - punchHeight / 2;

    return new Geom.Rectangle(x, y, punchWidth, punchHeight);
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  destroy(): void {
    if (this.invulnerabilityTimer) this.invulnerabilityTimer.destroy();
    if (this.flickerTimer) this.flickerTimer.destroy();
    this.sprite.destroy();
  }
}
