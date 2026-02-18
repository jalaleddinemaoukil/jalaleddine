<template>
  <main>
    <Hero />
    <About />
    <Work :items="workItems" />
    <Statement
  heading1="Built to be"
  paragraph="I work with founders and studios who refuse to settle for average. Every project starts with a question: what will make someone stop scrolling? The answer is never a template."
  heading2="Remembered."
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
import Work from "@/components/sections/Work.vue";
import Footer from "@/components/sections/Footer.vue";
import { fetchHomeWorkItems } from "@/lib/sanity.js";
import Statement from "../components/sections/Statement.vue";

useHead(buildHead("/"));

const route = useRoute();
const state = route.meta?.state ?? {};
const workItems = ref([]);

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
