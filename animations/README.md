# Animations des récits — Racines

Vidéos stickman **muettes** (SVG + GSAP), environ 5 min chacune, en 16:9 (1920 × 1080).
Textes à l'écran limités au titre, aux cartouches de présentation et au générique.
Ces textes sont traduisibles.

```
animations/
├── lib/                 moteur commun (racines.js), éléments de décor (decors.js), GSAP local
├── bible/               casting réutilisable, décors composés, bible.md, planche.html
├── histoires/
│   └── 03-wuro-pilon/   00-ecriture/ecriture.md · textes/fr.js · scenes.js · index.html
└── registre.md          quelles histoires utilisent quels personnages et décors
```

## Voir un film

Ouvrir `histoires/<n>/index.html` dans un navigateur (double-clic, aucun serveur nécessaire).
- Espace : lecture ou pause. Flèches : ±5 s. Le menu donne accès direct aux scènes.
- `index.html?t=95` démarre à 95 s, `?auto=0` ne lance pas la lecture.
- `index.html?lang=mos` affiche les textes dans une autre langue, si `textes/mos.js` existe.

## Traduire les textes

Copier `textes/fr.js` en `textes/<code>.js` (codes ISO 639-3 : `mos`, `dyu`, `bwa`, `fuf`…).
Remplacer `TEXTES.fr` par `TEXTES.<code>` et traduire les valeurs. Ajouter ensuite la balise
`<script>` dans `index.html`.

## Capturer des images (contrôle ou export)

`index.html?capture=1&t=<secondes>` affiche l'image exacte à cet instant, sans barre de lecture.
Le rendu est déterministe : on peut donc capturer image par image (par exemple avec Edge en
headless : `msedge --headless=new --window-size=1920,1080 --screenshot=f.png "<url>"`), puis
assembler en MP4 avec ffmpeg. ffmpeg n'est pas encore installé sur ce poste.

## Nouvelle histoire

1. `histoires/<n>-<nom>/00-ecriture/ecriture.md` : logline, synopsis, séquencier, script visuel.
2. Choisir les personnages dans `bible/bible.md` et ne créer que les manquants. Pour les habits,
   définir des `COSTUMES` locaux dans `scenes.js`.
3. Copier `index.html` et `textes/fr.js` du pilote, écrire `scenes.js`.
4. Mettre à jour `registre.md`, puis faire un commit.
