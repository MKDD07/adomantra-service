const fallbackImageUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80";

function applyFallbackImage(img) {
  if (img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.removeAttribute("srcset");
  const fallback = new URL(fallbackImageUrl);
  if (img.classList.contains("hero-bg-image")) fallback.searchParams.set("w", "1920");
  if (img.className.includes("avatar")) {
    fallback.searchParams.set("w", "160");
    fallback.searchParams.set("h", "160");
  }
  img.src = fallback.href;
}

// Capture image failures, including images added after the page loads.
document.addEventListener("error", (event) => {
  if (event.target instanceof HTMLImageElement) applyFallbackImage(event.target);
}, true);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img").forEach((img) => {
    if (!img.getAttribute("src") || (img.complete && img.naturalWidth === 0)) {
      applyFallbackImage(img);
    }
  });
  /* ---------------- TESTIMONIALS SWIPER (Multiplier Style 2 Columns on Desktop) ---------------- */
  if (typeof Swiper !== "undefined" && document.querySelector(".testimonials-swiper")) {
    new Swiper(".testimonials-swiper", {
      slidesPerView: 1.1,
      spaceBetween: 24,
      loop: false,
      navigation: {
        nextEl: document.querySelector("#testimonials .tst-next-btn"),
        prevEl: document.querySelector("#testimonials .tst-prev-btn"),
      },
      speed: 600,
      breakpoints: {
        640: { slidesPerView: 1.4, spaceBetween: 24 },
        768: { slidesPerView: 1.8, spaceBetween: 24 },
        1024: { slidesPerView: 2, spaceBetween: 28 }
      },
    });
  }

  /* ---------------- FORM VALIDATION (Inquiry + Hero Form) ---------------- */
  const attachFormHandler = (formId) => {
    const f = document.getElementById(formId);
    if (!f) return;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!f.checkValidity()) {
        f.classList.add("was-validated");
        return;
      }
      f.classList.add("was-validated");
      const submitBtn = f.querySelector("button[type='submit']");
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Thank you — we'll be in touch!";
        setTimeout(() => {
          submitBtn.textContent = originalText;
        }, 5000);
      }
      f.reset();
      f.querySelectorAll(".form-group").forEach((grp) => grp.classList.remove("has-value"));
      setTimeout(() => f.classList.remove("was-validated"), 100);
    });
  };
  attachFormHandler("hrmsContactForm");

  /* ---------------- HERO FORM CARD POPUP (< 576px) ---------------- */
  const heroFormModal = document.getElementById("heroFormCardModal");
  const openHeroBtn = document.getElementById("openHeroModalBtn");
  const closeHeroBtn = document.getElementById("closeHeroModalBtn");
  const heroBackdrop = document.getElementById("heroModalBackdrop");

  function openHeroFormModal() {
    if (!heroFormModal) return;
    heroFormModal.classList.add("is-popup-open");
    if (heroBackdrop) heroBackdrop.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }

  function closeHeroFormModal() {
    if (!heroFormModal) return;
    heroFormModal.classList.remove("is-popup-open");
    if (heroBackdrop) heroBackdrop.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  if (openHeroBtn) openHeroBtn.addEventListener("click", openHeroFormModal);
  if (closeHeroBtn) closeHeroBtn.addEventListener("click", closeHeroFormModal);
  if (heroBackdrop) heroBackdrop.addEventListener("click", closeHeroFormModal);

  // Close when tapping outside the card on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 576 && heroFormModal && heroFormModal.classList.contains("is-popup-open")) {
      if (!heroFormModal.contains(e.target) && openHeroBtn && !openHeroBtn.contains(e.target)) {
        closeHeroFormModal();
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && heroFormModal && heroFormModal.classList.contains("is-popup-open")) {
      closeHeroFormModal();
    }
  });

  // Only visible within the hero section viewport on mobile (<576px)
  const heroSectionEl = document.querySelector(".hero");
  function updateHeroTriggerVisibility() {
    if (!openHeroBtn || !heroSectionEl) return;
    if (window.innerWidth > 576) return;

    const heroRect = heroSectionEl.getBoundingClientRect();
    // Visible while hero is in viewport
    if (heroRect.bottom > 120 && heroRect.top < window.innerHeight) {
      openHeroBtn.classList.remove("is-hidden");
    } else {
      openHeroBtn.classList.add("is-hidden");
    }
  }

  window.addEventListener("scroll", updateHeroTriggerVisibility, { passive: true });
  window.addEventListener("resize", updateHeroTriggerVisibility, { passive: true });
  updateHeroTriggerVisibility();

});

