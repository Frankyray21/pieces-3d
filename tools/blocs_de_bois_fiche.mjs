// Écrit public/equipment/blocs-de-bois/data.json : les cotes viennent du modèle
// (src/models/blocs-de-bois/index.js), pour que la fiche et la 3D disent la même chose. Avec
// --page <fichier.html>, écrit aussi la page des cotes (pages/P02.webp en est une capture de
// 2 200 × 1 700 px) : un bloc de face et de bout, et la disposition des sept blocs vue de dessus.
// Usage : node tools/blocs_de_bois_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import { IN, BLOC, MASSE_VOLUMIQUE, POSES, bloc, coins, jeuMinimal, horsTout } from '../src/models/blocs-de-bois/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 1) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / IN) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };
const b = bloc(), h = horsTout(), N = POSES.length;
const COTES = `${po(BLOC.long)} × ${po(BLOC.cote)} × ${po(BLOC.cote)}`;

const SOURCE = 'Page du produit « Blocs de bois » de TIME Limited (Forage et exploration), fournie par le client (P01). Aucun plan';
const PUBLIE = `« Sac en vrac de blocs de bois. » Numéro 92-1500 : « CORE BLOCKS 2" X 3/4" X 3/4" ». Rien d'autre n'est publié sur la page : ni l'essence du bois, ni le nombre de blocs par sac, ni la masse`;
const USAGE = 'Bloc repère de la boîte à carottes : on y écrit le métrage (la profondeur du trou) au crayon-feutre et on le pose dans la rangée, au bout de la carotte de chaque course. Les blocs du modèle sont vierges, comme sur la photo';

