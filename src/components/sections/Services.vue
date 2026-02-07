<template>
  <section id="services" class="services section">
    <div class="shell">
      <div class="services__intro">
        <h2
          class="services__heading"
          data-split="heading"
          data-split-reveal="lines"
          aria-label="Senior-level execution that converts global decision-makers."
        >
What I do  </h2>
        <p
          class="services__subhead"
          data-split="heading"
          data-split-reveal="lines"
        >
          Strategy, design, and engineering in one loop. Cohesive products,
          clean systems, and outcomes you can measure.
        </p>
     
      </div>
    </div>

    <div class="services__list">
      <article
        v-for="(service, idx) in services"
        :key="service.id"
        class="service"
        :style="{
          '--stack-index': idx,
          '--stack-total': services.length,
        }"
        :ref="(el) => setCardRef(el, idx)"
      >
        <div class="shell service__inner">
          <div class="service__content" :ref="(el) => setContentRef(el, idx)">
            <p
              class="service__eyebrow"
              data-split="heading"
              data-split-reveal="words"
            >
              {{ service.subtitle }}
            </p>
            <h3
              class="service__title"
              data-split="heading"
              data-split-reveal="lines"
              :aria-label="service.title"
            >
              {{ service.title }}
            </h3>
            <p
              class="service__desc"
              data-split="heading"
              data-split-reveal="lines"
            >
              {{ service.description }}
            </p>
          </div>

          <div class="service__media" :ref="(el) => setMediaWrapRef(el, idx)">
            <img
              :ref="(el) => setMediaImageRef(el, idx)"
              class="service__image"
              :src="service.imageSrc"
              :alt="service.imageAlt"
              loading="lazy"
              decoding="async"
            />
            <div class="service__media-shade" aria-hidden="true"></div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from "vue";
import primaryImage from "../../assets/images/about-jalal-eddine-image.webp";
import secondaryImage from "../../assets/images/profile.webp";

const primarySrc =
  typeof primaryImage === "string" ? primaryImage : primaryImage.src;
const secondarySrc =
  typeof secondaryImage === "string" ? secondaryImage : secondaryImage.src;

const services = [
  {
    id: 1,
    title: "Web Development & Design",
    subtitle: "Digital products people actually use",
    description:
      "Interfaces that feel intuitive. Backends that handle growth. Design decisions that drive conversions. I build web applications from concept to launch. No handoffs, no miscommunication, just cohesive products that work.",
    imageSrc: primarySrc,
    imageAlt: "Web Development & Design showcase",
  },
  {
    id: 2,
    title: "Cloud Solutions",
    subtitle: "Infrastructure that scales with you",
    description:
      "Real-time data processing. Serverless architectures. Systems that grow without the growing pains. Your infrastructure should enable your business, not slow it down.",
    imageSrc: secondarySrc,
    imageAlt: "Cloud Solutions infrastructure",
  },
  {
    id: 3,
    title: "Performance & Optimization",
    subtitle: "Speed that converts",
    description:
      "Fast load times. Clean code. Better user experience. I turn slow, bloated applications into lean, efficient ones. 30% faster isn't luck it's intentional optimization.",
    imageSrc: primarySrc,
    imageAlt: "Performance & Optimization metrics",
  },
];

const cards = ref([]);
const contentBlocks = ref([]);
const mediaWraps = ref([]);
const mediaImages = ref([]);
let resizeTimer = null;
let resizeHandler = null;
let splitInstances = [];

const setCardRef = (el, idx) => {
  if (!el) return;
  cards.value[idx] = el;
};

const setContentRef = (el, idx) => {
  if (!el) return;
  contentBlocks.value[idx] = el;
};

const setMediaWrapRef = (el, idx) => {
  if (!el) return;
  mediaWraps.value[idx] = el;
};

const setMediaImageRef = (el, idx) => {
  if (!el) return;
  mediaImages.value[idx] = el;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const ensurePlugins = () => {
  if (typeof window === "undefined") return null;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const SplitText = window.SplitText;
  if (!gsap) return null;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);
  return { gsap, ScrollTrigger, SplitText };
};

// SplitText configuration
const splitConfig = {
  lines: { duration: 0.8, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 },
};

const initMaskTextScrollReveal = () => {
  const pack = ensurePlugins();
  if (!pack || !pack.SplitText) return;
  const { gsap, SplitText } = pack;

  // Clean up old instances
  splitInstances.forEach((instance) => {
    if (instance && instance.revert) instance.revert();
  });
  splitInstances = [];

  if (prefersReducedMotion()) return;

  document.querySelectorAll('[data-split="heading"]').forEach((heading) => {
    // Show element before animating (prevents FOUC)
    gsap.set(heading, { autoAlpha: 1 });

    // Find the split type, default is 'lines'
    const type = heading.dataset.splitReveal || "lines";
    const typesToSplit =
      type === "lines"
        ? ["lines"]
        : type === "words"
          ? ["lines", "words"]
          : ["lines", "words", "chars"];

    // Split the text
    const instance = SplitText.create(heading, {
      type: typesToSplit.join(", "),
      mask: "lines",
      autoSplit: true,
      linesClass: "line",
      wordsClass: "word",
      charsClass: "letter",
      onSplit: function (splitInstance) {
        const targets = splitInstance[type];
        const config = splitConfig[type];

        return gsap.from(targets, {
          yPercent: 110,
          duration: config.duration,
          stagger: config.stagger,
          ease: "expo.out",
          scrollTrigger: {
            trigger: heading,
            start: "clamp(top 85%)",
            once: true,
          },
        });
      },
    });

    splitInstances.push(instance);
  });
};

