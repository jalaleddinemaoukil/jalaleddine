<template>
  <section
    id="hero"
    data-nav="blend"
    ref="heroRef"
    class="hero"
    @copy.prevent
    @cut.prevent
  >
    <video
      class="hero__video"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
      aria-hidden="true"
    >
      <source src="/videos/website-bg.webm" type="video/webm" />
      Your browser does not support the video tag.
    </video>

    <div class="hero__overlay" aria-hidden="true"></div>

    <div class="hero__content">
      <div class="hero__grid">
        <div class="hero__text">
          <p ref="headingRef" class="hero__heading">
            Your website should work as hard as you do.
            <br />
            In today's digital landscape, your online presence isn't just a
            business card. it's your most powerful growth engine.
          </p>
        </div>

        <div class="hero__cta">
          <MagneticButton
            text="Let's Talk"
            width="320px"
            height="100px"
            fontSize="15px"
            href="mailto:jalaleddinemaoukil@gmail.com"
            variant="light"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import gsap from 'gsap';
import MagneticButton from './MagneticButton.vue';

const heroRef = ref(null);
const headingRef = ref(null);

let splitInstance = null;
let lineWrappers = [];
let animated = false;

const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

const cleanupSplit = () => {
  lineWrappers.forEach((wrapper) => {
    if (!wrapper || !wrapper.parentNode) return;
    const child = wrapper.firstChild;
    if (child) {
      wrapper.parentNode.replaceChild(child, wrapper);
    } else {
      wrapper.remove();
    }
  });
  lineWrappers = [];
  if (splitInstance && typeof splitInstance.revert === 'function') {
    splitInstance.revert();
  }
  splitInstance = null;
};

const runSplitAnimation = () => {
  if (animated || !headingRef.value || !window.SplitText) return;

  animated = true;
  const { SplitText } = window;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });

  splitInstance = new SplitText(headingRef.value, {
    type: 'lines',
    linesClass: 'line',
  });

  splitInstance.lines.forEach((line) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'line-wrap';
    line.parentNode?.insertBefore(wrapper, line);
    wrapper.appendChild(line);
    lineWrappers.push(wrapper);
  });

  gsap.set(splitInstance.lines, { yPercent: 100 });
  tl.to(
    splitInstance.lines,
    {
      yPercent: 0,
      duration: 1,
      stagger: 0.1,
    },
    0,
  );
};

const handlePreloaderComplete = () => {
  runSplitAnimation();
};

const tryImmediateAnimation = () => {
  const preloader = document.getElementById('preloader');
  const isHidden =
    !preloader ||
    preloader.getAttribute('aria-hidden') === 'true' ||
    getComputedStyle(preloader).display === 'none';

  if (isHidden) runSplitAnimation();
};

onMounted(() => {
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight, { passive: true });
  window.addEventListener('preloaderComplete', handlePreloaderComplete);
  requestAnimationFrame(tryImmediateAnimation);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', setViewportHeight);
  window.removeEventListener('preloaderComplete', handlePreloaderComplete);
  cleanupSplit();
});
</script>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  min-height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  background-color: #0a0a0a;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  color: #fff;
  user-select: none;
  -webkit-user-select: none;
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
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.6)
  );
}

.hero__content {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  pointer-events: none;
  padding: 30px;
  display: flex;
}

.hero__grid {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  pointer-events: auto;
}

.hero__text {
  flex: 1;
  max-width: 80ch;
}

.hero__heading {
  font-size: clamp(20px, 3.2vw, 28px);
  line-height: 1.3;
  font-weight: 300;
  width: 38ch;
  margin: 0;
  cursor: default;
  will-change: transform;
}

.hero__cta {
  display: flex;
  align-items: end;
  justify-content: flex-start;
}

.line-wrap {
  overflow: hidden;
}

.line {
  display: block;
  will-change: transform;
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
</style>
