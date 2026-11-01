/*
 * Le moteur de narration : parcourt un graphe de nœuds, 100 % données.
 * Il ne connaît ni le DOM ni Three.js : tout passe par l'objet ui, ce qui le rend testable.
 *
 * scene    : décor à charger            speaker : qui parle
 * text     : réplique                   next    : nœud suivant
 * choices  : [{label, next, set, add, tag, reset}]
 * route    : [{when:{var:valeur | {gte:n}}, next}]  (aiguillage)
 * set/add  : modifier les variables     explore : objets à découvrir
 * minigame : mini-épreuve               end     : fin de l'histoire
 * audio    : doublage en langue nationale, par code de langue
 */
const VARIABLE_MINIJEU = { course_cheval: 'course', devinette: 'devinette', rythme: 'rythme' };

export function correspond(when, vars) {
  return Object.entries(when).every(([k, v]) => (v && typeof v === 'object' && 'gte' in v ? (vars[k] || 0) >= v.gte : vars[k] === v));
}

export function appliquer(o, vars) {
  if (o.set) Object.assign(vars, o.set);
  if (o.add) for (const k in o.add) vars[k] = (vars[k] || 0) + o.add[k];
}

export const finsDe = (histoire) => [...new Set(Object.values(histoire.nodes).filter((n) => n.end).map((n) => n.end))];

export class Moteur {
  constructor(histoire, ui, { sauver = () => {}, surFin = () => {} } = {}) {
    this.h = histoire;
    this.ui = ui;
    this.sauver = sauver;
    this.surFin = surFin;
    this.vars = {};
    this.parcours = [];
    this.noeud = null;
    this.scene = null;
    this.arrete = false;
  }

  get nbNoeuds() { return Object.keys(this.h.nodes).length; }

  arreter() { this.arrete = true; }

  // sauvegarde : { noeud, vars, parcours, scene } pour reprendre ; sinon on part du début.
  async jouer(sauvegarde) {
    let id = this.h.start;
    if (sauvegarde && this.h.nodes[sauvegarde.noeud]) {
      id = sauvegarde.noeud;
      this.vars = { ...sauvegarde.vars };
      this.parcours = [...sauvegarde.parcours];
      if (sauvegarde.scene) { this.scene = sauvegarde.scene; await this.ui.decor(this.scene); }
    }
    while (id && !this.arrete) id = await this.pas(id);
  }

  async pas(id) {
    const n = this.h.nodes[id];
    if (!n) throw new Error(`Nœud inconnu : ${id}`);
    this.noeud = id;
    // On sauvegarde avant d'appliquer le nœud : à la reprise, ses set/add ne comptent qu'une fois.
    this.sauver({ noeud: id, vars: { ...this.vars }, parcours: [...this.parcours], scene: this.scene });
    appliquer(n, this.vars);
    if (n.scene && n.scene !== this.scene) { this.scene = n.scene; await this.ui.decor(n.scene); }
    this.ui.etat(this, n);
    if (n.text) await this.ui.dire(n, { tenir: !!(n.choices || n.explore) });
    if (this.arrete) return null;
    if (n.explore) await this.ui.explorer(n.explore);
    if (n.minigame) {
      const resultat = await this.ui.miniJeu(n.minigame, n);
      this.vars[VARIABLE_MINIJEU[n.minigame] || n.minigame] = resultat;
      if (n.tags && n.tags[resultat]) this.parcours.push(n.tags[resultat]);
      this.ui.etat(this, n);
    }
    if (this.arrete) return null;
    if (n.end) {
      this.sauver(null);
      this.surFin(n.end);
      const c = await this.ui.fin(n.end, n.choices || []);
      return c ? this.choisir(c) : null;
    }
    if (n.choices) return this.choisir(await this.ui.choisir(n.choices));
    if (n.route) {
      const trouve = n.route.find((r) => correspond(r.when, this.vars));
      if (trouve) return trouve.next;
    }
    return n.next;
  }

  choisir(c) {
    appliquer(c, this.vars);
    if (c.reset) { this.vars = {}; this.parcours = []; } else if (c.tag) this.parcours.push(c.tag);
    this.ui.etat(this, this.h.nodes[this.noeud]);
    return c.next;
  }
}
