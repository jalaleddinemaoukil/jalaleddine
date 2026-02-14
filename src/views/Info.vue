<template>
  <main class="info-page">
    <section class="info-hero" aria-labelledby="about-hero-title">
      <div class="shell info-hero__inner">
        <h1 id="about-hero-title" class="info-hero__title">ABOUT ME</h1>
      </div>
    </section>

    <section class="info-split" aria-label="About details">
      <div class="info-split__grid">
        <aside class="info-media" aria-label="Profile visual">
          <picture class="info-media__picture">
            <img
              class="info-media__img"
              :src="aboutImage"
              :srcset="imageSrcset"
              sizes="(max-width: 991px) 100vw, 42vw"
              width="1200"
              height="1500"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              alt="Jalal Eddine Maoukil portrait"
            />
          </picture>
        </aside>

        <div class="info-content">
          <section
            ref="truthSectionRef"
            class="info-block info-block--truth"
            aria-labelledby="truth-title"
          >
            <RevealText
              tag="h2"
              id="truth-title"
              customClass="info-title"
              :scroll="true"
              splitReveal="lines"
            >
              What I Do
            </RevealText>
            <div ref="truthProseRef" class="info-prose info-truth-prose">
              <RevealText tag="p" :scroll="true" splitReveal="lines">
                I build websites and web applications that actually work under pressure.
                Fast load times. Clean code. Systems that scale without falling apart when traffic picks up.
              </RevealText>
              <p>
                I focus on the details most people skip: performance optimization, accessible design,
                and making sure everything from typography to database queries is intentional.
              </p>
              <p>My design philosophy? Keep it minimal. Keep it functional. Make it feel effortless.</p>
            </div>
          </section>

          <section class="info-block" aria-labelledby="bio-title">
            <RevealText tag="h2" id="bio-title" customClass="info-title" :scroll="true" splitReveal="lines">
              Bio
            </RevealText>
            <div class="info-copy-stack">
              <p>
                Based in Rabat, Morocco. Engineer and designer who cannot stop
                thinking about how things are built.
              </p>
              <p>
                Right now I am working on SWAMP, a real-time IoT platform for smart agriculture.
                It is a big technical project involving sensor data, cloud infrastructure,
                and making sure farmers can rely on live information without the system breaking.
              </p>
              <p>
                When I am not coding or fixing layout issues at 3 AM, I am probably exploring new typefaces,
                optimizing page speed scores, or figuring out why a database query is taking 3 seconds
                instead of 30 milliseconds.
              </p>
              <p>I believe in building things that last, not just launch.</p>
            </div>
          </section>

          <section class="info-block info-block--dark" aria-labelledby="focus-title">
            <RevealText tag="h2" id="focus-title" customClass="info-title" :scroll="true" splitReveal="lines">
              Focus
            </RevealText>
            <p class="info-copy info-copy--light">
              Web development, design, full-stack engineering, and cloud architecture.
            </p>
          </section>

          <section class="info-block" aria-labelledby="tools-title">
            <RevealText tag="h2" id="tools-title" customClass="info-title" :scroll="true" splitReveal="lines">
              Stack
            </RevealText>
            <p class="info-stack-inline">
              Built with React, Vue.js, Framer, TailwindCSS, GSAP, Node.js, TypeScript, Azure, PostgreSQL, and Claude AI.
            </p>
            <ul class="info-stack-list" aria-label="Technology stack">
              <li>React</li>
              <li>Vue.js</li>
              <li>Framer</li>
              <li>TailwindCSS</li>
              <li>GSAP</li>
              <li>Node.js</li>
              <li>TypeScript</li>
              <li>Azure</li>
              <li>PostgreSQL</li>
              <li>Claude AI</li>
            </ul>
          </section>         
        </div>
      </div>
    </section>

    <div class="info-page__footer">
      <Footer variant="dark" />
    </div>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import { buildHead } from "@/lib/siteMeta.js";
import RevealText from "@/components/base/RevealText.vue";
import Footer from "@/components/sections/Footer.vue";
import aboutImage from "@/assets/images/about-jalal-eddine-image.webp";
import profile320 from "@/assets/images/profile-320.webp";
import profile480 from "@/assets/images/profile-480.webp";
import profile640 from "@/assets/images/profile-640.webp";
import profile800 from "@/assets/images/profile-800.webp";

