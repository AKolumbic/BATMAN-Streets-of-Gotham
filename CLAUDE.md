# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Batman: Streets of Gotham is a browser-based 2D platformer built with **Phaser 3** and **TypeScript**, bundled with **Rollup**. The player controls Batman through a side-scrolling level with platforms, jumping, and punch mechanics.

## Build & Development Commands

```bash
npm install          # Install dependencies (required first)
npm run watch        # Dev server with hot reload on port 10001
npm run dev          # One-time dev build + serve on port 10001
npm run build        # Production build with Terser minification
```

The dev server auto-opens the browser and serves from `dist/` with CORS enabled.

## Architecture

**Entry point:** `src/game.ts` creates the Phaser.Game instance (800x600, Arcade physics, gravity 300).

**Scene flow:** `GameMenu` → `LevelOne`. Scenes are registered in `src/scenes/index.ts`.

- `src/scenes/GameMenu.ts` — Main menu with animated start button and intro music. Transitions to LevelOne on click.
- `src/scenes/1-LevelOne/LevelOne.ts` — Main gameplay scene. Creates Batman sprite with physics, camera follow, and a wide scrolling world (2822x384). Background has three parallax layers.
- `src/scenes/1-LevelOne/LevelOne.utils.ts` — Asset preloading (spritesheets, images, audio) and platform layout creation using static physics groups. Platforms are hardcoded positionally.
- `src/controls/controls.utils.ts` — `bindControls()` defines sprite animations (run, stand, jump, punch). `controlPlayerCharacter()` handles keyboard input (arrow keys + WASD) for movement, jumping, and (partially implemented) punching.
- `src/scenes/Demo.ts` — Unused shader demo scene, not in the game flow.

**WASD support:** `dist/index.html` contains an inline script that remaps WASD keydown/keyup events to arrow key events, separate from the in-game controls handler.

## Build Configuration

- **Rollup** bundles `src/game.ts` → `dist/game.js` as IIFE format
- TypeScript targets ES5 with Phaser type definitions
- Feature flags in rollup configs toggle Phaser subsystems (WebGL, Canvas, Sound, etc.)
- Dev builds include sourcemaps; production builds are minified

## Code Style

- ESLint + Prettier enforced: 2-space indent, single quotes, semicolons, Unix line endings (LF)
- VSCode auto-formats on save (`.vscode/settings.json`)

## Known Issues

- Audio asset path typo: `'./assets/aduio/'` should be `'./assets/audio/'` in `LevelOne.utils.ts`
- Punch mechanics and score/batarang collectible systems are partially implemented (commented out)
- Bundled `dist/game.js` is ~7.8 MB (not minified in dev)
