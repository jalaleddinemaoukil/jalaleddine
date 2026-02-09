<template>
  <div class="sidenav" ref="root">
    <header class="sidenav__header" :class="{ 'is-blend': blend, 'is-hidden': navHidden }">
        <a :href="brandHref" class="sidenav__brand" :aria-label="brand" @click="handleBrandClick">
          {{ brand }}
        </a>

        <button
          ref="menuButton"
          type="button"
          class="sidenav__button"
          data-sidenav-toggle
          data-sidenav-button
          :aria-expanded="navState === 'open' ? 'true' : 'false'"
          aria-controls="sidenav-panel"
        >
          <span class="sidenav__button-text" aria-hidden="true">
            <span data-sidenav-label class="sidenav__button-label">Menu</span>
            <span data-sidenav-label class="sidenav__button-label">Close</span>
          </span>
          <span class="sr-only">{{ navState === "open" ? "Close menu" : "Open menu" }}</span>
        </button>
    </header>

    <div
      id="sidenav-panel"
      class="sidenav__nav"
      ref="navWrap"
      data-sidenav-wrap
      :data-nav-state="navState"
    >
      <div class="sidenav__overlay" ref="overlay" data-sidenav-overlay data-sidenav-toggle></div>

      <nav class="sidenav__menu" ref="menu" data-sidenav-menu aria-label="Site">
        <!-- Wipe panels -->
        <div class="sidenav__menu-bg" aria-hidden="true">
          <div class="sidenav__menu-bg-panel is--first" ref="panel1" data-sidenav-panel></div>
          <div class="sidenav__menu-bg-panel is--second" ref="panel2" data-sidenav-panel></div>
          <div class="sidenav__menu-bg-panel is--third" ref="panel3" data-sidenav-panel></div>
        </div>

        <div class="sidenav__menu-inner">
          <ul class="sidenav__menu-list">
            <li class="sidenav__menu-list-item" v-for="(item, idx) in items" :key="item.href">
              <a
                class="sidenav__menu-link"
                :href="item.isMail ? '#contact' : item.href"
                :data-mailto="item.isMail ? mailtoEncoded : null"
                :aria-label="item.label"
                data-sidenav-link
                :ref="(el) => setLinkRef(el, idx)"
                @click.prevent="handleLinkClick($event, item)"
              >
                <p class="sidenav__menu-link-heading">{{ item.label }}</p>
                <p class="sidenav__menu-link-eyebrow">{{ item.eyebrow ?? String(idx + 1).padStart(2, "0") }}</p>
                <div class="sidenav__menu-link-bg" aria-hidden="true"></div>
              </a>
            </li>
          </ul>

          <div class="sidenav__menu-details" v-if="socials?.length">
            <p class="sidenav__meta-label" data-sidenav-fade :ref="(el) => setFadeRef(el, 0)">
              Socials
            </p>
            <div class="sidenav__menu-socials">
              <a
                v-for="(s, i) in socials"
                :key="s.href"
                class="sidenav__meta-link text-link"
                :href="s.href"
                :aria-label="s.label"
                target="_blank"
                rel="noopener noreferrer"
                data-sidenav-fade
                :ref="(el) => setFadeRef(el, i + 1)"
              >
                {{ s.label }}
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const mailtoEncoded =
  "&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#106;&#97;&#108;&#97;&#108;&#101;&#100;&#100;&#105;&#110;&#101;&#109;&#97;&#111;&#117;&#107;&#105;&#108;&#64;&#103;&#109;&#97;&#105;&#108;&#46;&#99;&#111;&#109;";

const props = defineProps({
  brand: { type: String, default: "Jalal Eddine Maoukil" },
  brandHref: { type: String, default: "/#hero" },
  blend: { type: Boolean, default: true },

  items: {
    type: Array,
    default: () => ([
      { label: "Home", href: "/", eyebrow: "01" },
      { label: "Works", href: "/works", eyebrow: "02" },
      { label: "Info", href: "/info", eyebrow: "03" },
      { label: "Blog", href: "/blog", eyebrow: "04" },
      { label: "Contact", href: "#contact", eyebrow: "05", isMail: true },
    ]),
  },

  socials: {
    type: Array,
    default: () => ([
      { label: "Instagram", href: "https://www.instagram.com/jalal.edn/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/jalal-eddine-maoukil/" },
      { label: "GitHub", href: "https://github.com/jalaleddinemaoukil" },
    ]),
  },
});

