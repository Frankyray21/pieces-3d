// P276 — Trousse de flexibles du surpresseur de translation CX032063
// (page 276, sans illustration) : « HOSE KIT, DU311 TRAM BOOSTER », repère 41
// de P246. Huit flexibles JIC-08 (1/2 po) à embouts sertis entre le bloc
// surpresseur (P246 rep. 21), le multiplicateur de pression (rep. 16), le
// distributeur de translation P262, la pompe 90 cc et le collecteur P260 :
// trois de 30 po droits / droits (1 : bloc → entrée IN et retour R du
// multiplicateur, sortie haute pression H → bloc), un de 25 po droit / 90°
// (2 : bloc → orifice P du distributeur), un de 40 po droit / 90° (3 : pompe
// 90 cc → dérivation du bloc), un de 45 po à quatre nappes (4 : bloc →
// collecteur) et deux de 44 po droit / 90° à quatre nappes (5 : section de
// translation A / B → collecteur). Embouts « 90° » : coude serti dessiné au
// bout côté appareil.
// Repère : REPÈRE MACHINE (celui de P246, qui la pose à l'identité) ; bouts
// mâles des raccords lus dans boosterFittings() de _engine.js. Tracés
// estimés (aucune vue) : le long des appareils, par le côté gauche du
// compartiment, longueurs de la liste respectées à quelques pour cent près.
import { boosterFittings, offset, IN } from './_engine.js';

export default function P276(api) {
  const { THREE, S } = api;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const T = Object.fromEntries(boosterFittings(S, THREE).map((f) => [f.key, f]));
  const r8 = 0.47 * IN, r8w = 0.53 * IN; // demi-diamètres extérieurs : 2 nappes, 4 nappes
  // Flexible de a vers b (bouts mâles), sortie dans l'axe de chaque raccord, points de passage.
  const run = (a, b, via, r) => {
    const A = T[a], B = T[b];
    const pts = [A.tip, offset(A.tip, A.dir, 0.05), ...via, offset(B.tip, B.dir, 0.05), B.tip];
    return S.hose(pts, r, { endMaterial: 'zinc' });
  };

  // 1 — trois flexibles 30 po droits / droits (bloc ↔ multiplicateur), par l'extérieur.
  P('1', run('b21a', 'intIN', [[-1.8, 1.77, -0.85], [-1.62, 1.73, -0.93], [-1.36, 1.64, -0.9]], r8), [0, 0.05, -0.15]);
  P('1', run('b21b', 'intR', [[-1.76, 1.74, -0.84], [-1.58, 1.69, -0.935], [-1.33, 1.6, -0.9]], r8), [0, 0.03, -0.17]);
  P('1', run('intH', 'b21c', [[-1.86, 1.62, -0.9], [-1.82, 1.76, -0.88]], r8), [0, 0.05, -0.19]);
  // 2 — 25 po droit / 90° : bloc → orifice P du distributeur, par-dessus.
  P('2', run('b21d', 'tvP', [[-1.66, 1.86, -0.72], [-1.48, 1.885, -0.63], [-1.37, 1.84, -0.6]], r8), [0.1, 0.12, 0]);
  // 3 — 40 po droit / 90° : pompe 90 cc → dérivation du té du bloc.
  P('3', run('p90', 'b21br', [[-1.37, 1.38, -0.51], [-1.36, 1.6, -0.5], [-1.42, 1.79, -0.55], [-1.62, 1.8, -0.64]], r8), [0.15, 0.05, 0.05]);
  // 4 — 45 po à quatre nappes : bloc → façade du collecteur.
  P('4', run('b21run', 'tmC', [[-1.8, 1.84, -0.76], [-1.98, 1.82, -0.84], [-2.06, 1.62, -0.925], [-2.12, 1.45, -0.86]], r8w), [-0.1, 0.1, -0.1]);
  // 5 — deux 44 po droit / 90° à quatre nappes : section de translation A / B → flanc du collecteur.
  P('5', run('tvA', 'tmA', [[-1.36, 1.64, -0.66], [-1.34, 1.45, -0.76], [-1.36, 1.33, -0.88], [-1.62, 1.31, -0.928], [-1.98, 1.29, -0.9], [-2.05, 1.28, -0.78]], r8w), [0.05, -0.1, -0.15]);
  P('5', run('tvB', 'tmB', [[-1.33, 1.63, -0.6], [-1.3, 1.45, -0.72], [-1.32, 1.36, -0.86], [-1.62, 1.345, -0.928], [-1.98, 1.33, -0.9], [-2.05, 1.32, -0.72]], r8w), [0.05, -0.12, -0.17]);
  return { view: { dir: [0.6, 0.6, -1.2] } };
}
