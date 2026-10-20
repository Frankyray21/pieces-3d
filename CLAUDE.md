# Consignes du projet

- **Déploiement automatique sur `main`** : une fois une modification vérifiée
  (`node scripts/check-models.mjs --eq <id> --qty`, `npm run build`), la pousser
  directement sur `main` (`git push origin HEAD:main`) ; le workflow
  `.github/workflows/pages.yml` republie alors https://frankyray21.github.io/pieces-3d/
  en une minute environ. Pas de pull request intermédiaire.
- Toujours donner le lien du site après une mise à jour (lien direct vers la
  page concernée, ex. https://frankyray21.github.io/pieces-3d/#stm-1500.P002).
- Ne modéliser que ce qui figure dans le manuel de l'équipement (pas
  d'accessoires de chantier inventés).
- Textes et commentaires en français.
