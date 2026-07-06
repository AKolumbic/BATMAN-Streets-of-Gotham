# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Batman: Streets of Gotham is a browser-based 2D side-scrolling beat-em-up / platformer built with **Phaser 3** and **TypeScript**, bundled with **Vite**. Batman patrols Gotham's neighborhoods, fighting gangs and rescuing civilians.

## Build & Development Commands

```bash
npm install          # Install dependencies (required first)
npm run dev          # Vite dev server with HMR on port 10001
npm run build        # Production build (output to dist/)
npm run preview      # Preview the production build
```

## Architecture

**Entry point:** `src/game.ts` creates the Phaser.Game instance (800x600, Arcade physics, gravity 300).

**Scene flow:** `Boot` -> `GameMenu` -> `LevelSelect` -> `LevelOne` -> `LevelComplete` / `GameOver`

### Directory Structure

```
src/
  constants/
    assets.ts          # Centralized asset keys + paths (all asset references)
    physics.ts         # Gravity, speeds, hitbox sizes, HP values
  controls/
    controls.utils.ts  # Animation registration + input key binding
  data/
    levels/
      level-01.json    # Data-driven level definition (platforms, spawns, backgrounds)
  entities/
    Batman.ts          # Player class with state machine, HP, punch hitbox
    Enemy.ts           # Base enemy class (patrol, attack, damage, death)
    NPC.ts             # Rescuable civilian NPC
    enemies/
      GangsterMelee.ts   # Close-range gangster (Gangsters_1/2 sprites)
      GangsterRanged.ts  # Ranged gangster with bullets (Gangsters_3 sprites)
  scenes/
    Boot.ts            # Loading bar, transitions to GameMenu
    GameMenu.ts        # Title screen with pan-down animation
    LevelSelect.ts     # Neighborhood/level picker (8 areas)
    1-LevelOne/
      LevelOne.ts      # Main gameplay scene (data-driven from level-01.json)
      LevelOne.utils.ts # Asset preloading for level one
    LevelComplete.ts   # Victory screen with score/rescue stats
    GameOver.ts        # Defeat screen with retry/level select
    index.ts           # Scene registry
  systems/
    LevelLoader.ts       # Parse level JSON, create platforms + backgrounds
    TilemapManager.ts    # Tiled JSON tilemap support (city tiles)
    ParallaxBackground.ts # Multi-layer parallax scrolling
  ui/
    HUD.ts             # Health bar, score, rescue counter
    Button.ts          # Reusable button component
    DialogueBox.ts     # Text dialogue box component
  game.ts              # Phaser.Game entry point
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
- Level layouts are data-driven via JSON files in `src/data/levels/`
- Enemy subclasses extend the base `Enemy` class and override `createSprite()` and animation keys

## Code Style

- ESLint + Prettier: 2-space indent, single quotes, semicolons, Unix line endings (LF)
- TypeScript strict mode, ESNext target, bundler module resolution
- Functional components for UI, class-based for entities and scenes
