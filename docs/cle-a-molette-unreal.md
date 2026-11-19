# Clés à molette (Unreal Engine, Blender)

Les sept clés à molette du site (« Westcott », 6 à 24 po) s'exportent en glTF binaire (`.glb`), en mètres, Y vers le
haut.

Le modèle n'a pas été dessiné ici : c'est la clé à molette du « Tool Pack 1 » d'OpenGameArt, de LonesomeDucky,
sous licence CC0 (https://opengameart.org/content/tool-pack-1). CC0 veut dire domaine public : usage libre, même
commercial, sans attribution obligatoire.

```
node tools/cle_molette_mesh.mjs <adjustable_wrench.glb> --textures <dossier>
node scripts/export-cle-molette-unreal.mjs --textures <dossier>
```

`adjustable_wrench.glb` vient de l'archive https://opengameart.org/sites/default/files/tool_pack_1.zip. La première
commande écrit le maillage du site (`src/models/cle-a-molette/mesh.js`) et sort les trois textures du fichier en PNG
(`diff.png`, `nor.png`, `mr.png`, 1 024 px) ; la seconde écrit le fichier pour Unreal.

## Fichier publié avec le site

| Fichier | Contenu |
|---|---|
| [`SM_Cles_A_Molette.glb`](https://frankyray21.github.io/pieces-3d/equipment/cle-a-molette/unreal/SM_Cles_A_Molette.glb) (2,6 Mo) | Les sept grandeurs (6, 8, 10, 12, 15, 18 et 24 po), couchées à plat côte à côte, mâchoires entrouvertes. Par clé, trois maillages à l'échelle 1 : `SM_Cle_A_Molette_12po_Corps`, `…_Machoire` et `…_Molette` (724, 304 et 212 triangles). Un matériau `M_Cle_A_Molette` et trois textures partagés. |

## Import dans Unreal Engine 5

1. Glisser `SM_Cles_A_Molette.glb` dans le Content Browser (import glTF d'Interchange). Il donne 21 Static Mesh
   (trois par grandeur), un matériau et trois textures. Chaque maillage est à sa grandeur réelle : garder
   l'échelle 1.
2. Pour une clé complète posée dans le niveau : File › Import Into Level, qui garde la mâchoire et la molette à
   leur place sous le corps (`Cle_A_Molette_12po` et ses deux enfants). Supprimer ensuite les grandeurs dont on
   ne veut pas.
3. Pour ouvrir ou fermer la mâchoire : la déplacer le long de l'axe X de son nœud (`…_Machoire`), tourné de
   22,5° par rapport au manche. Vers −X elle s'ouvre, vers +X elle se ferme ; la course de fermeture est inscrite
   dans les « extras » du nœud (25,3 mm pour la 12 po). La molette tourne autour de l'axe X de son nœud.
4. Si le relief paraît inversé (creux à la place des bosses), cocher « Flip Green Channel » sur la texture de
   normales : elle est au format OpenGL, celui du glTF.
5. Texture `T_Cle_A_Molette_mr` : rugosité dans le canal vert, métal dans le canal bleu (le rouge, plein, ne
   sert pas). L'import glTF la branche tout seul.

Repère : l'import glTF d'Unreal convertit en centimètres, Z vers le haut : X d'Unreal = X du glTF, Y d'Unreal = Z du
glTF, Z d'Unreal = Y du glTF.

## Repère d'une clé

Dans son maillage, le corps est couché à plat : manche le long de Z (la tête vers −Z, le bout du manche vers +Z),
largeur le long de X (la mâchoire mobile du côté −X), épaisseur le long de Y. L'origine est celle du modèle
d'origine, dans le manche, à peu près au milieu de la clé. Dans le fichier, les nœuds posent les clés sur le plan
Y = 0, bouts de manche alignés en Z = 0, de la plus petite à la plus grande le long de X.

## Cotes par grandeur

| Grandeur | Longueur | Largeur de tête | Épaisseur à la molette | Ouverture montrée | Masse calculée (acier) |
|---|---|---|---|---|---|
| 6 po | 152 mm | 34 mm | 9,0 mm | 13 mm | 0,08 kg |
| 8 po | 203 mm | 45 mm | 12,0 mm | 17 mm | 0,19 kg |
| 10 po | 254 mm | 56 mm | 15,0 mm | 21 mm | 0,38 kg |
| 12 po | 305 mm | 68 mm | 17,9 mm | 25 mm | 0,65 kg |
| 15 po | 381 mm | 85 mm | 22,4 mm | 32 mm | 1,3 kg |
| 18 po | 457 mm | 102 mm | 26,9 mm | 38 mm | 2,2 kg |
| 24 po | 610 mm | 135 mm | 35,9 mm | 51 mm | 5,2 kg |

Ces cotes sont aussi dans les « extras » de chaque nœud du fichier.

## Ce qui est fidèle, et ce qui ne l'est pas

- Le modèle d'origine représente une clé marquée « 12"-300mm » ; il mesure 327 mm, ramenés à 305 mm pour la 12 po.
  À cette échelle, son épaisseur (18 mm) et sa masse calculée (0,65 kg) sont de l'ordre de celles d'une clé de
  12 po du commerce.
- Les autres grandeurs sont des copies à l'échelle, réglées sur la longueur nominale. Les vraies clés ne sont pas
  des copies à l'échelle les unes des autres : une petite est plus trapue, une grande plus élancée. Largeur,
  épaisseur et masse s'écartent donc de celles des catalogues aux deux bouts de la gamme. Aucune cote ne vient d'un
  catalogue.
- Le marquage « 12"-300mm » et « ToolMaster » de la texture reste le même sur toutes les grandeurs.
- Trois pièces seulement : l'axe de la molette et son ressort ne font pas partie du modèle. La molette ne tourne
  pas toute seule quand on déplace la mâchoire.
- C'est un maillage allégé pour le jeu (1 240 triangles par clé) : de près, les arrondis sont à facettes. Le
  maillage de la mâchoire a quelques arêtes ouvertes au bout de sa tige ; le matériau est à deux faces, comme
  celui d'origine.
- Le fichier a été relu dans un navigateur avec three.js. L'import dans Unreal n'a pas été essayé depuis ce
  dépôt.
