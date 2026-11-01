/*
 * 14 · Le gyil des génies — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;
  const { montrer, cacher, objet } = R;

  const BAYUO = [C.trapu, Object.assign({}, H.chasseur, { haut: { type: 'tunique', couleur: '#8a6a3a', motif: 'amulettes', motifCouleur: '#4d2c14' } })];
  const bayuo = (sc, pose, parent) => sc.perso(BAYUO[0], BAYUO[1], Object.assign({ y: SOL }, pose), parent);
  /** Joueur de gyil assis derrière son instrument (à x + 95). */
  function joueur(sc, def, cos, x, parent, pose) {
    const bal = D.balafon(parent || sc.monde, x + 95, SOL + 4, 0.9);
    const p = sc.perso(def, cos, Object.assign({ x, y: SOL, assis: 1 }, pose || {}), parent);
    p.tenir(D.baguette(), 'A'); p.tenir(D.baguette(), 'R');
    return { p, bal };
  }
  const genies = (sc, xs, parent) => xs.map((x, i) => sc.perso(C.genie, i % 2 ? { bas: { type: 'herbes', couleur: '#6f8f45' }, bracelets: '#e6dcc0' } : null, { x, y: SOL, dir: -1, s: 1 - (i % 3) * 0.06 }, parent));

  // =================================================================== 1 · Le silence
  R.scene('Un village sans musique', 28, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir' });
    const feu = D.feu(sc.monde, 960, SOL + 2, 1); G.flamber(tl, feu, 0, 28);
    const gens = G.foule(sc, [[C.ancien, null, 700, 1, 1, { assis: 1 }], [C.ronde, H.villageoise, 560, 1], [C.enfant, null, 1180, -1], [C.fille, null, 1300, -1], [C.colosse, H.forgeron, 1440, -1]]);
    sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    R.cartouche(tl, 7.5, 5.5, 'lieu_silence');
    G.exprFoule(tl, gens, 'triste', 7);
    G.applaudir(tl, gens[1], 8, 2);
    tl.to(gens[2].p, { bob: 4, duration: 0.3, yoyo: true, repeat: 3 }, 9);
    R.expr(tl, gens[2], 'triste', 11);
    tl.to(gens[0].p, { tete: -15, yeux: 0.6, duration: 1 }, 12);
    R.cam(tl, sc, { x: 900, y: 660, z: 1.3 }, 12, 8);
    R.fonduSortie(tl, 26.5, 1.5);
  });

  // =================================================================== 2 · Perdu en brousse
  R.scene('Perdu en brousse', 30, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir' });
    const b = bayuo(sc, { x: -200 });
    b.tenir(D.arc(), 'R', { vertical: true });
    const assombrir = R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#0b1030', opacity: 0 }, sc.monde);
    sc.cam.x = 760; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, b, 900, 1, 7);
    R.cartouche(tl, 2, 5, 'perso_chasseur');
    [9, 11, 13].forEach((t, i) => { tl.set(b.p, { dir: i % 2 ? 1 : -1 }, t); R.pose(tl, b, { regard: i % 2 ? 1 : -1, tete: 8 }, t, 0.4); });
    R.expr(tl, b, 'peur', 12);
    tl.to(assombrir, { opacity: 0.55, duration: 8 }, 10);
    G.notes(tl, sc.monde, 1900, 700, 16, 12, '#c8f0ff');
    R.expr(tl, b, 'surprise', 17);
    tl.set(b.p, { dir: 1 }, 17);
    R.pose(tl, b, { tete: 0, regard: 1 }, 17, 0.4);
    R.marche(tl, b, 2200, 20, 8, { pas: 10 });
    R.cam(tl, sc, { x: 1300 }, 19, 9);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 3 · Les kontomblé
  R.scene('Les kontomblé', 38, (sc, tl) => {
    const bois = DECORS.bois(sc, { ciel: 'nuit' });
    const j = joueur(sc, C.genie, null, 820, sc.monde, { s: 1.15 });
    const danseurs = genies(sc, [1150, 1300, 600]);
    const b = bayuo(sc, { x: -150 });
    const buisson = R.el('g', {}, sc.monde);
    for (const [cx, cy, r] of [[300, 840, 70], [360, 800, 80], [420, 850, 60]]) R.el('circle', { cx, cy, r, fill: '#1f3326' }, buisson);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1.5);
    G.balafon(tl, j.p, 0.5, 36, j.bal);
    G.notes(tl, sc.monde, 930, 740, 0.5, 36, '#c8f0ff');
    G.danseFoule(tl, danseurs, 1, 30);
    R.cartouche(tl, 2, 5, 'perso_kontomble', 'droite');
    R.marche(tl, b, 330, 3, 4.5, { pas: 6 });
    sc.monde.appendChild(buisson);
    R.pose(tl, b, { assis: 0.6, lean: 20 }, 7.6, 0.6);
    R.expr(tl, b, 'surprise', 8);
    R.cam(tl, sc, { x: 400, y: 720, z: 1.8 }, 8, 2);
    R.cam(tl, sc, { x: 980, y: 760, z: 2.2 }, 13, 2);
    R.cartouche(tl, 14, 5, 'lieu_gyil');
    R.cam(tl, sc, { x: 600, y: 680, z: 1.4 }, 20, 3);
    R.expr(tl, b, 'joie', 22);
    tl.to(b.p, { tete: 8, duration: 0.25, yoyo: true, repeat: 15 }, 23);
    R.cam(tl, sc, { x: 900, y: 620, z: 1.05 }, 30, 4);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 4 · Il apprend en secret
  R.scene('Il apprend en secret', 36, (sc, tl) => {
    DECORS.bois(sc, { ciel: 'nuit' });
    const j = joueur(sc, C.genie, null, 900, sc.monde, { s: 1.15 });
    const b = bayuo(sc, { x: 330, assis: 1 });
    b.tenir(D.baguette(), 'A'); b.tenir(D.baguette(), 'R');
    const buche = R.el('rect', { x: 380, y: 850, width: 120, height: 26, rx: 10, fill: '#6b4527', stroke: '#3f2a18', 'stroke-width': 2 }, sc.monde);
    const buisson = R.el('g', {}, sc.monde);
    for (const [cx, cy, r] of [[230, 840, 70], [280, 790, 70]]) R.el('circle', { cx, cy, r, fill: '#1f3326' }, buisson);
    const lunes = [0, 1, 2].map((i) => { const l = D.lune(sc.monde, 600 + i * 400, 160, 30); l.setAttribute('opacity', 0); return l; });
    sc.cam.x = 700; sc.cam.y = 680; sc.cam.z = 1.4;
    R.fonduEntree(tl, 0, 1);
    // Trois nuits : la lune change de place, Bayuo imite de mieux en mieux
    lunes.forEach((l, i) => { tl.to(l, { opacity: 1, duration: 0.6 }, i * 11); if (i < 2) tl.to(l, { opacity: 0, duration: 0.6 }, i * 11 + 10.5); });
    G.balafon(tl, j.p, 0.5, 33, j.bal);
    G.notes(tl, sc.monde, 1010, 740, 0.5, 33, '#c8f0ff');
    G.balafon(tl, b, 2, 7);
    R.expr(tl, b, 'triste', 5);
    G.balafon(tl, b, 13, 8);
    R.expr(tl, b, 'neutre', 13);
    G.balafon(tl, b, 24, 9);
    R.expr(tl, b, 'joie', 25);
    G.notes(tl, sc.monde, 440, 760, 26, 6, '#ffd166');
    R.cam(tl, sc, { x: 600, y: 700, z: 1.6 }, 20, 5);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 5 · Le pacte
  R.scene('Le pacte', 40, (sc, tl) => {
    DECORS.bois(sc, { ciel: 'nuit' });
    const j = joueur(sc, C.genie, null, 900, sc.monde, { s: 1.15 });
    const gs = genies(sc, [1200, 1350]);
    const b = bayuo(sc, { x: 420 });
    const offrande = D.calebasse(); b.tenir(offrande, 'A', { vertical: true });
    sc.cam.x = 860; sc.cam.y = 640; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1);
    // Découvert !
    tl.set(j.p.p, { dir: -1 }, 1);
    R.pose(tl, j.p, { assis: 0 }, 1.5, 0.5);
    G.exprFoule(tl, [j.p].concat(gs), 'colere', 1.8);
    gs.forEach((g, i) => R.marche(tl, g, 600 + i * 120, 2 + i * 0.2, 2, { pas: 5 }));
    R.expr(tl, b, 'peur', 2);
    G.agenouiller(tl, b, 3.5);
    R.secousse(tl, sc, 3, 5, 0.6);
    R.parle(tl, j.p, 4.5, 3);
    R.pose(tl, j.p, { bA: 150, cA: 40 }, 4.5, 0.4);
    // Bayuo offre de la bière de mil et demande à jouer
    R.pose(tl, b, { bA: 80, cA: 10 }, 9, 0.5);
    R.parle(tl, b, 9.5, 3);
    R.cam(tl, sc, { x: 700, y: 700, z: 1.6 }, 9, 2);
    R.expr(tl, j.p, 'surprise', 13);
    G.pointer(tl, j.p, 14, 2);
    // L'épreuve : Bayuo joue le gyil des génies
    R.marche(tl, j.p, 1100, 16, 1.5, { pas: 3 });
    G.relever(tl, b, 16);
    R.marche(tl, b, 900, 16.5, 1.5, { pas: 3 });
    tl.to(offrande, { opacity: 0, duration: 0.2 }, 17);
    R.pose(tl, b, { assis: 1 }, 18.1, 0.5);
    const baguettes = [b.tenir(objet(D.baguette(), false), 'A'), b.tenir(objet(D.baguette(), false), 'R')];
    baguettes.forEach((w) => tl.to(w.firstChild, { opacity: 1, duration: 0.2 }, 18.5));
    G.balafon(tl, b, 19, 9, j.bal);
    G.notes(tl, sc.monde, 1010, 740, 19, 9, '#ffd166');
    R.cam(tl, sc, { x: 1000, y: 640, z: 1.2 }, 19, 3);
    G.exprFoule(tl, [j.p].concat(gs), 'surprise', 20);
    G.exprFoule(tl, [j.p].concat(gs), 'rire', 24);
    G.danseFoule(tl, gs, 24, 5);
    // Le pacte : le génie montre l'arbre dont on tire les lames
    R.expr(tl, b, 'joie', 28);
    G.pointer(tl, j.p, 29.5, 4, 0.6);
    R.parle(tl, j.p, 30, 3);
    R.pose(tl, b, { assis: 0, tete: 15 }, 30.5, 0.5);
    G.incliner(tl, b, 34, 2, 35);
    [j.p].concat(gs).forEach((g, i) => G.apparition(tl, sc.monde, g, 36.5 + i * 0.3, '#c8f0ff', false));
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 6 · Le premier gyil des hommes
  R.scene('Le premier gyil', 36, (sc, tl) => {
    DECORS.village(sc, {});
    const b = bayuo(sc, { x: 700, assis: 1 });
    D.siege(sc.monde, 700, SOL + 2, 70, 50); sc.monde.appendChild(b.root);
    const outil = b.tenir(D.marteau(), 'A');
    const cadre = R.el('g', {}, sc.monde);
    R.el('path', { d: 'M800,840 L1020,830 M800,840 L806,880 M1020,830 L1014,880', stroke: '#6b4527', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, cadre);
    const lames = [], calebasses = [];
    for (let i = 0; i < 8; i++) {
      calebasses.push(R.el('circle', { cx: 818 + i * 26, cy: 862, r: 9 - i * 0.4, fill: '#d9b26a', stroke: '#8a6a30', 'stroke-width': 1.5, opacity: 0 }, cadre));
      lames.push(R.el('rect', { x: 806 + i * 26, y: 822 - i * 1.3, width: 20, height: 14 - i * 0.6, rx: 2, fill: '#9a6a3a', stroke: '#5a3a1a', 'stroke-width': 1.5, opacity: 0 }, cadre));
    }
    const copeaux = D.particules(sc.monde, 30, 900, 820, '#c89a6a', 5);
    const curieux = G.foule(sc, [[C.enfant, null, 1250, -1], [C.fille, null, 1350, -1], [C.ancien, null, 1480, -1]]);
    sc.cam.x = 900; sc.cam.y = 720; sc.cam.z = 1.6;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_village');
    G.forger(tl, b, 1, 16, 0.8, copeaux);
    lames.forEach((l, i) => tl.to(l, { opacity: 1, duration: 0.4 }, 2 + i * 1.6));
    calebasses.forEach((c, i) => tl.to(c, { opacity: 1, duration: 0.4 }, 15 + i * 0.5));
    R.cam(tl, sc, { x: 1000, y: 660, z: 1.2 }, 15, 4);
    G.exprFoule(tl, curieux, 'surprise', 16);
    curieux.slice(0, 2).forEach((p, i) => R.marche(tl, p, 1120 + i * 100, 18 + i * 0.3, 2, { pas: 3 }));
    tl.to(outil, { opacity: 0, duration: 0.2 }, 20);
    b.tenir(D.baguette(), 'A'); b.tenir(D.baguette(), 'R');
    G.balafon(tl, b, 21, 12, { lames });
    G.notes(tl, sc.monde, 900, 760, 21, 12);
    G.exprFoule(tl, curieux, 'joie', 22);
    R.cam(tl, sc, { x: 960, y: 620, z: 1.05 }, 24, 6);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 7 · La fête
  R.scene('La fête', 36, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir' });
    const feu = D.feu(sc.monde, 1250, SOL + 2, 1); G.flamber(tl, feu, 0, 36);
    const j = joueur(sc, BAYUO[0], BAYUO[1], 700);
    const gens = G.foule(sc, [[C.ancien, null, 1050, -1], [C.ronde, H.villageoise, 1150, -1], [C.enfant, null, 1380, -1], [C.fille, null, 1480, -1], [C.colosse, H.forgeron, 1600, -1], [C.elancee, H.villageoise, 1720, -1]]);
    sc.cam.x = 1050; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    G.balafon(tl, j.p, 0.5, 34, j.bal);
    G.notes(tl, sc.monde, 810, 740, 0.5, 34);
    G.exprFoule(tl, gens, 'rire', 2);
    G.danseFoule(tl, gens, 3, 28);
    R.cam(tl, sc, { x: 1200, y: 620, z: 1.15 }, 4, 10);
    R.cam(tl, sc, { x: 960, y: 580, z: 0.95 }, 18, 8);
    // Au bord de la brousse, deux génies regardent en souriant
    const temoins = genies(sc, [2050, 2160]);
    temoins.forEach((g) => (g.p.alpha = 0));
    tl.to(temoins.map((g) => g.p), { alpha: 0.6, duration: 2 }, 22);
    R.cam(tl, sc, { x: 1700, y: 640, z: 1.2 }, 24, 4);
    G.exprFoule(tl, temoins, 'joie', 25);
    tl.to(temoins.map((g) => g.p), { alpha: 0, duration: 2 }, 31);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 8 · La vie et la mort
  R.scene('La vie et la mort', 30, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir' });
    const j1 = joueur(sc, BAYUO[0], BAYUO[1], 560);
    const j2 = joueur(sc, C.guerrier, H.villageois, 860);
    const gens = G.foule(sc, [[C.vieille, null, 1200, -1], [C.trapu, H.villageois, 1330, -1], [C.ronde, H.villageoise, 1460, -1]]);
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 6, 'lieu_funerailles');
    G.balafon(tl, j1.p, 0.5, 14, j1.bal);
    G.balafon(tl, j2.p, 0.7, 14, j2.bal);
    G.notes(tl, sc.monde, 760, 740, 0.5, 14);
    G.exprFoule(tl, gens, 'serein', 1);
    G.danseFoule(tl, gens, 3, 9);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 6, 7);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 10.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
