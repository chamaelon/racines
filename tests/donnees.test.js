import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { filtrer, versQuery } from '../src/components/filtres.js';
import { lireVtt } from '../src/components/lecteur-audio.js';
import { finsDe, Moteur } from '../src/engine/moteur.js';
import { validerDonnees, validerHistoire } from '../scripts/validate.js';

const { erreurs, recits, localites } = validerDonnees();
const parId = Object.fromEntries(localites.map((l) => [l.id, l]));
const lireHistoire = (id) => JSON.parse(readFileSync(`public/data/stories/${id}.json`, 'utf8'));

describe('contenu', () => {
  it('passe la validation', () => { expect(erreurs).toEqual([]); });
  it('couvre le minimum du sujet', () => {
    const n = (t) => recits.filter((r) => r.type === t).length;
    expect(recits.length).toBeGreaterThanOrEqual(8);
    expect(n('conte')).toBeGreaterThanOrEqual(3);
    expect(n('legende')).toBeGreaterThanOrEqual(3);
    expect(n('histoire')).toBeGreaterThanOrEqual(2);
    expect(new Set(localites.map((l) => l.region)).size).toBeGreaterThanOrEqual(6);
    expect(recits.filter((r) => r.jouable).length).toBe(recits.length);
    const audio = recits.filter((r) => ['mos', 'dyu', 'fuf'].some((l) => r.audio[l]));
    expect(audio.length).toBeGreaterThanOrEqual(3);
    expect(new Set(audio.flatMap((r) => Object.keys(r.audio))).size).toBeGreaterThanOrEqual(3);
  });
});

describe('validation des graphes', () => {
  const ok = { id: 'h', start: 'a', nodes: { a: { next: 'b' }, b: { end: 'x' } } };
  it('accepte un graphe correct', () => { expect(validerHistoire(ok)).toEqual([]); });
  it('détecte une cible cassée', () => {
    const e = validerHistoire({ ...ok, nodes: { a: { next: 'zzz' }, b: { end: 'x' } } });
    expect(e.join()).toContain('zzz');
  });
  it('détecte un nœud inatteignable', () => {
    const e = validerHistoire({ ...ok, nodes: { ...ok.nodes, seul: { end: 'y' } } });
    expect(e.join()).toContain('seul');
  });
  it('détecte une boucle sans fin', () => {
    const e = validerHistoire({ id: 'h', start: 'a', nodes: { a: { next: 'c' }, c: { next: 'a' }, d: { end: 'x' } } });
    expect(e.join()).toContain('ne mène à aucune fin');
  });
  it('détecte un cul-de-sac', () => {
    const e = validerHistoire({ id: 'h', start: 'a', nodes: { a: {} } });
    expect(e.join()).toContain('cul-de-sac');
  });
  it('détecte un décor et un objet inconnus', () => {
    const e = validerHistoire({ id: 'h', start: 'a', personnages: {}, nodes: { a: { scene: 'mars', explore: ['ovni'], end: 'x' } } });
    expect(e.join()).toContain('mars');
    expect(e.join()).toContain('ovni');
  });
});

describe('filtres du catalogue', () => {
  const f = (o) => filtrer(recits, o, { localitesParId: parId }).map((r) => r.id);
  it('sans filtre, tout passe', () => { expect(f({}).length).toBe(recits.length); });
  it('filtre par type, région, langue, audio', () => {
    expect(filtrer(recits, { type: 'histoire' }, {}).every((r) => r.type === 'histoire')).toBe(true);
    expect(f({ region: 'nakambe' })).toContain('yennenga');
    expect(f({ region: 'nakambe' })).not.toContain('silures-dafra');
    expect(f({ langue: 'dyu' })).toContain('tiefo-amoro');
    expect(f({ audio: true })).toContain('naaba-wobgo');
    expect(f({ audio: true })).not.toContain('kinkirsi');
  });
  it('combine les filtres', () => { expect(f({ type: 'conte', q: 'lievre' })).toEqual(['lievre-hyene']); });
  it('cherche sans tenir compte des accents ni de la casse', () => {
    expect(f({ q: 'LIEVRE' })).toContain('lievre-hyene');
    expect(f({ q: 'legende de yennenga' })).toContain('yennenga');
    expect(f({ q: 'fespaco' })).toContain('yennenga');
    expect(f({ q: 'zzzz' })).toEqual([]);
  });
  it('écrit les filtres dans l\'URL', () => {
    expect(versQuery({ q: '', type: 'conte', audio: true })).toBe('type=conte&audio=1');
  });
});

describe('sous-titres', () => {
  it('lit un fichier WebVTT', () => {
    const q = lireVtt('WEBVTT\n\n00:00:00.000 --> 00:00:02.500\nBonjour.\n\n00:01:02.000 --> 00:01:03.000\nÀ bientôt.\n');
    expect(q).toEqual([{ debut: 0, fin: 2.5, texte: 'Bonjour.' }, { debut: 62, fin: 63, texte: 'À bientôt.' }]);
  });
});

// Joue chaque histoire réelle par tous les chemins : chaque fin doit être atteignable.
describe('histoires jouables', () => {
  async function explorerTout(h) {
    const atteintes = new Set();
    const resultats = { course_cheval: ['win', 'lose'], devinette: ['win', 'lose'], rythme: ['win', 'lose'] };
    async function jouer(scenario) {
      let i = 0;
      const branches = [];
      const decision = (n) => { const v = scenario[i] ?? 0; if (i >= scenario.length) branches.push(n); i++; return v; };
      const ui = {
        decor: async () => {}, etat: () => {}, dire: async () => {}, explorer: async () => {},
        choisir: async (cs) => cs[decision(cs.length)],
        miniJeu: async (nom) => resultats[nom][decision(2)],
        fin: async (id, cs) => { atteintes.add(id); return cs[0] && decision(2) === 0 && i < 12 ? cs[0] : null; },
      };
      await new Moteur(h, ui).jouer();
      return branches;
    }
    const pile = [[]];
    let essais = 0;
    while (pile.length && essais++ < 400) {
      const s = pile.pop();
      const b = await jouer(s);
      let base = s;
      b.forEach((n) => {
        for (let v = 1; v < n; v++) pile.push([...base, v]);
        base = [...base, 0];
      });
    }
    return atteintes;
  }
  for (const { id } of recits) {
    it(`${id} : toutes les fins sont atteignables`, async () => {
      const h = lireHistoire(id);
      expect(await explorerTout(h)).toEqual(new Set(finsDe(h)));
      expect(finsDe(h).length).toBeGreaterThanOrEqual(2);
      expect(Object.values(h.nodes).some((n) => n.choices)).toBe(true);
      expect(Object.values(h.nodes).some((n) => n.explore || n.minigame)).toBe(true);
      finsDe(h).forEach((f) => expect(h.fins[f]).toBeTruthy());
    });
  }
});
