// P338 — Réducteur et moteur de translation CP005504 rév. 1 (pages 338 et 340,
// même dessin) : « GEARBOX AND MOTOR (X12.0091.1E) ». Réducteur planétaire à
// moyeu tournant, trois étages, sur moteur hydraulique à pistons à frein
// intégré (51). Vue en coupe éclatée le long de l'axe :
// - côté moteur : moteur 51 (corps, bloc de distribution, bride fixe percée
//   de 20 trous, fusée qui porte les roulements), joint de bride 5, bride
//   porte-joint 34 et ses 24 vis M6 × 30 (49), joint d'étanchéité à faces
//   (duocone) 27 et bague V 28 ;
// - moyeu tournant 2 (carter, couronne dentée intérieure commune aux trois
//   étages, bride de barbotin à 18 trous taraudés), deux roulements
//   principaux 31 séparés par l'entretoise 3, entretoise 15, joints toriques
//   24 et 20 ;
// - étage de sortie : porte-satellites fixe 4 (« FLANGE ») vissé sur la fusée
//   par 3 vis M16 × 80 (48), 3 axes 6, 3 satellites 12 montés chacun sur
//   38 rouleaux cylindriques (43, deux rangées de 19 : 114 en tout) entre
//   deux rondelles 10 (6) ; rondelles à rouleaux 11, bagues 17 ;
// - débrayage de frein (remorquage) : pignons de débrayage 37 et 38, bague
//   coulissante 39, ressort 33, joncs 21 et 22, rondelle 41 ;
// - étage intermédiaire : porte-satellites 8, satellites 13 sur roulements 29,
//   joncs 19, planétaire 7 ; étage d'entrée : porte-satellites 9, satellites
//   14 sur roulements 30, joncs 18, arbre cannelé 36 (entrée, depuis le
//   moteur), butée GS 81105 (32) ;
// - couvercle 1 (10 vis M8 × 25 = 47, joint torique 25, bouchons M14 × 1,5 =
//   46 de vidange / remplissage, bouchons D8 × 20 = 44), plaque signalétique
//   16 et 2 rivets laiton 42, couvercle central 35 (joint 23, 3 vis M6 × 20 =
//   50), bride 40, bouchon D10 × 30 (45) et joint 26.
// Repère : origine au centre de la face d'appui de la bride fixe (celle qui
// se boulonne contre le châssis de chenille), axe de rotation selon Z ; +Z
// vers l'extérieur de la machine (moyeu, barbotin, couvercle), −Z vers
// l'intérieur (corps du moteur, qui traverse l'alésage du châssis) ; +Y vers
// le haut (bloc de distribution et orifices du moteur en haut). Encombrement
// ≈ 0.38 (X) × 0.38 (Y) × 0.51 (Z, de −0.19 au bouchon central à +0.32) m.
// Le parent place le réducteur par cette face d'appui (Z = 0, bride
// Ø 0.38 m, 20 trous Ø 18 sur Ø 0.34) ; bride de barbotin : face +Z à
// Z = 0.075, Ø 0.356 (sous les rails de la chaîne), 18 trous taraudés sur
// Ø 0.324 ; portée du barbotin Ø 0.29 (GBX338). Orifices du moteur
// (PORTS338) : A et B à bride SAE code 62 3/4 po sur le dessus du bloc,
// drain 1/2 BSPP et deux pilotes 1/4 BSPP (frein, deux vitesses) sur la face
// −Z du bloc.
// Cotes non données par le manuel : estimées d'après les proportions du
// dessin (réducteur de 12 kN·m environ, comme la série X12) et le barbotin de
// P336 ; pièces internes simplifiées (dentures suggérées), segments réduits
// (budget ≤ 7 000 triangles, car P328 porte deux chenilles : petites pièces
// internes en prismes à 6 pans, engrenages en étoiles extrudées).

