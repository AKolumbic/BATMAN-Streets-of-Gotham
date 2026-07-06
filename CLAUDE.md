# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Batman: Streets of Gotham is a browser-based 2D side-scrolling beat-em-up / platformer built with **Phaser 3** and **TypeScript**, bundled with **Vite**. Batman patrols Gotham's neighborhoods, fighting gangs and rescuing civilians.

## Build & Development Commands

```bash
npm install          # Install dependencies (required first)
npm run dev          # Vite dev server with HMR on port 10001
npm run build        # Production build (output to dist/)
npm run preview      # Preview the production build
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run lint         # ESLint
npm run test         # Vitest unit tests
```

## Architecture

**Entry point:** `src/game.ts` creates the Phaser.Game instance (800x600, Arcade physics, gravity 300).

**Scene flow:** `Boot` -> `GameMenu` -> `LevelSelect` -> `EpisodeIntro` -> `GameLevel` -> `LevelComplete` | `GameOver`

### Directory Structure

```
src/
  constants/
    assets.ts              # Centralized asset keys + paths (all asset references)
    physics.ts             # Gravity, speeds, hitbox sizes, HP values
  controls/
    controls.utils.ts      # Animation registration + input key binding
  data/
    levels/
      index.ts             # Level registry (LEVELS object + LEVEL_ORDER array)
      level-01.json        # Data-driven level definitions (×8 episodes)
      level-02.json
      level-03.json
      level-04.json
      level-05.json
      level-06.json
      level-07.json
      level-08.json
      levels.test.ts       # Level data validation tests
  entities/
    Batman.ts              # Player class with state machine, HP, punch hitbox
    Enemy.ts               # Base enemy class (patrol, attack, damage, death)
    NPC.ts                 # Rescuable civilian NPC
    enemies/
      GangsterMelee.ts     # Close-range gangster (Gangsters_1/2 sprites)
      GangsterRanged.ts    # Ranged gangster with bullets (Gangsters_3 sprites)
  scenes/
    Boot.ts                # Loading bar, transitions to GameMenu
    GameMenu.ts            # Title screen with pan-down animation
    LevelSelect.ts         # Neighborhood/level picker (8 areas)
    EpisodeIntro.ts        # Cinematic intro with typewriter narration
    GameLevel.ts           # Generic gameplay scene (loads any level by ID)
    LevelComplete.ts       # Victory screen with score/rescue stats
    GameOver.ts            # Defeat screen with retry/level select
    index.ts               # Scene registry
  systems/
    AssetLoader.ts         # Centralized gameplay asset preloading
    LevelLoader.ts         # Parse level JSON, create platforms + backgrounds + floor
    TilemapManager.ts      # Tiled JSON tilemap support (city tiles)
    ParallaxBackground.ts  # Multi-layer parallax scrolling
  ui/
    HUD.ts                 # Health bar, score, rescue counter
    Button.ts              # Reusable button component
    DialogueBox.ts         # Text dialogue box component
  game.ts                  # Phaser.Game entry point
```

### Asset Organization

Assets live in `public/assets/` (copied to `dist/assets/` by Vite at build time).

- `public/assets/imgs/` — All images and sprite sheets
  - Root PNGs: Batman sprites, backgrounds, platforms (legacy)
  - `gangster-pixel-character-sprite-sheets-pack/` — 3 gangster enemy types (128x128 frames)
  - `Free-Homeless-Character-Sprite-Sheets-Pixel-Art/` — 3 homeless NPC types (128x128 frames)
  - `free-scrolling-city-backgrounds-pixel-art/` — 8 city themes, day/night, 5 parallax layers each
  - `GandalfHardcore City Tiles/` — 32x32 tile sets for tilemap-based levels
  - `Game UI collection FREE version/` — Bars, buttons, dialogue boxes, icons
- `public/assets/audio/` — Music files (MP3 + OGG)

### Key Conventions

- All asset paths are defined in `src/constants/assets.ts` — never hardcode paths elsewhere
- Physics constants are in `src/constants/physics.ts`
- Level layouts are data-driven via JSON files in `src/data/levels/`; register new levels in `index.ts`
- `LevelData` includes an optional `floor` field (`{ texture, y, scale }`); `createFloor()` tiles it across `worldWidth`
- `GameLevel` accepts `{ levelId: string }` in scene init data and loads the matching entry from `LEVELS`
- Enemy subclasses extend `Enemy` and pass `EnemySpriteOptions` to `super(config, options)` (texture, anim keys, scale, body size/offset)

## Code Style

- ESLint + Prettier: 2-space indent, single quotes, semicolons, Unix line endings (LF)
- TypeScript strict mode, ESNext target, bundler module resolution
- Functional components for UI, class-based for entities and scenes
