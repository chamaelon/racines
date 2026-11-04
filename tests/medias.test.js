import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { champsTexte, partTraduite, traduire } from '../src/engine/traduction.js';
import { cartonA, choisirPiste, formaterTemps, horsSynchro, langueDuNom, trierPistes } from '../src/engine/film.js';
import { compilerModeles, traduirePhrase } from '../src/i18n.js';
import { analyserNom, motifPourRecit, optionsMotif } from '../src/motifs.js';
import { crans, cransDuRecit, dansCran, etapesFiltrees } from '../src/voyage.js';

const lire = (f) => JSON.parse(readFileSync(join('public', f), 'utf8'));
const voyages = lire('data/voyages.json');

describe('les motifs', () => {
  it('lit le nom type-objet-numero.png, même si l\'objet contient un tiret', () => {
    expect(analyserNom('vetement-griot-1.png')).toMatchObject({ type: 'vetement', objet: 'griot', numero: 1 });
    expect(analyserNom('chapeau-chapeau-peul-12.png')).toMatchObject({ type: 'chapeau', objet: 'chapeau-peul', numero: 12 });
    expect(analyserNom('vetement-jeune_fille-2.png')).toMatchObject({ objet: 'jeune_fille' });
  });

  it('refuse les autres noms', () => {
    for (const f of ['canari.png', 'canari-1.png', 'Poterie-canari-1.png', 'poterie-canari-1.jpg']) expect(analyserNom(f)).toBeNull();
  });

  const motifs = {
    images: { canari: [{ fichier: 'poterie-canari-1.png', numero: 1 }, { fichier: 'poterie-canari-2.png', numero: 2 }] },
    peuples: { Bissa: { composition: { forme: 'triangle' } }, Lyela: { images: { canari: 'poterie-canari-2.png' } } },
  };

  it('ne met une composition que sur un objet commun', () => {
    expect(optionsMotif('tambour', motifs).length).toBe(0);
    expect(optionsMotif('canari', motifs, { commun: true }).filter((o) => o.demo)).toHaveLength(1);
  });

  it('dans le jeu, le peuple du récit prime, puis la première image', () => {
    expect(motifPourRecit('canari', motifs, { peuple: 'Lyela' }).image).toBe('poterie-canari-2.png');
    expect(motifPourRecit('canari', motifs, { peuple: 'Bissa', commun: true }).composition).toBeTruthy();
    expect(motifPourRecit('canari', motifs, { peuple: 'Mossi' }).image).toBe('poterie-canari-1.png');
    expect(motifPourRecit('griot', motifs, { peuple: 'Mossi' })).toBeNull();
  });

  it('les compositions fournies utilisent des formes connues', () => {
    for (const p of Object.values(lire('motifs/peuples.json'))) {
      expect(['triangle', 'carre', 'losange', 'cercle']).toContain(p.composition.forme);
      expect(['haut', 'milieu', 'bas', 'partout']).toContain(p.composition.position);
    }
  });
});

describe('les traductions', () => {
  const d = { Carte: 'Map', 'Région {}': '{} region', '{} récit{}': '{} stories', Nakambé: 'Nakambe' };
  const m = compilerModeles(d);
  const t = (x) => traduirePhrase(x, d, m);

  it('traduit une phrase exacte en gardant ses espaces', () => { expect(t('  Carte\n')).toBe('  Map\n'); });
  it('une phrase inconnue reste en français', () => { expect(t('Autre phrase')).toBe('Autre phrase'); });
  it('garde ce qui varie, et le traduit à son tour', () => { expect(t('Région Nakambé')).toBe('Nakambe region'); });
  it('le pluriel ne capture pas n\'importe quel texte', () => {
    expect(t('3 récits')).toBe('3 stories');
    expect(t('1 récit')).toBe('1 stories');
    expect(t('Un récit et une suite')).toBe('Un récit et une suite');
  });
  it('un dictionnaire vide laisse tout en français', () => { expect(traduirePhrase('Carte', {}, [])).toBe('Carte'); });

  it('le fichier modèle est vide à droite et contient tous les textes des histoires', () => {
    const modele = lire('traductions/translate-exemple.json');
    expect(Object.entries(modele).every(([k, v]) => k === '@langue' || v === '')).toBe(true);
    for (const r of lire('data/recits.json')) {
      for (const c of champsTexte(lire(`data/${r.jouable}`))) if (!/^\d+$/.test(c.texte)) expect(modele, c.texte).toHaveProperty([c.texte]);
    }
  });

  it('le dictionnaire traduit une histoire, et pistes.json prime sur lui', () => {
    const h = lire('data/stories/yennenga.json');
    const pistes = lire('bandes-son/yennenga/pistes.json');
    const dico = { [h.nodes[h.start].text]: 'mot', [h.titre]: 'autre titre' };
    expect(traduire(h, null, 'mos', dico).nodes[h.start].text).toBe('mot');
    expect(traduire(h, pistes, 'en', dico).titre).toBe('The Legend of Yennenga');
    expect(traduire(h, null, 'fr', dico).nodes[h.start].text).toBe(h.nodes[h.start].text);
    expect(partTraduite(h, dico)).toBeGreaterThan(0);
  });
});

