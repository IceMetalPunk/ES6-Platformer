let canvas, context;

export function initRenderers() {
  canvas = document.getElementById('game');
  context = canvas.getContext('2d');
  context.textAlign = 'left';
  context.textBaseline = 'top';
};

const renderTitle = function(level) {
  context.fillStyle = '#000000';
  context.font = '20pt Calibri';
  context.fillText(level.name, 5, 5);
}

const renderTiles = function(level) {
  level.tiles.forEach(tile => {
    context.fillStyle = tile.color;
    let w = level.tileSize[0], h = level.tileSize[1];
    if (tile.position.length === 4) {
      w += Math.max(tile.position[2] * level.tileSize[0], tile.position[0] * level.tileSize[0]) - Math.min(tile.position[2] * level.tileSize[0], tile.position[0] * level.tileSize[0]);
      h += Math.max(tile.position[3] * level.tileSize[1], tile.position[1] * level.tileSize[1]) - Math.min(tile.position[3] * level.tileSize[1], tile.position[1] * level.tileSize[1]);
    }
    context.fillRect(tile.position[0] * level.tileSize[0], tile.position[1] * level.tileSize[1], w, h);
  });
}

const renderSprites = function(level, sprites) {
  level.sprites.forEach(sprite => {
    sprites[sprite.sprite].draw(context, sprite);
  });
}

export function drawLevel(level, sprites) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = level.background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  renderTiles(level);
  renderSprites(level, sprites);

  renderTitle(level);
}