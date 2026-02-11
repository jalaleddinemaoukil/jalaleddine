<template>
  <main class="notfound-page">
    <section class="notfound-hero">
      <div class="shell notfound-hero__inner">
        <p class="notfound-hero__eyebrow">404 Error</p>
        <RevealText
          tag="h1"
          customClass="notfound-hero__title"
          :scroll="false"
          splitReveal="words"
          :waitForPreloader="true"
        >
          Page Not Found
        </RevealText>
        <RevealText
          tag="p"
          customClass="notfound-hero__copy"
          :scroll="false"
          splitReveal="words"
          :waitForPreloader="true"
        >
          The page you are looking for does not exist or has been moved.
        </RevealText>
        <div class="notfound-hero__actions">
          <Button
            tag="a"
            href="/"
            width="min(100%, 240px)"
            height="clamp(48px, 6vw, 60px)"
            fontSize="clamp(12px, 1.6vw, 14px)"
            paddingX="clamp(20px, 2.2vw, 30px)"
            paddingY="0px"
            fontWeight="700"
            letterSpacing="0.08em"
          >
            Back Home
          </Button>
        </div>
      </div>
    </section>
    <Footer />
  </main>
</template>

<script setup>
import { useHead } from "@unhead/vue";
import { buildHead } from "@/lib/siteMeta.js";
import RevealText from "@/components/base/RevealText.vue";
import Button from "@/components/base/Button.vue";
import Footer from "@/components/sections/Footer.vue";

useHead(buildHead("/404", { title: "404 | Jalal Eddine Maoukil" }));
</script>

<style scoped>
.notfound-hero {
  min-height: 100svh;
  background: var(--color-bg);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(6rem, 14vw, 9rem) var(--gutter) clamp(4rem, 10vw, 7rem);
  text-align: center;
}

.notfound-hero__inner {
  width: 100%;
  max-width: 56rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.85rem, 2.6vw, 1.6rem);
}

.notfound-hero__eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
  font-size: 0.75rem;
  opacity: 0.7;
}

.notfound-hero__title {
  margin: 0;
  font-size: clamp(3rem, 9vw, 6.5rem);
  line-height: 0.95;
  text-transform: uppercase;
}

.notfound-hero__copy {
  margin: 0;
  max-width: 38rem;
  font-size: clamp(1rem, 2.1vw, 1.35rem);
  line-height: var(--lh-relaxed);
  opacity: 0.9;
}

.notfound-hero__actions {
  margin-top: clamp(0.6rem, 2vw, 1.4rem);
  display: flex;
  justify-content: center;
  width: 100%;
}

.notfound-hero :deep(.btn-animate-chars) {
  --color-cta-bg: var(--color-white);
  --color-ink: var(--color-bg);
}

@media (max-width: 640px) {
  .notfound-hero__inner {
    align-items: flex-start;
    text-align: left;
  }

  .notfound-hero__actions {
    justify-content: flex-start;
  }
}
</style>
