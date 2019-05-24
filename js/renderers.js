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
  context.textAlign = 'left';
  context.textBaseline = 'top';
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
    context.strokeRect(tile.position[0] * level.tileSize[0], tile.position[1] * level.tileSize[1], w, h);
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

export function drawGameStartOverlay() {
  context.fillStyle = '#000000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ffffff';
  context.font = '48pt Calibri';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Click the Game to Start', canvas.width / 2, canvas.height / 2);
}

function fillMultilineText(context, text = '', x = 0, yy = 0) {
  const lines = text.split('\n');
  for (let y = yy, line = 0; line < lines.length; ++line) {
    context.fillText(lines[line], x, y);
    y += context.measureText('M').width + 2;
  }
}

export function drawErrorOverlay(message = 'An unexpected error has occurred.') {
  context.fillStyle = '#000000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#ff0000';
  context.font = '12pt Calibri';
  context.textAlign = 'left';
  context.textBaseline = 'top';
  fillMultilineText(context, message, 5, 5);
}