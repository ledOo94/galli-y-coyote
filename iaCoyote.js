function turnoCompuCoyote() {
  const direcciones = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  let atacó = false;

  // 🦊 Primer ataque (busca gallina para devorar)
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
      atacó = true;
      break;
    }
  }

  // 🔁 Si atacó, busca otro ataque en cadena
  if (atacó) {
    setTimeout(() => {
      updateGame(); // actualiza tablero visual
      turnoCompuCoyote(); // ejecuta siguiente ataque
    }, 500);
    return;
  }

  // 🐾 Si no pudo devorar, intenta moverse a cualquier nodo válido
  for (let [dx, dy] of direcciones) {
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
      break;
    }
  }

  updateGame(); // actualiza tablero visual
}
