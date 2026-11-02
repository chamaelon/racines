#!/usr/bin/env python3
"""
Racines — chaîne de voix off et de doublage.

  python outils/doublage.py scripts      lit doublage/sources/*.txt, vérifie le minutage et produit,
                                         pour chaque film : doublage/<film>/script-fr.md, fr.vtt, fr.srt,
                                         traduction.csv, et site/commun/doublage/<film>.js (pour le lecteur).
  python outils/doublage.py audio [film…] génère les pistes audio/<film>/voix-fr.mp3, ambiance.mp3, musique.mp3.
  python outils/doublage.py pistes       met à jour site/commun/pistes.js d'après les fichiers de audio/
                                         (à relancer quand on ajoute une voix voix-mos.mp3, voix-dyu.mp3…).
  python outils/doublage.py videos-web [film…]  vidéos 720p avec pistes audio intégrées, dans videos-web/.

Dépendances pour « audio » : pip install edge-tts numpy ; ffmpeg (voir README). La voix française est une
voix de synthèse (service en ligne Microsoft), à remplacer dès qu'un vrai conteur l'enregistre.
"""
import asyncio, csv, glob, hashlib, json, os, re, shutil, subprocess, sys, tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES = os.path.join(RACINE, 'doublage', 'sources')
DUREES_VOIX = os.path.join(SOURCES, 'durees-voix.json')
WEB = os.path.join(RACINE, 'site', 'commun', 'doublage')
AUDIO = os.path.join(RACINE, 'audio')
CACHE = os.path.join(tempfile.gettempdir(), 'racines-tts')

# Durée réelle de chaque film (site/commun/durees.txt, relevée sur les timelines).
DUREES = {l.split()[0]: float(l.split()[1]) for l in open(os.path.join(RACINE, 'site', 'commun', 'durees.txt'), encoding='utf8') if l.strip()}

LANGUES = {'fr': 'Français', 'mos': 'Mooré', 'dyu': 'Dioula', 'fuf': 'Fulfulde', 'bwa': 'Bwamu', 'gux': 'Gulmancema', 'knc': 'Kasem', 'lob': 'Lobiri', 'dga': 'Dagara', 'bib': 'Bissa', 'son': 'Songhaï'}

CLASSES = {  # classe de rôle → (voix edge-tts, décalage de hauteur)
    'n':  ('fr-FR-HenriNeural', '+0Hz'),
    'h':  ('fr-FR-RemyMultilingualNeural', '+0Hz'),
    'h2': ('fr-CH-FabriceNeural', '+0Hz'),
    'f':  ('fr-FR-DeniseNeural', '+0Hz'),
    'f2': ('fr-FR-VivienneMultilingualNeural', '+0Hz'),
    'a':  ('fr-BE-GerardNeural', '-8Hz'),
    'e':  ('fr-FR-EloiseNeural', '+0Hz'),
    'c':  ('fr-FR-HenriNeural', '-18Hz'),
    'g':  ('fr-CA-JeanNeural', '+0Hz'),
}


def tc(s):
    m = re.fullmatch(r'(\d+):(\d+(?:\.\d+)?)', s.strip())
    if not m:
        raise ValueError(f'minutage illisible : {s!r}')
    return int(m.group(1)) * 60 + float(m.group(2))


def fmt(t, sep='.'):
    h, r = divmod(t, 3600)
    mn, s = divmod(r, 60)
    return f'{int(h):02d}:{int(mn):02d}:{int(s):02d}{sep}{int(round((s - int(s)) * 1000)):03d}'


def court(t):
    return f'{int(t // 60)}:{t % 60:04.1f}'


def lire_sources():
    films, f = {}, None
    for chemin in sorted(glob.glob(os.path.join(SOURCES, '*.txt'))):
        for n, ligne in enumerate(open(chemin, encoding='utf8'), 1):
            ligne = ligne.strip()
            if not ligne or (ligne.startswith('#') and not ligne.startswith('#roles')):
                continue
            if ligne.startswith('==='):
                f = {'id': ligne[3:].strip(), 'roles': {'N': 'n'}, 'amb': [], 'mus': [], 'sfx': [], 'cues': []}
                films[f['id']] = f
            elif ligne.startswith('#roles'):
                f['roles'].update(dict(x.split('=') for x in ligne.split()[1:]))
            elif ligne[:4] in ('@amb', '@mus', '@sfx'):
                for bout in ligne[5:].split(';'):
                    p = bout.split()
                    f[ligne[1:4]].append({'t': tc(p[0]), 'nom': p[1], 'duree': float(p[2]) if len(p) > 2 else None})
            elif ligne.startswith('?arret'):
                p = ligne[7:].split('|')
                f['arret'] = question(p[1:], tc(p[0]))
            elif ligne.startswith('?quiz'):
                f['quiz'] = question(ligne[6:].split('|'))
            else:
                p = ligne.split('|', 3)
                if len(p) != 4:
                    raise ValueError(f'{chemin}:{n} ligne incomplète : {ligne}')
                f['cues'].append({'d': tc(p[0]), 'r': p[1], 'ton': p[2], 't': p[3]})
    return films


