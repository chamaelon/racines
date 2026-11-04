/*
 * 34 · Les kinkirsi. Les temps sont ceux de animations/doublage/34-kinkirsi/script-fr.md.
 * La fiche résume des descriptions publiées, sans raconter de légende précise : l'image reste une évocation.
 */
export default {
  id: '34-kinkirsi',
  duree: 79,
  distribution: {
    ancienne: { style: 'vieille' },
    enfant: { style: 'enfant' },
    jumeau: { style: 'enfant', echelle: .98 },
    kinkirga: { style: 'genie', echelle: .8 },
    k2: { style: 'genie', echelle: .72 },
    k3: { style: 'genie', echelle: .76 },
    griot: { style: 'griot' },
  },
  cartons: [
    { de: 2, a: 6, titre: 'Les kinkirsi', detail: 'génies de la brousse', place: 'centre' },
    { de: 22.3, a: 26, titre: 'Kinkirga', detail: 'au singulier' },
    { de: 37.5, a: 44, titre: 'Ce qui est doux', detail: 'miel, sésame, gâteaux de haricots, arachide' },
    { de: 47, a: 52, titre: 'Les jumeaux' },
    { de: 73, a: 78.5, titre: 'Les kinkirsi', detail: 'À collecter auprès des conteurs. Racines, patrimoine du Burkina Faso', place: 'centre' },
  ],
  plans: [
    {
      de: 0, a: 16, decor: 'brousse', ambiances: [[0, 'soir'], [12, 'nuit-claire', 5]], fondu: { entree: 1.5 },
      effets: { etoiles: [[0, { n: .05, o: .1 }], [14, { n: .6, o: .8 }]] },
      camera: [[0, [-7, 2.2, 13], [-1, 1.6, 0]], [16, [3, 1.8, 10], [1, 1.4, 0]]],
      acteurs: { ancienne: { piste: [[0, { x: -6, z: 1, rot: 90, anim: 'marche', vitesse: .55, lin: 1 }], [13, { x: 1, z: 1, lin: 1 }], [13.4, { rot: 180, anim: 'regarde_haut' }]] } },
      objets: { l1: { forme: 'lumiere', couleur: '#9fe8c8', piste: [[8, { x: 6, y: 1.4, z: -3, e: .1, o: 0 }], [13, { e: 1.1, o: .9 }], [16, { x: 4, y: 1.8 }]] } },
    },
    {
      de: 16, a: 26, decor: 'bois', ambiances: [[16, 'nuit-claire']], fondu: { entree: .8 },
      effets: { etoiles: [[16, { n: .8, o: 1 }]] },
      camera: [[16, [-3, 1.6, 9], [0, 1.1, 0]], [22, [0, 1.5, 7], [0, 1.1, 0]], [26, [.6, 1.3, 5.4], [.2, 1.2, 0]]],
      acteurs: {
        kinkirga: { piste: [[16, { x: -4, z: 0, rot: 80, anim: 'marche', vitesse: .7, lin: 1 }], [22, { x: 0, z: 0, lin: 1 }], [22.3, { rot: 10, anim: 'danse' }]] },
        k2: { piste: [[16, { x: -6, z: 1, rot: 80, anim: 'marche', vitesse: .7, lin: 1 }], [22, { x: -2.4, z: 1, lin: 1 }], [22.3, { rot: 30, anim: 'repos' }]] },
      },
      objets: { l1: { forme: 'lumiere', couleur: '#9fe8c8', accroche: { acteur: 'kinkirga', os: 'torse' }, piste: [[16, { e: 1.5, o: .55 }]] } },
    },
    {
      de: 26, a: 37, decor: 'bois', ambiances: [[26, 'nuit-claire']], fondu: { entree: .6 },
      effets: { etoiles: [[26, { n: .8, o: 1 }]] },
      camera: [[26, [0, 2.1, 10], [0, 1.1, 0]], [37, [2, 1.7, 8], [0, 1.1, 0]]],
      acteurs: {
        kinkirga: { piste: [[26, { x: 0, z: 0, rot: 0, anim: 'parle' }]] },
        k2: { piste: [[26, { x: -2, z: .6, rot: 40, anim: 'repos' }]] },
        k3: { piste: [[26, { x: 2, z: .6, rot: -40, anim: 'repos' }], [31, { anim: 'incline' }]] },
      },
      objets: { l1: { forme: 'lumiere', couleur: '#9fe8c8', piste: [[26, { x: 0, y: 1.2, z: -.4, e: 5, o: .35 }]] } },
    },
    {
      de: 37, a: 46, decor: 'veillee', ambiances: [[37, 'veillee']], fondu: { entree: .6 },
      camera: [[37, [0, 1.9, 7.5], [0, .9, 0]], [46, [1, 1.5, 6], [0, 1, 0]]],
      acteurs: {
        kinkirga: { piste: [[37, { x: -1.4, z: 0, rot: 60, anim: 'cueille' }], [41, { anim: 'danse' }]] },
        k3: { piste: [[37, { x: 1.5, z: .2, rot: -60, anim: 'offre' }]] },
      },
      objets: {
        g1: { forme: 'gerbe', piste: [[37, { x: 1, y: 0, z: 2.6, e: 1 }]] },
        n1: { forme: 'natte', piste: [[37, { x: -.6, y: 0, z: 2.8, e: 1 }]] },
      },
    },
    {
      de: 46, a: 63, decor: 'village', ambiances: [[46, 'village'], [58, 'soir', 4]], fondu: { entree: 1 },
      camera: [[46, [0, 1.6, 7], [0, 1.1, 0]], [57, [.4, 1.3, 5.2], [0, 1.1, 0]], [63, [-.5, 2, 8], [0, 1.2, 0]]],
      acteurs: {
        enfant: { piste: [[46, { x: -.7, z: 1, rot: 15, anim: 'danse' }], [57, { anim: 'parle' }]] },
        jumeau: { piste: [[46, { x: .7, z: 1, rot: -15, anim: 'danse' }], [58, { anim: 'regarde_haut' }]] },
        kinkirga: { piste: [[56.5, { x: 3, z: -.5, rot: -60, anim: 'repos' }]], echelle: .75 },
      },
      objets: { l1: { forme: 'lumiere', couleur: '#9fe8c8', piste: [[46, { x: 3, y: 1.1, z: -.7, e: .1, o: 0 }], [56.5, { e: .1, o: 0 }], [58, { e: 3, o: .6 }]] } },
    },
    {
      de: 63, a: 79, decor: 'veillee', ambiances: [[63, 'veillee']], fondu: { entree: 1, sortie: 5 },
      camera: [[63, [0, 2, 8.6], [0, 1.4, 0]], [79, [0, 1.8, 7], [0, 1.3, 0]]],
      acteurs: { griot: { piste: [[63, { x: -2.3, z: 1.2, rot: 55, anim: 'assis_parle' }]] } },
    },
  ],
};