const truthSectionRef = ref(null);
const truthProseRef = ref(null);
const chromeClock = ref("");

const imageSrcset = `${profile320} 320w, ${profile480} 480w, ${profile640} 640w, ${profile800} 800w, ${aboutImage} 1200w`;

let truthCtx = null;
let resizeRaf = 0;
let clockTimer = 0;

const isCompactViewport = () =>
  typeof window !== "undefined" && window.matchMedia?.("(max-width: 991px)")?.matches;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    navigator.connection?.saveData === true);

const ensurePlugins = () => {
  if (typeof window === "undefined") return null;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return null;
  gsap.registerPlugin(ScrollTrigger);
  return { gsap };
};

const clearTruthInlineStyles = () => {
  truthProseRef.value?.style?.removeProperty("transform");
  truthProseRef.value?.style?.removeProperty("opacity");
  truthProseRef.value?.style?.removeProperty("visibility");
};

const buildTruthAnimation = () => {
  truthCtx?.revert();
  truthCtx = null;

  const section = truthSectionRef.value;
  const prose = truthProseRef.value;
  if (!section || !prose) return;

  const pack = ensurePlugins();
  if (!pack || prefersReducedMotion() || isCompactViewport()) {
    clearTruthInlineStyles();
    return;
  }

  const { gsap } = pack;

  truthCtx = gsap.context(() => {
    gsap.set(prose, { autoAlpha: 0, y: 18 });

    gsap.to(prose, {
      autoAlpha: 1,
      y: 0,
      duration: 0.55,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 62%",
        once: true,
        invalidateOnRefresh: true,
      },
    });
  }, section);
};

const onResize = () => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    buildTruthAnimation();
    window.ScrollTrigger?.refresh?.();
  });
};

const formatChromeClock = () => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Casablanca",
    }).format(new Date());
  } catch {
    return "";
  }
};

const syncChromeClock = () => {
  chromeClock.value = formatChromeClock();
};

useHead(
  buildHead("/info", {
    title: "About | Jalal Eddine Maoukil",
    description:
      "Learn about Jalal Eddine Maoukil, a software engineer and web designer based in Rabat building high-performance websites and web applications for growing businesses.",
    keywords:
      "About Jalal Eddine Maoukil, Software Engineer Rabat, Web Designer Morocco, Web Application Developer, Website Performance Optimization",
  })
);

onMounted(() => {
  buildTruthAnimation();
  syncChromeClock();
  clockTimer = window.setInterval(syncChromeClock, 60000);
  window.addEventListener("resize", onResize, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  if (clockTimer) window.clearInterval(clockTimer);
  truthCtx?.revert();
  truthCtx = null;
});
</script>

<style scoped>
.info-page {
  position: relative;
  width: 100%;
  max-width: 100%;
  background: var(--color-white);
  color: var(--color-ink);
  overflow-x: hidden;
  overflow-x: clip;
  -webkit-text-size-adjust: 100%;
}

.info-hero {
  position: sticky;
  top: 0;
  z-index: 3;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-white);
  border-bottom: 1px solid rgba(5, 5, 5, 0.1);
}

@supports (height: 100dvh) {
  .info-hero {
    height: 100dvh;
    min-height: 100dvh;
  }
}

.info-hero__inner {
  width: 100%;
  max-width: none;
  padding-inline: var(--gutter);
  text-align: center;
}

.info-hero__title {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 0.95;
  font-size: clamp(3rem, 13vw, 10.5rem);
}

.info-mobile-chrome,
.info-stack-inline,
.info-mobile-section {
  display: none;
}

.info-mobile-chrome__meta {
  display: none;
}

.info-split {
  position: relative;
  z-index: 3;
  margin-top: 0;
  border-top: 1px solid rgba(5, 5, 5, 0.08);
}

.info-split__grid {
  width: 100%;
  max-width: 100%;
  display: grid;
  grid-template-columns: minmax(300px, 42vw) minmax(0, 1fr);
  align-items: start;
  gap: 0;
}

