# Pièces 3D

Plateforme qui transforme les manuels de pièces (PDF) en modèles 3D
interactifs avec vue éclatée, pour visualiser l'équipement et identifier les
pièces (numéro, quantité, page du manuel).

Équipements :

- **Cubex / MRI 5200** (foreuse sur chenilles, manuel P15125-MRI rév. 03,
  28 pages) : assemblages en 3D.
- **Sandvik DU311-TVK** n° de série 10680 (manuel de pièces du 2020-07-02,
  510 pages) : 172 assemblages et 15 schémas. En 3D : la machine complète
  (P010 : châssis, glissière, plaque de liaison du mât et avance dressée à
  l'avant), le châssis complet
  (P186 : porteur sur chenilles, stabilisateurs, groupe de pompage, diesel,
  surpresseur et réservoir d'air, enrouleur, armoires et bancs de vannes en
  formes simplifiées, dimensions estimées), l'avance V30 complète
  (P032 : vérins stinger, déflecteur, centreur, plaque à coins, bras de tige,
  vannes et boyaux d'air en formes simplifiées), le mât 10 pi (P130,
  avec vérin d'avance P132, plaque porte-tête P134, barres de guidage P136)
  et la tête de rotation RH6230 (P138, avec émerillon d'air P140 et boîte
  d'engrenages P142). Les autres assemblages s'affichent avec les dessins du
  manuel. Le PDF d'origine (69 Mo) est conservé dans la
  release GitHub `manuel-du311`, pas dans le dépôt.
- **Sandvik DU311** n° de série 10703 (`du311-std`, variante sur roues du
  DU311-TVK : porteur 4 roues, carrousel de tiges 6 pi, extinction
  d'incendie, pont arrière ; manuel du 2021-12-10, 640 pages) : 189
  assemblages et 29 schémas et listes électriques. En 3D : la machine
  complète (P010) avec le porteur articulé sur roues (P208 : châssis avant et
  arrière, articulation et vérins de direction, essieux et roues 12.00-20,
  cabine de translation, capot moteur, stabilisateurs, groupe de pompage,
  bancs de vannes, collecteurs, filtres et graissage), le pont arrière (P416 :
  surpresseur et son moteur 75 HP entraîné par courroies, enrouleur de câble,
  filtre coalescent, poteaux porte-câble), la glissière (P164 : caisson et
  stabilisateurs avant, cadre basculant, chariot de translation, actionneur
  rotatif, réservoir d'air), le MCP (P156 : plaque de liaison et vérin
  d'extension), l'avance 6 pi à carrousel de 17 tiges (P028 : mât, plaque
  porte-tête, vérins stinger, centreur, cadre du carrousel, bras de
  serrage, boyaux), l'extinction d'incendie (P012), la finition (P020) et la
  trousse d'autocollants ISO (P022 : 37 pictogrammes d'avertissement,
  d'obligation, d'interdiction et d'information dessinés en géométrie et posés
  près de l'organe concerné), en formes simplifiées aux dimensions estimées
  sur les vues du manuel (repère commun dans `src/models/du311-std/layout.js`),
  avec projecteurs à DEL, gyrophare, feux, rétroviseurs, main courante, zébras
  et bandes réfléchissantes (`lights.js`), toujours sans ombres. La tête de rotation RH6230
  ME12-SS #24 (P050, même construction que celle du TVK avec moteurs ME12),
  son émerillon d'air (P052) et sa boîte d'engrenages (P054) sont repris du
  TVK (même numéro, même liste ; voir `src/models/reuse.js`). Le PDF
  d'origine (101 Mo) est dans la release GitHub `manuel-du311-std`.
  **Manuel de l'utilisateur** (manuel d'opération DU311 - Tier3, fr-FR 7,
  2026-08-04, 264 pages ; PDF dans la release `operation-du311` du dépôt
  `manuel-du311`) : lecteur de pages avec sommaire et recherche plein texte
  (`#du311-std.utilisation`, `src/ui/features/utilisation.js`, données
  produites par `tools/extract_utilisation.py`). **Prise en main de la
  console ERIS** (`#du311-std.prise-en-main`, pages 121 à 147 du manuel) :
  parcours en 6 étapes pour un nouveau travailleur — console (repères
  cliquables et défi), manettes, voyants CANBUS / DRILL / CONTROL (exercice),
  console ERIS en 3D manipulable (manettes à incliner, boutons des têtes de
  manette fonctionnels — correspondance bouton/fonction relevée sur les
  vignettes de manette des copies d'écran, `BOUTON` dans
  `prise-en-main/eris.js`, bouton actif allumé —, touche Mode, arrêt
  d'urgence, interrupteur, écran ERIS vivant dans le boîtier, dont on touche
  les noms ; `prise-en-main/console3d.js`) et écran 2D au choix, avec 7
  missions guidées (démarrer, changer de
  mode, se déplacer, mettre le mât en place, forer avec verrouillage, lire et
  réinitialiser une alarme, arrêt d'urgence), les 43 alarmes et un quiz ;
  simulateur dans `src/ui/features/prise-en-main/`, textes dans
  `public/equipment/du311-std/prise-en-main.json`.

- **Epiroc — outils de carottage ITH** (`epiroc-ith`, catalogue « Core
  Drilling Tools — In-The-Hole », 108 pages en planches doubles) : 78
  assemblages et 44 listes de trousses, consommables et conversions, 3 006
  lignes ; numéros par taille (N, N2, N3, H, H3, BU, BTWU…). En 3D : les 26
  têtes (DiscovOre, Excore, OWL L-Latch, OWL standard, de surface et
  souterraines, B à P), les 15 overshots (Arrow 3S, Excore II), les 19
  carottiers complets (tête et overshot en sous-assemblages, tube intérieur
  logé dans le tube extérieur, visible en coupe), les émerillons d'eau, les
  presse-étoupes et les outils (avance-tubage, coupe-tiges, raccords de
  verrouillage, outils de chargement, carottier 48TT). Les outils
  souterrains (pages 64 à 105) ont été repris d'après les dessins (voir
  `docs/plan-3d-souterrain.md`) et viennent en tête de la table des
  matières ; la page d'accueil de l'équipement (P002) présente un exemplaire
  de chaque famille souterraine (taille NU), nommé sous l'outil : un clic (ou
  un toucher) sur un outil ou sur une ligne de la table ouvre sa page ; cette
  page n'a pas de vue éclatée, et sur un écran en hauteur (téléphone) les
  outils longs sont rangés un par rangée, les petits par deux ou trois, pour
  rester grands. Les éclatés suivent l'ordre des
  dessins (corps sur l'axe, pile de l'axe des têtes sur sa rangée, petites
  pièces au droit de leur place) ; une bulle par exemplaire, masquée quand la
  pièce est cachée en vue assemblée. Quand le dessin montre un autre nombre
  de pièces que la liste, la 3D suit le dessin et la ligne l'indique
  (« 2 en 3D »). Pages du catalogue en WebP couleur (P001 à P108).

- **Plancher pour foreuse aux diamants sous terre** (`plancher-dd`, procédure
  de travail PRO-DD-ST-003 de Machines Roger International, révision du
  2026-07-27, 19 pages) : le plancher complet de 16 × 32 pi dans sa galerie,
  pièce par pièce, d'après le texte et les photos de la procédure : ligne de
  peinture, madriers 6 × 6, blocages 3 × 8 et 6 × 6 avec coins de bois (calculés
  sur un sol de galerie qui descend, au moins 6 appuis par madrier), blocage
  de jonction, soutiens de 16 pi et cage de bois de la section 2, planches
  3 × 8 et tire-fonds, marches, garde-corps (RSST art. 12), grillage au bas des
  murs, plancher secondaire à côté de la tour, foreuse en silhouette,
  barricade, armoire et extincteur ; démantèlement (clôture et carte) et
  critères de choix des planchers (10 × 8, 10 × 16, 16 × 32 pi). Dimensions,
  sol et ordre des étapes dans `src/models/plancher-dd/plan.js` : chaque objet
  porte son numéro d'étape (`userData.step`) pour animer le montage
  (vidéo de formation).

- **Coffre à outils ITH** (`coffre-dd`, dessin 087 « Coffre à outil ITH » de
  M.R.I. Inc., D. Côté, juin 2011, et deux photos) : 3D aux cotes du dessin,
  tôle par tôle (P01 : caisse de 48 × 39 1/2 × 54 po, devant de 21 po, dessus
  de 20 po, portes inclinées de 24 × 39 po, deux tablettes de 16 po à trois
  cases, tubes de base 4 × 4 × 1/4, oreilles de levage du détail 1, poignées
  du détail 2, barre de verrouillage du détail 3) et coffre ouvert (P02) avec
  les ajouts visibles sur la photo (tiroir, panier, crochets). Épaisseur des
  tôles et pentures non détaillées sur le dessin (estimées) ; peinture d'après
  les photos ; le contenu du coffre n'est pas modélisé.
  Sur le dessus, à gauche : support de tube D-D du dessin 0102803 (P03 :
  berceau en Y de 3/4 po, base de 8 × 3 po, gousset ; 17 1/2 po de haut), dont
  la position sur le coffre n'est cotée sur aucun dessin.
  Logo Machines Roger (image du cartouche du dessin 0102803) au bas du devant.
  Export pour moteur de jeu (Unreal Engine) : `scripts/export-coffre-jeu.mjs`
  écrit `coffre-ith.glb`, un maillage par élément mobile sur son pivot (portes,
  barre de verrouillage, tiroir) ; voir `docs/coffre-unreal.md`.
  Sur le côté gauche : boîte à clés du dessin Foresco C16062863 (P04), placée
  d'après une photo (vers le bas du côté, à mi-profondeur).
  Tubes de base creux, bouts ouverts pour les fourches. Premier contenu de la
  liste de matériel du coffre 629 (calibre N) dans le coffre ouvert : deux têtes
  NU Excore, l'overshot Excore II, core lifters, core lifter cases, stop rings
  et landing ring, repris des modèles Epiroc (`reuse`).
  Crochet double sur le côté gauche, marteau dans la boîte à clés, masses de 2
  et 10 lb (`outils.js`, formes génériques sans dessin).
  Essai interactif du fichier dans le navigateur :
  `equipment/coffre-dd/essai.html` (clic sur la barre, les portes, le tiroir).

- **Porte assemblée 1801020** (`porte-1801020`, Machines Roger International, plans
  1801020 « PORTE ASSEMBLÉ » à l'échelle 1:16 et 15250402 « TREPIED » à l'échelle
  1:10, du 2022-04-05) : porte grillagée sur trépied, 42 po de large, 88 3/8 po de
  haut, pieds de 36 po. Cadre en tube de 1 1/2 po à coins d'onglet avec onze
  anneaux et la patte du loquet (15250413), battant de 38 × 85 1/2 po en tube de
  1 po avec grillage de 3/16 po au pas de 2 po, plaque du loquet et poignée
  (15250400), trois pentures à souder de 6 po, deux plaques de butée, barrure à
  tête d'interverrouillage (2210300), trépied à douilles boulonnées (P02). Les
  cotes des plans sont reprises telles quelles ; le reste est relevé à l'échelle
  sur les tracés vectoriels des PDF. Peinte en noir (couleur choisie pour le
  modèle, les plans n'en précisent pas), visserie zinguée. Les masses des cartouches (19,74 lb et
  5,42 lb) sont calculées à la densité par défaut de SolidWorks (1 g/cm³) : elles
  donnent le volume de matière, que `node scripts/check-porte.mjs` compare à
  celui du modèle parmi 51 contrôles (trépied à 0,1 %, porte à 2 % ; environ
  155 lb en acier). Le modèle est fait de trois corps (`userData.body` : Cadre,
  Battant, Verrou) : `cinematique.js` fait tourner le battant autour de l'axe
  des pentures et glisser le verrou, et calcule la butée d'ouverture (107°,
  contre le gousset du trépied) ; la page P03 les anime en trois temps.
  **Unreal Engine** : `node scripts/export-porte.mjs` écrit trois maillages
  statiques (`SM_Porte_Cadre`, `SM_Porte_Battant`, `SM_Porte_Verrou`, pivot à
  l'origine de chaque fichier, une section par matériau, UV par boîte), le
  fichier complet animé et la fiche des pivots dans
  `public/equipment/porte-1801020/unreal/` ; FBX par
  `tools/blender_porte_fbx.py` ; mode d'emploi dans `docs/porte-unreal.md`.
  Page d'essai du fichier de jeu : `equipment/porte-1801020/essai.html` (clic
  sur le verrou, puis sur le battant).

- **Core knocker NQ 15222420** (`core-knocker`, Machines Roger International,
  trois plans du 2022-02-28 : assemblage 15222420 en coupe A-A, corps soudé
  15222405, ressort 3760014504) : outil qui sert à frapper les bouts de carotte
  coincés dans le ressort à carotte (core spring) du tube carottier. Tube de
  16 1/4 po à poignée soudée en rond de 3/8 po (corps, sous-assemblage P02),
  tige de frappe de 1 po × 6 po à collet (15222410), plaque de Ø 4 po
  (15222413), ressort de compression (3760014504) et bague à fond percé
  (15222415), avec les cordons de soudure des plans. La vue en coupe du site
  reprend la coupe A-A (plan Z = 0). Les cotes des plans sont reprises ; ce
  qu'ils ne cotent pas (diamètre intérieur du tube, tige, bague, collet, fil du
  ressort, pliage de la poignée) est relevé à l'échelle sur les tracés
  vectoriels des PDF. Le tube est coté Ø 2 11/16 po, cote arrondie au 1/16 :
  le tracé donne 2,715 po, valeur du modèle. Corps et plaque peints en rouge Machines
  Roger, avec un peu de rouille où la peinture a sauté, à la demande du client
  (les plans ne précisent pas de couleur) ; tige, ressort et bague en acier nu.
  La rouille est une finition du moteur de matériaux (`redRust`, finition
  `paintRust` de `src/viewer/materials.js` : part de surface touchée `rust`,
  fréquence des taches `rs`), réutilisable pour d'autres pièces. Contrôle chiffré :
  `node scripts/check-core-knocker.mjs` compare 33 mesures du modèle aux plans.
  Masses : le tube seul donne 6,25 lb (6,3 lb au cartouche du corps) et
  l'assemblage sans la poignée ni le ressort 9,3 lb (9,4 lb au cartouche) ; les
  cartouches semblent donc ne compter ni la poignée (0,34 lb) ni le ressort
  (0,08 lb ; 0,01 lb à son cartouche), avec lesquels le modèle pèse 9,7 lb.

- **Tube à l'eau 1524010812, flotte 152042600 et pompe Bean 420** (`tube-eau`, Machines Roger
  International) : bac à eau ouvert de 45 3/8 × 35 1/4 po et de 33 15/16 po de
  haut, soudé en tôle de 3/16 po, d'après le plan du 2024-01-02 (une page,
  échelle 1:15, coupe A-A, détail B à 1:2). La plaque 1 (1524010806) forme d'un
  seul pli le fond et les deux grandes faces ; les bouts (1524010807 et
  1524010808) sont posés contre ses chants (joint d'angle ouvert) ; les quatre
  côtés ont un rebord replié de 2 3/16 po à retombée de 1 3/16 po. Traverse en
  oméga ouverte vers le haut, au fond ajouré (1524010809), dont les pattes
  entrent sous les rebords (« PLACER AVANT DE SOUDER LA PLAQUE №2 »), deux
  barres de 1 × 17 3/8 po (1524010810), deux pieds en U de 8 × 3 3/4 po
  (1524010811), deux demi-manchons inox 1 po FNPT (12641) et deux brides à
  souder 2 po NPT (0700200). Les cotes du plan sont reprises ; le reste
  (épaisseur, plis, rebords, traverse, ajours, raccords) est relevé sur le
  tracé vectoriel du PDF. Le boulon 1/4-20 de la nomenclature n'est situé sur
  aucune vue : il reste sans 3D. La flotte 152042600 « FLOTTE STM-1500 TOBE A
  L'EAU » (plan du 2022-04-26, page P02) n'a qu'une vue en perspective
  dimétrique, en image et sans cote : ses dimensions sont mesurées sur l'image
  (ellipse des joues, axe, bras), à l'échelle 1:3 que donnent les têtes des
  boulons de 3/8 po (le cartouche inscrit 1:8) ; elles tombent sur des cotes
  rondes (cylindre de Ø 6 × 12 po, joues de Ø 6 1/4 po, tube carré de 1 po ×
  20 po). Elle est posée dans le bac à titre indicatif : aucun plan ne donne sa
  position ni la pièce qui la porte. Bac et corps de la flotte peints en noir
  (demande du client). Contrôle chiffré : `node scripts/check-tube-eau.mjs`
  compare 63 mesures aux plans ; masses du modèle : 444,2 lb pour le bac
  (443,9 lb au cartouche) et 8,8 lb pour la flotte (8,9 lb, avec un cylindre
  en tôle de calibre 16). La pompe à eau Bean 420 (modèle de l'équipement
  `pompe-bean-420`, repère 11) est fixée au bac sans que celui-ci soit modifié
  (demande du client : le bac est à l'échelle, c'est la pompe qu'on adapte).
  Ses cinq trous taraudés 1/2-13 (8 1/2 × 12 11/16 po) ne tombent sur aucune
  pièce du bac ; elle reçoit donc une embase d'adaptation (repère 12), qui
  n'existe sur aucun plan et qui est une proposition. Le bac offre un logement :
  15 1/16 po entre les flancs de la traverse et 2 po de haut, juste sous les
  deux barres, espacées de 20 1/8 po. Le plan dessine à chaque bout des barres
  deux cercles concentriques, lus comme le trou de 5/16 po de la barre
  au-dessus d'un taraudage 1/4-20 de l'aile, pour le boulon 1/4-20 × 1/2 po de
  la nomenclature (repère 9, désormais montré aux quatre bouts) : les barres
  sont des brides démontables. L'embase remplit ce logement : cadre soudé en
  tube rectangulaire de 2 × 1 × 1/8 po, de 15 × 21 1/8 po, dont les deux
  traverses sont à l'aplomb des barres, qui les serrent sur le fond, et dont
  les deux longerons passent entre les lignes de trous de la pompe ; plaque
  de 15 × 19 1/16 × 3/8 po entre les barres, qui cale l'ensemble en long et
  porte la pompe, tenue par cinq boulons 1/2-13 × 1 po vissés par-dessous
  (repère 13). La pompe est posée en long : culasses vers le bout gauche,
  au-dessus du compartiment ouvert, arbre d'entrée vers la face arrière. En
  travers, le tuyau d'aspiration de 1 1/2 po (Ø 1,9 po) ne passerait pas entre
  la barre avant et le bord de l'ajour avant du fond, distants de 1 7/8 po.
  Si les barres sont en réalité soudées, l'embase ne se met pas en place telle
  quelle. Page P03 (repère 14), indicative : l'entraînement et le circuit
  d'eau (`src/models/tube-eau/circuit.js`), d'après la photo de la L09-420 à
  moteur hydraulique du catalogue TIME Ltd (page P03), la pompe à eau de la
  STM-1500 (page 1.6 de son manuel), le waterpack de la DR1500-U (pages 9 et
  10) et les règles d'installation du manuel de la pompe (page P04) :
  moteur hydraulique orbital sur une cloche d'accouplement boulonnée à la
  place des trois vis du boîtier d'entraînement (option `entrainement` des
  builders de la pompe), accouplement à mâchoires ; soupape de sûreté PPFMC
  3546492 sur un coude au bout arrière du collecteur, retour dans le bac ;
  té, manomètre PPAM A000380000 et boyau de refoulement de 1 po à l'avant ;
  aspiration en tuyau de 1 1/2 po, raccord union et clapet de pied à crépine,
  droit dans le compartiment ouvert ; arrivée d'eau de 1 po au premier
  demi-manchon ; boyaux hydrauliques (pression, retour, drain) jusqu'au sol
  avec raccords rapides. Le robinet à flotte n'est pas montré (aucun
  document). `scripts/check-pompe-bean-420.mjs` vérifie le logement, les jeux,
  le gabarit des trous et, par un test de parité sur les sommets, qu'aucune
  pièce ni aucun boyau ne traverse le bac, la pompe ou une autre pièce.

