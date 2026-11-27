# Modèle 3D web : compresseur simple R-55 (MRI)

Modèle 3D interactif (Three.js) du compresseur simple R-55, bâti à partir des plans PDF du dossier
`G:\DOCUMENTATION TECHNIQUE\35 COMPRESSEUR SIMPLE R-55`.

## Ouvrir le modèle

En ligne : https://frankyray21.github.io/pieces-3d/compresseur-r55/

La page publiée est `public/compresseur-r55/index.html` (un seul fichier autonome).

## Contenu de ce dossier (tools/compresseur-r55)

- `src/main.js` : le code du modèle (géométrie, pièces, interface).
- `src/template.html` : la page (mise en page, boutons, styles).
- `build.mjs` et `package.json` : pour régénérer `index.html` après une modification.

## Régénérer après une modification

Il faut Node.js. Dans ce dossier :

    npm install
    node build.mjs

Le nouveau fichier sort dans `dist/index.html` : le copier dans `public/compresseur-r55/index.html`.

## Sources et fidélité

Pièces d'après les plans (cotes reprises des PDF) :

| Pièce | N° | Plan |
|---|---|---|
| Frame R-55 | 351233100 | FRAME/351233100.pdf |
| Structure | 35283110 | FRAME/35283110.pdf |
| Poutres | 35283130, 35283131 | FRAME/35283130.pdf |
| Plaques de toit | 35283132 | FRAME/35283132.pdf |
| Anneaux de levage | 0106037 | FRAME/35283110.pdf |
| Jacks assemblés | 35060501 | PLATE JACK/35060501.pdf |
| Boîte à cadrans | 3110010 | BOITE CADRAN/3110010.pdf |
| Support compresseur | 352100300 | FRAME/SUPPORT COMPRESSEUR PROT/352100300.pdf |

Formes simplifiées (aucun plan dans le dossier R-55, position prise sur la vue générale 35290000) :
bloc compresseur, moteur électrique, garde-courroie, réservoir d'air, boîte électrique 1418N4SSM8,
admission d'air (détail A). Le diamètre des roues (essieu 3110110-ASS) est estimé ; le timon vient
de la vue iso Forcetech P015125.

Unités du code : pouces. X = longueur, Y = hauteur (0 = dessus du frame), Z = largeur.

## Pistes pour la suite

- Remplacer le garde-courroie, le support et la pompe par les plans de `65 COMPRESSEUR`.
- Ajouter le plan de la roue 3115010 pour corriger le diamètre des roues.

