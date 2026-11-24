// Écrit public/equipment/trousse-deversement-zenith/data.json : les cotes viennent du modèle
// (src/models/trousse-deversement-zenith/index.js), pour que la fiche et la 3D disent la même chose.
// Avec --page <fichier.html>, écrit aussi la page des cotes (pages/P03.webp en est une capture de
// 2 200 × 1 700 px) : coupe par l'axe du baril et de son contenu, dessinée en SVG à partir des mêmes cotes.
// Usage : node tools/trousse_deversement_fiche.mjs [--page <fichier.html>]
import { writeFileSync, mkdirSync } from 'node:fs';
import { IN, BARIL, ETIQUETTE, BOUDIN, FEUILLES, SACS, GANT, SACHET, ECHELLE, echelle, profilBaril, rayonInterieur, spirale, rangement } from '../src/models/trousse-deversement-zenith/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = 0) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / IN) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };
const e = echelle(), s = spirale(), r = rangement();
const ecart = (e.rapportPhoto / e.rapportModele - 1) * 100;

const SOURCE = 'Photo du produit (P01) et photo du chantier (P02), fournies par le client. Aucun plan. Référence relevée chez le détaillant : Tenaquip SEJ274, « Zenith Safety Products Premium Shop Spill Kit, Universal, Drum, 30 US gal. ». Les fiches du fabricant et du détaillant n\'ont pas pu être consultées d\'ici : les données publiées viennent des résultats de recherche qui les citent';
const BARIL_TXT = `Baril de polyéthylène bleu à ouverture totale de 30 gal US (114 L), couvercle et cerceau de fermeture. Le fabricant ne publie pas ses cotes : celles d'un baril de 30 gal US à ouverture totale du commerce sont prises, soit ${po(BARIL.hCouvercle)} (${mm(BARIL.hCouvercle)}) de haut avec le couvercle, ${po(BARIL.h)} (${mm(BARIL.h)}) sans, Ø ${po(BARIL.d)} (${mm(BARIL.d)}) à la ceinture, couvercle et cerceau de Ø ${po(BARIL.dCerceau)} (${mm(BARIL.dCerceau)})`;
const ECHELLE_TXT = `Photo du chantier (P02), agrandie quatre fois : le baril mesure ${ECHELLE.d} pixels de large et ${ECHELLE.h} du bord avant du couvercle au bas ; l'ellipse du couvercle (${ECHELLE.ellipse} sur ${ECHELLE.dCouvercle} pixels) donne une prise de vue plongeante de ${fr(e.plongee)}°. Hauteur corrigée / Ø = ${fr(e.rapportPhoto, 2)}, contre ${fr(e.rapportModele, 2)} au modèle (${fr(Math.abs(ecart))} % d'écart, dans la précision du relevé) : avec un Ø de ${po(BARIL.d)}, la photo donne ${mm(e.hPhoto)} de haut. Le seau de 5 gal voisin (Ø ${fr(ECHELLE.dSeau / IN, 1)} po au bord) mesure ${ECHELLE.seau} pixels : pris à la même distance, il donnerait un baril de Ø ${mm(e.dSeau)} ; il est un peu plus loin de l'appareil, le Ø réel est donc un peu moindre, ce qui s'accorde avec ${mm(BARIL.d)}. Un baril de 20 gal (Ø 16 po environ) ou de 55 gal (Ø 23 po) ne s'accorde pas`;
const CONTENU = `Contenu publié pour la trousse d'atelier universelle Zenith de 30 gal US (fiche d'un détaillant), à confirmer sur la trousse : ${FEUILLES.nombre} feuilles absorbantes de ${po(FEUILLES.large)} × ${po(FEUILLES.long)}, ${BOUDIN.nombre} boudins absorbants de ${po(BOUDIN.d)} × ${po(BOUDIN.long)}, 1 couvre-drain de 36 × 36 po, 1 mastic de colmatage de 4 oz, 2 paires de gants de nitrile, ${SACS.nombre} sacs d'élimination de ${po(SACS.large)} × ${po(SACS.long)}. La photo du produit montre le baril, quatre boudins, une pile de feuilles, une liasse noire pliée, une paire de gants verts et un sachet transparent`;
const RANGEMENT = `Rangement supposé (non montré sur les photos) : les ${BOUDIN.nombre} boudins enroulés à plat au fond (spirale de ${fr(s.tours, 1)} tours, Ø hors tout de ${mm(2 * s.rHorsTout)}, ${mm(s.haut)} de haut chacun), la pile de feuilles pliées en deux (${mm(FEUILLES.large)} × ${mm(FEUILLES.long / 2)}, ${mm(FEUILLES.pile)} de haut une fois tassée), les sacs pliés, le sachet et les gants. Dessus du contenu à ${mm(r.dessus)} du sol, ${mm(r.libre)} sous le couvercle`;

