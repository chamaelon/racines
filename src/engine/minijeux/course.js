/* Course à cheval : taper vite pour distancer les cavaliers. Résultat : 'win' ou 'lose'. */
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

export async function lancer(zone, n, { rendu, ambiance, signal }) {
  zone.innerHTML = `<div class="mj-consigne">${n.consigne}</div>
    <div class="mj-piste" aria-hidden="true"><span class="mj-m" data-qui="foe">⚔️</span><span class="mj-m" data-qui="you">🐎</span><span class="mj-m mj-but">🌳</span></div>
    <div class="mj-grand" aria-live="polite"></div>`;
  zone.classList.remove('cache');
  zone.classList.add('tape');
  const grand = zone.querySelector('.mj-grand');
  const you = zone.querySelector('[data-qui=you]'), foe = zone.querySelector('[data-qui=foe]');
  let x = 0, ennemi = -25, fini = false, frappes = [], parti = false;
  const dessiner = () => { you.style.left = Math.max(2, Math.min(96, x)) + '%'; foe.style.left = Math.max(2, Math.min(96, ennemi)) + '%'; };
  dessiner();
  const frappe = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!parti || fini) return;
    x += 3; frappes.push(performance.now()); ambiance.coup(0);
  };
  const clavier = (e) => { if (e.code === 'Space' || e.code === 'Enter') { if (!e.repeat) frappe(e); else e.preventDefault(); } };
  zone.addEventListener('pointerdown', frappe);
  addEventListener('keydown', clavier);
  for (const c of ['3', '2', '1', 'Galope !']) { grand.textContent = c; await pause(650); if (signal.aborted) return 'lose'; }
  grand.textContent = '';
  parti = true;
  return new Promise((res) => {
    let dernier = performance.now();
    const image = (now) => {
      if (signal.aborted) { removeEventListener('keydown', clavier); return; }
      const dt = (now - dernier) / 1000; dernier = now;
      ennemi += 6 * dt;
      frappes = frappes.filter((t) => now - t < 1000);
      rendu.galop(Math.min(3, 0.6 + frappes.length * 0.4));
      dessiner();
      if (x >= 100 || ennemi >= x) {
        fini = true;
        const r = x >= 100 ? 'win' : 'lose';
        grand.textContent = r === 'win' ? n.gagne : n.perdu;
        removeEventListener('keydown', clavier);
        setTimeout(() => { zone.classList.add('cache'); zone.classList.remove('tape'); zone.innerHTML = ''; rendu.galop(0); res(r); }, 1100);
        return;
      }
      requestAnimationFrame(image);
    };
    requestAnimationFrame(image);
  });
}
