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
  Tubes de base creux, bouts ouverts pour les fourches. Premier contenu de la
  liste de matériel du coffre 629 (calibre N) dans le coffre ouvert : deux têtes
  NU Excore, l'overshot Excore II, core lifters, core lifter cases, stop rings
  et landing ring, repris des modèles Epiroc (`reuse`).
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

- **Tube à l'eau 1524010812 et flotte 152042600** (`tube-eau`, Machines Roger
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
  en tôle de calibre 16). La pompe à eau reste à modéliser (plan à venir).

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
    percussion sans fil, tournevis), `reperes.js` (cotes, arcs, zones, niveau
    numérique), `travailleur.js` (silhouette articulée : les mains et les
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
