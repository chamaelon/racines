/*
 * 03 · Wuro et le pilon. Les temps sont ceux du film, en secondes : les mêmes que animations/doublage/03-wuro-pilon/script-fr.md.
 * Le scénario reste celui de animations/histoires/03-wuro-pilon/00-ecriture/ecriture.md (adaptation à vérifier auprès d'un conteur bwa).
 * Un plan : ce qu'on voit de t = de à t = a. Une piste : [[t, { x, y, z, rot, anim, … }], …], où chaque clé glisse d'une image-clé à l'autre.
 * Face au spectateur : rot 0. Vers la droite de l'écran : rot 90. Le côté « D » d'un personnage de face est à gauche de l'écran.
 */
const VILLAGE = 'village-soudanais';

// Les villageois d'arrière-plan : ils entrent, regardent, puis font ce que le plan demande.
const foule = (entrees) => Object.fromEntries(entrees.map(([id, style, piste]) => [id, { style, piste }]));

export default {
  id: '03-wuro-pilon',
  duree: 352,
  distribution: {
    wuro: { style: 'createur', echelle: 1.7 },
    tiko: { style: 'enfant' },
    bado: { style: 'forgeron', echelle: 1.08 },
    sanou: { style: 'jeune', echelle: 1.06 },
    hame: { style: 'femme', echelle: .95 },
    yeli: { style: 'ancien' },
    hyene: { style: 'hyene', echelle: .95 },
    kwere: { style: 'genie', echelle: 1.1 },
    soxo: { style: 'esprit', echelle: 1.05 },
    dwo: { style: 'masque', echelle: 1.3 },
  },
  // Les textes à l'écran ne sont pas dans l'image : le lecteur du site les affiche, traduits (translate-<langue>.json).
  cartons: [
    { de: 2, a: 7, titre: 'Wuro et le pilon', detail: 'Un mythe du pays bwa', place: 'centre' },
    { de: 24, a: 29, titre: 'Wuro', detail: 'le Créateur' },
    { de: 31, a: 36, titre: 'Pays bwa, au commencement', detail: 'quand le ciel touchait les toits' },
    { de: 41, a: 45, titre: 'Tiko', detail: 'un enfant du village' },
    { de: 52, a: 56, titre: 'Bado', detail: 'le forgeron' },
    { de: 77.5, a: 81, titre: 'La cour de Hamé' },
    { de: 81.5, a: 85.5, titre: 'Hamé', detail: 'pile le mil' },
    { de: 175.5, a: 179, titre: 'Sanou', detail: 'un jeune cultivateur' },
    { de: 195.5, a: 199.5, titre: 'Yéli', detail: "l'Ancien du village" },
    { de: 226, a: 231, titre: 'Kwere', detail: 'la foudre' },
    { de: 253, a: 257, titre: 'La brousse' },
    { de: 266, a: 270.5, titre: 'Soxo', detail: "l'esprit de la brousse" },
    { de: 291, a: 296, titre: 'Dwo', detail: 'le masque de feuilles' },
    { de: 343, a: 346, titre: 'Fin', place: 'centre' },
    { de: 346, a: 351.5, titre: 'Wuro et le pilon', detail: "D'après un mythe bwaba (Burkina Faso). Adaptation libre, à vérifier auprès des conteurs. Racines, patrimoine oral du Burkina Faso.", place: 'centre' },
  ],
  plans: [
    // ---- 1 · La création
    {
      de: 0, a: 13, ambiances: [[0, 'cosmos']], fondu: { entree: 1.5 },
      camera: [[0, [0, 2.4, 11], [0, 2.4, 0]], [13, [0, 2.2, 8.5], [0, 2.6, 0]]],
      acteurs: { wuro: { piste: [[0, { y: .6, rot: 0, anim: 'repos', e: .9 }], [3, { e: 1 }], [7, { anim: 'bras_leves' }]] } },
      objets: { halo: { forme: 'lumiere', accroche: { acteur: 'wuro', os: 'torse' }, piste: [[0, { e: .4, o: 1 }], [3.5, { e: 9, o: .75 }]] } },
      effets: { etoiles: [[0, { n: .02, o: 1 }], [7, { n: .05 }], [12.5, { n: 1 }]] },
    },
    {
      de: 13, a: 30, decor: 'fleuve', ambiances: [[13, 'cosmos'], [22, 'aube', 8]],
      pisteDecor: [[13, { y: -22 }], [22, { y: 0 }]],
      camera: [[13, [0, 7, 17], [0, 4.5, 0]], [22, [0, 7.5, 15], [0, 3.2, 0]], [30, [2, 5.2, 12], [0, 2.8, 0]]],
      acteurs: { wuro: { echelle: 2.2, piste: [[13, { x: 0, y: 2, z: -2, anim: 'offre' }], [19, { anim: 'tend_main' }], [24, { anim: 'parle' }], [30, { y: .1 }]] } },
      objets: { halo: { forme: 'lumiere', accroche: { acteur: 'wuro', os: 'torse' }, piste: [[13, { e: 13, o: .6 }], [26, { e: 10, o: .22 }]] } },
      effets: { etoiles: [[13, { n: 1, o: 1 }], [20, { o: 1 }], [26, { o: 0 }]] },
    },

    // ---- 2 · Le ciel bas
    {
      de: 30, a: 40, decor: VILLAGE, ambiances: [[30, 'village-soudanais']], fondu: { entree: 1 },
      camera: [[30, [-11, 2.6, 15], [-3, 2.6, 0]], [40, [3, 2.2, 13], [3, 2.8, 0]]],
      acteurs: {
        wuro: { piste: [[30, { x: -9, z: 1, rot: 88, anim: 'marche', vitesse: .6, lin: 1 }], [40, { x: 6.2, z: 1.2, lin: 1 }]] },
        ...foule([
          ['f1', 'marchande', [[30, { x: -2, z: 3, rot: -30, anim: 'regarde_haut' }]]],
          ['f2', 'paysan', [[30, { x: 3, z: 2.8, rot: -30, anim: 'regarde_haut' }]]],
          ['f3', 'jeune_fille', [[30, { x: 9, z: 2.2, rot: -50, anim: 'repos' }]]],
        ]),
      },
      objets: {
        n1: { forme: 'nuage', graine: 'a', piste: [[30, { x: -8, y: 6.2, z: -6, e: 1.4 }], [40, { x: -5 }]] },
        n2: { forme: 'nuage', graine: 'b', piste: [[30, { x: 3, y: 6.9, z: -9, e: 1.8 }], [40, { x: 6 }]] },
        n3: { forme: 'nuage', graine: 'c', piste: [[30, { x: 13, y: 5.8, z: -7, e: 1.2 }], [40, { x: 15 }]] },
      },
    },
    {
      de: 40, a: 51, decor: VILLAGE, ambiances: [[40, 'village-soudanais']],
      camera: [[40, [0, 2.1, 9.5], [0, 1.9, 0]], [46, [.6, 2, 8.3], [0, 2.3, 0]], [51, [.6, 2.5, 8], [0, 3.1, 0]]],
      acteurs: {
        wuro: { piste: [[40, { x: 0, z: 0, rot: 12, anim: 'repos' }], [45.4, { anim: 'souleve' }]] },
        tiko: {
          piste: [
            [40, { x: -3, z: 1.4, rot: 70, anim: 'court', vitesse: .8, lin: 1 }], [41.5, { x: 1.7, z: 1.5, rot: 70, lin: 1 }], [42, { rot: -30 }],
            [43, { x: 1.2, z: -1.2, rot: 200, lin: 1 }], [44, { x: -1.4, z: -1, rot: 270, lin: 1 }], [45, { x: -.6, z: 1.1, rot: 40, lin: 1 }], [45.4, { x: -.1, z: .55, rot: 0, y: 0, anim: 'bras_leves' }],
            [46.4, { y: 3, z: .3 }], [47.1, { y: 4 }], [47.8, { y: 3 }], [48.5, { y: 4 }], [49.2, { y: 3 }], [50.4, { rx: 0 }],
          ],
        },
      },
      objets: { n1: { forme: 'nuage', graine: 'a', piste: [[40, { x: -7, y: 9, z: -9, e: 1.3 }], [51, { x: -4.5 }]] } },
    },
    {
      de: 51, a: 60.5, decor: VILLAGE, ambiances: [[51, 'village-soudanais']],
      camera: [[51, [-1.6, 2.1, 7.8], [.3, 2, 0]], [60.5, [-.8, 2, 7], [.3, 2, 0]]],
      acteurs: {
        wuro: { piste: [[51, { x: 1.7, z: 0, rot: -65, anim: 'repos' }], [53, { anim: 'offre' }]] },
        bado: { piste: [[51, { x: -3.2, z: .4, rot: 80, anim: 'marche', lin: 1 }], [53.3, { x: -.8, z: .4, rot: 80, anim: 'repos', lin: 1 }], [55.3, { anim: 'incline' }], [58.2, { anim: 'offre' }]] },
      },
      objets: { gerbe: { forme: 'gerbe', piste: [[51, { x: .95, y: 1.75, z: .6, e: 1.5, rz: 80 }], [58.3, { x: .95 }], [60, { x: .1, y: 1.15, rz: 88 }]] } },
    },
    {
      de: 60.5, a: 77, decor: VILLAGE, ambiances: [[60.5, 'village-soudanais']],
      camera: [[60.5, [1.8, 2.7, 6.2], [1.2, 2.5, 0]], [66.5, [1, 2.5, 7.5], [.6, 2.1, 0]], [77, [-2, 2.2, 9.5], [-1, 1.4, 0]]],
      acteurs: {
        wuro: { piste: [[60.5, { x: 1.7, z: 0, rot: -35, anim: 'parle' }], [66.4, { anim: 'repos' }], [69, { anim: 'marche', vitesse: .6, rot: 90, lin: 1 }], [77, { x: 9, lin: 1 }]] },
        bado: { piste: [[60.5, { x: -.8, z: .4, rot: 50, anim: 'offre' }], [69, { anim: 'regarde_haut', rot: 66 }]] },
        tiko: { piste: [[60.5, { x: -2.6, z: 1.3, rot: 40, anim: 'regarde_haut' }]] },
      },
      objets: { gerbe: { forme: 'gerbe', accroche: { acteur: 'bado', os: 'main.D' }, piste: [[60.5, { e: 1.5, rz: 88, y: .02 }]] } },
    },

    // ---- 3 · Le pilon
    {
      de: 77, a: 87, decor: VILLAGE, ambiances: [[77, 'village-soudanais']], fondu: { entree: .6 },
      camera: [[77, [-6, 3, 11], [0, 1.1, -.4]], [87, [-1.6, 1.8, 6.2], [0, 1.15, 0]]],
      effets: { poussiere: Array.from({ length: 10 }, (_, i) => ({ t: 77.5 + i, x: .05, y: .72, z: .55 })) },
      acteurs: { hame: { piste: [[77, { x: 0, z: 0, rot: 0, anim: 'pile' }]] } },
      objets: {
        mortier: { forme: 'mortier', piste: [[77, { x: .05, y: 0, z: .55 }]] },
        pilon: { forme: 'pilon', accroche: { acteur: 'hame', os: 'main.D' }, piste: [[77, { x: .25, y: -.05, z: .03 }]] },
      },
    },
    {
      de: 87, a: 99, decor: VILLAGE, ambiances: [[87, 'village-soudanais']],
      camera: [[87, [2.5, 2.7, 9.6], [1.2, 1.5, 0]], [99, [1.4, 2.2, 8.5], [.8, 1.9, 0]]],
      effets: { poussiere: Array.from({ length: 12 }, (_, i) => ({ t: 87.5 + i, x: .05, y: .72, z: .55 })) },
      acteurs: {
        hame: { piste: [[87, { x: 0, z: 0, rot: 0, anim: 'pile' }]] },
        wuro: { piste: [[87, { x: 8.5, z: -.4, rot: -86, anim: 'marche', vitesse: .5, lin: 1 }], [92.6, { x: 2.1, rot: -86, lin: 1, anim: 'repos', z: -.4 }], [93, { rot: -36 }], [93.2, { anim: 'assis' }], [95.3, { anim: 'assis_etire' }]] },
      },
      objets: { mortier: { forme: 'mortier', piste: [[87, { x: .05, y: 0, z: .55 }]] }, tronc: { forme: 'tronc', piste: [[87, { x: 2.1, y: 0, z: -.42 }]] }, pilon: { forme: 'pilon', accroche: { acteur: 'hame', os: 'main.D' }, piste: [[87, { x: .25, y: -.05, z: .03 }]] } },
    },
    {
      de: 99, a: 105, decor: VILLAGE, ambiances: [[99, 'village-soudanais']],
      camera: [[99, [-2.4, 1.05, 4.6], [.25, 1.65, 0]], [105, [-1.7, .85, 3.8], [.4, 1.95, 0]]],
      effets: { poussiere: [99.3, 100.05, 100.75, 101.4, 102, 102.55, 103.05, 103.55].map((t) => ({ t, x: .05, y: .72, z: .55, n: 18 })) },
      acteurs: {
        hame: { piste: [[99, { x: 0, z: 0, rot: 0, anim: 'pile', vitesse: 1.3 }], [101.3, { anim: 'pile', vitesse: 1.75 }], [104, { anim: 'pile', vitesse: 2.1 }]] },
        wuro: { piste: [[99, { x: 2.1, z: -.4, rot: -36, anim: 'assis_etire' }]] },
      },
      objets: { mortier: { forme: 'mortier', piste: [[99, { x: .05, y: 0, z: .55 }]] }, tronc: { forme: 'tronc', piste: [[99, { x: 2.1, y: 0, z: -.42 }]] }, pilon: { forme: 'pilon', accroche: { acteur: 'hame', os: 'main.D' }, piste: [[99, { x: .25, y: -.05, z: .03 }]] } },
    },
    {
      de: 105, a: 108, decor: VILLAGE, ambiances: [[105, 'village-soudanais']], eclairs: [105.05],
      camera: [[105, [.3, 2.6, 4.2], [.3, 2.55, 0]], [108, [.3, 2.5, 3.8], [.3, 2.2, 0]]],
      acteurs: { wuro: { piste: [[105, { x: .78, z: 0, y: .05, rot: 0, anim: 'assis_etire' }], [105.25, { anim: 'assis_blesse' }]] } },
      objets: {
        pilon: { forme: 'pilon', piste: [[105, { x: .32, y: 2.75, z: .15 }], [105.1, { y: 2.55 }], [106, { y: 1.3, x: .1, rz: 18 }], [107.5, { y: -2 }]] },
        halo: { forme: 'lumiere', accroche: { acteur: 'wuro', os: 'torse' }, piste: [[105, { e: 8, o: .5, tremble: .9 }]] },
      },
    },

    // ---- 4 · Le départ
    {
      de: 108, a: 117.2, decor: VILLAGE, ambiances: [[108, 'village-soudanais']],
      camera: [[108, [1.6, 1.9, 6.4], [1.6, 1.6, 0]], [117.2, [1.3, 1.7, 5.2], [1.6, 1.7, 0]]],
      acteurs: {
        wuro: { piste: [[108, { x: 2.1, z: -.4, rot: -36, anim: 'assis_blesse' }]] },
        hame: { piste: [[108, { x: -.2, z: .4, rot: 58, anim: 'effroi' }]] },
      },
      objets: {
        tronc: { forme: 'tronc', piste: [[108, { x: 2.1, y: 0, z: -.42 }]] },
        halo: { forme: 'lumiere', accroche: { acteur: 'wuro', os: 'torse' }, piste: [[108, { e: 8, o: .5, tremble: .95 }]] },
        pilon: { forme: 'pilon', piste: [[108, { x: .6, y: .07, z: 1.3, rz: 88, rot: 30 }]] },
      },
    },
    {
      de: 117.2, a: 124, decor: VILLAGE, ambiances: [[117.2, 'village-soudanais']],
      camera: [[117.2, [-1.2, 1.5, 3.5], [-.2, 1.45, 0]], [124, [-1.05, 1.5, 3.1], [-.2, 1.5, 0]]],
      acteurs: {
        hame: { piste: [[117.2, { x: -.2, z: .4, rot: 58, anim: 'parle' }], [121.7, { anim: 'offre' }]] },
        wuro: { piste: [[117.2, { x: 2.1, z: -.4, rot: -36, anim: 'assis_blesse' }]] },
      },
      objets: { tronc: { forme: 'tronc', piste: [[117.2, { x: 2.1, y: 0, z: -.42 }]] }, halo: { forme: 'lumiere', accroche: { acteur: 'wuro', os: 'torse' }, piste: [[117.2, { e: 8, o: .5, tremble: .85 }]] } },
    },
    {
      de: 124, a: 132, decor: VILLAGE, ambiances: [[124, 'village-soudanais']],
      camera: [[124, [.5, 2.6, 11], [.5, 1.5, 0]], [132, [.5, 2.3, 9.5], [.5, 1.6, 0]]],
      acteurs: {
        wuro: { piste: [[124, { x: 2.1, z: -.4, rot: -36, anim: 'assis_blesse' }]] },
        hame: { piste: [[124, { x: -.2, z: .4, rot: 58, anim: 'offre' }]] },
        bado: { piste: [[124, { x: -8.5, z: 2.4, rot: 80, anim: 'court', lin: 1 }], [126.2, { x: -3.6, z: 2.2, rot: 80, lin: 1, anim: 'effroi' }], [128.7, { x: -3.6, rot: 80, anim: 'marche', vitesse: -.6 }], [131, { x: -5.5, rot: 80, anim: 'effroi', lin: 1 }]] },
        sanou: { piste: [[124, { x: 9, z: 2, rot: -80, anim: 'court', lin: 1 }], [126.4, { x: 5, z: 2, rot: -80, lin: 1, anim: 'effroi' }], [128.7, { x: 5, rot: -80, anim: 'marche', vitesse: -.6 }], [131, { x: 7, rot: -80, anim: 'effroi', lin: 1 }]] },
        ...foule([
          ['f1', 'marchande', [[124, { x: -10, z: .4, rot: 80, anim: 'court', lin: 1 }], [126.6, { x: -5.2, z: .3, rot: 80, lin: 1, anim: 'effroi' }]]],
          ['f2', 'paysan', [[124, { x: 10, z: -.5, rot: -80, anim: 'court', lin: 1 }], [126.6, { x: 6.5, z: -.4, rot: -80, lin: 1, anim: 'effroi' }]]],
        ]),
      },
      objets: { tronc: { forme: 'tronc', piste: [[124, { x: 2.1, y: 0, z: -.42 }]] }, halo: { forme: 'lumiere', accroche: { acteur: 'wuro', os: 'torse' }, piste: [[124, { e: 8, o: .5, tremble: .85 }]] } },
    },
    {
      de: 132, a: 140, decor: VILLAGE, ambiances: [[132, 'village-soudanais']],
      camera: [[132, [2, 3.4, 5.2], [1.8, 3, 0]], [140, [2, 2.4, 8], [1.8, 5, 0]]],
      acteurs: {
        wuro: { piste: [[132, { x: 1, z: .35, y: 0, rot: -45, anim: 'repos' }], [134.8, { rot: -66 }], [135.5, { rot: -24 }], [136.3, { rot: -66 }], [137.2, { rot: -35, y: 0, anim: 'bras_leves' }], [140, { y: 1.5 }]] },
        hame: { piste: [[132, { x: -1.4, z: .7, rot: 50, anim: 'regarde_haut' }]] },
      },
      objets: { tronc: { forme: 'tronc', piste: [[132, { x: 2.1, y: 0, z: -.42 }]] }, halo: { forme: 'lumiere', accroche: { acteur: 'wuro', os: 'torse' }, piste: [[132, { e: 9, o: .45, tremble: .55 }], [138, { e: 12, o: .75, tremble: .1 }]] } },
    },
    {
      de: 140, a: 154, decor: VILLAGE, ambiances: [[140, 'village-soudanais'], [150, 'haut', 8]], fondu: { sortie: 1 },
      camera: [[140, [0, 2, 14], [0, 6, 0]], [154, [0, 1.3, 26], [.6, 46, 0]]],
      acteurs: {
        wuro: { piste: [[140, { x: 1, z: .35, y: 1.5, rot: 0, anim: 'bras_leves' }], [154, { y: 60, e: .25 }]] },
        hame: { piste: [[140, { x: -1.4, z: .7, rot: 10, anim: 'regarde_haut' }]] },
      },
      objets: {
        halo: { forme: 'lumiere', accroche: { acteur: 'wuro', os: 'torse' }, piste: [[140, { e: 12, o: .8 }], [154, { e: 3.6, o: 1 }]] },
        n1: { forme: 'nuage', graine: 'a', piste: [[140, { x: -9, y: 8, z: -7, e: 1.4 }], [154, { y: 26 }]] },
        n2: { forme: 'nuage', graine: 'b', piste: [[140, { x: 7, y: 9, z: -9, e: 1.6 }], [154, { y: 30 }]] },
      },
    },

    // ---- 5 · Le monde sans Wuro
    {
      de: 154, a: 165, decor: 'champ', ambiances: [[154, 'secheresse']], fondu: { entree: 1 },
      teintes: { tige: [[154, '#7f8f3a'], [163, '#b49a58']], epi: [[154, '#8f5f22'], [163, '#7d6236']], feuille: [[154, '#6d8440'], [163, '#a68c50']] },
      camera: [[154, [-9, 2.5, 13], [-1, 1.3, 0]], [165, [5, 1.7, 7.5], [1.5, 1.05, 0]]],
      acteurs: { bado: { piste: [[154, { x: 1.5, z: 1, rot: -30, anim: 'tete_basse' }], [160, { rot: -60 }]] } },
    },
    {
      de: 165, a: 175, decor: VILLAGE, ambiances: [[165, 'nuit-claire']], fondu: { entree: .7 },
      effets: { etoiles: [[165, { n: .6, o: .9 }]] },
      camera: [[165, [-7.5, 1.6, 5.4], [-5, .9, -1]], [175, [-5.4, 1.2, 3.4], [-5.2, .85, -1]]],
      acteurs: { hyene: { piste: [[165, { x: -11, z: 1, rot: 80, anim: 'rampe', vitesse: .85, lin: 1 }], [170.8, { x: -5.2, z: -1.8, rot: 70, lin: 1, anim: 'rampe' }], [172, { rot: -120 }], [175, { x: -10, z: .4, rot: -100, lin: 1 }]] } },
      objets: { sac: { forme: 'feuilles', accroche: { acteur: 'hyene', os: 'tete' }, piste: [[165, { e: .001 }], [171.5, { e: .001 }], [171.6, { e: 2.1, z: .2, y: -.1 }]] } },
    },
    {
      de: 175, a: 185, decor: VILLAGE, ambiances: [[175, 'secheresse']],
      eclairs: [],
      camera: [[175, [-.4, 1.65, 4.6], [0, 1.25, 0]], [178, [-.1, 1.55, 3.9], [0, 1.3, 0]], [185, [.3, 1.7, 4.8], [0, 1.1, 0]]],
      effets: { poussiere: [{ t: 180.9, x: .02, y: .2, z: .4, n: 28 }], couleurPoussiere: '#a0c0d4' },
      acteurs: {
        bado: { piste: [[175, { x: -.85, z: 0, rot: 74, anim: 'parle' }], [178.2, { anim: 'lutte' }], [183, { anim: 'tete_basse', rot: 62 }]] },
        sanou: { piste: [[175, { x: .9, z: 0, rot: -74, anim: 'repos' }], [178.3, { anim: 'parle' }], [181.5, { anim: 'lutte' }], [183, { anim: 'tete_basse', rot: -62 }]] },
      },
      objets: { canari: { modele: 'patrimoine/canari', piste: [[175, { x: 0, y: 0, z: .4, e: .46 }], [180.5, { rz: 0 }], [181.2, { rz: 86, x: .28, y: .05 }]] } },
    },
    {
      de: 185, a: 195, decor: VILLAGE, ambiances: [[185, 'secheresse']], fondu: { entree: .5 },
      camera: [[185, [1.6, 1.15, 3.2], [.05, .55, 0]], [195, [1.15, 1, 2.5], [.05, .5, 0]]],
      acteurs: {
        tiko: { piste: [[185, { x: .4, y: .12, z: .95, rx: -90, rot: 0, anim: 'allonge' }]] },
        hame: { piste: [[185, { x: -.8, z: -.1, rot: 62, anim: 'assis_parle' }]] },
      },
      objets: { natte: { forme: 'natte', piste: [[185, { x: .4, y: .015, z: .05, rot: 90 }]] }, tronc: { forme: 'tronc', hauteur: .46, rayon: .28, piste: [[185, { x: -.82, y: 0, z: -.1 }]] } },
    },
    {
      de: 195, a: 202, decor: VILLAGE, ambiances: [[195, 'secheresse']],
      camera: [[195, [0, .8, 5], [0, 1.45, 0]], [202, [0, .75, 4.2], [0, 1.6, 0]]],
      acteurs: { yeli: { piste: [[195, { x: 0, z: 0, rot: 0, anim: 'bras_leves' }], [199.1, { anim: 'tete_basse' }]] } },
    },

    // ---- 6 · Les trois fils
    {
      de: 202, a: 222, decor: 'ciel', masquer: ['feu'], ambiances: [[202, 'ciel']], fondu: { entree: .8, sortie: .5 },
      camera: [[202, [.5, 2.3, 9.8], [0, 2.8, 0]], [209, [.5, 2.1, 8.2], [0, 3, 0]], [222, [0, 3, 10], [0, 1.2, 0]]],
      acteurs: { wuro: { piste: [[202, { x: 0, y: 0, rot: 0, anim: 'tete_basse' }], [205.2, { anim: 'offre' }], [209, { anim: 'bras_leves' }], [213, { anim: 'offre' }]] } },
      objets: {
        halo: { forme: 'lumiere', accroche: { acteur: 'wuro', os: 'torse' }, piste: [[202, { e: 7, o: .35 }]] },
        f1: { forme: 'lumiere', couleur: '#fff09a', piste: [[202, { x: -.5, y: 2, z: 1.2, e: .001 }], [209.5, { e: .001 }], [210.8, { e: .95, x: -1.5, y: 3.4 }], [212, { x: -1.5, y: 3.4 }], [219, { x: -5, y: -7, z: 3 }]] },
        f2: { forme: 'lumiere', couleur: '#8fe88a', piste: [[202, { x: 0, y: 2, z: 1.2, e: .001 }], [209.7, { e: .001 }], [211, { e: .95, x: 0, y: 4 }], [213, { x: 0, y: 4 }], [220, { x: .2, y: -8, z: 3 }]] },
        f3: { forme: 'lumiere', couleur: '#d6ff7a', piste: [[202, { x: .5, y: 2, z: 1.2, e: .001 }], [209.9, { e: .001 }], [211.2, { e: .95, x: 1.5, y: 3.4 }], [214, { x: 1.5, y: 3.4 }], [221, { x: 5, y: -7, z: 3 }]] },
      },
    },

    // ---- 7 · Kwere
    {
      de: 222, a: 238, decor: 'champ', ambiances: [[222, 'secheresse'], [234, 'orage', 8]], eclairs: [225.1, 228.2, 233, 236.6],
      teintes: { tige: [[222, '#b49a58']], epi: [[222, '#7d6236']], feuille: [[222, '#a68c50']] },
      camera: [[222, [.5, 3, 11], [0, 1.6, 0]], [226, [-1.2, 1.5, 6], [0, 1.6, 0]], [238, [1.5, 2, 8], [0, 2.2, 0]]],
      effets: { poussiere: [228.2, 233, 236.6].map((t) => ({ t, x: -.5, y: .1, z: .4, n: 26 })) },
      acteurs: { kwere: { piste: [[222, { x: 0, y: 30, z: 0, rot: 0, anim: 'repos' }], [225, { y: 30 }], [225.25, { y: 0 }], [227.2, { anim: 'frappe', vitesse: .69 }]] } },
      objets: {
        baton: { forme: 'pilon', accroche: { acteur: 'kwere', os: 'main.D' }, piste: [[222, { y: .3 }]] },
        f1: { forme: 'foudre', graine: 'k1', piste: [[222, { x: 0, y: 0, z: 0, o: 0 }], [225.05, { o: 0 }], [225.15, { o: 1 }], [225.8, { o: 0 }]] },
        f2: { forme: 'foudre', graine: 'k2', piste: [[222, { x: -7, y: 0, z: -9, o: 0 }], [233, { o: 0 }], [233.05, { o: 1 }], [233.5, { o: 0 }], [236.6, { o: 0 }], [236.65, { o: 1 }], [237.1, { o: 0 }]] },
        n1: { forme: 'nuage', graine: 'a', couleur: '#8a93a8', piste: [[222, { x: -30, y: 15, z: -22, e: 3.4 }], [235, { x: -10 }]] },
        n2: { forme: 'nuage', graine: 'b', couleur: '#7a8398', piste: [[222, { x: 32, y: 16, z: -24, e: 3.8 }], [235, { x: 10 }]] },
        n3: { forme: 'nuage', graine: 'c', couleur: '#8a93a8', piste: [[222, { x: 0, y: 30, z: -22, e: 3.4 }], [233, { y: 17 }]] },
      },
    },
    {
      de: 238, a: 252, decor: 'champ', ambiances: [[238, 'orage'], [244, 'pluie', 5]], eclairs: [240.2],
      teintes: { tige: [[238, '#b49a58'], [251, '#4f8a33']], epi: [[238, '#7d6236'], [251, '#a06f24']], feuille: [[238, '#a68c50'], [251, '#5c8a35']] },
      effets: { pluie: [[238, { o: .3 }], [240, { o: 1 }]] },
      camera: [[238, [-4, 1.6, 10], [0, 1.5, 0]], [252, [3, 1.5, 8.4], [0, 1.6, 0]]],
      acteurs: {
        kwere: { piste: [[238, { x: 0, z: -2, rot: 0, anim: 'bras_leves' }]] },
        bado: { piste: [[238, { x: -8, z: 2.2, rot: 80, anim: 'marche', lin: 1 }], [242.5, { x: -2.5, z: 1.8, lin: 1, anim: 'souleve', rot: 30 }]] },
        sanou: { piste: [[239, { x: 8, z: 2.2, rot: -80, anim: 'marche', lin: 1 }], [243.5, { x: 2.6, z: 1.9, lin: 1, anim: 'danse', rot: -25 }]] },
        tiko: { style: 'jeune_fille', piste: [[240, { x: -9, z: .4, rot: 80, anim: 'court', lin: 1 }], [244, { x: -4.4, z: .2, lin: 1, anim: 'danse', rot: 25 }]] },
      },
    },

    // ---- 8 · Soxo
    {
      de: 252, a: 265, decor: 'brousse', ambiances: [[252, 'brousse']], fondu: { entree: .7 },
      camera: [[252, [-5, 2.4, 11], [-.5, 1.1, 0]], [259, [-1.8, 1.4, 6.4], [0, 1.1, 0]], [265, [-1.2, 1.3, 5.6], [.5, 1, 0]]],
      acteurs: {
        yeli: { piste: [[252, { x: -1.6, z: .3, rot: 22, anim: 'cueille' }], [257, { anim: 'effroi', rot: 74 }]] },
        hyene: { piste: [[252, { x: 9, z: -.3, rot: -86, vu: 0, anim: 'rampe' }], [255.7, { vu: 0 }], [255.8, { vu: 1, x: 8 }], [257.4, { x: 2.1, lin: 1, anim: 'rampe', vitesse: .45 }]] },
      },
    },
    {
      de: 265, a: 277, decor: 'brousse', ambiances: [[265, 'brousse']],
      camera: [[265, [1, 1.3, 6.8], [1, 1.1, 0]], [277, [.3, 1.4, 5.6], [.6, 1, 0]]],
      acteurs: {
        yeli: { piste: [[265, { x: -1.6, z: .3, rot: 74, anim: 'effroi' }], [271, { anim: 'repos' }]] },
        hyene: { piste: [[265, { x: 2.1, z: -.3, rot: -86, anim: 'rampe', vitesse: .25 }], [268.9, { y: 0, rx: 0, anim: 'rampe', vitesse: 0 }], [270, { y: -.22 }]] },
        soxo: { piste: [[265, { x: 3.7, z: 1.6, rot: -80, vu: 0, anim: 'marche', lin: 1 }], [265.2, { vu: 1 }], [267.8, { x: 2.5, z: 1.5, lin: 1, anim: 'tend_main', rot: -30 }], [272.8, { anim: 'cueille', rot: -80 }], [276, { anim: 'offre', rot: -80 }]] },
      },
      objets: { feuilles: { forme: 'feuilles', accroche: { acteur: 'soxo', os: 'main.D' }, piste: [[265, { e: .001 }], [275.3, { e: .001 }], [275.5, { e: 1.6 }]] } },
    },
    {
      de: 277, a: 287, decor: VILLAGE, ambiances: [[277, 'village-soudanais']], fondu: { entree: .6, sortie: .4 },
      camera: [[277, [1.4, 1.3, 4.6], [.2, .75, 0]], [283, [.8, 1.25, 5], [.2, .95, 0]], [287, [-2, 1.4, 7], [-1.5, 1, 0]]],
      acteurs: {
        tiko: { piste: [[277, { x: .4, y: .12, z: .95, rx: -90, rot: 0, anim: 'allonge' }], [281.2, { y: .12, z: .95, rx: -90 }], [282.7, { y: 0, z: .4, rx: 0, anim: 'repos', rot: -70 }], [283.5, { anim: 'court', vitesse: .8, rot: -80, x: .4, lin: 1 }], [286, { x: -3.2, lin: 1, anim: 'offre' }]] },
        yeli: { piste: [[277, { x: 1.7, z: -.2, rot: -66, anim: 'offre' }], [283, { anim: 'parle' }]] },
        hame: { piste: [[277, { x: -3.8, z: .2, rot: 75, anim: 'offre' }]] },
      },
      objets: { natte: { forme: 'natte', piste: [[277, { x: .4, y: .015, z: .05, rot: 90 }]] } },
    },

    // ---- 9 · Dwo
    {
      de: 287, a: 297, decor: VILLAGE, ambiances: [[287, 'village-soudanais']], fondu: { entree: .4 },
      camera: [[287, [0, 1.5, 12], [0, 2.1, 0]], [297, [0, 1.3, 7.5], [0, 2.1, 0]]],
      acteurs: {
        dwo: { piste: [[287, { x: 0, z: -9, rot: 0, anim: 'marche', vitesse: .8, lin: 1 }], [292.5, { z: -.6, lin: 1, anim: 'repos' }]] },
        ...foule([['f1', 'marchande', [[287, { x: -3.5, z: 2.7, rot: 150, anim: 'regarde_haut' }]]], ['f2', 'paysan', [[287, { x: 3.5, z: 2.7, rot: 210, anim: 'regarde_haut' }]]]]),
      },
    },
    {
      de: 297, a: 312, decor: VILLAGE, ambiances: [[297, 'village-soudanais']],
      camera: [[297, [0, 1.9, 7.8], [0, 1.6, 0]], [302, [-.5, 1.7, 6.5], [.1, 1.4, .5]], [312, [.4, 1.5, 4.5], [.1, 1.25, .8]]],
      effets: { poussiere: [297.8, 299.4, 301, 302.6, 304.2].map((t) => ({ t, x: 0, y: .1, z: -.6, n: 20 })) },
      acteurs: {
        dwo: { piste: [[297, { x: 0, z: -.6, y: 0, rot: 0, anim: 'danse', vitesse: 1.1, lin: 1 }], [305, { rot: 1440, lin: 1, z: -1.3, anim: 'repos' }]] },
        bado: { piste: [[297, { x: -1.5, z: .9, rot: 42, anim: 'repos' }], [303.7, { x: -.72, rot: 80, anim: 'marche', lin: 1 }], [305, { x: -.62, rot: 80, lin: 1, anim: 'tend_main' }]] },
        sanou: { piste: [[297, { x: 1.5, z: .9, rot: -42, anim: 'repos' }], [303.7, { x: .72, rot: -80, anim: 'marche', lin: 1 }], [305, { x: .62, rot: -80, lin: 1, anim: 'tend_main' }]] },
      },
    },
    {
      de: 312, a: 327, decor: VILLAGE, ambiances: [[312, 'village-soudanais'], [327, 'soir', 11]], fondu: { sortie: .7 },
      camera: [[312, [-8, 3.6, 10], [0, 1.5, 0]], [320, [8, 3.2, 10], [0, 1.5, 0]], [327, [0, 5.3, 13], [0, 1.2, 0]]],
      effets: { poussiere: Array.from({ length: 15 }, (_, i) => ({ t: 312 + i, x: ((i * 7) % 8) - 4, y: .08, z: ((i * 3) % 5) - 2, n: 14 })) },
      acteurs: {
        dwo: { piste: [[312, { x: 0, z: 0, rot: 0, anim: 'danse', lin: 1 }], [327, { rot: 1440, lin: 1 }]] },
        ...Object.fromEntries([['bado', 'forgeron', 0], ['sanou', 'jeune', 1], ['hame', 'femme', 2], ['tiko', 'enfant', 3], ['yeli', 'ancien', 4], ['f1', 'marchande', 5], ['f2', 'paysan', 6], ['f3', 'jeune_fille', 7]].map(([id, style, i]) => {
          const a = i / 8 * Math.PI * 2, r = 3.4;
          return [id, { style, piste: [[312, { x: Math.cos(a) * r, z: Math.sin(a) * r, rot: 90 - a * 57.3 + 180, anim: 'danse', vitesse: .85 + i * .03 }]] }];
        })),
      },
    },

    // ---- 10 · Épilogue
    {
      de: 327, a: 352, decor: VILLAGE, ambiances: [[327, 'soir'], [342, 'nuit', 14]], fondu: { entree: .8, sortie: 8 },
      effets: { etoiles: [[327, { n: .15, o: .2 }], [345, { n: .9, o: 1 }]] },
      camera: [[327, [-2.4, 1.5, 6], [0, 1.2, 0]], [335, [-1.7, 1.25, 4.8], [0, 1.45, 0]], [342, [-1.2, .6, 3.8], [.4, 3, -3]]],
      acteurs: { hame: { piste: [[327, { x: 0, z: 0, rot: 12, anim: 'pile', vitesse: .68 }], [334.3, { anim: 'regarde_haut', rot: 8 }]] } },
      objets: {
        mortier: { forme: 'mortier', piste: [[327, { x: .05, y: 0, z: .55 }]] },
        pilon: { forme: 'pilon', accroche: { acteur: 'hame', os: 'main.D' }, piste: [[327, { x: .25, y: -.05, z: .03 }], [334.3, { x: .25 }], [335, { x: .5, y: -.45, z: .28 }]] },
        etoile: { forme: 'lumiere', couleur: '#fff4c8', piste: [[327, { x: 4, y: 19, z: -21, e: .001, o: 0 }], [336.5, { o: 0, e: .9 }], [338, { o: 1, e: 2.1 }], [338.9, { e: 3.7 }], [339.7, { e: 2.1 }]] },
      },
    },
  ],
};
