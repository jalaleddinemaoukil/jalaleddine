<template>
  <section id="services" class="services-section" ref="sectionRef">
    <div class="services-wrapper">
      <div class="left-panel">
        <h2 class="left-title" ref="leftTitleRef">
          <span class="title-line">What I bring</span>
          <span class="title-line">To The Table</span>
          <span class="subtitle">(Services)</span>
        </h2>

        <div class="progress-track">
          <div class="progress-fill" ref="progressFillRef"></div>
        </div>
      </div>

      <div class="right-panel" ref="rightPanelRef">
        <div class="cards-track">
          <article
            v-for="(service, i) in services"
            :key="i"
            class="service-card"
            :class="{ 'is-active': activeIndex === i }"
            :ref="
              (el) => {
                if (el) cardRefs[i] = el;
              }
            "
          >
            <div class="card-body">
              <div class="card-num">{{ service.number }}</div>
              <div class="card-text">
                <div class="card-title" v-html="service.title"></div>
                <p class="card-desc">{{ service.desc }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const services = [
  {
    number: "01",
    title: "Web Development<br>& Design",
    desc: "Interfaces that feel intuitive. Backends that handle growth. Design decisions that drive conversions. I build web applications from concept to launch. No handoffs, no miscommunication, just cohesive products that work.",
  },
  {
    number: "02",
    title: "Cloud Solutions",
    desc: "Real-time data processing. Serverless architectures. Systems that grow without the growing pains. Your infrastructure should enable your business, not slow it down.",
  },
  {
    number: "03",
    title: "Performance<br>& Security",
    desc: "Fast load times. Clean code. Better user experience. I turn slow, bloated applications into lean, efficient ones. 30% faster isn't luck it's intentional optimization.",
  },
];

const sectionRef = ref(null);
const leftTitleRef = ref(null);
const rightPanelRef = ref(null);
const progressFillRef = ref(null);
const cardRefs = ref([]);
const activeIndex = ref(0);

let triggers = [];
let gsapPack = null;

const ensurePlugins = () => {
  if (typeof window === "undefined") return null;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap) return null;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
};

