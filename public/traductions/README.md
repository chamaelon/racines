# Traduire le site

Chaque langue tient dans un fichier : `translate-<langue>.json`. À gauche, la phrase du site en français. À droite, sa traduction.

```json
{
 "@langue": "mooré",
 "Carte": "...",
 "Approche, enfant, et tends l'oreille.": "..."
}
```

## Ajouter une langue

1. Copier `translate-exemple.json` et renommer la copie, par exemple `translate-mos.json`. Le code de la langue vient de `public/data/langues.json`.
2. Écrire le nom de la langue dans `@langue`.
3. Remplir la colonne de droite. On peut s'arrêter à tout moment : une phrase laissée vide reste en français.
4. Relancer `npm run dev` ou pousser sur GitHub. La langue apparaît alors dans le menu du site et dans le jeu.

## Règles

- **Ne jamais modifier la colonne de gauche.** Le site retrouve la phrase grâce à ce texte exact.
- **`{}` tient lieu de ce qui varie** : un nombre, un nom. Il faut le garder dans la traduction. `"Région {}"` peut devenir `"{} region"`.
- **Un `{}` collé à un mot** (`"{} récit{}"`) est le pluriel français : il vaut `s` ou rien. Si le pluriel de votre langue marche autrement, écrivez simplement la forme qui convient, sans ce second `{}`.
- **Les lignes `=== ... ===`** ne servent qu'à se repérer. Laissez-les vides.
- **Le fichier doit rester un JSON valide** : guillemets, virgules. Un fichier invalide est ignoré, et le terminal dit pourquoi.

`translate-exemple.json` est régénéré à chaque lancement : y écrire ne sert à rien. Vos propres fichiers sont seulement complétés : les nouvelles phrases du site s'y ajoutent, et une traduction n'est jamais effacée. Si une phrase disparaît du site, sa traduction part à la fin du fichier.

`translate-en.json` est une traduction de travail, partielle, qui montre le résultat.

Si une histoire a aussi une traduction dans `public/bandes-son/<histoire>/pistes.json`, c'est celle-là qui prime.
