/*
 * 05 · Tenin Coulibaly et la révolte de 1915 — animation (voir 00-ecriture/ecriture.md).
 * Récit historique simplifié ; violence modérée, sans sang.
 */
(function () {
  const D = R.D, C = CASTING, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;
  const { montrer, cacher, objet } = R;

  const COSTUMES = {
    garde: { haut: { type: 'tunique', couleur: '#2f3f8f', motif: 'galons', motifCouleur: '#c8323a' }, manches: '#2f3f8f', bas: { type: 'short', couleur: '#2f3f8f' }, ceinture: '#7a4a25', tete: { type: 'chechia', couleur: '#c8323a' } },
    tenin: { haut: { type: 'camisole', couleur: '#c8553d' }, bas: { type: 'jupe', couleur: '#efe0bd', motif: 'bandes', motifCouleur: '#7a4a25' }, tete: { type: 'foulard', couleur: '#e9c46a' }, ventre: true },
    cultivateur: { haut: { type: 'tunique', couleur: '#6b8f71', motif: 'bandes', motifCouleur: '#2f4a33' }, bas: { type: 'short', couleur: '#e8dcc0' }, tete: null },
    forgeron: { bas: { type: 'pagne', couleur: '#5a3a22' }, ceinture: '#2b1a0e', bracelets: '#9aa0a8' },
  };
  const fusilHaut = G.fusilHaut, tir = G.tir;
  /** Pierre à porter sur la tête. */
  const pierre = () => { const g = R.el('g', {}); R.el('path', { d: 'M-24,0 Q-28,-22 -6,-30 Q22,-32 26,-10 Q26,0 -24,0Z', fill: '#8f8478', stroke: '#5a5248', 'stroke-width': 2 }, g); return g; };
  const gardesDe = (sc, liste, parent) => G.gardes(sc, liste, SOL, parent);

  // =================================================================== 1 · Le village
  R.scene('Le village', 28, (sc, tl) => {
    DECORS.village(sc, { soleil: [300, 180, 60] });
    const tenin = sc.perso(C.elancee, COSTUMES.tenin, { x: 760, y: SOL });
    const mari = sc.perso(C.filiforme, null, { x: 930, y: SOL, dir: -1 });
    const pilon = tenin.tenir(D.pilon(170), 'A', { vertical: true });
    const mortier = D.mortier(sc.monde, 812, SOL + 2, 0.95);
    const gens = G.foule(sc, [[C.colosse, COSTUMES.forgeron, 1450, -1], [C.enfant, null, 1250, 1], [C.ronde, null, 330, 1]]);
    sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    G.piler(tl, tenin, 1, 10, 0.9, 115);
    R.expr(tl, tenin, 'joie', 2);
    R.cartouche(tl, 8, 5, 'lieu_village');
    R.marche(tl, gens[1], 1650, 3, 4, { pas: 10 });
    R.saut(tl, gens[1], 7.5, 40);
    R.cam(tl, sc, { x: 840, y: 640, z: 1.35 }, 11, 4);
    // Le mari pose la main sur le ventre de Tenin : ils attendent un enfant
    R.marche(tl, mari, 880, 13, 1, { pas: 2 });
    R.pose(tl, tenin, { bA: 40, cA: 70, bR: 30, cR: 70 }, 13, 0.6);
    R.pose(tl, mari, { bA: 60, cA: 30 }, 14.2, 0.6);
    R.expr(tl, mari, 'joie', 14.2); R.expr(tl, tenin, 'serein', 14.4);
    tl.to(mari.p, { tete: -12, duration: 0.6 }, 14.4);
    R.pose(tl, mari, { bA: 8, cA: 12, tete: 0 }, 19, 0.5);
    R.cam(tl, sc, { x: 960, y: 560, z: 0.95 }, 20, 5);
    G.piler(tl, tenin, 21, 4, 1.1, 100);
    R.fonduSortie(tl, 26.5, 1.5);
  });

  // =================================================================== 2 · La réquisition
  R.scene('La réquisition', 40, (sc, tl) => {
    const v = DECORS.village(sc, {});
    const chef = sc.perso(C.ancien, null, { x: 720, y: SOL });
    chef.tenir(D.baton(200), 'R', { vertical: true });
    const villageois = G.foule(sc, [[C.colosse, COSTUMES.forgeron, 520, 1], [C.trapu, COSTUMES.cultivateur, 400, 1], [C.filiforme, null, 300, 1], [C.elancee, COSTUMES.tenin, 160, 1], [C.ronde, null, 40, 1]]);
    const cmd = sc.perso(C.europeen, null, { x: 2200, y: SOL, dir: -1 });
    const gardes = gardesDe(sc, [[2350, -1], [2480, -1]]);
    const sacs = gardes.map((g) => { const s = objet(D.sac(), false); g.tenir(s, 'A', { vertical: true }); return s; });
    sc.cam.x = 900; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, cmd, 1050, 1, 6.5);
    gardes.forEach((g, i) => R.marche(tl, g, 1250 + i * 150, 1.3 + i * 0.2, 6.5));
    R.cartouche(tl, 4, 4.5, 'perso_commandant', 'droite');
    G.exprFoule(tl, villageois, 'peur', 5);
    R.cam(tl, sc, { x: 980, y: 620, z: 1.15 }, 6, 3);
    G.incliner(tl, chef, 8, 1.5, 25);
    G.dialogue(tl, 10, [[cmd, 3], [chef, 2.5], [cmd, 3]]);
    G.pointer(tl, cmd, 13.5, 2);
    R.expr(tl, chef, 'triste', 14);
    R.cartouche(tl, 19, 4, 'perso_gardes', 'droite');
    // Les gardes prennent le mil et emmènent des hommes
    gardes.forEach((g, i) => { tl.set(g.p, { dir: 1 }, 19.5); R.marche(tl, g, 1400 + i * 30, 19.6, 1.5, { pas: 3 }); });
    R.pose(tl, gardes[0], { lean: 30, bA: 60 }, 21.3, 0.5);
    montrer(tl, sacs[0], 21.8); montrer(tl, sacs[1], 22.2);
    R.pose(tl, gardes[0], { lean: 0, bA: 70, cA: 40 }, 22.3, 0.5);
    gardes.forEach((g, i) => { tl.set(g.p, { dir: -1 }, 23); R.marche(tl, g, 700 - i * 60, 23.2, 4); });
    R.cam(tl, sc, { x: 700 }, 23, 4);
    tl.to(villageois[0].p, { x: 470, lean: -10, duration: 0.4 }, 27.4);
    R.expr(tl, villageois[0], 'colere', 27.4);
    G.frapper(tl, gardes[0], villageois[1], 27.8);
    R.pose(tl, villageois[1], { bA: 60, cA: 100 }, 28.4, 0.3);
    // Trois hommes partent, encadrés
    [villageois[0], villageois[1], villageois[2]].forEach((p, i) => { tl.set(p.p, { dir: 1 }, 30); R.expr(tl, p, 'triste', 30); R.marche(tl, p, 2300 + i * 120, 30.3 + i * 0.3, 8); });
    gardes.forEach((g, i) => { tl.set(g.p, { dir: 1 }, 30.5); R.marche(tl, g, 2500 + i * 120, 31 + i * 0.3, 8); });
    tl.set(cmd.p, { dir: 1 }, 30.5); R.marche(tl, cmd, 2600, 31.5, 7);
    G.pleurer(tl, villageois[4], 32, 5);
    R.expr(tl, villageois[3], 'triste', 31);
    R.cam(tl, sc, { x: 800, z: 1.3, y: 650 }, 33, 5);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 3 · Le chantier
  R.scene('Le chantier', 35, (sc, tl) => {
    DECORS.poste(sc, { soleil: [400, 150, 90] });
    const ouvriers = G.foule(sc, [[C.colosse, COSTUMES.forgeron, -200, 1], [C.trapu, COSTUMES.cultivateur, -420, 1], [C.filiforme, null, -640, 1], [C.trapu, { haut: { type: 'tunique', couleur: '#b9713d' }, tete: null }, -860, 1]]);
    ouvriers.forEach((p) => G.surLaTete(p, pierre()));
    ouvriers.forEach((p) => Object.assign(p.p, { bA: 160, cA: 30, bR: 160, cR: 30 }));
    const garde = gardesDe(sc, [[760, -1]])[0];
    const chicotte = objet(D.baton(130, '#4d2c14'), true);
    garde.tenir(chicotte, 'A', { vertical: true });
    const cmd = sc.perso(C.europeen, null, { x: 1480, y: SOL, dir: -1 });
    sc.cam.x = 760; sc.cam.y = 600; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.6, 4.5, 'lieu_chantier');
    ouvriers.forEach((p, i) => { R.expr(tl, p, 'triste', 0); R.marche(tl, p, 1250 - i * 150, 1 + i * 0.5, 14, { pas: 12, amp: 0.7 }); });
    G.dialogue(tl, 3, [[garde, 2.5], [garde, 2.5]]);
    R.pose(tl, garde, { bA: 150, cA: 20 }, 4, 0.3);
    R.pose(tl, garde, { bA: 8, cA: 12 }, 8, 0.3);
    R.cam(tl, sc, { x: 980 }, 2, 12);
    // Un homme s'effondre sous la chaleur
    tl.to(ouvriers[3].p, { rot: 70, x: '+=40', duration: 0.6, ease: 'power2.in' }, 16);
    R.expr(tl, ouvriers[3], 'douleur', 16);
    tl.set(ouvriers[2].p, { dir: -1 }, 16.8);
    R.pose(tl, ouvriers[2], { lean: 40, bA: 60, cA: 30, bR: 60, cR: 30 }, 17, 0.6);
    tl.set(garde.p, { dir: 1 }, 17.5);
    R.marche(tl, garde, 870, 17.6, 1.2, { pas: 2 });
    R.parle(tl, garde, 19, 2.5);
    R.pose(tl, garde, { bA: 150, cA: 20 }, 19.2, 0.3);
    R.expr(tl, garde, 'colere', 19);
    tl.to(ouvriers[3].p, { rot: 0, x: '-=40', duration: 1 }, 21.5);
    R.pose(tl, ouvriers[2], { lean: 0, bA: 160, cA: 30, bR: 160, cR: 30 }, 22, 0.6);
    R.pose(tl, garde, { bA: 8, cA: 12 }, 22, 0.4);
    R.cam(tl, sc, { x: 1250, y: 640, z: 1.3 }, 22, 4);
    R.expr(tl, cmd, 'neutre', 23);
    tl.to(cmd.p, { tete: -10, duration: 0.5 }, 24);
    R.cam(tl, sc, { x: 1000, y: 600, z: 1.05 }, 28, 4);
    R.fonduSortie(tl, 33.5, 1.5);
  });

  // =================================================================== 4 · Tenin
  R.scene('Tenin', 40, (sc, tl) => {
    // 4a · au village (0–20)
    const ga = R.plan(sc, tl, 0, 20);
    DECORS.cour(ga.sous, { grenierX: 1580 });
    const tenin = sc.perso(C.elancee, COSTUMES.tenin, { x: 760, y: 900 }, ga);
    const mari = sc.perso(C.filiforme, null, { x: 620, y: 900 }, ga);
    const gardes = gardesDe(sc, [[2100, -1], [2250, -1]], ga);
    gardes.forEach((g) => (g.p.y = 900));
    tl.set(sc.cam, { x: 900, y: 650, z: 1.2 }, 0);
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 5, 'perso_tenin');
    R.pose(tl, tenin, { bA: 40, cA: 70, bR: 30, cR: 70 }, 0.5, 0.5);
    gardes.forEach((g, i) => R.marche(tl, g, 1050 + i * 140, 1.5 + i * 0.2, 5));
    R.expr(tl, tenin, 'peur', 5.5); R.expr(tl, mari, 'surprise', 5.5);
    G.pointer(tl, gardes[0], 7, 2);
    R.parle(tl, gardes[0], 7, 2.5);
    // Le mari s'interpose
    R.marche(tl, mari, 900, 9.5, 1.2, { pas: 2 });
    R.expr(tl, mari, 'colere', 10);
    G.dialogue(tl, 10.8, [[mari, 2.2], [gardes[0], 1.5]]);
    G.frapper(tl, gardes[0], mari, 15);
    G.tomber(tl, mari, 15.6, -1);
    R.expr(tl, tenin, 'peur', 15.6);
    R.pose(tl, tenin, { bA: 70, cA: 120, bR: 70, cR: 120 }, 15.7, 0.3);
    tl.set(tenin.p, { dir: 1 }, 17.5);
    R.marche(tl, tenin, 1300, 17.6, 2.5, { pas: 4 });
    gardes.forEach((g, i) => { tl.set(g.p, { dir: 1 }, 17.6); R.marche(tl, g, 1500 + i * 120, 17.8, 2.5); });
    R.fonduSortie(tl, 19.4, 0.6);
    // 4b · au chantier (20–40)
    const gb = R.plan(sc, tl, 20);
    DECORS.poste(gb.sous, { soleil: [400, 150, 90] });
    const t2 = sc.perso(C.elancee, COSTUMES.tenin, Object.assign({ x: 300, y: SOL, bA: 160, cA: 30, bR: 40, cR: 80 }, R.EXPRESSIONS.douleur), gb);
    G.surLaTete(t2, pierre());
    const forgeron = sc.perso(C.colosse, COSTUMES.forgeron, { x: 1000, y: SOL, dir: -1 }, gb);
    const g2 = gardesDe(sc, [[1300, -1]], gb)[0];
    tl.set(sc.cam, { x: 600, y: 640, z: 1.25 }, 20);
    R.fonduEntree(tl, 20, 0.6);
    R.marche(tl, t2, 640, 20.5, 7, { pas: 6, amp: 0.6 });
    tl.to(t2.p, { lean: 12, duration: 0.5, yoyo: true, repeat: 5 }, 21);
    R.cam(tl, sc, { x: 640, y: 680, z: 1.6 }, 24, 3);
    // Elle s'effondre ; un homme veut l'aider, le garde l'en empêche
    G.agenouiller(tl, t2, 28);
    R.pose(tl, t2, { bA: 40, cA: 80, bR: 40, cR: 80 }, 28, 0.6);
    tl.to(t2.p, { yeux: 0.7, duration: 0.5 }, 29);
    R.marche(tl, forgeron, 780, 29, 1.2, { pas: 2 });
    R.expr(tl, forgeron, 'colere', 29);
    R.marche(tl, g2, 900, 29.4, 1, { pas: 2 });
    R.pose(tl, g2, { bA: 90, cA: 0 }, 30.5, 0.3);
    R.parle(tl, g2, 30.6, 2);
    R.cam(tl, sc, { x: 760, y: 640, z: 1.25 }, 30, 2);
    R.pose(tl, forgeron, { lean: -8 }, 31, 0.4);
    tl.to(forgeron.p, { bob: 2, duration: 0.3, yoyo: true, repeat: 7 }, 32);
    R.cam(tl, sc, { x: 700, y: 650, z: 1.5 }, 34, 4);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 5 · La nuit
  R.scene('La nuit', 40, (sc, tl) => {
    DECORS.village(sc, { ciel: 'nuit', nuit: true });
    const feu = D.feu(sc.monde, 960, SOL + 2, 1.2);
    G.flamber(tl, feu, 0, 40);
    const cercle = G.foule(sc, [
      [C.ancien, null, 700, 1], [C.colosse, COSTUMES.forgeron, 1220, -1], [C.filiforme, null, 1360, -1],
      [C.ronde, null, 560, 1], [C.trapu, COSTUMES.cultivateur, 1500, -1], [C.vieille, null, 430, 1],
    ]);
    cercle[0].tenir(D.baton(200), 'R', { vertical: true });
    const tambour = D.tambour(sc.monde, 1680, SOL + 2, 1);
    const tambourinaire = sc.perso(C.enfant, { haut: { type: 'tunique', couleur: '#b9713d' } }, { x: 1620, y: SOL, s: 1.3 });
    const coureurs = [0, 1, 2].map((i) => { const p = sc.perso(C.filiforme, { haut: { type: 'tunique', couleur: '#e8dcc0' } }, { x: 1300, y: SOL, alpha: 0 }); p.tenir(D.torche(), 'A', { vertical: true }); return p; });
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 4.5, 'lieu_nuit');
    G.exprFoule(tl, cercle, 'triste', 1);
    G.dialogue(tl, 3, [[cercle[0], 3], [cercle[2], 2.5], [cercle[3], 2.5]]);
    R.cam(tl, sc, { x: 800, y: 660, z: 1.5 }, 3, 4);
    // Le forgeron se lève : « Assez ! »
    R.cam(tl, sc, { x: 1150, y: 640, z: 1.4 }, 11.5, 2);
    R.expr(tl, cercle[1], 'colere', 12);
    R.pose(tl, cercle[1], { bA: 165, cA: 60 }, 12.5, 0.4);
    R.parle(tl, cercle[1], 12.5, 3);
    G.exprFoule(tl, [cercle[2], cercle[4]], 'colere', 14);
    R.pose(tl, cercle[4], { bA: 165, cA: 60 }, 14.5, 0.4);
    R.cam(tl, sc, { x: 960, y: 600, z: 1.05 }, 16.5, 2);
    // Les tambours parlent ; l'Ancien donne son accord
    G.prier(tl, cercle[0], 17, 3);
    for (let i = 0; i < 24; i++) tl.to(tambourinaire.p, { bA: i % 2 ? 60 : 110, bR: i % 2 ? 110 : 60, cA: 40, cR: 40, duration: 0.18 }, 19 + i * 0.2);
    const ondes = R.el('g', {}, sc.monde);
    for (let i = 0; i < 4; i++) {
      const c = R.el('ellipse', { cx: 1680, cy: 790, rx: 30, ry: 20, fill: 'none', stroke: '#ffd166', 'stroke-width': 3, opacity: 0 }, ondes);
      tl.fromTo(c, { attr: { rx: 30, ry: 20 }, opacity: 0.8 }, { attr: { rx: 400, ry: 250 }, opacity: 0, duration: 1.5, repeat: 2, immediateRender: false }, 19.2 + i * 0.4);
    }
    R.cam(tl, sc, { x: 1300, y: 600, z: 1.2 }, 19, 3);
    // Des messagers partent vers les autres villages
    coureurs.forEach((p, i) => {
      tl.set(p.p, { alpha: 1, dir: i === 1 ? -1 : 1 }, 25 + i * 0.6);
      R.marche(tl, p, i === 1 ? -400 : 2400, 25 + i * 0.6, 6, { pas: 16, amp: 1.3 });
    });
    R.cam(tl, sc, { x: 960, y: 560, z: 0.9 }, 25, 6);
    G.exprFoule(tl, cercle, 'colere', 28);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 6 · Le soulèvement
  R.scene('Le soulèvement', 45, (sc, tl) => {
    const d = DECORS.poste(sc, { ciel: 'soir', soleil: [300, 700, 70] });
    const tenin = sc.perso(C.elancee, COSTUMES.tenin, Object.assign({ x: 1050, y: SOL, assis: 0.75, lean: 15 }, R.EXPRESSIONS.triste));
    const gardes = gardesDe(sc, [[1200, -1], [1350, -1], [900, -1]]);
    const cmd = sc.perso(C.europeen, null, { x: 1550, y: SOL, dir: -1 });
    const insurges = G.foule(sc, [
      [C.colosse, COSTUMES.forgeron, -300, 1], [C.filiforme, null, -450, 1], [C.trapu, COSTUMES.cultivateur, -600, 1],
      [C.guerrier, { haut: { type: 'tunique', couleur: '#8a5a32' }, bas: { type: 'short', couleur: '#e8dcc0' } }, -750, 1], [C.trapu, { haut: { type: 'tunique', couleur: '#b9713d' }, tete: null }, -900, 1],
    ]);
    insurges[0].tenir(D.baton(200), 'A', { vertical: true });
    insurges.slice(1).forEach((p) => p.tenir(D.arc(), 'R', { vertical: true }));
    sc.cam.x = 1150; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 5, 'lieu_revolte');
    gardes.forEach((g, i) => tl.to(g.p, { tete: i % 2 ? 6 : -6, duration: 1.5, yoyo: true, repeat: 1 }, 1));
    // Les insurgés arrivent
    insurges.forEach((p, i) => { R.expr(tl, p, 'colere', 3); R.marche(tl, p, 520 - i * 110, 3 + i * 0.3, 5); });
    R.cam(tl, sc, { x: 760, z: 0.9, y: 580 }, 3, 4);
    G.peurFoule(tl, gardes, 7.5);
    R.expr(tl, cmd, 'surprise', 7.6);
    // Échange de tirs : flèches, fumée
    G.tirer(tl, insurges[1], sc.monde, 9, 1180, 640, 0.5);
    G.tirer(tl, insurges[3], sc.monde, 9.6, 1330, 600, 0.6);
    G.epauler(tl, gardes[1], 10, 6); G.epauler(tl, gardes[0], 10.4, 5.5);
    tir(tl, sc.monde, 1260, 700, 10.8);
    tir(tl, sc.monde, 1110, 690, 11.6);
    G.tirer(tl, insurges[2], sc.monde, 11.5, 960, 650, 0.5);
    R.secousse(tl, sc, 10.8, 8, 0.3);
    R.cam(tl, sc, { x: 960, z: 0.95, y: 600 }, 10, 2);
    // Le forgeron charge, les gardes s'enfuient
    R.marche(tl, insurges[0], 830, 13, 1.5, { pas: 4, amp: 1.3 });
    G.frapper(tl, insurges[0], gardes[2], 14.6, { recul: 60 });
    G.tomber(tl, gardes[2], 15.2, 1, 2.5);
    gardes.forEach((g, i) => { tl.set(g.p, { dir: 1 }, 18 + i * 0.2); R.marche(tl, g, 2500 + i * 100, 18.2 + i * 0.2, 5, { pas: 12, amp: 1.3 }); });
    tl.set(cmd.p, { dir: 1 }, 18.5);
    R.marche(tl, cmd, 1650, 18.6, 1.2, { pas: 3 });
    tl.to(cmd.p, { alpha: 0, duration: 0.4 }, 19.8);
    insurges.slice(1).forEach((p, i) => R.marche(tl, p, 700 + i * 90, 17 + i * 0.2, 3));
    R.cam(tl, sc, { x: 1100, z: 1.05, y: 600 }, 18, 4);
    // Tenin est libérée
    R.marche(tl, insurges[1], 1000, 23, 1.5, { pas: 3 });
    R.pose(tl, insurges[1], { bA: 70, cA: 10, lean: 20 }, 24.6, 0.5);
    G.relever(tl, tenin, 25.3, 1.2);
    R.expr(tl, tenin, 'joie', 26.5);
    R.expr(tl, insurges[1], 'joie', 26.5);
    R.pose(tl, insurges[1], { lean: 0, bA: 60, cA: 70 }, 26.6, 0.5);
    R.pose(tl, tenin, { bA: 60, cA: 70 }, 26.8, 0.5);
    R.cam(tl, sc, { x: 1020, y: 660, z: 1.6 }, 25, 4);
    G.exprFoule(tl, insurges, 'joie', 30);
    insurges.forEach((p, i) => { if (i !== 1) R.pose(tl, p, { bA: 165, cA: 30 }, 31 + i * 0.15, 0.4); });
    R.cam(tl, sc, { x: 900, z: 0.95, y: 580 }, 31, 5);
    R.fonduSortie(tl, 43.5, 1.5);
  });

  // =================================================================== 7 · La guerre et la répression
  R.scene('La guerre', 35, (sc, tl) => {
    // 7a · les villages se soulèvent (0–16) : silhouettes de villages et torches
    const ga = R.plan(sc, tl, 0, 16);
    const fa = ga.sous.calque();
    D.ciel(fa, '#1a1430', '#8a3a2a');
    D.collines(fa, 760, '#2a1d2a', 7, 60);
    D.sol(fa, 880, '#2a1d1a');
    const lueurs = [];
    for (let i = 0; i < 7; i++) {
      const x = -200 + i * 360, y = 800 + (i % 2) * 40;
      D.maison(fa, x, y, 160, 90, { couleur: '#3a2a26' });
      const l = R.el('circle', { cx: x + 60, cy: y - 120, r: 50, fill: '#ff9a3c', opacity: 0, filter: 'url(#flou)' }, fa);
      lueurs.push(l);
    }
    tl.set(sc.cam, { x: 960, y: 560, z: 0.95 }, 0);
    R.fonduEntree(tl, 0, 1);
    lueurs.forEach((l, i) => { tl.to(l, { opacity: 0.85, duration: 0.8 }, 1.5 + i * 0.9); tl.to(l, { opacity: 0.5, duration: 0.4, yoyo: true, repeat: 8 }, 2.4 + i * 0.9); });
    R.cam(tl, sc, { x: 1200, z: 1.05 }, 1, 12);
    R.fonduSortie(tl, 15.4, 0.6);
    // 7b · les colonnes (16–35)
    const gb = R.plan(sc, tl, 16);
    DECORS.brousse(gb.sous, { ciel: 'orage' });
    const colonne = [];
    for (let i = 0; i < 8; i++) {
      const s = sc.perso(C.guerrier, COSTUMES.garde, { x: 2200 + i * 130, y: SOL, dir: -1 }, gb);
      s.tenir(fusilHaut(), 'R', { vertical: true });
      colonne.push(s);
    }
    const fumees = [0, 1, 2].map((i) => D.fumee(gb, 300 + i * 260, 780, 14));
    tl.set(sc.cam, { x: 960, y: 560, z: 0.95 }, 16);
    R.fonduEntree(tl, 16, 0.8);
    R.cartouche(tl, 16.5, 6, 'lieu_repression');
    colonne.forEach((s, i) => R.marche(tl, s, 700 + i * 130, 16.5, 12, { pas: 18 }));
    fumees.forEach((f, i) => [18, 20, 22, 24, 26, 28].forEach((t, k) => R.jaillir(tl, f, t + i * 0.4, k, { n: 5, ecart: 20, haut: 160, duree: 2.5 })));
    R.cam(tl, sc, { x: 760, z: 1.05 }, 20, 12);
    R.fonduSortie(tl, 33, 2);
  });

  // =================================================================== 8 · Mémoire
  R.scene('Mémoire', 27, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir' });
    const conteuse = sc.perso(C.vieille, null, { x: 760, y: SOL, assis: 1 });
    D.siege(sc.monde, 760, SOL + 2, 80, 50);
    sc.monde.appendChild(conteuse.root);
    const enfants = G.foule(sc, [[C.enfant, null, 960, -1, 1, { assis: 1 }], [C.fille, null, 1080, -1, 1, { assis: 1 }], [C.enfant, { haut: { type: 'tunique', couleur: '#5b8c5a' }, bas: { type: 'short', couleur: '#e8dcc0' } }, 1200, -1, 1, { assis: 1 }]]);
    sc.cam.x = 960; sc.cam.y = 680; sc.cam.z = 1.35;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_memoire');
    G.dialogue(tl, 1.5, [[conteuse, 3], [conteuse, 3]]);
    R.pose(tl, conteuse, { bA: 150, cA: 60 }, 8, 0.5);
    R.expr(tl, conteuse, 'serein', 8);
    G.exprFoule(tl, enfants, 'surprise', 3);
    G.exprFoule(tl, enfants, 'serein', 9);
    R.cam(tl, sc, { z: 1.1, y: 600 }, 9, 4);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 7.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
