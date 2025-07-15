function estaEnLineaDeVisionDelCoyote(g) {
  return (
    g.y === coyote.y ||
    g.x === coyote.x ||
    Math.abs(g.x - coyote.x) === Math.abs(g.y - coyote.y)
  );
}
function turnoCompuGallina() {
  memoriaMovimientosGallinas = [];

  // 🥇 Elegir la gallina líder más cercana al coyote
  let indiceLider = -1;
  let menorDistancia = Infinity;

  for (let i = 0; i < gallinas.length; i++) {
    const g = gallinas[i];
    const dist = Math.hypot(g.x - coyote.x, g.y - coyote.y);
    if (dist < menorDistancia) {
      menorDistancia = dist;
      indiceLider = i;
    }
  }

  const gallinaLider = gallinas[indiceLider];

  // ✅ Mover gallina líder si está en línea de visión
  if (estaEnLineaDeVisionDelCoyote(gallinaLider)) {
    const mov = buscarMovimientoSeguro(gallinaLider);
    if (mov) {
      gallinaLider.x = mov.x;
      gallinaLider.y = mov.y;
      gallinaSeleccionada = indiceLider;
    }
  }

  // 🐥 Elegir máximo 2 compañeras cercanas a la líder
  let compañeras = gallinas.filter((g, idx) => {
    return (
      idx !== indiceLider &&
      Math.abs(g.x - gallinaLider.x) <= cellSize * 2 &&
      Math.abs(g.y - gallinaLider.y) <= cellSize * 2 &&
      estaEnLineaDeVisionDelCoyote(g)
    );
  }).slice(0, 2); // máximo dos

  /*// 🎯 Mover compañeras también si tienen jugada
  for (const g of compañeras) {
    const mov = buscarMovimientoSeguro(g);
    if (mov) {
      g.x = mov.x;
      g.y = mov.y;
    }
  }*/

  // 🏆 Verificar si se encerró al coyote
  if (esCoyoteEncerrado()) {
    setTimeout(() => {
      alert("🐔 ¡Las gallinas han ganado!");
      terminarPartida();
    }, 800);
  }
}
function buscarMovimientoSeguro(g) {
  const direcciones = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  for (let [dx, dy] of direcciones) {
    const newX = g.x + dx * cellSize;
    const newY = g.y + dy * cellSize;
    const clave = `${newX},${newY}`;
    const esDiagonal = dx !== 0 && dy !== 0;

    if (
      esNodoValido(newX, newY) &&
      estaLibre(newX, newY) &&
      (!esDiagonal || hayConexionVisual(g.x, g.y, newX, newY)) &&
      !memoriaMovimientosGallinas.includes(clave)
    ) {
      memoriaMovimientosGallinas.push(clave);
      return { x: newX, y: newY };
    }
  }

  return null;
}

function esCoyoteEncerrado() {
  const direcciones = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  for (let [dx, dy] of direcciones) {
    const x = coyote.x + dx * cellSize;
    const y = coyote.y + dy * cellSize;
    const esDiagonal = dx !== 0 && dy !== 0;

    if (
      esNodoValido(x, y) &&
      estaLibre(x, y) &&
      (!esDiagonal || hayConexionVisual(coyote.x, coyote.y, x, y))
    ) {
      return false;
    }
  }

  return true;
}
