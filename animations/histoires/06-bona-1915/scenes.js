/*
 * 06 · Le prédicateur de Datomon et l'insurrection de Bona — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;

  const COSTUMES = {
    jeune: { haut: { type: 'tunique', couleur: '#e8dcc0', motif: 'chevrons', motifCouleur: '#8a5a2b' }, bas: { type: 'short', couleur: '#5a4a3a' }, tete: null },
    mere: { haut: { type: 'camisole', couleur: '#2f6c8f' }, bas: { type: 'jupe', couleur: '#e9c46a', motif: 'points', motifCouleur: '#2f4a7a' }, tete: { type: 'foulard', couleur: '#2f6c8f' } },
  };

  // =================================================================== 1 · Datomon
  R.scene('Datomon', 26, (sc, tl) => {
    DECORS.ville(sc, { soleil: [250, 160, 60], mosqueeX: 1100 });
    const passants = G.foule(sc, [[C.ronde, COSTUMES.mere, -200, 1], [C.trapu, H.villageois, 2200, -1], [C.enfant, null, -380, 1]]);
    G.surLaTete(passants[0], D.canari(null, 0, 0, 0.5));
    sc.cam.y = 520; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 280);
    R.marche(tl, passants[0], 2300, 1, 18, { pas: 26 });
    R.marche(tl, passants[2], 2100, 1.5, 17, { pas: 34 });
    R.marche(tl, passants[1], -300, 2, 18, { pas: 26 });
    R.cartouche(tl, 8, 5, 'lieu_datomon');
    R.cam(tl, sc, { x: 1100, y: 450, z: 1.05 }, 8, 10);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Le prédicateur
  R.scene('Le prédicateur', 40, (sc, tl) => {
    DECORS.ville(sc, { mosqueeX: 1100 });
    const pred = sc.perso(C.ancien, H.marabout, { x: 1100, y: SOL, dir: -1 });
    pred.tenir(D.baton(210), 'R', { vertical: true });
    const foule = G.foule(sc, [
      [C.trapu, H.villageois, 560, 1], [C.ronde, COSTUMES.mere, 680, 1], [C.filiforme, COSTUMES.jeune, 440, 1],
      [C.elancee, H.villageoise, 790, 1], [C.enfant, null, 880, 1], [C.vieille, null, 320, 1], [C.colosse, H.forgeron, 200, 1],
    ]);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'perso_predicateur', 'droite');
    R.parle(tl, pred, 2, 30);
    R.expr(tl, pred, 'serein', 2);
    // Ses gestes : le ciel, puis la foule, puis l'horizon
    G.prier(tl, pred, 3, 4);
    G.pointer(tl, pred, 9, 3);
    R.pose(tl, pred, { bA: 140, cA: 60 }, 13, 0.5);
    tl.to(pred.p, { cA: 20, duration: 0.3, yoyo: true, repeat: 7 }, 13.5);
    R.pose(tl, pred, { bA: 8, cA: 12 }, 16, 0.5);
    G.exprFoule(tl, foule, 'surprise', 4);
    R.cam(tl, sc, { x: 1050, y: 560, z: 1.4 }, 4, 6);
    R.cam(tl, sc, { x: 650, y: 640, z: 1.3 }, 12, 5);
    G.exprFoule(tl, foule, 'joie', 14);
    // Une lumière à l'horizon : l'espoir annoncé
    const aube = D.lumiere(sc.monde, 1900, 500, 40, '#ffe7a3'); aube.setAttribute('opacity', 0);
    tl.to(aube, { opacity: 0.9, scale: 1.8, transformOrigin: '50% 50%', duration: 4 }, 18);
    R.cam(tl, sc, { x: 1200, y: 560, z: 0.9 }, 18, 5);
    G.pointer(tl, pred, 18.5, 5, 0.4);
    foule.forEach((p, i) => R.pose(tl, p, { tete: 10, regard: 1 }, 19 + i * 0.1, 0.5));
    foule.slice(0, 4).forEach((p, i) => R.pose(tl, p, { bA: 160, cA: 20 }, 24 + i * 0.2, 0.4));
    R.parle(tl, foule[0], 25, 3); R.parle(tl, foule[2], 25.4, 3);
    tl.to(aube, { opacity: 0, duration: 3 }, 28);
    R.cam(tl, sc, { x: 900, y: 600, z: 1.05 }, 28, 4);
    G.calmeFoule(tl, foule, 33, 'serein');
    G.incliner(tl, pred, 34, 2, 20);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 3 · Le recrutement
  R.scene('Le recrutement', 38, (sc, tl) => {
    DECORS.village(sc, {});
    const cmd = sc.perso(C.europeen, null, { x: 2200, y: SOL, dir: -1 });
    const gardes = G.gardes(sc, [[2350, -1], [2480, -1]]);
    const jeunes = G.foule(sc, [[C.filiforme, COSTUMES.jeune, 760, 1], [C.trapu, H.villageois, 640, 1], [C.guerrier, H.guerrier, 880, 1]]);
    const meres = G.foule(sc, [[C.ronde, COSTUMES.mere, 420, 1], [C.vieille, null, 300, 1], [C.elancee, H.villageoise, 160, 1]]);
    const chef = sc.perso(C.roi, H.notable, { x: 1000, y: SOL });
    sc.cam.x = 900; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5.5, 'lieu_recrutement');
    R.marche(tl, cmd, 1380, 1, 5);
    gardes.forEach((g, i) => R.marche(tl, g, 1560 + i * 130, 1.3, 5));
    G.dialogue(tl, 6.5, [[cmd, 3], [chef, 2.5], [cmd, 2.5]]);
    G.pointer(tl, cmd, 9, 2);
    R.expr(tl, chef, 'colere', 10);
    R.cam(tl, sc, { x: 1150, y: 620, z: 1.3 }, 6, 3);
    // Les gardes emmènent les jeunes hommes
    gardes.forEach((g, i) => { tl.set(g.p, { dir: -1 }, 15); R.marche(tl, g, 940 - i * 80, 15.2, 2.5); });
    G.peurFoule(tl, jeunes.concat(meres), 16);
    R.cam(tl, sc, { x: 760, y: 620, z: 1.1 }, 15, 3);
    G.frapper(tl, gardes[0], jeunes[2], 18);
    jeunes.forEach((p, i) => { tl.set(p.p, { dir: 1 }, 20.5); R.expr(tl, p, 'triste', 20.5); R.marche(tl, p, 2300 + i * 130, 21 + i * 0.3, 9, { pas: 12 }); });
    gardes.forEach((g, i) => { tl.set(g.p, { dir: 1 }, 21); R.marche(tl, g, 2500 + i * 120, 21.5 + i * 0.2, 9, { pas: 12 }); });
    tl.set(cmd.p, { dir: 1 }, 21); R.marche(tl, cmd, 2600, 22, 8);
    meres.forEach((p, i) => G.pleurer(tl, p, 22 + i * 0.4, 7));
    G.saluer(tl, meres[0], 30, 2);
    R.cam(tl, sc, { x: 600, y: 660, z: 1.4 }, 24, 6);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 4 · Le serment de Bona
  R.scene('Le serment de Bona', 36, (sc, tl) => {
    DECORS.village(sc, { ciel: 'nuit', nuit: true });
    const autel = D.autel(sc.monde, 960, SOL + 6, 1.1);
    const torches = [720, 1200].map((x) => { const t = D.torche(); sc.monde.appendChild(t); gsap.set(t, { x, y: SOL - 30 }); G.flamber(tl, t, 0, 36); return t; });
    const anciens = G.foule(sc, [[C.roi, H.notable, 620, 1], [C.ancien, null, 500, 1], [C.ancien, H.marabout, 1320, -1], [C.trapu, H.villageois, 1440, -1]]);
    const jeunes = G.foule(sc, [[C.guerrier, H.guerrier, 360, 1], [C.colosse, H.forgeron, 1580, -1], [C.filiforme, COSTUMES.jeune, 240, 1]]);
    const tambour = D.tambour(sc.monde, 1760, SOL + 2, 1.1);
    const batteur = sc.perso(C.trapu, H.villageois, { x: 1700, y: SOL });
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_bona');
    G.dialogue(tl, 2, [[anciens[0], 3], [anciens[2], 3], [anciens[1], 2.5]]);
    R.cam(tl, sc, { x: 960, y: 700, z: 1.6 }, 6, 4);
    // Ils posent la main au-dessus de l'autel : serment
    [anciens[0], anciens[1]].forEach((p, i) => { R.marche(tl, p, 800 + i * -40, 12 + i * 0.2, 1.5, { pas: 2 }); R.pose(tl, p, { bA: 80, cA: 0, lean: 18 }, 13.8, 0.6); });
    [anciens[2], anciens[3]].forEach((p, i) => { R.marche(tl, p, 1120 + i * 40, 12.2 + i * 0.2, 1.5, { pas: 2 }); R.pose(tl, p, { bA: 80, cA: 0, lean: 18 }, 14, 0.6); });
    const eclat = D.lumiere(sc.monde, 960, 790, 12, '#ffd166'); eclat.setAttribute('opacity', 0);
    tl.fromTo(eclat, { opacity: 0.9, scale: 1, transformOrigin: '50% 50%' }, { opacity: 0, scale: 4, duration: 1.2, immediateRender: false }, 15.5);
    G.exprFoule(tl, anciens.concat(jeunes), 'colere', 16);
    anciens.forEach((p) => R.pose(tl, p, { lean: (p.def.pose && p.def.pose.lean) || 0, bA: 8, cA: 12 }, 18, 0.5));
    R.cam(tl, sc, { x: 1300, y: 620, z: 1.15 }, 18, 3);
    // Les tambours de guerre
    for (let i = 0; i < 40; i++) tl.to(batteur.p, { bA: i % 2 ? 60 : 110, bR: i % 2 ? 110 : 60, cA: 40, cR: 40, duration: 0.15 }, 19 + i * 0.17);
    jeunes.forEach((p, i) => R.pose(tl, p, { bA: 165, cA: 50 }, 20 + i * 0.3, 0.4));
    R.secousse(tl, sc, 22, 5, 3);
    R.cam(tl, sc, { x: 960, y: 580, z: 0.95 }, 26, 4);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 5 · L'insurrection
  R.scene('L\'insurrection', 45, (sc, tl) => {
    DECORS.village(sc, { ciel: 'chaud' });
    // Muret de défense en banco devant le village
    const muret = D.muret(sc.monde, 300, 760, SOL, 70, '#a8603a');
    const defenseurs = G.foule(sc, [[C.guerrier, H.guerrier, 520, 1], [C.colosse, H.forgeron, 640, 1], [C.filiforme, COSTUMES.jeune, 400, 1], [C.trapu, H.villageois, 280, 1]]);
    defenseurs.forEach((p, i) => p.tenir(i === 1 ? D.lance(220) : D.arc(), i === 1 ? 'A' : 'R', { vertical: true }));
    const devant = sc.calque();
    D.muret(devant, 300, 760, SOL + 10, 60, '#b9713d');
    const gardes = G.gardes(sc, [[2300, -1], [2420, -1], [2540, -1], [2660, -1]]);
    const cmd = sc.perso(C.europeen, null, { x: 2800, y: SOL, dir: -1 });
    sc.cam.x = 1100; sc.cam.y = 600; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 5.5, 'lieu_insurrection');
    gardes.forEach((g, i) => R.marche(tl, g, 1300 + i * 120, 1 + i * 0.2, 7));
    R.marche(tl, cmd, 1800, 1.5, 7);
    G.exprFoule(tl, defenseurs, 'colere', 3);
    R.cam(tl, sc, { x: 1000, y: 620, z: 1 }, 6, 3);
    G.pointer(tl, cmd, 9, 1.5);
    gardes.forEach((g, i) => G.epauler(tl, g, 10 + i * 0.1, 8));
    // Flèches et coups de feu
    [[2, 11], [0, 11.6], [3, 12.3], [2, 14.2], [0, 15]].forEach(([i, t], k) => G.tirer(tl, defenseurs[i], sc.monde, t, 1320 + k * 110, 640 + (k % 2) * 40, 0.55));
    [11.8, 12.6, 13.4, 14.8].forEach((t, k) => G.tir(tl, sc.monde, 1240 + k * 120, 700, t));
    R.secousse(tl, sc, 11.8, 8, 0.3);
    R.expr(tl, gardes[1], 'douleur', 12.5);
    G.tomber(tl, gardes[1], 12.6, 1, 3);
    R.cam(tl, sc, { x: 900, y: 620, z: 1.1 }, 12, 3);
    // Les défenseurs franchissent le muret ; la colonne recule
    defenseurs.forEach((p, i) => R.marche(tl, p, 1000 + i * 90, 18 + i * 0.25, 2.5, { pas: 6, amp: 1.2 }));
    G.peurFoule(tl, gardes.concat([cmd]), 19);
    gardes.forEach((g, i) => { tl.set(g.p, { dir: 1 }, 21 + i * 0.15); R.marche(tl, g, 2600 + i * 120, 21.2 + i * 0.15, 6, { pas: 14, amp: 1.2 }); });
    tl.set(cmd.p, { dir: 1 }, 21); R.marche(tl, cmd, 2800, 21.2, 5, { pas: 12, amp: 1.2 });
    R.cam(tl, sc, { x: 1300, y: 600, z: 0.95 }, 20, 5);
    G.exprFoule(tl, defenseurs, 'joie', 27);
    defenseurs.forEach((p, i) => R.pose(tl, p, { bA: 165, cA: 30 }, 27.5 + i * 0.15, 0.4));
    const villageois = G.foule(sc, [[C.ronde, COSTUMES.mere, -200, 1], [C.vieille, null, -340, 1], [C.enfant, null, -460, 1]]);
    villageois.forEach((p, i) => R.marche(tl, p, 700 + i * 90, 28 + i * 0.3, 5));
    G.danseFoule(tl, defenseurs.concat(villageois), 34, 8);
    R.cam(tl, sc, { x: 960, y: 580, z: 0.95 }, 30, 5);
    R.fonduSortie(tl, 43.5, 1.5);
  });

  // =================================================================== 6 · Le soulèvement s'étend
  R.scene('Le soulèvement s\'étend', 30, (sc, tl) => {
    const fond = sc.calque();
    D.ciel(fond, '#3b3f7a', '#e8875a');
    D.collines(fond, 760, '#5a3a3a', 7, 60);
    D.sol(fond, 880, '#8a5a3a');
    const lueurs = G.villagesAuLoin(fond, 7, '#6a3a26');
    const cavaliers = [0, 1].map((i) => {
      const ch = sc.bete(B.cheval, { x: -300 - i * 400, y: SOL + i * 20, s: 0.9 - i * 0.1 });
      ch.monter(sc.perso(C.guerrier, H.guerrier, {}));
      return ch;
    });
    sc.cam.x = 960; sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'lieu_extension');
    cavaliers.forEach((ch, i) => R.marche(tl, ch, 2500, 1 + i * 2, 12, { pas: 34, amp: 1.4 }));
    lueurs.forEach((l, i) => { tl.to(l, { opacity: 0.85, duration: 0.8 }, 3 + i * 1.6); tl.to(l, { opacity: 0.5, duration: 0.4, yoyo: true, repeat: 9 }, 3.8 + i * 1.6); });
    R.cam(tl, sc, { x: 1300, z: 1.05 }, 2, 16);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 7 · La répression
  R.scene('La répression', 30, (sc, tl) => {
    DECORS.village(sc, { ciel: 'orage' });
    const voile = R.el('rect', { x: -1000, y: -2000, width: 3920, height: 4000, fill: '#2a2030', opacity: 0.35 }, sc.monde);
    const fumees = [300, 700, 1500, 1900].map((x) => D.fumee(sc.monde, x, 760, 14));
    const survivants = G.foule(sc, [[C.vieille, null, 860, 1], [C.enfant, null, 960, -1], [C.ronde, COSTUMES.mere, 1060, -1]]);
    sc.cam.x = 960; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 6, 'lieu_repression');
    fumees.forEach((f, i) => [1, 3, 5, 7, 9, 11, 13].forEach((t, k) => R.jaillir(tl, f, t + i * 0.5, k, { n: 5, ecart: 22, haut: 180, duree: 2.6 })));
    G.exprFoule(tl, survivants, 'triste', 1);
    G.pleurer(tl, survivants[2], 6, 6);
    R.pose(tl, survivants[0], { bA: 70, cA: 80 }, 8, 0.6);
    R.cam(tl, sc, { x: 960, y: 680, z: 1.5 }, 6, 10);
    R.pose(tl, survivants[0], { tete: 25 }, 17, 1);
    R.fonduSortie(tl, 27.5, 2.5);
  });

  // =================================================================== 8 · Mémoire
  R.scene('Mémoire', 30, (sc, tl) => {
    DECORS.ville(sc, { ciel: 'soir', mosqueeX: 1100 });
    const ancien = sc.perso(C.ancien, H.marabout, { x: 800, y: SOL });
    const enfants = G.foule(sc, [[C.enfant, null, 980, -1], [C.fille, null, 1090, -1], [C.enfant, { haut: { type: 'tunique', couleur: '#5b8c5a' }, bas: { type: 'short', couleur: '#e8dcc0' } }, 1200, -1]]);
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_memoire');
    G.dialogue(tl, 2, [[ancien, 3.5], [enfants[1], 1.5], [ancien, 3]]);
    G.pointer(tl, ancien, 5, 2, 0.5);
    G.exprFoule(tl, enfants, 'serein', 9);
    R.cam(tl, sc, { z: 0.95, y: 520 }, 10, 5);
    R.fonduSortie(tl, 15.5, 1.5);
    R.titre(tl, 17, 4, 'fin');
    R.generique(tl, 21.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
