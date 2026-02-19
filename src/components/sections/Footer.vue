<template>
  <footer
    ref="footerRef"
    id="footer"
    class="site-footer"
    :class="['site-footer--dark', { 'is-visible': isVisible }]"
  >
    <div class="site-footer__overlay" aria-hidden="true"></div>
    <div class="shell site-footer__content">
      <div class="site-footer__grid">
        <div class="site-footer__primary">
          <div class="site-footer__text">
            <RevealText tag="h2" class="site-footer__title" :scroll="true" splitReveal="lines">
              Your website should work as hard as you do.
            </RevealText>
            <RevealText tag="p" class="site-footer__copy" :scroll="true" splitReveal="lines">
              Let's build something fast, scalable, and actually reliable.
            </RevealText>
          </div>

          <div class="site-footer__cta">
            <Button
              tag="a"
              href="#"
              :data-mailto="mailtoEncoded"
              width="min(100%, 420px)"
              height="clamp(56px, 4vw, 80px)"
              fontSize="clamp(14px, 1vw, 19px)"
              paddingX="clamp(24px, 2vw, 46px)"
              paddingY="0px"
              fontWeight="700"
              letterSpacing="0.08em"
            >
              Start a Project
            </Button>
          </div>
        </div>

        <div class="site-footer__secondary">
          <div class="site-footer__links">
            <div class="site-footer__link-group">
              <RevealText tag="p" class="site-footer__label" :scroll="true" splitReveal="words">
                Explore
              </RevealText>
              <div class="site-footer__link-list">
                <RouterLink class="site-footer__link" to="/works" aria-label="Work">
                  <RevealText tag="span" :scroll="true" splitReveal="words">Work</RevealText>
                </RouterLink>
                <RouterLink class="site-footer__link" to="/#services" aria-label="Services">
                  <RevealText tag="span" :scroll="true" splitReveal="words">What I do</RevealText>
                </RouterLink>
                <RouterLink class="site-footer__link" to="/info" aria-label="About">
                  <RevealText tag="span" :scroll="true" splitReveal="words">Who I am</RevealText>
                </RouterLink>
              </div>
            </div>

            <div class="site-footer__link-group">
              <RevealText tag="p" class="site-footer__label" :scroll="true" splitReveal="words">
                Socials
              </RevealText>
              <div class="site-footer__link-list">
               
                <a class="site-footer__link" href="https://www.linkedin.com/in/jalal-eddine-maoukil/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <RevealText tag="span" :scroll="true" splitReveal="words">LinkedIn</RevealText>
                </a>
                <a class="site-footer__link" href="https://github.com/jalaleddinemaoukil" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <RevealText tag="span" :scroll="true" splitReveal="words">GitHub</RevealText>
                </a>
                 <a class="site-footer__link" href="https://me.muz.li/jalaledn" target="_blank" rel="noopener noreferrer" aria-label="Muzli">
                  <RevealText tag="span" :scroll="true" splitReveal="words">Muzli</RevealText>
                </a>
              </div>
            </div>
          </div>

          <div class="site-footer__legal">
            <RevealText tag="p" :scroll="true" splitReveal="words">
              © 2026 Jalal Eddine Maoukil. All rights reserved.
            </RevealText>
            <RouterLink class="site-footer__legal-link" to="/privacy-policy" aria-label="Privacy Policy">
              <RevealText tag="span" :scroll="true" splitReveal="words">Privacy Policy</RevealText>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>


<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import RevealText from "../base/RevealText.vue";
import Button from "../base/Button.vue";

const footerRef = ref(null);
const isVisible = ref(false);
let footerObserver = null;
const mailtoEncoded =
  "&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#106;&#97;&#108;&#97;&#108;&#101;&#100;&#100;&#105;&#110;&#101;&#109;&#97;&#111;&#117;&#107;&#105;&#108;&#64;&#103;&#109;&#97;&#105;&#108;&#46;&#99;&#111;&#109;";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;


