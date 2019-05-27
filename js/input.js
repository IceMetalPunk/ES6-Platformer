const KeySet = new Set();

document.addEventListener('keydown', ev => {
  if (!KeySet.has(ev.code)) {
    KeySet.add(ev.code);
  }
});
document.addEventListener('keyup', ev => {
  KeySet.delete(ev.code);
});

export function applyPlayerControl(level) {
  level.sprites.forEach(sprite => {
    if (sprite.physics.type === 'player') {
      sprite.physics.hspeed = sprite.physics.maxhspeed * Number(KeySet.has('ArrowRight') - KeySet.has('ArrowLeft'));

      if (KeySet.has('ArrowUp') && sprite.physics.onGround) {
        sprite.physics.vspeed = -sprite.physics.jumpspeed;
      }
    }
  });
}