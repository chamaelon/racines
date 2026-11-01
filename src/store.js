/*
 * La progression du visiteur, dans localStorage. Si le stockage est refusé (navigation privée),
 * tout reste en mémoire le temps de la visite.
 */
const CLE = 'racines-progression';
const defaut = () => ({ recits: {}, fins: {}, objets: [], sauvegardes: {}, audio: {}, prefs: { son: true, vitesse: 1, intro: false } });

function lire() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE));
    if (!v) return defaut();
    const d = defaut();
    return { ...d, ...v, prefs: { ...d.prefs, ...v.prefs } };
  } catch (e) { return defaut(); }
}
let etat = lire();
function ecrire() {
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* stockage refusé : on garde en mémoire */ }
}

export const store = {
  recit: (id) => etat.recits[id] || {},
  // champ : lu, ecoute, joue ou termine
  marquer(id, champ) { etat.recits[id] = { ...etat.recits[id], [champ]: true }; ecrire(); },
  estTermine(id) { const r = etat.recits[id] || {}; return !!(r.lu || r.termine); },
  fins: (id) => etat.fins[id] || [],
  ajouterFin(id, fin) {
    const f = etat.fins[id] || [];
    if (!f.includes(fin)) etat.fins[id] = [...f, fin];
    etat.recits[id] = { ...etat.recits[id], termine: true };
    ecrire();
  },
  objets: () => etat.objets,
  ajouterObjet(id) { if (!etat.objets.includes(id)) { etat.objets.push(id); ecrire(); } },
  sauvegarde: (id) => etat.sauvegardes[id] || null,
  sauvegarder(id, s) { if (s) etat.sauvegardes[id] = s; else delete etat.sauvegardes[id]; ecrire(); },
  positionAudio: (id, langue) => (etat.audio[id] || {})[langue] || 0,
  retenirAudio(id, langue, t) { etat.audio[id] = { ...etat.audio[id], [langue]: t }; ecrire(); },
  pref: (k) => etat.prefs[k],
  definirPref(k, v) { etat.prefs[k] = v; ecrire(); },
  compteurs() {
    const r = Object.values(etat.recits);
    return {
      lus: r.filter((x) => x.lu).length,
      ecoutes: r.filter((x) => x.ecoute).length,
      joues: r.filter((x) => x.joue).length,
      termines: Object.keys(etat.recits).filter((id) => store.estTermine(id)).length,
      fins: Object.values(etat.fins).reduce((n, f) => n + f.length, 0),
      objets: etat.objets.length,
    };
  },
  reinitialiser() { const prefs = etat.prefs; etat = { ...defaut(), prefs }; ecrire(); },
};
