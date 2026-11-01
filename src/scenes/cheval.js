/* Le cheval, sur 512 × 384, en deux images pour le galop. Dessin pur, sans Three.js. */
function ligne(g, a, b, c, d) { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }

export function dessinerCheval(g, frame, rider) {
  const ink = '#1a1209', body = '#f1ece2'; g.lineCap = 'round'; g.lineJoin = 'round';
  const legs = frame === 0 ? [[175, 250, 160, 352], [205, 250, 214, 352], [325, 250, 312, 352], [355, 250, 370, 352]]
    : [[175, 250, 120, 318], [205, 250, 248, 334], [325, 250, 288, 334], [355, 250, 425, 306]];
  g.strokeStyle = ink; g.lineWidth = 18; legs.forEach((l) => ligne(g, ...l)); g.strokeStyle = body; g.lineWidth = 10; legs.forEach((l) => ligne(g, ...l));
  g.strokeStyle = '#2a1a10'; g.lineWidth = 14; g.beginPath(); g.moveTo(150, 205); g.quadraticCurveTo(100, 230, 92, frame ? 250 : 285); g.stroke();
  g.fillStyle = body; g.strokeStyle = ink; g.lineWidth = 6;
  g.beginPath(); g.ellipse(265, 222, 120, 52, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(345, 196); g.lineTo(398, 108); g.lineTo(428, 100); g.lineTo(472, 138); g.lineTo(462, 160); g.lineTo(420, 146); g.lineTo(386, 232); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(404, 106); g.lineTo(410, 80); g.lineTo(420, 102); g.fill(); g.stroke();
  g.fillStyle = ink; g.beginPath(); g.arc(430, 118, 4.5, 0, 7); g.fill();
  g.strokeStyle = '#2a1a10'; g.lineWidth = 9; for (let i = 0; i < 6; i++) ligne(g, 398 - i * 9, 110 + i * 16, 382 - i * 9, 116 + i * 16);
  if (rider) {
    g.fillStyle = '#b8322a'; g.fillRect(222, 170, 90, 30); g.fillStyle = '#e0a43a'; for (let x = 226; x < 310; x += 12) g.fillRect(x, 194, 6, 6);
    g.strokeStyle = ink; g.lineWidth = 9; ligne(g, 268, 182, 286, 246); ligne(g, 286, 246, 274, 268);
    g.fillStyle = '#b8322a'; g.beginPath(); g.moveTo(252, 104); g.lineTo(290, 104); g.lineTo(300, 186); g.lineTo(244, 186); g.closePath(); g.fill(); g.lineWidth = 4; g.stroke();
    g.lineWidth = 8; ligne(g, 290, 118, 340, 150); ligne(g, 340, 150, 396, 128);
    g.strokeStyle = '#6b4a2a'; g.lineWidth = 5; ligne(g, 240, 190, 330, 30); g.fillStyle = '#c9c9c9'; g.beginPath(); g.moveTo(338, 14); g.lineTo(336, 44); g.lineTo(322, 36); g.closePath(); g.fill();
    g.fillStyle = '#6b4329'; g.beginPath(); g.arc(272, 80, 25, 0, 7); g.fill(); g.strokeStyle = ink; g.lineWidth = 4; g.stroke();
    g.strokeStyle = '#a3201b'; g.lineWidth = 7; g.beginPath(); g.arc(272, 80, 25, 1.1 * Math.PI, 1.9 * Math.PI); g.stroke();
    g.strokeStyle = ink; g.lineWidth = 5; ligne(g, 248, 82, 222, 74 + frame * 10); ligne(g, 250, 92, 226, 92 + frame * 8);
  }
}
