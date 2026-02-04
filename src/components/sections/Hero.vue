<!-- src/components/Hero.vue -->
<template>
  <section id="hero" data-nav="blend" class="hero" @copy.prevent @cut.prevent>
    <video class="hero__video" autoplay loop muted playsinline preload="auto" aria-hidden="true">
      <source :src="heroVideo" type="video/webm" />
      Your browser does not support the video tag.
    </video>

    <div class="hero__overlay" aria-hidden="true"></div>

    <div class="hero__content">
      <div class="hero__grid">
        <div class="hero__text">
          <RevealText tag="p" :scroll="false" :waitForPreloader="true" class="hero__heading">
            Your website should work as hard as you do.
            <br />
            In today's digital landscape, your online presence isn't just a business card. it's your most powerful growth engine.
            <br /><br />
            <span class="hero__scroll">(Scroll Down)</span>
          </RevealText>
        </div>

        <div class="hero__cta">
          <span class="cta-mask" aria-hidden="true">
            <span ref="ctaMoverRef" class="cta-mover">
              <Button tag="a" href="mailto:jalaleddinemaoukil@gmail.com" target="_blank" width="clamp(100%, 2.4vw, 410px)" height="clamp(60px, 5vw, 90px)" fontSize="clamp(15px, 2vw, 20px)"
                paddingX="clamp(25px, 1.8vw, 35px)" paddingY="0px" font-weight="700">
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
import { onMounted, onBeforeUnmount } from "vue";
import Button from "../base/Button.vue";
import RevealText from "../base/RevealText.vue";
import heroVideo from "../../assets/videos/website-bg.webm";

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
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
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
  font-size: clamp(20px, 3.2vw, 28px);
  line-height: 1.35;
  font-weight: 300;
  margin: 0;
  max-width: 43ch;
  width: 100%;
  overflow-wrap: anywhere;
  word-break: normal;
  letter-spacing: 0.03em;
}

/* Masked line reveal: each line in a clip */
.hero :deep(.line) {
  display: block;
  overflow: hidden;
  will-change: transform;
  transform: translate3d(0, 0, 0);
}

.hero__scroll {
  display: inline-block;
  margin-top: 0.8em;
  font-size: clamp(0.8em, 1vw, 1em);
  opacity: 0.7;
  letter-spacing: 0.08em;
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