- **Rack à outils 15083000** (`rack-outil`, Machines Roger International, plan
  d'assemblage soudé du 2021-08-31, une page, échelle 1:4) : plaque en U de
  30 × 14 1/2 po (15083001), deux tubes ronds debout (15083002), quatre
  crochets d'accrochage de 3 po au dos des montants, tenon dans une fente de
  la plaque (15083003), un tuyau noir de 1,900 po couché (15083004), un tuyau
  noir de 1,050 po debout (15083005) et sept crochets en L de 3/8 po
  (15083006), avec les cordons de soudure de 3/16 po du plan. Les cotes du
  plan sont reprises telles quelles ; ce qu'il ne cote pas (plaque de 3/16 po,
  montants de 2 1/2 po, rayons, diamètre et hauteur des tubes ronds, profil
  des crochets) est relevé à l'échelle sur les tracés vectoriels du PDF.
  Peint en rouge Machines Roger (demande du client ; le plan ne précise pas
  de couleur). Contrôle chiffré :
  `node scripts/check-rack-outil.mjs` compare 38 mesures du modèle aux cotes
  du plan, dont la masse d'acier (11,07 lb pour 11,2 lb au cartouche).
  `S.extrude` accepte maintenant des découpes en polygone (fentes de tenon).

- **Support de tiges de forage — « rack à rods »** (`rack-tiges-dd`, procédure
  d'installation PRO-DD-ST-008 de Machines Roger International, révision août
  2024, 5 pages, et rapport de certification Forcetech P19113 du 2019-11-27,
  6 pages). Aucun des deux documents ne donne de cotes : dimensions estimées
  sur les figures (23 tiges NQ en quinconce entre les poteaux). Modules dans
  `src/models/rack-tiges-dd/` :
  - `support.js` (P01) : le support pièce par pièce, peint en rouge, avec les
    rallonges du haut et du bas qui dépassent les 8 rangées de tiges ;
  - `installation.js` (P02) : l'installation selon la procédure, en 15 étapes
    (la page s'ouvre en montage par étapes, `view.stepsAuto`) : trou de 18 po
    au centre du support à ± 5 pi du plancher, boulon à œil pas enfoncé
    jusqu'au fond, support levé à deux et incliné à 78° (75° à 80° exigé),
    chaîne d'ancrage passée dans le boulon puis dans les œillets et serrée au
    tendeur à cliquet, 184 tiges NQ de 3 m en quinconce appuyées sur les
    barres du fond (empilement calculé tige par tige), chaîne de retenue dans
    les crochets fermés, qui arrête le paquet avant 80° (angle calculé d'après
    sa longueur), marques à 5 pi ;
  - `chantier.js` (paroi de roche grillagée et soutènement, plancher repris
    de `plancher-dd`), `outils.js` (boulon à œil, tendeur, foreuse à
    percussion sans fil, tournevis), `reperes.js` (cotes, arcs, zones),
    le niveau à degrés aimanté de l'étape 5 (équipement `niveau-a-degres`,
    `outil()` et `niveler()` : collé à la face avant du poteau de gauche,
    cadran vers le haut, comme sur la photo du client, à la place du niveau
    numérique de la photo de la procédure ; son aiguille lit les 78° du
    support), `travailleur.js` (silhouette articulée : les mains et les
    pieds vont où on les pose, par cinématique inverse à deux segments ; le
    foreur tient la foreuse par ses deux poignées, les deux porteurs tiennent
    les poteaux, pieds en place ; à l'étape 14, une main tient le tournevis,
    comme sur la photo de la procédure).
  Repères de mesure : orange = mesure, vert = permis, rouge = limite ou
  interdit, bleu = sens du geste ; chacun n'est montré qu'à son étape
  (`userData.stepOnly`) et peut porter un thème (`userData.stepTag`,
  `Viewer.setStepTags`) pour n'en montrer qu'un à la fois ; un thème en « + »
  (vue en coupe du trou, repères de la coupe de l'étape 10) n'est montré
  qu'à la demande. Animations d'étape (`userData.stepAnim`, jouées par
  `Viewer.setStep`, qui en rend la durée pour que la lecture automatique les
  laisse finir) : perçage, pose du boulon, support qu'on incline à deux,
  chaîne passée bout par bout, serrage au cliquet (le tendeur pend à la
  chaîne lâche, ses vis rentrent d'un cran par coup de levier, la chaîne
  garde sa longueur), paquet de tiges qui bascule et que la chaîne retient.
  Conformité à la procédure : `node scripts/check-rack.mjs` prend 49 mesures
  sur le modèle construit — l'installation finie (hauteur et centrage du
  trou, appui des pattes du haut, angle, chaîne passée par l'extérieur des
  œillets, levier du tendeur, quinconce, tiges qui se touchent sans se
  traverser, appui au fond et jeu sur les côtés, rallonges, crochets entre 66
  et 72 po, point bas à 5 pi au moins, marques), puis les états
  intermédiaires des animations (avance de la mèche de 18 po, boulon pas
  jusqu'au fond, gants sur la foreuse et sur les poteaux, bottes sur le
  plancher, aucun fil du grillage devant le trou, surplus de chaîne posé au
  sol, même nombre de maillons à chaque état, tendeur accroché à chaque coup
  de levier, tiges retenues avant 80° puis revenues à 78°, main au manche
  du tournevis).
  **Vidéo de la procédure** (premier contact avec la méthode, 4 min 04,
  1280 × 720, 24 i/s, muette, sous-titrée) : scénario dans
  `src/video/rack-script.js` — par passage, bandeau, réplique du formateur,
  plans de caméra choisis selon ce qui est expliqué (ensemble, gros plan,
  profil pour un angle avec le plancher d'où il se mesure, plongée pour le
  quinconce, coupe pour le trou, coupe au ras de la traverse pour l'appui au
  fond : `clip`, `Viewer.setClip`), repères révélés une idée à la fois
  (`reveal`), photos et schémas de la procédure incrustés (`inset`), cartons
  (`card`), rappels (`cues`). Les plans sont
  fixes ; la caméra ne bouge que pendant une animation. Tournage image par
  image sous une horloge arrêtée : `scripts/video-rack.mjs` (le rendu 3D,
  coûteux sans carte graphique, n'est refait que si la scène a changé, sinon
  l'image précédente est reprise ; images par passage, re-tournage partiel
  avec `--only`, deux tournages en parallèle avec `--no-encode`, serveur
  d'images fixes `--serve` pour régler les plans, planche-contact
  `scripts/video-rack-planche.py`, contrôle des images vides
  `scripts/video-rack-vides.py`). Script de voix minuté et
  sous-titres : `node scripts/video-rack-script.mjs` (`video/rack/`,
  `sous-titres.vtt`) ; la voix enregistrée s'ajoute avec `--voix`. Publiée
  dans `public/equipment/rack-tiges-dd/video/` (lecteur `index.html`, relié
  au montage par `view.video` ; tant que la vidéo est muette, le texte de la
  voix défile sous l'image, sans couvrir le bandeau ni les mesures).

- **DR Fabrication DR1500-U** (`dr1500-u`, foreuse souterraine, manuel de
  pièces MRI de 25 pages, machines DR-U-109-20 à DR-U-112-20) : 20
  assemblages et 3 tableaux (transmission par machine, mâchoires et bagues
  12HH, bagues de guidage), tous en 3D (`src/models/dr1500-u/`, un fichier
  par assemblage dans `parts/`). La foreuse (P002) est assemblée comme sur
  la couverture et éclatée comme la page 2 : frame skud à patins relevés et
  parois « DR FAB », assise sur quatre tourillons dans leurs split-blocs,
  vérins de tilt, mât 1500M rentré sur ses clamps avec le vérin d'avance
  logé dedans, table et tête XBH (Usinage X-Spec : carter, broche sur 6224
  et 3222, chaîne triple de 47 pas, pompe, filtre, bague MP6104 qui remplace
  la pièce 24 rayée) avec son kit d'adaptateur (transmission 4 vitesses,
  moteur AA6VM160), mandrin et serre-tiges Boyles 12HH (ressorts, mâchoires,
  pistons et cylindres 55-0200 et 55-0300 des pages 20 et 23, plaque
  support), base du serre-tiges du plan coté de la page 25, kit de poulie
  bascule, treuil Hoist XW-2100 sous l'assise (tambour, vis d'enroulement à
  suiveur, chaîne RS40 de 43 po qui fixe l'entraxe), pattes d'extension et
  plaque d'ancrage. La racine (P001) pose au sol la foreuse, le groupe
  hydraulique 125 HP (P007, avec ses panneaux P008) et le waterpack (P009,
  avec la pompe Pratissoli P010), sans boyaux ni câbles (le manuel n'en
  montre pas), et la console de commande (P026), ajoutée hors manuel d'après
  une photo du client (page P026 : pied en tôle, boîtier gris à fenêtre
  vitrée, télécommande à huit leviers, arrêt d'urgence, appareil noir à
  touches sur le flanc), sans cote ni numéro : échelle tirée de l'arrêt
  d'urgence (Ø 40 mm), caméra du photographe retrouvée sur la photo, faces
  cachées fermées au plus simple, marques et autocollants illisibles non
  reproduits ; sa place près de la foreuse est un choix de disposition.
  Repère commun et cotes d'interface dans `layout.js`, chacune
  avec sa source : cotes du manuel (plan de la page 25, désignations de
  visserie, de roulements et de vérins, échelles des dessins X-Spec), normes
  (roulements, chaînes ANSI, NEMA 444TC), pièces Boyles du STM-1500 (mêmes
  numéros), mesures sur la couverture et les éclatés ; restent estimés la
  longueur (3,55 m) et la section du mât, les hauteurs (axe de forage à
  1,30 m), la largeur du skid, la place des pivots et des vérins de tilt, du
  treuil, des pattes et de la poulie. Anomalies du manuel relevées en note
  (repères sautés, n° HCL-2548 / DR-HCL2536, « FRAME SKUD », « PRESSURE
  FILTE », n° terminé par « ? », lignes rayées 24 et 45 de la tête,
  transmission « Fairfield » contre « Funk 4 vitesses », accouplement 5015
  face à 5016, n° 15105 en double dans le treuil, en-tête 1-6 pour 8
  repères, colonnes vides). Couleurs, à la demande du client : rouge
  Machines Roger (celui du STM-1500) pour tout ce qui est peint, y compris
  le bâti, les plaques, le tambour et les gardes du treuil comme sur le
  STM-1500, vérins noirs, coffret électrique gris. Contrôle :
  `node scripts/check-models.mjs --eq dr1500-u --qty --max-tris 150000`.

