const canvas = document.getElementById("signalCanvas");
const ctx = canvas.getContext("2d");
let points = [];

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  const count = Math.min(90, Math.floor(window.innerWidth / 18));
  points = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
  }));
}

function animateSignals() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  points.forEach(point => {
    point.x += point.vx;
    point.y += point.vy;
    if (point.x < 0 || point.x > window.innerWidth) point.vx *= -1;
    if (point.y < 0 || point.y > window.innerHeight) point.vy *= -1;
  });

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 130) {
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.16 * (1 - dist / 130)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  points.forEach(point => {
    ctx.fillStyle = "rgba(0, 184, 148, 0.32)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(animateSignals);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const chatLog = document.getElementById("chatLog");
const askForm = document.getElementById("askForm");
const questionInput = document.getElementById("questionInput");
const visitCountdown = document.getElementById("visitCountdown");
const miniSnakeCanvas = document.getElementById("miniSnakeCanvas");
const miniSnakeScore = document.getElementById("miniSnakeScore");
const miniSnakeRestart = document.getElementById("miniSnakeRestart");
const miniSnakeStart = document.getElementById("miniSnakeStart");

function updateVisitCountdown() {
  if (!visitCountdown) return;
  const key = "sayanOSPortfolioVisitsV2";
  const sessionKey = "sayanOSVisitCountedV2";
  let visits = Number(localStorage.getItem(key) || "333");
  if (!sessionStorage.getItem(sessionKey)) {
    visits += 1;
    localStorage.setItem(key, String(visits));
    sessionStorage.setItem(sessionKey, "true");
  }
  visitCountdown.textContent = String(visits).padStart(4, "0");
}

function addMessage(role, text, sources = []) {
  const item = document.createElement("div");
  item.className = `message ${role}`;
  const label = role === "user" ? "You" : "Sayan OS";
  const sourceText = sources.length ? `<p class="sources">Based on: ${sources.join(", ")}</p>` : "";
  item.innerHTML = `<span>${label}</span><p>${escapeHtml(text)}</p>${sourceText}`;
  chatLog.appendChild(item);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function askSayan(question) {
  addMessage("user", question);
  const loading = document.createElement("div");
  loading.className = "message bot";
  loading.innerHTML = "<span>Sayan OS</span><p>Thinking through the project knowledge base...</p>";
  chatLog.appendChild(loading);
  chatLog.scrollTop = chatLog.scrollHeight;

  try {
    const response = await fetch("/ask-sayan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) throw new Error("Assistant backend unavailable");
    const data = await response.json();
    loading.remove();
    addMessage("bot", data.answer || "I could not answer that yet.", data.sources || []);
  } catch (error) {
    loading.remove();
    addMessage("bot", localPortfolioAnswer(question), ["Local portfolio fallback"]);
  }
}

function localPortfolioAnswer(question) {
  const q = question.toLowerCase();
  if (q.includes("hire")) {
    return "Hire Sayan because he combines practical business ownership, full-stack building, data analysis and hands-on AI integration. Zuno proves he can turn a real operational problem into a working product with backend, data, and AI systems.";
  }
  if (q.includes("zuno") || q.includes("ai")) {
    return "Zuno is Sayan's flagship business operations platform for small shops. It includes sales, inventory, credit, storefront, analytics and AI workflows using Gemini, RAG, embeddings, Qdrant vector memory and LangChain.";
  }
  if (q.includes("data") || q.includes("sql")) {
    return "Sayan has built PhonePe analysis with Python, e-commerce analysis with SQL, and Power BI/Excel dashboards for sales, customer behavior, KPIs and inflation trends.";
  }
  return "Sayan OS highlights Sayan's journey from Java/Selenium automation to data analytics, backend systems, Zuno, AI/RAG integration and a TinyGPT learning project.";
}

function initMiniSnake() {
  if (!miniSnakeCanvas) return;
  const miniCtx = miniSnakeCanvas.getContext("2d");
  const cell = 20;
  const cols = miniSnakeCanvas.width / cell;
  const rows = miniSnakeCanvas.height / cell;
  let snake = [];
  let food = {};
  let dir = { x: 1, y: 0 };
  let next = dir;
  let score = 0;
  let active = false;
  let timer = null;

  function reset() {
    snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
    food = { x: 12, y: 5 };
    dir = { x: 1, y: 0 };
    next = dir;
    score = 0;
    miniSnakeScore.textContent = "0";
    draw();
  }

  function startGame() {
    if (active) return;
    active = true;
    miniSnakeStart?.classList.add("hidden");
    miniSnakeCanvas.focus({ preventScroll: true });
    timer = setInterval(tick, 150);
  }

  function setMiniDirection(value) {
    startGame();
    if (value === "up" && dir.y !== 1) next = { x: 0, y: -1 };
    if (value === "down" && dir.y !== -1) next = { x: 0, y: 1 };
    if (value === "left" && dir.x !== 1) next = { x: -1, y: 0 };
    if (value === "right" && dir.x !== -1) next = { x: 1, y: 0 };
  }

  function placeFood() {
    food = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
  }

  function tick() {
    if (!active) return;
    dir = next;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const crashed = head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows || snake.some(part => part.x === head.x && part.y === head.y);
    if (crashed) {
      reset();
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      miniSnakeScore.textContent = score;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    miniCtx.clearRect(0, 0, miniSnakeCanvas.width, miniSnakeCanvas.height);
    miniCtx.fillStyle = "rgba(255,255,255,0.035)";
    for (let x = 0; x < miniSnakeCanvas.width; x += cell) miniCtx.fillRect(x, 0, 1, miniSnakeCanvas.height);
    for (let y = 0; y < miniSnakeCanvas.height; y += cell) miniCtx.fillRect(0, y, miniSnakeCanvas.width, 1);
    miniCtx.fillStyle = "#62f7d3";
    snake.forEach((part, index) => {
      miniCtx.globalAlpha = index === 0 ? 1 : 0.72;
      miniCtx.beginPath();
      miniCtx.roundRect(part.x * cell + 2, part.y * cell + 2, cell - 4, cell - 4, 6);
      miniCtx.fill();
    });
    miniCtx.globalAlpha = 1;
    miniCtx.fillStyle = "#ffcf6b";
    miniCtx.beginPath();
    miniCtx.arc(food.x * cell + 10, food.y * cell + 10, 6, 0, Math.PI * 2);
    miniCtx.fill();
  }

  document.querySelectorAll("[data-mini-dir]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      setMiniDirection(button.dataset.miniDir);
    });
  });
  window.addEventListener("keydown", event => {
    if (!active || document.activeElement !== miniSnakeCanvas) return;
    const key = event.key.toLowerCase();
    const directionKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"];
    if (!directionKeys.includes(key)) return;
    event.preventDefault();
    if (key === "arrowup" || key === "w") setMiniDirection("up");
    if (key === "arrowdown" || key === "s") setMiniDirection("down");
    if (key === "arrowleft" || key === "a") setMiniDirection("left");
    if (key === "arrowright" || key === "d") setMiniDirection("right");
  });
  miniSnakeCanvas.addEventListener("click", startGame);
  miniSnakeCanvas.addEventListener("touchstart", event => {
    event.preventDefault();
    startGame();
  }, { passive: false });
  miniSnakeStart?.addEventListener("click", event => {
    event.preventDefault();
    startGame();
  });
  miniSnakeRestart.addEventListener("click", () => {
    reset();
    startGame();
  });
  reset();
}

askForm.addEventListener("submit", event => {
  event.preventDefault();
  const question = questionInput.value.trim();
  if (!question) return;
  questionInput.value = "";
  askSayan(question);
});

document.querySelectorAll(".prompt-chip").forEach(button => {
  button.addEventListener("click", () => {
    questionInput.value = button.textContent.trim();
    askSayan(questionInput.value);
    questionInput.value = "";
  });
});

window.addEventListener("resize", resizeCanvas);
updateVisitCountdown();
resizeCanvas();
animateSignals();
initMiniSnake();
