/* La galerie du patrimoine et ses fiches : dessin, description, régions et récits liés. */
import { CATEGORIES, ficheHtml, peindreDessins } from '../components/fiche-patrimoine.js';
import * as data from '../data.js';
import { definirPage, esc } from '../ui.js';

export async function monter(el, ctx) {
  const [patrimoine, regions, recits, localites] = await Promise.all([data.patrimoine(), data.regions(), data.recits(), data.localites()]);
  let categorie = '';

  function galerie() {
    definirPage({ titre: 'Patrimoine', description: 'Objets, habits, instruments, mets et habitat du Burkina Faso, dessinés et expliqués.' });
    const liste = patrimoine.filter((p) => !categorie || p.categorie === categorie);
    el.innerHTML = `<div class="page">
      <h1>Patrimoine</h1>
      <p class="chapeau">Les objets qu'on croise dans les récits. Ce sont les mêmes fiches que dans le jeu.</p>
      <div role="group" aria-label="Filtrer par catégorie" class="segments segments-clair">
        <button type="button" data-cat="" aria-pressed="${!categorie}">Tout</button>
        ${Object.entries(CATEGORIES).map(([k, t]) => `<button type="button" data-cat="${k}" aria-pressed="${categorie === k}">${t}</button>`).join('')}
      </div>
      <ul class="grille-patrimoine">${liste.map((p) => `<li><a href="#/patrimoine/${p.id}"><canvas width="256" height="256" data-dessin="${p.dessin}" aria-hidden="true"></canvas><h2>${esc(p.titre)}</h2><p class="meta">${CATEGORIES[p.categorie]}</p></a></li>`).join('')}</ul>
    </div>`;
    peindreDessins(el);
    el.querySelector('.segments').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      categorie = b.dataset.cat;
      galerie();
      el.querySelector(`[data-cat="${categorie}"]`).focus();
    });
  }

  function fiche(p) {
    definirPage({ titre: p.titre, description: p.texte });
    const nomsRegions = p.regions.map((g) => regions.find((x) => x.id === g));
    const lieux = localites.filter((l) => l.patrimoine.includes(p.id));
    const rs = p.recits.map((id) => recits.find((r) => r.id === id));
    el.innerHTML = `<article class="page fiche-patrimoine">
      <p class="fil"><a href="#/patrimoine">Patrimoine</a> › <span>${CATEGORIES[p.categorie]}</span></p>
      <div class="fiche-p-corps">${ficheHtml(p).replace('<h2>', '<div><h1>').replace('</h2>', '</h1>')}
        ${p.statut === 'a_valider' ? '<p class="meta">Texte provisoire, à valider.</p>' : ''}
        <h2>Régions</h2><ul class="liste-tags">${nomsRegions.map((g) => `<li><a href="#/carte?region=${g.id}">${esc(g.nom)}</a></li>`).join('')}</ul>
        ${lieux.length ? `<h2>Localités</h2><ul class="liste-tags">${lieux.map((l) => `<li><a href="#/carte/${l.id}">${esc(l.nom)}</a></li>`).join('')}</ul>` : ''}
        <h2>Récits</h2><ul class="liste-tags">${rs.map((r) => `<li><a href="#/recit/${r.id}">${esc(r.titre)}</a></li>`).join('')}</ul>
        </div>
      </div>
    </article>`;
    peindreDessins(el);
  }

  function afficher({ params }) {
    scrollTo(0, 0);
    if (params[0]) {
      const p = patrimoine.find((x) => x.id === params[0]);
      if (p) { fiche(p); return; }
    }
    galerie();
  }
  afficher(ctx);
  return { maj: afficher };
}
