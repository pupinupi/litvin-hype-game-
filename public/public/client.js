// Подключаемся к серверу через Socket.IO
const socket = io();

// Получаем элементы
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Размер canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Наш игрок
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    color: "cyan"
};

// Другие игроки
let players = {};

// Движение мышкой
canvas.addEventListener("mousemove", (e) => {
    player.x = e.clientX;
    player.y = e.clientY;

    socket.emit("move", player);
});

// Получаем всех игроков
socket.on("players", (serverPlayers) => {
    players = serverPlayers;
});

// Отрисовка
function draw() {

    // Очистка экрана
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Чёрный фон
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем всех игроков
    for (let id in players) {

        let p = players[id];

        ctx.fillStyle = p.color || "white";

        ctx.beginPath();
        ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    requestAnimationFrame(draw);
}

draw();

// Когда подключились
socket.on("connect", () => {
    console.log("Connected:", socket.id);

    socket.emit("move", player);
});
