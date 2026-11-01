import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/800.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/vues.css';
import { demarrerRouteur, lireHash } from './router.js';
import { store } from './store.js';

document.querySelector('[data-evitement]').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('app').focus();
});

demarrerRouteur(document.getElementById('app'));

// Au premier lancement, le griot ouvre la veillée. Pas sur un lien direct vers un récit.
if (!store.pref('intro') && lireHash().chemin === '/carte') {
  import('./components/intro.js').then((m) => m.ouvrirVeillee());
}
