import { describe, it, expect } from 'vitest';
import { LEVELS, LEVEL_ORDER } from './index';

function isValidBackgroundTheme(theme: string): boolean {
  if (theme === 'legacy') {
    return true;
  }

  const parsed = parseInt(theme, 10);
  return !Number.isNaN(parsed) && parsed >= 1 && parsed <= 8;
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
    }

    for (const npc of level.npcs) {
      expect(npc.x).toBeGreaterThanOrEqual(0);
      expect(npc.x).toBeLessThanOrEqual(level.worldWidth);
    }

    expect(level.music).toBe('gameMusic');
    expect(isValidBackgroundTheme(level.background.theme)).toBe(true);
  });
});
