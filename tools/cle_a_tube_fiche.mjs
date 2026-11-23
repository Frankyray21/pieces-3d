// Écrit public/equipment/cle-a-tube/data.json : les cotes viennent du modèle
// (src/models/cle-a-tube/index.js), pour que la fiche et la 3D disent la même chose.
// Avec --page <fichier.html>, écrit aussi la page des cotes (pages/P02.webp en est une capture de
// 2 200 × 1 700 px) : clé en prise sur son tube, dessinée en SVG à partir des mêmes contours, avec
// la provenance de chaque cote (photo du client, photo de référence, supposée).
// pages/P01.webp est la photo du client.
// Usage : node tools/cle_a_tube_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import {
  TUBE, R, EP, LARGEUR, AXE_A, AXE_B, LIAISON, CROCHET, MANCHE, NEZ, BOULON, AXE, DENTS, OUVERT, RELACHE, COURSE, ENVELOPPE,
  PRESSION, HORS_TOUT, BOUT, STEPS, contourCrochet, contourJoue, contourSabot, contourManche, contourCreux, contourTrou,
  jeuNez, jeuCrochet, passage, dent,
} from '../src/models/cle-a-tube/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
// Sans décimale pour un entier, sinon une (12,7 mm ne doit pas s'écrire 13 mm).
const mm = (v, n = Number.isInteger(v) ? 0 : 1) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / 25.4) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };

// ------------------------------------------------------------------ contrôle du mécanisme

let ok = true;
const echec = (msg) => { ok = false; console.log(`✕ ${msg}`); };
if (Math.abs(jeuNez(0)) > 1e-6) echec(`la dent du nez ne touche pas le tube (jeu de ${fr(jeuNez(0), 3)} mm)`);
if (jeuNez(RELACHE) < 1) echec(`manche relevé, le nez reste à ${fr(jeuNez(RELACHE), 2)} mm du tube`);
if (Math.abs(jeuCrochet(0)) > 1e-6) echec(`la mâchoire crochet fermée ne porte pas sur le tube (${fr(jeuCrochet(0), 3)} mm)`);
for (let phi = 1; phi <= OUVERT; phi++) if (jeuCrochet(phi) <= 0) echec(`la mâchoire crochet entre dans le tube à ${phi}° d'ouverture`);
if (passage() < 0.5) echec(`mâchoire ouverte, le tube ne passe pas (${fr(passage(), 2)} mm)`);
// La mâchoire ouverte ne doit pas heurter le sabot de la mâchoire de liaison.
const dansSabot = (p) => { const r = Math.hypot(p[0], p[1]), a = Math.atan2(p[1], p[0]) * 180 / Math.PI; return r > R && r < R + LIAISON.ep && a > LIAISON.a && a < LIAISON.de; };
for (let phi = 0; phi <= OUVERT; phi += 2) {
  const c = Math.cos(phi * Math.PI / 180), s = Math.sin(phi * Math.PI / 180);
  const heurt = contourCrochet().some(([x, y]) => dansSabot([AXE_B.x + (x - AXE_B.x) * c - (y - AXE_B.y) * s, AXE_B.y + (x - AXE_B.x) * s + (y - AXE_B.y) * c]));
  if (heurt) echec(`la mâchoire crochet heurte le sabot à ${phi}° d'ouverture`);
}

// ------------------------------------------------------------------ masse calculée (acier, 7,85 kg/dm³)

const aire = (pts) => Math.abs(pts.reduce((s, [x, y], i) => { const [u, v] = pts[(i + 1) % pts.length]; return s + x * v - u * y; }, 0)) / 2;
const disque = (d) => Math.PI * d * d / 4;
const volume = {
  manche: (aire(contourManche()) - disque(AXE_A.d) - aire(contourTrou())) * EP.manche - aire(contourCreux()) * (EP.manche - EP.ame),
  liaison: 2 * (aire(contourJoue()) - disque(AXE_A.d) - disque(AXE_B.d)) * EP.joue + aire(contourSabot()) * EP.fourche,
  crochet: (aire(contourCrochet()) - disque(AXE_B.d)) * EP.crochet,
};
const kg = (v) => v * 7.85e-6;
const masse = kg(volume.manche + volume.liaison + volume.crochet) + 0.15; // axe, boulon, rondelle et écrou : environ 150 g

// ------------------------------------------------------------------ textes

