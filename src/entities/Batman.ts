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
  private prevState: BatmanState = BatmanState.IDLE;
  private prevFacing = true;
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
      (this.state === BatmanState.FALLING ||
        this.state === BatmanState.JUMPING) &&
      onGround
    ) {
      this.state = BatmanState.IDLE;
    }

    // Punching locks out other actions until animation completes
    if (this.state === BatmanState.PUNCHING) {
      this.sprite.setVelocityX(0);
      return;
    }

    // --- Input handling ---

    const leftDown = cursors.left.isDown || keys.A.isDown;
    const rightDown = cursors.right.isDown || keys.D.isDown;
    const jumpDown =
      cursors.up.isDown || cursors.space.isDown || keys.W.isDown;
    const crouchDown = cursors.down.isDown || keys.S.isDown;
    const punchDown = keys.ONE.isDown;

    // Punch
    if (punchDown && onGround) {
      this.state = BatmanState.PUNCHING;
      this.sprite.setVelocityX(0);
      const punchAnim = this.facingRight ? 'punch' : 'punch-left';
      this.sprite.play(punchAnim);
      this.prevState = BatmanState.PUNCHING;
      this.prevFacing = this.facingRight;
      return;
    }

    // Jump
    if (jumpDown && onGround) {
      this.state = BatmanState.JUMPING;
      this.sprite.setVelocityY(Batman.JUMP_VELOCITY);
    }

    // Horizontal movement
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
      if (this.state !== BatmanState.JUMPING) {
        if (crouchDown) {
          this.state = BatmanState.CROUCHING;
        } else {
          this.state = BatmanState.IDLE;
        }
      }
    }

    // --- Animation selection ---
    this.playAnimation();
  }

  private playAnimation(): void {
    // Only change animation when state or facing changes
    const stateChanged = this.state !== this.prevState;
    const facingChanged = this.facingRight !== this.prevFacing;

    if (!stateChanged && !facingChanged) return;

    this.prevState = this.state;
    this.prevFacing = this.facingRight;

    switch (this.state) {
      case BatmanState.IDLE:
        this.sprite.play('stand');
        break;
      case BatmanState.RUNNING:
        this.sprite.play(this.facingRight ? 'right' : 'left');
        break;
      case BatmanState.JUMPING:
      case BatmanState.FALLING:
        this.sprite.play(this.facingRight ? 'up' : 'up-left');
        break;
      case BatmanState.CROUCHING:
        this.sprite.play('crouch');
        break;
      // PUNCHING is triggered directly in update()
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
    this.prevState = BatmanState.FALLING;

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
