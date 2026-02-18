const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let players = [];
let currentTurn = 0;

const scandalCards = [
  { text: "-1 хайп", hype: -1, skip: false, all: false },
  { text: "-2 хайп", hype: -2, skip: false, all: false },
  { text: "-3 хайп", hype: -3, skip: false, all: false },
  { text: "-4 хайп", hype: -4, skip: false, all: false },
  { text: "-5 хайп", hype: -5, skip: false, all: false },
  { text: "-5 хайп и пропуск хода", hype: -5, skip: true, all: false },
  { text: "-3 хайп у всех игроков", hype: -3, skip: false, all: true }
];

function broadcast() {
  const data = JSON.stringify({
    players,
    currentTurn
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

function nextTurn() {
  if (players.length === 0) return;
  currentTurn = (currentTurn + 1) % players.length;
}

function handleCell(player) {
  const plusCells = {
    1: 4,
    3: 8,
    5: 2,
    8: 3,
    10: 3,
    13: 5,
    14: 3,
    16: 2,
    19: 2
  };

  if (plusCells[player.position]) {
    player.hype += plusCells[player.position];
  }

  if ([2, 4, 11, 17].includes(player.position)) {
    const card = scandalCards[Math.floor(Math.random() * scandalCards.length)];

    if (card.all) {
      players.forEach(p => {
        p.hype += card.hype;
        if (p.hype < 0) p.hype = 0;
      });
    } else {
      player.hype += card.hype;
      if (card.skip) player.skip = true;
      if (player.hype < 0) player.hype = 0;
    }
  }

  if ([9, 16].includes(player.position)) {
    const dice = Math.floor(Math.random() * 6) + 1;
    player.hype += dice <= 3 ? -5 : 5;
  }

  if (player.position === 10) {
    player.hype = Math.floor(player.hype / 2);
    player.skip = true;
  }

  if (player.position === 6) {
    player.skip = true;
  }

  if (player.position === 18) {
    player.hype = 0;
  }

  if (player.hype < 0) player.hype = 0;
}

wss.on("connection", ws => {

  ws.on("message", message => {

    const data = JSON.parse(message);

    if (data.type === "join") {

      if (players.length >= 6) return;

      players.push({
        id: players.length,
        color: data.color,
        position: 0,
        hype: 0,
        skip: false
      });

      broadcast();
    }

    if (data.type === "roll") {

      const player = players[currentTurn];
      if (!player) return;

      if (player.skip) {
        player.skip = false;
        nextTurn();
        broadcast();
        return;
      }

      const dice = Math.floor(Math.random() * 6) + 1;

      player.position = (player.position + dice) % 20;

      handleCell(player);

      nextTurn();

      broadcast();
    }

  });

});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
