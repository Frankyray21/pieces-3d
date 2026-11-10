# Foreuse STM-1500 animée (Unreal Engine, Blender)

La foreuse complète (assemblage P010) s'exporte en un fichier 3D animé : un maillage à squelette, une
section par matériau, et une animation par séquence. Le squelette et les séquences sont décrits dans
`src/models/stm-1500/rig.js`, d'après le manuel de pièces.

```
npm run export:anim -- sortie/stm-1500-foreuse-animee.glb        # .glb + .json (os, séquences)
python tools/blender_fbx.py sortie/stm-1500-foreuse-animee.glb sortie/stm-1500-foreuse-animee.fbx
```

Le second script demande le module `bpy` de Blender (`pip install bpy` dans un venv).

## Comment la machine fonctionne

| Mouvement | Mécanisme (pages du manuel) |
|---|---|
| Bascule du mât | Le support d'avance porte deux tubes de pivot posés dans les paliers fendus des poteaux du traîneau. Il pivote sur le tube avant (pied vers le bas) ou sur le tube arrière (pied vers le haut), poussé par deux vérins HBU-3010 de 10 po de course. Les jambes UM-064-400D tiennent ensuite le mât à l'angle voulu (pages 1.01, 1.2, 1.9, 1.10). |
| Relevage | La poutre coulisse dans les brides du support, tirée par le vérin HBU 2536, pour appuyer la plaque de pied contre le rocher (pages 1.2, 1.9). |
| Avance | La table et la tête coulissent sur la poutre, course de 1 808 mm. Le vérin UM-064-100Z est télescopique à tiges fixes : deux tiges creuses ancrées aux bouts de la poutre, un tube central qui glisse sur leur piston, et le cylindre principal, accroché sous la table, qui glisse sur le tube. L'huile arrive par les tiges (pages 1.01, 1.8, 1.11). |
| Rotation | Moteur A6VM160 → transmission Funk à 4 vitesses → pignon de 12 dents → chaîne triple → pignon de 21 dents claveté sur la broche creuse, qui entraîne le mandrin ; 1 200 tr/min au plus (pages 2.2, 2.4). |
| Mandrin et serre-tiges | Le mandrin Boyles H et le serre-tiges 12HH sont fermés par leurs ressorts et ouverts par la pression d'huile : sans pression, ils tiennent la tige (pages 1.18, 2.5). |
| Reprise de course | En bout de course, le serre-tiges se ferme, le mandrin s'ouvre, la tête recule le long de la tige, le mandrin se referme et le serre-tiges s'ouvre. |
| Trou ascendant | Le treuil recule sur le traîneau jusque derrière lui, la rallonge et sa poulie sont retirées, le vérin de relevage avance le mât de 0,6 m, les vérins de bascule sont reportés sur les pattes arrière du support, le mât bascule sur le tube arrière et les deux jambes UM-064-400D le tiennent, des paliers avant libérés aux trous du flanc de la poutre (pages 1.01 « drill 45° up », 1.10). |
| Tête basculante | Boulons à œil desserrés, la tête pivote sur son axe de charnière pour dégager l'axe du trou (pages 1.8, 2.1). |
| Treuil | Moteur White → chaîne 80 (14 → 28 dents) → tambour ; chaîne 35 (11 → 70 dents) → vis-mère à double filet qui promène le guide-câble d'un flasque à l'autre (pages 8.0 à 8.4). |

## Séquences

