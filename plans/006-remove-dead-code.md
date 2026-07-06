# Plan 006: Remove dead code and consolidate duplicated constants

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0a61e06..HEAD -- src/scenes/ src/entities/Batman.ts src/constants/ src/systems/AssetLoader.ts src/game.ts src/ui/HUD.ts`
> Plans 001–005 intentionally touch some of these files — reconcile against
> `plans/README.md` status first. Unexplained drift in the excerpts below is
> a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/002-*, plans/003-*, plans/004-* (land the bug fixes first so deletions don't conflict)
- **Category**: tech-debt
- **Planned at**: commit `0a61e06`, 2026-07-05

## Why this matters

A 2026 rewrite left a trail of dead code that actively misleads readers and agents: a 335-line legacy gameplay scene that is not even registered, physics constants that exist in two places with only one copy used, UI-kit code paths that can never execute, and per-level loading of tile assets no level uses. None of it is load-bearing; all of it costs comprehension time and (in the tile-asset case) network loads on every level start. This plan deletes what's dead and consolidates what's duplicated. It deliberately KEEPS three things that look dead but are staged future work: `DialogueBox`, `UIAssets`, and the `BATARANG` asset entry (see "Keep list").

## Current state

All confirmed dead by grep at planning time (`0a61e06`):

1. **`src/scenes/1-LevelOne/`** (`LevelOne.ts` 184 lines, `LevelOne.utils.ts` 151 lines) — a legacy copy of the gameplay scene. `src/scenes/index.ts` registers `[Boot, GameMenu, LevelSelect, EpisodeIntro, GameLevel, LevelComplete, GameOver]` — LevelOne is absent; nothing imports from `1-LevelOne/` (`grep -rn "LevelOne" src --include='*.ts' | grep -v 1-LevelOne` → no hits).
2. **Duplicated constants** — `src/constants/physics.ts` exports `WORLD` and `BATMAN`, but nothing imports them; `src/entities/Batman.ts:34-39` re-declares the same values as private statics (`MOVE_SPEED = 160`, `JUMP_VELOCITY = -400`, `EXTRA_GRAVITY = 200`, `INVULNERABILITY_MS = 1000`, `KNOCKBACK_X = 200`, `KNOCKBACK_Y = -150`), and `Batman.ts:43` hardcodes `maxHp = 5` (=`BATMAN.MAX_HP`) and `:49` hardcodes `.setScale(1.15)` (=`BATMAN.SCALE`). `src/game.ts` hardcodes `width: 800, height: 600, gravity { y: 300 }` (=`WORLD`). `ENEMY` and `NPC` from the same file ARE used properly.
3. **Unreachable HUD branch** — `src/ui/HUD.ts:41` checks `this.scene.textures.exists('ui-bar-bg')`, but no code ever loads a texture with that key (`UIAssets` in `assets.ts:377-394` is never referenced by any loader), so the image branch is dead and the else-branch creates a throwaway `'__DEFAULT'` image (line 54) plus an untracked rectangle that `destroy()` (line 149) doesn't clean up.
4. **City tiles loaded every level for no consumer** — `src/systems/AssetLoader.ts:85` calls `loadCityTileAssets(load)` ("for future tilemap-based levels"), loading 3 tile images on every level start; no tilemap is ever created (`TilemapManager.createTilemap` has zero callers). Also `loadCityTileAssets` in `src/systems/TilemapManager.ts:80-95` hardcodes asset paths, violating the "all paths in `assets.ts`" convention.
5. **Unused spritesheet loads/entries** — `Spritesheets.GANGSTER1_SHOT`, `GANGSTER1_RECHARGE`, `GANGSTER2_ATTACK2`, `GANGSTER2_ATTACK3` are defined in `assets.ts` and never loaded nor animated. `HOMELESS1_HURT` is loaded (`AssetLoader.ts:75`) but no animation ever uses it.

**Keep list (do NOT delete — staged future work):**
- `src/ui/DialogueBox.ts` — unused but complete; NPC-dialogue is a named direction item (plan 009's index notes).
- `UIAssets` in `src/constants/assets.ts` — the UI-kit integration path; add a `// TODO: not yet loaded anywhere` comment instead of deleting.
- `Images.BATARANG` — batarang/secondary-attack is grounded future work (keys 2–4 are already bound in `controls.utils.ts`).
- `src/systems/TilemapManager.ts` module itself (only the per-level asset loading call goes; keep the module for future tilemap levels).

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Lint      | `npm run lint`       | exit 0              |
| Tests     | `npm test`           | all pass            |
| Build     | `npm run build`      | exit 0              |

## Scope

**In scope** (the only files you should modify/delete):
- `src/scenes/1-LevelOne/` (delete directory)
- `src/entities/Batman.ts`, `src/game.ts`, `src/constants/physics.ts` (consolidate constants)
- `src/constants/assets.ts` (remove the 4 dead spritesheet entries; TODO comment on `UIAssets`)
- `src/systems/AssetLoader.ts` (drop `loadCityTileAssets` call + `HOMELESS1_HURT` load)
- `src/ui/HUD.ts` (remove unreachable branch)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- Everything on the Keep list above.
- `src/systems/TilemapManager.ts` beyond removing its import from AssetLoader — the module stays.
- `public/assets/` — delete no asset files (unused PNGs on disk are cheap; deleting art is a separate decision).
- `CLAUDE.md` / `README.md` — plan 007 rewrites docs after this lands.

