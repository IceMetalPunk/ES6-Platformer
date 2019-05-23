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

  load(spriteName) {
    return fetch(`../sprites/${spriteName}.json`)
    .then(result => result.json())
    .catch(err => {
      console.log(err);
      return Promise.reject(err);
    })
    .then(json => {
      this.data = json;
      this.x = this.data.states[this.data.defaultState][this.index * 5];
      this.y = this.data.states[this.data.defaultState][this.index * 5 + 1];
      this.w = this.data.states[this.data.defaultState][this.index * 5 + 2];
      this.h = this.data.states[this.data.defaultState][this.index * 5 + 3];
      return new Promise((resolve, reject) => {
        this.image.src = `../sprites/${spriteName}.png`;
        this.image.onload = () => void resolve(this);
        this.image.onerror = () => void reject(`Could not load sprite from URL ${url}`);
      });
    });
  }
  getBbox(sprite) {
    return {
      left: sprite.position[0],
      top: sprite.position[1] - this.data.states[sprite.state][this.index * 5 + 3],
      right: sprite.position[0] + this.data.states[sprite.state][this.index * 5 + 2],
      bottom: sprite.position[1]
    };
  }

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

const loadLevel = function(level = '') {
  return fetch(`../data/levels/${level}.json`)
  .then(result => result.json())
  .catch(err => {
    console.log(err);
    return Promise.reject(err);
  });
}

const loadSprite = function(spriteName = '') {
  const sprite = new Sprite();
    
  return sprite.load(spriteName)
  .catch(err => console.log(`Error: ${err}`));
}

export function loadLevels(levels) {
  return Promise.all(
    levels.map(levelName => loadLevel(levelName))
  )
  .then(results => {
    results.forEach((result, i) => {
      levels[i] = result;
    });
  });
};

export function loadSprites(sprites) {
  return Promise.all(
    Object.keys(sprites).map(key => {
      return Promise.all([key, loadSprite(sprites[key])]);
    })
  )
  .then(results => {
    results.forEach(result => {
      sprites[result[0]] = result[1];
    });
  });
}