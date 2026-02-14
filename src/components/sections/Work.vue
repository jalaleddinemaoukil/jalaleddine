<template>
  <section id="work" class="work section" @pointerleave="handleSectionPointerLeave">
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
        :class="{ 'is-media-hovered': hoveredPanelIndex === idx }"
        :data-index="idx"
        :ref="(el) => setPanelRef(el, idx)"
      >
        <div class="work__bg">
          <img
            :ref="(el) => setBgRef(el, idx)"
            class="work__bg-img"
            :src="bgReady[idx] ? getBgSrc(item, 1600) : undefined"
            :srcset="bgReady[idx] ? getBgSrcset(item) : undefined"
            sizes="100vw"
            :alt="item.title"
            :data-loaded="bgLoaded[idx] || false"
            width="1920"
            height="1080"
            :loading="idx < PREWARM_BG_COUNT ? 'eager' : 'lazy'"
            :fetchpriority="idx === 0 ? 'high' : idx < PREWARM_BG_COUNT ? 'auto' : 'low'"
            decoding="async"
          />
          <div class="work__bg-overlay" aria-hidden="true"></div>
        </div>
        <div class="work__meta work__meta--left">{{ item.title }}</div>
        <div class="work__meta work__meta--right">
          <span class="work__meta-copy">{{ item.description }}</span>
        </div>
        <a
          class="work__media-link"
          :href="item.href"
          :aria-label="item.title ? `View ${item.title} project` : 'View project'"
          @click="handleMediaClick(item.href, $event)"
          @pointerenter="handleMediaPointerEnter(idx, $event)"
          @pointermove="handleMediaPointerMove(idx, $event)"
          @pointerleave="handleMediaPointerLeave(idx)"
          @pointercancel="handleMediaPointerLeave(idx)"
          @focus="handleMediaFocus(idx)"
          @blur="handleMediaBlur(idx)"
        >
          <span class="sr-only">{{ item.title ? `View ${item.title} project` : "View project" }}</span>
          <div class="work__media" :ref="(el) => setMediaRef(el, idx)">
            <video
              :ref="(el) => setImageRef(el, idx)"
              class="work__video"
              :src="videoReady[idx] ? item.src : undefined"
              :poster="bgReady[idx] ? getBgSrc(item, 960) : undefined"
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
        </a>
      </article>
    </div>
    <div
      ref="cursorRef"
      class="work__cursor"
      :class="{ 'is-visible': cursorVisible }"
      aria-hidden="true"
    >
      <span class="work__cursor-chip">
        <span class="work__cursor-icon" aria-hidden="true">
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
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import RevealText from "../base/RevealText.vue";
const router = useRouter();

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const items = computed(() => (Array.isArray(props.items) ? props.items : []));

const handleMediaClick = (href, event) => {
  if (!href || typeof href !== "string") return;
  if (!href.startsWith("/")) return;
  event?.preventDefault?.();
  router.push(href);
};

const panels = ref([]);
const images = ref([]);
const medias = ref([]);
const bgImages = ref([]);
const bgLoaded = ref([]);
const bgReady = ref([]);
const videoReady = ref([]);
const cursorRef = ref(null);
const hoveredPanelIndex = ref(-1);
const cursorVisible = ref(false);
const cursorEnabled = ref(false);
let resizeTimer = null;
let resizeHandler = null;
let bgObserver = null;
let videoObserver = null;
let cursorRaf = 0;
let cursorRunning = false;
let cursorHalf = 0;
const PREWARM_BG_COUNT = 2;
const PREWARM_VIDEO_COUNT = 0;
const CURSOR_EASE = 0.16;
const cursorTarget = { x: -200, y: -200 };
const cursorCurrent = { x: -200, y: -200 };

const isSanityImage = (url) => typeof url === "string" && url.includes("cdn.sanity.io/images/");

const optimizeSanityImage = (url, width, quality = 50) => {
  if (!isSanityImage(url)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("w", String(width));
    u.searchParams.set("auto", "format");
    u.searchParams.set("fit", "max");
    u.searchParams.set("q", String(quality));
    return u.toString();
  } catch {
    return url;
  }
};

const getBgSrc = (item, width) => optimizeSanityImage(item?.bg, width);

