# Assemblages 3D de la DR1500-U — un fichier par assemblage

- Liste des assemblages, règles communes et couleurs : en tête de `../index.js`.
- Repère foreuse, repères locaux et cotes d'interface (avec leur source : manuel, norme, STM-1500, mesure,
  estimé, et les valeurs changées à l'intégration) : `../layout.js`. On lit les cotes dans ce fichier, on ne les
  recopie pas.
- `Pxxx.js` (export par défaut `function Pxxx(api, opts)`) : identifiant de l'assemblage dans
  `public/equipment/dr1500-u/data.json` ; `node scripts/parts-index.mjs dr1500-u` régénère `index.js`.
- `P001.js` (racine) et `P002.js` (foreuse) posent les sous-assemblages à facettes allégées (`quality` de
  `api.sub`) ; chacun, ouvert seul, reste détaillé.
- `ensemble-pieces.js` : pièces de l'ensemble P002 sans page (frame skud, bloc I/O, pattes, plaque d'ancrage,
  vérins de tilt, pins) et leurs éclatés.
- Assistants : `_structure.js` (P003 à P006, P025, ensemble), `_tete.js` (P011, P012), `_boyles.js` (P018 à
  P024), `_treuil.js` (P014, P016), `_groupes.js` (P007 à P010).
- Pages du manuel : `public/equipment/dr1500-u/pages/P001.webp` à `P025.webp` (en couleur : 1, 11, 12, 13,
  16, 18, 21 et 25).

Contrôle : `node scripts/check-models.mjs --eq dr1500-u --qty --max-tris 150000`.
