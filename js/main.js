import {loadLevels, loadSprites} from './loaders.js';
import {initRenderers, drawLevel} from './renderers.js';
import {applyPhysics} from './physics.js';
import {updateInput} from './input.js';

let gameLoop, currentLevel = 0;
const Sprites = {
  KIRBY: 'kirby'
};
const Levels = ['1-1'];

const tick = function(level) {
  drawLevel(level, Sprites);
  updateInput();
  applyPhysics(level);
};

const initialize = function() {
  initRenderers();

  loadSprites(Sprites)
  .then(() => loadLevels(Levels))
  .then(() => {
    gameLoop = setInterval(() => tick(Levels[currentLevel]), 33);
  });
};

window.addEventListener('DOMContentLoaded', initialize);