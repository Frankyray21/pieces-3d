# Assemblages 3D du DU311 sur roues (s/n 10703) — un fichier par assemblage

Même méthode que le DU311-TVK : **lire d'abord `../../du311/parts/README.md`**
(règles de quantités, cotes réelles, réalisme sans ombrage, bibliothèque de
formes, légèreté, vue éclatée). Ce fichier ne donne que ce qui est propre au
DU311 sur roues.

## Fichiers

- `parts/Pxxx.js` (export par défaut `function Pxxx(api, opts)`), numéro de la
  première page de l'assemblage dans `public/equipment/du311-std/data.json`.
- `node scripts/parts-index.mjs du311-std` régénère `parts/index.js` ; un
  fichier de `parts/` remplace le builder simplifié du même numéro
  (`../carrier.js`, `../reardeck.js`, `../slide.js`, `../feed.js`,
  `../machine.js`, `../decals.js`).
- Assistants partagés d'un lot : `parts/_<lot>.js` (pas de modification des
  fichiers communs `src/viewer/*`, `../layout.js`, `../feed.js`, `../slide.js`,
  `../reardeck.js`, `src/sim/*` : signaler le besoin).
- Les assistants du TVK peuvent être importés tels quels
  (`../../du311/parts/_avance_b.js` : `hhcs`, `shcs`, `hexNut`, `flatWasher`,
  `splitWasher`, `jicAdapter`, `jicElbow`, `orbPlug`, `sphericalBearing`, `oring`…).
- Les 34 assemblages identiques au TVK (même numéro de pièce, même liste) sont
  déjà repris (`TVK` dans `../index.js`) : les placer avec `api.sub('Pxxx')`
  d'après le repère décrit en tête du fichier TVK correspondant
  (P036→P104, P038→P106, P040→P108, P042→P110, P044→P112, P052→P140,
  P054→P142, P096→P160, P124→P094, P134→P078, P182→P180, P184→P182,
  P218→P342, P232→P356, P264/P370→P352, P336→P210, P354→P228, P358→P370,
  P374→P384, P376→P272, P378→P388, P390→P162, P434→P282, P438→P286,
  P440→P288, P442→P290, P446→P294, P448→P296, P450→P298, P452→P300,
  P454→P302, P456→P304, P458→P306).

## Dessins et cotes

- Pages : `public/equipment/du311-std/pages/Pxxx.webp` (640 pages ; chaque
  assemblage liste ses pages dans `sheets`). Agrandissement lisible :
  `python3 -I tools/page_png.py du311-std P292 /tmp/p.png [x0 y0 x1 y1]`.
- Cotes : descriptions de la liste (vis, raccords, alésages, courses, pneus
  12.00-20…), dessins à l'échelle d'une cote connue, modèles voisins.

## Repères

- **Repère machine** (`../layout.js`) : origine au sol sous l'articulation
  centrale, X vers l'avant (côté avance), Y vers le haut, Z vers la droite.
  Constantes : `WHEEL`, `AXLE`, `M` (cabine, capot moteur, châssis), `SLIDE`
  (`../slide.js`), `REEL` et `DRIVE` (`../reardeck.js`).
