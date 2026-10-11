# Assemblages 3D du DU311-TVK — un fichier par assemblage

Chaque assemblage du manuel (`public/equipment/du311/data.json`, clé `assemblies`)
a son builder dans `parts/Pxxx.js` (numéro de la première page de l'assemblage),
en export par défaut :

```js
// P044 — Plaque à coins CX031068 rév. 1 (page 44) : …description…
// Repère : origine au centre de la face d'appui inférieure, Y vers le haut,
// +Z vers l'avant de l'avance ; encombrement 0.42 × 0.05 × 0.36 m.
export default function P044(api) {
  const { box, cyl, bolt, at, group } = api.S;
  api.part('1', /* objet */, [0, 0.3, 0]); // repère, objet, déplacement en vue éclatée (m)
  return { view: { dir: [1, 0.6, 1.1] } };    // direction de vue par défaut
}
```

`node scripts/parts-index.mjs du311` inscrit les fichiers dans `parts/index.js`
(généré, ne pas modifier à la main) ; un fichier de `parts/` remplace l'ancien
builder du même numéro (`machine.js`, `frame.js`, `feed.js`, `mast.js`,
`topdrive.js`).

## Règles

- **Chaque ligne de la liste a son objet 3D**, avec son repère (`api.part(ref, …)`),
  et **autant d'objets que la quantité** (8 vis = 8 objets du même repère). Seules
  les trousses (« KIT ») et les lignes qui renvoient à un schéma peuvent rester
  sans objet. Contrôle : `node scripts/check-models.mjs --eq du311 --qty P044`.
- **Sous-assemblage = `api.sub('Pyyy')`** quand la ligne renvoie à un autre
  assemblage (champ `link`) : on ne redessine jamais une pièce qui a son propre
  builder ; on la place (`at(api.sub('P208'), [x, y, z], [rx, ry, rz])`) d'après
  le repère décrit en tête de son fichier.
- **Cotes réelles, en mètres** (Y vers le haut) : descriptions de la liste
  (« HHCS,0.750UNC-2.250 » = vis H 3/4 po × 2 1/4 po ; « Ø3.00 X 54" » = alésage
  3 po, course 54 po ; 1 po = 0,0254 m), dessins du manuel
  (`public/equipment/du311/pages/Pxxx.webp`), modèles voisins déjà faits. Ce qui
  n'est pas coté s'estime d'après les proportions du dessin.
- **Repère en tête de fichier** : origine (face d'appui, axe de pivot, centre de
  bride…), orientation des axes, encombrement. Les trousses posées sur un
  ensemble (boyaux, graissage, étiquettes, câblage) se modélisent **dans le
  repère de l'ensemble qui les reçoit** (indiqué en tête : « dans le repère de
  P032 »), en reprenant ses cotes exportées (`MAST`, `TOPDRIVE`, `DECK`, …).
- **Réalisme sans ombrage** : la visionneuse n'a aucune ombre portée ; le relief
  vient de la géométrie (chanfreins, congés, filetages, soudures, têtes de vis,
  six pans) et des matériaux de `src/viewer/materials.js` (peintures vernies
  `red`, `grey`, `lightGrey`, `black`, `yellow`, `safety`, `blue` ; métaux
  `steel`, `chrome`, `darkSteel`, `zinc`, `brass`, `copper` ; fontes `castIron`,
  `castAlu`, `blackCast` ; `rubber`, `hose`, `plastic`, `glass`). Jamais de
  couleur assombrie pour simuler une ombre.
- **Bibliothèque de formes** : `src/viewer/shapes.js` (`box`, `cyl`, `shell`,
  `lathe`, `extrude`, `plate`, `bolt`, `boltCircle`, `boltSet`, `nut`, `washer`,
  `stud`, `thread`, `hose`, `cable`, `tube`, `fitting`, `ballValve`, `gauge`,
  `filterCanister`, `valveBank`, `enclosure`, `hydCylinder`, `spring`, `bearing`,
  `weld`, `nameplate`, `merged`, `repeat`…). Lire les signatures avant d'écrire.
- **Légèreté** : pièces d'un même matériau fusionnées (`merged`), segments
  adaptés à la taille (petite vis : 10 à 12 segments), en général moins de
  60 000 triangles par assemblage simple et 150 000 pour un gros ensemble
  (`--max-tris`).
- **Vue éclatée lisible** : déplacements dans l'axe de montage, proportionnés à
  la pièce ; les petites pièces (vis, rondelles) sortent dans l'axe de leur trou.
- Commentaires en français, style des fichiers existants (`../mast.js`).
