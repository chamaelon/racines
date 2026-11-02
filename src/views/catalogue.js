/* Le catalogue : une grille de récits, des filtres combinables et une recherche, conservés dans l'URL. */
import { carteRecit } from '../components/carte-recit.js';
import { filtrer, versQuery } from '../components/filtres.js';
import * as data from '../data.js';
import { definirPage, esc, TYPES } from '../ui.js';

export async function monter(el, ctx) {
  const [recits, localites, regions, langues] = await Promise.all([data.recits(), data.localites(), data.regions(), data.langues()]);
  definirPage({ titre: 'Catalogue des récits', description: `${recits.length} contes, légendes et récits historiques du Burkina Faso, à filtrer par région, peuple et langue.` });
  const localitesParId = Object.fromEntries(localites.map((l) => [l.id, l]));
  const nomRegion = Object.fromEntries(regions.map((r) => [r.id, r.nom]));
  const peuples = [...new Set(recits.map((r) => r.peuple))].sort((a, b) => a.localeCompare(b));
  const codes = [...new Set(recits.flatMap((r) => [...r.langues, ...Object.keys(r.audio)]))].sort((a, b) => langues[a].localeCompare(langues[b]));
  const regionsAvec = regions.filter((g) => localites.some((l) => l.region === g.id)).sort((a, b) => a.nom.localeCompare(b.nom));
  const options = (l) => l.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join('');

  el.innerHTML = `<div class="page">
    <h1>Catalogue des récits</h1>
    <form class="filtres" role="search" aria-label="Filtrer les récits">
      <label class="champ champ-large">Recherche<input type="search" name="q" placeholder="Un titre, un mot, un peuple…"></label>
      <label class="champ">Type<select name="type"><option value="">Tous</option>${options(Object.entries(TYPES).map(([k, t]) => [k, t.nom]))}</select></label>
      <label class="champ">Région<select name="region"><option value="">Toutes</option>${options(regionsAvec.map((g) => [g.id, g.nom]))}</select></label>
      <label class="champ">Peuple<select name="peuple"><option value="">Tous</option>${options(peuples.map((p) => [p, p]))}</select></label>
      <label class="champ">Langue<select name="langue"><option value="">Toutes</option>${options(codes.map((c) => [c, langues[c]]))}</select></label>
      <label class="case"><input type="checkbox" name="audio">Avec audio</label>
      <button type="reset" class="bouton discret">Tout effacer</button>
    </form>
    <p class="resultat" role="status"></p>
    <ul class="grille-recits"></ul>
  </div>`;
  const form = el.querySelector('form');
  const grille = el.querySelector('.grille-recits');
  const resultat = el.querySelector('.resultat');

  const lire = () => ({
    q: form.q.value.trim(), type: form.type.value, region: form.region.value, peuple: form.peuple.value, langue: form.langue.value,
    audio: form.audio.checked,
  });
  function remplir(q) {
    form.q.value = q.q || ''; form.type.value = q.type || ''; form.region.value = q.region || '';
    form.peuple.value = q.peuple || ''; form.langue.value = q.langue || '';
    form.audio.checked = !!q.audio;
  }
  function rendre() {
    const f = lire();
    const liste = filtrer(recits, f, { localitesParId });
    resultat.textContent = `${liste.length} récit${liste.length > 1 ? 's' : ''}`;
    grille.innerHTML = liste.map((r) => carteRecit(r, { regionNom: nomRegion[localitesParId[r.localites[0]].region], langues })).join('')
      || '<li class="vide">Aucun récit ne correspond à ces filtres.</li>';
  }
  function surChange() {
    rendre();
    const q = versQuery(lire());
    history.replaceState(null, '', `#/catalogue${q ? `?${q}` : ''}`);
  }
  form.addEventListener('input', surChange);
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('reset', () => setTimeout(surChange));
  remplir(ctx.query);
  rendre();
  return { maj({ query }) { remplir(query); rendre(); } };
}