def question(p, t=None):
    rep = [x.lstrip('*') for x in p[1:-1]]
    bonne = next(i for i, x in enumerate(p[1:-1]) if x.startswith('*'))
    q = {'q': p[0], 'rep': rep, 'bonne': bonne, 'note': p[-1]}
    if t is not None:
        q['t'] = t
    return q


def fixer_fins(f, durees):
    """Fin de chaque réplique : durée de la voix si elle est connue, sinon estimée (15 caractères/s)."""
    fin_film = DUREES[f['id']]
    for i, c in enumerate(f['cues']):
        suiv = f['cues'][i + 1]['d'] if i + 1 < len(f['cues']) else fin_film
        d = durees.get(f"{f['id']}/{i}") or len(c['t']) / 15
        c['f'] = round(max(c['d'] + 0.6, min(c['d'] + d + 0.2, suiv - 0.05)), 2)
        c['besoin'] = d
        c['place'] = suiv - c['d']


def verifier(films):
    pb = []
    for id_, f in films.items():
        if id_ not in DUREES:
            pb.append(f'{id_} : film inconnu')
            continue
        for a, b in zip(f['cues'], f['cues'][1:]):
            if b['d'] <= a['d']:
                pb.append(f"{id_} {court(b['d'])} : répliques dans le désordre")
        for c in f['cues']:
            if c['r'] not in f['roles']:
                pb.append(f"{id_} {court(c['d'])} : rôle sans classe : {c['r']}")
            if c['besoin'] > c['place'] + 0.3:
                pb.append(f"{id_} {court(c['d'])} {c['r']} : {c['besoin']:.1f} s pour {c['place']:.1f} s de place : {c['t'][:50]}")
        if f['cues'][-1]['d'] > DUREES[id_]:
            pb.append(f'{id_} : réplique après la fin du film')
        if 'arret' not in f or 'quiz' not in f:
            pb.append(f'{id_} : question manquante')
    return pb


def scenes_film(id_):
    """Le découpage en scènes, relevé dans scenes.js (pour le menu de la version vidéo)."""
    src = open(os.path.join(RACINE, 'histoires', id_, 'scenes.js'), encoding='utf8').read()
    t, res = 0.0, []
    for nom, duree in re.findall(r"R\.scene\('((?:[^'\\]|\\.)*)',\s*([\d.]+)", src):
        res.append({'nom': nom.replace("\\'", "'"), 'd': round(t, 2)})
        t += float(duree)
    return res


