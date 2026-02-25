<template>
  <section id="about" ref="aboutRef" class="about section" @pointerleave="handleSectionPointerLeave">
    <div class="shell">
      <div class="about__grid">
        <div class="about__visual" :class="{ 'is-media-hovered': isMediaHovered }">
          <a class="about__visual-link" href="/info" aria-label="Learn more about me" @click="handleVisualClick"
            @pointerenter="handleMediaPointerEnter($event)" @pointermove="handleMediaPointerMove($event)"
            @pointerleave="handleMediaPointerLeave" @pointercancel="handleMediaPointerLeave" @focus="handleMediaFocus"
            @blur="handleMediaBlur">
            <div ref="imageFrame" class="image-frame">
              <div ref="imageReveal" class="image-reveal">
                <video ref="imageEl" class="about__image" :src="videoReady ? profileImg : undefined" muted loop
                  :autoplay="videoReady" playsinline :preload="videoReady ? 'auto' : 'none'" aria-hidden="true"
                  role="presentation" tabindex="-1">
                  <track kind="captions" src="/captions/blank.vtt" srclang="en" label="English" default />
                </video>
                <div class="about__image-overlay" aria-hidden="true"></div>
              </div>
            </div>
            <span class="sr-only">Learn more about me</span>
          </a>
        </div>

        <div class="about__content">
          <RevealText tag="h2" class="about__heading" v-bind="revealProps">
            I build websites that work the way your business needs them to.
          </RevealText>

          <div class="philosophy">
            <RevealText tag="p" v-bind="revealProps">
              Your website either works for your business or against it. There's no middle ground.
              I'm Jalal, software engineer and web designer from Rabat. I build the whole thing. Design, code, the
              systems underneath. Sites that scale when your business does and don't break when something changes.
              Most developers disappear after launch. I don't.
            </RevealText>
          </div>

          <div ref="ctaRef" class="cta-wrapper">
            <span class="mask">
              <span class="reveal">
                <Button tag="a" href="#" :data-mailto="mailtoEncoded" width="clamp(280px, 100%, 500px)"
                  height="clamp(58px, 3.6vw, 84px)" fontSize="clamp(15px, 1.15vw, 19px)"
                  paddingX="clamp(32px, 2.6vw, 56px)" paddingY="0px" font-weight="600">
                  Let's Build Something Great
                </Button>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div ref="cursorRef" class="about__cursor" :class="{ 'is-visible': cursorVisible }" aria-hidden="true">
      <span class="about__cursor-chip">
        <span class="about__cursor-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </span>
      </span>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import Button from "../base/Button.vue";
import RevealText from "../base/RevealText.vue";
import profileVideo from "../../assets/videos/footage.mp4";

const router = useRouter();

const mailtoEncoded =
  "&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#106;&#97;&#108;&#97;&#108;&#101;&#100;&#100;&#105;&#110;&#101;&#109;&#97;&#111;&#117;&#107;&#105;&#108;&#64;&#103;&#109;&#97;&#105;&#108;&#46;&#99;&#111;&#109;";

const profileImg = typeof profileVideo === "string" ? profileVideo : profileVideo.src;
const revealProps = {
  splitReveal: "lines",
  ease: "power3.out",
  start: "top 85%",
};

const ensurePlugins = () => {
  if (typeof window === "undefined") return null;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap) return null;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
};

const registerScrollTrigger = () => ensurePlugins();

const aboutRef = ref(null);
const imageFrame = ref(null);
const imageReveal = ref(null);
const imageEl = ref(null);
const ctaRef = ref(null);
const videoReady = ref(false);
const cursorRef = ref(null);
const isMediaHovered = ref(false);
const cursorVisible = ref(false);
const cursorEnabled = ref(false);

let ctx = null;
let resizeTimer = null;
let videoObserver = null;
let hasRevealed = false;
let cursorRaf = 0;
let cursorRunning = false;
let cursorHalf = 0;
const CURSOR_EASE = 0.16;
const cursorTarget = { x: -200, y: -200 };
const cursorCurrent = { x: -200, y: -200 };

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    window.matchMedia?.("(pointer: coarse)")?.matches ||
    navigator.connection?.saveData === true ||
    (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4) ||
    (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4));

