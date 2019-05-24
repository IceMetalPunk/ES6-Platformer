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
  applyPhysics(level, Sprites);
};

const initialize = async function() {
  try {
    initRenderers();

    await loadSprites(Sprites);
    await loadLevels(Levels);
    
    gameLoop = setInterval(() => tick(Levels[currentLevel]), 33);
  }
  catch (err) {
    alert(`Failed to load game because of error: ${err}`);
    throw err;
  }
};

window.addEventListener('DOMContentLoaded', initialize);