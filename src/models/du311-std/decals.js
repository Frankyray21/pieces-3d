// P022 — Trousse d'autocollants ISO du DU311 (« DECAL KIT, DU311 ISO », repère 9 de
// la finition P020), repère machine (voir layout.js). Pictogrammes ISO 7010 / 3864
// dessinés en géométrie, sans texture : avertissement (triangle jaune bordé de
// noir), obligation (disque bleu, symbole blanc), interdiction (cercle rouge barré),
// information (carré bleu) et étiquettes de texte (lignes grises), chacun avec son
// symbole simplifié. Emplacements choisis d'après l'organe concerné (capots,
// stabilisateurs, articulation, glissière, avance…) : les vues du manuel ne les
// situent pas. Les autocollants posés sur une partie mobile suivent son corps
// (simulation).
import { M, body } from './layout.js';
import { FEED } from './feed.js';
import { SLIDE } from './slide.js';
import { feedToMachine as fm } from './machine.js';

const FT = M.frameTop, FZ = M.frameZ;
// Rotation d'un autocollant construit face à +Z pour la normale de la surface d'appui.
const FACE = {
  '+z': [0, 0, 0], '-z': [0, Math.PI, 0], '+x': [0, Math.PI / 2, 0], '-x': [0, -Math.PI / 2, 0], '+y': [-Math.PI / 2, 0, 0],
};
const NORMAL = { '+z': [0, 0, 1], '-z': [0, 0, -1], '+x': [1, 0, 0], '-x': [-1, 0, 0], '+y': [0, 1, 0] };
// Couches (hauteur au-dessus de la surface, m) : plaque, fond du pictogramme, fond
// intérieur (triangle jaune), symbole.
const Z = { plate: 0.0015, back: 0.0028, inner: 0.004, sym: 0.0052 };

