import { LevelData } from '../../systems/LevelLoader';

import level01 from './level-01.json';
import level02 from './level-02.json';
import level03 from './level-03.json';
import level04 from './level-04.json';
import level05 from './level-05.json';
import level06 from './level-06.json';
import level07 from './level-07.json';
import level08 from './level-08.json';

/**
 * Central registry of all level data, keyed by level ID.
 * This is the single source of truth for level configuration.
 */
export const LEVELS: Record<string, LevelData> = {
  'level-01': level01 as unknown as LevelData,
  'level-02': level02 as unknown as LevelData,
  'level-03': level03 as unknown as LevelData,
  'level-04': level04 as unknown as LevelData,
  'level-05': level05 as unknown as LevelData,
  'level-06': level06 as unknown as LevelData,
  'level-07': level07 as unknown as LevelData,
  'level-08': level08 as unknown as LevelData,
};

/** Ordered list of level IDs for iteration (e.g., level select screen). */
export const LEVEL_ORDER = [
  'level-01',
  'level-02',
  'level-03',
  'level-04',
  'level-05',
  'level-06',
  'level-07',
  'level-08',
];
