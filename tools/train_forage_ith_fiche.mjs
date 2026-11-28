// Écrit public/equipment/train-forage-ith/data.json : les cotes viennent du modèle
// (src/models/train-forage-ith/forme.js), pour que la fiche et la 3D disent la même chose.
// Usage : node tools/train_forage_ith_fiche.mjs
import { writeFileSync } from 'node:fs';
import {
  IN, TIGE, TIGES, MARTEAUX, BITS, CASSE_BITS, SAVER_SUBS, CHARIOT, API_REG,
  tige, marteau, bit, bitAvecChuck, casseBit, cotesMarteau, cotesBit, volume,
} from '../src/models/train-forage-ith/forme.js';

const fr = (v, n = 0) => v.toFixed(n).replace('.', ',');
const FRACTIONS = ['', ' 1/8', ' 1/4', ' 3/8', ' 1/2', ' 5/8', ' 3/4', ' 7/8'];
const po = (v) => { const q = Math.round((v / IN) * 8), e = Math.floor(q / 8); return `${e || ''}${FRACTIONS[q % 8]} po`.trim(); };
const kg = (surfaces) => volume(surfaces) * 7850;
const lb = (k) => k / 0.45359237;

const SRC016 = 'PRO-OP-ITH-016 « Manipulation des marteaux de forage et de leurs composantes » (novembre 2021)';
const SRC001 = 'PRO-OP-ITH-001 « Changements de bit de forage sur les Cubex » (février 2025)';
const SRC004 = 'PRO-OP-ITH-004 « Forage long-trou ITH-Cubex » (révision mars 2025)';

const tiges = [];
for (const [diam, nomD, marteauD] of [['3-1-2', '3 1/2', '3 et 4'], ['5-1-2', '5 1/2', '6']]) {
  const T = TIGES[diam];
  for (const pieds of [4, 5, 6]) {
    for (const couleur of T.couleurs) {
      const m = kg(tige(pieds, couleur, diam).surfaces);
      tiges.push([String(tiges.length + 1), '', 1, `TIGE DE FORAGE Ø ${nomD} po × ${pieds} pi, peinte en ${couleur}`, {
        note: `Pour les marteaux de ${marteauD} po. ${pieds} pi (${fr(T.longueurs[pieds])} mm) d'épaulement à épaulement, filet mâle ${T.filet} API REG en haut, femelle en bas. Bouts d'acier nu à deux entailles plates (méplats à ${po(T.plats.entre)} l'un de l'autre, ${T.plats.long} mm de long). Paroi de ${po(T.paroi)} (supposée${diam === '5-1-2' ? ', comme les méplats' : ''}). Masse calculée : ${fr(m, 1)} kg (${fr(lb(m))} lb). Export Unreal : SM_Tige_${diam === '3-1-2' ? '' : '5_1_2po_'}${pieds}pi_${couleur === 'jaune' ? 'Jaune' : 'Noire'}.glb.`,
      }]);
    }
  }
}

const marteaux = Object.entries(MARTEAUX).map(([t, M], k) => {
  const c = cotesMarteau(+t);
  const m = kg(marteau(+t).surfaces);
  return [String(k + 1), M.ref, 1, `MARTEAU FOND-DE-TROU ${M.nom} (${fr(M.kg, 1)} kg, ${Math.round(lb(M.kg))} lb)`, {
    note: `Masse publiée par la procédure (${Math.round(lb(M.kg))} lb, sources Sandvik et Epiroc) : celle du ${M.ref} d'Epiroc, dont les cotes sont reprises : Ø ${M.d} mm, ${fr(M.long, 1)} mm sans bit, raccord de tête mâle ${M.filet} API REG. Modèle : fourreau et raccord de tête (deux méplats de clé), sans driver sub (P05) ni bit ; ${fr(M.long - c.driverVisible)} mm du bas du fourreau à l'épaulement. Pièces internes (piston, cylindre, clapet) non modélisées : ${fr(m, 1)} kg calculés sur le modèle. ${t === '6' ? 'Toujours transporté sur le chariot (P07), driver sub installé.' : 'Installé à la main sur le gear box, comme une tige.'} Export Unreal : SM_Marteau_${t}po.glb.`,
  }];
});

