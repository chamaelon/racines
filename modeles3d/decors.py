"""
Les décors du jeu. Lancer : blender -b --python modeles3d/decors.py -- [noms...]
Produit public/modeles/decors/<nom>.glb. Le ciel, la lumière, l'eau et le feu sont animés par Three.js (src/scenes3d/ambiances.js).
Le milieu de la scène (x de -5 à 5, y de -3 à 1,5) reste libre pour les personnages. La caméra regarde vers +Y.
Objets nommés : « sol », « decor », « eau » (surface animée), « feu » (flammes), « defile » (paysage qui défile pendant la course).
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from mathutils import Matrix

from commun import (Assembleur, SORTIE, arguments, chevrons, damier, exporter_glb, image_motif, losanges, materiau as M, recalculer_normales, superposer, triangles, vider)
from formes import arbre, baobab, case_ronde, tube


class Palette:
    """Les matériaux d'un décor, créés une seule fois."""
    def __init__(self):
        self.m = {}

    def __call__(self, nom, couleur='#888888', **k):
        if nom not in self.m:
            self.m[nom] = M(nom, couleur, **k)
        return self.m[nom]


def texture_sol(nom, couleurs, grain=.13):
    def motif(u, v):
        return ((np.sin(u * 41) + np.sin(v * 37 + u * 13) + np.sin((u + v) * 89)) > .6) * 1 + ((np.sin(u * 19 + 1) + np.sin(v * 61)) > 1.1) * 2
    return M(nom, image=image_motif(nom, couleurs, motif, taille=512, grain=grain), rugosite=1)


def sol(tex, hauteur=None, l=120, p=90, n=(40, 28), rep=16):
    """Le terrain, plat sur la scène, relevé vers l'horizon."""
    a = Assembleur('sol')
    idx = a._mat(tex)
    def h(x, y):
        base = 0
        if y > 8:
            k = (y - 8) / 40
            # Le pays est plat : à peine une ondulation vers l'horizon.
            base = k * k * 1.8 + (math.sin(x * .12) + .5 * math.sin(x * .31 + 2)) * k * .7
        return base + (hauteur(x, y) if hauteur else 0)
    grille = []
    for j in range(n[1] + 1):
        ligne = []
        for i in range(n[0] + 1):
            x, y = (i / n[0] - .5) * l, -16 + j / n[1] * p
            ligne.append(a.bm.verts.new((x, y, h(x, y))))
        grille.append(ligne)
    for j in range(n[1]):
        for i in range(n[0]):
            f = a.bm.faces.new((grille[j][i], grille[j][i + 1], grille[j + 1][i + 1], grille[j + 1][i]))
            f.material_index = idx
            f.smooth = True
            for lo, (u, v) in zip(f.loops, ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1))):
                lo[a.uv].uv = (u / n[0] * rep, v / n[1] * rep)
    o = a.objet('sol')
    recalculer_normales(o)
    return o


def collines(a, mat, y=46, n=9, graine=2, hauteur=9):
    """Un horizon : des collines lointaines, plates, qui ferment la vue."""
    r = random.Random(graine)
    for i in range(n):
        x = -70 + i * 140 / (n - 1) + r.uniform(-5, 5)
        a.boule(r.uniform(13, 22), mat, (x, y + r.uniform(-3, 5), 0), (1.2, .5, r.uniform(.3, .6) * hauteur / 9), seg=10, anneaux=6)


def herbes(a, mat, n, graine=3, zone=(-22, 22, -4, 16), libre=True, h=.5):
    r = random.Random(graine)
    for _ in range(n):
        x, y = r.uniform(zone[0], zone[1]), r.uniform(zone[2], zone[3])
        if libre and abs(x) < 5.5 and -2.5 < y < 1.5:
            continue
        for k in range(3):
            dx, dy = r.uniform(-.1, .1), r.uniform(-.1, .1)
            a.cylindre((x + dx * .3, y + dy * .3, 0), (x + dx * 1.9, y + dy * 1.9, h * r.uniform(.6, 1.2)), .022, mat, r2=.001, seg=3, lisse=False)


def termitiere(a, mat, x, y, h):
    a.tour([(h * .34, 0), (h * .24, h * .4), (h * .13, h * .78), (.01, h)], mat, Matrix.Translation((x, y, 0)), seg=8)
    a.tour([(h * .17, 0), (h * .1, h * .36), (.01, h * .58)], mat, Matrix.Translation((x + h * .3, y - h * .08, 0)), seg=7)


def rocher(a, mat, x, y, r, hauteur=1.0, graine=0):
    a.boule(r, mat, (x, y, r * hauteur * .35), (1, .9, hauteur * .9), seg=7, anneaux=4, tourne=(graine * .3, graine * .2, graine))


def mortier(a, P, x, y):
    b = P('bois', '#6e4322')
    m = Matrix.Translation((x, y, 0))
    a.tour([(.17, 0), (.1, .16), (.2, .42), (.22, .52), (.001, .46)], b, m, seg=9)
    a.cylindre((x, y, .35), (x + .12, y, 1.5), .028, P('pilon', '#a57c47'), seg=5)


def canari(a, P, x, y, e=1.0):
    a.tour([(.1 * e, 0), (.33 * e, .16 * e), (.37 * e, .3 * e), (.2 * e, .54 * e), (.14 * e, .62 * e), (.001, .6 * e)], P('terre', '#a8602f'), Matrix.Translation((x, y, 0)), seg=10)


