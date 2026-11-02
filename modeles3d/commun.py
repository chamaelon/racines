"""
Boîte à outils commune aux scripts Blender : assemblage de maillages, motifs peints, export GLB, rendu de vignettes.
Tout est procédural : les modèles se régénèrent par script, sans fichier .blend ni dépendance de licence.
"""
import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Euler, Matrix, Vector

RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SORTIE = os.path.join(RACINE, 'public', 'modeles')


def arguments():
    """Ce qui suit « -- » sur la ligne de commande de Blender."""
    return sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []


def vider():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def hex_rvb(h):
    """#rrggbb vers RVB linéaire, l'espace de travail des couleurs de matériaux Blender."""
    h = h.lstrip('#')
    s = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in s)


# ---- Matériaux

def materiau(nom, couleur='#888888', rugosite=0.8, metal=0.0, image=None, emission=None):
    m = bpy.data.materials.new(nom)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*hex_rvb(couleur), 1)
    p.inputs['Roughness'].default_value = rugosite
    p.inputs['Metallic'].default_value = metal
    if image is not None:
        t = m.node_tree.nodes.new('ShaderNodeTexImage')
        t.image = image
        m.node_tree.links.new(t.outputs['Color'], p.inputs['Base Color'])
    if emission:
        p.inputs['Emission Color'].default_value = (*hex_rvb(emission[0]), 1)
        p.inputs['Emission Strength'].default_value = emission[1]
    return m


# ---- Motifs : chaque motif est une fonction (u, v) -> indice de couleur, peinte avec numpy