/** Symboles simplifiés, dessinés dans un carré unité centré (y vers le haut). */
const SYMBOLS = {
  '!': (S) => [S.at(S.box(0.14, 0.5, 1), [0, 0.08, 0]), S.at(S.box(0.14, 0.14, 1), [0, -0.38, 0])],
  volt: (S) => [S.extrude([[0.08, 0.55], [-0.24, 0.0], [-0.02, 0.02], [-0.12, -0.52], [0.24, 0.08], [0.02, 0.06]], 1)],
  hot: (S) => [-0.22, 0, 0.22].map((x) => S.at(S.box(0.09, 0.5, 1), [x, 0.1, 0], [0, 0, 0.25])).concat(S.at(S.box(0.7, 0.1, 1), [0, -0.3, 0])),
  pinch: (S) => [S.at(S.cyl(0.2, 1, undefined, { axis: 'z', seg: 20 }), [-0.21, 0.12, 0]), S.at(S.cyl(0.2, 1, undefined, { axis: 'z', seg: 20 }), [0.21, 0.12, 0]), S.at(S.box(0.12, 0.35, 1), [0, -0.2, 0])],
  rot: (S) => [S.ring(0.36, 0.25, 1, undefined, { axis: 'z', seg: 28 }), S.at(S.extrude([[0.18, 0.1], [0.48, 0.1], [0.33, -0.1]], 1), [0, 0.05, 0])],
  laser: (S) => [0, 1, 2, 3].map((i) => S.at(S.box(0.07, 0.8, 1), [0, 0, 0], [0, 0, (i * Math.PI) / 4])).concat(S.cyl(0.13, 1, undefined, { axis: 'z', seg: 20 })),
  crush: (S) => [S.at(S.cyl(0.1, 1, undefined, { axis: 'z', seg: 16 }), [0, -0.02, 0]), S.at(S.box(0.16, 0.3, 1), [0, -0.3, 0]), S.at(S.box(0.7, 0.12, 1), [0, 0.32, 0])],
  leak: (S) => [S.at(S.box(0.16, 0.4, 1), [-0.22, -0.2, 0])].concat([[0.0, 0.25], [0.18, 0.08], [0.3, -0.12], [0.12, 0.3]].map(([x, y]) => S.at(S.cyl(0.06, 1, undefined, { axis: 'z', seg: 12 }), [x, y, 0]))),
  air: (S) => [0.22, 0, -0.22].map((y, i) => S.at(S.box(0.6 - i * 0.12, 0.08, 1), [0, y, 0])),
  person: (S) => [S.at(S.cyl(0.12, 1, undefined, { axis: 'z', seg: 16 }), [0, 0.28, 0]), S.at(S.box(0.24, 0.5, 1), [0, -0.15, 0])],
  ear: (S) => [S.at(S.ring(0.3, 0.22, 1, undefined, { axis: 'z', seg: 24 }), [0, 0.05, 0]), S.at(S.box(0.14, 0.26, 1), [-0.3, -0.12, 0]), S.at(S.box(0.14, 0.26, 1), [0.3, -0.12, 0])],
  belt: (S) => [S.at(S.cyl(0.11, 1, undefined, { axis: 'z', seg: 16 }), [0, 0.3, 0]), S.at(S.box(0.26, 0.48, 1), [0, -0.12, 0]), S.at(S.box(0.08, 0.7, 1), [0, -0.05, 0], [0, 0, 0.7])],
  book: (S) => [S.at(S.box(0.26, 0.5, 1), [-0.15, 0, 0], [0, 0, 0.1]), S.at(S.box(0.26, 0.5, 1), [0.15, 0, 0], [0, 0, -0.1])],
  climb: (S) => [S.at(S.cyl(0.1, 1, undefined, { axis: 'z', seg: 16 }), [0.05, 0.32, 0]), S.at(S.box(0.2, 0.4, 1), [0.05, 0, 0]), ...[-0.25, 0.0, 0.25].map((y) => S.at(S.box(0.5, 0.05, 1), [-0.12, y - 0.12, 0]))],
  flame: (S) => [S.extrude([[0, 0.5], [0.22, 0.12], [0.22, -0.18], [0.1, -0.35], [-0.1, -0.35], [-0.22, -0.18], [-0.22, 0.12], [-0.05, 0.22]], 1)],
  water: (S) => [S.at(S.box(0.4, 0.12, 1), [-0.15, 0.1, 0])].concat([[0.15, 0.25], [0.25, 0.08], [0.2, -0.12], [0.08, -0.25]].map(([x, y]) => S.at(S.box(0.2, 0.05, 1), [x + 0.05, y, 0], [0, 0, y]))),
  drop: (S) => [S.extrude([[0, 0.42], [0.22, 0.0], [0.2, -0.2], [0.08, -0.32], [-0.08, -0.32], [-0.2, -0.2], [-0.22, 0.0]], 1)],
  battery: (S) => [S.box(0.6, 0.36, 1), S.at(S.box(0.1, 0.08, 1), [-0.18, 0.22, 0]), S.at(S.box(0.1, 0.08, 1), [0.18, 0.22, 0])],
  fuel: (S) => [S.at(S.box(0.36, 0.56, 1), [-0.08, -0.04, 0]), S.at(S.box(0.08, 0.36, 1), [0.24, 0.0, 0]), S.at(S.box(0.2, 0.06, 1), [0.17, 0.2, 0])],
  oil: (S) => [S.at(S.box(0.5, 0.3, 1), [-0.05, -0.1, 0]), S.at(S.box(0.3, 0.06, 1), [0.3, 0.08, 0], [0, 0, 0.5]), S.at(S.cyl(0.05, 1, undefined, { axis: 'z', seg: 10 }), [0.46, -0.1, 0])],
  slope: (S) => [S.extrude([[-0.42, -0.3], [0.42, -0.3], [0.42, 0.25]], 1)],
  stop: (S) => [S.cyl(0.32, 1, undefined, { axis: 'z', seg: 28 })],
};

/**
 * Autocollant (face vers +Z, dos à z = 0). kind : 'W' avertissement, 'M' obligation,
 * 'P' interdiction, 'I' information, 'E' arrêt d'urgence, 'T' texte seul, 'D' danger
 * (bandeau rouge « DANGER », pictogramme, texte) ; sym : symbole. Les formes sont
 * fusionnées par matière (un maillage par couleur).
 */