def ecrire_scripts(films):
    os.makedirs(WEB, exist_ok=True)
    catalogue = open(os.path.join(RACINE, 'site', 'commun', 'catalogue.js'), encoding='utf8').read()
    for id_, f in films.items():
        d = os.path.join(RACINE, 'doublage', id_)
        os.makedirs(d, exist_ok=True)
        m = re.search(r"dossier: '" + id_ + r"', titre: '((?:[^'\\]|\\.)*)'", catalogue)
        titre = m.group(1).replace("\\'", "'") if m else id_
        duree = DUREES[id_]
        # Script de jeu pour les comédiens et les traducteurs
        L = [f'# {titre} — script de voix off et de doublage', '',
             f'Film : `{id_}` · durée {court(duree)} · 25 images/s. Les minutages (min:s) sont ceux du film.', '',
             '## Rôles', '', '| Rôle | Répliques | Type de voix |', '|---|---|---|']
        noms = {'n': 'narration', 'h': 'homme', 'h2': 'homme (2)', 'f': 'femme', 'f2': 'femme (2)', 'a': 'personne âgée', 'e': 'enfant', 'c': 'esprit, créature : voix grave', 'g': 'griot, griotte'}
        for r, cl in f['roles'].items():
            nb = sum(1 for c in f['cues'] if c['r'] == r)
            if nb:
                L.append(f"| {'NARRATEUR' if r == 'N' else r} | {nb} | {noms[cl]} |")
        L += ['', '## Texte minuté', '', '| Début | Fin | Rôle | Ton | Texte | Place |', '|---|---|---|---|---|---|']
        for c in f['cues']:
            L.append(f"| {court(c['d'])} | {court(c['f'])} | {'NARRATEUR' if c['r'] == 'N' else c['r']} | {c['ton']} | {c['t']} | {c['place']:.1f} s |")
        L += ['', '## Pistes sonores', '', '| Piste | Repères |', '|---|---|',
              '| Ambiance | ' + ' · '.join(f"{court(x['t'])} {x['nom']}" for x in f['amb']) + ' |',
              '| Musique | ' + ' · '.join(f"{court(x['t'])} {x['nom']}" for x in f['mus']) + ' |',
              '| Effets | ' + (' · '.join(f"{court(x['t'])} {x['nom']}" for x in f['sfx']) or '—') + ' |', '',
              '## Interaction', '',
              f"- Arrêt du griot à {court(f['arret']['t'])} : {f['arret']['q']}",
              f"- Question de fin : {f['quiz']['q']}", '']
        open(os.path.join(d, 'script-fr.md'), 'w', encoding='utf8').write('\n'.join(L))
        # Sous-titres
        vtt, srt = ['WEBVTT', ''], []
        for i, c in enumerate(f['cues'], 1):
            voix = '' if c['r'] == 'N' else f"<v {c['r'].capitalize()}>"
            vtt += [f"{fmt(c['d'])} --> {fmt(c['f'])}", voix + c['t'], '']
            srt += [str(i), f"{fmt(c['d'], ',')} --> {fmt(c['f'], ',')}", ('' if c['r'] == 'N' else c['r'].capitalize() + ' : ') + c['t'], '']
        open(os.path.join(d, 'fr.vtt'), 'w', encoding='utf8').write('\n'.join(vtt))
        open(os.path.join(d, 'fr.srt'), 'w', encoding='utf8').write('\n'.join(srt))
        # Feuille à remplir par les traducteurs
        with open(os.path.join(d, 'traduction.csv'), 'w', encoding='utf-8-sig', newline='') as t:
            w = csv.writer(t, delimiter=';')
            w.writerow(['n', 'debut', 'fin', 'place_s', 'role', 'ton', 'francais', 'mooré', 'dioula', 'fulfulde', 'autre_langue'])
            for i, c in enumerate(f['cues'], 1):
                w.writerow([i, court(c['d']), court(c['f']), f"{c['place']:.1f}", c['r'], c['ton'], c['t'], '', '', '', ''])
        # Données pour le lecteur (sans fetch : le site marche aussi en file://)
        web = {'cues': [{'d': c['d'], 'f': c['f'], 'r': c['r'], 't': c['t'], 'ton': c['ton']} for c in f['cues']],
               'arret': f['arret'], 'quiz': f['quiz'], 'scenes': scenes_film(id_)}
        open(os.path.join(WEB, id_ + '.js'), 'w', encoding='utf8').write(
            'window.DOUBLAGE=' + json.dumps(web, ensure_ascii=False, separators=(',', ':')) + ';\n')


def cmd_scripts():
    films = lire_sources()
    durees = json.load(open(DUREES_VOIX)) if os.path.exists(DUREES_VOIX) else {}
    for f in films.values():
        fixer_fins(f, durees)
    pb = verifier(films)
    ecrire_scripts(films)
    nb_mots = sum(len(c['t'].split()) for f in films.values() for c in f['cues'])
    nb_cues = sum(len(f['cues']) for f in films.values())
    print(f'{len(films)} films, {nb_cues} répliques, {nb_mots} mots. Scripts écrits dans doublage/<film>/.')
    for p in pb:
        print('  À REVOIR', p)
    print(f'{len(pb)} problème(s) de minutage' + ('' if durees else ' (estimation : lancer « audio » pour les durées réelles)'))
    return films


# =================================================================== audio

def ffmpeg():
    for c in (os.environ.get('FFMPEG'), os.path.expanduser(r'~\outils\ffmpeg\bin\ffmpeg.exe'), shutil.which('ffmpeg')):
        if c and os.path.exists(c):
            return c
    sys.exit('ffmpeg introuvable (variable FFMPEG, %USERPROFILE%\\outils\\ffmpeg ou PATH).')


SR = 24000


