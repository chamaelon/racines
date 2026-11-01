/*
 * 19 · Le mystère du vur — animation (voir 00-ecriture/ecriture.md).
 * Récit inventé ; aucune pratique du culte n'est montrée.
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880, COUR = 900;
  const { montrer, cacher, objet } = R;

  const COSTUMES = {
    ebeye: { haut: { type: 'boubou', couleur: '#8a6a4a', motif: 'points', motifCouleur: '#efe6cf', long: 1.7 }, manches: '#8a6a4a', tete: { type: 'foulard', couleur: '#3a2a1a' } },
    voleur: { haut: { type: 'tunique', couleur: '#3a4a3a', motif: 'bandes', motifCouleur: '#1a2a1a' }, bas: { type: 'short', couleur: '#2a2a2a' } },
  };
  const ANCIENS = [[C.ancien, null], [C.roi, H.notable], [C.ancien, H.marabout]];

  // =================================================================== 1 · Le village
  R.scene('Le village', 26, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir', soleil: [1550, 640, 70] });
    const gens = G.foule(sc, [[C.vieille, COSTUMES.ebeye, 700, 1], [C.filiforme, COSTUMES.voleur, 1100, -1], [C.enfant, null, 900, 1]]);
    sc.cam.y = 540; sc.cam.z = 0.9;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 280);
    R.cartouche(tl, 8, 5, 'lieu_village');
    R.cam(tl, sc, { x: 900, y: 640, z: 1.2 }, 8, 14);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Le vol
  R.scene('Le vol', 34, (sc, tl) => {
    const ga = R.plan(sc, tl, 0, 12);
    DECORS.cour(ga.sous, { grenierX: 1250 });
    const ebeye = sc.perso(C.vieille, COSTUMES.ebeye, { x: 800, y: COUR }, ga);
    ebeye.tenir(D.calebasse(), 'A', { vertical: true });
    tl.set(sc.cam, { x: 1000, y: 680, z: 1.3 }, 0);
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 0.8, 4.5, 'perso_veuve');
    R.marche(tl, ebeye, 1150, 1, 3, { pas: 4 });
    R.pose(tl, ebeye, { bA: 150, cA: 20 }, 4.2, 0.5);
    R.expr(tl, ebeye, 'joie', 5);
    R.pose(tl, ebeye, { bA: 8, cA: 12 }, 7, 0.5);
    R.fonduSortie(tl, 11.4, 0.6);
    const gb = R.plan(sc, tl, 12);
    DECORS.cour(gb.sous, { grenierX: 1250, ciel: 'nuit', etoiles: true });
    R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#0b1030', opacity: 0.45 }, gb);
    const voleur = sc.perso(C.filiforme, COSTUMES.voleur, { x: 2300, y: COUR, dir: -1 }, gb);
    const sac = R.objet(D.sac(), false); voleur.tenir(sac, 'A', { vertical: true });
    tl.set(sc.cam, { x: 1150, y: 660, z: 1.2 }, 12);
    R.fonduEntree(tl, 12, 1);
    R.cartouche(tl, 12.5, 4, 'lieu_nuit');
    R.pose(tl, voleur, { lean: 20 }, 13, 0.5);
    R.marche(tl, voleur, 1330, 13.5, 5, { pas: 8, amp: 0.6 });
    [15, 16.5, 18].forEach((t, i) => R.pose(tl, voleur, { regard: i % 2 ? 1 : -1 }, t, 0.3));
    R.pose(tl, voleur, { lean: 0, bA: 160, cA: 20 }, 19, 0.6);
    montrer(tl, sac, 20.5, 0.3);
    R.pose(tl, voleur, { bA: 70, cA: 70 }, 21, 0.5);
    R.expr(tl, voleur, 'joie', 21.5);
    tl.set(voleur.p, { dir: 1 }, 23);
    R.marche(tl, voleur, 2300, 23.2, 5, { pas: 10, amp: 1.1 });
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 3 · Le soupçon
  R.scene('Le soupçon', 36, (sc, tl) => {
    DECORS.village(sc, {});
    const ebeye = sc.perso(C.vieille, COSTUMES.ebeye, { x: 700, y: SOL });
    const voisins = G.foule(sc, [[C.trapu, H.villageois, 560, 1], [C.ronde, H.villageoise, 430, 1], [C.filiforme, COSTUMES.voleur, 300, 1]]);
    const berger = sc.perso(C.trapu, H.peul, { x: 2200, y: SOL, dir: -1 });
    berger.tenir(D.baton(200), 'R', { vertical: true });
    const zebu = sc.bete(B.zebu, { x: 2420, y: SOL, dir: -1, s: 0.85 });
    sc.cam.x = 800; sc.cam.y = 640; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    G.pleurer(tl, ebeye, 1, 5);
    G.exprFoule(tl, voisins, 'colere', 3);
    G.dialogue(tl, 6.5, [[voisins[0], 2.5], [voisins[1], 2]]);
    // Le berger passe : on l'accuse
    R.marche(tl, berger, 1250, 9, 6);
    R.marche(tl, zebu, 1450, 9.3, 6, { pas: 6 });
    R.cam(tl, sc, { x: 1000, y: 620, z: 1.05 }, 10, 3);
    R.cartouche(tl, 11, 4, 'perso_berger', 'droite');
    G.pointer(tl, voisins[0], 15.5, 4);
    G.pointer(tl, voisins[2], 15.8, 4);
    R.expr(tl, voisins[2], 'joie', 16);
    R.parle(tl, voisins[0], 15.5, 3);
    R.expr(tl, berger, 'surprise', 16);
    R.pose(tl, berger, { bA: 70, cA: 110 }, 17, 0.4);
    tl.to(berger.p, { tete: 12, duration: 0.25, yoyo: true, repeat: 7 }, 17.5);
    R.marche(tl, voisins[0], 1050, 20, 2, { pas: 3 });
    G.frapper(tl, voisins[0], berger, 22.5, { recul: 50 });
    R.expr(tl, berger, 'peur', 23);
    // L'ancien s'interpose
    const ancien = sc.perso(C.ancien, null, { x: -200, y: SOL });
    ancien.tenir(D.baton(200), 'R', { vertical: true });
    R.marche(tl, ancien, 900, 23, 4);
    R.pose(tl, ancien, { bA: 120, cA: 0 }, 27.2, 0.4);
    G.exprFoule(tl, voisins, 'surprise', 27.5);
    R.parle(tl, ancien, 28, 3);
    R.cam(tl, sc, { x: 950, y: 650, z: 1.2 }, 27, 3);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 4 · Les anciens
  R.scene('Les anciens', 32, (sc, tl) => {
    DECORS.palais(sc, { ciel: 'soir' });
    const anciens = ANCIENS.map(([def, cos], i) => sc.perso(def, cos, { x: 760 + i * 200, y: COUR, assis: 1, dir: i === 2 ? -1 : 1 }));
    const ebeye = sc.perso(C.vieille, COSTUMES.ebeye, { x: 540, y: COUR });
    const berger = sc.perso(C.trapu, H.peul, { x: 1450, y: COUR, dir: -1 });
    const voleur = sc.perso(C.filiforme, COSTUMES.voleur, { x: 1600, y: COUR, dir: -1 });
    sc.cam.x = 960; sc.cam.y = 660; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1);
    G.dialogue(tl, 1, [[anciens[0], 3], [anciens[2], 2.5], [anciens[1], 3]]);
    R.cartouche(tl, 10, 6, 'lieu_anciens');
    G.pointer(tl, anciens[1], 11, 4, 0.2);
    G.exprFoule(tl, [ebeye, berger], 'serein', 12);
    R.expr(tl, voleur, 'peur', 13);
    R.cam(tl, sc, { x: 1600, y: 680, z: 1.8 }, 13, 2);
    tl.to(voleur.p, { bob: 2, duration: 0.15, yoyo: true, repeat: 11 }, 14);
    R.cam(tl, sc, { x: 960, y: 640, z: 1.05 }, 18, 3);
    anciens.forEach((p, i) => G.relever(tl, p, 21 + i * 0.3));
    anciens.forEach((p, i) => { tl.set(p.p, { dir: -1 }, 23); R.marche(tl, p, -300 - i * 140, 23.2 + i * 0.3, 7); });
    R.fonduSortie(tl, 30.5, 1.5);
  });

  // =================================================================== 5 · Le lieu du vur
  R.scene('Le lieu du vur', 36, (sc, tl) => {
    DECORS.bois(sc, { ciel: 'soir' });
    const anciens = ANCIENS.map(([def, cos], i) => sc.perso(def, cos, { x: -200 - i * 150, y: SOL }));
    const voile = R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#000', opacity: 0 }, sc.monde);
    const lueur = D.lumiere(sc.monde, 1500, 760, 26, '#fff1a8'); lueur.setAttribute('opacity', 0);
    const feuilles = D.particules(sc.monde, 30, 1400, 500, '#5a8a3a', 11);
    sc.cam.x = 900; sc.cam.y = 620; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 6, 'lieu_sanctuaire');
    anciens.forEach((p, i) => R.marche(tl, p, 1200 - i * 150, 1 + i * 0.4, 10, { pas: 12 }));
    G.exprFoule(tl, anciens, 'serein', 2);
    R.cam(tl, sc, { x: 1250, y: 600, z: 1 }, 6, 6);
    // On ne montre rien : seulement le vent, une lumière, et le noir
    [12, 13, 14, 15].forEach((t, i) => R.jaillir(tl, feuilles, t, i, { n: 8, ecart: 70, haut: -160, duree: 1.4 }));
    tl.to(lueur, { opacity: 0.9, scale: 3, transformOrigin: '50% 50%', duration: 3 }, 13);
    tl.to(voile, { opacity: 1, duration: 3 }, 16);
    tl.to(voile, { opacity: 0, duration: 3 }, 25);
    tl.to(lueur, { opacity: 0, duration: 1 }, 24);
    anciens.forEach((p, i) => { tl.set(p.p, { dir: -1 }, 25); R.marche(tl, p, -300 - i * 140, 27 + i * 0.3, 7); });
    G.exprFoule(tl, anciens, 'neutre', 25);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 6 · Le remords
  R.scene('Le remords', 42, (sc, tl) => {
    DECORS.cour(sc, { ciel: 'nuit', etoiles: true, grenierX: 1580 });
    R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#0b1030', opacity: 0.45 }, sc.monde);
    R.el('rect', { x: 700, y: 892, width: 260, height: 12, rx: 4, fill: '#d9b26a' }, sc.monde);
    const voleur = sc.perso(C.filiforme, COSTUMES.voleur, Object.assign({ x: 940, y: 885, rot: -90 }, R.EXPRESSIONS.sommeil));
    const yeux = [0, 1, 2].map((i) => { const g = R.el('g', { opacity: 0 }, sc.monde); const x = 600 + i * 350, y = 500 + (i % 2) * 80; R.el('ellipse', { cx: x - 14, cy: y, rx: 9, ry: 6, fill: '#fff1a8' }, g); R.el('ellipse', { cx: x + 14, cy: y, rx: 9, ry: 6, fill: '#fff1a8' }, g); R.el('ellipse', { cx: x, cy: y, rx: 80, ry: 50, fill: '#fff1a8', opacity: 0.15, filter: 'url(#flou)' }, g); return g; });
    const sac = R.objet(D.sac(), false); voleur.tenir(sac, 'A', { vertical: true });
    sc.cam.x = 900; sc.cam.y = 700; sc.cam.z = 1.5;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 4.5, 'lieu_remords');
    tl.to(voleur.p, { rot: -80, duration: 0.4, yoyo: true, repeat: 7 }, 3);
    yeux.forEach((y, i) => { tl.to(y, { opacity: 1, duration: 1 }, 5 + i * 1.2); tl.to(y, { opacity: 0, duration: 0.6 }, 11 + i * 0.3); });
    R.cam(tl, sc, { x: 900, y: 580, z: 1 }, 5, 3);
    tl.to(voleur.p, { rot: 0, x: 900, y: COUR, yeux: 0, duration: 0.8 }, 12);
    R.expr(tl, voleur, 'peur', 12.5);
    tl.to(voleur.p, { bob: 2, duration: 0.12, yoyo: true, repeat: 15 }, 13);
    R.cam(tl, sc, { x: 900, y: 680, z: 1.5 }, 13, 2);
    R.expr(tl, voleur, 'triste', 16);
    // Il rapporte le mil chez la veuve
    montrer(tl, sac, 17, 0.3);
    R.pose(tl, voleur, { bA: 70, cA: 70 }, 17, 0.5);
    tl.set(voleur.p, { dir: -1 }, 18);
    R.marche(tl, voleur, -300, 18.2, 5, { pas: 8 });
    R.fonduSortie(tl, 23, 1);
    R.fonduEntree(tl, 24.2, 1);
    // Chez Ebéyé : il dépose le sac au pied du grenier ; elle le surprend
    tl.set(voleur.p, { x: 2200, dir: -1 }, 24);
    const ebeye = sc.perso(C.vieille, COSTUMES.ebeye, { x: 1900, y: COUR, dir: -1, alpha: 0 });
    tl.set(sc.cam, { x: 1500, y: 660, z: 1.2 }, 24);
    R.marche(tl, voleur, 1650, 24.5, 4, { pas: 6 });
    R.pose(tl, voleur, { lean: 35, bA: 40 }, 28.6, 0.5);
    cacher(tl, sac, 29, 0.2);
    const sacSol = R.el('g', { opacity: 0 }, sc.monde); const s = D.sac(); s.setAttribute('transform', 'translate(1560,880)'); sacSol.appendChild(s);
    tl.to(sacSol, { opacity: 1, duration: 0.2 }, 29);
    R.pose(tl, voleur, { lean: 0, bA: 8, cA: 12 }, 29.4, 0.5);
    tl.to(ebeye.p, { alpha: 1, duration: 0.4 }, 30);
    tl.set(ebeye.p, { dir: -1 }, 30);
    tl.set(voleur.p, { dir: 1 }, 31);
    R.expr(tl, voleur, 'peur', 31);
    R.expr(tl, ebeye, 'surprise', 31);
    G.agenouiller(tl, voleur, 33);
    R.parle(tl, voleur, 34, 4);
    R.pose(tl, voleur, { tete: -15 }, 34, 0.5);
    R.cam(tl, sc, { x: 1750, y: 700, z: 1.5 }, 33, 3);
    R.fonduSortie(tl, 40.5, 1.5);
  });

  // =================================================================== 7 · Le pardon
  R.scene('Le pardon', 38, (sc, tl) => {
    DECORS.village(sc, {});
    const ebeye = sc.perso(C.vieille, COSTUMES.ebeye, { x: 900, y: SOL });
    const voleur = sc.perso(C.filiforme, COSTUMES.voleur, { x: 1080, y: SOL, dir: -1, assis: 0.75, lean: 18, tete: -12 });
    Object.assign(voleur.p, R.EXPRESSIONS.triste);
    const anciens = ANCIENS.map(([def, cos], i) => sc.perso(def, cos, { x: 600 - i * 140, y: SOL }));
    const berger = sc.perso(C.trapu, H.peul, { x: 1450, y: SOL, dir: -1 });
    const voisins = G.foule(sc, [[C.trapu, H.villageois, 1620, -1], [C.ronde, H.villageoise, 1760, -1]]);
    sc.cam.x = 1050; sc.cam.y = 640; sc.cam.z = 1.1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_pardon');
    R.parle(tl, voleur, 1.5, 4);
    G.exprFoule(tl, voisins, 'surprise', 3);
    R.expr(tl, ebeye, 'serein', 6);
    R.pose(tl, ebeye, { bA: 80, cA: 10, lean: 25 }, 7, 0.6);
    G.relever(tl, voleur, 8.5);
    R.expr(tl, voleur, 'surprise', 9);
    R.pose(tl, ebeye, { lean: 10, bA: 8, cA: 12 }, 9.5, 0.5);
    R.parle(tl, anciens[0], 10, 3);
    G.pointer(tl, anciens[0], 10.5, 2.5);
    // On s'excuse auprès du berger
    R.marche(tl, voisins[0], 1520, 14, 1.5, { pas: 3 });
    G.incliner(tl, voisins[0], 16, 2, 35);
    R.expr(tl, berger, 'joie', 17);
    R.pose(tl, berger, { bA: 85, cA: 0 }, 18.5, 0.4);
    R.pose(tl, voisins[0], { bA: 85, cA: 0 }, 18.6, 0.4);
    tl.to([berger.p, voisins[0].p], { cA: 12, duration: 0.2, yoyo: true, repeat: 5 }, 19);
    R.cam(tl, sc, { x: 1400, y: 640, z: 1.25 }, 14, 3);
    // Le voleur travaillera le champ de la veuve
    R.cam(tl, sc, { x: 1000, y: 620, z: 1.05 }, 22, 3);
    const houe = voleur.tenir(R.objet(D.houe(), false), 'A');
    tl.to(houe.firstChild, { opacity: 1, duration: 0.3 }, 23);
    G.piocher(tl, voleur, 24, 9, 0.9);
    R.expr(tl, voleur, 'serein', 25);
    R.expr(tl, ebeye, 'joie', 26);
    R.fonduSortie(tl, 36.5, 1.5);
  });

  // =================================================================== 8 · Le vur veille
  R.scene('Le vur veille', 26, (sc, tl) => {
    DECORS.bois(sc, { ciel: 'soir' });
    const lueur = D.lumiere(sc.monde, 1480, 640, 18, '#fff1a8'); lueur.setAttribute('opacity', 0);
    sc.cam.x = 1300; sc.cam.y = 560; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 7, 'lieu_fin');
    tl.to(lueur, { opacity: 0.7, scale: 2, transformOrigin: '50% 50%', duration: 2, yoyo: true, repeat: 2 }, 2);
    R.cam(tl, sc, { y: 480, z: 0.85 }, 3, 8);
    R.fonduSortie(tl, 11.5, 1.5);
    R.titre(tl, 13, 4, 'fin');
    R.generique(tl, 17.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
