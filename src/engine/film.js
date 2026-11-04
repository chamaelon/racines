/* Les règles du lecteur de films et du rangement des exports, sans navigateur : les tests et scripts/films.js s'en servent aussi. */

// « zxx » est le code de la norme pour « sans contenu linguistique » : ici, l'ambiance et la musique sans voix.
export const SANS_VOIX = 'zxx';

// « 03-wuro-pilon-mos.wav » : le film, puis la langue ou « video ».
export function langueDuNom(fichier) {
  const m = /^(\d{2}-[a-z0-9-]+)-(video|[a-z]{2,3})\.[a-z0-9]+$/i.exec(fichier);
  return m ? { film: m[1], piste: m[2].toLowerCase() } : null;
}

// Le français d'abord, le film sans voix en dernier.
export function trierPistes(codes) {
  const rang = (c) => (c === 'fr' ? 0 : c === SANS_VOIX ? 2 : 1);
  return [...codes].sort((a, b) => rang(a) - rang(b) || a.localeCompare(b));
}

// La voix que le visiteur a choisie, sinon la langue du site, sinon le français, sinon ce qui existe.
export function choisirPiste(pistes, voix, site) {
  const codes = pistes.map((p) => p.code);
  return [voix, site, 'fr', ...codes].find((c) => c && codes.includes(c)) || null;
}

export function formaterTemps(s) {
  const t = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

export const cartonA = (cartons, t) => cartons.find((c) => t >= c.de && t < c.a) || null;

// La version du site : GitHub Pages limite le site à 1 Go. Le master, lui, reste en pleine qualité pour le montage.
export const ENCODAGE_IMAGE = ['-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-vf', 'scale=-2:720', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
export const ENCODAGE_SON = ['-vn', '-ac', '2', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart'];

// Au-delà de cet écart, on replace le son sur l'image ; en deçà, un saut s'entendrait plus que le décalage.
export const ECART_MAX = 0.25;
export const horsSynchro = (image, son, dureeSon) => (!dureeSon || image < dureeSon) && Math.abs(image - son) > ECART_MAX;
