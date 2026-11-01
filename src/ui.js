/* Petits utilitaires d'interface partagés par les vues. */
export const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const TYPES = {
  conte: { nom: 'Conte', pluriel: 'Contes' },
  legende: { nom: 'Légende', pluriel: 'Légendes' },
  histoire: { nom: 'Récit historique', pluriel: 'Récits historiques' },
};

const NOM = 'Racines';
export function definirPage({ titre, description }) {
  const t = titre ? `${titre} — ${NOM}` : `${NOM} — carte des contes et légendes du Burkina Faso`;
  document.title = t;
  const d = description || 'Parcourez le Burkina Faso sur une carte, puis lisez, écoutez ou vivez ses contes, légendes et récits historiques.';
  document.querySelector('meta[name=description]').content = d;
  document.querySelector('meta[property="og:title"]').content = t;
  document.querySelector('meta[property="og:description"]').content = d;
}

export const reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function webgl() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}

// Petit rendu Markdown : paragraphes et gras suffisent pour les textes des récits.
export const mdHtml = (md) => md.trim().split(/\n{2,}/).map((p) => `<p>${esc(p.replace(/\n/g, ' ')).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`).join('');

export const bandeauProvisoire = () => '<p class="bandeau-provisoire"><strong>Texte provisoire.</strong> Il reste à valider auprès de sources et de conteurs.</p>';
