# Clés à tuyau et support à pipewrench (Unreal Engine, Blender)

Les neuf clés à tuyau droites du site et le support à pipewrench 0102806 s'exportent en glTF binaire (`.glb`), en
mètres, Y vers le haut.

```
node scripts/export-cles-unreal.mjs --textures <dossier des textures de Poly Haven>
```

Les textures de la clé (2K) ne sont pas dans le dépôt : le dossier doit contenir `pipe_wrench_diff_2k.jpg`,
`pipe_wrench_nor_gl_2k.jpg` et `pipe_wrench_arm_2k.jpg`, téléchargés de
https://dl.polyhaven.org/file/ph-assets/Models/jpg/2k/pipe_wrench/ (clé à tuyau de Poly Haven, CC0, Will Evarts ;
`--res 4k` pour les fichiers 4K, trois fois plus lourds).

## Fichiers publiés avec le site

| Fichier | Contenu |
|---|---|
| [`SM_Cles_A_Tuyau.glb`](https://frankyray21.github.io/pieces-3d/equipment/cles-a-tuyau/unreal/SM_Cles_A_Tuyau.glb) (12,8 Mo) | Les neuf grandeurs (6, 8, 10, 14, 18, 24, 36, 48 et 60 po), mâchoires presque fermées. Un maillage par grandeur (`SM_Cle_A_Tuyau_06po` … `_60po`), à l'échelle 1, 10 746 triangles chacun ; un matériau `M_Cle_A_Tuyau` et trois textures partagés. |
| [`SM_Support_Pipewrench.glb`](https://frankyray21.github.io/pieces-3d/equipment/support-pipewrench/unreal/SM_Support_Pipewrench.glb) (1,3 Mo) | Le support seul, en un maillage de 11 656 triangles, matériau `M_Support_Rouge`, UV en projection par boîte (1 unité = 1 m). Origine au sol, au milieu de la base. |
| [`support-avec-cles.glb`](https://frankyray21.github.io/pieces-3d/equipment/support-pipewrench/unreal/support-avec-cles.glb) (12,3 Mo) | Le support, les clés de 18, 24 et 36 po posées en contre-clé (mâchoires vers le haut, ouvertes à 69,9 mm) et une tige NQ pour chacune. Les trois mises en situation sont superposées dans le même fichier. |
| [`support-avec-cles.json`](https://frankyray21.github.io/pieces-3d/equipment/support-pipewrench/unreal/support-avec-cles.json) | Pose de chaque clé et de sa tige, en mètres du glTF et en centimètres d'Unreal. |

## Import dans Unreal Engine 5

1. **Les clés seules** : glisser `SM_Cles_A_Tuyau.glb` dans le Content Browser (import glTF d'Interchange). Il donne
   neuf Static Mesh, un matériau et trois textures. Chaque maillage est à sa grandeur réelle : garder l'échelle 1.
2. **Le support seul** : glisser `SM_Support_Pipewrench.glb`. Pour passer la clé entre les oreilles, régler sa
   collision sur « Use Complex Collision As Simple » ; une boîte simple boucherait la traverse.
3. **Le support avec une clé en place** : File › Import Into Level avec `support-avec-cles.glb`, qui garde chaque
   objet à sa place. Supprimer ensuite les deux mises en situation qu'on ne veut pas : les nœuds `Cle_18po` et
   `Tige_NQ_18po`, `Cle_24po` et `Tige_NQ_24po`, `Cle_36po` et `Tige_NQ_36po`.
4. Si le relief de la clé paraît inversé (creux à la place des bosses), cocher « Flip Green Channel » sur la texture
   de normales : elle est au format OpenGL, celui du glTF.

Repère : l'import glTF d'Unreal convertit en centimètres, Z vers le haut : X d'Unreal = X du glTF, Y d'Unreal = Z du
glTF, Z d'Unreal = Y du glTF. La base du support est le long de X, la tige le long de Y.

## Repère d'une clé

Dans son maillage, une clé a son manche le long de Y (du bout du manche vers la tête), sa largeur le long de X
(l'ouverture des mâchoires regarde +X) et son épaisseur le long de Z. L'origine est à la jonction du manche et de la
tête, pas au bout du manche. Dans `SM_Cles_A_Tuyau.glb`, les nœuds couchent les clés à plat, côte à côte.

## Ce qui est fidèle, et ce qui ne l'est pas

- Chaque grandeur est ajustée aux cotes publiées des clés RIDGID « heavy-duty » droites : longueur fermée, largeur de
  tête, épaisseur à l'écrou ; la section du manche est réglée pour que la masse calculée égale le poids du catalogue
  (`src/models/cles-a-tuyau/forme.js`). Les « extras » de chaque nœud donnent la grandeur, le numéro de catalogue,
  les cotes obtenues et la masse.
- Ces cotes viennent de fiches de détaillants, qui se contredisent parfois ; aucune ne vient d'un plan du fabricant.
  Celles de la 6 po, l'épaisseur de la 8 po et la longueur de la 60 po sont estimées.
- C'est la même clé de base étirée par zones : la forme de la tête et les nervures du manche ne changent pas d'une
  grandeur à l'autre, et la marque « 18" » de la texture reste sur toutes.
- La mâchoire mobile n'est pas un objet séparé. Les clés de `support-avec-cles.glb` ont la leur reculée pour la tige
  NQ ; celles de `SM_Cles_A_Tuyau.glb` l'ont comme le modèle d'origine.
- La pose sur le support est calculée (repos par gravité sur la traverse, `pose()` dans
  `src/models/support-pipewrench/situation.js`), pas relevée : ni la clé ni la tige ne figurent au plan 0102806. La
  clé de 36 po bascule si rien ne la retient ; elle est montrée tenue dans la chape du haut.
- Les fichiers ont été relus avec une seconde bibliothèque glTF et affichés dans un navigateur. L'import dans Unreal
  n'a pas été essayé depuis ce dépôt.
