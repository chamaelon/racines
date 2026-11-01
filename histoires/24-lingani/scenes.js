/*
 * 24 · Les Lingani de Tangaré — animation (voir 00-ecriture/ecriture.md).
 * La préparation mystique n'est pas montrée.
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, COUR = 900;
  const { montrer, cacher, objet } = R;

  const COSTUMES = {
    pretendant: { haut: { type: 'boubou', couleur: '#5a1f3a', motif: 'chevrons', motifCouleur: '#e9c46a', long: 1.5 }, manches: '#5a1f3a', collier: '#e9c46a' },
    elu: { haut: { type: 'tunique', couleur: '#e8dcc0', motif: 'bandes', motifCouleur: '#7a4a25' }, bas: { type: 'short', couleur: '#7a4a25' }, tete: null },
    eluRoi: { haut: { type: 'boubou', couleur: '#f4f0e6', motif: 'bandes', motifCouleur: '#2f6c8f', long: 1.6 }, manches: '#f4f0e6', collier: '#e9c46a' },
    lingani: { haut: { type: 'boubou', couleur: '#d8cfb8', motif: 'points', motifCouleur: '#5a3a20', long: 1.7 }, manches: '#d8cfb8', tete: { type: 'bonnet', couleur: '#5a3a20' }, collier: '#efe6cf' },
  };
  /** Couronne à porter : groupe posé sur la tête (G.surLaTete). */
  const couronne = () => { const g = R.el('g', {}); R.el('path', { d: 'M-22,0 L-24,-22 L-12,-12 L0,-28 L12,-12 L24,-22 L22,0Z', fill: '#e9c46a', stroke: '#8a6a30', 'stroke-width': 2 }, g); return g; };
  const anciens = (sc, parent) => G.foule(sc, [[C.roi, H.notable, 1300, -1], [C.ancien, null, 1440, -1], [C.vieille, null, 1580, -1]], COUR, parent);

  // =================================================================== 1 · Garango
  R.scene('Garango', 26, (sc, tl) => {
    DECORS.village(sc, { soleil: [300, 200, 60] });
    const gens = G.foule(sc, [[C.ronde, H.villageoise, 700, 1], [C.trapu, H.villageois, 900, -1], [C.enfant, null, 1100, -1]]);
    sc.cam.y = 540; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 280);
    R.cartouche(tl, 8, 5, 'lieu_garango');
    G.piocher(tl, gens[1], 8, 10, 0.9);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.2 }, 8, 14);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Le deuil
  R.scene('Le deuil', 30, (sc, tl) => {
    DECORS.palais(sc, { ciel: 'soir' });
    const linceul = R.el('rect', { x: 820, y: 868, width: 300, height: 32, rx: 14, fill: '#efe8d8', stroke: '#a89a7a', 'stroke-width': 3 }, sc.monde);
    const gens = anciens(sc).concat(G.foule(sc, [[C.elancee, H.villageoise, 640, 1], [C.ronde, H.villageoise, 500, 1]], COUR));
    sc.cam.x = 960; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_mort');
    G.exprFoule(tl, gens, 'triste', 1);
    G.pleurer(tl, gens[3], 2, 10);
    G.pleurer(tl, gens[4], 3, 9);
    gens.slice(0, 3).forEach((p, i) => R.pose(tl, p, { tete: -15 }, 2 + i * 0.2, 0.6));
    R.cam(tl, sc, { x: 960, y: 760, z: 1.7 }, 8, 8);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 3 · Le prétendant pressé
  R.scene('Le prétendant pressé', 36, (sc, tl) => {
    DECORS.palais(sc, {});
    const pret = sc.perso(C.guerrier, COSTUMES.pretendant, { x: -200, y: COUR });
    const cour = anciens(sc);
    const cour2 = G.foule(sc, [[C.trapu, H.villageois, 500, 1], [C.ronde, H.villageoise, 380, 1]], COUR);
    const posee = R.el('g', {}, sc.monde);
    const c0 = couronne(); c0.setAttribute('transform', 'translate(960,846)'); posee.appendChild(c0);
    const surTete = R.objet(couronne(), false); G.surLaTete(pret, surTete);
    sc.cam.x = 900; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, pret, 820, 1, 5);
    R.cartouche(tl, 2, 5, 'perso_pretendant');
    R.expr(tl, pret, 'joie', 4);
    R.pose(tl, pret, { lean: 35, bA: 60 }, 6.5, 0.5);
    tl.to(posee, { opacity: 0, duration: 0.2 }, 7.2);
    R.pose(tl, pret, { lean: 0, bA: 170, cA: 60, bR: 170, cR: 60 }, 7.3, 0.6);
    montrer(tl, surTete, 8, 0.3);
    R.pose(tl, pret, { bA: 8, cA: 12, bR: -8, cR: 12 }, 8.5, 0.5);
    R.pose(tl, pret, { assis: 1 }, 9.5, 0.6);
    R.expr(tl, pret, 'rire', 10);
    G.exprFoule(tl, cour.concat(cour2), 'surprise', 9);
    G.dialogue(tl, 12, [[cour[0], 3], [pret, 2.5]]);
    G.pointer(tl, cour[1], 13, 3);
    R.expr(tl, pret, 'colere', 15);
    G.pointer(tl, pret, 16, 2, 0.2);
    R.cam(tl, sc, { x: 1100, y: 680, z: 1.3 }, 12, 4);
    G.exprFoule(tl, cour, 'triste', 20);
    cour.forEach((p, i) => { tl.set(p.p, { dir: 1 }, 22 + i * 0.3); R.marche(tl, p, 2300, 22.2 + i * 0.3, 6); });
    R.cam(tl, sc, { x: 960, y: 640, z: 1.05 }, 22, 4);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 4 · Les malheurs
  R.scene('Les malheurs', 36, (sc, tl) => {
    DECORS.palais(sc, { ciel: 'orage' });
    const pret = sc.perso(C.guerrier, COSTUMES.pretendant, { x: 960, y: COUR, assis: 1 });
    const tete = couronne(); G.surLaTete(pret, tete);
    const tombee = R.el('g', { opacity: 0 }, sc.monde); const c1 = couronne(); c1.setAttribute('transform', 'translate(0,0) rotate(80)'); tombee.appendChild(c1);
    const gens = G.foule(sc, [[C.trapu, H.villageois, 560, 1], [C.ronde, H.villageoise, 430, 1], [C.enfant, null, 1350, -1]], COUR);
    const pluie = D.pluie(sc.monde, 160, 9);
    sc.cam.x = 960; sc.cam.y = 680; sc.cam.z = 1.25;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 6, 'lieu_echec');
    R.secousse(tl, sc, 3, 10, 1.2);
    R.eclairBlanc(tl, 3, 0.5);
    tl.to(tete, { opacity: 0, duration: 0.1 }, 3.6);
    tl.set(tombee, { x: 990, y: 700, opacity: 1 }, 3.6);
    tl.to(tombee, { y: 896, x: 1080, duration: 0.6, ease: 'bounce.out' }, 3.6);
    R.expr(tl, pret, 'peur', 3.8);
    R.cam(tl, sc, { x: 1000, y: 760, z: 1.8 }, 4, 2);
    tl.to(pluie, { opacity: 1, duration: 1 }, 7);
    tl.fromTo(pluie.inner, { y: 0 }, { y: pluie.zoneH, duration: 0.6, ease: 'none', repeat: 40, immediateRender: false }, 7);
    R.cam(tl, sc, { x: 960, y: 640, z: 1.05 }, 8, 3);
    G.exprFoule(tl, gens, 'peur', 8);
    gens.forEach((p, i) => { tl.set(p.p, { dir: p.p.x < 960 ? -1 : 1 }, 12 + i * 0.3); R.marche(tl, p, p.p.x < 960 ? -300 : 2300, 12.2 + i * 0.3, 5, { pas: 10, amp: 1.2 }); });
    // Le prétendant ramasse la couronne… elle retombe
    R.pose(tl, pret, { assis: 0 }, 18, 0.8);
    R.marche(tl, pret, 1060, 19, 1, { pas: 2 });
    R.pose(tl, pret, { lean: 40, bA: 60 }, 20.2, 0.5);
    tl.to(tombee, { y: 760, duration: 0.4 }, 20.8);
    tl.to(tombee, { y: 896, rotation: 30, duration: 0.5, ease: 'bounce.out' }, 21.4);
    R.pose(tl, pret, { lean: 0, bA: 8 }, 21.5, 0.4);
    R.expr(tl, pret, 'triste', 22);
    G.pleurer(tl, pret, 24, 6);
    tl.to(pluie, { opacity: 0, duration: 2 }, 32);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 5 · Vers Tangaré
  R.scene('Vers Tangaré', 30, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir' });
    const elu = sc.perso(C.filiforme, COSTUMES.elu, { x: -300, y: SOL });
    const guides = [[C.roi, H.notable, -150], [C.ancien, null, -480], [C.vieille, null, -620]].map(([d, c, x]) => sc.perso(d, c, { x, y: SOL }));
    guides[1].tenir(D.baton(200), 'R', { vertical: true });
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'perso_elu');
    R.expr(tl, elu, 'serein', 1);
    [guides[0], elu, guides[1], guides[2]].forEach((p, i) => R.marche(tl, p, 2300 - i * 150, 1 + i * 0.3, 24, { pas: 30 }));
    R.cam(tl, sc, { x: 1300 }, 2, 24);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 6 · Les Lingani
  R.scene('Les Lingani', 42, (sc, tl) => {
    DECORS.bois(sc, { ciel: 'soir' });
    const kase = D.caseRonde(sc.monde, 1450, SOL, 1.1, { couleur: '#8a5a32' });
    const lingani = [[C.ancien, COSTUMES.lingani, 1250, -1], [C.vieille, COSTUMES.lingani, 1650, -1]].map(([d, c, x, dir]) => sc.perso(d, c, { x, y: SOL, dir, alpha: 0 }));
    const elu = sc.perso(C.filiforme, COSTUMES.elu, { x: -200, y: SOL });
    const guide = sc.perso(C.roi, H.notable, { x: -380, y: SOL });
    const voile = R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#000', opacity: 0 }, sc.monde);
    const lueur = D.lumiere(sc.monde, 1450, 760, 20, '#fff1a8'); lueur.setAttribute('opacity', 0);
    sc.cam.x = 1000; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_tangare');
    R.marche(tl, elu, 900, 1, 6); R.marche(tl, guide, 720, 1.3, 6);
    lingani.forEach((p, i) => tl.to(p.p, { alpha: 1, duration: 1 }, 6 + i * 0.5));
    R.cartouche(tl, 7, 5, 'perso_lingani', 'droite');
    G.incliner(tl, guide, 8, 2, 35);
    G.agenouiller(tl, elu, 9);
    G.dialogue(tl, 11, [[lingani[0], 3], [guide, 2]]);
    R.expr(tl, lingani[0], 'serein', 14);
    R.pose(tl, lingani[0], { bA: 100, cA: 30 }, 16.5, 0.5);
    G.relever(tl, elu, 17.5);
    // L'élu entre dans la case ; on n'en montre rien
    R.marche(tl, elu, 1450, 19, 3, { pas: 4 });
    tl.to(elu.p, { alpha: 0, duration: 0.4 }, 22);
    lingani.forEach((p, i) => { R.marche(tl, p, 1450, 22 + i * 0.3, 1.5, { pas: 2 }); tl.to(p.p, { alpha: 0, duration: 0.4 }, 23.6 + i * 0.3); });
    R.cartouche(tl, 24, 6, 'lieu_preparation');
    tl.to(lueur, { opacity: 0.8, scale: 2.5, transformOrigin: '50% 50%', duration: 2, yoyo: true, repeat: 1 }, 25);
    tl.to(voile, { opacity: 1, duration: 2 }, 28);
    tl.to(voile, { opacity: 0, duration: 2 }, 31);
    tl.set(elu.p, { x: 1300, dir: -1 }, 31);
    tl.to(elu.p, { alpha: 1, duration: 0.6 }, 32);
    R.expr(tl, elu, 'serein', 32);
    R.pose(tl, elu, { tete: 10 }, 33, 0.5);
    G.incliner(tl, guide, 34, 2, 35);
    R.fonduSortie(tl, 40.5, 1.5);
  });

  // =================================================================== 7 · Le couronnement
  R.scene('Le couronnement', 40, (sc, tl) => {
    DECORS.palais(sc, { parasol: '#2f6c8f', soleil: [300, 200, 60] });
    const elu = sc.perso(C.filiforme, COSTUMES.eluRoi, { x: -200, y: COUR });
    const c = R.objet(couronne(), false); G.surLaTete(elu, c);
    const lingani = sc.perso(C.ancien, COSTUMES.lingani, { x: 1080, y: COUR, dir: -1 });
    const cour = anciens(sc);
    const foule = G.foule(sc, [[C.trapu, H.villageois, 500, 1], [C.ronde, H.villageoise, 380, 1], [C.enfant, null, 260, 1], [C.guerrier, COSTUMES.pretendant, 1750, -1]], COUR);
    const pluie = D.pluie(sc.monde, 120, 17);
    sc.cam.x = 900; sc.cam.y = 640; sc.cam.z = 1.05;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_couronne');
    R.marche(tl, elu, 900, 1, 6);
    G.agenouiller(tl, elu, 7.2);
    R.pose(tl, lingani, { bA: 150, cA: 60, bR: 150, cR: 60 }, 8, 0.6);
    montrer(tl, c, 9, 0.6);
    R.pose(tl, lingani, { bA: 8, cA: 12, bR: -8, cR: 12 }, 10, 0.6);
    G.relever(tl, elu, 10.5);
    R.pose(tl, elu, { assis: 1 }, 12, 0.6);
    R.expr(tl, elu, 'serein', 12);
    R.cam(tl, sc, { x: 960, y: 740, z: 1.7 }, 8, 4);
    G.exprFoule(tl, cour.concat(foule), 'joie', 13);
    cour.concat(foule).forEach((p, i) => G.incliner(tl, p, 14 + i * 0.15, 2, 30));
    R.expr(tl, foule[3], 'triste', 14);
    R.cam(tl, sc, { x: 960, y: 600, z: 0.95 }, 15, 4);
    // La pluie revient, douce
    tl.to(pluie, { opacity: 0.6, duration: 1.5 }, 20);
    tl.fromTo(pluie.inner, { y: 0 }, { y: pluie.zoneH, duration: 0.6, ease: 'none', repeat: 30, immediateRender: false }, 20);
    G.danseFoule(tl, foule.slice(0, 3), 22, 14, COUR);
    R.pose(tl, elu, { bA: 120, cA: 30 }, 22, 0.5);
    tl.to(pluie, { opacity: 0, duration: 2 }, 36);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 8 · Aujourd'hui
  R.scene('Aujourd\'hui', 30, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir' });
    const gens = G.foule(sc, [[C.ancien, COSTUMES.lingani, 800, 1], [C.fille, null, 980, -1], [C.enfant, null, 1090, -1]]);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 7, 'lieu_aujourdhui');
    G.dialogue(tl, 2, [[gens[0], 4]]);
    G.exprFoule(tl, gens.slice(1), 'serein', 4);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 8, 6);
    R.fonduSortie(tl, 15.5, 1.5);
    R.titre(tl, 17, 4, 'fin');
    R.generique(tl, 21.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
