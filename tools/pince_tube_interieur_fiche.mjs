// Écrit public/equipment/pince-tube-interieur/data.json : les cotes viennent du modèle
// (src/models/pince-tube-interieur/index.js), pour que la fiche et la 3D disent la même chose.
// Vérifie au passage que la genouillère reste montée sur toute sa course.
// Avec --page <fichier.html>, écrit aussi la page des cotes (pages/P03.webp en est une capture
// de 2 200 × 1 700 px) : le schéma du mécanisme et des coquilles, et le tableau des hypothèses.
// Usage : node tools/pince_tube_interieur_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import {
  L, TUBE, COQUILLE, R_INT, R_EXT, EP, A, B0, C0, D, FIXES, LEVIER, BIELLETTE, VIS, RIVET,
  T_MORT, T_MAX, THETA_MAX, etat, jour, pointMachoire, pointPoignee, STEPS,
} from '../src/models/pince-tube-interieur/index.js';

const RAD = Math.PI / 180;
const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

// Contrôle du mécanisme, de verrouillé à ouvert : pièces de longueur constante,
// mâchoire qui s'ouvre sans revenir en arrière après le point mort.
let ok = true;
const echec = (msg) => { ok = false; console.log(`✕ ${msg}`); };
const N = 60;
for (let i = 0; i <= N; i++) {
  const t = (T_MAX * i) / N, e = etat(t);
  if (!e) { echec(`mécanisme démonté à ${fr(t / RAD, 1)}°`); continue; }
  if (Math.abs(dist(e.C, D) - BIELLETTE) > 1e-6) echec(`biellette de ${fr(dist(e.C, D), 3)} mm à ${fr(t / RAD, 1)}°`);
  if (Math.abs(dist(e.B, e.C) - dist(B0, C0)) > 1e-6) echec(`poignée déformée à ${fr(t / RAD, 1)}°`);
  if (Math.abs(dist(e.B, A) - dist(B0, A)) > 1e-6) echec(`mâchoire déformée à ${fr(t / RAD, 1)}°`);
  if (Math.abs(dist(pointPoignee(C0, e), e.C)) > 1e-6) echec(`poignée mal posée à ${fr(t / RAD, 1)}°`);
  const avant = i > 0 ? etat((T_MAX * (i - 1)) / N) : null;
  if (avant && t > T_MORT + T_MAX / N && e.theta <= avant.theta) echec(`mâchoire qui ne s'ouvre plus à ${fr(t / RAD, 1)}°`);
}
const mort = etat(T_MORT), ouvert = etat(T_MAX);
if (!(mort.theta < 0)) echec('pas de point mort entre la position verrouillée et l\'ouverture');
const serrageMort = jour(0) - jour(mort.theta);
const bec = pointMachoire([TUBE.x, TUBE.y + R_EXT], THETA_MAX);

const SOURCE = 'Deux images fournies par le client, sans plan ni cote : la page du produit « Pinces pour tubes intérieurs » de TIME Limited (P01), qui montre une pince-étau en C orange à patins carrés, et une photo d\'atelier (P02) d\'une pince du même genre dont les patins sont deux coquilles rondes soudées aux becs. Demande du client : la pince de la page TIME, mais à patins ronds et de couleur métallique';
const PUBLIE = '« Cet outil est conçu pour saisir fermement et soutenir le tube intérieur, permettant l\'enlèvement des tubes intérieurs étendus. Ils sont réglables pour n\'importe quelle taille de tube intérieur. » Numéros 92-1005 (« Adjustable inner tube pliers single ») et 92-1006 (« double »). Aucune dimension n\'est publiée';
const AFAIRE = 'Pour faire mieux : la pince sur une table avec une règle, de face et de côté, et le calibre du tube intérieur utilisé — la longueur, les épaisseurs et les coquilles seraient alors des mesures et non des hypothèses.';

