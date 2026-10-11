// P054 — Trousse de boyaux des vérins stinger 50/50, mât 10 pi HH : CX032353
// « HOSE KIT, 10' HH 50/50 STINGER » (liste page 55 ; page 54 : « NO
// ILLUSTRATION AVAILABLE »), repère 13 de l'avance P032. Seize flexibles -06
// (3/8 po, flexible compact deux tresses, Ø ext. 19 mm, rayon de courbure mini
// 63 mm = 2 1/2 po, marquage imprimé) à embouts sertis zingués, écrou tournant
// JIC 37° 9/16-18 (six pans 3/4 po) : HA06000-L = droit / droit, HA06002-L =
// droit / coude 90° court ; L = longueur hors tout en pouces (jusqu'à l'axe de
// l'écrou pour un coude) : 1 = 29, 2 = 57, 3 = 70, 4 = 10 1/4, 5 = 42, 6 = 43 po.
// Chaque tracé a la longueur libre de la liste (flèche ajustée, voir hoseAsm).
// Repère : celui de P032 (feed.js, mast.js) — axe du mât selon +Y (pied à
// y = 0), face avant (tête de rotation) vers +Z, +X à gauche sur la vue arrière
// de la page 32 ; P032 doit insérer la trousse à l'origine.
// Vérins stinger (P164) d'axe x = ±0.4, z = 0.1, fût de y = 0.6 à 2.3. Fût Ø 4 po
// d'après P152 (repère 1 « CLAMP, Ø4" U-BOLT FLAT BAND ») et le collier de P148 ;
// feed.js le dessine à 4 1/2 po : on garde RB = 0.057 tant que feed.js n'est pas
// repris (sinon les sièges s'enfonceraient dans son fût) ; à la reprise de P032,
// ZP = SZ − 0.0508 − 0.022. Quatre orifices tournés vers l'arrière (−Z), comme
// à la page 164 : D sous la tête haute (y = 2.21), C et A au bloc central
// (1.495 / 1.405, décalés de 14 mm de part et d'autre de l'axe), B au-dessus de
// la tête basse (0.69).
// Circuit (schéma P424) : sections LEFT / RIGHT UPPER et LOWER STINGER, deux
// lignes #6 chacune (A et B), arrivant par les coudes de traversée du mât (P130
// repère 7) ; chaque vérin a sa paire de clapets d'équilibrage 52 (CX000252), U
// pour la section haute, L pour la basse : orifice 1 vers le vérin (D pour U, B
// pour L), 2 vers le distributeur (ligne A), 3 pilote sur la ligne B, ligne qui
// alimente aussi C (U) ou A (L) par la cartouche 51 intégrée au vérin (P164
// repère 2). Huit boyaux par vérin.
//   · Vérin +X, vanne 36 (P150, tés tournants sous les coudes des orifices 2 et
//     3) : traversées 0.25 → té 2 U et 0.30 → té 3 U (57 ×2), 0.80 → té 2 L (42)
//     et 0.85 → té 3 L (43) ; orifice 1 U → D en demi-tour sous la vanne (43),
//     orifice 1 L → B (42) ; té 3 U → C et té 3 L → A (10 1/4 ×2). Sortie libre
//     de chacun des tés des orifices 2 bouchée (branche du té 2 U, passage du
//     té 2 L).
//   · Vérin −X, vanne 35 (P148, coudes seuls) : traversées 0.25 → orifice 2 U et
//     0.30 → orifice 2 L (70 ×2), 0.85 → C (42) et 0.80 → A (43) ; orifice 1 U →
//     D (42), orifice 1 L → B (43) ; C → orifice 3 U et A → orifice 3 L (29 ×2).
//     Ces piquages supposent un té sur les orifices C et A du vérin −X (passage
//     selon −Z, branche vers l'extérieur sur C, vers le bas sur A) : té absent
//     des listes P148, P164 et P054, à confirmer sur la machine ; non dessiné
//     ici (sièges seulement).
//   Repérage des traversées estimé (tubes du mât P130 non suivis).
// Vannes (KIT054) d'après P032, P148 et P150 : deux corps empilés selon Z, face
// gravée 1-2-3 vers l'arrière (−Z), orifices 1 dessous, coudes des orifices 2
// et 3 tournés vers le bas. 36 sur le flanc extérieur arrière du vérin +X
// (orifice 2 face −X, 3 face +X), corps L devant (z −0.0125), U derrière
// (−0.0575). 35 derrière le fût −X, plaque de son collier (P148 repère 2)
// tangente à la face arrière du fût (z 0.043), corps L contre la plaque
// (0.0125), U derrière (−0.0325), orifice 2 face +X, 3 face −X.
// Écarts aux dessins, faute de cotes : 36 en (0.496, 1.622, −0.035), plus près
// du fût et plus haut que sur P032 (≈ 0.55, 1.55, 0), pour que les 10 1/4 po
// (0.152 m libres) joignent C et A ; branches des tés tournants orientées selon
// les tracés (P150 les montre vers l'extérieur) : té 3 U vers l'arrière, 4.8°
// vers l'extérieur, tés 2 L et 3 L à 45° vers l'arrière ; coude de A incliné de
// 6° vers le bas ; 35 à y = 1.72 (2 cm plus haut) pour que la descente de
// l'orifice 1 L passe au-dessus du té de C.
// À reprendre dans feed.js : 35 y est encore sur +X et 36 sur −X, alors que la
// page 32 met 36 sur le vérin +X (gauche de la vue arrière) et 35 sur −X.
// Les boyaux ne sont pas dessinés (note 1 de la page 34) : tracés estimés,
// tenus le long du fût (colliers P032 repère 26), mou logé en ondulations
// derrière le fût ; aucun derrière le mât (zone balayée par la plaque MCP) :
// chaque ligne reste sur le flanc de son vérin, derrière le fût ou entre vérin
// et mât (|x| ≥ 0.275).
// Encombrement ≈ 1.22 (X, de −0.61 à 0.61) × 1.99 (Y, de 0.24 à 2.22) × 0.29
// (Z, de −0.21 à 0.08) m.
import { MAST } from '../mast.js';

