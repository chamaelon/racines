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

  // ---------------------------------------------------------------- Ajouts du lot 2
  // C09 — Européen (explorateur, administrateur colonial) : seul personnage à peau claire.
  europeen: {
    id: 'C09', nom: "L'Européen", taille: 265, jambes: 0.46, teteR: 25,
    tete: { forme: 'long', l: 0.85, h: 1.2 }, corps: 'plein', epaules: 20, hanches: 16,
    epaisseur: 8, peau: '#e9c4a2', yeux: 'ronds', sourcils: 'fins', sourcilsCouleur: '#7a4a25',
    nez: 'long', cheveux: 'ras', cheveuxCouleur: '#8a5a2b', barbe: 'moustache', barbeCouleur: '#8a5a2b',
    costume: { haut: { type: 'tunique', couleur: '#d8c8a0', motif: 'boutons', motifCouleur: '#7a6a4a' }, manches: '#d8c8a0', jambes: '#cbbb92', pieds: '#3a2a1a', tete: { type: 'casque', couleur: '#f0ead8' } },
  },

  // C10 — Guerrier élancé et musclé, tresses. Rôles : cavaliers, guerriers, héros (Silamaka).
  guerrier: {
    id: 'C10', nom: 'Le Guerrier', taille: 285, jambes: 0.47, teteR: 25,
    tete: { forme: 'ovale', l: 0.95, h: 1.1 }, corps: 'plein', epaules: 32, hanches: 18,
    epaisseur: 10, peau: '#3e2414', yeux: 'amande', sourcils: 'epais', nez: 'large',
    cheveux: 'tresses', barbe: 'barbiche', barbeCouleur: '#1d140f',
    costume: { haut: { type: 'tunique', couleur: '#2f3f6f', motif: 'bandes', motifCouleur: '#e9c46a' }, bas: { type: 'short', couleur: '#e8dcc0' }, manches: '#2f3f6f' },
  },

  // C11 — Jeune fille (environ 12 ans), tresses. Rôles : Téné, filles, jeunes héroïnes.
  fille: {
    id: 'C11', nom: 'La Jeune Fille', taille: 180, jambes: 0.42, teteR: 25,
    tete: { forme: 'rond', l: 0.95, h: 1.05 }, corps: 'plein', epaules: 13, hanches: 14,
    epaisseur: 7, peau: '#7a4a2e', yeux: 'grands', sourcils: 'fins', nez: 'rond', cheveux: 'tresses',
    joues: true,
    costume: { haut: { type: 'camisole', couleur: '#e9c46a' }, bas: { type: 'jupe', couleur: '#5b8c5a', motif: 'points', motifCouleur: '#f6ead2' }, collier: '#c8553d' },
  },

  // C12 — Vieille femme, un peu courbée. Rôles : grand-mères, prêtresses, devineresses.
  vieille: {
    id: 'C12', nom: 'La Vieille Femme', taille: 200, jambes: 0.38, teteR: 26,
    tete: { forme: 'poire', l: 1, h: 1.05 }, corps: 'fil', epaules: 13, hanches: 13,
    epaisseur: 7, peau: '#6a4228', yeux: 'petits', sourcils: 'fins', sourcilsCouleur: '#e8e2d2',
    nez: 'rond', cheveux: 'aucun', joues: true, pose: { lean: 10 },
    costume: { haut: { type: 'boubou', couleur: '#6b4a7a', motif: 'points', motifCouleur: '#e9c46a', long: 1.7 }, manches: '#6b4a7a', tete: { type: 'foulard', couleur: '#2f6c8f' } },
  },

  // C13 — Roi corpulent. Rôles : rois, chefs, tyrans (Bilissi), Tiéba, Naaba de Gambaga.
  roi: {
    id: 'C13', nom: 'Le Roi corpulent', taille: 262, jambes: 0.36, teteR: 31,
    tete: { forme: 'rond', l: 1.15, h: 1 }, corps: 'plein', epaules: 38, hanches: 40,
    epaisseur: 11, peau: '#4a2a18', yeux: 'petits', sourcils: 'epais', nez: 'large',
    cheveux: 'ras', barbe: 'courte', barbeCouleur: '#2a1d14',
    costume: { haut: { type: 'boubou', couleur: '#7a1f2a', motif: 'chevrons', motifCouleur: '#e9c46a', long: 1.8 }, manches: '#7a1f2a', tete: { type: 'calotte', couleur: '#e9c46a', motifCouleur: '#7a1f2a' } },
  },

  // C14 — Bébé / tout-petit. Rôles : Ouédraogo enfant, nouveau-nés.
  bebe: {
    id: 'C14', nom: 'Le Bébé', taille: 92, jambes: 0.3, teteR: 21,
    tete: { forme: 'rond', l: 1, h: 1 }, corps: 'plein', epaules: 10, hanches: 10,
    epaisseur: 6, peau: '#8a5432', yeux: 'grands', sourcils: 'fins', nez: 'aucun', cheveux: 'ras',
    boucheL: 0.24, costume: { bas: { type: 'pagne', couleur: '#efe0bd' } },
  },

  // S04 — Génie nain de brousse (kontomblé) : petit, grosse tête, cheveux longs, peau verdâtre.
  genie: {
    id: 'S04', nom: 'Le Génie nain', taille: 132, jambes: 0.34, teteR: 30,
    tete: { forme: 'rond', l: 1, h: 1.1 }, corps: 'fil', epaules: 10, hanches: 10,
    epaisseur: 7, peau: '#7d8a4a', yeux: 'braise', couleurYeux: '#2a2a10', sourcils: 'epais',
    sourcilsCouleur: '#2a1a10', nez: 'long', cheveux: 'longs', cheveuxCouleur: '#2a1a10', boucheL: 0.35,
    costume: { bas: { type: 'herbes', couleur: '#9a8a3a' }, bracelets: '#e6dcc0' },
  },

  // S05 — Esprit léger (thila lobi, esprits protecteurs) : silhouette fine et bleutée, halo.
  esprit: {
    id: 'S05', nom: "L'Esprit", taille: 300, jambes: 0.46, teteR: 26,
    tete: { forme: 'ovale', l: 0.85, h: 1.25 }, corps: 'fil', epaules: 12, hanches: 10,
    epaisseur: 7, peau: '#8fa0c8', yeux: 'braise', couleurYeux: '#2a3050', sourcils: 'aucun',
    nez: 'aucun', cheveux: 'aucun', halo: '#cfe0ff', boucheL: 0.2,
    costume: { bas: { type: 'pagne', couleur: '#e8eefc' }, collier: '#cfe0ff' },
  },

  // S06 — Esprit des rochers (Sindou) : massif, tête carrée de pierre, yeux de braise.
  rocher: {
    id: 'S06', nom: "L'Esprit des rochers", taille: 340, jambes: 0.36, teteR: 34,
    tete: { forme: 'carre', l: 1.1, h: 1.05 }, corps: 'plein', epaules: 46, hanches: 34,
    epaisseur: 15, peau: '#a0805e', yeux: 'braise', couleurYeux: '#3a2a1a', sourcils: 'epais',
    sourcilsCouleur: '#5a4030', nez: 'large', cheveux: 'aucun', scarif: true, halo: '#ffd8a0',
    costume: { bas: { type: 'herbes', couleur: '#6f8f45' } },
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
  // Les fiches suivantes se créent avec sc.bete(BESTIAIRE.x, pose) (lib/betes.js).
  cheval: { id: 'A02', nom: 'Le Cheval', type: 'quadrupede', couleur: '#7a4a2a', longueur: 170, epaisseur: 62, pattes: 105, patteEp: 11, cou: 70, couAngle: 58, tete: { l: 62, h: 30, museau: 0.8 }, oreilles: 'pointues', criniere: '#2a1a10', queue: 'crins', sabots: '#2a1a10' },
  chevalBlanc: { id: 'A03', nom: "L'Étalon blanc", type: 'quadrupede', couleur: '#ece6da', longueur: 175, epaisseur: 64, pattes: 108, patteEp: 11, cou: 72, couAngle: 58, tete: { l: 62, h: 30, museau: 0.8 }, oreilles: 'pointues', criniere: '#bdb3a2', queue: 'crins', sabots: '#4a3a2a' },
  gazelle: { id: 'A04', nom: 'La Gazelle', type: 'quadrupede', couleur: '#c98d4e', ventre: '#f6ead2', longueur: 110, epaisseur: 40, pattes: 80, patteEp: 7, cou: 42, couAngle: 62, tete: { l: 44, h: 24, museau: 0.6 }, oreilles: 'pointues', cornes: 'gazelle', queue: 'courte', flanc: '#5a3a20', traits: true, sabots: '#2a1a10' },
  zebu: { id: 'A05', nom: 'Le Zébu', type: 'quadrupede', couleur: '#e8e0d0', longueur: 170, epaisseur: 70, pattes: 72, patteEp: 12, cou: 18, couAngle: 20, tete: { l: 56, h: 36, museau: 0.4 }, oreilles: 'pointues', cornes: 'zebu', bosse: true, queue: 'touffe', sabots: '#3a2a1a' },
  zebuRoux: { id: 'A05b', nom: 'Le Zébu roux', type: 'quadrupede', couleur: '#a0522d', longueur: 165, epaisseur: 68, pattes: 70, patteEp: 12, cou: 18, couAngle: 20, tete: { l: 54, h: 35, museau: 0.4 }, oreilles: 'pointues', cornes: 'zebu', bosse: true, queue: 'touffe', sabots: '#3a2a1a', motif: 'taches' },
  elephant: { id: 'A06', nom: "L'Éléphant", type: 'quadrupede', couleur: '#8d8a88', longueur: 250, epaisseur: 140, pattes: 115, patteEp: 32, cou: 10, couAngle: 10, tete: { l: 95, h: 85, museau: 0.1 }, oreilles: 'grandes', trompe: true, defenses: true, queue: 'fine' },
  chien: { id: 'A07', nom: 'Le Chien', type: 'quadrupede', couleur: '#c8a070', ventre: '#efe0bd', longueur: 100, epaisseur: 36, pattes: 52, patteEp: 7, cou: 20, couAngle: 45, tete: { l: 40, h: 26, museau: 0.6 }, oreilles: 'pointues', queue: 'fine' },
  lievre: { id: 'A08', nom: 'Le Lièvre', type: 'quadrupede', couleur: '#b79a76', ventre: '#efe6d6', longueur: 72, epaisseur: 42, pattes: 30, patteEp: 8, cou: 8, couAngle: 40, tete: { l: 36, h: 28, museau: 0.3 }, oreilles: 'longues', queue: 'courte' },
  crocodile: { id: 'A09', nom: 'Le Crocodile', type: 'crocodile', couleur: '#5f7a3a', ventre: '#c9c48a', longueur: 300 },
  silure: { id: 'A10', nom: 'Le Silure', type: 'poisson', couleur: '#4e5a52', ventre: '#b8c0a8', longueur: 180 },
  serpent: { id: 'A11', nom: 'Le Serpent', type: 'serpent', couleur: '#9a7a3a', motifCouleur: '#4a3a1a', longueur: 360, epaisseur: 22 },
  crapaud: { id: 'A12', nom: 'Le Crapaud', type: 'crapaud', couleur: '#7a7a3a', sac: '#efe0a8', taille: 70 },
  araignee: { id: 'A13', nom: "L'Araignée", type: 'araignee', couleur: '#3a2a20', taille: 46 },
  poule: { id: 'A14', nom: 'La Poule', type: 'oiseau', couleur: '#c8743a', crete: '#c0392b', taille: 55 },
  pintade: { id: 'A15', nom: 'La Pintade', type: 'oiseau', couleur: '#3a3a48', motif: 'points', teteCouleur: '#e8e0d0', crete: '#c0392b', taille: 55 },
  cameleon: { id: 'A16', nom: 'Le Caméléon', type: 'cameleon', couleur: '#6aa04a', couleur2: '#c8a040', taille: 80 },
};
