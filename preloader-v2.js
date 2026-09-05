(() => {
  const boot = document.querySelector('.boot');
  if (!boot) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const firstVisit = sessionStorage.getItem('ernur-v5-seen') !== '1';
  if (!firstVisit || reduced) return;

  const start = performance.now();
  const MIN_DURATION = 3100;
  const RELEASE_DURATION = 1050;
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
    <div class="boot-v2__index" aria-hidden="true"><strong>Code → system → machine.</strong>Loading the critical scene first. Secondary models stay deferred until they are needed.</div>
  `);

  const phase = boot.querySelector('.boot__phase');
  const stages = [...boot.querySelectorAll('[data-boot-stage]')];
  const schedule = [
    [180, 'boot', 'initializing'],
    [720, 'type', 'loading type'],
    [1320, 'geometry', 'resolving geometry'],
    [2050, 'motion', 'synchronizing motion'],
    [2720, 'ready', 'preparing scene']
  ];

  const activate = (key, label) => {
    stages.forEach((el) => el.classList.toggle('is-active', el.dataset.bootStage === key));
    if (phase) phase.textContent = label;
  };
  schedule.forEach(([delay, key, label]) => window.setTimeout(() => activate(key, label), delay));

  const observer = new MutationObserver(() => {
    if (!boot.classList.contains('is-hidden') || released) return;
    const elapsed = performance.now() - start;
    if (elapsed < MIN_DURATION) {
      hideRequested = true;
      boot.classList.remove('is-hidden');
    }
  });
  observer.observe(boot, { attributes: true, attributeFilter: ['class'] });

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

  window.setTimeout(() => {
    // Existing v5.js requests the hide when real fonts/model/motion are ready.
    // If a network/model failure prevents that signal, never trap the visitor.
    if (hideRequested) release();
    else window.setTimeout(release, 1400);
  }, MIN_DURATION);

  // Absolute fail-safe: the intro must never become a blocking screen.
  window.setTimeout(release, 5200);
})();
