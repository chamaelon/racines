# Bible visuelle — Racines

Planche vivante : ouvrir [`planche.html`](planche.html) (casting) ou
`planche.html?vue=expressions&perso=ronde` (11 expressions d'un personnage).

## Style

- Stickman cartoon, **muet**, sans bulle. Membres en traits épais arrondis, tête et habits en aplats
  avec un contour un peu plus sombre (teinte −30 %). Les membres arrière sont assombris de 25 %.
- Le visage est dessiné de face, décalé vers l'avant pour suggérer le 3/4. Il comprend yeux,
  sourcils, nez, bouche animée, joues ou scarifications selon le personnage.
- Le jeu repose sur les **expressions** (neutre, joie, rire, triste, peur, colère, surprise,
  douleur, sommeil, malade, serein), la **pose** et la **caméra**.
- Textes à l'écran : seulement le titre, les cartouches (lieux, personnages) et le générique.
  Ils sont rangés dans `histoires/<n>/textes/<langue>.js`.

## Palette (5 familles)

| Famille | Teintes | Usage |
|---|---|---|
| Terre | `#c8834a` `#9a5a2e` `#b9713d` `#d49559` | sol, banco, maisons |
| Paille et or | `#d9b26a` `#e9c46a` `#ffd166` | toits, mil, divin, soleil |
| Végétal | `#5f8d3a` `#3d6327` `#7d9a50` | arbres, Dwo, Soxo |
| Ciel | jour `#7fbcd8→#f3e0b0`, chaud `#f4d7a1→#fbefd2`, soir `#3b3f7a→#e8875a`, nuit `#070a1c→#1f2a5c`, orage `#2e3445→#6b7286` | fonds |
| Accents textiles | `#d9653b` `#2f6c8f` `#c8553d` `#5b8c5a` `#b23a2a` | habits |

## Casting réutilisable ([`personnages.js`](personnages.js))

Le **corps** est fixe. Seuls les **habits** changent d'une histoire à l'autre.
Règle : dans une même scène, deux personnages doivent différer par au moins deux traits parmi
la taille, la forme de tête, la carrure et la coiffure.

| Id | Clé | Silhouette | Tête / visage | Rôles possibles |
|---|---|---|---|---|
| C01 | `geant` | 430 px, boubou long, halo | ovale haute, barbe blanche, yeux en amande | Wuro (n°1, 3), divinités, Jaba Lompo (devin), ancêtre céleste (n°20) |
| C02 | `ronde` | 205 px, petite et ronde | ronde, grands yeux, joues, foulard | Hamé, mères, Tenin Coulibaly (n°5) |
| C03 | `colosse` | 275 px, épaules larges | carrée, petits yeux, sourcils épais, scarifications, barbe courte | Bado le forgeron, guerriers, Famagan (n°16) |
| C04 | `filiforme` | 295 px, jambes longues, corps fil | longue, cheveux en brosse | Sanou, chasseurs (Rialé n°23, chasseur du gyil n°14), messagers |
| C05 | `enfant` | 135 px | grosse tête ronde, deux touffes | Tiko, enfants, Ouédraogo enfant |
| C06 | `ancien` | 225 px, voûté (lean 14) | poire, chauve, barbiche blanche, bonnet | Yéli, chefs de terre (n°26), devins, rois âgés |
| C07 | `elancee` | 255 px, élancée | ovale, chignon haut, yeux en amande | Yennenga (n°23), Téné (n°8), Guimbi Ouattara (n°15) |
| C08 | `trapu` | 235 px, carré moyen | ronde large, chapeau peul | figurants, cultivateurs, Peuls (n°27–29) |
| S01 | `dwo` | 340 px, franges de feuilles | masque de bois à crête | Dwo (n°1, 3) |
| S02 | `soxo` | 225 px, cornu | cornes, yeux de braise, jupe d'herbes | Soxo, génies de brousse (n°14) |
| S03 | `kwere` | 310 px, très fin, halo bleu | cheveux-éclairs jaunes | Kwere, esprits du ciel |
| A01 | `hyene` | quadrupède | — | hyène (n°3, 30) |

**Ajouter un personnage** : nouvelle fiche dans `personnages.js` (id suivant), vérifier qu'elle se
distingue sur la planche, puis l'ajouter à ce tableau.

## Décors ([`decors-composes.js`](decors-composes.js), éléments dans [`../lib/decors.js`](../lib/decors.js))

| Id | Fonction | Contenu | Options |
|---|---|---|---|
| D01 | `village` | maisons bwa en banco à toit plat, greniers coniques, karités, baobab, rônier | `ciel` (jour, chaud, soir, nuit), `voute` (ciel bas), `soleil` |
| D02 | `brousse` | savane, baobab, karité, termitière | `ciel` |
| D03 | `cosmos` | noir étoilé | — |
| D04 | `champ` | champ de mil sec et champ vert superposés (fondus), ciel d'orage | `vert`, `soleil` |
| D05 | `cour` | muret, maison, grenier, canari | `ciel`, `voute`, `etoiles`, `grenierX` |

Accessoires : mortier, pilon, canari, gerbe, bâton, éventail, feuilles, sac, siège (tronc),
pluie, éclair, particules, lumière (esprit en vol), nuage.

## Moteur ([`../lib/racines.js`](../lib/racines.js))

- `R.scene(nom, durée, (sc, tl) => …)` : une scène, sa caméra `sc.cam {x, y, z, r}`, ses acteurs.
- `sc.perso(CASTING.x, costume, pose)` : crée un personnage. Pose : `x, y, s, dir, rot, lean,
  tete, bA/cA` (bras et coude avant), `bR/cR` (arrière), `jA/gA`, `jR/gR` (jambes), `assis`,
  `yeux, regard, sourcils, sourcilsH, bouche, sourire, lueur, frisson`.
- Aides : `R.pose`, `R.expr`, `R.parle` (bouche qui mime), `R.marche`, `R.danse`, `R.saut`,
  `R.cam`, `R.secousse`, `R.fonduEntree/Sortie`, `R.eclairBlanc`, `R.titre`, `R.cartouche`,
  `R.generique`, `perso.tenir(objet, 'A'|'R', {vertical})`.
