/*
 * Le moteur des films 3D. Il reprend les décors et les marionnettes du jeu, mais chaque image ne dépend que du temps t :
 * on peut sauter n'importe où, et le rendu image par image donne le même film quelle que soit la vitesse de la machine.
 * Le film lui-même est décrit par un découpage (films3d/decoupages/), sans code Three.js.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as clonerSquelette } from 'three/addons/utils/SkeletonUtils.js';
import { AMBIANCES } from '../src/scenes3d/ambiances.js';

const FONDU_GESTE = 0.35;
// Les ambiances propres aux films s'ajoutent à celles du jeu.
const AMBIANCES_FILM = {
  cosmos: { ciel: ['#02030c', '#0b1030'], soleil: ['#ffe8c0', 1.5, [-4, 7, 9]], ambiant: ['#8a93c0', '#2a2438', 1.5], brume: ['#0b1030', 40, 300] },
  'nuit-claire': { ciel: ['#070c26', '#2e3f78'], soleil: ['#b4c8f4', 2.4, [-5, 11, 7]], ambiant: ['#8ea0d4', '#2c2a3c', 1.9], brume: ['#1f2c58', 24, 100], nuit: true },
  aube: { ciel: ['#3b4f8f', '#f2a65a'], soleil: ['#ffc48a', 2.2, [-9, 6, 7]], ambiant: ['#e8c8b0', '#6c5244', 1.2], brume: ['#e8a878', 40, 170] },
  secheresse: { ciel: ['#e6a24a', '#f8e0a0'], soleil: ['#ffe8b0', 4.2, [6, 13, 5]], ambiant: ['#ffe4b8', '#a07040', 1.6], brume: ['#f4d090', 24, 110] },
  orage: { ciel: ['#20283c', '#57627a'], soleil: ['#a8b8d8', .9, [-5, 11, 5]], ambiant: ['#7a8aa8', '#2c2c34', 1.2], brume: ['#4c5468', 18, 80] },
  pluie: { ciel: ['#5a7a98', '#b4c6c8'], soleil: ['#dce8e8', 1.7, [-6, 11, 6]], ambiant: ['#c8d8d8', '#54604c', 1.5], brume: ['#a0b4b8', 20, 90] },
  soir: { ciel: ['#1a2452', '#e8885a'], soleil: ['#ffa870', 1.8, [-10, 4.5, 6]], ambiant: ['#b09ab0', '#4c3a38', 1.05], brume: ['#b47868', 30, 130] },
  haut: { ciel: ['#0c1a58', '#7fa8e0'], soleil: ['#fff6da', 2.2, [-6, 12, 6]], ambiant: ['#cfdcf6', '#7f96c4', 1.7], brume: ['#7fa8e0', 40, 200] },
};
const ambiance = (nom) => AMBIANCES_FILM[nom] || AMBIANCES[nom];
const nomOs = (n) => THREE.PropertyBinding.sanitizeNodeName(n);
const lisse = (x) => x * x * (3 - 2 * x);
const borne = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const VERS_RAD = Math.PI / 180;

function hasard(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let z = a;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}
const empreinte = (s) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;

// Les pistes : [[t, { clé: valeur, … }], …]. Une clé garde sa valeur hors de ses images-clés, et glisse entre elles.
function indexerPiste(piste = []) {
  const parCle = {};
  for (const [t, cles] of piste) {
    for (const [k, v] of Object.entries(cles)) {
      if (k !== 'anim' && k !== 'vitesse' && k !== 'lin') (parCle[k] = parCle[k] || []).push([t, v, cles.lin]);
    }
  }
  const gestes = piste.filter(([, c]) => c.anim).map(([t, c]) => ({ t, anim: c.anim, vitesse: c.vitesse ?? 1 }));
  return { parCle, gestes };
}

function lire(index, cle, t, defaut) {
  const l = index.parCle[cle];
  if (!l) return defaut;
  if (t <= l[0][0]) return l[0][1];
  for (let i = 1; i < l.length; i++) {
    if (t < l[i][0]) {
      const [t0, v0] = l[i - 1], [t1, v1, lin] = l[i];
      const x = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (lin ? x : lisse(x));
    }
  }
  return l[l.length - 1][1];
}

function texturePoint() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const d = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  d.addColorStop(0, 'rgba(255,255,255,1)');
  d.addColorStop(.18, 'rgba(255,255,255,.72)');
  d.addColorStop(.5, 'rgba(255,255,255,.16)');
  d.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = d;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Les formes simples qui n'ont pas besoin d'un modèle Blender.
function creerForme(type, o) {
  if (type === 'pilon') {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.045, .07, 1.75, 12), new THREE.MeshStandardMaterial({ color: '#8a6238', roughness: .8 }));
    m.castShadow = true;
    return m;
  }
  if (type === 'mortier') {
    const profil = [[.001, 0], [.21, 0], [.15, .1], [.13, .26], [.27, .52], [.3, .66], [.25, .66], [.17, .46], [.001, .42]].map(([x, y]) => new THREE.Vector2(x, y));
    const m = new THREE.Mesh(new THREE.LatheGeometry(profil, 28), new THREE.MeshStandardMaterial({ color: '#6e4524', roughness: .85, side: THREE.DoubleSide }));
    m.castShadow = m.receiveShadow = true;
    return m;
  }
  if (type === 'tronc') {
    const hauteur = o.hauteur ?? .8, rayon = o.rayon ?? .34;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rayon, rayon * 1.12, hauteur, 18), new THREE.MeshStandardMaterial({ color: '#5a3d24', roughness: .95 }));
    m.geometry.translate(0, hauteur / 2, 0);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
  if (type === 'natte') {
    const m = new THREE.Mesh(new THREE.BoxGeometry(.8, .025, 1.5), new THREE.MeshStandardMaterial({ color: '#c8a768', roughness: 1 }));
    m.receiveShadow = true;
    return m;
  }
  if (type === 'nuage') {
    const r = hasard(empreinte(o.graine || 'nuage'));
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: o.couleur || '#fff4e6', roughness: 1, transparent: true, opacity: .96 });
    for (let i = 0; i < 9; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(.7 + r() * .9, 14, 10), mat);
      b.position.set((r() - .5) * 5.5, (r() - .5) * .55, (r() - .5) * 1.6);
      b.scale.y = .62;
      g.add(b);
    }
    return g;
  }
  if (type === 'gerbe') {
    const g = new THREE.Group();
    const r = hasard(5);
    for (let i = 0; i < 14; i++) {
      const tige = new THREE.Mesh(new THREE.CylinderGeometry(.008, .012, .75, 5), new THREE.MeshStandardMaterial({ color: '#c49a42' }));
      const a = r() * 6.28, d = r() * .1;
      tige.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
      const epi = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 6), new THREE.MeshStandardMaterial({ color: '#8f5f22' }));
      epi.scale.y = 3;
      epi.position.y = .42;
      tige.add(epi);
      tige.rotation.set((r() - .5) * .3, 0, (r() - .5) * .3);
      g.add(tige);
    }
    g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    return g;
  }
  if (type === 'feuilles') {
    const g = new THREE.Group();
    const r = hasard(11);
    for (let i = 0; i < 9; i++) {
      const f = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshStandardMaterial({ color: i % 2 ? '#5c8a35' : '#7aa83f' }));
      f.scale.set(1, .2, .55);
      f.position.set((r() - .5) * .2, (r() - .5) * .12, (r() - .5) * .2);
      f.rotation.set(r() * 2, r() * 6, r() * 2);
      g.add(f);
    }
    return g;
  }
  if (type === 'foudre') {
    const r = hasard(empreinte(o.graine || 'foudre'));
    const pts = [];
    let x = 0;
    for (let y = 20; y >= 0; y -= 1.5) { pts.push(new THREE.Vector3(x, y, 0)); x += (r() - .5) * 2.2; }
    pts.push(new THREE.Vector3(0, 0, 0));
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0), 90, .035, 6), new THREE.MeshBasicMaterial({ color: '#f4f8ff', transparent: true, fog: false, depthWrite: false, toneMapped: false }));
  }
  throw new Error(`Forme inconnue : ${type}`);
}

function debarrasser(racine) {
  racine.traverse((m) => {
    if (m.isPoints || m.isLineSegments) { m.geometry.dispose(); m.material.dispose(); }
  });
}

export class Film {
  constructor(canvas, def, { largeur = 1920, hauteur = 1080 } = {}) {
    this.def = def;
    this.canvas = canvas;
    this.chargeur = new GLTFLoader();
    this.cache = new Map();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(largeur, hauteur, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, largeur / hauteur, 0.1, 500);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    this.soleil = new THREE.DirectionalLight(0xffffff, 2);
    this.soleil.castShadow = true;
    this.soleil.shadow.mapSize.set(4096, 4096);
    const o = this.soleil.shadow.camera;
    o.left = -22; o.right = 22; o.top = 20; o.bottom = -14; o.near = 1; o.far = 90;
    this.soleil.shadow.bias = -0.0004;
    this.soleil.shadow.normalBias = 0.025;
    this.feu = new THREE.PointLight(0xff9a3a, 0, 16, 1.6);
    this.scene.add(this.hemi, this.soleil, this.soleil.target, this.feu);
    this.ciel = this.creerPlein(`varying vec2 vU; void main(){ vU = uv; gl_Position = vec4(position.xy, .9999, 1.); }`,
      `uniform vec3 haut; uniform vec3 bas; varying vec2 vU; void main(){ float k = smoothstep(.0, .62, 1. - vU.y); gl_FragColor = vec4(mix(haut, bas, k), 1.);
      #include <colorspace_fragment>
      }`, { haut: { value: new THREE.Color() }, bas: { value: new THREE.Color() } }, -1000, false);
    this.voile = this.creerPlein(`varying vec2 vU; void main(){ vU = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
      `uniform vec3 teinte; uniform float force; void main(){ gl_FragColor = vec4(teinte, force);
      #include <colorspace_fragment>
      }`, { teinte: { value: new THREE.Color('#000') }, force: { value: 0 } }, 1000, true);
    this.scene.fog = new THREE.Fog(0x000000, 40, 150);
    this.point = texturePoint();
    this.plan = null;
  }

  creerPlein(vs, fs, uniforms, ordre, transparent) {
    const g = new THREE.PlaneGeometry(2, 2);
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false, transparent, fog: false, toneMapped: false }));
    m.frustumCulled = false;
    m.renderOrder = ordre;
    this.scene.add(m);
    return m;
  }

  charge(chemin) {
    if (!this.cache.has(chemin)) this.cache.set(chemin, this.chargeur.loadAsync(chemin));
    return this.cache.get(chemin);
  }

  planA(t) {
    const p = this.def.plans;
    return p.find((x) => t >= x.de && t < x.a) || p[p.length - 1];
  }

  async construire(plan) {
    if (this.groupe) { debarrasser(this.groupe); this.scene.remove(this.groupe); }
    this.feuActif = false;
    this.eau = null; this.flammes = null;
    const g = this.groupe = new THREE.Group();
    this.scene.add(g);
    this.decor = null;
    if (plan.decor) {
      const gltf = await this.charge(`/modeles/decors/${plan.decor}.glb`);
      const d = this.decor = gltf.scene.clone(true);
      d.traverse((m) => {
        if (!m.isMesh) return;
        const n = (m.name + (m.parent?.name || '')).toLowerCase();
        m.receiveShadow = true;
        m.castShadow = !n.includes('sol') && !n.includes('eau');
        if (n.includes('eau')) {
          m.material = m.material.clone();
          m.material.transparent = true;
          m.material.opacity = .92;
          this.eau = { mesh: m, base: m.geometry.attributes.position.array.slice() };
        }
        if (n.includes('feu')) { this.flammes = m; m.castShadow = false; }
      });
      g.add(d);
    }
    for (const n of plan.masquer || []) { const m = this.decor?.getObjectByName(n); if (m) m.visible = false; }
    // Teinter un matériau du décor (le mil qui sèche, puis qui reverdit) : [[t, couleur], …]
    this.teintes = [];
    for (const [nom, piste] of Object.entries(plan.teintes || {})) {
      const copie = new Map();
      this.decor?.traverse((m) => {
        if (!m.isMesh || m.material.name !== nom) return;
        if (!copie.has(m.material)) copie.set(m.material, m.material.clone());
        m.material = copie.get(m.material);
      });
      copie.forEach((materiau) => this.teintes.push({ materiau, piste }));
    }
    this.pisteDecor = indexerPiste(plan.pisteDecor);

    this.acteurs = {};
    for (const [id, a] of Object.entries(plan.acteurs || {})) {
      const style = a.style || this.def.distribution[id]?.style;
      if (!style) throw new Error(`Acteur sans style : ${id}`);
      const gltf = await this.charge(`/films3d/modeles/${style}.glb`);
      const c = clonerSquelette(gltf.scene);
      c.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; } });
      const melangeur = new THREE.AnimationMixer(c);
      const actions = {};
      gltf.animations.forEach((clip) => {
        actions[clip.name] = melangeur.clipAction(clip);
        actions[clip.name].play();
        actions[clip.name].setEffectiveWeight(0);
      });
      const index = indexerPiste(a.piste);
      if (!index.gestes.length) index.gestes.push({ t: plan.de, anim: 'repos', vitesse: 1 });
      const echelle = a.echelle ?? this.def.distribution[id]?.echelle ?? 1;
      this.acteurs[id] = { c, melangeur, actions, index, echelle, decal: empreinte(id) % 97 / 10, base: c.scale.x };
      g.add(c);
    }

    this.objets = {};
    for (const [id, o] of Object.entries(plan.objets || {})) {
      let m;
      if (o.modele) {
        const gltf = await this.charge(`/modeles/${o.modele}.glb`);
        m = gltf.scene.clone(true);
        m.traverse((x) => { if (x.isMesh) x.castShadow = true; });
      } else if (o.forme === 'lumiere') {
        m = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.point, color: o.couleur || '#ffe7a3', transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending, toneMapped: false }));
      } else {
        m = creerForme(o.forme, o);
      }
      g.add(m);
      this.objets[id] = { m, def: o, index: indexerPiste(o.piste) };
    }
    this.pisteCam = indexerPiste((plan.camera || []).map(([t, p, v, f]) => [t, { px: p[0], py: p[1], pz: p[2], vx: v[0], vy: v[1], vz: v[2], ...(f ? { f } : {}) }]));
    this.pisteLumiere = indexerPiste(plan.lumiere);
    this.creerEffets(plan, g);
    this.plan = plan;
  }

  creerEffets(plan, g) {
    const e = plan.effets || {};
    this.etoiles = null; this.pluie = null; this.poussiere = null;
    this.pisteEtoiles = indexerPiste(e.etoiles);
    this.pistePluie = indexerPiste(e.pluie);
    if (e.etoiles) {
      const n = 1400, p = new Float32Array(n * 3), r = hasard(7);
      for (let i = 0; i < n; i++) {
        const az = (r() - .5) * Math.PI * 1.2, el = .02 + r() * 1.2;
        p[i * 3] = Math.sin(az) * Math.cos(el) * 240;
        p[i * 3 + 1] = Math.sin(el) * 240;
        p[i * 3 + 2] = -Math.cos(az) * Math.cos(el) * 240;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
      this.etoiles = new THREE.Points(geo, new THREE.PointsMaterial({ map: this.point, color: 0xfff6e0, size: 2.4, sizeAttenuation: true, fog: false, transparent: true, depthWrite: false, toneMapped: false }));
      g.add(this.etoiles);
    }
    if (e.pluie) {
      const n = 2600, p = new Float32Array(n * 6), r = hasard(3);
      this.pluieBase = Array.from({ length: n }, () => [(r() - .5) * 46, r() * 16, -18 + r() * 30]);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
      this.pluie = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#dfeaf2', transparent: true, depthWrite: false, fog: false }));
      this.pluie.frustumCulled = false;
      g.add(this.pluie);
    }
    if (e.poussiere) {
      const r = hasard(13);
      this.grains = e.poussiere.flatMap((b) => Array.from({ length: b.n || 14 }, () => ({ t: b.t, x: b.x, y: b.y ?? .6, z: b.z ?? 0, vx: (r() - .5) * 1.5, vy: .8 + r() * 1.3, vz: (r() - .5) * 1.5 })));
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.grains.length * 3), 3));
      this.poussiere = new THREE.Points(geo, new THREE.PointsMaterial({ map: this.point, color: e.couleurPoussiere || '#e7cf9a', size: .17, transparent: true, depthWrite: false }));
      this.poussiere.frustumCulled = false;
      g.add(this.poussiere);
    }
  }

  appliquerAmbiance(t) {
    const liste = this.plan.ambiances;
    let a, b, x = 0;
    for (let i = 0; i < liste.length; i++) {
      if (t >= liste[i][0]) a = liste[i];
      if (t < liste[i][0]) { b = liste[i]; break; }
    }
    a = a || liste[0];
    const A = ambiance(a[1]), B = b && b[2] ? ambiance(b[1]) : A;
    if (b && b[2]) x = lisse(borne((t - (b[0] - b[2])) / b[2]));
    const couleur = (va, vb) => new THREE.Color(va).lerp(new THREE.Color(vb), x);
    const u = this.ciel.material.uniforms;
    u.haut.value.copy(couleur(A.ciel[0], B.ciel[0]));
    u.bas.value.copy(couleur(A.ciel[1], B.ciel[1]));
    this.scene.fog.color.copy(couleur(A.brume[0], B.brume[0]));
    this.scene.fog.near = A.brume[1] + (B.brume[1] - A.brume[1]) * x;
    this.scene.fog.far = A.brume[2] + (B.brume[2] - A.brume[2]) * x;
    this.hemi.color.copy(couleur(A.ambiant[0], B.ambiant[0]));
    this.hemi.groundColor.copy(couleur(A.ambiant[1], B.ambiant[1]));
    this.hemi.intensity = A.ambiant[2] + (B.ambiant[2] - A.ambiant[2]) * x;
    this.soleil.color.copy(couleur(A.soleil[0], B.soleil[0]));
    this.soleil.intensity = A.soleil[1] + (B.soleil[1] - A.soleil[1]) * x;
    const da = new THREE.Vector3(...A.soleil[2]), db = new THREE.Vector3(...B.soleil[2]);
    this.soleil.position.copy(da.lerp(db, x)).multiplyScalar(3);
    const feu = x < .5 ? A.feu : B.feu;
    this.feu.intensity = feu ? 22 + Math.sin(t * 13) * 3 + Math.sin(t * 29) * 2 : 0;
    if (feu) this.feu.position.set(...feu);
  }

  poserActeur(a, t) {
    const { c, index, melangeur, actions } = a;
    c.position.set(lire(index, 'x', t, 0), lire(index, 'y', t, 0), lire(index, 'z', t, 0));
    c.rotation.set(lire(index, 'rx', t, 0) * VERS_RAD, lire(index, 'rot', t, 0) * VERS_RAD, lire(index, 'rz', t, 0) * VERS_RAD);
    c.scale.setScalar(a.base * a.echelle * lire(index, 'e', t, 1));
    c.visible = lire(index, 'vu', t, 1) > .5;

    const g = index.gestes;
    let i = 0;
    for (let k = 0; k < g.length; k++) if (t >= g[k].t) i = k;
    const cur = g[i], prec = i > 0 ? g[i - 1] : null;
    const w = prec ? borne((t - cur.t) / FONDU_GESTE) : 1;
    Object.values(actions).forEach((x) => x.setEffectiveWeight(0));
    const regler = (seg, poids) => {
      const ac = actions[seg.anim];
      if (!ac) throw new Error(`Geste inconnu : ${seg.anim}`);
      const d = ac.getClip().duration;
      ac.enabled = true;
      ac.setEffectiveWeight(poids);
      ac.time = (((t - seg.t) * seg.vitesse + (seg.anim === 'repos' ? a.decal : 0)) % d + d) % d;
    };
    if (prec && w < 1) regler(prec, 1 - w);
    regler(cur, w);
    melangeur.update(0);
  }

  poserObjet(o, t) {
    const { m, def, index } = o;
    const accroche = def.accroche;
    const dx = lire(index, 'x', t, 0), dy = lire(index, 'y', t, 0), dz = lire(index, 'z', t, 0);
    if (accroche) {
      const a = this.acteurs[accroche.acteur];
      const os = a.c.getObjectByName(nomOs(accroche.os || 'torse'));
      a.c.updateMatrixWorld(true);
      os.getWorldPosition(m.position);
      m.position.add(new THREE.Vector3(dx, dy, dz));
    } else {
      m.position.set(dx, dy, dz);
    }
    m.rotation.set(lire(index, 'rx', t, 0) * VERS_RAD, lire(index, 'rot', t, 0) * VERS_RAD, lire(index, 'rz', t, 0) * VERS_RAD);
    const e = lire(index, 'e', t, 1);
    m.scale.setScalar(e);
    const alpha = lire(index, 'o', t, 1) * (index.parCle.tremble ? 1 - lire(index, 'tremble', t, 0) * (.5 + .5 * Math.sin(t * 31) * Math.sin(t * 13)) : 1);
    m.visible = alpha > .004 && e > .001;
    if (m.material) m.material.opacity = alpha;
  }

  appliquerEffets(t) {
    for (const { materiau, piste } of this.teintes) {
      let i = 0;
      while (i < piste.length - 1 && t >= piste[i + 1][0]) i++;
      const [t0, c0] = piste[i], suivant = piste[i + 1];
      materiau.color.set(c0);
      if (suivant) materiau.color.lerp(new THREE.Color(suivant[1]), lisse(borne((t - t0) / (suivant[0] - t0))));
    }
    if (this.etoiles) {
      this.etoiles.geometry.setDrawRange(0, Math.floor(lire(this.pisteEtoiles, 'n', t, 1) * 1400));
      this.etoiles.material.opacity = lire(this.pisteEtoiles, 'o', t, 1);
    }
    if (this.pluie) {
      const o = lire(this.pistePluie, 'o', t, 0);
      this.pluie.visible = o > .01;
      this.pluie.material.opacity = o * .55;
      const p = this.pluie.geometry.attributes.position;
      this.pluieBase.forEach(([x, y, z], i) => {
        const h = (((y - t * 15) % 16) + 16) % 16;
        p.array.set([x, h, z, x - .02, h + .55, z], i * 6);
      });
      p.needsUpdate = true;
    }
    if (this.poussiere) {
      const p = this.poussiere.geometry.attributes.position;
      this.grains.forEach((g, i) => {
        const v = t - g.t;
        if (v < 0 || v > .9) { p.setXYZ(i, 0, -50, 0); return; }
        p.setXYZ(i, g.x + g.vx * v, g.y + g.vy * v - 2.2 * v * v, g.z + g.vz * v);
      });
      p.needsUpdate = true;
    }
    if (this.eau) {
      const a = this.eau.mesh.geometry.attributes.position, b = this.eau.base;
      for (let i = 0; i < a.count; i++) a.array[i * 3 + 1] = b[i * 3 + 1] + Math.sin(b[i * 3] * .9 + t * 1.2) * .035 + Math.cos(b[i * 3 + 2] * 1.4 + t * .9) * .03;
      a.needsUpdate = true;
    }
    if (this.flammes) {
      this.flammes.scale.y = 1 + Math.sin(t * 11) * .09 + Math.sin(t * 23) * .05;
      this.flammes.scale.x = 1 + Math.sin(t * 8) * .04;
    }
  }

  // Le voile : fondus au noir du plan, et éclairs blancs.
  appliquerVoile(t, plan) {
    const f = plan.fondu || {};
    let noir = 0;
    if (f.entree) noir = Math.max(noir, 1 - borne((t - plan.de) / f.entree));
    if (f.sortie) noir = Math.max(noir, borne((t - (plan.a - f.sortie)) / f.sortie));
    let blanc = 0;
    for (const e of plan.eclairs || []) {
      const v = t - e;
      if (v >= 0 && v < .55) blanc = Math.max(blanc, (1 - v / .55) * (Math.sin(v * 44) * .25 + .75));
    }
    const u = this.voile.material.uniforms;
    u.teinte.value.set(blanc > noir ? '#fff' : '#000');
    u.force.value = Math.max(noir, blanc);
    this.hemi.intensity += blanc * 3;
  }

  async aller(t) {
    const plan = this.planA(t);
    if (plan !== this.plan) await this.construire(plan);
    this.appliquerAmbiance(t);
    if (this.decor) this.decor.position.set(lire(this.pisteDecor, 'x', t, 0), lire(this.pisteDecor, 'y', t, 0), lire(this.pisteDecor, 'z', t, 0));
    for (const a of Object.values(this.acteurs)) this.poserActeur(a, t);
    for (const o of Object.values(this.objets)) this.poserObjet(o, t);
    this.appliquerEffets(t);
    const c = this.pisteCam;
    this.camera.position.set(lire(c, 'px', t, 0), lire(c, 'py', t, 1.45), lire(c, 'pz', t, 6));
    this.camera.lookAt(lire(c, 'vx', t, 0), lire(c, 'vy', t, .9), lire(c, 'vz', t, 0));
    const f = lire(c, 'f', t, 42);
    if (f !== this.camera.fov) { this.camera.fov = f; this.camera.updateProjectionMatrix(); }
    this.appliquerVoile(t, plan);
    this.renderer.render(this.scene, this.camera);
  }
}
