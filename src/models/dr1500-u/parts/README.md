# Assemblages 3D de la DR1500-U — un fichier par assemblage

- Répartition des lots, règles communes et réutilisation du STM-1500 : en tête de `../index.js`.
- Repère foreuse, repères locaux et cotes d'interface (avec leur source : manuel, norme, STM-1500, mesure,
  estimé) : `../layout.js`. On lit les cotes dans ce fichier, on ne les recopie pas.
- `Pxxx.js` (export par défaut `function Pxxx(api, opts)`) : identifiant de l'assemblage dans
  `public/equipment/dr1500-u/data.json` ; `node scripts/parts-index.mjs dr1500-u` régénère `index.js`.
- `ensemble-pieces.js` : pièces de l'ensemble P002 sans page (lot A), importées par la vue d'ensemble.
- Pages du manuel : `public/equipment/dr1500-u/pages/P001.webp` à `P025.webp` (en couleur : 1, 11, 12, 13,
  16, 18, 21 et 25).

Contrôle : `node scripts/check-models.mjs --eq dr1500-u --qty P012` (un brouillon non inscrit est chargé).
