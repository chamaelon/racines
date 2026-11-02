/*
 * Prépare ce que l'équipe dépose à la main, sans autre manipulation : lancé avant « npm run dev » et « npm run build ».
 *   public/motifs       repère les images et écrit index.json
 *   public/traductions  écrit translate-exemple.json (les phrases du site), complète les langues déjà commencées, écrit index.json
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { champsTexte } from '../src/engine/traduction.js';
import { analyserNom } from '../src/motifs.js';

const PUBLIC = 'public';
const lire = (f) => JSON.parse(readFileSync(join(PUBLIC, f), 'utf8'));
const ecrire = (f, v) => writeFileSync(join(PUBLIC, f), `${JSON.stringify(v, null, 1)}\n`);
const recits = lire('data/recits.json'), patrimoine = lire('data/patrimoine.json'), voyages = lire('data/voyages.json');

// ---- Motifs
function indexerMotifs() {
  mkdirSync(join(PUBLIC, 'motifs'), { recursive: true });
  const images = {};
  const refuses = [];
  for (const f of readdirSync(join(PUBLIC, 'motifs'))) {
    if (!f.endsWith('.png')) continue;
    const a = analyserNom(f);
    if (a) (images[a.objet] = images[a.objet] || []).push(a); else refuses.push(f);
  }
  Object.values(images).forEach((l) => l.sort((a, b) => a.numero - b.numero));
  ecrire('motifs/index.json', images);
  if (refuses.length) console.warn(`Motifs ignorés, nom attendu type-objet-numero.png : ${refuses.join(', ')}`);
  console.log(`Motifs : ${Object.values(images).flat().length} image(s).`);
}

// ---- Les phrases de l'interface, lues dans le code : littéraux et gabarits, sans leurs balises.
const NON_PHRASE = /^(?:[#./]|https?:|[a-z0-9_-]+$|[a-z-]+:|.*\.(?:js|json|glb|css|mp3|m4a|webp|png)$|[a-z]+\[|\.)/;
const CODE = /[=;{}\\|]|=>|\(\)|\bquerySelector\b/;
// Ce qui ressemble à une phrase sans en être une : classes, touches, media queries, messages de console.
const HORS_ECRAN = new Set(['bouton objet-3d-btn', 'marqueur marqueur-etape', 'fort grand', 'NFD', 'Escape', 'Space', 'Enter', 'button, a, input, select, summary', 'Décor indisponible :', '3D indisponible, mode lecture :', 'Nœud inconnu : {}', 'nœud courant', 'décor', "nœuds dans l'histoire", 'data/{}']);
const GABARIT_CODE = /\{\}\.|\.\{\}|\{\}\/\{\}$|^\(?(?:prefers|max-width)|^linear-gradient|^bandes-son\//;

function phrasesDuHtml(html, garder) {
  const attr = /\b(?:aria-label|title|alt|placeholder)="([^"]*)"/g;
  for (const m of html.matchAll(attr)) garder(m[1]);
  html.replace(/<[^>]*>/g, '\u0000').split('\u0000').forEach(garder);
}

// Découpe un fichier source en chaînes et en gabarits. Les expressions d'un gabarit sont lues à leur tour.
function litteraux(src) {
  const sortie = [];
  function gabarit(i) {
    let texte = '', j = i;
    while (j < src.length && src[j] !== '`') {
      if (src[j] === '\\') { texte += src[j + 1]; j += 2; continue; }
      if (src[j] === '$' && src[j + 1] === '{') {
        texte += '{}';
        j = code(j + 2, '}');
        continue;
      }
      texte += src[j++];
    }
    sortie.push({ texte, gabarit: true });
    return j + 1;
  }
  function code(i, fin) {
    let j = i, prec = '';
    while (j < src.length) {
      const c = src[j];
      if (fin && c === fin) return j + 1;
      if (c === '/' && src[j + 1] === '/') { while (j < src.length && src[j] !== '\n') j++; continue; }
      if (c === '/' && src[j + 1] === '*') { j = src.indexOf('*/', j + 2) + 2; continue; }
      if (c === '/' && /[(,=:[!&|?{};\n]/.test(prec)) {
        j++;
        let classe = false;
        while (j < src.length && (src[j] !== '/' || classe)) {
          if (src[j] === '\\') j++;
          else if (src[j] === '[') classe = true;
          else if (src[j] === ']') classe = false;
          j++;
        }
        j++;
        prec = '/';
        continue;
      }
      if (c === '`') { j = gabarit(j + 1); prec = '`'; continue; }
      if (c === '"' || c === "'") {
        let t = '', k = j + 1;
        while (k < src.length && src[k] !== c) { if (src[k] === '\\') { t += src[k + 1]; k += 2; } else t += src[k++]; }
        sortie.push({ texte: t, gabarit: false });
        j = k + 1;
        prec = c;
        continue;
      }
      if (c === '{') { j = code(j + 1, '}'); prec = '}'; continue; }
      if (!/\s/.test(c)) prec = c;
      j++;
    }
    return j;
  }
  code(0, null);
  return sortie;
}

function fichiersSources(dossier) {
  return readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const f = join(dossier, e.name);
    if (e.isDirectory()) return fichiersSources(f);
    return e.name.endsWith('.js') ? [f] : [];
  });
}