- **Usinage Marcotte STM-1500** (`stm-1500`, foreuse souterraine
  s/n STM-1500-128, manuel de pièces de Machines Roger, 96 pages) : 42
  assemblages et 7 documents (transmission Funk, refroidisseur, accumulateur,
  contrôleur de sécurité, schéma électrique). En 3D : l'ensemble prêt à forer
  (P002, disposé d'après le plan de l'atelier : console à plus de 3 m de la
  foreuse, commandes tournées vers l'opérateur qui regarde la foreuse par-dessus
  la console, groupe hydraulique à plus de 3 m, boyaux et câble de commande
  branchés et posés au sol ; contrôle : `node scripts/check-layout.mjs --eq
  stm-1500 P002 --min 3 --ref 1`), la
  foreuse avec l'avance à 0° (P010 : traîneau, support d'avance, poutre, pied,
  boîte et serre-tiges Boyles 12HH, table, vérins de bascule, de relevage,
  d'avance double logé dans la poutre, jambes, attelage, plaque d'extrémité
  portant la rallonge, la poulie double et le guide de tiges, émerillon d'eau
  au bout de la broche, treuil de câble posé sur le traîneau au bout arrière,
  sous la poutre, avec son câble passé par le guide-câble et la poulie double
  jusqu'au guide de tiges, boyaux des vérins (avance, bascule, relevage) et du
  moteur du treuil sur les blocs de raccords des longerons ; sans le
  garde-corps ni le vérin supérieur ; mandrin rouge), le treuil de câble
  10 000 pi (P042 et ses étapes P039 à P041 : bâti, tambour à flasques et câble
  enroulé, paliers, transmission par chaîne 80 depuis le moteur White, capots,
  vis-mère et guide-câble à rouleaux, chaîne 35, volant, bras réglables ; une
  machine porte un seul tambour et une seule transmission, les listes valant
  pour les versions gauche et droite), la tête
  Boyles (P048 : boîte à chaîne triple, broche, roulements, joints, mandrin
  Boyles H, transmission Funk 4 vitesses, moteur A6VM, pompe de lubrification,
  filtre, visserie), le groupe hydraulique 125 HP posé sur ses patins, sans
  roues ni timon (P068 : cadre, moteur WEG, pompes Rexroth accolées en tandem
  avec leurs aspirations sous le réservoir, réservoir 110 gal posé sur les
  longerons du haut, collecteur de retour, filtres, boîte électrique,
  transformateur, refroidisseurs, planchers grillagés ; boyaux intérieurs
  chacun sur son orifice) et la console (P078, 58 29/32 po hors tout comme au
  manuel : panneaux, pupitre, manomètres, distributeurs, contrôleur de
  sécurité). Les autres
  assemblages s'affichent avec les dessins du manuel. Le manuel désigne les
  pièces par leur numéro (bulles des dessins) : les repères 1, 2, 3… sont les
  rangs des lignes de la liste. Couleurs : foreuse, tête et groupe en rouge
  (dessins du manuel), vérins noirs, console blanche (photo de couverture). Le
  PDF d'origine (116 Mo) est dans la release GitHub `STM1500`. Listes :
  `tools/extract_stm1500_lists.py` (brouillon par position des mots, gardé
  dans `tools/data/stm1500-listes.json`) puis
  `tools/extract_stm1500.py` (nettoyage, pages scannées transcrites, liens,
  `src/models/stm-1500/refs.js`). Rendus photoréalistes Blender dans
  `public/equipment/stm-1500/renders/`.

- **Table à carottes C16080960** (`table-a-core`, table d'atelier en aluminium
  6061-T6 fabriquée par Foresco pour Machines Roger, projet 07-0006, 64 × 65 ×
  34 5/8 po) : la 3D ne vient pas d'un manuel mais de la CAO du fabricant.
  `tools/solidworks_asm.py` lit le fichier d'assemblage SolidWorks (.SLDASM)
  sans SolidWorks : arbre des composants, poses et facettes d'affichage de
  chaque pièce (bandes de triangles) ; `tools/blender_table_core.py` monte la
  scène dans Blender (soudure, arêtes vives, aluminium nu, contreplaqué), écrit
  `table-a-core.blend`, `table-a-core.glb`, les rendus Cycles
  (`public/equipment/table-a-core/renders/`) et les maillages du site
  (`src/models/table-a-core/mesh.js`). Repères 1 à 7 : nomenclature du plan
  d'assemblage ; 8 : le contreplaqué du modèle. Pages : plan d'assemblage
  (aperçu du .SLDDRW) et développé de la jupe C16080961 retracé d'après le DWG.

- **Support à pipewrench 0102806** (`support-pipewrench`, assemblage soudé en
  acier 44W de Machines Roger International, plan d'assemblage du 2022-11-17,
  1 page, 25 1/2 × 9 × 28 3/4 po) : les 8 articles de la nomenclature — base
  pliée de 1/2 po à coins en onglet, plaque de bout, montant découpé (deux
  fenêtres, disque à trois trous), traverse pliée en pente avec sa butée,
  oreilles percées du haut et du bas, goupille et tube — et les cordons de
  soudure du plan. Le plan ne porte qu'une dizaine de cotes : les autres
  dimensions sont relevées sur le tracé vectoriel du PDF (échelle 1:8,
  environ 1/64 po près). Aucun fini n'est précisé : peint en rouge, comme sur
  la photo du support fabriqué. Le cartouche inscrit 23,1 lb alors que le
  volume du modèle donne environ 96 lb en acier (signalé dans la note de la
  page). P002 à P004 (`situation.js`) : mises en situation hors plan, avec
  une clé à tuyau de 18, 24 ou 36 po posée en contre-clé (mâchoires vers le
  haut) et un tronçon de tige NQ déposé dans les mâchoires ; la pose est
  calculée (repos par gravité sur la traverse, `pose()`), pas relevée.

