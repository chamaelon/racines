/*
 * Racines — moteur d'animation stickman (SVG + GSAP), commun à toutes les histoires.
 *
 * Principes :
 *  - Tout est piloté par des objets d'état (pose des personnages, caméra) que GSAP anime.
 *    Un seul rendu par image recalcule les attributs SVG : le scrubbing est donc exact
 *    et la capture image par image est déterministe.
 *  - Coordonnées du monde : 1920 × 1080. Personnage : origine aux pieds, y vers le haut négatif.
 *  - Angles de pose en degrés : bras/cuisse 0 = pendant, + = vers l'avant ; coude + = plié
 *    vers l'avant ; genou + = plié vers l'arrière ; lean + = buste penché vers l'avant.
 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1920, H = 1080;

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // PRNG déterministe (mulberry32) : les décors restent identiques à chaque chargement.
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function teinte(hex, f) {
    // f < 0 assombrit, f > 0 éclaircit
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const m = (c) => Math.round(f < 0 ? c * (1 + f) : c + (255 - c) * f);
    r = m(r); g = m(g); b = m(b);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  let uid = 0;
  const id = (p) => `${p}${++uid}`;

  // ------------------------------------------------------------------ Expressions
  const EXPRESSIONS = {
    neutre:   { sourcils: 0, sourcilsH: 0, bouche: 0, sourire: 0.25, yeux: 0 },
    joie:     { sourcils: 0, sourcilsH: 0.3, bouche: 0.3, sourire: 1, yeux: 0 },
    rire:     { sourcils: 0, sourcilsH: 0.4, bouche: 0.85, sourire: 1, yeux: 0.6 },
    triste:   { sourcils: -0.9, sourcilsH: 0.2, bouche: 0, sourire: -0.8, yeux: 0.2 },
    peur:     { sourcils: -0.6, sourcilsH: 1, bouche: 0.6, sourire: -0.5, yeux: 0 },
    colere:   { sourcils: 1, sourcilsH: 0, bouche: 0.25, sourire: -0.7, yeux: 0.1 },
    surprise: { sourcils: 0, sourcilsH: 1, bouche: 0.9, sourire: 0, yeux: 0 },
    douleur:  { sourcils: -1, sourcilsH: 0.3, bouche: 0.55, sourire: -1, yeux: 0.75 },
    sommeil:  { sourcils: 0, sourcilsH: 0, bouche: 0, sourire: 0.3, yeux: 1 },
    malade:   { sourcils: -0.7, sourcilsH: 0, bouche: 0.15, sourire: -0.5, yeux: 0.6 },
    serein:   { sourcils: -0.2, sourcilsH: 0.1, bouche: 0, sourire: 0.6, yeux: 0.45 },
  };

  const POSE_REPOS = {
    x: 0, y: 900, s: 1, dir: 1, alpha: 1, rot: 0, lean: 0, bob: 0, tete: 0,
    bA: 8, cA: 12, bR: -8, cR: 12, jA: 5, gA: 0, jR: -5, gR: 0,
    yeux: 0, regard: 0, sourcils: 0, sourcilsH: 0, bouche: 0, sourire: 0.25,
    marche: 0, marcheAmp: 0, parle: 0, parleAmp: 0, frisson: 0, lueur: 0, assis: 0,
  };

  // ------------------------------------------------------------------ Personnage
  /*
   * def : fiche du personnage (bible/personnages.js) ; costume : habits (voir bible).
   * Le personnage est découpé en groupes animés séparément : corps, tête, bras et
   * avant-bras, cuisses et tibias, yeux, sourcils, bouche.
   */
  class Perso {
    constructor(parent, def, costume, pose) {
      this.def = def;
      this.costume = Object.assign({}, def.costume, costume || {});
      this.p = Object.assign({}, POSE_REPOS, def.pose || {}, pose || {});
      this.tenus = [];
      this.phaseClin = (def.id || 'x').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 37 / 10;
      this._geometrie();
      this._construire(parent);
      this.rendre(0);
    }

    _geometrie() {
      const d = this.def;
      const tr = d.teteR;
      const th = tr * 2 * (d.tete.h || 1);
      const L = d.taille * (d.jambes || 0.42);
      const T = d.taille - L - th - 4;
      this.g = {
        tr, th, tw: tr * 2 * (d.tete.l || 1),
        L, T, cuisse: L * 0.52, tibia: L * 0.5,
        hanche: -L, cou: -L - T,
        epaule: -L - T + Math.max(6, T * 0.08),
        bras: (d.bras || 0.95) * L * 0.5, avb: (d.bras || 0.95) * L * 0.5,
        ep: d.epaisseur || 8,
        epW: d.epaules || 20, hW: d.hanches || 16,
      };
    }

    _membre(parent, longueur, couleur, ep) {
      el('line', { x1: 0, y1: 0, x2: 0, y2: longueur, stroke: couleur, 'stroke-width': ep, 'stroke-linecap': 'round' }, parent);
    }

    _construire(parent) {
      const d = this.def, g = this.g, c = this.costume;
      const peau = d.peau, peauDos = teinte(d.peau, -0.25);
      this.root = el('g', { class: 'perso', 'data-id': d.id }, parent);
      if (d.halo) {
        this.halo = el('ellipse', { cx: 0, cy: (g.hanche + g.cou) / 2 - g.th / 2, rx: d.taille * 0.55, ry: d.taille * 0.7, fill: d.halo, filter: 'url(#flou-fort)', opacity: 0.55 }, this.root);
      }
      this.ombre = el('ellipse', { cx: 0, cy: 2, rx: Math.max(g.hW, g.epW) * 1.4 + 10, ry: 7, fill: '#000', opacity: 0.18 }, this.root);
      this.corps = el('g', {}, this.root);

      // Jambes : arrière puis avant
      const jambe = (couleur) => {
        const cuisse = el('g', {}, this.corps);
        this._membre(cuisse, g.cuisse, couleur, g.ep);
        const tibia = el('g', { transform: `translate(0,${g.cuisse})` }, cuisse);
        this._membre(tibia, g.tibia, couleur, g.ep);
        el('line', { x1: 0, y1: g.tibia, x2: g.ep * 1.4, y2: g.tibia, stroke: c.pieds || couleur, 'stroke-width': g.ep, 'stroke-linecap': 'round' }, tibia);
        return { cuisse, tibia };
      };
      this.jR = jambe(peauDos);
      this.jA = jambe(peau);

      // Buste : tout ce qui s'incline (lean) autour des hanches
      this.buste = el('g', {}, this.corps);

      // Bras arrière
      const bras = (couleur, parentG) => {
        const haut = el('g', {}, parentG);
        if (c.manches) el('line', { x1: 0, y1: 0, x2: 0, y2: g.bras * 0.8, stroke: couleur === peau ? c.manches : teinte(c.manches, -0.2), 'stroke-width': g.ep + 5, 'stroke-linecap': 'round' }, haut);
        this._membre(haut, g.bras, couleur, g.ep);
        const bas = el('g', { transform: `translate(0,${g.bras})` }, haut);
        this._membre(bas, g.avb, couleur, g.ep);
        const main = el('g', { transform: `translate(0,${g.avb})` }, bas);
        el('circle', { cx: 0, cy: 0, r: g.ep * 0.75, fill: couleur }, main);
        if (c.bracelets) el('line', { x1: -g.ep * 0.7, y1: -g.ep, x2: g.ep * 0.7, y2: -g.ep, stroke: c.bracelets, 'stroke-width': 3 }, main);
        return { haut, bas, main };
      };
      this.bR = bras(peauDos, this.buste);

      // Tronc + habits
      this.tronc = el('g', {}, this.buste);
      this._tronc(this.tronc);

      // Tête
      this.tete = el('g', {}, this.buste);
      this._tete(this.tete);

      // Bras avant (par-dessus tout)
      this.bA = bras(peau, this.buste);
      // Feuilles du masque Dwo : par-dessus le bras pour l'envelopper
      if (c.haut && c.haut.type === 'feuilles') this._feuilles(this.buste);
    }

    _tronc(G) {
      const g = this.g, c = this.costume, d = this.def;
      const y0 = g.epaule - 4, y1 = g.hanche + 4;
      const ew = g.epW, hw = g.hW;
      const haut = c.haut || { type: 'aucun' };
      const tronc = (fill, ew2, hw2, yb) =>
        el('path', { d: `M${-ew2},${y0} Q0,${y0 - 6} ${ew2},${y0} L${hw2},${yb} Q0,${yb + 8} ${-hw2},${yb} Z`, fill, stroke: teinte(fill, -0.3), 'stroke-width': 2, 'stroke-linejoin': 'round' }, G);

      if (d.corps === 'fil') {
        el('line', { x1: 0, y1: g.cou, x2: 0, y2: g.hanche, stroke: d.peau, 'stroke-width': g.ep, 'stroke-linecap': 'round' }, G);
      } else {
        tronc(d.peau, ew, hw, y1);
      }
      // Bas : pagne, short, jupe longue, herbes. Tout ce qui pend sous les hanches va dans
      // `this.jupe`, qui se couche sur les cuisses quand le personnage s'assoit.
      const J = this.jupe = el('g', {}, G);
      this.jupeLong = 0;
      const bas = c.bas || { type: 'aucun' };
      if (bas.type === 'pagne' || bas.type === 'jupe') {
        const yb = g.hanche + g.cuisse * (bas.type === 'jupe' ? 1.75 : 1.05);
        el('path', { d: `M${-hw - 2},${g.hanche - 6} L${hw + 2},${g.hanche - 6} L${hw + 14},${yb} Q0,${yb + 6} ${-hw - 14},${yb} Z`, fill: bas.couleur, stroke: teinte(bas.couleur, -0.3), 'stroke-width': 2 }, J);
        if (bas.motif) this._motif(J, bas, -hw - 8, g.hanche, hw * 2 + 16, yb - g.hanche);
        this.jupeLong = yb - g.hanche;
        this.jupeTasse = bas.type === 'jupe';
      } else if (bas.type === 'short') {
        el('path', { d: `M${-hw - 2},${g.hanche - 8} L${hw + 2},${g.hanche - 8} L${hw + 6},${g.hanche + g.cuisse * 0.55} L${-hw - 6},${g.hanche + g.cuisse * 0.55} Z`, fill: bas.couleur, stroke: teinte(bas.couleur, -0.3), 'stroke-width': 2 }, J);
      } else if (bas.type === 'herbes') {
        this.herbes = el('g', {}, J);
        const r = rng(7);
        for (let i = 0; i < 18; i++) {
          const x = -hw - 8 + (i / 17) * (hw * 2 + 16);
          const l = g.cuisse * (0.9 + r() * 0.5);
          el('path', { d: `M${x},${g.hanche - 8} q${(r() - 0.5) * 10},${l / 2} ${(r() - 0.5) * 14},${l}`, stroke: i % 2 ? bas.couleur : teinte(bas.couleur, -0.25), 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, this.herbes);
        }
      }
      // Haut : tunique, boubou, camisole
      if (haut.type === 'tunique' || haut.type === 'camisole') {
        const yb = haut.type === 'tunique' ? g.hanche + 10 : g.hanche - 4;
        tronc(haut.couleur, ew + 3, hw + 5, yb);
        if (haut.motif) this._motif(G, haut, -hw - 4, g.epaule + 6, hw * 2 + 8, yb - g.epaule - 6);
      } else if (haut.type === 'boubou') {
        // Deux pièces : le pan (sous les hanches, dans la jupe) puis le haut.
        const yb = g.hanche + g.cuisse * (haut.long || 1.6), yh = g.hanche;
        const wh = ew + 3 + (hw + 23 - ew) * (yh - y0) / (yb - y0);
        const st = { fill: haut.couleur, stroke: teinte(haut.couleur, -0.3), 'stroke-width': 2, 'stroke-linejoin': 'round' };
        el('path', Object.assign({ d: `M${-wh},${yh - 8} L${wh},${yh - 8} L${hw + 26},${yb} Q0,${yb + 10} ${-hw - 26},${yb} Z` }, st), J);
        if (haut.motif) this._motif(J, haut, -hw - 12, yh, hw * 2 + 24, yb - yh);
        el('path', Object.assign({ d: `M${-ew - 3},${y0} Q0,${y0 - 8} ${ew + 3},${y0} L${wh},${yh} L${-wh},${yh} Z` }, st), G);
        el('rect', { x: -wh + 2, y: yh - 10, width: wh * 2 - 4, height: 12, fill: haut.couleur }, G);
        if (haut.motif) this._motif(G, haut, -ew + 2, g.epaule + 6, ew * 2 - 4, yh - g.epaule - 6);
        this.jupeLong = Math.max(this.jupeLong, yb - yh);
      }
      if (c.ceinture) el('rect', { x: -hw - 6, y: g.hanche - 10, width: hw * 2 + 12, height: 7, rx: 3, fill: c.ceinture }, G);
      if (c.collier) {
        for (let i = -2; i <= 2; i++) el('circle', { cx: i * (ew * 0.3), cy: g.epaule + 3 + Math.abs(i) * -1.5 + 4 - Math.abs(i) * 0, r: 3.2, fill: c.collier }, G);
      }
    }

    _motif(G, piece, x, y, w, h) {
      const col = piece.motifCouleur || teinte(piece.couleur, -0.35);
      if (piece.motif === 'bandes') {
        for (let i = 1; i < 4; i++) el('line', { x1: x + 4, y1: y + (h * i) / 4, x2: x + w - 4, y2: y + (h * i) / 4, stroke: col, 'stroke-width': 3, opacity: 0.85 }, G);
      } else if (piece.motif === 'points') {
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
          el('circle', { cx: x + w * (0.25 + i * 0.25), cy: y + h * (0.22 + j * 0.28), r: 2.6, fill: col }, G);
      } else if (piece.motif === 'chevrons') {
        for (let i = 1; i < 4; i++) {
          const yy = y + (h * i) / 4;
          el('path', { d: `M${x + 4},${yy} l${w / 4},-6 l${w / 4},6 l${w / 4},-6 l${w / 4 - 8},6`, stroke: col, 'stroke-width': 2.5, fill: 'none' }, G);
        }
      }
    }

    _feuilles(G) {
      // Le grand costume de feuilles de Dwo : franges qui couvrent le corps.
      const g = this.g, c = this.costume.haut;
      this.franges = [];
      const r = rng(11);
      const rangs = 6;
      for (let k = 0; k < rangs; k++) {
        const y = g.epaule - 6 + k * ((g.hanche + g.cuisse * 1.6 - g.epaule) / rangs);
        const larg = g.epW + 16 + k * 6;
        const rang = el('g', { transform: `translate(0,${y})` }, G);
        for (let i = 0; i < 14; i++) {
          const x = -larg + (i / 13) * larg * 2;
          const l = 42 + r() * 26;
          const col = [c.couleur, teinte(c.couleur, -0.2), teinte(c.couleur, 0.15), '#b5893b'][Math.floor(r() * 4)];
          el('path', { d: `M${x},0 q${(r() - 0.5) * 16},${l * 0.5} ${(r() - 0.5) * 12},${l}`, stroke: col, 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, rang);
        }
        this.franges.push({ rang, y });
      }
    }

    _tete(G) {
      const d = this.def, g = this.g, c = this.costume;
      const tr = g.tr, cy = -g.th / 2;
      const rx = (g.tw / 2), ry = g.th / 2;
      const peau = d.peau, bord = teinte(peau, -0.35);
      const forme = d.tete.forme;
      // cou
      el('line', { x1: 0, y1: 0, x2: 0, y2: -6, stroke: peau, 'stroke-width': g.ep, 'stroke-linecap': 'round' }, G);

      // Coiffure arrière
      const ch = d.cheveux, chc = d.cheveuxCouleur || '#1d140f';
      if (ch === 'tresses') {
        for (let i = -2; i <= 2; i++) el('path', { d: `M${i * rx * 0.35},${cy - ry * 0.8} q${i * 6},${ry * 1.2} ${i * 10},${ry * 1.7}`, stroke: chc, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, G);
      }
      if (ch === 'chignon') el('ellipse', { cx: -rx * 0.15, cy: cy - ry * 1.15, rx: rx * 0.55, ry: ry * 0.5, fill: chc }, G);

      // Forme de tête
      const attrs = { fill: peau, stroke: bord, 'stroke-width': 2.5 };
      if (forme === 'rond' || forme === 'ovale' || forme === 'long') {
        el('ellipse', Object.assign({ cx: 0, cy, rx, ry }, attrs), G);
      } else if (forme === 'carre') {
        el('rect', Object.assign({ x: -rx, y: cy - ry, width: rx * 2, height: ry * 2, rx: rx * 0.35 }, attrs), G);
      } else if (forme === 'poire') {
        el('path', Object.assign({ d: `M0,${cy - ry} C${rx * 0.75},${cy - ry} ${rx * 0.8},${cy - ry * 0.2} ${rx},${cy + ry * 0.35} C${rx * 1.05},${cy + ry} ${-rx * 1.05},${cy + ry} ${-rx},${cy + ry * 0.35} C${-rx * 0.8},${cy - ry * 0.2} ${-rx * 0.75},${cy - ry} 0,${cy - ry} Z` }, attrs), G);
      } else if (forme === 'masque') {
        // Masque de feuilles : visage de bois allongé, crête
        el('path', Object.assign({ d: `M0,${cy - ry * 1.5} L${rx * 0.9},${cy - ry * 0.3} L${rx * 0.7},${cy + ry} L${-rx * 0.7},${cy + ry} L${-rx * 0.9},${cy - ry * 0.3} Z` }, attrs), G);
        for (let i = -3; i <= 3; i++) el('path', { d: `M${i * rx * 0.22},${cy - ry * 1.2} q${i * 4},-30 ${i * 9},-48`, stroke: i % 2 ? '#4f7d2c' : '#6a9a35', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, G);
      } else if (forme === 'cornu') {
        el('path', { d: `M${-rx * 0.6},${cy - ry * 0.6} q${-rx * 0.9},${-ry * 0.4} ${-rx * 1.1},${-ry * 1.5}`, stroke: '#e6dcc0', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, G);
        el('path', { d: `M${rx * 0.6},${cy - ry * 0.6} q${rx * 0.9},${-ry * 0.4} ${rx * 1.1},${-ry * 1.5}`, stroke: '#e6dcc0', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, G);
        el('ellipse', Object.assign({ cx: 0, cy, rx, ry }, attrs), G);
      }

      // Coiffure avant
      if (ch === 'ras') el('path', { d: `M${-rx * 0.95},${cy - ry * 0.25} Q0,${cy - ry * 1.35} ${rx * 0.95},${cy - ry * 0.25} Q0,${cy - ry * 0.8} ${-rx * 0.95},${cy - ry * 0.25}Z`, fill: chc }, G);
      if (ch === 'brosse') el('rect', { x: -rx * 0.85, y: cy - ry * 1.45, width: rx * 1.7, height: ry * 0.75, rx: 4, fill: chc }, G);
      if (ch === 'touffes') {
        el('circle', { cx: -rx * 0.55, cy: cy - ry * 0.95, r: rx * 0.32, fill: chc }, G);
        el('circle', { cx: rx * 0.55, cy: cy - ry * 0.95, r: rx * 0.32, fill: chc }, G);
      }
      if (ch === 'tresses' || ch === 'chignon') el('path', { d: `M${-rx * 0.98},${cy - ry * 0.1} Q0,${cy - ry * 1.45} ${rx * 0.98},${cy - ry * 0.1} Q0,${cy - ry * 0.75} ${-rx * 0.98},${cy - ry * 0.1}Z`, fill: chc }, G);
      if (ch === 'zigzag') {
        el('path', { d: `M${-rx},${cy - ry * 0.4} l${rx * 0.25},${-ry * 1.1} l${rx * 0.2},${ry * 0.5} l${rx * 0.3},${-ry * 1.0} l${rx * 0.25},${ry * 0.6} l${rx * 0.3},${-ry * 0.9} l${rx * 0.2},${ry * 0.6} l${rx * 0.5},${-ry * 0.7} l${-rx * 0.1},${ry * 1.4} Z`, fill: chc, stroke: teinte(chc, -0.3), 'stroke-width': 2 }, G);
      }

      // Couvre-chef
      const t = c.tete;
      if (t && t.type === 'foulard') {
        el('path', { d: `M${-rx * 1.05},${cy - ry * 0.15} Q${-rx * 0.9},${cy - ry * 1.45} 0,${cy - ry * 1.35} Q${rx * 0.9},${cy - ry * 1.45} ${rx * 1.05},${cy - ry * 0.15} Q0,${cy - ry * 0.65} ${-rx * 1.05},${cy - ry * 0.15}Z`, fill: t.couleur, stroke: teinte(t.couleur, -0.3), 'stroke-width': 2 }, G);
        el('path', { d: `M${-rx * 0.9},${cy - ry * 0.4} q${-rx * 0.6},${ry * 0.1} ${-rx * 0.7},${ry * 0.8} q${rx * 0.4},${-ry * 0.2} ${rx * 0.65},${-ry * 0.55}Z`, fill: teinte(t.couleur, -0.15) }, G);
      } else if (t && t.type === 'bonnet') {
        el('path', { d: `M${-rx * 0.95},${cy - ry * 0.35} Q0,${cy - ry * 1.6} ${rx * 0.95},${cy - ry * 0.35} Z`, fill: t.couleur, stroke: teinte(t.couleur, -0.3), 'stroke-width': 2 }, G);
      } else if (t && t.type === 'chapeau') {
        // Chapeau peul : large bord plat, calotte conique, sommet de cuir
        el('ellipse', { cx: 0, cy: cy - ry * 0.6, rx: rx * 1.75, ry: ry * 0.16, fill: t.couleur, stroke: teinte(t.couleur, -0.3), 'stroke-width': 2 }, G);
        el('path', { d: `M${-rx * 0.8},${cy - ry * 0.62} Q${-rx * 0.6},${cy - ry * 1.5} 0,${cy - ry * 1.85} Q${rx * 0.6},${cy - ry * 1.5} ${rx * 0.8},${cy - ry * 0.62} Z`, fill: t.couleur, stroke: teinte(t.couleur, -0.3), 'stroke-width': 2 }, G);
        el('path', { d: `M${-rx * 0.25},${cy - ry * 1.62} L0,${cy - ry * 2.05} L${rx * 0.25},${cy - ry * 1.62} Z`, fill: '#6b3a1e' }, G);
        el('path', { d: `M${-rx * 0.78},${cy - ry * 0.75} Q0,${cy - ry * 0.9} ${rx * 0.78},${cy - ry * 0.75}`, stroke: '#6b3a1e', 'stroke-width': 5, fill: 'none' }, G);
      }

      // Visage (décalé vers l'avant pour suggérer le 3/4)
      const fx = rx * 0.18;
      this.visage = el('g', { transform: `translate(${fx},0)` }, G);
      const V = this.visage;
      const ey = cy - ry * 0.08 + (d.tete.yeuxY || 0) * ry;
      const ex = rx * 0.38;
      const yeux = d.yeux || 'ronds';
      const er = { ronds: [7, 7], grands: [10, 10], amande: [9, 5.5], petits: [5, 4.2], braise: [8, 6] }[yeux];
      const ext = d.couleurYeux || '#fff';
      this.yeuxG = [];
      for (const s of [-1, 1]) {
        const eg = el('g', { transform: `translate(${s * ex},${ey})` }, V);
        const inner = el('g', {}, eg);
        el('ellipse', { cx: 0, cy: 0, rx: er[0], ry: er[1], fill: ext, stroke: bord, 'stroke-width': 1.5 }, inner);
        const pr = yeux === 'petits' ? 3 : er[1] * 0.6;
        const pup = el('circle', { cx: 0, cy: 0, r: pr, fill: yeux === 'braise' ? '#fff6b0' : '#1b120d' }, inner);
        if (yeux !== 'petits' && yeux !== 'braise') el('circle', { cx: pr * 0.35, cy: -pr * 0.4, r: pr * 0.3, fill: '#fff' }, inner);
        this.yeuxG.push({ inner, pup, r: er[0] });
      }
      // Sourcils
      this.sourcilsG = [];
      const sb = d.sourcils || 'fins';
      if (sb !== 'aucun') {
        for (const s of [-1, 1]) {
          const b = el('line', { stroke: d.sourcilsCouleur || chc, 'stroke-width': sb === 'epais' ? 6 : 3.2, 'stroke-linecap': 'round' }, V);
          this.sourcilsG.push({ b, s, x: s * ex, y: ey - er[1] - 6, w: er[0] + 2 });
        }
      }
      // Nez
      const nz = d.nez || 'rond';
      if (nz === 'rond') el('ellipse', { cx: 0, cy: ey + ry * 0.3, rx: rx * 0.12, ry: rx * 0.09, fill: teinte(peau, -0.2) }, V);
      if (nz === 'long') el('path', { d: `M0,${ey + 2} l${rx * 0.12},${ry * 0.38} l${-rx * 0.14},2`, stroke: bord, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, V);
      if (nz === 'large') el('path', { d: `M${-rx * 0.17},${ey + ry * 0.36} q${rx * 0.17},${ry * 0.12} ${rx * 0.34},0`, stroke: bord, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, V);
      // Joues
      if (d.joues) for (const s of [-1, 1]) el('circle', { cx: s * ex * 1.25, cy: ey + ry * 0.38, r: rx * 0.15, fill: '#d9775f', opacity: 0.45 }, V);
      // Scarifications (marques de visage)
      if (d.scarif) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) el('line', { x1: s * ex * 1.15, y1: ey + 6 + i * 5, x2: s * ex * 1.6, y2: ey + 6 + i * 5, stroke: bord, 'stroke-width': 1.8 }, V);
      // Bouche
      this.mouthY = ey + ry * 0.58;
      this.mouthW = rx * (d.boucheL || 0.3);
      this.bouche = el('path', { fill: '#5a1d16', stroke: '#3d120d', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, V);
      // Barbe (dessinée après la bouche, mais sous le menton)
      if (d.barbe === 'barbiche') el('path', { d: `M${-rx * 0.15},${cy + ry * 0.92} q${rx * 0.15},${ry * 0.55} ${rx * 0.3},0`, fill: d.barbeCouleur || '#ddd', stroke: d.barbeCouleur || '#ddd', 'stroke-width': 3 }, V);
      if (d.barbe === 'longue') el('path', { d: `M${-rx * 0.7},${cy + ry * 0.55} Q${-rx * 0.5},${cy + ry * 2.1} 0,${cy + ry * 2.3} Q${rx * 0.5},${cy + ry * 2.1} ${rx * 0.7},${cy + ry * 0.55} Q0,${cy + ry * 1.05} ${-rx * 0.7},${cy + ry * 0.55}Z`, fill: d.barbeCouleur || '#f2efe6', stroke: '#b9a77e', 'stroke-width': 2 }, V);
      if (d.barbe === 'courte') el('path', { d: `M${-rx * 0.8},${cy + ry * 0.45} Q0,${cy + ry * 1.35} ${rx * 0.8},${cy + ry * 0.45} Q0,${cy + ry * 1.0} ${-rx * 0.8},${cy + ry * 0.45}Z`, fill: d.barbeCouleur || '#1d140f' }, V);
    }

    /** Fait tenir un objet (groupe SVG) dans une main. vertical : garde l'objet droit. */
    tenir(objet, main, opts) {
      const m = main === 'R' ? this.bR.main : this.bA.main;
      const wrap = el('g', {}, m);
      wrap.appendChild(objet);
      this.tenus.push({ wrap, main, opts: opts || {} });
      return wrap;
    }

    rendre(t) {
      const p = this.p, g = this.g;
      this.root.setAttribute('transform', `translate(${p.x},${p.y}) rotate(${p.rot}) scale(${p.s * p.dir},${p.s})`);
      this.root.setAttribute('opacity', p.alpha);
      this.root.style.display = p.alpha <= 0.001 ? 'none' : '';
      this.ombre.setAttribute('opacity', p.rot ? 0 : 0.18);

      // Cycle de marche additionnel
      const ph = p.marche * Math.PI * 2, a = p.marcheAmp;
      const sw = Math.sin(ph);
      const jA = p.jA + a * 28 * sw, jR = p.jR - a * 28 * sw;
      const gA = p.gA + a * Math.max(0, -Math.cos(ph)) * 35, gR = p.gR + a * Math.max(0, Math.cos(ph)) * 35;
      const bA = p.bA - a * 24 * sw, bR = p.bR + a * 24 * sw;
      const bob = p.bob - a * Math.abs(Math.cos(ph)) * 5;

      // Assis : cuisses à l'horizontale
      const as = p.assis;
      const jA2 = jA + as * (85 - jA), jR2 = jR + as * (80 - jR);
      const gA2 = gA + as * (85 - gA), gR2 = gR + as * (85 - gR);
      const dy = as * g.cuisse * 0.95;

      const hy = g.hanche;
      this.corps.setAttribute('transform', `translate(0,${bob + dy})`);
      this.buste.setAttribute('transform', `rotate(${p.lean},0,${hy})`);
      this.jA.cuisse.setAttribute('transform', `translate(0,${hy}) rotate(${-jA2})`);
      this.jA.tibia.setAttribute('transform', `translate(0,${g.cuisse}) rotate(${gA2})`);
      this.jR.cuisse.setAttribute('transform', `translate(${-3},${hy}) rotate(${-jR2})`);
      this.jR.tibia.setAttribute('transform', `translate(0,${g.cuisse}) rotate(${gR2})`);
      this.bA.haut.setAttribute('transform', `translate(0,${g.epaule}) rotate(${-bA})`);
      this.bA.bas.setAttribute('transform', `translate(0,${g.bras}) rotate(${-p.cA})`);
      this.bR.haut.setAttribute('transform', `translate(${-4},${g.epaule}) rotate(${-bR})`);
      this.bR.bas.setAttribute('transform', `translate(0,${g.bras}) rotate(${-p.cR})`);
      this.tete.setAttribute('transform', `translate(0,${g.cou}) rotate(${-p.tete})`);
      if (this.jupeLong) {
        // Assis : une jupe se tasse jusqu'au sol ; un pan de boubou se couche sur les cuisses.
        if (this.jupeTasse) {
          const k = Math.min(1, (g.L - dy + 4) / this.jupeLong);
          this.jupe.setAttribute('transform', as ? `translate(0,${hy}) scale(1,${k}) translate(0,${-hy})` : '');
        } else {
          const k = 1 + as * (Math.min(1, (g.cuisse * 1.15) / this.jupeLong) - 1);
          this.jupe.setAttribute('transform', as ? `rotate(${-78 * as},0,${hy}) translate(0,${hy}) scale(1,${k}) translate(0,${-hy})` : '');
        }
      }

      for (const o of this.tenus) {
        const ang = o.main === 'R' ? bR + p.cR : bA + p.cA;
        const rot = o.opts.vertical ? ang - p.lean : (o.opts.angle || 0);
        o.wrap.setAttribute('transform', `rotate(${rot})`);
      }

      // Visage
      const clign = ((t + this.phaseClin) % 4.1) < 0.13 ? 1 : 0;
      const yeux = Math.min(1, Math.max(p.yeux, clign));
      for (const e of this.yeuxG) {
        e.inner.setAttribute('transform', `scale(1,${Math.max(0.08, 1 - yeux)})`);
        e.pup.setAttribute('cx', p.regard * e.r * 0.45);
      }
      for (const b of this.sourcilsG) {
        const yi = b.y - p.sourcilsH * 6 + p.sourcils * 4, yo = b.y - p.sourcilsH * 6 - p.sourcils * 2;
        // extrémité intérieure (côté nez) = x proche de 0
        b.b.setAttribute('x1', b.x - b.s * b.w * 0.2); b.b.setAttribute('y1', yi);
        b.b.setAttribute('x2', b.x + b.s * b.w); b.b.setAttribute('y2', yo);
      }
      const parle = p.parleAmp * (0.5 + 0.5 * Math.sin(p.parle * Math.PI * 2 * 1.7)) * Math.abs(Math.sin(p.parle * Math.PI * 2 * 0.43 + 0.6));
      const o = Math.min(1, p.bouche + parle * 0.7);
      const mw = this.mouthW, s = p.sourire * 6, my = this.mouthY;
      this.bouche.setAttribute('d', `M${-mw},${my - s * 0.4} Q0,${my + s} ${mw},${my - s * 0.4} Q0,${my + s + o * 16} ${-mw},${my - s * 0.4} Z`);

      // Frisson (feuilles, herbes)
      if (this.franges) this.franges.forEach((f, i) => {
        f.rang.setAttribute('transform', `translate(${Math.sin(t * 9 + i) * 3 * p.frisson},${f.y}) rotate(${Math.sin(t * 7 + i * 1.3) * 6 * p.frisson})`);
      });
      if (this.herbes) this.herbes.setAttribute('transform', `rotate(${Math.sin(t * 6) * 4 * p.frisson},0,${hy})`);
      if (this.halo) this.halo.setAttribute('opacity', 0.35 + 0.35 * p.lueur + Math.sin(t * 2) * 0.05);
    }
  }

  // ------------------------------------------------------------------ Animal (quadrupède)
  class Animal {
    constructor(parent, def, pose) {
      this.def = def;
      this.p = Object.assign({ x: 0, y: 900, s: 1, dir: 1, alpha: 1, marche: 0, marcheAmp: 0, tete: 0, gueule: 0, queue: 0, couche: 0 }, pose || {});
      const c = def.couleur, f = teinte(c, -0.3);
      this.root = el('g', { class: 'animal' }, parent);
      el('ellipse', { cx: 0, cy: 2, rx: 70, ry: 7, fill: '#000', opacity: 0.18 }, this.root);
      this.corps = el('g', {}, this.root);
      this.pattes = [];
      const lp = def.pattes || 55;
      for (const [x, coul] of [[-40, f], [38, f], [-30, c], [48, c]]) {
        const pg = el('g', {}, this.corps);
        el('line', { x1: 0, y1: 0, x2: 0, y2: lp, stroke: coul, 'stroke-width': 9, 'stroke-linecap': 'round' }, pg);
        this.pattes.push({ pg, x });
      }
      this.lp = lp;
      this.queueG = el('g', {}, this.corps);
      el('path', { d: 'M0,0 q-25,10 -40,35', stroke: c, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, this.queueG);
      // Corps de hyène : plus haut à l'avant
      el('path', { d: `M-60,${-lp - 10} Q-55,${-lp - 42} 0,${-lp - 46} Q50,${-lp - 64} 70,${-lp - 30} Q70,${-lp + 6} 20,${-lp + 4} Q-50,${-lp + 8} -60,${-lp - 10}Z`, fill: c, stroke: f, 'stroke-width': 2.5 }, this.corps);
      for (let i = 0; i < 6; i++) el('circle', { cx: -40 + i * 18, cy: -lp - 24 - (i % 2) * 10, r: 5, fill: f, opacity: 0.8 }, this.corps);
      el('path', { d: `M-10,${-lp - 50} q30,-26 70,-10`, stroke: f, 'stroke-width': 6, fill: 'none' }, this.corps); // crinière
      this.teteG = el('g', {}, this.corps);
      el('path', { d: 'M0,0 L48,6 Q60,14 52,26 L10,30 Q-8,22 0,0Z', fill: c, stroke: f, 'stroke-width': 2.5 }, this.teteG);
      el('ellipse', { cx: 6, cy: -6, rx: 9, ry: 13, fill: f }, this.teteG);
      el('circle', { cx: 24, cy: 10, r: 4, fill: '#fff4a0' }, this.teteG);
      el('circle', { cx: 25, cy: 10, r: 2, fill: '#111' }, this.teteG);
      el('circle', { cx: 56, cy: 15, r: 4, fill: '#111' }, this.teteG);
      this.machoire = el('path', { d: 'M12,28 L50,26 L44,34 L14,34Z', fill: f }, this.teteG);
      this.rendre(0);
    }
    rendre(t) {
      const p = this.p, lp = this.lp;
      this.root.setAttribute('transform', `translate(${p.x},${p.y}) scale(${p.s * p.dir},${p.s})`);
      this.root.setAttribute('opacity', p.alpha);
      this.root.style.display = p.alpha <= 0.001 ? 'none' : '';
      const ph = p.marche * Math.PI * 2;
      this.corps.setAttribute('transform', `translate(0,${-Math.abs(Math.sin(ph)) * 4 * p.marcheAmp + p.couche * lp * 0.75})`);
      this.pattes.forEach((pt, i) => {
        const a = Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 26 * p.marcheAmp;
        const ac = p.couche * (i < 2 ? -75 : 75);
        pt.pg.setAttribute('transform', `translate(${pt.x},${-lp}) rotate(${a + ac})`);
      });
      this.teteG.setAttribute('transform', `translate(62,${-lp - 44}) rotate(${p.tete})`);
      this.machoire.setAttribute('transform', `rotate(${p.gueule * 18},14,28)`);
      this.queueG.setAttribute('transform', `translate(-58,${-lp - 20}) rotate(${Math.sin(t * 5) * 10 + p.queue})`);
    }
  }

  // ------------------------------------------------------------------ Moteur
  const R = {
    W, H, el, rng, teinte, id, EXPRESSIONS, Perso, Animal,
    acteurs: [], scenes: [], tl: null, langue: 'fr',

    init(conteneur, opts) {
      this.opts = opts || {};
      this.langue = new URLSearchParams(location.search).get('lang') || this.opts.langue || 'fr';
      this.svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet', class: 'racines' }, conteneur);
      this.defs = el('defs', {}, this.svg);
      const flou = (nom, s) => { const f = el('filter', { id: nom, x: '-50%', y: '-50%', width: '200%', height: '200%' }, this.defs); el('feGaussianBlur', { stdDeviation: s }, f); };
      flou('flou-fort', 40); flou('flou', 12); flou('flou-leger', 4);
      const lueur = el('filter', { id: 'lueur', x: '-50%', y: '-50%', width: '200%', height: '200%' }, this.defs);
      el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 8, result: 'b' }, lueur);
      const mg = el('feMerge', {}, lueur); el('feMergeNode', { in: 'b' }, mg); el('feMergeNode', { in: 'SourceGraphic' }, mg);
      el('clipPath', { id: 'cadre' }, this.defs).appendChild(el('rect', { x: 0, y: 0, width: W, height: H }));
      this.calqueScenes = el('g', { 'clip-path': 'url(#cadre)' }, this.svg);
      this.voile = el('rect', { x: 0, y: 0, width: W, height: H, fill: '#000', opacity: 1, 'pointer-events': 'none' }, this.svg);
      this.calqueTexte = el('g', { class: 'textes' }, this.svg);
      this.flash = el('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff', opacity: 0, 'pointer-events': 'none' }, this.svg);
      this.tl = gsap.timeline({ paused: true });
      gsap.ticker.add(() => this.rendre());
      return this;
    },

    texte(cle) {
      const T = (window.TEXTES && (window.TEXTES[this.langue] || window.TEXTES.fr)) || {};
      return T[cle] !== undefined ? T[cle] : (window.TEXTES && window.TEXTES.fr && window.TEXTES.fr[cle]) || `[${cle}]`;
    },

    /** Crée une scène : groupe propre, caméra propre, monde 1920×1080. */
    scene(nom, duree, construire) {
      const g = el('g', { class: 'scene', 'data-nom': nom, style: 'display:none' }, this.calqueScenes);
      const monde = el('g', {}, g);
      const sc = { nom, g, monde, cam: { x: W / 2, y: H / 2, z: 1, r: 0 }, duree };
      sc.perso = (def, costume, pose, parent) => { const a = new Perso(parent || monde, def, costume, pose); this.acteurs.push({ a, sc }); return a; };
      sc.animal = (def, pose, parent) => { const a = new Animal(parent || monde, def, pose); this.acteurs.push({ a, sc }); return a; };
      sc.calque = () => el('g', {}, monde);
      // Objet animé hors casting (accessoire qui frissonne…) : { rendre(t) } appelé à chaque image.
      sc.anime = (o) => { this.acteurs.push({ a: o, sc }); return o; };
      const debut = this.scenes.reduce((s, x) => s + x.duree, 0);
      sc.debut = debut;
      const tl = gsap.timeline();
      construire(sc, tl, this);
      // Durée imposée par le séquencier : complète si la timeline est plus courte.
      if (tl.duration() < duree) tl.to({}, { duration: duree - tl.duration() });
      sc.duree = Math.max(duree, tl.duration());
      this.tl.set(g, { display: 'inline' }, debut);
      this.tl.add(tl, debut);
      this.tl.set(g, { display: 'none' }, debut + sc.duree);
      this.scenes.push(sc);
      return sc;
    },

    rendre() {
      const t = this.tl ? this.tl.time() : 0;
      for (const sc of this.scenes) {
        if (sc.g.style.display === 'none') continue;
        const c = sc.cam;
        sc.monde.setAttribute('transform', `translate(${W / 2},${H / 2}) rotate(${c.r}) scale(${c.z}) translate(${-c.x},${-c.y})`);
      }
      for (const { a, sc } of this.acteurs) if (sc.g.style.display !== 'none') a.rendre(t);
      if (this.surRendu) this.surRendu(t);
    },

    // ---------------------------------------------------------------- Aides de timeline
    pose(tl, perso, props, at, duree, ease) {
      tl.to(perso.p, Object.assign({ duration: duree === undefined ? 0.4 : duree, ease: ease || 'power2.inOut' }, props), at);
    },
    expr(tl, perso, nom, at, duree) {
      tl.to(perso.p, Object.assign({ duration: duree === undefined ? 0.3 : duree, ease: 'power2.out' }, EXPRESSIONS[nom]), at);
    },
    /** Bouche qui parle (sans son : le mime suffit). */
    parle(tl, perso, at, duree) {
      tl.set(perso.p, { parleAmp: 1 }, at);
      tl.fromTo(perso.p, { parle: 0 }, { parle: duree * 2.2, duration: duree, ease: 'none', immediateRender: false }, at);
      tl.set(perso.p, { parleAmp: 0 }, at + duree);
    },
    /** Marche jusqu'à x (et y optionnel). */
    marche(tl, perso, x, at, duree, opts) {
      opts = opts || {};
      const pas = opts.pas || Math.max(1, Math.round(duree * 1.6));
      tl.to(perso.p, { marcheAmp: opts.amp || 1, duration: 0.2 }, at);
      tl.to(perso.p, { marche: `+=${pas}`, duration: duree, ease: 'none' }, at);
      const dep = { x, duration: duree, ease: opts.ease || 'none' };
      if (opts.y !== undefined) dep.y = opts.y;
      tl.to(perso.p, dep, at);
      tl.to(perso.p, { marcheAmp: 0, duration: 0.25 }, at + duree - 0.15);
    },
    /** Danse sur place : bras alternés, petits sauts, pas. */
    danse(tl, perso, at, duree, opts) {
      opts = opts || {};
      const tempo = opts.tempo || 0.45, n = Math.max(1, Math.floor(duree / tempo));
      const y0 = opts.y !== undefined ? opts.y : perso.p.y;
      tl.to(perso.p, { marcheAmp: 0.7, duration: 0.2 }, at);
      tl.to(perso.p, { marche: `+=${n / 2}`, duration: n * tempo, ease: 'none' }, at);
      for (let i = 0; i < n; i++) {
        const t = at + i * tempo, pair = i % 2 === 0;
        tl.to(perso.p, { bA: pair ? 150 : 40, bR: pair ? 40 : 150, cA: pair ? 30 : 60, cR: pair ? 60 : 30, lean: pair ? 6 : -6, duration: tempo, ease: 'sine.inOut' }, t);
        tl.to(perso.p, { y: y0 - (opts.saut || 18), duration: tempo / 2, ease: 'power1.out' }, t);
        tl.to(perso.p, { y: y0, duration: tempo / 2, ease: 'power1.in' }, t + tempo / 2);
      }
      tl.to(perso.p, { marcheAmp: 0, lean: 0, bA: 8, bR: -8, cA: 12, cR: 12, duration: 0.3 }, at + n * tempo);
    },
    saut(tl, perso, at, hauteur, duree) {
      const y0 = perso.p.y; duree = duree || 0.5;
      tl.to(perso.p, { y: y0 - (hauteur || 60), duration: duree / 2, ease: 'power2.out' }, at);
      tl.to(perso.p, { y: y0, duration: duree / 2, ease: 'power2.in' }, at + duree / 2);
    },
    /** Secousse de caméra. */
    secousse(tl, sc, at, force, duree) {
      const n = Math.round((duree || 0.6) / 0.05), f = force || 12, r = rng(Math.round(at * 100));
      for (let i = 0; i < n; i++) tl.to(sc.cam, { r: (r() - 0.5) * f * 0.15, x: `+=${(r() - 0.5) * f}`, duration: 0.05, ease: 'none' }, at + i * 0.05);
      tl.to(sc.cam, { r: 0, duration: 0.1 }, at + n * 0.05);
    },
    cam(tl, sc, props, at, duree, ease) {
      tl.to(sc.cam, Object.assign({ duration: duree === undefined ? 2 : duree, ease: ease || 'sine.inOut' }, props), at);
    },
    fonduEntree(tl, at, duree) { tl.fromTo(this.voile, { opacity: 1 }, { opacity: 0, duration: duree || 1, ease: 'none', immediateRender: false }, at || 0); },
    fonduSortie(tl, at, duree) { tl.fromTo(this.voile, { opacity: 0 }, { opacity: 1, duration: duree || 1, ease: 'none', immediateRender: false }, at); },
    eclairBlanc(tl, at, duree) {
      tl.fromTo(this.flash, { opacity: 0 }, { opacity: 1, duration: 0.06, immediateRender: false }, at);
      tl.to(this.flash, { opacity: 0, duration: duree || 0.6, ease: 'power2.in' }, at + 0.08);
    },

    /** Sous-plan d'une scène : groupe visible de `debut` à `fin` (temps locaux). `g.sous` se
     *  passe aux décors composés comme une scène. */
    plan(sc, tl, debut, fin) {
      const g = el('g', { style: 'display:none' }, sc.monde);
      tl.set(g, { display: 'inline' }, debut);
      if (fin !== undefined) tl.set(g, { display: 'none' }, fin);
      g.sous = { calque: () => el('g', {}, g), monde: g };
      return g;
    },
    /** Objets tenus ou posés : visibilité initiale, apparition, disparition. */
    objet(g, visible) { g.setAttribute('opacity', visible ? 1 : 0); return g; },
    montrer(tl, g, at, d) { tl.to(g, { opacity: 1, duration: d || 0.25 }, at); },
    cacher(tl, g, at, d) { tl.to(g, { opacity: 0, duration: d || 0.25 }, at); },
    /** Lumière qui tombe du ciel jusqu'au sol (arrivée d'un esprit). */
    chute(tl, parent, couleur, x, y, at, duree) {
      const l = R.D.lumiere(parent, 0, 0, 18, couleur);
      l.setAttribute('opacity', 0);
      tl.fromTo(l, { x, y: y - 1300, opacity: 1 }, { y, duration: duree || 0.7, ease: 'power2.in', immediateRender: false }, at);
      tl.to(l, { scale: 4, opacity: 0, transformOrigin: '50% 50%', duration: 0.5 }, at + (duree || 0.7));
      return l;
    },
    /** Bouffée de particules (pool de D.particules) : poussière, étincelles, feuilles.
     *  k varie la gerbe d'un coup à l'autre. o : { n, ecart, haut, duree }. */
    jaillir(tl, pool, at, k, o) {
      o = o || {};
      const ps = pool.liste, mx = +ps[0].getAttribute('cx'), my = +ps[0].getAttribute('cy');
      const n = o.n || 4, ec = o.ecart || 22, ht = o.haut || 25;
      for (let j = 0; j < n; j++) {
        const p = ps[(k * n + j) % ps.length];
        const dx = (j - (n - 1) / 2) * ec + ((k * 7) % 5) * 3, dy = -ht - ((k + j) % 3) * ht * 0.48;
        tl.fromTo(p, { attr: { cx: mx, cy: my }, opacity: 0.9 }, { attr: { cx: mx + dx, cy: my + dy }, opacity: 0, duration: o.duree || 0.55, ease: 'power1.out', immediateRender: false }, at);
      }
    },

    // ---------------------------------------------------------------- Textes (traduisibles)
    _txt(parent, x, y, contenu, taille, attrs) {
      const t = el('text', Object.assign({ x, y, 'font-size': taille, 'text-anchor': 'middle', 'font-family': '"Segoe UI", "Noto Sans", Arial, sans-serif', fill: '#f6ead2' }, attrs || {}), parent);
      t.textContent = contenu;
      return t;
    },
    /** Grand carton titre centré. */
    titre(tl, at, duree, cleTitre, cleSous, y) {
      const g = el('g', { opacity: 0, transform: `translate(0,${(y || H / 2) - H / 2})` }, this.calqueTexte);
      this._txt(g, W / 2, H / 2 - 10, this.texte(cleTitre), 92, { 'font-family': 'Georgia, "Noto Serif", serif', 'font-weight': 'bold', stroke: '#2a1408', 'stroke-width': 3, 'paint-order': 'stroke' });
      if (cleSous) this._txt(g, W / 2, H / 2 + 60, this.texte(cleSous), 38, { 'font-style': 'italic', fill: '#e9c46a', stroke: '#2a1408', 'stroke-width': 2, 'paint-order': 'stroke' });
      tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 1, immediateRender: false }, at);
      tl.to(g, { opacity: 0, duration: 1 }, at + duree - 1);
      return g;
    },
    /** Cartouche bas d'écran : présente un lieu ou un personnage. Texte : "Nom|description". */
    cartouche(tl, at, duree, cle, cote) {
      const [nom, desc] = String(this.texte(cle)).split('|');
      const g = el('g', { opacity: 0 }, this.calqueTexte);
      const x = cote === 'droite' ? W - 110 : 110;
      const anchor = cote === 'droite' ? 'end' : 'start';
      const larg = Math.max(nom.length * 30, (desc || '').length * 15) + 60;
      el('rect', { x: cote === 'droite' ? x - larg + 30 : x - 30, y: H - 190, width: larg, height: desc ? 118 : 80, rx: 14, fill: '#1c0f08', opacity: 0.72 }, g);
      el('rect', { x: cote === 'droite' ? x + 18 : x - 30, y: H - 190, width: 12, height: desc ? 118 : 80, rx: 4, fill: '#d98a2b' }, g);
      this._txt(g, x, H - 135, nom, 50, { 'text-anchor': anchor, 'font-family': 'Georgia, "Noto Serif", serif', 'font-weight': 'bold' });
      if (desc) this._txt(g, x, H - 92, desc, 30, { 'text-anchor': anchor, fill: '#e9c46a' });
      tl.fromTo(g, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, immediateRender: false }, at);
      tl.to(g, { opacity: 0, duration: 0.6 }, at + duree - 0.6);
      return g;
    },
    /** Générique : liste de clés, défilement doux. */
    generique(tl, at, duree, cles) {
      const g = el('g', { opacity: 0 }, this.calqueTexte);
      el('rect', { x: 0, y: 0, width: W, height: H, fill: '#120a05' }, g);
      cles.forEach((c, i) => {
        const v = this.texte(c);
        const premier = i === 0;
        this._txt(g, W / 2, 300 + i * 78 + (premier ? 0 : 40), v, premier ? 64 : 32, premier ? { 'font-family': 'Georgia, serif', 'font-weight': 'bold', fill: '#e9c46a' } : { fill: '#e8dcc4' });
      });
      tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 1.2, immediateRender: false }, at);
      tl.to(g, { opacity: 0, duration: 1.2 }, at + duree - 1.2);
      return g;
    },

    // ---------------------------------------------------------------- Lecteur
    lecteur() {
      const tl = this.tl;
      const q = new URLSearchParams(location.search);
      const barre = document.getElementById('barre');
      if (q.get('capture')) { document.body.classList.add('capture'); if (barre) barre.style.display = 'none'; tl.seek(parseFloat(q.get('t') || 0)); this.rendre(); window.__pret = true; return; }
      if (!barre) return;
      const bouton = barre.querySelector('#lecture'), curseur = barre.querySelector('#curseur'), temps = barre.querySelector('#temps'), liste = barre.querySelector('#scenes');
      curseur.max = tl.duration();
      const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
      this.scenes.forEach((sc, i) => { const o = document.createElement('option'); o.value = sc.debut; o.textContent = `${i + 1}. ${sc.nom} (${fmt(sc.debut)})`; liste.appendChild(o); });
      const maj = () => { curseur.value = tl.time(); temps.textContent = `${fmt(tl.time())} / ${fmt(tl.duration())}`; bouton.textContent = tl.paused() ? '▶' : '❚❚'; };
      tl.eventCallback('onUpdate', maj);
      bouton.onclick = () => { if (tl.progress() >= 1) tl.seek(0); tl.paused(!tl.paused()); maj(); };
      curseur.oninput = () => { tl.pause(); tl.seek(parseFloat(curseur.value)); maj(); };
      liste.onchange = () => { tl.seek(parseFloat(liste.value) + 0.01); maj(); };
      document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') { e.preventDefault(); bouton.onclick(); }
        if (e.code === 'ArrowRight') { tl.seek(Math.min(tl.duration(), tl.time() + 5)); maj(); }
        if (e.code === 'ArrowLeft') { tl.seek(Math.max(0, tl.time() - 5)); maj(); }
      });
      tl.seek(parseFloat(q.get('t') || 0));
      maj();
      if (q.get('auto') !== '0') tl.play();
      window.RACINES = this;
    },
  };

  window.R = R;
})();
