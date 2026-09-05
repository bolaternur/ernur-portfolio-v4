import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
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
let bootProgress = sessionStorage.getItem('ernur-v5-seen') ? .58 : .04;

function setBoot(value, phase) {
  bootProgress = THREE.MathUtils.clamp(Math.max(bootProgress, value), 0, 1);
  if (bootTrack) bootTrack.style.transform = `scaleX(${bootProgress})`;
  if (bootValue) bootValue.textContent = String(Math.round(bootProgress * 100)).padStart(2, '0');
  if (phase && bootPhase) bootPhase.textContent = phase;
}

function finishBoot() {
  setBoot(1, 'scene ready');
  sessionStorage.setItem('ernur-v5-seen', '1');
  window.setTimeout(() => boot?.classList.add('is-hidden'), 180);
}

setBoot(bootProgress, sessionStorage.getItem('ernur-v5-seen') ? 'route' : 'initializing');

/* ------------------------------------------------------------
   GLOBAL PAGE TRANSITIONS
------------------------------------------------------------ */
const routeLayer = document.querySelector('.route-transition');
const routeName = document.querySelector('.route-transition__name');

function transitionTo(url, label = 'next') {
  if (!routeLayer || !gsap || reducedMotion) {
    window.location.href = url;
    return;
  }
  document.body.classList.add('is-transitioning');
  if (routeName) routeName.textContent = label;
  sessionStorage.setItem('ernur-v5-route', label);
  gsap.set(routeLayer, { visibility: 'visible' });
  gsap.to(routeLayer, {
    yPercent: -101,
    duration: 0,
    onComplete: () => {
      gsap.set(routeLayer, { yPercent: 101 });
      gsap.to(routeLayer, {
        yPercent: 0,
        duration: .72,
        ease: 'power4.inOut',
        onComplete: () => { window.location.href = url; }
      });
    }
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
    gsap.fromTo(menuPanel.querySelectorAll('.menu-panel__links a'), { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: .045, delay: .24, duration: .55, ease: 'power3.out' });
  } else {
    gsap.to(menuPanel, { yPercent: -101, duration: .7, ease: 'power4.inOut', onComplete: () => menuPanel.classList.remove('is-open') });
  }
}

menuButton?.addEventListener('click', () => setMenu(!menuOpen));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menuOpen) setMenu(false); });

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

function fallbackObject(stage, dark = false) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: dark ? 0x55564f : 0x8d8c86, metalness: .7, roughness: .34, wireframe: true });
  const a = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.2, 2.4), mat);
  const b = new THREE.Mesh(new THREE.TorusGeometry(1.35, .14, 12, 64), mat.clone());
  b.rotation.x = Math.PI / 2;
  b.position.y = -.85;
  group.add(a, b);
  stage.scene.add(group);
  return group;
}

const gltfLoader = new THREE.GLTFLoader?.() || null;