const bits = BITS.map((b, k) => {
  const c = cotesBit(b);
  const x = bit(b);
  const m = kg([...x.corps.surfaces]);
  return [String(k + 1), '', 1, `BIT À BOUTONS ${b.nom} (Ø ${fr(b.d, 1)} mm), pour le marteau de ${b.marteau} po`, {
    note: `Tête de ${fr(c.tete)} mm, boutons de carbure de Ø ${fr(c.bg)} mm (calibre) et ${fr(c.bf)} mm (face), ${x.cotes.nRain >= 8 ? `tête en couronne à ${x.cotes.nRain} encoches profondes (vidéos de chantier)` : `${x.cotes.nRain} rainures d'évacuation`}, queue cannelée de Ø ${fr(c.queue)} mm × ${fr(x.cotes.yQ - x.cotes.yT)} mm avec le cou des anneaux de retenue, tube de pied en plastique blanc. Proportions de la tête et nombre de boutons supposés. Masse calculée : ${fr(m, 1)} kg. ${b.d <= 5.125 * IN || b.id === '6' ? 'Changement : spline piston mis, dans les jaws (PRO-OP-ITH-001).' : 'Changement : spline piston non mis, mât à 0°, dans les tables, ou sur le casse-bit (PRO-OP-ITH-016).'} Export Unreal : SM_Bit_${b.id.replace(/-/g, '_')}po.glb (seul) et SM_Bit_${b.id.replace(/-/g, '_')}po_AvecChuck.glb (P08).`,
  }];
});

const bitsChuck = BITS.map((b, k) => {
  const a = bitAvecChuck(b);
  const m = kg([...a.bit.corps.surfaces, ...a.driver.surfaces, ...a.anneaux]);
  return [String(k + 1), '', 1, `BIT ${b.nom} AVEC SON CHUCK (driver sub du marteau de ${b.marteau} po) ET SES ANNEAUX`, {
    note: `Bit, chuck et anneaux de retenue tels qu'on les manipule au changement de bit : le chuck reste sur la queue du bit et c'est lui qui se visse dans le fourreau du marteau (vidéos de chantier). Le chuck couvre les cannelures et s'appuie sur la tête ; anneaux juste au-dessus, tube de pied blanc qui dépasse de ${fr(0.32 * a.cotes.queue)} mm. Masse calculée : ${fr(m, 1)} kg. Export Unreal : SM_Bit_${b.id.replace(/-/g, '_')}po_AvecChuck.glb (maillages séparés : bit, boutons, tube de pied, chuck, anneaux).`,
  }];
});

const raccords = [
  ...[3, 4, 6].map((t, k) => {
    const c = cotesMarteau(t);
    return [String(k + 1), '', 1, `DRIVER SUB du marteau de ${t} po`, {
      note: `Douille d'entraînement : se visse sous le fourreau (filet de ${fr(c.driverFilet)} mm), dépasse de ${fr(c.driverVisible)} mm, cannelures intérieures (${MARTEAUX[t].cannelures}) qui entraînent la queue du bit. Installé en tout temps lors de la manipulation du marteau (PRO-OP-ITH-016) ; filets à bien graisser (PRO-OP-ITH-001). Export Unreal : SM_DriverSub_${t}po.glb.`,
    }];
  }),
  ...[3, 4, 6].map((t, k) => [String(k + 4), '', 2, `ANNEAU DE RETENUE (demi-anneau) du marteau de ${t} po`, {
    note: `Deux demi-anneaux jaunes (photo de PRO-OP-ITH-001) posés dans le cou de la queue du bit, au-dessus du driver sub : ils retiennent le bit quand le marteau est relevé. Export Unreal : SM_Anneaux_${t}po.glb (les deux moitiés, chacune son maillage).`,
  }]),
  ...SAVER_SUBS.map((s, k) => [String(k + 7), k === 0 ? '2216208' : '', 1, `SAVER SUB ${s.nom}`, {
    note: `Raccord d'usure sous la tête de rotation : filet mâle vers la tête, six pans de ${s.hex} mm, collet, bout femelle ${s.filet} API REG qui reçoit la tige ou le marteau (« visser le marteau dans le saver sub », PRO-OP-ITH-016). Forme d'après le manuel de la Cubex (F18, n° 2216208), cotes supposées. Export Unreal : SM_SaverSub_${s.id.replace(/-/g, '_')}.glb.`,
  }]),
];