const data = {
  id: 'blocs-de-bois',
  name: 'Blocs de bois pour boîte à carottes TIME 92-1500, 2 × 3/4 × 3/4 po',
  manufacturer: 'TIME Limited',
  category: 'Blocs repères de métrage (boîte à carottes)',
  serial: '',
  document: {
    title: 'Page du produit (aucun plan) et cotes publiées ou relevées',
    reference: '92-1500',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Données publiées', PUBLIE],
    ['Usage', USAGE],
    ['Cotes d\'un bloc', `${COTES} (${mm(BLOC.long)} × ${mm(BLOC.cote, 2)} × ${mm(BLOC.cote, 2)}) — publiées. Les proportions des blocs de la photo s'y accordent`],
    ['Bois', 'Résineux clair, scié (bouts rugueux), fil dans le sens de la longueur : relevé sur la photo. Essence non publiée. Sur le modèle, chaque bloc a ses propres cernes, les mêmes sur ses six faces (arcs sur les bouts, veines le long des côtés) ; leur largeur, de 2 à 4,5 mm, est supposée'],
    ['Masse', `Environ ${fr(b.masse)} g par bloc — calculée : ${fr(b.volume, 1)} cm³ × ${fr(MASSE_VOLUMIQUE, 2)} g/cm³, masse volumique supposée (épinette sèche). Non publiée`],
    ['Disposition', `Les ${N} blocs de la photo, debout sur leur bout : quatre derrière, trois devant, le dernier de la rangée du fond tourné de ${fr(POSES[3].angle)}°. Places relevées sur la photo à quelques millimètres près ; les blocs ne se touchent pas (jeu minimal de ${mm(jeuMinimal())}). Encombrement : ${mm(h.large)} × ${mm(h.profond)} × ${mm(h.haut)} de haut`],
    ['Non modélisé', 'Le sac (à la demande du client). Aucune inscription sur les blocs. Arêtes vives : les éclats du sciage ne sont pas dessinés'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Page du produit TIME Limited « Blocs de bois » (92-1500), fournie par le client',
    P02: 'Cotes d\'un bloc et disposition des sept blocs (publiées, relevées)',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'CORE BLOCKS 2" X 3/4" X 3/4"',
      titleFr: `Blocs de bois pour boîte à carottes, ${COTES}`,
      pn: '92-1500',
      sheets: ['P01', 'P02'],
      note: `Reconstitution 3D d'après la page du produit de TIME Limited (P01) : blocs de bois de ${COTES}, vendus en vrac au sac. ${USAGE}. Le sac n'est pas modélisé. Les ${N} blocs sont ceux que la photo montre à côté du sac, debout sur leur bout ; en vue éclatée, ils s'écartent les uns des autres. Essence du bois non publiée : résineux clair scié, d'après la photo.`,
      parts: [
        ['1', '92-1500', N, `BLOC DE BOIS (core block), ${COTES}`, { note: `Bois résineux clair scié, fil dans le sens de la longueur ; ${mm(BLOC.long)} × ${mm(BLOC.cote, 2)} × ${mm(BLOC.cote, 2)}, environ ${fr(b.masse)} g (calculé, épinette supposée). Le numéro 92-1500 est celui du sac en vrac ; la quantité est celle des blocs montrés sur la photo, pas celle du sac (non publiée).` }],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/blocs-de-bois/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; bloc de ${fr(b.volume, 2)} cm³, ${fr(b.masse, 1)} g ; jeu minimal ${fr(jeuMinimal(), 2)} mm ; encombrement ${fr(h.large, 1)} × ${fr(h.profond, 1)} × ${fr(h.haut, 1)} mm`);

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  const hc = (xa, xb, y, txt) => `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${(xa + xb) / 2}" y="${y - 12}" text-anchor="middle">${txt}</text>`;
  const vc = (x, ya, yb, txt) => `<line x1="${x}" y1="${ya}" x2="${x}" y2="${yb}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${x + 14}" y="${(ya + yb) / 2 + 7}">${txt}</text>`;
  const rappel = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="r"/>`;
  // Un bloc, de face et de bout.
  const k = 11, x0 = 130, y0 = 330, L = BLOC.long * k, C = BLOC.cote * k, xb = x0 + L + 330;
  const veines = [0.16, 0.33, 0.47, 0.66, 0.85].map((t, i) => `<path d="M ${x0} ${y0 + C * t} C ${x0 + L * 0.3} ${y0 + C * t + (i % 2 ? 7 : -6)}, ${x0 + L * 0.7} ${y0 + C * t + (i % 2 ? -6 : 8)}, ${x0 + L} ${y0 + C * t + 3}" class="v"/>`).join('');
  const cernes = [150, 190, 228, 262, 300, 340].map((r) => `<circle cx="${xb - 120}" cy="${y0 + C + 110}" r="${r}" class="v"/>`).join('');
  const unBloc = `
    <rect x="${x0}" y="${y0}" width="${L}" height="${C}" class="bois"/>${veines}
    <clipPath id="bout"><rect x="${xb}" y="${y0}" width="${C}" height="${C}"/></clipPath>
    <rect x="${xb}" y="${y0}" width="${C}" height="${C}" class="bois"/><g clip-path="url(#bout)">${cernes}</g>
    <rect x="${xb}" y="${y0}" width="${C}" height="${C}" class="trait"/>
    ${rappel(x0, y0, x0, y0 - 80)}${rappel(x0 + L, y0, x0 + L, y0 - 80)}
    ${hc(x0, x0 + L, y0 - 60, `${po(BLOC.long)} (${mm(BLOC.long)}) — publiée`)}
    ${rappel(x0 + L, y0, x0 + L + 80, y0)}${rappel(x0 + L, y0 + C, x0 + L + 80, y0 + C)}
    ${vc(x0 + L + 60, y0, y0 + C, `${po(BLOC.cote)} (${mm(BLOC.cote, 2)})`)}
    ${rappel(xb, y0, xb, y0 - 80)}${rappel(xb + C, y0, xb + C, y0 - 80)}
    ${hc(xb, xb + C, y0 - 60, `${po(BLOC.cote)} — publiée`)}
    <text x="${x0}" y="${y0 + C + 44}">De face : fil du bois dans le sens de la longueur †</text>
    <text x="${xb}" y="${y0 + C + 44}">De bout : cernes †</text>`;
  // Disposition vue de dessus : x vers la droite, z (l'avant) vers le bas.
  const s = 6.4, cx = 1790, cy = 400;
  const poly = POSES.map((p, i) => {
    const pts = coins(p).map(([x, z]) => `${cx + x * s},${cy + z * s}`).join(' ');
    return `<polygon points="${pts}" class="bois"/><text x="${cx + p.x * s}" y="${cy + p.z * s + 8}" text-anchor="middle">${i + 1}</text>`;
  }).join('');
  const xs = POSES.flatMap(coins).map((p) => p[0]), zs = POSES.flatMap(coins).map((p) => p[1]);
  const xa = cx + Math.min(...xs) * s, xz = cx + Math.max(...xs) * s, za = cy + Math.min(...zs) * s, zz = cy + Math.max(...zs) * s;
  const plan = `${poly}
    ${rappel(xa, zz, xa, zz + 90)}${rappel(xz, zz, xz, zz + 90)}
    ${hc(xa, xz, zz + 75, `${mm(h.large)} †`)}
    ${rappel(xa, za, xa - 90, za)}${rappel(xa, zz, xa - 90, zz)}
    <line x1="${xa - 70}" y1="${za}" x2="${xa - 70}" y2="${zz}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${xa - 84}" y="${(za + zz) / 2 + 7}" text-anchor="end">${mm(h.profond)} †</text>
    <text x="${cx}" y="${zz + 130}" text-anchor="middle">avant (côté de la photo)</text>`;
  const lignes = data.specs.map(([t, v]) => `<tr><th>${t}</th><td>${v}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:22px/1.32 system-ui,sans-serif;color:#1d2125}
    h1{font-size:40px;margin:44px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:118px}
    .bois{fill:#ecd9b0;stroke:#333;stroke-width:2}.trait{fill:none;stroke:#333;stroke-width:2}.v{fill:none;stroke:#b98f55;stroke-width:2.5}
    .r{stroke:#999;stroke-width:1.2}.c{stroke:#c0392b;stroke-width:2}text{font-size:22px;fill:#1d2125}text.t{font-weight:600;font-size:24px}
    table{position:absolute;left:70px;top:1010px;width:2060px;border-collapse:collapse;font-size:19px;line-height:1.3}
    th{width:230px;text-align:left;vertical-align:top;padding:6px 12px 6px 0;color:#444}td{padding:6px 0;border-top:1px solid #ddd}
    </style><h1>Blocs de bois pour boîte à carottes TIME 92-1500, ${COTES} — cotes</h1>
    <p class="s">Aucun plan : cotes du bloc publiées par TIME Limited ; † = relevé sur la photo de la page du produit.</p>
    <svg width="2200" height="880"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>
    <text x="${x0}" y="150" class="t">Un bloc, ${fr(k)} px/mm</text>${unBloc}
    <text x="${cx - 330}" y="150" class="t">Les ${N} blocs de la photo, debout, vus de dessus, ${fr(s, 1)} px/mm</text>${plan}</svg>
    <table>${lignes}</table></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
