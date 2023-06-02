// const { Scene } = Phaser;
import { Scene } from 'phaser';

const originalColor = 'rgba(0, 0, 0)';
const alternateColor = 'rgb(255, 204, 0)';
let isOriginalFontColor = true;
// let currentColor = originalColor;
// let button;
let camera;
let cursors;
// let playBtn;
let playBtnText;

export default class GameMenu extends Scene {
  constructor() {
    super({ key: 'GameMenu' });
  }

  preload() {
    this.load.image('gameMenu', '../assets/imgs/menuimage.jpg');
    this.load.image('playBtnBg', '../assets/imgs/play_button_bg.png');

    this.load.audio('gameMenuMusic', [
      '../assets/audio/introMusic.mp3',
      '../assets/audio/introMusic.ogg',
    ]);
  }

  create() {
    this.add.sprite(400, 591, 'gameMenu');

    const music = this.sound.add('gameMenuMusic');
    const playBtn = this.add.image(400, 850, 'playBtnBg').setInteractive();

    camera = this.cameras.main;
    cursors = this.input.keyboard.createCursorKeys();
    playBtnText = this.add
      .text(330, 835, 'P l a y', {
        color: originalColor,
        fontSize: 30,
        fontStyle: 'bold',
      })
      .setInteractive();

    // music settings
    music.play();
    music.volume = 1;

    // camera settings
    camera.useBounds = true;
    camera._bounds.height = 1100;

    // playBtn settings
    playBtn.on('pointerdown', (e) => {
      // TODO: implement MainGameScene
      //   this.scene.start("MainGameScene");
      music.stop();
    });

    // playBtnText settings
    playBtnText.on('pointerdown', (e) => {
      // TODO: implement MainGameScene
      //   this.scene.start("MainGameScene");
      music.stop();
    });

    setInterval(() => {
      if (isOriginalFontColor) playBtnText.setColor(alternateColor);
      else playBtnText.setColor(originalColor);

      isOriginalFontColor = !isOriginalFontColor;
    }, 600);
  }

  update() {
    camera.scrollY += 3;
  }
}
