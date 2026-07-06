import { AUTO, Types, Game } from 'phaser';
import scenes from './scenes';

const config = {
  type: AUTO,
  parent: 'game-container',
  title: 'Batman: Streets of Gotham',
  backgroundColor: '#192424',
  autoFocus: true,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: scenes,
} as Types.Core.GameConfig;

new Game(config);
