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
