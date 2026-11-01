/*
 * Racines — le lecteur : un film (animation ou vidéo) et plusieurs bandes sonores indépendantes
 * (une voix au choix, ambiance, musique), sous-titres, arrêts interactifs du griot et question de fin.
 * Le film est l'horloge : chaque piste audio se recale dessus.
 */
(function () {
  const { C, echap, mmss, parId, etiquette, Carnet, nav } = window.RACINES_APP;
  const $ = (s) => document.querySelector(s);
  const q = new URLSearchParams(location.search);
  const h = parId(q.get('h')) || C.histoires[0];
  const id = h.dossier;
  const GEO = window.GEO[id], D = window.DOUBLAGE;
  const SEUL = window.MODE_SEUL;
  const mode = SEUL || (q.get('mode') === 'video' ? 'video' : 'anim');
  const parcours = window.PARCOURS.find((p) => p.id === q.get('parcours'));
  const mmssCourt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const pistes = (window.PISTES || {})[id] || [];
  const url = (nom) => `../audio/${id}/${nom}.mp3`;
  const lienFilm = (hist, extra) => `lecteur.html?h=${hist}${mode === 'video' ? '&mode=video' : ''}${extra || ''}`;

  nav('', true);
  document.title = `${h.titre} — Racines`;
  $('#titre').textContent = h.titre;
  $('#meta').innerHTML = `${echap(h.peuple)} · ${echap(h.type)} · ${mmss(h.duree)} · ${echap(GEO.lieu)}${GEO.approx ? ' (indicatif)' : ''}`;

  // ------------------------------------------------------------ Choix de la version
  const bascule = $('#version');
  if (SEUL) bascule.remove();
  else {
    bascule.innerHTML = `<a class="bouton" ${mode === 'anim' ? 'aria-pressed="true"' : ''} href="lecteur.html?h=${id}${parcours ? `&parcours=${parcours.id}` : ''}">Animation</a>
      <a class="bouton" ${mode === 'video' ? 'aria-pressed="true"' : ''} href="lecteur.html?h=${id}&mode=video${parcours ? `&parcours=${parcours.id}` : ''}">Vidéo</a>`;
  }

  // ------------------------------------------------------------ Bandes sonores
  const pref = (() => { try { return JSON.parse(localStorage.getItem('racines-son')) || {}; } catch (e) { return {}; } })();
  const reg = Object.assign({ voix: 1, ambiance: 0.45, musique: 0.35, st: true, griot: true, lang: 'fr' }, pref);
  const garder = () => { try { localStorage.setItem('racines-son', JSON.stringify(reg)); } catch (e) { /* navigation privée */ } };
  const audios = {};
  function piste(nom, src) {
    const a = new Audio();
    a.preload = 'auto'; a.src = src;
    audios[nom] = a;
    return a;
  }
  if (pistes.includes('ambiance')) piste('ambiance', url('ambiance'));
  if (pistes.includes('musique')) piste('musique', url('musique'));

  // La liste des voix : celles qui existent, puis les langues nationales visées, à enregistrer.
  const voixDispo = pistes.filter((p) => p.startsWith('voix-')).map((p) => p.slice(5));
  const VISEES = ['fr', 'mos', 'dyu', 'fuf'];
  const sel = $('#voix');
  sel.innerHTML = '';
  voixDispo.forEach((c) => sel.add(new Option(`Voix : ${window.LANGUES[c] || c}${c === 'fr' ? ' (voix de synthèse)' : ''}`, c)));
  VISEES.filter((c) => !voixDispo.includes(c)).forEach((c) => { const o = new Option(`${window.LANGUES[c]} : à enregistrer`, c); o.disabled = true; sel.add(o); });
  sel.add(new Option('Sans voix', 'aucune'));
  sel.add(new Option('Importer une piste de voix…', 'importer'));
  let langue = voixDispo.includes(reg.lang) ? reg.lang : (voixDispo[0] || 'aucune');
  // Un lien peut demander une langue (depuis le studio par exemple).
  if (voixDispo.includes(q.get('lang'))) langue = q.get('lang');
  sel.value = langue;

  function changerVoix(src) {
    if (audios.voix) { audios.voix.pause(); audios.voix.src = ''; delete audios.voix; }
    if (src) piste('voix', src);
    volumes(); caler(true); if (film && !film.enPause()) tout('lire');
  }
  if (langue !== 'aucune') piste('voix', url('voix-' + langue));
  sel.addEventListener('change', () => {
    if (sel.value === 'importer') { $('#fichier').click(); return; }
    langue = sel.value; reg.lang = langue; garder();
    changerVoix(langue === 'aucune' ? null : url('voix-' + langue));
  });
  $('#fichier').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) { langue = 'importee'; changerVoix(URL.createObjectURL(f)); }
    else sel.value = langue;
  });

  // Quand quelqu'un parle, la musique et l'ambiance baissent un peu.
  let baisse = 1;
  function volumes() {
    const v = (a, x) => { if (a) a.volume = Math.max(0, Math.min(1, x)); };
    v(audios.voix, reg.voix);
    v(audios.ambiance, reg.ambiance * baisse);
    v(audios.musique, reg.musique * baisse);
  }
  [['#vol-voix', 'voix'], ['#vol-ambiance', 'ambiance'], ['#vol-musique', 'musique']].forEach(([s, k]) => {
    const e = $(s); e.value = reg[k];
    e.addEventListener('input', () => { reg[k] = +e.value; garder(); volumes(); });
  });
  const caseSt = $('#c-st'), caseGriot = $('#c-griot');
  caseSt.checked = reg.st; caseGriot.checked = reg.griot;
  caseSt.addEventListener('change', () => { reg.st = caseSt.checked; garder(); });
  caseGriot.addEventListener('change', () => { reg.griot = caseGriot.checked; garder(); });

  const tout = (act) => Object.values(audios).forEach((a) => { if (act === 'lire') { const p = a.play(); if (p && p.catch) p.catch(() => {}); } else a.pause(); });
  function caler(force) {
    if (!film) return;
    const t = film.time();
    Object.values(audios).forEach((a) => {
      if (a.readyState < 1) return;
      const fin = a.duration || 0;
      if (fin && t >= fin) { a.pause(); return; }
      if (force || Math.abs(a.currentTime - t) > 0.3) { try { a.currentTime = t; } catch (e) { /* pas encore prêt */ } }
    });
  }

  // ------------------------------------------------------------ Le film
  let film = null, arretFait = false, finFaite = false, vuNote = false, enQuestion = false;
  const ecran = $('#ecran'), curseur = $('#curseur'), temps = $('#temps'), btn = $('#lecture'), st = $('#sous-titre');

  function lire() {
    if (!film || enQuestion) return;
    $('#depart').classList.add('cache');
    const r = film.lire();
    if (r && r.catch) r.catch(() => {});
    caler(true); tout('lire');
    btn.textContent = '❚❚';
  }
  function pause() { if (!film) return; film.pause(); tout('pause'); btn.textContent = '▶'; }
  function aller(t) {
    if (!film) return;
    film.aller(Math.max(0, Math.min(film.duree(), t)));
    if (film.time() < (D.arret ? D.arret.t : 0)) arretFait = false;
    finFaite = false;
    caler(true); boucle(true);
  }
  btn.onclick = () => { if (!film) return; $('#depart').classList.add('cache'); (film.enPause() ? lire : pause)(); };
  $('#depart').onclick = () => lire();
  curseur.addEventListener('input', () => aller(+curseur.value));
  $('#scenes').addEventListener('change', (e) => { aller(+e.target.value + 0.01); e.target.value = ''; });
  $('#plein').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else ecran.requestFullscreen && ecran.requestFullscreen(); };
  document.addEventListener('keydown', (e) => {
    if (!film || (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) && e.target.type !== 'range')) return;
    if (e.code === 'Space') { e.preventDefault(); btn.click(); }
    if (e.code === 'ArrowRight') { e.preventDefault(); aller(film.time() + 5); }
    if (e.code === 'ArrowLeft') { e.preventDefault(); aller(film.time() - 5); }
    if (e.code === 'KeyF') $('#plein').click();
  });

  // Script minuté, cliquable
  const lignes = D.cues.map((c, i) => `<button type="button" data-i="${i}"><time>${mmssCourt(c.d)}</time><span>${c.r === 'N' ? '' : `<em>${echap(c.r.charAt(0) + c.r.slice(1).toLowerCase())} : </em>`}${echap(c.t)}</span></button>`).join('');
  const blocScript = $('#script');
  blocScript.innerHTML = lignes;
  blocScript.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { aller(D.cues[+b.dataset.i].d); if (film.enPause()) lire(); } });

  let cueActive = -1, dernierCalage = 0;
  function boucle(force) {
    if (film) {
      const t = film.time(), d = film.duree();
      if (!curseur.matches(':active') || force) curseur.value = t;
      temps.textContent = `${mmssCourt(t)} / ${mmssCourt(d)}`;
      let i = -1;
      for (let k = 0; k < D.cues.length; k++) { if (t >= D.cues[k].d && t < D.cues[k].f) { i = k; break; } }
      if (i !== cueActive || force) {
        cueActive = i;
        const c = D.cues[i];
        if (reg.st && c) st.innerHTML = `<span>${c.r === 'N' ? '' : `<em>${echap(c.r.charAt(0) + c.r.slice(1).toLowerCase())} : </em>`}${echap(c.t)}</span>`;
        else st.innerHTML = '';
        blocScript.querySelectorAll('.courante').forEach((x) => x.classList.remove('courante'));
        const b = i >= 0 && blocScript.children[i];
        if (b) { b.classList.add('courante'); blocScript.scrollTop = b.offsetTop - blocScript.offsetTop - 60; }
        baisse = (i >= 0 && audios.voix) ? 0.55 : 1;
        volumes();
      }
      if (!film.enPause()) {
        if (performance.now() - dernierCalage > 500) { dernierCalage = performance.now(); caler(false); }
        if (D.arret && reg.griot && !arretFait && t >= D.arret.t && t < D.arret.t + 1.5) { arretFait = true; poserQuestion(D.arret, 'arret'); }
        if (!vuNote && t > d * 0.8) { vuNote = true; Carnet.maj(id, { vu: true }); }
      }
      // Hors du test de pause : une vidéo arrivée au bout passe d'elle-même en pause.
      if (!finFaite && !enQuestion && d && t >= d - 0.15) { finFaite = true; pause(); poserQuestion(D.quiz, 'quiz'); }
    }
    if (force !== true) requestAnimationFrame(boucle);
  }

  // ------------------------------------------------------------ Le griot interroge
  function poserQuestion(Q, genre) {
    pause(); enQuestion = true;
    const z = $('#griot'); z.classList.remove('cache');
    const suite = genre === 'arret' ? 'Reprendre le récit' : 'Continuer';
    z.innerHTML = `<div class="griot-boite" role="dialog" aria-modal="true" aria-label="Question du griot">
      <p class="sur-titre">${genre === 'arret' ? 'Le griot s\'arrête et vous demande' : 'Pour finir, le griot vous demande'}</p>
      <h3>${echap(Q.q)}</h3>
      ${Q.rep.map((r, i) => `<button class="choix" type="button" data-i="${i}">${echap(r)}</button>`).join('')}
      <div id="griot-suite"></div>
      ${genre === 'arret' ? '<button class="bouton" type="button" id="griot-passer">Passer</button>' : ''}
    </div>`;
    const fermer = () => { z.classList.add('cache'); z.innerHTML = ''; enQuestion = false; };
    const prem = z.querySelector('.choix'); if (prem) prem.focus();
    if (genre === 'arret') z.querySelector('#griot-passer').onclick = () => { fermer(); lire(); };
    z.querySelectorAll('.choix').forEach((b) => {
      b.onclick = () => {
        const ok = +b.dataset.i === Q.bonne;
        z.querySelectorAll('.choix').forEach((x, i) => { x.disabled = true; if (i === Q.bonne) x.classList.add('bonne'); });
        if (!ok) b.classList.add('fausse');
        if (genre === 'quiz') Carnet.maj(id, { vu: true, quiz: ok || Carnet.get(id).quiz });
        const pas = z.querySelector('#griot-passer'); if (pas) pas.remove();
        z.querySelector('#griot-suite').innerHTML = `<p class="note"><strong>${ok ? 'C\'est bien cela.' : 'Pas tout à fait.'}</strong> ${echap(Q.note)}</p>
          <div class="actions"><button class="bouton fort" type="button" id="griot-ok">${suite}</button></div>`;
        const k = z.querySelector('#griot-ok'); k.focus();
        k.onclick = () => { fermer(); if (genre === 'arret') lire(); else finDeFilm(); };
      };
    });
  }

  function finDeFilm() {
    const z = $('#griot'); z.classList.remove('cache'); enQuestion = true;
    const i = C.histoires.indexOf(h);
    let suiv, lien;
    if (parcours) {
      const k = parcours.etapes.indexOf(id);
      if (k >= 0 && k < parcours.etapes.length - 1) { suiv = parId(parcours.etapes[k + 1]); lien = lienFilm(suiv.dossier, `&parcours=${parcours.id}`); }
    } else {
      // Plus proche voisin sur la carte, pas encore vu si possible : le voyage continue à côté.
      const dist = (a) => Math.hypot(window.GEO[a.dossier].lat - GEO.lat, window.GEO[a.dossier].lon - GEO.lon);
      const autres = C.histoires.filter((a) => a !== h);
      const nonVus = autres.filter((a) => !Carnet.get(a.dossier).vu);
      suiv = (nonVus.length ? nonVus : autres).sort((a, b) => dist(a) - dist(b))[0];
      lien = lienFilm(suiv.dossier);
    }
    z.innerHTML = `<div class="griot-boite">
      <p class="sur-titre">Récit terminé${parcours ? ` · ${echap(parcours.nom)}` : ''}</p>
      <h3>${Carnet.vus()} récit${Carnet.vus() > 1 ? 's' : ''} sur ${C.histoires.length} dans votre carnet de voyage.</h3>
      <div class="actions">
        ${suiv ? `<a class="bouton fort" href="${lien}">Récit suivant : ${echap(suiv.titre)}</a>` : `<a class="bouton fort" href="carnet.html">Voyage terminé : voir le carnet</a>`}
        <a class="bouton" href="index.html?h=${id}">Retour à la carte</a>
        <button class="bouton" type="button" id="revoir">Revoir</button>
      </div></div>`;
    z.querySelector('#revoir').onclick = () => { z.classList.add('cache'); enQuestion = false; arretFait = false; finFaite = false; aller(0); lire(); };
  }

  // ------------------------------------------------------------ Fiche et téléchargements
  $('#fiche').innerHTML = `<p>${echap(h.resume)}</p>
    <p><span class="badge ${h.statut}">${etiquette(h)}</span></p>
    <p class="avert">Les personnages et les détails mis en scène sont reconstitués pour l'image. Les sources sont citées dans le générique ; le récit reste à vérifier auprès des conteurs et des historiens.</p>`;
  $('#fichiers').innerHTML = `<li><a href="../doublage/${id}/script-fr.md" download>Script minuté (Markdown)</a></li>
    <li><a href="../doublage/${id}/traduction.csv" download>Feuille de traduction (CSV)</a></li>
    <li><a href="../doublage/${id}/fr.srt" download>Sous-titres SRT</a> · <a href="../doublage/${id}/fr.vtt" download>VTT</a></li>
    <li><a href="studio.html?h=${id}">Enregistrer une voix pour ce film</a></li>
    ${window.MODE_SEUL === 'anim' ? '' : `<li><a href="${window.RACINE_VIDEOS || '../videos'}/${id}.mp4" download>Télécharger la vidéo (MP4, muette)</a></li>`}`;
  const i = C.histoires.indexOf(h), prec = C.histoires[i - 1], suiv = C.histoires[i + 1];
  $('#navigation').innerHTML = (prec ? `<a class="bouton" href="${lienFilm(prec.dossier)}">← ${echap(prec.titre)}</a>` : '<span></span>') +
    (suiv ? `<a class="bouton" href="${lienFilm(suiv.dossier)}">${echap(suiv.titre)} →</a>` : '<span></span>');
  $('#retour').href = `index.html?h=${id}`;
  if (parcours) $('#parcours').textContent = `Voyage : ${parcours.nom}, étape ${parcours.etapes.indexOf(id) + 1}/${parcours.etapes.length}`;

  // ------------------------------------------------------------ Démarrage
  function erreur(m) {
    $('#depart').innerHTML = `<span>${echap(m)}</span>`;
    $('#depart').disabled = true;
  }
  (async () => {
    try {
      if (mode === 'video') {
        const sc = (D.scenes || []);
        film = window.Film.video(id, ecran, sc, window.RACINE_VIDEOS || '../videos');
        await film.finChargement;
        const v = film.el;
        v.addEventListener('waiting', () => tout('pause'));
        v.addEventListener('playing', () => { caler(true); tout('lire'); });
      } else {
        film = await window.Film.animation(id, ecran);
      }
    } catch (e) {
      erreur(mode === 'video' ? 'Cette vidéo n\'est pas encore disponible. La version animée, elle, l\'est.' : e.message);
      return;
    }
    curseur.max = film.duree();
    film.scenes.forEach((s, k) => $('#scenes').add(new Option(`${k + 1}. ${s.nom} (${mmssCourt(s.d)})`, s.d)));
    volumes();
    const t0 = parseFloat(q.get('t'));
    if (t0) film.aller(t0);
    $('#depart b').textContent = '▶';
    $('#depart').disabled = false;
    $('#depart span').textContent = 'Écouter le récit';
    window.__lecteur = { film, audios, D };
    requestAnimationFrame(boucle);
  })();
})();
