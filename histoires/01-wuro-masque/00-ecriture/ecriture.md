# 01 · Wuro et le masque de feuilles — écriture

- **Peuple** : Bobo (région de Bobo-Dioulasso) · **Type** : mythe
- **Statut** : adaptation originale. La trame vient de la fiche : après la création, Wuro
  montre au premier homme, le forgeron, le masque de feuilles ; ce masque est son « fils » Dwo ;
  en le portant, les hommes peuvent agir pour le bien et rétablir l'ordre du monde.
  Le reste est **inventé pour l'image** : le forgeron tiré de la terre, le feu et le fer donnés
  par Wuro, le tourbillon, la dispute du champ, la scène du bois sacré.
  *Adaptation à vérifier auprès d'un conteur bobo.*
- **Format** : ~5 min 17, 16:9, muet, sans bulle. Textes seulement : titre, présentations des
  lieux et des personnages, générique.
- **Lien avec le n°3** : même Wuro (C01) et même Dwo (S01), mais un autre peuple et un autre
  récit. Ici Dwo n'est pas envoyé du ciel : c'est un masque que l'homme **porte**.

---

## 1. Logline

> Après avoir créé le monde, **Wuro** s'éloigne, et les hommes se querellent. Il revient en secret
> montrer au premier forgeron un costume de feuilles : c'est son fils **Dwo**. Quand le forgeron
> le porte, l'ordre revient au village.

## 2. Synopsis

**Acte 1 · Le monde neuf.** Dans le noir, Wuro allume le soleil, fait monter la terre et pousser
les arbres. Il s'accroupit et modèle un tertre : le **premier homme** en sort. Wuro lui donne le
feu, fait surgir une enclume et lui tend un marteau. L'homme forge la première houe : il est
**forgeron**. Le premier village s'élève, d'autres hommes et femmes sortent de terre, le forgeron
leur forge des houes et tous cultivent. Content, Wuro les salue et s'éloigne dans le ciel.

**Acte 2 · Le désordre.** Sans Wuro, deux cultivateurs se battent pour la limite d'un champ.
Un tourbillon de poussière traverse le village, arrache le toit d'un grenier et fait pleurer un
enfant. La nuit, le forgeron est seul devant sa forge éteinte. Il appelle le ciel. Une étoile
descend vers le bois.

**Acte 3 · Le masque.** Dans le bois sacré, Wuro apparaît. Il fait tomber les feuilles du grand
arbre et elles forment un costume de feuilles surmonté d'un masque de bois. Wuro le touche :
le costume s'anime, c'est **Dwo, son fils**. Dwo s'incline devant son père. Wuro désigne le
forgeron : « Toi, porte-le. » Dwo redevient costume, et le forgeron le reçoit. À l'aube, le
forgeron passe derrière une case et Dwo en sort. Le village a peur, puis l'Ancien reconnaît le
fils de Wuro. Dwo danse. Il sépare les deux querelleurs, qui se tendent la main. Il fait face au
tourbillon, qui s'éteint. Le mil pousse et tout le village danse. Au soir, Dwo rentre dans le bois.
Le forgeron en ressort seul, le masque reste accroché au grand arbre, et une étoile scintille.

## 3. Séquencier

| # | Lieu (décor) | Personnages | Ce qui change | Durée |
|---|---|---|---|---|
| 1 | Cosmos → terre neuve (D03) | Wuro | Titre ; Wuro allume le soleil, fait la terre et les arbres | 30 s |
| 2 | Savane neuve (D02) | Wuro, le forgeron | Le premier homme sort de terre ; feu, enclume, première houe | 40 s |
| 3 | Village bobo (D01) | Wuro, forgeron, villageois | Le village s'élève, les hommes cultivent ; Wuro s'en va | 40 s |
| 4 | Champ, village, nuit (D01) | 2 cultivateurs, mère, enfant, jeune femme, forgeron | Bagarre, tourbillon, forge éteinte, appel au ciel | 45 s |
| 5 | Bois sacré, nuit (D06) | Forgeron, Wuro, Dwo | Les feuilles forment le masque, Dwo s'anime, Wuro le confie | 55 s |
| 6 | Village, aube (D01) | Forgeron → Dwo, villageois | Le forgeron porte le masque ; peur puis respect | 25 s |
| 7 | Village (D01) | Dwo, tous | Danse, réconciliation, tourbillon apaisé, le mil pousse | 50 s |
| 8 | Bois sacré, soir (D06) | Dwo, forgeron | Dwo rentre au bois, le masque est accroché ; générique | 32 s |

**Total ≈ 5 min 17** (317 s), durées réelles de l'animation.

## 4. Personnages et habits (corps du casting, habits propres à l'histoire)