def calebasse(a, P, x, y):
    a.tour([(.001, 0), (.2, .045), (.28, .17), (.2, .13), (.001, .06)], P('calebasse', '#c79a4e'), Matrix.Translation((x, y, 0)), seg=9)


def tabouret(a, P, x, y):
    b = P('bois', '#6e4322')
    a.tour([(.16, .25), (.17, .3), (.001, .32)], b, Matrix.Translation((x, y, 0)), seg=8)
    for ang in (0, 2.1, 4.2):
        a.cylindre((x + math.cos(ang) * .09, y + math.sin(ang) * .09, .27), (x + math.cos(ang) * .15, y + math.sin(ang) * .15, 0), .025, b, seg=4)


def grenier(a, P, x, y, e=1.0):
    t = Matrix.Translation((x, y, 0))
    a.tour([(.34 * e, .32 * e), (.62 * e, 1.0 * e), (.34 * e, 1.8 * e), (.001, 1.85 * e)], P('mur', '#a8693a'), t, seg=10)
    a.tour([(.52 * e, 1.72 * e), (.28 * e, 2.05 * e), (.001, 2.42 * e)], P('paille', '#b8924e'), t, seg=9)
    for ang in (0, 2.1, 4.2):
        a.boule(.14 * e, P('pierre', '#6a6058'), (x + math.cos(ang) * .3 * e, y + math.sin(ang) * .3 * e, .13 * e), seg=6, anneaux=4)


def cloture(a, P, x0, y0, x1, y1, n=30, h=1.5):
    p = P('tige', '#9a7b43')
    for i in range(n):
        t = i / (n - 1)
        x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
        a.cylindre((x, y, 0), (x + (i % 3 - 1) * .03, y, h + (i * 7 % 5) * .04), .032, p, seg=3, lisse=False)
    a.cylindre((x0, y0, h * .66), (x1, y1, h * .66), .022, P('corde', '#6e4322'), seg=4)


def hameau(a, P, cases, mur='mur', toit='paille'):
    for (x, y, r, h) in cases:
        case_ronde(a, x, y, r, h, P(mur, '#a8693a'), P(toit, '#b8924e'), P('porte', '#21140b'), seg=11)


def peinture_tiebele():
    frise = superposer(
        (lambda u, v: v >= 0, 2),
        (lambda u, v: (v >= .1) & (v < .22), lambda u, v: triangles(u, v, 14, 8) % 2),
        (lambda u, v: (v >= .26) & (v < .46), lambda u, v: damier(u, v, 22, 20)),
        (lambda u, v: (v >= .5) & (v < .68), lambda u, v: chevrons(u, v, 11, 15) % 2),
        (lambda u, v: (v >= .72) & (v < .78), 1),
        (lambda u, v: (v >= .8) & (v < .95), lambda u, v: losanges(u, v, 13, 12)),
    )
    return M('peinture', image=image_motif('tiebele', ['#231712', '#efe7d4', '#9c3f22'], frise, taille=512, grain=.05), rugosite=.92)


def maison_peinte(a, P, tex, x, y, e=1.0):
    t = Matrix.Translation((x, y, 0))
    r, h = 2.1 * e, 2.1 * e
    a.tour([(r * 1.04, 0), (r, .2 * e), (r * .97, h)], tex, t, seg=20, ellipse=(1, .8), bouche=False, uv_rep=(1, 1))
    a.tour([(r * .97, h), (r, h + .26 * e), (r * .88, h + .26 * e), (.001, h + .14 * e)], P('mur', '#8c5230'), t, seg=20, ellipse=(1, .8), bouche=False)
    a.boite((x, y - r * .79, .4 * e), (.52 * e, .2, .8 * e), P('porte', '#120b07'))


def soukala(a, P, x, y, l=5.4, p=3.6, h=1.9):
    mur = P('banco', '#a56a3c')
    e = .34
    for c, t in (((x, y - p / 2, h / 2), (l, e, h)), ((x, y + p / 2, h / 2), (l, e, h)), ((x - l / 2, y, h / 2), (e, p, h)), ((x + l / 2, y, h / 2), (e, p, h))):
        a.boite(c, t, mur)
    a.boite((x, y, h - .06), (l - e, p - e, .12), P('terrasse', '#7c4c28'))
    a.boite((x - l * .2, y - p * .1, h + .5), (1.5, 1.3, 1.0), mur)
    a.boite((x + l * .1, y - p / 2 - .02, .42), (.5, e + .08, .84), P('porte', '#120b07'))


def maison_soudanaise(a, P, x, y, l, p, h):
    mur = P('banco', '#b57a42')
    a.boite((x, y, h / 2), (l, p, h), mur)
    a.boite((x, y - p / 2 - .01, h * .34), (.6, .1, h * .68), P('porte', '#170e08'))
    for cx in np.linspace(x - l / 2, x + l / 2, max(3, int(l / 1.1))):
        a.cylindre((cx, y - p / 2, h - .02), (cx, y - p / 2, h + .36), .09, mur, r2=.01, seg=5)
        a.cylindre((cx, y - p / 2, h * .72), (cx, y - p / 2 - .32, h * .72), .025, P('toron', '#4b2f18'), seg=4)


def tente_peule(a, P, x, y, e=1.0):
    """Abri de nattes sur armature souple, tel qu'on en voit dans les campements du Sahel."""
    tex = P('natte', '#c9a35c')
    a.boule(1.6 * e, tex, (x, y, 0), (1.18, 1, .78), seg=12, anneaux=7)
    a.boite((x, y - 1.55 * e, .5 * e), (.8 * e, .16, 1 * e), P('porte', '#22150b'))
    a.cylindre((x - 1.9 * e, y - .8 * e, 0), (x - 1.9 * e, y - .8 * e, 1.1 * e), .04, P('bois', '#6e4322'), seg=4)


