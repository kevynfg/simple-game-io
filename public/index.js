const socket = new WebSocket(`ws://${window.location.host}`);

const PLAYER_SIZE = 15;

let canvas = document.getElementById("canvas");
canvas.width = 640;
canvas.height = 480;

let ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

let players = [];
let me = {};

socket.addEventListener("open", function (event) {
  console.log(`Connected to server: ${socket.url}`);
});

socket.addEventListener("message", function (event) {
  console.log("Message from server ", event.data);
  const data = JSON.parse(event.data);
  switch (data.type) {
    case "playerJoined":
      players = data.players;
      me = data.newPlayer;
      console.log(`Client: new player added, player list`, {
        total: players.length,
        players: players.map((player) => player.id),
        me,
      });
      break;
    case "playerLeft":
      players.splice(
        players.findIndex((player) => player.id === data.id),
        1
      );
      break;
    case "update":
      {
        players = data.players;
        console.log(`Client: updated player list`, {players: data.players});
      }
      break;
  }
});

socket.addEventListener("error", function (event) {
  console.error("WebSocket error: ", event);
});

socket.addEventListener("close", function (event) {
  console.log("WebSocket is closed now.");
});

const inputs = {
  up: false,
  down: false,
  left: false,
  right: false,
};

window.addEventListener("keydown", function (event) {
  if (!event.repeat && me !== undefined) {
    switch (event.key) {
      case "w":
        inputs["up"] = true;
        break
      case "s":
        inputs["down"] = true;
        break
      case "a":
        inputs["left"] = true;
        break
      case "d":
        inputs["right"] = true;
        break
    }
    socket.send(JSON.stringify({ type: "input", inputs }));
  }
});

window.addEventListener("keyup", function (event) {
  if (!event.repeat && me !== undefined) {
    switch (event.key) {
      case "w":
        inputs["up"] = false;
        break
      case "s":
        inputs["down"] = false;
        break
      case "a":
        inputs["left"] = false;
        break
      case "d":
        inputs["right"] = false;
        break
    }
    socket.send(JSON.stringify({ type: "input", inputs }));
  }
});

function tick() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  players.forEach((player) => {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
    if (player.id === me.id) {
      me = player;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.strokeRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
      ctx.stroke();
    }
  });
  window.requestAnimationFrame(tick);
}

tick();
