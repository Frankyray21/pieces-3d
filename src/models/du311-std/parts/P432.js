// P432 — Module surpresseur CX026345 « BOOSTER MODULE, DU311/ DU411 »
// (page 432), repère 10 de P430. Le surpresseur Le Roi complet (P434, 4,
// TVK P282, plaques d'expédition retirées) posé sur son berceau basculant,
// lui-même articulé sur le cadre de base (10, CX028601) : la tension des
// quatre courroies 5VP (P418) se règle par le tendeur (P460, 5) qui relève le
// côté +Z du berceau autour de l'axe de charnière côté −Z.
// Tuyauterie de culasses (vues de la page 432) :
//   · aspiration, côté poulie (+X) : joint torique (2), bride ORB -24 à deux
//     vis (9) sur la bride losangée de chaque culasse, coude 90° ORB/JIC -24
//     (8) tourné vers le haut le long de l'axe du cylindre (« SUCTION AIR ») ;
//   · refoulement, côté opposé (−X) : joint de bride (3), bride ORB -24 à
//     trois oreilles (7), raccord droit ORB/JIC -24 (6) sur les culasses
//     −60° et centrale, coude 90° (8) sur la culasse +60° ;
//   · détail M : prise de pression d'huile au bas de la face arrière du
//     carter — coude 1/2 NPT → JIC -06 (13), té de branche à écrou tournant
//     (11) et té tournant (12) vers le manomètre et le capteur.
// Équerre du bloc filtre à huile (1, même pièce CM11168 que P434 rep. 1) :
// reprise à sa place exacte, grossie de 0,4 % (méthode de TVK P282).
// Les vis des brides ne sont pas à la liste (trousse de plomberie de P434) :
// dessinées avec leur bride.
// Repère : repère du bloc LR (../../du311/parts/_moteur_surpresseur.js) —
// origine sur l'axe du vilebrequin au droit du cylindre central, +X vers la
// poulie, Y haut, +Z = X × Y ; P434 inséré à l'origine. Dessous du cadre de
// base à y = −0.36 (dessus du pont arrière quand P430 pose le module en
// RB.boost), dessus du berceau à LR.footY = −0.165 (appui des pattes).
// Encombrement ≈ 0.55 (X) × 0.92 (Y) × 0.79 (Z) m. Cadre et berceau estimés
// d'après les vues de la page 432 (poulie Ø 16 po pour l'échelle).
import { LR, ACC, I, add } from './_rearb.js';
import { TB } from './P460.js';

const YP = 0.305, XF = 0.074; // brides de culasse (repère de cylindre, TVK P280)
const XS = XF + 0.022; // face extérieure des brides d'aspiration 9
const XE = XS + 0.004; // face du bossage taraudé (coude 8)
const XG = -XF - 0.0015, X7 = XG - 0.016; // joint, face extérieure des brides 7

