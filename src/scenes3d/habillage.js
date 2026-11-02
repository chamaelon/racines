/*
 * Habille un modèle GLB : on peint le motif par-dessus sa texture d'origine, puis on remplace sa matière principale.
 * Une image transparente laisse donc voir la terre, la paille ou l'étoffe du modèle.
 */
import * as THREE from 'three';
import { url } from '../data.js';

const TAILLE = 1024;
const images = new Map();

function chargerImage(fichier) {
  if (!images.has(fichier)) {
    images.set(fichier, new Promise((ok, non) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => non(new Error(`Motif introuvable : ${fichier}`));
      img.src = url(`motifs/${fichier}`);
    }));
  }
  return images.get(fichier);
}

// La matière à habiller : l'étoffe d'un personnage, sinon la première matière texturée, sinon la première tout court.
function matierePrincipale(racine) {
  const toutes = [];
  racine.traverse((o) => { if (o.isMesh && !toutes.includes(o.material)) toutes.push(o.material); });
  return toutes.find((m) => m.name === 'etoffe') || toutes.find((m) => m.map) || toutes[0];
}

const TRACES = {
  triangle: (g, x, y, r) => { g.moveTo(x, y - r); g.lineTo(x + r, y + r); g.lineTo(x - r, y + r); g.closePath(); },
  carre: (g, x, y, r) => { g.rect(x - r, y - r, 2 * r, 2 * r); },
  losange: (g, x, y, r) => { g.moveTo(x, y - r); g.lineTo(x + r, y); g.lineTo(x, y + r); g.lineTo(x - r, y); g.closePath(); },
  cercle: (g, x, y, r) => { g.moveTo(x + r, y); g.arc(x, y, r, 0, Math.PI * 2); },
};
// Part de la hauteur de la texture : le haut de l'image correspond au haut de l'objet, voir `retourner`.
const ZONES = { haut: [0.12, 0.3], milieu: [0.38, 0.62], bas: [0.7, 0.88], partout: [0.04, 0.96] };

export function peindreComposition(g, c, taille = TAILLE) {
  const [y0, y1] = ZONES[c.position] || ZONES.milieu;
  const rangs = c.rangs || 1;
  const n = c.nombre || 16;
  const cote = taille / n;
  const hauteur = (y1 - y0) * taille / rangs;
  const rayon = Math.min(cote, hauteur) * 0.38;
  for (let j = 0; j < rangs; j++) {
    const y = y0 * taille + (j + 0.5) * hauteur;
    g.fillStyle = c.couleurs[j % c.couleurs.length];
    g.beginPath();
    for (let i = 0; i < n; i++) TRACES[c.forme](g, (i + 0.5 + (j % 2) / 2) * cote, y, rayon);
    g.fill();
  }
}

async function texture(matiere, motif) {
  const c = document.createElement('canvas');
  c.width = c.height = TAILLE;
  const g = c.getContext('2d');
  if (matiere.map?.image) g.drawImage(matiere.map.image, 0, 0, TAILLE, TAILLE);
  else { g.fillStyle = `#${matiere.color.getHexString()}`; g.fillRect(0, 0, TAILLE, TAILLE); }
  if (motif.image) g.drawImage(await chargerImage(motif.image), 0, 0, TAILLE, TAILLE);
  else peindreComposition(g, motif.composition);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false;                     // comme les textures glTF
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

// motif = null remet le modèle d'origine.
export async function habiller(racine, motif) {
  const base = racine.userData.matiereBase || matierePrincipale(racine);
  racine.userData.matiereBase = base;
  if (!base) return;
  const neuve = motif ? base.clone() : base;
  if (motif) {
    neuve.map = await texture(base, motif);
    neuve.color.set(0xffffff);
    neuve.needsUpdate = true;
  }
  racine.traverse((o) => {
    if (!o.isMesh) return;
    if (o.material === base || o.material === racine.userData.matiereHabillee) o.material = neuve;
  });
  racine.userData.matiereHabillee?.map?.dispose();
  racine.userData.matiereHabillee?.dispose();
  racine.userData.matiereHabillee = motif ? neuve : null;
}
