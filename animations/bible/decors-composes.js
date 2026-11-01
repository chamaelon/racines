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
