// Écrit public/equipment/niveau-4-pi/data.json : les cotes viennent du modèle
// (src/models/niveau-4-pi/index.js), pour que la fiche et la 3D disent la même chose. Avec
// --page <fichier.html>, écrit aussi la page des cotes (pages/P01.webp en est une capture de
// 2 200 × 1 700 px) : vue de côté et section du profilé, dessinées en SVG à partir des mêmes cotes.
// Usage : node tools/niveau_4_pi_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import { L, H, B, EP, EMBOUT, LP, FENETRES, DOUBLURE, FIOLE, fenetres, masse } from '../src/models/niveau-4-pi/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
// Sans décimale pour un entier, sinon une (2,5 mm ne doit pas s'écrire 3 mm).
const mm = (v, n = Number.isInteger(v) ? 0 : 1) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / 25.4) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };
const m = masse();
const f = FENETRES;
const bout = (w) => L / 2 - w.x; // distance du centre d'une fenêtre au bout du niveau

const SOURCE = 'Aucun plan ni photo fournis. Niveau du type Stabila 196-2 de 48 po (n° 37448) : longueur, profilé caisson, nombre de fioles, poignées, embouts, précision et masse publiés par le fabricant et ses détaillants ; section d\'environ 60 × 30 mm donnée par les fiches des détaillants (arrondie au centimètre) ; le reste supposé';
const MASSE = `Masse calculée sur le modèle : ${fr(m.kg, 2)} kg (${fr(m.lb, 2)} lb) — aluminium ${fr(m.alu)} cm³ à 2 700 kg/m³ (${fr(m.alu * 2.7 / 1000, 2)} kg), embouts, doublures et plaques des fioles — contre environ 1,2 kg publiés (1,18 à 1,20 kg selon les détaillants européens ; 2,57 à 4,15 lb selon les détaillants américains, qui ne s'accordent pas). Les épaisseurs supposées des parois sont cohérentes avec la masse publiée`;

