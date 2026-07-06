import { Scene } from 'phaser';
import { Images, Audio } from '../constants/assets';

const ORIGINAL_COLOR = 'rgba(0, 0, 0)';
const ALTERNATE_COLOR = 'rgb(255, 204, 0)';

export default class GameMenu extends Scene {
  private isOriginalFontColor = true;
  private camera!: Phaser.Cameras.Scene2D.Camera;

  constructor() {
    super({ key: 'GameMenu' });
  }

  preload(): void {
    this.load.image(Images.MENU_IMAGE.key, Images.MENU_IMAGE.path);
    this.load.image(Images.PLAY_BTN_BG.key, Images.PLAY_BTN_BG.path);
    this.load.audio(Audio.INTRO_MUSIC.key, [...Audio.INTRO_MUSIC.path]);
  }

  create(): void {
    this.isOriginalFontColor = true;

    // Camera settings
    this.camera = this.cameras.main;
    this.camera.useBounds = true;
    this.camera.setBounds(0, 0, 800, 1100);

    // Intro Music
    const music = this.sound.add(Audio.INTRO_MUSIC.key);
    music.play({ volume: 0.5, loop: true });

    // Background Image
    this.add.sprite(400, 591, Images.MENU_IMAGE.key);

    // Game Title
    this.add.text(195, 725, 'BATMAN: STREETS OF GOTHAM', {
      color: ALTERNATE_COLOR,
      fontSize: '30px',
      fontStyle: 'bold',
      backgroundColor: 'black',
    });

    // Start Button
    const startButton = this.add
      .image(400, 850, Images.PLAY_BTN_BG.key)
      .setInteractive();
    const startButtonText = this.add
      .text(330, 835, 'S T A R T', {
        color: ORIGINAL_COLOR,
        fontSize: '30px',
        fontStyle: 'bold',
      })
      .setInteractive();

    const startGame = () => {
      this.scene.start('LevelSelect');
      music.stop();
    };

    startButton.on('pointerdown', startGame);
    startButtonText.on('pointerdown', startGame);

    // Start Button Text Animation
    this.time.addEvent({
      delay: 600,
      loop: true,
      callback: () => {
        if (this.isOriginalFontColor) startButtonText.setColor(ALTERNATE_COLOR);
        else startButtonText.setColor(ORIGINAL_COLOR);
        this.isOriginalFontColor = !this.isOriginalFontColor;
      },
    });
  }

  update(): void {
    // Pan-down animation
    this.camera.scrollY += 3;
  }
}
