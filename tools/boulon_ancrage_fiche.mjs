// Écrit public/equipment/boulon-ancrage-time/data.json : les cotes viennent du modèle
// (src/models/boulon-ancrage-time/index.js), pour que la fiche et la 3D disent la même chose.
// Avec --page <fichier.html>, écrit aussi la page des cotes (pages/P02.webp en est une capture
// de 2 200 × 1 700 px) : le boulon entier de côté, et ses deux bouts agrandis.
// Usage : node tools/boulon_ancrage_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import { IN, LONGUEUR, CORPS, SPIRES, cotes } from '../src/models/boulon-ancrage-time/index.js';

const fr = (v, n = 0) => (v + 1e-9).toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;
const c = cotes();
const NOM = 'Boulon d\'ancrage standard TIME 83-52, NW/L 5 pi';

const SOURCE = 'Page du produit « Boulons d\'ancrage standard » de TIME Limited (Forage et exploration), fournie par le client (P01). Aucun plan';
const PUBLIE = '« Les boulons d\'ancrage sont conçus pour fixer la perceuse au diamant sur la paroi rocheuse, éliminant ainsi le mouvement latéral de la perceuse. » Avantages : aucun outil spécial n\'est requis ; réutilisables. Numéro 83-52 : « ANCHOR BOLT NW/L 5\' ». Aucune cote de détail, aucune masse';
const POSE = 'Pour chaque boulon d\'ancrage, un trou est percé à quelques degrés du trou de forage prévu ; le boulon est fixé dans la roche dans ce trou ; la foreuse est ensuite fixée au boulon, ce qui la rend stable (texte de la page)';
const GAMME = '83-05 AW/L 3 pi · 83-06 AW/L 3,5 pi · 83-50 AW/L 4 pi · 83-07 AW/L 5,5 pi · 83-09 AW/L 8 pi · 83-30 BW/L 3 pi · 83-31 BW/L 4 pi · 83-32 BW/L 5,5 pi · 83-51 NW/L 4 pi · 83-52 NW/L 5 pi (modélisé) · 83-53 NW/L 6 pi · 83-54 NW/L 8 pi · 83-28 HW/L 4 pi · 83-29 HW/L 6 pi';

