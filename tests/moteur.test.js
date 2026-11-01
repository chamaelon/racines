import { describe, expect, it } from 'vitest';
import { appliquer, correspond, finsDe, Moteur } from '../src/engine/moteur.js';

// Un écran factice : il suit un scénario de choix et note tout ce que le moteur lui demande.
function uiFactice({ choix = [], miniJeux = {}, finChoix } = {}) {
  const j = { dits: [], decors: [], fins: [], explores: [] };
  return {
    journal: j,
    decor: async (n) => { j.decors.push(n); },
    etat: () => {},
    dire: async (n) => { j.dits.push(n.text); },
    explorer: async (ids) => { j.explores.push(ids); },
    choisir: async (cs) => cs[choix.shift()],
    miniJeu: async (nom) => miniJeux[nom],
    fin: async (id, cs) => { j.fins.push(id); return finChoix ? finChoix(cs) : null; },
  };
}

const HISTOIRE = {
  id: 't', start: 'a',
  nodes: {
    a: { scene: 'palais', speaker: 'g', text: 'A', next: 'c1' },
    c1: { speaker: 'g', text: 'Choix', choices: [
      { label: 'Courage', next: 'b', add: { courage: 2 }, set: { vu: true }, tag: 'brave' },
      { label: 'Peur', next: 'b', tag: 'peureux' },
    ] },
    b: { route: [{ when: { courage: { gte: 2 } }, next: 'mini' }, { when: { vu: true }, next: 'jamais' }], next: 'finB' },
    mini: { explore: ['canari'], minigame: 'course_cheval', tags: { win: 'gagné' }, route: [{ when: { course: 'win' }, next: 'finA' }], next: 'finB' },
    jamais: { end: 'jamais' },
    finA: { scene: 'nuit', speaker: 'g', text: 'Fin A', end: 'a' },
    finB: { speaker: 'g', text: 'Fin B', end: 'b' },
  },
};

describe('conditions', () => {
  it('compare les valeurs exactes et gte', () => {
    expect(correspond({ x: 1 }, { x: 1 })).toBe(true);
    expect(correspond({ x: 1 }, { x: 2 })).toBe(false);
    expect(correspond({ x: { gte: 2 } }, { x: 3 })).toBe(true);
    expect(correspond({ x: { gte: 2 } }, { x: 1 })).toBe(false);
    expect(correspond({ x: { gte: 1 } }, {})).toBe(false);
    expect(correspond({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
  });
  it('applique set et add', () => {
    const v = { n: 1 };
    appliquer({ set: { a: true }, add: { n: 2, m: 1 } }, v);
    expect(v).toEqual({ n: 3, a: true, m: 1 });
  });
});

describe('moteur', () => {
  it('avance, change de décor et atteint une fin', async () => {
    const ui = uiFactice({ choix: [1] });
    const m = new Moteur(HISTOIRE, ui);
    await m.jouer();
    expect(ui.journal.dits).toEqual(['A', 'Choix', 'Fin B']);
    expect(ui.journal.decors).toEqual(['palais']);
    expect(ui.journal.fins).toEqual(['b']);
    expect(m.parcours).toEqual(['peureux']);
  });

  it('les choix changent la suite, le mini-jeu aussi', async () => {
    const gagne = uiFactice({ choix: [0], miniJeux: { course_cheval: 'win' } });
    const m = new Moteur(HISTOIRE, gagne);
    await m.jouer();
    expect(m.vars.courage).toBe(2);
    expect(m.vars.course).toBe('win');
    expect(gagne.journal.explores).toEqual([['canari']]);
    expect(gagne.journal.decors).toEqual(['palais', 'nuit']);
    expect(gagne.journal.fins).toEqual(['a']);
    expect(m.parcours).toEqual(['brave', 'gagné']);

    const perd = uiFactice({ choix: [0], miniJeux: { course_cheval: 'lose' } });
    await new Moteur(HISTOIRE, perd).jouer();
    expect(perd.journal.fins).toEqual(['b']);
  });

  it('sauvegarde à chaque nœud, et efface à la fin', async () => {
    const saves = [];
    const m = new Moteur(HISTOIRE, uiFactice({ choix: [1] }), { sauver: (s) => saves.push(s) });
    await m.jouer();
    expect(saves[0]).toMatchObject({ noeud: 'a', vars: {}, parcours: [] });
    expect(saves.at(-1)).toBeNull();
  });

  it('reprend sans appliquer deux fois les effets du nœud', async () => {
    const h = { id: 'r', start: 'x', nodes: { x: { add: { n: 1 }, next: 'y' }, y: { add: { n: 1 }, route: [{ when: { n: { gte: 3 } }, next: 'fin' }], next: 'non' }, fin: { end: 'ok' }, non: { end: 'non' } } };
    const ui = uiFactice();
    const m = new Moteur(h, ui);
    await m.jouer({ noeud: 'y', vars: { n: 2 }, parcours: ['p'], scene: 'nuit' });
    expect(m.vars.n).toBe(3);
    expect(ui.journal.decors).toEqual(['nuit']);
    expect(ui.journal.fins).toEqual(['ok']);
    expect(m.parcours).toEqual(['p']);
  });

  it('une fin peut relancer, avec remise à zéro', async () => {
    const h = { id: 'z', start: 's', nodes: { s: { add: { n: 1 }, next: 'f' }, f: { end: 'x' } } };
    let tours = 0;
    const ui = uiFactice({ finChoix: () => (tours++ === 0 ? { next: 's', reset: true } : null) });
    const m = new Moteur(h, ui);
    await m.jouer();
    expect(ui.journal.fins).toEqual(['x', 'x']);
    expect(m.vars.n).toBe(1);
  });

  it('signale un nœud inconnu', async () => {
    const m = new Moteur({ start: 'a', nodes: { a: { next: 'zzz' } } }, uiFactice());
    await expect(m.jouer()).rejects.toThrow('Nœud inconnu');
  });

  it('compte les fins distinctes', () => {
    expect(finsDe(HISTOIRE)).toEqual(['jamais', 'a', 'b']);
  });
});
