const board = document.getElementById("snakeCanvas");
const ctx = board.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("bestScore");
const restartBtn = document.getElementById("restartGame");

const size = 20;
const cells = board.width / size;
let snake;
let food;
let direction;
let nextDirection;
let score;
let alive;
let best = Number(localStorage.getItem("sayanOSSnakeBest") || "0");

function reset() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  food = spawnFood();
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  alive = true;
  updateStats();
}

function spawnFood() {
  let spot;
  do {
    spot = {
      x: Math.floor(Math.random() * cells),
      y: Math.floor(Math.random() * cells),
    };
  } while (snake?.some(part => part.x === spot.x && part.y === spot.y));
  return spot;
}

function updateStats() {
  scoreEl.textContent = score;
  bestEl.textContent = best;
}

function tick() {
  if (!alive) {
    draw();
    return;
  }

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= cells || head.y >= cells;
  const hitSelf = snake.some(part => part.x === head.x && part.y === head.y);
  if (hitWall || hitSelf) {
    alive = false;
    best = Math.max(best, score);
    localStorage.setItem("sayanOSSnakeBest", String(best));
    updateStats();
    draw();
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    best = Math.max(best, score);
    food = spawnFood();
  } else {
    snake.pop();
  }
  updateStats();
  draw();
}

function draw() {
  ctx.clearRect(0, 0, board.width, board.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
  for (let i = 0; i <= cells; i++) {
    ctx.fillRect(i * size, 0, 1, board.height);
    ctx.fillRect(0, i * size, board.width, 1);
  }

  ctx.fillStyle = "#62f7d3";
  snake.forEach((part, index) => {
    ctx.globalAlpha = index === 0 ? 1 : 0.72;
    roundRect(part.x * size + 2, part.y * size + 2, size - 4, size - 4, 6);
  });
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#ffcf6b";
  roundRect(food.x * size + 3, food.y * size + 3, size - 6, size - 6, 8);

  if (!alive) {
    ctx.fillStyle = "rgba(8, 10, 15, 0.72)";
    ctx.fillRect(0, board.height / 2 - 46, board.width, 92);
    ctx.fillStyle = "#eef4ff";
    ctx.font = "800 28px Inter";
    ctx.textAlign = "center";
    ctx.fillText("System paused", board.width / 2, board.height / 2 - 4);
    ctx.font = "500 14px Inter";
    ctx.fillText("Press Restart to run again", board.width / 2, board.height / 2 + 24);
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function setDirection(value) {
  if (value === "up" && direction.y !== 1) nextDirection = { x: 0, y: -1 };
  if (value === "down" && direction.y !== -1) nextDirection = { x: 0, y: 1 };
  if (value === "left" && direction.x !== 1) nextDirection = { x: -1, y: 0 };
  if (value === "right" && direction.x !== -1) nextDirection = { x: 1, y: 0 };
}

window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") setDirection("up");
  if (key === "arrowdown" || key === "s") setDirection("down");
  if (key === "arrowleft" || key === "a") setDirection("left");
  if (key === "arrowright" || key === "d") setDirection("right");
});

document.querySelectorAll(".touch-pad button").forEach(button => {
  button.addEventListener("click", () => setDirection(button.dataset.dir));
});

restartBtn.addEventListener("click", reset);
bestEl.textContent = best;
reset();
setInterval(tick, 105);
