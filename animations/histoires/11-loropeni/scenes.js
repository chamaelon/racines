/*
 * 11 · Les ruines de Loropéni — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;
  const { montrer, cacher, objet } = R;

  const COSTUMES = {
    chef: { haut: { type: 'boubou', couleur: '#e9c46a', motif: 'chevrons', motifCouleur: '#7a4a25', long: 1.8 }, manches: '#e9c46a', tete: { type: 'couronne', couleur: '#e9c46a' }, collier: '#ffd166', bracelets: '#ffd166' },
    batisseur: { bas: { type: 'short', couleur: '#8a5a32' }, ceinture: '#3a2a1a', tete: null },
    femmeOr: { haut: { type: 'camisole', couleur: '#5b3a6a' }, bas: { type: 'jupe', couleur: '#e8dcc0', motif: 'bandes', motifCouleur: '#5b3a6a' }, collier: '#ffd166', bracelets: '#ffd166' },
  };
  /** Bloc de latérite à porter sur la tête. */
  const bloc = () => { const g = R.el('g', {}); R.el('rect', { x: -24, y: -18, width: 48, height: 18, rx: 3, fill: '#9a6a4a', stroke: '#5a3a24', 'stroke-width': 2 }, g); return g; };
  /** Paillettes d'or (particules dorées). */
  const paillettes = (parent, x, y) => D.particules(parent, 24, x, y, '#ffd166', 41);

  // =================================================================== 1 · Les ruines
  R.scene('Les ruines', 26, (sc, tl) => {
    DECORS.forteresse(sc, { ruine: true, soleil: [1500, 220, 60] });
    sc.cam.x = 960; sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 2);
    R.titre(tl, 1.5, 6.5, 'titre', 'sous_titre', 300);
    R.cartouche(tl, 9, 5, 'lieu_aujourdhui');
    R.cam(tl, sc, { x: 760, y: 640, z: 1.3 }, 8, 15);
    R.fonduSortie(tl, 24, 2);
  });

  // =================================================================== 2 · Retour dans le temps
  R.scene('Retour dans le temps', 22, (sc, tl) => {
    const intacte = DECORS.forteresse(sc, {});
    const ruine = DECORS.forteresse(sc, { ruine: true });
    sc.cam.x = 960; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.eclairBlanc(tl, 4, 1.2);
    tl.to(ruine.fond, { opacity: 0, duration: 6 }, 4);
    R.secousse(tl, sc, 4, 6, 3);
    R.cartouche(tl, 9, 6, 'lieu_autrefois');
    R.cam(tl, sc, { y: 520, z: 0.9 }, 6, 12);
    R.fonduSortie(tl, 20.5, 1.5);
  });

  // =================================================================== 3 · Les bâtisseurs
  R.scene('Les bâtisseurs', 38, (sc, tl) => {
    const f = DECORS.forteresse(sc, {});
    // Un pan de mur qui monte, rangée après rangée
    const chantier = R.el('g', {}, sc.monde);
    const rangs = [];
    for (let r = 0; r < 6; r++) {
      const g = R.el('g', { opacity: 0 }, chantier);
      for (let k = 0; k < 6; k++) R.el('rect', { x: 700 + k * 64 + (r % 2) * 30, y: SOL - 26 - r * 26, width: 58, height: 22, rx: 4, fill: '#9a6a4a', stroke: '#5a3a24', 'stroke-width': 2 }, g);
      rangs.push(g);
    }
    const porteurs = [[C.trapu, -200], [C.colosse, -380], [C.guerrier, -560], [C.filiforme, -740]].map(([def, x]) => {
      const p = sc.perso(def, COSTUMES.batisseur, { x, y: SOL, bA: 160, cA: 30, bR: 160, cR: 30 });
      G.surLaTete(p, bloc());
      return p;
    });
    const chef = sc.perso(C.roi, COSTUMES.chef, { x: 1400, y: SOL, dir: -1 });
    chef.tenir(D.sceptre(), 'R', { vertical: true });
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'perso_chef', 'droite');
    porteurs.forEach((p, i) => R.marche(tl, p, 640 - i * 90, 1 + i * 0.6, 7, { pas: 10, amp: 0.8 }));
    rangs.forEach((g, i) => tl.to(g, { opacity: 1, duration: 0.6 }, 8 + i * 3.5));
    porteurs.forEach((p, i) => {
      for (let k = 0; k < 3; k++) {
        const t = 9 + i * 0.8 + k * 7;
        R.pose(tl, p, { lean: 30, bA: 80, cA: 20, bR: 80, cR: 20 }, t, 0.6);
        R.pose(tl, p, { lean: 0, bA: 160, cA: 30, bR: 160, cR: 30 }, t + 1.5, 0.6);
      }
    });
    G.pointer(tl, chef, 10, 3);
    R.parle(tl, chef, 10, 3);
    R.expr(tl, chef, 'joie', 26);
    R.cam(tl, sc, { x: 880, y: 680, z: 1.35 }, 12, 10);
    R.cam(tl, sc, { x: 960, y: 560, z: 0.95 }, 28, 6);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 4 · L'or
  R.scene('L\'or', 40, (sc, tl) => {
    const d = DECORS.riviere(sc, { ciel: 'chaud' });
    const puits = [[500, 900], [820, 910], [1150, 905]].map(([x, y]) => R.el('ellipse', { cx: x, cy: y, rx: 60, ry: 14, fill: '#3a2414', stroke: '#6a4a2a', 'stroke-width': 3 }, sc.monde));
    const creuseur = sc.perso(C.colosse, COSTUMES.batisseur, { x: 440, y: SOL });
    creuseur.tenir(D.houe(), 'A');
    const laveuses = [[C.ronde, 760], [C.elancee, 1080], [C.fille, 1400]].map(([def, x]) => {
      const p = sc.perso(def, COSTUMES.femmeOr, { x, y: SOL, assis: 0.6, lean: 20, bA: 60, cA: 30, bR: 55, cR: 30 });
      p.tenir(D.calebasse(), 'A', { angle: -90 });
      return p;
    });
    const eclats = laveuses.map((p) => paillettes(sc.monde, p.p.x + 70, 840));
    sc.cam.x = 900; sc.cam.y = 650; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_or');
    G.piocher(tl, creuseur, 1, 12, 0.9);
    laveuses.forEach((p, i) => {
      tl.to(p.p, { cA: 55, cR: 55, duration: 0.35, yoyo: true, repeat: 40, ease: 'sine.inOut' }, 1 + i * 0.2);
      [6, 12, 18, 24].forEach((t, k) => R.jaillir(tl, eclats[i], t + i, k, { n: 5, ecart: 12, haut: 30, duree: 0.8 }));
    });
    R.cam(tl, sc, { x: 1100, y: 780, z: 2 }, 8, 4);
    R.expr(tl, laveuses[1], 'joie', 13);
    G.relever(tl, laveuses[1], 14);
    R.pose(tl, laveuses[1], { bA: 120, cA: 30 }, 15, 0.5);
    const pepite = D.lumiere(sc.monde, 1150, 690, 6, '#ffd166'); pepite.setAttribute('opacity', 0);
    tl.to(pepite, { opacity: 1, scale: 2, transformOrigin: '50% 50%', duration: 0.6, yoyo: true, repeat: 3 }, 15.3);
    R.cam(tl, sc, { x: 1100, y: 660, z: 1.4 }, 15, 3);
    G.exprFoule(tl, laveuses, 'joie', 17);
    R.cam(tl, sc, { x: 900, y: 600, z: 1 }, 26, 6);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 5 · Les orfèvres et les marchands
  R.scene('Orfèvres et marchands', 40, (sc, tl) => {
    DECORS.forteresse(sc, {});
    const feu = D.feu(sc.monde, 520, SOL + 2, 0.9); G.flamber(tl, feu, 0, 40);
    D.enclume(sc.monde, 720, SOL, 1.1);
    D.siege(sc.monde, 610, SOL, 70, 50);
    const orfevre = sc.perso(C.colosse, H.forgeron, { x: 610, y: SOL, assis: 1 });
    orfevre.tenir(D.marteau(), 'A');
    const etincelles = paillettes(sc.monde, 720, SOL - 70);
    const or = D.tas(sc.monde, 760, SOL - 70, '#ffd166', 5);
    const marchand = sc.bete(B.cheval, { x: 2400, y: SOL, dir: -1, s: 0.9 });
    const cav = sc.perso(C.guerrier, H.cavalier, {}); marchand.monter(cav);
    const ballot = R.el('g', {}, marchand.selle);
    R.el('rect', { x: -60, y: -30, width: 50, height: 34, rx: 6, fill: '#efe6cf', stroke: '#a89a7a', 'stroke-width': 2 }, ballot);
    const femme = sc.perso(C.elancee, COSTUMES.femmeOr, { x: 1000, y: SOL, dir: -1 });
    sc.cam.x = 660; sc.cam.y = 700; sc.cam.z = 1.5;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_atelier');
    G.forger(tl, orfevre, 1, 14, 0.85, etincelles);
    R.cam(tl, sc, { x: 820, y: 660, z: 1.25 }, 12, 3);
    R.expr(tl, femme, 'joie', 14);
    tl.set(femme.p, { dir: -1 }, 14);
    R.pose(tl, femme, { bA: 60, cA: 100, tete: -8 }, 15, 0.5);
    // Les marchands
    R.cam(tl, sc, { x: 1200, y: 600, z: 0.95 }, 18, 3);
    R.cartouche(tl, 19, 5, 'lieu_marche', 'droite');
    R.marche(tl, marchand, 1300, 18.5, 6, { pas: 9 });
    R.marche(tl, orfevre, 1050, 25, 2, { pas: 3 });
    R.pose(tl, orfevre, { assis: 0 }, 24.5, 0.5);
    G.dialogue(tl, 27.5, [[orfevre, 2.5], [cav, 2.5], [orfevre, 2]]);
    tl.to(cav.p, { tete: 10, duration: 0.3, yoyo: true, repeat: 3 }, 35);
    R.expr(tl, cav, 'joie', 35);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 6 · Le chef de la forteresse
  R.scene('Le chef', 32, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#b23a2a' });
    const chef = sc.perso(C.roi, COSTUMES.chef, { x: 960, y: 900, assis: 1 });
    chef.tenir(D.sceptre(), 'R', { vertical: true });
    const gardes = G.foule(sc, [[C.guerrier, H.guerrier, 700, 1], [C.guerrier, H.guerrier, 1220, -1]], 900);
    gardes.forEach((g) => g.tenir(D.lance(230), 'A', { vertical: true }));
    const porteurs = [[C.elancee, COSTUMES.femmeOr], [C.trapu, COSTUMES.batisseur]].map(([def, cos], i) => {
      const p = sc.perso(def, cos, { x: -200 - i * 150, y: 900 });
      p.tenir(D.calebasse('#e9c46a'), 'A', { vertical: true });
      return p;
    });
    const tresor = R.el('g', { opacity: 0 }, sc.monde); D.tas(tresor, 880, 900, '#ffd166', 12);
    sc.cam.x = 900; sc.cam.y = 660; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1);
    porteurs.forEach((p, i) => R.marche(tl, p, 760 - i * 120, 1 + i * 0.4, 5));
    porteurs.forEach((p, i) => { G.agenouiller(tl, p, 6.5 + i * 0.3); R.pose(tl, p, { bA: 80, cA: 10 }, 7 + i * 0.3, 0.5); });
    tl.to(tresor, { opacity: 1, duration: 0.6 }, 8);
    R.expr(tl, chef, 'joie', 8.5);
    G.pointer(tl, chef, 10, 2, 0.5);
    R.cam(tl, sc, { x: 920, y: 760, z: 1.8 }, 8, 3);
    // Les tambours, les danses
    R.cam(tl, sc, { x: 960, y: 620, z: 1 }, 14, 4);
    porteurs.forEach((p, i) => G.relever(tl, p, 14 + i * 0.2));
    G.danseFoule(tl, porteurs, 16, 12, 900);
    tl.to(chef.p, { tete: 8, duration: 0.4, yoyo: true, repeat: 15 }, 16);
    R.fonduSortie(tl, 30.5, 1.5);
  });

  // =================================================================== 7 · L'abandon
  R.scene('L\'abandon', 32, (sc, tl) => {
    const ruine = DECORS.forteresse(sc, { ruine: true, ciel: 'soir' });
    const intacte = DECORS.forteresse(sc, { ciel: 'soir' });
    const partants = [[C.vieille, null], [C.trapu, COSTUMES.batisseur], [C.elancee, COSTUMES.femmeOr], [C.enfant, null]].map(([def, cos], i) => sc.perso(def, cos, { x: 900 + i * 110, y: SOL, dir: -1 }));
    G.surLaTete(partants[2], D.sac());
    sc.cam.x = 900; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_abandon');
    G.exprFoule(tl, partants, 'triste', 1);
    partants.forEach((p, i) => R.marche(tl, p, -400 - i * 110, 2 + i * 0.3, 10, { pas: 14 }));
    tl.to(intacte.fond, { opacity: 0, duration: 12 }, 12);
    R.cam(tl, sc, { y: 560, z: 0.9 }, 12, 14);
    R.fonduSortie(tl, 30, 2);
  });

  // =================================================================== 8 · 2009
  R.scene('2009', 30, (sc, tl) => {
    DECORS.forteresse(sc, { ruine: true });
    const visiteurs = G.foule(sc, [[C.europeen, { haut: { type: 'tunique', couleur: '#5b7c9a' }, manches: '#5b7c9a', jambes: '#3a4a5a', tete: { type: 'casque', couleur: '#e8e2d2' } }, 760, 1], [C.vieille, null, 960, -1], [C.enfant, null, 1080, -1], [C.fille, null, 1180, -1]]);
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 7, 'lieu_unesco');
    G.dialogue(tl, 2, [[visiteurs[1], 3], [visiteurs[0], 2]]);
    G.pointer(tl, visiteurs[1], 3, 3, 0.4);
    G.exprFoule(tl, visiteurs.slice(2), 'surprise', 4);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 8, 6);
    R.fonduSortie(tl, 14.5, 1.5);
    R.titre(tl, 16, 4, 'fin');
    R.generique(tl, 20.6, 9.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
