/*
 * En attendant les voix enregistrées : des MP3 muets de même nom, des sous-titres WebVTT calés sur la
 * longueur des phrases, et ENREGISTREMENTS.md, la liste de ce qu'il faut enregistrer.
 * Un fichier déjà enregistré n'est jamais écrasé : on regénère seulement ce qui manque (--force pour tout).
 * Il faut ffmpeg dans le PATH.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const FORCE = process.argv.includes('--force');
const CAR_PAR_S = 14;
const recits = JSON.parse(readFileSync('public/data/recits.json', 'utf8'));
const langues = JSON.parse(readFileSync('public/data/langues.json', 'utf8'));

const hms = (s) => { const m = Math.floor(s / 60); return `00:${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(3).padStart(6, '0')}`; };
function muet(fichier, duree) {
  if (existsSync(fichier) && !FORCE) return;
  mkdirSync(dirname(fichier), { recursive: true });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=22050:cl=mono', '-t', duree.toFixed(2), '-b:a', '32k', fichier]);
}
const phrases = (t) => t.replace(/\n+/g, ' ').match(/[^.!?…]+[.!?…]+[»"]?\s*|[^.!?…]+$/g).map((s) => s.trim()).filter(Boolean);

const lignes = ['# Voix à enregistrer', '',
  'Remplacer chaque fichier muet par la vraie voix, sous le même nom : MP3 mono 64 kbit/s, normalisé dans Audacity.',
  'Puis passer `provisoire` à `false` (fiche, dans recits.json) ou `audioProvisoire` à `false` (jeu, dans stories/<id>.json).',
  'Après un enregistrement de fiche, recaler les repères de temps du fichier fr.vtt à la main.', ''];

lignes.push('## Fiches des récits', '');
for (const r of recits) {
  for (const [lang, a] of Object.entries(r.audio)) {
    const texte = readFileSync(join('public/data', r.texte), 'utf8');
    const ph = phrases(texte);
    let t = 0;
    const cues = ['WEBVTT', ''];
    ph.forEach((p) => { const d = Math.max(1.6, p.length / CAR_PAR_S); cues.push(`${hms(t)} --> ${hms(t + d)}`, p, ''); t += d; });
    a.duree = Math.round(t);
    muet(join('public', a.src), t);
    if (FORCE || !existsSync(join('public', a.vtt))) writeFileSync(join('public', a.vtt), cues.join('\n'));
    lignes.push(`- \`public/${a.src}\` : **${r.titre}**, en ${langues[lang]}, environ ${Math.ceil(t / 60)} min (texte : \`public/data/${r.texte}\`)`);
  }
}
writeFileSync('public/data/recits.json', JSON.stringify(recits, null, 2) + '\n');

lignes.push('', '## Répliques des récits jouables', '');
for (const f of readdirSync('public/data/stories').filter((x) => x.endsWith('.json'))) {
  const chemin = join('public/data/stories', f);
  const h = JSON.parse(readFileSync(chemin, 'utf8'));
  const lang = h.langueAudio;
  lignes.push(`### ${h.titre}, en ${langues[lang]}`, '', '| Fichier | Personnage | Réplique française à traduire |', '|---|---|---|');
  for (const [id, n] of Object.entries(h.nodes)) {
    if (!n.text) continue;
    const src = `audio/${h.id}/${id}.${lang}.mp3`;
    n.audio = { [lang]: src };
    muet(join('public', src), Math.max(1.5, n.text.length / CAR_PAR_S));
    lignes.push(`| \`public/${src}\` | ${h.personnages[n.speaker].nom} | ${n.text} |`);
  }
  lignes.push('');
  writeFileSync(chemin, JSON.stringify(h, null, 2) + '\n');
}
writeFileSync('ENREGISTREMENTS.md', lignes.join('\n'));
console.log('Bouche-trous prêts, liste dans ENREGISTREMENTS.md');
