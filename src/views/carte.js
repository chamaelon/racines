/*
 * L'accueil : la carte SVG des 17 régions, ses marqueurs, ses filtres, et le panneau d'une localité.
 * Molette, glisser, pincement ; survol et clic sur les régions ; une liste au clavier double la carte.
 */
import { chargerCarte, creerSvg, FORMES } from '../components/carte-svg.js';
import { creerFrise } from '../components/frise.js';
import { panneauLocalite } from '../components/panneau-localite.js';
import * as data from '../data.js';
import { store } from '../store.js';
import { definirPage, esc, reduit, TYPES, webgl } from '../ui.js';
import { crans, etapesFiltrees, lieuDe } from '../voyage.js';

const ZOOM_MAX = 8;
const TAILLE_MARQUEUR = 9;

// Les récits proposés en premier : un de chaque type, de régions différentes.
const A_LA_UNE = ['yennenga', 'lievre-hyene', 'gazelle', 'guimbi'];

export async function monter(el, ctx) {
  const [{ svg, W, H, projeter }, regions, localites, recits, patrimoine, langues, voyages] = await Promise.all([
    chargerCarte(), data.regions(), data.localites(), data.recits(), data.patrimoine(), data.langues(), data.voyages(),
  ]);
  el.innerHTML = `<div class="carte-page">
    <section class="carte-zone" aria-label="Carte interactive du Burkina Faso">
      <h1 class="lecteur-seul">Carte des récits du Burkina Faso</h1>
      <div class="carte-cadre"></div>
      <fieldset class="carte-legende">
        <legend>Légende et filtres</legend>
        ${Object.entries(TYPES).map(([k, t]) => `<label><input type="checkbox" data-type="${k}" checked><span class="puce type-${k}" aria-hidden="true"></span>${t.pluriel}</label>`).join('')}
      </fieldset>
      <div class="carte-temps"></div>
      <div class="carte-boutons">
        <button type="button" class="bouton" data-zoom="1.6" aria-label="Zoomer">+</button>
        <button type="button" class="bouton" data-zoom="0.625" aria-label="Dézoomer">−</button>
        <button type="button" class="bouton" data-centre>Recentrer</button>
        ${webgl() ? '<button type="button" class="bouton" data-relief aria-pressed="false">Relief 3D</button>' : ''}
      </div>
      <div class="infobulle cache" role="tooltip"></div>
    </section>
    <aside class="panneau" aria-label="Détails" aria-live="polite"></aside>
  </div>`;
  const cadre = el.querySelector('.carte-cadre');
  const panneau = el.querySelector('.panneau');
  const bulle = el.querySelector('.infobulle');
  const zone = el.querySelector('.carte-zone');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', 'Régions et localités ; la liste du panneau propose les mêmes lieux au clavier');
  cadre.append(svg);

  const regionParId = Object.fromEntries(regions.map((r) => [r.id, r]));
  const locParRegion = {};
  localites.forEach((l) => { (locParRegion[l.region] = locParRegion[l.region] || []).push(l); });
  const recitDe = (id) => recits.find((r) => r.id === id);

  // ---- Régions : plus elles ont de récits, plus elles sont claires
  const pathsRegions = [...svg.querySelectorAll('.regions path')];
  const nbRecits = (id) => (locParRegion[id] || []).reduce((n, l) => n + l.recits.length, 0);
  const groupeEtiquettes = creerSvg('g', { class: 'etiquettes-regions' });
  pathsRegions.forEach((p) => {
    const n = nbRecits(p.dataset.region);
    p.classList.add(n === 0 ? 'vide' : n < 3 ? 'peu' : n < 6 ? 'moyen' : 'beaucoup');
    const t = creerSvg('text', { x: 0, y: 0 });
    t.textContent = regionParId[p.dataset.region].nom;
    t.dataset.x = p.dataset.cx; t.dataset.y = p.dataset.cy;
    groupeEtiquettes.append(t);
  });
  svg.append(groupeEtiquettes);

  // ---- Marqueurs : forme et couleur selon le type de récit, coche si terminé
  const filtres = { types: new Set(Object.keys(TYPES)), epoque: null, debut: undefined, fin: undefined };
  const periode = () => ({ epoque: filtres.epoque, debut: filtres.debut, fin: filtres.fin });
  const groupeMarqueurs = creerSvg('g', { class: 'marqueurs' });
  svg.append(groupeMarqueurs);
  const marqueurs = {};
  // Les étapes situées ailleurs que sur une localité n'apparaissent qu'en voyageant dans le temps.
  const lieuxEtapes = Object.entries(voyages.lieux).filter(([, v]) => v.coords && !v.note).map(([id, v]) => ({ id, nom: v.nom, coords: v.coords, etape: true }));
  [...localites, ...lieuxEtapes].forEach((l) => {
    const [x, y] = projeter(l.coords);
    const g = creerSvg('g', { class: l.etape ? 'marqueur marqueur-etape' : 'marqueur', 'data-localite': l.id });
    g.dataset.x = x; g.dataset.y = y;
    g.append(creerSvg('circle', { class: 'zone-toucher', r: 2.2 }));
    g.append(creerSvg('path', { class: 'forme' }));
    g.append(creerSvg('path', { class: 'tri', d: 'M-.32 -.5L.5 0L-.32 .5Z' }));
    g.append(creerSvg('path', { class: 'coche', d: 'M.5 -1.45L1 -.95L1.8 -1.9' }));
    const t = creerSvg('text', { class: 'nom-localite', x: 1.7, y: 0.42 });
    t.textContent = l.nom;
    g.append(t);
    groupeMarqueurs.append(g);
    marqueurs[l.id] = g;
  });

  function majMarqueurs() {
    localites.forEach((l) => {
      const rs = l.recits.map(recitDe);
      let visibles = rs.filter((r) => filtres.types.has(r.type));
      if (filtres.epoque) visibles = etapesFiltrees(voyages, { ...periode(), lieu: l.id }).map((e) => recitDe(e.recit)).filter((r) => filtres.types.has(r.type));
      const g = marqueurs[l.id];
      g.classList.toggle('cache', visibles.length === 0);
      if (!visibles.length) return;
      const type = visibles[0].type;
      g.setAttribute('data-type', type);
      g.querySelector('.forme').setAttribute('d', FORMES[type]);
      g.classList.toggle('termine', rs.some((r) => store.estTermine(r.id)));
    });
    lieuxEtapes.forEach((l) => {
      const es = filtres.epoque ? etapesFiltrees(voyages, { ...periode(), lieu: l.id }).filter((e) => filtres.types.has(recitDe(e.recit).type)) : [];
      const g = marqueurs[l.id];
      g.classList.toggle('cache', !es.length);
      if (!es.length) return;
      const type = recitDe(es[0].recit).type;
      g.setAttribute('data-type', type);
      g.querySelector('.forme').setAttribute('d', FORMES[type]);
    });
  }

  // ---- Vue : un viewBox animé
  const vue = { x: 0, y: 0, w: W, h: H };
  let anim = null;
  const pxParUnite = () => { const r = svg.getBoundingClientRect(); return Math.min(r.width / vue.w, r.height / vue.h) || 1; };

  function appliquerVue() {
    svg.setAttribute('viewBox', `${vue.x} ${vue.y} ${vue.w} ${vue.h}`);
    const s = TAILLE_MARQUEUR / pxParUnite();
    const k = W / vue.w;
    Object.values(marqueurs).forEach((g) => g.setAttribute('transform', `translate(${g.dataset.x} ${g.dataset.y}) scale(${s})`));
    const lettres = (cadre.clientWidth < 600 ? 10 : 11.5) / pxParUnite();
    groupeEtiquettes.querySelectorAll('text').forEach((t) => {
      t.setAttribute('transform', `translate(${t.dataset.x} ${t.dataset.y}) scale(${lettres})`);
    });
    svg.classList.toggle('etiquettes-visibles', cadre.clientWidth >= 600 || k >= 1.6);
    svg.classList.toggle('noms-visibles', k >= 2.4);
  }

  function borner(c) {
    const w = Math.max(W / ZOOM_MAX, Math.min(W, c.w));
    const h = w * H / W;
    return { x: Math.max(-w * 0.4, Math.min(W - w * 0.6, c.x)), y: Math.max(-h * 0.4, Math.min(H - h * 0.6, c.y)), w, h };
  }

  function allerVue(cible, duree = 450) {
    const fin = borner(cible);
    cancelAnimationFrame(anim);
    if (reduit() || duree === 0) { Object.assign(vue, fin); appliquerVue(); return; }
    const debut = { ...vue }, t0 = performance.now();
    const pas = (t) => {
      const u = Math.min(1, (t - t0) / duree), e = u * u * (3 - 2 * u);
      for (const k of ['x', 'y', 'w', 'h']) vue[k] = debut[k] + (fin[k] - debut[k]) * e;
      appliquerVue();
      if (u < 1) anim = requestAnimationFrame(pas);
    };
    anim = requestAnimationFrame(pas);
  }
  const recentrer = () => allerVue({ x: 0, y: 0, w: W, h: H });

  function zoomerSur(sx, sy, facteur, duree = 0) {
    const w = vue.w / facteur;
    const b = borner({ x: 0, y: 0, w, h: w * H / W });
    const kx = (sx - vue.x) / vue.w, ky = (sy - vue.y) / vue.h;
    const cible = { x: sx - kx * b.w, y: sy - ky * b.h, w: b.w, h: b.h };
    allerVue(cible, duree);
  }
  const versSvg = (cx, cy) => { const p = new DOMPoint(cx, cy).matrixTransform(svg.getScreenCTM().inverse()); return [p.x, p.y]; };

  function cadrerRegion(id) {
    const p = pathsRegions.find((x) => x.dataset.region === id);
    const b = p.getBBox();
    const marge = 1.35;
    const r = cadre.getBoundingClientRect();
    const rapport = r.height ? r.width / r.height : W / H;
    let w = b.width * marge, h = b.height * marge;
    if (w / h < rapport) w = h * rapport;
    w = Math.max(w, W / 5.5);
    h = w * H / W;
    allerVue({ x: b.x + b.width / 2 - w / 2, y: b.y + b.height / 2 - h / 2, w, h });
  }
  function cadrerLocalite(l) {
    const [x, y] = projeter(l.coords);
    const w = Math.min(vue.w, W / 3.2), h = w * H / W;
    allerVue({ x: x - w / 2, y: y - h / 2, w, h });
  }

  // ---- Interactions
  const montrerBulle = (e, html) => {
    bulle.innerHTML = html;
    bulle.classList.remove('cache');
    const r = zone.getBoundingClientRect();
    bulle.style.left = Math.min(e.clientX - r.left + 14, r.width - 190) + 'px';
    bulle.style.top = (e.clientY - r.top + 14) + 'px';
  };
  const cacherBulle = () => bulle.classList.add('cache');

  svg.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const m = e.target.closest('.marqueur');
    if (m) {
      const l = lieuDe(m.dataset.localite, voyages, localites);
      const n = etapesFiltrees(voyages, { ...periode(), lieu: l.id }).length;
      const info = filtres.epoque || !l.localite ? `${n} étape${n > 1 ? 's' : ''}` : (() => { const k = localites.find((x) => x.id === l.id).recits.length; return `${k} récit${k > 1 ? 's' : ''}`; })();
      montrerBulle(e, `<strong>${esc(l.nom)}</strong>${info}`);
      return;
    }
    const p = e.target.closest('.regions path');
    if (p) {
      const r = regionParId[p.dataset.region], n = nbRecits(r.id);
      montrerBulle(e, `<strong>${esc(r.nom)}</strong>${n ? `${n} récit${n > 1 ? 's' : ''}` : 'À collecter'}`);
    } else cacherBulle();
  });
  svg.addEventListener('pointerleave', cacherBulle);

  // Glisser et pincer
  const pointeurs = new Map();
  let bouge = 0, pince = null;
  svg.addEventListener('pointerdown', (e) => {
    pointeurs.set(e.pointerId, [e.clientX, e.clientY]);
    bouge = 0;
    if (pointeurs.size === 2) {
      const [a, b] = [...pointeurs.values()];
      pince = Math.hypot(a[0] - b[0], a[1] - b[1]);
    }
  });
  svg.addEventListener('pointermove', (e) => {
    if (!pointeurs.has(e.pointerId)) return;
    const av = pointeurs.get(e.pointerId);
    pointeurs.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointeurs.size === 2) {
      const [a, b] = [...pointeurs.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const [sx, sy] = versSvg((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      if (pince) zoomerSur(sx, sy, d / pince);
      pince = d; bouge += 10;
      return;
    }
    const dx = e.clientX - av[0], dy = e.clientY - av[1];
    bouge += Math.abs(dx) + Math.abs(dy);
    if (bouge < 6) return;
    if (bouge >= 6 && !svg.hasPointerCapture(e.pointerId)) svg.setPointerCapture(e.pointerId);
    const u = pxParUnite();
    Object.assign(vue, borner({ x: vue.x - dx / u, y: vue.y - dy / u, w: vue.w, h: vue.h }));
    cancelAnimationFrame(anim);
    appliquerVue();
    cacherBulle();
  });
  const finPointeur = (e) => { pointeurs.delete(e.pointerId); if (pointeurs.size < 2) pince = null; };
  svg.addEventListener('pointerup', finPointeur);
  svg.addEventListener('pointercancel', finPointeur);
  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const [sx, sy] = versSvg(e.clientX, e.clientY);
    zoomerSur(sx, sy, e.deltaY < 0 ? 1.18 : 1 / 1.18);
  }, { passive: false });
  // La capture de pointeur redirige le clic sur le svg : on retient la cible d'origine.
  let cibleBas = null;
  svg.addEventListener('pointerdown', (e) => { cibleBas = e.target; }, true);
  svg.addEventListener('click', () => {
    if (bouge >= 6) return;
    const cible = cibleBas;
    if (!cible || !cible.closest) return;
    const m = cible.closest('.marqueur');
    if (m) { location.hash = `#/carte/${m.dataset.localite}`; return; }
    const p = cible.closest('.regions path');
    if (p) location.hash = `#/carte?region=${p.dataset.region}`;
  });

  el.querySelector('.carte-boutons').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.zoom) zoomerSur(vue.x + vue.w / 2, vue.y + vue.h / 2, +b.dataset.zoom, 200);
    if ('centre' in b.dataset) { if (relief) relief.recentrer(); recentrer(); location.hash = '#/carte'; }
    if ('relief' in b.dataset) basculerRelief(b);
  });
  // La barre de temps : le curseur change l'année ; l'adresse suit sans remplir l'historique à chaque cran.
  const lesCrans = crans(voyages);
  let attenteFrise = null;
  const allerTemps = (hash) => { clearTimeout(attenteFrise); attenteFrise = setTimeout(() => location.replace(hash), 90); };
  const frise = creerFrise(el.querySelector('.carte-temps'), lesCrans, {
    epoques: voyages.epoques,
    surCran: (c) => allerTemps(`#/carte?epoque=${c.epoque}${c.debut === undefined ? '' : `&annee=${c.debut}`}`),
    surEpoque: (id) => { location.hash = `#/carte?epoque=${id}`; },
    surToutes: () => { location.hash = '#/carte'; },
  });
  el.querySelector('.carte-legende').addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.type) { if (t.checked) filtres.types.add(t.dataset.type); else filtres.types.delete(t.dataset.type); }
    majMarqueurs();
    if (relief) relief.majFiltres(visiblesIds());
  });
  const visiblesIds = () => localites.filter((l) => !marqueurs[l.id].classList.contains('cache')).map((l) => l.id);

  // ---- Relief 3D, chargé à la demande
  let relief = null;
  async function basculerRelief(b) {
    if (relief) {
      relief.detruire(); relief = null;
      zone.classList.remove('en-relief');
      b.textContent = 'Relief 3D'; b.setAttribute('aria-pressed', 'false');
      return;
    }
    b.disabled = true; b.textContent = 'Chargement…';
    try {
      const { creerRelief } = await import('../scenes/relief.js');
      relief = creerRelief(cadre, {
        svg, W, H, projeter, localites, nbRecits, reduit: reduit(), recitDe,
        surRegion: (id) => { location.hash = `#/carte?region=${id}`; },
        surLocalite: (id) => { location.hash = `#/carte/${id}`; },
        surSurvol: (ev, html) => { if (html) montrerBulle(ev, html); else cacherBulle(); },
        nomRegion: (id) => regionParId[id].nom,
      });
      relief.majFiltres(visiblesIds());
      relief.choisir(etatRegion);
      zone.classList.add('en-relief');
      b.textContent = 'Carte 2D'; b.setAttribute('aria-pressed', 'true');
    } catch (e) {
      console.warn(e);
      b.remove();
      return;
    }
    b.disabled = false;
  }

  // ---- Panneau
  let etatRegion = null;
  function surlignerRegion(id) {
    etatRegion = id;
    pathsRegions.forEach((p) => p.classList.toggle('choisie', p.dataset.region === id));
    if (relief) relief.choisir(id);
  }

  function panneauAccueil() {
    const aLaUne = A_LA_UNE.map(recitDe);
    const peuples = new Set(localites.flatMap((l) => l.peuples));
    const aRecits = regions.filter((r) => nbRecits(r.id));
    return `<p class="sur-titre">Patrimoine oral du Burkina Faso</p>
      <h2>Parcourez le pays, écoutez ses récits</h2>
      <div class="chiffres"><div><b>${recits.length}</b><span>récits</span></div><div><b>${peuples.size}</b><span>peuples</span></div><div><b>${aRecits.length}/17</b><span>régions</span></div></div>
      <p>Touchez une région ou un marqueur. Chaque lieu ouvre ses récits : les ${recits.length} se vivent en jouant, avec des choix et plusieurs fins.</p>
      <h3>Pour commencer</h3>
      <ul class="liste-recits">${aLaUne.map((r) => `<li><a href="#/jouer/${r.id}"><span class="puce-jouable" aria-hidden="true">▶</span><span><b>${esc(r.titre)}</b><small>${TYPES[r.type].nom}, à vivre</small></span></a></li>`).join('')}</ul>
      <p><a href="#/catalogue">Voir les ${recits.length} récits</a></p>
      <h3>Tous les lieux, par région</h3>
      <div class="liste-regions">${[...regions].sort((a, b) => a.nom.localeCompare(b.nom)).map((r) => {
        const ls = locParRegion[r.id] || [];
        return `<details><summary>${esc(r.nom)} <small>${ls.length ? `${ls.length} lieu${ls.length > 1 ? 'x' : ''}` : 'à collecter'}</small></summary>
          ${ls.length ? `<ul>${ls.map((l) => `<li><a href="#/carte/${l.id}">${esc(l.nom)}${l.recits.some((x) => store.estTermine(x)) ? ' ✓' : ''}</a></li>`).join('')}</ul>` : '<p class="meta">Aucun récit pour l\'instant dans cette région.</p>'}
          <p><a href="#/carte?region=${r.id}">Voir la région</a></p></details>`;
      }).join('')}</div>`;
  }
  function panneauRegion(r) {
    const ls = locParRegion[r.id] || [];
    return `<a class="retour" href="#/carte">← Toute la carte</a>
      <p class="sur-titre">Région</p><h2>${esc(r.nom)}</h2>
      <p class="meta">Chef-lieu : ${esc(r.chefLieu)}. Ancien découpage : ${esc(r.ancien)}.</p>
      ${ls.length ? `<ul class="liste-recits">${ls.map((l) => `<li><a href="#/carte/${l.id}"><span class="puce type-${recitDe(l.recits[0]).type}" aria-hidden="true"></span><span><b>${esc(l.nom)}</b><small>${l.recits.length} récit${l.recits.length > 1 ? 's' : ''} · ${esc(l.peuples.join(', '))}</small></span></a></li>`).join('')}</ul>`
        : '<p class="avert">Aucun récit n\'est encore rattaché à cette région. Si vous connaissez un conteur ici, il a sa place sur cette carte.</p>'}`;
  }

  // Étapes du voyage, regroupées par lieu ou par époque.
  const lienEtape = (e) => `<li><a href="#/jouer/${e.recit}?etape=${e.index}"><span class="puce type-${recitDe(e.recit).type}" aria-hidden="true"></span><span><b>${esc(e.titre)}</b><small>${esc(recitDe(e.recit).titre)}</small></span></a></li>`;
  function etapesDuLieu(id) {
    const es = etapesFiltrees(voyages, { ...periode(), lieu: id });
    if (!es.length) return '';
    return `<h3>${filtres.epoque ? `Ici, à l'époque choisie` : 'Voyager depuis ce lieu'}</h3>
      ${voyages.epoques.filter((p) => es.some((e) => e.epoque === p.id)).map((p) => `<p class="meta">${esc(p.nom)}, ${esc(p.periode)}</p><ul class="liste-recits">${es.filter((e) => e.epoque === p.id).map(lienEtape).join('')}</ul>`).join('')}`;
  }
  function panneauEpoque(p) {
    const es = etapesFiltrees(voyages, periode()).filter((e) => filtres.types.has(recitDe(e.recit).type));
    const lieux = [...new Set(es.map((e) => e.lieu))].map((id) => lieuDe(id, voyages, localites)).sort((a, b) => a.nom.localeCompare(b.nom));
    const groupe = (l) => `<h3>${l.localite || (l.coords && !l.note) ? `<a href="#/carte/${l.id}">${esc(l.nom)}</a>` : esc(l.nom)}${l.note ? ` <small>${esc(l.note)}</small>` : ''}</h3><ul class="liste-recits">${es.filter((e) => e.lieu === l.id).map(lienEtape).join('')}</ul>`;
    return `<a class="retour" href="#/carte">← Toutes les époques</a>
      <p class="sur-titre">${esc(filtres.debut === undefined ? p.periode : filtres.fin > filtres.debut ? `${filtres.debut}-${filtres.fin}` : filtres.debut)}</p><h2>${esc(p.nom)}</h2><p>${esc(p.texte)}</p>
      <p class="meta">${es.length} étape${es.length > 1 ? 's' : ''} dans ${lieux.length} lieu${lieux.length > 1 ? 'x' : ''}. Choisissez un lieu sur la carte, ou une étape pour y entrer.</p>
      ${lieux.map(groupe).join('')}`;
  }

  // Sans année, c'est toute l'époque : le curseur se pose sur son premier cran.
  function choisirEpoque(id, annee) {
    const c = annee ? lesCrans.find((x) => x.epoque === id && +annee >= x.debut && +annee <= x.fin) : null;
    Object.assign(filtres, { epoque: id, debut: c?.debut, fin: c?.fin });
    if (!id) frise.poser(null);
    else if (c) frise.poser(lesCrans.indexOf(c));
    else frise.poser(lesCrans.findIndex((x) => x.epoque === id), id);
    majMarqueurs();
    if (relief) relief.majFiltres(visiblesIds());
  }

  function afficher({ params, query }) {
    const idL = params[0];
    Object.values(marqueurs).forEach((g) => g.classList.remove('actif'));
    // L'époque reste choisie quand on ouvre un lieu ; un retour à la carte entière la retire.
    if (!idL) choisirEpoque(voyages.epoques.some((p) => p.id === query.epoque) ? query.epoque : null, query.annee);
    const etapeSeule = idL && !localites.some((x) => x.id === idL) && lieuxEtapes.find((x) => x.id === idL);
    if (etapeSeule) {
      definirPage({ titre: etapeSeule.nom });
      panneau.innerHTML = `<a class="retour" href="#/carte${filtres.epoque ? `?epoque=${filtres.epoque}${filtres.debut ? `&annee=${filtres.debut}` : ''}` : ''}">← Retour</a><p class="sur-titre">Lieu du voyage</p><h2>${esc(etapeSeule.nom)}</h2>${voyages.lieux[idL].approx ? '<p class="meta">Emplacement approché.</p>' : ''}${etapesDuLieu(idL)}`;
      marqueurs[idL].classList.add('actif');
      cadrerLocalite(etapeSeule);
      return;
    }
    if (idL) {
      const l = localites.find((x) => x.id === idL);
      if (l) {
        const region = regionParId[l.region];
        definirPage({ titre: l.nom, description: `${l.nom}, région ${region.nom} : ${l.recits.length} récit(s), peuples et patrimoine.` });
        panneau.innerHTML = panneauLocalite(l, { region, recits, patrimoine, langues }) + etapesDuLieu(l.id);
        marqueurs[l.id].classList.add('actif');
        surlignerRegion(l.region);
        cadrerLocalite(l);
        panneau.scrollTop = 0;
        if (matchMedia('(max-width: 900px)').matches) panneau.scrollIntoView({ behavior: reduit() ? 'auto' : 'smooth' });
        return;
      }
    }
    if (query.region && regionParId[query.region]) {
      const r = regionParId[query.region];
      definirPage({ titre: `Région ${r.nom}`, description: `Les localités et les récits de la région ${r.nom}, Burkina Faso.` });
      panneau.innerHTML = panneauRegion(r);
      surlignerRegion(r.id);
      cadrerRegion(r.id);
      panneau.scrollTop = 0;
      return;
    }
    if (filtres.epoque) {
      const p = voyages.epoques.find((x) => x.id === filtres.epoque);
      definirPage({ titre: p.nom, description: `Les récits du Burkina Faso à l'époque : ${p.nom}.` });
      panneau.innerHTML = panneauEpoque(p);
      surlignerRegion(null);
      recentrer();
      panneau.scrollTop = 0;
      return;
    }
    definirPage({});
    panneau.innerHTML = panneauAccueil();
    surlignerRegion(null);
    recentrer();
  }

  majMarqueurs();
  appliquerVue();
  afficher(ctx);
  const surTaille = () => appliquerVue();
  addEventListener('resize', surTaille);

  return {
    maj: afficher,
    demonter() {
      cancelAnimationFrame(anim);
      clearTimeout(attenteFrise);
      removeEventListener('resize', surTaille);
      if (relief) relief.detruire();
    },
  };
}