.info-media {
  position: sticky;
  top: 0;
  height: 100vh;
  min-height: 100svh;
  overflow: hidden;
}

@supports (height: 100dvh) {
  .info-media {
    height: 100dvh;
    min-height: 100dvh;
  }
}

.info-media__picture,
.info-media__img {
  width: 100%;
  height: 100%;
}

.info-media__img {
  object-fit: cover;
  object-position: center;
  transform: scale(1.04);
}



.info-content {
  width: 100%;
  min-width: 0;
  padding: 0;
  display: grid;
  gap: 0;
}

.info-block {
  min-height: 100vh;
  min-height: 100svh;
  display: grid;
  align-content: center;
  gap: clamp(1.2rem, 2.2vw, 2rem);
  padding: 0 clamp(1.35rem, 3.4vw, 3.5rem);
  border-bottom: 1px solid rgba(5, 5, 5, 0.1);
}

@supports (min-height: 100dvh) {
  .info-block {
    min-height: 100dvh;
  }
}

.info-block:last-child {
  border-bottom: 0;
}

.info-block--truth,
.info-block--dark,
.info-block--talk {
  color: var(--color-ink);
}

.info-block--truth,
.info-block--dark {
  background-color: var(--color-white);
}

.info-block--talk {
  background-color: var(--color-dark);
}

.info-title {
  margin: 0;
  width: 100%;
  text-transform: none;
  letter-spacing: 0.015em;
  line-height: 1.03;
  font-size: clamp(2.15rem, 5.6vw, 5.2rem);
  font-weight: 500;
  text-wrap: balance;
}

.info-copy {
  margin: 0;
  width: 100%;
  max-width: none;
  font-size: clamp(1.02rem, 1.35vw, 1.28rem);
  line-height: 1.74;
  color: rgba(5, 5, 5, 0.84);
  text-wrap: pretty;
}

.info-copy--light {
  color: rgba(237, 237, 237, 0.9);
}

.info-copy-stack {
  display: grid;
  gap: clamp(0.75rem, 1.6vw, 1.1rem);
}

.info-copy-stack p {
  margin: 0;
  width: 100%;
  max-width: none;
  font-size: clamp(1rem, 1.2vw, 1.15rem);
  line-height: 1.76;
  color: rgba(5, 5, 5, 0.84);
  text-wrap: pretty;
}

.info-prose {
  display: grid;
  gap: clamp(0.75rem, 1.5vw, 1rem);
}

.info-prose p {
  margin: 0;
  width: 100%;
  max-width: none;
  font-size: clamp(1rem, 1.15vw, 1.13rem);
  line-height: 1.76;
  color: rgba(5, 5, 5, 0.84);
  text-wrap: pretty;
}

.info-block--truth .info-prose p,
.info-block--dark .info-prose p,
.info-block--talk .info-prose p,
.info-block--dark .info-copy-stack p,
.info-block--talk .info-copy-stack p {
  color: rgba(237, 237, 237, 0.9);
}


.info-truth-prose {
  will-change: transform, opacity;
}

.info-emphasis {
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
  font-size: clamp(0.78rem, 1vw, 0.9rem);
  color: var(--color-white);
}

.info-stack-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem 1.2rem;
}

.info-stack-list li {
  position: relative;
  padding-left: 0.9rem;
  font-size: clamp(0.98rem, 1.08vw, 1.1rem);
  line-height: 1.6;
  color: rgba(5, 5, 5, 0.86);
  text-wrap: pretty;
}

.info-stack-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.6em;
  width: 0.32rem;
  height: 0.32rem;
  border-radius: 999px;
  background: currentColor;
}

.info-page__footer {
  z-index: 6;
}

