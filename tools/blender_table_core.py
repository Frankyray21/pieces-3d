"""Table à carottes C16080960 (Foresco pour Machines Roger) : scène Blender d'après la CAO.

Entrée : le JSON de tools/solidworks_asm.py (facettes exactes de l'assemblage SolidWorks).
Sorties dans le dossier donné : table-a-core.blend, table-a-core.glb, rendus Cycles
(.png) et, avec --mesh, le module de maillages du site (src/models/table-a-core/mesh.js).

Usage (module bpy, ex. pip install bpy==5.2.2) :
    python tools/solidworks_asm.py C16080960.SLDASM /tmp/table.json
    python tools/blender_table_core.py /tmp/table.json sortie/ [--mesh src/models/table-a-core/mesh.js]
        [--finition alu|cao] [--res 1600x1067] [--samples 96] [--vues face,dos]

Finition « alu » (par défaut) : aluminium 6061-T6 nu, le matériau de la nomenclature ;
« cao » : couleurs du modèle SolidWorks (tôles rouges, tubes gris). Le contreplaqué est en bois.
Repère : Z vers le haut, sol à Z = 0, table centrée ; le devant (plan de travail) vers -Y.
"""
import base64
import json
import math
import os
import struct
import sys

import bpy
import bmesh
from mathutils import Matrix, Vector

argv = sys.argv[1:]
opt, pos = {}, []
while argv:
    a = argv.pop(0)
    if a.startswith('--'):
        opt[a[2:]] = argv.pop(0)
    else:
        pos.append(a)
src, outdir = pos[0], os.path.abspath(pos[1])
os.makedirs(outdir, exist_ok=True)
FIN = opt.get('finition', 'alu')
W, H = (int(v) for v in opt.get('res', '1600x1067').split('x'))
SAMPLES = int(opt.get('samples', '96'))
VUES = opt.get('vues', 'face,dos').split(',')

# Repère de la nomenclature du plan C16080960 (articles 1 à 7) ; le contreplaqué du
# modèle n'y figure pas : repère 8.
REFS = {'C16080961': 1, 'C16080962': 2, 'C16080963': 3, 'C16080964': 4, 'C16080965': 5,
        'C16080967': 6, 'C16080968': 7, 'Plywood': 8}
TUBES = ('C16080967', 'C16080968')

data = json.load(open(src))
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'IMPERIAL'
scene.unit_settings.length_unit = 'INCHES'


