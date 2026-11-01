/*
 * 23 · Yennenga, la princesse cavalière — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, COUR = 900;

  const COSTUMES = {
    yennenga: { haut: { type: 'tunique', couleur: '#8a1f2a', motif: 'bandes', motifCouleur: '#e9c46a' }, bas: { type: 'short', couleur: '#e8dcc0' }, manches: '#8a1f2a', ceinture: '#e9c46a', collier: '#e9c46a', bracelets: '#e9c46a' },
    yennengaRobe: { haut: { type: 'camisole', couleur: '#8a1f2a' }, bas: { type: 'jupe', couleur: '#e9c46a', motif: 'chevrons', motifCouleur: '#8a1f2a' }, collier: '#e9c46a', bracelets: '#e9c46a' },
    nedega: { haut: { type: 'boubou', couleur: '#24305a', motif: 'chevrons', motifCouleur: '#e9c46a', long: 1.8 }, manches: '#24305a', tete: { type: 'couronne' }, collier: '#e9c46a' },
  };
  // Yennenga : la jeune femme élancée, tresses de guerrière
  const YEN = Object.assign({}, C.elancee, { cheveux: 'tresses' });
  const yennenga = (sc, cos, pose, parent) => sc.perso(YEN, cos || COSTUMES.yennenga, Object.assign({ y: SOL }, pose), parent);
  const aCheval = (sc, x, dir, parent) => {
    const ch = sc.bete(B.chevalBlanc, { x, y: SOL, dir: dir || 1 }, parent);
    const y = sc.perso(YEN, COSTUMES.yennenga, {}, parent);
    ch.monter(y); y.tenir(D.lance(220), 'A', { vertical: true }); ch.cav = y;
    return ch;
  };
  const riale = (sc, pose, parent) => { const p = sc.perso(C.filiforme, H.chasseur, Object.assign({ y: SOL }, pose), parent); p.tenir(D.arc(), 'R', { vertical: true }); return p; };

  // =================================================================== 1 · Gambaga
  R.scene('Gambaga', 26, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#24305a', soleil: [300, 200, 60] });
    const roi = sc.perso(C.roi, COSTUMES.nedega, { x: 960, y: COUR, assis: 1 });
    roi.tenir(D.sceptre(), 'R', { vertical: true });
    sc.cam.y = 540; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 280);
    R.cartouche(tl, 8, 5, 'lieu_gambaga');
    R.cartouche(tl, 14, 5, 'perso_naaba', 'droite');
    R.cam(tl, sc, { x: 960, y: 700, z: 1.4 }, 8, 14);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · La guerrière
  R.scene('La guerrière', 38, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'chaud' });
    const yen = aCheval(sc, -300, 1);
    const cav = G.cavaliers(sc, [[-520, 1], [-740, 1], [-960, 1]]);
    const ennemis = G.cavaliers(sc, [[2400, -1], [2620, -1]], { habit: H.guerrier, arme: 'sabre' });
    const poussiere = D.particules(sc.monde, 40, 1000, 860, '#c9a678', 23);
    sc.cam.x = 760; sc.cam.y = 580; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, yen, 700, 1, 4, { pas: 12, amp: 1.5 });
    G.chevaucher(tl, cav, 480, 1.3, 4, { pas: 12 });
    R.cartouche(tl, 2, 5, 'perso_yennenga');
    tl.to(yen.p, { cabre: 1, duration: 0.4, yoyo: true, repeat: 1 }, 5.2);
    R.pose(tl, yen.cav, { bA: 160, cA: 10 }, 5.2, 0.3);
    R.expr(tl, yen.cav, 'colere', 5);
    // La charge
    R.marche(tl, yen, 1500, 7, 3, { pas: 9, amp: 1.5 });
    G.chevaucher(tl, cav, 1280, 7.3, 3, { pas: 9 });
    G.chevaucher(tl, ennemis, 1750, 7, 3, { pas: 9 });
    [7.5, 8.3, 9.1, 9.9].forEach((t, i) => R.jaillir(tl, poussiere, t, i, { n: 8, ecart: 60, haut: 90, duree: 1.2 }));
    R.cam(tl, sc, { x: 1500, y: 600, z: 1 }, 7, 3);
    R.secousse(tl, sc, 10, 12, 0.8);
    R.pose(tl, yen.cav, { bA: 90, cA: 0 }, 10.2, 0.2);
    G.exprFoule(tl, ennemis.map((c) => c.cav), 'peur', 10.5);
    ennemis.forEach((ch, i) => { tl.set(ch.p, { dir: 1 }, 11.5 + i * 0.2); R.marche(tl, ch, 3000, 11.7 + i * 0.2, 4, { pas: 12, amp: 1.5 }); });
    R.pose(tl, yen.cav, { bA: 165, cA: 10 }, 13, 0.3);
    R.expr(tl, yen.cav, 'joie', 13);
    G.exprFoule(tl, cav.map((c) => c.cav), 'joie', 13.5);
    R.cam(tl, sc, { x: 1400, y: 620, z: 1.2 }, 14, 4);
    // Retour triomphal
    tl.set(yen.p, { dir: -1 }, 22); cav.forEach((ch) => tl.set(ch.p, { dir: -1 }, 22));
    R.marche(tl, yen, -300, 22.5, 10, { pas: 22 });
    G.chevaucher(tl, cav, -500, 22.8, 10, { pas: 22, amp: 1 });
    R.cam(tl, sc, { x: 800, y: 580, z: 0.95 }, 22, 10);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 3 · Le refus
  R.scene('Le refus', 36, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#24305a' });
    const roi = sc.perso(C.roi, COSTUMES.nedega, { x: 960, y: COUR, assis: 1 });
    roi.tenir(D.sceptre(), 'R', { vertical: true });
    const yen = yennenga(sc, null, { x: 560, y: COUR });
    const cour = G.foule(sc, [[C.ancien, H.notable, 1250, -1], [C.vieille, null, 1380, -1]], COUR);
    sc.cam.x = 860; sc.cam.y = 660; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, yen, 760, 1, 2.5);
    G.agenouiller(tl, yen, 3.7);
    R.parle(tl, yen, 4.5, 4);
    R.pose(tl, yen, { bA: 100, cA: 30 }, 5, 0.4);
    R.cam(tl, sc, { x: 860, y: 720, z: 1.6 }, 4, 3);
    R.expr(tl, roi, 'colere', 9);
    R.parle(tl, roi, 9.5, 4);
    tl.to(roi.p, { tete: 12, duration: 0.3, yoyo: true, repeat: 7 }, 10);
    R.cartouche(tl, 12, 6, 'lieu_refus', 'droite');
    R.expr(tl, yen, 'triste', 14);
    G.relever(tl, yen, 17);
    tl.set(yen.p, { dir: -1 }, 18.5);
    R.marche(tl, yen, -300, 19, 6);
    G.exprFoule(tl, cour, 'triste', 19);
    R.cam(tl, sc, { x: 960, y: 640, z: 1.05 }, 19, 5);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 4 · Le champ abandonné
  R.scene('Le champ', 30, (sc, tl) => {
    const champ = DECORS.champ(sc, { vert: true });
    const yen = yennenga(sc, COSTUMES.yennengaRobe, { x: 860, y: 900 });
    sc.cam.x = 960; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.expr(tl, yen, 'triste', 1);
    R.pose(tl, yen, { tete: -10 }, 1, 0.5);
    // Le champ mûrit, puis se fane : personne ne vient récolter
    tl.to(champ.vert.g, { opacity: 0, duration: 8 }, 4);
    tl.to(champ.sec.g, { opacity: 1, duration: 8 }, 4);
    tl.to(champ.sec.tiges, { rotation: (i) => 20 + (i % 4) * 8, svgOrigin: '0 0', duration: 8 }, 6);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 4, 8);
    G.pleurer(tl, yen, 14, 6);
    R.cam(tl, sc, { x: 880, y: 700, z: 1.6 }, 14, 4);
    R.pose(tl, yen, { tete: 20, regard: 1 }, 22, 0.6);
    R.expr(tl, yen, 'colere', 23);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 5 · La fuite
  R.scene('La fuite', 34, (sc, tl) => {
    DECORS.palais(sc, { ciel: 'nuit', nuit: true });
    const yen = aCheval(sc, 700, 1);
    const garde = sc.perso(C.guerrier, H.guerrier, Object.assign({ x: 1300, y: COUR, dir: -1 }, R.EXPRESSIONS.sommeil));
    garde.tenir(D.lance(230), 'A', { vertical: true });
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 4, 'lieu_fuite');
    R.marche(tl, yen, 1000, 2, 4, { pas: 5, amp: 0.6 });
    tl.to(garde.p, { tete: -15, duration: 1.5, yoyo: true, repeat: 3 }, 2);
    R.cam(tl, sc, { x: 1100, y: 640, z: 1.3 }, 5, 3);
    tl.to(yen.p, { yeux: 0, duration: 0.1 }, 8);
    R.pose(tl, yen.cav, { tete: -15 }, 8, 0.4);
    R.marche(tl, yen, 2600, 9, 8, { pas: 22, amp: 1.5 });
    R.cam(tl, sc, { x: 1700 }, 9, 6);
    tl.to(garde.p, { yeux: 0, duration: 0.2 }, 14);
    R.expr(tl, garde, 'surprise', 14.5);
    R.fonduSortie(tl, 17, 1);
    // Galop sous la lune
    R.fonduEntree(tl, 18.5, 1);
    tl.set(yen.p, { x: -300 }, 18);
    tl.set(sc.cam, { x: 960, y: 600, z: 0.95 }, 18);
    R.marche(tl, yen, 2500, 18.5, 12, { pas: 34, amp: 1.5 });
    R.cam(tl, sc, { x: 1500 }, 18.5, 12);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 6 · Rialé
  R.scene('Rialé', 40, (sc, tl) => {
    DECORS.bois(sc, { ciel: 'soir' });
    const ch = sc.bete(B.chevalBlanc, { x: -300, y: SOL });
    const yen = yennenga(sc, null, { x: 0, y: 0 });
    ch.monter(yen);
    const yenPied = yennenga(sc, null, { x: 900, y: SOL, alpha: 0 });
    const r = riale(sc, { x: 2300, dir: -1 });
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_foret');
    R.marche(tl, ch, 1000, 1, 6, { pas: 10 });
    R.expr(tl, yen, 'triste', 2);
    tl.to(ch.p, { tete: 30, duration: 1 }, 7.5);
    // Elle descend, épuisée
    tl.to(yen.p, { alpha: 0, duration: 0.3 }, 9);
    tl.to(yenPied.p, { alpha: 1, duration: 0.3 }, 9);
    Object.assign(yenPied.p, R.EXPRESSIONS.triste);
    G.agenouiller(tl, yenPied, 10);
    // Rialé approche, l'arc tendu
    R.marche(tl, r, 1350, 11, 5);
    R.cartouche(tl, 13, 5, 'perso_riale', 'droite');
    R.pose(tl, r, { bR: 90, cR: 0, bA: 80, cA: 110 }, 16.5, 0.4);
    R.expr(tl, yenPied, 'surprise', 17);
    G.relever(tl, yenPied, 17.5);
    tl.set(yenPied.p, { dir: 1 }, 18);
    R.pose(tl, yenPied, { bA: 100, cA: 0 }, 18.5, 0.4);
    R.cam(tl, sc, { x: 1100, y: 640, z: 1.3 }, 16, 3);
    // Il baisse son arc ; ils se parlent
    R.pose(tl, r, { bR: -8, cR: 12, bA: 8, cA: 12 }, 21, 0.5);
    R.expr(tl, r, 'surprise', 21);
    G.dialogue(tl, 22.5, [[r, 2.5], [yenPied, 3], [r, 2]]);
    G.exprFoule(tl, [r, yenPied], 'joie', 31);
    R.pose(tl, r, { bA: 85, cA: 0 }, 32, 0.4);
    R.pose(tl, yenPied, { bA: 85, cA: 0 }, 32.2, 0.4);
    R.cam(tl, sc, { x: 1100, y: 600, z: 1.05 }, 33, 4);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 7 · Ouédraogo
  R.scene('Ouédraogo', 36, (sc, tl) => {
    DECORS.bois(sc, {});
    const kase = D.caseRonde(sc.monde, 1350, SOL, 1, { couleur: '#b9864e' });
    const r = riale(sc, { x: 800 });
    const yen = yennenga(sc, COSTUMES.yennengaRobe, { x: 980, y: SOL, dir: -1, bA: 70, cA: 90 });
    const bebe = sc.perso(C.bebe, null, { x: 0, y: 40, s: 0.85 });
    yen.tenir(bebe.root, 'A', { vertical: true });
    const ch = sc.bete(B.chevalBlanc, { x: 1650, y: SOL, dir: -1 });
    sc.cam.x = 1000; sc.cam.y = 640; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1);
    G.exprFoule(tl, [r, yen], 'joie', 1);
    R.expr(tl, bebe, 'rire', 2);
    R.cam(tl, sc, { x: 960, y: 700, z: 1.6 }, 2, 3);
    R.cartouche(tl, 4, 6, 'perso_ouedraogo', 'droite');
    tl.to(bebe.p, { bA: 140, bR: 140, duration: 0.4, yoyo: true, repeat: 7 }, 5);
    // Le nom : l'étalon qui l'a amenée
    G.pointer(tl, r, 11, 4);
    R.parle(tl, r, 11, 3);
    tl.to(ch.p, { tete: -15, duration: 0.4, yoyo: true, repeat: 3 }, 12);
    R.cam(tl, sc, { x: 1200, y: 640, z: 1.1 }, 11, 3);
    // Il grandit
    const enfant = sc.perso(C.enfant, { haut: { type: 'tunique', couleur: '#8a1f2a' }, bas: { type: 'short', couleur: '#e8dcc0' } }, { x: 1100, y: SOL, alpha: 0 });
    tl.to(bebe.root, { opacity: 0, duration: 0.6 }, 18);
    R.pose(tl, yen, { bA: 8, cA: 12 }, 18.5, 0.4);
    tl.to(enfant.p, { alpha: 1, duration: 0.6 }, 18.5);
    R.expr(tl, enfant, 'rire', 19);
    tl.to(enfant.p, { x: 1500, duration: 2.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 19.5);
    R.saut(tl, enfant, 24, 50);
    R.cam(tl, sc, { x: 1100, y: 620, z: 1 }, 19, 6);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 8 · Le retour
  R.scene('Le retour', 50, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#24305a' });
    const roi = sc.perso(C.roi, COSTUMES.nedega, { x: 960, y: COUR, assis: 1 });
    roi.tenir(D.sceptre(), 'R', { vertical: true });
    const yen = yennenga(sc, COSTUMES.yennengaRobe, { x: -200, y: COUR });
    const r = riale(sc, { x: -350, y: COUR });
    const oued = sc.perso(C.guerrier, { haut: { type: 'tunique', couleur: '#8a1f2a', motif: 'bandes', motifCouleur: '#e9c46a' }, bas: { type: 'short', couleur: '#e8dcc0' }, manches: '#8a1f2a' }, { x: -500, y: COUR });
    const cour = G.foule(sc, [[C.ancien, H.notable, 1250, -1], [C.vieille, null, 1380, -1], [C.guerrier, H.guerrier, 1520, -1]], COUR);
    sc.cam.x = 900; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_retour');
    [yen, r, oued].forEach((p, i) => R.marche(tl, p, 760 - i * 140, 1 + i * 0.3, 6));
    R.expr(tl, roi, 'surprise', 6);
    [yen, r, oued].forEach((p, i) => G.agenouiller(tl, p, 7.5 + i * 0.2));
    R.cam(tl, sc, { x: 860, y: 700, z: 1.4 }, 7, 3);
    // Le roi pardonne et accueille son petit-fils
    R.pose(tl, roi, { assis: 0 }, 11, 1);
    R.expr(tl, roi, 'joie', 12);
    R.marche(tl, roi, 820, 12.5, 1.5, { pas: 2 });
    R.pose(tl, roi, { bA: 80, cA: 10, lean: 15 }, 14, 0.5);
    [yen, r, oued].forEach((p, i) => G.relever(tl, p, 15 + i * 0.2));
    R.pose(tl, roi, { bA: 70, cA: 80, lean: 0 }, 16, 0.5);
    R.pose(tl, yen, { bA: 70, cA: 80 }, 16, 0.5);
    G.exprFoule(tl, [yen, r, oued].concat(cour), 'joie', 16);
    R.cam(tl, sc, { x: 960, y: 620, z: 1 }, 18, 4);
    // Ouédraogo reçoit chevaux et guerriers
    const ch = sc.bete(B.chevalBlanc, { x: 2300, y: COUR, dir: -1, s: 0.95 });
    R.marche(tl, ch, 900, 22, 5, { pas: 8 });
    G.pointer(tl, roi, 23, 3);
    R.expr(tl, oued, 'surprise', 24);
    R.cartouche(tl, 28, 6, 'lieu_mossi');
    R.cam(tl, sc, { x: 960, y: 560, z: 0.9 }, 30, 6);
    G.danseFoule(tl, cour, 30, 10, COUR);
    R.fonduSortie(tl, 37, 1.5);
    R.titre(tl, 38.6, 4, 'fin');
    R.generique(tl, 43, 7, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
