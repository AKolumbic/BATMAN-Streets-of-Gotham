import { Images, Spritesheets, Audio } from '../../constants/assets';
import { loadCityTileAssets } from '../../systems/TilemapManager';

/**
 * Helper to load a spritesheet entry from the asset manifest.
 */
function loadSheet(
  load: Phaser.Loader.LoaderPlugin,
  entry: (typeof Spritesheets)[keyof typeof Spritesheets]
): void {
  load.spritesheet(entry.key, entry.path, entry.frameConfig);
}

export function getSceneAssets(load: Phaser.Loader.LoaderPlugin): void {
  // Background images
  load.image(Images.STARRY_NIGHT.key, Images.STARRY_NIGHT.path);
  load.image(Images.BACKGROUND.key, Images.BACKGROUND.path);
  load.image(Images.FOREGROUND.key, Images.FOREGROUND.path);

  // Platform images
  load.image(Images.GROUND.key, Images.GROUND.path);
  load.image(Images.PLATFORM.key, Images.PLATFORM.path);

  // Batman spritesheets
  loadSheet(load, Spritesheets.BATMAN_STAND);
  loadSheet(load, Spritesheets.BATMAN_RUN_LEFT);
  loadSheet(load, Spritesheets.BATMAN_RUN_RIGHT);
  loadSheet(load, Spritesheets.BATMAN_JUMP);
  loadSheet(load, Spritesheets.BATMAN_JUMP_LEFT);
  loadSheet(load, Spritesheets.BATMAN_CROUCH);
  loadSheet(load, Spritesheets.BATMAN_PUNCH);
  loadSheet(load, Spritesheets.BATMAN_PUNCH_LEFT);

  // Legacy enemy spritesheet
  loadSheet(load, Spritesheets.ENEMY_LEGACY);

  // Gangster 1 spritesheets
  loadSheet(load, Spritesheets.GANGSTER1_IDLE);
  loadSheet(load, Spritesheets.GANGSTER1_WALK);
  loadSheet(load, Spritesheets.GANGSTER1_RUN);
  loadSheet(load, Spritesheets.GANGSTER1_ATTACK);
  loadSheet(load, Spritesheets.GANGSTER1_HURT);
  loadSheet(load, Spritesheets.GANGSTER1_DEAD);
  loadSheet(load, Spritesheets.GANGSTER1_JUMP);

  // Gangster 2 spritesheets
  loadSheet(load, Spritesheets.GANGSTER2_IDLE);
  loadSheet(load, Spritesheets.GANGSTER2_WALK);
  loadSheet(load, Spritesheets.GANGSTER2_RUN);
  loadSheet(load, Spritesheets.GANGSTER2_ATTACK1);
  loadSheet(load, Spritesheets.GANGSTER2_HURT);
  loadSheet(load, Spritesheets.GANGSTER2_DEAD);
  loadSheet(load, Spritesheets.GANGSTER2_JUMP);

  // Gangster 3 spritesheets
  loadSheet(load, Spritesheets.GANGSTER3_IDLE);
  loadSheet(load, Spritesheets.GANGSTER3_WALK);
  loadSheet(load, Spritesheets.GANGSTER3_RUN);
  loadSheet(load, Spritesheets.GANGSTER3_ATTACK);
  loadSheet(load, Spritesheets.GANGSTER3_SHOT);
  loadSheet(load, Spritesheets.GANGSTER3_RECHARGE);
  loadSheet(load, Spritesheets.GANGSTER3_HURT);
  loadSheet(load, Spritesheets.GANGSTER3_DEAD);
  loadSheet(load, Spritesheets.GANGSTER3_JUMP);

  // Homeless NPC spritesheets
  loadSheet(load, Spritesheets.HOMELESS1_IDLE);
  loadSheet(load, Spritesheets.HOMELESS1_WALK);
  loadSheet(load, Spritesheets.HOMELESS1_RUN);
  loadSheet(load, Spritesheets.HOMELESS1_SPECIAL);
  loadSheet(load, Spritesheets.HOMELESS1_HURT);
  loadSheet(load, Spritesheets.HOMELESS2_IDLE);
  loadSheet(load, Spritesheets.HOMELESS2_WALK);
  loadSheet(load, Spritesheets.HOMELESS2_RUN);
  loadSheet(load, Spritesheets.HOMELESS3_IDLE);
  loadSheet(load, Spritesheets.HOMELESS3_WALK);
  loadSheet(load, Spritesheets.HOMELESS3_RUN);
  loadSheet(load, Spritesheets.HOMELESS3_SPECIAL);

  // City tile assets (for future tilemap-based levels)
  loadCityTileAssets(load);

  // Audio
  load.audio(Audio.GAME_MUSIC.key, [...Audio.GAME_MUSIC.path]);
}

export function createPlatforms(
  physics: Phaser.Physics.Arcade.ArcadePhysics
): Phaser.Physics.Arcade.StaticGroup {
  const platforms = physics.add.staticGroup();

  //FLOOR
  platforms.create(300, 600, 'ground').setScale(5).refreshBody();

  //FIRST PLATFORMS
  platforms.create(290, 450, 'platform').setScale(0.65).refreshBody();
  platforms.create(390, 450, 'platform').setScale(0.65).refreshBody();
  platforms.create(440, 450, 'platform').setScale(0.65).refreshBody();

  //SECOND PLATFORMS
  platforms.create(550, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(600, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(650, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(700, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(750, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(800, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(850, 330, 'platform').setScale(0.25).refreshBody();

  platforms.create(950, 450, 'platform').setScale(0.65).refreshBody();
  platforms.create(1100, 450, 'platform').setScale(0.65).refreshBody();

  platforms.create(1080, 200, 'platform').setScale(0.65).refreshBody();

  //THIRD PLATFORMS
  platforms.create(1275, 350, 'platform').setScale(0.25).refreshBody();
  platforms.create(1325, 350, 'platform').setScale(0.25).refreshBody();
  platforms.create(1375, 350, 'platform').setScale(0.25).refreshBody();

  platforms.create(1475, 200, 'platform').setScale(0.25).refreshBody();
  platforms.create(1525, 200, 'platform').setScale(0.25).refreshBody();
  platforms.create(1575, 200, 'platform').setScale(0.25).refreshBody();
  platforms.create(1625, 200, 'platform').setScale(0.25).refreshBody();

  //FOURTH PLATFORMS
  platforms.create(1450, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1500, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1550, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1600, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1650, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1700, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1750, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1800, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1850, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1900, 450, 'platform').setScale(0.25).refreshBody();

  platforms.create(2110, 450, 'platform').setScale(0.25).refreshBody();

  platforms.create(2110, 330, 'platform').setScale(0.5).refreshBody();

  //FINAL PLATFORMS
  platforms.create(2250, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2300, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2350, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2400, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2450, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2500, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2550, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2600, 175, 'platform').setScale(0.25).refreshBody();

  return platforms;
}
