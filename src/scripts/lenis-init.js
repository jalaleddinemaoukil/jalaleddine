import Lenis from "lenis";

const STATE_KEY = "__lenisState";

export const initLenis = () => {
  if (typeof window === "undefined") return null;

  const state = window[STATE_KEY] || {
    lenis: null,
    rafBound: false,
    eventsBound: false,
    scrollHooked: false,
    resizeObserver: null,
    resizeRaf: 0,
  };
  window[STATE_KEY] = state;

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const isCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;
  const saveData = navigator.connection?.saveData === true;
  const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  const lowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;

  const shouldUseLenis = !prefersReduced && !isCoarsePointer && !saveData && !lowMemory && !lowCpu;

  if (!state.lenis && shouldUseLenis) {
    const wrapper = window;
    const content = document.body;
    state.lenis = new Lenis({
      wrapper,
      content,
      lerp: 0.08,
      duration: 0.95,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.0,
      normalizeWheel: true,
      autoRaf: false,
      autoResize: true,
    });
  }

  const lenis = state.lenis;

  const attachRaf = () => {
    if (!lenis || state.rafBound) return;
    state.rafBound = true;

    if (window.gsap?.ticker) {
      window.gsap.ticker.add((t) => {
        lenis.raf(t * 1000);
      });
      window.gsap.ticker.lagSmoothing(0);
      return;
    }

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  };

  const syncScrollTrigger = () => {
    if (!window.ScrollTrigger) return;
    if (!lenis) {
      window.ScrollTrigger.refresh();
      return;
    }
    if (!state.scrollHooked) {
      lenis.on("scroll", window.ScrollTrigger.update);
      state.scrollHooked = true;
    }
    window.ScrollTrigger.refresh();
  };

  const refreshAll = () => {
    lenis?.resize?.();
    window.ScrollTrigger?.refresh?.();
  };

  const unlockIfNavClosed = () => {
    const navOpen = document.querySelector('[data-nav-state="open"]');
    if (!navOpen) document.documentElement.style.overflow = "";
  };

  const bindEvents = () => {
    if (state.eventsBound) return;
    state.eventsBound = true;

    window.addEventListener("app:route-change", () => {
      syncScrollTrigger();
      refreshAll();
      unlockIfNavClosed();
    }, { passive: true });

    window.addEventListener("content:loaded", refreshAll, { passive: true });
    window.addEventListener("load", refreshAll, { passive: true });
    window.addEventListener("preloaderComplete", () => {
      refreshAll();
      unlockIfNavClosed();
    }, { passive: true });
  };

  if (window.ScrollTrigger?.config && !window.__stConfig) {
    window.ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true,
    });
    window.__stConfig = true;
  }

  if (lenis && "ResizeObserver" in window && !state.resizeObserver) {
    state.resizeObserver = new ResizeObserver(() => {
      if (state.resizeRaf) return;
      state.resizeRaf = requestAnimationFrame(() => {
        state.resizeRaf = 0;
        refreshAll();
      });
    });
    state.resizeObserver.observe(document.body);
  }

  attachRaf();
  syncScrollTrigger();
  bindEvents();

  window.__lenis = lenis;
  return lenis;
};
