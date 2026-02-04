<template>
  <component
    :is="tag"
    ref="el"
    :class="['reveal-text', customClass]"
  >
    <slot />
  </component>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { gsap } from "gsap";

const props = defineProps({
  tag: { type: String, default: "div" },
  customClass: { type: [String, Array, Object], default: "" },
  splitReveal: { type: String, default: "lines" }, // lines | words | chars
  scroll: { type: Boolean, default: true },
  start: { type: String, default: "clamp(top 80%)" },
  once: { type: Boolean, default: true },
  ease: { type: String, default: "expo.out" },
  waitForPreloader: { type: Boolean, default: false },
});

const el = ref(null);
let splitInstance = null;
let tween = null;
let resizeTimer = null;
let retryTimer = null;
let retryCount = 0;
const MAX_RETRIES = 40;
let preloaderObserver = null;
let preloaderTimeout = null;
let preloaderHandler = null;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const ensurePlugins = () => {
  const g = typeof window !== "undefined" && window.gsap ? window.gsap : gsap;
  const SplitText = typeof window !== "undefined" ? window.SplitText : null;
  const ScrollTrigger = typeof window !== "undefined" ? window.ScrollTrigger : null;
  if (!g) return null;
  if (SplitText && ScrollTrigger) g.registerPlugin(SplitText, ScrollTrigger);
  else if (SplitText) g.registerPlugin(SplitText);
  else if (ScrollTrigger) g.registerPlugin(ScrollTrigger);
  return { gsap: g, SplitText, ScrollTrigger };
};

const waitForGsap = async (timeoutMs = 2000) => {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    const pack = ensurePlugins();
    if (pack?.gsap && pack?.SplitText && (!props.scroll || pack?.ScrollTrigger)) return pack;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return ensurePlugins();
};

const splitConfig = {
  lines: { duration: 0.8, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 },
};

const cleanup = () => {
  tween?.kill?.();
  tween = null;
  splitInstance?.revert?.();
  splitInstance = null;
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  if (preloaderObserver) preloaderObserver.disconnect();
  preloaderObserver = null;
  if (preloaderTimeout) clearTimeout(preloaderTimeout);
  preloaderTimeout = null;
};

const build = async () => {
  const pack = await waitForGsap();
  if (!pack?.gsap || !el.value) return;
  const { gsap: g, SplitText, ScrollTrigger } = pack;

  cleanup();

  if (prefersReducedMotion() || !SplitText || (props.scroll && !ScrollTrigger)) {
    g.set(el.value, { clearProps: "all" });
    if (!prefersReducedMotion() && (!SplitText || (props.scroll && !ScrollTrigger)) && retryCount < MAX_RETRIES) {
      retryCount += 1;
      retryTimer = setTimeout(() => void build(), 300);
    }
    return;
  }

  const type = ["lines", "words", "chars"].includes(props.splitReveal) ? props.splitReveal : "lines";
  const typesToSplit =
    type === "lines" ? ["lines"] : type === "words" ? ["lines", "words"] : ["lines", "words", "chars"];

  splitInstance = SplitText.create(el.value, {
    type: typesToSplit.join(", "),
    mask: "lines",
    autoSplit: true,
    linesClass: "line",
    wordsClass: "word",
    charsClass: "letter",
  });

  const targets = splitInstance[type] && splitInstance[type].length ? splitInstance[type] : [el.value];
  const config = splitConfig[type];

  g.set(el.value, { autoAlpha: 1 });
  tween = g.from(targets, {
    yPercent: 110,
    duration: config.duration,
    stagger: config.stagger,
    ease: props.ease,
    immediateRender: false,
    ...(props.scroll
      ? {
          scrollTrigger: {
            trigger: el.value,
            start: props.start,
            once: props.once,
          },
        }
      : {}),
  });
};

const onResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    void build();
    const st = ensurePlugins()?.ScrollTrigger;
    st?.refresh?.();
  }, 150);
};

const getPreloader = () => (typeof document !== "undefined" ? document.getElementById("preloader") : null);

const isPreloaderGone = () => {
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

const waitForPreloaderExit = () => {
  const p = getPreloader();
  if (!p) return false;

  const onExitStart = () => {
    if (isPreloaderGone()) {
      void build();
    } else {
      void build();
    }
  };

  p.addEventListener("transitionstart", onExitStart, { once: true });
  p.addEventListener("animationstart", onExitStart, { once: true });

  preloaderObserver = new MutationObserver(() => {
    if (isPreloaderGone()) {
      void build();
    }
  });

  preloaderObserver.observe(p, {
    attributes: true,
    attributeFilter: ["class", "style", "aria-hidden"],
  });

  return true;
};

onMounted(() => {
  retryCount = 0;
  preloaderHandler = () => {
    void build();
  };

  if (props.waitForPreloader) {
    window.addEventListener("preloaderComplete", preloaderHandler, { once: true });
    if (!isPreloaderGone()) {
      const hooked = waitForPreloaderExit();
      if (!hooked) void build();
      // Fallback: ensure we don't miss the animation even if preloader is removed silently
      preloaderTimeout = setTimeout(() => void build(), 1800);
    } else {
      void build();
    }
  } else {
    void build();
  }
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("load", build, { once: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  window.removeEventListener("load", build);
  if (preloaderHandler) window.removeEventListener("preloaderComplete", preloaderHandler);
  clearTimeout(resizeTimer);
  cleanup();
});
</script>

<style scoped>
.reveal-text :deep(.line) {
  display: block;
  overflow: hidden;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}
</style>
