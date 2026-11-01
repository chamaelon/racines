/*
 * 28 · Silamaka et Poullori — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;

  const COSTUMES = {
    silamaka: { haut: { type: 'boubou', couleur: '#f4f0e6', motif: 'bandes', motifCouleur: '#24305a', long: 1.3 }, manches: '#f4f0e6', tete: { type: 'turban', couleur: '#24305a' }, collier: '#e9c46a' },
    poullori: { haut: { type: 'tunique', couleur: '#8a5a32', motif: 'chevrons', motifCouleur: '#e8dcc0' }, bas: { type: 'short', couleur: '#e8dcc0' }, tete: { type: 'chapeau', couleur: '#d9b26a' } },
    envoye: { haut: { type: 'boubou', couleur: '#5a1f2a', motif: 'chevrons', motifCouleur: '#e9c46a', long: 1.5 }, manches: '#5a1f2a', tete: { type: 'calotte', couleur: '#e9c46a', motifCouleur: '#5a1f2a' } },
    enfantS: { haut: { type: 'tunique', couleur: '#f4f0e6' }, bas: { type: 'short', couleur: '#24305a' } },
    enfantP: { haut: { type: 'tunique', couleur: '#8a5a32' }, bas: { type: 'short', couleur: '#e8dcc0' } },
  };
  const silamaka = (sc, x, dir, parent) => { const ch = sc.bete(B.chevalBlanc, { x, y: SOL, dir: dir || 1 }, parent); const s = sc.perso(C.guerrier, COSTUMES.silamaka, {}, parent); ch.monter(s); s.tenir(D.lance(230), 'A', { vertical: true }); ch.cav = s; return ch; };
  const poullori = (sc, x, dir, parent) => { const ch = sc.bete(B.cheval, { x, y: SOL, dir: dir || 1 }, parent); const p = sc.perso(C.colosse, COSTUMES.poullori, {}, parent); ch.monter(p); p.tenir(D.sabre(), 'A'); ch.cav = p; return ch; };
  /** Serpent protecteur : apparaît dans une lueur dorée. */
  const serpentGardien = (sc, x, pose, parent) => sc.bete(Object.assign({}, B.serpent, { couleur: '#c9a22a', motifCouleur: '#5a3a10' }), Object.assign({ x, y: SOL - 4 }, pose), parent);

  // =================================================================== 1 · Les deux amis
  R.scene('Les deux amis', 28, (sc, tl) => {
    DECORS.sahel(sc, { ciel: 'soir', soleil: [1500, 640, 70], campement: false });
    const s = silamaka(sc, -300); const p = poullori(sc, -600);
    sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    R.marche(tl, s, 1000, 2, 10, { pas: 16 });
    R.marche(tl, p, 760, 2.3, 10, { pas: 16 });
    R.cartouche(tl, 9, 4.5, 'perso_silamaka');
    R.cartouche(tl, 14, 4.5, 'perso_poullori', 'droite');
    G.exprFoule(tl, [s.cav, p.cav], 'joie', 12);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.2 }, 12, 10);
    R.fonduSortie(tl, 26.5, 1.5);
  });

  // =================================================================== 2 · Le serpent
  R.scene('Le serpent', 38, (sc, tl) => {
    DECORS.brousse(sc, {});
    const s = sc.perso(C.enfant, COSTUMES.enfantS, { x: 760, y: SOL });
    const p = sc.perso(C.enfant, COSTUMES.enfantP, { x: 560, y: SOL, s: 1.1 });
    const serp = serpentGardien(sc, 1500, { dir: -1, s: 1 });
    const lueur = D.lumiere(sc.monde, 900, 840, 18, '#ffd166'); lueur.setAttribute('opacity', 0);
    sc.cam.x = 900; sc.cam.y = 680; sc.cam.z = 1.3;
    R.fonduEntree(tl, 0, 1);
    tl.to([s.p, p.p], { x: '+=150', duration: 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 1);
    G.exprFoule(tl, [s, p], 'rire', 1);
    tl.to(serp.p, { marcheAmp: 1, duration: 0.3 }, 5);
    tl.to(serp.p, { x: 1000, marche: '+=6', duration: 4, ease: 'none' }, 5);
    tl.to(serp.p, { dresse: 1, marcheAmp: 0, duration: 0.6 }, 9);
    R.expr(tl, p, 'peur', 9.3);
    tl.to(p.p, { x: 450, duration: 0.6 }, 9.5);
    R.expr(tl, s, 'surprise', 9.5);
    R.cam(tl, sc, { x: 900, y: 760, z: 1.8 }, 9, 2);
    // Silamaka tend la main : le serpent s'incline
    R.pose(tl, s, { bA: 90, cA: 0 }, 12, 0.6);
    tl.to(serp.p, { tete: 30, dresse: 0.5, duration: 1 }, 13.5);
    tl.to(lueur, { opacity: 0.9, scale: 3, transformOrigin: '50% 50%', duration: 1.5, yoyo: true, repeat: 1 }, 14);
    R.cartouche(tl, 15, 5, 'perso_serpent', 'droite');
    R.expr(tl, s, 'joie', 16);
    tl.to(serp.p, { dresse: 0, tete: 0, duration: 0.6 }, 19);
    tl.set(serp.p, { dir: 1 }, 20);
    tl.to(serp.p, { marcheAmp: 1, duration: 0.3 }, 20);
    tl.to(serp.p, { x: 2300, marche: '+=8', duration: 5, ease: 'none' }, 20);
    R.expr(tl, p, 'surprise', 21);
    R.marche(tl, p, 680, 22, 1.5, { pas: 3 });
    R.pose(tl, p, { bA: 70, cA: 70 }, 24, 0.4); R.pose(tl, s, { bA: 70, cA: 70 }, 24, 0.4);
    G.exprFoule(tl, [s, p], 'rire', 25);
    R.cam(tl, sc, { x: 760, y: 680, z: 1.4 }, 22, 4);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 3 · Le tribut
  R.scene('Le tribut', 34, (sc, tl) => {
    DECORS.sahel(sc, {});
    const gens = G.foule(sc, [[C.ronde, H.villageoise, 560, 1], [C.vieille, null, 430, 1], [C.trapu, H.peul, 700, 1]]);
    const zebus = [[300, 1], [180, -1]].map(([x, dir]) => sc.bete(B.zebu, { x, y: SOL, dir, s: 0.85 }));
    const envoyes = [[C.roi, COSTUMES.envoye, 2200], [C.trapu, H.cavalier, 2350]].map(([d, c, x]) => sc.perso(d, c, { x, y: SOL, dir: -1 }));
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_tribut');
    envoyes.forEach((p, i) => R.marche(tl, p, 980 + i * 150, 2 + i * 0.3, 7));
    R.cartouche(tl, 7, 4.5, 'perso_envoye', 'droite');
    G.exprFoule(tl, gens, 'peur', 7);
    G.dialogue(tl, 9.5, [[envoyes[0], 4]]);
    G.pointer(tl, envoyes[0], 10, 3, -0.2);
    G.pleurer(tl, gens[0], 15, 6);
    R.cam(tl, sc, { x: 760, y: 680, z: 1.35 }, 14, 4);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 4 · Le refus
  R.scene('Le refus', 34, (sc, tl) => {
    DECORS.sahel(sc, {});
    const envoyes = [[C.roi, COSTUMES.envoye, 980], [C.trapu, H.cavalier, 1130]].map(([d, c, x]) => sc.perso(d, c, { x, y: SOL, dir: -1 }));
    const s = silamaka(sc, -300); const p = poullori(sc, -550);
    sc.cam.x = 760; sc.cam.y = 600; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, s, 700, 1, 5, { pas: 10, amp: 1.3 });
    R.marche(tl, p, 450, 1.3, 5, { pas: 10, amp: 1.3 });
    R.cartouche(tl, 3, 4.5, 'lieu_refus');
    tl.to(s.p, { cabre: 1, duration: 0.4, yoyo: true, repeat: 1 }, 6.3);
    R.expr(tl, s.cav, 'colere', 6.5);
    R.parle(tl, s.cav, 7.5, 3.5);
    G.pointer(tl, s.cav, 8, 3);
    G.exprFoule(tl, envoyes, 'peur', 9);
    R.cam(tl, sc, { x: 850, y: 640, z: 1.2 }, 7, 3);
    envoyes.forEach((e, i) => { tl.set(e.p, { dir: 1 }, 12 + i * 0.2); R.marche(tl, e, 2400, 12.2 + i * 0.2, 5, { pas: 12, amp: 1.3 }); });
    R.expr(tl, p.cav, 'rire', 13);
    R.cam(tl, sc, { x: 700, y: 620, z: 1.05 }, 15, 4);
    G.dialogue(tl, 19, [[p.cav, 2], [s.cav, 2.5]]);
    R.pose(tl, s.cav, { bA: 85, cA: 0 }, 25, 0.4); R.pose(tl, p.cav, { bA: 85, cA: 0 }, 25.2, 0.4);
    G.exprFoule(tl, [s.cav, p.cav], 'serein', 26);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 5 · Le combat
  R.scene('Le combat', 24, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'orage' });
    const s = silamaka(sc, -300); const p = poullori(sc, -550);
    const armee = G.cavaliers(sc, [[2300, -1], [2500, -1], [2700, -1], [2900, -1]], { habit: COSTUMES.envoye, arme: 'lance' });
    const poussiere = D.particules(sc.monde, 40, 1000, 860, '#c9a678', 27);
    sc.cam.x = 1000; sc.cam.y = 600; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_combat');
    G.chevaucher(tl, armee, 1400, 1.5, 5, { pas: 14 });
    R.marche(tl, s, 700, 1.5, 4, { pas: 12, amp: 1.5 });
    R.marche(tl, p, 480, 1.8, 4, { pas: 12, amp: 1.5 });
    R.secousse(tl, sc, 3, 4, 3);
    // La charge des deux amis
    R.pose(tl, s.cav, { bA: 120, cA: 0 }, 6.5, 0.3); R.pose(tl, p.cav, { bA: 160, cA: 10 }, 6.5, 0.3);
    R.marche(tl, s, 1300, 7, 2.5, { pas: 8, amp: 1.6 });
    R.marche(tl, p, 1150, 7.2, 2.5, { pas: 8, amp: 1.6 });
    [7.5, 8.3, 9.1, 9.9].forEach((t, i) => R.jaillir(tl, poussiere, t, i, { n: 8, ecart: 60, haut: 90, duree: 1.2 }));
    R.cam(tl, sc, { x: 1300, y: 620, z: 1.05 }, 7, 3);
    R.secousse(tl, sc, 9.5, 14, 1);
    G.frapper(tl, s.cav, armee[0].cav, 10);
    G.frapper(tl, p.cav, armee[1].cav, 10.6);
    [armee[0], armee[1]].forEach((ch, i) => { tl.to(ch.p, { cabre: 1, duration: 0.3, yoyo: true, repeat: 1 }, 10.5 + i * 0.5); G.exprFoule(tl, [ch.cav], 'peur', 10.5 + i * 0.5); });
    R.cam(tl, sc, { x: 1250, y: 620, z: 1 }, 13, 3);
    tl.set([s.p, p.p], { dir: -1 }, 15); R.pose(tl, s.cav, { bA: 8, cA: 12 }, 15, 0.3);
    R.marche(tl, s, 1000, 15.2, 2, { pas: 6, amp: 1.3 });
    R.marche(tl, p, 850, 15.4, 2, { pas: 6, amp: 1.3 });
    tl.set([s.p, p.p], { dir: 1 }, 18);
    R.fonduSortie(tl, 22.5, 1.5);
  });

  // =================================================================== 6 · Le serpent protecteur
  R.scene('Le serpent protecteur', 36, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'orage' });
    const s = silamaka(sc, 900); const p = poullori(sc, 700);
    const armee = G.cavaliers(sc, [[1400, -1], [1600, -1], [1800, -1]], { habit: COSTUMES.envoye, arme: 'lance' });
    const serp = serpentGardien(sc, 1150, { dir: 1, s: 1.6, alpha: 0 });
    const lueur = D.lumiere(sc.monde, 1150, 760, 30, '#ffd166'); lueur.setAttribute('opacity', 0);
    sc.cam.x = 1150; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    armee.forEach((ch) => R.pose(tl, ch.cav, { bA: 120, cA: 0 }, 1.5, 0.4));
    R.marche(tl, armee[0], 1250, 2, 1.5, { pas: 4, amp: 1.4 });
    // Le serpent surgit entre eux
    R.eclairBlanc(tl, 3.5, 0.5);
    tl.to(lueur, { opacity: 1, scale: 4, transformOrigin: '50% 50%', duration: 1 }, 3.5);
    tl.to(lueur, { opacity: 0, duration: 1.5 }, 4.6);
    tl.to(serp.p, { alpha: 1, dresse: 1, duration: 0.6 }, 3.6);
    R.secousse(tl, sc, 3.6, 12, 1);
    tl.to(serp.p, { gueule: 1, tete: -10, duration: 0.3, yoyo: true, repeat: 5 }, 4.5);
    armee.forEach((ch, i) => { tl.to(ch.p, { cabre: 1, duration: 0.3, yoyo: true, repeat: 3 }, 5 + i * 0.2); G.exprFoule(tl, [ch.cav], 'peur', 5); });
    R.cam(tl, sc, { x: 1250, y: 680, z: 1.3 }, 4, 2);
    armee.forEach((ch, i) => { tl.set(ch.p, { dir: 1 }, 8 + i * 0.2); R.marche(tl, ch, 3000 + i * 150, 8.2 + i * 0.2, 5, { pas: 14, amp: 1.5 }); });
    R.cam(tl, sc, { x: 1150, y: 620, z: 1 }, 9, 3);
    G.exprFoule(tl, [s.cav, p.cav], 'joie', 12);
    R.pose(tl, s.cav, { bA: 165, cA: 10 }, 13, 0.4); R.pose(tl, p.cav, { bA: 165, cA: 10 }, 13.2, 0.4);
    tl.to(serp.p, { dresse: 0.3, tete: 25, duration: 1 }, 16);
    G.incliner(tl, s.cav, 17, 2, 25);
    tl.to(serp.p, { alpha: 0, duration: 2 }, 22);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 7 · La fidélité
  R.scene('La fidélité', 32, (sc, tl) => {
    DECORS.sahel(sc, { ciel: 'soir', soleil: [1600, 640, 80], campement: false });
    const s = silamaka(sc, 700); const p = poullori(sc, 500);
    sc.cam.x = 900; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 7, 'lieu_fidelite');
    G.dialogue(tl, 2, [[s.cav, 2.5], [p.cav, 2.5]]);
    G.exprFoule(tl, [s.cav, p.cav], 'serein', 7);
    R.marche(tl, s, 2400, 9, 14, { pas: 18 });
    R.marche(tl, p, 2200, 9.3, 14, { pas: 18 });
    const lueur = D.lumiere(sc.monde, 1600, 640, 60, '#fff1a8'); lueur.setAttribute('opacity', 0);
    tl.to(lueur, { opacity: 0.8, scale: 2, transformOrigin: '50% 50%', duration: 6 }, 14);
    R.cam(tl, sc, { x: 1500, y: 560, z: 0.9 }, 9, 14);
    R.fonduSortie(tl, 29, 3);
  });

  // =================================================================== 8 · Le griot
  R.scene('Le griot', 30, (sc, tl) => {
    DECORS.sahel(sc, { ciel: 'nuit', nuit: true });
    const feu = D.feu(sc.monde, 960, SOL + 2, 1); G.flamber(tl, feu, 0, 30);
    const griot = sc.perso(C.ancien, H.marabout, { x: 760, y: SOL, assis: 1 });
    D.tambour(sc.monde, 830, SOL + 2, 0.8);
    const auditeurs = G.foule(sc, [[C.enfant, null, 1150, -1, 1, { assis: 1 }], [C.fille, null, 1270, -1, 1, { assis: 1 }], [C.trapu, H.peul, 1400, -1, 1, { assis: 1 }]]);
    sc.cam.x = 960; sc.cam.y = 680; sc.cam.z = 1.3;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_chant');
    R.parle(tl, griot, 1.5, 12);
    for (let i = 0; i < 30; i++) tl.to(griot.p, { bA: i % 2 ? 60 : 90, cA: 40, duration: 0.2 }, 1.5 + i * 0.4);
    G.notes(tl, sc.monde, 820, 740, 2, 12);
    G.exprFoule(tl, auditeurs, 'joie', 4);
    R.cam(tl, sc, { y: 560, z: 0.95 }, 9, 5);
    R.fonduSortie(tl, 15.5, 1.5);
    R.titre(tl, 17, 4, 'fin');
    R.generique(tl, 21.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
