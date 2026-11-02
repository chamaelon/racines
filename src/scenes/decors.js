/*
 * Les décors du théâtre de papier : des plans dessinés en canvas, étagés en profondeur.
 * Réutilisables d'une histoire à l'autre : la distribution des personnages vient du fichier de l'histoire.
 */
import * as THREE from 'three';
import { dessinerCheval } from './cheval.js';
import { hut, line, shade } from './dessins.js';

export const GROUND = -2.6;

function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function makeTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace; return t;
}
export function plane(tex, w, h, x, y, z) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.position.set(x, y, z); m.renderOrder = Math.round(z * 10) + 1000; return m;
}

function skyTex(top, bot, o = {}) {
  return makeTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bot);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(o.seed || 3);
    if (o.stars) for (let i = 0; i < 350; i++) { g.fillStyle = `rgba(255,255,240,${0.2 + r() * 0.8})`; const s = r() * 2 + 0.6; g.fillRect(r() * w, r() * h * 0.75, s, s); }
    if (o.sun) {
      const [x, y, rad, glow, disc] = o.sun;
      const sg = g.createRadialGradient(x * w, y * h, 0, x * w, y * h, rad * 4); sg.addColorStop(0, glow); sg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sg; g.fillRect(0, 0, w, h); g.fillStyle = disc; g.beginPath(); g.arc(x * w, y * h, rad, 0, 7); g.fill();
    }
    if (o.clouds) for (let i = 0; i < 7; i++) {
      g.fillStyle = o.clouds; const cx = r() * w, cy = h * (0.15 + r() * 0.35);
      for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(cx + k * 26 - 50, cy + Math.sin(k) * 6, 40 + r() * 20, 14 + r() * 8, 0, 0, 7); g.fill(); }
    }
  });
}
function hillsTex(col, seed, base = 0.5, amp = 0.18, o = {}) {
  return makeTex(2048, 512, (g, w, h) => {
    const r = rng(seed), p = [r() * 6, r() * 6, r() * 6];
    const Y = (x) => { const t = x / w * Math.PI * 2; return h * (base - amp * (Math.sin(t * 2 + p[0]) * 0.5 + Math.sin(t * 5 + p[1]) * 0.3 + Math.sin(t * 11 + p[2]) * 0.2)); };
    g.fillStyle = col; g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) g.lineTo(x, Y(x));
    g.lineTo(w, h); g.fill();
    if (o.trees) for (let i = 0; i < o.trees; i++) { const x = r() * w, s = 0.25 + r() * 0.3; baobab(g, x, Y(x) + 6, s, col, null); }
  });
}
function baobab(g, x, y, s, col, leaf) {
  g.fillStyle = col; g.beginPath(); g.moveTo(x - 34 * s, y);
  g.quadraticCurveTo(x - 24 * s, y - 90 * s, x - 18 * s, y - 150 * s); g.lineTo(x + 18 * s, y - 150 * s);
  g.quadraticCurveTo(x + 24 * s, y - 90 * s, x + 34 * s, y); g.fill();
  g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = 11 * s;
  for (let i = -3; i <= 3; i++) line(g, x + i * 5 * s, y - 145 * s, x + i * 24 * s, y - (180 + (i % 2 ? 22 : 0)) * s);
  if (leaf) { g.fillStyle = leaf; for (let i = -3; i <= 3; i++) { g.beginPath(); g.ellipse(x + i * 24 * s, y - (186 + (i % 2 ? 22 : 0)) * s, 16 * s, 10 * s, 0, 0, 7); g.fill(); } }
}
function villageTex(o) {
  return makeTex(2048, 512, (g, w, h) => {
    const r = rng(o.seed || 11), gy = h * 0.82;
    g.fillStyle = o.ground; g.fillRect(0, gy - 4, w, h - gy + 4);
    if (o.tree) for (let i = 0; i < 3; i++) baobab(g, 200 + i * 760 + r() * 120, gy, 0.9 + r() * 0.3, o.tree, o.leaf);
    if (o.wall) { g.fillStyle = o.wall; g.fillRect(560, gy - 70, 900, 70); for (let x = 560; x < 1460; x += 40) g.fillRect(x, gy - 86, 22, 18); }
    for (let i = 0; i < o.huts; i++) { const x = 120 + i * (w - 240) / (o.huts - 1) + (r() - 0.5) * 60; hut(g, x, gy, 0.8 + r() * 0.35, o.hwall, o.roof, o.door); }
  });
}
function groundTex(col, tuft) {
  return makeTex(2048, 256, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 10, w, h);
    const r = rng(5);
    for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.12})`; g.fillRect(r() * w, 14 + r() * h, 3 + r() * 5, 2); }
    g.strokeStyle = tuft; g.lineWidth = 3;
    for (let i = 0; i < 260; i++) { const x = r() * w; for (let k = -2; k <= 2; k++) line(g, x, 16, x + k * 4 + (r() - 0.5) * 6, 2 + r() * 8); }
  });
}
function grassTex(col, seed = 9) {
  return makeTex(2048, 256, (g, w, h) => {
    const r = rng(seed); g.strokeStyle = col; g.lineCap = 'round';
    for (let i = 0; i < 900; i++) { const x = r() * w, hh = 60 + r() * 150; g.lineWidth = 3 + r() * 4; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + (r() - 0.5) * 30, h - hh * 0.6, x + (r() - 0.5) * 50, h - hh); g.stroke(); }
  });
}
function forestTex(col, seed, base) {
  return makeTex(2048, 512, (g, w, h) => {
    const r = rng(seed); g.fillStyle = col; g.fillRect(0, h * base + 60, w, h);
    for (let i = 0; i < 34; i++) {
      const x = r() * w, s = 0.7 + r() * 0.7, y = h * base + 70;
      g.fillRect(x - 9 * s, y - 120 * s, 18 * s, 130 * s);
      for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x + (r() - 0.5) * 60 * s, y - (130 + r() * 70) * s, (50 + r() * 30) * s, (34 + r() * 20) * s, 0, 0, 7); g.fill(); }
    }
  });
}
export function glowTex() {
  return makeTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,230,140,.95)'); gr.addColorStop(0.35, 'rgba(255,200,80,.45)'); gr.addColorStop(1, 'rgba(255,200,80,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}
function okraTex(dry) {
  return makeTex(2048, 512, (g, w, h) => {
    const r = rng(21); g.fillStyle = dry ? '#a87a3c' : '#6f8f3a'; g.fillRect(0, h * 0.85, w, h);
    for (let row = 0; row < 2; row++) for (let i = 0; i < 46; i++) {
      const x = i * 45 + row * 22 + r() * 10, y = h * (0.86 + row * 0.06), s = 0.8 + r() * 0.4;
      g.strokeStyle = dry ? '#6b4a22' : '#3f6b22'; g.lineWidth = 5 * s; line(g, x, y, x + (r() - 0.5) * 10, y - 120 * s);
      g.fillStyle = dry ? '#7a5a2a' : '#4f7f2a';
      for (let k = 0; k < 4; k++) { g.save(); g.translate(x, y - (40 + k * 22) * s); g.rotate((k % 2 ? 1 : -1) * (dry ? 2.2 : 0.9)); g.beginPath(); g.ellipse(14 * s, 0, 16 * s, 6 * s, 0, 0, 7); g.fill(); g.restore(); }
    }
  });
}
// Le marché : des étals couverts de paille, avec paniers et canaris
function marcheTex() {
  return makeTex(2048, 512, (g, w, h) => {
    const r = rng(31), gy = h * 0.86;
    baobab(g, 300, gy, 1.1, '#6b4a2a', '#6f9a3a'); baobab(g, 1720, gy, 1.2, '#6b4a2a', '#6f9a3a');
    for (let i = 0; i < 6; i++) {
      const x = 180 + i * 340, l = 130 + r() * 40;
      g.fillStyle = '#5a3416'; [-l, l].forEach((d) => g.fillRect(x + d - 5, gy - 150, 10, 150));
      g.fillStyle = i % 2 ? '#d9b25e' : '#c9a15a'; g.beginPath(); g.moveTo(x - l - 28, gy - 140); g.lineTo(x, gy - 208); g.lineTo(x + l + 28, gy - 140); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; for (let k = -6; k <= 6; k++) line(g, x, gy - 208, x + k * (l + 28) / 6, gy - 140);
      g.fillStyle = '#7a4a22'; g.fillRect(x - l, gy - 54, l * 2, 12);
      const couleurs = ['#e0a43a', '#b8322a', '#4f6b22', '#efe3c6', '#3d2410'];
      for (let k = 0; k < 7; k++) { g.fillStyle = couleurs[Math.floor(r() * couleurs.length)]; g.beginPath(); g.arc(x - l + 24 + k * (l * 2 - 48) / 6, gy - 66, 16 + r() * 6, Math.PI, 0); g.fill(); }
      for (let k = 0; k < 3; k++) { g.fillStyle = shade('#7a3b1d', Math.floor(r() * 40) - 20); g.beginPath(); g.ellipse(x - 70 + k * 70, gy - 16, 24, 22, 0, 0, 7); g.fill(); }
    }
  });
}
// La brousse : herbes hautes, termitières et baobabs isolés
function brousseTex() {
  return makeTex(2048, 512, (g, w, h) => {
    const r = rng(41), gy = h * 0.86;
    [260, 980, 1760].forEach((x) => baobab(g, x, gy, 1.1 + r() * 0.5, '#5f3f22', '#7f8f42'));
    [560, 1400].forEach((x) => { g.fillStyle = '#a4592a'; g.beginPath(); g.moveTo(x - 60, gy); g.quadraticCurveTo(x - 40, gy - 90, x - 8, gy - 170); g.quadraticCurveTo(x + 12, gy - 120, x + 18, gy - 90); g.quadraticCurveTo(x + 40, gy - 60, x + 60, gy); g.fill(); });
    g.strokeStyle = '#b08a3e'; g.lineCap = 'round';
    for (let i = 0; i < 500; i++) { const x = r() * w, hh = 30 + r() * 60; g.lineWidth = 2 + r() * 2; line(g, x, gy + 4, x + (r() - 0.5) * 22, gy - hh); }
    g.fillStyle = '#b9763f'; g.fillRect(0, gy, w, h - gy);
  });
}

// Une étendue d'eau, avec des reflets clairs
function eauTex(haut, bas) {
  return makeTex(2048, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, haut); gr.addColorStop(1, bas);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(51); g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineCap = 'round';
    for (let i = 0; i < 160; i++) { const x = r() * w, y = r() * h, l = 14 + y * 0.35 + r() * 30; g.lineWidth = 1 + y / 90; line(g, x, y, x + l, y); }
  });
}
// Les pics de Sindou : des aiguilles de grès serrées
function picsTex(col, seed) {
  return makeTex(2048, 512, (g, w, h) => {
    const r = rng(seed), gy = h * 0.92;
    for (let x = -40; x < w + 40; x += 34 + r() * 46) {
      const l = 26 + r() * 42, sommet = h * (0.1 + r() * 0.5), pointe = x + (r() - 0.5) * 20;
      const gr = g.createLinearGradient(x - l, 0, x + l, 0); gr.addColorStop(0, shade(col, -28)); gr.addColorStop(0.5, shade(col, 16)); gr.addColorStop(1, shade(col, -40));
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - l, gy); g.quadraticCurveTo(x - l * 0.7, sommet + (gy - sommet) * 0.35, pointe, sommet); g.quadraticCurveTo(x + l * 0.7, sommet + (gy - sommet) * 0.35, x + l, gy); g.closePath(); g.fill();
    }
    g.fillStyle = shade(col, -35); g.fillRect(0, gy - 2, w, h - gy + 2);
  });
}
// Les murs de latérite de Loropéni, debout par endroits, envahis par la brousse
function ruinesTex() {
  return makeTex(2048, 512, (g, w, h) => {
    const r = rng(61), gy = h * 0.86;
    [180, 1120, 1880].forEach((x) => baobab(g, x, gy, 1.1 + r() * 0.3, '#5f3f22', '#6f8f42'));
    for (let m = 0; m < 5; m++) {
      const x0 = 80 + m * 400, large = 300;
      for (let c = 0; c < large; c += 30) {
        const haut = 40 + Math.abs(Math.sin((c + m * 90) / 70)) * 130 + r() * 30;
        for (let y = 0; y < haut; y += 18) { g.fillStyle = shade('#9a4f2a', Math.floor(r() * 36) - 18); g.fillRect(x0 + c + (Math.floor(y / 18) % 2) * 8, gy - y - 18, 27, 16); }
      }
    }
    g.strokeStyle = '#5f7f32'; g.lineCap = 'round';
    for (let i = 0; i < 260; i++) { const x = r() * w; g.lineWidth = 2 + r() * 3; line(g, x, gy + 4, x + (r() - 0.5) * 24, gy - 20 - r() * 56); }
  });
}
// Le Sahel : acacias, et une mosquée de banco hérissée de bois
function sahelTex() {
  return makeTex(2048, 512, (g, w, h) => {
    const gy = h * 0.86, x = 1250;
    [220, 720, 1780].forEach((a, i) => {
      g.strokeStyle = '#5a4326'; g.lineWidth = 10; line(g, a, gy, a, gy - 70 - i * 10);
      g.fillStyle = '#7a7a3e'; g.beginPath(); g.ellipse(a, gy - 86 - i * 10, 76, 18, 0, 0, 7); g.fill();
    });
    g.fillStyle = '#b9824c'; g.fillRect(x - 200, gy - 110, 400, 110);
    [-200, -66, 66, 200].forEach((d, i) => {
      const t = i === 1 || i === 2 ? 210 : 165;
      g.fillStyle = '#a97440'; g.beginPath(); g.moveTo(x + d - 34, gy); g.lineTo(x + d - 22, gy - t); g.lineTo(x + d, gy - t - 30); g.lineTo(x + d + 22, gy - t); g.lineTo(x + d + 34, gy); g.closePath(); g.fill();
      g.strokeStyle = '#4a3016'; g.lineWidth = 4; for (let y = 50; y < t; y += 40) line(g, x + d - 34, gy - y, x + d + 34, gy - y);
    });
    g.fillStyle = '#3a2410'; g.beginPath(); g.moveTo(x - 24, gy); g.lineTo(x - 24, gy - 50); g.arc(x, gy - 50, 24, Math.PI, 0); g.lineTo(x + 24, gy); g.fill();
    g.fillStyle = '#e0c088'; g.fillRect(0, gy, w, h - gy);
  });
}
// Le sol de nuages du pays d'en haut
function nuagesTex() {
  return makeTex(2048, 256, (g, w, h) => {
    const r = rng(71);
    for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.5})`; g.beginPath(); g.ellipse(r() * w, h * (0.3 + r() * 0.7), 60 + r() * 90, 22 + r() * 36, 0, 0, 7); g.fill(); }
  });
}
function feuTex() {
  return makeTex(256, 256, (g) => {
    const lueur = g.createRadialGradient(128, 170, 4, 128, 170, 120); lueur.addColorStop(0, 'rgba(255,190,90,.8)'); lueur.addColorStop(1, 'rgba(255,150,60,0)');
    g.fillStyle = lueur; g.fillRect(0, 0, 256, 256);
    [['#d9481c', 40, 120], ['#f08a24', 28, 90], ['#fbd35a', 15, 56]].forEach(([c, l, t]) => { g.fillStyle = c; g.beginPath(); g.moveTo(128 - l, 226); g.quadraticCurveTo(128 - l, 226 - t * 0.6, 128, 226 - t); g.quadraticCurveTo(128 + l, 226 - t * 0.6, 128 + l, 226); g.closePath(); g.fill(); });
    g.strokeStyle = '#2a170c'; g.lineWidth = 12; g.lineCap = 'round'; line(g, 80, 238, 176, 222); line(g, 80, 222, 176, 238);
  });
}

