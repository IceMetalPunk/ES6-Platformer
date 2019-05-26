import {applyPlayerControl} from './input.js';

const getTileBbox = function(level, tile) {
  let w = 1, h = 1;
  if (tile.position.length === 4) {
    w = tile.position[2] - tile.position[0] + 1;
    h = tile.position[3] - tile.position[1] + 1;
  }
  return {
    left: tile.position[0] * level.tileSize[0],
    top: tile.position[1] * level.tileSize[1],
    right: (w + tile.position[0]) * level.tileSize[0],
    bottom: (h + tile.position[1]) * level.tileSize[1]
  };
};

const areTileBboxCollisions = function(level, sprites, sprite) {
  const spriteBbox = sprites[sprite.sprite].getBbox(sprite);
  let found;
  const ret = level.tiles.some(tile => {
    const tileBbox = getTileBbox(level, tile);
    found = tileBbox;
    return tileBbox.left <= spriteBbox.right && tileBbox.right >= spriteBbox.left &&
           tileBbox.top <= spriteBbox.bottom && tileBbox.bottom >= spriteBbox.top;
  });
  return ret;
}

const applyTilePhysics = function(level) {
  level.tiles.forEach(tile => {
    let maxY = tile.position[1];
    if (tile.position.length === 4) {
      maxY = Math.max(tile.position[0], tile.position[3]);
    }

    if (tile.physics.gravity && (!tile.physics.stopAtBorder || maxY < level.size[1])) {
      tile.position[1] += tile.physics.gravity;
      if (tile.position.length === 4) {
        tile.position[3] += tile.physics.gravity;
      }
    }
    else {
      tile.position[1] = Math.round(tile.position[1]);
      if (tile.position.length === 4) {
        tile.position[3] = Math.round(tile.position[3]);
      }
    }
  });
};

const applySpritePhysics = function(level, sprites) {
  level.sprites.forEach(sprite => {

    let applyGravity = true;
    for (let x = 0; x < Math.abs(sprite.physics.hspeed); ++x) {
      sprite.position[0] += Math.sign(sprite.physics.hspeed);
      if (areTileBboxCollisions(level, sprites, sprite)) {
        sprite.position[0] -= Math.sign(sprite.physics.hspeed);
        sprite.physics.hspeed = 0;
        break;
      }
    }

    for (let y = 0; y < Math.abs(sprite.physics.vspeed); ++y) {
      sprite.position[1] += Math.sign(sprite.physics.vspeed);
      if (areTileBboxCollisions(level, sprites, sprite)) {
        applyGravity = false;
        sprite.position[1] -= Math.sign(sprite.physics.vspeed);
        if (sprite.physics.vspeed > 0) {
          sprite.physics.onGround = true;
        }
        sprite.physics.vspeed = 0;
        break;
      }
      else {
        sprite.physics.onGround = false;
      }
    }

    if (applyGravity && (!sprite.physics.stopAtBorder || sprite.position[1] < level.size[1] * level.tileSize[1])) {
      sprite.physics.vspeed += sprite.physics.gravity;
      sprite.physics.vspeed = Math.min(sprite.physics.vspeed, sprite.physics.maxvspeed);
    }
    else {
      sprite.physics.onGround = true;
      sprite.physics.vspeed = 0;
      sprite.position[1] = Math.max(0, Math.min(Math.floor(sprite.position[1]), Math.round(level.size[1] * level.tileSize[1])));
    }

    if (sprite.physics.stopAtBorder && sprite.position[0] <= 0 && sprite.physics.hspeed < 0) {
      sprite.position[0] = 0;
      sprite.physics.hspeed = 0;
    }
  });
};

export function applyPhysics(level, sprites) {
  applyTilePhysics(level);
  applyPlayerControl(level);
  applySpritePhysics(level, sprites);
}