const root = ref(null);
const menuButton = ref(null);
const navWrap = ref(null);
const overlay = ref(null);
const menu = ref(null);

const panel1 = ref(null);
const panel2 = ref(null);
const panel3 = ref(null);

const navState = ref("closed");
const navHidden = ref(false);
const linkRefs = ref([]);
const fadeRefs = ref([]);

let tl = null;
let lastScrollY = 0;
let scrollRaf = null;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;


const getGSAP = () => {
  const gsap = window.gsap;
  const CustomEase = window.CustomEase;
  if (!gsap) return null;

  gsap.registerPlugin(CustomEase);
  CustomEase?.create?.("main", "0.65, 0.01, 0.05, 0.99");
  gsap.defaults({ ease: "main", duration: 0.7 });

  return gsap;
};

const setLinkRef = (el, idx) => {
  if (!el) return;
  linkRefs.value[idx] = el;
};

const setFadeRef = (el, idx) => {
  if (!el) return;
  fadeRefs.value[idx] = el;
};

const lockScroll = (locked) => {
  document.documentElement.style.overflow = locked ? "hidden" : "";
};

const openNav = () => {
  const gsap = getGSAP();
  if (!gsap || !navWrap.value) return;

  navState.value = "open";

  if (prefersReducedMotion()) {
    gsap.set(navWrap.value, { display: "block" });
    gsap.set(menu.value, { xPercent: 0 });
    gsap.set(overlay.value, { autoAlpha: 1 });
    gsap.set(fadeRefs.value.filter(Boolean), { autoAlpha: 1, yPercent: 0 });
    lockScroll(true);
    return;
  }

  const bgPanels = [panel1.value, panel2.value, panel3.value].filter(Boolean);
  const links = linkRefs.value.filter(Boolean);
  const fades = fadeRefs.value.filter(Boolean);
  const labels = menuButton.value?.querySelectorAll?.("[data-sidenav-label]") || [];

  tl.clear()
    .set(navWrap.value, { display: "block" })
    .set(menu.value, { xPercent: 0 }, "<")
    .fromTo(labels, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 })
    .fromTo(overlay.value, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
    .fromTo(bgPanels, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<")
    .fromTo(links, { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05 }, "<+=0.35")
    .fromTo(fades, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.08 }, "<+=0.15");

  lockScroll(true);
};

const closeNav = () => {
  const gsap = getGSAP();
  if (!gsap || !navWrap.value) return;

  navState.value = "closed";

  if (prefersReducedMotion()) {
    gsap.set(overlay.value, { autoAlpha: 0 });
    gsap.set(menu.value, { xPercent: 120 });
    gsap.set(fadeRefs.value.filter(Boolean), { autoAlpha: 0, yPercent: 40 });
    gsap.set(navWrap.value, { display: "none" });
    lockScroll(false);
    menuButton.value?.focus?.();
    return;
  }

  const fades = fadeRefs.value.filter(Boolean);
  const labels = menuButton.value?.querySelectorAll?.("[data-sidenav-label]") || [];

  tl.clear()
    .to(overlay.value, { autoAlpha: 0 })
    .to(menu.value, { xPercent: 120 }, "<")
    .to(labels, { yPercent: 0 }, "<")
    .to(fades, { autoAlpha: 0, yPercent: 40, duration: 0.2 }, "<")
    .set(navWrap.value, { display: "none" });

  lockScroll(false);
  menuButton.value?.focus?.();
};

const toggleNav = () => {
  if (navState.value === "open") closeNav();
  else openNav();
};

const onKeydown = (e) => {
  if (e.key === "Escape" && navState.value === "open") closeNav();
};

const decodeMailto = (encoded = "") =>
  encoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const handleLinkClick = (event, item) => {
  closeNav();
  const target = event?.currentTarget;
  const encoded = target?.getAttribute?.("data-mailto");
  const href = encoded ? decodeMailto(encoded) : item?.href;
  if (!href) return;

  // mailto
  if (href.startsWith("mailto:")) {
    setTimeout(() => (window.location.href = href), 250);
    return;
  }

  // internal route
  if (href.startsWith("/")) {
    setTimeout(() => {
      const handled = window.__pageWipeNavigate?.(href);
      if (!handled) window.location.href = href;
    }, 250);
    return;
  }

  // anchor
  const el = document.querySelector(href);
  if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 250);
};

