<!-- src/components/Hero.vue -->
<template>
  <section ref="heroRef" id="hero" data-nav="blend" class="hero" @copy.prevent @cut.prevent>
    <div v-if="useShader" class="hero__shader" aria-hidden="true">
      <div class="hero__shader-canvas" data-us-project="jYxrWzSRtsXNqZADHnVH"></div>
    </div>

    <video
      v-else
      class="hero__video"
      autoplay
      loop
      muted
      playsinline
      preload="metadata"
      aria-hidden="true"
    >
      <source :src="heroVideo" type="video/webm" />
      Your browser does not support the video tag.
    </video>


    <div class="hero__content">
      <div class="hero__grid">
        <div class="hero__text">
          <RevealText tag="p" :scroll="false" :waitForPreloader="true" class="hero__heading">
            Your website should work as hard as you do.
            <br />
            In today's digital landscape, your online presence isn't just a business card. it's your most powerful growth engine.
          </RevealText>
        </div>

        <div class="hero__cta">
          <span class="cta-mask">
            <span ref="ctaMoverRef" class="cta-mover">
              <Button tag="a" href="#" :data-mailto="mailtoEncoded" target="_blank" width="clamp(100%, 2.4vw, 410px)" height="clamp(60px, 5vw, 90px)" 
              fontSize="clamp(15px, 2vw, 20px)"
                paddingX="clamp(25px, 1.8vw, 35px)" paddingY="0px" fontWeight="700">
                Build Your Website with Me
              </Button>
            </span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import Button from "../base/Button.vue";
import RevealText from "../base/RevealText.vue";
import heroVideo from "../../assets/videos/website-bg.webm";

const heroRef = ref(null);
const useShader = ref(true);
let heroObserver = null;

const mailtoEncoded =
  "&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#106;&#97;&#108;&#97;&#108;&#101;&#100;&#100;&#105;&#110;&#101;&#109;&#97;&#111;&#117;&#107;&#105;&#108;&#64;&#103;&#109;&#97;&#105;&#108;&#46;&#99;&#111;&#109;";

const setViewportHeight = () => {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
};

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
  const saveData = navigator.connection?.saveData === true;
  return reducedMotion || saveData;
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
      existing.addEventListener("load", () => {
        initUnicornStudio();
        resolve();
      }, { once: true });
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

onMounted(() => {
  setViewportHeight();
  window.addEventListener("resize", setViewportHeight, { passive: true });

  useShader.value = !shouldDisableShader();
  if (!useShader.value || !heroRef.value) return;

  heroObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadUnicornStudio().catch(() => {
          useShader.value = false;
        });
        heroObserver?.disconnect();
      }
    },
    { rootMargin: "200px 0px" }
  );

  heroObserver.observe(heroRef.value);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", setViewportHeight);
  heroObserver?.disconnect();
});
</script>


<style scoped>
.hero {
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  min-height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  background-color: #0a0a0a;
  color: #fff;
  user-select: none;
  pointer-events: none;
}

.hero__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.hero__shader {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.hero__shader-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25));
  z-index: 1;
}

.hero__content {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  pointer-events: none;
  padding: 0 30px 30px 30px; /* 30px bottom padding, sides for spacing */
  display: flex;
  align-items: flex-end;
  will-change: transform, opacity;
}

.hero__grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  pointer-events: auto;
}

.hero__heading {
  font-size: clamp(20px, 3.1vw, 28px);
  line-height: 1.35;
  font-weight: 300;
  margin: 0;
  max-width: 39ch;
  width: 100%;
  overflow-wrap: anywhere;
  word-break: normal;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
}

/* Masked line reveal: each line in a clip */
.hero :deep(.line) {
  display: block;
  overflow: hidden;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.55);
}


/* CTA masked reveal */
.cta-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  padding-bottom: 6px;
  margin-bottom: -6px;
}

.cta-mover {
  display: inline-block;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

.hero__cta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

@media (min-width: 768px) {
  .hero__grid {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .hero__cta {
    justify-content: flex-end;
  }
}

@media (max-width: 767px) {
  .hero__content {
    padding: clamp(20px, 4vw, 30px);
  }
}

@media (max-width: 480px) {
  .hero__heading {
    max-width: 30ch;
    line-height: 1.4;
    letter-spacing: 0.02em;
  }
}
</style>
