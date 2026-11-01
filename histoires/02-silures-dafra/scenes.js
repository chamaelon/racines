/*
 * 02 · Les silures sacrés de Dafra — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;
  const { montrer, cacher, objet } = R;

  const COSTUMES = {
    chasseur: { haut: { type: 'tunique', couleur: '#a0703a', motif: 'amulettes', motifCouleur: '#5a3a20' }, bas: { type: 'short', couleur: '#7a5230' }, tete: { type: 'chasseur' } },
    awa: { haut: { type: 'camisole', couleur: '#2f4a7a' }, bas: { type: 'jupe', couleur: '#2f4a7a', motif: 'points', motifCouleur: '#e8eefc' }, collier: '#e9c46a' },
    mah: { haut: { type: 'boubou', couleur: '#efe8d8', motif: 'bandes', motifCouleur: '#8a6a40', long: 1.7 }, manches: '#efe8d8', tete: { type: 'foulard', couleur: '#efe8d8' } },
    pecheur: { haut: { type: 'tunique', couleur: '#c9a24a', motif: 'bandes', motifCouleur: '#7a5a20' }, bas: { type: 'short', couleur: '#5a4a3a' }, tete: null },
    mari: { haut: { type: 'tunique', couleur: '#5b8c5a' }, bas: { type: 'short', couleur: '#e8dcc0' } },
  };

  // ---------------------------------------------------------------- Aides propres à l'histoire
  // Bassin de Dafra (décor D10) : centre (960, 900), demi-largeur 360.
  const BX = 960, BY = 900, BRX = 360;
  /** Silures visibles dans le bassin : groupe découpé par l'eau + voile d'eau par-dessus. */
  function silauresBassin(sc, n, parent) {
    const cid = R.id('eau');
    R.el('ellipse', { cx: BX, cy: BY, rx: BRX - 8, ry: 22 }, R.el('clipPath', { id: cid }, R.defs));
    const g = R.el('g', { 'clip-path': `url(#${cid})` }, parent || sc.monde);
    const poissons = [];
    for (let i = 0; i < n; i++) poissons.push(sc.bete(B.silure, { x: BX - 260 + i * (520 / Math.max(1, n - 1)), y: BY + 4, s: 0.42, dir: i % 2 ? -1 : 1, nage: i * 0.3 }, g));
    R.el('ellipse', { cx: BX, cy: BY, rx: BRX, ry: 24, fill: '#3f7f9e', opacity: 0.45 }, parent || sc.monde);
    return poissons;
  }
  /** Les silures se rassemblent vers x. */
  function rassembler(tl, poissons, x, at, duree) {
    poissons.forEach((f, i) => {
      tl.set(f.p, { dir: f.p.x < x ? 1 : -1 }, at);
      tl.to(f.p, { x: x + (i - poissons.length / 2) * 38, marcheAmp: 1, duration: duree || 2, ease: 'sine.inOut' }, at + i * 0.1);
      tl.to(f.p, { marcheAmp: 0, duration: 0.5 }, at + (duree || 2) + i * 0.1);
    });
  }
  /** Lancer de nourriture : quelques boulettes de la main vers l'eau. */
  function lancer(tl, parent, x0, y0, x1, at) {
    for (let i = 0; i < 5; i++) {
      const b = R.el('circle', { cx: 0, cy: 0, r: 5, fill: '#efe0a8', opacity: 0 }, parent);
      const xe = x1 + (i - 2) * 26;
      tl.set(b, { x: x0, y: y0, opacity: 1 }, at + i * 0.06);
      tl.to(b, { x: (x0 + xe) / 2, y: y0 - 60, duration: 0.3, ease: 'power1.out' }, at + i * 0.06);
      tl.to(b, { x: xe, y: BY, duration: 0.35, ease: 'power1.in' }, at + 0.3 + i * 0.06);
      tl.to(b, { opacity: 0, duration: 0.1 }, at + 0.68 + i * 0.06);
    }
  }
  /** Un silure saute hors de l'eau en arc. */
  function saut(tl, sc, parent, x, at, dir) {
    const f = sc.bete(B.silure, { x, y: BY, s: 0.5, dir: dir || 1, alpha: 0 }, parent);
    tl.set(f.p, { alpha: 1, x, y: BY, rot: -50 * (dir || 1) }, at);
    tl.to(f.p, { x: x + 90 * (dir || 1), duration: 1, ease: 'none' }, at);
    tl.to(f.p, { y: BY - 150, duration: 0.5, ease: 'power2.out' }, at);
    tl.to(f.p, { y: BY + 10, duration: 0.5, ease: 'power2.in' }, at + 0.5);
    tl.to(f.p, { rot: 60 * (dir || 1), duration: 1, ease: 'none' }, at);
    tl.set(f.p, { alpha: 0 }, at + 1);
    const eclab = D.particules(parent, 12, x + 90 * (dir || 1), BY - 4, '#cfe8f1', 5);
    R.jaillir(tl, eclab, at + 1, 0, { n: 10, ecart: 14, haut: 40, duree: 0.6 });
    return f;
  }
  /** Vue sous l'eau : bleu profond, rayons, herbes, bulles ; renvoie le groupe. */
  function sousLEau(parent) {
    const g = R.el('g', {}, parent);
    D.ciel(g, '#2f7f9a', '#0c2c3c');
    for (let i = 0; i < 6; i++) R.el('path', { d: `M${200 + i * 330},-100 l120,0 l-260,1200 l-80,0Z`, fill: '#e8f6ff', opacity: 0.08 }, g);
    R.el('path', { d: 'M-1000,960 Q0,930 960,955 T2920,950 L2920,2000 L-1000,2000Z', fill: '#c8b48a' }, g);
    g.herbes = [];
    for (let i = 0; i < 16; i++) {
      const h = R.el('path', { d: `M${-300 + i * 160},960 q-20,-80 10,-160 q20,-60 -10,-120`, stroke: '#3f7a3a', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, g);
      g.herbes.push(h);
    }
    g.bulles = D.particules(g, 20, 960, 900, '#e8f6ff', 3);
    return g;
  }

  // =================================================================== 1 · La source
  R.scene('La source', 32, (sc, tl) => {
    const ga = R.plan(sc, tl, 0, 15.5);
    const d = DECORS.gorge(ga.sous, {});
    const chasseur = sc.perso(C.filiforme, COSTUMES.chasseur, { x: -200, y: SOL }, ga);
    chasseur.tenir(D.arc(), 'R', { vertical: true });
    const poissons = silauresBassin(sc, 3, ga);
    const gb = R.plan(sc, tl, 15.5, 25.5);
    const eau = sousLEau(gb);
    const nageurs = [0, 1, 2, 3].map((i) => sc.bete(B.silure, { x: -300 - i * 260, y: 520 + i * 90, s: 1.2 - i * 0.15, nage: i * 0.4 }, gb));
    const gc = R.plan(sc, tl, 25.5);
    DECORS.gorge(gc.sous, {});
    const ch2 = sc.perso(C.filiforme, COSTUMES.chasseur, { x: 530, y: SOL }, gc);
    const cal = D.calebasse(); gc.appendChild(cal); gsap.set(cal, { x: 600, y: 896, opacity: 0 });
    silauresBassin(sc, 3, gc);
    sc.cam.x = 960; sc.cam.y = 520; sc.cam.z = 1;

    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 5.5, 'titre', 'sous_titre', 330);
    poissons.forEach((f, i) => tl.to(f.p, { x: `+=${(i % 2 ? -1 : 1) * 120}`, duration: 6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0));
    R.expr(tl, chasseur, 'triste', 2);
    R.pose(tl, chasseur, { sourire: -0.6, yeux: 0.3 }, 2, 0.5);
    R.marche(tl, chasseur, 520, 4, 4.5, { pas: 6 });
    R.cam(tl, sc, { x: 700, y: 660, z: 1.35 }, 6, 3);
    R.expr(tl, chasseur, 'surprise', 8.6);
    R.pose(tl, chasseur, { assis: 0.75, lean: 40, bA: 70, cA: 70 }, 9.2, 0.8);
    R.pose(tl, chasseur, { bA: 130, cA: 140, tete: 10 }, 10.4, 0.5);
    R.pose(tl, chasseur, { bA: 70, cA: 70, tete: 0 }, 11.2, 0.5);
    R.expr(tl, chasseur, 'joie', 11.6);
    saut(tl, sc, ga, 700, 12.6, 1);
    R.expr(tl, chasseur, 'surprise', 13);
    R.pose(tl, chasseur, { lean: 0, assis: 0.4 }, 13, 0.3);
    R.fonduSortie(tl, 14.9, 0.6);
    // Sous l'eau
    tl.set(sc.cam, { x: 960, y: 540, z: 1 }, 15.5);
    R.fonduEntree(tl, 15.5, 0.6);
    R.cartouche(tl, 16, 5, 'lieu_gorge');
    nageurs.forEach((f, i) => { tl.to(f.p, { x: 2300, marcheAmp: 0.6, duration: 9, ease: 'none' }, 15.5 + i * 0.4); });
    eau.herbes.forEach((h, i) => tl.to(h, { skewX: 6, duration: 1.2, yoyo: true, repeat: 7, ease: 'sine.inOut', transformOrigin: '50% 100%' }, 15.5 + (i % 4) * 0.2));
    [16, 17.3, 18.6, 20, 21.4, 22.8].forEach((t, i) => R.jaillir(tl, eau.bulles, t, i, { n: 3, ecart: 30, haut: 260, duree: 1.6 }));
    R.fonduSortie(tl, 24.9, 0.6);
    // L'offrande du chasseur
    tl.set(sc.cam, { x: 760, y: 650, z: 1.3 }, 25.5);
    R.fonduEntree(tl, 25.5, 0.6);
    R.cartouche(tl, 25.8, 4, 'perso_chasseur');
    R.pose(tl, ch2, { lean: 35, bA: 60, cA: 10 }, 26, 0.6);
    tl.to(cal, { opacity: 1, duration: 0.3 }, 26.5);
    R.pose(tl, ch2, { lean: 0, bA: 8, cA: 12 }, 27.2, 0.6);
    G.incliner(tl, ch2, 28, 1.5, 40);
    R.expr(tl, ch2, 'serein', 28);
    R.fonduSortie(tl, 30.5, 1.5);
  });

  // =================================================================== 2 · Sya
  R.scene('Sya', 28, (sc, tl) => {
    DECORS.ville(sc, { soleil: [300, 200, 60] });
    const gens = G.foule(sc, [
      [C.ronde, null, -200, 1], [C.elancee, COSTUMES.awa, -380, 1], [C.enfant, null, -520, 1],
      [C.trapu, COSTUMES.mari, 2200, -1], [C.ancien, null, 2350, -1],
    ]);
    gens.slice(0, 2).forEach((p) => G.surLaTete(p, D.canari(null, 0, 0, 0.5)));
    sc.cam.x = 960; sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.2);
    R.cartouche(tl, 1, 5, 'lieu_ville');
    gens.slice(0, 3).forEach((p, i) => R.marche(tl, p, 700 + i * 140, 1 + i * 0.4, 8, { pas: 12 }));
    R.marche(tl, gens[3], 1300, 2, 7);
    R.marche(tl, gens[4], 1460, 2.6, 7.5, { pas: 8 });
    G.dialogue(tl, 11, [[gens[0], 2], [gens[3], 2], [gens[4], 2]]);
    gens.forEach((p, i) => R.expr(tl, p, 'joie', 11 + i * 0.2));
    // Tous partent vers la source
    gens.forEach((p, i) => { tl.set(p.p, { dir: 1 }, 18 + i * 0.2); R.marche(tl, p, 2400 + i * 120, 18.2 + i * 0.2, 8, { pas: 10 }); });
    R.cam(tl, sc, { x: 1250 }, 17, 9);
    R.fonduSortie(tl, 26.5, 1.5);
  });

  // =================================================================== 3 · Le vœu d'Awa
  R.scene('Le vœu d\'Awa', 42, (sc, tl) => {
    const ga = R.plan(sc, tl, 0, 14);
    DECORS.cour(ga.sous, { grenierX: 1580 });
    const awa = sc.perso(C.elancee, COSTUMES.awa, { x: 760, y: 900 }, ga);
    const voisine = sc.perso(C.ronde, null, { x: 1180, y: 900, dir: -1 }, ga);
    const petit = sc.perso(C.bebe, null, { x: 0, y: 40, s: 0.8 }, ga);
    voisine.tenir(petit.root, 'A', { vertical: true });
    Object.assign(voisine.p, { bA: 70, cA: 90 });
    const enfants = G.foule(sc, [[C.enfant, null, 950, 1], [C.enfant, { haut: { type: 'tunique', couleur: '#5b8c5a' }, bas: { type: 'short', couleur: '#e8dcc0' } }, 1050, -1]], 900, ga);
    sc.cam.x = 960; sc.cam.y = 640; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 4.5, 'perso_awa');
    enfants.forEach((e, i) => { R.saut(tl, e, 1 + i * 0.3, 40); R.saut(tl, e, 2.2 + i * 0.3, 40); R.expr(tl, e, 'rire', 1); });
    tl.to(enfants[0].p, { x: 1150, duration: 2, yoyo: true, repeat: 1 }, 3);
    R.expr(tl, voisine, 'joie', 1);
    tl.to(voisine.p, { bob: 4, duration: 0.4, yoyo: true, repeat: 7 }, 2);
    R.pose(tl, awa, { regard: 1 }, 2, 0.3);
    R.expr(tl, awa, 'triste', 5);
    R.pose(tl, awa, { tete: -14, bA: 40, cA: 100, bR: 40, cR: 100 }, 6, 0.8);
    R.cam(tl, sc, { x: 780, y: 620, z: 1.5 }, 5, 5);
    tl.set(awa.p, { dir: -1 }, 10.5);
    R.marche(tl, awa, 200, 10.6, 3);
    R.fonduSortie(tl, 13.4, 0.6);
    // À Dafra
    const gb = R.plan(sc, tl, 14);
    DECORS.gorge(gb.sous, {});
    const poissons = silauresBassin(sc, 4, gb);
    const mah = sc.perso(C.vieille, COSTUMES.mah, { x: -150, y: SOL }, gb);
    const awa2 = sc.perso(C.elancee, COSTUMES.awa, { x: -320, y: SOL }, gb);
    tl.set(sc.cam, { x: 780, y: 620, z: 1.2 }, 14);
    R.fonduEntree(tl, 14, 0.8);
    R.marche(tl, mah, 540, 14.5, 5, { pas: 7 });
    R.marche(tl, awa2, 410, 14.8, 4.8);
    R.cartouche(tl, 16, 4.5, 'perso_mah', 'droite');
    R.pose(tl, mah, { bA: 85, cA: 40 }, 20, 0.4);
    lancer(tl, gb, 600, 720, 760, 20.4);
    rassembler(tl, poissons, 780, 20.6, 2.5);
    R.pose(tl, mah, { bA: 8, cA: 12 }, 21.4, 0.4);
    G.agenouiller(tl, awa2, 22.5);
    tl.to(awa2.p, { x: 470, duration: 0.6 }, 22.5);
    R.pose(tl, awa2, { bA: 120, bR: 115, cA: 20, cR: 20, tete: 12 }, 23.5, 0.8);
    R.parle(tl, awa2, 24, 5);
    R.expr(tl, awa2, 'serein', 24);
    R.cam(tl, sc, { x: 620, y: 660, z: 1.6 }, 23, 5);
    R.pose(tl, mah, { bA: 120, cA: 10, tete: 10 }, 25, 0.6);
    R.parle(tl, mah, 25.4, 3);
    R.cam(tl, sc, { x: 780, y: 620, z: 1.25 }, 29.5, 2);
    saut(tl, sc, gb, 760, 31, 1);
    R.expr(tl, awa2, 'surprise', 31.4);
    R.expr(tl, mah, 'joie', 32);
    R.pose(tl, mah, { bA: 8, cA: 12, tete: 0 }, 32.2, 0.5);
    G.relever(tl, awa2, 33);
    R.expr(tl, awa2, 'joie', 34);
    tl.to(awa2.p, { bob: 3, duration: 0.25, yoyo: true, repeat: 5 }, 34.2);
    G.incliner(tl, awa2, 36.5, 1.8);
    G.incliner(tl, mah, 36.8, 1.6, 30);
    R.fonduSortie(tl, 40.5, 1.5);
  });

  // =================================================================== 4 · L'enfant
  R.scene('L\'enfant', 24, (sc, tl) => {
    DECORS.gorge(sc, {});
    const poissons = silauresBassin(sc, 4, sc.monde);
    const awa = sc.perso(C.elancee, COSTUMES.awa, { x: -150, y: SOL, bA: 70, cA: 90 });
    const bebe = sc.perso(C.bebe, null, { x: 0, y: 40, s: 0.8 });
    awa.tenir(bebe.root, 'A', { vertical: true });
    const mari = sc.perso(C.trapu, COSTUMES.mari, { x: -330, y: SOL });
    const poule = sc.bete(B.poule, { x: 0, y: 0, s: 0.8 });
    mari.tenir(poule.root, 'A', { vertical: true });
    sc.cam.x = 760; sc.cam.y = 640; sc.cam.z = 1.25;
    R.fonduEntree(tl, 0, 1);
    R.expr(tl, awa, 'joie', 0); R.expr(tl, mari, 'joie', 0); R.expr(tl, bebe, 'rire', 0.5);
    R.marche(tl, awa, 470, 0.5, 5);
    R.marche(tl, mari, 330, 0.8, 5);
    tl.to(bebe.p, { bA: 140, bR: 140, duration: 0.4, yoyo: true, repeat: 5 }, 5.5);
    G.agenouiller(tl, mari, 7);
    R.pose(tl, mari, { bA: 80, cA: 0 }, 7.5, 0.5);
    tl.to(poule.root, { opacity: 0, duration: 0.4 }, 8.5);
    lancer(tl, sc.monde, 560, 760, 760, 9);
    rassembler(tl, poissons, 760, 9.2, 2.5);
    R.pose(tl, awa, { tete: 14 }, 9, 0.5);
    saut(tl, sc, sc.monde, 820, 12.5, -1);
    R.expr(tl, bebe, 'surprise', 13);
    R.expr(tl, bebe, 'rire', 14);
    G.relever(tl, mari, 14);
    G.incliner(tl, awa, 15.5, 1.8, 28);
    G.incliner(tl, mari, 15.7, 1.8, 35);
    R.cam(tl, sc, { x: 600, y: 660, z: 1.6 }, 16, 5);
    R.fonduSortie(tl, 22.5, 1.5);
  });

  // =================================================================== 5 · L'étranger
  R.scene('L\'étranger', 44, (sc, tl) => {
    DECORS.gorge(sc, {});
    const poissons = silauresBassin(sc, 4, sc.monde);
    const mah = sc.perso(C.vieille, COSTUMES.mah, { x: 470, y: SOL });
    const pecheur = sc.perso(C.trapu, COSTUMES.pecheur, { x: 2200, y: SOL, dir: -1 });
    // Deux prises du harpon : droit pour marcher, dans l'axe du bras pour frapper.
    const harpon = pecheur.tenir(D.lance(230), 'A', { vertical: true });
    const lanceCoup = objet(D.lance(230), false);
    const harponCoup = pecheur.tenir(lanceCoup, 'A', { angle: 180 });
    const prise = sc.bete(B.silure, { x: 0, y: -150, s: 0.42, rot: 90, alpha: 0 }); // prise retournée : -y = vers la pointe
    harponCoup.appendChild(prise.root);
    sc.cam.x = 1150; sc.cam.y = 600; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, pecheur, 1420, 1, 6);
    R.cartouche(tl, 4, 4.5, 'perso_etranger', 'droite');
    R.pose(tl, pecheur, { tete: 18, lean: 18 }, 7.4, 0.6);
    R.expr(tl, pecheur, 'joie', 7.6);
    R.pose(tl, pecheur, { sourcils: 0.6 }, 8, 0.3);
    poissons.forEach((f, i) => tl.to(f.p, { x: `+=${(i % 2 ? -1 : 1) * 90}`, duration: 3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0));
    // Mah avertit
    R.expr(tl, mah, 'surprise', 9);
    R.marche(tl, mah, 560, 9.5, 1.2, { pas: 2 });
    R.parle(tl, mah, 11, 4);
    R.pose(tl, mah, { bA: 100, cA: 30 }, 11, 0.4);
    tl.to(mah.p, { cA: 60, duration: 0.25, yoyo: true, repeat: 7 }, 11.4);
    tl.to(mah.p, { tete: 10, duration: 0.3, yoyo: true, repeat: 5 }, 12);
    R.expr(tl, mah, 'colere', 12);
    tl.set(pecheur.p, { dir: -1 }, 11);
    R.pose(tl, pecheur, { lean: 0, tete: 0 }, 11, 0.4);
    R.expr(tl, pecheur, 'rire', 15.4);
    tl.to(pecheur.p, { bob: 4, duration: 0.2, yoyo: true, repeat: 7 }, 15.5);
    R.pose(tl, pecheur, { bR: 120, cR: 60 }, 16, 0.4);
    R.pose(tl, pecheur, { bR: -8, cR: 12 }, 17.6, 0.4);
    // Il harponne un silure
    tl.set(pecheur.p, { dir: -1 }, 18.5);
    R.marche(tl, pecheur, 1330, 18.6, 1, { pas: 2 });
    R.cam(tl, sc, { x: 1180, y: 640, z: 1.45 }, 18.5, 2);
    tl.set(harpon, { opacity: 0 }, 20); tl.set(lanceCoup, { opacity: 1 }, 20);
    R.pose(tl, pecheur, { bA: 165, cA: 20, lean: -6 }, 20, 0.5);
    R.pose(tl, pecheur, { bA: 75, cA: 0, lean: 34 }, 20.7, 0.2, 'power3.in');
    const gerbe = D.particules(sc.monde, 14, 1200, BY - 6, '#cfe8f1', 9);
    R.jaillir(tl, gerbe, 20.9, 0, { n: 12, ecart: 18, haut: 60, duree: 0.6 });
    tl.to(poissons[3].p, { alpha: 0, duration: 0.1 }, 20.95);
    tl.to(poissons.slice(0, 3).map((f) => f.p), { x: 700, marcheAmp: 1.5, duration: 1.2 }, 21);
    R.pose(tl, pecheur, { bA: 150, cA: 0, lean: -4 }, 21.6, 0.6);
    tl.to(prise.p, { alpha: 1, duration: 0.1 }, 21.7);
    tl.to(prise.p, { rot: 70, duration: 0.15, yoyo: true, repeat: 9 }, 22);
    R.expr(tl, pecheur, 'rire', 22);
    R.expr(tl, mah, 'peur', 21.2);
    R.pose(tl, mah, { bA: 60, cA: 120, bR: 55, cR: 120 }, 21.4, 0.5);
    // Il repart ; le ciel s'assombrit
    const ombre = R.el('rect', { x: -1000, y: -2000, width: 3920, height: 4000, fill: '#1d1830', opacity: 0 }, sc.monde);
    sc.monde.insertBefore(ombre, sc.monde.children[1]);
    tl.set(pecheur.p, { dir: 1 }, 25);
    R.marche(tl, pecheur, 2300, 25.2, 5);
    R.cam(tl, sc, { x: 960, y: 560, z: 1 }, 25, 4);
    tl.to(ombre, { opacity: 0.4, duration: 6 }, 28);
    G.pleurer(tl, mah, 30, 5);
    tl.to(sc.cam, { z: 1.4, x: 600, y: 650, duration: 8 }, 32);
    R.fonduSortie(tl, 42.5, 1.5);
  });

  // =================================================================== 6 · La colère de l'eau
  R.scene('La colère de l\'eau', 40, (sc, tl) => {
    // 6a · la cascade se tarit (0–13)
    const ga = R.plan(sc, tl, 0, 13);
    const d = DECORS.gorge(ga.sous, { ciel: 'chaud' });
    tl.set(sc.cam, { x: 960, y: 560, z: 1 }, 0);
    R.fonduEntree(tl, 0, 1);
    tl.to(d.cascade, { opacity: 0, scaleX: 0.2, transformOrigin: '50% 0%', duration: 6 }, 1.5);
    tl.to(d.bassin.eau, { attr: { rx: 90, ry: 8 }, duration: 8 }, 2);
    R.cam(tl, sc, { z: 1.25, y: 640 }, 2, 9);
    R.fonduSortie(tl, 12.4, 0.6);
    // 6b · à Sya, les canaris restent vides (13–26)
    const gb = R.plan(sc, tl, 13, 26);
    DECORS.ville(gb.sous, { ciel: 'chaud', soleil: [1500, 160, 80] });
    const gens = G.foule(sc, [[C.ronde, null, 700, 1], [C.ancien, null, 900, -1], [C.enfant, null, 1050, -1]], SOL, gb);
    const vide = D.canari(gb, 800, SOL + 4, 0.8);
    tl.set(sc.cam, { x: 860, y: 640, z: 1.3 }, 13);
    R.fonduEntree(tl, 13, 0.6);
    R.pose(tl, gens[0], { lean: 40, bA: 40, tete: 10 }, 14, 0.6);
    R.expr(tl, gens[0], 'triste', 15);
    R.pose(tl, gens[0], { lean: 0, bA: 140, cA: 30, bR: 140, cR: 30 }, 16.5, 0.5);
    G.exprFoule(tl, gens, 'triste', 16.6);
    G.prier(tl, gens[1], 18, 5);
    G.pleurer(tl, gens[2], 19, 4);
    R.fonduSortie(tl, 25.4, 0.6);
    // 6c · le pêcheur malade (26–40)
    const gc = R.plan(sc, tl, 26);
    DECORS.brousse(gc.sous, { ciel: 'soir' });
    const feu = D.feu(gc, 700, SOL + 2, 0.8);
    G.flamber(tl, feu, 26, 14);
    R.el('rect', { x: 820, y: 872, width: 260, height: 12, rx: 4, fill: '#d9b26a' }, gc);
    const pecheur = sc.perso(C.trapu, COSTUMES.pecheur, Object.assign({ x: 1050, y: 862, rot: -90 }, R.EXPRESSIONS.malade), gc);
    const prison = D.canari(gc, 1200, SOL + 4, 0.9);
    tl.set(sc.cam, { x: 950, y: 700, z: 1.5 }, 26);
    R.fonduEntree(tl, 26, 0.8);
    tl.to(pecheur.p, { bouche: 0.5, duration: 0.3, yoyo: true, repeat: 5 }, 28);
    tl.to(pecheur.p, { frisson: 1, x: '+=3', duration: 0.08, yoyo: true, repeat: 30 }, 30);
    R.pose(tl, pecheur, { regard: 1 }, 33, 0.4);
    R.cam(tl, sc, { x: 1150, z: 1.8, y: 720 }, 33, 3);
    tl.to(prison, { rotation: 6, transformOrigin: '50% 100%', duration: 0.2, yoyo: true, repeat: 3 }, 35);
    R.expr(tl, pecheur, 'triste', 36);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 7 · Le pardon
  R.scene('Le pardon', 45, (sc, tl) => {
    const d = DECORS.gorge(sc, {});
    gsap.set(d.cascade, { opacity: 0.15, scaleX: 0.3, transformOrigin: '50% 0%' });
    gsap.set(d.bassin.eau, { attr: { rx: 120, ry: 10 } });
    const poissons = silauresBassin(sc, 3, sc.monde);
    poissons.forEach((f, i) => gsap.set(f.p, { x: 900 + i * 60, alpha: 0 }));
    const mah = sc.perso(C.vieille, COSTUMES.mah, { x: 420, y: SOL });
    const pecheur = sc.perso(C.trapu, COSTUMES.pecheur, Object.assign({ x: -200, y: SOL, bA: 70, cA: 90, bR: 65, cR: 90 }, R.EXPRESSIONS.triste));
    const cn = D.canari(null, 0, 40, 0.7); pecheur.tenir(cn, 'A', { vertical: true });
    const gens = G.foule(sc, [[C.elancee, COSTUMES.awa, 2150, -1], [C.ronde, null, 2280, -1], [C.ancien, null, 2420, -1], [C.enfant, null, 2520, -1], [C.trapu, COSTUMES.mari, 2650, -1]]);
    sc.cam.x = 760; sc.cam.y = 620; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1.2);
    R.marche(tl, pecheur, 560, 1, 6, { pas: 7 });
    R.pose(tl, pecheur, { tete: -12 }, 1, 0.5);
    R.expr(tl, mah, 'colere', 6);
    R.pose(tl, mah, { regard: 1 }, 6, 0.3);
    G.agenouiller(tl, pecheur, 7.6);
    R.parle(tl, pecheur, 8.6, 4);
    R.expr(tl, mah, 'serein', 12.5);
    tl.to(mah.p, { tete: 10, duration: 0.35, yoyo: true, repeat: 3 }, 12.8);
    // Il rend le silure à l'eau
    R.pose(tl, pecheur, { bA: 120, cA: 10, lean: 30 }, 14.5, 0.7);
    tl.to(cn, { rotation: 70, duration: 0.5 }, 15.1);
    saut(tl, sc, sc.monde, 640, 15.4, 1);
    tl.to(poissons[0].p, { alpha: 1, duration: 0.3 }, 16.4);
    R.cam(tl, sc, { x: 860, y: 640, z: 1.35 }, 15, 3);
    // Mah nourrit les silures ; l'eau revient
    R.pose(tl, mah, { bA: 85, cA: 40 }, 18, 0.4);
    lancer(tl, sc.monde, 480, 720, 880, 18.4);
    tl.to(poissons.map((f) => f.p), { alpha: 1, duration: 1, stagger: 0.4 }, 18.8);
    R.pose(tl, mah, { bA: 8, cA: 12 }, 19.4, 0.4);
    tl.to(d.cascade, { opacity: 0.85, scaleX: 1, duration: 5 }, 20);
    tl.to(d.bassin.eau, { attr: { rx: 360, ry: 24 }, duration: 6 }, 20.5);
    R.cam(tl, sc, { x: 960, y: 560, z: 1 }, 20, 5);
    R.expr(tl, pecheur, 'surprise', 21);
    G.relever(tl, pecheur, 22.5);
    R.expr(tl, pecheur, 'joie', 24);
    R.pose(tl, pecheur, { tete: 0 }, 22.5, 0.5);
    G.incliner(tl, pecheur, 25, 2, 42);
    // Les habitants accourent et fêtent l'eau revenue
    gens.forEach((p, i) => R.marche(tl, p, 1400 + i * 110, 25 + i * 0.25, 4.5, { pas: 7 }));
    G.exprFoule(tl, gens, 'joie', 29.5);
    G.danseFoule(tl, gens.concat([pecheur]), 31, 10, SOL);
    G.applaudir(tl, mah, 31.5, 8);
    R.expr(tl, mah, 'joie', 31);
    R.cam(tl, sc, { x: 1100, y: 560, z: 0.95 }, 30, 6);
    R.fonduSortie(tl, 43.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 25, (sc, tl) => {
    DECORS.gorge(sc, { ciel: 'soir' });
    const poissons = silauresBassin(sc, 5, sc.monde);
    const visiteurs = G.foule(sc, [[C.europeen, { haut: { type: 'tunique', couleur: '#5b7c9a' }, manches: '#5b7c9a', jambes: '#3a4a5a', tete: null }, 470, 1], [C.fille, null, 560, 1], [C.vieille, COSTUMES.mah, 1460, -1]]);
    sc.cam.x = 960; sc.cam.y = 580; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1.2);
    R.cartouche(tl, 0.8, 4.5, 'lieu_aujourdhui');
    R.pose(tl, visiteurs[1], { bA: 85, cA: 30 }, 2, 0.4);
    lancer(tl, sc.monde, 610, 740, 760, 2.4);
    rassembler(tl, poissons, 760, 2.6, 2.5);
    R.expr(tl, visiteurs[1], 'rire', 3);
    R.expr(tl, visiteurs[0], 'surprise', 3.5);
    saut(tl, sc, sc.monde, 820, 5.5, 1);
    R.expr(tl, visiteurs[0], 'joie', 6.5);
    G.saluer(tl, visiteurs[2], 7, 2);
    R.cam(tl, sc, { z: 0.9, y: 500 }, 5, 7);
    R.fonduSortie(tl, 12.5, 1.5);
    R.titre(tl, 14, 4, 'fin');
    R.generique(tl, 18.6, 6.2, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
