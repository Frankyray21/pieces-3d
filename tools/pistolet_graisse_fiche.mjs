// Écrit public/equipment/pistolet-graisse-1142/data.json : les cotes viennent du modèle
// (src/models/pistolet-graisse-1142/index.js), pour que la fiche et la 3D disent la même chose.
// Avec --page <fichier.html>, écrit aussi la page des cotes (pages/P02.webp en est une capture
// de 2 200 × 1 700 px) : vue de côté dessinée en SVG à partir des mêmes cotes, et le tableau des hypothèses.
// Usage : node tools/pistolet_graisse_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import {
  IN, ECHELLE, CORPS, BOUCHON, TIGE, POUSSOIR, RESSORT, TETE, LEVIER, C, PISTON, AXE, SIXPANS, SORTIE, RALLONGE, COUPLEUR,
  mmParPixel, surLevier, B, BIELLETTE, longRallonge, boutCoupleur, horsTout, volumeCorps, course,
  etat, boutPoignee, THETA_MAX, effortPoignee, STEPS,
} from '../src/models/pistolet-graisse-1142/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / IN) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };

const k = mmParPixel(), h = horsTout(), b = B();
const RAD = Math.PI / 180;
const EF = effortPoignee(), haut = etat(THETA_MAX);

// Contrôle du mécanisme, du levier rabattu au levier levé : biellette de longueur constante,
// piston sur sa verticale, qui remonte sans revenir en arrière.
let ok = true;
const echec = (msg) => { ok = false; console.log(`✕ ${msg}`); };
const N = 60;
for (let i = 0; i <= N; i++) {
  const t = (THETA_MAX * i) / N, e = etat(t);
  if (!e) { echec(`mécanisme démonté à ${fr(t / RAD, 1)}°`); continue; }
  if (Math.abs(Math.hypot(e.A[0] - C[0], e.A[1] - C[1]) - BIELLETTE()) > 1e-6) echec(`biellette faussée à ${fr(t / RAD, 1)}°`);
  if (Math.abs(e.B[0] - b[0]) > 1e-9) echec(`piston hors de sa tour à ${fr(t / RAD, 1)}°`);
  const avant = i > 0 ? etat((THETA_MAX * (i - 1)) / N) : null;
  if (avant && e.remonte <= avant.remonte) echec(`piston qui redescend à ${fr(t / RAD, 1)}°`);
}
if (Math.abs(haut.remonte - course()) > 0.01) echec(`course de ${fr(haut.remonte, 2)} mm au lieu de ${fr(course(), 2)}`);
const longCorps = CORPS.x1 - CORPS.x0;

const SOURCE = 'Photo du produit fournie par le client (capture d\'une fiche de détaillant, P01) : pistolet Lincoln 1142 de trois quarts, côté du levier ; aucun plan. Le guide d\'installation Lincoln des modèles 1142, 1147 et 1151 et la fiche des pièces de rechange existent mais n\'ont pas pu être consultés : les pièces internes et leurs numéros Lincoln ne sont donc pas tous connus';
const PUBLIE = 'Pistolet à graisse à levier « Heavy-Duty », Lincoln 1142 : pression de service maximale de 10 000 psi (690 bar), cartouche de 14,5 oz ou 16 oz de graisse en vrac, environ 28 coups à l\'once, longueur de 21 3/4 po (552 mm), pompe en fonte, livré avec rallonge rigide de 6 po et coupleur (données des détaillants). Le guide Lincoln donne pour le 1142 la rallonge 62028 et le coupleur 5852 (le 1147, même pistolet avec boyau souple de 18 po, a le boyau 71518 et le même coupleur). Masse publiée de 3 à 5 lb selon le détaillant';
const ECH = `La longueur publiée de ${po(ECHELLE.horsToutPo * IN)} (du bout de la poignée en T au bout du coupleur) couvre ${ECHELLE.horsToutPx} pixels le long de l'axe sur la photo : ${fr(k, 3)} mm par pixel. Le corps y mesure ${ECHELLE.corpsPx} pixels de diamètre (${mm(ECHELLE.corpsPx * k)}) et ${ECHELLE.corpsLongPx} pixels de long, bouchon compris (${mm(ECHELLE.corpsLongPx * k)}). La photo est prise en perspective : cotes à ±5 % environ`;

