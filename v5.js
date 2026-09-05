import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.26/+esm';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = window.matchMedia('(max-width: 900px)').matches;
const saveData = navigator.connection?.saveData === true;
const base = document.body?.dataset?.base || './';
const asset = (path) => `${base}${path}`;

/* ------------------------------------------------------------
   ONE MOTION CLOCK: Lenis + GSAP + ScrollTrigger
------------------------------------------------------------ */
let lenis = null;
if (!reducedMotion && gsap) {
  lenis = new Lenis({ duration: 1.04, smoothWheel: true, wheelMultiplier: .94, touchMultiplier: 1 });
  lenis.on('scroll', () => ScrollTrigger?.update());
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ------------------------------------------------------------
   FIRST-VISIT PRELOADER
------------------------------------------------------------ */
const boot = document.querySelector('.boot');
const bootTrack = document.querySelector('.boot__track span');
const bootValue = document.querySelector('.boot__value');
const bootPhase = document.querySelector('.boot__phase');
const hasSeenSite = sessionStorage.getItem('ernur-v5-seen') === '1';
let bootProgress = hasSeenSite ? .58 : .04;

function setBoot(value, phase) {
  bootProgress = THREE.MathUtils.clamp(Math.max(bootProgress, value), 0, 1);
  if (bootTrack) bootTrack.style.transform = `scaleX(${bootProgress})`;
  if (bootValue) bootValue.textContent = String(Math.round(bootProgress * 100)).padStart(2, '0');
  if (phase && bootPhase) bootPhase.textContent = phase;
}

function hideBoot() {
  setBoot(1, 'scene ready');
  sessionStorage.setItem('ernur-v5-seen', '1');
  window.setTimeout(() => boot?.classList.add('is-hidden'), 180);
}

setBoot(bootProgress, hasSeenSite ? 'route' : 'initializing');

/* ------------------------------------------------------------
   GLOBAL PAGE TRANSITIONS
------------------------------------------------------------ */
const routeLayer = document.querySelector('.route-transition');
const routeName = document.querySelector('.route-transition__name');
const incomingRoute = sessionStorage.getItem('ernur-v5-route');
if (incomingRoute && routeLayer && gsap && !reducedMotion) {
  if (routeName) routeName.textContent = incomingRoute;
  gsap.set(routeLayer, { yPercent: 0, visibility: 'visible' });
}

function transitionTo(url, label = 'next') {
  if (!routeLayer || !gsap || reducedMotion) {
    window.location.href = url;
    return;
  }
  document.body.classList.add('is-transitioning');
  if (routeName) routeName.textContent = label;
  sessionStorage.setItem('ernur-v5-route', label);
  gsap.set(routeLayer, { yPercent: 101, visibility: 'visible' });
  gsap.to(routeLayer, {
    yPercent: 0,
    duration: .74,
    ease: 'power4.inOut',
    onComplete: () => { window.location.href = url; }
  });
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link || link.target === '_blank' || link.hasAttribute('download') || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  if (url.pathname === window.location.pathname && url.hash) return;
  event.preventDefault();
  transitionTo(url.href, link.dataset.transitionTitle || link.textContent.trim() || 'next');
});

/* ------------------------------------------------------------
   FULL-SCREEN MENU
------------------------------------------------------------ */
const menuButton = document.querySelector('[data-menu-button]');
const menuPanel = document.querySelector('.menu-panel');
let menuOpen = false;

function setMenu(open) {
  if (!menuPanel || !menuButton) return;
  menuOpen = open;
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('is-menu-open', open);
  if (!gsap || reducedMotion) {
    menuPanel.classList.toggle('is-open', open);
    menuPanel.style.transform = open ? 'translateY(0)' : 'translateY(-101%)';
    return;
  }
  if (open) {
    menuPanel.classList.add('is-open');
    gsap.fromTo(menuPanel, { yPercent: -101 }, { yPercent: 0, duration: .78, ease: 'power4.inOut' });
    gsap.fromTo(menuPanel.querySelectorAll('.menu-panel__links a'), { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: .045, delay: .22, duration: .58, ease: 'power3.out' });
  } else {
    gsap.to(menuPanel, { yPercent: -101, duration: .7, ease: 'power4.inOut', onComplete: () => menuPanel.classList.remove('is-open') });
  }
}

