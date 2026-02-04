<template>
  <section id="work" class="work section">
    <div class="shell">
      <RevealText tag="h2" :scroll="true" class="work__heading">
        Featured Work
      </RevealText>
    </div>

    <div class="work__panels">
      <article
        v-for="(item, idx) in items"
        :key="item.src"
        class="work__panel"
        :ref="(el) => setPanelRef(el, idx)"
        @pointermove="(e) => onPointerMove(e, idx)"
        @pointerenter="() => onPointerEnter(idx)"
        @pointerleave="() => onPointerLeave(idx)"
      >
        <div class="work__bg">
          <img
            :ref="(el) => setBgRef(el, idx)"
            class="work__bg-img"
            :src="item.bg"
            :alt="item.title"
            loading="lazy"
            decoding="async"
          />
        </div>
        <a class="work__link" :href="item.href" :aria-label="item.title">
          <div class="work__meta work__meta--left">{{ item.title }}</div>
          <div class="work__meta work__meta--right">
            <span class="work__meta-mark">↳</span>
            <span class="work__meta-copy">{{ item.description }}</span>
          </div>
          <div class="work__media" :ref="(el) => setMediaRef(el, idx)">
            <video
              :ref="(el) => setImageRef(el, idx)"
              class="work__video"
              :src="item.src"
              :aria-label="item.alt"
              autoplay
              loop
              muted
              playsinline
              preload="metadata"
            ></video>
          </div>
          <div class="work__hover" :ref="(el) => setHoverRef(el, idx)">
            <span class="work__hover-dot"></span>
            <span class="work__hover-label">View Project</span>
          </div>
        </a>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import RevealText from "../base/RevealText.vue";
import projectVideo from "../../assets/videos/projects/noiriv.mp4";
import profileImage from "../../assets/images/profile.webp";

const videoSrc = typeof projectVideo === "string" ? projectVideo : projectVideo.src;
const bgSrc = typeof profileImage === "string" ? profileImage : profileImage.src;
const items = [
  {
    src: videoSrc,
    bg: bgSrc,
    alt: "Featured work visual 1",
    title: "StringTune",
    description: "StringTune is a modular JS library for quick, flexible use of animations and hooks — combine, tweak, or craft your own effects.",
    href: "/works",
  },
  {
    src: videoSrc,
    bg: bgSrc,
    alt: "Featured work visual 2",
    title: "Featured Work 2",
    description: "A cinematic product story and interaction layer built for performance.",
    href: "/works",
  },
  {
    src: videoSrc,
    bg: bgSrc,
    alt: "Featured work visual 3",
    title: "Featured Work 3",
    description: "A bold brand system and immersive experience design.",
    href: "/works",
  },
];

const panels = ref([]);
const images = ref([]);
const hovers = ref([]);
const hoverX = ref([]);
const hoverY = ref([]);
const medias = ref([]);
const bgImages = ref([]);
let resizeTimer = null;
let resizeHandler = null;

const setPanelRef = (el, idx) => {
  if (!el) return;
  panels.value[idx] = el;
};

const setImageRef = (el, idx) => {
  if (!el) return;
  images.value[idx] = el;
};

const setMediaRef = (el, idx) => {
  if (!el) return;
  medias.value[idx] = el;
};

const setBgRef = (el, idx) => {
  if (!el) return;
  bgImages.value[idx] = el;
};

const setHoverRef = (el, idx) => {
  if (!el) return;
  hovers.value[idx] = el;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const ensurePlugins = () => {
  if (typeof window === "undefined") return null;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap) return null;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
};

