/* Charge carte.svg et sait placer une localité dessus : la carte, la mini-carte et le relief s'en servent. */
import { carteSvg } from '../data.js';

export async function chargerCarte() {
  const txt = await carteSvg();
  const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
  const svg = document.importNode(doc.documentElement, true);
  const d = svg.dataset;
  const lon0 = +d.lon0, lat1 = +d.lat1, marge = +d.marge, ex = +d.ex, ey = +d.ey;
  const [, , W, H] = svg.getAttribute('viewBox').split(' ').map(Number);
  const projeter = ([lat, lon]) => [(lon - lon0) * ex + marge, (lat1 - lat) * ey + marge];
  return { svg, W, H, projeter };
}

export const creerSvg = (nom, attrs = {}) => {
  const e = document.createElementNS('http://www.w3.org/2000/svg', nom);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
};

// Formes des marqueurs, de rayon 1 : la couleur et la forme distinguent le type de récit.
export const FORMES = {
  conte: 'M-1 0A1 1 0 1 1 1 0A1 1 0 1 1 -1 0Z',
  legende: 'M0 -1.25L1.25 0L0 1.25L-1.25 0Z',
  histoire: 'M-.95 -.95H.95V.95H-.95Z',
};