menuButton?.addEventListener('click', () => setMenu(!menuOpen));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuOpen) setMenu(false);
});

/* ------------------------------------------------------------
   TEXT / SECTION REVEALS
------------------------------------------------------------ */
function setupReveals() {
  if (!gsap || reducedMotion) return;

  document.querySelectorAll('.reveal-mask > span').forEach((line) => {
    gsap.from(line, {
      yPercent: 110,
      duration: 1.05,
      ease: 'power4.out',
      scrollTrigger: { trigger: line, start: 'top 92%', once: true }
    });
  });

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: .9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const children = group.querySelectorAll(':scope > *');
    gsap.from(children, {
      y: 24,
      opacity: 0,
      stagger: .055,
      duration: .8,
      ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 86%', once: true }
    });
  });
}

function setupEntryMotion() {
  if (!gsap || reducedMotion) return;
  const heroTargets = document.querySelectorAll('.home-hero__copy > *, .page-hero h1, .page-hero__bottom > *, .page-hero__top > *');
  if (!heroTargets.length) return;
  gsap.from(heroTargets, { y: 28, opacity: 0, stagger: .055, duration: .95, ease: 'power3.out' });
}

/* ------------------------------------------------------------
   THREE.JS CORE
------------------------------------------------------------ */
function createStage(canvas, { dark = false, exposure = 1.02 } = {}) {
  if (!canvas) return null;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .01, 100000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.1 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;

  const hemi = new THREE.HemisphereLight(dark ? 0xf4f1ea : 0xffffff, dark ? 0x10100e : 0x7b7871, dark ? 2.0 : 1.65);
  const key = new THREE.DirectionalLight(0xffffff, dark ? 4.8 : 3.8);
  const fill = new THREE.DirectionalLight(dark ? 0xcbd2dc : 0xcac6bb, dark ? 1.9 : 1.25);
  const rim = new THREE.DirectionalLight(0xe69a7d, dark ? 1.15 : .55);
  key.position.set(4.5, 6.5, 5.5);
  fill.position.set(-5, 2, -4);
  rim.position.set(3, -2, -5);
  scene.add(hemi, key, fill, rim);

  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[0]?.isIntersecting ?? true; }, { rootMargin: '450px' }).observe(canvas);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const ticks = [];
  function frame(time) {
    requestAnimationFrame(frame);
    if (!visible) return;
    ticks.forEach((fn) => fn(time));
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return { scene, camera, renderer, onFrame: (fn) => ticks.push(fn) };
}

function cloneMaterials(root) {
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    obj.material = Array.isArray(obj.material) ? obj.material.map((m) => m.clone()) : obj.material.clone();
  });
}

function fitModel(root, camera, multiplier = 1.28) {
  root.updateMatrixWorld(true);
  const firstBox = new THREE.Box3().setFromObject(root);
  const center = firstBox.getCenter(new THREE.Vector3());
  root.position.sub(center);
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const max = Math.max(size.x, size.y, size.z) || 1;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (max / (2 * Math.tan(fov / 2))) * multiplier;
  camera.position.set(dist * .72, dist * .32, dist);
  camera.near = Math.max(.001, dist / 1000);
  camera.far = dist * 70;
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  return { max, dist, size };
}

function makeFallback(stage, dark = false) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: dark ? 0x5b5c56 : 0x8e8e88, metalness: .68, roughness: .33, wireframe: true });
  const a = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.25, 2.4), mat);
  const b = new THREE.Mesh(new THREE.TorusGeometry(1.35, .14, 12, 64), mat.clone());
  b.rotation.x = Math.PI / 2;
  b.position.y = -.95;
  group.add(a, b);
  stage.scene.add(group);
  return group;
}

const gltfLoader = new GLTFLoader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);
const MODEL_PATHS = {
  study: [
    asset('assets/models/study/3209-0001-0007.glb'),
    asset('assets/models/3209-0001-0007.glb')
  ],
  assembly: [asset('assets/models/fusion/Main Assembly.glb')],
  kicker: [asset('assets/models/fusion/kicker_insert.glb')],
  robot: [
    asset('assets/models/robot/DECODE Simple Bot.glb'),
    asset('assets/models/robot/DECODE Simple Bot(1).glb')
  ]
};

