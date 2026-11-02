/*
 * La barre de temps : une frise horizontale qui défile, avec un curseur. Le curseur choisit un cran (une année,
 * une période ou une époque sans date). Le clavier passe par le curseur ; un cran se touche aussi directement.
 */
import { esc } from '../ui.js';

const MARGE_BORD = 48;

export function creerFrise(conteneur, liste, { epoques, surCran, surEpoque = null, surToutes = null }) {
  const nomEpoque = (id) => epoques.find((e) => e.id === id).nom;
  const bandes = [];
  liste.forEach((c) => {
    const b = bandes[bandes.length - 1];
    if (b?.epoque === c.epoque) b.n++; else bandes.push({ epoque: c.epoque, n: 1, court: epoques.find((e) => e.id === c.epoque).court });
  });
  conteneur.innerHTML = `<div class="frise" role="group" aria-label="Barre de temps">
    <div class="frise-tete">
      <output class="frise-lecture"></output>
      ${surToutes ? '<button type="button" class="frise-toutes" data-toutes>Toutes les époques</button>' : ''}
    </div>
    <div class="frise-defile">
      <div class="frise-piste" style="--n:${liste.length}">
        <div class="frise-bandes">${bandes.map((b) => `<button type="button" tabindex="-1" data-epoque="${b.epoque}" style="flex:${b.n}" title="${esc(nomEpoque(b.epoque))}">${esc(b.court)}</button>`).join('')}</div>
        <div class="frise-crans">${liste.map((c, i) => `<button type="button" tabindex="-1" data-i="${i}">${c.debut === undefined ? '•' : esc(c.libelle)}</button>`).join('')}</div>
        <input class="frise-curseur" type="range" min="0" max="${liste.length - 1}" step="1" value="0" aria-label="Année ou époque">
      </div>
    </div>
  </div>`;
  const q = (s) => conteneur.querySelector(s);
  const defile = q('.frise-defile'), curseur = q('.frise-curseur'), lecture = q('.frise-lecture'), toutes = q('[data-toutes]');

  const texte = (i) => {
    const c = liste[i], nom = nomEpoque(c.epoque);
    return c.debut === undefined ? nom : `${c.libelle} · ${nom}`;
  };
  function suivre(i) {
    const cran = q('.frise-piste').offsetWidth / liste.length;
    const x = (i + 0.5) * cran - defile.scrollLeft;
    if (x < MARGE_BORD) defile.scrollLeft -= MARGE_BORD - x + cran;
    else if (x > defile.clientWidth - MARGE_BORD) defile.scrollLeft += x - defile.clientWidth + MARGE_BORD + cran;
  }
  function poser(i, epoqueEntiere = null) {
    const repos = i === null;
    q('.frise').classList.toggle('au-repos', repos);
    if (toutes) toutes.setAttribute('aria-pressed', String(repos));
    conteneur.querySelectorAll('.frise-crans button').forEach((b) => b.classList.toggle('choisi', +b.dataset.i === i));
    if (repos) { lecture.textContent = 'Toutes les époques'; curseur.setAttribute('aria-valuetext', lecture.textContent); return; }
    curseur.value = i;
    lecture.textContent = epoqueEntiere ? nomEpoque(epoqueEntiere) : texte(i);
    curseur.setAttribute('aria-valuetext', lecture.textContent);
    suivre(i);
  }
  curseur.addEventListener('input', () => { poser(+curseur.value); surCran(liste[+curseur.value], +curseur.value); });
  conteneur.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.i !== undefined) { poser(+b.dataset.i); surCran(liste[+b.dataset.i], +b.dataset.i); }
    if (b.dataset.epoque) {
      const i = liste.findIndex((c) => c.epoque === b.dataset.epoque);
      if (surEpoque) surEpoque(b.dataset.epoque, i); else { poser(i); surCran(liste[i], i); }
    }
    if ('toutes' in b.dataset) surToutes();
  });
  return { poser };
}