# ------------------------------------------------------------------ matériaux
def principled(name, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    for k, v in kw.items():
        b.inputs[k].default_value = v
    return m, b


def bump(m, b, scale, strength, detail=6.0):
    """Relief fin (peau d'orange, grain) en coordonnées objet."""
    nt = m.node_tree
    tc = nt.nodes.new('ShaderNodeTexCoord')
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = scale
    nz.inputs['Detail'].default_value = detail
    bp = nt.nodes.new('ShaderNodeBump')
    bp.inputs['Strength'].default_value = strength
    bp.inputs['Distance'].default_value = 0.001
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    nt.links.new(nz.outputs['Fac'], bp.inputs['Height'])
    nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return nz


def mat_rouge():
    m, b = principled('Peinture rouge MRI', **{'Base Color': (0.46, 0.012, 0.018, 1), 'Roughness': 0.38, 'Coat Weight': 0.6, 'Coat Roughness': 0.12})
    bump(m, b, 900, 0.06)
    return m


def mat_alu(name='Aluminium 6061-T6'):
    m, b = principled(name, **{'Base Color': (0.78, 0.79, 0.80, 1), 'Metallic': 1.0, 'Roughness': 0.34})
    bump(m, b, 400, 0.05)
    return m


def mat_bois():
    m, b = principled('Contreplaqué', **{'Base Color': (0.62, 0.45, 0.27, 1), 'Roughness': 0.72})
    nt = m.node_tree
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (1.2, 14, 14)  # veines le long de la planche (X de la pièce)
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = 5
    nz.inputs['Detail'].default_value = 8
    nz.inputs['Distortion'].default_value = 1.6
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.3
    ramp.color_ramp.elements[0].color = (0.42, 0.27, 0.14, 1)
    ramp.color_ramp.elements[1].position = 0.72
    ramp.color_ramp.elements[1].color = (0.74, 0.56, 0.35, 1)
    bp = nt.nodes.new('ShaderNodeBump')
    bp.inputs['Strength'].default_value = 0.12
    bp.inputs['Distance'].default_value = 0.001
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    nt.links.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    nt.links.new(nz.outputs['Fac'], bp.inputs['Height'])
    nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


ALU = mat_alu()
TOLE = mat_rouge() if FIN == 'cao' else ALU
BOIS = mat_bois()

# ------------------------------------------------------------------ pièces
# Pose de la table : sol à Z = 0, centrée en X et Y.
lo, hi = Vector(data['bbox'][:3]), Vector(data['bbox'][3:])
POSE = Matrix.Translation((-(lo.x + hi.x) / 2, -(lo.y + hi.y) / 2, -lo.z))

meshes = {}
for name, g in data['bodies'].items():
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in g['v']], [], [tuple(t) for t in g['t']])
    bm = bmesh.new()
    bm.from_mesh(me)
    # Les faces de la CAO ont chacune leurs sommets : soudure (1/100 mm), puis facettes coplanaires fondues.
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bmesh.ops.dissolve_limit(bm, angle_limit=math.radians(0.5), verts=bm.verts, edges=bm.edges)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    me.materials.append(BOIS if name == 'Plywood' else ALU if name in TUBES else TOLE)
    meshes[name] = me

col = bpy.data.collections.new('Table à carottes C16080960')
scene.collection.children.link(col)
objs = []
count = {}
for inst in data['instances']:
    body = inst['body']
    count[body] = count.get(body, 0) + 1
    o = bpy.data.objects.new(f"ref-{REFS[body]} {body}" + (f".{count[body]}" if count[body] > 1 else ''), meshes[body])
    o.matrix_world = POSE @ Matrix(inst['matrix'])
    o['ref'] = REFS[body]
    o['piece'] = body
    col.objects.link(o)
    objs.append(o)
bpy.context.view_layer.update()
for o in objs:  # arêtes vives au-delà de 30° (plis de tôle lissés, chants nets)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
bpy.ops.object.shade_auto_smooth(angle=math.radians(30))
bpy.ops.object.select_all(action='DESELECT')

size = hi - lo
print('Encombrement (po) :', [round(v / 0.0254, 3) for v in size])

# ------------------------------------------------------------------ maillages du site
if 'mesh' in opt:
    # Repère du site : Y vers le haut ; Blender (x, y, z) -> site (x, z, -y).
    parts = []
    dg = bpy.context.evaluated_depsgraph_get()
    for o in objs:
        me = o.evaluated_get(dg).to_mesh()
        me.calc_loop_triangles()
        mw = o.matrix_world
        nm = mw.to_3x3().inverted().transposed()
        index, vp, vn, tri = {}, [], [], []
        for t in me.loop_triangles:
            for li in t.loops:
                p = mw @ me.vertices[me.loops[li].vertex_index].co
                n = (nm @ me.corner_normals[li].vector).normalized()
                key = (round(p.x, 5), round(p.z, 5), round(-p.y, 5), round(n.x * 127), round(n.z * 127), round(-n.y * 127))
                if key not in index:
                    index[key] = len(vp) // 3
                    vp += key[:3]
                    vn += key[3:]
                tri.append(index[key])
        o.evaluated_get(dg).to_mesh_clear()
        b64 = lambda fmt, a: base64.b64encode(struct.pack(f'<{len(a)}{fmt}', *a)).decode()
        parts.append({'ref': str(o['ref']), 'piece': o['piece'], 'p': b64('f', vp), 'n': b64('b', vn), 'i': b64('H', tri)})
    with open(opt['mesh'], 'w') as f:
        f.write('// Maillages de la table à carottes C16080960, produits par tools/blender_table_core.py\n'
                '// (facettes de la CAO SolidWorks, soudées et lissées dans Blender). Ne pas modifier à la main.\n'
                '// p : positions float32 (m, Y vers le haut, sol à 0), n : normales int8 / 127, i : indices uint16.\n'
                'export default ' + json.dumps(parts, indent=0) + ';\n')
    print('mesh.js :', sum(len(p['i']) for p in parts) * 3 // 4 // 2 // 3, 'triangles')

# ------------------------------------------------------------------ export glTF (modèle seul)
bpy.ops.object.select_all(action='DESELECT')
for o in objs:
    o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(outdir, 'table-a-core.glb'), use_selection=True, export_extras=True, export_apply=True)
