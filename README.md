# Pièces 3D

Plateforme qui transforme les manuels de pièces (PDF) en modèles 3D
interactifs avec vue éclatée, pour visualiser l'équipement et identifier les
pièces (numéro, quantité, page du manuel).

Premier équipement : **Cubex / MRI 5200** (foreuse sur chenilles, manuel
P15125-MRI rév. 03, 28 pages).

## Ce que fait l'application

- **Assemblages en 3D** (F04 à F18) : vue générale, chenille, maillons, moteur
  de translation, châssis, plancher, moteur principal et pompes, réservoir
  hydraulique, pompe à eau, toit, mât, tables, tête de rotation.
- **Vue éclatée animée** (curseur ou boutons), repères numérotés identiques aux
  bulles du manuel, mode « Isoler » pour estomper les autres pièces.
- **Sélection croisée** : cliquer une pièce en 3D sélectionne sa ligne dans la
  liste, et inversement. Double-clic pour descendre dans un sous-assemblage.
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
automatiquement à chaque push sur la branche par défaut, voir
`.github/workflows/pages.yml`).

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
public/equipment/<id>/pages/Fxx.jpg         pages du manuel
src/viewer/                                 moteur 3D (Three.js)
  Viewer.js      scène, caméra, éclaté, sélection, repères
  assembly.js    construction d'un modèle (procédural ou glTF/GLB)
  shapes.js      formes paramétriques (vérins, vannes, filtres, pignons…)
src/models/<id>/                            un « builder » 3D par feuille du manuel
src/data/equipment.js                       chargement + contrôle qualité
src/main.js, src/ui/                        interface
tools/extract_parts.py                      extraction des listes depuis le PDF
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
4. Modéliser chaque assemblage dans `src/models/<id>/` avec `api.part(réf,
   objet, [dx, dy, dz])`, ou fournir un fichier `.glb` exporté de la CAO dont
   les nœuds sont nommés `ref-<numéro>` (l'éclaté est alors calculé
   automatiquement).

## Limites actuelles

- Les modèles 3D sont des **reconstitutions paramétriques** fidèles à la
  disposition et aux proportions des dessins, pas les fichiers CAO du
  fabricant. Les numéros de pièces, eux, viennent du manuel.
- Anomalies relevées dans le manuel Cubex (signalées dans l'application) :
  bulles 6 et 7 inversées sur F04, ligne 25 absente sur F08, ligne 19 absente
  sur F10, bulles de F17 qui ne correspondent pas à la liste, et plusieurs
  numéros réutilisés pour des pièces différentes (ex. 2737038, 5000088,
  5000258, 0301311).
