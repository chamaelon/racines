"""
Les objets du patrimoine en 3D. Lancer : blender -b --python modeles3d/patrimoine.py -- [ids...]
Produit public/modeles/patrimoine/<id>.glb et public/modeles/vignettes/<id>.webp
Les formes et motifs suivent les sources citées dans public/data/patrimoine.json. Ce sont des interprétations, à valider.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from mathutils import Matrix, Vector

from commun import (Assembleur, SORTIE, arguments, bandes, cercles, chevrons, damier, exporter_glb, image_motif, losanges, materiau as M,
                    points, recalculer_normales, rendre, studio, superposer, triangles, vider)
from formes import arc_points, case_ronde, cheval, tube

BOIS, BOIS_F, TERRE, CUIR, PAILLE, FER, CORDE, PEAU, NOIR = '#7a4a24', '#3d2412', '#a8602f', '#6e4322', '#c9a35c', '#4a4a4c', '#8d6f47', '#d9c49a', '#17110c'


def bande(a, b):
    return lambda u, v: (v >= a) & (v < b)


# ---- Objets et mets

def canari(a):
    motif = superposer((bande(.5, .72), lambda u, v: chevrons(u, v * .9, 9, 14) % 2))
    tex = M('terre', image=image_motif('canari', [TERRE, '#5c3016'], motif))
    a.tour([(.1, 0), (.2, .03), (.33, .16), (.37, .3), (.33, .44), (.2, .54), (.13, .58), (.15, .63), (.17, .65), (.14, .65), (.11, .58)], tex, seg=28)


def calebasse(a):
    motif = superposer((bande(.55, .8), lambda u, v: losanges(u, v, 18, 12)), (bande(.8, .83), 1))
    tex = M('calebasse', image=image_motif('cal', ['#c79a4e', '#5c3a16'], motif), rugosite=.6)
    a.tour([(.001, 0), (.1, .004), (.2, .045), (.27, .12), (.29, .2), (.27, .2), (.25, .13), (.18, .07), (.09, .03), (.001, .025)], tex, seg=28, uv_rep=(1, 1))


def to(a):
    bol = M('bol', image=image_motif('tobol', [TERRE, '#5c3016'], lambda u, v: (bande(.72, .84)(u, v) & (losanges(u, v, 16, 10) > 0)).astype(int)))
    a.tour([(.09, 0), (.12, .02), (.27, .13), (.31, .2), (.29, .2), (.25, .13), (.1, .05), (.001, .05)], bol, seg=26)
    a.boule(.22, M('pate', '#e8dcb8', .55), (0, 0, .12), (1, 1, .55), seg=20, anneaux=10)
    a.tour([(.06, 0), (.11, .02), (.12, .07), (.1, .07), (.08, .03), (.001, .03)], bol, Matrix.Translation((.42, -.1, 0)), seg=18)
    a.tour([(.09, .05), (.001, .06)], M('sauce', '#3f5a1f', .35), Matrix.Translation((.42, -.1, 0)), seg=16)


def soumbala(a):
    tex = M('vannerie', image=image_motif('panier', [PAILLE, '#8f6c33'], lambda u, v: chevrons(u, v, 14, 24) % 2))
    a.tour([(.13, 0), (.2, .03), (.3, .15), (.33, .2), (.31, .2), (.27, .13), (.15, .05), (.001, .05)], tex, seg=24)
    boule = M('soumbala', '#2c1a10', .9)
    for i in range(16):
        ang, r = i * 2.399, .035 + .022 * i * .6
        r = min(r, .22)
        a.boule(.05, boule, (math.cos(ang) * r, math.sin(ang) * r, .13 + .05 * (i % 3) * (1 - r / .3)), (1, 1, .85), seg=9, anneaux=6)


def dolo(a):
    canari(a)
    cal = M('cal2', '#b98a42', .6)
    m = Matrix.Translation((.62, -.12, 0))
    a.tour([(.001, 0), (.1, .012), (.17, .07), (.19, .13), (.17, .13), (.15, .08), (.08, .03), (.001, .03)], cal, m, seg=24)
    a.tour([(.16, .1), (.001, .105)], M('dolo', '#8c3f22', .3), m, seg=20)


def defenses(a):
    ivoire = M('ivoire', '#ece0c2', .45)
    socle = M('socle', BOIS_F)
    a.boite((0, 0, .04), (1.0, .28, .08), socle)
    for s in (-1, 1):
        p = [(s * .24, 0, .08), (s * .3, 0, .36), (s * .28, 0, .66), (s * .17, 0, .94), (s * .03, 0, 1.12), (s * -.08, 0, 1.2)]
        tube(a, p, [.062, .056, .048, .036, .022, .004], ivoire, seg=10)
    a.cylindre((-.33, 0, .32), (.33, 0, .32), .018, M('lien', CUIR), seg=8)


# ---- Habitat et monuments

def case_ronde_o(a):
    mur = M('mur', image=image_motif('banco', ['#a8693a', '#8e5228', '#c58a50'], lambda u, v: (bandes(u, v, 2) * 0 + (bande(.62, .72)(u, v) & (chevrons(u, v, 2, 14) % 2 == 0)) * 1)))
    toit = M('toit', image=image_motif('paille', [PAILLE, '#94743a', '#b08f4c'], lambda u, v: (u * 180).astype(int) % 3, grain=.09))
    case_ronde(a, 0, 0, 1.25, 1.65, mur, toit, M('porte', '#21140b'), seg=26)
    a.cylindre((0, 0, 3.3), (0, 0, 3.72), .05, M('faitage', BOIS_F), seg=8)


def maison_tiebele(a):
    """Cour royale de Tiébélé : murs épais, peints par les femmes en noir, blanc et rouge, petite porte, toit plat."""
    noir, blanc, rouge = '#231712', '#efe7d4', '#9c3f22'
    frise = superposer(
        (bande(0, 1), 2),
        (bande(.10, .22), lambda u, v: triangles(u, v, 14, 8) % 2),
        (bande(.26, .46), lambda u, v: damier(u, v, 22, 20)),
        (bande(.50, .68), lambda u, v: chevrons(u, v, 11, 15) % 2),
        (bande(.72, .78), 1),
        (bande(.80, .95), lambda u, v: losanges(u, v, 13, 12)),
    )
    mur = M('peinture', image=image_motif('tiebele', [noir, blanc, rouge], frise, taille=1024, grain=.06), rugosite=.92)
    uni = M('terre', '#8c5230')
    r, h = 2.1, 2.1
    a.tour([(r * 1.04, 0), (r, .22), (r * .97, h), (r * 1.0, h + .05)], mur, seg=48, ellipse=(1, .78), bouche=False)
    a.tour([(r * .98, h + .05), (r * 1.0, h + .28), (r * .88, h + .28), (r * .86, h + .14), (.001, h + .14)], uni, seg=48, ellipse=(1, .78), bouche=False)
    a.boite((0, -r * .78, .4), (.52, .2, .8), M('porte', '#120b07'))
    a.boite((0, -r * .8, .84), (.72, .12, .1), uni)
    a.boite((-.95, -r * .72, .55), (.32, .28, .18), uni, tourne=(0, 0, .35))
    # L'échelle de bois permet de monter sur le toit
    bois = M('bois', BOIS_F)
    for s in (-1, 1):
        a.cylindre((1.45 + s * .11, -1.5, 0), (1.3 + s * .11, -1.15, h + .36), .03, bois, seg=6)
    for i in range(1, 7):
        t = i / 7
        c = Vector((1.45, -1.5, 0)).lerp(Vector((1.3, -1.15, h + .36)), t)
        a.cylindre((c.x - .11, c.y, c.z), (c.x + .11, c.y, c.z), .02, bois, seg=6)


def soukala(a):
    """Maison-forteresse lobi : un grand enclos de banco à murs épais et à petite entrée."""
    banco = M('banco', image=image_motif('sk', ['#a56a3c', '#9d6336', '#ab7042'], lambda u, v: (v * 7 + .15 * np.sin(u * 40)).astype(int) % 3, grain=.08), rugosite=.95)
    l, p, h, e = 5.4, 3.8, 1.85, .34
    for c, t in (((0, -p / 2, h / 2), (l, e, h)), ((0, p / 2, h / 2), (l, e, h)), ((-l / 2, 0, h / 2), (e, p, h)), ((l / 2, 0, h / 2), (e, p, h))):
        a.boite(c, t, banco)
    a.boite((0, 0, h - .06), (l - e, p - e, .12), M('terrasse', '#7c4c28'))
    for c, t in (((-1, -.5, h + .55), (1.5, 1.3, 1.1)), ((1.25, .55, h + .3), (1.1, 1.0, .6))):
        a.boite(c, t, banco)
    a.boite((.6, -p / 2 - .02, .42), (.5, e + .08, .84), M('porte', '#140c07'))
    for x in (-1.8, 1.8):
        a.boite((x, -p / 2 - .02, h - .4), (.16, e + .06, .16), M('jour', '#140c07'))


def mosquee_bobo(a):
    """Grande mosquée de Bobo-Dioulasso : banco ocre, deux minarets, poutres saillantes (toron) et horizontales."""
    banco = M('banco', image=image_motif('mq', ['#b57a42', '#ad7239', '#bb8049'], lambda u, v: (v * 9 + .2 * np.sin(u * 30)).astype(int) % 3, grain=.08), rugosite=.95)
    bois = M('toron', '#4b2f18')
    l, p, h = 8, 5, 2.9
    a.boite((0, 0, h / 2), (l, p, h), banco)
    a.boite((0, -p / 2 - .01, .55), (.8, .1, 1.1), M('porte', '#170e08'))
    for x in (-3, -1.6, 1.6, 3):
        a.boite((x, -p / 2 - .01, 1.05), (.5, .1, 1.5), M('arc', '#2a1a0e'))
    for x in np.linspace(-l / 2, l / 2, 11):
        for y in (-p / 2, p / 2):
            a.cylindre((x, y, h - .1), (x, y, h + .62), .13, banco, r2=.015, seg=8)
            a.boite((x, y, h / 2), (.26, .3, h), banco)
    for x, ht in ((-2.6, 7.2), (2.6, 6.4)):
        a.tour([(.98, h), (.72, ht * .55 + 1), (.42, ht), (.14, ht + .75), (.01, ht + 1.05)], banco, Matrix.Translation((x, 0, 0)), seg=14)
        for z in np.arange(h + .5, ht, .78):
            k = (z - h) / (ht - h)
            r = .98 + (.42 - .98) * k
            for i in range(8):
                ang = i * math.pi / 4
                dep = Vector((x + math.cos(ang) * (r - .05), math.sin(ang) * (r - .05), z))
                a.cylindre(tuple(dep), (x + math.cos(ang) * (r + .3), math.sin(ang) * (r + .3), z), .028, bois, seg=5)
    for z in (1.05, 1.95):
        for x in np.linspace(-l / 2 + .25, l / 2 - .25, 15):
            a.cylindre((x, -p / 2 - .13, z), (x, -p / 2 - .5, z), .028, bois, seg=5)


def mur_loropeni(a):
    """Un pan d'enceinte de Loropéni : moellons de latérite, base large, jusqu'à 6 m de haut, sommet ruiné."""
    def pierre(u, v):
        ligne = np.floor(v * 26).astype(int)
        col = np.floor(u * 22 + ligne % 2 * .5).astype(int)
        joint = ((v * 26) % 1 < .12) | (((u * 22 + ligne % 2 * .5) % 1) < .08)
        return np.where(joint, 3, (col * 7 + ligne * 3) % 3)
    tex = M('laterite', image=image_motif('lat', ['#8c4a2a', '#74391f', '#9c5733', '#3d2316'], pierre, taille=1024, grain=.09), rugosite=.98)
    def bord(x):
        return 4.6 + .9 * math.sin(x * .9) + .45 * math.sin(x * 2.7 + 1) - (.2 * x if x > 3 else 0)
    n = 26
    largeur = 12
    base, haut = 1.0, .42
    for j, (sgn, vy) in enumerate(((-1, 0), (1, 0))):
        grille = a.grille(largeur, 1, tex, n=(n, 1), uv=(0, 0, 3, 1))
    # Le relief du mur est sculpté sommet par sommet
    verts = list(a.bm.verts)
    a.bm.verts.ensure_lookup_table()
    moitie = len(verts) // 2
    for k, v in enumerate(verts):
        cote = -1 if k < moitie else 1
        x, z_rel = v.co.x, v.co.z
        h = bord(x) * z_rel
        ep = base + (haut - base) * z_rel
        v.co.y = cote * ep / 2
        v.co.z = h
    # Le dessus, et de la végétation qui reprend le mur
    terre = M('sol', '#6a4a2a')
    a.boite((0, 0, .08), (largeur + 1.5, 3.2, .16), terre)
    for x in (-5.2, 5.0):
        a.boule(.32, M('buisson', '#4f6a2a'), (x, -.95, .3), (1.2, 1, .9), seg=9, anneaux=6)
    for x in np.linspace(-largeur / 2, largeur / 2 - .5, 22):
        z = bord(x)
        a.boite((x + .25, 0, z - .02), (.55, haut + .05, .14), tex, uv=(.1, .1, .3, .2))


# ---- Instruments

def tambour(a):
    """Tambour d'aisselle en sablier : les cordes tendues d'une peau à l'autre changent la hauteur du son."""
    tex = M('bois', image=image_motif('tb', [BOIS, BOIS_F], lambda u, v: (bande(.47, .53)(u, v)).astype(int) + (bande(.3, .34)(u, v)).astype(int) + (bande(.66, .7)(u, v)).astype(int)))
    a.tour([(.17, 0), (.13, .08), (.075, .28), (.075, .42), (.13, .62), (.17, .7)], tex, seg=20)
    peau = M('peau', PEAU, .7)
    for z in (0, .7):
        a.tour([(.2, z - .012), (.2, z + .012)], peau, seg=24)
    corde = M('corde', CORDE)
    for i in range(16):
        ang = i * math.pi / 8
        h, b = Vector((math.cos(ang) * .19, math.sin(ang) * .19, .7)), Vector((math.cos(ang + .2) * .19, math.sin(ang + .2) * .19, 0))
        milieu = Vector((math.cos(ang + .1) * .1, math.sin(ang + .1) * .1, .35))
        tube(a, [tuple(h), tuple(milieu), tuple(b)], [.008, .008, .008], corde, seg=4)
    a.tour([(.105, .32), (.105, .38)], M('lien', CUIR), seg=16)


