import { eventPromise } from "./helpers.js";

class Sprite {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.w = 32;
    this.h = 32;
    this.index = 0;
    this.timer = 0;
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
    return {
      left: sprite.position[0],
      top: sprite.position[1],
      right: sprite.position[0] + this.data.states[sprite.state][this.index * 5 + 2],
      bottom: sprite.position[1] + this.data.states[sprite.state][this.index * 5 + 3]
    };
  };

  drawDebug(context, sprite) {
    const bbox = this.getBbox(sprite);
    context.strokeRect(bbox.left, bbox.top, bbox.right-bbox.left, bbox.bottom-bbox.top);
  };

  draw(context, sprite) {
    if (++this.timer >= this.data.states[sprite.state][this.index * 5 + 4]) {
      this.timer = 0;
      this.index = (++this.index) % (Math.floor(this.data.states[sprite.state].length / 5));
      this.x = this.data.states[sprite.state][this.index * 5];
      this.y = this.data.states[sprite.state][this.index * 5 + 1];
      this.w = this.data.states[sprite.state][this.index * 5 + 2];
      this.h = this.data.states[sprite.state][this.index * 5 + 3];
    }

    context.drawImage(this.image, this.x, this.y, this.w, this.h, sprite.position[0], sprite.position[1], this.w, this.h);
  }
};

const loadLevel = async function(level = '') {
  try {
    const result = await fetch(`../data/levels/${level}.json`);
    return await result.json();
  }
  catch (err) {
    throw new Error(`Error loading level ${level}:\n${err.message}`);
  };
}

const loadSprite = async function(spriteName = '') {
  const sprite = new Sprite();

  return await sprite.load(spriteName);
}

const loadAudio = async function(audioName = '') {
  try {
    const audio = new Audio(`../data/audio/${audioName}`);
    return await eventPromise(audio, 'canplaythrough');
  }
  catch (err) {
    throw new Error(`Error loading audio ${audioName}:\n${err.message}`);
  }
}

export async function loadLevels(levels) {
  const results = await Promise.all(
    levels.map(levelName => loadLevel(levelName))
  );
  results.forEach((result, i) => {
    levels[i] = result;
  });
};

export async function loadSprites(sprites) {
  try {
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