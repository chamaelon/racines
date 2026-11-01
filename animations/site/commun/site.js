/*
 * Racines — rendu du catalogue et du lecteur, communs aux deux versions du site.
 * La page déclare window.VERSION = 'animations' | 'videos' avant de charger ce fichier.
 * Chemins relatifs à site/<version>/ :
 *   animations : ../../histoires/<dossier>/index.html
 *   vidéos     : ../../videos/<dossier>.mp4
 */
(function () {
  const C = window.CATALOGUE, V = window.VERSION;
  const $ = (s) => document.querySelector(s);
  const echap = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mmss = (s) => `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, '0')}`;
  const vignette = (h) => `../commun/vignettes/${h.dossier}.jpg`;
  const source = (h) => (V === 'videos' ? `../../videos/${h.dossier}.mp4` : `../../histoires/${h.dossier}/index.html`);
  const etiquette = (h) => (h.statut === 'historique' ? 'Récit historique simplifié' : 'Adaptation libre, à vérifier');

  /** Vérifie qu'une vidéo existe (sur file://, on teste via un élément <video>). */
  function videoDispo(h) {
    return new Promise((ok) => {
      if (V !== 'videos') return ok(true);
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => ok(true);
      v.onerror = () => ok(false);
      v.src = source(h);
      setTimeout(() => ok(null), 4000);
    });
  }

  // ------------------------------------------------------------ Catalogue
  function catalogue() {
    const zone = $('#catalogue'), recherche = $('#recherche'), filtreType = $('#type'), filtrePeuple = $('#peuple');
    const types = [...new Set(C.histoires.map((h) => h.type))].sort();
    const peuples = [...new Set(C.histoires.map((h) => h.peuple))].sort();
    types.forEach((t) => filtreType.add(new Option(t, t)));
    peuples.forEach((p) => filtrePeuple.add(new Option(p, p)));
    const dispo = {};

    function rendre() {
      const q = recherche.value.trim().toLowerCase(), ty = filtreType.value, pe = filtrePeuple.value;
      const liste = C.histoires.filter((h) =>
        (!ty || h.type === ty) && (!pe || h.peuple === pe) &&
        (!q || (h.titre + ' ' + h.peuple + ' ' + h.resume).toLowerCase().includes(q)));
      $('#compte').textContent = `${liste.length} histoire${liste.length > 1 ? 's' : ''}`;
      zone.innerHTML = C.regions.map((r, i) => {
        const hs = liste.filter((h) => h.region === i);
        if (!hs.length) return '';
        return `<h2 class="region">${echap(r)}</h2><div class="grille">${hs.map((h) => `
          <a class="carte${dispo[h.dossier] === false ? ' indispo' : ''}" href="lecteur.html?h=${h.dossier}">
            <div class="image"><img src="${vignette(h)}" alt="" loading="lazy"><span class="num">${String(h.n).padStart(2, '0')}</span><span class="duree">${mmss(h.duree)}</span></div>
            <div class="corps">
              <h3>${echap(h.titre)}</h3>
              <div class="meta">${echap(h.peuple)} · ${echap(h.type)}</div>
              <p>${echap(h.resume)}</p>
              <span class="badge ${h.statut}">${etiquette(h)}</span>
            </div>
          </a>`).join('')}</div>`;
      }).join('') || '<p>Aucune histoire ne correspond.</p>';
    }
    [recherche, filtreType, filtrePeuple].forEach((e) => e.addEventListener('input', rendre));
    rendre();
    if (V === 'videos') C.histoires.forEach((h) => videoDispo(h).then((ok) => { if (ok === false) { dispo[h.dossier] = false; rendre(); } }));
  }

  // ------------------------------------------------------------ Lecteur
  function lecteur() {
    const id = new URLSearchParams(location.search).get('h');
    const i = Math.max(0, C.histoires.findIndex((h) => h.dossier === id));
    const h = C.histoires[i];
    document.title = `${h.titre} — Racines`;
    $('#titre').textContent = `${String(h.n).padStart(2, '0')} · ${h.titre}`;
    const ecran = $('#ecran');
    if (V === 'videos') {
      ecran.innerHTML = `<video controls preload="metadata" poster="${vignette(h)}" src="${source(h)}"></video>`;
      videoDispo(h).then((ok) => {
        if (ok === false) ecran.innerHTML = `<div style="display:grid;place-items:center;height:100%;padding:24px;text-align:center"><p>Cette vidéo n'est pas encore disponible.</p></div>`;
      });
    } else {
      ecran.classList.add('anim');
      ecran.innerHTML = `<iframe src="${source(h)}" title="${echap(h.titre)}" allow="fullscreen" allowfullscreen></iframe>`;
    }
    $('#fiche').innerHTML = `
      <div>
        <p class="meta">${echap(h.peuple)} · ${echap(h.type)} · ${mmss(h.duree)}</p>
        <p>${echap(h.resume)}</p>
        <p class="avertissement">${etiquette(h)} : les personnages et les détails mis en scène sont reconstitués pour l'image. Les sources sont citées dans le générique.</p>
      </div>
      <div>
        ${V === 'videos'
          ? `<p><a href="${source(h)}" download>Télécharger la vidéo (MP4)</a></p><p class="autre-version"><a href="../animations/lecteur.html?h=${h.dossier}">Voir la version animée</a></p>`
          : `<p><a href="${source(h)}" target="_blank">Ouvrir en plein écran</a></p><p>Espace : lecture / pause · Flèches : ±5 s · menu des scènes en bas.</p><p class="autre-version"><a href="../videos/lecteur.html?h=${h.dossier}">Voir la version vidéo</a></p>`}
      </div>`;
    const prec = C.histoires[i - 1], suiv = C.histoires[i + 1];
    $('#navigation').innerHTML =
      (prec ? `<a href="lecteur.html?h=${prec.dossier}">← ${echap(prec.titre)}</a>` : '<span></span>') +
      (suiv ? `<a href="lecteur.html?h=${suiv.dossier}">${echap(suiv.titre)} →</a>` : '<span></span>');
  }

  if ($('#catalogue')) catalogue();
  if ($('#ecran')) lecteur();
  // Version publiée seule : pas de lien vers l'autre version.
  if (window.SITE_SEUL) document.querySelectorAll('.autre-version').forEach((e) => e.remove());
})();
