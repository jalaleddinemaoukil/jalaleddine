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

const props = defineProps({
  tag: { type: String, default: "div" },
  customClass: { type: [String, Array, Object], default: "" },
  enableSplit: { type: Boolean, default: true },
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
let pendingPlay = false;
let buildInProgress = false;

const stripProhibitedAria = () => {
  if (!el.value) return;
  el.value.removeAttribute("aria-label");
  el.value.removeAttribute("aria-labelledby");
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    window.matchMedia?.("(pointer: coarse)")?.matches ||
    navigator.connection?.saveData === true ||
    (typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4) ||
    (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4));

const ensurePlugins = () => {
  const g = typeof window !== "undefined" ? window.gsap : null;
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
    const hasScroll = !props.scroll || pack?.ScrollTrigger;
    const hasSplit = !props.enableSplit || pack?.SplitText;
    if (pack?.gsap && hasSplit && hasScroll) return pack;
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

const build = async (options = {}) => {
  const { paused = false } = options;
  buildInProgress = true;
  const pack = await waitForGsap();
  if (!pack?.gsap || !el.value) {
    buildInProgress = false;
    return;
  }
  const { gsap: g, SplitText, ScrollTrigger } = pack;

  cleanup();
  stripProhibitedAria();

  if (prefersReducedMotion()) {
    g.set(el.value, { clearProps: "all" });
    buildInProgress = false;
    return;
  }

  if (props.scroll && !ScrollTrigger) {
    g.set(el.value, { clearProps: "all" });
    if (retryCount < MAX_RETRIES) {
      retryCount += 1;
      retryTimer = setTimeout(() => void build(), 300);
    }
    buildInProgress = false;
    return;
  }

  if (!props.enableSplit || !SplitText) {
    g.set(el.value, { autoAlpha: 1 });
    if (props.enableSplit && !SplitText && retryCount < MAX_RETRIES) {
      retryCount += 1;
      retryTimer = setTimeout(() => void build(), 300);
    }
    tween = g.fromTo(
      el.value,
      { yPercent: 20 },
      {
        yPercent: 0,
        duration: 0.6,
        ease: props.ease,
        immediateRender: !props.scroll,
        paused,
        ...(props.scroll
          ? {
              scrollTrigger: {
                trigger: el.value,
                start: props.start,
                once: props.once,
              },
            }
          : {}),
      }
    );

    if (paused) tween.pause(0);
    buildInProgress = false;
    if (pendingPlay && tween && !props.scroll) {
      pendingPlay = false;
      tween.play(0);
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
  stripProhibitedAria();

  const targets = splitInstance[type] && splitInstance[type].length ? splitInstance[type] : [el.value];
  const config = splitConfig[type];

  g.set(el.value, { autoAlpha: 1 });
  tween = g.from(targets, {
    yPercent: 110,
    duration: config.duration,
    stagger: config.stagger,
    ease: props.ease,
    immediateRender: false,
    paused,
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

  if (paused) tween.pause(0);
  buildInProgress = false;
  if (pendingPlay && tween && !props.scroll) {
    pendingPlay = false;
    tween.play(0);
  }

  // Content size can change after SplitText; force scroll refresh.
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("content:loaded"));
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

const playReveal = () => {
  if (props.scroll) {
    void build();
    return;
  }
  if (tween) {
    pendingPlay = false;
    tween.play(0);
    return;
  }
  pendingPlay = true;
  if (!buildInProgress) void build();
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
    playReveal();
    window.removeEventListener("preloaderExit", preloaderHandler);
    window.removeEventListener("preloaderComplete", preloaderHandler);
  };

  if (props.waitForPreloader) {
    const syncToPreloader = !props.scroll;
    window.addEventListener("preloaderExit", preloaderHandler, { once: true });
    window.addEventListener("preloaderComplete", preloaderHandler, { once: true });
    if (!isPreloaderGone()) {
      if (syncToPreloader) {
        void build({ paused: true });
      } else {
        const hooked = waitForPreloaderExit();
        if (!hooked) void build();
      }
      // Fallback: ensure we don't miss the animation even if preloader is removed silently
      preloaderTimeout = setTimeout(() => playReveal(), 1800);
    } else {
      void build();
    }
  } else {
    void build();
  }
  window.addEventListener("resize", onResize, { passive: true });
  if (!props.waitForPreloader || props.scroll) {
    window.addEventListener("load", build, { once: true });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  window.removeEventListener("load", build);
  if (preloaderHandler) {
    window.removeEventListener("preloaderExit", preloaderHandler);
    window.removeEventListener("preloaderComplete", preloaderHandler);
  }
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
