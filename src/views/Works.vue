<template>
  <main>
    <section class="works-hero">
      <div class="works-hero__inner">
        <RevealText
          tag="h1"
          customClass="works-hero__title"
          :scroll="false"
          splitReveal="words"
          :waitForPreloader="true"
        >
          Selected Work & Experiments
        </RevealText>
      </div>
    </section>

    <section class="slider__section" aria-label="Draggable Infinite Slider">
      <div class="slider__overlay">
        <div class="slider__overlay-inner">
          <div class="slider__overlay-count">
            <div class="slider__count-col">
              <h2 data-slide-count="step" class="slider__count-heading">01</h2>
            </div>
            <div class="slider__count-divider"></div>
            <div class="slider__count-col">
              <h2 data-slide-count="total" class="slider__count-heading">04</h2>
            </div>
          </div>
          <div class="slider__overlay-nav">
            <button aria-label="previous slide" data-slider-button="prev" class="slider__btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 17 12" fill="none" class="slider__btn-arrow">
                <path d="M6.28871 12L7.53907 10.9111L3.48697 6.77778H16.5V5.22222H3.48697L7.53907 1.08889L6.28871 0L0.5 6L6.28871 12Z" fill="currentColor"></path>
              </svg>
              <div class="slider__btn-overlay">
                <div class="slider__btn-overlay-corner"></div>
                <div class="slider__btn-overlay-corner top-right"></div>
                <div class="slider__btn-overlay-corner bottom-left"></div>
                <div class="slider__btn-overlay-corner bottom-right"></div>
              </div>
            </button>
            <button aria-label="next slide" data-slider-button="next" class="slider__btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 17 12" fill="none" class="slider__btn-arrow next">
                <path d="M6.28871 12L7.53907 10.9111L3.48697 6.77778H16.5V5.22222H3.48697L7.53907 1.08889L6.28871 0L0.5 6L6.28871 12Z" fill="currentColor"></path>
              </svg>
              <div class="slider__btn-overlay">
                <div class="slider__btn-overlay-corner"></div>
                <div class="slider__btn-overlay-corner top-right"></div>
                <div class="slider__btn-overlay-corner bottom-left"></div>
                <div class="slider__btn-overlay-corner bottom-right"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div class="slider__main">
        <div class="slider__wrap">
          <div data-slider="list" class="slider__list">
            <div
              v-for="(item, idx) in slides"
              :key="item._id ?? idx"
              data-slider="slide"
              :class="['slider__slide', idx === 0 ? 'active' : '']"
            >
              <div class="slider__slide-inner">
                <video
                  v-if="item.video"
                  class="slide__video"
                  :src="item.video"
                  :poster="item.image"
                  muted
                  loop
                  playsinline
                  preload="metadata"
                  :aria-label="item.alt ?? item.title ?? 'Project video'"
                >
                  <track kind="captions" src="/captions/blank.vtt" srclang="en" label="English" default />
                </video>
                <img
                  v-else
                  :src="item.image"
                  class="slide__img"
                  :alt="item.alt ?? item.title ?? 'Project image'"
                  loading="lazy"
                  decoding="async"
                />
                <div class="slide__caption">
                  <div class="slide__caption-dot"></div>
                  <p class="slide__caption-label">{{ item.title ? item.title : `Image #${String(idx + 1).padStart(3, '0')}` }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useHead } from "@unhead/vue";
import { useRoute } from "vue-router";
import { buildHead } from "@/lib/siteMeta.js";
import Footer from "@/components/sections/Footer.vue";
import RevealText from "@/components/base/RevealText.vue";
import { fetchWorksItems } from "@/lib/sanity.js";

useHead(buildHead("/works", { title: "Works | Jalal Eddine Maoukil" }));

const fallbackGallery = [
  {
    _id: "fallback-1",
    title: "Featured Work",
    alt: "Featured work image",
    image: "https://cdn.prod.website-files.com/67696d1cd4b1d776a63f0f94/690b581b4e66ce6d99185126_Child%20in%20Sunset%20Meadow.avif",
    video: "",
  },
  {
    _id: "fallback-2",
    title: "Project Highlight",
    alt: "Project highlight image",
    image: "https://cdn.prod.website-files.com/67696d1cd4b1d776a63f0f94/690b581b644385ab3c4845f8_Woman%20in%20Coastal%20Field.avif",
    video: "",
  },
  {
    _id: "fallback-3",
    title: "Case Study",
    alt: "Case study image",
    image: "https://cdn.prod.website-files.com/67696d1cd4b1d776a63f0f94/690b581bae1e27262dcfe889_Runner%20at%20Golden%20Hour.avif",
    video: "",
  },
  {
    _id: "fallback-4",
    title: "Visual System",
    alt: "Visual system image",
    image: "https://cdn.prod.website-files.com/67696d1cd4b1d776a63f0f94/690b581b7c6e8ac0e1960406_Golden%20Hour%20Serenity.avif",
    video: "",
  },
];

