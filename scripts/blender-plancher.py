# Rendu photo-réaliste (Blender Cycles) de la vidéo du plancher : la scène complète et
# l'animation exportées de la page vidéo (scripts/blender-export.mjs : scene.glb, anim.json)
# sont rejouées image par image, même cadrage que la vidéo ; les étiquettes, le bandeau et
# la voix sont ajoutés ensuite au montage (scripts/video-plancher-montage.mjs).
#   blender --background --factory-startup --python scripts/blender-plancher.py -- \
#     scene.glb anim.json 0:11025 sortie/ [échantillons=64] [cpu|gpu] [pourcentage=100] [persistant=0|1]
# Images : sortie/f_00000.jpg … (déjà rendues : sautées, le rendu peut reprendre).
# Liste d'images : « a:b », « 12,40,41 » ou « @liste.json ». Après chaque lot de 400
# images, un fichier lot_<n>.zip (images du lot) est écrit pour le rapatriement.
# Bois procédural (veine le long de chaque pièce, bois de bout, arêtes adoucies), roche
# et gravier en relief ; aucune texture externe.
import sys, os, math, time, json, bisect, zipfile
import bpy, bmesh
from mathutils import Vector, Quaternion

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
GLB, ANIM, SPEC, OUTDIR = argv[0], argv[1], argv[2], argv[3]
SAMPLES = int(argv[4]) if len(argv) > 4 else 64
DEVICE = argv[5] if len(argv) > 5 else 'cpu'
PERCENT = int(argv[6]) if len(argv) > 6 else 100
# Données persistantes (plus rapide) : désactivées par défaut, car sur une longue suite
# d'images le GPU finit par rendre certaines surfaces en noir (parois, affiches).
PERSIST = len(argv) > 7 and argv[7] == '1'
os.makedirs(OUTDIR, exist_ok=True)
LOG = open(os.path.join(OUTDIR, 'rendu.log'), 'a', encoding='utf-8')


def log(msg):
    LOG.write(f'{time.strftime("%H:%M:%S")} {msg}\n')
    LOG.flush()


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
sc = bpy.context.scene
L = 9.7536  # longueur du plancher (32 pi)
anim = json.load(open(ANIM, encoding='utf-8'))


def b(v):
    """Point ou direction de la page vidéo (Three.js, Y en haut) en coordonnées Blender (Z en haut)."""
    return Vector((v[0], -v[2], v[1]))


# ------------------------------------------------------------------ caméra et sortie
camd = bpy.data.cameras.new('camera')
camd.sensor_fit = 'VERTICAL'
camd.angle_y = math.radians(anim['fov'])
camd.clip_start, camd.clip_end = 0.05, 80
cam = bpy.data.objects.new('camera', camd)
sc.collection.objects.link(cam)
cam.rotation_mode = 'QUATERNION'
sc.camera = cam
sc.render.resolution_x, sc.render.resolution_y = 1280, 540
sc.render.resolution_percentage = PERCENT
Q_UP = Quaternion((math.cos(math.pi / 4), math.sin(math.pi / 4), 0, 0))  # Y en haut -> Z en haut

# ------------------------------------------------------------------ lumières
for o in [o for o in bpy.data.objects if o.type == 'LIGHT']:
    bpy.data.objects.remove(o, do_unlink=True)


def sun(name, frm, to, energy, angle, color):
    d = bpy.data.lights.new(name, 'SUN')
    d.energy, d.angle, d.color = energy, math.radians(angle), color
    o = bpy.data.objects.new(name, d)
    sc.collection.objects.link(o)
    o.location = b(frm)
    o.rotation_euler = (b(to) - b(frm)).to_track_quat('-Z', 'Y').to_euler()
    return o


# Lumière principale (comme la vidéo : au-dessus, côté galerie), appoint froid à l'opposé.
sun('cle', (L / 2 + 3.5, 9, 6), (L / 2, 0, 0), 3.2, 6, (1.0, 0.95, 0.88))
sun('appoint', (-6, 4, 5), (0, 0, 0), 0.9, 15, (0.87, 0.91, 1.0))
w = bpy.data.worlds.new('galerie')
sc.world = w
w.use_nodes = True
bg = w.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (0.19, 0.2, 0.22, 1)
bg.inputs['Strength'].default_value = 0.55
_wn, _wl = w.node_tree.nodes, w.node_tree.links
_lp = _wn.new('ShaderNodeLightPath')
_dark = _wn.new('ShaderNodeBackground'); _dark.inputs['Color'].default_value = (0.012, 0.014, 0.016, 1)
_mix = _wn.new('ShaderNodeMixShader')
_wl.new(_lp.outputs['Is Camera Ray'], _mix.inputs['Fac'])
_wl.new(bg.outputs[0], _mix.inputs[1]); _wl.new(_dark.outputs[0], _mix.inputs[2])
_wl.new(_mix.outputs[0], _wn['World Output'].inputs['Surface'])

