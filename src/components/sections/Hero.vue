<template>
  <section ref="heroRef" id="hero" data-nav="blend" class="hero" @copy.prevent @cut.prevent>


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
const heroRef = ref(null);
let heroObserver = null;

const mailtoEncoded =
  "&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#106;&#97;&#108;&#97;&#108;&#101;&#100;&#100;&#105;&#110;&#101;&#109;&#97;&#111;&#117;&#107;&#105;&#108;&#64;&#103;&#109;&#97;&#105;&#108;&#46;&#99;&#111;&#109;";

const setViewportHeight = () => {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
};

onMounted(() => {
  setViewportHeight();
  window.addEventListener("resize", setViewportHeight, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", setViewportHeight);
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
  background-color: #ffffff;
  color: #0b0b0b;
  user-select: none;
  pointer-events: none;
}

.hero__content {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  pointer-events: none;
  padding: 0 30px 30px 30px;
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
  font-size: clamp(1.3em, 5vw, 2em);
  line-height: 1.2;
  font-weight: 400;
  text-transform: uppercase;
  margin: 0;
  max-width: 41ch;
  width: 100%;
  overflow-wrap: anywhere;
  word-break: normal;
  text-shadow: none;
}

.hero :deep(.line) {
  display: block;
  overflow: hidden;
  will-change: transform;
  transform: translate3d(0, 0, 0);
  text-shadow: none;
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

.hero :deep(.btn-animate-chars) {
  --color-cta-bg: #0b0b0b;
  --color-ink: #ffffff;
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
