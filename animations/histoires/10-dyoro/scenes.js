/*
 * 10 · Le Dyoro, la traversée — animation (voir 00-ecriture/ecriture.md).
 * Rien du rite secret n'est montré : seulement la traversée légendaire et un passage symbolique.
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, SURFACE = 860;

  const COSTUMES = {
    ancetre: { bas: { type: 'pagne', couleur: '#8a6a40' }, ceinture: '#3a2a1a', collier: '#efe6cf', tete: null },
    ancetreF: { haut: { type: 'camisole', couleur: '#a08060' }, bas: { type: 'jupe', couleur: '#a08060' } },
    doyen: { haut: { type: 'boubou', couleur: '#d8c8a0', motif: 'bandes', motifCouleur: '#6a4a2a', long: 1.5 }, manches: '#d8c8a0', tete: { type: 'bonnet', couleur: '#6a4a2a' } },
    initie: { haut: { type: 'tunique', couleur: '#e8e2d2', motif: 'points', motifCouleur: '#ffffff' }, bas: { type: 'short', couleur: '#efe6cf' }, tete: null, collier: '#efe6cf' },
  };
  const PEUPLE = [[C.ancien, COSTUMES.doyen], [C.colosse, COSTUMES.ancetre], [C.ronde, COSTUMES.ancetreF], [C.enfant, COSTUMES.ancetre], [C.trapu, COSTUMES.ancetre], [C.elancee, COSTUMES.ancetreF], [C.vieille, COSTUMES.ancetreF]];
  const peuple = (sc, xs, y, dir, parent) => PEUPLE.map(([def, cos], i) => sc.perso(def, cos, { x: xs[i], y: y || SOL, dir: dir || 1 }, parent));
  /** Groupe dont tout ce qui est sous la surface de l'eau est caché ; voile d'eau à poser ensuite. */
  function dansLEau(parent) {
    const cid = R.id('eau');
    R.el('rect', { x: -3000, y: -4000, width: 8000, height: 4000 + SURFACE }, R.el('clipPath', { id: cid }, R.defs));
    return R.el('g', { 'clip-path': `url(#${cid})` }, parent);
  }
  function voileEau(parent) {
    const g = R.el('g', {}, parent);
    R.el('rect', { x: -1000, y: SURFACE, width: 3920, height: 600, fill: '#2f6c8f', opacity: 0.55 }, g);
    for (let i = 0; i < 18; i++) R.el('path', { d: `M${-900 + i * 220},${SURFACE + 2} q30,-8 60,0`, stroke: '#cfe8f1', 'stroke-width': 3, fill: 'none', opacity: 0.8 }, g);
    return g;
  }

  // =================================================================== 1 · Le fleuve
  R.scene('Le fleuve', 26, (sc, tl) => {
    const d = DECORS.riviere(sc, { ciel: 'soir', soleil: [1500, 640, 70] });
    sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 2);
    R.titre(tl, 1.5, 7, 'titre', 'sous_titre', 300);
    tl.to(d.vagues, { x: 60, duration: 4, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0);
    R.cam(tl, sc, { x: 1100, y: 620, z: 1.1 }, 2, 20);
    R.fonduSortie(tl, 24, 2);
  });

  // =================================================================== 2 · L'exil
  R.scene('L\'exil', 36, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'chaud' });
    const gens = peuple(sc, [700, 860, 560, 980, 1100, 430, 300]);
    gens.forEach((p) => Object.assign(p.p, R.EXPRESSIONS.triste));
    sc.cam.x = 760; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 5, 'lieu_rive_est');
    R.pose(tl, gens[4], { lean: 40, bA: 40 }, 2, 0.6);
    tl.to(gens[4].p, { cA: 60, duration: 0.3, yoyo: true, repeat: 5 }, 2.6);
    R.pose(tl, gens[4], { lean: 0, bA: 140, cA: 30 }, 6, 0.5);
    G.pleurer(tl, gens[2], 5, 4);
    G.dialogue(tl, 10, [[gens[1], 2.5], [gens[0], 3], [gens[6], 2]]);
    R.cartouche(tl, 11, 4, 'perso_doyen', 'droite');
    G.pointer(tl, gens[0], 15, 4);
    gens.forEach((p, i) => R.pose(tl, p, { tete: 6 }, 15.5 + i * 0.1, 0.4));
    G.exprFoule(tl, gens, 'neutre', 18);
    gens[0].tenir(D.baton(200), 'R', { vertical: true });
    G.surLaTete(gens[2], D.sac()); G.surLaTete(gens[5], D.canari(null, 0, 0, 0.5));
    gens.forEach((p, i) => R.marche(tl, p, 2300 + i * 110, 21 + i * 0.3, 11, { pas: 14 }));
    R.cam(tl, sc, { x: 1300 }, 21, 12);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 3 · Les crocodiles
  R.scene('Les crocodiles', 40, (sc, tl) => {
    DECORS.riviere(sc, {});
    const gens = peuple(sc, [700, 560, 820, 930, 430, 1040, 310]);
    const eau = dansLEau(sc.monde);
    const crocos = [[1350, 900, 1], [1650, 960, -1], [1100, 1010, 1]].map(([x, y, dir]) => sc.bete(B.crocodile, { x, y, s: 0.9, dir, alpha: 0 }, eau));
    voileEau(sc.monde);
    sc.cam.x = 900; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 4.5, 'lieu_fleuve');
    G.exprFoule(tl, gens, 'surprise', 2);
    gens.forEach((p, i) => R.pose(tl, p, { tete: 8 }, 2 + i * 0.1, 0.4));
    R.cam(tl, sc, { x: 1300, y: 640, z: 1 }, 5, 4);
    crocos.forEach((c, i) => { tl.to(c.p, { alpha: 1, duration: 1 }, 7 + i * 1.2); tl.to(c.p, { x: `+=${c.p.dir * 120}`, marcheAmp: 0.8, duration: 4, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 7 + i * 1.2); });
    [12, 16, 20].forEach((t, i) => tl.to(crocos[i].p, { gueule: 1, duration: 0.3, yoyo: true, repeat: 1 }, t));
    G.peurFoule(tl, gens, 12.3);
    R.cam(tl, sc, { x: 800, y: 640, z: 1.25 }, 13, 3);
    G.pleurer(tl, gens[3], 17, 4);
    // Le doyen s'avance au bord de l'eau
    R.marche(tl, gens[0], 900, 22, 2, { pas: 3 });
    R.expr(tl, gens[0], 'serein', 23);
    G.agenouiller(tl, gens[0], 25);
    G.prier(tl, gens[0], 26, 10);
    R.parle(tl, gens[0], 27, 6);
    R.cam(tl, sc, { x: 950, y: 600, z: 1.1 }, 25, 5);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 4 · La traversée
  R.scene('La traversée', 45, (sc, tl) => {
    const d = DECORS.riviere(sc, { riveProche: false, ciel: 'soir' });
    const eau = dansLEau(sc.monde);
    const gens = PEUPLE.map(([def, cos], i) => sc.perso(def, cos, { x: -150 - i * 130, y: SOL + 70, dir: 1 }, eau));
    gens.forEach((p, i) => { if (i) Object.assign(p.p, { bA: 85, cA: 0, bR: 85, cR: 0 }); });
    const crocos = [[900, 905, -1], [1400, 900, 1]].map(([x, y, dir]) => sc.bete(B.crocodile, { x, y, s: 0.9, dir }, eau));
    voileEau(sc.monde);
    const lumiere = D.lumiere(sc.monde, 960, 380, 30, '#ffe7a3'); lumiere.setAttribute('opacity', 0);
    sc.cam.x = 700; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    // Un signe : la lumière se pose sur l'eau, les vagues se calment
    tl.to(lumiere, { opacity: 1, scale: 2, transformOrigin: '50% 50%', duration: 2 }, 0.5);
    tl.to(lumiere, { y: 420, opacity: 0, duration: 3 }, 3);
    tl.to(d.vagues, { opacity: 0.2, duration: 3 }, 3);
    // La file traverse, main dans la main ; l'enfant porté
    gens.forEach((p, i) => R.marche(tl, p, 1900 - i * 130, 3 + i * 0.3, 26, { pas: 22, amp: 0.6 }));
    R.expr(tl, gens[3], 'peur', 6);
    G.exprFoule(tl, gens.filter((p, i) => i !== 3), 'serein', 5);
    R.cam(tl, sc, { x: 1200, y: 640, z: 1 }, 4, 26);
    // Les crocodiles regardent passer sans attaquer
    crocos.forEach((c, i) => { tl.to(c.p, { tete: -8, duration: 0.6, yoyo: true, repeat: 3 }, 10 + i * 4); tl.to(c.p, { x: `+=${c.p.dir * -200}`, marcheAmp: 0.6, duration: 6 }, 14 + i * 3); });
    R.expr(tl, gens[3], 'surprise', 16);
    R.expr(tl, gens[3], 'joie', 20);
    R.fonduSortie(tl, 43.5, 1.5);
  });

  // =================================================================== 5 · La rive ouest
  R.scene('La rive ouest', 30, (sc, tl) => {
    DECORS.riviere(sc, { soleil: [400, 220, 60] });
    const gens = peuple(sc, [-200, -330, -460, -590, -720, -850, -980]);
    sc.cam.x = 960; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    gens.forEach((p, i) => R.marche(tl, p, 1300 - i * 120, 0.5 + i * 0.2, 6, { pas: 8 }));
    R.cartouche(tl, 3, 5, 'lieu_rive_ouest');
    G.exprFoule(tl, gens, 'joie', 7);
    gens.forEach((p, i) => { tl.set(p.p, { dir: -1 }, 8 + i * 0.1); });
    G.agenouiller(tl, gens[0], 9);
    gens.slice(1).forEach((p, i) => G.incliner(tl, p, 9.5 + i * 0.15, 3, 30));
    G.prier(tl, gens[0], 10, 6);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.2 }, 9, 6);
    G.danseFoule(tl, gens.slice(1), 17, 9);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 6 · Le Dyoro
  R.scene('Le passage des jeunes', 40, (sc, tl) => {
    const ga = R.plan(sc, tl, 0, 18);
    DECORS.village(ga.sous, { ciel: 'soir' });
    const initiés = [[C.filiforme, 1000], [C.guerrier, 860], [C.trapu, 720], [C.filiforme, 580]].map(([def, x]) => sc.perso(def, COSTUMES.initie, { x, y: SOL, dir: 1 }, ga));
    const guide = sc.perso(C.ancien, COSTUMES.doyen, { x: 1160, y: SOL }, ga);
    guide.tenir(D.baton(200), 'R', { vertical: true });
    const meres = G.foule(sc, [[C.ronde, H.villageoise, 300, 1], [C.vieille, null, 170, 1]], SOL, ga);
    tl.set(sc.cam, { x: 860, y: 620, z: 1.1 }, 0);
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 6, 'lieu_dyoro');
    G.exprFoule(tl, initiés, 'serein', 1);
    G.saluer(tl, meres[0], 3, 3);
    [guide].concat(initiés).forEach((p, i) => R.marche(tl, p, 2400 + i * -130, 6 + i * 0.4, 10, { pas: 14 }));
    R.cam(tl, sc, { x: 1300 }, 6, 10);
    R.fonduSortie(tl, 17.4, 0.6);
    // Au fleuve : ils marchent dans l'eau en silence, comme les ancêtres
    const gb = R.plan(sc, tl, 18);
    DECORS.riviere(gb.sous, { riveProche: false, ciel: 'soir' });
    const eau = dansLEau(gb);
    const file = [[C.ancien, COSTUMES.doyen], [C.filiforme, COSTUMES.initie], [C.guerrier, COSTUMES.initie], [C.trapu, COSTUMES.initie], [C.filiforme, COSTUMES.initie]].map(([def, cos], i) => sc.perso(def, cos, { x: -150 - i * 140, y: SOL + 70, bA: 85, cA: 0, bR: 85, cR: 0 }, eau));
    voileEau(gb);
    // Ombres des ancêtres, au-dessus de l'eau
    const ombres = PEUPLE.slice(0, 5).map(([def], i) => sc.perso(def, COSTUMES.ancetre, { x: 300 + i * 260, y: 700, s: 1.2, alpha: 0, lueur: 0 }, gb));
    tl.set(sc.cam, { x: 900, y: 600, z: 1 }, 18);
    R.fonduEntree(tl, 18, 0.8);
    file.forEach((p, i) => R.marche(tl, p, 1800 - i * 140, 18.5 + i * 0.3, 18, { pas: 16, amp: 0.6 }));
    ombres.forEach((o, i) => { tl.to(o.p, { alpha: 0.25, duration: 2 }, 22 + i * 0.6); tl.to(o.p, { alpha: 0, duration: 2 }, 31 + i * 0.3); });
    R.cam(tl, sc, { x: 1200 }, 18, 18);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 7 · Le retour des initiés
  R.scene('Le retour', 35, (sc, tl) => {
    DECORS.village(sc, {});
    const initiés = [[C.filiforme], [C.guerrier], [C.trapu], [C.filiforme]].map(([def], i) => sc.perso(def, COSTUMES.initie, { x: 2200 + i * 130, y: SOL, dir: -1 }));
    const village = G.foule(sc, [[C.ronde, H.villageoise, 500, 1], [C.vieille, null, 380, 1], [C.enfant, null, 620, 1], [C.colosse, H.forgeron, 260, 1], [C.elancee, H.villageoise, 740, 1]]);
    const tambour = D.tambour(sc.monde, 160, SOL + 2, 1);
    sc.cam.x = 1000; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 4.5, 'lieu_retour', 'droite');
    initiés.forEach((p, i) => R.marche(tl, p, 1000 + i * 130, 1 + i * 0.3, 8));
    G.exprFoule(tl, village, 'joie', 6);
    G.applaudir(tl, village[0], 7, 6); G.applaudir(tl, village[4], 7.3, 6);
    R.saut(tl, village[2], 8, 40); R.saut(tl, village[2], 9, 40);
    G.exprFoule(tl, initiés, 'serein', 9);
    G.incliner(tl, initiés[0], 10.5, 2, 30);
    G.pleurer(tl, village[1], 11, 3);
    R.expr(tl, village[1], 'joie', 15);
    G.danseFoule(tl, village.concat(initiés), 17, 14);
    R.cam(tl, sc, { x: 900, y: 580, z: 0.9 }, 16, 8);
    R.fonduSortie(tl, 33.5, 1.5);
  });

  // =================================================================== 8 · Le soir
  R.scene('Le soir', 28, (sc, tl) => {
    const d = DECORS.riviere(sc, { ciel: 'soir', soleil: [1500, 640, 70] });
    const anciens = G.foule(sc, [[C.ancien, COSTUMES.doyen, 820, 1, 1, { assis: 1 }], [C.filiforme, COSTUMES.initie, 980, 1, 1, { assis: 1 }]]);
    D.siege(sc.monde, 820, SOL + 2, 70, 50); D.siege(sc.monde, 980, SOL + 2, 70, 50);
    anciens.forEach((p) => sc.monde.appendChild(p.root));
    sc.cam.x = 960; sc.cam.y = 640; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1.5);
    tl.to(d.vagues, { x: 60, duration: 4, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0);
    G.pointer(tl, anciens[0], 2, 4, 0.2);
    R.parle(tl, anciens[0], 2.3, 3);
    R.pose(tl, anciens[1], { tete: 5, regard: 1 }, 3, 0.5);
    R.cam(tl, sc, { x: 1200, y: 560, z: 0.9 }, 6, 7);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
