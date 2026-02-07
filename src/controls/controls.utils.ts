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

  // -----------------------------------------------------------------------
  // Batman animations
  // -----------------------------------------------------------------------

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

  // Crouch — 4 frames (240px / 60px = 4), play once and hold last frame
  anims.create({
    key: 'crouch',
    frames: anims.generateFrameNumbers('crouch', { start: 0, end: 3 }),
    frameRate: 10,
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

  // -----------------------------------------------------------------------
  // Legacy enemy animations (original enemy.png spritesheet)
  // -----------------------------------------------------------------------

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

  // -----------------------------------------------------------------------
  // Gangster 1 animations (128x128 frames)
  // -----------------------------------------------------------------------
  registerGangsterAnims(anims, 'gangster1', {
    idle: { end: 5 }, // 768/128 = 6 frames
    walk: { end: 9 }, // 1280/128 = 10 frames
    run: { end: 9 },
    attack: { end: 2 }, // 384/128 = 3 frames
    hurt: { end: 4 }, // 640/128 = 5 frames
    dead: { end: 4 },
    jump: { end: 9 },
  });

  // -----------------------------------------------------------------------
  // Gangster 2 animations (128x128 frames)
  // -----------------------------------------------------------------------
  registerGangsterAnims(anims, 'gangster2', {
    idle: { end: 6 }, // 896/128 = 7 frames
    walk: { end: 9 },
    run: { end: 9 },
    attack: { end: 5 }, // 768/128 = 6 frames
    hurt: { end: 3 }, // 512/128 = 4 frames
    dead: { end: 4 },
    jump: { end: 9 },
  });

  // -----------------------------------------------------------------------
  // Gangster 3 animations (128x128 frames)
  // -----------------------------------------------------------------------
  registerGangsterAnims(anims, 'gangster3', {
    idle: { end: 6 },
    walk: { end: 9 },
    run: { end: 9 },
    attack: { end: 4 }, // 640/128 = 5 frames
    hurt: { end: 3 }, // 512/128 = 4 frames
    dead: { end: 4 },
    jump: { end: 9 },
  });

  // Gangster 3 ranged-specific anims
  anims.create({
    key: 'gangster3-shot-anim',
    frames: anims.generateFrameNumbers('gangster3-shot', { start: 0, end: 11 }), // 1536/128 = 12
    frameRate: 12,
    repeat: 0,
  });

  anims.create({
    key: 'gangster3-recharge-anim',
    frames: anims.generateFrameNumbers('gangster3-recharge', {
      start: 0,
      end: 5, // 768/128 = 6 frames
    }),
    frameRate: 10,
    repeat: 0,
  });

  // -----------------------------------------------------------------------
  // Homeless NPC animations (128x128 frames)
  // -----------------------------------------------------------------------
  registerNPCAnims(anims, 'homeless1', {
    idle: { end: 5 },
    walk: { end: 7 }, // 1024/128 = 8 frames
    run: { end: 7 },
    special: { end: 12 }, // 1664/128 = 13 frames
  });

  registerNPCAnims(anims, 'homeless2', {
    idle: { end: 6 }, // 896/128 = 7 frames
    walk: { end: 7 },
    run: { end: 7 },
  });

  registerNPCAnims(anims, 'homeless3', {
    idle: { end: 5 },
    walk: { end: 7 },
    run: { end: 7 },
    special: { end: 12 },
  });
}

/**
 * Helper to register a set of animations for a gangster variant.
 */
function registerGangsterAnims(
  anims: Phaser.Animations.AnimationManager,
  prefix: string,
  config: Record<string, { end: number }>
): void {
  for (const [action, frames] of Object.entries(config)) {
    const key = `${prefix}-${action}-anim`;
    const textureKey = `${prefix}-${action}`;
    const isLooping = action === 'idle' || action === 'walk' || action === 'run';

    anims.create({
      key,
      frames: anims.generateFrameNumbers(textureKey, {
        start: 0,
        end: frames.end,
      }),
      frameRate: action === 'dead' ? 6 : 8,
      repeat: isLooping ? -1 : 0,
    });
  }
}

/**
 * Helper to register a set of animations for an NPC variant.
 */
function registerNPCAnims(
  anims: Phaser.Animations.AnimationManager,
  prefix: string,
  config: Record<string, { end: number }>
): void {
  for (const [action, frames] of Object.entries(config)) {
    const key = `${prefix}-${action}-anim`;
    const textureKey = `${prefix}-${action}`;
    const isLooping = action === 'idle' || action === 'walk' || action === 'run';

    anims.create({
      key,
      frames: anims.generateFrameNumbers(textureKey, {
        start: 0,
        end: frames.end,
      }),
      frameRate: 8,
      repeat: isLooping ? -1 : 0,
    });
  }
}

/**
 * Creates and returns the key bindings object for the arcade control scheme.
 * Arrow keys + space via createCursorKeys(), plus WASD and number keys.
 */
export function createInputKeys(scene: Phaser.Scene): {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  keys: { [key: string]: Input.Keyboard.Key };
} {
  const cursors = scene.input.keyboard!.createCursorKeys();

  const keys = scene.input.keyboard!.addKeys({
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
