/*
 * Racines — charge un film dans la page, en animation (SVG + GSAP, sans iframe : le site marche aussi
 * en file://) ou en vidéo, derrière une même interface d'horloge : time, duree, lire, pause, aller, enPause.
 */
window.Film = (function () {
  const MOTEUR = ['lib/vendor/gsap.min.js', 'lib/racines.js', 'lib/decors.js', 'lib/betes.js', 'lib/gestes.js', 'bible/personnages.js', 'bible/decors-composes.js'];
  const script = (src) => new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => ko(new Error('Fichier introuvable : ' + src));
    document.head.appendChild(s);
  });

  /** Le film animé : le moteur remplit #scene ; sans #barre dans la page, il n'installe pas ses contrôles. */
  async function animation(id, conteneur) {
    const zone = document.createElement('div');
    zone.id = 'scene';
    conteneur.prepend(zone);
    for (const f of MOTEUR) await script('../' + f);
    await script(`../histoires/${id}/textes/fr.js`);
    await script(`../histoires/${id}/scenes.js`);
    const R = window.R, tl = R.tl;
    gsap.ticker.lagSmoothing(0);  // Machine lente : sauter des images plutôt que ralentir, pour rester calé sur le son.
    tl.seek(0); R.rendre();
    return {
      type: 'anim',
      scenes: R.scenes.map((s) => ({ nom: s.nom, d: s.debut })),
      duree: () => tl.duration(),
      time: () => tl.time(),
      enPause: () => tl.paused(),
      lire() { if (tl.progress() >= 1) tl.seek(0); tl.play(); },
      pause() { tl.pause(); },
      aller(t) { tl.seek(t); R.rendre(); },
      finChargement: Promise.resolve(),
    };
  }

  /** Le film en vidéo : muette, la bande son est jouée à part pour rester au choix du visiteur. */
  function video(id, conteneur, scenes, racineVideos) {
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'metadata';
    v.poster = `commun/vignettes/${id}.jpg`;
    v.src = `${racineVideos}/${id}.mp4`;
    conteneur.prepend(v);
    const fin = new Promise((ok, ko) => {
      v.addEventListener('loadedmetadata', ok, { once: true });
      v.addEventListener('error', () => ko(new Error('Vidéo indisponible')), { once: true });
    });
    return {
      type: 'video', el: v, scenes,
      duree: () => v.duration || 0,
      time: () => v.currentTime,
      enPause: () => v.paused,
      lire() { return v.play(); },
      pause() { v.pause(); },
      aller(t) { v.currentTime = t; },
      finChargement: fin,
    };
  }

  return { animation, video };
})();
