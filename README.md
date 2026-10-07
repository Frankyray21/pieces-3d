# Pièces 3D

Plateforme qui transforme les manuels de pièces (PDF) en modèles 3D
interactifs avec vue éclatée, pour visualiser l'équipement et identifier les
pièces (numéro, quantité, page du manuel).

Équipements :

- **Cubex / MRI 5200** (foreuse sur chenilles, manuel P15125-MRI rév. 03,
  28 pages) : assemblages en 3D.
- **Sandvik DU311-TVK** n° de série 10680 (manuel de pièces du 2020-07-02,
  510 pages) : 172 assemblages et 15 schémas. En 3D : le châssis complet
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

Le catalogue (logo en haut à gauche) permet de passer d'un équipement à
l'autre. Les adresses du premier équipement restent `#F05` ; celles des autres
sont préfixées : `#du311.P032`.

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
`.github/workflows/pages.yml`). DU311 : https://frankyray21.github.io/pieces-3d/#du311.P010

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

## Ajouter un équipement

1. Rendre les pages du PDF en images :
   `pdftoppm -scale-to 2200 -jpeg -jpegopt quality=72 manuel.pdf pages/p`
   puis renommer en `F01.jpg`, `F02.jpg`, …
2. Extraire un brouillon des listes :
   `python3 tools/extract_parts.py manuel.pdf > brouillon.json`
   et le relire (les tableaux insérés comme images se transcrivent à la main).
3. Écrire `public/equipment/<id>/data.json` (format : voir le Cubex) et ajouter
   l'équipement dans `public/equipment/index.json`.
   Pour un manuel Sandvik (« Parts Manual »), `tools/extract_sandvik.py`
   produit directement `data.json` (table des matières, listes, liens entre
   assemblages, schémas) ; pages rendues en WebP gris pour alléger le site :
   `pdftoppm -scale-to 2200 -gray -png` puis conversion WebP qualité 70.
   Un PDF de plus de 25 Mo se dépose dans une release GitHub plutôt que dans
   le dépôt.
4. Modéliser chaque assemblage dans `src/models/<id>/` avec `api.part(réf,
   objet, [dx, dy, dz])`, ou fournir un fichier `.glb` exporté de la CAO dont
   les nœuds sont nommés `ref-<numéro>` (l'éclaté est alors calculé
   automatiquement). Un assemblage sans modèle s'affiche avec ses dessins du
   manuel.

## Limites actuelles

- Les modèles 3D sont des **reconstitutions paramétriques** fidèles à la
  disposition et aux proportions des dessins, pas les fichiers CAO du
  fabricant. Les numéros de pièces, eux, viennent du manuel.
- Anomalies relevées dans le manuel Cubex (signalées dans l'application) :
  bulles 6 et 7 inversées sur F04, ligne 25 absente sur F08, ligne 19 absente
  sur F10, bulles de F17 qui ne correspondent pas à la liste, et plusieurs
  numéros réutilisés pour des pièces différentes (ex. 2737038, 5000088,
  5000258, 0301311).