@media (min-width: 768px) {
  .info-page {
    background:
      radial-gradient(120% 88% at 50% 0%, #0d0d0d 0%, #050505 62%),
      linear-gradient(180deg, #060606 0%, #040404 100%);
    color: rgba(237, 237, 237, 0.92);
  }

  .info-page::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.14;
    mix-blend-mode: soft-light;
    background:
      repeating-linear-gradient(
        0deg,
        rgba(237, 237, 237, 0.024) 0px,
        rgba(237, 237, 237, 0.024) 1px,
        transparent 1px,
        transparent 4px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(237, 237, 237, 0.02) 0px,
        rgba(237, 237, 237, 0.02) 1px,
        transparent 1px,
        transparent 5px
      );
  }

  .info-page > * {
    position: relative;
    z-index: 1;
  }

  .info-hero {
    position: relative;
    top: auto;
    height: auto;
    min-height: 0;
    display: block;
    border-bottom: 0;
    background: transparent;
  }

  .info-hero__inner {
    padding-block: clamp(0.7rem, 1.8vh, 1.2rem);
    padding-inline: clamp(1.2rem, 2.1vw, 2.2rem);
    text-align: left;
  }

  .info-mobile-chrome {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: start;
    border-bottom: 1px solid rgba(237, 237, 237, 0.13);
    padding-bottom: clamp(0.7rem, 1.5vh, 1rem);
    margin-bottom: clamp(0.45rem, 1.2vh, 0.8rem);
  }

  .info-mobile-chrome__brand {
    margin: 0;
    font-size: clamp(0.82rem, 0.72rem + 0.25vw, 1rem);
    line-height: 1;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.92);
  }

  .info-mobile-chrome__meta {
    display: grid;
    justify-items: center;
    gap: 0.08rem;
    margin: 0;
    font-size: clamp(0.62rem, 0.57rem + 0.18vw, 0.76rem);
    line-height: 1.2;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.72);
  }

  .info-mobile-chrome__menu {
    display: grid;
    justify-items: end;
    gap: 0.28rem;
    justify-self: end;
  }

  .info-mobile-chrome__menu span {
    display: block;
    width: 1.55rem;
    height: 1px;
    background: rgba(237, 237, 237, 0.84);
  }

  .info-mobile-chrome__menu span:last-child {
    width: 1.05rem;
  }

  .info-hero__title {
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

  .info-split {
    border-top: 0;
    background: transparent;
  }

  .info-split__grid {
    grid-template-columns: minmax(0, 1fr) minmax(20rem, 33vw);
    align-items: start;
    gap: clamp(2rem, 4vw, 4.6rem);
    padding-inline: clamp(1.2rem, 2.1vw, 2.2rem);
  }

  .info-content {
    display: contents;
  }

  .info-media {
    grid-column: 2;
    grid-row: 1;
    position: relative;
    top: auto;
    height: auto;
    min-height: 0;
    padding-top: clamp(1rem, 2.2vh, 1.8rem);
    border: 0;
    background: transparent;
  }

  .info-media__picture {
    width: min(32vw, 27rem);
    aspect-ratio: 0.74;
    height: auto;
    margin-left: auto;
    border: 1px solid rgba(237, 237, 237, 0.24);
    box-shadow: 0 26px 60px rgba(0, 0, 0, 0.42);
    background: #060606;
    overflow: hidden;
  }

  .info-media__img {
    transform: none;
    object-position: center 16%;
  }

  .info-media__shade {
    background: linear-gradient(180deg, rgba(5, 5, 5, 0.06) 0%, rgba(5, 5, 5, 0.34) 100%);
  }

  .info-block {
    grid-column: 1 / -1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(7rem, 18%) minmax(0, 1fr);
    align-content: start;
    align-items: start;
    gap: clamp(0.95rem, 2vw, 1.6rem);
    padding-block: clamp(1.9rem, 4.2vh, 3rem);
    padding-inline: 0;
    border-top: 1px solid rgba(237, 237, 237, 0.13);
    border-bottom: 0;
    background: transparent !important;
    color: rgba(237, 237, 237, 0.94);
  }

  .info-block--truth {
    grid-column: 1;
    grid-row: 1;
    align-self: start;
    padding-top: clamp(1rem, 2.2vh, 1.8rem);
  }

  .info-title {
    grid-column: 1;
    margin-top: 0.14rem;
    font-size: clamp(0.72rem, 0.65rem + 0.22vw, 0.9rem);
    line-height: 1.2;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.8);
  }

  .info-block :is(.info-prose, .info-copy-stack, .info-copy, .info-stack-list, .info-stack-inline) {
    grid-column: 2;
  }

  .info-prose {
    gap: clamp(0.9rem, 1.7vw, 1.25rem);
  }

  .info-copy,
  .info-prose p,
  .info-copy-stack p,
  .info-stack-inline,
  .info-stack-list li {
    margin: 0;
    font-size: clamp(1rem, 0.92rem + 0.28vw, 1.3rem);
    line-height: 1.38;
    letter-spacing: 0.008em;
    color: rgba(237, 237, 237, 0.95);
  }

  .info-copy-stack {
    gap: clamp(0.8rem, 1.6vw, 1.1rem);
  }

  .info-copy--light {
    color: rgba(237, 237, 237, 0.95);
  }

  .info-block--truth .info-prose p,
  .info-block--dark .info-prose p,
  .info-block--dark .info-copy-stack p {
    color: rgba(237, 237, 237, 0.95);
  }

  .info-stack-inline {
    display: block;
  }

  .info-stack-list {
    display: none;
  }

  .info-truth-prose {
    will-change: auto;
  }

  .info-mobile-section {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: minmax(7rem, 18%) minmax(0, 1fr);
    align-items: start;
    gap: clamp(0.95rem, 2vw, 1.6rem);
    border-top: 1px solid rgba(237, 237, 237, 0.13);
    padding-block: clamp(2rem, 4.8vh, 3.2rem);
    padding-inline: 0;
  }

  .info-mobile-index__lead {
    grid-column: 1;
    margin: 0;
    font-size: clamp(0.68rem, 0.61rem + 0.16vw, 0.8rem);
    line-height: 1.3;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.72);
  }

  .info-mobile-index__title {
    grid-column: 2;
    margin: 0;
    font-size: clamp(0.82rem, 0.77rem + 0.2vw, 1rem);
    line-height: 1.32;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.88);
  }

  .info-mobile-index__links {
    grid-column: 2;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, max-content));
    gap: 0.5rem clamp(1.2rem, 2.8vw, 2.6rem);
  }

  .info-mobile-index__links a {
    color: rgba(237, 237, 237, 0.94);
    text-decoration: none;
    font-size: clamp(0.9rem, 0.84rem + 0.22vw, 1.06rem);
    line-height: 1.32;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-mobile-contact__line {
    grid-column: 1 / -1;
    margin: 0;
    font-size: clamp(2.1rem, 1.46rem + 2.2vw, 4rem);
    line-height: 1.08;
    letter-spacing: 0.005em;
    color: rgba(237, 237, 237, 0.96);
  }

  .info-mobile-contact__word {
    font-size: 1.04em;
  }

  .info-mobile-contact__arrow {
    color: rgba(237, 237, 237, 0.96);
    margin-inline: 0.24rem 0.36rem;
  }

  .info-mobile-contact a {
    color: rgba(237, 237, 237, 0.96);
    text-decoration: none;
  }

  .info-mobile-legal {
    grid-template-columns: minmax(7rem, 18%) minmax(0, 1fr);
    align-items: end;
    padding-bottom: clamp(2.1rem, 4.8vh, 3.4rem);
    border-bottom: 1px solid rgba(237, 237, 237, 0.13);
  }

  .info-mobile-legal p {
    grid-column: 1;
    margin: 0;
    font-size: clamp(0.68rem, 0.62rem + 0.16vw, 0.82rem);
    line-height: 1.3;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.72);
  }

  .info-mobile-legal__links {
    grid-column: 2;
    display: flex;
    justify-content: flex-end;
    gap: clamp(0.8rem, 1.7vw, 1.7rem);
  }

  .info-mobile-legal__links a {
    color: rgba(237, 237, 237, 0.9);
    text-decoration: none;
    font-size: clamp(0.76rem, 0.7rem + 0.2vw, 0.92rem);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
}

