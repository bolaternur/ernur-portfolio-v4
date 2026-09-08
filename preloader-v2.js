(() => {
  const boot = document.querySelector('.boot');
  if (!boot) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const firstVisit = sessionStorage.getItem('ernur-v5-seen') !== '1';
  if (!firstVisit || reduced) return;

  const start = performance.now();
  const MIN_DURATION = 4650;
  const RELEASE_DURATION = 1350;
  const FAILSAFE = 8500;
  let hideRequested = false;
  let released = false;

  document.documentElement.classList.add('preloader-v2-running');
  boot.classList.add('boot--cinematic', 'boot--v3');
  boot.insertAdjacentHTML('beforeend', `
    <div class="boot-v3__grid" aria-hidden="true"></div>
    <div class="boot-v3__orbit" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="boot-v3__cross" aria-hidden="true"></div>
    <div class="boot-v3__status" aria-hidden="true">
      <span data-boot-stage="boot" class="is-active">01 / boot</span>
      <span data-boot-stage="python">02 / python</span>
      <span data-boot-stage="cpp">03 / c++</span>
      <span data-boot-stage="java">04 / java</span>
      <span data-boot-stage="geometry">05 / geometry</span>
      <span data-boot-stage="motion">06 / motion</span>
      <span data-boot-stage="ready">07 / ready</span>
    </div>
    <div class="boot-v3__languages" aria-hidden="true">
      <span data-boot-lang="python">PY</span>
      <span data-boot-lang="cpp">C++</span>
      <span data-boot-lang="java">JAVA</span>
    </div>
    <div class="boot-v3__code" aria-hidden="true">
      <span>compile / portfolio</span>
      <strong data-boot-code>import ideas → build systems</strong>
      <em>RFMSH / ALMATY / 2026</em>
    </div>
    <div class="boot-v3__corner" aria-hidden="true">software × cad × robotics</div>
    <div class="boot-v3__shutters" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  `);

  const phase = boot.querySelector('.boot__phase');
  const stages = [...boot.querySelectorAll('[data-boot-stage]')];
  const langs = [...boot.querySelectorAll('[data-boot-lang]')];
  const code = boot.querySelector('[data-boot-code]');
  const codeByStage = {
    boot: 'initializing creative system',
    python: 'def idea(): build() → test()',
    cpp: 'while (problem) { solve(); }',
    java: 'class FutureEngineer { build(); }',
    geometry: 'loading named geometry / scene graph',
    motion: 'synchronizing scroll / camera / type',
    ready: 'scene ready / handoff to visitor'
  };
  const schedule = [
    [180, 'boot', 'initializing'],
    [850, 'python', 'compiling python'],
    [1450, 'cpp', 'compiling c++'],
    [2050, 'java', 'compiling java'],
    [2780, 'geometry', 'loading geometry'],
    [3550, 'motion', 'synchronizing motion'],
    [4250, 'ready', 'preparing scene']
  ];

  const activate = (key, label) => {
    stages.forEach((el) => el.classList.toggle('is-active', el.dataset.bootStage === key));
    langs.forEach((el) => el.classList.toggle('is-active', el.dataset.bootLang === key));
    if (phase) phase.textContent = label;
    if (code) {
      code.classList.remove('is-changing');
      requestAnimationFrame(() => {
        code.classList.add('is-changing');
        code.textContent = codeByStage[key] || label;
      });
    }
  };
  schedule.forEach(([delay, key, label]) => window.setTimeout(() => activate(key, label), delay));

  function release() {
    if (released) return;
    released = true;
    observer.disconnect();
    activate('ready', 'scene ready');
    boot.classList.remove('is-hidden');
    boot.classList.add('boot--release');
    window.setTimeout(() => {
      boot.classList.add('is-hidden');
      document.documentElement.classList.remove('preloader-v2-running');
    }, RELEASE_DURATION);
  }

  const observer = new MutationObserver(() => {
    if (!boot.classList.contains('is-hidden') || released) return;
    hideRequested = true;
    boot.classList.remove('is-hidden');
    const elapsed = performance.now() - start;
    if (elapsed >= MIN_DURATION) release();
  });
  observer.observe(boot, { attributes: true, attributeFilter: ['class'] });

  window.setTimeout(() => {
    if (hideRequested) release();
  }, MIN_DURATION);

  // Never trap the visitor if the network or a model fails unexpectedly.
  window.setTimeout(release, FAILSAFE);
})();