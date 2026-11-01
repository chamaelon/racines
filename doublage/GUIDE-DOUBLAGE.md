# Guide de voix off et de doublage — Racines

Pour les conteurs, comédiens et traducteurs qui prêtent leur voix à un film. Il faut un téléphone ou un
ordinateur avec micro, et un endroit calme. Compter environ 30 minutes pour enregistrer un film.

## Ce qui est prêt pour chaque film

Dans `doublage/<film>/` :

| Fichier | Sert à |
|---|---|
| `script-fr.md` | Le texte français minuté, avec les rôles, le ton et la place disponible pour chaque réplique |
| `traduction.csv` | La feuille à remplir (s'ouvre dans Excel ou LibreOffice) : colonnes mooré, dioula, fulfulde |
| `fr.srt`, `fr.vtt` | Les sous-titres français |

Les minutages sont ceux du film, en minutes et secondes (`2:13.5` = 2 min 13,5 s). Quand un personnage parle,
sa bouche bouge à l'image : la réplique doit commencer au minutage indiqué et tenir dans la colonne « Place ».
Les répliques du narrateur ont plus de souplesse.

## Doubler un film, étape par étape

1. **Traduire.** Traduire le sens, pas les mots : une réplique doit sonner comme on parle, et tenir dans sa place.
   Garder les noms propres. Si une tournure est trop longue, la raccourcir plutôt que de parler plus vite.
2. **Faire relire.** Une seconde personne qui parle la langue relit le texte avant l'enregistrement.
3. **Enregistrer.** Ouvrir la page **Studio de doublage** du site, choisir le film et la langue. Pour chaque
   réplique, « Enregistrer » lance l'extrait du film sans le son : parler en regardant l'image, puis « Arrêter ».
   « ▶ » permet de réécouter, « Refaire » de recommencer.
4. **Télécharger.** « Télécharger la piste » produit un fichier WAV où chaque réplique tombe au bon minutage.
   Sur la page du film, « Bandes sonores », puis « Importer une piste de voix », permet de l'écouter avec le film.
5. **Publier.** Convertir et placer le fichier, puis mettre le site à jour :

   ```powershell
   ffmpeg -i 23-yennenga__voix-mos.wav -ac 1 -b:a 64k audio/23-yennenga/voix-mos.mp3
   python outils/doublage.py pistes
   ./outils/publier-site.ps1 -Seul complet
   ./outils/deployer-github-pages.ps1
   ```

   La langue apparaît alors d'elle-même dans le lecteur du film.

## Conseils d'enregistrement

- Pièce calme, porte fermée, ventilateur et téléphone coupés. Des vêtements ou des rideaux autour de soi limitent l'écho.
- Se tenir à une quinzaine de centimètres du micro, un peu sur le côté pour éviter les souffles.
- Faire un essai et le réécouter avant d'enregistrer tout le film.
- Garder le même endroit et la même distance pour tout le film.
- Le ton indiqué dans le script est une suggestion : un conteur peut suivre sa propre manière de dire.

## Codes de langue

Le nom du fichier indique la langue : `voix-<code>.mp3`.

| Code | Langue | Code | Langue |
|---|---|---|---|
| `mos` | Mooré | `gux` | Gulmancema |
| `dyu` | Dioula | `knc` | Kasem |
| `fuf` | Fulfulde | `lob` | Lobiri |
| `bwa` | Bwamu | `dga` | Dagara |
| `bib` | Bissa | `son` | Songhaï |

Pour une autre langue, ajouter son code dans `LANGUES` en haut de `outils/doublage.py`.

## Les pistes de chaque film

Le lecteur superpose des pistes indépendantes, que le spectateur règle séparément :

| Fichier dans `audio/<film>/` | Contenu | Origine actuelle |
|---|---|---|
| `voix-fr.mp3` | Narration et répliques en français | Voix de synthèse, à remplacer par de vraies voix |
| `voix-<code>.mp3` | Narration et répliques dans une autre langue | À enregistrer |
| `ambiance.mp3` | Vent, village, eau, nuit, et effets (galop, tambour…) | Synthétisée par `outils/doublage.py` |
| `musique.mp3` | Thème musical de chaque scène | Synthétisée par `outils/doublage.py` |

Un musicien peut remplacer `musique.mp3` et `ambiance.mp3` par de vrais enregistrements, à condition de garder
la durée exacte du film. Les vidéos publiées (`videos-web/`) contiennent aussi le son, sur deux pistes audio :
le mixage français complet, et l'ambiance et la musique seules, pour un doublage en salle.

## Modifier le texte français

Le texte se trouve dans `doublage/sources/lot-*.txt`, avec une ligne par réplique :

```text
1:08.5|YENNENGA|fier et grave|Père, je veux me marier, et avoir des enfants.
```

Puis lancer `python outils/doublage.py audio <film>` : le script vérifie que chaque réplique tient dans sa place,
régénère les pistes et réécrit tous les fichiers de `doublage/<film>/`. Il signale les répliques trop longues.

## Validation des récits

Les récits sont des adaptations (voir `00-ecriture/ecriture.md` de chaque film). Quand un conteur connaît une autre
version ou relève une erreur, sa version compte : le signaler avant d'enregistrer, le texte peut être corrigé.
Les récits liés à des pratiques secrètes (le Dyoro, le vur, les Lingani) doivent être relus par des membres des
communautés concernées avant toute diffusion large.
