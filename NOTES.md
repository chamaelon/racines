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
- **Voix du jeu :** les 34 histoires ont une fiche par réplique dans `public/bandes-son`. Aucune n'est encore enregistrée : elles se jouent sans voix.

## Audio

- Aucune voix en langue nationale n'est encore enregistrée. Les fichiers actuels sont des MP3 muets (`scripts/bouche-trous.js`), signalés par « audio à venir ». La liste complète est dans `ENREGISTREMENTS.md`.
- **Doublage par IA :** l'énoncé du TP ne l'exclut pas. C'est notre cahier des charges du 1er novembre qui le plaçait hors périmètre. L'équipe a levé cette exclusion le 3 novembre.
- **Deux options par histoire (décision du 4 novembre) :** chaque fiche propose seulement le jeu et le film. Les sections « Écouter » et « Lire » du cahier (F3, F4) sont retirées de l'affichage ; le « mode lecture » du jeu reste comme secours d'accessibilité (sans WebGL, mouvement réduit). Les textes restent dans `public/data/textes`, et `src/components/lecteur-audio.js` n'est plus affiché.
- **Licences :** voir `LICENSE.md`. NLLB-200 et MMS-TTS appartiennent à Meta (CC BY-NC 4.0) : l'équipe ne peut pas les relicencier.

## Technique

- **`base: './'` au lieu de `/contes-bf/` :** le dépôt s'appelle `racines`, et un chemin relatif marche partout.
- **Polices :** Cinzel et Nunito sont servies depuis le site (paquets fontsource) plutôt que par Google Fonts. Il n'y a donc aucun appel réseau externe.
- **Déploiement :** GitHub Actions publie dans la branche `gh-pages`, avec `keep_files`, pour garder les films et le studio qui s'y trouvent déjà.
- **Tests de bout en bout :** lancés en local avec Edge (`npm run test:e2e`), pas en CI.
- **Filtre « jouables » retiré :** il n'a plus d'objet, tout se joue.
- **Fonctions P3 :** le mini-jeu `rythme` et le générateur de récit sont faits. Le service worker ne l'est pas.

## 3D

- **Modèles générés par scripts Blender** (`modeles3d/`) : ni achat, ni licence tierce, et chaque correction se propage. La contrepartie est un style stylisé de marionnettes, loin du photoréalisme.
- **Personnages :** 35 styles sur une même armature, avec les animations repos, parole, marche et monte. Les membres ont été épaissis pour quitter l'allure des anciens stickmen. Les animaux des contes sont des personnages à tête d'animal, comme dans les anciens dessins.
- **Performance :** 4 000 à 41 000 triangles par décor. La qualité baisse toute seule si l'image ralentit : moins de pixels, puis plus d'ombres.
- **Tests de bout en bout :** les 34 histoires sont jouées en mode lecture, trop lentes en 3D sur le rendu logiciel des tests. Trois histoires sont jouées en 3D sur grand écran. Le rendu n'a pas été mesuré sur un vrai téléphone.

## Films

- **Nouvelle chaîne (2026-11-02) :** personnages 3D animés dans Three.js, export en vidéo, montage des pistes dans un logiciel dédié, lecture de la vidéo sur le site. Le site n'embarque plus d'animation : seulement des vidéos et le jeu. Le mode d'emploi est dans `films3d/GUIDE-MONTAGE.md`.
- **Une image, une piste par langue :** les navigateurs ne laissent pas choisir de façon fiable une piste dans un MP4, et un MP4 par langue dépasserait la limite de GitHub Pages. Le lecteur joue donc une vidéo muette et un fichier audio, tenus en phase (écart maximal de 0,25 s).
- **Textes à l'écran :** ils ne sont pas dans l'image. Le lecteur les affiche et les traduit, ce qui tient la règle d'origine des textes isolés par langue.
- **Avancement :** seul le film pilote (n° 3, Wuro et le pilon) est refait en 3D. Les autres restent en stickman, signalés « version provisoire », pour qu'aucune fiche ne perde son film.
- **Son :** aucune piste n'est encore montée. Les pistes actuelles sont des mélanges automatiques de l'ancien son, avec une voix de synthèse signalée comme provisoire sur le lecteur. Le cahier exclut le doublage par IA : écart assumé par l'équipe pour le rendu, signalé sur le site et dans le rapport, à remplacer par de vraies voix.
- **Minutages :** le pilote garde ceux de son script de voix off, pour réutiliser scripts, sous-titres et feuilles de traduction.
- **Wuro :** le modèle `createur` porte une auréole et une robe claire, ce qui peut évoquer l'imagerie chrétienne dans un mythe bwa. À revoir avec un connaisseur, comme le reste de l'adaptation.
- **Gestes :** les gestes des films ne sont que dans `films3d/modeles`, pour ne pas alourdir les modèles du jeu (env. 200 Ko de plus par personnage).
- **Ancien site des films :** `site/`, `histoires/`, `lib/` restent sur gh-pages, sans lien depuis le site. À retirer quand tous les films seront refaits, avec l'étape correspondante de `deploy.yml`.