const waitForGsap = async (timeoutMs = 2500) => {
  const start = performance.now();
  while (performance.now() - start < timeoutMs) {
    const pack = ensurePlugins();
    if (pack?.gsap && pack?.ScrollTrigger) return pack;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return ensurePlugins();
};

onMounted(async () => {
  gsapPack = await waitForGsap();
  if (!gsapPack?.gsap || !gsapPack?.ScrollTrigger) return;

  initScrollCards();
});

onBeforeUnmount(() => {
  triggers.forEach((t) => t.kill());
  triggers = [];
});

function initScrollCards() {
  const { gsap, ScrollTrigger } = gsapPack || {};
  if (!gsap || !ScrollTrigger) return;

  const cards = cardRefs.value.filter(Boolean);
  if (!cards.length) return;

  const getStickyTop = () => {
    const raw = window.getComputedStyle(cards[0]).top;
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  gsap.set(cards, { transformOrigin: "50% 100%" });

  const progressTrigger = ScrollTrigger.create({
    trigger: cards[0],
    start: () => `top top+=${getStickyTop()}`,
    endTrigger: cards[cards.length - 1],
    end: () => `top top+=${getStickyTop()}`,
    invalidateOnRefresh: true,
    scrub: 0.5,
    onRefreshInit: () => {
      if (progressFillRef.value) progressFillRef.value.style.width = "0%";
    },
    onUpdate(self) {
      if (!progressFillRef.value) return;
      progressFillRef.value.style.width = `${self.progress * 100}%`;
    },
  });
  triggers.push(progressTrigger);

  cards.forEach((card, i) => {
    const activeTrigger = ScrollTrigger.create({
      trigger: card,
      start: () => `top top+=${getStickyTop()}`,
      end: () => `bottom top+=${getStickyTop()}`,
      invalidateOnRefresh: true,
      onEnter: () => {
        activeIndex.value = i;
      },
      onEnterBack: () => {
        activeIndex.value = i;
      },
    });
    triggers.push(activeTrigger);
  });
}

function onCardAction(index) {
  console.log("Card action:", services[index].title);
}
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.services-section {
  position: relative;
  z-index: 10;
  width: 100%;
  background: var(--color-white);
  color: var(--color-ink);
  font-family: var(--font-main);
  min-height: 100vh;
  padding-block: clamp(56px, 8vw, 120px);
  scroll-margin-top: clamp(100px, 14vh, 140px);
}

.services-wrapper {
  width: 100%;
  max-width: var(--size-container);
  margin-inline: auto;
  padding-inline: var(--gutter);
  --panel-top: 30px;
  --panel-height: clamp(450px, 90vh, 900px);
  --panel-radius: 15px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: clamp(18px, 2vw, 30px);
}

.left-panel {
  position: sticky;
  top: var(--panel-top);
  width: 100%;
  height: var(--panel-height);
  border-radius: var(--panel-radius);
  overflow: hidden;
  background: #d1d1d1;
}

.left-title {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: clamp(28px, 3vw, 52px) clamp(24px, 2.8vw, 48px);
  overflow: hidden;
}

.title-line {
  display: block;
  font-family: var(--font-main);
  font-weight: 500;
  font-size: clamp(2.6rem, 6.5vw, 5.75rem);
  line-height: 0.9;
  text-transform: uppercase;
  color: var(--color-ink);
  letter-spacing: 0.01em;
  will-change: transform, opacity;
}

.progress-track {
  position: absolute;
  bottom: clamp(20px, 2.4vw, 36px);
  left: clamp(24px, 2.8vw, 48px);
  right: clamp(24px, 2.8vw, 48px);
  height: 3px;
  background: rgba(5, 5, 5, 0.2);
  border-radius: 2px;
}

.progress-fill {
  height: 100%;
  width: 0%;
  background: var(--color-ink);
  border-radius: 2px;
  will-change: width;
}

.right-panel {
  width: 100%;
}

.cards-track {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2vw, 26px);
  padding-bottom: 0;
}

.service-card {
  position: sticky;
  top: var(--panel-top);
  border-radius: var(--panel-radius);
  background: var(--color-bg);
  color: var(--color-white);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: var(--panel-height);
  min-height: var(--panel-height);
  padding: clamp(24px, 3vw, 56px) clamp(20px, 2.8vw, 56px)
    clamp(22px, 2.6vw, 52px);
  will-change: transform, opacity;
  transition: transform 0.3s ease;
}

.service-card:nth-child(2) {
  margin-top: 0;
}

.service-card:nth-child(3) {
  margin-top: 0;
}

.service-card:nth-child(1) {
  z-index: 1;
}

.service-card:nth-child(2) {
  z-index: 2;
}

.service-card:nth-child(3) {
  z-index: 3;
}

.service-card.is-active:not(:last-child) {
  transform: translateY(-6px);
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: clamp(14px, 1.8vw, 28px);
  padding: 20px 0;
}

.card-num {
  font-family: var(--font-main);
  font-weight: 500;
  font-size: clamp(4.8rem, 9vw, 9.6rem);
  color: var(--color-white);
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
  margin-bottom: clamp(6px, 1vw, 14px);
}

.card-text {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.card-title {
  font-family: var(--font-main);
  font-weight: 500;
  font-size: clamp(2.35rem, 2.1rem + 2.1vw, 3.6rem);
  text-transform: uppercase;
  color: var(--color-white);
  letter-spacing: 0.04em;
  line-height: 1.08;
  margin-bottom: clamp(20px, 2.4vw, 25px);
}

.card-desc {
  font-size: clamp(1.98rem, 1.92rem + 1.18vw, 2.15rem);
  font-weight: 500;
  color: var(--color-white);
  line-height: 1.6;
  max-width: 46ch;
}

.subtitle {
  display: block;
  font-size: clamp(3rem, 0.5vw, 5rem);
  color: var(--color-ink);
  font-family: var(--font-main);
  margin-top: clamp(10px, 0.8vw, 14px);
  letter-spacing: 0.02em;
  font-weight: 500;
  user-select: none;
}

@media (min-width: 992px) {
  .services-wrapper {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .right-panel {
    min-height: 100%;
  }
}

@media (max-width: 991px) {
  .services-section {
    padding-block: clamp(40px, 8vw, 72px);
  }

  .services-wrapper {
    --panel-top: 0px;
    --panel-height: clamp(340px, 62vh, 560px);
    --panel-radius: 16px;
    gap: clamp(12px, 3.2vw, 20px);
  }

  .left-panel {
    position: relative;
    top: auto;
  }

  .left-title {
    padding: clamp(18px, 4.5vw, 28px);
  }

  .title-line {
    font-size: clamp(2rem, 8vw, 3.2rem);
    line-height: 0.92;
  }

  .subtitle {
    font-size: clamp(1.05rem, 3.8vw, 1.35rem);
    margin-top: clamp(6px, 2vw, 10px);
  }

  .progress-track {
    left: clamp(18px, 4.5vw, 28px);
    right: clamp(18px, 4.5vw, 28px);
    bottom: clamp(14px, 3.2vw, 22px);
  }

  .cards-track {
    padding-bottom: 0;
    gap: clamp(10px, 2.8vw, 18px);
  }

  .service-card,
  .service-card:not(:first-child) {
    position: relative;
    top: auto;
    margin-top: 0;
    height: var(--panel-height);
    min-height: var(--panel-height);
    padding: clamp(16px, 4.2vw, 26px);
  }

  .service-card.is-active {
    transform: none;
  }

  .card-body {
    gap: clamp(8px, 2.6vw, 14px);
    padding: 0;
  }

  .card-num {
    font-size: clamp(3rem, 12vw, 4.6rem);
    margin-bottom: 0;
  }

  .card-title {
    font-size: clamp(1.2rem, 4.8vw, 1.75rem);
    line-height: 1.08;
    margin-bottom: clamp(8px, 2.2vw, 12px);
  }

  .card-desc {
    font-size: clamp(0.95rem, 3.6vw, 1.05rem);
    line-height: 1.55;
    max-width: 100%;
  }
}

@media (max-width: 767px) {
  .services-wrapper {
    --panel-height: clamp(300px, 56vh, 440px);
  }

  .services-section {
    scroll-margin-top: clamp(84px, 13vh, 110px);
  }
}
</style>
