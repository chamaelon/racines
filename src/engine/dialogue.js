/*
 * La boîte de dialogue : effet machine à écrire, avancer au clic, à l'Espace ou à l'Entrée.
 * Une réplique peut être doublée en langue nationale : le texte français sert alors de sous-titre.
 */
import { dessinerPortrait } from '../scenes/personnages.js';

const pause = (ms) => new Promise((r) => setTimeout(r, ms));
const DELAI_LETTRE = 24;

export function creerDialogue(racine, { personnages, vitesse, surLettre, surParole, urlAudio }) {
  const box = racine.querySelector('.j-boite');
  const nom = box.querySelector('.j-nom');
  const portrait = box.querySelector('.j-portrait');
  const texte = box.querySelector('.j-texte');
  const suite = box.querySelector('.j-suite');
  // Une seule annonce par réplique : le lecteur d'écran n'a pas à suivre la machine à écrire.
  const annonce = racine.querySelector('.j-annonce');
  let tape = false, passer = null, avancerRes = null, voix = null;

  const stopVoix = () => { if (voix) { voix.pause(); voix = null; } };

  async function dire(n, { tenir }) {
    box.classList.remove('cache');
    box.querySelector('.j-choix').innerHTML = '';
    suite.style.visibility = 'hidden';
    const p = personnages[n.speaker];
    nom.textContent = p.nom;
    nom.style.background = p.couleur;
    annonce.textContent = `${p.nom} : ${n.text}`;
    const g = portrait.getContext('2d'); g.clearRect(0, 0, portrait.width, portrait.height);
    dessinerPortrait(portrait, p.style);
    surParole(n.speaker);
    stopVoix();
    const src = urlAudio(n);
    if (src) { voix = new Audio(src); voix.play().catch(() => { voix = null; }); }
    tape = true;
    let saut = false;
    passer = () => { saut = true; };
    const v = vitesse();
    if (v > 0) {
      for (let i = 1; i <= n.text.length && !saut; i++) {
        texte.textContent = n.text.slice(0, i);
        if (i % 3 === 0) surLettre();
        await pause(DELAI_LETTRE / v);
      }
    }
    texte.textContent = n.text;
    tape = false; passer = null;
    surParole(null);
    if (tenir) return;
    suite.style.visibility = 'visible';
    await new Promise((res) => { avancerRes = () => { avancerRes = null; stopVoix(); res(); }; });
  }

  return {
    dire,
    // Un premier appui finit la phrase, un second passe à la suite.
    avancer() { if (tape && passer) passer(); else if (avancerRes) avancerRes(); },
    cacher() { box.classList.add('cache'); },
    stop() { stopVoix(); },
    get attend() { return tape || !!avancerRes; },
  };
}