const showAll = () => {
  if (!aboutRef.value) return;
  const pack = ensurePlugins();
  if (!pack) return;
  const { gsap } = pack;
  gsap.set([imageFrame.value, imageReveal.value, imageEl.value], { clearProps: "all" });
};

const scheduleScrollRefresh = () => {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    ensurePlugins()?.ScrollTrigger?.refresh?.();
    window.__lenis?.resize?.();
    window.dispatchEvent(new Event("content:loaded"));
  });
};

const applyCursorTransform = () => {
  const el = cursorRef.value;
  if (!el) return;
  el.style.transform = `translate3d(${cursorCurrent.x}px, ${cursorCurrent.y}px, 0)`;
};

const stopCursorLoop = () => {
  if (!cursorRaf) return;
  cancelAnimationFrame(cursorRaf);
  cursorRaf = 0;
  cursorRunning = false;
};

const runCursor = () => {
  const dx = cursorTarget.x - cursorCurrent.x;
  const dy = cursorTarget.y - cursorCurrent.y;
  cursorCurrent.x += dx * CURSOR_EASE;
  cursorCurrent.y += dy * CURSOR_EASE;
  applyCursorTransform();

  const settled = Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1;
  if (cursorVisible.value || !settled) {
    cursorRaf = requestAnimationFrame(runCursor);
  } else {
    stopCursorLoop();
  }
};

const ensureCursorLoop = () => {
  if (cursorRunning) return;
  cursorRunning = true;
  cursorRaf = requestAnimationFrame(runCursor);
};

const updateCursorMetrics = () => {
  const el = cursorRef.value;
  cursorHalf = el ? el.getBoundingClientRect().width / 2 : 0;
};

const updateCursorCapability = () => {
  if (typeof window === "undefined") return;
  const finePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  cursorEnabled.value = !!finePointer && !reducedMotion;
  if (!cursorEnabled.value) {
    cursorVisible.value = false;
    stopCursorLoop();
  }
};

const setCursorTargetFromEvent = (event) => {
  cursorTarget.x = event.clientX - cursorHalf;
  cursorTarget.y = event.clientY - cursorHalf;
};

const handleVisualClick = (event) => {
  event?.preventDefault?.();
  router.push("/info");
};

const handleMediaPointerEnter = (event) => {
  isMediaHovered.value = true;
  if (!cursorEnabled.value) return;
  setCursorTargetFromEvent(event);
  cursorCurrent.x = cursorTarget.x;
  cursorCurrent.y = cursorTarget.y;
  applyCursorTransform();
  cursorVisible.value = true;
};

const handleMediaPointerMove = (event) => {
  isMediaHovered.value = true;
  if (!cursorEnabled.value) return;
  setCursorTargetFromEvent(event);
  ensureCursorLoop();
};

const handleMediaPointerLeave = () => {
  isMediaHovered.value = false;
  if (!cursorEnabled.value) return;
  cursorVisible.value = false;
  ensureCursorLoop();
};

const handleMediaFocus = () => {
  isMediaHovered.value = true;
};

const handleMediaBlur = () => {
  isMediaHovered.value = false;
};

const handleSectionPointerLeave = () => {
  isMediaHovered.value = false;
  if (!cursorEnabled.value) return;
  cursorVisible.value = false;
  ensureCursorLoop();
};

const warmVideo = async () => {
  if (videoReady.value) return;
  videoReady.value = true;
  await nextTick();
  imageEl.value?.load?.();
  imageEl.value?.play?.().catch(() => { });
  videoObserver?.disconnect();
  videoObserver = null;
  scheduleScrollRefresh();
};

const scheduleWarmVideo = () => {
  if (typeof window === "undefined") return;
  const start = () => {
    void warmVideo();
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(start, { timeout: 1500 });
  } else {
    window.setTimeout(start, 250);
  }
};

const waitForGsap = async (timeoutMs = 2000) => {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    const pack = ensurePlugins();
    if (pack?.gsap && pack?.SplitText && pack?.ScrollTrigger) return pack;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return ensurePlugins();
};