const IN = 0.0254;
const R_HOSE = 0.0095; // flexible -06 compact deux tresses, Ø 19 mm
// Embouts : droit (siège → bout de la douille), coude 90° (siège → axe du
// boyau, axe de l'écrou → bout de la douille).
const LS = 0.056, DROP = 0.04, LE = 0.052;

// Vérins stinger (feed.js) et leurs orifices, sièges JIC à 22 mm du fût.
const SX = 0.4, SZ = 0.1, RB = 0.057, YC = 1.45;
const ZP = SZ - RB - 0.022;
const PORT = { D: 2.21, C: 1.495, A: 1.405, B: 0.69 };
// Élévation de P164 (orifices face à l'observateur, D en haut) : C 14 mm à
// gauche de l'axe, A 14 mm à droite ; vus de l'arrière (−Z), la gauche est +X.
const DXP = { D: 0, C: 0.014, A: -0.014, B: 0 };
// Coudes de traversée du mât (P130 repère 7) : bout du mamelon, axe ±X.
const XB = MAST.width / 2 + 0.036, ZB = 0.05;
// Corps CX000252 : 55 (X) × 60 (Y) × 45 (Z) mm, empilés selon Z.
const BODY = 0.045;

// Points exportés pour P032 : centres des vannes (milieu de la pile de deux
// corps), z des corps U et L, plaque de 35 ; traversées utilisées.
export const KIT054 = {
  stinger: { x: SX, z: SZ, yc: YC, ports: PORT, dx: DXP, seatZ: ZP },
  // 36 (P150) : flanc extérieur arrière du vérin +X, au-dessus du bloc central.
  v36: { c: [0.496, YC + 0.172, -0.035], stack: 'z', U: -0.035 - BODY / 2, L: -0.035 + BODY / 2 },
  // 35 (P148) : derrière le fût −X, plaque tangente au fût (z = SZ − RB).
  v35: { c: [-0.4, 1.72, -0.01], stack: 'z', U: -0.0325, L: 0.0125, plateZ: SZ - RB },
  bulkheads: { '+X': [0.25, 0.3, 0.8, 0.85], '-X': [0.25, 0.3, 0.8, 0.85] },
};

