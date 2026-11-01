/* Une fiche patrimoine n'existe qu'une fois : la galerie, la carte et le jeu affichent la même. */
import { dessiner } from '../scenes/dessins.js';
import { esc } from '../ui.js';

export const CATEGORIES = { objet: 'Objets', habit: 'Habits', instrument: 'Instruments', met: 'Mets', habitat: 'Habitat' };

export const ficheHtml = (p) => `<canvas class="dessin-patrimoine" width="256" height="256" data-dessin="${p.dessin}" role="img" aria-label="Dessin : ${esc(p.titre)}"></canvas>
  <h2>${esc(p.titre)}</h2>
  <p>${esc(p.texte)}</p>`;

export function peindreDessins(racine) {
  racine.querySelectorAll('canvas[data-dessin]').forEach((c) => {
    if (c.dataset.peint) return;
    dessiner(c, c.dataset.dessin);
    c.dataset.peint = '1';
  });
}
