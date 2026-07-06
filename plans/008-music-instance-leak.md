# Plan 008: Stop leaking music instances across scene restarts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0a61e06..HEAD -- src/scenes/GameLevel.ts src/scenes/GameMenu.ts`
> Plans 004 (GameLevel end-condition guards) and 001 (GameMenu line 18 spread)
> intentionally touch these files. Any other mismatch with the excerpts below
> is a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: bug (minor)
- **Planned at**: commit `0a61e06`, 2026-07-05

## Why this matters

Every time `GameLevel.create()` runs (each episode start, retry, or replay), it calls `this.sound.add(...)`, which registers a brand-new sound instance in Phaser's global sound manager. Old instances are stopped on win/lose but never removed, so they accumulate for the lifetime of the page — a slow memory leak that grows with every retry. `GameMenu.create()` has the same pattern. Additionally, `GameLevel` only stops its music inside `handleWin`/`handleGameOver`; any future exit path (a pause-menu "quit", for example) would leave music playing over the next scene. Reusing one instance per key and stopping on scene shutdown fixes both.

## Current state

- `src/scenes/GameLevel.ts:68-70`:

```ts
// Music
this.gameMusic = this.sound.add(this.levelData.music);
this.gameMusic.play({ volume: 0.35, loop: true });
```

`this.gameMusic` is typed `Phaser.Sound.BaseSound` (field at line 36). `handleWin` (line 209) and `handleGameOver` (line 227) call `this.gameMusic.stop()`.

- `src/scenes/GameMenu.ts:29-31`:

```ts
// Intro Music
const music = this.sound.add(Audio.INTRO_MUSIC.key);
music.play({ volume: 0.5, loop: true });
```

`startGame` (lines 56-59) stops it when leaving for LevelSelect. Returning to the menu later (LevelSelect "BACK TO MENU") runs `create()` again and adds another instance.

- Phaser API facts: `this.sound.get(key)` returns the first existing instance with that key or `null`; `Phaser.Scenes.Events.SHUTDOWN` fires on `scene.start()` away from a scene; `this.events.once(...)` is the scene-level event emitter.
- Conventions: 2-space indent, single quotes, semicolons.

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Lint      | `npm run lint`       | exit 0              |
| Tests     | `npm test`           | all pass            |
| Dev server (manual check) | `npm run dev` | Vite serves on port 10001 |

## Scope

**In scope** (the only files you should modify):
- `src/scenes/GameLevel.ts`
- `src/scenes/GameMenu.ts`

**Out of scope** (do NOT touch):
- Volume levels, loop flags, or which tracks play where.
- `src/systems/AssetLoader.ts`, `src/constants/assets.ts`.
- Adding a pause menu or new exit paths (this plan only future-proofs the shutdown hook).

## Git workflow

- Branch: `advisor/008-music-instance-leak`
- One commit; imperative message.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Reuse-or-create in GameLevel, stop on shutdown

Replace `GameLevel.ts:68-70` with:

```ts
// Music — reuse the existing instance across restarts (sound.add would
// register a new instance in the global sound manager every create())
this.gameMusic =
  this.sound.get(this.levelData.music) ?? this.sound.add(this.levelData.music);
this.gameMusic.play({ volume: 0.35, loop: true });

// Any exit from this scene must silence the level music
this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  this.gameMusic.stop();
});
```

Keep the existing `this.gameMusic.stop()` calls in `handleWin`/`handleGameOver` (stopping twice is harmless; they stop the music 500–1000ms before the transition, which the shutdown hook alone wouldn't).

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Same pattern in GameMenu

Replace `GameMenu.ts:29-31` with the get-or-add pattern for `Audio.INTRO_MUSIC.key` (volume 0.5, loop true). Keep `startGame`'s `music.stop()`.

**Verify**: `npm run typecheck && npm run lint && npm test` → all exit 0.

### Step 3: Manual check

`npm run dev`. In the browser console run `game === undefined` is fine — instead verify via behavior: play an episode, die, retry 3 times, then in DevTools console check the sound manager if reachable; otherwise verify by ear/behavior:

**Verify** (observed):
- Music plays once (not layered/doubled) after multiple retries.
- Menu music resumes correctly after LevelSelect → BACK TO MENU.
- Music stops when a level ends (both win and lose paths).

## Test plan

No automated seam for Phaser's sound manager here. Gates: typecheck/lint/tests + Step 3 observations (layered audio is unmistakable by ear).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck`, `npm run lint`, `npm test` all exit 0
- [ ] `grep -c "sound.get" src/scenes/GameLevel.ts src/scenes/GameMenu.ts` → 1 each
- [ ] `grep -c "Scenes.Events.SHUTDOWN" src/scenes/GameLevel.ts` → 1
- [ ] Manual checks reported
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The music lines no longer match the excerpts (drifted beyond plans 001/004's known edits).
- After the change, music fails to restart on a retry (a stopped instance not resuming with `.play()` would indicate a Phaser version quirk — report, don't work around with `sound.add`).

## Maintenance notes

- If per-level music tracks are ever added (level JSON already has a `music` field), the get-or-add key lookup here already supports it — just load the new audio keys in `AssetLoader`.
- Reviewer: confirm no double-play (calling `.play()` on an already-playing looped instance restarts it — correct for scene entry).
