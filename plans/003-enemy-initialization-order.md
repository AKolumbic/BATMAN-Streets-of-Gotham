# Plan 003: Fix enemy subclass initialization order (wrong textures on spawn)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0a61e06..HEAD -- src/entities/Enemy.ts src/entities/enemies/GangsterMelee.ts src/entities/enemies/GangsterRanged.ts src/scenes/GameLevel.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding. Plan 002
> intentionally changes `Enemy.ts`/`GangsterRanged.ts` (adds
> `onAnimationComplete`/`resumePatrol`) — that change is EXPECTED and this
> plan assumes it. Any other mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (touches every enemy's construction path)
- **Depends on**: plans/002-ranged-gangster-recharge-slide.md
- **Category**: bug
- **Planned at**: commit `0a61e06`, 2026-07-05

## Why this matters

The base `Enemy` constructor calls `this.createSprite(config)` and `this.sprite.play(this.walkAnimKey)` **before** any subclass field initializers or constructor bodies run. Two concrete bugs follow:

1. `GangsterMelee.createSprite()` reads `this.variant` before it is assigned, so the expression `gangster${this.variant ?? 1}-idle` always resolves to `'gangster1-idle'` — variant-2 melee gangsters spawn with the wrong character's texture (the walk animation later corrects it, since Phaser animations carry their own texture).
2. Every subclass enemy briefly plays `'enemy-walk'` (the legacy 221×226 `enemy.png` spritesheet) for at least one frame before the subclass constructor re-plays the correct walk animation — a visible sprite flash on spawn.

The `?? 1` fallback is masking bug 1 rather than fixing it. The clean fix is to stop relying on subclass fields during base construction: pass per-type presentation options (texture key, animation keys, body size/offset, scale) into the base constructor.

## Current state

- `src/entities/Enemy.ts` — base class. Constructor (lines 43–75, as amended by plan 002): sets HP/patrol fields, then `this.sprite = this.createSprite(config)`, adds a platform collider, then `this.sprite.play(this.walkAnimKey, true)` where `walkAnimKey`/`attackAnimKey` are class-field defaults:

```ts
// Enemy.ts:39-41
protected walkAnimKey = 'enemy-walk';
protected attackAnimKey = 'enemy-punch';
```

```ts
// Enemy.ts:81-94 — default createSprite
protected createSprite(config: EnemyConfig) {
  const sprite = config.scene.physics.add
    .sprite(config.x, config.y, 'enemy')
    .setScale(ENEMY.SCALE) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  sprite.body.setSize(150, 200);
  sprite.body.setOffset(35, 20);
  ...
}
```

- `src/entities/enemies/GangsterMelee.ts` — sets `this.variant = variant` AFTER `super(config)`, overrides `createSprite` using `this.variant ?? 1` (line 29), sets anim keys after super, then re-plays walk:

```ts
// GangsterMelee.ts:11-23
constructor(config: EnemyConfig, variant: 1 | 2 = 1) {
  super(config);
  this.variant = variant;
  const prefix = `gangster${variant}`;
  this.walkAnimKey = `${prefix}-walk-anim`;
  this.attackAnimKey = `${prefix}-attack-anim`;
  if (this.sprite.active) {
    this.sprite.play(this.walkAnimKey, true);
  }
}
```

- `src/entities/enemies/GangsterRanged.ts` — same pattern: sets `walkAnimKey = 'gangster3-walk-anim'`, `attackAnimKey = 'gangster3-shot-anim'` after `super()`, overrides `createSprite` with texture `'gangster3-idle'`, body `setSize(60, 100)` / `setOffset(34, 28)` / scale `0.8`, re-plays walk. After plan 002 it also overrides `onAnimationComplete`.

- `src/scenes/GameLevel.ts:119-126` — constructs enemies by type:

```ts
switch (e.type) {
  case 'gangster-melee':
    return new GangsterMelee(config, (Math.random() > 0.5 ? 2 : 1) as 1 | 2);
  case 'gangster-ranged':
    return new GangsterRanged(config);
  default:
    return new Enemy(config);
}
```

- Animation keys are registered globally in `src/controls/controls.utils.ts` (`gangster1-walk-anim`, `gangster2-attack-anim`, `gangster3-shot-anim`, etc.). No level JSON currently uses the `default` (legacy `Enemy`) branch — all enemy types are `gangster-melee` or `gangster-ranged` — but keep the legacy branch working.

- Conventions: 2-space indent, single quotes, semicolons; entity classes are plain classes wrapping a physics sprite.

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Lint      | `npm run lint`       | exit 0              |
| Tests     | `npm test`           | all pass            |
| Dev server (manual check) | `npm run dev` | Vite serves on port 10001 |

## Scope

**In scope** (the only files you should modify):
- `src/entities/Enemy.ts`
- `src/entities/enemies/GangsterMelee.ts`
- `src/entities/enemies/GangsterRanged.ts`

**Out of scope** (do NOT touch):
- `src/scenes/GameLevel.ts` — the construction call sites keep their exact signatures (`new GangsterMelee(config, variant)`, `new GangsterRanged(config)`, `new Enemy(config)`).
- `src/controls/controls.utils.ts` animation definitions.
- `src/constants/physics.ts` values.
- `src/entities/NPC.ts`, `src/entities/Batman.ts`.

## Git workflow

- Branch: `advisor/003-enemy-init-order`
- Commit per step; imperative messages.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Add a presentation-options parameter to the base Enemy

In `src/entities/Enemy.ts`, define and accept options that subclasses pass through `super()`:

```ts
export interface EnemySpriteOptions {
  textureKey: string;
  walkAnimKey: string;
  attackAnimKey: string;
  scale: number;
  bodySize: { width: number; height: number };
  bodyOffset: { x: number; y: number };
}

const LEGACY_ENEMY_OPTIONS: EnemySpriteOptions = {
  textureKey: 'enemy',
  walkAnimKey: 'enemy-walk',
  attackAnimKey: 'enemy-punch',
  scale: ENEMY.SCALE,
  bodySize: { width: 150, height: 200 },
  bodyOffset: { x: 35, y: 20 },
};
```

Change the constructor to `constructor(config: EnemyConfig, options: EnemySpriteOptions = LEGACY_ENEMY_OPTIONS)`. Before `createSprite` runs, assign `this.walkAnimKey = options.walkAnimKey; this.attackAnimKey = options.attackAnimKey;` (drop the field-initializer defaults at lines 39–41, keep the fields `protected`). Rewrite `createSprite` to take `(config, options)` and use `options.textureKey`, `options.scale`, `options.bodySize`, `options.bodyOffset` instead of hardcoded values, and remove the `protected` override hook status if no subclass overrides it anymore (after Steps 2–3 neither subclass should override `createSprite` — make it `private`).

The constructor's `this.sprite.play(this.walkAnimKey, true)` now plays the correct animation on the first frame; there is no re-play needed anywhere.

**Verify**: `npm run typecheck` → errors ONLY in the two subclass files (they still override the old shape) — confirms the base change landed; proceed.

### Step 2: Convert GangsterMelee

Replace the class body so the constructor computes everything before `super()`:

```ts
export default class GangsterMelee extends Enemy {
  constructor(config: EnemyConfig, variant: 1 | 2 = 1) {
    const prefix = `gangster${variant}`;
    super(config, {
      textureKey: `${prefix}-idle`,
      walkAnimKey: `${prefix}-walk-anim`,
      attackAnimKey: `${prefix}-attack-anim`,
      scale: 0.8,
      bodySize: { width: 60, height: 100 },
      bodyOffset: { x: 34, y: 28 },
    });
  }
}
```

Delete the `variant` field (nothing else reads it), the `createSprite` override, and the re-play block.

**Verify**: `npm run typecheck` → errors only remaining in `GangsterRanged.ts`.

### Step 3: Convert GangsterRanged

Same conversion: constructor calls `super(config, { textureKey: 'gangster3-idle', walkAnimKey: 'gangster3-walk-anim', attackAnimKey: 'gangster3-shot-anim', scale: 0.8, bodySize: { width: 60, height: 100 }, bodyOffset: { x: 34, y: 28 } })`, then keeps its existing bullet-pool setup. Delete its `createSprite` override and the `// Re-start walk with the correct anim key` re-play block. Keep the `onAnimationComplete` override and `shoot()` from plan 002 unchanged.

**Verify**: `npm run typecheck && npm run lint && npm test` → all exit 0.

### Step 4: Manual behavior check

`npm run dev`; play Episode 1 (melee only) and one episode with ranged gangsters (`grep -l gangster-ranged src/data/levels/*.json`).

**Verify** (observed):
- Melee gangsters spawn in two visually distinct variants across a level with several of them (variant is random 50/50 per spawn — GameLevel.ts:121 — so check a level with 4+ melee enemies, e.g. level-02).
- No one-frame flash of a different (large, legacy) sprite at spawn.
- Punching an enemy still damages and kills it; its attack still hurts Batman.

## Test plan

No unit seam exists for entity construction (Phaser scene required). Gates: typecheck, lint, existing `npm test`, plus the Step 4 manual observations. Deferred: see Maintenance notes.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -n "variant ?? 1" src/entities/enemies/GangsterMelee.ts` → no matches
- [ ] `grep -c "createSprite" src/entities/enemies/GangsterMelee.ts src/entities/enemies/GangsterRanged.ts` → 0 in both
- [ ] `grep -c "Re-start walk" src/entities/enemies/*.ts` → 0
- [ ] Call sites in `src/scenes/GameLevel.ts` unchanged (`git diff --stat` shows no change to that file)
- [ ] Manual checks in Step 4 observed and reported
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 002 has not landed (no `onAnimationComplete` in `Enemy.ts`) — execute 002 first.
- `GameLevel.ts` enemy construction differs from the excerpt (someone changed the call sites).
- The manual check shows enemies not animating at all (animation keys may not match the registered keys in `controls.utils.ts` — report the exact key mismatch).

## Maintenance notes

- New enemy types should now be added by passing an `EnemySpriteOptions` to `super()` — no `createSprite` override, no post-super re-play. Update `CLAUDE.md`'s "Enemy subclasses" convention line when plan 007 rewrites it.
- Reviewer should scrutinize: body size/offset values are preserved exactly (60×100 at offset 34,28 scale 0.8 for both gangster types; 150×200 at 35,20 scale `ENEMY.SCALE` for legacy).
- Deferred: extracting patrol/attack state logic into a plain-TS state machine testable without Phaser.
