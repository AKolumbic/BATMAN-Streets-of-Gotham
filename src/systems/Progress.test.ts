import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadProgress,
  recordResult,
  isUnlocked,
  resetProgress,
} from './Progress';

const STORAGE_KEY = 'bsog-progress-v1';
const LEVEL_ORDER = [
  'level-01',
  'level-02',
  'level-03',
  'level-04',
  'level-05',
  'level-06',
  'level-07',
  'level-08',
];

function createStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe('Progress', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createStorage();
    vi.stubGlobal('localStorage', storage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('empty state unlocks only level-01', () => {
    const progress = loadProgress();
    expect(progress).toEqual({ version: 1, levels: {} });

    for (const levelId of LEVEL_ORDER) {
      expect(isUnlocked(levelId, LEVEL_ORDER)).toBe(levelId === 'level-01');
    }
  });

  it('completing level-01 unlocks level-02 only', () => {
    recordResult('level-01', 100, 2);

    expect(isUnlocked('level-01', LEVEL_ORDER)).toBe(true);
    expect(isUnlocked('level-02', LEVEL_ORDER)).toBe(true);
    expect(isUnlocked('level-03', LEVEL_ORDER)).toBe(false);
  });

  it('recordResult max-merges score and rescued counts', () => {
    recordResult('level-01', 100, 3);
    recordResult('level-01', 50, 5);

    const progress = loadProgress();
    expect(progress.levels['level-01']).toEqual({
      completed: true,
      bestScore: 100,
      mostRescued: 5,
    });
  });

  it('corrupt JSON returns empty state without throwing', () => {
    storage.setItem(STORAGE_KEY, '{not valid json');

    expect(() => loadProgress()).not.toThrow();
    expect(loadProgress()).toEqual({ version: 1, levels: {} });
    expect(isUnlocked('level-01', LEVEL_ORDER)).toBe(true);
    expect(isUnlocked('level-02', LEVEL_ORDER)).toBe(false);
  });

  it('resetProgress clears stored data', () => {
    recordResult('level-01', 200, 1);
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();

    resetProgress();

    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadProgress()).toEqual({ version: 1, levels: {} });
    expect(isUnlocked('level-02', LEVEL_ORDER)).toBe(false);
  });

  it('persists progress to localStorage', () => {
    recordResult('level-01', 150, 4);

    const raw = storage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual({
      version: 1,
      levels: {
        'level-01': {
          completed: true,
          bestScore: 150,
          mostRescued: 4,
        },
      },
    });
  });
});