def bendre(a):
    """Tambour-calebasse des bendré mossi : grande calebasse, peau, cordes verticales, tampon noir au centre."""
    cal = M('calebasse', '#b98a44', .55)
    a.tour([(.001, 0), (.13, .012), (.26, .09), (.34, .22), (.35, .36), (.3, .49), (.24, .55)], cal, seg=30)
    a.tour([(.255, .545), (.2, .575), (.001, .585)], M('peau', PEAU, .7), seg=30)
    a.tour([(.05, .584), (.001, .59)], M('tampon', NOIR, .45), seg=18)
    a.tour([(.262, .515), (.262, .562)], M('cercle', CUIR), seg=30)
    corde = M('corde', CORDE)
    for i in range(14):
        ang = i * math.pi / 7
        pts = [(math.cos(ang) * r, math.sin(ang) * r, z) for r, z in ((.262, .53), (.312, .49), (.36, .36), (.35, .22), (.27, .09))]
        tube(a, pts, [.006] * 5, corde, seg=4)
    a.tour([(.28, .08), (.27, .1)], M('anneau', CUIR), seg=26)


def xylophone(a, n, longueur, gourde_r, bois_lame, bois_cadre, membrane):
    """Lames de bois sur cadre, calebasses suspendues : balafon et gyil."""
    lame, cadre, lien = M('lame', bois_lame, .5), M('cadre', bois_cadre), M('lien', CUIR)
    cal = M('gourde', '#b98a44', .55)
    mem = M('membrane', '#d7d3c0', .4)
    H = .46
    pas = longueur / n
    for s in (-1, 1):
        a.cylindre((-longueur / 2 - .1, s * .17, H), (longueur / 2 + .1, s * .1, H), .018, cadre, seg=7)
        a.cylindre((-longueur / 2 - .1, s * .17, H - .1), (longueur / 2 + .1, s * .1, H - .1), .014, cadre, seg=6)
    for x, s in ((-longueur / 2, -1), (-longueur / 2, 1), (longueur / 2, -1), (longueur / 2, 1)):
        a.cylindre((x, s * (.17 if x < 0 else .1), H), (x * 1.02, s * .22, 0), .018, cadre, seg=6)
    for i in range(n):
        k = i / (n - 1)
        x = -longueur / 2 + pas * (i + .5)
        l = .46 - .22 * k
        a.boite((x, 0, H + .03), (pas * .76, l, .026), lame)
        a.cylindre((x, -l * .3, H + .02), (x, -l * .3, H - .1), .004, lien, seg=4)
        a.cylindre((x, l * .3, H + .02), (x, l * .3, H - .1), .004, lien, seg=4)
        r = gourde_r * (1 - .52 * k)
        a.boule(r, cal, (x, 0, H - .14 - r), (.94, .94, 1.15), seg=12, anneaux=8)
        if membrane:
            a.boule(r * .24, mem, (x, -r * .92, H - .14 - r * .85), (1, .25, 1), seg=8, anneaux=5)
    mail = M('maillet', BOIS_F)
    for dx in (-.14, .14):
        a.cylindre((dx, -.5, .02), (dx + .08, -.1, H + .1), .008, mail, seg=5)
        a.boule(.032, M('gomme', '#1c1610'), (dx, -.5, .03), seg=8, anneaux=5)