def image_motif(nom, couleurs, motif, taille=512, grain=0.05, graine=1):
    """couleurs : liste de #rrggbb ; motif(u, v) renvoie un tableau d'indices. L'origine (0, 0) est en bas à gauche."""
    # Une image neuve est en sRGB : ses pixels se donnent tels quels, sans passer par le linéaire.
    pal = np.array([[int(c.lstrip('#')[i:i + 2], 16) / 255 for i in (0, 2, 4)] for c in couleurs], dtype=np.float32)
    v, u = np.mgrid[0:taille, 0:taille] / taille
    idx = np.asarray(motif(u, v), dtype=np.int32) % len(couleurs)
    rvb = pal[idx]
    if grain:
        # Un grain irrégulier : le bois, la terre et le tissu ne sont jamais d'une couleur unie.
        alea = np.random.default_rng(graine)
        bruit = alea.normal(1, grain, (taille // 4 + 1, taille // 4 + 1))
        bruit = np.kron(bruit, np.ones((4, 4)))[:taille, :taille]
        rvb = np.clip(rvb * bruit[..., None] * alea.normal(1, grain * 0.4, (taille, taille, 1)), 0, 1)
    px = np.concatenate([rvb, np.ones((taille, taille, 1), dtype=np.float32)], axis=2).astype(np.float32)
    im = bpy.data.images.new(nom, taille, taille, alpha=False)
    im.pixels.foreach_set(px.ravel())
    im.pack()
    return im


def bandes(u, v, n=8, axe='v', ordre=None):
    x = u if axe == 'u' else v
    i = np.floor(x * n).astype(int)
    return np.take(ordre, i % len(ordre)) if ordre else i


def chevrons(u, v, n=6, m=6):
    """Zigzags horizontaux."""
    return np.floor(v * n + np.abs((u * m) % 1 - 0.5) * 2).astype(int)


def damier(u, v, n=8, m=8):
    return (np.floor(u * n) + np.floor(v * m)).astype(int) % 2


def triangles(u, v, n=8, m=4):
    """Rangées de triangles : les dents de scie des peintures et des masques-planches."""
    fx, fy = (u * n) % 1, (v * m) % 1
    return ((np.abs(fx - 0.5) * 2 < fy) * 1 + np.floor(v * m).astype(int) % 2 * 2).astype(int)


def losanges(u, v, n=6, m=6):
    fx, fy = np.abs((u * n) % 1 - 0.5), np.abs((v * m) % 1 - 0.5)
    return ((fx + fy) < 0.32).astype(int)


def points(u, v, n=10, m=10, r=0.26):
    fx, fy = (u * n) % 1 - 0.5, (v * m) % 1 - 0.5
    return (fx * fx + fy * fy < r * r).astype(int)


def cercles(u, v, n=4, m=4, r1=0.42, r2=0.28):
    fx, fy = (u * n) % 1 - 0.5, (v * m) % 1 - 0.5
    d = np.sqrt(fx * fx + fy * fy)
    return ((d < r1) & (d > r2)).astype(int)


def superposer(*couches):
    """Couches [(condition, indice)] : la dernière vraie gagne. Pour composer des frises."""
    def f(u, v):
        res = np.zeros_like(u, dtype=np.int32)
        for cond, val in couches:
            c = cond(u, v)
            res = np.where(c, val(u, v) if callable(val) else val, res)
        return res
    return f


# ---- Assembleur : un seul maillage, plusieurs matériaux, poids d'os facultatifs

class Assembleur:
    def __init__(self, nom):
        self.nom = nom
        self.bm = bmesh.new()
        self.uv = self.bm.loops.layers.uv.verify()
        self.deform = self.bm.verts.layers.deform.verify()
        self.materiaux = []
        self.groupes = []

    def _mat(self, m):
        if m not in self.materiaux:
            self.materiaux.append(m)
        return self.materiaux.index(m)

    def _groupe(self, g):
        if g not in self.groupes:
            self.groupes.append(g)
        return self.groupes.index(g)

    def _peser(self, verts, os_):
        if not os_:
            return
        for v in verts:
            if isinstance(os_, str):
                v[self.deform][self._groupe(os_)] = 1.0
            else:
                for nom, poids in os_(v.co).items():
                    v[self.deform][self._groupe(nom)] = poids

    def tour(self, profil, mat, m=Matrix(), seg=16, os_=None, lisse=True, uv_rep=(1, 1), bouche=True, ellipse=(1, 1)):
        """Tour : profil [(rayon, hauteur), ...] de bas en haut, autour de Z."""
        anneaux = []
        idx = self._mat(mat)
        for r, z in profil:
            an = []
            for i in range(seg):
                a = 2 * math.pi * i / seg
                an.append(self.bm.verts.new(m @ Vector((r * ellipse[0] * math.cos(a), r * ellipse[1] * math.sin(a), z))))
            anneaux.append(an)
        self._peser([v for a in anneaux for v in a], os_)
        cumul = [0]
        for a, b in zip(profil, profil[1:]):
            cumul.append(cumul[-1] + math.hypot(a[0] - b[0], a[1] - b[1]))
        total = cumul[-1] or 1
        for j in range(len(profil) - 1):
            for i in range(seg):
                i2 = (i + 1) % seg
                f = self.bm.faces.new((anneaux[j][i], anneaux[j][i2], anneaux[j + 1][i2], anneaux[j + 1][i]))
                f.material_index = idx
                f.smooth = lisse
                # Le dernier quartier de tour pose la couture à l'arrière.
                us = (i / seg, (i + 1) / seg)
                vs = (cumul[j] / total, cumul[j + 1] / total)
                for l, (a, b) in zip(f.loops, ((us[0], vs[0]), (us[1], vs[0]), (us[1], vs[1]), (us[0], vs[1]))):
                    l[self.uv].uv = (a * uv_rep[0], b * uv_rep[1])
        if bouche:
            for anneau, rayon in ((anneaux[0], profil[0][0]), (anneaux[-1], profil[-1][0])):
                if rayon > 1e-4:
                    f = self.bm.faces.new(anneau if anneau is anneaux[-1] else list(reversed(anneau)))
                    f.material_index = idx
                    f.smooth = False
                    for l, v in zip(f.loops, f.verts):
                        l[self.uv].uv = (0.02, 0.02)
        return self

    def boule(self, r, mat, centre=(0, 0, 0), echelle=(1, 1, 1), os_=None, seg=14, anneaux=9, tourne=(0, 0, 0)):
        prof = [(max(1e-4, r * math.sin(math.pi * i / anneaux)), -r * math.cos(math.pi * i / anneaux)) for i in range(anneaux + 1)]
        m = Matrix.Translation(centre) @ Euler(tourne).to_matrix().to_4x4() @ Matrix.Diagonal((*echelle, 1))
        return self.tour(prof, mat, m, seg=seg, os_=os_, bouche=False)

    def cylindre(self, a, b, r1, mat, r2=None, seg=10, os_=None, lisse=True, uv_rep=(1, 1)):
        """Cylindre (ou cône) de la pointe a à la pointe b."""
        a, b = Vector(a), Vector(b)
        d = b - a
        rot = d.to_track_quat('Z', 'Y').to_matrix().to_4x4()
        m = Matrix.Translation(a) @ rot
        return self.tour([(r1, 0), (r2 if r2 is not None else r1, d.length)], mat, m, seg=seg, os_=os_, lisse=lisse, uv_rep=uv_rep)

    def boite(self, centre, taille, mat, tourne=(0, 0, 0), os_=None, uv=(0, 0, 1, 1)):
        """Boîte ; le dessus et les faces latérales reçoivent toute la zone uv."""
        m = Matrix.Translation(centre) @ Euler(tourne).to_matrix().to_4x4() @ Matrix.Diagonal((taille[0] / 2, taille[1] / 2, taille[2] / 2, 1))
        coins = [(-1, -1, -1), (1, -1, -1), (1, 1, -1), (-1, 1, -1), (-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)]
        faces = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
        idx = self._mat(mat)
        vs = [self.bm.verts.new(m @ Vector(c)) for c in coins]
        self._peser(vs, os_)
        carre = ((uv[0], uv[1]), (uv[2], uv[1]), (uv[2], uv[3]), (uv[0], uv[3]))
        for f_ in faces:
            f = self.bm.faces.new([vs[i] for i in f_])
            f.material_index = idx
            for l, c in zip(f.loops, carre):
                l[self.uv].uv = c
        return self

    def grille(self, largeur, hauteur, mat, m=Matrix(), n=(1, 1), hauteur_fn=None, os_=None, uv=(0, 0, 1, 1), lisse=True):
        """Plan dans XZ (face vers -Y), déformable : pour les étoffes, les masques-planches, les peintures et les terrains."""
        idx = self._mat(mat)
        nx, nz = n
        grille = []
        for j in range(nz + 1):
            ligne = []
            for i in range(nx + 1):
                x, z = (i / nx - 0.5) * largeur, j / nz * hauteur
                y = hauteur_fn(x, z) if hauteur_fn else 0
                ligne.append(self.bm.verts.new(m @ Vector((x, y, z))))
            grille.append(ligne)
        self._peser([v for l in grille for v in l], os_)
        for j in range(nz):
            for i in range(nx):
                f = self.bm.faces.new((grille[j][i], grille[j][i + 1], grille[j + 1][i + 1], grille[j + 1][i]))
                f.material_index = idx
                f.smooth = lisse
                for l, (a, b) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                    l[self.uv].uv = (uv[0] + (uv[2] - uv[0]) * a / nx, uv[1] + (uv[3] - uv[1]) * b / nz)
        return self

    def objet(self, nom=None, parent=None):
        me = bpy.data.meshes.new(nom or self.nom)
        self.bm.normal_update()
        self.bm.to_mesh(me)
        self.bm.free()
        for m in self.materiaux:
            me.materials.append(m)
        o = bpy.data.objects.new(nom or self.nom, me)
        bpy.context.scene.collection.objects.link(o)
        for g in self.groupes:
            o.vertex_groups.new(name=g)
        # Les poids posés dans bmesh sont indexés par ordre de création : les groupes suivent le même ordre.
        if parent:
            o.parent = parent
        return o


def recalculer_normales(o):
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    bm.free()
    o.data.update()


# ---- Export

def exporter_glb(chemin, animations=False):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=chemin, export_format='GLB', export_yup=True, export_apply=False,
        export_animations=animations, export_skins=animations, export_image_format='WEBP', export_image_quality=82,
        export_cameras=False, export_lights=False, export_extras=True,
        **({'export_animation_mode': 'ACTIONS', 'export_force_sampling': True, 'export_frame_step': 2} if animations else {}),
    )
    return os.path.getsize(chemin)


# ---- Vignettes : un petit studio à la lumière chaude, rendu par Cycles sur processeur

def boite_englobante(objets):
    mini, maxi = Vector((1e9, 1e9, 1e9)), Vector((-1e9, -1e9, -1e9))
    for o in objets:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            for i in range(3):
                mini[i], maxi[i] = min(mini[i], w[i]), max(maxi[i], w[i])
    return mini, maxi


def studio(objets, fond='#efe0c2', angle=(-25, 18), recul=1.25, cadre=None):
    sc = bpy.context.scene
    mini, maxi = boite_englobante(objets)
    if cadre:
        mini, maxi = Vector(cadre[0]), Vector(cadre[1])
    centre = (mini + maxi) / 2
    rayon = max((maxi - mini).length / 2, 0.01)
    monde = bpy.data.worlds.new('fond')
    monde.use_nodes = True
    monde.node_tree.nodes['Background'].inputs['Color'].default_value = (*hex_rvb(fond), 1)
    monde.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.85
    sc.world = monde
    cam = bpy.data.cameras.new('cam')
    cam.lens = 70
    co = bpy.data.objects.new('cam', cam)
    sc.collection.objects.link(co)
    az, el = math.radians(angle[0]), math.radians(angle[1])
    dist = rayon / math.sin(math.atan(18 / cam.lens)) * recul
    co.location = centre + Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el))) * dist
    co.rotation_euler = (centre - co.location).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = co
    soleil = bpy.data.lights.new('soleil', 'SUN')
    soleil.energy = 3.2
    soleil.angle = math.radians(12)
    soleil.color = (1, 0.93, 0.82)
    so = bpy.data.objects.new('soleil', soleil)
    so.rotation_euler = Euler((math.radians(50), math.radians(-15), math.radians(-35)))
    sc.collection.objects.link(so)
    return [co, so]


def rendre(chemin, taille=384, echantillons=24):
    sc = bpy.context.scene
    sc.view_settings.view_transform = 'Standard'
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = echantillons
    sc.cycles.use_denoising = True
    sc.render.resolution_x = sc.render.resolution_y = taille
    sc.render.image_settings.file_format = 'WEBP'
    sc.render.image_settings.quality = 82
    sc.render.filepath = chemin
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    bpy.ops.render.render(write_still=True)