@media (max-width: 767px) {
  .info-page {
    background:
      radial-gradient(120% 80% at 50% 0%, #0c0c0c 0%, #050505 64%),
      linear-gradient(180deg, #060606 0%, #040404 100%);
    color: rgba(237, 237, 237, 0.92);
  }

  .info-page::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.18;
    mix-blend-mode: soft-light;
    background:
      repeating-linear-gradient(
        0deg,
        rgba(237, 237, 237, 0.025) 0px,
        rgba(237, 237, 237, 0.025) 1px,
        transparent 1px,
        transparent 4px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(237, 237, 237, 0.018) 0px,
        rgba(237, 237, 237, 0.018) 1px,
        transparent 1px,
        transparent 5px
      );
  }

  .info-page > * {
    position: relative;
    z-index: 1;
  }

  .info-hero {
    position: relative;
    top: auto;
    height: auto;
    min-height: 0;
    display: block;
    padding-top: calc(0.75rem + env(safe-area-inset-top));
    border-bottom: 0;
    background: transparent;
  }

  .info-hero__inner {
    padding-inline-start: calc(clamp(0.95rem, 4vw, 1.2rem) + env(safe-area-inset-left));
    padding-inline-end: calc(clamp(0.95rem, 4vw, 1.2rem) + env(safe-area-inset-right));
    text-align: left;
  }

  .info-mobile-chrome {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 2.5rem;
    padding-block: 0.35rem 0.25rem;
    margin-bottom: clamp(0.75rem, 2.4vh, 1.2rem);
  }

  .info-mobile-chrome__brand {
    margin: 0;
    font-size: clamp(0.86rem, 3vw, 1rem);
    line-height: 1;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.9);
  }

  .info-mobile-chrome__meta {
    display: none;
  }

  .info-mobile-chrome__menu {
    display: grid;
    justify-items: end;
    gap: 0.28rem;
  }

  .info-mobile-chrome__menu span {
    display: block;
    width: 1.35rem;
    height: 1px;
    background: rgba(237, 237, 237, 0.82);
  }

  .info-mobile-chrome__menu span:last-child {
    width: 0.88rem;
  }

  .info-hero__title {
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

  .info-split {
    border-top: 0;
    background: transparent;
  }

  .info-split__grid {
    display: block;
  }

  .info-media {
    position: relative;
    top: auto;
    height: clamp(22rem, 72svh, 34rem);
    min-height: 22rem;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding-top: clamp(4.25rem, 14svh, 8rem);
    padding-right: calc(clamp(0.95rem, 4vw, 1.2rem) + env(safe-area-inset-right));
    padding-bottom: clamp(2.2rem, 8svh, 4rem);
    padding-left: calc(clamp(0.95rem, 4vw, 1.2rem) + env(safe-area-inset-left));
    border-right: 0;
    border-bottom: 1px solid rgba(237, 237, 237, 0.14);
    background: transparent;
  }

  .info-media__picture {
    width: min(57vw, 17rem);
    aspect-ratio: 0.76;
    height: auto;
    margin: 0;
    border: 1px solid rgba(237, 237, 237, 0.26);
    box-shadow: 0 22px 52px rgba(0, 0, 0, 0.42);
    overflow: hidden;
    background: #070707;
  }

  .info-media__img {
    transform: none;
    object-position: center 18%;
  }

  .info-media__shade {
    background: linear-gradient(180deg, rgba(10, 10, 10, 0.04) 0%, rgba(5, 5, 5, 0.36) 100%);
  }

  .info-content {
    padding: 0;
  }

  .info-block {
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(4.6rem, 33%) minmax(0, 1fr);
    align-content: start;
    align-items: start;
    gap: clamp(0.7rem, 2.4vw, 1rem) clamp(0.9rem, 3.4vw, 1.4rem);
    padding-block: clamp(1.45rem, 4.7vh, 2.2rem);
    padding-inline-start: calc(clamp(0.95rem, 4vw, 1.2rem) + env(safe-area-inset-left));
    padding-inline-end: calc(clamp(0.95rem, 4vw, 1.2rem) + env(safe-area-inset-right));
    border-top: 1px solid rgba(237, 237, 237, 0.13);
    border-bottom: 0;
    background: transparent !important;
    color: rgba(237, 237, 237, 0.94);
  }

  .info-title {
    grid-column: 1;
    align-self: start;
    margin-top: 0.15rem;
    font-size: clamp(0.73rem, 2.4vw, 0.82rem);
    line-height: 1.2;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.82);
  }

  .info-block :is(.info-prose, .info-copy-stack, .info-copy, .info-stack-list, .info-stack-inline) {
    grid-column: 2;
  }

  .info-prose {
    gap: clamp(0.8rem, 2vw, 1rem);
  }

  .info-copy,
  .info-prose p,
  .info-copy-stack p,
  .info-stack-inline,
  .info-stack-list li {
    margin: 0;
    font-size: clamp(1.02rem, 4.35vw, 1.34rem);
    line-height: 1.42;
    letter-spacing: 0.01em;
    color: rgba(237, 237, 237, 0.95);
  }

  .info-copy-stack {
    gap: clamp(0.7rem, 2.2vw, 0.95rem);
  }

  .info-copy--light {
    color: rgba(237, 237, 237, 0.95);
  }

  .info-block--truth .info-prose p,
  .info-block--dark .info-prose p,
  .info-block--dark .info-copy-stack p {
    color: rgba(237, 237, 237, 0.95);
  }

  .info-stack-inline {
    display: block;
  }

  .info-stack-list {
    display: none;
  }

  .info-truth-prose {
    will-change: auto;
  }

  .info-mobile-section {
    display: grid;
    grid-template-columns: minmax(4.6rem, 33%) minmax(0, 1fr);
    align-items: start;
    gap: clamp(0.7rem, 2.4vw, 1rem) clamp(0.9rem, 3.4vw, 1.4rem);
    border-top: 1px solid rgba(237, 237, 237, 0.13);
    padding-block: clamp(1.65rem, 5.4vh, 2.6rem);
    padding-inline-start: calc(clamp(0.95rem, 4vw, 1.2rem) + env(safe-area-inset-left));
    padding-inline-end: calc(clamp(0.95rem, 4vw, 1.2rem) + env(safe-area-inset-right));
  }

  .info-mobile-index__lead {
    grid-column: 1;
    margin: 0;
    font-size: clamp(0.66rem, 2.2vw, 0.75rem);
    line-height: 1.28;
    letter-spacing: 0.11em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.75);
  }

  .info-mobile-index__title {
    grid-column: 2;
    margin: 0;
    font-size: clamp(0.82rem, 2.65vw, 0.95rem);
    line-height: 1.3;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.87);
  }

  .info-mobile-index__links {
    grid-column: 2;
    display: grid;
    gap: 0.35rem;
  }

  .info-mobile-index__links a {
    color: rgba(237, 237, 237, 0.94);
    text-decoration: none;
    font-size: clamp(0.98rem, 3.4vw, 1.14rem);
    line-height: 1.32;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .info-mobile-contact__line {
    grid-column: 1 / -1;
    margin: 0;
    font-size: clamp(1.38rem, 6.5vw, 2rem);
    line-height: 1.2;
    letter-spacing: 0.01em;
    color: rgba(237, 237, 237, 0.96);
  }

  .info-mobile-contact__word {
    font-size: 1.06em;
  }

  .info-mobile-contact__arrow {
    color: rgba(237, 237, 237, 0.96);
    margin-inline: 0.2rem 0.26rem;
  }

  .info-mobile-contact a {
    color: rgba(237, 237, 237, 0.96);
    text-decoration: none;
    overflow-wrap: anywhere;
  }

  .info-mobile-legal {
    grid-template-columns: 1fr;
    gap: 0.9rem;
    padding-bottom: calc(clamp(2rem, 7svh, 3rem) + env(safe-area-inset-bottom));
    border-bottom: 1px solid rgba(237, 237, 237, 0.13);
  }

  .info-mobile-legal p {
    margin: 0;
    font-size: clamp(0.7rem, 2.3vw, 0.8rem);
    line-height: 1.3;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(237, 237, 237, 0.73);
  }

  .info-mobile-legal__links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1rem;
  }

  .info-mobile-legal__links a {
    color: rgba(237, 237, 237, 0.92);
    text-decoration: none;
    font-size: clamp(0.8rem, 2.7vw, 0.95rem);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

}

