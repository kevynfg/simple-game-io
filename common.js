const GAME_HEIGHT = 480;
const GAME_WIDTH = 640;

function insideBoundries(boundries) {
  const defaultPosition = 260;
  switch (boundries) {
    case "width":
      return Math.floor(Math.random() * GAME_WIDTH - 5);
    case "height":
      return Math.floor(Math.random() * GAME_HEIGHT - 5);
    default:
      return defaultPosition;
  }
}

function randomStyle() {
  return `hsl(${Math.floor(Math.random() * 360)} 80% 50%)`;
}

function sendMessage(ws, message) {
  ws.send(JSON.stringify(message));
}

const directions = {
  'up': { x: 0, y: -1 },
  'down': { x: 0, y: 1 },
  'left': { x: -1, y: 0 },
  'right': { x: 1, y: 0 }
}

function updatePlayerPosition(player) {
  const direction = directions[player.direction];
  player.x += direction.x;
  player.y += direction.y;
  if (player.x < 0) player.x = GAME_WIDTH - 5;
  if (player.x > GAME_WIDTH) player.x = 0;
  if (player.y < 0) player.y = GAME_HEIGHT - 5;
  if (player.y > GAME_HEIGHT) player.y = 0;
  return player;
}

module.exports = {
  insideBoundries,
  randomStyle,
  sendMessage,
  updatePlayerPosition
}