def acacia(a, P, x, y, h, graine=1):
    e = P('ecorce', '#4a3522')
    f = P('feuille-seche', '#7f8a3a')
    a.cylindre((x, y, 0), (x + .1, y, h * .62), h * .035, e, r2=h * .022, seg=6)
    r = random.Random(graine)
    for i in range(5):
        ang = i * 2.399 + graine
        fx, fy = x + math.cos(ang) * h * .36, y + math.sin(ang) * h * .36
        a.cylindre((x + .1, y, h * .58), (fx, fy, h * (.82 + r.uniform(0, .08))), h * .018, e, r2=h * .005, seg=4)
        a.boule(h * .24, f, (fx, fy, h * .88), (1.2, 1.2, .24), seg=8, anneaux=4)
    a.boule(h * .3, f, (x, y, h * .95), (1.3, 1.3, .22), seg=9, anneaux=4)


# ---- Les décors

def rendre_decor(nom, sol_o, a, extras=()):
    objets = [sol_o, a.objet('decor') if a else None, *extras]
    for o in objets:
        if o:
            recalculer_normales(o)
    taille = exporter_glb(os.path.join(SORTIE, 'decors', f'{nom}.glb'))
    print(f'OK {nom} {taille // 1024} Ko', flush=True)


def d_village(nom='village'):
    vider()
    P = Palette()
    s = sol(texture_sol('terre', ['#a97a48', '#94683c', '#bb8c58']))
    a = Assembleur('decor')
    hameau(a, P, [(-7.5, 4.5, 1.55, 1.9), (-3.2, 7.5, 1.45, 1.8), (2.4, 8, 1.6, 2), (7.6, 4.8, 1.5, 1.85), (-12, 9, 1.5, 1.85), (12, 10, 1.6, 2), (-6, 13, 1.6, 2), (6, 14, 1.5, 1.9)])
    baobab(a, -13, 5, 6.5, P('ecorce', '#7a6653'), P('feuille', '#55793a'), 2)
    arbre(a, 14, 6, 6, P('ecorce2', '#4c3620'), P('feuille', '#55793a'), 3)
    grenier(a, P, -4.8, 3.2, .9)
    grenier(a, P, 5.2, 3, .9)
    cloture(a, P, -6.5, 2, -2, 3.2, 26)
    cloture(a, P, 2.2, 3.4, 6.5, 2, 26)
    mortier(a, P, -2.7, 2.4)
    for x, y, e in ((-5.7, 1.9, .9), (3, 2.5, 1), (3.8, 2.2, .75)):
        canari(a, P, x, y, e)
    calebasse(a, P, 4.3, 1.8)
    collines(a, P('colline', '#7e8c59'))
    herbes(a, P('herbe', '#8b8a3f'), 150)
    rendre_decor(nom, s, a)


def d_kassena():
    vider()
    P = Palette()
    s = sol(texture_sol('terre', ['#a0623c', '#8c5433', '#b37348']))
    a = Assembleur('decor')
    tex = peinture_tiebele()
    for x, y, e in ((-7.5, 5, 1), (0, 8, 1.15), (7.8, 5.4, 1), (-13, 11, 1), (11.5, 12, 1.05), (-4.5, 14, 1)):
        maison_peinte(a, P, tex, x, y, e)
    mur = P('mur', '#8c5230')
    a.boite((-3.9, 3.8, .6), (3.2, .3, 1.2), mur)
    a.boite((4, 3.8, .6), (3.2, .3, 1.2), mur)
    canari(a, P, -5.4, 2, 1)
    canari(a, P, 5, 2.1, .85)
    baobab(a, 15, 5, 6, P('ecorce', '#7a6653'), P('feuille', '#55793a'))
    collines(a, P('colline', '#7e8c59'))
    herbes(a, P('herbe', '#8b8a3f'), 80)
    rendre_decor('village-kassena', s, a)


def d_lobi():
    vider()
    P = Palette()
    s = sol(texture_sol('terre', ['#9d7244', '#85613a', '#ad8152']))
    a = Assembleur('decor')
    soukala(a, P, -6.8, 7)
    soukala(a, P, 7.4, 8.5, 6, 3.8, 2)
    soukala(a, P, -15, 16)
    soukala(a, P, 16, 18)
    arbre(a, 0, 13, 7, P('ecorce2', '#4c3620'), P('feuille', '#4f7a35'), 2)
    baobab(a, -15, 5, 6.2, P('ecorce', '#7a6653'), P('feuille', '#4f7a35'))
    arbre(a, 14, 4, 5.5, P('ecorce2', '#4c3620'), P('feuille', '#4f7a35'), 5)
    canari(a, P, -5.2, 3)
    canari(a, P, 5.4, 2.8, .85)
    collines(a, P('colline', '#748a58'))
    herbes(a, P('herbe', '#7f8f3f'), 170)
    rendre_decor('village-lobi', s, a)


