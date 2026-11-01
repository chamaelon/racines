/* Rythme : reproduire une séquence de tam-tam. n.sequence : indices de 0 à 3. Résultat : 'win' ou 'lose'. */
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

export async function lancer(zone, n, { ambiance, signal }) {
  const sequence = n.sequence || [0, 2, 1, 3];
  zone.innerHTML = `<div class="mj-carte">
    <p class="mj-sur">Tam-tam</p>
    <p class="mj-question">${n.consigne || 'Écoute, puis reproduis le rythme.'}</p>
    <div class="mj-tams">${[0, 1, 2, 3].map((i) => `<button type="button" data-t="${i}" aria-label="Tambour ${i + 1}" disabled>${i + 1}</button>`).join('')}</div>
    <p class="mj-retour" aria-live="polite"></p>
  </div>`;
  zone.classList.remove('cache');
  const tams = [...zone.querySelectorAll('.mj-tams button')];
  const retour = zone.querySelector('.mj-retour');
  const allumer = async (i, ms = 320) => { tams[i].classList.add('on'); ambiance.coup(i); await pause(ms); tams[i].classList.remove('on'); };
  retour.textContent = 'Écoute…';
  await pause(500);
  for (const i of sequence) { if (signal.aborted) return 'lose'; await allumer(i); await pause(120); }
  retour.textContent = 'À toi !';
  tams.forEach((b) => { b.disabled = false; });
  tams[0].focus({ preventScroll: true });
  return new Promise((res) => {
    let pos = 0;
    const finir = (r) => {
      tams.forEach((b) => { b.disabled = true; });
      retour.textContent = r === 'win' ? (n.gagne || 'Bien joué !') : (n.perdu || 'Le rythme s\'est perdu…');
      setTimeout(() => { zone.classList.add('cache'); zone.innerHTML = ''; res(r); }, 1300);
    };
    tams.forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      const i = +b.dataset.t;
      allumer(i, 160);
      if (i !== sequence[pos]) return finir('lose');
      pos++;
      if (pos === sequence.length) finir('win');
      return undefined;
    }));
  });
}
