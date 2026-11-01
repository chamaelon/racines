/*
 * Racines — gestes et petites séquences réutilisables (R.G), à combiner dans les scènes.
 * Toutes les fonctions ajoutent des tweens à la timeline `tl` à partir de `at` (secondes locales).
 * Rappel : l'angle réel du bras vaut bA − lean (le bras suit le buste penché).
 */
(function () {
  const G = {};
  const REPOS = { bA: 8, cA: 12, bR: -8, cR: 12 };
  G.REPOS = REPOS;
  const leanDe = (p) => (p.def && p.def.pose && p.def.pose.lean) || 0;

  /** Bras au repos. */
  G.repos = (tl, p, at, d) => R.pose(tl, p, Object.assign({ lean: leanDe(p) }, REPOS), at, d || 0.4);

  /** Applaudir sur place pendant `duree`. */
  G.applaudir = (tl, p, at, duree) => {
    R.pose(tl, p, { bA: 70, cA: 75, bR: 70, cR: 75 }, at, 0.3);
    tl.to(p.p, { cA: 95, cR: 55, duration: 0.18, yoyo: true, repeat: Math.round(duree / 0.18), ease: 'sine.inOut' }, at + 0.3);
    R.pose(tl, p, REPOS, at + duree + 0.5, 0.4);
  };

  /** Saluer de la main levée. */
  G.saluer = (tl, p, at, duree) => {
    R.pose(tl, p, { bA: 150, cA: 20 }, at, 0.4);
    tl.to(p.p, { cA: -15, duration: 0.25, yoyo: true, repeat: Math.round((duree || 2) / 0.25), ease: 'sine.inOut' }, at + 0.4);
    R.pose(tl, p, { bA: 8, cA: 12 }, at + (duree || 2) + 0.6, 0.4);
  };

  /** S'incliner (révérence) puis se redresser. */
  G.incliner = (tl, p, at, duree, profond) => {
    R.pose(tl, p, { lean: profond || 38, tete: 12 }, at, 0.6);
    R.pose(tl, p, { lean: leanDe(p), tete: 0 }, at + (duree || 1.6), 0.6);
  };

  /** S'agenouiller (et se relever avec G.relever). */
  G.agenouiller = (tl, p, at, d) => R.pose(tl, p, { assis: 0.75, lean: 18, tete: -8 }, at, d || 0.8);
  G.relever = (tl, p, at, d) => R.pose(tl, p, { assis: 0, lean: leanDe(p), tete: 0 }, at, d || 0.8);

  /** Prier : bras levés vers le ciel, tête levée. */
  G.prier = (tl, p, at, duree) => {
    R.pose(tl, p, { bA: 165, bR: 160, cA: 10, cR: 10, tete: 28, lean: 0 }, at, 0.9);
    if (duree) R.pose(tl, p, Object.assign({ tete: 0, lean: leanDe(p) }, REPOS), at + duree, 0.8);
  };

  /** Montrer du doigt (bras tendu). haut : 0 horizontal → 1 vers le ciel. */
  G.pointer = (tl, p, at, duree, haut) => {
    R.pose(tl, p, { bA: 90 + (haut || 0) * 60, cA: 0 }, at, 0.35);
    if (duree) R.pose(tl, p, { bA: 8, cA: 12 }, at + duree, 0.4);
  };

  /** Pleurer : tristesse, mains au visage, épaules qui tressautent. */
  G.pleurer = (tl, p, at, duree) => {
    R.expr(tl, p, 'triste', at);
    R.pose(tl, p, { bA: 60, cA: 120, bR: 55, cR: 120, tete: -12 }, at, 0.5);
    tl.to(p.p, { bob: 3, duration: 0.2, yoyo: true, repeat: Math.round(duree / 0.2) }, at + 0.5);
    R.pose(tl, p, Object.assign({ tete: 0 }, REPOS), at + duree + 0.5, 0.5);
  };

  /** Dialogue mimé : [[perso, durée], …] parlent à tour de rôle, avec un geste de main. */
  G.dialogue = (tl, at, repliques) => {
    let t = at;
    repliques.forEach(([p, d, geste], i) => {
      R.parle(tl, p, t, d);
      if (geste !== false) {
        R.pose(tl, p, { bA: 55 + (i % 2) * 25, cA: 60 }, t + 0.1, 0.35);
        R.pose(tl, p, { bA: 8, cA: 12 }, t + d - 0.2, 0.35);
      }
      t += d + 0.25;
    });
    return t;
  };

  /** Frapper (poing, bâton ou arme tenue) : élan puis coup ; la cible recule. */
  G.frapper = (tl, a, cible, at, o) => {
    o = o || {};
    R.pose(tl, a, { bA: 150, cA: 40, lean: -6 }, at, 0.3);
    R.pose(tl, a, { bA: 95, cA: 0, lean: 16 }, at + 0.35, 0.15, 'power3.in');
    if (cible) {
      R.expr(tl, cible, 'douleur', at + 0.5, 0.05);
      const s = cible.p.x > a.p.x ? 1 : -1;
      tl.to(cible.p, { x: `+=${s * (o.recul || 40)}`, lean: -18, duration: 0.25 }, at + 0.5);
      tl.to(cible.p, { lean: leanDe(cible), duration: 0.4 }, at + 0.9);
    }
    R.pose(tl, a, { bA: 30, cA: 20, lean: 0 }, at + 0.8, 0.4);
  };

  /** Tomber (renversé) ; sens +1 = vers la droite. relever : délai avant de se relever (ou rien). */
  G.tomber = (tl, p, at, sens, relever) => {
    tl.to(p.p, { rot: 84 * (sens || 1), x: `+=${55 * (sens || 1)}`, duration: 0.45, ease: 'power2.in' }, at);
    if (relever) tl.to(p.p, { rot: 0, x: `-=${55 * (sens || 1)}`, duration: 1, ease: 'power2.out' }, at + relever);
  };

  /** Tirer à l'arc : l'archer bande l'arc (main R), la flèche vole vers (x, y). */
  G.tirer = (tl, archer, parent, at, x, y, duree) => {
    R.pose(tl, archer, { bR: 90, cR: 0, bA: 80, cA: 110 }, at, 0.5);
    const f = R.D.fleche(70); parent.appendChild(f); f.setAttribute('opacity', 0);
    const sx = archer.p.x + archer.p.dir * 80, sy = archer.p.y - archer.def.taille * 0.62 * archer.p.s;
    const ang = Math.atan2(y - sy, x - sx) * 180 / Math.PI;
    tl.set(f, { x: sx, y: sy, rotation: ang, opacity: 1 }, at + 0.8);
    tl.to(f, { x, y, duration: duree || 0.5, ease: 'none' }, at + 0.8);
    tl.to(f, { opacity: 0, duration: 0.1 }, at + 0.8 + (duree || 0.5) + 0.3);
    R.pose(tl, archer, { bA: 70, cA: 30 }, at + 0.8, 0.1);
    R.pose(tl, archer, REPOS, at + 1.5, 0.4);
    return f;
  };

  /** Piocher (houe) : n coups de période `per`. */
  G.piocher = (tl, p, at, n, per) => {
    for (let i = 0; i < n; i++) {
      const t = at + i * per;
      tl.to(p.p, { bA: 160, cA: 25, bR: 155, cR: 25, lean: 0, duration: per * 0.55, ease: 'power1.out' }, t);
      tl.to(p.p, { bA: 70, cA: 5, bR: 65, cR: 5, lean: 30, duration: per * 0.45, ease: 'power3.in' }, t + per * 0.55);
    }
    tl.to(p.p, Object.assign({ lean: leanDe(p), duration: 0.4 }, REPOS), at + n * per);
  };

  /** Piler le mil (pilon tenu verticalement, main A). */
  G.piler = (tl, p, at, n, per, haut, pool) => {
    for (let i = 0; i < n; i++) {
      const t = at + i * per;
      tl.to(p.p, { bA: haut || 120, bR: (haut || 120) - 6, cA: 20, cR: 22, lean: -5, duration: per * 0.5, ease: 'power1.out' }, t);
      tl.to(p.p, { bA: 70, bR: 64, cA: 25, cR: 25, lean: 6, duration: per * 0.5, ease: 'power2.in' }, t + per * 0.5);
      if (pool) R.jaillir(tl, pool, t + per, i);
    }
  };

  /** Jouer du balafon : les deux bras frappent en alternance ; les lames s'illuminent. */
  G.balafon = (tl, p, at, duree, instrument) => {
    const n = Math.round(duree / 0.22);
    R.pose(tl, p, { lean: 22, bA: 70, cA: 20, bR: 60, cR: 20 }, at, 0.3);
    for (let i = 0; i < n; i++) {
      const t = at + 0.3 + i * 0.22;
      tl.to(p.p, i % 2 ? { bA: 80, bR: 50, duration: 0.11 } : { bA: 55, bR: 72, duration: 0.11 }, t);
      if (instrument && instrument.lames) {
        const l = instrument.lames[(i * 5 + (i >> 2)) % instrument.lames.length];
        tl.fromTo(l, { attr: { fill: '#ffd166' } }, { attr: { fill: '#9a6a3a' }, duration: 0.25, immediateRender: false }, t + 0.1);
      }
    }
    R.pose(tl, p, Object.assign({ lean: leanDe(p) }, REPOS), at + 0.3 + n * 0.22, 0.4);
  };

  /** Notes de musique qui s'envolent (instrument, chant). */
  G.notes = (tl, parent, x, y, at, duree, couleur) => {
    const n = Math.round(duree / 0.5);
    for (let i = 0; i < n; i++) {
      const g = R.el('g', { opacity: 0 }, parent);
      R.el('path', { d: 'M0,0 l0,-26 l14,-5 l0,22', stroke: couleur || '#fff1c2', 'stroke-width': 3, fill: 'none' }, g);
      R.el('ellipse', { cx: -4, cy: 0, rx: 6, ry: 4.5, fill: couleur || '#fff1c2' }, g);
      R.el('ellipse', { cx: 10, cy: -5, rx: 6, ry: 4.5, fill: couleur || '#fff1c2' }, g);
      const dx = ((i * 37) % 80) - 40;
      tl.fromTo(g, { x, y, opacity: 0.95, scale: 0.7 }, { x: x + dx, y: y - 140, opacity: 0, scale: 1.2, duration: 1.6, ease: 'sine.out', immediateRender: false }, at + i * 0.5);
    }
  };

  /** Forger assis : coups sur l'enclume, étincelles. */
  G.forger = (tl, p, at, n, per, pool) => {
    for (let i = 0; i < n; i++) {
      const t = at + i * per;
      tl.to(p.p, { bA: 170, cA: 40, lean: 0, duration: per * 0.55, ease: 'power1.out' }, t);
      tl.to(p.p, { bA: 95, cA: 0, lean: 25, duration: per * 0.45, ease: 'power3.in' }, t + per * 0.55);
      if (pool) R.jaillir(tl, pool, t + per, i, { n: 6, ecart: 16, haut: 45, duree: 0.45 });
    }
  };

  /** Flammes (D.feu, D.torche) qui vacillent. */
  G.flamber = (tl, feu, at, duree) => {
    const fl = feu.flammes || feu.flamme;
    tl.fromTo(fl, { scaleY: 1, scaleX: 1 }, { scaleY: 0.78, scaleX: 1.1, transformOrigin: '50% 100%', duration: 0.22, yoyo: true, repeat: Math.round(duree / 0.22), ease: 'sine.inOut', immediateRender: false }, at);
    if (feu.lueur) tl.fromTo(feu.lueur, { opacity: 0.4 }, { opacity: 0.26, duration: 0.35, yoyo: true, repeat: Math.round(duree / 0.35), ease: 'sine.inOut', immediateRender: false }, at);
  };

  /** Groupe qui cache tout ce qui passe sous le sol (pour sortir de terre). */
  G.sousSol = (parent, y) => {
    const cid = R.id('sol');
    const cp = R.el('clipPath', { id: cid }, R.defs);
    R.el('rect', { x: -3000, y: -4000, width: 8000, height: 4000 + y }, cp);
    return R.el('g', { 'clip-path': `url(#${cid})` }, parent);
  };

  /** Foule : crée des personnages à partir de [def, costume, x, dir, s?, pose?]. */
  G.foule = (sc, liste, sol, parent) => liste.map(([def, cos, x, dir, s, pose]) =>
    sc.perso(def, cos || null, Object.assign({ x, y: sol || 880, dir: dir || 1, s: s || 1 }, pose || {}), parent));

  /** Expression pour toute une foule, légèrement décalée. */
  G.exprFoule = (tl, liste, nom, at, ecart) => liste.forEach((p, i) => R.expr(tl, p, nom, at + i * (ecart === undefined ? 0.08 : ecart)));

  /** Danse de toute une foule. */
  G.danseFoule = (tl, liste, at, duree, sol) => liste.forEach((p, i) =>
    R.danse(tl, p, at + (i % 3) * 0.12, duree, { y: sol || 880, tempo: 0.45 + (i % 3) * 0.05, saut: 14 + (i % 2) * 6 }));

  /** Peur collective : recul et bras devant le visage. */
  G.peurFoule = (tl, liste, at) => liste.forEach((p, i) => {
    R.expr(tl, p, 'peur', at + i * 0.06);
    R.pose(tl, p, { bA: 60, cA: 100, lean: -10 }, at + i * 0.06, 0.4);
  });

  /** Retour au calme d'une foule. */
  G.calmeFoule = (tl, liste, at, expr) => liste.forEach((p, i) => {
    R.expr(tl, p, expr || 'neutre', at + i * 0.06);
    R.pose(tl, p, Object.assign({ lean: leanDe(p) }, REPOS), at + i * 0.06, 0.5);
  });

  /** Porter un objet sur la tête (canari, panier, fagot) : l'objet suit la tête. Base de l'objet à y = 0. */
  G.surLaTete = (p, objet) => {
    const w = R.el('g', { transform: `translate(${p.g.tw * 0.05},${-p.g.th + 2})` }, p.tete);
    w.appendChild(objet);
    return w;
  };

  /** Donner un objet : a tend le bras, l'objet passe de la main de a (objA) à celle de b (objB). */
  G.donner = (tl, a, objA, b, objB, at) => {
    R.pose(tl, a, { bA: 80, cA: 5 }, at, 0.5);
    R.pose(tl, b, { bA: 80, cA: 5 }, at + 0.3, 0.4);
    R.cacher(tl, objA, at + 0.75, 0.1); R.montrer(tl, objB, at + 0.75, 0.1);
    R.pose(tl, a, { bA: 8, cA: 12 }, at + 1, 0.4);
    R.pose(tl, b, { bA: 40, cA: 60 }, at + 1, 0.4);
  };

  /** Disparition / apparition magique dans une bouffée de lumière. */
  G.apparition = (tl, parent, p, at, couleur, entree) => {
    const l = R.D.lumiere(parent, p.p.x, p.p.y - p.def.taille * 0.5 * p.p.s, 22, couleur || '#ffe7a3');
    l.setAttribute('opacity', 0);
    tl.fromTo(l, { opacity: 1, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 0, scale: 5, duration: 0.9, immediateRender: false }, at);
    tl.to(p.p, { alpha: entree === false ? 0 : 1, duration: 0.25 }, at + 0.15);
    return l;
  };

  R.G = G;
})();