def d_soudanais():
    vider()
    P = Palette()
    s = sol(texture_sol('terre', ['#b08654', '#9c7646', '#c29762']))
    a = Assembleur('decor')
    maison_soudanaise(a, P, -8, 5.5, 5, 3.2, 2.7)
    maison_soudanaise(a, P, 8, 5.8, 4.6, 3.2, 3)
    maison_soudanaise(a, P, -2.8, 9, 3.2, 3, 2.5)
    maison_soudanaise(a, P, 13.5, 10, 5, 3.2, 2.7)
    maison_soudanaise(a, P, -14, 11, 5, 3, 3)
    # La silhouette d'une mosquée de banco ferme la place
    mur = P('banco', '#b57a42')
    a.boite((3, 18, 1.8), (10, 5, 3.6), mur)
    for x, h in ((.8, 8), (5.2, 7.2)):
        a.tour([(1, 3.5), (.45, h), (.14, h + .8), (.01, h + 1.1)], mur, Matrix.Translation((x, 15.6, 0)), seg=8)
        for z in np.arange(4.2, h, .9):
            k = (z - 3.5) / (h - 3.5)
            a.cylindre((x, 15.6 - (1 + (.45 - 1) * k), z), (x, 15.6 - (1 + (.45 - 1) * k) - .3, z), .03, P('toron', '#4b2f18'), seg=4)
    canari(a, P, -5, 2.2)
    canari(a, P, 4.6, 2.3, .9)
    calebasse(a, P, 5.4, 1.9)
    mortier(a, P, -4, 3)
    arbre(a, -16, 6, 6.5, P('ecorce2', '#4c3620'), P('feuille', '#5f8740'), 2)
    collines(a, P('colline', '#94946a'))
    herbes(a, P('herbe', '#8b8a3f'), 60)
    rendre_decor('village-soudanais', s, a)


def d_campement():
    vider()
    P = Palette()
    dune = lambda x, y: (math.sin(x * .13 + y * .08) * .7 + math.sin(x * .05) * .9) * min(1, max(0, (abs(x) - 7) / 10 + max(0, y - 5) / 12))
    s = sol(texture_sol('sable', ['#d8bd85', '#c9ad75', '#e3cb95'], .08), dune)
    a = Assembleur('decor')
    tente_peule(a, P, -7, 6)
    tente_peule(a, P, 7.5, 7, 1.15)
    tente_peule(a, P, 1, 11, 1.05)
    tente_peule(a, P, -14, 12)
    acacia(a, P, 13, 5, 5.5, 2)
    acacia(a, P, -13, 4, 4.8, 3)
    calebasse(a, P, -4.6, 2.4)
    calebasse(a, P, -5.2, 2.8)
    canari(a, P, 4.6, 2.4, .9)
    cloture(a, P, 9, 2, 14, 3.6, 22, 1.1)
    collines(a, P('colline', '#bda875'), hauteur=5)
    herbes(a, P('herbe', '#a79a52'), 80, h=.36)
    rendre_decor('village-peul', s, a)


def d_palais():
    vider()
    P = Palette()
    s = sol(texture_sol('cour', ['#b48c5e', '#a57d51', '#c29a6c'], .08))
    a = Assembleur('decor')
    frise = superposer((lambda u, v: (v > .78) & (v < .92), lambda u, v: triangles(u, v, 30, 10) % 2 + 1), (lambda u, v: (v > .1) & (v < .16), 1))
    mur = M('mur-frise', image=image_motif('frise', ['#a8693a', '#efe3c7', '#5c2c16'], frise, taille=512, grain=.05), rugosite=.95)
    a.boite((0, 7, 2.1), (20, .8, 4.2), mur)
    a.boite((-10, 2, 2.1), (.8, 10.8, 4.2), mur)
    a.boite((10, 2, 2.1), (.8, 10.8, 4.2), mur)
    bois = P('bois', '#4a2b14')
    for x in (-7.5, -3, 3, 7.5):
        a.cylindre((x, 5, 0), (x, 5, 3.4), .17, bois, r2=.14, seg=8)
        a.boite((x, 5, 3.45), (.5, .5, .12), bois)
    a.boite((0, 5, 3.6), (16.4, 2.6, .24), P('toit-paille', '#8a6a33'))
    # L'estrade royale, le parasol et les tambours
    a.boite((0, 6, .18), (4, 1.6, .36), P('natte', '#c9a35c'))
    a.boite((0, 6.3, .78), (.9, .5, .85), bois)
    a.cylindre((1.5, 5.6, .3), (1.5, 5.6, 3), .03, bois, seg=5)
    a.tour([(1.1, 2.7), (.8, 2.9), (.05, 3.2)], P('parasol', '#b8322a'), Matrix.Translation((1.5, 5.6, 0)), seg=12)
    for x in (-3.8, -2.9):
        a.tour([(.2, 0), (.1, .35), (.2, .75)], P('tambour', '#7a4a24'), Matrix.Translation((x, 3.8, 0)), seg=9)
        a.tour([(.2, .75), (.001, .76)], P('peau', '#d9c49a'), Matrix.Translation((x, 3.8, 0)), seg=9)
    for x in (-8.5, 8.5):
        a.boite((x, 6.4, 1.6), (1.4, .1, 2.2), M(f't{x}', image=image_motif(f'ten{x}', ['#23356f', '#efe6d0', '#b8322a'], lambda u, v: (u * 24).astype(int) % 3, taille=128)))
    canari(a, P, 4, 3.5, 1)
    canari(a, P, 4.9, 3.2, .8)
    arbre(a, -5, 12, 6.5, P('ecorce', '#4c3620'), P('feuille', '#55793a'), 1)
    arbre(a, 7, 13, 7, P('ecorce', '#4c3620'), P('feuille', '#55793a'), 4)
    rendre_decor('palais', s, a)


