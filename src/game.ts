import { AUTO, Types, Game, Scale } from 'phaser';
import scenes from './scenes';

const canvas = document.createElement('canvas');
canvas.toDataURL('https://images.alphacoders.com/115/1156096.png');

const config = {
  type: AUTO,
  title: 'Batman: Streets of Gotham',
  backgroundColor: '#192424',
  autoFocus: true,
  // canvas,
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
  scale: {
    autoCenter: Scale.Center.CENTER_BOTH,
  },
} as Types.Core.GameConfig;

const game = new Game(config);
