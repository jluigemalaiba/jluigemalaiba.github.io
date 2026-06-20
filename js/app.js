const sectionFiles = [
  "home.html",
  "about.html",
  "skills.html",
  "education.html",
  "works.html",
  "contact.html",
];

async function loadPortfolioSections() {
  const sectionRoot = document.querySelector("#page-sections");
  if (!sectionRoot) return;

  if (sectionRoot.querySelector("section[id]")) {
    initPortfolio();
    return;
  }

  try {
    const sectionMarkup = await Promise.all(
      sectionFiles.map(async (file) => {
        try {
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`Unable to load ${file}`);
          }

          return response.text();
        } catch (error) {
          console.error(error);
          return `
            <section class="section-panel load-error" id="${file.replace(".html", "")}">
              <div class="container-fluid content-wrap">
                <p class="kicker">Missing Section</p>
                <h2>${file}</h2>
                <p>Please check that this file is in the same folder as index.html.</p>
              </div>
            </section>
          `;
        }
      })
    );

    sectionRoot.innerHTML = sectionMarkup.join("");
    initPortfolio();
  } catch (error) {
    sectionRoot.innerHTML = `
      <section class="section-panel load-error">
        <div class="container-fluid content-wrap">
          <div class="row">
            <div class="col-lg-8">
              <p class="kicker">Portfolio</p>
              <h1>Unable to load sections</h1>
              <p>Please preview this project through a local server so the separated HTML files can load correctly.</p>
            </div>
          </div>
        </div>
      </section>
    `;
    console.error(error);
  }
}

function initPortfolio() {
  document.body.classList.add("animations-ready");

  const nav = document.querySelector(".side-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const navClose = document.querySelector(".nav-close");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const animatedItems = document.querySelectorAll("[data-animate]");
  const counters = document.querySelectorAll("[data-count]");
  const typeTarget = document.querySelector("#typeTarget");
  const projectTrack = document.querySelector(".project-track");
  const projectCards = [...document.querySelectorAll(".project-card")];
  const projectModal = document.querySelector(".project-modal");
  const projectModalDialog = document.querySelector(".project-modal-dialog");
  const projectModalClose = document.querySelector(".project-modal-close");
  const projectModalBanner = document.querySelector(".project-modal-banner");
  const projectModalTitle = document.querySelector("#projectModalTitle");
  const projectModalDescription = document.querySelector("#projectModalDescription");
  const projectCodeLink = document.querySelector(".project-code-link");

  const roles = ["Web Developer", "Frontend Builder", "UI Enthusiast"];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let lastFocusedProject = null;

  menuToggle?.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 991.98px)").matches) {
      document.body.classList.remove("nav-collapsed", "nav-scrolled");
      navClose?.querySelector("i")?.classList.remove("bi-chevron-right");
      navClose?.querySelector("i")?.classList.add("bi-chevron-left");
    }

    const isOpen = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navClose?.addEventListener("click", () => {
    const isCollapsed = document.body.classList.toggle("nav-collapsed");
    const closeIcon = navClose.querySelector("i");

    nav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    navClose.setAttribute("aria-label", isCollapsed ? "Expand navigation" : "Collapse navigation");
    closeIcon?.classList.toggle("bi-chevron-right", isCollapsed);
    closeIcon?.classList.toggle("bi-chevron-left", !isCollapsed);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));

      if (target) {
        event.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, left: 0, behavior: "auto" });
        history.replaceState(null, "", link.getAttribute("href"));
      }

      nav.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  function updateScrolledNav() {
    if (window.matchMedia("(max-width: 991.98px)").matches) {
      document.body.classList.remove("nav-scrolled");
      return;
    }

    document.body.classList.toggle("nav-scrolled", window.scrollY > 80);
  }

  updateScrolledNav();
  window.addEventListener("scroll", updateScrolledNav, { passive: true });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  animatedItems.forEach((item) => revealObserver.observe(item));

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );

  sections.forEach((section) => navObserver.observe(section));

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = Number(entry.target.dataset.count);
        const duration = 1100;
        const start = performance.now();

        const update = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const value = Math.floor(progress * target);
          entry.target.textContent = target === 100 ? `${value}%` : `${value}+`;

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            entry.target.textContent = target === 100 ? "100%" : `${target}+`;
          }
        };

        requestAnimationFrame(update);
        countObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => countObserver.observe(counter));

  function typeRole() {
    if (!typeTarget) return;

    const currentRole = roles[roleIndex];
    const nextText = isDeleting
      ? currentRole.slice(0, charIndex - 1)
      : currentRole.slice(0, charIndex + 1);

    typeTarget.textContent = nextText;
    charIndex = nextText.length;

    if (!isDeleting && nextText === currentRole) {
      isDeleting = true;
      setTimeout(typeRole, 1200);
      return;
    }

    if (isDeleting && nextText === "") {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }

    setTimeout(typeRole, isDeleting ? 44 : 78);
  }

  typeRole();

  document.querySelector(".carousel-control.prev")?.addEventListener("click", () => {
    projectTrack?.scrollBy({ left: -projectTrack.clientWidth * 0.86, behavior: "smooth" });
  });

  document.querySelector(".carousel-control.next")?.addEventListener("click", () => {
    projectTrack?.scrollBy({ left: projectTrack.clientWidth * 0.86, behavior: "smooth" });
  });

  function openProjectModal(card) {
    if (!projectModal || !projectModalBanner || !projectModalTitle || !projectModalDescription || !projectCodeLink) return;

    lastFocusedProject = card;
    projectModalBanner.className = `project-modal-banner ${card.dataset.banner || ""}`;
    projectModalTitle.textContent = card.dataset.title || "Project";
    projectModalDescription.textContent = card.dataset.description || "";
    projectCodeLink.href = card.dataset.code || "#";
    projectModal.classList.add("is-open");
    projectModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    projectModalClose?.focus();
  }

  function closeProjectModal() {
    if (!projectModal) return;

    projectModal.classList.remove("is-open");
    projectModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    lastFocusedProject?.focus();
  }

  projectCards.forEach((card) => {
    card.addEventListener("click", () => openProjectModal(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openProjectModal(card);
    });
  });

  projectModalClose?.addEventListener("click", closeProjectModal);
  projectModal?.addEventListener("click", (event) => {
    if (event.target === projectModal) closeProjectModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectModal?.classList.contains("is-open")) {
      closeProjectModal();
    }

    if (event.key === "Tab" && projectModal?.classList.contains("is-open") && projectModalDialog) {
      const focusable = [...projectModalDialog.querySelectorAll("a[href], button:not([disabled])")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

loadPortfolioSections();
