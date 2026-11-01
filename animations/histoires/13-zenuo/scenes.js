/*
 * 13 · Zenuo, le premier Dagara — animation (voir 00-ecriture/ecriture.md).
 */
(function () {
  const D = R.D, C = CASTING, H = HABITS, B = BESTIAIRE, G = R.G;
  R.init(document.getElementById('scene'));
  const SOL = 880;

  const COSTUMES = {
    nyole: { haut: { type: 'camisole', couleur: '#c8553d' }, bas: { type: 'jupe', couleur: '#e9c46a', motif: 'chevrons', motifCouleur: '#5a3a20' }, tete: { type: 'foulard', couleur: '#5b8c5a' }, collier: '#efe6cf' },
  };
  const couple = (sc, x, parent, pose) => {
    const z = sc.perso(C.filiforme, H.chasseur, Object.assign({ x, y: SOL }, pose || {}), parent);
    z.arc = z.tenir(D.arc(), 'R', { vertical: true });
    const n = sc.perso(C.elancee, COSTUMES.nyole, Object.assign({ x: x - 130, y: SOL }, pose || {}), parent);
    return { z, n };
  };
  /** Pintades en vol qui tournent (plusieurs oiseaux en cercle autour de cx, cy). */
  function volDePintades(sc, tl, cx, cy, at, duree, n) {
    const oiseaux = [];
    for (let i = 0; i < (n || 6); i++) {
      const o = sc.bete(B.pintade, { x: cx, y: cy, s: 0.7, alpha: 0 });
      oiseaux.push(o);
      const ph = (i / (n || 6)) * Math.PI * 2;
      const etat = { a: ph };
      tl.to(o.p, { alpha: 1, duration: 0.5 }, at);
      tl.fromTo(etat, { a: ph }, { a: ph + Math.PI * 2 * (duree / 4), duration: duree, ease: 'none', immediateRender: false, onUpdate: () => { o.p.x = cx + Math.cos(etat.a) * 220; o.p.y = cy + Math.sin(etat.a) * 60; o.p.dir = Math.sin(etat.a) > 0 ? -1 : 1; } }, at);
      tl.to(o.p, { alpha: 0, duration: 0.6 }, at + duree - 0.6);
    }
    return oiseaux;
  }

  // =================================================================== 1 · Zenuo
  R.scene('Zenuo', 26, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir' });
    const { z } = couple(sc, -200);
    const lievre = sc.bete(B.lievre, { x: 1500, y: SOL, s: 1.1, dir: -1 });
    sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1.5);
    R.titre(tl, 1, 6, 'titre', 'sous_titre', 300);
    R.marche(tl, z, 800, 2, 6, { pas: 8 });
    R.cartouche(tl, 7.5, 5, 'perso_zenuo');
    R.marche(tl, lievre, 1250, 8, 1.5, { pas: 6 });
    G.tirer(tl, z, sc.monde, 11, 1200, 800, 0.4);
    tl.set(lievre.p, { dir: 1 }, 11.9);
    R.marche(tl, lievre, 2300, 12, 2, { pas: 10 });
    R.expr(tl, z, 'rire', 13);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.25 }, 12, 6);
    R.fonduSortie(tl, 24.5, 1.5);
  });

  // =================================================================== 2 · Le départ
  R.scene('Le départ', 36, (sc, tl) => {
    DECORS.village(sc, {});
    const { z, n } = couple(sc, 900);
    n.p.x = 760;
    const rivaux = G.foule(sc, [[C.colosse, H.forgeron, 1250, -1], [C.trapu, H.villageois, 1400, -1]]);
    const ancien = sc.perso(C.ancien, null, { x: 1100, y: SOL, dir: -1 });
    sc.cam.x = 1000; sc.cam.y = 620; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'perso_nyole');
    G.exprFoule(tl, rivaux, 'colere', 1.5);
    G.dialogue(tl, 2, [[rivaux[0], 2.5], [z, 2], [rivaux[1], 2.5]]);
    R.pose(tl, rivaux[0], { bA: 150, cA: 50 }, 3, 0.4);
    R.pose(tl, rivaux[0], { bA: 8, cA: 12 }, 5, 0.4);
    tl.to(rivaux[0].p, { x: 1100, duration: 0.4 }, 9.5);
    G.frapper(tl, rivaux[0], z, 10);
    R.expr(tl, ancien, 'triste', 11);
    R.pose(tl, ancien, { bA: 100, cA: 0 }, 11.5, 0.5);
    R.parle(tl, ancien, 12, 2.5);
    R.expr(tl, z, 'triste', 13);
    // Zenuo et Nyolé décident de partir
    tl.set([z.p, n.p], { dir: -1 }, 16);
    G.dialogue(tl, 16.5, [[n, 2], [z, 2.5]]);
    G.pointer(tl, z, 19, 2.5, 0.2);
    G.surLaTete(n, D.canari(null, 0, 0, 0.5));
    R.expr(tl, n, 'serein', 22); R.expr(tl, z, 'serein', 22);
    R.marche(tl, z, -300, 23, 8);
    R.marche(tl, n, -450, 23.3, 8);
    G.saluer(tl, ancien, 24, 4);
    R.cam(tl, sc, { x: 700 }, 23, 8);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 3 · Le voyage
  R.scene('Le voyage', 36, (sc, tl) => {
    const ga = R.plan(sc, tl, 0, 17);
    DECORS.brousse(ga.sous, { ciel: 'chaud' });
    const a = couple(sc, -150, ga);
    const chien = sc.bete(B.chien, { x: 0, y: SOL, s: 1 }, ga);
    G.surLaTete(a.n, D.canari(null, 0, 0, 0.5));
    tl.set(sc.cam, { x: 960, y: 600, z: 1 }, 0);
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4, 'lieu_depart');
    R.marche(tl, chien, 2400, 1, 14, { pas: 30 });
    R.marche(tl, a.z, 2300, 1.3, 15, { pas: 22 });
    R.marche(tl, a.n, 2150, 1.6, 15, { pas: 22 });
    R.cam(tl, sc, { x: 1300 }, 2, 14);
    R.fonduSortie(tl, 16.4, 0.6);
    const gb = R.plan(sc, tl, 17);
    DECORS.brousse(gb.sous, { ciel: 'nuit', nuit: true });
    const feu = D.feu(gb, 960, SOL + 2, 0.9); G.flamber(tl, feu, 17, 19);
    const b = couple(sc, 780, gb, { assis: 1 });
    b.n.p.x = 1150; b.n.p.dir = -1;
    const chien2 = sc.bete(B.chien, { x: 1300, y: SOL, s: 1, couche: 1, dir: -1, yeux: 1 }, gb);
    tl.set(sc.cam, { x: 960, y: 680, z: 1.4 }, 17);
    R.fonduEntree(tl, 17, 0.8);
    G.dialogue(tl, 19, [[b.n, 2.5], [b.z, 2.5]]);
    G.pointer(tl, b.z, 25, 3, 0.8);
    tl.set(b.n.p, { tete: 25 }, 25.5);
    R.cam(tl, sc, { y: 480, z: 0.9 }, 25, 5);
    R.expr(tl, b.n, 'serein', 27);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 4 · La traversée
  R.scene('La traversée', 40, (sc, tl) => {
    const d = DECORS.riviere(sc, { riveProche: false });
    const passeur = sc.perso(C.trapu, { haut: null, bas: { type: 'short', couleur: '#5a4a3a' }, tete: { type: 'chapeau', couleur: '#d9b26a' } }, { x: -250, y: 930 });
    const pagaie = passeur.tenir(D.baton(220, '#6b4527'), 'A', { vertical: true });
    const { z, n } = couple(sc, -100, null, { y: 930 });
    n.p.x = -380; n.p.y = 930;
    const chien = sc.bete(B.chien, { x: -170, y: 930, s: 0.9 });
    const pir = D.pirogue(sc.monde, -250, 948, 520);
    sc.cam.x = 760; sc.cam.y = 640; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 4.5, 'lieu_fleuve');
    const bouger = [passeur.p, z.p, n.p, chien.p];
    const dx = 1900;
    tl.to(bouger, { x: `+=${dx}`, duration: 28, ease: 'sine.inOut' }, 2);
    tl.to(pir, { x: -250 + dx, duration: 28, ease: 'sine.inOut' }, 2);
    tl.to(pir, { y: 940, duration: 1.2, yoyo: true, repeat: 22, ease: 'sine.inOut' }, 2);
    tl.to(passeur.p, { bA: 60, cA: 30, duration: 0.8, yoyo: true, repeat: 33, ease: 'sine.inOut' }, 2);
    R.cam(tl, sc, { x: 1500 }, 2, 28);
    G.exprFoule(tl, [z, n], 'peur', 6);
    tl.to(d.vagues, { x: -200, duration: 30, ease: 'none' }, 0);
    R.pose(tl, n, { bA: 60, cA: 110, bR: 60, cR: 110 }, 7, 0.4);
    G.exprFoule(tl, [z, n], 'serein', 16);
    R.pose(tl, n, { bA: 8, cA: 12, bR: -8, cR: 12 }, 16, 0.4);
    G.pointer(tl, z, 22, 4);
    R.expr(tl, z, 'joie', 23);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 5 · Le signe
  R.scene('Le signe', 36, (sc, tl) => {
    DECORS.brousse(sc, {});
    const arbre = D.cailcedrat(sc.monde, 1350, SOL + 6, 1.1);
    const { z, n } = couple(sc, -150);
    const chien = sc.bete(B.chien, { x: 0, y: SOL, s: 1 });
    sc.cam.x = 960; sc.cam.y = 560; sc.cam.z = 0.95;
    R.fonduEntree(tl, 0, 1);
    R.marche(tl, z, 800, 1, 6); R.marche(tl, n, 660, 1.3, 6); R.marche(tl, chien, 950, 1, 5, { pas: 12 });
    volDePintades(sc, tl, 1350, 460, 7, 18, 7);
    R.cartouche(tl, 8, 6, 'lieu_signe', 'droite');
    G.exprFoule(tl, [z, n], 'surprise', 8);
    [z, n].forEach((p) => R.pose(tl, p, { tete: 25 }, 8.5, 0.6));
    R.cam(tl, sc, { x: 1200, y: 480, z: 0.9 }, 9, 5);
    tl.to(chien.p, { gueule: 1, tete: -25, duration: 0.2, yoyo: true, repeat: 7 }, 10);
    G.pointer(tl, z, 15, 4, 0.7);
    R.parle(tl, z, 15.5, 3);
    R.expr(tl, n, 'joie', 18);
    R.marche(tl, z, 1180, 22, 4);
    R.marche(tl, n, 1060, 22.4, 4);
    R.pose(tl, [z, n][0], { tete: 0 }, 22, 0.4);
    R.cam(tl, sc, { x: 1150, y: 640, z: 1.15 }, 22, 5);
    R.fonduSortie(tl, 34.5, 1.5);
  });

  // =================================================================== 6 · La fondation
  R.scene('La fondation', 40, (sc, tl) => {
    DECORS.brousse(sc, { ciel: 'soir' });
    D.cailcedrat(sc.monde, 1350, SOL + 6, 1.1);
    const casePremiere = D.caseRonde(sc.monde, 780, SOL, 0.9, { couleur: '#b9713d' });
    gsap.set(casePremiere, { scale: 0, transformOrigin: '50% 100%' });
    const arcPlante = R.el('g', { opacity: 0 }, sc.monde);
    const a = D.arc(); a.setAttribute('transform', 'translate(1150,800)'); arcPlante.appendChild(a);
    const { z, n } = couple(sc, 1180);
    n.p.x = 1020;
    sc.cam.x = 1050; sc.cam.y = 640; sc.cam.z = 1.2;
    R.fonduEntree(tl, 0, 1);
    R.cartouche(tl, 1, 5, 'lieu_fondation');
    R.pose(tl, z, { lean: 30, bR: 60 }, 2, 0.6);
    tl.to(z.arc, { opacity: 0, duration: 0.2 }, 2.6);
    tl.to(arcPlante, { opacity: 1, duration: 0.2 }, 2.6);
    R.pose(tl, z, { lean: 0, bR: -8 }, 3, 0.5);
    G.prier(tl, z, 4, 4);
    G.agenouiller(tl, n, 4.3);
    G.relever(tl, n, 8);
    // Ils bâtissent la case
    R.marche(tl, z, 900, 9, 2); R.marche(tl, n, 700, 9.2, 2);
    G.piocher(tl, z, 11.5, 10, 0.9);
    n.tenir(D.pilon(160), 'A', { vertical: true });
    G.piler(tl, n, 11.5, 10, 0.9, 110);
    tl.to(casePremiere, { scale: 1, duration: 9, ease: 'power1.inOut' }, 12);
    R.cam(tl, sc, { x: 900, y: 600, z: 1 }, 14, 8);
    G.exprFoule(tl, [z, n], 'joie', 22);
    tl.set(z.p, { dir: -1 }, 23);
    R.pose(tl, z, { bA: 60, cA: 80 }, 24, 0.5);
    R.pose(tl, n, { bA: 60, cA: 80 }, 24.2, 0.5);
    R.cam(tl, sc, { x: 820, y: 640, z: 1.3 }, 25, 6);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 7 · Le village naissant
  R.scene('Le village naissant', 34, (sc, tl) => {
    DECORS.brousse(sc, {});
    D.cailcedrat(sc.monde, 1350, SOL + 6, 1.1);
    const cases = [[780, 0.9], [520, 0.8], [1700, 0.85]].map(([x, s]) => D.caseRonde(sc.monde, x, SOL, s, { couleur: '#b9713d' }));
    gsap.set(cases.slice(1), { scale: 0, transformOrigin: '50% 100%' });
    const { z, n } = couple(sc, 1000);
    n.p.x = 880;
    const bebe = sc.perso(C.bebe, null, { x: 0, y: 40, s: 0.8 });
    const familles = G.foule(sc, [[C.ronde, H.villageoise, -200, 1], [C.trapu, H.villageois, -350, 1], [C.ancien, null, -500, 1], [C.enfant, null, -620, 1]]);
    sc.cam.x = 960; sc.cam.y = 600; sc.cam.z = 1;
    R.fonduEntree(tl, 0, 1);
    familles.forEach((p, i) => R.marche(tl, p, 380 + i * -80 + 300, 1 + i * 0.3, 7));
    G.exprFoule(tl, familles, 'joie', 8);
    G.saluer(tl, z, 7, 2.5);
    G.incliner(tl, familles[2], 9, 2, 25);
    tl.to(cases.slice(1), { scale: 1, duration: 1, ease: 'back.out(1.5)', stagger: 1.5 }, 9);
    // Un enfant naît
    R.cam(tl, sc, { x: 900, y: 680, z: 1.5 }, 13, 3);
    tl.set(bebe.root, { opacity: 0 }, 0);
    n.tenir(bebe.root, 'A', { vertical: true });
    R.pose(tl, n, { bA: 70, cA: 90 }, 15, 0.5);
    tl.to(bebe.root, { opacity: 1, duration: 0.6 }, 15.5);
    R.expr(tl, bebe, 'rire', 16);
    R.expr(tl, n, 'joie', 16); R.expr(tl, z, 'joie', 16);
    G.exprFoule(tl, familles, 'joie', 16.5);
    G.danseFoule(tl, familles, 19, 11);
    R.cam(tl, sc, { x: 960, y: 580, z: 0.95 }, 19, 5);
    R.fonduSortie(tl, 32.5, 1.5);
  });

  // =================================================================== 8 · Les descendants
  R.scene('Les descendants', 26, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir' });
    const gens = G.foule(sc, [[C.ancien, null, 700, 1], [C.enfant, null, 860, -1], [C.fille, null, 960, -1], [C.ronde, H.villageoise, 1080, -1], [C.trapu, H.villageois, 1200, -1]]);
    sc.cam.x = 960; sc.cam.y = 620; sc.cam.z = 1.15;
    R.fonduEntree(tl, 0, 1.5);
    R.cartouche(tl, 1, 5, 'lieu_aujourdhui');
    G.dialogue(tl, 2, [[gens[0], 4]]);
    G.pointer(tl, gens[0], 3, 3, 0.5);
    G.exprFoule(tl, gens.slice(1), 'serein', 4);
    R.cam(tl, sc, { y: 520, z: 0.9 }, 7, 5);
    R.fonduSortie(tl, 11.5, 1.5);
    R.titre(tl, 13, 4, 'fin');
    R.generique(tl, 17.6, 8.4, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
