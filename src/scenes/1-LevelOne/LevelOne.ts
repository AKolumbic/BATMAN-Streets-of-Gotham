import { Scene, Types, Math } from 'phaser';
import {
  bindControls,
  controlPlayerCharacter,
} from '../../controls/controls.utils';
import { getSceneAssets, createPlatforms } from './LevelOne.utils';

let Batman: Types.Physics.Arcade.SpriteWithDynamicBody;
let cursor: Types.Input.Keyboard.CursorKeys;
// let batarang: Phaser.Physics.Arcade.Group;
let platforms: Phaser.Physics.Arcade.StaticGroup;
let score = 0;
// let scoreText;

// function collectBats(batarang) {
//   batarang.disableBody(true, true);

//   score += 10;
//   scoreText.setText('Score: ' + score);
// }

export default class LevelOne extends Scene {
  constructor() {
    super({ key: 'LevelOne' });
  }

  preload() {
    getSceneAssets(this.load);
  }

  create() {
    // gameMusic settings
    const gameMusic = this.sound.add('gameMusic');
    gameMusic.play({ volume: 0.35, loop: true });

    this.add.image(1411, 185, 'starry-night');
    this.add.image(1411, 310, 'background');
    this.add.image(1411, 390, 'foreground');

    cursor = this.input.keyboard.createCursorKeys();

    // BATMAN
    Batman = this.physics.add.sprite(100, 450, 'stand').setScale(1.15);
    Batman.setCollideWorldBounds(true);
    Batman.body.setGravityY(200);
    Batman.play('stand');
    bindControls(this.anims);

    //PLATFORMS
    platforms = createPlatforms(platforms, this.physics);

    // //COLLECTABLES
    // batarang = this.physics.add.group({
    //   key: 'batarang',
    //   repeat: 18,
    //   setXY: { x: 50, y: 0, stepX: 150 },
    // });

    // batarang.children.iterate((child) =>
    //   // @ts-ignore
    //   child.setBounceY(Math.FloatBetween(0.2, 0.4))
    // );

    //PHYSICS
    this.physics.add.collider(Batman, platforms);
    // this.physics.add.collider(batarang, platforms);
    this.physics.world.bounds.width = 2822;
    // this.physics.add.overlap(Batman, batarang, collectBats, null, this);

    //CAMERA
    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, 2822, 384);
    // make the camera follow the player
    this.cameras.main.startFollow(Batman);
  }

  update() {
    controlPlayerCharacter(cursor, Batman);
  }
}
