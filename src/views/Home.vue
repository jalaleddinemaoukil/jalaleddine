<template>
  <main>
    <Hero />
    <About />
    <Work :items="workItems" />
    <Section
      line-one="INSTANT"
      line-two="PERFORMANCE"
      line-three-mark="✱"
      line-three-label="Scalable"
      paren-open="("
      paren-close=")"
      line-four="MODERN DESIGN"
      section-height="120svh"
      section-bg="var(--color-white)"
      section-text-color="var(--color-ink)"
      :images="homeSectionImages"
      :slide-duration="1800"
    />
    <Services />
    <Footer />
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useHead } from "@unhead/vue";
import { useRoute } from "vue-router";
import { buildHead } from "@/lib/siteMeta.js";
import Hero from "@/components/sections/Hero.vue";
import About from "@/components/sections/About.vue";
import Services from "@/components/sections/Services.vue";
import Section from "@/components/base/Section.vue";
import Work from "@/components/sections/Work.vue";
import Footer from "@/components/sections/Footer.vue";
import { fetchHomeWorkItems } from "@/lib/sanity.js";
import homeSectionGif from "@/assets/images/good-offer.gif";

useHead(buildHead("/"));

const route = useRoute();
const state = route.meta?.state ?? {};
const workItems = ref([]);

const homeSectionImages = [
  {
    src: homeSectionGif,
    alt: "Celebration moment",
  },
];

if (Array.isArray(state.homeWorkItems) && state.homeWorkItems.length) {
  workItems.value = state.homeWorkItems;
}

onMounted(async () => {
  if (workItems.value.length) return;
  const items = await fetchHomeWorkItems();
  if (items.length) {
    workItems.value = items;
    state.homeWorkItems = items;
  }
});
</script>