const data = {
  id: 'trousse-deversement-zenith',
  name: 'Trousse de déversement universelle Zenith, baril de 30 gal US',
  manufacturer: 'Zenith Safety Products',
  category: 'Trousse de déversement (baril, absorbants, équipement de protection)',
  serial: '',
  document: {
    title: 'Photo du produit, photo du chantier (aucun plan) et cotes prises, relevées ou supposées',
    reference: 'SEJ274',
    preparedBy: '',
    date: '',
    sheets: 3,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Baril', BARIL_TXT],
    ['Mise à l\'échelle', ECHELLE_TXT],
    ['Silhouette', `Relevée sur la photo du produit : pied conique jusqu'à ${mm(profilBaril().find(([rr]) => rr === BARIL.d / 2)[1])} du sol, ceinture large jusqu'à ${mm(profilBaril().filter(([rr]) => rr === BARIL.d / 2)[1][1])}, haut en retrait puis épaulement vers le col. La photo du produit montre un baril plus élancé (hauteur / Ø de 1,8) que celui du chantier : les proportions du chantier sont retenues`],
    ['Étiquette', `Blanche, environ ${mm(ETIQUETTE.large)} × ${mm(ETIQUETTE.haut)} (relevé sur la photo du produit), centre à ${mm(ETIQUETTE.y)} du sol : marque, « UNIVERSAL SPILL KIT, 30-GALLON », « TROUSSE DE DÉVERSEMENT UNIVERSELLE, 30 GALLONS » et code à barres. Texte peu lisible sur la photo : lecture probable`],
    ['Contenu', CONTENU],
    ['Rangement dans le baril', RANGEMENT],
    ['Supposé', `Épaisseur de la paroi (${mm(BARIL.paroi)}) et du fond (${mm(BARIL.fond)}) ; levier du cerceau, placé à l'arrière (caché sur les deux photos) ; hauteur de la pile de feuilles ; cotes des gants (${mm(GANT.long)} de long), du sachet (${mm(SACHET.large)} × ${mm(SACHET.long)}) et de la liasse de sacs pliée (${mm(SACS.plie[0])} × ${mm(SACS.plie[2])} × ${mm(SACS.plie[1])}), relevées à vue sur la photo du produit`],
    ['Non modélisé', 'Couvre-drain de 36 × 36 po : publié dans le contenu, non distingué sur la photo du produit. Deuxième paire de gants : la photo n\'en montre qu\'une. Capacité d\'absorption et masse : non trouvées dans les données consultées. La saleté du baril du chantier n\'est pas reproduite'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Photo du produit (trousse Zenith, baril de 30 gal US), fournie par le client',
    P02: 'Photo du chantier, fournie par le client : le baril près du seau de 5 gal, pour l\'échelle',
    P03: 'Cotes de la trousse : coupe par l\'axe du baril et de son contenu (prises, relevées, supposées)',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'PREMIUM SHOP SPILL KIT, UNIVERSAL, DRUM, 30 US GAL.',
      titleFr: 'Trousse de déversement universelle, baril de 30 gal US',
      pn: 'SEJ274',
      sheets: ['P01', 'P02', 'P03'],
      note: `Reconstitution 3D d'après la photo du produit (P01), mise à l'échelle par la photo du chantier (P02). ${BARIL_TXT}. ${ECHELLE_TXT}. ${RANGEMENT}. En vue éclatée, le contenu se dispose comme sur la photo du produit : boudins à gauche, feuilles et gants à droite, sacs et sachet devant ; la coupe proposée passe par l'axe du baril.`,
      parts: [
        ['1', '', 1, `BARIL de polyéthylène bleu, 30 gal US, à ouverture totale, Ø ${po(BARIL.d)} × ${po(BARIL.h)}`, { note: `Cotes d'un baril de 30 gal US du commerce, confirmées par la photo du chantier (hauteur / Ø de ${fr(e.rapportPhoto, 2)} relevé, ${fr(e.rapportModele, 2)} au modèle). Paroi de ${mm(BARIL.paroi)} supposée.` }],
        ['2', '', 1, `COUVERCLE de polyéthylène bleu, Ø ${po(BARIL.dCerceau)} avec le cerceau`, { note: `Porte la hauteur de la trousse fermée à ${po(BARIL.hCouvercle)} (${mm(BARIL.hCouvercle)}).` }],
        ['3', '', 1, 'CERCEAU DE FERMETURE à levier, acier galvanisé', { note: 'Cerceau visible sur la photo du produit ; levier supposé, placé à l\'arrière (caché sur les deux photos).' }],
        ['4', '', 1, `ÉTIQUETTE de la trousse, environ ${mm(ETIQUETTE.large)} × ${mm(ETIQUETTE.haut)}`, { note: 'Marque, désignation en anglais et en français, code à barres ; lecture probable d\'une photo peu lisible.' }],
        ['5', '', BOUDIN.nombre, `BOUDIN ABSORBANT universel, ${po(BOUDIN.d)} × ${po(BOUDIN.long)}`, { note: `Quatre comptés sur la photo du produit ; cotes du contenu publié. Enroulés à plat en spirale de ${fr(s.tours, 1)} tours, au fond du baril.` }],
        ['6', '', FEUILLES.nombre, `FEUILLE ABSORBANTE universelle, ${po(FEUILLES.large)} × ${po(FEUILLES.long)}`, { qty3d: 1, note: `Contenu publié : ${FEUILLES.nombre} feuilles. Une seule pile en 3D, feuilles pliées en deux, ${mm(FEUILLES.pile)} de haut (supposé).` }],
        ['7', '', SACS.nombre, `SAC D'ÉLIMINATION noir, ${po(SACS.large)} × ${po(SACS.long)}`, { qty3d: 1, note: `Contenu publié : ${SACS.nombre} sacs. Une liasse pliée en 3D.` }],
        ['8', '', 2, 'GANTS DE NITRILE, la paire', { note: 'Contenu publié : 2 paires. La photo du produit en montre une : deux gants en 3D.' }],
        ['9', '', 1, 'MASTIC DE COLMATAGE, 4 oz, en sachet avec la notice', { note: 'Sachet transparent de la photo du produit ; contenu peu lisible, d\'après le contenu publié.' }],
        ['10', '', 1, 'COUVRE-DRAIN, 36 × 36 po', { no3d: true, note: 'Publié dans le contenu ; non distingué sur la photo du produit, non modélisé.' }],
      ],
    },
  },
  documents: [],
};

