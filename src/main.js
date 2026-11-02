import '@fontsource/cinzel/600.css';
import '@fontsource/cinzel/800.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/vues.css';
import { activerLangue, languesDisponibles } from './i18n.js';
import { demarrerRouteur, lireHash } from './router.js';
import { store } from './store.js';

document.querySelector('[data-evitement]').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('app').focus();
});

// Une langue existe dès que son fichier translate-<langue>.json est déposé dans public/traductions.
languesDisponibles().then((liste) => {
  const langue = store.pref('langueTexte');
  activerLangue(liste.some((l) => l.code === langue) ? langue : 'fr');
  if (!liste.length) return;
  const choix = document.querySelector('[data-langue-site]');
  choix.innerHTML = [{ code: 'fr', nom: 'français' }, ...liste].map((l) => `<option value="${l.code}">${l.nom}</option>`).join('');
  choix.value = liste.some((l) => l.code === langue) ? langue : 'fr';
  choix.closest('label').hidden = false;
  choix.addEventListener('change', () => { store.definirPref('langueTexte', choix.value); activerLangue(choix.value); });
});

demarrerRouteur(document.getElementById('app'));

// Au premier lancement, le griot ouvre la veillée. Pas sur un lien direct vers un récit.
if (!store.pref('intro') && lireHash().chemin === '/carte') {
  import('./components/intro.js').then((m) => m.ouvrirVeillee());
}
