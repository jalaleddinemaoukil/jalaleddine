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
        :data-index="idx"
        :ref="(el) => setPanelRef(el, idx)"
      >
        <div class="work__bg">
          <img
            :ref="(el) => setBgRef(el, idx)"
            class="work__bg-img"
            :src="item.bg"
            :alt="item.title"
            :data-loaded="bgLoaded[idx] || false"
            width="1920"
            height="1080"
            :loading="idx === 0 ? 'eager' : 'lazy'"
            :fetchpriority="idx === 0 ? 'high' : 'low'"
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
          :aria-label="item.title ? `View ${item.title} project` : 'View project'"
          @pointermove="onCursorMove"
          @pointerenter="onCursorEnter"
          @pointerleave="onCursorLeave"
          @focus="onCursorFocus"
          @blur="onCursorLeave"
        >
          <span class="sr-only">{{ item.title ? `View ${item.title} project` : "View project" }}</span>
          <div class="work__media" :ref="(el) => setMediaRef(el, idx)">
            <video
              :ref="(el) => setImageRef(el, idx)"
              class="work__video"
              :src="videoReady[idx] ? item.src : undefined"
              :aria-label="item.alt || item.title"
              :autoplay="videoReady[idx]"
              loop
              muted
              playsinline
              :preload="videoReady[idx] ? 'metadata' : 'none'"
              aria-hidden="true"
              role="presentation"
              tabindex="-1"
            >
              <track kind="captions" src="/captions/blank.vtt" srclang="en" label="English" default />
            </video>
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
const bgLoaded = ref([]);
const videoReady = ref([]);
let resizeTimer = null;
let resizeHandler = null;
let scrollHandler = null;
let videoObserver = null;

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

  // Mark as loaded when image loads
  if (el && !bgLoaded.value[idx]) {
    el.addEventListener("load", () => {
      bgLoaded.value[idx] = true;
    }, { once: true });
  }
};

// Preload only the first background to avoid pulling every asset on first load.
const preloadFirstBackground = () => {
  if (typeof window === "undefined") return;
  const first = items.value[0];
  if (!first?.bg) return;
  const img = new Image();
  img.src = first.bg;
  img.onload = () => {
    bgLoaded.value[0] = true;
  };
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    window.matchMedia?.("(pointer: coarse)")?.matches ||
    navigator.connection?.saveData === true ||
    (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4) ||
    (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4));

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
    
    // Strict existence checks
    if (!panel || !bg || !media) {
      console.warn(`Work panel ${idx}: missing elements`, { panel: !!panel, bg: !!bg, media: !!media });
      return;
    }

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

const cursorState = {
  link: null,
  cursor: null,
  rect: null,
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  visible: false,
  raf: null,
};
let cursorRectDirty = true;

const updateCursorRect = () => {
  if (!cursorState.link) return;
  cursorState.rect = cursorState.link.getBoundingClientRect();
  cursorRectDirty = false;
};

const setCursorTarget = (clientX, clientY) => {
  const rect = cursorState.rect;
  if (!rect) return;
  const offset = 12;
  cursorState.tx = clientX - rect.left + offset;
  cursorState.ty = clientY - rect.top + offset;
};