def balafon(a):
    xylophone(a, 12, 1.05, .082, '#9c6a33', BOIS_F, False)


def gyil(a):
    """Gyil dagara : 14 lames, une calebasse sous chacune, trous couverts de membranes qui donnent le son vibrant."""
    xylophone(a, 14, 1.25, .095, '#7d5126', '#2f1d0e', True)


# ---- Habits

def vetement(a, tex, poteau=True):
    """Boubou sur un porte-habit, manches écartées : la coupe laisse voir les motifs."""
    a.tour([(.62, 0), (.5, .55), (.36, 1.06), (.27, 1.3), (.12, 1.36), (.09, 1.4)], tex, Matrix.Translation((0, 0, .1)), seg=28, ellipse=(1, .32), uv_rep=(2, 1))
    for s in (-1, 1):
        a.grille(.72, .42, tex, Matrix.Translation((s * .52, -.015, 1.0)), n=(4, 2), hauteur_fn=lambda x, z: .02 * math.sin(x * 6), uv=(0, .55, .5, .95))
        a.grille(.72, .42, tex, Matrix.Translation((s * .52, .015, 1.0)), n=(4, 2), uv=(0, .55, .5, .95))
    if poteau:
        p = M('porte-habit', BOIS_F)
        a.cylindre((0, 0, 0), (0, 0, 1.56), .025, p, seg=8)
        a.cylindre((-.86, 0, 1.42), (.86, 0, 1.42), .02, p, seg=8)
        a.tour([(.3, 0), (.26, .03), (.03, .05)], p, seg=16)


