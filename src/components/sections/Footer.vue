<template>
  <footer ref="footerRef" id="footer" class="site-footer">
    <div v-if="useShader" class="site-footer__shader" aria-hidden="true">
      <div class="site-footer__shader-canvas" data-us-project="jYxrWzSRtsXNqZADHnVH"></div>
    </div>
    <div class="site-footer__overlay" aria-hidden="true"></div>
    <div class="shell site-footer__content">
      <div class="site-footer__grid">
        <div class="site-footer__primary">
          <div class="site-footer__text">
            <RevealText tag="h2" class="site-footer__title" :scroll="true" splitReveal="lines">
              A faster, clearer, more memorable digital presence.
            </RevealText>
            <RevealText tag="p" class="site-footer__copy" :scroll="true" splitReveal="lines">
              Clean code. Bold design. A site that feels premium the moment it loads.
            </RevealText>
          </div>

          <div class="site-footer__cta">
            <Button
              tag="a"
              href="#"
              :data-mailto="mailtoEncoded"
              width="min(100%, 320px)"
              height="clamp(52px, 6vw, 64px)"
              fontSize="clamp(13px, 1.6vw, 16px)"
              paddingX="clamp(22px, 2.4vw, 34px)"
              paddingY="0px"
              fontWeight="700"
              letterSpacing="0.08em"
            >
              Start a Project
            </Button>
          </div>
        </div>

        <div class="site-footer__secondary">
          <div class="site-footer__links">
            <div class="site-footer__link-group">
              <RevealText tag="p" class="site-footer__label" :scroll="true" splitReveal="words">
                Explore
              </RevealText>
              <div class="site-footer__link-list">
                <a class="site-footer__link" href="/#work">
                  <RevealText tag="span" :scroll="true" splitReveal="words">Work</RevealText>
                </a>
                <a class="site-footer__link" href="/#services">
                  <RevealText tag="span" :scroll="true" splitReveal="words">Services</RevealText>
                </a>
                <a class="site-footer__link" href="/#about">
                  <RevealText tag="span" :scroll="true" splitReveal="words">About</RevealText>
                </a>
              </div>
            </div>

            <div class="site-footer__link-group">
              <RevealText tag="p" class="site-footer__label" :scroll="true" splitReveal="words">
                Social
              </RevealText>
              <div class="site-footer__link-list">
               
                <a class="site-footer__link" href="https://www.linkedin.com/in/jalal-eddine-maoukil/" target="_blank" rel="noopener noreferrer">
                  <RevealText tag="span" :scroll="true" splitReveal="words">LinkedIn</RevealText>
                </a>
                <a class="site-footer__link" href="https://github.com/jalaleddinemaoukil" target="_blank" rel="noopener noreferrer">
                  <RevealText tag="span" :scroll="true" splitReveal="words">GitHub</RevealText>
                </a>
                 <a class="site-footer__link" href="https://www.instagram.com/jalal.edn/" target="_blank" rel="noopener noreferrer">
                  <RevealText tag="span" :scroll="true" splitReveal="words">Instagram</RevealText>
                </a>
              </div>
            </div>
          </div>

          <div class="site-footer__legal">
            <RevealText tag="p" :scroll="true" splitReveal="words">
              © 2026 Jalal Eddine Maoukil. All rights reserved.
            </RevealText>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>


<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import RevealText from "../base/RevealText.vue";
import Button from "../base/Button.vue";

const footerRef = ref(null);
let tween = null;
let resizeHandler = null;
let footerObserver = null;
let loadHandler = null;
let contentHandler = null;
const useShader = ref(true);
const mailtoEncoded =
  "&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#106;&#97;&#108;&#97;&#108;&#101;&#100;&#100;&#105;&#110;&#101;&#109;&#97;&#111;&#117;&#107;&#105;&#108;&#64;&#103;&#109;&#97;&#105;&#108;&#46;&#99;&#111;&#109;";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

const shouldDisableShader = () => {
  if (!supportsWebGL()) return true;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const saveData = navigator.connection?.saveData === true;
  const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
  const lowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  return reducedMotion || coarse || saveData || lowMemory || lowCpu;
};

const initUnicornStudio = () => {
  if (!window.UnicornStudio || typeof window.UnicornStudio.init !== "function") return;
  if (!window.UnicornStudio.isInitialized) {
    window.UnicornStudio.init();
    window.UnicornStudio.isInitialized = true;
  }
};

const loadUnicornStudio = () =>
  new Promise((resolve, reject) => {
    if (window.UnicornStudio?.isInitialized) {
      resolve();
      return;
    }

    if (window.UnicornStudio?.init) {
      initUnicornStudio();
      resolve();
      return;
    }

    if (!window.UnicornStudio) window.UnicornStudio = { isInitialized: false };

    const existing = document.querySelector('script[data-unicornstudio]');
    if (existing) {
      existing.addEventListener(
        "load",
        () => {
          initUnicornStudio();
          resolve();
        },
        { once: true }
      );
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
    script.async = true;
    script.setAttribute("data-unicornstudio", "true");
    script.onload = () => {
      initUnicornStudio();
      resolve();
    };
    script.onerror = reject;
    (document.head || document.body).appendChild(script);
  });

const ensurePlugins = () => {
  if (typeof window === "undefined") return null;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap) return null;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
};

