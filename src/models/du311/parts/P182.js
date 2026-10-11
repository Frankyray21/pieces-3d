// P182 — Laser d'alignement CX016331 rév. 0 (page 182) : module laser
// étanche NEMA 4X (1) à corps fileté Ø 1/2 po (M12) tenu dans son support par
// deux écrous et deux rondelles éventail, câble de 12 po hors tout jusqu'à
// une embase Deutsch DT04-2P (2) avec son verrou W2P (3) et ses deux contacts
// taille 16 (4, fils bleu → 1, noir → 2), gaine thermorétractable noire de
// 1 po (5) sur la jonction câble / manchon de l'embase.
// Repère : origine sur l'axe du laser, au centre de la face d'appui du laser
// sur son support (face avant de la tôle serrée entre les deux écrous, côté
// faisceau) ; faisceau selon +X ; câble vers -X (légère flèche vers -Y) ;
// Y vers le haut, Z en travers. La tôle du support (≈ 1/4 po, de x = 0 à
// x = -0.0058) appartient à P180.
// Encombrement ≈ 0.306 (X, de -0.300 à +0.0066) × 0.024 (Y) × 0.022 (Z) m.
// Cotes : 12 po hors tout (dessin, ≈ 152 px/po) ; le reste relevé à cette
// échelle : corps Ø 0.47 × 1.44 po, câble Ø 0.16 po, embase Ø 0.62 po.

const IN = 0.0254;
const u = (v) => v * IN;

export const LASER182 = {
  plate: u(0.23), // épaisseur de serrage entre les écrous
  beam: [1, 0, 0], // direction du faisceau
  bodyD: u(0.47),
};

