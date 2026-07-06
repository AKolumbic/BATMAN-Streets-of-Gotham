# Plan 009: Design spike — episode progression & persistence (localStorage)

> **Executor instructions**: This is a DESIGN/SPIKE plan, not a build-everything
> plan. The deliverables are a small working prototype of the storage layer,
> minimal UI integration, and a short written design note for the maintainer.
> Follow the steps; honor the STOP conditions. When done, update the status
> row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 0a61e06..HEAD -- src/scenes/LevelSelect.ts src/scenes/LevelComplete.ts src/data/levels/index.ts`
> Compare "Current state" excerpts against live code; on unexplained
> mismatch, STOP.

## Status

- **Priority**: P3
- **Effort**: M (coarse — direction estimates are rougher by nature)
- **Risk**: LOW (additive feature; no existing behavior depends on it)
- **Depends on**: plans/001-verification-baseline.md
- **Category**: direction
- **Planned at**: commit `0a61e06`, 2026-07-05

## Why this matters

The game has 8 authored episodes but zero progression: `src/scenes/LevelSelect.ts` says in its own doc comment "All episodes are unlocked", nothing records completion, and score/rescue counts vanish on the results screen. The plumbing is already in place — `LevelComplete` receives `{ score, rescued, levelName, levelId }` and `LEVEL_ORDER` defines episode sequence — so unlock-gating and best-score persistence are one small module away. This is the cheapest change that gives players a reason to replay and a sense of campaign structure. Grounding: this is inferred from code evidence (the "all unlocked" comment reads as a placeholder, and `LevelComplete` already carries exactly the data a save system needs); there is no PRD in the repo confirming it, which is why this is a spike with an explicit review gate rather than a full build.

## Current state

- `src/data/levels/index.ts` — `LEVELS: Record<string, LevelData>` and `LEVEL_ORDER: string[]` (8 ids, `'level-01'`…`'level-08'`).
- `src/scenes/LevelSelect.ts` — renders one `Button` per `LEVEL_ORDER` entry (lines 44–76); doc comment: "All episodes are unlocked." `Button` (`src/ui/Button.ts`) supports `bgColor`, `color`, `onClick`; it has no disabled state (would need a small addition or a non-interactive rendering path).
- `src/scenes/LevelComplete.ts` — `create(data: { score, rescued, levelName, levelId })`; displays them; buttons for LevelSelect / play-again. This is the natural save point.
- `src/scenes/GameLevel.ts` — computes `score` (on `this.batman.score`) and `rescuedCount` in `handleWin()` (lines 207–221).
- No persistence of any kind exists in the codebase (`grep -rn "localStorage" src` → no matches). This is a fully client-side static game; localStorage is the only sensible store.
- Conventions: TypeScript strict; systems live in `src/systems/`; plain classes; constants centralized; 2-space indent, single quotes, semicolons. Plan 001 added vitest — the storage module MUST be written as a Phaser-free pure module so it's unit-testable.

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Lint      | `npm run lint`       | exit 0              |
| Tests     | `npm test`           | all pass, incl. new progress tests |
| Dev server | `npm run dev`       | port 10001          |

## Scope

**In scope**:
- `src/systems/Progress.ts` (create — pure TS, no Phaser imports)
- `src/systems/Progress.test.ts` (create)
- `src/scenes/LevelComplete.ts` (record results)
- `src/scenes/LevelSelect.ts` (render lock state + best scores)
- `src/ui/Button.ts` (only if a `disabled` option is the chosen lock UI)
- `plans/README.md` (status row)
- A design note appended to this plan file under "## Spike findings" (see Step 5)

**Out of scope** (do NOT touch):
- `GameOver.ts`, `GameLevel.ts` gameplay logic, level JSONs.
- Cloud sync, profiles, or any backend — this is a static site.
- A settings/reset UI (note it as follow-up; a documented `localStorage.removeItem` key is enough for now).
- Achievements, star ratings, par times — record ideas in the design note only.

## Git workflow

- Branch: `advisor/009-progression-spike`
- Commit per step; imperative messages.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Storage module (pure, tested)

Create `src/systems/Progress.ts`:

```ts
export interface LevelResult {
  completed: boolean;
  bestScore: number;
  mostRescued: number;
}

export interface ProgressData {
  version: 1;
  levels: Record<string, LevelResult>;
}
```

API (all static or module functions — no Phaser): `loadProgress(): ProgressData` (returns empty structure on missing/corrupt JSON — never throws), `recordResult(levelId, score, rescued): ProgressData` (max-merge with existing), `isUnlocked(levelId, order: string[]): boolean` (first level always unlocked; level N unlocked iff level N−1 completed), `resetProgress(): void`. Storage key: `'bsog-progress-v1'`. Guard every `localStorage` access with try/catch (private-browsing modes throw).

**Verify**: `npm run typecheck` → exit 0; `grep -n "phaser" src/systems/Progress.ts -i` → no matches.

### Step 2: Unit tests

`src/systems/Progress.test.ts` (vitest; stub `localStorage` with a simple in-memory object on `globalThis`): empty state → only `level-01` unlocked; completing `level-01` unlocks `level-02` and only it; `recordResult` keeps the max of score/rescued across runs; corrupt stored JSON → clean empty state, no throw; `resetProgress` → back to initial.

**Verify**: `npm test` → all pass.

### Step 3: Record on level completion

In `LevelComplete.create()`, before rendering: `recordResult(levelId, score, rescued)`. If the previous best was beaten, render a small "NEW BEST!" text next to the score (style: match existing gold `#ffcc00` text in that scene).

