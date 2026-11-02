# Notes de réalisation

Écarts et choix par rapport au cahier des charges, à reprendre dans le rapport.

## Carte

- **17 régions :** aucun GeoJSON ouvert des 17 régions trouvé. Application du repli prévu : les 45 provinces de geoBoundaries (ADM2, 2017) sont regroupées avec mapshaper (`scripts/build-map.js`).
- **Correspondance province → région :** `scripts/sources/provinces-regions.csv`, d'après [Sidwaya](https://www.sidwaya.info/reorganisation-administrative-du-territoire-les-toponymes-des-17-regions-et-leur-signification/) et [Wikipédia](https://en.wikipedia.org/wiki/Regions_of_Burkina_Faso). Pour Sourou, Tannounyan, Tapoa et Yaadga, la liste vient d'un résumé de la page Sidwaya : à revérifier sur le décret.
- **Provinces de 2025 :** Karo-Peli et Dyamongou n'existent pas dans la source de 2017. Elles restent fondues dans Soum et Tapoa, sans effet sur les contours des régions.
- **Localités :** les coordonnées marquées `approx` indiquent une aire culturelle ou un lieu approché. Celles de Noumoudara sont approchées, à vérifier.
- **L'ancienne carte :** le globe MapLibre (13 régions) reste en ligne dans `site/`. La nouvelle carte suit le cahier : SVG en 2D, Three.js pour le relief.

## Contenu

- **34 récits au lieu de 8 :** les 8 du cahier, plus les films existants. Le texte des 30 récits issus des films vient de leur script de voix off (`animations/doublage/*/script-fr.md`).
- **Récits « à collecter » :** le conte peul (n° 7) est provisoirement « La part de Bilissi », et le conte lobi (n° 8) « Les thila et les bateba », faute de collecte. « Les thila et les bateba » est un mythe, donc classé légende, et non un conte : à remplacer après collecte.
- **Le lièvre et l'hyène :** version libre du motif très répandu du partage de la récolte. Les noms en mooré du lexique sont à vérifier.
- **Tiéfo Amoro :** le récit de sa fin repose sur une seule source, ce que le texte précise.
- **Les kinkirsi :** le texte résume des descriptions publiées. Il ne raconte pas encore une légende précise de Kaya.
- **Statut :** tous les textes portent `a_valider` et affichent le bandeau « texte provisoire ». L'étudiant valide chaque texte puis passe le statut à `valide`.
- **Morales et lexiques :** rédigés pour cette version, donc à valider eux aussi.

## Narration interactive

- **Les 34 récits se jouent.** Le cahier en demandait 2. Chaque histoire a au moins un choix, deux fins, et une exploration ou un mini-jeu ; `tests/donnees.test.js` vérifie que toutes les fins sont atteignables.
- **Contes et légendes :** la fin titrée « Version du griot » suit le texte de la fiche. Les fins « Autre chemin » sont inventées pour le jeu, et le disent souvent dans leur dernière réplique.
- **Récits historiques :** les choix changent le regard du joueur (qui suivre, où se placer), jamais les faits. Le témoin joué et certaines répliques sont imaginés pour le jeu ; les faits, dates et noms viennent du texte de la fiche. Les fins y sont titrées « Mémoire ».
- **Secrets :** le jeu ne montre ni le Dyoro, ni le vur, ni la préparation des rois d'Obiré et de Garango. Les curieux sont renvoyés, et le récit le dit.
- **Les kinkirsi :** la scène est entièrement imaginée, faute de légende collectée. Le griot l'annonce dès la première réplique.
- **À valider :** ces branches, répliques et devinettes sont à relire avec les textes, comme tout le contenu.
- **Voix du jeu :** seuls Yennenga et Le lièvre et l'hyène ont des emplacements de répliques doublées. Les 32 autres histoires se jouent avec le texte français, sans voix.

## Audio

- Aucune voix en langue nationale n'est encore enregistrée. Les fichiers actuels sont des MP3 muets (`scripts/bouche-trous.js`), signalés par « audio à venir ». La liste complète est dans `ENREGISTREMENTS.md`.
- La voix de synthèse des films n'est pas reprise sur les fiches : le cahier exclut le doublage généré par IA.

## Technique

- **`base: './'` au lieu de `/contes-bf/` :** le dépôt s'appelle `racines`, et un chemin relatif marche partout.
- **Polices :** Cinzel et Nunito sont servies depuis le site (paquets fontsource) plutôt que par Google Fonts. Il n'y a donc aucun appel réseau externe.
- **Déploiement :** GitHub Actions publie dans la branche `gh-pages`, avec `keep_files`, pour garder les films et le studio qui s'y trouvent déjà.
- **Tests de bout en bout :** lancés en local avec Edge (`npm run test:e2e`), pas en CI.
- **Filtre « jouables » retiré :** il n'a plus d'objet, tout se joue.
- **Fonctions P3 :** le mini-jeu `rythme` et le générateur de récit sont faits. La traduction des menus et le service worker ne le sont pas.
