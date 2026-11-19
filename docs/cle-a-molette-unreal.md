# Clé à molette de 12 po (Unreal Engine, Blender)

La clé à molette du site (« Westcott », 12 po) s'exporte en glTF binaire (`.glb`), en mètres, Y vers le haut.

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
| [`SM_Cle_A_Molette_12po.glb`](https://frankyray21.github.io/pieces-3d/equipment/cle-a-molette/unreal/SM_Cle_A_Molette_12po.glb) (2,5 Mo) | La clé de 12 po couchée à plat, mâchoires entrouvertes. Trois maillages à l'échelle 1 : `SM_Cle_A_Molette_12po_Corps`, `…_Machoire` et `…_Molette` (724, 304 et 212 triangles). Un matériau `M_Cle_A_Molette` et trois textures. |

## Import dans Unreal Engine 5

1. Glisser `SM_Cle_A_Molette_12po.glb` dans le Content Browser (import glTF d'Interchange). Il donne trois Static
   Mesh, un matériau et trois textures. Chaque maillage est à sa grandeur réelle : garder l'échelle 1.
2. Pour la clé complète posée dans le niveau : File › Import Into Level, qui garde la mâchoire et la molette à
   leur place sous le corps (`Cle_A_Molette_12po` et ses deux enfants).
3. Pour ouvrir ou fermer la mâchoire : la déplacer le long de l'axe X de son nœud (`…_Machoire`), tourné de
   22,5° par rapport au manche. Vers −X elle s'ouvre, vers +X elle se ferme ; la course de fermeture (25,3 mm)
   est inscrite dans les « extras » du nœud. La molette tourne autour de l'axe X de son nœud.
4. Si le relief paraît inversé (creux à la place des bosses), cocher « Flip Green Channel » sur la texture de
   normales : elle est au format OpenGL, celui du glTF.
5. Texture `T_Cle_A_Molette_mr` : rugosité dans le canal vert, métal dans le canal bleu (le rouge, plein, ne
   sert pas). L'import glTF la branche tout seul.

Repère : l'import glTF d'Unreal convertit en centimètres, Z vers le haut : X d'Unreal = X du glTF, Y d'Unreal = Z du
glTF, Z d'Unreal = Y du glTF.

## Repère de la clé

Le corps est couché à plat : manche le long de Z (la tête vers −Z, le bout du manche vers +Z), largeur le long de X
(la mâchoire mobile du côté −X), épaisseur le long de Y. L'origine est celle du modèle d'origine, à mi-épaisseur,
à 179 mm du bec et à 126 mm du bout du manche. Pour poser la clé sur une surface, la monter de 9 mm (la moitié
de l'épaisseur à la molette).

## Cotes

| Longueur | Largeur de tête | Épaisseur du corps | Épaisseur à la molette | Ouverture montrée | Masse calculée (acier) |
|---|---|---|---|---|---|
| 304,8 mm (12 po) | 67,7 mm | 16,4 mm | 17,9 mm | 25,3 mm | 0,65 kg |

Ces cotes sont aussi dans les « extras » du nœud `Cle_A_Molette_12po`.

## Ce qui est fidèle, et ce qui ne l'est pas

- Le modèle d'origine représente une clé marquée « 12"-300mm » ; il mesure 327 mm, ramenés à 304,8 mm. À cette
  échelle, son épaisseur (18 mm) et sa masse calculée (0,65 kg) sont de l'ordre de celles d'une clé de 12 po du
  commerce. Aucune cote ne vient d'un catalogue.
- La texture porte « 12"-300mm » et « ToolMaster » dans la cuvette du manche.
- Trois pièces seulement : l'axe de la molette et son ressort ne font pas partie du modèle. La molette ne tourne
  pas toute seule quand on déplace la mâchoire.
- C'est un maillage allégé pour le jeu (1 240 triangles) : de près, les arrondis sont à facettes. Le maillage de
  la mâchoire a quelques arêtes ouvertes au bout de sa tige, et ce bout, caché dans la tête, n'est pas texturé
  (il paraît noir si l'on sort la mâchoire) ; le matériau est à deux faces, comme celui d'origine.
- Le fichier a été relu dans un navigateur avec three.js. L'import dans Unreal n'a pas été essayé depuis ce
  dépôt.
