/*
 * Les motifs posés sur les objets et les habits, sans DOM ni Three.js : le script d'index et les tests s'en servent aussi.
 * Une image : public/motifs/<type>-<objet>-<numero>.png. Une composition : public/motifs/peuples.json.
 */
export function analyserNom(fichier) {
  const m = /^([a-z]+)-([a-z0-9_-]+)-(\d+)\.png$/.exec(fichier);
  return m ? { fichier, type: m[1], objet: m[2], numero: +m[3] } : null;
}

// Ce qu'on peut poser sur un objet. Les compositions par peuple ne vont que sur les objets communs à plusieurs peuples.
export function optionsMotif(objet, { images = {}, peuples = {} }, { commun = false } = {}) {
  const liste = (images[objet] || []).map((x) => ({ id: `image:${x.fichier}`, nom: `Motif n° ${x.numero}`, image: x.fichier }));
  for (const [peuple, p] of Object.entries(peuples)) {
    const image = p.images?.[objet];
    if (image) liste.push({ id: `peuple:${peuple}`, nom: peuple, peuple, image });
    else if (commun && p.composition) liste.push({ id: `peuple:${peuple}`, nom: peuple, peuple, composition: p.composition, demo: true });
  }
  return liste;
}

// Dans le jeu : le motif du peuple du récit s'il existe, sinon la première image de l'objet.
export function motifPourRecit(objet, motifs, { peuple, commun = false } = {}) {
  const options = optionsMotif(objet, motifs, { commun });
  return options.find((o) => o.peuple && o.peuple === peuple) || options.find((o) => o.image && !o.peuple) || null;
}