# ------------------------------------------------------------------ bois : veine de chaque pièce
WOOD = {'wood', 'woodLight', 'woodDark', 'woodGrey', 'woodWedge', 'woodPlaned'}


def base_name(m):
    return m.name.split('.')[0].split('~')[0]


def mat_names(o):
    return {base_name(s.material) for s in o.material_slots if s.material}


def grain_attributes(o):
    """Axe de la veine (arête la plus longue) et centre de chaque pièce (îlot de faces)."""
    me = o.data
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    seen = set()
    gax = [(1.0, 0.0, 0.0)] * len(bm.verts)
    gc = [(0.0, 0.0, 0.0)] * len(bm.verts)
    for f0 in bm.faces:
        if f0.index in seen:
            continue
        stack, faces = [f0], []
        seen.add(f0.index)
        while stack:
            f = stack.pop()
            faces.append(f)
            for e in f.edges:
                for g in e.link_faces:
                    if g.index not in seen:
                        seen.add(g.index)
                        stack.append(g)
        verts = {v for f in faces for v in f.verts}
        edges = {e for f in faces for e in f.edges}
        long = max(edges, key=lambda e: e.calc_length())
        ax = (long.verts[1].co - long.verts[0].co).normalized()
        ax = ax if max(ax, key=abs) > 0 else -ax
        c = sum((v.co for v in verts), Vector()) / len(verts)
        for v in verts:
            gax[v.index], gc[v.index] = tuple(ax), tuple(c)
    bm.free()
    for name, data in (('gax', gax), ('gc', gc)):
        a = me.attributes.get(name) or me.attributes.new(name, 'FLOAT_VECTOR', 'POINT')
        a.data.foreach_set('vector', [x for t in data for x in t])


