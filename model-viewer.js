/** Progressive enhancement: no WebGL code or model is downloaded before a click. */
const MODELS = {
  robot: { name: "DECODE Simple Bot", yaw: -0.45, pitch: -1.05 },
  study: { name: "3209 Mechanical Study", yaw: -0.55, pitch: -1.05 },
  assembly: { name: "Main Assembly", yaw: -0.6, pitch: 0.62 },
  kicker: { name: "Kicker Insert", yaw: -0.7, pitch: 0.55 },
};
const controllers = new Map();
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let libraryPromise;

function libraries() {
  libraryPromise ||= import("./assets/vendor/three-viewer.js").catch(
    (error) => {
      libraryPromise = null;
      throw error;
    },
  );
  return libraryPromise;
}

function disposeObject(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  root?.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of [object.material].flat().filter(Boolean)) {
      materials.add(material);
      Object.values(material).forEach((value) => {
        if (value?.isTexture) textures.add(value);
      });
    }
  });
  textures.forEach((texture) => {
    texture.source?.data?.close?.();
    texture.dispose();
  });
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

async function download(url, signal, onProgress) {
  const response = await fetch(url, { signal });
  if (!response.ok)
    throw new Error(`Model request failed (${response.status}).`);
  const total = Number(response.headers.get("Content-Length"));
  if (!response.body || !total) return response.arrayBuffer();
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    onProgress(Math.min(100, Math.round((received / total) * 100)));
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  chunks.forEach((chunk) => {
    bytes.set(chunk, offset);
    offset += chunk.length;
  });
  return bytes.buffer;
}

