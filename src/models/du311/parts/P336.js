// P336 — Train de chenille CP004810 rév. 7 (page 336) : « TRACK ARRANGEMENT,
// 1 SET ». Chenille à chaîne acier et patins boulonnés, une seule chenille
// (la droite, RH) : les quantités de la liste sont celles d'une chenille
// (35 patins × 8 = 280 « vis de patin » : 4 vis et 4 écrous par patin, comme
// le dessin les montre ; 6 galets × 4 vis ; un réducteur, un barbotin). P328
// place cette chenille à droite et une copie en miroir (échelle Z = −1) à
// gauche.
// Pièces :
// - châssis de chenille (poutre-caisson soudée) : la liste en donne deux
//   repères, 1 « TRACK FRAME RH » et 2 « TRACK FRAME LH », alors qu'une seule
//   poutre est dessinée (repère 2) ; interprétés ici comme les deux flasques
//   de la même poutre : 1 = moitié extérieure (côté −Z : flanc percé du
//   regard de visite), 2 = moitié intérieure (côté +Z : plaque-couronne du
//   réducteur, console d'appui du châssis porteur) ; à confirmer ;
// - 3 deux guides de chaîne sous l'avant du châssis (5 vis 4 et rondelles 5
//   chacun), 6 vis traversante et 7 écrou qui les entretoisent ;
// - 8 couvercle du regard (accès au graisseur du tendeur) et 2 vis 9 ;
// - 10 réducteur et moteur (P338) boulonné sur la plaque-couronne par 20 vis
//   11 et rondelles 12 ; 13 barbotin (21 dents, une dent sur deux en prise)
//   sur la bride du moyeu, 18 vis 14 et rondelles 15 ;
// - 16 chaîne (maillons, axes et bagues) de 35 pas, 19 maillon de jonction
//   (« TRACK SHOES » : jeu complet livré, figuré par la jonction démontable
//   pour ne pas dessiner deux fois les patins), 17 trente-cinq patins à double
//   arête, 18 deux cent quatre-vingts vis et écrous de patin ;
// - 20 roue folle et sa chape, 21 vérin tendeur à ressort de rappel (bride
//   fixée sur la cloison intérieure du châssis par 2 vis 22 et rondelles 23),
//   24 graisseur de réglage (TRACK ADJUSTER) ;
// - 25 six galets à double boudin : cinq galets inférieurs sous le châssis et
//   un galet porteur sur le dessus (qui soulève le brin supérieur, comme sur
//   la page 330), 4 vis 26 et rondelles 27 chacun.
// Repère : origine au sol, sur l'axe longitudinal de la chenille (milieu de la
// largeur des patins), au milieu de l'entraxe barbotin / roue folle ; X vers
// l'avant de la machine (barbotin et réducteur à l'arrière, x = −0.78 ; roue
// folle à l'avant, x = +0.78), Y vers le haut, +Z vers l'intérieur de la
// machine (côté du châssis porteur). Encombrement ≈ 2.14 (X, de −1.07 à
// +1.07) × 0.70 (Y, galet porteur compris) × 0.51 (Z, de −0.23 au couvercle
// du réducteur à +0.28 au moteur) m. P328 place la chenille droite à
// l'origine décalée de z = −V/2 (sans rotation) et la gauche en miroir Z à
// z = +V/2 ; le châssis porteur repose sur la console intérieure (y = 0.465).
// Cotes estimées (le manuel n'en donne pas) d'après la vue de côté et la vue
// arrière de la page 330, à l'échelle de la largeur du châssis porteur
// (39 po = 0.99 m, traverse arrière) et de sa longueur (162 po) :
// - voie (entraxe des deux chenilles) V ≈ 1.20 m (TRACK.gauge, _porteur.js),
//   largeur hors tout ≈ 1.50 m ; patins de 0.30 m ; longueur hors tout
//   ≈ 2.14 m (2.2 m mesurés) ; hauteur ≈ 0.67 m ;
// - entraxe barbotin / roue folle 1.56 m, axes à 0.292 m du sol, rayon
//   primitif 0.217 m, pas de chaîne 0.129 m (35 pas) ;
// - dessus du châssis de chenille (face d'appui du châssis porteur, console
//   intérieure z 0.10 → 0.16) à y = 0.465 m ;
// - réducteur : face d'appui de sa bride contre la face extérieure de la
//   plaque-couronne (z = +0.09 ; plaque de 0.09 à 0.12), axe sur celui du barbotin ; moteur vers +Z.
// Chenilles en acier (patins boulonnés, chaîne à maillons) : vérifié sur les
// pages 336 et 330.
import { TRACK } from './_porteur.js';
import { GBX338 } from './P338.js';