- **Clés à tuyau droites, 6 à 60 po** (`cles-a-tuyau`) : neuf grandeurs (6, 8,
  10, 14, 18, 24, 36, 48 et 60 po) sur une page. Maillage et textures : clé à
  tuyau de Poly Haven (CC0, Will Evarts ; `tools/cle_polyhaven_mesh.mjs` écrit
  `src/models/cles-a-tuyau/mesh.js`). Chaque grandeur est ajustée aux cotes
  publiées des clés RIDGID « heavy-duty » droites (`forme.js` : longueur
  fermée, largeur de tête, épaisseur à l'écrou, puis section du manche réglée
  sur le poids du catalogue). Les cotes viennent de fiches de détaillants, pas
  d'un plan du fabricant ; c'est la même clé étirée par zones. Matériau
  texturé hors palette (`equipment/cles-a-tuyau/textures/`), qui demande un
  nouveau rendu à la visionneuse une fois chargé (`pieces3d:redessiner`).
  **Unreal Engine** : `node scripts/export-cles-unreal.mjs --textures <dossier>`
  écrit `SM_Cles_A_Tuyau.glb` (les neuf grandeurs) dans
  `public/equipment/cles-a-tuyau/unreal/`, et `SM_Support_Pipewrench.glb`,
  `support-avec-cles.glb` (clés de 18, 24 et 36 po en place, tiges NQ) et la
  fiche des poses dans `public/equipment/support-pipewrench/unreal/` ; mode
  d'emploi dans `docs/cles-unreal.md`.

- **Clés mixtes 12 pans, 1/4 à 1 1/4 po** (`cles-mixtes`) : seize grandeurs
  (1/4, 5/16, 3/8, 7/16, 1/2, 9/16, 5/8, 11/16, 3/4, 13/16, 7/8, 15/16, 1,
  1 1/16, 1 1/8 et 1 1/4 po) sur une page, fourche d'un bout et œil 12 pans de
  l'autre. Maillage et textures : clé mixte de Poly Haven (CC0, auteur BKS ;
  `tools/cle_mixte_polyhaven_mesh.mjs` écrit `src/models/cles-mixtes/mesh.js`
  et y mesure la fourche et l'œil). La clé de base est une 1 po ; chaque
  grandeur est ajustée aux cotes publiées par Gray Tools pour ses clés 12 pans
  SAE à œil incliné de 15°, n° 3108 à 3140 (`forme.js` : fourche et 12 pans à
  la grandeur nominale, largeur et épaisseur de la tête à fourche et de l'œil,
  œil porté de 10° à 15°, manche allongé jusqu'à la longueur hors tout, puis
  section du manche — non publiée — réglée sur le poids du tableau). Le tableau
  du fabricant a été relevé par recherche web (son site n'était pas joignable
  depuis la session) : à confirmer sur le catalogue. C'est la même clé déformée
  par zones ; la texture d'acier ne porte aucun marquage. Contrôle chiffré :
  `node scripts/check-cles-mixtes.mjs` mesure 11 cotes sur chacune des 16 clés
  (176 mesures) et les compare au tableau.

- **Clé à molette (Westcott) de 12 po** (`cle-a-molette`) : modèle déjà fait, pas dessiné ici — la clé à molette
  du « Tool Pack 1 » d'OpenGameArt (CC0, auteur LonesomeDucky ; https://opengameart.org/content/tool-pack-1), un
  modèle de jeu de 1 240 triangles à textures PBR de 1 024 px, chromé et piqué de rouille, en trois pièces : corps,
  mâchoire mobile et molette (`tools/cle_molette_mesh.mjs` écrit `src/models/cle-a-molette/mesh.js`). Il
  représente une clé marquée « 12"-300mm » et mesure 327 mm : il est ramené à 12 po (305 mm) de long, d'un seul
  facteur d'échelle (`forme.js`). Largeur de tête, épaisseur, ouverture et masse sont donc celles du modèle, pas des
  cotes de catalogue. Une page, P001 : la clé et sa vue éclatée en trois pièces (l'axe de la molette et son ressort
  ne font pas partie du modèle). La fiche est écrite par `tools/cle_molette_fiche.mjs`, d'après les cotes mesurées
  sur le maillage. Textures du site dans `equipment/cle-a-molette/textures/` (WebP). **Unreal Engine** :
  `node scripts/export-cle-molette-unreal.mjs --textures <dossier>` écrit `SM_Cle_A_Molette_12po.glb` (trois
  maillages, pivots de la mâchoire et de la molette conservés) dans `public/equipment/cle-a-molette/unreal/` ; mode
  d'emploi dans `docs/cle-a-molette-unreal.md`.

- **Étui en cuir pour clé à molette, porté à la ceinture** (`etui-cle-molette`) : reconstitution d'après une
  seule photo, de 44 × 96 pixels, où la clé est rangée mâchoires vers le haut dans un étui porté à la taille ; ni
  plan ni cote. L'échelle vient de la clé, prise pour une 12 po (4,1 mm par pixel, lectures à environ 8 mm près) :
  étui de 5 po de haut, 3 po de large en haut et 2 1/2 po en bas, deux rivets visibles aux coins du bas. Supposé,
  parce que caché ou illisible : le dos replié en passant de ceinture, les deux rivets du haut, l'épaisseur et la
  couleur du cuir, et la profondeur (1 1/2 po, celle d'un étui de mineur du commerce). P001 : l'étui (dos,
  fourreau cintré en U, quatre rivets) ; P002 (racine) : l'étui sur un tronçon de ceinture, la clé de 12 po du
  site (`cle-a-molette`) rangée manche en bas, à la place calculée par `pose()` — les épaules de sa tête sur la
  gueule du fourreau. Les bandes de cuir sont des contours extrudés puis resserrés vers le bas (`cuirExtrude()`
  dans `src/models/etui-cle-molette/index.js`). La fiche et la page du relevé sont écrites par
  `tools/etui_cle_molette_fiche.mjs`. **Unreal Engine** : `node scripts/export-etui-unreal.mjs --textures
  <dossier>` écrit `SM_Etui_Cle_A_Molette.glb` (l'étui seul) et `etui-avec-cle.glb` (l'étui et la clé rangée)
  dans `public/equipment/etui-cle-molette/unreal/` ; mode d'emploi dans `docs/etui-cle-molette-unreal.md`.

- **Poste de premiers soins et d'extincteur** (`poste-secours`) : reconstitution
  d'après une seule photo du poste installé sur le grillage de la cage, sans
  plan ni cote. L'échelle vient du ruban réfléchissant (2 po de large) et de
  l'extincteur à poudre de 5 lb (cylindre de 4 1/4 po) : toutes les dimensions
  sont estimées, à environ 1 po près. Cadre en tôle découpée d'environ 34 × 24
  po (plein derrière l'armoire, ferme à poinçon et croix à droite), ruban rouge
  et blanc sur le pourtour, armoire blanche à toit incliné et façade
  transparente à croix rouge, trousse, deux bouteilles de rince-œil, extincteur
  pendu à son crochet avec ses étiquettes d'inspection, tronçon du grillage
  pour situer le poste. Ce qui est caché sur la photo (tôle derrière l'armoire,
  suite du ruban) est supposé et signalé dans la note de la page ; les
  fixations, invisibles, ne sont pas modélisées. Étiquettes dessinées sur un
  canevas (génériques : marque et numéros illisibles sur la photo).

- **Poignée d'homme mort (dead man) Tormach 51213** (`dead-man`) : interrupteur
  de validation à 3 positions (« Hold-to-Run Safety Switch » du robot ZA6 :
  relâché = arrêt, mi-course = marche permise, enfoncé à fond = arrêt),
  reconstitué d'après deux photos du produit (P01 : poignée tenue en main ;
  P02 : poignée de côté, câble lové et connecteur), sans plan ni cote. Seules
  données publiées, reprises telles quelles : le câble de 4 m (le modèle mesure
  4,000 m du bas du boîtier au connecteur, le rayon du lovage est ajusté pour
  cela) et le connecteur M12. Le reste est estimé à environ 15 % près : la
  longueur du boîtier (environ 150 mm) vient de la main de la photo P01 et de
  l'écrou du connecteur M12 de la photo P02, les autres dimensions sont
  relevées en proportion sur la vue de côté. Coque arrière jaune à dessus en
  pente, coque avant noire (tête à nez, flancs à cinq nervures, garde, pied),
  barre du bouton sous les doigts, étiquette à marquage CE dessinée sur un
  canevas (générique : marque illisible, fabricant d'origine non indiqué),
  presse-étoupe (taille M20 estimée), protecteur de courbure en spirale qui
  suit la courbe du câble, câble lové en deux couches sans croisement,
  connecteur à écrou moleté. Les deux coques sont des volumes passant par des
  sections en D (`gabarit()` dans `src/models/dead-man/index.js`) ; l'intérieur
  du boîtier, invisible, n'est pas modélisé.

- **Scie alternative sans fil Makita DJR183Z** (`makita-djr183`) : scie
  alternative 18 V LXT (outil seul), reconstituée d'après deux images du
  produit (P01 : photo de trois quarts, sans batterie ; P02 : vue de côté d'une
  scie de même forme, avec batterie), sans plan ni cote. Données publiées,
  reprises telles quelles : longueur hors tout de 398 mm, course de 13 mm, 0 à
  3 000 courses/min, capacité de 50 mm, 18 V. Le profil est relevé sur la vue
  de côté, mise à l'échelle pour que la batterie (non modélisée) finisse à
  398 mm du patin ; le reste est estimé à environ 15 % près. Le manuel
  d'instructions n'a pas été consulté directement : noms et fonctions des
  pièces viennent d'extraits publiés. Nez, carter et poignée sont des coques
  passant par des sections en super-ellipse relevées sur le profil (`corps()`
  dans `src/models/makita-djr183/scie.js`) ; ouïes, plaques et bandes sont des
  reliefs posés sur ces coques. À la demande du client, le nom de la marque
  n'est pas écrit sur la plaque du modèle. Page P03 (racine) : découpe libre
  d'un 3 × 8, scie tenue à la verticale (`decoupe.js` et la fonction
  `src/ui/features/decoupe.js`, pour toute vue qui fournit `view.decoupe`) :
  on trace le trait en glissant sur le bout de la planche qui dépasse des
  cales, et la scie le suit, droit ou courbe. Le trait est lissé (rayon mini
  d'environ 70 mm : flèche de la lame de 19 mm dans un trait de 1,6 mm),
  prolongé jusqu'au bord s'il part du bois, arrêté avant les cales et avant de
  recouper son propre trait. Le morceau de planche est un polygone du plan du
  dessus : un trait traversant le sépare en deux (`separer()`), celui qui ne
  tient plus aux cales tombe ; un trait qui s'arrête laisse une entaille
  (`entailler()`). Le prisme du morceau est refait à chaque image pendant que
  la lame avance. Un 3 × 8 brut fait 76 mm d'épaisseur, plus que la capacité de
  50 mm publiée pour le bois : la scène montre le geste, pas une capacité
  garantie. Page P02 : scène animée du
  sciage d'un 2 × 4 posé sur deux cales (`sciage.js`), en trois étapes du
  montage par étapes — appuyer le patin, scier, retirer la scie — lues d'elles-
  mêmes à l'ouverture (`view.stepsPlay`). L'état de la scène est une fonction
  pure du temps (`etat(T)`) : lame, manchon et coulisseau battent de 13 mm, la
  scie descend en basculant sur le patin, le trait de scie suit la ligne des
  dents, la sciure est projetée puis tombe, la chute se détache et rebondit.
  Cadence ralentie pour la lecture (environ 7 courses par seconde). Le décor
  se limite au bois ; l'opérateur n'est pas montré.

- **Niveau laser à lignes croisées Bosch GLL50-20** (`bosch-gll50-20`) :
  niveau laser autonivelant à deux lignes rouges (horizontale et verticale),
  fait à la demande du client sans le manuel ni photo (sites du manuel
  inaccessibles depuis l'atelier) : seules les données publiées par les
  détaillants sont reprises telles quelles — environ 107 × 63 × 98 mm
  (4,2 × 2,5 × 3,9 po), 0,77 lb, classe 2 (< 5 mW, 630 à 650 nm), portée de
  50 pi, ±5/16 po à 30 pi, autonivellement de 3,5° avec voyant hors niveau,
  deux piles AA, filetage 1/4-20, support aimanté intégré, IP 55. Formes,
  couleurs et emplacements (corps bleu, surmoulages des flancs, tête optique
  noire et sa fenêtre, interrupteur à curseur de blocage du pendule, touche et
  voyants du dessus, logement des piles, aimants arrière, filetage) sont
  supposés et signalés dans la fiche ; à corriger d'après une photo ou le
  manuel. Faisceaux montrés sur 0,15 m (ouverture de 120° supposée, la ligne
  verticale s'arrête au sol). Pas de vue éclatée (demande du client) : toutes
  les pièces restent en place (`src/models/bosch-gll50-20/index.js`) ; page
  P01 : les données publiées.

- **Pince à sertir de 30 po pour manchons de câble (wire line)** (`pince-a-sertir`) :
  pince à sertir manuelle VEVOR à trois empreintes, reconstituée d'après les
  vignettes d'une capture d'écran de recherche d'images (639 × 1 147 pixels ;
  page P01 : les quatre vignettes de la pince à trois empreintes, agrandies),
  sans plan ni cote. Données publiées, reprises telles quelles : longueur de
  30 po, empreintes pour câble de 5/32, 1/4 et 5/16 po (4, 6 et 8 mm), acier
  allié, mâchoires forgées et trempées, poignées en acier tubulaire. Les fiches
  du fabricant et des détaillants n'étaient pas joignables depuis la session :
  ces données viennent de la recherche web et de la vignette des dimensions,
  dont le reste (largeur de la tête, ouverture maximale, poids net) est
  illisible. Tout le reste est relevé sur la vue de face, à 4,3 mm par pixel
  (page P02 : tableau du relevé), ou supposé : épaisseurs, dos de la pince,
  visserie M12, diamètre des empreintes (8, 12 et 16 mm). Mécanisme lu sur les
  photos, celui d'un coupe-boulons : deux mâchoires sur leur pivot, tenues par
  deux éclisses ; têtes forgées des poignées articulées sur les queues des
  mâchoires et, entre elles, sur un boulon central ; fermée, la pince a ses
  trois boulons de poignée presque alignés (genouillère). `etat(phi)` dans
  `src/models/pince-a-sertir/index.js` donne la place de chaque boulon pour une
  ouverture `phi` des mâchoires ; l'ouverture maximale du modèle (mâchoires à
  10°, poignées à 55°, 1,06 m d'un bout à l'autre) est celle où les oreilles
  des deux poignées se rejoignent sur l'axe — valeur du modèle, pas du
  fabricant. P01 : la pince fermée et sa vue éclatée en 18 pièces (mâchoires,
  éclisses, boulons, écrous, poignées, manchons). P02 : la même, animée en
  trois temps du montage par étapes (fermée, ouverte, refermée), vue tête en
  haut ; les bulles de repère suivent les pièces. Mâchoires, éclisses et têtes
  des poignées sont des contours extrudés (`plaque()`), bras et manchons des
  corps balayés le long de leur axe (`balayage()` ; bras modélisés pleins,
  l'épaisseur du tube n'étant pas publiée). Non modélisés, parce qu'illisibles
  : le détail entre les mâchoires derrière l'éclisse, le « boulon réglable »
  signalé par une vignette, l'inscription de l'éclisse, le trou d'accrochage
  des manchons ; les boucles de câble serties de la photo ne font pas partie de
  l'outil. La fiche et la page du relevé sont écrites par
  `node tools/pince_a_sertir_fiche.mjs [--page <fichier.html>]`, qui contrôle
  aussi que le mécanisme reste monté sur toute la course (41 positions).

- **Visseuse à chocs sans fil Milwaukee M18 2656-20** (`milwaukee-2656`) :
  visseuse à chocs 18 V à mandrin hexagonal de 1/4 po, une vitesse (outil
  seul), d'après la liste de pièces de service 54-26-2503 de Milwaukee (vue
  éclatée et liste, à partir du numéro de série F26D ; P01 et P02), le manuel
  de l'utilisateur 58-14-2613d5 (P05) et deux images du produit (P03 : vue de
  côté cotée, 5,5 po de long ; P04 : trois quarts). Les 41 lignes de la liste
  portent leurs numéros Milwaukee ; toutes ont leur 3D sauf le coffret de
  transport (47) et l'étiquette d'avertissement non montrée (77). Le boîtier
  est relevé sur la vue de côté, mise à l'échelle des 5,5 po publiés (la
  hauteur obtenue, 190 mm, concorde avec les 7,6 po publiés) ; largeurs
  estimées d'après la photo et la largeur publiée de 2,4 po. Les deux
  demi-coques (35, 49) sont des coques à sections en super-ellipse coupées
  dans le plan de joint (`demiVolume()` dans
  `src/models/milwaukee-2656/visseuse.js`, qui reprend `corps()`, `bande()`
  et `relief()` de la scie Makita) ; en vue éclatée, elles s'écartent et
  découvrent le nez, le mécanisme de frappe, le moteur et l'électronique,
  dessinés d'après la vue éclatée (cotes estimées). Places supposées : vis du
  boîtier, patins en caoutchouc, plaque de service, ressort du bornier,
  trajet des fils. Le nom de la marque n'est pas écrit sur le modèle.

