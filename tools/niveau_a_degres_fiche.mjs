// Écrit public/equipment/niveau-a-degres/data.json : les cotes viennent du modèle
// (src/models/niveau-a-degres/index.js), pour que la fiche et la 3D disent la même chose. Avec
// --page <fichier.html>, écrit aussi la page des cotes (pages/P02.webp en est une capture de
// 2 200 × 1 700 px) : vue de face dessinée en SVG à partir des mêmes cotes, avec la provenance
// de chacune (photo, publiée, supposée). pages/P01.webp est la photo du client.
// Usage : node tools/niveau_a_degres_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import {
  L, H, T, REGLE, COINS, CADRAN, TAMBOUR, FIOLE, MOLETTE, TROU, MARQUE, PENTES_CHIFFREES, RAPPORT, COURBURE, contourBoitier, bulle,
} from '../src/models/niveau-a-degres/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
// Sans décimale pour un entier, sinon une (8,5 mm ne doit pas s'écrire 9 mm).
const mm = (v, n = Number.isInteger(v) ? 0 : 1) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / 25.4) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };
// Sensibilité de la fiole : glissement de la bulle pour 1°, et inclinaison où elle bute.
const parDegre = bulle([Math.sin(Math.PI / 180), Math.cos(Math.PI / 180), 0], 0).x;
const course = bulle([0, 1, 0], 0).course;
const butee = Math.atan(course / COURBURE) * 180 / Math.PI;

const SOURCE = 'Une photo du client, prise de face, qui montre les 150 premiers millimètres de l\'outil (cadran, fiole, les deux règles, molette, début du trou de main et du logo). Aucun manuel ni plan. Cotes hors tout et mode d\'emploi repris des fiches publiées du Tajima SLANT 100 (SLT-100), le reste mesuré sur la photo ou supposé';
const IDENT = 'Le logo, coupé par le bord de la photo, se lit « Ta… » et « SLA… » dans un cadre arrondi : Tajima SLANT. Les fiches du SLANT 100 (SLT-100) décrivent le même outil — boîtier d\'ABS, double échelle des angles et des pentes, fiole à deux paires de traits, molette au pouce. Identification probable, non confirmée par une plaque';
const PUBLIE = '10 po × 4 3/4 po hors tout (un détaillant ; les autres ne donnent que l\'emballage, environ 12 5/8 × 6 1/8 × 1 1/8 po) ; boîtier d\'ABS épais (fabricant) ; double échelle, angle et pente ; graduations aux 2° ; précision de ±1° ; grande fiole à deux paires de traits ; réglage par une molette au pouce. Les fiches annoncent une échelle de 0 à 130° : le cadran de la photo est gradué de 0 à 90 dans chaque quart, et c\'est la photo qui est suivie';
const ECHELLE = `Le couvercle du cadran est pris à ${mm(2 * CADRAN.rCouvercle)} de diamètre (le « 100 » du nom) : 0,163 mm par pixel de la photo. La hauteur publiée de 4 3/4 po (${mm(H, 1)}) tombe alors juste hors du cadre, comme sur la photo, et la longueur publiée de 10 po (${mm(L)}) laisse environ ${mm(Math.round(L - 149))} du bout droit hors de la photo`;
const EMPLOI = 'Poser la règle de base (ou la règle de bout) à plat contre la surface ; tourner la molette bleue jusqu\'à ce que la bulle soit entre les deux paires de traits ; lire l\'angle sous l\'aiguille rouge, en degrés sur l\'échelle du dedans (ANGLE) ou en pouces par pied sur celle du dehors (PITCH). 0 : surface de niveau ; 90, « PLUMB » : surface d\'aplomb';
const MODELE = `Sur le site, l'outil fonctionne : la surface se penche, la molette (ou la fiole, tirée à la souris ou au doigt) fait tourner le tambour, la bulle glisse vers le bout le plus haut et l'angle se lit sous l'aiguille. Fiole supposée en tonneau de ${mm(COURBURE)} de rayon : la bulle glisse d'environ ${fr(parDegre, 1)} mm par degré et bute au bout vers ${fr(butee)}° ; démultiplication de la molette supposée de ${RAPPORT} tours pour un tour du tambour`;

