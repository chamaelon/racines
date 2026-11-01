/*
 * 17 · Landolo et le grand caïlcédrat — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, ARBRE_X = 1250;
  const { montrer, cacher, objet } = R;

  const COSTUMES = {
    landolo: { haut: { type: 'tunique', couleur: '#a89a7a', motif: 'bandes', motifCouleur: '#6a5a3a' }, bas: { type: 'short', couleur: '#6a5a3a' } },
    fils: { haut: { type: 'tunique', couleur: '#e9c46a', motif: 'points', motifCouleur: '#c8553d' }, bas: { type: 'short', couleur: '#c8553d' } },
    maratre: { haut: { type: 'camisole', couleur: '#7a1f4a' }, bas: { type: 'jupe', couleur: '#e9c46a', motif: 'chevrons', motifCouleur: '#7a1f4a' }, tete: { type: 'foulard', couleur: '#7a1f4a' }, collier: '#e9c46a' },
    landoloAdulte: { haut: { type: 'tunique', couleur: '#5b8c5a', motif: 'chevrons', motifCouleur: '#e8eefc' }, bas: { type: 'short', couleur: '#e8dcc0' } },
  };
  /** Le grand caïlcédrat (son feuillage peut briller et se balancer). */
  function grandArbre(sc, parent) {
    const a = D.cailcedrat(parent || sc.monde, ARBRE_X, SOL + 6, 1.2);
    a.halo = R.el('ellipse', { cx: ARBRE_X, cy: SOL - 450, rx: 320, ry: 200, fill: '#fff1a8', opacity: 0, filter: 'url(#flou-fort)' }, parent || sc.monde);
    a.parentNode.insertBefore(a.halo, a);
    return a;
  }
  const balancer = (tl, a, at, duree, amp) => tl.to(a.feuillage, { rotation: amp || 3, svgOrigin: "0 -260", duration: 1.2, yoyo: true, repeat: Math.round(duree / 1.2), ease: 'sine.inOut' }, at);
  /** Fruits qui tombent de l'arbre vers (x, SOL). */
  function fruits(tl, parent, x, at, n) {
    for (let i = 0; i < (n || 5); i++) {
      const f = R.el('circle', { cx: 0, cy: 0, r: 9, fill: '#e9a23b', stroke: '#9a6a20', 'stroke-width': 2, opacity: 0 }, parent);
      const x0 = ARBRE_X - 160 + i * 50, xf = x + (i - 2) * 22;
      tl.set(f, { x: x0, y: SOL - 380, opacity: 1 }, at + i * 0.2);
      tl.to(f, { x: xf, duration: 0.8, ease: 'none' }, at + i * 0.2);
      tl.to(f, { y: SOL - 6, duration: 0.8, ease: 'bounce.out' }, at + i * 0.2);
    }
  }

  // =================================================================== 1 · Le village et l'arbre
  R.scene('Le grand caïlcédrat', 26, (sc, tl) => {
    DECORS.village(sc, { soleil: [300, 200, 60] });
    const a = grandArbre(sc);
    sc.cam.x = 1100; sc.cam.y = 500; sc.cam.z = 0.85;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 260);
    balancer(tl, a, 0, 24, 2);
    R.cartouche(tl, 8, 5, 'lieu_arbre');
    R.cam(tl, sc, { x: 1250, y: 460, z: 1 }, 8, 14);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · L'orphelin
  R.scene('L\'orphelin', 36, (sc, tl) => {
    DECORS.cour(sc, { grenierX: 1580 });
    const landolo = sc.perso(C.enfant, COSTUMES.landolo, { x: 400, y: 900 });
    const balai = landolo.tenir(D.baton(110, '#c9a24a'), 'A');
    const maratre = sc.perso(C.ronde, COSTUMES.maratre, { x: 1050, y: 900, dir: -1 });
    const fils = sc.perso(C.enfant, COSTUMES.fils, { x: 1200, y: 900, dir: -1 });
    const plat = D.calebasse(); fils.tenir(plat, 'A', { vertical: true });
    sc.cam.x = 800; sc.cam.y = 680; sc.cam.z = 1.25;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'perso_landolo');
    R.expr(tl, landolo, 'triste', 0.5);
    for (let i = 0; i < 6; i++) { R.pose(tl, landolo, { lean: 30, bA: 40 + (i % 2) * 40, cA: 20 }, 1 + i * 0.8, 0.4); }
    R.marche(tl, landolo, 650, 1, 5, { pas: 4, amp: 0.6 });
    R.cartouche(tl, 6.5, 4.5, 'perso_maratre', 'droite');
    R.expr(tl, maratre, 'colere', 7);
    G.pointer(tl, maratre, 7.5, 3);
    R.parle(tl, maratre, 7.5, 3);
    R.pose(tl, landolo, { lean: 0, bA: 8, cA: 12 }, 7, 0.4);
    R.cam(tl, sc, { x: 950, y: 680, z: 1.3 }, 7, 3);
    // Le fils mange, Landolo n'a rien
    R.expr(tl, fils, 'joie', 12);
    for (let i = 0; i < 5; i++) R.pose(tl, fils, { bR: i % 2 ? 140 : 40, cR: i % 2 ? 120 : 20 }, 12 + i * 0.6, 0.3);
    R.pose(tl, maratre, { bA: 60, cA: 70 }, 13, 0.5);
    tl.to(maratre.p, { tete: -10, duration: 0.5 }, 13);
    R.marche(tl, landolo, 850, 16, 1.5, { pas: 3 });
    R.pose(tl, landolo, { bA: 80, cA: 10 }, 17.6, 0.4);
    R.expr(tl, maratre, 'colere', 18);
    G.pointer(tl, maratre, 18.5, 2.5);
    R.pose(tl, landolo, { bA: 8, cA: 12 }, 19, 0.4);
    G.pleurer(tl, landolo, 21, 4);
    tl.set(landolo.p, { dir: -1 }, 26);
    R.marche(tl, landolo, -200, 26.2, 5, { pas: 9, amp: 1.2 });
    R.cam(tl, sc, { x: 600, y: 680, z: 1.2 }, 26, 5);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 3 · L'arbre qui nourrit
  R.scene('L\'arbre qui nourrit', 40, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir' });
    const a = grandArbre(sc);
    const landolo = sc.perso(C.enfant, COSTUMES.landolo, { x: -200, y: SOL });
    sc.cam.x = 1100; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, landolo, 1080, 1, 7, { pas: 10 });
    R.expr(tl, landolo, 'triste', 1);
    R.pose(tl, landolo, { assis: 1 }, 8.2, 0.6);
    G.pleurer(tl, landolo, 9, 6);
    R.cam(tl, sc, { x: 1100, y: 720, z: 1.6 }, 8, 3);
    // L'arbre s'éveille
    R.cam(tl, sc, { x: 1200, y: 520, z: 0.9 }, 15, 3);
    tl.to(a.halo, { opacity: 0.55, duration: 2 }, 15.5);
    balancer(tl, a, 15.5, 12, 4);
    fruits(tl, sc.monde, 1160, 18, 6);
    R.expr(tl, landolo, 'surprise', 19);
    R.pose(tl, landolo, { assis: 0, tete: 25 }, 19.2, 0.6);
    R.cam(tl, sc, { x: 1130, y: 720, z: 1.6 }, 21, 3);
    R.pose(tl, landolo, { lean: 40, bA: 50 }, 24, 0.5);
    R.pose(tl, landolo, { lean: 0, bA: 120, cA: 120, tete: 0 }, 25, 0.5);
    R.expr(tl, landolo, 'joie', 25.5);
    tl.to(landolo.p, { cA: 150, duration: 0.25, yoyo: true, repeat: 7 }, 26);
    R.pose(tl, landolo, { bA: 8, cA: 12 }, 30, 0.4);
    G.incliner(tl, landolo, 31, 2.5, 35);
    tl.to(a.halo, { opacity: 0, duration: 3 }, 33);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 4 · Chaque jour
  R.scene('Chaque jour', 30, (sc, tl) => {
    DECORS.brousse(sc, {});
    const a = grandArbre(sc);
    const landolo = sc.perso(C.enfant, COSTUMES.landolo, { x: 1000, y: SOL });
    sc.cam.x = 1100; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_jours');
    R.parle(tl, landolo, 2, 10);
    R.expr(tl, landolo, 'joie', 2);
    G.notes(tl, sc.monde, 1020, 720, 2, 10);
    balancer(tl, a, 2, 12, 5);
    R.danse(tl, landolo, 13, 6, { y: SOL, tempo: 0.45, saut: 22 });
    fruits(tl, sc.monde, 900, 15, 4);
    tl.to(landolo.p, { s: 1.15, duration: 8 }, 18);
    R.cam(tl, sc, { x: 1150, y: 560, z: 0.95 }, 18, 8);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 5 · La jalousie
  R.scene('La jalousie', 36, (sc, tl) => {
    DECORS.brousse(sc, {});
    const a = grandArbre(sc);
    const landolo = sc.perso(C.enfant, COSTUMES.landolo, { x: 1050, y: SOL, s: 1.15 });
    const maratre = sc.perso(C.ronde, COSTUMES.maratre, { x: 300, y: SOL });
    const buisson = R.el('g', {}, sc.monde);
    for (const [cx, cy, r] of [[420, 840, 70], [480, 800, 70]]) R.el('circle', { cx, cy, r, fill: '#4f7a38' }, buisson);
    const bucherons = G.foule(sc, [[C.colosse, H.forgeron, -300, 1], [C.trapu, H.villageois, -450, 1]]);
    bucherons.forEach((p) => p.tenir(D.houe(), 'A'));
    sc.cam.x = 800; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.pose(tl, maratre, { lean: 15 }, 1, 0.5);
    R.expr(tl, maratre, 'surprise', 2);
    fruits(tl, sc.monde, 1000, 2.5, 4);
    R.expr(tl, landolo, 'joie', 3);
    tl.set(landolo.p, { dir: -1 }, 6);
    R.marche(tl, landolo, -200, 6.2, 5, { pas: 10 });
    R.expr(tl, maratre, 'colere', 6);
    // Elle exige des fruits : l'arbre lui envoie… des branches sèches
    R.marche(tl, maratre, 1050, 9, 3);
    G.prier(tl, maratre, 12.3, 3);
    R.parle(tl, maratre, 12.5, 2.5);
    const branche = R.el('path', { d: 'M0,0 l60,-10 l20,-30 M30,-5 l10,25', stroke: '#5a4030', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }, sc.monde);
    tl.set(branche, { x: 1100, y: 420, opacity: 1 }, 15.5);
    tl.to(branche, { y: 700, rotation: 120, duration: 0.6, ease: 'power2.in' }, 15.5);
    R.expr(tl, maratre, 'douleur', 16.1, 0.05);
    R.pose(tl, maratre, { bA: 150, cA: 130, bR: 150, cR: 130 }, 16.1, 0.2);
    tl.to(branche, { opacity: 0, duration: 0.3 }, 16.3);
    R.cam(tl, sc, { x: 1100, y: 640, z: 1.35 }, 15, 2);
    R.expr(tl, maratre, 'colere', 17);
    tl.set(maratre.p, { dir: -1 }, 18);
    R.pose(tl, maratre, { bA: 8, cA: 12, bR: -8, cR: 12 }, 18, 0.4);
    // Elle revient avec deux bûcherons
    R.cam(tl, sc, { x: 900, y: 620, z: 1 }, 19, 3);
    bucherons.forEach((p, i) => R.marche(tl, p, 900 - i * 150, 20 + i * 0.3, 6));
    R.marche(tl, maratre, 650, 20, 3);
    tl.set(maratre.p, { dir: 1 }, 23.2);
    G.pointer(tl, maratre, 26, 4, 0.5);
    R.parle(tl, maratre, 26, 3);
    G.exprFoule(tl, bucherons, 'neutre', 27);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 6 · L'arbre se défend
  R.scene('L\'arbre se défend', 40, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'orage' });
    const a = grandArbre(sc);
    const bucherons = G.foule(sc, [[C.colosse, H.forgeron, 1120, 1], [C.trapu, H.villageois, 1400, -1]]);
    bucherons.forEach((p) => p.tenir(D.houe(), 'A'));
    const maratre = sc.perso(C.ronde, COSTUMES.maratre, { x: 700, y: SOL });
    const landolo = sc.perso(C.enfant, COSTUMES.landolo, { x: -200, y: SOL, s: 1.15 });
    const feuilles = D.particules(sc.monde, 40, ARBRE_X, 500, '#5a8a3a', 7);
    sc.cam.x = 1100; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    // Les coups de hache rebondissent
    bucherons.forEach((p, k) => {
      for (let i = 0; i < 4; i++) {
        const t = 1.5 + k * 0.3 + i * 1.2;
        R.pose(tl, p, { bA: 160, cA: 20, lean: -5 }, t, 0.5);
        R.pose(tl, p, { bA: 90, cA: 0, lean: 15 }, t + 0.5, 0.15, 'power3.in');
        tl.to(p.p, { x: `${k ? '+' : '-'}=25`, duration: 0.15, yoyo: true, repeat: 1 }, t + 0.65);
      }
    });
    R.secousse(tl, sc, 6.5, 6, 0.5);
    G.exprFoule(tl, bucherons, 'surprise', 7);
    // L'arbre gronde : vent, feuilles, branches qui fouettent
    tl.to(a.halo, { opacity: 0.4, fill: '#ff9a3c', duration: 1 }, 8.5);
    balancer(tl, a, 8.5, 10, 9);
    [9, 10, 11, 12, 13].forEach((t, i) => R.jaillir(tl, feuilles, t, i, { n: 8, ecart: 60, haut: -200, duree: 1.4 }));
    R.secousse(tl, sc, 9, 12, 4);
    G.peurFoule(tl, bucherons.concat([maratre]), 9.5);
    bucherons.forEach((p, i) => { tl.set(p.p, { dir: i ? 1 : -1 }, 12 + i * 0.2); R.marche(tl, p, i ? 2500 : -400, 12.2 + i * 0.2, 4, { pas: 12, amp: 1.3 }); });
    R.cam(tl, sc, { x: 1000, y: 560, z: 0.9 }, 11, 3);
    // Landolo supplie l'arbre de s'apaiser
    R.marche(tl, landolo, 1000, 15, 3, { pas: 8, amp: 1.2 });
    G.agenouiller(tl, landolo, 18.3);
    G.prier(tl, landolo, 19, 6);
    R.parle(tl, landolo, 19.5, 4);
    tl.to(a.halo, { opacity: 0.4, fill: '#fff1a8', duration: 2 }, 22);
    tl.to(a.halo, { opacity: 0, duration: 3 }, 26);
    R.expr(tl, maratre, 'triste', 23);
    G.agenouiller(tl, maratre, 25);
    R.cam(tl, sc, { x: 900, y: 660, z: 1.3 }, 22, 6);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 7 · La sécheresse
  R.scene('La sécheresse', 40, (sc, tl) => {
    const ga = R.plan(sc, tl, 0, 14);
    const vc = DECORS.village(ga.sous, { ciel: 'chaud', soleil: [1500, 170, 90] });
    const gens = G.foule(sc, [[C.ancien, null, 700, 1], [C.vieille, null, 850, -1], [C.enfant, COSTUMES.fils, 1000, -1]], SOL, ga);
    const vide = D.canari(ga, 780, SOL + 4, 0.8);
    tl.set(sc.cam, { x: 850, y: 640, z: 1.25 }, 0);
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_secheresse');
    G.exprFoule(tl, gens, 'triste', 1);
    G.prier(tl, gens[0], 3, 5);
    G.pleurer(tl, gens[2], 5, 5);
    R.fonduSortie(tl, 13.4, 0.6);
    const gb = R.plan(sc, tl, 14);
    DECORS.brousse(gb.sous, { ciel: 'chaud', mare: ARBRE_X - 150, mareL: 260 });
    const a = grandArbre(sc, gb);
    const landolo = sc.perso(C.enfant, COSTUMES.landolo, { x: 1000, y: SOL, s: 1.2, dir: -1 }, gb);
    const village = G.foule(sc, [[C.ancien, null, -200, 1], [C.vieille, null, -340, 1], [C.ronde, COSTUMES.maratre, -480, 1], [C.enfant, COSTUMES.fils, -600, 1], [C.trapu, H.villageois, -740, 1]], SOL, gb);
    tl.set(sc.cam, { x: 900, y: 600, z: 1 }, 14);
    R.fonduEntree(tl, 14, 0.8);
    G.saluer(tl, landolo, 15, 2.5);
    village.forEach((p, i) => R.marche(tl, p, 800 - i * 110, 15 + i * 0.3, 6));
    fruits(tl, gb, 800, 21.5, 6);
    G.exprFoule(tl, village, 'joie', 22.5);
    // La marâtre demande pardon
    R.marche(tl, village[2], 900, 25, 1.5, { pas: 3 });
    G.agenouiller(tl, village[2], 26.6);
    R.parle(tl, village[2], 27, 3);
    R.expr(tl, village[2], 'triste', 27);
    R.cam(tl, sc, { x: 950, y: 680, z: 1.45 }, 26, 3);
    R.expr(tl, landolo, 'serein', 30);
    R.pose(tl, landolo, { bA: 80, cA: 0 }, 31, 0.5);
    G.relever(tl, village[2], 32);
    R.pose(tl, village[2], { bA: 70, cA: 80 }, 33, 0.5);
    R.expr(tl, village[2], 'joie', 33.5);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 8 · Landolo adulte
  R.scene('Plus tard', 28, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir' });
    const a = grandArbre(sc);
    const landolo = sc.perso(C.filiforme, COSTUMES.landoloAdulte, { x: 1050, y: SOL });
    const enfants = G.foule(sc, [[C.enfant, null, 1250, -1, 1, { assis: 1 }], [C.fille, null, 1380, -1, 1, { assis: 1 }]]);
    sc.cam.x = 1150; sc.cam.y = 620; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_plus_tard');
    G.dialogue(tl, 2, [[landolo, 4]]);
    G.pointer(tl, landolo, 3, 3, 0.8);
    balancer(tl, a, 3, 8, 3);
    G.exprFoule(tl, enfants, 'joie', 5);
    R.cam(tl, sc, { y: 480, z: 0.85 }, 7, 6);
    R.fonduSortie(tl, 13.5, 1.5);
    R.titre(tl, 15, 4, 'fin');
    R.generique(tl, 19.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