async function loadFirst(paths, onProgress) {
  let lastError = null;
  for (const path of paths) {
    try {
      return await gltfLoader.loadAsync(path, onProgress);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('No model path could be loaded.');
}

const pointer = { x: 0, y: 0 };
const pointerSmooth = { x: 0, y: 0 };
window.addEventListener('pointermove', (event) => {
  pointer.x = event.clientX / window.innerWidth * 2 - 1;
  pointer.y = event.clientY / window.innerHeight * 2 - 1;
}, { passive: true });

const modelPromises = new WeakMap();
function initModelCanvas(canvas) {
  if (!canvas) return Promise.resolve(null);
  if (modelPromises.has(canvas)) return modelPromises.get(canvas);

  const promise = (async () => {
    const key = canvas.dataset.model;
    const mode = canvas.dataset.mode || 'card';
    const dark = canvas.dataset.dark === 'true' || Boolean(canvas.closest('.model-stage--dark, .section--dark, .page-hero--dark'));
    const critical = canvas.dataset.preload === 'true';
    const paths = MODEL_PATHS[key];
    if (!paths) return null;

    const stage = createStage(canvas, { dark, exposure: dark ? 1.05 : 1.0 });
    let root;
    let fit;

    try {
      const gltf = await loadFirst(paths, (event) => {
        if (critical && event.total) setBoot(.18 + .68 * (event.loaded / event.total), `loading ${key}`);
      });
      root = gltf.scene;
      cloneMaterials(root);
      stage.scene.add(root);
      fit = fitModel(root, stage.camera, mobile ? 1.62 : (mode === 'hero' ? 1.2 : 1.3));
      canvas.dataset.loaded = 'true';
    } catch (error) {
      console.warn(`Model ${key} unavailable`, error);
      root = makeFallback(stage, dark);
      fit = fitModel(root, stage.camera, mobile ? 1.62 : 1.28);
    }

    if (mode === 'hero') {
      root.rotation.set(-.08, -.62, .025);
      root.position.x = mobile ? 0 : fit.max * .12;
      const startCamera = stage.camera.position.clone();
      const heroCurve = new THREE.CatmullRomCurve3([
        startCamera.clone(),
        new THREE.Vector3(startCamera.x * .94, startCamera.y * 1.04, startCamera.z * .98),
        new THREE.Vector3(startCamera.x * .78, startCamera.y * .86, startCamera.z * .94),
        new THREE.Vector3(startCamera.x * .61, startCamera.y * .68, startCamera.z * .90)
      ], false, 'catmullrom', .5);
      stage.onFrame(() => {
        if (reducedMotion) return;
        pointerSmooth.x += (pointer.x - pointerSmooth.x) * .025;
        pointerSmooth.y += (pointer.y - pointerSmooth.y) * .025;
        root.rotation.y += ((-.62 + pointerSmooth.x * .07) - root.rotation.y) * .03;
        root.rotation.x += ((-.08 + pointerSmooth.y * .03) - root.rotation.x) * .03;
      });
      const hero = canvas.closest('.home-hero');
      if (hero && ScrollTrigger && !reducedMotion) {
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate(self) {
            const p = self.progress;
            const point = heroCurve.getPoint(THREE.MathUtils.clamp(p, 0, 1));
            stage.camera.position.copy(point);
            stage.camera.lookAt(0, 0, 0);
            root.rotation.y = -.62 + p * .72;
            root.rotation.x = -.08 - p * .05;
            root.position.x = (mobile ? 0 : fit.max * .12) + p * fit.max * .05;
            root.position.y = p * fit.max * .018;
            root.scale.setScalar(1 + p * .045);
            gsap?.set('.home-hero__copy', { y: -p * 70, opacity: 1 - p * .92 });
          }
        });
      }
    } else if (mode === 'inspection') {
      root.rotation.set(-.05, -1.0, 0);
      const stageEl = canvas.closest('.model-stage');
      const stateLabel = stageEl?.querySelector('[data-model-state]');
      const rail = stageEl?.querySelector('.model-stage__rail span');
      if (stageEl && ScrollTrigger && !reducedMotion) {
        ScrollTrigger.create({
          trigger: stageEl,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate(self) {
            const p = self.progress;
            if (rail) rail.style.transform = `scaleX(${p})`;
            if (p < .34) {
              if (stateLabel) stateLabel.textContent = 'perspective';
              root.rotation.y = -1.0 + p * 2.15;
              root.rotation.x = -.05 + p * .11;
              stage.camera.fov = 30 - p * 11;
            } else if (p < .7) {
              if (stateLabel) stateLabel.textContent = 'profile';
              root.rotation.y = -.27 + (p - .34) * 2.25;
              root.rotation.x = 0;
              stage.camera.fov = 25 - (p - .34) * 12;
            } else {
              if (stateLabel) stateLabel.textContent = 'near orthographic';
              root.rotation.y = .54 + (p - .7) * .6;
              root.rotation.x = 0;
              stage.camera.fov = 20 - (p - .7) * 10;
            }
            stage.camera.fov = THREE.MathUtils.clamp(stage.camera.fov, 13, 30);
            stage.camera.updateProjectionMatrix();
          }
        });
      }
    } else {
      const baseY = key === 'kicker' ? -.55 : -.75;
      root.rotation.set(-.12, baseY, 0);
      stage.onFrame((time) => {
        if (reducedMotion) return;
        const t = time * .00008;
        root.rotation.y = baseY + Math.sin(t) * .2;
        root.rotation.x = -.12 + pointerSmooth.y * .02;
      });
    }

    return { stage, root, fit };
  })();

  modelPromises.set(canvas, promise);
  return promise;
}

