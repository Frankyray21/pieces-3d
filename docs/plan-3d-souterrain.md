# Plan d'amélioration de la 3D Epiroc — outils souterrains

## 0. Périmètre

Seules les 35 pages de la section « Underground » du catalogue (p. 64 à 105) sont concernées : têtes DiscovOre BU/NU/HU/PU (P065, P074, P083, P092), Excore UG (P068, P077, P086) et OWL L-Latch UG (P072, P081, P090) ; overshots Arrow 3S UG (P070, P079, P089, P091) et Excore II UG (P069, P071, P080, P088) ; carottiers UG (P064, P067, P073, P076, P082, P085) ; outils de chargement (P094, P094-NH, P094-LI) ; raccords de verrouillage UG (P096) ; émerillons AWJ, Pro 18+ et Pro 25+ (P097, P098, P099) ; presse-étoupes standard et RPT (P100, P102) ; 48TT (P104, P105).
Les modèles de surface restent en l'état. On ne les touche que par ricochet, quand une fonction partagée (`head()`, `overshot()`, `barrel()`, `layout()`, `Viewer.js`) est corrigée pour les pages souterraines.
Le présentoir d'accueil (P002, `showcase.js` ROWS) et la vignette de l'équipement doivent montrer des outils souterrains : aujourd'hui les quatre premières rangées sont des outils de surface et seuls P074 et P079 représentent le souterrain.

## 1. Où on en est

Ce qui est bon : chaque page souterraine a un modèle procédural, une pièce 3D par ligne de liste, un éclaté par rangées dans l'ordre de montage (`common.js layout()`), une coupe, la sélection croisée liste ↔ 3D, et `check-models.mjs` passe sur les 35 pages (présence des repères). Les silhouettes de la tête, de l'overshot, des émerillons Pro et des presse-étoupes se reconnaissent en éclaté.
Les défauts les plus visibles, dans l'ordre où l'utilisateur les rencontre :
- Le présentoir et l'arborescence sont orientés surface ; la table des matières souterraine (P003) n'a pas de 3D.
- Les carottiers de 3,6 m sur Ø 73 mm sont un trait à l'écran ; « Tout éclater » superpose tête, overshot et émerillon sur les rangées du carottier.
- Les têtes DiscovOre ont des cliquets en blocs trapus, une tige d'assemblage axiale au lieu de l'écrou-barillet transversal, un boulon qui sort du boîtier, et un seul jeu boulon/rondelle/tige au lieu de deux ; la tête Excore II des overshots est une copie recolorée du corps Arrow.
- Le montage vissé n'est pas représenté : bagues visibles entre tubes bout à bout, filets absents ou inversés (couronne, tube extérieur, raccord), raccord « full-hole » dessiné avec des fenêtres de type « welded ».
- En vue assemblée, les bulles des pièces internes s'empilent sur un tube fermé ; les instances multiples (qté 2, 3, 4) n'ont qu'une bulle.
- L'acier noirci est rendu gris-bleu mat ; la coupe est une bande brune uniforme.
- Les listes ne sont pas contrôlées en quantité ; P077 étiquette une goupille là où la liste dit une vis HHCS.

## 2. Les cinq gains les plus visibles

1. Carottiers « rompus » (tubes 0,45 m, tige 0,30 m, bouts crénelés) et rangées d'éclaté élargies : tout le train devient lisible sans zoom, « Tout éclater » cesse de se superposer.
2. Tête DiscovOre UG refaite au vrai : cliquets en dog-leg de 1,9 D, ressort visible, écrou-barillet transversal, boîtier ouvert avec boulon sous l'épaulement, second jeu 2/3/5.
3. Tête Excore II UG à section carrée avec alésage de pivot, clapet avec seal seat long et gros écrou.
4. Bulles : occultation en vue assemblée, une bulle par instance, pas minimal entre petites pièces.
5. Acier noirci brillant, matériaux par pièce corrigés, coupe lisible, présentoir d'accueil souterrain.

## 3. Lots de travail

Règle de tri : Lot 1 = effort S d'impact ≥ 3 et les quelques M d'impact 4 ; Lot 2 = chantiers moyens (M d'impact 3, S/M d'impact 2, finitions) ; Lot 3 = gros chantiers (L). Les corrections de fonctions partagées sont en tête de chaque lot. Effort : S ≈ ½ journée, M ≈ 1 à 2 journées, L ≈ 3 à 5 journées.

### Lot 1 — petits efforts, grand effet

