// P338 — Pompe à eau équipée CX034743 « ASSY, WATER PUMP, DU311 » (page
// 338 : vue éclatée et vue assemblée), repère 11 de P208. Pompe triplex (6 =
// P340) entraînée par un moteur hydraulique à engrenages à bride SAE A deux
// trous (7) : support-bride en équerre (1) — semelle de 1/2 po boulonnée sur
// la tablette par quatre vis H 3/8-16 × 1 1/4 po (18) à rondelles Nord-Lock
// (22), flasque vertical alésé pour le centrage du moteur, deux goussets ;
// moteur fixé par deux vis CHC 1/2-13 × 1 1/4 po (19) à rondelles Grower à
// haut collet (20) ; accouplement à mâchoires (8, deux moyeux et étoile
// élastomère) et clavette (5) sous le capot d'accouplement (2, tôle pliée en
// pont, trappe de visite, pattes vissées sur la semelle par quatre vis H
// 1/4-20 × 3/4 po (17) et rondelles Nord-Lock (21)) ; protecteur conique (4)
// sur le bout d'arbre opposé. Moteur : adaptateurs ORB → JIC -08 (13) sur ses
// deux orifices. Tête : té de dérivation 3/4 (15) dans l'orifice de
// refoulement, régulateur-déchargeur (3) vissé sur le té (volant en T), raccord
// 3/4 NPT → JIC -06 (11) à l'autre bout du té, raccords 3/4 NPT → JIC -08
// (12) à la sortie et au retour (by-pass) du déchargeur. Aspiration : coude
// mâle 1 NPT (16) sous le collecteur, électrovanne 1 po (9 = P346, bobine
// tournée vers l'extérieur) et coude 1 NPT → JIC -16 (10) d'arrivée d'eau.
// Vidange du carter : adaptateur BSPP 1/4 → JIC -06 à joint torique (14).
// Repère : machine (P208 le place à l'identité) ; l'ensemble est construit
// dans le repère de P340 (origine sur le plan d'appui de la pompe, X le long
// du vilebrequin vers le moteur, +Z vers la tête) puis tourné de 180° autour
// de Y et posé en WP = (0.80, 1.00, 0.36) (../_fronta.js) : pompe sur une
// tablette à droite du pont avant (au niveau du dessus du châssis), moteur
// hydraulique vers l'arrière, tête vers l'axe de la machine ; l'électrovanne
// pend sous le bord de la tablette (non fournie). Encombrement ≈ 0.53 (X) ×
// 0.55 (Y) × 0.40 (Z) m.
// Tout l'ensemble est sur le châssis avant (corps « front »).
import { body } from '../layout.js';
import { nptFitting, orient, orbAdapter } from '../../du311/parts/_chassis.js';
import { hhcs, shcs, nordLock, splitWasher } from '../../du311/parts/_avance_b.js';
import { IN, WP, nptThread } from './_fronta.js';
import { PUMPW } from './P340.js';
import { SOLW } from './P346.js';

const YA = PUMPW.ya;
const XB = 0.205; // flasque du support (face côté pompe)
const TP = 0.016; // épaisseur du flasque
const XM = XB + TP; // face d'appui du moteur