const data = {
  id: 'niveau-4-pi',
  name: 'Niveau à bulle de 4 pi (48 po), profilé caisson',
  manufacturer: 'Type Stabila 196-2 (cotes publiées)',
  category: 'Outil de mesure',
  serial: '',
  document: {
    title: 'Cotes publiées (fabricant et détaillants, aucun plan) et cotes supposées',
    reference: '37448',
    preparedBy: '',
    date: '',
    sheets: 1,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Données publiées', 'Longueur de 48 po (122 cm en Europe) ; profilé caisson en aluminium extra rigide ; 1 fiole horizontale et 2 fioles d\'aplomb ; 2 poignées ; embouts amortisseurs ; précision de 0,029° (0,5 mm/m) en position normale ; masse d\'environ 1,2 kg'],
    ['Longueur', `${po(L)} (${mm(L, 1)}) hors tout, embouts compris — donnée publiée`],
    ['Section du profilé', `${mm(H)} de haut (entre les faces de mesure) × ${mm(B)} de large (environ ${po(H)} × ${po(B)}) — fiches des détaillants, arrondies au centimètre`],
    ['Profilé', `Caisson d'aluminium de ${mm(LP, 1)} entre les embouts : flancs de ${mm(EP.flanc)}, semelles du haut et du bas de ${mm(EP.semelle)} fraisées (faces de mesure, aluminium nu), âme centrale de ${mm(EP.ame, 1)} ; épaisseurs supposées. Flancs peints en jaune`],
    ['Fiole horizontale', `Au milieu, dans une fenêtre traversante de ${mm(f.centre.long)} × ${mm(f.centre.haut)} ; fiole de Ø ${mm(FIOLE.d)} tenue par une plaque d'acrylique clair de ${mm(FIOLE.plaque)}, deux bagues de lecture à ±${mm(FIOLE.repere, 1)} du centre ; cotes supposées`],
    ['Fioles d\'aplomb', `Deux, en travers du niveau, centrées à ${mm(bout(f.aplomb))} des bouts dans des fenêtres de ${mm(f.aplomb.long)} × ${mm(f.aplomb.haut)} ; niveau couché, leur bulle monte au bout du haut ; cotes supposées`],
    ['Poignées', `Deux trous de main de ${mm(f.poignee.long)} × ${mm(f.poignee.haut)} à bouts ronds, centrés à ${mm(f.poignee.x)} du milieu, doublés d'un manchon de plastique noir à rebords ; place et taille supposées`],
    ['Doublures', `Manchons de plastique noir qui traversent le profilé (paroi de ${mm(DOUBLURE.paroi)}), rebords de ${mm(DOUBLURE.rebord, 1)} en saillie de ${mm(DOUBLURE.saillie, 1)} sur les flancs ; les cadres des fioles sont faits de même`],
    ['Embouts', `Caoutchouc noir, creux (paroi de ${mm(EMBOUT.paroi)}), emboîtés sur les bouts du profilé, ${mm(EMBOUT.long)} de long, en retrait de ${mm(EMBOUT.retrait, 1)} sur les faces de mesure (le niveau porte sur l'aluminium) et en débord de ${mm(EMBOUT.debord)} sur les flancs ; couleur et forme supposées`],
    ['Masse', MASSE],
    ['Non modélisé', 'Marquages, logo et graduations éventuels : aucune source ne les montre'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Cotes du niveau : vue de côté et section du profilé (publiées et supposées)',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'SPIRIT LEVEL, 48 IN, BOX BEAM',
      titleFr: 'Niveau à bulle de 4 pi (48 po), profilé caisson',
      pn: '37448',
      sheets: ['P01'],
      note: `Reconstitution 3D sans plan ni photo, d'après les données publiées pour le niveau Stabila 196-2 de 48 po : longueur de 48 po, profilé caisson en aluminium, une fiole horizontale et deux d'aplomb, deux poignées, embouts amortisseurs, masse d'environ 1,2 kg. Section de ${mm(H)} × ${mm(B)} d'après les fiches des détaillants (valeurs arrondies au centimètre). Supposé : les épaisseurs du caisson, l'âme centrale, la place et la taille des fenêtres et des poignées, la forme des fioles et la couleur des embouts. Les faces de mesure du haut et du bas sont fraisées (aluminium nu), les flancs peints en jaune. ${MASSE}. Le niveau est couché sur le sol, face de mesure en bas ; en vue éclatée, les fioles montent, les poignées sortent en travers et les embouts s'écartent.`,
      parts: [
        ['1', '', 1, `PROFILÉ CAISSON en aluminium, ${mm(LP, 1)} × ${mm(H)} × ${mm(B)}`, { note: `Deux flancs jaunes percés de cinq fenêtres, semelles fraisées de ${mm(EP.semelle)} (faces de mesure), âme centrale. Épaisseurs supposées.` }],
        ['2', '', 1, 'FIOLE HORIZONTALE et son bloc, au milieu', { note: `Fiole de Ø ${mm(FIOLE.d)}, liquide vert-jaune, bulle entre deux bagues de lecture ; plaque d'acrylique clair de ${mm(FIOLE.plaque)} et cadre de plastique noir. Lue par les deux flancs.` }],
        ['3', '', 2, 'FIOLE D\'APLOMB et son bloc, près des bouts', { note: `Fioles en travers du niveau, à ${mm(bout(f.aplomb))} des bouts ; pour vérifier un aplomb, le niveau se tient debout. Même construction que la fiole horizontale.` }],
        ['4', '', 2, `POIGNÉE (trou de main) ${mm(f.poignee.long)} × ${mm(f.poignee.haut)}`, { note: 'Manchon de plastique noir à rebords qui double le trou de main à travers tout le profilé. Place et taille supposées.' }],
        ['5', '', 2, 'EMBOUT AMORTISSEUR en caoutchouc', { note: `${mm(EMBOUT.long)} de long, en retrait sur les faces de mesure. Couleur et forme supposées.` }],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/niveau-4-pi/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; masse ${fr(m.kg, 3)} kg (${fr(m.lb, 2)} lb)`);

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  // Vue de côté : 2 000 px pour la longueur ; section agrandie 5 fois.
  const k = 1700 / L, x0 = 250, y0 = 220;
  const X = (x) => x0 + (x + L / 2) * k, Y = (y) => y0 + (H - y) * k * 1;
  const rr = (cx, cy, w, h, r) => `<rect x="${X(cx - w / 2)}" y="${Y(cy + h / 2)}" width="${w * k}" height="${h * k}" rx="${r * k}" />`;
  const cote = (xa, xb, y, txt) => `<line x1="${X(xa)}" y1="${y}" x2="${X(xb)}" y2="${y}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${(X(xa) + X(xb)) / 2}" y="${y - 8}" text-anchor="middle">${txt}</text>`;
  const fen = fenetres();
  const vue = `
    <rect x="${X(-L / 2)}" y="${Y(H - EMBOUT.retrait)}" width="${EMBOUT.long * k}" height="${(H - 2 * EMBOUT.retrait) * k}" rx="4" class="emb"/>
    <rect x="${X(L / 2 - EMBOUT.long)}" y="${Y(H - EMBOUT.retrait)}" width="${EMBOUT.long * k}" height="${(H - 2 * EMBOUT.retrait) * k}" rx="4" class="emb"/>
    <rect x="${X(-LP / 2)}" y="${Y(H)}" width="${LP * k}" height="${H * k}" class="prof"/>
    <g class="fen">${fen.map((w) => rr(w.x, H / 2, w.long, w.haut, w.r)).join('')}</g>
    ${cote(-L / 2, L / 2, Y(H) - 60, `${po(L)} (${mm(L, 1)}) — publiée`)}
    ${cote(-LP / 2, LP / 2, Y(H) - 20, `profilé ${mm(LP, 1)}`)}
    ${cote(f.aplomb.x, L / 2, Y(0) + 40, `${mm(bout(f.aplomb))} *`)}
    ${cote(0, f.poignee.x, Y(0) + 40, `${mm(f.poignee.x)} *`)}
    ${cote(-f.centre.long / 2, f.centre.long / 2, Y(0) + 80, `${mm(f.centre.long)} *`)}
    ${cote(-f.poignee.x - f.poignee.long / 2, -f.poignee.x + f.poignee.long / 2, Y(0) + 80, `${mm(f.poignee.long)} × ${mm(f.poignee.haut)} *`)}
    ${cote(-f.aplomb.x - f.aplomb.long / 2, -f.aplomb.x + f.aplomb.long / 2, Y(0) + 80, `${mm(f.aplomb.long)} × ${mm(f.aplomb.haut)} *`)}`;
  // Section : agrandie, en px par mm.
  const s = 4, sx = 1300, sy = 600;
  const SX = (z) => sx + z * s, SY = (y) => sy + (H - y) * s; // sy : haut de la section
  const sec = `
    <rect x="${SX(-B / 2)}" y="${SY(H)}" width="${B * s}" height="${EP.semelle * s}" class="alu"/>
    <rect x="${SX(-B / 2)}" y="${SY(EP.semelle)}" width="${B * s}" height="${EP.semelle * s}" class="alu"/>
    <rect x="${SX(-B / 2)}" y="${SY(H - EP.semelle)}" width="${EP.flanc * s}" height="${(H - 2 * EP.semelle) * s}" class="jaune"/>
    <rect x="${SX(B / 2 - EP.flanc)}" y="${SY(H - EP.semelle)}" width="${EP.flanc * s}" height="${(H - 2 * EP.semelle) * s}" class="jaune"/>
    <rect x="${SX(-B / 2 + EP.flanc)}" y="${SY(H / 2 + EP.ame / 2)}" width="${(B - 2 * EP.flanc) * s}" height="${EP.ame * s}" class="brut"/>
    <line x1="${SX(-B / 2)}" y1="${SY(H) - 30}" x2="${SX(B / 2)}" y2="${SY(H) - 30}" class="c" marker-start="url(#f)" marker-end="url(#f)"/>
    <text x="${sx}" y="${SY(H) - 40}" text-anchor="middle">${mm(B)} — détaillants</text>
    <line x1="${SX(B / 2) + 40}" y1="${SY(H)}" x2="${SX(B / 2) + 40}" y2="${SY(0)}" class="c" marker-start="url(#f)" marker-end="url(#f)"/>
    <text x="${SX(B / 2) + 52}" y="${(SY(H) + SY(0)) / 2}">${mm(H)} — détaillants</text>
    <text x="${SX(-B / 2) - 20}" y="${SY(H - EP.semelle / 2) + 6}" text-anchor="end">semelle fraisée ${mm(EP.semelle)} *</text>
    <text x="${SX(-B / 2) - 20}" y="${SY(H / 2) + 6}" text-anchor="end">flanc ${mm(EP.flanc)} *, âme ${mm(EP.ame, 1)} *</text>
    <text x="${SX(-B / 2) - 20}" y="${SY(EP.semelle / 2) + 6}" text-anchor="end">face de mesure</text>`;
  const lignes = data.specs.map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:22px/1.35 system-ui,sans-serif;color:#1d2125}
    h1{font-size:40px;margin:50px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:120px}
    .prof{fill:#f2bf0a;stroke:#333;stroke-width:2}.emb{fill:#26282b}.fen rect{fill:#fff;stroke:#222;stroke-width:2}
    .alu{fill:#c9cdd1;stroke:#333;stroke-width:1.5}.jaune{fill:#f2bf0a;stroke:#333;stroke-width:1.5}.brut{fill:#aeb2b6;stroke:#333;stroke-width:1}
    .c{stroke:#c0392b;stroke-width:2}text{font-size:22px;fill:#1d2125}
    table{position:absolute;left:70px;top:1010px;width:2060px;border-collapse:collapse;font-size:19px}
    th{width:250px;text-align:left;vertical-align:top;padding:5px 12px 5px 0;color:#444}td{padding:5px 0;border-top:1px solid #ddd}
    </style><h1>Niveau à bulle de 4 pi (48 po), profilé caisson — cotes</h1>
    <p class="s">Type Stabila 196-2 (n° 37448). Aucun plan : cotes publiées par le fabricant et les détaillants ; * = cote supposée.</p>
    <svg width="2200" height="880"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>
    <text x="250" y="110" font-weight="600">Vue de côté (flanc)</text>${vue}
    <text x="${sx - 200}" y="${sy - 70}" font-weight="600">Section du profilé, agrandie (${s} px/mm)</text>${sec}</svg>
    <table>${lignes}</table></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
