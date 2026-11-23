// Écrit public/equipment/ruban-cerclage-s5736/data.json : les cotes viennent du modèle
// (src/models/ruban-cerclage-s5736/index.js), pour que la fiche et la 3D disent la même chose. Avec
// --page <fichier.html>, écrit aussi la page des cotes (pages/P02.webp en est une capture de
// 2 200 × 1 700 px) : vue de face et coupe par l'axe, dessinées en SVG à partir des mêmes cotes.
// Usage : node tools/ruban_cerclage_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import { IN, VERGE, MIL, LARGEUR, LONGUEUR, EPAISSEUR, MANDRIN, MECHES, LOGO, AMORCE, rouleau, amorce, horsTout } from '../src/models/ruban-cerclage-s5736/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = Number.isInteger(v) ? 0 : 1) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / IN) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };
const r = rouleau(), a = amorce(), h = horsTout();
const rapport = r.dMandrin / r.dExt;
const pasMeches = LARGEUR / MECHES;
const pasLogos = (Math.PI * MANDRIN.dInt) / LOGO.nombre;

// Relevé sur la photo (pixels) : bord de carton du mandrin de 116 pixels de large, face du rouleau de 166.
const PHOTO = { mandrin: 116, rouleau: 166 };
const rapportPhoto = PHOTO.mandrin / PHOTO.rouleau;

const SOURCE = 'Photo de la fiche du produit Uline S-5736, fournie par le client (P01), et données publiées par Uline. Aucun plan. La fiche complète n\'a pas pu être consultée (site inaccessible d\'ici) : les données publiées viennent des résultats de recherche qui la citent';
const PUBLIE = `Ruban de cerclage économique (« Economy Strapping Tape »), modèle S-5736 : ${po(LARGEUR)} × ${fr(LONGUEUR / VERGE)} verges ; épaisseur de ${fr(EPAISSEUR / MIL, 1)} mil ; résistance à la traction de 100 lb ; renforcé de filaments de verre ; pour les travaux légers ; ${fr(36)} rouleaux par caisse`;
const CALCUL = `Ø extérieur calculé : ${mm(r.dExt, 1)} (environ ${po(r.dExt)}). ${fr(LONGUEUR / 1000, 2)} m de ruban de ${fr(EPAISSEUR, 4)} mm occupent une couronne de ${fr((LONGUEUR * EPAISSEUR) / 100, 1)} cm² autour du mandrin de Ø ${mm(r.dMandrin)} : D = √(d² + 4·L·e/π), soit environ ${fr(r.tours)} spires. Un rouleau réel est un peu plus gros (air entre les spires) ou plus petit (colle écrasée) : le diamètre n'est pas publié`;
const ACCORD = `Sur la photo, le bord de carton du mandrin mesure ${PHOTO.mandrin} pixels de large et la face du rouleau ${PHOTO.rouleau} : rapport de ${fr(rapportPhoto, 2)}, contre ${fr(rapport, 2)} au calcul avec un mandrin de 3 po. Un mandrin de 1 1/2 po donnerait 0,45 : le mandrin de 3 po, qui n'est pas publié, est confirmé par la photo`;