export default function P182(api) {
  const { THREE, S } = api;
  const { lathe, thread, cable, merged, at, group, nut, box, cyl, washer } = S;
  const P = (ref, obj, e) => api.part(ref, obj, e);
  const L = (pts, mat, seg = 24, axis = 'x') => lathe(pts.map(([r, y]) => [u(r), u(y)]), mat, { seg, axis });
  const v3 = (x, y, z) => [u(x), u(y), u(z)];

  // ================================================ 1 — module laser
  // Corps fileté (de la tête à x = -0.46), corps lisse, presse-étoupe, fenêtre
  // de sortie, deux écrous M12 et rondelles éventail de part et d'autre du support.
  const R = 0.235;
  const body = merged([
    L([
      [0, -1.18], [0.2, -1.18], [0.215, -1.15], [0.215, -0.47], [R - 0.02, -0.46],
      ...thread(R, -0.46, 0.22, { pitch: 1 / 20, maxTurns: 14, chamferBottom: false }),
      [R - 0.03, 0.26], [0.15, 0.26], [0.15, 0.245], [0, 0.245],
    ], 'zinc', 28),
    at(nut(u(0.69), u(0.15), 'zinc', { axis: 'x' }), v3(0.105, 0, 0)),
    at(nut(u(0.69), u(0.15), 'zinc', { axis: 'x' }), v3(-0.335, 0, 0)),
    at(washer(u(0.33), u(0.24), u(0.03), 'zinc', { axis: 'x' }), v3(0.015, 0, 0)),
    at(washer(u(0.33), u(0.24), u(0.03), 'zinc', { axis: 'x' }), v3(-0.245, 0, 0)),
  ], 'zinc');
  // presse-étoupe de sortie du câble (noir)
  const gland = L([[0, -1.48], [0.1, -1.48], [0.13, -1.38], [0.15, -1.18], [0, -1.18]], 'black', 18);
  // fenêtre de sortie du faisceau
  const lens = L([[0, 0.245], [0.14, 0.245], [0.14, 0.255], [0, 0.258]], 'glass', 20);
  // étiquette d'avertissement laser (jaune) sur le corps lisse
  const lbl = cyl(u(0.218), u(0.5), 'yellow', { axis: 'x', seg: 24, open: true });
  lbl.position.set(...v3(-0.85, 0, 0));

  // Câble Ø 0.16 po (fait partie du laser) : du presse-étoupe au manchon de l'embase
  const cab = cable([
    v3(-1.48, 0, 0), v3(-3.5, -0.25, 0), v3(-6.0, -0.4, 0), v3(-8.0, -0.3, 0), v3(-9.1, -0.1, 0), v3(-9.85, 0, 0),
  ], u(0.08), { material: 'black', seg: 48 });
  cab.children.forEach((c) => { if (c.userData.isTubeEnds) c.visible = false; });
  P('1', group(body, gland, lens, lbl, cab), [0.04, 0, 0]);

  // ================================================ 2 — embase DT04-2P
  // Manchon de reprise du câble (cône), collerette, corps, tête rectangulaire
  // à jupe ouverte côté -X (contacts mâles).
  const xH = -10.85; // face arrière de la tête (côté manchon)
  const sleeve = L([
    [0, -10.15], [0.31, -10.15], [0.31, -10.13], [0.115, -9.88], [0.11, -9.7], [0, -9.7],
  ], 'grey', 24);
  const collar = L([[0, -10.35], [0.31, -10.35], [0.31, -10.15], [0, -10.15]], 'grey', 24);
  const neck = L([[0, xH], [0.22, xH], [0.22, -10.35], [0, -10.35]], 'grey', 24);
  const H = { len: 0.69, h: 0.62, w: 0.82, t: 0.06 };
  const xc = xH - H.len / 2;
  const shell = merged([
    // fond plein côté manchon puis jupe à quatre parois
    box(u(0.25), u(H.h), u(H.w), 'grey', { r: u(0.05), pos: v3(xH - 0.125, 0, 0) }),
    box(u(H.len - 0.25), u(H.t), u(H.w), 'grey', { pos: v3(xc - 0.125, H.h / 2 - H.t / 2, 0) }),
    box(u(H.len - 0.25), u(H.t), u(H.w), 'grey', { pos: v3(xc - 0.125, -H.h / 2 + H.t / 2, 0) }),
    box(u(H.len - 0.25), u(H.h), u(H.t), 'grey', { pos: v3(xc - 0.125, 0, H.w / 2 - H.t / 2) }),
    box(u(H.len - 0.25), u(H.h), u(H.t), 'grey', { pos: v3(xc - 0.125, 0, -H.w / 2 + H.t / 2) }),
    // nervure de verrouillage sur le dessus
    box(u(0.3), u(0.06), u(0.22), 'grey', { pos: v3(xH - 0.3, H.h / 2 + 0.03, 0) }),
  ], 'grey');
  P('2', group(sleeve, collar, neck, shell), [-0.03, 0, 0]);

  // 3 — verrou W2P (orange) inséré dans le fond de la jupe, deux passages de contact
  P('3', merged([
    box(u(0.12), u(H.h - 2 * H.t - 0.02), u(H.w - 2 * H.t - 0.02), 'orange', { r: u(0.02), pos: v3(xH - 0.31, 0, 0) }),
    box(u(0.12), u(0.12), u(0.5), 'orange', { pos: v3(xH - 0.43, 0.1, 0) }),
  ], 'orange'), [-0.06, 0, 0]);

  // 4 — contacts mâles taille 16 (×2), pointes dans la jupe
  for (const z of [-0.16, 0.16]) {
    P('4', L([[0, xH - 0.66], [0.02, xH - 0.65], [0.0315, xH - 0.62], [0.0315, xH - 0.2], [0.05, xH - 0.18], [0.05, xH - 0.05], [0, xH - 0.05]], 'brass', 12).translateZ(u(z)), [-0.05, 0, z * 0.1]);
  }

  // 5 — gaine thermorétractable noire 1/2 po (rétreinte), 1 po de long
  P('5', L([[0.08, -10.1], [0.13, -10.1], [0.13, -9.85], [0.1, -9.6], [0.1, -9.1], [0.08, -9.1]], 'rubber', 20), [0, -0.015, 0]);

  return { view: { dir: [-0.2, 0.5, 1] } };
}
