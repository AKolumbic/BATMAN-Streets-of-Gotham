/**
 * Physics and gameplay constants.
 * Centralizes magic numbers that were previously scattered across entity classes.
 */

export const WORLD = {
  GRAVITY_Y: 300,
  GAME_WIDTH: 800,
  GAME_HEIGHT: 600,
} as const;

export const BATMAN = {
  MOVE_SPEED: 160,
  JUMP_VELOCITY: -400,
  EXTRA_GRAVITY: 200,
  MAX_HP: 5,
  INVULNERABILITY_MS: 1000,
  KNOCKBACK_X: 200,
  KNOCKBACK_Y: -150,
  SCALE: 1.15,
} as const;

export const ENEMY = {
  PATROL_SPEED: 60,
  ATTACK_RANGE: 100,
  ATTACK_RANGE_Y: 80,
  DAMAGE_TO_BATMAN: 1,
  SCORE_VALUE: 100,
  MAX_HP: 3,
  SCALE: 0.4,
  ATTACK_COOLDOWN_MS: 1500,
  HIT_STUN_MS: 400,
} as const;

export const NPC = {
  RESCUE_RANGE: 80,
  RESCUE_SCORE: 150,
  RUN_SPEED: 100,
} as const;
