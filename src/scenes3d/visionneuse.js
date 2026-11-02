/* La vue 3D d'un objet du patrimoine : glisser pour tourner, molette ou pincement pour zoomer, flèches au clavier. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { reduit } from '../ui.js';
import { habiller } from './habillage.js';

export async function creerVisionneuse(cadre, url, titre) {
  const gltf = await new GLTFLoader().loadAsync(url);
  const canvas = document.createElement('canvas');
  canvas.className = 'objet-3d-canvas';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `${titre}, modèle 3D. Les flèches font tourner l'objet.`);
  const img = cadre.querySelector('img');
  if (img) img.hidden = true;
  cadre.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfff4dd, 0x6a4a2a, 2));
  const soleil = new THREE.DirectionalLight(0xfff0d8, 2.6);
  scene.add(soleil);

  const objet = gltf.scene;
  scene.add(objet);
  const boite = new THREE.Box3().setFromObject(objet);
  const centre = boite.getCenter(new THREE.Vector3());
  const rayon = boite.getSize(new THREE.Vector3()).length() / 2 || 1;
  const camera = new THREE.PerspectiveCamera(32, 1, rayon / 50, rayon * 30);
  const distance = rayon / Math.sin(THREE.MathUtils.degToRad(16)) * 1.05;
  camera.position.copy(centre).add(new THREE.Vector3(-0.42, 0.34, 0.84).normalize().multiplyScalar(distance));
  soleil.position.copy(centre).add(new THREE.Vector3(-1, 2, 1.5).multiplyScalar(rayon));
  soleil.target.position.copy(centre);
  scene.add(soleil.target);

  const controles = new OrbitControls(camera, canvas);
  controles.target.copy(centre);
  controles.enableDamping = !reduit();
  controles.minDistance = distance * 0.3;
  controles.maxDistance = distance * 2;
  controles.autoRotate = !reduit();
  controles.autoRotateSpeed = 1.1;
  controles.enablePan = false;
  const arreter = () => { controles.autoRotate = false; };
  canvas.addEventListener('pointerdown', arreter);
  function clavier(e) {
    const pas = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key];
    if (!pas) return;
    e.preventDefault();
    arreter();
    const s = new THREE.Spherical().setFromVector3(camera.position.clone().sub(centre));
    s.theta += pas[0];
    s.phi = THREE.MathUtils.clamp(s.phi + pas[1], 0.1, Math.PI - 0.1);
    camera.position.setFromSpherical(s).add(centre);
    camera.lookAt(centre);
  }
  canvas.addEventListener('keydown', clavier);

  function taille() {
    const t = cadre.clientWidth || 384;
    renderer.setSize(t, t, false);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  }
  taille();
  const obs = new ResizeObserver(taille);
  obs.observe(cadre);
  renderer.setAnimationLoop(() => { controles.update(); renderer.render(scene, camera); });
  canvas.focus({ preventScroll: true });

  return {
    habiller: (motif) => habiller(objet, motif),
    detruire() {
      renderer.setAnimationLoop(null);
      obs.disconnect();
      controles.dispose();
      objet.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map?.dispose(); m.dispose(); });
      });
      renderer.dispose();
    },
  };
}
