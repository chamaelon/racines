/* La fiche d'une histoire : deux façons de la découvrir, le jeu et le film, puis la morale, le lexique et les sources. */
import { carteRecit } from '../components/carte-recit.js';
import { chargerCarte, creerSvg } from '../components/carte-svg.js';
import * as data from '../data.js';
import { formaterTemps } from '../engine/film.js';
import { bandeauProvisoire, definirPage, esc, TYPES } from '../ui.js';

async function rendre(el, id) {
  const [recits, localites, regions, patrimoine, langues, films] = await Promise.all([data.recits(), data.localites(), data.regions(), data.patrimoine(), data.langues(), data.films()]);
  const r = recits.find((x) => x.id === id);
  if (!r) {
    definirPage({ titre: 'Récit introuvable' });
    el.innerHTML = '<div class="page texte"><h1>Récit introuvable</h1><p>Ce récit n\'existe pas, ou pas encore.</p><p><a class="bouton" href="#/catalogue">Voir le catalogue</a></p></div>';
    return () => {};
  }
  definirPage({ titre: r.titre, description: r.resume });
  const lieux = r.localites.map((l) => localites.find((x) => x.id === l));
  const region = regions.find((g) => g.id === lieux[0].region);
  const nomRegion = Object.fromEntries(regions.map((g) => [g.id, g.nom]));
  const locParId = Object.fromEntries(localites.map((l) => [l.id, l]));
  const pats = (r.patrimoine || []).map((p) => patrimoine.find((x) => x.id === p));
  const voisins = recits
    .filter((x) => x.id !== r.id)
    .map((x) => ({ x, score: (locParId[x.localites[0]].region === region.id ? 2 : 0) + (x.type === r.type ? 1 : 0) }))
    .filter((v) => v.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((v) => v.x);
  const film = films[r.film];

  el.innerHTML = `<article class="page fiche-recit">
    <p class="fil"><a href="#/catalogue">Catalogue</a> › <span>${esc(TYPES[r.type].nom)}</span></p>
    <header class="fiche-entete">
      <div>
        <p class="etiquettes"><span class="etiquette type-${r.type}">${esc(r.genre || TYPES[r.type].nom)}</span></p>
        <h1>${esc(r.titre)}</h1>
        <p class="chapeau">${esc(r.resume)}</p>
        <dl class="fiche-infos">
          <div><dt>Lieu</dt><dd>${lieux.map((l) => `<a href="#/carte/${l.id}">${esc(l.nom)}</a>`).join(', ')}, région ${esc(region.nom)}</dd></div>
          <div><dt>Peuple</dt><dd>${esc(r.peuple)}</dd></div>
          ${film ? `<div><dt>Durée du film</dt><dd>${formaterTemps(film.duree)}</dd></div>` : ''}
        </dl>
        <div class="fiche-options">
          <a class="bouton fort grand" href="#/jouer/${r.id}">▶ Jouer l'histoire</a>
          ${film ? `<a class="bouton fort grand" href="#/film/${r.film}">▶ Voir le film</a>` : ''}
        </div>
        ${r.statut === 'a_valider' ? bandeauProvisoire() : ''}
      </div>
      <div class="mini-carte" role="img" aria-label="Situation de ${esc(lieux[0].nom)} sur la carte du Burkina Faso"></div>
    </header>

    <div class="fiche-infos-bas">
      <aside class="fiche-cote">
        <section class="encart"><h2>Morale</h2><p>${esc(r.morale)}</p></section>
        ${r.personnages?.length ? `<section class="encart"><h2>Personnages</h2><p>${esc(r.personnages.join(', '))}</p></section>` : ''}
        <section class="encart"><h2>Petit lexique</h2><dl class="lexique">${r.lexique.map((x) => `<div><dt lang="${x.langue === 'fr' ? 'fr' : x.langue}">${esc(x.mot)}${x.langue !== 'fr' ? ` <small>${esc(langues[x.langue])}</small>` : ''}</dt><dd>${esc(x.sens)}</dd></div>`).join('')}</dl></section>
        ${pats.length ? `<section class="encart"><h2>Patrimoine lié</h2><ul class="liste-tags">${pats.map((p) => `<li><a href="#/patrimoine/${p.id}">${esc(p.titre)}</a></li>`).join('')}</ul></section>` : ''}
        <section class="encart"><h2>Sources</h2><ul class="sources">${r.sources.map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(s.titre)}</a>` : esc(s.titre)}</li>`).join('')}</ul></section>
      </aside>
    </div>

    ${voisins.length ? `<section class="voisins"><h2>À découvrir aussi</h2><ul class="grille-recits">${voisins.map((x) => carteRecit(x, { regionNom: nomRegion[locParId[x.localites[0]].region], langues })).join('')}</ul></section>` : ''}
  </article>`;

  chargerCarte().then(({ svg, projeter }) => {
    const zone = el.querySelector('.mini-carte');
    if (!zone) return;
    svg.removeAttribute('role');
    svg.querySelector(`.regions path[data-region="${region.id}"]`).classList.add('choisie');
    lieux.forEach((l) => { const [x, y] = projeter(l.coords); svg.append(creerSvg('circle', { cx: x, cy: y, r: 16, class: 'point-mini' })); });
    svg.setAttribute('aria-hidden', 'true');
    zone.append(svg);
  });

  return () => {};
}

export async function monter(el, ctx) {
  let fermer = await rendre(el, ctx.params[0]);
  return {
    async maj({ params }) { fermer(); scrollTo(0, 0); fermer = await rendre(el, params[0]); },
    demonter() { fermer(); },
  };
}
