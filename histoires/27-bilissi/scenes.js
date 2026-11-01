/*
 * 27 · La part de Bilissi — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, COUR = 900;
  const { montrer, cacher, objet } = R;

  const COSTUMES = {
    bilissi: { haut: { type: 'boubou', couleur: '#e9c46a', motif: 'chevrons', motifCouleur: '#7a1f2a', long: 1.8 }, manches: '#e9c46a', tete: { type: 'turban', couleur: '#7a1f2a' }, collier: '#ffd166', bracelets: '#ffd166' },
    garde: { haut: { type: 'tunique', couleur: '#7a1f2a' }, bas: { type: 'short', couleur: '#e8dcc0' }, tete: { type: 'turban', couleur: '#3a2a1a' } },
    peule: { haut: { type: 'camisole', couleur: '#2f6c8f' }, bas: { type: 'jupe', couleur: '#e8dcc0', motif: 'bandes', motifCouleur: '#2f6c8f' }, collier: '#e9c46a', tete: null },
  };
  const BIL = Object.assign({}, C.roi, { hanches: 52, epaules: 40 });
  const bilissi = (sc, pose, parent) => sc.perso(BIL, COSTUMES.bilissi, Object.assign({ y: COUR }, pose), parent);
  const hamadi = (sc, pose, parent) => { const p = sc.perso(C.filiforme, H.peul, Object.assign({ y: SOL }, pose), parent); p.tenir(D.baton(200), 'R', { vertical: true }); return p; };
  /** Morceau de viande stylisé (plat), à tenir. */
  const viande = (gros) => { const g = R.el('g', {}); R.el('ellipse', { cx: 0, cy: -10, rx: 34, ry: 6, fill: '#d9b26a', stroke: '#8a6a30', 'stroke-width': 2 }, g); R.el('path', { d: gros ? 'M-24,-14 Q-26,-46 0,-50 Q28,-46 24,-14Z' : 'M-10,-14 Q-10,-28 0,-30 Q10,-28 10,-14Z', fill: '#b5543a', stroke: '#7a2a1a', 'stroke-width': 2 }, g); return g; };
  /** Piment rouge. */
  const piments = () => { const g = R.el('g', {}); for (let i = 0; i < 3; i++) R.el('path', { d: `M${-12 + i * 12},0 q4,-20 0,-30`, stroke: '#d62828', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g); return g; };

  // =================================================================== 1 · Le Macina
  R.scene('Le Macina', 26, (sc, tl) => {
    DECORS.sahel(sc, { soleil: [1500, 200, 70] });
    const zebus = [[600, 1], [850, -1], [1150, 1]].map(([x, dir]) => sc.bete(x === 850 ? B.zebuRoux : B.zebu, { x, y: SOL, dir, s: 0.9 }));
    const h = hamadi(sc, { x: 400 });
    sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    zebus.forEach((z, i) => tl.to(z.p, { tete: 30, duration: 1.2, yoyo: true, repeat: 5 }, 1 + i * 0.5));
    R.cartouche(tl, 8, 5, 'lieu_macina');
    R.marche(tl, h, 700, 9, 6);
    R.cam(tl, sc, { x: 850, y: 640, z: 1.15 }, 9, 13);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Bilissi
  R.scene('Bilissi', 34, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#7a1f2a' });
    const b = bilissi(sc, { x: 960, assis: 1 });
    const plat = R.objet(viande(true), false); b.tenir(plat, 'A', { vertical: true });
    const gardes = [[720, 1], [1200, -1]].map(([x, dir]) => { const g = sc.perso(C.guerrier, COSTUMES.garde, { x, y: COUR, dir }); g.tenir(D.lance(230), 'A', { vertical: true }); return g; });
    const servante = sc.perso(C.elancee, COSTUMES.peule, { x: -200, y: COUR });
    const platS = R.objet(viande(true), true); servante.tenir(platS, 'A', { vertical: true });
    sc.cam.x = 900; sc.cam.y = 660; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'perso_bilissi', 'droite');
    R.expr(tl, b, 'joie', 1);
    R.marche(tl, servante, 820, 2, 5);
    R.expr(tl, servante, 'peur', 6);
    G.agenouiller(tl, servante, 7.2);
    G.donner(tl, servante, platS, b, plat, 8);
    R.expr(tl, b, 'rire', 9.5);
    for (let i = 0; i < 6; i++) { R.pose(tl, b, { bA: 140, cA: 120 }, 10 + i * 0.8, 0.3); R.pose(tl, b, { bA: 40, cA: 60 }, 10.4 + i * 0.8, 0.3); }
    tl.to(b.p, { bob: -3, duration: 0.2, yoyo: true, repeat: 15 }, 10);
    R.cam(tl, sc, { x: 960, y: 720, z: 1.6 }, 10, 3);
    G.relever(tl, servante, 16);
    tl.set(servante.p, { dir: -1 }, 17);
    R.marche(tl, servante, -300, 17.2, 5);
    R.expr(tl, servante, 'triste', 17);
    R.pose(tl, b, { bA: 8, cA: 12 }, 16, 0.4);
    R.cacher(tl, plat, 16, 0.3);
    tl.to(b.p, { tete: -8, yeux: 0.6, duration: 1 }, 20);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.05 }, 20, 4);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 3 · La loi de Bilissi
  R.scene('La loi', 36, (sc, tl) => {
    DECORS.sahel(sc, {});
    const feu = D.feu(sc.monde, 960, SOL + 2, 0.9); G.flamber(tl, feu, 0, 36);
    const familles = G.foule(sc, [[C.ronde, COSTUMES.peule, 700, 1], [C.trapu, H.peul, 820, 1], [C.enfant, null, 600, 1], [C.vieille, null, 470, 1]]);
    const marmite = R.el('g', {}, sc.monde); D.canari(marmite, 960, SOL - 50, 0.8);
    const gros = R.objet(viande(true), true); familles[1].tenir(gros, 'A', { vertical: true });
    const garde = sc.perso(C.guerrier, COSTUMES.garde, { x: 2200, y: SOL, dir: -1 });
    garde.tenir(D.lance(230), 'R', { vertical: true });
    const grosG = R.objet(viande(true), false); garde.tenir(grosG, 'A', { vertical: true });
    const petit = R.objet(viande(false), false); familles[1].tenir(petit, 'R', { vertical: true });
    sc.cam.x = 900; sc.cam.y = 640; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    G.exprFoule(tl, familles, 'joie', 1);
    R.pose(tl, familles[1], { bA: 80, cA: 20 }, 2, 0.4);
    R.marche(tl, garde, 1050, 3, 6);
    R.cartouche(tl, 5, 6, 'lieu_part', 'droite');
    G.exprFoule(tl, familles, 'peur', 8);
    G.pointer(tl, garde, 9.5, 2);
    G.donner(tl, familles[1], gros, garde, grosG, 12);
    R.expr(tl, garde, 'rire', 13.5);
    tl.set(garde.p, { dir: 1 }, 15);
    R.marche(tl, garde, 2300, 15.2, 5);
    R.montrer(tl, petit, 16, 0.3);
    R.pose(tl, familles[1], { bR: 80, cR: 20 }, 16, 0.4);
    G.exprFoule(tl, familles, 'triste', 16.5);
    G.pleurer(tl, familles[2], 19, 5);
    R.cam(tl, sc, { x: 760, y: 700, z: 1.5 }, 18, 5);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 4 · Hamadi
  R.scene('Hamadi', 30, (sc, tl) => {
    DECORS.sahel(sc, { ciel: 'soir' });
    const h = hamadi(sc, { x: 600 });
    const zebu = sc.bete(B.zebu, { x: 1000, y: SOL, dir: -1, s: 0.9 });
    const enfant = sc.perso(C.enfant, null, Object.assign({ x: 780, y: SOL }, R.EXPRESSIONS.triste));
    sc.cam.x = 800; sc.cam.y = 650; sc.cam.z = 1.25;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'perso_berger');
    R.expr(tl, h, 'colere', 2);
    R.pose(tl, h, { lean: 30, bA: 70, cA: 60 }, 6, 0.5);
    R.pose(tl, h, { lean: 0, bA: 8, cA: 12 }, 9, 0.5);
    R.expr(tl, h, 'neutre', 9);
    tl.to(h.p, { tete: 15, yeux: 0.5, duration: 1 }, 11);
    // L'idée !
    const idee = D.lumiere(sc.monde, 620, 560, 10, '#fff1a8'); idee.setAttribute('opacity', 0);
    tl.to(idee, { opacity: 1, scale: 2, transformOrigin: '50% 50%', duration: 0.5, yoyo: true, repeat: 1 }, 14);
    R.expr(tl, h, 'rire', 14.3);
    tl.to(h.p, { tete: 0, yeux: 0, duration: 0.3 }, 14.3);
    R.pose(tl, h, { bA: 160, cA: 30 }, 15, 0.3);
    R.saut(tl, h, 15.5, 40);
    G.dialogue(tl, 17.5, [[h, 3]]);
    R.expr(tl, enfant, 'joie', 20);
    R.cartouche(tl, 22, 5, 'lieu_ruse', 'droite');
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 5 · La préparation
  R.scene('La préparation', 36, (sc, tl) => {
    DECORS.sahel(sc, { ciel: 'nuit', nuit: true });
    const feu = D.feu(sc.monde, 960, SOL + 2, 0.9); G.flamber(tl, feu, 0, 36);
    const h = hamadi(sc, { x: 800, assis: 1 });
    const femme = sc.perso(C.ronde, COSTUMES.peule, { x: 1150, y: SOL, dir: -1, assis: 1 });
    const gros = R.objet(viande(true), true); h.tenir(gros, 'A', { vertical: true });
    const pim = R.objet(piments(), false); femme.tenir(pim, 'A', { vertical: true });
    sc.cam.x = 960; sc.cam.y = 720; sc.cam.z = 1.6;
    R.fonduEntree(tl, 0, 1.5);
    R.pose(tl, h, { bA: 80, cA: 10 }, 2, 0.4);
    R.montrer(tl, pim, 4, 0.3);
    R.pose(tl, femme, { bA: 90, cA: 10 }, 4, 0.4);
    G.exprFoule(tl, [h, femme], 'rire', 5);
    for (let i = 0; i < 8; i++) tl.to(femme.p, { cA: i % 2 ? 10 : 60, duration: 0.25 }, 6 + i * 0.3);
    R.cacher(tl, pim, 9, 0.3);
    R.pose(tl, femme, { bA: 8, cA: 12 }, 9.5, 0.4);
    R.cam(tl, sc, { x: 900, y: 780, z: 2.2 }, 7, 3);
    // Ils couvrent le morceau de beurre doré : il paraît encore plus beau
    tl.to(gros.children[1], { attr: { fill: '#d98a3a' }, duration: 1 }, 12);
    tl.to(h.p, { tete: 10, duration: 0.25, yoyo: true, repeat: 7 }, 14);
    R.cam(tl, sc, { x: 960, y: 700, z: 1.4 }, 15, 3);
    G.dialogue(tl, 19, [[femme, 2], [h, 2.5]]);
    G.exprFoule(tl, [h, femme], 'rire', 24);
    tl.to([h.p, femme.p], { bob: -5, duration: 0.2, yoyo: true, repeat: 9 }, 24.5);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 6 · La part de Bilissi
  R.scene('La part de Bilissi', 40, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#7a1f2a' });
    const b = bilissi(sc, { x: 960, assis: 1 });
    const plat = R.objet(viande(true), false); b.tenir(plat, 'A', { vertical: true });
    const h = hamadi(sc, { x: -200, y: COUR });
    const platH = R.objet(viande(true), true); h.tenir(platH, 'A', { vertical: true });
    const gardes = [[720, 1], [1200, -1]].map(([x, dir]) => { const g = sc.perso(C.guerrier, COSTUMES.garde, { x, y: COUR, dir }); g.tenir(D.lance(230), 'A', { vertical: true }); return g; });
    const foule = G.foule(sc, [[C.ronde, COSTUMES.peule, 1400, -1], [C.trapu, H.peul, 1530, -1], [C.enfant, null, 1660, -1], [C.vieille, null, 400, 1]], COUR);
    const fumee = D.particules(sc.monde, 30, 990, 700, '#e8e2d2', 33);
    sc.cam.x = 900; sc.cam.y = 650; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_fete');
    R.marche(tl, h, 820, 1, 5);
    G.incliner(tl, h, 6.2, 1.5, 35);
    G.donner(tl, h, platH, b, plat, 8);
    R.expr(tl, b, 'rire', 9.5);
    R.pose(tl, b, { bA: 150, cA: 130 }, 10.5, 0.4);
    R.cacher(tl, plat, 11, 0.2);
    R.cam(tl, sc, { x: 960, y: 740, z: 1.9 }, 10, 2);
    // Le piment !
    R.expr(tl, b, 'surprise', 12.5, 0.1);
    tl.to(b.p, { bouche: 1, sourcilsH: 1, duration: 0.2 }, 13);
    const rouge = R.el('circle', { cx: 990, cy: 690, r: 60, fill: '#d62828', opacity: 0, filter: 'url(#flou)' }, sc.monde);
    tl.to(rouge, { opacity: 0.6, duration: 0.5 }, 13);
    [13.5, 14.2, 14.9, 15.6, 16.3].forEach((t, i) => R.jaillir(tl, fumee, t, i, { n: 6, ecart: 18, haut: 90, duree: 1 }));
    R.pose(tl, b, { assis: 0 }, 14, 0.5);
    for (let i = 0; i < 8; i++) tl.to(b.p, { x: 960 + (i % 2 ? 40 : -40), bA: i % 2 ? 160 : 40, bR: i % 2 ? 40 : 160, duration: 0.3 }, 14.5 + i * 0.35);
    R.saut(tl, b, 15, 50); R.saut(tl, b, 16.2, 50);
    R.cam(tl, sc, { x: 960, y: 640, z: 1.05 }, 15, 2);
    // Tout le monde rit
    G.exprFoule(tl, foule.concat(gardes, [h]), 'rire', 17);
    tl.to(foule.concat(gardes, [h]).map((p) => p.p), { bob: -6, duration: 0.2, yoyo: true, repeat: 19 }, 17.5);
    tl.to(rouge, { opacity: 0, duration: 3 }, 20);
    tl.set(b.p, { dir: -1 }, 22);
    R.marche(tl, b, 600, 22.2, 2, { pas: 5, amp: 1.2 });
    R.pose(tl, b, { bA: 60, cA: 120, bR: 60, cR: 120 }, 24.5, 0.4);
    R.expr(tl, b, 'triste', 25);
    R.cam(tl, sc, { x: 900, y: 700, z: 1.4 }, 26, 5);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 7 · Le partage
  R.scene('Le partage', 38, (sc, tl) => {
    DECORS.sahel(sc, {});
    const b = bilissi(sc, { x: 1500, y: SOL, dir: 1 });
    G.surLaTete(b, D.sac());
    const feu = D.feu(sc.monde, 900, SOL + 2, 0.9); G.flamber(tl, feu, 0, 38);
    const cercle = G.foule(sc, [[C.ronde, COSTUMES.peule, 700, 1], [C.trapu, H.peul, 580, 1], [C.enfant, null, 1080, -1], [C.vieille, null, 1200, -1], [C.filiforme, H.peul, 460, 1]]);
    const parts = cercle.map((p) => { const v = R.objet(viande(false), false); p.tenir(v, 'A', { vertical: true }); return v; });
    sc.cam.x = 1100; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.expr(tl, b, 'triste', 1);
    R.marche(tl, b, 2500, 1.5, 9, { pas: 12, amp: 0.7 });
    R.cam(tl, sc, { x: 1500 }, 2, 6);
    G.exprFoule(tl, cercle, 'joie', 4);
    R.cam(tl, sc, { x: 850, y: 640, z: 1.15 }, 10, 3);
    parts.forEach((v, i) => { R.montrer(tl, v, 13 + i * 0.6, 0.3); R.pose(tl, cercle[i], { bA: 80, cA: 20 }, 13 + i * 0.6, 0.4); });
    G.exprFoule(tl, cercle, 'rire', 17);
    parts.forEach((v, i) => R.pose(tl, cercle[i], { bA: 140, cA: 120 }, 19 + i * 0.3, 0.4));
    G.danseFoule(tl, cercle, 24, 10);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 8 · Le dicton
  R.scene('Le dicton', 30, (sc, tl) => {
    DECORS.sahel(sc, { ciel: 'soir', soleil: [1550, 640, 70] });
    const gens = G.foule(sc, [[C.vieille, null, 800, 1], [C.enfant, null, 960, -1], [C.fille, null, 1070, -1]]);
    sc.cam.x = 900; sc.cam.y = 640; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 8, 'lieu_fin');
    G.dialogue(tl, 2, [[gens[0], 4]]);
    G.exprFoule(tl, gens.slice(1), 'rire', 5);
    R.cam(tl, sc, { y: 540, z: 0.95 }, 8, 6);
    R.fonduSortie(tl, 15.5, 1.5);
    R.titre(tl, 17, 4, 'fin');
    R.generique(tl, 21.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
