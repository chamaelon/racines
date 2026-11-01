/*
 * 16 · Famagan Ouattara et le Gwiriko — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;

  const COSTUMES = {
    famagan: { haut: { type: 'boubou', couleur: '#8a1f2a', motif: 'chevrons', motifCouleur: '#e9c46a', long: 1.3 }, manches: '#8a1f2a', tete: { type: 'turban', couleur: '#f4f0e6' }, collier: '#e9c46a' },
    rival: { haut: { type: 'boubou', couleur: '#3a3a2a', motif: 'bandes', motifCouleur: '#a08a5a', long: 1.6 }, manches: '#3a3a2a', tete: { type: 'bonnet', couleur: '#5a2a1a' } },
  };
  /** Famagan sur son étalon blanc. */
  function famagan(sc, x, dir, parent) {
    const ch = sc.bete(B.chevalBlanc, { x, y: SOL, dir: dir || 1 }, parent);
    const f = sc.perso(C.guerrier, COSTUMES.famagan, {}, parent);
    ch.monter(f);
    f.tenir(D.sabre(), 'A');
    ch.cav = f;
    return ch;
  }

  // =================================================================== 1 · Kong
  R.scene('Kong', 26, (sc, tl) => {
    DECORS.ville(sc, { soleil: [300, 180, 60], mosqueeS: 1 });
    const passants = G.foule(sc, [[C.ancien, H.marabout, -200, 1], [C.trapu, H.villageois, 2200, -1], [C.ronde, H.villageoise, -380, 1]]);
    sc.cam.y = 520; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 280);
    passants.forEach((p, i) => R.marche(tl, p, i === 1 ? -300 : 2300, 1 + i, 18, { pas: 24 }));
    R.cartouche(tl, 8, 5, 'lieu_kong');
    R.cam(tl, sc, { x: 1250, y: 480, z: 1.05 }, 8, 14);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Le chef de guerre
  R.scene('Le chef de guerre', 34, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'chaud' });
    const f = famagan(sc, 300);
    const cav = G.cavaliers(sc, [[-200, 1], [-420, 1], [-640, 1]]);
    sc.cam.x = 760; sc.cam.y = 580; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, f, 900, 1, 4, { pas: 10, amp: 1.3 });
    R.cartouche(tl, 2, 5, 'perso_famagan');
    tl.to(f.p, { cabre: 1, duration: 0.4, yoyo: true, repeat: 1 }, 5.2);
    R.pose(tl, f.cav, { bA: 160, cA: 10 }, 5.2, 0.3);
    R.expr(tl, f.cav, 'joie', 5.5);
    G.chevaucher(tl, cav, 1600, 6, 4);
    R.cam(tl, sc, { x: 1100, z: 0.9 }, 6, 4);
    // Exercices : charge, demi-tour, salut du sabre
    cav.forEach((ch, i) => { tl.set(ch.p, { dir: -1 }, 11 + i * 0.2); R.marche(tl, ch, 600 - i * 170, 11.2 + i * 0.2, 4, { pas: 11, amp: 1.4 }); });
    tl.set(f.p, { dir: -1 }, 12);
    R.pose(tl, f.cav, { bA: 8, cA: 12 }, 12, 0.3);
    G.exprFoule(tl, cav.map((c) => c.cav), 'colere', 11);
    cav.forEach((ch) => R.pose(tl, ch.cav, { bA: 120, cA: 0 }, 15.5, 0.3));
    R.cam(tl, sc, { x: 760, y: 620, z: 1.15 }, 15, 3);
    G.dialogue(tl, 19, [[f.cav, 3]]);
    G.pointer(tl, f.cav, 22.5, 4, 0.2);
    cav.forEach((ch) => R.pose(tl, ch.cav, { bA: 8, cA: 12 }, 20, 0.3));
    G.exprFoule(tl, cav.map((c) => c.cav), 'joie', 23);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 3 · Le départ
  R.scene('Le départ', 30, (sc, tl) => {
    DECORS.sahel(sc, { campement: false, ciel: 'soir', soleil: [1600, 640, 70] });
    const f = famagan(sc, -200);
    const cav = G.cavaliers(sc, [[-420, 1, 0.95], [-640, 1, 0.95], [-860, 1, 0.95], [-1080, 1, 0.95]]);
    const pieton = G.foule(sc, [[C.trapu, H.villageois, -1300, 1], [C.filiforme, H.villageois, -1450, 1]]);
    pieton.forEach((p) => G.surLaTete(p, D.sac()));
    sc.cam.x = 900; sc.cam.y = 580; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_depart');
    R.marche(tl, f, 2400, 1, 22, { pas: 30 });
    G.chevaucher(tl, cav, 2200, 1.4, 22, { pas: 30, amp: 1 });
    pieton.forEach((p, i) => R.marche(tl, p, 1300 + i * -120, 3 + i * 0.4, 22, { pas: 30 }));
    R.cam(tl, sc, { x: 1300 }, 4, 20);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 4 · L'alliance
  R.scene('L\'alliance', 38, (sc, tl) => {
    DECORS.village(sc, {});
    const chef = sc.perso(C.ancien, null, { x: 760, y: SOL });
    chef.tenir(D.baton(200), 'R', { vertical: true });
    const anciens = G.foule(sc, [[C.colosse, H.forgeron, 600, 1], [C.vieille, null, 460, 1]]);
    const f = famagan(sc, 2300, -1);
    const cav = G.cavaliers(sc, [[2550, -1], [2750, -1]]);
    const pied = sc.perso(C.guerrier, COSTUMES.famagan, { x: 1250, y: SOL, dir: -1, alpha: 0 });
    const cadeau = R.objet(D.sabre(), false); pied.tenir(cadeau, 'A');
    sc.cam.x = 1000; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_bobo');
    R.marche(tl, f, 1450, 1, 6, { pas: 9 });
    G.chevaucher(tl, cav, 1700, 1.3, 6, { pas: 9, amp: 1 });
    G.exprFoule(tl, [chef].concat(anciens), 'surprise', 4);
    R.cartouche(tl, 6, 4.5, 'perso_chef');
    // Famagan descend de cheval
    tl.to(f.cav.p, { alpha: 0, duration: 0.3 }, 8);
    tl.to(pied.p, { alpha: 1, duration: 0.3 }, 8);
    R.marche(tl, pied, 1000, 8.5, 2.5);
    G.incliner(tl, pied, 11.2, 2, 30);
    R.expr(tl, chef, 'serein', 12);
    G.dialogue(tl, 13.5, [[pied, 3], [chef, 3], [pied, 2]]);
    R.cam(tl, sc, { x: 880, y: 650, z: 1.35 }, 13, 3);
    // Échange de cadeaux : le sabre contre la bénédiction de la terre
    R.montrer(tl, cadeau, 22.5, 0.3);
    R.pose(tl, pied, { bA: 80, cA: 0 }, 22.5, 0.5);
    R.pose(tl, chef, { bA: 80, cA: 0 }, 23.2, 0.5);
    R.cacher(tl, cadeau, 24, 0.2);
    R.pose(tl, pied, { bA: 8, cA: 12 }, 24.2, 0.4);
    G.prier(tl, chef, 25, 4);
    G.agenouiller(tl, pied, 25.3);
    G.relever(tl, pied, 29.6);
    G.exprFoule(tl, [chef].concat(anciens, [pied]), 'joie', 30);
    R.pose(tl, pied, { bA: 85, cA: 0 }, 31, 0.4); R.pose(tl, chef, { bA: 85, cA: 0, bR: -8 }, 31.2, 0.4);
    tl.to([pied.p, chef.p], { cA: 12, duration: 0.2, yoyo: true, repeat: 5 }, 31.6);
    R.cam(tl, sc, { x: 960, y: 600, z: 1 }, 33, 3);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 5 · La guerre
  R.scene('La guerre', 44, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'orage' });
    const rival = sc.perso(C.roi, COSTUMES.rival, { x: 1500, y: SOL, dir: -1 });
    const archers = G.foule(sc, [[C.trapu, H.villageois, 1650, -1], [C.filiforme, H.villageois, 1780, -1], [C.colosse, H.guerrier, 1350, -1], [C.trapu, { haut: { type: 'tunique', couleur: '#8a5a32' }, tete: null }, 1900, -1]]);
    archers.forEach((p, i) => p.tenir(i === 2 ? D.lance(220) : D.arc(), i === 2 ? 'A' : 'R', { vertical: true }));
    const f = famagan(sc, -200);
    const cav = G.cavaliers(sc, [[-420, 1], [-640, 1], [-860, 1]]);
    const poussiere = D.particules(sc.monde, 40, 900, 860, '#c9a678', 13);
    sc.cam.x = 1100; sc.cam.y = 600; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_combat');
    G.exprFoule(tl, archers.concat([rival]), 'colere', 1.5);
    G.pointer(tl, rival, 2, 3);
    R.marche(tl, f, 500, 3, 3, { pas: 8, amp: 1.4 });
    G.chevaucher(tl, cav, 300, 3.3, 3, { pas: 8 });
    R.cam(tl, sc, { x: 900 }, 3, 3);
    [[0, 6.5], [1, 7.2], [3, 7.9]].forEach(([i, t], k) => G.tirer(tl, archers[i], sc.monde, t, 520 - k * 150, 680, 0.6));
    tl.to(f.p, { cabre: 1, duration: 0.3, yoyo: true, repeat: 1 }, 8);
    R.pose(tl, f.cav, { bA: 160, cA: 10 }, 8.5, 0.3);
    // La charge
    R.marche(tl, f, 1350, 10, 3, { pas: 9, amp: 1.5 });
    G.chevaucher(tl, cav, 1150, 10.3, 3, { pas: 9 });
    [10.5, 11.3, 12.1, 12.9].forEach((t, i) => R.jaillir(tl, poussiere, t, i, { n: 8, ecart: 50, haut: 80, duree: 1.2 }));
    R.cam(tl, sc, { x: 1300, y: 620, z: 1.05 }, 10, 3);
    R.secousse(tl, sc, 13, 10, 0.8);
    G.peurFoule(tl, archers, 13);
    R.pose(tl, f.cav, { bA: 90, cA: 0 }, 13.2, 0.2);
    G.frapper(tl, cav[0].cav, archers[2], 13.5);
    G.tomber(tl, archers[2], 14.2, 1, 3);
    archers.filter((p, i) => i !== 2).forEach((p, i) => { tl.set(p.p, { dir: 1 }, 15 + i * 0.2); R.marche(tl, p, 2500, 15.2 + i * 0.2, 4, { pas: 10, amp: 1.2 }); });
    // Le rival se rend
    G.agenouiller(tl, rival, 18);
    R.expr(tl, rival, 'triste', 18);
    R.pose(tl, rival, { tete: -18 }, 18.5, 0.4);
    R.pose(tl, f.cav, { bA: 8, cA: 12 }, 19, 0.4);
    R.cam(tl, sc, { x: 1400, y: 650, z: 1.3 }, 19, 4);
    G.dialogue(tl, 23, [[f.cav, 3], [rival, 2]]);
    G.relever(tl, rival, 29);
    G.incliner(tl, rival, 30.5, 2, 30);
    R.expr(tl, f.cav, 'serein', 31);
    R.cam(tl, sc, { x: 1100, y: 600, z: 0.95 }, 34, 6);
    R.fonduSortie(tl, 42.5, 1.5);
  });

  // =================================================================== 6 · Le Gwiriko
  R.scene('Le Gwiriko', 36, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#8a1f2a' });
    const f = sc.perso(C.guerrier, COSTUMES.famagan, { x: 960, y: 900, assis: 1 });
    f.tenir(D.sceptre('#e9c46a'), 'R', { vertical: true });
    const foule = G.foule(sc, [[C.ancien, null, 640, 1], [C.roi, COSTUMES.rival, 500, 1], [C.ancien, H.marabout, 1290, -1], [C.trapu, H.villageois, 1420, -1], [C.ronde, H.villageoise, 360, 1], [C.enfant, null, 1560, -1]], 900);
    const batteurs = G.foule(sc, [[C.colosse, H.forgeron, 200, 1]], 900);
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'lieu_gwiriko');
    foule.forEach((p, i) => G.incliner(tl, p, 2 + i * 0.2, 2.5, 30));
    R.expr(tl, f, 'serein', 2);
    R.cam(tl, sc, { x: 960, y: 720, z: 1.6 }, 6, 3);
    R.parle(tl, f, 9, 4);
    R.pose(tl, f, { bA: 140, cA: 30 }, 9.5, 0.5);
    R.pose(tl, f, { bA: 8, cA: 12 }, 13, 0.5);
    R.cam(tl, sc, { x: 960, y: 600, z: 0.95 }, 14, 4);
    for (let i = 0; i < 50; i++) tl.to(batteurs[0].p, { bA: i % 2 ? 60 : 110, bR: i % 2 ? 110 : 60, cA: 40, cR: 40, duration: 0.18 }, 15 + i * 0.2);
    G.exprFoule(tl, foule, 'joie', 15);
    G.danseFoule(tl, foule, 16, 16, 900);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 7 · Le grand marché
  R.scene('Le grand marché', 32, (sc, tl) => {
    DECORS.ville(sc, { mosqueeX: 1500, mosqueeS: 0.8 });
    const etals = [[500, '#e9c46a'], [800, '#c8553d'], [1100, '#5b8c5a']].map(([x, c]) => { const g = R.el('g', {}, sc.monde); R.el('rect', { x: x - 70, y: 840, width: 140, height: 40, rx: 4, fill: '#8a5a32' }, g); D.tas(g, x, 842, c, 8); return g; });
    const marchands = G.foule(sc, [[C.ronde, H.villageoise, 430, 1], [C.vieille, null, 740, 1], [C.trapu, H.villageois, 1040, 1]]);
    const clients = G.foule(sc, [[C.elancee, H.villageoise, 2100, -1], [C.ancien, H.marabout, 2250, -1], [C.enfant, null, 2380, -1]]);
    const caravane = G.cavaliers(sc, [[-300, 1, 0.9]], { arme: null });
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_marche');
    clients.forEach((p, i) => R.marche(tl, p, 600 + i * 300, 1 + i * 0.4, 6));
    G.dialogue(tl, 7, [[marchands[0], 2], [clients[0], 2], [marchands[2], 2], [clients[1], 2]]);
    R.marche(tl, caravane[0], 1300, 10, 8, { pas: 12 });
    G.exprFoule(tl, marchands.concat(clients), 'joie', 16);
    R.saut(tl, clients[2], 17, 40);
    R.cam(tl, sc, { x: 1000, y: 580, z: 0.95 }, 18, 8);
    R.fonduSortie(tl, 30.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 26, (sc, tl) => {
    DECORS.ville(sc, { ciel: 'soir' });
    const gens = G.foule(sc, [[C.ancien, COSTUMES.famagan, 800, 1], [C.enfant, null, 980, -1], [C.fille, null, 1090, -1]]);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_aujourdhui');
    G.dialogue(tl, 1.5, [[gens[0], 4]]);
    G.pointer(tl, gens[0], 3, 3, 0.4);
    G.exprFoule(tl, gens.slice(1), 'serein', 4);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 7, 5);
    R.fonduSortie(tl, 11.5, 1.5);
    R.titre(tl, 13, 4, 'fin');
    R.generique(tl, 17.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