describe('la barre de temps', () => {
  const liste = crans(voyages);

  it('suit la chronologie, époques sans date comprises', () => {
    expect(liste[0].epoque).toBe('origines');
    expect(liste[liste.length - 1].epoque).toBe('aujourdhui');
    const dates = liste.filter((c) => c.debut).map((c) => c.debut);
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
    expect(liste.find((c) => c.debut === 1915).epoque).toBe('guerre');
  });

  it('chaque année d\'une étape tombe dans un cran de son époque', () => {
    for (const es of Object.values(voyages.recits)) {
      for (const e of es.filter((x) => x.annee)) expect(liste.some((c) => c.debut && dansCran(e, c)), e.titre).toBe(true);
    }
  });

  it('une étape datée ne suit que son année ; une étape sans date reste sur toute son époque', () => {
    const c1916 = liste.find((c) => c.debut === 1916);
    const titres = etapesFiltrees(voyages, { epoque: 'guerre', debut: 1916, fin: 1916 }).map((e) => e.titre);
    expect(c1916).toBeTruthy();
    expect(titres).toContain('1916 : les ruines');
    expect(titres).not.toContain('1915 à Datomon');
    expect(titres).toContain('Le recrutement');
  });

  it.each(Object.keys(voyages.recits))('%s : chaque étape a son cran dans le jeu', (id) => {
    const l = cransDuRecit(voyages, id);
    expect(l.map((c) => c.etape).sort((a, b) => a - b)).toEqual(voyages.recits[id].map((_, i) => i));
  });
});

describe('les films', () => {
  const pistes = [{ code: 'fr' }, { code: 'mos' }, { code: 'zxx' }];

  it('lit le nom des exports du montage', () => {
    expect(langueDuNom('03-wuro-pilon-video.mp4')).toEqual({ film: '03-wuro-pilon', piste: 'video' });
    expect(langueDuNom('03-wuro-pilon-mos.wav')).toEqual({ film: '03-wuro-pilon', piste: 'mos' });
    expect(langueDuNom('23-yennenga-FR.MP3')).toEqual({ film: '23-yennenga', piste: 'fr' });
    for (const f of ['wuro-mos.wav', '03-wuro-pilon.mp4', 'Timeline 1.wav']) expect(langueDuNom(f)).toBeNull();
  });

  it('range les pistes : le français, les langues, puis le film sans voix', () => {
    expect(trierPistes(['zxx', 'mos', 'fr', 'dyu'])).toEqual(['fr', 'dyu', 'mos', 'zxx']);
  });

  it('préfère la voix choisie, puis la langue du site, puis le français', () => {
    expect(choisirPiste(pistes, 'mos', 'fr')).toBe('mos');
    expect(choisirPiste(pistes, '', 'mos')).toBe('mos');
    expect(choisirPiste(pistes, 'dyu', 'en')).toBe('fr');
    expect(choisirPiste([{ code: 'zxx' }], 'mos', 'fr')).toBe('zxx');
    expect(choisirPiste([], 'mos', 'fr')).toBeNull();
  });

  it('recale le son seulement quand l\'écart s\'entend, et pas après la fin de la piste', () => {
    expect(horsSynchro(10, 10.1, 300)).toBe(false);
    expect(horsSynchro(10, 11, 300)).toBe(true);
    expect(horsSynchro(310, 300, 300)).toBe(false);
    expect(horsSynchro(10, 11, NaN)).toBe(true);
  });

  it('affiche les cartons à leur moment', () => {
    const c = [{ de: 2, a: 7, titre: 'Titre' }];
    expect(cartonA(c, 1.9)).toBeNull();
    expect(cartonA(c, 2)?.titre).toBe('Titre');
    expect(cartonA(c, 7)).toBeNull();
    expect(formaterTemps(352)).toBe('5:52');
  });

  it('chaque film du manifeste correspond à un récit, et tout son texte à l\'écran a un titre', () => {
    const films = lire('data/films.json');
    const ids = new Set(lire('data/recits.json').map((r) => r.film));
    for (const [id, f] of Object.entries(films)) {
      expect(ids.has(id)).toBe(true);
      expect(f.video).toBe(`films/${id}/video.mp4`);
      f.cartons.forEach((c) => { expect(c.titre).toBeTruthy(); expect(c.a).toBeGreaterThan(c.de); expect(c.a).toBeLessThanOrEqual(f.duree + 0.1); });
    }
  });
});
