# Plan 001: Establish a working verification baseline (typecheck, lint, tests)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0a61e06..HEAD -- package.json tsconfig.json .eslintrc .eslintrc.json src/scenes/GameMenu.ts "src/scenes/1-LevelOne/LevelOne.utils.ts" src/systems/AssetLoader.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `0a61e06`, 2026-07-05

## Why this matters

This repo currently has **no working way to know the code is healthy**: `npx tsc --noEmit` fails with 2 errors, ESLint crashes on an invalid config, and there are no `typecheck`/`lint`/`test` scripts in `package.json` and zero tests. Every other plan in `plans/` uses `npm run typecheck` / `npm run lint` / `npm test` as its verification gate, so this plan must land first. It also clears all 11 `npm audit` advisories (all of which live in the end-of-life ESLint 8 dependency chain).

## Current state

This is a Phaser 3 + TypeScript browser game built with Vite. There is no test framework, no CI, and no lint/typecheck scripts.

- `package.json` — scripts are only `dev`, `build`, `preview`. All deps (including `phaser`, which is a runtime dependency) sit in `devDependencies`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
},
"devDependencies": {
  "eslint": "^8.41.0",
  "phaser": "^3.60.0",
  "typescript": "^5.0.3",
  "vite": "^6.4.1"
}
```

- `npx tsc --noEmit` produces exactly 2 errors. Both are caused by `as const` in `src/constants/assets.ts:340-352` making `Audio.*.path` a `readonly` tuple, which Phaser's `load.audio()` rejects (it wants a mutable `string[]`):
  - `src/scenes/GameMenu.ts:18` — `this.load.audio(Audio.INTRO_MUSIC.key, Audio.INTRO_MUSIC.path);`
  - `src/scenes/1-LevelOne/LevelOne.utils.ts:84` — same pattern with `Audio.GAME_MUSIC.path`.
  - `src/systems/AssetLoader.ts:88` already works around this with a cast that should be removed too: `load.audio(Audio.GAME_MUSIC.key, Audio.GAME_MUSIC.path as unknown as string[]);`

- `.eslintrc` and `.eslintrc.json` are byte-identical duplicates and both invalid: they extend `"plugin:prettier"` (invalid specifier — ESLint crashes immediately), reference `@typescript-eslint/quotes` without the plugin or parser installed, and carry React settings although this is not a React repo. `npx eslint src --ext .ts` currently exits with a config error, not lint results.

- `npm audit` reports 11 vulnerabilities (5 moderate, 6 high), all in the ESLint 8 transitive tree (e.g. `word-wrap`). `npm audit --omit=dev` reports 0.

- Code style (from `.prettierrc`, keep as-is): 2-space indent, single quotes, semicolons, LF line endings, printWidth 80.

- Level data lives in `src/data/levels/level-0[1-8].json`, registered in `src/data/levels/index.ts` as `LEVELS: Record<string, LevelData>` with ordering array `LEVEL_ORDER`. The `LevelData` interface is in `src/systems/LevelLoader.ts:35-52` (fields: `id`, `name`, `episode`, `title`, `narration`, `worldWidth`, `worldHeight`, `background`, `music`, `player`, `platforms`, `enemies`, `npcs`).

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `npm install`            | exit 0              |
| Typecheck | `npx tsc --noEmit`       | exit 0, no output   |
| Build     | `npm run build`          | exit 0, writes `dist/` |
| Lint (after this plan) | `npm run lint` | exit 0 |
| Tests (after this plan) | `npm test`    | all pass |

## Scope

**In scope** (the only files you should modify/create/delete):
- `package.json`, `package-lock.json` (scripts + dependency changes)
- `src/scenes/GameMenu.ts` (line 18 only)
- `src/scenes/1-LevelOne/LevelOne.utils.ts` (line 84 only)
- `src/systems/AssetLoader.ts` (line 88 only)
- `src/game.ts` (only if lint flags the unused `game` variable — see Step 4)
- `.eslintrc`, `.eslintrc.json` (delete), `eslint.config.js` (create)
- `src/data/levels/levels.test.ts` (create)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `src/constants/assets.ts` — do not remove `as const`; fix at the call sites with spreads.
- Any gameplay logic, scene flow, or asset files.
- `vite.config.ts`, `tsconfig.json` (except: if vitest needs `"types"` adjustments, adding `vitest/globals` is allowed).
- CI configuration — none exists; do not add one in this plan.

## Git workflow

- Branch: `advisor/001-verification-baseline` (branch off the current branch you were dispatched on).
- Commit per step; imperative messages (repo history uses descriptive imperative messages).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fix the two type errors (and the cast)

In `src/scenes/GameMenu.ts:18` change:
```ts
this.load.audio(Audio.INTRO_MUSIC.key, Audio.INTRO_MUSIC.path);
```
to:
```ts
this.load.audio(Audio.INTRO_MUSIC.key, [...Audio.INTRO_MUSIC.path]);
```

In `src/scenes/1-LevelOne/LevelOne.utils.ts:84` apply the same spread to `Audio.GAME_MUSIC.path`.

In `src/systems/AssetLoader.ts:88` replace the `as unknown as string[]` cast:
```ts
load.audio(Audio.GAME_MUSIC.key, [...Audio.GAME_MUSIC.path]);
```

**Verify**: `npx tsc --noEmit` → exit 0, no output.

### Step 2: Add scripts and fix dependency placement

In `package.json`:
- Move `phaser` from `devDependencies` to `dependencies` (same version range).
- Add scripts: `"typecheck": "tsc --noEmit"`, `"lint": "eslint ."`, `"test": "vitest run"`.

**Verify**: `npm install && npm run typecheck` → exit 0.

### Step 3: Replace the broken ESLint setup with ESLint 9 flat config

- Delete `.eslintrc` and `.eslintrc.json`.
- `npm uninstall eslint && npm install -D eslint@^9 typescript-eslint @eslint/js`
- Create `eslint.config.js`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'plans/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      // Phaser callback signatures make this too noisy at strict settings:
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
```