const buildFooterReveal = () => {
  const pack = ensurePlugins();
  if (!footerRef.value) return;
  if (!pack?.gsap || !pack.ScrollTrigger) {
    footerRef.value.style.setProperty("--progress", "1");
    return;
  }
  const { gsap, ScrollTrigger } = pack;

  tween?.scrollTrigger?.kill?.();
  tween?.kill?.();
  tween = null;

  gsap.set(footerRef.value, { "--progress": 0 });

  if (prefersReducedMotion()) {
    gsap.set(footerRef.value, { "--progress": 1 });
    return;
  }

  tween = gsap.to(footerRef.value, {
    "--progress": 1,
    ease: "none",
    scrollTrigger: {
      id: "footer-reveal",
      trigger: footerRef.value,
      start: "top bottom",
      end: "top top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
};

const refreshFooter = () => {
  buildFooterReveal();
  ensurePlugins()?.ScrollTrigger?.refresh?.();
  window.__lenis?.resize?.();
};

onMounted(() => {
  buildFooterReveal();
  resizeHandler = () => {
    refreshFooter();
  };
  window.addEventListener("resize", resizeHandler, { passive: true });
  loadHandler = () => refreshFooter();
  contentHandler = () => refreshFooter();
  window.addEventListener("load", loadHandler, { once: true, passive: true });
  window.addEventListener("content:loaded", contentHandler, { passive: true });

  useShader.value = !shouldDisableShader();
  if (useShader.value && footerRef.value) {
    footerObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadUnicornStudio().catch(() => {
            useShader.value = false;
          });
          footerObserver?.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );

    footerObserver.observe(footerRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener("resize", resizeHandler);
  if (loadHandler) window.removeEventListener("load", loadHandler);
  if (contentHandler) window.removeEventListener("content:loaded", contentHandler);
  footerObserver?.disconnect();
  tween?.scrollTrigger?.kill?.();
  tween?.kill?.();
  tween = null;
});
</script>

<style scoped>
@property --progress {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}

.site-footer {
  --progress: 0;
  position: relative;
  min-height: 100vh;
  background: radial-gradient(120% 120% at 15% 10%, #68b4ff 0%, #3687ff 45%, #0b2c6b 100%);
  color: #ffffff;
  overflow: hidden;
  z-index: 12;
  isolation: isolate;
}

.site-footer__shader {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.site-footer__shader-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.site-footer__overlay {
  position: absolute;
  inset: 0;
  background: #000000;
  opacity: calc(1 - var(--progress));
  transition: opacity 0.1s linear;
  z-index: 1;
}

.site-footer__content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: clamp(2rem, 5vw, 3.5rem);
  padding: clamp(4rem, 12vw, 7rem) clamp(16px, 2.2vw, 32px) clamp(3rem, 8vw, 5rem);
  transform: translate3d(0, calc(36px * (1 - var(--progress))), 0);
  opacity: calc(0.55 + 0.45 * var(--progress));
  will-change: transform, opacity;
}

.site-footer__grid {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(2.5rem, 6vw, 4rem);
  align-items: end;
}

@media (min-width: 900px) {
  .site-footer__grid {
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.65fr);
  }
}

.site-footer__primary,
.site-footer__secondary {
  display: flex;
  flex-direction: column;
  gap: clamp(1.75rem, 4vw, 3rem);
}

.site-footer__text {
  max-width: 45rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.site-footer__eyebrow {
  text-transform: uppercase;
  font-size: 0.72rem;
  margin: 0;
  opacity: 0.75;
}

.site-footer__title {
  font-size: clamp(2.1rem, 5.6vw, 4rem);
  line-height: 1.02;
  margin: 0;
  text-transform: uppercase;
  text-wrap: balance;
}

.site-footer__copy {
  margin: 0;
  max-width: 34rem;
  font-size: clamp(1rem, 2.3vw, 1.25rem);
  line-height: 1.7;
  opacity: 0.88;
}

.site-footer__cta {
  display: flex;
  justify-content: flex-start;
}

.site-footer__links {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.5rem, 4vw, 2.5rem);
}

.site-footer__link-group {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.site-footer__link-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.site-footer__label {
  text-transform: uppercase;
  font-size: 0.7rem;
  margin: 0;
  opacity: 0.8;
}

.site-footer__link {
  color: inherit;
  text-decoration: none;
  font-size: clamp(0.95rem, 1.6vw, 1.05rem);
  opacity: 0.88;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  position: relative;
}

.site-footer__link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.1em;
  height: 1px;
  background: currentColor;
  transform-origin: right center;
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.65, 0.05, 0, 1);
}

.site-footer__link:hover {
  opacity: 1;
}

.site-footer__link:hover::after,
.site-footer__link:focus-visible::after {
  transform-origin: left center;
  transform: scaleX(1);
}

.site-footer__link:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.65);
  outline-offset: 3px;
}

.site-footer__legal {
  font-size: 0.85rem;
  opacity: 0.8;
}

.site-footer :deep(.line),
.site-footer :deep(.word) {
  display: inline-block;
  overflow: hidden;
}

.site-footer :deep(.line) {
  display: block;
}

@media (max-width: 1024px) {
  .site-footer__text {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .site-footer__content {
    padding-top: clamp(3rem, 12vw, 5rem);
  }
}

@media (min-width: 640px) {
  .site-footer__links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(1.5rem, 6vw, 3.5rem);
  }
}
</style>
