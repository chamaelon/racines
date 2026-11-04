# Monter un film et ajouter ses langues

Pour la personne qui fait le montage. Pas besoin de coder : il faut un logiciel de montage et le dossier du projet.

## Le principe

Un film, c'est **une seule image** et **une piste audio par langue**.

```text
public/films/03-wuro-pilon/
  video.mp4   l'image, muette, la même pour toutes les langues
  fr.m4a      le son complet en français : voix, ambiance, musique, effets
  mos.m4a     le son complet en mooré
  zxx.m4a     le son sans aucune voix (facultatif)
  fr.vtt      les sous-titres (facultatif)
```

Sur le site, le visiteur choisit sa langue et seule la piste audio change. Le film ne pèse donc qu'une fois, même avec dix langues.

## Quel logiciel ?

**DaVinci Resolve (version gratuite) est le meilleur choix ici** : sa page Fairlight est faite pour gérer beaucoup de pistes audio, et elle exporte le son seul. CapCut convient aussi, surtout pour un montage rapide. Si le logiciel ne sait pas exporter le son seul, exportez un MP4 par langue : le script en extrait l'audio.

## Étapes

### 1. Ouvrir le film

Importer le master en pleine qualité, `montage/masters/<film>.mp4`, et créer une timeline en **1920 × 1080, 25 images/s**. Rester à 25 images/s, sinon les minutages glissent.

### 2. Poser les pistes

| Piste | Contenu | D'où ça vient |
|---|---|---|
| A1 | Ambiance | `animations/audio/<film>/ambiance.mp3` |
| A2 | Musique | `animations/audio/<film>/musique.mp3` |
| A3 | Effets (pilon, tonnerre…) | à ajouter : les repères sont dans le script |
| A4 | Voix française | enregistrement |
| A5, A6… | Une piste par langue nationale | enregistrement |

Les repères sont dans `animations/doublage/<film>/script-fr.md` : qui parle, quand, sur quel ton, et combien de temps il a. Le fichier `fr.srt` du même dossier s'importe dans le logiciel et affiche les répliques sur la timeline.

Les fichiers `voix-fr.mp3` de `animations/audio` sont une **voix de synthèse**, utile comme guide de placement. Le cahier des charges exclut le doublage par IA : ne la gardez pas dans la version finale.

### 3. La règle à ne pas casser

**Finissez les coupes de l'image avant d'enregistrer les voix.** Toutes les langues partagent la même image : si un plan est raccourci ensuite, il faut recaler toutes les pistes. Si l'image a été modifiée, exportez-la une fois et nommez-la `<film>-video.mp4`.

### 4. Exporter une piste par langue

Pour chaque langue, couper le son des voix des autres langues, garder A1, A2 et A3, puis exporter **depuis le début du film** et sur **toute sa durée**. Sinon le son sera décalé.

Déposer les exports dans `montage/exports/`, en suivant ce nom exact :

```text
03-wuro-pilon-mos.wav     la piste en mooré
03-wuro-pilon-dyu.wav     la piste en dioula
03-wuro-pilon-zxx.wav     le film sans voix (facultatif)
03-wuro-pilon-video.mp4   l'image, seulement si elle a changé
```

Le début du nom est le dossier du film. La fin est le code de la langue dans `public/data/langues.json` : `fr`, `mos`, `dyu`, `fuf`, `bwa`, `lob`… Formats acceptés : WAV, MP3, M4A, AAC, FLAC, OGG, MP4, MOV, MKV. WAV est le plus sûr.

### 5. Ranger pour le site

```sh
npm run films
```

Le script convertit tout au bon format, met la liste du site à jour (`public/data/films.json`), et **prévient si une piste n'a pas la durée de l'image**. La nouvelle langue apparaît alors dans le lecteur, à l'adresse `#/film/<film>`.

### 6. Vérifier, puis publier

Lancer `npm run dev`, ouvrir le film, choisir la langue et sauter à deux ou trois endroits pour vérifier que les voix tombent juste.

Pour publier :

```powershell
./scripts/publier-films.ps1
```

Puis committer et pousser `public/data/films.json`. Publier dans cet ordre : d'abord les médias, ensuite la liste, sinon le site annoncera un film ou une langue encore absents.

## Les limites à surveiller

GitHub Pages accepte **1 Go au total** et **100 Mo par fichier**. Le script de publication s'arrête avant de les dépasser.

Le film pilote de 5 min 52 pèse 24 Mo en 720p sur le site, et chaque piste environ 4 Mo. Pour 30 films avec trois langues chacun, le total atteindrait environ 1,1 Go : **trop pour GitHub Pages**. Il faudra alors réduire encore la qualité ou le nombre de pistes, ou héberger les vidéos ailleurs.

## Traduire les textes à l'écran

Les titres et les noms ne sont pas incrustés dans l'image : le lecteur les affiche et les traduit avec `public/traductions/translate-<langue>.json`, comme le reste du site. Il n'y a donc **pas besoin de titres dans le montage**. Si vous en ajoutez dans le logiciel, ils resteront dans la même langue pour tout le monde.

## Refaire l'image d'un film

L'image vient du découpage (`films3d/decoupages/<film>.js`), relu dans le navigateur à l'adresse `/films3d/?film=<film>` (après `npm run dev`). `npm run film:rendu -- <film>` réécrit le master dans `montage/masters/<film>.mp4`, et `npm run films` en tire la version du site. **Toute coupe faite dans le logiciel de montage est alors perdue** : mieux vaut corriger le découpage, puis monter.
