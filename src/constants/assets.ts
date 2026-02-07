/**
 * Centralized asset manifest.
 * All asset keys and paths are defined here so no file path strings
 * are scattered across scenes and entity classes.
 *
 * Paths are root-relative (Vite serves public/ at /).
 */

// ---------------------------------------------------------------------------
// Base paths
// ---------------------------------------------------------------------------
const IMG = '/assets/imgs';
const AUDIO = '/assets/audio';
const GANGSTER = `${IMG}/gangster-pixel-character-sprite-sheets-pack`;
const HOMELESS = `${IMG}/Free-Homeless-Character-Sprite-Sheets-Pixel-Art`;
const CITY_BG = `${IMG}/free-scrolling-city-backgrounds-pixel-art/1 Backgrounds`;
const CITY_TILES = `${IMG}/GandalfHardcore City Tiles`;
const UI = `${IMG}/Game UI collection FREE version/PNG`;

// ---------------------------------------------------------------------------
// Image assets (static, non-animated)
// ---------------------------------------------------------------------------
export const Images = {
  // Backgrounds (legacy level-one)
  STARRY_NIGHT: { key: 'starry-night', path: `${IMG}/starry-night.png` },
  BACKGROUND: { key: 'background', path: `${IMG}/background.png` },
  FOREGROUND: { key: 'foreground', path: `${IMG}/gc-buildings.png` },

  // Platforms
  GROUND: { key: 'ground', path: `${IMG}/blk-ground.png` },
  PLATFORM: { key: 'platform', path: `${IMG}/sml-platform.png` },

  // Menu
  MENU_IMAGE: { key: 'gameMenu', path: `${IMG}/menuimage.jpg` },
  PLAY_BTN_BG: { key: 'playBtnBg', path: `${IMG}/play_button_bg.png` },

  // Collectibles (future)
  BATARANG: { key: 'batarang', path: `${IMG}/batarang.png` },

  // City tiles
  CITY_BUILDING_TILES: {
    key: 'city-building-tiles',
    path: `${CITY_TILES}/Building Tiles 32x32.png`,
  },
  CITY_DECORATION_TILES: {
    key: 'city-decoration-tiles',
    path: `${CITY_TILES}/Decoration 32x32.png`,
  },
  CITY_TILES_MAIN: {
    key: 'city-tiles-main',
    path: `${CITY_TILES}/GandalfHardcore city tiles 32x32.png`,
  },
  CITY_BG_FULL: {
    key: 'city-bg-full',
    path: `${CITY_TILES}/City background.png`,
  },
  CITY_BG_LAYER1: {
    key: 'city-bg-layer1',
    path: `${CITY_TILES}/City background layer1.png`,
  },
  CITY_BG_LAYER2: {
    key: 'city-bg-layer2',
    path: `${CITY_TILES}/City background layer2.png`,
  },
  CITY_BG_SKY: {
    key: 'city-bg-sky',
    path: `${CITY_TILES}/City background sky.png`,
  },
} as const;

// ---------------------------------------------------------------------------
// Spritesheet frame size constant — all new character packs use 128x128
// ---------------------------------------------------------------------------
const CHAR_FRAME = { frameWidth: 128, frameHeight: 128 };

