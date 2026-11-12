# Coffre à outils ITH dans un moteur de jeu (Unreal Engine)

Le coffre (`coffre-dd`) est exporté en glTF binaire pour servir d'objet
interactif dans un jeu : `public/equipment/coffre-dd/coffre-ith.glb`, aussi
servi par le site (`equipment/coffre-dd/coffre-ith.glb`).

```
node scripts/export-coffre-jeu.mjs            # refait le .glb
node scripts/export-coffre-jeu.mjs --ucx      # avec volumes de collision UCX_
```

Cet export n'a pas été essayé dans Unreal Engine : il est relu ici avec le
chargeur glTF de three.js (portes ouvertes sur leurs pivots, tiroir sorti, logo
à l'endroit). Les réglages d'import ci-dessous sont à valider dans l'éditeur.

## Essai interactif dans le navigateur

`public/equipment/coffre-dd/essai.html` (sur le site :
`equipment/coffre-dd/essai.html`) charge le même `coffre-ith.glb` et anime
chaque élément autour de son origine avec les valeurs des `extras` : clic sur
la barre, une porte ou le tiroir (ou boutons), dans l'ordre réel (barre, portes,
tiroir). Si un pivot ou un sens de rotation est faux dans le fichier, on le
voit ici avant l'import dans le moteur. three.js est copié dans `lib/` (pas de
CDN).

## Contenu du fichier

Unités en mètres, Y vers le haut (convention glTF ; Unreal convertit en
centimètres et en Z vers le haut à l'import). Coffre fermé, environ
14 000 triangles, 4 matériaux, 1 texture.

| Maillage | Origine (pivot) | Mouvement prévu |
| --- | --- | --- |
| `SM_Coffre_Caisse` | au sol, au centre du coffre | fixe (caisse, tablettes, tubes de base, pentures, oreilles, panier, glissières, logo) |
| `SM_Coffre_Porte_G` | bas de la ligne de pentures gauche | rotation autour de l'axe Y local (le long des pentures), 0 à −110° |
| `SM_Coffre_Porte_D` | bas de la ligne de pentures droite | rotation autour de Y local, 0 à +110° |
| `SM_Coffre_Barre` (enfant de la porte droite) | sur le joint des portes, à la hauteur de la barre | translation sur X local (vers la droite, à plat sur la porte), course 0,14 m (5 1/2 po) |
| `SM_Coffre_Tiroir` | milieu du bas de la façade | translation sur Z local, course 0,33 m |
| `SM_Coffre_Support_Tube` | sous la base du support | fixe (dessin 0102803), séparé pour pouvoir le déplacer ou l'enlever |

Chaque nœud porte ces valeurs dans ses `extras` glTF (`mouvement`,
`axe_local`, `angle_ouvert_deg`, `course_m`). Les axes et les signes sont ceux
du fichier glTF : après la conversion d'axes d'Unreal, vérifier le sens de
rotation dans l'éditeur. Ordre d'ouverture réel : glisser la barre vers la droite, puis
ouvrir les portes.

Matériaux : `M_Coffre_Rouge`, `M_Coffre_Blanc`, `M_Coffre_Noir` (couleur
unie, PBR métal/rugosité) et `M_Coffre_Logo` (texture `T_Coffre_Logo`, PNG
incorporé de 1108 × 436 px, agrandi du cartouche du dessin 0102803). Seul le
logo a des UV utiles ; les autres maillages ont des UV vides ou bruts, à
régénérer dans le moteur si l'on veut des textures ou des lightmaps.

## Import dans Unreal Engine 5

1. Glisser `coffre-ith.glb` dans le Content Browser (import glTF d'Interchange),
   ou « File > Import Into Level » pour recréer la hiérarchie comme acteurs.
2. Ne pas fusionner les maillages (« Combine Static Meshes » décoché) et ne
   pas cuire les transformations dans les sommets, sinon les pivots des portes
   et du tiroir reviennent à l'origine de la scène.
3. Assembler un Blueprint d'acteur : la caisse en racine, les portes, le tiroir
   et le support en composants enfants aux positions de la hiérarchie importée,
   la barre enfant de la porte droite ; animer l'ouverture par une Timeline
   (rotation relative des portes, position relative de la barre et du tiroir).
4. Collisions : l'intérieur doit rester accessible, donc pas de boîte unique
   sur la caisse. Soit « Use Complex Collision As Simple » sur la caisse, soit
   l'export `--ucx` (boîtes convexes par paroi, tablette, porte, tiroir,
   nommées `UCX_<maillage>_NN`), si l'import reconnaît cette convention pour
   le glTF ; sinon supprimer ces maillages et créer les collisions dans
   l'éditeur.

## Limites

- La barre de verrouillage coulisse à plat sur les portes (elle ne se relève
  pas). Le détail 3 du dessin 087 ne montre pas ce qui la retient : l'axe de
  1/2 po dans la fente, sur la porte droite, et le rôle des repères 1 à 3
  (appui et oreilles de cadenas) sont interprétés.

- L'épaisseur des tôles, les pentures, le tiroir, le panier et les crochets
  sont estimés (voir la fiche du coffre) ; la position du support de tube sur
  le dessus n'est cotée sur aucun dessin.
- Les tôles sont à deux couches (rouge dehors, blanc dedans) écartées de
  1,6 mm : pas de faces coplanaires, mais des niveaux de détail (LOD) générés
  automatiquement peuvent les faire se toucher de loin.
- Le contenu du coffre (outils) n'est pas modélisé.