const casses = CASSE_BITS.map((C, k) => {
  const x = casseBit(k);
  const m = kg([...x.corps.surfaces, ...x.ergots]);
  return [String(k + 1), '', 1, `CASSE-BIT pour bit de ${C.nom}`, {
    note: `Cuvette octogonale de ${fr(C.oct)} mm sur plats et ${C.octHaut} mm de haut (poche de ${C.poche} mm, quatre ergots qui prennent les rainures du bit) sur un fût de Ø ${po(C.fut)} qui entre dans la slip plate. Forme relevée sur les photos de PRO-OP-ITH-016, cotes supposées. Masse calculée : ${fr(m, 1)} kg. Export Unreal : SM_CasseBit_${C.id.replace(/-/g, '_')}po.glb.`,
  }];
});

const chariot = [
  ['1', '', 1, 'CADRE du chariot (montants, traverses, berceau, pied, essieu)', { note: `Diable à bouteille peint en rouge (photo de PRO-OP-ITH-016) : montants tubulaires de Ø 1 po à ${CHARIOT.entraxe} mm d'entraxe, ${CHARIOT.haut} mm de haut, pied de ${CHARIOT.pied.larg} × ${CHARIOT.pied.prof} mm, berceau cintré derrière le marteau, pattes de la chaîne. Cotes relevées sur la photo à l'échelle du marteau de 6 po (à 10 % près).` }],
  ['2', '', 2, `ROUE à pneu, Ø ${po(CHARIOT.roue.d)}`, { note: 'Pneu noir, jante rouge, moyeu acier.' }],
  ['3', '', 2, 'POIGNÉE gainée de caoutchouc gris', { note: 'Bouts des montants recourbés vers l\'arrière.' }],
  ['4', '', 1, 'CHAÎNE DE SÛRETÉ rouge', { note: `Maillons de ${CHARIOT.chaine.fil} mm, passée devant le marteau d'une patte à l'autre, le bout pendant. À enlever avant de remonter le marteau (étape 6) et à remettre pour sortir le chariot (étape 34).` }],
  ['5', '', 1, 'MARTEAU DE 6 PO (voir P03)', { note: 'Debout sur le pied, posé sur son driver sub.' }],
  ['6', '', 1, 'DRIVER SUB du marteau de 6 po (voir P05)', { note: 'Installé en tout temps lors de la manipulation (PRO-OP-ITH-016).' }],
];

