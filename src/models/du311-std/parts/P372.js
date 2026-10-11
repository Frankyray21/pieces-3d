// P372 — Trousse de télésurveillance : CX034859 rév. 2 « KIT, REMOTE
// MONITORING » (page 372), repère 21 du porteur P208. Coffret DCU (4, P374 =
// coffret P384 du TVK, avec son câblage) vissé sur son support (5, CX034857 :
// tôle 3/16 po à bord avant tombé, quatre écrous à sertir) par quatre vis H
// 1/4-20 × 5/8 po (7) et rondelles Nord-Lock (8) dans ses pattes ; le support
// est vissé sur la paroi gauche de la cabine par deux vis 7 et rondelles 8.
// L'ordinateur de collecte IP67 (2, BG00970125) est celui du coffret : sorti
// de P374 pour être la ligne 2 de cette trousse (il reste dans P374 vu seul).
// Antenne omnidirectionnelle 3 dBi (1) sur sa patte plate (6, CX034939) posée
// sur l'angle avant gauche du toit de la cabine, écrou sous la patte ; câble
// d'antenne N / N de 5 m (3) de la traversée N du coffret (dessous) à
// l'antenne : surplus lové en spires contre la paroi derrière le coffret,
// puis montée le long du montant avant gauche de la cabine.
// Repère machine (layout.js), posé à l'identité par P208 : cabine de
// translation (châssis arrière, pas d'étiquette de simulation) ; paroi gauche
// à z = −0.38 (carrier.js), coffret au milieu en x = −0.36, y = 1.245, porte
// vers l'extérieur (−Z) ; antenne en (−0.30, toit, −0.475) (repère 21 de
// carrier.js, cabine M.cab de layout.js).
import { M } from '../layout.js';
import { IN, boltAt, orient, front } from './_frontb.js';
import { DCU } from '../../du311/parts/P384.js';

const C = M.cab;
const TM = 0.1875 * IN; // tôle 3/16 du support
const O = [-0.36, 1.245, C.z0 - TM]; // origine de P374 (centre du dos du coffret)
const ROOF = 2.2375; // dessus du toit à x = −0.30 (profil de carrier.js)
const ANT = [-0.3, ROOF + 0.006, C.z0 - 0.095]; // base de l'antenne (dessus de la patte)

