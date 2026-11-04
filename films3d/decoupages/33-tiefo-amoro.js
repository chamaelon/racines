/*
 * 33 · Tiéfo Amoro et Noumoudara. Les temps sont ceux de animations/doublage/33-tiefo-amoro/script-fr.md.
 * Récit historique à source unique : la narration suit la fiche et garde ses réserves. L'image reste une évocation.
 * La fin de Tiéfo Amoro n'est pas montrée : le texte la rapporte au conditionnel.
 */
const groupe = (ids, style, xs, z, rot, piste) => Object.fromEntries(ids.map((id, i) => [id, { style, piste: [[piste[0], { x: xs[i], z: z + (i % 2) * 1.3, rot, anim: piste[1] }]] }]));

export default {
  id: '33-tiefo-amoro',
  duree: 90,
  distribution: {
    amoro: { style: 'roi', echelle: 1.05 },
    samory: { style: 'cavalier', echelle: 1.05 },
    griot: { style: 'griot' },
  },
  cartons: [
    { de: 2, a: 6, titre: 'Tiéfo Amoro', detail: 'et Noumoudara', place: 'centre' },
    { de: 8, a: 12.5, titre: 'Noumoudara', detail: 'le principal centre des Tiéfo' },
    { de: 15, a: 19, titre: 'Tiéfo Amoro', detail: 'onzième chef des Tiéfo, selon une conférence' },
    { de: 31.5, a: 36, titre: '1897', detail: 'Samory Touré' },
    { de: 39, a: 46, titre: 'Bama, Péni, Noumoudara' },
    { de: 83, a: 89.5, titre: 'Tiéfo Amoro', detail: 'Une seule source, à valider. Racines, patrimoine du Burkina Faso', place: 'centre' },
  ],
  plans: [
    {
      de: 0, a: 14, decor: 'village-soudanais', ambiances: [[0, 'village-soudanais']], fondu: { entree: 1.5 },
      camera: [[0, [-8, 5, 21], [0, 3, 0]], [14, [5, 3, 15], [0, 2.3, 0]]],
    },
    {
      de: 14, a: 31, decor: 'village-soudanais', ambiances: [[14, 'village-soudanais']], fondu: { entree: .6 },
      camera: [[14, [0, 2, 9], [0, 1.8, 0]], [20, [0, 1.8, 7], [0, 1.7, 0]], [31, [-1.4, 2.2, 9.5], [0, 1.6, 0]]],
      acteurs: {
        amoro: { piste: [[14, { x: 0, z: 1, rot: 0, anim: 'repos' }], [19, { anim: 'bras_leves' }], [22, { anim: 'parle' }], [27, { anim: 'repos' }]] },
        griot: { piste: [[20, { x: -3.4, z: 2, rot: 40, anim: 'parle' }]] },
      },
    },
    {
      de: 31, a: 38, decor: 'sahel', ambiances: [[31, 'secheresse']], fondu: { entree: .6 },
      camera: [[31, [1, 2.6, 15], [0, 1.6, 0]], [38, [4, 2.2, 12], [2.5, 1.5, 0]]],
      acteurs: {
        samory: { piste: [[31, { x: -5, z: 0, rot: 90, anim: 'marche', vitesse: .85, lin: 1 }], [38, { x: 2.5, z: 0, lin: 1 }]] },
        c1: { style: 'guerrier', piste: [[31, { x: -8, z: 1.4, rot: 90, anim: 'marche', vitesse: .85, lin: 1 }], [38, { x: -.5, z: 1.4, lin: 1 }]] },
        c2: { style: 'guerrier', piste: [[31, { x: -8.5, z: -1.4, rot: 90, anim: 'marche', vitesse: .85, lin: 1 }], [38, { x: -1, z: -1.4, lin: 1 }]] },
        c3: { style: 'guerrier', piste: [[31, { x: -11, z: 0, rot: 90, anim: 'marche', vitesse: .85, lin: 1 }], [38, { x: -3.5, z: 0, lin: 1 }]] },
      },
    },
    {
      de: 38, a: 49, decor: 'rochers', ambiances: [[38, 'rochers']], fondu: { entree: .6 },
      camera: [[38, [0, 2.5, 13], [0, 1.6, 0]], [49, [0, 2, 10], [0, 1.5, 0]]],
      acteurs: {
        amoro: { piste: [[38, { x: -3, z: 0, rot: 90, anim: 'lutte' }]] },
        ...groupe(['d1', 'd2'], 'guerrier', [-4.6, -5], -1, 90, [38, 'lutte']),
        samory: { piste: [[38, { x: 3, z: 0, rot: -90, anim: 'lutte' }]] },
        ...groupe(['c1', 'c2'], 'guerrier', [4.6, 5], -1, -90, [38, 'lutte']),
      },
    },
    {
      de: 49, a: 53, decor: 'ruines', ambiances: [[49, 'orage']], fondu: { entree: .4 },
      camera: [[49, [7, 3, 15], [0, 2.4, 0]], [53, [5, 2.8, 13], [0, 2.4, 0]]],
      acteurs: {
        samory: { piste: [[49, { x: 5, z: 4, rot: -60, anim: 'tend_main' }]] },
        ...groupe(['c1', 'c2'], 'guerrier', [3.4, 6.8], 3, -70, [49, 'repos']),
      },
    },
    {
      de: 53, a: 62, decor: 'ruines', ambiances: [[53, 'orage'], [58, 'soir', 3]], fondu: { entree: .4 },
      camera: [[53, [-4, 2.8, 15], [0, 2.4, 0]], [62, [4, 4.5, 20], [0, 2.8, 0]]],
      effets: { poussiere: [{ t: 56, x: -2, n: 30 }, { t: 57, x: 3, n: 30 }, { t: 58.5, x: 0, n: 30 }] },
    },
    {
      de: 62, a: 76, decor: 'sahel', ambiances: [[62, 'soir']], fondu: { entree: .8 },
      camera: [[62, [0, 1.7, 7], [0, 1.6, 0]], [76, [.6, 2.6, 12], [0, 1.8, 0]]],
      acteurs: { amoro: { piste: [[62, { x: 0, z: 0, rot: 0, anim: 'tete_basse' }], [69, { anim: 'regarde_haut' }]] } },
    },
    {
      de: 76, a: 90, decor: 'veillee', ambiances: [[76, 'veillee']], fondu: { entree: .8, sortie: 5 },
      camera: [[76, [0, 2, 8.6], [0, 1.4, 0]], [90, [0, 1.8, 7], [0, 1.3, 0]]],
      acteurs: { griot: { piste: [[76, { x: -2.3, z: 1.2, rot: 55, anim: 'assis_parle' }]] } },
    },
  ],
};
