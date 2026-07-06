import { describe, it, expect } from 'vitest';
import { computeFloorSegmentCenters } from '../../systems/LevelLoader';
import { LEVELS, LEVEL_ORDER } from './index';

const GROUND_TEXTURE_WIDTH = 287;

function isValidBackgroundTheme(theme: string): boolean {
  if (theme === 'legacy') {
    return true;
  }

  const parsed = parseInt(theme, 10);
  return !Number.isNaN(parsed) && parsed >= 1 && parsed <= 8;
}

function assertFloorCoverage(
  worldWidth: number,
  textureWidth: number,
  scale: number
): void {
  const segmentWidth = textureWidth * scale;
  const centers = computeFloorSegmentCenters(worldWidth, textureWidth, scale);

  expect(centers.length).toBeGreaterThan(0);
  expect(centers[0]).toBeLessThanOrEqual(segmentWidth / 2);
  expect(centers[centers.length - 1] + segmentWidth / 2).toBeGreaterThanOrEqual(
    worldWidth
  );

  for (let i = 1; i < centers.length; i++) {
    expect(centers[i] - centers[i - 1]).toBe(segmentWidth);
  }
}

describe('level data', () => {
  it.each(LEVEL_ORDER)('%s satisfies level invariants', (id) => {
    const level = LEVELS[id];

    expect(level).toBeDefined();
    expect(level.id).toBe(id);

    expect(level.narration.length).toBeGreaterThan(0);
    expect(level.narration.every((line) => line.length > 0)).toBe(true);

    expect(level.worldWidth).toBeGreaterThan(800);
    expect(level.enemies.length).toBeGreaterThan(0);

    for (const enemy of level.enemies) {
      expect(enemy.patrolLeftBound).toBeLessThan(enemy.patrolRightBound);
      expect(enemy.x).toBeGreaterThanOrEqual(0);
      expect(enemy.x).toBeLessThanOrEqual(level.worldWidth);
    }

    for (const platform of level.platforms) {
      expect(platform.x).toBeGreaterThanOrEqual(0);
      expect(platform.x).toBeLessThanOrEqual(level.worldWidth);
      expect(platform.texture).not.toBe('ground');
    }

    for (const npc of level.npcs) {
      expect(npc.x).toBeGreaterThanOrEqual(0);
      expect(npc.x).toBeLessThanOrEqual(level.worldWidth);
    }

    expect(level.floor).toBeDefined();
    expect(level.floor!.texture).toBe('ground');
    expect(level.floor!.y).toBe(600);
    expect(level.floor!.scale).toBeGreaterThan(0);

    assertFloorCoverage(
      level.worldWidth,
      GROUND_TEXTURE_WIDTH,
      level.floor!.scale
    );

    expect(level.music).toBe('gameMusic');
    expect(isValidBackgroundTheme(level.background.theme)).toBe(true);
  });
});

describe('computeFloorSegmentCenters', () => {
  it('covers worldWidth 5000 with scale 6', () => {
    assertFloorCoverage(5000, GROUND_TEXTURE_WIDTH, 6);
  });

  it('returns one segment when worldWidth is an exact multiple', () => {
    const centers = computeFloorSegmentCenters(2870, GROUND_TEXTURE_WIDTH, 10);
    expect(centers).toEqual([1435]);
    assertFloorCoverage(2870, GROUND_TEXTURE_WIDTH, 10);
  });
});
