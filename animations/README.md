# Racines — carte et films des récits du Burkina Faso

Application web du TP « Plateforme web multimédia et carte interactive des contes et légendes du Burkina Faso » :
une carte 3D/2D sert de menu vers 30 contes, légendes et récits (`local/histoires.md`), en films stickman de
4 min 15 à 6 min (16:9, 1920 × 1080), chacun avec plusieurs bandes sonores indépendantes.

- une **animation** SVG + GSAP qui se joue dans le navigateur ;
- une **vidéo MP4** exportée image par image depuis cette animation ;
- une **voix** au choix (français de synthèse aujourd'hui, langues nationales à enregistrer), une **ambiance**, une **musique** ;
- des **sous-titres**, des **arrêts interactifs** (griot), un **carnet de voyage** et un **studio de doublage**.

```
animations/
├── site/                le site : carte (index), lecteur, récits, carnet, studio, à propos
│   └── commun/          code, style, carte (MapLibre, contours), catalogue, données de doublage, vignettes
├── lib/                 moteur d'animation (racines.js), décors, bestiaire, gestes, GSAP local
├── bible/               casting, habits, bestiaire, décors composés ; bible.md, planche.html
├── histoires/<n>-<nom>/ 00-ecriture/ecriture.md · textes/fr.js · scenes.js · index.html   (30 histoires)
├── doublage/            GUIDE-DOUBLAGE.md ; sources/lot-*.txt (le texte minuté) ; <film>/ script, sous-titres, feuille de traduction
├── audio/<film>/        voix-fr.mp3, ambiance.mp3, musique.mp3 (régénérables) ; voix-<langue>.mp3 (enregistrées)
├── videos/              vidéos MP4 exportées, muettes (non suivies par git, régénérables)
├── videos-web/          vidéos 720p avec pistes audio, pour la publication (non suivies par git)
├── outils/              doublage.py, exporter.ps1, exporter-tout.ps1, publier-site.ps1, deployer-github-pages.ps1, vignettes.sh, nouvelle-histoire.sh
├── dist/                site prêt à publier (non suivi par git)
└── registre.md          quelles histoires utilisent quels personnages et décors
```

## Voir le site

Ouvrir `site/index.html` (double-clic, aucun serveur nécessaire). Le micro du studio demande un serveur local
(`python -m http.server` dans `animations/`, puis http://localhost:8000/site/) ou le site en ligne. Ce petit serveur
ne permet pas de sauter dans les fichiers audio : pour tester les sauts, utiliser le double-clic ou le site en ligne.

Un film seul reste accessible, sans le son : `histoires/<n>/index.html`. Espace : lecture ou pause. Flèches : ±5 s.
`?t=95` démarre à 95 s, `?auto=0` ne lance pas la lecture, `?lang=mos` affiche les textes d'une autre langue si
`textes/mos.js` existe.

## Voix off, doublage et bandes sonores

Voir [doublage/GUIDE-DOUBLAGE.md](doublage/GUIDE-DOUBLAGE.md). En résumé :

```powershell
pip install edge-tts numpy              # une fois
python outils/doublage.py scripts       # vérifie le minutage, écrit scripts, sous-titres, feuilles de traduction
python outils/doublage.py audio         # génère les pistes de tous les films (ou : audio 23 pour un seul)
python outils/doublage.py pistes        # après l'ajout d'une voix voix-mos.mp3, voix-dyu.mp3…
```

## Exporter les vidéos

Il faut ffmpeg (installé en version portable dans `%USERPROFILE%\outilsfmpeg`, ajouté au PATH)
et Microsoft Edge.

```powershell
./outils/exporter.ps1 -Histoire 01-wuro-masque            # une vidéo → videos/01-wuro-masque.mp4
./outils/exporter-tout.ps1 -IgnorerMoteur                  # celles qui manquent ou ont changé (3 en parallèle)
./outils/exporter-tout.ps1 -Refaire                        # tout réexporter
./outils/exporter.ps1 -Histoire 01-wuro-masque -Langue mos # vidéo avec les textes en mooré
python outils/doublage.py videos-web                       # 720p avec pistes audio → videos-web/
```

L'export ouvre la page en mode `?capture=1` dans Edge sans fenêtre, avance la timeline image par
image (25 i/s) et envoie les images à ffmpeg (H.264, CRF 20). Compter environ 25 à 50 minutes par
film, selon le nombre d'exports en parallèle. Une vidéo n'apparaît sur le site qu'une fois terminée : ffmpeg écrit
les informations de lecture à la fin du fichier. Les journaux sont dans `videos/journaux/`.

## Publier le site gratuitement

```powershell
./outils/vignettes.sh                  # (bash) vignettes, si une histoire a changé
./outils/publier-site.ps1 -Seul complet   # → dist/racines-complet (avec videos-web si elles existent)
./outils/deployer-github-pages.ps1     # → branche gh-pages → https://chamaelon.github.io/racines/
```

Limites gratuites de GitHub Pages : 1 Go de site, 100 Go de trafic par mois, 100 Mo par fichier. Le dossier
`dist/racines-complet` marche aussi sur Netlify (glisser-déposer) ou depuis une clé USB.

## Traduire les textes à l'écran

Copier `textes/fr.js` en `textes/<code>.js` (codes ISO 639-3 : `mos`, `dyu`, `bwa`, `fuf`…).
Remplacer `TEXTES.fr` par `TEXTES.<code>` et traduire les valeurs, jamais les clés. Ajouter la
balise `<script>` dans `index.html`. La vidéo traduite s'exporte avec `-Langue <code>`.

## Nouvelle histoire

1. `./outils/nouvelle-histoire.sh 31-nom "Titre"` crée le dossier et la page.
2. Écrire `00-ecriture/ecriture.md` (logline, séquencier, casting) et `textes/fr.js`.
3. Choisir les personnages, habits et décors dans `bible/bible.md` ; n'ajouter que ce qui manque.
4. Écrire `scenes.js` (voir une histoire existante comme modèle) ; vérifier les images avec
   `index.html?capture=1&t=…`.
5. Ajouter l'histoire à `site/commun/catalogue.js`, sa position à `site/commun/geo.js` et à `registre.md`, écrire son
   script dans `doublage/sources/`, générer l'audio, exporter la vidéo, faire un commit.
