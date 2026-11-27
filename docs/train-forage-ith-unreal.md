# Train de forage ITH (Unreal Engine, Blender)

Chaque pièce du train de forage ITH des Cubex (procédures PRO-OP-ITH-001, 004 et 016) s'exporte en glTF binaire
(`.glb`), en mètres, Y vers le haut, avec ses textures PBR usées incluses dans le fichier.

```
node scripts/export-train-ith-unreal.mjs            # toutes les pièces
node scripts/export-train-ith-unreal.mjs Bit_8 Tige  # seulement les pièces dont le nom contient ces mots
node scripts/export-train-ith-unreal.mjs --qualite 2048   # textures jusqu'à 2K (1K par défaut)
```

Il faut Python 3 avec numpy et Pillow : `tools/textures_train_ith.py` fabrique les textures (environ 35 s pour tout).

## Ce que contient un fichier

- Une pièce tournée (tige, marteau, bit, driver sub, saver sub, casse-bit) est **un seul maillage** avec **un seul
  matériau** `M_<pièce>` et sa texture propre : couleur (`_C`), normales OpenGL (`_N`), et `_ORM` (occlusion R,
  rugosité V, métal B). U fait le tour de l'axe sans couture ; V suit le profil. La peinture est partie aux arêtes,
  sur les bouts et en longues rayures (mâchoires, tables) ; l'acier nu est piqué de rouille ; les filets sont
  graissés et sombres ; une crasse sombre et humide salit les bouts (pas de poussière claire).
- Les bits ont deux maillages de plus : `_Boutons` (carbure) et `_TubeDePied` (plastique blanc). Les casse-bits ont
  `_Ergots`. Les anneaux de retenue sont deux maillages, une moitié chacun (`_A`, `_B`).
- Le chariot (`SM_Chariot_Marteau.glb`) a un maillage par zone : cadre rouge, essieu, roues (pneu, jante, moyeu),
  poignées gainées, avec des textures répétées (tuile de 500 mm). La chaîne est dans `SM_Chariot_Chaine.glb`, déjà à
  sa place : importer les deux fichiers au même endroit.
- `pieces.json` donne, pour chaque fichier, la masse à mettre dans la physique (masse publiée pour les marteaux,
  calculée pour le reste), la taille et le nombre de triangles.

## Repère

