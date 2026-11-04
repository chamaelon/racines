"""
Les histoires en langues nationales, en automatique : traduction NLLB-200, voix MMS-TTS, sous-titres et mélange des films.

  python scripts/voix_mms.py traduire              tire 2 langues par histoire et traduit tout (mémorisé, reprend où il s'était arrêté)
  python scripts/voix_mms.py ecrire                écrit pistes.json, les textes des fiches et recits.json
  python scripts/voix_mms.py voix --part 1/5       voix du jeu, pistes et sous-titres des films (lancer une fois par part)
  puis : npm run bandes-son && npm run films

Le Python est celui de montage/.venv-tts (voir NOTES.md). Rien de tout cela n'a été relu par un locuteur : le site le signale.
Une traduction humaine écrite dans animations/doublage/<film>/traduction.csv prime toujours.
Licence des modèles : CC BY-NC 4.0, usage non commercial seulement.

Pour limiter les contresens, chaque phrase est traduite telle quelle et reformulée (passé composé, mots plus courants).
Chaque traduction est retraduite en français, et on garde la plus fidèle. Le score ne prouve pas que la traduction est juste.
"""
import argparse
import csv
import difflib
import json
import random
import re
import shutil
import subprocess
import unicodedata
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
PUBLIC = RACINE / "public"
DOUBLAGE, SONS, FILMS, BANDES = RACINE / "animations/doublage", RACINE / "animations/audio", PUBLIC / "films", PUBLIC / "bandes-son"
MEMOIRE = DOUBLAGE / "traductions-auto"
TIRAGE = MEMOIRE / "tirage.json"
TRAVAIL = RACINE / "montage/voix-mms"
CT2 = RACINE / "montage/nllb-ct2"
NLLB = "facebook/nllb-200-distilled-600M"
LANGUES = {  # code du site : colonne de la feuille, code NLLB, modèle MMS
    "mos": ("mooré", "mos_Latn", "facebook/mms-tts-mos"),
    "dyu": ("dioula", "dyu_Latn", "facebook/mms-tts-dyu"),
    "fuf": ("fulfulde", "fuv_Latn", "facebook/mms-tts-ful"),
}
GRAINE = "racines-2026"
NOTE = "traduction automatique, non relue"
SR_MIX = 44100
ACCELERATION_MAX = 1.5
FFMPEG, FFPROBE = shutil.which("ffmpeg") or "ffmpeg", shutil.which("ffprobe") or "ffprobe"