def faso_dan_fani(a):
    motif = lambda u, v: np.take([0, 0, 1, 2, 1, 0, 3, 0, 0, 2, 3, 2], (u * 48).astype(int) % 12)
    vetement(a, M('fani', image=image_motif('fani', ['#23356f', '#efe6d0', '#b8322a', '#e0a43a'], motif, grain=.035), rugosite=.9))


def bogolan(a):
    motif = superposer(
        (bande(0, .25), lambda u, v: chevrons(u, v, 6, 18) % 2),
        (bande(.25, .29), 0),
        (bande(.29, .55), lambda u, v: losanges(u, v, 12, 11)),
        (bande(.55, .59), 0),
        (bande(.59, .8), lambda u, v: points(u, v, 18, 18, .3)),
        (bande(.8, 1), lambda u, v: damier(u, v, 14, 22)),
    )
    vetement(a, M('bogolan', image=image_motif('bogolan', ['#caa56a', '#2a1a10'], motif, grain=.07), rugosite=.95))


def dozo_fani(a):
    """Tenue de chasseur : bandes de coton teintées au bogolan, amulettes de cuir, cauris et petits miroirs."""
    motif = lambda u, v: np.take([0, 1, 0, 2, 0, 1], (u * 36).astype(int) % 6)
    vetement(a, M('dozo', image=image_motif('dozo', ['#a3854f', '#5c452a', '#7c6239'], motif, grain=.09), rugosite=.95))
    cuir, cauri, miroir = M('amulette', '#3a2413'), M('cauri', '#efe8d5', .4), M('miroir', '#c5ced2', .15, .9)
    for i, (x, z) in enumerate(((-.2, 1.08), (.14, 1.13), (-.28, .85), (.05, .9), (.28, .78), (-.1, .62), (.26, .52), (-.32, .45), (.02, .32))):
        y = -.17 - (1.2 - z) * .1
        a.boite((x, y, z), (.075, .022, .1), cuir)
        a.cylindre((x, y, z + .05), (x, y, z + .1), .004, cuir, seg=4)
    for i in range(14):
        ang = i / 14 * 2 * math.pi
        a.boule(.017, cauri, (math.cos(ang) * .14, -.2 + abs(math.sin(ang)) * .02, 1.28 + math.sin(ang) * .11 - .1), (1, .6, 1.4), seg=7, anneaux=5)
    a.boite((-.08, -.2, .98), (.05, .012, .05), miroir)
    # Le bonnet accroché en haut du porte-habit
    a.tour([(.1, 1.57), (.09, 1.64), (.05, 1.74), (.001, 1.78)], M('bonnet', '#5c452a'), seg=14)


def chapeau_sapone(a):
    tresse = M('paille', image=image_motif('sap', [PAILLE, '#946f33', '#3a2413'], lambda u, v: np.where((v > .86) & (losanges(u, v, 20, 22) > 0), 2, (u * 90).astype(int) % 2), grain=.06))
    a.tour([(.47, .02), (.28, .1), (.15, .21), (.1, .3), (.02, .4), (.001, .42)], tresse, seg=32, bouche=False)
    a.tour([(.47, .02), (.28, .085), (.15, .19), (.001, .24)], tresse, seg=32, bouche=False)
    cuir = M('cuir', CUIR)
    a.tour([(.103, .27), (.107, .31)], cuir, seg=22)
    a.tour([(.03, .395), (.04, .44), (.001, .47)], cuir, seg=12)
    a.tour([(.478, .012), (.478, .035)], cuir, seg=32)


def chapeau_peul(a):
    """Chapeau conique des bergers : paille tressée, cuir renforçant le sommet, le bord et la bride, bouton au sommet."""
    tresse = M('paille', image=image_motif('peul', ['#c8a55f', '#a07f3e'], lambda u, v: (u * 110).astype(int) % 2 ^ (v * 40).astype(int) % 2, grain=.05))
    a.tour([(.32, .012), (.2, .07), (.13, .17), (.09, .3), (.015, .46), (.001, .47)], tresse, seg=30, bouche=False)
    a.tour([(.32, .012), (.16, .06), (.001, .08)], tresse, seg=30, bouche=False)
    motif = superposer((bande(0, 1), 0), (bande(.1, .9), lambda u, v: damier(u, v, 8, 1) * 1))
    cuir = M('cuir', image=image_motif('cuirpeul', ['#5c3a1f', '#c04a2a'], motif, taille=256))
    a.tour([(.112, .23), (.075, .34), (.02, .47), (.032, .48), (.05, .52), (.001, .55)], cuir, seg=20)
    a.tour([(.33, .005), (.33, .03)], M('bord', '#5c3a1f'), seg=30)
    bride = M('bride', '#3f2813')
    for s in (-1, 1):
        tube(a, [(s * .16, 0, .06), (s * .14, -.02, -.13), (s * .05, -.04, -.26), (0, -.05, -.3)], [.007] * 4, bride, seg=4)