def d_champ():
    vider()
    P = Palette()
    s = sol(texture_sol('champ', ['#a07a4a', '#8d6a3e', '#ad8656']))
    a = Assembleur('decor')
    tige, epi = P('tige', '#8f9a42'), P('epi', '#b98b3a')
    r = random.Random(4)
    for ligne in range(11):
        y = 2.2 + ligne * .85
        for k in range(46):
            x = -18 + k * .8 + r.uniform(-.15, .15)
            h = r.uniform(1.8, 2.5)
            a.cylindre((x, y, 0), (x + r.uniform(-.1, .1), y, h), .024, tige, r2=.012, seg=3, lisse=False)
            a.boule(.05, epi, (x, y, h + .06), (.8, .8, 2.5), seg=5, anneaux=4)
            if k % 2 == 0:
                a.cylindre((x, y, h * .55), (x + .38, y - .1, h * .7), .02, tige, r2=.002, seg=3, lisse=False)
    grenier(a, P, -14, 1, 1)
    baobab(a, 15, 1.5, 6.5, P('ecorce', '#7a6653'), P('feuille', '#55793a'))
    a.cylindre((5, .2, 0), (5.2, .2, 1.05), .012, P('manche', '#6e4322'), seg=4)
    hameau(a, P, [(-9, 24, 1.5, 1.9), (9, 26, 1.5, 1.9)])
    collines(a, P('colline', '#7e8c59'))
    herbes(a, P('herbe', '#8b8a3f'), 60, zone=(-22, 22, -5, 1.5))
    rendre_decor('champ', s, a)


def d_marche():
    vider()
    P = Palette()
    s = sol(texture_sol('terre', ['#b08a58', '#9c7a4c', '#c09a68']))
    a = Assembleur('decor')
    r = random.Random(6)
    bois = P('bois', '#4a2b14')
    for i, (x, y) in enumerate(((-7.6, 3.6), (-3, 5.2), (2.8, 5.4), (7.6, 3.8), (-11, 8), (11, 8.5), (0, 10), (-6, 11), (6, 11.5))):
        tissu = M(f'toile{i}', image=image_motif(f'toile{i}', [['#23356f', '#b8322a', '#1f6f6b', '#c9652a'][i % 4], '#efe6d0', '#e0a43a'], lambda u, v: (u * 18).astype(int) % 3, taille=128))
        for dx, dy in ((-1.2, -.9), (1.2, -.9), (-1.2, .9), (1.2, .9)):
            a.cylindre((x + dx, y + dy, 0), (x + dx, y + dy, 2.2 + (.3 if dy > 0 else 0)), .04, bois, seg=4)
        a.boite((x, y, 2.38), (2.9, 2.3, .06), tissu, tourne=(-.14, 0, 0))
        a.boite((x, y - .2, .68), (2.2, 1.1, .08), P('etal', '#7a4a24'))
        for j in range(5):
            cx = x - .9 + j * .45
            k = (i + j) % 4
            if k == 0:
                a.tour([(.05, .72), (.15, .84), (.1, 1), (.001, 1)], P('terre', '#a8602f'), Matrix.Translation((cx, y - .25, 0)), seg=8)
            elif k == 1:
                a.boule(.13, P('calebasse', '#c79a4e'), (cx, y - .25, .84), (1, 1, .7), seg=8, anneaux=5)
            elif k == 2:
                a.boule(.14, P('mil-tas', '#d7c27a'), (cx, y - .25, .76), (1.1, 1.1, .6), seg=8, anneaux=4)
            else:
                a.boule(.12, P('piment', '#a8321f'), (cx, y - .25, .76), (1.1, 1.1, .55), seg=8, anneaux=4)
    for x, y, e in ((-5.1, 2.2, 1), (-4.6, 1.8, .7), (5, 2.3, .85)):
        canari(a, P, x, y, e)
    for x, y in ((5.8, 1.9), (-6.2, 1.5)):
        calebasse(a, P, x, y)
    baobab(a, 16, 7, 6.8, P('ecorce', '#7a6653'), P('feuille', '#55793a'))
    arbre(a, -15, 5, 6, P('ecorce2', '#4c3620'), P('feuille', '#55793a'), 2)
    hameau(a, P, [(-9, 16, 1.6, 2), (4, 18, 1.6, 2), (13, 15, 1.5, 1.9)])
    collines(a, P('colline', '#7e8c59'))
    herbes(a, P('herbe', '#8b8a3f'), 50)
    rendre_decor('marche', s, a)


def d_brousse(nom='brousse', couleurs=('#b28c55', '#9f7c49', '#c29c63'), feuille='#6c8038', nb_herbe=380, h_herbe=.62):
    vider()
    P = Palette()
    s = sol(texture_sol('terre', list(couleurs)))
    a = Assembleur('decor')
    baobab(a, -8.5, 7, 7.5, P('ecorce', '#7a6653'), P('feuille', feuille), 1)
    baobab(a, 14, 16, 8, P('ecorce', '#7a6653'), P('feuille', feuille), 3)
    arbre(a, 8.5, 6, 5.8, P('ecorce2', '#4c3620'), P('feuille', feuille), 2)
    arbre(a, -17, 13, 6, P('ecorce2', '#4c3620'), P('feuille', feuille), 5)
    arbre(a, 2, 22, 5, P('ecorce2', '#4c3620'), P('feuille', feuille), 3)
    termitiere(a, P('termite', '#a0683a'), -4.2, 5, 2.2)
    termitiere(a, P('termite', '#a0683a'), 13, 4, 1.7)
    for i, (x, y, r_) in enumerate(((5.5, 3, .5), (6.2, 3.5, .35), (-6.5, 2.4, .42), (-15, 3, .8))):
        rocher(a, P('pierre', '#7b6a58'), x, y, r_, graine=i)
    collines(a, P('colline', '#88865a'))
    herbes(a, P('herbe', '#a79a52'), nb_herbe, h=h_herbe, zone=(-26, 26, -5, 26))
    rendre_decor(nom, s, a)