def decoder(chemin):
    import numpy as np
    r = subprocess.run([ffmpeg(), '-v', 'error', '-i', chemin, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.int16).astype(np.float32) / 32768


def encoder(x, chemin, debit):
    import numpy as np
    pcm = (np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()
    subprocess.run([ffmpeg(), '-y', '-v', 'error', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-i', '-', '-c:a', 'libmp3lame', '-b:a', debit, chemin], input=pcm, check=True)


async def tts(texte, voix, hauteur, vitesse):
    import edge_tts
    os.makedirs(CACHE, exist_ok=True)
    cle = hashlib.sha1(f'{texte}|{voix}|{hauteur}|{vitesse}'.encode()).hexdigest()
    p = os.path.join(CACHE, cle + '.mp3')
    if not os.path.exists(p) or os.path.getsize(p) == 0:
        for essai in range(5):
            try:
                c = edge_tts.Communicate(texte, voix, rate=f'{vitesse:+d}%', pitch=hauteur)
                await c.save(p + '.tmp')
                os.replace(p + '.tmp', p)
                break
            except Exception as e:
                if essai == 4:
                    raise
                await asyncio.sleep(2 + essai * 3)
    return p


async def voix_film(f, sem):
    """Synthétise les répliques ; accélère légèrement celles qui dépassent leur place."""
    import numpy as np
    duree = DUREES[f['id']]

    async def une(i, c):
        voix, hauteur = CLASSES[f['roles'][c['r']]]
        place = (f['cues'][i + 1]['d'] if i + 1 < len(f['cues']) else duree) - c['d'] - 0.1
        base = -6 if c['ton'] in ('solennel', 'très doux', 'doux', 'recueilli', 'chuchoté') else (8 if c['ton'] == 'enlevé' else -2)
        async with sem:
            v = base
            while True:
                p = await tts(c['t'], voix, hauteur, v)
                a = await asyncio.to_thread(decoder, p)
                if len(a) / SR <= place or v >= 30:
                    return i, a, v
                v = min(30, v + max(4, int(100 * (len(a) / SR / place - 1))))

    res = await asyncio.gather(*(une(i, c) for i, c in enumerate(f['cues'])))
    piste = np.zeros(int(duree * SR) + SR, dtype=np.float32)
    durees = {}
    for i, a, v in res:
        d = int(f['cues'][i]['d'] * SR)
        piste[d:d + len(a)] += a[:max(0, len(piste) - d)]
        durees[f"{f['id']}/{i}"] = round(len(a) / SR, 2)
    return piste[:int(duree * SR)], durees


# Synthèse des ambiances et de la musique : boucles circulaires, donc sans raccord audible.
LONG = 32 * SR


def bruit(graine, bas, haut, n=LONG):
    import numpy as np
    rng = np.random.default_rng(graine)
    s = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    s *= (f >= bas) * (f <= haut) / np.maximum(f, 40) ** 0.5
    x = np.fft.irfft(s, n)
    return x / (np.abs(x).max() + 1e-9)


def lfo(graine, rapidite, n=LONG):
    """Enveloppe lente, périodique et aléatoire, entre 0 et 1."""
    import numpy as np
    rng = np.random.default_rng(graine)
    k = max(2, int(n / SR * rapidite))
    s = np.zeros(n // 2 + 1, dtype=complex)
    s[1:k] = rng.standard_normal(k - 1) + 1j * rng.standard_normal(k - 1)
    x = np.fft.irfft(s, n)
    return (x - x.min()) / (np.ptp(x) + 1e-9)


def poser(buf, son, t):
    """Ajoute un son dans une boucle circulaire."""
    import numpy as np
    i = (np.arange(len(son)) + int(t * SR)) % len(buf)
    np.add.at(buf, i, son)


def tps(d):
    import numpy as np
    return np.arange(int(d * SR)) / SR


def mallet(fr, d=0.7, force=1.0):
    import numpy as np
    t = tps(d)
    return force * (np.sin(2 * np.pi * fr * t) * np.exp(-t * 7) + 0.35 * np.sin(2 * np.pi * fr * 3.93 * t) * np.exp(-t * 22) + 0.12 * np.sin(2 * np.pi * fr * 9.2 * t) * np.exp(-t * 60))


def pince(fr, d=1.6, force=1.0):
    import numpy as np
    t = tps(d)
    x = sum(np.sin(2 * np.pi * fr * h * t) * np.exp(-t * (2.2 + h * 1.1)) / h ** 1.1 for h in range(1, 7))
    return force * x * (1 - np.exp(-t * 400))


def tambour(fr=95, d=0.5, force=1.0):
    import numpy as np
    t = tps(d)
    return force * (np.sin(2 * np.pi * fr * t * (1 + 0.6 * np.exp(-t * 28))) * np.exp(-t * 11) + 0.25 * np.random.default_rng(int(fr)).standard_normal(len(t)) * np.exp(-t * 60))


def claque(graine=1, force=1.0):
    import numpy as np
    t = tps(0.09)
    return force * np.random.default_rng(graine).standard_normal(len(t)) * np.exp(-t * 70)


def reverbe(x, duree=1.6, part=0.3):
    import numpy as np
    n = len(x)
    t = np.arange(n) / SR
    rep = np.random.default_rng(9).standard_normal(n) * np.exp(-t * 6 / duree)
    w = np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(rep), n)
    return x + part * w / (np.abs(w).max() + 1e-9) * np.abs(x).max()


def norme(x, pic=0.9):
    import numpy as np
    return x * pic / (np.abs(x).max() + 1e-9)


GAMME = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99]  # pentatonique de la


def musique_boucle(nom):
    import numpy as np
    rng = np.random.default_rng(sum(map(ord, nom)))
    b = np.zeros(LONG, dtype=np.float32)
    if nom == 'conte':
        pas = 60 / 92 / 2
        motif = [0, 2, 4, 5, 4, 2, 3, 1]
        for i in range(int(32 / pas)):
            poser(b, pince(GAMME[motif[i % 8] + (2 if i // 16 % 2 else 0)], 1.5, 0.55 if i % 2 else 0.8), i * pas)
            if i % 4 == 2:
                poser(b, claque(i, 0.1), i * pas)
        b = reverbe(b, 1.5, 0.25)
    elif nom == 'epique':
        pas = 60 / 118 / 2
        for i in range(int(32 / pas)):
            if i % 8 in (0, 3, 6):
                poser(b, tambour(78, 0.5, 0.95), i * pas)
            if i % 8 in (2, 5, 7):
                poser(b, tambour(190, 0.25, 0.55), i * pas)
            if i % 2 == 0:
                poser(b, mallet(GAMME[[0, 0, 2, 1][i // 8 % 4]] / 2, 0.5, 0.45), i * pas)
        b = reverbe(b, 1.0, 0.15)
    elif nom == 'triste':
        pas = 60 / 58
        motif = [5, 4, 2, 1, 2, 0, 1, 0]
        for i in range(int(32 / pas)):
            poser(b, pince(GAMME[motif[i % 8]], 3.0, 0.8), i * pas)
        t = np.arange(LONG) / SR
        b += 0.10 * np.sin(2 * np.pi * 110 * t) * lfo(3, 0.3) + 0.06 * np.sin(2 * np.pi * 165 * t)
        b = reverbe(b, 2.5, 0.35)
    elif nom == 'mystere':
        t = np.arange(LONG) / SR
        b += 0.28 * np.sin(2 * np.pi * 55 * t) * lfo(1, 0.2) + 0.16 * np.sin(2 * np.pi * 82.5 * t) * lfo(2, 0.25) + 0.05 * np.sin(2 * np.pi * 220 * t) * lfo(4, 0.5)
        for _ in range(16):
            poser(b, mallet(GAMME[rng.integers(4, 10)], 1.0, rng.uniform(0.15, 0.45)), rng.uniform(0, 32))
        b = reverbe(b, 3.0, 0.5)
    elif nom == 'fete':
        pas = 60 / 132 / 2
        motif = [0, 2, 4, 2, 5, 4, 2, 4, 6, 5, 4, 2, 4, 2, 1, 2]
        for i in range(int(32 / pas)):
            poser(b, mallet(GAMME[motif[i % 16]], 0.45, 0.7), i * pas)
            if i % 8 in (0, 3, 6):
                poser(b, tambour(90, 0.4, 0.8), i * pas)
            if i % 8 in (2, 4, 7):
                poser(b, tambour(210, 0.2, 0.45), i * pas)
            poser(b, claque(i, 0.1 if i % 2 else 0.2), i * pas)
        b = reverbe(b, 0.8, 0.12)
    elif nom == 'doux':
        pas = 60 / 66
        motif = [2, 4, 5, 4, 2, 1, 2, 0]
        for i in range(int(32 / pas)):
            poser(b, pince(GAMME[motif[i % 8] + 2], 2.6, 0.55), i * pas)
        t = np.arange(LONG) / SR
        b += 0.05 * np.sin(2 * np.pi * 110 * t) * lfo(5, 0.2)
        b = reverbe(b, 2.2, 0.4)
    elif nom == 'griot':
        pas = 60 / 84 / 2
        motif = [0, 1, 2, 4, 2, 1, 2, 0]
        for i in range(int(32 / pas)):
            poser(b, pince(GAMME[motif[i % 8] + 1], 1.3, 0.65), i * pas)
            if i % 4 == 0:
                poser(b, tambour(120, 0.3, 0.45), i * pas)
        b = reverbe(b, 1.4, 0.25)
    else:
        raise ValueError(f'musique inconnue : {nom}')
    return norme(b, 0.85)


def ambiance_boucle(nom):
    import numpy as np
    rng = np.random.default_rng(sum(map(ord, nom)) + 7)
    t = np.arange(LONG) / SR

    def grillons(graine, fr=4300, f_chant=14):
        am = np.clip(np.sin(2 * np.pi * f_chant * t), 0, 1) ** 2 * (lfo(graine, 0.6) > 0.4)
        return np.sin(2 * np.pi * fr * t) * am

    def oiseaux(n, graine):
        o = np.zeros(LONG, dtype=np.float32)
        r = np.random.default_rng(graine)
        for _ in range(n):
            f0 = r.uniform(2200, 3800)
            for k in range(r.integers(2, 5)):
                d = tps(0.12)
                s = np.sin(2 * np.pi * (f0 * d + r.uniform(-3000, 3000) * d ** 2)) * np.sin(np.pi * d / 0.12) ** 2
                poser(o, s, r.uniform(0, 32) if k == 0 else 0)
        return o

    if nom == 'vent':
        x = bruit(1, 90, 900) * (0.35 + 0.65 * lfo(2, 0.3))
    elif nom == 'savane':
        x = 0.5 * bruit(3, 100, 700) * (0.4 + 0.6 * lfo(4, 0.25)) + 0.06 * grillons(5) + 0.10 * oiseaux(10, 6)
    elif nom == 'nuit':
        x = 0.16 * bruit(7, 80, 500) * lfo(8, 0.2) + 0.13 * grillons(9) + 0.08 * grillons(10, 3700, 9)
        for s in (5, 19):
            d = tps(1.1)
            poser(x, 0.22 * np.sin(2 * np.pi * 390 * d) * np.sin(np.pi * d / 1.1) ** 2, s)
    elif nom == 'village':
        x = 0.28 * bruit(11, 180, 1300) * (0.3 + 0.7 * lfo(12, 1.5)) + 0.08 * bruit(13, 80, 400) + 0.05 * oiseaux(6, 14)
        for s in np.arange(2, 30, 7.3):
            for k in range(4):
                poser(x, tambour(75, 0.25, 0.10), s + k * 0.8)
    elif nom == 'foule':
        x = 0.7 * bruit(15, 250, 2400) * (0.45 + 0.55 * lfo(16, 3)) + 0.2 * bruit(17, 120, 600)
    elif nom == 'eau':
        x = 0.55 * bruit(18, 500, 7000) * (0.6 + 0.4 * lfo(19, 6))
        for _ in range(60):
            d = tps(0.06)
            f0 = rng.uniform(500, 1500)
            poser(x, 0.1 * np.sin(2 * np.pi * (f0 * d + 2500 * d ** 2)) * np.exp(-d * 45), rng.uniform(0, 32))
    elif nom == 'pluie':
        x = 0.7 * bruit(20, 1400, 9000) * (0.8 + 0.2 * lfo(21, 2)) + 0.2 * bruit(22, 100, 600)
    elif nom == 'orage':
        x = 0.5 * bruit(23, 1400, 9000) + 0.65 * bruit(24, 30, 180) * lfo(25, 0.6)
    elif nom == 'cosmos':
        x = 0.22 * np.sin(2 * np.pi * 48 * t) * lfo(26, 0.2) + 0.12 * np.sin(2 * np.pi * 72 * t) * lfo(27, 0.3) + 0.1 * bruit(28, 2000, 7000) * lfo(29, 0.5)
        x = reverbe(x, 3.0, 0.4)
    else:
        raise ValueError(f'ambiance inconnue : {nom}')
    return norme(x, 0.7)


def effet(nom, duree):
    """Un effet ponctuel ; duree (s) s'applique aux effets répétés."""
    import numpy as np
    d = duree or {'galop': 5, 'pilon': 8, 'tambour': 6, 'mains': 8, 'hache': 6, 'marteau': 5, 'vent': 6, 'balafon': 10}.get(nom, 2)
    x = np.zeros(int((d + 1.5) * SR), dtype=np.float32)

    def p(son, t):
        i = int(t * SR)
        n = min(len(son), len(x) - i)
        if n > 0:
            x[i:i + n] += son[:n]

    if nom == 'galop':
        t0 = 0.0
        while t0 < d:
            for k, dt in enumerate((0, 0.11, 0.24)):
                p(tambour(70 + k * 12, 0.15, 0.6), t0 + dt)
            t0 += 0.46
    elif nom == 'pilon':
        for t0 in np.arange(0, d, 0.95):
            p(tambour(62, 0.3, 1.0), t0)
    elif nom == 'tambour':
        for i, t0 in enumerate(np.arange(0, d, 0.27)):
            if i % 8 in (0, 3, 5, 6):
                p(tambour(85 if i % 8 in (0, 3) else 165, 0.4, 0.9), t0)
    elif nom == 'mains':
        rng = np.random.default_rng(5)
        for i, t0 in enumerate(np.arange(0, d, 0.42)):
            for k in range(5):
                p(claque(i * 7 + k, 0.4), t0 + rng.uniform(0, 0.035))
    elif nom == 'hache':
        for t0 in np.arange(0, d, 1.1):
            p(tambour(140, 0.18, 1.0) + claque(3, 0.6)[:int(0.18 * SR)].sum() * 0, t0)
            p(claque(int(t0 * 10), 0.6), t0)
    elif nom == 'marteau':
        tt = tps(0.5)
        son = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 12) for f in (1320, 2710, 4180)) / 3
        for t0 in np.arange(0, d, 0.8):
            p(son, t0)
    elif nom == 'vent':
        n = int(d * SR)
        v = bruit(31, 150, 1600, n) * np.sin(np.pi * np.arange(n) / n) ** 2
        p(v, 0)
    elif nom == 'balafon':
        rng = np.random.default_rng(11)
        motif = [4, 6, 5, 7, 6, 4, 5, 3]
        for i, t0 in enumerate(np.arange(0, d, 0.3)):
            p(mallet(GAMME[motif[i % 8]], 0.5, rng.uniform(0.5, 0.9)), t0)
    elif nom == 'tonnerre':
        n = int(3.5 * SR)
        p(bruit(32, 25, 260, n) * np.exp(-np.arange(n) / SR * 1.2) * 1.0 + 0.4 * bruit(33, 800, 4000, n) * np.exp(-np.arange(n) / SR * 12), 0)
    elif nom == 'impact':
        p(tambour(58, 0.4, 1.0), 0)
        p(claque(4, 0.7), 0)
    elif nom == 'fleche':
        n = int(0.35 * SR)
        p(bruit(34, 1200, 6000, n) * np.sin(np.pi * np.arange(n) / n) ** 2 * 0.6, 0)
    elif nom == 'fusil':
        n = int(0.5 * SR)
        p(bruit(35, 200, 6000, n) * np.exp(-np.arange(n) / SR * 18), 0)
    elif nom == 'plouf':
        n = int(0.9 * SR)
        tt = np.arange(n) / SR
        p(bruit(36, 300, 5000, n) * np.exp(-tt * 6) * 0.7 + 0.4 * np.sin(2 * np.pi * (180 * tt + 350 * tt ** 2)) * np.exp(-tt * 7), 0)
    elif nom == 'cauris':
        rng = np.random.default_rng(6)
        for _ in range(26):
            tt = tps(0.03)
            p(0.5 * np.sin(2 * np.pi * rng.uniform(2500, 5200) * tt) * np.exp(-tt * 180), rng.uniform(0, 0.9))
    elif nom == 'magie':
        for i, f in enumerate((660, 880, 1046, 1318, 1760)):
            tt = tps(1.6)
            p(0.4 * np.sin(2 * np.pi * f * tt) * np.sin(np.pi * tt / 1.6) ** 2, i * 0.12)
    else:
        raise ValueError(f'effet inconnu : {nom}')
    return norme(x, 0.8)


def assembler(reperes, boucle, duree, fondu=2.0):
    """Enchaîne des boucles selon les repères, avec fondus enchaînés."""
    import numpy as np
    n = int(duree * SR)
    x = np.zeros(n, dtype=np.float32)
    bf = int(fondu * SR)
    for i, r in enumerate(reperes):
        a = int(r['t'] * SR)
        b = int(reperes[i + 1]['t'] * SR) if i + 1 < len(reperes) else n
        b2 = min(n, b + bf)
        L = boucle(r['nom'])
        seg = L[(a + np.arange(b2 - a)) % len(L)].copy()
        if i:
            m = min(bf, len(seg))
            seg[:m] *= np.linspace(0, 1, m)
        if b2 > b:
            seg[-(b2 - b):] *= np.linspace(1, 0, b2 - b)
        x[a:b2] += seg
    # Attaque et fin de film
    m = int(1.5 * SR)
    x[:m] *= np.linspace(0, 1, m)
    x[-m:] *= np.linspace(1, 0, m)
    return x


async def cmd_audio(ids):
    import numpy as np
    films = lire_sources()
    choix = [f for k, f in films.items() if not ids or any(k.startswith(i) for i in ids)]
    durees = json.load(open(DUREES_VOIX)) if os.path.exists(DUREES_VOIX) else {}
    sem = asyncio.Semaphore(6)
    memo = {}
    for f in choix:
        d = os.path.join(AUDIO, f['id'])
        os.makedirs(d, exist_ok=True)
        duree = DUREES[f['id']]
        voix, dd = await voix_film(f, sem)
        durees.update(dd)
        encoder(norme(voix, 0.92), os.path.join(d, 'voix-fr.mp3'), '64k')

        def bl(fn, nom):
            if nom not in memo:
                memo[nom] = fn(nom)
            return memo[nom]
        amb = assembler(f['amb'], lambda nom: bl(ambiance_boucle, nom), duree)
        for s in f['sfx']:
            e = effet(s['nom'], s['duree'])
            a = int(s['t'] * SR)
            m = min(len(e), len(amb) - a)
            if m > 0:
                amb[a:a + m] += 1.1 * e[:m]
        encoder(norme(amb, 0.85), os.path.join(d, 'ambiance.mp3'), '48k')
        mus = assembler(f['mus'], lambda nom: memo.get('M' + nom) if 'M' + nom in memo else memo.setdefault('M' + nom, musique_boucle(nom)), duree, 3.0)
        encoder(norme(mus, 0.85), os.path.join(d, 'musique.mp3'), '56k')
        json.dump(durees, open(DUREES_VOIX, 'w'), indent=0, sort_keys=True)
        print(f"{f['id']} : {len(f['cues'])} répliques, pistes écrites", flush=True)
    cmd_pistes()


def cmd_pistes():
    """Inventaire des pistes présentes dans audio/ (lu par le lecteur)."""
    pistes = {}
    for d in sorted(glob.glob(os.path.join(AUDIO, '*'))):
        if not os.path.isdir(d):
            continue
        fichiers = [os.path.basename(p)[:-4] for p in glob.glob(os.path.join(d, '*.mp3'))]
        pistes[os.path.basename(d)] = sorted(fichiers)
    chemin = os.path.join(RACINE, 'site', 'commun', 'pistes.js')
    open(chemin, 'w', encoding='utf8').write(
        '/* Généré par outils/doublage.py pistes. */\nwindow.PISTES=' + json.dumps(pistes, ensure_ascii=False, separators=(',', ':')) + ';\nwindow.LANGUES=' + json.dumps(LANGUES, ensure_ascii=False) + ';\n')
    print(f'{len(pistes)} films dans {os.path.relpath(chemin, RACINE)}')


def cmd_videos_web(ids):
    """Vidéos légères pour la publication : 720p, avec deux pistes audio (mixage complet ; ambiance et musique seules)."""
    from concurrent.futures import ThreadPoolExecutor
    os.makedirs(os.path.join(RACINE, 'videos-web'), exist_ok=True)

    def une(src):
        id_ = os.path.basename(src)[:-4]
        dest = os.path.join(RACINE, 'videos-web', id_ + '.mp4')
        a = os.path.join(AUDIO, id_)
        graphe = ('[2:a]volume=0.35,asplit=2[am1][am2];[3:a]volume=0.25,asplit=2[mu1][mu2];'
                  '[1:a][am1][mu1]amix=inputs=3:normalize=0[complet];[am2][mu2]amix=inputs=2:normalize=0[fond]')
        subprocess.run([ffmpeg(), '-y', '-v', 'error', '-i', src,
                        '-i', os.path.join(a, 'voix-fr.mp3'), '-i', os.path.join(a, 'ambiance.mp3'), '-i', os.path.join(a, 'musique.mp3'),
                        '-filter_complex', graphe, '-map', '0:v', '-map', '[complet]', '-map', '[fond]',
                        '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-preset', 'medium', '-crf', '30', '-pix_fmt', 'yuv420p',
                        '-c:a', 'aac', '-b:a', '64k', '-ac', '1',
                        '-metadata:s:a:0', 'language=fra', '-metadata:s:a:0', 'title=Français : voix, ambiance et musique',
                        '-metadata:s:a:1', 'language=zxx', '-metadata:s:a:1', 'title=Ambiance et musique seules',
                        '-movflags', '+faststart', '-shortest', dest + '.tmp.mp4'], check=True)
        os.replace(dest + '.tmp.mp4', dest)
        print(f'{id_} : {os.path.getsize(dest) / 1e6:.1f} Mo', flush=True)

    file = []
    for src in sorted(glob.glob(os.path.join(RACINE, 'videos', '*.mp4'))):
        id_ = os.path.basename(src)[:-4]
        if ids and not any(id_.startswith(i) for i in ids):
            continue
        dest = os.path.join(RACINE, 'videos-web', id_ + '.mp4')
        if os.path.exists(dest) and os.path.getmtime(dest) > os.path.getmtime(src):
            continue
        journal = os.path.join(RACINE, 'videos', 'journaux', id_ + '.log')
        if os.path.exists(journal) and 'Termin' not in open(journal, encoding='utf8', errors='replace').read():
            print(f'{id_} : export en cours, vidéo ignorée')
            continue
        if not all(os.path.exists(os.path.join(AUDIO, id_, n + '.mp3')) for n in ('voix-fr', 'ambiance', 'musique')):
            print(f'{id_} : pistes audio manquantes, vidéo ignorée')
            continue
        file.append(src)
    with ThreadPoolExecutor(3) as ex:
        list(ex.map(une, file))
    print(f'{len(file)} vidéo(s) encodée(s).')


if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf8', errors='replace')
    c = sys.argv[1] if len(sys.argv) > 1 else ''
    if c == 'scripts':
        cmd_scripts()
    elif c == 'audio':
        asyncio.run(cmd_audio(sys.argv[2:]))
        cmd_scripts()
    elif c == 'pistes':
        cmd_pistes()
    elif c == 'videos-web':
        cmd_videos_web(sys.argv[2:])
    else:
        print(__doc__)
