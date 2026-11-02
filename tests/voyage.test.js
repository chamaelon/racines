import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { champsTexte, traduire, voixDe } from '../src/engine/traduction.js';
import { Moteur } from '../src/engine/moteur.js';
import { varianteDecor } from '../src/scenes3d/ambiances.js';
import { etapeParNoeud, etapesFiltrees, lieuDe } from '../src/voyage.js';

const lire = (f) => JSON.parse(readFileSync(join('public', f), 'utf8'));
const voyages = lire('data/voyages.json');
const localites = lire('data/localites.json');
const histoire = (id) => lire(`data/stories/${id}.json`);
const ids = Object.keys(voyages.recits);

// Un écran qui prend toujours le premier choix : suffisant pour vérifier qu'on arrive au bout.
const uiAuto = (j) => ({
  decor: async () => {}, etat: () => {}, dire: async () => {}, explorer: async () => {},
  choisir: async (cs) => cs[0], miniJeu: async () => 'win',
  fin: async (f) => { j.fin = f; return null; },
});

describe('le voyage dans le temps et l\'espace', () => {
  it('couvre les 34 récits', () => { expect(ids).toHaveLength(lire('data/recits.json').length); });

  it.each(ids)('%s : chaque étape existe, avec un décor, un lieu et une époque connus', (id) => {
    const h = histoire(id);
    for (const e of voyages.recits[id]) {
      expect(h.nodes[e.noeud], e.noeud).toBeTruthy();
      expect(h.nodes[e.noeud].scene, `${e.noeud} sans décor`).toBeTruthy();
      expect(lieuDe(e.lieu, voyages, localites), e.lieu).toBeTruthy();
      expect(voyages.epoques.some((p) => p.id === e.epoque), e.epoque).toBe(true);
    }
  });

  it.each(ids)('%s : de chaque étape, on arrive à une fin', async (id) => {
    const h = histoire(id);
    for (const e of voyages.recits[id]) {
      const j = {};
      await new Moteur(h, uiAuto(j)).jouer({ noeud: e.noeud, vars: {}, parcours: [], scene: null });
      expect(j.fin, `${id}, depuis ${e.noeud}`).toBeTruthy();
    }
  });

  it('range chaque nœud dans une étape', () => {
    const h = histoire('loropeni');
    const carte = etapeParNoeud(h, voyages.recits.loropeni);
    expect(Object.keys(h.nodes).every((n) => carte[n] !== undefined)).toBe(true);
    expect(carte.n2).toBe(1);
  });

  it('un récit peut traverser plusieurs époques et plusieurs lieux', () => {
    expect(new Set(voyages.recits.loropeni.map((e) => e.epoque)).size).toBeGreaterThan(1);
    expect(new Set(voyages.recits.yennenga.map((e) => e.lieu)).size).toBeGreaterThan(1);
  });

  it('filtre par époque et par lieu', () => {
    const guerre = etapesFiltrees(voyages, { epoque: 'guerre' });
    expect(new Set(guerre.map((e) => e.recit))).toEqual(new Set(['tenin-1915', 'bona-1915']));
    expect(etapesFiltrees(voyages, { epoque: 'guerre', lieu: 'bona' }).every((e) => e.recit === 'bona-1915')).toBe(true);
    expect(etapesFiltrees(voyages, { lieu: 'gambaga' }).every((e) => e.recit === 'yennenga')).toBe(true);
  });
});

describe('les bandes-son et la traduction', () => {
  it.each(ids)('%s : chaque texte du jeu a sa piste', (id) => {
    const p = lire(`bandes-son/${id}/pistes.json`);
    const chemins = new Set(p.pistes.map((x) => x.chemin));
    for (const c of champsTexte(histoire(id))) expect(chemins.has(c.chemin), c.chemin).toBe(true);
  });

  it('chaque réplique a les champs de la fiche', () => {
    const p = lire('bandes-son/gazelle/pistes.json').pistes.filter((x) => x.type === 'replique' || x.type === 'film');
    for (const x of p) {
      for (const k of ['partie', 'personnage', 'intonation', 'texte', 'genre']) expect(x[k], `${x.id}.${k}`).toBeTruthy();
      expect(x.duree_ms).toBeGreaterThan(0);
      expect(x.genre).toMatch(/\//);
    }
  });

  it('les films gardent leur horodatage', () => {
    const f = lire('bandes-son/yennenga/pistes.json').pistes.find((x) => x.id === 'film-001');
    expect(f.horodatage).toEqual({ debut_ms: 2000, fin_ms: 7600 });
    expect(f.duree_statut).toContain('mesurée');
  });

  it('traduit sans toucher à l\'original et garde le français à défaut', () => {
    const h = histoire('yennenga');
    const p = { id: 'yennenga', pistes: [{ chemin: 'nodes.intro.text', langues: { en: { texte: 'Hello' } } }, { chemin: 'nodes.choix1.choices.0.label', langues: { en: { texte: 'Sow' } } }] };
    const t = traduire(h, p, 'en');
    expect(t.nodes.intro.text).toBe('Hello');
    expect(t.nodes.choix1.choices[0].label).toBe('Sow');
    expect(t.nodes.choix1.choices[1].label).toBe(h.nodes.choix1.choices[1].label);
    expect(h.nodes.intro.text).not.toBe('Hello');
    expect(traduire(h, p, 'mos').nodes.intro.text).toBe(h.nodes.intro.text);
  });

  it('les récits pilotes sont entièrement en anglais', () => {
    for (const id of ['yennenga', 'gazelle']) {
      const b = lire('bandes-son/index.json').find((x) => x.id === id);
      expect(b.langues.en.texte).toBe(100);
    }
  });

  it('ne joue une voix que si elle est enregistrée', () => {
    const p = { id: 'x', pistes: [{ type: 'replique', noeud: 'a', langues: { mos: { texte: 't', statut: 'a_enregistrer' }, dyu: { statut: 'enregistre', fichier: 'dyu/a.mp3' } } }] };
    expect(voixDe(p, 'a', 'mos')).toBeNull();
    expect(voixDe(p, 'a', 'dyu')).toBe('bandes-son/x/dyu/a.mp3');
    expect(voixDe(p, 'b', 'dyu')).toBeNull();
  });
});

describe('les modèles 3D', () => {
  const existe = (f) => existsSync(join('public/modeles', f));
  it('chaque objet du patrimoine a son modèle et sa vignette', () => {
    for (const p of lire('data/patrimoine.json')) {
      expect(existe(`patrimoine/${p.id}.glb`), p.id).toBe(true);
      expect(existe(`vignettes/${p.id}.webp`), p.id).toBe(true);
    }
  });
  it('chaque fiche dit à quel peuple elle se rattache et jusqu\'où elle est fidèle', () => {
    for (const p of lire('data/patrimoine.json')) {
      expect(p.peuples?.length, p.id).toBeGreaterThan(0);
      expect(p.fidelite, p.id).toBeTruthy();
    }
  });
  it('chaque style de personnage et chaque décor des histoires existe', () => {
    for (const f of readdirSync('public/data/stories')) {
      const h = lire(`data/stories/${f}`);
      for (const c of Object.values(h.personnages)) {
        expect(existe(`personnages/${c.style}.glb`), c.style).toBe(true);
        expect(existe(`portraits/${c.style}.webp`), c.style).toBe(true);
      }
      for (const n of Object.values(h.nodes)) if (n.scene) expect(existe(`decors/${varianteDecor(h.id, n.scene)}.glb`), n.scene).toBe(true);
    }
  });
});
