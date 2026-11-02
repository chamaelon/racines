/*
 * Racines — studio de doublage : traduire et enregistrer une voix réplique par réplique, directement
 * dans le navigateur, avec le film sous les yeux ; puis assembler le tout en une piste au bon minutage.
 * Rien ne quitte l'ordinateur : les prises restent dans la page, le visiteur télécharge le résultat.
 */
(function () {
  const { C, echap, parId, nav } = window.RACINES_APP;
  const $ = (s) => document.querySelector(s);
  const q = new URLSearchParams(location.search);
  nav('studio.html', true);
  const h = parId(q.get('h'));
  const selFilm = $('#film');
  C.histoires.forEach((x) => selFilm.add(new Option(`${String(x.n).padStart(2, '0')} · ${x.titre} (${x.peuple})`, x.dossier)));
  selFilm.value = h ? h.dossier : '';
  selFilm.addEventListener('change', () => { location.search = selFilm.value ? `?h=${selFilm.value}` : ''; });
  if (!h) { $('#espace').classList.add('cache'); return; }

  const D = window.DOUBLAGE, id = h.dossier;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const langue = $('#langue');
  const conseil = window.GEO[id].langue;
  if (conseil) langue.value = conseil;
  const prises = {};  // index de réplique → Blob
  const trad = (() => { try { return JSON.parse(localStorage.getItem('racines-trad-' + id)) || {}; } catch (e) { return {}; } })();
  const garderTrad = () => { try { localStorage.setItem('racines-trad-' + id, JSON.stringify(trad)); } catch (e) { /* navigation privée */ } };
  let film = null;

  $('#liste').innerHTML = D.cues.map((c, i) => `<div class="prise" data-i="${i}">
    <time>${mmss(c.d)}</time>
    <div><strong>${c.r === 'N' ? 'Narrateur' : c.r}</strong>${c.ton ? ` <span class="meta">(${echap(c.ton)})</span>` : ''} <span class="meta">· ${(c.f - c.d).toFixed(1)} s</span><br>${echap(c.t)}
      <textarea aria-label="Traduction de la réplique ${i + 1}" placeholder="Votre traduction">${echap(trad[langue.value + i] || '')}</textarea></div>
    <div class="boutons">
      <button class="bouton" data-act="voir" type="button">Voir</button>
      <button class="bouton" data-act="rec" type="button">● Enregistrer</button>
      <button class="bouton cache" data-act="ecoute" type="button">▶</button>
    </div></div>`).join('');

  $('#liste').addEventListener('input', (e) => {
    if (e.target.tagName !== 'TEXTAREA') return;
    trad[langue.value + e.target.closest('.prise').dataset.i] = e.target.value; garderTrad();
  });
  langue.addEventListener('change', () => {
    document.querySelectorAll('.prise').forEach((p) => { p.querySelector('textarea').value = trad[langue.value + p.dataset.i] || ''; });
  });

  // ------------------------------------------------------------ Enregistrement
  let flux = null, rec = null, ligneRec = null;
  async function micro() {
    if (flux) return flux;
    flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true } });
    return flux;
  }
  function jouerExtrait(c) {
    if (!film) return;
    film.aller(c.d);
    film.lire();
    clearTimeout(jouerExtrait.t);
    jouerExtrait.t = setTimeout(() => film.pause(), (c.f - c.d + 0.4) * 1000);
  }
  async function basculerRec(p, i) {
    if (rec) { rec.stop(); return; }
    try { await micro(); } catch (e) { $('#etat').textContent = 'Micro inaccessible : autorisez-le dans le navigateur (le site doit être servi en https ou en local).'; return; }
    const morceaux = [];
    rec = new MediaRecorder(flux);
    ligneRec = p;
    rec.ondataavailable = (e) => morceaux.push(e.data);
    rec.onstop = () => {
      prises[i] = new Blob(morceaux, { type: rec.mimeType });
      p.classList.remove('enregistre'); p.classList.add('faite');
      p.querySelector('[data-act=rec]').textContent = '● Refaire';
      p.querySelector('[data-act=ecoute]').classList.remove('cache');
      rec = null; ligneRec = null; if (film) film.pause();
      bilan();
    };
    rec.start();
    p.classList.add('enregistre');
    p.querySelector('[data-act=rec]').textContent = '■ Arrêter';
    jouerExtrait(D.cues[i]);
  }
  $('#liste').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const p = b.closest('.prise'), i = +p.dataset.i;
    if (b.dataset.act === 'voir') jouerExtrait(D.cues[i]);
    if (b.dataset.act === 'rec') basculerRec(p, i);
    if (b.dataset.act === 'ecoute' && prises[i]) new Audio(URL.createObjectURL(prises[i])).play();
  });
  function bilan() {
    const n = Object.keys(prises).length;
    $('#etat').textContent = `${n} réplique${n > 1 ? 's' : ''} enregistrée${n > 1 ? 's' : ''} sur ${D.cues.length}.`;
    $('#assembler').disabled = n === 0;
  }

  // ------------------------------------------------------------ Assemblage : WAV au minutage du film
  function wav(x, sr) {
    const b = new ArrayBuffer(44 + x.length * 2), v = new DataView(b);
    const s = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
    s(0, 'RIFF'); v.setUint32(4, 36 + x.length * 2, true); s(8, 'WAVEfmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, x.length * 2, true);
    for (let i = 0; i < x.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, x[i])) * 32767, true);
    return new Blob([b], { type: 'audio/wav' });
  }
  function telecharger(blob, nom) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nom; a.click();
  }
  $('#assembler').onclick = async () => {
    const sr = 24000, ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: sr });
    const piste = new Float32Array(Math.ceil(h.duree * sr));
    for (const [i, blob] of Object.entries(prises)) {
      const donnees = await ctx.decodeAudioData(await blob.arrayBuffer());
      const canal = donnees.getChannelData(0), debut = Math.floor(D.cues[i].d * sr);
      for (let k = 0; k < canal.length && debut + k < piste.length; k++) piste[debut + k] += canal[k];
    }
    ctx.close();
    telecharger(wav(piste, sr), `${id}__voix-${langue.value}.wav`);
    $('#etat').textContent = `Piste téléchargée : ${id}__voix-${langue.value}.wav. Voir le mode d'emploi ci-dessous pour la mettre en ligne.`;
  };
  $('#exporter').onclick = () => {
    const l = [['n', 'debut', 'fin', 'role', 'francais', 'traduction'].join(';')];
    D.cues.forEach((c, i) => l.push([i + 1, mmss(c.d), mmss(c.f), c.r, c.t, trad[langue.value + i] || ''].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(';')));
    telecharger(new Blob(['﻿' + l.join('\r\n')], { type: 'text/csv' }), `${id}__traduction-${langue.value}.csv`);
  };

  window.Film.animation(id, $('#ecran')).then((f) => { film = f; f.aller(D.cues[0].f); }).catch(() => { $('#etat').textContent = 'Le film n\'a pas pu être chargé : vous pouvez tout de même enregistrer.'; });
  bilan();
})();