@media (max-width: 480px) {
  .info-media {
    height: clamp(20rem, 70svh, 31rem);
    min-height: 20rem;
    padding-top: clamp(4rem, 13svh, 6rem);
  }

  .info-media__picture {
    width: min(58vw, 15.5rem);
  }

  .info-block,
  .info-mobile-section {
    grid-template-columns: minmax(4.2rem, 34%) minmax(0, 1fr);
  }

  .info-mobile-contact__line {
    font-size: clamp(1.24rem, 6.2vw, 1.72rem);
  }
}

/* User-requested light reset: white background, black text, visible hero heading */
.info-page {
  isolation: isolate;
  background: var(--color-white) !important;
  color: var(--color-ink) !important;
  overflow: visible !important;
  overflow-x: clip !important;
}

.info-page::before {
  content: none !important;
  display: none !important;
}

.info-page > * {
  position: relative;
  z-index: auto;
}

.info-mobile-chrome {
  display: none !important;
}

.info-hero {
  position: sticky !important;
  top: 0 !important;
  height: 100svh;
  min-height: 100svh;
  height: 100dvh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  background: var(--color-white) !important;
  border-bottom: 1px solid rgba(5, 5, 5, 0.1);
}

.info-hero__inner {
  text-align: center !important;
  padding-inline: var(--gutter) !important;
}

