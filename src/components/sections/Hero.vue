<!-- src/components/Hero.vue -->
<template>
  <section id="hero" data-nav="blend" ref="heroRef" class="hero" @copy.prevent @cut.prevent>
    <video class="hero__video" autoplay loop muted playsinline preload="auto" aria-hidden="true">
      <source src="/videos/website-bg.webm" type="video/webm" />
      Your browser does not support the video tag.
    </video>

    <div class="hero__overlay" aria-hidden="true"></div>

    <div class="hero__content">
      <div class="hero__grid">
        <div class="hero__text">
          <p ref="headingRef" class="hero__heading" data-split="heading">
            Your website should work as hard as you do.
            <br />
            In today's digital landscape, your online presence isn't just a
            business card. it's your most powerful growth engine.
            <br /><br />
            <span style="font-size: clamp(0.8em, 1vw, 1em); opacity: 0.7">(Scroll Down)</span>
          </p>
        </div>

        <div class="hero__cta">
          <span ref="ctaMaskRef" class="cta-mask" aria-hidden="true">
            <span ref="ctaMoverRef" class="cta-mover">
              <Button tag="a" href="/link" width="clamp(100%, 2.4vw, 420px)" height="clamp(60px, 5vw, 90px)" fontSize="clamp(15px, 2vw, 20px)"
                paddingX="clamp(25px, 2vw, 40px)" paddingY="0px" font-weight="700">
                Build Your Website Now
              </Button>

            </span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import Button from "../base/Button.vue";

const heroRef = ref(null);
const headingRef = ref(null);
const ctaMaskRef = ref(null);
const ctaMoverRef = ref(null);

let splitInstance = null;
let tl = null;
let revealStarted = false;

let preloaderObserver = null;
let rafId = null;

const setViewportHeight = () => {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
};

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const getPreloader = () => document.getElementById("preloader");

const ensurePlugins = () => {
  const gsap = window.gsap;
  const SplitText = window.SplitText;
  const CustomEase = window.CustomEase;
  if (!gsap) return null;

  if (SplitText && CustomEase) gsap.registerPlugin(SplitText, CustomEase);
  if (CustomEase?.create) CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");

  return { gsap, SplitText };
};

const cleanup = () => {
  tl?.kill();
  tl = null;
  splitInstance?.revert?.();
  splitInstance = null;
  revealStarted = false;

  if (preloaderObserver) preloaderObserver.disconnect();
  preloaderObserver = null;

  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
};

const initSplit = () => {
  const pack = ensurePlugins();
  if (!pack) return;
  const { gsap, SplitText } = pack;

  if (!SplitText || !headingRef.value) return;

  splitInstance?.revert?.();
  splitInstance = null;

  // EXACT CodePen config (mask:"lines")
  if (typeof SplitText.create === "function") {
    splitInstance = SplitText.create(headingRef.value, {
      type: "lines, words, chars",
      mask: "lines",
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
    });
  } else {
    splitInstance = new SplitText(headingRef.value, {
      type: "lines, words, chars",
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
    });
  }

  gsap.set(headingRef.value.querySelectorAll(".line"), { yPercent: 110, force3D: true });
};

const buildTimeline = () => {
  const pack = ensurePlugins();
  if (!pack) return;
  const { gsap } = pack;

  if (prefersReducedMotion()) {
    gsap.set([headingRef.value, ctaMoverRef.value], { clearProps: "all" });
    return;
  }

  // build without playing
  tl?.kill();
  tl = null;

  initSplit();

  const lines = headingRef.value?.querySelectorAll?.(".line") || [];
  const ctaMover = ctaMoverRef.value;

  if (ctaMover) gsap.set(ctaMover, { yPercent: 140, force3D: true });

  tl = gsap.timeline({ paused: true });

  if (lines.length) {
    tl.fromTo(
      lines,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.8, stagger: 0.1, ease: "osmo-ease" },
      0
    );
  }

  // CTA reveal (masked, same motion language)
  if (ctaMover) {
    tl.to(ctaMover, { yPercent: 0, duration: 0.75, ease: "osmo-ease", clearProps: "transform" }, 0.16);
  }
};

