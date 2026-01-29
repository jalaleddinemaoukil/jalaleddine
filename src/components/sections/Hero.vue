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
          <!-- same text, just add data-split like the pen -->
          <p ref="headingRef" class="hero__heading" data-split="heading">
            Your website should work as hard as you do.
            <br />
            In today's digital landscape, your online presence isn't just a
            business card. it's your most powerful growth engine.
          </p>
        </div>

        <div class="hero__cta">
          <Button tag="a" href="/link">Link Button</Button>
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

let splitInstance = null;
let currentTween = null;
let currentTargets = null;

const setViewportHeight = () => {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
};

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const isPreloaderHidden = () => {
  const preloader = document.getElementById("preloader");
  return (
    !preloader ||
    preloader.getAttribute("aria-hidden") === "true" ||
    getComputedStyle(preloader).display === "none"
  );
};

const cleanup = () => {
  currentTween?.kill();
  currentTween = null;
  currentTargets = null;

  // revert SplitText (restores original DOM)
  splitInstance?.revert?.();
  splitInstance = null;
};

const initSplitNow = () => {
  const gsap = window.gsap;
  const SplitText = window.SplitText;
  const CustomEase = window.CustomEase;

  if (!gsap || !SplitText || !headingRef.value) return;

  cleanup();

  // match CodePen
  gsap.registerPlugin(SplitText, CustomEase);

  if (CustomEase?.create) {
    CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");
  }

  // EXACT CodePen-style SplitText.create with mask:"lines"
  // (this is what gives the clean masked reveal)
  if (typeof SplitText.create === "function") {
    splitInstance = SplitText.create(headingRef.value, {
      type: "lines, words, chars",
      mask: "lines",
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
    });
  } else {
    // fallback for older API (still works)
    splitInstance = new SplitText(headingRef.value, {
      type: "lines, words, chars",
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
    });
  }

  // Pre-position lines immediately so reveal can play instantly later (no lag)
  const targets = headingRef.value.querySelectorAll(".line");
  currentTargets = targets;
  gsap.set(targets, { yPercent: 110, force3D: true });
};

const animateLines = () => {
  const gsap = window.gsap;
  if (!gsap || !headingRef.value) return;

  if (prefersReducedMotion()) {
    gsap.set(headingRef.value, { clearProps: "all" });
    return;
  }

  // kill any previous tween like the pen
  if (currentTween) {
    currentTween.kill();
    gsap.set(currentTargets, { yPercent: 0 });
  }

  const targets = headingRef.value.querySelectorAll(".line");
  currentTargets = targets;

  // EXACT CodePen animation params for "lines"
  currentTween = gsap.fromTo(
    targets,
    { yPercent: 110 },
    { yPercent: 0, duration: 0.8, stagger: 0.08, ease: "osmo-ease" }
  );
};

const onPreloaderComplete = () => {
  // Play immediately when preloader ends (no extra waits)
  animateLines();
};

let resizeTimer = null;
const onResize = () => {
  setViewportHeight();

  // Rebuild split after resize so "lines" remain correct
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const gsap = window.gsap;
    const alreadyRevealed = currentTween && currentTween.progress() > 0;

    initSplitNow();

    // If user already saw the reveal, keep it visible (don’t replay)
    if (alreadyRevealed && gsap && headingRef.value) {
      const targets = headingRef.value.querySelectorAll(".line");
      gsap.set(targets, { yPercent: 0, clearProps: "transform" });
    }
  }, 120);
};

onMounted(() => {
  setViewportHeight();
  window.addEventListener("resize", onResize, { passive: true });

  // IMPORTANT: init immediately (no document.fonts.ready delay)
  // This removes the “preloader ends → pause → animation starts” lag.
  initSplitNow();

  if (isPreloaderHidden()) {
    animateLines();
  } else {
    window.addEventListener("preloaderComplete", onPreloaderComplete, { once: true });
  }

  // Optional: once fonts finish, rebuild split for perfect line breaks
  // (does NOT delay the first animation)
  document.fonts?.ready?.then(() => {
    const gsap = window.gsap;
    const wasRevealed = currentTween && currentTween.progress() > 0;

    initSplitNow();
    if (wasRevealed && gsap && headingRef.value) {
      gsap.set(headingRef.value.querySelectorAll(".line"), { yPercent: 0, clearProps: "transform" });
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  window.removeEventListener("preloaderComplete", onPreloaderComplete);
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
  /* responsive type */
  font-size: clamp(20px, 3.2vw, 28px);
  line-height: 1.35;
  font-weight: 300;
  margin: 0;

  /* responsive measure (line length) */
  max-width: 46ch;
  width: 100%;

  /* prevents overflow on narrow screens */
  overflow-wrap: anywhere;
  word-break: normal;

  /* if you want uppercase, keep it but tame spacing */
  text-transform: uppercase;
  letter-spacing: 0.03em;
}


/* Minimal styling needed for the Osmo-style line reveal.
   SplitText's mask:"lines" handles the masking wrapper creation. */
.hero :deep(.line) {
  display: block;
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
    max-width: 30ch;        /* better wraps on phones */
    line-height: 1.4;
    letter-spacing: 0.02em; /* slightly tighter for mobile */
  }
}

</style>