bpy.ops.object.select_all(action='DESELECT')

# ------------------------------------------------------------------ studio
sol = bpy.data.meshes.new('Sol')
sol.from_pydata([(-30, -30, 0), (30, -30, 0), (30, 30, 0), (-30, 30, 0)], [], [(0, 1, 2, 3)])
sol_o = bpy.data.objects.new('Sol', sol)
scene.collection.objects.link(sol_o)
ms, bs = principled('Béton', **{'Base Color': (0.36, 0.36, 0.35, 1), 'Roughness': 0.8})
nz = bump(ms, bs, 6, 0.25, 10)
sol.materials.append(ms)

world = bpy.data.worlds.new('Atelier')
scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.62, 0.66, 0.72, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.28


def lampe(name, loc, energy, sz, color=(1, 1, 1)):
    l = bpy.data.lights.new(name, 'AREA')
    l.energy, l.size, l.color = energy, sz, color
    o = bpy.data.objects.new(name, l)
    o.location = loc
    o.rotation_euler = (Vector((0, 0, size.z * 0.5)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    scene.collection.objects.link(o)
    return o


def camera(name, d, lens=50):
    cam = bpy.data.cameras.new(name)
    cam.lens = lens
    o = bpy.data.objects.new(name, cam)
    scene.collection.objects.link(o)
    d = Vector(d).normalized()
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    o.location = Vector((0, 0, size.z / 2)) + d * 10
    scene.camera = o
    bpy.context.view_layer.update()
    for ob in objs:
        ob.select_set(True)
    bpy.ops.view3d.camera_to_view_selected()
    bpy.ops.object.select_all(action='DESELECT')
    o.location += d * (o.location - Vector((0, 0, size.z / 2))).length * 0.06  # marge
    return o


scene.render.engine = 'CYCLES'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = W, H
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'

DIRS = {'face': (-0.72, -1, 0.5), 'dos': (0.8, 1, 0.55), 'cote': (-1, -0.12, 0.25), 'dessus': (-0.25, -0.5, 1)}
for vue in VUES:
    d = Vector(DIRS[vue]).normalized()
    side = Vector((-d.y, d.x, 0)).normalized()
    lights = [lampe('Principale', d * 4.5 + side * 3.2 + Vector((0, 0, 4.2)), 520, 4.0, (1, 0.97, 0.93)),
              lampe('Débouchage', d * 4.5 - side * 4.0 + Vector((0, 0, 2.0)), 150, 5.0, (0.92, 0.96, 1)),
              lampe('Contre-jour', -d * 4.0 + Vector((0, 0, 4.5)), 320, 3.0)]
    camera('Caméra ' + vue, d)
    scene.render.filepath = os.path.join(outdir, f"table-a-core-{vue}{'' if FIN == 'alu' else '-' + FIN}.png")
    bpy.ops.render.render(write_still=True)
    print('rendu', scene.render.filepath)
    if vue != VUES[-1]:
        for l in lights:
            bpy.data.objects.remove(l)

if FIN == 'alu':
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(outdir, 'table-a-core.blend'))