const handleBrandClick = (event) => {
  event?.preventDefault?.();
  const href = props.brandHref || "/#hero";
  const isHome = window.location.pathname === "/" || window.location.pathname === "";

  if (navState.value === "open") closeNav();

  if (isHome && href.includes("#")) {
    const hash = href.split("#")[1];
    const target = hash ? `#${hash}` : "#hero";
    const el = document.querySelector(target);
    requestAnimationFrame(() => {
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState({}, "", target);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState({}, "", "#hero");
      }
    });
    return;
  }

  // Not on home: redirect to home hero
  if (!isHome) {
    const next = href.startsWith("/") ? href : `/${href.replace(/^#/, "#")}`;
    window.location.href = next;
  }
};

onMounted(() => {
  const gsap = getGSAP();
  if (!gsap) return;

  gsap.set(navWrap.value, { display: "none" });
  gsap.set(menu.value, { xPercent: 120 });
  gsap.set(overlay.value, { autoAlpha: 0 });
  gsap.set([panel1.value, panel2.value, panel3.value], { xPercent: 101 });
  gsap.set(fadeRefs.value.filter(Boolean), { autoAlpha: 0, yPercent: 40 });

  tl = gsap.timeline();

  root.value?.querySelectorAll?.("[data-sidenav-toggle]")?.forEach((el) => {
    el.addEventListener("click", toggleNav);
  });

  document.addEventListener("keydown", onKeydown);

  lastScrollY = window.scrollY || 0;
  const onScroll = () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      const current = window.scrollY || 0;
      const delta = current - lastScrollY;
      const threshold = 10;

      if (navState.value === "open") {
        navHidden.value = false;
      } else if (current <= 0) {
        navHidden.value = false;
      } else if (delta > threshold) {
        navHidden.value = true;
      } else if (delta < -threshold) {
        navHidden.value = false;
      }

      lastScrollY = current;
      scrollRaf = null;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  if (root.value) root.value._onScroll = onScroll;
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);

  root.value?.querySelectorAll?.("[data-sidenav-toggle]")?.forEach((el) => {
    el.removeEventListener("click", toggleNav);
  });

  tl?.kill();
  tl = null;
  lockScroll(false);

  if (root.value && root.value._onScroll) {
    window.removeEventListener("scroll", root.value._onScroll);
    delete root.value._onScroll;
  }
  if (scrollRaf) cancelAnimationFrame(scrollRaf);
  scrollRaf = null;
});
</script>

<style scoped>
/* Top bar */
.sidenav__header {
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: clamp(20px, 4vw, 30px);
  left: clamp(20px, 4vw, 30px);
  right: clamp(20px, 4vw, 30px);
  pointer-events: none;
  transition: transform 0.28s ease, opacity 0.28s ease;
  will-change: transform, opacity;
}
.sidenav__header > * {
  pointer-events: auto;
}
.is-blend {
  mix-blend-mode: difference;
}

.sidenav__header.is-hidden {
  transform: translate3d(0, -120%, 0);
  opacity: 0;
  pointer-events: none;
}