export default function P372(api) {
  const { THREE, S } = api;
  const { lathe, merged, group, at, tube, plate } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  void front;
  // Point du repère de P374 (tourné d'un demi-tour autour de Y) → machine.
  const D = ([x, y, z]) => [O[0] - x, O[1] + y, O[2] - z];

  // 4 — coffret DCU ; 2 — ordinateur sorti du coffret (transformation conservée).
  const dcu = api.sub('P374');
  dcu.position.set(...O);
  dcu.rotation.y = Math.PI;
  dcu.updateMatrix();
  const parts = dcu.userData.parts || [];
  const k = parts.findIndex((p) => p.userData.partRef === '2');
  if (k >= 0) {
    const comp = parts[k];
    parts.splice(k, 1);
    dcu.remove(comp);
    comp.applyMatrix4(dcu.matrix);
    P('2', comp, [0, 0, -0.4]);
  }
  P('4', dcu, [0, 0, -0.25]);

  // 5 — support : tôle contre la paroi, bord avant tombé vers l'extérieur.
  const pw = 0.27, ph = 0.43;
  const holes = [...DCU.tabs.map(([x, y]) => [-x, -y, 0.0036]), [0, 0.195, 0.0036], [0, -0.195, 0.0036]];
  const pl = plate(pw, ph, TM, 'black', { holes, r: 0.008 });
  pl.rotation.x = Math.PI / 2;
  pl.position.set(O[0], O[1], C.z0 - TM / 2);
  const lip = S.box(0.004 + TM, ph - 0.03, 0.022, 'black', { pos: [O[0] + pw / 2 - TM / 2, O[1], C.z0 - 0.011] });
  const pems = DCU.tabs.map(([x, y]) => S.cyl(0.0055, 0.002, 'zinc', { axis: 'z', seg: 12, pos: [O[0] - x, O[1] + y, C.z0 - 0.001] }));
  P('5', group(merged([pl, lip], 'black'), merged(pems, 'zinc')), [0, 0, -0.12]);

  // 7, 8 — vis : quatre dans les pattes du coffret, deux du support dans la paroi.
  for (const [x, y] of DCU.tabs) {
    const b = boltAt(api, 0.25, 0.625, D([x, y, 0.0025]), [0, 0, -1], { washer: 'nl' });
    P('8', b.washer, [0, 0, -0.3]);
    P('7', b.bolt, [0, 0, -0.34]);
  }
  for (const y of [0.195, -0.195]) {
    const b = boltAt(api, 0.25, 0.625, [O[0], O[1] + y, C.z0 - TM], [0, 0, -1], { washer: 'nl' });
    P('8', b.washer, [0, 0, -0.16]);
    P('7', b.bolt, [0, 0, -0.2]);
  }

  // 6 — patte d'antenne : plat 150 × 50 × 6 mm percé (antenne au bout, goujon du toit).
  const br = plate(0.05, 0.15, 0.006, 'black', { holes: [[0, -0.055, 0.008], [0, 0.05, 0.0065]], r: 0.012 });
  br.position.set(ANT[0], ROOF + 0.003, C.z0 - 0.04);
  P('6', br, [0, 0.12, 0]);

  // 1 — antenne omni 3 dBi : radôme noir sur embase, écrou et prise N femelle sous la patte.
  const ant = group(
    lathe([[0, 0], [0.022, 0], [0.022, 0.008], [0.016, 0.014], [0.0145, 0.02], [0.0135, 0.1], [0.011, 0.11], [0.006, 0.1145], [0, 0.115]], 'black', { seg: 24 }),
    merged([
      lathe([[0, -0.03], [0.0078, -0.03], [0.0078, -0.006], [0.0062, -0.006], [0, -0.006]], 'steel', { seg: 16 }),
      S.nut(0.022, 0.005, 'steel', { pos: [0, -0.0085, 0] }),
      S.washer(0.012, 0.0065, 0.0012, 'steel', { pos: [0, -0.0066, 0] }),
    ], 'steel'),
  );
  P('1', at(ant, ANT), [0, 0.2, 0]);

  // 3 — câble d'antenne N / N 5 m (fiches N mâles à écrou moleté et manchon).
  const plug = () => merged([lathe([[0, 0], [0.0105, 0], [0.0105, 0.02], [0.0075, 0.023], [0.0068, 0.042], [0, 0.042]], 'steel', { seg: 12 })], 'steel');
  const jack = D(DCU.nJack); // bout de la traversée N sous le coffret
  const a0 = [jack[0], jack[1] + 0.012, jack[2]];
  const top = [ANT[0], ANT[1] - 0.018, ANT[2]]; // fiche : coiffe la prise N sous la patte
  const route = (rc, n) => {
    const pts = [[a0[0], a0[1] - 0.042, a0[2]], [a0[0], a0[1] - 0.07, a0[2]], [a0[0] - 0.08, 1.06, C.z0 - 0.03]];
    // Spires dans le plan de la paroi (axe Z), derrière le coffret, entrée en bas.
    const cx = -0.62, cy = 1.25, pitch = 0.011, kk = 16;
    for (let i = 0; i <= n * kk; i++) {
      const th = (i / kk) * Math.PI * 2;
      pts.push([cx + rc * Math.sin(th), cy - rc * Math.cos(th), C.z0 - 0.015 - (pitch * i) / kk]);
    }
    const ze = C.z0 - 0.015 - pitch * n;
    pts.push([cx + 0.08, cy + rc + 0.06, ze], [-0.2, 1.47, C.z0 - 0.02], [C.x1 + 0.005, 1.6, C.z0 - 0.012], [C.x1 + 0.005, 2.05, C.z0 - 0.012],
      [ANT[0] + 0.03, top[1] - 0.16, C.z0 - 0.07], [top[0], top[1] - 0.075, top[2]], [top[0], top[1] - 0.042, top[2]]);
    return pts;
  };
  const lenOf = (p) => new THREE.CatmullRomCurve3(p.map((a) => new THREE.Vector3(...a)), false, 'catmullrom', 0.5).getLength();
  const want = 5.0 - 2 * 0.042;
  const L0 = lenOf(route(0.0001, 0));
  const n = Math.max(1, Math.min(6, Math.round((want - L0) / (2 * Math.PI * 0.12))));
  let lo = 0.04, hi = 0.2;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (lenOf(route(m, n)) < want) lo = m; else hi = m;
  }
  const pts = route((lo + hi) / 2, n);
  const plugs = merged([orient(api, plug(), a0, [0, -1, 0]), orient(api, plug(), top, [0, -1, 0])], 'steel');
  P('3', group(tube(pts, 0.0038, 'black', { seg: 160, radial: 6, ends: 'none' }), plugs), [0, 0, -0.15]);
  return { view: { dir: [0.5, 0.4, -1.1] } };
}