const data = {
  id: 'train-forage-ith',
  name: 'Train de forage ITH des Cubex : tiges, marteaux, bits, subs, casse-bits et chariot',
  manufacturer: 'Machines Roger International (procédures) ; marteaux d\'après Epiroc',
  category: 'Outils de forage long-trou ITH',
  serial: '',
  document: {
    title: `${SRC016}, ${SRC001} et ${SRC004} ; photos de chantier du client`,
    reference: 'PRO-OP-ITH-001, 004, 016',
    preparedBy: 'Machines Roger International',
    date: '',
    sheets: 11,
    pagePattern: 'pages/{sheet}.webp',
  },
  specs: [
    ['Sources', `${SRC016} : masses des marteaux, chariot, casse-bit, driver sub, saver sub, anneaux de retenue. ${SRC001} : bits de 3 5/8 à 10 po. ${SRC004} : 7 pi 6 po entre la slip plate et le bout des taillants. Manuel de la Cubex MRI 5200 (F15, F18) : slip plates pour tiges de 3 1/2 et 5 1/2 po, saver sub 2216208. Fiches techniques Epiroc (COP 32, COP 44, catalogue DTH). Photos de chantier du client.`],
    ['Marteaux', Object.values(MARTEAUX).map((M) => `${M.nom} : ${Math.round(lb(M.kg))} lb (${fr(M.kg, 1)} kg), Ø ${M.d} mm, ${fr(M.long, 1)} mm sans bit (${M.ref})`).join(' ; ')],
    ['Choix des modèles Epiroc', 'La procédure ne nomme pas les marteaux. Les masses qu\'elle donne sont celles des COP 32 HD (26 kg), COP 44 Gold (40,5 kg) et COP 64 Gold (96 kg) : leurs diamètres, longueurs et raccords sont repris. À corriger si la flotte compte d\'autres marteaux (Sandvik, Mincon…)'],
    ['Tiges', `Ø 3 1/2 po (slip plate « FOR 3 1/2" ROD » du manuel de la Cubex), 4, 5 et 6 pi d'épaulement à épaulement, paroi de 1/4 po (supposée), filets 2 3/8 API REG (mâle en haut, femelle en bas). Peintes en jaune ou en noir comme sur les photos, bouts d'acier nu à deux entailles plates. Tiges de 5 1/2 po (slip plate « FOR 5 1/2\" ROD », marteau de 6 po) : mêmes longueurs et couleurs (demande du client), filets 3 1/2 API REG, paroi de 3/8 po et méplats à 4 1/2 po supposés`],
    ['Bits', BITS.map((b) => `${b.nom} (marteau de ${b.marteau} po)`).join(', ')],
    ['Filets', Object.entries(API_REG).map(([k, F]) => `${k} API REG : Ø ${fr(F.grand, 1)} mm à l'épaulement, ${fr(F.long, 1)} mm de long, ${fr(IN / F.pas)} filets au pouce, conicité 1/6`).join(' ; ') + ' (filets représentés par des gorges, sans hélice)'],
    ['Usure', 'Pièces qui ont servi : peinture partie aux arêtes et sur les bouts, rayée par les mâchoires, acier nu piqué de rouille, filets graissés et sombres, bits rouillés, boutons de carbure ternis. Mise en apparence seulement : aucune cote ne change'],
    ['Export Unreal Engine', 'Un .glb par pièce, en mètres, axe vertical, origine au centre de la face du bas : public/equipment/train-forage-ith/unreal/ (voir docs/train-forage-ith-unreal.md). Textures PBR usées propres à chaque pièce (couleur, normales, rugosité-métal), générées par scripts/export-train-ith-unreal.mjs'],
  ],
  weights: Object.values(MARTEAUX).map((M) => [`Marteau ${M.nom} (PRO-OP-ITH-016)`, `${Math.round(lb(M.kg))} lb (${fr(M.kg, 1)} kg)`]),
  sheetTitles: {
    F01: 'PRO-OP-ITH-016, page 1 : objet, mise en contexte, masses des marteaux',
    F02: 'PRO-OP-ITH-016, page 2 : marteaux de 3, 4 et 6 po, chariot, étapes 1 à 5',
    F03: 'PRO-OP-ITH-016, page 3 : spline piston, casse-bit dans la slip plate',
    F04: 'PRO-OP-ITH-016, page 4 : bit sur le casse-bit, driver sub, anneaux de retenue',
    F05: 'PRO-OP-ITH-016, page 5 : enlever une bit de 6, 8 ou 10 po',
    F06: 'PRO-OP-ITH-016, page 6 : anneaux de retenue, driver sub',
    F07: 'PRO-OP-ITH-016, page 7 : retour du marteau sur le chariot, chaîne de retenue',
    F08: 'PRO-OP-ITH-001, page 3 : driver sub et anneaux de retenue sur la bit',
    F09: 'PRO-OP-ITH-001, page 4 : queue de la bit dans le marteau',
    F10: 'PRO-OP-ITH-004, page 2 : hauteur du chantier, 7 pi 6 po de la slip plate au bout des taillants',
    F11: 'Photo de chantier du client : rack de tiges jaunes et noires, bouts à entailles plates, protecteurs de filets jaunes',
  },
  root: 'P01',
  assemblies: {
    P01: {
      title: 'ITH DRILL STRING — CUBEX', titleFr: 'Train de forage ITH (vue d\'ensemble)', pn: '',
      sheets: ['F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09', 'F10', 'F11'],
      note: `Toutes les pièces du train de forage ITH nommées dans les procédures ${['PRO-OP-ITH-001', '004', '016'].join(', ')}, chacune sur sa page. Pièces debout, telles qu'on les pose au chantier. Rendu usé : pièces qui ont servi. Chaque pièce a son export .glb pour Unreal Engine.`,
      parts: [
        ['1', '', 1, 'TIGES DE FORAGE (3 1/2 et 5 1/2 po ; 4, 5 et 6 pi ; jaunes et noires)', { link: 'P02' }],
        ['2', '', 1, 'MARTEAUX DE 3, 4 ET 6 PO', { link: 'P03' }],
        ['3', '', 1, 'BITS DE 3 5/8 À 10 PO', { link: 'P04' }],
        ['4', '', 1, 'DRIVER SUBS, ANNEAUX DE RETENUE, SAVER SUBS', { link: 'P05' }],
        ['5', '', 1, 'CASSE-BITS', { link: 'P06' }],
        ['6', '', 1, 'CHARIOT À MARTEAU ET SA CHAÎNE', { link: 'P07' }],
        ['7', '', 1, 'BITS AVEC LEUR CHUCK ET LEURS ANNEAUX', { link: 'P08' }],
      ],
    },
    P02: { title: 'DRILL RODS 3 1/2 AND 5 1/2 IN', titleFr: 'Tiges de forage de 3 1/2 et 5 1/2 po', pn: '', sheets: ['F11', 'F10'], note: 'Tiges debout, filet mâle en haut. Devant, les tiges de 3 1/2 po (marteaux de 3 et 4 po) ; derrière, celles de 5 1/2 po (marteau de 6 po). De gauche à droite : 4 pi jaune et noire, 5 pi, 6 pi. Les entailles plates (deux méplats opposés) sont sur les bouts d\'acier nu, en haut et en bas. Pour installer ou enlever une tige, le gear box doit être relevé et arrêté et la foreuse au neutre (PRO-OP-ITH-004, point 22).', parts: tiges },
    P03: { title: 'DTH HAMMERS', titleFr: 'Marteaux fond-de-trou de 3, 4 et 6 po', pn: '', sheets: ['F01', 'F02'], note: 'Marteaux debout, raccord de tête (mâle) en haut, sans driver sub ni bit. Les marteaux de 3 et 4 po s\'installent à la main comme les tiges ; celui de 6 po se transporte toujours sur le chariot (P07).', parts: marteaux },
    P04: { title: 'BUTTON BITS', titleFr: 'Bits à boutons de 3 5/8 à 10 po', pn: '', sheets: ['F08', 'F09', 'F04'], note: 'Bits posés sur leur face de coupe, queue vers le haut (comme sur le casse-bit), du plus petit au plus grand. Serrage dans les jaws ou les tables : 1000 psi minimum, 2000 psi maximum (PRO-OP-ITH-001).', parts: bits },
    P05: { title: 'DRIVER SUBS, RETAINING RINGS, SAVER SUBS', titleFr: 'Driver subs, anneaux de retenue et saver subs', pn: '', sheets: ['F08', 'F04', 'F06'], note: 'Devant : driver subs des marteaux de 3, 4 et 6 po. Au milieu : les paires d\'anneaux de retenue. Derrière : saver subs 2 3/8 et 3 1/2 API REG.', parts: raccords },
    P06: { title: 'BIT BREAKERS', titleFr: 'Casse-bits', pn: '', sheets: ['F03', 'F05'], note: 'Casse-bits pour les bits de 6, 6 1/2, 8 et 10 po du marteau de 6 po : on l\'installe dans la slip plate et on ferme les jaws avant d\'y déposer la bit (PRO-OP-ITH-016, étapes 11 et 18).', parts: casses },
    P08: { title: 'BITS WITH DRIVER SUB', titleFr: 'Bits avec leur chuck et leurs anneaux de retenue', pn: '', sheets: ['F08', 'F09', 'F04'], note: 'Assemblages pour l\'animation du changement de bit : bit, chuck (driver sub) et anneaux, face de coupe en bas. Le chuck se visse et se dévisse dans le fourreau avec le bit (vidéos de chantier).', parts: bitsChuck },
    P07: { title: 'HAMMER CART', titleFr: 'Chariot de transport du marteau de 6 po', pn: '', sheets: ['F02', 'F07'], note: 'Chariot conçu pour transporter le marteau de 6 po (211 lb), obligatoire selon PRO-OP-ITH-016, avec sa chaîne de sûreté. Montré avec le marteau de 6 po debout sur le pied, driver sub installé.', parts: chariot },
  },
  documents: [],
};

writeFileSync(new URL('../public/equipment/train-forage-ith/data.json', import.meta.url), JSON.stringify(data, null, 1) + '\n');
console.log('data.json écrit');
