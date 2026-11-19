// P001 — Racine de la DR1500-U (regroupement du site, pas une liste du manuel) : la foreuse (P002), le groupe
// hydraulique (P007, avec ses panneaux P008) et le waterpack (P009, avec sa pompe P010) posés au sol, chacun à sa
// place ROOT de layout.js (disposition libre : le manuel ne montre pas l'installation). Ni boyaux ni câbles : le
// manuel n'en dessine aucun.
import { ROOT } from '../layout.js';

const QUALITY = 0.35; // facettes allégées (vue d'ensemble ; chaque assemblage ouvert seul reste détaillé)

export default function P001(api) {
  const { at } = api.S;
  const pose = (id, { pos, yaw }) => at(api.sub(id, { quality: QUALITY }), pos, yaw ? [0, yaw, 0] : null);
  api.part('1', pose('P002', ROOT.DRILL), [0, 0, 1.2]);
  api.part('2', pose('P007', ROOT.PACK), [0.6, 0, -1.2]);
  api.part('3', pose('P009', ROOT.WATER), [-1.0, 0, -1.2]);
  return { view: { dir: [0.75, 0.6, 1.0] } };
}
