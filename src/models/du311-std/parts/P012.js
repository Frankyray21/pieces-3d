// P012 — Extinction d'incendie « ASSY. FIRE SUPPRESSION DU311, AUTO » (page 12) :
// trousse automatique (P014, détection linéaire) et trousse manuelle (P016,
// Checkfire 210), toutes deux dans le repère machine (placées à l'identité).
export default function P012(api) {
  api.part('1', api.sub('P014'));
  api.part('2', api.sub('P016'));
  return { view: { dir: [0.9, 0.8, 1.1] } };
}
