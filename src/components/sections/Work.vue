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
        :key="item._id || item.src || item.title"
        class="work__panel"
        :ref="(el) => setPanelRef(el, idx)"
      >
        <div class="work__bg">
          <img
            :ref="(el) => setBgRef(el, idx)"
            class="work__bg-img"
            :src="item.bg"
            :alt="item.title"
            width="1920"
            height="1080"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div class="work__meta work__meta--left">{{ item.title }}</div>
        <div class="work__meta work__meta--right">
          <span class="work__meta-mark">↳</span>
          <span class="work__meta-copy">{{ item.description }}</span>
        </div>
        <a
          class="work__media-link"
          :href="item.href"
          :aria-label="`Open ${item.title} live project`"
          @pointermove="onCursorMove"
          @pointerenter="onCursorEnter"
          @pointerleave="onCursorLeave"
          @focus="onCursorFocus"
          @blur="onCursorLeave"
        >
          <div class="work__media" :ref="(el) => setMediaRef(el, idx)">
            <video
              :ref="(el) => setImageRef(el, idx)"
              class="work__video"
              :src="item.src"
              :aria-label="item.alt || item.title"
              autoplay
              loop
              muted
              playsinline
              preload="metadata"
              loading="lazy"
            ></video>
          </div>
          <span class="work__cursor" aria-hidden="true">View</span>
        </a>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import RevealText from "../base/RevealText.vue";
import projectVideo from "../../assets/videos/projects/noiriv.mp4";
import bgOne from "../../assets/images/bg/bg-1.webp";
import bgTwo from "../../assets/images/bg/bg-2.webp";
import bgThree from "../../assets/images/bg/bg-3.webp";

const videoSrc = typeof projectVideo === "string" ? projectVideo : projectVideo.src;
const bgOneSrc = typeof bgOne === "string" ? bgOne : bgOne.src;
const bgTwoSrc = typeof bgTwo === "string" ? bgTwo : bgTwo.src;
const bgThreeSrc = typeof bgThree === "string" ? bgThree : bgThree.src;

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const fallbackItems = [
  {
    src: videoSrc,
    bg: bgOneSrc,
    alt: "Featured Web Design & Development work visual 1",
    title: "Noiriv",
    description: "Noiriv",
    href: "/works",
  },
  {
    src: videoSrc,
    bg: bgTwoSrc,
    alt: "Featured work visual 2",
    title: "Featured Work 2",
    description: "A cinematic product story and interaction layer built for performance.",
    href: "/works",
  },
  {
    src: videoSrc,
    bg: bgThreeSrc,
    alt: "Featured work visual 3",
    title: "Featured Work 3",
    description: "A bold brand system and immersive experience design.",
    href: "/works",
  },
];

const items = computed(() => (props.items?.length ? props.items : fallbackItems));

const panels = ref([]);
const images = ref([]);
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

const onCursorMove = (event) => {
  if (event.pointerType === "touch") return;
  const target = event.currentTarget;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const offset = 18;
  const x = event.clientX - rect.left + offset;
  const y = event.clientY - rect.top + offset;
  target.style.setProperty("--cursor-x", `${x.toFixed(2)}px`);
  target.style.setProperty("--cursor-y", `${y.toFixed(2)}px`);
};

const onCursorEnter = (event) => {
  if (event.pointerType === "touch") return;
  const target = event.currentTarget;
  if (!target) return;
  target.style.setProperty("--cursor-opacity", "1");
  const panel = target.closest(".work__panel");
  panel?.classList.add("is-hovered");
};

const onCursorLeave = (event) => {
  const target = event.currentTarget;
  if (!target) return;
  target.style.setProperty("--cursor-opacity", "0");
  target.style.setProperty("--cursor-x", "-999px");
  target.style.setProperty("--cursor-y", "-999px");
  const panel = target.closest(".work__panel");
  panel?.classList.remove("is-hovered");
};

const onCursorFocus = (event) => {
  const target = event.currentTarget;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const offset = 18;
  const x = rect.width / 2 + offset;
  const y = rect.height / 2 + offset;
  target.style.setProperty("--cursor-x", `${x.toFixed(2)}px`);
  target.style.setProperty("--cursor-y", `${y.toFixed(2)}px`);
  target.style.setProperty("--cursor-opacity", "1");
  const panel = target.closest(".work__panel");
  panel?.classList.add("is-hovered");
};

onMounted(() => {
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
  gap: 0;
}

.work__panel {
  height: 100vh;
  min-height: calc(var(--vh, 1vh) * 100);
  width: 100%;
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
}

@supports (height: 100dvh) {
  .work__panel {
    height: 100dvh;
  }
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
  transition: filter 0.35s ease;
}

.work__panel.is-hovered .work__bg-img {
  filter: brightness(0.6) saturate(0.9);
}

.work__media-link {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  --cursor-x: -999px;
  --cursor-y: -999px;
  --cursor-opacity: 0;
}

.work__meta {
  position: absolute;
  color: #fff;
  font-size: clamp(0.95rem, 1.8vw, 1rem);
  font-weight: 400;
  letter-spacing: 0.02em;
  background: rgba(0, 0, 0, 0.6);
  padding: 0.45rem 0.7rem;
  border-radius: 0.2rem;
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
}

.work__meta-mark {
  flex: 0 0 auto;
}

.work__meta-copy {
  flex: 1 1 auto;
}

.work__media {
  position: relative;
  width: min(56vw, 660px);
  aspect-ratio: 16 / 9;
  background: rgba(10, 10, 10, 0.65);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.25),
    0 6px 18px rgba(0, 0, 0, 0.25);
  overflow: hidden;
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

.work__cursor {
  position: absolute;
  left: 0;
  top: 0;
  width: 96px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transform: translate3d(calc(var(--cursor-x) - 50%), calc(var(--cursor-y) - 50%), 0);
  opacity: var(--cursor-opacity, 0);
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s ease, background-color 0.2s ease;
  z-index: 3;
}

@media (max-width: 767px) {
  .work__cursor {
    display: none;
  }
}

@media (max-width: 767px) {
  .work__heading {
    margin-bottom: clamp(1.5rem, 6vw, 2.5rem);
  }

  .work__media {
    width: min(86vw, 520px);
    aspect-ratio: 4 / 3;
  }

  .work__meta--right {
    max-width: 60vw;
  }
}
</style>