export function construireDecor(name) {
  const g = new THREE.Group();
  const d = { group: g, spots: [], hotspots: {}, scrollers: [], galop: null, avant: [] };
  const add = (m) => { g.add(m); return m; };
  // Le sol descend bien plus bas que le cadre, pour le cas où la caméra recule (écrans étroits).
  const nearGround = (col, tuft) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), new THREE.MeshBasicMaterial({ color: col }));
    m.position.set(0, GROUND - 36.2, -1.1); m.renderOrder = 980; add(m);
    add(plane(groundTex(col, tuft), 80, 7, 0, GROUND - 3.2, -1));
  };
  const fg = (col) => d.avant.push(add(plane(grassTex(col), 60, 2.4, 0, -4.4, 3)));
  const spots = (...l) => { d.spots = l; };

  if (name === 'palais' || name === 'champ') {
    add(plane(skyTex('#5d9ccf', '#f7c98a', { sun: [0.72, 0.42, 34, 'rgba(255,220,150,.75)', '#fff1c9'], clouds: 'rgba(255,255,255,.35)' }), 170, 90, 0, 8, -40));
    add(plane(hillsTex('#c98b55', 1, 0.55, 0.16, { trees: 10 }), 110, 28, 0, -5, -28));
    if (name === 'palais') {
      add(plane(villageTex({ ground: '#b9763f', huts: 6, hwall: '#c4793f', roof: '#d9b25e', door: '#3a2012', wall: '#b46a34', tree: '#6b4a2a', leaf: '#5f7f32' }), 52, 13, 0, 0.5, -12));
      nearGround('#b9763f', '#8a6a2a');
      spots([-5, 0.4], [5.2, 0.4], [0, 0.4]);
    } else {
      add(plane(villageTex({ ground: '#b9763f', huts: 3, hwall: '#c4793f', roof: '#d9b25e', door: '#3a2012', tree: '#6b4a2a', leaf: '#7f8f42', seed: 4 }), 52, 13, 0, 0.9, -14));
      add(plane(okraTex(true), 40, 10, 0, 1, -4));
      nearGround('#a87a3c', '#6b4a22');
      spots([-5, 0.4], [5, 0.4]);
    }
    fg('#4a3418');
  }
  if (name === 'nuit') {
    add(plane(skyTex('#05081a', '#23305e', { stars: true, sun: [0.25, 0.25, 22, 'rgba(200,215,255,.35)', '#eef2ff'] }), 170, 90, 0, 8, -40));
    add(plane(hillsTex('#1a2244', 2, 0.55, 0.16, { trees: 8 }), 110, 28, 0, -5, -28));
    add(plane(villageTex({ ground: '#141a30', huts: 5, hwall: '#2a2f4a', roof: '#353a58', door: '#f0a640', wall: '#232842', seed: 7 }), 52, 13, 0, 0.5, -12));
    nearGround('#1d2238', '#2c3456');
    const cheval = add(plane(makeTex(512, 384, (c) => dessinerCheval(c, 0, false)), 3.6, 2.7, 3.6, GROUND + 1.25, -0.3));
    d.hotspots.etalon = cheval;
    spots([-5, 0.4], [5.4, 0.4]);
    fg('#0b0e1c');
  }
  if (name === 'course') {
    add(plane(skyTex('#0b0f24', '#3a3560', { stars: true, clouds: 'rgba(120,120,170,.25)', seed: 8 }), 170, 90, 0, 8, -40));
    const lay = (tex, w, h, y, z, f) => { tex.wrapS = THREE.RepeatWrapping; const m = add(plane(tex, w, h, 0, y, z)); m.userData.scroll = f; d.scrollers.push(m); return m; };
    lay(hillsTex('#232a4d', 3, 0.55, 0.2, { trees: 12 }), 110, 28, -5, -28, 0.01);
    lay(forestTex('#1b2b26', 4, 0.45), 60, 14, -3.4, -12, 0.03);
    nearGround('#2a2a3c', '#3a4a40');
    d.avant.push(lay(grassTex('#0a0d14', 12), 60, 2.4, -4.4, 3, 0.16));
    const images = [0, 1].map((f) => makeTex(512, 384, (c) => dessinerCheval(c, f, true)));
    const cheval = add(plane(images[0], 4.6, 3.45, 0, GROUND + 1.6, 0));
    d.galop = { mesh: cheval, images };
  }
  if (name === 'foret') {
    add(plane(skyTex('#3b2a5a', '#f2a07a', { sun: [0.5, 0.95, 40, 'rgba(255,180,140,.6)', '#ffd9b0'], seed: 5 }), 170, 90, 0, 8, -40));
    add(plane(forestTex('#2a3b3a', 6, 0.35), 110, 28, 0, -5, -28));
    add(plane(forestTex('#1f3a2c', 7, 0.4), 60, 15, 0, -3.8, -12));
    add(plane(makeTex(512, 512, (c) => hut(c, 256, 470, 2.6, '#9a5a2e', '#b8924a', '#2a170c')), 6, 6, 4.8, GROUND + 2.6, -3));
    nearGround('#3d3a22', '#55603a');
    add(plane(makeTex(512, 384, (c) => dessinerCheval(c, 0, false)), 3.2, 2.4, -5.4, GROUND + 1.1, -0.6));
    spots([6.6, 0.4], [-3.4, 0.4]);
    fg('#141f12');
  }
  if (name === 'village') {
    add(plane(skyTex('#f6b26b', '#fde3b0', { sun: [0.5, 0.7, 40, 'rgba(255,230,170,.8)', '#fff6dc'], clouds: 'rgba(255,255,255,.4)', seed: 6 }), 170, 90, 0, 8, -40));
    add(plane(hillsTex('#c6925e', 9, 0.6, 0.12, { trees: 14 }), 110, 28, 0, -5, -28));
    add(plane(villageTex({ ground: '#c8874a', huts: 8, hwall: '#c4793f', roof: '#e0bd6a', door: '#3a2012', tree: '#6b4a2a', leaf: '#6f9a3a', seed: 13 }), 52, 13, 0, 0.5, -12));
    d.hotspots['case-ronde'] = add(plane(makeTex(512, 512, (c) => hut(c, 256, 470, 2.6, '#c4793f', '#e0bd6a', '#3a2012')), 6, 6, -5.6, GROUND + 2.6, -3));
    nearGround('#c8874a', '#8a6a2a');
    spots([5.4, 0.4], [-3.8, 0.4]);
    fg('#5a3a18');
  }
  if (name === 'marche') {
    add(plane(skyTex('#f0c27a', '#fbe6bd', { sun: [0.3, 0.3, 36, 'rgba(255,235,180,.8)', '#fff6dc'], clouds: 'rgba(255,255,255,.35)', seed: 14 }), 170, 90, 0, 8, -40));
    add(plane(hillsTex('#c6925e', 15, 0.6, 0.12, { trees: 10 }), 110, 28, 0, -5, -28));
    add(plane(marcheTex(), 52, 13, 0, 0.6, -10));
    nearGround('#c8874a', '#8a6a2a');
    spots([-1.9, 0.4], [0.9, 0.4], [4.6, 0.4]);
    fg('#5a3a18');
  }
  if (name === 'brousse') {
    add(plane(skyTex('#e8904a', '#fbd58f', { sun: [0.68, 0.5, 42, 'rgba(255,225,150,.85)', '#fff1c9'], seed: 16 }), 170, 90, 0, 8, -40));
    add(plane(hillsTex('#b47a48', 17, 0.58, 0.14, { trees: 12 }), 110, 28, 0, -5, -28));
    add(plane(brousseTex(), 52, 13, 0, 0.7, -10));
    nearGround('#b9763f', '#8a6a2a');
    spots([-5, 0.4], [5, 0.4]);
    fg('#4a3418');
  }
  if (name === 'bois') {
    add(plane(skyTex('#16304a', '#3f6a5a', { stars: true, sun: [0.7, 0.2, 24, 'rgba(210,225,255,.45)', '#eef2ff'], seed: 18 }), 170, 90, 0, 8, -40));
    add(plane(forestTex('#23423f', 19, 0.3), 110, 28, 0, -5, -28));
    add(plane(forestTex('#1a3a30', 20, 0.36), 60, 15, 0, -3.8, -12));
    nearGround('#34452c', '#4f6f4a');
    spots([-5, 0.4], [5, 0.4]);
    fg('#08120c');
  }
  if (name === 'veillee') {
    add(plane(skyTex('#090c22', '#3a2a4a', { stars: true, seed: 22 }), 170, 90, 0, 8, -40));
    add(plane(hillsTex('#1a2244', 23, 0.55, 0.14, { trees: 8 }), 110, 28, 0, -5, -28));
    add(plane(villageTex({ ground: '#141a30', huts: 6, hwall: '#3a2f42', roof: '#454056', door: '#f0a640', seed: 24 }), 52, 13, 0, 0.5, -12));
    nearGround('#2a2230', '#3a3050');
    add(plane(feuTex(), 2.4, 2.4, 0, GROUND + 1, -0.5));
    spots([-5, 0.4], [5, 0.4]);
    fg('#0c0a14');
  }
  if (name === 'fleuve' || name === 'mare') {
    const fleuve = name === 'fleuve';
    add(plane(fleuve ? skyTex('#6fa9cc', '#f3d9a6', { sun: [0.3, 0.45, 30, 'rgba(255,235,180,.7)', '#fff6dc'], clouds: 'rgba(255,255,255,.4)', seed: 25 }) : skyTex('#d97a5a', '#f7d39a', { sun: [0.6, 0.6, 44, 'rgba(255,215,150,.8)', '#ffe9b8'], seed: 26 }), 170, 90, 0, 8, -40));
    add(plane(hillsTex(fleuve ? '#8f8a5a' : '#8a5a3a', 27, 0.56, 0.12, { trees: 12 }), 110, 28, 0, -5, -28));
    add(plane(fleuve ? brousseTex() : forestTex('#3a4f2a', 28, 0.5), 52, 13, 0, 1.4, -12));
    add(plane(fleuve ? eauTex('#3f8caf', '#1f5a7a') : eauTex('#5f9a8a', '#2f5f58'), 90, 8, 0, fleuve ? -5.5 : -5.9, -8));
    nearGround(fleuve ? '#a98a52' : '#6f7a3a', fleuve ? '#7a8a42' : '#3f6a2a');
    spots([-5, 0.4], [5, 0.4]);
    fg(fleuve ? '#3f5a22' : '#26401c');
  }
  if (name === 'rochers') {
    add(plane(skyTex('#7fb0d0', '#f0d6a8', { sun: [0.2, 0.3, 30, 'rgba(255,235,180,.7)', '#fff6dc'], clouds: 'rgba(255,255,255,.4)', seed: 29 }), 170, 90, 0, 8, -40));
    add(plane(picsTex('#8f6a52', 30), 90, 22, 0, 2, -24));
    add(plane(picsTex('#a4623a', 32), 52, 14, 0, 1.4, -10));
    nearGround('#b9763f', '#8a7a3a');
    spots([-5, 0.4], [5, 0.4]);
    fg('#4a3418');
  }
  if (name === 'ruines') {
    add(plane(skyTex('#8fb7c9', '#efdcae', { sun: [0.75, 0.35, 32, 'rgba(255,235,180,.7)', '#fff6dc'], clouds: 'rgba(255,255,255,.35)', seed: 33 }), 170, 90, 0, 8, -40));
    add(plane(hillsTex('#8a8a52', 34, 0.58, 0.12, { trees: 14 }), 110, 28, 0, -5, -28));
    add(plane(ruinesTex(), 52, 13, 0, 0.7, -10));
    nearGround('#a4692f', '#6f7f32');
    spots([-5, 0.4], [5, 0.4]);
    fg('#39501f');
  }
  if (name === 'sahel') {
    add(plane(skyTex('#d9c08a', '#f8ecc8', { sun: [0.25, 0.3, 36, 'rgba(255,240,190,.8)', '#fff8e0'], seed: 35 }), 170, 90, 0, 8, -40));
    add(plane(hillsTex('#d8b67c', 36, 0.62, 0.08), 110, 28, 0, -5, -28));
    add(plane(sahelTex(), 52, 13, 0, 0.7, -10));
    nearGround('#e0c088', '#b09a5a');
    spots([-5, 0.4], [5, 0.4]);
    fg('#a08a4a');
  }
  if (name === 'ciel') {
    add(plane(skyTex('#28418f', '#a9c7ea', { sun: [0.5, 0.2, 40, 'rgba(255,240,190,.9)', '#fff8dc'], clouds: 'rgba(255,255,255,.55)', seed: 37 }), 170, 90, 0, 8, -40));
    add(plane(nuagesTex(), 110, 14, 0, -3.4, -20));
    nearGround('#dfe8f5', '#ffffff');
    add(plane(nuagesTex(), 60, 4, 0, GROUND - 0.2, -2));
    spots([-5, 0.4], [5, 0.4]);
  }
  return d;
}

export function detruireGroupe(g) {
  g.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    if (o.userData.mouth) o.userData.mouth.forEach((t) => t.dispose());
  });
}