| # | Quoi | Pages | Comment (fichier, fonction, primitive) | Impact | Effort |
|---|---|---|---|---|---|
| 1 | Garde-fous avant tout : contrôle quantité, rôle → description, seuils | 35 pages UG | `scripts/check-models.mjs` : comparer `model.refs.get(ref).length` à la colonne qté (tolérance `extra.qty3d`), regex rôle → description (reprise de `roles.mjs`), `--max-tris` (150 k/page, 300 k P002), `--max-ratio` ; `scripts/shots.mjs` (Playwright, 3 captures par page, pixelmatch) | 3 | S→M |
| 2 | Pas minimal dans `layout()` : rondelles, écrous, goupilles trop serrés pour leurs bulles | toutes | `common.js layout().done()` : `pitch = max(len + gap·D·spread, minPitch·D)`, `minPitch` 0,75 (0,45 pour les kits en mm des émerillons) | 3 | S |
| 3 | Clé d'ordre dans `layout()` : bague d'arrêt éclatée du mauvais côté du tube intérieur, filet du boîtier qui traverse la paroi | P064–P085 | `common.js` : option `order`, tri `(a.order ?? a.box.min.x)` ; `barrels.js:57` boîtier à alésage `itO·0,96` au lieu du filet, `:63` tube intérieur à filet mâle court | 3 | S |
| 4 | Pile d'axe sur une rangée propre, un kit = un côté | 10 têtes UG | `heads.js:38` `layout(api, D, {rows:{A:0, S:-2.3, B:-3.8, C:2.1}})` ; écrou, axe, soupapes, rondelles, butées, boîtier, suspension, écrou bas → `'S'` ; kit du boîtier (boulon, rondelle, tige, ressort, goupille) → `'C'` ; `latchSpring` en `follow` d'un cliquet | 3 | S |
| 5 | Bulles : occultation en vue assemblée, une bulle par instance | toutes | `Viewer.js:759` supprimer le `Set seen` ; `:794` raycast caméra → ancre quand `explodeT < 0.05` (sauter si coupe active), masquer si le premier impact n'est pas dans `owner` ; instances masquées si centres < 1,5 D | 3 | S/M |
| 6 | « Tout éclater » sans superposition des sous-assemblages | P064–P085 | `barrels.js:30` rows `{A:0, B:-3.8, C:3.6, E:-7.2}` ; `api.sub(cfg.head, {spread:0.6})` lu par `heads.js:38` / `overshots.js:23` ; `Viewer._applyAll` : dégagement perpendiculaire calculé sur `root.userData.explodedBox` (stocké dans `assembly.js finalize`) | 4 | M |
| 7 | Carottiers rompus | P064–P085 | `barrels.js:17-18` `TUBE = 0.45`, `ROD = 0.30` ; helper `broken()` : deux tronçons lathe, vide 0,3 D, bouts crénelés `S.slotted` (6 fenêtres), un `S.group` par repère ; `realLength` en `userData` | 4 | M |
| 8 | Montage vissé du carottier : bagues logées, filets aux jonctions, couronne en box | P064–P085 | `barrels.js:78-95` : alésoir à alésage `otI` au-delà de `rs1`, tube extérieur à filet mâle `th()` aux deux bouts, bague d'atterrissage et stabilisateur dans les alésages, couronne à box (plus de `th(otO·0.93)`), tige à pin, `cfg.adapterLong` pour P067/P076/P085 | 4 | S |
| 9 | Raccord de verrouillage UG = Full-hole plein, sans ergot, sans fenêtres | P064–P085 | `barrels.js:97-102` : supprimer la chemise `S.slotted` et le pin du haut ; exporter `coupling(api, K, 'hex', false)` de `tools.js:110`, `g.scale = rodO / 36,5 mm` ; box en haut | 3 | S |
| 10 | Presse-étoupe SB et Dimension kit DK : deux sous-ensembles de P100, posés près de l'émerillon | P064–P085 | `swivels.js stuffingBox(api, {part:'body'|'kit'})` ; `barrels.js:150-151` `sb = api.sub('P100', {part:'body'})`, `dk = api.sub('P100', {part:'kit'})` sur la rangée C au droit de l'émerillon ; supprimer la lathe DK filetée | 3 | S |
| 11 | DiscovOre UG : cliquets dog-leg, ressort visible, corps de cliquets allongé | P065 P074 P083 P092 | `heads.js:210-227 discovoreTop()` : `lt1 = m0+3.2`, lumières `lt0+0.6 … lt0+2.5` + deux lumières étroites, cliquet `S.extrude` d'un polygone coudé de 1,9 D (bec 0,15 D, genou à 60 %), ép. 0,25 D ; `S.spring(0.07 D, 0.015 D, 0.55 D, 8, axis 'y')` | 4 | M |
| 12 | DiscovOre UG : écrou-barillet transversal, boulon sous l'épaulement, boîtier ouvert, second jeu 2/3/5 | P065 P074 P083 P092 | `heads.js:229-247` : `assemblyRod → pinZ(0.14, 0.92, lt1-0.25)` + `hole()` dans `latchBody` ; `bolt` à `X(rc1-0.45)` ; coiffe pleine → lat ouvert à épaulement intérieur r 0,3 D, trous en quinconce ; `cfg.secondSet` : DO_NU bolt `'-x'` à `lt0-0.15` + rondelle + tige, P065 rondelle + `assemblyPin` ×2 seulement | 4 | M |
| 13 | Joints de propulsion DiscovOre UG : ordre inversé, mauvaise position, profils identiques | P065 P074 P083 P092 (+ P070 P079 P089 P091) | `heads.js:179-185` : `seals = ['propLower','propUpper']` sur le col haut du mid body (`s0 = c1-1.05+k·0.5`) ; profils coupelle / dôme exportés de `common.js`, repris par `overshots.js ugUpper` (mêmes n° de pièce) | 3 | S |
| 14 | Chapeau de tube intérieur : filet femelle, 3,5 D, fentes inclinées | 10 têtes UG | `heads.js:59-73` : `capTop = 3.5`, alésage taraudé au lieu du tenon `th(0.44, 0, 0.42)` ; DiscovOre : 4 fenêtres en 4 tronçons décalés ; `barrels.js:50` `h0 = it1 - 0.6·hd` | 3 | S |
| 15 | Butées listées ×2 absentes | P083 P081 | `heads.js:86-90` boucle sur `R.thrust` (3e position `hTop+0.22`) ; P083 `thrust:['20','20']` ; P081 `thrust:['27','27'], hanger: undefined` | 3 | S |
| 16 | P077 : repère 9 = vis HHCS, pas goupille | P077 | `heads.js:385-386` `spearPin2:'9'` → `hhcs:'9'` | 5 | S |
| 17 | Tête Excore II UG : section carrée, alésage de pivot, pas de filet mâle | P069 P080 P088 (P071 tout carré) | `overshots.js:39-51` branche `type === 'excore'` : haut lat alésé r 0,2 d sans `th()`, bas `S.plate(2.4 d, 1 d, 1 d, {cutouts})` ; `pivotPin = S.bolt(…, {head:'button', axis:'z'})`, rondelle + circlip à −z ; bouche plate chanfreinée | 4 | M |
| 18 | Nez conique du corps Arrow 3S | P070 P079 P089 P091 | `overshots.js:46` lat cône tronqué `[[0.2,0],[0.3,0],[0.5,0.7],…]`, tube à partir de 0,88, fenêtres 1,0 → 3,65 ; `anchors.mouth` inchangé | 3 | S |
| 19 | Petites pièces d'overshot décalées en z (cachées derrière le corps) | P069–P091 | `overshots.js:60-73, 110-112` : goupilles, pivot, rondelle, circlip, ressort, vis en rangée C (`L.add(…, {row:'C'})`) ou bande y ±0,95 / z 0,3 ; jamais de z négatif | 3 | S |
| 20 | P070 : rep. 12 = mid body, rep. 16 ×3 | P070 | `overshots.js:221` `valveSleeve:'12'` → `midBody:'12'` (lat fileté ≈ 1,3 d sous le corps de clapet, rangée A) ; ajouter `springPin2:'16'` | 3 | S |
| 21 | P104 : boîtier d'extracteur vissé sur le tube, pas caché dedans | P104 | `tools.js:562` lat femelle r 21,6 coiffant le pion −10..22, cône 20,5 → 17,7 ; bague 6 dans le cône ; 7 en rangée A | 3 | S |
| 22 | Acier noirci, matériaux par pièce, grain fin | toutes UG | `materials.js` : `blackOxide {0x1e2023, 0.75, 0.32}`, `gunmetal {0x2c2f33, 0.8, 0.38}`, GRAIN `metalFine [0.12, 0.015, 600, 0.006]` ; `heads.js:18-20` MAT.body, `:84` housing `'steel'`, `:223` cliquets DiscovOre `M.body`, `:245` bolt `'darkSteel'` ; `overshots.js:56` chiens Arrow `'black'`, `:179` eyeBolt `'darkSteel'` ; `barrels.js:63/87/91` inner `'lightGrey'`, stabilizer `'steel'`, outer `'darkSteel'` ; `Viewer.js:248` fill `0xf0f2f5` | 3 | S |
| 23 | Coupe lisible | toutes | `materials.js:120-130` CAP : `cap = mix(diffuse, blanc, 0.45)`, hachures à 45° tous les 6 px, sens alterné par variante de matériau | 3 | S |
| 24 | Présentoir et arborescence souterrains | P002 / P003 | `showcase.js` ROWS UG `[['P079','P080'],['P074','P077','P081'],['P096'],['P098','P100','P102','P094','P094-NH','P094-LI'],['P105']]`, rangées centrées (supprimer `spare`) ; builder P003 ou option `showcase:'underground'` dans `data.json` ; `main.js` sections Surface / Souterrain, surface repliée ; vignette prise sur ce présentoir | 4 | M |