- **Panneau de grillage rigide à plis en V, maille 2 × 6 po** (`grillage-cage`) :
  type de grillage de la cage, identifié sur une photo (P01) et son relevé
  (P02 : fils verticaux tous les 2 po environ, fils horizontaux tous les 6 po,
  deux bandes de trois fils rapprochés qui sont les plis en V, pointes de 1 po
  au-dessus de la traverse). Ce type correspond au panneau Oméga II
  Architectural (Metaltech-Oméga) ; la marque reste à confirmer sur place.
  Cotes du modèle (`src/models/grillage-cage/index.js`) aux données publiées
  du fabricant : fil de calibre 6 (0,192 po), maille de 1 31/32 × 6 po, 92 3/4
  po de large (48 fils verticaux), 70 po de haut au catalogue (70 11/16 po au
  modèle : 12 mailles de 6 po, 3 plis à 30°, pointes de 1 po), environ 41 lb
  calculées. Supposé, et signalé dans la note de la page : fil du haut caché
  par la traverse, pli du pied, angle des plis, côté des fils horizontaux.
  Traverse et poteaux de la cage (P03, repères 4 et 5) relevés sur la même
  photo, sans cote : tube carré galvanisé d'environ 1 1/2 po, traverse devant
  le haut du panneau, arrêtée à environ 3 po du poteau de droite ; le poteau de
  gauche, hors de la photo, est supposé. Crochet du poteau, attaches et ancrage
  au plancher non modélisés.

- **Poubelle DD 154011700** (`poubelle-dd`, Machines Roger International, plans
  154011700 « POUBELLE » du 2024-01-17 à l'échelle 1:5 et 0103001 « COUVERCLE DE
  POUBELLE POUR DRUM 50KG » du 2024-12-02 à l'échelle 1:4) : poubelle en acier
  du chantier de forage au diamant et son couvercle. Poubelle (P02) : virole
  roulée de Ø 14 1/4 × 27 po en plaque de 1/8 po, fond de Ø 14 po en retrait de
  3/16 po, tenu par deux tenons de 3/16 po dans deux encoches de la virole et
  soudé de 1/8 po des deux côtés, tout le tour. Couvercle (P03), en plaque de
  1/16 po : dessus de Ø 15 po, jupe de Ø int. 14 5/8 po et 4 po de haut, anneau
  d'appui à 1/8 po sous le dessus, poignée en bande pliée à 2 1/2 po du bord.
  Les cotes des plans sont reprises ; ce qu'ils ne cotent pas (épaisseurs,
  encoches, tenons, joint de la virole, hauteur de la jupe, anneau, poignée) est
  relevé à l'échelle sur les tracés vectoriels des PDF. Aucun plan ne montre le
  couvercle sur la poubelle : la pose de l'ensemble (P01) est déduite des cotes
  (l'anneau porte sur le bord de la virole, la jupe descend autour avec 3/16 po
  de jeu au rayon). La vue en coupe du site reprend le plan des deux coupes A-A
  (X = 0). Poubelle et couvercle peints en noir, à la demande du client (les
  plans ne précisent pas de couleur de surface). Contrôle chiffré : `node scripts/check-poubelle-dd.mjs` compare 51
  mesures du modèle aux plans, vérifie que les maillages sont fermés et calcule
  les masses : 47,9 lb pour la poubelle et 6,85 lb pour le couvercle, pour
  47,9 lb et 6,9 lb aux cartouches.

- **Niveau à bulle de 4 pi (48 po), profilé caisson** (`niveau-4-pi`) : niveau
  du type Stabila 196-2 de 48 po (n° 37448), reconstitué sans plan ni photo
  d'après les données publiées par le fabricant et ses détaillants : longueur
  de 48 po, profilé caisson en aluminium, une fiole horizontale et deux fioles
  d'aplomb, deux poignées, embouts amortisseurs, masse d'environ 1,2 kg ;
  section d'environ 60 × 30 mm donnée par les fiches des détaillants (arrondie
  au centimètre). Supposé : flancs de 2 mm peints en jaune, semelles fraisées
  de 2,5 mm (faces de mesure en aluminium nu), âme centrale de 1,5 mm, place et
  taille des fenêtres et des trous de main, fioles de Ø 13 mm tenues par une
  plaque d'acrylique, embouts de caoutchouc noir creux. Niveau couché : la
  bulle de la fiole horizontale est entre ses repères, celles des fioles
  d'aplomb montent au bout du haut. Contrôle de la masse : 1,25 kg calculés
  contre 1,2 kg publié. La fiche et la page des cotes (P01, vue de côté et
  section) sont écrites par `tools/niveau_4_pi_fiche.mjs` à partir des cotes
  du modèle (`src/models/niveau-4-pi/index.js`).

- **Clé à tube pleine prise au carbure, grosseur N (tube intérieur de carottier)**
  (`cle-a-tube`) : clé à tube « pleine prise » (full grip tube wrench)
  reconstituée d'après une photo du client — deux clés pendues à un mur, vues
  presque par la tranche, manches coupés par le bas de la photo —, la photo du
  même type de clé publiée par TIME Limited (« Tube wrenches », vue à plat),
  que le client a reconnue, et ses indications sur la première version du
  modèle : la coche qui permet de serrer, les dents de carbure à l'intérieur
  des mâchoires. Aucun plan, aucune cote publiée, aucune marque lisible : le
  fabricant n'est pas identifié (clés du même type aux catalogues : TIME
  Limited 92-21-460 et 92-21-460CBD, Fordia / Epiroc 3760006031). Seule cote
  sûre : le tube intérieur N, Ø 55,6 mm (2 3/16 po), rayon des deux mâchoires ;
  si les clés du client sont celles du tube extérieur N (Ø 73 mm), `TUBE.d`
  est à changer dans `src/models/cle-a-tube/index.js`. Photo du client, à
  0,53 mm par pixel : épaisseurs (mâchoire crochet de 22 mm, joues de 8 mm,
  fourche de 23 mm, manche d'environ 35 × 19 mm), fourche de la mâchoire de
  liaison à cheval sur la tête du manche et sur l'œil du crochet, boulon de
  1/2 po avec rondelle et écrou à l'articulation des mâchoires, axe à tête
  ronde du manche, creux du manche, et ce qui semble être une plaquette de
  carbure dans sa cuvette au bas de l'anneau. Photo de référence, redressée et
  mise à l'échelle du tube : place des deux articulations, étendue et
  épaisseur des arcs, ergot au bout du crochet, trou d'accrochage — le tracé
  du modèle s'y superpose. Supposé et signalé : la longueur du manche (450 mm
  de l'axe au bout, 569 mm hors tout), le dos de la clé, le bout riveté de
  l'axe, la forme de la coche et du talon qui la porte (aucune photo ne la
  montre de face), le nombre et la place des dents de carbure (3 sur la
  mâchoire de liaison, 4 sur la mâchoire crochet) ; masse calculée de 2,7 kg.
  **Mécanisme** (indication du client, mise en forme par le tracé) : les deux
  mâchoires enveloppent le tube sur 281° ; le bout de la mâchoire crochet
  porte un ergot sur son dos ; quand on appuie sur le manche, la coche de sa
  tête coiffe l'ergot et le presse sur le tube, à 33 mm de l'axe pour un
  manche de 450 mm (effort multiplié par 13 environ) : les mâchoires serrent
  le tube sur tout son tour et les dents de carbure mordent ; dans l'autre
  sens, la coche quitte l'ergot et la clé reprend sa course. P01 : la clé à
  plat, mâchoire crochet ouverte de 100° comme sur la photo de référence, et
  sa vue éclatée (manche, mâchoire de liaison, mâchoire crochet, axe, boulon,
  rondelle, écrou, 7 dents de carbure). P02 : la même sur un tronçon de tube,
  animée en cinq temps (coiffer le tube, refermer la mâchoire, appuyer — la
  coche prend l'ergot, le tube tourne avec la clé —, ramener le manche — la
  clé glisse —, reprendre) ; la course de 35° est un choix de mise en scène.
  `etat(k)`, `heurt()`, `jeuCoche()`, `jeuNez()`, `jeuCrochet()` et
  `passage()` du modèle sont contrôlées par `scripts/check-cle-a-tube.mjs`
  (`npm run check:cle-tube`) : le manche et la mâchoire crochet ne se
  pénètrent à aucun moment de l'animation. La fiche et la page des cotes (P02)
  sont écrites par `tools/cle_a_tube_fiche.mjs` ; P01 est la photo du client,
  agrandie trois fois.

