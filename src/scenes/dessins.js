/*
 * Dessins en canvas 2D, sans Three.js : la galerie du patrimoine et le jeu utilisent les mêmes.
 * Chaque dessin occupe un carré de 256 × 256.
 */
import { dessinerCheval } from './cheval.js';

export function line(g, a, b, c, d) { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

export function hut(g, x, y, s, wall, roof, door) {
  const wg = g.createLinearGradient(x - 50 * s, 0, x + 50 * s, 0);
  wg.addColorStop(0, shade(wall, -25)); wg.addColorStop(0.45, wall); wg.addColorStop(1, shade(wall, -35));
  g.fillStyle = wg; g.beginPath(); g.moveTo(x - 50 * s, y - 70 * s); g.lineTo(x + 50 * s, y - 70 * s); g.lineTo(x + 50 * s, y); g.ellipse(x, y, 50 * s, 8 * s, 0, 0, Math.PI); g.closePath(); g.fill();
  g.fillStyle = roof; g.beginPath(); g.moveTo(x - 64 * s, y - 60 * s); g.lineTo(x, y - 145 * s); g.lineTo(x + 64 * s, y - 60 * s); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 2 * s; for (let i = -5; i <= 5; i++) line(g, x, y - 145 * s, x + i * 12 * s, y - 60 * s);
  g.fillStyle = door; g.beginPath(); g.moveTo(x - 14 * s, y + 4 * s); g.lineTo(x - 14 * s, y - 32 * s); g.arc(x, y - 32 * s, 14 * s, Math.PI, 0); g.lineTo(x + 14 * s, y + 4 * s); g.fill();
}

export const DESSINS = {
  tambour(g) {
    g.fillStyle = '#7a3b1d'; g.beginPath(); g.moveTo(70, 60); g.lineTo(186, 60); g.lineTo(160, 140); g.lineTo(186, 230); g.lineTo(70, 230); g.lineTo(96, 140); g.closePath(); g.fill();
    g.strokeStyle = '#e9d8b4'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { line(g, 74 + i * 14, 62, 98 + i * 8, 140); line(g, 98 + i * 8, 140, 74 + i * 14, 228); }
    g.fillStyle = '#e9d8b4'; g.beginPath(); g.ellipse(128, 60, 58, 12, 0, 0, 7); g.fill();
    g.strokeStyle = '#3d2410'; g.lineWidth = 6; line(g, 200, 40, 160, 90);
  },
  jarre(g) {
    const gr = g.createRadialGradient(110, 130, 10, 128, 150, 110); gr.addColorStop(0, '#d0814a'); gr.addColorStop(1, '#7a3b1d');
    g.fillStyle = gr; g.beginPath(); g.ellipse(128, 160, 86, 80, 0, 0, 7); g.fill(); g.fillRect(96, 60, 64, 40);
    g.fillStyle = '#5a2a12'; g.beginPath(); g.ellipse(128, 60, 38, 10, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,230,190,.5)'; g.lineWidth = 4; g.beginPath(); g.arc(128, 160, 60, 3.6, 5.8); g.stroke();
  },
  defenses(g) {
    g.strokeStyle = '#f3ead2'; g.lineCap = 'round'; g.lineWidth = 26;
    g.beginPath(); g.moveTo(60, 230); g.quadraticCurveTo(70, 80, 150, 40); g.stroke();
    g.beginPath(); g.moveTo(130, 232); g.quadraticCurveTo(140, 100, 210, 70); g.stroke();
    g.strokeStyle = '#5a3416'; g.lineWidth = 10; line(g, 40, 236, 220, 236);
  },
  etalon(g) {
    g.save(); g.scale(0.5, 0.5); g.translate(0, 110); dessinerCheval(g, 0, false); g.restore();
  },
  case(g) { hut(g, 128, 226, 1.4, '#c4793f', '#e0bd6a', '#3a2012'); },
  fani(g) {
    const bandes = ['#2f3f8f', '#e9e1cf', '#b8322a', '#e0a43a', '#1a1209', '#e9e1cf', '#2f3f8f', '#b8322a'];
    g.save(); g.beginPath(); g.moveTo(44, 28); g.lineTo(212, 28); g.lineTo(226, 228); g.lineTo(30, 228); g.closePath(); g.clip();
    for (let i = 0; i < 16; i++) { g.fillStyle = bandes[i % bandes.length]; g.fillRect(i * 16, 20, 16, 220); }
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let x = 48; x < 256; x += 48) line(g, x, 20, x, 240);
    g.restore();
    g.strokeStyle = '#3d2410'; g.lineWidth = 4; g.strokeRect(44, 28, 168, 3);
  },
  bogolan(g) {
    g.fillStyle = '#2b1c10'; g.fillRect(28, 28, 200, 200);
    g.strokeStyle = '#efe3c6'; g.fillStyle = '#efe3c6'; g.lineWidth = 6;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const px = 53 + x * 50, py = 53 + y * 50;
      if ((x + y) % 2) { g.beginPath(); g.moveTo(px - 16, py); g.lineTo(px, py - 16); g.lineTo(px + 16, py); g.lineTo(px, py + 16); g.closePath(); g.stroke(); } else { line(g, px - 16, py - 12, px + 16, py - 12); line(g, px - 16, py, px + 16, py); line(g, px - 16, py + 12, px + 16, py + 12); }
    }
  },
  balafon(g) {
    g.strokeStyle = '#5a3416'; g.lineWidth = 8; line(g, 26, 110, 230, 110); line(g, 26, 150, 230, 150);
    for (let i = 0; i < 9; i++) {
      const x = 36 + i * 23;
      g.fillStyle = '#c98b3c'; g.beginPath(); g.arc(x + 7, 178 + i, 11 + (8 - i) * 1.1, 0, 7); g.fill();
      g.fillStyle = '#7a3b1d'; g.fillRect(x, 92 + i * 2, 16, 76 - i * 4);
      g.fillStyle = 'rgba(255,230,190,.3)'; g.fillRect(x + 2, 96 + i * 2, 4, 66 - i * 4);
    }
  },
  calebasse(g) {
    const gr = g.createRadialGradient(100, 110, 10, 128, 140, 110); gr.addColorStop(0, '#e6bd6a'); gr.addColorStop(1, '#a56c28');
    g.fillStyle = gr; g.beginPath(); g.arc(128, 110, 96, 0.04 * Math.PI, 0.96 * Math.PI); g.closePath(); g.fill();
    g.fillStyle = '#5a3416'; g.beginPath(); g.ellipse(128, 118, 92, 16, 0, 0, 7); g.fill();
    g.strokeStyle = '#7a3b1d'; g.lineWidth = 4; for (let i = -3; i <= 3; i++) line(g, 128 + i * 26, 142, 128 + i * 20, 188);
  },
  chapeau(g) {
    g.fillStyle = '#d9b25e'; g.beginPath(); g.ellipse(128, 176, 110, 26, 0, 0, 7); g.fill();
    g.fillStyle = '#c9a15a'; g.beginPath(); g.moveTo(58, 170); g.lineTo(128, 44); g.lineTo(198, 170); g.closePath(); g.fill();
    g.strokeStyle = '#7a5a26'; g.lineWidth = 3; for (let i = -5; i <= 5; i++) line(g, 128, 46, 128 + i * 14, 170);
    g.fillStyle = '#7a3b1d'; g.fillRect(70, 152, 116, 14);
    g.fillStyle = '#e0a43a'; for (let x = 76; x < 180; x += 14) g.fillRect(x, 156, 7, 6);
    g.fillStyle = '#5a2a12'; g.beginPath(); g.arc(128, 44, 9, 0, 7); g.fill();
  },
  to(g) {
    g.fillStyle = '#a56c28'; g.beginPath(); g.ellipse(128, 176, 106, 40, 0, 0, 7); g.fill();
    g.fillStyle = '#efe3c6'; g.beginPath(); g.moveTo(58, 166); g.quadraticCurveTo(70, 70, 128, 66); g.quadraticCurveTo(186, 70, 198, 166); g.closePath(); g.fill();
    g.fillStyle = 'rgba(0,0,0,.08)'; g.beginPath(); g.ellipse(160, 122, 22, 44, 0.2, 0, 7); g.fill();
    g.fillStyle = '#4f6b22'; g.beginPath(); g.ellipse(128, 176, 92, 22, 0, 0, Math.PI); g.fill();
  },
  soumbala(g) {
    const rng = [[80, 150], [128, 138], [176, 152], [104, 186], [152, 188], [128, 96]];
    rng.forEach(([x, y]) => {
      g.fillStyle = '#3d2410'; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill();
      g.fillStyle = '#5a3a1e'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(x - 18 + i * 6, y - 10 + (i % 3) * 9, 3, 0, 7); g.fill(); }
    });
  },
  dolo(g) {
    g.fillStyle = '#7a3b1d'; g.beginPath(); g.ellipse(100, 142, 62, 82, 0, 0, 7); g.fill(); g.fillRect(72, 46, 56, 26);
    g.fillStyle = '#5a2a12'; g.beginPath(); g.ellipse(100, 46, 30, 8, 0, 0, 7); g.fill();
    g.fillStyle = '#e6bd6a'; g.beginPath(); g.arc(190, 190, 46, 0, Math.PI); g.closePath(); g.fill();
    g.fillStyle = '#a0522d'; g.beginPath(); g.ellipse(190, 192, 44, 9, 0, 0, 7); g.fill();
  },
};

export function dessiner(canvas, nom) {
  const g = canvas.getContext('2d');
  const k = canvas.width / 256;
  g.save(); g.scale(k, k); DESSINS[nom](g); g.restore();
}