function phrasesInterface() {
  const res = new Set();
  const garder = (brut) => {
    const t = brut.replace(/\s+/g, ' ').trim();
    if (!/\p{L}{2}/u.test(t.replace(/\{\}/g, '')) || t.length > 400) return;
    if (HORS_ECRAN.has(t) || GABARIT_CODE.test(t) && !/\s/.test(t) || GABARIT_CODE.test(t) && /^\(|^linear|^bandes/.test(t)) return;
    if (NON_PHRASE.test(t) || CODE.test(t.replace(/\{\}/g, ''))) return;
    res.add(t);
  };
  phrasesDuHtml(readFileSync('index.html', 'utf8').replace(/^[\s\S]*<body>/, ''), garder);
  // Le moteur et le rendu n'affichent rien de plus ; les fichiers sans texte sont simplement sans résultat.
  for (const f of fichiersSources('src')) {
    if (f.includes('i18n.js') || f.includes('scenes3d') || f.includes('catalogue-decors')) continue;
    for (const { texte, gabarit } of litteraux(readFileSync(f, 'utf8'))) {
      if (gabarit || texte.includes('<')) phrasesDuHtml(texte, garder);
      else if (/\s|^\p{Lu}|[À-ÿ]/u.test(texte)) garder(texte);
    }
  }
  return [...res];
}

// Les textes des données : tous les champs, sauf ceux qui contiennent des identifiants ou des adresses.
const CLES_TECHNIQUES = new Set(['id', 'url', 'src', 'href', 'texte_fichier', 'texteLocal', 'jouable', 'film', 'lecture', 'statut', 'region', 'regions', 'localites', 'patrimoine', 'langues', 'audio', 'recits', 'type', 'categorie', 'coords', 'noeud', 'lieu', 'epoque', 'debut', 'fin', 'pas', 'annee', 'motsCles', 'approx', 'style', 'couleur']);
function textesDe(v, res = [], cle = '') {
  if (CLES_TECHNIQUES.has(cle)) return res;
  if (typeof v === 'string') { if (/\p{L}{2}/u.test(v)) res.push(v.trim()); return res; }
  if (Array.isArray(v)) v.forEach((x) => textesDe(x, res));
  else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => textesDe(x, res, k));
  return res;
}

function paragraphes(chemin) {
  const f = join(PUBLIC, 'data', chemin);
  if (!existsSync(f)) return [];
  return readFileSync(f, 'utf8').trim().split(/\n{2,}/).map((p) => p.replace(/\n/g, ' ').trim());
}

function sections() {
  const liste = [
    ['Interface du site', phrasesInterface()],
    ['Langues', Object.values(lire('data/langues.json'))],
    ['Régions et lieux', [...textesDe(lire('data/regions.json')), ...textesDe(lire('data/localites.json')), ...textesDe(voyages.lieux)]],
    ['Époques', voyages.epoques.flatMap((e) => [e.nom, e.court, e.periode, e.texte])],
    ['Patrimoine', textesDe(patrimoine)],
    ['Fiches des récits', recits.flatMap((r) => [...textesDe(r), ...(typeof r.texte === 'string' ? paragraphes(r.texte) : [])])],
  ];
  for (const r of recits) {
    if (!r.jouable) continue;
    const h = lire(`data/${r.jouable}`);
    liste.push([`Histoire : ${r.titre}`, [...champsTexte(h).map((c) => c.texte), ...(voyages.recits[r.id] || []).map((e) => e.titre)]]);
  }
  return liste;
}

const titre = (nom) => `=== ${nom} ===`;

function indexerTraductions() {
  const dossier = join(PUBLIC, 'traductions');
  mkdirSync(dossier, { recursive: true });
  const vues = new Set();
  const modele = { '@langue': 'nom de la langue, par exemple mooré' };
  let phrases = 0;
  for (const [nom, textes] of sections()) {
    const uniques = [...new Set(textes)].filter((t) => t && !vues.has(t) && !/^\d+$/.test(t));
    if (!uniques.length) continue;
    modele[titre(nom)] = '';
    uniques.forEach((t) => { vues.add(t); modele[t] = ''; phrases++; });
  }
  ecrire('traductions/translate-exemple.json', modele);

  const noms = lire('data/langues.json');
  const index = [];
  for (const f of readdirSync(dossier)) {
    const m = /^translate-(.+)\.json$/.exec(f);
    if (!m || m[1] === 'exemple') continue;
    let d;
    try { d = JSON.parse(readFileSync(join(dossier, f), 'utf8').replace(/^﻿/, '')); } catch (e) {
      console.warn(`${f} : JSON invalide, fichier ignoré (${e.message}).`);
      continue;
    }
    // Le fichier suit le site : les nouvelles phrases s'ajoutent ; une traduction n'est jamais perdue.
    const suivi = { '@langue': d['@langue'] || noms[m[1]] || m[1] };
    for (const k of Object.keys(modele)) if (k !== '@langue') suivi[k] = d[k] || '';
    const orphelines = Object.keys(d).filter((k) => !(k in suivi) && d[k]);
    if (orphelines.length) {
      suivi[titre('Phrases qui ne sont plus dans le site')] = '';
      orphelines.forEach((k) => { suivi[k] = d[k]; });
    }
    ecrire(`traductions/${f}`, suivi);
    index.push({ code: m[1], nom: suivi['@langue'], phrases, traduites: Object.keys(modele).filter((k) => vues.has(k) && suivi[k]).length });
  }
  ecrire('traductions/index.json', index);
  console.log(`Traductions : ${phrases} phrases, ${index.length} langue(s).`);
}

indexerMotifs();
indexerTraductions();
