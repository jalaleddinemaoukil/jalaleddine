<template>
  <section
    ref="heroRef"
    id="hero"
    data-nav="blend"
    class="hero"
    @copy.prevent
    @cut.prevent
  >
    <div class="hero__content">
      <div class="hero__grid">
        <div class="hero__text">
          <RevealText
            tag="p"
            :scroll="false"
            :waitForPreloader="true"
            :enableSplit="false"
            class="hero__heading"
          >
            Your website should work as hard as you do.
            <br />
            In today's digital landscape, your online presence isn't just a
            business card. it's your most powerful growth engine.
          </RevealText>
        </div>

        <div class="hero__cta">
          <span class="cta-mask">
            <span ref="ctaMoverRef" class="cta-mover">
              <Button
                tag="a"
                href="#"
                :data-mailto="mailtoEncoded"
                target="_blank"
                width="clamp(280px, 36vw, 520px)"
                height="clamp(64px, 4.8vw, 100px)"
                fontSize="clamp(16px, 1.35vw, 24px)"
                paddingX="clamp(28px, 2.2vw, 44px)"
                paddingY="0px"
                fontWeight="700"
              >
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
const ctaMoverRef = ref(null);

const mailtoEncoded =
  "&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#106;&#97;&#108;&#97;&#108;&#101;&#100;&#100;&#105;&#110;&#101;&#109;&#97;&#111;&#117;&#107;&#105;&#108;&#64;&#103;&#109;&#97;&#105;&#108;&#46;&#99;&#111;&#109;";

const setViewportHeight = () => {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
};

let cleanupFns = [];
let rafId = null;

