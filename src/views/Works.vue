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

const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL ?? "https://example.com";

useHead(buildHead("/works", {
  title: "Works & Projects | Jalal Eddine Maoukil — Full Stack Developer Morocco",
  description:
    "Explore the portfolio of Jalal Eddine Maoukil — a Full Stack Developer and Web Designer based in Rabat, Morocco. Hand-crafted web applications, SaaS platforms, and modern websites built with Vue.js, React, Node.js, and more.",
  keywords:
    "Jalal Eddine Maoukil projects, web development portfolio Morocco, Full Stack Developer portfolio, Vue.js projects, React projects, SaaS Morocco, web design portfolio Rabat, freelance developer works",
}));

useHead({
  meta: [
    { property: "og:type", content: "website" },
  ],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${siteUrl}/works#page`,
        name: "Works & Projects — Jalal Eddine Maoukil",
        description:
          "A curated portfolio of web applications, SaaS platforms, and websites built by Jalal Eddine Maoukil.",
        url: `${siteUrl}/works`,
        inLanguage: "en-US",
        author: {
          "@type": "Person",
          "@id": `${siteUrl}#person`,
          name: "Jalal Eddine Maoukil",
          url: siteUrl,
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: siteUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Works",
              item: `${siteUrl}/works`,
            },
          ],
        },
      }),
    },
  ],
});

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
    padding-block: clamp(4rem, 8vw, 8rem);
    position: relative;
    z-index: 2;
  }

  .works-showcase__inner {
    display: flex;
    flex-direction: column;
    gap: clamp(3rem, 5vw, 6rem);
  }

  .project-card {
    display: grid;
    grid-template-columns: 56fr 42fr;
    gap: clamp(1.6rem, 2.8vw, 3rem);
    align-items: stretch;
    min-height: clamp(440px, 62vh, 840px);
  }

  .project-card--reverse .project-card__media {
    order: 2;
  }

  .project-card--reverse .project-card__content {
    order: 1;
  }

  .project-card__media {
    height: 100%;
    background: rgba(237, 237, 237, 0.03);
    border-radius: 15px;
    overflow: hidden;
  }

  .project-card__image,
  .project-card__video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }

  .project-card__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(0.9rem, 1.6vw, 1.5rem);
    padding: clamp(1.6rem, 3.2vw, 3.2rem);
    background: var(--color-white);
    color: var(--color-ink);
    border-radius: 15px;
  }

  .project-card__title {
    margin: 0;
    font-size: clamp(2rem, 3.8vw, 5rem);
    line-height: 1.05;
    text-transform: uppercase;
    letter-spacing: var(--tracking-display);
    word-spacing: 0.04em;
    color: var(--color-ink);
  }

  .project-card__description {
    margin: 0;
    font-size: clamp(1rem, 1.1vw, 1.32rem);
    line-height: 1.65;
    color: rgba(5, 5, 5, 0.75);
    max-width: 52ch;
  }

  .project-card__link {
    width: fit-content;
    color: var(--color-ink);
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: clamp(0.8rem, 0.85rem + 0.2vw, 1rem);
    border-bottom: 1px solid currentColor;
    padding-bottom: 0.12rem;
    opacity: 0.75;
    transition: opacity 0.2s ease;
  }

  .project-card__link:hover,
  .project-card__link:focus-visible {
    opacity: 1;
  }

  /* ── Tablet (992 → 768) ──────────────────────────────────────────── */
  @media (max-width: 991px) {
    .works-showcase {
      padding-block: clamp(3rem, 7vw, 5rem);
    }

    .works-showcase__inner {
      gap: clamp(2.4rem, 5vw, 4rem);
    }

    .project-card {
      grid-template-columns: minmax(0, 1fr);
      min-height: unset;
    }

    .project-card__media {
      aspect-ratio: 16 / 10;
      height: auto;
    }

    .project-card__content {
      padding: clamp(1.4rem, 3.8vw, 2.2rem);
    }

    .project-card__title {
      font-size: clamp(2rem, 5.2vw, 3.2rem);
    }

    .project-card__description {
      font-size: clamp(0.95rem, 1vw + 0.3rem, 1.15rem);
      line-height: 1.6;
      max-width: none;
    }

    .project-card--reverse .project-card__media,
    .project-card--reverse .project-card__content {
      order: initial;
    }
  }

  /* ── Mobile (767 → 480) ──────────────────────────────────────────── */
  @media (max-width: 767px) {
    .works-showcase__inner {
      gap: clamp(2rem, 6vw, 3rem);
    }

    .project-card__media {
      aspect-ratio: 4 / 3;
    }

    .project-card__title {
      font-size: clamp(1.9rem, 6.5vw, 2.6rem);
    }
  }

  /* ── Small mobile (≤ 479px) ─────────────────────────────────────── */
  @media (max-width: 479px) {
    .works-showcase {
      padding-block: clamp(2.4rem, 8vw, 3.2rem);
    }

    .works-showcase__inner {
      gap: clamp(1.8rem, 8vw, 2.4rem);
    }

    .project-card__media {
      aspect-ratio: 3 / 2;
    }

    .project-card__content {
      padding: clamp(1.1rem, 5vw, 1.6rem);
    }

    .project-card__title {
      font-size: clamp(1.75rem, 8vw, 2.2rem);
    }

    .project-card__description {
      font-size: clamp(0.92rem, 0.88rem + 0.6vw, 1.05rem);
      line-height: 1.55;
    }

    .project-card__link {
      font-size: 0.85rem;
    }
  }
</style>