const route = useRoute();
const state = route.meta?.state ?? {};
const slides = ref([]);

if (Array.isArray(state.worksItems) && state.worksItems.length) {
  slides.value = state.worksItems;
} else {
  slides.value = [...fallbackGallery];
}

const sliderCleanup = { current: null };
const scriptsReady = ref(false);

const loadScript = (src) =>
  new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

const initSlider = () => {
  if (!window.gsap) return null;
  const gsap = window.gsap;
  const Draggable = window.Draggable;
  const InertiaPlugin = window.InertiaPlugin;
  if (Draggable && InertiaPlugin) {
    gsap.registerPlugin(Draggable, InertiaPlugin);
  }
  const teardown = [];
  const addListener = (el, event, handler, options) => {
    if (!el) return;
    el.addEventListener(event, handler, options);
    teardown.push(() => el.removeEventListener(event, handler, options));
  };

  const wrapper = document.querySelector('[data-slider="list"]');
  if (!wrapper) return null;

  const slidesEls = gsap.utils.toArray('[data-slider="slide"]');
  if (!slidesEls.length) return null;

  const totalElement = document.querySelector('[data-slide-count="total"]');
  const stepElement = document.querySelector('[data-slide-count="step"]');
  const stepsParent = stepElement?.parentElement;
  const totalSlides = slidesEls.length;

  if (totalElement) totalElement.textContent = totalSlides < 10 ? `0${totalSlides}` : `${totalSlides}`;

  if (stepsParent && stepElement) {
    stepsParent.innerHTML = "";
    slidesEls.forEach((_, index) => {
      const stepClone = stepElement.cloneNode(true);
      stepClone.textContent = index + 1 < 10 ? `0${index + 1}` : `${index + 1}`;
      stepsParent.appendChild(stepClone);
    });
  }
  const allSteps = stepsParent ? stepsParent.querySelectorAll('[data-slide-count="step"]') : [];

  const mq = window.matchMedia("(min-width: 992px)");
  if (!mq.matches) {
    slidesEls.forEach((slide) => slide.classList.add("active"));

    const wrapEl = document.querySelector(".slider__wrap");
    if (!wrapEl || !("IntersectionObserver" in window)) return null;

    let currentIndex = 0;
    const setStep = (index) => {
      currentIndex = index;
      if (!allSteps.length) return;
      gsap.set(allSteps, { y: `${-100 * index}%` });
    };

    const centerOnIndex = (index) => {
      const target = slidesEls[index];
      if (!target) return;
      const wrapRect = wrapEl.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const currentScroll = wrapEl.scrollLeft;
      const delta = targetRect.left - wrapRect.left;
      const offset =
        currentScroll +
        delta +
        targetRect.width / 2 -
        wrapEl.clientWidth / 2;
      wrapEl.scrollTo({ left: offset, behavior: "smooth" });
      setStep(index);
    };

    const nextButton = document.querySelector('[data-slider-button="next"]');
    const prevButton = document.querySelector('[data-slider-button="prev"]');
    const handleNext = () => {
      const nextIndex = (currentIndex + 1) % slidesEls.length;
      centerOnIndex(nextIndex);
    };
    const handlePrev = () => {
      const prevIndex = (currentIndex - 1 + slidesEls.length) % slidesEls.length;
      centerOnIndex(prevIndex);
    };
    addListener(nextButton, "click", handleNext);
    addListener(prevButton, "click", handlePrev);

    const io = new IntersectionObserver(
      (entries) => {
        let best = null;
        entries.forEach((entry) => {
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        });
        if (best && best.isIntersecting) {
          const idx = slidesEls.indexOf(best.target);
          if (idx >= 0 && idx !== currentIndex) setStep(idx);
        }
      },
      { root: wrapEl, threshold: [0.4, 0.6, 0.8] }
    );

    slidesEls.forEach((slide) => io.observe(slide));
    setStep(0);

    return () => {
      io.disconnect();
      teardown.forEach((fn) => fn());
    };
  }

  if (!Draggable) return null;

  const slideVideos = slidesEls.map((slide) => slide.querySelector("video")).filter(Boolean);
  const nextButton = document.querySelector('[data-slider-button="next"]');
  const prevButton = document.querySelector('[data-slider-button="prev"]');

  let activeElement;

  let currentEl = null;
  let currentIndex = 0;

  function resolveActive(el) {
    return el;
  }

  function applyActive(el, index, animateNumbers = true) {
    if (activeElement) activeElement.classList.remove("active");
    const target = resolveActive(el);
    target.classList.add("active");
    activeElement = target;

    if (slideVideos.length) {
      slideVideos.forEach((video) => {
        video.pause();
        video.currentTime = 0;
      });
      const activeVideo = activeElement.querySelector("video");
      activeVideo?.play?.().catch(() => {});
    }

    if (allSteps.length) {
      if (animateNumbers) {
        gsap.to(allSteps, { y: `${-100 * index}%`, ease: "power3", duration: 0.45 });
      } else {
        gsap.set(allSteps, { y: `${-100 * index}%` });
      }
    }
  }

  const loop = horizontalLoop(slidesEls, {
    paused: true,
    draggable: true,
    center: false,
    onChange: (element, index) => {
      currentEl = element;
      currentIndex = index;
      applyActive(element, index, true);
    },
  });

  function mapClickIndex(i) { return i; }
  slidesEls.forEach((slide, i) => {
    const handleSlideClick = () => {
      if (slide.classList.contains("active")) return;
      loop.toIndex(mapClickIndex(i), { ease: "power3", duration: 0.725 });
    };
    addListener(slide, "click", handleSlideClick);
  });

  const handleNext = () => loop.next({ ease: "power3", duration: 0.725 });
  const handlePrev = () => loop.previous({ ease: "power3", duration: 0.725 });
  addListener(nextButton, "click", handleNext);
  addListener(prevButton, "click", handlePrev);

  if (!currentEl && slidesEls[0]) {
    currentEl = slidesEls[0];
    currentIndex = 0;
    applyActive(currentEl, currentIndex, false);
  }

  return () => {
    teardown.forEach((fn) => fn());
    if (loop?.cleanup) loop.cleanup();
    loop?.kill?.();
    loop?.draggable?.kill?.();
  };

  function horizontalLoop(items, config) {
    let timeline;
    items = gsap.utils.toArray(items);
    config = config || {};
    gsap.context(() => {
      let onChange = config.onChange,
        lastIndex = 0,
        tl = gsap.timeline({ repeat: config.repeat, onUpdate: onChange && function () {
          let i = tl.closestIndex();
          if (lastIndex !== i) {
            lastIndex = i;
            onChange(items[i], i);
          }
        }, paused: config.paused, defaults: { ease: "none" }, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100) }),
        length = items.length,
        startX = items[0].offsetLeft,
        times = [],
        widths = [],
        spaceBefore = [],
        xPercents = [],
        curIndex = 0,
        indexIsDirty = false,
        center = config.center,
        pixelsPerSecond = (config.speed || 1) * 100,
        snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
        timeOffset = 0,
        container = center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode,
        totalWidth,
        getTotalWidth = () => items[length - 1].offsetLeft + xPercents[length - 1] / 100 * widths[length - 1] - startX + spaceBefore[0] + items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") + (parseFloat(config.paddingRight) || 0),
        populateWidths = () => {
          let b1 = container.getBoundingClientRect(), b2;
          items.forEach((el, i) => {
            widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
            xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / widths[i] * 100 + gsap.getProperty(el, "xPercent"));
            b2 = el.getBoundingClientRect();
            spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
            b1 = b2;
          });
          gsap.set(items, { xPercent: i => xPercents[i] });
          totalWidth = getTotalWidth();
        },
        timeWrap,
        populateOffsets = () => {
          timeOffset = center ? tl.duration() * (container.offsetWidth / 2) / totalWidth : 0;
          center && times.forEach((t, i) => {
            times[i] = timeWrap(tl.labels["label" + i] + tl.duration() * widths[i] / 2 / totalWidth - timeOffset);
          });
        },
        getClosest = (values, value, wrap) => {
          let i = values.length,
            closest = 1e10,
            index = 0, d;
          while (i--) {
            d = Math.abs(values[i] - value);
            if (d > wrap / 2) {
              d = wrap - d;
            }
            if (d < closest) {
              closest = d;
              index = i;
            }
          }
          return index;
        },
        populateTimeline = () => {
          let i, item, curX, distanceToStart, distanceToLoop;
          tl.clear();
          for (i = 0; i < length; i++) {
            item = items[i];
            curX = xPercents[i] / 100 * widths[i];
            distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
            distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
            tl.to(item, { xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond }, 0)
              .fromTo(item, { xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100) }, { xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false }, distanceToLoop / pixelsPerSecond)
              .add("label" + i, distanceToStart / pixelsPerSecond);
            times[i] = distanceToStart / pixelsPerSecond;
          }
          timeWrap = gsap.utils.wrap(0, tl.duration());
        },
        refresh = (deep) => {
          let progress = tl.progress();
          tl.progress(0, true);
          populateWidths();
          deep && populateTimeline();
          populateOffsets();
          deep && tl.draggable ? tl.time(times[curIndex], true) : tl.progress(progress, true);
        },
        onResize = () => refresh(true),
        proxy;
      gsap.set(items, { x: 0 });
      populateWidths();
      populateTimeline();
      populateOffsets();
      window.addEventListener("resize", onResize);
      tl.cleanup = () => window.removeEventListener("resize", onResize);
      function toIndex(index, vars) {
        vars = vars || {};
        (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
        let newIndex = gsap.utils.wrap(0, length, index),
          time = times[newIndex];
        if (time > tl.time() !== index > curIndex && index !== curIndex) {
          time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        if (time < 0 || time > tl.duration()) {
          vars.modifiers = { time: timeWrap };
        }
        curIndex = newIndex;
        vars.overwrite = true;
        gsap.killTweensOf(proxy);
        return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
      }
      tl.toIndex = (index, vars) => toIndex(index, vars);
      tl.closestIndex = setCurrent => {
        let index = getClosest(times, tl.time(), tl.duration());
        if (setCurrent) {
          curIndex = index;
          indexIsDirty = false;
        }
        return index;
      };
      tl.current = () => indexIsDirty ? tl.closestIndex(true) : curIndex;
      tl.next = vars => toIndex(tl.current() + 1, vars);
      tl.previous = vars => toIndex(tl.current() - 1, vars);
      tl.times = times;
      tl.progress(1, true).progress(0, true);
      if (config.reversed) {
        tl.vars.onReverseComplete();
        tl.reverse();
      }
      if (config.draggable && typeof (Draggable) === "function") {
        proxy = document.createElement("div");
        let wrap = gsap.utils.wrap(0, 1),
          ratio, startProgress, draggable, dragSnap, lastSnap, initChangeX, wasPlaying,
          align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio)),
          syncIndex = () => tl.closestIndex(true);
        draggable = Draggable.create(proxy, {
          trigger: items[0].parentNode,
          type: "x",
          onPressInit() {
            let x = this.x;
            gsap.killTweensOf(tl);
            wasPlaying = !tl.paused();
            tl.pause();
            startProgress = tl.progress();
            refresh();
            ratio = 1 / totalWidth;
            initChangeX = (startProgress / -ratio) - x;
            gsap.set(proxy, { x: startProgress / -ratio });
          },
          onDrag: align,
          onThrowUpdate: align,
          overshootTolerance: 0,
          inertia: true,
          snap(value) {
            if (Math.abs(startProgress / -ratio - this.x) < 10) {
              return lastSnap + initChangeX;
            }
            let time = -(value * ratio) * tl.duration(),
              wrappedTime = timeWrap(time),
              snapTime = times[getClosest(times, wrappedTime, tl.duration())],
              dif = snapTime - wrappedTime;
            Math.abs(dif) > tl.duration() / 2 && (dif += dif < 0 ? tl.duration() : -tl.duration());
            lastSnap = (time + dif) / tl.duration() / -ratio;
            return lastSnap;
          },
          onRelease() {
            syncIndex();
            draggable.isThrowing && (indexIsDirty = true);
          },
          onThrowComplete: () => {
            syncIndex();
            wasPlaying && tl.play();
          }
        })[0];
        tl.draggable = draggable;
      }
      tl.closestIndex(true);
      lastIndex = curIndex;
      onChange && onChange(items[curIndex], curIndex);
      timeline = tl;
      return () => window.removeEventListener("resize", onResize);
    });
    return timeline;
  }
};

