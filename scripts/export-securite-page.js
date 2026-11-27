// Module chargé dans le navigateur par scripts/export-securite-unreal.mjs (serveur de
// développement Vite) : construit chaque article du lot de sécurité et l'exporte en
// GLB (glTF binaire, mètres, Y vers le haut), textures d'usure comprises.
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildProcedural } from '../src/viewer/assembly.js';
import * as shapes from '../src/viewer/shapes.js';
import builders from '../src/models/securite-chantier/index.js';
import { ruban, noeud, carte, affiche, TEXTES, RUBAN } from '../src/models/securite-chantier/signalisation.js';
import { cone, casing, couvercle, monterie } from '../src/models/securite-chantier/sol.js';
import { boite, pince, cadenas, etiquette } from '../src/models/securite-chantier/cadenassage.js';
import { harnais, longe, blocRetractable } from '../src/models/securite-chantier/antichute.js';
import { extincteur, trousse } from '../src/models/poste-secours/index.js';

const groupe = (...objs) => { const g = new THREE.Group(); objs.forEach((o) => g.add(o)); return g; };
const assemblage = (id, sans = []) => {
  const m = buildProcedural(builders, id);
  for (const p of [...m.parts]) if (sans.includes(p.userData.partRef)) p.parent.remove(p);
  return m.root;
};

/** Liste des fichiers : nom → fabrique de l'objet (origine au sol, mètres). */
function articles() {
  const L = RUBAN.portee / 2, y = RUBAN.haut;
  const h = () => harnais();
  return {
    SM_Barricade_Ruban: () => assemblage('P02', ['4']),
    SM_Ruban_Danger_4m: () => groupe(ruban([-L, y, 0], [L, y, 0]), noeud([-L, y, 0], 1, 1), noeud([L, y, 0], -1, 2)),
    SM_Carte_Barricade: () => carte(),
    ...Object.fromEntries(Object.keys(TEXTES).map((id, i) => [`SM_Affiche_${id.replace(/(^|-)(\w)/g, (_, s, c) => `${s ? '_' : ''}${c.toUpperCase()}`)}`, () => affiche(id, i)])),
    SM_Cone_Collet: () => cone(),
    SM_Casing_Rouge: () => casing(0.15, 0),
    SM_Couvercle_Trou: () => couvercle(),
    SM_Couvercle_Monterie: () => monterie(),
    SM_Boite_Cadenassage: () => boite(),
    SM_Pince_Multilock: () => pince(),
    SM_Cadenas_Rouge: () => cadenas(0xc8161c, 0),
    SM_Cadenas_Bleu: () => cadenas(0x1f5fb4, 3),
    SM_Etiquette_Cadenassage: () => etiquette(0),
    SM_Cadenassage_Ensemble: () => assemblage('P08'),
    SM_Harnais: () => { const x = h(); return groupe(x.sangles, x.boucles, x.plaque, x.dRing); },
    SM_Harnais_Avec_Longe: () => { const x = h(); return groupe(x.sangles, x.boucles, x.plaque, x.dRing, longe(x.ancrage)); },
    SM_Bloc_Retractable: () => blocRetractable(),
    SM_Extincteur_5lb: () => extincteur(shapes),
    SM_Trousse_Premiers_Soins: () => trousse(shapes),
    Lot_Securite_Complet: () => assemblage('P01'),
  };
}

const b64 = (buf) => {
  const u = new Uint8Array(buf); let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
};

/** Exporte un article : { nom, octets (base64), triangles, taille [x, y, z] en m }. */
export async function exporter(nom) {
  const obj = articles()[nom]();
  obj.name = nom;
  obj.traverse((o) => { o.userData = {}; });
  obj.updateMatrixWorld(true);
  let tris = 0;
  obj.traverse((o) => { if (o.isMesh) tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
  const box = new THREE.Box3().setFromObject(obj), size = box.getSize(new THREE.Vector3());
  const buf = await new GLTFExporter().parseAsync(obj, { binary: true, onlyVisible: true, maxTextureSize: 2048 });
  return { nom, data: b64(buf), tris: Math.round(tris), taille: size.toArray().map((v) => +v.toFixed(3)) };
}

export const noms = () => Object.keys(articles());
