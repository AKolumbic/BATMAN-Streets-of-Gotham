export interface LevelResult {
  completed: boolean;
  bestScore: number;
  mostRescued: number;
}

export interface ProgressData {
  version: 1;
  levels: Record<string, LevelResult>;
}

const STORAGE_KEY = 'bsog-progress-v1';

function emptyProgress(): ProgressData {
  return { version: 1, levels: {} };
}

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(data: ProgressData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // private browsing or quota — silently ignore
  }
}

export function loadProgress(): ProgressData {
  const raw = readStorage();
  if (!raw) {
    return emptyProgress();
  }

  try {
    const parsed = JSON.parse(raw) as ProgressData;
    if (parsed?.version !== 1 || typeof parsed.levels !== 'object') {
      return emptyProgress();
    }
    return parsed;
  } catch {
    return emptyProgress();
  }
}

export function recordResult(
  levelId: string,
  score: number,
  rescued: number
): ProgressData {
  const progress = loadProgress();
  const existing = progress.levels[levelId];

  progress.levels[levelId] = {
    completed: true,
    bestScore: Math.max(existing?.bestScore ?? 0, score),
    mostRescued: Math.max(existing?.mostRescued ?? 0, rescued),
  };

  writeStorage(progress);
  return progress;
}

export function isUnlocked(levelId: string, order: string[]): boolean {
  const index = order.indexOf(levelId);
  if (index <= 0) {
    return index === 0;
  }

  const previousId = order[index - 1];
  const progress = loadProgress();
  return progress.levels[previousId]?.completed === true;
}

export function resetProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // private browsing — silently ignore
  }
}