**Verify**: `npx eslint . 2>&1 | tail -5` → lint results (rule violations are OK at this step), NOT a config-loading crash.

### Step 4: Fix lint violations until `npm run lint` is green

Run `npm run lint` and fix what it reports. Known violation you will hit: `src/game.ts:22` has `const game = new Game(config);` where `game` is unused — change it to `new Game(config);`. Expect a small number of similar mechanical fixes (unused imports/variables). Do not disable rules file-wide to get to green; per-line `// eslint-disable-next-line` with a reason is acceptable where a fix would change behavior.

**Verify**: `npm run lint` → exit 0. `npm run typecheck` → still exit 0.

### Step 5: Add vitest and a level-data validation test

- `npm install -D vitest`
- Create `src/data/levels/levels.test.ts` that imports `LEVELS` and `LEVEL_ORDER` from `./index` and asserts, for every id in `LEVEL_ORDER`:
  - `LEVELS[id]` exists and `LEVELS[id].id === id`;
  - `narration` is a non-empty string array; `worldWidth > 800`;
  - `enemies.length > 0` (the win condition in `src/scenes/GameLevel.ts:202` is "all enemies defeated" — a level with zero enemies would complete instantly);
  - every enemy has `patrolLeftBound < patrolRightBound` and `0 <= x <= worldWidth`;
  - every platform and NPC has `0 <= x <= worldWidth`;
  - `music === 'gameMusic'` (the only music key loaded by `AssetLoader.ts`);
  - `background.theme` is `'legacy'` or parses (via `parseInt`) to an integer 1–8 (`GameLevel.ts:56` does `parseInt(theme, 10)` and `ParallaxBackground` themes are 1–8).

**Verify**: `npm test` → all tests pass (expect 8 levels × the assertions; at minimum 1 test file, 0 failures). If a level's data legitimately violates an assertion, see STOP conditions.

### Step 6: Confirm the full baseline

**Verify**: `npm run typecheck && npm run lint && npm test && npm run build` → all exit 0. `npm audit 2>&1 | tail -3` → `found 0 vulnerabilities` (the 11 previous advisories were all in the ESLint 8 chain; if a new unrelated advisory appeared upstream since this plan was written, note it in your report — do not chase it).

## Test plan

Covered by Step 5 (`src/data/levels/levels.test.ts`). There are no existing tests to model after — this file becomes the repo's exemplar test. Use plain `describe`/`it` with explicit `import { describe, it, expect } from 'vitest'`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0 with the level-data test running
- [ ] `npm run build` exits 0
- [ ] `ls .eslintrc .eslintrc.json` → no such files; `eslint.config.js` exists
- [ ] `grep -n '"phaser"' package.json` shows it under `dependencies`
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `npx tsc --noEmit` reports errors other than the two listed in "Current state".
- Step 4 surfaces more than ~20 lint errors — the config choice needs review, not bulk suppression.
- Step 5's assertions fail against the shipped level JSONs (that means real level data is broken; report which level/field rather than weakening the test).
- ESLint 9 / typescript-eslint installation fails against the installed Node version.

## Maintenance notes

- Plans 002–008 all use `npm run typecheck` / `npm run lint` / `npm test` as gates; if you rename scripts, update those plans.
- Plan 006 deletes `src/scenes/1-LevelOne/` — the one-line fix to `LevelOne.utils.ts` here is still correct to do now (green baseline before deletions).
- Reviewer should scrutinize: no rule disabled repo-wide to reach green; the level-data test asserts real invariants rather than snapshotting JSON.
- Deferred: CI workflow (no CI exists; adding one is a separate decision), Prettier-as-lint-rule integration (Prettier still works standalone via `.prettierrc`).
