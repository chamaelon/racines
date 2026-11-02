/*
 * Vérifie le contenu (section 6 du cahier des charges) : graphes complets, aucune référence cassée.
 * npm run validate : bloquant en CI. validerDonnees() est aussi appelée par les tests.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DECORS, MINIJEUX } from '../src/scenes/catalogue-decors.js';
import { STYLES } from '../src/scenes/personnages.js';

const lire = (racine, f) => JSON.parse(readFileSync(join(racine, f), 'utf8'));

// Toutes les cibles possibles d'un nœud
export function ciblesDe(n) {
  const c = [];
  if (n.next) c.push(n.next);
  (n.route || []).forEach((r) => c.push(r.next));
  (n.choices || []).forEach((r) => c.push(r.next));
  return c;
}

export function validerHistoire(h, { patrimoine = new Set(), fichierExiste = () => true } = {}) {
  const e = [];
  const nodes = h.nodes || {};
  const err = (m) => e.push(`${h.id} : ${m}`);
  if (!nodes[h.start]) err(`start « ${h.start} » n'existe pas`);
  for (const [id, n] of Object.entries(nodes)) {
    ciblesDe(n).forEach((c) => { if (!nodes[c]) err(`${id} pointe vers « ${c} », qui n'existe pas`); });
    if (n.scene && !DECORS[n.scene]) err(`${id} : décor inconnu « ${n.scene} »`);
    if (n.speaker && !(h.personnages || {})[n.speaker]) err(`${id} : personnage inconnu « ${n.speaker} »`);
    if (n.minigame && !MINIJEUX.includes(n.minigame)) err(`${id} : mini-jeu inconnu « ${n.minigame} »`);
    (n.explore || []).forEach((o) => { if (!patrimoine.has(o)) err(`${id} : objet d'exploration inconnu « ${o} »`); });
    Object.values(n.audio || {}).forEach((a) => { if (!fichierExiste(a)) err(`${id} : fichier audio manquant « ${a} »`); });
    if (!n.end && ciblesDe(n).length === 0) err(`${id} : cul-de-sac, ni suite ni fin`);
    if (n.text && !n.speaker) err(`${id} : réplique sans personnage`);
  }
  Object.entries(h.personnages || {}).forEach(([p, d]) => { if (!STYLES[d.style]) err(`personnage ${p} : style inconnu « ${d.style} »`); });
  const fins = new Set(Object.values(nodes).filter((n) => n.end).map((n) => n.end));
  if (h.fins) {
    fins.forEach((f) => { if (!h.fins[f]) err(`fin sans titre « ${f} »`); });
    Object.keys(h.fins).forEach((f) => { if (!fins.has(f)) err(`fin jamais atteinte « ${f} »`); });
  }
  // Atteignable depuis start
  const vus = new Set();
  const pile = [h.start];
  while (pile.length) {
    const id = pile.pop();
    if (vus.has(id) || !nodes[id]) continue;
    vus.add(id);
    pile.push(...ciblesDe(nodes[id]));
  }
  Object.keys(nodes).forEach((id) => { if (!vus.has(id)) err(`${id} n'est pas atteignable depuis start`); });
  // Chaque nœud mène à une fin (parcours inverse depuis les nœuds end)
  const parents = {};
  Object.entries(nodes).forEach(([id, n]) => ciblesDe(n).forEach((c) => { (parents[c] = parents[c] || []).push(id); }));
  const menent = new Set();
  const file = Object.keys(nodes).filter((id) => nodes[id].end);
  if (!file.length) err('aucun nœud de fin');
  while (file.length) {
    const id = file.pop();
    if (menent.has(id)) continue;
    menent.add(id);
    file.push(...(parents[id] || []));
  }
  Object.keys(nodes).forEach((id) => { if (!menent.has(id)) err(`${id} ne mène à aucune fin`); });
  Object.entries(h.distribution || {}).forEach(([s, d]) => {
    if (!DECORS[s]) err(`distribution : décor inconnu « ${s} »`);
    Object.keys(d).forEach((p) => { if (!(h.personnages || {})[p]) err(`distribution ${s} : personnage inconnu « ${p} »`); });
  });
  return e;
}

export function validerDonnees(racine = 'public') {
  const e = [];
  const donnee = (f) => lire(join(racine, 'data'), f);
  const existe = (f) => existsSync(join(racine, f));
  const dataExiste = (f) => existsSync(join(racine, 'data', f));
  const recits = donnee('recits.json');
  const localites = donnee('localites.json');
  const patrimoine = donnee('patrimoine.json');
  const regions = donnee('regions.json');
  const langues = donnee('langues.json');
  const carte = readFileSync(join(racine, 'data/carte.svg'), 'utf8');
  const ids = { r: new Set(recits.map((x) => x.id)), l: new Set(localites.map((x) => x.id)), p: new Set(patrimoine.map((x) => x.id)), g: new Set(regions.map((x) => x.id)) };

  if (regions.length !== 17) e.push(`${regions.length} régions au lieu de 17`);
  regions.forEach((g) => { if (!carte.includes(`data-region="${g.id}"`)) e.push(`carte.svg : pas de tracé pour la région ${g.id}`); });

  for (const r of recits) {
    const m = (t) => e.push(`recits.json, ${r.id} : ${t}`);
    if (!['conte', 'legende', 'histoire'].includes(r.type)) m(`type inconnu ${r.type}`);
    if (!r.localites.length) m('aucune localité');
    r.localites.forEach((l) => { if (!ids.l.has(l)) m(`localité inconnue ${l}`); });
    (r.patrimoine || []).forEach((p) => { if (!ids.p.has(p)) m(`patrimoine inconnu ${p}`); });
    if (!dataExiste(r.texte)) m(`texte manquant ${r.texte}`);
    Object.values(r.texteLocal || {}).forEach((t) => { if (!dataExiste(t)) m(`texte manquant ${t}`); });
    for (const [lang, a] of Object.entries(r.audio || {})) {
      if (!langues[lang]) m(`langue inconnue ${lang}`);
      if (!existe(a.src)) m(`audio manquant ${a.src}`);
      if (!existe(a.vtt)) m(`sous-titres manquants ${a.vtt}`);
    }
    r.lexique.forEach((x) => { if (!langues[x.langue]) m(`lexique : langue inconnue ${x.langue}`); });
    r.langues.forEach((x) => { if (!langues[x]) m(`langue inconnue ${x}`); });
    if (!r.morale) m('morale manquante');
    if (!r.lexique.length) m('lexique vide');
    if (!r.sources.length) m('sources manquantes');
    if (!['a_valider', 'valide'].includes(r.statut)) m(`statut inconnu ${r.statut}`);
    if (!r.jouable) m('récit sans narration interactive');
    else if (!dataExiste(r.jouable)) m(`histoire jouable manquante ${r.jouable}`);
  }
  for (const l of localites) {
    const m = (t) => e.push(`localites.json, ${l.id} : ${t}`);
    if (!ids.g.has(l.region)) m(`région inconnue ${l.region}`);
    l.recits.forEach((r) => { if (!ids.r.has(r)) m(`récit inconnu ${r}`); });
    l.patrimoine.forEach((p) => { if (!ids.p.has(p)) m(`patrimoine inconnu ${p}`); });
    l.langues.forEach((x) => { if (!langues[x]) m(`langue inconnue ${x}`); });
  }
  for (const p of patrimoine) {
    const m = (t) => e.push(`patrimoine.json, ${p.id} : ${t}`);
    p.regions.forEach((g) => { if (!ids.g.has(g)) m(`région inconnue ${g}`); });
    p.recits.forEach((r) => { if (!ids.r.has(r)) m(`récit inconnu ${r}`); });
  }
  const dossier = join(racine, 'data/stories');
  for (const f of readdirSync(dossier).filter((x) => x.endsWith('.json'))) {
    const h = lire(dossier, f);
    if (!ids.r.has(h.id)) e.push(`stories/${f} : aucun récit ${h.id} dans recits.json`);
    e.push(...validerHistoire(h, { patrimoine: ids.p, fichierExiste: existe }));
  }
  return { erreurs: e, recits, localites, patrimoine, regions };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { erreurs, recits, localites, patrimoine } = validerDonnees();
  if (erreurs.length) {
    console.error(`${erreurs.length} erreur(s) :`);
    erreurs.forEach((m) => console.error(' - ' + m));
    process.exit(1);
  }
  console.log(`Données valides : ${recits.length} récits, ${localites.length} localités, ${patrimoine.length} fiches patrimoine.`);
}