const pieces = [
  ['1', '', 1, 'TÊTE DE POMPE en fonte, collet taraudé sur le corps', { pseudo: true, note: `Collet de Ø ${mm(TETE.collet.d)} vissé sur le corps, tour du piston, âme et oreille de l'axe de la biellette, bossage de sortie. Clapets internes (bille et ressort de refoulement) non visibles : non modélisés. Formes relevées sur la photo.` }],
  ['2', '', 1, 'LEVIER embouti, poignée roulée', { pseudo: true, note: `Profilé en U de ${mm(LEVIER.large)} de large, ouvert vers le corps, roulé en poignée tubulaire de Ø ${mm(LEVIER.poignee.d)} ; ${mm(LEVIER.long)} de long. Les inscriptions embouties (« LINCOLN », « CAUTION ») ne sont pas dessinées. Vendu aussi seul chez Lincoln (« lever grease gun handle »).` }],
  ['3', '', 2, `FLASQUE DE BIELLETTE, entraxe de ${mm(BIELLETTE(), 1)}`, { pseudo: true, note: 'Une de chaque côté, du bout du levier (axe A) à l\'oreille de la tête (axe C) : elle laisse le bout du levier suivre la course du piston. Forme relevée sur la photo, épaisseur supposée.' }],
  ['4', '', 1, `PISTON DE POMPE trempé, Ø ${po(PISTON.d)} (supposé)`, { pseudo: true, note: `Poussé par le levier (axe B, à ${mm(Math.hypot(...LEVIER.B))} de l'axe A) dans la tour de la tête. Pour 28 coups à l'once (donnée publiée), la course est d'environ ${mm(course(), 1)} avec ce diamètre (supposé).` }],
  ['5', '', 3, `AXE d'articulation, Ø ${po(AXE.d)} (supposé)`, { pseudo: true, note: 'Axes A (levier et biellette), B (levier et piston) et C (biellette et tête), visibles sur la photo ; arrêts dessinés comme de simples têtes.' }],
  ['6', '', 1, `BOUCHON SIX PANS de la tête, 7/16 po sur plats (supposé)`, { pseudo: true, note: 'Visible sous la sortie, sur la face avant du collet. Sa fonction n\'est pas lisible sur la photo (bouchon de clapet ou raccord de remplissage) : à confirmer sur la fiche des pièces Lincoln.' }],
  ['7', '', 1, `CORPS (réservoir) en tube d'acier, Ø ${po(CORPS.d)}, peint bleu-gris`, { pseudo: true, note: `${mm(longCorps)} de long entre le bouchon et la tête (vissé aux deux bouts), gorges roulées relevées sur la photo. Reçoit une cartouche de 14,5 oz ou 16 oz de graisse en vrac.` }],
  ['8', '', 1, 'BOUCHON ARRIÈRE (« container cap »), percé pour la tige', { pseudo: true, note: `Ø ${mm(BOUCHON.d)}, vissé sur le corps. La tige du poussoir s'y accroche (encoche de verrouillage) pour garder le ressort comprimé pendant le chargement ; encoche non dessinée.` }],
  ['9', '', 1, 'TIGE DE POUSSOIR à poignée en T', { pseudo: true, note: `Tige de Ø ${po(TIGE.d)}, poignée en T de ${mm(TIGE.poignee.long)}. Montrée pistolet vide, comme sur la photo : la poignée est près du bouchon ; elle sort du bouchon à mesure qu'on remplit le pistolet.` }],
  ['10', '', 1, 'POUSSOIR (« follower ») à coupelle de cuir', { pseudo: true, note: `Coupelle de Ø ${mm(POUSSOIR.d)} entre deux rondelles, au bout de la tige ; pousse la graisse vers la pompe. Invisible sur la photo : forme courante, supposée. Montré en avant du corps (pistolet vide).` }],
  ['11', '', 1, 'RESSORT DU POUSSOIR', { pseudo: true, note: `Du fond du bouchon au poussoir, Ø ${mm(RESSORT.d)}, fil de ${mm(RESSORT.fil, 1)}, ${RESSORT.spires} spires (supposé) ; il tient la graisse contre l'entrée de la pompe.` }],
  ['12', '62028', 1, 'RALLONGE RIGIDE de 6 po, coudée', { note: `Tube d'acier de ${po(RALLONGE.d)} (${mm(longRallonge())} développés hors filets), vissé dans la sortie de la tête ; coudes relevés sur la photo. Numéro tiré du guide Lincoln (non vérifié sur la fiche des pièces).` }],
  ['13', '5852', 1, 'COUPLEUR HYDRAULIQUE à quatre mâchoires', { note: `Six pans de 9/16 po, nez de Ø ${mm(COUPLEUR.d)}, ${mm(COUPLEUR.long)} de long (cotes usuelles, supposées) ; se pousse sur le graisseur. Numéro tiré du guide Lincoln.` }],
];

