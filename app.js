import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.26/+esm';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 900px)').matches;
const saveData = navigator.connection?.saveData === true;

/* ------------------------------------------------------------
   Smooth scroll — one timing system for DOM + WebGL
------------------------------------------------------------ */
let lenis = null;
if (!reducedMotion) {
  lenis = new Lenis({ duration: 1.05, wheelMultiplier: .92, smoothWheel: true });
  lenis.on('scroll', () => ScrollTrigger?.update());
  gsap?.ticker.add((time) => lenis.raf(time * 1000));
  gsap?.ticker.lagSmoothing(0);
}

/* ------------------------------------------------------------
   Loader
------------------------------------------------------------ */
const boot = document.querySelector('.boot');
const bootTrack = document.querySelector('.boot__track span');
const bootValue = document.querySelector('.boot__value');
function setBoot(v) {
  const p = THREE.MathUtils.clamp(v, 0, 1);
  if (bootTrack) bootTrack.style.transform = `scaleX(${p})`;
  if (bootValue) bootValue.textContent = String(Math.round(p * 100)).padStart(2, '0');
}
function hideBoot() {
  setBoot(1);
  setTimeout(() => boot?.classList.add('is-hidden'), 220);
}

/* ------------------------------------------------------------
   Three stage
------------------------------------------------------------ */
function createStage(canvas, { tone = 1.03, dark = false } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .01, 100000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.15 : 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = tone;

  const hemi = new THREE.HemisphereLight(dark ? 0xf5f1e8 : 0xffffff, dark ? 0x11110f : 0x77756e, dark ? 2.2 : 1.85);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, dark ? 4.6 : 3.9);
  key.position.set(4.5, 6.5, 5);
  scene.add(key);
  const fill = new THREE.DirectionalLight(dark ? 0xbfc7d2 : 0xd7d3c8, dark ? 2.1 : 1.35);
  fill.position.set(-5, 2, -4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xe2a488, dark ? 1.45 : .72);
  rim.position.set(3, -2, -4);
  scene.add(rim);

  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? true; }, { rootMargin: '500px' }).observe(canvas);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width), h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const ticks = [];
  function frame(t) {
    requestAnimationFrame(frame);
    if (!visible) return;
    ticks.forEach((fn) => fn(t));
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  return { scene, camera, renderer, lights: { key, fill, rim }, onFrame: (fn) => ticks.push(fn) };
}

function cloneMaterials(root) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
    o.frustumCulled = true;
  });
}

function fitModel(root, camera, multiplier = 1.3) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  root.position.sub(center);
  root.updateMatrixWorld(true);
  const normalized = new THREE.Box3().setFromObject(root);
  const size = normalized.getSize(new THREE.Vector3());
  const max = Math.max(size.x, size.y, size.z) || 1;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (max / (2 * Math.tan(fov / 2))) * multiplier;
  camera.position.set(dist * .72, dist * .34, dist);
  camera.near = Math.max(.001, dist / 1000);
  camera.far = dist * 60;
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  return { max, dist, size };
}

const loader = new GLTFLoader();
async function loadAny(paths, onProgress) {
  let lastError;
  for (const path of paths) {
    try {
      return await loader.loadAsync(path, onProgress);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('No model path resolved');
}

const STUDY_PATHS = [
  './assets/models/study/3209-0001-0007.glb',
  './assets/models/3209-0001-0007.glb',
  './3209-0001-0007.glb'
];
const ROBOT_PATHS = [
  './assets/models/robot/DECODE Simple Bot.glb',
  './assets/models/robot/DECODE Simple Bot(1).glb',
  './DECODE Simple Bot.glb',
  './DECODE Simple Bot(1).glb'
];

/* ------------------------------------------------------------
   Study model — HERO
------------------------------------------------------------ */
const studyCanvas = document.getElementById('study-canvas');
const studyStage = createStage(studyCanvas, { tone: 1.02, dark: false });
let studySource = null;
let studyHero = null;
let studyHeroFit = null;

const pointer = { x: 0, y: 0 };
const pointerSmooth = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  pointer.x = e.clientX / innerWidth * 2 - 1;
  pointer.y = e.clientY / innerHeight * 2 - 1;
}, { passive: true });

async function loadStudyHero() {
  try {
    const gltf = await loadAny(STUDY_PATHS, (e) => {
      if (e.total) setBoot(.08 + .68 * (e.loaded / e.total));
    });
    studySource = gltf.scene;
    studyHero = studySource.clone(true);
    cloneMaterials(studyHero);
    studyStage.scene.add(studyHero);
    studyHeroFit = fitModel(studyHero, studyStage.camera, mobile ? 1.58 : 1.22);
    studyHero.rotation.set(-.08, -.58, .025);
    studyHero.position.x = mobile ? 0 : studyHeroFit.max * .12;
    return true;
  } catch (error) {
    console.warn('Study GLB missing:', error);
    makeHeroFallback();
    return false;
  }
}

