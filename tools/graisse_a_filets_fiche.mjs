// Écrit public/equipment/graisse-a-filets/data.json : les cotes viennent du modèle
// (src/models/graisse-a-filets/index.js), pour que la fiche et la 3D disent la même chose. Avec
// --page <fichier.html>, écrit aussi la page des cotes (pages/P02.webp en est une capture de
// 2 200 × 1 700 px) : coupe par l'axe et vue de dessus, dessinées en SVG à partir des mêmes cotes.
// Usage : node tools/graisse_a_filets_fiche.mjs [--page <fichier.html>]
import { writeFileSync } from 'node:fs';
import { IN, ECHELLE, BIDON, PINCEAU, GRAISSE, mmParPixel, bidonMesure, ouverture, longPinceau, volumeGraisse, horsTout } from '../src/models/graisse-a-filets/index.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const mm = (v, n = Number.isInteger(v) ? 0 : 1) => `${fr(v, n)} mm`;
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / IN) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };

const k = mmParPixel(), mes = bidonMesure(), h = horsTout(), vol = volumeGraisse();
const [c24, c18] = ECHELLE.cles;
const DEMI = 137, GALLON = BIDON.d;

const SOURCE = 'Deux photos du client (P01) : le bidon de graisse sur son madrier, et la même scène avec deux clés à tuyau de 18 et de 24 po accrochées à la traverse pour donner l\'échelle. Aucun plan, aucune étiquette : la marque de la graisse et celle du bidon ne sont pas lisibles';
const ECH = `Sur la photo d'ensemble, la clé de 24 po mesure ${c24.px} pixels et celle de 18 po ${c18.px} pixels. Selon qu'on prend la longueur mâchoires fermées (${fr(c24.ferme, 1)} et ${fr(c18.ferme, 1)} po) ou la grandeur nominale, l'échelle va de ${fr(k[0], 2)} à ${fr(k[2], 2)} mm par pixel (${fr(k[1], 2)} en moyenne). Le bidon mesure ${ECHELLE.bidonPx} pixels de large : Ø de ${fr(mes[0])} à ${fr(mes[2])} mm (${fr(mes[1])} mm en moyenne) à la distance des clés. Le poteau derrière le bidon (${ECHELLE.poteauPx} pixels, soit ${fr(ECHELLE.poteauPx * k[1])} mm : un 2 × 4) confirme l'échelle`;
const CHOIX = `Deux bidons ronds du commerce encadrent la mesure : le demi-gallon (Ø ${DEMI} mm) et le gallon US (Ø ${mm(GALLON, 1)}). Le gallon est retenu : le bidon porte les deux oreilles d'une anse, que les bidons plus petits n'ont pas d'ordinaire. Écart avec la mesure moyenne : ${fr(((GALLON - mes[1]) / mes[1]) * 100)} %. À vérifier sur place avec un ruban à mesurer`;

