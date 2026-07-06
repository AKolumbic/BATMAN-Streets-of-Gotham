# Plan 005: Make the floor span the full width of every level

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0a61e06..HEAD -- src/systems/LevelLoader.ts src/scenes/GameLevel.ts src/data/levels/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: bug / data
- **Planned at**: commit `0a61e06`, 2026-07-05

## Why this matters

Every level defines exactly one `"ground"` FLOOR platform, but the ground texture (`blk-ground.png`, loaded as key `ground`) is only **287×2 pixels**. Even at the largest scale used (10), one entry covers ~2,870px — while level worlds are 2,822–5,000px wide. Example: level-08 (`worldWidth: 5000`) has its floor centered at x=700 with scale 10, spanning roughly x −735…2135; the remaining ~2,900px of the level has no floor at all. Batman doesn't fall only because `setCollideWorldBounds(true)` gives him an invisible physics floor at y=600 — so the back half of most levels plays out on invisible ground with no floor visual and a small height step where the real floor ends. The fix: generate the floor procedurally from `worldWidth` in the level loader, and remove the per-level hand-placed FLOOR entries that can silently under-cover.

## Current state

- `public/assets/imgs/blk-ground.png` — 287×2 px (verify: `sips -g pixelWidth -g pixelHeight public/assets/imgs/blk-ground.png`). Loaded as texture key `ground` via `Images.GROUND` in `src/constants/assets.ts:30` / `src/systems/AssetLoader.ts:25`.
- `src/systems/LevelLoader.ts` — data-driven platform creation:

```ts
// LevelLoader.ts:57-68
export function createPlatformsFromData(
  physics: Phaser.Physics.Arcade.ArcadePhysics,
  platforms: LevelPlatform[]
): Phaser.Physics.Arcade.StaticGroup {
  const group = physics.add.staticGroup();
  for (const p of platforms) {
    group.create(p.x, p.y, p.texture).setScale(p.scale).refreshBody();
  }
  return group;
}
```

Also in this file: the `LevelData` interface (lines 35–52) — this plan adds one optional field to it.

- `src/scenes/GameLevel.ts:95-98` — the scene calls `createPlatformsFromData(this.physics, this.levelData.platforms)`; world/camera sizing at lines 154–165 (`this.physics.world.bounds.width = this.levelData.worldWidth`; world height stays at the 600px game height, so the walkable floor line is y=600).
- Each of `src/data/levels/level-0[1-8].json` has exactly one FLOOR entry as the first platform, e.g.:

```json
{ "x": 400, "y": 600, "texture": "ground", "scale": 6, "label": "FLOOR" },
```

(x/scale vary per level: scales 5–10, centers x=300–700.) All other platforms use texture `"platform"` (386×72px, `sml-platform.png`).