- **Niveau à degrés à fiole pivotante (rapporteur d'angle)** (`niveau-a-degres`) :
  outil de mesure d'angle reconstitué d'après deux photos du client, sans
  manuel ni plan. Le logo, coupé par le bord de la première photo, se lit
  « Ta… » et « SLA… » : identification probable d'un Tajima SLANT 100
  (SLT-100), dont les fiches décrivent le même outil. Première photo, de près :
  les 150 premiers millimètres, côté cadran, à l'échelle du couvercle du cadran
  pris à 100 mm de diamètre — boîtier noir et son coin arrondi, deux règles
  d'aluminium d'équerre de 8,5 mm (base et bout), cadran fixe à méplat gradué
  aux 2° de 0 à 90 dans chaque quart (« PLUMB » à 90, chiffres 90 en rouge) et
  en pente (« PITCH », pouces par pied, 2 à 40), tambour pivotant de 62,4 mm
  avec la fiole verte de Ø 11 mm (deux paires de traits, embouts noirs) et
  l'aiguille rouge, molette bleue de Ø 29 mm, début du trou de main et du cadre
  du logo. Seconde photo : l'outil entier, petit (1,43 mm par pixel), collé au
  poteau du rack à tiges — elle donne la longueur, environ 9 po (228,6 mm à
  6 mm près, et non les 10 po d'un détaillant), et la forme du bout à 5 mm
  près : chant du haut qui décroche sous la molette puis descend en biseau
  d'environ 21°, trou de main en trapèze, bout tronqué à 66 mm de haut, cadre
  du logo de 50 mm (`contourBoitier()`, `contourTrou()`). Publié : 4 3/4 po de
  haut, boîtier d'ABS, mode d'emploi. Supposé et signalé : l'épaisseur de
  25 mm, le dos, la profondeur du tambour, la saillie de la molette et son
  entraînement (3 tours pour 1), la courbure de la fiole. Le texte du logo
  n'est pas fait. Indiqué par le client : l'outil sert à vérifier l'angle du
  rack à tiges (`rack-tiges-dd`), qui doit être entre 75° et 80° (procédure
  PRO-DD-ST-008, étape 5), et il est aimanté — sur la seconde photo, il tient
  seul par sa règle de base contre la face avant du poteau du rack, cadran
  vers le haut ; les aimants étant cachés, une bande aimantée de 6 × 1,5 mm
  est supposée dans la face de mesure de la règle de base (repère 9), en
  retrait de 0,2 mm.
  **L'outil fonctionne** (`src/ui/features/niveau-degres.js`, outil « Mesurer »
  de la vue 3D) : la surface mesurée — le poteau du rack à tiges, profilé carré
  rouge de 2 po du support, repère de la scène et non pièce de l'outil — se
  penche, et l'outil, collé dessus par sa règle de base, pivote avec elle ; la
  molette ou la fiole se tirent dans la vue 3D ou se règlent au curseur, la
  bulle glisse vers le bout le plus haut et bute au bout, l'angle se lit sous
  l'aiguille (degrés, pouces par pied, pour cent) ; « Centrer la bulle » tourne
  la molette, « Cadran de face » cadre le cadran ; sur un téléphone, « Suivre
  le téléphone » lit ses capteurs d'inclinaison (le téléphone tenu debout
  remplace l'outil). Rack à tiges : « Poser sur le rack à tiges » penche le
  poteau à 78°, comme le support de la scène d'installation, et y colle l'outil
  cadran vers le haut, comme sur la seconde photo. Les degrés à ne
  pas dépasser sont en rouge sur le cadran, en permanence (demande du client) :
  trait rouge épais à 75° et à 80°, zones interdites en rouge, zone permise en
  vert, étiquette rouge « MIN 75° · MAX 80° » du côté de l'aiguille — repères
  du site, absents de l'outil, masqués en vue éclatée et en coupe. Le panneau
  rappelle les deux limites en rouge et dit, bulle centrée, si l'angle lu est
  conforme, trop couché ou trop debout, avec un lien vers la procédure du
  rack. Le même outil est posé dans la scène d'installation du rack à tiges
  (`rack-tiges-dd`, étape 5), collé au poteau (`outil()`, `niveler()`). La
  place de la bulle, la pose sur la pente, la lecture et le verdict
  sont dans le modèle (`bulle()`, `regler()`, `lecture()`, `verdictRack()` de
  `src/models/niveau-a-degres/index.js`), contrôlées par
  `scripts/check-niveau-degres.mjs` (`npm run check:niveau`). La fiche et la
  page des cotes (P02, vue de face) sont écrites par
  `tools/niveau_a_degres_fiche.mjs` ; P01 et P03 sont les deux photos du
  client (le cadran de près, l'outil collé au poteau du rack).

- **Pince-monseigneur Garant CB60PC, 60 po, pointe en biseau**
  (`pince-monseigneur`) : barre-levier forgée d'une seule pièce, reconstituée
  d'après une photo du produit (P01 : barre debout, pointe en bas), sans plan.
  Données publiées par Garant, reprises telles quelles : la longueur de 60 po
  et la lame de 1 1/8 po, prise pour le côté du pied carré. Le reste est relevé
  sur la photo (546 pixels pour 60 po, soit 2,79 mm par pixel ; largeurs à un
  demi-pixel près, longueurs à un pixel près) et arrondi au 1/8 po : poignée
  ronde de Ø 7/8 po sur 22 3/4 po, fût octogonal de 1 1/8 po sur plats sur
  23 3/8 po, pied carré sur 13 7/8 po, biseau d'un seul côté de 2 3/4 po laissé
  en acier nu, peinture rouge orangé. Supposé : le nombre de pans du fût et le
  tranchant émoussé de 2 mm. Demandes du client : pas d'étiquette (la photo en
  montre une sur le pied), et une barre qui a servi — peinture ternie, partie
  jusqu'à l'acier le long des arêtes, au bout de la poignée et près de la
  pointe, taches de rouille sur la peinture et sur le biseau ; c'est une mise
  en apparence, aucune cote ne change. L'usure vient d'un réglage `wear` de
  `withFinish()` (`src/viewer/materials.js`) et d'un attribut `aWear` par
  sommet du maillage (1 sur les arêtes et les bouts). La barre est un
  volume passant par des sections de 64 points (rond, octogone, carré ;
  `volume()` dans `src/models/pince-monseigneur/index.js`) ; les repères 1 à 4
  désignent ses zones, qui s'écartent en vue éclatée pour montrer les trois
  sections (la barre réelle ne se démonte pas). Contrôle de la
  masse : 7,0 kg (15,4 lb) calculés à 7 850 kg/m³ contre 18 lb publiées, écart
  qui correspond à des sections plus larges d'environ 2 mm, moins d'un pixel de
  la photo ; les détaillants indiquent d'ailleurs 1 1/4 ou 1 1/2 po de large là
  où Garant publie 1 1/8 po. La fiche et la page du relevé (P02) sont écrites
  par `tools/pince_monseigneur_fiche.mjs` à partir des cotes du modèle.

- **Ruban de cerclage à filaments Uline S-5736, 1 po × 60 verges**
  (`ruban-cerclage-s5736`) : un rouleau de ruban adhésif renforcé de filaments
  de verre, reconstitué d'après la photo de la fiche du produit fournie par le
  client (P01) et les données publiées par Uline, sans plan. Publié : largeur
  de 1 po, longueur de 60 verges, épaisseur de 4,0 mil, résistance à la
  traction de 100 lb, filaments de verre (la fiche complète n'a pas pu être
  consultée : ces données viennent des résultats de recherche qui la citent).
  Calculé : le Ø extérieur de 116,8 mm, soit environ 176 spires — 54,86 m de
  ruban de 0,1016 mm occupent une couronne de 55,7 cm² autour du mandrin.
  Relevé sur la photo : le mandrin de carton kraft (Ø intérieur pris à 3 po,
  paroi d'environ 2,4 mm), son intérieur blanc imprimé de logos bleus (deux
  visibles à 90°, donc quatre par tour), 15 mèches de filaments en travers du
  ruban, l'amorce déroulée d'environ 115 mm qui descend du rouleau et se couche
  sur le sol, dos vers le haut. Le rapport Ø du mandrin / Ø du rouleau mesuré
  sur la photo (0,70) s'accorde avec celui du calcul (0,69), ce qui confirme le
  mandrin de 3 po, non publié. Non trouvé : matière du film et de la colle,
  masse. Le rouleau est debout sur sa tranche, comme sur la photo ; en vue
  éclatée, le mandrin sort par la face avant ; la coupe proposée passe par
  l'axe. La fiche et la page des cotes (P02, vue de face et coupe par l'axe)
  sont écrites par `tools/ruban_cerclage_fiche.mjs` à partir des cotes du
  modèle (`src/models/ruban-cerclage-s5736/index.js`).

- **Chaudières de 5 gallons : savon de lin, dégraisseur et chaudière coupée**
  (`chaudieres-5-gal`) : le poste de nettoyage des outils, reconstitué d'après
  une photo du client (P01) et sa description, sans plan ni mesure. Une
  chaudière de savon de lin, une chaudière de dégraisseur (couvercles à jupe,
  anses de fil d'acier rabattues vers l'avant) et, posée sur la seconde, une
  chaudière coupée sur le dessus (environ 115 mm de haut, coupe irrégulière
  faite à la main) où l'on verse le savon de lin et où l'on met la guenille qui
  sert à nettoyer les outils. Cotes usuelles d'un seau de 5 gallons US (14 1/2 po
  de haut, Ø 303 mm en haut, Ø 262 mm en bas, paroi de 2,3 mm), supposées : ni
  la marque ni le modèle ne se lisent sur la photo. Les étiquettes sont
  redessinées en français, sans marque ; la quantité de savon, la taille et la
  couleur de la guenille sont supposées. Le contenu des deux chaudières pleines
  n'est pas représenté. La fiche est écrite par `tools/chaudieres_fiche.mjs` à
  partir des cotes du modèle (`src/models/chaudieres-5-gal/index.js`).
- **Graisse à filets : bidon de 1 gal US et pinceau** (`graisse-a-filets`) :
  le bidon de graisse des filets de tiges de forage et son pinceau,
  reconstitués d'après deux photos du client (P01), sans plan ni étiquette (la
  marque de la graisse n'est pas lisible). L'échelle vient des deux clés à
  tuyau de 18 et 24 po accrochées sur la photo d'ensemble : 1,37 à 1,59 mm par
  pixel, soit un bidon de Ø 141 à 164 mm. Deux bidons du commerce encadrent la
  mesure, le demi-gallon (Ø 137 mm) et le gallon US (Ø 165 mm) ; le gallon
  (Ø 6 1/2 × 7 1/2 po) est retenu à cause des deux oreilles d'anse, à vérifier
  sur place (`BIDON.d` et `BIDON.h` du modèle, tout le reste suit). Relevé sur
  les photos : l'anneau à gorge, l'agrafe du flanc, les oreilles (anse
  absente), la rouille, le niveau et le monticule de graisse, la pose du
  pinceau, sa bande et son bout blancs. Supposé : la virole et les soies du
  pinceau (2 po), enfouies dans la graisse. Trois pièces (bidon, graisse,
  pinceau) ; coupe proposée par l'axe. La fiche et la page des cotes (P02) sont
  écrites par `tools/graisse_a_filets_fiche.mjs` à partir des cotes du modèle
  (`src/models/graisse-a-filets/index.js`).