const applyCursorStyle = () => {
  if (!cursorState.cursor) return;
  const lerp = 0.18;
  cursorState.x += (cursorState.tx - cursorState.x) * lerp;
  cursorState.y += (cursorState.ty - cursorState.y) * lerp;
  const scale = cursorState.visible ? 1 : 0.86;
  const opacity = cursorState.visible ? 1 : 0;
  cursorState.cursor.style.opacity = `${opacity}`;
  cursorState.cursor.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0) translate3d(-50%, -50%, 0) scale(${scale})`;
};

const startCursorLoop = () => {
  if (cursorState.raf) return;
  const tick = () => {
    applyCursorStyle();
    cursorState.raf = requestAnimationFrame(tick);
  };
  cursorState.raf = requestAnimationFrame(tick);
};

const stopCursorLoop = () => {
  if (!cursorState.raf) return;
  cancelAnimationFrame(cursorState.raf);
  cursorState.raf = null;
};

const onCursorMove = (event) => {
  if (prefersReducedMotion() || event.pointerType === "touch") return;
  if (!cursorState.link) return;
  if (!cursorState.rect || cursorRectDirty) updateCursorRect();
  setCursorTarget(event.clientX, event.clientY);
};

const onCursorEnter = (event) => {
  if (prefersReducedMotion() || event.pointerType === "touch") return;
  const target = event.currentTarget;
  if (!target) return;
  const cursor = target.querySelector(".work__cursor");
  if (!cursor) return;
  cursorState.link = target;
  cursorState.cursor = cursor;
  updateCursorRect();
  cursorRectDirty = false;
  setCursorTarget(event.clientX, event.clientY);
  cursorState.x = cursorState.tx;
  cursorState.y = cursorState.ty;
  cursorState.visible = true;
  startCursorLoop();
  const panel = target.closest(".work__panel");
  panel?.classList.add("is-hovered");
};

const onCursorLeave = (event) => {
  const target = event.currentTarget;
  if (!target) return;
  cursorState.visible = false;
  if (cursorState.cursor) {
    cursorState.cursor.style.opacity = "0";
    cursorState.cursor.style.transform = `translate3d(${cursorState.x}px, ${cursorState.y}px, 0) translate3d(-50%, -50%, 0) scale(0.86)`;
  }
  cursorState.link = null;
  cursorState.rect = null;
  cursorRectDirty = true;
  cursorState.cursor = null;
  const panel = target.closest(".work__panel");
  panel?.classList.remove("is-hovered");
  stopCursorLoop();
};

const onCursorFocus = (event) => {
  if (prefersReducedMotion()) return;
  const target = event.currentTarget;
  if (!target) return;
  const cursor = target.querySelector(".work__cursor");
  if (!cursor) return;
  cursorState.link = target;
  cursorState.cursor = cursor;
  updateCursorRect();
  cursorRectDirty = false;
  const rect = cursorState.rect;
  if (rect) {
    setCursorTarget(rect.left + rect.width / 2, rect.top + rect.height / 2);
    cursorState.x = cursorState.tx;
    cursorState.y = cursorState.ty;
  }
  cursorState.visible = true;
  startCursorLoop();
  const panel = target.closest(".work__panel");
  panel?.classList.add("is-hovered");
};

onMounted(() => {
  preloadFirstBackground();

  if (typeof window !== "undefined" && "IntersectionObserver" in window) {
    videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target?.dataset?.index ?? -1);
          if (idx < 0) return;
          const video = images.value[idx];
          if (entry.isIntersecting) {
            videoReady.value[idx] = true;
            video?.play?.().catch(() => {});
          } else {
            video?.pause?.();
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.2 }
    );

    panels.value.forEach((panel) => {
      if (panel) videoObserver.observe(panel);
    });
  } else {
    videoReady.value = items.value.map(() => true);
  }

  // Delay parallax init to ensure DOM is ready
  requestAnimationFrame(() => {
    setTimeout(() => {
      buildParallax();
    }, 100);
  });

  resizeHandler = () => {
    clearTimeout(resizeTimer);
    cursorRectDirty = true;
    resizeTimer = setTimeout(() => {
      buildParallax();
      ensurePlugins()?.ScrollTrigger?.refresh?.();
    }, 150);
  };
  window.addEventListener("resize", resizeHandler, { passive: true });

  scrollHandler = () => {
    cursorRectDirty = true;
  };
  window.addEventListener("scroll", scrollHandler, { passive: true });
});

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
  videoObserver?.disconnect();
  videoObserver = null;
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
  background: linear-gradient(135deg, rgba(20, 20, 30, 0.95), rgba(10, 10, 15, 0.98));
}

.work__bg-img {
  width: 100%;
  height: 110%;
  object-fit: cover;
  display: block;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  transition:
    filter 0.35s ease,
    opacity 0.6s ease;
  opacity: 0;
}

.work__bg-img[data-loaded="true"] {
  opacity: 1;
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
  width: 120px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background:
    linear-gradient(135deg, rgba(20, 20, 20, 0.85), rgba(10, 10, 10, 0.65));
  color: #fff;
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  pointer-events: none;
  transform: translate3d(-50%, -50%, 0) scale(0.86);
  opacity: 0;
  box-shadow:
    0 16px 35px rgba(0, 0, 0, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  will-change: transform, opacity;
  z-index: 3;
}

.work__cursor::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
  display: inline-block;
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
</style>