def d_sahel():
    vider()
    P = Palette()
    dune = lambda x, y: (math.sin(x * .12 + y * .1) * .9 + math.sin(x * .05 + 1) * .8) * min(1, max(0, (abs(x) - 6) / 10 + max(0, y - 4) / 10))
    s = sol(texture_sol('sable', ['#dcc38d', '#ccb27d', '#e6d19f'], .07), dune)
    a = Assembleur('decor')
    acacia(a, P, -9, 6, 5.2, 1)
    acacia(a, P, 10, 9, 5.8, 2)
    acacia(a, P, -19, 14, 5, 3)
    for i, (x, y, r_) in enumerate(((6, 3, .35), (-5.8, 3.4, .28))):
        rocher(a, P('pierre', '#a08a68'), x, y, r_, graine=i)
    collines(a, P('colline', '#c2ac7c'), hauteur=5)
    herbes(a, P('herbe', '#ad9f58'), 160, h=.36, zone=(-26, 26, -5, 24))
    rendre_decor('sahel', s, a)


def d_foret(nom, nb, couleurs, feuille, case=False, grand=False, herbe='#4a6a2f'):
    vider()
    P = Palette()
    s = sol(texture_sol('humus', list(couleurs)))
    a = Assembleur('decor')
    r = random.Random(7)
    e, f = P('ecorce', '#332416'), P('feuille', feuille)
    f2 = P('feuille2', feuille)
    for i in range(nb):
        x, y = r.uniform(-24, 24), r.uniform(3, 26)
        if abs(x) < 5 and y < 5:
            continue
        arbre(a, x, y, r.uniform(6.5, 11), e, f if i % 2 else f2, i)
    if case:
        case_ronde(a, 3.5, 5.5, 1.55, 1.95, P('mur', '#8d5a31'), P('paille', '#8f7437'), P('porte', '#21140b'), seg=11)
        canari(a, P, 1.2, 3.4, .9)
    if grand:
        # Le grand arbre du bois, au fond de la clairière
        arbre(a, 0, 8.5, 14, e, f, 2)
    herbes(a, P('herbe', herbe), 260, h=.7, zone=(-24, 24, -5, 18))
    rendre_decor(nom, s, a)


def d_nuit():
    vider()
    P = Palette()
    s = sol(texture_sol('terre', ['#4b4137', '#3f372f', '#58493c']))
    a = Assembleur('decor')
    hameau(a, P, [(-8, 6, 1.5, 1.9), (8, 7, 1.6, 2), (-14, 12, 1.5, 1.85), (2.5, 13, 1.6, 2)])
    cloture(a, P, -6, 2.8, -1.5, 4, 26)
    cloture(a, P, 2, 4, 5.5, 2.8, 22)
    arbre(a, 14, 5, 6.2, P('ecorce', '#2c2018'), P('feuille', '#2b3d28'), 3)
    baobab(a, -16, 5, 6.5, P('ecorce', '#2c2018'), P('feuille', '#2b3d28'))
    a.boite((-8, 6 - 1.5, .7), (.5, .05, .5), P('feu-porte', '#ffaa4a', emission=('#ff8a2a', 1.2)))
    collines(a, P('colline', '#2c3441'))
    herbes(a, P('herbe', '#3f4a2f'), 100)
    rendre_decor('nuit', s, a)


def d_veillee():
    vider()
    P = Palette()
    s = sol(texture_sol('terre', ['#5f4a38', '#51402f', '#6e5541']))
    a = Assembleur('decor')
    hameau(a, P, [(-8.5, 6.5, 1.6, 2), (8.5, 7, 1.6, 2), (0, 11.5, 1.7, 2.1), (-15, 12, 1.5, 1.85), (15, 13, 1.5, 1.85)])
    pierre = P('pierre', '#4c443c')
    for i in range(9):
        ang = i * 2 * math.pi / 9
        a.boule(.14, pierre, (math.cos(ang) * .62, 1.4 + math.sin(ang) * .62, .07), (1, 1, .7), seg=6, anneaux=4)
    bois = P('bois', '#2c1a0e')
    for i in range(6):
        ang = i * math.pi / 3
        a.cylindre((math.cos(ang) * .42, 1.4 + math.sin(ang) * .42, .05), (-math.cos(ang) * .1, 1.4 - math.sin(ang) * .1, .42), .05, bois, seg=5)
    for x, y in ((-3.4, 2.8), (3.5, 2.7), (-4.8, 1.6), (4.8, 1.5)):
        tabouret(a, P, x, y)
    canari(a, P, -5.8, 3, .9)
    calebasse(a, P, 5.8, 2.6)
    arbre(a, 13, 4.2, 6, P('ecorce2', '#2c2018'), P('feuille', '#2b3d28'), 3)
    baobab(a, -14, 4.5, 6.4, P('ecorce2', '#2c2018'), P('feuille', '#2b3d28'))
    # Les flammes sont un objet à part : Three.js les fait danser
    f = Assembleur('feu')
    flamme = M('flamme', '#ffb24a', emission=('#ff9a2a', 4))
    coeur = M('coeur', '#ffe48a', emission=('#ffe08a', 6))
    for i, (x, y, h, r) in enumerate(((0, 0, 1.15, .3), (.2, .1, .8, .19), (-.22, .08, .85, .2), (.05, -.2, .7, .17))):
        f.tour([(r, 0), (r * .85, h * .3), (r * .4, h * .7), (.005, h)], flamme, Matrix.Translation((x, 1.4 + y, .1)), seg=7)
    f.tour([(.16, 0), (.1, .34), (.005, .68)], coeur, Matrix.Translation((0, 1.34, .1)), seg=7)
    o = f.objet('feu')
    collines(a, P('colline', '#2c3441'))
    herbes(a, P('herbe', '#3f4a2f'), 90)
    rendre_decor('veillee', s, a, (o,))