- **Trousse de déversement universelle Zenith, baril de 30 gal US**
  (`trousse-deversement-zenith`, Tenaquip SEJ274) : baril de polyéthylène bleu
  à ouverture totale, couvercle, cerceau de fermeture, étiquette et contenu,
  reconstitués d'après la photo du produit (P01) et mis à l'échelle par la
  photo du chantier (P02), fournies par le client, sans plan. Le fabricant ne
  publie pas les cotes du baril : celles d'un baril de 30 gal US à ouverture
  totale du commerce sont prises (29 7/8 po de haut avec le couvercle,
  Ø 18 3/4 po, cerceau de Ø 18 1/8 po). La photo du chantier les confirme :
  hauteur corrigée de la plongée (17°) / Ø = 1,53, contre 1,59 au modèle, et
  Ø d'environ 490 mm par comparaison au seau de 5 gal voisin (un peu plus
  loin), contre 476 mm. Contenu publié pour la trousse d'atelier de 30 gal
  (fiche d'un détaillant, à confirmer sur la trousse) : 4 boudins de
  3 × 48 po, 50 feuilles de 15 × 17 po, 5 sacs, 2 paires de gants, mastic de
  4 oz, couvre-drain (non modélisé : non distingué sur la photo). Supposé :
  épaisseur des parois, levier du cerceau (caché sur les photos), rangement
  dans le baril (boudins en spirale au fond, feuilles pliées en deux). En vue
  éclatée, le contenu se dispose comme sur la photo du produit ; la coupe
  proposée passe par l'axe. La fiche et la page des cotes (P03) sont écrites
  par `tools/trousse_deversement_fiche.mjs` à partir des cotes du modèle
  (`src/models/trousse-deversement-zenith/index.js`).

- **Blocs de bois pour boîte à carottes TIME 92-1500, 2 × 3/4 × 3/4 po**
  (`blocs-de-bois`) : les petits blocs sur lesquels on écrit le métrage et
  qu'on pose dans la boîte à carottes au bout de chaque course, reconstitués
  d'après la page du produit de TIME Limited fournie par le client (P01), sans
  plan. Publié : le numéro 92-1500 et les cotes 2 po × 3/4 po × 3/4 po, vendus
  en vrac au sac ; ni l'essence, ni le nombre par sac, ni la masse. Le sac
  n'est pas modélisé (demande du client). Relevé sur la photo : les sept blocs
  debout à côté du sac (quatre derrière, trois devant, un tourné de 25°), bois
  résineux clair scié. Chaque bloc a sa texture, calculée dans le volume du
  bloc (cernes autour d'un cœur d'arbre hors du bloc), si bien que ses six
  faces montrent le même bois ; largeur des cernes supposée. Masse calculée
  d'environ 8 g (épinette supposée). Blocs vierges, sans inscription. La fiche
  et la page des cotes (P02) sont écrites par `tools/blocs_de_bois_fiche.mjs`
  à partir des cotes du modèle (`src/models/blocs-de-bois/index.js`).

- **Boulon d'ancrage standard TIME 83-52, NW/L 5 pi**
  (`boulon-ancrage-time`) : la pine d'ancrage à laquelle on fixe la foreuse
  au diamant, reconstituée d'après la page du produit de TIME Limited fournie
  par le client (P01), sans plan. Publié : le numéro 83-52 et la désignation
  « ANCHOR BOLT NW/L 5' » ; aucune cote de détail. Supposé : les 5 pi sont la
  longueur hors tout, et le corps a le diamètre d'une tige N câble (69,9 mm).
  Relevé sur la photo (la même pour les quatorze boulons de la page, donc un
  boulon plus petit) : les proportions du nez lisse, du filet mâle de
  18 spires et de la tige du bout en deux étages, mises à l'échelle du corps.
  Modèle plein, d'un seul repère ; masse non calculée. La fiche et la page des
  cotes (P02) sont écrites par `tools/boulon_ancrage_fiche.mjs` à partir des
  cotes du modèle (`src/models/boulon-ancrage-time/index.js`).

- **Rack de boîtes à carottes (core box)** (`rack-core-box`) : plate-forme
  d'acier à deux passages de fourche, bordée de chaque côté par deux arceaux
  de tube bleu séparés (chacun : deux montants, une traverse haute, une
  diagonale ; côtés non continus, précision du client), où l'on empile les
  boîtes à carottes pleines. Reconstitué d'après une photo du client prise
  sous terre (P01), qui ne montre qu'une portion du rack ; aucun plan. Échelle :
  la boîte à carottes de 1,5 m (donnée par le client, minimum). Relevé sur la
  photo à cette échelle : l'encombrement (1,08 × 1,60 × 0,96 m), la hauteur
  et la largeur des arceaux, l'entraxe des passages de fourche, les 3 colonnes de 4 boîtes
  décalées. Supposé : largeur (300 mm) et hauteur (66 mm fermée) de la boîte,
  sections des tubes, tôle, sens de la diagonale des autres arceaux. La fiche et
  la page des cotes (P02) sont écrites par `tools/rack_core_box_fiche.mjs` à
  partir des cotes du modèle (`src/models/rack-core-box/index.js`).

- **Pompe à pistons Bean 420 (FMC L0918 / American AL0918B)**
  (`pompe-bean-420`) : pompe triplex à pistons de 2 1/4 × 2 1/4 po, 20,2 gal
  US/min à 625 tr/min, 700 lb/po², 200 lb, à réducteur de 3,6:1 dans le carter.
  Source : le manuel « Pump AL0918B, Operation And Maintenance Manual »
  d'American Manufacturing (48 pages, publié par Ranger Mining), pompe
  interchangeable avec la FMC Bean L0918 dont elle reprend les numéros de
  pièces sous le préfixe PPFMC ; version à clapets à billes. Ce manuel n'a pas
  de vue éclatée : il donne trois coupes repérées (figures 2A, 2B et 3), une
  liste de 62 repères (tableau 4) et un plan coté (figure 7). La vue éclatée
  de la page P01 vient du catalogue TIME Ltd (FMC L09-420) ; chaque ligne des
  listes donne la correspondance entre les deux numérotations. Treize pages
  sont publiées (les deux PDF ne sont pas dans le dépôt). Trois assemblages
  en 3D, 199 pièces pour 59 repères : la pompe complète (P01), l'extrémité
  mécanique (P02 : bâti, vilebrequin à trois manetons calés à 120° et roue
  dentée, arbre d'entrée à pignon, bielles, crosses, garnitures de tige,
  paliers, couvercle arrière) et l'extrémité hydraulique (P03 : boîte à
  clapets, sièges et billes de 15/16 po, culasses et leurs brides en
  diagonale, chemises en céramique, pistons à coupelle, huit goujons 1/2-13).
  Cotes du manuel reprises telles quelles : 23,219 × 15 × 11,375 po hors tout,
  refoulement à 8,375 po de la base, arbre d'entrée de Ø 1 1/8 po à 8,062 po
  de la base et à 11,875 po de l'axe des clapets, gabarit de fixation,
  diamètres du maneton, de la crosse et de l'axe de pied de bielle. Le reste
  est relevé sur le tracé vectoriel des figures, à l'échelle que donnent ces
  cotes : axe des cylindres à 5,25 po de la base, cylindres au pas de 3 po
  (la cote de 4,250 po de la figure 7 est celle des trous de fixation avant,
  pas celle des cylindres), goujons de culasse sur une grille de 3 × 3 po,
  vilebrequin à 3,56 po derrière l'arbre d'entrée. Calculé ou supposé : la
  denture du réducteur (aucune figure ne la montre ; rayons primitifs tirés
  de l'entraxe relevé de 4,54 po et du rapport de 3,6:1), les flasques du
  vilebrequin et la place de la roue, la répartition des cinq cales, les
  coins des deux goujons sans bride, l'orifice d'aspiration laissé ouvert.
  Sur la figure 2B le vilebrequin est dessiné hors de l'axe de ses paliers :
  le modèle le remet sur cet axe. Les pièces de fonderie sont simplifiées,
  les trous de fixation ne sont pas percés, les accessoires de la figure 6
  ne sont pas modélisés. Bleu roi des photos du manuel. Contrôle chiffré :
  `node scripts/check-pompe-bean-420.mjs` compare 104 mesures au manuel et à
  la fixation sur le tube à l'eau ; la fiche est écrite par
  `tools/pompe_bean_420_fiche.mjs` à partir des cotes du modèle.

La page d'accueil (adresse sans « # », ou le logo en haut à gauche) liste
les équipements et permet de passer de l'un à l'autre. Les adresses du premier équipement restent `#F05` ; celles des autres
sont préfixées : `#du311.P032`, `#du311-std.P050`, `#epiroc-ith.P019`.

## Ce que fait l'application

- **Assemblages en 3D** (F04 à F18) : vue générale, chenille, maillons, moteur
  de translation, châssis, plancher, moteur principal et pompes, réservoir
  hydraulique, pompe à eau, toit, mât, tables, tête de rotation.
- **Vue éclatée à tous les niveaux** : chaque groupe de pièces s'éclate sur
  place (bouton ▸ dans la liste ou double-clic en 3D), puis chacun de ses
  sous-groupes, jusqu'au plus petit ensemble du manuel (ex. vue générale ›
  chenille › maillons F06). « Tout éclater » ouvre tous les niveaux d'un coup.
  Repères numérotés identiques aux bulles du manuel, mode « Isoler ».
- **Vue en coupe** : plan de coupe hachuré (longueur, largeur, hauteur),
  position réglable, sur tout le modèle ou seulement la pièce sélectionnée.
  « Voir en coupe » est proposé pour les pièces qui ont un intérieur : vérins
  (piston et tige), filtres (élément filtrant), réservoir d'air, cloche
  d'accouplement du moteur, et chaque groupe.
- **Sélection croisée** : cliquer une pièce en 3D sélectionne sa ligne dans la
  liste (y compris dans un sous-groupe éclaté), et inversement.
- **Recherche** par numéro de pièce, numéro fournisseur ou description, sur
  tout le manuel (assemblages + schémas).
- **Schémas et listes** (F19 à F28) : hydraulique, pneumatique, télécommande,
  alimentation principale, console IP67, commandes de forage et de mise en
  place.
- **Contrôle des listes** : signale les numéros réutilisés pour des pièces
  différentes, les numéros presque identiques (erreurs de saisie probables),
  les lignes et numéros absents.
- Chaque page du manuel original reste consultable (bouton « Page du manuel »).
- **Dock « Atelier » de la vue 3D** : toutes les fonctions au même endroit,
  dans une colonne de grands boutons au bord gauche de la scène (rangée en bas
  sur téléphone) : Systèmes, Données, Entretien, Consignes, Circuits,
  Procédures, Schémas, Page du manuel. Un bouton n'apparaît que si la vue
  s'y prête. **Systèmes** colore la machine par système fonctionnel (moteur,
  hydraulique, électricité, air, avance, carrousel…) ; un clic sur un
  système le montre seul et liste ses ensembles.
