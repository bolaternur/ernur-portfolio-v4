(() => {
  const boot = document.querySelector('.boot');
  if (!boot) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const firstVisit = sessionStorage.getItem('ernur-v5-seen') !== '1';
  if (!firstVisit || reduced) return;

  const start = performance.now();
  const MIN_DURATION = 3800;
  const RELEASE_DURATION = 1150;
  const FAILSAFE = 7000;
  let hideRequested = false;
  let released = false;

  document.documentElement.classList.add('preloader-v2-running');
  boot.classList.add('boot--cinematic');
  boot.insertAdjacentHTML('beforeend', `
    <div class="boot-v2__ring" aria-hidden="true"></div>
    <div class="boot-v2__cross" aria-hidden="true"></div>
    <div class="boot-v2__status" aria-hidden="true">
      <span data-boot-stage="boot" class="is-active">01 / boot</span>
      <span data-boot-stage="type">02 / type</span>
      <span data-boot-stage="geometry">03 / geometry</span>
      <span data-boot-stage="motion">04 / motion</span>
      <span data-boot-stage="ready">05 / ready</span>
    </div>
    <div class="boot-v2__corner" aria-hidden="true">system / build 005</div>
    <div class="boot-v2__index" aria-hidden="true"><strong>Code → system → machine.</strong>Loading the critical scene first. Secondary geometry stays deferred until the story reaches it.</div>
  `);

  const phase = boot.querySelector('.boot__phase');
  const stages = [...boot.querySelectorAll('[data-boot-stage]')];
  const schedule = [
    [180, 'boot', 'initializing'],
    [900, 'type', 'resolving type'],
    [1720, 'geometry', 'loading geometry'],
    [2600, 'motion', 'synchronizing motion'],
    [3380, 'ready', 'preparing scene']
  ];

  const activate = (key, label) => {
    stages.forEach((el) => el.classList.toggle('is-active', el.dataset.bootStage === key));
    if (phase) phase.textContent = label;
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

  // Never trap the visitor if a network/model failure behaves unexpectedly.
  window.setTimeout(release, FAILSAFE);
})();