import { AUTO, Game } from 'phaser';
import { GameMenu } from './scenes';

const config = {
  type: AUTO,
  backgroundColor: '#125555',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: GameMenu,
};

const game = new Game(config);
