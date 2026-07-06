# Plan 004: Make death take precedence over victory on the same frame

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0a61e06..HEAD -- src/scenes/GameLevel.ts`
> If `GameLevel.ts` changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: bug
- **Planned at**: commit `0a61e06`, 2026-07-05

## Why this matters

If Batman dies on the same frame the last enemy dies (entirely possible: a bullet or contact hit lands as the final punch connects), `GameLevel.update()` runs BOTH end conditions: `handleGameOver()` executes, and because there is no `return` after it, the win check also passes and `handleWin()` executes. Both schedule scene transitions — GameOver after 1000ms, LevelComplete after 500ms — so **LevelComplete fires first** and a dead Batman is shown "GOTHAM IS SAFE". Death should win the tie, and neither handler should be re-enterable.

## Current state

- `src/scenes/GameLevel.ts` — the only file involved. The relevant `update()` tail (lines 196–205):

```ts
// GameLevel.ts:196-205
    // Check for game over
    if (this.batman.isDead()) {
      this.handleGameOver();
    }

    // Check for win — all enemies defeated
    if (this.enemies.every((e) => !e.isAlive)) {
      this.handleWin();
    }
  }
```

- The handlers (lines 207–236). `handleWin()` sets `this.levelComplete = true`, stops music, and `this.time.delayedCall(500, () => this.scene.start('LevelComplete', {...}))`. `handleGameOver()` sets `this.gameOver = true`, tints Batman, stops music, and `this.time.delayedCall(1000, () => this.scene.start('GameOver', {...}))`.
- `update()` already early-returns at the top when `this.gameOver || this.levelComplete` (line 172) — but that only protects *subsequent* frames, not the same frame.
- Conventions: 2-space indent, single quotes, semicolons.

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Lint      | `npm run lint`       | exit 0              |
| Tests     | `npm test`           | all pass            |

## Scope

**In scope** (the only file you should modify):
- `src/scenes/GameLevel.ts`

**Out of scope** (do NOT touch):
- `src/scenes/GameOver.ts`, `src/scenes/LevelComplete.ts` — their data contracts stay as-is.
- The 500ms/1000ms delay values — cosmetic pacing, not part of this bug.
- `src/scenes/1-LevelOne/LevelOne.ts` — dead code (not registered in `src/scenes/index.ts`); it has the same pattern but is deleted by plan 006.

## Git workflow

- Branch: `advisor/004-death-beats-victory`
- One commit; imperative message.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Return after game over, and guard both handlers

In `update()`, add a `return` so the win check cannot run on a death frame:

```ts
    // Check for game over — death takes precedence over victory
    if (this.batman.isDead()) {
      this.handleGameOver();
      return;
    }
```

Add idempotency guards as the first line of each handler (defense against any future caller):

```ts
  private handleWin(): void {
    if (this.gameOver || this.levelComplete) return;
    ...
  }

  private handleGameOver(): void {
    if (this.gameOver || this.levelComplete) return;
    ...
  }
```

**Verify**: `npm run typecheck && npm run lint && npm test` → all exit 0.

### Step 2: Manual sanity check

`npm run dev`, play Episode 1: (a) die on purpose → GameOver screen appears; (b) restart and clear the level → LevelComplete appears with score/rescue stats.

**Verify** (observed): both normal endings still work.

## Test plan

The scene isn't unit-testable without a Phaser harness (none exists; out of scope). Gates: typecheck/lint/existing tests + Step 2 manual check of both endings.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck`, `npm run lint`, `npm test` all exit 0
- [ ] `grep -A2 "this.handleGameOver();" src/scenes/GameLevel.ts` shows a `return;` immediately after the call inside `update()`
- [ ] Both `handleWin` and `handleGameOver` begin with the `if (this.gameOver || this.levelComplete) return;` guard
- [ ] Manual check of both endings reported
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The `update()` tail no longer matches the excerpt (drifted).
- Either ending stops working in the manual check.

## Maintenance notes

- If a draw/tie rule is ever wanted (e.g. "you cleared it, dying counts as a win"), it belongs here — the precedence is now explicit in one place.
- Reviewer: confirm no other code path calls `handleWin`/`handleGameOver`.
