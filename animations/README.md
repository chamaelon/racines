# Animations des récits — Racines

Les 30 contes, légendes et récits de `local/histoires.md`, en films stickman **muets** d'environ
4 min 30 à 6 min (16:9, 1920 × 1080), en deux formes :

- une **animation** SVG + GSAP qui se joue dans le navigateur ;
- une **vidéo MP4** exportée image par image depuis cette animation, prête pour un doublage.

Les textes à l'écran se limitent au titre, aux cartouches (lieux, personnages) et au générique.
Ils sont traduisibles.

```
animations/
├── lib/                 moteur (racines.js), décors (decors.js), bestiaire (betes.js), gestes (gestes.js), GSAP local
├── bible/               casting, habits communs, bestiaire, décors composés ; bible.md, planche.html
├── histoires/<n>-<nom>/ 00-ecriture/ecriture.md · textes/fr.js · scenes.js · index.html   (30 histoires)
├── site/                le site : accueil + version animée + version vidéo (catalogue, lecteurs)
├── videos/              vidéos MP4 exportées (non suivies par git, régénérables)
├── outils/              exporter.ps1, exporter-tout.ps1, publier-site.ps1, vignettes.sh, nouvelle-histoire.sh
├── dist/                site prêt à publier (non suivi par git, produit par publier-site.ps1)
└── registre.md          quelles histoires utilisent quels personnages et décors
```

## Voir les films

- **Le site** : ouvrir `site/index.html` (double-clic, aucun serveur nécessaire), puis choisir la
  version animée ou la version vidéo.
- **Un film seul** : `histoires/<n>/index.html`. Espace : lecture ou pause. Flèches : ±5 s. Le
  menu donne accès aux scènes. `?t=95` démarre à 95 s, `?auto=0` ne lance pas la lecture,
  `?lang=mos` affiche les textes d'une autre langue si `textes/mos.js` existe.

## Exporter les vidéos

Il faut ffmpeg (installé en version portable dans `%USERPROFILE%\outils\ffmpeg`, ajouté au PATH)
et Microsoft Edge.

```powershell
./outils/exporter.ps1 -Histoire 01-wuro-masque            # une vidéo → videos/01-wuro-masque.mp4
./outils/exporter-tout.ps1                                 # toutes celles qui manquent ou ont changé (3 en parallèle)
./outils/exporter-tout.ps1 -Refaire                        # tout réexporter
./outils/exporter.ps1 -Histoire 01-wuro-masque -Langue mos # vidéo avec les textes en mooré
```

L'export ouvre la page en mode `?capture=1` dans Edge sans fenêtre, avance la timeline image par
image (25 i/s) et envoie les images à ffmpeg (H.264, CRF 20). Compter environ 25 à 30 minutes par
film, trois films en parallèle. Les journaux sont dans `videos/journaux/`.

## Publier le site

```powershell
./outils/vignettes.sh            # (bash) vignettes du catalogue, si une histoire a changé
./outils/publier-site.ps1        # → dist/racines-complet, dist/racines-animations, dist/racines-videos
```

Chaque dossier de `dist/` est autonome. Il se copie tel quel sur un hébergement statique ou une
clé USB. Les versions « animations » et « vidéos » seules ne contiennent pas de lien vers l'autre.

## Traduire les textes

Copier `textes/fr.js` en `textes/<code>.js` (codes ISO 639-3 : `mos`, `dyu`, `bwa`, `fuf`…).
Remplacer `TEXTES.fr` par `TEXTES.<code>` et traduire les valeurs, jamais les clés. Ajouter la
balise `<script>` dans `index.html`. La vidéo traduite s'exporte avec `-Langue <code>`.

## Nouvelle histoire

1. `./outils/nouvelle-histoire.sh 31-nom "Titre"` crée le dossier et la page.
2. Écrire `00-ecriture/ecriture.md` (logline, séquencier, casting) et `textes/fr.js`.
3. Choisir les personnages, habits et décors dans `bible/bible.md` ; n'ajouter que ce qui manque.
4. Écrire `scenes.js` (voir une histoire existante comme modèle) ; vérifier les images avec
   `index.html?capture=1&t=…`.
5. Ajouter l'histoire à `site/commun/catalogue.js` et à `registre.md`, exporter la vidéo, faire un
   commit.
