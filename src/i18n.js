/*
 * La traduction du site. public/traductions/translate-<langue>.json associe chaque phrase française à sa traduction.
 * Une phrase vide reste en français. Le site n'a pas besoin de marquer ses textes : on traduit ce qui s'affiche.
 * {} dans une phrase tient lieu de ce qui varie (un nombre, un nom), à garder dans la traduction.
 */
import { url } from './data.js';

let dico = {};
let modeles = [];

const ATTRIBUTS = ['aria-label', 'title', 'placeholder', 'alt'];
// Le texte des histoires arrive déjà traduit, lettre après lettre, dans la boîte de dialogue.
const HORS_TRADUCTION = 'script, style, .j-texte, .j-annonce, [data-sans-traduction]';
const echapper = (t) => t.replace(/[.*+?^$()|[\]\\]/g, '\\$&');

export function compilerModeles(d) {
  return Object.keys(d)
    .filter((k) => d[k] && k.includes('{}') && k.replace(/\{\}/g, '').trim())
    .sort((a, b) => b.length - a.length)
    .map((k) => {
      // « récit{} » : un {} collé à un mot n'est que la marque du pluriel, pas n'importe quel texte.
      const morceaux = k.split('{}');
      const corps = morceaux.map((m, i) => {
        if (i === morceaux.length - 1) return echapper(m);
        const suite = morceaux[i + 1];
        return echapper(m) + (/\p{L}$/u.test(m) && !/^\p{L}/u.test(suite) ? '(s|x|)' : '(.*?)');
      }).join('');
      return { re: new RegExp(`^${corps}$`, 'su'), vers: d[k] };
    });
}

export function traduirePhrase(fr, d, m) {
  const brut = fr.trim();
  if (!brut) return fr;
  const exact = d[brut];
  if (exact) return fr.replace(brut, () => exact);
  for (const { re, vers } of m) {
    const r = re.exec(brut);
    if (!r) continue;
    let i = 1;
    const fait = vers.replace(/\{\}/g, () => traduirePhrase(r[i++] ?? '', d, m));
    return fr.replace(brut, () => fait);
  }
  return fr;
}

export const t = (fr) => traduirePhrase(fr, dico, modeles);

// Un dictionnaire inaccessible n'empêche jamais de lire le site en français.
const dictionnaires = new Map();
export function chargerDico(code) {
  if (!code || code === 'fr') return Promise.resolve({});
  if (!dictionnaires.has(code)) {
    dictionnaires.set(code, fetch(url(`traductions/translate-${code}.json`)).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  }
  return dictionnaires.get(code);
}
export const languesDisponibles = () => fetch(url('traductions/index.json')).then((r) => (r.ok ? r.json() : [])).catch(() => []);

// Chaque nœud garde son français : on peut changer de langue sans recharger.
const origines = new WeakMap();
function traduireTexte(n) {
  if (n.parentElement?.closest(HORS_TRADUCTION)) return;
  const o = origines.get(n);
  const fr = o && o.tr === n.data ? o.fr : n.data;
  const tr = t(fr);
  origines.set(n, { fr, tr });
  if (tr !== n.data) n.data = tr;
}
function traduireAttributs(el) {
  if (el.closest(HORS_TRADUCTION)) return;
  let memo = origines.get(el);
  for (const nom of ATTRIBUTS) {
    const v = el.getAttribute(nom);
    if (!v) continue;
    if (!memo) { memo = {}; origines.set(el, memo); }
    const o = memo[nom];
    const fr = o && o.tr === v ? o.fr : v;
    const tr = t(fr);
    memo[nom] = { fr, tr };
    if (tr !== v) el.setAttribute(nom, tr);
  }
}
function parcourir(racine) {
  if (racine.nodeType === Node.TEXT_NODE) { traduireTexte(racine); return; }
  if (racine.nodeType !== Node.ELEMENT_NODE) return;
  traduireAttributs(racine);
  const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  while (w.nextNode()) {
    if (w.currentNode.nodeType === Node.TEXT_NODE) traduireTexte(w.currentNode);
    else traduireAttributs(w.currentNode);
  }
}

let observateur = null;
function observer() {
  if (observateur) return;
  observateur = new MutationObserver((liste) => {
    for (const m of liste) {
      if (m.type === 'childList') m.addedNodes.forEach(parcourir);
      else if (m.type === 'characterData') traduireTexte(m.target);
      else traduireAttributs(m.target);
    }
  });
  observateur.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTS });
}

export async function activerLangue(code) {
  dico = await chargerDico(code);
  modeles = compilerModeles(dico);
  document.documentElement.lang = code || 'fr';
  const choix = document.querySelector('[data-langue-site]');
  if (choix && [...choix.options].some((o) => o.value === code)) choix.value = code;
  observer();
  parcourir(document.documentElement);
}
