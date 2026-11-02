/*
 * Les deux axes du voyage : le temps (époques) et l'espace (lieux).
 * Chaque récit est découpé en étapes, chacune attachée à un nœud de l'histoire, un lieu et une époque.
 * Sans DOM : la carte, le jeu et les tests partagent ces fonctions.
 */

// Un lieu vient soit de localites.json (sur la carte des récits), soit de voyages.json.
export function lieuDe(id, voyages, localites) {
  const l = localites.find((x) => x.id === id);
  if (l) return { id, nom: l.nom, coords: l.coords, approx: !!l.approx, localite: true };
  const v = voyages.lieux[id];
  return v ? { id, ...v, localite: false } : null;
}

// Le nœud courant appartient à la dernière étape par laquelle on a pu y arriver.
export function etapeParNoeud(histoire, etapes) {
  const cibles = (n) => [n.next, ...(n.choices || []).map((c) => c.next), ...(n.route || []).map((r) => r.next)].filter(Boolean);
  const carte = {};
  etapes.forEach((e, i) => { carte[e.noeud] = i; });
  etapes.forEach((e, i) => {
    const pile = [e.noeud];
    while (pile.length) {
      const n = histoire.nodes[pile.pop()];
      if (!n) continue;
      for (const c of cibles(n)) {
        if (carte[c] === undefined) { carte[c] = i; pile.push(c); }
      }
    }
  });
  return carte;
}

// Toutes les étapes, tous récits confondus, pour une époque (ou une période de cette époque) et/ou un lieu.
export function etapesFiltrees(voyages, { epoque = null, lieu = null, debut, fin } = {}) {
  const res = [];
  const cran = epoque && { epoque, debut, fin };
  for (const [recit, etapes] of Object.entries(voyages.recits)) {
    etapes.forEach((e, i) => {
      if ((!cran || dansCran(e, cran)) && (!lieu || e.lieu === lieu)) res.push({ ...e, recit, index: i });
    });
  }
  return res;
}

export const epoquesDuRecit = (voyages, id) => [...new Set((voyages.recits[id] || []).map((e) => e.epoque))];

// La barre de temps : un cran par période, dans l'ordre chronologique. Les époques sans date tiennent en un cran.
export function crans(voyages) {
  const liste = [];
  for (const e of voyages.epoques) {
    if (e.debut === undefined) { liste.push({ epoque: e.id, libelle: e.court }); continue; }
    for (let a = e.debut; a <= e.fin; a += e.pas) {
      const fin = Math.min(a + e.pas - 1, e.fin);
      liste.push({ epoque: e.id, debut: a, fin, libelle: fin > a ? `${a}-${fin}` : String(a) });
    }
  }
  return liste;
}

// Une étape sans année appartient à toute son époque : on ne lui invente pas de date.
export function dansCran(e, c) {
  return e.epoque === c.epoque && (e.annee === undefined || c.debut === undefined || (e.annee >= c.debut && e.annee <= c.fin));
}

// Dans le jeu, la barre parcourt les étapes du récit : un cran par étape, dans l'ordre des époques.
export function cransDuRecit(voyages, id) {
  const rang = (e) => voyages.epoques.findIndex((p) => p.id === e.epoque);
  return (voyages.recits[id] || [])
    .map((e, i) => ({ epoque: e.epoque, debut: e.annee, fin: e.annee, libelle: e.annee ? String(e.annee) : e.titre, etape: i, rang: rang(e) }))
    .sort((a, b) => a.rang - b.rang || (a.debut ?? 0) - (b.debut ?? 0) || a.etape - b.etape);
}