export function decal(S, kind, sym, w, h) {
  const { box, cyl, ring, extrude, at, merged, group } = S;
  const mat = (name) => box(0.001, 0.001, 0.001, name).material; // matériau partagé d'après son nom
  const out = [at(box(w, h, Z.plate, kind === 'E' ? 'safety' : 'white'), [0, 0, Z.plate / 2])];
  const portrait = h > w * 1.25;
  const head = kind === 'D' ? h * 0.2 : 0; // bandeau « DANGER »
  const s = Math.min(w, portrait ? h * 0.55 : h) * (kind === 'D' ? 0.62 : 0.84); // taille du pictogramme
  const py = portrait ? h / 2 - head - s / 2 - w * 0.06 : 0;
  const t = Z.back - Z.plate;
  const back = (o) => at(o, [o.position.x, o.position.y + py, (Z.plate + Z.back) / 2]);
  const symbol = (name, k, color, dy = 0) => (SYMBOLS[name] || SYMBOLS['!'])(S).map((o) => {
    o.position.multiplyScalar(k);
    o.position.y += py + dy;
    o.position.z = (Z.inner + Z.sym) / 2;
    o.scale.set(k, k, Z.sym - Z.inner);
    o.traverse((m) => { if (m.isMesh) m.material = mat(color); });
    return o;
  });
  if (kind === 'W') {
    const tri = (k) => [[-k / 2, -k * 0.38], [k / 2, -k * 0.38], [0, k * 0.49]];
    out.push(back(extrude(tri(s), t, 'black')), at(extrude(tri(s * 0.76), Z.inner - Z.back, 'safety'), [0, py - s * 0.012, (Z.back + Z.inner) / 2]));
    out.push(...symbol(sym, s * 0.42, 'black', -s * 0.07));
  } else if (kind === 'M') {
    out.push(back(cyl(s * 0.48, t, 'blue', { axis: 'z', seg: 32 })), ...symbol(sym, s * 0.62, 'white'));
  } else if (kind === 'P') {
    out.push(back(ring(s * 0.48, s * 0.38, t, 'red', { axis: 'z', seg: 32 })), ...symbol(sym, s * 0.55, 'black'));
    out.push(at(box(s * 0.09, s * 0.86, 0.0012, 'red'), [0, py, Z.sym + 0.0006], [0, 0, Math.PI / 4]));
  } else if (kind === 'I') {
    out.push(back(box(s * 0.9, s * 0.9, t, 'blue')), ...symbol(sym, s * 0.62, 'white'));
  } else if (kind === 'E') {
    out.push(back(cyl(s * 0.46, t, 'red', { axis: 'z', seg: 32 })));
  } else if (kind === 'D') {
    const hy = h / 2 - head / 2 - w * 0.03;
    out.push(at(box(w * 0.92, head, t, 'red'), [0, hy, (Z.plate + Z.back) / 2]));
    out.push(at(box(w * 0.55, head * 0.3, Z.inner - Z.back, 'white'), [w * 0.08, hy, (Z.back + Z.inner) / 2]));
    out.push(at(extrude([[-head * 0.32, -head * 0.3], [head * 0.32, -head * 0.3], [0, head * 0.34]], Z.inner - Z.back, 'white'), [-w * 0.32, hy, (Z.back + Z.inner) / 2]));
    out.push(...symbol(sym, s * 0.9, 'black'));
  }
  // lignes de texte (panneau inférieur, ou toute l'étiquette pour 'T')
  const lines = kind === 'T' ? Math.max(1, Math.round(h / 0.016)) : kind === 'D' ? 5 : portrait ? 3 : 0;
  const top = kind === 'T' ? h / 2 - h / (lines + 1) : py - s / 2 - w * 0.12;
  for (let i = 0; i < lines; i++) {
    const lw = w * (kind === 'T' ? (i % 3 === 2 ? 0.55 : 0.8) : [0.8, 0.72, 0.8, 0.66, 0.5][i]);
    const step = kind === 'T' ? h / (lines + 1) : w * 0.11;
    out.push(at(box(lw, Math.min(0.006, step * 0.45), t, kind === 'T' && i === 0 ? 'black' : 'charcoal'), [kind === 'T' ? (lw - w * 0.8) / 2 : 0, top - i * step, (Z.plate + Z.back) / 2]));
  }
  // un maillage par matière
  const byMat = new Map();
  for (const o of out) {
    o.updateMatrixWorld(true);
    o.traverse((m) => { if (m.isMesh) { const l = byMat.get(m.material) || []; l.push(m); byMat.set(m.material, l); } });
  }
  return group(...[...byMat].map(([material, list]) => merged(list, material)));
}

