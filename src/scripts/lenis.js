import Lenis from "lenis";

const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const lenis = new Lenis({
  lerp: 0.045,
  duration: 1.7,
  smoothWheel: !prefersReduced,
  smoothTouch: !prefersReduced,
  wheelMultiplier: 0.95,
  touchMultiplier: 1.1,
  normalizeWheel: true,
  autoRaf: false,
});

const attachRaf = () => {
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
  lenis.on("scroll", window.ScrollTrigger.update);
  window.ScrollTrigger.refresh();
};

attachRaf();
syncScrollTrigger();

// Expose for debugging/tuning in devtools.
window.__lenis = lenis;