function initTrail(container, excludedElements = []) {
  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    window.innerWidth <= 768;

  const config = {
    imageLifespan: 600,
    removalDelay: 16,
    mouseThreshold: isMobile ? 20 : 40,
    scrollThreshold: 50,
    inDuration: 600,
    outDuration: 800,
    inEasing: "cubic-bezier(.07,.5,.5,1)",
    outEasing: "cubic-bezier(.87, 0, .13, 1)",
    touchImageInterval: 40,
    minMovementForImage: isMobile ? 3 : 5,
    minImageSize: isMobile ? 120 : 160,
    maxImageSize: isMobile ? 260 : 340,
    baseRotation: 30,
    maxRotationFactor: 3,
    speedSmoothingFactor: 0.25,
  };

  const images = [
    "/images/1.webp",
    "/images/2.webp",
    "/images/3.webp",
  ];

  const trail = [];
  let mouseX = 0, mouseY = 0;
  let lastMouseX = 0, lastMouseY = 0;
  let prevMouseX = 0, prevMouseY = 0;
  let isMoving = false, isCursorInContainer = false, isTouching = false;
  let lastRemovalTime = 0, lastTouchImageTime = 0;
  let lastMoveTime = Date.now();
  let isScrolling = false, scrollTicking = false;
  let smoothedSpeed = 0, maxSpeed = 0;
  let imageIndex = 0;

  const isInContainer = (x, y) => {
    const r = container.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  const isInExcludedArea = (x, y) =>
    excludedElements.some((element) => {
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });

  const hasMovedEnough = () =>
    Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY) > config.mouseThreshold;

  const hasMovedAtAll = () =>
    Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY) > config.minMovementForImage;

  const calculateSpeed = () => {
    const now = Date.now(), dt = now - lastMoveTime;
    if (dt <= 0) return 0;
    const dist = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);
    const raw = dist / dt;
    if (raw > maxSpeed) maxSpeed = raw;
    const norm = Math.min(raw / (maxSpeed || 0.5), 1);
    smoothedSpeed =
      smoothedSpeed * (1 - config.speedSmoothingFactor) +
      norm * config.speedSmoothingFactor;
    lastMoveTime = now;
    return smoothedSpeed;
  };

  const createImage = (speed = 0.5) => {
    const imageSrc = images[imageIndex];
    imageIndex = (imageIndex + 1) % images.length;
    const size = config.minImageSize + (config.maxImageSize - config.minImageSize) * speed;
    const rotFactor = 1 + speed * (config.maxRotationFactor - 1);
    const rot = (Math.random() - 0.5) * config.baseRotation * rotFactor;

    const img = document.createElement("img");
    img.className = "trail__img";
    img.src = imageSrc;
    img.width = img.height = size;
    const rect = container.getBoundingClientRect();
    img.style.left = `${mouseX - rect.left}px`;
    img.style.top  = `${mouseY - rect.top}px`;
    img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(0)`;
    img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}`;
    container.appendChild(img);
    setTimeout(() => {
      img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1)`;
    }, 10);
    trail.push({ element: img, rotation: rot, removeTime: Date.now() + config.imageLifespan });
  };

  const createTrailImage = () => {
    if (!isCursorInContainer || isInExcludedArea(mouseX, mouseY)) return;
    if ((isMoving || isTouching) && hasMovedEnough() && hasMovedAtAll()) {
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      createImage(calculateSpeed());
      prevMouseX = mouseX;
      prevMouseY = mouseY;
    }
  };

  const createTouchTrailImage = () => {
    if (!isCursorInContainer || !isTouching || !hasMovedAtAll()) return;
    if (isInExcludedArea(mouseX, mouseY)) return;
    const now = Date.now();
    if (now - lastTouchImageTime < config.touchImageInterval) return;
    lastTouchImageTime = now;
    createImage(calculateSpeed());
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  };


  const removeOldImages = () => {
    const now = Date.now();
    if (now - lastRemovalTime < config.removalDelay || !trail.length) return;
    if (now >= trail[0].removeTime) {
      const imgObj = trail.shift();
      imgObj.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
      imgObj.element.style.transform = `translate(-50%, -50%) rotate(${imgObj.rotation + 360}deg) scale(0)`;
      setTimeout(() => imgObj.element.remove(), config.outDuration);
      lastRemovalTime = now;
    }
  };

  const onMouseOver = (e) => {
    mouseX = lastMouseX = prevMouseX = e.clientX;
    mouseY = lastMouseY = prevMouseY = e.clientY;
    isCursorInContainer = isInContainer(mouseX, mouseY);
    document.removeEventListener("mouseover", onMouseOver);
  };
  document.addEventListener("mouseover", onMouseOver);

  let moveTimeout;
  const onMouseMove = (e) => {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    isCursorInContainer = isInContainer(mouseX, mouseY);
    if (isCursorInContainer && hasMovedAtAll()) {
      isMoving = true;
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => (isMoving = false), 100);
    }
  };
  document.addEventListener("mousemove", onMouseMove);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    prevMouseX = mouseX; prevMouseY = mouseY;
    mouseX = t.clientX; mouseY = t.clientY;
    lastMouseX = mouseX; lastMouseY = mouseY;
    isCursorInContainer = true;
    isTouching = true;
    lastMoveTime = Date.now();
  };
  const onTouchMove = (e) => {
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - prevMouseX);
    const dy = Math.abs(t.clientY - prevMouseY);
    prevMouseX = mouseX; prevMouseY = mouseY;
    mouseX = t.clientX; mouseY = t.clientY;
    isCursorInContainer = true;
    if (dy > dx) return;
    createTouchTrailImage();
  };
  const onTouchEnd = () => { isTouching = false; };
  const onDocTouchStart = (e) => {
    const t = e.touches[0];
    if (!isInContainer(t.clientX, t.clientY)) {
      isCursorInContainer = false;
      isTouching = false;
    }
  };
  container.addEventListener("touchstart", onTouchStart, { passive: true });
  container.addEventListener("touchmove",  onTouchMove,  { passive: true });
  container.addEventListener("touchend",   onTouchEnd);
  document.addEventListener("touchstart",  onDocTouchStart, { passive: true });

  let active = true;
  const animate = () => {
    if (!active) return;
    if (isMoving || isTouching) createTrailImage();
    removeOldImages();
    rafId = requestAnimationFrame(animate);
  };
  rafId = requestAnimationFrame(animate);

  return () => {
    active = false;
    cancelAnimationFrame(rafId);
    clearTimeout(moveTimeout);
    document.removeEventListener("mouseover",   onMouseOver);
    document.removeEventListener("mousemove",   onMouseMove);
    container.removeEventListener("touchstart", onTouchStart);
    container.removeEventListener("touchmove",  onTouchMove);
    container.removeEventListener("touchend",   onTouchEnd);
    document.removeEventListener("touchstart",  onDocTouchStart);
  };
}

onMounted(() => {
  setViewportHeight();
  window.addEventListener("resize", setViewportHeight, { passive: true });
  const headingElement = heroRef.value?.querySelector(".hero__heading");
  cleanupFns.push(initTrail(heroRef.value, [headingElement, ctaMoverRef.value]));
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", setViewportHeight);
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
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
  background-color: var(--color-white);
  color: var(--color-ink);
  user-select: none;
  pointer-events: none;
}

.hero__content {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  pointer-events: none;
  padding: 0 clamp(20px, 4vw, 30px) clamp(20px, 4vw, 30px);
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
  font-size: clamp(1.45rem, 2.2vw, 3rem);
  line-height: 1.16;
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
  --color-cta-bg: var(--color-bg);
  --color-ink: var(--color-white);
}


:global(.trail__img) {
  position: absolute;
  object-fit: cover;
  transform-origin: center;
  pointer-events: none;
  will-change: transform;
  z-index: 1;
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

@media (min-width: 1440px) {
  .hero__grid {
    gap: clamp(2rem, 2.2vw, 3rem);
  }

  .hero__heading {
    font-size: clamp(2rem, 2.35vw, 3.6rem);
    max-width: 48ch;
  }
}

@media (max-width: 767px) {
  .hero__content {
    padding-bottom: clamp(20px, 4vw, 30px);
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