const OA = Math.hypot(AXE_A.x, AXE_A.y), OB = Math.hypot(AXE_B.x, AXE_B.y);
const SOURCE = 'Une photo du client : deux clés identiques pendues à un mur, vues presque par la tranche, les manches coupés par le bas de la photo. Et la photo du même type de clé publiée par TIME Limited (« Tube wrenches », vue à plat, mâchoire crochet ouverte), que le client a reconnue comme étant ce modèle. Aucun plan, aucune cote publiée';
const IDENT = 'Clé à tube « pleine prise » (full grip tube wrench) pour les tubes de carottier : un manche, deux mâchoires articulées qui font presque le tour du tube. Aucune marque n\'est lisible sur la photo du client ; une joue garde une trace de peinture bleue. Le fabricant n\'est pas identifié';
const REFS = 'Clés du même type aux catalogues, sans qu\'on sache si ce sont celles du client : TIME Limited 92-21-460 (« WRENCH, N INNER TUBE ») ; Fordia / Epiroc 3760006031 (« Inner tube wrenches », carottier N, catalogue des outils de carottage ITH)';
const GROSSEUR = `Grosseur N, prise pour celle du tube intérieur N : Ø ${fr(TUBE.d, 1)} mm (2 3/16 po), le rayon des deux mâchoires. Si les clés du client sont celles du tube extérieur N (Ø 73 mm), les arcs sont à reprendre à ce diamètre`;
const ECHELLE = `Photo du client : l'ouverture de l'anneau (environ 105 pixels) prise au diamètre du tube, soit 0,53 mm par pixel ; l'épaisseur du manche (environ ${mm(EP.manche)}) et sa largeur (environ ${mm(MANCHE.large)}) s'accordent avec cette échelle, pas avec celle d'un tube de 73 mm. Photo de référence : redressée et mise à l'échelle sur l'arc de la mâchoire de liaison ; les deux articulations, le dos de la mâchoire et le manche du modèle s'y superposent`;
const MECANISME = `Les deux mâchoires enveloppent le tube sur ${fr(ENVELOPPE)}°. Le manche tourne sur son axe entre les joues de la mâchoire de liaison ; son nez, à ${mm(DENTS[1].r, 1)} de l'axe, touche le tube en avant de la ligne qui joint l'axe au centre du tube (angle de pression de ${fr(PRESSION)}°) : en appuyant sur le manche, la dent se coince contre le tube et le plaque dans les mâchoires — plus on tire, plus elle serre. Du côté de son bout, le frottement du tube tend alors à refermer la mâchoire crochet. Dans l'autre sens, le manche pivote de ${RELACHE}° et son nez s'écarte de ${mm(jeuNez(RELACHE), 1)} : les mâchoires glissent et la clé reprend sa course sans quitter le tube. Elle ne serre que dans un sens : pour tourner dans l'autre, on la retourne. Mécanisme lu sur les photos et vérifié par le tracé, sans notice du fabricant ; le rôle de l'ergot du crochet n'est pas établi`;
const MODELE = `Sur le site, la page P02 anime la clé sur un tronçon de tube en ${STEPS.length - 1} temps : coiffer le tube (mâchoire crochet ouverte de ${OUVERT}°, il reste ${mm(passage(), 1)} de jeu au passage), refermer la mâchoire, tirer (course de ${COURSE}°, le tube tourne avec la clé), ramener le manche (la clé glisse), reprendre. La course de ${COURSE}° est un choix de mise en scène`;

