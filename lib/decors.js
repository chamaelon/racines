/*
 * Racines — bibliothèque de décors et d'accessoires réutilisables (SVG).
 * Chaque fonction dessine dans `parent` et renvoie le groupe créé (ou un objet de parties
 * animables). Palette : voir bible/palette.md.
 */
(function () {
  const { el, rng, teinte, id } = R;

  const PAL = {
    nuit: '#141a3a', nuitHaut: '#070a1c', aube: '#f2a65a', jour: '#9fd3e6', jourBas: '#f6e3b4',
    crepuscule: '#d9653b', terre: '#c8834a', terreSombre: '#9a5a2e', banco: '#b9713d',
    bancoClair: '#d49559', paille: '#d9b26a', vert: '#5f8d3a', vertSombre: '#3d6327',
    or: '#e9c46a', creme: '#f6ead2', brun: '#5a3420', eau: '#4d8fb3',
  };

  function degrade(haut, bas, vertical) {
    const gid = id('dg');
    const lg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: vertical === false ? 1 : 0, y2: vertical === false ? 0 : 1 }, R.defs);
    el('stop', { offset: '0%', 'stop-color': haut }, lg);
    el('stop', { offset: '100%', 'stop-color': bas }, lg);
    return `url(#${gid})`;
  }

  const D = {
    PAL, degrade,

    /** Ciel plein écran (rectangle large pour permettre les mouvements de caméra). */
    ciel(parent, haut, bas, o) {
      o = o || {};
      return el('rect', { x: o.x || -1000, y: o.y || -2000, width: o.w || 3920, height: o.h || 3600, fill: degrade(haut, bas) }, parent);
    },

    etoiles(parent, n, seed, zone) {
      const g = el('g', {}, parent), r = rng(seed || 1);
      zone = zone || { x: -400, y: -800, w: 2720, h: 1500 };
      const liste = [];
      for (let i = 0; i < n; i++) {
        const s = el('circle', { cx: zone.x + r() * zone.w, cy: zone.y + r() * zone.h, r: 0.8 + r() * 2.4, fill: '#fff8de', opacity: 0.4 + r() * 0.6 }, g);
        liste.push(s);
      }
      g.liste = liste;
      return g;
    },

    soleil(parent, x, y, r, couleur) {
      const g = el('g', { transform: `translate(${x},${y})` }, parent);
      el('circle', { cx: 0, cy: 0, r: r * 1.8, fill: couleur || '#ffe08a', opacity: 0.25, filter: 'url(#flou)' }, g);
      el('circle', { cx: 0, cy: 0, r, fill: couleur || '#ffd166' }, g);
      return g;
    },

    lune(parent, x, y, r) {
      const g = el('g', { transform: `translate(${x},${y})` }, parent);
      el('circle', { cx: 0, cy: 0, r: r * 1.6, fill: '#fdf3c8', opacity: 0.18, filter: 'url(#flou)' }, g);
      el('circle', { cx: 0, cy: 0, r, fill: '#fbf1cf' }, g);
      el('circle', { cx: r * 0.35, cy: -r * 0.2, r: r * 0.85, fill: PAL.nuit, opacity: 0.0 }, g);
      return g;
    },

    nuage(parent, x, y, s, couleur) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      const c = couleur || '#fbf4e4';
      for (const [cx, cy, r] of [[-70, 10, 45], [-20, -15, 60], [45, 0, 50], [95, 15, 35], [10, 25, 50]]) el('circle', { cx, cy, r, fill: c }, g);
      return g;
    },

    collines(parent, y, couleur, seed, amp, o) {
      o = o || {};
      const r = rng(seed || 3), a = amp || 60;
      let d = `M${-1000},${y + 400} L${-1000},${y}`;
      for (let x = -1000; x <= 2920; x += 160) d += ` Q${x + 80},${y - a * (0.4 + r())} ${x + 160},${y - r() * a * 0.3}`;
      d += ` L2920,${y + (o.fond || 2400)} L-1000,${y + (o.fond || 2400)} Z`;
      return el('path', { d, fill: couleur }, parent);
    },

    sol(parent, y, couleur, couleur2) {
      const g = el('g', {}, parent);
      el('rect', { x: -1000, y, width: 3920, height: 2000, fill: couleur2 ? degrade(couleur, couleur2) : couleur }, g);
      const r = rng(9);
      for (let i = 0; i < 70; i++) el('ellipse', { cx: -800 + r() * 3500, cy: y + 20 + r() * 160, rx: 6 + r() * 16, ry: 2 + r() * 3, fill: teinte(couleur, -0.12), opacity: 0.6 }, g);
      return g;
    },

    herbes(parent, y, n, seed, couleur, zone) {
      const g = el('g', {}, parent), r = rng(seed || 5);
      zone = zone || [-600, 2500];
      for (let i = 0; i < n; i++) {
        const x = zone[0] + r() * (zone[1] - zone[0]), h = 14 + r() * 24, yy = y + r() * 120;
        el('path', { d: `M${x},${yy} l-6,${-h} M${x},${yy} l2,${-h * 1.2} M${x},${yy} l8,${-h * 0.9}`, stroke: couleur || '#8a8a3a', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      }
      return g;
    },

    /** Maison bwa en banco : toit-terrasse, poutres saillantes, porte basse. */
    maison(parent, x, y, l, h, o) {
      o = o || {};
      const c = o.couleur || PAL.banco;
      const g = el('g', { transform: `translate(${x},${y})` }, parent);
      el('path', { d: `M${-l / 2},0 L${-l / 2 + 6},${-h} L${l / 2 - 6},${-h} L${l / 2},0 Z`, fill: c, stroke: teinte(c, -0.3), 'stroke-width': 3 }, g);
      el('rect', { x: -l / 2 - 4, y: -h - 14, width: l + 8, height: 16, rx: 5, fill: teinte(c, 0.08), stroke: teinte(c, -0.3), 'stroke-width': 2 }, g);
      for (let i = 0; i < Math.floor(l / 45); i++) el('rect', { x: -l / 2 + 18 + i * 45, y: -h - 6, width: 9, height: 26, fill: PAL.brun, transform: `rotate(90,${-l / 2 + 22 + i * 45},${-h + 4})` }, g);
      el('path', { d: `M${(o.porte || 0) - 26},0 L${(o.porte || 0) - 26},${-h * 0.5} Q${o.porte || 0},${-h * 0.66} ${(o.porte || 0) + 26},${-h * 0.5} L${(o.porte || 0) + 26},0Z`, fill: '#3a2012' }, g);
      // Décor géométrique en relief
      for (let i = 0; i < 4; i++) el('path', { d: `M${l * 0.18 + i * 14},${-h * 0.7} l7,-12 l7,12`, stroke: teinte(c, -0.25), 'stroke-width': 3, fill: 'none' }, g);
      return g;
    },

    /** Grenier rond à toit de paille conique. */
    grenier(parent, x, y, s, o) {
      o = o || {};
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      for (const px of [-28, 0, 28]) el('rect', { x: px - 6, y: -24, width: 12, height: 24, fill: PAL.brun }, g);
      el('path', { d: 'M-50,-24 Q-58,-90 -40,-130 L40,-130 Q58,-90 50,-24 Z', fill: o.couleur || PAL.bancoClair, stroke: teinte(PAL.bancoClair, -0.35), 'stroke-width': 3 }, g);
      const toit = el('g', {}, g);
      el('path', { d: 'M-66,-118 L0,-215 L66,-118 Q0,-104 -66,-118Z', fill: PAL.paille, stroke: teinte(PAL.paille, -0.35), 'stroke-width': 3 }, toit);
      for (let i = -3; i <= 3; i++) el('line', { x1: i * 16, y1: -118, x2: i * 4, y2: -200, stroke: teinte(PAL.paille, -0.2), 'stroke-width': 2 }, toit);
      g.toit = toit;
      return g;
    },

    /** Karité : tronc court, houppier dense et arrondi. */
    karite(parent, x, y, s, couleur) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-14,0 Q-10,-80 -24,-150 M14,0 Q10,-80 26,-150 M-14,0 L14,0 L10,-120 L-10,-120Z', fill: '#5b3a24', stroke: '#5b3a24', 'stroke-width': 14, 'stroke-linejoin': 'round' }, g);
      const c = couleur || PAL.vert;
      const feuillage = el('g', {}, g);
      for (const [cx, cy, r] of [[-80, -170, 70], [0, -220, 90], [80, -170, 70], [-30, -150, 60], [40, -140, 60]]) el('circle', { cx, cy, r, fill: c }, feuillage);
      for (const [cx, cy, r] of [[-50, -210, 30], [40, -240, 34], [90, -190, 24]]) el('circle', { cx, cy, r, fill: teinte(c, 0.18) }, feuillage);
      g.feuillage = feuillage;
      return g;
    },

    baobab(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-70,0 Q-60,-150 -50,-250 L50,-250 Q60,-150 70,0Z', fill: '#8c6a54', stroke: '#6a4c39', 'stroke-width': 4 }, g);
      for (const [x1, y1, x2, y2] of [[-40, -245, -140, -330], [0, -250, -20, -370], [40, -245, 150, -320], [20, -250, 80, -360]])
        el('path', { d: `M${x1},${y1} Q${(x1 + x2) / 2},${y2 + 30} ${x2},${y2}`, stroke: '#7a5b47', 'stroke-width': 18, fill: 'none', 'stroke-linecap': 'round' }, g);
      for (const [cx, cy] of [[-140, -335], [-20, -380], [150, -325], [80, -370]]) el('ellipse', { cx, cy, rx: 46, ry: 26, fill: PAL.vertSombre }, g);
      return g;
    },

    /** Rônier (palmier). */
    ronier(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-9,0 Q-4,-160 6,-320 L16,-320 Q8,-160 9,0Z', fill: '#6b4a32' }, g);
      for (let i = 0; i < 9; i++) {
        const a = -170 + i * 20;
        el('path', { d: `M11,-320 q${Math.cos(a * Math.PI / 180) * 60},${Math.sin(a * Math.PI / 180) * 60 - 20} ${Math.cos(a * Math.PI / 180) * 120},${Math.sin(a * Math.PI / 180) * 90 + 30}`, stroke: PAL.vertSombre, 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }, g);
      }
      return g;
    },

    termitiere(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-60,0 Q-50,-60 -30,-90 L-24,-150 Q-10,-170 -2,-140 L4,-200 Q16,-215 22,-190 L30,-100 Q55,-60 60,0Z', fill: '#b05a2c', stroke: '#86411d', 'stroke-width': 3 }, g);
      return g;
    },

    fleuve(parent, y, couleur) {
      const g = el('g', {}, parent);
      const c = couleur || PAL.eau;
      const p = el('path', { d: `M-1000,${y} C0,${y - 40} 400,${y + 60} 960,${y + 10} S1900,${y - 30} 2920,${y + 20} L2920,${y + 90} C1900,${y + 50} 1400,${y + 110} 960,${y + 80} S0,${y + 30} -1000,${y + 70}Z`, fill: c }, g);
      g.chemin = p;
      for (let i = 0; i < 8; i++) el('path', { d: `M${100 + i * 240},${y + 40} q20,-6 40,0`, stroke: '#cfe8f1', 'stroke-width': 3, fill: 'none', opacity: 0.8 }, g);
      return g;
    },

    /** Champ de mil : chaque tige est une ligne + épi ; renvoie { g, tiges }. */
    mil(parent, x0, x1, y, n, seed, o) {
      o = o || {};
      const g = el('g', {}, parent), r = rng(seed || 13);
      const tiges = [];
      for (let i = 0; i < n; i++) {
        const x = x0 + (i / (n - 1)) * (x1 - x0) + (r() - 0.5) * 20;
        const yy = y + r() * (o.profondeur || 50);
        const h = (o.h || 180) * (0.8 + r() * 0.35);
        const tg = el('g', { transform: `translate(${x},${yy})` }, g);
        const tige = el('g', {}, tg);
        el('line', { x1: 0, y1: 0, x2: 0, y2: -h, stroke: o.couleur || '#6f9a3a', 'stroke-width': 5, 'stroke-linecap': 'round' }, tige);
        el('path', { d: `M0,${-h * 0.45} q-28,-12 -46,8 M0,${-h * 0.65} q28,-14 44,6`, stroke: o.couleur || '#6f9a3a', 'stroke-width': 4, fill: 'none' }, tige);
        el('ellipse', { cx: 0, cy: -h - 22, rx: 8, ry: 26, fill: o.epi || '#c9a24a' }, tige);
        tiges.push(tige);
      }
      return { g, tiges };
    },

    /** Mortier en bois. */
    mortier(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-40,-80 L40,-80 L28,-34 Q44,-14 30,0 L-30,0 Q-44,-14 -28,-34Z', fill: '#7a4a25', stroke: '#4d2c14', 'stroke-width': 3 }, g);
      el('ellipse', { cx: 0, cy: -80, rx: 40, ry: 9, fill: '#3d220f' }, g);
      el('ellipse', { cx: 0, cy: -82, rx: 30, ry: 5, fill: '#e3cf8f' }, g);
      return g;
    },

    /** Pilon : groupe centré sur la prise (à donner à Perso.tenir). */
    pilon(longueur) {
      const L = longueur || 200;
      const g = el('g', {});
      el('rect', { x: -6, y: -L * 0.55, width: 12, height: L, rx: 6, fill: '#c89a5e', stroke: '#7a5530', 'stroke-width': 2 }, g);
      el('rect', { x: -9, y: L * 0.32, width: 18, height: L * 0.13, rx: 8, fill: '#b5874c' }, g);
      el('rect', { x: -9, y: -L * 0.55, width: 18, height: L * 0.13, rx: 8, fill: '#b5874c' }, g);
      return g;
    },

    /** Canari (jarre à eau). */
    canari(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent || null);
      el('path', { d: 'M-18,-62 L18,-62 L22,-52 Q50,-36 44,-14 Q36,4 0,4 Q-36,4 -44,-14 Q-50,-36 -22,-52Z', fill: '#a4512a', stroke: '#6e3216', 'stroke-width': 3 }, g);
      el('path', { d: 'M-34,-30 q34,10 68,0', stroke: '#6e3216', 'stroke-width': 2.5, fill: 'none' }, g);
      return g;
    },

    gerbe() {
      const g = el('g', {});
      for (let i = -3; i <= 3; i++) {
        el('line', { x1: 0, y1: 30, x2: i * 7, y2: -60, stroke: '#9a8a3a', 'stroke-width': 4 }, g);
        el('ellipse', { cx: i * 7.5, cy: -72, rx: 6, ry: 16, fill: '#d6a845', transform: `rotate(${i * 4},${i * 7.5},-72)` }, g);
      }
      el('rect', { x: -12, y: 4, width: 24, height: 8, fill: '#7a4a25' }, g);
      return g;
    },

    baton(longueur, couleur) {
      const g = el('g', {});
      el('line', { x1: 0, y1: -longueur * 0.6, x2: 0, y2: longueur * 0.4, stroke: couleur || '#6b4527', 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
      return g;
    },

    eventail() {
      const g = el('g', {});
      el('line', { x1: 0, y1: 0, x2: 0, y2: -30, stroke: '#6b4527', 'stroke-width': 5 }, g);
      el('path', { d: 'M0,-28 L-26,-78 Q0,-92 26,-78Z', fill: '#d9b26a', stroke: '#8a6a30', 'stroke-width': 2 }, g);
      return g;
    },

    feuilles() {
      const g = el('g', {});
      for (const a of [-30, 0, 30]) el('ellipse', { cx: 0, cy: -26, rx: 9, ry: 24, fill: '#5fae3e', stroke: '#3b7a24', 'stroke-width': 2, transform: `rotate(${a},0,0)` }, g);
      return g;
    },

    sac() {
      const g = el('g', {});
      el('path', { d: 'M-22,0 Q-30,40 0,46 Q30,40 22,0 Q0,-8 -22,0Z', fill: '#cdb27a', stroke: '#8a7040', 'stroke-width': 2 }, g);
      return g;
    },

    /** Pluie : lignes obliques ; animer `transform` de g.inner en boucle. */
    pluie(parent, n, seed, zone) {
      const g = el('g', { opacity: 0 }, parent), r = rng(seed || 21);
      zone = zone || { x: -200, y: -600, w: 2400, h: 1800 };
      const inner = el('g', {}, g);
      for (let k = 0; k < 2; k++) for (let i = 0; i < n; i++) {
        const x = zone.x + r() * zone.w, y = zone.y + r() * zone.h - k * zone.h;
        el('line', { x1: x, y1: y, x2: x - 10, y2: y + 40, stroke: '#cfe4f2', 'stroke-width': 2.5, opacity: 0.75 }, inner);
      }
      g.inner = inner;
      g.zoneH = zone.h;
      return g;
    },

    /** Éclair en zigzag de (x, y1) à y2. */
    eclair(parent, x, y1, y2, seed) {
      const r = rng(seed || 4);
      let d = `M${x},${y1}`, cx = x;
      const n = 8;
      for (let i = 1; i <= n; i++) { cx += (r() - 0.5) * 90; d += ` L${cx},${y1 + ((y2 - y1) * i) / n}`; }
      const g = el('g', { opacity: 0 }, parent);
      el('path', { d, stroke: '#fff7b0', 'stroke-width': 18, fill: 'none', filter: 'url(#flou-leger)', opacity: 0.8 }, g);
      el('path', { d, stroke: '#ffffff', 'stroke-width': 6, fill: 'none', 'stroke-linejoin': 'round' }, g);
      return g;
    },

    /** Particules (poussière de mil, étincelles) : renvoie la liste pour les animer. */
    particules(parent, n, x, y, couleur, seed) {
      const g = el('g', {}, parent), r = rng(seed || 2);
      const liste = [];
      for (let i = 0; i < n; i++) liste.push(el('circle', { cx: x, cy: y, r: 2 + r() * 4, fill: couleur || '#efe1b0', opacity: 0 }, g));
      g.liste = liste;
      return g;
    },

    /** Lumière (boule lumineuse) pour les esprits en vol. */
    lumiere(parent, x, y, r, couleur) {
      const g = el('g', { transform: `translate(${x},${y})` }, parent);
      el('circle', { cx: 0, cy: 0, r: r * 2.2, fill: couleur, opacity: 0.35, filter: 'url(#flou)' }, g);
      el('circle', { cx: 0, cy: 0, r, fill: '#fffbe8' }, g);
      el('circle', { cx: 0, cy: 0, r: r * 0.7, fill: couleur, opacity: 0.6 }, g);
      return g;
    },

    /** Siège : tronc couché (vu de face), pour asseoir un personnage. */
    siege(parent, x, y, l, h) {
      const g = el('g', { transform: `translate(${x},${y})` }, parent);
      el('rect', { x: -l / 2, y: -h, width: l, height: h, rx: 14, fill: '#7a5232', stroke: '#4d3320', 'stroke-width': 3 }, g);
      el('ellipse', { cx: l / 2 - 10, cy: -h / 2, rx: 10, ry: h / 2 - 4, fill: '#c89a6a', stroke: '#4d3320', 'stroke-width': 2 }, g);
      el('path', { d: `M${-l / 2 + 14},${-h * 0.35} h${l * 0.5} M${-l / 2 + 30},${-h * 0.7} h${l * 0.4}`, stroke: '#5a3a22', 'stroke-width': 2 }, g);
      return g;
    },

    /** Feu (forge, cuisine, veillée) : pierres et flammes. Animer g.flammes (scale) et g.lueur. */
    feu(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      const lueur = el('ellipse', { cx: 0, cy: -34, rx: 110, ry: 80, fill: '#ffb347', opacity: 0.4, filter: 'url(#flou)' }, g);
      const flammes = el('g', {}, g);
      for (const [dx, h, c] of [[-14, 62, '#e8572a'], [13, 76, '#f08a24'], [0, 50, '#ffd166']]) {
        el('path', { d: `M${dx - 17},0 Q${dx - 20},${-h * 0.55} ${dx},${-h} Q${dx + 20},${-h * 0.55} ${dx + 17},0Z`, fill: c }, flammes);
      }
      for (const px of [-32, -11, 11, 32]) el('ellipse', { cx: px, cy: -2, rx: 13, ry: 8, fill: '#5d5a55', stroke: '#33312e', 'stroke-width': 2 }, g);
      g.flammes = flammes; g.lueur = lueur;
      return g;
    },

    /** Enclume de forgeron : pierre de fer posée sur un billot. Surface de frappe à y − 62·s. */
    enclume(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-30,0 L-24,-40 L24,-40 L30,0Z', fill: '#6b4a32', stroke: '#3f2a1a', 'stroke-width': 3 }, g);
      el('path', { d: 'M-38,-40 L-42,-62 L36,-62 Q56,-58 60,-50 L32,-40Z', fill: '#4d4f57', stroke: '#2b2c31', 'stroke-width': 3 }, g);
      el('line', { x1: -36, y1: -58, x2: 34, y2: -58, stroke: '#8a8d96', 'stroke-width': 3 }, g);
      return g;
    },

    /** Marteau de forge, à tenir dans l'axe de l'avant-bras (sans `vertical`). */
    marteau() {
      const g = el('g', {});
      el('line', { x1: 0, y1: -8, x2: 0, y2: 52, stroke: '#7a5232', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      el('rect', { x: -17, y: 46, width: 34, height: 21, rx: 4, fill: '#55585f', stroke: '#2b2c31', 'stroke-width': 2 }, g);
      return g;
    },

    /** Houe (daba) : manche court, lame de fer. À tenir dans l'axe de l'avant-bras. */
    houe() {
      const g = el('g', {});
      el('line', { x1: 0, y1: -12, x2: 0, y2: 72, stroke: '#7a5232', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M-5,62 L26,68 Q36,82 25,94 L-3,80Z', fill: '#6d7079', stroke: '#33353b', 'stroke-width': 2 }, g);
      return g;
    },

    /** Tourbillon de poussière. Placer avec gsap (x, y) ; faire osciller g.anneaux. */
    tourbillon(parent, s) {
      const g = el('g', {}, parent);
      const inner = el('g', { transform: `scale(${s || 1})` }, g);
      el('ellipse', { cx: 0, cy: -190, rx: 110, ry: 210, fill: '#c9a678', opacity: 0.3, filter: 'url(#flou)' }, inner);
      const anneaux = [];
      for (let i = 0; i < 9; i++) {
        anneaux.push(el('ellipse', { cx: 0, cy: -18 - i * 44, rx: 20 + i * 14, ry: 8 + i * 2.6, fill: 'none', stroke: i % 2 ? '#c9a678' : '#a98256', 'stroke-width': 9 - i * 0.5, opacity: 0.85 }, inner));
      }
      g.anneaux = anneaux;
      return g;
    },

    /** Costume de feuilles de Dwo, vide (posé sur sa perche) : mêmes proportions que le
     *  personnage S01. g.p.frisson s'anime ; passer g à sc.anime() pour le faire frissonner. */
    masqueFeuilles(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent || null);
      const r = rng(11), franges = [];
      el('line', { x1: 0, y1: -300, x2: 0, y2: 0, stroke: '#5b3a24', 'stroke-width': 8 }, g);
      for (let k = 0; k < 6; k++) {
        const yy = -255 + k * 38, larg = 40 + k * 6;
        const rang = el('g', { transform: `translate(0,${yy})` }, g);
        for (let i = 0; i < 14; i++) {
          const xx = -larg + (i / 13) * larg * 2, l = 42 + r() * 26;
          const col = ['#5f8d3a', '#4c7330', '#76a050', '#b5893b'][Math.floor(r() * 4)];
          el('path', { d: `M${xx},0 q${(r() - 0.5) * 16},${l * 0.5} ${(r() - 0.5) * 12},${l}`, stroke: col, 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, rang);
        }
        franges.push({ rang, y: yy });
      }
      const cy = -296, rx = 26, ry = 38;
      for (let i = -3; i <= 3; i++) el('path', { d: `M${i * rx * 0.22},${cy - ry * 1.2} q${i * 4},-30 ${i * 9},-48`, stroke: i % 2 ? '#4f7d2c' : '#6a9a35', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: `M0,${cy - ry * 1.5} L${rx * 0.9},${cy - ry * 0.3} L${rx * 0.7},${cy + ry} L${-rx * 0.7},${cy + ry} L${-rx * 0.9},${cy - ry * 0.3} Z`, fill: '#8a5a32', stroke: '#5a3a20', 'stroke-width': 2.5 }, g);
      for (const sx of [-1, 1]) el('ellipse', { cx: sx * 9, cy: cy - 2, rx: 6, ry: 4.5, fill: '#2a160a' }, g);
      el('path', { d: `M0,${cy + 4} l3,14 l-4,1`, stroke: '#5a3a20', 'stroke-width': 2.5, fill: 'none' }, g);
      g.franges = franges;
      g.p = { frisson: 0.4 };
      g.rendre = (t) => franges.forEach((f, i) => f.rang.setAttribute('transform', `translate(${Math.sin(t * 9 + i) * 3 * g.p.frisson},${f.y}) rotate(${Math.sin(t * 7 + i * 1.3) * 6 * g.p.frisson})`));
      return g;
    },

    // ---------------------------------------------------------------- Objets tenus (centrés sur la prise)
    /** Arc (tenu à la verticale, main au centre). */
    arc() {
      const g = el('g', {});
      el('path', { d: 'M4,-70 Q34,0 4,70', stroke: '#6b4527', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('line', { x1: 4, y1: -70, x2: 4, y2: 70, stroke: '#e8dcc0', 'stroke-width': 1.5 }, g);
      return g;
    },
    /** Flèche (projectile ou tenue), pointe vers +x. */
    fleche(longueur) {
      const L = longueur || 80, g = el('g', {});
      el('line', { x1: -L / 2, y1: 0, x2: L / 2, y2: 0, stroke: '#8a6a40', 'stroke-width': 3 }, g);
      el('path', { d: `M${L / 2},-5 l12,5 l-12,5Z`, fill: '#55585f' }, g);
      el('path', { d: `M${-L / 2},0 l-8,-6 M${-L / 2},0 l-8,6`, stroke: '#c8553d', 'stroke-width': 3 }, g);
      return g;
    },
    /** Lance tenue verticalement. */
    lance(longueur) {
      const L = longueur || 240, g = el('g', {});
      el('line', { x1: 0, y1: -L * 0.65, x2: 0, y2: L * 0.35, stroke: '#6b4527', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
      el('path', { d: `M0,${-L * 0.65 - 34} l9,26 l-9,8 l-9,-8Z`, fill: '#9aa0a8', stroke: '#55585f', 'stroke-width': 1.5 }, g);
      return g;
    },
    /** Fusil de traite (tenu dans l'axe de l'avant-bras ; canon vers +y local). */
    fusil() {
      const g = el('g', {});
      el('path', { d: 'M-5,-30 L5,-30 L8,10 L-6,14Z', fill: '#6b4527' }, g);
      el('line', { x1: 0, y1: 10, x2: 0, y2: 110, stroke: '#3a3c42', 'stroke-width': 5 }, g);
      return g;
    },
    /** Bouclier de cuir rond. */
    bouclier(couleur) {
      const c = couleur || '#a0703a', g = el('g', {});
      el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 44, fill: c, stroke: teinte(c, -0.35), 'stroke-width': 3 }, g);
      el('path', { d: 'M0,-34 L0,34 M-18,-10 L18,10', stroke: teinte(c, -0.35), 'stroke-width': 3 }, g);
      return g;
    },
    /** Sabre courbe (dans l'axe de l'avant-bras). */
    sabre() {
      const g = el('g', {});
      el('rect', { x: -4, y: -14, width: 8, height: 18, rx: 2, fill: '#6b4527' }, g);
      el('path', { d: 'M-3,4 Q8,50 -4,96 Q14,52 4,4Z', fill: '#c9ced6', stroke: '#7a808a', 'stroke-width': 1.5 }, g);
      return g;
    },
    /** Baguette de balafon (maillet à tête ronde). */
    baguette() {
      const g = el('g', {});
      el('line', { x1: 0, y1: -6, x2: 0, y2: 48, stroke: '#7a5232', 'stroke-width': 4 }, g);
      el('circle', { cx: 0, cy: 52, r: 7, fill: '#3a2a1a' }, g);
      return g;
    },
    calebasse(couleur) {
      const c = couleur || '#d9b26a', g = el('g', {});
      el('path', { d: 'M-34,0 Q-34,-30 0,-30 Q34,-30 34,0Z', fill: c, stroke: teinte(c, -0.35), 'stroke-width': 2.5 }, g);
      el('path', { d: 'M-26,-14 l10,-6 l10,6 l10,-6 l10,6 l10,-6', stroke: teinte(c, -0.4), 'stroke-width': 2, fill: 'none' }, g);
      return g;
    },
    /** Torche (flamme animable : g.flamme). */
    torche() {
      const g = el('g', {});
      el('line', { x1: 0, y1: 30, x2: 0, y2: -40, stroke: '#6b4527', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: 0, cy: -58, r: 30, fill: '#ffb347', opacity: 0.35, filter: 'url(#flou)' }, g);
      g.flamme = el('path', { d: 'M-12,-40 Q-14,-62 0,-82 Q14,-62 12,-40Z', fill: '#f08a24' }, g);
      el('path', { d: 'M-6,-40 Q-6,-54 0,-64 Q6,-54 6,-40Z', fill: '#ffd166' }, g);
      return g;
    },
    /** Bâton de commandement / sceptre royal. */
    sceptre(couleur) {
      const g = el('g', {});
      el('line', { x1: 0, y1: -90, x2: 0, y2: 60, stroke: '#4d2c14', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      el('circle', { cx: 0, cy: -96, r: 11, fill: couleur || '#e9c46a', stroke: '#8a6a30', 'stroke-width': 2 }, g);
      return g;
    },

    // ---------------------------------------------------------------- Objets posés (sol à y)
    /** Balafon (xylophone) posé : lames sur cadre, calebasses dessous. g.lames pour les faire « sonner ». */
    balafon(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-110,-40 L110,-52 M-110,-40 L-104,0 M110,-52 L104,0', stroke: '#6b4527', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
      for (let i = 0; i < 9; i++) el('circle', { cx: -90 + i * 22, cy: -22 - i * 0.6, r: 9 - i * 0.4, fill: '#d9b26a', stroke: '#8a6a30', 'stroke-width': 1.5 }, g);
      g.lames = [];
      for (let i = 0; i < 9; i++) g.lames.push(el('rect', { x: -100 + i * 22, y: -52 - i * 1.3, width: 18, height: 12 + (8 - i) * 0.8, rx: 2, fill: '#9a6a3a', stroke: '#5a3a1a', 'stroke-width': 1.5 }, g));
      return g;
    },
    /** Tambour (djembé / tambour d'aisselle posé). */
    tambour(parent, x, y, s, couleur) {
      const c = couleur || '#7a4a25', g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-26,-80 L26,-80 L14,-36 L22,0 L-22,0 L-14,-36Z', fill: c, stroke: teinte(c, -0.35), 'stroke-width': 2.5 }, g);
      el('ellipse', { cx: 0, cy: -80, rx: 26, ry: 7, fill: '#efe0bd', stroke: '#8a6a40', 'stroke-width': 2 }, g);
      for (let i = -2; i <= 2; i++) el('line', { x1: i * 10, y1: -76, x2: i * 5, y2: -36, stroke: '#e8dcc0', 'stroke-width': 1.5 }, g);
      return g;
    },
    /** Statuette gardienne lobi (bateba), en bois. */
    statuette(parent, x, y, s, bras) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      const c = '#6b4a2e', b = '#3f2a18';
      el('rect', { x: -14, y: -10, width: 28, height: 10, rx: 3, fill: b }, g);
      el('path', { d: 'M-8,-10 L-6,-38 M8,-10 L6,-38', stroke: c, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M-12,-38 L12,-38 L10,-78 L-10,-78Z', fill: c, stroke: b, 'stroke-width': 2 }, g);
      if (bras === 'leves') el('path', { d: 'M-10,-74 L-24,-104 M10,-74 L24,-104', stroke: c, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
      else el('path', { d: 'M-10,-74 L-14,-46 M10,-74 L14,-46', stroke: c, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
      el('ellipse', { cx: 0, cy: -92, rx: 11, ry: 14, fill: c, stroke: b, 'stroke-width': 2 }, g);
      el('path', { d: 'M-5,-94 l3,0 M3,-94 l3,0', stroke: b, 'stroke-width': 2.5 }, g);
      return g;
    },
    /** Pirogue vue de côté (sur l'eau à y). */
    pirogue(parent, x, y, l) {
      const L = l || 300, g = el('g', { transform: `translate(${x},${y})` }, parent);
      el('path', { d: `M${-L / 2},-26 Q0,-14 ${L / 2},-30 Q${L / 2 - 20},8 ${L / 2 - 50},10 L${-L / 2 + 50},10 Q${-L / 2 + 16},6 ${-L / 2},-26Z`, fill: '#6b4527', stroke: '#3f2a18', 'stroke-width': 3 }, g);
      el('path', { d: `M${-L / 2 + 30},-14 Q0,-6 ${L / 2 - 30},-16`, stroke: '#8a5a32', 'stroke-width': 3, fill: 'none' }, g);
      return g;
    },
    /** Trône / tabouret royal sculpté. */
    trone(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-40,0 L-30,-14 L-36,-40 L36,-40 L30,-14 L40,0Z', fill: '#5a3420', stroke: '#2f1a0e', 'stroke-width': 3 }, g);
      el('rect', { x: -46, y: -54, width: 92, height: 14, rx: 6, fill: '#7a4a25', stroke: '#2f1a0e', 'stroke-width': 3 }, g);
      el('path', { d: 'M-20,-14 l10,-20 l10,20 l10,-20 l10,20', stroke: '#e9c46a', 'stroke-width': 3, fill: 'none' }, g);
      return g;
    },
    /** Parasol royal. */
    parasol(parent, x, y, s, couleur) {
      const c = couleur || '#b23a2a', g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('line', { x1: 0, y1: 0, x2: 0, y2: -300, stroke: '#4d2c14', 'stroke-width': 7 }, g);
      el('path', { d: 'M-120,-270 Q0,-370 120,-270 Z', fill: c, stroke: teinte(c, -0.35), 'stroke-width': 3 }, g);
      for (let i = 0; i < 9; i++) el('path', { d: `M${-120 + i * 30},-270 l15,22 l15,-22`, fill: '#e9c46a' }, g);
      return g;
    },
    /** Autel de la terre : tertre, canaris, pierre levée. */
    autel(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-90,0 Q-70,-44 0,-50 Q70,-44 90,0Z', fill: '#8a5a32', stroke: '#5a3a20', 'stroke-width': 3 }, g);
      el('path', { d: 'M-10,-46 L-6,-110 L10,-112 L14,-46Z', fill: '#7a7268', stroke: '#4d4740', 'stroke-width': 2.5 }, g);
      D.canari(g, -46, -24, 0.55); D.canari(g, 50, -22, 0.5);
      for (let i = 0; i < 5; i++) el('ellipse', { cx: -60 + i * 30, cy: -6, rx: 8, ry: 4, fill: '#efe6cf' }, g);
      return g;
    },
    /** Tas de cauris (divination). */
    cauris(parent, x, y, n) {
      const g = el('g', { transform: `translate(${x},${y})` }, parent), r = rng(n || 12);
      g.liste = [];
      for (let i = 0; i < (n || 12); i++) g.liste.push(el('ellipse', { cx: (r() - 0.5) * 80, cy: (r() - 0.5) * 16, rx: 5, ry: 3.5, fill: '#f6f0dc', stroke: '#a89a70', 'stroke-width': 1 }, g));
      return g;
    },
    /** Drapeau sur mât (couleurs en bandes verticales). */
    drapeau(parent, x, y, couleurs, h) {
      const H = h || 260, g = el('g', { transform: `translate(${x},${y})` }, parent);
      el('line', { x1: 0, y1: 0, x2: 0, y2: -H, stroke: '#5a5a5a', 'stroke-width': 5 }, g);
      g.tissu = el('g', { transform: `translate(0,${-H})` }, g);
      (couleurs || ['#2f4a9a', '#f6f0e8', '#c8323a']).forEach((c, i) => el('rect', { x: 2 + i * 30, y: 0, width: 30, height: 60, fill: c }, g.tissu));
      return g;
    },
    /** Petit tas d'or (pépites) ou de pierres. */
    tas(parent, x, y, couleur, n) {
      const g = el('g', { transform: `translate(${x},${y})` }, parent), r = rng(n || 7);
      for (let i = 0; i < (n || 9); i++) el('ellipse', { cx: (r() - 0.5) * 50, cy: -r() * 16, rx: 6 + r() * 6, ry: 5 + r() * 3, fill: couleur || '#e9c46a', stroke: teinte(couleur || '#e9c46a', -0.35), 'stroke-width': 1.5 }, g);
      return g;
    },
    rocher(parent, x, y, s, couleur) {
      const c = couleur || '#8f8478', g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-60,0 Q-70,-50 -20,-70 Q30,-86 56,-40 Q70,-10 60,0Z', fill: c, stroke: teinte(c, -0.3), 'stroke-width': 3 }, g);
      el('path', { d: 'M-30,-50 q20,-10 40,0', stroke: teinte(c, 0.2), 'stroke-width': 4, fill: 'none' }, g);
      return g;
    },
    /** Mare ou point d'eau (ellipse plate), g.eau s'anime (rx). */
    mare(parent, x, y, l, couleur) {
      const L = l || 400, g = el('g', { transform: `translate(${x},${y})` }, parent);
      el('ellipse', { cx: 0, cy: 0, rx: L / 2 + 16, ry: 30, fill: '#7a5a3a' }, g);
      g.eau = el('ellipse', { cx: 0, cy: 0, rx: L / 2, ry: 24, fill: couleur || PAL.eau }, g);
      for (let i = 0; i < 4; i++) el('path', { d: `M${-L * 0.35 + i * L * 0.2},${-4 + (i % 2) * 8} q15,-5 30,0`, stroke: '#cfe8f1', 'stroke-width': 2.5, fill: 'none', opacity: 0.8 }, g);
      for (let i = 0; i < 6; i++) el('path', { d: `M${-L / 2 - 10 + (i % 3) * 18},${-6} l-6,-40 M${-L / 2 + (i % 3) * 18},-6 l4,-48`, stroke: '#5f8d3a', 'stroke-width': 3 }, g);
      return g;
    },
    /** Fumée : particules grises (utiliser R.jaillir avec un grand `haut`). */
    fumee(parent, x, y, n) { return D.particules(parent, n || 24, x, y, '#9a948a', 17); },

    // ---------------------------------------------------------------- Végétation et bâtiments
    /** Caïlcédrat : grand arbre à tronc haut et houppier large et sombre. */
    cailcedrat(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-34,0 Q-22,-120 -26,-260 L26,-260 Q22,-120 34,0Z', fill: '#5a4030', stroke: '#3a2a1e', 'stroke-width': 3 }, g);
      for (const [x1, y1, x2, y2] of [[-14, -250, -120, -330], [10, -250, 110, -340], [0, -255, 0, -380]]) el('path', { d: `M${x1},${y1} Q${(x1 + x2) / 2},${y2 + 30} ${x2},${y2}`, stroke: '#5a4030', 'stroke-width': 16, fill: 'none', 'stroke-linecap': 'round' }, g);
      g.feuillage = el('g', {}, g);
      for (const [cx, cy, r] of [[-150, -340, 90], [-50, -410, 110], [70, -420, 110], [160, -340, 90], [0, -320, 100], [-100, -280, 70], [110, -280, 70]]) el('circle', { cx, cy, r, fill: '#3f6a2c' }, g.feuillage);
      for (const [cx, cy, r] of [[-80, -420, 40], [60, -450, 44], [150, -370, 30]]) el('circle', { cx, cy, r, fill: '#5a8a3a' }, g.feuillage);
      return g;
    },
    /** Acacia du Sahel : tronc fin, couronne plate. */
    acacia(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-6,0 Q-2,-80 -40,-150 M0,-60 Q20,-110 50,-150 M-4,-90 L0,-160', stroke: '#5b3a24', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('ellipse', { cx: 0, cy: -165, rx: 120, ry: 26, fill: '#7d8a40' }, g);
      el('ellipse', { cx: 20, cy: -180, rx: 80, ry: 18, fill: '#93a04e' }, g);
      return g;
    },
    /** Case ronde à toit de chaume (paille conique). */
    caseRonde(parent, x, y, s, o) {
      o = o || {};
      const c = o.couleur || PAL.bancoClair, g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-70,0 L-66,-110 L66,-110 L70,0Z', fill: c, stroke: teinte(c, -0.3), 'stroke-width': 3 }, g);
      if (o.motifs) {
        // Peintures kassena : triangles et damiers noirs/blancs/rouges
        for (let i = 0; i < 6; i++) el('path', { d: `M${-60 + i * 20},-60 l10,-20 l10,20Z`, fill: i % 2 ? '#1d140f' : '#f6ead2' }, g);
        for (let i = 0; i < 7; i++) el('rect', { x: -63 + i * 18, y: -40, width: 9, height: 9, fill: i % 2 ? '#b23a2a' : '#1d140f' }, g);
        el('rect', { x: -66, y: -96, width: 132, height: 6, fill: '#1d140f' }, g);
      }
      el('path', { d: `M-26,0 L-26,-60 Q0,-76 26,-60 L26,0Z`, fill: '#3a2012' }, g);
      if (o.toit !== false) {
        el('path', { d: 'M-92,-100 L0,-210 L92,-100 Q0,-86 -92,-100Z', fill: PAL.paille, stroke: teinte(PAL.paille, -0.35), 'stroke-width': 3 }, g);
        for (let i = -4; i <= 4; i++) el('line', { x1: i * 20, y1: -100, x2: i * 5, y2: -196, stroke: teinte(PAL.paille, -0.2), 'stroke-width': 2 }, g);
      } else {
        el('rect', { x: -74, y: -122, width: 148, height: 14, rx: 5, fill: teinte(c, 0.05), stroke: teinte(c, -0.3), 'stroke-width': 2 }, g);
      }
      return g;
    },
    /** Case peule en paille tressée (dôme). */
    caseDome(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-90,0 Q-95,-130 0,-140 Q95,-130 90,0Z', fill: '#cfae6a', stroke: '#8a6a30', 'stroke-width': 3 }, g);
      for (let i = 1; i < 5; i++) el('path', { d: `M${-90 + i * 4},${-i * 26} Q0,${-i * 26 - 18} ${90 - i * 4},${-i * 26}`, stroke: '#a88a4a', 'stroke-width': 3, fill: 'none' }, g);
      el('path', { d: 'M-22,0 L-22,-50 Q0,-62 22,-50 L22,0Z', fill: '#3a2012' }, g);
      return g;
    },
    /** Mosquée de style soudano-sahélien : banco, contreforts, pieux saillants (torons). */
    mosquee(parent, x, y, s) {
      const c = '#c08850', f = teinte(c, -0.3), g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-260,0 L-250,-170 L250,-170 L260,0Z', fill: c, stroke: f, 'stroke-width': 3 }, g);
      for (const [cx, h, w] of [[-200, 290, 60], [0, 360, 80], [200, 290, 60]]) {
        el('path', { d: `M${cx - w / 2},-160 L${cx - w / 2 + 8},${-h} Q${cx},${-h - 30} ${cx + w / 2 - 8},${-h} L${cx + w / 2},-160Z`, fill: c, stroke: f, 'stroke-width': 3 }, g);
        for (let k = 0; k < Math.floor((h - 170) / 40); k++) for (const sx of [-1, 1]) el('line', { x1: cx + sx * (w / 2 - 6), y1: -190 - k * 40, x2: cx + sx * (w / 2 + 12), y2: -190 - k * 40, stroke: PAL.brun, 'stroke-width': 6 }, g);
        el('ellipse', { cx, cy: -h - 22, rx: 8, ry: 10, fill: '#f6ead2' }, g);
      }
      for (let i = 0; i < 9; i++) el('line', { x1: -230 + i * 57, y1: -120, x2: -230 + i * 57, y2: -100, stroke: PAL.brun, 'stroke-width': 7 }, g);
      for (const px of [-100, 100]) el('path', { d: `M${px - 26},0 L${px - 26},-70 Q${px},-90 ${px + 26},-70 L${px + 26},0Z`, fill: '#3a2012' }, g);
      return g;
    },
    /** Mur de pierre (forteresse de Loropéni) : blocs de latérite ; ruine = haut irrégulier. */
    murPierre(parent, x0, x1, y, h, o) {
      o = o || {};
      const c = o.couleur || '#9a6a4a', g = el('g', {}, parent), r = rng(o.graine || 31);
      let d = `M${x0},${y} L${x0},${y - h}`;
      for (let x = x0; x <= x1; x += 40) d += ` L${x},${y - h + (o.ruine ? r() * h * 0.45 : r() * 8)}`;
      d += ` L${x1},${y}Z`;
      el('path', { d, fill: c, stroke: teinte(c, -0.35), 'stroke-width': 3 }, g);
      for (let row = 0; row < Math.floor(h / 26); row++) for (let x = x0 + (row % 2) * 24; x < x1 - 30; x += 48)
        el('rect', { x: x + 4, y: y - 24 - row * 26, width: 40, height: 20, rx: 4, fill: teinte(c, (r() - 0.5) * 0.25), opacity: 0.65 }, g);
      if (o.ruine) for (let i = 0; i < (x1 - x0) / 120; i++) el('path', { d: `M${x0 + 40 + i * 120},${y - h * 0.5} q-10,-30 6,-50 q8,24 -6,50`, fill: '#5f8d3a' }, g);
      return g;
    },
    /** Pic rocheux (Sindou) : aiguille de grès érodée. */
    pic(parent, x, y, h, l, couleur) {
      const c = couleur || '#b0805a', g = el('g', { transform: `translate(${x},${y})` }, parent), r = rng(Math.round(x + h));
      const L = l || h * 0.35;
      let d = `M${-L / 2},0`;
      for (let k = 1; k <= 5; k++) d += ` Q${-L / 2 + (r() - 0.5) * 14},${-h * (k - 0.5) / 5} ${-L / 2 * (1 - k * 0.14)},${-h * k / 5}`;
      d += ` Q0,${-h - 26} ${L / 2 * 0.3},${-h}`;
      for (let k = 5; k >= 1; k--) d += ` Q${L / 2 + (r() - 0.5) * 14},${-h * (k - 0.5) / 5} ${L / 2 * (1 - (k - 1) * 0.14)},${-h * (k - 1) / 5}`;
      el('path', { d: d + 'Z', fill: c, stroke: teinte(c, -0.3), 'stroke-width': 3 }, g);
      for (let k = 1; k < 5; k++) el('path', { d: `M${-L * 0.35},${-h * k / 5} q${L * 0.3},${-6} ${L * 0.6},0`, stroke: teinte(c, -0.2), 'stroke-width': 3, fill: 'none' }, g);
      return g;
    },
    /** Soukala lobi : grande maison-forteresse en banco, petites ouvertures, échelle fourchue. */
    soukala(parent, x, y, s) {
      const c = '#b36d3e', f = teinte(c, -0.3), g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('path', { d: 'M-220,0 L-214,-150 L-60,-150 L-60,-190 L220,-190 L220,0Z', fill: c, stroke: f, 'stroke-width': 3 }, g);
      for (let i = 0; i < 3; i++) el('rect', { x: -170 + i * 140, y: -110 - (i === 2 ? 40 : 0), width: 22, height: 26, rx: 4, fill: '#2f1a0e' }, g);
      el('path', { d: 'M-150,0 L-150,-60 Q-130,-72 -110,-60 L-110,0Z', fill: '#2f1a0e' }, g);
      el('path', { d: 'M-70,0 L-50,-150 M-58,-20 l24,0 M-55,-45 l22,0 M-52,-70 l20,0 M-49,-95 l18,0 M-46,-120 l16,0', stroke: '#6b4527', 'stroke-width': 6, fill: 'none' }, g);
      for (let i = 0; i < 6; i++) el('line', { x1: -40 + i * 50, y1: -186, x2: -40 + i * 50, y2: -200, stroke: PAL.brun, 'stroke-width': 7 }, g);
      return g;
    },
    /** Bâtiment colonial : murs blanchis, véranda à arcades, toit de tôle. */
    poste(parent, x, y, s) {
      const g = el('g', { transform: `translate(${x},${y}) scale(${s || 1})` }, parent);
      el('rect', { x: -230, y: -190, width: 460, height: 190, fill: '#ece2cc', stroke: '#a89a7a', 'stroke-width': 3 }, g);
      el('path', { d: 'M-260,-190 L0,-260 L260,-190Z', fill: '#8a8f96', stroke: '#5a5f66', 'stroke-width': 3 }, g);
      for (let i = 0; i < 5; i++) el('path', { d: `M${-200 + i * 90},0 L${-200 + i * 90},-110 Q${-165 + i * 90},-150 ${-130 + i * 90},-110 L${-130 + i * 90},0Z`, fill: '#5a4a3a' }, g);
      return g;
    },
    /** Dune de sable (Sahel). */
    dune(parent, x, y, l, h, couleur) {
      const c = couleur || '#e2bf84';
      return el('path', { d: `M${x - l / 2},${y} Q${x - l * 0.15},${y - h * 1.3} ${x + l * 0.1},${y - h} Q${x + l * 0.3},${y - h * 0.8} ${x + l / 2},${y}Z`, fill: c, stroke: teinte(c, -0.12), 'stroke-width': 2 }, parent);
    },
    /** Falaise latérale (gorge) : bloc vertical stratifié, côté 'g' ou 'd'. */
    falaise(parent, x, y, h, l, cote, couleur) {
      const c = couleur || '#a8764e', g = el('g', { transform: `translate(${x},${y})` }, parent), s = cote === 'd' ? -1 : 1;
      el('path', { d: `M${-s * l},0 L${-s * l},${-h} L${s * l * 0.1},${-h} Q${s * l * 0.25},${-h * 0.7} ${s * l * 0.05},${-h * 0.45} Q${s * l * 0.3},${-h * 0.2} ${s * l * 0.15},0Z`, fill: c, stroke: teinte(c, -0.3), 'stroke-width': 3 }, g);
      for (let k = 1; k < 6; k++) el('line', { x1: -s * l, y1: -h * k / 6, x2: s * l * 0.12, y2: -h * k / 6 + 6, stroke: teinte(c, -0.18), 'stroke-width': 3 }, g);
      el('path', { d: `M${s * l * 0.05},${-h} q${s * 30},20 ${s * 10},60 q${s * 40},10 ${s * 20},70`, stroke: '#5f8d3a', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, g);
      return g;
    },

    /** Mur bas de concession (cour). */
    muret(parent, x0, x1, y, h, couleur) {
      const c = couleur || PAL.banco;
      return el('path', { d: `M${x0},${y} L${x0},${y - h} Q${(x0 + x1) / 2},${y - h - 12} ${x1},${y - h} L${x1},${y}Z`, fill: c, stroke: teinte(c, -0.3), 'stroke-width': 3 }, parent);
    },

    /** Voûte céleste « basse » : bande de ciel étoilé dont le bord bas frôle les toits. */
    voute(parent, bordY) {
      const g = el('g', {}, parent);
      el('path', { d: `M-1000,-3000 L2920,-3000 L2920,${bordY} Q2400,${bordY + 40} 1900,${bordY + 10} Q1400,${bordY + 50} 960,${bordY + 20} Q500,${bordY + 50} 0,${bordY + 10} Q-500,${bordY + 40} -1000,${bordY}Z`, fill: degrade('#1f2a6b', '#5b6fb5') }, g);
      D.etoiles(g, 90, 77, { x: -900, y: -800, w: 3700, h: 800 + bordY });
      for (let i = 0; i < 7; i++) D.nuage(g, -300 + i * 380, bordY + 10 + (i % 2) * 18, 0.9, '#eef0fb');
      return g;
    },
  };

  R.D = D;
})();