/** Lettres « DU311 » en blocs (afficheur à segments), face +Z, hauteur hL. */
function letters(S, text, hL, material = 'black') {
  const t = hL * 0.18, w = hL * 0.56, g = hL * 0.2;
  const SEG = { D: 'adefBCxy', U: 'bcdef', 3: 'abcdg', 1: 'bc' };
  const seg = {
    a: [0, hL / 2 - t / 2, w, t], d: [0, -hL / 2 + t / 2, w, t], g: [0, 0, w, t],
    b: [w / 2 - t / 2, hL / 4, t, hL / 2], c: [w / 2 - t / 2, -hL / 4, t, hL / 2],
    f: [-w / 2 + t / 2, hL / 4, t, hL / 2], e: [-w / 2 + t / 2, -hL / 4, t, hL / 2],
    // D : barres haute et basse raccourcies, montant droit court, coins coupés (x, y)
    B: [w / 2 - t / 2, 0, t, hL - 3.2 * t], C: [w / 2 - t / 2, 0, t, 0.001],
  };
  const cut = (sy) => [w / 2 - t * 0.95, sy * (hL / 2 - t * 0.95), t * 1.15, t, sy * Math.PI / 4];
  const total = text.length * w + (text.length - 1) * g;
  const parts = [];
  [...text].forEach((ch, i) => {
    const x0 = -total / 2 + w / 2 + i * (w + g) + (ch === '1' ? -w * 0.25 : 0);
    for (const k of SEG[ch]) {
      if (k === 'x' || k === 'y') {
        const [x, y, sw, sh, r] = cut(k === 'x' ? 1 : -1);
        parts.push(S.at(S.box(sw, sh, 0.002), [x0 + x, y, 0.001], [0, 0, r]));
        continue;
      }
      const [x0s, y, sw0, sh] = seg[k];
      const shortBar = ch === 'D' && (k === 'a' || k === 'd'); // barres de D raccourcies à droite
      const x = shortBar ? -0.8 * t : x0s, sw = shortBar ? w - 1.6 * t : sw0;
      parts.push(S.at(S.box(sw, sh, 0.002), [x0 + x, y, 0.001]));
    }
  });
  parts.forEach((o) => o.updateMatrixWorld(true));
  return S.merged(parts, material);
}

