# Racines

Plateforme web multimédia et carte interactive des contes et légendes du Burkina Faso. On parcourt le pays sur une carte, puis on lit, écoute ou vit ses récits.

**Site :** <https://chamaelon.github.io/racines/>

- **Carte interactive** des 17 régions en SVG, avec une vue en relief 3D (Three.js).
- **34 récits** : contes, légendes et récits historiques, avec texte, morale, lexique et sources.
- **Narration interactive** : 2 histoires jouables en scènes 2,5D, avec choix, exploration, mini-jeux et plusieurs fins.
- **Lecteur audio multilingue** avec sous-titres français (voix en cours d'enregistrement, voir [ENREGISTREMENTS.md](ENREGISTREMENTS.md)).
- **Patrimoine** (objets, habits, instruments, mets, habitat) et **progression** sans compte.

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
3. Lancer `npm run validate` : le script signale toute référence cassée.

Pour le rendre jouable, ajouter `public/data/stories/<id>.json` et renseigner `jouable` dans `recits.json`. Le format des nœuds est décrit en tête de [src/engine/moteur.js](src/engine/moteur.js).

## Ajouter une voix

Remplacer le fichier muet par l'enregistrement, sous le même nom (MP3 mono 64 kbit/s), puis passer `provisoire` ou `audioProvisoire` à `false`. Pour une fiche, recaler aussi les repères de temps de `fr.vtt`.

## Organisation

```text
public/data/   récits, localités, patrimoine, carte, histoires jouables, textes
public/audio/  voix et sous-titres
src/views/     les pages
src/engine/    le moteur de narration et les mini-jeux
src/scenes/    décors, personnages, dessins, rendu 2,5D, relief 3D
scripts/       carte, validation, fichiers audio provisoires
tests/         tests unitaires et de bout en bout
animations/    production des films stickman (voir animations/README.md)
```

## Sources et licences

Contours : geoBoundaries (CC BY 4.0) et Natural Earth (domaine public). Les sources de chaque récit sont citées sur sa fiche.

Auteur : SOME M J Enock.
