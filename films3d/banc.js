/*
 * Le banc : relit un découpage dans le navigateur (npm run dev, puis /films3d/?film=03-wuro-pilon).
 * scripts/rendre-film.js ouvre la même page avec &rendu=1 et demande les images une à une par window.film.
 */
import { Film } from './moteur.js';

const decoupages = import.meta.glob('./decoupages/*.js');
const q = new URLSearchParams(location.search);
const id = q.get('film') || '03-wuro-pilon';
const charge = decoupages[`./decoupages/${id}.js`];
if (!charge) throw new Error(`Découpage introuvable : ${id}`);
const def = (await charge()).default;

const canvas = document.getElementById('film');
const film = new Film(canvas, def, { largeur: Number(q.get('l')) || 1920, hauteur: Number(q.get('h')) || 1080 });
window.film = film;
window.duree = def.duree;

if (q.get('rendu')) {
  document.body.classList.add('rendu');
} else {
  const curseur = document.getElementById('temps');
  const repere = document.getElementById('repere');
  const bouton = document.getElementById('lire');
  curseur.max = def.duree;
  const afficher = (t) => { repere.textContent = `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`; };
  let lecture = false, avant = 0;
  async function boucle(maintenant) {
    if (!lecture) return;
    const t = Math.min(def.duree, Number(curseur.value) + (maintenant - avant) / 1000);
    avant = maintenant;
    curseur.value = t;
    afficher(t);
    await film.aller(t);
    if (t < def.duree) requestAnimationFrame(boucle); else lecture = false;
  }
  bouton.addEventListener('click', () => {
    lecture = !lecture;
    bouton.textContent = lecture ? 'Pause' : 'Lire';
    avant = performance.now();
    if (lecture) requestAnimationFrame(boucle);
  });
  curseur.addEventListener('input', () => { afficher(Number(curseur.value)); film.aller(Number(curseur.value)); });
  film.aller(Number(q.get('t')) || 0);
}
