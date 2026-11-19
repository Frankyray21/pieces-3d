# Étui en cuir de la clé à molette (Unreal Engine, Blender)

L'étui en cuir du site, porté à la ceinture du mineur, s'exporte en glTF binaire (`.glb`), en mètres, Y vers le
haut.

```
node scripts/export-etui-unreal.mjs --textures <dossier>
```

`--textures` donne le dossier des trois textures de la clé à molette (`diff.png`, `nor.png`, `mr.png`), écrites par
`node tools/cle_molette_mesh.mjs <adjustable_wrench.glb> --textures <dossier>` (voir
[`cle-a-molette-unreal.md`](cle-a-molette-unreal.md)). L'étui lui-même n'a pas de texture.

## Fichiers publiés avec le site

| Fichier | Contenu |
|---|---|
| [`SM_Etui_Cle_A_Molette.glb`](https://frankyray21.github.io/pieces-3d/equipment/etui-cle-molette/unreal/SM_Etui_Cle_A_Molette.glb) (0,25 Mo) | L'étui seul, en un maillage de 2 272 triangles à deux matériaux : `M_Etui_Cuir` (brun, sans texture) et `M_Etui_Rivet` (acier). UV en projection par boîte, 1 unité = 10 cm. |
| [`etui-avec-cle.glb`](https://frankyray21.github.io/pieces-3d/equipment/etui-cle-molette/unreal/etui-avec-cle.glb) (2,8 Mo) | L'étui et la clé à molette de 12 po rangée dedans, manche en bas, mâchoires fermées. La clé garde ses trois maillages (corps, mâchoire, molette), son matériau `M_Cle_A_Molette` et ses trois textures. |

## Import dans Unreal Engine 5

1. **L'étui seul** : glisser `SM_Etui_Cle_A_Molette.glb` dans le Content Browser (import glTF d'Interchange). Il
   donne un Static Mesh à deux emplacements de matériau. Garder l'échelle 1.
2. **Le cuir** : `M_Etui_Cuir` n'est qu'une couleur brune unie. Pour un vrai cuir, mettre à sa place un matériau de
   cuir de sa bibliothèque : les UV sont en projection par boîte, 1 unité pour 10 cm, donc une texture qui se
   répète s'y pose sans déformation (régler le « tiling » à son goût).
3. **L'étui avec la clé** : File › Import Into Level avec `etui-avec-cle.glb`, qui garde la clé à sa place dans
   l'étui (`Cle_A_Molette_12po` et ses deux enfants).
4. **Sur un personnage** : attacher l'étui à un socket de la ceinture. L'axe de la ceinture est l'axe X de
   l'étui ; son centre, dans le repère de l'étui, est à Y = 90,8 mm et Z = −6,5 mm (valeurs inscrites dans les
   « extras » du nœud, pour une ceinture de 2 1/2 po).

Repère : l'import glTF d'Unreal convertit en centimètres, Z vers le haut : X d'Unreal = X du glTF, Y d'Unreal = Z du
glTF, Z d'Unreal = Y du glTF.

## Repère de l'étui

L'étui est debout, comme il est porté : Y vers le haut depuis le bord du bas, X sa largeur, Z vers l'extérieur
(loin du corps). L'origine est au milieu du bord du bas, sur la face avant du dos — la face contre laquelle la clé
repose. Le passant de ceinture est derrière (Z négatif).

## Cotes

| Hauteur | Largeur en haut | Largeur en bas | Profondeur | Cuir | Rivets |
|---|---|---|---|---|---|
| 127 mm (5 po) | 76 mm (3 po) | 64 mm (2 1/2 po) | 38 mm (1 1/2 po) | 3,5 mm | 4, tête de 9 mm |

La clé rangée dépasse de 67 mm au-dessus de l'étui et de 111 mm au-dessous.

## Ce qui est fidèle, et ce qui ne l'est pas

- L'étui est reconstitué d'après une seule photo de 44 × 96 pixels, sans plan ni cote. L'échelle vient de la clé,
  prise pour une 12 po : chaque lecture est juste à environ 8 mm près.
- Relevé sur la photo : la hauteur, la largeur en haut et en bas, les deux rivets des coins du bas, et la clé
  rangée manche en bas, mâchoires vers le haut.
- Supposé, parce que caché ou illisible : le dos et le passant de ceinture, les deux rivets du haut, l'épaisseur
  et la couleur du cuir, et la profondeur, reprise d'un étui de mineur du commerce.
- Non modélisé : coutures, marque ou estampille.
- La pose de la clé dans l'étui est calculée (les épaules de sa tête s'appuient sur la gueule du fourreau), pas
  relevée ; elle tombe à 8 mm de ce que montre la photo.
- Le cuir est rigide dans le modèle : il ne se déforme pas autour de la clé ni de la ceinture.
- Les fichiers ont été relus dans un navigateur avec three.js. L'import dans Unreal n'a pas été essayé depuis ce
  dépôt.