export default function P338(api) {
  const { THREE, S } = api;
  // Repère P340 → machine : demi-tour autour de Y, origine en WP ; corps « front ».
  const toM = (obj) => { const g = S.group(obj); g.rotation.y = Math.PI; g.position.set(WP.x, WP.y, WP.z); return body('front', g); };
  const P = (ref, obj, e = [0, 0, 0]) => api.part(ref, toM(obj), [-e[0], e[1], -e[2]]);
  const at = (o, p, r) => S.at(o, p, r);

  // ---------------------------------------------------------------- 6 — pompe (P340 sans son protecteur)
  P('6', api.sub('P340', { noProtector: true }), [0, 0, 0]);
  // 4 — protecteur conique du bout d'arbre côté −X.
  P('4', S.lathe([[0.018, 0], [0.034, 0], [0.034, 0.008], [0.028, 0.012], [0.014, 0.055], [0.01, 0.062], [0, 0.063]], 'black', { axis: '-x', seg: 32, pos: [-0.112, YA, 0] }), [-0.15, 0, 0]);

  // ---------------------------------------------------------------- 1 — support-bride en équerre
  {
    const t = 0.5 * IN;
    const base = S.plate(0.2, 0.21, t, 'grey', { r: 0.008, holes: [[-0.088, -0.09, 0.0052], [-0.088, 0.09, 0.0052], [0.088, -0.09, 0.0052], [0.088, 0.09, 0.0052]] });
    base.position.set(0.2, t / 2, 0);
    const flange = S.extrude([[-0.075, 0], [0.075, 0], [0.075, 0.105], [0.05, 0.15], [-0.05, 0.15], [-0.075, 0.105]], TP, 'grey', {
      holes: [[0, YA, 0.0415], [-0.0532, YA, 0.0055], [0.0532, YA, 0.0055]],
    });
    flange.rotation.y = Math.PI / 2;
    flange.position.set(XB + TP / 2, t, 0);
    const gus = [-1, 1].map((s) => { const g = S.extrude([[0, 0], [0.07, 0], [0, 0.085]], 0.01, 'grey'); g.position.set(XM, t, s * 0.07); return g; });
    const welds = [
      S.weld([[XM, t + 0.001, -0.075], [XM, t + 0.001, 0.075]], 0.006, 'grey'),
      S.weld([[XB, t + 0.001, -0.075], [XB, t + 0.001, 0.075]], 0.006, 'grey'),
    ];
    P('1', S.group(S.merged([base, flange, ...gus], 'grey'), S.merged(welds, 'grey')), [0.12, 0, 0]);
    // 18, 22 — vis H 3/8 × 1 1/4 et rondelles Nord-Lock de la semelle.
    for (const [x, z] of [[0.112, -0.09], [0.112, 0.09], [0.288, -0.09], [0.288, 0.09]]) {
      P('22', at(nordLock(S, THREE, 0.375), [x, t, z]), [0, 0.06, 0]);
      P('18', at(hhcs(S, THREE, 0.375, 1.25), [x, t + 0.22 * 0.375 * IN, z]), [0, 0.1, 0]);
    }
  }

  // ---------------------------------------------------------------- 8 — accouplement à mâchoires ; 5 — clavette
  const XC = 0.165; // plan de l'étoile
  {
    const hub = (x0, x1, rb) => S.lathe([[rb, x0], [0.027, x0], [0.027, x1], [rb, x1], [rb, x0]], 'castIron', { axis: 'x', seg: 28 });
    const jaws = [];
    for (let i = 0; i < 3; i++) for (const s of [0, 1]) {
      const a = (i / 3) * Math.PI * 2 + (s * Math.PI) / 3;
      jaws.push(S.box(0.012, 0.015, 0.015, 'castIron', { r: 0.002, pos: [XC + (s ? 0.004 : -0.004), YA + Math.cos(a) * 0.019, Math.sin(a) * 0.019], rot: [-a, 0, 0] }));
    }
    const ci = [hub(0.112, XC - 0.006, 0.012), hub(XC + 0.006, XC + 0.036, 0.011), ...jaws].map((o, k) => (k < 2 ? at(o, [0, YA, 0]) : o));
    const spider = [];
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + Math.PI / 6; spider.push(S.box(0.012, 0.012, 0.011, 'orange', { r: 0.003, pos: [XC, YA + Math.cos(a) * 0.019, Math.sin(a) * 0.019], rot: [-a, 0, 0] })); }
    spider.push(S.cyl(0.011, 0.012, 'orange', { axis: 'x', seg: 16, pos: [XC, YA, 0] }));
    const set = [];
    for (const x of [0.125, XC + 0.022]) set.push(S.lathe([[0, 0], [0.003, 0], [0.003, 0.004], [0, 0.004]], 'blackOxide', { seg: 6, pos: [x, YA + 0.0265, 0] }));
    P('8', S.group(S.merged(ci, 'castIron'), S.merged(spider, 'orange'), S.merged(set, 'blackOxide')), [0.04, 0.1, 0]);
  }
  P('5', S.box(0.025, 0.0048, 0.0048, 'steel', { r: 0.0005, pos: [0.13, YA + 0.0122, 0] }), [0, 0.12, 0]);

  // ---------------------------------------------------------------- 7 — moteur hydraulique à engrenages, bride SAE A 2 trous
  {
    const bk = [];
    // Bride ovale à deux oreilles, centrage Ø 3,25 po dans le flasque.
    const fl = new THREE.Shape();
    fl.moveTo(-0.068, -0.02);
    fl.absarc(-0.0532, 0, 0.02, Math.PI, Math.PI * 1.5, false);
    fl.lineTo(0.0532, -0.02);
    fl.absarc(0.0532, 0, 0.02, -Math.PI / 2, Math.PI / 2, false);
    fl.lineTo(-0.0532, 0.02);
    fl.absarc(-0.0532, 0, 0.02, Math.PI / 2, Math.PI, false);
    [-0.0532, 0.0532].forEach((z) => { const p = new THREE.Path(); p.absarc(z, 0, 0.0072, 0, Math.PI * 2, true); fl.holes.push(p); });
    const flG = new THREE.ExtrudeGeometry(fl, { depth: 0.012, bevelEnabled: false, curveSegments: 12 });
    S.creaseNormals(flG);
    const flM = new THREE.Mesh(flG);
    flM.rotation.y = Math.PI / 2; // (z, y) extrudé selon +X
    flM.position.set(XM, YA, 0);
    bk.push(flM);
    // Disque central de la bride (Ø 0.09) et centrage dans le flasque.
    bk.push(S.cyl(0.046, 0.012, 'blackCast', { axis: 'x', seg: 32, pos: [XM + 0.006, YA, 0] }));
    bk.push(S.cyl(0.041, 0.008, 'blackCast', { axis: 'x', seg: 32, pos: [XM - 0.004, YA, 0] }));
    // Corps à engrenages (deux lobes), couvercle arrière, vis d'assemblage.
    bk.push(S.box(0.07, 0.095, 0.07, 'blackCast', { r: 0.02, pos: [XM + 0.047, YA + 0.012, 0] }));
    bk.push(S.cyl(0.045, 0.07, 'blackCast', { axis: 'x', seg: 32, pos: [XM + 0.047, YA, 0] }));
    bk.push(S.box(0.02, 0.1, 0.075, 'blackCast', { r: 0.01, pos: [XM + 0.092, YA + 0.012, 0] }));
    // Bloc d'orifices sur la face +Z (deux orifices ORB -08 l'un au-dessus de l'autre).
    bk.push(S.box(0.045, 0.085, 0.02, 'blackCast', { r: 0.004, pos: [XM + 0.047, YA + 0.012, 0.042] }));
    const st = [];
    for (const [y, z] of [[0.045, 0.028], [0.045, -0.028], [-0.033, 0.028], [-0.033, -0.028]]) {
      st.push(at(S.group(S.lathe([[0, 0], [0.0055, 0], [0.0055, 0.0065], [0, 0.0065]], 'steel', { seg: 12 })), [XM + 0.102, YA + y + 0.006, z], [0, 0, -Math.PI / 2]));
    }
    // Arbre claveté Ø 7/8 po vers le moyeu d'accouplement.
    st.push(S.lathe([[0, 0], [0.0111, 0], [0.0111, 0.058], [0.0102, 0.06], [0, 0.06]], 'steel', { axis: '-x', seg: 20, pos: [XM - 0.008, YA, 0] }));
    P('7', S.group(S.merged(bk, 'blackCast'), S.merged(st, 'steel'), at(S.nameplate(0.04, 0.025), [XM + 0.047, YA + 0.04, -0.0355], [0, Math.PI, 0])), [0.22, 0, 0]);
    // 19, 20 — vis CHC 1/2 × 1 1/4 et rondelles à haut collet dans les oreilles.
    for (const z of [-0.0532, 0.0532]) {
      const t20 = 0.125 * IN;
      const w = S.group(splitWasher(S, THREE, 0.5)); w.scale.y = 1.15;
      P('20', orient(api, w, [XM + 0.012, YA, z], [1, 0, 0]), [0.26, 0, 0]);
      P('19', orient(api, shcs(S, THREE, 0.5, 1.25), [XM + 0.012 + t20 * 1.15, YA, z], [1, 0, 0]), [0.3, 0, 0]);
    }
    // 13 — adaptateurs ORB -08 → JIC -08 sur le bloc d'orifices.
    for (const y of [YA + 0.04, YA - 0.016]) {
      const a = orbAdapter(api, 8, 8);
      P('13', orient(api, a.obj, [XM + 0.047, y, 0.052], [0, 0, 1]), [0.2, 0, 0.06]);
    }
  }

  // ---------------------------------------------------------------- 2 — capot d'accouplement ; 17, 21 — fixation
  {
    const X0 = 0.112, X1 = XB - 0.004, H = 0.135, Zl = 0.058, t = 0.0024, tb = 0.5 * IN;
    const len = X1 - X0, xc = (X0 + X1) / 2;
    // Pont en tôle pliée (plis arrondis), pattes à plat sur la semelle.
    const sh = [
      S.box(len, t, 2 * Zl - 0.008, 'safety', { pos: [xc, H, 0] }),
      ...[-1, 1].map((s) => S.box(len, H - tb - 0.004, t, 'safety', { pos: [xc, (H + tb) / 2 - 0.002, s * Zl] })),
      ...[-1, 1].map((s) => S.cyl(0.004, len, 'safety', { axis: 'x', seg: 8, pos: [xc, H - 0.0028, s * (Zl - 0.0028)] })),
      ...[-1, 1].map((s) => S.box(len, t, 0.03, 'safety', { pos: [xc, tb + t / 2, s * (Zl + 0.014)] })),
    ];
    // Trappe de visite ronde (Ø 56) et ses deux vis.
    sh.push(S.cyl(0.028, 0.0016, 'safety', { seg: 28, pos: [xc, H + 0.002, 0] }));
    const scr = [-1, 1].map((s) => S.at(S.nut(0.008, 0.003, 'zinc'), [xc + s * 0.021, H + 0.0045, 0]));
    P('2', S.group(S.merged(sh, 'safety'), S.merged(scr, 'zinc')), [0, 0.14, 0]);
    for (const s of [-1, 1]) for (const x of [X0 + 0.018, X1 - 0.018]) {
      const pos = [x, tb + t, s * (Zl + 0.017)];
      P('21', at(nordLock(S, THREE, 0.25), pos), [0, 0.18, s * 0.03]);
      P('17', at(hhcs(S, THREE, 0.25, 0.75), [pos[0], pos[1] + 0.22 * 0.25 * IN, pos[2]]), [0, 0.22, s * 0.03]);
    }
  }

  // ---------------------------------------------------------------- refoulement : 15 té, 3 déchargeur, 11 et 12 raccords
  const [xA, yA, zA] = PUMPW.outlets[1];
  const rn = (1.05 * IN) / 2; // 3/4 NPT
  const yT = yA + 0.026; // axe du té et du déchargeur
  {
    // 15 — té de dérivation : branche mâle 3/4 NPT dans l'orifice, passage femelle selon X.
    const T = S.merged([
      S.lathe([[rn * 0.6, -0.018], ...nptThread(S, rn, -0.018, 0), [rn, 0], [rn * 1.3, 0.004], [rn * 1.3, 0.012], [rn * 0.6, 0.012]], 'zinc', { seg: 16 }),
      S.lathe([[rn * 0.97, -0.033], [rn * 1.35, -0.033], [rn * 1.42, -0.029], [rn * 1.42, 0.029], [rn * 1.35, 0.033], [rn * 0.97, 0.033]], 'zinc', { axis: 'x', seg: 20, pos: [0, 0.026, 0] }),
      S.cyl(rn * 1.3, 0.02, 'zinc', { seg: 20, pos: [0, 0.016, 0] }),
    ], 'zinc');
    P('15', at(T, [xA, yA, zA]), [0, 0.1, 0]);
  }
  // 3 — régulateur-déchargeur (laiton) : queue mâle dans le té (−X), corps, chapeau, volant en T, by-pass dessous, sortie au bout.
  const xU0 = xA - 0.033; // face du té côté −X
  const xUE = xU0 - 0.15; // bout de sortie
  {
    const br = [
      S.lathe([[0, 0], ...nptThread(S, rn, 0, 0.016).map(([r, y]) => [r, 0.016 - y]).reverse(), [0, 0.016]], 'brass', { axis: '-x', seg: 16, pos: [xU0 + 0.016, yT, zA] }),
      S.at(S.nut(0.032, 0.012, 'brass', { axis: 'x' }), [xU0 - 0.006, yT, zA]),
      S.lathe([[0, 0], [0.019, 0], [0.019, 0.1], [0.016, 0.104], [0, 0.104]], 'brass', { axis: '-x', seg: 28, pos: [xU0 - 0.012, yT, zA] }),
      S.box(0.04, 0.04, 0.034, 'brass', { r: 0.005, pos: [xUE + 0.035, yT, zA] }),
      S.lathe([[0, 0], [0.016, 0], [0.016, 0.006], [0.011, 0.012], [0.011, 0.045], [0.009, 0.05], [0, 0.05]], 'brass', { seg: 24, pos: [xU0 - 0.06, yT + 0.016, zA] }),
      S.at(S.nut(0.022, 0.008, 'brass'), [xU0 - 0.06, yT + 0.03, zA]),
    ];
    const st = [
      S.lathe([[0, 0], [0.004, 0], [0.004, 0.03], [0, 0.03]], 'steel', { seg: 10, pos: [xU0 - 0.06, yT + 0.066, zA] }),
      S.cyl(0.0035, 0.06, 'steel', { axis: 'z', seg: 10, pos: [xU0 - 0.06, yT + 0.094, zA] }),
    ];
    const knobs = [-1, 1].map((s) => S.lathe([[0, 0], [0.006, 0], [0.006, 0.012], [0.004, 0.014], [0, 0.014]], 'black', { axis: s > 0 ? 'z' : '-z', seg: 14, pos: [xU0 - 0.06, yT + 0.094, zA + s * 0.03] }));
    P('3', S.group(S.merged(br, 'brass'), S.merged(st, 'steel'), S.merged(knobs, 'black')), [-0.08, 0.12, 0]);
  }
  // 11 — 3/4 NPT → JIC -06 au bout +X du té ; 12 — sortie et by-pass du déchargeur.
  const put = (ref, f, pos, dir, side, e) => P(ref, orient(api, f.obj, pos, dir, side), e);
  put('11', nptFitting(api, { npt: 12, jic: 6 }), [xA + 0.033, yT, zA], [1, 0, 0], null, [0.08, 0.12, 0]);
  put('12', nptFitting(api, { npt: 12, jic: 8 }), [xUE + 0.015, yT, zA], [-1, 0, 0], null, [-0.14, 0.12, 0]);
  put('12', nptFitting(api, { npt: 12, jic: 8 }), [xUE + 0.035, yT - 0.02, zA], [0, -1, 0], null, [-0.12, 0.06, 0]);

  // ---------------------------------------------------------------- aspiration : 16 coude, 9 électrovanne, 10 coude
  const [xi, yi, zi] = PUMPW.inlet;
  const rn1 = (1.315 * IN) / 2;
  const L16 = 0.042; // bras du coude (axe à axe)
  {
    const e = [
      S.lathe([[rn1 * 0.7, 0], ...nptThread(S, rn1, 0, 0.02).map(([r, y]) => [r, 0.02 - y]).reverse(), [rn1 * 0.7, 0.02]], 'zinc', { seg: 18, pos: [0, -0.02, 0] }),
      S.cyl(rn1 * 1.25, L16 - 0.02, 'zinc', { seg: 20, pos: [0, -0.02 - (L16 - 0.02) / 2, 0] }),
      S.ball(rn1 * 1.25, 'zinc', { pos: [0, -L16, 0] }),
      S.cyl(rn1 * 1.25, L16 - 0.02, 'zinc', { axis: 'x', seg: 20, pos: [-(L16 - 0.02) / 2, -L16, 0] }),
      S.lathe([[rn1 * 0.7, 0], ...nptThread(S, rn1, 0, 0.02).map(([r, y]) => [r, 0.02 - y]).reverse(), [rn1 * 0.7, 0.02]], 'zinc', { axis: '-x', seg: 18, pos: [-(L16 - 0.02), -L16, 0] }),
    ];
    P('16', at(S.merged(e, 'zinc'), [xi, yi, zi]), [0, -0.08, 0]);
  }
  // 9 — électrovanne (P346) : sortie (+X de P346) sur le coude 16, entrée vers −X, bobine tournée vers +Z.
  const yV = yi - L16;
  const xV = xi - (L16 - 0.02) - 0.002 - SOLW.outlet.pos[0];
  const valve = api.sub('P346');
  valve.rotation.x = Math.PI / 2;
  P('9', at(S.group(valve), [xV, yV, zi]), [-0.05, -0.15, 0]);
  // 10 — coude 1 NPT → JIC -16 dans l'entrée, sortie vers le bas.
  put('10', nptFitting(api, { npt: 16, jic: 16, angle: 90 }), [xV + SOLW.inlet.pos[0], yV, zi], [-1, 0, 0], [0, -1, 0], [-0.12, -0.18, 0]);

  // ---------------------------------------------------------------- 14 — vidange du carter (BSPP 1/4 → JIC -06, joint torique)
  {
    const f = nptFitting(api, { npt: 4, jic: 6 });
    const g = S.group(f.obj, S.torus(0.0072, 0.0012, 'rubber', { pos: [0, 0.0006, 0] }));
    put('14', { obj: g }, PUMPW.drain, [1, 0, 0], null, [0.08, 0, 0]);
  }

  return { view: { dir: [-0.8, 0.7, -1.1] } };
}
