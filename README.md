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
  serrage, boyaux), l'extinction d'incendie (P012) et la finition (P020), en
  formes simplifiées aux dimensions estimées sur les vues du manuel (repère
  commun dans `src/models/du311-std/layout.js`). La tête de rotation RH6230
  ME12-SS #24 (P050, même construction que celle du TVK avec moteurs ME12),
  son émerillon d'air (P052) et sa boîte d'engrenages (P054) sont repris du
  TVK (même numéro, même liste ; voir `src/models/reuse.js`). Le PDF
  d'origine (101 Mo) est dans la release GitHub `manuel-du311-std`.

La page d'accueil (adresse sans « # », ou le logo en haut à gauche) liste
les équipements et permet de passer de l'un à l'autre. Les adresses du premier équipement restent `#F05` ; celles des autres
sont préfixées : `#du311.P032`, `#du311-std.P050`.

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
```

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
verrouillées. Vitesses : ordres de grandeur (pénétration 0,6 m/min), pas des
valeurs du constructeur.

```bash
npm run dev                    # puis http://localhost:5173/sim.html
node scripts/check-sim.mjs     # courses des vérins, débattements, contact au sol, cycle de forage
```

La page `sim.html` n'est servie que par le serveur de développement : `npm run
build` ne compile que `index.html`, la simulation n'est donc pas publiée sur le
site. Fichiers : `src/sim/kinematics.js` (corps, liaisons, vérins, flexibles),
`src/sim/du311-std.js` (axes, débattements, vitesses, verrouillages, positions),
`src/sim/drilling.js` (tiges, marteau, étapes du cycle, trou), `src/sim/main.js`
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

## Limites actuelles

- Les modèles 3D sont des **reconstitutions paramétriques** fidèles à la
  disposition et aux proportions des dessins, pas les fichiers CAO du
  fabricant. Les numéros de pièces, eux, viennent du manuel.
- Anomalies relevées dans le manuel Cubex (signalées dans l'application) :
  bulles 6 et 7 inversées sur F04, ligne 25 absente sur F08, ligne 19 absente
  sur F10, bulles de F17 qui ne correspondent pas à la liste, et plusieurs
  numéros réutilisés pour des pièces différentes (ex. 2737038, 5000088,
  5000258, 0301311).