function prepareStage(THREE, canvas, model, options) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
  const orbit = new THREE.Group();
  const modelCenter = new THREE.Group();
  modelCenter.add(model);
  orbit.add(modelCenter);
  scene.add(orbit);

  // One normalized model space keeps very large CAD exports and small parts equally usable.
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const longest = Math.max(size.x, size.y, size.z) || 1;
  model.position.sub(center);
  modelCenter.scale.setScalar(2 / longest);

  const environment = new THREE.RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentTarget = pmrem.fromScene(environment, 0.04);
  scene.environment = environmentTarget.texture;
  environment.dispose();
  pmrem.dispose();

  const oldMaterials = new Set();
  const finish = new THREE.MeshStandardMaterial({
    color: 0x919aa8,
    metalness: 0.9,
    roughness: 0.24,
    envMapIntensity: 0.72,
  });
  model.traverse((mesh) => {
    if (!mesh.isMesh) return;
    [mesh.material]
      .flat()
      .filter(Boolean)
      .forEach((material) => oldMaterials.add(material));
    mesh.material = finish;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  });
  const oldTextures = new Set();
  oldMaterials.forEach((material) => {
    Object.values(material).forEach((value) => {
      if (value?.isTexture) oldTextures.add(value);
    });
    material.dispose();
  });
  oldTextures.forEach((texture) => {
    texture.source?.data?.close?.();
    texture.dispose();
  });

  const hemisphere = new THREE.HemisphereLight(0xeef3ff, 0x222329, 0.6);
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 5, 4);
  const fill = new THREE.DirectionalLight(0xb5caff, 1.1);
  fill.position.set(-4, 1, 2);
  const rim = new THREE.DirectionalLight(0xcab7ff, 2.1);
  rim.position.set(1, 3, -4);
  scene.add(hemisphere, key, fill, rim);

  // Keep mesh-local displacements so nested CAD assemblies rebuild exactly.
  orbit.updateMatrixWorld(true);
  const partBounds = new THREE.Box3();
  const partCenter = new THREE.Vector3();
  const origin = new THREE.Vector3();
  const parts = [];
  model.traverse((mesh) => {
    if (!mesh.isMesh || !mesh.parent) return;
    partBounds.setFromObject(mesh).getCenter(partCenter);
    const direction = partCenter.clone();
    if (direction.lengthSq() < 0.0001)
      direction.set((parts.length % 3) - 1, 0.5, 0.6);
    direction.normalize().multiplyScalar(0.45);
    // Convert a world-space offset into this mesh's parent coordinate system.
    origin.set(0, 0, 0);
    mesh.parent.worldToLocal(origin);
    mesh.parent.worldToLocal(direction);
    direction.sub(origin);
    parts.push({ mesh, position: mesh.position.clone(), offset: direction });
  });

  let zoom = 1;
  let explosion = 0;
  let targetExplosion = 0;
  let spinning = false;
  let visible = true;
  let disposed = false;
  let frameId = 0;
  let lastTime = 0;
  let distance = 5;

  function fit() {
    const { width, height } = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
    camera.aspect = Math.max(width, 1) / Math.max(height, 1);
    const vertical = THREE.MathUtils.degToRad(camera.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
    const sphereRadius = size.length() / longest;
    distance =
      (sphereRadius / Math.sin(Math.min(vertical, horizontal) / 2)) * 1.09;
    updateCamera();
    requestRender();
  }

  function updateCamera() {
    camera.position.set(0, distance * 0.16 * zoom, distance * zoom);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  function applyExplosion(value) {
    parts.forEach(({ mesh, position, offset }) =>
      mesh.position.copy(position).addScaledVector(offset, value),
    );
  }

  function frame(time) {
    frameId = 0;
    if (disposed || !visible || document.hidden) {
      lastTime = 0;
      return;
    }
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    if (spinning && !motionPreference.matches) orbit.rotation.y += delta * 0.22;
    if (Math.abs(targetExplosion - explosion) > 0.001) {
      explosion = motionPreference.matches
        ? targetExplosion
        : explosion + (targetExplosion - explosion) * Math.min(1, delta * 8);
      if (Math.abs(targetExplosion - explosion) <= 0.001)
        explosion = targetExplosion;
      applyExplosion(explosion);
    }
    renderer.render(scene, camera);
    if (
      (spinning && !motionPreference.matches) ||
      explosion !== targetExplosion
    )
      requestRender();
    else lastTime = 0;
  }

  function requestRender() {
    if (!disposed && visible && !document.hidden && !frameId)
      frameId = requestAnimationFrame(frame);
  }

  function pause() {
    cancelAnimationFrame(frameId);
    frameId = 0;
    lastTime = 0;
  }

  function reset() {
    orbit.rotation.set(options.pitch, options.yaw, 0);
    zoom = 1;
    explosion = 0;
    targetExplosion = 0;
    spinning = false;
    applyExplosion(0);
    updateCamera();
    requestRender();
  }

  reset();
  const resizeObserver = new ResizeObserver(fit);
  resizeObserver.observe(canvas);
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestRender();
      else pause();
    },
    { threshold: 0 },
  );
  intersectionObserver.observe(canvas);
  const onVisibility = () => {
    if (document.hidden) pause();
    else requestRender();
  };
  const onMotion = () => {
    if (motionPreference.matches) {
      spinning = false;
      explosion = targetExplosion;
      applyExplosion(explosion);
      options.onRotate(false);
    }
    requestRender();
  };
  document.addEventListener("visibilitychange", onVisibility);
  motionPreference.addEventListener("change", onMotion);

  const input = new AbortController();
  const listenerOptions = { signal: input.signal };
  let pointer = null;
  canvas.style.touchAction = "pan-y";
  canvas.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      canvas.focus({ preventScroll: true });
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      spinning = false;
      options.onRotate(false);
    },
    listenerOptions,
  );
  canvas.addEventListener(
    "pointermove",
    (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      orbit.rotation.y += (event.clientX - pointer.x) * 0.008;
      orbit.rotation.x = THREE.MathUtils.clamp(
        orbit.rotation.x + (event.clientY - pointer.y) * 0.006,
        -1.25,
        1.25,
      );
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      requestRender();
    },
    listenerOptions,
  );
  const endPointer = () => {
    pointer = null;
  };
  canvas.addEventListener("pointerup", endPointer, listenerOptions);
  canvas.addEventListener("pointercancel", endPointer, listenerOptions);
  canvas.addEventListener("lostpointercapture", endPointer, listenerOptions);
  canvas.addEventListener(
    "wheel",
    (event) => {
      // Normal scrolling always belongs to the page. Zoom requires focus + Shift.
      if (document.activeElement !== canvas || !event.shiftKey) return;
      event.preventDefault();
      zoom = THREE.MathUtils.clamp(zoom + event.deltaY * 0.001, 0.7, 1.9);
      updateCamera();
      requestRender();
    },
    { passive: false, signal: input.signal },
  );
  canvas.addEventListener(
    "keydown",
    (event) => {
      const amount = event.shiftKey ? 0.2 : 0.1;
      if (event.key === "ArrowLeft") orbit.rotation.y -= amount;
      else if (event.key === "ArrowRight") orbit.rotation.y += amount;
      else if (event.key === "ArrowUp") orbit.rotation.x -= amount;
      else if (event.key === "ArrowDown") orbit.rotation.x += amount;
      else if (event.key === "+" || event.key === "=")
        zoom = Math.max(0.7, zoom - 0.1);
      else if (event.key === "-") zoom = Math.min(1.9, zoom + 0.1);
      else if (event.key === "Home") {
        reset();
        options.onReset();
      } else return;
      event.preventDefault();
      orbit.rotation.x = THREE.MathUtils.clamp(orbit.rotation.x, -1.25, 1.25);
      updateCamera();
      requestRender();
    },
    listenerOptions,
  );

  fit();
  return {
    rotate() {
      if (motionPreference.matches) {
        orbit.rotation.y += Math.PI / 6;
        spinning = false;
      } else spinning = !spinning;
      requestRender();
      return spinning;
    },
    explode() {
      targetExplosion = targetExplosion ? 0 : 1;
      requestRender();
      return Boolean(targetExplosion);
    },
    reset,
    dispose() {
      if (disposed) return;
      disposed = true;
      pause();
      input.abort();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motionPreference.removeEventListener("change", onMotion);
      environmentTarget.dispose();
      disposeObject(model);
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

function installViewer(element) {
  if (controllers.has(element)) return;
  const canvas = element.querySelector("canvas[data-model]");
  const trigger = element.querySelector("[data-load-model]");
  const status = element.querySelector("[data-model-status]");
  const model = MODELS[canvas?.dataset.model];
  if (!canvas || !trigger || !model) return;
  const actions = [...element.querySelectorAll("[data-model-action]")];
  const events = new AbortController();
  let request;
  let stage;
  let loading = false;
  let disposed = false;
  const initialText = trigger.textContent;
  const say = (text) => {
    if (status) status.textContent = text;
  };
  const setPressed = (action, pressed) =>
    actions
      .filter((button) => button.dataset.modelAction === action)
      .forEach((button) =>
        button.setAttribute("aria-pressed", String(pressed)),
      );
  const resetButtons = () => {
    setPressed("rotate", false);
    setPressed("explode", false);
  };
  actions.forEach((button) => {
    button.disabled = true;
  });
  canvas.hidden = true;
  canvas.tabIndex = 0;
  canvas.removeAttribute("aria-hidden");
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    `${model.name}, interactive 3D model. Drag or use arrow keys to rotate. Plus and minus to zoom. Home to reset. Shift and scroll to zoom when focused.`,
  );
  if (status) status.setAttribute("aria-live", "polite");
  element.dataset.modelState = "idle";

  async function load() {
    if (loading || stage || disposed) return;
    loading = true;
    trigger.disabled = true;
    element.dataset.modelState = "loading";
    element.setAttribute("aria-busy", "true");
    trigger.textContent = "Loading model…";
    say(`Preparing ${model.name}…`);
    request = new AbortController();
    const timeout = window.setTimeout(() => request?.abort(), 60000);
    let loadedModel;
    try {
      const THREE = await libraries();
      if (disposed) return;
      const url = new URL(
        `./assets/models/optimized/${canvas.dataset.model}.glb`,
        import.meta.url,
      );
      let lastMilestone = -1;
      const bytes = await download(url, request.signal, (percent) => {
        const milestone = Math.floor(percent / 20) * 20;
        if (milestone !== lastMilestone) {
          say(`Loading ${model.name}: ${milestone}%.`);
          lastMilestone = milestone;
        }
      });
      say("Preparing the interactive view…");
      const loader = new THREE.GLTFLoader();
      loader.setMeshoptDecoder(THREE.MeshoptDecoder);
      const gltf = await loader.parseAsync(bytes, new URL(".", url).href);
      loadedModel = gltf.scene;
      if (disposed) {
        disposeObject(loadedModel);
        return;
      }
      canvas.hidden = false;
      stage = prepareStage(THREE, canvas, loadedModel, {
        ...model,
        onRotate: (value) => setPressed("rotate", value),
        onReset: resetButtons,
      });
      element.dataset.modelState = "ready";
      element.classList.add("is-model-ready");
      element.classList.add("is-loaded");
      trigger.hidden = true;
      actions.forEach((button) => {
        button.disabled = false;
      });
      resetButtons();
      say("Model ready. Drag or use arrow keys to rotate. + / − to zoom.");
      canvas.focus({ preventScroll: true });
    } catch (error) {
      if (disposed) return;
      disposeObject(loadedModel);
      stage?.dispose();
      stage = null;
      canvas.hidden = true;
      element.dataset.modelState = "error";
      element.classList.remove("is-model-ready", "is-loaded");
      trigger.hidden = false;
      trigger.disabled = false;
      trigger.textContent = "Retry interactive model";
      say(
        error.name === "AbortError"
          ? "The model took too long to load. Check your connection and try again."
          : "The 3D view could not load. The project preview is still available; try again.",
      );
      console.warn(`Interactive model unavailable: ${model.name}`, error);
    } finally {
      clearTimeout(timeout);
      loading = false;
      element.removeAttribute("aria-busy");
    }
  }

  trigger.addEventListener("click", load, { signal: events.signal });
  actions.forEach((button) =>
    button.addEventListener(
      "click",
      () => {
        if (!stage) return;
        const action = button.dataset.modelAction;
        if (action === "rotate") {
          const spinning = stage.rotate();
          setPressed("rotate", spinning);
          say(
            motionPreference.matches
              ? "Model rotated by 30 degrees."
              : spinning
                ? "Rotation started. Select Rotate again to pause."
                : "Rotation paused.",
          );
        } else if (action === "explode") {
          const exploded = stage.explode();
          setPressed("explode", exploded);
          say(
            exploded
              ? "Assembly separated into its components."
              : "Assembly rebuilt.",
          );
        } else if (action === "reset") {
          stage.reset();
          resetButtons();
          say("View reset to its original position.");
        }
      },
      { signal: events.signal },
    ),
  );

  controllers.set(element, {
    dispose() {
      disposed = true;
      request?.abort();
      events.abort();
      stage?.dispose();
      canvas.hidden = true;
      trigger.hidden = false;
      trigger.disabled = false;
      trigger.textContent = initialText;
      element.classList.remove("is-model-ready", "is-loaded");
      element.dataset.modelState = "idle";
    },
  });
}

export function initializeModels(root = document) {
  root.querySelectorAll("[data-model-viewer]").forEach(installViewer);
}

export function disposeModels() {
  controllers.forEach((controller) => controller.dispose());
  controllers.clear();
}

initializeModels();
window.addEventListener("pagehide", (event) => {
  if (!event.persisted) disposeModels();
});
