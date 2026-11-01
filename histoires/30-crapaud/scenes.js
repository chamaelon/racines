/*
 * 30 · Pourquoi le crapaud chante la nuit — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, MARE = 1100;

  /** Le crapaud chante : la gorge se gonfle et des notes s'envolent. */
  function chanter(tl, cr, parent, at, duree, fort) {
    const n = Math.round(duree / 0.5);
    for (let i = 0; i < n; i++) tl.to(cr.p, { gonfle: fort ? 1.6 : 1, duration: 0.25, yoyo: true, repeat: 1 }, at + i * 0.5);
    G.notes(tl, parent, cr.p.x + 30, cr.p.y - 70 * cr.p.s, at, duree, fort ? '#ffd166' : '#fff1c2');
  }
  /** Rire d'un animal (gueule et sautillements). */
  const rire = (tl, b, at, d) => { const n = Math.round(d / 0.25); tl.to(b.p, { gueule: 1, duration: 0.12, yoyo: true, repeat: n }, at); tl.to(b.p, { bob: -6, duration: 0.12, yoyo: true, repeat: n }, at); };
  const animaux = (sc, parent) => ({
    ele: sc.bete(B.elephant, { x: 1700, y: SOL, s: 0.9, dir: -1 }, parent),
    lievre: sc.bete(B.lievre, { x: 600, y: SOL, s: 1.2 }, parent),
    chien: sc.bete(B.chien, { x: 450, y: SOL, s: 1.1 }, parent),
    hyene: sc.animal(BESTIAIRE.hyene, { x: 300, y: SOL, s: 0.9 }, parent),
    pintade: sc.bete(B.pintade, { x: 760, y: SOL, s: 1.2 }, parent),
  });

  // =================================================================== 1 · Jadis
  R.scene('Jadis', 28, (sc, tl) => {
    DECORS.brousse(sc, { mare: MARE, mareL: 520 });
    const a = animaux(sc);
    const cr = sc.bete(B.crapaud, { x: MARE, y: SOL + 6, s: 1.3 });
    sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    R.cartouche(tl, 8, 5, 'lieu_jadis');
    G.notes(tl, sc.monde, 760, 780, 2, 22);
    G.notes(tl, sc.monde, 620, 820, 3, 20, '#cfe8f1');
    tl.to(a.pintade.p, { tete: -20, duration: 0.3, yoyo: true, repeat: 19 }, 2);
    tl.to(a.chien.p, { gueule: 1, duration: 0.3, yoyo: true, repeat: 11 }, 4);
    tl.to(a.ele.p, { trompe: 1, duration: 1, yoyo: true, repeat: 5 }, 3);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.1 }, 9, 14);
    R.fonduSortie(tl, 26.5, 1.5);
  });

  // =================================================================== 2 · Le vantard
  R.scene('Le vantard', 36, (sc, tl) => {
    DECORS.brousse(sc, { mare: MARE, mareL: 520 });
    const a = animaux(sc);
    const cr = sc.bete(B.crapaud, { x: MARE, y: SOL + 6, s: 1.5 });
    sc.cam.x = 900; sc.cam.y = 680; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'perso_crapaud', 'droite');
    G.notes(tl, sc.monde, 760, 780, 1, 4);
    chanter(tl, cr, sc.monde, 5, 6, true);
    R.cam(tl, sc, { x: MARE, y: 780, z: 2.2 }, 5, 2);
    tl.to([a.pintade.p, a.lievre.p, a.chien.p], { yeux: 1, duration: 0.2 }, 6);
    tl.to(a.lievre.p, { couche: 1, duration: 0.6 }, 7);
    R.cam(tl, sc, { x: 700, y: 660, z: 1.2 }, 11, 3);
    // Les autres se plaignent, le crapaud chante encore plus fort
    tl.to(a.pintade.p, { tete: -25, duration: 0.2, yoyo: true, repeat: 7 }, 13);
    tl.to(a.chien.p, { gueule: 1, duration: 0.25, yoyo: true, repeat: 7 }, 13.5);
    R.cam(tl, sc, { x: MARE, y: 760, z: 1.9 }, 17, 2);
    chanter(tl, cr, sc.monde, 18, 7, true);
    tl.to(cr.p, { s: 1.8, duration: 1 }, 19);
    R.secousse(tl, sc, 19, 4, 5);
    tl.to(cr.p, { s: 1.5, duration: 1 }, 26);
    R.cam(tl, sc, { x: 900, y: 640, z: 1 }, 26, 4);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 3 · Le concours
  R.scene('Le concours', 34, (sc, tl) => {
    DECORS.brousse(sc, {});
    const a = animaux(sc);
    a.ele.p.x = 1300;
    sc.cam.x = 900; sc.cam.y = 600; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'perso_elephant', 'droite');
    tl.to(a.ele.p, { trompe: 1, duration: 0.8 }, 2);
    tl.to(a.ele.p, { trompe: 0.3, duration: 0.5, yoyo: true, repeat: 3 }, 3);
    R.secousse(tl, sc, 2.5, 5, 1);
    R.cartouche(tl, 7, 5, 'lieu_concours');
    tl.to(a.ele.p, { trompe: 0, duration: 0.8 }, 6);
    // Chacun s'entraîne
    R.cartouche(tl, 13, 4, 'perso_lievre');
    [14, 15, 16].forEach((t) => R.saut(tl, a.lievre, t, 60));
    tl.to(a.chien.p, { gueule: 1, tete: -20, duration: 0.3, yoyo: true, repeat: 7 }, 15);
    rire(tl, a.hyene, 18, 3);
    G.notes(tl, sc.monde, 760, 800, 17, 6);
    R.cam(tl, sc, { x: 600, y: 680, z: 1.3 }, 13, 5);
    R.cam(tl, sc, { x: 900, y: 600, z: 0.95 }, 24, 4);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 4 · L'araignée
  R.scene('L\'araignée', 30, (sc, tl) => {
    DECORS.brousse(sc, { mare: MARE, mareL: 520 });
    const branche = R.el('path', { d: `M${MARE - 300},560 Q${MARE},520 ${MARE + 300},570`, stroke: '#5b3a24', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }, sc.monde);
    const ar = sc.bete(B.araignee, { x: MARE - 200, y: 560, s: 1.4 });
    const fil = R.el('path', { d: `M${MARE - 120},570 L${MARE - 120},570`, stroke: '#f4f4f4', 'stroke-width': 2.5, fill: 'none', opacity: 0.9 }, sc.monde);
    const toile = R.el('g', { opacity: 0 }, sc.monde);
    for (let i = 0; i < 6; i++) R.el('line', { x1: MARE, y1: 700, x2: MARE + Math.cos(i * Math.PI / 3) * 70, y2: 700 + Math.sin(i * Math.PI / 3) * 70, stroke: '#f4f4f4', 'stroke-width': 2 }, toile);
    for (let r = 20; r <= 70; r += 25) R.el('circle', { cx: MARE, cy: 700, r, fill: 'none', stroke: '#f4f4f4', 'stroke-width': 1.5 }, toile);
    sc.cam.x = MARE; sc.cam.y = 660; sc.cam.z = 1.4;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'perso_araignee');
    tl.to(ar.p, { marcheAmp: 1, duration: 0.3 }, 2);
    tl.to(ar.p, { x: MARE, marche: '+=6', duration: 3, ease: 'none' }, 2);
    tl.to(ar.p, { marcheAmp: 0, duration: 0.3 }, 5);
    // Elle descend au bout de son fil et tisse au-dessus de la mare
    tl.to(ar.p, { gonfle: 140, y: 700, duration: 3 }, 6);
    tl.to(toile, { opacity: 0.8, duration: 4 }, 9);
    tl.to(ar.p, { rot: 360, duration: 4, ease: 'none' }, 9);
    tl.to(ar.p, { gonfle: 0, y: 560, duration: 2 }, 14);
    tl.to(ar.p, { yeux: 1, duration: 0.15, yoyo: true, repeat: 1 }, 17);
    R.cam(tl, sc, { x: MARE, y: 720, z: 2 }, 9, 4);
    R.cam(tl, sc, { x: MARE, y: 640, z: 1.2 }, 18, 4);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 5 · Le grand concours
  R.scene('Le grand concours', 44, (sc, tl) => {
    DECORS.brousse(sc, { mare: MARE, mareL: 520 });
    const a = animaux(sc);
    a.ele.p.x = 1550; a.ele.p.dir = -1;
    const toile = R.el('g', { opacity: 0.8 }, sc.monde);
    for (let i = 0; i < 6; i++) R.el('line', { x1: MARE, y1: 700, x2: MARE + Math.cos(i * Math.PI / 3) * 70, y2: 700 + Math.sin(i * Math.PI / 3) * 70, stroke: '#f4f4f4', 'stroke-width': 2 }, toile);
    for (let r = 20; r <= 70; r += 25) R.el('circle', { cx: MARE, cy: 700, r, fill: 'none', stroke: '#f4f4f4', 'stroke-width': 1.5 }, toile);
    const cr = sc.bete(B.crapaud, { x: MARE, y: SOL + 6, s: 1.5 });
    const ar = sc.bete(B.araignee, { x: MARE + 260, y: 570, s: 1.2 });
    sc.cam.x = 950; sc.cam.y = 620; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    // La pintade chante, puis le chien
    G.notes(tl, sc.monde, 760, 800, 1, 4);
    tl.to(a.pintade.p, { tete: -20, duration: 0.3, yoyo: true, repeat: 11 }, 1);
    tl.to(a.chien.p, { gueule: 1, tete: -25, duration: 0.3, yoyo: true, repeat: 9 }, 6);
    G.notes(tl, sc.monde, 480, 780, 6, 3, '#cfe8f1');
    tl.to(a.ele.p, { tete: 6, duration: 0.4, yoyo: true, repeat: 3 }, 9.5);
    // Le crapaud : il gonfle, gonfle… monte, s'emmêle dans la toile
    R.cam(tl, sc, { x: MARE, y: 740, z: 1.6 }, 12, 2);
    chanter(tl, cr, sc.monde, 13, 5, true);
    tl.to(cr.p, { s: 2.3, duration: 4 }, 14);
    tl.to(cr.p, { y: 720, duration: 1.2, ease: 'power2.out' }, 18.2);
    tl.to(toile, { scale: 1.3, transformOrigin: '50% 50%', duration: 0.3 }, 19.2);
    tl.to(cr.p, { rot: 160, duration: 0.6 }, 19.4);
    tl.to(cr.p, { y: SOL + 20, duration: 0.5, ease: 'bounce.out' }, 20);
    tl.to(cr.p, { s: 1.3, gonfle: 0, duration: 0.4 }, 20);
    tl.to(toile, { opacity: 0, duration: 0.4 }, 20);
    const eclab = D.particules(sc.monde, 16, MARE, SOL + 4, '#cfe8f1', 31);
    R.jaillir(tl, eclab, 20.4, 0, { n: 12, ecart: 20, haut: 60, duree: 0.8 });
    R.secousse(tl, sc, 20.4, 8, 0.4);
    R.cam(tl, sc, { x: 950, y: 620, z: 0.95 }, 21, 3);
    // Tout le monde rit
    rire(tl, a.hyene, 22, 6);
    rire(tl, a.chien, 22.3, 6);
    [22.5, 23.3, 24.1].forEach((t) => R.saut(tl, a.lievre, t, 40));
    tl.to(a.ele.p, { trompe: 1, duration: 0.5, yoyo: true, repeat: 5 }, 22.5);
    tl.to(ar.p, { bob: -6, duration: 0.15, yoyo: true, repeat: 13 }, 23);
    tl.to(cr.p, { rot: 0, duration: 0.6 }, 26);
    R.cam(tl, sc, { x: MARE, y: 800, z: 2.4 }, 28, 3);
    tl.to(cr.p, { yeux: 0.6, duration: 0.5 }, 30);
    R.fonduSortie(tl, 42.5, 1.5);
  });

  // =================================================================== 6 · La honte
  R.scene('La honte', 34, (sc, tl) => {
    const d = DECORS.brousse(sc, { mare: MARE, mareL: 520, ciel: 'soir' });
    const cid = R.id('mare');
    R.el('rect', { x: -3000, y: -4000, width: 8000, height: 4000 + SOL + 4 }, R.el('clipPath', { id: cid }, R.defs));
    const g = R.el('g', { 'clip-path': `url(#${cid})` }, sc.monde);
    const cr = sc.bete(B.crapaud, { x: MARE, y: SOL + 6, s: 1.3, yeux: 0.6 }, g);
    const a = animaux(sc);
    sc.cam.x = 900; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_honte');
    rire(tl, a.hyene, 2, 4);
    tl.to(a.pintade.p, { tete: -20, duration: 0.2, yoyo: true, repeat: 9 }, 2);
    R.cam(tl, sc, { x: MARE, y: 780, z: 2.2 }, 5, 2);
    tl.to(cr.p, { y: SOL + 80, duration: 3, ease: 'power1.in' }, 8);
    const bulles = D.particules(sc.monde, 12, MARE, SOL, '#cfe8f1', 13);
    [9, 10, 11.5, 13].forEach((t, i) => R.jaillir(tl, bulles, t, i, { n: 3, ecart: 10, haut: 20, duree: 0.6 }));
    R.cam(tl, sc, { x: 900, y: 620, z: 0.95 }, 14, 4);
    // Les autres rentrent chez eux ; le soir tombe
    [a.lievre, a.chien, a.pintade].forEach((b, i) => { tl.set(b.p, { dir: -1 }, 18 + i * 0.3); R.marche(tl, b, -400, 18.2 + i * 0.3, 6, { pas: 10 }); });
    tl.set(a.hyene.p, { dir: -1 }, 18.5);
    tl.to(a.hyene.p, { marcheAmp: 1, duration: 0.2 }, 18.6);
    tl.to(a.hyene.p, { x: -400, marche: '+=10', duration: 6, ease: 'none' }, 18.6);
    R.marche(tl, a.ele, 2500, 19, 8, { pas: 8 });
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 7 · La nuit
  R.scene('La nuit', 38, (sc, tl) => {
    const d = DECORS.brousse(sc, { mare: MARE, mareL: 520, ciel: 'nuit', nuit: true });
    const cr = sc.bete(B.crapaud, { x: MARE, y: SOL + 80, s: 1.3 });
    const lune = D.lune(sc.monde, 1400, 220, 60);
    const reflet = R.el('ellipse', { cx: MARE + 60, cy: SOL + 6, rx: 40, ry: 8, fill: '#fbf1cf', opacity: 0.5 }, sc.monde);
    const etoiles = D.etoiles(sc.monde, 60, 87, { x: 300, y: -100, w: 1600, h: 600 });
    etoiles.setAttribute('opacity', 0.4);
    sc.cam.x = MARE; sc.cam.y = 680; sc.cam.z = 1.3;
    R.fonduEntree(tl, 0, 2);
    R.cartouche(tl, 1, 4, 'lieu_nuit');
    // Il remonte, regarde autour : personne
    tl.to(cr.p, { y: SOL + 6, duration: 2 }, 3);
    tl.to(cr.p, { yeux: 0, duration: 0.4 }, 5);
    [6, 7.5].forEach((t, i) => tl.set(cr.p, { dir: i % 2 ? 1 : -1 }, t));
    // Il chante doucement : la lune s'approche, les étoiles brillent
    chanter(tl, cr, sc.monde, 9, 16, false);
    tl.to(etoiles, { opacity: 1, duration: 6 }, 10);
    tl.to(lune, { x: '-=200', y: '+=80', duration: 14, ease: 'sine.inOut' }, 10);
    tl.to(reflet, { opacity: 0.9, attr: { rx: 70 }, duration: 4 }, 12);
    R.cam(tl, sc, { x: MARE + 100, y: 520, z: 0.95 }, 12, 8);
    // Des lucioles dansent autour
    const lucioles = D.particules(sc.monde, 20, MARE, 760, '#ffef7a', 51);
    [14, 16, 18, 20, 22].forEach((t, i) => R.jaillir(tl, lucioles, t, i, { n: 4, ecart: 60, haut: 120, duree: 2 }));
    R.cam(tl, sc, { x: MARE, y: 740, z: 1.8 }, 26, 4);
    tl.to(cr.p, { yeux: 0.4, duration: 0.6 }, 30);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 8 · Depuis ce jour
  R.scene('Depuis ce jour', 28, (sc, tl) => {
    DECORS.brousse(sc, { mare: MARE, mareL: 520, ciel: 'nuit', nuit: true });
    const crs = [[MARE - 160, 1.1], [MARE, 1.3], [MARE + 170, 1]].map(([x, s], i) => sc.bete(B.crapaud, { x, y: SOL + 6, s, dir: i % 2 ? -1 : 1 }));
    D.lune(sc.monde, 1250, 260, 55);
    sc.cam.x = MARE; sc.cam.y = 680; sc.cam.z = 1.3;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 7, 'lieu_depuis');
    crs.forEach((c, i) => chanter(tl, c, sc.monde, 1 + i * 0.3, 11, false));
    R.cam(tl, sc, { y: 560, z: 0.95 }, 6, 6);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
