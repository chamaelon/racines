/*
 * Personnages stickman en tenues du terroir, dessinés en canvas 2D sur 256 × 512.
 * Sans Three.js : le portrait de la boîte de dialogue et l'écran d'accueil s'en servent aussi.
 */
import { line } from './dessins.js';

export const STYLES = {
  roi: { skin: '#5a3825', tunic: '#2f3f8f', stripes: ['#2f3f8f', '#e9e1cf', '#2f3f8f', '#1d2a66'], wide: true, long: true, head: 'bonnet', acc: 'baton' },
  guerriere: { skin: '#6b4329', tunic: '#b8322a', stripes: ['#b8322a', '#e0a43a', '#1a1209', '#b8322a'], pants: '#3a2416', head: 'bandeau', acc: 'lance' },
  chasseur: { skin: '#4e3020', tunic: '#7a5a33', dots: '#2a1a0c', pants: '#5a3d1c', head: 'chapeau', acc: 'arc' },
  enfant: { skin: '#6b4329', tunic: '#e0a43a', stripes: ['#e0a43a', '#fbf1dc'], child: true },
  griot: { skin: '#5a3825', tunic: '#e9e1cf', stripes: ['#e9e1cf', '#8a5a12', '#e9e1cf', '#7a3b1d'], wide: true, long: true, head: 'bonnet', bonnet: '#8a5a12', acc: 'baton' },
  marchande: { skin: '#6b4329', tunic: '#1f6f6b', stripes: ['#1f6f6b', '#e0a43a', '#1f6f6b', '#fbf1dc'], long: true, wide: true, head: 'foulard' },
  lievre: { skin: '#b9a58a', tunic: '#c9652a', stripes: ['#c9652a', '#e9c079'], pants: '#6a4a1e', head: 'lievre' },
  hyene: { skin: '#8f7a58', tunic: '#5b5140', dots: '#2a2418', pants: '#3e3626', wide: true, head: 'hyene' },
};