const buildAnimation = async () => {
  ctx?.revert();
  ctx = null;

  if (prefersReducedMotion()) {
    showAll();
    return;
  }

  await nextTick();

  registerScrollTrigger();
  const pack = await waitForGsap();
  const hasST = !!pack?.gsap?.core?.globals?.().ScrollTrigger;
  if (!hasST) {
    showAll();
    return;
  }

  const { gsap, ScrollTrigger } = pack;
  if (!ScrollTrigger) {
    showAll();
    return;
  }

  ctx = gsap.context(() => {
    const root = aboutRef.value;
    if (!root) return;
    const ctaReveal = ctaRef.value?.querySelector(".reveal");
    if (imageEl.value) {
      gsap.set(imageEl.value, { force3D: true, transformOrigin: "50% 50%" });
    }
    const setFinal = () => {
      if (imageFrame.value) gsap.set(imageFrame.value, { opacity: 1, yPercent: 0 });
      if (imageReveal.value) gsap.set(imageReveal.value, { clipPath: "inset(0 0 0% 0)" });
      if (imageEl.value) gsap.set(imageEl.value, { scale: 1, yPercent: 0 });
      if (ctaReveal) gsap.set(ctaReveal, { yPercent: 0 });
    };

    if (hasRevealed) {
      setFinal();
    }

    const tl = hasRevealed
      ? null
      : gsap.timeline({
        scrollTrigger: {
          trigger: root,
          scroller: window,
          start: "top 70%",
          end: "bottom 20%",
          once: true,
          invalidateOnRefresh: true,
        },
        onComplete: () => {
          hasRevealed = true;
        },
      });

    if (tl && imageFrame.value && imageReveal.value && imageEl.value) {
      tl.from(
        imageFrame.value,
        { opacity: 0, yPercent: 6, duration: 0.9, ease: "power3.out" },
        0
      )
        .fromTo(
          imageReveal.value,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0 0 0% 0)", duration: 1.0, ease: "power3.out" },
          0.1
        )
        .from(
          imageEl.value,
          { scale: 1.12, duration: 1.2, ease: "power3.out" },
          0.1
        );
    }

    if (tl && ctaReveal) {
      tl.from(
        ctaReveal,
        { yPercent: 120, duration: 0.75, ease: "power3.out" },
        0.85
      );
    }

    if (imageEl.value) {
      const parallaxAmount = window.innerWidth > 991 ? 6 : 3;
      gsap.fromTo(
        imageEl.value,
        { yPercent: parallaxAmount },
        {
          yPercent: -parallaxAmount,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            scroller: window,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
          overwrite: "auto",
        }
      );
    }
  }, aboutRef.value);
};

const onResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    updateCursorCapability();
    updateCursorMetrics();
    void buildAnimation();
    const st = ensurePlugins()?.ScrollTrigger;
    st?.refresh?.();
  }, 200);
};

onMounted(() => {
  updateCursorCapability();
  nextTick(() => {
    updateCursorMetrics();
    applyCursorTransform();
  });
  scheduleWarmVideo();

  if (typeof window !== "undefined" && "IntersectionObserver" in window) {
    videoObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void warmVideo();
        }
      },
      { rootMargin: "480px 0px", threshold: 0.1 }
    );

    if (aboutRef.value) videoObserver.observe(aboutRef.value);
  } else {
    void warmVideo();
  }

  imageEl.value?.addEventListener?.(
    "loadeddata",
    () => {
      scheduleScrollRefresh();
    },
    { once: true }
  );

  void buildAnimation();
  window.addEventListener("resize", onResize, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  clearTimeout(resizeTimer);
  stopCursorLoop();

  videoObserver?.disconnect();
  videoObserver = null;

  ctx?.revert();
  ctx = null;

  const st = ensurePlugins()?.ScrollTrigger;
  st?.getAll?.().forEach((t) => {
    const trg = t?.vars?.trigger;
    if (trg === aboutRef.value) t.kill(true);
  });
});
</script>

<style scoped>
.about {
  position: relative;
  align-items: center;
  justify-items: center;
  z-index: 10;
  background: var(--color-white);
  color: var(--color-ink);
  overflow: hidden;
}

.about__cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;
  pointer-events: none;
  transform: translate3d(-200px, -200px, 0);
  opacity: 0;
  transition: opacity 0.2s ease;
  will-change: transform, opacity;
}

.about__cursor.is-visible {
  opacity: 1;
}

.about__cursor-chip {
  width: clamp(2rem, 5vw, 3.1rem);
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  border-radius: 0.3rem;
  border: 0.8px solid rgba(237, 237, 237, 0.15);
  background: rgba(5, 5, 5, 0.78);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  transform: scale(0.9);
  transition: transform 0.22s ease;
}

