// P156 — Boucle de boyaux de la tête V30 : CX036044 rév. 0 « ASSY, HOSE
// LOOP » (pages 156-158), repère de l'avance P032. Montant de garde (5,
// « PLATE, HOSE GUARD », tôle 1/4 po de 0.22 m pliée en U, tête pliée en V
// formant déflecteur) dressé sur le support de traversée (6, « BULKHEAD
// BRACKET ») ; trois peignes (7, « ASSY, HOSE SPACER » : deux demi-barres à
// huit alvéoles graduées serrées par six vis) à plat sur sa face avant ; deux
// câbles de boucle de 96 po (1) qui montent du dessous du support dans les
// alvéoles d'extrémité des peignes, passent en crosse vers l'avant et
// redescendent jusqu'à mi-hauteur ; ferrure de garde (3,
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
// Repère : origine au pied du montant 5, au centre de sa face avant (+X),
// sur le dessus du support de traversée ; Y vers le haut, +X vers l'avant
// (face aux peignes, côté boyaux ; crosses des câbles vers +X), −X vers
// l'arrière (ferrure 3, ligne d'air), Z en travers (le long des peignes).
// Encombrement ≈ 0.55 (X) × 1.60 (Y, de −0.28 à 1.32) × 0.30 (Z) m.
// Cotes : visserie et raccords (liste) ; câbles 96 po ; tôles, entraxes et
// hauteurs d'après les proportions des pages 156 et 158 (montant ≈ 1.25 m pour
// que les bouts libres des câbles de 96 po s'arrêtent à mi-hauteur).
import { IN, place, seat, hhcs, hexNut, nordLock, flatWasher, union, tee, elbow, capNut, whipCheckMount } from './_avance_a.js';

const T5 = 0.25 * IN, W5 = 0.22, H5 = 1.25, FL = 0.025; // montant (tôle, largeur, hauteur, retours)
const YS = [0.51, 0.91, 1.22]; // peignes
const LS = 0.27, TS = 0.016, HS = 0.032; // peignes : longueur (Z), demi-épaisseur (X), hauteur
const XJ = T5 + TS; // plan de joint des peignes (axe des alvéoles)
const ZC = [-0.118, 0.118]; // câbles, alvéoles d'extrémité
const T6 = 0.375 * IN; // support de traversée
const XA = -0.085; // axe de la ligne d'air (derrière le montant)

