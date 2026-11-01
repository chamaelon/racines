/*
 * Le lecteur des fiches : langue, vitesse, reprise là où on s'était arrêté, sous-titres français.
 * Aucune lecture automatique : le son démarre seulement quand l'utilisateur appuie.
 */
import { fichierTexte, url } from '../data.js';
import { store } from '../store.js';
import { esc } from '../ui.js';

const VITESSES = [0.75, 1, 1.25];

const enSecondes = (t) => { const p = t.trim().split(':').map(Number); return p.reduce((s, v) => s * 60 + v, 0); };
export function lireVtt(txt) {
  return txt.replace(/\r/g, '').split(/\n\n+/).map((b) => {
    const l = b.split('\n');
    const i = l.findIndex((x) => x.includes('-->'));
    if (i < 0) return null;
    const [d, f] = l[i].split('-->');
    return { debut: enSecondes(d), fin: enSecondes(f.split(' ').filter(Boolean)[0]), texte: l.slice(i + 1).join(' ').trim() };
  }).filter(Boolean);
}

export function monterLecteur(el, recit, langues) {
  const codes = Object.keys(recit.audio);
  if (!codes.length) {
    el.innerHTML = '<p class="meta">Pas encore d\'audio pour ce récit. La collecte reste ouverte.</p>';
    return () => {};
  }
  el.innerHTML = `<div class="lecteur">
    <div class="lecteur-haut">
      <div role="group" aria-label="Langue de la voix" class="segments" data-langues>${codes.map((c, i) => `<button type="button" data-l="${c}" aria-pressed="${i === 0}">${esc(langues[c])}</button>`).join('')}</div>
      <div role="group" aria-label="Vitesse de lecture" class="segments" data-vitesses>${VITESSES.map((v) => `<button type="button" data-v="${v}" aria-pressed="${v === 1}">${String(v).replace('.', ',')}×</button>`).join('')}</div>
    </div>
    <p class="audio-a-venir cache"><strong>Audio à venir :</strong> ce fichier est muet en attendant la voix enregistrée. Les sous-titres défilent déjà.</p>
    <audio controls preload="metadata"></audio>
    <div class="sous-titres" aria-label="Sous-titres en français"></div>
  </div>`;
  const audio = el.querySelector('audio');
  audio.setAttribute('aria-label', `Écouter : ${recit.titre}`);
  const zone = el.querySelector('.sous-titres');
  const avertir = el.querySelector('.audio-a-venir');
  let langue = codes[0], cues = [], derniereSauvegarde = 0, vitesse = 1;

  async function choisirLangue(c) {
    langue = c;
    const a = recit.audio[c];
    el.querySelectorAll('[data-l]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.l === c));
    avertir.classList.toggle('cache', !a.provisoire);
    audio.src = url(a.src);
    audio.playbackRate = vitesse;
    const reprise = store.positionAudio(recit.id, c);
    if (reprise) audio.addEventListener('loadedmetadata', () => { audio.currentTime = reprise; }, { once: true });
    if (reprise) audio.load();
    cues = lireVtt(await fichierTexte(a.vtt));
    zone.innerHTML = cues.map((q, i) => `<button type="button" data-q="${i}">${esc(q.texte)}</button>`).join('');
  }

  el.querySelector('[data-langues]').addEventListener('click', (e) => { const b = e.target.closest('[data-l]'); if (b) choisirLangue(b.dataset.l); });
  el.querySelector('[data-vitesses]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    vitesse = +b.dataset.v;
    audio.playbackRate = vitesse;
    el.querySelectorAll('[data-v]').forEach((x) => x.setAttribute('aria-pressed', x === b));
  });
  zone.addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]'); if (!b) return;
    audio.currentTime = cues[+b.dataset.q].debut;
  });
  audio.addEventListener('play', () => store.marquer(recit.id, 'ecoute'));
  audio.addEventListener('timeupdate', () => {
    const t = audio.currentTime;
    if (Math.abs(t - derniereSauvegarde) > 3) { derniereSauvegarde = t; store.retenirAudio(recit.id, langue, t); }
    const i = cues.findIndex((q) => t >= q.debut && t < q.fin);
    const act = zone.querySelector('.actif');
    if (act && +act.dataset.q === i) return;
    if (act) act.classList.remove('actif');
    if (i >= 0) { const b = zone.children[i]; b.classList.add('actif'); zone.scrollTop = b.offsetTop - zone.offsetTop - 40; }
  });
  audio.addEventListener('ended', () => store.retenirAudio(recit.id, langue, 0));
  choisirLangue(langue);
  return () => { audio.pause(); audio.removeAttribute('src'); };
}
