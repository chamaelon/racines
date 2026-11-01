/*
 * Routeur par hash : fonctionne sur GitHub Pages sans configuration.
 * Chaque vue exporte monter(el, ctx) et rend { maj(ctx), demonter() }.
 * Tant qu'on reste sur la même vue, on appelle maj() au lieu de tout reconstruire.
 */
import { esc } from './ui.js';

const ROUTES = [
  { re: /^\/carte(?:\/([^/]+))?$/, vue: 'carte', charge: () => import('./views/carte.js') },
  { re: /^\/catalogue$/, vue: 'catalogue', charge: () => import('./views/catalogue.js') },
  { re: /^\/recit\/([^/]+)$/, vue: 'recit', nav: 'catalogue', charge: () => import('./views/recit.js') },
  { re: /^\/jouer\/([^/]+)$/, vue: 'jeu', charge: () => import('./views/jeu.js') },
  { re: /^\/patrimoine(?:\/([^/]+))?$/, vue: 'patrimoine', charge: () => import('./views/patrimoine.js') },
  { re: /^\/parcours$/, vue: 'parcours', charge: () => import('./views/parcours.js') },
  { re: /^\/apropos$/, vue: 'apropos', charge: () => import('./views/apropos.js') },
];

export function lireHash() {
  const brut = decodeURI(location.hash.replace(/^#/, '')) || '/carte';
  const [chemin, q = ''] = brut.split('?');
  return { chemin, query: Object.fromEntries(new URLSearchParams(q)) };
}

export function demarrerRouteur(app) {
  let courante = null, instance = null, jeton = 0;

  function marquerNav(nom) {
    document.querySelectorAll('.entete nav a').forEach((a) => {
      if (a.dataset.vue === nom) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function erreur(titre, detail) {
    app.innerHTML = `<div class="page texte"><h1>${esc(titre)}</h1><p>${esc(detail)}</p><p><a class="bouton" href="#/carte">Revenir à la carte</a></p></div>`;
  }

  async function aller() {
    const { chemin, query } = lireHash();
    const route = ROUTES.find((r) => r.re.test(chemin));
    const moi = ++jeton;
    if (!route) {
      if (instance) { instance.demonter?.(); instance = null; }
      courante = null;
      document.body.classList.remove('plein-ecran');
      marquerNav(null);
      erreur('Page introuvable', 'Cette adresse ne correspond à aucune page de Racines.');
      return;
    }
    const params = route.re.exec(chemin).slice(1);
    const ctx = { params, query };
    marquerNav(route.nav || route.vue);
    if (courante === route.vue && instance?.maj) { instance.maj(ctx); return; }
    if (instance) { instance.demonter?.(); instance = null; }
    courante = route.vue;
    document.body.classList.toggle('plein-ecran', route.vue === 'jeu');
    app.innerHTML = '<p class="chargement" role="status">Chargement…</p>';
    scrollTo(0, 0);
    try {
      const m = await route.charge();
      if (moi !== jeton) return;
      app.innerHTML = '';
      const inst = await m.monter(app, ctx);
      if (moi !== jeton) { inst?.demonter?.(); return; }
      instance = inst;
    } catch (e) {
      if (moi !== jeton) return;
      console.warn(e);
      erreur('Un fichier manque', `${e.message}. Vérifiez votre connexion, puis rechargez la page.`);
    }
  }

  addEventListener('hashchange', aller);
  aller();
}
