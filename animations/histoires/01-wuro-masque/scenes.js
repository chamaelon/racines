/*
 * 01 · Wuro et le masque de feuilles — animation (voir 00-ecriture/ecriture.md).
 * Chaque scène = une timeline locale ; les temps sont relatifs au début de la scène.
 */
(function () {
  const D = R.D, P = D.PAL, C = CASTING;
  R.init(document.getElementById('scene'));
  const SOL = 880;
  const { chute, montrer, cacher, objet } = R;

  // ---------------------------------------------------------------- Costumes de l'histoire
  // Les corps viennent du casting ; on ne change ici que les habits.
  const COSTUMES = {
    forgeron: { bas: { type: 'pagne', couleur: '#6b4226' }, ceinture: '#2b1a0e', bracelets: '#9aa0a8', collier: '#c9c9c9' },
    cultivateur: { haut: { type: 'tunique', couleur: '#c8553d', motif: 'bandes', motifCouleur: '#7a2a1a' }, bas: { type: 'short', couleur: '#e8dcc0' }, tete: null },
    jeune: { haut: { type: 'tunique', couleur: '#2f6c8f', motif: 'chevrons', motifCouleur: '#cfe4f2' }, bas: { type: 'short', couleur: '#e8dcc0' }, manches: '#2f6c8f' },
    mere: { haut: { type: 'camisole', couleur: '#5b8c5a' }, bas: { type: 'jupe', couleur: '#e9c46a', motif: 'chevrons', motifCouleur: '#7a4a25' }, tete: { type: 'foulard', couleur: '#c8553d' } },
    jeuneFemme: { haut: { type: 'camisole', couleur: '#e9c46a' }, bas: { type: 'jupe', couleur: '#2f6c8f', motif: 'points', motifCouleur: '#f6ead2' }, collier: '#d9653b' },
    enfant: { haut: { type: 'tunique', couleur: '#d9653b' }, bas: { type: 'short', couleur: '#3e5f3a' } },
    ancien: { haut: { type: 'boubou', couleur: '#efe0bd', motif: 'bandes', motifCouleur: '#7a4a25', long: 1.5 }, manches: '#efe0bd', tete: { type: 'bonnet', couleur: '#2f4a33' } },
  };
  const GENS = {
    ancien: C.ancien, mere: C.ronde, enfant: C.enfant,
    jeuneFemme: C.elancee, cultivateur: C.trapu, jeune: C.filiforme,
  };
  const gens = (sc, nom, pose, parent) => sc.perso(GENS[nom], COSTUMES[nom], pose, parent);
  const forgeronDe = (sc, pose, parent) => sc.perso(C.colosse, COSTUMES.forgeron, pose, parent);

  // ---------------------------------------------------------------- Aides propres à l'histoire
  /** Groupe qui masque tout ce qui passe sous le sol (pour sortir de terre). */
  function sousSol(parent, y) {
    const cid = R.id('sol');
    const cp = R.el('clipPath', { id: cid }, R.defs);
    R.el('rect', { x: -3000, y: -4000, width: 8000, height: 4000 + y }, cp);
    return R.el('g', { 'clip-path': `url(#${cid})` }, parent);
  }
  /** Position de départ sous terre, puis montée jusqu'au sol. */
  const enTerre = (def) => SOL + def.taille + 30;
  function surgir(tl, p, at, duree) {
    tl.to(p.p, { y: SOL, duration: duree || 2, ease: 'power2.out' }, at);
  }

  /** Flammes qui vacillent pendant `duree`. */
  function flamber(tl, feu, at, duree) {
    tl.fromTo(feu.flammes, { scaleY: 1, scaleX: 1 }, { scaleY: 0.78, scaleX: 1.1, transformOrigin: '50% 100%', duration: 0.22, yoyo: true, repeat: Math.round(duree / 0.22), ease: 'sine.inOut', immediateRender: false }, at);
    tl.fromTo(feu.lueur, { opacity: 0.4 }, { opacity: 0.26, duration: 0.35, yoyo: true, repeat: Math.round(duree / 0.35), ease: 'sine.inOut', immediateRender: false }, at);
  }

  /** Le forgeron, assis, frappe l'enclume : n coups de période `per`, étincelles à chaque coup. */
  function forger(tl, p, at, n, per, pool) {
    for (let i = 0; i < n; i++) {
      const t = at + i * per;
      tl.to(p.p, { bA: 170, cA: 40, lean: 0, duration: per * 0.55, ease: 'power1.out' }, t);
      tl.to(p.p, { bA: 95, cA: 0, lean: 25, duration: per * 0.45, ease: 'power3.in' }, t + per * 0.55);
      if (pool) R.jaillir(tl, pool, t + per, i, { n: 6, ecart: 16, haut: 45, duree: 0.45 });
    }
  }

  /** Cultiver à la houe : n coups de période `per`. */
  function piocher(tl, p, at, n, per) {
    for (let i = 0; i < n; i++) {
      const t = at + i * per;
      tl.to(p.p, { bA: 160, cA: 25, bR: 155, cR: 25, lean: 0, duration: per * 0.55, ease: 'power1.out' }, t);
      tl.to(p.p, { bA: 70, cA: 5, bR: 65, cR: 5, lean: 30, duration: per * 0.45, ease: 'power3.in' }, t + per * 0.55);
    }
    tl.to(p.p, { bA: 8, cA: 12, bR: -8, cR: 12, lean: p.def.pose && p.def.pose.lean || 0, duration: 0.4 }, at + n * per);
  }

  /** Les anneaux du tourbillon ondulent pendant `duree`. */
  function tourbillonner(tl, tb, at, duree) {
    // repeat dans `stagger` : chaque anneau se répète (sinon c'est toute la vague qui se répète)
    tl.fromTo(tb.anneaux, { x: -16 }, { x: 16, duration: 0.3, ease: 'sine.inOut', stagger: { each: 0.07, repeat: Math.round(duree / 0.3), yoyo: true }, immediateRender: false }, at);
  }

  /** Applaudir sur place. */
  function applaudir(tl, p, at, duree) {
    R.pose(tl, p, { bA: 70, cA: 75, bR: 70, cR: 75 }, at, 0.3);
    tl.to(p.p, { cA: 95, cR: 55, duration: 0.18, yoyo: true, repeat: Math.round(duree / 0.18), ease: 'sine.inOut' }, at + 0.3);
    R.pose(tl, p, { bA: 8, cA: 12, bR: -8, cR: 12 }, at + duree + 0.5, 0.4);
  }

  /** Saluer de la main levée. */
  function saluer(tl, p, at, duree) {
    R.pose(tl, p, { bA: 150, cA: 20 }, at, 0.4);
    tl.to(p.p, { cA: -15, duration: 0.25, yoyo: true, repeat: Math.round(duree / 0.25), ease: 'sine.inOut' }, at + 0.4);
  }

  /** Petit costume de feuilles porté à bras (échelle réduite), qui frissonne. */
  function masquePorte(sc, perso, s) {
    const m = D.masqueFeuilles(null, 18, 300 * s * 0.55, s);
    sc.anime(m);
    perso.tenir(objet(m, false), 'A', { vertical: true });
    return m;
  }

  // =================================================================== 1 · Le commencement
  R.scene('Le commencement', 30, (sc, tl) => {
    const d = DECORS.cosmos(sc);
    // L'aube en deux temps (aurore puis jour) : un seul fondu noir → bleu passerait par le gris.
    const aurore = sc.calque();
    D.ciel(aurore, '#27306a', '#ef8a4c');
    gsap.set(aurore, { opacity: 0 });
    const aube = sc.calque();
    D.ciel(aube, '#7fb0d8', '#f6c27a');
    gsap.set(aube, { opacity: 0 });
    const astre = sc.calque();
    const soleil = D.soleil(astre, 0, 0, 85, '#ffd166');
    gsap.set(soleil, { x: 1450, y: 920, opacity: 0 });
    const terre = sc.calque();
    D.collines(terre, 770, '#a87a50', 5, 60);
    D.sol(terre, SOL, P.terre, P.terreSombre);
    gsap.set(terre, { y: 700 });
    const arbres = sc.calque();
    const plantes = [[260, 880, 'karite', 0.9], [610, 885, 'baobab', 0.85], [1330, 875, 'karite', 0.75], [1720, 885, 'ronier', 1], [-160, 880, 'baobab', 1.1], [2060, 880, 'karite', 1]].map(([x, y, f, s]) => {
      const w = R.el('g', {}, arbres);
      D[f](w, x, y, s);
      gsap.set(w, { scale: 0, svgOrigin: `${x} ${y}` });
      return w;
    });
    const boule = D.lumiere(sc.monde, 960, 470, 30, '#ffe7a3');
    const wuro = sc.perso(C.geant, null, { x: 960, y: 700, alpha: 0, lueur: 1 });
    const feu = objet(D.lumiere(null, 0, 0, 16, '#ff9a3c'), false);
    wuro.tenir(feu, 'A');
    const vol = D.lumiere(sc.monde, 0, 0, 16, '#ff9a3c');
    vol.setAttribute('opacity', 0);
    sc.cam.z = 1.15;

    R.fonduEntree(tl, 0, 1.5);
    tl.fromTo(boule, { scale: 0.1, transformOrigin: '50% 50%' }, { scale: 3, duration: 3.5, ease: 'power2.out' }, 0);
    R.titre(tl, 1.5, 5.5, 'titre', 'sous_titre', 820);
    tl.to(wuro.p, { alpha: 1, duration: 2 }, 4);
    tl.to(boule, { opacity: 0, duration: 2 }, 5);
    tl.to(wuro.p, { y: 680, duration: 2, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 4);
    R.expr(tl, wuro, 'serein', 4);
    // La terre monte
    R.pose(tl, wuro, { bA: 50, bR: 50, cA: 30, cR: 30 }, 7.4, 0.8);
    tl.to(terre, { y: 0, duration: 2.4, ease: 'power2.out' }, 7.8);
    R.cam(tl, sc, { z: 0.95, y: 520 }, 7.5, 4);
    // La boule de feu devient soleil
    R.pose(tl, wuro, { bA: 35, cA: 95, bR: 30, cR: 95, tete: -14 }, 10.6, 0.8);
    montrer(tl, feu, 11.2, 0.5);
    R.expr(tl, wuro, 'joie', 11.4);
    R.pose(tl, wuro, { bA: 40, cA: 70, lean: -8, tete: 0 }, 12.5, 0.45);
    R.pose(tl, wuro, { bA: 120, cA: 0, lean: 6 }, 12.95, 0.22, 'power3.out');
    cacher(tl, feu, 13.15, 0.05);
    tl.fromTo(vol, { x: 1110, y: 300, opacity: 1 }, { x: 1450, y: 830, duration: 0.8, ease: 'power1.in', immediateRender: false }, 13.15);
    tl.to(vol, { opacity: 0, duration: 0.2 }, 13.95);
    tl.set(soleil, { opacity: 1 }, 13.9);
    tl.to(soleil, { y: 250, duration: 3.5, ease: 'power2.out' }, 13.9);
    tl.to(aurore, { opacity: 1, duration: 2.2 }, 13.8);
    tl.to(aube, { opacity: 1, duration: 3.5 }, 16.2);
    tl.to(d.etoiles, { opacity: 0, duration: 3 }, 14.5);
    R.pose(tl, wuro, { bA: 8, cA: 12, bR: -8, cR: 12, lean: 0 }, 14, 0.8);
    // Les arbres
    R.pose(tl, wuro, { bA: 150, bR: 150, cA: 10, cR: 10 }, 17, 0.6);
    R.expr(tl, wuro, 'rire', 17.2);
    tl.to(plantes, { scale: 1, duration: 0.9, ease: 'back.out(1.7)', stagger: 0.25 }, 17.4);
    R.pose(tl, wuro, { bA: 8, bR: -8, cA: 12, cR: 12 }, 19.2, 0.6);
    R.expr(tl, wuro, 'joie', 19.2);
    R.cartouche(tl, 19.5, 5, 'perso_wuro');
    // Wuro pose le pied sur la terre
    tl.to(wuro.p, { y: SOL, duration: 3, ease: 'power2.inOut' }, 20.2);
    R.pose(tl, wuro, { regard: -1 }, 23.5, 0.4);
    R.pose(tl, wuro, { regard: 1 }, 24.6, 0.4);
    R.pose(tl, wuro, { regard: 0 }, 25.8, 0.4);
    R.cam(tl, sc, { z: 0.85, y: 500 }, 23, 5.5);
    R.fonduSortie(tl, 28.5, 1.5);
  });

  // =================================================================== 2 · Le premier homme
  const WURO_X = 740, HOMME_X = 1020, FEU_X = 930, SIEGE_X = 1105, ENC_X = 1295;
  R.scene('Le premier homme', 40, (sc, tl) => {
    DECORS.brousse(sc);
    const objets = sc.calque();
    const feu = D.feu(objets, FEU_X, SOL + 2, 1);
    gsap.set(feu, { scale: 0, transformOrigin: '50% 100%' });
    const siege = R.el('g', { opacity: 0 }, objets);
    D.siege(siege, SIEGE_X - 4, SOL, 70, 52);
    const enclume = D.enclume(objets, ENC_X, SOL, 1.2);
    gsap.set(enclume, { scale: 0, transformOrigin: '50% 100%' });
    const pied = sousSol(sc.monde, SOL);
    const homme = forgeronDe(sc, { x: HOMME_X, y: enTerre(C.colosse), dir: -1, yeux: 1, sourire: 0 }, pied);
    const wuro = sc.perso(C.geant, null, { x: -300, y: SOL, lueur: 0.6 });
    const boule = objet(D.lumiere(null, 0, 0, 14, '#ff9a3c'), false); wuro.tenir(boule, 'A');
    const marteauW = objet(D.marteau(), false); wuro.tenir(marteauW, 'A');
    const marteauH = objet(D.marteau(), false); homme.tenir(marteauH, 'A');
    const houe = objet(D.houe(), false); homme.tenir(houe, 'A');
    const devant = sc.calque();
    const tertre = R.el('ellipse', { cx: HOMME_X, cy: SOL + 4, rx: 115, ry: 0, fill: P.terreSombre, stroke: '#7a4522', 'stroke-width': 3 }, devant);
    const eclat = D.lumiere(devant, ENC_X, SOL - 60, 16, '#bfd6ff'); eclat.setAttribute('opacity', 0);
    const etincelles = D.particules(devant, 36, ENC_X - 4, SOL - 78, '#ffcf5a', 3);
    sc.cam.x = 880; sc.cam.y = 600; sc.cam.z = 1.05;

    R.fonduEntree(tl, 0, 1.2);
    R.cartouche(tl, 0.8, 4.5, 'lieu_terre');
    R.marche(tl, wuro, WURO_X, 1, 5);
    // Wuro s'accroupit et modèle le tertre
    R.pose(tl, wuro, { assis: 1, lean: 45, bA: 80, cA: 10, bR: 75, cR: 10 }, 6.2, 1.4);
    R.expr(tl, wuro, 'serein', 6.6);
    tl.to(wuro.p, { cA: 34, cR: 30, duration: 0.4, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 7.6);
    tl.to(tertre, { attr: { ry: 72 }, duration: 2, ease: 'power2.out' }, 7.6);
    R.cam(tl, sc, { x: 900, y: 640, z: 1.25 }, 7, 4);
    // Le premier homme sort de terre
    surgir(tl, homme, 9.6, 3);
    tl.to(tertre, { attr: { ry: 0 }, duration: 1.6, ease: 'power1.in' }, 11);
    R.pose(tl, homme, { yeux: 0 }, 13, 0.6);
    R.expr(tl, homme, 'surprise', 13.6);
    R.pose(tl, homme, { bA: 95, cA: 80, bR: 90, cR: 80, tete: -18 }, 14.2, 1);
    R.pose(tl, wuro, { assis: 0, lean: 0, bA: 8, cA: 12, bR: -8, cR: 12 }, 15.3, 1.5);
    R.expr(tl, wuro, 'joie', 15.5);
    R.pose(tl, homme, { tete: 16, bA: 8, cA: 12, bR: -8, cR: 12 }, 16.2, 0.8);
    R.expr(tl, homme, 'joie', 17);
    R.cartouche(tl, 16.5, 5, 'perso_forgeron', 'droite');
    R.cam(tl, sc, { x: 880, y: 600, z: 1.05 }, 15.5, 2.5);
    // Le feu
    R.pose(tl, wuro, { bA: 35, cA: 95, bR: 30, cR: 95 }, 18, 0.6);
    montrer(tl, boule, 18.4, 0.4);
    R.pose(tl, wuro, { assis: 1, lean: 40, bA: 75, cA: 0, bR: 65, cR: 20 }, 19, 1.1);
    cacher(tl, boule, 20.1, 0.1);
    tl.to(feu, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 20.1);
    flamber(tl, feu, 20.6, 19);
    R.expr(tl, homme, 'peur', 20.2, 0.15);
    tl.to(homme.p, { x: 1085, lean: -12, duration: 0.5 }, 20.2);
    R.pose(tl, wuro, { assis: 0, lean: 0, bA: 8, cA: 12, bR: -8, cR: 12 }, 21, 1.2);
    R.expr(tl, homme, 'joie', 21.6);
    R.pose(tl, homme, { lean: 10, bA: 70, cA: 25, bR: 65, cR: 25, tete: -8 }, 21.8, 0.6);
    // L'enclume et le marteau
    R.pose(tl, wuro, { bA: 100, cA: 0, regard: 1 }, 23, 0.5);
    tl.to(enclume, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 23.6);
    tl.to(siege, { opacity: 1, duration: 0.4 }, 23.6);
    tl.fromTo(eclat, { opacity: 1, scale: 1, transformOrigin: '50% 50%' }, { opacity: 0, scale: 5, duration: 0.8, immediateRender: false }, 23.6);
    R.pose(tl, homme, { lean: 0, bA: 8, cA: 12, bR: -8, cR: 12, tete: 0 }, 23.6, 0.4);
    R.expr(tl, homme, 'surprise', 23.7);
    R.pose(tl, wuro, { bA: 8, regard: 0 }, 24.4, 0.4);
    montrer(tl, marteauW, 24.8, 0.3);
    R.pose(tl, wuro, { bA: 75, cA: 5 }, 25, 0.8);
    R.pose(tl, homme, { tete: 10, bA: 80, cA: 5 }, 25.6, 0.5);
    cacher(tl, marteauW, 26.2, 0.1); montrer(tl, marteauH, 26.2, 0.1);
    R.pose(tl, wuro, { bA: 8, cA: 12 }, 26.4, 0.5);
    R.pose(tl, homme, { bA: 125, cA: 60, tete: 6 }, 26.5, 0.5);
    R.expr(tl, homme, 'joie', 26.6);
    // Il forge la première houe
    tl.set(homme.p, { dir: 1 }, 27.3);
    R.pose(tl, homme, { bA: 8, cA: 12, tete: 0 }, 27.3, 0.3);
    R.marche(tl, homme, SIEGE_X, 27.4, 1.1, { pas: 2 });
    R.pose(tl, homme, { assis: 1 }, 28.6, 0.7);
    R.cam(tl, sc, { x: 1150, y: 690, z: 1.45 }, 28, 2.5);
    forger(tl, homme, 29.5, 6, 0.88, etincelles);
    R.expr(tl, homme, 'colere', 29.4);
    cacher(tl, marteauH, 34.9, 0.1); montrer(tl, houe, 34.9, 0.1);
    R.pose(tl, homme, { assis: 0, lean: 0, bA: 165, cA: 0, tete: 10 }, 35, 0.9);
    R.expr(tl, homme, 'joie', 35.2);
    R.cam(tl, sc, { x: 960, y: 600, z: 1.05 }, 35, 2.5);
    R.expr(tl, wuro, 'rire', 35.8);
    tl.to(wuro.p, { tete: 8, duration: 0.3, yoyo: true, repeat: 3 }, 36);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 3 · Les hommes
  R.scene('Les hommes', 40, (sc, tl) => {
    const v = DECORS.village(sc, {});
    const champ = D.mil(sc.calque(), 950, 1760, 862, 14, 41, { h: 80, profondeur: 14 });
    champ.tiges.forEach((t) => gsap.set(t, { scaleY: 0, svgOrigin: '0 0' }));
    const wuro = sc.perso(C.geant, null, { x: 300, y: SOL, lueur: 0.6 });
    const forgeron = forgeronDe(sc, { x: 790, y: SOL });
    forgeron.tenir(D.houe(), 'A');
    const pied = sousSol(sc.monde, SOL);
    const ordre = [['ancien', 960], ['mere', 1105], ['enfant', 1235], ['jeuneFemme', 1365], ['cultivateur', 1515], ['jeune', 1665]];
    const foule = ordre.map(([nom, x]) => {
      const p = gens(sc, nom, { x, y: enTerre(GENS[nom]), dir: -1 }, pied);
      const h = objet(D.houe(), false); p.tenir(h, 'A');
      return { p, x, h };
    });
    sc.cam.x = 900; sc.cam.y = 600; sc.cam.z = 0.95;

    R.fonduEntree(tl, 0, 1.2);
    tl.from(v.maisons.concat(v.greniers), { scale: 0, transformOrigin: '50% 100%', duration: 0.8, ease: 'back.out(1.6)', stagger: 0.45 }, 0.8);
    R.cartouche(tl, 2, 5, 'lieu_village');
    R.expr(tl, forgeron, 'joie', 2);
    // Wuro fait sortir les hommes de terre
    R.pose(tl, wuro, { bA: 130, bR: 130, cA: 10, cR: 10 }, 6, 1);
    R.expr(tl, wuro, 'joie', 6);
    foule.forEach(({ p }, i) => {
      surgir(tl, p, 7 + i * 0.5, 2);
      R.expr(tl, p, 'surprise', 9 + i * 0.5);
      R.expr(tl, p, 'joie', 10.5 + i * 0.4);
    });
    R.pose(tl, wuro, { bA: 8, bR: -8, cA: 12, cR: 12 }, 12, 0.8);
    // Le forgeron leur donne des houes
    R.marche(tl, forgeron, 1830, 13, 6);
    foule.forEach(({ x, h }) => montrer(tl, h, 13 + ((x - 790) / 1040) * 6, 0.3));
    R.cam(tl, sc, { x: 1150 }, 13, 6);
    // Tous cultivent ; le mil sort de terre
    foule.forEach(({ p }, i) => {
      tl.set(p.p, { dir: 1 }, 19.3);
      piocher(tl, p, 19.6 + (i % 3) * 0.08, 8, 0.9);
    });
    piocher(tl, forgeron, 19.6, 8, 0.9);
    tl.to(champ.tiges, { scaleY: 1, duration: 1.2, ease: 'back.out(1.5)', stagger: 0.35 }, 21);
    R.cam(tl, sc, { x: 1120, z: 0.85 }, 22, 5);
    // Wuro salue et s'éloigne dans le ciel
    foule.concat([{ p: forgeron }]).forEach(({ p }, i) => {
      tl.set(p.p, { dir: -1 }, 27.6 + i * 0.1);
      R.pose(tl, p, { tete: 14 }, 27.8, 0.5);
    });
    R.expr(tl, wuro, 'serein', 27.5);
    saluer(tl, wuro, 28, 3);
    foule.forEach(({ p }, i) => { if (i % 2 === 0) saluer(tl, p, 29.2 + i * 0.1, 2.6); });
    tl.to(wuro.p, { y: -300, s: 0.55, lueur: 1, duration: 6, ease: 'power1.in' }, 31.2);
    tl.to(wuro.p, { alpha: 0, duration: 3 }, 34);
    foule.concat([{ p: forgeron }]).forEach(({ p }, i) => {
      R.pose(tl, p, { tete: 30, bA: 8, cA: 12 }, 32 + i * 0.15, 1);
      R.expr(tl, p, 'triste', 35.5 + i * 0.1);
    });
    R.cam(tl, sc, { y: 480, x: 800 }, 31, 6);
    R.fonduSortie(tl, 38.5, 1.5);
  });

  // =================================================================== 4 · Le désordre
  R.scene('Le désordre', 45, (sc, tl) => {
    // 4a · La dispute du champ (0–14)
    const ga = R.plan(sc, tl, 0, 14);
    DECORS.champ(ga.sous, { vert: true });
    const piquet = R.el('g', { transform: `translate(960,${900 - 64})` }, ga);
    piquet.appendChild(D.baton(160, '#5b3a24'));
    const cult = gens(sc, 'cultivateur', { x: 790, y: 900 }, ga);
    const jeune = gens(sc, 'jeune', { x: 1135, y: 900, dir: -1 }, ga);
    const houeC = cult.tenir(D.houe(), 'A');
    const houeJ = jeune.tenir(D.houe(), 'A');
    tl.set(sc.cam, { x: 960, y: 650, z: 1.3 }, 0);
    R.fonduEntree(tl, 0, 1);
    piocher(tl, cult, 0.4, 4, 0.9);
    piocher(tl, jeune, 0.7, 4, 0.9);
    R.expr(tl, cult, 'colere', 4.4); R.expr(tl, jeune, 'colere', 4.4);
    cacher(tl, houeC, 4.4, 0.2); cacher(tl, houeJ, 4.4, 0.2);
    R.parle(tl, cult, 4.6, 3); R.parle(tl, jeune, 4.9, 2.7);
    R.pose(tl, jeune, { bA: 70, cA: 0 }, 5, 0.4);
    tl.to(cult.p, { tete: 10, duration: 0.25, yoyo: true, repeat: 5 }, 5.2);
    R.pose(tl, jeune, { bA: 8, cA: 12 }, 7, 0.4);
    // Ils se poussent, l'un tombe
    R.pose(tl, cult, { lean: 22, bA: 85, cA: 5, bR: 80, cR: 5 }, 7.6, 0.4);
    R.pose(tl, jeune, { lean: 24, bA: 85, cA: 5, bR: 80, cR: 5 }, 7.7, 0.4);
    tl.to(cult.p, { lean: 8, duration: 0.3, yoyo: true, repeat: 3 }, 8);
    tl.to(jeune.p, { lean: 10, duration: 0.3, yoyo: true, repeat: 3 }, 8.15);
    R.pose(tl, cult, { lean: 30, bA: 95, cA: 0 }, 9.4, 0.18, 'power3.out');
    tl.to(jeune.p, { rot: 82, x: 1200, duration: 0.45, ease: 'power2.in' }, 9.55);
    R.expr(tl, jeune, 'douleur', 9.55, 0.05);
    R.secousse(tl, sc, 10, 14, 0.4);
    R.expr(tl, cult, 'surprise', 10.2);
    R.pose(tl, cult, { lean: 0, bA: 8, cA: 12, bR: -8, cR: 12 }, 10.4, 0.5);
    tl.to(jeune.p, { rot: 0, x: 1135, lean: 0, bA: 8, bR: -8, cA: 12, cR: 12, duration: 1, ease: 'power2.out' }, 11.3);
    R.expr(tl, jeune, 'colere', 11.9);
    R.expr(tl, cult, 'colere', 12.1);
    tl.to([cult.p, jeune.p], { bob: 3, duration: 0.25, yoyo: true, repeat: 3 }, 12.3);
    R.fonduSortie(tl, 13.4, 0.6);

    // 4b · Le tourbillon (14–27)
    const gb = R.plan(sc, tl, 14, 27);
    const vb = DECORS.village(gb.sous, { ciel: 'chaud' });
    const mere = gens(sc, 'mere', { x: 620, y: SOL }, gb);
    const enfant = gens(sc, 'enfant', { x: 740, y: SOL, dir: -1 }, gb);
    const femme = gens(sc, 'jeuneFemme', { x: 1180, y: SOL, dir: -1 }, gb);
    const tb = D.tourbillon(gb, 1.1);
    gsap.set(tb, { x: 2500, y: SOL });
    const toit = vb.greniers[1].toit;
    tl.set(sc.cam, { x: 1000, y: 620, z: 1 }, 14);
    R.fonduEntree(tl, 14, 0.6);
    tourbillonner(tl, tb, 14, 13);
    tl.to(tb, { x: -600, duration: 10.5, ease: 'power1.inOut' }, 14.5);
    R.expr(tl, femme, 'peur', 16.2);
    R.pose(tl, femme, { tete: 10 }, 16.2, 0.3);
    R.marche(tl, femme, -300, 16.8, 3.6, { pas: 9 });
    tl.to(toit, { x: -380, y: -620, rotation: -220, transformOrigin: '50% 50%', duration: 2.6, ease: 'power1.out' }, 18.3);
    R.expr(tl, mere, 'peur', 17.5); R.expr(tl, enfant, 'peur', 17.5);
    R.pose(tl, mere, { lean: 22, bA: 165, cA: 120, bR: 160, cR: 120, tete: -10 }, 19.2, 0.5);
    tl.set(enfant.p, { dir: 1 }, 19);
    R.marche(tl, enfant, 680, 19.1, 0.5, { pas: 2 });
    R.pose(tl, enfant, { bA: 160, cA: 130, bR: 160, cR: 130, lean: 10 }, 19.6, 0.4);
    tl.to([mere.p, enfant.p], { x: '+=7', duration: 0.06, yoyo: true, repeat: 21 }, 20.3);
    R.secousse(tl, sc, 20.4, 10, 1.2);
    // L'enfant pleure
    R.pose(tl, mere, { lean: 0, bA: 70, cA: 80, bR: 70, cR: 80, tete: 0 }, 22.6, 0.6);
    R.pose(tl, enfant, { bA: 8, cA: 12, bR: -8, cR: 12, lean: 0 }, 22.6, 0.5);
    R.expr(tl, enfant, 'triste', 22.8);
    tl.to(enfant.p, { bouche: 0.8, duration: 0.3, yoyo: true, repeat: 7 }, 23);
    R.expr(tl, mere, 'triste', 23);
    R.cam(tl, sc, { x: 760, z: 1.3, y: 680 }, 22.4, 3.5);
    R.fonduSortie(tl, 26.4, 0.6);

    // 4c · La forge éteinte (27–45)
    const gc = R.plan(sc, tl, 27, 45);
    DECORS.village(gc.sous, { ciel: 'nuit', nuit: true });
    const cendres = D.feu(gc, 1010, SOL + 2, 1);
    gsap.set(cendres.flammes, { scale: 0 });
    gsap.set(cendres.lueur, { opacity: 0 });
    D.enclume(gc, 1220, SOL, 1.2);
    D.siege(gc, 850, SOL, 70, 52);
    const forgeron = forgeronDe(sc, Object.assign({ x: 855, y: SOL, assis: 1, lean: 18, tete: -10 }, R.EXPRESSIONS.triste), gc);
    const etoile = D.lumiere(gc, 760, 170, 9, '#ffe7a3');
    gsap.set(etoile, { scale: 0.5, transformOrigin: '50% 50%' });
    tl.set(sc.cam, { x: 1000, y: 620, z: 1.25 }, 27);
    R.fonduEntree(tl, 27, 0.8);
    R.pose(tl, forgeron, { tete: -20, lean: 26 }, 28.5, 1.6);
    R.pose(tl, forgeron, { assis: 0, lean: 0, tete: 0 }, 31, 1.2);
    R.pose(tl, forgeron, { tete: 30 }, 32.4, 0.8);
    R.cam(tl, sc, { y: 520, z: 1.05, x: 1000 }, 32.5, 4.5);
    R.pose(tl, forgeron, { bA: 165, bR: 160, cA: 10, cR: 10 }, 33.2, 1);
    R.parle(tl, forgeron, 33.8, 3.4);
    tl.to(etoile, { scale: 2.6, duration: 2, ease: 'power2.out' }, 36.5);
    tl.to(etoile, { x: 1700, y: 760, scale: 1.4, duration: 2.6, ease: 'sine.inOut' }, 39);
    R.pose(tl, forgeron, { bA: 8, bR: -8, cA: 12, cR: 12 }, 39.4, 0.8);
    R.pose(tl, forgeron, { tete: 0, regard: 1 }, 39.4, 2.4);
    R.expr(tl, forgeron, 'surprise', 37);
    R.marche(tl, forgeron, 1010, 42, 1.5, { pas: 2 });
    R.fonduSortie(tl, 43.5, 1.5);
  });

  // =================================================================== 5 · La révélation
  const MASQUE_X = 1600;
  R.scene('La révélation', 55, (sc, tl) => {
    const b = DECORS.bois(sc, { ciel: 'nuit' });
    const objets = sc.calque();
    const masque = D.masqueFeuilles(objets, MASQUE_X, SOL, 1);
    sc.anime(masque);
    gsap.set(masque, { opacity: 0, scale: 0.7, transformOrigin: '50% 100%' });
    const forgeron = forgeronDe(sc, { x: -200, y: SOL });
    const masqueF = masquePorte(sc, forgeron, 0.55);
    const wuro = sc.perso(C.geant, null, { x: 1080, y: SOL, dir: -1, alpha: 0, lueur: 1 });
    const masqueW = masquePorte(sc, wuro, 0.55);
    const dwo = sc.perso(C.dwo, null, { x: MASQUE_X, y: SOL, dir: -1, alpha: 0, frisson: 1.2 });
    const touche = D.lumiere(sc.monde, MASQUE_X, 590, 16, '#ffe7a3'); touche.setAttribute('opacity', 0);
    // Feuilles qui tombent de l'arbre et forment le costume
    const vols = R.el('g', {}, sc.monde), r = R.rng(5);
    for (let i = 0; i < 40; i++) {
      const f = R.el('ellipse', { cx: 0, cy: 0, rx: 7, ry: 15, fill: ['#5f8d3a', '#76a050', '#4c7330', '#b5893b'][i % 4], opacity: 0 }, vols);
      gsap.set(f, { x: 1480 + (r() - 0.5) * 420, y: 420 + r() * 220, rotation: r() * 180, transformOrigin: '50% 50%' });
      const t0 = 15 + r() * 1.2;
      tl.to(f, { opacity: 1, duration: 0.3 }, t0);
      tl.to(f, { x: 1560 + (r() - 0.5) * 380, y: 560 + r() * 160, rotation: '+=240', duration: 2, ease: 'sine.inOut' }, t0);
      tl.to(f, { x: MASQUE_X + (r() - 0.5) * 90, y: 600 + r() * 260, rotation: '+=200', duration: 1.6, ease: 'power2.in' }, t0 + 2);
      tl.to(f, { opacity: 0, duration: 0.4 }, 19.3);
    }
    const eclats = D.particules(sc.monde, 36, MASQUE_X, 700, '#6a9a35', 8);
    b.devant();
    sc.cam.x = 1000; sc.cam.y = 600; sc.cam.z = 0.95;

    R.fonduEntree(tl, 0, 1.2);
    R.cartouche(tl, 0.8, 4.5, 'lieu_bois');
    R.pose(tl, forgeron, { sourcils: -0.4, sourcilsH: 0.6, sourire: 0 }, 1, 0.4);
    R.marche(tl, forgeron, 650, 1, 5, { pas: 7 });
    [2.5, 4, 5.5].forEach((t, i) => R.pose(tl, forgeron, { regard: i % 2 ? -1 : 1, tete: i % 2 ? -6 : 8 }, t, 0.5));
    // Wuro apparaît
    chute(tl, sc.monde, '#ffe7a3', 1080, 760, 6.3, 0.7);
    tl.to(wuro.p, { alpha: 1, duration: 0.4 }, 7);
    R.expr(tl, wuro, 'serein', 7);
    R.expr(tl, forgeron, 'surprise', 7.2);
    R.pose(tl, forgeron, { regard: 0, tete: 10 }, 7.2, 0.3);
    R.pose(tl, forgeron, { assis: 0.75, lean: 25, tete: -12 }, 7.9, 1);
    R.cam(tl, sc, { x: 900, z: 1.05, y: 620 }, 7, 3);
    R.pose(tl, wuro, { bA: 100, cA: -10 }, 9.3, 0.6);
    R.pose(tl, wuro, { bA: 140, cA: 0 }, 10.3, 0.5);
    R.pose(tl, forgeron, { assis: 0, lean: 0, tete: 14 }, 10.6, 1);
    R.expr(tl, forgeron, 'neutre', 10.8);
    R.pose(tl, wuro, { bA: 8, cA: 12 }, 11.2, 0.5);
    // Il conduit le forgeron au grand arbre
    tl.set(wuro.p, { dir: 1 }, 11.8);
    R.marche(tl, wuro, 1250, 12, 2);
    R.marche(tl, forgeron, 900, 12.5, 2);
    R.cam(tl, sc, { x: 1200, z: 0.9, y: 560 }, 12, 3);
    R.pose(tl, wuro, { bA: 150, bR: 140, cA: 10, cR: 10, tete: 15 }, 14.4, 1);
    R.pose(tl, forgeron, { tete: 25, regard: 1 }, 15, 0.6);
    R.expr(tl, forgeron, 'surprise', 16);
    tl.to(masque, { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.4)' }, 19.2);
    R.pose(tl, wuro, { bA: 8, bR: -8, cA: 12, cR: 12, tete: 0 }, 19.6, 0.6);
    R.pose(tl, forgeron, { tete: 5 }, 20, 0.6);
    // Wuro touche le costume : Dwo s'anime
    R.marche(tl, wuro, 1400, 20.5, 1.5);
    R.pose(tl, wuro, { bA: 85, cA: 0 }, 22.1, 0.6);
    tl.fromTo(touche, { opacity: 1, scale: 1, transformOrigin: '50% 50%' }, { opacity: 0, scale: 6, duration: 1, immediateRender: false }, 22.8);
    tl.to(masque, { opacity: 0, duration: 0.1 }, 23);
    tl.to(dwo.p, { alpha: 1, duration: 0.1 }, 23);
    R.saut(tl, dwo, 23.3, 30, 0.5);
    R.expr(tl, forgeron, 'peur', 23.2);
    tl.to(forgeron.p, { x: 860, lean: -10, duration: 0.5 }, 23.2);
    R.pose(tl, wuro, { bA: 8, cA: 12 }, 23.2, 0.5);
    R.cartouche(tl, 23.8, 5, 'perso_dwo', 'droite');
    R.cam(tl, sc, { x: 1380, z: 1.15, y: 600 }, 23.5, 2.5);
    // Dwo s'incline devant son père
    R.pose(tl, dwo, { lean: 35, tete: 10 }, 24.5, 0.6);
    R.pose(tl, wuro, { bA: 85, cA: 50 }, 25, 0.6);
    R.expr(tl, wuro, 'joie', 25.2);
    tl.to(wuro.p, { cA: 40, duration: 0.3, yoyo: true, repeat: 3 }, 25.7);
    R.pose(tl, dwo, { lean: 0, tete: 0 }, 27.2, 0.6);
    R.pose(tl, wuro, { bA: 8, cA: 12 }, 27.2, 0.5);
    R.pose(tl, forgeron, { lean: 0 }, 27, 0.5);
    R.expr(tl, forgeron, 'surprise', 27.5);
    // « Toi, porte-le »
    R.cam(tl, sc, { x: 1150, z: 0.95, y: 590 }, 27.5, 2);
    tl.set(wuro.p, { dir: -1 }, 28);
    R.parle(tl, wuro, 28, 5);
    R.pose(tl, wuro, { bA: 95, cA: 0 }, 28.3, 0.5);
    R.pose(tl, forgeron, { bA: 60, cA: 120 }, 29, 0.5);
    tl.set(wuro.p, { dir: 1 }, 29.8);
    R.pose(tl, wuro, { bA: 95, cA: 0 }, 29.8, 0.4);
    R.pose(tl, forgeron, { bA: 8, cA: 12 }, 30.2, 0.4);
    tl.set(wuro.p, { dir: -1 }, 31.2);
    R.pose(tl, wuro, { bA: 150, cA: 90, bR: 150, cR: 90 }, 31.3, 0.5);
    R.pose(tl, wuro, { bA: 60, cA: 10, bR: 50, cR: 10 }, 31.9, 0.7);
    R.pose(tl, wuro, { bA: 8, cA: 12, bR: -8, cR: 12 }, 33, 0.5);
    tl.to(forgeron.p, { tete: 14, duration: 0.3, yoyo: true, repeat: 3 }, 32.6);
    // Dwo tourne et redevient costume
    tl.to(dwo.p, { frisson: 2.2, duration: 0.3 }, 33.2);
    [33.3, 33.5, 33.7, 33.9].forEach((t, i) => tl.set(dwo.p, { dir: i % 2 ? -1 : 1 }, t));
    R.jaillir(tl, eclats, 34, 0, { n: 14, ecart: 26, haut: 120, duree: 0.9 });
    R.jaillir(tl, eclats, 34.05, 1, { n: 14, ecart: 20, haut: 60, duree: 0.8 });
    tl.to(dwo.p, { alpha: 0, duration: 0.15 }, 34.1);
    tl.to(masque, { opacity: 1, duration: 0.15 }, 34.1);
    // Wuro prend le costume et le confie au forgeron
    tl.set(wuro.p, { dir: 1 }, 35);
    R.pose(tl, wuro, { lean: 18, bA: 70, cA: 10 }, 35, 0.6);
    tl.to(masque, { opacity: 0, duration: 0.1 }, 35.7);
    montrer(tl, masqueW, 35.7, 0.1);
    R.pose(tl, wuro, { lean: 0, bA: 55, cA: 45 }, 35.9, 0.5);
    tl.set(wuro.p, { dir: -1 }, 36.3);
    R.marche(tl, wuro, 1120, 36.4, 2);
    R.marche(tl, forgeron, 930, 37, 1);
    R.pose(tl, wuro, { bA: 75, cA: 10 }, 38.6, 0.6);
    R.pose(tl, forgeron, { bA: 75, cA: 10 }, 39, 0.5);
    cacher(tl, masqueW, 39.6, 0.1); montrer(tl, masqueF, 39.6, 0.1);
    R.pose(tl, forgeron, { bA: 60, cA: 90, bR: 55, cR: 90 }, 40, 0.6);
    R.pose(tl, wuro, { bA: 8, cA: 12 }, 40, 0.6);
    R.expr(tl, forgeron, 'serein', 40.2);
    // Bénédiction, puis Wuro remonte au ciel
    tl.set(wuro.p, { dir: 1 }, 40.8);
    R.marche(tl, wuro, 1260, 40.9, 1);
    tl.set(wuro.p, { dir: -1 }, 42);
    R.pose(tl, wuro, { bA: 150, cA: 20 }, 42, 0.6);
    R.parle(tl, wuro, 42.2, 2.4);
    R.expr(tl, wuro, 'serein', 42);
    tl.to(forgeron.p, { tete: 12, duration: 0.3, yoyo: true, repeat: 3 }, 43);
    tl.to(wuro.p, { y: 300, s: 0.6, duration: 4.5, ease: 'power1.in' }, 45);
    tl.to(wuro.p, { alpha: 0, duration: 2.5 }, 46.5);
    R.pose(tl, wuro, { bA: 8, cA: 12 }, 45, 0.6);
    R.pose(tl, forgeron, { tete: 28 }, 45.4, 1);
    R.cam(tl, sc, { y: 480, z: 0.9 }, 45, 4);
    // Le forgeron repart, décidé
    R.pose(tl, forgeron, { tete: 0, sourcils: 0.5, sourcilsH: 0, sourire: 0.4, yeux: 0 }, 49.5, 0.6);
    tl.set(forgeron.p, { dir: -1 }, 50);
    R.marche(tl, forgeron, -300, 50.2, 4.5);
    R.fonduSortie(tl, 53.5, 1.5);
  });

  // =================================================================== 6 · Le premier masque
  const CASE_X = 1300;
  R.scene('Le premier masque', 25, (sc, tl) => {
    DECORS.village(sc, { ciel: 'soir', soleil: [1750, 690, 70] });
    const forgeron = forgeronDe(sc, { x: -250, y: SOL, bA: 60, cA: 90, bR: 55, cR: 90 });
    gsap.set(masquePorte(sc, forgeron, 0.55), { opacity: 1 });
    const dwo = sc.perso(C.dwo, null, { x: CASE_X, y: SOL, dir: -1, alpha: 0, frisson: 1.6 });
    const g = {
      ancien: gens(sc, 'ancien', { x: -650, y: SOL }),
      mere: gens(sc, 'mere', { x: -480, y: SOL }),
      enfant: gens(sc, 'enfant', { x: -340, y: SOL }),
      jeuneFemme: gens(sc, 'jeuneFemme', { x: 2100, y: SOL, dir: -1 }),
      cultivateur: gens(sc, 'cultivateur', { x: 2250, y: SOL, dir: -1 }),
      jeune: gens(sc, 'jeune', { x: 2380, y: SOL, dir: -1 }),
    };
    const arrivee = { ancien: 250, mere: 420, enfant: 540, jeuneFemme: 1560, cultivateur: 1690, jeune: 1820 };
    const devant = sc.calque();
    D.maison(devant, CASE_X, SOL + 20, 330, 300, { porte: -70 });
    const eclats = D.particules(devant, 30, CASE_X, 560, '#6a9a35', 4);
    sc.cam.x = 760; sc.cam.y = 600; sc.cam.z = 0.95;

    R.fonduEntree(tl, 0, 1.2);
    R.expr(tl, forgeron, 'serein', 0);
    R.marche(tl, forgeron, CASE_X, 0.5, 7.2);
    R.cam(tl, sc, { x: 1080 }, 1, 7);
    tl.to(forgeron.p, { alpha: 0, duration: 0.2 }, 7.7);
    // Les feuilles frémissent au-dessus de la case
    tl.to(dwo.p, { alpha: 1, duration: 0.3 }, 8.3);
    [8.5, 9, 9.5].forEach((t, i) => R.jaillir(tl, eclats, t, i, { n: 8, ecart: 30, haut: 70, duree: 0.7 }));
    tl.to(dwo.p, { frisson: 2.2, duration: 0.3, yoyo: true, repeat: 3 }, 8.4);
    // Dwo sort
    R.marche(tl, dwo, 960, 10.2, 2.4);
    Object.entries(g).forEach(([nom, p], i) => R.marche(tl, p, arrivee[nom], 10.8 + (i % 3) * 0.3, 3, { pas: 6 }));
    R.cam(tl, sc, { x: 960, z: 0.9, y: 580 }, 11, 3);
    Object.values(g).forEach((p, i) => {
      R.expr(tl, p, 'peur', 14.2 + i * 0.1);
      tl.to(p.p, { x: `${p.p.dir > 0 ? '-' : '+'}=45`, lean: -10, duration: 0.5 }, 14.6 + i * 0.05);
      R.pose(tl, p, { bA: 60, cA: 90 }, 14.6, 0.4);
    });
    tl.set(g.enfant.p, { dir: -1 }, 15);
    R.marche(tl, g.enfant, 380, 15.1, 0.6, { pas: 2 });
    R.pose(tl, dwo, { bA: 150, bR: 150, cA: 10, cR: 10, frisson: 2 }, 15.5, 0.6);
    // L'Ancien reconnaît le fils de Wuro
    R.pose(tl, dwo, { bA: 8, bR: -8, cA: 12, cR: 12, frisson: 1 }, 17, 0.6);
    R.pose(tl, g.ancien, { lean: 14, bA: 8, cA: 12 }, 16.8, 0.4);
    R.marche(tl, g.ancien, 600, 17, 2, { pas: 4 });
    R.expr(tl, g.ancien, 'serein', 19);
    R.pose(tl, g.ancien, { lean: 45, tete: 10 }, 19.5, 0.8);
    Object.entries(g).forEach(([nom, p], i) => {
      if (nom === 'ancien') return;
      R.expr(tl, p, 'neutre', 20 + i * 0.1);
      R.pose(tl, p, { lean: 25, bA: 8, cA: 12, tete: 6 }, 20.3 + i * 0.12, 0.7);
    });
    R.cam(tl, sc, { x: 800, z: 1.15, y: 620 }, 17, 5);
    R.fonduSortie(tl, 23.5, 1.5);
  });

  // =================================================================== 7 · La danse de Dwo
  R.scene('La danse de Dwo', 50, (sc, tl) => {
    DECORS.village(sc, { soleil: [1600, 170, 70] });
    const champ = D.mil(sc.calque(), -200, 2100, 866, 26, 77, { h: 85, profondeur: 12 });
    champ.tiges.forEach((t) => gsap.set(t, { scaleY: 0.15, svgOrigin: '0 0' }));
    const bras = { bA: 75, cA: 110, bR: 75, cR: 110 };
    const foule = {
      ancien: gens(sc, 'ancien', { x: 260, y: SOL }),
      mere: gens(sc, 'mere', { x: 420, y: SOL }),
      enfant: gens(sc, 'enfant', { x: 530, y: SOL }),
      jeuneFemme: gens(sc, 'jeuneFemme', { x: 1560, y: SOL, dir: -1 }),
    };
    const cult = gens(sc, 'cultivateur', Object.assign({ x: 700, y: SOL }, bras, R.EXPRESSIONS.colere));
    const jeune = gens(sc, 'jeune', Object.assign({ x: 1230, y: SOL, dir: -1 }, bras, R.EXPRESSIONS.colere));
    const dwo = sc.perso(C.dwo, null, { x: 965, y: SOL, frisson: 1 });
    const tb = D.tourbillon(sc.monde, 1.1);
    gsap.set(tb, { x: 2500, y: SOL });
    const poussiere = D.particules(sc.monde, 30, 1700, 800, '#c9a678', 6);
    sc.cam.x = 900; sc.cam.y = 590; sc.cam.z = 0.95;

    R.fonduEntree(tl, 0, 0.8);
    // Dwo danse, le village frappe dans ses mains
    R.danse(tl, dwo, 0.8, 8.6, { y: SOL, saut: 34, tempo: 0.5 });
    [2.3, 3.8, 5.3, 6.8, 8.3].forEach((t, i) => tl.set(dwo.p, { dir: i % 2 ? 1 : -1 }, t));
    tl.to(dwo.p, { frisson: 1.8, duration: 0.4 }, 0.8);
    Object.values(foule).forEach((p, i) => { R.expr(tl, p, 'joie', 1 + i * 0.2); applaudir(tl, p, 1.2 + i * 0.15, 8); });
    tl.to([cult.p, jeune.p], { bob: 2, duration: 0.6, yoyo: true, repeat: 5 }, 1);
    // Il secoue ses feuilles entre les deux querelleurs
    tl.set(dwo.p, { dir: -1 }, 10);
    tl.to(dwo.p, { lean: 14, duration: 0.2, yoyo: true, repeat: 5 }, 10.3);
    R.expr(tl, cult, 'surprise', 10.6);
    tl.set(dwo.p, { dir: 1 }, 12.2);
    tl.to(dwo.p, { lean: 14, duration: 0.2, yoyo: true, repeat: 5 }, 12.4);
    R.expr(tl, jeune, 'surprise', 12.7);
    R.cam(tl, sc, { x: 965, z: 1.15, y: 620 }, 10, 2.5);
    R.pose(tl, cult, { bA: 8, cA: 12, bR: -8, cR: 12, tete: -10 }, 14.2, 0.6);
    R.pose(tl, jeune, { bA: 8, cA: 12, bR: -8, cR: 12, tete: -10 }, 14.3, 0.6);
    R.expr(tl, cult, 'triste', 14.4); R.expr(tl, jeune, 'triste', 14.4);
    R.marche(tl, dwo, 1360, 14.6, 1.2);
    R.pose(tl, cult, { tete: 0 }, 15.6, 0.4); R.pose(tl, jeune, { tete: 0 }, 15.6, 0.4);
    R.marche(tl, cult, 885, 15.8, 1.6);
    R.marche(tl, jeune, 1065, 15.9, 1.5);
    R.pose(tl, cult, { bA: 85, cA: 0 }, 17.5, 0.4);
    R.pose(tl, jeune, { bA: 85, cA: 0 }, 17.6, 0.4);
    tl.to([cult.p, jeune.p], { cA: 12, duration: 0.2, yoyo: true, repeat: 5 }, 18);
    R.expr(tl, cult, 'joie', 18.1); R.expr(tl, jeune, 'joie', 18.3);
    R.pose(tl, cult, { bA: 8, cA: 12 }, 19.4, 0.4);
    R.pose(tl, jeune, { bA: 8, cA: 12 }, 19.4, 0.4);
    Object.values(foule).forEach((p, i) => R.expr(tl, p, 'rire', 18.5 + i * 0.1));
    // Le tourbillon revient ; Dwo lui fait face
    R.cam(tl, sc, { x: 1200, z: 0.9, y: 580 }, 20, 3);
    tourbillonner(tl, tb, 20, 9);
    tl.to(tb, { x: 1760, duration: 3.5, ease: 'power2.out' }, 20);
    Object.values(foule).concat([cult, jeune]).forEach((p, i) => {
      R.expr(tl, p, 'peur', 21 + i * 0.08);
      R.pose(tl, p, { lean: -8, bA: 160, cA: 120, bR: 160, cR: 120 }, 21.2 + i * 0.08, 0.4);
    });
    R.marche(tl, dwo, 1470, 22, 1);
    R.pose(tl, dwo, { bA: 120, bR: 120, cA: 0, cR: 0, frisson: 2.4 }, 23.3, 0.5);
    tl.to(tb, { x: '+=12', duration: 0.07, yoyo: true, repeat: 21 }, 23.6);
    tl.to(tb, { scale: 0.05, opacity: 0, transformOrigin: '50% 100%', duration: 3, ease: 'power2.in' }, 25);
    [25.2, 25.8, 26.4, 27].forEach((t, i) => R.jaillir(tl, poussiere, t, i, { n: 7, ecart: 40, haut: 60, duree: 0.8 }));
    R.pose(tl, dwo, { bA: 8, bR: -8, cA: 12, cR: 12, frisson: 1 }, 28.2, 0.6);
    Object.values(foule).concat([cult, jeune]).forEach((p, i) => {
      R.pose(tl, p, { lean: p.def.pose && p.def.pose.lean || 0, bA: 8, cA: 12, bR: -8, cR: 12 }, 28.3 + i * 0.08, 0.6);
      R.expr(tl, p, 'joie', 28.6 + i * 0.08);
    });
    // Le mil sort de terre
    R.cam(tl, sc, { x: 960, z: 0.85, y: 560 }, 29, 4);
    tl.to(champ.tiges, { scaleY: 1, duration: 1.4, ease: 'back.out(1.4)', stagger: 0.12 }, 29.5);
    Object.values(foule).forEach((p, i) => { R.pose(tl, p, { bA: 110, cA: 0, regard: 1 }, 30.5 + i * 0.2, 0.5); R.pose(tl, p, { bA: 8, cA: 12 }, 33.5, 0.5); });
    // Tout le village danse
    const danseurs = [dwo, cult, jeune].concat(Object.values(foule));
    danseurs.forEach((p, i) => {
      R.expr(tl, p, i === 0 ? 'neutre' : 'rire', 34.5);
      R.danse(tl, p, 35 + (i % 3) * 0.12, 11, { y: SOL, tempo: 0.45 + (i % 3) * 0.05, saut: i === 0 ? 36 : 16 });
    });
    tl.to(dwo.p, { frisson: 2, duration: 0.5 }, 35);
    R.cam(tl, sc, { z: 0.8, x: 950, y: 540 }, 36, 6);
    R.fonduSortie(tl, 48.5, 1.5);
  });

  // =================================================================== 8 · Épilogue
  R.scene('Épilogue', 32, (sc, tl) => {
    const b = DECORS.bois(sc, { ciel: 'soir' });
    const masque = D.masqueFeuilles(sc.calque(), 1560, SOL, 1);
    sc.anime(masque);
    gsap.set(masque, { opacity: 0 });
    const dwo = sc.perso(C.dwo, null, { x: 650, y: SOL, frisson: 0.8 });
    const forgeron = forgeronDe(sc, { x: 1700, y: SOL, dir: -1, alpha: 0 });
    const eclats = D.particules(sc.monde, 30, 1680, 700, '#6a9a35', 9);
    const etoile = D.lumiere(sc.monde, 1250, 150, 9, '#ffe7a3');
    gsap.set(etoile, { scale: 0.3, opacity: 0, transformOrigin: '50% 50%' });
    b.devant();
    sc.cam.x = 1050; sc.cam.y = 600; sc.cam.z = 0.95;

    R.fonduEntree(tl, 0, 1.2);
    R.marche(tl, dwo, 1300, 1, 4.5);
    tl.set(dwo.p, { dir: -1 }, 6);
    R.pose(tl, dwo, { lean: 25, tete: 8 }, 6.4, 0.6);
    R.pose(tl, dwo, { lean: 0, tete: 0 }, 7.4, 0.5);
    tl.set(dwo.p, { dir: 1 }, 8);
    R.marche(tl, dwo, 1680, 8.2, 2);
    R.jaillir(tl, eclats, 10.2, 0, { n: 12, ecart: 24, haut: 90, duree: 0.9 });
    tl.to(dwo.p, { alpha: 0, duration: 1 }, 10.2);
    tl.to(masque, { opacity: 1, duration: 1.2 }, 10.8);
    // Le forgeron ressort seul
    tl.to(forgeron.p, { alpha: 1, duration: 0.8 }, 12.4);
    R.expr(tl, forgeron, 'serein', 12.4);
    R.marche(tl, forgeron, 1150, 13, 3.5);
    R.cam(tl, sc, { x: 1250, z: 1.1, y: 580 }, 13, 5);
    tl.set(forgeron.p, { dir: 1 }, 16.8);
    tl.to(forgeron.p, { tete: 10, duration: 0.3, yoyo: true, repeat: 1 }, 17.3);
    // L'étoile de Wuro
    tl.to(etoile, { opacity: 1, scale: 1.4, duration: 1.5 }, 18);
    tl.to(etoile, { scale: 1, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 19.5);
    R.pose(tl, forgeron, { tete: 30 }, 18.4, 0.8);
    R.expr(tl, forgeron, 'joie', 19.5, 0.8);
    R.fonduSortie(tl, 20.3, 1.5);
    R.titre(tl, 21.8, 4, 'fin');
    R.generique(tl, 25.6, 6, ['credits_titre', 'credits_1', 'credits_2', 'credits_3', 'credits_4']);
  });

  R.lecteur();
})();