**Verify**: `npm run typecheck` → exit 0; manual: finish Episode 1 twice with different scores, `localStorage.getItem('bsog-progress-v1')` in DevTools shows the max.

### Step 4: Lock state in LevelSelect

In `LevelSelect.create()`: for each level, if `!isUnlocked(levelId, LEVEL_ORDER)`, render the button visually muted (grey `bgColor: 0x222222`, label color `#555555`, no-op `onClick`, and a lock glyph or `LOCKED` suffix in the label) — extend `Button` with an optional `disabled?: boolean` that skips `setInteractive`/hover wiring if that's cleaner. Show `BEST: <score>` under completed episodes (small `#888888` text, matching the existing subtitle style at lines 31–36).

**Verify**: manual — fresh profile (run `localStorage.removeItem('bsog-progress-v1')`): only Episode 1 clickable; complete it; Episode 2 unlocks; best score shows.

### Step 5: Write up the spike findings

Append a `## Spike findings` section to THIS file: what was built, the storage schema, and the open questions for the maintainer, which must include at least: (a) should GameOver still allow replaying any unlocked level (currently yes by design)? (b) should all 8 episodes stay unlocked for existing players/dev builds (a `?unlockAll` query param or dev flag)? (c) is sequential unlock even wanted, or best-scores-only? Keep it under ~40 lines.

**Verify**: section exists; `npm run typecheck && npm run lint && npm test` all green.

## Test plan

Step 2 is the test plan: the storage module gets full unit coverage (unlock chain, max-merge, corrupt-data, reset). Scene wiring is verified manually (Steps 3–4) — no Phaser test harness exists.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `src/systems/Progress.ts` exists with no Phaser imports
- [ ] `npm test` passes including ≥5 new Progress tests
- [ ] `npm run typecheck && npm run lint` exit 0
- [ ] Manual unlock-chain check reported (Step 4)
- [ ] `## Spike findings` section appended to this plan with the 3 open questions answered-or-raised
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The maintainer's intent turns out to be documented somewhere contradicting sequential unlock (e.g. a design note in the repo you find that says all-episodes-open is deliberate) — surface it instead of shipping locks.
- `Button.ts` changes ripple into more than the `disabled` option (its container/hover structure resists it) — report the friction rather than restructuring the UI layer in a spike.

## Maintenance notes

- The `version: 1` field exists so future schema changes can migrate instead of wiping saves — keep it.
- Follow-ups deferred by design: reset-progress UI, per-episode stats screen, `?unlockAll` dev flag (decide via the spike questions).
- Interacts with the other direction ideas (day/night themes, batarang): none structurally — this module stays purely additive.

## Spike findings

### What was built

- **`src/systems/Progress.ts`** — Phaser-free module persisting to `localStorage` key `bsog-progress-v1`. Schema: `{ version: 1, levels: Record<levelId, { completed, bestScore, mostRescued }> }`. All reads/writes wrapped in try/catch for private-browsing safety.
- **`src/systems/Progress.test.ts`** — Six vitest cases with in-memory `localStorage` stub (unlock chain, max-merge, corrupt JSON, reset, persistence).
- **`LevelComplete.ts`** — Calls `recordResult` before render; shows gold `#ffcc00` "NEW BEST!" when score exceeds prior best (first completion counts as new best).
- **`LevelSelect.ts`** — Uses `isUnlocked(levelId, LEVEL_ORDER)` for sequential gating; locked rows use grey styling (`0x222222` / `#555555`) and `(LOCKED)` suffix; completed rows show `BEST: <score>` in `#888888`.
- **`Button.ts`** — Optional `disabled?: boolean` skips interactivity and hover wiring.

### Storage schema

```json
{
  "version": 1,
  "levels": {
    "level-01": { "completed": true, "bestScore": 420, "mostRescued": 3 }
  }
}
```

Unlock rule implemented: `level-01` always unlocked; `level-N` unlocked iff `level-(N-1).completed === true`. Scores/rescues max-merge on each completion.

### Open questions for maintainer

**(a) GameOver replay of unlocked levels?**  
`GameOver` was left untouched (out of spike scope). It still routes to retry / level select without checking unlock state. Should death-screen "retry" remain available for any previously unlocked episode, or re-check `isUnlocked`?

**(b) Dev `unlockAll` flag?**  
Sequential lock may frustrate QA and returning players who expect all 8 episodes open. Worth a `?unlockAll=1` query param or dev-only bypass that skips `isUnlocked` without wiping saves?

**(c) Sequential unlock vs best-scores-only?**  
This spike ships sequential unlock (complete N to open N+1). Alternative: keep all episodes playable but persist bests only — simpler UX, less campaign feel. Which matches product intent?

### Manual verification

Fresh profile (`localStorage.removeItem('bsog-progress-v1')`): only Episode 1 clickable. After completing Episode 1, Episode 2 unlocks and `BEST: <score>` appears under Episode 1. Re-run with lower score: stored best remains the max.
