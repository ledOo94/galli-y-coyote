//  Variables globales
const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const boardSize = 400;
const cellSize = 100;

let coyote = { x: 200, y: 200, size: 10 };
let gallinas = [];
let gallinaSeleccionada = 0;

let rolJugador = null;
let rolCompu = null;
let turnoActual = "jugador";
let tiempoTurno;
const sonidoMordida = new Audio("mordida.mp3");

const nodos = [];
for (let y = 0; y <= boardSize; y += cellSize) {
  for (let x = 0; x <= boardSize; x += cellSize) {
    nodos.push({ x, y });
  }
}

// 🔗 Conexiones diagonales válidas
const diagonalesPermitidas = [
  ["0,0", "100,100"], ["100,100", "200,0"],
  ["200,0", "300,100"],["300,100", "400,0"],
  ["300,100", "400,200"], ["400,200", "300,300"],
  ["300,300", "400,400"], ["300,300", "200,400"],
  ["200,400", "100,300"], ["100,300", "0,400"],
  ["100,300", "0,200"], ["0,200", "100,100"],
  ["100,100", "0,0"], ["200,200", "100,100"],
  ["200,200", "300,100"], ["200,200", "100,300"],
  ["200,200", "300,300"], ["400,200", "300,100"],
  ["300,100", "200,0"]
];

// 🎯 Utilidades
function esNodoValido(x, y) {
  return nodos.some(n => n.x === x && n.y === y);
}
function estaLibre(x, y) {
  return !gallinas.some(g => g.x === x && g.y === y) &&
         !(coyote.x === x && coyote.y === y);
}
function hayConexionVisual(x1, y1, x2, y2) {
  const desde = `${x1},${y1}`;
  const hacia = `${x2},${y2}`;
  return diagonalesPermitidas.some(([a, b]) =>
    (a === desde && b === hacia) || (a === hacia && b === desde)
  );
}

// 🎨 Dibujo
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "black";

  for (let i = 0; i <= boardSize; i += cellSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, boardSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(boardSize, i);
    ctx.stroke();
  }

  // Rombo central
  ctx.beginPath();
  ctx.moveTo(200, 0);
  ctx.lineTo(400, 200);
  ctx.lineTo(200, 400);
  ctx.lineTo(0, 200);
  ctx.closePath();
  ctx.stroke();

  // Cruz diagonal
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(400, 400);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 400);
  ctx.lineTo(400, 0);
  ctx.stroke();
}

