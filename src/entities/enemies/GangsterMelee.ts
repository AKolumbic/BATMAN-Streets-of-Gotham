import Enemy, { EnemyConfig } from '../Enemy';

/**
 * Melee gangster enemy (Gangsters_1 / Gangsters_2 sprite packs).
 * Uses 128x128 character sprite sheets.
 * Attacks with close-range punches — no projectiles.
 */
export default class GangsterMelee extends Enemy {
  private variant: 1 | 2;

  constructor(config: EnemyConfig, variant: 1 | 2 = 1) {
    super(config);
    this.variant = variant;

    const prefix = `gangster${variant}`;
    this.walkAnimKey = `${prefix}-walk-anim`;
    this.attackAnimKey = `${prefix}-attack-anim`;

    // Re-start walk with the correct anim key
    if (this.sprite.active) {
      this.sprite.play(this.walkAnimKey, true);
    }
  }

  protected override createSprite(
    config: EnemyConfig
  ): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    // Determine idle texture key for this variant
    const textureKey = `gangster${this.variant ?? 1}-idle`;

    const sprite = config.scene.physics.add
      .sprite(config.x, config.y, textureKey)
      .setScale(0.8) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    // 128x128 frames — body is roughly the center 60x100 area
    sprite.body.setSize(60, 100);
    sprite.body.setOffset(34, 28);
    sprite.setCollideWorldBounds(true);
    sprite.body.setGravityY(200);

    return sprite;
  }
}
