"""
Les personnages, en marionnettes de bois peint articulées. Lancer : blender -b --python modeles3d/personnages.py -- [styles...]
Produit public/modeles/personnages/<style>.glb (repos, parle, marche, monte), films3d/modeles/<style>.glb (tous les gestes) et public/modeles/portraits/<style>.webp
Les styles reprennent ceux de src/scenes/personnages.js : mêmes noms, mêmes couleurs.

Tous les os sont verticaux et de même orientation, pour que les poses s'écrivent dans un seul repère :
rx > 0 envoie un membre pendant vers l'arrière, rz > 0 l'écarte vers +X, le personnage regarde vers -Y.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import bpy
import numpy as np
from mathutils import Matrix, Vector

from commun import (Assembleur, SORTIE, arguments, exporter_glb, image_motif, materiau as M, points, recalculer_normales, rendre, studio, vider)
from formes import cheval, tube

SORTIE_FILMS = os.path.join(os.path.dirname(__file__), '..', 'films3d', 'modeles')
GESTES_DU_JEU = {'repos', 'parle', 'marche', 'monte'}

STYLES = {
    'roi': dict(skin='#5a3825', tunic='#2f3f8f', stripes=['#2f3f8f', '#e9e1cf', '#2f3f8f', '#1d2a66'], wide=1, long=1, head='bonnet', acc='baton'),
    'guerriere': dict(skin='#6b4329', tunic='#b8322a', stripes=['#b8322a', '#e0a43a', '#1a1209', '#b8322a'], pants='#3a2416', head='bandeau', acc='lance', femme=1),
    'chasseur': dict(skin='#4e3020', tunic='#7a5a33', dots='#2a1a0c', pants='#5a3d1c', head='chapeau', acc='arc'),
    'enfant': dict(skin='#6b4329', tunic='#e0a43a', stripes=['#e0a43a', '#fbf1dc'], child=1),
    'griot': dict(skin='#5a3825', tunic='#e9e1cf', stripes=['#e9e1cf', '#8a5a12', '#e9e1cf', '#7a3b1d'], wide=1, long=1, head='bonnet', bonnet='#8a5a12', acc='baton'),
    'marchande': dict(skin='#6b4329', tunic='#1f6f6b', stripes=['#1f6f6b', '#e0a43a', '#1f6f6b', '#fbf1dc'], long=1, wide=1, head='foulard', femme=1),
    'lievre': dict(skin='#b9a58a', tunic='#c9652a', stripes=['#c9652a', '#e9c079'], pants='#6a4a1e', head='lievre'),
    'hyene': dict(skin='#8f7a58', tunic='#5b5140', dots='#2a2418', pants='#3e3626', wide=1, head='hyene'),
    'femme': dict(skin='#6b4329', tunic='#8f3a2a', stripes=['#8f3a2a', '#e0a43a', '#2f3f8f'], long=1, wide=1, head='foulard', femme=1),
    'jeune_fille': dict(skin='#70482c', tunic='#c9652a', stripes=['#c9652a', '#fbf1dc'], long=1, head='tresses', femme=1),
    'vieille': dict(skin='#5a3825', tunic='#5b3a6b', stripes=['#5b3a6b', '#d9c9a8'], long=1, wide=1, head='foulard', foulard='#e9e1cf', acc='baton', femme=1),
    'griotte': dict(skin='#5a3825', tunic='#e9e1cf', stripes=['#e9e1cf', '#a3201b', '#e9e1cf', '#e0a43a'], long=1, wide=1, head='tresses', femme=1),
    'reine': dict(skin='#5a3825', tunic='#7a1f4a', stripes=['#7a1f4a', '#e2b33c', '#7a1f4a', '#fbf1dc'], long=1, wide=1, head='couronne', femme=1),
    'guerrier': dict(skin='#5a3825', tunic='#8a2a1b', stripes=['#8a2a1b', '#1a1209'], pants='#3a2416', head='bandeau', acc='lance'),
    'ancien': dict(skin='#4e3020', tunic='#d9d2c0', stripes=['#d9d2c0', '#6a6a6a'], long=1, wide=1, head='bonnet', bonnet='#6a6a6a', acc='baton', barbe=1),
    'paysan': dict(skin='#5a3825', tunic='#a8743c', stripes=['#a8743c', '#6a4a1e'], pants='#6a4a1e', head='chapeau'),
    'jeune': dict(skin='#6b4329', tunic='#2c6e49', stripes=['#2c6e49', '#e9e1cf'], pants='#3a2416'),
    'forgeron': dict(skin='#3f261a', tunic='#3e3626', pants='#2a2418', wide=1, acc='marteau'),
    'cavalier': dict(skin='#5a3825', tunic='#b8622a', stripes=['#b8622a', '#3a2416'], pants='#3a2416', head='turban', turban='#3a2416', acc='lance'),
    'garde': dict(skin='#4e3020', tunic='#1d2a66', pants='#141c47', head='chechia', acc='lance'),
    'commandant': dict(skin='#e4c7a8', tunic='#d8cfa8', pants='#b8ae84', head='casque'),
    'explorateur': dict(skin='#e4c7a8', tunic='#9a8450', pants='#6a5a2c', head='casque', acc='baton'),
    'marabout': dict(skin='#5a3825', tunic='#f0ead8', long=1, wide=1, head='turban', turban='#f8f4e8', barbe=1),
    'devin': dict(skin='#4e3020', tunic='#47306b', dots='#e0a43a', long=1, wide=1, head='bonnet', bonnet='#e0a43a', acc='baton'),
    'genie': dict(skin='#3f6f9a', tunic='#264a7a', dots='#8fd0e8', head='genie', yeux='#ffe27a'),
    'esprit': dict(skin='#7a7f86', tunic='#5a5f66', dots='#3e4248', wide=1, head='genie', yeux='#ffb35a'),
    'createur': dict(skin='#c99a3a', tunic='#f2d774', stripes=['#f2d774', '#fff6d0'], long=1, wide=1, head='halo'),
    'masque': dict(skin='#6b4a2a', tunic='#4f7f2a', feuilles=1, long=1, wide=1, head='masque'),
    'gazelle': dict(skin='#c9975a', tunic='#c9975a', pants='#a87a42', head='gazelle'),
    'cameleon': dict(skin='#5f9a3a', tunic='#4f8a2f', dots='#a4c94a', pants='#3f6f2a', head='cameleon'),
    'elephant': dict(skin='#8a8f96', tunic='#7a7f86', pants='#6a6f76', wide=1, head='elephant', echelle=1.12),
    'crapaud': dict(skin='#7f9a3a', tunic='#6f8a32', dots='#4f6321', pants='#566b26', wide=1, head='crapaud', echelle=.86),
    'crocodile': dict(skin='#4f7a4a', tunic='#3f6a3e', dots='#2a4a2c', pants='#2f5a3a', head='crocodile'),
    'araignee': dict(skin='#3a2a3a', tunic='#2a1f2a', dots='#7a5a7a', pattes=1, head='araignee', echelle=.9),
    'serpent': dict(skin='#8f8f3a', tunic='#7a7a2a', dots='#3e3e12', head='serpent'),
}

# Le nom du style -> les os : (position du pivot, parent)
OS = {
    'racine': ((0, 0, .92), None), 'bassin': ((0, 0, .92), 'racine'), 'ventre': ((0, 0, 1.02), 'bassin'), 'torse': ((0, 0, 1.2), 'ventre'), 'cou': ((0, 0, 1.44), 'torse'), 'tete': ((0, 0, 1.5), 'cou'), 'machoire': ((0, -.02, 1.54), 'tete'),
    'bras.G': ((.21, 0, 1.39), 'torse'), 'avbras.G': ((.25, 0, 1.12), 'bras.G'), 'main.G': ((.27, -.02, .88), 'avbras.G'),
    'bras.D': ((-.21, 0, 1.39), 'torse'), 'avbras.D': ((-.25, 0, 1.12), 'bras.D'), 'main.D': ((-.27, -.02, .88), 'avbras.D'),
    'cuisse.G': ((.09, 0, .9), 'bassin'), 'jambe.G': ((.09, 0, .48), 'cuisse.G'), 'cuisse.D': ((-.09, 0, .9), 'bassin'), 'jambe.D': ((-.09, 0, .48), 'cuisse.D'),
}
OS_CHEVAL = {
    'corps': ((0, 0, 1.15), None), 'cou': ((.42, 0, 1.28), 'corps'), 'tete': ((.82, 0, 1.76), 'cou'), 'queue': ((-.58, 0, 1.33), 'corps'),
    'av_d_h': ((.36, -.15, 1.14), 'corps'), 'av_d_b': ((.36, -.15, .5), 'av_d_h'), 'av_g_h': ((.36, .15, 1.14), 'corps'), 'av_g_b': ((.36, .15, .5), 'av_g_h'),
    'ar_d_h': ((-.38, -.15, 1.14), 'corps'), 'ar_d_b': ((-.38, -.15, .5), 'ar_d_h'), 'ar_g_h': ((-.38, .15, 1.14), 'corps'), 'ar_g_b': ((-.38, .15, .5), 'ar_g_h'),
}


def armature(table):
    arm = bpy.data.armatures.new('squelette')
    o = bpy.data.objects.new('squelette', arm)
    bpy.context.scene.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    for nom, (p, _) in table.items():
        e = arm.edit_bones.new(nom)
        e.head = p
        e.tail = (p[0], p[1], p[2] + .08)
        e.roll = 0
    for nom, (_, parent) in table.items():
        if parent:
            arm.edit_bones[nom].parent = arm.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    for b in o.pose.bones:
        b.rotation_mode = 'XYZ'
    return o


def poser(o, action, images):
    """images : [(trame, {os: (rx, ry, rz) en degrés, ou 'z': décalage vertical})]"""
    o.animation_data_create()
    act = bpy.data.actions.new(action)
    act.use_fake_user = True
    o.animation_data.action = act
    noms = sorted({k for _, p in images for k in p})
    for trame, pose in images:
        for nom in noms:
            if nom == 'z':
                continue
            b = o.pose.bones[nom]
            r = pose.get(nom, (0, 0, 0))
            b.rotation_euler = tuple(math.radians(x) for x in r)
            b.keyframe_insert('rotation_euler', frame=trame, group=nom)
        if 'z' in noms:
            b = o.pose.bones['racine']
            b.location = (0, pose.get('z', 0), 0)  # axe Y de l'os = verticale du monde
            b.keyframe_insert('location', frame=trame, group='racine')


def animer_humain(o):
    cote = {'bras.G': (2, 0, 7), 'bras.D': (2, 0, -7), 'avbras.G': (-10, 0, 0), 'avbras.D': (-10, 0, 0)}
    def repos(tete=0, souffle=0):
        return {**cote, 'torse': (souffle, 0, 0), 'ventre': (souffle * .5, 0, 0), 'tete': (souffle * .6, tete, 0), 'machoire': (0, 0, 0), 'bras.G': (2 + souffle, 0, 7), 'bras.D': (2 + souffle, 0, -7)}
    poser(o, 'repos', [(1, repos(-4, -1)), (30, repos(4, 1.4)), (60, repos(-4, -1))])

    def parle(t, ouvert, geste, hoche):
        return {**repos(), 'machoire': (ouvert, 0, 0), 'tete': (hoche, 5 * math.sin(t), 0), 'torse': (hoche * .3, 3 * math.sin(t), 0),
                'bras.D': (-14 - 26 * geste, 0, -14 - 8 * geste), 'avbras.D': (-46 - 34 * geste, 0, 8)}
    im = []
    n = 40
    for k in range(0, n + 1, 4):
        t = k / n * 2 * math.pi
        im.append((k + 1, parle(t, 16 * abs(math.sin(t * 3.5)) if k < n else 0, .5 + .5 * math.sin(t), 3 * math.sin(t * 2))))
    im[-1] = (n + 1, parle(2 * math.pi, 0, .5, 0))
    poser(o, 'parle', im)

    def marche(k):
        a = math.sin(k) * 25
        return {'cuisse.G': (-a, 0, 0), 'cuisse.D': (a, 0, 0), 'jambe.G': (max(0, math.sin(k + 1.4)) * 42, 0, 0), 'jambe.D': (max(0, math.sin(k + 1.4 + math.pi)) * 42, 0, 0),
                'bras.G': (a * .7, 0, 6), 'bras.D': (-a * .7, 0, -6), 'avbras.G': (-16, 0, 0), 'avbras.D': (-16, 0, 0), 'torse': (-2, -a * .12, 0), 'tete': (0, a * .08, 0), 'z': abs(math.cos(k)) * .025 - .012}
    poser(o, 'marche', [(i + 1, marche(i / 28 * 2 * math.pi)) for i in range(0, 29, 2)])

    monte = {'cuisse.G': (-58, 0, 20), 'cuisse.D': (-58, 0, -20), 'jambe.G': (62, 0, 0), 'jambe.D': (62, 0, 0), 'bras.G': (-28, 0, 8), 'bras.D': (-28, 0, -8), 'avbras.G': (-48, 0, 0), 'avbras.D': (-48, 0, 0), 'torse': (-10, 0, 0)}
    poser(o, 'monte', [(1, monte), (10, {**monte, 'torse': (-16, 0, 0)}), (20, monte)])
    animer_gestes_film(o, cote)
    o.animation_data.action = bpy.data.actions['repos']


def animer_gestes_film(o, cote):
    """Les gestes des films (films3d/) : le jeu ne se sert que de repos, parle, marche et monte."""
    def cycle(nom, n, pose, pas=2):
        poser(o, nom, [(i + 1, pose(i / n * 2 * math.pi)) for i in range(0, n + 1, pas)])

    def tenue(nom, pose, souffle=1.2):
        """Une attitude tenue, qui respire un peu pour ne pas se figer."""
        def s(k):
            return {**pose, 'torse': tuple(a + (b * k) for a, b in zip(pose.get('torse', (0, 0, 0)), (souffle, 0, 0)))}
        poser(o, nom, [(1, s(-1)), (30, s(1)), (60, s(-1))])

    def court(k):
        a = math.sin(k) * 44
        return {'cuisse.G': (-a - 8, 0, 0), 'cuisse.D': (a - 8, 0, 0), 'jambe.G': (max(0, math.sin(k + 1.3)) * 78 + 8, 0, 0), 'jambe.D': (max(0, math.sin(k + 1.3 + math.pi)) * 78 + 8, 0, 0),
                'bras.G': (a * .8, 0, 8), 'bras.D': (-a * .8, 0, -8), 'avbras.G': (-72, 0, 0), 'avbras.D': (-72, 0, 0), 'torse': (12, -a * .16, 0), 'tete': (-8, a * .08, 0), 'z': abs(math.cos(k)) * .07 - .03}
    cycle('court', 16, court)

    # Le pilon monte des deux mains au-dessus de la tête, puis tombe : le choc arrive à mi-cycle.
    def pile(k):
        h = .5 + .5 * math.cos(k)
        return {'bras.G': (-48 - 106 * h, 0, -3), 'bras.D': (-48 - 106 * h, 0, 3), 'avbras.G': (-44 + 22 * h, 0, 0), 'avbras.D': (-44 + 22 * h, 0, 0),
                'torse': (15 - 21 * h, 0, 0), 'ventre': (5 - 7 * h, 0, 0), 'tete': (-10 * h, 0, 0), 'cuisse.G': (-10 * (1 - h), 0, 4), 'cuisse.D': (-10 * (1 - h), 0, -4), 'jambe.G': (17 * (1 - h), 0, 0), 'jambe.D': (17 * (1 - h), 0, 0), 'z': -.035 * (1 - h)}
    cycle('pile', 24, pile)

    jambes_assises = {'cuisse.G': (-86, 0, 8), 'cuisse.D': (-86, 0, -8), 'jambe.G': (84, 0, 0), 'jambe.D': (84, 0, 0), 'z': -.42}
    tenue('assis', {**jambes_assises, 'bras.G': (-34, 0, 6), 'bras.D': (-34, 0, -6), 'avbras.G': (-40, 0, 0), 'avbras.D': (-40, 0, 0), 'torse': (8, 0, 0), 'tete': (2, 0, 0)})
    # Assis, un bras s'étire au-dessus de la tête ; le menton s'ouvre sur un bâillement.
    tenue('assis_etire', {**jambes_assises, 'bras.D': (-168, 0, -6), 'avbras.D': (-8, 0, 0), 'bras.G': (-30, 0, 6), 'avbras.G': (-50, 0, 0), 'torse': (-6, 0, -4), 'tete': (-14, 0, 0), 'machoire': (14, 0, 0)})
    tenue('assis_blesse', {**jambes_assises, 'bras.D': (-62, 0, 22), 'avbras.D': (-92, 0, 28), 'bras.G': (-58, 0, -24), 'avbras.G': (-94, 0, -30), 'torse': (24, 0, 0), 'tete': (8, 0, 0), 'machoire': (12, 0, 0)}, souffle=3)
    tenue('assis_parle', {**jambes_assises, 'bras.D': (-40, 0, -14), 'avbras.D': (-70, 0, 8), 'bras.G': (-34, 0, 6), 'avbras.G': (-40, 0, 0), 'torse': (6, 0, 0), 'machoire': (9, 0, 0)})

    # Debout, le corps se courbe sur une main blessée, avec un tremblement.
    cycle('blesse', 10, lambda k: {'bras.D': (-62, 0, 22), 'avbras.D': (-92, 0, 28), 'bras.G': (-58, 0, -24), 'avbras.G': (-94, 0, -30), 'torse': (22 + math.sin(k) * 2, math.sin(k * 2) * 1.5, 0), 'tete': (8, 0, 0), 'machoire': (10, 0, 0), 'cuisse.G': (-14, 0, 0), 'cuisse.D': (-14, 0, 0), 'jambe.G': (22, 0, 0), 'jambe.D': (22, 0, 0), 'z': -.03})
    tenue('effroi', {'bras.G': (-98, 0, -26), 'bras.D': (-98, 0, 26), 'avbras.G': (-118, 0, 0), 'avbras.D': (-118, 0, 0), 'torse': (-6, 0, 0), 'tete': (-6, 0, 0), 'machoire': (16, 0, 0)}, souffle=2.4)
    cycle('bras_leves', 60, lambda k: {'bras.G': (-158 - 7 * math.sin(k), 0, -20), 'bras.D': (-158 - 7 * math.sin(k), 0, 20), 'avbras.G': (-12, 0, 0), 'avbras.D': (-12, 0, 0), 'torse': (-7, 0, 0), 'tete': (-22, 0, 0), 'machoire': (6 + 6 * math.sin(k * 3), 0, 0)}, pas=4)
    tenue('tend_main', {**cote, 'bras.D': (-82, 0, -6), 'avbras.D': (-8, 0, 0), 'torse': (5, 0, 0)})
    tenue('offre', {'bras.G': (-68, 0, -8), 'bras.D': (-68, 0, 8), 'avbras.G': (-32, 0, 0), 'avbras.D': (-32, 0, 0), 'torse': (9, 0, 0), 'tete': (3, 0, 0)})
    tenue('incline', {**cote, 'torse': (40, 0, 0), 'ventre': (10, 0, 0), 'tete': (8, 0, 0)})
    tenue('regarde_haut', {**cote, 'tete': (-30, 0, 0), 'torse': (-6, 0, 0)})
    tenue('tete_basse', {**cote, 'tete': (30, 0, 0), 'torse': (14, 0, 0), 'bras.G': (-2, 0, 4), 'bras.D': (-2, 0, -4)})
    # Le corps entier se penche pour cueillir : la main droite va et vient vers le sol.
    cycle('cueille', 40, lambda k: {'torse': (58 + 4 * math.sin(k), 0, 0), 'ventre': (20, 0, 0), 'bras.D': (-66 - 16 * math.sin(k), 0, -4), 'avbras.D': (-14, 0, 0), 'bras.G': (-24, 0, 6), 'avbras.G': (-30, 0, 0), 'cuisse.G': (-22, 0, 0), 'cuisse.D': (-22, 0, 0), 'jambe.G': (28, 0, 0), 'jambe.D': (28, 0, 0), 'z': -.05})
    # Les deux bras levés portent quelqu'un ou quelque chose au-dessus de la tête.
    tenue('souleve', {'bras.G': (-160, 0, -8), 'bras.D': (-160, 0, 8), 'avbras.G': (-18, 0, 0), 'avbras.D': (-18, 0, 0), 'torse': (-8, 0, 0), 'tete': (-24, 0, 0), 'machoire': (10, 0, 0)})

    # La lutte de deux hommes : un bras pousse, puis l'autre.
    cycle('lutte', 28, lambda k: {'bras.D': (-74 - 28 * math.sin(k), 0, 6), 'avbras.D': (-38 + 28 * math.sin(k), 0, 0), 'bras.G': (-74 + 28 * math.sin(k), 0, -6), 'avbras.G': (-38 - 28 * math.sin(k), 0, 0), 'torse': (15 + 6 * math.sin(k), 10 * math.sin(k), 0), 'cuisse.G': (-22, 0, 8), 'cuisse.D': (14, 0, -8), 'jambe.G': (20, 0, 0), 'jambe.D': (8, 0, 0), 'tete': (-6, 0, 0), 'machoire': (8 + 6 * math.sin(k * 2), 0, 0), 'z': -.03})
    # Le bâton se lève puis s'abat une fois par cycle.
    cycle('frappe', 40, lambda k: {'bras.D': (-164 * (.5 + .5 * math.cos(k)) - 44, 0, -6), 'avbras.D': (-22, 0, 0), 'bras.G': (2, 0, 16), 'avbras.G': (-24, 0, 0), 'torse': (16 * (1 - (.5 + .5 * math.cos(k))) - 8, 0, 0), 'tete': (-4, 0, 0), 'machoire': (6, 0, 0)})

    def danse(k):
        return {'cuisse.G': (-30 * max(0, math.sin(k)), 0, 10), 'cuisse.D': (-30 * max(0, -math.sin(k)), 0, -10), 'jambe.G': (50 * max(0, math.sin(k)), 0, 0), 'jambe.D': (50 * max(0, -math.sin(k)), 0, 0),
                'bras.G': (-98 - 56 * math.sin(k), 0, 34), 'bras.D': (-98 + 56 * math.sin(k), 0, -34), 'avbras.G': (-44, 0, 0), 'avbras.D': (-44, 0, 0), 'torse': (5, 14 * math.sin(k), 7 * math.sin(k)), 'tete': (-6, -8 * math.sin(k), 0), 'machoire': (9, 0, 0), 'z': abs(math.sin(k)) * .1}
    cycle('danse', 24, danse)

    # À quatre pattes, pour la hyène et les bêtes qui rôdent.
    def rampe(k):
        a = math.sin(k) * 22
        return {'bassin': (0, 0, 0), 'ventre': (46, 0, 0), 'torse': (38, 0, 0), 'cou': (-26, 0, 0), 'tete': (-32, 0, 0),
                'cuisse.G': (-72 - a, 0, 8), 'cuisse.D': (-72 + a, 0, -8), 'jambe.G': (102, 0, 0), 'jambe.D': (102, 0, 0),
                'bras.G': (-64 + a, 0, 6), 'bras.D': (-64 - a, 0, -6), 'avbras.G': (-8, 0, 0), 'avbras.D': (-8, 0, 0), 'z': -.5}
    cycle('rampe', 28, rampe)
    # Allongé sur le dos, bras le long du corps : le film couche le personnage en entier.
    tenue('allonge', {**cote, 'tete': (-8, 0, 0)}, souffle=.8)


def tete_humaine(a, st, peau):
    no, bl = M('sombre', '#17110c', .4), M('blanc', '#f4efe2', .35)
    a.boule(.112, peau, (0, 0, 1.615), (.92, 1, 1.14), os_='tete', seg=16, anneaux=11)
    a.boule(.078, peau, (0, -.018, 1.52), (.88, .82, .58), os_='machoire', seg=12, anneaux=7)
    a.boule(.058, M('bouche', '#3a1410', .6), (0, -.068, 1.54), (.85, .3, .34), os_='tete', seg=10, anneaux=6)
    a.boule(.022, peau, (0, -.105, 1.6), (.86, .9, 1), os_='tete', seg=9, anneaux=6)
    yeux = M('eclat', st['yeux'], emission=(st['yeux'], 2.5)) if st.get('yeux') else None
    for s in (-1, 1):
        a.boule(.024, bl, (s * .043, -.088, 1.64), (1.15, .55, .86), os_='tete', seg=9, anneaux=6)
        a.boule(.0125, yeux or no, (s * .043, -.1, 1.64), (1, .4, 1), os_='tete', seg=8, anneaux=5)
        a.boite((s * .043, -.1, 1.672), (.05, .012, .012), no, tourne=(0, s * -.1, 0), os_='tete')
        a.boule(.024, peau, (s * .106, 0, 1.615), (.45, .8, 1.2), os_='tete', seg=8, anneaux=5)


def tete_animal(a, st, peau):
    nom = st['head']
    no, bl = M('sombre', '#17110c', .4), M('blanc', '#f4efe2', .35)
    T = 'tete'
    def yeux(x, y, z, r=.024):
        for s in (-1, 1):
            a.boule(r, bl, (s * x, y, z), (1, .8, 1), os_=T, seg=9, anneaux=6)
            a.boule(r * .5, no, (s * x, y - r * .75, z), (1, .5, 1), os_=T, seg=7, anneaux=5)
    def museau(l, r, z=1.57, chute=.03):
        a.cylindre((0, -.07, z), (0, -.07 - l, z - chute), r, peau, r2=r * .62, seg=11, os_=T)
        a.boule(r * .66, no, (0, -.07 - l, z - chute), (1, .7, .75), os_=T, seg=8, anneaux=5)
        a.boule(r * .9, peau, (0, -.03 - l * .55, z - chute - r * .75), (.9, 1.6 * l / r * .3, .35), os_='machoire', seg=9, anneaux=5)
    a.boule(.11, peau, (0, 0, 1.62), (.95, 1.02, 1.05), os_=T, seg=15, anneaux=10)
    if nom == 'lievre':
        museau(.08, .05)
        yeux(.05, -.075, 1.65)
        rose = M('oreille', '#d7a58f')
        for s in (-1, 1):
            a.boule(.05, peau, (s * .055, .02, 1.88), (.55, .32, 2.4), os_=T, seg=9, anneaux=7, tourne=(0, s * .12, 0))
            a.boule(.03, rose, (s * .055, .0, 1.88), (.55, .25, 2.5), os_=T, seg=7, anneaux=5, tourne=(0, s * .12, 0))
    elif nom == 'hyene':
        museau(.13, .065, chute=.05)
        yeux(.055, -.07, 1.66)
        tache = M('tache', '#2a2418')
        for s in (-1, 1):
            a.boule(.048, peau, (s * .09, .01, 1.74), (1, .35, 1.1), os_=T, seg=9, anneaux=6)
            a.boule(.018, tache, (s * .09, -.08, 1.6), os_=T, seg=7, anneaux=5)
        for i in range(6):
            a.boite((0, .03 + i * .022, 1.74 - i * .05), (.02, .03, .05), tache, os_='cou' if i > 3 else T)
    elif nom == 'gazelle':
        museau(.12, .045, chute=.05)
        yeux(.052, -.065, 1.65)
        no2 = M('corne', '#2a1d12')
        for s in (-1, 1):
            tube(a, [(s * .04, .02, 1.72), (s * .07, .05, 1.88), (s * .1, .12, 2.02)], [.016, .011, .002], no2, seg=6, os_=T)
            a.boule(.05, peau, (s * .1, .02, 1.7), (.85, .28, .4), os_=T, seg=8, anneaux=5, tourne=(0, s * -.6, 0))
            # Les deux traits sur le museau que raconte le conte
            a.boite((s * .03, -.13, 1.585), (.012, .1, .012), no2, tourne=(-.45, 0, s * .15), os_=T)
    elif nom == 'cameleon':
        museau(.07, .06, chute=.0)
        for s in (-1, 1):
            a.cylindre((s * .08, -.02, 1.67), (s * .12, -.04, 1.67), .036, peau, r2=.024, seg=8, os_=T)
            a.boule(.012, no, (s * .125, -.05, 1.67), os_=T, seg=7, anneaux=5)
        a.tour([(.06, 1.68), (.02, 1.82)], peau, Matrix.Translation((0, .03, 0)), seg=8, os_=T, ellipse=(.5, 1.4))
    elif nom == 'elephant':
        yeux(.058, -.075, 1.66, .02)
        for s in (-1, 1):
            a.boule(.11, peau, (s * .17, .03, 1.65), (1, .16, 1.28), os_=T, seg=10, anneaux=7)
            tube(a, [(s * .05, -.09, 1.54), (s * .06, -.17, 1.5), (s * .05, -.22, 1.54)], [.013, .011, .002], M('ivoire', '#ece0c2', .4), seg=6, os_=T)
        tube(a, [(0, -.09, 1.6), (0, -.15, 1.5), (0, -.15, 1.36), (0, -.2, 1.25), (0, -.27, 1.24)], [.04, .034, .027, .02, .014], peau, seg=9, os_=T)
    elif nom == 'crapaud':
        a.boule(.11, peau, (0, -.03, 1.56), (1.35, 1, .55), os_=T, seg=14, anneaux=8)
        a.boule(.1, M('bouche', '#3a1410', .6), (0, -.075, 1.54), (1.2, .55, .13), os_=T, seg=10, anneaux=6)
        yeux(.08, -.06, 1.7, .04)
    elif nom == 'crocodile':
        a.boite((0, -.17, 1.59), (.13, .26, .05), peau, os_=T)
        a.boite((0, -.17, 1.54), (.12, .25, .035), peau, os_='machoire')
        dent = M('dent', '#f4efe2', .4)
        for i in range(7):
            for s in (-1, 1):
                a.cylindre((s * .056, -.06 - i * .036, 1.565), (s * .056, -.06 - i * .036, 1.54), .009, dent, r2=.001, seg=4, os_=T)
        yeux(.05, -.06, 1.7, .027)
        ec = M('ecaille', '#2a4a2c')
        for i in range(5):
            a.boite((0, -.06 + i * .04, 1.72 - i * .012), (.04, .02, .025), ec, os_=T)
    elif nom == 'araignee':
        for i, (x, z) in enumerate(((.035, 1.66), (.075, 1.64), (.03, 1.62), (.065, 1.595))):
            for s in (-1, 1):
                a.boule(.016 - i * .002, M('oeil', '#e0b84a', .3, emission=('#e0b84a', .8)), (s * x, -.098, z), os_=T, seg=7, anneaux=5)
        for s in (-1, 1):
            tube(a, [(s * .03, -.09, 1.55), (s * .035, -.13, 1.5)], [.016, .002], no, seg=6, os_=T)
    elif nom == 'serpent':
        a.boule(.12, peau, (0, -.05, 1.61), (1.1, 1.3, .62), os_=T, seg=14, anneaux=8)
        yeux(.07, -.12, 1.65, .022)
        tube(a, [(0, -.2, 1.57), (0, -.25, 1.56), (.02, -.29, 1.55)], [.006, .005, .001], M('langue', '#b8322a'), seg=5, os_='machoire')
        ec = M('ecaille', '#3e3e12')
        for i in range(8):
            ang = i * .78
            a.boule(.018, ec, (math.sin(ang) * .08, .01 - math.cos(ang) * .02, 1.69 - (i % 2) * .02), (1, 1, .4), os_=T, seg=7, anneaux=4)


def coiffe(a, st, peau):
    h = st.get('head')
    T = 'tete'
    if h == 'bonnet':
        c = st.get('bonnet', '#8a1f1f')
        a.tour([(.11, 1.68), (.112, 1.74), (.09, 1.82), (.001, 1.84)], M('bonnet', c, .9), seg=14, os_=T)
    elif h == 'bandeau':
        a.boule(.116, M('cheveux', '#120c08', .9), (0, .012, 1.65), (.95, 1, .96), os_=T, seg=13, anneaux=8)
        a.tour([(.112, 1.665), (.112, 1.7)], M('bandeau', '#a3201b'), seg=16, os_=T, bouche=False, ellipse=(.96, 1.02))
        a.boite((-.02, .115, 1.68), (.03, .05, .18), M('bandeau', '#a3201b'), tourne=(.3, 0, 0), os_=T)
    elif h == 'chapeau':
        t = M('paille', '#c9a35c')
        a.tour([(.3, 1.71), (.14, 1.75), (.09, 1.83), (.02, 1.93), (.001, 1.95)], t, seg=18, os_=T, bouche=False)
        a.tour([(.3, 1.71), (.001, 1.72)], t, seg=18, os_=T, bouche=False)
    elif h == 'foulard':
        c = st.get('foulard', '#e0a43a')
        m = M('foulard', c, .9)
        a.boule(.12, m, (0, .015, 1.67), (.98, 1.04, .92), os_=T, seg=14, anneaux=9)
        a.boule(.05, m, (.05, .03, 1.79), (1.2, 1, .7), os_=T, seg=9, anneaux=6)
        a.boule(.035, m, (-.06, .05, 1.78), (1.2, 1, .7), os_=T, seg=8, anneaux=5)
    elif h == 'tresses':
        n = M('cheveux', '#120c08', .85)
        perle = M('perle', '#e0a43a', .35)
        a.boule(.116, n, (0, .014, 1.66), (.96, 1.02, 1), os_=T, seg=13, anneaux=8)
        for i, x in enumerate(np.linspace(-.1, .1, 7)):
            tube(a, [(x, .07, 1.74), (x * 1.15, .1, 1.58), (x * 1.2, .09, 1.45)], [.016, .014, .01], n, seg=5, os_=T)
            a.boule(.012, perle, (x * 1.2, .09, 1.44), os_=T, seg=7, anneaux=5)
    elif h == 'couronne':
        a.boule(.116, M('cheveux', '#120c08', .85), (0, .014, 1.66), (.96, 1.02, 1), os_=T, seg=13, anneaux=8)
        or_ = M('or', '#e2b33c', .3, .9)
        a.tour([(.104, 1.71), (.11, 1.77)], or_, seg=18, os_=T, bouche=False)
        for i in range(8):
            ang = i * math.pi / 4
            a.cylindre((math.cos(ang) * .107, math.sin(ang) * .107, 1.76), (math.cos(ang) * .115, math.sin(ang) * .115, 1.83), .018, or_, r2=.002, seg=5, os_=T)
    elif h == 'turban':
        c = M('turban', st.get('turban', '#f0ead8'), .9)
        for i, z in enumerate((1.7, 1.745, 1.79)):
            a.boule(.118 - i * .018, c, (0, .01, z), (1, 1.04, .42), os_=T, seg=14, anneaux=8, tourne=(.08 * (-1) ** i, 0, 0))
    elif h == 'chechia':
        a.tour([(.1, 1.7), (.098, 1.79), (.075, 1.8), (.001, 1.8)], M('chechia', '#a3201b'), seg=14, os_=T)
        tube(a, [(0, 0, 1.8), (.04, .05, 1.78), (.07, .09, 1.68)], [.005, .005, .007], M('gland', '#1d2a66'), seg=4, os_=T)
    elif h == 'casque':
        t = M('casque', '#e7dfc4', .75)
        a.boule(.135, t, (0, 0, 1.68), (.98, 1.1, .72), os_=T, seg=15, anneaux=9)
        a.tour([(.2, 1.67), (.13, 1.69)], t, seg=18, os_=T, ellipse=(.95, 1.1))
    elif h == 'genie':
        a.tour([(.09, 1.7), (.05, 1.86), (.001, 2.0)], peau, seg=10, os_=T, ellipse=(1, .75))
    elif h == 'halo':
        a.tour([(.16, 1.84), (.2, 1.85), (.16, 1.86), (.135, 1.85), (.16, 1.84)], M('halo', '#ffe27a', emission=('#ffd24a', 3)), seg=26, os_=T, bouche=False)
    elif h == 'masque':
        # Une face de bois, sans autre détail que le décor : on n'y figure aucun masque réel.
        bois = M('bois', image=image_motif('mq', ['#4f2f18', '#e7dcc4', '#8f3321'], lambda u, v: ((np.abs((u * 8) % 1 - .5) < .1) & (v > .3) & (v < .55)) * 1 + (v > .84) * 2, taille=128))
        a.boule(.135, bois, (0, -.04, 1.61), (.86, .55, 1.3), os_=T, seg=14, anneaux=9)
        no = M('sombre', '#17110c', .4)
        for s in (-1, 1):
            a.boule(.026, no, (s * .05, -.112, 1.655), (1.1, .3, .8), os_=T, seg=8, anneaux=5)
        a.boite((0, -.117, 1.57), (.06, .02, .024), no, os_=T)
        feuille = M('feuille', '#4f7f2a', .85)
        for i in range(18):
            ang = i * 2.399
            a.boule(.05, feuille, (math.cos(ang) * .11, .07 + math.sin(ang) * .05, 1.72 + (i % 4) * .04), (1, .4, 1.6), os_=T, seg=6, anneaux=4, tourne=(0, ang, 0))


def accessoire(a, st):
    acc = st.get('acc')
    M_ = 'main.D'
    if acc == 'baton':
        a.cylindre((-.28, -.04, .03), (-.28, -.04, 1.46), .014, M('baton', '#5a3819'), seg=7, os_=M_)
        a.boule(.026, M('pommeau', '#8a5a12'), (-.28, -.04, 1.47), os_=M_, seg=8, anneaux=5)
    elif acc == 'lance':
        a.cylindre((-.28, -.04, .03), (-.28, -.04, 1.9), .012, M('hampe', '#6b4a2a'), seg=7, os_=M_)
        a.cylindre((-.28, -.04, 1.9), (-.28, -.04, 2.1), .03, M('fer', '#b9bbc0', .35, .85), r2=.001, seg=6, os_=M_)
    elif acc == 'arc':
        p = [(.31 + .13 * math.sin(math.pi * i / 8), -.03, .36 + 1.08 * i / 8) for i in range(9)]
        tube(a, p, [.008, .011, .013, .014, .015, .014, .013, .011, .008], M('arc', '#3d2412'), seg=6, os_='main.G')
        a.cylindre((.31, -.03, .36), (.31, -.03, 1.44), .002, M('corde', '#c9b58a'), seg=4, os_='main.G')
    elif acc == 'marteau':
        a.cylindre((-.27, -.04, .84), (-.27, -.32, .92), .016, M('manche', '#6b4a2a'), seg=7, os_=M_)
        a.boite((-.27, -.34, .93), (.07, .1, .06), M('fer', '#4a4a4c', .5, .7), os_=M_)


def construire_personnage(nom):
    st = STYLES[nom]
    vider()
    a = Assembleur(nom)
    peau = M('peau', st['skin'], .55)
    enfant = bool(st.get('child'))
    # L'étoffe : bandes tissées, ou semis de points, ou couleur unie
    if st.get('stripes'):
        cs = st['stripes']
        tex = image_motif(f't-{nom}', cs, lambda u, v: (u * len(cs) * 6).astype(int), taille=256, grain=.04)
        etoffe = M('etoffe', image=tex, rugosite=.9)
    elif st.get('dots'):
        tex = image_motif(f't-{nom}', [st['tunic'], st['dots']], lambda u, v: points(u, v, 10, 12, .22), taille=256, grain=.04)
        etoffe = M('etoffe', image=tex, rugosite=.9)
    else:
        etoffe = M('etoffe', st['tunic'], .9)
    pantalon = M('pantalon', st['pants'], .9) if st.get('pants') else peau
    pied = M('sandale', '#2e1d10', .8)
    large = 1.22 if st.get('wide') else 1
    fem = .9 if st.get('femme') else 1

    def poids_buste(co):
        z = co.z
        if z > 1.26:
            return {'torse': 1}
        if z > 1.12:
            return {'torse': (z - 1.12) / .14, 'ventre': 1 - (z - 1.12) / .14}
        if z > .98:
            return {'ventre': (z - .98) / .14, 'bassin': 1 - (z - .98) / .14}
        return {'bassin': 1}

    # Corps et vêtement
    if st.get('long'):
        b = .3 * large + .02
        a.tour([(b, .06), (b * .85, .3), (.2 * large, .78), (.15 * large * fem, 1.02), (.165 * large, 1.28), (.17 * large, 1.38), (.09, 1.45), (.055, 1.46)], etoffe, seg=20, os_=poids_buste, ellipse=(1, .72), bouche=True)
    else:
        a.tour([(.17 * large, .72), (.155 * large, .94), (.145 * large * fem, 1.08), (.16 * large, 1.3), (.16 * large, 1.38), (.09, 1.45), (.055, 1.46)], etoffe, seg=18, os_=poids_buste, ellipse=(1, .68), bouche=True)
    a.cylindre((0, 0, 1.42), (0, 0, 1.53), .062, peau, seg=12, os_='cou')
    # Jambes
    for s, c in ((1, 'G'), (-1, 'D')):
        if not st.get('long'):
            a.cylindre((s * .09, 0, .88), (s * .09, 0, .48), .088, pantalon, r2=.07, seg=14, os_=f'cuisse.{c}')
            a.boule(.07, pantalon, (s * .09, 0, .48), os_=f'cuisse.{c}', seg=12, anneaux=7)
            a.cylindre((s * .09, 0, .48), (s * .09, 0, .08), .07, pantalon if st.get('pants') and not enfant else peau, r2=.05, seg=12, os_=f'jambe.{c}')
        else:
            a.cylindre((s * .09, 0, .48), (s * .09, 0, .08), .066, peau, r2=.05, seg=12, os_=f'jambe.{c}')
        a.boule(.062, pied, (s * .09, -.055, .04), (.95, 1.8, .65), os_=f'jambe.{c}', seg=9, anneaux=6)
    # Bras
    manche = etoffe
    for s, c in ((1, 'G'), (-1, 'D')):
        epaule = Vector((s * .21, 0, 1.39))
        coude = Vector((s * .25, 0, 1.12))
        poignet = Vector((s * .27, -.02, .88))
        a.boule(.078, manche, tuple(epaule), os_=f'bras.{c}', seg=12, anneaux=8)
        a.cylindre(tuple(epaule), tuple(coude), .07 * (1.2 if st.get('wide') else 1), manche, r2=.058 * (1.35 if st.get('wide') else 1), seg=12, os_=f'bras.{c}')
        if st.get('wide'):
            a.cylindre(tuple(coude), tuple(coude.lerp(poignet, .55)), .08, manche, r2=.095, seg=12, os_=f'avbras.{c}')
        a.cylindre(tuple(coude), tuple(poignet), .054, peau, r2=.042, seg=12, os_=f'avbras.{c}')
        a.boule(.052, peau, tuple(poignet + Vector((0, 0, -.022))), (.85, .7, 1.15), os_=f'main.{c}', seg=9, anneaux=6)
    if st.get('pattes'):
        for s in (-1, 1):
            for i, h in enumerate((1.34, 1.2, 1.06)):
                tube(a, [(s * .14, 0, h), (s * .38, -.02, h + .13), (s * .56, -.03, h - .32)], [.024, .016, .004], M('patte', st['skin']), seg=6, os_='torse')
    if st.get('feuilles'):
        feuille = M('feuille', '#4f7f2a', .85)
        feuille2 = M('feuille2', '#6f9a35', .85)
        for i in range(70):
            ang = i * 2.399
            z = .1 + (i / 70) * 1.3
            r = (.34 * large - .15 * (z / 1.4)) * .95
            a.boule(.075, feuille if i % 2 else feuille2, (math.cos(ang) * r, math.sin(ang) * r * .78, z), (1, .3, 1.6), os_=poids_buste, seg=6, anneaux=4, tourne=(0, 0, -ang))
    if st.get('barbe'):
        a.boule(.06, M('barbe', '#d8d3c8', .9), (0, -.05, 1.45), (.9, .75, 1.35), os_='machoire', seg=9, anneaux=6)

    # Tête : homme ou masque d'animal
    if st.get('head') in ('lievre', 'hyene', 'gazelle', 'cameleon', 'elephant', 'crapaud', 'crocodile', 'araignee', 'serpent'):
        tete_animal(a, st, peau)
    else:
        tete_humaine(a, st, peau)
        coiffe(a, st, peau)
    accessoire(a, st)

    # Des têtes de marionnettes, un peu grandes : le visage reste lisible de loin.
    for v in a.bm.verts:
        if any(a.groupes[g] in ('tete', 'machoire') for g in v[a.deform].keys()):
            v.co = Vector((0, 0, 1.5)) + (v.co - Vector((0, 0, 1.5))) * 1.2
    o = a.objet(nom)
    recalculer_normales(o)
    arm = armature(OS)
    o.parent = arm
    mod = o.modifiers.new('squelette', 'ARMATURE')
    mod.object = arm
    animer_humain(arm)
    bpy.context.scene.frame_set(1)
    echelle = .72 if enfant else st.get('echelle', 1)
    arm.scale = (echelle, echelle, echelle)
    bpy.context.view_layer.update()
    # Les films ont tous les gestes ; le jeu, lui, ne charge que les siens.
    os.makedirs(SORTIE_FILMS, exist_ok=True)
    exporter_glb(os.path.join(SORTIE_FILMS, f'{nom}.glb'), animations=True)
    for action in [x for x in bpy.data.actions if x.name not in GESTES_DU_JEU]:
        bpy.data.actions.remove(action)
    taille = exporter_glb(os.path.join(SORTIE, 'personnages', f'{nom}.glb'), animations=True)
    # Portrait pour la boîte de dialogue
    z0 = 1.3 * echelle
    z1 = 2.05 * echelle
    studio([o], fond='#e9d5ad', angle=(-14, 2), recul=.92, cadre=((-.24 * echelle, -.2, z0), (.24 * echelle, .2, z1)))
    rendre(os.path.join(SORTIE, 'portraits', f'{nom}.webp'), taille=192, echantillons=20)
    print(f'OK {nom} {taille // 1024} Ko', flush=True)


def construire_cheval():
    vider()
    a = Assembleur('cheval')
    os_de = lambda n: n
    cheval(a, M('robe', '#ede6d8', .5), M('crin', '#34241a'), M('sabot', '#2a2019'), os_=os_de)
    tapis = M('tapis', image=image_motif('selle', ['#b8322a', '#e0a43a', '#16110c'], lambda u, v: (v * 8).astype(int), taille=128))
    a.boule(.34, tapis, (-.02, 0, 1.3), (1.05, .86, .62), seg=16, anneaux=9, os_='corps')
    o = a.objet('cheval')
    recalculer_normales(o)
    arm = armature(OS_CHEVAL)
    o.parent = arm
    o.modifiers.new('squelette', 'ARMATURE').object = arm
    def galop(t):
        s = lambda ph: math.sin(t + ph)
        return {'av_d_h': (0, 0, 0), 'corps': (0, 6 * s(0), 0),
                'cou': (0, -8 * s(.5), 0), 'tete': (0, 6 * s(1), 0), 'queue': (0, 14 * s(.2) + 18, 0),
                **{f'{k}_h': (0, a_ * s(ph), 0) for k, a_, ph in (('av_d', 46, 0), ('av_g', 46, .55), ('ar_d', 44, 2.5), ('ar_g', 44, 3))},
                **{f'{k}_b': (0, max(0, s(ph + 1.2)) * -55, 0) for k, ph in (('av_d', 0), ('av_g', .55), ('ar_d', 2.5), ('ar_g', 3))}}
    poser(arm, 'repos', [(1, {'tete': (0, 3, 0), 'cou': (0, 0, 0), 'queue': (0, 8, 0)}), (30, {'tete': (0, -3, 0), 'cou': (0, 2, 0), 'queue': (0, 0, 0)}), (60, {'tete': (0, 3, 0), 'cou': (0, 0, 0), 'queue': (0, 8, 0)})])
    poser(arm, 'galop', [(i + 1, galop(i / 16 * 2 * math.pi)) for i in range(0, 17, 2)])
    arm.animation_data.action = bpy.data.actions['repos']
    bpy.context.scene.frame_set(1)
    taille = exporter_glb(os.path.join(SORTIE, 'personnages', 'cheval.glb'), animations=True)
    print(f'OK cheval {taille // 1024} Ko', flush=True)


if __name__ == '__main__':
    demandes = arguments() or [*STYLES, 'cheval']
    for n in demandes:
        if n == 'cheval':
            construire_cheval()
        else:
            construire_personnage(n)
