"""Convertit les maillages statiques de la porte 1801020 (.glb de scripts/export-porte.mjs) en FBX.

Usage (module bpy de Blender, ex. pip install bpy dans un venv) :
    node scripts/export-porte.mjs
    python tools/blender_porte_fbx.py public/equipment/porte-1801020/unreal

Chaque SM_Porte_*.glb du dossier donne un SM_Porte_*.fbx : même maillage, mêmes sections de matériau,
même origine (le pivot du corps). Unités : centimètres (échelle FBX), comme Unreal. Le FBX est relu
après l'export pour comparer sa boîte à celle du .glb.
"""
import glob
import os
import sys

import bpy
from mathutils import Vector


def boite():
    pts = [o.matrix_world @ Vector(c) for o in bpy.data.objects if o.type == 'MESH' for c in o.bound_box]
    return [round(f(p[i] for p in pts), 4) for f in (min, max) for i in range(3)]


dossier = sys.argv[1]
for src in sorted(glob.glob(os.path.join(dossier, 'SM_Porte_*.glb'))):
    dst = src[:-4] + '.fbx'
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=src)
    avant = boite()
    bpy.ops.export_scene.fbx(
        filepath=dst, use_selection=False, object_types={'MESH'}, mesh_smooth_type='FACE',
        bake_anim=False, apply_unit_scale=True, apply_scale_options='FBX_SCALE_ALL', axis_forward='-Z', axis_up='Y',
    )
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=dst)
    apres = boite()
    objets = [(o.name, len(o.data.polygons), [m.name for m in o.data.materials], tuple(round(x, 4) for x in o.location)) for o in bpy.data.objects if o.type == 'MESH']
    ok = all(abs(a - b) < 1e-3 for a, b in zip(avant, apres))
    print(('✓' if ok else '✕'), os.path.basename(dst), f'{os.path.getsize(dst) / 1e3:.0f} ko', 'boîte (m)', apres, objets)
    if not ok:
        print('  boîte du .glb :', avant)
        sys.exit(1)
