import { AUTO, Types, Game } from 'phaser';
import { WORLD } from './constants/physics';
import scenes from './scenes';

const config = {
  type: AUTO,
  parent: 'game-container',
  title: 'Batman: Streets of Gotham',
  backgroundColor: '#192424',
  autoFocus: true,
  width: WORLD.GAME_WIDTH,
  height: WORLD.GAME_HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: WORLD.GRAVITY_Y },
      debug: false,
    },
  },
  scene: scenes,
} as Types.Core.GameConfig;

new Game(config);
