/*
 * Racines — la carte interactive, menu principal du site.
 * Globe MapLibre GL (WebGL) qui plonge sur le Burkina Faso : régions en relief selon le nombre de récits,
 * vue 3D ou 2D, broches des récits, filtres et parcours. Sans WebGL, une carte SVG prend le relais.
 * L'idée du globe, du relief par récit et de l'intro vient du prototype « Voix du Faso ».
 */
(function () {
  const { C, echap, mmss, parId, etiquette, Carnet, nav } = window.RACINES_APP;
  const GEO = window.GEO, PARCOURS = window.PARCOURS, CARTE = window.CARTE;
  const $ = (s) => document.querySelector(s);
  const q = new URLSearchParams(location.search);
  const CENTRE = [-1.7, 12.25];
  const ETROIT = matchMedia('(max-width: 1000px)').matches;
  const VUE_3D = { center: CENTRE, zoom: ETROIT ? 4.85 : 6.2, pitch: 48, bearing: 0 };
  const VUE_2D = { center: CENTRE, zoom: ETROIT ? 4.95 : 6.25, pitch: 0, bearing: 0 };
  const parRegion = {};
  C.histoires.forEach((h) => { (parRegion[GEO[h.dossier].region] = parRegion[GEO[h.dossier].region] || []).push(h); });
  const etat = { type: '', peuple: '', texte: '', trois: true, region: null, histoire: null, parcours: null, etape: 0 };
  let carte = null, broches = {}, regionSurvol = null, ids = {};
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

  nav('index.html');

  // ------------------------------------------------------------ Filtres
  const correspond = (h) => {
    const t = etat.texte.toLowerCase();
    return (!etat.type || h.type === etat.type) && (!etat.peuple || h.peuple === etat.peuple) &&
      (!t || (h.titre + ' ' + h.peuple + ' ' + h.resume + ' ' + GEO[h.dossier].lieu).toLowerCase().includes(t));
  };
  [...new Set(C.histoires.map((h) => h.type))].sort().forEach((t) => $('#f-type').add(new Option(t, t)));
  [...new Set(C.histoires.map((h) => h.peuple))].sort().forEach((p) => $('#f-peuple').add(new Option(p, p)));
  const appliquer = () => {
    etat.type = $('#f-type').value; etat.peuple = $('#f-peuple').value; etat.texte = $('#f-texte').value.trim();
    C.histoires.forEach((h) => broches[h.dossier] && broches[h.dossier].classList.toggle('terne', !correspond(h)));
    rendrePanneau();
  };
  ['#f-type', '#f-peuple', '#f-texte'].forEach((s) => $(s).addEventListener('input', appliquer));

  // ------------------------------------------------------------ Panneau
  const ligne = (h, act) => `<li><button class="ligne" data-histoire="${h.dossier}"${act ? ` data-act="${act}"` : ''}>
    <img src="commun/vignettes/${h.dossier}.jpg" alt="" loading="lazy">
    <span><b>${echap(h.titre)}</b><small>${echap(h.peuple)} · ${echap(h.type)} · ${mmss(h.duree)}</small></span>
    ${Carnet.get(h.dossier).vu ? '<span class="coche" title="Déjà vu">✓</span>' : ''}</button></li>`;

  function vueAccueil() {
    const filtre = etat.type || etat.peuple || etat.texte;
    if (filtre) {
      const l = C.histoires.filter(correspond);
      return `<p class="sur-titre">Recherche</p><h2>${l.length} récit${l.length > 1 ? 's' : ''}</h2>
        <ul class="liste">${l.map((h) => ligne(h)).join('') || '<li>Aucun récit ne correspond.</li>'}</ul>`;
    }
    const nbPeuples = new Set(C.histoires.flatMap((h) => h.peuple.replace(/\(.*?\)/g, '').split(/,| et /).map((s) => s.trim()))).size;
    return `<p class="sur-titre">Patrimoine oral du Burkina Faso</p>
      <h2>Parcourez le pays, écoutez ses récits</h2>
      <div class="chiffres"><div><b>${C.histoires.length}</b><span>récits animés</span></div><div><b>${nbPeuples}</b><span>peuples</span></div><div><b>${Object.keys(parRegion).length}/13</b><span>régions</span></div></div>
      <p>Touchez une région ou une broche pour ouvrir un récit. Chaque film se regarde avec sa voix off, son ambiance et sa musique, en animation ou en vidéo.</p>
      <p class="sur-titre" style="margin-top:18px">Voyages guidés</p>
      <ul class="liste">${PARCOURS.map((p) => `<li><button class="ligne" data-parcours="${p.id}"><span><b>${echap(p.nom)}</b><small>${echap(p.texte)} ${p.etapes.length} étapes.</small></span></button></li>`).join('')}</ul>
      <p class="sur-titre">Régions</p>
      <ul class="liste">${CARTE.regions.features.map((f) => f.properties.nom).sort().map((n) => {
        const k = (parRegion[n] || []).length;
        return `<li><button class="ligne" data-region="${echap(n)}"><span><b>${echap(n)}</b><small>${k ? `${k} récit${k > 1 ? 's' : ''}` : 'À collecter'}</small></span></button></li>`;
      }).join('')}</ul>`;
  }

  function vueRegion() {
    const l = (parRegion[etat.region] || []).filter(correspond);
    return `<button class="retour" data-retour>← Toute la carte</button>
      <p class="sur-titre">Région</p><h2>${echap(etat.region)}</h2>
      ${l.length ? `<p>${l.length} récit${l.length > 1 ? 's' : ''} sur cette région.</p><ul class="liste">${l.map((h) => ligne(h)).join('')}</ul>`
        : `<p class="avert">Aucun récit n'est encore rattaché à cette région dans notre sélection. Si vous connaissez un conteur ici, il a sa place sur cette carte.</p>`}`;
  }

  function vueHistoire() {
    const h = parId(etat.histoire), g = GEO[h.dossier], c = Carnet.get(h.dossier);
    const pistes = (window.PISTES || {})[h.dossier] || [];
    const voix = pistes.filter((p) => p.startsWith('voix-')).map((p) => window.LANGUES[p.slice(5)] || p.slice(5));
    let etape = '';
    if (etat.parcours) {
      const p = PARCOURS.find((x) => x.id === etat.parcours);
      etape = `<p class="sur-titre">${echap(p.nom)} · étape ${etat.etape + 1}/${p.etapes.length}</p>
        <div class="progression"><i style="width:${(etat.etape + 1) / p.etapes.length * 100}%"></i></div>`;
    }
    const autre = etat.parcours ? `<div class="actions">
        <button class="bouton" data-etape="-1" ${etat.etape === 0 ? 'disabled' : ''}>← Précédente</button>
        <button class="bouton" data-etape="1" ${etat.etape === PARCOURS.find((x) => x.id === etat.parcours).etapes.length - 1 ? 'disabled' : ''}>Suivante →</button>
        <button class="bouton" data-retour>Quitter le voyage</button></div>` : `<button class="retour" data-retour-region>← ${echap(g.region)}</button>`;
    const lien = `lecteur.html?h=${h.dossier}${etat.parcours ? `&parcours=${etat.parcours}` : ''}`;
    return `${etape || ''}${etat.parcours ? '' : autre}
      <h2 style="margin-top:6px">${echap(h.titre)}</h2>
      <p class="meta">${echap(h.peuple)} · ${echap(h.type)} · ${mmss(h.duree)}<br>${echap(g.lieu)}${g.approx ? ' (emplacement indicatif)' : ''}</p>
      <img class="vignette" src="commun/vignettes/${h.dossier}.jpg" alt="Image tirée du film ${echap(h.titre)}">
      <p>${echap(h.resume)}</p>
      <p><span class="badge ${h.statut}">${etiquette(h)}</span>${c.vu ? ' <span class="badge" style="color:var(--vert)">Vu ✓</span>' : ''}</p>
      <div class="actions"><a class="bouton fort" href="${lien}">▶ Regarder et écouter</a><a class="bouton" href="${lien}&mode=video">Version vidéo</a></div>
      <p class="meta">Voix disponibles : ${voix.length ? voix.map(echap).join(', ') : 'à venir'}. Ambiance et musique incluses.</p>
      ${etat.parcours ? autre : ''}`;
  }

  function rendrePanneau() {
    const corps = $('#panneau-corps');
    corps.innerHTML = etat.histoire ? vueHistoire() : etat.region ? vueRegion() : vueAccueil();
    corps.scrollTop = 0;
    document.querySelectorAll('.broche, .broche-svg').forEach((b) => b.classList.toggle('active', b.dataset.h === etat.histoire));
  }

  $('#panneau-corps').addEventListener('click', (e) => {
    const b = e.target.closest('button, a');
    if (!b) return;
    if (b.dataset.histoire) choisirHistoire(b.dataset.histoire);
    else if (b.dataset.region) choisirRegion(b.dataset.region);
    else if (b.dataset.parcours) lancerParcours(b.dataset.parcours);
    else if (b.dataset.etape) allerEtape(etat.etape + +b.dataset.etape);
    else if ('retour' in b.dataset) { etat.parcours = null; etat.histoire = null; etat.region = null; rendrePanneau(); recentrer(); majSvg(); }
    else if ('retourRegion' in b.dataset) { const r = GEO[etat.histoire].region; etat.histoire = null; choisirRegion(r); }
  });

  // ------------------------------------------------------------ Actions
  function boite(nom) {
    const f = CARTE.regions.features.find((x) => x.properties.nom === nom);
    let a = 180, b = 90, c = -180, d = -90;
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    polys.forEach((p) => p.forEach((r) => r.forEach(([x, y]) => { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); })));
    return [[a, b], [c, d]];
  }
  const paddingVue = () => (matchMedia('(max-width: 1000px)').matches ? { top: 90, bottom: innerHeight * 0.44, left: 0, right: 0 } : { top: 40, bottom: 0, left: 40, right: 400 });
  const marges = () => (matchMedia('(max-width: 1000px)').matches ? { top: 110, bottom: innerHeight * 0.46, left: 30, right: 30 } : { top: 110, bottom: 60, left: 60, right: 430 });

  function choisirRegion(nom) {
    etat.region = nom; etat.histoire = null; rendrePanneau(); majSvg();
    if (carte) carte.fitBounds(boite(nom), { padding: marges(), duration: reduit ? 0 : 1100, maxZoom: 8.2, pitch: etat.trois ? 45 : 0 });
  }
  function choisirHistoire(id, garder) {
    if (!garder) { etat.parcours = null; }
    etat.histoire = id; etat.region = GEO[id].region; rendrePanneau(); majSvg();
    if (carte) carte.flyTo({ center: [GEO[id].lon, GEO[id].lat], zoom: Math.max(carte.getZoom(), 7.3), pitch: etat.trois ? 50 : 0, padding: marges(), duration: reduit ? 0 : 1400, essential: true });
  }
  function lancerParcours(id) { etat.parcours = id; allerEtape(0); }
  function allerEtape(i) {
    const p = PARCOURS.find((x) => x.id === etat.parcours);
    etat.etape = Math.max(0, Math.min(p.etapes.length - 1, i));
    choisirHistoire(p.etapes[etat.etape], true);
  }
  function recentrer() { if (carte) carte.flyTo(Object.assign({}, etat.trois ? VUE_3D : VUE_2D, { padding: paddingVue(), duration: reduit ? 0 : 1100, essential: true })); }

  // ------------------------------------------------------------ Infobulle
  const bulle = $('#infobulle');
  const montrer = (x, y, html) => { bulle.innerHTML = html; bulle.classList.remove('cache'); bulle.style.left = Math.min(x + 14, innerWidth - 280) + 'px'; bulle.style.top = (y + 14) + 'px'; };
  const cacher = () => bulle.classList.add('cache');
  const bulleRegion = (n) => { const k = (parRegion[n] || []).length; return `<strong>${echap(n)}</strong>${k ? `${k} récit${k > 1 ? 's' : ''}` : 'À collecter'}`; };
  const bulleHistoire = (h) => `<img src="commun/vignettes/${h.dossier}.jpg" alt=""><strong>${echap(h.titre)}</strong>${echap(h.peuple)} · ${echap(h.type)}`;

  function brancherBroche(b, h) {
    b.addEventListener('click', (e) => { e.stopPropagation(); choisirHistoire(h.dossier); });
    b.addEventListener('mousemove', (e) => montrer(e.clientX, e.clientY, bulleHistoire(h)));
    b.addEventListener('mouseleave', cacher);
    b.classList.toggle('vue', !!Carnet.get(h.dossier).vu);
    b.dataset.h = h.dossier;
    broches[h.dossier] = b;
  }

  // ------------------------------------------------------------ Carte WebGL
  const webgl = () => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } };

  function carteWebGL() {
    const couleur = ['case', ['boolean', ['feature-state', 'choisie'], false], '#f6d98e', ['boolean', ['feature-state', 'survol'], false], '#e4b34e',
      ['step', ['get', 'recits'], '#2c2f55', 1, '#6a4526', 2, '#8e5d2c', 3, '#b67a33', 5, '#d19a42']];
    const donnees = { type: 'FeatureCollection', features: CARTE.regions.features.map((f, i) => {
      ids[f.properties.nom] = i;
      return Object.assign({}, f, { id: i, properties: Object.assign({}, f.properties, { recits: (parRegion[f.properties.nom] || []).length }) });
    }) };
    let dejaVue = null;
    try { dejaVue = sessionStorage.getItem('racines-intro'); } catch (e) { /* navigation privée */ }
    const passer = reduit || q.has('sans-intro') || q.has('h') || q.has('region') || dejaVue;
    carte = new maplibregl.Map({
      container: 'carte',
      style: { version: 8, projection: { type: 'globe' }, sources: { terre: { type: 'geojson', data: CARTE.monde }, burkina: { type: 'geojson', data: donnees } },
        layers: [
          { id: 'fond', type: 'background', paint: { 'background-color': '#0b0d20' } },
          { id: 'terre', type: 'fill', source: 'terre', paint: { 'fill-color': '#22264a' } },
          { id: 'terre-trait', type: 'line', source: 'terre', paint: { 'line-color': '#7780a4', 'line-opacity': .45, 'line-width': .7 } },
          { id: 'ombre', type: 'fill', source: 'burkina', paint: { 'fill-color': '#05060f', 'fill-opacity': .5, 'fill-translate': [0, 7] } },
          { id: 'plat', type: 'fill', source: 'burkina', layout: { visibility: 'none' }, paint: { 'fill-color': couleur, 'fill-opacity': .95 } },
          { id: 'relief', type: 'fill-extrusion', source: 'burkina', paint: { 'fill-extrusion-color': couleur, 'fill-extrusion-height': ['+', 2000, ['*', ['get', 'recits'], 3500]], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': .95 } },
          { id: 'traits', type: 'line', source: 'burkina', paint: { 'line-color': '#f6d98e', 'line-width': 1, 'line-opacity': .55 } },
        ] },
      center: passer ? VUE_3D.center : [-60, 18], zoom: passer ? VUE_3D.zoom : 1.1, pitch: passer ? VUE_3D.pitch : 0,
      maxPitch: 70, minZoom: .6, maxZoom: 11, attributionControl: false,
    });
    carte.setPadding(paddingVue());
    carte.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: 'Contours : <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">geoBoundaries</a> (CC BY 4.0) · Natural Earth' }), 'bottom-right');
    carte.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-left');

    return new Promise((pret, echec) => {
      const delai = setTimeout(() => echec(new Error('la carte ne répond pas')), 20000);
      carte.on('error', (e) => console.warn('Carte :', e.error && e.error.message));
      carte.on('load', () => {
        clearTimeout(delai);
        C.histoires.forEach((h) => {
          const b = document.createElement('button');
          b.className = 'broche'; b.textContent = h.n; b.title = h.titre;
          b.setAttribute('aria-label', `${h.titre}, ${h.peuple}`);
          brancherBroche(b, h);
          new maplibregl.Marker({ element: b }).setLngLat([GEO[h.dossier].lon, GEO[h.dossier].lat]).addTo(carte);
        });
        const couches = ['relief', 'plat'];
        carte.on('mousemove', couches, (e) => {
          const f = e.features[0]; if (!f) return;
          if (regionSurvol !== null && regionSurvol !== f.id) carte.setFeatureState({ source: 'burkina', id: regionSurvol }, { survol: false });
          regionSurvol = f.id; carte.setFeatureState({ source: 'burkina', id: f.id }, { survol: true });
          carte.getCanvas().style.cursor = 'pointer';
          montrer(e.originalEvent.clientX, e.originalEvent.clientY, bulleRegion(f.properties.nom));
        });
        carte.on('mouseleave', couches, () => {
          if (regionSurvol !== null) carte.setFeatureState({ source: 'burkina', id: regionSurvol }, { survol: false });
          regionSurvol = null; carte.getCanvas().style.cursor = ''; cacher();
        });
        carte.on('click', couches, (e) => { if (e.features[0]) choisirRegion(e.features[0].properties.nom); });
        pret(passer);
      });
    });
  }

  function basculer3D() {
    etat.trois = !etat.trois;
    $('#b-3d').textContent = etat.trois ? 'Vue 2D' : 'Vue 3D';
    if (!carte) return;
    carte.setLayoutProperty('relief', 'visibility', etat.trois ? 'visible' : 'none');
    carte.setLayoutProperty('plat', 'visibility', etat.trois ? 'none' : 'visible');
    carte.setLayoutProperty('ombre', 'visibility', etat.trois ? 'visible' : 'none');
    carte.easeTo({ pitch: etat.trois ? 50 : 0, bearing: 0, duration: reduit ? 0 : 900 });
  }

  // Le film d'ouverture : le globe tourne, trouve le Burkina Faso, puis plonge.
  function jouerIntro() {
    const intro = $('#intro'), etatTexte = $('#intro-etat');
    let fini = false;
    const finir = () => {
      if (fini) return; fini = true;
      try { sessionStorage.setItem('racines-intro', '1'); } catch (e) { /* idem */ }
      intro.classList.add('fini'); carte.stop(); carte.jumpTo(Object.assign({}, VUE_3D, { padding: paddingVue() }));
      setTimeout(() => intro.classList.add('cache'), 900);
    };
    $('#intro-passer').onclick = finir;
    intro.classList.remove('cache');
    etatTexte.textContent = 'Le globe rejoint le Burkina Faso';
    carte.easeTo({ center: [-1.6, 12], zoom: 1.5, padding: { top: 0, bottom: 0, left: 0, right: 0 }, duration: 3000, easing: (t) => t * t * (3 - 2 * t) });
    carte.once('moveend', () => {
      if (fini) return;
      etatTexte.textContent = 'Les récits prennent racine';
      setTimeout(() => {
        if (fini) return;
        intro.classList.add('fini');
        carte.flyTo(Object.assign({}, VUE_3D, { padding: paddingVue(), duration: 4200, essential: true, curve: 1.3 }));
        carte.once('moveend', finir);
      }, 1100);
    });
  }

  // ------------------------------------------------------------ Carte SVG de secours
  function carteSvg() {
    const [LON0, LON1, LAT0, LAT1, W, H] = CARTE.cadre;
    const px = (lon, lat) => [(lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H];
    const zone = $('#carte-svg');
    zone.classList.remove('cache'); $('#carte').classList.add('cache');
    zone.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Carte du Burkina Faso et de ses treize régions">
      ${CARTE.svg.map((r) => { const k = (parRegion[r.nom] || []).length; return `<path d="${r.d}" tabindex="0" role="button" data-region="${echap(r.nom)}" class="${k ? 'a-recits' : ''}" aria-label="${echap(r.nom)}, ${k} récit${k > 1 ? 's' : ''}"></path>`; }).join('')}
      ${C.histoires.map((h) => { const [x, y] = px(GEO[h.dossier].lon, GEO[h.dossier].lat); return `<g class="broche-svg" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" tabindex="0" role="button" aria-label="${echap(h.titre)}" data-h="${h.dossier}"><circle r="11"></circle><text>${h.n}</text></g>`; }).join('')}
    </svg>`;
    zone.querySelectorAll('path').forEach((p) => {
      const n = p.dataset.region, act = () => choisirRegion(n);
      p.addEventListener('click', act);
      p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      p.addEventListener('mousemove', (e) => montrer(e.clientX, e.clientY, bulleRegion(n)));
      p.addEventListener('mouseleave', cacher);
    });
    zone.querySelectorAll('.broche-svg').forEach((g) => {
      const h = parId(g.dataset.h);
      brancherBroche(g, h);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisirHistoire(h.dossier); } });
    });
    $('#b-3d').classList.add('cache');
    $('#note-svg').classList.remove('cache');
  }
  function majSvg() { document.querySelectorAll('#carte-svg path').forEach((p) => p.classList.toggle('choisie', p.dataset.region === etat.region)); }

  // ------------------------------------------------------------ Démarrage
  $('#b-3d').onclick = basculer3D;
  $('#b-centre').onclick = () => { etat.histoire = null; etat.region = null; etat.parcours = null; rendrePanneau(); recentrer(); majSvg(); };
  rendrePanneau();
  const secours = () => {
    if (carte) { try { carte.remove(); } catch (e) { /* carte déjà morte */ } carte = null; }
    broches = {}; carteSvg(); rendrePanneau(); appliquer();
  };
  if (q.get('carte') === 'svg' || !webgl() || !window.maplibregl) secours();
  else {
    carteWebGL().then((passer) => {
      appliquer();
      const id = q.get('h'), reg = q.get('region');
      if (id && parId(id)) { choisirHistoire(id); return; }
      if (reg) { choisirRegion(reg); return; }
      if (!passer) jouerIntro();
    }).catch((e) => { console.warn(e); secours(); });
    // Si le pilote graphique lâche, la carte SVG prend la suite.
    carte.getCanvas().addEventListener('webglcontextlost', () => secours());
  }
})();
