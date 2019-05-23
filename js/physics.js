import {applyPlayerControl} from './input.js';

const applyTilePhysics = function(level) {
  level.tiles.forEach(tile => {
    const maxY = tile.position[1];
    if (tile.position.length === 4) {
      maxY = Math.max(tile.position[0], tile.position[2]);
    }

    if (!tile.physics.stopAtBorder || maxY < level.size[1]) {
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

const tileCollision = function(level, sprite, sprites) {
  const bbox = sprites[sprite.sprite].getBbox(sprite);
  return level.tiles.some(tile => {
    if (!tile.physics || !tile.physics.collisions || !tile.physics.collisions.includes(sprite.physics.type)) {
      return false;
    }
    const tileBox = {
      left: tile.position[0] * level.tileSize[0],
      top: tile.position[1] * level.tileSize[1],
      right: tile.position[0] * level.tileSize[0] + level.tileSize[0],
      bottom: tile.position[1] * level.tileSize[1] + level.tileSize[1]
    };
    console.log(bbox, ' vs ', tileBox);
    return bbox.left <= tileBox.right && bbox.right >= tileBox.left && bbox.top <= tileBox.bottom &&
           bbox.bottom >= tileBox.top;
  });
}

const applySpritePhysics = function(level, sprites) {
  level.sprites.forEach(sprite => {
    sprite.position[0] += sprite.physics.hspeed;
    sprite.position[1] += sprite.physics.vspeed;

    if (!tileCollision(level, sprite, sprites) && (!sprite.physics.stopAtBorder || sprite.position[1] < level.size[1] * level.tileSize[1])) {
      sprite.physics.vspeed += sprite.physics.gravity;
      sprite.physics.vspeed = Math.min(sprite.physics.vspeed, sprite.physics.maxvspeed);
    }
    else {
      sprite.physics.vspeed = 0;
      sprite.position[1] = Math.round(level.size[1] * level.tileSize[1]);
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