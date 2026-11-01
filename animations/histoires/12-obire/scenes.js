/*
 * 12 · Le royaume gan d'Obiré — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 900;

  const COSTUMES = {
    roi: { haut: { type: 'boubou', couleur: '#f4f0e6', motif: 'bandes', motifCouleur: '#b23a2a', long: 1.8 }, manches: '#f4f0e6', tete: { type: 'calotte', couleur: '#b23a2a', motifCouleur: '#e9c46a' }, collier: '#e9c46a', bracelets: '#e9c46a' },
    prince: { haut: { type: 'tunique', couleur: '#5a3a6a', motif: 'chevrons', motifCouleur: '#e9c46a' }, bas: { type: 'short', couleur: '#e8dcc0' }, manches: '#5a3a6a' },
    princeRoi: { haut: { type: 'boubou', couleur: '#f4f0e6', motif: 'bandes', motifCouleur: '#b23a2a', long: 1.6 }, manches: '#f4f0e6', tete: { type: 'calotte', couleur: '#b23a2a', motifCouleur: '#e9c46a' }, collier: '#e9c46a' },
    deuil: { haut: { type: 'camisole', couleur: '#e8e2d2' }, bas: { type: 'jupe', couleur: '#e8e2d2' }, tete: { type: 'foulard', couleur: '#e8e2d2' } },
  };
  const cour = (sc, parent) => G.foule(sc, [
    [C.ancien, H.notable, 560, 1], [C.vieille, null, 420, 1], [C.trapu, H.villageois, 1380, -1],
    [C.ronde, H.villageoise, 1520, -1], [C.enfant, null, 300, 1],
  ], SOL, parent);
  const gardes = (sc, parent) => [[740, 1], [1180, -1]].map(([x, dir]) => { const g = sc.perso(C.guerrier, H.guerrier, { x, y: SOL, dir }, parent); g.tenir(D.lance(230), 'A', { vertical: true }); return g; });

  // =================================================================== 1 · Obiré
  R.scene('Obiré', 26, (sc, tl) => {
    DECORS.palais(sc, { soleil: [300, 200, 60] });
    const roi = sc.perso(C.roi, COSTUMES.roi, { x: 960, y: SOL, assis: 1 });
    roi.tenir(D.sceptre(), 'R', { vertical: true });
    gardes(sc);
    sc.cam.y = 540; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 280);
    R.cartouche(tl, 8, 5, 'lieu_obire');
    R.cam(tl, sc, { x: 960, y: 700, z: 1.4 }, 8, 14);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Le vieux roi
  R.scene('Le vieux roi', 34, (sc, tl) => {
    DECORS.palais(sc, {});
    const roi = sc.perso(C.roi, COSTUMES.roi, { x: 960, y: SOL, assis: 1 });
    roi.tenir(D.sceptre(), 'R', { vertical: true });
    gardes(sc);
    const visiteurs = G.foule(sc, [[C.trapu, H.villageois, -200, 1], [C.ronde, H.villageoise, -350, 1]]);
    const cadeau = D.calebasse(); visiteurs[0].tenir(cadeau, 'A', { vertical: true });
    sc.cam.x = 900; sc.cam.y = 660; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'perso_roi', 'droite');
    visiteurs.forEach((p, i) => R.marche(tl, p, 640 - i * 130, 1 + i * 0.3, 6));
    visiteurs.forEach((p, i) => { G.agenouiller(tl, p, 7.5 + i * 0.3); R.pose(tl, p, { tete: -20 }, 8 + i * 0.3, 0.4); });
    R.pose(tl, visiteurs[0], { bA: 80, cA: 10 }, 9.5, 0.5);
    R.parle(tl, visiteurs[0], 10, 3);
    R.expr(tl, roi, 'serein', 11);
    tl.to(roi.p, { tete: 10, duration: 0.4, yoyo: true, repeat: 1 }, 13.5);
    R.pose(tl, roi, { bA: 100, cA: 40 }, 15, 0.5);
    R.parle(tl, roi, 15, 3);
    R.cam(tl, sc, { x: 960, y: 720, z: 1.7 }, 14, 3);
    // Le roi tousse, fatigué
    tl.to(roi.p, { lean: 15, duration: 0.2, yoyo: true, repeat: 5 }, 20);
    R.expr(tl, roi, 'malade', 20);
    G.exprFoule(tl, visiteurs, 'peur', 20.5);
    R.cam(tl, sc, { x: 900, y: 660, z: 1.2 }, 23, 3);
    visiteurs.forEach((p, i) => { G.relever(tl, p, 25 + i * 0.2); tl.set(p.p, { dir: -1 }, 26.5); R.marche(tl, p, -300, 27 + i * 0.3, 5); });
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 3 · Le deuil
  R.scene('Le deuil', 32, (sc, tl) => {
    DECORS.palais(sc, { ciel: 'soir' });
    const linceul = R.el('g', { opacity: 0 }, sc.monde);
    R.el('rect', { x: 800, y: 862, width: 320, height: 34, rx: 14, fill: '#efe8d8', stroke: '#a89a7a', 'stroke-width': 3 }, linceul);
    const gens = cour(sc);
    gens.forEach((p) => { p.p.x = p.p.x < 960 ? p.p.x + 100 : p.p.x - 100; });
    const pleureuses = G.foule(sc, [[C.elancee, COSTUMES.deuil, 680, 1], [C.vieille, COSTUMES.deuil, 1250, -1]]);
    const batteur = sc.perso(C.trapu, H.villageois, { x: 1700, y: SOL, dir: -1 });
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_deuil');
    tl.to(linceul, { opacity: 1, duration: 1 }, 0.5);
    G.exprFoule(tl, gens.concat(pleureuses), 'triste', 1);
    pleureuses.forEach((p, i) => G.pleurer(tl, p, 2 + i, 12));
    gens.forEach((p, i) => R.pose(tl, p, { tete: -15 }, 2 + i * 0.2, 0.6));
    for (let i = 0; i < 30; i++) tl.to(batteur.p, { bA: i % 2 ? 60 : 110, bR: i % 2 ? 110 : 60, cA: 40, cR: 40, duration: 0.3 }, 5 + i * 0.6);
    R.cam(tl, sc, { x: 960, y: 760, z: 1.8 }, 6, 10);
    R.cam(tl, sc, { x: 1300, y: 640, z: 1.2 }, 18, 6);
    R.fonduSortie(tl, 30.5, 1.5);
  });

  // =================================================================== 4 · Les tombeaux
  R.scene('Les tombeaux', 40, (sc, tl) => {
    DECORS.bois(sc, { ciel: 'soir' });
    const tombes = [[1250, 0.9], [1550, 0.8], [1800, 0.75]].map(([x, s]) => {
      const g = R.el('g', {}, sc.monde);
      D.caseRonde(g, x, SOL, s, { couleur: '#6a4a3a' });
      D.statuette(g, x - 60 * s, SOL + 4, 0.9 * s);
      D.statuette(g, x + 60 * s, SOL + 4, 0.9 * s, 'leves');
      return g;
    });
    const cortege = [[C.ancien, H.notable], [C.guerrier, H.guerrier], [C.guerrier, H.guerrier], [C.vieille, COSTUMES.deuil], [C.elancee, COSTUMES.deuil], [C.filiforme, H.villageois]]
      .map(([def, cos], i) => sc.perso(def, cos, { x: -200 - i * 140, y: SOL }));
    const brancard = R.el('g', {}, sc.monde);
    R.el('rect', { x: -110, y: -20, width: 220, height: 26, rx: 10, fill: '#efe8d8', stroke: '#a89a7a', 'stroke-width': 3 }, brancard);
    gsap.set(brancard, { x: -340, y: SOL - 170 });
    [cortege[1], cortege[2]].forEach((p) => Object.assign(p.p, { bA: 160, cA: 20, bR: 160, cR: 20 }));
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5.5, 'lieu_tombeaux', 'droite');
    G.exprFoule(tl, cortege, 'triste', 0);
    cortege.forEach((p, i) => R.marche(tl, p, 1000 - i * 140, 1 + i * 0.3, 14, { pas: 14 }));
    tl.to(brancard, { x: 1000 - 1.5 * 140, duration: 14, ease: 'none' }, 1.3);
    R.cam(tl, sc, { x: 1200 }, 2, 14);
    G.prier(tl, cortege[0], 17, 6);
    R.parle(tl, cortege[0], 18, 4);
    const lueurs = tombes.map((t, i) => { const l = D.lumiere(sc.monde, [1250, 1550, 1800][i], 760, 10, '#cfe0ff'); l.setAttribute('opacity', 0); return l; });
    lueurs.forEach((l, i) => tl.to(l, { opacity: 0.9, scale: 2, transformOrigin: '50% 50%', duration: 1.5, yoyo: true, repeat: 1 }, 20 + i * 0.6));
    cortege.forEach((p, i) => G.incliner(tl, p, 24 + i * 0.15, 3, 35));
    tl.to(brancard, { opacity: 0, duration: 2 }, 26);
    R.cam(tl, sc, { x: 1500, y: 640, z: 1.2 }, 26, 6);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 5 · Le conseil
  R.scene('Le conseil', 40, (sc, tl) => {
    DECORS.palais(sc, {});
    const anciens = G.foule(sc, [[C.ancien, H.notable, 640, 1, 1, { assis: 1 }], [C.vieille, null, 780, 1, 1, { assis: 1 }], [C.trapu, H.notable, 1150, -1, 1, { assis: 1 }], [C.ancien, null, 1290, -1, 1, { assis: 1 }]]);
    const cauris = D.cauris(sc.monde, 960, SOL + 6, 14); gsap.set(cauris.liste, { opacity: 0 });
    const princes = [[C.guerrier, COSTUMES.prince, 1650], [C.filiforme, { haut: { type: 'tunique', couleur: '#2f6c8f' }, bas: { type: 'short', couleur: '#e8dcc0' } }, 1800], [C.trapu, { haut: { type: 'tunique', couleur: '#8a5a32' }, bas: { type: 'short', couleur: '#e8dcc0' }, tete: null }, 1950]].map(([def, cos, x]) => sc.perso(def, cos, { x, y: SOL, dir: -1 }));
    sc.cam.x = 960; sc.cam.y = 660; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5.5, 'lieu_conseil');
    G.dialogue(tl, 2, [[anciens[0], 2.5], [anciens[2], 2.5], [anciens[1], 2], [anciens[3], 2.5]]);
    R.pose(tl, anciens[1], { bA: 70, cA: 70, lean: 20 }, 13, 0.4);
    cauris.liste.forEach((c, i) => tl.fromTo(c, { opacity: 1, x: -120, y: -60 }, { x: 0, y: 0, duration: 0.5, ease: 'bounce.out', immediateRender: false }, 13.5 + i * 0.03));
    R.cam(tl, sc, { x: 960, y: 800, z: 2.2 }, 13, 2);
    G.exprFoule(tl, anciens, 'surprise', 15.5);
    R.cam(tl, sc, { x: 1300, y: 640, z: 1.05 }, 17, 3);
    // Les princes attendent ; le premier est désigné
    G.pointer(tl, anciens[1], 20, 4);
    R.expr(tl, princes[0], 'surprise', 21);
    R.cartouche(tl, 21, 5, 'perso_prince', 'droite');
    R.marche(tl, princes[0], 1400, 22, 2, { pas: 3 });
    G.agenouiller(tl, princes[0], 24.5);
    G.exprFoule(tl, princes.slice(1), 'neutre', 23);
    princes.slice(1).forEach((p, i) => G.incliner(tl, p, 25 + i * 0.3, 2, 30));
    G.exprFoule(tl, anciens, 'serein', 26);
    R.cam(tl, sc, { x: 1250, y: 680, z: 1.4 }, 26, 6);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 6 · La retraite
  R.scene('La retraite', 36, (sc, tl) => {
    DECORS.bois(sc, { ciel: 'nuit' });
    const feu = D.feu(sc.monde, 1000, SOL + 2, 0.8); G.flamber(tl, feu, 0, 36);
    const prince = sc.perso(C.guerrier, { bas: { type: 'pagne', couleur: '#efe8d8' }, ceinture: '#b23a2a' }, { x: 820, y: SOL, assis: 1 });
    D.siege(sc.monde, 820, SOL + 2, 70, 50); sc.monde.appendChild(prince.root);
    const ancetres = [[1250, 1.1], [1500, 1], [560, 1]].map(([x, s], i) => sc.perso(C.esprit, null, { x, y: SOL, s, dir: x > 900 ? -1 : 1, alpha: 0 }));
    sc.cam.x = 960; sc.cam.y = 660; sc.cam.z = 1.25;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 6, 'lieu_retraite');
    R.expr(tl, prince, 'serein', 1);
    R.pose(tl, prince, { yeux: 0.7, tete: -10 }, 3, 1);
    ancetres.forEach((a, i) => { tl.to(a.p, { alpha: 0.75, duration: 2 }, 9 + i * 1.2); R.expr(tl, a, 'serein', 9); });
    R.cam(tl, sc, { x: 1050, y: 600, z: 1 }, 9, 4);
    R.pose(tl, prince, { yeux: 0, tete: 10 }, 13, 0.6);
    R.expr(tl, prince, 'surprise', 13);
    ancetres.forEach((a, i) => R.pose(tl, a, { bA: 100, cA: 20 }, 15 + i * 0.4, 0.6));
    G.dialogue(tl, 17, [[ancetres[0], 3, false], [ancetres[1], 2.5, false]]);
    R.expr(tl, prince, 'serein', 23);
    G.incliner(tl, prince, 24, 2.5, 25);
    ancetres.forEach((a, i) => tl.to(a.p, { alpha: 0, duration: 2 }, 28 + i * 0.4));
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 7 · L'intronisation
  R.scene('L\'intronisation', 42, (sc, tl) => {
    DECORS.palais(sc, { soleil: [300, 200, 60] });
    const roi = sc.perso(C.guerrier, COSTUMES.princeRoi, { x: -200, y: SOL });
    roi.tenir(D.sceptre(), 'R', { vertical: true });
    gardes(sc);
    const gens = cour(sc);
    const batteurs = G.foule(sc, [[C.trapu, H.villageois, 500, 1], [C.colosse, H.forgeron, 1420, -1]]);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_intronisation');
    R.marche(tl, roi, 960, 1, 8);
    G.exprFoule(tl, gens, 'joie', 4);
    gens.forEach((p, i) => G.incliner(tl, p, 6 + i * 0.2, 2.5, 30));
    R.pose(tl, roi, { assis: 1 }, 9.3, 0.8);
    R.expr(tl, roi, 'serein', 9.5);
    R.cam(tl, sc, { x: 960, y: 720, z: 1.7 }, 9, 3);
    R.pose(tl, roi, { bR: 150, cR: 0 }, 12.5, 0.5);
    R.cam(tl, sc, { x: 960, y: 600, z: 0.95 }, 14, 4);
    batteurs.forEach((b, k) => { for (let i = 0; i < 40; i++) tl.to(b.p, { bA: i % 2 ? 60 : 110, bR: i % 2 ? 110 : 60, cA: 40, cR: 40, duration: 0.17 }, 15 + k * 0.08 + i * 0.2); });
    G.danseFoule(tl, gens, 16, 18);
    R.expr(tl, roi, 'joie', 20);
    R.fonduSortie(tl, 40.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 28, (sc, tl) => {
    DECORS.palais(sc, { ciel: 'soir' });
    const roi = sc.perso(C.roi, COSTUMES.roi, { x: 960, y: SOL, assis: 1 });
    roi.tenir(D.sceptre(), 'R', { vertical: true });
    const enfants = G.foule(sc, [[C.enfant, null, 700, 1], [C.fille, null, 600, 1]]);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 6, 'lieu_aujourdhui');
    enfants.forEach((p, i) => G.incliner(tl, p, 3 + i * 0.3, 2, 30));
    R.expr(tl, roi, 'joie', 4);
    G.saluer(tl, roi, 5, 2);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 7, 6);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