const data = {
  id: 'niveau-a-degres',
  name: 'Niveau à degrés à fiole pivotante (rapporteur d\'angle)',
  manufacturer: 'Tajima — type SLANT 100 (logo lu en partie)',
  category: 'Outil de mesure',
  serial: '',
  document: {
    title: 'Photo du client, données publiées (aucun manuel) et cotes supposées',
    reference: 'SLT-100',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Identification', IDENT],
    ['Données publiées', PUBLIE],
    ['Échelle de la photo', ECHELLE],
    ['Mode d\'emploi', EMPLOI],
    ['Hors tout', `${po(L)} × ${po(H)} (${mm(L)} × ${mm(H, 1)}) — publiées par un détaillant ; épaisseur de ${mm(T)} supposée`],
    ['Boîtier', `ABS noir. Coin arrondi (${mm(COINS.bout)}) au-dessus de la règle de bout, vu sur la photo ; coins du bout droit supposés (${mm(COINS.haut)} en haut, ${mm(COINS.bas)} en bas) ; dos supposé plat et nu`],
    ['Règles', `Deux règles d'aluminium d'équerre, de ${mm(REGLE.ep, 1)} de large vues de face, trois rainures près de l'arête : règle de base sur toute la longueur (face de mesure du dessous), règle de bout jusqu'à ${mm(REGLE.haut)} de haut. Section et dos supposés`],
    ['Cadran', `Fixe, à ${mm(CADRAN.x)} du bout et ${mm(CADRAN.y)} au-dessus de la face de mesure. Plaque blanche imprimée : arc de ${mm(2 * CADRAN.rArc, 1)} de diamètre, traits aux 2° vers le dedans, chiffres aux 10° de 0 (haut et bas) à 90 (côtés, en rouge, « PLUMB ») ; pente vers le dehors, chiffrée ${PENTES_CHIFFREES.join(', ')} po par pied. Couvercle transparent de ${mm(2 * CADRAN.rCouvercle)}, à méplat du côté de la règle de base`],
    ['Tambour et aiguille', `Tambour noir pivotant dans une fenêtre de ${mm(2 * TAMBOUR.rExt, 1)}, qui porte la fiole en travers et une aiguille rouge d'équerre avec elle, de la fenêtre à l'arc des graduations. Profondeur et fond supposés`],
    ['Fiole', `Tube de Ø ${mm(FIOLE.d)}, ${mm(FIOLE.vue)} vus entre deux embouts noirs de Ø ${mm(FIOLE.embout.d)}, liquide vert, deux paires de traits à ±${mm(FIOLE.traits[0])} et ±${mm(FIOLE.traits[1], 1)} du milieu (photo). Bulle de ${mm(FIOLE.bulle.long, 1)} supposée`],
    ['Molette', `Bleue, cannelée, Ø ${mm(MOLETTE.d)}, centrée à ${mm(MOLETTE.x)} du bout et ${mm(MOLETTE.y)} de haut : elle dépasse du chant du haut d'environ ${mm(Math.round((MOLETTE.y + MOLETTE.d / 2 - H) * 10) / 10, 1)}, sous le pouce. ${MOLETTE.cannelures} cannelures (estimées), saillie de ${mm(MOLETTE.saillie)} sur la face et entraînement du tambour supposés`],
    ['Trou de main', `De ${mm(TROU.y1 - TROU.y0)} de haut, coins de ${mm(TROU.r)}, bord gauche à ${mm(TROU.x0)} du bout (photo) ; bord droit hors de la photo, supposé à ${mm(TROU.x1)}`],
    ['Fonctionnement en 3D', MODELE],
    ['Non modélisé', 'Texte du logo (lu en partie seulement : seul son cadre est fait), aimants de la base (les fiches des détaillants se contredisent), entraînement interne de la molette, saletés et usure de la photo'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Photo du client : cadran, fiole pivotante, règles, molette',
    P02: 'Cotes du niveau : vue de face (photo, publiées et supposées)',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'ANGLE METER, ROTARY VIAL, DUAL SCALE',
      titleFr: 'Niveau à degrés à fiole pivotante',
      pn: '',
      sheets: ['P01', 'P02'],
      note: `Reconstitution 3D d'après une photo du client, sans manuel ni plan. Identification probable : Tajima SLANT 100 (SLT-100), le logo n'étant lisible qu'en partie. Mesuré sur la photo (couvercle du cadran pris à ${mm(2 * CADRAN.rCouvercle)}) : cadran et graduations, tambour, fiole, aiguille rouge, règles, molette, bord gauche du trou de main, coin du boîtier. Publié : ${po(L)} × ${po(H)} hors tout, boîtier d'ABS, graduations aux 2°, mode d'emploi. Supposé : tout le bout droit hors de la photo, l'épaisseur de ${mm(T)}, le dos, la profondeur du tambour, la saillie de la molette et son entraînement. ${EMPLOI}. ${MODELE}. Outil debout sur sa règle de base ; en vue éclatée, le cadran, le tambour, le couvercle et la fiole sortent vers l'avant, les règles s'écartent.`,
      parts: [
        ['1', '', 1, `BOÎTIER en ABS noir, ${mm(L)} × ${mm(H, 1)} × ${mm(T)}`, { note: `Percé du logement du tambour et du trou de main ; cadre du marquage (${mm(MARQUE.x1 - MARQUE.x0)} × ${mm(MARQUE.y1 - MARQUE.y0, 1)}) sous le trou de main, sans le texte du logo. Bout droit, épaisseur et dos supposés.` }],
        ['2', '', 1, `RÈGLE DE BASE en aluminium, ${mm(L)}`, { note: `Face de mesure du dessous ; ${mm(REGLE.ep, 1)} de large vue de face, trois rainures près de l'arête. Longueur supposée égale à celle de l'outil.` }],
        ['3', '', 1, `RÈGLE DE BOUT en aluminium, ${mm(REGLE.haut - REGLE.ep, 1)}`, { note: 'D\'équerre avec la règle de base, pour mesurer contre une surface d\'aplomb.' }],
        ['4', '', 1, 'CADRAN fixe, degrés et pente', { note: `Plaque blanche imprimée à méplat : 0 à 90 dans chaque quart, traits aux 2°, « PLUMB » à 90 ; pente en pouces par pied (${PENTES_CHIFFREES.join(', ')}).` }],
        ['5', '', 1, `COUVERCLE transparent du cadran, Ø ${mm(2 * CADRAN.rCouvercle)}`, { note: 'Anneau à méplat du côté de la règle de base ; l\'aiguille tourne dessous. Épaisseur supposée.' }],
        ['6', '', 1, 'TAMBOUR pivotant et aiguille rouge', { note: `Cuvette noire de Ø ${mm(2 * TAMBOUR.rExt, 1)} qui porte la fiole ; l'aiguille, d'équerre avec la fiole, montre l'angle sur le cadran. Entraîné par la molette.` }],
        ['7', '', 1, `FIOLE à bulle, Ø ${mm(FIOLE.d)}, et ses deux embouts`, { note: `Liquide vert, deux paires de traits : la bulle entre les traits, la fiole est de niveau. Sensibilité supposée (environ ${fr(parDegre, 1)} mm par degré).` }],
        ['8', '', 1, `MOLETTE de réglage bleue, Ø ${mm(MOLETTE.d)}`, { note: `Cannelée, sous le pouce au chant du haut ; fait tourner le tambour (démultiplication supposée de ${RAPPORT} pour 1).` }],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/niveau-a-degres/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; bulle ${fr(parDegre, 2)} mm par degré, butée à ${fr(butee, 1)}°`);

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  // Vue de face : 5,3 px par mm.
  const k = 5.3, x0 = 420, y0 = 230;
  const X = (x) => x0 + x * k, Y = (y) => y0 + (H - y) * k;
  const poly = (pts) => pts.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  const coteH = (xa, xb, y, txt, cls = '') => `<line x1="${X(xa)}" y1="${y}" x2="${X(xb)}" y2="${y}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${(X(xa) + X(xb)) / 2}" y="${y - 9}" text-anchor="middle" class="${cls}">${txt}</text>`;
  // gauche : texte à gauche du trait (cotes empilées à gauche de l'outil).
  const coteV = (ya, yb, x, txt, gauche = false) => `<line x1="${x}" y1="${Y(ya)}" x2="${x}" y2="${Y(yb)}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${x + (gauche ? -10 : 10)}" y="${(Y(ya) + Y(yb)) / 2 + 7}"${gauche ? ' text-anchor="end"' : ''}>${txt}</text>`;
  const c = CADRAN;
  const flat = (r, y) => { const a = Math.asin((y - c.y) / r); return [Math.cos(a) * r, y - c.y]; };
  const [fx, fy] = flat(c.rCouvercle, REGLE.ep + 0.2);
  const couv = `M ${X(c.x + fx)} ${Y(c.y + fy)} A ${c.rCouvercle * k} ${c.rCouvercle * k} 0 1 0 ${X(c.x - fx)} ${Y(c.y + fy)} Z`;
  const ticks = [];
  for (let b = 0; b < 360; b += 10) {
    const a = (b * Math.PI) / 180;
    ticks.push(`<line x1="${X(c.x + c.rArc * Math.cos(a))}" y1="${Y(c.y + c.rArc * Math.sin(a))}" x2="${X(c.x + (c.rArc - 2.3) * Math.cos(a))}" y2="${Y(c.y + (c.rArc - 2.3) * Math.sin(a))}" class="t"/>`);
  }
  const vue = `
    <polygon points="${poly(contourBoitier())}" class="abs"/>
    <rect x="${X(0)}" y="${Y(REGLE.ep)}" width="${L * k}" height="${REGLE.ep * k}" class="alu"/>
    <rect x="${X(0)}" y="${Y(REGLE.haut)}" width="${REGLE.ep * k}" height="${(REGLE.haut - REGLE.ep) * k}" class="alu"/>
    <rect x="${X(TROU.x0)}" y="${Y(TROU.y1)}" width="${(TROU.x1 - TROU.x0) * k}" height="${(TROU.y1 - TROU.y0) * k}" rx="${TROU.r * k}" class="vide"/>
    <rect x="${X(MARQUE.x0)}" y="${Y(MARQUE.y1)}" width="${(MARQUE.x1 - MARQUE.x0) * k}" height="${(MARQUE.y1 - MARQUE.y0) * k}" rx="${MARQUE.r * k}" class="marque"/>
    <path d="${couv}" class="cadran"/>
    <circle cx="${X(c.x)}" cy="${Y(c.y)}" r="${c.rArc * k}" class="arc"/>${ticks.join('')}
    <circle cx="${X(c.x)}" cy="${Y(c.y)}" r="${TAMBOUR.rExt * k}" class="tambour"/>
    <rect x="${X(c.x - TAMBOUR.rInt)}" y="${Y(c.y + FIOLE.embout.d / 2)}" width="${2 * TAMBOUR.rInt * k}" height="${FIOLE.embout.d * k}" rx="6" class="embout"/>
    <rect x="${X(c.x - FIOLE.vue / 2)}" y="${Y(c.y + FIOLE.d / 2)}" width="${FIOLE.vue * k}" height="${FIOLE.d * k}" class="fiole"/>
    <line x1="${X(c.x)}" y1="${Y(c.y + TAMBOUR.aiguille.de)}" x2="${X(c.x)}" y2="${Y(c.y + TAMBOUR.aiguille.a)}" class="aiguille"/>
    <circle cx="${X(MOLETTE.x)}" cy="${Y(MOLETTE.y)}" r="${(MOLETTE.d / 2) * k}" class="molette"/>
    <line x1="${X(149)}" y1="${Y(H) - 40}" x2="${X(149)}" y2="${Y(0) + 40}" class="bord"/>
    <text x="${X(149) + 8}" y="${Y(0) + 36}" class="s">bord de la photo : à droite, supposé</text>
    ${coteH(0, L, Y(H) - 110, `${po(L)} (${mm(L)}) — publiée`)}
    ${coteH(0, c.x, Y(H) - 60, `${mm(c.x)}`)}
    ${coteH(c.x, MOLETTE.x, Y(H) - 60, `${mm(MOLETTE.x - c.x)}`)}
    ${coteH(TROU.x0, TROU.x1, Y((TROU.y0 + TROU.y1) / 2) + 40, `${mm(TROU.x1 - TROU.x0)} *`)}
    ${coteH(c.x - c.rCouvercle, c.x + c.rCouvercle, Y(0) + 60, `couvercle Ø ${mm(2 * c.rCouvercle)} — échelle de la photo`)}
    ${coteH(c.x - TAMBOUR.rExt, c.x + TAMBOUR.rExt, Y(0) + 110, `tambour Ø ${mm(2 * TAMBOUR.rExt, 1)}`)}
    ${coteV(0, H, X(L) + 50, `${po(H)} (${mm(H, 1)}) — publiée`)}
    ${coteV(0, MOLETTE.y, X(0) - 330, `molette ${mm(MOLETTE.y)}`)}
    ${coteV(0, c.y, X(0) - 160, `${mm(c.y)}`, true)}
    ${coteV(TROU.y0, TROU.y1, X(TROU.x0) + 40, `${mm(TROU.y1 - TROU.y0)}`)}
    ${coteV(REGLE.ep, REGLE.haut, X(0) - 60, `${mm(REGLE.haut - REGLE.ep, 1)}`, true)}`;
  const garde = new Set(['Source', 'Identification', 'Données publiées', 'Échelle de la photo', 'Mode d\'emploi', 'Fiole', 'Molette', 'Non modélisé']);
  const lignes = data.specs.filter(([a]) => garde.has(a)).map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:21px/1.34 system-ui,sans-serif;color:#1d2125}
    h1{font-size:40px;margin:46px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:110px}
    .abs{fill:#2a2c30;stroke:#111;stroke-width:2}.alu{fill:#c9cdd1;stroke:#333;stroke-width:1.5}.vide{fill:#fff;stroke:#111;stroke-width:2}
    .marque{fill:none;stroke:#9aa0a6;stroke-width:3}.cadran{fill:#eceee9;stroke:#555;stroke-width:2}.arc{fill:none;stroke:#22262a;stroke-width:1.5}.t{stroke:#22262a;stroke-width:1.5}
    .tambour{fill:#15161a;stroke:#000;stroke-width:2}.embout{fill:#2e3034}.fiole{fill:#86d81f;stroke:#22262a;stroke-width:1.5}.aiguille{stroke:#d3221c;stroke-width:5}
    .molette{fill:#1f6fd0;stroke:#0d3e7c;stroke-width:5;stroke-dasharray:7 5}.bord{stroke:#888;stroke-width:2;stroke-dasharray:10 8}
    .c{stroke:#c0392b;stroke-width:2}text{font-size:21px;fill:#1d2125}text.s{font-size:18px;fill:#666}
    table{position:absolute;left:70px;top:1215px;width:2060px;border-collapse:collapse;font-size:17.5px}
    th{width:220px;text-align:left;vertical-align:top;padding:4px 12px 4px 0;color:#444}td{padding:4px 0;border-top:1px solid #ddd}
    </style><h1>Niveau à degrés à fiole pivotante — cotes</h1>
    <p class="s">Type Tajima SLANT 100 (identification probable). Cotes mesurées sur la photo du client, sauf mention ; * = cote supposée (hors de la photo).</p>
    <svg width="2200" height="1090"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>
    ${vue}</svg>
    <table>${lignes}</table></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