function drawCoyote() {
  ctx.beginPath();
  ctx.arc(coyote.x, coyote.y, coyote.size, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();
}

function drawGallinas() {
  gallinas.forEach((g, index) => {
    ctx.beginPath();
    ctx.arc(g.x, g.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = index === gallinaSeleccionada ? "green" : "orange";
    ctx.fill();
  });
}

// 🔁 Juego
function updateGame() {
  drawBoard();
  drawCoyote();
  drawGallinas();
  mostrarTurno();
}

function cambiarTurno() {
  turnoActual = turnoActual === "jugador" ? "compu" : "jugador";

  clearTimeout(tiempoTurno);

  if (turnoActual === "compu") {
    document.getElementById("info-turno").textContent = "🤖 La IA está pensando...";

    setTimeout(() => {
      if (rolCompu === "coyote") turnoCompuCoyote();
      else turnoCompuGallina();
      updateGame();

      setTimeout(() => {
        cambiarTurno();
      }, 1500);
    }, 1200);
  } else {
    mostrarTurno(); //actualiza texto de yurno para el jugador*/

    tiempoTurno = setTimeout(() => {
      console.log("⏰ Tiempo agotado. Turno pasa automáticamente.");
      cambiarTurno();
    }, 30000);
  }
} // ← ESTA ES LA LLAVE QUE CIERRA TODA la función cambiarTurno()

function mostrarTurno() {
  const texto = turnoActual === "jugador"
    ? `🕹️ Tu turno como ${rolJugador}`
    : `🤖 Turno de la compu como ${rolCompu}`;
  document.getElementById("info-turno").textContent = texto;
}

// 🎮 Interacción
function moverGallina(dx, dy) {
  if (turnoActual !== "jugador" || rolJugador !== "gallina") return;
  const g = gallinas[gallinaSeleccionada];
  if (!g) return;
  const newX = g.x + dx * cellSize;
  const newY = g.y + dy * cellSize;
  const esDiagonal = dx !== 0 && dy !== 0;

  if (
    esNodoValido(newX, newY) &&
    estaLibre(newX, newY) &&
    (!esDiagonal || hayConexionVisual(g.x, g.y, newX, newY))
  ) {
    g.x = newX;
    g.y = newY;
    cambiarTurno();
  }
}

function cambiarGallina() {
  if (rolJugador !== "gallina") return;
  gallinaSeleccionada = (gallinaSeleccionada + 1) % gallinas.length;
  updateGame();
}

function moverCoyote(dx, dy) {
  if (turnoActual !== "jugador" || rolJugador !== "coyote") return;
  const newX = coyote.x + dx * cellSize;
  const newY = coyote.y + dy * cellSize;
  const esDiagonal = dx !== 0 && dy !== 0;

  if (
    esNodoValido(newX, newY) &&
    estaLibre(newX, newY) &&
    (!esDiagonal || hayConexionVisual(coyote.x, coyote.y, newX, newY))
  ) {
    coyote.x = newX;
    coyote.y = newY;
    cambiarTurno();
  }
}

function intentaCapturaCoyote(dx, dy) {
  if (turnoActual !== "jugador" || rolJugador !== "coyote") return;
  const midX = coyote.x + dx * cellSize;
  const midY = coyote.y + dy * cellSize;
  const destX = coyote.x + dx * cellSize * 2;
  const destY = coyote.y + dy * cellSize * 2;

  const gallinaEnMedio = gallinas.find(g => g.x === midX && g.y === midY);
  const esDiagonal = dx !== 0 && dy !== 0;
  const conexionMedio = !esDiagonal || hayConexionVisual(coyote.x, coyote.y, midX, midY);
  const conexionDestino = !esDiagonal || hayConexionVisual(midX, midY, destX, destY);
  const destinoLibre = esNodoValido(destX, destY) && estaLibre(destX, destY);

  if (gallinaEnMedio && conexionMedio && conexionDestino && destinoLibre) {
    gallinas = gallinas.filter(g => !(g.x === midX && g.y === midY));
    coyote.x = destX;
    coyote.y = destY;
    sonidoMordida.play();
    cambiarTurno();
  } else {
    moverCoyote(dx, dy);
  }
}
//turno compuCOyote
function turnoCompuCoyote() {
  const direcciones = [
    [0, 1], [0, -1], [1, 0], [-1, 0], // cardinales
    [1, 1], [1, -1], [-1, 1], [-1, -1] // diagonales
  ];
  for (let [dx, dy] of direcciones) {
    const midX = coyote.x + dx * cellSize;
    const midY = coyote.y + dy * cellSize;
    const destX = coyote.x + dx * cellSize * 2;
    const destY = coyote.y + dy * cellSize * 2;

    const gallinaEnMedio = gallinas.find(g => g.x === midX && g.y === midY);
    const esDiagonal = dx !== 0 && dy !== 0;
    const conexionMedio = !esDiagonal || hayConexionVisual(coyote.x, coyote.y, midX, midY);
    const conexionDestino = !esDiagonal || hayConexionVisual(midX, midY, destX, destY);
    const destinoLibre = esNodoValido(destX, destY) && estaLibre(destX, destY);

    if (gallinaEnMedio && conexionMedio && conexionDestino && destinoLibre) {
      gallinas = gallinas.filter(g => !(g.x === midX && g.y === midY));
      coyote.x = destX;
      coyote.y = destY;
      sonidoMordida.play();
      return;
    }
  }

  // Si no puede devorar, intenta mover
  for (let [dx, dy] of direcciones) {
    moverCoyote(dx, dy); // intentará una válida y saldrá
    return;
  }
}

/*function turnoCompuGallina() {
  const direcciones = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  for (let i = 0; i < gallinas.length; i++) {
    let g = gallinas[i];
    for (let [dx, dy] of direcciones) {
      const newX = g.x + dx * cellSize;
      const newY = g.y + dy * cellSize;
      const esDiagonal = dx !== 0 && dy !== 0;

      if (
        esNodoValido(newX, newY) &&
        estaLibre(newX, newY) &&
        (!esDiagonal || hayConexionVisual(g.x, g.y, newX, newY))
      ) {
        g.x = newX;
        g.y = newY;
        gallinaSeleccionada = i;
        return;
      }
    }
  }
}*/
//TURNO DE COMPUgallina


// 🎮 Selección de rol
function seleccionarRol(eleccion) {
  rolJugador = eleccion;
  rolCompu = (eleccion === "gallina") ? "coyote" : "gallina";
  document.getElementById("pantalla-inicial").style.display = "none";
  iniciarJuego();
}

function iniciarJuego() {
  coyote = { x: 200, y: 200, size: 10 };
  gallinas = [
    { x: 400, y: 0 }, { x: 400, y: 100 }, { x: 400, y: 200 },
    { x: 400, y: 300 }, { x: 400, y: 400 }, { x: 300, y: 0 },
    { x: 300, y: 100 }, { x: 300, y: 200 }, { x: 300, y: 300 },
    { x: 300, y: 400 }, { x: 200, y: 0 }, { x: 200, y: 400 }
  ];
  gallinaSeleccionada = 0;
  updateGame();
  cambiarTurno();
}

// 🎮 Controles por teclado
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp": intentaCapturaCoyote(0, -1); break;
    case "ArrowDown": intentaCapturaCoyote(0, 1); break;
    case "ArrowLeft": intentaCapturaCoyote(-1, 0); break;
    case "ArrowRight": intentaCapturaCoyote(1, 0); break;
    case "q": intentaCapturaCoyote(-1, -1); break;
    case "e": intentaCapturaCoyote(1, -1); break;
    case "z": intentaCapturaCoyote(-1, 1); break;
    case "c": intentaCapturaCoyote(1, 1); break;

    case "w": moverGallina(0, -1); break;
    case "s": moverGallina(0, 1); break;
    case "a": moverGallina(-1, 0); break;
    case "d": moverGallina(1, 0); break;
    case "r": moverGallina(-1, -1); break;
    case "t": moverGallina(1, -1); break;
    case "x": moverGallina(-1, 1); break;
    case "v": moverGallina(1, 1); break;

    case "n": cambiarGallina(); break;
  }
});