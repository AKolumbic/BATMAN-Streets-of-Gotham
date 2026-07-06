import Enemy, { EnemyConfig } from '../Enemy';

/**
 * Melee gangster enemy (Gangsters_1 / Gangsters_2 sprite packs).
 * Uses 128x128 character sprite sheets.
 * Attacks with close-range punches — no projectiles.
 */
export default class GangsterMelee extends Enemy {
  constructor(config: EnemyConfig, variant: 1 | 2 = 1) {
    const prefix = `gangster${variant}`;
    super(config, {
      textureKey: `${prefix}-idle`,
      walkAnimKey: `${prefix}-walk-anim`,
      attackAnimKey: `${prefix}-attack-anim`,
      scale: 0.8,
      bodySize: { width: 60, height: 100 },
      bodyOffset: { x: 34, y: 28 },
    });
  }
}
