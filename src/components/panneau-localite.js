/* Le panneau latéral d'une localité : peuples, langues, récits liés et patrimoine. */
import { store } from '../store.js';
import { esc, TYPES } from '../ui.js';

export function panneauLocalite(l, { region, recits, patrimoine, langues }) {
  const rs = l.recits.map((id) => recits.find((r) => r.id === id));
  const pats = l.patrimoine.map((id) => patrimoine.find((p) => p.id === id));
  return `<a class="retour" href="#/carte?region=${l.region}">← ${esc(region.nom)}</a>
    <p class="sur-titre">Localité</p>
    <h2>${esc(l.nom)}</h2>
    ${l.approx ? '<p class="meta">Emplacement indicatif : ce point désigne une aire culturelle ou un lieu approché.</p>' : ''}
    <dl class="fiche-infos">
      <div><dt>Région</dt><dd>${esc(region.nom)} <span class="meta">(ex-${esc(region.ancien)})</span></dd></div>
      <div><dt>Peuples</dt><dd>${esc(l.peuples.join(', '))}</dd></div>
      <div><dt>Langues</dt><dd>${esc(l.langues.map((c) => langues[c]).join(', '))}</dd></div>
    </dl>
    <h3>Récits</h3>
    <ul class="liste-recits">${rs.map((r) => `<li><a href="#/recit/${r.id}">
        <span class="puce type-${r.type}" aria-hidden="true"></span>
        <span><b>${esc(r.titre)}</b><small>${TYPES[r.type].nom}${r.jouable ? ' · jouable' : ''}${store.estTermine(r.id) ? ' · terminé ✓' : ''}</small></span>
      </a></li>`).join('')}</ul>
    <h3>Patrimoine</h3>
    <ul class="liste-tags">${pats.map((p) => `<li><a href="#/patrimoine/${p.id}">${esc(p.titre)}</a></li>`).join('')}</ul>`;
}
