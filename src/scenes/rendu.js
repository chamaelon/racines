/*
 * Rendu 2,5D : théâtre de papier filmé par une caméra en perspective.
 * Chargé à la demande, avec Three.js. Le mode lecture (jeu.js) expose les mêmes méthodes, sans WebGL.
 */
import * as THREE from 'three';
import { DESSINS } from './dessins.js';
import { construireDecor, detruireGroupe, glowTex, GROUND, makeTex, plane } from './decors.js';
import { dessinerPersonnage, STYLES } from './personnages.js';

export class Rendu {
  constructor(canvas, { histoire, reduit = false, patrimoine = [] }) {
    this.canvas = canvas;
    this.histoire = histoire;
    this.patrimoine = patrimoine;
    this.reduit = reduit;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
    this.decor = null;
    this.chars = {};
    this.hotspots = [];
    this.glows = [];
    this.parlant = null;
    this.vitesse = 0;
    this.camT = { x: 0, z: 12 };
    this.camC = { x: 0, z: 12 };
    this.mx = 0; this.my = 0;
    this.mouthT = 0; this.gallopT = 0; this.gallopF = 0;
    this.surObjet = null;
    this.ray = new THREE.Raycaster();
    this.ptr = new THREE.Vector2();
    this._surPointeur = (e) => { this.mx = e.clientX / innerWidth * 2 - 1; this.my = e.clientY / innerHeight * 2 - 1; };
    this._surTaille = () => this.redimensionner();
    this._surClic = (e) => this.cliquer(e);
    addEventListener('pointermove', this._surPointeur);
    addEventListener('resize', this._surTaille);
    canvas.addEventListener('click', this._surClic);
    this.redimensionner();
    this.dernier = performance.now();
    this.boucle = (t) => { this.anime = requestAnimationFrame(this.boucle); this.image(t); };
    this.anime = requestAnimationFrame(this.boucle);
  }

  // Écrans étroits : la caméra recule juste assez pour garder dans le cadre les personnages,
  // ou tout le décor pendant une exploration (les objets sont posés plus loin sur les côtés).
  recul() { return Math.max(1, (this.surObjet ? 1.3 : 0.72) / this.camera.aspect); }

  redimensionner() {
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.cadrer(this.dernierCadre);
  }

  charger(nom) {
    if (nom === this.nomDecor) return;
    this.nomDecor = nom;
    if (this.decor) { this.scene.remove(this.decor.group); detruireGroupe(this.decor.group); }
    this.hotspots = []; this.glows = []; this.chars = {};
    this.decor = construireDecor(nom);
    const distribution = (this.histoire.distribution || {})[nom] || {};
    for (const [id, v] of Object.entries(distribution)) {
      const o = typeof v === 'number' ? { x: v } : v;
      const style = STYLES[this.histoire.personnages[id].style];
      if (style) { this.chars[id] = this.personnage(id, style, o.x, o.echelle || 1); this.decor.group.add(this.chars[id]); }
    }
    // En portrait, les herbes du premier plan descendent sous les pieds des personnages.
    if (this.camera.aspect < 1) this.decor.avant.forEach((m) => { m.position.y -= 2.4; });
    this.scene.add(this.decor.group);
    this.camC.x = 0; this.camC.z = 12; this.dernierCadre = null;
    this.cadrer(null);
    this.camC.z = this.camT.z;
  }

  personnage(id, style, x, echelle) {
    const t0 = makeTex(256, 512, (g) => dessinerPersonnage(g, style, false));
    const t1 = makeTex(256, 512, (g) => dessinerPersonnage(g, style, true));
    const m = plane(t0, 1.7 * echelle, 3.4 * echelle, x, GROUND + 1.7 * echelle, 0);
    m.userData = { id, mouth: [t0, t1], phase: Math.random() * 6, baseY: m.position.y };
    return m;
  }

  cadrer(speaker) {
    this.dernierCadre = speaker;
    const c = this.chars[speaker];
    const k = this.recul();
    if (c && !this.reduit) { this.camT.x = c.position.x * 0.55 / k; this.camT.z = 9.6 * k; } else { this.camT.x = 0; this.camT.z = 12 * k; }
  }

  parler(id) { this.parlant = id; }

