/**
 * AdoTeam - Static Module Showcase & Interactions
 * Uses pre-made CSS classes, variables, and design system.
 */
document.addEventListener("DOMContentLoaded", () => {
  // GSAP Sticky Stacking Cards Scroll Animation (High Performance: No blur filter, max 1 card behind)
  function initModulesStackAnimation() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const cards = gsap.utils.toArray(".module-stack-card");
    if (!cards.length) return;

    cards.forEach((card, i) => {
      // Smooth GPU-accelerated scaling and opacity transition (NO heavy blur filter)
      if (i < cards.length - 1) {
        gsap.to(card, {
          scale: 0.95,
          y: -12,
          opacity: 0.6,
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top 80%",
            end: "top 20%",
            scrub: true,
          }
        });
      }

      // Hide older cards when 2 cards ahead arrive so only 1 card remains behind in the stack
      if (i < cards.length - 2) {
        gsap.to(card, {
          opacity: 0,
          pointerEvents: "none",
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 2],
            start: "top 85%",
            end: "top 40%",
            scrub: true,
          }
        });
      }
    });
  }

  function initBenchmarks() {
    const section = document.getElementById("benchmarks");
    if (!section) return;
    const tabs = section.querySelectorAll("#benchmarkTabs .benchmark-card-item");
    const panels = section.querySelectorAll(".benchmark-panel");
    if (!tabs.length) return;
    const initialIndex = Number(section.dataset.initialBenchmark) || 0;
    let selectedIndex = initialIndex;
    let swiper;
    function selectBenchmark(index) {
      selectedIndex = index;
      tabs.forEach((tab) => {
        const active = Number(tab.dataset.index) === index;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-pressed", String(active));
      });
      panels.forEach((panel, panelIndex) => { panel.hidden = panelIndex !== index; });
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    }
    tabs.forEach((tab) => tab.addEventListener("click", () => {
      const index = Number(tab.dataset.index);
      if (swiper && window.innerWidth <= 1024) swiper.slideTo(index);
      selectBenchmark(index);
    }));
    const slider = section.querySelector(".benchmark-swiper");
    if (typeof Swiper !== "undefined" && slider) {
      const controls = document.createElement("div");
      controls.className = "benchmark-mobile-controls";
      controls.innerHTML = '<button type="button" class="benchmark-prev" aria-label="Previous campaign card"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button><div class="benchmark-pagination"></div><button type="button" class="benchmark-next" aria-label="Next campaign card"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>';
      slider.parentElement.appendChild(controls);
      swiper = new Swiper(slider, {
        direction: "horizontal",
        slidesPerView: 1.2,
        spaceBetween: 12,
        initialSlide: initialIndex,
        speed: 350,
        loop: false,
        watchOverflow: true,
        observer: true,
        observeParents: true,
        navigation: { prevEl: controls.querySelector(".benchmark-prev"), nextEl: controls.querySelector(".benchmark-next") },
        pagination: { el: controls.querySelector(".benchmark-pagination"), clickable: true },
        breakpoints: {
          1025: { enabled: false, direction: "vertical", slidesPerView: "auto", spaceBetween: 0, allowTouchMove: false },
        },
        on: {
          slideChange() {
            if (window.innerWidth <= 1024) selectBenchmark(this.activeIndex);
          },
          breakpoint() {
            requestAnimationFrame(() => {
              if (window.innerWidth <= 1024 && swiper) swiper.slideTo(selectedIndex, 0);
            });
          },
        },
      });
    }
    selectBenchmark(initialIndex);
  }

  function initShowcaseOdometers() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    document.querySelectorAll(".showcase-banner-item").forEach((item) => {
      let animated = false;
      ScrollTrigger.create({
        trigger: item,
        start: "top 80%",
        onEnter: () => {
          if (animated) return;
          animated = true;

          item.querySelectorAll(".sbc-odometer").forEach((counter) => {
            const target = parseFloat(counter.getAttribute("data-count-to")) || 0;
            const prefix = counter.getAttribute("data-prefix") || "";
            const decimals = parseInt(counter.getAttribute("data-decimals"), 10) || 0;
            const obj = { val: 0 };

            gsap.to(obj, {
              val: target,
              duration: 2.2,
              ease: "power3.out",
              onUpdate: () => {
                let formatted;
                if (decimals > 0) {
                  formatted = obj.val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
                } else {
                  formatted = Math.round(obj.val).toLocaleString('en-US');
                }
                counter.textContent = prefix + formatted;
              }
            });
          });
        }
      });
    });
  }

  // ============ PUT YOUR HR ON AUTOPILOT - GSAP SCROLLTRIGGER (FIXED) ============
  function initLeaveScreenshotScroll() {
    const section = document.querySelector("#leave-autopilot");
    if (!section) return;

    const snippets = Array.from(section.querySelectorAll(".leave-scroll-snippet"));
    const uiCards  = Array.from(section.querySelectorAll(".leave-ui-stack-card"));
    if (!snippets.length || !uiCards.length) return;

    function activateStep(stepNum) {
      const s = String(stepNum);

      snippets.forEach((snip) => {
        if (window.innerWidth <= 576) {
          snip.style.opacity = "1";
          snip.style.transform = "none";
        } else if (snip.getAttribute("data-step") === s) {
          snip.style.opacity   = "1";
          snip.style.transform = "translateY(0)";
        } else {
          snip.style.opacity   = "0.32";
          snip.style.transform = "translateY(6px)";
        }
      });

      uiCards.forEach((card) => {
        if (card.getAttribute("data-step") === s) {
          card.classList.add("is-active");
        } else {
          card.classList.remove("is-active");
        }
      });
    }

    // Pair each preview with its own text on mobile; restore the desktop stage on resize.
    const previewStage = section.querySelector(".leave-mockup-stage");
    const mobileLayout = window.matchMedia("(max-width: 576px)");
    function arrangePreviews() {
      uiCards.forEach((card) => {
        const target = mobileLayout.matches
          ? snippets.find((snippet) => snippet.dataset.step === card.dataset.step)
          : previewStage;
        if (target && card.parentElement !== target) target.appendChild(card);
      });
      scheduleUpdate();
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    }
    mobileLayout.addEventListener("change", arrangePreviews);

    // Follow the visible text beneath the sticky preview, including after resizing.
    const stickyColumn = section.querySelector(".leave-left-visuals-col");
    let scheduled = false;
    let activeStep;
    function updateActiveStep() {
      scheduled = false;
      const mobile = window.matchMedia("(max-width: 576px)").matches;
      const previewBottom = stickyColumn ? stickyColumn.getBoundingClientRect().bottom : 0;
      const readingLine = mobile
        ? Math.min(window.innerHeight - 24, previewBottom + Math.max(24, (window.innerHeight - previewBottom) * 0.25))
        : window.innerHeight * 0.55;
      let current = snippets[0];
      snippets.forEach((snippet) => {
        if (snippet.getBoundingClientRect().top <= readingLine) current = snippet;
      });
      const step = current.getAttribute("data-step");
      // Reapply on resize so text styles also follow the current breakpoint.
      if (step !== activeStep || updateActiveStep.mobile !== mobile) {
        activeStep = step;
        updateActiveStep.mobile = mobile;
        activateStep(step);
      }
    }
    function scheduleUpdate() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(updateActiveStep);
    }
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("load", scheduleUpdate);
    if (typeof ResizeObserver !== "undefined" && stickyColumn) {
      new ResizeObserver(scheduleUpdate).observe(stickyColumn);
    }
    arrangePreviews();
    activateStep(1);
    updateActiveStep();
  }

  // GSAP Sticky Stacking for Payroll Features Grid (Who Can Use AdoTeam) on <576px
  function initPayrollFeaturesStackAnimation() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);
    const pfcCards = gsap.utils.toArray(".payroll-features-grid .pfc-card");
    if (!pfcCards.length) return;

    pfcCards.forEach((card, i) => {
      card.style.zIndex = i + 1;

      if (i < pfcCards.length - 1) {
        gsap.to(card, {
          scale: 0.94,
          y: -10,
          opacity: 0.65,
          ease: "none",
          scrollTrigger: {
            trigger: pfcCards[i + 1],
            start: "top 75%",
            end: "top 25%",
            scrub: true,
          }
        });
      }

      if (i < pfcCards.length - 2) {
        gsap.to(card, {
          opacity: 0,
          pointerEvents: "none",
          ease: "none",
          scrollTrigger: {
            trigger: pfcCards[i + 2],
            start: "top 80%",
            end: "top 45%",
            scrub: true,
          }
        });
      }
    });
  }

  // Initialize interactions for static HTML.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  initBenchmarks();
  if (!reduceMotion) initShowcaseOdometers();
  initLeaveScreenshotScroll();
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.matchMedia().add("(max-width: 575px) and (prefers-reduced-motion: no-preference)", initPayrollFeaturesStackAnimation);
  }

  if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
  if (!reduceMotion) initModulesStackAnimation();
});
