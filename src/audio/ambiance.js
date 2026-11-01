/* Rythmes de tam-tam générés avec la Web Audio API. Rien ne démarre sans un geste de l'utilisateur. */
const PATTERNS = {
  calme: { b: [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0], s: [0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0], bpm: 96 },
  nuit: { b: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], s: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0], bpm: 72 },
  tension: { b: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0], s: [0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1], bpm: 132 },
  fete: { b: [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1], s: [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0], bpm: 118 },
};

export class Ambiance {
  constructor() {
    this.actx = null; this.master = null; this.bruit = null;
    this.actif = false; this.mood = 'calme'; this.step = 0; this.nextT = 0;
    this.minuteur = setInterval(() => this.programmer(), 50);
  }

  init() {
    if (this.actx) return;
    try { this.actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    this.master = this.actx.createGain(); this.master.gain.value = 0.45; this.master.connect(this.actx.destination);
    this.bruit = this.actx.createBuffer(1, this.actx.sampleRate * 0.2, this.actx.sampleRate);
    const d = this.bruit.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  activer(on) {
    this.actif = on;
    if (on) { this.init(); if (this.actx) this.actx.resume().catch(() => {}); }
  }

  programmer() {
    if (!this.actx || !this.actif) return;
    const p = PATTERNS[this.mood];
    if (!p) { this.nextT = 0; return; }
    const dur = 60 / p.bpm / 3;
    if (this.nextT < this.actx.currentTime) this.nextT = this.actx.currentTime + 0.05;
    while (this.nextT < this.actx.currentTime + 0.2) {
      if (p.b[this.step % 12]) this.tambour(this.nextT);
      if (p.s[this.step % 12]) this.claque(this.nextT);
      this.step++; this.nextT += dur;
    }
  }

  tambour(t, f = 70, dec = 0.45, vol = 0.7) {
    if (!this.actx) return;
    const o = this.actx.createOscillator(), g = this.actx.createGain();
    o.frequency.setValueAtTime(f * 2, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dec);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dec + 0.05);
  }

  claque(t, vol = 0.2) {
    if (!this.actx) return;
    const s = this.actx.createBufferSource(), bp = this.actx.createBiquadFilter(), g = this.actx.createGain();
    s.buffer = this.bruit; bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 1.4;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    s.connect(bp); bp.connect(g); g.connect(this.master); s.start(t); s.stop(t + 0.15);
    this.tambour(t, 260, 0.1, vol * 0.6);
  }

  blip() {
    if (!this.actx || !this.actif) return;
    const t = this.actx.currentTime, o = this.actx.createOscillator(), g = this.actx.createGain();
    o.frequency.value = 520 + Math.random() * 80;
    g.gain.setValueAtTime(0.025, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.06);
  }

  // Coups de galop et de tam-tam des mini-jeux. i : 0 à 3, la hauteur du tambour.
  coup(i = 0) {
    if (!this.actx || !this.actif) return;
    const t = this.actx.currentTime;
    this.tambour(t, 70 + i * 45, 0.2, 0.6);
  }

  detruire() {
    clearInterval(this.minuteur);
    if (this.actx) this.actx.close().catch(() => {});
    this.actx = null;
  }
}
