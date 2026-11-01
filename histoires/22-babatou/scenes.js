/*
 * 22 · Les villages face aux razzias de Babatou — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;

  const COSTUMES = {
    gourounsi: { haut: { type: 'tunique', couleur: '#8a5a32', motif: 'chevrons', motifCouleur: '#e8dcc0' }, bas: { type: 'short', couleur: '#3a2a1a' }, tete: null },
    gourounsie: { haut: { type: 'camisole', couleur: '#b23a2a' }, bas: { type: 'jupe', couleur: '#1d140f', motif: 'chevrons', motifCouleur: '#f6ead2' }, collier: '#f6ead2' },
    zarma: Object.assign({}, H.cavalier, { haut: { type: 'boubou', couleur: '#e8e2d2', motif: 'bandes', motifCouleur: '#3a3a5a', long: 1.3 }, manches: '#e8e2d2' }),
  };
  const archers = (sc, xs, parent) => xs.map(([def, x, dir]) => { const p = sc.perso(def, COSTUMES.gourounsi, { x, y: SOL, dir: dir || 1 }, parent); p.tenir(D.arc(), 'R', { vertical: true }); return p; });
  const zarmas = (sc, liste, parent) => G.cavaliers(sc, liste, { habit: COSTUMES.zarma, arme: 'sabre', parent });
  /** Pièges : trous couverts de branchages devant le village. */
  function pieges(parent, xs) {
    return xs.map((x) => {
      const g = R.el('g', {}, parent);
      g.trou = R.el('ellipse', { cx: x, cy: SOL + 8, rx: 80, ry: 16, fill: '#2a1a10', opacity: 0 }, g);
      g.couvert = R.el('ellipse', { cx: x, cy: SOL + 6, rx: 82, ry: 12, fill: '#a89a5a', stroke: '#6a5a2a', 'stroke-width': 3 }, g);
      return g;
    });
  }

  // =================================================================== 1 · Le village
  R.scene('Le village', 26, (sc, tl) => {
    DECORS.tiebele(sc, { soleil: [300, 200, 60] });
    const gens = G.foule(sc, [[C.elancee, COSTUMES.gourounsie, 700, 1], [C.trapu, COSTUMES.gourounsi, 900, -1], [C.enfant, null, 1100, -1], [C.ronde, COSTUMES.gourounsie, 1250, -1]]);
    gens[0].tenir(D.pilon(160), 'A', { vertical: true });
    sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    G.piler(tl, gens[0], 1, 14, 0.9, 110);
    G.piocher(tl, gens[1], 1, 14, 0.9);
    R.cartouche(tl, 8, 5, 'lieu_village');
    tl.to(gens[2].p, { x: 1350, duration: 3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 2);
    R.cam(tl, sc, { x: 950, y: 640, z: 1.2 }, 9, 12);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · La menace
  R.scene('La menace', 34, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'chaud' });
    const cav = zarmas(sc, [[-200, 1], [-1000, 1]]);
    const captifs = [[C.trapu, -450], [C.filiforme, -620], [C.elancee, -790]].map(([def, x]) => sc.perso(def, def === C.elancee ? COSTUMES.gourounsie : COSTUMES.gourounsi, Object.assign({ x, y: SOL, bA: 30, cA: 80, bR: 30, cR: 80, tete: -12 }, R.EXPRESSIONS.triste)));
    const corde = R.el('path', { stroke: '#a08a5a', 'stroke-width': 4, fill: 'none' }, sc.monde);
    R.acteurs.push({ sc, a: { rendre: () => { const pts = [cav[0].p.x - 60].concat(captifs.map((c) => c.p.x)); corde.setAttribute('d', 'M' + pts.map((x) => `${x},${SOL - 120}`).join(' L')); } } });
    sc.cam.x = 600; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'lieu_menace');
    R.marche(tl, cav[0], 2200, 1, 26, { pas: 30 });
    captifs.forEach((p, i) => R.marche(tl, p, 2200 - (i + 1) * 170, 1.3 + i * 0.2, 26, { pas: 30, amp: 0.7 }));
    R.marche(tl, cav[1], 1400, 1.5, 26, { pas: 30 });
    R.cam(tl, sc, { x: 1300 }, 2, 26);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 3 · Le guetteur
  R.scene('Le guetteur', 30, (sc, tl) => {
    const t = DECORS.tiebele(sc, {});
    const guetteur = sc.perso(C.filiforme, COSTUMES.gourounsi, { x: 1380, y: SOL - 130 });
    const poussiere = R.el('ellipse', { cx: 2400, cy: 820, rx: 160, ry: 60, fill: '#d9b077', opacity: 0, filter: 'url(#flou)' }, sc.monde);
    sc.cam.x = 1400; sc.cam.y = 620; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_guetteur');
    R.pose(tl, guetteur, { bA: 120, cA: 120, tete: 5 }, 2, 0.5);
    [3, 5, 7].forEach((t2, i) => tl.set(guetteur.p, { dir: i % 2 ? -1 : 1 }, t2));
    R.cam(tl, sc, { x: 2000, y: 640, z: 1 }, 8, 3);
    tl.to(poussiere, { opacity: 0.8, cx: 2100, duration: 4 }, 9);
    R.cam(tl, sc, { x: 1400, y: 560, z: 1.3 }, 13, 2);
    R.expr(tl, guetteur, 'peur', 13.5);
    tl.set(guetteur.p, { dir: -1 }, 14);
    R.pose(tl, guetteur, { bA: 165, cA: 30, bR: 165, cR: 30 }, 14, 0.3);
    tl.to(guetteur.p, { cA: 0, cR: 0, duration: 0.2, yoyo: true, repeat: 9 }, 14.3);
    R.parle(tl, guetteur, 14.3, 4);
    // Le tambour d'alerte
    const tam = D.tambour(sc.monde, 900, SOL + 2, 1.1);
    const batteur = sc.perso(C.colosse, H.forgeron, { x: 830, y: SOL });
    R.cam(tl, sc, { x: 1000, y: 620, z: 1 }, 18, 3);
    for (let i = 0; i < 30; i++) tl.to(batteur.p, { bA: i % 2 ? 60 : 110, bR: i % 2 ? 110 : 60, cA: 40, cR: 40, duration: 0.14 }, 19 + i * 0.3);
    R.expr(tl, batteur, 'colere', 19);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 4 · Préparation
  R.scene('La préparation', 38, (sc, tl) => {
    DECORS.tiebele(sc, {});
    const chef = sc.perso(C.ancien, null, { x: 900, y: SOL });
    chef.tenir(D.baton(200), 'R', { vertical: true });
    const hommes = archers(sc, [[C.filiforme, 1100, -1], [C.trapu, 1220, -1], [C.guerrier, 1340, -1], [C.colosse, 1460, -1]]);
    const femmes = G.foule(sc, [[C.ronde, COSTUMES.gourounsie, 600, 1], [C.elancee, COSTUMES.gourounsie, 480, 1], [C.enfant, null, 700, 1], [C.fille, null, 380, 1]]);
    const lieux = pieges(sc.monde, [1700, 1950]);
    lieux.forEach((p) => gsap.set(p.couvert, { opacity: 0 }));
    sc.cam.x = 1000; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_preparation');
    G.dialogue(tl, 1.5, [[chef, 3]]);
    G.pointer(tl, chef, 2, 2.5);
    // Les femmes et les enfants se cachent dans les cases
    femmes.forEach((p, i) => { tl.set(p.p, { dir: -1 }, 5 + i * 0.2); R.marche(tl, p, 180 + i * 20, 5.2 + i * 0.2, 3, { pas: 6 }); tl.to(p.p, { alpha: 0, duration: 0.3 }, 8.2 + i * 0.2); });
    R.cam(tl, sc, { x: 700 }, 5, 3);
    // Les hommes creusent et couvrent les pièges
    R.cam(tl, sc, { x: 1700, y: 640, z: 1.1 }, 10, 3);
    hommes.slice(0, 2).forEach((p, i) => { tl.set(p.p, { dir: 1 }, 10); R.marche(tl, p, 1650 + i * 260, 10.2, 2.5); });
    hommes.slice(0, 2).forEach((p) => G.piocher(tl, p, 13, 6, 0.9));
    lieux.forEach((p) => { tl.to(p.trou, { opacity: 1, duration: 4 }, 13.5); tl.to(p.couvert, { opacity: 1, duration: 1.5 }, 19); });
    // Les flèches et les arcs sont prêts
    R.cam(tl, sc, { x: 1250, y: 620, z: 1.1 }, 21, 3);
    hommes.slice(2).forEach((p, i) => R.pose(tl, p, { bR: 90, cR: 0, bA: 80, cA: 110 }, 22 + i * 0.3, 0.5));
    G.exprFoule(tl, hommes, 'colere', 23);
    hommes.slice(0, 2).forEach((p, i) => { tl.set(p.p, { dir: -1 }, 25); R.marche(tl, p, 1100 + i * 120, 25.2, 3); });
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 5 · L'attaque
  R.scene('L\'attaque', 40, (sc, tl) => {
    DECORS.tiebele(sc, { ciel: 'chaud' });
    const lieux = pieges(sc.monde, [1450, 1700]);
    const hommes = archers(sc, [[C.filiforme, 800, 1], [C.trapu, 680, 1], [C.guerrier, 560, 1], [C.colosse, 440, 1]]);
    const cav = zarmas(sc, [[2400, -1], [2620, -1], [2840, -1], [3060, -1]]);
    const poussiere = D.particules(sc.monde, 40, 1600, 860, '#c9a678', 15);
    sc.cam.x = 1300; sc.cam.y = 600; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_attaque', 'droite');
    G.exprFoule(tl, hommes, 'colere', 1);
    G.chevaucher(tl, cav, 1900, 2, 5, { pas: 14 });
    [3, 4, 5, 6].forEach((t, i) => R.jaillir(tl, poussiere, t, i, { n: 8, ecart: 60, haut: 90, duree: 1.2 }));
    cav.forEach((ch) => R.pose(tl, ch.cav, { bA: 160, cA: 10 }, 5, 0.3));
    R.secousse(tl, sc, 4, 5, 3);
    [[0, 6], [2, 6.5], [1, 7], [3, 7.5]].forEach(([i, t], k) => G.tirer(tl, hommes[i], sc.monde, t, 1900 + k * 120, 680, 0.6));
    // Les chevaux tombent dans les pièges
    R.marche(tl, cav[0], 1450, 8, 1.5, { pas: 5, amp: 1.4 });
    R.marche(tl, cav[1], 1700, 8.3, 1.5, { pas: 5, amp: 1.4 });
    lieux.forEach((p, i) => tl.to(p.couvert, { opacity: 0, duration: 0.2 }, 9.5 + i * 0.3));
    [cav[0], cav[1]].forEach((ch, i) => { tl.to(ch.p, { y: SOL + 60, cabre: 1, duration: 0.4, ease: 'power2.in' }, 9.5 + i * 0.3); G.exprFoule(tl, [ch.cav], 'peur', 9.6 + i * 0.3); });
    R.secousse(tl, sc, 9.6, 12, 0.6);
    R.cam(tl, sc, { x: 1550, y: 680, z: 1.3 }, 9, 2);
    [cav[2], cav[3]].forEach((ch) => tl.to(ch.p, { cabre: 1, duration: 0.3, yoyo: true, repeat: 3 }, 11));
    G.exprFoule(tl, cav.map((c) => c.cav), 'peur', 11);
    R.cam(tl, sc, { x: 1200, y: 600, z: 0.95 }, 15, 4);
    [[0, 16], [2, 16.6], [1, 17.2]].forEach(([i, t], k) => G.tirer(tl, hommes[i], sc.monde, t, 1750 + k * 160, 700, 0.6));
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 6 · La résistance
  R.scene('La résistance', 40, (sc, tl) => {
    DECORS.tiebele(sc, { ciel: 'soir' });
    const hommes = archers(sc, [[C.filiforme, 900, 1], [C.trapu, 780, 1], [C.guerrier, 660, 1], [C.colosse, 540, 1]]);
    const cav = zarmas(sc, [[1500, -1], [1700, -1], [1900, -1]]);
    const femmes = G.foule(sc, [[C.ronde, COSTUMES.gourounsie, 300, 1], [C.elancee, COSTUMES.gourounsie, 180, 1], [C.enfant, null, 420, 1]]);
    femmes.forEach((p) => (p.p.alpha = 0));
    sc.cam.x = 1150; sc.cam.y = 600; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_resistance');
    [[0, 2], [2, 2.6], [1, 3.2], [3, 3.8]].forEach(([i, t], k) => G.tirer(tl, hommes[i], sc.monde, t, 1450 + k * 120, 700, 0.5));
    G.exprFoule(tl, cav.map((c) => c.cav), 'peur', 4);
    // Les cavaliers font demi-tour
    cav.forEach((ch, i) => { tl.set(ch.p, { dir: 1 }, 6 + i * 0.2); R.marche(tl, ch, 2800 + i * 200, 6.2 + i * 0.2, 6, { pas: 18, amp: 1.5 }); });
    R.cam(tl, sc, { x: 1500, y: 600, z: 0.9 }, 6, 5);
    // Victoire
    R.cam(tl, sc, { x: 760, y: 620, z: 1.1 }, 13, 3);
    G.exprFoule(tl, hommes, 'joie', 13);
    hommes.forEach((p, i) => R.pose(tl, p, { bA: 165, cA: 30, bR: -8 }, 13.5 + i * 0.2, 0.4));
    tl.to(femmes.map((p) => p.p), { alpha: 1, duration: 0.6, stagger: 0.3 }, 16);
    G.exprFoule(tl, femmes, 'joie', 16.5);
    G.danseFoule(tl, hommes.concat(femmes), 20, 14);
    R.cam(tl, sc, { x: 700, y: 580, z: 0.95 }, 20, 6);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 7 · L'alliance
  R.scene('L\'alliance', 34, (sc, tl) => {
    DECORS.brousse(sc, {});
    D.cailcedrat(sc.monde, 960, SOL + 6, 1);
    const chefs = G.foule(sc, [[C.ancien, null, -200, 1], [C.roi, H.notable, 2200, -1], [C.ancien, H.marabout, 2400, -1]]);
    const guerriers = archers(sc, [[C.guerrier, -400, 1], [C.filiforme, 2600, -1]]);
    sc.cam.x = 960; sc.cam.y = 600; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_alliance');
    R.marche(tl, chefs[0], 760, 1, 6);
    R.marche(tl, guerriers[0], 600, 1.3, 6);
    R.marche(tl, chefs[1], 1100, 1.2, 6);
    R.marche(tl, chefs[2], 1260, 1.5, 6);
    R.marche(tl, guerriers[1], 1420, 1.6, 6);
    G.dialogue(tl, 8, [[chefs[0], 2.5], [chefs[1], 2.5], [chefs[2], 2]]);
    R.cam(tl, sc, { x: 960, y: 660, z: 1.3 }, 8, 3);
    R.pose(tl, chefs[0], { bA: 85, cA: 0 }, 16, 0.4);
    R.pose(tl, chefs[1], { bA: 85, cA: 0 }, 16.2, 0.4);
    tl.to([chefs[0].p, chefs[1].p], { cA: 12, duration: 0.2, yoyo: true, repeat: 5 }, 16.6);
    G.exprFoule(tl, chefs.concat(guerriers), 'joie', 17);
    guerriers.forEach((p) => R.pose(tl, p, { bA: 165, cA: 30 }, 19, 0.4));
    R.cam(tl, sc, { x: 960, y: 580, z: 0.95 }, 20, 6);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 8 · Mémoire
  R.scene('Mémoire', 28, (sc, tl) => {
    DECORS.tiebele(sc, { ciel: 'soir' });
    const gens = G.foule(sc, [[C.ancien, null, 800, 1], [C.enfant, null, 980, -1], [C.fille, null, 1090, -1]]);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_memoire');
    G.dialogue(tl, 1.5, [[gens[0], 4.5]]);
    R.pose(tl, gens[0], { bR: 90, cR: 0, bA: 80, cA: 110 }, 3, 0.5);
    G.exprFoule(tl, gens.slice(1), 'surprise', 3.5);
    R.pose(tl, gens[0], { bR: -8, cR: 12, bA: 8, cA: 12 }, 6.5, 0.5);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 7, 6);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