// Route hosted-site search results to the corresponding Adomantra section.
document.addEventListener("click", (event) => {
  const result = event.target.closest(".site-search-modal .search-result-card");
  if (!result) return;
  const href = result.getAttribute("href");
  if (result.dataset.isOffcanvas === "true" || href === "#consultationOffcanvas") {
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = "book-a-demo.html";
  } else if (href?.startsWith("#") && !document.getElementById(href.slice(1))) {
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = "https://www.adomantra.com/newadomantra/" + href;
  }
}, true);

// Scope navigation to each related-content carousel.
document.addEventListener("DOMContentLoaded", () => {
  if (typeof Swiper === "undefined") return;
  ["industries", "services", "case-studies"].forEach((key) => {
    const slider = document.getElementById(`${key}-swiper`);
    if (!slider || slider.swiper) return;
    const controls = document.getElementById(`${key}-prev`)?.closest(".carousel-header-controls");
    const syncControls = (swiper) => {
      if (controls) controls.hidden = swiper.isLocked;
    };
    new Swiper(slider, {
      slidesPerView: 1.15,
      spaceBetween: 20,
      watchOverflow: true,
      rewind: true,
      observer: true,
      observeParents: true,
      on: {
        init: syncControls,
        lock: syncControls,
        unlock: syncControls,
        resize: syncControls,
        update: syncControls,
      },
      navigation: {
        prevEl: document.getElementById(`${key}-prev`),
        nextEl: document.getElementById(`${key}-next`),
      },
      breakpoints: {
        576: { slidesPerView: 2, spaceBetween: 24 },
        992: { slidesPerView: 2.5, spaceBetween: 24 },
        1200: { slidesPerView: 4, spaceBetween: 28 },
      },
    });
  });
  document.querySelectorAll(".related-carousel-section").forEach((section) => {
    const slider = section.querySelector(".related-content-swiper");
    if (!slider || slider.swiper) return;
    new Swiper(slider, {
      slidesPerView: 1.15,
      spaceBetween: 20,
      watchOverflow: true,
      rewind: true,
      keyboard: { enabled: true, onlyInViewport: true },
      navigation: {
        prevEl: section.querySelector(".related-prev"),
        nextEl: section.querySelector(".related-next"),
      },
      breakpoints: {
        576: { slidesPerView: 2, spaceBetween: 24 },
        992: { slidesPerView: 3, spaceBetween: 24 },
        1200: { slidesPerView: 4, spaceBetween: 28 },
      },
    });
  });
});

// Roll each case-study metric once when its card enters view.
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll("#case-studies .case-study-odometer");
  if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      observer.unobserve(counter);
      const visual = document.createElement("span");
      visual.setAttribute("aria-hidden", "true");
      visual.className = "case-study-odometer";
      visual.append(counter.dataset.prefix);
      [...counter.dataset.value].forEach((digit, index) => {
        const windowEl = document.createElement("span");
        windowEl.className = "case-odometer-digit";
        const reel = document.createElement("span");
        reel.className = "case-odometer-reel";
        reel.style.transitionDelay = `${index * 80}ms`;
        const steps = 10 + Number(digit);
        for (let i = 0; i <= steps; i++) {
          const number = document.createElement("span");
          number.textContent = i % 10;
          reel.append(number);
        }
        windowEl.append(reel);
        visual.append(windowEl);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          reel.style.transform = `translateY(-${steps * 1.4}em)`;
        }));
      });
      visual.append("%");
      counter.replaceChildren(visual);
    });
  }, { threshold: 0.3 });
  counters.forEach((counter) => observer.observe(counter));
});