def d_eau(nom, largeur_y=(5, 36), rive_coul=('#8f8351', '#7f744a', '#a09160'), eau_coul='#3f7d8c', arbres=6):
    vider()
    P = Palette()
    s = sol(texture_sol('rive', list(rive_coul)), lambda x, y: -1.1 if largeur_y[0] < y < largeur_y[1] else (-.8 * max(0, y - largeur_y[0] + 1) if y > largeur_y[0] - 1 and y <= largeur_y[0] else 0), l=120, p=90, n=(30, 60))
    a = Assembleur('decor')
    reed = P('roseau', '#6f8a3a')
    r = random.Random(5)
    for _ in range(90):
        x = r.uniform(-30, 30)
        if abs(x) < 3.5:
            continue
        y = largeur_y[0] - r.uniform(0, 1.2)
        a.cylindre((x, y, -.1), (x + r.uniform(-.1, .1), y, r.uniform(.8, 1.7)), .02, reed, r2=.003, seg=3, lisse=False)
    for i in range(arbres):
        x = -22 + i * 44 / max(1, arbres - 1) + r.uniform(-2, 2)
        if abs(x) < 5:
            x += 7
        arbre(a, x, largeur_y[1] + r.uniform(1, 5), r.uniform(6, 9), P('ecorce', '#4c3620'), P('feuille', '#55793a'), i)
    for i, (x, y, r_) in enumerate(((-5.4, 3.4, .55), (-6.3, 3, .36), (6, 3.2, .45))):
        rocher(a, P('pierre', '#70645a'), x, y, r_, graine=i)
    if nom == 'fleuve':
        # Une pirogue tirée sur la rive
        coque = P('pirogue', '#5b3a1d')
        a.boule(1, coque, (7.5, 4.2, .12), (2, .34, .2), seg=10, anneaux=5, tourne=(0, 0, .15))
    calebasse(a, P, 4.4, 3)
    collines(a, P('colline', '#7e8c59'), y=56)
    herbes(a, P('herbe', '#8b8a3f'), 150, zone=(-26, 26, -5, largeur_y[0] - 1))
    e = Assembleur('eau')
    em = M('eau', eau_coul, rugosite=.12, metal=.05)
    e.grille(130, largeur_y[1] - largeur_y[0] + 6, em, Matrix.Translation((0, largeur_y[0] - 1, -.28)) @ Matrix.Rotation(math.radians(90), 4, 'X'), n=(40, 18), lisse=True, uv=(0, 0, 8, 2))
    rendre_decor(nom, s, a, (e.objet('eau'),))


def d_rochers():
    vider()
    P = Palette()
    s = sol(texture_sol('terre', ['#a48a60', '#927a54', '#b59a6e']))
    a = Assembleur('decor')
    roche = M('roche', image=image_motif('gres', ['#8a6b4c', '#826346', '#927252', '#7b5d42'], lambda u, v: ((v * 16 + np.sin(u * 12) * .8).astype(int) % 4), taille=256, grain=.1), rugosite=1)
    r = random.Random(3)
    for i in range(46):
        x, y = r.uniform(-32, 32), r.uniform(6, 26)
        if abs(x) < 2.5 and y < 8:
            continue
        h = r.uniform(5, 13)
        rb = h * r.uniform(.11, .17)
        a.tour([(rb, 0), (rb * .86, h * .3), (rb * r.uniform(.55, .7), h * .62), (rb * .3, h * .9), (.02, h)], roche, Matrix.Translation((x, y, 0)), seg=7, ellipse=(1, r.uniform(.7, 1)))
    for i, (x, y, q) in enumerate(((-5, 3.2, .7), (5.8, 3, .55), (-7, 4.2, .9), (7.5, 4.3, 1))):
        rocher(a, roche, x, y, q, 1.2, i)
    arbre(a, -14, 4, 5.2, P('ecorce', '#4c3620'), P('feuille', '#66803d'), 2)
    herbes(a, P('herbe', '#99924a'), 180, zone=(-26, 26, -5, 12), h=.5)
    collines(a, P('colline', '#88865a'))
    rendre_decor('rochers', s, a)