### Lot 2 — chantiers moyens

| # | Quoi | Pages | Comment (fichier, fonction, primitive) | Impact | Effort |
|---|---|---|---|---|---|
| 25 | Pieds pointillés des pièces hors axe et trait d'axe | toutes | `Viewer._applyAll (:335-343)` : `LineSegments` + `LineDashedMaterial` de l'ancre éclatée à l'axe X, opacité `clamp((explodeT-0.2)/0.5)`, invisible en coupe | 3 | M |
| 26 | Rangée A sur plusieurs lignes pour les outils longs | P069–P091, P104 | `common.js layout` option `wrap` (≈ 28 D) et `breakBefore` ; overshots : ligne 2 = tête ; 48TT : coupures sur les corps | 3 | M |
| 27 | Cadrage : barres, cartouche, mode portrait | toutes | `Viewer.frame() (:529-558)` : déduire les `getBoundingClientRect` des barres et du cartouche ; `root.rotation.z = -π/2` en portrait ; cartouche replié sur petit écran | 3 | M |
| 28 | Présentoir : noms de famille, échelle, curseur « Éclater » | P002 | `assembly.js api.part(…, {caption})` + `.caption` CSS2D ; `api.sub('P079', {short:true})` (overshot court) ; vecteurs d'éclatement dimensionnés sur `explodedBox` | 3 | M |
| 29 | Ergonomie de l'éclaté : mouvement en deux temps, bulles de niveau lisibles, légende | toutes | `Viewer._applyAll` : `ta = min(1, t/0.6)` en X, `tr = max(0, (t-0.4)/0.6)` en Y/Z ; `styles.css .balloon.lvl-2` ≥ 20 px / 10,5 px, bord coloré par niveau ; légende dans `#hint` | 2 | S |
| 30 | Performance : ressorts, tubes à fenêtres, cache de géométrie, segmentation | P002 et toutes | `shapes.js:525 spring` `n = turns·16`, `TubeGeometry(n, wire, 6)` ; `:878 slottedGeo` fusion des bandes identiques, index, `roundHole` steps 4 ; cache `Map` des géométries (`userData.shared`, clonage avant `place()`) ; `common.js segFor(r, detail)`, `showcase.js api.sub(id, {detail:0.5})` | 2 | M |
| 31 | Filets fins | toutes | `heads.js:44 th` pitch 0,05 D, `maxTurns 24` ; `shapes.js:225 threadProfile` profil en V ; tenon du corps inférieur DiscovOre 1,2 D (`heads.js:145`) ; P094-LI `th(5, 21, 420, 1.5, {maxTurns:40})` (`tools.js:486`) | 2 | M |
| 32 | Pièces partagées têtes / overshots / outils : même n° = même forme en mm | P065–P092, P070–P091, P094 | `common.js` bibliothèque `UG` par n° de pièce (bille 22, bague 3760012100 Ø 26 × 14, ressort 3760017237, goupille 3760017459, joints, mid body, lower latch body) ; `check-models` : même n° de pièce → même boîte (± 5 %) | 3 | M |
| 33 | Lance et base de lance articulées (fût fendu, chape en V) | P068 P077 P086 P072 P081 P090 | `heads.js:332-342` : `spearhead` = cône + deux branches `S.extrude` avec `holes`, `spearBase` = cylindre + deux oreilles à encoche en V, `b1 = rc1+1.2` ; détente dans l'alésage | 3 | M |
| 34 | L-Latch UG : cliquets en L à chape, biellettes percées | P072 P081 P090 | `heads.js:283-315` : `S.extrude` polygone en L 1,2 D ép. 0,4 D `{holes:[pivot]}`, biellette 0,6 × 0,25 D à deux trous, ép. 0,12 D | 3 | M |
| 35 | L-Latch UG : seal seat long, adaptor lisse ; P092 soupape adaptatrice 31 | P072 P081 P090 P092 | `heads.js:170-178` : `sealSeat` = manchon 2 D + collerette + tenon, `adaptor` = cylindre r 0,47 × 1,8 D + `win()` ; `heads.js:77` + table `:370-372` : `capValve '31'` → coupelle lat r 0,55 × 0,9 D en rangée A, `checkBody '32'` → calotte courte | 3 | M |
| 36 | Goupilles de boîtier et de pivot dessinées ×2 pour qté 1 | P077 P086 P072 P081 P090 | `heads.js:327` casePins `[0]` sauf `cfg.casePins2` (P068) ; `:270` `yo = type === 'excore' ? 0.17 : 0` ; L-Latch : cliquets décalés ±0,13 D en z, une seule goupille | 3 | M |
| 37 | Fenêtres du corps inférieur (pastilles noires aujourd'hui) | 10 têtes UG | `heads.js:144-156` : `tube(0.46, 0.28, lb0+0.55, lb1, wins)` avec `win()` (DiscovOre) ou `hole()` (Excore/OWL), supprimer la boucle de `S.cyl 'black'` | 2 | M |
| 38 | Clapet Excore II UG : seal seat long, gros écrou, lower latch body à lumières, chapeau percé | P069 P071 P080 P088 | `overshots.js:136-158` : `sealSeat` lat fileté 2,5 d avec les deux lip seals enfilés, `lockNut = S.nut(1.05 d, 0.55 d)`, `lowerBody` tube à `win()`, `valveCap` `tube()` + `hole()` en croix ; `x = v1 + 2.5` | 3 | M |
| 39 | Cliquets d'overshot : profil long, crochet, trou de pivot, variantes Arrow / Excore / B | P069–P091 | `overshots.js:53-59` : `pts` de u +1,0 à −3,3, `S.extrude(…, {holes:[[dogTop+0.1, …, 0.07 d]]})`, gradin de mâchoire, encoche Excore ; taille B 0,4 d × 3,6 d | 3 | M |
| 40 | Tailles H / PU : tête N + manchon adaptateur, clapet seul à la taille du trou | P088 P089 P091 | `overshots.js:17-22` `cfg.dv` (H 0,064, PU 0,084) utilisé dans `ugUpper()` seulement ; P088/P089/P091 `size 'N'` ; `rollPins` ×4 (`:73`) + trous dans `adapterSleeve` | 3 | M |
| 41 | Clapet Arrow UG : corps percé, filet femelle, joints distincts, manchon P091, backup washer | P070 P079 P089 P091 | `overshots.js:136-150` : `valveBody` tube à `win(0/PI)` + `th()` femelle ; P091 `valveSleeve` lat r 0,65 ; `backupWasher = S.washer(0.6 d, 0.3 d, 0.06 d)` ; profils de joints de #13 | 3 | M |
| 42 | Émerillon de câble : œil usiné, collet vissé dans le corps, graisseur sur le corps | P069–P091 | `overshots.js:164-199` : `eyeBolt` = tête `S.extrude` percée + tige r 0,22 d filetée ; `collar` r 0,42 × 1 d dans un lamage de `swivelBody` ; `grease` follow `swivelBody` | 3 | M |
| 43 | Overshots : repères et quantités des petites pièces | P069 P071 P080 P088 | `overshots.js:220` `retainingClip:'17'` → `retainingRing:'17'` (supprimer `:133`) ; `:62` `pivotRetainer` ×2 à z ±0,56 d ; P071 ressort 20 : note `qty3d:1` ; P071 `releaseBars = S.plate(0.45 d, 0.3 d, 0.2 d, {holes})` ×2, `protectionSleeve` à collerette (`:67-70`) | 2 | S |
| 44 | Vue en coupe des carottiers : point de coupe et cadrage | P064–P085 | `barrels.js:140` `view.section {at:[shX,0,0], focus:[lr0-0.3, lc1+0.1]}` ; `Viewer._updatePlane (:735-750)` point absolu ; `frame({box})` au premier `setSection` | 3 | M |
| 45 | Extracteur en bague fendue courte et conique | P064–P085 | `barrels.js:59` : trois `S.slotted` empilés (1,03 → 1,12 bitI), fente w 0,28, hauteur 0,5 D | 2 | S |
| 46 | Passage d'eau des presse-étoupes : mamelon et orifice débouchent dans l'alésage | P100 P102 | `swivels.js:400-404` boîtier scindé + `S.slotted(19, 6.5, 80, 104, roundHole(-PI/2, 92, 8))` + bossage creux ; `:450-458` idem corps fixe P102 ; supprimer les disques noirs | 3 | M |
| 47 | P102 : coupe par l'axe y, écrou 1 dans le Ø du corps fixe | P102 | `swivels.js:115-119 kit().view()` option `portAxis:'z'` → section `axis:'y'` ; `:467` `hexAt(52, 325, 344, 22)` | 2 | S |
| 48 | P100 : guide 1, filet du boîtier, alésage taraudé de la vis de tête, joints 4 gris | P100 | `swivels.js:417` embase Ø 32 × 4 + cône Ø 22 → 17 ; `:400-402` corps r 20, `th(18, 145, 177, 1.75)` ; `:416` `th(18.2).reverse()` ; `:414` joints `'lightGrey'` | 2 | S |
| 49 | Pro 18+/25+ : raccord 7 au tambour 35 mm, boîte 32 mm ; manchons 4 lisses à gorge | P098 P099 | `swivels.js:359-362` nouveau profil 7 sans gorges ; `:351 / :369` `th()` → fût lisse + gorge 1,5 mm | 2 | S |
| 50 | AWJ : second anneau 5 avec gorge d'axe, écrou 1 en laiton, notes de quantité | P097 | `swivels.js:313-319` gorge `[11.6, 47.5..49.4]` + `circlip(15.2, 11.7, 1.4, 48.45)` ; `:327-328` `'brass'` ; `data.json` notes lignes 2 / 6 | 2 | S |
| 51 | P105 : boîtiers 14 entiers, collerette de l'arbre 6 au bas du corps | P105 P104 | `tools.js:526-531` : `tube(18, 14, …, [win(a, 0.6, …)])` ×2 au lieu de `win(…, PI)`, `hole(UP, 180, 3.2, 18)` pour le graisseur ; collerette r 19 à x 160..166 ; P104 hérite via `api.sub('P105')` | 3 | M |
| 52 | P104 : tubes 0,5 m, tige 0,3 m | P104 | `tools.js:560` `IT = 500`, `:586` `r1 = r0 + 300` | 2 | S |
| 53 | P096 : six-pans francs, bande diamantée à 6 segments | P096 | `tools.js:119-123` `S.lathe(…, {seg:6})` au lieu de `band(hexR)` ; `band(api, CR, x0, x1, 96, 12, f)` rainure 20 % | 2 | S |
| 54 | P094 / P094-NH : ressort 3 à l'échelle et logé dans le corps ; cliquets bronze, deux ajours NH | P094 P094-NH | `tools.js:461` `S.spring(3.5, 0.8, 26/30, 8, axis 'y')` + `hole(UP/DOWN)` dans le corps, `follow '1'` ; `materials.js defs.olive {0x8e8a6a, 0.5, 0.55}` ; `LT.NH.cut` en liste de polygones (`:433`, `:458`) | 2 | S |
| 55 | Goupilles élastiques fendues (pas la Spirol de P105) | P094 P094-NH P105 | `tools.js:34` `springPin = S.slotted(r, 0.62 r, …, [{a:0, w:0.5}], {axis:'z'})` ; garder `S.cyl` pour P105 rep. 7 | 1 | S |
| 56 | Collets hexagonaux avérés | P074 P092 P072 P081 P090 | `heads.js:170-176` mid body UG : `S.nut(1.0 D, 0.4 D, M.body, {axis:'x'})` en tête ; `:271-281` corps supérieur L-Latch : `S.nut(0.98 D, 0.3 D)` en bas | 1 | S |
| 57 | Matériaux d'overshot | P069 P071 P080 P088 P070 | `overshots.js:175` `cfg.nutMat` (`'brass'` P088/P070), `:186` `cfg.sleeveMat` (`'copper'` P070/P091/P069, `'steel'` P088), `:56` chiens Excore `'steel'` N/H, `'black'` B | 1 | S |
| 58 | Lignes de liste en double ou aux quantités incohérentes | P079 P105 P086 P097 | `data.json` : P079 17 bis `same:'16'`, 18 bis `same:'17'` ; `extra.qty3d` (P105 13 → 2, P086 13/23 → 1 et 25 → 2, P097 2 → 1 et 3/6 → 2) ; `main.js:529` « Qté 1 (2 dessinés) » | 2 | S |
| 59 | Outil de chargement en position d'emploi (à confirmer sur P064) | P064 P073 P082 | `barrels.js:152` `cfg.loadingShown = 'engaged'` : copie du sous-assemblage, tube dans le boîtier de rappel, flasque sur la tige, rangée C | 2 | S |

### Lot 3 — gros chantiers

| # | Quoi | Pages | Comment (fichier, fonction, primitive) | Impact | Effort |
|---|---|---|---|---|---|
| 60 | Bulles en espace écran : trait de rappel, répulsion, occultation par tranches | toutes | `Viewer.js` passe `_layoutLabels()` dans `_render` : `camera.project` de l'ancre, bulle à ±26 px sur la perpendiculaire de l'axe X projeté, répulsion 1D triée par x, `<svg>` de lignes dans `.label-layer`, raycast par tranches à l'arrêt de la caméra | 4 | L |
| 61 | Proportions hors tout des têtes Excore / L-Latch UG : boîtier de rappel 4,4 D, corps supérieur 4,2 D, axe + 1,5 D | P068 P077 P086 P072 P081 P090 | `heads.js:267-340 spearTop()`, `:116-121` spindle, `:417 HEAD_LENGTH ≈ 15–15,5` ; revérifier `barrels.js:50` (`headTop`, `latchX` sous le tube extérieur) et `sizes` | 3 | L |
| 62 | Tailles BTWU / N2U et filetages BO/BT/BMO (à confirmer sur P078 / P107) | P064 P065 P070 P073 P074 P077 P081 P096 P098 | `common.js SIZES.BTW / N2` ; builders lisant `cfg.sizeVariant` ; `main.js` reconstruction au changement d'onglet ; à défaut, mention « 3D dessinée pour BU » dans le cartouche ; P096 trois rangées B/N/H par `g.scale` | 2 | L |

## 4. Détail par famille

### Têtes (DiscovOre BU/NU/HU/PU, Excore UG, L-Latch UG)
- Cliquets DiscovOre (rep. 7) : blocs de 0,6 D alors que le catalogue montre des plaques en dog-leg de 1,9 D ; le ressort (6) fait 0,16 D au lieu de 0,55 D ; le corps de cliquets (8) est deux fois trop court. Correction : polygone coudé extrudé, `S.spring` selon y, `lt1 = m0 + 3.2` (`discovoreTop()`).
- Tige d'assemblage (5) : lathe axial de 1,9 D ; c'est un écrou-barillet transversal en haut du corps de cliquets, dans lequel le boulon (2) se visse par les trous du boîtier. Le boulon sort du boîtier (`S.bolt` à `X(rc1+0.06)`). Correction : `pinZ` + `hole()`, boulon à `X(rc1-0.45)`, tête sous l'épaulement intérieur du boîtier ouvert (`heads.js:229-247`).
- Second jeu boulon/rondelle/tige : P074 et P083 listent et dessinent 2, 3, 5 deux fois ; P065 rondelle 3 et goupille 5 deux fois. Correction : `cfg.secondSet` dans `discovoreTop()`.
- Joints de propulsion (P065 10/11, P074 9/10) : « upper » placé sous « lower », contre l'épaulement au lieu du corps de cliquets, deux coupelles identiques. Correction : ordre inversé, col haut du mid body, profils coupelle / dôme partagés avec les overshots.
- Chapeau (rep. 25–27) : tenon fileté mâle en bas alors qu'il se visse sur le tube ; 2,35 D au lieu de 3,5 D. Correction : alésage taraudé, `capTop 3.5`, `h0 = it1 - 0.6·hd` dans `barrels.js`.
- Pile de l'axe répartie entre rangées A et B : rangée dédiée `'S'` dans `layout()`, kit du boîtier en C (comme la goupille 26 du catalogue).
- Butées : P083 rep. 20 ×2 et P081 rep. 27 ×2 absents ; boucle sur `R.thrust`. P077 rep. 9 est une vis HHCS, pas une goupille (`spearPin2` → `hhcs`).
- Goupilles doublées : casePins 8 (P077, P086) et goupille de pivot L-Latch (P072, P081, P090) dessinées ×2 pour qté 1 ; une seule goupille, cliquets L-Latch décalés en z.
- Lance / base de lance (Excore, L-Latch) : solides de révolution de 1,3 D ; chape à deux oreilles en V et fût fendu de 2,2 D. L-Latch : cliquets en L à chape avec biellettes percées au lieu de plaques minces.
- Seal seat (P081 rep. 20) rondelle de 0,08 D au lieu d'un manchon fileté de 2 D ; adaptor (18) lathe fileté au lieu d'un cylindre lisse à encoche. P092 rep. 31 : coupelle filetée de 1,1 D, pas un cône de 0,35 D.
- Corps inférieur : orifices simulés par des pastilles noires ; fenêtres réelles par `tube(…, wins)`. Collets hex uniquement sur le mid body UG (P074/P092) et le corps supérieur L-Latch.
- Proportions Excore / L-Latch : boîtier de rappel 1,8 D contre 5,8 D au dessin, tête 12 D contre 15–16 D sur photo (lot 3).

### Overshots (Arrow 3S UG, Excore II UG)
- Tête Excore II (P069 23, P080/P088 20) : même tube que le corps Arrow, seul le matériau change. Partie haute alésée, partie basse carrée avec fenêtres et gros trou de pivot à tête, rondelle + circlip de l'autre côté.
- Clapet Excore II : seal seat (P088 13) réduit à une rondelle alors que c'est la pièce la plus longue du clapet ; lock nut (10) minuscule ; lower latch body (16) sans lumières ; valve cap (9) sans trous.
- Corps Arrow 3S : bouche plate ; nez conique tronqué de 0,7 d. Cliquets : barre de 3,1 d sans trou de pivot ni crochet ; profil de 4,4 d avec queue en « 7 », trou et gradin de mâchoire.
- Clapet Arrow : valve body lisse (deux grands orifices + filet femelle), P070 rep. 12 est le mid body et non une bague, P091 rep. 12 manchon de Ø > corps, joints haut/bas identiques, backup washer trop petite.
- Tailles H / PU (P088, P089, P091) : la tête N (même n° de pièce) est agrandie à l'échelle du trou ; seuls les éléments de clapet changent de diamètre, le manchon adaptateur fait le reste.
- Émerillon de câble : boulon à œil en fil de 0,16 d + tore, collet de 1,5 d en série, graisseur sur le collet. Œil usiné percé, collet court vissé dans le corps d'émerillon, graisseur sur le corps.
- Petites pièces (goupilles, pivot, rondelle, circlip, ressort, vis) éclatées selon z : derrière le corps ou sous les bulles. Rangée C ou bande libre y ±0,95.
- Données : P069 rep. 17 = circlip du pivot ; P070 goupille 16 ×3 ; P080/P088 arrêtoir 21 ×2 ; P088 roll pins ×4 ; P071 release bars en blocs percés et protection sleeve à collerette.

### Carottiers (P064, P067, P073, P076, P082, P085)
- Train de 3,6 m pour Ø 73 mm : un trait à l'écran. Tubes et tige rompus (0,45 / 0,30 m) avec bouts crénelés ; l'overshot domine encore la boîte, à raccourcir (`short`) ou à chevaucher.
- Bague d'atterrissage et stabilisateur apparents entre deux tubes bout à bout : alésages et filets `th()` sur l'alésoir, le tube extérieur, le raccord d'adaptation, la tige ; couronne en box ; `adapterLong` pour l'Excore UG.
- Raccord de verrouillage 1 : fenêtres rectangulaires + pin en haut ; en UG c'est un Full-hole plein, sans ergot (P096 : « no tang »), box en haut. Réutiliser `coupling()` de `tools.js` à l'échelle.
- SB dessiné complet (avec l'adaptateur 11 de P100) et DK redessiné à côté en tenon fileté : SB = rep. 1-9, DK = rep. 10-14 de P100, tous deux sur la rangée C près de l'émerillon.
- « Tout éclater » : la tête éclatée (±2,3 D) retombe sur la rangée E, l'overshot sur WS. Rangées élargies, `spread 0.6` des sous-assemblages, dégagement perpendiculaire dans `_applyAll`.
- Bague d'arrêt triée après le tube intérieur (box.min.x), filet du boîtier dans la paroi du tube : clé `order` + alésage.
- Coupe : plan « Hauteur » au-dessus du train, « Coupe » sans recadrage ; point `at` et `focus` dans `view.section`.
- Extracteur : manchon de 0,75 D au lieu d'une bague fendue conique de 0,5 D. Matériaux : tube extérieur sombre, intérieur clair, alésoir noir à bande diamantée, couronne à bande jaune.

### Émerillons (P097, P098, P099) et presse-étoupes (P100, P102)
- P100 et P102 : mamelon 8 et orifice butent sur une paroi pleine ; passage percé par `S.slotted` + `roundHole`, bossage creux, disques noirs supprimés. P102 : coupe par l'axe y pour traverser l'orifice.
- P100 : guide 1 trop grêle (cône Ø 22 → 17 sur embase Ø 32), filet du boîtier trop mince (r 18), vis de tête à taraudage ; joints 4 gris métal, pas jaunes.
- P099 : tambour 57 mm au lieu de 35, boîte 22 mm au lieu de 32 ; P098/P099 manchons 4 lisses à gorge, sans filet (les bandes du col sont des marquages, pas des gorges).
- P097 : écrou 1 en laiton (« brass nut ») ; second anneau 5 avec gorge sur l'axe ; notes de quantité sur les lignes 2 et 6.

### Outils de chargement (P094, P094-NH, P094-LI), raccords UG (P096), 48TT (P104, P105)
- P104 : boîtier d'extracteur 7 (r 20) caché dans le pion du tube 5 (alésage r 20,5) ; manchon femelle vissé sur le pion, bague 6 dans son cône. Tubes 1 m et tige 0,6 m encore trop longs : 0,5 / 0,3 m.
- P105 : boîtiers 14 en demi-coquilles (`win(…, PI)`) alors que le dessin montre un cylindre entier à fenêtre ; collerette de l'arbre 6 au mauvais bout. Goupille 7 Spirol : rester en cylindre.
- P094 : ressort 3 de 12 mm (Ø 5) au lieu de 26–30 mm (Ø 7), relégué en rangée B ; cliquets bronze/olive et deux ajours sur le cliquet NH ; goupilles 4 fendues. P094-LI : tige 1 filetée sur toute sa longueur.
- P096 : six-pans lissés par `computeVertexNormals` + `edgeAngle 75` ; lathe `seg 6` ; bande diamantée à 6 segments avec rainures de 20 %.

### Éclatés et présentoir
- Bulles au centre des pièces, sans trait, sans anti-recouvrement, sans occultation ; une seule bulle par repère (`Set seen`). Lot 1 : occultation + instances ; lot 3 : mise en page écran complète.
- Pas minimal absent dans `layout()` : rondelles à 0,4 D l'une de l'autre, bulles de 22 px qui se chevauchent.
- Rangée A sur une seule ligne : la tête d'overshot tient dans 120 px ; option `wrap` / `breakBefore`.
- Aucun pied ni trait d'axe : convention des rangées B/C propre à la 3D, Epiroc aligne sur l'axe ; pieds pointillés dans `_applyAll`.
- Cadrage ignorant barres et cartouche ; mode portrait par rotation du root.
- Présentoir : 600 k triangles pour des outils de 250 px, largeur imposée par un overshot de 1,95 m, « Éclater » imperceptible (0,12 / 0,05 m), aucun nom de famille. Rangées souterraines, légendes `caption`, overshot `short`, `detail 0.5`.
- Animation rectiligne : les pièces intérieures traversent les corps à mi-course ; sortie axiale puis latérale.

### Rendu et performance
- Acier noirci gris-bleu mat (`charcoal 0x3b3f45`, fill bleuté) : nouveaux matériaux `blackOxide` / `gunmetal` plutôt que modifier `charcoal` / `darkSteel` (partagés avec d'autres équipements) ; grain fin (le `cast 70/m` fait des taches de 14 mm sur Ø 55).
- Matériaux par pièce : boîtier de roulement en acier brillant, cliquets DiscovOre teinte du corps, boulon sombre, chiens Arrow noirs, boulon à œil sombre, tube extérieur sombre, stabilisateur acier.
- Coupe : capuchon `diffuse × 0,55` quasi noir et identique pour toutes les pièces ; éclaircir et alterner le sens des hachures.
- Filets : 6 à 9 gorges larges au lieu de 10 à 15 filets fins ; pitch 0,05 D (pas 0,04 : profondeur invisible), profil en V.
- Ressorts à 768 triangles par spire (28 % d'une tête) ; tubes à fenêtres non indexés (moitié des sommets du présentoir) ; aucune géométrie partagée ; segmentation fixe (anse seg 112, goupilles Ø 3 mm seg 28).

### Correspondance liste ↔ 3D
- `check-models.mjs` ne compare pas les quantités : plus de 40 écarts passent en ✓ (P074 2/3/5, P083 20, P088 26, P105 13, P097 2/3/6…). Contrôle quantité avec tolérance `qty3d`, contrôle rôle → description.
- P077 `spearPin2:'9'` étiquette une goupille sur une vis HHCS.
- Butées ×2 absentes (P083, P081) ; second jeu 2/3/5 DiscovOre UG ; goupilles ×2 dessinées pour qté 1 ; overshots : goupilles ×3/×4, arrêtoirs ×2.
- P070 rep. 12 « BU-D mid body » rendu par une bague mince (`valveSleeve`) ; P091 rep. 12 « Valve body sleeve » est légitime.
- Même n° de pièce dessiné différemment selon le fichier (bague 3760012100 Ø 22 en B, Ø 49 en P ; lower latch body 9469705452 à r 0,46 D en tête et 0,44 d fileté en overshot) : bibliothèque UG en mm.
- Lignes répétées (P079 17/18 bis) pointent sur la mauvaise pièce ; quantités de dessin ≠ liste (P105, P086, P097) : `same`, `qty3d`, notes.

## 5. Ce qu'on ne fera pas (et pourquoi)

- Aucune retouche aux pages de surface, même quand elles partagent le défaut : hors périmètre ; elles bénéficieront seulement des corrections de fonctions partagées.
- Pas d'ombres de contact : les photos et dessins Epiroc sont détourés sur blanc, sans ombre ; le choix « aucune ombre portée » (`Viewer.js:220`) est conforme.
- Roulements Pro 25+ (P099 rep. 5) : le dessin montre des billes en cage, la 3D est déjà juste ; au plus des bagues plus claires.
- Taraudages intérieurs des chapeaux Pro 18+/25+ : les dessins montrent des alésages lisses ; la 3D ne les contredit pas.
- Pas de « col rétréci » sur le boîtier de rappel DiscovOre : réfuté sur P074 et P065 ; P092 montre au contraire une tête plus large.
- Pas de Dimension kit en garnitures caoutchouc : les « gorges » de la vignette P064 sont les filets de l'adaptateur de tige (P100 rep. 11).
- Pas de goupille fendue pour la Spirol de P105 ; pas de nez d'overshot déplacé par `anchors.mouth` (jamais lu par `barrels.js`).
- Pas de retouche globale de `charcoal` / `darkSteel` ni des `seg` par défaut de `shapes.js` : partagés avec les autres équipements ; on ajoute des matériaux et un `segFor` propres à l'ITH.
- Pas de fusion `S.merged` au présentoir : elle casse la sélection par pièce et le double-clic.
- Pas de `cfg.realLength` piloté par l'interface ni de trait d'axe « comme Epiroc » (le catalogue n'en trace pas) : les pieds pointillés ne servent que la convention 3D.
- Pas de pitch de filet à 0,04 D : `threadProfile` plafonne la profondeur à 0,007 D, invisible.

## 6. Ordre d'exécution proposé

| Étape | Contenu | Vérification | Cumul |
|---|---|---|---|
| 0 | Garde-fous (#1) : contrôle quantité, rôle → description, seuils, `shots.mjs` et base de captures des 35 pages | `check-models --eq epiroc-ith` à 0 écart non annoté ; 105 captures de référence | 1 j |
| 1 | Données et disposition (#2–5, 15, 16, 20, 43, 58) | check-models ; captures éclatées P074, P077, P081, P080, P070 sans chevauchement de bulles ; P077 ligne 9 allume une vis | 5 j |
| 2 | Carottiers (#6–10, 44, 45) | `sizes` : P064 < 2 m ; `nested` : 0 chevauchement inter-groupes en « Tout éclater » ; coupe par défaut lisible | 11 j |
| 3 | Têtes DiscovOre UG (#11–14, 13 joints) | check-models qté 2/3/5 ×2 ; captures assemblée / éclatée / coupe P065, P074, P083, P092 ; `HEAD_LENGTH` revérifié sur P064–P082 | 16 j |
| 4 | Overshots (#17–19, 38–42) | captures P069, P070, P080, P088, P091 ; `--max-ratio` ; sous-assemblage C dans P064–P085 inchangé en position | 24 j |
| 5 | Rendu et présentoir (#22–24, 28, 30) | P002 < 300 k triangles, vignette souterraine ; mesure RVB du corps DiscovOre ≈ (30, 32, 35) avec bande de reflet ; coupe P074 : axe, butées, soupapes distincts | 29 j |
| 6 | Têtes Excore / L-Latch UG et visionneuse (#25–27, 29, 31–37) | captures P068–P090 ; pixelmatch < 1 % sur les pages non touchées ; `--max-tris` | 39 j |
| 7 | Émerillons, presse-étoupes, outils (#46–57, 59) | captures P094–P105 ; coupe « Hauteur » de P100/P102 montrant l'eau jusqu'à l'alésage | 45 j |
| 8 | Lot 3 (#60–62) | pixelmatch complet ; `labels` : 0 paire de bulles < 22 px en assemblé sur P074, P080, P064 | 57 j |

Chaque étape se termine par un passage de `node scripts/check-models.mjs --eq epiroc-ith` (à exposer en `npm run check:3d` à l'étape 0) et une comparaison des 105 captures ; une différence sur une page non visée par l'étape est une régression à corriger avant de continuer.