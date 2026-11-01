/*
 * 25 · Jaba Lompo, le devin ancêtre — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, COUR = 900;

  const COSTUMES = {
    jaba: { haut: { type: 'boubou', couleur: '#f4f0e6', motif: 'points', motifCouleur: '#b23a2a', long: 1.8 }, manches: '#f4f0e6', tete: { type: 'bonnet', couleur: '#b23a2a' }, collier: '#efe6cf' },
    gulmance: { haut: { type: 'tunique', couleur: '#5b7c3a', motif: 'bandes', motifCouleur: '#e8dcc0' }, bas: { type: 'short', couleur: '#e8dcc0' }, tete: null },
    gulmancee: { haut: { type: 'camisole', couleur: '#2f6c8f' }, bas: { type: 'jupe', couleur: '#e9c46a', motif: 'chevrons', motifCouleur: '#2f4a7a' }, tete: { type: 'foulard', couleur: '#2f6c8f' } },
  };
  // Le géant, mais en devin humain : peau sombre, barbe grise, sans halo sur terre.
  const JABA = Object.assign({}, C.geant, { halo: null, peau: '#5a3420', barbeCouleur: '#c9c0a8', sourcilsCouleur: '#c9c0a8' });
  const jaba = (sc, pose, parent) => { const p = sc.perso(JABA, COSTUMES.jaba, Object.assign({ y: SOL }, pose), parent); p.tenir(D.baton(260), 'R', { vertical: true }); return p; };
  /** Lancer de cauris devant (x) ; renvoie le tas pour l'animer. */
  function lancerCauris(tl, parent, x, y, at) {
    const c = D.cauris(parent, x, y, 14);
    gsap.set(c.liste, { opacity: 0 });
    c.liste.forEach((k, i) => tl.fromTo(k, { opacity: 1, x: -100, y: -80 }, { x: 0, y: 0, duration: 0.5, ease: 'bounce.out', immediateRender: false }, at + i * 0.03));
    return c;
  }

  // =================================================================== 1 · Une tradition
  R.scene('Une tradition', 26, (sc, tl) => {
    DECORS.cosmos(sc);
    const lum = D.lumiere(sc.monde, 960, 520, 30, '#fff1a8');
    sc.cam.z = 1;
    R.fonduEntree(tl, 0, 2);
    tl.fromTo(lum, { scale: 0.2, transformOrigin: '50% 50%' }, { scale: 2.5, duration: 6, ease: 'power2.out' }, 0);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 820);
    R.cartouche(tl, 8, 7, 'lieu_ciel');
    R.cam(tl, sc, { z: 1.3 }, 8, 14);
    R.fonduSortie(tl, 24, 2);
  });

  // =================================================================== 2 · La descente
  R.scene('La descente', 36, (sc, tl) => {
    const fond = sc.calque();
    D.ciel(fond, '#3a4f9a', '#f2a65a');
    const terre = sc.calque();
    D.collines(terre, 770, '#b99a6a', 61, 50);
    D.sol(terre, SOL, '#c09358');
    for (const x of [300, 900, 1600]) D.acacia(terre, x, 880, 0.9);
    const ch = sc.bete(B.chevalBlanc, { x: 960, y: -300 });
    const j = sc.perso(JABA, COSTUMES.jaba, { lueur: 1 });
    ch.monter(j);
    const halo = D.lumiere(sc.monde, 0, 0, 40, '#fff1a8'); halo.setAttribute('opacity', 0.6);
    R.acteurs.push({ sc, a: { rendre: () => halo.setAttribute('transform', `translate(${ch.p.x},${ch.p.y - 200})`) } });
    sc.cam.x = 960; sc.cam.y = 300; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1);
    tl.to(ch.p, { y: SOL, duration: 12, ease: 'power1.inOut' }, 1);
    tl.to(ch.p, { marche: 6, marcheAmp: 0.8, duration: 12, ease: 'none' }, 1);
    tl.to(sc.cam, { y: 600, duration: 12, ease: 'power1.inOut' }, 1);
    tl.to(ch.p, { marcheAmp: 0, duration: 0.4 }, 13);
    tl.to(halo, { opacity: 0, duration: 3 }, 13);
    R.cartouche(tl, 14, 5, 'perso_jaba');
    tl.to(ch.p, { cabre: 1, duration: 0.5, yoyo: true, repeat: 1 }, 15);
    R.expr(tl, j, 'serein', 15);
    R.cartouche(tl, 20, 5, 'lieu_terre', 'droite');
    R.marche(tl, ch, 2300, 22, 10, { pas: 20 });
    R.cam(tl, sc, { x: 1400 }, 22, 10);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 3 · L'enfant guéri
  R.scene('L\'enfant guéri', 40, (sc, tl) => {
    DECORS.sahel(sc, {});
    const j = jaba(sc, { x: -300 });
    const mere = sc.perso(C.ronde, COSTUMES.gulmancee, { x: 880, y: SOL, assis: 0.7 });
    R.el('rect', { x: 960, y: 872, width: 200, height: 12, rx: 4, fill: '#d9b26a' }, sc.monde);
    const enfant = sc.perso(C.enfant, null, Object.assign({ x: 1130, y: 862, rot: -90 }, R.EXPRESSIONS.malade));
    const hommes = G.foule(sc, [[C.trapu, COSTUMES.gulmance, 1350, -1], [C.ancien, null, 1480, -1]]);
    const feuilles = R.objet(D.feuilles(), false); j.tenir(feuilles, 'A', { vertical: true });
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.expr(tl, mere, 'triste', 0.5);
    R.marche(tl, j, 700, 1, 7);
    G.exprFoule(tl, hommes, 'peur', 6);
    R.pose(tl, hommes[0], { bA: 60, cA: 100, lean: -10 }, 6.5, 0.4);
    R.pose(tl, j, { bA: 100, cA: 0 }, 8.5, 0.5);
    R.parle(tl, j, 8.5, 2.5);
    R.expr(tl, j, 'serein', 9);
    R.pose(tl, j, { bA: 8, cA: 12 }, 11.5, 0.5);
    R.marche(tl, j, 1000, 12, 2, { pas: 3 });
    R.montrer(tl, feuilles, 14, 0.3);
    R.pose(tl, j, { lean: 40, bA: 60, cA: 10 }, 14.5, 0.8);
    R.cam(tl, sc, { x: 1050, y: 720, z: 1.6 }, 14, 3);
    const lueur = D.lumiere(sc.monde, 1100, 840, 14, '#cfe0ff'); lueur.setAttribute('opacity', 0);
    tl.to(lueur, { opacity: 0.9, scale: 2, transformOrigin: '50% 50%', duration: 1, yoyo: true, repeat: 1 }, 16);
    R.pose(tl, j, { lean: 10, bA: 8, cA: 12 }, 18.5, 0.6);
    R.cacher(tl, feuilles, 18.5, 0.3);
    R.expr(tl, enfant, 'joie', 19, 0.6);
    tl.to(enfant.p, { rot: 0, x: 1100, y: SOL, duration: 0.9, ease: 'back.out(1.5)' }, 19.5);
    R.saut(tl, enfant, 21, 50);
    R.expr(tl, mere, 'joie', 20);
    G.relever(tl, mere, 20.5);
    R.pose(tl, mere, { bA: 70, cA: 80 }, 22, 0.5);
    R.cam(tl, sc, { x: 1050, y: 620, z: 1.05 }, 22, 3);
    G.exprFoule(tl, hommes, 'surprise', 23);
    hommes.forEach((p, i) => G.incliner(tl, p, 26 + i * 0.3, 2.5, 35));
    G.incliner(tl, mere, 26.5, 2.5, 35);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 4 · Les cauris
  R.scene('Les cauris', 36, (sc, tl) => {
    DECORS.sahel(sc, { ciel: 'soir' });
    const feu = D.feu(sc.monde, 1250, SOL + 2, 0.8); G.flamber(tl, feu, 0, 36);
    const j = jaba(sc, { x: 900, assis: 1 });
    const temoins = G.foule(sc, [[C.ancien, null, 1450, -1, 1, { assis: 1 }], [C.trapu, COSTUMES.gulmance, 1580, -1, 1, { assis: 1 }]]);
    sc.cam.x = 1050; sc.cam.y = 700; sc.cam.z = 1.35;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_divination');
    R.pose(tl, j, { lean: 20, bA: 70, cA: 80 }, 2, 0.5);
    tl.to(j.p, { cA: 40, duration: 0.15, yoyo: true, repeat: 7 }, 2.5);
    lancerCauris(tl, sc.monde, 1060, SOL + 6, 4);
    R.cam(tl, sc, { x: 1060, y: 820, z: 2.4 }, 4, 2);
    R.pose(tl, j, { lean: 40, tete: 15 }, 6, 0.6);
    tl.to(j.p, { yeux: 0.8, duration: 0.5 }, 8);
    // Vision : une ville sur une colline
    const vision = R.el('g', { opacity: 0 }, sc.monde);
    R.el('ellipse', { cx: 1100, cy: 380, rx: 360, ry: 180, fill: '#fff1a8', opacity: 0.25, filter: 'url(#flou)' }, vision);
    D.maison(vision, 980, 450, 180, 100, {}); D.maison(vision, 1200, 450, 200, 110, {}); D.grenier(vision, 1090, 450, 0.6);
    R.cam(tl, sc, { x: 1080, y: 520, z: 1 }, 9, 3);
    tl.to(vision, { opacity: 0.9, duration: 2 }, 10);
    tl.to(vision, { opacity: 0, duration: 2 }, 18);
    G.exprFoule(tl, temoins, 'surprise', 11);
    R.cam(tl, sc, { x: 1050, y: 700, z: 1.35 }, 20, 3);
    tl.to(j.p, { yeux: 0, lean: 0, tete: 0, duration: 0.6 }, 21);
    R.parle(tl, j, 22, 4);
    G.pointer(tl, j, 23, 3, 0.2);
    G.exprFoule(tl, temoins, 'joie', 27);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 5 · Bingo
  R.scene('Bingo', 40, (sc, tl) => {
    DECORS.sahel(sc, { campement: false });
    const j = jaba(sc, { x: -300 });
    const gens = [[C.trapu, COSTUMES.gulmance], [C.ronde, COSTUMES.gulmancee], [C.colosse, H.forgeron], [C.filiforme, COSTUMES.gulmance], [C.enfant, null]].map(([d, c], i) => sc.perso(d, c, { x: -480 - i * 130, y: SOL }));
    const cases = [[700, 0.9], [1050, 1], [1400, 0.85], [1700, 0.9]].map(([x, s]) => D.caseRonde(sc.monde, x, SOL, s, { couleur: '#b9864e' }));
    cases.forEach((c) => sc.monde.insertBefore(c, sc.monde.children[1]));
    gsap.set(cases, { scale: 0, transformOrigin: '50% 100%' });
    sc.cam.x = 900; sc.cam.y = 600; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, j, 960, 1, 8);
    gens.forEach((p, i) => R.marche(tl, p, 780 - i * 110, 1.3 + i * 0.3, 8));
    // Il plante son bâton : ici sera la ville
    R.pose(tl, j, { bR: 100, cR: 0, lean: 10 }, 10, 0.5);
    R.secousse(tl, sc, 10.6, 5, 0.4);
    R.pose(tl, j, { bR: -8, cR: 12, lean: 0 }, 11.5, 0.5);
    R.cartouche(tl, 11, 6, 'lieu_bingo', 'droite');
    G.exprFoule(tl, gens, 'joie', 12);
    gens.slice(0, 4).forEach((p, i) => G.piocher(tl, p, 14 + i * 0.2, 9, 0.9));
    tl.to(cases, { scale: 1, duration: 2.5, ease: 'back.out(1.3)', stagger: 2 }, 14);
    R.cam(tl, sc, { x: 1150, y: 560, z: 0.9 }, 14, 10);
    G.danseFoule(tl, gens, 28, 10);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 6 · Le devin-roi
  R.scene('Le devin-roi', 36, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#b23a2a' });
    const j = jaba(sc, { x: 960, y: COUR, assis: 1 });
    const visiteurs = [[C.elancee, COSTUMES.gulmancee], [C.ancien, null], [C.guerrier, H.cavalier]].map(([d, c], i) => sc.perso(d, c, { x: -200 - i * 150, y: COUR }));
    sc.cam.x = 900; sc.cam.y = 650; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    visiteurs.forEach((p, i) => {
      const t = 1 + i * 9;
      R.marche(tl, p, 760, t, 3);
      G.agenouiller(tl, p, t + 3.2);
      R.parle(tl, p, t + 3.6, 1.8);
      lancerCauris(tl, sc.monde, 870, COUR + 6, t + 5.2);
      R.pose(tl, j, { lean: 30, bA: 60 }, t + 5, 0.4);
      R.pose(tl, j, { lean: 0, bA: 100, cA: 20 }, t + 6, 0.4);
      R.parle(tl, j, t + 6, 1.5);
      R.pose(tl, j, { bA: 8, cA: 12 }, t + 7.6, 0.3);
      R.expr(tl, p, 'joie', t + 7.3);
      G.relever(tl, p, t + 7.6);
      tl.set(p.p, { dir: -1 }, t + 8.4);
      R.marche(tl, p, -300, t + 8.5, 3);
    });
    R.cam(tl, sc, { x: 900, y: 720, z: 1.5 }, 4, 25);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 7 · Les fils
  R.scene('Les fils', 34, (sc, tl) => {
    DECORS.palais(sc, { ciel: 'soir' });
    const j = jaba(sc, { x: 960, y: COUR, assis: 1, lean: 10 });
    const fils = G.cavaliers(sc, [[600, 1, 0.9], [1300, -1, 0.9], [400, 1, 0.9]], { sol: COUR });
    sc.cam.x = 960; sc.cam.y = 640; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'lieu_famille');
    G.dialogue(tl, 2, [[j, 4]]);
    G.pointer(tl, j, 3, 2, 0.2);
    fils.forEach((ch, i) => { R.pose(tl, ch.cav, { lean: 25, tete: 10 }, 6.5 + i * 0.3, 0.5); R.pose(tl, ch.cav, { lean: 0, tete: 0 }, 8 + i * 0.3, 0.5); });
    // Ils partent dans des directions différentes
    tl.set(fils[0].p, { dir: -1 }, 10); tl.set(fils[2].p, { dir: -1 }, 10.5);
    R.marche(tl, fils[0], -500, 10.5, 7, { pas: 18, amp: 1.3 });
    R.marche(tl, fils[1], 2400, 11, 7, { pas: 18, amp: 1.3 });
    R.marche(tl, fils[2], -700, 11.5, 7, { pas: 18, amp: 1.3 });
    G.saluer(tl, j, 11, 4);
    R.expr(tl, j, 'serein', 16);
    R.cam(tl, sc, { x: 960, y: 700, z: 1.5 }, 18, 6);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 28, (sc, tl) => {
    DECORS.ville(sc, { ciel: 'soir', mosqueeX: 1500, mosqueeS: 0.8 });
    const gens = G.foule(sc, [[C.ancien, COSTUMES.jaba, 800, 1], [C.fille, COSTUMES.gulmancee, 980, -1], [C.enfant, null, 1090, -1]]);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_aujourdhui');
    G.dialogue(tl, 2, [[gens[0], 4]]);
    G.pointer(tl, gens[0], 3, 3, 0.9);
    G.exprFoule(tl, gens.slice(1), 'serein', 4);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 7, 6);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
