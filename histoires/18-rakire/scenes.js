/*
 * 18 · Le rakiré entre Samo et Mossi — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;
  const { montrer, cacher, objet } = R;

  const COSTUMES = {
    chefSamo: { haut: { type: 'tunique', couleur: '#e8dcc0', motif: 'chevrons', motifCouleur: '#3a2a1a' }, bas: { type: 'short', couleur: '#3a2a1a' }, tete: { type: 'bonnet', couleur: '#e8dcc0' }, collier: '#efe6cf' },
    chefMossi: { haut: { type: 'boubou', couleur: '#e9e2cf', motif: 'bandes', motifCouleur: '#b23a2a', long: 1.4 }, manches: '#e9e2cf', tete: { type: 'bonnet', couleur: '#b23a2a' } },
    samo: { haut: { type: 'tunique', couleur: '#c9b48a', motif: 'bandes', motifCouleur: '#5a4a3a' }, bas: { type: 'short', couleur: '#5a4a3a' }, tete: null },
    soigneuse: { haut: { type: 'camisole', couleur: '#5b8c5a' }, bas: { type: 'jupe', couleur: '#e8dcc0', motif: 'points', motifCouleur: '#3a5a3a' }, tete: { type: 'foulard', couleur: '#e8dcc0' } },
  };
  const archersSamo = (sc, xs, parent) => xs.map(([def, x, dir]) => { const p = sc.perso(def, COSTUMES.samo, { x, y: SOL, dir: dir || 1 }, parent); p.tenir(D.arc(), 'R', { vertical: true }); return p; });
  const chefMossiACheval = (sc, x, dir, parent) => { const ch = sc.bete(B.cheval, { x, y: SOL, dir }, parent); const c = sc.perso(C.roi, COSTUMES.chefMossi, {}, parent); ch.monter(c); c.tenir(D.sabre(), 'A'); ch.cav = c; return ch; };

  // =================================================================== 1 · Pays samo
  R.scene('Pays samo', 26, (sc, tl) => {
    DECORS.village(sc, { soleil: [300, 200, 60] });
    const gens = G.foule(sc, [[C.colosse, COSTUMES.chefSamo, 800, 1], [C.ronde, H.villageoise, 650, 1], [C.enfant, null, 1000, -1]]);
    sc.cam.y = 540; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 280);
    R.cartouche(tl, 8, 5, 'lieu_samo');
    G.piocher(tl, gens[0], 8, 8, 0.9);
    R.saut(tl, gens[2], 9, 40);
    R.cam(tl, sc, { x: 850, y: 640, z: 1.25 }, 8, 14);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Les cavaliers
  R.scene('Les cavaliers', 34, (sc, tl) => {
    DECORS.village(sc, {});
    const chef = sc.perso(C.colosse, COSTUMES.chefSamo, { x: 760, y: SOL });
    const samos = archersSamo(sc, [[C.filiforme, 600], [C.trapu, 460]]);
    const mossi = chefMossiACheval(sc, 2300, -1);
    const cav = G.cavaliers(sc, [[2550, -1], [2750, -1]]);
    sc.cam.x = 1100; sc.cam.y = 600; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_mossi', 'droite');
    R.marche(tl, mossi, 1350, 1, 6, { pas: 10 });
    G.chevaucher(tl, cav, 1600, 1.3, 6, { pas: 10, amp: 1 });
    G.exprFoule(tl, [chef].concat(samos), 'colere', 5);
    G.dialogue(tl, 8, [[mossi.cav, 3], [chef, 3], [mossi.cav, 2.5]]);
    G.pointer(tl, mossi.cav, 9, 2);
    R.pose(tl, chef, { bA: 160, cA: 40 }, 12, 0.3);
    R.pose(tl, chef, { bA: 8, cA: 12 }, 14, 0.3);
    R.cam(tl, sc, { x: 1050, y: 640, z: 1.25 }, 8, 3);
    tl.to(mossi.p, { cabre: 1, duration: 0.4, yoyo: true, repeat: 1 }, 17);
    R.pose(tl, mossi.cav, { bA: 160, cA: 10 }, 17, 0.3);
    samos.forEach((p) => R.pose(tl, p, { bR: 90, cR: 0, bA: 80, cA: 110 }, 18, 0.4));
    R.secousse(tl, sc, 18, 6, 1);
    R.cam(tl, sc, { x: 1100, y: 600, z: 0.95 }, 19, 3);
    tl.set(mossi.p, { dir: 1 }, 22);
    R.marche(tl, mossi, 2400, 22.5, 6, { pas: 14, amp: 1.3 });
    cav.forEach((ch, i) => { tl.set(ch.p, { dir: 1 }, 22.2 + i * 0.2); R.marche(tl, ch, 2700 + i * 200, 22.5 + i * 0.2, 6, { pas: 14, amp: 1.3 }); });
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 3 · La bataille
  R.scene('La bataille', 40, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'orage' });
    const chef = sc.perso(C.colosse, COSTUMES.chefSamo, { x: 500, y: SOL });
    chef.tenir(D.lance(220), 'A', { vertical: true });
    const samos = archersSamo(sc, [[C.filiforme, 380], [C.trapu, 260], [C.guerrier, 640]]);
    const mossi = chefMossiACheval(sc, 2300, -1);
    const cav = G.cavaliers(sc, [[2550, -1], [2750, -1], [2950, -1]]);
    const poussiere = D.particules(sc.monde, 40, 1000, 860, '#c9a678', 9);
    sc.cam.x = 1000; sc.cam.y = 600; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_guerre');
    G.exprFoule(tl, [chef].concat(samos), 'colere', 1);
    R.marche(tl, mossi, 1300, 2, 4, { pas: 12, amp: 1.5 });
    G.chevaucher(tl, cav, 1500, 2.3, 4, { pas: 12 });
    [[0, 4], [1, 4.6], [2, 5.2], [0, 7], [1, 7.6]].forEach(([i, t], k) => G.tirer(tl, samos[i], sc.monde, t, 1250 + (k % 3) * 160, 680, 0.6));
    [5, 5.8, 6.6, 7.4].forEach((t, i) => R.jaillir(tl, poussiere, t, i, { n: 8, ecart: 60, haut: 90, duree: 1.2 }));
    R.cam(tl, sc, { x: 900, y: 620, z: 1 }, 5, 3);
    // Mêlée : coups, chutes, de part et d'autre
    R.marche(tl, mossi, 800, 9, 2, { pas: 6, amp: 1.5 });
    G.frapper(tl, mossi.cav, samos[2], 11);
    G.tomber(tl, samos[2], 11.6, -1);
    G.frapper(tl, chef, cav[0].cav, 12.5);
    tl.to(cav[0].cav.p, { alpha: 0, duration: 0.2 }, 13.2);
    const tombe = sc.perso(C.guerrier, H.cavalier, { x: 1600, y: SOL, rot: 84, alpha: 0 });
    tl.to(tombe.p, { alpha: 1, duration: 0.2 }, 13.2);
    R.expr(tl, tombe, 'douleur', 13.2);
    R.secousse(tl, sc, 11.5, 10, 2);
    R.cam(tl, sc, { x: 1100, y: 600, z: 0.95 }, 13, 3);
    tl.to(sc.cam, { x: 1000, duration: 8 }, 17);
    // La nuit tombe sur le champ de bataille
    const ombre = R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#1a1430', opacity: 0 }, sc.monde);
    tl.to(ombre, { opacity: 0.45, duration: 10 }, 26);
    G.exprFoule(tl, [chef, mossi.cav], 'triste', 30);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 4 · Les blessés
  R.scene('Les blessés', 36, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir' });
    const blesses = [
      sc.perso(C.guerrier, COSTUMES.samo, Object.assign({ x: 700, y: 862, rot: -88 }, R.EXPRESSIONS.douleur)),
      sc.perso(C.guerrier, H.cavalier, Object.assign({ x: 1150, y: 862, rot: 88 }, R.EXPRESSIONS.douleur)),
    ];
    const chevalSeul = sc.bete(B.cheval, { x: 1600, y: SOL, dir: -1, tete: 30 });
    sc.cam.x = 950; sc.cam.y = 700; sc.cam.z = 1.4;
    R.fonduEntree(tl, 0, 2);
    R.cartouche(tl, 1.5, 5, 'lieu_blesses');
    blesses.forEach((p, i) => tl.to(p.p, { bouche: 0.6, duration: 0.4, yoyo: true, repeat: 5 }, 3 + i));
    tl.to(chevalSeul.p, { tete: 45, duration: 1.5, yoyo: true, repeat: 3 }, 2);
    // Ils se regardent, ennemis, puis l'un tend sa gourde à l'autre
    R.pose(tl, blesses[0], { regard: 1 }, 10, 0.4);
    R.pose(tl, blesses[1], { regard: 1 }, 10.5, 0.4);
    R.cam(tl, sc, { x: 930, y: 760, z: 2 }, 10, 3);
    R.expr(tl, blesses[0], 'colere', 11);
    R.expr(tl, blesses[1], 'colere', 11.3);
    R.expr(tl, blesses[0], 'triste', 15);
    R.expr(tl, blesses[1], 'triste', 15.5);
    const gourde = R.objet(D.calebasse(), false); blesses[0].tenir(gourde, 'A', { vertical: true });
    montrer(tl, gourde, 18, 0.3);
    R.pose(tl, blesses[0], { bA: 90, cA: 0 }, 18, 1);
    R.expr(tl, blesses[1], 'surprise', 19.5);
    R.pose(tl, blesses[1], { bA: 90, cA: 0 }, 20, 1);
    R.expr(tl, blesses[1], 'serein', 23);
    R.expr(tl, blesses[0], 'serein', 23.5);
    R.cam(tl, sc, { x: 950, y: 700, z: 1.4 }, 24, 6);
    R.fonduSortie(tl, 34, 2);
  });

  // =================================================================== 5 · Les soins
  R.scene('Les soins', 36, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir' });
    const feu = D.feu(sc.monde, 960, SOL + 2, 0.8); G.flamber(tl, feu, 0, 36);
    const blesses = [
      sc.perso(C.guerrier, COSTUMES.samo, Object.assign({ x: 760, y: SOL, assis: 1 }, R.EXPRESSIONS.douleur)),
      sc.perso(C.guerrier, H.cavalier, Object.assign({ x: 1160, y: SOL, assis: 1, dir: -1 }, R.EXPRESSIONS.douleur)),
    ];
    const soigneuse = sc.perso(C.elancee, COSTUMES.soigneuse, { x: -200, y: SOL });
    const fs = R.objet(D.feuilles(), true); soigneuse.tenir(fs, 'A', { vertical: true });
    const cavalier = sc.perso(C.guerrier, H.cavalier, { x: 2200, y: SOL, dir: -1 });
    const eau = D.calebasse(); cavalier.tenir(eau, 'A', { vertical: true });
    sc.cam.x = 960; sc.cam.y = 660; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, soigneuse, 650, 1, 5);
    R.marche(tl, cavalier, 1280, 1.5, 5);
    G.exprFoule(tl, [soigneuse, cavalier], 'surprise', 6.5);
    R.pose(tl, soigneuse, { lean: 30, bA: 70 }, 8, 0.5);
    R.pose(tl, cavalier, { lean: 30, bA: 70 }, 8.5, 0.5);
    R.pose(tl, soigneuse, { lean: 0, bA: 8 }, 11, 0.5);
    // Ils se regardent, hésitent… puis soignent chacun le blessé de l'autre camp
    R.cam(tl, sc, { x: 960, y: 640, z: 1.05 }, 11, 2);
    R.marche(tl, soigneuse, 1080, 13, 3, { pas: 5 });
    tl.set(cavalier.p, { dir: -1 }, 13);
    R.marche(tl, cavalier, 840, 13.2, 3, { pas: 5 });
    tl.set(soigneuse.p, { dir: 1 }, 16.2); tl.set(cavalier.p, { dir: -1 }, 16.2);
    R.pose(tl, soigneuse, { lean: 25, bA: 70, cA: 30 }, 16.5, 0.5);
    R.pose(tl, cavalier, { lean: 25, bA: 70, cA: 30 }, 16.7, 0.5);
    tl.to([soigneuse.p, cavalier.p], { cA: 60, duration: 0.4, yoyo: true, repeat: 9 }, 17.2);
    R.expr(tl, blesses[0], 'serein', 21); R.expr(tl, blesses[1], 'serein', 21.5);
    R.cam(tl, sc, { x: 960, y: 700, z: 1.5 }, 18, 4);
    R.pose(tl, soigneuse, { lean: 0, bA: 8, cA: 12 }, 25, 0.5);
    R.pose(tl, cavalier, { lean: 0, bA: 8, cA: 12 }, 25.2, 0.5);
    G.exprFoule(tl, [soigneuse, cavalier], 'joie', 26);
    G.incliner(tl, cavalier, 27, 2, 25);
    G.incliner(tl, soigneuse, 27.3, 2, 25);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 6 · Le pacte
  R.scene('Le pacte', 38, (sc, tl) => {
    DECORS.brousse(sc, {});
    D.cailcedrat(sc.monde, 960, SOL + 6, 1);
    const chefS = sc.perso(C.colosse, COSTUMES.chefSamo, { x: 600, y: SOL });
    const chefM = sc.perso(C.roi, COSTUMES.chefMossi, { x: 1320, y: SOL, dir: -1 });
    const cal = R.objet(D.calebasse(), true); chefS.tenir(cal, 'A', { vertical: true });
    const calM = R.objet(D.calebasse(), false); chefM.tenir(calM, 'A', { vertical: true });
    const temoins = G.foule(sc, [[C.filiforme, COSTUMES.samo, 420, 1], [C.elancee, COSTUMES.soigneuse, 300, 1], [C.guerrier, H.cavalier, 1500, -1], [C.guerrier, H.cavalier, 1640, -1]]);
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'lieu_pacte');
    R.marche(tl, chefS, 860, 2, 3); R.marche(tl, chefM, 1060, 2.2, 3);
    G.dialogue(tl, 5.5, [[chefS, 3], [chefM, 3]]);
    R.cam(tl, sc, { x: 960, y: 680, z: 1.5 }, 5, 3);
    // Ils boivent l'un après l'autre dans la même calebasse
    R.pose(tl, chefS, { bA: 140, cA: 120 }, 12.5, 0.6);
    R.pose(tl, chefS, { bA: 8, cA: 12 }, 14, 0.5);
    G.donner(tl, chefS, cal, chefM, calM, 15);
    R.pose(tl, chefM, { bA: 140, cA: 120 }, 17, 0.6);
    R.pose(tl, chefM, { bA: 8, cA: 12 }, 18.5, 0.5);
    R.cacher(tl, calM, 19, 0.3);
    // Accolade
    R.pose(tl, chefS, { bA: 70, cA: 70 }, 20, 0.5);
    R.pose(tl, chefM, { bA: 70, cA: 70 }, 20, 0.5);
    R.marche(tl, chefS, 920, 20.2, 0.6, { pas: 1 });
    R.marche(tl, chefM, 1000, 20.2, 0.6, { pas: 1 });
    G.exprFoule(tl, [chefS, chefM].concat(temoins), 'joie', 21);
    R.cam(tl, sc, { x: 960, y: 600, z: 0.95 }, 22, 4);
    G.applaudir(tl, temoins[1], 23, 6);
    temoins.forEach((p, i) => { if (i !== 1) R.saut(tl, p, 24 + i * 0.3, 40); });
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 7 · Le rakiré
  R.scene('Le rakiré', 36, (sc, tl) => {
    DECORS.ville(sc, { mosqueeX: 1600, mosqueeS: 0.7 });
    const samo = sc.perso(C.trapu, COSTUMES.samo, { x: 800, y: SOL });
    const mossi = sc.perso(C.filiforme, { haut: { type: 'boubou', couleur: '#e9e2cf', motif: 'bandes', motifCouleur: '#b23a2a', long: 1.4 }, manches: '#e9e2cf', tete: { type: 'bonnet', couleur: '#b23a2a' } }, { x: 1080, y: SOL, dir: -1 });
    const public_ = G.foule(sc, [[C.ronde, H.villageoise, 560, 1], [C.enfant, null, 1300, -1], [C.vieille, null, 1430, -1]]);
    sc.cam.x = 940; sc.cam.y = 640; sc.cam.z = 1.25;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'lieu_rakire');
    // Moqueries mimées : il imite l'autre, qui fait semblant de se fâcher, puis tous rient
    R.expr(tl, samo, 'rire', 2);
    R.pose(tl, samo, { lean: 25, bA: 60, cA: 100, bR: 60, cR: 100 }, 2.5, 0.4);
    tl.to(samo.p, { bob: -6, duration: 0.2, yoyo: true, repeat: 7 }, 3);
    R.parle(tl, samo, 3, 3);
    R.expr(tl, mossi, 'colere', 4);
    R.pose(tl, mossi, { bA: 70, cA: 110, bR: 70, cR: 110 }, 4.5, 0.4);
    R.expr(tl, mossi, 'rire', 7.5);
    R.pose(tl, samo, { lean: 0, bA: 8, cA: 12, bR: -8, cR: 12 }, 7, 0.4);
    R.pose(tl, mossi, { bA: 150, cA: 30 }, 8, 0.3);
    R.parle(tl, mossi, 8, 3);
    tl.to(mossi.p, { tete: 15, duration: 0.2, yoyo: true, repeat: 9 }, 8.3);
    R.expr(tl, samo, 'surprise', 9);
    R.expr(tl, samo, 'rire', 11.5);
    G.exprFoule(tl, public_, 'rire', 12);
    tl.to(public_.map((p) => p.p), { bob: -5, duration: 0.2, yoyo: true, repeat: 9 }, 12.5);
    R.pose(tl, samo, { bA: 85, cA: 0 }, 15, 0.4);
    R.pose(tl, mossi, { bA: 85, cA: 0 }, 15.2, 0.4);
    tl.to([samo.p, mossi.p], { cA: 12, duration: 0.2, yoyo: true, repeat: 5 }, 15.6);
    R.cam(tl, sc, { x: 960, y: 600, z: 1 }, 18, 4);
    G.danseFoule(tl, [samo, mossi].concat(public_), 19, 12);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 26, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir' });
    const amis = G.foule(sc, [[C.filiforme, { haut: { type: 'tunique', couleur: '#2f6c8f' }, bas: { type: 'short', couleur: '#e8dcc0' }, manches: '#2f6c8f' }, 860, 1], [C.trapu, H.villageois, 1060, -1]]);
    sc.cam.x = 960; sc.cam.y = 660; sc.cam.z = 1.3;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_aujourdhui');
    G.dialogue(tl, 2, [[amis[0], 2], [amis[1], 2]]);
    G.exprFoule(tl, amis, 'rire', 4.5);
    R.pose(tl, amis[0], { bA: 85, cA: 0 }, 6, 0.4); R.pose(tl, amis[1], { bA: 85, cA: 0 }, 6.1, 0.4);
    R.cam(tl, sc, { y: 540, z: 0.95 }, 7, 5);
    R.fonduSortie(tl, 11.5, 1.5);
    R.titre(tl, 13, 4, 'fin');
    R.generique(tl, 17.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
