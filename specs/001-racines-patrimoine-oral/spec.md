# Feature Specification: Racines — carte et récits du patrimoine oral burkinabè

**Feature Branch**: `001-racines-patrimoine-oral`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Construire « Racines », une application web immersive qui préserve, numérise et transmet le patrimoine oral burkinabè (contes, légendes, récits historiques) : carte interactive 2D/3D, aperçus, expérience narrative par scènes avec audio en langue d'origine et sous-titres français, choix narratifs, catalogue filtrable, page À propos / Sources, contrôles audio. MVP : ≥ 8 récits, ≥ 3 langues, ≥ 5 régions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Découvrir un récit sur la carte (Priority: P1)

À l'ouverture, un visiteur voit une carte du Burkina Faso où chaque lieu d'origine d'un récit
est marqué par un point. Il touche un point et voit un aperçu (titre, région, langue, durée,
type : conte / légende / récit historique) avec un bouton « Écouter le récit ».

**Why this priority**: c'est la porte d'entrée et l'identité du produit ; sans elle, aucun
récit n'est trouvable de manière immersive.

**Independent Test**: ouvrir l'application sur téléphone, toucher un point, vérifier que
l'aperçu affiche les 5 informations et que le bouton mène à la page du récit.

**Acceptance Scenarios**:

1. **Given** la page d'accueil chargée, **When** le visiteur regarde la carte, **Then** au
   moins 8 points répartis dans au moins 5 régions sont visibles.
2. **Given** la carte affichée, **When** le visiteur active un point (toucher, clic ou
   clavier), **Then** un aperçu s'ouvre avec titre, région, langue(s), durée et type.
3. **Given** un aperçu ouvert, **When** le visiteur choisit « Écouter le récit », **Then** la
   page du récit s'ouvre.
4. **Given** plusieurs récits au même lieu, **When** le visiteur active ce point, **Then**
   l'aperçu liste tous les récits du lieu.

---

### User Story 2 - Vivre l'expérience narrative (Priority: P1)

Sur la page d'un récit, le visiteur suit le texte découpé en scènes. Chaque scène a son
illustration animée. La narration audio est dans la langue d'origine, avec des sous-titres
français synchronisés. Le visiteur peut mettre en pause, régler le volume, choisir la langue
audio si plusieurs existent, activer une musique d'ambiance, ou lire le texte sans audio.

**Why this priority**: c'est la valeur centrale, transmettre le récit dans sa langue.

**Independent Test**: ouvrir directement un récit par son lien, le lancer et le suivre jusqu'à
la fin sur téléphone avec audio, puis refaire le parcours en mode lecture seule.

**Acceptance Scenarios**:

1. **Given** la page d'un récit, **When** le visiteur lance la lecture, **Then** la narration
   démarre dans la langue d'origine et les sous-titres français s'affichent en phase avec
   l'audio.
2. **Given** une lecture en cours, **When** l'audio atteint la scène suivante, **Then**
   l'illustration et le texte passent automatiquement à cette scène.
3. **Given** une lecture en cours, **When** le visiteur met en pause ou change le volume,
   **Then** l'effet est immédiat et la reprise se fait au même endroit.
4. **Given** un récit disponible en plusieurs langues, **When** le visiteur change la langue
   audio, **Then** la narration reprend dans la nouvelle langue au début de la scène en cours.
5. **Given** la page d'un récit, **When** le visiteur choisit « Lire sans audio », **Then** il
   avance scène par scène à son rythme avec le texte français complet.
6. **Given** la musique d'ambiance, **When** le visiteur l'active ou la désactive, **Then** la
   narration continue. Par défaut, l'ambiance est désactivée.
7. **Given** la dernière scène terminée, **When** le récit s'achève, **Then** un écran de fin
   affiche la source (conteur, communauté, région, langue) et propose d'autres récits.

---

### User Story 3 - Rechercher et filtrer dans le catalogue (Priority: P2)

