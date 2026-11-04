/*
 * Range les films pour le site et écrit public/data/films.json. Mode d'emploi : films3d/GUIDE-MONTAGE.md
 *   npm run films                     prend ce qui est dans montage/exports : <film>-video.mp4, <film>-<langue>.wav (ou mp3, m4a, mp4, mov…)
 *                                     et compresse les masters de montage/masters encore absents du site
 *   npm run films -- --provisoires    remplit ce qui manque avec les anciennes vidéos stickman et leur son de synthèse
 * Un même film garde une seule image pour toutes les langues : seule la piste audio change. Les médias ne vont pas dans le dépôt.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ENCODAGE_IMAGE, ENCODAGE_SON, langueDuNom, trierPistes } from '../src/engine/film.js';

const FILMS = 'public/films', EXPORTS = 'montage/exports', MASTERS = 'montage/masters', ANIMATIONS = 'animations';
const FFMPEG = process.env.FFMPEG || 'ffmpeg', FFPROBE = process.env.FFPROBE || 'ffprobe';
const FORMATS = new Set(['.wav', '.mp3', '.m4a', '.aac', '.flac', '.ogg', '.mp4', '.mov', '.mkv']);
const ECART_TOLERE = 0.5;

function lancer(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.error?.code === 'ENOENT') throw new Error(`${cmd} introuvable : installer ffmpeg, ou indiquer son chemin dans FFMPEG et FFPROBE.`);
  if (r.status !== 0) throw new Error(`${cmd} a échoué : ${(r.stderr || '').trim().split('\n').pop()}`);
  return r.stdout;
}
const ffmpeg = (...a) => lancer(FFMPEG, ['-y', '-loglevel', 'error', ...a]);
const duree = (f) => Number(lancer(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));
const dossierDe = (film) => join(FILMS, film);
const memoire = (film) => join(dossierDe(film), 'provisoires.json');
const lireProvisoires = (film) => (existsSync(memoire(film)) ? JSON.parse(readFileSync(memoire(film), 'utf8')) : []);
function marquerProvisoires(film, liste) {
  if (liste.length) writeFileSync(memoire(film), JSON.stringify(liste));
  else rmSync(memoire(film), { force: true });
}
// ffmpeg écrit d'abord à côté : un export raté ne détruit jamais ce qui existe déjà.
function produire(sortie, ...args) {
  const provisoire = `${sortie}.tmp${extname(sortie)}`;
  ffmpeg(...args, provisoire);
  renameSync(provisoire, sortie);
}

// Un master plus récent que la vidéo du site (un nouveau rendu) remplace celle-ci, même si elle venait des anciens films.
function compresserMasters() {
  if (!existsSync(MASTERS)) return;
  for (const f of readdirSync(MASTERS).filter((x) => x.endsWith('.mp4'))) {
    const film = f.slice(0, -4), video = join(dossierDe(film), 'video.mp4'), master = join(MASTERS, f);
    if (existsSync(video) && statSync(video).mtimeMs >= statSync(master).mtimeMs) continue;
    mkdirSync(dossierDe(film), { recursive: true });
    produire(video, '-i', master, ...ENCODAGE_IMAGE);
    console.log(`Compressé : ${film}, ${Math.round(statSync(video).size / 1e6)} Mo`);
  }
}

function accueillirExports() {
  if (!existsSync(EXPORTS)) return;
  const fichiers = readdirSync(EXPORTS).filter((f) => FORMATS.has(extname(f).toLowerCase()));
  // L'image d'abord : c'est sur elle qu'on mesure les pistes.
  fichiers.sort((a, b) => Number(b.includes('-video')) - Number(a.includes('-video')));
  for (const f of fichiers) {
    const nom = langueDuNom(f);
    if (!nom) { console.warn(`Ignoré, nom attendu <film>-video.mp4 ou <film>-<langue>.wav : ${f}`); continue; }
    const source = join(EXPORTS, f), dossier = dossierDe(nom.film);
    mkdirSync(dossier, { recursive: true });
    if (nom.piste === 'video') {
      produire(join(dossier, 'video.mp4'), '-i', source, ...ENCODAGE_IMAGE);
      console.log(`Image : ${nom.film}`);
      continue;
    }
    const video = join(dossier, 'video.mp4');
    if (existsSync(video)) {
      const ecart = duree(source) - duree(video);
      if (Math.abs(ecart) > ECART_TOLERE) console.warn(`Attention, ${f} a ${ecart.toFixed(1)} s d'écart avec l'image : la fin ne tombera pas juste.`);
    }
    produire(join(dossier, `${nom.piste}.m4a`), '-i', source, ...ENCODAGE_SON);
    marquerProvisoires(nom.film, lireProvisoires(nom.film).filter((p) => p !== nom.piste));
    console.log(`Piste : ${nom.film}, ${nom.piste}`);
  }
}

// En attendant les films 3D et le montage : ce qui existe déjà, marqué provisoire, pour que chaque fiche garde son film.
function completerProvisoires(recits) {
  for (const { film } of recits.filter((r) => r.film)) {
    const dossier = dossierDe(film);
    const video = join(dossier, 'video.mp4');
    const web = join(ANIMATIONS, 'videos-web', `${film}.mp4`);
    mkdirSync(dossier, { recursive: true });
    if (!existsSync(video)) {
      if (!existsSync(web)) { console.warn(`Pas d'ancienne vidéo pour ${film}.`); continue; }
      produire(video, '-i', web, '-map', '0:v:0', '-c', 'copy', '-an', '-movflags', '+faststart');
    }
    const pistes = lireProvisoires(film);
    const sons = join(ANIMATIONS, 'audio', film);
    const mixer = (sortie, ...entrees) => produire(sortie, ...entrees.flatMap((e) => ['-i', join(sons, e)]), '-filter_complex', `amix=inputs=${entrees.length}:duration=longest:normalize=0`, ...ENCODAGE_SON);
    for (const [piste, entrees] of [['fr', ['voix-fr.mp3', 'ambiance.mp3', 'musique.mp3']], ['zxx', ['ambiance.mp3', 'musique.mp3']]]) {
      const sortie = join(dossier, `${piste}.m4a`);
      if (existsSync(sortie) || !entrees.every((e) => existsSync(join(sons, e)))) continue;
      mixer(sortie, ...entrees);
      pistes.push(piste);
    }
    marquerProvisoires(film, pistes);
    const srt = join(ANIMATIONS, 'doublage', film, 'fr.vtt');
    if (existsSync(srt) && !existsSync(join(dossier, 'fr.vtt'))) copyFileSync(srt, join(dossier, 'fr.vtt'));
  }
}

async function lireDecoupage(film) {
  const f = join('films3d/decoupages', `${film}.js`);
  return existsSync(f) ? (await import(pathToFileURL(f).href)).default : null;
}

async function ecrireManifeste() {
  const manifeste = {};
  if (existsSync(FILMS)) {
    for (const film of readdirSync(FILMS).sort()) {
      const dossier = dossierDe(film);
      if (!statSync(dossier).isDirectory()) continue;
      const video = join(dossier, 'video.mp4');
      if (!existsSync(video)) continue;
      const fichiers = readdirSync(dossier);
      const decoupage = await lireDecoupage(film);
      const provisoires = lireProvisoires(film);
      manifeste[film] = {
        video: `films/${film}/video.mp4`,
        duree: Math.round(duree(video) * 10) / 10,
        rendu: decoupage ? '3d' : 'stickman',
        pistes: trierPistes(fichiers.filter((f) => f.endsWith('.m4a')).map((f) => f.slice(0, -4))).map((code) => ({ code, src: `films/${film}/${code}.m4a`, provisoire: provisoires.includes(code) })),
        sousTitres: fichiers.filter((f) => f.endsWith('.vtt')).map((f) => ({ code: f.slice(0, -4), src: `films/${film}/${f}` })),
        cartons: decoupage?.cartons || [],
      };
    }
  }
  writeFileSync('public/data/films.json', `${JSON.stringify(manifeste, null, 1)}\n`);
  const liste = Object.values(manifeste);
  console.log(`Manifeste : ${liste.length} film(s), dont ${liste.filter((f) => f.rendu === '3d').length} en 3D ; ${liste.reduce((n, f) => n + f.pistes.filter((p) => !p.provisoire).length, 0)} piste(s) montée(s).`);
}

mkdirSync(FILMS, { recursive: true });
compresserMasters();
accueillirExports();
if (process.argv.includes('--provisoires')) completerProvisoires(JSON.parse(readFileSync('public/data/recits.json', 'utf8')));
await ecrireManifeste();
