/*
 * 31 · Le lièvre et l'hyène. Les temps sont ceux de animations/doublage/31-lievre-hyene/script-fr.md.
 * Le récit reste celui de la fiche : une version libre d'un motif répandu, à valider auprès d'un conteur mossi.
 */
export default {
  id: '31-lievre-hyene',
  duree: 106,
  distribution: {
    lievre: { style: 'lievre' },
    hyene: { style: 'hyene', echelle: 1.1 },
  },
  cartons: [
    { de: 2, a: 6, titre: "Le lièvre et l'hyène", detail: 'Un conte', place: 'centre' },
    { de: 17, a: 21, titre: "L'hyène", detail: 'toujours affamée' },
    { de: 29, a: 32.5, titre: 'Le lièvre', detail: 'qui garde son calme' },
    { de: 52.5, a: 56, titre: 'Première année', detail: 'des arachides' },
    { de: 68.5, a: 72, titre: 'Année suivante', detail: 'du mil' },
    { de: 98, a: 105, titre: "Le lièvre et l'hyène", detail: 'Version libre, à valider auprès des conteurs. Racines, patrimoine du Burkina Faso', place: 'centre' },
  ],
  plans: [
    {
      de: 0, a: 15.5, decor: 'sahel', ambiances: [[0, 'secheresse']], fondu: { entree: 1.5 },
      camera: [[0, [-9, 4, 18], [0, 2, 0]], [15.5, [5, 2.6, 13], [1, 1.6, 0]]],
      acteurs: { lievre: { piste: [[0, { x: -9, z: 2, rot: 90, anim: 'marche', vitesse: .8, lin: 1 }], [15.5, { x: 6, z: 2, lin: 1 }]] } },
    },
    {
      de: 15.5, a: 29, decor: 'brousse', ambiances: [[15.5, 'brousse']], fondu: { entree: .6 },
      camera: [[15.5, [0, 2.2, 11], [0, 1.4, 0]], [22, [0, 1.8, 8], [0, 1.2, 0]], [29, [-.6, 1.5, 6.4], [-.8, 1.3, 0]]],
      acteurs: {
        lievre: { piste: [[15.5, { x: 1.5, z: 0, rot: 90, anim: 'marche', vitesse: .8, lin: 1 }], [20, { x: 2.5, lin: 1 }], [21.2, { rot: -80, anim: 'effroi' }], [24.5, { anim: 'tete_basse' }]] },
        hyene: { piste: [[15.5, { x: -8, z: 0, rot: 90, anim: 'court', lin: 1 }], [21, { x: .9, z: 0, lin: 1 }], [21.6, { anim: 'frappe' }], [24, { anim: 'parle' }]] },
      },
    },
    {
      de: 29, a: 46, decor: 'champ', ambiances: [[29, 'champ']], fondu: { entree: .8 },
      camera: [[29, [1.4, 1.6, 7], [1, 1.1, 0]], [33.5, [0, 1.8, 8], [0, 1.2, 0]], [46, [-1, 2.4, 11], [0, 1.4, 0]]],
      acteurs: {
        lievre: { piste: [[29, { x: 1.6, z: 0, rot: -60, anim: 'repos' }], [33.2, { anim: 'parle' }], [38, { anim: 'offre' }], [41, { anim: 'parle' }], [44, { anim: 'tend_main' }]] },
        hyene: { piste: [[29, { x: -1.6, z: 0, rot: 60, anim: 'repos' }], [39, { anim: 'tete_basse' }], [43, { anim: 'repos' }]] },
      },
    },
    {
      de: 46, a: 52, decor: 'champ', ambiances: [[46, 'champ']],
      camera: [[46, [-5, 1.6, 7.5], [-3, .9, 0]], [52, [-4, 1.1, 5.6], [-3, .5, 0]]],
      acteurs: {
        hyene: { piste: [[46, { x: -3, z: 0, rot: 60, anim: 'parle' }], [48.2, { anim: 'allonge' }]] },
        lievre: { piste: [[46, { x: 1.5, z: -2, rot: 110, anim: 'marche', vitesse: .8, lin: 1 }], [52, { x: 5, z: -2.5, lin: 1 }]] },
      },
    },
    {
      de: 52, a: 62, decor: 'champ', ambiances: [[52, 'champ']], fondu: { entree: .6 },
      camera: [[52, [0, 2.4, 11], [0, 1.2, 0]], [62, [.6, 1.8, 7.6], [0, 1, 0]]],
      acteurs: {
        lievre: { piste: [[52, { x: 1.8, z: 0, rot: 20, anim: 'cueille' }], [58, { anim: 'danse' }]] },
        hyene: { piste: [[52, { x: -2.2, z: 0, rot: 40, anim: 'allonge' }], [56.5, { anim: 'repos' }], [58, { anim: 'effroi' }]] },
      },
      objets: {
        g1: { forme: 'gerbe', piste: [[52, { x: 3, y: 0, z: .4, e: 0 }], [56, { e: 1.1 }]] },
        g2: { forme: 'gerbe', piste: [[52, { x: 3.9, y: 0, z: -.3, e: 0 }], [57, { e: 1.2 }]] },
        f1: { forme: 'feuilles', piste: [[52, { x: -3.2, y: 0, z: .4, e: 0 }], [56.5, { e: .7 }]] },
      },
    },
    {
      de: 62, a: 68, decor: 'champ', ambiances: [[62, 'soir']], fondu: { entree: .6 },
      camera: [[62, [0, 1.5, 6.6], [0, 1.2, 0]], [68, [0, 1.3, 5.6], [0, 1.1, 0]]],
      acteurs: {
        hyene: { piste: [[62, { x: -1.3, z: 0, rot: 70, anim: 'frappe' }], [65, { anim: 'parle' }]] },
        lievre: { piste: [[62, { x: 1.3, z: 0, rot: -70, anim: 'repos' }], [64, { anim: 'incline' }]] },
      },
    },
    {
      de: 68, a: 75, decor: 'champ', ambiances: [[68, 'champ']], fondu: { entree: .6 },
      camera: [[68, [0, 2.2, 10], [0, 1.2, 0]], [75, [-.8, 1.6, 7], [-.6, 1, 0]]],
      acteurs: {
        lievre: { piste: [[68, { x: 2, z: 0, rot: 10, anim: 'cueille' }], [72, { anim: 'danse' }]] },
        hyene: { piste: [[68, { x: -2, z: 0, rot: 30, anim: 'regarde_haut' }], [71, { anim: 'tete_basse' }]] },
      },
      objets: {
        g1: { forme: 'gerbe', piste: [[68, { x: 3.1, y: 0, z: .5, e: 1 }]] },
        g2: { forme: 'gerbe', piste: [[68, { x: 3.9, y: 0, z: -.2, e: 1.2 }]] },
        g3: { forme: 'gerbe', piste: [[68, { x: 2.6, y: 0, z: -.8, e: 1.1 }]] },
      },
    },
    {
      de: 75, a: 88, decor: 'marche', ambiances: [[75, 'marche']], fondu: { entree: .6 },
      camera: [[75, [0, 2, 9.5], [0, 1.3, 0]], [83, [.4, 1.7, 7.5], [.2, 1.2, 0]], [88, [3.5, 2.2, 9], [3, 1.2, 0]]],
      acteurs: {
        hyene: { piste: [[75, { x: -1.4, z: 1, rot: 70, anim: 'repos' }], [78, { anim: 'parle' }], [83, { anim: 'effroi' }], [85.5, { anim: 'tete_basse' }]] },
        lievre: { piste: [[75, { x: 7, z: 1, rot: -90, anim: 'marche', vitesse: .8, lin: 1 }], [78, { x: 1.4, z: 1, lin: 1 }], [78.2, { anim: 'repos', rot: -70 }], [83, { anim: 'parle' }], [85.5, { rot: 90, anim: 'court', x: 1.4, lin: 1 }], [88, { x: 8, lin: 1 }]] },
      },
    },
    {
      de: 88, a: 106, decor: 'nuit', ambiances: [[88, 'nuit-claire']], fondu: { entree: 1, sortie: 7 },
      effets: { etoiles: [[88, { n: 1, o: 1 }]] },
      camera: [[88, [-5, 1.8, 11], [-1, 1.2, 0]], [96, [1, 1.3, 8], [1.6, .8, 0]], [106, [1.4, 3, 12], [1, 2.5, 0]]],
      acteurs: {
        hyene: { piste: [[88, { x: -7, z: -1.5, rot: 90, anim: 'marche', vitesse: .7, lin: 1 }], [97, { x: -1.5, z: -1.5, lin: 1 }], [97.4, { anim: 'regarde_haut' }]] },
        lievre: { piste: [[88, { x: 2.5, z: 1, rot: -20, anim: 'allonge' }]] },
      },
    },
  ],
};
