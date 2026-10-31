/*
 * Racines — casting réutilisable entre les histoires.
 *
 * Chaque fiche décrit le CORPS (invariable : taille, forme de tête, carrure, visage).
 * Les HABITS (costume) se changent par histoire : voir `costume` par défaut ci-dessous et
 * les surcharges dans histoires/<n>/costumes.js. Règle : deux personnages d'une même scène
 * doivent différer d'au moins deux traits parmi taille, forme de tête, carrure, coiffure.
 *
 * Champs : taille (px à l'échelle 1), jambes (part de la taille), teteR, tete.forme
 * (rond | ovale | carre | poire | long | masque | cornu), corps (plein | fil), epaules, hanches,
 * epaisseur des membres, yeux (ronds | grands | amande | petits | braise), sourcils,
 * nez (rond | long | large | aucun), cheveux (ras | brosse | touffes | tresses | chignon |
 * zigzag | aucun), barbe (barbiche | longue | courte), joues, scarif, pose par défaut.
 */
window.CASTING = {
  // C01 — Géant lumineux. Rôles : Wuro (dieu créateur bobo/bwa), autres divinités créatrices.
  geant: {
    id: 'C01', nom: 'Le Géant lumineux', taille: 430, jambes: 0.44, teteR: 40,
    tete: { forme: 'ovale', l: 0.9, h: 1.15 }, corps: 'plein', epaules: 34, hanches: 26,
    epaisseur: 13, peau: '#d9a55b', yeux: 'amande', sourcils: 'fins', sourcilsCouleur: '#f4ecd8',
    nez: 'long', cheveux: 'aucun', barbe: 'longue', barbeCouleur: '#f6f1e3', halo: '#ffe7a3',
    costume: { haut: { type: 'boubou', couleur: '#e8b04a', motif: 'chevrons', motifCouleur: '#fff1c2', long: 1.9 }, manches: '#e8b04a', collier: '#fff1c2' },
  },

  // C02 — Petite femme ronde. Rôles : Hamé (femme au pilon), mères, vendeuses.
  ronde: {
    id: 'C02', nom: 'La Mère ronde', taille: 205, jambes: 0.34, teteR: 30,
    tete: { forme: 'rond', l: 1.05, h: 1 }, corps: 'plein', epaules: 22, hanches: 36,
    epaisseur: 9, peau: '#7b4a2b', yeux: 'grands', sourcils: 'fins', nez: 'rond',
    cheveux: 'aucun', joues: true,
    costume: { haut: { type: 'camisole', couleur: '#d9653b' }, bas: { type: 'jupe', couleur: '#2f6c8f', motif: 'points', motifCouleur: '#f2c14e' }, tete: { type: 'foulard', couleur: '#e9c46a' }, collier: '#f4e3b5' },
  },

  // C03 — Colosse carré. Rôles : Bado le forgeron, guerriers, chefs de forge.
  colosse: {
    id: 'C03', nom: 'Le Colosse', taille: 275, jambes: 0.38, teteR: 30,
    tete: { forme: 'carre', l: 1.15, h: 1 }, corps: 'plein', epaules: 46, hanches: 30,
    epaisseur: 13, peau: '#4a2a18', yeux: 'petits', sourcils: 'epais', nez: 'large',
    cheveux: 'ras', barbe: 'courte', scarif: true,
    costume: { bas: { type: 'short', couleur: '#6b4a2b' }, ceinture: '#2b1a0e', bracelets: '#c0c0c0' },
  },

  // C04 — Grand jeune homme filiforme. Rôles : Sanou, chasseurs (Rialé…), messagers.
  filiforme: {
    id: 'C04', nom: 'Le Grand Mince', taille: 295, jambes: 0.5, teteR: 24,
    tete: { forme: 'long', l: 0.85, h: 1.3 }, corps: 'fil', epaules: 14, hanches: 12,
    epaisseur: 7, peau: '#6a3d22', yeux: 'ronds', sourcils: 'fins', nez: 'long',
    cheveux: 'brosse',
    costume: { haut: { type: 'tunique', couleur: '#e8dcc0', motif: 'chevrons', motifCouleur: '#8a5a2b' }, bas: { type: 'short', couleur: '#3e5f3a' }, manches: '#e8dcc0' },
  },

  // C05 — Enfant à grosse tête. Rôles : Tiko, enfants, apprentis.
  enfant: {
    id: 'C05', nom: "L'Enfant", taille: 135, jambes: 0.36, teteR: 27,
    tete: { forme: 'rond', l: 1, h: 1 }, corps: 'plein', epaules: 13, hanches: 12,
    epaisseur: 7, peau: '#8a5432', yeux: 'grands', sourcils: 'fins', nez: 'aucun',
    cheveux: 'touffes', boucheL: 0.26,
    costume: { haut: { type: 'tunique', couleur: '#f2c14e' }, bas: { type: 'short', couleur: '#9b3d2a' } },
  },

  // C06 — Ancien voûté. Rôles : Yéli (l'Ancien), devins, chefs de terre, sages.
  ancien: {
    id: 'C06', nom: "L'Ancien voûté", taille: 225, jambes: 0.42, teteR: 27,
    tete: { forme: 'poire', l: 0.95, h: 1.1 }, corps: 'fil', epaules: 14, hanches: 12,
    epaisseur: 7, peau: '#5e3a22', yeux: 'petits', sourcils: 'epais', sourcilsCouleur: '#e8e2d2',
    nez: 'large', cheveux: 'aucun', barbe: 'barbiche', barbeCouleur: '#ebe6da',
    pose: { lean: 14, tete: -6 },
    costume: { haut: { type: 'boubou', couleur: '#8b5e3c', motif: 'bandes', motifCouleur: '#e3cf8f', long: 1.5 }, tete: { type: 'bonnet', couleur: '#b23a2a' }, manches: '#8b5e3c' },
  },

  // C07 — Jeune femme élancée au chignon. Rôles : villageoise, Yennenga, Téné, reines.
  elancee: {
    id: 'C07', nom: 'La Jeune Femme élancée', taille: 255, jambes: 0.46, teteR: 25,
    tete: { forme: 'ovale', l: 0.88, h: 1.1 }, corps: 'plein', epaules: 16, hanches: 20,
    epaisseur: 7, peau: '#6d4026', yeux: 'amande', sourcils: 'fins', nez: 'rond',
    cheveux: 'chignon',
    costume: { haut: { type: 'camisole', couleur: '#5b8c5a' }, bas: { type: 'jupe', couleur: '#c8553d', motif: 'chevrons', motifCouleur: '#f4e3b5' }, collier: '#e9c46a' },
  },

  // C08 — Homme moyen trapu. Figurant récurrent (cultivateur, villageois, soldat).
  trapu: {
    id: 'C08', nom: 'Le Villageois trapu', taille: 235, jambes: 0.38, teteR: 28,
    tete: { forme: 'rond', l: 1.1, h: 0.95 }, corps: 'plein', epaules: 28, hanches: 28,
    epaisseur: 10, peau: '#5a361f', yeux: 'ronds', sourcils: 'epais', nez: 'rond',
    cheveux: 'ras',
    costume: { haut: { type: 'tunique', couleur: '#b9713d', motif: 'bandes' }, bas: { type: 'short', couleur: '#e8dcc0' }, tete: { type: 'chapeau', couleur: '#d9b26a' } },
  },

  // ---------------------------------------------------------------- Esprits
  // S01 — Dwo, le masque de feuilles (Bobo, Bwaba). Réutilisé dans le n°1.
  dwo: {
    id: 'S01', nom: 'Dwo, masque de feuilles', taille: 340, jambes: 0.4, teteR: 32,
    tete: { forme: 'masque', l: 0.8, h: 1.2 }, corps: 'plein', epaules: 24, hanches: 22,
    epaisseur: 9, peau: '#8a5a32', yeux: 'braise', couleurYeux: '#2a160a', sourcils: 'aucun',
    nez: 'long', cheveux: 'aucun', boucheL: 0.2,
    costume: { haut: { type: 'feuilles', couleur: '#5f8d3a' }, pieds: '#4f7d2c' },
  },

  // S02 — Soxo, esprit de la brousse : trapu, cornu, jupe d'herbes.
  soxo: {
    id: 'S02', nom: 'Soxo, esprit de la brousse', taille: 225, jambes: 0.34, teteR: 34,
    tete: { forme: 'cornu', l: 1.1, h: 0.95 }, corps: 'plein', epaules: 34, hanches: 30,
    epaisseur: 12, peau: '#5c6b2e', yeux: 'braise', couleurYeux: '#2b2a10', sourcils: 'epais',
    sourcilsCouleur: '#2d3415', nez: 'large', cheveux: 'aucun', boucheL: 0.4,
    costume: { bas: { type: 'herbes', couleur: '#a8a24a' }, collier: '#e6dcc0', bracelets: '#e6dcc0' },
  },

  // S03 — Kwere, la foudre : très fin, cheveux-éclairs, peau d'orage.
  kwere: {
    id: 'S03', nom: 'Kwere, la foudre', taille: 310, jambes: 0.48, teteR: 24,
    tete: { forme: 'ovale', l: 0.9, h: 1.05 }, corps: 'fil', epaules: 12, hanches: 10,
    epaisseur: 7, peau: '#3b4a74', yeux: 'braise', couleurYeux: '#1a1f3a', sourcils: 'fins',
    sourcilsCouleur: '#ffe066', nez: 'aucun', cheveux: 'zigzag', cheveuxCouleur: '#ffd23f',
    halo: '#bcd3ff',
    costume: { bas: { type: 'pagne', couleur: '#ffd23f' }, ceinture: '#1a1f3a', bracelets: '#ffd23f' },
  },
};

/* Animaux */
window.BESTIAIRE = {
  hyene: { id: 'A01', nom: 'La Hyène', couleur: '#a08a62', pattes: 56 },
};
