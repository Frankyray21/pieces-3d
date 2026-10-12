// P068 — Jeu de supports des stinger, avance à carrousel : CX036266 rév. 0
// (page 68) : « ASSY, STINGER SET - CAROUSEL », repère 8 de l'avance P028.
// Trois supports mécano-soudés : platine de 3/4 po, bras et gousset, collier
// en deux moitiés (chapeau serré par deux vis 1/2 po, compris dans
// l'ensemble) autour du fût Ø 4 po du vérin stinger (P064). Les deux supports
// doubles (1, CX036267, avec oreille percée ; 2, CX036274) serrent le fût de
// part et d'autre du bloc des clapets (qui fait butée) : le 1 sur le vérin +X
// (platine contre le flanc du cadre du carrousel P098), le 2 sur le vérin −X
// (platine contre l'aile arrière du support latéral P100) ; le support simple
// (3, CX036276) guide le haut du vérin −X. Platines boulonnées par seize vis
// H 5/8 × 2 1/2 (4), deux rondelles Nord-Lock (5) et un écrou (6) chacune :
// six par support double, quatre pour le simple.
// Repère : celui de l'avance (FEED, placé à l'identité dans P028) ; vérins
// sur FEED.stingers, blocs à y = STINGER_Y = 1.5. Platine du 2 et du 3 sur
// l'aile du P100 (z = −0.16, face avant), platine du 1 contre une face du
// cadre du carrousel supposée en x = 0.916 (à confirmer avec P098).
// Encombrement ≈ 1.45 × 1.25 × 0.25 m.
// Cotes : visserie (liste) ; supports d'après la page 68 à l'échelle du fût.
import { FEED } from '../feed.js';
import { STINGER_Y, u, IN, hhcs, hexNut, nordLock, slab, orient, M } from './_feed.js';

const RB = u(4) / 2 + 0.0008; // alésage des colliers (fût Ø 4 po)
const RO = 0.075, HC = 0.045; // collier : rayon extérieur, hauteur
const TP = u(0.75), TF = u(0.75); // platine, appui (aile ou cadre)
const BH = u(2.8); // demi-longueur du bloc des clapets (P064)