| Nom | Durée | Contenu |
|---|---|---|
| `Forage_Tige_10pi` | 28 s | Forage d'une tige de 10 pi en deux courses, avec la reprise de course |
| `Course_Avance` | 14 s, en boucle | Course complète de la tête, vérin télescopique |
| `Rotation_Broche` | 4 s, en boucle | Rotation seule (4 tours de broche pour 7 tours du pignon menant) |
| `Bascule_Bas_45` | 20 s, en boucle | Bascule de 45° sur le tube avant |
| `Bascule_Bas_90` | 30 s, en boucle | Bascule à la verticale, pied vers le bas (trou descendant) |
| `Relevage_Mat` | 12 s, en boucle | Coulissement de la poutre (250 mm) |
| `Treuil_Enroulement` | 12 s | Tambour, vis-mère, guide-câble et réas |
| `Ascendant_45_Mise_En_Place` | 36 s | Mise en position de trou ascendant à 45° : treuil, relevage, report des vérins, bascule, jambes |
| `Ascendant_45_Forage` | 20 s | Forage ascendant à 45°, tige de 5 pi, course de 1,25 m et reprise de course |
| `Tete_Ouverture` | 12 s, en boucle | Tête ouverte de 65° |

Les vitesses sont ralenties pour la lecture : la broche tourne à 60 tr/min, la course dure 10 s.

## Squelette

Os racine `Traineau`, puis `PivotAvant` → `Support` → `Mat` → `Table` → `Tete` → `Broche` et `PignonMoteur`.
Sur le mât : `VerinAvance_Tube`, `Tige_Arriere` → `Emerillon` → `Emerillon_Rotor`, `Tige_Avant`, `Rallonge` →
`Rea_Bas` et `Rea_Haut`. Sur le traîneau : `VerinBascule_D_Fut`, `VerinBascule_D_Tige`, `VerinBascule_G_Fut`,
`VerinBascule_G_Tige`, `Jambe_D`, `Jambe_G`, `Treuil` → `Cable`, `Treuil_Tambour`, `Treuil_Moteur`,
`Treuil_VisMere`, `Treuil_Guide`.

Chaque os est placé sur son axe de pivot ou de coulissement, sans rotation au repos. Les boyaux et le câble
du treuil sont pondérés entre les deux corps qu'ils relient : ils suivent le mât sans se détacher.

## Import dans Unreal Engine 5

1. Glisser `stm-1500-foreuse-animee.glb` dans le Content Browser (import glTF d'Interchange).
2. Garder « Skeletal Mesh » et « Import Animations » cochés. L'import crée le Skeletal Mesh, son Skeleton,
   18 matériaux et une Animation Sequence par séquence (10 en tout).
3. Le fichier est en mètres, Y vers le haut : Unreal convertit lui-même en centimètres, Z vers le haut.
4. Poser le Skeletal Mesh dans le niveau et choisir une séquence (Animation Mode : Use Animation Asset),
   ou l'ajouter à un Level Sequence pour enchaîner les séquences.

Le FBX contient la même chose (une prise par séquence) pour les versions d'Unreal ou les logiciels qui ne
lisent pas le glTF. Il n'a été relu que dans Blender.

## Limites

- La tige de forage (taille B, Ø 55,6 mm) ne figure pas au manuel : elle n'existe que dans l'export, avec ses
  os `Tige_Arriere` et `Tige_Avant` et son matériau `tige_de_forage`, pour pouvoir la masquer.
- Les mors du mandrin et du serre-tiges, dans leurs carters, ne sont pas animés ; les chaînes ne défilent pas.
- Trou ascendant : seule la position à 45° est animée. Le bas du mât descend 15 cm sous le traîneau (9 cm sur
  le dessin du manuel) : dans la scène, poser la foreuse sur son plancher. La position à 90° demande de
  reprendre le mât plus loin dans les brides du support, ce que le manuel ne détaille pas.
- Les jambes UM-064-400D (page 1.10) n'existent que dans l'export : couchées au sol le long du traîneau, elles
  ne sont posées que dans les séquences de trou ascendant. Leurs points d'attache (paliers avant, trous du
  flanc de la poutre) sont relevés sur le dessin de la page 1.01.
- Dans les séquences de trou ascendant, la rallonge, sa poulie et le câble sont masqués (os `Rallonge` et
  `Cable` réduits à une échelle de 0,001).
- À 90°, les vérins de bascule dépassent de 4 cm leur course de 10 po : la cote exacte des pattes n'est pas
  donnée par le manuel.
- Le vérin supérieur « bazooka » et le garde-corps ne sont pas montés, comme dans le modèle du site.
