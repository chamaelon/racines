/*
 * 15 · Guimbi Ouattara, la reine de Bobo — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, COUR = 900;

  const COSTUMES = {
    guimbi: { haut: { type: 'boubou', couleur: '#24305a', motif: 'chevrons', motifCouleur: '#e9c46a', long: 1.8 }, manches: '#24305a', tete: { type: 'foulard', couleur: '#e9c46a' }, collier: '#ffd166', bracelets: '#ffd166' },
    tieba: { haut: { type: 'boubou', couleur: '#7a1f2a', motif: 'bandes', motifCouleur: '#e9c46a', long: 1.6 }, manches: '#7a1f2a', tete: { type: 'turban', couleur: '#f4f0e6' } },
    porteur: { haut: null, bas: { type: 'short', couleur: '#e8dcc0' }, tete: null },
  };
  const guimbi = (sc, pose, parent) => sc.perso(C.elancee, COSTUMES.guimbi, Object.assign({ y: COUR }, pose), parent);
  const gardes = (sc, liste, y, parent) => liste.map(([x, dir]) => { const g = sc.perso(C.guerrier, H.guerrier, { x, y: y || COUR, dir }, parent); g.tenir(D.lance(230), 'A', { vertical: true }); return g; });
  const carnet = () => { const g = R.el('g', {}); R.el('rect', { x: -14, y: -20, width: 28, height: 36, rx: 3, fill: '#f6f0dc', stroke: '#8a7a5a', 'stroke-width': 2 }, g); R.el('path', { d: 'M-8,-10 h16 M-8,-2 h16 M-8,6 h12', stroke: '#8a7a5a', 'stroke-width': 1.5 }, g); return g; };

  // =================================================================== 1 · Sya
  R.scene('Sya', 26, (sc, tl) => {
    DECORS.ville(sc, { soleil: [300, 180, 60] });
    const passants = G.foule(sc, [[C.ronde, H.villageoise, -200, 1], [C.trapu, H.villageois, 2200, -1], [C.ancien, H.marabout, -380, 1]]);
    G.surLaTete(passants[0], D.calebasse());
    sc.cam.y = 520; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 280);
    passants.forEach((p, i) => R.marche(tl, p, i === 1 ? -300 : 2300, 1 + i, 18, { pas: 24 }));
    R.cartouche(tl, 8, 5, 'lieu_sya');
    R.cam(tl, sc, { x: 1200, y: 480, z: 1.05 }, 8, 14);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Guimbi juge
  R.scene('Guimbi', 36, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#24305a' });
    const g = guimbi(sc, { x: 960, assis: 1 });
    gardes(sc, [[720, 1], [1200, -1]]);
    const plaignants = G.foule(sc, [[C.colosse, H.forgeron, 520, 1], [C.filiforme, H.villageois, 380, 1]], COUR);
    sc.cam.x = 860; sc.cam.y = 660; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'perso_guimbi', 'droite');
    G.exprFoule(tl, plaignants, 'colere', 1);
    G.dialogue(tl, 2, [[plaignants[0], 3], [plaignants[1], 3], [plaignants[0], 2]]);
    R.pose(tl, plaignants[0], { bA: 150, cA: 40 }, 3, 0.3);
    R.pose(tl, plaignants[0], { bA: 8, cA: 12 }, 5, 0.3);
    // Guimbi lève la main : silence ; elle tranche
    R.pose(tl, g, { bA: 120, cA: 0 }, 11, 0.4);
    G.exprFoule(tl, plaignants, 'surprise', 11.3);
    R.cam(tl, sc, { x: 960, y: 720, z: 1.7 }, 11, 2);
    R.parle(tl, g, 12, 5);
    R.expr(tl, g, 'serein', 12);
    G.pointer(tl, g, 14, 2);
    R.pose(tl, g, { bA: 8, cA: 12 }, 17, 0.4);
    R.cam(tl, sc, { x: 700, y: 660, z: 1.3 }, 17, 3);
    G.exprFoule(tl, plaignants, 'joie', 19);
    R.pose(tl, plaignants[0], { bA: 85, cA: 0 }, 20, 0.4);
    R.pose(tl, plaignants[1], { bA: 85, cA: 0 }, 20.2, 0.4);
    tl.to([plaignants[0].p, plaignants[1].p], { cA: 12, duration: 0.2, yoyo: true, repeat: 5 }, 20.6);
    plaignants.forEach((p, i) => G.incliner(tl, p, 24 + i * 0.3, 2, 30));
    R.cam(tl, sc, { x: 900, y: 620, z: 1.05 }, 26, 4);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 3 · L'explorateur
  R.scene('L\'explorateur', 38, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#24305a' });
    const g = guimbi(sc, { x: 960, assis: 1 });
    gardes(sc, [[720, 1], [1200, -1]]);
    const exp = sc.perso(C.europeen, null, { x: -200, y: COUR });
    const notes = R.objet(carnet(), false); exp.tenir(notes, 'A', { vertical: true });
    const porteurs = [[C.trapu, -360], [C.filiforme, -520]].map(([def, x]) => { const p = sc.perso(def, COSTUMES.porteur, { x, y: COUR }); G.surLaTete(p, D.sac()); return p; });
    const servante = sc.perso(C.fille, H.villageoise, { x: 1400, y: COUR, dir: -1 });
    const cal = R.objet(D.calebasse(), true); servante.tenir(cal, 'A', { vertical: true });
    const calE = R.objet(D.calebasse(), false); exp.tenir(calE, 'R', { vertical: true });
    sc.cam.x = 760; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, exp, 620, 1, 6);
    porteurs.forEach((p, i) => R.marche(tl, p, 440 - i * 140, 1.3 + i * 0.3, 6));
    R.cartouche(tl, 3, 5, 'perso_explorateur');
    R.expr(tl, g, 'surprise', 4);
    tl.to(exp.p, { tete: 10, duration: 0.3 }, 7.5);
    G.incliner(tl, exp, 7.5, 2, 30);
    R.expr(tl, g, 'serein', 9);
    G.pointer(tl, g, 10, 2);
    // L'eau et la cola de bienvenue
    R.marche(tl, servante, 760, 11, 3, { pas: 5 });
    G.donner(tl, servante, cal, exp, calE, 14.2);
    R.pose(tl, exp, { bR: 140, cR: 90 }, 15.8, 0.5);
    R.pose(tl, exp, { bR: -8, cR: 12 }, 17, 0.5);
    R.cam(tl, sc, { x: 800, y: 700, z: 1.5 }, 14, 3);
    G.dialogue(tl, 18, [[exp, 3], [g, 3.5], [exp, 2.5]]);
    // Il prend des notes
    R.montrer(tl, notes, 27.5, 0.3);
    R.pose(tl, exp, { bA: 60, cA: 100, tete: -15, bR: 50, cR: 100 }, 27.5, 0.5);
    tl.to(exp.p, { cR: 80, duration: 0.2, yoyo: true, repeat: 9 }, 28.2);
    R.expr(tl, g, 'joie', 30);
    R.cam(tl, sc, { x: 880, y: 640, z: 1.15 }, 30, 4);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 4 · Tiéba
  R.scene('Tiéba', 32, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'chaud' });
    const chefCheval = sc.bete(B.chevalBlanc, { x: 2300, y: SOL, dir: -1 });
    const tieba = sc.perso(C.roi, COSTUMES.tieba, {}); chefCheval.monter(tieba);
    tieba.tenir(D.sabre(), 'A');
    const cav = [2550, 2750, 2950, 3150].map((x, i) => { const ch = sc.bete(B.cheval, { x, y: SOL + (i % 2) * 14, dir: -1, s: 0.9 }); const c = sc.perso(C.guerrier, H.cavalier, {}); ch.monter(c); c.tenir(D.lance(220), 'A', { vertical: true }); return ch; });
    sc.cam.x = 1200; sc.cam.y = 580; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, chefCheval, 1300, 1, 9, { pas: 14 });
    cav.forEach((ch, i) => R.marche(tl, ch, 1550 + i * 200, 1.3 + i * 0.3, 9, { pas: 14 }));
    R.cartouche(tl, 5, 5, 'perso_tieba', 'droite');
    R.secousse(tl, sc, 2, 3, 6);
    R.cam(tl, sc, { x: 1350, y: 620, z: 1.25 }, 9, 3);
    R.expr(tl, tieba, 'colere', 11);
    G.pointer(tl, tieba, 12, 3);
    R.parle(tl, tieba, 12, 3);
    tl.to(chefCheval.p, { cabre: 1, duration: 0.4, yoyo: true, repeat: 1 }, 16);
    // Il envoie un émissaire au galop
    R.marche(tl, cav[0], -400, 18, 6, { pas: 18, amp: 1.4 });
    R.cam(tl, sc, { x: 900, y: 580, z: 0.95 }, 18, 6);
    R.fonduSortie(tl, 30.5, 1.5);
  });

  // =================================================================== 5 · Le refus
  R.scene('Le refus', 40, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#24305a' });
    const g = guimbi(sc, { x: 960, assis: 1 });
    const gs = gardes(sc, [[720, 1], [1200, -1]]);
    const envoye = sc.perso(C.guerrier, H.cavalier, { x: -200, y: COUR });
    const notables = G.foule(sc, [[C.ancien, H.marabout, 1380, -1], [C.roi, H.notable, 1520, -1]], COUR);
    sc.cam.x = 900; sc.cam.y = 650; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, envoye, 600, 1, 5);
    R.cartouche(tl, 2, 4.5, 'perso_envoye');
    R.expr(tl, envoye, 'colere', 6);
    G.dialogue(tl, 6.5, [[envoye, 4]]);
    G.pointer(tl, envoye, 7, 3);
    R.pose(tl, envoye, { bA: 160, cA: 20 }, 10, 0.4);
    G.exprFoule(tl, notables, 'peur', 9);
    R.cam(tl, sc, { x: 800, y: 680, z: 1.4 }, 6, 3);
    // Guimbi se lève
    R.pose(tl, envoye, { bA: 8, cA: 12 }, 12, 0.4);
    R.cam(tl, sc, { x: 960, y: 700, z: 1.6 }, 12.5, 2);
    R.pose(tl, g, { assis: 0 }, 13, 1);
    R.expr(tl, g, 'colere', 14);
    R.parle(tl, g, 14.5, 5);
    tl.to(g.p, { tete: 12, duration: 0.3, yoyo: true, repeat: 5 }, 15);
    G.pointer(tl, g, 19.5, 4, 0.1);
    R.cam(tl, sc, { x: 850, y: 650, z: 1.15 }, 20, 2);
    gs.forEach((x, i) => R.marche(tl, x, 760 + i * 20, 20.5 + i * 0.2, 1.2, { pas: 3 }));
    R.expr(tl, envoye, 'surprise', 21);
    tl.set(envoye.p, { dir: -1 }, 23);
    R.marche(tl, envoye, -300, 23.2, 4, { pas: 10, amp: 1.2 });
    G.exprFoule(tl, notables, 'joie', 26);
    G.applaudir(tl, notables[1], 27, 4);
    R.expr(tl, g, 'serein', 27);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 6 · Bobo se défend
  R.scene('Bobo se défend', 45, (sc, tl) => {
    DECORS.ville(sc, { ciel: 'soir', mosqueeX: 1600, mosqueeS: 0.7 });
    D.muret(sc.monde, -300, 900, SOL, 110, '#a8603a');
    const defenseurs = G.foule(sc, [[C.guerrier, H.guerrier, 300, 1], [C.colosse, H.forgeron, 160, 1], [C.filiforme, H.villageois, 440, 1], [C.trapu, H.villageois, 20, 1]], SOL - 70);
    defenseurs.forEach((p, i) => p.tenir(i === 1 ? D.lance(220) : D.arc(), i === 1 ? 'A' : 'R', { vertical: true }));
    const g = guimbi(sc, { x: 560, y: SOL - 70 });
    const devant = sc.calque();
    D.muret(devant, -300, 900, SOL + 10, 80, '#b9713d');
    const cav = [2100, 2300, 2500, 2700].map((x, i) => { const ch = sc.bete(B.cheval, { x, y: SOL + (i % 2) * 14, dir: -1, s: 0.95 }); const c = sc.perso(C.guerrier, H.cavalier, {}); ch.monter(c); c.tenir(D.lance(220), 'A', { vertical: true }); return ch; });
    sc.cam.x = 900; sc.cam.y = 600; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_resistance');
    G.exprFoule(tl, defenseurs, 'colere', 2);
    G.pointer(tl, g, 3, 3);
    cav.forEach((ch, i) => R.marche(tl, ch, 1150 + i * 160, 5 + i * 0.3, 5, { pas: 14, amp: 1.4 }));
    R.cam(tl, sc, { x: 1100, y: 600, z: 0.9 }, 5, 4);
    [[2, 10.5], [0, 11.2], [3, 11.9], [2, 14], [0, 14.7], [3, 15.5]].forEach(([i, t], k) => G.tirer(tl, defenseurs[i], sc.monde, t, 1200 + (k % 4) * 140, 680, 0.5));
    cav.forEach((ch, i) => { tl.to(ch.p, { cabre: 1, duration: 0.3, yoyo: true, repeat: 3 }, 12 + i * 0.4); G.exprFoule(tl, [ch.cavalier], 'peur', 12.5); });
    R.secousse(tl, sc, 12, 6, 0.5);
    // Les cavaliers reculent
    cav.forEach((ch, i) => { tl.set(ch.p, { dir: 1 }, 18 + i * 0.3); R.marche(tl, ch, 2900 + i * 150, 18.2 + i * 0.3, 6, { pas: 16, amp: 1.4 }); });
    R.cam(tl, sc, { x: 600, y: 600, z: 1.1 }, 22, 4);
    G.exprFoule(tl, defenseurs.concat([g]), 'joie', 24);
    defenseurs.forEach((p, i) => R.pose(tl, p, { bA: 165, cA: 30 }, 25 + i * 0.2, 0.4));
    R.pose(tl, g, { bA: 160, cA: 10 }, 26, 0.5);
    R.cam(tl, sc, { x: 560, y: 680, z: 1.6 }, 30, 6);
    R.fonduSortie(tl, 43.5, 1.5);
  });

  // =================================================================== 7 · La fête
  R.scene('La fête', 32, (sc, tl) => {
    DECORS.ville(sc, { ciel: 'soir', soleil: [300, 650, 60] });
    const g = guimbi(sc, { x: 900, y: SOL });
    const gens = G.foule(sc, [[C.ronde, H.villageoise, 1100, -1], [C.enfant, null, 1220, -1], [C.colosse, H.forgeron, 700, 1], [C.vieille, null, 560, 1], [C.fille, null, 1350, -1], [C.trapu, H.villageois, 420, 1]]);
    sc.cam.x = 900; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    G.exprFoule(tl, gens, 'rire', 1);
    G.danseFoule(tl, gens, 2, 20);
    R.expr(tl, g, 'joie', 2);
    G.saluer(tl, g, 4, 3);
    R.cam(tl, sc, { x: 900, y: 680, z: 1.4 }, 8, 6);
    R.cam(tl, sc, { x: 900, y: 560, z: 0.9 }, 18, 8);
    R.fonduSortie(tl, 30.5, 1.5);
  });

  // =================================================================== 8 · Mémoire
  R.scene('Mémoire', 26, (sc, tl) => {
    DECORS.ville(sc, { ciel: 'soir' });
    const griotte = sc.perso(C.vieille, null, { x: 800, y: SOL });
    const enfants = G.foule(sc, [[C.fille, null, 980, -1], [C.enfant, null, 1090, -1]]);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_memoire');
    G.dialogue(tl, 1.5, [[griotte, 4]]);
    R.pose(tl, griotte, { bA: 160, cA: 30 }, 4, 0.5);
    G.exprFoule(tl, enfants, 'joie', 5);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 7, 5);
    R.fonduSortie(tl, 11.5, 1.5);
    R.titre(tl, 13, 4, 'fin');
    R.generique(tl, 17.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