- **Données d'atelier du DU311, du DU311-TVK, du Cubex et du catalogue Epiroc**,
  tirées seulement de leur manuel (OCR des planches, puis relecture sur la
  planche) : données techniques avec leur page (capacités, moteurs, pompes,
  pressions, vérins, couples et réglages imprimés sur les dessins, pièces
  d'entretien), points d'entretien en 3D (graisseurs, éléments filtrants,
  reniflards, repères de remplissage), « Voir sur le dessin » pour les pièces,
  consignes des dessins traduites avec leur extrait de planche (page
  « Consignes » et outil de la vue 3D), bulles cliquables sur les planches,
  schémas en couleur par circuit (bulles et liste des schémas hydrauliques et
  pneumatiques, étiquettes des schémas électriques, titre relu de chaque
  planche, renvois d'échelons cliquables). Les manuels de pièces ne
  contiennent ni procédures pas à pas, ni intervalles d'entretien, ni codes de
  diagnostic : le site le dit.

Site en ligne : https://frankyray21.github.io/pieces-3d/ (republié
automatiquement à chaque push sur la branche `main`, voir
`.github/workflows/pages.yml`). DU311-TVK : https://frankyray21.github.io/pieces-3d/#du311.P010 ;
DU311 : https://frankyray21.github.io/pieces-3d/#du311-std.P010 ; prise en main :
https://frankyray21.github.io/pieces-3d/#du311-std.prise-en-main ; manuel de
l'utilisateur : https://frankyray21.github.io/pieces-3d/#du311-std.utilisation

## Démarrer

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # site statique dans dist/
npm run build:artifact # page autonome dans dist-artifact/ (publication claude.ai)
npm run check:3d       # contrôle des modèles Epiroc (repères, quantités, triangles)
```

## Rendus réalistes (Blender)

Un assemblage s'exporte en glTF binaire, puis Blender (module Python `bpy`,
sans interface) le rend en Cycles : sol de béton, réflecteurs doux,
contre-jour, ombres et occlusion par lancer de rayons, débruitage.

```bash
node scripts/export-glb.mjs --eq stm-1500 P002 /tmp/P002.glb
python3 -m venv venv && ./venv/bin/pip install bpy==5.2.2
./venv/bin/python tools/blender_render.py /tmp/P002.glb rendu.png --res 1600x1000 --samples 96 --dir 0.85,0.55,1
```

`--dir` est la direction de vue dans le repère du site (comme `view.dir` des
builders). Le .glb garde les matériaux PBR de la palette et le repère de
chaque pièce dans son nom (`ref-12`), utilisable aussi dans Blender pour
retoucher ou animer.

Captures de non-régression (Playwright installé à part, serveur lancé) :
`PW=$(npm root -g)/playwright node scripts/shots.mjs --eq epiroc-ith --out
scratch/shots/ref P074 P080`, puis la même commande avec `--out
scratch/shots/new --ref scratch/shots/ref` après une modification : chaque
vue (assemblée, éclatée, coupe) est comparée à sa référence.

## Structure

```
public/equipment/index.json                 catalogue des équipements
public/equipment/<id>/data.json             listes de pièces, hiérarchie, notes
public/equipment/<id>/pages/               pages du manuel (Fxx.jpg, Pxxx.webp)
src/viewer/                                 moteur 3D (Three.js)
  Viewer.js      scène, caméra, éclaté, sélection, repères
  assembly.js    construction d'un modèle (procédural ou glTF/GLB)
  shapes.js      formes paramétriques (vérins, vannes, filtres, pignons…)
src/models/<id>/                            un « builder » 3D par feuille du manuel
src/data/equipment.js                       chargement + contrôle qualité
src/main.js, src/ui/                        interface
tools/extract_parts.py                      extraction des listes depuis le PDF
tools/extract_sandvik.py                    extraction complète d'un manuel Sandvik
tools/extract_epiroc.py                     extraction du catalogue Epiroc (tableaux, pages)
tools/extract_stm1500*.py                   listes du manuel STM-1500 (brouillon, nettoyage, liens)
tools/blender_render.py                     rendu Cycles d'un .glb (scripts/export-glb.mjs)
scripts/export-anim.mjs                     foreuse STM-1500 animée en .glb (squelette et séquences, voir docs/animation-stm-1500.md)
scripts/export-porte.mjs                    porte 1801020 en maillages statiques à pivot pour Unreal (voir docs/porte-unreal.md)
scripts/export-cles-unreal.mjs              clés à tuyau et support à pipewrench en .glb pour Unreal (voir docs/cles-unreal.md)
scripts/check-cles-mixtes.mjs               contrôle chiffré des clés mixtes (cotes publiées par grandeur)
scripts/check-pompe-bean-420.mjs            contrôle chiffré de la pompe Bean 420 (cotes du manuel, fixation sur le tube à l'eau)
tools/pompe_bean_420_fiche.mjs              fiche de la pompe Bean 420 (listes, notes) → public/equipment/pompe-bean-420/data.json
tools/cle_mixte_polyhaven_mesh.mjs          clé mixte de Poly Haven (glTF) → src/models/cles-mixtes/mesh.js
tools/blender_fbx.py                        conversion du .glb animé en FBX pour Unreal Engine
tools/blender_porte_fbx.py                  conversion des maillages de la porte 1801020 en FBX
tools/ocr_pages.py, tools/ocr_bulles.py     OCR des planches (texte, bulles de repère)
tools/atelier_review.py                     planches de relecture des textes lus
tools/build_atelier.py                      bulles, donnees, entretien, consignes, schemas et systemes (.json)
tools/atelier/ocr/<id>.jsonl.gz             résultats de l'OCR
tools/atelier/<id>.json                     relecture : texte exact, traduction, couples, valeurs
```

## Simulation mécanique (développement, hors site)

Le DU311 (s/n 10703) a une première simulation mécanique, articulée sur le même
modèle 3D que le site : braquage du porteur articulé et translation (roues et
enrouleur de câble qui tournent), stabilisateurs avant et arrière,
basculement du cadre de la glissière (jusqu'à la position de translation, mât
couché sur le pont avant), translation latérale, rotation de l'avance,
extension sur le MCP, course et rotation de la tête, stinger, plaque à coins,
indexage du carrousel et bras de serrage, surpresseur. Les vérins suivent
leurs deux axes ; les flexibles se redessinent ; des verrouillages bloquent les
mouvements dangereux (translation stabilisateurs sortis, descente de la tête
avec les bras sur l'axe, indexage bras engagés…) et le contact au sol arrête
stinger et avance.

Le **cycle de forage** enchaîne les mouvements de l'avance, du carrousel et des
bras de serrage avec 17 tiges Ø 3½ po × 6 pi et un marteau fond-de-trou :
enfoncer le marteau (vissage dans le centreur, descente au sol, forage jusqu'à
la plaque à coins), forer N tiges (indexage, prise au carrousel, présentation
sur l'axe, vissage à la tête puis sur le train, forage, reprise par la plaque à
coins), remonter le train (chaque tige dévissée retourne dans une alvéole vide,
puis le marteau dans le centreur). Le trou se creuse dans le sol (vertical ou
incliné selon l'avance) ; profondeur, temps simulé et étapes s'affichent ;
accélération ×1 à ×60. Pendant le cycle, les commandes manuelles sont
verrouillées.

Le **circuit hydraulique** donne les vitesses et les pressions. D'après le
manuel de pièces : groupe électrique 60 HP avec pompes 100 cm³ et 74 cm³
(P334), moteur diesel avec pompes 90 cm³ et 32 cm³ (P246), distributeurs
Danfoss PVG 32 de forage, d'avance, de mise en place et du carrousel (débit de
chaque tiroir : 130, 100, 40, 25, 10 ou 5 L/min), vérins dont le manuel donne
l'alésage (avance Ø 3 1/8 po, extension Ø 4 po, translation latérale Ø 3,25
po, stinger Ø 3,5 po, bras Ø 3 po, direction Ø 3 po). Chaque commande ouvre le
tiroir de sa section ; vitesse = débit ÷ section du vérin (ou cylindrée du
moteur) ; pression = charge ÷ section, la charge venant du poids des corps
(travail virtuel sur la géométrie), des tiges portées, de la poussée sur
l'outil et du couple de rotation ; les pompes à détection de charge partagent
leur débit et la puissance du moteur électrique. Un actionneur dont la charge
dépasse la pression maximale cale (stinger en appui au sol). Le panneau montre
les groupes de pompage (marche/arrêt), six manomètres gradués en psi comme au
pupitre et chaque section de distributeur (ouverture, débit, pression).
Estimations signalées : affectation des sections, masses, rapports de
réduction, quelques tiges de vérins ; vitesses de forage (pénétration
0,6 m/min, poussée 8 kN) : ordres de grandeur, pas des valeurs du
constructeur.

```bash
npm run dev                    # puis http://localhost:5173/sim.html
node scripts/check-sim.mjs     # vérins, débattements, contact au sol, hydraulique, cycle de forage
```

La page `sim.html` n'est servie que par le serveur de développement : `npm run
build` ne compile que `index.html`, la simulation n'est donc pas publiée sur le
site. Fichiers : `src/sim/kinematics.js` (corps, liaisons, vérins, flexibles),
`src/sim/du311-std.js` (axes, débattements, vitesses, verrouillages, positions),
`src/sim/drilling.js` (tiges, marteau, étapes du cycle, trou),
`src/sim/hydraulics.js` (pompes, distributeurs, actionneurs, charges),
`src/sim/plant.js` (liaison du circuit au rig et aux commandes), `src/sim/main.js`
(page). Les pièces mobiles sont étiquetées dans les builders
du DU311 (`body()`, `ram()`, `flex()` de `src/models/du311-std/layout.js`), sans
effet sur le rendu du site.

## Ajouter un équipement

1. Rendre les pages du PDF en images :
   `pdftoppm -scale-to 2200 -jpeg -jpegopt quality=72 manuel.pdf pages/p`
   puis renommer en `F01.jpg`, `F02.jpg`, …
2. Extraire un brouillon des listes :
   `python3 tools/extract_parts.py manuel.pdf > brouillon.json`
   et le relire (les tableaux insérés comme images se transcrivent à la main).
3. Écrire `public/equipment/<id>/data.json` (format : voir le Cubex) et ajouter
   l'équipement dans `public/equipment/index.json`.
   Pour un manuel Sandvik (« Parts Manual »), `tools/extract_sandvik.py
   manuel.pdf <id>` produit directement `data.json` (table des matières,
   listes, liens entre assemblages, schémas) ; la fiche de l'équipement (nom,
   n° de série, caractéristiques) est un profil `<id>` de `PROFILES` dans le
   script. Pages rendues en WebP gris pour alléger le site :
   `pdftoppm -scale-to 2200 -gray -png` puis conversion WebP qualité 70.
   Un PDF de plus de 25 Mo se dépose dans une release GitHub plutôt que dans
   le dépôt.
4. Modéliser chaque assemblage dans `src/models/<id>/` avec `api.part(réf,
   objet, [dx, dy, dz])`, ou fournir un fichier `.glb` exporté de la CAO dont
   les nœuds sont nommés `ref-<numéro>` (l'éclaté est alors calculé
   automatiquement). Un assemblage sans modèle s'affiche avec ses dessins du
   manuel. Une variante d'une machine déjà modélisée reprend les modèles des
   assemblages identiques avec `reuse()` (`src/models/reuse.js`).

5. Données d'atelier tirées des planches (facultatif) :
   `python3 tools/ocr_pages.py public/equipment/<id>/pages sortie.jsonl P001 P002 …`
   (OCR, environ 6 s par planche ; `pip install rapidocr-onnxruntime`),
   résultat compressé dans `tools/atelier/ocr/<id>.jsonl.gz` ; puis
   `python3 tools/atelier_review.py <id> relecture/ tools/atelier/ocr/<id>.jsonl.gz`
   découpe chaque consigne, réglage et titre de schéma lu, pour la relecture
   à l'œil qui donne `tools/atelier/<id>.json` (format en tête du script) ;
   enfin `python3 tools/build_atelier.py <id> tools/atelier/ocr/<id>.jsonl.gz`
   écrit `bulles`, `donnees`, `entretien`, `consignes`, `schemas` et `systemes` (.json)
   dans `public/equipment/<id>/` et affiche les noms à déclarer dans le champ
   `extras` de l'index. Seuls les textes relus sont publiés.

Un catalogue d'outils (Epiroc) suit le même schéma : `tools/extract_epiroc.py
catalogue.pdf > data.json` lit les tableaux (cases fusionnées recopiées,
colonnes de tailles), la description de chaque page étant dans `PAGES` ;
`--pages dossier` rend les pages en WebP. Champs propres aux catalogues :
`sizes` (numéro par taille, affiché regroupé), `pnText` (« Voir p. 54 »,
« Sur demande »), `group` (ensemble de pièces 3D, ex. tube intérieur
complet), `no3d` (clé, option non dessinée) ; les repères répétés d'une liste
et les plages (« 1-5 », « B,2-14 ») sont résolus automatiquement. Les
modèles (`src/models/epiroc-ith/`) sont des constructeurs paramétrés par
famille (têtes, overshots, carottiers…) avec une table rôle → repère par
page.

## Limites actuelles

- Catalogue Epiroc : les tubes et les tiges des carottiers sont raccourcis
  (0,45 m et 0,3 m) et coupés par un trait crénelé, comme les vues rompues
  du catalogue. Le contrôle des
  listes relève des anomalies du catalogue, par exemple le numéro 3760012099
  (bille de 22 mm) donné à la soupape d'arrêt BTWU (p. 66), 9469705243 pour
  l'axe et le ressort de la tête H Excore (p. 39), 3760017262 pour l'outil de
  libération et un cliquet (p. 71), 3760017570 (trousse de conversion) pour
  l'adaptateur de taille P (p. 30), et des numéros mal imprimés (9460705061,
  946705120, 3460017234, « 376 011016 »).

- Les modèles 3D sont des **reconstitutions paramétriques** fidèles à la
  disposition et aux proportions des dessins, pas les fichiers CAO du
  fabricant. Les numéros de pièces, eux, viennent du manuel.
- Anomalies relevées dans le manuel Cubex (signalées dans l'application) :
  bulles 6 et 7 inversées sur F04, ligne 25 absente sur F08, ligne 19 absente
  sur F10, bulles de F17 qui ne correspondent pas à la liste, et plusieurs
  numéros réutilisés pour des pièces différentes (ex. 2737038, 5000088,
  5000258, 0301311).