Pièce debout, **origine au centre de la face du bas** : la face du bas du fourreau pour un marteau (le driver sub
se met dessous, `SM_DriverSub_*` a son origine au bas lui aussi), la face de coupe pour un bit (queue vers le haut,
comme posé dans le casse-bit), le dessous du fût pour un casse-bit, le sol pour le chariot (le marteau de 6 po se
pose à l'origine, sur le pied, avec son driver sub). Tiges : filet mâle en haut, femelle en bas.

L'import glTF d'Unreal convertit en centimètres, Z vers le haut : X d'Unreal = X du glTF, Y d'Unreal = Z du glTF,
Z d'Unreal = Y du glTF.

## Monter le train de forage dans Unreal

Le marteau se visse dans le saver sub, puis les tiges s'ajoutent entre les deux (PRO-OP-ITH-016, PRO-OP-ITH-004).
Hauteurs utiles (mm), à partir de l'origine de chaque pièce :

| Pièce | Hauteur hors tout | Épaulement (où la pièce suivante s'appuie) |
|---|---|---|
| Tige 4 / 5 / 6 pi | 1295 / 1600 / 1905 (filet compris) | 1219 / 1524 / 1829 |
| Marteau 3 / 4 / 6 po (sans driver sub) | 923 / 1019 / 1218 | 847 / 943 / 1123 |
| Driver sub 3 / 4 / 6 po | 119 / 145 / 206 | dépasse de 78 / 95 / 135 sous le fourreau |

## Import dans Unreal Engine 5

1. Glisser les `.glb` dans le Content Browser (import glTF d'Interchange) : un Static Mesh, un matériau et ses
   textures par pièce. Garder l'échelle 1 : les pièces sont à leur taille réelle.
2. Si le relief paraît inversé (rayures en bosse), cocher « Flip Green Channel » sur les textures `_N` : elles sont
   au format OpenGL, celui du glTF.
3. Pour la physique, mettre la masse de `pieces.json` (Mass in Kg) : le marteau de 6 po pèse 95,7 kg (211 lb).
4. Collision : une capsule ou un cylindre suffit pour les tiges et les marteaux ; « Use Complex Collision As Simple »
   pour le chariot si on veut y poser le marteau.

## Fichiers publiés avec le site

| Fichier | Mo | Triangles | Taille (mm) | Masse (kg) |
|---|---|---|---|---|
| [`SM_Tige_4pi_Jaune.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Tige_4pi_Jaune.glb) | 1.29 | 27072 | 89 × 1295 × 89 | 22,4 |
| [`SM_Tige_4pi_Noire.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Tige_4pi_Noire.glb) | 1.29 | 27072 | 89 × 1295 × 89 | 22,4 |
| [`SM_Tige_5pi_Jaune.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Tige_5pi_Jaune.glb) | 1.29 | 27072 | 89 × 1600 × 89 | 26,4 |
| [`SM_Tige_5pi_Noire.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Tige_5pi_Noire.glb) | 1.29 | 27072 | 89 × 1600 × 89 | 26,4 |
| [`SM_Tige_6pi_Jaune.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Tige_6pi_Jaune.glb) | 1.29 | 27072 | 89 × 1905 × 89 | 30,3 |
| [`SM_Tige_6pi_Noire.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Tige_6pi_Noire.glb) | 1.29 | 27072 | 89 × 1905 × 89 | 30,3 |
| [`SM_Marteau_3po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Marteau_3po.glb) | 0.76 | 14832 | 82 × 923 × 82 | 27,2 |
| [`SM_DriverSub_3po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_DriverSub_3po.glb) | 0.3 | 6144 | 79 × 119 × 79 | 0,9 |
| [`SM_Anneaux_3po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Anneaux_3po.glb) | 0.15 | 976 | 63 × 18 × 63 | 0,2 |
| [`SM_Marteau_4po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Marteau_4po.glb) | 0.81 | 15984 | 100 × 1019 × 100 | 40,4 |
| [`SM_DriverSub_4po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_DriverSub_4po.glb) | 0.34 | 6912 | 97 × 145 × 97 | 1,8 |
| [`SM_Anneaux_4po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Anneaux_4po.glb) | 0.15 | 976 | 75 × 22 × 75 | 0,3 |
| [`SM_Marteau_6po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Marteau_6po.glb) | 0.96 | 17712 | 142 × 1218 × 142 | 95,7 |
| [`SM_DriverSub_6po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_DriverSub_6po.glb) | 0.54 | 9984 | 139 × 206 × 139 | 5,9 |
| [`SM_Anneaux_6po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Anneaux_6po.glb) | 0.15 | 976 | 104 × 31 × 104 | 0,6 |
| [`SM_Bit_3_5_8po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Bit_3_5_8po.glb) | 0.49 | 6624 | 92 × 263 × 92 | 6 |
| [`SM_Bit_4_1_2po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Bit_4_1_2po.glb) | 0.49 | 6624 | 114 × 311 × 114 | 10,5 |
| [`SM_Bit_5_1_8po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Bit_5_1_8po.glb) | 0.53 | 6624 | 130 × 318 × 130 | 13,2 |
| [`SM_Bit_6po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Bit_6po.glb) | 0.59 | 6624 | 152 × 416 × 152 | 24,8 |
| [`SM_Bit_6_1_2po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Bit_6_1_2po.glb) | 0.6 | 6624 | 165 × 422 × 165 | 28,1 |
| [`SM_Bit_8po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Bit_8po.glb) | 0.61 | 7344 | 203 × 438 × 203 | 41,1 |
| [`SM_Bit_10po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Bit_10po.glb) | 0.81 | 9144 | 254 × 459 × 254 | 67,1 |
| [`SM_SaverSub_2_3_8.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_SaverSub_2_3_8.glb) | 1.3 | 25728 | 144 × 287 × 144 | 16,4 |
| [`SM_SaverSub_3_1_2.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_SaverSub_3_1_2.glb) | 1.3 | 25728 | 170 × 306 × 170 | 20,6 |
| [`SM_CasseBit_6po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_CasseBit_6po.glb) | 0.25 | 1712 | 221 × 265 × 221 | 35,8 |
| [`SM_CasseBit_6_1_2po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_CasseBit_6_1_2po.glb) | 0.33 | 1712 | 235 × 265 × 235 | 37,3 |
| [`SM_CasseBit_8po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_CasseBit_8po.glb) | 0.34 | 1712 | 276 × 265 × 276 | 41,9 |
| [`SM_CasseBit_10po.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_CasseBit_10po.glb) | 0.35 | 1712 | 331 × 265 × 331 | 48,9 |
| [`SM_Chariot_Marteau.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Chariot_Marteau.glb) | 0.49 | 4384 | 560 × 1166 × 427 | 25 |
| [`SM_Chariot_Chaine.glb`](https://frankyray21.github.io/pieces-3d/equipment/train-forage-ith/unreal/SM_Chariot_Chaine.glb) | 0.37 | 9216 | 238 × 175 × 109 | 0,8 |

Sources des cotes et hypothèses : fiche de l'équipement sur le site
(https://frankyray21.github.io/pieces-3d/#train-forage-ith.P01, « Fiche technique ») et en-tête de
`src/models/train-forage-ith/forme.js`.
