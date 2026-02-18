const ws = new WebSocket(
  location.protocol === "https:"
    ? "wss://" + location.host
    : "ws://" + location.host
);

const piecesDiv = document.getElementById("pieces");
const info = document.getElementById("info");
const rollBtn = document.getElementById("roll");
const diceSound = document.getElementById("diceSound");

const colors = ["red","green","yellow","blue","pink","orange"];

let myColor = null;

while (!colors.includes(myColor)) {
  myColor = prompt("Выбери фишку: red, green, yellow, blue, pink, orange");
}

ws.onopen = () => {

  ws.send(JSON.stringify({
    type: "join",
    color: myColor
  }));

};

ws.onmessage = (msg) => {

  const data = JSON.parse(msg.data);

  drawPlayers(data.players);

  info.innerHTML = "";

  data.players.forEach((p, i) => {

    let text = `${p.color}: ${p.hype} хайпа`;

    if (i === data.currentTurn)
      text += " ← ход";

    info.innerHTML += text + "<br>";

  });

};

rollBtn.onclick = () => {

  diceSound.play();

  ws.send(JSON.stringify({
    type: "roll"
  }));

};

function drawPlayers(players) {

  piecesDiv.innerHTML = "";

  players.forEach(player => {

    const piece = document.createElement("div");

    piece.className = "piece";

    piece.style.background = player.color;

    const pos = getCoords(player.position);

    piece.style.left = pos.x + "px";
    piece.style.top = pos.y + "px";

    piecesDiv.appendChild(piece);

  });

}

function getCoords(pos) {

  const coords = [

    {x:30,y:730},
    {x:140,y:730},
    {x:250,y:730},
    {x:360,y:730},
    {x:470,y:730},
    {x:580,y:730},
    {x:690,y:730},

    {x:730,y:620},
    {x:730,y:510},
    {x:730,y:400},
    {x:730,y:290},

    {x:690,y:180},
    {x:580,y:180},
    {x:470,y:180},
    {x:360,y:180},
    {x:250,y:180},
    {x:140,y:180},

    {x:30,y:290},
    {x:30,y:400},
    {x:30,y:510}

  ];

  return coords[pos];

}
