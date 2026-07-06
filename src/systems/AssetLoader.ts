import { Images, Spritesheets, Audio } from '../constants/assets';
import { loadCityTileAssets } from './TilemapManager';

/**
 * Helper to load a spritesheet entry from the asset manifest.
 */
function loadSheet(
  load: Phaser.Loader.LoaderPlugin,
  entry: (typeof Spritesheets)[keyof typeof Spritesheets]
): void {
  load.spritesheet(entry.key, entry.path, entry.frameConfig);
}

/**
 * Preloads all gameplay assets: backgrounds, platforms, character
 * spritesheets, city tiles, and audio. Call in a scene's preload().
 */
export function loadGameplayAssets(load: Phaser.Loader.LoaderPlugin): void {
  // Background images (legacy level-01)
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