.info-hero__title {
  position: static !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: visible !important;
  clip: auto !important;
  white-space: normal !important;
  border: 0 !important;
  color: var(--color-ink) !important;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 0.95;
  font-size: clamp(3rem, 13vw, 10.5rem);
}

.info-split,
.info-media,
.info-media__shade,
.info-block,
.info-mobile-section {
  background: var(--color-white) !important;
  color: var(--color-ink) !important;
}

.info-split {
  position: relative;
  z-index: 4;
  border-top: 1px solid rgba(5, 5, 5, 0.08);
}

.info-media {
  border-color: rgba(5, 5, 5, 0.12) !important;
}

.info-media__picture {
  display: block !important;
  line-height: 0;
  border-left: 0 !important;
  border-inline-start: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
}

.info-media__img {
  display: block !important;
  vertical-align: top;
  box-shadow: none !important;
}

.info-media__shade {
  opacity: 0.08;
}

.info-block,
.info-mobile-section {
  border-color: rgba(5, 5, 5, 0.12) !important;
}

.info-block--truth,
.info-block--dark,
.info-block--talk {
  color: var(--color-ink) !important;
  background: var(--color-white) !important;
}

.info-title,
.info-copy,
.info-copy--light,
.info-copy-stack p,
.info-prose p,
.info-stack-list li,
.info-stack-inline,
.info-mobile-index__lead,
.info-mobile-index__title,
.info-mobile-index__links a,
.info-mobile-contact__line,
.info-mobile-contact__arrow,
.info-mobile-contact a,
.info-mobile-legal p,
.info-mobile-legal__links a {
  color: rgba(5, 5, 5, 0.9) !important;
}

.info-block--truth {
  padding-top: calc(clamp(6rem, 12vh, 8.5rem) + env(safe-area-inset-top)) !important;
  scroll-margin-top: clamp(6rem, 12vh, 8.5rem);
}

.info-page__footer {
  position: sticky !important;
  bottom: 0 !important;
  z-index: 1;
  display: block !important;
  margin-top: clamp(1.5rem, 4vh, 3rem);
}

@media (max-width: 767px) {
  .info-hero {
    position: sticky !important;
    top: 0 !important;
    height: 100svh;
    min-height: 100svh;
    height: 100dvh;
    min-height: 100dvh;
    padding-top: calc(0.75rem + env(safe-area-inset-top));
  }

  .info-hero__title {
    position: static !important;
    width: auto !important;
    height: auto !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    clip: auto !important;
    white-space: normal !important;
    font-size: clamp(2.4rem, 16vw, 4.4rem);
  }

  .info-block--truth {
    padding-top: calc(clamp(5.2rem, 10vh, 7rem) + env(safe-area-inset-top)) !important;
  }
}
</style>