import { Input } from 'phaser';

/**
 * Register all sprite animations with the Phaser animation manager.
 * Safe to call multiple times (skips if animations already exist).
 */
export function registerAnimations(
  anims: Phaser.Animations.AnimationManager
): void {
  // Skip if already registered (animations are global, persist across scene restarts)
  if (anims.exists('stand')) return;

  // Idle / stand — 15 frames (621px / 41px = 15), looping
  anims.create({
    key: 'stand',
    frames: anims.generateFrameNumbers('stand', { start: 0, end: 14 }),
    frameRate: 8,
    repeat: -1,
  });

  // Run right — 19 frames (950px / 50px = 19), looping
  anims.create({
    key: 'right',
    frames: anims.generateFrameNumbers('run-right', { start: 0, end: 18 }),
    frameRate: 12,
    repeat: -1,
  });

  // Run left — 19 frames, looping
  anims.create({
    key: 'left',
    frames: anims.generateFrameNumbers('run-left', { start: 0, end: 18 }),
    frameRate: 12,
    repeat: -1,
  });

  // Jump right — 3 frames (174px / 57px = 3), looping while airborne
  anims.create({
    key: 'up',
    frames: anims.generateFrameNumbers('jump', { start: 0, end: 2 }),
    frameRate: 4,
    repeat: -1,
  });

  // Jump left — 3 frames, looping while airborne
  anims.create({
    key: 'up-left',
    frames: anims.generateFrameNumbers('jump-left', { start: 0, end: 2 }),
    frameRate: 4,
    repeat: -1,
  });

  // Crouch — 4 frames (240px / 60px = 4), reversed so it animates DOWN, hold last frame
  anims.create({
    key: 'crouch',
    frames: anims.generateFrameNumbers('crouch', { start: 3, end: 0 }),
    frameRate: 8,
    repeat: 0,
  });

  // Punch right — 11 frames (572px / 52px = 11), play once
  anims.create({
    key: 'punch',
    frames: anims.generateFrameNumbers('punch', { start: 0, end: 10 }),
    frameRate: 15,
    repeat: 0,
  });

  // Punch left — 11 frames, play once
  anims.create({
    key: 'punch-left',
    frames: anims.generateFrameNumbers('punch-left', { start: 0, end: 10 }),
    frameRate: 15,
    repeat: 0,
  });

  // --- Enemy animations ---

  // Enemy walk — bottom half of spritesheet (frames 8-15), looping
  anims.create({
    key: 'enemy-walk',
    frames: anims.generateFrameNumbers('enemy', { start: 8, end: 15 }),
    frameRate: 8,
    repeat: -1,
  });

  // Enemy punch — top half of spritesheet (frames 0-7), play once
  anims.create({
    key: 'enemy-punch',
    frames: anims.generateFrameNumbers('enemy', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: 0,
  });
}

/**
 * Creates and returns the key bindings object for the arcade control scheme.
 * Arrow keys + space via createCursorKeys(), plus WASD and number keys.
 */
export function createInputKeys(scene: Phaser.Scene): {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  keys: { [key: string]: Input.Keyboard.Key };
} {
  const cursors = scene.input.keyboard.createCursorKeys();

  const keys = scene.input.keyboard.addKeys({
    W: Input.Keyboard.KeyCodes.W,
    A: Input.Keyboard.KeyCodes.A,
    S: Input.Keyboard.KeyCodes.S,
    D: Input.Keyboard.KeyCodes.D,
    ONE: Input.Keyboard.KeyCodes.ONE,
    TWO: Input.Keyboard.KeyCodes.TWO,
    THREE: Input.Keyboard.KeyCodes.THREE,
    FOUR: Input.Keyboard.KeyCodes.FOUR,
  }) as { [key: string]: Input.Keyboard.Key };

  return { cursors, keys };
}
