export function bindControls(
  animationManager: Phaser.Animations.AnimationManager
) {
  animationManager.create({
    key: 'left',
    frames: animationManager.generateFrameNumbers('run-left', {
      start: 0,
      end: 18,
    }),
    frameRate: 10,
    repeat: -1,
  });

  animationManager.create({
    key: 'stand',
    frames: animationManager.generateFrameNumbers('stand', {
      start: 0,
      end: 16,
    }),
    frameRate: 5,
  });

  animationManager.create({
    key: 'right',
    frames: animationManager.generateFrameNumbers('run-right', {
      start: 0,
      end: 18,
    }),
    frameRate: 10,
    repeat: -1,
  });

  animationManager.create({
    key: 'up',
    frames: animationManager.generateFrameNumbers('jump', { start: 0, end: 2 }),
    frameRate: 1,
    repeat: -1,
  });

  animationManager.create({
    key: 'up-left',
    frames: animationManager.generateFrameNumbers('jump-left', {
      start: 0,
      end: 2,
    }),
    frameRate: 1,
    repeat: -1,
  });

  animationManager.create({
    key: 'punch',
    frames: animationManager.generateFrameNumbers('punch', {
      start: 0,
      end: 10,
    }),
    frameRate: 10,
    repeat: -1,
  });

  animationManager.create({
    key: 'punch-left',
    frames: animationManager.generateFrameNumbers('punch-left', {
      start: 0,
      end: 10,
    }),
    frameRate: 10,
    repeat: -1,
  });
}

export function controlPlayerCharacter(
  cursor: Phaser.Types.Input.Keyboard.CursorKeys,
  character: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
) {
  let count = 0; //count to activate action when key is pressed

  if (cursor.left.isDown) {
    character.setVelocityX(-160);
    character.play('left');
  } else if (cursor.right.isDown) {
    character.setVelocityX(160);
    character.play('right');
  }

  // else if (cursor.space.duration >= 80 && count < 60) {
  //   if (cursor.left.isDown) {
  //     character.play('punch-left');
  //   }
  //   character.play('punch');
  //   count += 1;
  // } else {
  //   character.setVelocityX(0);

  //   // cursor.space.duration = 0; // reset space.duration so action 'punch' will stop
  //   // count = 0; // reset count so action can be reactivate

  //   character.play('stand');
  // }

  if (cursor.up.isDown) {
    character.play('up');

    if (character.body.touching.down) {
      character.setVelocityY(-400);
    }
  }

  if (!character.body.touching.down) {
    character.play('up');

    if (cursor.left.isDown) {
      character.play('up-left');
    }
  }

  if (cursor.up.isDown && cursor.left.isDown) {
    character.play('up-left');
  }
}
