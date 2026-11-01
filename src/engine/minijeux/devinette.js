/* Devinette du griot : une question, trois réponses. Résultat : 'win' ou 'lose'. */
export function lancer(zone, n) {
  zone.innerHTML = `<div class="mj-carte">
    <p class="mj-sur">Devinette</p>
    <p class="mj-question">${n.question}</p>
    <div class="mj-reponses">${n.reponses.map((r, i) => `<button type="button" data-i="${i}">${r.label}</button>`).join('')}</div>
    <p class="mj-retour" aria-live="polite"></p>
  </div>`;
  zone.classList.remove('cache');
  const retour = zone.querySelector('.mj-retour');
  const boutons = [...zone.querySelectorAll('.mj-reponses button')];
  boutons[0].focus({ preventScroll: true });
  return new Promise((res) => {
    boutons.forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const bon = !!n.reponses[+b.dataset.i].correct;
      boutons.forEach((x, i) => { x.disabled = true; if (n.reponses[i].correct) x.classList.add('bon'); });
      if (!bon) b.classList.add('faux');
      retour.textContent = bon ? n.gagne : n.perdu;
      const suite = document.createElement('button');
      suite.type = 'button'; suite.className = 'mj-suite'; suite.textContent = 'Continuer ▶';
      suite.addEventListener('click', (ev) => { ev.stopPropagation(); zone.classList.add('cache'); zone.innerHTML = ''; res(bon ? 'win' : 'lose'); });
      retour.after(suite);
      suite.focus({ preventScroll: true });
    }));
  });
}