export function dessinerPersonnage(g, o, mouth) {
  const ink = '#1a1209'; g.lineCap = 'round'; g.lineJoin = 'round';
  if (o.child) { g.translate(128 * (1 - 0.62), 512 * (1 - 0.62)); g.scale(0.62, 0.62); }
  g.strokeStyle = ink; g.lineWidth = 11;
  line(g, 114, 330, 100, 488); line(g, 142, 330, 156, 488); line(g, 100, 488, 84, 494); line(g, 156, 488, 172, 494);
  if (o.pants) { g.strokeStyle = o.pants; g.lineWidth = 22; line(g, 114, 336, 105, 440); line(g, 142, 336, 151, 440); }
  if (o.acc === 'arc') { g.strokeStyle = '#5a3416'; g.lineWidth = 7; g.beginPath(); g.arc(150, 230, 95, -1.1, 1.1); g.stroke(); g.strokeStyle = '#d8cbb0'; g.lineWidth = 2; line(g, 150 + 95 * Math.cos(-1.1), 230 + 95 * Math.sin(-1.1), 150 + 95 * Math.cos(1.1), 230 + 95 * Math.sin(1.1)); }
  g.strokeStyle = ink; g.lineWidth = 10; line(g, 96, 160, 72, 250); line(g, 160, 160, 184, 250);
  const bot = o.long ? 440 : 345, half = o.wide ? 68 : 50;
  g.beginPath(); g.moveTo(90, 148); g.lineTo(166, 148); g.lineTo(128 + half, bot); g.lineTo(128 - half, bot); g.closePath();
  g.fillStyle = o.tunic; g.fill(); g.save(); g.clip();
  if (o.stripes) for (let x = 40, i = 0; x < 230; x += 12, i++) { g.fillStyle = o.stripes[i % o.stripes.length]; g.fillRect(x, 140, 6, 320); }
  if (o.dots) { g.fillStyle = o.dots; for (let y = 160; y < bot; y += 22) for (let x = 60; x < 200; x += 22) { g.beginPath(); g.arc(x + (y / 22 % 2) * 11, y, 3.5, 0, 7); g.fill(); } }
  g.restore(); g.strokeStyle = ink; g.lineWidth = 5; g.stroke();
  g.lineWidth = 10; line(g, 72, 250, 76, 318); line(g, 184, 250, 180, 318);
  g.fillStyle = o.skin; [[76, 322], [180, 322]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); });
  if (o.acc === 'lance') { g.strokeStyle = '#6b4a2a'; g.lineWidth = 6; line(g, 182, 470, 202, 30); g.fillStyle = '#c9c9c9'; g.beginPath(); g.moveTo(202, 8); g.lineTo(212, 48); g.lineTo(193, 46); g.closePath(); g.fill(); }
  if (o.acc === 'baton') { g.strokeStyle = '#3d2410'; g.lineWidth = 7; line(g, 76, 480, 66, 220); g.fillStyle = '#e2b33c'; g.beginPath(); g.arc(66, 214, 10, 0, 7); g.fill(); }
  g.strokeStyle = ink; g.lineWidth = 9; line(g, 128, 128, 128, 150);
  if (o.head === 'bandeau') { g.strokeStyle = ink; g.lineWidth = 7; [-36, -26, 26, 36].forEach((d) => line(g, 128 + d, 90, 128 + d * 1.15, 150)); }
  // Oreilles dessinées derrière la tête
  if (o.head === 'lievre') {
    [[106, -0.18], [150, 0.18]].forEach(([x, a]) => {
      g.save(); g.translate(x, 56); g.rotate(a);
      g.fillStyle = o.skin; g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.ellipse(0, -44, 13, 46, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#e9b6a0'; g.beginPath(); g.ellipse(0, -44, 6, 34, 0, 0, 7); g.fill();
      g.restore();
    });
  }
  if (o.head === 'hyene') {
    [[92, 54], [164, 54]].forEach(([x, y]) => { g.fillStyle = o.skin; g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#3e3626'; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); });
  }
  g.fillStyle = o.skin; g.beginPath(); g.arc(128, 90, 44, 0, 7); g.fill(); g.strokeStyle = ink; g.lineWidth = 6; g.stroke();
  if (o.head === 'hyene') {
    g.fillStyle = '#3e3626'; [[100, 68], [152, 66], [90, 100], [166, 100], [128, 56]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); });
    g.fillStyle = '#463a28'; g.beginPath(); g.ellipse(128, 108, 26, 20, 0, 0, 7); g.fill();
  }
  g.fillStyle = '#fff'; [[111, 84], [145, 84]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 8, 7, 0, 0, 7); g.fill(); });
  g.fillStyle = ink; [[113, 85], [147, 85]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); });
  if (o.head === 'lievre') {
    g.fillStyle = '#7a3b3b'; g.beginPath(); g.moveTo(121, 98); g.lineTo(135, 98); g.lineTo(128, 106); g.closePath(); g.fill();
    g.strokeStyle = ink; g.lineWidth = 2; line(g, 100, 104, 74, 98); line(g, 100, 110, 74, 114); line(g, 156, 104, 182, 98); line(g, 156, 110, 182, 114);
  }
  if (mouth) { g.fillStyle = '#5b0f12'; g.beginPath(); g.ellipse(128, 113, 11, 9, 0, 0, 7); g.fill(); } else { g.strokeStyle = o.head === 'hyene' ? '#efe3c6' : ink; g.lineWidth = 4; g.beginPath(); g.arc(128, 102, 12, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); }
  if (o.head === 'bonnet') { g.fillStyle = o.bonnet || '#a3201b'; g.beginPath(); g.moveTo(84, 72); g.quadraticCurveTo(90, 18, 128, 16); g.quadraticCurveTo(166, 18, 172, 72); g.closePath(); g.fill(); g.fillStyle = '#e2b33c'; g.fillRect(84, 62, 88, 10); }
  if (o.head === 'bandeau') { g.strokeStyle = '#a3201b'; g.lineWidth = 10; g.beginPath(); g.arc(128, 90, 44, 1.12 * Math.PI, 1.88 * Math.PI); g.stroke(); g.fillStyle = '#e0a43a'; g.beginPath(); g.arc(128, 48, 6, 0, 7); g.fill(); }
  if (o.head === 'chapeau') { g.fillStyle = '#c9a15a'; g.beginPath(); g.moveTo(54, 66); g.lineTo(202, 66); g.lineTo(128, 6); g.closePath(); g.fill(); g.strokeStyle = '#7a5a26'; g.lineWidth = 3; for (let i = -4; i <= 4; i++) line(g, 128, 8, 128 + i * 17, 66); g.fillStyle = '#5a3416'; g.fillRect(84, 60, 88, 8); }
  if (o.head === 'foulard') { g.fillStyle = '#e0a43a'; g.beginPath(); g.moveTo(82, 78); g.quadraticCurveTo(92, 26, 128, 24); g.quadraticCurveTo(164, 26, 174, 78); g.quadraticCurveTo(128, 56, 82, 78); g.fill(); g.fillStyle = '#a3201b'; g.beginPath(); g.arc(172, 50, 14, 0, 7); g.fill(); }
}

// Petit portrait carré : le haut du personnage, cadré sur le visage.
export function dessinerPortrait(canvas, style) {
  const st = STYLES[style]; if (!st) return;
  const g = canvas.getContext('2d');
  const k = canvas.width / 170;
  g.save(); g.scale(k, k); g.translate(-43, st.head === 'lievre' ? 12 : 0);
  dessinerPersonnage(g, { ...st, child: false }, false);
  g.restore();
}
