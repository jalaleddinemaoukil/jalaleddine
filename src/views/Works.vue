<template>
  <main>
    <Section
      line-one="SELECTED"
      line-two="WORK"
      line-three-mark="✱"
      line-three-label="Projects"
      paren-open="("
      paren-close=")"
      line-four="EXPERIMENTS"
      :slide-duration="1800"
      :images="heroImages"
    />

    <section class="works-showcase" aria-label="Projects showcase">
      <div class="shell works-showcase__inner">
        <article
          v-for="(item, idx) in projects"
          :key="item._id ?? idx"
          class="project-card"
          :class="{ 'project-card--reverse': idx % 2 === 1 }"
        >
          <div class="project-card__media">
            <video
              v-if="item.video"
              :ref="(el) => setVideoRef(el, idx)"
              :data-video-index="idx"
              class="project-card__video"
              :src="videoActive[idx] ? item.video : undefined"
              :poster="item.image"
              muted
              loop
              playsinline
              :autoplay="videoActive[idx]"
              preload="none"
              :aria-label="item.alt ?? item.title ?? 'Project video'"
            >
              <track kind="captions" src="/captions/blank.vtt" srclang="en" label="English" default />
            </video>
            <img
              v-else
              class="project-card__image"
              :src="item.image"
              :alt="item.alt ?? item.title ?? 'Project image'"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div class="project-card__content">
            <h2 class="project-card__title">{{ item.title || "Untitled Project" }}</h2>
            <p class="project-card__description">
              {{ item.description || "A focused product build combining robust engineering with clean visual execution." }}
            </p>
            <a
              v-if="item.href"
              class="project-card__link"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Project
            </a>
          </div>
        </article>
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
import Section from "@/components/base/Section.vue";
import Footer from "@/components/sections/Footer.vue";
import { fetchWorksItems } from "@/lib/sanity.js";

useHead(buildHead("/works", { title: "Works | Jalal Eddine Maoukil" }));

const route = useRoute();
const state = route.meta?.state ?? {};
const projects = ref([]);
const heroImages = ref([]);
const videoActive = ref({});
const videoRefs = ref([]);
let mediaObserver = null;

if (Array.isArray(state.worksItems) && state.worksItems.length) {
  projects.value = state.worksItems;
}

const syncHeroImages = () => {
  heroImages.value = projects.value
    .filter((item) => item?.image)
    .slice(0, 6)
    .map((item, index) => ({
      src: item.image,
      alt: item.alt || item.title || `Project ${index + 1}`,
    }));
};

const setVideoRef = (el, idx) => {
  if (!el) return;
  videoRefs.value[idx] = el;
  if (mediaObserver) mediaObserver.observe(el);
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const setupMediaObserver = () => {
  if (typeof window === "undefined") return;
  mediaObserver?.disconnect();
  mediaObserver = null;
  if (!("IntersectionObserver" in window)) {
    projects.value.forEach((_, idx) => {
      videoActive.value[idx] = true;
    });
    return;
  }

  const disableAutoplay = prefersReducedMotion();

  mediaObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = Number(entry.target.getAttribute("data-video-index"));
        if (!Number.isFinite(idx)) return;

        if (entry.isIntersecting) {
          videoActive.value[idx] = true;
          if (!disableAutoplay) {
            entry.target.play?.().catch(() => {});
          }
        } else {
          entry.target.pause?.();
        }
      });
    },
    { root: null, rootMargin: "220px 0px", threshold: 0.35 }
  );

  videoRefs.value.filter(Boolean).forEach((videoEl) => mediaObserver.observe(videoEl));
};

const syncObserver = async () => {
  await nextTick();
  setupMediaObserver();
};

onMounted(async () => {
  if (!Array.isArray(state.worksItems) || !state.worksItems.length) {
    const items = await fetchWorksItems();
    if (items.length) {
      projects.value = items;
      state.worksItems = items;
    }
  }

  syncHeroImages();
  await syncObserver();
});

watch(
  () => projects.value,
  async () => {
    syncHeroImages();
    await syncObserver();
  },
  { deep: false }
);

onBeforeUnmount(() => {
  mediaObserver?.disconnect();
  mediaObserver = null;
});
</script>

<style scoped>
  .works-showcase {
    background: var(--color-bg);
    color: var(--color-white);
    padding-block: clamp(3.5rem, 8vw, 7rem);
    position: relative;
    z-index: 2;
  }

  .works-showcase__inner {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 2.6vw, 2.4rem);
  }

  .project-card {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(2.1rem, 3.4vw, 3rem);
    align-items: stretch;
    min-height: 100svh;
    min-height: 100dvh;
  }

  .project-card--reverse .project-card__media {
    order: 2;
  }

  .project-card--reverse .project-card__content {
    order: 1;
  }

  .project-card__media {
    min-height: 100%;
    background: rgba(237, 237, 237, 0.03);
    border-radius: 15px;
    overflow: hidden;
  }

  .project-card__image,
  .project-card__video {
    width: 100%;
    height: 100%;
    min-height: inherit;
    object-fit: contain;
    object-position: center;
    display: block;
  }

  .project-card__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(1rem, 2vw, 1.5rem);
    padding: clamp(1.4rem, 3vw, 2.8rem);
    background: var(--color-white);
    color: var(--color-ink);
    border-radius: 15px;
  }

  .project-card__title {
    margin: 0;
    font-size: clamp(1.8rem, 9.8vw, 10.2rem);
    line-height: 1.05;
    text-transform: uppercase;
    letter-spacing: var(--tracking-display);
    word-spacing: 0.05em;
    color: var(--color-ink);
  }

  .project-card__description {
    margin: 0;
    font-size: clamp(1.2rem, 2vw, 2.75rem);
    line-height: 1.5;
    word-spacing: 0.03em;
    color: rgba(5, 5, 5, 0.9);
    max-width: none;
  }

  .project-card__link {
    width: fit-content;
    color: var(--color-ink);
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: clamp(0.89rem, 0.92rem + 0.28vw, 1.1rem);
    border-bottom: 1px solid currentColor;
    padding-bottom: 0.12rem;
    opacity: 0.9;
  }

  .project-card__link:hover,
  .project-card__link:focus-visible {
    opacity: 1;
  }

  @media (max-width: 991px) {
    .project-card {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto;
    }

    .project-card__content {
      padding: clamp(1.2rem, 3.6vw, 2rem);
    }

    .project-card__description {
      font-size: clamp(1.08rem, 0.96rem + 0.6vw, 1.35rem);
      line-height: 1.5;
    }

    .project-card__media {
      min-height: 0;
    }

    .project-card--reverse .project-card__media,
    .project-card--reverse .project-card__content {
      order: initial;
    }
  }

  @media (max-width: 479px) {
    .works-showcase {
      padding-block: clamp(2.4rem, 8vw, 3.2rem);
    }

    .project-card__content {
      padding: clamp(1rem, 5vw, 1.35rem);
    }

    .project-card__description {
      font-size: clamp(1rem, 0.92rem + 1vw, 1.18rem);
      line-height: 1.45;
    }
  }
</style>


