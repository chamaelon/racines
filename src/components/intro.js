/* Le griot ouvre la veillée : trois phrases, puis l'écran se ferme et ne revient plus. */
import { url } from '../data.js';
import { store } from '../store.js';

const PHRASES = [
  'Approche, le feu est allumé. Ici, chaque région du Burkina Faso garde ses récits.',
  'Touche la carte, choisis un lieu, puis lis, écoute ou vis son histoire.',
  'Ce que tu auras entendu, à toi de le raconter à ton tour.',
];

export function ouvrirVeillee() {
  const voile = document.createElement('div');
  voile.className = 'veillee';
  voile.setAttribute('role', 'dialog');
  voile.setAttribute('aria-modal', 'true');
  voile.setAttribute('aria-label', 'Le griot ouvre la veillée');
  voile.innerHTML = `<div class="veillee-carte">
    <img src="${url('modeles/portraits/griot.webp')}" width="192" height="192" alt="">
    <div>
      <p class="sur-titre">Le griot</p>
      <p class="veillee-texte" aria-live="polite"></p>
      <div class="rangee"><button type="button" class="bouton fort" data-suite>Continuer</button><button type="button" class="bouton discret" data-passer>Passer</button></div>
    </div>
  </div>`;
  document.body.append(voile);
  const texte = voile.querySelector('.veillee-texte');
  const suite = voile.querySelector('[data-suite]');
  let i = 0;
  const fermer = () => { store.definirPref('intro', true); voile.remove(); document.getElementById('app').focus(); };
  const afficher = () => { texte.textContent = PHRASES[i]; suite.textContent = i === PHRASES.length - 1 ? 'Entrer dans la veillée' : 'Continuer'; };
  suite.addEventListener('click', () => { i++; if (i >= PHRASES.length) fermer(); else afficher(); });
  voile.querySelector('[data-passer]').addEventListener('click', fermer);
  voile.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });
  afficher();
  suite.focus();
}