const data = {
  id: 'graisse-a-filets',
  name: 'Graisse à filets : bidon de 1 gal US et pinceau',
  manufacturer: '',
  category: 'Graisse des filets de tiges de forage',
  serial: '',
  document: {
    title: 'Photos du client (aucun plan) et cotes mises à l\'échelle d\'après les clés à tuyau de 18 et 24 po',
    reference: '',
    preparedBy: '',
    date: '',
    sheets: 2,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Source', SOURCE],
    ['Échelle', ECH],
    ['Grandeur du bidon', CHOIX],
    ['Bidon', `Bidon rond de fer-blanc à anneau (type bidon de peinture), 1 gal US (3,79 L) : Ø du corps de ${po(BIDON.d)} (${mm(BIDON.d, 1)}), hauteur de ${po(BIDON.h)} (${mm(BIDON.h, 1)}), Ø de ${mm(h.bidon.d, 1)} aux sertis — grandeurs courantes du commerce, non mesurées. Terni et rouillé par plaques, comme sur la photo ; agrafe du flanc vers l'avant`],
    ['Anneau', `Largeur d'environ ${mm(BIDON.anneau.large)} sur le rayon, gorge de ${mm(BIDON.anneau.gorge)} où s'enfonce le couvercle, ouverture de Ø ${mm(ouverture(), 1)} environ — relevé sur la photo. Le couvercle n'est pas sur la photo : il n'est pas modélisé`],
    ['Oreilles', `Deux oreilles d'anse diamétralement opposées, pastille de Ø ${mm(BIDON.oreille.d)} à ${mm(BIDON.oreille.sousDessus)} sous le dessus, ${mm(h.bidon.oreilles, 1)} hors tout d'une oreille à l'autre — relevé sur la photo. L'anse de fil n'y est plus : elle n'est pas modélisée`],
    ['Graisse', `Pâte crème à jaunâtre, niveau courant à ${mm(GRAISSE.sousDessus)} sous le dessus, soit environ ${fr(vol, 1)} L (${fr(vol / 3.785, 2)} gal US) pour un bidon plein jusqu'au fond ; monticule de graisse brassée qui recouvre la tête du pinceau jusqu'à hauteur de l'anneau, bavures sur l'anneau devant le pinceau — relevé sur la photo. Marque, grade et composition : inconnus`],
    ['Pinceau', `Pinceau plat à manche de bois, pris à 2 po : manche de ${mm(PINCEAU.manche.long)} × ${mm(PINCEAU.manche.large)} × ${mm(PINCEAU.manche.epais)}, bande blanche de ${mm(PINCEAU.bande[1] - PINCEAU.bande[0])} et bout blanc — manche relevé sur la photo (environ ${mm(PINCEAU.hors)} hors du bidon). Virole (${mm(PINCEAU.virole.long)}) et soies (${mm(PINCEAU.soies.long)} × ${mm(PINCEAU.soies.large)}) sont enfouies dans la graisse : cotes d'un pinceau courant, supposées. Longueur totale de ${mm(longPinceau())}`],
    ['Pose du pinceau', `Le manche repose sur le serti du bidon, monte de ${PINCEAU.pente}° et part à ${PINCEAU.angle}° vers l'arrière par rapport à l'axe des oreilles ; son bout arrive à ${mm(h.haut, 0)} du sol — relevé sur la photo`],
    ['Encombrement', `Bidon seul : Ø ${mm(h.bidon.d, 1)} × ${mm(h.bidon.h, 1)} de haut. Avec le pinceau : ${mm(h.long, 0)} de long × ${mm(h.large, 1)} de large × ${mm(h.haut, 0)} de haut`],
    ['Non relevé, non modélisé', 'Marque et fiche de la graisse (aucune étiquette sur le bidon), masse, couvercle, anse. Épaisseur de la tôle dessinée à 0,3 mm ; les sertis sont dessinés d\'une seule tôle continue'],
  ],
  weights: [],
  sheetTitles: {
    P01: 'Photos du client : le bidon de graisse, et la scène avec les clés à tuyau de 18 et 24 po',
    P02: 'Cotes du bidon et du pinceau : coupe par l\'axe et vue de dessus (grandeurs du commerce, relevées)',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'THREAD GREASE, 1 US GAL CAN AND BRUSH',
      titleFr: 'Graisse à filets, bidon de 1 gal US et pinceau',
      pn: '',
      sheets: ['P01', 'P02'],
      note: `Reconstitution 3D d'après deux photos du client (P01), sans plan ni étiquette. ${ECH}. ${CHOIX}. L'anneau, l'agrafe, les oreilles, la rouille, le niveau et le monticule de graisse, la pose du pinceau, sa bande et son bout blancs sont relevés sur les photos. Le madrier, le sac de jute et les clés à tuyau de la photo ne sont pas modélisés.`,
      parts: [
        ['1', '', 1, `BIDON rond de fer-blanc à anneau, 1 gal US, Ø ${po(BIDON.d)} × ${po(BIDON.h)}`, { note: `Grandeur retenue d'après l'échelle des clés à tuyau (Ø mesuré de ${fr(mes[0])} à ${fr(mes[2])} mm) et les oreilles d'anse ; à vérifier sur place. Deux oreilles (anse absente), agrafe du flanc, anneau à gorge, ouverture de Ø ${mm(ouverture(), 1)} environ. Sans couvercle.` }],
        ['2', '', 1, 'GRAISSE À FILETS pour tiges de forage', { note: `Environ ${fr(vol, 1)} L au niveau de la photo (${mm(GRAISSE.sousDessus)} sous le dessus). Marque et grade inconnus : aucune étiquette sur le bidon.` }],
        ['3', '', 1, 'PINCEAU plat de 2 po, manche de bois', { note: `Longueur totale de ${mm(longPinceau())} ; bande blanche et bout blanc sur le manche. Largeur de 2 po, virole et soies supposées (enfouies dans la graisse sur la photo).` }],
      ],
    },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/graisse-a-filets/data.json', import.meta.url), `${JSON.stringify(data, null, 1)}\n`);
console.log(`data.json écrit ; échelle ${fr(k[0], 2)} à ${fr(k[2], 2)} mm/px, Ø mesuré ${fr(mes[0])} à ${fr(mes[2])} mm, retenu ${fr(BIDON.d, 1)} ; graisse ${fr(vol, 2)} L ; hors tout ${fr(h.long)} × ${fr(h.large)} × ${fr(h.haut)} mm`);

// ------------------------------------------------------------------ page des cotes

const at = process.argv.indexOf('--page');
if (at >= 0) {
  const out = process.argv[at + 1];
  const R = BIDON.d / 2, H = BIDON.h, rS = h.bidon.d / 2, rO = ouverture() / 2, hs = BIDON.serti.haut, an = BIDON.anneau, o = BIDON.oreille;
  const s = 3.2, s2 = 2.2; // pixels par mm : coupe, vue de dessus
  const hc = (xa, xb, y, txt) => `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${(xa + xb) / 2}" y="${y - 10}" text-anchor="middle">${txt}</text>`;
  const vc = (x, ya, yb, txt, gauche = false) => `<line x1="${x}" y1="${ya}" x2="${x}" y2="${yb}" class="c" marker-start="url(#f)" marker-end="url(#f)"/><text x="${x + (gauche ? -12 : 12)}" y="${(ya + yb) / 2 + 7}" ${gauche ? 'text-anchor="end"' : ''}>${txt}</text>`;
  const rap = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="r"/>`;

  // Coupe par l'axe, dans le plan vertical du pinceau : u vers la droite (côté du manche), y vers le haut.
  const cx = 640, sol = 990;
  const X = (u) => cx + u * s, Y = (y) => sol - y * s;
  const e = (PINCEAU.pente * Math.PI) / 180;
  const total = longPinceau(), dedans = total - PINCEAU.hors;
  const appui = [R - 1, H + PINCEAU.manche.epais / 2 + 0.3];
  const P = (t) => [appui[0] + (t - dedans) * Math.cos(e), appui[1] + (t - dedans) * Math.sin(e)]; // t depuis le bout des soies
  const bande = (t0, t1, ep, cls) => {
    const a = P(t0), b = P(t1), nx = -Math.sin(e) * ep / 2, ny = Math.cos(e) * ep / 2;
    return `<polygon points="${X(a[0] + nx)},${Y(a[1] + ny)} ${X(b[0] + nx)},${Y(b[1] + ny)} ${X(b[0] - nx)},${Y(b[1] - ny)} ${X(a[0] - nx)},${Y(a[1] - ny)}" class="${cls}"/>`;
  };
  const t0 = PINCEAU.soies.long, t1 = t0 + PINCEAU.virole.long;
  const yG = H - GRAISSE.sousDessus;
  const tole = (cote) => {
    const q = (r, y) => `${X(cote * r)},${Y(y)}`;
    return `<polyline points="${q(0, BIDON.fond)} ${q(R - 4, BIDON.fond)} ${q(R - 4, 0)} ${q(rS, 0)} ${q(rS, hs)} ${q(R, hs + 1)} ${q(R, H - hs - 1)} ${q(rS, H - hs)} ${q(rS, H)} ${q(R - 3, H)} ${q(R - 3, H - 5)} ${q(rO + 5, H - 5)} ${q(rO + 4.6, H - an.gorge)} ${q(rO + 2.4, H - an.gorge)} ${q(rO + 1, H - 3.6)} ${q(rO, H - 5.6)}" class="tole"/>`;
  };
  const tete = P((t0 + t1) / 2);
  const bout = P(total);
  const coupe = `
    <line x1="${X(-rS) - 150}" y1="${Y(0)}" x2="${X(bout[0]) + 90}" y2="${Y(0)}" class="sol"/>
    <path d="M ${X(-R + 0.5)} ${Y(yG)} L ${X(tete[0] - 62)} ${Y(yG)} Q ${X(tete[0] - 30)} ${Y(yG)} ${X(tete[0] - 12)} ${Y(tete[1] + 11)} Q ${X(tete[0] + 12)} ${Y(tete[1] + 14)} ${X(rO - 6)} ${Y(H - 12)} L ${X(R - 0.5)} ${Y(yG)} L ${X(R - 0.5)} ${Y(BIDON.fond)} L ${X(-R + 0.5)} ${Y(BIDON.fond)} Z" class="pate"/>
    ${bande(0, t0, PINCEAU.soies.epais, 'soies')}${bande(t0, t1, PINCEAU.virole.epais, 'virole')}
    ${bande(t1, total, PINCEAU.manche.epais, 'bois')}${bande(t1 + PINCEAU.bande[0], t1 + PINCEAU.bande[1], PINCEAU.manche.epais, 'blanc')}${bande(total - PINCEAU.bout, total, PINCEAU.manche.epais, 'blanc')}
    ${tole(1)}${tole(-1)}
    <rect x="${X(-R - o.saillie - 2)}" y="${Y(H - o.sousDessus + o.d / 2)}" width="${(o.saillie + 2) * s}" height="${o.d * s}" class="oreille"/>
    <line x1="${X(0)}" y1="${Y(H) - 60}" x2="${X(0)}" y2="${Y(0) + 30}" class="axe"/>
    ${rap(X(-R), Y(H), X(-R), Y(H) - 200)}${rap(X(R), Y(H), X(R), Y(H) - 200)}
    ${hc(X(-R), X(R), Y(H) - 180, `Ø ${po(BIDON.d)} (${mm(BIDON.d, 1)}) *`)}
    ${rap(X(-rO), Y(H), X(-rO), Y(H) - 135)}${rap(X(rO), Y(H), X(rO), Y(H) - 135)}
    ${hc(X(-rO), X(rO), Y(H) - 115, `ouverture Ø ${mm(ouverture(), 1)} †`)}
    ${rap(X(-rS), Y(H), X(-rS) - 130, Y(H))}${rap(X(-rS), Y(0), X(-rS) - 130, Y(0))}
    ${vc(X(-rS) - 110, Y(H), Y(0), `${po(BIDON.h)} (${mm(BIDON.h, 1)}) *`, true)}
    ${rap(X(-R), Y(yG), X(-R) - 70, Y(yG))}
    ${vc(X(-R) - 55, Y(H), Y(yG), `${mm(GRAISSE.sousDessus)} †`, true)}
    ${rap(X(bout[0]), Y(bout[1]), X(bout[0]) + 70, Y(bout[1]))}
    ${vc(X(bout[0]) + 40, Y(h.haut), Y(0), `${mm(h.haut, 0)} †`, true)}
    ${rap(X(-R - o.saillie - 2), Y(0), X(-R - o.saillie - 2), Y(0) + 80)}${rap(X(bout[0]), Y(0), X(bout[0]), Y(0) + 80)}
    ${hc(X(-R - o.saillie - 2), X(bout[0]), Y(0) + 65, `${mm((bout[0] + R + o.saillie + 2), 0)} dans le plan du pinceau`)}
    <text x="${X(P(t1 + 40)[0])}" y="${Y(P(t1 + 40)[1]) - 34}" transform="rotate(${-PINCEAU.pente} ${X(P(t1 + 40)[0])} ${Y(P(t1 + 40)[1]) - 34})">manche de ${mm(PINCEAU.manche.long)}, ${mm(PINCEAU.hors)} hors du bidon †</text>
    <text x="${X(R) + 60}" y="${Y(H) + 6}">pente de ${PINCEAU.pente}° †</text>
    <text x="${X(-R) + 30}" y="${Y(H / 2)}">graisse, environ ${fr(vol, 1)} L</text>
    <text x="${X(-R) + 14}" y="${Y(H - o.sousDessus) + 34}">oreille Ø ${mm(o.d)} †</text>`;

  // Vue de dessus : x vers la droite (oreilles), z vers le bas (vers l'observateur de la photo).
  const dx = 1690, dy = 600;
  const A = (x) => dx + x * s2, B = (z) => dy + z * s2;
  const a = (PINCEAU.angle * Math.PI) / 180, ce = Math.cos(e);
  const Q = (t, w) => { // point de l'axe du pinceau à t du bout des soies, décalé de w en largeur
    const r = appui[0] + (t - dedans) * ce;
    return [r * Math.cos(a) + w * Math.sin(a), -r * Math.sin(a) + w * Math.cos(a)];
  };
  const plat = (ta, tb, w, cls) => { const p = [Q(ta, w / 2), Q(tb, w / 2), Q(tb, -w / 2), Q(ta, -w / 2)]; return `<polygon points="${p.map(([x, z]) => `${A(x)},${B(z)}`).join(' ')}" class="${cls}"/>`; };
  const ag = (BIDON.agrafe.angle * Math.PI) / 180;
  const boutD = Q(total, 0);
  const dessus = `
    <circle cx="${A(0)}" cy="${B(0)}" r="${rS * s2}" class="toleP"/>
    <circle cx="${A(0)}" cy="${B(0)}" r="${(rO + 5) * s2}" class="gorge"/>
    <circle cx="${A(0)}" cy="${B(0)}" r="${rO * s2}" class="pate"/>
    ${[1, -1].map((c) => `<rect x="${A(c * R) - (c < 0 ? (o.saillie + 2) * s2 : 0)}" y="${B(-o.d / 2)}" width="${(o.saillie + 2) * s2}" height="${o.d * s2}" class="oreille"/>`).join('')}
    <rect x="${A(R * Math.sin(ag)) - 9}" y="${B(R * Math.cos(ag)) - 5}" width="18" height="12" class="oreille"/>
    <text x="${A(R * Math.sin(ag)) + 24}" y="${B(rS) + 34}">agrafe du flanc †</text>
    ${plat(0, t0, PINCEAU.soies.large, 'soies cache')}${plat(t0, t1, PINCEAU.virole.large, 'virole cache')}
    ${plat(t1, total, PINCEAU.manche.large, 'bois')}${plat(t1 + PINCEAU.bande[0], t1 + PINCEAU.bande[1], PINCEAU.manche.large, 'blanc')}${plat(total - PINCEAU.bout, total, PINCEAU.manche.large, 'blanc')}
    <line x1="${A(-rS) - 40}" y1="${B(0)}" x2="${A(rS) + 150}" y2="${B(0)}" class="axe"/><line x1="${A(0)}" y1="${B(-rS) - 40}" x2="${A(0)}" y2="${B(rS) + 40}" class="axe"/>
    <text x="${A(rS) + 60}" y="${B(0) - 26}">${PINCEAU.angle}° †</text>
    ${rap(A(-rS), B(0), A(-rS), B(rS) + 110)}${rap(A(rS), B(0), A(rS), B(rS) + 110)}
    ${hc(A(-rS), A(rS), B(rS) + 95, `Ø ${mm(h.bidon.d, 1)} aux sertis`)}
    ${rap(A(-R - o.saillie - 2), B(0), A(-R - o.saillie - 2), B(rS) + 170)}${rap(A(boutD[0]), B(boutD[1]), A(boutD[0]), B(rS) + 170)}
    ${hc(A(-R - o.saillie - 2), A(boutD[0]), B(rS) + 155, `${mm(h.long, 0)} hors tout`)}
    <text x="${A(-rO * 0.75)}" y="${B(rO * 0.35)}">graisse</text>
    <text x="${A(Q(t0 / 2, 0)[0]) - 150}" y="${B(Q(t0 / 2, 0)[1]) - 44}">soies et virole enfouies ‡</text>`;

  const lignes = data.specs.map(([t, v]) => `<tr><th>${t}</th><td>${v}</td></tr>`).join('');
  const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><style>
    body{margin:0;width:2200px;height:1700px;background:#fff;font:22px/1.32 system-ui,sans-serif;color:#1d2125}
    h1{font-size:40px;margin:44px 70px 0}p.s{margin:6px 70px;color:#566}
    svg{position:absolute;left:0;top:118px}
    .tole{fill:none;stroke:#333;stroke-width:3.5;stroke-linejoin:round}.toleP{fill:#c9cac6;stroke:#333;stroke-width:2}.gorge{fill:#a9aaa6;stroke:#333;stroke-width:1.5}
    .pate{fill:#ece3c2;stroke:#8a7d4e;stroke-width:1.5}.oreille{fill:#8c7766;stroke:#333;stroke-width:1.5}
    .bois{fill:#b2602f;stroke:#333;stroke-width:1.5}.blanc{fill:#f1eee4;stroke:#333;stroke-width:1.5}.virole{fill:#b9b8b0;stroke:#333;stroke-width:1.5}.soies{fill:#4a4036;stroke:#333;stroke-width:1.5}
    .cache{fill-opacity:.35;stroke-dasharray:7 5}
    .sol{stroke:#888;stroke-width:2}.axe{stroke:#555;stroke-width:1.5;stroke-dasharray:14 5 3 5}.r{stroke:#999;stroke-width:1.2}
    .c{stroke:#c0392b;stroke-width:2}text{font-size:22px;fill:#1d2125}text.t{font-weight:600;font-size:24px}
    table{position:absolute;left:70px;top:1238px;width:2060px;border-collapse:collapse;font-size:15.5px;line-height:1.22}
    th{width:210px;text-align:left;vertical-align:top;padding:2.5px 12px 2.5px 0;color:#444}td{padding:2.5px 0;border-top:1px solid #ddd}
    </style><h1>Graisse à filets : bidon de 1 gal US et pinceau — cotes</h1>
    <p class="s">Aucun plan. * = grandeur courante du commerce, retenue d'après l'échelle des clés à tuyau de 18 et 24 po ; † = cote relevée sur la photo ; ‡ = cote supposée (partie cachée).</p>
    <svg width="2200" height="1120"><defs><marker id="f" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#c0392b"/></marker></defs>
    <text x="110" y="40" class="t">Coupe par l'axe, dans le plan du pinceau, ${fr(s, 1)} px/mm</text>${coupe}
    <text x="${dx - 200}" y="40" class="t">Vue de dessus, ${fr(s2, 1)} px/mm</text>${dessus}</svg>
    <table>${lignes}</table></html>`;
  writeFileSync(out, html);
  console.log(`page écrite : ${out}`);
}