| Rôle | Casting | Habits |
|---|---|---|
| Wuro | C01 géant | boubou d'or (par défaut) |
| Le forgeron, premier homme | C03 colosse | pagne de cuir rayé, bracelets de fer |
| Cultivateur querelleur 1 | C08 trapu | tunique rouge, sans chapeau |
| Cultivateur querelleur 2 | C04 filiforme | tunique bleue à chevrons |
| Mère | C02 ronde | camisole verte, jupe jaune, foulard rouge |
| Jeune femme | C07 élancée | camisole jaune, jupe bleue à points |
| Enfant | C05 enfant | tunique orange |
| L'Ancien | C06 ancien | boubou écru rayé, bonnet vert |
| Dwo | S01 | costume de feuilles |

Accessoires nouveaux (bibliothèque) : feu, enclume, marteau, houe, tourbillon, costume de
feuilles vide (`masqueFeuilles`). Décor nouveau : **D06 bois sacré**.

## 5. Script visuel

Les seuls textes à l'écran sont signalés par **[TEXTE clé]** (voir [`textes/fr.js`](../textes/fr.js)).

### Scène 1 · Le commencement (0:00–0:30)
- Noir. Un point de lumière grossit : Wuro flotte dans le vide. **[TEXTE titre / sous_titre]**
- Wuro abaisse les mains : la terre monte du bas de l'image.
- Il serre une boule de feu contre lui et la lance vers l'horizon : le soleil se lève, le ciel
  s'éclaire et les étoiles s'effacent.
- Les arbres poussent d'un coup. **[TEXTE perso_wuro]** Wuro descend et pose les pieds sur la terre.

### Scène 2 · Le premier homme (0:30–1:10)
- Savane vide. **[TEXTE lieu_terre]** Wuro arrive et s'accroupit, les mains au-dessus du sol.
- Un tertre de terre gonfle, puis un homme massif en sort. Il ouvre les yeux, regarde ses mains,
  puis Wuro. **[TEXTE perso_forgeron]**
- Wuro dépose une boule de lumière au sol et le feu prend. L'homme recule, puis se réchauffe.
- Wuro désigne le sol : une enclume surgit. Il tend un marteau à l'homme.
- Assis devant l'enclume, l'homme frappe, et les étincelles volent. Il lève la première houe.
  Wuro rit.

### Scène 3 · Les hommes (1:10–1:50)
- Les maisons de banco et les greniers s'élèvent un à un. **[TEXTE lieu_village]**
- Wuro ouvre les bras : des hommes, des femmes, un enfant et un ancien sortent de terre.
- Le forgeron passe devant chacun et une houe apparaît dans leur main. Tous cultivent en rythme
  et le mil sort de terre.
- Wuro les regarde, salue de la main et s'élève dans le ciel. Tous lui répondent d'un signe.

### Scène 4 · Le désordre (1:50–2:35)
- Champ : deux cultivateurs piochent de part et d'autre d'un piquet. Leurs houes se croisent,
  ils se disputent, se poussent. L'un tombe, se relève, furieux.
- Village : un tourbillon de poussière traverse la place. Le toit d'un grenier s'envole, les femmes
  se protègent la tête, l'enfant pleure.
- Nuit : le forgeron est assis devant sa forge éteinte. Il se lève, appelle le ciel les bras
  levés. Une étoile grossit, puis glisse vers le bois.

### Scène 5 · La révélation (2:35–3:30)
- Le bois sacré, de nuit. **[TEXTE lieu_bois]** Le forgeron avance, inquiet.
- Une lumière tombe : Wuro est là. Le forgeron s'agenouille, Wuro le relève d'un geste.
- Wuro lève les bras vers le grand arbre. Les feuilles tombent, tourbillonnent et forment un
  costume de feuilles surmonté d'un masque de bois.
- Wuro le touche : le costume s'anime. **[TEXTE perso_dwo]** Dwo s'incline, Wuro pose la main
  sur sa tête.
- Wuro montre le forgeron, puis Dwo. Dwo tourne sur lui-même et redevient costume. Le forgeron
  le reçoit dans ses bras.
- Wuro bénit le forgeron et remonte au ciel en lumière. Le forgeron repart vers le village,
  décidé.

### Scène 6 · Le premier masque (3:30–3:55)
- Aube. Le forgeron traverse le village avec le costume et passe derrière une case.
- Les feuilles frémissent au-dessus du toit, et Dwo sort de derrière la case.
- Les villageois sortent : peur, recul. L'Ancien s'avance, reconnaît Dwo et s'incline.

### Scène 7 · La danse de Dwo (3:55–4:45)
- Dwo danse au centre et les villageois frappent dans leurs mains.
- Il secoue ses feuilles entre les deux querelleurs, qui baissent les bras et se serrent la main.
- Le tourbillon revient. Dwo lui fait face, les bras ouverts : le tourbillon rétrécit et
  disparaît.
- Le mil sort de terre et tout le village danse avec Dwo.

### Scène 8 · Épilogue (4:45–5:17)
- Soir, au bois sacré. Dwo rentre dans le bois, se retourne une dernière fois et disparaît
  derrière le grand arbre.
- Le forgeron en ressort seul, apaisé. Le costume de feuilles est accroché à l'arbre.
- Il lève les yeux : une étoile scintille. Fondu au noir. **[TEXTE fin]**, **[TEXTE credits_*]**
