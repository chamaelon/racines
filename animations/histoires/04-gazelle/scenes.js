/*
 * 04 · Les deux traits de la gazelle — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;
  // Le caméléon de ce conte prend la couleur du pelage de la gazelle.
  const CAM = Object.assign({}, B.cameleon, { couleur2: B.gazelle.couleur });

  // ---------------------------------------------------------------- Aides
  /** Rire d'un animal : gueule qui s'ouvre et petits sauts. */
  function rire(tl, b, at, duree) {
    const n = Math.round(duree / 0.25);
    tl.to(b.p, { gueule: 1, duration: 0.12, yoyo: true, repeat: n }, at);
    tl.to(b.p, { bob: -6, duration: 0.12, yoyo: true, repeat: n }, at);
  }
  /** Galop de b jusqu'à x. */
  const galop = (tl, b, x, at, duree, pas) => R.marche(tl, b, x, at, duree, { pas: pas || Math.round(duree * 3), amp: 1.4 });
  /** Bond en hauteur. */
  function bond(tl, b, at, h) {
    tl.to(b.p, { y: SOL - (h || 90), duration: 0.3, ease: 'power2.out' }, at);
    tl.to(b.p, { y: SOL, duration: 0.3, ease: 'power2.in' }, at + 0.3);
  }
  /** Larmes qui coulent le long du museau de la gazelle (dans le repère de sa tête). */
  function larmes(tl, g, at, n) {
    const T = B.gazelle.tete;
    for (let i = 0; i < n; i++) {
      const d = R.el('ellipse', { cx: 0, cy: 0, rx: 3, ry: 4.5, fill: '#bfe3f6', opacity: 0 }, g.teteG);
      const t = at + i * 0.9;
      tl.set(d, { x: T.l * 0.08, y: -T.h * 0.05, opacity: 1 }, t);
      tl.to(d, { x: T.l * 0.6, y: T.h * 0.12, duration: 0.8, ease: 'power1.in' }, t);
      tl.to(d, { opacity: 0, duration: 0.15 }, t + 0.75);
    }
  }

  // =================================================================== 1 · La plus rapide
  R.scene('La plus rapide', 28, (sc, tl) => {
    const d = DECORS.brousse(sc, { mare: 1350, mareL: 420 });
    const gaz = sc.bete(B.gazelle, { x: -300, y: SOL, s: 1.3, traits: 0 });
    sc.cam.y = 540; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    galop(tl, gaz, 2400, 1, 6.5);
    [2, 3.3, 4.6, 5.9].forEach((t) => bond(tl, gaz, t, 110));
    tl.set(gaz.p, { dir: -1 }, 8);
    galop(tl, gaz, 1150, 8.2, 3);
    R.cartouche(tl, 10, 5, 'perso_gazelle');
    tl.to(gaz.p, { tete: -25, duration: 0.6 }, 11.3);
    R.cam(tl, sc, { x: 1150, y: 620, z: 1.25 }, 11, 3);
    // Elle admire son visage dans l'eau
    tl.set(gaz.p, { dir: 1 }, 15);
    tl.to(gaz.p, { x: 1180, tete: 45, duration: 1.2 }, 15.2);
    R.cam(tl, sc, { x: 1300, y: 760, z: 2.3 }, 15.5, 3);
    tl.to(gaz.p, { queue: 30, duration: 0.25, yoyo: true, repeat: 7 }, 18);
    tl.to(gaz.p, { tete: -20, duration: 0.8 }, 22);
    R.cam(tl, sc, { x: 1100, y: 600, z: 1.1 }, 22, 3);
    R.fonduSortie(tl, 26.5, 1.5);
  });

  // =================================================================== 2 · La moquerie
  R.scene('La moquerie', 40, (sc, tl) => {
    DECORS.brousse(sc, {});
    const cam = sc.bete(CAM, { x: 640, y: SOL, s: 1.4 });
    const gaz = sc.bete(B.gazelle, { x: 2200, y: SOL, s: 1.3, dir: -1, traits: 0 });
    const lievre = sc.bete(B.lievre, { x: 2400, y: SOL, s: 1.2, dir: -1 });
    const pintade = sc.bete(B.pintade, { x: -200, y: SOL, s: 1.2 });
    sc.cam.x = 900; sc.cam.y = 640; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, cam, 840, 0.5, 18, { pas: 9, amp: 0.6 });
    R.cartouche(tl, 2, 4.5, 'perso_cameleon');
    galop(tl, gaz, 1150, 5, 2.5);
    tl.to(gaz.p, { tete: 25, duration: 0.5 }, 8);
    rire(tl, gaz, 8.6, 2.5);
    // Elle tourne autour de lui en sautant par-dessus
    galop(tl, gaz, 500, 11.5, 1.2);
    bond(tl, gaz, 11.9, 120);
    tl.set(gaz.p, { dir: 1 }, 12.8);
    galop(tl, gaz, 1150, 12.9, 1.2);
    bond(tl, gaz, 13.2, 120);
    tl.set(gaz.p, { dir: -1 }, 14.2);
    rire(tl, gaz, 14.3, 2);
    tl.to(cam.p, { yeux: 0.6, duration: 0.3 }, 12);
    // Le lièvre et la pintade se moquent aussi
    R.marche(tl, lievre, 1350, 9, 2.5, { pas: 6 });
    R.marche(tl, pintade, 420, 9.5, 3, { pas: 8 });
    [12, 13, 14, 15].forEach((t) => bond(tl, lievre, t, 50));
    tl.to(pintade.p, { tete: -20, duration: 0.15, yoyo: true, repeat: 11 }, 12.5);
    R.cam(tl, sc, { x: 880, z: 1.05 }, 11, 3);
    // Le caméléon s'arrête, change de couleur, ne dit rien
    tl.to(cam.p, { yeux: 0, duration: 0.3 }, 18);
    tl.to(cam.p, { teinte2: 0.8, duration: 1.5, yoyo: true, repeat: 1 }, 19);
    R.cam(tl, sc, { x: 840, y: 780, z: 2.2 }, 18.5, 3);
    tl.to(cam.p, { langue: 0.4, duration: 0.15, yoyo: true, repeat: 1 }, 24);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.15 }, 25, 3);
    rire(tl, gaz, 26, 3);
    tl.set(gaz.p, { dir: 1 }, 30);
    galop(tl, gaz, 1600, 30.2, 1.5);
    tl.set(gaz.p, { dir: -1 }, 32);
    tl.to(gaz.p, { tete: -30, duration: 0.6 }, 32.2);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 3 · Le défi
  R.scene('Le défi', 35, (sc, tl) => {
    DECORS.brousse(sc, {});
    const cam = sc.bete(CAM, { x: 840, y: SOL, s: 1.4 });
    const gaz = sc.bete(B.gazelle, { x: 1150, y: SOL, s: 1.3, dir: -1, traits: 0 });
    const ele = sc.bete(B.elephant, { x: 2500, y: SOL, s: 1.1, dir: -1 });
    const lievre = sc.bete(B.lievre, { x: 1450, y: SOL, s: 1.2, dir: -1 });
    const pintade = sc.bete(B.pintade, { x: 520, y: SOL, s: 1.2 });
    const hyene = sc.animal(BESTIAIRE.hyene, { x: -300, y: SOL, s: 1 });
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    // Le caméléon tire la langue vers l'horizon : « La course, jusque là-bas ! »
    tl.to(cam.p, { langue: 1, duration: 0.25 }, 1.5);
    tl.to(cam.p, { langue: 0, duration: 0.3 }, 2.3);
    tl.to(cam.p, { langue: 1, duration: 0.25 }, 3.2);
    tl.to(cam.p, { langue: 0, duration: 0.3 }, 4);
    tl.to(gaz.p, { tete: 25, duration: 0.3 }, 2);
    rire(tl, gaz, 4.5, 3);
    tl.to(lievre.p, { tete: 20, duration: 0.3 }, 3);
    // L'éléphant arrive
    R.marche(tl, ele, 1700, 7, 6, { pas: 5 });
    R.cartouche(tl, 9, 5, 'perso_elephant', 'droite');
    R.cam(tl, sc, { x: 1250, y: 560, z: 0.95 }, 7, 5);
    tl.to(ele.p, { trompe: 1, duration: 1, yoyo: true, repeat: 1 }, 13.5);
    tl.to([gaz.p, lievre.p], { tete: -10, duration: 0.4 }, 13.6);
    R.marche(tl, hyene, 300, 12, 4);
    // Il trace la ligne d'arrivée au loin, d'un geste de la trompe vers l'est
    tl.set(ele.p, { dir: 1 }, 17);
    tl.to(ele.p, { trompe: 0.7, duration: 0.8 }, 17.2);
    tl.to(ele.p, { trompe: 0, duration: 0.6 }, 19);
    tl.set(ele.p, { dir: -1 }, 20);
    tl.to(gaz.p, { tete: -25, duration: 0.5 }, 20.5);
    bond(tl, gaz, 21, 80);
    rire(tl, hyene, 22, 2);
    tl.to(cam.p, { yeux: 0.5, teinte2: 0.4, duration: 0.6 }, 23);
    R.cam(tl, sc, { x: 840, y: 790, z: 2.2 }, 24, 2.5);
    tl.to(cam.p, { yeux: 1, duration: 0.15, yoyo: true, repeat: 1 }, 27.5);
    R.cam(tl, sc, { x: 1000, y: 600, z: 1 }, 29, 3);
    R.fonduSortie(tl, 33.5, 1.5);
  });

  // =================================================================== 4 · La ruse
  R.scene('La ruse', 25, (sc, tl) => {
    DECORS.brousse(sc, {});
    const ligne = R.el('path', { d: 'M560,868 Q580,900 560,940', stroke: '#7a5232', 'stroke-width': 6, fill: 'none' }, sc.monde);
    const gaz = sc.bete(B.gazelle, { x: 470, y: SOL, s: 1.3, traits: 0 });
    const cam = sc.bete(CAM, { x: 200, y: SOL, s: 1.2 });
    const passager = sc.bete(CAM, { x: -36, y: 4, s: 0.55, alpha: 0, teinte2: 0 });
    gaz.selle.appendChild(passager.root);
    const foule = [sc.bete(B.lievre, { x: 900, y: SOL, s: 1.2, dir: -1 }), sc.bete(B.pintade, { x: 1020, y: SOL, s: 1.2, dir: -1 }), sc.animal(BESTIAIRE.hyene, { x: 1180, y: SOL, dir: -1 })];
    sc.cam.x = 700; sc.cam.y = 650; sc.cam.z = 1.25;
    R.fonduEntree(tl, 0, 1);
    // La gazelle fanfaronne devant les autres
    [1, 2.4, 3.8, 5.2].forEach((t, i) => { bond(tl, gaz, t, 60); tl.to(gaz.p, { tete: i % 2 ? -25 : 10, duration: 0.3 }, t); });
    tl.to(foule[0].p, { tete: 15, duration: 0.3, yoyo: true, repeat: 5 }, 2);
    // Pendant ce temps, le caméléon s'approche et grimpe
    R.marche(tl, cam, 400, 1.5, 6, { pas: 4, amp: 0.6 });
    R.cam(tl, sc, { x: 440, y: 700, z: 1.9 }, 6, 3);
    tl.to(cam.p, { y: SOL - 60, rot: -60, duration: 1.5 }, 8);
    tl.set(cam.p, { alpha: 0 }, 9.5);
    tl.set(passager.p, { alpha: 1 }, 9.5);
    tl.to(passager.p, { teinte2: 1, duration: 2 }, 10.5);
    tl.to(passager.p, { yeux: 1, duration: 0.15, yoyo: true, repeat: 1 }, 13);
    R.cam(tl, sc, { x: 560, y: 620, z: 1.2 }, 14, 3);
    tl.to(gaz.p, { tete: -25, duration: 0.5 }, 15);
    rire(tl, foule[2], 16, 2);
    tl.to(gaz.p, { queue: 30, duration: 0.2, yoyo: true, repeat: 5 }, 17);
    R.fonduSortie(tl, 23.5, 1.5);
  });

  // =================================================================== 5 · La course
  R.scene('La course', 45, (sc, tl) => {
    // 5a · le départ (0–12)
    const ga = R.plan(sc, tl, 0, 12);
    DECORS.brousse(ga.sous, {});
    R.el('path', { d: 'M560,868 Q580,900 560,940', stroke: '#7a5232', 'stroke-width': 6, fill: 'none' }, ga);
    const gaz = sc.bete(B.gazelle, { x: 470, y: SOL, s: 1.3, traits: 0 }, ga);
    const passager = sc.bete(CAM, { x: -36, y: 4, s: 0.55, teinte2: 1 }, ga);
    gaz.selle.appendChild(passager.root);
    const lievre = sc.bete(B.lievre, { x: 760, y: SOL, s: 1.3, dir: -1 }, ga);
    tl.set(sc.cam, { x: 760, y: 620, z: 1.1 }, 0);
    R.fonduEntree(tl, 0, 1);
    [1.5, 2.2, 2.9].forEach((t) => R.saut(tl, lievre, t, 50, 0.4));
    R.eclairBlanc(tl, 3.6, 0.3);
    galop(tl, gaz, 2600, 3.8, 4);
    R.cam(tl, sc, { x: 1500 }, 3.8, 4);
    tl.set(lievre.p, { dir: 1 }, 4.5);
    R.marche(tl, lievre, 1300, 4.6, 3, { pas: 8 });
    R.fonduSortie(tl, 11.4, 0.6);
    // 5b · la mare (12–33)
    const gb = R.plan(sc, tl, 12, 33);
    DECORS.brousse(gb.sous, { mare: 1150, mareL: 420 });
    const gaz2 = sc.bete(B.gazelle, { x: -300, y: SOL, s: 1.3, traits: 0 }, gb);
    const pas2 = sc.bete(CAM, { x: -36, y: 4, s: 0.55, teinte2: 1 }, gb);
    gaz2.selle.appendChild(pas2.root);
    tl.set(sc.cam, { x: 960, y: 600, z: 1 }, 12);
    R.fonduEntree(tl, 12, 0.5);
    galop(tl, gaz2, 800, 12.3, 3);
    tl.set(gaz2.p, { dir: -1 }, 15.6);
    tl.to(gaz2.p, { tete: -15, duration: 0.4 }, 15.7);
    R.cam(tl, sc, { x: 700, y: 650, z: 1.4 }, 15.4, 2);
    rire(tl, gaz2, 17, 2.5);
    tl.set(gaz2.p, { dir: 1 }, 20);
    R.marche(tl, gaz2, 930, 20.2, 2, { pas: 3 });
    tl.to(gaz2.p, { tete: 50, duration: 0.8 }, 22.3);
    R.cam(tl, sc, { x: 980, y: 720, z: 1.9 }, 22, 2);
    tl.to(pas2.p, { yeux: 1, duration: 0.12, yoyo: true, repeat: 1 }, 24.5);
    tl.to(gaz2.p, { tete: -10, duration: 0.6 }, 27);
    galop(tl, gaz2, 2600, 28, 4.5);
    R.cam(tl, sc, { x: 1400, y: 600, z: 1 }, 27.5, 4);
    R.fonduSortie(tl, 32.4, 0.6);
    // 5c · la dernière ligne droite (33–45)
    const gc = R.plan(sc, tl, 33);
    DECORS.brousse(gc.sous, { ciel: 'chaud' });
    const gaz3 = sc.bete(B.gazelle, { x: -300, y: SOL, s: 1.3, traits: 0 }, gc);
    const pas3 = sc.bete(CAM, { x: -36, y: 4, s: 0.55, teinte2: 1 }, gc);
    gaz3.selle.appendChild(pas3.root);
    tl.set(sc.cam, { x: 600, y: 600, z: 1 }, 33);
    R.fonduEntree(tl, 33, 0.5);
    galop(tl, gaz3, 1400, 33.2, 6);
    [34.5, 36, 37.5].forEach((t) => bond(tl, gaz3, t, 70));
    R.cam(tl, sc, { x: 1250 }, 33.5, 6);
    R.fonduSortie(tl, 43.5, 1.5);
  });

  // =================================================================== 6 · L'arrivée
  R.scene('L\'arrivée', 35, (sc, tl) => {
    DECORS.brousse(sc, {});
    const LIGNE = 1400;
    R.el('path', { d: `M${LIGNE},868 Q${LIGNE + 20},900 ${LIGNE},940`, stroke: '#7a5232', 'stroke-width': 6, fill: 'none' }, sc.monde);
    const ele = sc.bete(B.elephant, { x: 1750, y: SOL, s: 1, dir: -1 });
    const foule = [sc.bete(B.pintade, { x: 1560, y: SOL, s: 1.2, dir: -1 }), sc.bete(B.lievre, { x: 1640, y: SOL, s: 1.2, dir: -1 })];
    const gaz = sc.bete(B.gazelle, { x: 200, y: SOL, s: 1.3, traits: 0 });
    const pas = sc.bete(CAM, { x: -36, y: 4, s: 0.55, teinte2: 1 });
    gaz.selle.appendChild(pas.root);
    const cam = sc.bete(CAM, { x: LIGNE + 50, y: SOL, s: 1.2, alpha: 0, teinte2: 1 });
    sc.cam.x = 1000; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.6, 4, 'lieu_arrivee', 'droite');
    galop(tl, gaz, 1000, 0.5, 3.5);
    R.marche(tl, gaz, LIGNE - 140, 4, 2.5, { pas: 4 });
    R.cam(tl, sc, { x: 1250, y: 640, z: 1.2 }, 3, 4);
    // Elle s'arrête juste avant la ligne pour se moquer, tournée vers la piste vide
    tl.set(gaz.p, { dir: -1 }, 7);
    rire(tl, gaz, 7.3, 3);
    // Le caméléon saute de son dos et franchit la ligne
    tl.set(pas.p, { alpha: 0 }, 10.6);
    tl.set(cam.p, { alpha: 1, x: LIGNE - 150, y: SOL - 130 }, 10.6);
    tl.to(cam.p, { x: LIGNE + 50, duration: 0.8, ease: 'none' }, 10.6);
    tl.to(cam.p, { y: SOL - 200, duration: 0.4, ease: 'power2.out' }, 10.6);
    tl.to(cam.p, { y: SOL, duration: 0.4, ease: 'power2.in' }, 11);
    tl.to(cam.p, { teinte2: 0, duration: 1 }, 11.5);
    R.cam(tl, sc, { x: LIGNE, y: 720, z: 1.8 }, 11, 1.5);
    tl.to(ele.p, { trompe: 1, duration: 0.8 }, 12.5);
    tl.set(gaz.p, { dir: 1 }, 13);
    tl.to(gaz.p, { gueule: 1, tete: 10, duration: 0.3 }, 13.2);
    R.cam(tl, sc, { x: 1350, y: 620, z: 1.15 }, 14, 2);
    [14.5, 15.2, 15.9].forEach((t) => R.saut(tl, foule[1], t, 50, 0.45));
    tl.to(foule[0].p, { tete: -25, duration: 0.15, yoyo: true, repeat: 9 }, 14.5);
    rire(tl, foule[1], 17, 3);
    tl.to(ele.p, { trompe: 0, duration: 0.8 }, 19);
    tl.to(gaz.p, { gueule: 0, tete: 30, duration: 1 }, 21);
    tl.to(cam.p, { yeux: 1, duration: 0.15, yoyo: true, repeat: 1 }, 24);
    R.cam(tl, sc, { x: 1250, y: 700, z: 1.6 }, 22, 6);
    R.fonduSortie(tl, 33.5, 1.5);
  });

  // =================================================================== 7 · Les larmes
  R.scene('Les larmes', 35, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir' });
    const gaz = sc.bete(B.gazelle, { x: 960, y: SOL, s: 1.3, traits: 0, tete: 30, dir: -1 });
    const cam = sc.bete(CAM, { x: 640, y: SOL, s: 1.2 });
    const lievre = sc.bete(B.lievre, { x: 1350, y: SOL, s: 1.2, dir: -1 });
    sc.cam.x = 960; sc.cam.y = 640; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1.2);
    tl.to(gaz.p, { yeux: 0.5, duration: 0.5 }, 1);
    R.cam(tl, sc, { x: 860, y: 700, z: 3 }, 2, 4);
    larmes(tl, gaz, 4, 16);
    tl.to(gaz.p, { traits: 1, duration: 12, ease: 'none' }, 5);
    tl.to(gaz.p, { bob: 2, duration: 0.3, yoyo: true, repeat: 29 }, 4);
    R.cam(tl, sc, { x: 960, y: 640, z: 1.3 }, 20, 4);
    tl.to(lievre.p, { tete: 25, duration: 0.6 }, 22);
    tl.to(cam.p, { teinte2: 0.5, duration: 1.5 }, 23);
    tl.to(gaz.p, { tete: -10, yeux: 0, duration: 1 }, 26);
    R.cam(tl, sc, { x: 860, y: 700, z: 2.6 }, 27, 4);
    R.fonduSortie(tl, 33.5, 1.5);
  });

  // =================================================================== 8 · Depuis ce jour
  R.scene('Depuis ce jour', 27, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir' });
    const branche = R.el('path', { d: 'M1500,640 Q1600,620 1720,650', stroke: '#5b3a24', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }, sc.monde);
    const gazelles = [[500, 1.3, 1], [760, 1.1, -1], [980, 1, 1]].map(([x, s, dir]) => sc.bete(B.gazelle, { x, y: SOL, s, dir, traits: 1 }));
    const cam = sc.bete(CAM, { x: 1600, y: 628, s: 1 });
    sc.cam.x = 960; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1.2);
    gazelles.forEach((g, i) => tl.to(g.p, { tete: 40, duration: 1, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 1 + i * 0.6));
    R.cam(tl, sc, { x: 600, y: 700, z: 2 }, 3, 4);
    R.cam(tl, sc, { x: 1500, y: 600, z: 1.6 }, 8, 3);
    tl.to(cam.p, { teinte2: 1, duration: 1.2, yoyo: true, repeat: 1 }, 10);
    tl.to(cam.p, { yeux: 1, duration: 0.12, yoyo: true, repeat: 1 }, 12.5);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 7.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
