const KeyMap = new Map();

document.addEventListener('keydown', ev => {
  if (!KeyMap.has(ev.code)) {
    KeyMap.set(ev.code, 0);
  }
});
document.addEventListener('keyup', ev => {
  KeyMap.delete(ev.code);
});

export function updateInput() {
  KeyMap.forEach((value, key) => {
    KeyMap.set(key, value + 1);
  });
};

export function applyPlayerControl(level) {
  level.sprites.forEach(sprite => {
    if (sprite.physics.type === 'player') {
      sprite.physics.hspeed = sprite.physics.maxhspeed * Number(KeyMap.has('ArrowRight') - KeyMap.has('ArrowLeft'));

      if (KeyMap.get('ArrowUp') === 1) {
        sprite.physics.vspeed = -sprite.physics.jumpspeed;
      }
    }
  });
}