export default function P054(api) {
  const { THREE } = api;
  const { nut, lathe, merged, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const v3 = (a) => new THREE.Vector3(...a);
  const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
  const NX = [-1, 0, 0], NY = [0, -1, 0], NZ = [0, 0, -1];

  // ---------------------------------------------------------- embouts sertis
  // Profil commun : écrou tournant (six pans), collet, douille sertie à deux
  // gorges de sertissage, bord roulé d'où sort le flexible.
  const ferrule = (y0, y1) => [
    [0, y0], [0.0072, y0], [0.0072, y0 + 0.002], [0.0117, y0 + 0.002], [0.0125, y0 + 0.0035],
    ...[0.36, 0.68].flatMap((t) => {
      const y = y0 + 0.002 + (y1 - y0 - 0.002) * t;
      return [[0.0125, y - 0.0024], [0.0118, y - 0.0015], [0.0118, y + 0.0015], [0.0125, y + 0.0024]];
    }),
    [0.0125, y1 - 0.003], [0.0114, y1], [0.01, y1], [0, y1],
  ];
  const nose = () => lathe([[0, 0.003], [0.0046, 0.003], [0.006, 0.0055], [0.006, 0.0165], [0, 0.0165]], 'zinc', { seg: 10 });
  const hexNut = () => nut(0.75 * IN, 0.016, 'zinc', { pos: [0, 0.008, 0] });
  // Embout droit le long de +Y local, siège à l'origine.
  const straightLocal = () => [
    hexNut(), nose(),
    lathe([[0, 0.0145], [0.0068, 0.0145], [0.0068, 0.0172], [0.0088, 0.0178], [0.0094, 0.0195], [0.0094, 0.0212], [0.0082, 0.022],
      ...ferrule(0.022, LS).slice(1)], 'zinc', { seg: 12 }),
  ];
  // Coude 90° court : écrou selon +Y, tube cintré vers +X, douille selon +X.
  const elbowLocal = () => {
    const rb = DROP - 0.024, pts = [new THREE.Vector3(0, 0.012, 0), new THREE.Vector3(0, 0.024, 0)];
    for (let i = 1; i <= 5; i++) {
      const a = (i / 5) * Math.PI / 2;
      pts.push(new THREE.Vector3(rb - rb * Math.cos(a), 0.024 + rb * Math.sin(a), 0));
    }
    pts.push(new THREE.Vector3(0.0195, DROP, 0));
    const bend = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.0068, 10, false));
    const fer = lathe(ferrule(0.0175, LE), 'zinc', { seg: 12, axis: 'x' });
    fer.position.y = DROP;
    return [hexNut(), nose(), bend, fer];
  };
  // Raccord placé : siège s, axe a (vers le flexible), coude t (sortie du flexible).
  function fitting(s, a, t) {
    const Yl = v3(a).normalize();
    const Xl = t ? v3(t).normalize() : new THREE.Vector3(Math.abs(Yl.y) > 0.9 ? 1 : 0, Math.abs(Yl.y) > 0.9 ? 0 : 1, 0).cross(Yl).normalize();
    const Zl = new THREE.Vector3().crossVectors(Xl, Yl);
    const g = new THREE.Group();
    (t ? elbowLocal() : straightLocal()).forEach((o) => g.add(o));
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xl, Yl, Zl));
    g.position.copy(v3(s));
    const exit = t ? v3(s).addScaledVector(Yl, DROP).addScaledVector(Xl, LE) : v3(s).addScaledVector(Yl, LS);
    return { obj: g, exit, dir: t ? Xl.clone() : Yl.clone() };
  }

  // ---------------------------------------------------------------- tracé
  // Courbe d'Hermite (Bézier cubiques) des sorties d'embouts par les points
  // de passage ; la flèche k décale un point de passage (slack.d) pour que la
  // longueur libre égale celle de la liste.
  function path(pa, ta, pb, tb, vias, tans) {
    const pts = [pa, ...vias, pb];
    const T = pts.map((p, i) => {
      if (i === 0) return ta.clone();
      if (i === pts.length - 1) return tb.clone().negate();
      if (tans && tans[i - 1]) return v3(tans[i - 1]).normalize();
      return pts[i + 1].clone().sub(pts[i - 1]).normalize();
    });
    const c = new THREE.CurvePath();
    for (let i = 0; i < pts.length - 1; i++) {
      const h = pts[i].distanceTo(pts[i + 1]) * 0.39;
      c.add(new THREE.CubicBezierCurve3(pts[i], pts[i].clone().addScaledVector(T[i], h),
        pts[i + 1].clone().addScaledVector(T[i + 1], -h), pts[i + 1]));
    }
    return c;
  }
  function minBend(curve) {
    const n = Math.max(40, Math.round(curve.getLength() / 0.008));
    const p = []; for (let i = 0; i <= n; i++) p.push(curve.getPointAt(i / n));
    let r = Infinity;
    for (let i = 1; i < n; i++) {
      const a = p[i - 1].distanceTo(p[i]), b = p[i].distanceTo(p[i + 1]), c = p[i - 1].distanceTo(p[i + 1]);
      const s = (a + b + c) / 2, area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
      if (area > 1e-12) r = Math.min(r, (a * b * c) / (4 * area));
    }
    return r;
  }

  // Marquage imprimé du flexible (référence, norme, pression) : tirets clairs
  // le long d'une génératrice, comme sur un boyau neuf.
  function layline(curve, len) {
    const n = Math.max(8, Math.round(len / 0.006));
    const fr = curve.computeFrenetFrames(n, false);
    const r = R_HOSE + 0.0002, da = 0.0008 / r, a0 = 0.6;
    const pos = [], nor = [];
    const at = (i, a) => {
      const p = curve.getPointAt(i / n), c = Math.cos(a), sn = Math.sin(a);
      const d = fr.normals[i].clone().multiplyScalar(c).addScaledVector(fr.binormals[i], sn);
      return [p.addScaledVector(d, r), d];
    };
    for (let i = 0; i < n; i++) {
      const s0 = (i / n) * len;
      if (s0 < 0.02 || s0 > len - 0.025 || (s0 % 0.042) > 0.03) continue; // tirets de 30 mm
      const [p00, d00] = at(i, a0 - da), [p01, d01] = at(i, a0 + da);
      const [p10, d10] = at(i + 1, a0 - da), [p11, d11] = at(i + 1, a0 + da);
      for (const [p, d] of [[p00, d00], [p11, d11], [p10, d10], [p00, d00], [p01, d01], [p11, d11]]) {
        pos.push(p.x, p.y, p.z); nor.push(d.x, d.y, d.z);
      }
    }
    if (!pos.length) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    const m = merged([new THREE.Mesh(geo)], 'grey');
    m.userData.noEdges = true;
    return m;
  }

  // Boyau : catalogue L (po), extrémités { s, a, t? } (t = coude), passages ;
  // flèche : un point de passage (slack.i, slack.d) ou plusieurs (tableaux),
  // déplacés ensemble de k fois leur direction.
  function hoseAsm(L, ea, eb, vias = [], { tans, slack } = {}) {
    const fa = fitting(ea.s, ea.a, ea.t), fb = fitting(eb.s, eb.a, eb.t);
    const free = L * IN - (ea.t ? LE : LS) - (eb.t ? LE : LS);
    const si = slack ? [slack.i].flat() : [];
    const sd = slack ? (Array.isArray(slack.d[0]) ? slack.d : si.map(() => slack.d)) : [];
    const make = (k) => path(fa.exit, fa.dir, fb.exit, fb.dir,
      vias.map((p, i) => (si.includes(i) ? v3(p).addScaledVector(v3(sd[si.indexOf(i)]), k) : v3(p))), tans);
    let k = 0, curve = make(0);
    const len0 = curve.getLength();
    if (slack && len0 < free) {
      let lo = 0, hi = 0.6;
      for (let it = 0; it < 40; it++) {
        k = (lo + hi) / 2;
        if (make(k).getLength() < free) lo = k; else hi = k;
      }
      curve = make(k);
    }
    const len = curve.getLength();
    const n = Math.max(10, Math.min(120, Math.round(len / 0.02)));
    const body = merged([new THREE.Mesh(new THREE.TubeGeometry(curve, n, R_HOSE, 10, false))], 'hose');
    body.geometry.userData.edgeAngle = 70;
    const ends = merged([fa.obj, fb.obj], 'zinc');
    const g = group(body, ends, layline(curve, len));
    // Contrôle : longueur de la liste / longueur du tracé, flèche, rayon mini.
    g.userData.hoseCheck = { L, free, len0, len, k, rmin: minBend(curve) };
    Object.defineProperty(g.userData.hoseCheck, 'curve', { value: curve, enumerable: false });
    return g;
  }

  // ------------------------------------------------------- points de raccord
  // Orifices des vérins (face arrière) : écrou selon −Z.
  const port = (s, k, t) => ({ s: [s * SX + DXP[k], PORT[k], ZP], a: NZ, t });
  // Coudes de traversée du mât (P130 repère 7), flanc s : écrou selon ±X.
  const bk = (s, y, t) => ({ s: [s * XB, y, ZB], a: [s, 0, 0], t });
  const unit = (a) => v3(a).normalize().toArray();

  // Vanne 36 (P150) : corps L devant (z −0.0125), U derrière (−0.0575) ;
  // orifices 1 dessous (adaptateurs droits), coudes des orifices 2 (face −X)
  // et 3 (face +X) tournés vers le bas, tés pendus dessous : passage vertical
  // (sortie à 85 mm sous le centre), branche horizontale à 60 mm.
  const { c: [x36, y36], U: zU, L: zL } = KIT054.v36;
  const H2 = Math.SQRT1_2;
  const tee36 = (dx, z) => ({ s: [x36 + dx, y36 - 0.085, z], a: NY });
  // Branche du té 3 U vers l'arrière, tournée de 4.8° vers l'extérieur ; celles
  // des tés 2 L et 3 L à 45° vers l'arrière (intérieur / extérieur) ; branche du
  // té 2 U et passage du té 2 L bouchés.
  const BU = (4.8 * Math.PI) / 180, aU = [Math.sin(BU), 0, -Math.cos(BU)];
  const V36 = {
    U1: { s: [x36, y36 - 0.055, zU], a: NY }, L1: { s: [x36, y36 - 0.055, zL], a: NY },
    U2r: tee36(-0.05, zU), L2b: { s: [x36 - 0.05 - 0.025 * H2, y36 - 0.06, zL - 0.025 * H2], a: [-H2, 0, -H2] },
    U3r: tee36(0.05, zU), U3b: { s: [x36 + 0.05 + 0.025 * aU[0], y36 - 0.06, zU + 0.025 * aU[2]], a: aU },
    L3r: tee36(0.05, zL), L3b: { s: [x36 + 0.05 + 0.025 * H2, y36 - 0.06, zL - 0.025 * H2], a: [H2, 0, -H2] },
  };
  // Coude du 10 1/4 sur la branche du té 3 U : tourné vers l'orifice C (plan
  // normal à la branche) ; coude de A incliné de 6° vers le bas.
  const toC = (() => {
    const b = V36.U3b.s.map((v, i) => v + DROP * aU[i]);
    const d = [SX + DXP.C - b[0], PORT.C - b[1], ZP - LS - b[2]];
    const k = d[0] * aU[0] + d[1] * aU[1] + d[2] * aU[2];
    return unit(d.map((v, i) => v - k * aU[i]));
  })();
  const tA = [Math.cos((-6 * Math.PI) / 180), Math.sin((-6 * Math.PI) / 180), 0];

  // Vanne 35 (P148) : corps L devant (contre la plaque, z 0.0125), U derrière
  // (−0.0325) ; orifices 1 dessous, coudes des orifices 2 (face +X) et 3
  // (face −X) tournés vers le bas.
  const { c: [x35, y35], U: wU, L: wL } = KIT054.v35;
  const V35 = {
    U1: { s: [x35, y35 - 0.055, wU], a: NY }, L1: { s: [x35, y35 - 0.055, wL], a: NY },
    U2: { s: [x35 + 0.05, y35 - 0.03, wU], a: NY }, L2: { s: [x35 + 0.05, y35 - 0.03, wL], a: NY },
    U3: { s: [x35 - 0.05, y35 - 0.03, wU], a: NY }, L3: { s: [x35 - 0.05, y35 - 0.03, wL], a: NY },
  };
  // Tés supposés sur C et A du vérin −X (hors listes) : passage selon −Z,
  // branche dans le plan de l'orifice (C : vers l'extérieur, A : vers le bas).
  const teeR = (k) => ({ s: [-SX + DXP[k], PORT[k], ZP - 0.045], a: NZ });
  const teeB = (k, d) => ({ s: [-SX + DXP[k] + 0.025 * d[0], PORT[k] + 0.025 * d[1], ZP - 0.022], a: d });

  const hoses = [];
  const H = (ref, L, ea, eb, vias, opts, e) => hoses.push({ ref, obj: hoseAsm(L, ea, eb, vias, opts), e });

  // ----------------------------------------------------- flanc +X : vérin +X, vanne 36
  // Pilotes : C → branche du té 3 U (coude tourné vers C) ; A (coude vers
  // l'extérieur) → passage du té 3 L, en crosse sous la vanne, derrière la
  // descente de l'orifice 1 L.
  H('4', 10.25, port(1, 'C'), { ...V36.U3b, t: toC },
    [],
    {}, [0.1, 0, -0.25]);
  H('4', 10.25, port(1, 'A', tA), V36.L3r,
    [],
    {}, [0.22, 0, -0.4]);
  // Section haute : traversées 0.30 → té 3 U (ligne B) et 0.25 → té 2 U (ligne A),
  // derrière le fût, la ligne B passant devant la ligne A au pied.
  H('2', 57, V36.U3r, bk(1, 0.3),
    [[0.556, 1.094, -0.058], [0.587, 0.568, -0.022], [0.468, 0.36, 0.028], [0.396, 0.311, 0.047]],
    { tans: [[0.058, -0.998, 0.026], [0.042, -0.992, 0.118], [-0.612, -0.744, 0.267], null], slack: { i: 1, d: NZ } }, [0.22, 0, -0.7]);
  H('2', 57, V36.U2r, bk(1, 0.25),
    [[0.437, 1.009, -0.045], [0.489, 0.455, -0.042], [0.403, 0.286, 0.022]],
    { tans: [[-0.064, -0.993, 0.095], [-0.057, -0.988, 0.145], null], slack: { i: 1, d: NZ } }, [0.1, 0, -0.4]);
  // Section basse : 0.80 → té 2 L (ligne A) derrière le fût puis par l'intervalle
  // vérin / mât, coude de traversée vers l'arrière ; 0.85 → té 3 L (ligne B, coude
  // sur la branche à 45°) par l'arrière extérieur, puis derrière les autres lignes.
  H('5', 42, V36.L2b, bk(1, 0.8, NZ),
    [[0.343, 1.497, -0.116], [0.454, 1.275, -0.147], [0.362, 1.001, -0.07], [0.304, 0.865, -0.067]],
    { tans: [NY, [0.571, -0.739, -0.358], [-0.517, -0.759, 0.395], NY], slack: { i: [1, 2], d: [NZ, NZ] } }, [0.1, 0, -0.55]);
  H('6', 43, { ...V36.L3b, t: NY }, bk(1, 0.85),
    [[0.597, 1.317, -0.087], [0.413, 1.238, -0.135], [0.366, 1.098, -0.101], [0.392, 0.917, -0.082], [0.387, 0.85, -0.015]],
    { tans: [[-0.105, -0.939, -0.327], [-0.953, -0.289, 0.096], [0.198, -0.969, 0.15], NY, Z], slack: { i: 1, d: NZ } }, [0.22, 0, -0.25]);
  // Orifice 1 U → D : demi-tour sous la vanne puis montée derrière le fût.
  H('6', 43, V36.U1, port(1, 'D', NY),
    [[0.496, 1.441, -0.13], [0.496, 1.511, -0.2], [0.494, 1.863, -0.192], [0.407, 2.095, -0.036]],
    { tans: [NZ, Y, [-0.68, 0.633, -0.371], null], slack: { i: [0, 1], d: [NY, NY] } }, [0.1, 0, -0.7]);
  // Orifice 1 L → B : descente devant la crosse de A, détour par le flanc
  // extérieur devant les lignes de la section haute, coude de B vers le haut et
  // l'extérieur.
  H('5', 42, V36.L1, port(1, 'B', [Math.SQRT1_2, Math.SQRT1_2, 0]),
    [[0.479, 1.381, 0.028], [0.471, 1.329, 0.014], [0.589, 1.129, 0.002], [0.597, 0.968, 0.072], [0.516, 0.801, -0.028]],
    { tans: [NY, [-0.236, -0.892, -0.385], [0.099, -0.843, 0.529], NY, null], slack: { i: 3, d: [0.3, -1, 0] } }, [0.22, 0, -0.55]);

  // ----------------------------------------------------- flanc −X : vérin −X, vanne 35
  // Traversée 0.30 → orifice 2 L : intervalle vérin / mât, puis derrière la tête
  // basse vers l'extérieur et arrivée par le haut ; 0.25 → orifice 2 U : derrière
  // le fût, arrivée par l'arrière.
  H('3', 70, V35.L2, bk(-1, 0.3),
    [[-0.325, 1.573, 0.013], [-0.288, 1.495, 0.012], [-0.276, 1.089, -0.025], [-0.293, 0.814, -0.045], [-0.443, 0.605, -0.027], [-0.534, 0.437, 0.015]],
    { tans: [[0.574, -0.818, 0.033], [0.12, -0.991, -0.063], [0.003, -0.989, -0.145], [-0.102, -0.995, -0.023], [-0.763, -0.637, 0.109], [-0.263, -0.915, 0.306]], slack: { i: 5, d: NX } }, [-0.1, 0, -0.25]);
  H('3', 70, V35.U2, bk(-1, 0.25),
    [[-0.351, 1.279, -0.033], [-0.343, 0.931, -0.016], [-0.386, 0.523, -0.169], [-0.392, 0.317, -0.082], [-0.387, 0.25, -0.015]],
    { tans: [NY, [0.357, -0.69, 0.63], [0.791, -0.564, 0.237], NY, Z], slack: { i: [1, 2], d: [NZ, NZ] } }, [-0.1, 0, -0.4]);
  // Traversées 0.85 / 0.80 → passages des tés de C et A (coudes vers le bas),
  // derrière le fût et le sélecteur 37, arrivée par l'arrière.
  H('5', 42, { ...teeR('C'), t: NY }, bk(-1, 0.85),
    [[-0.34, 1.347, -0.123], [-0.499, 1.159, -0.178], [-0.414, 0.974, -0.072], [-0.392, 0.917, -0.082], [-0.387, 0.85, -0.015]],
    { tans: [[0.444, -0.565, -0.695], [-0.655, -0.663, 0.363], [0.518, -0.789, -0.332], NY, Z], slack: { i: 1, d: [-0.6, 0, -0.8] } }, [-0.1, 0, -0.7]);
  H('6', 43, { ...teeR('A'), t: NY }, bk(-1, 0.8),
    [[-0.434, 1.255, -0.077], [-0.582, 1.096, -0.158], [-0.461, 0.953, -0.128], [-0.39, 0.865, -0.152], [-0.395, 0.8, -0.087], [-0.387, 0.8, -0.015]],
    { tans: [null, [-0.333, -0.851, 0.406], [0.811, -0.513, -0.282], NY, Z, Z], slack: { i: 1, d: [-0.8, 0, -0.6] } }, [-0.22, 0, -0.25]);
  // Orifice 1 U → D : coude vers l'arrière, montée en hélice par le flanc
  // extérieur du fût ; orifice 1 L → B : dévié vers le mât sous la vanne pour
  // passer le té de C, coude de B tourné vers le haut et le mât.
  H('5', 42, { ...V35.U1, t: NZ }, port(-1, 'D'),
    [[-0.4, 1.69, -0.15], [-0.498, 1.906, -0.082], [-0.496, 1.995, -0.082], [-0.4, 2.145, -0.1]],
    { tans: [Y, [-0.451, 0.741, 0.497], [0.443, 0.72, -0.535], Y], slack: { i: [1, 2], d: [[-0.6, 0, 0.8], [-0.6, 0, 0.8]] } }, [-0.1, 0, -0.55]);
  H('6', 43, V35.L1, port(-1, 'B', [Math.SQRT1_2, Math.SQRT1_2, 0]),
    [[-0.356, 1.535, 0.013], [-0.31, 1.459, 0.013], [-0.358, 1.131, -0.07], [-0.295, 0.836, -0.014]],
    { tans: [[0.788, -0.615, 0], NY, NY, NY], slack: { i: 2, d: [0.4, 0, -0.9] } }, [-0.22, 0, -0.55]);
  // Pilotes : branches des tés de C (vers l'extérieur) et de A (vers le bas) →
  // orifices 3 U et L, en boucles pendantes le long du flanc extérieur du fût.
  H('1', 29, teeB('C', NX), V35.U3,
    [[-0.59, 1.405, -0.036], [-0.52, 1.336, -0.033], [-0.45, 1.405, -0.032]],
    { tans: [NY, X, Y], slack: { i: 1, d: NY } }, [-0.22, 0, -0.4]);
  H('1', 29, teeB('A', NY), V35.L3,
    [[-0.494, 1.232, 0.006], [-0.569, 1.31, 0.012], [-0.57, 1.444, 0.012], [-0.503, 1.55, 0.012]],
    { tans: [NX, Y, Y, [0.725, 0.689, 0.004]], slack: { i: 0, d: NY } }, [-0.22, 0, -0.7]);

  hoses.forEach(({ ref, obj, e }) => P(ref, obj, e));
  return { view: { dir: [0.6, 0.45, -1.0] } };
}
