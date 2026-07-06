# Plan 007: Make CLAUDE.md and README describe the actual codebase

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0a61e06..HEAD -- CLAUDE.md README.md src/scenes/ src/systems/ package.json`
> This plan is written to be executed AFTER plans 001–006; the docs you write
> must describe the code as it exists at execution time, not as excerpted
> here. Survey the live tree in Step 1 rather than trusting any tree in this
> file.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-* (scripts exist), plans/006-* (dead code gone)
- **Category**: docs
- **Planned at**: commit `0a61e06`, 2026-07-05

## Why this matters

`CLAUDE.md` is loaded into every agent session in this repo, and it is actively wrong: it names `LevelOne` as the main gameplay scene (`Boot -> GameMenu -> LevelSelect -> LevelOne -> ...`), while the real flow routes through `EpisodeIntro` into the generic `GameLevel` scene, and `1-LevelOne/` was dead code (deleted by plan 006). It also omits `GameLevel.ts`, `EpisodeIntro.ts`, and `AssetLoader.ts` from the directory tree, claims physics constants are centralized in `constants/physics.ts` (only true after plan 006), and lists no typecheck/lint/test commands (added by plan 001). Wrong instructions are worse than none — every agent session starts by being misled. README's architecture section has the same drift.

## Current state

- `CLAUDE.md` (repo root) — states:
  - "Scene flow: `Boot` -> `GameMenu` -> `LevelSelect` -> `LevelOne` -> `LevelComplete` / `GameOver`" — wrong: actual registered scenes (`src/scenes/index.ts`) are `Boot, GameMenu, LevelSelect, EpisodeIntro, GameLevel, LevelComplete, GameOver`, and the flow is `Boot -> GameMenu -> LevelSelect -> EpisodeIntro -> GameLevel -> LevelComplete | GameOver` (with `GameOver` retry looping back to `EpisodeIntro`, per `src/scenes/GameOver.ts:47`).
  - A directory tree listing `scenes/1-LevelOne/` with "LevelOne.ts # Main gameplay scene" and `data/levels/level-01.json` as the only level — wrong: gameplay is `src/scenes/GameLevel.ts` (data-driven, any level ID), there are 8 level JSONs plus `src/data/levels/index.ts` (the `LEVELS` registry), and `src/systems/AssetLoader.ts` exists.
  - Build commands list only `dev`/`build`/`preview` — plan 001 added `typecheck`, `lint`, `test`.
- `README.md` — the "Architecture"/"Scene Flow" sections mirror the same stale flow. Its "The Rewrite", "Episodes", "Controls", and "Getting Started" sections are accurate; leave them.
- Ground truth to survey at execution time: `src/scenes/index.ts` (scene registry), `find src -type f`, `package.json` scripts, `src/data/levels/index.ts`, and the enemy-subclass convention established by plan 003 (subclasses pass `EnemySpriteOptions` to `super()`; no `createSprite` override), and the `floor` level-JSON field added by plan 005.

## Commands you will need

| Purpose   | Command                    | Expected on success |
|-----------|----------------------------|---------------------|
| Live tree | `find src -type f \| sort` | current file list   |
| Scripts   | `cat package.json`         | current scripts     |
| Typecheck | `npm run typecheck`        | exit 0 (docs change nothing) |

## Scope

**In scope**:
- `CLAUDE.md`
- `README.md` (only the Architecture / Scene Flow / project-structure and commands sections)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- Any source file.
- README sections: "The Rewrite" narrative, Episodes table, Controls table, banner images, License.
- `AGENTS.md` if present — verify first (Step 1): if it duplicates CLAUDE.md content, note that in your report; do not rewrite it without instruction.

## Git workflow

- Branch: `advisor/007-fix-stale-docs`
- One or two commits; imperative messages.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Survey ground truth

Run `find src -type f | sort`, `cat src/scenes/index.ts`, `cat package.json`, and skim `src/scenes/GameLevel.ts`, `src/scenes/EpisodeIntro.ts`, `src/systems/LevelLoader.ts` (the `LevelData` interface). Record: registered scenes, actual scene transitions (`scene.start` calls), scripts, level-JSON fields.

**Verify**: your recorded scene list matches `src/scenes/index.ts` exactly.

### Step 2: Rewrite the stale sections of CLAUDE.md

Update, keeping the existing headings/style:
- **Build & Development Commands**: add `npm run typecheck`, `npm run lint`, `npm test` with one-line descriptions.
- **Scene flow**: `Boot -> GameMenu -> LevelSelect -> EpisodeIntro -> GameLevel -> LevelComplete | GameOver` (note: `GameOver` retry returns to `EpisodeIntro`; `LevelComplete` "PLAY AGAIN" starts `GameLevel` directly).
- **Directory structure**: regenerate from the live tree (Step 1). Must include `scenes/GameLevel.ts`, `scenes/EpisodeIntro.ts`, `systems/AssetLoader.ts`, all 8 level JSONs + `data/levels/index.ts`, and must NOT include `1-LevelOne/`.
- **Key conventions**: keep the existing bullets (asset paths in `assets.ts`, physics constants in `physics.ts`, data-driven levels) and update the enemy bullet to: "Enemy subclasses pass an `EnemySpriteOptions` object to `super()` (texture, animation keys, body size); do not override `createSprite()`". Add: "Level JSONs declare a `floor` field; the full-width floor is generated by `createFloor` in `LevelLoader.ts`". Add: "`GameLevel` accepts `{ levelId }` in its init data and looks levels up in the `LEVELS` registry".

**Verify**: `grep -n "LevelOne" CLAUDE.md` → no matches (except none); every path named in CLAUDE.md exists (`grep -oE 'src/[A-Za-z0-9/._-]+' CLAUDE.md | sort -u | while read p; do [ -e "$p" ] || echo "MISSING: $p"; done` → no output).

### Step 3: Fix README's architecture section

Apply the same scene-flow and structure corrections to `README.md`. Add the new scripts to its Commands table.

**Verify**: `grep -n "LevelOne" README.md` → no matches; the Commands table lists `typecheck`, `lint`, `test`.

## Test plan

Docs-only; the path-existence check in Step 2 is the test. `npm run typecheck` must still exit 0 (sanity that nothing else was touched).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -rn "LevelOne" CLAUDE.md README.md` → no matches
- [ ] Every `src/...` path mentioned in CLAUDE.md exists on disk (Step 2 check outputs nothing)
- [ ] CLAUDE.md and README both document `typecheck`/`lint`/`test` scripts
- [ ] `git diff --stat` touches only CLAUDE.md, README.md, plans/README.md
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plans 001 or 006 have not landed (scripts missing from `package.json`, or `src/scenes/1-LevelOne/` still exists) — the docs would immediately be wrong again; execute those first or report.
- `AGENTS.md` exists with conflicting content — report what it says instead of unilaterally rewriting two instruction files.

## Maintenance notes

- CLAUDE.md's directory tree will rot again; the path-existence one-liner in Step 2 is cheap to re-run and worth adding to any future CI.
- Reviewer: check the conventions section against plans 003/005 as actually merged (if either was rejected, the corresponding convention line must not be added).