const pieces = [
  ['1', '', 1, 'CORPS (poignée fixe) en tôle emboutie, bague taraudée au bout', { pseudo: true, note: `Profilé en U de ${mm(EP.large)} de large, tôle de ${mm(EP.tole, 1)} (supposé), ouvert vers la poignée mobile. Il porte la mâchoire fixe (deux rivets), le pivot de la mâchoire mobile, le crochet du ressort et la vis de réglage. Contour relevé sur la photo de la page TIME.` }],
  ['2', '', 1, 'MÂCHOIRE FIXE en C, rivée dans le corps', { pseudo: true, note: `Plat découpé de ${mm(EP.machoire)} (supposé), bras de 17 mm de large. Bras relevé sur la photo, puis allongé pour que le bec arrive au sommet de la coquille ronde.` }],
  ['3', '', 1, 'MÂCHOIRE MOBILE en C, sur son pivot', { pseudo: true, note: `Même plat de ${mm(EP.machoire)}. Son moyeu est percé pour le pivot du corps, pour l'articulation de la poignée mobile (à ${mm(dist(A, B0), 1)} du pivot) et pour le ressort.` }],
  ['4', '', 1, 'POIGNÉE MOBILE en tôle emboutie', { pseudo: true, note: `Elle chevauche la mâchoire mobile et porte la biellette, à ${mm(dist(B0, C0), 1)} de son articulation, et le levier de déverrouillage. Bout relevé, comme sur la photo.` }],
  ['5', '', 1, `BIELLETTE de la genouillère, ${mm(BIELLETTE, 1)} d'axe en bout`, { pseudo: true, note: `Cachée dans le corps sur les photos (on n'en voit qu'un bout sous le ressort) : forme et longueur supposées, celles d'une pince-étau courante. Elle s'appuie au bout de la vis de réglage.` }],
  ['6', '', 1, 'LEVIER DE DÉVERROUILLAGE, dans la poignée mobile', { pseudo: true, note: 'Sa languette dépasse sous le bout de la poignée (visible sur la photo). En le pressant, on repousse la biellette au-delà de son point mort : la pince s\'ouvre. Sa forme sous la poignée est supposée ; il reste solidaire de la poignée dans l\'animation.' }],
  ['7', '', 1, `VIS DE RÉGLAGE à bouton moleté (Ø ${mm(VIS.d, 1)} supposé)`, { pseudo: true, note: `Elle déplace l'appui de la biellette : c'est le réglage de la grandeur du tube et de la force du serrage. Bouton de Ø ${mm(VIS.bouton)} relevé sur la photo ; filet non dessiné.` }],
  ['8', '', 1, 'RESSORT de rappel de la mâchoire mobile', { pseudo: true, note: 'Tendu du corps au moyeu de la mâchoire mobile, visible dans l\'ouverture du corps sur la photo : il ouvre la mâchoire dès que la biellette est déverrouillée.' }],
  ['9', '', 6, `RIVET de Ø ${mm(RIVET.d)} (supposé), têtes bombées`, { pseudo: true, note: 'Deux pour la mâchoire fixe, un pour le pivot de la mâchoire mobile, un pour la poignée, un pour la biellette, un pour le levier. Places relevées sur la photo pour ceux qui s\'y voient (cinq) ; le second rivet de la mâchoire fixe est supposé.' }],
  ['10', '', 2, `DEMI-COQUILLE RONDE soudée au bec, rayon intérieur de ${mm(R_INT, 1)}`, { pseudo: true, note: `Remplace le patin carré de la pince TIME, à la demande du client et d'après sa photo d'atelier. Sur le modèle : tôle roulée de ${mm(COQUILLE.ep, 1)}, ${fr(COQUILLE.angle)}° de tour, ${mm(COQUILLE.long)} le long du tube, pour le tube intérieur ${TUBE.nom} de Ø ${mm(TUBE.d, 1)} — calibre, épaisseur et longueur supposés. Acier nu, comme le reste de la pince. Cordons de soudure non dessinés.` }],
];

