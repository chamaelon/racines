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
| C03 | `colosse` | 275 px, épaules larges | carrée, petits yeux, sourcils épais, scarifications, barbe courte | Bado le forgeron (n°3), le premier forgeron (n°1), guerriers, Famagan (n°16) |
| C04 | `filiforme` | 295 px, jambes longues, corps fil | longue, cheveux en brosse | Sanou, chasseurs (Rialé n°23, chasseur du gyil n°14), messagers |
| C05 | `enfant` | 135 px | grosse tête ronde, deux touffes | Tiko, enfants, Ouédraogo enfant |
| C06 | `ancien` | 225 px, voûté (lean 14) | poire, chauve, barbiche blanche, bonnet | Yéli, chefs de terre (n°26), devins, rois âgés |
| C07 | `elancee` | 255 px, élancée | ovale, chignon haut, yeux en amande | Yennenga (n°23), Téné (n°8), Guimbi Ouattara (n°15) |
| C08 | `trapu` | 235 px, carré moyen | ronde large, chapeau peul | figurants, cultivateurs, Peuls (n°27–29) |
| S01 | `dwo` | 340 px, franges de feuilles | masque de bois à crête | Dwo (n°1, 3) |
| S02 | `soxo` | 225 px, cornu | cornes, yeux de braise, jupe d'herbes | Soxo, génies de brousse (n°14) |
| S03 | `kwere` | 310 px, très fin, halo bleu | cheveux-éclairs jaunes | Kwere, esprits du ciel |
| A01 | `hyene` | quadrupède | — | hyène (n°3, 30) |
| C09 | `europeen` | 265 px, élancé, peau claire | longue, moustache, casque colonial | commandants, explorateurs, visiteurs |
| C10 | `guerrier` | 285 px, athlétique | ovale, tresses, barbiche | cavaliers, gardes, héros (Silamaka, Famagan) |
| C11 | `fille` | 180 px | ronde, grands yeux, tresses | fillettes, jeunes héroïnes |
| C12 | `vieille` | 200 px, courbée | poire, petits yeux, foulard | grand-mères, devineresses, gardiennes |
| C13 | `roi` | 262 px, corpulent | ronde large, barbe courte | rois, chefs, tyrans (Bilissi) |
| C14 | `bebe` | 92 px | grosse tête ronde | nouveau-nés (Ouédraogo) |
| S04 | `genie` | 132 px, peau verdâtre | cheveux longs, yeux de braise | génies de brousse (kontomblé) |
| S05 | `esprit` | 300 px, bleuté, halo | ovale allongé | thila, ancêtres, esprits |
| S06 | `rocher` | 340 px, massif, halo | carrée de pierre | esprits des rochers (Sindou) |

**Habits communs** (`HABITS` dans `personnages.js`) : garde, chasseur (dozo), marabout, cavalier
(turban voilé), peul (chapeau), guerrier, notable, forgeron, villageois, villageoise. Options
d'habits : `jambes` (pantalon), `ventre` (femme enceinte), motifs `amulettes`, `boutons`,
`galons` ; couvre-chefs `turban` (+ `voile`), `casque`, `couronne`, `chasseur`, `calotte`,
`kepi`, `chechia` ; cheveux `longs` ; barbe `moustache`.

### Bestiaire (`BESTIAIRE`, moteur `lib/betes.js`)

`sc.bete(BESTIAIRE.x, pose)`. Pose : `marche, marcheAmp, tete, gueule, queue, couche, yeux,
cabre` (cheval), `trompe` (éléphant), `traits` (gazelle), `dresse` (serpent), `gonfle` (crapaud),
`teinte2`, `langue` (caméléon). `cheval.monter(perso)` met un cavalier en selle.