.about__cursor.is-visible .about__cursor-chip {
  transform: scale(1);
}

.about__cursor-icon {
  width: 1.15rem;
  height: 1.15rem;
  opacity: 0;
  transition: opacity 0.16s ease;
}

.about__cursor-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.about__cursor-icon path {
  stroke: var(--color-white);
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.about__cursor.is-visible .about__cursor-icon {
  opacity: 1;
}

.about>.shell {
  padding-left: 30px;
  padding-right: 30px;
  max-width: var(--size-container);
}

.about__grid {
  display: grid;
  grid-template-columns: 50% 50%;
  gap: clamp(3rem, 5vw, 7rem);
  align-items: center;
}

.mask {
  display: block;
  overflow: hidden;
}

.reveal {
  display: inline-block;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

.about :deep(.line) {
  display: block;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

.about :deep(.btn-animate-chars) {
  --color-cta-bg: var(--color-bg);
  --color-ink: var(--color-white);
}

.philosophy .reveal {
  display: inline;
}

.about__visual {
  position: relative;
  height: 100%;
  align-self: stretch;
}

.about__visual-link {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.image-frame {
  position: sticky;
  top: clamp(80px, 12vh, 120px);
  width: 100%;
  height: 100%;
  min-height: clamp(620px, 72vh, 920px);
  will-change: transform, opacity;
}

.image-reveal {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--color-white);
  will-change: transform;
  transform-origin: bottom;
  clip-path: inset(0 0 0 0);
  will-change: transform, clip-path;
}

.about__image {
  position: absolute;
  inset: -10% 0;
  width: 125%;
  height: 125%;
  object-fit: cover;
  display: block;
  will-change: transform;
  backface-visibility: hidden;
  transform-origin: center;
}

.about__image-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: rgba(0, 0, 0, 0.34);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.24s ease;
}

.about__visual.is-media-hovered .about__image-overlay {
  opacity: 1;
}


.about__content {
  display: flex;
  flex-direction: column;
  gap: clamp(3rem, 5vw, 6rem);
  padding-block: clamp(3rem, 5vw, 6rem);
  max-width: 760px;
}

.about__heading {
  font-family: var(--font-main);
  font-size: clamp(1.8rem, 2.1vw, 2.9rem);
  line-height: 1.2;
  text-transform: uppercase;
  font-weight: 400;
  margin: 0;
  letter-spacing: var(--tracking-display);
  color: var(--color-ink);
}

.philosophy {
  max-width: 640px;
}

.philosophy p {
  font-size: clamp(1.15rem, 1.05rem + 0.35vw, 1.5rem);
  line-height: var(--lh-relaxed);
  font-weight: 400;
  color: rgba(0, 0, 0, 0.7);
  margin: 0;
  letter-spacing: var(--tracking-body);
}


.cta-wrapper {
  margin-top: clamp(0.5rem, 1vw, 1rem);
}


@media screen and (min-width: 1440px) {
  .about>.shell {
    padding-left: clamp(36px, 2.8vw, 64px);
    padding-right: clamp(36px, 2.8vw, 64px);
  }
}


@media screen and (max-width: 991px) {
  .about>.shell {
    padding-left: var(--gutter);
    padding-right: var(--gutter);
  }

  .about__grid {
    grid-template-columns: 1fr;
    gap: clamp(3rem, 6vw, 5rem);
  }

  .about__visual {
    min-height: clamp(450px, 55vh, 600px);
    align-self: auto;
  }

  .image-frame {
    position: relative;
    top: 0;
    height: clamp(450px, 55vh, 600px);
    min-height: auto;
  }

  .about__content {
    padding-block: 0;
    max-width: 100%;
  }
}

@media screen and (max-width: 767px) {
  .about__heading {
    font-size: var(--text-lg);
  }
}

@media screen and (max-width: 479px) {
  .about__content {
    gap: clamp(2rem, 4vw, 2.5rem);
    padding-block: clamp(2rem, 4vw, 2.5rem);
  }

  .philosophy p {
    font-size: clamp(1rem, 1.8vw, 1.0625rem);
    line-height: 1.7;
  }
}

@media (hover: none),
(pointer: coarse),
(prefers-reduced-motion: reduce) {
  .about__cursor {
    display: none;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}


@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