# ---- Reformulations
PASSE = {
    "tomba": "est tombé", "leva": "a levé", "fit": "a fait", "prit": "a pris", "regarda": "a regardé", "arrêta": "a arrêté", "dansa": "a dansé", "arriva": "est arrivé",
    "mit": "a mis", "quitta": "a quitté", "finit": "a fini", "monta": "est monté", "naquit": "est né", "naquirent": "sont nés", "sauta": "a sauté", "éclata": "a éclaté",
    "approcha": "a approché", "secoua": "a secoué", "tourna": "a tourné", "tendit": "a tendu", "frappa": "a frappé", "descendit": "est descendu", "posa": "a posé",
    "surgit": "est apparu", "prirent": "ont pris", "eut": "a eu", "fut": "a été", "gonfla": "a gonflé", "mirent": "ont mis", "reconnut": "a reconnu", "voulut": "a voulu",
    "releva": "a relevé", "avança": "a avancé", "inclina": "a incliné", "repartit": "est reparti", "partirent": "sont partis", "éveilla": "a éveillé", "réunit": "a réuni",
    "alla": "est allé", "sortit": "est sorti", "donna": "a donné", "bâtit": "a construit", "abaissa": "a baissé", "choisit": "a choisi", "dressa": "a dressé",
    "répondit": "a répondu", "lança": "a lancé", "ouvrirent": "ont ouvert", "bâtirent": "ont construit", "engloutit": "a avalé", "osa": "a osé", "entraîna": "a entraîné",
    "chanta": "a chanté", "remonta": "est remonté", "partit": "est parti", "suivit": "a suivi", "marcha": "a marché", "retourna": "est retourné", "passa": "est passé",
    "bondit": "a sauté", "pleura": "a pleuré", "enfuit": "a fui", "éloigna": "a éloigné", "tendirent": "ont tendu", "joua": "a joué", "planta": "a planté", "grandit": "a grandi",
    "sortirent": "sont sortis", "appela": "a appelé", "commença": "a commencé", "hésita": "a hésité", "recula": "a reculé", "laissa": "a laissé", "accoururent": "sont venus vite",
    "céda": "a cédé", "glissa": "a glissé", "salua": "a salué", "ouvrit": "a ouvert", "resta": "est resté", "sema": "a semé", "revint": "est revenu", "vint": "est venu",
    "alluma": "a allumé", "reçut": "a reçu", "saisit": "a pris", "serra": "a serré", "dit": "a dit", "vit": "a vu", "entendit": "a entendu", "put": "a pu", "sut": "a su",
}
MOTS = {
    "brousse": "forêt", "griot": "conteur", "griots": "conteurs", "griotte": "conteuse", "marâtre": "belle-mère", "caïlcédrat": "grand arbre", "cauris": "coquillages",
    "silure": "poisson", "silures": "poissons", "pilon": "bâton à piler", "mortier": "grand bol de bois", "mil": "grain", "génie": "esprit", "génies": "esprits",
    "souverain": "roi", "doyen": "plus vieil homme", "étalon": "cheval", "offrande": "don", "tourbillon": "grand vent", "émirat": "royaume", "soulèvement": "révolte",
    "devineresse": "femme qui voit l'avenir", "forteresse": "grande ville protégée", "campement": "camp", "tribut": "impôt", "serment": "promesse", "museau": "nez",
    "chantier": "travail", "gourde": "calebasse", "grenier": "maison du grain", "forgeron": "homme qui travaille le fer", "pilait": "écrasait", "lames": "morceaux",
    "autel": "lieu sacré", "colonne": "groupe", "fanfaronna": "a parlé avec orgueil", "toits": "maisons", "crapaud": "grenouille",
}
MOTS_COURANTS = re.compile(r"\b(" + "|".join(sorted(MOTS, key=len, reverse=True)) + r")\b", re.I)
PAS_UN_VERBE = {"sera", "aura", "dira", "cela", "voilà", "déjà", "fera", "ira", "viendra", "rendra", "prendra", "gardera", "veillera", "pourra", "saura", "verra", "devra"}


def casse(modele, mot):
    return mot[0].upper() + mot[1:] if modele[0].isupper() else mot


def au_passe_compose(p):
    def reflexif(m):
        aux, part = (PASSE.get(m[2].lower()) or " ").split(" ", 1)
        if not part:
            return m[0]
        fin = "se sont" if aux in ("ont", "sont") else "s'est"
        return casse(m[1], fin) + " " + part
    p = re.sub(r"\b(se |s')(\w+)", reflexif, p, flags=re.I)
    def simple(m):
        v = PASSE.get(m[0].lower())
        return casse(m[0], v) if v else m[0]
    p = re.sub(r"\b\w+\b", simple, p)
    p = re.sub(r"\b[Ss]e (\w+)èrent\b", lambda m: "se sont " + m[1] + "és", p)
    p = re.sub(r"\b(arriv|entr|rentr|retourn|mont|tomb|pass|rest|all)èrent\b", lambda m: "sont " + m[1] + "és", p)
    p = re.sub(r"\b(\w+)èrent\b", lambda m: "ont " + re.sub("(ç)$", "c", re.sub("(ge)$", "g", m[1])) + "é", p)
    def regulier(m):
        if m[2] in PAS_UN_VERBE:
            return m[0]
        return f"{m[1]} a " + m[2][:-1].replace("ç", "c").removesuffix("ge" if m[2].endswith("gea") else "\0") + ("g" if m[2].endswith("gea") else "") + "é"
    return re.sub(r"\b([Ii]l|[Ee]lle|[Oo]n) ([a-zàâéèêîôûç]{3,}a)\b", regulier, p)


