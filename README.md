# Racines

Plateforme web multimédia et carte interactive des contes et légendes du Burkina Faso. On parcourt le pays sur une carte, puis on lit, écoute ou vit ses récits.

**Site :** <https://chamaelon.github.io/racines/>

- **Carte interactive** des 17 régions en SVG, avec une vue en relief 3D (Three.js).
- **34 récits** : contes, légendes et récits historiques, avec texte, morale, lexique et sources.
- **Narration interactive en 3D** : les 34 récits se jouent avec des marionnettes articulées dans 20 décors, avec choix, exploration, mini-jeux et plusieurs fins (584 nœuds, 71 fins).
- **Deux axes de navigation** : le temps (7 époques) et l'espace (carte, lieux), sur la carte comme dans chaque histoire.
- **Langues** : le texte et les voix de chaque histoire se changent en cours de partie. Toutes les pistes sont décrites dans [public/bandes-son](public/bandes-son/README.md).
- **Lecteur audio multilingue** avec sous-titres français (voix en cours d'enregistrement, voir [ENREGISTREMENTS.md](ENREGISTREMENTS.md)).
- **Patrimoine en 3D** : 33 objets (habitat, masques, habits, instruments, outils, mets), par peuple, avec leurs sources et leur degré de fidélité.
- **Progression** sans compte.

Les choix de réalisation et les écarts avec le cahier des charges sont dans [NOTES.md](NOTES.md).

## Lancer en local

Il faut Node.js 20 ou plus récent.

```sh
npm install
npm run dev        # site de développement
npm run validate   # vérifie les données
npm test           # tests unitaires
npm run test:e2e   # parcours de bout en bout, avec Edge
npm run build      # site statique dans dist/
```

## Ajouter un récit

1. Écrire le texte dans `public/data/textes/<id>.fr.md`.
2. Ajouter une entrée dans `public/data/recits.json`, et le récit à sa localité dans `public/data/localites.json`.
3. Écrire son histoire dans `public/data/stories/<id>.json` et renseigner `jouable` dans `recits.json`. Le format des nœuds est décrit en tête de [src/engine/moteur.js](src/engine/moteur.js).
4. Lancer `npm run validate` : le script signale toute référence cassée, et refuse un récit sans narration interactive.

## Régénérer les modèles 3D

Avec Blender 5 (chemin à adapter) :

```sh
blender -b --python modeles3d/patrimoine.py -- [ids]
blender -b --python modeles3d/personnages.py -- [styles]
blender -b --python modeles3d/decors.py -- [noms]
```

Les fichiers vont dans `public/modeles/`, et ceux des personnages aussi dans `films3d/modeles/`, avec les gestes des films. Sans argument, tout est reconstruit.

## Rendre et monter un film

```sh
npm run dev                               # puis /films3d/?film=03-wuro-pilon pour relire le découpage
npm run film:rendu -- 03-wuro-pilon       # l'image en pleine qualité, dans montage/masters/<film>.mp4
npm run films                             # compresse pour le site, range les exports du montage, écrit public/data/films.json
./scripts/publier-films.ps1               # envoie les médias sur gh-pages
```

Mode d'emploi complet : [films3d/GUIDE-MONTAGE.md](films3d/GUIDE-MONTAGE.md).

## Ajouter une langue ou une voix

- **Traduire le site :** copier `public/traductions/translate-exemple.json`, voir [son mode d'emploi](public/traductions/README.md).
- **Enregistrer les voix du jeu :** fichiers `<histoire>-<partie>-<langue>.m4a`, à faire avec Audacity, voir [public/bandes-son/README.md](public/bandes-son/README.md).
- **Habiller les objets :** images `type-objet-numero.png`, voir [public/motifs/README.md](public/motifs/README.md).

Les voix des fiches de récits suivent la règle ci-dessous.

Remplacer le fichier muet par l'enregistrement, sous le même nom (MP3 mono 64 kbit/s), puis passer `provisoire` ou `audioProvisoire` à `false`. Pour une fiche, recaler aussi les repères de temps de `fr.vtt`.

## Organisation

```text
public/data/   récits, localités, patrimoine, carte, histoires jouables, textes
public/audio/  voix et sous-titres
src/views/     les pages
src/engine/    le moteur de narration et les mini-jeux
src/scenes3d/  rendu 3D du jeu, ambiances, visionneuse du patrimoine
src/scenes/    relief 3D de la carte, styles et catalogue des décors
src/voyage.js  les deux axes : époques et lieux
modeles3d/     scripts Blender des objets, personnages et décors
films3d/       films 3D : moteur, découpages, gestes, guide de montage (GUIDE-MONTAGE.md)
public/modeles/     les modèles GLB, vignettes et portraits
public/bandes-son/  les fiches de toutes les pistes, par histoire, et les voix
public/traductions/ translate-<langue>.json : le français à gauche, la traduction à droite
public/motifs/      les images de motifs posées sur les modèles 3D
scripts/       carte, bandes-son, validation, fichiers audio provisoires
tests/         tests unitaires et de bout en bout
animations/    anciens films stickman, scripts de voix et sons (voir animations/README.md)
```

## Sources et licences

Contours : geoBoundaries (CC BY 4.0) et Natural Earth (domaine public). Les sources de chaque récit sont citées sur sa fiche.

Le code est sous licence MIT et nos modèles 3D sous licence CC BY 4.0 : voir [LICENSE.md](LICENSE.md).

Réalisé par TIROUDA Leila, ZAPRE Malika, OUEDRAOGO Boris et SOME Enock.
