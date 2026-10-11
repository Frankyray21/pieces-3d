// P156 — Boucle de boyaux de la tête V30 : CX036044 rév. 0 « ASSY, HOSE
// LOOP » (pages 156-158), repère de l'avance P032. Montant de garde (5,
// « PLATE, HOSE GUARD », plat 3/8 × 4 po) dressé sur le support de traversée
// (6, « BULKHEAD BRACKET ») ; trois peignes (7, « ASSY, HOSE SPACER » : deux
// demi-barres à alvéoles serrées par trois vis) en travers du montant ; deux
// câbles de boucle de 96 po (1) qui montent dans les peignes, passent en
// crosse au-dessus et redescendent de l'autre côté ; ferrure de garde (3,
// « HOSE GUARD BRACKET ») et deux vis H 5/8-11 × 4 1/2 (18, rondelles
// Nord-Lock 20) en haut, deux autres en bas, qui fixent l'ensemble ; vis H
// 3/8-16 × 1 filetées (16, Nord-Lock SP 21) des pieds du montant et de la
// ferrure. Support de traversée : unions de traversée JIC -06 (8), -08 (9,
// bouchon 11 : à ôter si moteurs de détection de vitesse), -12 (10 ×4) ;
// tés tournants -12 (13 ×2) dessus, coudes tournants 90° -12 (12 ×2)
// dessous ; deux vis de butée 1/2-13 × 1 1/4 filetées (17), rondelles (19),
// contre-écrous (22). Ligne d'air 2 po verticale au travers du support :
// adaptateur droit 2 po (14), platine anti-fouet (4), traversée, mamelon court
// 2 po sch. 80 (15), émerillon droit 2 po NPT (2), platine anti-fouet (4),
// adaptateur (14).
// Repère : origine au centre du pied du montant 5, sur le dessus du support
// de traversée ; Y vers le haut, X le long des peignes (côté boyaux +X, ligne
// d'air −X), Z en travers (épaisseur des peignes). Encombrement ≈ 0.45 (X) ×
// 1.30 (Y, de −0.27 à 1.03) × 0.14 (Z) m.
// Cotes : visserie et raccords (liste) ; câbles 96 po ; tôles, entraxes et
// hauteurs d'après les proportions des pages 156 et 158.
import { IN, place, seat, hhcs, hexNut, nordLock, union, tee, elbow, capNut, whipCheckMount } from './_avance_a.js';

const T5 = 0.375 * IN, W5 = 4 * IN, H5 = 1.0; // montant
const YS = [0.42, 0.66, 0.95]; // peignes
const XC = [0.04, 0.2]; // câbles dans les peignes
const T6 = 0.375 * IN; // support de traversée
const XA = -0.075; // axe de la ligne d'air

