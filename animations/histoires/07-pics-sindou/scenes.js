/*
 * 07 · Les esprits des pics de Sindou — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;

  const COSTUMES = {
    nakan: { haut: { type: 'boubou', couleur: '#e8dcc0', motif: 'chevrons', motifCouleur: '#5a3a20', long: 1.7 }, manches: '#e8dcc0', tete: { type: 'foulard', couleur: '#5a3a20' } },
    senoufo: { haut: { type: 'tunique', couleur: '#c9b48a', motif: 'chevrons', motifCouleur: '#3a2a1a' }, bas: { type: 'short', couleur: '#5a4a3a' }, tete: null },
    senoufa: { haut: { type: 'camisole', couleur: '#8a5a32' }, bas: { type: 'jupe', couleur: '#e8dcc0', motif: 'chevrons', motifCouleur: '#3a2a1a' }, collier: '#efe6cf' },
  };
  /** Le peuple en fuite (toujours les mêmes, d'une scène à l'autre). */
  const PEUPLE = [
    [C.vieille, COSTUMES.nakan], [C.colosse, COSTUMES.senoufo], [C.ronde, COSTUMES.senoufa], [C.enfant, null],
    [C.trapu, COSTUMES.senoufo], [C.fille, null], [C.filiforme, COSTUMES.senoufo],
  ];
  const peuple = (sc, x0, ecart, dir, parent) => PEUPLE.map(([def, cos], i) => sc.perso(def, cos, { x: x0 - i * ecart * (dir || 1), y: SOL, dir: dir || 1 }, parent));
  /** Cavaliers razzieurs. */
  const cavaliers = (sc, liste, parent) => liste.map(([x, dir, s]) => {
    const ch = sc.bete(B.cheval, { x, y: SOL, dir, s: s || 1 }, parent);
    const c = sc.perso(C.guerrier, H.cavalier, {}, parent);
    ch.monter(c);
    c.tenir(D.lance(220), 'A', { vertical: true });
    ch.cav = c;
    return ch;
  });
  /** Esprit des rochers qui sort d'un pic (apparition lente, halo). */
  const esprit = (sc, x, s, dir, parent) => sc.perso(C.rocher, null, { x, y: SOL, s: s || 1, dir: dir || 1, alpha: 0, lueur: 1 }, parent);

  // =================================================================== 1 · Les pics
  R.scene('Les pics', 26, (sc, tl) => {
    DECORS.pics(sc, { ciel: 'soir', soleil: [1500, 300, 70] });
    sc.cam.x = 960; sc.cam.y = 500; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 2);
    R.titre(tl, 1.5, 7, 'titre', 'sous_titre', 300);
    R.cam(tl, sc, { x: 1200, y: 560, z: 1.15 }, 2, 20);
    R.fonduSortie(tl, 24, 2);
  });

  // =================================================================== 2 · La razzia
  R.scene('La razzia', 36, (sc, tl) => {
    const v = DECORS.village(sc, {});
    const gens = peuple(sc, 1100, 110, -1);
    gens.forEach((p, i) => (p.p.x = 600 + i * 140));
    const feux = [v.greniers[0], v.greniers[1]].map((g, i) => { const f = D.feu(sc.monde, i ? 1400 : 530, 700, 1.4); gsap.set(f, { opacity: 0 }); return f; });
    const cav = cavaliers(sc, [[2400, -1], [2650, -1], [2900, -1]]);
    sc.cam.x = 1000; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 4.5, 'lieu_village');
    G.dialogue(tl, 1.5, [[gens[1], 2], [gens[2], 2]]);
    G.piocher(tl, gens[4], 1, 4, 0.9);
    // Les cavaliers surgissent
    cav.forEach((ch, i) => R.marche(tl, ch, 1500 + i * 180, 5 + i * 0.4, 3, { pas: 9, amp: 1.4 }));
    R.cartouche(tl, 6, 4.5, 'perso_cavaliers', 'droite');
    G.peurFoule(tl, gens, 6.5);
    R.secousse(tl, sc, 7, 6, 1);
    cav.forEach((ch, i) => { tl.to(ch.p, { cabre: 1, duration: 0.4, yoyo: true, repeat: 1 }, 8.2 + i * 0.3); R.pose(tl, ch.cav, { bA: 160, cA: 10 }, 8.2 + i * 0.3, 0.3); });
    feux.forEach((f, i) => { tl.to(f, { opacity: 1, duration: 0.6 }, 9 + i); G.flamber(tl, f, 9 + i, 26); });
    // Fuite vers la gauche
    gens.forEach((p, i) => { tl.set(p.p, { dir: -1 }, 10 + i * 0.1); R.marche(tl, p, -400 - i * 90, 10.2 + i * 0.1, 7, { pas: 16, amp: 1.2 }); });
    G.surLaTete(gens[2], D.sac());
    R.cam(tl, sc, { x: 700, z: 0.95 }, 10, 6);
    cav.forEach((ch, i) => R.marche(tl, ch, 900 + i * 200, 14 + i * 0.3, 4, { pas: 10, amp: 1.3 }));
    R.cam(tl, sc, { x: 1100, y: 560, z: 0.9 }, 19, 5);
    cav.forEach((ch, i) => R.pose(tl, ch.cav, { bA: 8, cA: 12 }, 20, 0.4));
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 3 · La fuite
  R.scene('La fuite', 32, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'nuit', nuit: true });
    const gens = peuple(sc, -100, 120, 1);
    const enfant = gens[3];
    sc.cam.x = 760; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 4, 'lieu_fuite');
    gens.forEach((p, i) => { R.expr(tl, p, 'triste', 0); R.marche(tl, p, 1400 - i * 120, 0.5 + i * 0.2, 14, { pas: 14, amp: 0.7 }); });
    gens[0].tenir(D.baton(200), 'R', { vertical: true });
    R.cam(tl, sc, { x: 1050 }, 1, 14);
    R.cartouche(tl, 6, 4.5, 'perso_doyenne');
    // L'enfant tombe de fatigue ; le colosse le porte sur ses épaules
    tl.to(enfant.p, { rot: -70, duration: 0.5 }, 15.5);
    R.expr(tl, enfant, 'douleur', 15.5);
    tl.set(gens[1].p, { dir: -1 }, 16);
    R.pose(tl, gens[1], { lean: 40, bA: 60, cA: 30 }, 16.5, 0.6);
    tl.to(enfant.p, { rot: 0, x: gens[1].p.x + 0, y: SOL - 200, duration: 0.8 }, 17.2);
    tl.to(enfant.p, { x: 1280, assis: 1, duration: 0.8 }, 17.2);
    R.pose(tl, gens[1], { lean: 0, bA: 140, cA: 60, bR: 140, cR: 60 }, 17.3, 0.6);
    R.expr(tl, enfant, 'sommeil', 18.5);
    tl.set(gens[1].p, { dir: 1 }, 19);
    // Nakan montre l'horizon : des formes de pierre au loin
    G.pointer(tl, gens[0], 20, 4, 0.3);
    R.parle(tl, gens[0], 20.3, 2.5);
    gens.forEach((p, i) => { if (i !== 3) R.pose(tl, p, { tete: 10 }, 21 + i * 0.1, 0.5); });
    const silhouettes = R.el('g', { opacity: 0 }, sc.monde);
    sc.monde.insertBefore(silhouettes, sc.monde.children[1]);
    for (const [x, h] of [[1800, 300], [1950, 380], [2100, 280]]) D.pic(silhouettes, x, 820, h, h * 0.3, '#3a3046');
    tl.to(silhouettes, { opacity: 1, duration: 3 }, 20.5);
    R.cam(tl, sc, { x: 1500, y: 560, z: 0.95 }, 21, 5);
    G.exprFoule(tl, gens, 'serein', 24);
    R.fonduSortie(tl, 30.5, 1.5);
  });

  // =================================================================== 4 · Les esprits des rochers
  R.scene('Les esprits', 42, (sc, tl) => {
    const d = DECORS.pics(sc, { ciel: 'jour' });
    const gens = peuple(sc, 640, 95, 1);
    gens.forEach((p, i) => (p.p.x = 640 - i * 95 - 600));
    const cal = D.calebasse(); sc.monde.appendChild(cal); gsap.set(cal, { x: 1080, y: SOL + 10, opacity: 0 });
    const esprits = [esprit(sc, 1460, 1.1, -1), esprit(sc, 1750, 0.95, -1), esprit(sc, 240, 0.9, 1)];
    sc.cam.x = 900; sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    gens.forEach((p, i) => R.marche(tl, p, 900 - i * 95, 0.5 + i * 0.15, 6, { pas: 8 }));
    R.cartouche(tl, 2, 5, 'lieu_pics');
    G.exprFoule(tl, gens, 'surprise', 6);
    gens.forEach((p, i) => R.pose(tl, p, { tete: 18 }, 6.5 + i * 0.1, 0.6));
    R.cam(tl, sc, { y: 420, z: 0.8 }, 6, 5);
    // L'offrande de Nakan au pied du grand pic
    R.cam(tl, sc, { x: 1000, y: 640, z: 1.3 }, 12, 3);
    R.marche(tl, gens[0], 1020, 12, 2.5, { pas: 4 });
    G.agenouiller(tl, gens[0], 14.7);
    R.pose(tl, gens[0], { bA: 70, cA: 10 }, 15.4, 0.5);
    tl.to(cal, { opacity: 1, duration: 0.4 }, 15.8);
    G.prier(tl, gens[0], 16.6, 5);
    R.parle(tl, gens[0], 17, 4);
    // Les esprits sortent de la pierre
    R.cam(tl, sc, { x: 1200, y: 520, z: 0.95 }, 21, 3);
    esprits.forEach((e, i) => {
      tl.to(e.p, { alpha: 1, duration: 2.5 }, 21.5 + i * 0.8);
      tl.fromTo(e.p, { s: 0.6 * e.p.s }, { s: e.p.s, duration: 2.5, immediateRender: false }, 21.5 + i * 0.8);
    });
    R.cartouche(tl, 23, 5, 'perso_esprits', 'droite');
    R.secousse(tl, sc, 21.5, 4, 2);
    G.peurFoule(tl, gens.slice(1), 22);
    esprits.forEach((e, i) => { R.expr(tl, e, 'serein', 25); tl.to(e.p, { tete: 14, duration: 0.6, yoyo: true, repeat: 1 }, 27 + i * 0.3); });
    R.pose(tl, esprits[0], { bA: 110, cA: 10 }, 29, 0.8);
    G.relever(tl, gens[0], 30);
    R.expr(tl, gens[0], 'joie', 30.5);
    G.calmeFoule(tl, gens.slice(1), 31, 'joie');
    gens.forEach((p, i) => G.incliner(tl, p, 32.5 + i * 0.1, 2, 32));
    esprits.forEach((e, i) => tl.to(e.p, { alpha: 0.15, duration: 3 }, 36 + i * 0.4));
    R.cam(tl, sc, { x: 960, y: 560, z: 0.95 }, 34, 4);
    R.fonduSortie(tl, 40.5, 1.5);
  });

  // =================================================================== 5 · Le village entre les rochers
  R.scene('Le nouveau village', 28, (sc, tl) => {
    DECORS.pics(sc, {});
    const cases = [[480, 0.75], [760, 0.85], [1240, 0.8], [1540, 0.75]].map(([x, s]) => D.caseRonde(sc.monde, x, SOL, s, { couleur: '#b98652' }));
    const gens = peuple(sc, 0, 0, 1);
    [600, 900, 1100, 1350, 1000, 700, 1450].forEach((x, i) => (gens[i].p.x = x));
    sc.cam.x = 960; sc.cam.y = 580; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    tl.from(cases, { scale: 0, transformOrigin: '50% 100%', duration: 0.8, ease: 'back.out(1.6)', stagger: 1.2 }, 1);
    G.piocher(tl, gens[4], 1, 8, 0.9);
    G.piler(tl, gens[2], 2, 10, 0.9, 110);
    G.surLaTete(gens[6], D.sac());
    R.marche(tl, gens[6], 1700, 2, 7);
    R.saut(tl, gens[3], 6, 40); R.saut(tl, gens[5], 6.4, 40);
    G.exprFoule(tl, gens, 'joie', 3);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.2 }, 9, 8);
    R.fonduSortie(tl, 26.5, 1.5);
  });

  // =================================================================== 6 · Le retour des cavaliers
  R.scene('Les cavaliers reviennent', 46, (sc, tl) => {
    DECORS.pics(sc, { ciel: 'orage' });
    const gens = peuple(sc, 0, 0, 1);
    [700, 860, 980, 1080, 600, 1180, 500].forEach((x, i) => (gens[i].p.x = x));
    const cav = cavaliers(sc, [[2400, -1], [2650, -1], [2900, -1], [3150, -1]]);
    const esprits = [esprit(sc, 1500, 1.25, -1), esprit(sc, 300, 1.1, 1), esprit(sc, 1900, 1, -1)];
    const chutes = [];
    for (let i = 0; i < 8; i++) { const r = D.rocher(sc.monde, 0, 0, 0.35 + (i % 3) * 0.12); gsap.set(r, { x: 1300 + i * 110, y: 200, opacity: 0 }); chutes.push(r); }
    const poussiere = D.particules(sc.monde, 40, 1600, 860, '#c9a678', 7);
    sc.cam.x = 1100; sc.cam.y = 580; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    cav.forEach((ch, i) => R.marche(tl, ch, 1500 + i * 170, 1 + i * 0.4, 5, { pas: 14, amp: 1.4 }));
    G.peurFoule(tl, gens, 4);
    gens.forEach((p, i) => { tl.set(p.p, { dir: -1 }, 5 + i * 0.1); R.marche(tl, p, 200 + i * 60, 5.2 + i * 0.1, 3, { pas: 8, amp: 1.2 }); });
    R.cam(tl, sc, { x: 1400, y: 600, z: 1.05 }, 4, 3);
    cav.forEach((ch, i) => R.pose(tl, ch.cav, { bA: 160, cA: 10 }, 7 + i * 0.2, 0.3));
    // Nakan appelle les esprits
    tl.set(gens[0].p, { dir: 1 }, 9);
    G.prier(tl, gens[0], 9.2, 6);
    R.cam(tl, sc, { x: 600, y: 640, z: 1.3 }, 9, 2);
    // La montagne tremble
    R.cam(tl, sc, { x: 1300, y: 500, z: 0.85 }, 13, 2);
    R.secousse(tl, sc, 13.5, 18, 6);
    esprits.forEach((e, i) => { tl.to(e.p, { alpha: 1, duration: 1.5 }, 14 + i * 0.5); R.expr(tl, e, 'colere', 14 + i * 0.5); R.pose(tl, e, { bA: 160, bR: 160, cA: 20, cR: 20 }, 15 + i * 0.5, 0.6); });
    chutes.forEach((r, i) => {
      tl.set(r, { opacity: 1 }, 15.5 + i * 0.35);
      tl.to(r, { y: SOL - 6, rotation: 160 + i * 40, duration: 0.9, ease: 'power2.in' }, 15.5 + i * 0.35);
      tl.to(r, { x: '+=' + (60 + i * 10), rotation: '+=120', duration: 1.2, ease: 'power1.out' }, 16.4 + i * 0.35);
    });
    [16.5, 17.3, 18.1, 18.9, 19.7].forEach((t, i) => R.jaillir(tl, poussiere, t, i, { n: 8, ecart: 50, haut: 120, duree: 1.4 }));
    cav.forEach((ch, i) => { tl.to(ch.p, { cabre: 1, duration: 0.4, yoyo: true, repeat: 3 }, 16 + i * 0.3); G.exprFoule(tl, [ch.cav], 'peur', 16); });
    // Les cavaliers s'enfuient
    cav.forEach((ch, i) => { tl.set(ch.p, { dir: 1 }, 21 + i * 0.3); R.marche(tl, ch, 3200 + i * 150, 21.2 + i * 0.3, 5, { pas: 16, amp: 1.5 }); });
    R.cam(tl, sc, { x: 1500, y: 580, z: 0.95 }, 21, 4);
    esprits.forEach((e, i) => R.pose(tl, e, { bA: 8, bR: -8, cA: 12, cR: 12 }, 27 + i * 0.3, 1));
    R.cam(tl, sc, { x: 1000, y: 580, z: 0.95 }, 28, 4);
    G.calmeFoule(tl, gens, 32, 'surprise');
    R.fonduSortie(tl, 44.5, 1.5);
  });

  // =================================================================== 7 · Libres
  R.scene('Libres', 30, (sc, tl) => {
    DECORS.pics(sc, { ciel: 'soir', soleil: [1550, 380, 70] });
    const gens = peuple(sc, 0, 0, 1);
    [700, 860, 980, 1080, 600, 1180, 500].forEach((x, i) => (gens[i].p.x = x));
    const esprits = [esprit(sc, 1500, 1.25, -1), esprit(sc, 300, 1.1, 1)];
    esprits.forEach((e) => (e.p.alpha = 1));
    sc.cam.x = 960; sc.cam.y = 580; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    G.exprFoule(tl, gens, 'joie', 0.5);
    G.danseFoule(tl, gens, 2, 12);
    esprits.forEach((e, i) => { R.expr(tl, e, 'serein', 2); G.incliner(tl, e, 5 + i * 0.4, 2, 20); });
    esprits.forEach((e, i) => tl.to(e.p, { alpha: 0, duration: 4 }, 15 + i * 0.5));
    R.cam(tl, sc, { y: 480, z: 0.85 }, 14, 8);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 28, (sc, tl) => {
    DECORS.pics(sc, { ciel: 'soir' });
    const pretre = sc.perso(C.ancien, COSTUMES.senoufo, { x: 800, y: SOL });
    const poule = sc.bete(B.poule, { x: 0, y: 0, s: 0.8 }); pretre.tenir(poule.root, 'A', { vertical: true });
    const famille = G.foule(sc, [[C.fille, null, 600, 1], [C.ronde, COSTUMES.senoufa, 480, 1]]);
    D.autel(sc.monde, 1080, SOL + 4, 0.9);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_aujourdhui');
    R.marche(tl, pretre, 960, 1, 2, { pas: 3 });
    G.agenouiller(tl, pretre, 3.5);
    R.pose(tl, pretre, { bA: 80, cA: 0 }, 4.5, 0.4);
    tl.to(poule.root, { opacity: 0, duration: 0.4 }, 5.5);
    G.prier(tl, pretre, 6, 4);
    G.exprFoule(tl, famille, 'serein', 6);
    R.cam(tl, sc, { y: 480, z: 0.85 }, 8, 5);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
