// P272 — Échappement CX009581 rév. 2 (page 272) : « EXHAUST SYSTEM ASSY »,
// repère 34 de P246. Du turbocompresseur au silencieux couché entre les
// longerons sous le radiateur : collier en V (2) sur la bride de turbine,
// coude de raccordement au turbo (5), flexible à soufflet (4), silencieux
// (3) tenu par deux brides en U (1) sur ses supports gauche (7) et droit (8)
// boulonnés contre les longerons, écran thermique (9) sur entretoises, tuyau
// de sortie (6) coudé vers le bas, bout biseauté. Les colliers en V CP001081
// des raccords soudés (note du dessin) sont dessinés avec leurs tuyaux.
// Repère : REPÈRE MACHINE (celui de P246, qui le pose à l'identité) ; turbo à
// ENG.turbOut de _engine.js, silencieux MUF. Encombrement ≈ 0.32 (X) × 1.06
// (Y, de 0.46 à 1.52) × 0.95 (Z) m. Cotes : tuyaux Ø 3 po, silencieux Ø 0,24
// × 0,60 m (proportions des pages 248 et 272).
import { MUF, ENG, e2m, IN, vBandClamp, uBolt } from './_engine.js';

export default function P272(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, tube, at, group, merged } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const r3 = 1.5 * IN; // rayon des tuyaux Ø 3 po
  const T = ENG.turbOut;
  const t0 = e2m([T.x, T.y, T.z]); // bride de turbine (sortie vers −Y)
  const V = (a) => new THREE.Vector3(...a);

  // Collier en V orienté selon dir, centré en p (D : diamètre de bride).
  const vb = (p, dir, D = 0.09) => {
    const g = group(vBandClamp(S, D));
    g.quaternion.setFromUnitVectors(V([0, 1, 0]), V(dir).normalize());
    g.position.set(...p);
    return g;
  };
  // Bride à collerette soudée au bout d'un tuyau (axe dir).
  const flange = (p, dir) => {
    const g = group(lathe([[r3 - 0.002, -0.006], [r3 + 0.012, -0.006], [r3 + 0.014, 0], [r3 + 0.012, 0.006], [r3 - 0.002, 0.006]], 'steel', { seg: 28 }));
    g.quaternion.setFromUnitVectors(V([0, 1, 0]), V(dir).normalize());
    g.position.set(...p);
    return g;
  };

  // ---------------------------------------------------------------- 2 — collier en V côté turbo
  P('2', vb([t0[0], t0[1] - 0.006, t0[2]], [0, 1, 0], 0.1), [0, 0.1, 0]);

  // ---------------------------------------------------------------- 5 — coude de raccordement au turbo
  // Descend de la bride de turbine, cintré vers l'arrière et vers −Z, bride en V au bout.
  const p5 = [t0, [t0[0], t0[1] - 0.08, t0[2]], [t0[0] - 0.06, t0[1] - 0.2, t0[2] - 0.03], [-2.1, 1.2, -0.04]];
  const end5 = p5.at(-1);
  P('5', group(
    tube([[t0[0], t0[1] - 0.012, t0[2]], ...p5.slice(1)], r3, 'steel', { seg: 32, radial: 20 }),
    flange([t0[0], t0[1] - 0.012, t0[2]], [0, -1, 0]),
    flange(end5, [-0.4, -1, -0.15]),
    vb(end5, [-0.4, -1, -0.15], 0.095),
  ), [0, 0.15, 0.1]);

  // ---------------------------------------------------------------- 4 — flexible à soufflet
  // Soufflet inox (ondes) entre deux manchettes lisses, jusqu'au piquage du silencieux.
  const mIn = [MUF.x, MUF.y + MUF.r + 0.06, MUF.z0 + 0.08]; // bout du piquage d'entrée
  const c4 = new THREE.CatmullRomCurve3([V(end5), V([-2.14, 1.08, -0.1]), V([-2.2, 0.98, -0.18]), V(mIn)]);
  const len4 = c4.getLength();
  const n4 = Math.round(len4 / 0.012);
  const waves = [];
  for (let i = 3; i < n4 - 3; i++) {
    const t = i / n4;
    const p = c4.getPointAt(t), d = c4.getTangentAt(t);
    const w = S.torus(r3 + 0.004, 0.004, 'steel');
    w.quaternion.setFromUnitVectors(V([0, 1, 0]), d);
    w.position.copy(p);
    waves.push(w);
  }
  P('4', group(
    merged([S.tube(c4.getPoints(24).map((v) => v.toArray()), r3, 'steel', { seg: 32, radial: 20 }), ...waves], 'steel'),
    vb(mIn, [0, 1, 0], 0.095),
  ), [-0.05, 0.12, -0.05]);

  // ---------------------------------------------------------------- 3 — silencieux
  // Corps roulé à agrafure longitudinale, fonds emboutis à bourrelet, piquage
  // d'entrée vertical (bride), sortie axiale côté +Z, plaque signalétique.
  const L3 = MUF.z1 - MUF.z0, zc = (MUF.z0 + MUF.z1) / 2;
  const body = [
    cyl(MUF.r, L3 - 0.03, 'steel', { axis: 'z', seg: 40, pos: [MUF.x, MUF.y, zc] }),
    box(0.012, 0.008, L3 - 0.04, 'steel', { pos: [MUF.x, MUF.y - MUF.r - 0.002, zc] }),
  ];
  for (const s of [-1, 1]) {
    body.push(at(lathe([[0, 0], [MUF.r - 0.004, 0], [MUF.r + 0.004, 0.004], [MUF.r + 0.004, 0.012], [MUF.r - 0.01, 0.022], [0.04, 0.03], [0, 0.03]], 'steel', { axis: s > 0 ? 'z' : '-z', seg: 40 }), [MUF.x, MUF.y, zc + s * (L3 / 2 - 0.03)]));
  }
  body.push(cyl(r3, 0.07, 'steel', { seg: 24, pos: [MUF.x, MUF.y + MUF.r + 0.025, MUF.z0 + 0.08] }));
  body.push(flange([MUF.x, mIn[1] - 0.004, mIn[2]], [0, 1, 0]));
  body.push(cyl(r3, 0.05, 'steel', { axis: 'z', seg: 24, pos: [MUF.x, MUF.y, MUF.z1 + 0.025] }));
  body.push(flange([MUF.x, MUF.y, MUF.z1 + 0.05], [0, 0, 1]));
  const tag = at(S.nameplate(0.07, 0.035), [MUF.x + MUF.r + 0.0005, MUF.y, zc + 0.1]);
  tag.rotation.y = Math.PI / 2;
  P('3', group(merged(body, 'steel'), tag), [0, -0.25, 0]);

  // ---------------------------------------------------------------- 9 — écran thermique
  // Tôle cintrée sur le dessus et les flancs, bords tombés, entretoises.
  const shR = MUF.r + 0.035;
  const arc = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * 0.12 + (i / 16) * Math.PI * 0.76;
    arc.push([Math.cos(a) * shR, Math.sin(a) * shR]);
  }
  const inner = arc.map(([x, y]) => [x * (shR - 0.0025) / shR, y * (shR - 0.0025) / shR]).reverse();
  const shield = S.extrude([...arc, ...inner], L3 - 0.12, 'steel');
  shield.position.set(MUF.x, MUF.y, zc);
  const studs = [];
  for (const z of [MUF.z0 + 0.12, MUF.z1 - 0.12]) for (const a of [0.45, Math.PI / 2, Math.PI - 0.45]) {
    studs.push(at(cyl(0.006, 0.035, 'steel', { seg: 8 }), [MUF.x + Math.cos(a) * (MUF.r + 0.017), MUF.y + Math.sin(a) * (MUF.r + 0.017), z], [0, 0, a - Math.PI / 2]));
    studs.push(at(S.nut(0.013, 0.007, 'steel'), [MUF.x + Math.cos(a) * (shR + 0.003), MUF.y + Math.sin(a) * (shR + 0.003), z], [0, 0, a - Math.PI / 2]));
  }
  P('9', group(shield, merged(studs, 'steel')), [0, 0.2, 0]);

  // ---------------------------------------------------------------- 1 — brides en U (deux)
  const zs = [MUF.z0 + 0.06, MUF.z1 - 0.06];
  for (const z of zs) {
    const ub = group(uBolt(S, THREE, 2 * MUF.r, 0.0095, { leg: MUF.r + 0.05, base: 0.006, band: true }));
    ub.rotation.x = Math.PI; // arc dessous, branches vers le haut au travers du support
    ub.position.set(MUF.x, MUF.y, z);
    P('1', group(ub), [0, -0.12, 0]);
  }

  // ---------------------------------------------------------------- 7, 8 — supports gauche et droit
  // Équerre boulonnée contre la face intérieure du longeron, bras jusqu'au
  // dessus du silencieux, berceau percé pour la bride en U.
  const mount = (s) => {
    const z = zs[s > 0 ? 1 : 0], zr = s * 0.462;
    return group(merged([
      box(0.1, 0.12, 0.008, 'black', { pos: [MUF.x, MUF.y + 0.13, zr - s * 0.004] }),
      box(0.1, 0.008, Math.abs(zr - z) + 0.03, 'black', { pos: [MUF.x, MUF.y + MUF.r + 0.058, (zr + z) / 2 - s * 0.01] }),
      box(0.006, 0.07, Math.abs(zr - z), 'black', { pos: [MUF.x, MUF.y + MUF.r + 0.09, (zr + z) / 2] }),
      ...[-1, 1].map((k) => at(S.bolt(0.012, 0.03, 'zinc', { axis: s > 0 ? '-z' : 'z' }), [MUF.x + k * 0.03, MUF.y + 0.15, zr - s * 0.008])),
    ], 'black'));
  };
  P('7', mount(-1), [0, 0.05, -0.15]);
  P('8', mount(1), [0, 0.05, 0.15]);

  // ---------------------------------------------------------------- 6 — tuyau de sortie
  const o0 = [MUF.x, MUF.y, MUF.z1 + 0.05];
  const p6 = [o0, [MUF.x, MUF.y, MUF.z1 + 0.09], [MUF.x - 0.01, MUF.y - 0.06, MUF.z1 + 0.12], [MUF.x - 0.02, 0.5, MUF.z1 + 0.13]];
  const tip = at(cyl(r3 + 0.0015, 0.04, 'steel', { seg: 24, open: true }), [MUF.x - 0.02, 0.48, MUF.z1 + 0.13], [0.35, 0, 0]);
  P('6', group(
    tube(p6, r3, 'steel', { seg: 24, radial: 20 }),
    flange(o0, [0, 0, -1]),
    vb([o0[0], o0[1], o0[2] + 0.002], [0, 0, 1], 0.095),
    tip,
  ), [0, -0.05, 0.2]);
  return { view: { dir: [1.0, 0.4, 1.1] } };
}
