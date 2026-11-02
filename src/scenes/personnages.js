/*
 * Personnages stickman en tenues du terroir, dessinés en canvas 2D sur 256 × 512.
 * Sans Three.js : le portrait de la boîte de dialogue et l'écran d'accueil s'en servent aussi.
 */
import { line, shade } from './dessins.js';

export const STYLES = {
  roi: { skin: '#5a3825', tunic: '#2f3f8f', stripes: ['#2f3f8f', '#e9e1cf', '#2f3f8f', '#1d2a66'], wide: true, long: true, head: 'bonnet', acc: 'baton' },
  guerriere: { skin: '#6b4329', tunic: '#b8322a', stripes: ['#b8322a', '#e0a43a', '#1a1209', '#b8322a'], pants: '#3a2416', head: 'bandeau', acc: 'lance' },
  chasseur: { skin: '#4e3020', tunic: '#7a5a33', dots: '#2a1a0c', pants: '#5a3d1c', head: 'chapeau', acc: 'arc' },
  enfant: { skin: '#6b4329', tunic: '#e0a43a', stripes: ['#e0a43a', '#fbf1dc'], child: true },
  griot: { skin: '#5a3825', tunic: '#e9e1cf', stripes: ['#e9e1cf', '#8a5a12', '#e9e1cf', '#7a3b1d'], wide: true, long: true, head: 'bonnet', bonnet: '#8a5a12', acc: 'baton' },
  marchande: { skin: '#6b4329', tunic: '#1f6f6b', stripes: ['#1f6f6b', '#e0a43a', '#1f6f6b', '#fbf1dc'], long: true, wide: true, head: 'foulard' },
  lievre: { skin: '#b9a58a', tunic: '#c9652a', stripes: ['#c9652a', '#e9c079'], pants: '#6a4a1e', head: 'lievre' },
  hyene: { skin: '#8f7a58', tunic: '#5b5140', dots: '#2a2418', pants: '#3e3626', wide: true, head: 'hyene' },
  femme: { skin: '#6b4329', tunic: '#8f3a2a', stripes: ['#8f3a2a', '#e0a43a', '#2f3f8f'], long: true, wide: true, head: 'foulard' },
  jeune_fille: { skin: '#70482c', tunic: '#c9652a', stripes: ['#c9652a', '#fbf1dc'], long: true, head: 'tresses' },
  vieille: { skin: '#5a3825', tunic: '#5b3a6b', stripes: ['#5b3a6b', '#d9c9a8'], long: true, wide: true, head: 'foulard', foulard: '#e9e1cf', acc: 'baton' },
  griotte: { skin: '#5a3825', tunic: '#e9e1cf', stripes: ['#e9e1cf', '#a3201b', '#e9e1cf', '#e0a43a'], long: true, wide: true, head: 'tresses' },
  reine: { skin: '#5a3825', tunic: '#7a1f4a', stripes: ['#7a1f4a', '#e2b33c', '#7a1f4a', '#fbf1dc'], long: true, wide: true, head: 'couronne' },
  guerrier: { skin: '#5a3825', tunic: '#8a2a1b', stripes: ['#8a2a1b', '#1a1209'], pants: '#3a2416', head: 'bandeau', acc: 'lance' },
  ancien: { skin: '#4e3020', tunic: '#d9d2c0', stripes: ['#d9d2c0', '#6a6a6a'], long: true, wide: true, head: 'bonnet', bonnet: '#6a6a6a', acc: 'baton', barbe: true },
  paysan: { skin: '#5a3825', tunic: '#a8743c', stripes: ['#a8743c', '#6a4a1e'], pants: '#6a4a1e', head: 'chapeau' },
  jeune: { skin: '#6b4329', tunic: '#2c6e49', stripes: ['#2c6e49', '#e9e1cf'], pants: '#3a2416' },
  forgeron: { skin: '#3f261a', tunic: '#3e3626', pants: '#2a2418', wide: true, acc: 'marteau' },
  cavalier: { skin: '#5a3825', tunic: '#b8622a', stripes: ['#b8622a', '#3a2416'], pants: '#3a2416', head: 'turban', turban: '#3a2416', acc: 'lance' },
  garde: { skin: '#4e3020', tunic: '#1d2a66', pants: '#141c47', head: 'chechia', acc: 'lance' },
  commandant: { skin: '#e4c7a8', tunic: '#d8cfa8', pants: '#b8ae84', head: 'casque' },
  explorateur: { skin: '#e4c7a8', tunic: '#9a8450', pants: '#6a5a2c', head: 'casque', acc: 'baton' },
  marabout: { skin: '#5a3825', tunic: '#f0ead8', long: true, wide: true, head: 'turban', turban: '#f8f4e8', barbe: true },
  devin: { skin: '#4e3020', tunic: '#47306b', dots: '#e0a43a', long: true, wide: true, head: 'bonnet', bonnet: '#e0a43a', acc: 'baton' },
  genie: { skin: '#3f6f9a', tunic: '#264a7a', dots: '#8fd0e8', head: 'genie', yeux: '#ffe27a' },
  esprit: { skin: '#7a7f86', tunic: '#5a5f66', dots: '#3e4248', wide: true, head: 'genie', yeux: '#ffb35a' },
  createur: { skin: '#c99a3a', tunic: '#f2d774', stripes: ['#f2d774', '#fff6d0'], long: true, wide: true, head: 'halo' },
  masque: { skin: '#6b4a2a', tunic: '#4f7f2a', feuilles: true, long: true, wide: true, head: 'masque' },
  gazelle: { skin: '#c9975a', tunic: '#c9975a', pants: '#a87a42', head: 'gazelle' },
  cameleon: { skin: '#5f9a3a', tunic: '#4f8a2f', dots: '#a4c94a', pants: '#3f6f2a', head: 'cameleon' },
  elephant: { skin: '#8a8f96', tunic: '#7a7f86', pants: '#6a6f76', wide: true, head: 'elephant' },
  crapaud: { skin: '#7f9a3a', tunic: '#6f8a32', dots: '#4f6321', pants: '#566b26', wide: true, head: 'crapaud' },
  crocodile: { skin: '#4f7a4a', tunic: '#3f6a3e', dots: '#2a4a2c', pants: '#2f5a3a', head: 'crocodile' },
  araignee: { skin: '#3a2a3a', tunic: '#2a1f2a', dots: '#7a5a7a', pattes: true, head: 'araignee' },
  serpent: { skin: '#8f8f3a', tunic: '#7a7a2a', dots: '#3e3e12', head: 'serpent' },
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
  if (o.pattes) { g.strokeStyle = o.skin; g.lineWidth = 6; [210, 240, 270, 300].forEach((y) => { line(g, 92, y, 22, y - 44); line(g, 22, y - 44, 12, y + 10); line(g, 164, y, 234, y - 44); line(g, 234, y - 44, 244, y + 10); }); }
  if (o.head === 'gazelle') { g.strokeStyle = '#2a1a0c'; g.lineWidth = 8; [[108, -1], [148, 1]].forEach(([x, s]) => { g.beginPath(); g.moveTo(x, 52); g.quadraticCurveTo(x + s * 2, 18, x + s * 22, 0); g.stroke(); }); g.fillStyle = o.skin; g.strokeStyle = ink; g.lineWidth = 4; [[76, 72, -0.5], [180, 72, 0.5]].forEach(([x, y, a]) => { g.beginPath(); g.ellipse(x, y, 22, 10, a, 0, 7); g.fill(); g.stroke(); }); }
  if (o.head === 'elephant') { g.fillStyle = shade(o.skin, -14); g.strokeStyle = ink; g.lineWidth = 5; [[62, 94], [194, 94]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 42, 54, 0, 0, 7); g.fill(); g.stroke(); }); }
  if (o.head === 'cameleon') { g.fillStyle = shade(o.skin, -28); g.beginPath(); g.moveTo(92, 66); g.quadraticCurveTo(128, 8, 164, 66); g.closePath(); g.fill(); }
  if (o.head === 'serpent') { g.fillStyle = shade(o.skin, -20); g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.ellipse(128, 96, 66, 62, 0, 0, 7); g.fill(); g.stroke(); }
  if (o.head === 'genie') { g.fillStyle = shade(o.skin, -26); [[84, 58, 62, 8], [128, 44, 128, -4], [172, 58, 194, 8]].forEach(([x, y, xp, yp]) => { g.beginPath(); g.moveTo(x - 13, y + 10); g.lineTo(xp, yp); g.lineTo(x + 13, y + 10); g.closePath(); g.fill(); }); }
  if (o.head === 'halo') { const h = g.createRadialGradient(128, 90, 34, 128, 90, 92); h.addColorStop(0, 'rgba(255,225,120,.95)'); h.addColorStop(1, 'rgba(255,225,120,0)'); g.fillStyle = h; g.beginPath(); g.arc(128, 90, 92, 0, 7); g.fill(); }
  if (o.head === 'tresses') { g.strokeStyle = ink; g.lineWidth = 8; [-38, -30, 30, 38].forEach((d) => line(g, 128 + d, 86, 128 + d * 1.1, 146)); }
  if (o.head === 'hyene') {
    [[92, 54], [164, 54]].forEach(([x, y]) => { g.fillStyle = o.skin; g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 18, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#3e3626'; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); });
  }
  g.fillStyle = o.skin; g.beginPath(); g.arc(128, 90, 44, 0, 7); g.fill(); g.strokeStyle = ink; g.lineWidth = 6; g.stroke();
  if (o.head === 'hyene') {
    g.fillStyle = '#3e3626'; [[100, 68], [152, 66], [90, 100], [166, 100], [128, 56]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); });
    g.fillStyle = '#463a28'; g.beginPath(); g.ellipse(128, 108, 26, 20, 0, 0, 7); g.fill();
  }
  if (o.feuilles) { for (let y = 130; y < 450; y += 15) for (let x = 54; x < 204; x += 16) { const sens = (x + y) % 3 - 1; g.fillStyle = (x * y) % 5 < 2 ? '#3f6b22' : (x + y) % 2 ? '#5f8f2f' : '#7a9f3a'; g.beginPath(); g.ellipse(x, y, 7, 15, sens * 0.5, 0, 7); g.fill(); } }
  if (o.head === 'masque') { g.fillStyle = '#3d2410'; g.fillRect(90, 54, 76, 82); g.fillStyle = '#e9e1cf'; g.fillRect(90, 74, 76, 8); g.fillRect(90, 106, 76, 8); g.fillStyle = '#a3201b'; g.fillRect(122, 54, 12, 82); for (let x = 74; x < 186; x += 14) { g.fillStyle = x % 28 ? '#5f8f2f' : '#3f6b22'; g.beginPath(); g.ellipse(x, 44, 8, 22, (x - 128) / 90, 0, 7); g.fill(); } }
  if (o.head === 'crocodile') { g.fillStyle = shade(o.skin, -14); g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.roundRect(92, 96, 72, 36, 14); g.fill(); g.stroke(); g.fillStyle = '#fbf1dc'; for (let x = 100; x < 160; x += 12) { g.beginPath(); g.moveTo(x, 118); g.lineTo(x + 6, 128); g.lineTo(x + 12, 118); g.closePath(); g.fill(); } }
  if (o.head === 'gazelle') { g.fillStyle = '#efe0c0'; g.beginPath(); g.ellipse(128, 108, 22, 18, 0, 0, 7); g.fill(); g.fillStyle = '#2a1a0c'; g.beginPath(); g.ellipse(128, 100, 7, 5, 0, 0, 7); g.fill(); }
  if (o.head === 'crapaud') { g.fillStyle = o.skin; g.strokeStyle = ink; g.lineWidth = 4; [[100, 60], [156, 60]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 19, 0, 7); g.fill(); g.stroke(); }); g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.moveTo(90, 106); g.quadraticCurveTo(128, 122, 166, 106); g.stroke(); }
  if (o.head === 'araignee') { g.fillStyle = '#d9d2c0'; [[100, 72], [156, 72], [116, 66], [140, 66]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }); }
  const yeuxY = o.head === 'crapaud' ? 60 : 84, yeuxX = o.head === 'crapaud' ? [100, 156] : [111, 145];
  g.fillStyle = o.yeux || '#fff'; yeuxX.map((x) => [x, yeuxY]).forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 8, 7, 0, 0, 7); g.fill(); });
  g.fillStyle = ink; yeuxX.map((x) => [x + 2, yeuxY + 1]).forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); });
  if (o.head === 'lievre') {
    g.fillStyle = '#7a3b3b'; g.beginPath(); g.moveTo(121, 98); g.lineTo(135, 98); g.lineTo(128, 106); g.closePath(); g.fill();
    g.strokeStyle = ink; g.lineWidth = 2; line(g, 100, 104, 74, 98); line(g, 100, 110, 74, 114); line(g, 156, 104, 182, 98); line(g, 156, 110, 182, 114);
  }
  if (o.barbe) { g.fillStyle = '#e9e1cf'; g.beginPath(); g.moveTo(98, 108); g.quadraticCurveTo(128, 170, 158, 108); g.quadraticCurveTo(128, 124, 98, 108); g.fill(); }
  if (o.head === 'elephant') { g.strokeStyle = shade(o.skin, -22); g.lineWidth = 22; g.beginPath(); g.moveTo(128, 100); g.quadraticCurveTo(122, 150, 150, 186); g.stroke(); g.strokeStyle = '#fbf1dc'; g.lineWidth = 7; line(g, 104, 118, 94, 142); line(g, 152, 118, 162, 142); }
  if (mouth) { g.fillStyle = '#5b0f12'; g.beginPath(); g.ellipse(128, 113, 11, 9, 0, 0, 7); g.fill(); } else { g.strokeStyle = o.head === 'hyene' ? '#efe3c6' : ink; g.lineWidth = 4; g.beginPath(); g.arc(128, 102, 12, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke(); }
  if (o.head === 'bonnet') { g.fillStyle = o.bonnet || '#a3201b'; g.beginPath(); g.moveTo(84, 72); g.quadraticCurveTo(90, 18, 128, 16); g.quadraticCurveTo(166, 18, 172, 72); g.closePath(); g.fill(); g.fillStyle = '#e2b33c'; g.fillRect(84, 62, 88, 10); }
  if (o.head === 'bandeau') { g.strokeStyle = '#a3201b'; g.lineWidth = 10; g.beginPath(); g.arc(128, 90, 44, 1.12 * Math.PI, 1.88 * Math.PI); g.stroke(); g.fillStyle = '#e0a43a'; g.beginPath(); g.arc(128, 48, 6, 0, 7); g.fill(); }
  if (o.head === 'chapeau') { g.fillStyle = '#c9a15a'; g.beginPath(); g.moveTo(54, 66); g.lineTo(202, 66); g.lineTo(128, 6); g.closePath(); g.fill(); g.strokeStyle = '#7a5a26'; g.lineWidth = 3; for (let i = -4; i <= 4; i++) line(g, 128, 8, 128 + i * 17, 66); g.fillStyle = '#5a3416'; g.fillRect(84, 60, 88, 8); }
  if (o.head === 'turban') { g.fillStyle = o.turban || '#efe3c6'; g.beginPath(); g.ellipse(128, 56, 50, 28, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; [-14, 0, 14].forEach((d) => { g.beginPath(); g.moveTo(80, 56 + d); g.quadraticCurveTo(128, 34 + d, 176, 56 + d); g.stroke(); }); }
  if (o.head === 'chechia') { g.fillStyle = '#a3201b'; g.fillRect(96, 26, 64, 34); g.fillStyle = '#1a1209'; g.fillRect(150, 26, 6, 40); }
  if (o.head === 'casque') { g.fillStyle = '#e9e1c8'; g.beginPath(); g.ellipse(128, 58, 62, 12, 0, 0, 7); g.fill(); g.beginPath(); g.arc(128, 58, 44, Math.PI, 0); g.fill(); g.strokeStyle = '#a89a70'; g.lineWidth = 3; g.stroke(); }
  if (o.head === 'couronne') { g.fillStyle = '#e2b33c'; g.beginPath(); g.moveTo(88, 62); g.lineTo(88, 26); g.lineTo(108, 46); g.lineTo(128, 20); g.lineTo(148, 46); g.lineTo(168, 26); g.lineTo(168, 62); g.closePath(); g.fill(); }
  if (o.head === 'tresses') { g.fillStyle = ink; g.beginPath(); g.arc(128, 80, 45, Math.PI, 0); g.fill(); }
  if (o.acc === 'marteau') { g.strokeStyle = '#5a3416'; g.lineWidth = 8; line(g, 184, 322, 214, 244); g.fillStyle = '#4a4a50'; g.fillRect(196, 226, 38, 24); }
  if (o.head === 'foulard') { g.fillStyle = o.foulard || '#e0a43a'; g.beginPath(); g.moveTo(82, 78); g.quadraticCurveTo(92, 26, 128, 24); g.quadraticCurveTo(164, 26, 174, 78); g.quadraticCurveTo(128, 56, 82, 78); g.fill(); g.fillStyle = '#a3201b'; g.beginPath(); g.arc(172, 50, 14, 0, 7); g.fill(); }
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