export function P022(api) {
  const S = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const B = SLIDE.base, X = SLIDE.frameX;
  // Pose : position sur la surface, face (normale), corps mobile éventuel.
  const put = (obj, pos, face, bodyName) => {
    const n = NORMAL[face];
    api.S.at(obj, [pos[0] + n[0] * 0.0005, pos[1] + n[1] * 0.0005, pos[2] + n[2] * 0.0005], FACE[face]);
    return bodyName ? body(bodyName, obj) : obj;
  };
  const out = (face, k = 0.15) => NORMAL[face].map((v) => v * k);
  const sticker = (ref, kind, sym, size, places) => {
    for (const [pos, face, b] of places) {
      const [w, h] = size;
      P(ref, put(decal(S, kind, sym, w, h), pos, face, b), out(face));
    }
  };
  const ISO = [0.085, 0.14], SQ = [0.07, 0.07], LBL = [0.11, 0.04];
  const E = M.engine, C = M.cab;
  const eng = 0.98, hood = 0.962; // flancs du capot moteur et du capot du surpresseur
  const side = FZ + 0.015; // face extérieure des flancs de châssis
  // mât de l'avance, flanc gauche (vu de la machine : face +Z)
  const mast = (y, z = 0.1) => { const p = fm([-FEED.W / 2, y, z]); return [p[0], p[1], p[2]]; };

  // 1 — utiliser trois points d'appui : marchepied de la cabine, marchepied arrière
  sticker('1', 'M', 'climb', ISO, [[[-0.75, FT + 0.3, C.z1], '+z'], [[M.rear + 0.005, 0.74, -0.3], '-x']]);
  // 2 — inclinomètres ±45° : cadre de la glissière et mât de l'avance
  const incl = () => api.S.group(
    api.S.box(0.09, 0.09, 0.03, 'black', { r: 0.006 }),
    api.S.at(api.S.gauge(0.035, { axis: 'z' }), [0, 0, 0.016]),
  );
  P('2', body('tilt', api.S.at(incl(), [X + 0.06, 2.0, 0.825 + 0.015])), [0, 0, 0.2]);
  P('2', body('ext', api.S.at(incl(), [mast(1.95, -0.05)[0], mast(1.95)[1], mast(1.95)[2] + 0.015])), [0, 0, 0.2]);
  // 3 — fluide hydraulique : réservoir hydraulique
  sticker('3', 'I', 'drop', SQ, [[[0.46, FT + 0.42, 0.45], '+z', 'front']]);
  // 4 — air comprimé : flancs du socle de la glissière (réservoir d'air)
  sticker('4', 'W', 'air', ISO, [[[2.42, 0.86, B.z + 0.0125], '+z', 'front'], [[2.42, 0.86, -B.z - 0.0125], '-z', 'front']]);
  // 5 — entraînement en rotation : haut du mât de l'avance
  sticker('5', 'W', 'rot', ISO, [[mast(2.25), '+z', 'ext'], [mast(2.25, -0.08), '+z', 'ext']]);
  // 6 — coupe-batterie : soubassement du capot moteur
  sticker('6', 'I', 'battery', SQ, [[[-1.3, FT + 0.12, 0.62], '+z']]);
  // 7 — surface chaude : capots du moteur et du surpresseur, flanc près du moteur électrique
  sticker('7', 'W', 'hot', ISO, [
    [[-1.3, 1.6, eng], '+z'], [[-1.3, 1.62, -eng], '-z'], [[-3.69, 1.75, hood], '+z'],
    [[-4.29, 1.75, hood], '+z'], [[1.0, 0.6, side], '+z', 'front'],
  ]);
  // 8 — diesel seulement : flanc gauche du châssis arrière (réservoir de carburant)
  sticker('8', 'I', 'fuel', SQ, [[[-1.85, 0.62, -side], '-z']]);
  // 9 — remplissage d'huile : réservoir hydraulique, capot moteur, surpresseur
  sticker('9', 'I', 'oil', SQ, [[[0.3, FT + 0.5, 0.45], '+z', 'front'], [[-2.6, E.top, 0.55], '+y'], [[-3.69, 1.17, hood], '+z']]);
  // 10 — haute tension : flancs avant (moteur électrique 600 V), boîte de raccordement
  // arrière, capot du surpresseur, enrouleur
  sticker('10', 'W', 'volt', ISO, [
    [[0.5, 0.6, side], '+z', 'front'], [[0.5, 0.6, -side], '-z', 'front'], [[-3.2, 0.74, FZ + 0.036], '+z'],
    [[-3.69, 1.52, hood], '+z'], [[-4.29, 1.5, hood], '+z'], [[-2.64, 1.42, eng], '+z'],
  ]);
  // 11 — éloigner le personnel : bas du mât de l'avance (deux faces de pose)
  sticker('11', 'P', 'person', ISO, [[mast(1.2), '+z', 'ext'], [mast(0.85, -0.08), '+z', 'ext']]);
  // 12 — opérateur qualifié, 13 — ceinture de sécurité : cabine (paroi avant, montant)
  sticker('12', 'M', 'book', SQ, [[[C.x1, FT + 0.32, 0.65], '+x']]);
  sticker('13', 'M', 'belt', SQ, [[[C.x1, FT + 0.32, 0.12], '+x']]);
  // 14 — fuite haute pression : couvercle du distributeur de mise en place
  sticker('14', 'W', 'leak', ISO, [[[0.69 - 0.006, 1.67, 0.2], '-x', 'front']]);
  // 15 — air de respiration : dessus du capot du surpresseur
  sticker('15', 'W', 'air', ISO, [[[-4.15, 1.95, 0.55], '+y']]);
  // 16 — relâcher la pression : couvercle du distributeur de forage, socle de la glissière
  sticker('16', 'M', 'book', SQ, [[[0.69 - 0.006, 1.67, -0.25], '-x', 'front'], [[2.75, 0.9, B.z + 0.0125], '+z', 'front']]);
  // 17 — vérins des stabilisateurs : fûts avant et arrière
  const ox = 2.62, oz = B.z + 0.18;
  sticker('17', 'W', 'crush', ISO, [
    [[ox, 0.8, oz], '+z', 'front'], [[ox, 0.8, -oz], '-z', 'front'],
    [[M.jackX, FT - 0.05, 0.95], '+z'], [[M.jackX, FT - 0.05, -0.95], '-z'],
  ]);
  // 18 — flammes interdites : réservoir de carburant
  sticker('18', 'P', 'flame', ISO, [[[-1.6, 0.66, -side], '-z']]);
  // 19 — arbre exposé : entraînement du surpresseur (côté gauche du capot)
  sticker('19', 'W', 'rot', [0.06, 0.1], [[[-3.64, 1.25, -hood], '-z'], [[-3.64, 1.75, -hood], '-z']]);
  // 20 — laser : cadre de la glissière, près du laser d'alignement
  sticker('20', 'W', 'laser', ISO, [[[X - 0.06, 1.62, 0.825], '+z', 'tilt'], [[X - 0.06, 1.62, -0.825], '-z', 'tilt']]);
  // 21 — point de pincement : articulation, socle et cadre de la glissière, mât
  sticker('21', 'W', 'pinch', ISO, [
    [[0.36, 0.62, side], '+z', 'front'], [[0.36, 0.62, -side], '-z', 'front'],
    [[-0.38, 0.62, side], '+z'], [[-0.38, 0.62, -side], '-z'],
    [[2.7, 0.86, B.z + 0.0125], '+z', 'front'], [[2.7, 0.86, -B.z - 0.0125], '-z', 'front'],
    [[X + 0.06, 1.4, 0.825], '+z', 'tilt'], [[X + 0.06, 1.4, -0.825], '-z', 'tilt'],
    [mast(0.55), '+z', 'ext'], [mast(1.6, -0.08), '+z', 'ext'],
  ]);
  // 22 — protection auditive : capot du surpresseur
  sticker('22', 'M', 'ear', SQ, [[[-4.29, 1.27, hood], '+z']]);
  // 23 — ne pas laver à haute pression : panneau de manomètres, boîte de raccordement arrière
  sticker('23', 'P', 'water', SQ, [[[0.97, 1.27, 0.94], '+z', 'front'], [[-2.92, 0.74, FZ + 0.036], '+z']]);
  // 24 — arrêt d'urgence : disque jaune autour du bouton de l'avance et dans la cabine
  sticker('24', 'E', 'stop', [0.13, 0.13], [[mast(0.85, 0.1), '+z', 'ext']]);
  // 25 — zone d'écrasement : articulation, deux côtés (châssis avant)
  sticker('25', 'W', 'crush', ISO, [[[0.55, 0.88, side], '+z', 'front'], [[0.55, 0.88, -side], '-z', 'front']]);
  // 26 — autocollant ISO (sans libellé au manuel) : paroi avant de la cabine
  sticker('26', 'I', 'book', SQ, [[[C.x1, FT + 0.32, 0.38], '+x']]);
  // 27 — pente maximale : flanc droit de la cabine
  sticker('27', 'I', 'slope', [0.1, 0.07], [[[-0.3, FT + 0.3, C.z1], '+z']]);
  // 28 — filtre à air (mine), 34 — niveau d'huile moteur, 35 — niveau de liquide de
  // refroidissement : capot moteur, côté gauche
  sticker('28', 'T', '', LBL, [[[-2.22, 1.84, -eng], '-z']]);
  sticker('34', 'T', '', LBL, [[[-2.4, 1.5, -eng], '-z']]);
  sticker('35', 'T', '', LBL, [[[-2.0, 1.5, -eng], '-z']]);
  // 29 — filtre à huile du surpresseur : capot du surpresseur
  sticker('29', 'T', '', LBL, [[[-4.29, 1.1, hood], '+z']]);
  // 30, 31 — filtres de retour hydraulique, 32 — pompe de remplissage : flancs du châssis avant
  sticker('30', 'T', '', LBL, [[[1.5, 0.52, side], '+z', 'front']]);
  sticker('31', 'T', '', LBL, [[[1.5, 0.47, side], '+z', 'front']]);
  sticker('32', 'T', '', LBL, [[[1.02, 0.52, -side], '-z', 'front']]);
  // 33 — pression hydraulique : panneau de manomètres et couvercles des distributeurs
  sticker('33', 'T', '', [0.12, 0.03], [
    [[0.97, 1.87, 0.94], '+z', 'front'], [[0.69 - 0.006, 1.74, 0.55], '-x', 'front'], [[0.69 - 0.006, 1.74, -0.6], '-x', 'front'],
  ]);
  // 36 — logo, blanc : flancs du capot moteur (bandeau)
  for (const s of [1, -1]) P('36', put(api.S.box(0.5, 0.1, 0.002, 'white'), [(E.x0 + E.x1) / 2, 1.82, s * eng], s > 0 ? '+z' : '-z'), out(s > 0 ? '+z' : '-z'));
  // 37 — « DU311 » : flancs du capot du surpresseur
  for (const s of [1, -1]) P('37', put(letters(api.S, 'DU311', 0.07), [-4.0, 1.85, s * hood], s > 0 ? '+z' : '-z'), out(s > 0 ? '+z' : '-z'));
  return { view: { dir: [0.9, 0.5, 1.1] } };
}
