/*
 * Racines — bestiaire animé (même principe que Perso : un objet d'état `p` animé par GSAP,
 * un rendu par image). Les fiches sont dans bible/personnages.js (window.BESTIAIRE).
 *
 * Pose commune : x, y (sol), s, dir, alpha, rot, bob, marche (phase), marcheAmp, tete (+ = baisse
 * la tête), gueule (0–1), queue (degrés), couche (0–1), yeux (0 ouverts → 1 fermés).
 * Spécifiques : gonfle (crapaud), trompe (éléphant), dresse (serpent), nage (poisson),
 * teinte2 (caméléon : 0 → 1 vers la 2e couleur), langue (caméléon), traits (gazelle),
 * cabre (cheval : 0–1).
 * Types : quadrupede, crocodile, poisson, serpent, crapaud, araignee, oiseau, cameleon.
 */
(function () {
  const { el, teinte } = R;
  const PI2 = Math.PI * 2;
  const POSE = {
    x: 0, y: 900, s: 1, dir: 1, alpha: 1, rot: 0, bob: 0, marche: 0, marcheAmp: 0, tete: 0, gueule: 0,
    queue: 0, couche: 0, yeux: 0, gonfle: 0, trompe: 0, dresse: 0, nage: 0, teinte2: 0, langue: 0,
    traits: 1, cabre: 0,
  };

  function oeil(b, parent, x, y, r, iris) {
    const g = el('g', { transform: `translate(${x},${y})` }, parent);
    const inner = el('g', {}, g);
    el('circle', { cx: 0, cy: 0, r, fill: '#fff8e8', stroke: '#2a1a10', 'stroke-width': 1.4 }, inner);
    el('circle', { cx: r * 0.25, cy: 0, r: r * 0.58, fill: iris || '#1b120d' }, inner);
    el('circle', { cx: r * 0.45, cy: -r * 0.3, r: r * 0.18, fill: '#fff' }, inner);
    b.yeuxG.push(inner);
    return g;
  }

  const TYPES = {};

  // ------------------------------------------------------------------ Quadrupède
  // Fiche : longueur, epaisseur, pattes (hauteur), patteEp, cou, couAngle, tete {l, h, museau},
  // oreilles (pointues | rondes | longues | grandes), cornes (gazelle | zebu | courtes), criniere,
  // queue (fine | touffe | crins | courte), bosse, ventre, motif (taches | raies), sabots,
  // traits (deux traits noirs de la gazelle), trompe, defenses.
  TYPES.quadrupede = {
    construire(b) {
      const d = b.def, c = d.couleur, f = teinte(c, -0.3);
      const H = d.pattes || 60, L = d.longueur || 140, E = d.epaisseur || 50, ep = d.patteEp || 10;
      b.H = H; b.L = L; b.E = E;
      const cy = -H - E * 0.42;
      b.cy = cy;
      const patte = (x, coul) => {
        const haut = el('g', {}, b.corps);
        el('line', { x1: 0, y1: -6, x2: 0, y2: H * 0.52, stroke: coul, 'stroke-width': ep * 1.25, 'stroke-linecap': 'round' }, haut);
        const bas = el('g', { transform: `translate(0,${H * 0.52})` }, haut);
        el('line', { x1: 0, y1: 0, x2: 0, y2: H * 0.48, stroke: coul, 'stroke-width': ep, 'stroke-linecap': 'round' }, bas);
        if (d.sabots) el('rect', { x: -ep * 0.65, y: H * 0.48 - 5, width: ep * 1.3, height: 9, rx: 2, fill: d.sabots }, bas);
        else el('ellipse', { cx: ep * 0.3, cy: H * 0.48, rx: ep * 0.8, ry: ep * 0.45, fill: coul }, bas);
        return { haut, bas, x };
      };
      const ax = L * 0.33, px = -L * 0.33;
      b.pattes = [patte(px + 12, f), patte(ax + 12, f)];
      // Queue
      b.queueG = el('g', { transform: `translate(${-L * 0.47},${cy - E * 0.15})` }, b.corps);
      const q = d.queue || 'fine';
      if (q === 'fine') el('path', { d: 'M0,0 q-20,12 -30,42', stroke: c, 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, b.queueG);
      if (q === 'touffe') { el('path', { d: 'M0,0 q-14,20 -18,60', stroke: c, 'stroke-width': 5, fill: 'none' }, b.queueG); el('ellipse', { cx: -18, cy: 66, rx: 7, ry: 12, fill: d.criniere || f }, b.queueG); }
      if (q === 'crins') el('path', { d: 'M0,-4 q-26,10 -30,78 q14,-30 26,-40 q-4,30 6,40 q4,-40 10,-70Z', fill: d.criniere || f }, b.queueG);
      if (q === 'courte') el('ellipse', { cx: -6, cy: -2, rx: 10, ry: 7, fill: d.ventre || '#fff' }, b.queueG);
      // Corps
      const tronc = el('g', {}, b.corps);
      if (d.bosse) el('ellipse', { cx: L * 0.26, cy: cy - E * 0.42, rx: L * 0.13, ry: E * 0.32, fill: c, stroke: f, 'stroke-width': 2.5 }, tronc);
      el('ellipse', { cx: 0, cy, rx: L / 2, ry: E / 2, fill: c, stroke: f, 'stroke-width': 2.5 }, tronc);
      if (d.ventre) el('ellipse', { cx: 0, cy: cy + E * 0.24, rx: L * 0.36, ry: E * 0.18, fill: d.ventre }, tronc);
      if (d.motif === 'taches') for (let i = 0; i < 9; i++) el('circle', { cx: -L * 0.36 + (i % 5) * L * 0.17, cy: cy - E * 0.2 + Math.floor(i / 5) * E * 0.3, r: E * 0.08, fill: f, opacity: 0.8 }, tronc);
      if (d.motif === 'raies') for (let i = 0; i < 6; i++) el('path', { d: `M${-L * 0.35 + i * L * 0.13},${cy - E * 0.45} q6,${E * 0.35} 0,${E * 0.6}`, stroke: f, 'stroke-width': 4, fill: 'none' }, tronc);
      if (d.flanc) el('path', { d: `M${-L * 0.42},${cy + E * 0.05} Q0,${cy + E * 0.18} ${L * 0.42},${cy + E * 0.05}`, stroke: d.flanc, 'stroke-width': 5, fill: 'none' }, tronc);
      b.selle = el('g', { transform: `translate(${-L * 0.04},${cy - E * 0.38})` }, b.corps);
      b.pattes.push(patte(px, c), patte(ax, c));
      // Cou et tête
      const cou = d.cou || 20, ca = (d.couAngle || 40) * Math.PI / 180;
      b.couG = el('g', { transform: `translate(${L * 0.4},${cy - E * 0.12})` }, b.corps);
      const nx = Math.cos(ca) * cou, ny = -Math.sin(ca) * cou;
      el('line', { x1: -6, y1: 4, x2: nx, y2: ny, stroke: c, 'stroke-width': E * 0.5, 'stroke-linecap': 'round' }, b.couG);
      if (d.criniere && cou > 30) el('path', { d: `M${-8},${-E * 0.2} Q${nx * 0.4},${ny - E * 0.3} ${nx - 4},${ny - E * 0.22} L${nx - 10},${ny} Q${nx * 0.3},${ny * 0.4} -12,${E * 0.05}Z`, fill: d.criniere }, b.couG);
      if (d.criniere && cou <= 30) el('path', { d: `M-14,${-E * 0.35} q${nx * 0.6},-24 ${nx + 6},-6`, stroke: d.criniere, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, b.couG);
      b.teteG = el('g', { transform: `translate(${nx},${ny})` }, b.couG);
      const T = d.tete || { l: 50, h: 34, museau: 0.5 };
      const tl = T.l, th = T.h;
      // Oreilles (derrière)
      const o = d.oreilles || 'pointues';
      if (o === 'pointues') el('path', { d: `M${-tl * 0.15},${-th * 0.35} l-6,${-th * 0.75} l${tl * 0.3},${th * 0.55}Z`, fill: f }, b.teteG);
      if (o === 'rondes') el('circle', { cx: -tl * 0.1, cy: -th * 0.55, r: th * 0.28, fill: f }, b.teteG);
      if (o === 'longues') { b.oreillesG = el('g', { transform: `translate(${-tl * 0.1},${-th * 0.4})` }, b.teteG); el('ellipse', { cx: -6, cy: -th * 0.9, rx: th * 0.2, ry: th * 0.95, fill: c, stroke: f, 'stroke-width': 2, transform: 'rotate(-15)' }, b.oreillesG); el('ellipse', { cx: -4, cy: -th * 0.9, rx: th * 0.08, ry: th * 0.7, fill: '#e8b7a0', transform: 'rotate(-15)' }, b.oreillesG); }
      if (o === 'grandes') { b.oreillesG = el('g', { transform: `translate(${-tl * 0.2},${-th * 0.1})` }, b.teteG); el('path', { d: `M0,${-th * 0.6} C${-tl * 0.9},${-th * 0.9} ${-tl * 0.9},${th * 0.9} ${-tl * 0.1},${th * 0.8}Z`, fill: teinte(c, -0.12), stroke: f, 'stroke-width': 2.5 }, b.oreillesG); }
      // Cornes
      if (d.cornes === 'gazelle') for (const k of [0, 6]) el('path', { d: `M${-tl * 0.05 + k},${-th * 0.4} q${-tl * 0.25},${-th * 0.9} ${-tl * 0.05},${-th * 1.5}`, stroke: '#3a2a1a', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, b.teteG);
      if (d.cornes === 'zebu') el('path', { d: `M${-tl * 0.2},${-th * 0.45} q${-tl * 0.3},${-th * 0.2} ${-tl * 0.25},${-th * 1.2} M${tl * 0.05},${-th * 0.45} q${tl * 0.25},${-th * 0.3} ${tl * 0.05},${-th * 1.25}`, stroke: '#efe6cf', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, b.teteG);
      if (d.cornes === 'courtes') el('path', { d: `M${-tl * 0.1},${-th * 0.45} l-4,-14`, stroke: '#efe6cf', 'stroke-width': 6, 'stroke-linecap': 'round' }, b.teteG);
      // Crâne + museau
      el('ellipse', { cx: 0, cy: 0, rx: tl * 0.42, ry: th * 0.5, fill: c, stroke: f, 'stroke-width': 2.5 }, b.teteG);
      const mz = T.museau === undefined ? 0.5 : T.museau;
      el('path', { d: `M${tl * 0.1},${-th * 0.42} L${tl * (0.55 + mz * 0.4)},${-th * 0.05} Q${tl * (0.62 + mz * 0.4)},${th * 0.2} ${tl * (0.5 + mz * 0.4)},${th * 0.3} L${tl * 0.1},${th * 0.35}Z`, fill: c, stroke: f, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, b.teteG);
      el('circle', { cx: tl * (0.52 + mz * 0.4), cy: th * 0.02, r: th * 0.08, fill: '#1b120d' }, b.teteG);
      b.machoire = el('path', { d: `M${tl * 0.12},${th * 0.3} L${tl * (0.45 + mz * 0.4)},${th * 0.3} L${tl * (0.4 + mz * 0.35)},${th * 0.48} L${tl * 0.14},${th * 0.46}Z`, fill: f }, b.teteG);
      if (d.traits) { b.traitsG = el('g', {}, b.teteG); for (const k of [0, 9]) el('line', { x1: tl * 0.05, y1: -th * 0.12 + k, x2: tl * (0.5 + mz * 0.35), y2: th * 0.02 + k * 0.6, stroke: '#1a120c', 'stroke-width': 4, 'stroke-linecap': 'round' }, b.traitsG); }
      if (d.trompe) {
        b.trompeP = el('path', { stroke: c, 'stroke-width': th * 0.32, fill: 'none', 'stroke-linecap': 'round' }, b.teteG);
        b.trompeB = el('path', { stroke: f, 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '3 9' }, b.teteG);
      }
      if (d.defenses) el('path', { d: `M${tl * 0.3},${th * 0.35} q${tl * 0.3},${th * 0.3} ${tl * 0.5},${th * 0.05}`, stroke: '#f6f0dc', 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, b.teteG);
      oeil(b, b.teteG, tl * 0.08, -th * 0.12, Math.max(4, th * 0.14), d.iris);
      if (o === 'grandes' || o === 'longues') b.teteG.appendChild(b.oreillesG);
    },
    rendre(b, t) {
      const p = b.p, H = b.H, ph = p.marche * PI2, a = p.marcheAmp;
      const cab = p.cabre;
      b.corps.setAttribute('transform', `rotate(${-cab * 35},${-b.L * 0.35},0) translate(0,${p.bob - Math.abs(Math.sin(ph)) * 4 * a + p.couche * H * 0.85})`);
      const dec = [Math.PI, 0, 0, Math.PI];
      b.pattes.forEach((pt, i) => {
        const av = i % 2 === 1;
        const s = Math.sin(ph + dec[i]);
        let ang = s * 30 * a, plie = Math.max(0, -Math.cos(ph + dec[i])) * 40 * a;
        if (av) { ang -= cab * 70; plie += cab * 80; }
        ang += p.couche * (av ? -70 : 70);
        plie += p.couche * 140;
        pt.haut.setAttribute('transform', `translate(${pt.x},${b.cy + b.E * 0.2}) rotate(${-ang})`);
        pt.bas.setAttribute('transform', `translate(0,${H * 0.52}) rotate(${av ? -plie : plie})`);
      });
      b.queueG.setAttribute('transform', `translate(${-b.L * 0.47},${b.cy - b.E * 0.15}) rotate(${Math.sin(t * 4) * 8 + p.queue})`);
      const base = b.couG.getAttribute('data-base') || b.couG.getAttribute('transform');
      b.couG.setAttribute('data-base', base);
      b.couG.setAttribute('transform', `${base} rotate(${p.tete * 0.4 + cab * 20})`);
      const tb = b.teteG.getAttribute('data-base') || b.teteG.getAttribute('transform');
      b.teteG.setAttribute('data-base', tb);
      b.teteG.setAttribute('transform', `${tb} rotate(${p.tete * 0.6})`);
      b.machoire.setAttribute('transform', `rotate(${p.gueule * 22},${b.def.tete ? b.def.tete.l * 0.12 : 6},${b.def.tete ? b.def.tete.h * 0.3 : 10})`);
      if (b.traitsG) b.traitsG.setAttribute('opacity', p.traits);
      if (b.oreillesG) b.oreillesG.setAttribute('transform', `${b.oreillesG.getAttribute('data-b') || (b.oreillesG.setAttribute('data-b', b.oreillesG.getAttribute('transform')), b.oreillesG.getAttribute('transform'))} rotate(${Math.sin(t * 3) * 4})`);
      if (b.trompeP) {
        const T = b.def.tete, x0 = T.l * 0.75, y0 = T.h * 0.1, L = T.h * 2.4, k = p.trompe;
        const d = `M${x0},${y0} Q${x0 + T.l * 0.35},${y0 + L * 0.5 - k * L * 0.6} ${x0 + T.l * 0.15 + k * T.l * 0.6},${y0 + L - k * L * 1.3}`;
        b.trompeP.setAttribute('d', d); b.trompeB.setAttribute('d', d);
      }
    },
  };

  // ------------------------------------------------------------------ Crocodile
  TYPES.crocodile = {
    construire(b) {
      const d = b.def, c = d.couleur, f = teinte(c, -0.3), L = d.longueur || 260;
      b.L = L;
      const cy = -26;
      b.pattes = [];
      const patte = (x, coul) => { const g = el('g', {}, b.corps); el('path', { d: 'M0,0 l10,18 l12,4', stroke: coul, 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); b.pattes.push({ g, x }); return g; };
      patte(-L * 0.18 + 10, f); patte(L * 0.2 + 10, f);
      b.queueP = el('path', { fill: c, stroke: f, 'stroke-width': 2.5 }, b.corps);
      el('ellipse', { cx: 0, cy, rx: L * 0.3, ry: 22, fill: c, stroke: f, 'stroke-width': 2.5 }, b.corps);
      for (let i = 0; i < 8; i++) el('path', { d: `M${-L * 0.25 + i * L * 0.07},${cy - 18} l6,-10 l6,10`, fill: f }, b.corps);
      el('ellipse', { cx: 0, cy: cy + 10, rx: L * 0.24, ry: 8, fill: d.ventre || teinte(c, 0.3) }, b.corps);
      patte(-L * 0.18, c); patte(L * 0.2, c);
      b.teteG = el('g', { transform: `translate(${L * 0.27},${cy - 2})` }, b.corps);
      b.machoire = el('g', {}, b.teteG);
      el('path', { d: `M0,6 L${L * 0.36},10 Q${L * 0.38},16 ${L * 0.34},18 L0,18Z`, fill: f }, b.machoire);
      for (let i = 0; i < 7; i++) el('path', { d: `M${L * 0.05 + i * L * 0.042},10 l3,-6 l3,6`, fill: '#fffbe8' }, b.machoire);
      el('path', { d: `M-6,-16 Q${L * 0.1},-22 ${L * 0.38},2 Q${L * 0.4},10 ${L * 0.34},12 L0,12 Q-10,0 -6,-16Z`, fill: c, stroke: f, 'stroke-width': 2.5 }, b.teteG);
      for (let i = 0; i < 7; i++) el('path', { d: `M${L * 0.06 + i * L * 0.042},12 l3,6 l3,-6`, fill: '#fffbe8' }, b.teteG);
      el('ellipse', { cx: L * 0.04, cy: -18, rx: 11, ry: 8, fill: c, stroke: f, 'stroke-width': 2 }, b.teteG);
      oeil(b, b.teteG, L * 0.045, -20, 6, '#c9a22a');
      el('circle', { cx: L * 0.35, cy: 0, r: 2.5, fill: '#1b120d' }, b.teteG);
    },
    rendre(b, t) {
      const p = b.p, L = b.L, ph = p.marche * PI2, a = p.marcheAmp;
      b.corps.setAttribute('transform', `translate(0,${p.bob})`);
      b.pattes.forEach((pt, i) => pt.g.setAttribute('transform', `translate(${pt.x},-12) rotate(${Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 30 * a})`));
      const w = Math.sin(t * 2.5) * 6 + p.queue + Math.sin(ph) * 14 * a, cy = -26;
      const x0 = -L * 0.26, x1 = -L * 0.95;
      b.queueP.setAttribute('d', `M${x0},${cy - 18} Q${(x0 + x1) / 2},${cy - 12 + w} ${x1},${cy + 8 + w * 1.6} Q${(x0 + x1) / 2},${cy + 14 + w} ${x0},${cy + 18}Z`);
      b.machoire.setAttribute('transform', `rotate(${p.gueule * 28},0,12)`);
      b.teteG.setAttribute('transform', `translate(${L * 0.27},${cy - 2}) rotate(${-p.gueule * 10 + p.tete})`);
    },
  };

  // ------------------------------------------------------------------ Poisson (silure)
  TYPES.poisson = {
    construire(b) {
      const d = b.def, c = d.couleur, f = teinte(c, -0.3), L = d.longueur || 160;
      b.L = L;
      b.queueG = el('g', { transform: `translate(${-L * 0.45},0)` }, b.corps);
      el('path', { d: `M0,0 L${-L * 0.25},${-L * 0.12} Q${-L * 0.2},0 ${-L * 0.25},${L * 0.12}Z`, fill: f }, b.queueG);
      el('path', { d: `M${-L * 0.45},0 Q${-L * 0.1},${-L * 0.2} ${L * 0.3},${-L * 0.14} Q${L * 0.52},${-L * 0.1} ${L * 0.52},0 Q${L * 0.5},${L * 0.12} ${L * 0.3},${L * 0.13} Q${-L * 0.1},${L * 0.15} ${-L * 0.45},0Z`, fill: c, stroke: f, 'stroke-width': 2.5 }, b.corps);
      el('path', { d: `M${-L * 0.2},${-L * 0.16} q${L * 0.15},${-L * 0.08} ${L * 0.3},0`, stroke: f, 'stroke-width': 5, fill: 'none' }, b.corps);
      el('ellipse', { cx: 0, cy: L * 0.08, rx: L * 0.3, ry: L * 0.04, fill: d.ventre || teinte(c, 0.35) }, b.corps);
      b.barbillons = el('g', {}, b.corps);
      for (const [y, l] of [[-0.02, 0.35], [0.03, 0.3], [0.07, 0.24]]) el('path', { d: `M${L * 0.5},${L * y} q${L * 0.15},${L * 0.1} ${L * l},${L * (y + 0.18)}`, stroke: f, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, b.barbillons);
      oeil(b, b.corps, L * 0.36, -L * 0.05, Math.max(4, L * 0.03), '#2a2a12');
      el('path', { d: `M${L * 0.44},${L * 0.05} q${L * 0.05},${L * 0.02} ${L * 0.08},0`, stroke: '#2a1a10', 'stroke-width': 2.5, fill: 'none' }, b.corps);
    },
    rendre(b, t) {
      const p = b.p, w = Math.sin(t * 5 + p.nage * PI2) * (8 + 14 * p.marcheAmp);
      b.corps.setAttribute('transform', `translate(0,${p.bob + Math.sin(t * 1.7) * 3})`);
      b.queueG.setAttribute('transform', `translate(${-b.L * 0.45},0) rotate(${w})`);
      b.barbillons.setAttribute('transform', `rotate(${Math.sin(t * 3) * 3},${b.L * 0.5},0)`);
    },
  };

  // ------------------------------------------------------------------ Serpent
  TYPES.serpent = {
    construire(b) {
      const d = b.def, c = d.couleur;
      b.L = d.longueur || 320;
      b.corpsP = el('path', { stroke: teinte(c, -0.3), 'stroke-width': (d.epaisseur || 20) + 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, b.corps);
      b.corpsC = el('path', { stroke: c, 'stroke-width': d.epaisseur || 20, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, b.corps);
      b.motifP = el('path', { stroke: d.motifCouleur || teinte(c, -0.4), 'stroke-width': (d.epaisseur || 20) * 0.45, fill: 'none', 'stroke-dasharray': '10 14', 'stroke-linecap': 'round' }, b.corps);
      b.teteG = el('g', {}, b.corps);
      b.langueP = el('path', { d: 'M18,4 l16,0 l6,-4 M34,4 l6,4', stroke: '#c0392b', 'stroke-width': 2.5, fill: 'none' }, b.teteG);
      el('ellipse', { cx: 6, cy: 0, rx: 20, ry: 13, fill: c, stroke: teinte(c, -0.3), 'stroke-width': 2.5 }, b.teteG);
      oeil(b, b.teteG, 10, -5, 4.5, '#b8860b');
    },
    rendre(b, t) {
      const p = b.p, n = 26, L = b.L, ph = p.marche * PI2 + t * 1.5;
      const pts = [];
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        let x = -u * L, y = -12 + Math.sin(ph - u * 7) * (10 + 10 * p.marcheAmp) * (0.4 + u * 0.6);
        const lev = Math.max(0, 1 - u * 3.2) * p.dresse;
        y -= lev * L * 0.45; x += lev * L * 0.12;
        pts.push([x, y]);
      }
      const d = 'M' + pts.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' L');
      b.corpsP.setAttribute('d', d); b.corpsC.setAttribute('d', d); b.motifP.setAttribute('d', d);
      const [x0, y0] = pts[0], [x1, y1] = pts[1];
      const ang = Math.atan2(y0 - y1, x0 - x1) * 180 / Math.PI;
      b.teteG.setAttribute('transform', `translate(${x0},${y0}) rotate(${ang + p.tete})`);
      b.langueP.setAttribute('opacity', Math.sin(t * 6) > 0.6 ? 1 : 0);
      b.corps.setAttribute('transform', `translate(0,${p.bob})`);
    },
  };

  // ------------------------------------------------------------------ Crapaud
  TYPES.crapaud = {
    construire(b) {
      const d = b.def, c = d.couleur, f = teinte(c, -0.3), S = d.taille || 60;
      b.S = S;
      b.pattesAr = el('g', {}, b.corps);
      el('path', { d: `M${-S * 0.3},${-S * 0.25} q${-S * 0.4},${S * 0.05} ${-S * 0.35},${S * 0.25} l${S * 0.35},0`, stroke: f, 'stroke-width': S * 0.16, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, b.pattesAr);
      b.sac = el('ellipse', { cx: S * 0.35, cy: -S * 0.22, rx: S * 0.22, ry: S * 0.18, fill: d.sac || '#efe0a8', stroke: f, 'stroke-width': 2 }, b.corps);
      el('path', { d: `M${-S * 0.5},${-S * 0.15} Q${-S * 0.45},${-S * 0.75} ${S * 0.1},${-S * 0.7} Q${S * 0.55},${-S * 0.62} ${S * 0.55},${-S * 0.32} Q${S * 0.4},${-S * 0.05} 0,${-S * 0.05} Q${-S * 0.45},${-S * 0.02} ${-S * 0.5},${-S * 0.15}Z`, fill: c, stroke: f, 'stroke-width': 2.5 }, b.corps);
      for (let i = 0; i < 7; i++) el('circle', { cx: -S * 0.35 + i * S * 0.1, cy: -S * 0.45 + (i % 2) * S * 0.08, r: S * 0.04, fill: f, opacity: 0.7 }, b.corps);
      el('path', { d: `M${S * 0.2},${-S * 0.12} l${S * 0.12},${S * 0.12} l${S * 0.1},0`, stroke: c, 'stroke-width': S * 0.1, fill: 'none', 'stroke-linecap': 'round' }, b.corps);
      el('path', { d: `M${S * 0.18},${-S * 0.35} q${S * 0.2},${S * 0.06} ${S * 0.36},0`, stroke: '#2a1a10', 'stroke-width': 2.5, fill: 'none' }, b.corps);
      el('circle', { cx: S * 0.2, cy: -S * 0.66, r: S * 0.16, fill: c, stroke: f, 'stroke-width': 2 }, b.corps);
      oeil(b, b.corps, S * 0.22, -S * 0.7, S * 0.11, '#2a1a10');
    },
    rendre(b, t) {
      const p = b.p;
      b.sac.setAttribute('transform', `translate(${b.S * 0.35},${-b.S * 0.22}) scale(${1 + p.gonfle * 0.9}) translate(${-b.S * 0.35},${b.S * 0.22})`);
      b.pattesAr.setAttribute('transform', `rotate(${-p.marcheAmp * 40},${-b.S * 0.3},${-b.S * 0.25})`);
      b.corps.setAttribute('transform', `translate(0,${p.bob})`);
    },
  };

  // ------------------------------------------------------------------ Araignée
  TYPES.araignee = {
    construire(b) {
      const d = b.def, c = d.couleur, S = d.taille || 40;
      b.S = S;
      b.fil = el('line', { x1: 0, y1: -S, x2: 0, y2: -S, stroke: '#e8e8e8', 'stroke-width': 1.5, opacity: 0.8 }, b.corps);
      b.pattes = [];
      for (let i = 0; i < 8; i++) {
        const g = el('g', {}, b.corps);
        const cote = i < 4 ? -1 : 1, k = i % 4;
        el('path', { d: `M0,0 l${cote * S * 0.55},${-S * 0.35} l${cote * S * 0.25},${S * 0.85}`, stroke: teinte(c, -0.2), 'stroke-width': 4, fill: 'none', 'stroke-linejoin': 'round' }, g);
        b.pattes.push({ g, k, cote });
      }
      el('circle', { cx: -S * 0.3, cy: -S * 0.75, r: S * 0.42, fill: c }, b.corps);
      el('circle', { cx: S * 0.2, cy: -S * 0.65, r: S * 0.26, fill: teinte(c, 0.1) }, b.corps);
      for (let i = 0; i < 3; i++) el('path', { d: `M${-S * 0.55 + i * S * 0.2},${-S * 1.0} l${S * 0.08},${S * 0.15} l${S * 0.08},-${S * 0.15}`, stroke: d.motifCouleur || '#e9c46a', 'stroke-width': 2.5, fill: 'none' }, b.corps);
      oeil(b, b.corps, S * 0.25, -S * 0.72, S * 0.09); oeil(b, b.corps, S * 0.38, -S * 0.7, S * 0.08);
    },
    rendre(b, t) {
      const p = b.p, ph = p.marche * PI2, S = b.S;
      b.pattes.forEach((pt) => pt.g.setAttribute('transform', `translate(${(pt.k - 1.5) * S * 0.18},${-S * 0.7}) rotate(${Math.sin(ph + pt.k * 1.3 + (pt.cote > 0 ? Math.PI : 0)) * 14 * p.marcheAmp + (pt.k - 1.5) * 12 * pt.cote})`));
      b.fil.setAttribute('y2', -S - p.gonfle);
      b.corps.setAttribute('transform', `translate(0,${p.bob})`);
    },
  };

  // ------------------------------------------------------------------ Oiseau (poule, pintade)
  TYPES.oiseau = {
    construire(b) {
      const d = b.def, c = d.couleur, f = teinte(c, -0.3), S = d.taille || 50;
      b.S = S;
      b.pattes = [];
      for (const x of [-S * 0.1, S * 0.12]) { const g = el('g', {}, b.corps); el('path', { d: `M0,0 l0,${S * 0.42} l${S * 0.14},0`, stroke: '#d98a2b', 'stroke-width': 3.5, fill: 'none' }, g); b.pattes.push({ g, x }); }
      el('path', { d: `M${-S * 0.45},${-S * 0.75} q${-S * 0.3},${-S * 0.35} ${-S * 0.1},${-S * 0.6} q${S * 0.05},${S * 0.4} ${S * 0.15},${S * 0.45}Z`, fill: f }, b.corps);
      el('ellipse', { cx: 0, cy: -S * 0.65, rx: S * 0.45, ry: S * 0.3, fill: c, stroke: f, 'stroke-width': 2 }, b.corps);
      if (d.motif === 'points') for (let i = 0; i < 10; i++) el('circle', { cx: -S * 0.3 + (i % 5) * S * 0.14, cy: -S * 0.75 + Math.floor(i / 5) * S * 0.16, r: 2, fill: '#fff' }, b.corps);
      b.teteG = el('g', { transform: `translate(${S * 0.36},${-S * 0.95})` }, b.corps);
      if (d.crete) el('path', { d: `M${-S * 0.06},${-S * 0.14} q${S * 0.06},${-S * 0.14} ${S * 0.12},0 q${S * 0.04},${-S * 0.1} ${S * 0.1},${S * 0.02}`, fill: d.crete }, b.teteG);
      el('circle', { cx: 0, cy: 0, r: S * 0.15, fill: d.teteCouleur || c, stroke: f, 'stroke-width': 2 }, b.teteG);
      el('path', { d: `M${S * 0.12},${-S * 0.03} l${S * 0.14},${S * 0.05} l${-S * 0.14},${S * 0.05}Z`, fill: '#e9a23b' }, b.teteG);
      oeil(b, b.teteG, S * 0.04, -S * 0.03, S * 0.05);
    },
    rendre(b, t) {
      const p = b.p, ph = p.marche * PI2;
      b.pattes.forEach((pt, i) => pt.g.setAttribute('transform', `translate(${pt.x},${-b.S * 0.42}) rotate(${Math.sin(ph + i * Math.PI) * 25 * p.marcheAmp})`));
      b.teteG.setAttribute('transform', `translate(${b.S * 0.36},${-b.S * 0.95}) rotate(${p.tete})`);
      b.corps.setAttribute('transform', `translate(0,${p.bob})`);
    },
  };

  // ------------------------------------------------------------------ Caméléon
  TYPES.cameleon = {
    construire(b) {
      const d = b.def, c = d.couleur, f = teinte(c, -0.3), S = d.taille || 70;
      b.S = S;
      b.pattes = [];
      for (const x of [-S * 0.3, S * 0.3]) { const g = el('g', {}, b.corps); el('path', { d: `M0,0 l${S * 0.08},${S * 0.22} l${S * 0.08},${S * 0.08}`, stroke: f, 'stroke-width': S * 0.08, fill: 'none', 'stroke-linecap': 'round' }, g); b.pattes.push({ g, x }); }
      el('path', { d: `M${-S * 0.5},${-S * 0.3} q${-S * 0.35},${S * 0.05} ${-S * 0.35},${S * 0.25} q0,${S * 0.15} ${S * 0.15},${S * 0.12} q${S * 0.08},${-S * 0.08} 0,${-S * 0.14}`, stroke: c, 'stroke-width': S * 0.1, fill: 'none', 'stroke-linecap': 'round' }, b.corps);
      const corps = `M${-S * 0.55},${-S * 0.3} Q${-S * 0.3},${-S * 0.72} ${S * 0.2},${-S * 0.6} Q${S * 0.5},${-S * 0.55} ${S * 0.55},${-S * 0.35} Q${S * 0.3},${-S * 0.12} 0,${-S * 0.15} Q${-S * 0.4},${-S * 0.15} ${-S * 0.55},${-S * 0.3}Z`;
      el('path', { d: corps, fill: c, stroke: f, 'stroke-width': 2.5 }, b.corps);
      b.couche2 = el('path', { d: corps, fill: d.couleur2 || '#c8553d', opacity: 0 }, b.corps);
      el('path', { d: `M${S * 0.3},${-S * 0.6} l${S * 0.15},${-S * 0.18} l${S * 0.1},${S * 0.22}`, fill: f }, b.corps);
      for (let i = 0; i < 5; i++) el('path', { d: `M${-S * 0.4 + i * S * 0.15},${-S * 0.55} l${S * 0.05},${S * 0.25}`, stroke: f, 'stroke-width': 2, opacity: 0.6 }, b.corps);
      b.langueP = el('line', { x1: S * 0.55, y1: -S * 0.36, x2: S * 0.55, y2: -S * 0.36, stroke: '#d9653b', 'stroke-width': 4, 'stroke-linecap': 'round' }, b.corps);
      el('circle', { cx: S * 0.36, cy: -S * 0.45, r: S * 0.1, fill: c, stroke: f, 'stroke-width': 2 }, b.corps);
      oeil(b, b.corps, S * 0.38, -S * 0.45, S * 0.06);
    },
    rendre(b, t) {
      const p = b.p, ph = p.marche * PI2;
      b.pattes.forEach((pt, i) => pt.g.setAttribute('transform', `translate(${pt.x},${-b.S * 0.22}) rotate(${Math.sin(ph + i * Math.PI) * 20 * p.marcheAmp})`));
      b.couche2.setAttribute('opacity', p.teinte2);
      b.langueP.setAttribute('x2', b.S * 0.55 + p.langue * b.S * 2.5);
      b.corps.setAttribute('transform', `translate(0,${p.bob})`);
    },
  };

  // ------------------------------------------------------------------ Classe
  class Bete {
    constructor(parent, def, pose) {
      this.def = def;
      this.p = Object.assign({}, POSE, def.pose || {}, pose || {});
      this.yeuxG = [];
      this.phaseClin = ((def.id || 'b').charCodeAt(1) || 3) % 31 / 10;
      this.root = el('g', { class: 'bete', 'data-id': def.id || '' }, parent);
      this.ombre = el('ellipse', { cx: 0, cy: 2, rx: (def.longueur || def.taille || 80) * 0.45, ry: 7, fill: '#000', opacity: def.type === 'poisson' ? 0 : 0.18 }, this.root);
      this.corps = el('g', {}, this.root);
      TYPES[def.type || 'quadrupede'].construire(this);
      this.rendre(0);
    }
    /** Fait monter un personnage (Perso) sur l'animal : il suit ses mouvements. */
    monter(perso) {
      if (!this.selle) return;
      this.selle.appendChild(perso.root);
      // Hanches sur la selle, cuisses vers l'avant, tibias repliés le long du flanc.
      Object.assign(perso.p, { x: 0, y: -perso.g.hanche, assis: 0, dir: 1, jA: 62, gA: 100, jR: 52, gR: 100 });
      this.cavalier = perso;
      return perso;
    }
    rendre(t) {
      const p = this.p;
      this.root.setAttribute('transform', `translate(${p.x},${p.y}) rotate(${p.rot}) scale(${p.s * p.dir},${p.s})`);
      this.root.setAttribute('opacity', p.alpha);
      this.root.style.display = p.alpha <= 0.001 ? 'none' : '';
      TYPES[this.def.type || 'quadrupede'].rendre(this, t);
      const clign = ((t + this.phaseClin) % 3.7) < 0.12 ? 1 : 0;
      const f = Math.max(0.08, 1 - Math.max(p.yeux, clign));
      for (const e of this.yeuxG) e.setAttribute('transform', `scale(1,${f})`);
    }
  }
  R.Bete = Bete;
  R.TYPES_BETES = TYPES;
})();