## Patrimoine

- **Fidélité :** ce sont des interprétations d'après des notices de musée et des descriptions, sans relevé ni photo de référence intégrée. Chaque fiche porte un champ `fidelite`. La demande « tous les motifs et détails » n'est pas atteinte : elle demande des photos de pièces réelles et une relecture par des connaisseurs.
- **Motifs :** les compositions sont inventées à partir du vocabulaire décrit. Aucun masque ni mur précis n'est reproduit.
- **Sens des motifs :** les fiches n'en donnent pas de clé. Pour les masques bwa, les seules correspondances de couleurs trouvées viennent d'une source sans références, et le sens est transmis aux initiés. Pour Tiébélé, aucun glossaire complet n'a été trouvé.
- **Objets sacrés :** les masques sont montrés comme des objets de collection, sans décrire de rite. Le molo et le bateba sont liés à l'initiation et aux autels : à montrer à un connaisseur avant de les garder. Le vur et les objets du Dyoro restent absents, comme dans les récits.
- **Peuples sans objet propre :** Bissa, Gulmancé, Samo, Lyela, Songhaï, Nuna et Marka n'ont que des objets communs, faute de source vérifiée sur un objet précis.
- **Dozo :** les amulettes suivent une chemise bamana du Mali conservée à Londres. Le lien avec les chasseurs burkinabè reste à confirmer.
- **Gyil :** les sources décrivent surtout celui du Ghana.

## Motifs

- **Dossier :** `public/motifs`, images `type-objet-numero.png`. Le jeu et la fiche Patrimoine les posent sur le modèle 3D. Mode d'emploi : `public/motifs/README.md`.
- **Motifs par peuple :** un objet commun peut porter un motif différent selon le peuple (forme, place, couleur). Les 7 compositions de `peuples.json` sont des démonstrations inventées, signalées comme telles sur la fiche : à remplacer par des motifs relevés.
- **À vérifier :** aucune image réelle n'a encore été déposée. L'habillage n'a été essayé qu'avec les compositions.

## Barre de temps

- **Sur la carte :** une frise horizontale qui défile, avec un curseur. Elle remplace les boutons d'époques.
- **Dates :** les crans vont par 100 ans avant 1800, par 20 ans au XIXe siècle, puis par an de 1896 à 1916. Le début à 1100 est un choix d'affichage. Seules 7 étapes portent une année, tirée de leur titre.
- **Conséquence :** une étape sans année reste visible sur toute son époque. Le curseur ne change donc l'affichage, à l'intérieur d'une époque, que pour ces 7 étapes. Il faudrait dater les autres étapes à partir de sources.
- **Classement à relire :** le découpage en époques reste une proposition, en particulier « Aujourd'hui » pour la fin de certains récits, et le classement de Yennenga dans le « Temps des royaumes ».
- **Sauter une étape :** le joueur garde ses choix, mais peut arriver à une scène qui en suppose d'autres. Le panneau le dit.
- **Lieux hors carte :** Gambaga, Kong, le Macina et la Gold Coast sont hors du pays, et le ciel de certains mythes hors de toute carte. Ils sont listés sans marqueur. Datomon, Dafra, la forêt de Rialé et la route de Kong à Bobo ont un emplacement approché.

## Langues

- **Traduction du site :** `public/traductions/translate-<langue>.json`, avec le français à gauche et la traduction à droite. Le fichier couvre l'interface, les fiches et les histoires : 2 329 phrases. Une phrase vide reste en français.
- **Liste des phrases :** l'interface est extraite du code par `scripts/medias.js`. Une phrase composée à l'affichage peut y échapper, et reste alors en français.
- **Sous-titres :** ceux du lecteur audio ne passent par ce fichier que s'ils reprennent exactement une phrase de la fiche.
- **Anglais :** traduction de travail, partielle, pour montrer le résultat : l'interface principale, Yennenga et La gazelle.
- **Langues nationales (décision de l'équipe du 2026-11-03, faute de temps) :** chaque histoire est traduite et dite automatiquement dans deux langues tirées au sort parmi le mooré, le dioula et le fulfulde : film, sous-titres et jeu (`scripts/voix_mms.py`, tirage dans `animations/doublage/traductions-auto/tirage.json`). Aucun locuteur n'a relu. La retraduction du pilote montrait de nombreux contresens ; les reformulations et le choix par retraduction les réduisent sans les supprimer. Le fulfulde est celui du Nigeria côté traduction. Le modèle mooré n'a pas de « h ». Une seule voix par langue. Une traduction humaine écrite dans `traduction.csv` prime : il faut alors relancer le script.
- **Voix :** `<histoire>-<partie>-<langue>.m4a`, à enregistrer avec Audacity une fois l'idée validée par l'équipe. Aucune n'existe encore.
- **Intonation, âge, sexe, durée :** proposés automatiquement pour le jeu, à ajuster par le directeur de doublage. Les films gardent le ton et le minutage de leur script.

## Pour plus tard

- **Objets sacrés :** à vérifier plus tard, faute de temps (molo, bateba, liés à l'initiation et aux autels).