export default function P156(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, extrude, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (...a) => new THREE.Vector3(...a);

  // ------------------------------------------------------------- 5 — montant
  const holes5 = [[0, 0.15, 0.0087], [0, H5 - 0.28, 0.0087], ...YS.map((y) => [0, y, 0.005])];
  const plate5 = extrude([[-W5 / 2, 0], [W5 / 2, 0], [W5 / 2, H5], [-W5 / 2, H5]], T5, 'grey', { holes: holes5.map(([x, y, r]) => [x, y, r]) });
  // Plat dans le plan YZ : contour (z, y), épaisseur selon X.
  plate5.rotation.y = Math.PI / 2;
  plate5.position.x = T5 / 2;
  // Pied : cornière soudée (aile sur le support, deux trous 3/8).
  const foot = box(0.04, T5, W5, 'grey', { pos: [T5 + 0.02, T5 / 2, 0] });
  P('5', merged([plate5, foot], 'grey'), [0, 0.15, 0]);

  // ------------------------------------------------------------- 7 — peignes
  // Deux demi-barres 1/2 × 1 1/4 × 9 po (alvéoles Ø 7/8 dans le plan de
  // joint), trois vis 5/16 à écrou ; sur le chant du montant, côté +X.
  const LS = 0.23;
  YS.forEach((y) => {
    const halves = [];
    for (const s of [-1, 1]) halves.push(box(LS, 0.032, 0.0127, 'black', { pos: [T5 + LS / 2, y, s * 0.0068] }));
    const hw = [];
    for (const x of [0.015, LS / 2, LS - 0.012]) {
      hw.push(at(cyl(0.004, 0.04, 'zinc', { axis: 'z', seg: 10 }), [T5 + x, y, 0]));
      hw.push(at(S.nut(0.0127, 0.006, 'zinc', { axis: 'z' }), [T5 + x, y, 0.016]));
      hw.push(at(S.nut(0.0127, 0.005, 'zinc', { axis: 'z' }), [T5 + x, y, -0.016]));
    }
    P('7', group(merged(halves, 'plastic'), merged(hw, 'zinc')), [0.12, 0, 0]);
  });

  // ------------------------------------------------------------- 1 — câbles de boucle
  // Câble gainé Ø 1/2 po : du pied, monte dans les peignes, crosse de rayon
  // R, redescend côté +X jusqu'à épuiser ses 96 po.
  XC.forEach((x0, i) => {
    const Rk = 0.11 - i * 0.03;
    const yTop = H5 + 0.02 - i * 0.04;
    const pts = [v(T5 + x0, 0.04 + i * 0.25, 0), v(T5 + x0, yTop, 0)];
    for (let k = 1; k <= 10; k++) { const a = Math.PI - (k / 10) * Math.PI; pts.push(v(T5 + x0 + Rk + Math.cos(a) * Rk, yTop + Math.sin(a) * Rk, 0)); }
    const used = (H5 - 0.04) + Math.PI * Rk;
    const down = Math.max(0.1, 96 * IN - used - i * 0.25);
    pts.push(v(T5 + x0 + 2 * Rk, yTop - down, 0));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const body = merged([new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.25 * IN, 10, false))], 'black');
    const ends = [0, 1].map((t) => {
      const p = curve.getPointAt(t);
      return at(cyl(0.0085, 0.03, 'zinc', { seg: 12 }), [p.x, p.y + (t ? 0.015 : 0.015) * (t ? 1 : 1), p.z]);
    });
    P('1', group(body, merged(ends, 'zinc')), [0.25 + i * 0.05, 0.1, 0]);
  });

  // ------------------------------------------------------------- 3 — ferrure de garde
  // Équerre : aile contre le montant (côté −X) et aile vers −Z ; vis 18 au
  // travers du montant et de la ferrure (en haut), écrou côté structure.
  const y3 = H5 - 0.28;
  const brk3 = merged([
    box(0.0095, 0.1, 0.11, 'grey', { pos: [-0.0048, y3, 0] }),
    box(0.11, 0.1, 0.0095, 'grey', { pos: [-0.06, y3, -0.055 + 0.0048] }),
  ], 'grey');
  P('3', brk3, [-0.12, 0, 0]);

  // ------------------------------------------------------------- 6 — support de traversée
  // Tôle 3/8 po horizontale : x de −0.14 à 0.27, trou de la ligne d'air, six
  // trous de traversée en deux rangées, retour vertical côté +X.
  const NB = [{ n: 6, x: 0.07, z: -0.025 }, { n: 8, x: 0.07, z: 0.025 }, { n: 12, x: 0.125, z: -0.025 }, { n: 12, x: 0.125, z: 0.025 }, { n: 12, x: 0.18, z: -0.025 }, { n: 12, x: 0.18, z: 0.025 }];
  const hR = { 6: 0.5, 8: 0.62, 12: 0.83 };
  const top6 = extrude([[-0.14, -0.06], [0.27, -0.06], [0.27, 0.06], [-0.14, 0.06]].map(([x, z]) => [x, -z]), T6, 'grey', {
    holes: [[XA, 0, 1.25 * IN], ...NB.map((b) => [b.x, -b.z, (hR[b.n] * IN) / 2]), [0.03, 0, 0.005]],
  });
  top6.rotation.x = -Math.PI / 2;
  top6.position.y = -T6 / 2;
  const lip = box(T6, 0.05, 0.12, 'grey', { pos: [0.27 - T6 / 2, -T6 - 0.025, 0] });
  P('6', merged([top6, lip], 'grey'), [0, -0.12, 0]);

  // 8 / 9 / 10 — unions de traversée ; 13 / 12 dessus / dessous ; 11 bouchon.
  let k12 = 0;
  NB.forEach((b, i) => {
    const ref = b.n === 6 ? '8' : b.n === 8 ? '9' : '10';
    // union(bulkhead) : six pans sous la tôle (y < 0 local) → tôle de y = −T6 à 0.
    const u = place(union(b.n, { bulkhead: true, t: T6 }), [b.x, -T6, b.z]);
    P(ref, u, [0, 0.06 + (i % 2) * 0.02, 0]);
    if (b.n === 8) P('11', place(capNut(8), seat(u, 0).p, [0, 1, 0]), [0, 0.12, 0]);
    if (b.n === 12) {
      if (b.x < 0.15) {
        const s = seat(u, 0);
        P('13', place(tee('swivel', 12, 12), s.p, s.d, [1, 0, 0]), [0, 0.15, 0]);
      } else {
        const s = seat(u, 1);
        P('12', place(elbow('swivel', 12, 12), s.p, s.d, [k12++ ? 1 : 1, 0, 0]), [0, -0.12, 0]);
      }
    }
  });

  // ------------------------------------------------------------- visserie 16 / 21, 17 / 19 / 22, 18 / 20
  // 16 : deux au pied du montant (dans le support), deux dans la ferrure 3.
  for (const [p, d, e] of [
    [[T5 + 0.03, T5, -0.025], [0, 1, 0], [0, 0.08, 0]], [[T5 + 0.03, T5, 0.025], [0, 1, 0], [0, 0.08, 0]],
    [[-0.06, y3 + 0.025, -0.05 - 0.0095], [0, 0, -1], [0, 0, -0.08]], [[-0.06, y3 - 0.025, -0.05 - 0.0095], [0, 0, -1], [0, 0, -0.08]],
  ]) {
    const D = v(...d);
    P('21', nordLock(0.375 * IN, v(...p).addScaledVector(D, 0.0011).toArray(), d, { sp: true }), e);
    P('16', hhcs(0.375 * IN, 1.0 * IN, v(...p).addScaledVector(D, 0.0022).toArray(), d), e.map((c) => c * 1.5));
  }
  // 18 / 20 : vis 5/8 × 4 1/2 au travers du montant (et de la ferrure en haut), têtes côté +X.
  for (const y of [y3 + 0.03, y3 - 0.03, 0.15 + 0.03, 0.15 - 0.03]) {
    P('20', nordLock(0.625 * IN, [T5 + 0.0012, y, 0], [1, 0, 0]), [0.06, 0, 0]);
    P('18', hhcs(0.625 * IN, 4.5 * IN, [T5 + 0.0024, y, 0], [1, 0, 0]), [0.14, 0, 0]);
  }
  // 17 / 19 / 22 : vis de butée horizontales dans le retour du support.
  for (const z of [-0.035, 0.035]) {
    const x = 0.27 + 0.004;
    P('22', hexNut(0.5 * IN, [x + 0.0028, -T6 - 0.03, z], [1, 0, 0], { jam: true }), [0.05, 0, 0]);
    P('19', nordLock(0.5 * IN, [x + 0.0056 + 0.0012, -T6 - 0.03, z], [1, 0, 0]), [0.08, 0, 0]);
    P('17', hhcs(0.5 * IN, 1.25 * IN, [x + 0.0056 + 0.0024, -T6 - 0.03, z], [1, 0, 0]), [0.12, 0, 0]);
  }

  // ------------------------------------------------------------- ligne d'air 2 po (x = XA)
  const r2 = (2.375 * IN) / 2;
  const male = (len, mat = 'zinc') => lathe([[0, 0], [r2 * 0.9, 0], ...S.thread(r2 * 0.97, 0.002, len, { r1: r2 * 0.93, pitch: 0.0022, maxTurns: 10, chamferBottom: false }), [r2 * 0.8, len + 0.001], [0, len + 0.001]], mat, { seg: 28 });
  // 14 — adaptateur droit 2 po : six pans 2 3/4, mâle NPT d'un côté, mâle JIC-32 de l'autre.
  const adapter = () => group(
    S.nut(2.75 * IN, 0.03, 'zinc', { pos: [0, 0.015, 0] }),
    at(male(0.03), [0, 0.03, 0]),
    at(male(0.035), [0, 0, 0]).rotateX(Math.PI),
  );
  // Haut : platine 4 sur la tôle, adaptateur 14 vissé dans le mamelon.
  P('4', place(whipCheckMount(), [XA, 0.0032, 0], [0, 0, 1], [1, 0, 0]), [-0.06, 0.12, 0]);
  P('14', place(adapter(), [XA, 0.0064 + 0.035, 0], [0, 1, 0]), [-0.06, 0.24, 0]);
  // 15 — mamelon court 2 po sch. 80 au travers de la tôle.
  P('15', lathe([[0, -0.03], [r2 * 0.9, -0.03], ...S.thread(r2, -0.029, 0.04, { pitch: 0.0022, maxTurns: 14 }), [r2 * 0.9, 0.041], [0, 0.041]], 'steel', { seg: 28, pos: [XA, -T6 - 0.0, 0] }), [-0.06, -0.05, 0]);
  // 2 — émerillon droit 2 po NPT : corps à roulements, deux six pans.
  const ys = -T6 - 0.03;
  const swivel = group(
    S.nut(3.0 * IN, 0.03, 'steel', { pos: [0, -0.015, 0] }),
    lathe([[0, -0.106], [1.45 * IN, -0.106], [1.62 * IN, -0.1], [1.62 * IN, -0.03], [0, -0.03]], 'castIron', { seg: 32 }),
    S.torus(1.62 * IN, 0.0015, 'darkSteel', { pos: [0, -0.065, 0] }),
    S.nut(3.0 * IN, 0.03, 'steel', { pos: [0, -0.121, 0] }),
  );
  swivel.position.set(XA, ys, 0);
  P('2', swivel, [-0.12, -0.12, 0]);
  // Bas : platine 4 et adaptateur 14.
  const yb = ys - 0.136;
  P('4', place(whipCheckMount(), [XA, yb - 0.0032, 0], [0, 0, 1], [1, 0, 0]), [-0.06, -0.2, 0]);
  P('14', place(adapter(), [XA, yb - 0.0064 - 0.035, 0], [0, -1, 0]), [-0.06, -0.3, 0]);

  return { view: { dir: [1.0, 0.45, 1.1] } };
}