// Repère de cylindre i → repère du bloc (point, direction).
const T = (i, [x, y, z]) => {
  const { a, x: cx } = LR.cyl[i];
  return [cx + x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
};
const D = (i, v) => { const p = T(i, v); return [p[0] - LR.cyl[i].x, p[1], p[2]]; };

/**
 * Bouts des raccords d'aspiration (8) et de refoulement (6 / 8) des trois
 * culasses, dans le repère du bloc : { suction: [{ tip, dir }], discharge }.
 * Sert à P430 pour les flexibles (repères 22 et 23).
 */
export function boostPorts(S) {
  const el = ACC.elbow(S, { a: 24, aType: 'orb' }).userData.out;
  const st = ACC.straight(S, { a: 24, b: 24, aType: 'orb' }).userData.tip;
  const suction = [0, 1, 2].map((i) => ({ tip: T(i, [XE + el[1], YP + el[0], 0]), dir: D(i, [0, 1, 0]) }));
  const discharge = [0, 1, 2].map((i) => (i === 2
    ? { tip: T(i, [X7 - el[1], YP + el[0], 0]), dir: D(i, [0, 1, 0]) }
    : { tip: T(i, [X7 - st, YP, 0]), dir: D(i, [-1, 0, 0]) }));
  return { suction, discharge };
}

export default function P432(api) {
  const { THREE, S } = api;
  const { box, cyl, lathe, plate, bolt, washer, torus, weld, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const O = (obj, pos, y, x) => ACC.orient(api, obj, pos, y, x);
  const onCyl = (i, obj) => at(group(obj), [LR.cyl[i].x, 0, 0], [LR.cyl[i].a, 0, 0]);
  const out = (i, d) => D(i, [0, d, 0]);
  const bx = (x0, x1, y0, y1, z0, z1, mat, r = 0) => box(x1 - x0, y1 - y0, z1 - z0, mat, { r, pos: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2] });

  // ---------------------------------------------------------------- 4 — surpresseur
  P('4', api.sub('P434', { noShipping: true }), [0, 0.35, 0]);

  // ---------------------------------------------------------------- 1 — équerre du bloc filtre
  // Même pièce que P434 rep. 1 : reprise à sa place, grossie de 0,4 % autour de son centre.
  {
    const root = api.sub('P434', { noShipping: true });
    root.updateMatrixWorld(true);
    const src = root.userData.parts.find((p) => p.userData.partRef === '1');
    const c = new THREE.Box3().setFromObject(src).getCenter(new THREE.Vector3());
    const inner = group(src);
    inner.position.set(-c.x, -c.y, -c.z);
    const mid = group(inner);
    mid.scale.setScalar(1.004);
    mid.position.copy(c);
    P('1', group(mid), [0, 0.25, -0.25]);
  }

  // ---------------------------------------------------------------- 10 — cadre de base et berceau
  // Cadre : deux cornières 3 × 3 × 1/4 po selon Z (ailes horizontales vers
  // l'intérieur, percées pour les vis de pont), deux traverses en cornière
  // aux bouts ; chapes de charnière soudées côté +Z (avant de la machine),
  // chape basse du tendeur sur l'aile horizontale de la traverse −Z.
  // Berceau : tôle 1/2 po raidie par deux plats de 3 po dont les bouts +Z
  // forment les oreilles de charnière ; chape haute du tendeur sous la tôle.
  // Axe de charnière Ø 1 po, écrous et rondelles ; axes Ø 1/2 po du tendeur ;
  // vis de pattes 7/8-9 (trois, la quatrième est P434 rep. 42) et écrous ;
  // vis H 1/2 po de fixation au pont. Cadre limité à z ∈ [−0.405, 0.32] pour
  // rester sous le capot (x machine de −4.355 à −3.63).
  const Y0 = -0.36, LA = I(3), TA = I(0.25), YT = Y0 + LA; // cornières
  const RX = [-0.21, 0.13]; // plans des ailes verticales des longerons
  const Z0 = -0.405, Z1 = 0.32; // bouts des longerons
  const PIV = { y: -0.232, z: 0.262 };
  const TBU = [-0.035, -0.2, -0.12], TBL = [-0.035, -0.335, -0.388]; // rotules du tendeur (entraxe 0.30)
  const YB = LR.footY, TP = I(0.5); // dessus et épaisseur de la tôle du berceau
  const XB = [-0.2, 0.12], ZB = [-0.25, 0.27];
  const SX = [-0.185, 0.105]; // raidisseurs du berceau (plats 1/2 × 3 po)
  {
    const base = [];
    // Longerons (aile verticale à l'extérieur, aile horizontale vers l'intérieur).
    base.push(bx(RX[0] - TA, RX[0], Y0, YT, Z0, Z1, 'grey'), bx(RX[0], RX[0] + LA - TA, Y0, Y0 + TA, Z0, Z1, 'grey'));
    base.push(bx(RX[1], RX[1] + TA, Y0, YT, Z0, Z1, 'grey'), bx(RX[1] - LA + TA, RX[1], Y0, Y0 + TA, Z0, Z1, 'grey'));
    // Traverses : aile verticale au bout, aile horizontale vers le centre.
    for (const [z, s] of [[Z0, 1], [Z1, -1]]) {
      base.push(bx(RX[0], RX[1], Y0 + TA, YT, s > 0 ? z : z - TA, s > 0 ? z + TA : z, 'grey'));
      base.push(bx(RX[0] + LA - TA, RX[1] - LA + TA, Y0, Y0 + TA, s > 0 ? z : z - LA + TA, s > 0 ? z + LA - TA : z, 'grey'));
    }
    // Chapes de charnière : plats 1/2 po debout contre l'aile verticale, bout arrondi.
    const lug = (x) => {
      const sh = [[-0.035, Y0 + TA], [0.035, Y0 + TA], [0.035, PIV.y], ...Array.from({ length: 9 }, (_, k) => {
        const a = (k / 8) * Math.PI;
        return [0.035 * Math.cos(a), PIV.y + 0.035 * Math.sin(a)];
      }), [-0.035, PIV.y]];
      // extrude : contour dans le plan (z, y), épaisseur selon X après rotation.
      const m = S.extrude(sh, I(0.5), 'grey', { holes: [[0, PIV.y, I(0.53)]] });
      return at(group(m), [x, 0, PIV.z], [0, -Math.PI / 2, 0]);
    };
    base.push(lug(RX[0] + I(0.25)), lug(RX[1] - I(0.25)));
    // Chape basse du tendeur : deux plats sur l'aile horizontale de la traverse −Z.
    for (const s of [-1, 1]) {
      base.push(bx(TBL[0] + s * I(0.5) - I(0.1875), TBL[0] + s * I(0.5) + I(0.1875), Y0 + TA, TBL[1] + 0.022, Z0 + TA, TBL[2] + 0.028, 'grey', 0.004));
    }
    const welds = [
      weld([[RX[0] + I(0.25) - 0.0065, Y0 + TA, PIV.z - 0.035], [RX[0] + I(0.25) - 0.0065, Y0 + TA, PIV.z + 0.035]], 0.006, 'grey'),
      weld([[RX[1] - I(0.25) + 0.0065, Y0 + TA, PIV.z - 0.035], [RX[1] - I(0.25) + 0.0065, Y0 + TA, PIV.z + 0.035]], 0.006, 'grey'),
      weld([[RX[0], YT - 0.004, Z0 + TA], [RX[1], YT - 0.004, Z0 + TA]], 0.006, 'grey'),
      weld([[RX[0], YT - 0.004, Z1 - TA], [RX[1], YT - 0.004, Z1 - TA]], 0.006, 'grey'),
    ];
    // Berceau : tôle, raidisseurs (oreilles de charnière au bout +Z), chape haute du tendeur.
    const cradle = [bx(XB[0], XB[1], YB - TP, YB, ZB[0], ZB[1], 'grey', 0.003)];
    for (const x of SX) {
      const yb = YB - TP - LA, yt = YB - TP, z1 = PIV.z + 0.034, c = 0.015;
      const sh = [[ZB[0] + 0.01, yb], [z1 - c, yb], [z1, yb + c], [z1, yt - c], [z1 - c, yt], [ZB[0] + 0.01, yt]];
      const m = S.extrude(sh, I(0.5), 'grey', { holes: [[PIV.z, PIV.y, I(0.53)]] });
      cradle.push(at(group(m), [x, 0, 0], [0, -Math.PI / 2, 0]));
      cradle.push(weld([[x - 0.0065, YB - TP, ZB[0] + 0.01], [x - 0.0065, YB - TP, ZB[1] - 0.005]], 0.006, 'grey'));
    }
    for (const s of [-1, 1]) {
      cradle.push(bx(TBU[0] + s * I(0.5) - I(0.1875), TBU[0] + s * I(0.5) + I(0.1875), TBU[1] - 0.022, YB - TP, TBU[2] - 0.03, TBU[2] + 0.03, 'grey', 0.004));
    }
    // Axes : charnière Ø 1 po, axes Ø 1/2 po du tendeur, écrous et rondelles.
    const xp0 = RX[0] + I(0.25) - I(0.5) - 0.012, xp1 = RX[1] - I(0.25) + I(0.5) + 0.012;
    const hw = [
      at(cyl(I(0.5), xp1 - xp0 + 0.03, 'steel', { axis: 'x', seg: 20 }), [(xp0 + xp1) / 2, PIV.y, PIV.z]),
      at(S.nut(I(1.5), I(0.85), 'zinc', { axis: '-x' }), [xp0 - I(0.42), PIV.y, PIV.z]),
      at(S.nut(I(1.5), I(0.85), 'zinc', { axis: 'x' }), [xp1 + I(0.42), PIV.y, PIV.z]),
      at(washer(I(1.0), I(0.53), I(0.13), 'zinc', { axis: 'x' }), [xp0 + 0.002, PIV.y, PIV.z]),
      at(washer(I(1.0), I(0.53), I(0.13), 'zinc', { axis: 'x' }), [xp1 - 0.002, PIV.y, PIV.z]),
    ];
    for (const c of [TBU, TBL]) {
      hw.push(at(bolt(I(0.5), I(1.75), 'zinc', { axis: '-x' }), [c[0] - I(0.5) - I(0.1875), c[1], c[2]]));
      hw.push(at(S.nut(I(0.75), I(0.44), 'zinc', { axis: 'x' }), [c[0] + I(0.5) + I(0.1875) + I(0.22), c[1], c[2]]));
    }
    // Vis des pattes 7/8-9 × 2 1/2 (trois) et écrous sous la tôle (quatre).
    const yt = LR.footY + 0.02;
    for (const x of LR.feetX) for (const z of [-LR.feetZ, LR.feetZ]) {
      if (!(x === LR.feetX[1] && z > 0)) hw.push(at(bolt(I(0.875), I(2.25), 'zinc', { washer: true }), [x, yt, z]));
      hw.push(at(S.nut(I(1.3125), I(0.75), 'zinc'), [x, YB - TP - I(0.375), z]));
    }
    // Vis H 1/2-13 de fixation au pont : deux par bout de longeron.
    for (const [x0, s] of [[RX[0], 1], [RX[1], -1]]) for (const z of [Z0 + 0.03, Z1 - 0.03]) {
      hw.push(at(bolt(I(0.5), I(1.25), 'zinc', { washer: true }), [x0 + s * 0.04, Y0 + TA, z]));
    }
    P('10', group(merged([...base, ...cradle], 'grey'), merged(welds, 'grey'), merged(hw.filter((o) => o), 'zinc')), [0, -0.12, 0]);
  }

  // ---------------------------------------------------------------- 5 — tendeur
  // Axe X du tendeur de la rotule basse vers la rotule haute, axes des rotules selon X du bloc.
  {
    const u = [0, TBU[1] - TBL[1], TBU[2] - TBL[2]];
    const L = Math.hypot(...u), ux = [0, u[1] / L, u[2] / L];
    const c = add(TBL, ux, L / 2);
    const yv = [0, Math.abs(ux[2]), ux[1] * Math.sign(-ux[2])];
    void TB;
    P('5', O(api.sub('P460'), c, yv, ux), [0, -0.05, 0.12]);
  }

  // ---------------------------------------------------------------- aspiration : 2, 9, 8
  const elS = () => ACC.elbow(S, { a: 24, aType: 'orb' });
  const lozenge = (x0, x1, mat, holeR) => {
    const s = new THREE.Shape();
    s.moveTo(-0.019, 0.026); s.absarc(0, 0.026, 0.019, Math.PI, 0, true);
    s.lineTo(0.025, 0); s.absarc(0, -0.026, 0.019, 0, -Math.PI, true); s.lineTo(-0.025, 0); s.closePath();
    if (holeR) { const h = new THREE.Path(); h.absarc(0, 0, holeR, 0, Math.PI * 2, true); s.holes.push(h); }
    for (const zz of [-0.026, 0.026]) { const h = new THREE.Path(); h.absarc(0, zz, 0.0055, 0, Math.PI * 2, true); s.holes.push(h); }
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.abs(x1 - x0), bevelEnabled: false, curveSegments: 8 });
    g.rotateY(-Math.PI / 2);
    g.translate(Math.max(x0, x1), YP, 0);
    return merged([new THREE.Mesh(S.creaseNormals(g))], mat);
  };
  for (let i = 0; i < 3; i++) {
    P('2', onCyl(i, at(torus(0.0185, 0.0018, 'rubber', { axis: 'x' }), [XF + 0.0009, YP, 0])), [0.06, ...out(i, 0.1).slice(1)]);
    // 9 — bride ORB -24 losangée (épaisseur 22 mm), bossage taraudé, deux vis CHC 3/8 × 1 1/4.
    P('9', onCyl(i, group(
      lozenge(XF, XS, 'darkSteel', 0),
      at(cyl(0.024, 0.004, 'darkSteel', { axis: 'x', seg: 28 }), [XS + 0.002, YP, 0]),
      merged([-0.026, 0.026].map((z) => at(bolt(I(0.375), I(1.25), 'blackOxide', { axis: 'x', washer: true }), [XS, YP, z])), 'blackOxide'),
    )), [0.12, ...out(i, 0.08).slice(1)]);
    P('8', onCyl(i, O(elS(), [XE, YP, 0], [1, 0, 0], [0, 1, 0])), [0.2, ...out(i, 0.15).slice(1)]);
  }

  // ---------------------------------------------------------------- refoulement : 3, 7, 6 / 8
  const ears = () => {
    const s = new THREE.Shape();
    s.moveTo(-0.036, -0.036); s.lineTo(0.036, -0.036); s.lineTo(0.036, 0.036); s.lineTo(0.013, 0.057); s.lineTo(-0.013, 0.057); s.lineTo(-0.036, 0.036); s.closePath();
    const h = new THREE.Path(); h.absarc(0, 0, 0.0195, 0, Math.PI * 2, true); s.holes.push(h);
    for (const [zz, yy] of [[-0.026, 0], [0.026, 0], [0, 0.044]]) { const p = new THREE.Path(); p.absarc(zz, yy, 0.0055, 0, Math.PI * 2, true); s.holes.push(p); }
    return s;
  };
  const flat = (shape, x0, x1, mat) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false, curveSegments: 8 });
    g.rotateY(-Math.PI / 2);
    g.translate(x1, YP, 0);
    return merged([new THREE.Mesh(S.creaseNormals(g))], mat);
  };
  for (let i = 0; i < 3; i++) {
    P('3', onCyl(i, lozenge(XG, -XF, 'cream', 0.0185)), [-0.05, ...out(i, 0.05).slice(1)]);
    const bolts = [[YP, -0.026], [YP, 0.026], [YP + 0.044, 0]].map(([y, z]) => at(bolt(I(0.375), I(1.25), 'blackOxide', { axis: '-x', washer: true }), [X7, y, z]));
    P('7', onCyl(i, group(flat(ears(), X7, XG, 'darkSteel'), merged(bolts, 'blackOxide'))), [-0.1, ...out(i, 0.05).slice(1)]);
    if (i === 2) P('8', onCyl(i, O(elS(), [X7, YP, 0], [-1, 0, 0], [0, 1, 0])), [-0.18, ...out(i, 0.12).slice(1)]);
    else P('6', onCyl(i, O(ACC.straight(S, { a: 24, b: 24, aType: 'orb' }), [X7, YP, 0], [-1, 0, 0], [0, 1, 0])), [-0.18, ...out(i, 0.1).slice(1)]);
  }

  // ---------------------------------------------------------------- détail M : 13, 11, 12
  // Orifice 1/2 NPT au bas de la face arrière du carter (x = LR.rearX), sous le flasque.
  {
    const p0 = [LR.rearX, -0.128, -0.07];
    const e13 = ACC.elbow(S, { a: 8, b: 6 });
    P('13', O(e13, p0, [-1, 0, 0], [0, 0, -1]), [-0.12, -0.02, 0]);
    const [ox, oy] = e13.userData.out;
    const t13 = [p0[0] - oy, p0[1], p0[2] - ox]; // bout du cône -06, sortie vers −Z
    const tee11 = ACC.swivelTee(S, 6);
    P('11', O(tee11, t13, [0, 0, -1], [0, 1, 0]), [-0.12, 0.0, -0.06]);
    const run = tee11.userData.run;
    const t11 = [t13[0], t13[1], t13[2] - run[1]];
    P('12', O(ACC.swivelTee(S, 6), t11, [0, 0, -1], [-1, 0, 0]), [-0.12, 0.0, -0.1]);
  }

  void plate; void lathe;
  return { view: { dir: [-1.0, 0.7, 1.1] } };
}