export default function P068(api) {
  const { S } = api;
  const { box, group } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);

  // Support dans un repère local : axe du fût selon Y à l'origine, bras vers −Z,
  // platine de z = −A − TP à −A ; colliers aux hauteurs ys (relatives).
  const bracket = (A, ys, plateH, bolts, lug) => {
    const parts = [], caps = [], hw = [];
    const ymin = Math.min(...ys) - HC / 2 - 0.01, ymax = Math.max(...ys) + HC / 2 + 0.01;
    const yp0 = Math.min(ymin, -plateH / 2), yp1 = Math.max(ymax, plateH / 2);
    parts.push(orient(slab([[-0.085, yp0], [0.085, yp0], [0.085, yp1], [-0.085, yp1]], bolts.map(([x, y]) => [x, y, u(0.34)]), TP, 'grey'), [1, 0, 0], [0, 1, 0], [0, 0, -A - TP / 2]));
    for (const y of ys) {
      // moitié fixe (côté bras) et chapeau, oreilles de serrage selon X
      const half = (a0) => {
        const pts = [];
        for (let i = 0; i <= 16; i++) { const a = a0 + (i / 16) * Math.PI; pts.push([Math.cos(a) * RO, Math.sin(a) * RO]); }
        for (let i = 16; i >= 0; i--) { const a = a0 + (i / 16) * Math.PI; pts.push([Math.cos(a) * RB, Math.sin(a) * RB]); }
        return orient(slab(pts, [], HC, 'grey'), [1, 0, 0], [0, 0, -1], [0, y, 0]);
      };
      parts.push(half(0)); // z ≤ 0 (côté bras) : angle 0 → π dans (x, −z)
      caps.push(half(Math.PI));
      for (const s of [-1, 1]) {
        parts.push(box(0.03, HC, 0.024, 'grey', { pos: [s * (RO + 0.008), y, -0.012] }));
        caps.push(box(0.03, HC, 0.024, 'grey', { pos: [s * (RO + 0.008), y, 0.012] }));
        hw.push(hhcs(0.5 * IN, u(2.25), [s * (RO + 0.01), y, 0.026], [0, 0, 1], 'zinc'));
        hw.push(hexNut(0.5 * IN, [s * (RO + 0.01), y, -0.03], [0, 0, -1]));
      }
      // bras et gousset
      const armL = A - RO + 0.006;
      parts.push(box(0.06, HC, armL, 'grey', { pos: [0, y, -RO + 0.003 - armL / 2] }));
      parts.push(orient(slab([[0, 0], [armL, 0], [armL, Math.min(0.07, A)]], [], u(0.5), 'grey'), [0, 0, -1], [0, Math.sign(y || 1), 0], [0, y + Math.sign(y || 1) * HC / 2, -RO + 0.003]));
    }
    if (lug) {
      const y = Math.min(...ys);
      parts.push(orient(slab([[0, -0.022], [0.05, -0.022], [0.06, -0.012], [0.06, 0.012], [0.05, 0.022], [0, 0.022]], [[0.045, 0, u(0.53)]], u(0.75), 'grey'), [0, 0, 1], [1, 0, 0], [0, y - HC / 2 - 0.01, RO - 0.004]));
    }
    const welds = M(ys.map((y) => S.weld([[-0.03, y - HC / 2, -A], [0.03, y - HC / 2, -A]], 0.007, 'grey')), 'grey');
    welds.geometry.userData.edgeAngle = 75;
    return group(M(parts, 'grey'), M(caps, 'grey'), M(hw, 'zinc'), welds);
  };
  const boltsOn = (g, rot, pos, bolts, A) => {
    // vis traversant platine + appui : tête côté bras (+z local), écrou derrière
    const nl = 2 * Math.max(0.0008, 0.625 * IN * 0.09) * 1.1;
    const tr = (x, y, z) => {
      const v = new api.THREE.Vector3(x, y, z).applyEuler(new api.THREE.Euler(...rot));
      return [v.x + pos[0], v.y + pos[1], v.z + pos[2]];
    };
    const d = new api.THREE.Vector3(0, 0, 1).applyEuler(new api.THREE.Euler(...rot)).toArray();
    const dn = d.map((c) => -c);
    for (const [x, y] of bolts) {
      P('5', nordLock(0.625 * IN, tr(x, y, -A + nl / 2), d), d.map((c) => c * 0.08));
      P('4', hhcs(0.625 * IN, u(2.5), tr(x, y, -A + nl), d), d.map((c) => c * 0.16));
      P('5', nordLock(0.625 * IN, tr(x, y, -A - TP - TF - nl / 2), dn), dn.map((c) => c * 0.08));
      P('6', hexNut(0.625 * IN, tr(x, y, -A - TP - TF - nl - 0.0076), dn), dn.map((c) => c * 0.14));
    }
    void g;
  };
  const dc = BH + HC / 2 + 0.003; // colliers de part et d'autre du bloc
  const B6 = [-0.05, 0.05].flatMap((x) => [-0.11, 0, 0.11].map((y) => [x, y]));
  const B4 = [-0.05, 0.05].flatMap((x) => [-0.04, 0.04].map((y) => [x, y]));

  // 1 — support double à oreille, vérin +X : bras vers −X (platine contre le cadre du carrousel)
  {
    const [x, z] = FEED.stingers[1], A = 0.085;
    const rot = [0, Math.PI / 2, 0], pos = [x, STINGER_Y, z];
    const g = bracket(A, [-dc, dc], 0.25, B6, true);
    g.rotation.set(...rot); g.position.set(...pos);
    P('1', g, [0.25, 0, 0]);
    boltsOn(g, rot, pos, B6, A);
  }
  // 2 — support double, vérin −X : bras vers −Z (aile arrière du P100)
  {
    const [x, z] = FEED.stingers[0], A = (z + 0.16) - TP;
    const pos = [x, STINGER_Y, z];
    const g = bracket(A, [-dc, dc], 0.25, B6, false);
    g.position.set(...pos);
    P('2', g, [-0.25, 0, 0]);
    boltsOn(g, [0, 0, 0], pos, B6, A);
  }
  // 3 — support simple, haut du vérin −X
  {
    const [x, z] = FEED.stingers[0], A = (z + 0.16) - TP;
    const pos = [x, 2.55, z];
    const g = bracket(A, [0], 0.12, B4, false);
    g.position.set(...pos);
    P('3', g, [-0.25, 0.1, 0]);
    boltsOn(g, [0, 0, 0], pos, B4, A);
  }
  return { view: { dir: [0.3, 0.4, -1] } };
}
