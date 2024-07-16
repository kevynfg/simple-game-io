const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");
const { randomUUID } = require("node:crypto");
const { insideBoundries, randomStyle, sendMessage } = require("./common");

const SERVER_LIMIT = 10;
const SERVER_FPS = 30;
const SPEED = 5;

let players = [];
let inputsMap = {};

const app = express();
const port = 3003;

app.use(express.static(path.join(__dirname, "public")));
const server = createServer(app);

const wss = new WebSocketServer({ server, clientTracking: true });

async function main() {
  wss.on("connection", function (ws) {
    if (players.length >= SERVER_LIMIT) {
      console.log("Server is full");
      ws.close();
      return;
    };

    const id = randomUUID();
    const newPlayer = {
      ws,
      x: insideBoundries("width"),
      y: insideBoundries("height"),
      color: randomStyle(),
      id,
    };
    players.push(newPlayer);

    inputsMap[id] = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    sendMessage(ws, { type: "playerJoined", newPlayer, players });

    ws.addEventListener("message", function (message) {
      let data;
      try {
        data = JSON.parse(message.data.toString());
      } catch (error) {
        console.log("Error parsing message: ", error);
        ws.close();
        return;
      }
      console.log("Message from client ", data);

      if (data.type === "input") {
        inputsMap[id] = data.inputs;
      }
    });

    ws.addEventListener("error", function (event) {
      console.error("WebSocket error: ", event);
    });

    ws.addEventListener("close", function () {
      players.splice(
        players.findIndex((player) => player.id === id),
        1
      );
    });
  });

  server.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });

  function properMod(a, b) {
    return ((a % b) + b) % b;
  }

  function tick(delta) {
    players.forEach((player) => {
      const inputs = inputsMap[player.id];
      if (inputs.up) player.y -= properMod(5*SPEED, 480);
      if (inputs.down) player.y += properMod(5*SPEED, 480);
      if (inputs.left) player.x -= properMod(5*SPEED, 640);
      if (inputs.right) player.x += properMod(5*SPEED, 640);

      if (player.x < 0) player.x = 640 - 5;
      if (player.x > 640) player.x = 0;
      if (player.y < 0) player.y = 480 - 5;
      if (player.y > 480) player.y = 0;
    });

    players.forEach((player) => {
      sendMessage(player.ws, { type: "update", players });
    });
  }

  let lastUpdate = Date.now();
  setInterval(() => {
    const now = Date.now();
    const delta = now - lastUpdate;
    tick(delta);
    lastUpdate = now;
  }, 1000 / SERVER_FPS);
}

main();