const playReveal = () => {
  if (revealStarted) return;
  revealStarted = true;

  if (!tl) buildTimeline();
  // next frame = sync with preloader exit animation start
  requestAnimationFrame(() => tl?.restart(true));
};

const isPreloaderAlreadyGone = () => {
  const p = getPreloader();
  if (!p) return true;
  const cs = getComputedStyle(p);
  return (
    p.getAttribute("aria-hidden") === "true" ||
    cs.display === "none" ||
    cs.visibility === "hidden" ||
    Number(cs.opacity) === 0
  );
};

/**
 * This is the key: fire reveal when the preloader STARTS exiting,
 * not when it finishes.
 */
const attachPreloaderExitHooks = () => {
  const p = getPreloader();
  if (!p) return;

  // 1) Transition/animation start = best possible timing
  const onExitStart = () => playReveal();
  p.addEventListener("transitionstart", onExitStart, { once: true });
  p.addEventListener("animationstart", onExitStart, { once: true });

  // 2) MutationObserver: detect class/style/aria changes that usually begin exit
  preloaderObserver = new MutationObserver(() => {
    if (revealStarted) return;

    // common exit signals:
    // - aria-hidden set
    // - opacity starts decreasing
    // - class changes (e.g., "is-exiting")
    const cs = getComputedStyle(p);
    const opacity = Number(cs.opacity);

    if (p.getAttribute("aria-hidden") === "true") playReveal();
    else if (opacity < 0.98) playReveal();
  });

  preloaderObserver.observe(p, {
    attributes: true,
    attributeFilter: ["class", "style", "aria-hidden"],
  });

  // 3) Fallback: if element is removed from DOM, reveal immediately
  const parent = p.parentNode;
  if (parent) {
    const removalObserver = new MutationObserver(() => {
      if (!document.getElementById("preloader")) playReveal();
    });
    removalObserver.observe(parent, { childList: true });
  }

  // 4) Still support your existing event (late, but harmless fallback)
  window.addEventListener("preloaderComplete", playReveal, { once: true });
};

let resizeTimer = null;
const onResize = () => {
  setViewportHeight();
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const pack = ensurePlugins();
    if (!pack) return;
    const { gsap } = pack;

    const alreadyPlayed = tl && tl.progress() > 0;
    buildTimeline();

    if (alreadyPlayed && gsap && headingRef.value) {
      gsap.set(headingRef.value.querySelectorAll(".line"), { yPercent: 0, clearProps: "transform" });
      if (ctaMoverRef.value) gsap.set(ctaMoverRef.value, { yPercent: 0, clearProps: "transform" });
    }
  }, 120);
};

onMounted(() => {
  setViewportHeight();
  window.addEventListener("resize", onResize, { passive: true });

  // Build immediately so play has zero setup cost
  buildTimeline();

  // If preloader is already gone, reveal now
  if (isPreloaderAlreadyGone()) {
    playReveal();
    return;
  }

  // Otherwise attach exit hooks that fire at EXIT START
  attachPreloaderExitHooks();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  window.removeEventListener("preloaderComplete", playReveal);
  clearTimeout(resizeTimer);
  cleanup();
});
</script>


<style scoped>
.hero {
  position: relative;
  width: 100%;
  display: flex;
  align-items: flex-end;
  min-height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  background-color: #0a0a0a;
  color: #fff;
  user-select: none;
}

.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
}

.hero__content {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  pointer-events: none;
  padding: 30px;
  display: flex;
  align-items: flex-end;
}

.hero__grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  pointer-events: auto;
}

.hero__heading {
  font-size: clamp(20px, 3.2vw, 28px);
  line-height: 1.35;
  font-weight: 300;
  margin: 0;

  max-width: 46ch;
  width: 100%;

  overflow-wrap: anywhere;
  word-break: normal;

  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.hero :deep(.line) {
  display: block;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

/* CTA masked reveal */
.cta-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  padding-bottom: 6px;
  margin-bottom: -6px;
}

.cta-mover {
  display: inline-block;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

.hero__cta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

@media (min-width: 768px) {
  .hero__grid {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .hero__cta {
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .hero__heading {
    max-width: 30ch;
    line-height: 1.4;
    letter-spacing: 0.02em;
  }
}
</style>