function makeHeroFallback() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x8f918d, metalness: .78, roughness: .28 });
  const core = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.2, 2.8), mat);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(5.5, .28, 1.65), mat.clone());
  rail.position.y = -.72;
  group.add(core, rail);
  studyStage.scene.add(group);
  studyHero = group;
  studyHeroFit = fitModel(group, studyStage.camera, mobile ? 1.6 : 1.25);
  group.rotation.y = -.55;
}

studyStage.onFrame(() => {
  if (!studyHero || reducedMotion) return;
  pointerSmooth.x += (pointer.x - pointerSmooth.x) * .03;
  pointerSmooth.y += (pointer.y - pointerSmooth.y) * .03;
  const targetY = -.58 + pointerSmooth.x * .08;
  const targetX = -.08 + pointerSmooth.y * .035;
  studyHero.rotation.y += (targetY - studyHero.rotation.y) * .035;
  studyHero.rotation.x += (targetX - studyHero.rotation.x) * .035;
});

/* ------------------------------------------------------------
   Robot — preserve V4/V1 inspect → explode → rebuild math
------------------------------------------------------------ */
const robotCanvas = document.getElementById('robot-canvas');
const robotStage = createStage(robotCanvas, { tone: 1.06, dark: true });
const robotFallback = document.getElementById('robot-fallback');
const robotSteps = [...document.querySelectorAll('.robot-step')];
const robotPhase = document.getElementById('robot-phase');
const robotProgress = document.querySelector('.robot__progress span');
const robotParts = [...document.querySelectorAll('.part')];
let robotRoot = null;
let explodeData = null;
let robotLoading = false;

function prepareExplosion(root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const centerWorld = box.getCenter(new THREE.Vector3());
  const center = root.worldToLocal(centerWorld.clone());
  const size = box.getSize(new THREE.Vector3());
  const max = Math.max(size.x, size.y, size.z);
  const items = [];
  let i = 0;
  root.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const posWorld = mesh.getWorldPosition(new THREE.Vector3());
    const posRoot = root.worldToLocal(posWorld.clone());
    let dir = posRoot.clone().sub(center);
    if (dir.lengthSq() < 1e-8) {
      const seed = (i * 9301 + (mesh.name || '').length * 49297) % 233280;
      const r = seed / 233280;
      dir.set(Math.sin(r * 12.7), .25 + ((i % 5) / 8), Math.cos(r * 9.1));
    }
    dir.normalize();
    items.push({ mesh, parent: mesh.parent, originRoot: posRoot.clone(), dir, distance: max * (.24 + (i % 7) * .015) });
    i++;
  });
  return { root, items };
}

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
function setExplosion(data, amount) {
  const root = data.root;
  root.updateMatrixWorld(true);
  data.items.forEach((item) => {
    tmpA.copy(item.originRoot).addScaledVector(item.dir, item.distance * amount);
    tmpB.copy(tmpA);
    root.localToWorld(tmpB);
    item.parent.worldToLocal(tmpB);
    item.mesh.position.copy(tmpB);
  });
  root.updateMatrixWorld(true);
}

async function loadRobot() {
  if (robotRoot || robotLoading) return;
  robotLoading = true;
  try {
    const gltf = await loadAny(ROBOT_PATHS);
    robotRoot = gltf.scene;
    cloneMaterials(robotRoot);
    robotStage.scene.add(robotRoot);
    fitModel(robotRoot, robotStage.camera, mobile ? 1.72 : 1.31);
    robotRoot.rotation.y = -.45;
    robotRoot.rotation.x = -.05;
    explodeData = prepareExplosion(robotRoot);
    robotFallback?.classList.add('is-hidden');
  } catch (error) {
    console.warn('Robot GLB missing:', error);
  } finally {
    robotLoading = false;
  }
}

function setRobotStep(index, label) {
  robotSteps.forEach((el, i) => el.classList.toggle('is-active', i === index));
  if (robotPhase) robotPhase.textContent = label;
}
function updateRobotScroll(p) {
  if (robotProgress) robotProgress.style.transform = `scaleX(${p})`;
  let explode = 0;
  if (p < .20) {
    setRobotStep(0, 'inspect');
    explode = 0;
    if (robotRoot) robotRoot.rotation.y = -.45 + p * 1.4;
  } else if (p < .56) {
    setRobotStep(1, 'separate');
    explode = THREE.MathUtils.smoothstep(p, .20, .56);
  } else if (p < .76) {
    setRobotStep(2, 'understand');
    explode = 1;
  } else {
    setRobotStep(3, 'rebuild');
    explode = 1 - THREE.MathUtils.smoothstep(p, .76, .98);
  }
  if (explodeData) setExplosion(explodeData, explode);
  const show = p > .47 && p < .80;
  robotParts.forEach((el, i) => el.classList.toggle('is-visible', show && p > (.49 + i * .03)));
}

new IntersectionObserver((entries, observer) => {
  if (entries.some((e) => e.isIntersecting)) {
    loadRobot();
    observer.disconnect();
  }
}, { rootMargin: '1300px' }).observe(document.getElementById('robot'));

/* ------------------------------------------------------------
   Study model — second, quieter inspection chapter
------------------------------------------------------------ */
const detailCanvas = document.getElementById('study-detail-canvas');
const detailStage = createStage(detailCanvas, { tone: 1.0, dark: false });
const studyState = document.getElementById('study-state');
const studyLine = document.querySelector('.study-stage__line span');
let detailRoot = null;
let detailFit = null;

