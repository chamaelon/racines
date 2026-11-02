/* La galerie du patrimoine et ses fiches : modèle 3D, détails, sources, peuples, régions et récits liés. */
import { activerVues3d, CATEGORIES, ficheHtml, vignette } from '../components/fiche-patrimoine.js';
import * as data from '../data.js';
import { definirPage, esc } from '../ui.js';

export async function monter(el, ctx) {
  const [patrimoine, regions, recits, localites] = await Promise.all([data.patrimoine(), data.regions(), data.recits(), data.localites()]);
  let categorie = '', peuple = '', fermerVue = () => {};
  const peuples = [...new Set(patrimoine.flatMap((p) => p.peuples))].filter((x) => x !== 'Plusieurs peuples').sort((a, b) => a.localeCompare(b));

  function galerie() {
    definirPage({ titre: 'Patrimoine', description: 'Objets, masques, habits, outils, instruments et habitat du Burkina Faso, en 3D et expliqués.' });
    const liste = patrimoine.filter((p) => (!categorie || p.categorie === categorie) && (!peuple || p.peuples.includes(peuple)));
    el.innerHTML = `<div class="page">
      <h1>Patrimoine</h1>
      <p class="chapeau">Les objets qu'on croise dans les récits, à faire tourner en 3D. Ce sont les mêmes fiches que dans le jeu. Chaque modèle est une interprétation, et sa fiche dit jusqu'où il est fidèle.</p>
      <label class="filtre-peuple">Peuple :
        <select data-peuple><option value="">Tous</option>${peuples.map((x) => `<option value="${esc(x)}" ${x === peuple ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>
      </label>
      <div role="group" aria-label="Filtrer par catégorie" class="segments segments-clair">
        <button type="button" data-cat="" aria-pressed="${!categorie}">Tout</button>
        ${Object.entries(CATEGORIES).map(([k, t]) => `<button type="button" data-cat="${k}" aria-pressed="${categorie === k}">${t}</button>`).join('')}
      </div>
      <ul class="grille-patrimoine">${liste.map((p) => `<li><a href="#/patrimoine/${p.id}"><img src="${vignette(p)}" width="384" height="384" alt="" loading="lazy"><h2>${esc(p.titre)}</h2><p class="meta">${CATEGORIES[p.categorie]} · ${esc(p.peuples.join(', '))}</p></a></li>`).join('')}</ul>
      ${liste.length ? '' : '<p>Aucun objet ne correspond à ces deux filtres.</p>'}
    </div>`;
    el.querySelector('[data-peuple]').addEventListener('change', (e) => { peuple = e.target.value; galerie(); el.querySelector('[data-peuple]').focus(); });
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
    fermerVue();
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
    fermerVue = activerVues3d(el, patrimoine);
  }

  function afficher({ params }) {
    scrollTo(0, 0);
    fermerVue();
    fermerVue = () => {};
    if (params[0]) {
      const p = patrimoine.find((x) => x.id === params[0]);
      if (p) { fiche(p); return; }
    }
    galerie();
  }
  afficher(ctx);
  return { maj: afficher, demonter() { fermerVue(); } };
}
