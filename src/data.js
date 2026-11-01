/* Chargement et cache des données JSON. Tout le contenu vit dans public/data. */
const base = import.meta.env.BASE_URL;
const cache = new Map();

export const url = (chemin) => base + chemin;

async function lire(chemin, type) {
  const r = await fetch(url(chemin));
  if (!r.ok) throw new Error(`Fichier introuvable : ${chemin}`);
  return r[type]();
}
function charger(chemin, type = 'json') {
  if (!cache.has(chemin)) {
    const p = lire(chemin, type).catch((e) => { cache.delete(chemin); throw e; });
    cache.set(chemin, p);
  }
  return cache.get(chemin);
}

export const recits = () => charger('data/recits.json');
export const localites = () => charger('data/localites.json');
export const patrimoine = () => charger('data/patrimoine.json');
export const regions = () => charger('data/regions.json');
export const langues = () => charger('data/langues.json');
export const carteSvg = () => charger('data/carte.svg', 'text');
export const texte = (chemin) => charger(`data/${chemin}`, 'text');
export const histoire = (chemin) => charger(`data/${chemin}`);
export const fichierTexte = (chemin) => charger(chemin, 'text');