function buildDetailScene() {
  if (!studySource || detailRoot) return;
  detailRoot = studySource.clone(true);
  cloneMaterials(detailRoot);
  detailStage.scene.add(detailRoot);
  detailFit = fitModel(detailRoot, detailStage.camera, mobile ? 1.62 : 1.18);
  detailRoot.rotation.set(-.06, -1.0, 0);
  detailRoot.scale.setScalar(.92);
}

/* ------------------------------------------------------------
   Motion language
------------------------------------------------------------ */
function reveal(selector, options = {}) {
  if (!gsap || reducedMotion) return;
  const el = document.querySelector(selector);
  if (!el) return;
  const targets = el.querySelectorAll(options.targets || 'h1,h2,h3,p,strong,article');
  gsap.from(targets, {
    y: options.y ?? 28,
    opacity: 0,
    stagger: options.stagger ?? .035,
    duration: options.duration ?? .95,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: options.start || 'top 78%', once: true }
  });
}

function setupMotion() {
  if (!gsap || !ScrollTrigger) return;

  if (!reducedMotion) {
    gsap.from('.hero__copy > *', { y: 34, opacity: 0, stagger: .08, duration: 1.15, delay: .24, ease: 'power3.out' });
    gsap.from('.hero__meta', { opacity: 0, y: 12, duration: .9, delay: .75, ease: 'power3.out' });

    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true,
      onUpdate(self) {
        const p = self.progress;
        if (studyHero && studyHeroFit) {
          studyHero.rotation.y = -.58 + p * .9;
          studyHero.rotation.x = -.08 - p * .06;
          studyHero.position.x = (mobile ? 0 : studyHeroFit.max * .12) + p * studyHeroFit.max * .07;
          studyHero.position.y = p * studyHeroFit.max * .025;
          studyHero.scale.setScalar(1 + p * .08);
        }
        gsap.set('.hero__copy', { y: -p * 82, opacity: 1 - p * .92 });
        gsap.set('.hero__meta', { opacity: 1 - p * 1.2 });
      }
    });

    reveal('#about', { targets: '.intro__statement,.intro__body p', stagger: .08 });
    reveal('#work', { targets: 'h2,.project-head__type,.project-head__lead,.project-head__specs>div', stagger: .055 });
    reveal('.study-copy', { targets: 'h2,.study-copy__grid p', stagger: .07 });
    reveal('.experience', { targets: 'h2,article', stagger: .07 });

    ScrollTrigger.create({
      trigger: '#robot', start: 'top top', end: 'bottom bottom', scrub: true,
      onEnter: loadRobot,
      onUpdate(self) { updateRobotScroll(self.progress); }
    });

    ScrollTrigger.create({
      trigger: '#study-stage', start: 'top top', end: 'bottom bottom', scrub: true,
      onEnter: buildDetailScene,
      onUpdate(self) {
        buildDetailScene();
        const p = self.progress;
        if (studyLine) studyLine.style.transform = `scaleX(${p})`;
        if (!detailRoot || !detailFit) return;

        if (p < .34) {
          studyState.textContent = 'perspective';
          detailRoot.rotation.y = -1.0 + p * 2.2;
          detailRoot.rotation.x = -.06 + p * .12;
          detailRoot.scale.setScalar(.92 + p * .18);
          detailStage.camera.fov = 30 - p * 12;
        } else if (p < .68) {
          studyState.textContent = 'profile';
          detailRoot.rotation.y = -.25 + (p - .34) * 2.4;
          detailRoot.rotation.x = -.01;
          detailRoot.scale.setScalar(1.0);
          detailStage.camera.fov = 25 - (p - .34) * 13;
        } else {
          studyState.textContent = 'orthographic';
          detailRoot.rotation.y = .58 + (p - .68) * .55;
          detailRoot.rotation.x = 0;
          detailRoot.scale.setScalar(1.0 - (p - .68) * .08);
          detailStage.camera.fov = 20 - (p - .68) * 8;
        }
        detailStage.camera.fov = THREE.MathUtils.clamp(detailStage.camera.fov, 13, 30);
        detailStage.camera.updateProjectionMatrix();
      }
    });

    gsap.from('.footer h2', { y: 80, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.footer', start: 'top 68%', once: true } });
  } else {
    ScrollTrigger.create({ trigger: '#robot', start: 'top top', end: 'bottom bottom', onEnter: loadRobot, onUpdate: (self) => updateRobotScroll(self.progress) });
    buildDetailScene();
  }
}

/* ------------------------------------------------------------
   Init
------------------------------------------------------------ */
async function init() {
  setBoot(.05);
  await loadStudyHero();
  setBoot(.82);
  buildDetailScene();
  setupMotion();
  ScrollTrigger?.refresh();
  setBoot(.96);
  setTimeout(hideBoot, 140);

  if ('requestIdleCallback' in window && !saveData) requestIdleCallback(() => loadRobot(), { timeout: 2200 });
}

init();
