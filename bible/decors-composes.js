/*
 * Racines — décors composés réutilisables (voir bible/decors.md).
 * Chaque décor reçoit une scène (sc) et des options, dessine dans sc.monde (arrière-plan)
 * et renvoie ses parties animables + un calque `devant` (au-dessus des personnages)
 * à remplir APRÈS avoir créé les personnages via `sc.calque()` si besoin.
 * Sol par défaut : y = 880 (village, champ, brousse) ou 900 (cour).
 */
window.DECORS = (function () {
  const D = R.D, P = D.PAL;

  const CIELS = {
    jour: ['#7fbcd8', '#f3e0b0'],
    chaud: ['#f4d7a1', '#fbefd2'],
    soir: ['#3b3f7a', '#e8875a'],
    nuit: ['#070a1c', '#1f2a5c'],
    orage: ['#2e3445', '#6b7286'],
  };

  return {
    CIELS,

    /** D01 — Village bwa : maisons de banco à toit plat, greniers, karités, baobab. */
    village(sc, o) {
      o = o || {};
      const fond = sc.calque();
      const c = CIELS[o.ciel || 'jour'];
      const r = { fond };
      r.ciel = D.ciel(fond, c[0], c[1]);
      if (o.ciel === 'nuit') { r.etoiles = D.etoiles(fond, 140, 31); r.lune = D.lune(fond, 1500, 180, 50); }
      if (o.soleil) r.soleil = D.soleil(fond, o.soleil[0], o.soleil[1], o.soleil[2] || 70);
      if (o.voute !== undefined) r.voute = D.voute(fond, o.voute);
      D.collines(fond, 770, o.ciel === 'nuit' ? '#2a2f4f' : '#c49a6c', 4, 50);
      for (const [x, s] of [[-300, 0.5], [180, 0.55], [1250, 0.5], [2200, 0.55]]) D.karite(fond, x, 790, s, o.ciel === 'nuit' ? '#24382a' : '#7d9a50');
      D.sol(fond, 880, o.sol || P.terre, o.ciel === 'nuit' ? '#3a2a20' : undefined);
      r.baobab = D.baobab(fond, -520, 880, 1.1);
      r.maisons = [
        D.maison(fond, -120, 880, 280, 170, { porte: 40 }),
        D.maison(fond, 250, 880, 260, 165, { porte: -40 }),
        D.maison(fond, 1660, 880, 300, 180, { porte: 50 }),
        D.maison(fond, 2180, 880, 260, 160, {}),
      ];
      r.greniers = [D.grenier(fond, 530, 880, 0.9), D.grenier(fond, 1400, 880, 1), D.grenier(fond, 1930, 880, 0.8)];
      D.ronier(fond, 2480, 880, 1.1);
      D.herbes(fond, 880, 60, 8, '#9a8a3a', [-900, 2800]);
      if (o.nuit) { r.nuitVoile = R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#0b1030', opacity: 0.55 }, fond); }
      return r;
    },

    /** D05 — Cour d'une concession : muret, maison, grenier, mortier (devant). */
    cour(sc, o) {
      o = o || {};
      const fond = sc.calque();
      const c = CIELS[o.ciel || 'jour'];
      const r = { fond };
      r.ciel = D.ciel(fond, c[0], c[1]);
      if (o.ciel === 'nuit' || o.etoiles) r.etoiles = D.etoiles(fond, 160, 51);
      if (o.voute !== undefined) r.voute = D.voute(fond, o.voute);
      D.collines(fond, 780, o.ciel === 'nuit' ? '#262b48' : '#c49a6c', 6, 40);
      r.arbre = D.karite(fond, 1680, 830, 0.95, o.ciel === 'nuit' ? '#24382a' : P.vert);
      D.muret(fond, -600, 2500, 860, 95);
      r.maison = D.maison(fond, 330, 900, 320, 190, { porte: 60 });
      D.sol(fond, 900, P.terreSombre, o.ciel === 'nuit' ? '#2c1d14' : P.terre);
      r.grenier = D.grenier(fond, o.grenierX || 1110, 900, 1);
      r.canari = D.canari(fond, 640, 900, 0.9);
      return r;
    },

    /** D04 — Champ de mil : deux champs superposés (sec / vert) pour les fondus. */
    champ(sc, o) {
      o = o || {};
      const fond = sc.calque();
      const c = CIELS[o.ciel || 'chaud'];
      const r = { fond };
      r.ciel = D.ciel(fond, c[0], c[1]);
      r.cielOrage = D.ciel(fond, CIELS.orage[0], CIELS.orage[1]);
      r.cielOrage.setAttribute('opacity', 0);
      if (o.soleil !== false) r.soleil = D.soleil(fond, 1550, 200, 90, '#fff1a8');
      D.collines(fond, 760, '#c7a074', 12, 45);
      D.karite(fond, 200, 770, 0.5, '#8d9a50');
      D.sol(fond, 860, '#b9874f');
      r.sec = D.mil(fond, -100, 2020, 840, 70, 17, { couleur: '#b8a050', epi: '#9a7a3a', h: 170 });
      r.vert = D.mil(fond, -100, 2020, 840, 70, 17, { couleur: '#5f9a35', epi: '#d9b04a', h: 200 });
      r.vert.g.setAttribute('opacity', o.vert ? 1 : 0);
      r.sec.g.setAttribute('opacity', o.vert ? 0 : 1);
      return r;
    },

    /** D02 — Brousse : savane, baobab, karités, termitière. */
    brousse(sc, o) {
      o = o || {};
      const fond = sc.calque();
      const c = CIELS[o.ciel || 'jour'];
      const r = { fond };
      r.ciel = D.ciel(fond, c[0], c[1]);
      D.collines(fond, 740, '#b99a6a', 21, 70);
      D.collines(fond, 800, '#a7895a', 22, 40);
      for (const [x, s] of [[100, 0.6], [700, 0.5], [1800, 0.6]]) D.karite(fond, x, 820, s, '#6f8f45');
      D.sol(fond, 880, '#c09358');
      r.baobab = D.baobab(fond, 260, 890, 1.25);
      r.karite = D.karite(fond, 1050, 890, 1.1);
      r.termitiere = D.termitiere(fond, 1520, 895, 1.3);
      D.herbes(fond, 880, 140, 23, '#a39343', [-800, 2700]);
      // Options ajoutées : mare (x) pour un point d'eau, nuit pour un voile nocturne
      if (o.mare !== undefined) r.mare = D.mare(fond, o.mare, 905, o.mareL || 520);
      if (o.nuit || o.ciel === 'nuit') r.nuitVoile = R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#0b1030', opacity: 0.45 }, fond);
      return r;
    },

    /** D06 — Bois sacré : rideau d'arbres serrés, grand arbre-autel au centre droit.
     *  Options : ciel (soir par défaut, nuit), arbreX. `r.devant()` ajoute des feuillages au
     *  premier plan (à appeler APRÈS les personnages). Sol à 880. */
    bois(sc, o) {
      o = o || {};
      const fond = sc.calque();
      const nuit = o.ciel === 'nuit';
      const c = CIELS[o.ciel || 'soir'];
      const r = { fond };
      r.ciel = D.ciel(fond, c[0], c[1]);
      if (nuit) { r.etoiles = D.etoiles(fond, 120, 41); r.lune = D.lune(fond, 420, 160, 44); }
      D.collines(fond, 740, nuit ? '#1b2140' : '#6d5a5a', 31, 40);
      const fonce = nuit ? '#1a2c22' : '#3f6430', moyen = nuit ? '#223a2b' : '#4f7a38';
      for (let i = 0; i < 10; i++) D.karite(fond, -700 + i * 380, 820 + (i % 2) * 10, 0.75 + (i % 3) * 0.12, i % 2 ? fonce : moyen);
      D.sol(fond, 880, nuit ? '#4a3424' : '#8a6040', nuit ? '#2a1c14' : '#6a4630');
      r.arbre = D.karite(fond, o.arbreX || 1480, 890, 1.7, nuit ? '#24402c' : '#456e34');
      D.ronier(fond, 180, 885, 1.15);
      D.herbes(fond, 880, 90, 37, nuit ? '#4a5a2a' : '#7a7a32', [-900, 2800]);
      if (nuit) r.nuitVoile = R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#0b1030', opacity: 0.35 }, fond);
      r.devant = () => {
        const g = sc.calque();
        for (const [x, y, s] of [[-180, 1010, 1.3], [2120, 1000, 1.4]]) {
          for (const [cx, cy, rr] of [[-60, -40, 90], [40, -80, 110], [120, -20, 80]]) R.el('circle', { cx: x + cx * s, cy: y + cy * s, r: rr * s, fill: nuit ? '#0f1c15' : '#2d4a22' }, g);
        }
        return g;
      };
      return r;
    },

    // ------------------------------------------------------------ Décors ajoutés au lot 2
    // Tous : sol à 880, options communes `ciel` (jour, chaud, soir, nuit, orage) et `nuit`
    // (voile bleu nuit derrière les personnages). Renvoient { fond, ciel, … }.
    _base(sc, o, collines) {
      const fond = sc.calque();
      const c = CIELS[o.ciel || 'jour'];
      const r = { fond };
      r.ciel = D.ciel(fond, c[0], c[1]);
      if (o.ciel === 'nuit') { r.etoiles = D.etoiles(fond, 140, 23); r.lune = D.lune(fond, o.luneX || 1500, 170, 46); }
      if (o.soleil) r.soleil = D.soleil(fond, o.soleil[0], o.soleil[1], o.soleil[2] || 70);
      if (collines) D.collines(fond, collines[0], o.ciel === 'nuit' ? '#262b48' : collines[1], collines[2] || 5, collines[3] || 50);
      return r;
    },
    _nuit(r, o) { if (o.nuit || o.ciel === 'nuit') r.nuitVoile = R.el('rect', { x: -1000, y: -3000, width: 3920, height: 6000, fill: '#0b1030', opacity: 0.45 }, r.fond); },

    /** D07 — Tiébélé (Kassena) : cases peintes de motifs géométriques, murets. */
    tiebele(sc, o) {
      o = o || {};
      const r = this._base(sc, o, [770, '#c49a6c', 41, 45]);
      D.karite(r.fond, 120, 800, 0.55, '#7d9a50'); D.baobab(r.fond, 1750, 830, 0.8);
      D.sol(r.fond, 880, '#b9733f');
      r.cases = [[-200, 0.9, false], [180, 1, true], [560, 0.85, false], [1380, 1.05, true], [1760, 0.9, false], [2150, 1, true]]
        .map(([x, s, toit]) => D.caseRonde(r.fond, x, 880, s, { couleur: '#a8603a', motifs: true, toit }));
      D.muret(r.fond, -700, -300, 880, 50, '#a8603a'); D.muret(r.fond, 260, 480, 880, 50, '#a8603a');
      D.herbes(r.fond, 880, 50, 41, '#9a8a3a', [-900, 2800]);
      this._nuit(r, o);
      return r;
    },

    /** D08 — Sahel : dunes, acacias, cases peules en dôme. Options : campement (bool). */
    sahel(sc, o) {
      o = o || {};
      const r = this._base(sc, Object.assign({ ciel: 'chaud' }, o), null);
      D.dune(r.fond, -200, 820, 1400, 90); D.dune(r.fond, 1300, 820, 1700, 110, '#d9b077'); D.dune(r.fond, 2400, 830, 1200, 80);
      D.sol(r.fond, 880, '#e0b678', '#cf9f5f');
      for (const [x, s] of [[-350, 0.9], [420, 1.1], [1650, 0.95], [2250, 1]]) D.acacia(r.fond, x, 870, s);
      if (o.campement !== false) r.cases = [D.caseDome(r.fond, 150, 880, 0.9), D.caseDome(r.fond, 1250, 880, 1), D.caseDome(r.fond, 2000, 880, 0.85)];
      D.herbes(r.fond, 880, 30, 51, '#b89a4a', [-900, 2800]);
      this._nuit(r, o);
      return r;
    },

    /** D09 — Pics de Sindou : aiguilles de grès au fond et sur les côtés, savane. */
    pics(sc, o) {
      o = o || {};
      const r = this._base(sc, o, null);
      r.pics = [];
      const loin = o.ciel === 'nuit' ? '#5a4a52' : '#c49470';
      for (const [x, h, l] of [[-500, 420, 150], [-300, 520, 170], [-80, 380, 140], [260, 560, 180], [480, 440, 150], [900, 600, 190], [1150, 470, 150], [1450, 580, 190], [1700, 420, 140], [2000, 540, 170], [2300, 460, 160]])
        r.pics.push(D.pic(r.fond, x, 800, h * 0.75, l * 0.8, loin));
      D.collines(r.fond, 800, o.ciel === 'nuit' ? '#3a3046' : '#a98058', 61, 30);
      for (const [x, h, l] of [[-260, 560, 200], [1960, 620, 220]]) r.pics.push(D.pic(r.fond, x, 880, h, l, o.ciel === 'nuit' ? '#6b5560' : '#b0805a'));
      D.sol(r.fond, 880, '#b98652', '#9a6a3e');
      D.karite(r.fond, 700, 885, 0.7, '#6f8f45');
      D.herbes(r.fond, 880, 70, 61, '#a39343', [-900, 2800]);
      this._nuit(r, o);
      return r;
    },

    /** D10 — Gorge (Dafra) : falaises, cascade, bassin d'eau au premier plan. r.bassin.eau s'anime. */
    gorge(sc, o) {
      o = o || {};
      const r = this._base(sc, o, null);
      D.collines(r.fond, 640, o.ciel === 'nuit' ? '#262b48' : '#8a9a6a', 71, 40);
      r.cascade = R.el('path', { d: 'M930,300 Q920,520 900,760 L1020,760 Q1000,520 990,300Z', fill: '#bfe3f0', opacity: 0.85 }, r.fond);
      D.falaise(r.fond, 330, 900, 700, 420, 'g'); D.falaise(r.fond, 1590, 900, 720, 430, 'd');
      D.sol(r.fond, 880, '#8a6a4a', '#6a4e36');
      r.bassin = D.mare(r.fond, 960, 900, 720, '#3f7f9e');
      D.karite(r.fond, -150, 890, 0.9, '#4f7a38'); D.karite(r.fond, 2080, 890, 0.95, '#4f7a38');
      this._nuit(r, o);
      return r;
    },

    /** D11 — Grand fleuve (Volta, Mouhoun) : rive lointaine, eau large, rive proche (sol 880).
     *  Options : riveProche (bool, défaut vrai). r.eau, r.vagues. */
    riviere(sc, o) {
      o = o || {};
      const r = this._base(sc, o, [700, '#9aa66a', 81, 35]);
      for (const x of [-300, 200, 700, 1200, 1700, 2200]) D.karite(r.fond, x, 720, 0.45, '#5f7d3a');
      D.sol(r.fond, 720, '#a88a5a');
      r.eau = R.el('rect', { x: -1000, y: 730, width: 3920, height: 400, fill: D.degrade('#4d8fb3', '#2f6c8f') }, r.fond);
      r.vagues = R.el('g', {}, r.fond);
      for (let i = 0; i < 30; i++) R.el('path', { d: `M${-900 + (i * 137) % 3700},${760 + (i * 53) % 280} q20,-6 40,0`, stroke: '#cfe8f1', 'stroke-width': 3, fill: 'none', opacity: 0.7 }, r.vagues);
      if (o.riveProche !== false) {
        r.rive = R.el('path', { d: 'M-1000,880 Q0,862 960,872 T2920,866 L2920,2000 L-1000,2000Z', fill: '#9a7a4a' }, r.fond);
        for (let i = 0; i < 12; i++) R.el('path', { d: `M${-800 + i * 330},876 l-8,-60 M${-790 + i * 330},876 l6,-70 M${-780 + i * 330},876 l14,-50`, stroke: '#6f8f45', 'stroke-width': 4 }, r.fond);
      }
      this._nuit(r, o);
      return r;
    },

    /** D12 — Forteresse de Loropéni : enceinte de pierre ; o.ruine pour l'état actuel. */
    forteresse(sc, o) {
      o = o || {};
      const r = this._base(sc, o, [760, '#b99a6a', 91, 40]);
      D.karite(r.fond, 1900, 790, 0.6, '#6f8f45');
      D.sol(r.fond, 880, '#a8744a', '#8a5a36');
      r.murs = [D.murPierre(r.fond, -700, 640, 880, 330, { ruine: o.ruine, graine: 3 }), D.murPierre(r.fond, 1100, 2600, 880, 330, { ruine: o.ruine, graine: 5 })];
      if (o.ruine) { D.karite(r.fond, 300, 900, 0.8, '#4f7a38'); D.herbes(r.fond, 880, 120, 93, '#7a8a3a', [-900, 2800]); }
      else D.herbes(r.fond, 880, 30, 93, '#9a8a3a', [-900, 2800]);
      this._nuit(r, o);
      return r;
    },

    /** D13 — Ville soudano-sahélienne (Bobo, Kong, Dori, pays marka) : mosquée et maisons. */
    ville(sc, o) {
      o = o || {};
      const r = this._base(sc, o, [770, '#c49a6c', 101, 40]);
      D.sol(r.fond, 880, P.terre, P.terreSombre);
      r.mosquee = D.mosquee(r.fond, o.mosqueeX || 1250, 880, o.mosqueeS || 0.9);
      r.maisons = [D.maison(r.fond, -150, 880, 300, 170, { porte: 40 }), D.maison(r.fond, 300, 880, 260, 160, {}), D.maison(r.fond, 2050, 880, 300, 170, { porte: -30 })];
      D.grenier(r.fond, 620, 880, 0.85);
      D.herbes(r.fond, 880, 40, 101, '#9a8a3a', [-900, 2800]);
      this._nuit(r, o);
      return r;
    },

    /** D14 — Poste colonial et chantier de route (1915) : bâtiment, drapeau, pierres, piste. */
    poste(sc, o) {
      o = o || {};
      const r = this._base(sc, Object.assign({ ciel: 'chaud' }, o), [770, '#c49a6c', 111, 40]);
      D.sol(r.fond, 880, '#c08a52', '#a87040');
      r.batiment = D.poste(r.fond, o.posteX || 1500, 880, 0.9);
      r.drapeau = D.drapeau(r.fond, (o.posteX || 1500) - 300, 880);
      R.el('path', { d: 'M-1000,900 L2920,900 L2920,960 L-1000,960Z', fill: '#d8a870', opacity: 0.6 }, r.fond);
      for (let i = 0; i < 6; i++) D.tas(r.fond, -400 + i * 220, 890, '#8f8478', 7 + i);
      this._nuit(r, o);
      return r;
    },

    /** D15 — Concession lobi : soukala, greniers, statuettes à l'entrée. */
    soukala(sc, o) {
      o = o || {};
      const r = this._base(sc, o, [770, '#b99a6a', 121, 45]);
      D.karite(r.fond, -300, 800, 0.6, '#6f8f45'); D.karite(r.fond, 1900, 800, 0.6, '#6f8f45');
      D.sol(r.fond, 880, '#b0703e', '#8a5a32');
      r.maison = D.soukala(r.fond, o.maisonX || 1100, 880, 1);
      D.grenier(r.fond, 300, 880, 0.9);
      D.herbes(r.fond, 880, 50, 121, '#9a8a3a', [-900, 2800]);
      this._nuit(r, o);
      return r;
    },

    /** D16 — Cour royale : grand mur d'enceinte, trône, parasol, tambours. */
    palais(sc, o) {
      o = o || {};
      const r = this._base(sc, o, [760, '#c49a6c', 131, 40]);
      D.muret(r.fond, -800, 2700, 860, 190, '#b9713d');
      for (let i = 0; i < 12; i++) R.el('path', { d: `M${-760 + i * 300},${700} l20,-30 l20,30`, fill: '#9a5a2e' }, r.fond);
      r.maison = D.maison(r.fond, o.troneX || 960, 880, 520, 250, { porte: 0 });
      D.sol(r.fond, 880, '#c8834a', '#9a5a2e');
      r.trone = D.trone(r.fond, o.troneX || 960, 900, 1.1);
      r.parasol = D.parasol(r.fond, (o.troneX || 960) - 30, 905, 0.9, o.parasol);
      r.tambours = [D.tambour(r.fond, 560, 900, 1), D.tambour(r.fond, 1380, 900, 1, '#5a3420')];
      this._nuit(r, o);
      return r;
    },

    /** D03 — Cosmos : noir, étoiles, horizon qui peut surgir. */
    cosmos(sc) {
      const fond = sc.calque();
      const r = { fond };
      r.noir = R.el('rect', { x: -2000, y: -3000, width: 6000, height: 7000, fill: '#04050d' }, fond);
      r.etoiles = D.etoiles(fond, 220, 99, { x: -900, y: -900, w: 3700, h: 2200 });
      return r;
    },
  };
})();