onMounted(async () => {
  if (!Array.isArray(state.worksItems) || !state.worksItems.length) {
    const items = await fetchWorksItems();
    if (items.length) {
      slides.value = items;
      state.worksItems = items;
    }
  }
  await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Draggable.min.js");
  await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/InertiaPlugin.min.js");
  scriptsReady.value = true;
  sliderCleanup.current = initSlider();
});

watch(
  () => slides.value,
  async () => {
    if (!scriptsReady.value) return;
    if (sliderCleanup.current) sliderCleanup.current();
    await nextTick();
    sliderCleanup.current = initSlider();
  },
  { deep: false }
);

onBeforeUnmount(() => {
  if (sliderCleanup.current) sliderCleanup.current();
});
</script>

<style scoped>
  .works-hero {
    min-height: 100svh;
    background: var(--color-white);
    color: var(--color-ink);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: clamp(2rem, 8vw, 6rem);
    position: sticky;
    top: 0;
    overflow: hidden;
  }

  .works-hero__title {
    font-size: clamp(2.8rem, 6vw, 6rem);
    line-height: 1.05;
    text-transform: uppercase;
    letter-spacing: var(--tracking-display);
    margin: 0;
  }

  .slider__section {
    --overlay-width: clamp(240px, 30vw, 480px);
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    display: flex;
    position: relative;
    background-color: var(--color-bg);
  }

  .slider__main {
    z-index: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0%;
    overflow: hidden;
    padding-left: var(--overlay-width);
    padding-right: var(--gutter);
    box-sizing: border-box;
  }

  .slider__wrap {
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 100%;
    display: flex;
  }

  .slider__list {
    flex-flow: row;
    justify-content: flex-start;
    align-items: stretch;
    display: flex;
    position: relative;
  }

  .slider__slide {
    aspect-ratio: 16 / 9;
    flex: none;
    width: clamp(420px, 70vw, 1200px);
    max-width: calc(100vw - var(--overlay-width) - (var(--gutter) * 2));
    padding-left: clamp(0.5rem, 1.5vw, 1.5rem);
    padding-right: clamp(0.5rem, 1.5vw, 1.5rem);
    transition: opacity 0.4s;
    position: relative;
    z-index: 0;
  }

  .slider__slide-inner {
    border-radius: 0;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  .slide__img,
  .slide__video {
    object-fit: cover;
    width: 100%;
    height: 100%;
    display: block;
  }

  .slide__caption {
    z-index: 2;
    grid-column-gap: 0.4em;
    grid-row-gap: 0.4em;
    backdrop-filter: blur(5px);
    color: var(--color-white);
    white-space: nowrap;
    background-color: rgba(237, 237, 237, 0.15);
    border-radius: 0.25em;
    justify-content: flex-start;
    align-items: center;
    padding: 0.4em 0.75em 0.4em 0.5em;
    display: flex;
    position: absolute;
    top: 1.25em;
    left: 1.25em;
    overflow: hidden;
    transition: transform 0.525s cubic-bezier(0.625, 0.05, 0, 1), opacity 0.525s cubic-bezier(0.625, 0.05, 0, 1);
    opacity: 0;
    transform: translate(-25%, 0px);
  }

  .slide__caption-dot {
    background-color: var(--color-white);
    border-radius: 10em;
    flex: none;
    width: 0.5em;
    height: 0.5em;
  }

  .slide__caption-label {
    margin: 0;
    font-size: 0.75em;
    line-height: 1.5;
  }

  .slider__overlay {
    z-index: 2;
    color: var(--color-white);
    background-image: linear-gradient(90deg, var(--color-bg) 85%, rgba(0, 0, 0, 0));
    justify-content: flex-start;
    align-items: center;
    width: var(--overlay-width);
    height: 100%;
    padding-left: 2em;
    display: flex;
    position: absolute;
    inset: 0% auto 0% 0%;
  }

  .slider__overlay-inner {
    flex-flow: column;
    justify-content: space-between;
    align-items: flex-start;
    height: 28.125em;
    display: flex;
  }

  .slider__overlay-count {
    grid-column-gap: 0.2em;
    grid-row-gap: 0.2em;
    flex-flow: row;
    justify-content: flex-start;
    align-items: center;
    font-size: 4.5em;
    font-weight: 700;
    display: flex;
    font-family: var(--font-main);
  }

  .slider__count-col {
    height: 1em;
    overflow: hidden;
  }

  .slider__count-heading {
    width: 2ch;
    margin: 0;
    font-size: 1em;
    font-weight: 400;
    line-height: 1;
  }

  .slider__count-divider {
    background-color: var(--color-white);
    width: 2px;
    height: 0.75em;
    transform: rotate(15deg);
  }

  .slider__overlay-nav {
    grid-column-gap: 2em;
    grid-row-gap: 2em;
    display: flex;
  }

  .slider__btn {
    color: var(--color-white);
    background-color: transparent;
    border: 1px solid rgba(237, 237, 237, 0.2);
    border-radius: 0.4em;
    justify-content: center;
    align-items: center;
    width: 4em;
    height: 4em;
    padding: 0;
    display: flex;
    position: relative;
    transition: transform 0.475s cubic-bezier(0.625, 0.05, 0, 1), opacity 0.475s cubic-bezier(0.625, 0.05, 0, 1);
    cursor: pointer;
  }

  .slider__btn-arrow {
    flex: none;
    width: 1em;
    height: 0.75em;
  }

  .slider__btn-arrow.next {
    transform: rotate(180deg);
  }

  .slider__btn-overlay {
    z-index: 2;
    position: absolute;
    inset: -1px;
    transition: transform 0.475s cubic-bezier(0.625, 0.05, 0, 1), opacity 0.475s cubic-bezier(0.625, 0.05, 0, 1);
  }

  .slider__btn-overlay-corner {
    border-top: 1px solid var(--color-white);
    border-left: 1px solid var(--color-white);
    border-top-left-radius: 0.4em;
    width: 1em;
    height: 1em;
  }

  .slider__btn-overlay-corner.top-right {
    position: absolute;
    inset: 0% 0% auto auto;
    transform: rotate(90deg);
  }

  .slider__btn-overlay-corner.bottom-right {
    position: absolute;
    inset: auto 0% 0% auto;
    transform: rotate(180deg);
  }

  .slider__btn-overlay-corner.bottom-left {
    position: absolute;
    inset: auto auto 0% 0%;
    transform: rotate(-90deg);
  }

  .slider__btn:hover .slider__btn-overlay {
    transform: scale(1.4);
  }

  .slider__overlay-nav:hover:has(.slider__btn:hover) .slider__btn {
    opacity: 0.4;
  }

  .slider__btn:hover {
    transform: scale(0.85);
    opacity: 1 !important;
  }

  [data-slider="slide"] {
    opacity: 0.2;
  }

  [data-slider="slide"].active {
    opacity: 1;
    z-index: 1;
  }

  [data-slider="slide"].active .slide__caption {
    opacity: 1;
    transform: translate(0%, 0px);
    transition-delay: 0.3s;
  }

  @media screen and (max-width: 991px) {
    .slider__section {
      --overlay-width: 0px;
      flex-direction: column;
      min-height: auto;
      padding: clamp(2rem, 6vw, 3rem) 0;
    }

    .slider__main {
      position: relative;
      height: auto;
      padding-left: 0;
      padding-right: 0;
      overflow: visible;
    }

    .slider__wrap {
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 0.5rem;
      scrollbar-width: none;
    }

    .slider__wrap::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    .slider__list {
      flex-direction: row;
      align-items: center;
      gap: clamp(1.25rem, 4vw, 2rem);
      padding: 0 clamp(1rem, 4vw, 2rem);
    }

    .slider__slide {
      width: min(86vw, 520px);
      max-width: 86vw;
      padding-left: 0;
      padding-right: 0;
      scroll-snap-align: center;
    }

    .slider__overlay {
      width: 100%;
      position: relative;
      inset: auto;
      padding-bottom: 1.5em;
      background-image: none;
    }

    .slider__overlay-inner {
      grid-column-gap: 2em;
      grid-row-gap: 2em;
      height: auto;
    }

    [data-slider="slide"] {
      opacity: 1;
    }

    .slide__caption {
      opacity: 1;
      transform: translate(0%, 0px);
      transition: none;
    }
  }

  @media screen and (max-width: 479px) {
    .slider__overlay {
      padding-left: 1.25em;
    }

    .slider__slide {
      width: 96vw;
      padding-left: 0;
      padding-right: 0;
    }

    .slide__caption {
      top: 0.5em;
      left: 0.5em;
    }
  }
</style>


