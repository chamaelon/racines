/*
 * Ciel, lumière et brume de chaque décor, sans Three.js : le mode lecture et les tests s'en servent aussi.
 * ciel : haut et bas du dégradé. soleil : couleur, intensité, direction. nuit : étoiles et lune.
 */
export const AMBIANCES = {
  palais: { ciel: ['#5d9ccf', '#f7d9a8'], soleil: ['#fff0d0', 3, [-6, 12, 7]], ambiant: ['#f8ecd6', '#8a6a4a', 1.5], brume: ['#f0d9b0', 40, 150] },
  champ: { ciel: ['#6fa8cf', '#efd8a4'], soleil: ['#fff0cc', 3.1, [8, 12, 6]], ambiant: ['#f1ead6', '#7f6a44', 1.5], brume: ['#e9d9ad', 40, 150] },
  nuit: { ciel: ['#05081a', '#23305e'], soleil: ['#9cb3e8', 1.1, [-7, 11, 5]], ambiant: ['#5d6fa3', '#1c1a26', 1.1], brume: ['#1a2548', 22, 90], nuit: true },
  course: { ciel: ['#0b0f24', '#3a3560'], soleil: ['#a8b6e6', 1.5, [6, 10, 6]], ambiant: ['#6e7cae', '#2a2430', 1.3], brume: ['#2a2a52', 22, 90], nuit: true },
  foret: { ciel: ['#3b2a5a', '#f2a07a'], soleil: ['#ffb37a', 2.1, [-9, 7, 5]], ambiant: ['#d6a58f', '#3a2c2a', 1.2], brume: ['#b87a68', 16, 70] },
  village: { ciel: ['#f6b26b', '#fde3b0'], soleil: ['#ffe2b0', 2.9, [-8, 9, 6]], ambiant: ['#fdeed0', '#8a6240', 1.5], brume: ['#f8d8a4', 40, 150] },
  'village-kassena': { ciel: ['#74aed2', '#fbe2b4'], soleil: ['#fff0d0', 3.1, [-7, 11, 7]], ambiant: ['#fbeed2', '#8a5c40', 1.5], brume: ['#f5dcb0', 40, 150] },
  'village-lobi': { ciel: ['#7fb0d0', '#f2dcae'], soleil: ['#fff0cc', 3, [8, 11, 6]], ambiant: ['#f2ebd5', '#7c6443', 1.5], brume: ['#ecdab0', 40, 150] },
  'village-soudanais': { ciel: ['#f2b878', '#fce6bb'], soleil: ['#ffe6b8', 3, [7, 10, 6]], ambiant: ['#fdeed0', '#8f6a44', 1.5], brume: ['#f8dcab', 40, 160] },
  'village-peul': { ciel: ['#dbc48f', '#f8ecc8'], soleil: ['#fff0c8', 3.1, [-8, 11, 5]], ambiant: ['#f8eed2', '#a08a5c', 1.6], brume: ['#f2e4ba', 34, 130] },
  marche: { ciel: ['#f0c27a', '#fbe6bd'], soleil: ['#ffeabf', 3, [6, 11, 7]], ambiant: ['#fdefd4', '#8f6d48', 1.5], brume: ['#f6dfb2', 40, 150] },
  brousse: { ciel: ['#e8904a', '#fbd58f'], soleil: ['#ffc98a', 2.8, [-10, 7, 6]], ambiant: ['#fbdcb0', '#7c5a38', 1.35], brume: ['#f3c388', 30, 120] },
  bois: { ciel: ['#24506e', '#6f9f86'], soleil: ['#d4e8c4', 2.7, [5, 12, 5]], ambiant: ['#a6cdb8', '#35503f', 2.3], brume: ['#4a7566', 14, 60] },
  veillee: { ciel: ['#090c22', '#3a2a4a'], soleil: ['#8fa2d8', .7, [-5, 10, 4]], ambiant: ['#4f5a8a', '#1e1620', .95], brume: ['#1c1830', 22, 90], nuit: true, feu: [0, 0.9, -1.4] },
  fleuve: { ciel: ['#6fa9cc', '#f3d9a6'], soleil: ['#fff0cc', 3, [-7, 11, 6]], ambiant: ['#f0ead6', '#6c6a4a', 1.5], brume: ['#e9d9b0', 40, 150] },
  mare: { ciel: ['#d97a5a', '#f7d39a'], soleil: ['#ffc08a', 2.5, [9, 6, 6]], ambiant: ['#f7d6b4', '#6c5a3f', 1.3], brume: ['#efc093', 30, 110] },
  rochers: { ciel: ['#7fb0d0', '#f0d6a8'], soleil: ['#fff0cc', 3.1, [-8, 12, 6]], ambiant: ['#f1ead5', '#7c6443', 1.45], brume: ['#e8d6ae', 36, 130] },
  ruines: { ciel: ['#8fb7c9', '#efdcae'], soleil: ['#fff0cc', 2.9, [7, 10, 6]], ambiant: ['#efe9d5', '#756443', 1.45], brume: ['#e6d8b0', 36, 130] },
  sahel: { ciel: ['#d9c08a', '#f8ecc8'], soleil: ['#fff0c8', 3.2, [-8, 12, 5]], ambiant: ['#f8eed2', '#a08a5c', 1.6], brume: ['#f2e4ba', 34, 130] },
  ciel: { ciel: ['#28418f', '#a9c7ea'], soleil: ['#fff6da', 2.4, [-6, 12, 6]], ambiant: ['#dbe6fa', '#8aa2d0', 1.8], brume: ['#a9c7ea', 26, 90] },
};

// Le village d'une histoire ressemble à celui du peuple qu'elle raconte.
const VILLAGES = {
  'village-kassena': ['ancetre-ciel', 'crocodile'],
  'village-lobi': ['thila-bateba', 'dyoro'],
  'village-soudanais': ['guimbi', 'famagan', 'silures-dafra', 'bona-1915'],
  'village-peul': ['bilissi', 'liptako', 'silamaka'],
};
export const varianteDecor = (recit, decor) => {
  if (decor !== 'village') return decor;
  for (const [v, ids] of Object.entries(VILLAGES)) if (ids.includes(recit)) return v;
  return decor;
};
