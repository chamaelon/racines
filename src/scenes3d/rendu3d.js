/*
 * Le jeu en vraie 3D : décors et marionnettes en GLB (modeles3d/), caméra qui suit celui qui parle.
 * Mêmes méthodes que le mode lecture de jeu.js : charger, cadrer, parler, galop, explorer, finExplorer, detruire.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as clonerSquelette } from 'three/addons/utils/SkeletonUtils.js';
import { motifs, url } from '../data.js';
import { motifPourRecit } from '../motifs.js';
import { AMBIANCES, varianteDecor } from './ambiances.js';
import { habiller } from './habillage.js';

const ECHELLE_X = 0.62;            // les positions des histoires viennent de l'ancien théâtre de papier
const EMPLACEMENTS = [[-3.4, 0.9], [3.4, 0.9], [-1.5, 1.4], [1.5, 1.4]];
const DUREE_FONDU = 0.28;

function degrade(haut, bas, etoiles) {
  const c = document.createElement('canvas');
  c.width = 32; c.height = 512;
  const g = c.getContext('2d');
  const d = g.createLinearGradient(0, 0, 0, 512);
  d.addColorStop(0, haut); d.addColorStop(0.62, bas); d.addColorStop(1, bas);
  g.fillStyle = d;
  g.fillRect(0, 0, 32, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class Rendu3D {
  constructor(canvas, { histoire, recit, peuple = '', reduit = false, patrimoine = [] }) {
    this.peuple = peuple;
    this.motifs = motifs();
    this.canvas = canvas;
    this.histoire = histoire;
    this.recit = recit;
    this.reduit = reduit;
    this.patrimoine = patrimoine;
    this.chargeur = new GLTFLoader();
    this.cache = new Map();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    this.soleil = new THREE.DirectionalLight(0xffffff, 2);
    this.soleil.castShadow = true;
    this.soleil.shadow.mapSize.set(1536, 1536);
    const o = this.soleil.shadow.camera;
    o.left = -14; o.right = 14; o.top = 12; o.bottom = -8; o.near = 1; o.far = 60;
    this.soleil.shadow.bias = -0.0006;
    this.soleil.shadow.normalBias = 0.03;
    this.feu = new THREE.PointLight(0xff9a3a, 0, 16, 1.6);
    this.scene.add(this.hemi, this.soleil, this.soleil.target, this.feu);
    this.groupe = null;
    this.chars = {};
    this.melangeurs = [];
    this.parlant = null;
    this.vitesse = 0;
    this.cam = { x: 0, y: 1.45, z: 6, vx: 0, vy: 0.85 };
    this.cible = { ...this.cam };
    this.mx = 0; this.my = 0;
    this.hotspots = [];
    this.halos = [];
    this.surObjet = null;
    this.ray = new THREE.Raycaster();
    this.ptr = new THREE.Vector2();
    this.avant = performance.now();
    this.temps = 0;
    this.jeton = 0;
    this._surPointeur = (e) => { this.mx = e.clientX / innerWidth * 2 - 1; this.my = e.clientY / innerHeight * 2 - 1; };
    this._surTaille = () => this.redimensionner();
    this._surClic = (e) => this.cliquer(e);
    addEventListener('pointermove', this._surPointeur);
    addEventListener('resize', this._surTaille);
    canvas.addEventListener('click', this._surClic);
    this.qualite = 2;
    this.mesure = { temps: 0, images: 0 };
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) this.baisserQualite();
    this.redimensionner();
    this.renderer.setAnimationLoop(() => this.image());
  }

  // Un appareil modeste garde une image fluide : moins de pixels d'abord, plus d'ombres ensuite.
  baisserQualite() {
    this.qualite--;
    if (this.qualite === 1) this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1));
    if (this.qualite === 0) {
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 0.75));
      this.soleil.castShadow = false;
    }
    this.renderer.setSize(innerWidth, innerHeight, false);
  }

  mesurer(dt) {
    if (this.qualite === 0) return;
    this.mesure.temps += dt;
    this.mesure.images++;
    if (this.mesure.temps < 1.5) return;
    if (this.mesure.temps / this.mesure.images > 0.04) this.baisserQualite();
    this.mesure = { temps: 0, images: 0 };
  }

  // En portrait, on recule pour garder les personnages dans le cadre.
  recul() { return Math.max(1, (this.surObjet ? 1.45 : 0.95) / this.camera.aspect); }

  redimensionner() {
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.cadrer(this.dernierCadre);
  }

  charge(chemin) {
    if (!this.cache.has(chemin)) {
      const p = this.chargeur.loadAsync(url(chemin)).catch((e) => { this.cache.delete(chemin); throw e; });
      this.cache.set(chemin, p);
    }
    return this.cache.get(chemin);
  }

  // Un motif déposé dans public/motifs habille le modèle dès qu'il est prêt, sans retenir la scène.
  async poserMotif(modele, objet, commun = false) {
    const m = motifPourRecit(objet, await this.motifs, { peuple: this.peuple, commun });
    if (m) await habiller(modele, m).catch((e) => console.warn(e));
  }

  // Renvoie une promesse : le fondu de jeu.js reste noir tant que le décor n'est pas prêt.
  async charger(nom) {
    if (nom === this.nomDecor) return;
    const moi = ++this.jeton;
    const visuel = varianteDecor(this.recit, nom);
    const distribution = (this.histoire.distribution || {})[nom] || {};
    const entrees = Object.entries(distribution).map(([id, v]) => [id, typeof v === 'number' ? { x: v } : v])
      .filter(([id]) => this.histoire.personnages[id]);
    const avecCheval = nom === 'course';
    const [decor, ...modeles] = await Promise.all([
      this.charge(`modeles/decors/${visuel}.glb`),
      ...entrees.map(([id]) => this.charge(`modeles/personnages/${this.histoire.personnages[id].style}.glb`)),
    ]);
    const cheval = avecCheval ? await this.charge('modeles/personnages/cheval.glb') : null;
    const cavalier = avecCheval ? await this.charge(`modeles/personnages/${this.styleCavalier()}.glb`) : null;
    if (moi !== this.jeton) return;

    this.vider();
    this.nomDecor = nom;
    this.groupe = new THREE.Group();
    const racine = decor.scene.clone(true);
    this.groupe.add(racine);
    racine.traverse((m) => {
      if (!m.isMesh) return;
      const n = (m.name + (m.parent?.name || '')).toLowerCase();
      m.receiveShadow = true;
      m.castShadow = !n.includes('sol') && !n.includes('eau');
      if (n.includes('eau')) this.preparerEau(m);
      if (n.includes('feu')) { this.flammes = m; m.castShadow = false; }
    });
    const defile = racine.getObjectByName('defile');
    if (defile) {
      this.defile = [defile, defile.clone(true)];
      this.defile[1].position.x = 48;
      racine.add(this.defile[1]);
    }
    this.appliquerAmbiance(AMBIANCES[visuel] || AMBIANCES[nom]);
    entrees.forEach(([id, o], i) => {
      const c = this.creerPersonnage(modeles[i], o.echelle || 1);
      this.poserMotif(c, this.histoire.personnages[id].style);
      // En portrait, les personnages se rapprochent pour tenir dans le cadre.
      c.position.x = o.x * ECHELLE_X * Math.min(1, this.camera.aspect * 1.25);
      c.userData = { ...c.userData, id, xBase: c.position.x, z0: Math.abs(o.x) > 3 ? -0.5 : 0 };
      c.position.z = c.userData.z0;
      this.chars[id] = c;
      this.groupe.add(c);
      if (!this.reduit) this.faireEntrer(c);
    });
    if (avecCheval) this.preparerCourse(cheval, cavalier);
    this.scene.add(this.groupe);
    this.camera.position.set(0, this.cam.y, this.cam.z);
    this.dernierCadre = null;
    this.cadrer(null);
    this.cam.x = this.cible.x; this.cam.z = this.cible.z;
  }

  styleCavalier() {
    const styles = Object.values(this.histoire.personnages).map((p) => p.style);
    return ['guerriere', 'cavalier', 'guerrier', 'jeune', 'chasseur'].find((s) => styles.includes(s)) || 'cavalier';
  }

  preparerEau(m) {
    m.material = m.material.clone();
    m.material.transparent = true;
    m.material.opacity = 0.92;
    this.eau = { mesh: m, base: m.geometry.attributes.position.array.slice() };
  }

  appliquerAmbiance(a) {
    this.ambiance = a;
    this.scene.fog = new THREE.Fog(a.brume[0], a.brume[1], a.brume[2]);
    if (this.fond) this.fond.dispose();
    this.fond = degrade(a.ciel[0], a.ciel[1]);
    this.scene.background = this.fond;
    this.hemi.color.set(a.ambiant[0]); this.hemi.groundColor.set(a.ambiant[1]); this.hemi.intensity = a.ambiant[2];
    this.soleil.color.set(a.soleil[0]); this.soleil.intensity = a.soleil[1];
    this.soleil.position.set(...a.soleil[2]).multiplyScalar(2);
    if (a.nuit) this.groupe.add(this.creerEtoiles());
    this.feu.intensity = 0;
    if (a.feu) this.feu.position.set(...a.feu);
  }

  creerEtoiles() {
    const n = 500, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const az = Math.random() * Math.PI - Math.PI / 2, el = 0.08 + Math.random() * 1.1;
      p[i * 3] = Math.sin(az) * Math.cos(el) * 150;
      p[i * 3 + 1] = Math.sin(el) * 150;
      p[i * 3 + 2] = -Math.cos(az) * Math.cos(el) * 150;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    const e = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xfff6e0, size: 0.9, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.85, depthWrite: false }));
    const lune = new THREE.Mesh(new THREE.SphereGeometry(4, 18, 12), new THREE.MeshBasicMaterial({ color: 0xf6efd8, fog: false }));
    lune.position.set(-34, 46, -100);
    const groupe = new THREE.Group();
    groupe.add(e, lune);
    return groupe;
  }

  creerPersonnage(gltf, echelle) {
    const c = clonerSquelette(gltf.scene);
    c.scale.multiplyScalar(echelle);
    c.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; } });
    const melangeur = new THREE.AnimationMixer(c);
    const actions = {};
    gltf.animations.forEach((a) => { actions[a.name] = melangeur.clipAction(a); });
    Object.values(actions).forEach((a) => { a.setEffectiveWeight(0); a.play(); });
    if (actions.repos) { actions.repos.setEffectiveWeight(1); actions.repos.time = Math.random() * 2; }
    c.userData.anim = { melangeur, actions, courante: 'repos' };
    this.melangeurs.push(melangeur);
    return c;
  }

  jouer(c, nom) {
    const an = c.userData.anim;
    if (!an || an.courante === nom || !an.actions[nom]) return;
    const a = an.actions[an.courante], b = an.actions[nom];
    b.enabled = true; b.setEffectiveWeight(1); b.crossFadeFrom(a, DUREE_FONDU, false);
    an.courante = nom;
  }

  // Les personnages arrivent à pied depuis le côté le plus proche.
  faireEntrer(c) {
    const signe = Math.sign(c.userData.xBase) || 1;
    c.position.x = c.userData.xBase + signe * 2.4;
    c.userData.entree = true;
    this.jouer(c, 'marche');
  }

  preparerCourse(cheval, cavalier) {
    const ch = clonerSquelette(cheval.scene);
    ch.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
    const melangeur = new THREE.AnimationMixer(ch);
    const galop = melangeur.clipAction(cheval.animations.find((a) => a.name === 'galop'));
    const repos = melangeur.clipAction(cheval.animations.find((a) => a.name === 'repos'));
    repos.play();
    galop.play(); galop.setEffectiveWeight(0);
    this.melangeurs.push(melangeur);
    ch.position.set(0, 0, 0);
    this.groupe.add(ch);
    const r = this.creerPersonnage(cavalier, 1);
    this.jouer(r, 'monte');
    r.rotation.y = Math.PI / 2;
    r.position.set(0, 0.56, 0);
    this.groupe.add(r);
    this.course = { cheval: ch, galop, repos, cavalier: r };
  }

  vider() {
    if (this.groupe) this.scene.remove(this.groupe);
    this.melangeurs.forEach((m) => m.stopAllAction());
    this.melangeurs = [];
    this.chars = {};
    this.hotspots = [];
    this.halos = [];
    this.eau = null;
    this.flammes = null;
    this.defile = null;
    this.course = null;
  }

  cadrer(speaker) {
    this.dernierCadre = speaker;
    const c = this.chars[speaker];
    const k = this.recul();
    if (this.course) { this.cible = { x: 0.4, y: 1.7, z: 6.8 * k, vx: 0.4, vy: 1.25 }; return; }
    if (c && !this.reduit) {
      this.cible = { x: c.userData.xBase * 0.5 / k, y: 1.4, z: 4.6 * k, vx: c.userData.xBase * 0.52 / k, vy: 0.92 };
    } else {
      this.cible = { x: 0, y: 1.45, z: (this.surObjet ? 7 : 6) * k, vx: 0, vy: 0.85 };
    }
    // En portrait, la boîte de dialogue couvre le bas : la scène remonte.
    if (this.camera.aspect < 1) this.cible.vy -= 0.55;
  }

  parler(id) {
    const avant = this.parlant;
    this.parlant = id;
    if (avant && this.chars[avant]) this.jouer(this.chars[avant], 'repos');
    if (id && this.chars[id] && !this.chars[id].userData.entree) this.jouer(this.chars[id], 'parle');
  }

  galop(v) {
    this.vitesse = v;
    if (!this.course) return;
    const { galop, repos } = this.course;
    galop.setEffectiveWeight(v > 0 ? 1 : 0);
    repos.setEffectiveWeight(v > 0 ? 0 : 1);
    galop.timeScale = 0.7 + v * 0.45;
  }

  // Les objets à découvrir : leurs vrais modèles, posés autour de la scène, chacun avec son halo.
  async explorer(ids, surObjet) {
    const cadre = this.dernierCadre;
    this.surObjet = surObjet;
    this.cadrer(null);
    this.dernierCadre = cadre;
    this.hotspots = [];
    const groupe = this.groupe;
    const modeles = await Promise.all(ids.map((id) => this.charge(`modeles/patrimoine/${id}.glb`).catch(() => null)));
    if (groupe !== this.groupe || this.surObjet !== surObjet) return;
    ids.forEach((id, i) => {
      if (!modeles[i]) return;
      const [x, z] = EMPLACEMENTS[i % EMPLACEMENTS.length];
      const m = modeles[i].scene.clone(true);
      this.poserMotif(m, id, !!this.patrimoine.find((p) => p.id === id)?.peuples.includes('Plusieurs peuples'));
      const boite = new THREE.Box3().setFromObject(m);
      const taille = boite.getSize(new THREE.Vector3());
      const k = 1.3 / Math.max(taille.x, taille.y, taille.z);
      m.scale.setScalar(k);
      m.position.set(x, -boite.min.y * k, z);
      m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.userData.hotspot = id; } });
      groupe.add(m);
      this.hotspots.push(m);
      const halo = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.86, 32), new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false, fog: false }));
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(x, 0.03, z);
      groupe.add(halo);
      this.halos.push(halo);
    });
  }

  finExplorer() {
    this.surObjet = null;
    this.cadrer(this.dernierCadre);
    const g = this.groupe;
    if (g) {
      this.halos.forEach((h) => { g.remove(h); h.geometry.dispose(); h.material.dispose(); });
      this.hotspots.forEach((m) => g.remove(m));
    }
    this.halos = [];
    this.hotspots = [];
  }

  cliquer(e) {
    if (!this.surObjet) return;
    this.ptr.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    this.ray.setFromCamera(this.ptr, this.camera);
    const hit = this.ray.intersectObjects(this.hotspots, true)[0];
    if (hit) this.surObjet(hit.object.userData.hotspot);
  }

  image() {
    const maintenant = performance.now();
    const dt = Math.min(0.1, (maintenant - this.avant) / 1000);
    this.avant = maintenant;
    const t = (this.temps += dt);
    this.mesurer((maintenant - this.dernierePrise) / 1000 || dt);
    this.dernierePrise = maintenant;
    const cam = this.cam, cible = this.cible;
    const lisse = this.reduit ? 1 : Math.min(1, dt * 2.1);
    for (const k of ['x', 'y', 'z', 'vx', 'vy']) cam[k] += (cible[k] - cam[k]) * lisse;
    const px = this.reduit ? 0 : this.mx * 0.32, py = this.reduit ? 0 : this.my * 0.12;
    this.camera.position.set(cam.x + px, cam.y - py, cam.z);
    this.camera.lookAt(cam.vx, cam.vy, 0);
    this.melangeurs.forEach((m) => m.update(this.reduit ? dt * 0.4 : dt));

    for (const id in this.chars) {
      const c = this.chars[id], u = c.userData;
      if (u.entree) {
        const reste = u.xBase - c.position.x;
        const pas = Math.sign(reste) * Math.min(Math.abs(reste), dt * 1.5);
        c.position.x += pas;
        c.rotation.y = THREE.MathUtils.lerp(c.rotation.y, Math.sign(reste) * 1.25, Math.min(1, dt * 7));
        if (Math.abs(reste) < 0.02) {
          u.entree = false;
          this.jouer(c, this.parlant === id ? 'parle' : 'repos');
        }
        continue;
      }
      // Chacun se tourne vers celui qui parle, sinon vers le spectateur.
      const p = this.parlant && this.chars[this.parlant];
      let vise = 0;
      if (p && p !== c) vise = Math.atan2(p.position.x - c.position.x, 1.6);
      else if (this.dernierCadre && this.dernierCadre !== id && this.chars[this.dernierCadre]) vise = Math.atan2(this.chars[this.dernierCadre].position.x - c.position.x, 2.2);
      c.rotation.y += (vise - c.rotation.y) * Math.min(1, dt * 3.5);
    }

    if (this.defile) {
      const dx = (0.6 + this.vitesse * 7) * dt * (this.vitesse > 0 ? 1 : 0.12);
      this.defile.forEach((d) => {
        d.position.x -= dx;
        if (d.position.x < -48) d.position.x += 96;
      });
    }
    if (this.course && !this.reduit) {
      const ch = this.course.cheval;
      const v = this.vitesse;
      ch.position.y = v > 0 ? Math.abs(Math.sin(t * (6 + v * 2.5))) * 0.1 : 0;
      this.course.cavalier.position.y = 0.56 + ch.position.y * 1.15;
    }
    if (this.eau) {
      const a = this.eau.mesh.geometry.attributes.position, b = this.eau.base;
      if (!this.reduit) {
        for (let i = 0; i < a.count; i++) {
          a.array[i * 3 + 1] = b[i * 3 + 1] + Math.sin(b[i * 3] * 0.9 + t * 1.2) * 0.035 + Math.cos(b[i * 3 + 2] * 1.4 + t * 0.9) * 0.03;
        }
        a.needsUpdate = true;
        this.eau.mesh.geometry.computeVertexNormals();
      }
    }
    if (this.flammes && !this.reduit) {
      this.flammes.scale.y = 1 + Math.sin(t * 11) * 0.09 + Math.sin(t * 23) * 0.05;
      this.flammes.scale.x = 1 + Math.sin(t * 8) * 0.04;
    }
    if (this.ambiance?.feu) this.feu.intensity = this.reduit ? 22 : 22 + Math.sin(t * 13) * 3 + Math.sin(t * 29) * 2;
    this.halos.forEach((h, i) => { const k = 1 + (this.reduit ? 0 : Math.sin(t * 3 + i) * 0.09); h.scale.set(k, k, 1); });
    this.renderer.render(this.scene, this.camera);
  }

  detruire() {
    this.jeton++;
    this.renderer.setAnimationLoop(null);
    removeEventListener('pointermove', this._surPointeur);
    removeEventListener('resize', this._surTaille);
    this.canvas.removeEventListener('click', this._surClic);
    this.vider();
    this.fond?.dispose();
    this.cache.forEach((p) => p.then((g) => g.scene.traverse((o) => {
      if (!o.isMesh) return;
      o.geometry.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map?.dispose(); m.dispose(); });
    })).catch(() => {}));
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
