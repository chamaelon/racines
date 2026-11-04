/*
 * Le lecteur de films : une seule image muette, et une piste audio par langue, jouée à côté et tenue en phase.
 * Les navigateurs ne laissent pas choisir une piste à l'intérieur d'un MP4 : deux fichiers séparés marchent partout.
 * Les textes à l'écran (titres, noms) passent par le site : ils suivent translate-<langue>.json.
 */
import { cartonA, choisirPiste, formaterTemps, horsSynchro, SANS_VOIX } from '../engine/film.js';
import * as data from '../data.js';
import { store } from '../store.js';
import { definirPage, esc } from '../ui.js';

const nomPiste = (code, langues) => (code === SANS_VOIX ? 'Sans voix (ambiance et musique)' : langues[code] || code);

function rendre(el, id, films, recits, langues) {
  const film = films[id];
  const recit = recits.find((r) => r.film === id);
  if (!film) {
    definirPage({ titre: 'Film introuvable' });
    el.innerHTML = '<div class="page texte"><h1>Film introuvable</h1><p>Ce film n\'existe pas, ou pas encore.</p><p><a class="bouton" href="#/catalogue">Voir le catalogue</a></p></div>';
    return () => {};
  }
  const titre = recit?.titre || id;
  definirPage({ titre, description: recit?.resume });
  el.innerHTML = `<article class="page page-film">
    <p class="fil"><a href="#/catalogue">Catalogue</a>${recit ? ` › <a href="#/recit/${recit.id}">${esc(titre)}</a>` : ''}</p>
    <h1>${esc(titre)}</h1>
    <div class="film" data-film>
      <div class="film-image">
      <video playsinline preload="metadata" muted src="${esc(data.url(film.video))}">${film.sousTitres.map((s) => `<track kind="subtitles" src="${esc(data.url(s.src))}" srclang="${s.code}" label="${esc(langues[s.code] || s.code)}">`).join('')}</video>
      <audio preload="auto"></audio>
      <div class="film-carton cache" data-carton><strong></strong><span></span></div>
      <button type="button" class="film-lancer" data-lancer aria-label="Lire le film">▶</button>
      </div>
      <div class="film-commandes">
        <button type="button" data-lire aria-label="Lire">▶</button>
        <input type="range" data-temps min="0" max="${film.duree}" step="0.1" value="0" aria-label="Position dans le film">
        <output data-repere data-sans-traduction>0:00 / ${formaterTemps(film.duree)}</output>
        <label class="film-choix">Langue <select data-langue>${film.pistes.map((p) => `<option value="${p.code}">${esc(nomPiste(p.code, langues))}</option>`).join('')}</select></label>
        <input type="range" data-volume min="0" max="1" step="0.05" value="1" aria-label="Volume">
        ${film.sousTitres.length ? '<button type="button" data-st aria-pressed="false" aria-label="Sous-titres">ST</button>' : ''}
        <button type="button" data-plein aria-label="Plein écran">⛶</button>
      </div>
    </div>
    <p class="film-note meta" data-note role="status"></p>
    ${film.rendu === 'stickman' ? '<p class="meta">Version provisoire en attendant le film en 3D.</p>' : ''}
    <div class="rangee">
      ${recit?.jouable ? `<a class="bouton fort" href="#/jouer/${recit.id}">▶ Vivre l'histoire</a>` : ''}
      ${recit ? `<a class="bouton" href="#/recit/${recit.id}">Fiche de l'histoire</a>` : ''}
    </div>
  </article>`;

  const cadre = el.querySelector('[data-film]');
  const video = cadre.querySelector('video'), audio = cadre.querySelector('audio');
  const temps = cadre.querySelector('[data-temps]'), repere = cadre.querySelector('[data-repere]');
  const lire = cadre.querySelector('[data-lire]'), lancer = cadre.querySelector('[data-lancer]');
  const choix = cadre.querySelector('[data-langue]'), note = el.querySelector('[data-note]');
  const carton = cadre.querySelector('[data-carton]');
  const siteChoix = document.querySelector('[data-langue-site]');
  let cartonCourant = null, sonEnAttente = false;

  const piste = (code) => film.pistes.find((p) => p.code === code);
  const boutonST = cadre.querySelector('[data-st]');
  // Une seule piste de sous-titres à la fois : celle de la langue écoutée, sinon le français.
  function poserSousTitres() {
    const actifs = boutonST?.getAttribute('aria-pressed') === 'true';
    const pistesTexte = [...video.textTracks];
    const voulue = pistesTexte.find((t) => t.language === choix.value) || pistesTexte.find((t) => t.language === 'fr');
    for (const t of pistesTexte) t.mode = actifs && t === voulue ? 'showing' : 'disabled';
  }
  function caler() {
    if (audio.src && horsSynchro(video.currentTime, audio.currentTime, audio.duration)) audio.currentTime = video.currentTime;
  }
  function expliquer(demande) {
    const code = choix.value;
    const manque = demande && !piste(demande) && demande !== 'fr';
    const notes = [];
    if (manque) notes.push(`Pas encore de piste en ${langues[demande] || demande}.`);
    if (piste(code)?.provisoire) notes.push(code === SANS_VOIX ? 'Montage sonore provisoire.' : code === 'fr' ? 'Voix de synthèse provisoire, en attendant les voix enregistrées.' : 'Traduction, sous-titres et voix automatiques, non relus par un locuteur : des erreurs sont probables.');
    if (!film.pistes.length) notes.push('Ce film n\'a pas encore de son.');
    note.textContent = notes.join(' ');
  }
  function poserPiste(code, demande) {
    if (!code) { audio.removeAttribute('src'); expliquer(demande); return; }
    choix.value = code;
    poserSousTitres();
    audio.src = data.url(piste(code).src);
    audio.currentTime = video.currentTime;
    if (!video.paused) audio.play().catch(() => {});
    expliquer(demande);
  }

  const majTemps = () => {
    temps.value = video.currentTime;
    repere.textContent = `${formaterTemps(video.currentTime)} / ${formaterTemps(film.duree)}`;
    const c = cartonA(film.cartons, video.currentTime);
    if (c === cartonCourant) return;
    cartonCourant = c;
    carton.classList.toggle('cache', !c);
    if (!c) return;
    carton.classList.toggle('centre', c.place === 'centre');
    carton.querySelector('strong').textContent = c.titre;
    carton.querySelector('span').textContent = c.detail || '';
  };
  const basculer = () => { if (video.paused) video.play().catch(() => {}); else video.pause(); };
  const auClavier = (e) => {
    if (e.target.closest('select, input, a, button') && e.key === ' ') return;
    if (e.key === ' ') { e.preventDefault(); basculer(); }
    if (e.target.matches('input')) return;
    if (e.key === 'ArrowRight') video.currentTime = Math.min(film.duree, video.currentTime + 5);
    if (e.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5);
  };

  // Un média absent ou illisible (pas encore publié, coupure) se dit au visiteur, au lieu d'un bouton qui ne fait rien.
  video.addEventListener('error', () => {
    lancer.classList.add('cache');
    note.textContent = 'Ce film ne peut pas être lu pour l\'instant. L\'histoire reste à jouer.';
  });
  audio.addEventListener('error', () => {
    if (audio.getAttribute('src')) note.textContent = 'Cette piste audio ne peut pas être lue pour l\'instant : essayez une autre langue.';
  });
  video.addEventListener('click', basculer);
  lancer.addEventListener('click', basculer);
  lire.addEventListener('click', basculer);
  cadre.addEventListener('keydown', auClavier);
  video.addEventListener('play', () => {
    lancer.classList.add('cache');
    lire.textContent = '⏸'; lire.setAttribute('aria-label', 'Pause');
    caler();
    if (audio.src) audio.play().catch(() => {});
    if (recit) store.marquer(recit.id, 'ecoute');
  });
  video.addEventListener('pause', () => {
    if (sonEnAttente) return;
    lancer.classList.remove('cache');
    lire.textContent = '▶'; lire.setAttribute('aria-label', 'Lire');
    audio.pause();
  });
  video.addEventListener('timeupdate', () => { majTemps(); caler(); });
  video.addEventListener('seeking', () => { majTemps(); if (audio.src) audio.currentTime = video.currentTime; });
  video.addEventListener('waiting', () => audio.pause());
  video.addEventListener('playing', () => { caler(); if (audio.src) audio.play().catch(() => {}); });
  // Le son en retard retient l'image, pour ne pas faire parler les personnages à côté de leur voix.
  audio.addEventListener('waiting', () => { if (!video.paused) { sonEnAttente = true; video.pause(); } });
  const reprendreImage = () => { if (sonEnAttente) { sonEnAttente = false; video.play().catch(() => {}); } };
  audio.addEventListener('canplay', reprendreImage);
  // Le son peut repartir sans repasser par canplay : l'image ne doit pas rester figée.
  audio.addEventListener('playing', reprendreImage);
  temps.addEventListener('input', () => { video.currentTime = Number(temps.value); });
  cadre.querySelector('[data-volume]').addEventListener('input', (e) => { audio.volume = Number(e.target.value); });
  choix.addEventListener('change', () => { store.definirPref('langueVoix', choix.value); poserPiste(choix.value); });
  const surLangueSite = () => {
    const demande = siteChoix.value;
    if (piste(demande)) { store.definirPref('langueVoix', demande); poserPiste(demande); } else expliquer(demande);
  };
  siteChoix?.addEventListener('change', surLangueSite);
  cadre.querySelector('[data-st]')?.addEventListener('click', (e) => {
    e.currentTarget.setAttribute('aria-pressed', e.currentTarget.getAttribute('aria-pressed') !== 'true');
    poserSousTitres();
  });
  const plein = () => { if (document.fullscreenElement) document.exitFullscreen(); else cadre.requestFullscreen?.(); };
  cadre.querySelector('[data-plein]').addEventListener('click', plein);

  const site = siteChoix?.value;
  poserPiste(choisirPiste(film.pistes, store.pref('langueVoix'), site), store.pref('langueVoix') || site);
  majTemps();
  return () => {
    siteChoix?.removeEventListener('change', surLangueSite);
    video.pause(); audio.pause();
    video.removeAttribute('src'); audio.removeAttribute('src');
    video.load(); audio.load();
  };
}

export async function monter(el, ctx) {
  const [films, recits, langues] = await Promise.all([data.films(), data.recits(), data.langues()]);
  let fermer = rendre(el, ctx.params[0], films, recits, langues);
  return {
    maj({ params }) { fermer(); scrollTo(0, 0); fermer = rendre(el, params[0], films, recits, langues); },
    demonter() { fermer(); },
  };
}
