/*
 * 03 · Wuro blessé par le pilon — animation (voir 00-ecriture/ecriture.md).
 * Chaque scène = une timeline locale ; les temps sont relatifs au début de la scène.
 */
(function () {
  const D = R.D, P = D.PAL, C = CASTING;
  R.init(document.getElementById('scene'));

  // ---------------------------------------------------------------- Costumes de l'histoire
  // Les corps viennent du casting ; on ne change ici que les habits.
  const COSTUMES = {
    villageoise: { haut: { type: 'camisole', couleur: '#c8553d' }, bas: { type: 'jupe', couleur: '#efe0bd', motif: 'bandes', motifCouleur: '#7a4a25' }, collier: '#e9c46a' },
    villageois: { haut: { type: 'tunique', couleur: '#6b8f71', motif: 'bandes', motifCouleur: '#2f4a33' }, bas: { type: 'short', couleur: '#e8dcc0' }, tete: null },
    forgeron: { bas: { type: 'pagne', couleur: '#5a3a22' }, ceinture: '#2b1a0e', bracelets: '#c0c0c0', collier: '#9a9a9a' },
  };

  // ---------------------------------------------------------------- Aides propres à l'histoire
  /** Hamé pile : n coups de période `per`. `haut` = angle du bras en haut. Poussière à chaque coup. */
  function piler(tl, h, at, n, per, haut, poussiere) {
    for (let i = 0; i < n; i++) {
      const t = at + i * per;
      tl.to(h.p, { bA: haut, bR: haut - 6, cA: 20, cR: 22, lean: -5, duration: per * 0.5, ease: 'power1.out' }, t);
      tl.to(h.p, { bA: 70, bR: 64, cA: 25, cR: 25, lean: 6, duration: per * 0.5, ease: 'power2.in' }, t + per * 0.5);
      if (poussiere) bouffee(tl, poussiere, t + per, i);
    }
  }

  const bouffee = (tl, pool, at, k) => R.jaillir(tl, pool, at, k);
  const { chute, montrer, cacher, objet } = R;

  // =================================================================== 1 · La création
  R.scene('La création', 30, (sc, tl) => {
    const d = DECORS.cosmos(sc);
    d.etoiles.liste.forEach((s) => { s.dataset.o = s.getAttribute('opacity'); s.setAttribute('opacity', 0); });
    const aube = sc.calque();
    D.ciel(aube, '#3b4f8f', '#f2a65a');
    gsap.set(aube, { opacity: 0 });
    const terre = sc.calque();
    D.collines(terre, 760, '#8a6a4a', 3, 70);
    D.sol(terre, 860, P.terre, P.terreSombre);
    gsap.set(terre, { y: 700 });
    const eau = sc.calque();
    const clip = R.el('clipPath', { id: 'clip-fleuve' }, R.defs);
    const clipR = R.el('rect', { x: -1000, y: 0, width: 0, height: 2000 }, clip);
    eau.setAttribute('clip-path', 'url(#clip-fleuve)');
    D.fleuve(eau, 905);
    const arbres = sc.calque();
    const plantes = [[220, 870, 'karite', 1], [520, 880, 'baobab', 0.9], [1450, 870, 'karite', 0.8], [1720, 880, 'ronier', 1], [-150, 870, 'karite', 1.1], [2050, 880, 'baobab', 1]].map(([x, y, f, s]) => {
      const w = R.el('g', {}, arbres);
      D[f](w, x, y, s);
      gsap.set(w, { scale: 0, svgOrigin: `${x} ${y}` });
      return w;
    });
    const boule = D.lumiere(sc.monde, 960, 470, 30, '#ffe7a3');
    const wuro = sc.perso(C.geant, null, { x: 960, y: 700, alpha: 0, lueur: 1 });
    sc.cam.z = 1.15;

    R.fonduEntree(tl, 0, 1.5);
    tl.fromTo(boule, { scale: 0.1, transformOrigin: '50% 50%' }, { scale: 3, duration: 3.5, ease: 'power2.out' }, 0);
    R.titre(tl, 1.5, 5.5, 'titre', 'sous_titre', 820);
    tl.to(wuro.p, { alpha: 1, duration: 2 }, 4);
    tl.to(boule, { opacity: 0, duration: 2 }, 5);
    tl.to(wuro.p, { y: 680, duration: 2, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 4);
    R.expr(tl, wuro, 'serein', 4);
    // Les étoiles
    R.pose(tl, wuro, { bA: 160, bR: 160, cA: 10, cR: 10 }, 7, 1.2);
    R.expr(tl, wuro, 'joie', 7.2);
    tl.to(d.etoiles.liste, { opacity: (i, s) => +s.dataset.o, duration: 0.3, stagger: { each: 0.012, from: 'center' } }, 7.3);
    // La terre
    R.pose(tl, wuro, { bA: 50, bR: 50, cA: 30, cR: 30 }, 10.4, 0.8);
    tl.to(terre, { y: 0, duration: 2.2, ease: 'power2.out' }, 10.8);
    R.cam(tl, sc, { z: 0.95, y: 520 }, 10.5, 4);
    // Le fleuve
    R.pose(tl, wuro, { bA: 100, cA: 0, lean: 10 }, 13.5, 0.7);
    R.pose(tl, wuro, { bA: 25, lean: -4 }, 14.2, 1.6);
    tl.to(clipR, { attr: { width: 3920 }, duration: 2.4, ease: 'power1.inOut' }, 13.8);
    // Les arbres
    R.expr(tl, wuro, 'surprise', 16.4, 0.2);
    R.pose(tl, wuro, { lean: 8, bA: 8, bR: -8, cA: 12, cR: 12 }, 16.4, 0.5);
    tl.to(plantes, { scale: 1, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.25 }, 16.8);
    R.expr(tl, wuro, 'joie', 18.6);
    tl.to(aube, { opacity: 1, duration: 5 }, 17.5);
    R.pose(tl, wuro, { lean: 0 }, 18.6, 0.6);
    R.cartouche(tl, 19, 5, 'perso_wuro');
    // Wuro pose le pied sur la terre
    tl.to(wuro.p, { y: 866, duration: 3, ease: 'power2.inOut' }, 20.2);
    R.pose(tl, wuro, { regard: -1 }, 23.5, 0.4);
    R.pose(tl, wuro, { regard: 1 }, 24.6, 0.4);
    R.pose(tl, wuro, { regard: 0 }, 25.8, 0.4);
    R.cam(tl, sc, { z: 0.85, y: 500 }, 23, 6);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 2 · Le ciel bas
  R.scene('Le ciel bas', 45, (sc, tl) => {
    const d = DECORS.village(sc, { voute: 540 });
    const assis = sc.perso(C.trapu, COSTUMES.villageois, { x: 120, y: 880, assis: 1, s: 0.95 });
    const passante = sc.perso(C.elancee, COSTUMES.villageoise, { x: -450, y: 872, s: 0.9 });
    const wuro = sc.perso(C.geant, null, { x: -300, y: 880, lean: 6, tete: -10, lueur: 0.6 });
    const tiko = sc.perso(C.enfant, null, { x: 2100, y: 880, dir: -1 });
    const bado = sc.perso(C.colosse, COSTUMES.forgeron, { x: 2250, y: 880, dir: -1 });
    const g1 = objet(D.gerbe(), false); wuro.tenir(g1, 'A', { vertical: true });
    const g2 = objet(D.gerbe(), false); bado.tenir(g2, 'A', { vertical: true });
    const g3 = D.gerbe(); passante.tenir(g3, 'A', { vertical: true });
    sc.cam.x = 760; sc.cam.y = 610; sc.cam.z = 1.1;

    R.fonduEntree(tl, 0, 1.2);
    R.cartouche(tl, 0.8, 5, 'lieu_village');
    R.marche(tl, wuro, 620, 2, 7);
    R.cam(tl, sc, { x: 720 }, 1, 8);
    R.expr(tl, assis, 'joie', 4);
    R.pose(tl, assis, { bA: 150, cA: 20 }, 6, 0.4);
    R.pose(tl, assis, { bA: 8, cA: 12 }, 7.5, 0.4);
    R.marche(tl, passante, 2300, 3, 24);
    // Tiko court autour des jambes de Wuro
    R.expr(tl, tiko, 'rire', 2.5);
    R.marche(tl, tiko, 980, 2.5, 3.5, { pas: 8 });
    R.marche(tl, tiko, 420, 7.5, 1.6, { pas: 4 });
    tl.set(tiko.p, { dir: 1 }, 9.1);
    R.marche(tl, tiko, 800, 9.2, 1.4, { pas: 4 });
    R.cartouche(tl, 8.8, 4.5, 'perso_tiko');
    R.expr(tl, wuro, 'joie', 9);
    // Wuro le soulève jusqu'au ciel
    R.pose(tl, wuro, { lean: 25, bA: 50, bR: 40, cA: 20, cR: 20 }, 11.2, 0.9);
    R.pose(tl, wuro, { lean: 0, tete: 5, bA: 150, bR: 150, cA: 10, cR: 10 }, 12.3, 1.3);
    tl.to(tiko.p, { y: 490, x: 712, duration: 1.3, ease: 'power2.inOut' }, 12.3);
    R.pose(tl, tiko, { bA: 170, bR: 160, cA: 0, cR: 0, jA: 20, jR: -25, gA: 30 }, 13, 0.5);
    R.expr(tl, wuro, 'rire', 13);
    [13.9, 14.5, 15.1, 15.7].forEach((t, i) => tl.set(tiko.p, { dir: i % 2 ? 1 : -1 }, t));
    tl.to(tiko.p, { x: 700, duration: 0.6, yoyo: true, repeat: 3 }, 13.9);
    // Il le repose
    R.pose(tl, wuro, { lean: 20, tete: -10, bA: 50, bR: 45, cA: 20, cR: 20 }, 16.6, 1.2);
    tl.to(tiko.p, { y: 880, x: 820, duration: 1.2, ease: 'power2.inOut' }, 16.6);
    R.pose(tl, tiko, { bA: 8, bR: -8, cA: 12, cR: 12, jA: 5, jR: -5, gA: 0 }, 17.4, 0.4);
    R.pose(tl, wuro, { lean: 6, bA: 8, bR: -8, cA: 12, cR: 12 }, 18, 0.8);
    R.marche(tl, tiko, 2200, 18.4, 3, { pas: 8 });
    // Bado le forgeron
    R.marche(tl, bado, 1000, 19.2, 4.6);
    R.cam(tl, sc, { x: 860 }, 19, 5);
    R.cartouche(tl, 23.5, 4.5, 'perso_bado', 'droite');
    R.pose(tl, bado, { lean: 30, tete: 15 }, 24.1, 0.6);
    R.pose(tl, bado, { lean: 0, tete: 0 }, 25.1, 0.6);
    R.expr(tl, bado, 'joie', 25);
    // Le don du mil
    montrer(tl, g1, 26);
    R.pose(tl, wuro, { bA: 72, cA: 10 }, 26, 1.1);
    R.pose(tl, bado, { bA: 82, cA: 12 }, 27, 0.6);
    cacher(tl, g1, 27.7, 0.15); montrer(tl, g2, 27.7, 0.15);
    R.pose(tl, wuro, { bA: 15, cA: 12 }, 28, 0.6);
    R.pose(tl, bado, { bA: 155, cA: 5 }, 28.2, 0.6);
    R.pose(tl, bado, { lean: 28, tete: 12, bA: 90 }, 29.2, 0.6);
    R.pose(tl, bado, { lean: 0, tete: 0, bA: 30, cA: 40 }, 30.2, 0.6);
    // Wuro montre comment semer
    R.parle(tl, wuro, 30.5, 6.5);
    R.pose(tl, wuro, { bA: 110, cA: -5, regard: 1 }, 30.6, 0.6);
    [32.2, 33.4, 34.6].forEach((t) => {
      R.pose(tl, wuro, { bA: 30, cA: 50, lean: 14 }, t, 0.5);
      R.pose(tl, wuro, { bA: 70, cA: 10, lean: 6 }, t + 0.6, 0.5);
    });
    [31.2, 32.8, 34.4, 36].forEach((t) => {
      R.pose(tl, bado, { tete: 12 }, t, 0.3);
      R.pose(tl, bado, { tete: 0 }, t + 0.35, 0.3);
    });
    // Wuro repart
    R.pose(tl, wuro, { bA: 8, cA: 12, regard: 0 }, 37, 0.5);
    tl.set(wuro.p, { dir: -1 }, 37.5);
    R.marche(tl, wuro, -400, 37.6, 6.5);
    tl.set(bado.p, { dir: -1 }, 37.5);
    R.pose(tl, bado, { bA: 160, cA: 30 }, 38, 0.4);
    tl.to(bado.p, { cA: -10, duration: 0.3, yoyo: true, repeat: 7 }, 38.4);
    R.cam(tl, sc, { x: 700, z: 1 }, 37.5, 6);
    R.fonduSortie(tl, 43.5, 1.5);
  });

  // =================================================================== 3 · Le pilon
  const HAME_X = 1000, WURO_X = 1205;
  R.scene('Le pilon', 33, (sc, tl) => {
    const d = DECORS.cour(sc, { voute: 540, grenierX: 1580 });
    D.siege(d.fond, WURO_X + 10, 902, 150, 88);
    const wuro = sc.perso(C.geant, null, { x: 2300, y: 900, dir: -1, lean: 6, tete: -6, lueur: 0.6 });
    const hame = sc.perso(C.ronde, null, { x: HAME_X, y: 900, bA: 70, bR: 64, cA: 25, cR: 25 });
    hame.tenir(D.pilon(190), 'A', { vertical: true });
    const devant = sc.calque();
    D.mortier(devant, HAME_X + 52, 902, 1.15);
    const pous = D.particules(devant, 24, HAME_X + 52, 808, '#efe1b0', 5);
    sc.cam.x = 1000; sc.cam.y = 640; sc.cam.z = 1.15;

    R.fonduEntree(tl, 0, 1.2);
    R.cartouche(tl, 0.5, 4.5, 'lieu_cour');
    piler(tl, hame, 1, 11, 0.9, 120, pous);
    R.cartouche(tl, 5.2, 4.5, 'perso_hame');
    R.expr(tl, hame, 'joie', 2);
    R.parle(tl, hame, 5, 6);
    // Wuro arrive, fatigué
    R.cam(tl, sc, { x: 1100, y: 540, z: 0.82 }, 10, 4);
    R.pose(tl, wuro, { yeux: 0.45, sourcils: -0.4, sourire: 0 }, 10, 0.5);
    R.marche(tl, wuro, WURO_X, 10.2, 5.6);
    R.pose(tl, hame, { regard: 1 }, 14, 0.3);
    R.expr(tl, hame, 'joie', 14.2);
    // Il s'assoit, bâille, s'étire : sa main reste au-dessus d'Hamé
    R.pose(tl, wuro, { assis: 1, lean: 0 }, 16, 1.5);
    R.pose(tl, wuro, { bouche: 1, yeux: 1, bA: 165, bR: 155, cA: 5, cR: 5, tete: 12 }, 17.8, 1);
    R.pose(tl, wuro, { bouche: 0, tete: 0 }, 19, 0.5);
    R.pose(tl, wuro, { bA: 122, cA: 0, bR: 20, cR: 30 }, 19.4, 1.2);
    R.expr(tl, wuro, 'sommeil', 20.4, 0.6);
    R.pose(tl, hame, { regard: 0 }, 18, 0.3);
    // Hamé pile plus vite, plus haut
    piler(tl, hame, 20.5, 11, 0.72, 140, pous);
    R.cam(tl, sc, { x: 1060, y: 600, z: 1.3 }, 22, 7);
    // Le coup fatal
    R.pose(tl, hame, { bA: 178, bR: 172, cA: 2, cR: 2, lean: -8 }, 28.5, 0.5, 'power2.out');
    tl.to(hame.p, { y: 878, duration: 0.5, ease: 'power2.out' }, 28.5);
    R.eclairBlanc(tl, 29, 0.8);
    R.secousse(tl, sc, 29, 22, 0.7);
    R.expr(tl, wuro, 'douleur', 29, 0.05);
    R.pose(tl, wuro, { bA: 140, cA: 70 }, 29, 0.15);
    R.expr(tl, hame, 'surprise', 29.1, 0.1);
    tl.to(hame.p, { y: 900, duration: 0.3 }, 29.3);
  });

  // =================================================================== 4 · Le départ
  R.scene('Le départ', 44, (sc, tl) => {
    const d = DECORS.cour(sc, { voute: 540, grenierX: 1580 });
    D.siege(d.fond, WURO_X + 10, 902, 150, 88);
    const villageois = [
      [C.ancien, null, -500, 300],
      [C.colosse, COSTUMES.forgeron, -300, 560],
      [C.elancee, COSTUMES.villageoise, -450, 720],
      [C.filiforme, null, 2300, 1560],
      [C.enfant, null, 2450, 1440],
    ].map(([def, cos, x0, x1]) => ({ p: sc.perso(def, cos, { x: x0, y: 900, dir: x1 > x0 ? 1 : -1 }), x1 }));
    const wuro = sc.perso(C.geant, null, { x: WURO_X, y: 900, dir: -1, assis: 1, bA: 140, cA: 70, bR: 20, cR: 30, lueur: 0.6 });
    Object.assign(wuro.p, R.EXPRESSIONS.douleur);
    const hame = sc.perso(C.ronde, null, { x: HAME_X, y: 900, bA: 178, bR: 172, cA: 2, cR: 2, lean: -8 });
    Object.assign(hame.p, R.EXPRESSIONS.surprise);
    const pilonMain = hame.tenir(D.pilon(190), 'A', { vertical: true });
    const devant = sc.calque();
    D.mortier(devant, HAME_X + 52, 902, 1.15);
    const pilonSol = R.el('g', { opacity: 0 }, devant);
    const ps = D.pilon(190); ps.setAttribute('transform', 'rotate(84)'); pilonSol.appendChild(ps);
    gsap.set(pilonSol, { x: 900, y: 880 });
    const etoile = D.lumiere(sc.monde, 0, 0, 10, '#ffe7a3');
    etoile.setAttribute('opacity', 0);
    sc.cam.x = 1060; sc.cam.y = 600; sc.cam.z = 1.3;

    // Douleur
    R.pose(tl, wuro, { bA: 60, cA: 100, lean: -8 }, 0.1, 0.5);
    tl.to(wuro.p, { lueur: 0, alpha: 0.7, duration: 0.15, yoyo: true, repeat: 9 }, 0.2);
    // Hamé lâche le pilon
    tl.to(pilonMain, { opacity: 0, duration: 0.05 }, 1.2);
    tl.fromTo(pilonSol, { opacity: 1, y: 760 }, { y: 880, duration: 0.4, ease: 'bounce.out', immediateRender: false }, 1.2);
    R.pose(tl, hame, { bA: 150, bR: 145, cA: 150, cR: 150, lean: 0 }, 1.2, 0.4);
    R.expr(tl, hame, 'peur', 1.2);
    R.cam(tl, sc, { x: 1000, y: 560, z: 0.82 }, 2, 2.5);
    // Les villageois accourent puis reculent
    villageois.forEach(({ p, x1 }, i) => {
      R.marche(tl, p, x1, 3.3 + i * 0.25, 3.4, { pas: 7 });
      R.expr(tl, p, 'peur', 6.5);
      tl.to(p.p, { x: x1 + (p.p.dir > 0 ? -45 : 45), lean: -10, duration: 0.6 }, 7);
      R.pose(tl, p, { bA: 60, cA: 90 }, 7, 0.4);
    });
    // Hamé implore
    R.marche(tl, hame, 1060, 8, 1);
    R.pose(tl, hame, { bA: 85, bR: 80, cA: 10, cR: 10, regard: 1 }, 9, 0.6);
    R.expr(tl, hame, 'triste', 9);
    R.parle(tl, hame, 9.3, 4);
    // Wuro, triste, sans colère
    R.expr(tl, wuro, 'triste', 13.4, 0.6);
    R.pose(tl, wuro, { regard: 1, lean: 0 }, 13.4, 0.5);
    tl.to(wuro.p, { tete: 10, duration: 0.35, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 14);
    R.pose(tl, wuro, { tete: 0 }, 16.2, 0.3);
    // Il se lève
    R.pose(tl, wuro, { assis: 0 }, 16.6, 1.6);
    R.marche(tl, hame, 990, 16.8, 0.8);
    R.pose(tl, hame, { assis: 0.55, bA: 60, cA: 80, bR: 60, cR: 80 }, 17.6, 0.8);
    R.pose(tl, wuro, { tete: 28, regard: 0 }, 18.4, 1);
    // Il s'élève, le ciel monte avec lui
    tl.to(wuro.p, { y: -650, s: 0.35, duration: 15, ease: 'power1.in' }, 19.2);
    R.pose(tl, wuro, { bA: 8, cA: 12, bR: -8, lueur: 1 }, 19.4, 1);
    tl.to(d.voute, { y: -1700, duration: 15, ease: 'power1.in' }, 19.3);
    R.cam(tl, sc, { x: 1120, y: -150, z: 0.55 }, 19.5, 12);
    villageois.forEach(({ p }, i) => {
      R.pose(tl, p, { tete: 28, lean: 0, bA: 125, cA: 10 }, 20 + i * 0.3, 0.8);
      R.expr(tl, p, 'surprise', 20 + i * 0.3);
    });
    R.saut(tl, villageois[4].p, 22, 40);
    R.saut(tl, villageois[4].p, 23.5, 40);
    R.pose(tl, hame, { tete: 25, bA: 120, cA: 10 }, 21, 1);
    // Il n'est plus qu'une étoile
    tl.set(etoile, { x: WURO_X, y: -740 }, 30);
    tl.to(etoile, { opacity: 1, scale: 2, transformOrigin: '50% 50%', duration: 3 }, 31);
    tl.to(wuro.p, { alpha: 0, duration: 3 }, 31.5);
    villageois.forEach(({ p }, i) => {
      R.pose(tl, p, { bA: 8, cA: 12, tete: 0 }, 35 + i * 0.2, 1.2);
      R.expr(tl, p, 'triste', 35 + i * 0.2);
    });
    R.expr(tl, hame, 'triste', 35);
    R.pose(tl, hame, { tete: -8, bA: 60, cA: 80 }, 35.5, 1.2);
    R.cam(tl, sc, { x: 1000, y: 380, z: 0.78 }, 35.5, 6);
    R.fonduSortie(tl, 42.5, 1.5);
  });

  // =================================================================== 5 · Le monde sans Wuro
  R.scene('Le monde sans Wuro', 50, (sc, tl) => {
    const plans = [];
    const plan = (debut, fin) => { const g = R.el('g', { style: 'display:none' }, sc.monde); tl.set(g, { display: 'inline' }, debut); tl.set(g, { display: 'none' }, fin); plans.push(g); return g; };
    const sousScene = (g) => ({ calque: () => R.el('g', {}, g), monde: g });

    // 5a · Champ brûlé (0–11)
    const ga = plan(0, 11);
    const champ = DECORS.champ(sousScene(ga), { vert: true });
    const sanouA = sc.perso(C.filiforme, null, { x: 900, y: 880 }, ga);
    tl.set(sc.cam, { x: 960, y: 560, z: 1 }, 0);
    R.fonduEntree(tl, 0, 1);
    tl.to(champ.soleil, { scale: 1.25, transformOrigin: '50% 50%', duration: 1.5, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0);
    tl.to(champ.vert.g, { opacity: 0, duration: 5 }, 1.5);
    tl.to(champ.sec.g, { opacity: 1, duration: 5 }, 1.5);
    const courbe = (i) => ((i * 37) % 30) - 5 + 18;
    tl.to(champ.vert.tiges, { rotation: courbe, svgOrigin: '0 0', duration: 6 }, 1.5);
    tl.to(champ.sec.tiges, { rotation: courbe, svgOrigin: '0 0', duration: 6 }, 1.5);
    R.expr(tl, sanouA, 'triste', 2);
    R.pose(tl, sanouA, { tete: 20 }, 3, 1);
    R.pose(tl, sanouA, { bA: 150, cA: 140 }, 5, 0.8);
    tl.to(sanouA.p, { cA: 120, duration: 0.3, yoyo: true, repeat: 3 }, 5.8);
    R.pose(tl, sanouA, { bA: 8, cA: 12, tete: -15, lean: 10 }, 8, 1);
    R.cam(tl, sc, { z: 1.15 }, 1, 9);

    // 5b · Nuit : la hyène pille le grenier (11–21)
    const gb = plan(11, 21);
    const vb = DECORS.village(sousScene(gb), { ciel: 'nuit', nuit: true });
    const hyene = sc.animal(BESTIAIRE.hyene, { x: -250, y: 885, s: 0.95 }, gb);
    const sac = D.sac(); sac.setAttribute('transform', 'translate(36,40)'); sac.setAttribute('opacity', 0); hyene.teteG.appendChild(sac);
    tl.set(sc.cam, { x: 1150, y: 600, z: 1 }, 11);
    R.fonduEntree(tl, 11, 0.6);
    tl.to(hyene.p, { marcheAmp: 1, duration: 0.2 }, 11.4);
    tl.to(hyene.p, { x: 1290, marche: '+=9', duration: 5, ease: 'none' }, 11.4);
    tl.to(hyene.p, { marcheAmp: 0, duration: 0.2 }, 16.3);
    tl.to(hyene.p, { tete: 25, duration: 0.4 }, 16.6);
    tl.to(sac, { opacity: 1, duration: 0.1 }, 17.1);
    tl.to(hyene.p, { tete: 0, duration: 0.3 }, 17.3);
    tl.set(hyene.p, { dir: -1 }, 17.8);
    tl.to(hyene.p, { marcheAmp: 1.3, duration: 0.1 }, 17.9);
    tl.to(hyene.p, { x: -400, marche: '+=10', duration: 2.6, ease: 'power1.in' }, 17.9);
    R.fonduSortie(tl, 20.4, 0.6);

    // 5c · La dispute pour l'eau (21–33)
    const gc = plan(21, 33);
    DECORS.village(sousScene(gc), { soleil: [1600, 160, 80], ciel: 'chaud' });
    const bado = sc.perso(C.colosse, COSTUMES.forgeron, { x: 800, y: 880 }, gc);
    const sanou = sc.perso(C.filiforme, null, { x: 1125, y: 880, dir: -1 }, gc);
    const devantC = R.el('g', {}, gc);
    const canari = D.canari(devantC, 0, 0, 1);
    gsap.set(canari, { x: 965, y: 882 });
    const flaque = R.el('ellipse', { cx: 1000, cy: 886, rx: 0, ry: 0, fill: '#4d8fb3', opacity: 0.85 }, devantC);
    tl.set(sc.cam, { x: 960, y: 640, z: 1.35 }, 21);
    R.fonduEntree(tl, 21, 0.6);
    R.cartouche(tl, 21.5, 4, 'perso_sanou', 'droite');
    R.pose(tl, bado, { lean: 28, bA: 85, cA: 10 }, 22, 0.6);
    R.pose(tl, sanou, { lean: 30, bA: 85, cA: 10 }, 22.1, 0.6);
    R.expr(tl, bado, 'colere', 22.4); R.expr(tl, sanou, 'colere', 22.4);
    tl.to(canari, { y: 840, duration: 0.5 }, 22.8);
    tl.to(bado.p, { lean: -6, duration: 0.45, yoyo: true, repeat: 5 }, 23);
    tl.to(sanou.p, { lean: 4, duration: 0.45, yoyo: true, repeat: 5 }, 23.2);
    tl.to(canari, { x: 945, duration: 0.45, yoyo: true, repeat: 5 }, 23);
    R.parle(tl, bado, 23, 3); R.parle(tl, sanou, 23.3, 2.7);
    // Bado frappe, Sanou tombe, le canari se brise
    R.pose(tl, bado, { lean: 12, bA: 95, cA: 0, bR: -30 }, 26, 0.18, 'power3.out');
    tl.to(sanou.p, { rot: 82, x: 1180, duration: 0.45, ease: 'power2.in' }, 26.15);
    R.expr(tl, sanou, 'douleur', 26.15, 0.05);
    R.secousse(tl, sc, 26.6, 16, 0.4);
    tl.to(canari, { y: 882, rotation: 95, svgOrigin: '965 882', duration: 0.4, ease: 'power2.in' }, 26.2);
    tl.to(flaque, { attr: { rx: 120, ry: 12 }, duration: 0.8, ease: 'power2.out' }, 26.6);
    tl.to(flaque, { opacity: 0, duration: 4 }, 27.5);
    R.expr(tl, bado, 'surprise', 26.8);
    R.pose(tl, bado, { bA: 8, cA: 12, bR: -8, lean: 0 }, 27, 0.5);
    // Sanou se relève et rend le coup
    tl.to(sanou.p, { rot: 0, x: 1125, duration: 1, ease: 'power2.out' }, 28);
    R.expr(tl, sanou, 'colere', 28.6);
    R.expr(tl, bado, 'colere', 28.8);
    R.pose(tl, sanou, { lean: 14, bA: 100, cA: 0 }, 29.3, 0.18, 'power3.out');
    tl.to(bado.p, { lean: -22, x: 760, duration: 0.25 }, 29.45);
    R.pose(tl, bado, { bA: 140, cA: 140 }, 29.5, 0.2);
    R.pose(tl, sanou, { lean: 0, bA: 8, cA: 12 }, 30, 0.5);
    R.pose(tl, bado, { lean: 0, bA: 70, cA: 110, bR: 70, cR: 110 }, 30.3, 0.6);
    R.pose(tl, sanou, { bA: 70, cA: 110, bR: 70, cR: 110 }, 30.5, 0.6);
    tl.to([bado.p, sanou.p], { bob: 3, duration: 0.25, yoyo: true, repeat: 7 }, 30.6);
    R.fonduSortie(tl, 32.4, 0.6);

    // 5d · Tiko malade (33–41)
    const gd = plan(33, 41);
    DECORS.cour(sousScene(gd), { grenierX: 1580 });
    R.el('rect', { x: 820, y: 892, width: 220, height: 12, rx: 4, fill: '#d9b26a', stroke: '#9a7a3a', 'stroke-width': 2 }, gd);
    const tikoD = sc.perso(C.enfant, null, { x: 1010, y: 882, rot: -90 }, gd);
    Object.assign(tikoD.p, R.EXPRESSIONS.malade);
    const hameD = sc.perso(C.ronde, null, { x: 760, y: 900, assis: 0.65 }, gd);
    Object.assign(hameD.p, R.EXPRESSIONS.triste);
    hameD.tenir(D.eventail(), 'A', { vertical: true });
    tl.set(sc.cam, { x: 900, y: 720, z: 1.5 }, 33);
    R.fonduEntree(tl, 33, 0.6);
    tl.fromTo(hameD.p, { bA: 85, cA: 10 }, { bA: 115, cA: 25, duration: 0.4, yoyo: true, repeat: 15, ease: 'sine.inOut', immediateRender: false }, 33.2);
    tl.to(tikoD.p, { bouche: 0.5, duration: 0.15, yoyo: true, repeat: 3 }, 35.5);
    tl.to(tikoD.p, { bouche: 0.5, duration: 0.15, yoyo: true, repeat: 3 }, 38);
    R.cam(tl, sc, { z: 1.7, x: 880 }, 33.5, 7);
    R.fonduSortie(tl, 40.4, 0.6);

    // 5e · L'Ancien prie le ciel vide (41–50)
    const ge = plan(41, 50);
    DECORS.village(sousScene(ge), { ciel: 'chaud', soleil: [1600, 160, 80] });
    const yeli = sc.perso(C.ancien, null, { x: 960, y: 880 }, ge);
    yeli.tenir(D.baton(200), 'R', { vertical: true });
    tl.set(sc.cam, { x: 960, y: 640, z: 1.3 }, 41);
    R.fonduEntree(tl, 41, 0.6);
    R.cartouche(tl, 41.5, 4.5, 'perso_yeli');
    R.pose(tl, yeli, { lean: 0, bA: 168, bR: 165, cA: 8, cR: 8, tete: 30 }, 42, 1.6);
    R.expr(tl, yeli, 'triste', 42);
    R.parle(tl, yeli, 43.5, 3);
    R.cam(tl, sc, { y: 300, z: 0.75 }, 42.5, 5);
    R.pose(tl, yeli, { bA: 8, bR: -8, cA: 12, cR: 12, tete: -20, lean: 22 }, 46.8, 2);
    R.fonduSortie(tl, 48.5, 1.5);
  });

  // =================================================================== 6 · Les trois fils
  R.scene('Les trois fils', 20, (sc, tl) => {
    const fond = sc.calque();
    D.ciel(fond, '#0b1233', '#3a4f9a');
    D.etoiles(fond, 160, 61);
    for (let i = 0; i < 6; i++) D.nuage(fond, -100 + i * 400, 1010 + (i % 2) * 30, 1.4, '#c9d3f2');
    const wuro = sc.perso(C.geant, null, { x: 860, y: 1250, s: 1.4, tete: -18, lueur: 1, bA: 20, cA: 30 });
    Object.assign(wuro.p, R.EXPRESSIONS.triste);
    const fils = [['#ffd23f', -60], ['#7fbf3f', 0], ['#3f8a2a', 60]].map(([c]) => {
      const l = D.lumiere(sc.monde, 0, 0, 16, c);
      l.setAttribute('opacity', 0);
      return l;
    });
    R.fonduEntree(tl, 0, 1.2);
    R.cam(tl, sc, { z: 1.08 }, 0, 8);
    R.expr(tl, wuro, 'serein', 5);
    R.pose(tl, wuro, { tete: -8 }, 5, 1);
    R.pose(tl, wuro, { bA: 70, bR: 65, cA: 35, cR: 35 }, 6.2, 1.4);
    fils.forEach((l, i) => {
      const x = 1110 + i * 50, y = 830 - (i % 2) * 20;
      tl.fromTo(l, { x, y, scale: 0, opacity: 1, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.7, ease: 'back.out(2)', immediateRender: false }, 8 + i * 0.4);
      tl.to(l, { x: 980 + i * 140, y: 560 - i * 40, duration: 2.6, ease: 'sine.inOut' }, 9.2);
      tl.to(l, { y: 1500, x: 1000 + i * 260, duration: 1, ease: 'power2.in' }, 13.2 + i * 0.8);
    });
    R.expr(tl, wuro, 'joie', 9);
    R.pose(tl, wuro, { bA: 20, bR: 10, cA: 30, cR: 30, tete: -15 }, 13, 1.5);
    R.fonduSortie(tl, 18.5, 1.5);
  });

  // =================================================================== 7 · Kwere, la foudre
  R.scene('Kwere', 30, (sc, tl) => {
    const champ = DECORS.champ(sc, {});
    const courbe = (i) => ((i * 37) % 30) - 5 + 18;
    champ.sec.tiges.forEach((t, i) => gsap.set(t, { rotation: courbe(i), svgOrigin: '0 0' }));
    champ.vert.tiges.forEach((t, i) => gsap.set(t, { rotation: courbe(i), svgOrigin: '0 0' }));
    gsap.set(champ.vert.g, { scaleY: 0.6, svgOrigin: '960 860' });
    const nuages = R.el('g', {}, sc.monde);
    const ns = [];
    for (let i = 0; i < 8; i++) ns.push(D.nuage(nuages, (i < 4 ? -900 : 2800) + (i % 4) * 120, 80 + (i % 3) * 70, 1.8, '#4a5068'));
    const eclairs = [[700, 2], [1300, 5], [420, 8]].map(([x, s]) => D.eclair(sc.monde, x, -100, 860, s));
    const kwere = sc.perso(C.kwere, null, { x: 960, y: 880, alpha: 0, lueur: 1 });
    kwere.tenir(D.baton(240, '#ffd23f'), 'A', { vertical: true });
    const sanou = sc.perso(C.filiforme, null, { x: -250, y: 880 });
    const hame = sc.perso(C.ronde, null, { x: 2150, y: 880, dir: -1 });
    const tiko = sc.perso(C.enfant, null, { x: 2300, y: 880, dir: -1 });
    const pluie = D.pluie(sc.monde, 220, 33);
    sc.cam.y = 560;

    R.fonduEntree(tl, 0, 1);
    chute(tl, sc.monde, '#ffd23f', 960, 760, 1.4, 0.6);
    R.eclairBlanc(tl, 2, 0.5);
    tl.to(kwere.p, { alpha: 1, duration: 0.2 }, 2);
    R.cartouche(tl, 3, 4.5, 'perso_kwere');
    // L'orage se lève
    R.pose(tl, kwere, { bA: 172, cA: 0 }, 6, 0.8);
    R.pose(tl, kwere, { sourcils: 0.7, sourire: 0.4 }, 6, 0.4);
    tl.to(champ.cielOrage, { opacity: 1, duration: 3 }, 6);
    tl.to(champ.soleil, { opacity: 0, duration: 2 }, 6);
    ns.forEach((n, i) => tl.to(n, { x: i < 4 ? '+=1500' : '-=1750', duration: 3.5, ease: 'power2.out' }, 6 + (i % 4) * 0.2));
    // La foudre frappe
    R.pose(tl, kwere, { bA: 55, cA: 0, lean: 15 }, 10, 0.15, 'power3.in');
    eclairs.forEach((e, i) => {
      const t = [10.15, 11, 12.3][i];
      tl.to(e, { opacity: 1, duration: 0.04 }, t);
      tl.to(e, { opacity: 0, duration: 0.3 }, t + 0.15);
      R.eclairBlanc(tl, t, 0.35);
    });
    R.secousse(tl, sc, 10.15, 18, 0.6);
    R.pose(tl, kwere, { bA: 100, lean: 0 }, 11.5, 0.6);
    // La pluie
    tl.to(pluie, { opacity: 1, duration: 0.8 }, 13);
    tl.fromTo(pluie.inner, { y: 0 }, { y: pluie.zoneH, duration: 0.6, ease: 'none', repeat: 26, immediateRender: false }, 13);
    R.marche(tl, sanou, 520, 14, 2.6);
    R.marche(tl, hame, 1420, 14.2, 2.8);
    R.marche(tl, tiko, 1260, 14.4, 2.4, { pas: 6 });
    [sanou, hame, tiko].forEach((p, i) => {
      R.expr(tl, p, 'joie', 15 + i * 0.3);
      R.pose(tl, p, { bA: 125, bR: 120, cA: 0, cR: 0, tete: 22 }, 17.2 + i * 0.2, 0.6);
    });
    R.expr(tl, tiko, 'rire', 18);
    [18.2, 19.1, 20, 20.9].forEach((t) => R.saut(tl, tiko, t, 50, 0.6));
    // Le mil revit
    tl.to(champ.sec.g, { opacity: 0, duration: 5 }, 16);
    tl.to(champ.vert.g, { opacity: 1, duration: 4 }, 16);
    tl.to(champ.vert.tiges, { rotation: 0, duration: 6, ease: 'power2.out', stagger: 0.02 }, 16.5);
    tl.to(champ.vert.g, { scaleY: 1, duration: 7, ease: 'power2.out' }, 16.5);
    // Kwere salue et repart dans un éclair
    R.pose(tl, kwere, { tete: -12 }, 22, 0.3);
    R.pose(tl, kwere, { tete: 0 }, 22.5, 0.3);
    R.expr(tl, kwere, 'joie', 22);
    R.eclairBlanc(tl, 25.3, 0.5);
    tl.to(kwere.p, { alpha: 0, duration: 0.1 }, 25.35);
    R.cam(tl, sc, { z: 0.9 }, 14, 12);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 8 · Soxo, l'esprit de la brousse
  R.scene('Soxo', 35, (sc, tl) => {
    const ga = R.el('g', {}, sc.monde);
    const gb = R.el('g', { style: 'display:none' }, sc.monde);
    tl.set(ga, { display: 'none' }, 24.5);
    tl.set(gb, { display: 'inline' }, 24.5);
    const sous = (g) => ({ calque: () => R.el('g', {}, g), monde: g });

    // 8a · Brousse
    DECORS.brousse(sous(ga));
    const yeli = sc.perso(C.ancien, null, { x: -200, y: 880 }, ga);
    yeli.tenir(D.baton(200), 'R', { vertical: true });
    const fY = objet(D.feuilles(), false); yeli.tenir(fY, 'A', { vertical: true });
    const hyene = sc.animal(BESTIAIRE.hyene, { x: 2200, y: 885, dir: -1 }, ga);
    const soxo = sc.perso(C.soxo, null, { x: 1000, y: 880, alpha: 0, frisson: 0.4 }, ga);
    const fS = objet(D.feuilles(), false); soxo.tenir(fS, 'A', { vertical: true });
    sc.cam.x = 900; sc.cam.y = 600; sc.cam.z = 0.95;

    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.6, 4, 'lieu_brousse');
    R.marche(tl, yeli, 700, 1, 7, { pas: 7 });
    [3, 5, 7].forEach((t, i) => R.pose(tl, yeli, { tete: i % 2 ? -10 : 10, regard: i % 2 ? -1 : 1 }, t, 0.6));
    R.expr(tl, yeli, 'triste', 2);
    // La hyène
    tl.to(hyene.p, { marcheAmp: 1, duration: 0.2 }, 6.8);
    tl.to(hyene.p, { x: 1300, marche: '+=6', duration: 3, ease: 'power1.out' }, 6.8);
    tl.to(hyene.p, { marcheAmp: 0, duration: 0.3 }, 9.6);
    tl.to(hyene.p, { gueule: 1, duration: 0.2, yoyo: true, repeat: 7 }, 10);
    R.expr(tl, yeli, 'peur', 10.2);
    tl.to(yeli.p, { x: 640, lean: 0, duration: 0.5 }, 10.2);
    R.pose(tl, yeli, { bA: 90, cA: 30, regard: 1, tete: 0 }, 10.3, 0.4);
    // Soxo surgit
    chute(tl, ga, '#7fbf3f', 1000, 760, 11.8, 0.6);
    tl.to(soxo.p, { alpha: 1, duration: 0.3 }, 12.4);
    R.cartouche(tl, 13, 4.5, 'perso_soxo', 'droite');
    R.pose(tl, soxo, { bA: 95, cA: 0, frisson: 1 }, 14, 0.6);
    R.expr(tl, soxo, 'serein', 14);
    tl.to(hyene.p, { gueule: 0, tete: 15, duration: 0.4 }, 14.5);
    tl.to(hyene.p, { couche: 1, duration: 1.2 }, 14.8);
    tl.to(hyene.p, { couche: 0, duration: 0.8 }, 16.6);
    tl.set(hyene.p, { dir: 1, tete: 0 }, 17.4);
    tl.to(hyene.p, { marcheAmp: 1, duration: 0.2 }, 17.5);
    tl.to(hyene.p, { x: 2400, marche: '+=8', duration: 3, ease: 'none' }, 17.5);
    R.pose(tl, soxo, { bA: 8, cA: 12, frisson: 0.4 }, 17.6, 0.5);
    R.expr(tl, yeli, 'surprise', 15);
    R.pose(tl, yeli, { bA: 8, cA: 12, lean: 14 }, 16, 0.5);
    // Les feuilles qui guérissent
    tl.set(soxo.p, { dir: 1 }, 18.4);
    R.marche(tl, soxo, 1080, 18.5, 0.8);
    R.pose(tl, soxo, { bA: 168, cA: 0, tete: 20 }, 19.4, 0.6);
    montrer(tl, fS, 20.1);
    R.pose(tl, soxo, { bA: 60, cA: 30, tete: 0 }, 20.3, 0.5);
    tl.set(soxo.p, { dir: -1 }, 20.8);
    R.marche(tl, soxo, 820, 20.9, 1.5);
    R.pose(tl, soxo, { bA: 85, cA: 5 }, 22.4, 0.4);
    R.pose(tl, yeli, { bA: 85, cA: 5, lean: 6 }, 22.5, 0.4);
    cacher(tl, fS, 23, 0.1); montrer(tl, fY, 23, 0.1);
    R.pose(tl, yeli, { lean: 40, tete: 10, bA: 40 }, 23.3, 0.5);
    R.pose(tl, yeli, { lean: 14, tete: 0 }, 24, 0.4);
    R.expr(tl, yeli, 'joie', 23.3);
    R.fonduSortie(tl, 23.8, 0.7);

    // 8b · Tiko guéri
    DECORS.cour(sous(gb), { grenierX: 1580 });
    R.el('rect', { x: 820, y: 892, width: 220, height: 12, rx: 4, fill: '#d9b26a', stroke: '#9a7a3a', 'stroke-width': 2 }, gb);
    const tiko = sc.perso(C.enfant, null, { x: 1010, y: 882, rot: -90 }, gb);
    Object.assign(tiko.p, R.EXPRESSIONS.malade);
    const hame = sc.perso(C.ronde, null, { x: 700, y: 900, assis: 0.65 }, gb);
    Object.assign(hame.p, R.EXPRESSIONS.triste);
    const yeli2 = sc.perso(C.ancien, null, { x: -100, y: 900 }, gb);
    yeli2.tenir(D.baton(200), 'R', { vertical: true });
    const fY2 = D.feuilles(); yeli2.tenir(fY2, 'A', { vertical: true });
    const surTiko = R.el('g', { opacity: 0 }, gb);
    const ft = D.feuilles(); ft.setAttribute('transform', 'translate(925,872) rotate(80)'); surTiko.appendChild(ft);
    tl.set(sc.cam, { x: 860, y: 700, z: 1.3 }, 24.5);
    R.fonduEntree(tl, 24.5, 0.6);
    R.marche(tl, yeli2, 860, 25, 3, { pas: 4 });
    R.pose(tl, yeli2, { lean: 45, bA: 50, cA: 10 }, 28, 0.6);
    cacher(tl, fY2, 28.6, 0.15);
    tl.to(surTiko, { opacity: 1, duration: 0.15 }, 28.6);
    R.pose(tl, yeli2, { lean: 14, bA: 8, cA: 12 }, 29, 0.5);
    R.expr(tl, tiko, 'joie', 29.5, 0.6);
    tl.to(surTiko, { opacity: 0, duration: 0.3 }, 29.8);
    tl.to(tiko.p, { rot: 0, x: 960, y: 900, duration: 0.9, ease: 'back.out(1.5)' }, 29.9);
    R.saut(tl, tiko, 31, 50, 0.5);
    tl.set(tiko.p, { dir: -1 }, 31.5);
    R.marche(tl, tiko, 790, 31.6, 0.8, { pas: 3 });
    R.expr(tl, hame, 'joie', 31.8);
    R.pose(tl, hame, { bA: 85, cA: 70, bR: 80, cR: 70 }, 32.2, 0.4);
    R.pose(tl, yeli2, { tete: 8 }, 32, 0.4);
    R.expr(tl, yeli2, 'joie', 32);
    R.fonduSortie(tl, 33.5, 1.5);
  });

  // =================================================================== 9 · Dwo, le masque de feuilles
  R.scene('Dwo', 40, (sc, tl) => {
    DECORS.village(sc, {});
    const bras = { bA: 75, cA: 110, bR: 75, cR: 110 };
    const foule = {
      passante: sc.perso(C.elancee, COSTUMES.villageoise, { x: 200, y: 880 }),
      yeli: sc.perso(C.ancien, null, { x: 360, y: 880 }),
      trapu: sc.perso(C.trapu, COSTUMES.villageois, { x: 1790, y: 880, dir: -1 }),
      hame: sc.perso(C.ronde, null, { x: 1560, y: 880, dir: -1 }),
      tiko: sc.perso(C.enfant, null, { x: 1660, y: 880, dir: -1 }),
    };
    const bado = sc.perso(C.colosse, COSTUMES.forgeron, Object.assign({ x: 580, y: 880 }, bras, R.EXPRESSIONS.colere));
    const sanou = sc.perso(C.filiforme, null, Object.assign({ x: 1360, y: 880, dir: -1 }, bras, R.EXPRESSIONS.colere));
    const dwo = sc.perso(C.dwo, null, { x: 960, y: 880, alpha: 0, frisson: 0.5 });
    sc.cam.y = 560; sc.cam.z = 0.95;

    R.fonduEntree(tl, 0, 1);
    tl.to([bado.p, sanou.p], { bob: 2, duration: 0.6, yoyo: true, repeat: 2 }, 0.5);
    chute(tl, sc.monde, '#3f8a2a', 960, 740, 2, 0.7);
    tl.to(dwo.p, { alpha: 1, duration: 0.3 }, 2.7);
    R.cartouche(tl, 3.5, 4.5, 'perso_dwo');
    Object.values(foule).concat([bado, sanou]).forEach((p, i) => R.expr(tl, p, 'surprise', 3 + i * 0.1));
    // La danse du masque
    tl.to(dwo.p, { frisson: 1.6, duration: 0.5 }, 5);
    R.danse(tl, dwo, 5, 9, { y: 880, saut: 34, tempo: 0.5 });
    [6.5, 8, 9.5, 11, 12.5].forEach((t, i) => tl.set(dwo.p, { dir: i % 2 ? 1 : -1 }, t));
    // Il secoue ses feuilles devant Bado, puis Sanou
    tl.set(dwo.p, { dir: -1 }, 14);
    R.marche(tl, dwo, 720, 14, 1);
    tl.to(dwo.p, { lean: 12, duration: 0.2, yoyo: true, repeat: 4 }, 15);
    R.expr(tl, bado, 'surprise', 15.2);
    tl.set(dwo.p, { dir: 1 }, 16.1);
    R.marche(tl, dwo, 1200, 16.2, 1.2);
    tl.to(dwo.p, { lean: 12, duration: 0.2, yoyo: true, repeat: 4 }, 17.4);
    R.expr(tl, sanou, 'surprise', 17.6);
    R.marche(tl, dwo, 1260, 18.5, 0.6);
    // Réconciliation
    R.pose(tl, bado, { bA: 8, cA: 12, bR: -8, cR: 12, regard: 1 }, 19, 0.5);
    R.pose(tl, sanou, { bA: 8, cA: 12, bR: -8, cR: 12, regard: 1 }, 19.2, 0.5);
    R.expr(tl, bado, 'neutre', 19.5); R.expr(tl, sanou, 'neutre', 19.5);
    R.marche(tl, bado, 890, 19.8, 1.8);
    R.marche(tl, sanou, 1135, 19.9, 1.7);
    R.pose(tl, bado, { bA: 85, cA: 0 }, 21.8, 0.4);
    R.pose(tl, sanou, { bA: 85, cA: 0 }, 21.9, 0.4);
    tl.to([bado.p, sanou.p], { cA: 12, duration: 0.2, yoyo: true, repeat: 5 }, 22.3);
    R.expr(tl, bado, 'joie', 22.4); R.expr(tl, sanou, 'joie', 22.6);
    R.pose(tl, bado, { bA: 8, cA: 12 }, 23.6, 0.4);
    R.pose(tl, sanou, { bA: 8, cA: 12 }, 23.6, 0.4);
    // Tout le village danse
    const danseurs = [dwo, bado, sanou].concat(Object.values(foule));
    danseurs.forEach((p, i) => {
      R.expr(tl, p, i === 0 ? 'neutre' : 'rire', 24);
      R.danse(tl, p, 24.2 + (i % 3) * 0.12, 12, { y: 880, tempo: 0.45 + (i % 3) * 0.05, saut: i === 0 ? 34 : 16 });
    });
    tl.to(dwo.p, { frisson: 2, duration: 0.5 }, 24);
    R.cam(tl, sc, { z: 0.8, x: 1000, y: 520 }, 24, 6);
    R.cam(tl, sc, { z: 0.9, x: 940 }, 30, 8);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 10 · Épilogue
  R.scene('Épilogue', 25, (sc, tl) => {
    const d = DECORS.cour(sc, { ciel: 'soir', etoiles: true, grenierX: 1580 });
    d.etoiles.setAttribute('opacity', 0);
    const nuit = R.el('rect', { x: -1000, y: -2000, width: 3920, height: 2900, fill: D.degrade('#04071a', '#1d2a5c'), opacity: 0 }, d.fond);
    d.fond.insertBefore(nuit, d.etoiles);
    const hame = sc.perso(C.ronde, null, { x: HAME_X, y: 900, bA: 70, bR: 64, cA: 25, cR: 25 });
    hame.tenir(D.pilon(190), 'A', { vertical: true });
    const devant = sc.calque();
    D.mortier(devant, HAME_X + 52, 902, 1.15);
    const pous = D.particules(devant, 24, HAME_X + 52, 808, '#efe1b0', 9);
    const etoile = D.lumiere(sc.monde, 1220, -60, 9, '#ffe7a3');
    gsap.set(etoile, { scale: 0.4, transformOrigin: '50% 50%' });
    sc.cam.x = 1000; sc.cam.y = 640; sc.cam.z = 1.2;

    R.fonduEntree(tl, 0, 1.2);
    piler(tl, hame, 1, 5, 1.2, 110, pous);
    R.expr(tl, hame, 'serein', 1);
    tl.to(nuit, { opacity: 1, duration: 6 }, 3);
    tl.to(d.etoiles, { opacity: 1, duration: 4 }, 6);
    R.pose(tl, hame, { tete: 32, lean: -6 }, 7.6, 1);
    R.expr(tl, hame, 'neutre', 7.6);
    R.cam(tl, sc, { x: 1080, y: 250, z: 0.85 }, 8, 4);
    tl.to(etoile, { scale: 1.6, duration: 1.2, ease: 'power2.out' }, 10.5);
    tl.to(etoile, { scale: 1.2, duration: 0.6, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 11.7);
    R.expr(tl, hame, 'joie', 11.5, 0.8);
    R.fonduSortie(tl, 14, 1.5);
    R.titre(tl, 15.5, 4, 'fin');
    R.generique(tl, 19.2, 5.8, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