def wood_material(src):
    """Bois brut scié : veines étirées le long de la pièce, cernes au bout, teinte par pièce."""
    base = src.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value[:] if src.use_nodes else (0.6, 0.45, 0.3, 1)
    planed = base_name(src) == 'woodPlaned'
    m = bpy.data.materials.new(src.name + '_photo')
    m.use_nodes = True
    nt = m.node_tree
    N, Lk = nt.nodes, nt.links
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    bsdf = N.new('ShaderNodeBsdfPrincipled')
    Lk.new(bsdf.outputs[0], out.inputs[0])
    tc = N.new('ShaderNodeTexCoord')
    a_ax = N.new('ShaderNodeAttribute'); a_ax.attribute_name = 'gax'
    a_c = N.new('ShaderNodeAttribute'); a_c.attribute_name = 'gc'

    def vm(op, x, y=None):
        n = N.new('ShaderNodeVectorMath'); n.operation = op
        Lk.new(x, n.inputs[0])
        if y is not None:
            if isinstance(y, (int, float)):
                n.inputs[3].default_value = y
            else:
                Lk.new(y, n.inputs[1])
        return n

    def mm(op, x, y=None, v=None):
        n = N.new('ShaderNodeMath'); n.operation = op
        Lk.new(x, n.inputs[0]) if not isinstance(x, (int, float)) else n.inputs.__getitem__(0).__setattr__('default_value', x)
        if y is not None:
            Lk.new(y, n.inputs[1]) if not isinstance(y, (int, float)) else n.inputs.__getitem__(1).__setattr__('default_value', y)
        return n

    d = vm('SUBTRACT', tc.outputs['Object'], a_c.outputs['Vector'])            # position dans la pièce
    along = vm('DOT_PRODUCT', d.outputs[0], a_ax.outputs['Vector'])           # le long de la veine
    proj = vm('SCALE', a_ax.outputs['Vector'], 1.0)
    Lk.new(along.outputs['Value'], proj.inputs['Scale'])
    across = vm('SUBTRACT', d.outputs[0], proj.outputs[0])                    # en travers
    # Cœur de l'arbre décalé hors de la pièce (débit sur dosse) : cernes larges et courbes.
    seed = N.new('ShaderNodeTexWhiteNoise'); seed.noise_dimensions = '3D'
    Lk.new(a_c.outputs['Vector'], seed.inputs['Vector'])
    off = vm('SCALE', seed.outputs['Color'], 0.35)
    across2 = vm('ADD', across.outputs[0], off.outputs[0])
    # Vecteur des cernes : en travers à pleine échelle, le long très étiré (veines longues).
    stretch = vm('SCALE', a_ax.outputs['Vector'], 1.0)
    al = mm('MULTIPLY', along.outputs['Value'], 0.04)
    Lk.new(al.outputs[0], stretch.inputs['Scale'])
    rv = vm('ADD', across2.outputs[0], stretch.outputs[0])
    wave = N.new('ShaderNodeTexWave'); wave.wave_type = 'RINGS'; wave.rings_direction = 'SPHERICAL'
    wave.inputs['Scale'].default_value = 32.0
    wave.inputs['Distortion'].default_value = 9.0
    wave.inputs['Detail'].default_value = 2.5
    wave.inputs['Detail Scale'].default_value = 0.6
    wave.inputs['Detail Roughness'].default_value = 0.55
    Lk.new(rv.outputs[0], wave.inputs['Vector'])
    ramp = N.new('ShaderNodeValToRGB')
    Lk.new(wave.outputs['Fac'], ramp.inputs['Fac'])
    r, g, bb = base[0], base[1], base[2]
    # Bois de printemps clair, bois d'été en lignes fines plus foncées.
    ramp.color_ramp.elements[0].position = 0.55
    ramp.color_ramp.elements[0].color = (r * 1.04, g * 1.02, bb * 0.98, 1)
    ramp.color_ramp.elements[1].position = 0.98
    ramp.color_ramp.elements[1].color = (r * 0.78, g * 0.7, bb * 0.6, 1)
    # Fines fibres étirées le long de la veine.
    fv = vm('SCALE', across.outputs[0], 1.0)
    fvs = vm('ADD', fv.outputs[0], stretch.outputs[0])
    fib = N.new('ShaderNodeTexNoise'); fib.inputs['Scale'].default_value = 90; fib.inputs['Detail'].default_value = 3
    Lk.new(fvs.outputs[0], fib.inputs['Vector'])
    fibm = N.new('ShaderNodeMix'); fibm.data_type = 'RGBA'; fibm.blend_type = 'OVERLAY'
    fibm.inputs['Factor'].default_value = 0.18
    # Teinte propre à chaque pièce (lots de bois différents) et taches.
    tint = N.new('ShaderNodeMix'); tint.data_type = 'RGBA'; tint.blend_type = 'MULTIPLY'
    tint.inputs['Factor'].default_value = 1.0
    Lk.new(ramp.outputs['Color'], fibm.inputs['A'])
    Lk.new(fib.outputs['Fac'], fibm.inputs['B'])
    Lk.new(fibm.outputs['Result'], tint.inputs['A'])
    lot = N.new('ShaderNodeValToRGB')  # clarté propre à chaque pièce (lots de bois)
    lot.color_ramp.elements[0].color = (0.74, 0.7, 0.66, 1)
    lot.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1)
    Lk.new(seed.outputs['Value'], lot.inputs['Fac'])
    Lk.new(lot.outputs['Color'], tint.inputs['B'])
    stain = N.new('ShaderNodeTexNoise'); stain.inputs['Scale'].default_value = 3.5; stain.inputs['Detail'].default_value = 4
    Lk.new(tc.outputs['Object'], stain.inputs['Vector'])
    st = N.new('ShaderNodeMix'); st.data_type = 'RGBA'; st.blend_type = 'MULTIPLY'
    st.inputs['Factor'].default_value = 0.18
    Lk.new(tint.outputs['Result'], st.inputs['A'])
    Lk.new(stain.outputs['Color'], st.inputs['B'])
    # Bois de bout (face perpendiculaire à la veine) plus foncé.
    geo = N.new('ShaderNodeNewGeometry')
    ndot = vm('DOT_PRODUCT', geo.outputs['Normal'], a_ax.outputs['Vector'])
    nabs = mm('ABSOLUTE', ndot.outputs['Value'])
    endf = mm('GREATER_THAN', nabs.outputs[0], 0.7)
    endc = N.new('ShaderNodeMix'); endc.data_type = 'RGBA'; endc.blend_type = 'MULTIPLY'
    Lk.new(endf.outputs[0], endc.inputs['Factor'])
    Lk.new(st.outputs['Result'], endc.inputs['A'])
    endc.inputs['B'].default_value = (0.62, 0.55, 0.5, 1)
    Lk.new(endc.outputs['Result'], bsdf.inputs['Base Color'])
    # Surface sciée (fibres arrachées, traits de scie) ou rabotée ; arêtes adoucies (3 mm).
    fuzz = N.new('ShaderNodeTexNoise'); fuzz.inputs['Scale'].default_value = 180; fuzz.inputs['Detail'].default_value = 6
    Lk.new(tc.outputs['Object'], fuzz.inputs['Vector'])
    bevel = N.new('ShaderNodeBevel'); bevel.inputs['Radius'].default_value = 0.004; bevel.samples = 6
    bump = N.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.12 if planed else 0.35
    bump.inputs['Distance'].default_value = 0.002
    Lk.new(fuzz.outputs['Fac'], bump.inputs['Height'])
    Lk.new(bevel.outputs['Normal'], bump.inputs['Normal'])
    Lk.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    bsdf.inputs['Roughness'].default_value = 0.62 if planed else 0.82
    bsdf.inputs['Specular IOR Level'].default_value = 0.35
    return m