const dossier = new URL('../public/equipment/trousse-deversement-zenith/', import.meta.url);
mkdirSync(new URL('pages/', dossier), { recursive: true });
writeFileSync(new URL('data.json', dossier), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; hauteur / Ø : ${fr(e.rapportPhoto, 3)} (photo) contre ${fr(e.rapportModele, 3)} (modèle), plongée ${fr(e.plongee, 1)}°, Ø d'après le seau ${fr(e.dSeau)} mm ; dessus du contenu ${fr(r.dessus)} mm, libre ${fr(r.libre)} mm`);

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  const k = 1.12, cx = 640, sol = 960; // pixels par mm
  const X = (x) => cx + x * k, Y = (y) => sol - y * k;
  const ext = profilBaril();
  const int = ext.slice(1).map(([rr, y]) => [rr - BARIL.paroi, Math.max(y, BARIL.fond)]);
  const tracer = (pts, sg) => pts.map(([rr, y]) => `${X(sg * rr)},${Y(y)}`).join(' ');
  const paroi = (sg) => `<polygon points="${tracer(ext, sg)} ${tracer([...int].reverse(), sg)} ${X(0)},${Y(BARIL.fond)}" class="pehd"/>`;
  const R = BARIL.d / 2, Rc = BARIL.dCerceau / 2, H = BARIL.h, Hc = BARIL.hCouvercle;
  const rect = (x0, y0, w, h, cls) => `<rect x="${X(x0)}" y="${Y(y0 + h)}" width="${w * k}" height="${h * k}" class="${cls}"/>`;
  // Boudins : sections de la spirale coupée par l'axe (à gauche et à droite).
  const sections = [];
  r.boudins.forEach((y) => {
    for (let rr = BOUDIN.rDebut; rr <= s.rFin + 1; rr += s.pas / 2) {
      sections.push(`<ellipse cx="${X(rr % s.pas < s.pas / 2 ? rr : -rr)}" cy="${Y(y + s.haut / 2)}" rx="${(BOUDIN.d / 2) * k}" ry="${(s.haut / 2) * k}" class="fibre"/>`);
    }
  });
  const lits = Array.from({ length: 24 }, (_, i) => `<line x1="${X(-FEUILLES.large / 2)}" x2="${X(FEUILLES.large / 2)}" y1="${Y(r.feuilles + ((i + 1) * FEUILLES.pile) / 25)}" y2="${Y(r.feuilles + ((i + 1) * FEUILLES.pile) / 25)}" class="lit"/>`).join('');
  const hc = (xa, xb, y, txt) => `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${(xa + xb) / 2}" y="${y - 10}" text-anchor="middle">${txt}</text>`;
  const vc = (x, ya, yb, txt, gauche = false) => `<line x1="${x}" y1="${ya}" x2="${x}" y2="${yb}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${x + (gauche ? -12 : 12)}" y="${(ya + yb) / 2 + 7}" ${gauche ? 'text-anchor="end"' : ''}>${txt}</text>`;
  const rappel = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="r"/>`;
  const renvoi = (x, y, txt) => `<line x1="${X(x)}" y1="${Y(y)}" x2="${X(R) + 150}" y2="${Y(y)}" class="r"/><text x="${X(R) + 158}" y="${Y(y) + 7}">${txt}</text>`;
  const coupe = `
    <line x1="${X(-R) - 230}" y1="${Y(0)}" x2="${X(R) + 620}" y2="${Y(0)}" class="sol"/>
    ${paroi(1)}${paroi(-1)}
    ${sections.join('')}
    ${rect(-FEUILLES.large / 2, r.feuilles, FEUILLES.large, FEUILLES.pile, 'fibre')}${lits}
    ${rect(-SACS.plie[0] / 2, r.sacs, SACS.plie[0], SACS.plie[1], 'noir')}
    ${rect(-SACHET.large / 2, r.sachet, SACHET.large, SACHET.epais, 'film')}
    ${rect(-150, r.gants, 300, 2 * GANT.epais, 'gant')}
    <polygon points="${X(-Rc + 3)},${Y(H - 12)} ${X(-Rc + 3)},${Y(Hc - 1.5)} ${X(-Rc + 31)},${Y(Hc - 1.5)} ${X(-Rc + 39)},${Y(H - 3)} ${X(Rc - 39)},${Y(H - 3)} ${X(Rc - 31)},${Y(Hc - 1.5)} ${X(Rc - 3)},${Y(Hc - 1.5)} ${X(Rc - 3)},${Y(H - 12)} ${X(Rc - 6)},${Y(H - 12)} ${X(Rc - 6)},${Y(Hc - 4.5)} ${X(Rc - 29)},${Y(Hc - 4.5)} ${X(Rc - 37)},${Y(H - 6)} ${X(-Rc + 37)},${Y(H - 6)} ${X(-Rc + 29)},${Y(Hc - 4.5)} ${X(-Rc + 6)},${Y(Hc - 4.5)} ${X(-Rc + 6)},${Y(H - 12)}" class="pehd"/>
    ${[-1, 1].map((sg) => `<rect x="${X(sg > 0 ? Rc - 2 : -Rc - 1)}" y="${Y(Hc)}" width="${3 * k}" height="${(Hc - H + 16) * k}" class="galva"/>`).join('')}
    <rect x="${X(-ETIQUETTE.large / 2 * 0.955)}" y="${Y(ETIQUETTE.y + ETIQUETTE.haut / 2)}" width="${ETIQUETTE.large * 0.955 * k}" height="${ETIQUETTE.haut * k}" class="etiq"/>
    <text x="${X(0)}" y="${Y(ETIQUETTE.y) + 7}" text-anchor="middle" class="p">étiquette, ${mm(ETIQUETTE.large)} × ${mm(ETIQUETTE.haut)} †</text>
    <line x1="${X(0)}" y1="${Y(Hc) - 40}" x2="${X(0)}" y2="${Y(0) + 30}" class="axe"/>
    ${rappel(X(-R), Y(300), X(-R), Y(0) + 110)}${rappel(X(R), Y(300), X(R), Y(0) + 110)}
    ${hc(X(-R), X(R), Y(0) + 90, `Ø ${po(BARIL.d)} (${mm(BARIL.d)}) *`)}
    ${rappel(X(-Rc), Y(Hc), X(-Rc), Y(Hc) - 75)}${rappel(X(Rc), Y(Hc), X(Rc), Y(Hc) - 75)}
    ${hc(X(-Rc), X(Rc), Y(Hc) - 55, `Ø ${po(BARIL.dCerceau)} (${mm(BARIL.dCerceau)}) *`)}
    ${rappel(X(-Rc), Y(Hc), X(-R) - 130, Y(Hc))}${rappel(X(-R), Y(0), X(-R) - 130, Y(0))}
    ${vc(X(-R) - 110, Y(Hc), Y(0), `${po(BARIL.hCouvercle)} (${mm(BARIL.hCouvercle)}) *`, true)}
    ${rappel(X(-R * 0.9), Y(H), X(-R) - 60, Y(H))}
    ${vc(X(-R) - 45, Y(H), Y(0), '', true)}<text x="${X(-R) - 57}" y="${Y(H / 3)}" text-anchor="end">${po(BARIL.h)} *</text>
    ${renvoi(R * 0.5, r.gants + GANT.epais, `gants de nitrile et sachet (mastic, notice) — à ${mm(r.dessus)} du sol, ${mm(r.libre)} sous le couvercle ‡`)}
    ${renvoi(SACS.plie[0] / 2, r.sacs + 10, `${SACS.nombre} sacs d'élimination pliés, ${mm(SACS.plie[0])} × ${mm(SACS.plie[2])} × ${mm(SACS.plie[1])} †`)}
    ${renvoi(FEUILLES.large / 2, r.feuilles + FEUILLES.pile / 2, `${FEUILLES.nombre} feuilles de ${po(FEUILLES.large)} × ${po(FEUILLES.long)}, pliées en deux : pile de ${mm(FEUILLES.large)} × ${mm(FEUILLES.long / 2)} × ${mm(FEUILLES.pile)} ‡`)}
    ${renvoi(s.rFin, r.boudins[1] + s.haut, `${BOUDIN.nombre} boudins de ${po(BOUDIN.d)} × ${po(BOUDIN.long)}, en spirale de ${fr(s.tours, 1)} tours : Ø ${mm(2 * s.rHorsTout)} × ${mm(BOUDIN.nombre * s.haut)} ‡`)}
    ${renvoi(rayonInterieur(40) + 1, 40, `paroi de ${mm(BARIL.paroi)}, fond de ${mm(BARIL.fond)} ‡ ; Ø intérieur de ${mm(2 * rayonInterieur(300))} à la ceinture`)}
    ${renvoi(Rc, Hc - 10, 'cerceau de fermeture, acier galvanisé ; levier à l\'arrière ‡')}`;
  const lignes = data.specs.map(([t, v]) => `<tr><th>${t}</th><td>${v}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:21px/1.3 system-ui,sans-serif;color:#1d2125}
    h1{font-size:38px;margin:40px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:118px}
    .pehd{fill:#2f74c9;stroke:#12335f;stroke-width:1.5}.galva{fill:#c4c8cb;stroke:#333;stroke-width:1}
    .fibre{fill:#d3d5d4;stroke:#555;stroke-width:1.3}.lit{stroke:#8c9090;stroke-width:1}
    .noir{fill:#222;stroke:#000}.film{fill:#dfe9f0;stroke:#567;stroke-width:1}.gant{fill:#5fd0b0;stroke:#2a7a64;stroke-width:1}
    .etiq{fill:#fff;fill-opacity:.72;stroke:#333;stroke-width:1.5;stroke-dasharray:8 5}
    .sol{stroke:#888;stroke-width:2}.axe{stroke:#555;stroke-width:1.5;stroke-dasharray:14 5 3 5}.r{stroke:#999;stroke-width:1.2}
    .c{stroke:#c0392b;stroke-width:2}text{font-size:21px;fill:#1d2125}text.t{font-weight:600;font-size:24px}text.p{font-size:17px}
    table{position:absolute;left:70px;top:1235px;width:2060px;border-collapse:collapse;font-size:15px;line-height:1.25}
    th{width:200px;text-align:left;vertical-align:top;padding:3px 10px 3px 0;color:#444}td{padding:3px 0;border-top:1px solid #ddd}
    </style><h1>Trousse de déversement universelle Zenith, baril de 30 gal US — cotes</h1>
    <p class="s">Aucun plan. * = cote d'un baril de 30 gal US du commerce, confirmée par la photo du chantier ; † = relevé sur la photo du produit ; ‡ = supposé.</p>
    <svg width="2200" height="1110"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>
    <text x="70" y="30" class="t">Coupe par l'axe, ${fr(k, 2)} px/mm</text>${coupe}</svg>
    <table>${lignes}</table></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
