/* Les choix du joueur : de vrais boutons, donc au clavier comme au toucher. */
export function choisir(racine, choices) {
  const zone = racine.querySelector('.j-boite .j-choix');
  zone.innerHTML = '';
  return new Promise((res) => {
    choices.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.label;
      b.addEventListener('click', (e) => { e.stopPropagation(); zone.innerHTML = ''; res(c); });
      zone.appendChild(b);
      if (i === 0) b.focus({ preventScroll: true });
    });
  });
}