def rock_material(src, floor):
    """Roche dynamitée (paroi) ou sol de galerie (gravier fin, boue) : couleur inégale, relief, mate."""
    base = src.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value[:] if src.use_nodes else (0.2, 0.2, 0.2, 1)
    m = bpy.data.materials.new(src.name + '_photo')
    m.use_nodes = True
    N, Lk = m.node_tree.nodes, m.node_tree.links
    bsdf = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord')
    big = N.new('ShaderNodeTexNoise'); big.noise_type = 'RIDGED_MULTIFRACTAL'
    big.inputs['Scale'].default_value = 1.2 if not floor else 3.0
    big.inputs['Detail'].default_value = 10; big.inputs['Roughness'].default_value = 0.62
    big.inputs['Lacunarity'].default_value = 2.3
    fine = N.new('ShaderNodeTexNoise'); fine.inputs['Scale'].default_value = 40 if floor else 14; fine.inputs['Detail'].default_value = 8
    col = N.new('ShaderNodeTexNoise'); col.inputs['Scale'].default_value = 0.9 if not floor else 2.0; col.inputs['Detail'].default_value = 6
    for n in (big, fine, col):
        Lk.new(tc.outputs['Object'], n.inputs['Vector'])
    ramp = N.new('ShaderNodeValToRGB')
    Lk.new(col.outputs['Fac'], ramp.inputs['Fac'])
    r, g, bb = base[0], base[1], base[2]
    ramp.color_ramp.elements[0].color = (r * 0.7, g * 0.7, bb * 0.72, 1)
    ramp.color_ramp.elements[1].color = (r * 1.35, g * 1.3, bb * 1.25, 1)
    Lk.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
    h = N.new('ShaderNodeMath'); h.operation = 'MULTIPLY_ADD'
    Lk.new(fine.outputs['Fac'], h.inputs[0]); h.inputs[1].default_value = 0.35; Lk.new(big.outputs['Fac'], h.inputs[2])
    if floor:
        # Petites pierres du gravier.
        vor = N.new('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 140
        Lk.new(tc.outputs['Object'], vor.inputs['Vector'])
        h2 = N.new('ShaderNodeMath'); h2.operation = 'MULTIPLY_ADD'
        Lk.new(vor.outputs['Distance'], h2.inputs[0]); h2.inputs[1].default_value = 0.25; Lk.new(h.outputs[0], h2.inputs[2])
        h = h2
    bump = N.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.55 if floor else 0.9
    bump.inputs['Distance'].default_value = 0.01 if floor else 0.06
    Lk.new(h.outputs[0], bump.inputs['Height'])
    Lk.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    bsdf.inputs['Roughness'].default_value = 0.9
    bsdf.inputs['Specular IOR Level'].default_value = 0.35
    if not floor:
        # Paroi vue de dos (caméra derrière, hors de la galerie) : transparente pour la
        # caméra, comme dans la vidéo (faces arrière non dessinées).
        out = N['Material Output']
        geo = N.new('ShaderNodeNewGeometry')
        lp = N.new('ShaderNodeLightPath')
        both = N.new('ShaderNodeMath'); both.operation = 'MULTIPLY'
        Lk.new(geo.outputs['Backfacing'], both.inputs[0]); Lk.new(lp.outputs['Is Camera Ray'], both.inputs[1])
        tr = N.new('ShaderNodeBsdfTransparent')
        mix = N.new('ShaderNodeMixShader')
        Lk.new(both.outputs[0], mix.inputs['Fac'])
        Lk.new(bsdf.outputs[0], mix.inputs[1]); Lk.new(tr.outputs[0], mix.inputs[2])
        Lk.new(mix.outputs[0], out.inputs['Surface'])
    return m


GHOST = []  # (nœud Valeur, 'ghost' | 'near') : transparence de la cage, réglée à chaque image


def with_ghost(m, tag):
    """Copie du matériau mélangée à du transparent (pièces autour de la cage, gros plan)."""
    m = m.copy()
    m.name = m.name + '~' + tag
    N, Lk = m.node_tree.nodes, m.node_tree.links
    out = next(n for n in N if n.type == 'OUTPUT_MATERIAL')
    src = out.inputs['Surface'].links[0].from_socket
    val = N.new('ShaderNodeValue'); val.outputs[0].default_value = 0.0
    tr = N.new('ShaderNodeBsdfTransparent')
    mix = N.new('ShaderNodeMixShader')
    Lk.new(val.outputs[0], mix.inputs['Fac'])
    Lk.new(src, mix.inputs[1]); Lk.new(tr.outputs[0], mix.inputs[2])
    Lk.new(mix.outputs[0], out.inputs['Surface'])
    GHOST.append((val, tag))
    return m


def laser_material():
    m = bpy.data.materials.new('laser_photo')
    m.use_nodes = True
    N, Lk = m.node_tree.nodes, m.node_tree.links
    N.clear()
    out = N.new('ShaderNodeOutputMaterial')
    em = N.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (1.0, 0.08, 0.04, 1); em.inputs['Strength'].default_value = 3.0
    tr = N.new('ShaderNodeBsdfTransparent')
    mix = N.new('ShaderNodeMixShader'); mix.inputs['Fac'].default_value = 0.84
    Lk.new(em.outputs[0], mix.inputs[1]); Lk.new(tr.outputs[0], mix.inputs[2])
    Lk.new(mix.outputs[0], out.inputs['Surface'])
    return m


photo = {}
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    names = mat_names(o)
    if names == {'rock'}:
        # Parois et plafond : ne bloquent pas la lumière principale (comme la vidéo).
        o.visible_shadow = False
    if names & WOOD:
        grain_attributes(o)
    for s in o.material_slots:
        if not s.material:
            continue
        key = s.material.name
        if key not in photo:
            nm = base_name(s.material)
            tag = s.material.name.split('.')[0].split('~')[1] if '~' in s.material.name else None
            if nm in WOOD:
                m = wood_material(s.material)
            elif nm in ('rock', 'rockFloor'):
                m = rock_material(s.material, nm == 'rockFloor')
            elif nm == 'laser':
                m = laser_material()
            else:
                m = s.material if tag else None
            photo[key] = with_ghost(m, tag) if (m and tag) else m
        if photo[key]:
            s.material = photo[key]


def wire_material():
    """Fil galvanisé du grillage : sans reflet d'environnement, le zinc métallique pur sort
    presque noir ; un métal en partie diffus garde le gris clair du grillage de la vidéo."""
    m = bpy.data.materials.new('grillage_photo')
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (0.62, 0.65, 0.68, 1)
    p.inputs['Metallic'].default_value = 0.35
    p.inputs['Roughness'].default_value = 0.42
    return m


WIRE, n_wire = None, 0
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    dims = sorted(o.dimensions)
    # Grillage : maillage de zinc très mince (fils), 24 po de haut, long de plusieurs mètres
    # (les rangées de tire-fonds, aussi en zinc, ne font que 6 po de long).
    if mat_names(o) == {'zinc'} and dims[0] < 0.03 and 0.5 < dims[1] < 0.7 and dims[2] > 1.5:
        WIRE = WIRE or wire_material()
        n_wire += 1
        for s in o.material_slots:
            s.material = WIRE
log(f'grillage : {n_wire} objets')

# ------------------------------------------------------------------ rendu
sc.render.engine = 'CYCLES'
cy = sc.cycles
cy.samples = SAMPLES
cy.use_adaptive_sampling = True
cy.use_denoising = True
cy.denoiser = 'OPENIMAGEDENOISE'
cy.max_bounces = 6
cy.diffuse_bounces = 3
cy.glossy_bounces = 2
cy.transparent_max_bounces = 48
if DEVICE == 'gpu':
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for t in ('OPTIX', 'CUDA', 'HIP', 'ONEAPI', 'METAL'):
        try:
            prefs.compute_device_type = t
            prefs.get_devices()
            if any(d.type == t for d in prefs.devices):
                for d in prefs.devices:
                    d.use = d.type == t
                cy.device = 'GPU'
                break
        except TypeError:
            pass
sc.view_settings.view_transform = 'AgX'
sc.view_settings.look = 'AgX - Medium High Contrast'
sc.view_settings.exposure = 0.35
sc.render.image_settings.file_format = 'JPEG'
sc.render.image_settings.quality = 95
sc.render.use_persistent_data = PERSIST

# ------------------------------------------------------------------ animation
OBJ = {o.name.split('.')[0]: o for o in bpy.data.objects if o.name.startswith('n')}
TRACK = {}  # id -> ([images], [états])
for c in anim['changes']:
    f, oid, st = c[0], c[1], c[2:]
    t = TRACK.setdefault(oid, ([], []))
    t[0].append(f); t[1].append(st)
for o in OBJ.values():
    o.rotation_mode = 'QUATERNION'
MESHES = [o for o in OBJ.values() if o.type == 'MESH']
CHAIN = {}
for o in MESHES:
    ch, p = [], o
    while p is not None:
        ch.append(p.name.split('.')[0]); p = p.parent
    CHAIN[o.name] = ch
VIS = {}


def apply(f):
    for oid, (fs, sts) in TRACK.items():
        o = OBJ.get(oid)
        if o is None:
            continue
        i = bisect.bisect_right(fs, f) - 1
        if i < 0:
            continue
        v, px, py, pz, qx, qy, qz, qw, sx, sy, sz = sts[i]
        VIS[oid] = v
        o.location = (px, -pz, py)
        o.rotation_quaternion = (qw, qx, -qz, qy)
        o.scale = (sx, sz, sy)
    for o in MESHES:
        o.hide_render = not all(VIS.get(i, 1) for i in CHAIN[o.name])
    px, py, pz, qx, qy, qz, qw = anim['cam'][f]
    cam.location = (px, -pz, py)
    cam.rotation_quaternion = Q_UP @ Quaternion((qw, qx, qy, qz))
    g, n = anim['ghost'][f]
    for val, tag in GHOST:
        val.outputs[0].default_value = 1.0 - (g if tag == 'ghost' else n)


def frames(spec):
    if spec.startswith('@'):
        return json.load(open(spec[1:], encoding='utf-8'))
    if ':' in spec:
        a, b = map(int, spec.split(':'))
        return list(range(a, b))
    return [int(x) for x in spec.split(',')]


todo = frames(SPEC)
log(f'début : {len(todo)} images, {SAMPLES} échantillons, {cy.device}')
t0, done, lot = time.time(), 0, []
for k, f in enumerate(todo):
    out = os.path.join(OUTDIR, f'f_{f:05d}.jpg')
    if not os.path.exists(out):
        apply(f)
        sc.render.filepath = out
        bpy.ops.render.render(write_still=True)
        done += 1
    lot.append(out)
    if len(lot) == 400 or k == len(todo) - 1:
        z = os.path.join(OUTDIR, f'lot_{k // 400:03d}.zip')
        with zipfile.ZipFile(z + '.tmp', 'w', zipfile.ZIP_STORED) as zf:
            for p in lot:
                if os.path.exists(p):
                    zf.write(p, os.path.basename(p))
        os.replace(z + '.tmp', z)
        lot = []
        el = time.time() - t0
        log(f'{k + 1}/{len(todo)} images ; {el / max(1, done):.2f} s/image ; lot {z}')
log('FINI')