const pieces = [
  ['1', '', 1, `MANCHE forgé à nez denté, ${mm(MANCHE.long)} de l'axe au bout`, { pseudo: true, note: `Section d'environ ${mm(MANCHE.large)} × ${mm(EP.manche)} à la tête (photo du client), ${mm(MANCHE.bout)} de large au bout ; âme de ${mm(EP.ame)} au fond d'un creux sur chaque face, trou d'accrochage oblong de ${mm(MANCHE.trou.long)} × ${mm(MANCHE.trou.large)} (photo de référence). Nez à trois dents : celle du milieu touche le tube, celle du bas prend le relais ${NEZ.relais}° plus loin. Longueur supposée : le manche est coupé par le bas de la photo du client ; elle suit les proportions de la photo de référence. Profil des dents supposé.` }],
  ['2', '', 1, `MÂCHOIRE DE LIAISON en fourche, ${mm(LARGEUR)} de large`, { pseudo: true, note: `Deux joues de ${mm(EP.joue)}, de l'axe du manche au boulon, à cheval sur la tête du manche et sur l'œil de la mâchoire crochet (jour de ${mm(EP.fourche)}) ; entre elles, un sabot qui porte sur le tube sur ${LIAISON.de - LIAISON.a}°, épais de ${mm(LIAISON.ep)}. Entraxe de ${mm(Math.hypot(AXE_B.x - AXE_A.x, AXE_B.y - AXE_A.y), 1)}. D'une pièce ou assemblée : la photo ne le montre pas. La fente où paraît le nez du manche est le jour de la fourche.` }],
  ['3', '', 1, `MÂCHOIRE CROCHET à ergot, ${mm(EP.crochet)} de large`, { pseudo: true, note: `Arc de prise de ${CROCHET.de - CROCHET.a}°, épais de ${mm(CROCHET.ep)}, qui commence sous le boulon : la mâchoire s'écarte du tube dès qu'elle s'ouvre. Ergot de ${mm(CROCHET.ergot.large)} × ${mm(CROCHET.ergot.haut)} au bout, sur le dos (photo de référence) : sans doute pour la saisir, son rôle n'est pas établi. Épaisseur radiale estimée sur la photo de référence.` }],
  ['4', '', 1, `AXE du manche, Ø ${po(AXE_A.d)}, à tête ronde`, { pseudo: true, note: `Tête ronde de Ø ${mm(AXE.tete.d)} visible sur la photo du client ; l'autre bout est caché : supposé riveté.` }],
  ['5', '', 1, `BOULON à tête hexagonale, ${po(BOULON.d)} × ${po(BOULON.long)}`, { pseudo: true, note: `Articulation des deux mâchoires (photo du client : tête hexagonale, rondelle, écrou, filet qui dépasse). Sur la photo de référence, cette articulation est un axe riveté : le boulon est peut-être une réparation. Diamètre estimé d'après la tête (environ ${mm(BOULON.plats)} sur plats) ; longueur calculée sur l'épaisseur serrée.` }],
  ['6', '', 1, `RONDELLE plate ${po(BOULON.d)}, sous la tête du boulon`, { pseudo: true, note: `Ø ${mm(BOULON.rondelle.d)} × ${mm(BOULON.rondelle.ep, 1)} (supposé).` }],
  ['7', '', 1, `ÉCROU hexagonal ${po(BOULON.d)}`, { pseudo: true, note: 'Du côté opposé à la tête ; type (ordinaire ou à frein) non lisible sur la photo.' }],
];