- Levels are registered in `src/data/levels/index.ts` (`LEVELS`, `LEVEL_ORDER`). Plan 001 added `src/data/levels/levels.test.ts` validating level JSON invariants — extend it here.
- Note: `worldHeight` in the level JSONs (384–500) is misleading dead data — the camera clamps scrollY to 0 because the bounds are shorter than the 600px viewport (verified against Phaser's `BaseCamera.clampY`, which takes `Math.max` of the limits). This plan does NOT change `worldHeight`; it's recorded here so you don't "fix" it in passing.
- Conventions: 2-space indent, single quotes, semicolons; all asset keys via `src/constants/assets.ts`; level layout is data-driven JSON.

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Lint      | `npm run lint`       | exit 0              |
| Tests     | `npm test`           | all pass            |
| Dev server (manual check) | `npm run dev` | Vite serves on port 10001 |

## Scope

**In scope** (the only files you should modify):
- `src/systems/LevelLoader.ts`
- `src/scenes/GameLevel.ts` (only the platform-creation call)
- `src/data/levels/level-01.json` … `level-08.json` (remove the FLOOR entry; add the `floor` field)
- `src/data/levels/levels.test.ts` (extend)

**Out of scope** (do NOT touch):
- `worldHeight` values in the level JSONs (see note above).
- Non-FLOOR platform entries (the `"platform"`-texture layout).
- `src/scenes/1-LevelOne/` (dead code; also imports level-01.json — see STOP conditions if plan 006 hasn't removed it and the typecheck complains).
- `public/assets/imgs/` — no new art.

## Git workflow

- Branch: `advisor/005-full-width-floor`
- Commit per step; imperative messages.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add a `floor` field to LevelData and a tiled-floor creator

In `src/systems/LevelLoader.ts`:

- Add to the `LevelData` interface (after `platforms`):

```ts
/** Full-width tiled floor; segments are generated to cover worldWidth. */
floor?: { texture: string; y: number; scale: number };
```

- Add an exported pure helper (pure so it can be unit-tested) plus the creator:

```ts
/**
 * Compute center x-positions for floor segments so scaled tiles of
 * `textureWidth * scale` cover [0, worldWidth] with no gap.
 */
export function computeFloorSegmentCenters(
  worldWidth: number,
  textureWidth: number,
  scale: number
): number[] {
  const segmentWidth = textureWidth * scale;
  const count = Math.ceil(worldWidth / segmentWidth);
  const centers: number[] = [];
  for (let i = 0; i < count; i++) {
    centers.push(i * segmentWidth + segmentWidth / 2);
  }
  return centers;
}

const GROUND_TEXTURE_WIDTH = 287; // blk-ground.png is 287x2 px

export function createFloor(
  physics: Phaser.Physics.Arcade.ArcadePhysics,
  group: Phaser.Physics.Arcade.StaticGroup,
  floor: { texture: string; y: number; scale: number },
  worldWidth: number
): void {
  for (const cx of computeFloorSegmentCenters(
    worldWidth,
    GROUND_TEXTURE_WIDTH,
    floor.scale
  )) {
    group.create(cx, floor.y, floor.texture).setScale(floor.scale).refreshBody();
  }
}
```

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Call it from GameLevel

In `src/scenes/GameLevel.ts`, after `this.platforms = createPlatformsFromData(...)` (lines 95–98), add:

```ts
if (this.levelData.floor) {
  createFloor(
    this.physics,
    this.platforms,
    this.levelData.floor,
    this.levelData.worldWidth
  );
}
```

Import `createFloor` from `'../systems/LevelLoader'` alongside the existing imports.

**Verify**: `npm run typecheck` → exit 0.

### Step 3: Convert the 8 level JSONs

In each `src/data/levels/level-0N.json`:
- Delete the one platform entry with `"texture": "ground"` (it always carries `"label": "FLOOR"`).
- Add a top-level field after `"platforms"`' sibling `"player"` (placement in the object doesn't matter for JSON, but keep it next to `platforms` for readability):

```json
"floor": { "texture": "ground", "y": 600, "scale": 6 },
```

Use `y: 600` and `scale: 6` for all 8 levels (the previous per-level scales only varied to stretch one tile further; tiling makes that unnecessary, and scale 6 → 12px-tall floor segments matching the current look).

**Verify**: `grep -c '"texture": "ground"' src/data/levels/*.json` → 0 for every file; `grep -c '"floor"' src/data/levels/*.json` → 1 for every file.

### Step 4: Extend the level-data test

In `src/data/levels/levels.test.ts` add:
- Every level has a `floor` object with `texture === 'ground'`, `y === 600`, `scale > 0`.
- No entry in `platforms` uses texture `'ground'` anymore.
- Unit-test `computeFloorSegmentCenters`: for `(5000, 287, 6)` the segments cover the full range — first center ≤ segmentWidth/2, last center + segmentWidth/2 ≥ 5000, consecutive centers exactly segmentWidth apart; also test an exact-multiple case (e.g. `(2870, 287, 10)` → 1 segment) and that coverage holds for each actual level's `worldWidth`.

**Verify**: `npm test` → all pass.

### Step 5: Manual check

`npm run dev`; play level-08 (Episode 8, "The Devil You Know") and walk right to the far end of the level (x≈5000).

**Verify** (observed): a floor strip is visible under Batman for the entire walk; no height step or gap where the old single tile used to end (previously around x≈2,135).

## Test plan

Step 4 covers it: JSON invariants + the pure tiling function (happy path, exact multiple, per-level coverage). Model after the existing assertions in `src/data/levels/levels.test.ts` from plan 001.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck`, `npm run lint`, `npm test` all exit 0
- [ ] `grep -rn '"texture": "ground"' src/data/levels/` → no matches
- [ ] `grep -c '"floor"' src/data/levels/level-0*.json` → 1 per file (8 total)
- [ ] `computeFloorSegmentCenters` is exported from `src/systems/LevelLoader.ts` and unit-tested
- [ ] Manual check on level-08 reported
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `blk-ground.png` is not 287px wide (art changed — the constant must match; report instead of guessing).
- Levels contain more than one `"ground"` entry each, or ground entries at y ≠ 600 (layout intent unclear — report).
- Typecheck fails inside `src/scenes/1-LevelOne/LevelOne.ts` after the JSON change: that dead scene also parses level-01.json. If plan 006 (dead-code removal) has already landed, this can't happen; if it hasn't, the JSON change here is additive (old FLOOR entry removed, but that scene only reads `platforms`) — an error there means something else drifted. Report it.

## Maintenance notes

- New levels must set `floor` (or explicitly have none for pit-based levels — the field is optional by design). Plan 007 should document this in CLAUDE.md's level-JSON description.
- If proper tile-based levels ever land (TilemapManager exists but is unused), this generated floor is the first thing a tilemap replaces.
- Reviewer: check the floor segments join seamlessly on screen (texture is a flat strip, so seams should be invisible).
