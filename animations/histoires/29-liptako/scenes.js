/*
 * 29 · L'émirat du Liptako — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, COUR = 900;

  const COSTUMES = {
    emir: Object.assign({}, H.cavalier, { haut: { type: 'boubou', couleur: '#f4f0e6', motif: 'chevrons', motifCouleur: '#2f6c8f', long: 1.6 }, manches: '#f4f0e6', tete: { type: 'turban', couleur: '#f4f0e6' } }),
    gulmance: { haut: { type: 'tunique', couleur: '#8a5a32', motif: 'chevrons', motifCouleur: '#e8dcc0' }, bas: { type: 'short', couleur: '#3a2a1a' }, tete: { type: 'bonnet', couleur: '#b23a2a' } },
    chefG: { haut: { type: 'boubou', couleur: '#b23a2a', motif: 'bandes', motifCouleur: '#1d140f', long: 1.6 }, manches: '#b23a2a', tete: { type: 'bonnet', couleur: '#1d140f' } },
  };
  const emirACheval = (sc, x, dir, parent) => { const ch = sc.bete(B.chevalBlanc, { x, y: SOL, dir: dir || 1 }, parent); const e = sc.perso(C.roi, COSTUMES.emir, {}, parent); ch.monter(e); e.tenir(D.sabre(), 'A'); ch.cav = e; return ch; };
  const troupeau = (sc, xs, parent) => xs.map(([x, dir], i) => sc.bete(i % 2 ? B.zebuRoux : B.zebu, { x, y: SOL, dir, s: 0.85 }, parent));

  // =================================================================== 1 · Dori
  R.scene('Dori', 26, (sc, tl) => {
    DECORS.sahel(sc, { soleil: [1500, 200, 70] });
    const z = troupeau(sc, [[500, 1], [700, -1], [900, 1]]);
    sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    z.forEach((b, i) => tl.to(b.p, { tete: 30, duration: 1.2, yoyo: true, repeat: 5 }, 1 + i * 0.5));
    R.cartouche(tl, 8, 5, 'lieu_dori');
    R.cam(tl, sc, { x: 800, y: 640, z: 1.15 }, 9, 13);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Deux mondes
  R.scene('Deux mondes', 34, (sc, tl) => {
    const champ = DECORS.champ(sc, { vert: true });
    const z = troupeau(sc, [[-300, 1], [-500, 1], [-700, 1]]);
    const berger = sc.perso(C.filiforme, H.peul, { x: -150, y: 900 });
    berger.tenir(D.baton(200), 'R', { vertical: true });
    const cultivateurs = G.foule(sc, [[C.trapu, COSTUMES.gulmance, 1300, -1], [C.ronde, H.villageoise, 1460, -1]], 900);
    cultivateurs[0].tenir(D.houe(), 'A');
    sc.cam.x = 960; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_tension');
    G.piocher(tl, cultivateurs[0], 1, 12, 0.9);
    z.forEach((b, i) => R.marche(tl, b, 500 - i * 200, 2 + i * 0.4, 10, { pas: 12 }));
    R.marche(tl, berger, 650, 2.2, 10);
    R.cam(tl, sc, { x: 900, y: 620, z: 1.05 }, 12, 6);
    G.exprFoule(tl, [berger].concat(cultivateurs), 'serein', 13);
    G.saluer(tl, berger, 18, 2.5);
    G.saluer(tl, cultivateurs[1], 18.5, 2.5);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 3 · La dispute
  R.scene('La dispute', 36, (sc, tl) => {
    const champ = DECORS.champ(sc, { vert: true });
    const z = troupeau(sc, [[500, 1], [300, 1]]);
    const berger = sc.perso(C.filiforme, H.peul, { x: 150, y: 900 });
    const cult = sc.perso(C.trapu, COSTUMES.gulmance, { x: 1400, y: 900, dir: -1 });
    const chefG = sc.perso(C.ancien, COSTUMES.chefG, { x: 2200, y: 900, dir: -1 });
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    z.forEach((b, i) => R.marche(tl, b, 1050 - i * 200, 1 + i * 0.3, 5, { pas: 8 }));
    z.forEach((b, i) => tl.to(b.p, { tete: 40, duration: 0.6, yoyo: true, repeat: 5 }, 6.5 + i * 0.3));
    R.expr(tl, cult, 'colere', 6);
    R.marche(tl, cult, 1250, 6.5, 1.5, { pas: 3 });
    G.dialogue(tl, 8.5, [[cult, 3], [berger, 2.5], [cult, 2]]);
    R.pose(tl, cult, { bA: 160, cA: 40 }, 9, 0.3);
    R.marche(tl, berger, 950, 9, 3);
    R.expr(tl, berger, 'colere', 12);
    R.marche(tl, chefG, 1450, 12, 5);
    G.pointer(tl, chefG, 17.5, 4);
    R.parle(tl, chefG, 17.5, 3);
    R.cam(tl, sc, { x: 1150, y: 640, z: 1.2 }, 12, 4);
    // Le chef gulmancé saisit une bête : la querelle s'envenime
    R.pose(tl, chefG, { lean: 25, bA: 80 }, 22, 0.5);
    R.expr(tl, berger, 'colere', 22.5);
    tl.set(berger.p, { dir: -1 }, 24);
    R.marche(tl, berger, -300, 24.2, 5, { pas: 12, amp: 1.3 });
    R.cam(tl, sc, { x: 700, y: 620, z: 1 }, 24, 5);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 4 · Le rassemblement
  R.scene('Le rassemblement', 34, (sc, tl) => {
    DECORS.sahel(sc, { ciel: 'soir' });
    const e = emirACheval(sc, 900, -1);
    const berger = sc.perso(C.filiforme, H.peul, { x: -200, y: SOL });
    const cav = G.cavaliers(sc, [[1300, -1], [1500, -1], [1700, -1]]);
    const marabout = sc.perso(C.ancien, H.marabout, { x: 640, y: SOL });
    sc.cam.x = 1050; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'perso_chef_peul', 'droite');
    R.marche(tl, berger, 760, 1, 4, { pas: 10, amp: 1.3 });
    G.dialogue(tl, 5.5, [[berger, 3], [e.cav, 3]]);
    R.expr(tl, e.cav, 'colere', 10);
    tl.to(e.p, { cabre: 1, duration: 0.4, yoyo: true, repeat: 1 }, 12);
    R.pose(tl, e.cav, { bA: 165, cA: 10 }, 12, 0.3);
    cav.forEach((ch) => R.pose(tl, ch.cav, { bA: 165, cA: 10 }, 12.5, 0.3));
    G.exprFoule(tl, cav.map((c) => c.cav), 'colere', 12.5);
    // Prière avant le départ
    G.prier(tl, marabout, 16, 6);
    R.parle(tl, marabout, 16.5, 4);
    R.pose(tl, e.cav, { bA: 8, cA: 12, tete: -10 }, 16, 0.5);
    cav.forEach((ch) => R.pose(tl, ch.cav, { bA: 8, cA: 12, tete: -10 }, 16, 0.5));
    R.cam(tl, sc, { x: 900, y: 640, z: 1.2 }, 16, 4);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 5 · La guerre
  R.scene('La guerre', 40, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'orage' });
    const e = emirACheval(sc, -300);
    const cav = G.cavaliers(sc, [[-520, 1], [-740, 1], [-960, 1]]);
    const chefG = sc.perso(C.ancien, COSTUMES.chefG, { x: 1700, y: SOL, dir: -1 });
    const archers = [[C.trapu, 1500], [C.filiforme, 1620], [C.guerrier, 1380], [C.colosse, 1840]].map(([d, x]) => { const p = sc.perso(d, COSTUMES.gulmance, { x, y: SOL, dir: -1 }); p.tenir(D.arc(), 'R', { vertical: true }); return p; });
    const poussiere = D.particules(sc.monde, 40, 900, 860, '#c9a678', 29);
    sc.cam.x = 1000; sc.cam.y = 600; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_guerre');
    R.marche(tl, e, 800, 1.5, 4, { pas: 12, amp: 1.5 });
    G.chevaucher(tl, cav, 580, 1.8, 4, { pas: 12 });
    [[0, 4.5], [1, 5.1], [2, 5.7], [3, 6.3]].forEach(([i, t], k) => G.tirer(tl, archers[i], sc.monde, t, 700 - k * 120, 680, 0.6));
    [5, 5.8, 6.6].forEach((t, i) => R.jaillir(tl, poussiere, t, i, { n: 8, ecart: 60, haut: 90, duree: 1.2 }));
    R.marche(tl, e, 1350, 7, 2.5, { pas: 8, amp: 1.6 });
    G.chevaucher(tl, cav, 1150, 7.2, 2.5, { pas: 8 });
    R.cam(tl, sc, { x: 1300, y: 620, z: 1 }, 7, 3);
    R.secousse(tl, sc, 9.5, 14, 1);
    G.peurFoule(tl, archers, 9.6);
    archers.forEach((p, i) => { tl.set(p.p, { dir: 1 }, 11 + i * 0.2); R.marche(tl, p, 2500, 11.2 + i * 0.2, 4, { pas: 10, amp: 1.3 }); });
    // Le chef gulmancé se rend
    G.agenouiller(tl, chefG, 14);
    R.expr(tl, chefG, 'triste', 14);
    R.cam(tl, sc, { x: 1500, y: 650, z: 1.25 }, 14, 3);
    G.dialogue(tl, 18, [[e.cav, 3], [chefG, 2]]);
    G.relever(tl, chefG, 24);
    R.pose(tl, e.cav, { bA: 85, cA: 0 }, 25, 0.4);
    R.pose(tl, chefG, { bA: 85, cA: 0 }, 25.2, 0.4);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 6 · L'émirat
  R.scene('L\'émirat', 36, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#2f6c8f' });
    const emir = sc.perso(C.roi, COSTUMES.emir, { x: 960, y: COUR, assis: 1 });
    emir.tenir(D.sceptre(), 'R', { vertical: true });
    const cour = G.foule(sc, [[C.ancien, H.marabout, 700, 1], [C.guerrier, H.cavalier, 560, 1], [C.ancien, COSTUMES.chefG, 1250, -1], [C.filiforme, H.peul, 1380, -1], [C.ronde, H.villageoise, 1510, -1]], COUR);
    sc.cam.x = 960; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'lieu_emirat');
    cour.forEach((p, i) => G.incliner(tl, p, 2 + i * 0.2, 2.5, 30));
    R.parle(tl, emir, 6, 4);
    R.pose(tl, emir, { bA: 130, cA: 30 }, 6.5, 0.5);
    R.pose(tl, emir, { bA: 8, cA: 12 }, 10, 0.5);
    R.cam(tl, sc, { x: 960, y: 740, z: 1.7 }, 6, 4);
    G.prier(tl, cour[0], 12, 5);
    G.exprFoule(tl, cour, 'serein', 12);
    R.cam(tl, sc, { x: 960, y: 600, z: 0.95 }, 18, 4);
    G.applaudir(tl, cour[4], 20, 8);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 7 · Dori, capitale
  R.scene('Dori, capitale', 36, (sc, tl) => {
    DECORS.ville(sc, { mosqueeX: 1250 });
    const z = troupeau(sc, [[-300, 1], [-500, 1], [-700, 1]]);
    const marchands = G.foule(sc, [[C.ronde, H.villageoise, 560, 1], [C.vieille, null, 700, 1], [C.trapu, COSTUMES.gulmance, 1600, -1], [C.filiforme, H.peul, 1750, -1], [C.enfant, null, 1450, -1]]);
    sc.cam.x = 960; sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_dori_ville');
    z.forEach((b, i) => R.marche(tl, b, 2400 - i * 180, 2 + i * 0.4, 16, { pas: 20 }));
    G.dialogue(tl, 6, [[marchands[0], 2], [marchands[2], 2], [marchands[3], 2]]);
    G.exprFoule(tl, marchands, 'joie', 12);
    R.saut(tl, marchands[4], 13, 40);
    R.cam(tl, sc, { x: 1250, y: 480, z: 0.85 }, 14, 8);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 28, (sc, tl) => {
    DECORS.ville(sc, { ciel: 'soir', mosqueeX: 1300 });
    const gens = G.foule(sc, [[C.ancien, H.marabout, 800, 1], [C.fille, null, 980, -1], [C.enfant, null, 1090, -1]]);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_aujourdhui');
    G.dialogue(tl, 2, [[gens[0], 4]]);
    G.exprFoule(tl, gens.slice(1), 'serein', 4);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 7, 6);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