function lazyInitModelCanvases() {
  const canvases = [...document.querySelectorAll('canvas[data-model]')];
  canvases.filter((canvas) => canvas.dataset.preload !== 'true').forEach((canvas) => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        initModelCanvas(canvas);
        observer.disconnect();
      }
    }, { rootMargin: '900px' });
    observer.observe(canvas);
  });
}

/* ------------------------------------------------------------
   DECODE: PRESERVED INSPECT → SEPARATE → UNDERSTAND → REBUILD
------------------------------------------------------------ */
function setupDecodeRobot() {
  const canvas = document.getElementById('robot-canvas');
  const robotSection = canvas?.closest('.robot');
  if (!canvas || !robotSection) return Promise.resolve(null);

  const stage = createStage(canvas, { dark: true, exposure: 1.06 });
  const fallback = robotSection.querySelector('.robot-fallback');
  const steps = [...robotSection.querySelectorAll('.robot-step')];
  const phase = robotSection.querySelector('.robot__phase');
  const progress = robotSection.querySelector('.robot__progress span');
  const parts = [...robotSection.querySelectorAll('.part')];
  const preload = document.body.dataset.robotPreload === 'true';

  let robotRoot = null;
  let explodeData = null;
  let loadingPromise = null;

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

  function loadRobot() {
    if (loadingPromise) return loadingPromise;
    loadingPromise = (async () => {
      try {
        const gltf = await loadFirst(MODEL_PATHS.robot, (event) => {
          if (preload && event.total) setBoot(.18 + .68 * (event.loaded / event.total), 'loading robot');
        });
        robotRoot = gltf.scene;
        cloneMaterials(robotRoot);
        stage.scene.add(robotRoot);
        fitModel(robotRoot, stage.camera, mobile ? 1.72 : 1.31);
        robotRoot.rotation.y = -.45;
        robotRoot.rotation.x = -.05;
        explodeData = prepareExplosion(robotRoot);
        fallback?.classList.add('is-hidden');
        return robotRoot;
      } catch (error) {
        console.warn('DECODE robot unavailable', error);
        robotRoot = makeFallback(stage, true);
        fitModel(robotRoot, stage.camera, mobile ? 1.72 : 1.31);
        return robotRoot;
      }
    })();
    return loadingPromise;
  }

  function setStep(index, label) {
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    if (phase) phase.textContent = label;
  }

  function updateRobot(p) {
    if (progress) progress.style.transform = `scaleX(${p})`;
    let explode = 0;
    if (p < .20) {
      setStep(0, 'inspect');
      if (robotRoot) robotRoot.rotation.y = -.45 + p * 1.4;
    } else if (p < .56) {
      setStep(1, 'separate');
      explode = THREE.MathUtils.smoothstep(p, .20, .56);
    } else if (p < .76) {
      setStep(2, 'understand');
      explode = 1;
    } else {
      setStep(3, 'rebuild');
      explode = 1 - THREE.MathUtils.smoothstep(p, .76, .98);
    }
    if (explodeData) setExplosion(explodeData, explode);
    const show = p > .47 && p < .80;
    parts.forEach((part, i) => part.classList.toggle('is-visible', show && p > (.49 + i * .03)));
  }

  if (ScrollTrigger) {
    ScrollTrigger.create({
      trigger: robotSection,
      start: 'top top',
      end: 'bottom bottom',
      scrub: reducedMotion ? false : true,
      onEnter: loadRobot,
      onUpdate: (self) => updateRobot(self.progress)
    });
  }

  if (!preload) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadRobot();
        observer.disconnect();
      }
    }, { rootMargin: '1300px' });
    observer.observe(robotSection);
  }

  return preload ? loadRobot() : Promise.resolve(null);
}

