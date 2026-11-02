/*
 * Les décors disponibles, sans Three.js : le mode lecture et le script de validation s'en servent.
 * mood : rythme de tam-tam joué pendant la scène. ciel : dégradé du mode lecture.
 */
export const DECORS = {
  palais: { mood: 'calme', ciel: ['#5d9ccf', '#f7c98a'] },
  champ: { mood: 'calme', ciel: ['#6fa8cf', '#e8c98a'] },
  nuit: { mood: 'nuit', ciel: ['#05081a', '#23305e'] },
  course: { mood: 'tension', ciel: ['#0b0f24', '#3a3560'] },
  foret: { mood: 'nuit', ciel: ['#3b2a5a', '#f2a07a'] },
  village: { mood: 'fete', ciel: ['#f6b26b', '#fde3b0'] },
  marche: { mood: 'fete', ciel: ['#f0c27a', '#fbe6bd'] },
  brousse: { mood: 'calme', ciel: ['#e8904a', '#fbd58f'] },
  bois: { mood: 'nuit', ciel: ['#16304a', '#3f6a5a'] },
  veillee: { mood: 'nuit', ciel: ['#090c22', '#3a2a4a'] },
  fleuve: { mood: 'calme', ciel: ['#6fa9cc', '#f3d9a6'] },
  mare: { mood: 'calme', ciel: ['#d97a5a', '#f7d39a'] },
  rochers: { mood: 'tension', ciel: ['#7fb0d0', '#f0d6a8'] },
  ruines: { mood: 'calme', ciel: ['#8fb7c9', '#efdcae'] },
  sahel: { mood: 'calme', ciel: ['#d9c08a', '#f8ecc8'] },
  ciel: { mood: 'calme', ciel: ['#28418f', '#a9c7ea'] },
};

export const MINIJEUX = ['course_cheval', 'devinette', 'rythme'];
