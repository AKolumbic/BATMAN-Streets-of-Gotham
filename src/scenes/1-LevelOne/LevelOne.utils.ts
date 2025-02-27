export function getSceneAssets(load: Phaser.Loader.LoaderPlugin) {
  load.image('starry-night', './assets/imgs/starry-night.png');
  load.image('background', './assets/imgs/background.png');
  load.image('foreground', './assets/imgs/gc-buildings.png');
  load.image('void', './assets/imgs/Solid_black.png');
  load.image('ground', './assets/imgs/blk-ground.png');
  load.image('platform', './assets/imgs/sml-platform.png');
  load.image('batarang', './assets/imgs/batarang.png');
  load.spritesheet('stand', './assets/imgs/stand.png', {
    frameWidth: 41.8,
    frameHeight: 55,
  });
  load.spritesheet('run-left', './assets/imgs/run-left.png', {
    frameWidth: 57,
    frameHeight: 50,
  });
  load.spritesheet('run-right', './assets/imgs/run-right.png', {
    frameWidth: 57,
    frameHeight: 50,
  });
  load.spritesheet('jump', './assets/imgs/jump.png', {
    frameWidth: 57,
    frameHeight: 50,
  });
  load.spritesheet('jump-left', './assets/imgs/jump-left.png', {
    frameWidth: 57,
    frameHeight: 50,
  });
  load.spritesheet('crouch', './assets/imgs/crouch.png', {
    frameWidth: 57,
    frameHeight: 50,
  });
  load.spritesheet('punch', './assets/imgs/punch.png', {
    frameWidth: 52,
    frameHeight: 50,
  });
  load.spritesheet('punch-left', './assets/imgs/punch-left.png', {
    frameWidth: 52,
    frameHeight: 50,
  });
  load.audio('gameMusic', [
    './assets/audio/12 Introduce a Little Anarchy.mp3',
    './assets/aduio/12 Introduce a Little Anarchy.ogg',
  ]);
}

export function createPlatforms(
  platforms: Phaser.Physics.Arcade.StaticGroup,
  physics: Phaser.Physics.Arcade.ArcadePhysics
) {
  platforms = physics.add.staticGroup();

  //FLOOR
  platforms.create(300, 600, 'ground').setScale(5).refreshBody();

  //FIRST PLATFORMS

  platforms.create(290, 450, 'platform').setScale(0.65).refreshBody();
  platforms.create(390, 450, 'platform').setScale(0.65).refreshBody();
  platforms.create(440, 450, 'platform').setScale(0.65).refreshBody();

  //SECOND PLATFORMS
  platforms.create(550, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(600, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(650, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(700, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(750, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(800, 330, 'platform').setScale(0.25).refreshBody();
  platforms.create(850, 330, 'platform').setScale(0.25).refreshBody();

  platforms.create(950, 450, 'platform').setScale(0.65).refreshBody();
  platforms.create(1100, 450, 'platform').setScale(0.65).refreshBody();

  platforms.create(1080, 200, 'platform').setScale(0.65).refreshBody();

  //THIRD PLATFORMS
  platforms.create(1275, 350, 'platform').setScale(0.25).refreshBody();
  platforms.create(1325, 350, 'platform').setScale(0.25).refreshBody();
  platforms.create(1375, 350, 'platform').setScale(0.25).refreshBody();

  platforms.create(1475, 200, 'platform').setScale(0.25).refreshBody();
  platforms.create(1525, 200, 'platform').setScale(0.25).refreshBody();
  platforms.create(1575, 200, 'platform').setScale(0.25).refreshBody();
  platforms.create(1625, 200, 'platform').setScale(0.25).refreshBody();

  //FOURTH PLATFORMS
  platforms.create(1450, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1500, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1550, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1600, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1650, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1700, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1750, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1800, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1850, 450, 'platform').setScale(0.25).refreshBody();
  platforms.create(1900, 450, 'platform').setScale(0.25).refreshBody();

  platforms.create(2110, 450, 'platform').setScale(0.25).refreshBody();

  platforms.create(2110, 330, 'platform').setScale(0.5).refreshBody();

  //FINAL PLATFORMS
  platforms.create(2250, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2300, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2350, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2400, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2450, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2500, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2550, 175, 'platform').setScale(0.25).refreshBody();
  platforms.create(2600, 175, 'platform').setScale(0.25).refreshBody();

  return platforms;
}
