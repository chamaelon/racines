/*
 * Le dossier public/bandes-son : pour chaque histoire, la fiche de chaque piste à doubler.
 *
 *   npm run bandes-son                                 régénère les fiches, sans toucher aux traductions
 *   npm run bandes-son -- exporter yennenga mos f.csv  feuille à remplir par un traducteur
 *   npm run bandes-son -- importer mos f.csv           reprend la feuille remplie
 *
 * Le français vient des histoires et des scripts de film. Le reste vit dans pistes.json (champ langues).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { champsTexte } from '../src/engine/traduction.js';
import { etapeParNoeud } from '../src/voyage.js';

const PUBLIC = 'public';
const DOSSIER = join(PUBLIC, 'bandes-son');
const lire = (f) => JSON.parse(readFileSync(f, 'utf8'));
const recits = lire(join(PUBLIC, 'data/recits.json'));
const voyages = lire(join(PUBLIC, 'data/voyages.json'));
const nomsLangues = lire(join(PUBLIC, 'data/langues.json'));

// Âge et sexe proposés pour chaque style de personnage. « libre » : au choix du directeur de doublage.
const VOIX = {
  griot: 'adulte/homme', griotte: 'adulte/femme', roi: 'adulte/homme', reine: 'adulte/femme', guerriere: 'adulte/femme', guerrier: 'adulte/homme',
  chasseur: 'adulte/homme', enfant: 'enfant/libre', marchande: 'adulte/femme', femme: 'adulte/femme', jeune_fille: 'jeune/femme', vieille: 'âgée/femme',
  ancien: 'âgé/homme', paysan: 'adulte/homme', jeune: 'jeune/homme', forgeron: 'adulte/homme', cavalier: 'adulte/homme', garde: 'adulte/homme',
  commandant: 'adulte/homme', explorateur: 'adulte/homme', marabout: 'âgé/homme', devin: 'âgé/homme', genie: 'voix de génie/libre', esprit: 'voix d\'esprit/libre',
  createur: 'voix solennelle/libre', masque: 'voix de masque/libre',
};
const voixAnimal = 'voix de conte/libre';

// Pour les personnages typés, un ton par défaut ; sinon il dépend de la réplique et de l'ambiance du décor.
const TON_STYLE = { lievre: 'amusé', hyene: 'moqueur', araignee: 'malicieux', griot: 'posé', griotte: 'posé', createur: 'solennel', genie: 'mystérieux', esprit: 'mystérieux', masque: 'mystérieux', enfant: 'vif', vieille: 'doux', ancien: 'grave' };
const TON_DECOR = { nuit: 'grave', veillee: 'chuchoté', course: 'tendu', foret: 'mystérieux', bois: 'mystérieux', rochers: 'tendu', marche: 'joyeux', village: 'posé', ciel: 'solennel', ruines: 'grave' };

function intonation(texte, style, decor) {
  if (/!/.test(texte)) return style === 'griot' ? 'enlevé' : (TON_STYLE[style] === 'amusé' || TON_STYLE[style] === 'moqueur' ? TON_STYLE[style] : 'vif');
  if (/\?\s*$/.test(texte)) return 'interrogatif';
  return TON_DECOR[decor] && style === 'griot' ? TON_DECOR[decor] : (TON_STYLE[style] || TON_DECOR[decor] || 'posé');
}

// Environ 150 mots par minute, avec des silences à la ponctuation.
function dureeEstimee(t) {
  const mots = t.split(/\s+/).filter(Boolean).length;
  const virgules = (t.match(/[,;:]/g) || []).length;
  const fins = (t.match(/[.!?…]/g) || []).length;
  return Math.max(800, Math.round((mots * 380 + virgules * 150 + fins * 300) / 10) * 10);
}

function dureeFichier(f) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' });
  const s = parseFloat(r.stdout);
  return Number.isFinite(s) ? Math.round(s * 1000) : null;
}

const secondes = (t) => t.trim().split(':').reduce((s, v) => s * 60 + parseFloat(v), 0);
const horodatage = (ms) => { const s = ms / 1000; return `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`; };

// CSV au format du doublage : point-virgule, guillemets pour les champs composés, BOM pour Excel.
function lireCsv(txt) {
  const lignes = [];
  let champ = '', ligne = [], guillemets = false;
  const t = txt.replace(/^﻿/, '').replace(/\r/g, '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (guillemets) {
      if (c === '"' && t[i + 1] === '"') { champ += '"'; i++; } else if (c === '"') guillemets = false; else champ += c;
    } else if (c === '"') guillemets = true;
    else if (c === ';') { ligne.push(champ); champ = ''; } else if (c === '\n') { ligne.push(champ); lignes.push(ligne); ligne = []; champ = ''; } else champ += c;
  }
  if (champ || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  const [tete, ...corps] = lignes;
  return corps.map((l) => Object.fromEntries(tete.map((k, i) => [k, l[i] ?? ''])));
}
const champCsv = (v) => (/[;"\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

function pistesFilm(r) {
  if (!r.film) return [];
  const dossier = join('animations/doublage', r.film);
  const csv = join(dossier, 'traduction.csv');
  if (!existsSync(csv)) return [];
  const script = readFileSync(join(dossier, 'script-fr.md'), 'utf8');
  const types = {};
  for (const m of script.matchAll(/^\|\s*([A-ZÉÈÀ_ -]+?)\s*\|\s*\d+\s*\|\s*([^|]+?)\s*\|/gm)) types[m[1]] = m[2];
  const genre = (role) => {
    const t = (role === 'N' ? types.NARRATEUR : types[role]) || 'narration';
    if (t.includes('narration')) return 'adulte/libre';
    if (t.includes('âgée')) return 'âgé/libre';
    if (t.includes('enfant')) return 'enfant/libre';
    if (t.includes('femme')) return 'adulte/femme';
    if (t.includes('homme')) return 'adulte/homme';
    return `${t}/libre`;
  };
  return lireCsv(readFileSync(csv, 'utf8')).map((l) => {
    const debut = Math.round(secondes(l.debut) * 1000), fin = Math.round(secondes(l.fin) * 1000);
    return {
      id: `film-${String(l.n).padStart(3, '0')}`, type: 'film',
      partie: `Film d'animation, de ${horodatage(debut)} à ${horodatage(fin)}`,
      horodatage: { debut_ms: debut, fin_ms: fin },
      personnage: l.role === 'N' ? 'Narrateur' : l.role,
      intonation: l.ton || 'posé', intonation_statut: l.ton ? 'scénario' : 'proposée',
      texte: l.francais, genre: genre(l.role), duree_ms: fin - debut, duree_statut: 'mesurée sur le film',
    };
  });
}

function construire(r) {
  const h = lire(join(PUBLIC, 'data', r.jouable));
  const etapes = voyages.recits[r.id] || [];
  const parNoeud = etapeParNoeud(h, etapes);
  const decorDe = {};
  let courant = null;
  // Le décor d'un nœud est hérité du précédent quand il n'en précise pas.
  const pile = [[h.start, null]];
  while (pile.length) {
    const [id, herite] = pile.pop();
    const n = h.nodes[id];
    if (!n || decorDe[id]) continue;
    courant = n.scene || herite;
    decorDe[id] = courant;
    [n.next, ...(n.choices || []).map((c) => c.next), ...(n.route || []).map((x) => x.next)].filter(Boolean).forEach((c) => pile.push([c, courant]));
  }
  const partie = (noeud) => {
    const e = etapes[parNoeud[noeud]];
    return e ? `${e.titre} (jeu)` : 'Jeu';
  };
  const pistes = champsTexte(h).map((c) => {
    if (c.type !== 'replique') return { id: c.chemin, type: c.type, chemin: c.chemin, texte: c.texte };
    const style = h.personnages[c.speaker].style;
    return {
      id: c.noeud, type: 'replique', chemin: c.chemin, noeud: c.noeud, partie: partie(c.noeud), personnage: h.personnages[c.speaker].nom,
      intonation: intonation(c.texte, style, decorDe[c.noeud]), intonation_statut: 'proposée',
      texte: c.texte, genre: VOIX[style] || voixAnimal, duree_ms: dureeEstimee(c.texte), duree_statut: 'estimée',
    };
  });
  return { id: r.id, titre: r.titre, peuple: r.peuple, langues_cibles: ['fr', ...r.langues], pistes: [...pistes, ...pistesFilm(r)] };
}

function fusionner(neuf, ancien) {
  if (!ancien) return neuf;
  const parId = Object.fromEntries(ancien.pistes.map((p) => [p.id, p]));
  neuf.pistes.forEach((p) => {
    const a = parId[p.id];
    if (!a) return;
    if (a.langues) {
      p.langues = a.langues;
      // Le français a changé : la traduction est à relire.
      if (a.texte !== p.texte) Object.values(p.langues).forEach((l) => { l.a_revoir = true; });
    }
    // Une intonation corrigée à la main prime sur la proposition.
    if (a.intonation_statut === 'validée') { p.intonation = a.intonation; p.intonation_statut = a.intonation_statut; }
  });
  return neuf;
}

const estVocale = (p) => p.type === 'replique' || p.type === 'film';

// Un enregistrement déposé dans le dossier de l'histoire, nommé <histoire>-<partie>-<langue>.m4a, est repéré ici.
function reperer(d) {
  const dossier = join(DOSSIER, d.id);
  const fichiers = readdirSync(dossier).filter((f) => f.endsWith('.m4a'));
  d.pistes.filter(estVocale).forEach((p) => {
    for (const [code, l] of Object.entries(p.langues || {})) {
      delete l.fichier;
      l.statut = l.texte ? 'a_enregistrer' : 'a_traduire';
    }
    const debut = `${d.id}-${p.id}-`;
    for (const f of fichiers) {
      if (!f.startsWith(debut)) continue;
      const code = f.slice(debut.length, -4);
      if (code.includes('-')) continue;
      const l = { ...p.langues?.[code], fichier: f, statut: 'enregistre' };
      if (code === 'fr') l.texte = p.texte;
      const ms = dureeFichier(join(dossier, f));
      if (ms) l.duree_ms = ms;
      p.langues = { ...p.langues, [code]: l };
    }
  });
}

function fiches(d) {
  const blocs = d.pistes.filter(estVocale).map((p) => {
    const l = [
      `piste: ${p.id}`, `histoire: ${d.titre}`, `partie: ${p.partie}`, `personnage: ${p.personnage}`,
      `fichier: ${d.id}-${p.id}-<langue>.m4a`, `intonation: ${p.intonation} (${p.intonation_statut})`, `texte: ${p.texte}`, `genre: ${p.genre}`, `duree: ${p.duree_ms}ms (${p.duree_statut})`,
    ];
    for (const [code, x] of Object.entries(p.langues || {})) {
      if (code !== 'fr' && x.texte) l.push(`texte_${code}: ${x.texte}`);
      if (x.statut === 'enregistre') l.push(`enregistre_${code}: ${x.fichier}${x.duree_ms ? ` (${x.duree_ms}ms)` : ''}`);
    }
    return l.join('\n');
  });
  return `# ${d.titre} : fiches des bandes-son\n# Généré par « npm run bandes-son » depuis pistes.json. Modifier pistes.json, pas ce fichier.\n\n${blocs.join('\n\n')}\n`;
}

function bilan(d) {
  const texte = d.pistes.filter((p) => p.type !== 'film'), voix = d.pistes.filter((p) => p.type === 'replique');
  const codes = new Set(d.langues_cibles);
  d.pistes.forEach((p) => Object.keys(p.langues || {}).forEach((c) => codes.add(c)));
  const langues = {};
  for (const c of codes) {
    langues[c] = {
      texte: c === 'fr' ? 100 : Math.round(100 * texte.filter((p) => p.langues?.[c]?.texte).length / texte.length),
      voix: Math.round(100 * voix.filter((p) => p.langues?.[c]?.statut === 'enregistre').length / voix.length),
    };
  }
  return { id: d.id, titre: d.titre, pistes: d.pistes.filter(estVocale).length, langues };
}

function generer() {
  mkdirSync(DOSSIER, { recursive: true });
  const index = [];
  for (const r of recits) {
    if (!r.jouable) continue;
    const dir = join(DOSSIER, r.id);
    mkdirSync(dir, { recursive: true });
    const f = join(dir, 'pistes.json');
    const d = fusionner(construire(r), existsSync(f) ? lire(f) : null);
    reperer(d);
    writeFileSync(f, `${JSON.stringify(d, null, 1)}\n`);
    writeFileSync(join(dir, 'fiches.txt'), fiches(d));
    index.push(bilan(d));
  }
  writeFileSync(join(DOSSIER, 'index.json'), `${JSON.stringify(index, null, 1)}\n`);
  const vocal = index.reduce((n, x) => n + x.pistes, 0);
  console.log(`${index.length} histoires, ${vocal} pistes vocales.`);
}

function exporter(id, code, sortie) {
  if (!nomsLangues[code] && code !== 'en') throw new Error(`Langue inconnue : ${code}`);
  const d = lire(join(DOSSIER, id, 'pistes.json'));
  const tete = ['histoire', 'piste', 'type', 'partie', 'personnage', 'intonation', 'genre', 'duree_ms', 'francais', 'traduction'];
  const lignes = d.pistes.map((p) => [d.id, p.id, p.type, p.partie || '', p.personnage || '', p.intonation || '', p.genre || '', p.duree_ms || '', p.texte, p.langues?.[code]?.texte || ''].map(champCsv).join(';'));
  writeFileSync(sortie, `﻿${tete.join(';')}\n${lignes.join('\n')}\n`);
  console.log(`${d.pistes.length} lignes : ${sortie}`);
}

function importer(code, source) {
  const lignes = lireCsv(readFileSync(source, 'utf8')).filter((l) => l.traduction?.trim());
  const parHistoire = {};
  lignes.forEach((l) => { (parHistoire[l.histoire] = parHistoire[l.histoire] || []).push(l); });
  for (const [id, ls] of Object.entries(parHistoire)) {
    const f = join(DOSSIER, id, 'pistes.json');
    const d = lire(f);
    const parId = Object.fromEntries(d.pistes.map((p) => [p.id, p]));
    ls.forEach((l) => {
      const p = parId[l.piste];
      if (!p) { console.warn(`${id} : piste inconnue ${l.piste}`); return; }
      p.langues = { ...p.langues, [code]: { ...p.langues?.[code], texte: l.traduction.trim() } };
      delete p.langues[code].a_revoir;
    });
    writeFileSync(f, `${JSON.stringify(d, null, 1)}\n`);
  }
  console.log(`${lignes.length} traductions reprises.`);
  generer();
}

const [, , action, ...args] = process.argv;
if (action === 'exporter') exporter(...args);
else if (action === 'importer') importer(...args);
else generer();