const data = {
  id: 'boulon-ancrage-time',
  name: NOM,
  manufacturer: 'TIME Limited',
  category: 'Boulon (pine) d\'ancrage de foreuse au diamant',
  serial: '',
  document: {
    title: 'Page du produit (aucun plan) et cotes publiées, relevées ou supposées',
    reference: '83-52',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Données publiées', PUBLIE],
    ['Installation', POSE],
    ['Gamme de la page', GAMME],
    ['Longueur', `5 pi (${mm(LONGUEUR)}) — publiée. Supposée hors tout, du nez fileté au bout de la tige`],
    ['Diamètre du corps', `${mm(CORPS, 1)} (2 3/4 po) — supposé : diamètre extérieur d'une tige de forage de calibre N câble (« NW/L »). Non publié`],
    ['Bout fileté', `Nez lisse de ${mm(c.nez.d)} × ${mm(c.nez.l)}, puis filet mâle de ${mm(c.filet.d)} × ${mm(c.filet.l)}, ${SPIRES} spires (pas d'environ ${mm(c.pas, 1)}) — proportions relevées sur la photo, mises à l'échelle du corps. Type de filet non publié`],
    ['Tige du bout', `Portée claire de ${mm(c.portee.d)} × ${mm(c.portee.l)}, puis bout sombre de ${mm(c.bout.d)} × ${mm(c.bout.l)} — proportions relevées sur la photo, mises à l'échelle du corps`],
    ['Corps', `Rond, lisse, acier sombre : ${mm(c.corps.l)} de long (le reste des 5 pi)`],
    ['Réserves', 'La page montre une seule photo pour ses quatorze boulons ; d\'après ses proportions, c\'est un boulon plus court et plus mince que le NW/L 5 pi. Les bouts du modèle en reprennent les proportions. L\'intérieur du boulon et le mécanisme d\'ancrage dans la roche ne sont pas montrés : modèle plein, d\'un seul repère. Masse non publiée, non calculée'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Page du produit TIME Limited « Boulons d\'ancrage standard », fournie par le client',
    P02: 'Cotes du boulon NW/L 5 pi (publiées, relevées, supposées)',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'ANCHOR BOLT NW/L 5\'',
      titleFr: 'Boulon d\'ancrage standard, NW/L 5 pi',
      pn: '83-52',
      sheets: ['P01', 'P02'],
      note: `Reconstitution 3D d'après la page du produit de TIME Limited (P01) : boulon d'ancrage de calibre N câble, 5 pi (${mm(LONGUEUR)}). ${POSE}. Publié : le numéro et la désignation seulement. Diamètre du corps supposé (${mm(CORPS, 1)}, tige N câble) ; formes et proportions des deux bouts relevées sur la photo, qui sert aux quatorze boulons de la page. Voir la page P02 pour les cotes.`,
      parts: [
        ['1', '83-52', 1, 'BOULON D\'ANCRAGE (anchor bolt) NW/L 5 pi', { note: `Corps rond de ${mm(CORPS, 1)} (supposé) ; bout fileté mâle de ${SPIRES} spires derrière un nez lisse ; tige du bout en deux étages (portée claire, bout sombre). Longueur hors tout ${mm(LONGUEUR)} (5 pi, supposée hors tout). Réutilisable, posé sans outil spécial (page du produit).` }],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/boulon-ancrage-time/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; corps ${fr(c.corps.d, 1)} × ${fr(c.corps.l)} mm ; nez ${fr(c.nez.l)}, filet ${fr(c.filet.l)}, portée ${fr(c.portee.l)}, bout ${fr(c.bout.l)} mm ; hors tout ${fr(c.x[5])} mm`);

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  const hc = (xa, xb, y, txt) => `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${(xa + xb) / 2}" y="${y - 12}" text-anchor="middle">${txt}</text>`;
  const rappel = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="r"/>`;
  const diam = (x, y, d, k, txt, dx = 0) => `<line x1="${x}" y1="${y - (d / 2) * k}" x2="${x}" y2="${y + (d / 2) * k}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${x + dx}" y="${y + (d / 2) * k + 34}" text-anchor="middle">${txt}</text>`;
  /** Boulon de côté : origine (x0, y) au nez, k px/mm, de xa à xb (mm) seulement. */
  const profil = (x0, y, k, xa = 0, xb = LONGUEUR) => {
    const zones = [['filet', c.nez, 0], ['filet', c.filet, 1], ['corps', c.corps, 2], ['portee', c.portee, 3], ['bout', c.bout, 4]];
    let s = '';
    for (const [cls, v, i] of zones) {
      const a = Math.max(xa, c.x[i]), b = Math.min(xb, c.x[i + 1]);
      if (b <= a) continue;
      s += `<rect x="${x0 + (a - xa) * k}" y="${y - (v.d / 2) * k}" width="${(b - a) * k}" height="${v.d * k}" class="${cls}"/>`;
      if (i === 1) for (let n = 0; n <= SPIRES; n++) { const x = x0 + (c.x[1] + n * c.pas - xa) * k; s += `<line x1="${x}" y1="${y - (v.d / 2) * k}" x2="${x}" y2="${y + (v.d / 2) * k}" class="sp"/>`; }
    }
    return s;
  };
  // Boulon entier.
  const k1 = 1.3, x0 = (2200 - LONGUEUR * k1) / 2, y1 = 250;
  const entier = `${profil(x0, y1, k1)}
    ${rappel(x0, y1, x0, y1 - 120)}${rappel(x0 + LONGUEUR * k1, y1, x0 + LONGUEUR * k1, y1 - 120)}
    ${hc(x0, x0 + LONGUEUR * k1, y1 - 100, `5 pi (${mm(LONGUEUR)}) — publiée ; supposée hors tout`)}
    ${rappel(x0 + c.x[2] * k1, y1, x0 + c.x[2] * k1, y1 + 120)}${rappel(x0 + c.x[3] * k1, y1, x0 + c.x[3] * k1, y1 + 120)}
    ${hc(x0 + c.x[2] * k1, x0 + c.x[3] * k1, y1 + 110, `corps : ${mm(c.corps.l)}`)}`;
  // Bouts agrandis.
  const k2 = 3.2, y2 = 610, coupe = 110;
  const xg = 150, gFin = c.x[2] + coupe;
  const gauche = `${profil(xg, y2, k2, 0, gFin)}
    ${[0, 1, 2].map((i) => rappel(xg + c.x[i] * k2, y2, xg + c.x[i] * k2, y2 - 190)).join('')}
    ${hc(xg, xg + c.x[1] * k2, y2 - 170, `${mm(c.nez.l)} †`)}
    ${hc(xg + c.x[1] * k2, xg + c.x[2] * k2, y2 - 170, `filet : ${mm(c.filet.l)}, ${SPIRES} spires †`)}
    ${diam(xg + (c.x[1] / 2) * k2, y2, c.nez.d, k2, `⌀ ${mm(c.nez.d)} †`)}
    ${diam(xg + ((c.x[1] + c.x[2]) / 2) * k2, y2, c.filet.d, k2, `⌀ ${mm(c.filet.d)} †`)}
    ${diam(xg + (c.x[2] + coupe / 2) * k2, y2, c.corps.d, k2, `⌀ ${mm(CORPS, 1)} ‡`, 40)}
    <text x="${xg}" y="${y2 + 215}" class="t">Bout fileté</text>`;
  const dDeb = c.x[3] - coupe, xd = 2050 - (LONGUEUR - dDeb) * k2, X = (v) => xd + (v - dDeb) * k2;
  const droite = `${profil(xd, y2, k2, dDeb, LONGUEUR)}
    ${[3, 4, 5].map((i) => rappel(X(c.x[i]), y2, X(c.x[i]), y2 - 190)).join('')}
    ${hc(X(c.x[3]), X(c.x[4]), y2 - 170, `${mm(c.portee.l)} †`)}
    ${hc(X(c.x[4]), X(c.x[5]), y2 - 170, `${mm(c.bout.l)} †`)}
    ${diam(X((c.x[3] + c.x[4]) / 2), y2, c.portee.d, k2, `⌀ ${mm(c.portee.d)} †`)}
    ${diam(X((c.x[4] + c.x[5]) / 2), y2, c.bout.d, k2, `⌀ ${mm(c.bout.d)} †`)}
    <text x="${xd}" y="${y2 + 215}" class="t">Tige du bout (portée claire, bout sombre)</text>`;
  const lignes = data.specs.map(([t, v]) => `<tr><th>${t}</th><td>${v}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:22px/1.32 system-ui,sans-serif;color:#1d2125}
    h1{font-size:40px;margin:44px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:118px}
    .corps{fill:#6a6058;stroke:#222;stroke-width:2}.filet{fill:#d9d7d0;stroke:#222;stroke-width:2}.portee{fill:#dfe5e1;stroke:#222;stroke-width:2}.bout{fill:#67615c;stroke:#222;stroke-width:2}
    .sp{stroke:#777;stroke-width:1.2}.r{stroke:#999;stroke-width:1.2}.c{stroke:#c0392b;stroke-width:2}text{font-size:22px;fill:#1d2125}text.t{font-weight:600;font-size:24px}
    table{position:absolute;left:70px;top:1000px;width:2060px;border-collapse:collapse;font-size:18px;line-height:1.28}
    th{width:230px;text-align:left;vertical-align:top;padding:5px 12px 5px 0;color:#444}td{padding:5px 0;border-top:1px solid #ddd}
    </style><h1>${NOM} — cotes</h1>
    <p class="s">Aucun plan : longueur publiée par TIME Limited ; † = proportion relevée sur la photo, à l'échelle du corps ; ‡ = supposé (tige N câble).</p>
    <svg width="2200" height="880"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>
    <text x="70" y="60" class="t">Le boulon entier, de côté</text>${entier}${gauche}${droite}</svg>
    <table>${lignes}</table></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
