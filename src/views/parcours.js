/* « Mon parcours » : ce que le visiteur a lu, écouté, joué et trouvé, avec quelques badges. */
import * as data from '../data.js';
import { finsDe } from '../engine/moteur.js';
import { store } from '../store.js';
import { definirPage, esc } from '../ui.js';

export async function monter(el) {
  const [recits, patrimoine] = await Promise.all([data.recits(), data.patrimoine()]);
  const jouables = recits.filter((r) => r.jouable);
  const histoires = await Promise.all(jouables.map((r) => data.histoire(r.jouable)));
  definirPage({ titre: 'Mon parcours', description: 'Récits lus, écoutés et joués, fins découvertes et objets trouvés.' });

  function rendre() {
    const c = store.compteurs();
    const totalFins = histoires.reduce((n, h) => n + finsDe(h).length, 0);
    const BADGES = [
      { nom: 'Griot apprenti', detail: '3 récits terminés', ok: c.termines >= 3 },
      { nom: 'Griot confirmé', detail: '10 récits terminés', ok: c.termines >= 10 },
      { nom: 'Oreille attentive', detail: '3 récits écoutés', ok: c.ecoutes >= 3 },
      { nom: 'Explorateur du terroir', detail: `${patrimoine.length} objets trouvés`, ok: c.objets >= patrimoine.length },
      { nom: 'Toutes les fins', detail: `${totalFins} fins découvertes`, ok: c.fins >= totalFins },
    ];
    el.innerHTML = `<div class="page">
      <h1>Mon parcours</h1>
      <p class="chapeau">Votre progression reste sur cet appareil. Aucun compte n'est nécessaire.</p>
      <div class="chiffres chiffres-clair">
        <div><b>${c.lus}</b><span>récits lus</span></div>
        <div><b>${c.ecoutes}</b><span>écoutés</span></div>
        <div><b>${c.joues}</b><span>joués</span></div>
        <div><b>${c.fins}/${totalFins}</b><span>fins découvertes</span></div>
        <div><b>${c.objets}/${patrimoine.length}</b><span>objets trouvés</span></div>
      </div>
      <h2>Badges</h2>
      <ul class="badges">${BADGES.map((b) => `<li class="${b.ok ? 'gagne' : ''}"><strong>${b.ok ? '★' : '☆'} ${esc(b.nom)}</strong><small>${esc(b.detail)}${b.ok ? '' : ' (pas encore)'}</small></li>`).join('')}</ul>
      <h2>Histoires à vivre</h2>
      <ul class="liste-recits liste-large">${jouables.map((r, i) => {
        const f = store.fins(r.id), total = finsDe(histoires[i]).length;
        return `<li><a href="#/jouer/${r.id}"><span class="puce-jouable" aria-hidden="true">▶</span><span><b>${esc(r.titre)}</b><small>${f.length}/${total} fins découvertes${store.sauvegarde(r.id) ? ' · partie en cours' : ''}</small></span></a></li>`;
      }).join('')}</ul>
      <h2>Tout effacer</h2>
      <p>Cette action efface vos récits, vos fins et vos sauvegardes.</p>
      <button type="button" class="bouton" data-effacer>Réinitialiser ma progression</button>
    </div>`;
    el.querySelector('[data-effacer]').addEventListener('click', (e) => {
      if (e.currentTarget.dataset.sur) { store.reinitialiser(); rendre(); return; }
      e.currentTarget.dataset.sur = '1';
      e.currentTarget.textContent = 'Confirmer : tout effacer';
    });
  }
  rendre();
}
