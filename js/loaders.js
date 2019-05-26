import { eventPromise } from "./helpers.js";

class LoadManager {
  constructor() {
    this.pending = 0;
    this.total = 0;
    this.loadingBar = document.getElementById('loadProgressBar');
    this.batches = {};
  }
  updateBar() {
    this.loadingBar.max = this.total;
    this.loadingBar.value = this.total - this.pending;
    if (this.pending === 0) {
      this.loadingBar.classList.add('complete');
    }
    else {
      this.loadingBar.classList.remove('complete');
    }
  }
  beginBatch(batch, size = 0) {
    this.batches[batch] = size;
    this.pending += size;
    this.total += size;
  }
  async track(batch = '', promise = Promise.resolve()) {
    if (!this.batches[batch]) {
      ++this.pending;
      ++this.total;
    }
    this.updateBar();
    const result = await promise;

    --this.pending;
    if (this.batches[batch]) {
      --this.batches[batch];
      if (this.batches[batch] <= 0) {
        delete this.batches[batch];
      }
    }
    this.updateBar();
    return result;
  }
}
const loadManager = new LoadManager();

class Sprite {
  constructor() {
    this.image = new Image();
    this.data = {};
  }

  async load(spriteName) {
    try {
      const result = await fetch(`../sprites/${spriteName}.json`);
      const json = await result.json();

      this.data = json;
      this.x = this.data.states[this.data.defaultState][this.index * 5];
      this.y = this.data.states[this.data.defaultState][this.index * 5 + 1];
      this.w = this.data.states[this.data.defaultState][this.index * 5 + 2];
      this.h = this.data.states[this.data.defaultState][this.index * 5 + 3];
      this.image.src = `../sprites/${spriteName}.png`;
      await eventPromise(this.image);
      return this;
    }
    catch (err) {
      throw new Error(`Error loading sprite ${spriteName}:\n${err.message}`);
    };
  }
  getBbox(sprite) {
    let state = this.data.states[sprite.spriteData.state] ? sprite.spriteData.state : this.data.defaultState;
    return {
      left: sprite.position[0],
      top: sprite.position[1],
      right: sprite.position[0] + this.data.states[state][sprite.spriteData.imageIndex * 5 + 2],
      bottom: sprite.position[1] + this.data.states[state][sprite.spriteData.imageIndex * 5 + 3]
    };
  };

  drawDebug(context, sprite) {
    const bbox = this.getBbox(sprite);
    context.strokeRect(bbox.left, bbox.top, bbox.right-bbox.left, bbox.bottom-bbox.top);
    context.fillText(sprite.spriteData.imageIndex, bbox.left, bbox.top-10);
  };

  draw(context, sprite) {
    const requiredProperties = ['timer', 'imageIndex'];
    if (!sprite.spriteData) {
      sprite.spriteData = {};
    }
    requiredProperties.forEach(prop => {
      if (!sprite.spriteData.hasOwnProperty(prop)) {
        sprite.spriteData[prop] = 0;
      }
    });
    let state = this.data.states[sprite.spriteData.state] ? sprite.spriteData.state : this.data.defaultState;
    let timer = sprite.spriteData.timer + 1;
    if (timer >= this.data.states[state][sprite.spriteData.imageIndex * 5 + 4]) {
      timer = 0;
      sprite.spriteData.imageIndex = (++sprite.spriteData.imageIndex) % (Math.floor(this.data.states[state].length / 5));
      sprite.spriteData.sx = this.data.states[state][sprite.spriteData.imageIndex * 5];
      sprite.spriteData.sy = this.data.states[state][sprite.spriteData.imageIndex * 5 + 1];
      sprite.spriteData.sw = this.data.states[state][sprite.spriteData.imageIndex * 5 + 2];
      sprite.spriteData.sh = this.data.states[state][sprite.spriteData.imageIndex * 5 + 3];
    }
    sprite.spriteData.timer = timer;

    context.drawImage(this.image, sprite.spriteData.sx, sprite.spriteData.sy, sprite.spriteData.sw, sprite.spriteData.sh, sprite.position[0], sprite.position[1], sprite.spriteData.sw, sprite.spriteData.sh);
  }

  setState(sprite, state = '') {
    if (sprite.spriteData.state !== state) {
      sprite.spriteData.state = state;
      sprite.spriteData.timer = 0;
      sprite.spriteData.imageIndex = 0;
      sprite.spriteData.sx = this.data.states[state][sprite.spriteData.imageIndex * 5];
      sprite.spriteData.sy = this.data.states[state][sprite.spriteData.imageIndex * 5 + 1];
      sprite.spriteData.sw = this.data.states[state][sprite.spriteData.imageIndex * 5 + 2];
      sprite.spriteData.sh = this.data.states[state][sprite.spriteData.imageIndex * 5 + 3];
    }
  }
};

const loadLevel = async function(level = '') {
  try {
    return await loadManager.track(
                   'Levels',
                    fetch(`../data/levels/${level}.json`)
                      .then(res => res.json())
                  );
  }
  catch (err) {
    throw new Error(`Error loading level ${level}:\n${err.message}`);
  };
}

const loadSprite = async function(spriteName = '') {
  const sprite = new Sprite();

  return await loadManager.track('Sprites', sprite.load(spriteName));
}

const loadAudio = async function(audioName = '') {
  try {
    const audio = new Audio(`../data/audio/${audioName}`);
    return await loadManager.track('Audio', eventPromise(audio, 'canplaythrough'));
  }
  catch (err) {
    throw new Error(`Error loading audio ${audioName}:\n${err.message}`);
  }
}

export async function loadLevels(levels) {
  loadManager.beginBatch('Levels', levels.length);
  const results = await Promise.all(
    levels.map(levelName => loadLevel(levelName))
  );
  results.forEach((result, i) => {
    levels[i] = result;
  });
};

export async function loadSprites(sprites) {
  try {
    loadManager.beginBatch('Sprites', Object.keys(sprites).length);
    const results = await Promise.all(
      Object.keys(sprites).map(key => {
        return Promise.all([key, loadSprite(sprites[key])]);
      })
    )
    results.forEach(result => {
      sprites[result[0]] = result[1];
    });
  }
  catch (err) {
    throw err;
  }
}

export async function loadAudios(audios) {
  try {
    loadManager.beginBatch('Audio', Object.keys(audios).length);
    const results = await Promise.all(
      Object.keys(audios).map(key => {
        return Promise.all([key, loadAudio(audios[key])]);
      })
    );
    results.forEach(result => {
      audios[result[0]] = result[1];
    });
  }
  catch (err) {
    throw err;
  }
}