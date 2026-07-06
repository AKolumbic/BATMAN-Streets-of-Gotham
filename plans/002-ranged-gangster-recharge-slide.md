# Plan 002: Stop ranged gangsters sliding across the map while recharging

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 0a61e06..HEAD -- src/entities/Enemy.ts src/entities/enemies/GangsterRanged.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md
- **Category**: bug
- **Planned at**: commit `0a61e06`, 2026-07-05

## Why this matters

`GangsterRanged` enemies drift out of their patrol zones after every shot. Two `ANIMATION_COMPLETE` listeners fire when the shot animation ends: the base class listener resumes patrol (sets state to `PATROL` and applies patrol velocity), then the subclass listener starts the recharge phase (`isRecharging = true`). Because `update()` returns early while `isRecharging`, the patrol-bound checks never run — so the enemy keeps the velocity the base listener applied and slides, unclamped, for the full recharge animation. It can leave its patrol bounds and walk off platforms. Fixing this makes ranged-enemy behavior match the designed shoot → recharge (stationary) → patrol cycle.

## Current state

This is a Phaser 3 + TypeScript game. Enemies are plain classes (not Phaser GameObjects) wrapping a physics sprite.

- `src/entities/Enemy.ts` — base enemy. Its constructor registers an anonymous `ANIMATION_COMPLETE` listener (lines 62–74):

```ts
// Enemy.ts:62-74
this.sprite.on(
  Animations.Events.ANIMATION_COMPLETE,
  (anim: Animations.Animation) => {
    if (anim.key === this.attackAnimKey && this.isAlive) {
      this.state = EnemyState.PATROL;
      this.sprite.play(this.walkAnimKey, true);
      const speed = this.facingRight
        ? ENEMY.PATROL_SPEED
        : -ENEMY.PATROL_SPEED;
      this.sprite.setVelocityX(speed);
    }
  }
);
```

- `src/entities/enemies/GangsterRanged.ts` — subclass. Its constructor registers a SECOND listener (lines 36–54) that on shot-completion sets `isRecharging = true` and plays `'gangster3-recharge-anim'`, and on recharge-completion resumes patrol. Its `update()` short-circuits while recharging (line 76):

```ts
// GangsterRanged.ts:75-76
// Skip normal patrol AI if recharging
if (this.isRecharging) return;
```

Sequence when a shot animation completes (both listeners match `anim.key === this.attackAnimKey` because the subclass constructor set `this.attackAnimKey = 'gangster3-shot-anim'` at line 22): base listener sets PATROL + walk anim + patrol velocity → subclass listener plays recharge anim + sets `isRecharging = true`. Net result: recharge animation playing, patrol velocity applied, patrol-bound logic disabled.

- Repo conventions: 2-space indent, single quotes, semicolons. Subclasses of `Enemy` override `createSprite()` and set `walkAnimKey`/`attackAnimKey` after `super()`.

## Commands you will need

| Purpose   | Command              | Expected on success |
|-----------|----------------------|---------------------|
| Typecheck | `npm run typecheck`  | exit 0              |
| Lint      | `npm run lint`       | exit 0              |
| Tests     | `npm test`           | all pass            |
| Dev server (manual check) | `npm run dev` | Vite serves on port 10001 |