def variantes(phrase):
    p = phrase
    temps = au_passe_compose(p)
    simple = MOTS_COURANTS.sub(lambda m: casse(m[0], MOTS[m[0].lower()]), temps)
    return list(dict.fromkeys([p, temps, simple]))


def phrases_de(texte):
    return [x.strip() for x in re.split(r"(?<=[.!?…])\s+", texte) if x.strip()]


def sans_guillemets(t):
    return re.sub(r"\s+", " ", t.replace("«", " ").replace("»", " ").replace("’", "'")).strip()


# ---- Score d'une traduction : les noms gardés, puis la ressemblance de son retour en français avec la phrase
def racines_de(t):
    t = "".join(c for c in unicodedata.normalize("NFD", t.lower()) if not unicodedata.combining(c))
    return [m[:5] for m in re.findall(r"[a-z]{4,}", t)]


def noms_de(phrase, noms):
    return [n for n in noms if re.search(rf"\b{re.escape(n)}\b", phrase)]


def score(sources, traduction, retour, noms):
    def proche(s):
        a, b = racines_de(s), racines_de(retour)
        return difflib.SequenceMatcher(None, a, b).ratio() if a and b else 0.0
    fidele = max(proche(s) for s in sources)
    presents = noms_de(sources[0], noms)
    gardes = sum(n.lower() in traduction.lower() for n in presents) / len(presents) if presents else 1.0
    mots = traduction.split()
    repetition = 1 - len(set(mots)) / len(mots) if len(mots) > 5 else 0
    rapport = len(traduction) / max(len(sources[0]), 1)
    longueur = 1.0 if 0.5 <= rapport <= 2.2 else 0.0
    return round(0.55 * fidele + 0.3 * gardes + 0.15 * longueur - 0.5 * max(0, repetition - 0.25), 4)


class Traducteur:
    def __init__(self):
        import ctranslate2
        from transformers import AutoTokenizer
        self.modele = ctranslate2.Translator(str(CT2), device="cpu", compute_type="int8", intra_threads=10)
        self.tok = AutoTokenizer.from_pretrained(NLLB)

    def __call__(self, phrases, source, cible, beam=4, hypotheses=1):
        self.tok.src_lang = source
        jetons = [self.tok.convert_ids_to_tokens(self.tok.encode(p, truncation=True, max_length=400)) for p in phrases]
        res = self.modele.translate_batch(jetons, target_prefix=[[cible]] * len(jetons), beam_size=beam, num_hypotheses=hypotheses, max_batch_size=32, max_decoding_length=200, no_repeat_ngram_size=3, repetition_penalty=1.1)
        decode = lambda h: self.tok.decode(self.tok.convert_tokens_to_ids(h[1:] if h and h[0] == cible else h), skip_special_tokens=True).strip()
        return [[decode(h) for h in r.hypotheses] for r in res]


def lire_json(f, defaut=None):
    return json.loads(f.read_text("utf-8")) if f.exists() else defaut


def ecrire_json(f, v, indent=1):
    f.parent.mkdir(parents=True, exist_ok=True)
    temp = f.with_name(f.name + ".tmp")
    temp.write_text(json.dumps(v, ensure_ascii=False, indent=indent) + "\n", "utf-8", newline="\n")
    temp.replace(f)


def recits():
    return lire_json(PUBLIC / "data/recits.json")


def tirage():
    if TIRAGE.exists():
        return lire_json(TIRAGE)
    t = {r["id"]: sorted(random.Random(f"{GRAINE}-{r['id']}").sample(sorted(LANGUES), 2)) for r in recits()}
    ecrire_json(TIRAGE, t)
    return t


def noms_recit(r, pistes):
    noms = set(r.get("personnages") or [])
    noms |= {p["texte"] for p in pistes["pistes"] if p["type"] == "personnage"}
    uniques = set()
    for n in noms:
        uniques |= {m for m in re.findall(r"\b[A-ZÉÈ][\wéèêïîô-]{2,}\b", n) if m not in ("Le", "La", "Les", "Une", "Des", "Dans")}
    return uniques


