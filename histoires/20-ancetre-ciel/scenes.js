/*
 * 20 · L'ancêtre tombé du ciel — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;

  const COSTUMES = {
    // Le géant du casting, mais pas en Wuro : pagne de ciel, sans barbe d'or ni boubou.
    ancetre: { haut: null, bas: { type: 'pagne', couleur: '#2f3f8f', motif: 'points', motifCouleur: '#f6f0e8' }, ceinture: '#b23a2a', collier: '#b23a2a', bracelets: '#e8eefc' },
    epouse: { haut: { type: 'camisole', couleur: '#e8eefc' }, bas: { type: 'jupe', couleur: '#2f3f8f', motif: 'points', motifCouleur: '#f6f0e8' }, collier: '#b23a2a', tete: null },
    kassena: { haut: { type: 'camisole', couleur: '#b23a2a' }, bas: { type: 'jupe', couleur: '#1d140f', motif: 'chevrons', motifCouleur: '#f6ead2' }, collier: '#f6ead2' },
  };
  // L'ancêtre : corps du géant, sans halo (il est humain une fois sur terre).
  const ANCETRE = Object.assign({}, C.geant, { halo: null, barbe: 'courte', barbeCouleur: '#1d140f', peau: '#6a3d22', sourcilsCouleur: '#1d140f' });
  const couple = (sc, x, y, parent) => ({
    a: sc.perso(ANCETRE, COSTUMES.ancetre, { x, y: y || SOL }, parent),
    e: sc.perso(C.elancee, COSTUMES.epouse, { x: x - 170, y: y || SOL }, parent),
  });

  // =================================================================== 1 · Le pays d'en haut
  R.scene('Le pays d\'en haut', 26, (sc, tl) => {
    const d = DECORS.cosmos(sc);
    const nuages = R.el('g', {}, sc.monde);
    for (let i = 0; i < 8; i++) D.nuage(nuages, -200 + i * 320, 820 + (i % 2) * 40, 1.6, '#c9d3f2');
    const c = couple(sc, 1050, 800);
    sc.cam.y = 520; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 2);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 280);
    R.cartouche(tl, 8, 5, 'lieu_ciel');
    tl.to(nuages, { x: -200, duration: 26, ease: 'none' }, 0);
    R.cam(tl, sc, { x: 960, y: 600, z: 1.1 }, 8, 14);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · La terre vide
  R.scene('La terre vide', 30, (sc, tl) => {
    const fond = sc.calque();
    D.ciel(fond, '#3a4f9a', '#c9d3f2');
    D.etoiles(fond, 60, 7);
    const nuages = R.el('g', {}, sc.monde);
    for (let i = 0; i < 9; i++) D.nuage(nuages, -300 + i * 300, 700 + (i % 3) * 30, 1.8, '#eef0fb');
    // Trou dans les nuages : on voit la terre, très bas
    const terre = R.el('g', {}, sc.monde);
    R.el('ellipse', { cx: 960, cy: 1180, rx: 520, ry: 220, fill: '#b98652' }, terre);
    R.el('ellipse', { cx: 960, cy: 1180, rx: 520, ry: 220, fill: 'none', stroke: '#eef0fb', 'stroke-width': 40, opacity: 0.8 }, terre);
    const c = couple(sc, 1080, 720);
    sc.cam.x = 960; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'perso_ancetre');
    R.pose(tl, c.a, { lean: 30, tete: 20 }, 2, 1);
    R.pose(tl, c.e, { lean: 25, tete: 15 }, 2.4, 1);
    R.cam(tl, sc, { x: 960, y: 820, z: 1.15 }, 3, 4);
    R.cartouche(tl, 6, 4, 'perso_epouse', 'droite');
    G.dialogue(tl, 8, [[c.e, 2.5], [c.a, 3]]);
    G.pointer(tl, c.a, 11.5, 4, -0.6);
    R.cam(tl, sc, { x: 960, y: 580, z: 1 }, 13, 3);
    R.pose(tl, c.a, { lean: 0, tete: 0 }, 16, 0.6);
    R.pose(tl, c.e, { lean: 0, tete: 0 }, 16.2, 0.6);
    R.expr(tl, c.e, 'joie', 17);
    R.pose(tl, c.a, { bA: 85, cA: 0 }, 18, 0.5); R.pose(tl, c.e, { bA: 85, cA: 0 }, 18.3, 0.5);
    R.expr(tl, c.a, 'serein', 19);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 3 · La descente
  R.scene('La descente', 36, (sc, tl) => {
    const fond = sc.calque();
    D.ciel(fond, '#3a4f9a', '#f2a65a');
    // Corde de lumière : un rectangle (un filtre sur une ligne verticale ne s'affiche pas)
    const corde = R.el('rect', { x: 975, y: -2000, width: 8, height: 0, rx: 4, fill: '#fff1a8' }, sc.monde);
    const halo = R.el('rect', { x: 955, y: -2000, width: 48, height: 0, fill: '#fff1a8', opacity: 0.25 }, sc.monde);
    const terre = sc.calque();
    D.collines(terre, 770, '#a87a50', 5, 50);
    D.sol(terre, SOL, '#b9864e', '#8a5a32');
    gsap.set(terre, { y: 1200 });
    const c = couple(sc, 962, -600);
    c.e.p.x = 965; c.e.p.y = -900;
    [c.a, c.e].forEach((p) => Object.assign(p.p, { bA: 170, bR: 165, cA: 0, cR: 0 }));
    sc.cam.x = 960; sc.cam.y = -400; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1);
    tl.to([corde, halo], { attr: { height: 2000 + SOL }, duration: 3, ease: 'power1.in' }, 0.5);
    tl.to(c.a.p, { y: SOL, duration: 20, ease: 'sine.inOut' }, 3);
    tl.to(c.e.p, { y: SOL, duration: 20, ease: 'sine.inOut' }, 4);
    tl.to(sc.cam, { y: 600, duration: 20, ease: 'sine.inOut' }, 3);
    tl.to(terre, { y: 0, duration: 20, ease: 'sine.inOut' }, 3);
    [c.a, c.e].forEach((p, i) => tl.to(p.p, { cA: 20, cR: -20, duration: 0.6, yoyo: true, repeat: 30 }, 3 + i * 0.3));
    G.exprFoule(tl, [c.a, c.e], 'serein', 3);
    R.cartouche(tl, 22, 5, 'lieu_terre');
    [c.a, c.e].forEach((p) => R.pose(tl, p, { bA: 8, bR: -8, cA: 12, cR: 12 }, 24, 0.6));
    R.marche(tl, c.a, 1130, 22.9, 1.2, { pas: 2 });
    tl.to(c.e.p, { x: 900, duration: 1 }, 24.2);
    tl.to([corde, halo], { opacity: 0, duration: 3 }, 26);
    R.expr(tl, c.e, 'surprise', 27);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 4 · La pluie
  R.scene('La pluie', 40, (sc, tl) => {
    const champ = DECORS.champ(sc, {});
    gsap.set(champ.sec.g, { opacity: 0 });
    champ.vert.tiges.forEach((t) => gsap.set(t, { scaleY: 0, svgOrigin: '0 0' }));
    gsap.set(champ.vert.g, { opacity: 1 });
    const c = couple(sc, 1050);
    c.e.p.x = 820;
    const pluie = D.pluie(sc.monde, 200, 31);
    const nuages = R.el('g', {}, sc.monde);
    const ns = []; for (let i = 0; i < 6; i++) ns.push(D.nuage(nuages, -800 + (i % 3) * 140, 90 + (i % 2) * 60, 1.8, '#5a6080'));
    sc.cam.x = 960; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.pose(tl, c.a, { lean: 35, tete: 15 }, 1, 0.6);
    R.pose(tl, c.a, { bA: 40, cA: 30 }, 1.5, 0.5);
    tl.to(c.a.p, { cA: 60, duration: 0.3, yoyo: true, repeat: 3 }, 2);
    R.expr(tl, c.a, 'triste', 3);
    R.pose(tl, c.a, { lean: 0, tete: 0, bA: 8, cA: 12 }, 4.5, 0.6);
    R.expr(tl, c.e, 'triste', 3.5);
    // Il appelle la pluie du pays d'en haut
    G.prier(tl, c.a, 7, 9);
    R.parle(tl, c.a, 8, 5);
    tl.to(champ.cielOrage, { opacity: 1, duration: 3 }, 9);
    tl.to(champ.soleil, { opacity: 0, duration: 2 }, 9);
    ns.forEach((n, i) => tl.to(n, { x: `+=${1500 + (i % 3) * 300}`, duration: 4, ease: 'power2.out' }, 9 + i * 0.2));
    R.cam(tl, sc, { y: 520, z: 0.9 }, 9, 4);
    R.eclairBlanc(tl, 13, 0.4);
    tl.to(pluie, { opacity: 1, duration: 0.8 }, 13.5);
    tl.fromTo(pluie.inner, { y: 0 }, { y: pluie.zoneH, duration: 0.6, ease: 'none', repeat: 34, immediateRender: false }, 13.5);
    G.exprFoule(tl, [c.a, c.e], 'joie', 15);
    R.pose(tl, c.e, { bA: 125, bR: 120, cA: 0, cR: 0, tete: 22 }, 15.5, 0.6);
    tl.to(champ.vert.tiges, { scaleY: 1, duration: 1.5, ease: 'back.out(1.4)', stagger: 0.25 }, 17);
    R.danse(tl, c.e, 22, 8, { y: SOL, tempo: 0.5 });
    R.cam(tl, sc, { x: 960, y: 600, z: 1 }, 20, 6);
    tl.to(pluie, { opacity: 0, duration: 2 }, 33);
    tl.to(champ.cielOrage, { opacity: 0, duration: 3 }, 33);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 5 · La première case
  R.scene('La première case', 40, (sc, tl) => {
    DECORS.brousse(sc, {});
    const c = couple(sc, 1150);
    c.e.p.x = 650;
    const kase = D.caseRonde(sc.monde, 900, SOL, 1, { couleur: '#a8603a', toit: false });
    gsap.set(kase, { scale: 0, transformOrigin: '50% 100%' });
    sc.monde.appendChild(c.a.root); sc.monde.appendChild(c.e.root);
    const enfants = G.foule(sc, [[C.enfant, null, 1350, -1, 1, { alpha: 0 }], [C.fille, null, 1480, -1, 1, { alpha: 0 }]]);
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    c.e.tenir(D.calebasse(), 'A', { vertical: true });
    G.piocher(tl, c.a, 1, 10, 0.9);
    R.pose(tl, c.e, { lean: 30, bA: 60 }, 2, 0.6);
    tl.to(c.e.p, { cA: 50, duration: 0.4, yoyo: true, repeat: 15 }, 2.6);
    tl.to(kase, { scale: 1, duration: 10, ease: 'power1.inOut' }, 2);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.2 }, 4, 8);
    R.pose(tl, c.e, { lean: 0, bA: 8, cA: 12 }, 13, 0.5);
    G.exprFoule(tl, [c.a, c.e], 'joie', 13.5);
    R.cartouche(tl, 14, 4.5, 'lieu_village');
    // Les années passent : des enfants naissent
    tl.to(enfants.map((e) => e.p), { alpha: 1, duration: 1.5, stagger: 1 }, 19);
    R.saut(tl, enfants[0], 22, 40); R.saut(tl, enfants[1], 22.5, 40);
    G.exprFoule(tl, enfants, 'rire', 21);
    R.cam(tl, sc, { x: 1100, y: 600, z: 1 }, 20, 5);
    R.pose(tl, c.a, { bA: 60, cA: 70 }, 26, 0.5);
    R.expr(tl, c.a, 'serein', 26);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 6 · Les murs peints
  R.scene('Les murs peints', 38, (sc, tl) => {
    const t = DECORS.tiebele(sc, {});
    gsap.set(t.cases, { opacity: 0 });
    const blanc = R.el('g', {}, sc.monde);
    D.caseRonde(blanc, 960, SOL, 1.4, { couleur: '#a8603a', toit: false });
    const peinte = R.el('g', { opacity: 0 }, sc.monde);
    D.caseRonde(peinte, 960, SOL, 1.4, { couleur: '#a8603a', motifs: true, toit: false });
    const femmes = G.foule(sc, [[C.elancee, COSTUMES.kassena, 760, 1], [C.ronde, COSTUMES.kassena, 1160, -1], [C.fille, COSTUMES.kassena, 640, 1]]);
    femmes.forEach((f) => f.tenir(D.baton(60, '#1d140f'), 'A'));
    sc.cam.x = 960; sc.cam.y = 680; sc.cam.z = 1.4;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_peinture');
    femmes.forEach((f, i) => { R.pose(tl, f, { bA: 100, cA: 30 }, 2 + i * 0.3, 0.4); tl.to(f.p, { bA: 80, cA: 50, duration: 0.5, yoyo: true, repeat: 17 }, 2.5 + i * 0.3); });
    tl.to(peinte, { opacity: 1, duration: 12 }, 3);
    R.cam(tl, sc, { x: 960, y: 760, z: 2 }, 6, 6);
    G.exprFoule(tl, femmes, 'joie', 16);
    femmes.forEach((f) => R.pose(tl, f, { bA: 8, cA: 12 }, 17, 0.4));
    R.cam(tl, sc, { x: 960, y: 560, z: 0.9 }, 18, 4);
    tl.to(t.cases, { opacity: 1, duration: 1.5, stagger: 0.5 }, 20);
    G.danseFoule(tl, femmes, 24, 10);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 7 · Les descendants
  R.scene('Les descendants', 34, (sc, tl) => {
    DECORS.tiebele(sc, { ciel: 'soir' });
    const vieux = sc.perso(ANCETRE, Object.assign({}, COSTUMES.ancetre, { haut: { type: 'boubou', couleur: '#2f3f8f', motif: 'points', motifCouleur: '#f6f0e8', long: 1.8 }, manches: '#2f3f8f' }), { x: 960, y: SOL, lean: 10 });
    vieux.tenir(D.baton(260), 'R', { vertical: true });
    const desc = G.foule(sc, [[C.guerrier, H.guerrier, 700, 1], [C.elancee, COSTUMES.kassena, 560, 1], [C.trapu, H.villageois, 1250, -1], [C.ronde, COSTUMES.kassena, 1380, -1], [C.enfant, null, 1150, -1]]);
    sc.cam.x = 960; sc.cam.y = 580; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    G.exprFoule(tl, desc, 'serein', 1);
    desc.forEach((p, i) => G.incliner(tl, p, 2 + i * 0.2, 2, 30));
    G.dialogue(tl, 5, [[vieux, 4]]);
    G.pointer(tl, vieux, 6, 3, 0.9);
    R.cam(tl, sc, { y: 360, z: 0.75 }, 9, 5);
    R.cartouche(tl, 14, 6, 'lieu_chefferie');
    const etoile = D.lumiere(sc.monde, 960, 120, 10, '#fff1a8');
    gsap.set(etoile, { opacity: 0, scale: 0.5, transformOrigin: '50% 50%' });
    tl.to(etoile, { opacity: 1, scale: 1.5, duration: 2 }, 12);
    R.cam(tl, sc, { y: 580, z: 0.95 }, 22, 6);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 26, (sc, tl) => {
    DECORS.tiebele(sc, { ciel: 'soir' });
    const gens = G.foule(sc, [[C.vieille, COSTUMES.kassena, 860, 1], [C.fille, COSTUMES.kassena, 1000, -1], [C.europeen, { haut: { type: 'tunique', couleur: '#5b7c9a' }, manches: '#5b7c9a', jambes: '#3a4a5a', tete: null }, 1180, -1]]);
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_aujourdhui');
    G.pointer(tl, gens[0], 2, 4, 0.3);
    R.parle(tl, gens[0], 2, 3);
    G.exprFoule(tl, gens.slice(1), 'joie', 4);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 6, 6);
    R.fonduSortie(tl, 11.5, 1.5);
    R.titre(tl, 13, 4, 'fin');
    R.generique(tl, 17.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