const NOTE = `Reconstitution 3D d'après la photo du produit fournie par le client (P01), sans plan : la longueur hors tout publiée (21 3/4 po) donne l'échelle (${fr(k, 2)} mm par pixel). Pistolet montré vide, comme sur la photo : poussoir à l'avant du corps, poignée en T près du bouchon ; la coupe par l'axe montre le poussoir et son ressort. La tête de pompe, le levier, la biellette, les trois axes, le bouchon six pans, la rallonge coudée et le coupleur sont relevés sur la photo ; piston, poussoir et ressort, cachés, sont supposés. Les clapets internes de la tête, les joints et les inscriptions ne sont pas modélisés. Pour faire mieux : la fiche des pièces de rechange Lincoln du 1142 (vue éclatée et numéros), ou le pistolet mesuré au ruban.`;

const data = {
  id: 'pistolet-graisse-1142',
  name: 'Pistolet à graisse à levier Lincoln 1142',
  manufacturer: 'Lincoln Industrial (SKF)',
  category: 'Graissage manuel',
  serial: '',
  document: {
    title: 'Photo du produit fournie par le client (aucun plan) et données publiées par les détaillants',
    reference: '1142',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Données publiées', PUBLIE],
    ['Échelle du relevé', ECH],
    ['Mécanisme', `Levier à biellette : le bout du levier (axe A) est tenu par deux flasques articulées sur la tête (axe C) ; le piston est accroché au levier ${mm(Math.hypot(...LEVIER.B))} plus loin (axe B). On lève la poignée (le piston remonte et la graisse, poussée par le ressort du poussoir, entre sous lui), puis on la rabat contre le corps (le piston redescend et refoule la graisse). Levier rabattu, comme sur la photo, le piston est au fond de sa tour`],
    ['Course (modèle)', `Pour ${fr(course(), 1)} mm de course au piston (28 coups à l'once avec un piston de Ø ${po(PISTON.d)}, supposé), le levier se lève de ${fr(-THETA_MAX / RAD, 1)}° et le bout de la poignée parcourt ${mm(EF.course)} : rapport moyen de ${fr(EF.rapport, 1)} à 1. Pour 10 000 psi sous le piston (${fr(EF.force / 1000, 1)} kN), environ ${fr(EF.poignee)} N (${fr(EF.poignee / 9.81)} kg) sur la poignée — valeurs du modèle, pas du fabricant`],
    ['Encombrement', `${mm(h.long, 1)} hors tout (${po(h.long)}), de la poignée en T au bout du coupleur ; ${mm(h.haut)} du dessous du corps au-dessus de la poignée du levier ; poignée en T de ${mm(h.large)}`],
    ['Volume du corps', `${fr(volumeCorps())} cm³ entre le bouchon et la tête, ressort et poussoir compris — la capacité publiée est de 16 oz en vrac (environ 500 cm³) ou une cartouche de 14,5 oz`],
    ['Non modélisé', 'Clapets et joints de la tête, filets, encoche de verrouillage du bouchon, inscriptions du levier, cartouche de graisse'],
    ['À confirmer', 'Numéros Lincoln de toutes les pièces sauf la rallonge 62028 et le coupleur 5852, fonction du bouchon six pans, diamètre du piston, longueur exacte du corps (photo en perspective)'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Photo du produit fournie par le client : Lincoln 1142, de trois quarts, côté du levier',
    P02: 'Vue de côté et cotes retenues pour le modèle (relevées sur la photo, à l\'échelle de la longueur publiée)',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'HEAVY-DUTY LEVER-TYPE GREASE GUN, MODEL 1142',
      titleFr: 'Pistolet à graisse à levier, modèle 1142',
      pn: '1142',
      sheets: ['P01', 'P02'],
      note: NOTE,
      parts: [...pieces, ['14', '', null, 'Fonctionnement : le levier pousse le piston (scène animée)', { link: 'P02', no3d: true, pseudo: true }]],
    },
    P02: {
      title: 'HOW IT WORKS',
      titleFr: 'Fonctionnement : lever le levier, puis le rabattre',
      pn: '',
      sheets: ['P02', 'P01'],
      note: `Le même pistolet, levier animé en trois temps. ${STEPS.map((x) => x.text).join(' ')} La cinématique est celle des axes relevés sur la photo et d'un piston de Ø ${po(PISTON.d)} supposé : la course réelle du levier peut différer.`,
      parts: pieces,
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/pistolet-graisse-1142/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(ok ? `✓ mécanisme monté sur toute la levée (${N + 1} positions)` : '✕ mécanisme à revoir');
if (!ok) process.exitCode = 1;
console.log(`levée ${fr(-THETA_MAX / RAD, 1)}° ; poignée ${mm(EF.course)} ; rapport ${fr(EF.rapport, 2)} ; hors tout ${mm(h.long, 1)} ; corps ${mm(longCorps)} ; B (${fr(b[0], 1)}, ${fr(b[1], 1)}) ; biellette ${mm(BIELLETTE(), 1)} ; course ${mm(course(), 1)} ; volume ${fr(volumeCorps())} cm³`);

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  const K = 2.8, ox = 1257, oy = 700; // px/mm ; origine du repère du pistolet sur la page
  const X = (x) => ox + x * K, Y = (y) => oy - y * K;
  const poly = (pts, cls) => `<polyline points="${pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" class="${cls}"/>`;
  const rect = (x0, x1, r, cls, y = 0) => `<rect x="${X(x0)}" y="${Y(y + r)}" width="${(x1 - x0) * K}" height="${2 * r * K}" class="${cls}"/>`;
  const pt = (p, nom, dx = 12, dy = -12) => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="7" class="p"/><text x="${X(p[0]) + dx}" y="${Y(p[1]) + dy}" class="t">${nom}</text>`;
  const cote = (x0, x1, y, txt) => `<line x1="${X(x0)}" y1="${Y(y)}" x2="${X(x1)}" y2="${Y(y)}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${X((x0 + x1) / 2)}" y="${Y(y) - 10}" text-anchor="middle">${txt}</text>`;
  const coteV = (x, y0, y1, txt) => `<line x1="${X(x)}" y1="${Y(y0)}" x2="${X(x)}" y2="${Y(y1)}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${X(x) + 10}" y="${Y((y0 + y1) / 2) + 8}">${txt}</text>`;
  const L = LEVIER, joue = [[0, 8.5], [-218, 8.5], [-218, -6], [-120, -9.5], [-62, -17], [-8, -17], [10, -6], [10, 2], [0, 8.5]];
  const levier = joue.map(([X0, Y0]) => surLevier(-X0, Y0));
  const p = L.poignee, g0 = surLevier(p.de, -1), g1 = surLevier(L.long, -1);
  const r = RALLONGE.pts, bout = boutCoupleur(), arr = TIGE.xT - TIGE.poignee.d / 2;
  const schema = `
    ${rect(CORPS.x0, CORPS.x1, CORPS.d / 2, 'corps')}${rect(BOUCHON.x0, BOUCHON.x0 + BOUCHON.long, BOUCHON.d / 2, 'corps')}
    ${rect(TIGE.xT, BOUCHON.x0, TIGE.d / 2, 'tige')}${rect(TIGE.xT - TIGE.poignee.d / 2, TIGE.xT + TIGE.poignee.d / 2, TIGE.poignee.long / 2, 'tige')}
    ${rect(TETE.collet.x0, TETE.collet.x1, TETE.collet.d / 2, 'tete')}${rect(TETE.collet.x1, TETE.avant.x1, TETE.avant.d / 2, 'tete')}
    ${rect(b[0] - 12, b[0] + 12, (b[1] - 15 - 8) / 2, 'tete', (b[1] - 15 + 8) / 2)}
    ${rect(SORTIE.x - 14, SORTIE.x, 7.5, 'tete', SORTIE.y)}${rect(SORTIE.x, SORTIE.x + 7, RALLONGE.ecrou / 2, 'acier', SORTIE.y)}
    ${rect(TETE.collet.x1 + 10, TETE.collet.x1 + 10 + SIXPANS.long, SIXPANS.af / 2, 'acier', SIXPANS.y)}
    <polygon points="${[[b[0], 8], [b[0] + 8, b[1] - 17], [44, 26], [62, 24], [C[0] + 9, C[1] + 2], [C[0] + 6, C[1] - 8], [36, 4], [20, 6]].map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" class="tete"/>
    ${poly(levier, 'lev')}<line x1="${X(g0[0])}" y1="${Y(g0[1])}" x2="${X(g1[0])}" y2="${Y(g1[1])}" class="poi"/>
    <line x1="${X(b[0])}" y1="${Y(8)}" x2="${X(b[0])}" y2="${Y(b[1])}" class="pis"/>
    <line x1="${X(L.A[0])}" y1="${Y(L.A[1])}" x2="${X(C[0])}" y2="${Y(C[1])}" class="bie"/>
    ${poly(r, 'ral')}<line x1="${X(r[r.length - 1][0])}" y1="${Y(r[r.length - 1][1])}" x2="${X(bout[0])}" y2="${Y(bout[1])}" class="cou"/>
    ${poly(joue.map(([X0, Y0]) => { const q = surLevier(-X0, Y0), r0 = [q[0] - b[0], q[1] - b[1]], c = Math.cos(THETA_MAX), sn = Math.sin(THETA_MAX); return [haut.B[0] + r0[0] * c - r0[1] * sn, haut.B[1] + r0[0] * sn + r0[1] * c]; }), 'leve')}
    ${poly([etat(0), haut].map((e) => { const q = surLevier(p.de, -1), r0 = [q[0] - b[0], q[1] - b[1]], c = Math.cos(e.theta), sn = Math.sin(e.theta); return [e.B[0] + r0[0] * c - r0[1] * sn, e.B[1] + r0[0] * sn + r0[1] * c]; }).slice(1).concat([boutPoignee(haut)]), 'levePoi')}
    <text x="${X(-40)}" y="${Y(170)}" class="tb">levier levé de ${fr(-THETA_MAX / RAD)}° : piston remonté de ${mm(course(), 1)}</text>
    ${pt(L.A, 'A', -10, -18)}${pt(b, 'B', -34, -14)}${pt(C, 'C', 14, 6)}
    ${cote(arr, bout[0], -80, `${mm(h.long, 1)} hors tout (21 3/4 po, publié)`)}
    ${cote(CORPS.x0, CORPS.x1, -60, `corps ${mm(CORPS.x1 - CORPS.x0)}`)}
    ${cote(r[0][0], bout[0], -60, `rallonge 62028 et coupleur 5852`)}
    ${coteV(-120, -CORPS.d / 2, CORPS.d / 2, `Ø ${mm(CORPS.d)}`)}
    ${cote(L.A[0] - L.long, L.A[0], 125, `levier ${mm(L.long)}`)}
    <text x="${X(-200)}" y="${Y(-4)}" class="blanc">corps (réservoir)</text><text x="${X(TETE.collet.x0)}" y="${Y(40)}">tête</text>
    <text x="${X(80)}" y="${Y(-5)}">rallonge</text><text x="${X(b[0] + 6)}" y="${Y(30)}" class="tp">piston</text><text x="${X(C[0] + 10)}" y="${Y(40)}" class="tb">biellette</text>
    <text x="${X(TIGE.xT - 30)}" y="${Y(42)}">poignée en T</text>`;
  const lignes = data.specs.slice(2).map(([t, v]) => `<tr><th>${t}</th><td>${v}</td></tr>`).join('')
    + pieces.map(([n, pn, q, d]) => `<tr><th>${n}${pn ? ` — ${pn}` : ''}</th><td>${q} × ${d}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:22px/1.32 system-ui,sans-serif;color:#1d2125}
    h1{font-size:38px;margin:40px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:110px}
    .corps{fill:#4a5672;stroke:#1d2125;stroke-width:2}.tige{fill:#1d2230}.tete{fill:#c4c8cc;stroke:#555;stroke-width:2}.acier{fill:#aab0b6;stroke:#555;stroke-width:2}
    .lev{fill:#dfe2e5;stroke:#1d2125;stroke-width:3}.poi{stroke:#9aa1a8;stroke-width:${LEVIER.poignee.d * K};stroke-linecap:round}
    .pis{stroke:#7d858c;stroke-width:${PISTON.d * K}}.bie{stroke:#1b6fb5;stroke-width:${13 * K};stroke-linecap:round;opacity:.8}
    .ral{fill:none;stroke:#8a929b;stroke-width:${RALLONGE.d * K};stroke-linejoin:round}.cou{stroke:#6b737c;stroke-width:${COUPLEUR.d * K}}
    .p{fill:#fff;stroke:#1d2125;stroke-width:3}.leve{fill:none;stroke:#1b6fb5;stroke-width:3;stroke-dasharray:10 7}.levePoi{fill:none;stroke:#1b6fb5;stroke-width:${LEVIER.poignee.d * K};stroke-linecap:round;opacity:.35}.c{stroke:#c0392b;stroke-width:2}
    text{font-size:22px;fill:#1d2125}text.t{font-weight:700;font-size:26px}text.blanc{fill:#fff}text.tb{fill:#1b6fb5}text.tp{fill:#555}
    table{position:absolute;left:70px;top:1060px;width:2060px;border-collapse:collapse;font-size:16px;line-height:1.22}
    th{width:250px;text-align:left;vertical-align:top;padding:3px 12px 3px 0;color:#444}td{padding:3px 0;border-top:1px solid #ddd}
    </style><h1>Pistolet à graisse à levier Lincoln 1142 — vue de côté et cotes du modèle</h1>
    <p class="s">Aucun plan : cotes relevées sur la photo du produit, mise à l'échelle par la longueur hors tout publiée (${fr(k, 3)} mm par pixel). A, B, C : axes du levier, du piston et de la biellette.</p>
    <svg width="2200" height="990"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>${schema}</svg>
    <table>${lignes}</table></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