const getBgSrcset = (item) => {
  const url = item?.bg;
  if (!isSanityImage(url)) return undefined;
  return [800, 1200, 1600, 2000]
    .map((w) => `${optimizeSanityImage(url, w)} ${w}w`)
    .join(", ");
};

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

  if (el && !bgLoaded.value[idx]) {
    el.addEventListener(
      "load",
      () => {
      bgLoaded.value[idx] = true;
      scheduleScrollRefresh();
    },
      { once: true }
    );
  }
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

const handleMediaPointerEnter = (idx, event) => {
  hoveredPanelIndex.value = idx;
  if (!cursorEnabled.value) return;
  setCursorTargetFromEvent(event);
  cursorCurrent.x = cursorTarget.x;
  cursorCurrent.y = cursorTarget.y;
  applyCursorTransform();
  cursorVisible.value = true;
};

const handleMediaPointerMove = (idx, event) => {
  hoveredPanelIndex.value = idx;
  if (!cursorEnabled.value) return;
  setCursorTargetFromEvent(event);
  ensureCursorLoop();
};

const handleMediaPointerLeave = (idx) => {
  if (hoveredPanelIndex.value === idx) hoveredPanelIndex.value = -1;
  if (!cursorEnabled.value) return;
  cursorVisible.value = false;
  ensureCursorLoop();
};

const handleMediaFocus = (idx) => {
  hoveredPanelIndex.value = idx;
};

const handleMediaBlur = (idx) => {
  if (hoveredPanelIndex.value === idx) hoveredPanelIndex.value = -1;
};

const handleSectionPointerLeave = () => {
  hoveredPanelIndex.value = -1;
  if (!cursorEnabled.value) return;
  cursorVisible.value = false;
  ensureCursorLoop();
};

const scheduleScrollRefresh = () => {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    ensurePlugins()?.ScrollTrigger?.refresh?.();
    window.__lenis?.resize?.();
    window.dispatchEvent(new Event("content:loaded"));
  });
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    navigator.connection?.saveData === true);

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
    
    if (!panel || !bg || !media) {
      console.warn(`Work panel ${idx}: missing elements`, { panel: !!panel, bg: !!bg, media: !!media });
      return;
    }

    const amount = Math.round(window.innerHeight * 0.3);
    
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

const resetMediaState = () => {
  bgLoaded.value = [];
  bgReady.value = [];
  videoReady.value = [];
};

const resetRefs = () => {
  panels.value = [];
  images.value = [];
  medias.value = [];
  bgImages.value = [];
};

const primeMediaState = () => {
  const bgCount = Math.min(PREWARM_BG_COUNT, items.value.length);
  const videoCount = Math.min(PREWARM_VIDEO_COUNT, items.value.length);
  bgReady.value = items.value.map((_, idx) => idx < bgCount);
  videoReady.value = items.value.map((_, idx) => idx < videoCount);
};

const initObservers = () => {
  if (typeof window === "undefined") return;
  bgObserver?.disconnect();
  bgObserver = null;
  videoObserver?.disconnect();
  videoObserver = null;

  primeMediaState();

  if (!("IntersectionObserver" in window)) {
    bgReady.value = items.value.map(() => true);
    videoReady.value = items.value.map(() => true);
    scheduleScrollRefresh();
    return;
  }

  bgObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = Number(entry.target?.dataset?.index ?? -1);
        if (idx < 0 || !entry.isIntersecting) return;
        if (!bgReady.value[idx]) {
          bgReady.value[idx] = true;
          scheduleScrollRefresh();
        }
        bgObserver?.unobserve(entry.target);
      });
    },
    { rootMargin: "1200px 0px", threshold: 0 }
  );

  videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = Number(entry.target?.dataset?.index ?? -1);
        if (idx < 0) return;
        const video = images.value[idx];
        if (entry.isIntersecting) {
          if (!videoReady.value[idx]) {
            videoReady.value[idx] = true;
            scheduleScrollRefresh();
          }
          video?.play?.().catch(() => {});
        } else {
          video?.pause?.();
        }
      });
    },
    { rootMargin: "500px 0px", threshold: 0.15 }
  );

  panels.value.forEach((panel) => {
    if (!panel) return;
    bgObserver?.observe(panel);
    videoObserver?.observe(panel);
  });
};

const refreshLayout = () => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      buildParallax();
    }, 100);
  });
};

