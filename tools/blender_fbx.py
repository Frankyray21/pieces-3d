"""Convertit la foreuse animée (.glb de scripts/export-anim.mjs) en FBX pour Unreal Engine.

Usage (module bpy de Blender, ex. pip install bpy dans un venv) :
    node scripts/export-anim.mjs /tmp/stm-1500-foreuse-animee.glb
    python tools/blender_fbx.py /tmp/stm-1500-foreuse-animee.glb /tmp/stm-1500-foreuse-animee.fbx

Le FBX contient le maillage à squelette et une prise (take) par séquence, clés à chaque image.
Unités : le fichier est en centimètres (échelle FBX), comme Unreal ; os sans os de bout ajoutés.
"""
import sys

import bpy

src, dst = sys.argv[1], sys.argv[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps = 30  # avant l'import : les clés du glTF (en secondes) sont posées à cette cadence
bpy.ops.import_scene.gltf(filepath=src)
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
# L'import ajoute une petite sphère (forme d'affichage des os) : seuls les maillages à squelette sont exportés.
for o in [o for o in bpy.data.objects if o.type == 'MESH' and not o.vertex_groups]:
    bpy.data.objects.remove(o, do_unlink=True)
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
print('armature', arm.name, 'os', len(arm.data.bones), 'maillages', [(m.name, len(m.data.vertices), len(m.data.polygons)) for m in meshes])
print('actions', [(a.name, tuple(a.frame_range)) for a in bpy.data.actions])
bpy.ops.export_scene.fbx(
    filepath=dst, use_selection=False, object_types={'ARMATURE', 'MESH'},
    add_leaf_bones=False, use_armature_deform_only=False, mesh_smooth_type='FACE',
    bake_anim=True, bake_anim_use_all_actions=True, bake_anim_use_nla_strips=False, bake_anim_use_all_bones=True,
    bake_anim_simplify_factor=0.0, bake_anim_force_startend_keying=True,
    apply_unit_scale=True, apply_scale_options='FBX_SCALE_ALL', axis_forward='-Z', axis_up='Y',
)
print('écrit', dst)
