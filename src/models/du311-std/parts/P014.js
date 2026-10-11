// P014 — Trousse d'extinction automatique « AUTO FIRE SUPPRESSION KIT, DU311 »
// CX037388 (page 14) : option de détection linéaire du Checkfire 210, montée en
// série au bout du circuit de détection de la trousse manuelle (P016) : câble
// de circuit 5 pi (49) depuis l'actionneur du tableau de manomètres arrière,
// détecteur linéaire 5 pi (48) au-dessus du groupe de puissance du pont arrière,
// détecteur linéaire 20 pi (47) en boucle sous le capot moteur, terminé par le
// dispositif de fin de ligne de P016 (16). Le fil thermosensible (gaine rouge
// Ø 4 mm) est tenu tous les 30 cm environ par ses passe-fils (50) ; deux
// passe-fils à 3 trous (51) aux traversées de tôle (cloison du compartiment
// moteur, panneau du pont arrière).
// Repère machine (layout.js) ; tout est sur le châssis arrière.
import { M } from '../layout.js';

const E = M.engine;
const ACT = [-4.34, 1.24, -0.92]; // actionneur manuel du tableau arrière (P016)
export const EOL = [-1.3, 1.32, 0.72]; // fin du détecteur 20 pi (dispositif de fin de ligne, P016)

// Tracés (le fil épouse ses passe-fils ; coudes de rayon ≥ 5 cm).
const RUN49 = [[ACT[0] + 0.03, ACT[1] - 0.07, ACT[2]], [-4.3, 1.08, -0.86], [-3.92, 1.06, -0.84], [-3.9, 1.38, -0.8], [-4.12, 1.62, -0.72]];
const RUN48 = [[-4.1, 1.66, -0.7], [-3.6, 1.68, -0.7], [-3.3, 1.68, -0.62], [-2.95, 1.7, -0.62], [-2.8, 1.8, -0.62]];
const RUN47 = [
  [-2.78, 1.82, -0.62], [-2.7, E.top - 0.07, -0.6], [-1.9, E.top - 0.07, -0.6], [-1.2, E.top - 0.07, -0.6],
  [-1.2, E.top - 0.07, 0], [-1.2, E.top - 0.07, 0.6], [-1.9, E.top - 0.07, 0.6], [-2.7, E.top - 0.07, 0.6],
  [-2.72, 1.6, 0.68], [-2.7, 1.32, 0.72], [-2, 1.32, 0.72], [EOL[0] - 0.03, EOL[1], EOL[2]],
];

// Points espacés régulièrement le long d'une polyligne (abscisses relatives t ∈ ]0, 1[).
function along(pts, n) {
  const seg = pts.slice(1).map((p, i) => Math.hypot(...p.map((v, k) => v - pts[i][k])));
  const total = seg.reduce((s, l) => s + l, 0);
  const out = [];
  for (let j = 0; j < n; j++) {
    let s = ((j + 0.5) / n) * total, i = 0;
    while (i < seg.length - 1 && s > seg[i]) s -= seg[i++];
    const a = pts[i], b = pts[i + 1], t = s / seg[i];
    out.push({ p: a.map((v, k) => v + (b[k] - v) * t), d: b.map((v, k) => v - a[k]) });
  }
  return out;
}

export default function P014(api) {
  const { THREE, S } = api;
  const { cyl, box, lathe, cable, at, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const orient = (obj, d) => {
    obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...d).normalize());
    return obj;
  };
  // connecteur surmoulé au bout d'un fil (axe +Y)
  const plug = () => group(cyl(0.008, 0.03, 'black', { seg: 12 }), at(cyl(0.0095, 0.012, 'black', { seg: 6 }), [0, 0.02, 0]));
  const ends = (run) => [
    orient(at(plug(), run[0]), run[0].map((v, k) => v - run[1][k])),
    orient(at(plug(), run.at(-1)), run.at(-1).map((v, k) => v - run.at(-2)[k])),
  ];
  const wire = (run, mat) => group(cable(run, 0.002, { material: mat }), ...ends(run));

  // 47 — détecteur linéaire 20 pi (6,1 m) : boucle haute sous le capot, retour bas côté droit
  P('47', wire(RUN47, 'red'), [0, 0.15, 0]);
  // 48 — détecteur linéaire 5 pi (1,5 m) : au-dessus du groupe de puissance
  P('48', wire(RUN48, 'red'), [0, 0.15, -0.1]);
  // 49 — câble du circuit de détection 5 pi : de l'actionneur arrière au détecteur 5 pi
  P('49', wire(RUN49, 'black'), [-0.1, 0.05, -0.1]);

  // 50 — passe-fils du détecteur (25) : collier caoutchouc vissé sur une patte
  const clip = ({ p, d }) => {
    const g = group(
      orient(lathe([[0.0022, -0.006], [0.007, -0.006], [0.007, 0.006], [0.0022, 0.006]], 'rubber', { seg: 14 }), d),
      at(box(0.012, 0.003, 0.016, 'zinc'), [0, 0.0085, 0]),
      at(cyl(0.0025, 0.004, 'zinc', { seg: 8 }), [0, 0.0115, 0.004]),
    );
    return at(g, p);
  };
  [...along(RUN48.slice(0, -1), 5), ...along(RUN47.slice(1), 20)].forEach((c) => P('50*', clip(c), [0, 0.08, 0]));

  // 51 — passe-fils à 3 trous (2) : panneau du pont arrière et cloison du compartiment moteur
  const grom = (p, n) => orient(at(group(
    lathe([[0.006, -0.004], [0.016, -0.004], [0.016, 0.004], [0.006, 0.004]], 'rubber', { seg: 16 }),
    ...[0, 1, 2].map((k) => at(cyl(0.003, 0.009, 'black', { seg: 8 }), [Math.cos(k * 2.1) * 0.006, 0, Math.sin(k * 2.1) * 0.006])),
  ), p), n);
  P('51*', grom([-3.91, 1.2, -0.82], [0, 1, 0]), [-0.05, 0, 0]);
  P('51*', grom([E.x0, 1.78, -0.62], [1, 0, 0]), [-0.05, 0, 0]);
  return { view: { dir: [0.9, 0.8, 1.1] } };
}
