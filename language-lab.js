(() => {
  const data = {
    python: {
      index: '01 / language',
      name: 'Python',
      ghost: 'PY',
      desc: 'My fastest way to turn an idea into a working tool — from problem solving and automation to experiments and project logic.',
      code: '<b>def</b> build(idea):<br>&nbsp;&nbsp;prototype = test(idea)<br>&nbsp;&nbsp;<b>return</b> improve(prototype)'
    },
    cpp: {
      index: '02 / language',
      name: 'C++',
      ghost: 'C++',
      desc: 'Where I focus on algorithms, performance and disciplined problem solving — especially when the logic itself is the challenge.',
      code: '<b>for</b> (auto &problem : problems) {<br>&nbsp;&nbsp;solve(problem);<br>&nbsp;&nbsp;optimize();<br>}'
    },
    java: {
      index: '03 / language',
      name: 'Java',
      ghost: 'JAVA',
      desc: 'Structured, object-oriented programming and a language I use while developing my computer-science foundation for AP Computer Science A.',
      code: '<b>class</b> Idea {<br>&nbsp;&nbsp;void build() { test(); improve(); }<br>}'
    }
  };

  const section = document.querySelector('.language-lab');
  if (!section) return;
  const stage = section.querySelector('.language-stage');
  const name = section.querySelector('[data-language-name]');
  const desc = section.querySelector('[data-language-desc]');
  const index = section.querySelector('[data-language-index]');
  const ghost = section.querySelector('[data-language-ghost]');
  const code = section.querySelector('[data-language-code]');
  const nodes = [...section.querySelectorAll('[data-language]')];
  const heroTokens = [...document.querySelectorAll('[data-lang-target]')];
  let active = 'python';

  function setLanguage(key, animate = true) {
    const next = data[key];
    if (!next) return;
    active = key;
    nodes.forEach((node) => node.classList.toggle('is-active', node.dataset.language === key));
    stage.dataset.active = key;

    const apply = () => {
      index.textContent = next.index;
      name.textContent = next.name;
      desc.textContent = next.desc;
      ghost.textContent = next.ghost;
      code.innerHTML = next.code;
    };

    if (animate && window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const targets = [name, desc, index, code];
      window.gsap.to(targets, {
        y: -8,
        opacity: 0,
        duration: .18,
        ease: 'power2.in',
        onComplete: () => {
          apply();
          window.gsap.fromTo(targets, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .48, stagger: .035, ease: 'power3.out' });
          window.gsap.fromTo(ghost, { scale: .94, opacity: .01 }, { scale: 1, opacity: 1, duration: .75, ease: 'power3.out' });
        }
      });
    } else apply();
  }

  nodes.forEach((node) => {
    const key = node.dataset.language;
    node.addEventListener('mouseenter', () => setLanguage(key));
    node.addEventListener('focus', () => setLanguage(key));
    node.addEventListener('click', () => setLanguage(key));
  });

  heroTokens.forEach((token) => {
    const key = token.dataset.langTarget;
    token.tabIndex = 0;
    token.setAttribute('role', 'button');
    token.addEventListener('mouseenter', () => setLanguage(key));
    token.addEventListener('focus', () => setLanguage(key));
    const jump = () => {
      setLanguage(key);
      section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    };
    token.addEventListener('click', jump);
    token.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        jump();
      }
    });
  });

  if (!matchMedia('(pointer: coarse)').matches) {
    section.addEventListener('pointermove', (event) => {
      const rect = stage.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      stage.style.setProperty('--lx', `${x}%`);
      stage.style.setProperty('--ly', `${y}%`);
    }, { passive: true });
  }

  setLanguage(active, false);
})();
