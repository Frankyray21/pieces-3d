# Rendu photo-réaliste (Blender Cycles) d'une scène de la vidéo du plancher, exportée de
# la page vidéo en glTF (window.__glb(t) : même cadrage, même état des pièces).
#   blender --background --python scripts/blender-plancher.py -- scene.glb sortie.png [échantillons] [cpu|gpu]
# ou avec le module bpy : python scripts/blender-plancher.py scene.glb sortie.png 64
# Bois procédural (veines le long de chaque pièce, cernes au bout, arêtes adoucies), roche
# et gravier en relief, éclairage doux ; aucune texture externe.
import sys, math, time
import bpy, bmesh
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
GLB, OUT = argv[0], argv[1]
SAMPLES = int(argv[2]) if len(argv) > 2 else 64
DEVICE = argv[3] if len(argv) > 3 else 'cpu'

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
sc = bpy.context.scene
L = 9.7536  # longueur du plancher (32 pi)


def b(v):
    """Point ou direction de la page vidéo (Three.js, Y en haut) en coordonnées Blender (Z en haut)."""
    return Vector((v[0], -v[2], v[1]))


# ------------------------------------------------------------------ caméra et sortie
cam = bpy.data.objects.get('__camera')
sc.camera = cam
cam.data.sensor_fit = 'VERTICAL'
cam.data.angle_y = math.radians(40)
cam.data.clip_start, cam.data.clip_end = 0.05, 80
sc.render.resolution_x, sc.render.resolution_y = 1280, 540
sc.render.resolution_percentage = int(argv[4]) if len(argv) > 4 else 100

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

# ------------------------------------------------------------------ bois : veine de chaque pièce
WOOD = {'wood', 'woodLight', 'woodDark', 'woodGrey', 'woodWedge', 'woodPlaned'}


def mat_names(o):
    return {s.material.name.split('.')[0] for s in o.material_slots if s.material}


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
    planed = src.name.startswith('woodPlaned')
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
    tint.inputs['Factor'].default_value = 0.22
    Lk.new(ramp.outputs['Color'], fibm.inputs['A'])
    Lk.new(fib.outputs['Fac'], fibm.inputs['B'])
    Lk.new(fibm.outputs['Result'], tint.inputs['A'])
    Lk.new(seed.outputs['Color'], tint.inputs['B'])
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
    return m


photo = {}
for o in [o for o in bpy.data.objects if o.type == 'MESH']:
    names = mat_names(o)
    if names & WOOD:
        grain_attributes(o)
    for s in o.material_slots:
        if not s.material:
            continue
        key = s.material.name
        nm = key.split('.')[0]
        if key not in photo:
            if nm in WOOD:
                photo[key] = wood_material(s.material)
            elif nm in ('rock', 'rockFloor'):
                photo[key] = rock_material(s.material, nm == 'rockFloor')
            else:
                photo[key] = None
        if photo[key]:
            s.material = photo[key]

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
cy.transparent_max_bounces = 4
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
sc.view_settings.exposure = 0.0
sc.render.image_settings.file_format = 'PNG'
sc.render.filepath = OUT
t0 = time.time()
bpy.ops.render.render(write_still=True)
print(f'RENDU {OUT} {time.time() - t0:.1f} s ({SAMPLES} échantillons, {cy.device})')
