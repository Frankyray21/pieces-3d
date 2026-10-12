// P028 — Avance « CLTR ASSY, FEED DU311 10703 » CX038436 (pages 28 et 30) :
// avance 6 pi à carrousel de 17 tiges Ø 3,5 po. Repère de l'avance (../feed.js,
// FEED) : pied du mât à y = 0, axe du mât +Y, face côté axe de forage +Z,
// carrousel côté +X ; P010 le place sur le MCP (feedToMachine, corps « ext »).
// Les grands ensembles sont dessinés dans ce repère et posés à l'identité :
// centreur fixe (P032) et ses mâchoires (P048), plaque à coins (P046), mât
// (P058), plaque porte-tête (P062), stingers (P068), vérin d'avance (P070),
// clapet de retenue (P074), rampe à tiges (P076), capteur de course (P078),
// mâchoires du bras (P088), guides de tiges (P090), collecteur des centreurs
// (P092), cadre du carrousel (P098), appui latéral (P100), arrêt d'urgence
// (P102), boucle de boyaux (P104), carrousel (P108), boyau DTH (P138) et
// distributeur du carrousel (P140). Les deux vérins stinger (P064) sont posés
// en STINGER_PLACES, la tête de rotation (P050) sur la plaque porte-tête, les
// raccords rapides 1/4 po (P096, repris du TVK) sous le collecteur des
// centreurs.
// Simulation : les corps (« feed », « carousel », « clamp », « slip »,
// « stingUp », « stingDn ») sont étiquetés dans les sous-ensembles ; la
// broche de la tête suit « spin » par chemin (RULES : 8 → 4 → …).
import { FEED } from '../feed.js';
import { body } from '../layout.js';
import { STINGER_PLACES } from './P064.js';

const IN = 0.0254;

export default function P028(api) {
  const { box, cyl, bolt, at, group } = api.S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const { tdY, AX } = FEED;

  P('1', api.sub('P032'), [0, -0.35, 0.5]);
  P('2', api.sub('P046'), [0, -0.2, 0.7]);
  P('3', api.sub('P048'), [0, -0.5, 0.8]);
  // 4 — tête de rotation RH6230 : bride arrière sur la plaque porte-tête (corps « feed »)
  P('4', body('feed', at(api.sub('P050'), [0, tdY, AX])), [0, 0.3, 1.1]);
  P('5', api.sub('P058'), [0, 0, 0]);
  P('6', api.sub('P062'), [0, 0.3, 0.7]);
  STINGER_PLACES.forEach(({ pos, rot }, i) => P('7', at(api.sub('P064'), pos, rot), [i ? 0.4 : -0.4, 0, -0.3]));
  P('8', api.sub('P068'), [0, 0, -0.35]);
  P('9', api.sub('P070'), [0, 0, -0.5]);
  P('10', api.sub('P074'), [-0.3, -0.2, -0.4]);
  P('11', api.sub('P076'), [0.4, -0.2, 0.3]);
  P('12', api.sub('P078'), [-0.3, 0, -0.3]);
  P('13', api.sub('P088'), [0.4, 0.3, 0.4]);
  P('14', api.sub('P090'), [0.6, 0, 0.3]);
  P('15', api.sub('P092'), [0, -0.15, -0.45]);
  // 16 — raccords rapides 1/4 po (repère du TVK P160 : axes verticaux, Z vers l'observateur),
  // accouplés sous le collecteur des centreurs, face vers l'arrière du mât
  P('16', at(api.sub('P096'), [-0.1, 0.1, -0.24], [0, Math.PI, 0]), [0, -0.3, -0.5]);
  P('17', api.sub('P098'), [0.6, 0, -0.3]);
  P('18', api.sub('P100'), [-0.4, 0, -0.2]);
  P('19', api.sub('P102'), [-0.4, 0, 0.2]);
  // 20 — butée de l'émerillon d'air (option) : cornière 2 × 2 × 1/4 po boulonnée sur la
  // plaque porte-tête, doigt qui arrête le bras de l'émerillon (corps « feed »)
  const a = 2 * IN, t = 0.25 * IN;
  P('20', body('feed', group(
    at(box(t, 0.2, a, 'lightGrey'), [-0.12, tdY + 0.38, AX - 0.13]),
    at(box(a, 0.2, t, 'lightGrey'), [-0.12 + a / 2, tdY + 0.38, AX - 0.13 - a / 2]),
    at(box(0.03, 0.03, 0.12, 'lightGrey', { r: 0.004 }), [-0.12, tdY + 0.47, AX - 0.08]),
    at(cyl(0.008, 0.03, 'rubber', { axis: 'z', seg: 12 }), [-0.12, tdY + 0.47, AX - 0.005]),
    ...[0.31, 0.41].map((y) => at(bolt(0.375 * IN, 1 * IN, 'zinc', { axis: 'x' }), [-0.12 - t / 2, tdY + y, AX - 0.13 - a / 2])),
  )), [-0.3, 0.3, 0]);
  P('21', api.sub('P104'), [-0.5, 0, 0.2]);
  P('22', api.sub('P108'), [0.7, 0, 0]);
  P('23', api.sub('P138'), [-0.7, 0, 0.3]);
  P('24', api.sub('P140'), [0.4, 0.4, -0.2]);
  return { view: { dir: [1.0, 0.45, 1.3] } };
}