const data = {
  id: 'ruban-cerclage-s5736',
  name: 'Ruban de cerclage à filaments Uline S-5736, 1 po × 60 verges',
  manufacturer: 'Uline',
  category: 'Ruban adhésif renforcé de filaments de verre',
  serial: '',
  document: {
    title: 'Photo de la fiche du produit, données publiées (aucun plan) et cotes relevées ou calculées',
    reference: 'S-5736',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Données publiées', PUBLIE],
    ['Largeur', `${po(LARGEUR)} (${mm(LARGEUR, 1)}) — donnée publiée`],
    ['Longueur', `${fr(LONGUEUR / VERGE)} verges (${fr(LONGUEUR / 1000, 2)} m) — donnée publiée ; ${fr(r.enroule / 1000, 2)} m encore enroulés sur le modèle, ${mm(a.longueur)} d'amorce déroulée`],
    ['Épaisseur', `${fr(EPAISSEUR / MIL, 1)} mil (${fr(EPAISSEUR, 3)} mm) — donnée publiée`],
    ['Résistance à la traction', '100 lb — donnée publiée, reprise telle quelle'],
    ['Diamètre extérieur', CALCUL],
    ['Mandrin', `Carton kraft, Ø intérieur de ${po(MANDRIN.dInt)} (${mm(MANDRIN.dInt, 1)}), paroi de ${mm(MANDRIN.paroi, 1)} (2,1 à 2,4 mm relevés sur la photo), Ø extérieur de ${mm(r.dMandrin)}, de la largeur du ruban. Intérieur de papier blanc imprimé de logos Uline (rectangle bleu, lettres blanches) : deux sont visibles sur la photo, à 90° l'un de l'autre, soit ${LOGO.nombre} par tour (un tous les ${mm(pasLogos)}) ; rectangle d'environ ${mm(LOGO.long)} × ${mm(LOGO.haut)}, longueur supposée`],
    ['Accord photo et calcul', ACCORD],
    ['Filaments', `${MECHES} mèches de filaments de verre dans le sens de la longueur, comptées sur la photo (à une près) : une tous les ${mm(pasMeches, 1)} environ. Largeur et place des mèches légèrement inégales, comme sur la photo`],
    ['Amorce déroulée', `Environ ${mm(a.longueur)} (${po(a.longueur)}), relevés sur la photo à 15 % près : le ruban quitte le rouleau à ${AMORCE.angle}° au-dessus de l'horizontale, descend droit sur ${mm(a.droit)}, se couche par un arc de ${mm(AMORCE.rayon)} de rayon et reste à plat sur ${mm(AMORCE.plat)}, dos vers le haut, colle contre le sol. Sur la photo, l'amorce dévie d'une dizaine de degrés vers l'avant : elle est faite droite`],
    ['Encombrement', `${mm(h.long)} de long (rouleau et amorce) × ${mm(h.haut, 1)} de haut × ${mm(h.large, 1)} de large ; rouleau debout sur sa tranche, comme sur la photo`],
    ['Non publié, non modélisé', 'Matière du film et de la colle, masse du rouleau : non trouvées dans les données consultées. La spirale des spires (0,1 mm par tour) n\'est pas dessinée : le rouleau est une couronne pleine'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Photo de la fiche du produit (Uline S-5736), fournie par le client',
    P02: 'Cotes du rouleau : vue de face et coupe par l\'axe (publiées, calculées, relevées)',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'ECONOMY STRAPPING TAPE, 1 IN X 60 YDS',
      titleFr: 'Ruban de cerclage à filaments, 1 po × 60 verges',
      pn: 'S-5736',
      sheets: ['P01', 'P02'],
      note: `Reconstitution 3D d'après la photo de la fiche du produit (P01) et les données publiées par Uline : ${po(LARGEUR)} × ${fr(LONGUEUR / VERGE)} verges, ${fr(EPAISSEUR / MIL, 1)} mil, 100 lb, filaments de verre. ${CALCUL}. ${ACCORD}. Relevé sur la photo : la paroi du mandrin, ses logos, les ${MECHES} mèches de filaments et le trajet de l'amorce. Le rouleau est debout sur sa tranche, l'amorce déroulée vers la droite ; en vue éclatée, le mandrin sort par la face avant.`,
      parts: [
        ['1', '', 1, `MANDRIN de carton, Ø int. ${po(MANDRIN.dInt)} × ${po(LARGEUR)}`, { note: `Carton kraft, paroi de ${mm(MANDRIN.paroi, 1)} (Ø extérieur de ${mm(r.dMandrin)}), intérieur blanc imprimé de ${LOGO.nombre} logos Uline par tour. Ø intérieur non publié : 3 po, confirmé par les proportions de la photo.` }],
        ['2', 'S-5736', 1, `RUBAN DE CERCLAGE à filaments de verre, ${po(LARGEUR)} × ${fr(LONGUEUR / VERGE)} verges, ${fr(EPAISSEUR / MIL, 1)} mil`, { note: `Environ ${fr(r.tours)} spires, Ø extérieur calculé de ${mm(r.dExt, 1)} ; ${MECHES} mèches de filaments dans le sens de la longueur ; amorce déroulée d'environ ${mm(a.longueur)}, dos vers le haut. Résistance à la traction publiée : 100 lb.` }],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/ruban-cerclage-s5736/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; Ø extérieur ${fr(r.dExt, 2)} mm, ${fr(r.tours, 1)} spires, amorce ${fr(a.longueur, 1)} mm, rapport mandrin/rouleau ${fr(rapport, 3)} (photo ${fr(rapportPhoto, 3)})`);

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  const R = r.dExt / 2, rM = r.dMandrin / 2, rI = MANDRIN.dInt / 2, Hh = LARGEUR / 2;
  const k = 5.4; // pixels par mm
  // Vue de face (on regarde le long de l'axe) : x vers la droite, y vers le haut.
  const fx = 500, sol = 870;
  const X = (x) => fx + x * k, Y = (y) => sol - y * k;
  const phi = (AMORCE.angle * Math.PI) / 180;
  const trace = `M ${X(a.depart[0])} ${Y(a.depart[1])} L ${X(a.debutArc[0])} ${Y(a.debutArc[1])} A ${AMORCE.rayon * k} ${AMORCE.rayon * k} 0 0 0 ${X(a.contact)} ${Y(0)} L ${X(a.bout)} ${Y(0)}`;
  const logos = Array.from({ length: LOGO.nombre }, (_, i) => {
    const mi = ((LOGO.angle + (i * 360) / LOGO.nombre) * Math.PI) / 180, demi = LOGO.long / 2 / rI;
    const p = (t) => `${X(rI * Math.cos(t))} ${Y(R + rI * Math.sin(t))}`;
    return `<path d="M ${p(mi - demi)} A ${rI * k} ${rI * k} 0 0 0 ${p(mi + demi)}" class="logo"/>`;
  }).join('');
  const hc = (xa, xb, y, txt, cls = '') => `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${(xa + xb) / 2}" y="${y - 10}" text-anchor="middle" class="${cls}">${txt}</text>`;
  const vc = (x, ya, yb, txt) => `<line x1="${x}" y1="${ya}" x2="${x}" y2="${yb}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${x + 12}" y="${(ya + yb) / 2 + 7}">${txt}</text>`;
  const rappel = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="r"/>`;
  const face = `
    <line x1="${X(-R) - 60}" y1="${Y(0)}" x2="${X(a.bout) + 60}" y2="${Y(0)}" class="sol"/>
    <circle cx="${X(0)}" cy="${Y(R)}" r="${R * k}" class="ruban"/>
    <circle cx="${X(0)}" cy="${Y(R)}" r="${rM * k}" class="kraft"/>
    <circle cx="${X(0)}" cy="${Y(R)}" r="${rI * k}" class="vide"/>
    ${logos}
    <path d="${trace}" class="amorce"/>
    <line x1="${X(0)}" y1="${Y(R)}" x2="${X(R * Math.cos(phi) * 1.12)}" y2="${Y(R + R * Math.sin(phi) * 1.12)}" class="r"/>
    <line x1="${X(0)}" y1="${Y(R)}" x2="${X(R * 1.12)}" y2="${Y(R)}" class="r"/>
    <text x="${X(R * 1.14)}" y="${Y(R + 5)}">${AMORCE.angle}° †</text>
    <line x1="${X(0) - 14}" y1="${Y(R)}" x2="${X(0) + 14}" y2="${Y(R)}" class="axe"/><line x1="${X(0)}" y1="${Y(R) - 14}" x2="${X(0)}" y2="${Y(R) + 14}" class="axe"/>
    ${rappel(X(-R), Y(R), X(-R), Y(2 * R) - 110)}${rappel(X(R), Y(R), X(R), Y(2 * R) - 110)}
    ${hc(X(-R), X(R), Y(2 * R) - 90, `Ø ${mm(r.dExt, 1)} — calculé`)}
    ${hc(X(-rM), X(rM), Y(R) - 60, `Ø ${mm(r.dMandrin)}`)}
    ${hc(X(-rI), X(rI), Y(R) + 80, `Ø ${po(MANDRIN.dInt)} (${mm(MANDRIN.dInt, 1)}) *`)}
    ${rappel(X(0), Y(0), X(0), Y(0) + 75)}${rappel(X(a.contact), Y(0), X(a.contact), Y(0) + 75)}${rappel(X(a.bout), Y(0), X(a.bout), Y(0) + 135)}${rappel(X(-R), Y(R), X(-R), Y(0) + 135)}
    ${hc(X(0), X(a.contact), Y(0) + 60, `${mm(a.contact)} †`)}
    ${hc(X(a.contact), X(a.bout), Y(0) + 60, `${mm(AMORCE.plat)} †`)}
    ${hc(X(-R), X(a.bout), Y(0) + 120, `${mm(h.long)} hors tout`)}
    <text x="${X(a.debutArc[0]) + 36}" y="${Y(a.debutArc[1]) - 4}">arc de ${mm(AMORCE.rayon)} †</text>
    <text x="${X(a.depart[0]) + 42}" y="${Y((a.depart[1] + a.debutArc[1]) / 2)}">droit, ${mm(a.droit)} †</text>`;
  // Coupe par l'axe : z vers la droite, y vers le haut ; agrandie.
  const s = 6.2, cx = 1700, cy = Y(R);
  const Z = (z) => cx + z * s, V = (y) => cy - y * s;
  const bloc = (y0, y1, cls) => `<rect x="${Z(-Hh)}" y="${V(y1)}" width="${LARGEUR * s}" height="${(y1 - y0) * s}" class="${cls}"/>`;
  const meches = Array.from({ length: MECHES }, (_, i) => `<line x1="${Z(-Hh + (i + 0.5) * pasMeches)}" y1="${V(R) - 5}" x2="${Z(-Hh + (i + 0.5) * pasMeches)}" y2="${V(R) + 5}" class="m"/>`).join('');
  const coupe = `
    ${bloc(rM, R, 'ruban')}${bloc(-R, -rM, 'ruban')}${bloc(rI, rM, 'kraft')}${bloc(-rM, -rI, 'kraft')}
    ${meches}
    <line x1="${Z(-Hh) - 50}" y1="${V(0)}" x2="${Z(Hh) + 50}" y2="${V(0)}" class="axe"/>
    ${rappel(Z(-Hh), V(R), Z(-Hh), V(R) - 75)}${rappel(Z(Hh), V(R), Z(Hh), V(R) - 75)}
    ${hc(Z(-Hh), Z(Hh), V(R) - 55, `${po(LARGEUR)} (${mm(LARGEUR, 1)}) — publiée`)}
    ${vc(Z(Hh) + 50, V(R), V(rM), `${mm(R - rM, 1)} : ${fr(r.tours)} spires de ${fr(EPAISSEUR / MIL, 1)} mil`)}
    <line x1="${Z(Hh) + 6}" y1="${V((rM + rI) / 2)}" x2="${Z(Hh) + 56}" y2="${V((rM + rI) / 2) + 26}" class="r"/><text x="${Z(Hh) + 62}" y="${V((rM + rI) / 2) + 34}">carton, paroi de ${mm(MANDRIN.paroi, 1)} †</text>
    <text x="${Z(-Hh) - 16}" y="${V(R) + 7}" text-anchor="end">${MECHES} mèches †</text>
    <text x="${cx}" y="${V(-R) + 44}" text-anchor="middle">une mèche tous les ${mm(pasMeches, 1)}</text>`;
  const lignes = data.specs.map(([t, v]) => `<tr><th>${t}</th><td>${v}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:22px/1.32 system-ui,sans-serif;color:#1d2125}
    h1{font-size:40px;margin:44px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:118px}
    .ruban{fill:#f1f1ec;stroke:#333;stroke-width:2}.kraft{fill:#d2b07c;stroke:#333;stroke-width:1.5}.vide{fill:#fff;stroke:#333;stroke-width:1.5}
    .logo{fill:none;stroke:#0b3f94;stroke-width:9}.amorce{fill:none;stroke:#333;stroke-width:3}.sol{stroke:#888;stroke-width:2}
    .m{stroke:#7b8388;stroke-width:3}.axe{stroke:#555;stroke-width:1.5;stroke-dasharray:14 5 3 5}.r{stroke:#999;stroke-width:1.2}
    .c{stroke:#c0392b;stroke-width:2}text{font-size:22px;fill:#1d2125}text.t{font-weight:600;font-size:24px}
    table{position:absolute;left:70px;top:1150px;width:2060px;border-collapse:collapse;font-size:16.5px;line-height:1.25}
    th{width:230px;text-align:left;vertical-align:top;padding:3px 12px 3px 0;color:#444}td{padding:3px 0;border-top:1px solid #ddd}
    </style><h1>Ruban de cerclage à filaments Uline S-5736, 1 po × 60 verges — cotes</h1>
    <p class="s">Aucun plan : largeur, longueur et épaisseur publiées ; Ø extérieur calculé ; * = cote supposée, confirmée par la photo ; † = cote relevée sur la photo.</p>
    <svg width="2200" height="1030"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>
    <text x="110" y="60" class="t">Vue de face (le long de l'axe), ${fr(k, 1)} px/mm</text>${face}
    <text x="${cx - 330}" y="60" class="t">Coupe par l'axe, ${fr(s, 1)} px/mm</text>${coupe}</svg>
    <table>${lignes}</table></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
