/* Une fiche patrimoine n'existe qu'une fois : la galerie, la carte et le jeu affichent la même. */
import { motifs, url } from '../data.js';
import { optionsMotif } from '../motifs.js';
import { esc, webgl } from '../ui.js';

export const CATEGORIES = { objet: 'Objets', masque: 'Masques', habit: 'Habits', instrument: 'Instruments', outil: 'Outils', met: 'Mets', habitat: 'Habitat' };

export const vignette = (p) => url(`modeles/vignettes/${p.id}.webp`);
export const modele = (p) => url(`modeles/patrimoine/${p.id}.glb`);

export const ficheHtml = (p) => `<figure class="objet-3d" data-modele="${esc(p.id)}">
    <img src="${vignette(p)}" width="384" height="384" alt="Modèle 3D : ${esc(p.titre)}" loading="lazy">
  </figure>
  <h2>${esc(p.titre)}</h2>
  ${p.peuples?.length ? `<p class="meta">${esc(p.peuples.join(', '))}</p>` : ''}
  <p>${esc(p.texte)}</p>
  ${p.details?.length ? `<h3>À regarder</h3><ul class="details-objet">${p.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
  ${p.fidelite ? `<p class="meta"><strong>Fidélité du modèle :</strong> ${esc(p.fidelite)}</p>` : ''}
  ${p.sources?.length ? `<h3>Sources</h3><ul class="sources">${p.sources.map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noreferrer">${esc(s.titre)}</a>` : esc(s.titre)}</li>`).join('')}</ul>` : ''}`;

// Un même objet peut porter des motifs différents selon l'image ou le peuple.
function choixMotif(fig, options, vue) {
  const bloc = document.createElement('div');
  bloc.className = 'objet-motif';
  bloc.innerHTML = `<label>Motif : <select><option value="">Modèle d'origine</option>${options.map((o) => `<option value="${esc(o.id)}">${esc(o.nom)}${o.demo ? ' (démonstration)' : ''}</option>`).join('')}</select></label>
    <p class="meta" hidden>Composition de démonstration : formes, place et couleurs à remplacer par un motif relevé auprès de ce peuple.</p>`;
  fig.append(bloc);
  const note = bloc.querySelector('p');
  bloc.querySelector('select').addEventListener('change', (e) => {
    const o = options.find((x) => x.id === e.target.value) || null;
    note.hidden = !o?.demo;
    vue.habiller(o).catch((err) => console.warn(err));
  });
}

// Remplace les vignettes d'une zone par la vue 3D, sur demande : un contexte WebGL par objet ouvert.
export function activerVues3d(racine, patrimoine) {
  const fermer = [];
  racine.querySelectorAll('.objet-3d').forEach((fig) => {
    if (!webgl()) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bouton objet-3d-btn';
    b.textContent = 'Tourner en 3D';
    fig.append(b);
    b.addEventListener('click', async (e) => {
      e.stopPropagation();
      b.disabled = true;
      b.textContent = 'Chargement…';
      try {
        const { creerVisionneuse } = await import('../scenes3d/visionneuse.js');
        const p = patrimoine.find((x) => x.id === fig.dataset.modele);
        const v = await creerVisionneuse(fig, modele(p), p.titre);
        fermer.push(v.detruire);
        b.remove();
        const options = optionsMotif(p.id, await motifs(), { commun: p.peuples.includes('Plusieurs peuples') });
        if (options.length) choixMotif(fig, options, v);
      } catch (err) {
        console.warn(err);
        b.textContent = 'Vue 3D indisponible';
      }
    });
  });
  return () => fermer.forEach((f) => f());
}
