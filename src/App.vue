<template>
  <div class="page">
    <div ref="wipeRef" class="page-wipe" aria-hidden="true"></div>
    <Preloader />
    <SideNav />
    <RouterView v-slot="{ Component, route }">
      <Transition
        :css="false"
        mode="out-in"
        @leave="onLeave"
        @enter="onEnter"
      >
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterView } from "vue-router";
import Preloader from "@/components/Preloader.vue";
import SideNav from "@/components/base/SideNav.vue";

const wipeRef = ref(null);

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

const wipeIn = (done) => {
  const wipe = wipeRef.value;
  const gsap = typeof window !== "undefined" ? window.gsap : null;
  if (!wipe || !gsap || prefersReduced()) {
    if (wipe) wipe.style.transform = "scaleY(1)";
    done?.();
    return;
  }
  gsap.set(wipe, { scaleY: 0, transformOrigin: "50% 100%" });
  gsap.to(wipe, {
    scaleY: 1,
    duration: 0.45,
    ease: "power3.inOut",
    onComplete: () => done?.(),
  });
};

const wipeOut = (done) => {
  const wipe = wipeRef.value;
  const gsap = typeof window !== "undefined" ? window.gsap : null;
  if (!wipe || !gsap || prefersReduced()) {
    if (wipe) wipe.style.transform = "scaleY(0)";
    done?.();
    return;
  }
  gsap.set(wipe, { scaleY: 1, transformOrigin: "50% 0%" });
  gsap.to(wipe, {
    scaleY: 0,
    duration: 0.55,
    ease: "power3.out",
    onComplete: () => done?.(),
  });
};

const onLeave = (el, done) => {
  if (el) {
    el.style.opacity = "1";
  }
  wipeIn(done);
};

const onEnter = (el, done) => {
  if (el) {
    el.style.opacity = "1";
  }
  wipeOut(done);
};
</script>
