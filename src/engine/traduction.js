/*
 * Les textes d'une histoire jouable, repérés par leur chemin dans le JSON.
 * Le générateur de bandes-son les liste ; le jeu remplace ces mêmes chemins par la langue choisie.
 * Sans DOM : le script Node et les tests s'en servent aussi.
 */
export function champsTexte(h) {
  const c = [];
  const ajoute = (chemin, texte, type, extra = {}) => { if (texte) c.push({ chemin, texte, type, ...extra }); };
  ajoute('titre', h.titre, 'titre');
  ajoute('presentation', h.presentation, 'presentation');
  for (const [id, p] of Object.entries(h.personnages || {})) ajoute(`personnages.${id}.nom`, p.nom, 'personnage');
  for (const [id, t] of Object.entries(h.fins || {})) ajoute(`fins.${id}`, t, 'fin');
  for (const [id, n] of Object.entries(h.nodes)) {
    const p = `nodes.${id}`;
    ajoute(`${p}.text`, n.text, 'replique', { noeud: id, speaker: n.speaker });
    (n.choices || []).forEach((x, i) => {
      ajoute(`${p}.choices.${i}.label`, x.label, 'choix', { noeud: id });
      ajoute(`${p}.choices.${i}.tag`, x.tag, 'parcours', { noeud: id });
    });
    ajoute(`${p}.consigne`, n.consigne, 'jeu', { noeud: id });
    ajoute(`${p}.question`, n.question, 'jeu', { noeud: id });
    ajoute(`${p}.gagne`, n.gagne, 'jeu', { noeud: id });
    ajoute(`${p}.perdu`, n.perdu, 'jeu', { noeud: id });
    (n.reponses || []).forEach((x, i) => ajoute(`${p}.reponses.${i}.label`, x.label, 'jeu', { noeud: id }));
    for (const [k, t] of Object.entries(n.tags || {})) ajoute(`${p}.tags.${k}`, t, 'parcours', { noeud: id });
  }
  return c;
}

function poser(racine, chemin, valeur) {
  const morceaux = chemin.split('.');
  const dernier = morceaux.pop();
  let o = racine;
  for (const m of morceaux) { o = o?.[m]; if (o === undefined) return false; }
  if (!o || !(dernier in o)) return false;
  o[dernier] = valeur;
  return true;
}

// Renvoie une copie de l'histoire dans la langue voulue. Un texte non traduit reste en français.
// La traduction vient de pistes.json, ou à défaut du fichier translate-<langue>.json (dico).
export function traduire(histoire, pistes, langue, dico = {}) {
  const copie = structuredClone(histoire);
  if (langue === 'fr') return copie;
  for (const c of champsTexte(histoire)) {
    if (dico[c.texte]) poser(copie, c.chemin, dico[c.texte]);
  }
  for (const p of pistes?.pistes || []) {
    const t = p.chemin && p.langues?.[langue]?.texte;
    if (t) poser(copie, p.chemin, t);
  }
  return copie;
}

// Part des textes d'une histoire présents dans un dictionnaire, en pourcentage.
export function partTraduite(histoire, dico) {
  const champs = champsTexte(histoire);
  return champs.length ? Math.round(100 * champs.filter((c) => dico[c.texte]).length / champs.length) : 0;
}

// Fichier de voix d'une réplique : relatif au dossier public, ou null s'il n'est pas enregistré.
export function voixDe(pistes, noeud, langue) {
  const p = pistes?.pistes.find((x) => x.type === 'replique' && x.noeud === noeud);
  const l = p?.langues?.[langue];
  return l?.statut === 'enregistre' && l.fichier ? `bandes-son/${pistes.id}/${l.fichier}` : null;
}
