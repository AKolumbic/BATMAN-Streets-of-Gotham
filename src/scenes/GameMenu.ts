import { Scene, Cameras, Types } from 'phaser';

const originalColor = 'rgba(0, 0, 0)';
const alternateColor = 'rgb(255, 204, 0)';
let isOriginalFontColor = true;
let camera: Cameras.Scene2D.Camera;
let cursor: Types.Input.Keyboard.CursorKeys;

export default class GameMenu extends Scene {
  constructor() {
    // Register Scene Name to access via this.scene.start()
    super({ key: 'GameMenu' });
  }

  /**
   * Preload the Scene's Assets
   */
  preload() {
    this.load.image('gameMenu', '/assets/imgs/menuimage.jpg');
    this.load.image('playBtnBg', '/assets/imgs/play_button_bg.png');
    this.load.audio('gameMenuMusic', [
      '/assets/audio/introMusic.mp3',
      '/assets/audio/introMusic.ogg',
    ]);
  }

  create() {
    // cursor & camera settings
    cursor = this.input.keyboard.createCursorKeys();
    camera = this.cameras.main;
    camera.useBounds = true;
    /**
     * Despite not existing on Cameras.Scene2D.Camera, _bounds
     * is needed for the SICK ASS PANNING ANIMATION to happen
     */
    // @ts-ignore
    camera._bounds.height = 1100;

    // Intro Music
    const music = this.sound.add('gameMenuMusic');
    music.play({ volume: 1, loop: true });

    // Background Image
    this.add.sprite(400, 591, 'gameMenu');

    // Game Title
    this.add.text(195, 725, 'BATMAN: STREETS OF GOTHAM', {
      color: alternateColor,
      fontSize: 30,
      fontStyle: 'bold',
      backgroundColor: 'black',
    });

    // Start Button
    const startButton = this.add.image(400, 850, 'playBtnBg').setInteractive();
    const startButtonText = this.add
      .text(330, 835, 'S T A R T', {
        color: originalColor,
        fontSize: 30,
        fontStyle: 'bold',
      })
      .setInteractive();

    // startButton settings
    startButton.on('pointerdown', (e) => {
      // TODO: implement MainGameScene
      //   this.scene.start("MainGameScene");
      // TODO: Remove Demo
      this.scene.start('demo');
      music.stop();
    });

    // startButtonText settings
    startButtonText.on('pointerdown', (e) => {
      // TODO: implement MainGameScene
      //   this.scene.start("MainGameScene");
      // TODO: Remove Demo
      this.scene.start('demo');
      music.stop();
    });

    // Start Button Text Animation
    setInterval(() => {
      if (isOriginalFontColor) startButtonText.setColor(alternateColor);
      else startButtonText.setColor(originalColor);

      isOriginalFontColor = !isOriginalFontColor;
    }, 600);
  }

  update() {
    // THE AWESOME PAN DOWN
    camera.scrollY += 3;
  }
}
