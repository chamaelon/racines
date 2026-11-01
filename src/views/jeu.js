/*
 * « Vivre l'histoire » : l'écran de jeu en plein écran.
 * Assemble le moteur, le rendu 2,5D (ou le mode lecture sans WebGL), le son, la sauvegarde et les menus.
 */
import { Ambiance } from '../audio/ambiance.js';
import * as data from '../data.js';
import { choisir } from '../engine/choix.js';
import { creerDialogue } from '../engine/dialogue.js';
import { explorer } from '../engine/exploration.js';
import { lancer as lancerCourse } from '../engine/minijeux/course.js';
import { lancer as lancerDevinette } from '../engine/minijeux/devinette.js';
import { lancer as lancerRythme } from '../engine/minijeux/rythme.js';
import { finsDe, Moteur } from '../engine/moteur.js';
import { DECORS } from '../scenes/catalogue-decors.js';
import { store } from '../store.js';
import { definirPage, esc, reduit, webgl } from '../ui.js';

const MINIJEUX = { course_cheval: lancerCourse, devinette: lancerDevinette, rythme: lancerRythme };
const VITESSES = [['Lente', 0.6], ['Normale', 1], ['Rapide', 1.8], ['Instantanée', 0]];
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

// Le mode lecture expose les mêmes méthodes que le rendu 3D, sans WebGL : un fond et le dialogue suffisent.
class RenduLecture {
  constructor(scene) { this.scene = scene; }
  charger(nom) { const c = DECORS[nom].ciel; this.scene.style.background = `linear-gradient(${c[0]}, ${c[1]})`; }
  cadrer() {} parler() {} galop() {} explorer() {} finExplorer() {} detruire() {}
}

