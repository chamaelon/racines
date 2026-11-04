/*
 * 32 · Naaba Wobgo et la résistance de 1896. Les temps sont ceux de animations/doublage/32-naaba-wobgo/script-fr.md.
 * Récit historique : la narration suit le texte de la fiche, et l'image reste une évocation, pas une reconstitution.
 */
const colonne = (de, a, z, x0) => Object.fromEntries(['s1', 's2', 's3', 's4'].map((id, i) => [id, { style: 'garde', piste: [[de, { x: x0 - i * 2.2, z: z + (i % 2) * 1.2, rot: 90, anim: 'marche', vitesse: .8, lin: 1 }], [a, { x: x0 - i * 2.2 + (a - de) * .85, z: z + (i % 2) * 1.2, lin: 1 }]] }]));

export default {
  id: '32-naaba-wobgo',
  duree: 96,
  distribution: {
    naaba: { style: 'roi', echelle: 1.05 },
    ferguson: { style: 'explorateur' },
    voulet: { style: 'commandant' },
    chanoine: { style: 'commandant', echelle: .96 },
    sighiri: { style: 'jeune', echelle: 1.02 },
    griot: { style: 'griot' },
  },
  cartons: [
    { de: 2, a: 6.5, titre: 'Naaba Wobgo', detail: 'et la résistance de 1896', place: 'centre' },
    { de: 8, a: 12.5, titre: 'Ouagadougou', detail: 'à la fin du XIXe siècle' },
    { de: 15, a: 20, titre: 'Naaba Wobgo', detail: 'Boukary Koutou' },
    { de: 23, a: 28, titre: '1894', detail: 'George Ekem Ferguson' },
    { de: 38.5, a: 44, titre: '1896', detail: 'Paul Voulet et Julien Chanoine' },
    { de: 57.5, a: 62, titre: '1897', detail: 'Sighiri' },
    { de: 71.5, a: 77, titre: 'Gold Coast', detail: "l'actuel Ghana, 1904" },
    { de: 90, a: 95.5, titre: 'Naaba Wobgo', detail: 'Texte à valider. Racines, patrimoine du Burkina Faso', place: 'centre' },
  ],
  plans: [
    {
      de: 0, a: 14, decor: 'palais', ambiances: [[0, 'palais']], fondu: { entree: 1.5 },
      camera: [[0, [0, 5, 22], [0, 3.5, 0]], [14, [0, 3, 14], [0, 2.4, 0]]],
    },
    {
      de: 14, a: 22, decor: 'palais', ambiances: [[14, 'palais']],
      camera: [[14, [0, 2, 9], [0, 1.8, 0]], [22, [0, 1.8, 6.6], [0, 1.7, 0]]],
      acteurs: { naaba: { piste: [[14, { x: 0, z: 1, rot: 0, anim: 'repos' }], [18, { anim: 'bras_leves' }], [20, { anim: 'repos' }]] } },
    },
    {
      de: 22, a: 30, decor: 'palais', ambiances: [[22, 'palais']], fondu: { entree: .6 },
      camera: [[22, [0, 2, 9], [0, 1.7, 0]], [30, [.4, 1.8, 7.2], [0, 1.6, 0]]],
      acteurs: {
        naaba: { piste: [[22, { x: -1.5, z: 1, rot: 70, anim: 'parle' }], [26, { anim: 'tend_main' }], [28, { anim: 'parle' }]] },
        ferguson: { piste: [[22, { x: 1.6, z: 1, rot: -70, anim: 'repos' }], [26, { anim: 'tend_main' }], [28, { anim: 'incline' }]] },
      },
    },
    {
      de: 30, a: 38, decor: 'sahel', ambiances: [[30, 'soir']], fondu: { entree: .6 },
      camera: [[30, [-1, 1.9, 8.5], [0, 1.6, 0]], [38, [1, 1.7, 7], [0, 1.6, 0]]],
      acteurs: {
        voulet: { piste: [[30, { x: -1.2, z: 0, rot: 40, anim: 'parle' }], [34, { anim: 'tend_main' }]] },
        chanoine: { piste: [[30, { x: 1.2, z: 0, rot: -40, anim: 'repos' }], [34.5, { anim: 'parle' }]] },
      },
    },
    {
      de: 38, a: 46, decor: 'sahel', ambiances: [[38, 'secheresse']], fondu: { entree: .6 },
      camera: [[38, [2, 2.6, 15], [1, 1.5, 0]], [46, [6, 2, 12], [4, 1.4, 0]]],
      acteurs: {
        voulet: { piste: [[38, { x: -3, z: 0, rot: 90, anim: 'marche', vitesse: .8, lin: 1 }], [46, { x: 3.8, z: 0, lin: 1 }]] },
        chanoine: { piste: [[38, { x: -5, z: 1.5, rot: 90, anim: 'marche', vitesse: .8, lin: 1 }], [46, { x: 1.8, z: 1.5, lin: 1 }]] },
        ...colonne(38, 46, -1.5, -5),
      },
    },
    {
      de: 46, a: 57, decor: 'village', ambiances: [[46, 'soir'], [52, 'nuit-claire', 4]], fondu: { entree: .6 },
      camera: [[46, [0, 2.4, 13], [0, 2, 0]], [57, [0, 3.6, 17], [0, 2.6, 0]]],
      lumiere: [[46, { e: 1 }]],
      acteurs: { naaba: { piste: [[46, { x: 0, z: 3, rot: 180, anim: 'lutte' }], [50.5, { anim: 'effroi' }], [53, { anim: 'tete_basse' }]] } },
      objets: {
        f1: { forme: 'lumiere', couleur: '#ff7a2a', piste: [[46, { x: -5, y: 2.2, z: -3, e: 1, o: .2 }], [50, { e: 8, o: .9 }], [51, { e: 7 }], [52, { e: 9 }], [57, { e: 8, o: .75 }]] },
        f2: { forme: 'lumiere', couleur: '#ffa23c', piste: [[46, { x: 5, y: 1.8, z: -4, e: 1, o: .1 }], [50.5, { e: 7, o: .85 }], [52, { e: 9 }], [57, { e: 7, o: .7 }]] },
        f3: { forme: 'lumiere', couleur: '#ff5a1e', piste: [[46, { x: 0, y: 3, z: -7, e: 2, o: .1 }], [52, { e: 13, o: .7 }], [57, { e: 11, o: .6 }]] },
      },
    },
    {
      de: 57, a: 65, decor: 'palais', ambiances: [[57, 'soir']], fondu: { entree: .8 },
      camera: [[57, [0, 2, 9], [0, 1.7, 0]], [65, [0, 1.8, 7], [0, 1.6, 0]]],
      acteurs: {
        voulet: { piste: [[57, { x: -1.6, z: 1, rot: 60, anim: 'tend_main' }], [61, { anim: 'repos' }]] },
        sighiri: { piste: [[57, { x: 1.4, z: 1, rot: -30, anim: 'incline' }], [60.5, { rot: 0, anim: 'repos' }]] },
      },
    },
    {
      de: 65, a: 71, decor: 'brousse', ambiances: [[65, 'brousse']], fondu: { entree: .6 },
      camera: [[65, [0, 1.8, 7.5], [0, 1.5, 0]], [71, [.5, 1.6, 6.2], [0, 1.5, 0]]],
      acteurs: {
        naaba: { piste: [[65, { x: -1.3, z: 0, rot: 70, anim: 'parle' }], [68, { anim: 'offre' }]] },
        ferguson: { piste: [[65, { x: 1.4, z: 0, rot: -70, anim: 'repos' }], [68.6, { anim: 'tete_basse' }]] },
      },
    },
    {
      de: 71, a: 96, decor: 'sahel', ambiances: [[71, 'soir'], [84, 'nuit-claire', 8]], fondu: { entree: .8, sortie: 6 },
      effets: { etoiles: [[71, { n: .1, o: .1 }], [86, { n: 1, o: 1 }]] },
      camera: [[71, [-6, 2, 13], [-1, 1.6, 0]], [84, [6, 3, 17], [5, 2, 0]], [96, [7, 5, 18], [7, 5, 0]]],
      acteurs: { naaba: { piste: [[71, { x: -6, z: 0, rot: 90, anim: 'marche', vitesse: .55, lin: 1 }], [86, { x: 8, z: -3, lin: 1 }]] } },
    },
  ],
};