const data = {
  id: 'pince-tube-interieur',
  name: 'Pince pour tube intérieur de carottier, à mâchoires rondes (type TIME 92-1005)',
  manufacturer: 'TIME Limited (modèle de base) — mâchoires rondes d\'après une photo du client',
  category: 'Outils à main (carottier, tube intérieur)',
  serial: '',
  document: {
    title: 'Page du produit TIME Limited et photo d\'atelier du client (aucun plan)',
    reference: '92-1005',
    preparedBy: '',
    date: '',
    sheets: 3,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Données publiées', PUBLIE],
    ['Ce qui diffère du produit TIME', 'Les patins : deux demi-coquilles rondes au lieu des deux patins carrés. Le reste de la pince (corps, mâchoires en C, poignées, vis) est celui de la photo de la page TIME. La couleur aussi diffère : acier nu, de couleur métallique, comme la pince de la photo d\'atelier, à la demande du client — la pince TIME est peinte en orange. Le numéro 92-1005 est celui de la pince à patins carrés ; la version à patins ronds n\'a pas de numéro connu'],
    ['Échelle du relevé', `La pince de la photo TIME est prise pour une pince-étau en C de 11 po (${mm(L)}), la grandeur courante : longueur supposée, non publiée. Elle mesure 492 pixels sur la capture, soit environ 0,57 mm par pixel ; places des rivets à 1 mm près sous cette hypothèse`],
    ['Coquilles (supposées)', `Pour le tube intérieur ${TUBE.nom} de Ø ${mm(TUBE.d, 1)} (cote usuelle du carottier ${TUBE.nom} à câble ; à confirmer) : rayon intérieur ${mm(R_INT, 1)}, épaisseur ${mm(COQUILLE.ep, 1)}, ${fr(COQUILLE.angle)}° de tour chacune, ${mm(COQUILLE.long)} de long. La photo d'atelier montre des coquilles de cet ordre de grandeur, sans repère d'échelle`],
    ['Épaisseurs (supposées)', `Mâchoires ${mm(EP.machoire)}, tôle du corps et de la poignée ${mm(EP.tole, 1)}, profilés de ${mm(EP.large)} de large : aucune vue de côté ne permet de les mesurer`],
    ['Mécanisme', `Celui d'une pince-étau : la poignée mobile s'articule sur la mâchoire mobile ; une biellette va de la poignée au bout de la vis de réglage. Pince serrée, les deux articulations de la poignée et le bout de la vis sont presque alignés (genouillère) ; la biellette dépasse l'alignement de 1,5 mm et la pince reste verrouillée. Le point mort est à ${fr(T_MORT / RAD, 1)}° de rotation de la biellette : la mâchoire s'y referme de ${mm(serrageMort, 2)} de plus qu'en position verrouillée`],
    ['Ouverture du modèle', `Mâchoire mobile ouverte de ${fr(THETA_MAX / RAD)}°, poignée de ${fr(ouvert.psi / RAD)}° : jour de ${mm(jour(THETA_MAX))} entre les coquilles (${mm(jour(0), 1)} pince serrée) — valeur du modèle, pas du fabricant`],
    ['Non modélisé', 'La pince double (92-1006) : deux pinces côte à côte, réunies par une pièce que la photo ne permet pas de lire. Le tube intérieur lui-même. Le filet de la vis, les cordons de soudure des coquilles, les marques'],
    ['À confirmer', AFAIRE],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Page du produit TIME Limited « Pinces pour tubes intérieurs » (92-1005, 92-1006), fournie par le client',
    P02: 'Photo d\'atelier du client : pince-étau en C à coquilles rondes soudées',
    P03: 'Schéma du mécanisme et des coquilles : cotes retenues pour le modèle et hypothèses',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'ADJUSTABLE INNER TUBE PLIERS SINGLE, ROUND JAWS',
      titleFr: 'Pince pour tube intérieur, simple, à mâchoires rondes',
      pn: '92-1005',
      sheets: ['P01', 'P02', 'P03'],
      note: `Reconstitution 3D d'après la page du produit de TIME Limited (P01) et une photo d'atelier du client (P02), sans plan ni cote : la pince-étau en C de la page TIME, dont les patins carrés sont remplacés par deux demi-coquilles rondes, comme sur la photo d'atelier, et laissée de couleur métallique (acier nu) plutôt que peinte en orange, à la demande du client. Elle sert à saisir et à soutenir le tube intérieur du carottier quand on le sort. Longueur de ${mm(L)} (11 po) supposée ; coquilles faites pour le tube intérieur ${TUBE.nom} (Ø ${mm(TUBE.d, 1)}), supposé. La pince est montrée serrée, couchée sur le bout de ses coquilles ; la coupe passe à mi-épaisseur et montre la genouillère dans le corps. ${AFAIRE}`,
      parts: [...pieces, ['11', '', null, 'Fonctionnement : la pince s\'ouvre et se verrouille (scène animée)', { link: 'P02', no3d: true, pseudo: true }]],
    },
    P02: {
      title: 'HOW IT WORKS',
      titleFr: 'Fonctionnement : déverrouiller, ouvrir, refermer',
      pn: '',
      sheets: ['P03', 'P01', 'P02'],
      note: `La même pince, animée en trois temps. ${STEPS.map((s) => s.text).join(' ')} La cinématique est celle des places de rivets relevées sur la photo et d'une biellette supposée : l'ouverture réelle de la pince peut différer.`,
      parts: pieces,
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/pince-tube-interieur/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`pince de ${mm(L)} ; biellette ${mm(BIELLETTE, 2)} ; point mort à ${fr(T_MORT / RAD, 2)}° (serrage de ${mm(serrageMort, 2)}) ; ouverte : mâchoire ${fr(THETA_MAX / RAD)}°, poignée ${fr(ouvert.psi / RAD, 1)}°, jour ${mm(jour(THETA_MAX), 1)} ; bec ouvert en (${fr(bec[0])}, ${fr(bec[1])})`);
console.log(ok ? `✓ genouillère montée sur toute la course (${N + 1} positions)` : '✕ mécanisme à revoir');
if (!ok) process.exitCode = 1;

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  const k = 5.2, ox = 150, oy = 600; // px/mm ; origine du repère de l'outil sur la page
  const X = (x) => ox + x * k, Y = (y) => oy - y * k;
  const pt = (p, nom, dx = 14, dy = -14) => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="9" class="p"/><text x="${X(p[0]) + dx}" y="${Y(p[1]) + dy}" class="t">${nom}</text>`;
  const seg = (p, q, cls = 'b') => `<line x1="${X(p[0])}" y1="${Y(p[1])}" x2="${X(q[0])}" y2="${Y(q[1])}" class="${cls}"/>`;
  const arcSvg = (r, a0, a1) => {
    const p = (a) => `${X(TUBE.x + r * Math.cos(a * RAD))} ${Y(TUBE.y + r * Math.sin(a * RAD))}`;
    return `M ${p(a0)} A ${r * k} ${r * k} 0 0 0 ${p(a1)}`;
  };
  const demi = COQUILLE.angle / 2;
  const coq = (c) => `<path d="${arcSvg((R_INT + R_EXT) / 2, c * 90 - demi, c * 90 + demi)}" class="coq"/>`;
  const e = ouvert;
  const schema = `
    <circle cx="${X(TUBE.x)}" cy="${Y(TUBE.y)}" r="${(TUBE.d / 2) * k}" class="tube"/>
    <text x="${X(TUBE.x)}" y="${Y(TUBE.y) + 8}" text-anchor="middle">tube ${TUBE.nom}</text><text x="${X(TUBE.x)}" y="${Y(TUBE.y) + 36}" text-anchor="middle">Ø ${fr(TUBE.d, 1)}</text>
    ${coq(1)}${coq(-1)}
    ${seg([TUBE.x, TUBE.y + R_EXT], [TUBE.x, 88], 'm')}${seg([TUBE.x, 88], [112, 38], 'm')}${seg([112, 38], A, 'm')}${seg([112, 38], B0, 'm')}
    ${seg([TUBE.x, TUBE.y - R_EXT], [TUBE.x, -47], 'f')}${seg([TUBE.x, -47], [100, -47], 'f')}${seg([100, -47], [100, -8], 'f')}
    ${seg([92, -4], [256, -1], 'f')}${seg(D, [L, VIS.y], 'v')}
    ${seg(B0, C0)}${seg(C0, pointPoignee([266, 34], etat(0)))}${seg(C0, D, 'bi')}
    ${seg(e.B, e.C, 'o')}${seg(e.C, pointPoignee([215, 18.5], e), 'o')}${seg(e.C, D, 'o')}${seg(A, e.B, 'o')}
    ${pt(A, 'A', -34, 34)}${pt(B0, 'B', -30, -14)}${pt(C0, 'C', 6, -18)}${pt(D, 'D', 8, 40)}${pt(LEVIER, '', 0, 0)}<text x="${X(LEVIER[0]) - 20}" y="${Y(LEVIER[1]) + 40}">levier</text>${''}${FIXES.map((p) => pt(p, '', 0, 0)).join('')}
    <circle cx="${X(e.B[0])}" cy="${Y(e.B[1])}" r="7" class="po"/><circle cx="${X(e.C[0])}" cy="${Y(e.C[1])}" r="7" class="po"/>
    <text x="${X(e.C[0]) + 16}" y="${Y(e.C[1]) - 10}" class="to">ouverte : mâchoire ${fr(THETA_MAX / RAD)}°, poignée ${fr(e.psi / RAD)}°</text>
    <line x1="${X(0)}" y1="${Y(-66)}" x2="${X(L)}" y2="${Y(-66)}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${X(L / 2)}" y="${Y(-66) - 12}" text-anchor="middle">${mm(L)} (11 po) — supposée</text>
    <text x="${X(150)}" y="${Y(-22)}">corps (poignée fixe)</text><text x="${X(232)}" y="${Y(8)}">vis de réglage</text><text x="${X(190)}" y="${Y(30)}">poignée mobile</text><text x="${X(150)}" y="${Y(-2)}" class="tb">biellette ${fr(BIELLETTE, 1)}</text>
    <text x="${X(56)}" y="${Y(74)}">mâchoire mobile</text><text x="${X(48)}" y="${Y(-52)}">mâchoire fixe</text>`;
  const lignes = data.specs.slice(2).map(([t, v]) => `<tr><th>${t}</th><td>${v}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:22px/1.32 system-ui,sans-serif;color:#1d2125}
    h1{font-size:38px;margin:40px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:110px}
    .tube{fill:#eef1f4;stroke:#8a929b;stroke-width:2;stroke-dasharray:10 7}.coq{fill:none;stroke:#8a929b;stroke-width:${COQUILLE.ep * k}}
    .m,.f{stroke:#8a929b;stroke-width:16;stroke-linecap:round;opacity:.55}.f{stroke:#6b737c}.v{stroke:#b9bfc6;stroke-width:14}
    .b{stroke:#1d2125;stroke-width:5}.bi{stroke:#1b6fb5;stroke-width:5}.o{stroke:#1b6fb5;stroke-width:3;stroke-dasharray:9 7}
    .p{fill:#fff;stroke:#1d2125;stroke-width:4}.po{fill:#fff;stroke:#1b6fb5;stroke-width:3}.c{stroke:#c0392b;stroke-width:2}
    text{font-size:22px;fill:#1d2125}text.t{font-weight:700;font-size:26px}text.to,text.tb{fill:#1b6fb5}
    table{position:absolute;left:70px;top:1100px;width:2060px;border-collapse:collapse;font-size:18.5px;line-height:1.28}
    th{width:250px;text-align:left;vertical-align:top;padding:5px 12px 5px 0;color:#444}td{padding:5px 0;border-top:1px solid #ddd}
    </style><h1>Pince pour tube intérieur à mâchoires rondes — schéma et cotes du modèle</h1>
    <p class="s">Aucun plan : places des rivets relevées sur la photo de la page TIME (pince prise pour une 11 po) ; coquilles et épaisseurs supposées. Trait plein : pince verrouillée ; pointillé bleu : pince ouverte.</p>
    <svg width="2200" height="980"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>${schema}</svg>
    <table>${lignes}</table></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
