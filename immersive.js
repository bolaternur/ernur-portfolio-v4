import { libraries } from './model-viewer.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const disposers = [];
const scenes = [];
let paused = reduced.matches;
const motionButton = document.createElement('button');
motionButton.className = 'motion-toggle';
motionButton.type = 'button';
motionButton.setAttribute('aria-pressed', String(paused));
motionButton.textContent = paused ? 'Motion · off' : 'Motion · on';
document.body.append(motionButton);
function setPaused(value) {
  paused = value;
  document.documentElement.classList.toggle('motion-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Motion · off' : 'Motion · on';
  scenes.forEach(scene => scene.request());
  window.dispatchEvent(new CustomEvent('portfolio-motion', { detail: { paused } }));
}
motionButton.addEventListener('click', () => setPaused(!paused));
reduced.addEventListener('change', () => setPaused(reduced.matches));
setPaused(paused);

async function createScene(host, type) {
  const T = await libraries();
  const canvas = document.createElement('canvas');
  canvas.className = 'motion-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(34, 1, .1, 100);
  camera.position.set(0, 0, type === 'cube' ? 9.3 : 9);
  const root = new T.Group();
  scene.add(root);
  scene.add(new T.HemisphereLight(0xf3f5e9, 0x252a2b, 2));
  const key = new T.DirectionalLight(0xffffff, 4);
  key.position.set(3, 5, 5);
  const rim = new T.DirectionalLight(0xd9f279, 3);
  rim.position.set(-4, -1, 1);
  scene.add(key, rim);
  const envScene = new T.RoomEnvironment();
  const pmrem = new T.PMREMGenerator(renderer);
  const env = pmrem.fromScene(envScene, .04);
  scene.environment = env.texture;
  envScene.dispose(); pmrem.dispose();
  const materials = [];
  const geometries = [];
  const mesh = (geometry, material, parent = root) => {
    geometries.push(geometry);
    const object = new T.Mesh(geometry, material);
    parent.add(object);
    return object;
  };
  const material = (color, metalness = .8, roughness = .23) => {
    const value = new T.MeshStandardMaterial({ color, metalness, roughness });
    materials.push(value); return value;
  };
  let tick;
  let twist = () => {};
  let pointerX = 0, pointerY = 0;
  let elapsed = 0, time = 0, frameId = 0, visible = false, dead = false;
  const events = new AbortController();
  const opts = { signal: events.signal };
  if (type === 'orbit') {
    const silver = material(0xc4ccc5);
    const acid = material(0xd9f279, .7, .28);
    const core = mesh(new T.SphereGeometry(.77, 40, 32), material(0x252c26, .94, .18));
    const rings = [1.35, 1.78, 2.12].map((radius, index) => {
      const ring = mesh(new T.TorusGeometry(radius, index === 1 ? .085 : .035, 12, 128), index === 1 ? acid : silver);
      ring.rotation.set(.6 + index * .8, index * .9, index * .35);
      return ring;
    });
    const satellite = mesh(new T.SphereGeometry(.105, 20, 16), acid);
    const points = [];
    for (let i = 0; i < 150; i++) {
      // Deterministic starfield; no animation-time allocations.
      const a = i * 2.399963;
      const r = 2.5 + ((i * 37) % 100) / 30;
      points.push(Math.cos(a) * r, Math.sin(a) * r, -1 - (i % 7));
    }
    const starGeometry = new T.BufferGeometry();
    starGeometry.setAttribute('position', new T.Float32BufferAttribute(points, 3));
    geometries.push(starGeometry);
    const starsMaterial = new T.PointsMaterial({ color: 0xd6dfc8, size: .022, transparent: true, opacity: .6 });
    materials.push(starsMaterial);
    const stars = new T.Points(starGeometry, starsMaterial); scene.add(stars);
    tick = (dt) => {
      elapsed += dt;
      rings.forEach((ring, i) => { ring.rotation.y += dt * (.12 + i * .06); ring.rotation.x += dt * .055 * (i % 2 ? -1 : 1); });
      satellite.position.set(Math.cos(elapsed * .35) * 2.12, Math.sin(elapsed * .35) * 1.3, Math.sin(elapsed * .35) * 1.65);
      root.rotation.y += (pointerX * .25 - root.rotation.y) * .045;
      root.rotation.x += (pointerY * .18 - root.rotation.x) * .045;
      root.position.y = Math.sin(elapsed * .5) * .11;
      core.rotation.y += dt * .08;
      const rect = host.closest('.hero').getBoundingClientRect();
      root.rotation.z = Math.max(0, -rect.top / innerHeight) * .35;
      stars.rotation.z = elapsed * .012;
    };
    host.closest('.hero').addEventListener('pointermove', e => {
      const rect = host.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) / rect.width - .5;
      pointerY = (e.clientY - rect.top) / rect.height - .5;
    }, { passive: true, ...opts });
  } else {
    camera.position.set(5.3, 4.3, 7.4); camera.lookAt(0, 0, 0);
    const dark = material(0x1c2520, .1, .45);
    const acid = material(0xd9f279, .08, .38);
    const ivory = material(0xf4f2e8, .05, .36);
    const grey = material(0x667666, .1, .42);
    const cubies = [];
    const geometry = new T.BoxGeometry(.92, .92, .92);
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const cube = mesh(geometry, [x === 1 ? acid : dark, x === -1 ? grey : dark, y === 1 ? ivory : dark, y === -1 ? acid : dark, z === 1 ? ivory : dark, z === -1 ? grey : dark]);
      cube.position.set(x * 1.02, y * 1.02, z * 1.02); cubies.push(cube);
    }
    const pivot = new T.Group(); root.add(pivot);
    let active = null, counter = 0, nextTwist = 1.2;
    function finish() {
      active.parts.forEach(part => {
        root.attach(part);
        ['x', 'y', 'z'].forEach(axis => { part.position[axis] = Math.round(part.position[axis] / 1.02) * 1.02; });
        part.quaternion.normalize();
      });
      pivot.rotation.set(0, 0, 0); active = null;
      host.dataset.twists = String(counter);
    }
    twist = () => {
      if (active) {
        if (paused || reduced.matches) { pivot.rotation[active.axis] = Math.PI / 2; finish(); request(); }
        return;
      }
      const axis = ['y', 'x', 'z'][counter++ % 3];
      const parts = cubies.filter(cube => cube.position[axis] > .7);
      parts.forEach(part => pivot.attach(part));
      active = { axis, parts, progress: 0 };
      if (paused || reduced.matches) { pivot.rotation[axis] = Math.PI / 2; finish(); }
      request();
      const status = host.closest('.lab-cube-panel')?.querySelector('[data-cube-status]');
      if (status) status.textContent = `Layer turned. ${counter} moves.`;
    };
    host.parentElement.querySelector('[data-cube-turn]')?.addEventListener('click', twist, opts);
    host.addEventListener('pointermove', e => {
      const rect = host.getBoundingClientRect();
      pointerX = (e.clientX - rect.left) / rect.width - .5;
      pointerY = (e.clientY - rect.top) / rect.height - .5;
    }, { passive: true, ...opts });
    tick = dt => {
      elapsed += dt;
      if (!active && elapsed > nextTwist) { nextTwist = elapsed + 3.3; twist(); }
      if (active) {
        active.progress = Math.min(1, active.progress + dt / .95);
        const p = active.progress;
        pivot.rotation[active.axis] = (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2) * Math.PI / 2;
        if (p >= 1) finish();
      }
      root.rotation.y += (.3 + Math.sin(elapsed * .25) * .32 + pointerX * .5 - root.rotation.y) * .055;
      root.rotation.x += (pointerY * .2 - root.rotation.x) * .055;
      root.position.y = Math.sin(elapsed * .6) * .07;
    };
  }
  function render(now) {
    frameId = 0;
    if (dead || !visible || document.hidden) { time = 0; return; }
    const dt = !paused && !reduced.matches && time ? Math.min((now - time) / 1000, .05) : 0;
    time = now;
    if (!paused && !reduced.matches) tick(dt);
    renderer.render(scene, camera);
    host.dataset.motionState = paused || reduced.matches ? 'paused' : 'playing';
    if (!paused && !reduced.matches) request();
  }
  function request() { if (!frameId && !dead && visible && !document.hidden) frameId = requestAnimationFrame(render); }
  function stop() { cancelAnimationFrame(frameId); frameId = 0; time = 0; }
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix(); request();
  });
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) request(); else stop(); });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : request(), opts);
  host.append(canvas); host.classList.add('has-motion-scene');
  if (type === 'cube') host.parentElement.classList.add('has-cube-scene');
  resize.observe(host); observer.observe(host);
  scenes.push({ request });
  disposers.push(() => {
    dead = true; stop(); resize.disconnect(); observer.disconnect(); events.abort();
    new Set(geometries).forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
    env.dispose(); renderer.dispose(); renderer.forceContextLoss();
  });
}

const lazy = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  lazy.unobserve(entry.target);
  createScene(entry.target, entry.target.dataset.motionScene).catch(error => {
    entry.target.dataset.motionState = 'unavailable';
    console.warn('Motion preview remains available.', error);
  });
}), { rootMargin: '160px' });
document.querySelectorAll('[data-motion-scene]').forEach(host => lazy.observe(host));

if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.project-art').forEach(art => {
    art.addEventListener('pointermove', e => {
      if (paused || reduced.matches) return;
      const rect = art.getBoundingClientRect();
      art.style.setProperty('--tilt-x', `${-(e.clientY - rect.top - rect.height / 2) / rect.height * 7}deg`);
      art.style.setProperty('--tilt-y', `${(e.clientX - rect.left - rect.width / 2) / rect.width * 9}deg`);
    }, { passive: true });
    art.addEventListener('pointerleave', () => { art.style.setProperty('--tilt-x', '0deg'); art.style.setProperty('--tilt-y', '0deg'); });
  });
}
window.addEventListener('pagehide', event => { if (!event.persisted) { lazy.disconnect(); disposers.forEach(dispose => dispose()); } });
