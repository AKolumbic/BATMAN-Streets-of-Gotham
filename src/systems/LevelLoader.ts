/**
 * LevelLoader reads a level JSON definition and creates the corresponding
 * Phaser game objects (backgrounds, platforms, entity spawns).
 */

export interface LevelPlatform {
  x: number;
  y: number;
  texture: string;
  scale: number;
  label?: string;
}

export interface LevelEnemy {
  type: string;
  x: number;
  y: number;
  patrolLeftBound: number;
  patrolRightBound: number;
}

export interface LevelNPC {
  type: string;
  x: number;
  y: number;
}

export interface LevelBackgroundLayer {
  key: string;
  x: number;
  y: number;
  scrollFactor?: number;
}

export interface LevelData {
  id: string;
  name: string;
  episode: number;
  title: string;
  narration: string[];
  worldWidth: number;
  worldHeight: number;
  background: {
    theme: string;
    layers: LevelBackgroundLayer[];
  };
  music: string;
  player: { x: number; y: number };
  platforms: LevelPlatform[];
  /** Full-width tiled floor; segments are generated to cover worldWidth. */
  floor?: { texture: string; y: number; scale: number };
  enemies: LevelEnemy[];
  npcs: LevelNPC[];
}

/**
 * Creates all platform static bodies from level data.
 */
export function createPlatformsFromData(
  physics: Phaser.Physics.Arcade.ArcadePhysics,
  platforms: LevelPlatform[]
): Phaser.Physics.Arcade.StaticGroup {
  const group = physics.add.staticGroup();

  for (const p of platforms) {
    group.create(p.x, p.y, p.texture).setScale(p.scale).refreshBody();
  }

  return group;
}

/**
 * Compute center x-positions for floor segments so scaled tiles of
 * `textureWidth * scale` cover [0, worldWidth] with no gap.
 */
export function computeFloorSegmentCenters(
  worldWidth: number,
  textureWidth: number,
  scale: number
): number[] {
  const segmentWidth = textureWidth * scale;
  const count = Math.ceil(worldWidth / segmentWidth);
  const centers: number[] = [];
  for (let i = 0; i < count; i++) {
    centers.push(i * segmentWidth + segmentWidth / 2);
  }
  return centers;
}

const GROUND_TEXTURE_WIDTH = 287; // blk-ground.png is 287x2 px

export function createFloor(
  physics: Phaser.Physics.Arcade.ArcadePhysics,
  group: Phaser.Physics.Arcade.StaticGroup,
  floor: { texture: string; y: number; scale: number },
  worldWidth: number
): void {
  for (const cx of computeFloorSegmentCenters(
    worldWidth,
    GROUND_TEXTURE_WIDTH,
    floor.scale
  )) {
    group.create(cx, floor.y, floor.texture).setScale(floor.scale).refreshBody();
  }
}

/**
 * Creates background image layers from level data.
 */
export function createBackgroundLayers(
  scene: Phaser.Scene,
  layers: LevelBackgroundLayer[]
): Phaser.GameObjects.Image[] {
  return layers.map((layer) => {
    const img = scene.add.image(layer.x, layer.y, layer.key);
    if (layer.scrollFactor !== undefined) {
      img.setScrollFactor(layer.scrollFactor);
    }
    return img;
  });
}
