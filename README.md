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
- **Documentation d'atelier**, tirée seulement du manuel : navigation par
  système (pictogramme et couleur par système, fil d'Ariane équipement ›
  système › composant), données techniques (capacités, moteurs, pompes,
  pressions, vérins, couples et réglages imprimés sur les dessins), plan
  d'entretien (graisseurs, filtres, liquides, trousses, outillage), consignes
  des dessins traduites avec leur extrait de planche, schémas en couleur par
  circuit (bulles des schémas hydrauliques et pneumatiques, étiquettes des
  schémas électriques, renvois d'échelons cliquables), bulles cliquables sur
  toutes les planches (fiche de la pièce) et recherche globale (pièces,
  systèmes, pages, données, consignes ; mots français traduits). Ce que le
  manuel de pièces ne contient pas (procédures pas à pas, intervalles, codes
  de diagnostic) est dit tel quel.

Site en ligne : https://frankyray21.github.io/pieces-3d/ (republié
automatiquement à chaque push sur la branche `main`, voir
`.github/workflows/pages.yml`). DU311-TVK : https://frankyray21.github.io/pieces-3d/#du311.P010 ;
DU311 : https://frankyray21.github.io/pieces-3d/#du311-std.P010

## Démarrer

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # site statique dans dist/
npm run build:artifact # page autonome dans dist-artifact/ (publication claude.ai)
npm run check:3d       # contrôle des modèles Epiroc (repères, quantités, triangles)
```

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
public/equipment/<id>/atelier.json          documentation d'atelier (produite, voir plus bas)
src/ui/atelier.js, src/ui/icons.js          vues d'atelier, pictogrammes des systèmes
tools/ocr_pages.py, tools/bulles.py         OCR des planches (texte, bulles de repère)
tools/atelier_review.py                     planches de relecture des textes lus
tools/build_atelier.py                      production de atelier.json
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

5. Documentation d'atelier (facultative) :
   `python3 tools/ocr_pages.py public/equipment/<id>/pages sortie.jsonl P001 P002 …`
   (OCR, ~6 s par planche ; `pip install rapidocr-onnxruntime`), résultat
   compressé dans `tools/atelier/ocr/<id>.jsonl.gz` ; puis
   `python3 tools/atelier_review.py <id> relecture/ tools/atelier/ocr/<id>.jsonl.gz`
   découpe chaque consigne, réglage et titre de schéma lu, pour la relecture
   à l'œil qui donne `tools/atelier/<id>.json` (format en tête du script) ;
   enfin `python3 tools/build_atelier.py <id> tools/atelier/ocr/<id>.jsonl.gz
   > public/equipment/<id>/atelier.json`. Le rangement par système se règle
   dans `STRONG` / `OVERRIDES` du script. Seuls les textes relus sont publiés
   comme consignes traduites, couples et réglages.

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

- Documentation d'atelier : les schémas hydrauliques sont des planches
  numérisées tournées dont le texte est trop fin pour l'OCR ; la couleur des
  circuits y passe par les bulles lues (une partie seulement) et par la liste
  des composants, pas par le tracé des conduites. Les bulles des planches
  sont lues automatiquement et validées par la liste : quelques-unes manquent.
  Les intervalles d'entretien, procédures et codes de diagnostic ne figurent
  pas dans les manuels de pièces.
- Les modèles 3D sont des **reconstitutions paramétriques** fidèles à la
  disposition et aux proportions des dessins, pas les fichiers CAO du
  fabricant. Les numéros de pièces, eux, viennent du manuel.
- Anomalies relevées dans le manuel Cubex (signalées dans l'application) :
  bulles 6 et 7 inversées sur F04, ligne 25 absente sur F08, ligne 19 absente
  sur F10, bulles de F17 qui ne correspondent pas à la liste, et plusieurs
  numéros réutilisés pour des pièces différentes (ex. 2737038, 5000088,
  5000258, 0301311).