const buildParallax = () => {
  const pack = ensurePlugins();
  if (!pack) return;
  const { gsap, ScrollTrigger } = pack;
  if (!ScrollTrigger) return;

  ScrollTrigger.getAll().forEach((t) => {
    if (t?.vars?.id === "work-parallax") t.kill(true);
  });

  if (prefersReducedMotion()) {
    gsap.set(images.value.filter(Boolean), { clearProps: "transform" });
    return;
  }

  panels.value.forEach((panel, idx) => {
    const bg = bgImages.value[idx];
    const media = medias.value[idx];
    if (!panel || !bg || !media) return;

    const amount = Math.round(window.innerHeight * 0.08);
    gsap.fromTo(
      bg,
      { y: -amount, scale: 1.05 },
      {
        y: amount,
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          id: "work-parallax",
          trigger: panel,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      }
    );

    gsap.fromTo(
      media,
      { y: -amount * 0.4 },
      {
        y: amount * 0.4,
        ease: "none",
        scrollTrigger: {
          id: "work-parallax",
          trigger: panel,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      }
    );
  });
};

const onPointerMove = (event, idx) => {
  const hoverEl = hovers.value[idx];
  const panel = panels.value[idx];
  if (!hoverEl || !panel) return;
  const rect = panel.getBoundingClientRect();
  const x = event.clientX - rect.left + 16;
  const y = event.clientY - rect.top + 16;
  hoverX.value[idx]?.(x);
  hoverY.value[idx]?.(y);
};

const onPointerLeave = (idx) => {
  const hoverEl = hovers.value[idx];
  const pack = ensurePlugins();
  if (!hoverEl || !pack?.gsap) return;
  const { gsap } = pack;
  gsap.to(hoverEl, { autoAlpha: 0, duration: 0.2, ease: "power2.out" });
};

const onPointerEnter = (idx) => {
  const hoverEl = hovers.value[idx];
  const pack = ensurePlugins();
  if (!hoverEl || !pack?.gsap) return;
  const { gsap } = pack;
  gsap.set(hoverEl, { autoAlpha: 0 });
  gsap.to(hoverEl, { autoAlpha: 1, duration: 0.2, ease: "power2.out" });
  const dot = hoverEl.querySelector(".work__hover-dot");
  const label = hoverEl.querySelector(".work__hover-label");
  if (dot && label) {
    gsap.fromTo(
      [dot, label],
      { y: 6, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.25, stagger: 0.06, ease: "power3.out" }
    );
  }
};

onMounted(() => {
  const pack = ensurePlugins();
  hovers.value.forEach((hover, idx) => {
    if (!hover) return;
    if (!pack?.gsap) return;
    pack.gsap.set(hover, { xPercent: 0, yPercent: 0 });
    hoverX.value[idx] = pack.gsap.quickTo(hover, "x", { duration: 0.16, ease: "power3.out" });
    hoverY.value[idx] = pack.gsap.quickTo(hover, "y", { duration: 0.16, ease: "power3.out" });
  });
  buildParallax();
  resizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildParallax();
      ensurePlugins()?.ScrollTrigger?.refresh?.();
    }, 150);
  };
  window.addEventListener("resize", resizeHandler, { passive: true });
});

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  clearTimeout(resizeTimer);
  const st = ensurePlugins()?.ScrollTrigger;
  st?.getAll?.().forEach((t) => {
    if (t?.vars?.id === "work-parallax") t.kill(true);
  });
});
</script>

<style scoped>
.work {
  position: relative;
  z-index: 10;
  background: var(--color-surface);
  color: var(--color-white);
  padding-block: clamp(4rem, 8vw, 8rem);
}

.work__heading {
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  line-height: 1;
  margin: 0 0 clamp(2rem, 5vw, 4rem);
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.work__panels {
  display: flex;
  flex-direction: column;
  gap: clamp(3rem, 6vw, 6rem);
}

.work__panel {
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.work__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.work__bg-img {
  width: 100%;
  height: 110%;
  object-fit: cover;
  display: block;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.work__link {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.work__meta {
  position: absolute;
  color: #fff;
  font-size: clamp(0.95rem, 1.8vw, 1.1rem);
  font-weight: 400;
  letter-spacing: 0.02em;
}

.work__meta--left {
  top: clamp(1.5rem, 4vw, 2.5rem);
  left: clamp(1.5rem, 4vw, 3rem);
}

.work__meta--right {
  top: clamp(1.5rem, 4vw, 2.5rem);
  right: clamp(1.5rem, 4vw, 3rem);
  max-width: min(36vw, 360px);
  display: flex;
  gap: 0.5rem;
  line-height: 1.45;
  font-size: clamp(0.85rem, 1.4vw, 1rem);
  opacity: 0.85;
}

.work__meta-mark {
  flex: 0 0 auto;
}

.work__meta-copy {
  flex: 1 1 auto;
}

.work__media {
  position: relative;
  width: min(68vw, 900px);
  aspect-ratio: 16 / 9;
  background: rgba(10, 10, 10, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.45),
    0 6px 18px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.work__hover {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.work__hover-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: #fff;
  display: inline-block;
  margin-right: 0.6rem;
}

.work__hover-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.4rem;
  border-radius: 999px;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: #fff;
  color: #000;
  transform: translate3d(0, 0, 0);
  transition: transform 0.35s ease;
}

.work__panel:hover .work__hover-label {
  transform: translate3d(0, 0, 0) scale(1.02);
}

.work__panel:hover .work__hover {
  opacity: 1;
}

.work__media img,
.work__media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  display: block;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

@media (max-width: 767px) {
  .work__heading {
    margin-bottom: clamp(1.5rem, 6vw, 2.5rem);
  }

  .work__media {
    width: min(88vw, 520px);
    aspect-ratio: 4 / 3;
  }

  .work__meta--right {
    max-width: 60vw;
  }
}
</style>