Un enseignant ou un chercheur ouvre le catalogue, tape un mot-clé et filtre les récits par
région, langue, thème (sagesse, animaux, héros, origine d'un peuple…) et type.

**Why this priority**: c'est l'accès structuré pour les usages éducatifs et la recherche. La
carte suffit pour un premier MVP de découverte.

**Independent Test**: depuis le catalogue, combiner deux filtres et une recherche et vérifier
que seuls les récits correspondants s'affichent.

**Acceptance Scenarios**:

1. **Given** le catalogue, **When** aucun filtre n'est actif, **Then** tous les récits sont
   listés avec titre, région, langue(s), type et durée.
2. **Given** le catalogue, **When** le visiteur sélectionne « Mooré » et « Animaux », **Then**
   seuls les récits remplissant les deux critères s'affichent.
3. **Given** une recherche par mot-clé, **When** le mot apparaît dans le titre, le résumé ou
   un thème, **Then** le récit figure dans les résultats.
4. **Given** des filtres sans résultat, **When** la liste est vide, **Then** un message
   l'indique et propose de réinitialiser les filtres.

---

### User Story 4 - Faire des choix narratifs (Priority: P2)

Dans certains récits, à un moment clé, le visiteur choisit entre deux options. Son choix
mène à une variante de la suite ou de la fin.

**Why this priority**: c'est une forte valeur d'engagement, notamment pour les jeunes, mais
seule une partie des récits l'utilise.

**Independent Test**: dans un récit à embranchement, faire chacun des deux choix et vérifier
que les deux suites diffèrent et que chacune mène à une fin.

**Acceptance Scenarios**:

1. **Given** un récit avec embranchement, **When** la scène de choix est atteinte, **Then**
   la narration se met en pause et deux options sont proposées, utilisables au clavier.
2. **Given** les options affichées, **When** le visiteur en choisit une, **Then** la suite
   correspondante démarre avec son audio, ses sous-titres et ses illustrations.
3. **Given** une fin atteinte, **When** l'écran de fin s'affiche, **Then** le visiteur peut
   revenir au choix pour découvrir l'autre variante.

---

### User Story 5 - Basculer en vue 3D (Priority: P3)

Le visiteur bascule la carte en vue inclinée avec relief, puis revient à la vue 2D. Les mêmes
points restent utilisables dans les deux vues.

**Why this priority**: c'est un enrichissement visuel. La vue 2D assure déjà le parcours
complet.

**Independent Test**: basculer en 3D, activer un point, revenir en 2D. Puis, sur un appareil
sans support 3D, vérifier que la bascule est absente ou désactivée et que la 2D fonctionne.

**Acceptance Scenarios**:

1. **Given** la carte 2D, **When** le visiteur active « Vue 3D », **Then** la carte s'incline
   avec relief et les points restent visibles et activables.
2. **Given** un appareil incapable d'afficher la 3D, **When** la carte se charge, **Then** la
   vue 2D fonctionne normalement et l'option 3D est masquée ou expliquée.
3. **Given** la préférence « réduire les animations », **When** le visiteur bascule de vue,
   **Then** le changement se fait sans animation.

---

### User Story 6 - Consulter « À propos / Sources » (Priority: P3)

Le visiteur consulte une page qui présente le projet, les conteurs et la démarche de
préservation : sources, consentement, droits.

**Why this priority**: cette page est indispensable à la légitimité du projet, mais elle est
simple à livrer.

**Independent Test**: ouvrir la page depuis le menu et vérifier que chaque conteur du corpus
y figure avec sa communauté et sa région.

**Acceptance Scenarios**:

1. **Given** le menu principal, **When** le visiteur choisit « À propos », **Then** la page
   présente le projet, la démarche de préservation et la liste des conteurs et sources.
2. **Given** la fiche d'un conteur, **When** le visiteur la consulte, **Then** il peut accéder
   aux récits de ce conteur.

---

### Edge Cases

- **Connexion lente ou coupée** : le texte et les sous-titres s'affichent avant l'audio. Un
  indicateur signale le chargement. En cas d'échec de l'audio, le mode lecture sans audio est
  proposé.
- **Lecture automatique bloquée** par le navigateur : la narration ne démarre que sur une
  action explicite du visiteur.
- **Langue audio indisponible** pour un récit : seules les langues disponibles sont proposées.
- **Récit sans embranchement** : la lecture est linéaire, aucun écran de choix ne s'affiche.
- **Visiteur qui quitte au milieu** : s'il revient sur le même appareil, la lecture reprend à
  la scène où il s'était arrêté.
- **Lecteur d'écran** : l'aperçu, les contrôles audio et les choix sont annoncés et
  utilisables. Chaque illustration a un texte alternatif.
- **Points de la carte trop proches** : ils sont regroupés ou restent séparément activables,
  avec une cible tactile d'au moins 44×44 px.
- **Lien direct vers un récit inexistant** : une page d'erreur claire renvoie à la carte et
  au catalogue.

## Requirements *(mandatory)*

### Functional Requirements

**Carte et aperçu**

- **FR-001**: Le système MUST afficher à l'accueil une carte 2D du Burkina Faso avec un point
  par lieu d'origine de récit.
- **FR-002**: Les points MUST être activables au toucher, à la souris et au clavier.
- **FR-003**: Activer un point MUST afficher un aperçu : titre, région, langue(s), durée, type
  et accès au récit.
- **FR-004**: Le système MUST proposer une vue 3D inclinée avec relief, que le visiteur peut
  activer et désactiver. Cette vue MUST être absente sans dégrader la 2D quand l'appareil ne
  la supporte pas.
- **FR-005**: La carte MUST proposer une alternative textuelle : la liste des lieux et des
  récits, utilisable sans la carte.

**Expérience narrative**

- **FR-006**: Chaque récit MUST être découpé en scènes. Chaque scène a un texte français, une
  illustration et un segment audio par langue disponible.
- **FR-007**: Les illustrations MUST changer à chaque scène et être animées. Les animations
  MUST être réduites ou supprimées quand le visiteur préfère réduire les mouvements.
- **FR-008**: La narration audio MUST être dans la langue d'origine. Les sous-titres français
  MUST être synchronisés avec un décalage perceptible inférieur à 0,5 s.
- **FR-009**: Le visiteur MUST pouvoir lire, mettre en pause, reprendre, régler le volume,
  choisir la langue audio, activer ou désactiver l'ambiance et passer en lecture sans audio.
- **FR-010**: Chaque audio MUST disposer d'une transcription textuelle complète consultable.
- **FR-011**: Un récit MAY contenir des points de choix à 2 options. Chaque option mène à une
  suite qui aboutit à une fin.
- **FR-012**: L'écran de fin MUST afficher la source du récit et proposer au moins 2 autres
  récits.
- **FR-013**: Chaque récit MUST avoir une adresse propre, partageable et ouvrable directement.

**Catalogue**

- **FR-014**: Le catalogue MUST lister tous les récits et permettre de les filtrer par région,
  langue, thème et type, avec des filtres cumulables.
- **FR-015**: Le catalogue MUST permettre une recherche par mot-clé sur le titre, le résumé et
  les thèmes, insensible à la casse et aux accents.

**Sources et contenu**

- **FR-016**: Chaque récit MUST afficher sa source : conteur, communauté, région, langue
  d'origine et statut juridique (domaine public, tradition orale libre ou enregistrement avec
  consentement).