const buildParallaxAnimations = () => {
  const pack = ensurePlugins();
  if (!pack) return;
  const { gsap, ScrollTrigger } = pack;
  if (!ScrollTrigger) return;

  // Kill old parallax triggers
  ScrollTrigger.getAll().forEach((t) => {
    if (String(t?.vars?.id || "").startsWith("services-")) {
      t.kill(true);
    }
  });

  if (prefersReducedMotion()) {
    gsap.set(mediaImages.value.filter(Boolean), { clearProps: "all" });
    gsap.set(contentBlocks.value.filter(Boolean), { clearProps: "all" });
    return;
  }

  cards.value.forEach((card, idx) => {
    const media = mediaImages.value[idx];
    const mediaWrap = mediaWraps.value[idx];
    const content = contentBlocks.value[idx];
    if (!card || !media || !mediaWrap) return;

    if (content) {
      gsap.fromTo(
        content,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            id: `services-reveal-${idx}`,
            trigger: card,
            start: "top 75%",
            once: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }

    gsap.fromTo(
      mediaWrap,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.0,
        ease: "power3.out",
        scrollTrigger: {
          id: `services-media-${idx}`,
          trigger: card,
          start: "top 80%",
          once: true,
          invalidateOnRefresh: true,
        },
      }
    );

    gsap.fromTo(
      media,
      { yPercent: -12, scale: 1.08 },
      {
        yPercent: 12,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          id: `services-parallax-${idx}`,
          trigger: mediaWrap,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      }
    );
  });
};

onMounted(() => {
  nextTick(() => {
    // Wait for fonts to load before splitting
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        initMaskTextScrollReveal();
        buildParallaxAnimations();
      });
    } else {
      initMaskTextScrollReveal();
      buildParallaxAnimations();
    }
  });

  resizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      initMaskTextScrollReveal();
      buildParallaxAnimations();
      ensurePlugins()?.ScrollTrigger?.refresh?.();
    }, 160);
  };
  window.addEventListener("resize", resizeHandler, { passive: true });
});

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  clearTimeout(resizeTimer);

  // Clean up SplitText instances
  splitInstances.forEach((instance) => {
    if (instance && instance.revert) instance.revert();
  });
  splitInstances = [];

  const st = ensurePlugins()?.ScrollTrigger;
  st?.getAll?.().forEach((t) => {
    if (String(t?.vars?.id || "").startsWith("services-")) t.kill(true);
  });
});
</script>

<style scoped>
.services {
  position: relative;
  z-index: 10;
  background: var(--color-surface);
  color: var(--color-white);
}

.services__intro {
  max-width: clamp(320px, 100vw, 720px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(1rem, 2vw, 1.75rem);
}

[data-split="heading"] {
  visibility: hidden;
}

[data-split="heading"] {
  -webkit-text-rendering: optimizeSpeed;
  text-rendering: optimizeSpeed;
  -webkit-transform: translateZ(0);
  font-kerning: none;
}

.services__eyebrow {
  text-transform: uppercase;
  font-size: clamp(0.6rem, 1vw, 0.75rem);
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.services__heading {
  font-size: clamp(2.2rem, 5.6vw, 4.6rem);
  line-height: 1.05;
  margin: 0;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.services__subhead {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.72);
  margin: 0;
}

.services__list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: clamp(3rem, 8vw, 6rem);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.service {
  position: relative;
  padding-block: clamp(2.5rem, 6vw, 5rem);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.service__inner {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: stretch;
  gap: clamp(2rem, 5vw, 4.5rem);
}

.service__content {
  grid-column: span 5;
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.4rem);
  max-width: min(38rem, 100%);
}

.service__content .service__eyebrow {
  color: currentColor;
  opacity: 0.75;
}

.service__title {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1.2;
  margin: 0;
  text-transform: uppercase;
}

.service__desc {
  font-size: clamp(1rem, 1.6vw, 1.15rem);
  line-height: 1.7;
  margin: 0;
  opacity: 0.85;
}

.service__media {
  grid-column: span 7;
  position: relative;
  min-height: clamp(320px, 62vh, 720px);
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.service__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.service__media-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0));
  opacity: 0.8;
  pointer-events: none;
}

.service.is-light .service__media-shade {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0));
  opacity: 0.6;
}

@media (max-width: 991px) {
  .service__content,
  .service__media {
    grid-column: 1 / -1;
  }

  .service__content {
    order: 1;
  }

  .service__media {
    order: 2;
  }
}

@media (max-width: 767px) {
  .service__media {
    min-height: clamp(240px, 48vh, 420px);
    height: auto;
  }
}

/* Support for reduced motion */
@media (prefers-reduced-motion: reduce) {
  [data-split="heading"] {
    visibility: visible !important;
  }
}
</style>