.sidenav__button {
  background: transparent;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  margin: -1em;
  padding: 1em;
  display: inline-flex;
  align-items: center;
}
.sidenav__button-text {
  height: 1.5em;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.sidenav__button-label {
  margin: 0;
  font-size: clamp(0.9em, 2vw, 1em);
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: var(--tracking-label, 0.08em);
  font-weight: 400;
}

/* Brand */
.sidenav__brand {
  color: var(--color-white);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: var(--tracking-label, 0.08em);
  font-weight: 400;
  font-size: clamp(0.9em, 2vw, 1em);
  opacity: 0.95;
  text-align: right;
}

.sidenav__nav {
  z-index: 100;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  height: calc(var(--vh, 1vh) * 100);
  min-height: 100vh;
  display: none;
  position: fixed;
  inset: 0;
}
.sidenav__overlay {
  z-index: 0;
  cursor: pointer;
  background: rgba(19, 19, 19, 0.4);
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;
}

/* Menu panel */
.sidenav__menu {
  width: clamp(18rem, 34vw, 30rem);
  height: 100%;
  margin-left: auto;
  padding-top: clamp(4em, 6vh, 7em);
  padding-bottom: calc(clamp(1.2em, 3vh, 2em) + env(safe-area-inset-bottom, 0px));
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidenav__menu::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.sidenav__menu-bg {
  z-index: 0;
  position: absolute;
  inset: 0;
}
.sidenav__menu-bg-panel {
  z-index: 0;
  position: absolute;
  inset: 0;
  border-radius: 0;
}

.sidenav__menu-bg-panel.is--first { background: var(--color-surface); }
.sidenav__menu-bg-panel.is--second { background: var(--color-muted); }
.sidenav__menu-bg-panel.is--third { background: var(--color-white); }

.sidenav__menu-inner {
  z-index: 1;
  min-height: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: clamp(1.5rem, 3vh, 3rem);
  position: relative;
}

/* Links */
.sidenav__menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.sidenav__menu-list::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.sidenav__menu-list-item {
  height: 5em;
  overflow: hidden;
}
.sidenav__menu-link {
  color: #131313;
  width: 100%;
  padding: clamp(0.5em, 2vh, 0.75em) 0;
  padding-left: clamp(1em, 4vw, 1.75em);
  text-decoration: none;
  display: flex;
  gap: 0.75em;
  align-items: baseline;
  position: relative;
  overflow: hidden;
}
.sidenav__menu-link-heading {
  margin: 0;
  color: #131313;
  font-size: clamp(2.9rem, 12vw, 3.3rem);
  font-weight: 600;
  line-height: 0.85;
  letter-spacing: var(--tracking-display, -0.015em);
  text-transform: uppercase;
  font-family: var(--font-main);
  position: relative;
  z-index: 2;
  text-shadow: 0px 1em 0px rgb(255, 255, 255);
  transition: transform 0.55s cubic-bezier(0.65, 0.05, 0, 1);
  transition-delay: 0s;
}
.sidenav__menu-link-eyebrow {
  margin: 0;
  font-size: 0.875em;
  text-transform: uppercase;
  letter-spacing: var(--tracking-label, 0.08em);
  opacity: 0.9;
  color: #131313;
  position: relative;
  z-index: 2;
  display: inline-block;
  padding: 0.08em 0.5em;
  border-radius: 0.35em;
  background: transparent;
  color: inherit;
  transition: background-color 220ms ease, color 220ms ease, transform 200ms ease;
}

.sidenav__menu-link-bg {
  transform-origin: 50% 100%;
  transform-style: preserve-3d;
  transition: transform 0.55s cubic-bezier(0.65, 0.05, 0, 1);
  transform: scale3d(1, 0, 1);
  position: absolute;
  inset: 0;
  z-index: 0;
  background: black;
}

.sidenav__menu-link:hover .sidenav__menu-link-heading {
  transform: translate(0px, -1em);
  transition-delay: 0.1s;
}

.sidenav__menu-link:hover .sidenav__menu-link-bg {
  transform: scale3d(1, 1, 1);
}

.sidenav__menu-link:hover .sidenav__menu-link-eyebrow {
  background: #000;
  color: #fff;
  transform: translateY(-0.08em);
}

/* Socials */
.sidenav__menu-details {
  padding-left: clamp(1.25em, 4vw, 1.75em);
  display: flex;
  flex-direction: column;
  margin-top: auto;
  padding-top: clamp(1.5rem, 3vh, 2rem);
  gap: 1.25em;
  color: #131313;
}
.sidenav__meta-label {
  margin: 0;
  font-size: 1.125em;
  line-height: 1.4;
}
.sidenav__menu-socials {
  display: flex;
  gap: 1.5em;
  flex-wrap: wrap;
}
.sidenav__meta-link {
  color: #131313;
  text-decoration: none;
  font-size: 1.125em;
  line-height: 1.4;
  position: relative;
}
.sidenav__meta-link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.125em;
  height: 2px;
  background: currentColor;
  transform-origin: right center;
  transform: scaleX(0);
  transition: transform 220ms ease;
}
.sidenav__meta-link:hover::after {
  transform-origin: left center;
  transform: scaleX(1);
}

/* Mobile */
@media (max-width: 767px) {
  .sidenav__menu { 
    width: 100%;
  }
  .sidenav__menu-bg-panel { 
    border-top-left-radius: 0; 
    border-bottom-left-radius: 0; 
  }
  .sidenav__menu-list-item { 
    height: 4.5em; 
  }
  .sidenav__menu-link-heading { 
    font-size: clamp(2.6rem, 12vw, 3.6rem); 
  }
  .sidenav__menu-socials { 
    gap: 1em; 
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .sidenav__menu-link-heading {
    font-size: clamp(2.2rem, 11vw, 3rem);
  }
  
  .sidenav__menu-list-item {
    height: 4em;
  }
}

/* A11y */
.sr-only {
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

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .sidenav__menu-link-bg,
  .sidenav__menu-link-heading,
  .sidenav__menu-link-eyebrow {
    transition: none !important;
  }
}
</style>
