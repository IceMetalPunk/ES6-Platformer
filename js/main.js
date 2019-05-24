import {loadLevels, loadSprites, loadAudios} from './loaders.js';
import {initRenderers, drawLevel, drawGameStartOverlay, drawErrorOverlay} from './renderers.js';
import {applyPhysics} from './physics.js';
import {updateInput} from './input.js';

let gameLoop, currentLevel = -1;
const Sprites = {
  KIRBY: 'kirby'
};
const Audio = {
  BGM1: 'bensound-creativeminds.mp3'
};
const Levels = ['1-1'];

const tick = function(level) {
  drawLevel(level, Sprites);
  updateInput();
  applyPhysics(level, Sprites);
};

const startLevel = function(level) {
  if (level.music) {
    Audio[level.music].play();
  }
  gameLoop = setInterval(() => tick(level), 33);
}

const initialize = async function() {
  try {
    initRenderers();

    await loadSprites(Sprites);
    await loadAudios(Audio);
    await loadLevels(Levels);
    
    currentLevel = 0;
    drawGameStartOverlay();
  }
  catch (err) {
    drawErrorOverlay(`Failed to load game! Cause:\n${err.message}`);
    throw err;
  }
};

window.addEventListener('DOMContentLoaded', initialize);
document.addEventListener('click', () => {
  if (!gameLoop && currentLevel >= 0) {
    startLevel(Levels[currentLevel]);
  }
});