# Bandes-son

Ce dossier décrit chaque piste à doubler, pour jouer chaque histoire dans toutes les langues voulues.

```
bandes-son/
  index.json                part de texte et de voix disponible, par histoire et par langue
  <histoire>/
    pistes.json             la source : toutes les pistes et leurs langues
    fiches.txt              les mêmes fiches, lisibles, pour les comédiens (généré)
    <histoire>-<partie>-<langue>.m4a    les enregistrements, par exemple yennenga-intro-mos.m4a
```

## Une fiche

```
piste: fin1
fichier: yennenga-fin1-<langue>.m4a
histoire: La légende de Yennenga
partie: La naissance d'Ouédraogo (jeu)
personnage: Yennenga
intonation: posé (proposée)
texte: Nous l'appellerons Ouédraogo...
genre: adulte/femme
duree: 7420ms (estimée)
```

- **partie** : l'étape du récit, ou le minutage pour un film (`film-012` : de 01:02.0 à 01:06.5).
- **intonation** : `scénario` vient du script du film. `proposée` est déduite de la réplique et du décor : c'est une suggestion. Pour la confirmer, écrire `"intonation_statut": "validée"` dans `pistes.json`. Elle ne sera plus écrasée.
- **genre** : âge/sexe proposés. `libre` : au choix du directeur de doublage.
- **duree** : `estimée` à partir du nombre de mots en français, `mesurée sur le film`, ou réelle dans chaque langue une fois le fichier enregistré.

## Ajouter une langue

Le plus simple est le fichier `public/traductions/translate-<langue>.json`, qui couvre tout le site : voir [son mode d'emploi](../traductions/README.md). La feuille ci-dessous sert à traduire une seule histoire, avec ses intonations sous les yeux.

1. Exporter la feuille à traduire : `npm run bandes-son -- exporter yennenga mos yennenga-mos.csv`
2. La faire remplir (colonne `traduction`) et relire par un locuteur.
3. La reprendre : `npm run bandes-son -- importer mos yennenga-mos.csv`

Le texte passe aussitôt dans le jeu : la langue devient disponible dans « Langue du texte ». Les textes non traduits restent en français.

Le code de la langue doit exister dans `public/data/langues.json`.

## Ajouter une voix (avec Audacity)

Chaque fichier se nomme `<histoire>-<partie>-<langue>.m4a` et se dépose dans le dossier de l'histoire. La partie est le numéro de piste de la fiche. La ligne `fichier` de `fiches.txt` donne le nom exact, par exemple `yennenga-intro-mos.m4a`.

1. Ouvrir `<histoire>/fiches.txt` : chaque fiche donne le personnage, l'intonation, le texte, l'âge, le sexe et la durée visée.
2. Enregistrer la réplique dans Audacity, en mono. Couper les silences au début et à la fin.
3. Normaliser : menu **Effets**, **Volume et compression**, **Normaliser**.
4. Exporter : menu **Fichier**, **Exporter l'audio**, format **M4A (AAC)**, 64 kbit/s, mono. Ce format demande la bibliothèque FFmpeg, à installer une fois depuis les préférences d'Audacity.
5. Déposer le fichier dans `public/bandes-son/<histoire>/`, puis relancer `npm run dev` ou pousser sur GitHub.

Le fichier est repéré tout seul, et la langue apparaît dans « Langue des voix ». Sa durée n'est mesurée que si `ffprobe` est installé.

Si le français d'une réplique change, la traduction reçoit `"a_revoir": true`.

## État actuel

- **Français :** tous les textes.
- **Anglais :** *La légende de Yennenga* et *Les deux traits de la gazelle*, en traduction de travail à relire.
- **Langues nationales :** rien pour l'instant. Ces textes demandent de vrais locuteurs.
- **Voix :** aucun enregistrement. Le cahier des charges exclut le doublage généré par IA.