export default function P336(api) {
  const { THREE, S } = api;
  const { lathe, merged, group, at } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const TAU = Math.PI * 2;
  const XS = TRACK.sprocketX, XI = TRACK.idlerX, YA = TRACK.axleY, R = TRACK.pinR;
  const H0 = YA - R; // ligne des axes de chaîne au brin inférieur
  const XP = -0.07, YP = 0.635; // sommet du brin supérieur, sur le galet porteur
  const RAIL = 0.035; // demi-hauteur des maillons (rails)
  const ZR = 0.045; // plan moyen des rails (de part et d'autre)

  // Boîte simple (12 triangles) en position / rotation.
  const bx = (w, h, d, pos, rot) => at(new THREE.Mesh(new THREE.BoxGeometry(w, h, d)), pos, rot);
  // Boîte par coins.
  const bc = (x0, x1, y0, y1, z0, z1) => bx(x1 - x0, y1 - y0, z1 - z0, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]);
  // Vis légère le long de +Y local : tête six pans (dessus fermé), tige à 3 pans.
  const screwGeo = (d, len, hh = d * 0.65) => {
    const hr = d * 0.95;
    const head = new THREE.CylinderGeometry(hr, hr, hh, 6, 1, true).translate(0, hh / 2, 0);
    const top = new THREE.CircleGeometry(hr, 6).rotateX(-Math.PI / 2).translate(0, hh, 0);
    const shank = new THREE.CylinderGeometry(d / 2, d / 2, len, 3, 1, true).translate(0, -len / 2, 0);
    return [head, top, shank];
  };
  const tmpl = (geos, mat) => merged(geos.map((g) => new THREE.Mesh(g)), mat);
  const screwT = (d, len, mat = 'blackOxide') => tmpl(screwGeo(d, len), mat);
  // Rondelle (disque plein, épaisseur vers +Y) et écrou six pans (ouvert dessous).
  const washerT = (d, mat = 'zinc') => {
    const r = d, t = Math.max(d * 0.16, 0.0015);
    return tmpl([new THREE.CylinderGeometry(r, r, t, 6, 1, true).translate(0, t / 2, 0), new THREE.CircleGeometry(r, 6).rotateX(-Math.PI / 2).translate(0, t, 0)], mat);
  };
  const nutT = (d, mat = 'blackOxide') => {
    const r = d * 0.85, h = d * 0.8;
    return tmpl([new THREE.CylinderGeometry(r, r, h, 6, 1, true).translate(0, h / 2, 0), new THREE.CircleGeometry(r, 6).rotateX(-Math.PI / 2).translate(0, h, 0)], mat);
  };
  // Pose d'un gabarit le long de +Y vers la direction dir, en pos.
  const Yv = new THREE.Vector3(0, 1, 0);
  const pose = (t, pos, dir) => {
    const o = t.clone();
    o.quaternion.setFromUnitVectors(Yv, new THREE.Vector3(...dir).normalize());
    o.position.set(...pos);
    return o;
  };
  const Lz = (prof, mat, seg) => lathe(prof, mat, { axis: 'z', seg });

  // ---------------------------------------------------------- tracé de la chaîne
  // Boucle (sens trigonométrique vue de +Z) : brin inférieur vers l'avant,
  // demi-tour sur la roue folle, brin supérieur en deux droites par le sommet
  // du galet porteur, demi-tour sur le barbotin.
  const segs = [
    { k: 'l', a: [XS, H0], b: [XI, H0] },
    { k: 'c', c: [XI, YA], a0: -Math.PI / 2, a1: Math.PI / 2 },
    { k: 'l', a: [XI, YA + R], b: [XP, YP] },
    { k: 'l', a: [XP, YP], b: [XS, YA + R] },
    { k: 'c', c: [XS, YA], a0: Math.PI / 2, a1: 1.5 * Math.PI },
  ].map((s) => ({ ...s, len: s.k === 'l' ? Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) : R * (s.a1 - s.a0) }));
  const LOOP = segs.reduce((t, s) => t + s.len, 0);
  const at2 = (sv) => {
    let s = ((sv % LOOP) + LOOP) % LOOP;
    for (const g of segs) {
      if (s <= g.len) {
        if (g.k === 'l') { const t = s / g.len; return [g.a[0] + (g.b[0] - g.a[0]) * t, g.a[1] + (g.b[1] - g.a[1]) * t]; }
        const a = g.a0 + s / R;
        return [g.c[0] + R * Math.cos(a), g.c[1] + R * Math.sin(a)];
      }
      s -= g.len;
    }
    return segs[0].a;
  };
  const N = 35;
  const PITCH = LOOP / N;
  const pins = Array.from({ length: N }, (_, i) => at2(-XS + (i + 0.5) * PITCH));
  // Maillon i : de l'axe i à l'axe i + 1 ; milieu, tangente, normale extérieure.
  const links = pins.map((p, i) => {
    const q = pins[(i + 1) % N];
    const t = [q[0] - p[0], q[1] - p[1]];
    const l = Math.hypot(...t);
    t[0] /= l; t[1] /= l;
    return { m: [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], t, n: [t[1], -t[0]], l, ang: Math.atan2(t[1], t[0]) };
  });
  const DROP = [0, -1.3, 0]; // éclaté de la chaîne (vers le bas)
  const plus = (a, n, k) => [a[0] + n[0] * k, a[1] + n[1] * k, a[2] + (n[2] || 0) * k];

  // 16 — chaîne : rails de maillons (deux par pas) et axes / bagues (sauf la
  // jonction 19, maillon 0).
  {
    const plates = [], pinsM = [];
    links.forEach((L, i) => {
      if (i === 0) return;
      for (const s of [-1, 1]) plates.push(bx(L.l + 0.035, 2 * RAIL, 0.025, [L.m[0], L.m[1], s * ZR], [0, 0, L.ang]));
    });
    pins.forEach((p, i) => {
      if (i === 0 || i === 1) return;
      pinsM.push(at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8, 1).rotateX(Math.PI / 2)), [p[0], p[1], 0]));
    });
    P('16', group(merged(plates, 'darkSteel'), merged(pinsM, 'steel')), DROP);
  }
  // 19 — maillon de jonction : rails fendus (deux demi-maillons par côté),
  // deux axes de jonction à bagues d'arrêt.
  {
    const L = links[0];
    const parts = [];
    for (const s of [-1, 1]) {
      parts.push(bx(L.l * 0.5 + 0.017, 2 * RAIL, 0.025, [L.m[0] - L.t[0] * L.l * 0.25, L.m[1] - L.t[1] * L.l * 0.25, s * ZR], [0, 0, L.ang]));
      parts.push(bx(L.l * 0.5 + 0.017, 2 * RAIL, 0.025, [L.m[0] + L.t[0] * L.l * 0.25, L.m[1] + L.t[1] * L.l * 0.25, s * ZR], [0, 0, L.ang]));
    }
    const pinsJ = [0, 1].map((k) => at(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8, 1).rotateX(Math.PI / 2)), [pins[k][0], pins[k][1], 0]));
    const clips = [0, 1].flatMap((k) => [-1, 1].map((s) => at(new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.004, 8, 1).rotateX(Math.PI / 2)), [pins[k][0], pins[k][1], s * 0.073])));
    P('19', group(merged(parts, 'darkSteel'), merged(pinsJ, 'chrome'), merged(clips, 'zinc')), plus(DROP, [0, 0, -1], 0.15));
  }
  // 17 — patins : tôle de 12 mm à deux arêtes (25 mm), 0.30 m de large ;
  // 18 — 4 vis à tête bombée et 4 écrous par patin, sur les rails.
  {
    // Profil (u le long de la chaîne, v vers l'extérieur), extrudé selon Z.
    const v0 = RAIL, v1 = RAIL + 0.012, v2 = RAIL + 0.04;
    const prof = [[-0.062, v0], [0.062, v0], [0.062, v1], [0.048, v1], [0.044, v2], [0.03, v2], [0.026, v1],
      [-0.03, v1], [-0.034, v2], [-0.048, v2], [-0.052, v1], [-0.062, v1]];
    const shape = new THREE.Shape(prof.map(([u, v]) => new THREE.Vector2(u, -v)));
    const geo = new THREE.ExtrudeGeometry(shape, { depth: TRACK.shoeW, bevelEnabled: false });
    geo.translate(0, 0, -TRACK.shoeW / 2);
    const shoe = merged([new THREE.Mesh(geo)], 'charcoal');
    const bolt = screwT(0.016, 0.07, 'blackOxide');
    const nut = nutT(0.016);
    links.forEach((L) => {
      const s = at(shoe.clone(), [L.m[0], L.m[1], 0], [0, 0, L.ang]);
      P('17', s, plus(DROP, L.n, 0.22));
      for (const u of [-0.016, 0.014]) {
        for (const zs of [-1, 1]) {
          const bp = [L.m[0] + L.t[0] * u + L.n[0] * v1, L.m[1] + L.t[1] * u + L.n[1] * v1, zs * ZR];
          P('18', pose(bolt, bp, [L.n[0], L.n[1], 0]), plus(DROP, L.n, 0.36));
          const np = [L.m[0] + L.t[0] * u - L.n[0] * 0.012, L.m[1] + L.t[1] * u - L.n[1] * 0.012, zs * ZR];
          P('18', pose(nut, np, [-L.n[0], -L.n[1], 0]), plus(DROP, L.n, -0.12));
        }
      }
    });
  }

  // ---------------------------------------------------------- châssis (1, 2)
  // Poutre-caisson : dessus 15 mm (y 0.45 → 0.465) jusqu'à x 0.56, flancs de
  // 12 mm de x −0.50 à +0.92 (la roue folle et le tendeur logent entre eux à
  // l'avant), fond jusqu'à x 0.56, lèvres inférieures sur toute la longueur,
  // bout arrière, cloison du tendeur (x −0.08). Moitié extérieure (z < 0) :
  // repère 1 ; moitié intérieure (z > 0) : repère 2, avec la plaque-couronne
  // du réducteur et la console d'appui du châssis porteur.
  const half = (s) => {
    const z0 = s > 0 ? 0 : -0.1, z1 = s > 0 ? 0.1 : 0;
    const zs0 = s > 0 ? 0.088 : -0.1, zs1 = s > 0 ? 0.1 : -0.088;
    const zl0 = s > 0 ? 0.075 : -0.1, zl1 = s > 0 ? 0.1 : -0.075;
    const pl = [
      bc(-0.5, 0.56, 0.45, 0.465, z0, z1), // dessus
      bc(-0.5, 0.92, 0.215, 0.45, zs0, zs1), // flanc
      bc(-0.5, 0.56, 0.215, 0.227, z0, z1), // fond
      bc(-0.5, 0.92, 0.203, 0.215, zl0, zl1), // lèvre inférieure
      bc(-0.512, -0.5, 0.215, 0.465, z0, z1), // bout arrière
      bc(-0.08, -0.065, 0.227, 0.45, z0, z1), // cloison du tendeur
      bc(0.86, 0.92, 0.45, 0.465, s > 0 ? 0.073 : -0.1, s > 0 ? 0.1 : -0.073), // pont avant des flancs
    ];
    return pl;
  };
  {
    // 1 — moitié extérieure, ouverture du regard figurée (disque sombre).
    const hole = at(new THREE.Mesh(new THREE.CircleGeometry(0.05, 12)), [-0.057, YA + 0.02, -0.1005], [0, Math.PI, 0]);
    P('1', group(merged(half(-1), 'black'), merged([hole], 'gunmetal')), [0, 0, -0.14]);
  }
  {
    // 2 — moitié intérieure : plaque-couronne (alésage Ø 0.224, 20 trous du
    // réducteur sur Ø 0.34), console d'appui et goussets.
    const a1 = Math.asin((0.463 - YA) / 0.2), a2 = Math.asin((YA - 0.215) / 0.2);
    const sh = new THREE.Shape();
    sh.moveTo(-0.48, 0.215); sh.lineTo(-0.48, 0.463);
    sh.absarc(XS, YA, 0.2, a1, TAU - a2, false);
    sh.lineTo(-0.48, 0.215);
    sh.holes.push(new THREE.Path().absarc(XS, YA, 0.112, 0, TAU, true));
    const ring = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false, curveSegments: 6 });
    ring.translate(0, 0, TRACK.gbxZ);
    const holes = [];
    for (let i = 0; i < GBX338.nBolts; i++) {
      const a = ((i + 0.5) / GBX338.nBolts) * TAU;
      holes.push(at(new THREE.Mesh(new THREE.CircleGeometry(0.009, 4)), [XS + GBX338.boltR * Math.cos(a), YA + GBX338.boltR * Math.sin(a), TRACK.gbxZ - 0.0005], [0, Math.PI, 0]));
    }
    const console_ = [
      bc(-0.42, 0.46, 0.447, 0.465, 0.1, TRACK.padZ[1]),
      ...[-0.3, 0.06, 0.4].map((x) => bc(x - 0.006, x + 0.006, 0.33, 0.447, 0.1, TRACK.padZ[1] - 0.01)),
    ];
    P('2', group(merged([...half(1), new THREE.Mesh(ring), ...console_], 'black'), merged(holes, 'gunmetal')), [0, 0, 0.14]);
  }

  // 8 — couvercle du regard, 9 — 2 vis.
  P('8', Lz([[0, -0.106], [0.06, -0.106], [0.06, -0.1], [0, -0.1]], 'black', 14).translateX(-0.057).translateY(YA + 0.02), [0, 0, -0.32]);
  {
    const s = screwT(0.008, 0.016);
    for (const dx of [-0.045, 0.045]) P('9', pose(s, [-0.057 + dx, YA + 0.02, -0.106], [0, 0, -1]), [0, 0, -0.42]);
  }

  // ------------------------------------------------- réducteur et barbotin
  // 10 — réducteur P338 tourné de 180° autour de Y : sa face d'appui contre la
  // face extérieure de la plaque-couronne (z = 0.09), moteur vers +Z.
  P('10', at(api.sub('P338'), [XS, YA, TRACK.gbxZ], [0, Math.PI, 0]), [0, 0, -0.5]);
  {
    // 11 — 20 vis M16 du réducteur (têtes côté intérieur), 12 — rondelles.
    const s = screwT(0.016, 0.05), w = washerT(0.016);
    const zf = TRACK.gbxZ + 0.03;
    for (let i = 0; i < GBX338.nBolts; i++) {
      const a = ((i + 0.5) / GBX338.nBolts) * TAU;
      const x = XS + GBX338.boltR * Math.cos(a), y = YA + GBX338.boltR * Math.sin(a);
      P('12', pose(w, [x, y, zf], [0, 0, 1]), [0, 0, 0.22]);
      P('11', pose(s, [x, y, zf + 0.0026], [0, 0, 1]), [0, 0, 0.32]);
    }
  }
  // 13 — barbotin : couronne de 21 dents (pas de chaîne = 2 dents), alésage
  // sur la portée du moyeu, plaqué sur la bride du moyeu (z = +0.015).
  {
    const g = S.gear(0.2, 0.245, 21, 0.03, 'darkSteel', { axis: 'z', hole: GBX338.hubR + 0.002 });
    const holes = [];
    for (let i = 0; i < GBX338.nSprocketBolts; i++) {
      const a = (i / GBX338.nSprocketBolts) * TAU;
      holes.push(at(new THREE.Mesh(new THREE.CircleGeometry(0.0095, 4)), [GBX338.sprocketBoltR * Math.cos(a), GBX338.sprocketBoltR * Math.sin(a), -0.0153], [0, Math.PI, 0]));
    }
    P('13', at(group(g, merged(holes, 'gunmetal')), [XS, YA, 0]), [0, 0, -0.95]);
  }
  {
    // 14 — 18 vis M16 du barbotin (têtes côté extérieur), 15 — rondelles.
    const s = screwT(0.016, 0.045), w = washerT(0.016);
    for (let i = 0; i < GBX338.nSprocketBolts; i++) {
      const a = (i / GBX338.nSprocketBolts) * TAU;
      const x = XS + GBX338.sprocketBoltR * Math.cos(a), y = YA + GBX338.sprocketBoltR * Math.sin(a);
      P('15', pose(w, [x, y, -0.015], [0, 0, -1]), [0, 0, -1.08]);
      P('14', pose(s, [x, y, -0.0176], [0, 0, -1]), [0, 0, -1.2]);
    }
  }

  // ------------------------------------------------- roue folle et tendeur
  // 20 — roue folle (jantes Ø 0.364 sous les rails, boudin central Ø 0.41),
  // axe et chape à deux bras reliée à la tige du tendeur.
  {
    const wheel = Lz([[0.03, -0.075], [0.06, -0.075], [0.06, -0.07], [0.19, -0.07], [0.19, -0.06], [0.182, -0.06],
      [0.182, -0.03], [0.205, -0.024], [0.205, 0.024], [0.182, 0.03], [0.182, 0.06], [0.19, 0.06], [0.19, 0.07],
      [0.06, 0.07], [0.06, 0.075], [0.03, 0.075], [0.03, -0.075]], 'black', 20);
    const axle = Lz([[0, -0.086], [0.03, -0.086], [0.03, 0.086], [0, 0.086]], 'steel', 10);
    const yoke = merged([
      ...[-1, 1].map((s) => bx(0.25, 0.07, 0.008, [-0.115, 0, s * 0.082])),
      bx(0.04, 0.09, 0.172, [-0.25, 0, 0]),
    ], 'black');
    P('20', at(group(wheel, axle, yoke), [XI, YA, 0]), [0.45, 0, 0]);
  }
  // 21 — vérin tendeur : bride carrée sur la cloison, corps, tige chromée,
  // ressort de rappel entre deux coupelles ; 24 — graisseur sur la bride
  // (face −Z, en face du regard 8) ; 22 — 2 vis, 23 — rondelles (derrière la cloison).
  const CYL = [0, 0.55, 0];
  {
    const body = lathe([[0, -0.065], [0.065, -0.065], [0.065, -0.05], [0.045, -0.05], [0.045, 0.3], [0.03, 0.31], [0, 0.31]], 'black', { axis: 'x', seg: 10 });
    const flange = bx(0.015, 0.12, 0.12, [-0.0575, 0, 0]);
    const rod = lathe([[0, 0.3], [0.025, 0.3], [0.025, 0.535], [0, 0.535]], 'chrome', { axis: 'x', seg: 10 });
    const cups = merged([bx(0.01, 0.13, 0.13, [0.33, 0, 0]), bx(0.01, 0.13, 0.13, [0.525, 0, 0])], 'black');
    const spring = S.spring(0.058, 0.011, 0.19, 5, 'yellow', { axis: 'x', pos: [0.335, 0, 0], perTurn: 8, radial: 4 });
    P('21', at(group(body, merged([flange], 'black'), rod, cups, spring), [0, YA, 0]), CYL);
    const g = group(
      lathe([[0, 0], [0.008, 0], [0.008, 0.012], [0.004, 0.014], [0.004, 0.024], [0.006, 0.026], [0, 0.03]], 'brass', { seg: 6 }),
    );
    P('24', pose(g, [-0.057, YA + 0.02, -0.06], [0, 0, -1]), plus(CYL, [0, 0, -1], 0.15));
    const s = screwT(0.012, 0.04), w = washerT(0.012);
    for (const zs of [-1, 1]) {
      P('23', pose(w, [-0.08, YA - 0.04, zs * 0.04], [-1, 0, 0]), [-0.2, 0.55, 0]);
      P('22', pose(s, [-0.082, YA - 0.04, zs * 0.04], [-1, 0, 0]), [-0.3, 0.55, 0]);
    }
  }

  // ------------------------------------------------------------ galets (25)
  // Galet à double boudin : bandes de roulement Ø 0.11 sur les rails, boudin
  // central entre les rails, boudins extérieurs ; paliers à semelle boulonnés
  // (4 vis 26 et rondelles 27 par galet, têtes côté semelle).
  {
    const roller = Lz([[0, -0.1], [0.025, -0.1], [0.025, -0.072], [0.068, -0.072], [0.068, -0.06], [0.055, -0.06],
      [0.055, -0.03], [0.066, -0.026], [0.066, 0.026], [0.055, 0.03], [0.055, 0.06], [0.068, 0.06], [0.068, 0.072],
      [0.025, 0.072], [0.025, 0.1], [0, 0.1]], 'black', 10);
    // Paliers (vers +Y local : semelle à 0.05 + e au-dessus de l'axe ; e =
    // rehausse des paliers du galet porteur, qui passe au-dessus du châssis).
    const unitT = (e) => group(roller.clone(), merged([-1, 1].flatMap((s) => [
      bx(0.07, 0.04 + e, 0.025, [0, 0.018 + e / 2, s * 0.086]),
      bx(0.13, 0.012, 0.045, [0, 0.044 + e, s * 0.086]),
    ]), 'black'));
    const bolt = screwT(0.012, 0.035), w = washerT(0.012);
    const add = (x, y, up, e = 0) => {
      // up = +1 : galet inférieur (semelle au-dessus) ; −1 : galet porteur.
      const r = unitT(e);
      r.position.set(x, y, 0);
      if (up < 0) r.rotation.z = Math.PI;
      P('25', r, [0, -0.32 * up, 0]);
      const yf = y + up * (0.038 + e); // dessous de la semelle (côté tête de vis)
      for (const dx of [-0.045, 0.045]) {
        for (const zs of [-1, 1]) {
          P('27', pose(w, [x + dx, yf, zs * 0.086], [0, -up, 0]), [0, -0.45 * up, 0]);
          P('26', pose(bolt, [x + dx, yf - up * 0.002, zs * 0.086], [0, -up, 0]), [0, -0.55 * up, 0]);
        }
      }
    };
    const yb = H0 + RAIL + 0.055; // axe des galets inférieurs
    [-0.48, -0.24, 0, 0.24, 0.48].forEach((x) => add(x, yb, 1));
    add(XP, YP - RAIL - 0.055, -1, YP - RAIL - 0.055 - 0.05 - TRACK.frameTop);
  }

  // --------------------------------------------- guides de chaîne (3 à 7)
  // Deux cornières à goussets sous l'avant du châssis (x 0.58 → 0.90), joues
  // de part et d'autre des rails, 5 vis et rondelles par guide (têtes en
  // dessous), entretoisées par une vis traversante 6 et son écrou 7.
  {
    const guide = (s) => merged([
      bc(0.58, 0.9, 0.191, 0.203, s > 0 ? 0.075 : -0.115, s > 0 ? 0.115 : -0.075),
      bc(0.58, 0.9, 0.12, 0.191, s > 0 ? 0.075 : -0.085, s > 0 ? 0.085 : -0.075),
      ...[0.64, 0.84].map((x) => bc(x - 0.005, x + 0.005, 0.15, 0.191, s > 0 ? 0.085 : -0.11, s > 0 ? 0.11 : -0.085)),
    ], 'black');
    const bolt = screwT(0.012, 0.03), w = washerT(0.012);
    for (const s of [-1, 1]) {
      P('3', guide(s), [0, -0.3, s * 0.12]);
      for (const x of [0.6, 0.67, 0.74, 0.81, 0.88]) {
        P('5', pose(w, [x, 0.191, s * 0.1], [0, -1, 0]), [0, -0.45, s * 0.12]);
        P('4', pose(bolt, [x, 0.189, s * 0.1], [0, -1, 0]), [0, -0.55, s * 0.12]);
      }
    }
    P('6', pose(screwT(0.016, 0.18), [0.6, 0.15, -0.085], [0, 0, -1]), [0, -0.3, -0.35]);
    P('7', pose(nutT(0.016), [0.6, 0.15, 0.085], [0, 0, 1]), [0, -0.3, 0.35]);
  }

  return { view: { dir: [0.75, 0.55, -1.2] } };
}
