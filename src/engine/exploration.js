/*
 * Les phases d'exploration : on clique sur les objets qui brillent, ou sur leur nom dans la liste.
 * Chaque objet ouvre la même fiche que la galerie du patrimoine.
 */
import { ficheHtml, peindreDessins } from '../components/fiche-patrimoine.js';

export function explorer(racine, ids, { patrimoine, rendu, surTrouve }) {
  const hint = racine.querySelector('.j-explore');
  const liste = hint.querySelector('.j-explore-liste');
  const compteur = hint.querySelector('.j-explore-compte');
  const info = racine.querySelector('.j-info');
  const corps = info.querySelector('.j-info-corps');
  const trouves = new Set();
  const maj = () => { compteur.textContent = `Objets découverts : ${trouves.size}/${ids.length}`; };

  function ouvrir(id) {
    const p = patrimoine.find((x) => x.id === id);
    corps.innerHTML = ficheHtml(p);
    peindreDessins(corps);
    info.classList.remove('cache');
    info.querySelector('button').focus({ preventScroll: true });
    trouves.add(id);
    surTrouve(id);
    liste.querySelector(`[data-objet="${id}"]`).classList.add('trouve');
    maj();
  }

  liste.innerHTML = ids.map((id) => {
    const p = patrimoine.find((x) => x.id === id);
    return `<button type="button" data-objet="${id}">${p.titre}</button>`;
  }).join('');
  liste.querySelectorAll('button').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); ouvrir(b.dataset.objet); }));
  rendu.explorer(ids, ouvrir);
  maj();
  hint.classList.remove('cache');

  return new Promise((res) => {
    hint.querySelector('.j-explore-suite').onclick = (e) => {
      e.stopPropagation();
      hint.classList.add('cache');
      info.classList.add('cache');
      rendu.finExplorer();
      res();
    };
  });
}