// ---------------------------------------------------------------------------
// Spritesheet assets (animated)
// ---------------------------------------------------------------------------
export const Spritesheets = {
  // Batman (legacy frame sizes vary per sheet)
  BATMAN_STAND: {
    key: 'stand',
    path: `${IMG}/stand.png`,
    frameConfig: { frameWidth: 41.4, frameHeight: 53 },
  },
  BATMAN_RUN_LEFT: {
    key: 'run-left',
    path: `${IMG}/run-left.png`,
    frameConfig: { frameWidth: 57, frameHeight: 50 },
  },
  BATMAN_RUN_RIGHT: {
    key: 'run-right',
    path: `${IMG}/run-right.png`,
    frameConfig: { frameWidth: 57, frameHeight: 50 },
  },
  BATMAN_JUMP: {
    key: 'jump',
    path: `${IMG}/jump.png`,
    frameConfig: { frameWidth: 57, frameHeight: 50 },
  },
  BATMAN_JUMP_LEFT: {
    key: 'jump-left',
    path: `${IMG}/jump-left.png`,
    frameConfig: { frameWidth: 57, frameHeight: 50 },
  },
  BATMAN_CROUCH: {
    key: 'crouch',
    path: `${IMG}/crouch.png`,
    frameConfig: { frameWidth: 60, frameHeight: 47 },
  },
  BATMAN_PUNCH: {
    key: 'punch',
    path: `${IMG}/punch.png`,
    frameConfig: { frameWidth: 52, frameHeight: 50 },
  },
  BATMAN_PUNCH_LEFT: {
    key: 'punch-left',
    path: `${IMG}/punch-left.png`,
    frameConfig: { frameWidth: 52, frameHeight: 50 },
  },

  // Legacy enemy (single spritesheet with walk + punch rows)
  ENEMY_LEGACY: {
    key: 'enemy',
    path: `${IMG}/enemy.png`,
    frameConfig: { frameWidth: 221, frameHeight: 226 },
  },

  // --- Gangster 1 (melee + gun) ---
  GANGSTER1_IDLE: {
    key: 'gangster1-idle',
    path: `${GANGSTER}/Gangsters_1/Idle.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER1_WALK: {
    key: 'gangster1-walk',
    path: `${GANGSTER}/Gangsters_1/Walk.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER1_RUN: {
    key: 'gangster1-run',
    path: `${GANGSTER}/Gangsters_1/Run.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER1_ATTACK: {
    key: 'gangster1-attack',
    path: `${GANGSTER}/Gangsters_1/Attack_1.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER1_SHOT: {
    key: 'gangster1-shot',
    path: `${GANGSTER}/Gangsters_1/Shot.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER1_RECHARGE: {
    key: 'gangster1-recharge',
    path: `${GANGSTER}/Gangsters_1/Recharge.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER1_HURT: {
    key: 'gangster1-hurt',
    path: `${GANGSTER}/Gangsters_1/Hurt.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER1_DEAD: {
    key: 'gangster1-dead',
    path: `${GANGSTER}/Gangsters_1/Dead.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER1_JUMP: {
    key: 'gangster1-jump',
    path: `${GANGSTER}/Gangsters_1/Jump.png`,
    frameConfig: CHAR_FRAME,
  },

  // --- Gangster 2 (melee only) ---
  GANGSTER2_IDLE: {
    key: 'gangster2-idle',
    path: `${GANGSTER}/Gangsters_2/Idle.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER2_WALK: {
    key: 'gangster2-walk',
    path: `${GANGSTER}/Gangsters_2/Walk.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER2_RUN: {
    key: 'gangster2-run',
    path: `${GANGSTER}/Gangsters_2/Run.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER2_ATTACK1: {
    key: 'gangster2-attack',
    path: `${GANGSTER}/Gangsters_2/Attack_1.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER2_ATTACK2: {
    key: 'gangster2-attack2',
    path: `${GANGSTER}/Gangsters_2/Attack_2.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER2_ATTACK3: {
    key: 'gangster2-attack3',
    path: `${GANGSTER}/Gangsters_2/Attack_3.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER2_HURT: {
    key: 'gangster2-hurt',
    path: `${GANGSTER}/Gangsters_2/Hurt.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER2_DEAD: {
    key: 'gangster2-dead',
    path: `${GANGSTER}/Gangsters_2/Dead.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER2_JUMP: {
    key: 'gangster2-jump',
    path: `${GANGSTER}/Gangsters_2/Jump.png`,
    frameConfig: CHAR_FRAME,
  },

  // --- Gangster 3 (ranged + gun) ---
  GANGSTER3_IDLE: {
    key: 'gangster3-idle',
    path: `${GANGSTER}/Gangsters_3/Idle.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER3_WALK: {
    key: 'gangster3-walk',
    path: `${GANGSTER}/Gangsters_3/Walk.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER3_RUN: {
    key: 'gangster3-run',
    path: `${GANGSTER}/Gangsters_3/Run.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER3_ATTACK: {
    key: 'gangster3-attack',
    path: `${GANGSTER}/Gangsters_3/Attack.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER3_SHOT: {
    key: 'gangster3-shot',
    path: `${GANGSTER}/Gangsters_3/Shot.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER3_RECHARGE: {
    key: 'gangster3-recharge',
    path: `${GANGSTER}/Gangsters_3/Recharge.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER3_HURT: {
    key: 'gangster3-hurt',
    path: `${GANGSTER}/Gangsters_3/Hurt.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER3_DEAD: {
    key: 'gangster3-dead',
    path: `${GANGSTER}/Gangsters_3/Dead.png`,
    frameConfig: CHAR_FRAME,
  },
  GANGSTER3_JUMP: {
    key: 'gangster3-jump',
    path: `${GANGSTER}/Gangsters_3/Jump.png`,
    frameConfig: CHAR_FRAME,
  },

  // --- Homeless NPC 1 ---
  HOMELESS1_IDLE: {
    key: 'homeless1-idle',
    path: `${HOMELESS}/Homeless_1/Idle.png`,
    frameConfig: CHAR_FRAME,
  },
  HOMELESS1_WALK: {
    key: 'homeless1-walk',
    path: `${HOMELESS}/Homeless_1/Walk.png`,
    frameConfig: CHAR_FRAME,
  },
  HOMELESS1_RUN: {
    key: 'homeless1-run',
    path: `${HOMELESS}/Homeless_1/Run.png`,
    frameConfig: CHAR_FRAME,
  },
  HOMELESS1_SPECIAL: {
    key: 'homeless1-special',
    path: `${HOMELESS}/Homeless_1/Special.png`,
    frameConfig: CHAR_FRAME,
  },
  HOMELESS1_HURT: {
    key: 'homeless1-hurt',
    path: `${HOMELESS}/Homeless_1/Hurt.png`,
    frameConfig: CHAR_FRAME,
  },

  // --- Homeless NPC 2 ---
  HOMELESS2_IDLE: {
    key: 'homeless2-idle',
    path: `${HOMELESS}/Homeless_2/Idle.png`,
    frameConfig: CHAR_FRAME,
  },
  HOMELESS2_WALK: {
    key: 'homeless2-walk',
    path: `${HOMELESS}/Homeless_2/Walk.png`,
    frameConfig: CHAR_FRAME,
  },
  HOMELESS2_RUN: {
    key: 'homeless2-run',
    path: `${HOMELESS}/Homeless_2/Run.png`,
    frameConfig: CHAR_FRAME,
  },

  // --- Homeless NPC 3 ---
  HOMELESS3_IDLE: {
    key: 'homeless3-idle',
    path: `${HOMELESS}/Homeless_3/Idle.png`,
    frameConfig: CHAR_FRAME,
  },
  HOMELESS3_WALK: {
    key: 'homeless3-walk',
    path: `${HOMELESS}/Homeless_3/Walk.png`,
    frameConfig: CHAR_FRAME,
  },
  HOMELESS3_RUN: {
    key: 'homeless3-run',
    path: `${HOMELESS}/Homeless_3/Run.png`,
    frameConfig: CHAR_FRAME,
  },
  HOMELESS3_SPECIAL: {
    key: 'homeless3-special',
    path: `${HOMELESS}/Homeless_3/Special.png`,
    frameConfig: CHAR_FRAME,
  },
} as const;

// ---------------------------------------------------------------------------
// Audio assets
// ---------------------------------------------------------------------------
export const Audio = {
  INTRO_MUSIC: {
    key: 'gameMenuMusic',
    path: [`${AUDIO}/introMusic.mp3`, `${AUDIO}/introMusic.ogg`],
  },
  GAME_MUSIC: {
    key: 'gameMusic',
    path: [
      `${AUDIO}/12 Introduce a Little Anarchy.mp3`,
      `${AUDIO}/12 Introduce a Little Anarchy.ogg`,
    ],
  },
} as const;

// ---------------------------------------------------------------------------
// City parallax backgrounds (8 themes x day/night x 5 layers)
// ---------------------------------------------------------------------------
export interface CityBackgroundTheme {
  day: string[];
  night: string[];
}

/**
 * Returns an array of 5 layer paths for a given theme number (1-8) and time.
 * Layers are ordered back-to-front (1 = farthest, 5 = nearest).
 */
export const getCityBackgroundPaths = (
  theme: number,
  time: 'Day' | 'Night'
): string[] =>
  [1, 2, 3, 4, 5].map(
    (layer) => `${CITY_BG}/${theme}/${time}/${layer}.png`
  );

// ---------------------------------------------------------------------------
// UI kit asset paths
// ---------------------------------------------------------------------------
export const UIAssets = {
  BAR_GREEN_BG: `${UI}/Bars/Green/x1/Asset 1 - Copy.png`,
  BAR_GREEN_FILL: `${UI}/Bars/Green/x1/Asset 2 - Copy.png`,
  BAR_YELLOW_BG: `${UI}/Bars/Yellow/x1/Asset 1.png`,
  BAR_YELLOW_FILL: `${UI}/Bars/Yellow/x1/Asset 2.png`,
  BAR_BLUE_BG: `${UI}/Bars/Blue/x1/Asset 1.png`,
  BAR_BLUE_FILL: `${UI}/Bars/Blue/x1/Asset 2.png`,
  BAR_WHITE_BG: `${UI}/Bars/white/x1/Asset 1.png`,
  BUTTON_BLUE: `${UI}/button/Blue/1x/Asset 16.png`,
  BUTTON_GREEN: `${UI}/button/Green/1x/Asset 16.png`,
  BUTTON_YELLOW: `${UI}/button/Yellow/1x/Asset 16.png`,
  BUTTON_PURPLE: `${UI}/button/purple/1x/Asset 16.png`,
  BUTTON_WHITE: `${UI}/button/White/1x/Asset 16.png`,
  DIALOGUE_DEFAULT: `${UI}/Dialogue/1x/Asset 1.png`,
  DIALOGUE_BLUE: `${UI}/Dialogue/Blue/1x/Asset 1.png`,
  DIALOGUE_GREEN: `${UI}/Dialogue/Green/1x/Asset 1.png`,
  DIALOGUE_YELLOW: `${UI}/Dialogue/Yellow/1x/Asset 1.png`,
} as const;