export async function monter(el, ctx) {
  const id = ctx.params[0];
  const recits = await data.recits();
  const r = recits.find((x) => x.id === id);
  if (!r || !r.jouable) {
    definirPage({ titre: 'Histoire introuvable' });
    el.innerHTML = '<div class="page texte"><h1>Cette histoire ne se joue pas encore</h1><p><a class="bouton" href="#/catalogue">Voir le catalogue</a></p></div>';
    document.body.classList.remove('plein-ecran');
    return { demonter() {} };
  }
  const [histoire, patrimoine, langues] = await Promise.all([data.histoire(r.jouable), data.patrimoine(), data.langues()]);
  definirPage({ titre: `Vivre : ${histoire.titre}`, description: histoire.presentation });
  const fins = finsDe(histoire);

  el.innerHTML = `<div class="jeu">
    <canvas class="j-canvas" aria-hidden="true"></canvas>
    <div class="j-lecture cache"></div>
    <div class="j-haut">
      <div class="j-fil" aria-label="Les choix déjà faits"></div>
      <button type="button" class="j-btn" data-moteur aria-pressed="false">Moteur</button>
      <button type="button" class="j-btn" data-son aria-pressed="true">Son</button>
      <button type="button" class="j-btn" data-pause>Pause</button>
    </div>
    <div class="j-debug cache" aria-live="off"></div>
    <div class="j-explore cache">
      <span class="j-explore-compte"></span>
      <div class="j-explore-liste"></div>
      <button type="button" class="j-btn fort j-explore-suite">Continuer ▶</button>
    </div>
    <div class="j-info cache" role="dialog" aria-label="Fiche patrimoine">
      <div class="j-info-corps"></div>
      <button type="button" class="j-btn">Fermer</button>
    </div>
    <p class="lecteur-seul j-annonce" aria-live="polite"></p>
    <div class="j-boite cache">
      <div class="j-etiquette"><canvas class="j-portrait" width="96" height="96" aria-hidden="true"></canvas><span class="j-nom"></span></div>
      <div class="j-texte"></div>
      <div class="j-choix"></div>
      <div class="j-suite" aria-hidden="true">continuer ▶</div>
    </div>
    <div class="j-mini cache"></div>
    <div class="j-fin cache" role="dialog" aria-label="Fin de l'histoire"></div>
    <div class="j-pause cache" role="dialog" aria-modal="true" aria-label="Pause"></div>
    <div class="j-titre">
      <p class="sur-titre">Vivre l'histoire</p>
      <h1>${esc(histoire.titre)}</h1>
      <p>${esc(histoire.presentation)}</p>
      <p class="j-avis cache"></p>
      <div class="rangee" data-depart></div>
      <p><a class="j-lien" href="#/recit/${r.id}">Revenir à la fiche du récit</a></p>
    </div>
    <div class="j-fondu"></div>
  </div>`;
  const q = (s) => el.querySelector(s);
  const racine = q('.jeu');
  const ambiance = new Ambiance();
  const ctrl = new AbortController();
  let rendu = null, moteur = null, lecture = !webgl() || ctx.query.lecture === '1', modePause = false, enJeu = false;

  // ---- Son global, mémorisé
  let son = store.pref('son');
  const btnSon = q('[data-son]');
  function majSon() {
    btnSon.setAttribute('aria-pressed', String(son));
    btnSon.textContent = son ? 'Son activé' : 'Son coupé';
    ambiance.activer(son && enJeu);
  }
  btnSon.addEventListener('click', (e) => { e.stopPropagation(); son = !son; store.definirPref('son', son); majSon(); });

  // ---- Voix : un doublage provisoire (fichier muet) n'est pas joué
  const langue = histoire.langueAudio;
  const urlAudio = (n) => {
    if (!son || histoire.audioProvisoire || !n.audio || !n.audio[langue]) return null;
    return data.url(n.audio[langue]);
  };
  const vitesse = () => (reduit() && store.pref('vitesse') === 1 ? 0 : store.pref('vitesse'));

  const dialogue = creerDialogue(racine, {
    personnages: histoire.personnages,
    vitesse,
    surLettre: () => ambiance.blip(),
    surParole: (who) => rendu?.parler(who),
    urlAudio,
  });

  // ---- Panneau moteur
  const debug = q('.j-debug');
  function majDebug() {
    if (!moteur) return;
    const vars = Object.entries(moteur.vars);
    debug.innerHTML = `<b>nœud courant</b> : ${esc(moteur.noeud)}<br><b>décor</b> : ${esc(moteur.scene)}<br><b>variables</b> :<br>${vars.length ? vars.map(([k, v]) => `&nbsp;&nbsp;${esc(k)} = ${esc(JSON.stringify(v))}`).join('<br>') : '&nbsp;&nbsp;(aucune)'}<br><br><b>nœuds dans l'histoire</b> : ${moteur.nbNoeuds}<br><b>fins</b> : ${store.fins(id).length}/${fins.length}`;
  }
  q('[data-moteur]').addEventListener('click', (e) => {
    e.stopPropagation();
    const cache = debug.classList.toggle('cache');
    e.currentTarget.setAttribute('aria-pressed', String(!cache));
    majDebug();
  });
  const fil = q('.j-fil');
  const majFil = () => { fil.innerHTML = moteur && moteur.parcours.length ? `<span>Parcours :</span>${moteur.parcours.map((p) => `<span>${esc(p)}</span>`).join('')}` : ''; };

  // ---- Ce que le moteur demande à l'écran
  const fondu = q('.j-fondu');
  const ui = {
    async decor(nom) {
      if (!reduit()) { fondu.style.opacity = 1; await pause(460); }
      rendu.charger(nom);
      ambiance.mood = DECORS[nom].mood;
      if (!reduit()) { fondu.style.opacity = 0; await pause(300); }
    },
    etat(m, n) { rendu.cadrer(n.speaker); majFil(); majDebug(); },
    dire: (n, o) => dialogue.dire(n, o),
    explorer: (ids) => explorer(racine, ids, { patrimoine, rendu, surTrouve: (o) => store.ajouterObjet(o) }),
    choisir: (choices) => choisir(racine, choices),
    async miniJeu(nom, n) {
      dialogue.cacher();
      const res = await MINIJEUX[nom](q('.j-mini'), n, { rendu, ambiance, signal: ctrl.signal });
      return res;
    },
    fin(fin, choices) {
      dialogue.cacher();
      const zone = q('.j-fin');
      const trouvees = store.fins(id);
      zone.innerHTML = `<div class="j-fin-carte">
        <p class="sur-titre">Fin découverte</p>
        <h2>${esc((histoire.fins || {})[fin] || fin)}</h2>
        <p class="j-texte-fin">${esc(histoire.nodes[moteur.noeud].text || '')}</p>
        <p><strong>${trouvees.length} fin${trouvees.length > 1 ? 's' : ''} découverte${trouvees.length > 1 ? 's' : ''} sur ${fins.length}</strong></p>
        <div class="rangee">${choices.map((c, i) => `<button type="button" class="j-btn fort" data-c="${i}">${esc(c.label)}</button>`).join('')}
          <button type="button" class="j-btn" data-rejouer>Rejouer depuis le début</button>
          <a class="j-btn" href="#/recit/${r.id}">Revenir à la fiche</a>
          <a class="j-btn" href="#/parcours">Mon parcours</a>
        </div></div>`;
      zone.classList.remove('cache');
      zone.querySelector('button').focus({ preventScroll: true });
      return new Promise((res) => {
        zone.onclick = (e) => {
          const b = e.target.closest('button'); if (!b) return;
          zone.classList.add('cache');
          if ('rejouer' in b.dataset) res({ next: histoire.start, reset: true });
          else res(choices[+b.dataset.c]);
        };
      });
    },
  };

  // ---- Démarrage
  async function preparerRendu() {
    if (lecture) return passerEnLecture();
    try {
      const { Rendu } = await import('../scenes/rendu.js');
      if (ctrl.signal.aborted) return null;
      rendu = new Rendu(q('.j-canvas'), { histoire, reduit: reduit(), patrimoine });
      const n0 = histoire.nodes[histoire.start];
      if (n0.scene) rendu.charger(n0.scene);
      q('.j-canvas').addEventListener('webglcontextlost', () => { /* le navigateur gère la perte ; le dialogue reste utilisable */ });
    } catch (e) {
      console.warn('3D indisponible, mode lecture :', e);
      passerEnLecture();
    }
    return rendu;
  }
  function passerEnLecture() {
    lecture = true;
    q('.j-canvas').classList.add('cache');
    const scene = q('.j-lecture');
    scene.classList.remove('cache');
    rendu = new RenduLecture(scene);
    const n0 = histoire.nodes[histoire.start];
    if (n0.scene) rendu.charger(n0.scene);
    return rendu;
  }
  const pretRendu = preparerRendu();

  async function lancer(avecSon, sauvegarde) {
    if (avecSon !== undefined) { son = avecSon; store.definirPref('son', son); }
    q('.j-titre').classList.add('cache');
    await pretRendu;
    if (ctrl.signal.aborted) return;
    enJeu = true;
    majSon();
    store.marquer(id, 'joue');
    moteur = new Moteur(histoire, ui, {
      sauver: (s) => store.sauvegarder(id, s),
      surFin: (fin) => store.ajouterFin(id, fin),
    });
    try {
      await moteur.jouer(sauvegarde);
    } catch (e) {
      console.warn(e);
      q('.j-boite').classList.remove('cache');
      q('.j-texte').textContent = `L'histoire s'arrête ici à cause d'une erreur : ${e.message}`;
      return;
    }
    if (!ctrl.signal.aborted) location.hash = `#/recit/${id}`;
  }

  const depart = q('[data-depart]');
  const sauvegarde = store.sauvegarde(id);
  const boutons = [];
  if (sauvegarde) boutons.push('<button type="button" class="j-btn fort grand" data-go="reprendre">Reprendre</button>');
  boutons.push(`<button type="button" class="j-btn ${sauvegarde ? '' : 'fort grand'}" data-go="son">${sauvegarde ? 'Recommencer' : '▶ Commencer'} avec le son</button>`);
  boutons.push('<button type="button" class="j-btn" data-go="muet">Sans le son</button>');
  depart.innerHTML = boutons.join('');
  depart.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]'); if (!b) return;
    const g = b.dataset.go;
    if (g === 'reprendre') lancer(undefined, sauvegarde);
    else lancer(g === 'son');
  });
  const avis = q('.j-avis');
  if (!webgl()) { avis.textContent = 'Votre appareil n\'affiche pas la 3D : l\'histoire se joue en mode lecture.'; avis.classList.remove('cache'); }
  else if (reduit() && !lecture) {
    avis.innerHTML = 'Votre système demande moins d\'animations : la parallaxe est coupée. <a class="j-lien" href="#/jouer/' + id + '?lecture=1" data-lecture>Passer en mode lecture</a>';
    avis.classList.remove('cache');
    avis.querySelector('[data-lecture]').addEventListener('click', (e) => { e.preventDefault(); if (rendu) rendu.detruire(); rendu = null; passerEnLecture(); avis.classList.add('cache'); });
  }
  depart.querySelector('button').focus({ preventScroll: true });

  // ---- Menu Pause
  const panneauPause = q('.j-pause');
  function ouvrirPause() {
    if (modePause) return;
    modePause = true;
    const v = store.pref('vitesse');
    panneauPause.innerHTML = `<div class="j-pause-carte">
      <h2>Pause</h2>
      <div class="j-reglage"><span>Son</span><button type="button" class="j-btn" data-p-son aria-pressed="${son}">${son ? 'Activé' : 'Coupé'}</button></div>
      <div class="j-reglage"><span id="j-v">Vitesse du texte</span><div role="group" aria-labelledby="j-v" class="segments">${VITESSES.map(([t, x]) => `<button type="button" data-v="${x}" aria-pressed="${v === x}">${t}</button>`).join('')}</div></div>
      <div class="j-reglage"><span>Voix en ${esc(langues[langue] || langue)}</span><span class="meta-clair">${histoire.audioProvisoire ? 'audio à venir' : 'disponible'}</span></div>
      <div class="rangee">
        <button type="button" class="j-btn fort" data-p-reprendre>Reprendre</button>
        <button type="button" class="j-btn" data-p-recommencer>Recommencer</button>
        <a class="j-btn" href="#/recit/${r.id}">Quitter</a>
      </div></div>`;
    panneauPause.classList.remove('cache');
    panneauPause.querySelector('[data-p-reprendre]').focus();
  }
  const fermerPause = () => { modePause = false; panneauPause.classList.add('cache'); };
  q('[data-pause]').addEventListener('click', (e) => { e.stopPropagation(); ouvrirPause(); });
  panneauPause.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if ('pSon' in b.dataset) { son = !son; store.definirPref('son', son); majSon(); b.textContent = son ? 'Activé' : 'Coupé'; b.setAttribute('aria-pressed', String(son)); }
    if (b.dataset.v !== undefined) { store.definirPref('vitesse', +b.dataset.v); panneauPause.querySelectorAll('[data-v]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }
    if ('pReprendre' in b.dataset) fermerPause();
    if ('pRecommencer' in b.dataset) {
      store.sauvegarder(id, null);
      location.reload();
    }
  });

  // ---- Entrées : clic, Espace, Entrée
  q('.j-boite').addEventListener('click', () => dialogue.avancer());
  q('.j-canvas').addEventListener('click', () => dialogue.avancer());
  q('.j-lecture').addEventListener('click', () => dialogue.avancer());
  q('.j-info button').addEventListener('click', (e) => { e.stopPropagation(); q('.j-info').classList.add('cache'); });
  function surTouche(e) {
    if (e.key === 'Escape') {
      if (!q('.j-info').classList.contains('cache')) { q('.j-info').classList.add('cache'); return; }
      if (modePause) fermerPause(); else if (enJeu) ouvrirPause();
      return;
    }
    if (e.code !== 'Space' && e.code !== 'Enter') return;
    if (e.target.closest && e.target.closest('button, a, input, select, summary')) return;
    if (modePause || !enJeu || q('.j-mini').classList.contains('tape')) return;
    e.preventDefault();
    if (!e.repeat) dialogue.avancer();
  }
  addEventListener('keydown', surTouche);

  return {
    demonter() {
      ctrl.abort();
      removeEventListener('keydown', surTouche);
      if (moteur) moteur.arreter();
      dialogue.stop();
      ambiance.detruire();
      if (rendu) rendu.detruire();
    },
  };
}