# ---- Masques (objets de musée : ni les rites ni le sens réservé aux initiés ne sont décrits)

def masque_bwa(a):
    """Masque-planche bwa : très haute planche, motifs géométriques rouges, blancs et noirs, face ronde aux yeux en cible."""
    ro, bl, no = '#8f3321', '#ece3cf', '#16110c'
    motif = superposer(
        (bande(0, 1), 1),
        (bande(.0, .16), lambda u, v: damier(u, v, 6, 8) * 2),
        (bande(.17, .3), lambda u, v: triangles(u, v, 6, 7.7) % 2 * 2),
        (bande(.31, .34), 0),
        (bande(.35, .5), lambda u, v: chevrons(u, v, 7, 4) % 3),
        (bande(.51, .54), 2),
        (bande(.55, .7), lambda u, v: losanges(u, v, 4, 6.67) * 2),
        (bande(.71, .74), 0),
        (bande(.75, .9), lambda u, v: damier(u, v, 8, 13.3) * 2),
        (bande(.91, 1), lambda u, v: triangles(u, v, 5, 11) % 2 * 2),
    )
    tex = M('planche', image=image_motif('bwa', [ro, bl, no], motif, taille=1024, grain=.05), rugosite=.85)
    bois = M('tranche', no)
    H, base = 2.1, .62
    largeur = lambda z: .42 - .1 * ((z - base) / (H - base))
    for c, (sgn) in enumerate((-1, 1)):
        a.grille(.42, H - base, tex, Matrix.Translation((0, sgn * .015, base)), n=(1, 8))
    a.boite((-.205, 0, (H + base) / 2), (.02, .04, H - base), bois)
    a.boite((.205, 0, (H + base) / 2), (.02, .04, H - base), bois)
    # Le croissant sous le sommet, et le crochet au-dessus de la face
    a.boite((0, 0, H + .012), (.44, .05, .025), bois)
    f = M('face', image=image_motif('face', [no, bl, ro], lambda u, v: np.select([np.hypot(u - .5, v - .5) < .12, np.hypot(u - .5, v - .5) < .3], [1, 2], 0), taille=256))
    ronde = M('fond', ro)
    a.tour([(.001, -.04), (.36, -.03), (.38, 0), (.36, .03), (.001, .04)], ronde, Matrix.Translation((0, 0, .36)) @ Matrix.Rotation(math.radians(90), 4, 'X'), seg=28)
    bande_ = M('frise', image=image_motif('frise', [bl, no], lambda u, v: triangles(u, v, 18, 2) % 2, taille=256))
    a.tour([(.33, -.05), (.33, .055)], bande_, Matrix.Translation((0, 0, .36)) @ Matrix.Rotation(math.radians(90), 4, 'X'), seg=28, bouche=False)
    for x in (-.15, .15):
        a.tour([(.001, 0), (.11, 0), (.1, .03), (.001, .035)], f, Matrix.Translation((x, -.05, .43)) @ Matrix.Rotation(math.radians(90), 4, 'X'), seg=22, bouche=False)
    a.cylindre((0, -.04, .36), (0, -.2, .08), .05, M('bec', no), r2=.015, seg=10)
    tube(a, arc_points((0, -.02, .75), (0, -.16, 1.0), .06, n=5, axe=(0, 1, 0)), [.03, .025, .02, .016, .012, .006], bois, seg=6)
    socle = M('socle', BOIS_F)
    a.boite((0, 0, -.015), (.5, .36, .03), socle)
    a.cylindre((0, .06, 0), (0, .06, .4), .012, socle, seg=6)
    a.cylindre((0, .06, .4), (0, .03, .4), .012, socle, seg=6)


def masque_karanga(a):
    """Karanga du Yatenga (nord mossi) : face à cornes d'antilope, longue planche étroite ajourée, gravée."""
    ro, bl, no = '#8a3522', '#e7dcc4', '#1c140e'
    t = M('peint', image=image_motif('kar', [no, bl, ro], lambda u, v: triangles(u, v, 4, 18) % 3, taille=512), rugosite=.85)
    no_m = M('noir', no)
    a.boule(.19, M('face', ro), (0, 0, .3), (.86, .5, 1.18), seg=20, anneaux=12)
    a.boite((0, -.095, .3), (.055, .05, .22), no_m)
    for s in (-1, 1):
        a.boule(.05, no_m, (s * .075, -.085, .36), (1, .3, .8), seg=10, anneaux=6)
        tube(a, [(s * .1, 0, .46), (s * .15, -.02, .7), (s * .1, -.02, .95), (s * .02, -.02, 1.08)], [.035, .03, .02, .004], no_m, seg=8)
    # La planche : deux montants et des barres, comme une échelle ajourée peinte
    H1, H2 = .46, 1.9
    a.boite((0, .025, H2 + .03), (.2, .03, .06), t)
    for s in (-1, 1):
        a.boite((s * .095, .025, (H1 + H2) / 2), (.03, .03, H2 - H1), t, uv=(0, 0, .2, 1))
    for z in np.linspace(H1 + .1, H2 - .05, 11):
        a.boite((0, .025, z), (.2, .025, .032), t, uv=(0, 0, 1, .1))
    a.boite((0, .025, (H1 + H2) / 2 + .35), (.05, .02, .6), no_m)


