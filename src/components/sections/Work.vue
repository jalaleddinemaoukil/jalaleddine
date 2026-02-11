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
            :src="bgReady[idx] ? getBgSrc(item, 1600) : undefined"
            :srcset="bgReady[idx] ? getBgSrcset(item) : undefined"
            sizes="100vw"
            :alt="item.title"
            :data-loaded="bgLoaded[idx] || false"
            width="1920"
            height="1080"
            loading="lazy"
            fetchpriority="low"
            decoding="async"
          />
        </div>
        <div class="work__meta work__meta--left">{{ item.title }}</div>
        <div class="work__meta work__meta--right">
          <span class="work__meta-mark">-&gt;</span>
          <span class="work__meta-copy">{{ item.description }}</span>
        </div>
        <a
          class="work__media-link"
          :href="item.href"
          :aria-label="item.title ? `View ${item.title} project` : 'View project'"
          @click="handleMediaClick(item.href, $event)"
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
let resizeTimer = null;
let resizeHandler = null;
let scrollHandler = null;
let videoObserver = null;
const PREWARM_COUNT = 1;

const isSanityImage = (url) => typeof url === "string" && url.includes("cdn.sanity.io/images/");

const optimizeSanityImage = (url, width, quality = 60) => {
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

  // Mark as loaded when image loads
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
  const count = Math.min(PREWARM_COUNT, items.value.length);
  bgReady.value = items.value.map((_, idx) => idx < count);
  videoReady.value = items.value.map(() => false);
};

const initObservers = () => {
  if (typeof window === "undefined") return;
  videoObserver?.disconnect();
  videoObserver = null;

  primeMediaState();

  if (!("IntersectionObserver" in window)) {
    bgReady.value = items.value.map(() => true);
    videoReady.value = items.value.map(() => true);
    scheduleScrollRefresh();
    return;
  }

    videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target?.dataset?.index ?? -1);
          if (idx < 0) return;
          const video = images.value[idx];
          if (entry.isIntersecting) {
            bgReady.value[idx] = true;
            videoReady.value[idx] = true;
            video?.play?.().catch(() => {});
            scheduleScrollRefresh();
          } else {
            video?.pause?.();
          }
        });
      },
      { rootMargin: "240px 0px", threshold: 0.2 }
    );

  panels.value.forEach((panel) => {
    if (panel) videoObserver.observe(panel);
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
  initObservers();
  refreshLayout();

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
  height: 120vh;
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
  z-index: 2;
  color: var(--color-white);
  font-size: var(--text-sm);
  font-weight: 400;
  letter-spacing: var(--tracking-label);
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
  line-height: var(--lh-base);
  font-size: var(--text-sm);
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

.work__cursor {
  position: absolute;
  left: 0;
  top: 0;
  width: 120px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(237, 237, 237, 0.35);
  background:
    linear-gradient(135deg, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.65));
  color: var(--color-white);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-label);
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
    inset 0 0 0 1px rgba(237, 237, 237, 0.08);
  will-change: transform, opacity;
  z-index: 3;
}

.work__cursor::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(237, 237, 237, 0.85);
  box-shadow: 0 0 10px rgba(237, 237, 237, 0.6);
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
    font-size: clamp(0.75rem, 2.6vw, 0.9rem);
    padding: 0.4rem 0.6rem;
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


