/*
 * Filtres du catalogue. Ils vivent dans l'URL : un lien partagé rouvre la même vue.
 * filtrer() est une fonction pure : les tests peuvent la vérifier sans navigateur.
 */
const sansAccent = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function filtrer(recits, f, { localitesParId = {} } = {}) {
  const q = sansAccent(f.q || '');
  return recits.filter((r) => {
    if (f.type && r.type !== f.type) return false;
    if (f.region && !r.localites.some((l) => localitesParId[l]?.region === f.region)) return false;
    if (f.peuple && r.peuple !== f.peuple) return false;
    if (f.langue && !r.langues.includes(f.langue) && !r.audio[f.langue]) return false;
    if (f.audio && !Object.keys(r.audio).length) return false;
    if (q && !sansAccent([r.titre, r.resume, ...(r.motsCles || []), r.peuple].join(' ')).includes(q)) return false;
    return true;
  });
}

export const versQuery = (f) => {
  const u = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => { if (v) u.set(k, v === true ? '1' : v); });
  return u.toString();
};
