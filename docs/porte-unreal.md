# Porte assemblée 1801020 interactive (Unreal Engine, Blender)

La porte grillagée sur trépied des plans 1801020 et 15250402 (Machines Roger International) s'exporte en trois
maillages statiques, un par corps mobile, chacun avec son pivot à l'origine de son fichier. Unreal n'a plus
qu'à faire tourner le battant et glisser le verrou.

```
node scripts/export-porte.mjs                                         # .glb et .json dans public/equipment/porte-1801020/unreal/
python tools/blender_porte_fbx.py public/equipment/porte-1801020/unreal   # variantes .fbx (module bpy de Blender)
node scripts/check-porte.mjs                                          # 51 contrôles contre les plans
```

Fichiers publiés avec le site : https://frankyray21.github.io/pieces-3d/equipment/porte-1801020/unreal/ suivi du nom
du fichier.

| Fichier | Contenu | Origine (pivot) |
|---|---|---|
| `SM_Porte_Cadre.glb` | Cadre, trépied, plaques de butée, moitié basse des pentures, tête d'interverrouillage | Au plancher, au milieu de la largeur, dans le plan milieu du cadre |
| `SM_Porte_Battant.glb` | Battant grillagé, poignée, moitié haute des pentures, socle de la barrure et ses vis | Sur l'axe des pentures, au plancher |
| `SM_Porte_Verrou.glb` | Barre de la barrure, bouton, languette | Sur l'axe du bouton, à la face avant du battant |
| `porte-1801020.glb` | Les trois maillages montés (Cadre › Battant › Verrou) et quatre animations | — |
| `porte-1801020.json` | Pivots, courses, sections de matériau, boîtes (mètres du glTF et centimètres d'Unreal) | — |
| `SM_Porte_*.fbx` | Les trois mêmes maillages en FBX | Les mêmes |

12 032 triangles en tout, 10 matériaux (`M_Porte_Cadre`, `M_Porte_Battant`, `M_Porte_Grillage`, `M_Porte_Trepied`,
`M_Porte_Pentures`, `M_Porte_Visserie`, `M_Porte_Barrure_Corps`, `M_Porte_Barrure_Barre`, `M_Porte_Barrure_Bouton`,
`M_Porte_Barrure_Voyant`), UV en projection par boîte (1 unité = 1 m).

## Essai interactif dans le navigateur

`public/equipment/porte-1801020/essai.html` (sur le site :
https://frankyray21.github.io/pieces-3d/equipment/porte-1801020/essai.html) charge le même `porte-1801020.glb` et
anime chaque élément autour de son origine avec les valeurs de ses « extras » glTF (`mouvement`, `axe_local`,
`angle_ouvert_deg`, `butee_deg`, `course_m`) : clic sur le bouton du verrou, puis sur le battant (ou les deux
boutons). Le battant refuse de tourner tant que le verrou est engagé, et le verrou de s'engager tant que le battant
est ouvert. Si un pivot ou un sens de rotation est faux dans le fichier, on le voit ici avant l'import dans le
moteur. three.js est celui du coffre à outils (`equipment/coffre-dd/lib/`, pas de CDN).

## Comment la porte fonctionne

| Mouvement | Mécanisme (d'après les plans) |
|---|---|
| Battant | Trois pentures à souder de 6 po, dont le fût est devant le jeu de 1/2 po entre le battant et le cadre : le battant tourne vers l'avant, du côté des pentures, de la poignée et de la barrure. Les deux plaques de butée 15250417 sont derrière le battant : il ne s'ouvre pas vers l'arrière. |
| Butée d'ouverture | Rien ne l'arrête à 90°. Le calcul donne 107° : la traverse du bas touche alors le gousset avant du trépied, du côté des pentures. Les animations s'arrêtent à 90°. |
| Verrou | La barre de la barrure 2210300 coulisse sur le battant ; sa languette entre dans la tête d'interverrouillage fixée à la patte du cadre. Verrou engagé, le battant ne peut pas tourner. Course de 1 po (2,54 cm), estimée d'après la lumière oblongue de la barre : le plan ne la cote pas. |

## Repère et pivots

Le glTF est en mètres, Y vers le haut, +Z vers l'avant (le côté où la porte s'ouvre), pentures du côté +X.
L'import glTF d'Unreal convertit en centimètres, Z vers le haut : X d'Unreal = X du glTF, Y d'Unreal = Z du glTF,
Z d'Unreal = Y du glTF. Dans Unreal, la porte est donc dans le plan XZ et s'ouvre vers +Y.

| Composant | Parent | Position relative (cm, Unreal) | Mouvement |
|---|---|---|---|
| `SM_Porte_Cadre` | — | 0, 0, 0 | fixe |
| `SM_Porte_Battant` | Cadre | X 48,89 · Y 2,92 · Z 0 | lacet (Yaw) de 0 à −90° ; jamais au-delà de −107° |
| `SM_Porte_Verrou` | Battant | X −83,13 · Y −1,02 · Z 115,87 | X de −83,13 (engagé) à −80,59 (tiré) |

## Import dans Unreal Engine 5

1. Glisser `SM_Porte_Cadre.glb`, `SM_Porte_Battant.glb` et `SM_Porte_Verrou.glb` dans le Content Browser (import glTF
   d'Interchange). Chaque fichier donne un Static Mesh et ses matériaux. Le pivot de chaque maillage est à l'origine
   de son fichier : il est juste, que l'option « Bake Meshes » de l'import soit cochée ou non.
2. Créer un Blueprint Actor, par exemple `BP_Porte_1801020`, avec trois Static Mesh Components : `Cadre` à la racine,
   `Battant` enfant de `Cadre`, `Verrou` enfant de `Battant`, aux positions relatives du tableau ci-dessus.
3. Collisions, dans l'éditeur de Static Mesh :
   - `SM_Porte_Cadre` : Collision Complexity = « Use Complex Collision As Simple ». Une boîte simple boucherait
     l'ouverture ; avec le maillage lui-même, on passe entre les montants.
   - `SM_Porte_Battant` : Collision › Add Box Simplified Collision (une boîte suffit et tourne avec le composant).
   - `SM_Porte_Verrou` : une boîte simple si le verrou doit se viser ou se saisir, sinon aucune collision.
4. Interaction, dans le graphe du Blueprint :
   - une variable `bVerrouTire` et une variable `bOuverte` ;
   - une Timeline `T_Verrou` (0 → 1 en 0,6 s) qui fait `Set Relative Location` sur `Verrou` : X = −83,13 + 2,54 × alpha ;
   - une Timeline `T_Battant` (0 → 1 en 2,4 s) qui fait `Set Relative Rotation` sur `Battant` : Yaw = −90 × alpha ;
   - l'événement d'interaction (touche, `Line Trace` du joueur ou zone de déclenchement) joue `T_Verrou`, puis
     `T_Battant` ; pour refermer, l'inverse (`Reverse` sur `T_Battant`, puis sur `T_Verrou`) ;
   - ne laisser tourner le battant que si `bVerrouTire` est vrai : c'est le rôle de l'interverrouillage.
5. Si le battant s'ouvre du mauvais côté, changer le signe du Yaw : le signe ci-dessus découle de la conversion
   d'axes de l'import glTF, il n'a pas été essayé dans Unreal depuis ce dépôt.

`porte-1801020.glb` sert d'aperçu et de référence du mouvement : dans Blender, ou dans Unreal par File › Import Into
Level, qui monte la hiérarchie. Il contient `Porte_Ouvrir` et `Porte_Fermer` (3 s : verrou, puis battant), `Verrou_Tirer`
(0,6 s) et `Battant_Ouvrir` (2,4 s), clés à 30 images/s sur les nœuds `SM_Porte_Battant` (rotation) et
`SM_Porte_Verrou` (position).

Les `.fbx` contiennent les mêmes maillages pour les versions d'Unreal ou les logiciels qui ne lisent pas le glTF.

## Ce qui a été vérifié, et ce qui ne l'a pas été

- Vérifié : 51 mesures du modèle contre les plans (`scripts/check-porte.mjs`), dont le volume de matière, à 2 % de
  celui du plan pour la porte et à 0,1 % pour le trépied ; les `.glb` relus dans Blender (hiérarchie, pivots, tailles,
  sections, UV, quatre actions) et la séquence `Porte_Ouvrir` rendue image par image ; les `.fbx` relus dans Blender
  (même boîte que le `.glb`, origine à zéro) ; la page d'essai jouée dans Chromium (clic sur le battant refusé verrou
  engagé, verrou tiré de 2,54 cm, battant à 90°, refermé et verrouillé).
- Pas vérifié : l'import dans Unreal lui-même. Aucun éditeur Unreal n'était disponible : les étapes ci-dessus
  suivent l'import glTF d'Interchange déjà utilisé pour la foreuse STM-1500 (`docs/animation-stm-1500.md`).

## Limites

- Les plans ne précisent pas de couleur : acier nu, grillage et visserie zingués. Un métal pur sort noir dans une
  scène sans ciel ni captures de reflets (galerie de mine) : régler le matériau dans Unreal, ou réexporter avec
  `node scripts/export-porte.mjs --metal-max 0.3`.
- La barrure est simplifiée d'après ses contours sur le plan (le dessin porte le marquage
  « www.fortressinterlocks.com ») ; son mécanisme intérieur et son câblage ne sont pas modélisés.
- Épaisseurs que les plans ne montrent pas (plaque du loquet et patte du cadre, 1/4 po) estimées ; répartition des
  deux moitiés de penture (basse sur le cadre, haute sur le battant) supposée.
- Tubes fermés et pleins dans le maillage (l'intérieur ne se voit pas) ; cordons de soudure non modélisés ; pas de
  niveaux de détail (LOD) ni de maillages de collision dans les fichiers.