const data = {
  id: 'cle-a-tube',
  name: 'Clé à tube pleine prise, grosseur N (tube intérieur de carottier)',
  manufacturer: 'Fabricant non identifié — type TIME Limited 92-21-460 / Fordia 3760006031',
  category: 'Outils à main',
  serial: '',
  document: {
    title: 'Photo du client, photo de référence du même type de clé (aucun plan) et cotes supposées',
    reference: 'Clé à tube N',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Identification', IDENT],
    ['Références du même type', REFS],
    ['Grosseur', GROSSEUR],
    ['Échelle des photos', ECHELLE],
    ['Hors tout', `Environ ${mm(Math.round(HORS_TOUT))} (${po(HORS_TOUT)}) de long, clé fermée sur son tube ; ${mm(LARGEUR)} d'épaisseur aux mâchoires, ${mm(Math.round(LARGEUR + BOULON.rondelle.ep + BOULON.d * 0.65 + (BOULON.long - LARGEUR - BOULON.rondelle.ep)))} au boulon. Longueur supposée (manche hors de la photo du client)`],
    ['Articulations', `Axe du manche à ${mm(OA, 1)} du centre du tube, boulon des mâchoires à ${mm(OB, 1)}, presque à l'opposé (photo de référence). Axe et boulon de Ø ${po(AXE_A.d)}`],
    ['Mécanisme', MECANISME],
    ['Fonctionnement en 3D', MODELE],
    ['Masse', `Environ ${fr(masse, 1)} kg, calculée sur le modèle (acier, 7,85 kg/dm³) : manche ${fr(kg(volume.manche), 2)} kg, mâchoire de liaison ${fr(kg(volume.liaison), 2)} kg, mâchoire crochet ${fr(kg(volume.crochet), 2)} kg, visserie environ 0,15 kg. Aucune masse publiée`],
    ['Non modélisé', 'Marque et numéro du fabricant (illisibles), trace de peinture bleue d\'une joue, grains de carbure ou mordaches des faces de prise (certaines clés de ce type en ont ; la photo ne les montre pas), usure, et le boulon qui sert de crochet au mur'],
    ['Pour faire mieux', 'Une clé posée à plat avec un ruban à mesurer, de face et de côté, et la longueur hors tout : les cotes supposées deviendraient des mesures. Une marque frappée sur le manche identifierait le fabricant'],
  ],
  weights: [['Clé complète (calculée)', `≈ ${fr(masse, 1)} kg`]],
  sheetTitles: {
    P01: 'Photo du client : deux clés à tube pendues, vues par la tranche',
    P02: 'Cotes de la clé en prise sur le tube (photos et supposées)',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'FULL GRIP TUBE WRENCH, N INNER TUBE',
      titleFr: 'Clé à tube pleine prise, tube intérieur N',
      pn: '',
      sheets: ['P01', 'P02'],
      note: `Reconstitution 3D d'après une photo du client et la photo du même type de clé publiée par TIME Limited, sans plan ni cote. Sûr : le diamètre du tube intérieur N, ${fr(TUBE.d, 1)} mm. Photo du client : les épaisseurs, la fourche de la mâchoire de liaison, le boulon, sa rondelle et son écrou, l'axe à tête ronde, le creux du manche. Photo de référence : la place des deux articulations, l'étendue des arcs, l'ergot, le nez denté, le trou d'accrochage. Supposé : la longueur du manche, le dos de la clé, le bout de l'axe, le profil des dents. ${MECANISME}. Clé couchée à plat, mâchoire crochet ouverte de ${OUVERT}° comme sur la photo de référence ; en vue éclatée, le manche et la mâchoire crochet s'écartent, l'axe et le boulon sortent vers le haut, l'écrou vers le bas.`,
      parts: [...pieces, ['9', '', null, 'Fonctionnement : la clé coiffe le tube, serre et reprend sa course (scène animée)', { link: 'P02', no3d: true, pseudo: true }]],
    },
    P02: {
      title: 'HOW IT WORKS',
      titleFr: 'Fonctionnement : coiffer, serrer, reprendre',
      pn: '',
      sheets: ['P02', 'P01'],
      note: `La même clé sur un tronçon de tube intérieur N debout, animée en ${STEPS.length - 1} temps (boutons Lecture et étape suivante). ${STEPS.map((s) => s.text).join(' ')} ${MODELE}.`,
      parts: [...pieces, ['8', '', 1, `TUBE INTÉRIEUR N, Ø ${fr(TUBE.d, 1)} mm : tronçon de 260 mm`, { pseudo: true, note: 'Représenté pour montrer la prise ; il ne fait pas partie de la clé. Le trait jaune est un repère pour voir le tube tourner.' }]],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/cle-a-tube/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; hors tout ${fr(HORS_TOUT, 1)} mm, masse ${fr(masse, 2)} kg, enveloppe ${ENVELOPPE}°, passage ${fr(passage(), 2)} mm${ok ? '' : ' — CONTRÔLE EN ÉCHEC'}`);

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  const pts = (l, X, Y) => l.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  const dessin = (X, Y, k, { tete = false } = {}) => `
    <polygon points="${pts(contourManche(), X, Y)}" class="manche"/>
    <polygon points="${pts(contourCreux(), X, Y)}" class="creux"/>
    <polygon points="${pts(contourTrou(), X, Y)}" class="vide"/>
    <circle cx="${X(0)}" cy="${Y(0)}" r="${R * k}" class="tube"/><circle cx="${X(0)}" cy="${Y(0)}" r="${(TUBE.di / 2) * k}" class="vide"/>
    <polygon points="${pts(contourCrochet(), X, Y)}" class="crochet"/>
    <polygon points="${pts(contourSabot(), X, Y)}" class="sabot"/>
    <polygon points="${pts(contourJoue(), X, Y)}" class="joue"/>
    <circle cx="${X(AXE_A.x)}" cy="${Y(AXE_A.y)}" r="${(AXE_A.d / 2) * k}" class="axe"/>
    <circle cx="${X(AXE_B.x)}" cy="${Y(AXE_B.y)}" r="${(AXE_B.d / 2) * k}" class="axe"/>
    ${tete ? `<circle cx="${X(dent(1)[0])}" cy="${Y(dent(1)[1])}" r="7" class="dent"/>` : ''}`;
  // Vue d'ensemble : 3,3 px par mm.
  const k1 = 3.3, ox = 1880, oy = 300;
  const X1 = (x) => ox + x * k1, Y1 = (y) => oy - y * k1;
  const coteH = (X, xa, xb, y, txt) => `<line x1="${X(xa)}" y1="${y}" x2="${X(xb)}" y2="${y}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${(X(xa) + X(xb)) / 2}" y="${y - 9}" text-anchor="middle">${txt}</text>`;
  const coteV = (Y, ya, yb, x, txt, gauche = false) => `<line x1="${x}" y1="${Y(ya)}" x2="${x}" y2="${Y(yb)}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${x + (gauche ? -10 : 10)}" y="${(Y(ya) + Y(yb)) / 2 + 7}"${gauche ? ' text-anchor="end"' : ''}>${txt}</text>`;
  const yM = AXE_A.y - MANCHE.decale;
  const ensemble = `
    ${dessin(X1, Y1, k1)}
    ${coteH(X1, BOUT, AXE_A.x, Y1(yM) + 120, `${mm(MANCHE.long)} de l'axe au bout *`)}
    ${coteH(X1, BOUT, BOUT + HORS_TOUT, Y1(yM) + 175, `environ ${mm(Math.round(HORS_TOUT))} (${po(HORS_TOUT)}) hors tout *`)}
    ${coteV(Y1, yM - MANCHE.large / 2, yM + MANCHE.large / 2, X1(-250), `${mm(MANCHE.large)}`)}
    ${coteV(Y1, yM - MANCHE.bout / 2, yM + MANCHE.bout / 2, X1(BOUT) - 22, `${mm(MANCHE.bout)} *`, true)}
    <text x="${X1(-330)}" y="${Y1(yM) - 78}" text-anchor="middle" class="s">creux sur les deux faces, âme de ${mm(EP.ame)} · épaisseur du manche ${mm(EP.manche)}</text>
    <text x="${X1(BOUT + MANCHE.trou.duBout)}" y="${Y1(yM) - 78}" text-anchor="middle" class="s">trou d'accrochage</text>`;
  // Tête : 7,2 px par mm.
  const k2 = 7.2, px = 900, py = 1050;
  const X2 = (x) => px + x * k2, Y2 = (y) => py - y * k2;
  const pt = (r, a) => [X2(r * Math.cos(a * Math.PI / 180)), Y2(r * Math.sin(a * Math.PI / 180))];
  /** Légende (une ou deux lignes) reliée par un trait au point visé. */
  const legende = (x, y, lignes, [vx, vy], anc = 'start') => {
    const l = [].concat(lignes);
    const t = l.map((v, i) => `<text x="${x}" y="${y + i * 27}" text-anchor="${anc}">${v}</text>`).join('');
    const dx = anc === 'start' ? -8 : anc === 'end' ? 8 : 0;
    return `${t}<line x1="${x + dx}" y1="${y - 7 + (vy > y ? (l.length - 1) * 27 + 14 : -14)}" x2="${vx}" y2="${vy}" class="l"/>`;
  };
  const d1 = dent(1);
  const tete = `
    ${dessin(X2, Y2, k2, { tete: true })}
    <line x1="${X2(AXE_A.x)}" y1="${Y2(AXE_A.y)}" x2="${X2(0)}" y2="${Y2(0)}" class="a"/>
    <line x1="${X2(0)}" y1="${Y2(0)}" x2="${X2(AXE_B.x)}" y2="${Y2(AXE_B.y)}" class="a"/>
    <text x="${X2(AXE_A.x * 0.72)}" y="${Y2(AXE_A.y * 0.72) - 10}" text-anchor="middle">${mm(OA, 1)}</text>
    <text x="${X2(AXE_B.x * 0.42)}" y="${Y2(AXE_B.y * 0.42) + 30}" text-anchor="middle">${mm(OB, 1)}</text>
    <text x="${X2(0)}" y="${Y2(0) - 62}" text-anchor="middle" class="t">tube intérieur N</text>
    <text x="${X2(0)}" y="${Y2(0) - 36}" text-anchor="middle" class="t">Ø ${fr(TUBE.d, 1)} mm</text>
    ${legende(X2(-8), Y2(R + LIAISON.ep) - 34, `mâchoire de liaison : sabot de ${LIAISON.de - LIAISON.a}°, épais de ${mm(LIAISON.ep)}, entre deux joues`, pt(R + LIAISON.ep - 5, 96), 'middle')}
    ${legende(X2(AXE_B.x) + 122, Y2(AXE_B.y) - 8, [`boulon ${po(BOULON.d)},`, 'rondelle, écrou'], [X2(AXE_B.x) + 44, Y2(AXE_B.y)])}
    ${legende(X2(36), Y2(-49), [`mâchoire crochet : arc de ${CROCHET.de - CROCHET.a}°,`, `épaisse de ${mm(CROCHET.ep)}`], pt(R + CROCHET.ep - 4, -50))}
    ${legende(X2(-30), Y2(-57), 'ergot (rôle non établi)', pt(R + CROCHET.ep + CROCHET.ergot.haut - 3, CROCHET.a + 7), 'end')}
    ${legende(X2(AXE_A.x) - 40, Y2(-52), `axe du manche, Ø ${po(AXE_A.d)}, à tête ronde`, [X2(AXE_A.x), Y2(AXE_A.y) + 40], 'middle')}
    ${legende(X2(AXE_A.x) - 40, Y2(-52) + 44, `dent en prise, à ${mm(DENTS[1].r, 1)} de l'axe`, [X2(d1[0]) - 6, Y2(d1[1]) + 6], 'middle')}`;
  const garde = new Set(['Source', 'Grosseur', 'Échelle des photos', 'Masse', 'Non modélisé']);
  const lignes = data.specs.filter(([a]) => garde.has(a)).map(([a, b]) => `<tr><th>${a}</th><td>${b}</td></tr>`).join('');
  const epaisseurs = [
    ['Mâchoire crochet', mm(EP.crochet)], ['Chaque joue de la mâchoire de liaison', mm(EP.joue)], ['Jour de la fourche', mm(EP.fourche)],
    ['Mâchoire de liaison, hors tout', mm(LARGEUR)], ['Manche', mm(EP.manche)],
  ].map(([a, b]) => `<tr><td>${a}</td><td class="n">${b}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:21px/1.34 system-ui,sans-serif;color:#1d2125;position:relative;overflow:hidden}
    h1{font-size:40px;margin:40px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:0}
    .manche{fill:#b9b3a8;stroke:#3a3631;stroke-width:2}.creux{fill:#9d978c;stroke:#5a554e;stroke-width:1.5}.vide{fill:#fff;stroke:#3a3631;stroke-width:1.5}
    .tube{fill:#dfe6ec;stroke:#c0392b;stroke-width:3}.crochet{fill:#8fa9c9;stroke:#1f3f66;stroke-width:2;fill-opacity:.92}
    .sabot{fill:#9cc7a4;stroke:#1f5a2c;stroke-width:1.5}.joue{fill:#6fae7b;stroke:#1f5a2c;stroke-width:2;fill-opacity:.72}
    .axe{fill:#2b2d30;stroke:#000}.dent{fill:none;stroke:#c0392b;stroke-width:3}
    .c{stroke:#c0392b;stroke-width:2}.a{stroke:#c0392b;stroke-width:1.5;stroke-dasharray:9 6}.l{stroke:#555;stroke-width:1.5}
    text{font-size:21px;fill:#1d2125}text.s{font-size:18px;fill:#566}text.t{font-size:19px;fill:#7a1f16}
    h2{position:absolute;margin:0;font-size:24px}
    table{border-collapse:collapse}
    table.ep{position:absolute;left:1560px;top:690px;width:570px;font-size:19px}table.ep td{padding:5px 0;border-top:1px solid #ddd}td.n{text-align:right;white-space:nowrap}
    table.sp{position:absolute;left:1560px;top:900px;width:570px;font-size:15.5px;line-height:1.3}
    table.sp th{display:block;text-align:left;color:#444;padding-top:7px}table.sp td{display:block;padding:1px 0 6px;border-bottom:1px solid #ddd}
    div.mec{position:absolute;left:70px;top:1545px;width:1410px;font-size:16.5px;line-height:1.36}div.mec b{font-size:19px}
    </style><h1>Clé à tube pleine prise, grosseur N — cotes</h1>
    <p class="s">Clé en prise sur le tube intérieur N. Cotes relevées sur la photo du client et sur la photo de référence, à l'échelle du tube ; * = cote supposée (manche hors de la photo).</p>
    <svg width="2200" height="1700"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>
    ${ensemble}
    ${tete}</svg>
    <h2 style="left:70px;top:625px">La tête, clé en prise</h2>
    <h2 style="left:1560px;top:640px">Épaisseurs le long du tube (photo du client)</h2>
    <table class="ep">${epaisseurs}</table>
    <table class="sp">${lignes}</table>
    <div class="mec"><b>Mécanisme.</b> ${MECANISME}.</div></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
process.exit(ok ? 0 : 1);
