/**
 * TilemapManager handles loading and creating Phaser tilemaps
 * from Tiled JSON exports paired with the GandalfHardcore city tile sets.
 *
 * Usage:
 * 1. Author a tilemap in Tiled (https://www.mapeditor.org/)
 * 2. Export as JSON, reference the city tile images
 * 3. Place the JSON in public/assets/tilemaps/
 * 4. Call loadTilemap() in preload, createTilemap() in create
 *
 * For levels that don't yet have a Tiled map (e.g. legacy level-01),
 * the LevelLoader's sprite-based platform system is used instead.
 */

export interface TilemapConfig {
  /** Key used when loading the tilemap JSON */
  mapKey: string;
  /** Map of tileset name (as defined in Tiled) -> Phaser texture key */
  tilesetMappings: Record<string, string>;
  /** Names of layers that should have collision enabled */
  collisionLayers: string[];
}

/**
 * Preloads a Tiled JSON tilemap file.
 */
export function loadTilemap(
  load: Phaser.Loader.LoaderPlugin,
  key: string,
  path: string
): void {
  load.tilemapTiledJSON(key, path);
}

/**
 * Creates a tilemap from previously loaded Tiled JSON data.
 * Returns the tilemap and a static group of collision bodies.
 */
export function createTilemap(
  scene: Phaser.Scene,
  config: TilemapConfig
): {
  map: Phaser.Tilemaps.Tilemap;
  collisionLayers: Phaser.Tilemaps.TilemapLayer[];
} {
  const map = scene.make.tilemap({ key: config.mapKey });

  // Add all tilesets
  const tilesets: Phaser.Tilemaps.Tileset[] = [];
  for (const [tilesetName, textureKey] of Object.entries(
    config.tilesetMappings
  )) {
    const tileset = map.addTilesetImage(tilesetName, textureKey);
    if (tileset) {
      tilesets.push(tileset);
    }
  }

  // Create all layers
  const collisionLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  for (const layerData of map.layers) {
    const layer = map.createLayer(layerData.name, tilesets);
    if (!layer) continue;

    // Enable collision on designated layers
    if (config.collisionLayers.includes(layerData.name)) {
      layer.setCollisionByExclusion([-1]);
      collisionLayers.push(layer);
    }
  }

  return { map, collisionLayers };
}

/**
 * Loads the city tile images that Tiled maps reference.
 * Call this in preload before loading any tilemap that uses these tiles.
 */
export function loadCityTileAssets(
  load: Phaser.Loader.LoaderPlugin
): void {
  load.image(
    'city-building-tiles',
    '/assets/imgs/GandalfHardcore City Tiles/Building Tiles 32x32.png'
  );
  load.image(
    'city-decoration-tiles',
    '/assets/imgs/GandalfHardcore City Tiles/Decoration 32x32.png'
  );
  load.image(
    'city-tiles-main',
    '/assets/imgs/GandalfHardcore City Tiles/GandalfHardcore city tiles 32x32.png'
  );
}
