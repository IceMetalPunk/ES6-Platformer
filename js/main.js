import {levelStream, loadSprites, loadAudios} from './loaders.js';
import {initRenderers, drawLevel, drawGameStartOverlay, drawErrorOverlay} from './renderers.js';
import {applyPhysics} from './physics.js';
import {updateInput} from './input.js';

let gameLoop, currentLevel = -1;
const Sprites = {
  KIRBY: 'kirby'
};
const Audio = {
  BGM1: 'bensound-creativeminds.mp3',
  BGM2: 'bensound-littleidea.mp3'
};
const Levels = [];

const tick = function(level) {
  drawLevel(level, Sprites);
  updateInput();
  applyPhysics(level, Sprites);
};

const stopAllAudio = function() {
  Object.keys(Audio).forEach(key => {
    Audio[key].pause();
    Audio[key].currentTime = 0;
  });
}

const startLevel = function(level) {
  stopAllAudio();
  if (level.music) {
    Audio[level.music].play();
  }
  if (gameLoop) {
    clearInterval(gameLoop);
  }
  gameLoop = setInterval(() => tick(level), 33);
}

const initialize = async function() {
  try {
    initRenderers();

    await loadSprites(Sprites);
    await loadAudios(Audio);
    const level = await levelStream.next();
    
    if (level === null) {
      throw new Error('Could not download level 1-1!');
    }
    Levels.push(level);

    currentLevel = 0;
    drawGameStartOverlay();
  }
  catch (err) {
    drawErrorOverlay(`Failed to load game! Cause:\n${err.message}`);
    throw err;
  }
};

const nextLevel = async function() {
  if (currentLevel < Levels.length - 1) {
    ++currentLevel;
    startLevel(Levels[currentLevel]);
  }
  else {
    try {
      const level = await levelStream.next();

      if (level === null) {
        throw new Error('Could not download next level!');
      }
      Levels.push(level);
      currentLevel = Levels.length - 1;
      startLevel(Levels[currentLevel]);
    }
    catch (err) {
      clearInterval(gameLoop);
      gameLoop = -1;
      stopAllAudio();
      drawErrorOverlay(`Failed to load game! Cause:\n${err.message}`);
      throw err;
    }
  }
};
const previousLevel = function() {
  if (Levels.length > 0 && currentLevel > 0) {
    --currentLevel;
    startLevel(Levels[currentLevel]);
  }
}

window.addEventListener('DOMContentLoaded', initialize);
document.addEventListener('click', () => {
  if (!gameLoop && currentLevel >= 0) {
    startLevel(Levels[currentLevel]);
  }
});