"""Formes réutilisées par le patrimoine, les personnages et les décors."""
import math

from mathutils import Matrix, Vector


def tube(a, points, rayons, mat, seg=8, os_=None):
    """Un tube le long d'une ligne brisée : défenses, cornes, cordes, branches."""
    for i in range(len(points) - 1):
        a.cylindre(points[i], points[i + 1], rayons[i], mat, r2=rayons[i + 1], seg=seg, os_=os_)


def arc_points(debut, fin, fleche, n=8, axe=(0, 0, 1)):
    d, f, ax = Vector(debut), Vector(fin), Vector(axe)
    return [tuple(d.lerp(f, i / n) + ax * (math.sin(math.pi * i / n) * fleche)) for i in range(n + 1)]


def case_ronde(a, x, y, r, h, mur, toit, sombre, seg=16, tourne=0.0):
    """Murs de banco et toit conique de paille, porte tournée vers -Y."""
    m = Matrix.Translation((x, y, 0))
    a.tour([(r * 1.03, 0), (r, h * 0.12), (r * 0.97, h)], mur, m, seg=seg)
    a.tour([(r * 1.32, h * 0.92), (r * 1.1, h * 1.08), (r * 0.72, h * 1.42), (r * 0.3, h * 1.85), (0.001, h * 2.08)], toit, m, seg=seg)
    p = Vector((math.sin(tourne), -math.cos(tourne), 0)) * r * 0.97
    a.boite((x + p.x, y + p.y, h * 0.36), (r * 0.56, r * 0.1, h * 0.72), sombre, tourne=(0, 0, tourne))


def baobab(a, x, y, h, ecorce, feuille, graine=1):
    """Tronc énorme et court, branches courtes au sommet."""
    m = Matrix.Translation((x, y, 0))
    r = h * 0.22
    a.tour([(r * 1.18, 0), (r, h * 0.2), (r * 0.82, h * 0.48), (r * 0.46, h * 0.68), (r * 0.2, h * 0.76)], ecorce, m, seg=12)
    for i in range(7):
        ang = i * 2.399 + graine
        fin = Vector((x + math.cos(ang) * h * 0.42, y + math.sin(ang) * h * 0.42, h * (0.84 + 0.1 * math.sin(i * 1.7))))
        tube(a, [(x, y, h * 0.66), tuple(Vector((x, y, h * 0.66)).lerp(fin, 0.55) + Vector((0, 0, h * 0.04))), tuple(fin)], [r * 0.26, r * 0.13, r * 0.04], ecorce, seg=6)
        a.boule(h * 0.15, feuille, tuple(fin + Vector((0, 0, h * 0.03))), (1.1, 1.1, 0.62), seg=8, anneaux=5)


def arbre(a, x, y, h, ecorce, feuille, graine=1):
    """Karité ou caïlcédrat : tronc droit, houppier large."""
    a.cylindre((x, y, 0), (x, y, h * 0.55), h * 0.07, ecorce, r2=h * 0.04, seg=8)
    for i in range(5):
        ang = i * 2.399 + graine
        c = (x + math.cos(ang) * h * 0.24, y + math.sin(ang) * h * 0.24, h * (0.68 + 0.08 * math.sin(i * 2.1)))
        a.boule(h * 0.26, feuille, c, (1.1, 1.1, 0.72), seg=9, anneaux=6)
    a.boule(h * 0.3, feuille, (x, y, h * 0.82), (1.1, 1.1, 0.7), seg=9, anneaux=6)


def cheval(a, robe, crin, sombre, os_=lambda n: None, x=0.0):
    """Cheval debout, face à +X. os_(nom) donne l'os d'une partie, pour le cheval animé."""
    h = 1.02
    a.boule(0.5, robe, (x, 0, h + 0.14), (1.2, 0.56, 0.62), os_=os_('corps'))
    a.cylindre((x + 0.42, 0, h + 0.24), (x + 0.82, 0, h + 0.72), 0.2, robe, r2=0.13, seg=10, os_=os_('cou'))
    a.boule(0.13, robe, (x + 0.84, 0, h + 0.74), (1, 0.85, 1), os_=os_('tete'))
    a.cylindre((x + 0.86, 0, h + 0.72), (x + 1.14, 0, h + 0.52), 0.11, robe, r2=0.075, seg=9, os_=os_('tete'))
    a.boule(0.078, sombre, (x + 1.15, 0, h + 0.51), (1, 0.9, 0.85), os_=os_('tete'))
    for s in (-1, 1):
        a.cylindre((x + 0.8, s * 0.05, h + 0.84), (x + 0.77, s * 0.07, h + 0.98), 0.03, robe, r2=0.004, seg=6, os_=os_('tete'))
        a.boule(0.024, sombre, (x + 0.93, s * 0.098, h + 0.73), os_=os_('tete'), seg=7, anneaux=5)
    # Crinière : une crête le long de l'encolure, et un toupet
    for i in range(6):
        t = i / 5
        c = Vector((x + 0.38, 0, h + 0.36)).lerp(Vector((x + 0.76, 0, h + 0.88)), t)
        a.boule(0.082, crin, tuple(c + Vector((-0.05, 0, 0.03))), (0.8, 0.45, 1.25), os_=os_('cou' if i < 5 else 'tete'), seg=7, anneaux=5)
    tube(a, [(x - 0.58, 0, h + 0.32), (x - 0.74, 0, h + 0.1), (x - 0.76, 0, h - 0.34)], [0.055, 0.085, 0.02], crin, seg=7, os_=os_('queue'))
    for nom, px, py in (('av_d', 0.36, -0.15), ('av_g', 0.36, 0.15), ('ar_d', -0.38, -0.15), ('ar_g', -0.38, 0.15)):
        hanche = h - 0.02
        a.cylindre((x + px, py, hanche + 0.14), (x + px, py, 0.48), 0.082, robe, r2=0.05, seg=8, os_=os_(f'{nom}_h'))
        a.cylindre((x + px, py, 0.5), (x + px, py, 0.07), 0.046, robe, r2=0.036, seg=8, os_=os_(f'{nom}_b'))
        a.cylindre((x + px, py, 0.08), (x + px, py, 0), 0.058, sombre, r2=0.066, seg=8, os_=os_(f'{nom}_b'))