export default function P156(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, extrude, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v = (...a) => new THREE.Vector3(...a);

  // ------------------------------------------------------------- 5 — montant
  // Âme dans le plan YZ (face avant x = T5), retours pliés vers l'arrière,
  // tête pliée en V (déflecteur), deux boutonnières hautes (ferrure 3).
  const web = extrude([[-W5 / 2, 0], [W5 / 2, 0], [W5 / 2, H5], [-W5 / 2, H5]], T5, 'grey', { holes: [[0.04, 0.72, 0.0087], [-0.04, 0.72, 0.0087]] });
  web.rotation.y = Math.PI / 2;
  web.position.x = T5 / 2;
  const flanges = [-1, 1].map((sg) => box(FL, H5, T5, 'grey', { pos: [-FL / 2 + T5, H5 / 2, sg * (W5 / 2 - T5 / 2)] }));
  const vee = [-1, 1].map((sg) => {
    const b = box(T5, 0.13, W5 / 2 + 0.01, 'grey', { pos: [0, 0, 0] });
    b.rotation.y = sg * 0.55;
    b.position.set(-0.03, H5 + 0.06, sg * W5 / 4);
    return b;
  });
  const foot = box(0.05, T5, W5, 'grey', { pos: [-0.025 + T5, T5 / 2, 0] });
  P('5', merged([web, ...flanges, ...vee, foot], 'grey'), [-0.12, 0.15, 0]);

  // ------------------------------------------------------------- 7 — peignes
  // Demi-barres 5/8 × 1 1/4 × 10 1/2 po en plastique noir, alvéoles dans le
  // plan de joint (Ø 1/2 aux bouts pour les câbles, puis 1 1/4, 1, 7/8, 3/4…),
  // six vis 1/4 à écrous, en quinconce.
  const dia = [0.5, 1.25, 1.0, 0.75, 0.625, 0.75, 1.0, 1.25, 0.5].map((d) => d * IN);
  const gap = (LS - 0.02 - dia.reduce((a2, b2) => a2 + b2, 0)) / (dia.length - 1);
  const zc = []; let z0 = -LS / 2 + 0.01;
  dia.forEach((d) => { zc.push(z0 + d / 2); z0 += d + gap; });
  const half = (side) => {
    // Contour dans le plan (z, x) : x de XJ (joint) à XJ + side·TS.
    const pts = [[-LS / 2, XJ + side * TS], [-LS / 2, XJ]];
    zc.forEach((z, i) => {
      const r = dia[i] / 2 + 0.0005;
      for (let k = 0; k <= 10; k++) { const a2 = Math.PI - (k / 10) * Math.PI; pts.push([z + Math.cos(a2) * r, XJ + side * Math.sin(a2) * r]); }
    });
    pts.push([LS / 2, XJ], [LS / 2, XJ + side * TS]);
    const m = extrude((side > 0 ? pts : pts.slice().reverse()).map(([z, x]) => [z, x]), HS, 'plastic');
    // extrude : plan XY → ici (z, x) ; on remet z selon Z et x selon X.
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(v(0, 0, 1), v(1, 0, 0), v(0, 1, 0)));
    return m;
  };
  const boltsZ = [-0.098, -0.034, 0.03, 0.094, -0.066, 0.062];
  YS.forEach((y) => {
    const halves = [half(1), half(-1)].map((m) => { const g = group(m); g.position.y = y; return g; });
    const hw = [];
    boltsZ.forEach((z, i) => {
      const dy = i < 4 ? 0.008 : -0.008;
      hw.push(at(cyl(0.0032, 0.044, 'zinc', { axis: 'x', seg: 10 }), [XJ, y + dy, z]));
      hw.push(at(S.nut(0.4375 * IN, 0.005, 'zinc', { axis: 'x' }), [XJ + TS + 0.0025, y + dy, z]));
    });
    P('7', group(merged(halves, 'plastic'), merged(hw, 'zinc')), [0.14, 0, 0]);
  });

  // ------------------------------------------------------------- 1 — câbles de boucle
  // Tige gainée Ø 1/2 po : part sous le support, monte dans les alvéoles
  // d'extrémité, crosse vers l'avant (R 0.12 et 0.18), redescend.
  ZC.forEach((z, i) => {
    const Rk = 0.12 + i * 0.06;
    const yTop = H5 + 0.03;
    const pts = [v(XJ, -0.04, z), v(XJ, yTop, z)];
    for (let k = 1; k <= 12; k++) { const a2 = Math.PI - (k / 12) * Math.PI; pts.push(v(XJ + Rk + Math.cos(a2) * Rk, yTop + Math.sin(a2) * Rk, z)); }
    const down = Math.max(0.1, 96 * IN - (yTop + 0.04) - Math.PI * Rk);
    pts.push(v(XJ + 2 * Rk, yTop - down, z));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const body = merged([new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.25 * IN, 10, false))], 'black');
    const ends = [0, 1].map((t) => { const p = curve.getPointAt(t); return at(cyl(0.0085, 0.025, 'zinc', { seg: 12 }), [p.x, p.y + (t ? 0.012 : 0.012), p.z]); });
    P('1', group(body, merged(ends, 'zinc')), [0.3 + i * 0.06, 0.12, 0]);
  });

  // ------------------------------------------------------------- 3 — ferrure de garde
  // Platine verticale au dos du montant (deux vis 16), berceau horizontal
  // vers l'arrière (butée d'émerillon) ; les vis 18 du haut la traversent.
  const y3 = 0.72;
  const brk3 = merged([
    box(0.0095, 0.1, 0.14, 'grey', { pos: [-0.0048 - 0.0, y3, 0] }),
    box(0.12, 0.0095, 0.1, 'grey', { pos: [-0.06, y3 + 0.045, 0] }),
    at(cyl(0.006, 0.14, 'zinc', { axis: 'z', seg: 12 }), [-0.105, y3 + 0.06, 0]),
  ], 'grey');
  P('3', brk3, [-0.14, 0, 0]);

  // ------------------------------------------------------------- 6 — support de traversée
  // Tôle 3/8 po : x de −0.15 à 0.20, z ±0.125 ; trou de la ligne d'air,
  // passages des câbles, rangée arrière des quatre traversées -12, rangée
  // avant des -06 / -08 ; retour vertical à l'avant (vis de butée), patte
  // verticale à l'arrière sous la tôle (vis 18 du bas).
  const NB = [
    { n: 12, x: 0.055, z: -0.075 }, { n: 12, x: 0.055, z: -0.025 }, { n: 12, x: 0.055, z: 0.025 }, { n: 12, x: 0.055, z: 0.075 },
    { n: 6, x: 0.115, z: -0.03 }, { n: 8, x: 0.115, z: 0.03 },
  ];
  const hR = { 6: 0.5, 8: 0.62, 12: 0.83 };
  const top6 = extrude([[-0.15, -0.125], [0.2, -0.125], [0.2, 0.125], [-0.15, 0.125]].map(([x, z]) => [x, -z]), T6, 'grey', {
    holes: [[XA, 0, 1.25 * IN], ...NB.map((b) => [b.x, -b.z, (hR[b.n] * IN) / 2]), ...ZC.map((z) => [XJ, -z, 0.0068])],
  });
  top6.rotation.x = -Math.PI / 2;
  top6.position.y = -T6 / 2;
  const lip = box(T6, 0.05, 0.16, 'grey', { pos: [0.2 - T6 / 2, -T6 - 0.025, 0] });
  const patte = box(T6, 0.07, 0.16, 'grey', { pos: [-0.03, -T6 - 0.035, 0] });
  P('6', merged([top6, lip, patte], 'grey'), [0, -0.12, 0]);

  // 8 / 9 / 10 — traversées ; 13 tés dessus (deux premières -12), 12 coudes
  // dessus (deux autres -12, sorties vers l'avant) ; 11 bouchon sur la -08.
  NB.forEach((b, i) => {
    const ref = b.n === 6 ? '8' : b.n === 8 ? '9' : '10';
    const u = place(union(b.n, { bulkhead: true, t: T6 }), [b.x, -T6, b.z]);
    P(ref, u, [0, 0.07 + (i % 2) * 0.02, 0]);
    if (b.n === 8) P('11', place(capNut(8), seat(u, 0).p, [0, 1, 0]), [0, 0.14, 0]);
    if (b.n === 12) {
      const s0 = seat(u, 0);
      if (b.z < 0) P('13', place(tee('swivel', 12, 12), s0.p, s0.d, [1, 0, 0]), [0, 0.17, 0]);
      else P('12', place(elbow('swivel', 12, 12), s0.p, s0.d, [1, 0, 0]), [0, 0.17, 0]);
    }
  });

  // ------------------------------------------------------------- visserie
  // 16 / 21 : deux au pied du montant (dans le support), deux de la ferrure 3
  // au travers du montant (têtes à l'avant).
  for (const [p, d, e] of [
    [[T5 - 0.03, T5, -0.06], [0, 1, 0], [0, 0.1, 0]], [[T5 - 0.03, T5, 0.06], [0, 1, 0], [0, 0.1, 0]],
    [[T5, y3 - 0.03, -0.05], [1, 0, 0], [0.1, 0, 0]], [[T5, y3 - 0.03, 0.05], [1, 0, 0], [0.1, 0, 0]],
  ]) {
    const D = v(...d);
    P('21', nordLock(0.375 * IN, v(...p).addScaledVector(D, 0.0011).toArray(), d, { sp: true }), e);
    P('16', hhcs(0.375 * IN, 1.0 * IN, v(...p).addScaledVector(D, 0.0022).toArray(), d), e.map((c) => c * 1.6));
  }
  // 18 / 20 : vis 5/8 × 4 1/2, têtes à l'avant ; en haut au travers du
  // montant et de la ferrure 3, en bas au travers de la patte du support 6.
  for (const [x, y, z] of [[T5, y3 + 0.0, 0.04], [T5, y3 + 0.0, -0.04], [-0.03 + T6 / 2, -T6 - 0.04, 0.05], [-0.03 + T6 / 2, -T6 - 0.04, -0.05]]) {
    P('20', flatWasher(0.625 * IN, [x + 0.0012, y, z], [1, 0, 0]), [0.06, 0, 0]);
    P('18', hhcs(0.625 * IN, 4.5 * IN, [x + 0.0024, y, z], [1, 0, 0]), [0.16, 0, 0]);
  }
  // 17 / 19 / 22 : vis de butée horizontales dans le retour avant du support.
  for (const z of [-0.04, 0.04]) {
    const x = 0.2;
    P('22', hexNut(0.5 * IN, [x + 0.0035, -T6 - 0.03, z], [1, 0, 0], { jam: true }), [0.05, 0, 0]);
    P('19', flatWasher(0.5 * IN, [x + 0.007 + 0.0012, -T6 - 0.03, z], [1, 0, 0]), [0.08, 0, 0]);
    P('17', hhcs(0.5 * IN, 1.25 * IN, [x + 0.007 + 0.0024, -T6 - 0.03, z], [1, 0, 0]), [0.12, 0, 0]);
  }

  // ------------------------------------------------------------- ligne d'air 2 po (x = XA)
  const r2 = (2.375 * IN) / 2;
  const male = (len, mat = 'zinc') => lathe([[0, 0], [r2 * 0.9, 0], ...S.thread(r2 * 0.97, 0.002, len, { r1: r2 * 0.93, pitch: 0.0022, maxTurns: 10, chamferBottom: false }), [r2 * 0.8, len + 0.001], [0, len + 0.001]], mat, { seg: 28 });
  const adapter = () => group(
    S.nut(2.75 * IN, 0.03, 'zinc', { pos: [0, 0.015, 0] }),
    at(male(0.03), [0, 0.03, 0]),
    at(male(0.035), [0, 0, 0]).rotateX(Math.PI),
  );
  P('4', place(whipCheckMount(), [XA, 0.0032, 0], [0, 0, 1], [1, 0, 0]), [-0.06, 0.12, 0]);
  P('14', place(adapter(), [XA, 0.0064 + 0.035, 0], [0, 1, 0]), [-0.06, 0.24, 0]);
  P('15', lathe([[0, -0.03], [r2 * 0.9, -0.03], ...S.thread(r2, -0.029, 0.04, { pitch: 0.0022, maxTurns: 14 }), [r2 * 0.9, 0.041], [0, 0.041]], 'steel', { seg: 28, pos: [XA, -T6, 0] }), [-0.06, -0.05, 0]);
  const ys = -T6 - 0.03;
  const swivel = group(
    S.nut(3.0 * IN, 0.03, 'steel', { pos: [0, -0.015, 0] }),
    lathe([[0, -0.106], [1.45 * IN, -0.106], [1.62 * IN, -0.1], [1.62 * IN, -0.03], [0, -0.03]], 'castIron', { seg: 32 }),
    S.torus(1.62 * IN, 0.0015, 'darkSteel', { pos: [0, -0.065, 0] }),
    S.nut(3.0 * IN, 0.03, 'steel', { pos: [0, -0.121, 0] }),
  );
  swivel.position.set(XA, ys, 0);
  P('2', swivel, [-0.12, -0.12, 0]);
  const yb = ys - 0.136;
  P('4', place(whipCheckMount(), [XA, yb - 0.0032, 0], [0, 0, 1], [1, 0, 0]), [-0.06, -0.2, 0]);
  P('14', place(adapter(), [XA, yb - 0.0064 - 0.035, 0], [0, -1, 0]), [-0.06, -0.3, 0]);

  return { view: { dir: [1.0, 0.45, 1.1] } };
}
