/*
 * 09 · Les thila et les bateba — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;
  const { montrer, cacher, objet } = R;

  const COSTUMES = {
    kambire: { bas: { type: 'short', couleur: '#8a5a32' }, ceinture: '#2b1a0e', collier: '#efe6cf', bracelets: '#c0c0c0' },
    epouse: { bas: { type: 'jupe', couleur: '#b08a5a', motif: 'chevrons', motifCouleur: '#4d2c14' }, haut: { type: 'camisole', couleur: '#b08a5a' }, collier: '#c8553d' },
    devineresse: { haut: { type: 'boubou', couleur: '#3a2a20', motif: 'points', motifCouleur: '#efe6cf', long: 1.7 }, manches: '#3a2a20', tete: { type: 'foulard', couleur: '#b23a2a' } },
  };
  const famille = (sc, parent) => ({
    pere: sc.perso(C.colosse, COSTUMES.kambire, { x: 620, y: SOL }, parent),
    mere: sc.perso(C.elancee, COSTUMES.epouse, { x: 480, y: SOL }, parent),
    enfant: sc.perso(C.enfant, { bas: { type: 'short', couleur: '#8a5a32' }, haut: null }, { x: 760, y: SOL }, parent),
  });
  /** Herminette du sculpteur (dans l'axe de l'avant-bras). */
  const herminette = () => { const g = R.el('g', {}); R.el('line', { x1: 0, y1: -8, x2: 0, y2: 50, stroke: '#6b4527', 'stroke-width': 6 }, g); R.el('path', { d: 'M-2,44 L22,50 L20,62 L-2,56Z', fill: '#7a808a' }, g); return g; };

  // =================================================================== 1 · La soukala
  R.scene('La soukala', 26, (sc, tl) => {
    DECORS.soukala(sc, { soleil: [300, 200, 60] });
    const f = famille(sc);
    sc.cam.x = 1000; sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    R.cartouche(tl, 7.5, 5, 'lieu_soukala');
    G.piocher(tl, f.pere, 2, 8, 0.9);
    f.mere.tenir(D.pilon(160), 'A', { vertical: true });
    G.piler(tl, f.mere, 2, 10, 0.9, 110);
    tl.to(f.enfant.p, { x: 1000, duration: 3, yoyo: true, repeat: 2, ease: 'sine.inOut' }, 3);
    R.expr(tl, f.enfant, 'rire', 3);
    R.cartouche(tl, 13, 4.5, 'perso_kambire', 'droite');
    R.cam(tl, sc, { x: 760, y: 640, z: 1.3 }, 12, 6);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Les malheurs
  R.scene('Les malheurs', 40, (sc, tl) => {
    // 2a · l'enfant malade (0–20)
    const ga = R.plan(sc, tl, 0, 20);
    DECORS.soukala(ga.sous, { ciel: 'soir' });
    R.el('rect', { x: 560, y: 872, width: 240, height: 12, rx: 4, fill: '#d9b26a' }, ga);
    const f = famille(sc, ga);
    Object.assign(f.enfant.p, { x: 760, y: 862, rot: -90 }, R.EXPRESSIONS.malade);
    Object.assign(f.mere.p, { x: 470, assis: 0.7 });
    f.mere.tenir(D.eventail(), 'A', { vertical: true });
    f.pere.p.x = 900; f.pere.p.dir = -1;
    tl.set(sc.cam, { x: 700, y: 690, z: 1.5 }, 0);
    R.fonduEntree(tl, 0, 1);
    tl.fromTo(f.mere.p, { bA: 85, cA: 10 }, { bA: 115, cA: 25, duration: 0.4, yoyo: true, repeat: 21, ease: 'sine.inOut', immediateRender: false }, 0.5);
    R.expr(tl, f.mere, 'triste', 0.5);
    tl.to(f.enfant.p, { bouche: 0.5, duration: 0.25, yoyo: true, repeat: 5 }, 3);
    R.expr(tl, f.pere, 'triste', 4);
    R.pose(tl, f.pere, { tete: -14, bA: 60, cA: 110 }, 6, 0.6);
    R.cam(tl, sc, { x: 800, y: 660, z: 1.3 }, 8, 6);
    R.fonduSortie(tl, 19.4, 0.6);
    // 2b · le serpent dans le grenier (20–40)
    const gb = R.plan(sc, tl, 20);
    DECORS.soukala(gb.sous, {});
    const serpent = sc.bete(B.serpent, { x: 360, y: SOL - 4, s: 0.9, dir: -1, alpha: 0 }, gb);
    const pere = sc.perso(C.colosse, COSTUMES.kambire, { x: 700, y: SOL, dir: -1 }, gb);
    pere.tenir(D.calebasse(), 'A');
    tl.set(sc.cam, { x: 500, y: 640, z: 1.3 }, 20);
    R.fonduEntree(tl, 20, 0.6);
    R.marche(tl, pere, 470, 21, 2.5);
    tl.to(serpent.p, { alpha: 1, duration: 0.3 }, 23.5);
    tl.to(serpent.p, { dresse: 1, tete: -10, duration: 0.5 }, 23.8);
    tl.to(serpent.p, { marcheAmp: 1, duration: 0.3 }, 24);
    R.expr(tl, pere, 'peur', 24);
    tl.to(pere.p, { x: 620, lean: -15, duration: 0.5 }, 24.1);
    R.pose(tl, pere, { bA: 70, cA: 100 }, 24.1, 0.3);
    R.secousse(tl, sc, 24.2, 6, 0.3);
    tl.to(serpent.p, { dresse: 0, x: -300, marche: '+=4', duration: 3.5 }, 27);
    R.expr(tl, pere, 'triste', 30);
    G.prier(tl, pere, 31, 5);
    R.cam(tl, sc, { x: 600, y: 600, z: 1.05 }, 30, 6);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 3 · La devineresse
  R.scene('La devineresse', 36, (sc, tl) => {
    DECORS.cour(sc, { grenierX: 1580, ciel: 'soir' });
    const dev = sc.perso(C.vieille, COSTUMES.devineresse, { x: 1050, y: 900, dir: -1, assis: 1 });
    const pere = sc.perso(C.colosse, COSTUMES.kambire, { x: 300, y: 900 });
    const cauris = D.cauris(sc.monde, 920, 905, 14);
    gsap.set(cauris.liste, { opacity: 0 });
    sc.cam.x = 860; sc.cam.y = 680; sc.cam.z = 1.35;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'perso_devineresse', 'droite');
    R.marche(tl, pere, 740, 1, 4);
    G.agenouiller(tl, pere, 5.3);
    G.dialogue(tl, 6.5, [[pere, 3], [dev, 2]]);
    // Elle jette les cauris
    R.pose(tl, dev, { bA: 70, cA: 80, lean: 15 }, 12, 0.4);
    tl.to(dev.p, { cA: 40, duration: 0.15, yoyo: true, repeat: 5 }, 12.4);
    cauris.liste.forEach((c, i) => tl.fromTo(c, { opacity: 1, x: 120, y: -80 }, { x: 0, y: 0, duration: 0.5, ease: 'bounce.out', immediateRender: false }, 13.4 + i * 0.03));
    R.cam(tl, sc, { x: 940, y: 820, z: 2.4 }, 13, 2);
    R.pose(tl, dev, { lean: 35, tete: 15, bA: 40 }, 15.5, 0.6);
    tl.to(dev.p, { yeux: 0.8, duration: 0.4 }, 17);
    R.cam(tl, sc, { x: 900, y: 680, z: 1.35 }, 18, 2);
    // Elle désigne le ciel : les esprits
    R.pose(tl, dev, { lean: 0, tete: 20, yeux: 0 }, 20, 0.5);
    G.pointer(tl, dev, 20.5, 5, 0.9);
    R.parle(tl, dev, 21, 5);
    R.expr(tl, pere, 'surprise', 22);
    R.pose(tl, pere, { tete: 15 }, 22.5, 0.4);
    G.incliner(tl, pere, 28, 2.5, 30);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 4 · Le rêve
  R.scene('Le rêve', 40, (sc, tl) => {
    DECORS.soukala(sc, { ciel: 'nuit' });
    R.el('rect', { x: 560, y: 872, width: 260, height: 12, rx: 4, fill: '#d9b26a' }, sc.monde);
    const pere = sc.perso(C.colosse, COSTUMES.kambire, Object.assign({ x: 780, y: 860, rot: -90 }, R.EXPRESSIONS.sommeil));
    const reve = R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#3a4aa0', opacity: 0 }, sc.monde);
    const thila = [[1050, -1, 1], [1300, -1, 0.9], [430, 1, 0.95]].map(([x, dir, s]) => sc.perso(C.esprit, null, { x, y: SOL, dir, s, alpha: 0, lueur: 1 }));
    const fantome = R.el('g', { opacity: 0 }, sc.monde);
    D.statuette(fantome, 1180, 760, 2.2, 'leves');
    sc.cam.x = 860; sc.cam.y = 680; sc.cam.z = 1.4;
    R.fonduEntree(tl, 0, 1.5);
    tl.to(reve, { opacity: 0.35, duration: 3 }, 3);
    R.cam(tl, sc, { x: 960, y: 580, z: 1 }, 4, 4);
    thila.forEach((t, i) => tl.to(t.p, { alpha: 0.85, duration: 2 }, 5 + i * 0.8));
    R.cartouche(tl, 7, 5, 'perso_thila', 'droite');
    thila.forEach((t, i) => tl.to(t.p, { y: SOL - 30, duration: 1.6, yoyo: true, repeat: 9, ease: 'sine.inOut' }, 7 + i * 0.4));
    G.dialogue(tl, 12, [[thila[0], 3, false], [thila[1], 2.5, false]]);
    R.pose(tl, thila[0], { bA: 100, cA: 0 }, 13, 0.6);
    tl.to(fantome, { opacity: 0.8, duration: 1.5 }, 15);
    R.cam(tl, sc, { x: 1100, y: 620, z: 1.25 }, 15, 3);
    tl.to(fantome, { opacity: 0, duration: 1.5 }, 23);
    R.pose(tl, thila[2], { bA: 110, cA: 0 }, 22, 0.6);
    const tronc = R.el('rect', { x: 260, y: 830, width: 110, height: 40, rx: 14, fill: '#7a5232', stroke: '#4d3320', 'stroke-width': 3, opacity: 0 }, sc.monde);
    tl.to(tronc, { opacity: 1, duration: 0.6 }, 22.5);
    tl.to(tronc, { opacity: 0, duration: 0.6 }, 27);
    R.cam(tl, sc, { x: 600, y: 660, z: 1.2 }, 22, 3);
    thila.forEach((t, i) => tl.to(t.p, { alpha: 0, duration: 2 }, 29 + i * 0.4));
    tl.to(reve, { opacity: 0, duration: 2 }, 30);
    tl.to(pere.p, { rot: 0, x: 700, y: SOL, yeux: 0, duration: 1.2 }, 33);
    R.expr(tl, pere, 'surprise', 34);
    R.cam(tl, sc, { x: 760, y: 640, z: 1.4 }, 32, 3);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 5 · Le sculpteur
  R.scene('Le sculpteur', 40, (sc, tl) => {
    DECORS.soukala(sc, {});
    const pere = sc.perso(C.colosse, COSTUMES.kambire, { x: 700, y: SOL, assis: 1 });
    D.siege(sc.monde, 700, SOL + 2, 70, 50);
    sc.monde.appendChild(pere.root);
    pere.tenir(herminette(), 'A');
    const tronc = R.el('rect', { x: 820, y: 770, width: 70, height: 110, rx: 12, fill: '#7a5232', stroke: '#4d3320', 'stroke-width': 3 }, sc.monde);
    const statues = R.el('g', { opacity: 0 }, sc.monde);
    D.statuette(statues, 855, SOL, 1.15, 'leves');
    const statue2 = R.el('g', { opacity: 0 }, sc.monde);
    D.statuette(statue2, 990, SOL, 1.05);
    const copeaux = D.particules(sc.monde, 30, 850, 790, '#c89a6a', 3);
    const enfant = sc.perso(C.enfant, { bas: { type: 'short', couleur: '#8a5a32' }, haut: null }, Object.assign({ x: 1150, y: SOL, dir: -1 }, R.EXPRESSIONS.malade));
    sc.cam.x = 820; sc.cam.y = 700; sc.cam.z = 1.6;
    R.fonduEntree(tl, 0, 1);
    G.forger(tl, pere, 1, 14, 0.8, copeaux);
    tl.to(tronc, { attr: { width: 40, x: 835 }, opacity: 0.6, duration: 11 }, 1);
    tl.to(tronc, { opacity: 0, duration: 0.8 }, 12);
    tl.to(statues, { opacity: 1, duration: 1.5 }, 11.5);
    R.cam(tl, sc, { x: 870, y: 760, z: 2.2 }, 12, 2);
    R.expr(tl, pere, 'joie', 13.5);
    R.cam(tl, sc, { x: 900, y: 680, z: 1.4 }, 16, 2);
    // La seconde statuette
    G.forger(tl, pere, 18, 12, 0.8, copeaux);
    tl.to(statue2, { opacity: 1, duration: 4 }, 22);
    R.cartouche(tl, 27, 5, 'perso_bateba', 'droite');
    R.marche(tl, enfant, 1080, 27, 1.5, { pas: 2 });
    R.pose(tl, enfant, { tete: -10, regard: -1 }, 29, 0.5);
    R.cam(tl, sc, { x: 950, y: 700, z: 1.5 }, 28, 4);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 6 · L'autel
  R.scene('L\'autel', 30, (sc, tl) => {
    DECORS.soukala(sc, { soleil: [1600, 220, 60] });
    const autel = R.el('g', {}, sc.monde);
    R.el('path', { d: 'M820,882 Q870,846 920,882Z', fill: '#8a5a32', stroke: '#5a3a20', 'stroke-width': 2 }, autel);
    const b1 = R.el('g', { opacity: 0 }, sc.monde); D.statuette(b1, 845, 872, 0.9, 'leves');
    const b2 = R.el('g', { opacity: 0 }, sc.monde); D.statuette(b2, 900, 872, 0.85);
    const f = famille(sc);
    Object.assign(f.pere.p, { x: 600 }); Object.assign(f.mere.p, { x: 470 }); Object.assign(f.enfant.p, { x: 360 }, R.EXPRESSIONS.malade);
    sc.cam.x = 760; sc.cam.y = 680; sc.cam.z = 1.35;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, f.pere, 760, 1, 2, { pas: 3 });
    R.pose(tl, f.pere, { lean: 40, bA: 70 }, 3.2, 0.5);
    tl.to(b1, { opacity: 1, duration: 0.4 }, 3.8);
    tl.to(b2, { opacity: 1, duration: 0.4 }, 4.6);
    R.pose(tl, f.pere, { lean: 0, bA: 8 }, 5.2, 0.5);
    G.agenouiller(tl, f.pere, 6.5);
    G.agenouiller(tl, f.mere, 6.8);
    G.prier(tl, f.pere, 8, 5);
    const lueur = D.lumiere(sc.monde, 872, 800, 14, '#cfe0ff'); lueur.setAttribute('opacity', 0);
    tl.to(lueur, { opacity: 0.9, scale: 2.2, transformOrigin: '50% 50%', duration: 1.2, yoyo: true, repeat: 1 }, 12);
    R.cam(tl, sc, { x: 860, y: 780, z: 2.2 }, 11, 2.5);
    G.relever(tl, f.pere, 16); G.relever(tl, f.mere, 16.2);
    R.cam(tl, sc, { x: 700, y: 660, z: 1.2 }, 16, 4);
    R.expr(tl, f.enfant, 'neutre', 20);
    R.pose(tl, f.enfant, { yeux: 0 }, 20.5, 0.5);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 7 · La nuit des gardiens
  R.scene('La nuit des gardiens', 40, (sc, tl) => {
    DECORS.soukala(sc, { ciel: 'nuit' });
    R.el('path', { d: 'M820,882 Q870,846 920,882Z', fill: '#8a5a32', stroke: '#5a3a20', 'stroke-width': 2 }, sc.monde);
    const b1 = R.el('g', {}, sc.monde); D.statuette(b1, 845, 872, 0.9, 'leves');
    const b2 = R.el('g', {}, sc.monde); D.statuette(b2, 900, 872, 0.85);
    const yeux = [[845, 790], [900, 794]].map(([x, y]) => { const g = R.el('g', { opacity: 0 }, sc.monde); R.el('circle', { cx: x - 3, cy: y, r: 3, fill: '#ffe7a3' }, g); R.el('circle', { cx: x + 3, cy: y, r: 3, fill: '#ffe7a3' }, g); R.el('circle', { cx: x, cy: y, r: 30, fill: '#cfe0ff', opacity: 0.4, filter: 'url(#flou)' }, g); return g; });
    const serpent = sc.bete(B.serpent, { x: 2300, y: SOL - 4, s: 1, dir: -1 });
    const thila = sc.perso(C.esprit, null, { x: 1600, y: SOL, dir: -1, alpha: 0, lueur: 1 });
    sc.cam.x = 1200; sc.cam.y = 640; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1.5);
    tl.to(serpent.p, { marcheAmp: 1, duration: 0.3 }, 1);
    tl.to(serpent.p, { x: 1100, marche: '+=10', duration: 10, ease: 'none' }, 1);
    R.cam(tl, sc, { x: 1000, y: 700, z: 1.5 }, 7, 4);
    // Les bateba s'éveillent
    yeux.forEach((y, i) => tl.to(y, { opacity: 1, duration: 0.8 }, 11 + i * 0.4));
    tl.to(serpent.p, { dresse: 1, marcheAmp: 0, duration: 0.6 }, 11.5);
    tl.to(serpent.p, { tete: -15, duration: 0.25, yoyo: true, repeat: 5 }, 12.2);
    R.secousse(tl, sc, 13, 5, 0.6);
    tl.to(yeux, { scale: 1.3, transformOrigin: '50% 50%', duration: 0.3, yoyo: true, repeat: 5 }, 13);
    // Il recule et s'en va
    tl.set(serpent.p, { dir: 1 }, 16.5);
    tl.to(serpent.p, { dresse: 0, marcheAmp: 1.2, duration: 0.4 }, 16.5);
    tl.to(serpent.p, { x: 2500, marche: '+=12', duration: 6, ease: 'power1.in' }, 17);
    R.cam(tl, sc, { x: 1200, y: 640, z: 1.05 }, 17, 4);
    tl.to(thila.p, { alpha: 0.8, duration: 2 }, 23);
    R.expr(tl, thila, 'joie', 24);
    G.incliner(tl, thila, 26, 2, 20);
    tl.to(thila.p, { alpha: 0, duration: 2 }, 30);
    yeux.forEach((y) => tl.to(y, { opacity: 0, duration: 2 }, 31));
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 8 · Le matin
  R.scene('Le matin', 28, (sc, tl) => {
    DECORS.soukala(sc, { soleil: [300, 250, 60] });
    R.el('path', { d: 'M820,882 Q870,846 920,882Z', fill: '#8a5a32', stroke: '#5a3a20', 'stroke-width': 2 }, sc.monde);
    D.statuette(sc.monde, 845, 872, 0.9, 'leves'); D.statuette(sc.monde, 900, 872, 0.85);
    const f = famille(sc);
    Object.assign(f.pere.p, { x: 620 }); Object.assign(f.mere.p, { x: 480 }); Object.assign(f.enfant.p, { x: 1100 });
    const poule = sc.bete(B.poule, { x: 1300, y: SOL, s: 0.9, dir: -1 });
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    R.expr(tl, f.enfant, 'rire', 0.5);
    tl.to(f.enfant.p, { x: 1450, duration: 2, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 1);
    tl.to(poule.p, { x: 1600, marcheAmp: 1, marche: '+=8', duration: 2, yoyo: true, repeat: 3 }, 1);
    G.exprFoule(tl, [f.pere, f.mere], 'joie', 2);
    R.pose(tl, f.pere, { bA: 60, cA: 70 }, 4, 0.5);
    G.incliner(tl, f.pere, 7, 2, 25);
    R.cam(tl, sc, { x: 870, y: 760, z: 2 }, 8, 4);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
