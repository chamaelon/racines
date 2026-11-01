/*
 * Racines — fonctions partagées par les pages : catalogue, carnet de voyage (progression),
 * barre de navigation.
 */
window.RACINES_APP = (function () {
  const C = window.CATALOGUE;
  const echap = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mmss = (s) => `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, '0')}`;
  const parId = (id) => C.histoires.find((h) => h.dossier === id);
  const etiquette = (h) => (h.statut === 'historique' ? 'Récit historique simplifié' : 'Adaptation libre, à vérifier');

  // Carnet de voyage : ce que le visiteur a vu et réussi. localStorage peut être refusé : on garde alors en mémoire.
  const CLE = 'racines-carnet';
  let carnet = {};
  try { carnet = JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { /* navigation privée */ }
  const sauver = () => { try { localStorage.setItem(CLE, JSON.stringify(carnet)); } catch (e) { /* idem */ } };
  const Carnet = {
    get: (id) => carnet[id] || {},
    maj(id, v) { carnet[id] = Object.assign(carnet[id] || {}, v); sauver(); },
    vus: () => C.histoires.filter((h) => (carnet[h.dossier] || {}).vu).length,
    quiz: () => C.histoires.filter((h) => (carnet[h.dossier] || {}).quiz).length,
    vider() { carnet = {}; sauver(); },
  };

  function nav(active, pleine) {
    const liens = [['index.html', 'Carte'], ['histoires.html', 'Les 30 récits'], ['carnet.html', 'Carnet'], ['studio.html', 'Studio de doublage'], ['apropos.html', 'À propos']];
    const n = document.createElement('nav');
    n.className = 'nav' + (pleine ? ' pleine' : '');
    n.setAttribute('aria-label', 'Navigation principale');
    n.innerHTML = `<a class="marque" href="../index.html" title="Retour à la plateforme Racines">← Racines</a><div class="liens">${liens.map(([u, t], i) =>
      `<a href="${u}"${u === active ? ' aria-current="page"' : ''}${i > 2 ? ' class="secondaire"' : ''}>${t}</a>`).join('')}</div>`;
    document.body.prepend(n);
    const ic = document.createElement('link');
    ic.rel = 'icon';
    ic.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%230d0f24'/%3E%3Cpath d='M16 5v12M16 17c-5 0-8 3-9 8M16 17c5 0 8 3 9 8M16 17v9' stroke='%23e4b34e' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";
    document.head.appendChild(ic);
  }

  return { C, echap, mmss, parId, etiquette, Carnet, nav };
})();