def masque_molo(a):
    """Molo bobo : masque-casque de buffle, grandes cornes recourbées, museau court."""
    bois = M('bois', image=image_motif('mol', ['#4d2d16', '#d7c9a9', '#8f3321'], lambda u, v: np.select([bande(.4, .46)(u, v) & (damier(u, v, 28, 2) > 0), bande(.62, .66)(u, v)], [1, 2], 0), grain=.1))
    no = M('noir', NOIR)
    a.boule(.25, bois, (0, 0, .28), (.86, .94, 1), seg=22, anneaux=14)
    a.cylindre((0, -.1, .2), (0, -.46, .04), .17, bois, r2=.075, seg=14)
    a.boule(.078, no, (0, -.47, .04), (1, .7, .75), seg=10, anneaux=6)
    for s in (-1, 1):
        a.boule(.05, no, (s * .13, -.2, .33), (1, .35, .85), seg=10, anneaux=6)
        a.boule(.075, bois, (s * .23, .03, .36), (1, .35, .55), seg=9, anneaux=6)
        tube(a, [(s * .16, .02, .46), (s * .34, 0, .6), (s * .46, -.03, .78), (s * .44, -.09, .99), (s * .32, -.17, 1.12)], [.058, .05, .037, .022, .004], no, seg=9)


def adone(a):
    """Adoné kurumba : cimier d'antilope assez naturaliste, tête allongée, longues cornes, houppe de fibres."""
    bois = M('bois', image=image_motif('ad', ['#7b3f22', '#efe3c7', '#16110c'], lambda u, v: np.select([bande(.32, .4)(u, v) & (triangles(u, v, 22, 12) % 2 > 0), bande(.55, .58)(u, v)], [1, 2], 0), grain=.09))
    no = M('noir', NOIR)
    tube(a, [(0, 0, .28), (0, -.02, .5), (0, -.12, .66)], [.1, .085, .075], bois, seg=12)
    a.cylindre((0, -.1, .66), (0, -.56, .46), .1, bois, r2=.038, seg=12)
    a.boule(.045, no, (0, -.56, .46), (.9, 1.1, .75), seg=10, anneaux=6)
    for s in (-1, 1):
        a.boule(.028, M('oeil', '#efe3c7'), (s * .068, -.27, .63), (.5, 1, .8), seg=9, anneaux=6)
        a.cylindre((s * .08, -.05, .7), (s * .2, .1, .74), .02, bois, r2=.006, seg=6)
        tube(a, [(s * .045, -.02, .72), (s * .075, .06, .98), (s * .1, .2, 1.26), (s * .11, .36, 1.5)], [.03, .025, .015, .003], no, seg=8)
    a.tour([(.18, .24), (.17, .28)], M('calotte', '#3b2212'), seg=18)
    fibre = M('fibre', '#b49a5a', .95)
    for i in range(36):
        ang = i / 36 * 2 * math.pi
        a.cylindre((math.cos(ang) * .17, math.sin(ang) * .17, .25), (math.cos(ang) * (.3 + .03 * (i % 3)), math.sin(ang) * (.3 + .03 * (i % 3)), 0), .016, fibre, r2=.002, seg=4)


def bateba(a):
    """Bateba lobi « ordinaire » (phuwe) : debout, droit, bras le long du corps, formes allongées en colonne."""
    b = M('bois', image=image_motif('bat', ['#5a3519', '#3f2311', '#6d4522'], lambda u, v: (u * 26 + np.sin(v * 9) * .7).astype(int) % 3, grain=.1), rugosite=.75)
    a.tour([(.15, 0), (.15, .035), (.11, .05)], b, seg=16)
    for s in (-1, 1):
        a.cylindre((s * .055, -.015, .04), (s * .055, 0, .38), .036, b, r2=.046, seg=10)
        a.cylindre((s * .055, 0, .38), (s * .06, 0, .56), .046, b, r2=.052, seg=10)
        a.cylindre((s * .125, 0, .95), (s * .14, .01, .7), .03, b, r2=.024, seg=9)
        a.cylindre((s * .14, .01, .7), (s * .125, -.02, .47), .024, b, r2=.02, seg=9)
        a.boule(.05, b, (s * .1, 0, .975), (1, 1, .8), seg=10, anneaux=6)
    a.tour([(.075, .54), (.09, .6), (.07, .76), (.085, .94), (.09, .98), (.03, 1.03), (.03, 1.12)], b, seg=16, ellipse=(1, .78))
    a.boule(.078, b, (0, -.01, 1.2), (.86, .96, 1.14), seg=16, anneaux=10)
    a.cylindre((0, -.08, 1.21), (0, -.09, 1.16), .012, b, r2=.018, seg=7)
    for s in (-1, 1):
        a.boule(.012, M('oeil', '#20130a'), (s * .03, -.074, 1.22), (1.4, .4, .8), seg=7, anneaux=5)
    a.boule(.082, M('coiffe', '#2a180b'), (0, .012, 1.255), (.82, .9, .62), seg=12, anneaux=7)


def tabouret_lobi(a):
    """Tabouret à trois pieds, taillé d'une pièce : long siège d'homme, porté sur l'épaule, tête saillante au bout."""
    b = M('bois', image=image_motif('tab', ['#6b4019', '#4a2a10', '#7f5126'], lambda u, v: (v * 16 + np.sin(u * 6) * .7).astype(int) % 3, grain=.09), rugosite=.5)
    pts = [(-.3, 0, .25), (-.15, 0, .215), (0, 0, .205), (.15, 0, .215), (.3, 0, .26)]
    tube(a, pts, [.05, .075, .08, .07, .038], b, seg=14)
    for x, y in ((-.21, -.075), (-.21, .075), (.18, 0)):
        a.cylindre((x, y * .4, .21), (x * 1.08, y, 0), .03, b, r2=.018, seg=9)
    a.cylindre((.3, 0, .26), (.38, 0, .31), .038, b, r2=.028, seg=9)
    a.boule(.038, b, (.4, 0, .325), (1.2, .85, 1), seg=11, anneaux=7)