onMounted(() => {
  if (prefersReducedMotion()) {
    isVisible.value = true;
  }
  if (footerRef.value) {
    footerObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          isVisible.value = true;
          requestAnimationFrame(() => {
            window.__lenis?.resize?.();
            window.dispatchEvent(new Event("content:loaded"));
          });
          footerObserver?.disconnect();
        }
      },
      { rootMargin: "160px 0px -10% 0px", threshold: 0.15 }
    );

    footerObserver.observe(footerRef.value);
  }
});

onBeforeUnmount(() => {
  footerObserver?.disconnect();
});
</script>

<style scoped>
.site-footer {
  position: relative;
  min-height: 100vh;
  background-color: var(--color-white);
  color: var(--color-ink);
  overflow: visible;
  z-index: 12;
  isolation: isolate;
}

.site-footer.site-footer--dark {
  background-color: var(--color-bg);
  color: var(--color-white);
}

.site-footer__overlay {
  position: absolute;
  inset: 0;
  background: var(--color-white);
  opacity: 0.7;
  transform: scaleY(1);
  transform-origin: 50% 100%;
  transition:
    transform 0.9s cubic-bezier(0.22, 0.7, 0.12, 1),
    opacity 0.6s ease;
  will-change: transform, opacity;
  z-index: 1;
}

.site-footer.site-footer--dark .site-footer__overlay {
  background: var(--color-bg);
}

.site-footer__content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: clamp(2rem, 4.5vw, 4rem);
  padding: clamp(4rem, 10vw, 8rem) clamp(16px, 2.2vw, 32px) clamp(3rem, 7vw, 6rem);
  transform: translate3d(0, 24px, 0);
  opacity: 0;
  transition:
    transform 0.85s cubic-bezier(0.22, 0.7, 0.12, 1),
    opacity 0.6s ease;
  will-change: transform, opacity;
}

.site-footer__grid {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(2.5rem, 5vw, 5rem);
  align-items: end;
}

@media (min-width: 900px) {
  .site-footer__grid {
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.65fr);
  }
}

.site-footer__primary,
.site-footer__secondary {
  display: flex;
  flex-direction: column;
  gap: clamp(1.75rem, 3.6vw, 3.5rem);
}

.site-footer__text {
  max-width: 45rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.site-footer__eyebrow {
  text-transform: uppercase;
  font-size: 0.72rem;
  margin: 0;
  opacity: 0.75;
}

.site-footer__title {
  font-size: clamp(2.2rem, 3.2vw, 5.2rem);
  line-height: 1.02;
  margin: 0;
  text-transform: uppercase;
  text-wrap: balance;
}

.site-footer__copy {
  margin: 0;
  max-width: 34rem;
  font-size: clamp(1.08rem, 1rem + 0.35vw, 1.65rem);
  line-height: 1.7;
  opacity: 0.88;
}

.site-footer__cta {
  display: flex;
  justify-content: flex-start;
}

.site-footer__links {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(1.5rem, 4vw, 2.5rem);
}

.site-footer__link-group {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.site-footer__link-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.site-footer__label {
  text-transform: uppercase;
  font-size: clamp(0.72rem, 0.42vw, 0.88rem);
  margin: 0;
  opacity: 0.8;
}

.site-footer__link {
  color: inherit;
  text-decoration: none;
  font-size: clamp(1rem, 0.85rem + 0.35vw, 1.35rem);
  opacity: 0.88;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  position: relative;
}

.site-footer__link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.03em;
  height: 1px;
  background: currentColor;
  transform-origin: right center;
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.65, 0.05, 0, 1);
}

.site-footer__link:hover {
  opacity: 1;
}

.site-footer__link:hover::after,
.site-footer__link:focus-visible::after {
  transform-origin: left center;
  transform: scaleX(1);
}

.site-footer__link:focus-visible {
  outline: 2px solid rgba(0, 0, 0, 0.6);
  outline-offset: 3px;
}

.site-footer.site-footer--dark .site-footer__link:focus-visible {
  outline: 2px solid rgba(237, 237, 237, 0.85);
}