def paragraphe_fiche(p):
    """Le nom de celui qui parle n'est pas à traduire : « Yennenga : « Père… » »."""
    m = re.match(r"^([^:«»]{1,40}) : « (.*) »$", p, re.S)
    return (m[1], m[2]) if m else (None, p)


def contenus(r):
    pistes = lire_json(BANDES / r["id"] / "pistes.json")
    textes = [p["texte"] for p in pistes["pistes"] if p["type"] != "personnage"]
    for para in (PUBLIC / "data" / r["texte"]).read_text("utf-8").split("\n\n"):
        if para.strip():
            textes.append(paragraphe_fiche(para.strip())[1])
    return pistes, textes


def traduire():
    t = Traducteur()
    choix = tirage()
    a_faire = {c: {} for c in LANGUES}
    for r in recits():
        pistes, textes = contenus(r)
        noms = noms_recit(r, pistes)
        for code in choix[r["id"]]:
            for texte in textes:
                for ph in phrases_de(texte):
                    a_faire[code].setdefault(sans_guillemets(ph), set()).update(noms)
    for code, (_, nllb, _) in LANGUES.items():
        f = MEMOIRE / f"{code}.json"
        memoire = lire_json(f, {})
        restent = [p for p in a_faire[code] if p not in memoire and re.search(r"\w", p)]
        print(code, len(a_faire[code]), "phrases,", len(restent), "à traduire", flush=True)
        for i in range(0, len(restent), 96):
            lot = restent[i : i + 96]
            vars_ = [variantes(p) for p in lot]
            plat = [v for vs in vars_ for v in vs]
            hyps = t(plat, "fra_Latn", nllb, beam=4, hypotheses=2)
            k = 0
            cand = []
            for p, vs in zip(lot, vars_):
                for v in vs:
                    for h in dict.fromkeys(hyps[k]):
                        if h:
                            cand.append((p, vs, v, h))
                    k += 1
            retours = t([c[3] for c in cand], nllb, "fra_Latn", beam=2)
            for (p, vs, v, h), rt in zip(cand, retours):
                s = score(vs, h, rt[0], sorted(a_faire[code][p]))
                if p not in memoire or s > memoire[p]["score"]:
                    memoire[p] = {"texte": h, "retour": rt[0], "score": s, "variante": vs.index(v)}
            ecrire_json(f, memoire)
            print(code, min(i + 96, len(restent)), "/", len(restent), flush=True)
    for code in LANGUES:
        m = lire_json(MEMOIRE / f"{code}.json", {})
        sc = sorted(x["score"] for x in m.values())
        if sc:
            print(code, "phrases", len(sc), "score médian", sc[len(sc) // 2], "reformulées", sum(x["variante"] > 0 for x in m.values()))


def traduction_de(texte, memoire):
    morceaux = []
    for ph in phrases_de(texte):
        p = sans_guillemets(ph)
        morceaux.append(memoire[p]["texte"] if p in memoire else p)
    return " ".join(morceaux)


def humaines(film, colonne):
    f = DOUBLAGE / film / "traduction.csv" if film else None
    if not f or not f.exists():
        return {}
    with open(f, encoding="utf-8-sig", newline="") as fh:
        return {l["francais"]: l[colonne].strip() for l in csv.DictReader(fh, delimiter=";") if (l.get(colonne) or "").strip()}


def ecrire():
    choix = tirage()
    memoires = {c: lire_json(MEMOIRE / f"{c}.json", {}) for c in LANGUES}
    liste = recits()
    for r in liste:
        pistes, _ = contenus(r)
        r["texteLocal"] = {}
        for code in choix[r["id"]]:
            hum = humaines(r.get("film"), LANGUES[code][0])
            for p in pistes["pistes"]:
                l = {"texte": p["texte"]} if p["type"] == "personnage" else {"texte": hum.get(p["texte"]) or traduction_de(p["texte"], memoires[code]), "relecture": NOTE}
                p["langues"] = {**p.get("langues", {}), code: {**p.get("langues", {}).get(code, {}), **l}}
            sortie = []
            for para in (PUBLIC / "data" / r["texte"]).read_text("utf-8").split("\n\n"):
                if not para.strip():
                    continue
                qui, dit = paragraphe_fiche(para.strip())
                fait = traduction_de(dit, memoires[code])
                sortie.append(f"{qui} : « {fait} »" if qui else fait)
            chemin = f"textes/{r['id']}.{code}.md"
            (PUBLIC / "data" / chemin).write_text("\n\n".join(sortie) + "\n", "utf-8", newline="\n")
            r["texteLocal"][code] = chemin
        ecrire_json(BANDES / r["id"] / "pistes.json", pistes)
    ecrire_json(PUBLIC / "data/recits.json", liste, indent=None if False else 2)
    print("Écrit :", len(liste), "récits")


# ---- Les voix
def ffmpeg(*args):
    r = subprocess.run([FFMPEG, "-y", "-loglevel", "error", *map(str, args)], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr.strip())


class Voix:
    def __init__(self, depot):
        import torch
        from transformers import AutoTokenizer, VitsModel
        self.torch = torch
        torch.set_num_threads(2)
        self.tok = AutoTokenizer.from_pretrained(depot)
        self.modele = VitsModel.from_pretrained(depot).eval()
        self.sr = self.modele.config.sampling_rate
        self.vocab = set(self.tok.get_vocab())
        self.inconnus = {}

    def nettoyer(self, texte):
        sortie = []
        for c in unicodedata.normalize("NFC", texte).lower().replace("’", "'"):
            sans = "".join(x for x in unicodedata.normalize("NFD", c) if not unicodedata.combining(x))
            if c in self.vocab:
                sortie.append(c)
            elif sans and all(x in self.vocab for x in sans):
                sortie.append(sans)
            else:
                if c.isalpha():
                    self.inconnus[c] = self.inconnus.get(c, 0) + 1
                sortie.append(" ")
        return re.sub(r"\s+", " ", "".join(sortie)).strip()

    def dire(self, texte):
        import numpy as np
        blancs = np.zeros(int(self.sr * 0.25), dtype=np.float32)
        parties = []
        for morceau in re.split(r"(?<=[.!?;:…])\s+", texte):
            propre = self.nettoyer(morceau)
            if not propre:
                continue
            self.torch.manual_seed(555)
            entree = self.tok(propre, return_tensors="pt")
            if entree["input_ids"].shape[1] == 0:
                continue
            with self.torch.no_grad():
                parties += [self.modele(**entree).waveform[0].numpy().astype(np.float32), blancs]
        return np.concatenate(parties[:-1]) if parties else np.zeros(int(self.sr * 0.1), dtype=np.float32)


def caler(voix, sr, place, chemin):
    import soundfile as sf
    duree = len(voix) / sr
    facteur = min(ACCELERATION_MAX, max(1.0, duree / max(place, 0.1)))
    brut = chemin.with_suffix(".brut.wav")
    sf.write(brut, voix, sr)
    ffmpeg("-i", brut, "-af", f"atempo={facteur:.4f},aresample={SR_MIX}", "-ac", 1, chemin)
    brut.unlink()
    return duree / facteur


def temps_vtt(s):
    return f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{s % 60:06.3f}"


def voix_jeu(r, code, pistes, voix):
    import soundfile as sf
    dossier = BANDES / r["id"]
    for p in pistes["pistes"]:
        if p["type"] != "replique":
            continue
        sortie = dossier / f"{r['id']}-{p['id']}-{code}.m4a"
        if sortie.exists():
            continue
        brut = TRAVAIL / r["id"] / code / f"{p['id']}.wav"
        brut.parent.mkdir(parents=True, exist_ok=True)
        sf.write(brut, voix.dire(p["langues"][code]["texte"]), voix.sr)
        temp = sortie.with_name(sortie.stem + ".tmp.m4a")
        ffmpeg("-i", brut, "-ac", 1, "-c:a", "aac", "-b:a", "32k", "-movflags", "+faststart", temp)
        temp.replace(sortie)
        brut.unlink()


def piste_film(r, code, pistes, voix):
    import numpy as np
    import soundfile as sf
    film = r["film"]
    sortie = FILMS / film / f"{code}.m4a"
    if sortie.exists() and (FILMS / film / f"{code}.vtt").exists():
        return
    lignes = sorted((p for p in pistes["pistes"] if p["type"] == "film"), key=lambda p: p["horodatage"]["debut_ms"])
    if not lignes:
        return
    dossier = TRAVAIL / film / code
    dossier.mkdir(parents=True, exist_ok=True)
    duree_film = float(subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(FILMS / film / "video.mp4")], capture_output=True, text=True).stdout)
    tout = np.zeros(int(duree_film * SR_MIX) + SR_MIX, dtype=np.float32)
    curseur, vtt = 0.0, ["WEBVTT", ""]
    for i, p in enumerate(lignes):
        debut = max(p["horodatage"]["debut_ms"] / 1000, curseur)
        suivante = lignes[i + 1]["horodatage"]["debut_ms"] / 1000 if i + 1 < len(lignes) else duree_film
        f = dossier / f"{i:03d}.wav"
        texte = p["langues"][code]["texte"]
        duree = caler(voix.dire(texte), voix.sr, max(suivante - debut - 0.1, 0.3), f)
        son, _ = sf.read(f, dtype="float32")
        f.unlink()
        a = int(debut * SR_MIX)
        b = min(a + len(son), len(tout))
        tout[a:b] += son[: b - a]
        curseur = debut + duree
        vtt += [f"{temps_vtt(debut)} --> {temps_vtt(max(curseur, debut + 1))}", texte.replace("&", "&amp;").replace("<", "&lt;"), ""]
    crete = np.abs(tout).max() or 1
    voix_f = dossier / "voix.wav"
    sf.write(voix_f, tout / crete * 0.9, SR_MIX)
    entrees = [voix_f] + [SONS / film / n for n in ("ambiance.mp3", "musique.mp3") if (SONS / film / n).exists()]
    temp = sortie.with_name(sortie.stem + ".tmp.m4a")
    ffmpeg(*sum((["-i", e] for e in entrees), []), "-filter_complex", f"amix=inputs={len(entrees)}:duration=first:normalize=0,alimiter=limit=0.95", "-t", duree_film, "-vn", "-ac", 2, "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", temp)
    temp.replace(sortie)
    voix_f.unlink()
    (FILMS / film / f"{code}.vtt").write_text("\n".join(vtt), "utf-8", newline="\n")
    memoire = FILMS / film / "provisoires.json"
    liste = lire_json(memoire, [])
    if code not in liste:
        ecrire_json(memoire, liste + [code], indent=None)


def voix_main(part):
    i, n = map(int, part.split("/"))
    choix = tirage()
    taches = [(r, c) for r in recits() for c in choix[r["id"]]]
    taches = sorted(taches, key=lambda t: (t[1], t[0]["id"]))[i - 1 :: n]
    voix = {}
    for r, code in taches:
        pistes = lire_json(BANDES / r["id"] / "pistes.json")
        v = voix.setdefault(code, Voix(LANGUES[code][2]))
        voix_jeu(r, code, pistes, v)
        if r.get("film"):
            piste_film(r, code, pistes, v)
        print(r["id"], code, "fait", flush=True)
    for code, v in voix.items():
        if v.inconnus:
            print(f"Lettres inconnues du modèle {code} (omises) : {v.inconnus}", flush=True)


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("action", choices=["traduire", "ecrire", "voix"])
    a.add_argument("--part", default="1/1")
    x = a.parse_args()
    {"traduire": traduire, "ecrire": ecrire, "voix": lambda: voix_main(x.part)}[x.action]()
