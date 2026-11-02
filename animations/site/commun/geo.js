/*
 * Racines — où se situe chaque récit sur la carte, et parcours guidés.
 * region : nom de la région du fichier geoBoundaries (découpage en 13 régions).
 * approx : l'emplacement indique un pays ou une aire culturelle, pas un lieu précis du récit.
 * langue : langue nationale proposée en priorité pour le doublage (code de LANGUES).
 */
window.GEO = {
  '01-wuro-masque':  { lat: 11.52, lon: -3.93, region: 'Hauts-Bassins', lieu: 'Pays bobo', approx: true, langue: 'dyu' },
  '02-silures-dafra':{ lat: 10.98, lon: -4.15, region: 'Hauts-Bassins', lieu: 'Dafra, source du Houet', langue: 'dyu' },
  '03-wuro-pilon':   { lat: 12.08, lon: -3.67, region: 'Boucle du Mouhoun', lieu: 'Pays bwa', approx: true, langue: 'dyu' },
  '04-gazelle':      { lat: 12.18, lon: -4.08, region: 'Boucle du Mouhoun', lieu: 'Pays bwa, vers Solenzo', approx: true, langue: 'dyu' },
  '05-tenin-1915':   { lat: 11.95, lon: -3.25, region: 'Boucle du Mouhoun', lieu: 'Un village bwa', approx: true, langue: 'dyu' },
  '06-bona-1915':    { lat: 12.42, lon: -3.50, region: 'Boucle du Mouhoun', lieu: 'Bona, pays marka', approx: true, langue: 'dyu' },
  '07-pics-sindou':  { lat: 10.67, lon: -5.17, region: 'Cascades', lieu: 'Pics de Sindou', langue: 'dyu' },
  '08-tene-balafon': { lat: 10.97, lon: -4.91, region: 'Hauts-Bassins', lieu: 'Pays senoufo, vers Orodara', approx: true, langue: 'dyu' },
  '09-thila-bateba': { lat: 10.33, lon: -3.18, region: 'Sud-Ouest', lieu: 'Pays lobi, vers Gaoua', approx: true, langue: 'dyu' },
  '10-dyoro':        { lat: 10.02, lon: -2.92, region: 'Sud-Ouest', lieu: 'Volta noire, pays lobi', approx: true, langue: 'dyu' },
  '11-loropeni':     { lat: 10.30, lon: -3.58, region: 'Sud-Ouest', lieu: 'Ruines de Loropéni', langue: 'dyu' },
  '12-obire':        { lat: 10.50, lon: -3.42, region: 'Sud-Ouest', lieu: 'Obiré', approx: true, langue: 'dyu' },
  '13-zenuo':        { lat: 10.88, lon: -3.00, region: 'Sud-Ouest', lieu: 'Pays dagara', approx: true, langue: 'dyu' },
  '14-gyil':         { lat: 11.15, lon: -3.06, region: 'Sud-Ouest', lieu: 'Pays dagara, vers Dano', approx: true, langue: 'dyu' },
  '15-guimbi':       { lat: 11.24, lon: -4.36, region: 'Hauts-Bassins', lieu: 'Bobo-Dioulasso (Sya)', langue: 'dyu' },
  '16-famagan':      { lat: 11.45, lon: -4.66, region: 'Hauts-Bassins', lieu: 'Région de Bobo-Dioulasso', approx: true, langue: 'dyu' },
  '17-landolo':      { lat: 13.07, lon: -3.07, region: 'Boucle du Mouhoun', lieu: 'Pays san, vers Tougan', approx: true, langue: 'mos' },
  '18-rakire':       { lat: 13.25, lon: -2.60, region: 'Nord', lieu: 'Entre pays samo et Yatenga', approx: true, langue: 'mos' },
  '19-vur':          { lat: 12.32, lon: -2.47, region: 'Centre-Ouest', lieu: 'Pays lyela, vers Réo', approx: true, langue: 'mos' },
  '20-ancetre-ciel': { lat: 11.10, lon: -0.97, region: 'Centre-Sud', lieu: 'Tiébélé', langue: 'mos' },
  '21-crocodile':    { lat: 11.17, lon: -1.25, region: 'Centre-Sud', lieu: 'Pays kassena, vers Pô', approx: true, langue: 'mos' },
  '22-babatou':      { lat: 11.10, lon: -2.10, region: 'Centre-Ouest', lieu: 'Pays gourounsi, vers Léo', approx: true, langue: 'mos' },
  '23-yennenga':     { lat: 11.78, lon: -0.30, region: 'Centre-Est', lieu: 'Tenkodogo (la légende commence à Gambaga, au Ghana)', approx: true, langue: 'mos' },
  '24-lingani':      { lat: 11.80, lon: -0.62, region: 'Centre-Est', lieu: 'Tangaré, Garango', approx: true, langue: 'mos' },
  '25-jaba-lompo':   { lat: 12.06, lon: 0.36, region: 'Est', lieu: 'Fada N\'Gourma (Bingo)', langue: 'mos' },
  '26-maitres-terre':{ lat: 14.23, lon: -0.87, region: 'Sahel', lieu: 'Pays kurumba, vers Aribinda', approx: true, langue: 'fuf' },
  '27-bilissi':      { lat: 14.10, lon: -1.63, region: 'Sahel', lieu: 'Récit peul du Macina (Mali), raconté au Sahel', approx: true, langue: 'fuf' },
  '28-silamaka':     { lat: 14.02, lon: -1.20, region: 'Sahel', lieu: 'Sahel peul', approx: true, langue: 'fuf' },
  '29-liptako':      { lat: 14.04, lon: -0.03, region: 'Sahel', lieu: 'Dori', langue: 'fuf' },
  '30-crapaud':      { lat: 14.45, lon: -0.24, region: 'Sahel', lieu: 'Pays songhaï, Oudalan', approx: true, langue: 'fuf' },
};

/* Parcours guidés : la carte conduit d'un récit à l'autre. */
window.PARCOURS = [
  { id: 'origines', nom: 'Aux origines', texte: 'Comment le monde et les peuples sont nés, selon les récits.', etapes: ['03-wuro-pilon', '01-wuro-masque', '20-ancetre-ciel', '25-jaba-lompo', '13-zenuo'] },
  { id: 'resistances', nom: 'Résistances', texte: 'Ceux qui ont dit non : cavaliers, colons et tributs.', etapes: ['05-tenin-1915', '06-bona-1915', '22-babatou', '15-guimbi', '28-silamaka'] },
  { id: 'femmes', nom: 'Femmes de pouvoir', texte: 'Princesses, reines, doyennes et rebelles.', etapes: ['23-yennenga', '15-guimbi', '05-tenin-1915', '07-pics-sindou', '08-tene-balafon'] },
  { id: 'esprits', nom: 'Esprits et génies', texte: 'Rochers, brousse et poissons sacrés : le monde invisible.', etapes: ['02-silures-dafra', '07-pics-sindou', '09-thila-bateba', '14-gyil', '08-tene-balafon'] },
  { id: 'malice', nom: 'Bêtes et malice', texte: 'Des contes qui font rire, et qui font réfléchir.', etapes: ['04-gazelle', '30-crapaud', '27-bilissi', '21-crocodile', '17-landolo'] },
  { id: 'royaumes', nom: 'Mémoire des royaumes', texte: 'Forteresses, rois et cours d\'autrefois.', etapes: ['11-loropeni', '12-obire', '16-famagan', '24-lingani', '26-maitres-terre', '29-liptako'] },
];
