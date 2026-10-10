/* Small, dependency-free shared interactions. The 3D engine loads only on request. */
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const menu = document.querySelector("#site-menu");
  const toggle = document.querySelector(".menu-toggle");
  const main = document.querySelector("main");
  const footer = document.querySelector("footer");
  let returnFocus = null;
  function setMenu(open) {
    if (!menu || !toggle) return;
    if (open) returnFocus = document.activeElement;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    if (main) main.inert = open;
    if (footer) footer.inert = open;
    document.querySelectorAll(".site-header a").forEach((link) => {
      link.inert = open;
    });
    if (open) menu.querySelector("a")?.focus();
    else returnFocus?.focus();
  }
  toggle?.addEventListener("click", () =>
    setMenu(toggle.getAttribute("aria-expanded") !== "true"),
  );
  menu?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (menu?.hidden !== false) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(false);
    }
    if (event.key === "Tab") {
      const items = [
        toggle,
        ...menu.querySelectorAll("a[href],button:not([disabled])"),
      ].filter(Boolean);
      const index = items.indexOf(document.activeElement);
      if (event.shiftKey && index === 0) {
        event.preventDefault();
        items.at(-1).focus();
      } else if (!event.shiftKey && index === items.length - 1) {
        event.preventDefault();
        items[0].focus();
      }
    }
  });
  window
    .matchMedia("(min-width: 768px)")
    .addEventListener("change", (event) => {
      if (event.matches && menu?.hidden === false) setMenu(false);
    });
  document.querySelectorAll(".header-nav a").forEach((link) => {
    if (new URL(link.href).pathname === location.pathname)
      link.setAttribute("aria-current", "page");
  });
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const elements = document.querySelectorAll(".reveal");
  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("is-pending");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -25px 0px" },
    );
    elements.forEach((element) => {
      element.classList.add("is-pending");
      observer.observe(element);
    });
    reducedMotion.addEventListener("change", (event) => {
      if (event.matches) {
        elements.forEach((el) => el.classList.remove("is-pending"));
        observer.disconnect();
      }
    });
  }

  const languages = {
    python: {
      symbol: "Py",
      tag: "Ideas into working tools",
      title: "Make it work.\nThen make it better.",
      description:
        "My starting point for programming, prototyping, automation and problem solving.",
    },
    cpp: {
      symbol: "C++",
      tag: "Understand what happens underneath",
      title: "Think in algorithms.\nBuild with precision.",
      description:
        "Structured problem solving, algorithms and learning to think carefully about performance.",
    },
    java: {
      symbol: "Ja",
      tag: "Give complex ideas a structure",
      title: "Model the problem.\nConnect the pieces.",
      description:
        "Object-oriented programming and computer science, including preparation for AP Computer Science A.",
    },
  };
  const tabs = [...document.querySelectorAll("[data-language]")];
  function selectLanguage(tab, focus = false) {
    const data = languages[tab.dataset.language];
    if (!data) return;
    tabs.forEach((item) => {
      const active = item === tab;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    const panel = document.querySelector("#language-panel");
    if (!panel) return;
    panel.setAttribute("aria-labelledby", tab.id);
    for (const key of ["symbol", "tag", "title", "description"]) {
      const target = panel.querySelector(`[data-language-${key}]`);
      if (target) target.textContent = data[key];
    }
    if (!reducedMotion.matches && panel.animate)
      panel.animate(
        [
          { opacity: 0.45, transform: "translateY(6px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 260, easing: "ease-out" },
      );
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectLanguage(tab));
    tab.addEventListener("keydown", (event) => {
      let target;
      if (event.key === "ArrowRight") target = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft")
        target = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === "Home") target = tabs[0];
      if (event.key === "End") target = tabs.at(-1);
      if (target) {
        event.preventDefault();
        selectLanguage(target, true);
      }
    });
  });

  let cubeTurns = 0;
  document.querySelector("[data-cube-turn]")?.addEventListener("click", () => {
    cubeTurns += 1;
    const cube = document.querySelector(".lab-cube, .cube, [data-cube]");
    if (cube)
      cube.style.transform = `rotateX(${-22 + cubeTurns * 90}deg) rotateY(${-32 + cubeTurns * 90}deg)`;
    const status = document.querySelector("[data-cube-status]");
    if (status)
      status.textContent = `Cube rotated ${cubeTurns} ${cubeTurns === 1 ? "time" : "times"}.`;
  });
  if (document.querySelector("[data-model-viewer]")) {
    import("./model-viewer.js").catch(() => {
      document.querySelectorAll("[data-model-status]").forEach((status) => {
        status.textContent =
          "The 3D viewer could not start. Reload this page to try again.";
      });
    });
  }
})();