| Id | Clé | Type | Id | Clé | Type |
|---|---|---|---|---|---|
| A01 | `hyene` | (Animal, ancien moteur) | A09 | `crocodile` | crocodile |
| A02 | `cheval` | quadrupède | A10 | `silure` | poisson |
| A03 | `chevalBlanc` | quadrupède | A11 | `serpent` | serpent |
| A04 | `gazelle` | quadrupède | A12 | `crapaud` | crapaud |
| A05 | `zebu`, `zebuRoux` | quadrupède | A13 | `araignee` | araignée |
| A06 | `elephant` | quadrupède | A14, A15 | `poule`, `pintade` | oiseau |
| A07 | `chien` | quadrupède | A16 | `cameleon` | caméléon |
| A08 | `lievre` | quadrupède | | | |

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
| D06 | `bois` | bois sacré : rideau d'arbres, grand arbre-autel, rônier ; `r.devant()` ajoute des feuillages au premier plan | `ciel` (soir, nuit), `arbreX` |
| D07 | `tiebele` | cases rondes peintes (Kassena) | `ciel`, `nuit` |
| D08 | `sahel` | dunes, acacias, cases peules en dôme | `ciel`, `campement` |
| D09 | `pics` | aiguilles de grès de Sindou | `ciel` |
| D10 | `gorge` | falaises, cascade, bassin (Dafra) ; `r.cascade`, `r.bassin.eau` | `ciel` |
| D11 | `riviere` | grand fleuve, rives ; `r.vagues` | `ciel`, `riveProche` |
| D12 | `forteresse` | enceinte de pierre (Loropéni) | `ciel`, `ruine` |
| D13 | `ville` | mosquée soudano-sahélienne, maisons | `ciel`, `mosqueeX`, `mosqueeS` |
| D14 | `poste` | poste colonial, drapeau, chantier | `ciel`, `posteX` |
| D15 | `soukala` | maison-forteresse lobi, échelle | `ciel`, `maisonX` |
| D16 | `palais` | cour royale : mur, trône, parasol, tambours | `ciel`, `troneX`, `parasol` |

`brousse` accepte aussi `mare` (x d'un point d'eau) et `nuit`.

Accessoires ajoutés au lot 2 : arc, flèche, lance, fusil, bouclier, sabre, baguette, calebasse,
torche, sceptre, balafon, tambour, statuette (bateba), pirogue, trône, parasol, autel, cauris,
drapeau, tas (or, pierres), rocher, mare, fumée ; arbres caïlcédrat et acacia ; case ronde (peinte
ou non), case en dôme, mosquée, mur de pierre, pic, soukala, poste colonial, dune, falaise.

**Gestes** (`R.G`, `lib/gestes.js`) : saluer, incliner, agenouiller/relever, prier, pointer,
pleurer, dialogue, frapper, tomber, tirer (arc), épauler et tir (fusil), piocher, piler,
balafon, notes, forger, flamber, surLaTete, donner, apparition, foule, exprFoule, danseFoule,
peurFoule, calmeFoule, gardes, cavaliers, chevaucher, villagesAuLoin, sousSol.

Accessoires : mortier, pilon, canari, gerbe, bâton, éventail, feuilles, sac, siège (tronc),
pluie, éclair, particules, lumière (esprit en vol), nuage ; **forge** : feu (flammes animables),
enclume, marteau, houe ; tourbillon de poussière ; costume de feuilles vide
(`masqueFeuilles`, à passer à `sc.anime()` pour qu'il frissonne).

## Moteur ([`../lib/racines.js`](../lib/racines.js))

- `R.scene(nom, durée, (sc, tl) => …)` : une scène, sa caméra `sc.cam {x, y, z, r}`, ses acteurs.
- `sc.perso(CASTING.x, costume, pose)` : crée un personnage. Pose : `x, y, s, dir, rot, lean,
  tete, bA/cA` (bras et coude avant), `bR/cR` (arrière), `jA/gA`, `jR/gR` (jambes), `assis`,
  `yeux, regard, sourcils, sourcilsH, bouche, sourire, lueur, frisson`.
- Aides : `R.pose`, `R.expr`, `R.parle` (bouche qui mime), `R.marche`, `R.danse`, `R.saut`,
  `R.cam`, `R.secousse`, `R.fonduEntree/Sortie`, `R.eclairBlanc`, `R.titre`, `R.cartouche`,
  `R.generique`, `perso.tenir(objet, 'A'|'R', {vertical})`.
- Objets et effets : `R.objet(g, visible)`, `R.montrer` / `R.cacher` (objet tenu qui apparaît),
  `R.chute` (lumière qui tombe du ciel), `R.jaillir` (poussière, étincelles, feuilles),
  `R.plan(sc, tl, début, fin)` (sous-plan d'une scène, `g.sous` à passer aux décors),
  `sc.anime(o)` (accessoire animé à chaque image).
- **Angles composés** : `lean` + = buste penché en avant. Le bras suit le buste : son angle réel
  vaut `bA − lean`. Pour frapper vers le sol en se penchant, il faut donc un `bA` plus grand.
- GSAP : avec `stagger`, mettre `repeat`/`yoyo` **dans** l'objet `stagger`, sinon toute la
  vague se répète et la scène s'allonge.
