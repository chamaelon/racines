# Motifs des objets et des habits

Déposez ici vos images au format `type-objet-numero.png`, puis relancez `npm run dev` ou poussez sur GitHub. Le site les repère tout seul.

| Partie | Rôle | Exemple |
| --- | --- | --- |
| `type` | Sert à vous repérer : `vetement`, `poterie`, `chapeau`… Un mot en minuscules, sans accent. | `vetement` |
| `objet` | Le modèle à habiller, à prendre dans les listes ci-dessous. | `griot` |
| `numero` | Pour avoir plusieurs motifs du même objet. | `1` |

Exemples : `vetement-griot-1.png`, `poterie-canari-2.png`, `chapeau-chapeau-peul-1.png`, `vetement-jeune_fille-1.png`.

## L'image

- **Carrée**, de 1024 × 1024 px de préférence.
- **Le fond transparent laisse voir le modèle** : sur un canari, seule la terre reste visible autour du motif. Une image sans transparence couvre tout.
- **L'image fait une fois le tour de l'objet** : si le motif doit se répéter dix fois, il doit être répété dans l'image.
- **Le haut de l'image va vers le haut de l'objet.** Certains modèles sont déroulés différemment : vérifiez dans le navigateur.

## Où ça s'affiche

- **Dans le jeu :** le motif de plus petit numéro habille l'objet ou le personnage.
- **Sur la fiche Patrimoine :** après « Tourner en 3D », un menu « Motif » permet de les comparer.

## Selon le peuple

Un objet commun à plusieurs peuples peut porter des motifs différents. Dans `peuples.json`, on attribue une image à un peuple :

```json
{
 "Bissa": { "images": { "canari": "poterie-canari-2.png" } }
}
```

Le jeu choisit alors ce motif dans les récits de ce peuple. Le nom du peuple doit être écrit comme dans le site : par exemple `Samo (San)` ou `Marka (Dafing)`.

Tant qu'aucune image n'existe, une entrée `composition` dessine un motif à partir de formes :

```json
{
 "Bissa": { "composition": { "forme": "triangle", "couleurs": ["#2a1a10", "#f2dfb8"], "position": "haut", "rangs": 2, "nombre": 18 } }
}
```

- `forme` : `triangle`, `carre`, `losange` ou `cercle`.
- `position` : `haut`, `milieu`, `bas` ou `partout`.
- `rangs` : le nombre de rangées. `nombre` : le nombre de formes sur le tour.

**Les compositions actuelles de `peuples.json` sont des démonstrations inventées, pas des motifs relevés.** Le site les signale comme telles. Remplacez-les par de vrais motifs avant de les présenter comme ceux d'un peuple.

## Objets

`adone`, `arc-fleches`, `balafon`, `bateba`, `bendre`, `bogolan`, `calebasse`, `canari`, `case-ronde`, `chapeau-peul`, `chapeau-sapone`, `daba`, `defenses`, `dolo`, `dozo-fani`, `etalon`, `faso-dan-fani`, `grenier`, `gyil`, `maison-tiebele`, `masque-bwa`, `masque-karanga`, `masque-molo`, `mortier-pilon`, `mosquee-bobo`, `mur-loropeni`, `pirogue`, `soufflet`, `soukala`, `soumbala`, `tabouret-lobi`, `tambour`, `to`

## Personnages

Le motif va sur leur étoffe : `ancien`, `araignee`, `cameleon`, `cavalier`, `chasseur`, `commandant`, `crapaud`, `createur`, `crocodile`, `devin`, `elephant`, `enfant`, `esprit`, `explorateur`, `femme`, `forgeron`, `garde`, `gazelle`, `genie`, `griot`, `griotte`, `guerrier`, `guerriere`, `hyene`, `jeune`, `jeune_fille`, `lievre`, `marabout`, `marchande`, `masque`, `paysan`, `reine`, `roi`, `serpent`, `vieille`
