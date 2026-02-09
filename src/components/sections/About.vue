<!-- src/components/About.vue -->
<template>
  <section id="about" ref="aboutRef" class="about section">
    <div class="shell">
      <div class="about__grid">
        <!-- Left: Image -->
        <div class="about__visual">
          <div ref="imageFrame" class="image-frame">
            <div ref="imageReveal" class="image-reveal">
              <video
                ref="imageEl"
                class="about__image"
                :src="videoReady ? profileImg : undefined"
                muted
                loop
                :autoplay="videoReady"
                playsinline
                :preload="videoReady ? 'metadata' : 'none'"
                aria-hidden="true"
                role="presentation"
                tabindex="-1"
              >
                <track kind="captions" src="/captions/blank.vtt" srclang="en" label="English" default />
              </video>
            </div>
          </div>
        </div>

        <!-- Right: Content -->
        <div class="about__content">
          <!-- Heading (masked reveal) -->
          <RevealText tag="h2" class="about__heading" v-bind="revealProps">
            I design and engineer web applications that evolve with your business.
            Clean architecture. Solid foundations. Built to scale.
          </RevealText>

          <!-- Philosophy (masked reveal) -->
          <div class="philosophy">
            <RevealText tag="p" v-bind="revealProps">
              As a software engineer and web designer, I focus on clean architecture, performance, and usability because
              great websites should work flawlessly and feel effortless to use. I love web development for its unique
              ability to turn logic into experience, where code directly shapes how people interact with a brand.
            </RevealText>
          </div>

          <!-- CTA (masked reveal) -->
          <div ref="ctaRef" class="cta-wrapper">
            <span class="mask">
              <span class="reveal">
                <Button
                  tag="a"
                  href="#" :data-mailto="mailtoEncoded"
                  width="clamp(280px, 100%, 420px)"
                  height="clamp(56px, 4vw, 72px)"
                  fontSize="clamp(14px, 1.8vw, 16px)"
                  paddingX="clamp(32px, 3vw, 48px)"
                  paddingY="0px"
                  font-weight="600"
                >
                  Let's Build Something Great
                </Button>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import Button from "../base/Button.vue";
import RevealText from "../base/RevealText.vue";
import profileVideo from "../../assets/videos/footage.mp4";

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

let ctx = null;
let resizeTimer = null;
let videoObserver = null;

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

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        scroller: window,
        start: "top 70%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });

    // Image reveal
    if (imageFrame.value && imageReveal.value && imageEl.value) {
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
          { scale: 1.12, yPercent: 6, duration: 1.2, ease: "power3.out" },
          0.1
        );
    }

    // CTA
    if (ctaReveal) {
      tl.from(
        ctaReveal,
        { yPercent: 120, duration: 0.75, ease: "power3.out" },
        0.85
      );
    }

    // Parallax on image
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
        }
      );
    }
  }, aboutRef.value);
};

const onResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    void buildAnimation();
    const st = ensurePlugins()?.ScrollTrigger;
    st?.refresh?.();
  }, 200);
};

onMounted(() => {
  if (typeof window !== "undefined" && "IntersectionObserver" in window) {
    videoObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          videoReady.value = true;
          imageEl.value?.play?.().catch(() => {});
          scheduleScrollRefresh();
          videoObserver?.disconnect();
          videoObserver = null;
        }
      },
      { rootMargin: "500px 0px", threshold: 0.1 }
    );

    if (aboutRef.value) videoObserver.observe(aboutRef.value);
  } else {
    videoReady.value = true;
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
  z-index: 10;
  background: var(--color-white);
  color: var(--color-ink);
  overflow: hidden;
}

.about > .shell {
  padding-left: 30px;
  padding-right: 30px;
  max-width: var(--size-container);
}

.about__grid {
  display: grid;
  grid-template-columns: 40% 60%;
  gap: clamp(3rem, 6vw, 6rem);
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

.philosophy .reveal {
  display: inline;
}

.about__visual {
  position: relative;
  height: 100%;
  align-self: stretch;
}

.image-frame {
  position: sticky;
  top: clamp(80px, 12vh, 120px);
  width: 100%;
  height: 100%;
  min-height: clamp(600px, 70vh, 800px);
  will-change: transform, opacity;
}

.image-reveal {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f5f5;
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
}


.about__content {
  display: flex;
  flex-direction: column;
  gap: clamp(3rem, 6vw, 5rem);
  padding-block: clamp(3rem, 6vw, 5rem);
  max-width: 680px;
}

.about__heading {
  font-family: var(--font-main);
  font-size: var(--text-xl);
  line-height: 1.2;
  text-transform: uppercase;
  font-weight: 400;
  margin: 0;
  letter-spacing: var(--tracking-display);
  color: var(--color-ink);
}

/* Philosophy */
.philosophy {
  max-width: 580px;
}

.philosophy p {
  font-size: var(--text-base);
  line-height: var(--lh-relaxed);
  font-weight: 400;
  color: rgba(0, 0, 0, 0.7);
  margin: 0;
  letter-spacing: var(--tracking-body);
}

/* Skills */
/* CTA */
.cta-wrapper {
  margin-top: clamp(0.5rem, 1vw, 1rem);
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media screen and (max-width: 991px) {
  .about > .shell {
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


@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
