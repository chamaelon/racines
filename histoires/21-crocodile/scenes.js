/*
 * 21 · Le crocodile qui sauva l'ancêtre — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;

  const ABEM = [C.filiforme, Object.assign({}, H.chasseur, { haut: { type: 'tunique', couleur: '#b9864e', motif: 'amulettes', motifCouleur: '#5a3a20' } })];
  const abem = (sc, pose, parent) => { const p = sc.perso(ABEM[0], ABEM[1], Object.assign({ y: SOL }, pose), parent); p.arc = p.tenir(D.arc(), 'R', { vertical: true }); return p; };
  /** Brousse brûlée par la sécheresse (couleurs passées). */
  const brousseSeche = (sc, o) => {
    const d = DECORS.brousse(sc, Object.assign({ ciel: 'chaud' }, o || {}));
    R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#e8b070', opacity: 0.25 }, d.fond);
    d.soleil = D.soleil(d.fond, 1500, 170, 90, '#fff1a8');
    return d;
  };
  /** Vibration de chaleur : la caméra ondule lentement. */
  const chaleur = (tl, sc, at, duree) => tl.to(sc.cam, { r: 0.6, duration: 1.4, yoyo: true, repeat: Math.round(duree / 1.4), ease: 'sine.inOut' }, at);

  // =================================================================== 1 · Abem
  R.scene('Abem', 26, (sc, tl) => {
    brousseSeche(sc);
    const a = abem(sc, { x: -200 });
    sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    R.marche(tl, a, 800, 2, 8);
    R.cartouche(tl, 8, 5, 'perso_ancetre');
    R.expr(tl, a, 'serein', 8);
    R.cam(tl, sc, { x: 850, y: 640, z: 1.25 }, 9, 12);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · La poursuite
  R.scene('La poursuite', 36, (sc, tl) => {
    const d = brousseSeche(sc);
    const a = abem(sc, { x: 300 });
    const gaz = sc.bete(B.gazelle, { x: 1100, y: SOL, s: 1.2, traits: 1 });
    sc.cam.x = 760; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_brousse');
    R.expr(tl, a, 'surprise', 3);
    R.pose(tl, a, { lean: 20 }, 3.5, 0.5);
    G.tirer(tl, a, sc.monde, 5, 1250, 760, 0.45);
    R.marche(tl, gaz, 2400, 5.8, 3, { pas: 10, amp: 1.4 });
    R.pose(tl, a, { lean: 0 }, 6.5, 0.4);
    R.expr(tl, a, 'colere', 7);
    R.marche(tl, a, 2200, 8, 7, { pas: 18, amp: 1.3 });
    R.cam(tl, sc, { x: 1400 }, 8, 7);
    R.fonduSortie(tl, 15.4, 0.6);
    R.fonduEntree(tl, 16.2, 0.6);
    tl.set(a.p, { x: -200 }, 16);
    tl.set(sc.cam, { x: 900 }, 16);
    R.marche(tl, a, 900, 16.5, 6, { pas: 9 });
    [23, 24.5, 26].forEach((t, i) => { tl.set(a.p, { dir: i % 2 ? -1 : 1 }, t); R.pose(tl, a, { regard: i % 2 ? -1 : 1, tete: 8 }, t, 0.3); });
    R.expr(tl, a, 'peur', 24);
    chaleur(tl, sc, 22, 12);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 3 · La soif
  R.scene('La soif', 34, (sc, tl) => {
    const d = brousseSeche(sc);
    const a = abem(sc, { x: 400, lean: 15 });
    Object.assign(a.p, R.EXPRESSIONS.douleur);
    const gourde = D.calebasse(); a.tenir(gourde, 'A', { vertical: true });
    const vautours = [0, 1].map((i) => { const g = R.el('path', { d: 'M-30,0 q15,-14 30,0 q15,-14 30,0', stroke: '#2a1a10', 'stroke-width': 5, fill: 'none' }, sc.monde); return g; });
    sc.cam.x = 760; sc.cam.y = 640; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_soif');
    chaleur(tl, sc, 0, 34);
    R.marche(tl, a, 900, 1, 9, { pas: 7, amp: 0.6 });
    tl.to(d.soleil, { scale: 1.3, transformOrigin: '50% 50%', duration: 1.5, yoyo: true, repeat: 9 }, 0);
    // Il secoue sa gourde : vide
    R.pose(tl, a, { bA: 150, cA: 60, tete: 20 }, 10.5, 0.5);
    tl.to(a.p, { cA: 30, duration: 0.15, yoyo: true, repeat: 5 }, 11);
    R.expr(tl, a, 'triste', 12);
    R.pose(tl, a, { bA: 8, cA: 12, tete: 0 }, 13, 0.5);
    tl.to(gourde, { opacity: 0, duration: 0.3 }, 14);
    R.cam(tl, sc, { x: 900, y: 700, z: 1.6 }, 12, 3);
    // Il tombe
    G.agenouiller(tl, a, 16);
    tl.to(a.p, { rot: -88, x: 860, y: 860, duration: 1, ease: 'power2.in' }, 19);
    R.expr(tl, a, 'malade', 19);
    tl.to(a.p, { yeux: 0.9, duration: 1 }, 21);
    vautours.forEach((v, i) => tl.fromTo(v, { x: 900 + i * 200, y: 200 }, { x: 1100 - i * 200, y: 260, duration: 4, yoyo: true, repeat: 2, ease: 'sine.inOut', immediateRender: false }, 20 + i));
    R.cam(tl, sc, { x: 900, y: 560, z: 0.95 }, 22, 6);
    R.fonduSortie(tl, 32, 2);
  });

  // =================================================================== 4 · Le crocodile
  R.scene('Le crocodile', 36, (sc, tl) => {
    brousseSeche(sc);
    const a = abem(sc, Object.assign({ x: 860, y: 860, rot: -88, yeux: 0.9 }, R.EXPRESSIONS.malade));
    const croco = sc.bete(B.crocodile, { x: 2300, y: SOL + 4, dir: -1, s: 1.1 });
    sc.cam.x = 1100; sc.cam.y = 650; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1.5);
    tl.to(croco.p, { marcheAmp: 1, duration: 0.3 }, 1);
    tl.to(croco.p, { x: 1300, marche: '+=10', duration: 9, ease: 'none' }, 1);
    tl.to(croco.p, { marcheAmp: 0, duration: 0.3 }, 9.8);
    R.cartouche(tl, 3, 5, 'perso_crocodile', 'droite');
    R.cam(tl, sc, { x: 1050, y: 720, z: 1.4 }, 8, 3);
    tl.to(a.p, { yeux: 0.2, duration: 0.6 }, 11);
    R.expr(tl, a, 'peur', 11.5);
    tl.to(a.p, { x: 800, duration: 1 }, 12);
    tl.to(croco.p, { gueule: 0.6, duration: 0.4, yoyo: true, repeat: 1 }, 13);
    tl.to(croco.p, { tete: -8, duration: 0.6, yoyo: true, repeat: 3 }, 15);
    R.cam(tl, sc, { x: 1100, y: 780, z: 2 }, 15, 3);
    R.expr(tl, a, 'surprise', 20);
    tl.to(croco.p, { x: 1200, marcheAmp: 0.5, marche: '+=2', duration: 2 }, 21);
    tl.to(croco.p, { marcheAmp: 0, duration: 0.3 }, 23);
    R.cam(tl, sc, { x: 1000, y: 700, z: 1.4 }, 23, 4);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 5 · Le guide
  R.scene('Le guide', 36, (sc, tl) => {
    brousseSeche(sc);
    const a = abem(sc, Object.assign({ x: 800, y: 860, rot: -88 }, R.EXPRESSIONS.malade));
    const croco = sc.bete(B.crocodile, { x: 1150, y: SOL + 4, dir: -1, s: 1.1 });
    sc.cam.x = 950; sc.cam.y = 700; sc.cam.z = 1.4;
    R.fonduEntree(tl, 0, 1);
    // Il pousse Abem du museau ; Abem se relève
    tl.to(croco.p, { x: 960, marcheAmp: 0.6, marche: '+=3', duration: 2 }, 1);
    tl.to(croco.p, { marcheAmp: 0, tete: 10, duration: 0.4 }, 3);
    tl.to(croco.p, { tete: -6, duration: 0.3, yoyo: true, repeat: 3 }, 3.5);
    tl.to(a.p, { rot: 0, x: 820, y: SOL, duration: 1.4, ease: 'power2.out' }, 5.5);
    R.pose(tl, a, { assis: 0.7, lean: 20 }, 5.5, 0.6);
    R.expr(tl, a, 'surprise', 7);
    G.relever(tl, a, 8.5);
    R.cam(tl, sc, { x: 1000, y: 640, z: 1.15 }, 8, 3);
    // Le crocodile repart en se retournant : « suis-moi »
    tl.set(croco.p, { dir: 1 }, 11);
    tl.to(croco.p, { marcheAmp: 1, duration: 0.3 }, 11.2);
    tl.to(croco.p, { x: 2400, marche: '+=20', duration: 14, ease: 'none' }, 11.2);
    [14, 18, 22].forEach((t) => tl.to(croco.p, { tete: -20, duration: 0.4, yoyo: true, repeat: 1 }, t));
    R.marche(tl, a, 2200, 12.5, 14, { pas: 16, amp: 0.7 });
    R.expr(tl, a, 'neutre', 12);
    R.cam(tl, sc, { x: 1500, y: 620, z: 1 }, 12, 14);
    chaleur(tl, sc, 12, 20);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 6 · La mare cachée
  R.scene('La mare cachée', 38, (sc, tl) => {
    const d = DECORS.brousse(sc, { mare: 1150, mareL: 600 });
    const croco = sc.bete(B.crocodile, { x: -100, y: SOL + 4, s: 1.1 });
    const a = abem(sc, { x: -350, lean: 15 });
    Object.assign(a.p, R.EXPRESSIONS.malade);
    const eclab = D.particules(sc.monde, 16, 900, 890, '#cfe8f1', 21);
    sc.cam.x = 900; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_mare');
    tl.to(croco.p, { marcheAmp: 1, duration: 0.3 }, 0.5);
    tl.to(croco.p, { x: 1300, marche: '+=12', duration: 7, ease: 'none' }, 0.5);
    tl.to(croco.p, { y: SOL + 26, marcheAmp: 0, duration: 1 }, 7.5);
    R.marche(tl, a, 760, 1, 7, { pas: 9 });
    R.expr(tl, a, 'surprise', 7.5);
    R.pose(tl, a, { lean: 0, tete: 10 }, 7.5, 0.5);
    R.expr(tl, a, 'joie', 9);
    R.marche(tl, a, 880, 10, 1.2, { pas: 2, amp: 1.2 });
    G.agenouiller(tl, a, 11.3);
    R.pose(tl, a, { lean: 50, bA: 50, cA: 80, bR: 50, cR: 80 }, 12, 0.6);
    R.jaillir(tl, eclab, 12.6, 0, { n: 8, ecart: 14, haut: 25 });
    tl.to(a.p, { cA: 130, cR: 130, duration: 0.5, yoyo: true, repeat: 5 }, 13);
    R.cam(tl, sc, { x: 900, y: 760, z: 1.9 }, 12, 3);
    R.pose(tl, a, { lean: 0, bA: 8, cA: 12, bR: -8, cR: 12 }, 19, 0.6);
    G.relever(tl, a, 19.5);
    R.expr(tl, a, 'rire', 21);
    R.cam(tl, sc, { x: 1050, y: 660, z: 1.25 }, 20, 3);
    // Il remercie le crocodile
    tl.set(a.p, { dir: 1 }, 22);
    G.incliner(tl, a, 23, 3, 45);
    R.pose(tl, a, { bA: 100, cA: 20 }, 27, 0.5);
    tl.to(croco.p, { tete: -10, duration: 0.5, yoyo: true, repeat: 1 }, 27.5);
    tl.to(croco.p, { y: SOL + 50, alpha: 0.3, duration: 3 }, 30);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 7 · Le serment
  R.scene('Le serment', 38, (sc, tl) => {
    DECORS.tiebele(sc, { ciel: 'soir' });
    const a = abem(sc, { x: -200 });
    const famille = G.foule(sc, [[C.ronde, H.villageoise, 900, -1], [C.ancien, null, 1050, -1], [C.enfant, null, 1180, -1], [C.trapu, H.villageois, 1320, -1], [C.fille, null, 1430, -1]]);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, a, 750, 1, 6);
    G.exprFoule(tl, famille, 'joie', 6);
    R.marche(tl, famille[0], 820, 6.5, 1, { pas: 2 });
    R.pose(tl, famille[0], { bA: 70, cA: 70 }, 7.5, 0.4);
    G.dialogue(tl, 9, [[a, 5]]);
    G.pointer(tl, a, 10, 3);
    R.pose(tl, a, { bA: 60, cA: 30, lean: 20 }, 13, 0.5);
    tl.to(a.p, { cA: 60, duration: 0.3, yoyo: true, repeat: 5 }, 13.5);
    R.pose(tl, a, { bA: 8, cA: 12, lean: 0 }, 16, 0.4);
    G.exprFoule(tl, famille, 'surprise', 11);
    R.cam(tl, sc, { x: 960, y: 660, z: 1.3 }, 9, 4);
    R.cartouche(tl, 18, 6, 'lieu_serment');
    [a].concat(famille).forEach((p, i) => R.pose(tl, p, { bA: 100, cA: 0, tete: 6 }, 18.5 + i * 0.1, 0.5));
    G.prier(tl, famille[1], 19, 5);
    R.cam(tl, sc, { x: 960, y: 580, z: 0.95 }, 20, 5);
    [a].concat(famille).forEach((p, i) => R.pose(tl, p, { bA: 8, cA: 12, tete: 0 }, 26 + i * 0.1, 0.5));
    G.danseFoule(tl, famille.concat([a]), 27, 9);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 26, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir', mare: 1150, mareL: 600 });
    const crocos = [[1050, 1], [1350, -1]].map(([x, dir]) => sc.bete(B.crocodile, { x, y: SOL + 20, dir, s: 0.9 }));
    const enfants = G.foule(sc, [[C.enfant, null, 650, 1], [C.fille, null, 520, 1], [C.vieille, null, 380, 1]]);
    sc.cam.x = 900; sc.cam.y = 640; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 6, 'lieu_aujourdhui');
    G.exprFoule(tl, enfants, 'joie', 2);
    G.saluer(tl, enfants[0], 3, 2.5);
    tl.to(crocos[0].p, { tete: -10, duration: 0.5, yoyo: true, repeat: 3 }, 4);
    R.cam(tl, sc, { y: 540, z: 0.95 }, 6, 6);
    R.fonduSortie(tl, 11.5, 1.5);
    R.titre(tl, 13, 4, 'fin');
    R.generique(tl, 17.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