  // Les objets à découvrir : ceux du décor s'ils y sont déjà, sinon posés aux emplacements prévus.
  explorer(ids, surObjet) {
    const cadre = this.dernierCadre;
    this.surObjet = surObjet;
    this.cadrer(null);
    this.dernierCadre = cadre;
    this.hotspots = [];
    const spots = [...this.decor.spots];
    ids.forEach((id) => {
      let m = this.decor.hotspots[id];
      let w = 3;
      if (!m) {
        const p = this.patrimoine.find((x) => x.id === id);
        const [x, z] = spots.shift() || [0, 0.4];
        w = 1.5;
        m = plane(makeTex(256, 256, (g) => DESSINS[p.dessin](g)), w, w, x, GROUND + w / 2 - 0.1, z);
        this.decor.group.add(m);
      }
      m.userData.hotspot = id;
      this.hotspots.push(m);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), transparent: true, depthWrite: false }));
      s.position.set(m.position.x, m.position.y, m.position.z + 0.05);
      s.renderOrder = 3000;
      s.userData.base = w * 1.6;
      s.scale.set(w * 1.6, w * 1.6, 1);
      this.decor.group.add(s);
      this.glows.push(s);
    });
  }

  finExplorer() {
    this.surObjet = null;
    this.cadrer(this.dernierCadre);
    this.glows.forEach((s) => { this.decor.group.remove(s); s.material.map.dispose(); s.material.dispose(); });
    this.glows = [];
    this.hotspots = [];
  }

  cliquer(e) {
    if (!this.surObjet) return;
    this.ptr.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    this.ray.setFromCamera(this.ptr, this.camera);
    const hit = this.ray.intersectObjects(this.hotspots)[0];
    if (hit) this.surObjet(hit.object.userData.hotspot);
  }

  galop(v) { this.vitesse = v; }

  image(now) {
    const dt = Math.min(0.05, (now - this.dernier) / 1000), t = now / 1000;
    this.dernier = now;
    const cam = this.camC, cible = this.camT;
    if (this.reduit) { cam.x = cible.x; cam.z = cible.z; } else { cam.x += (cible.x - cam.x) * Math.min(1, dt * 2.2); cam.z += (cible.z - cam.z) * Math.min(1, dt * 2.2); }
    const px = this.reduit ? 0 : this.mx * 0.7, py = this.reduit ? 0 : this.my * 0.3;
    // En portrait, la boîte de dialogue couvre le bas : on vise plus bas pour remonter la scène.
    const portrait = this.camera.aspect < 1;
    this.camera.position.set(cam.x + px, -0.4 - py, cam.z);
    this.camera.lookAt(cam.x * 0.9, portrait ? -4.2 : -1.3, 0);
    this.mouthT += dt;
    const flip = this.mouthT > 0.11;
    if (flip) this.mouthT = 0;
    for (const id in this.chars) {
      const c = this.chars[id], u = c.userData;
      if (!this.reduit) { c.scale.y = 1 + Math.sin(t * 2 + u.phase) * 0.012; c.position.y = u.baseY + Math.sin(t * 2 + u.phase) * 0.02; }
      if (this.parlant === id) { if (flip) c.material.map = c.material.map === u.mouth[0] ? u.mouth[1] : u.mouth[0]; } else c.material.map = u.mouth[0];
    }
    if (this.decor) {
      this.decor.scrollers.forEach((m) => { m.material.map.offset.x += m.userData.scroll * this.vitesse * dt * 6; });
      if (this.decor.galop) {
        const g = this.decor.galop;
        this.gallopT += dt * this.vitesse;
        if (this.gallopT > 0.12) { this.gallopT = 0; this.gallopF ^= 1; g.mesh.material.map = g.images[this.gallopF]; }
        g.mesh.position.y = GROUND + 1.6 + (this.reduit ? 0 : Math.abs(Math.sin(t * 10 * this.vitesse)) * 0.12);
      }
    }
    this.glows.forEach((s, i) => { const k = s.userData.base * (1 + (this.reduit ? 0 : Math.sin(t * 3 + i) * 0.12)); s.scale.set(k, k, 1); });
    this.renderer.render(this.scene, this.camera);
  }

  detruire() {
    cancelAnimationFrame(this.anime);
    removeEventListener('pointermove', this._surPointeur);
    removeEventListener('resize', this._surTaille);
    this.canvas.removeEventListener('click', this._surClic);
    if (this.decor) detruireGroupe(this.decor.group);
    this.renderer.dispose();
  }
}