def d_ruines():
    vider()
    P = Palette()
    s = sol(texture_sol('terre', ['#94754a', '#846840', '#a38253']))
    a = Assembleur('decor')
    def pierre(u, v):
        ligne = np.floor(v * 16).astype(int)
        return np.where(((v * 16) % 1 < .14) | (((u * 14 + ligne % 2 * .5) % 1) < .1), 3, (ligne * 3 + np.floor(u * 14 + ligne % 2 * .5).astype(int) * 7) % 3)
    lat = M('laterite', image=image_motif('lat', ['#8c4a2a', '#74391f', '#9c5733', '#3d2316'], pierre, taille=512, grain=.09), rugosite=1)
    r = random.Random(11)
    def pan(x0, y0, x1, y1, base, n):
        for i in range(n):
            t0, t1 = i / n, (i + 1) / n
            cx, cy = x0 + (x1 - x0) * (t0 + t1) / 2, y0 + (y1 - y0) * (t0 + t1) / 2
            l = math.hypot(x1 - x0, y1 - y0) / n
            h = max(.3, base * (.45 + .55 * abs(math.sin(i * .8 + 1))) + r.uniform(-.25, .25))
            a.boite((cx, cy, h / 2), (l * 1.02, .9, h), lat, tourne=(0, 0, math.atan2(y1 - y0, x1 - x0)), uv=(t0 * 3, 0, t1 * 3, h / 5))
    pan(-20, 8, 20, 9, 5.4, 26)
    pan(-20, 8, -22, -2, 3.6, 7)
    pan(20, 9, 23, -1, 3.4, 7)
    for x, y in ((-6.5, 2.2), (-5.3, 3.1), (6.8, 2.7), (5, 3.4), (-3, 4.6), (3, 5)):
        a.boite((x, y, .16), (r.uniform(.3, .6), r.uniform(.3, .6), .32), lat, tourne=(0, 0, r.uniform(0, 3)), uv=(0, 0, .2, .1))
    arbre(a, -10, 5.5, 6.5, P('ecorce', '#4c3620'), P('feuille', '#55793a'), 2)
    arbre(a, 12, 6, 6, P('ecorce', '#4c3620'), P('feuille', '#55793a'), 4)
    arbre(a, 2, 13, 8, P('ecorce', '#4c3620'), P('feuille', '#55793a'), 1)
    collines(a, P('colline', '#7e8c59'))
    herbes(a, P('herbe', '#8b8a3f'), 320, h=.72, zone=(-26, 26, -5, 14))
    rendre_decor('ruines', s, a)


def d_ciel():
    vider()
    P = Palette()
    a = Assembleur('nuages')
    nuage, nuage2 = M('nuage', '#ffffff', rugosite=1, emission=('#e8eef8', .35)), M('nuage2', '#dfe7f6', rugosite=1, emission=('#d8e2f4', .3))
    s = Assembleur('sol')
    r = random.Random(9)
    # Le sol du « pays d'en haut » est une mer de nuages
    for i in range(70):
        x, y = r.uniform(-30, 30), r.uniform(-5, 30)
        s.boule(r.uniform(1.6, 3.6), nuage if i % 2 else nuage2, (x, y, r.uniform(-.8, -.25)), (1.5, 1.25, .34), seg=10, anneaux=6)
    for i in range(26):
        x, y, z = r.uniform(-34, 34), r.uniform(10, 42), r.uniform(1, 9)
        for k in range(4):
            a.boule(r.uniform(1, 2.2), nuage, (x + k * 1.3, y, z + r.uniform(-.2, .3)), (1.4, 1, .5), seg=9, anneaux=5)
    # La corde de lumière que racontent les récits
    c = Assembleur('feu')
    c.cylindre((0, 3, -2), (0, 3, 22), .05, M('corde-lumiere', '#ffe27a', emission=('#ffe27a', 5)), seg=6)
    o = s.objet('sol')
    rendre_decor('ciel', o, a, (c.objet('feu'),))


def d_course():
    vider()
    P = Palette()
    s = sol(texture_sol('piste', ['#9d7c50', '#8d6d45', '#ad8b5c']))
    a = Assembleur('decor')
    collines(a, P('colline', '#3d4c4c'))
    d = Assembleur('defile')
    r = random.Random(13)
    for i in range(16):
        x, y = -24 + i * 3 + r.uniform(-.8, .8), r.choice((r.uniform(3, 7), r.uniform(8, 16), -r.uniform(4, 7)))
        k = i % 5
        if k == 0:
            baobab(d, x, y, 6.2, P('ecorce', '#54483a'), P('feuille', '#44603a'), i)
        elif k in (1, 3):
            arbre(d, x, y, r.uniform(4.6, 6.2), P('ecorce', '#54483a'), P('feuille', '#44603a'), i)
        elif k == 2:
            termitiere(d, P('termite', '#8a5c35'), x, y, 1.8)
        else:
            rocher(d, P('pierre', '#6a6058'), x, y, .55, graine=i)
    herbes(d, P('herbe', '#7a7a3f'), 160, zone=(-24, 24, -5, 10), libre=False, h=.5)
    o = d.objet('defile')
    rendre_decor('course', s, a, (o,))


DECORS = {
    'village': d_village, 'village-kassena': d_kassena, 'village-lobi': d_lobi, 'village-soudanais': d_soudanais, 'village-peul': d_campement,
    'palais': d_palais, 'marche': d_marche, 'champ': d_champ, 'brousse': d_brousse, 'sahel': d_sahel,
    'foret': lambda: d_foret('foret', 42, ('#54492f', '#473e28', '#625537'), '#3f6a36', case=True),
    'bois': lambda: d_foret('bois', 50, ('#37412f', '#2d3628', '#444f39'), '#2f5b3a', grand=True, herbe='#35573a'),
    'nuit': d_nuit, 'veillee': d_veillee, 'fleuve': lambda: d_eau('fleuve'), 'mare': lambda: d_eau('mare', (5, 20), eau_coul='#5c7f62', arbres=7),
    'rochers': d_rochers, 'ruines': d_ruines, 'ciel': d_ciel, 'course': d_course,
}

if __name__ == '__main__':
    for n in arguments() or DECORS:
        DECORS[n]()