# ---- Objets et outils des récits

def mortier_pilon(a):
    b = M('bois', image=image_motif('mor', ['#7b4c25', '#5f3819'], lambda u, v: (u * 30 + np.sin(v * 7)).astype(int) % 2, grain=.09))
    a.tour([(.17, 0), (.14, .04), (.1, .16), (.13, .3), (.2, .42), (.22, .52), (.2, .52), (.15, .36), (.08, .3), (.001, .3)], b, seg=22)
    a.tour([(.03, .3), (.025, .5), (.038, .78), (.027, 1.05), (.035, 1.4), (.03, 1.56)], M('pilon', '#a57c47'), Matrix.Translation((0, 0, 0)) @ Matrix.Rotation(math.radians(9), 4, 'Y'), seg=11)
    a.tour([(.2, .5), (.001, .505)], M('mil', '#d7c27a', .9), seg=22)


def daba(a):
    """La houe des cultivateurs : manche court et coudé, lame de fer forgé."""
    tube(a, [(-.32, 0, .3), (-.1, 0, .34), (.14, 0, .38), (.25, 0, .46)], [.024, .024, .026, .03], M('manche', BOIS), seg=9)
    fer = M('fer', FER, .55, .7)
    a.grille(.24, .34, fer, Matrix.Translation((.29, 0, .44)) @ Matrix.Rotation(math.radians(180 - 22), 4, 'Y') @ Matrix.Rotation(math.radians(90), 4, 'Z'),
             n=(4, 4), hauteur_fn=lambda x, z: x * x * .3)
    a.cylindre((.25, 0, .4), (.3, 0, .48), .018, fer, seg=7)
    a.boite((0, 0, .02), (.9, .2, .04), M('socle', BOIS_F))
    a.cylindre((-.2, 0, .04), (-.2, 0, .31), .012, M('s', BOIS_F), seg=6)
    a.cylindre((.2, 0, .04), (.2, 0, .37), .012, M('s2', BOIS_F), seg=6)


def soufflet(a):
    """Le soufflet du forgeron : deux poches de peau sur des bols de bois, qu'on actionne avec des bâtons."""
    b = M('bois', BOIS)
    peau = M('peau', '#a08255', .85)
    for s in (-1, 1):
        m = Matrix.Translation((-.08, s * .17, 0))
        a.tour([(.16, 0), (.17, .1), (.15, .13)], b, m, seg=18)
        a.tour([(.15, .13), (.17, .17), (.11, .21), (.02, .225)], peau, m, seg=18)
        a.cylindre((-.08, s * .17, .22), (-.08, s * .17, .68), .012, M('baton', '#c2a06a'), seg=7)
        a.cylindre((.06, s * .17, .06), (.45, s * .04, .05), .03, b, seg=8)
    a.cylindre((.45, 0, .05), (.72, 0, .03), .05, M('tuyere', '#7c4a28'), r2=.038, seg=10)
    for i in range(7):
        ang = i * 2.399
        a.boule(.06, M('charbon', '#1a1512', .95), (.82 + math.cos(ang) * .08, math.sin(ang) * .08, .05), seg=7, anneaux=5)
    a.boule(.08, M('braise', '#d9551c', emission=('#ff6a1f', 1.8)), (.82, 0, .03), (1, 1, .55), seg=8, anneaux=5)


def pirogue(a):
    motif = lambda u, v: np.where(bande(.76, .86)(u, v), 1, 0)
    b = M('bois', image=image_motif('pir', ['#5b3a1d', '#c9a35c'], motif, grain=.1))
    def profil(s):
        return [(s * .001, 0), (s * .2, .06), (s * .3, .2), (s * .32, .3), (s * .29, .3), (s * .26, .22), (s * .16, .12), (s * .001, .1)]
    for k in range(16):
        t0, t1 = k / 16, (k + 1) / 16
        x0, x1 = -2 + 4 * t0, -2 + 4 * t1
        w0, w1 = math.sin(math.pi * t0) ** .45 + .02, math.sin(math.pi * t1) ** .45 + .02
        p0, p1 = profil(1), profil(1)
        for j in range(len(p0) - 1):
            for s in (-1, 1):
                pts = [(x0, s * p0[j][0] * w0, p0[j][1] + .14 * abs(x0 / 2) ** 2.5), (x1, s * p1[j][0] * w1, p1[j][1] + .14 * abs(x1 / 2) ** 2.5),
                       (x1, s * p1[j + 1][0] * w1, p1[j + 1][1] + .14 * abs(x1 / 2) ** 2.5), (x0, s * p0[j + 1][0] * w0, p0[j + 1][1] + .14 * abs(x0 / 2) ** 2.5)]
                vs = [a.bm.verts.new(p) for p in pts]
                f = a.bm.faces.new(vs)
                f.material_index = a._mat(b)
                f.smooth = True
                for l, uv in zip(f.loops, ((t0, j / 7), (t1, j / 7), (t1, (j + 1) / 7), (t0, (j + 1) / 7))):
                    l[a.uv].uv = uv
    tube(a, [(-.6, -.42, .36), (0, -.1, .34), (.7, .3, .3)], [.015, .015, .015], M('perche', '#a57c47'), seg=6)
    a.boite((.1, 0, .22), (.1, .5, .03), b, uv=(0, 0, .2, .2))