- **FR-017**: La page « À propos / Sources » MUST présenter le projet, la démarche de
  préservation et chaque conteur avec ses récits.
- **FR-018**: L'ajout d'un récit MUST se faire en ajoutant ses données et médias, sans
  modifier l'application.
- **FR-019**: Le corpus MVP MUST comprendre au moins 8 récits complets, en au moins 3 langues
  nationales (dont mooré, dioula et fulfulde), issus d'au moins 5 régions.
- **FR-020**: Toute l'interface MUST être en français.

### Key Entities

- **Récit** : titre, résumé, type (conte / légende / récit historique), thèmes, durée, lieu,
  région, langues disponibles, source, statut juridique, scènes, présence d'embranchements.
- **Scène** : position ou identifiant, texte français, illustration avec texte alternatif,
  segments audio par langue, sous-titres horodatés, choix éventuel.
- **Choix** : question ou situation, deux options, chacune pointant vers une scène suivante.
- **Lieu** : nom, région, coordonnées ; il porte un ou plusieurs récits.
- **Conteur / Source** : nom (ou « tradition collective »), communauté, région, langue,
  référence de consentement, courte présentation.
- **Langue** : nom en français, code standard.
- **Thème** : libellé (sagesse, animaux, héros, origine d'un peuple…).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lors d'un test avec au moins 5 visiteurs non briefés, au moins 80 % trouvent un
  récit via la carte et lancent son écoute sans aide.
- **SC-002**: Sur téléphone, un visiteur peut aller de l'ouverture du site à la fin d'un récit
  court en moins de 5 minutes.
- **SC-003**: Sur un téléphone d'entrée de gamme en 3G, la carte est utilisable en moins de
  3 secondes après l'ouverture.
- **SC-004**: La narration d'une scène démarre en moins de 2 secondes après l'action du
  visiteur, en 3G.
- **SC-005**: 100 % des récits affichent une source complète et une transcription.
- **SC-006**: Le parcours complet (carte, aperçu, récit, choix, fin) est réalisable au seul
  clavier et au lecteur d'écran, et respecte le niveau AA des règles d'accessibilité web.
- **SC-007**: Le corpus publié couvre au moins 8 récits, 3 langues nationales et 5 régions.
- **SC-008**: Sur un appareil sans support 3D, 100 % des parcours restent réalisables en 2D.

## Assumptions

- Les récits, enregistrements audio et illustrations du MVP sont fournis ou produits par
  l'équipe, avec consentement ou dans le domaine public (constitution, principe I).
- La synchronisation des sous-titres repose sur un horodatage préparé avec le contenu.
  Aucune transcription automatique n'est prévue.
- Les « illustrations animées » sont des animations légères : mouvement, parallaxe, fondus.
  Il ne s'agit pas de vidéos.
- Un récit court dure environ 3 minutes. Les durées réelles s'affichent dans l'aperçu.
- La reprise de lecture est mémorisée uniquement sur l'appareil du visiteur. Il n'y a pas de
  compte (hors périmètre).
- La musique d'ambiance est optionnelle par récit et désactivée par défaut.
- Les récits à embranchements ont au plus un ou deux points de choix.
- **Hors périmètre** : comptes utilisateurs, paiement, enregistrement d'audio par les
  visiteurs, application mobile native, traduction de l'interface dans d'autres langues.
