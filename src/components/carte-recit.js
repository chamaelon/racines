/* Carte d'un récit dans une grille : illustration générée, titre, type, région, langues, badge jouable. */
import { store } from '../store.js';
import { esc, TYPES } from '../ui.js';

const hash = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

const PALETTES = {
  conte: { ciel: ['#141a44', '#54407a'], astre: '#f4ecc8', loin: '#2b2650', pres: '#171233' },
  legende: { ciel: ['#d9642b', '#f9c777'], astre: '#fff1c9', loin: '#a24d22', pres: '#5a2a12' },
  histoire: { ciel: ['#b98a52', '#ecd6a4'], astre: '#fff6dc', loin: '#8a5a2c', pres: '#4a2c14' },
};
const BANDES = ['#e0a43a', '#b8322a', '#2f3f8f', '#fbf1dc', '#1a1209', '#1f6f6b'];

// Une petite scène en SVG, propre à chaque récit : relief, astre et silhouette varient avec son identifiant.
export function illustration(r) {
  const h = hash(r.id), p = PALETTES[r.type];
  const v = (i, n) => ((h >> (i * 3)) & 255) % n;
  const ax = 40 + v(0, 240), ay = 34 + v(1, 50);
  const id = `g-${r.id}`;
  const collines = `M0 ${130 + v(2, 18)} Q ${70 + v(3, 50)} ${88 + v(4, 34)} ${160} ${122 + v(5, 16)} T 320 ${112 + v(6, 28)} V200 H0 Z`;
  const sx = 50 + v(7, 200);
  let silhouette;
  if (r.type === 'histoire') {
    const c = Array.from({ length: 7 }, (_, i) => `<rect x="${sx - 56 + i * 16}" y="112" width="10" height="9"/>`).join('');
    silhouette = `<rect x="${sx - 58}" y="120" width="112" height="60"/>${c}`;
  } else if (r.type === 'legende') {
    silhouette = `<path d="M${sx - 26} 170V136H${sx + 26}V170Z"/><path d="M${sx - 34} 140L${sx} 100L${sx + 34} 140Z"/>`;
  } else {
    silhouette = `<path d="M${sx - 12} 172Q${sx - 8} 140 ${sx - 7} 118H${sx + 7}Q${sx + 8} 140 ${sx + 12} 172Z"/>${[-3, -2, -1, 0, 1, 2, 3].map((i) => `<path d="M${sx + i * 2} 120L${sx + i * 9} ${102 - (i % 2 ? 8 : 0)}" stroke="${p.pres}" stroke-width="4" stroke-linecap="round"/>`).join('')}`;
  }
  const etoiles = r.type === 'conte' ? Array.from({ length: 14 }, (_, i) => `<circle cx="${(h * (i + 3) * 37) % 320}" cy="${(h * (i + 5) * 13) % 90}" r="1.1" fill="#fff"/>`).join('') : '';
  const bandes = Array.from({ length: 16 }, (_, i) => `<rect x="${i * 20}" y="172" width="20" height="8" fill="${BANDES[(i + v(1, 6)) % BANDES.length]}"/>`).join('');
  return `<svg class="illustration" viewBox="0 0 320 180" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.ciel[0]}"/><stop offset="1" stop-color="${p.ciel[1]}"/></linearGradient></defs>
    <rect width="320" height="180" fill="url(#${id})"/>${etoiles}
    <circle cx="${ax}" cy="${ay}" r="20" fill="${p.astre}"/>
    <path d="${collines}" fill="${p.loin}"/>
    <g fill="${p.pres}">${silhouette}</g>
    <path d="M0 160 Q 90 ${146 + v(2, 10)} 180 158 T 320 150 V180 H0 Z" fill="${p.pres}"/>
    ${bandes}
  </svg>`;
}

export function carteRecit(r, { regionNom, langues }) {
  const audio = Object.keys(r.audio).map((l) => langues[l]).join(', ');
  const fini = store.estTermine(r.id);
  return `<li class="carte-recit">
    <a href="#/recit/${r.id}">
      ${illustration(r)}
      <div class="carte-recit-corps">
        <p class="etiquettes"><span class="etiquette type-${r.type}">${TYPES[r.type].nom}</span>${r.jouable ? '<span class="etiquette jouable">▶ Jouable</span>' : ''}${fini ? '<span class="etiquette fini">✓ Terminé</span>' : ''}</p>
        <h2>${esc(r.titre)}</h2>
        <p class="meta">${esc(regionNom)} · ${esc(r.peuple)}</p>
        ${audio ? `<p class="meta">Audio : ${esc(audio)}</p>` : ''}
      </div>
    </a>
  </li>`;
}