## Git workflow

- Branch: `advisor/006-remove-dead-code`
- Commit per step; imperative messages.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Delete the legacy scene

`git rm -r src/scenes/1-LevelOne/`

**Verify**: `npm run typecheck && npm run build` → exit 0 (nothing imported it). `grep -rn "LevelOne" src --include='*.ts'` → no matches.

### Step 2: Consolidate Batman/world constants

- In `src/entities/Batman.ts`: import `BATMAN` from `'../constants/physics'`; delete the six private statics (lines 34–39) and replace their uses with `BATMAN.MOVE_SPEED`, `BATMAN.JUMP_VELOCITY`, `BATMAN.EXTRA_GRAVITY`, `BATMAN.INVULNERABILITY_MS`, `BATMAN.KNOCKBACK_X`, `BATMAN.KNOCKBACK_Y`; replace `this.maxHp = 5` with `BATMAN.MAX_HP` and `.setScale(1.15)` with `.setScale(BATMAN.SCALE)`.
- In `src/game.ts`: import `WORLD` from `'./constants/physics'`; use `WORLD.GAME_WIDTH`, `WORLD.GAME_HEIGHT`, `WORLD.GRAVITY_Y` in the config.

**Verify**: `npm run typecheck && npm run lint` → exit 0. `grep -n "MOVE_SPEED = 160" src/entities/Batman.ts` → no matches.

### Step 3: Remove the unreachable HUD image branch

In `src/ui/HUD.ts` `createHealthBar()`: delete the `textures.exists('ui-bar-bg')` conditional entirely. Keep only the rectangle-based bar, and store the background rectangle in a field so `destroy()` cleans it up. Change the `healthBarBg` field type from `Phaser.GameObjects.Image` to `Phaser.GameObjects.Rectangle` and remove the `'__DEFAULT'` placeholder hack. Leave a one-line comment: `// UI-kit image bars (UIAssets) are staged but not loaded yet — see assets.ts`.

**Verify**: `npm run typecheck` → exit 0. `grep -n "__DEFAULT\|ui-bar-bg" src/ui/HUD.ts` → no matches.

### Step 4: Stop loading assets nothing uses

- In `src/systems/AssetLoader.ts`: remove the `loadCityTileAssets(load)` call (line 85), its import (line 2), and the `HOMELESS1_HURT` load (line 75).
- In `src/constants/assets.ts`: delete the `GANGSTER1_SHOT`, `GANGSTER1_RECHARGE`, `GANGSTER2_ATTACK2`, `GANGSTER2_ATTACK3`, and `HOMELESS1_HURT` spritesheet entries; add above `UIAssets`: `// TODO: UIAssets are not loaded anywhere yet — staged for the UI-kit integration.`

**Verify**: `npm run typecheck && npm test && npm run build` → all exit 0.

### Step 5: Full-game smoke check

`npm run dev`; from the menu, enter an episode, punch an enemy, rescue an NPC, and finish or die.

**Verify** (observed): all sprites/animations render as before; HUD bar drains and recolors on damage; no 404s or missing-texture green squares in the browser console (check DevTools console for Phaser "Texture missing" warnings).

## Test plan

Existing `npm test` (level-data tests) must pass unchanged. No new tests — this plan removes code. The Step 5 console check guards against removing a texture something still referenced.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `src/scenes/1-LevelOne/` does not exist
- [ ] `grep -rn "GANGSTER1_SHOT\|GANGSTER2_ATTACK2\|GANGSTER2_ATTACK3\|HOMELESS1_HURT" src/` → no matches
- [ ] `grep -rn "loadCityTileAssets" src/systems/AssetLoader.ts` → no matches (still defined in TilemapManager.ts)
- [ ] `grep -c "import { BATMAN" src/entities/Batman.ts` → 1 (or combined import line present)
- [ ] `src/ui/DialogueBox.ts`, `UIAssets`, `Images.BATARANG` still exist (keep list honored)
- [ ] `npm run typecheck && npm run lint && npm test && npm run build` all exit 0
- [ ] Smoke check reported
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Anything in `src/` imports from `1-LevelOne/` at execution time (drift — someone revived it).
- A constant value in `physics.ts` differs from the private static it replaces (e.g. someone tuned `Batman.ts` independently) — consolidating would silently change gameplay; report the discrepancy.
- The smoke check shows a missing texture (a "dead" asset was actually referenced somewhere grep missed, e.g. a computed key string).

## Maintenance notes

- Computed animation/texture keys (`` `${prefix}-walk-anim` ``) don't show up in greps for the constant names — that's why Step 5's console check matters; keep that habit for future asset removals.
- Plan 007 (docs) depends on this plan: CLAUDE.md's directory tree must describe the post-deletion layout.
- Deferred: deleting unused PNG/OGG files from `public/assets/` (a size optimization, riskier to verify); wiring `UIAssets` into HUD/Button/DialogueBox (direction work).