onMounted(() => {
  updateCursorCapability();
  initObservers();
  refreshLayout();
  nextTick(() => {
    updateCursorMetrics();
    applyCursorTransform();
  });

  resizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateCursorCapability();
      updateCursorMetrics();
      buildParallax();
      ensurePlugins()?.ScrollTrigger?.refresh?.();
    }, 150);
  };
  window.addEventListener("resize", resizeHandler, { passive: true });
});

watch(
  items,
  async () => {
    resetMediaState();
    resetRefs();
    await nextTick();
    initObservers();
    refreshLayout();
  },
  { deep: false }
);

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  stopCursorLoop();
  bgObserver?.disconnect();
  bgObserver = null;
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

.work__cursor {
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

.work__cursor.is-visible {
  opacity: 1;
}

.work__cursor-chip {
  width: clamp(2rem, 4.8vw, 3rem);
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

.work__cursor.is-visible .work__cursor-chip {
  transform: scale(1);
}

.work__cursor-icon {
  width: 1.15rem;
  height: 1.15rem;
  opacity: 0;
  transition: opacity 0.16s ease;
}

.work__cursor-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.work__cursor-icon path {
  stroke: var(--color-white);
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.work__cursor.is-visible .work__cursor-icon {
  opacity: 1;
}

.work__heading {
  font-size: var(--text-4xl);
  line-height: var(--lh-tight);
  margin: 0 0 clamp(2rem, 5vw, 4rem);
  letter-spacing: var(--tracking-display);
  text-transform: uppercase;
}

.work__panels {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.work__panel {
  min-height: calc(var(--vh, 1vh) * 120);
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

.work__bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(0, 0, 0, 0.38);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.24s ease;
}

.work__panel.is-media-hovered .work__bg-overlay {
  opacity: 1;
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
  z-index: 2;
  color: var(--color-white);
  font-size: clamp(0.68rem, 0.86vw, 0.82rem);
  font-weight: 500;
  letter-spacing: 0.08em;
  background: transparent;
  padding: 0;
  border-radius: 0;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.62);
}

.work__meta--left {
  top: clamp(1.5rem, 4vw, 2.5rem);
  left: clamp(1.5rem, 4vw, 3rem);
}

.work__meta--right {
  top: clamp(1.5rem, 4vw, 2.5rem);
  right: clamp(1.5rem, 4vw, 3rem);
  max-width: min(32vw, 320px);
  display: flex;
  gap: 0.35rem;
  line-height: 1.35;
}

.work__meta-mark {
  flex: 0 0 auto;
}

.work__meta-copy { flex: 1 1 auto; }

.work__media {
  position: relative;
  width: min(56vw, 660px);
  aspect-ratio: 16 / 9;
  background: rgba(0, 0, 0, 0.65);
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

@media (max-width: 767px) {
  .work__heading {
    margin-bottom: clamp(1.5rem, 6vw, 2.5rem);
  }

  .work__panel {
    height: 92svh;
    min-height: calc(var(--vh, 1vh) * 92);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    padding: clamp(1.6rem, 5vw, 2.4rem) clamp(1.1rem, 4.5vw, 1.8rem);
  }

  .work__media-link {
    width: 100%;
    justify-content: center;
    order: 2;
  }

  .work__media {
    width: min(90vw, 560px);
    aspect-ratio: 16 / 9;
    margin-inline: auto;
  }

  .work__meta {
    position: relative;
    width: min(90vw, 560px);
    align-self: center;
    font-size: clamp(0.64rem, 2.2vw, 0.78rem);
    padding: 0.4rem 0.6rem;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 0.2rem;
    margin-inline: auto;
    text-align: center;
  }

  .work__meta--left {
    order: 0;
    top: auto;
    left: auto;
    right: auto;
  }

  .work__meta--right {
    max-width: min(90vw, 560px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    order: 1;
    top: auto;
    left: auto;
    right: auto;
  }

  .work__meta-mark {
    display: none;
  }

  .work__meta-copy {
    text-align: center;
  }
}

@media (hover: none), (pointer: coarse) {
  .work__meta {
    background: rgba(0, 0, 0, 0.6);
    padding: 0.4rem 0.6rem;
    border-radius: 0.2rem;
  }
}

@media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) {
  .work__cursor {
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
</style>