def arc_fleches(a):
    """L'arc et le carquois, armes des archers de la guerre du Bani-Volta dans les récits."""
    b = M('bois', BOIS_F)
    pts = arc_points((0, 0, .02), (0, 0, 1.42), 0, n=10)
    pts = [(.17 * math.sin(math.pi * i / 10), 0, .02 + 1.4 * i / 10) for i in range(11)]
    tube(a, pts, [.009, .014, .017, .019, .021, .024, .021, .019, .017, .014, .009], b, seg=7)
    a.cylindre((0, 0, .02), (0, 0, 1.42), .003, M('corde', '#c9b58a'), seg=4)
    a.tour([(.016, .68), (.028, .7), (.028, .76), (.016, .78)], M('prise', CUIR), Matrix.Translation((.17, 0, 0)), seg=8)
    motif = superposer((bande(.1, .18), lambda u, v: damier(u, v, 18, 14)), (bande(.8, .88), lambda u, v: damier(u, v, 18, 14)))
    cq = M('cuir', image=image_motif('carq', ['#5e3b1e', '#d7c9a9'], motif, taille=256))
    m = Matrix.Translation((.5, .05, 0)) @ Matrix.Rotation(math.radians(-6), 4, 'Y')
    a.tour([(.05, 0), (.06, .05), (.062, .65), (.06, .72)], cq, m, seg=12)
    fl, fer = M('fleche', '#a68a5a'), M('fer', FER, .5, .7)
    for i in range(5):
        ang = i * 2.4
        x, y = .545 + math.cos(ang) * .022, .05 + math.sin(ang) * .022
        h = 1.0 + .03 * i
        a.cylindre((x, y, .68), (x + .012 * i - .02, y, h), .005, fl, seg=4)
        a.cylindre((x + .012 * i - .02, y, h), (x + .012 * i - .02, y, h + .07), .016, fer, r2=.001, seg=5)


def grenier(a):
    """Le grenier à mil, en terre, posé sur des pierres pour le garder du sol, coiffé de paille."""
    mur = M('terre', image=image_motif('gren', ['#a56b3c', '#9c6335', '#ab7243'], lambda u, v: (v * 10 + np.sin(u * 24) * .12).astype(int) % 3, grain=.08), rugosite=.95)
    a.tour([(.32, .3), (.56, .55), (.66, 1.1), (.56, 1.65), (.3, 1.88), (.26, 1.96)], mur, seg=24)
    pierre = M('pierre', '#6a6058', .95)
    for i in range(6):
        ang = i * math.pi / 3
        a.boule(.15, pierre, (math.cos(ang) * .3, math.sin(ang) * .3, .14), (1, 1, 1.05), seg=8, anneaux=6)
    toit = M('paille', image=image_motif('pg', [PAILLE, '#94743a'], lambda u, v: (u * 120).astype(int) % 2, grain=.09))
    a.tour([(.5, 1.84), (.34, 2.04), (.16, 2.26), (.001, 2.42)], toit, seg=20)
    a.boite((0, -.55, 1.5), (.28, .08, .3), M('trappe', '#3a2413'))


def etalon(a):
    tapis = M('tapis', image=image_motif('selle', ['#b8322a', '#e0a43a', '#16110c'], lambda u, v: bandes(u, v, 8), taille=256))
    robe = M('robe', '#ede6d8', .5)
    cheval(a, robe, M('crin', '#34241a'), M('sabot', '#2a2019'))
    a.boule(.34, tapis, (-.02, 0, 1.3), (1.05, .86, .62), seg=18, anneaux=10)
    cuir = M('bride', '#2c1a0d')
    a.tour([(.082, 0), (.082, .025)], cuir, Matrix.Translation((.96, 0, 1.62)) @ Matrix.Rotation(math.radians(62), 4, 'Y'), seg=12, bouche=False)


OBJETS = {
    'canari': (canari, {}), 'calebasse': (calebasse, {}), 'to': (to, {}), 'soumbala': (soumbala, {}), 'dolo': (dolo, {}), 'defenses': (defenses, {}), 'etalon': (etalon, {'angle': (35, 12)}),
    'case-ronde': (case_ronde_o, {}), 'maison-tiebele': (maison_tiebele, {'angle': (-22, 14)}), 'soukala': (soukala, {'angle': (-28, 22)}), 'mosquee-bobo': (mosquee_bobo, {'angle': (-28, 12)}), 'mur-loropeni': (mur_loropeni, {'angle': (-22, 12)}),
    'tambour': (tambour, {}), 'bendre': (bendre, {'angle': (-20, 32)}), 'balafon': (balafon, {'angle': (-25, 28)}), 'gyil': (gyil, {'angle': (-25, 28)}),
    'faso-dan-fani': (faso_dan_fani, {'angle': (-10, 8)}), 'bogolan': (bogolan, {'angle': (-10, 8)}), 'dozo-fani': (dozo_fani, {'angle': (-10, 8)}), 'chapeau-sapone': (chapeau_sapone, {'angle': (-20, 32)}), 'chapeau-peul': (chapeau_peul, {'angle': (-20, 20)}),
    'masque-bwa': (masque_bwa, {'angle': (-14, 6)}), 'masque-karanga': (masque_karanga, {'angle': (-18, 6)}), 'masque-molo': (masque_molo, {'angle': (-28, 8)}), 'adone': (adone, {'angle': (-52, 10)}), 'bateba': (bateba, {'angle': (-18, 8)}), 'tabouret-lobi': (tabouret_lobi, {'angle': (-20, 22)}),
    'mortier-pilon': (mortier_pilon, {'angle': (-20, 18)}), 'daba': (daba, {'angle': (-22, 22)}), 'soufflet': (soufflet, {'angle': (-22, 28)}), 'pirogue': (pirogue, {'angle': (-32, 22)}), 'arc-fleches': (arc_fleches, {'angle': (-12, 8)}), 'grenier': (grenier, {}),
}


def construire(id_):
    fn, reglages = OBJETS[id_]
    vider()
    a = Assembleur(id_)
    fn(a)
    o = a.objet(id_)
    recalculer_normales(o)
    taille = exporter_glb(os.path.join(SORTIE, 'patrimoine', f'{id_}.glb'))
    studio([o], **reglages)
    rendre(os.path.join(SORTIE, 'vignettes', f'{id_}.webp'))
    print(f'OK {id_} {taille // 1024} Ko', flush=True)


if __name__ == '__main__':
    for i in arguments() or OBJETS:
        construire(i)