.site-footer__legal {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: clamp(0.9rem, 0.78rem + 0.24vw, 1.1rem);
  opacity: 0.8;
}

.site-footer__legal-link {
  color: inherit;
  text-decoration: none;
  opacity: 0.75;
  position: relative;
  width: fit-content;
}

.site-footer__legal-link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.05em;
  height: 1px;
  background: currentColor;
  transform-origin: right center;
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.65, 0.05, 0, 1);
}

.site-footer__legal-link:hover {
  opacity: 1;
}

.site-footer__legal-link:hover::after,
.site-footer__legal-link:focus-visible::after {
  transform-origin: left center;
  transform: scaleX(1);
}

.site-footer__legal-link:focus-visible {
  outline: 2px solid rgba(0, 0, 0, 0.6);
  outline-offset: 3px;
}

.site-footer.site-footer--dark .site-footer__legal-link:focus-visible {
  outline: 2px solid rgba(237, 237, 237, 0.85);
}

.site-footer :deep(.line),
.site-footer :deep(.word) {
  display: inline-block;
  overflow: hidden;
}

.site-footer :deep(.btn-animate-chars) {
  --color-cta-bg: var(--color-bg);
  --color-ink: var(--color-white);
}

.site-footer.site-footer--dark :deep(.btn-animate-chars) {
  --color-cta-bg: var(--color-white);
  --color-ink: var(--color-bg);
}

.site-footer :deep(.line) {
  display: block;
}

.site-footer.is-visible .site-footer__overlay {
  opacity: 0;
  transform: scaleY(0);
}

.site-footer.is-visible .site-footer__content {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}

@media (min-width: 1440px) {
  .site-footer__content {
    padding: clamp(5rem, 10vw, 9rem) clamp(32px, 3vw, 64px) clamp(4rem, 6vw, 7rem);
    gap: clamp(3rem, 4vw, 5rem);
  }

  .site-footer__grid {
    grid-template-columns: minmax(0, 1fr);
    gap: clamp(3rem, 4.5vw, 6rem);
  }

  .site-footer__text {
    max-width: 54rem;
    gap: clamp(1.25rem, 1.5vw, 2rem);
  }

  .site-footer__title {
    font-size: clamp(4rem, 4.8vw, 8rem);
  }

  .site-footer__copy {
    max-width: 42rem;
    font-size: clamp(1.5rem, 1.15rem + 0.85vw, 2.4rem);
  }

  .site-footer__links {
    gap: clamp(2rem, 3vw, 3.2rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-footer__content {
    transition: none;
    transform: none;
    opacity: 1;
  }
  .site-footer__overlay {
    transition: none;
    opacity: 0;
    transform: none;
  }
}

@media (max-width: 1024px) {
  .site-footer__text {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .site-footer__content {
    padding-top: clamp(3rem, 12vw, 5rem);
  }
}

@media (min-width: 640px) {
  .site-footer__links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(1.5rem, 6vw, 3.5rem);
  }
}

@media (min-width: 1024px) {
  .site-footer {
    min-height: 80vh;
  }

  .site-footer__grid {
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    justify-items: center;
    text-align: center;
  }

  .site-footer__primary,
  .site-footer__secondary,
  .site-footer__text,
  .site-footer__link-group,
  .site-footer__link-list,
  .site-footer__legal {
    align-items: center;
  }

  .site-footer__cta {
    justify-content: center;
  }

  .site-footer__title {
    font-size: clamp(3.4rem, 4.4vw, 6.8rem);
  }

  .site-footer__copy {
    font-size: clamp(1.35rem, 1.05rem + 0.65vw, 2.2rem);
  }

  .site-footer__links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    justify-items: center;
    align-items: start;
    column-gap: clamp(2rem, 4vw, 4rem);
  }

  .site-footer__content {
    min-height: 80vh;
    padding-top: clamp(3.5rem, 7vw, 5.5rem);
    padding-bottom: clamp(2.5rem, 6vw, 4rem);
  }
}
</style>