(These scripts exist only after plan 001. If `npm run typecheck` is missing, STOP — 001 hasn't landed.)

## Scope

**In scope** (the only files you should modify):
- `src/entities/Enemy.ts`
- `src/entities/enemies/GangsterRanged.ts`

**Out of scope** (do NOT touch):
- `src/entities/enemies/GangsterMelee.ts` — its texture/initialization-order bug is plan 003; don't fix it here.
- `src/entities/Batman.ts`, `src/scenes/GameLevel.ts`, animation definitions in `src/controls/controls.utils.ts`.
- The recharge duration / attack cooldown values in `src/constants/physics.ts`.

## Git workflow

- Branch: `advisor/002-ranged-recharge-slide`
- One commit; imperative message.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make the base class attack-completion handler an overridable method

In `src/entities/Enemy.ts`, replace the anonymous listener body with a named protected method so subclasses can replace the behavior instead of stacking a second listener:

```ts
// in constructor — replaces the current lines 62-74:
this.sprite.on(
  Animations.Events.ANIMATION_COMPLETE,
  (anim: Animations.Animation) => this.onAnimationComplete(anim)
);
```

```ts
/**
 * Called for every completed (non-looping) animation on this enemy's
 * sprite. Base behavior: when the attack animation finishes, resume
 * patrol. Subclasses override to insert extra phases (e.g. recharge).
 */
protected onAnimationComplete(anim: Animations.Animation): void {
  if (anim.key === this.attackAnimKey && this.isAlive) {
    this.resumePatrol();
  }
}

/** Return to PATROL state with walk animation and patrol velocity. */
protected resumePatrol(): void {
  this.state = EnemyState.PATROL;
  this.sprite.play(this.walkAnimKey, true);
  const speed = this.facingRight ? ENEMY.PATROL_SPEED : -ENEMY.PATROL_SPEED;
  this.sprite.setVelocityX(speed);
}
```

Note the arrow-function wrapper: subclass constructors register no extra listeners after this change, and the virtual dispatch through `this.onAnimationComplete` means the subclass override runs even though the listener was attached in the base constructor.

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Replace GangsterRanged's second listener with an override

In `src/entities/enemies/GangsterRanged.ts`:

- Delete the entire `this.sprite.on(Animations.Events.ANIMATION_COMPLETE, ...)` block in the constructor (current lines 35–54, including the `// Override attack-complete to include recharge` comment).
- Add the override:

```ts
protected override onAnimationComplete(anim: Animations.Animation): void {
  if (!this.isAlive) return;

  if (anim.key === this.attackAnimKey) {
    // Stay put and recharge before returning to patrol
    this.isRecharging = true;
    this.sprite.setVelocityX(0);
    this.sprite.play('gangster3-recharge-anim');
    return;
  }

  if (anim.key === 'gangster3-recharge-anim') {
    this.isRecharging = false;
    this.resumePatrol();
  }
}
```

Keep the existing `Animations` import (it is already imported at line 1).

**Verify**: `npm run typecheck && npm run lint` → both exit 0.

### Step 3: Manual behavior check

Run `npm run dev`, open the game, pick Episode 2 or any episode with ranged gangsters (Gangsters_3 sprites — episodes 3+ include `gangster-ranged` entries; check `grep -l gangster-ranged src/data/levels/*.json`). Stand in shot range and observe a full shoot → recharge cycle.

**Verify** (observed, since there is no automated harness for scene behavior):
- During the recharge animation the gangster's x-position does not change.
- After recharge it resumes walking and still turns around at its patrol bounds.

## Test plan

There is no unit-test seam for Phaser scene entities in this repo yet, and building one is out of scope here (deferred — see Maintenance notes). Verification is the typecheck/lint gates plus the Step 3 manual check. `npm test` (level-data tests from plan 001) must still pass.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` exits 0
- [ ] `npm test` exits 0
- [ ] `grep -c "ANIMATION_COMPLETE" src/entities/enemies/GangsterRanged.ts` → 0 (no direct listener registration left in the subclass)
- [ ] `grep -c "onAnimationComplete" src/entities/Enemy.ts` → ≥ 2 (registration + method)
- [ ] Manual check in Step 3 observed and reported
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `Enemy.ts` no longer contains the anonymous listener shown in "Current state" (plan 003 may have restructured it first — reconcile with the index before editing).
- The manual check shows the gangster stuck permanently (never resuming patrol) — that means the recharge animation's `ANIMATION_COMPLETE` isn't firing; report rather than adding timers.
- The fix appears to require changing `GangsterMelee.ts` or `GameLevel.ts`.

## Maintenance notes

- Plan 003 restructures how subclasses configure textures/animation keys; it builds on `onAnimationComplete`/`resumePatrol` existing. Land this plan first.
- Reviewer should scrutinize: no behavior change for `GangsterMelee`/base `Enemy` (their cycle is attack → resume patrol, identical to before).
- Deferred: an automated entity-behavior test harness (headless Phaser or extracted state-machine logic). Worth doing if enemy AI keeps growing.
