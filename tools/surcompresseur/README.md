# Modèle 3D web : surcompresseur (booster) des Cubex — première version

Modèle 3D interactif (Three.js) du surcompresseur utilisé au forage ITH Cubex, avec export GLB
en mètres pour la scène Unreal du simulateur SST.

## Ouvrir le modèle

En ligne : https://frankyray21.github.io/pieces-3d/surcompresseur/

- Page : `public/surcompresseur/index.html` (un seul fichier autonome).
- GLB pour Unreal : `public/surcompresseur/SM_Surcompresseur.glb`
  (aussi le bouton « GLB pour Unreal » de la page). Unités : mètres, Y en haut, origine au sol
  au centre du patin. Bout -X = entrée d'air (réseau de la mine), bout +X = sortie vers la foreuse.

## Sources et fidélité

Aucun plan ni photo pour l'instant. Le contenu vient de la procédure PRO-OP-ITH-004 :
refroidisseur d'eau, filtre à air, receiver et raccords de 2 po ; le surcompresseur se place à
7 m de la foreuse. Toutes les formes et cotes sont **provisoires** (badge orange dans la page) :
patin, moteur, bloc à 2 cylindres en V, garde-courroie, démarreur, etc. sont des hypothèses
à corriger avec les plans (G:\DOCUMENTATION TECHNIQUE) ou des photos.

Rendu : textures procédurales d'usure (peinture écaillée, apprêt, rouille, huile), sans poussière,
exportées dans le GLB (couleur, rugosité/métal, normales).

## Régénérer après une modification

Dans ce dossier (Node.js ; les modules de la racine du dépôt suffisent) :

    npm install    # ou un lien vers ../../node_modules
    node build.mjs

Copier `dist/index.html` dans `public/surcompresseur/index.html`, puis régénérer le GLB avec le
bouton de la page (ou `window.__scene.exportGLB()` dans Playwright).