/* ------------------------------------------------------------
   SMALL INTERACTION DETAILS
------------------------------------------------------------ */
function setupTraceDemo() {
  const nodes = [...document.querySelectorAll('.trace-node')];
  nodes.forEach((node) => {
    node.addEventListener('mouseenter', () => {
      nodes.forEach((other) => { if (other !== node) other.style.opacity = '.28'; });
    });
    node.addEventListener('mouseleave', () => {
      nodes.forEach((other) => { other.style.opacity = '1'; });
    });
  });
}

function setupCubeInteraction() {
  const cube = document.querySelector('.cube');
  if (!cube || reducedMotion) return;
  const scene = cube.closest('.cube-scene');
  scene?.addEventListener('pointermove', (event) => {
    const rect = scene.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    cube.style.animation = 'none';
    cube.style.transform = `rotateX(${-18 - y * 22}deg) rotateY(${32 + x * 70}deg)`;
  });
  scene?.addEventListener('pointerleave', () => {
    cube.style.animation = '';
    cube.style.transform = '';
  });
}

/* ------------------------------------------------------------
   INIT
------------------------------------------------------------ */
async function init() {
  setBoot(hasSeenSite ? .62 : .08, 'fonts');
  try {
    await document.fonts?.ready;
  } catch (_) {}
  setBoot(hasSeenSite ? .72 : .14, 'interface');

  const criticalModels = [...document.querySelectorAll('canvas[data-model][data-preload="true"]')];
  const robotPromise = setupDecodeRobot();
  lazyInitModelCanvases();

  if (criticalModels.length) {
    await Promise.allSettled(criticalModels.map((canvas) => initModelCanvas(canvas)));
  }
  if (document.body.dataset.robotPreload === 'true') await robotPromise;

  setBoot(.92, 'motion');
  setupReveals();
  setupTraceDemo();
  setupCubeInteraction();
  ScrollTrigger?.refresh();

  if (incomingRoute && routeLayer && gsap && !reducedMotion) {
    hideBoot();
    window.setTimeout(() => {
      gsap.to(routeLayer, {
        yPercent: -101,
        duration: .74,
        ease: 'power4.inOut',
        onComplete: () => {
          routeLayer.style.visibility = 'hidden';
          sessionStorage.removeItem('ernur-v5-route');
          document.body.classList.remove('is-transitioning');
          setupEntryMotion();
        }
      });
    }, 240);
  } else {
    hideBoot();
    window.setTimeout(setupEntryMotion, 260);
  }

  if ('requestIdleCallback' in window && !saveData) {
    requestIdleCallback(() => {
      document.querySelectorAll('canvas[data-model]').forEach((canvas) => {
        if (canvas.dataset.preload !== 'true' && canvas.getBoundingClientRect().top < innerHeight * 2.5) initModelCanvas(canvas);
      });
    }, { timeout: 2400 });
  }
}

init();
import('./award.js').catch((error) => console.warn('Award layer unavailable', error));
