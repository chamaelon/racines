/*
 * 08 · Téné et le balafon des génies — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;

  const COSTUMES = {
    tene: { haut: { type: 'camisole', couleur: '#e9c46a' }, bas: { type: 'jupe', couleur: '#7a2a5a', motif: 'chevrons', motifCouleur: '#f4e3b5' }, collier: '#c8553d', tete: null },
    zie: { haut: { type: 'boubou', couleur: '#c9b48a', motif: 'chevrons', motifCouleur: '#3a2a1a', long: 1.5 }, manches: '#c9b48a', tete: { type: 'bonnet', couleur: '#3a2a1a' } },
    mere: { haut: { type: 'camisole', couleur: '#2f6c8f' }, bas: { type: 'jupe', couleur: '#e8dcc0', motif: 'points', motifCouleur: '#2f4a7a' }, tete: { type: 'foulard', couleur: '#2f6c8f' } },
  };
  /** Chasse-mouche du maître dozo (queue de cheval montée sur manche). */
  const chasseMouche = () => { const g = R.el('g', {}); R.el('line', { x1: 0, y1: -10, x2: 0, y2: 40, stroke: '#5a3a20', 'stroke-width': 6 }, g); R.el('path', { d: 'M0,40 q-14,40 -6,80 M0,40 q4,44 6,84 M0,40 q14,38 12,78', stroke: '#efe6cf', 'stroke-width': 5, fill: 'none' }, g); return g; };
  /** Joueur assis derrière son balafon (instrument à x + 95). */
  function joueur(sc, def, cos, x, parent, pose) {
    const bal = D.balafon(parent || sc.monde, x + 95, SOL + 4, 0.9);
    const p = sc.perso(def, cos, Object.assign({ x, y: SOL, assis: 1 }, pose || {}), parent);
    p.tenir(D.baguette(), 'A'); p.tenir(D.baguette(), 'R');
    return { p, bal };
  }
  const dozos = (sc, x, parent) => {
    const maitre = sc.perso(C.guerrier, H.chasseur, { x, y: SOL }, parent);
    maitre.tenir(chasseMouche(), 'A', { vertical: true });
    maitre.tenir(G.fusilHaut(), 'R', { vertical: true });
    const second = sc.perso(C.filiforme, H.chasseur, { x: x - 150, y: SOL }, parent);
    second.tenir(D.arc(), 'R', { vertical: true });
    return [maitre, second];
  };

  // =================================================================== 1 · Le balafon du village
  R.scene('Le balafon du village', 28, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir' });
    const feu = D.feu(sc.monde, 1250, SOL + 2, 0.9); G.flamber(tl, feu, 0, 28);
    const zie = joueur(sc, C.ancien, COSTUMES.zie, 700);
    const tene = sc.perso(C.elancee, COSTUMES.tene, { x: 1050, y: SOL, dir: -1 });
    const public_ = G.foule(sc, [[C.enfant, null, 1400, -1], [C.ronde, COSTUMES.mere, 1520, -1], [C.trapu, H.villageois, 1640, -1]]);
    sc.cam.x = 960; sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    G.balafon(tl, zie.p, 1, 26, zie.bal);
    G.notes(tl, sc.monde, 810, 740, 1, 26);
    R.cartouche(tl, 7.5, 4.5, 'perso_balafoniste');
    R.expr(tl, tene, 'joie', 2);
    R.danse(tl, tene, 8, 9, { y: SOL, tempo: 0.5, saut: 12 });
    R.cartouche(tl, 12.5, 5, 'perso_tene', 'droite');
    R.cam(tl, sc, { x: 900, y: 640, z: 1.3 }, 8, 6);
    G.applaudir(tl, public_[1], 9, 7);
    R.saut(tl, public_[0], 10, 40); R.saut(tl, public_[0], 11, 40);
    R.cam(tl, sc, { x: 1100, y: 560, z: 0.95 }, 18, 5);
    R.fonduSortie(tl, 26.5, 1.5);
  });

  // =================================================================== 2 · L'appel de la brousse
  R.scene('L\'appel de la brousse', 34, (sc, tl) => {
    DECORS.cour(sc, { ciel: 'nuit', etoiles: true, grenierX: 1580 });
    R.el('rect', { x: 700, y: 892, width: 240, height: 12, rx: 4, fill: '#d9b26a' }, sc.monde);
    const tene = sc.perso(C.elancee, COSTUMES.tene, Object.assign({ x: 920, y: 885, rot: -90 }, R.EXPRESSIONS.sommeil));
    const nuit = R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#0b1030', opacity: 0.4 }, sc.monde);
    sc.monde.appendChild(tene.root);
    sc.cam.x = 900; sc.cam.y = 700; sc.cam.z = 1.4;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_nuit');
    G.notes(tl, sc.monde, 1900, 700, 2, 30, '#c8f0ff');
    tl.to(tene.p, { yeux: 0, sourcilsH: 0.6, duration: 0.5 }, 5);
    tl.to(tene.p, { rot: 0, x: 840, y: 900, duration: 1.2, ease: 'power2.out' }, 7);
    R.pose(tl, tene, { tete: 10, regard: 1 }, 8.5, 0.5);
    R.expr(tl, tene, 'surprise', 8.5);
    R.cam(tl, sc, { x: 1100, y: 640, z: 1.1 }, 9, 3);
    R.marche(tl, tene, 1150, 12, 3, { pas: 4 });
    R.expr(tl, tene, 'serein', 13);
    R.pose(tl, tene, { yeux: 0.4 }, 14, 0.5);
    R.marche(tl, tene, 2300, 16, 8, { pas: 10 });
    R.cam(tl, sc, { x: 1500 }, 16, 8);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 3 · Les génies
  R.scene('Les génies', 42, (sc, tl) => {
    DECORS.bois(sc, { ciel: 'nuit' });
    const lune = R.el('circle', { cx: 960, cy: 600, r: 260, fill: '#c8f0ff', opacity: 0.08, filter: 'url(#flou-fort)' }, sc.monde);
    const musicien = joueur(sc, C.genie, null, 820, sc.monde, { s: 1.1 });
    const danseurs = G.foule(sc, [[C.genie, { bas: { type: 'herbes', couleur: '#6f8f45' }, bracelets: '#e6dcc0' }, 1150, -1, 1.05], [C.genie, null, 1350, -1, 0.95]]);
    const tene = sc.perso(C.elancee, COSTUMES.tene, { x: -200, y: SOL, yeux: 0.4, sourire: 0.6 });
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1.5);
    G.balafon(tl, musicien.p, 0.5, 40, musicien.bal);
    G.notes(tl, sc.monde, 930, 740, 0.5, 40, '#c8f0ff');
    G.danseFoule(tl, danseurs, 1, 10);
    R.cartouche(tl, 2, 5, 'perso_genies', 'droite');
    R.marche(tl, tene, 560, 3, 6, { pas: 8 });
    R.cam(tl, sc, { x: 760, y: 640, z: 1.3 }, 7, 3);
    R.expr(tl, tene, 'surprise', 9);
    tl.to(danseurs.map((d) => d.p), { dir: -1, duration: 0.01 }, 11.5);
    G.exprFoule(tl, danseurs.concat([musicien.p]), 'rire', 12);
    R.marche(tl, danseurs[0], 720, 12.5, 2, { pas: 5 });
    R.pose(tl, danseurs[0], { bA: 90, cA: 0 }, 14.5, 0.4);
    R.expr(tl, tene, 'serein', 15);
    R.pose(tl, tene, { yeux: 0.6 }, 15, 0.6);
    // Téné danse, envoûtée ; les génies tournent autour d'elle
    R.danse(tl, tene, 16, 18, { y: SOL, tempo: 0.42, saut: 14 });
    R.cam(tl, sc, { x: 900, y: 600, z: 1.05 }, 16, 4);
    danseurs.forEach((d, i) => {
      for (let k = 0; k < 4; k++) {
        tl.to(d.p, { x: k % 2 ? 900 + i * 60 : 420 - i * 60, duration: 2, ease: 'sine.inOut' }, 16 + k * 2 + i * 0.4);
        tl.set(d.p, { dir: k % 2 ? -1 : 1 }, 18 + k * 2 + i * 0.4);
      }
    });
    tl.to(tene.p, { lueur: 0, alpha: 0.75, duration: 6 }, 28);
    R.cam(tl, sc, { x: 700, y: 640, z: 1.6 }, 30, 6);
    R.fonduSortie(tl, 40.5, 1.5);
  });

  // =================================================================== 4 · L'absence
  R.scene('L\'absence', 30, (sc, tl) => {
    DECORS.cour(sc, { grenierX: 1580, ciel: 'soir' });
    R.el('rect', { x: 700, y: 892, width: 240, height: 12, rx: 4, fill: '#d9b26a' }, sc.monde);
    const mere = sc.perso(C.ronde, COSTUMES.mere, { x: 400, y: 900 });
    const pere = sc.perso(C.trapu, H.villageois, { x: -200, y: 900 });
    const zie = sc.perso(C.ancien, COSTUMES.zie, { x: 2200, y: 900, dir: -1 });
    sc.cam.x = 860; sc.cam.y = 650; sc.cam.z = 1.25;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 4, 'lieu_matin');
    R.marche(tl, mere, 640, 1, 2.5);
    R.pose(tl, mere, { lean: 30, tete: 10 }, 3.6, 0.6);
    R.expr(tl, mere, 'surprise', 4.2);
    R.pose(tl, mere, { lean: 0, tete: 0, bA: 70, cA: 120, bR: 70, cR: 120 }, 5, 0.5);
    R.expr(tl, mere, 'peur', 5);
    R.parle(tl, mere, 5.5, 4);
    R.marche(tl, pere, 450, 6, 3);
    R.expr(tl, pere, 'peur', 8);
    R.marche(tl, zie, 1000, 7, 5);
    G.dialogue(tl, 12, [[pere, 2.5], [zie, 3], [mere, 2]]);
    G.pointer(tl, zie, 14, 3, 0.2);
    R.cam(tl, sc, { x: 760, y: 620, z: 1.05 }, 12, 4);
    tl.set(pere.p, { dir: 1 }, 21.5);
    R.marche(tl, pere, 2300, 21.7, 6, { pas: 12, amp: 1.2 });
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 5 · Les chasseurs dozo
  R.scene('Les chasseurs dozo', 36, (sc, tl) => {
    DECORS.village(sc, {});
    const [maitre, second] = dozos(sc, 1150);
    const chien = sc.bete(B.chien, { x: 1300, y: SOL, s: 1.1 });
    const pere = sc.perso(C.trapu, H.villageois, { x: -200, y: SOL });
    sc.cam.x = 1000; sc.cam.y = 600; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 5, 'perso_dozo', 'droite');
    R.marche(tl, pere, 800, 1, 4, { pas: 9, amp: 1.2 });
    G.incliner(tl, pere, 5.2, 1.5, 30);
    G.dialogue(tl, 7, [[pere, 3], [maitre, 2.5]]);
    tl.set([maitre.p, second.p], { dir: -1 }, 6.5);
    R.expr(tl, maitre, 'serein', 8);
    // Préparation : le maître consulte ses amulettes, lève le chasse-mouche
    R.cam(tl, sc, { x: 1100, y: 640, z: 1.5 }, 13, 3);
    R.pose(tl, maitre, { bA: 70, cA: 110, tete: -12 }, 13.5, 0.6);
    const lueur = D.lumiere(sc.monde, 1110, 690, 10, '#fff1a8'); lueur.setAttribute('opacity', 0);
    tl.to(lueur, { opacity: 1, scale: 2, transformOrigin: '50% 50%', duration: 1, yoyo: true, repeat: 1 }, 14.5);
    G.prier(tl, maitre, 17, 2.5);
    tl.to(chien.p, { queue: 30, duration: 0.2, yoyo: true, repeat: 9 }, 16);
    R.saut(tl, chien, 18, 30);
    // Départ
    R.cam(tl, sc, { x: 1300, y: 580, z: 0.95 }, 21, 4);
    tl.set([maitre.p, second.p], { dir: 1 }, 22);
    R.marche(tl, chien, 2600, 22, 8, { pas: 20 });
    R.marche(tl, maitre, 2500, 22.4, 9);
    R.marche(tl, second, 2350, 22.8, 9);
    G.saluer(tl, pere, 24, 3);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 6 · La traque
  R.scene('La traque', 35, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'nuit', nuit: true });
    const [maitre, second] = dozos(sc, -200);
    const chien = sc.bete(B.chien, { x: -50, y: SOL, s: 1.1 });
    sc.cam.x = 700; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1.5);
    R.marche(tl, chien, 700, 1, 5, { pas: 12 });
    tl.to(chien.p, { tete: 45, duration: 0.5 }, 6);
    tl.to(chien.p, { tete: 35, duration: 0.2, yoyo: true, repeat: 7 }, 6.5);
    R.marche(tl, maitre, 500, 1.5, 5.5);
    R.marche(tl, second, 330, 1.8, 5.5);
    R.cam(tl, sc, { x: 760, y: 720, z: 1.8 }, 6, 2);
    R.pose(tl, maitre, { lean: 30, tete: 15 }, 8, 0.6);
    R.pose(tl, maitre, { lean: 0, tete: 0 }, 10, 0.6);
    R.cam(tl, sc, { x: 900, y: 620, z: 1.1 }, 10, 2);
    // La musique, au loin
    G.notes(tl, sc.monde, 1900, 700, 11, 22, '#c8f0ff');
    R.expr(tl, second, 'surprise', 12);
    G.pointer(tl, second, 12.5, 2);
    tl.to(chien.p, { tete: -20, gueule: 1, duration: 0.2, yoyo: true, repeat: 5 }, 12.5);
    G.pointer(tl, maitre, 15, 1.5);
    R.marche(tl, chien, 2400, 18, 8, { pas: 20 });
    R.marche(tl, maitre, 2200, 18.3, 10);
    R.marche(tl, second, 2050, 18.6, 10);
    R.cam(tl, sc, { x: 1500, y: 580, z: 0.95 }, 18, 10);
    R.fonduSortie(tl, 33.5, 1.5);
  });

  // =================================================================== 7 · La délivrance
  R.scene('La délivrance', 45, (sc, tl) => {
    const bois = DECORS.bois(sc, { ciel: 'nuit' });
    const musicien = joueur(sc, C.genie, null, 820, sc.monde, { s: 1.1 });
    const danseurs = G.foule(sc, [[C.genie, { bas: { type: 'herbes', couleur: '#6f8f45' }, bracelets: '#e6dcc0' }, 1000, -1, 1.05], [C.genie, null, 1180, -1, 0.95]]);
    const tene = sc.perso(C.elancee, COSTUMES.tene, { x: 560, y: SOL, yeux: 0.6, sourire: 0.5, alpha: 0.8 });
    const [maitre, second] = dozos(sc, -250);
    const chien = sc.bete(B.chien, { x: -100, y: SOL, s: 1.1 });
    sc.cam.x = 760; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    G.balafon(tl, musicien.p, 0.3, 9, musicien.bal);
    R.danse(tl, tene, 0.3, 8, { y: SOL, tempo: 0.5, saut: 8 });
    G.danseFoule(tl, danseurs, 0.3, 8);
    R.marche(tl, maitre, 260, 2, 4);
    R.marche(tl, second, 120, 2.3, 4);
    R.marche(tl, chien, 380, 2, 3.5, { pas: 8 });
    tl.to(chien.p, { gueule: 1, duration: 0.15, yoyo: true, repeat: 9 }, 6);
    // Le maître dozo lève son chasse-mouche : un éclair, tout s'arrête
    R.pose(tl, maitre, { bA: 170, cA: 0 }, 9, 0.4);
    R.eclairBlanc(tl, 9.5, 0.8);
    R.secousse(tl, sc, 9.5, 10, 0.5);
    G.exprFoule(tl, danseurs.concat([musicien.p]), 'peur', 9.6, 0);
    tl.to([tene.p], { alpha: 1, yeux: 0, duration: 0.5 }, 9.8);
    R.expr(tl, tene, 'surprise', 10);
    R.cam(tl, sc, { x: 800, y: 640, z: 1.25 }, 10, 2);
    // Le chef des génies discute, puis cède
    R.pose(tl, musicien.p, { assis: 0 }, 13, 0.6);
    G.dialogue(tl, 14, [[musicien.p, 3], [maitre, 2.5], [musicien.p, 2.5]]);
    R.expr(tl, musicien.p, 'triste', 20);
    G.incliner(tl, musicien.p, 21, 2, 30);
    tl.set(tene.p, { dir: -1 }, 21);
    R.marche(tl, tene, 380, 21.2, 1.8, { pas: 3 });
    R.expr(tl, tene, 'joie', 23);
    R.pose(tl, second, { bA: 70, cA: 60 }, 23, 0.5);
    // Avant de partir, il montre le balafon à Téné : il est pour elle
    tl.set(tene.p, { dir: 1 }, 24.5);
    G.pointer(tl, musicien.p, 24.8, 3);
    R.parle(tl, musicien.p, 25, 2.5);
    R.expr(tl, tene, 'surprise', 26);
    R.expr(tl, musicien.p, 'joie', 27.5);
    [musicien.p].concat(danseurs).forEach((g, i) => G.apparition(tl, sc.monde, g, 30 + i * 0.4, '#c8f0ff', false));
    R.cam(tl, sc, { x: 900, y: 620, z: 1.05 }, 30, 3);
    R.marche(tl, tene, 820, 33, 2, { pas: 3 });
    R.pose(tl, tene, { lean: 30, bA: 60 }, 35.2, 0.6);
    R.expr(tl, tene, 'joie', 35.5);
    R.expr(tl, maitre, 'joie', 36);
    G.incliner(tl, tene, 38, 2, 30);
    R.fonduSortie(tl, 43.5, 1.5);
  });

  // =================================================================== 8 · La fête
  R.scene('La fête', 30, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir' });
    const feu = D.feu(sc.monde, 1280, SOL + 2, 1); G.flamber(tl, feu, 0, 30);
    const tene = joueur(sc, C.elancee, COSTUMES.tene, 700);
    const [maitre, second] = dozos(sc, 1550);
    const gens = G.foule(sc, [[C.ancien, COSTUMES.zie, 1050, -1], [C.ronde, COSTUMES.mere, 1180, -1], [C.trapu, H.villageois, 1420, -1], [C.enfant, null, 950, -1]]);
    sc.cam.x = 1000; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 4.5, 'lieu_fete');
    R.expr(tl, tene.p, 'joie', 0.5);
    G.balafon(tl, tene.p, 0.5, 15, tene.bal);
    G.notes(tl, sc.monde, 810, 740, 0.5, 15);
    G.danseFoule(tl, gens.concat([maitre, second]), 2, 12);
    G.exprFoule(tl, gens, 'rire', 2);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.2 }, 3, 10);
    R.fonduSortie(tl, 15, 1.5);
    R.titre(tl, 16.5, 4, 'fin');
    R.generique(tl, 21, 9, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
