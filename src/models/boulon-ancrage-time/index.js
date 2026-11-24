// Boulon d'ancrage standard TIME Limited 83-52 (« Anchor bolt NW/L 5' ») : la
// pine d'ancrage qu'on fixe dans un trou percé à quelques degrés du trou de
// forage, et à laquelle on fixe ensuite la foreuse au diamant pour l'empêcher
// de bouger de côté. Reconstitué d'après la page du produit fournie par le
// client (P01). Aucun plan.
//
// Publié par TIME Limited, repris tel quel : le numéro 83-52 et la désignation
// « ANCHOR BOLT NW/L 5' » (calibre N câble, 5 pieds). Aucune cote de détail.
//
// Relevé sur la photo (une seule photo pour les quatorze boulons de la page) :
// un corps rond et lisse, sombre ; à un bout, un filet mâle clair d'environ
// 18 spires derrière un nez lisse, un peu plus petits que le corps ; à l'autre
// bout, une tige en deux étages (une portée claire, puis un bout plus mince et
// sombre). Les proportions des bouts sont relevées en diamètres de corps.
//
// Supposé : la longueur de 5 pieds est la longueur hors tout ; le diamètre du
// corps est celui d'une tige de forage N câble (2 3/4 po, 69,9 mm). L'intérieur
// du boulon n'est pas montré : le modèle est plein.
//
// Repère du boulon, en millimètres : x le long du boulon, du nez fileté (0)
// vers la tige du bout. Modèle : boulon couché sur le sol (y vers le haut), mètres.
import * as THREE from 'three';
import { lathe, thread, group } from '../../viewer/shapes.js';
import { withFinish } from '../../viewer/materials.js';

const MM = 0.001;
export const IN = 25.4;

// ------------------------------------------------------------------ cotes (mm)

/** Longueur publiée : 5 pieds (supposée hors tout). */
export const LONGUEUR = 60 * IN;
/** Diamètre du corps : tige de forage N câble, 2 3/4 po (supposé). */
export const CORPS = 2.75 * IN;
/** Nombre de spires du filet, compté sur la photo. */
export const SPIRES = 18;

/**
 * Relevé sur la photo, en pixels (corps de 30,5 px de diamètre) : diamètre et
 * longueur de chaque partie des deux bouts.
 */
export const PHOTO = {
  corps: 30.5,
  nez: { d: 28.5, l: 17 },
  filet: { d: 29.5, l: 58 },
  portee: { d: 15.5, l: 31 },
  bout: { d: 11.5, l: 43 },
};

/** Cotes du boulon (mm) : les bouts à l'échelle du corps, le corps prend le reste des 5 pieds. */
export function cotes() {
  const k = CORPS / PHOTO.corps;
  const p = (v) => ({ d: v.d * k, l: v.l * k });
  const nez = p(PHOTO.nez), filet = p(PHOTO.filet), portee = p(PHOTO.portee), bout = p(PHOTO.bout);
  const corps = { d: CORPS, l: LONGUEUR - nez.l - filet.l - portee.l - bout.l };
  // Abscisses des épaulements, du nez vers le bout.
  const x = [0, nez.l, nez.l + filet.l, nez.l + filet.l + corps.l, LONGUEUR - bout.l, LONGUEUR];
  return { nez, filet, corps, portee, bout, x, pas: filet.l / SPIRES };
}

// ------------------------------------------------------------------ matières

const matieres = {};
function matiere(nom) {
  if (matieres[nom]) return matieres[nom];
  const defs = {
    // Corps : acier sombre, brun-gris, reflet doux le long du tube (photo).
    corps: [{ color: 0x51483f, metalness: 0.85, roughness: 0.4 }, 'machined', { stretch: 10 }],
    // Filet et nez : acier usiné clair.
    filet: [{ color: 0xb4b2ab, metalness: 1, roughness: 0.3 }, 'machined', null],
    // Portée du bout : claire, d'aspect zingué (photo).
    portee: [{ color: 0xc3cac6, metalness: 0.9, roughness: 0.45 }, 'machined', { rough: 0.2 }],
    // Bout mince : acier sombre.
    bout: [{ color: 0x4a4541, metalness: 0.85, roughness: 0.42 }, 'machined', null],
  };
  const [p, fini, reglages] = defs[nom];
  const m = withFinish(new THREE.MeshStandardMaterial(p), fini, reglages);
  m.name = `boulon-ancrage-${nom}`;
  m.polygonOffset = true;
  m.polygonOffsetFactor = 1;
  m.polygonOffsetUnits = 1;
  return (matieres[nom] = m);
}

// ------------------------------------------------------------------ pièce

/** Repère 1 : le boulon d'ancrage, axe le long de x, nez fileté à l'origine. */
export function boulon() {
  const c = cotes(), [x0, x1, x2, x3, x4, x5] = c.x.map((v) => v * MM);
  const r = (v) => (v.d / 2) * MM;
  const ch = 2 * MM; // arêtes cassées
  const seg = 56;
  // Nez lisse chanfreiné, puis filet (profil ondulé : une onde par spire).
  const filet = lathe([
    [0, x0], [r(c.nez) - 2 * ch, x0], [r(c.nez), x0 + 2 * ch], [r(c.nez), x1],
    ...thread(r(c.filet), x1, x2, { pitch: c.pas * MM, maxTurns: SPIRES, chamferBottom: false }),
    [0, x2],
  ], matiere('filet'), { axis: 'x', seg });
  // Corps : épaulement vif côté filet, arrondi côté tige (photo).
  const a = 5 * MM;
  const arrondi = [0, 1, 2, 3, 4].map((i) => {
    const t = (i / 4) * (Math.PI / 2);
    return [r(c.corps) - a + a * Math.cos(t), x3 - a + a * Math.sin(t)];
  });
  const corps = lathe([[0, x2], [r(c.corps) - ch, x2], [r(c.corps), x2 + ch], ...arrondi, [0, x3]], matiere('corps'), { axis: 'x', seg });
  const portee = lathe([[0, x3], [r(c.portee), x3], [r(c.portee), x4 - ch], [r(c.portee) - ch, x4], [0, x4]], matiere('portee'), { axis: 'x', seg: 40 });
  const bout = lathe([[0, x4], [r(c.bout), x4], [r(c.bout), x5 - ch], [r(c.bout) - ch, x5], [0, x5]], matiere('bout'), { axis: 'x', seg: 40 });
  return group(filet, corps, portee, bout);
}

// ------------------------------------------------------------------ assemblage

export function P01(api) {
  const g = boulon();
  // Couché sur le sol, centré.
  g.position.set((-LONGUEUR / 2) * MM, (CORPS / 2) * MM, 0);
  api.part('1', g, [0, 0.15, 0]);
  // Vue de la photo : de côté et du dessus, le nez fileté vers l'avant.
  return { view: { dir: [-0.45, 0.5, 0.74] } };
}

export default { P01 };