- **Grands ensembles posés une seule fois dans la machine : repère machine**
  (placés à l'identité par leur parent) : P208 et ses enfants posés sur le
  pont avant, P220 et ses enfants directs (P224, P228, P234, P240, P246, P278,
  P292, P326), P416, P420, P422, P430, P488, P164 et ses enfants directs.
- **Avance : repère de l'avance** (`../feed.js`, `FEED`) : pied du mât à y = 0,
  axe du mât +Y, face (côté axe de forage) +Z, carrousel côté +X ; P028 est
  placé par P010 (`feedToMachine` dans `../machine.js`). Les grands enfants de
  P028 (P032, P058, P098, P108, P140) sont dans ce repère (placés à
  l'identité) ; les petits ont leur repère local.
- **MCP P156** : repère local (comme `../slide.js`), placé par P010.
- **Composants** (vérins, distributeurs, filtres, supports, raccords) : repère
  local décrit en tête de fichier ; le parent les place.

## Pièces mobiles (simulation `sim.html`)

La simulation articule le modèle d'après des étiquettes posées par les
builders (`body`, `ramDetailed`, `rodSide`, `flex` de `../layout.js`) ou par
chemin de repères (`RULES` de `src/sim/du311-std.js`). Corps mobiles
(`BODIES` de `src/sim/du311-std.js`, axes tirés des constantes ci-dessus — ne
pas les déplacer) :

- `front` : tout ce qui est sur le châssis avant (pivote autour de l'axe
  vertical de l'articulation, origine) ; `wFL`, `wFR`, `wRL`, `wRR` : roues
  (axes des essieux `AXLE`, `WHEEL.z`) ; `jackL`, `jackR` : tige et patin des
  stabilisateurs arrière ; `outL`, `outR` : jambe et patin des stabilisateurs
  avant ;
- `tilt` (cadre basculant, pivot `SLIDE.pivot`), `shift` (chariot de
  translation), `roll` (sortie de l'actionneur rotatif, axe `SLIDE.rot`) ;
- `ext` (toute l'avance), `feed` (plaque porte-tête, tête, corps du vérin
  d'avance), `carousel` (partie tournante du carrousel), `clamp` (bras de
  serrage), `stingUp` / `stingDn` (tiges et patins des stinger), `slip`
  (plaque à coins mobile) ;
- `reel` (enrouleur), `flywheel` et `sheave` (surpresseur et moteur).

Vérins articulés : `ramDetailed(id, a, b, obj, { rear, rod, stroke })` sur le
vérin détaillé (axes des œils dans le repère de l'objet, course en m) et
`rodSide(objet)` sur les pièces côté tige (tige, piston, œil de tige,
contre-écrou) ; `closed` (entraxe vérin fermé) fait aussi contrôler que la
simulation reste entre fermé et sorti à fond. Identifiants attendus par la simulation : `steerR`, `steerL`
(direction, `chassis` → `front`), `dumpR`, `dumpL` (basculement, `front` →
`tilt`), `shift` et `shift2` (translation, `tilt` → `shift`), `mcp`
(extension, `roll` → `ext` : fond sur le MCP, tige au haut du cadre de l'avance), `slip` et `slip2` (plaque à coins, `ext` →
`slip`). Un corps sans aucune pièce étiquetée fait échouer
`node scripts/check-sim.mjs`.

## Vue d'ensemble du site

La machine complète (P010) compte plus de 11 000 maillages : le site affiche
d'abord les grands ensembles simplifiés (`overview` dans `../index.js` :
P208, P416, P164, P028 de `../carrier.js`, `../reardeck.js`, `../slide.js`,
`../feed.js`), puis les remplace un à un par leurs versions détaillées
construites avec des facettes allégées (`buildProcedural(…, { quality })`,
`setQuality` de `src/viewer/shapes.js` ; les six-pans et prismes de 8 pans ou
moins ne changent pas). Ces builders simplifiés restent donc à jour.
Un sous-assemblage posé dans un simple groupe (`at(group(api.sub(…)))`) est
déballé par `api.part` pour rester éclatable et adressable ; un groupe qui
porte autre chose (vérin `ramDetailed`, plusieurs enfants) reste tel quel.

## Contrôles

```bash
node scripts/check-models.mjs --eq du311-std --qty --max-tris 150000 P292 P306
node scripts/check-sim.mjs          # quand des pièces mobiles changent
```

Vues : serveur `npx vite --port <port>` dans le dossier du dépôt, puis
`node <scratchpad>/tools/asmshot.mjs <port> du311-std.P292 /tmp/x.png 1,0.6,1.1`
(`window.viewer` est exposé en développement).
