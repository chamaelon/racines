/*
 * Rend un film 3D en MP4 muet, image par image, sans dépendre de la vitesse de la machine.
 *   node scripts/rendre-film.js 03-wuro-pilon                  le film entier, en pleine qualité, dans montage/masters/<film>.mp4
 *   node scripts/rendre-film.js 03-wuro-pilon --de 77 --a 110  un extrait, dans films3d/sorties
 *   node scripts/rendre-film.js 03-wuro-pilon --images 10,95   des images PNG de contrôle, dans films3d/sorties
 * Options : --tranches N (rendus en parallèle, 2 par défaut), --l 1920 --h 1080, --ips 25.
 * Le film se découpe en tranches de 20 s : relancer après un arrêt reprend à la tranche manquante.
 * Ensuite, « npm run films » en tire la version légère du site.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const args = process.argv.slice(2);
const id = args[0];
if (!id) throw new Error('Indiquer le film : node scripts/rendre-film.js 03-wuro-pilon');
const opt = (nom, defaut) => { const i = args.indexOf(`--${nom}`); return i >= 0 ? args[i + 1] : defaut; };
const IPS = Number(opt('ips', 25)), L = Number(opt('l', 1920)), H = Number(opt('h', 1080));
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const SORTIES = 'films3d/sorties';
const TRANCHE = 20;

function executer(cmd, a) {
  return new Promise((ok, ko) => {
    const p = spawn(cmd, a, { stdio: ['ignore', 'ignore', 'inherit'] });
    p.on('exit', (c) => (c === 0 ? ok() : ko(new Error(`${cmd} a échoué (${c})`))));
  });
}

async function ouvrir(navigateur, base) {
  const page = await navigateur.newPage({ viewport: { width: Math.min(L, 1280), height: Math.min(H, 720) } });
  page.on('pageerror', (e) => console.error('Erreur de la page :', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('Page :', m.text()); });
  await page.goto(`${base}films3d/?film=${id}&rendu=1&l=${L}&h=${H}`);
  await page.waitForFunction(() => window.film);
  return page;
}

const prendre = (page, t, type, qualite) => page.evaluate(async ({ t, type, qualite }) => {
  await window.film.aller(t);
  return window.film.canvas.toDataURL(type, qualite).split(',')[1];
}, { t, type, qualite });

async function rendreTranche(page, de, a, sortie) {
  const provisoire = `${sortie}.tmp.mp4`;
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(IPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-an', provisoire], { stdio: ['pipe', 'ignore', 'inherit'] });
  const fini = new Promise((ok, ko) => ff.on('exit', (c) => (c === 0 ? ok() : ko(new Error(`ffmpeg a échoué (${c})`)))));
  const debut = Math.round(de * IPS), fin = Math.round(a * IPS);
  for (let i = debut; i < fin; i++) {
    const image = await prendre(page, i / IPS, 'image/jpeg', .96);
    if (!ff.stdin.write(Buffer.from(image, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await fini;
  renameSync(provisoire, sortie);
}

const serveur = await createServer({ server: { port: 5199, strictPort: false }, logLevel: 'error' });
await serveur.listen();
const base = serveur.resolvedUrls.local[0];
const navigateur = await chromium.launch({ channel: process.env.CI ? undefined : 'msedge', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-webgl', '--disable-gpu-vsync', '--disable-frame-rate-limit'] });
try {
  mkdirSync(SORTIES, { recursive: true });
  const images = opt('images');
  if (images) {
    const page = await ouvrir(navigateur, base);
    const moteur = await page.evaluate(() => {
      const gl = window.film.renderer.getContext();
      const d = gl.getExtension('WEBGL_debug_renderer_info');
      return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : '?';
    });
    console.log(`Carte : ${moteur}`);
    for (const t of images.split(',').map(Number)) {
      const fichier = join(SORTIES, `${id}-${String(t).replace('.', '_')}.jpg`);
      writeFileSync(fichier, Buffer.from(await prendre(page, t, 'image/jpeg', .9), 'base64'));
      console.log(fichier);
    }
  } else {
    const entier = opt('de') === undefined && opt('a') === undefined;
    const pageTest = await ouvrir(navigateur, base);
    const duree = await pageTest.evaluate(() => window.duree);
    await pageTest.close();
    const de = Number(opt('de', 0)), a = Number(opt('a', duree));
    const dossier = join(SORTIES, `tranches-${id}-${de}-${a}-${L}`);
    mkdirSync(dossier, { recursive: true });
    const taches = [];
    for (let d = de; d < a; d += TRANCHE) taches.push([d, Math.min(a, d + TRANCHE), join(dossier, `${String(d).padStart(5, '0')}.mp4`)]);
    const reste = taches.filter((x) => !existsSync(x[2]));
    const depart = Date.now();
    let faites = taches.length - reste.length;
    const ouvrier = async () => {
      const page = await ouvrir(navigateur, base);
      for (let x = reste.shift(); x; x = reste.shift()) {
        await rendreTranche(page, x[0], x[1], x[2]);
        console.log(`${++faites}/${taches.length} tranches, ${Math.round((Date.now() - depart) / 1000)} s`);
      }
      await page.close();
    };
    await Promise.all(Array.from({ length: Number(opt('tranches', 2)) }, ouvrier));
    const liste = join(dossier, 'liste.txt');
    writeFileSync(liste, taches.map((x) => `file '${resolve(x[2]).replace(/\\/g, '/')}'`).join('\n'));
    const sortie = entier ? join('montage/masters', `${id}.mp4`) : join(SORTIES, `${id}-${de}-${a}.mp4`);
    mkdirSync(join(sortie, '..'), { recursive: true });
    await executer(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', liste, '-c', 'copy', '-movflags', '+faststart', sortie]);
    rmSync(dossier, { recursive: true });
    console.log(`Prêt : ${sortie}`);
  }
} finally {
  await navigateur.close();
  await serveur.close();
}
