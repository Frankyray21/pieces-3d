# Air, eau et électricité dans Unreal Engine

Le lot `air-eau-electricite` (place de travail ITH Cubex) est exporté en glTF
binaire pour le simulateur SST :

```
node tools/air_eau_elec_textures.mjs        # refait les textures (Chromium, Playwright)
node scripts/export-air-eau-elec-unreal.mjs # refait les .glb
```

Fichiers dans `public/equipment/air-eau-electricite/unreal/` (aussi servis par
le site, `equipment/air-eau-electricite/unreal/…`) :

| Fichier | Contenu |
| --- | --- |
| `SM_AEE_P00_Place_de_travail.glb` | les quatre lots posés ensemble, mur à z = 0 |
| `SM_AEE_P01_Air.glb` | boyaux d'air de 2 po basse et haute pression, tressé inox 800 °F, gaine spiralée, tiges, écrous à oreilles (stem nuts), embouts mâles, whip checks |
| `SM_AEE_P02_Eau.glb` | boyau d'eau de 1 po, raccords, whip check |
| `SM_AEE_P03_Electricite.glb` | câble 600 V, crochets au mur, console 600 V (armoire, boîtier inox, porte vitrée, conduit, transformateur), boîte de défaut à la terre, arrêt d'urgence, crochets de plastique, câble de commande |
| `SM_AEE_P04_Balisage.glb` | trépieds, bidons de 20 L, banderole DANGER |

## Contenu

- Mètres, Y vers le haut (convention glTF) : Unreal convertit en centimètres
  et en Z vers le haut à l'import.
- Un nœud par pièce de la fiche : `SM_AEE_<page>_<repère>_<nom>_<n>` (ex.
  `SM_AEE_P03_05_PORTE_VITREE_du_boitier_1`). La porte vitrée est un nœud à
  part : on peut l'ouvrir (charnières du côté droit du boîtier inox).
- Matériaux PBR `M_AEE_<nom>` : texture de couleur (saleté, boue, coulures,
  éclats de peinture, rouille, inscriptions) et normales, JPEG de 1 024 px
  incorporés ; rugosité et métal en valeurs. La fenêtre (`M_AEE_vitre`) est
  translucide (alpha BLEND).
- UV en mètres (tuiles qui se répètent) : garder « Wrap » sur les textures.

## Import (Unreal Engine 5)

1. Glisser le `.glb` dans le Content Browser (ou Import), Interchange glTF.
2. Pour placer les pièces une à une : décocher « Combine Meshes » ; pour un
   bloc décoratif : le cocher.
3. Collisions : « Generate Missing Collision » suffit pour les boîtiers ; pour
   les boyaux et câbles au sol, une collision complexe ou aucune.

Cet export n'a pas encore été essayé dans Unreal : il est relu avec le
chargeur glTF de three.js (textures et pivots en place).

## Limites

Les boyaux et câbles sont des maillages figés sur leur tracé : pour les
déplacer en jeu, il faudrait les refaire en Spline Mesh dans Unreal (le
maillage d'un mètre de boyau, avec sa texture, s'y prête).
