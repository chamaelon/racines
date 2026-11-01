/*
 * La vue « Relief 3D » : les régions extrudées selon leur nombre de récits, caméra inclinée.
 * Mêmes interactions que la carte : survol, clic sur une région ou une localité.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const COULEUR_TYPE = { conte: 0xe0a43a, legende: 0xc2185b, histoire: 0x4fb3bf };
const TEINTE = (n) => (n === 0 ? 0x3a2c22 : n < 3 ? 0x7a4a26 : n < 6 ? 0xa8622a : 0xd1913f);

function formesDepuis(d, H) {
  return d.split('M').filter(Boolean).map((sp) => {
    const pts = sp.replace(/Z/g, '').split('L').map((p) => p.trim().split(/\s+/).map(Number));
    const s = new THREE.Shape();
    pts.forEach(([x, y], i) => { if (i === 0) s.moveTo(x, H - y); else s.lineTo(x, H - y); });
    return s;
  });
}

export function creerRelief(cadre, o) {
  const { svg, W, H, projeter, localites, nbRecits, reduit, recitDe, surRegion, surLocalite, surSurvol, nomRegion } = o;
  const canvas = document.createElement('canvas');
  canvas.className = 'relief-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Vue en relief des régions du Burkina Faso, plus hautes là où il y a plus de récits ; la liste du panneau propose les mêmes lieux au clavier');
  cadre.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 6000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !reduit;
  controls.maxPolarAngle = Math.PI * 0.46;
  controls.minDistance = 180;
  controls.maxDistance = 3200;
  scene.add(new THREE.HemisphereLight(0xfff1c9, 0x2a1a10, 1.5));
  const soleil = new THREE.DirectionalLight(0xffe2b0, 2);
  soleil.position.set(-400, 700, 500);
  scene.add(soleil);

  const pays = new THREE.Group();
  pays.position.set(-W / 2, 0, H / 2);
  pays.rotation.x = -Math.PI / 2;
  scene.add(pays);

  const hauteurs = {};
  const meshes = [...svg.querySelectorAll('.regions path')].map((p) => {
    const id = p.dataset.region, n = nbRecits(id);
    const h = 8 + n * 7;
    hauteurs[id] = h;
    const geo = new THREE.ExtrudeGeometry(formesDepuis(p.getAttribute('d'), H), { depth: h, bevelEnabled: false });
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: TEINTE(n), roughness: 0.85 }));
    m.userData = { region: id, base: TEINTE(n), n };
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: 0xfbe6bd, transparent: true, opacity: 0.5 })));
    pays.add(m);
    return m;
  });
  const regionDeLocalite = Object.fromEntries(localites.map((l) => [l.id, l.region]));
  const geoM = new THREE.SphereGeometry(7, 16, 12);
  const marqueurs = localites.map((l) => {
    const [x, y] = projeter(l.coords);
    const r = recitDe(l.recits[0]);
    const m = new THREE.Mesh(geoM, new THREE.MeshStandardMaterial({ color: COULEUR_TYPE[r.type], emissive: COULEUR_TYPE[r.type], emissiveIntensity: 0.35 }));
    m.position.set(x, H - y, hauteurs[regionDeLocalite[l.id]] + 11);
    m.userData = { localite: l.id, nom: l.nom, n: l.recits.length };
    pays.add(m);
    return m;
  });

  // La caméra recule sur les cadres étroits pour garder tout le pays en vue.
  const depart = () => {
    const a = (cadre.clientWidth || 1) / (cadre.clientHeight || 1);
    const k = Math.max(1.15, 1.75 / a);
    camera.position.set(0, 560 * k, 640 * k);
    controls.target.set(0, 0, 30);
  };
  depart();

  function taille() {
    const w = cadre.clientWidth || 1, h = cadre.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  taille();
  const obs = new ResizeObserver(taille);
  obs.observe(cadre);

  // ---- Survol et clic, en distinguant le clic du glisser
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let choisie = null, survolee = null, bas = null, boucle = 0;
  function viser(e) {
    const r = canvas.getBoundingClientRect();
    ptr.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const visibles = marqueurs.filter((m) => m.visible);
    return ray.intersectObjects(visibles)[0]?.object || ray.intersectObjects(meshes, false)[0]?.object || null;
  }
  const peindre = () => meshes.forEach((m) => {
    const actif = m.userData.region === choisie || m === survolee;
    m.material.color.setHex(actif ? 0xf6d98e : m.userData.base);
  });
  const surMouvement = (e) => {
    const c = viser(e);
    if (c?.userData.localite) {
      survolee = null;
      surSurvol(e, `<strong>${c.userData.nom}</strong>${c.userData.n} récit${c.userData.n > 1 ? 's' : ''}`);
    } else if (c) {
      survolee = c;
      const n = c.userData.n;
      surSurvol(e, `<strong>${nomRegion(c.userData.region)}</strong>${n ? `${n} récit${n > 1 ? 's' : ''}` : 'À collecter'}`);
    } else { survolee = null; surSurvol(e, null); }
    canvas.style.cursor = c ? 'pointer' : 'grab';
    peindre();
  };
  const surBas = (e) => { bas = [e.clientX, e.clientY]; };
  const surHaut = (e) => {
    if (!bas || Math.hypot(e.clientX - bas[0], e.clientY - bas[1]) > 6) return;
    const c = viser(e);
    if (c?.userData.localite) surLocalite(c.userData.localite);
    else if (c) surRegion(c.userData.region);
  };
  canvas.addEventListener('pointermove', surMouvement);
  canvas.addEventListener('pointerdown', surBas);
  canvas.addEventListener('pointerup', surHaut);

  const image = () => { boucle = requestAnimationFrame(image); controls.update(); renderer.render(scene, camera); };
  image();

  return {
    choisir(id) { choisie = id; peindre(); },
    majFiltres(ids) { marqueurs.forEach((m) => { m.visible = ids.includes(m.userData.localite); }); },
    recentrer() { depart(); },
    detruire() {
      cancelAnimationFrame(boucle);
      obs.disconnect();
      controls.dispose();
      scene.traverse((x) => { if (x.geometry) x.geometry.dispose(); if (x.material) x.material.dispose(); });
      renderer.dispose();
      canvas.remove();
    },
  };
}
