/* ================================================================
   NOVA STUDIO — vlastiti JavaScript
   Funkcionalnosti: tema, navigacija, animacije, filter projekata,
   modal, brojači, validacija forme i povratak na vrh.
   ================================================================ */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const navbar = document.querySelector("#glavnaNavigacija");
  const themeButton = document.querySelector("#temaDugme");
  const backToTop = document.querySelector("#nazadNaVrh");
  const navCollapseElement = document.querySelector("#navbarSadrzaj");

  /* 1. Svijetla/tamna tema uz čuvanje izbora u localStorage */
  const storedTheme = localStorage.getItem("nova-theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");

  function applyTheme(theme) {
    html.setAttribute("data-bs-theme", theme);
    const isDark = theme === "dark";
    themeButton.innerHTML = `<i class="bi ${isDark ? "bi-sun" : "bi-moon-stars"}" aria-hidden="true"></i>`;
    themeButton.setAttribute("aria-label", isDark ? "Uključi svijetlu temu" : "Uključi tamnu temu");
  }

  applyTheme(initialTheme);

  themeButton.addEventListener("click", () => {
    const nextTheme = html.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("nova-theme", nextTheme);
  });

  /* 2. Promjena izgleda navigacije i prikaz dugmeta pri skrolanju */
  function handleScroll() {
    const hasScrolled = window.scrollY > 40;
    navbar.classList.toggle("navbar-scrolled", hasScrolled);
    backToTop.classList.toggle("show", window.scrollY > 550);
  }

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* 3. Aktivna stavka navigacije prema trenutno vidljivoj sekciji */
  const sections = [...document.querySelectorAll("main section[id], main header[id]")];
  const navLinks = [...document.querySelectorAll(".navbar .nav-link")];

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  /* Zatvaranje mobilne navigacije nakon odabira stavke */
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth >= 992 || !navCollapseElement.classList.contains("show")) return;
      bootstrap.Collapse.getOrCreateInstance(navCollapseElement).hide();
    });
  });

  /* 4. Animacija elemenata pri ulasku u vidljivo područje */
  const revealElements = document.querySelectorAll(
    ".reveal-item, .service-card, .stat-card, .project-card, .process-item, .testimonial-card, .custom-accordion"
  );

  revealElements.forEach((element) => {
    if (!element.classList.contains("reveal-item")) element.classList.add("reveal-on-scroll");
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  /* 5. Animirani statistički brojači */
  const counters = document.querySelectorAll(".counter");

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const counter = entry.target;
        const target = Number(counter.dataset.target);
        const duration = 1200;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.floor(target * easedProgress);

          if (progress < 1) requestAnimationFrame(updateCounter);
        }

        requestAnimationFrame(updateCounter);
        observer.unobserve(counter);
      });
    },
    { threshold: 0.7 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  /* 6. Filtriranje projekata prema data-category atributu */
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectItems = document.querySelectorAll(".project-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      projectItems.forEach((project) => {
        const shouldShow = selectedFilter === "sve" || project.dataset.category === selectedFilter;
        project.classList.toggle("project-hidden", !shouldShow);
      });
    });
  });

  /* 7. Dinamički sadržaj Bootstrap modala */
  const projectData = {
    finflow: {
      category: "Web dizajn i razvoj",
      title: "FinFlow platforma",
      description: "Redizajn finansijske platforme usmjeren na jednostavniju prijavu korisnika, jasniji pregled podataka i bolje performanse na mobilnim uređajima.",
      results: [["+36%", "više prijava"], ["1,2 s", "vrijeme učitavanja"], ["98/100", "SEO rezultat"]]
    },
    arco: {
      category: "Vizuelni identitet",
      title: "Arco arhitektura",
      description: "Razvijen je kompletan vizuelni sistem koji spaja preciznost arhitekture, toplinu prostora i minimalistički pristup komunikaciji.",
      results: [["12", "primjena logotipa"], ["4", "osnovne boje"], ["100%", "dosljedan identitet"]]
    },
    move: {
      category: "Digitalni marketing",
      title: "Move kampanja",
      description: "Kampanja za lansiranje nove fitness aplikacije obuhvatila je strategiju sadržaja, video oglase i optimizaciju prema stvarnim podacima.",
      results: [["+82%", "angažman"], ["2,7×", "povrat ulaganja"], ["740K", "prikaza oglasa"]]
    },
    luma: {
      category: "E-commerce",
      title: "Luma online shop",
      description: "Moderan web shop optimizovan za brzo pronalaženje proizvoda, jednostavnu kupovinu i uredan prikaz na svim veličinama ekrana.",
      results: [["+41%", "online prodaja"], ["-28%", "napuštanje korpe"], ["2,1 s", "učitavanje"]]
    }
  };

  const projectModal = document.querySelector("#projekatModal");

  projectModal.addEventListener("show.bs.modal", (event) => {
    const trigger = event.relatedTarget;
    const project = projectData[trigger.dataset.project];

    document.querySelector("#modalKategorija").textContent = project.category;
    document.querySelector("#modalNaslov").textContent = project.title;
    document.querySelector("#modalOpis").textContent = project.description;
    document.querySelector("#modalRezultati").innerHTML = project.results
      .map(
        ([value, label]) => `
          <div class="col-sm-4">
            <div class="result-box h-100">
              <strong>${value}</strong>
              <small>${label}</small>
            </div>
          </div>`
      )
      .join("");
  });

  /* 8. Validacija kontakt forme */
  const contactForm = document.querySelector("#kontaktForma");
  const successToast = bootstrap.Toast.getOrCreateInstance(document.querySelector("#uspjehToast"), {
    delay: 4500
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      event.stopPropagation();
      contactForm.classList.add("was-validated");
      return;
    }

    /* Demonstracijska forma: podaci se ne šalju na server. */
    successToast.show();
    contactForm.reset();
    contactForm.classList.remove("was-validated");
  });

  /* 9. Automatsko ispisivanje trenutne godine */
  document.querySelector("#trenutnaGodina").textContent = new Date().getFullYear();
});
