/*
 * GeoJSON -> public/data/carte.svg
 * Regroupe les 45 provinces de geoBoundaries (ADM2, CC BY 4.0) dans les 17 régions de juillet 2025,
 * simplifie les contours, projette en équirectangulaire et écrit un SVG aux tracés cliquables.
 * Les attributs data-* de la racine servent à placer les localités sur la carte.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SOURCES = 'scripts/sources';
const LARGEUR = 1000, MARGE = 18;

const tmp = mkdtempSync(join(tmpdir(), 'carte-'));
const sortie = join(tmp, 'regions.geojson');
execFileSync(process.execPath, ['node_modules/mapshaper/bin/mapshaper',
  `${SOURCES}/provinces-bfa.geojson`,
  '-join', `${SOURCES}/provinces-regions.csv`, 'keys=shapeName,province', 'string-fields=province,region',
  '-dissolve', 'region',
  '-simplify', '7%', 'keep-shapes',
  '-clean',
  '-o', 'format=geojson', sortie], { stdio: ['ignore', 'ignore', 'inherit'] });
const regions = JSON.parse(readFileSync(sortie, 'utf8')).features;
rmSync(tmp, { recursive: true });
if (regions.length !== 17) throw new Error(`17 régions attendues, ${regions.length} obtenues`);

const anneaux = (f) => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
let lonMin = 180, lonMax = -180, latMin = 90, latMax = -90;
regions.forEach((f) => anneaux(f).flat(2).forEach(([x, y]) => {
  lonMin = Math.min(lonMin, x); lonMax = Math.max(lonMax, x); latMin = Math.min(latMin, y); latMax = Math.max(latMax, y);
}));
const cosLat = Math.cos((latMin + latMax) / 2 * Math.PI / 180);
const ey = (LARGEUR - 2 * MARGE) / ((lonMax - lonMin) * cosLat);
const ex = ey * cosLat;
const HAUTEUR = Math.ceil((latMax - latMin) * ey + 2 * MARGE);
const px = ([lon, lat]) => [(lon - lonMin) * ex + MARGE, (latMax - lat) * ey + MARGE];
const nb = (v) => Math.round(v * 10) / 10;
const trace = (polys) => polys.map((p) => p.map((r) => 'M' + r.map((c) => px(c).map(nb).join(' ')).join('L') + 'Z').join('')).join('');

// Centre de l'étiquette : centroïde du plus grand anneau de la région
function centre(f) {
  let meilleur = null, aireMax = -1;
  anneaux(f).forEach(([r]) => {
    const pts = r.map(px); let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const k = pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
      a += k; cx += (pts[i][0] + pts[i + 1][0]) * k; cy += (pts[i][1] + pts[i + 1][1]) * k;
    }
    if (Math.abs(a) > aireMax) { aireMax = Math.abs(a); meilleur = [cx / (3 * a), cy / (3 * a)]; }
  });
  return meilleur.map(nb);
}

const voisins = JSON.parse(readFileSync(`${SOURCES}/voisins.geojson`, 'utf8')).features;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" data-lon0="${lonMin.toFixed(4)}" data-lat1="${latMax.toFixed(4)}" data-marge="${MARGE}" data-ex="${ex.toFixed(4)}" data-ey="${ey.toFixed(4)}">
<g class="voisins">${voisins.map((f) => `<path d="${trace(anneaux(f))}"/>`).join('')}</g>
<g class="regions">${regions.map((f) => { const [x, y] = centre(f); return `<path data-region="${f.properties.region}" data-cx="${x}" data-cy="${y}" d="${trace(anneaux(f))}"/>`; }).join('')}</g>
</svg>
`;
writeFileSync('public/data/carte.svg', svg);
console.log(`carte.svg : ${regions.length} régions, ${(svg.length / 1024).toFixed(0)} Ko, ${LARGEUR}×${HAUTEUR}`);
