# BATMAN: STREETS OF GOTHAM

Begin the experience as the Dark Knight of Gotham on this Batman platformer. This game was quick-started using a template that combines Phaser 3.60 with [TypeScript 5](https://www.typescriptlang.org/) and uses [Rollup](https://rollupjs.org) for bundling and heavily reuses code from [this hackathon project](https://github.com/udykas/batman-hackathon) as a starting point.

### A special thank you to Alex Dykas, Thuy Pham, Brandon Benefield, and Brandon Hopper for their work in Lambda School's 2018 Summer Hackathon. [Instagram Story from the Hackathon](https://www.instagram.com/p/CiympKMD-K4/)

## Controls:

```
Move Left- Left arrow

Move Right - Right arrow

Jump - Up arrow

Punch - Spacebar
```

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command         | Description                                                                       |
| --------------- | --------------------------------------------------------------------------------- |
| `npm install`   | Install project dependencies                                                      |
| `npm run watch` | Build project and open web server running project, watching for changes           |
| `npm run dev`   | Builds project and open web server, but do not watch for changes                  |
| `npm run build` | Builds code bundle with production settings (minification, no source maps, etc..) |

## Versions Used

- Phaser 3.60
- TypeScript 5.0.3
- Rollup 3.20.2
- Rollup Plugins:
  - @rollup/plugin-commonjs 24.0.1
  - @rollup/plugin-node-resolve 15.0.2
  - @rollup/plugin-replace 5.0.2
  - @rollup/plugin-terser 0.4.0
  - @rollup/plugin-typescript 11.1.0
  - rollup-plugin-serve 2.0.2
