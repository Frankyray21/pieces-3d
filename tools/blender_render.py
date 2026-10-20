"""Rendu photoréaliste (Blender Cycles) d'un assemblage exporté en .glb.

Usage (module bpy de Blender, ex. pip install bpy==5.2.2 dans un venv) :
    node scripts/export-glb.mjs --eq stm-1500 P002 /tmp/P002.glb
    python tools/blender_render.py /tmp/P002.glb rendu.png [--dir 0.85,0.55,1] [--res 1600x1000] [--samples 128]

Scène : sol de béton mat, grand réflecteur doux, contre-jour et ciel gris
(éclairage d'atelier), ombres et occlusion calculées par le lancer de rayons ;
caméra 35 mm cadrée sur la boîte englobante. --dir : direction de vue dans le
repère du site (X, Y vers le haut, Z), comme view.dir des builders.
"""
import math
import sys

import bpy
from mathutils import Vector

argv = sys.argv[1:]
opt = {}
pos = []
while argv:
    a = argv.pop(0)
    if a.startswith('--'):
        opt[a[2:]] = argv.pop(0)
    else:
        pos.append(a)
import os
src, out = pos[0], os.path.abspath(pos[1])
d = [float(v) for v in opt.get('dir', '0.85,0.55,1').split(',')]
W, H = (int(v) for v in opt.get('res', '1600x1000').split('x'))
samples = int(opt.get('samples', '128'))

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']

# Boîte englobante (repère Blender : Z vers le haut).
lo = Vector((1e9, 1e9, 1e9))
hi = Vector((-1e9, -1e9, -1e9))
for o in objs:
    for c in o.bound_box:
        p = o.matrix_world @ Vector(c)
        lo = Vector(map(min, lo, p))
        hi = Vector(map(max, hi, p))
center = (lo + hi) / 2
size = (hi - lo).length

# Normales : celles du .glb (lissées pièce par pièce) font des taches noires
# au lancer de rayons sur les arêtes vives ; recalculées ici par angle (35°).
for o in objs:
    with bpy.context.temp_override(object=o, active_object=o, selected_objects=[o], selected_editable_objects=[o]):
        if o.data.has_custom_normals:
            bpy.ops.mesh.customdata_custom_splitnormals_clear()
    o.data.shade_smooth()
    o.data.set_sharp_from_angle(angle=math.radians(35))

# Matériaux un peu plus « réels » (rugosité légèrement relevée).
for o in objs:
    for m in o.data.materials:
        if not m or not m.use_nodes:
            continue
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        if bsdf:
            r = bsdf.inputs['Roughness'].default_value
            bsdf.inputs['Roughness'].default_value = min(1.0, r * 1.05 + 0.03)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = samples
scene.cycles.use_denoising = True
scene.cycles.device = 'CPU'
scene.render.resolution_x, scene.render.resolution_y = W, H
scene.render.film_transparent = False
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'

# Ciel gris doux (monde) : lumière d'ambiance et reflets.
world = bpy.data.worlds.new('atelier')
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs['Color'].default_value = (0.62, 0.66, 0.72, 1)
bg.inputs['Strength'].default_value = 0.3

# Sol de béton (grand disque mat, léger bruit de teinte).
bpy.ops.mesh.primitive_plane_add(size=size * 40, location=(center.x, center.y, lo.z - 0.002))
floor = bpy.context.object
fm = bpy.data.materials.new('béton')
fm.use_nodes = True
nt = fm.node_tree
fb = nt.nodes['Principled BSDF']
fb.inputs['Roughness'].default_value = 0.85
noise = nt.nodes.new('ShaderNodeTexNoise')
noise.inputs['Scale'].default_value = 3.0
ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (0.30, 0.30, 0.31, 1)
ramp.color_ramp.elements[1].color = (0.42, 0.42, 0.43, 1)
nt.links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
nt.links.new(ramp.outputs['Color'], fb.inputs['Base Color'])
floor.data.materials.append(fm)

# Caméra : direction du site (X, Y, Z) → Blender (X, -Z, Y).
v = Vector((d[0], -d[2], d[1])).normalized()
cam_data = bpy.data.cameras.new('cam')
cam_data.lens = 35
cam = bpy.data.objects.new('cam', cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
fov = 2 * math.atan(36 / 2 / cam_data.lens)
aspect = W / H
dist = (size * 0.5) / math.tan(fov / 2) * (1.2 if aspect >= 1 else 1.2 / aspect)
cam.location = center + v * dist
cam.rotation_euler = (center - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam_data.clip_end = dist * 10


def area(name, loc, energy, s, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'AREA')
    ld.energy = energy
    ld.size = s
    ld.color = color
    lo_ = bpy.data.objects.new(name, ld)
    scene.collection.objects.link(lo_)
    lo_.location = loc
    lo_.rotation_euler = (center - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()


k = size * size
side = Vector((v.y, -v.x, 0)).normalized()
area('principal', center + (v + side * 0.9 + Vector((0, 0, 1.2))).normalized() * size * 1.6, 70 * k, size * 0.9)
area('remplissage', center + (v - side * 1.2 + Vector((0, 0, 0.4))).normalized() * size * 1.8, 22 * k, size * 1.2, (0.9, 0.95, 1))
area('contre-jour', center + (-v + Vector((0, 0, 1.0))).normalized() * size * 1.5, 40 * k, size * 0.8, (1, 0.97, 0.9))

scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print('rendu :', out)