/* Ajouts : armes à feu (récits du XIXe et du début du XXe siècle). */
(function () {
  const G = R.G;
  /** Fusil porté canon vers le haut (sur l'épaule), à donner à perso.tenir(…, 'R', { vertical: true }). */
  G.fusilHaut = () => { const g = R.el('g', { transform: 'rotate(180)' }); g.appendChild(R.D.fusil()); return g; };
  /** Coup de fusil : éclair au canon et fumée. */
  G.tir = (tl, parent, x, y, at) => {
    const f = R.el('circle', { cx: x, cy: y, r: 16, fill: '#fff3b0', opacity: 0 }, parent);
    tl.fromTo(f, { opacity: 1 }, { opacity: 0, duration: 0.15, immediateRender: false }, at);
    const fum = R.D.fumee(parent, x, y, 10);
    R.jaillir(tl, fum, at, Math.round(at * 3), { n: 6, ecart: 14, haut: 50, duree: 1.4 });
  };
  /** Groupe de gardes armés : [[x, dir], …]. */
  G.gardes = (sc, liste, sol, parent) => liste.map(([x, dir]) => {
    const g = sc.perso(CASTING.guerrier, HABITS.garde, { x, y: sol || 880, dir }, parent);
    g.arme = g.tenir(G.fusilHaut(), 'R', { vertical: true });
    g.armeJoue = R.objet(R.D.fusil(), false);
    g.tenir(g.armeJoue, 'A', { angle: 0 });
    return g;
  });
  /** Épauler : le fusil passe de l'épaule à la position de tir (bras tendu), puis revient après `duree`. */
  G.epauler = (tl, g, at, duree) => {
    tl.set(g.arme, { opacity: 0 }, at); tl.set(g.armeJoue, { opacity: 1 }, at);
    R.pose(tl, g, { bA: 88, cA: 0, bR: 75, cR: 40 }, at, 0.3);
    if (duree) {
      tl.set(g.arme, { opacity: 1 }, at + duree); tl.set(g.armeJoue, { opacity: 0 }, at + duree);
      R.pose(tl, g, { bA: 8, cA: 12, bR: -8, cR: 12 }, at + duree, 0.3);
    }
  };
  /** Silhouettes de villages au loin, avec lueurs de feu (révolte, veillée) : renvoie les lueurs. */
  G.villagesAuLoin = (parent, n, couleur) => {
    const lueurs = [];
    for (let i = 0; i < n; i++) {
      const x = -200 + i * (2400 / n), y = 800 + (i % 2) * 40;
      R.D.maison(parent, x, y, 160, 90, { couleur: couleur || '#3a2a26' });
      lueurs.push(R.el('circle', { cx: x + 60, cy: y - 120, r: 50, fill: '#ff9a3c', opacity: 0, filter: 'url(#flou)' }, parent));
    }
    return lueurs;
  };
})();
