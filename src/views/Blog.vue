<template>
  <main class="coming-page">
    <section class="coming-hero">
      <div class="shell coming-hero__inner">
        <p class="coming-hero__eyebrow">Blog</p>
        <RevealText
          tag="h1"
          customClass="coming-hero__title"
          :scroll="false"
          splitReveal="words"
          :waitForPreloader="true"
        >
          Coming Soon
        </RevealText>
        <RevealText
          tag="p"
          customClass="coming-hero__copy"
          :scroll="false"
          splitReveal="words"
          :waitForPreloader="true"
        >
          The blog is on the way. Expect new stories, experiments, and process notes here.
        </RevealText>
        <div class="coming-hero__actions">
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

useHead(buildHead("/blog", { title: "Blog | Jalal Eddine Maoukil" }));
</script>

<style scoped>
.coming-hero {
  min-height: 100svh;
  background: var(--color-white);
  color: var(--color-ink);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(6rem, 14vw, 9rem) var(--gutter) clamp(4rem, 10vw, 7rem);
  text-align: center;
}

.coming-hero__inner {
  width: 100%;
  max-width: 56rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.85rem, 2.6vw, 1.6rem);
}

.coming-hero__eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: var(--tracking-label);
  font-size: 0.75rem;
  opacity: 0.7;
}

.coming-hero__title {
  margin: 0;
  font-size: clamp(3.4rem, 10vw, 7.5rem);
  line-height: 0.92;
  text-transform: uppercase;
}

.coming-hero__copy {
  margin: 0;
  max-width: 38rem;
  font-size: clamp(1rem, 2.1vw, 1.35rem);
  line-height: var(--lh-relaxed);
  opacity: 0.9;
}

.coming-hero__actions {
  margin-top: clamp(0.6rem, 2vw, 1.4rem);
  display: flex;
  justify-content: center;
  width: 100%;
}

.coming-hero :deep(.btn-animate-chars) {
  --color-cta-bg: var(--color-bg);
  --color-ink: var(--color-white);
}

@media (max-width: 640px) {
  .coming-hero__inner {
    align-items: flex-start;
    text-align: left;
  }

  .coming-hero__actions {
    justify-content: flex-start;
  }
}
</style>
