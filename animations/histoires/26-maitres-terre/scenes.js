/*
 * 26 · Les maîtres de la terre — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, COUR = 900;

  const COSTUMES = {
    maitre: { haut: null, bas: { type: 'pagne', couleur: '#8a6a40', motif: 'points', motifCouleur: '#3a2a1a' }, ceinture: '#3a2a1a', collier: '#efe6cf', bracelets: '#efe6cf', tete: { type: 'bonnet', couleur: '#5a3a20' } },
    chef: Object.assign({}, H.cavalier, { haut: { type: 'boubou', couleur: '#e8e2d2', motif: 'chevrons', motifCouleur: '#24305a', long: 1.5 }, manches: '#e8e2d2', tete: { type: 'turban', couleur: '#24305a' } }),
    kurumba: { haut: { type: 'tunique', couleur: '#b98652', motif: 'bandes', motifCouleur: '#5a3a20' }, bas: { type: 'short', couleur: '#e8dcc0' }, tete: null },
  };
  const maitre = (sc, pose, parent) => { const p = sc.perso(C.ancien, COSTUMES.maitre, Object.assign({ y: SOL }, pose), parent); p.tenir(D.baton(200), 'R', { vertical: true }); return p; };
  const chefACheval = (sc, x, dir, parent) => { const ch = sc.bete(B.chevalBlanc, { x, y: SOL, dir }, parent); const c = sc.perso(C.roi, COSTUMES.chef, {}, parent); ch.monter(c); c.tenir(D.sabre(), 'A'); ch.cav = c; return ch; };
  const villageois = (sc, parent) => G.foule(sc, [[C.ronde, H.villageoise, 1250, -1], [C.trapu, COSTUMES.kurumba, 1380, -1], [C.enfant, null, 1500, -1]], SOL, parent);

  // =================================================================== 1 · Le Nord
  R.scene('Le Nord', 26, (sc, tl) => {
    DECORS.sahel(sc, { soleil: [1500, 200, 70] });
    sc.cam.y = 540; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 280);
    R.cartouche(tl, 8, 5, 'lieu_nord');
    R.cam(tl, sc, { x: 1200, y: 600, z: 1.1 }, 8, 14);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Le maître de la terre
  R.scene('Le maître de la terre', 36, (sc, tl) => {
    const champ = DECORS.champ(sc, {});
    champ.vert.tiges.forEach((t) => gsap.set(t, { scaleY: 0, svgOrigin: '0 0' }));
    gsap.set(champ.vert.g, { opacity: 1 }); gsap.set(champ.sec.g, { opacity: 0 });
    const autel = D.autel(sc.monde, 760, 900, 1);
    const m = maitre(sc, { x: 1000, y: 900, dir: -1 });
    const gens = villageois(sc);
    gens.forEach((p) => (p.p.y = 900));
    sc.cam.x = 960; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'perso_maitre');
    G.agenouiller(tl, m, 3);
    R.pose(tl, m, { bA: 80, cA: 0 }, 4, 0.5);
    G.prier(tl, m, 6, 6);
    R.parle(tl, m, 6.5, 5);
    R.cam(tl, sc, { x: 860, y: 760, z: 1.7 }, 5, 4);
    gens.forEach((p, i) => G.incliner(tl, p, 8 + i * 0.2, 3, 30));
    R.cam(tl, sc, { x: 960, y: 560, z: 0.95 }, 13, 4);
    tl.to(champ.vert.tiges, { scaleY: 1, duration: 1.2, ease: 'back.out(1.4)', stagger: 0.25 }, 14);
    G.relever(tl, m, 14);
    G.exprFoule(tl, gens.concat([m]), 'joie', 16);
    G.danseFoule(tl, gens, 20, 12, 900);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 3 · Les conquérants
  R.scene('Les conquérants', 36, (sc, tl) => {
    DECORS.sahel(sc, {});
    const m = maitre(sc, { x: 700 });
    const gens = villageois(sc);
    gens.forEach((p, i) => { p.p.x = 560 - i * 130; p.p.dir = 1; });
    const chef = chefACheval(sc, 2300, -1);
    const cav = G.cavaliers(sc, [[2550, -1], [2750, -1], [2950, -1]]);
    sc.cam.x = 1100; sc.cam.y = 600; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_conquerants', 'droite');
    R.marche(tl, chef, 1150, 2, 6, { pas: 12 });
    G.chevaucher(tl, cav, 1400, 2.3, 6, { pas: 12, amp: 1 });
    R.secousse(tl, sc, 3, 3, 4);
    G.peurFoule(tl, gens, 6);
    R.cartouche(tl, 9, 4.5, 'perso_chef', 'droite');
    tl.to(chef.p, { cabre: 1, duration: 0.4, yoyo: true, repeat: 1 }, 9);
    R.pose(tl, chef.cav, { bA: 160, cA: 10 }, 9, 0.3);
    G.dialogue(tl, 11, [[chef.cav, 3]]);
    G.pointer(tl, chef.cav, 11.5, 3);
    R.expr(tl, m, 'serein', 12);
    R.pose(tl, m, { tete: 10 }, 15, 0.5);
    R.cam(tl, sc, { x: 950, y: 650, z: 1.25 }, 14, 3);
    // Les conquérants s'installent
    R.cam(tl, sc, { x: 1100, y: 600, z: 0.95 }, 20, 3);
    gens.forEach((p, i) => G.incliner(tl, p, 21 + i * 0.2, 2, 30));
    R.expr(tl, chef.cav, 'joie', 23);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 4 · La terre refuse
  R.scene('La terre refuse', 36, (sc, tl) => {
    const champ = DECORS.champ(sc, {});
    champ.sec.tiges.forEach((t, i) => gsap.set(t, { scaleY: 0.3, rotation: 20 + (i % 3) * 10, svgOrigin: '0 0' }));
    const chef = sc.perso(C.roi, COSTUMES.chef, { x: 700, y: 900 });
    const cav = [sc.perso(C.guerrier, H.cavalier, { x: 900, y: 900 }), sc.perso(C.guerrier, H.cavalier, { x: 1100, y: 900 })];
    cav.forEach((p) => p.tenir(D.houe(), 'A'));
    sc.cam.x = 960; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_secheresse');
    cav.forEach((p) => G.piocher(tl, p, 1.5, 8, 0.9));
    tl.to(champ.soleil, { scale: 1.3, transformOrigin: '50% 50%', duration: 1.5, yoyo: true, repeat: 9 }, 0);
    R.expr(tl, chef, 'colere', 10);
    G.exprFoule(tl, cav, 'triste', 11);
    R.cam(tl, sc, { x: 900, y: 760, z: 1.8 }, 11, 3);
    tl.to(champ.sec.tiges, { scaleY: 0.1, duration: 4 }, 12);
    R.cam(tl, sc, { x: 800, y: 640, z: 1.3 }, 17, 3);
    G.prier(tl, chef, 18, 5);
    R.parle(tl, chef, 18.5, 3);
    R.expr(tl, chef, 'triste', 23);
    R.pose(tl, chef, { tete: -15 }, 23.5, 0.5);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 5 · La visite
  R.scene('La visite', 34, (sc, tl) => {
    DECORS.sahel(sc, { ciel: 'soir' });
    const feu = D.feu(sc.monde, 1100, SOL + 2, 0.8); G.flamber(tl, feu, 0, 34);
    const m = maitre(sc, { x: 1250, assis: 1, dir: -1 });
    const chef = sc.perso(C.roi, COSTUMES.chef, { x: -200, y: SOL });
    sc.cam.x = 960; sc.cam.y = 640; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, chef, 900, 1, 6);
    G.incliner(tl, chef, 7.3, 2, 35);
    G.dialogue(tl, 10, [[chef, 3], [m, 4], [chef, 2]]);
    R.cam(tl, sc, { x: 1080, y: 700, z: 1.45 }, 10, 4);
    G.pointer(tl, m, 13.5, 3, 0.4);
    R.expr(tl, chef, 'serein', 20);
    G.relever(tl, m, 21);
    R.pose(tl, m, { bA: 85, cA: 0 }, 23, 0.4);
    R.pose(tl, chef, { bA: 85, cA: 0 }, 23.2, 0.4);
    tl.to([m.p, chef.p], { cA: 12, duration: 0.2, yoyo: true, repeat: 5 }, 23.6);
    G.exprFoule(tl, [m, chef], 'joie', 24);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 6 · L'accord
  R.scene('L\'accord', 42, (sc, tl) => {
    const champ = DECORS.champ(sc, {});
    champ.vert.tiges.forEach((t) => gsap.set(t, { scaleY: 0, svgOrigin: '0 0' }));
    gsap.set(champ.vert.g, { opacity: 1 }); gsap.set(champ.sec.g, { opacity: 0 });
    D.autel(sc.monde, 900, 900, 1.1);
    const m = maitre(sc, { x: 760, y: 900 });
    const chef = sc.perso(C.roi, COSTUMES.chef, { x: 1060, y: 900, dir: -1 });
    const poule = sc.bete(B.poule, { x: 0, y: 0, s: 0.8 }); chef.tenir(poule.root, 'A', { vertical: true });
    const pluie = D.pluie(sc.monde, 180, 41);
    const gens = G.foule(sc, [[C.ronde, H.villageoise, 400, 1], [C.trapu, COSTUMES.kurumba, 280, 1], [C.guerrier, H.cavalier, 1400, -1], [C.guerrier, H.cavalier, 1520, -1]], 900);
    sc.cam.x = 900; sc.cam.y = 680; sc.cam.z = 1.3;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'lieu_accord');
    G.agenouiller(tl, chef, 2);
    G.agenouiller(tl, m, 2.3);
    R.pose(tl, chef, { bA: 80, cA: 0 }, 3.5, 0.4);
    tl.to(poule.root, { opacity: 0, duration: 0.4 }, 4.5);
    G.prier(tl, m, 5, 8);
    R.parle(tl, m, 5.5, 6);
    R.cartouche(tl, 8, 5, 'lieu_autel', 'droite');
    R.cam(tl, sc, { x: 900, y: 560, z: 0.95 }, 12, 4);
    tl.to(champ.cielOrage, { opacity: 1, duration: 3 }, 13);
    tl.to(champ.soleil, { opacity: 0, duration: 2 }, 13);
    R.eclairBlanc(tl, 16, 0.4);
    tl.to(pluie, { opacity: 1, duration: 1 }, 16.5);
    tl.fromTo(pluie.inner, { y: 0 }, { y: pluie.zoneH, duration: 0.6, ease: 'none', repeat: 36, immediateRender: false }, 16.5);
    tl.to(champ.vert.tiges, { scaleY: 1, duration: 1.2, ease: 'back.out(1.4)', stagger: 0.25 }, 18);
    G.relever(tl, m, 18); G.relever(tl, chef, 18.3);
    G.exprFoule(tl, gens.concat([m, chef]), 'joie', 19);
    G.danseFoule(tl, gens, 22, 14, 900);
    R.pose(tl, chef, { bA: 125, bR: 120, cA: 0, cR: 0, tete: 22 }, 21, 0.6);
    tl.to(pluie, { opacity: 0, duration: 2 }, 38);
    R.fonduSortie(tl, 40.5, 1.5);
  });

  // =================================================================== 7 · L'intronisation
  R.scene('L\'intronisation', 34, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#24305a' });
    const chef = sc.perso(C.roi, COSTUMES.chef, { x: 960, y: COUR });
    const m = maitre(sc, { x: 1120, y: COUR, dir: -1 });
    const bonnet = R.objet(R.el('g', {}), false);
    R.el('path', { d: 'M-20,0 Q0,-30 20,0Z', fill: '#5a3a20' }, bonnet);
    m.tenir(bonnet, 'A', { vertical: true });
    const gens = G.foule(sc, [[C.ronde, H.villageoise, 560, 1], [C.trapu, COSTUMES.kurumba, 440, 1], [C.guerrier, H.cavalier, 1400, -1], [C.guerrier, H.cavalier, 1520, -1], [C.enfant, null, 320, 1]], COUR);
    sc.cam.x = 960; sc.cam.y = 660; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1);
    G.agenouiller(tl, chef, 1.5);
    R.montrer(tl, bonnet, 3, 0.3);
    R.pose(tl, m, { bA: 150, cA: 60 }, 3.5, 0.6);
    R.parle(tl, m, 4, 3);
    R.cam(tl, sc, { x: 1000, y: 740, z: 1.7 }, 3, 3);
    R.pose(tl, m, { bA: 8, cA: 12 }, 8, 0.5);
    R.cacher(tl, bonnet, 8, 0.2);
    G.relever(tl, chef, 8.5);
    R.pose(tl, chef, { assis: 1 }, 10, 0.6);
    R.cam(tl, sc, { x: 960, y: 600, z: 0.95 }, 10, 4);
    gens.forEach((p, i) => G.incliner(tl, p, 11 + i * 0.15, 2, 30));
    G.exprFoule(tl, gens, 'joie', 14);
    G.danseFoule(tl, gens, 16, 14, COUR);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 26, (sc, tl) => {
    DECORS.sahel(sc, { ciel: 'soir' });
    const m = maitre(sc, { x: 1000, dir: -1 });
    const chef = sc.perso(C.roi, COSTUMES.chef, { x: 820, y: SOL });
    sc.cam.x = 920; sc.cam.y = 640; sc.cam.z = 1.3;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 6, 'lieu_aujourdhui');
    G.dialogue(tl, 2, [[chef, 2], [m, 2.5]]);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 7, 5);
    R.fonduSortie(tl, 11.5, 1.5);
    R.titre(tl, 13, 4, 'fin');
    R.generique(tl, 17.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