export const GBX338 = {
  mountR: 0.19, // rayon de la bride fixe
  boltR: 0.17, nBolts: 20, // trous de fixation sur le châssis
  sprocketFace: 0.075, // face +Z de la bride de barbotin
  sprocketBoltR: 0.162, nSprocketBolts: 18,
  hubR: 0.145, // portée du barbotin (Z 0.075 → 0.105) ; corps Ø 0.32 au-delà
  flangeR: 0.178, // bride de barbotin
  motorR: 0.105, motorEnd: -0.19, // corps du moteur (traverse le châssis)
};
// Orifices du moteur : centre de la face d'orifice et normale sortante.
export const PORTS338 = {
  A: { pos: [0.033, 0.166, -0.085], dir: [0, 1, 0] },
  B: { pos: [-0.033, 0.166, -0.085], dir: [0, 1, 0] },
  drain: { pos: [0, 0.135, -0.14], dir: [0, 0, -1] },
  X1: { pos: [0.04, 0.12, -0.14], dir: [0, 0, -1] },
  X2: { pos: [-0.04, 0.12, -0.14], dir: [0, 0, -1] },
};

export default function P338(api) {
  const { THREE, S } = api;
  const { lathe, box, merged, group, at } = S;
  // Éclatement (repris en fin de builder) : chaque pièce va à sa place dans
  // l'ordre du dessin, du moteur vers le couvercle ; e = [x, y, dz en plus].
  const placed = [];
  const P = (ref, obj, e) => { placed.push(obj); return api.part(ref, obj, e); };
  const TAU = Math.PI * 2;
  const Lz = (prof, mat, seg = 20) => lathe(prof, mat, { axis: 'z', seg });
  // Anneau (r ext., r int., z0 → z1).
  const ringZ = (ro, ri, z0, z1, mat, seg = 32) => Lz([[ri, z0], [ro, z0], [ro, z1], [ri, z1], [ri, z0]], mat, seg);
  // Disque plein.
  const diskZ = (r, z0, z1, mat, seg = 24) => Lz([[0, z0], [r, z0], [r, z1], [0, z1]], mat, seg);
  // Prisme plein à 6 pans selon Z (petites pièces internes : 24 triangles).
  const hexZ = (r, z0, z1, mat) => merged([new THREE.Mesh(new THREE.CylinderGeometry(r, r, z1 - z0, 6, 1).rotateX(Math.PI / 2).translate(0, 0, (z0 + z1) / 2))], mat);
  // Joint torique léger (section en losange).
  const oring = (R, r, z, seg = 28) => Lz([[R - r, z], [R, z - r], [R + r, z], [R, z + r], [R - r, z]], 'rubber', seg);
  // Engrenage extrudé selon Z (z0 → z1), alésage optionnel.
  // Engrenage léger : prisme en étoile (dents triangulaires) extrudé selon Z,
  // sans alésage (pièce interne), 8n − 4 triangles.
  const gearZ = (rr, rt, n, z0, z1, mat) => {
    const sh = new THREE.Shape();
    for (let i = 0; i < 2 * n; i++) {
      const a = (i / (2 * n)) * TAU, r = i % 2 ? rt : rr;
      if (i === 0) sh.moveTo(r * Math.cos(a), r * Math.sin(a)); else sh.lineTo(r * Math.cos(a), r * Math.sin(a));
    }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false });
    geo.translate(0, 0, z0);
    return merged([new THREE.Mesh(geo)], mat);
  };
  // Vis à tête (axe +Z : tête en haut, tige vers −Z), tête cylindrique (CHC)
  // ou six pans ; maillage partagé par clonage.
  const screwT = (d, len, hex = false) => {
    const hr = hex ? d * 0.95 : d * 0.75, hh = d * (hex ? 0.65 : 1.0);
    const head = new THREE.CylinderGeometry(hr, hr, hh, 6, 1, true);
    const top = new THREE.CircleGeometry(hr, 6).rotateX(-Math.PI / 2).translate(0, hh / 2, 0);
    head.rotateX(Math.PI / 2); head.translate(0, 0, hh / 2);
    top.rotateX(Math.PI / 2); top.translate(0, 0, hh / 2);
    const shank = new THREE.CylinderGeometry(d / 2, d / 2, len, 3, 1, true);
    shank.rotateX(Math.PI / 2); shank.translate(0, 0, -len / 2);
    return merged([new THREE.Mesh(head), new THREE.Mesh(top), new THREE.Mesh(shank)], 'blackOxide');
  };
  const polar = (R, a, z) => [R * Math.cos(a), R * Math.sin(a), z];

  // Éclatement : tout sort selon l'axe, comme le dessin (moteur vers −Z).
  const E = (dz) => [0, 0, dz];

  // ------------------------------------------------------------ 51 — moteur
  // Corps (couvercle de distribution à l'arrière), bride fixe percée de 20
  // trous, fusée vers +Z qui porte les roulements du moyeu.
  {
    const body = Lz([
      [0, -0.19], [0.085, -0.19], [0.095, -0.175], [0.095, -0.15],
      [0.105, -0.145], [0.105, -0.03], [0.13, -0.025], [0.13, -0.004],
      [0.19, -0.004], [0.19, 0.028], [0.105, 0.028], [0.105, 0.14], [0, 0.14],
    ], 'black', 12);
    // Trous de fixation : pastilles sombres sur les deux faces de la bride.
    const holes = [];
    for (let i = 0; i < GBX338.nBolts; i++) {
      const a = (i + 0.5) / GBX338.nBolts * TAU;
      holes.push(at(new THREE.Mesh(new THREE.CircleGeometry(0.009, 3)), [...polar(GBX338.boltR, a, 0.0285)]));
    }
    const holeM = merged(holes, 'gunmetal');
    // Bloc de distribution (orifices A/B en haut, drain et pilotes à l'arrière).
    const block = box(0.12, 0.06, 0.11, 'black', { pos: [0, 0.136, -0.085] });
    const flanges = merged([
      ...['A', 'B'].map((k) => at(box(0.05, 0.004, 0.06), PORTS338[k].pos.map((v, i) => (i === 1 ? v - 0.002 : v)))),
      ...['drain', 'X1', 'X2'].map((k) => at(new THREE.Mesh(new THREE.CylinderGeometry(k === 'drain' ? 0.012 : 0.009, k === 'drain' ? 0.012 : 0.009, 0.004, 6).rotateX(Math.PI / 2)), PORTS338[k].pos.map((v, i) => (i === 2 ? v + 0.002 : v)))),
    ], 'zinc');
    P('51', group(body, holeM, block, flanges), E(0));
  }

  // 5 — joint de bride, 34 — bride porte-joint et 24 vis M6 × 30 (49)
  P('5', ringZ(0.168, 0.126, 0.028, 0.0295, 'cream', 10), E(0));
  P('34', ringZ(0.17, 0.126, 0.0295, 0.041, 'black', 10), E(0));
  {
    const s = screwT(0.006, 0.03);
    for (let i = 0; i < 24; i++) P('49', at(s.clone(), polar(0.155, (i / 24) * TAU, 0.041)), E(0));
  }
  // 28 — bague V (sur la bride 34), 27 — joint duocone (deux bagues métal + toriques)
  P('28', Lz([[0.158, 0.041], [0.168, 0.041], [0.168, 0.047], [0.16, 0.05], [0.158, 0.047], [0.158, 0.041]], 'rubber', 10), E(0));
  P('27', Lz([[0.13, 0.042], [0.152, 0.042], [0.149, 0.049], [0.152, 0.056], [0.13, 0.056], [0.13, 0.042]], 'darkSteel', 12), E(0));

  // ------------------------------------------------------------ 2 — moyeu
  // Bride de barbotin (Z 0.052 → 0.075, Ø 0.356), portée Ø 0.29, corps Ø 0.32, gorge du joint torique
  // du couvercle ; alésage étagé (roulements, couronne dentée).
  {
    const hub = Lz([
      [0.153, 0.045], [0.165, 0.045], [0.165, 0.052], [0.178, 0.052], [0.178, 0.075], [0.145, 0.075], [0.145, 0.105], [0.16, 0.11], [0.16, 0.25],
      [0.15, 0.255], [0.118, 0.255], [0.118, 0.125], [0.131, 0.125], [0.131, 0.045], [0.153, 0.045],
    ], 'black', 14);
    const holes = [];
    for (let i = 0; i < GBX338.nSprocketBolts; i++) {
      holes.push(at(new THREE.Mesh(new THREE.CircleGeometry(0.0085, 3)), [...polar(GBX338.sprocketBoltR, (i / 18) * TAU, 0.0755)]));
    }
    P('2', group(hub, merged(holes, 'gunmetal')), E(0));
  }
  // 31 — roulements principaux, 3 — entretoise, 15 — entretoise, 24 — joint torique
  // Roulement : bagues extérieure et intérieure d'un seul profil, cage en
  // retrait entre les deux (gorge visible sur les faces).
  const bearing = (ro, ri, z0, z1, seg = 10) => {
    const t = (ro - ri) * 0.3, c = Math.min(0.002, (z1 - z0) * 0.15);
    return Lz([[ri, z0], [ri + t, z0 + c], [ro - t, z0 + c], [ro, z0], [ro, z1],
      [ri, z1], [ri, z0]], 'steel', seg);
  };
  P('31', bearing(0.131, 0.106, 0.058, 0.086), E(0));
  P('3', ringZ(0.128, 0.108, 0.086, 0.09, 'steel', 10), E(0));
  P('31', bearing(0.131, 0.106, 0.09, 0.118), E(0));
  P('15', ringZ(0.12, 0.09, 0.118, 0.124, 'steel', 10), E(0));
  P('24', oring(0.1, 0.0025, 0.127, 8), E(0));

  // ------------------------------------------------------ étage de sortie
  // 4 — porte-satellites fixe (vissé sur la fusée), 3 axes 6, 3 vis M16 (48).
  const ZC = 0.07; // rayon des axes de satellites
  P('4', Lz([[0.03, 0.14], [0.098, 0.14], [0.098, 0.152], [0.03, 0.152], [0.03, 0.14]], 'castIron', 10), E(0));
  {
    const pin = hexZ(0.012, 0.152, 0.192, 'steel');
    const s = screwT(0.016, 0.08);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU;
      P('6', at(pin.clone(), polar(ZC, a, 0)), E(0));
      P('48', at(s.clone(), polar(0.05, a + Math.PI / 3, 0.152)), E(0));
    }
  }
  // Satellites 12 sur 38 rouleaux (deux rangées de 19), rondelles 10 de part et
  // d'autre, rondelles à rouleaux 11 et bagues 17 sur les axes.
  {
    const roller = merged([new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.016, 3, 1, true).rotateX(Math.PI / 2))], 'chrome');
    const planet = gearZ(0.036, 0.042, 10, 0.156, 0.19, 'steel');
    const wsh = hexZ(0.024, 0, 0.002, 'steel');
    const rwsh = hexZ(0.02, 0, 0.003, 'brass');
    const bush = hexZ(0.016, 0, 0.004, 'brass');
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU;
      const [cx, cy] = polar(ZC, a, 0);
      const out = [Math.cos(a) * 0.08, Math.sin(a) * 0.08];
      P('12', at(planet.clone(), [cx, cy, 0]), [out[0], out[1], 0]);
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 19; i++) {
          const b = (i / 19) * TAU + row * 0.08;
          P('43', at(roller.clone(), [cx + 0.0142 * Math.cos(b), cy + 0.0142 * Math.sin(b), 0.164 + row * 0.018]), [out[0] * 0.6, out[1] * 0.6, row * 0.012]);
        }
      }
      P('10', at(wsh.clone(), [cx, cy, 0.154]), [out[0] * 0.5, out[1] * 0.5, 0]);
      P('10', at(wsh.clone(), [cx, cy, 0.19]), [out[0] * 0.5, out[1] * 0.5, 0]);
      P('11', at(rwsh.clone(), [cx, cy, 0.1505]), [out[0] * 0.3, out[1] * 0.3, 0]);
      P('17', at(bush.clone(), [cx, cy, 0.192]), [out[0] * 0.3, out[1] * 0.3, 0]);
    }
  }

  // ------------------------------------------- débrayage (pignons de libération)
  // 37 — pignon de débrayage (planétaire de sortie), 39 — bague coulissante,
  // 33 — ressort, 21 — jonc, 20 — joint torique.
  P('37', group(gearZ(0.021, 0.026, 9, 0.156, 0.19, 'steel')), E(0));
  P('39', ringZ(0.02, 0.013, 0.142, 0.154, 'steel', 10), E(0));
  P('33', Lz([[0.009, 0.11], [0.0125, 0.114], [0.009, 0.118], [0.0125, 0.122], [0.009, 0.126], [0.0125, 0.13], [0.009, 0.134], [0.0125, 0.138]], 'black', 8), E(0));
  P('21', ringZ(0.026, 0.022, 0.191, 0.193, 'blackOxide', 10), E(0));
  P('20', oring(0.02, 0.0018, 0.195, 8), E(0));

  // ------------------------------------------------ étage intermédiaire
  // 8 — porte-satellites (plateau à trois tourillons), 13 — satellites sur
  // roulements 29, joncs 19, 7 — planétaire.
  const Z2 = 0.063;
  {
    const plate = group(
      Lz([[0.012, 0.194], [0.09, 0.194], [0.09, 0.203], [0.012, 0.203], [0.012, 0.194]], 'castIron', 12),
      ...[0, 1, 2].map((k) => at(diskZ(0.011, 0.203, 0.231, 'steel', 6), polar(Z2, (k / 3) * TAU + Math.PI / 3, 0))),
    );
    P('8', plate, E(0));
    const planet = gearZ(0.03, 0.035, 9, 0.205, 0.229, 'steel');
    const brg = hexZ(0.017, 0.207, 0.227, 'steel');
    const snap = ringZ(0.014, 0.011, 0.231, 0.2325, 'blackOxide', 6);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + Math.PI / 3;
      const [cx, cy] = polar(Z2, a, 0);
      const out = [Math.cos(a) * 0.07, Math.sin(a) * 0.07];
      P('13', at(planet.clone(), [cx, cy, 0]), [out[0], out[1], 0]);
      P('29', at(brg.clone(), [cx, cy, 0]), [out[0] * 0.6, out[1] * 0.6, 0]);
      P('19', at(snap.clone(), [cx, cy, 0]), [out[0] * 0.4, out[1] * 0.4, 0]);
    }
  }
  P('7', gearZ(0.022, 0.027, 9, 0.205, 0.229, 'steel'), E(0));

  // ------------------------------------------------------ étage d'entrée
  // 9 — porte-satellites (dentures cannelées du planétaire 7), 14 — satellites
  // sur roulements 30, joncs 18 ; 36 — arbre cannelé d'entrée, 32 — butée
  // GS 81105, 41 — rondelle de butée, 38 — pignon de débrayage, 22 — jonc.
  const Z1 = 0.06;
  {
    const plate = group(
      Lz([[0.01, 0.233], [0.088, 0.233], [0.088, 0.241], [0.01, 0.241], [0.01, 0.233]], 'castIron', 12),
      ...[0, 1, 2].map((k) => at(diskZ(0.009, 0.241, 0.262, 'steel', 6), polar(Z1, (k / 3) * TAU, 0))),
    );
    P('9', plate, E(0));
    const planet = gearZ(0.028, 0.033, 9, 0.243, 0.26, 'steel');
    const brg = hexZ(0.015, 0.244, 0.259, 'steel');
    const snap = ringZ(0.012, 0.009, 0.2615, 0.263, 'blackOxide', 6);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU;
      const [cx, cy] = polar(Z1, a, 0);
      const out = [Math.cos(a) * 0.07, Math.sin(a) * 0.07];
      P('14', at(planet.clone(), [cx, cy, 0]), [out[0], out[1], 0]);
      P('30', at(brg.clone(), [cx, cy, 0]), [out[0] * 0.6, out[1] * 0.6, 0]);
      P('18', at(snap.clone(), [cx, cy, 0]), [out[0] * 0.4, out[1] * 0.4, 0]);
    }
  }
  // Arbre d'entrée : cannelures côté moteur, denture de planétaire d'entrée.
  P('36', group(
    Lz([[0, 0.0], [0.0095, 0.0], [0.0095, 0.2], [0.008, 0.205], [0.008, 0.262], [0, 0.262]], 'steel', 6),
    gearZ(0.017, 0.021, 8, 0.243, 0.26, 'steel'),
  ), E(0));
  P('32', ringZ(0.0235, 0.0125, 0.2265, 0.2325, 'steel', 10), E(0));
  P('41', ringZ(0.022, 0.0105, 0.263, 0.2655, 'steel', 10), E(0));
  P('38', gearZ(0.013, 0.016, 8, 0.2655, 0.275, 'steel'), E(0));
  P('22', ringZ(0.012, 0.0085, 0.2755, 0.2768, 'blackOxide', 10), E(0));

  // ---------------------------------------------------------- couvercle
  // 1 — couvercle (bossage central, alésage fermé par 35), 25 — joint torique,
  // 47 — 10 vis M8 × 25, 46 — 2 bouchons M14 × 1,5, 44 — 2 bouchons D8 × 20.
  P('25', oring(0.137, 0.0025, 0.2565, 8), E(0));
  P('1', Lz([
    [0.045, 0.258], [0.155, 0.258], [0.155, 0.28], [0.148, 0.285], [0.07, 0.288], [0.066, 0.295], [0.045, 0.295], [0.045, 0.258],
  ], 'black', 14), E(0));
  {
    const s = screwT(0.008, 0.025);
    for (let i = 0; i < 10; i++) P('47', at(s.clone(), polar(0.138, ((i + 0.5) / 10) * TAU, 0.281)), E(0));
    const plug14 = Lz([[0, 0.28], [0.0115, 0.28], [0.0115, 0.284], [0.0055, 0.284], [0.0055, 0.2875], [0, 0.2875]], 'zinc', 6);
    P('46', at(plug14.clone(), polar(0.115, Math.PI / 2, 0).map((v, i) => (i === 2 ? 0.0 : v))), E(0));
    P('46', at(plug14.clone(), polar(0.115, -Math.PI / 2, 0).map((v, i) => (i === 2 ? 0.0 : v))), E(0));
    const plug8 = Lz([[0, 0.284], [0.004, 0.284], [0.004, 0.2875], [0, 0.2875]], 'steel', 6);
    P('44', at(plug8.clone(), polar(0.1, Math.PI * 0.15, 0).map((v, i) => (i === 2 ? 0.0 : v))), E(0));
    P('44', at(plug8.clone(), polar(0.1, Math.PI * 1.15, 0).map((v, i) => (i === 2 ? 0.0 : v))), E(0));
  }
  // 16 — plaque signalétique « client » sur le couvercle, 2 rivets laiton 42.
  {
    const a = Math.PI; // côté −X du couvercle
    const plate = box(0.045, 0.028, 0.0012, 'zinc', { pos: [0.098 * Math.cos(a), 0.098 * Math.sin(a), 0.2862] });
    plate.rotation.z = a + Math.PI / 2;
    P('16', plate, E(0));
    const rivet = Lz([[0, 0.2868], [0.0018, 0.2868], [0.0015, 0.288], [0, 0.2884]], 'brass', 6);
    P('42', at(rivet.clone(), [-0.098, 0.018, 0]), E(0));
    P('42', at(rivet.clone(), [-0.098, -0.018, 0]), E(0));
  }
  // 23 — joint torique, 35 — couvercle central, 50 — 3 vis M6 × 20.
  P('23', oring(0.04, 0.002, 0.296, 8), E(0));
  P('35', Lz([[0.016, 0.295], [0.056, 0.295], [0.056, 0.302], [0.052, 0.305], [0.016, 0.305], [0.016, 0.295]], 'castIron', 10), E(0));
  {
    const s = screwT(0.006, 0.02);
    for (let i = 0; i < 3; i++) P('50', at(s.clone(), polar(0.046, (i / 3) * TAU + 0.5, 0.305)), E(0));
  }
  // 26 — joint torique, 40 — bride (porte-bouchon), 45 — bouchon D10 × 30.
  P('26', oring(0.012, 0.0015, 0.3055, 8), E(0));
  P('40', Lz([[0.006, 0.305], [0.022, 0.305], [0.022, 0.311], [0.006, 0.311], [0.006, 0.305]], 'steel', 8), E(0));
  P('45', Lz([[0, 0.29], [0.005, 0.29], [0.005, 0.312], [0.008, 0.312], [0.008, 0.318], [0, 0.318]], 'zinc', 6), E(0));

  // Ordre du dessin (pages 338 / 340), du moteur au couvercle : le moyeu 2
  // sort au-delà des trois étages, comme sur la vue éclatée.
  const ORDER = ['51', '27', '28', '49', '34', '5', '24', '15', '3', '31', '10', '6', '12', '43', '11', '17', '4', '48',
    '33', '37', '39', '21', '20', '8', '29', '13', '19', '7', '32', '36', '9', '22', '41', '38', '30', '14', '18',
    '2', '25', '44', '1', '46', '47', '16', '42', '23', '35', '26', '45', '40', '50'];
  // Chaque repère occupe sa longueur propre suivie d'un jeu de 30 mm.
  const GAP = 0.03;
  const boxes = new Map();
  for (const o of placed) {
    o.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(o);
    const r = o.userData.partRef;
    boxes.set(r, boxes.has(r) ? boxes.get(r).union(b) : b);
  }
  const start = new Map();
  let cursor = boxes.get('51').min.z - 0.25;
  for (const r of ORDER) {
    const b = boxes.get(r);
    start.set(r, cursor - b.min.z);
    cursor += b.max.z - b.min.z + GAP;
  }
  for (const o of placed) o.userData.explode.z += start.get(o.userData.partRef);
  return { view: { dir: [1.3, 0.5, 0.7] } };
}
