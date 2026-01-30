<template>
  <div class="sidenav" ref="root">
    <!-- Fixed top bar -->
    <header class="sidenav__header" :class="{ 'is-blend': blend }">
        <!-- LEFT: Brand / logo text -->
        <a :href="brandHref" class="sidenav__brand">
          {{ brand }}
        </a>

        <!-- RIGHT: Menu toggle -->
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

    <!-- Nav wrap -->
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
                :href="item.href"
                data-sidenav-link
                :ref="(el) => setLinkRef(el, idx)"
                @click.prevent="handleLinkClick(item.href)"
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
                target="_blank"
                rel="noreferrer"
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

const props = defineProps({
  brand: { type: String, default: "Jalal Eddine Maoukil" },
  brandHref: { type: String, default: "#hero" },
  blend: { type: Boolean, default: true },

  items: {
    type: Array,
    default: () => ([
      { label: "Home", href: "/", eyebrow: "01" },
      { label: "Works", href: "/works", eyebrow: "02" },
      { label: "About", href: "/about", eyebrow: "03" },
      { label: "Blog", href: "/blog", eyebrow: "04" },
      { label: "Contact", href: "mailto:jalaleddinemaoukil@gmail.com", eyebrow: "05" },
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

const navState = ref("closed"); // 'open' | 'closed'
const linkRefs = ref([]);
  const fadeRefs = ref([]);

let tl = null;

const prefersReducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

/* Hover is handled via CSS now (text-shadow + bg scale). Removed JS hover handlers to match original behavior. */

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

  <template>
    <div class="sidenav" ref="root">
      <!-- Fixed top bar -->
      <header class="sidenav__header" :class="{ 'is-blend': blend }">
          <!-- LEFT: Brand / logo text -->
          <a :href="brandHref" class="sidenav__brand">
            {{ brand }}
          </a>

          <!-- RIGHT: Menu toggle -->
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

      <!-- Nav wrap -->
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
                  :href="item.href"
                  data-sidenav-link
                  :ref="(el) => setLinkRef(el, idx)"
                  @click.prevent="handleLinkClick(item.href)"
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
                  target="_blank"
                  rel="noreferrer"
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

  const props = defineProps({
    brand: { type: String, default: "Jalal Eddine Maoukil" },
    brandHref: { type: String, default: "#hero" },
    blend: { type: Boolean, default: true },

    items: {
      type: Array,
      default: () => ([
        { label: "Home", href: "/", eyebrow: "01" },
        { label: "Works", href: "/works", eyebrow: "02" },
        { label: "About", href: "/about", eyebrow: "03" },
        { label: "Blog", href: "/blog", eyebrow: "04" },
        { label: "Contact", href: "mailto:jalaleddinemaoukil@gmail.com", eyebrow: "05" },
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

  const navState = ref("closed"); // 'open' | 'closed'
  const linkRefs = ref([]);
  const fadeRefs = ref([]);

  let tl = null;
  const hoverHandlers = [];

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
      lockScroll(true);
      return;
    }

    const bgPanels = [panel1.value, panel2.value, panel3.value].filter(Boolean);
    const links = linkRefs.value.filter(Boolean);
    const labels = menuButton.value?.querySelectorAll?.("[data-sidenav-label]") || [];

    tl.clear()
      .set(navWrap.value, { display: "block" })
      .set(menu.value, { xPercent: 0 }, "<")
      .fromTo(labels, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 })
      .fromTo(overlay.value, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
      .fromTo(bgPanels, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<")
      .fromTo(links, { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05 }, "<+=0.35");

    lockScroll(true);
  };

  const closeNav = () => {
    const gsap = getGSAP();
    if (!gsap || !navWrap.value) return;

    navState.value = "closed";

    if (prefersReducedMotion()) {
      gsap.set(overlay.value, { autoAlpha: 0 });
      gsap.set(menu.value, { xPercent: 120 });
      gsap.set(navWrap.value, { display: "none" });
      lockScroll(false);
      menuButton.value?.focus?.();
      return;
    }

    const labels = menuButton.value?.querySelectorAll?.("[data-sidenav-label]") || [];

    tl.clear()
      .to(overlay.value, { autoAlpha: 0 })
      .to(menu.value, { xPercent: 120 }, "<")
      .to(labels, { yPercent: 0 }, "<")
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

  // Keeps your old behavior: close nav then navigate
  const handleLinkClick = (href) => {
    closeNav();

    // mailto
    if (href.startsWith("mailto:")) {
      setTimeout(() => (window.location.href = href), 250);
      return;
    }

    // internal route
    if (href.startsWith("/")) {
      setTimeout(() => {
        window.history.pushState({}, "", href);
        window.dispatchEvent(new PopStateEvent("popstate"));
      }, 250);
      return;
    }

    // anchor
    const el = document.querySelector(href);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 250);
  };

  onMounted(() => {
    const initWhenReady = async () => {
      for (let i = 0; i < 50; i++) {
        if (window.gsap) break;
        await new Promise((r) => setTimeout(r, 50));
      }

      const gsap = getGSAP();
      if (!gsap) return;

      // initial hidden states (matches Osmo setup)
      gsap.set(navWrap.value, { display: "none" });
      gsap.set(menu.value, { xPercent: 120 });
      gsap.set(overlay.value, { autoAlpha: 0 });
      gsap.set([panel1.value, panel2.value, panel3.value], { xPercent: 101 });

      // create TL (NOT paused)
      tl = gsap.timeline();

      // toggles (button + overlay)
      root.value?.querySelectorAll?.("[data-sidenav-toggle]")?.forEach((el) => {
        el.addEventListener("click", toggleNav);
      });

      // Re-introduce hover animations using GSAP for links
      if (!prefersReducedMotion()) {
        linkRefs.value.forEach((link) => {
          if (!link) return;
          const heading = link.querySelector('.sidenav__menu-link-heading');
          const bg = link.querySelector('.sidenav__menu-link-bg');

          const onEnter = () => {
            gsap.to(heading, { y: '-1em', duration: 0.45 });
            gsap.to(bg, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.45 });
          };

          const onLeave = () => {
            gsap.to(heading, { y: '0em', duration: 0.45 });
            gsap.to(bg, { scaleY: 0, duration: 0.45 });
          };

          link.addEventListener('mouseenter', onEnter);
          link.addEventListener('mouseleave', onLeave);

          hoverHandlers.push({ el: link, enter: onEnter, leave: onLeave });
        });
      }

      document.addEventListener("keydown", onKeydown);
    };

    initWhenReady();
  });

  onBeforeUnmount(() => {
    document.removeEventListener("keydown", onKeydown);

    root.value?.querySelectorAll?.("[data-sidenav-toggle]")?.forEach((el) => {
      el.removeEventListener("click", toggleNav);
    });

    // remove hover listeners
    hoverHandlers.forEach((h) => {
      h.el.removeEventListener('mouseenter', h.enter);
      h.el.removeEventListener('mouseleave', h.leave);
    });
    hoverHandlers.length = 0;

    tl?.kill();
    tl = null;
    lockScroll(false);
  });
  </script>

  <style scoped>
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
  font-size: 4.5em;
  font-weight: 600;
  line-height: 0.75;
  letter-spacing: -0.015em;
  text-transform: uppercase;
  font-family: "Merriweather", serif;
  position: relative;
  z-index: 1;
}
.sidenav__menu-link-eyebrow {
  margin: 0;
  font-size: 0.875em;
  text-transform: uppercase;
  opacity: 0.9;
  color: #131313;
  position: relative;
  z-index: 1;
}

.sidenav__menu-link-eyebrow {
  display: inline-block;
  padding: 0.08em 0.5em;
  border-radius: 0.35em;
  background: transparent;
  color: inherit;
  transition: background-color 220ms ease, color 220ms ease, transform 200ms ease;
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
}

/* Mobile */
@media (max-width: 767px) {
  .sidenav__menu { width: 100% !important; }
  .sidenav__menu-bg-panel { border-top-left-radius: 0; border-bottom-left-radius: 0; }
  .sidenav__menu-list-item { height: 4.5em; }
  .sidenav__menu-link-heading { font-size: 4em; }
  .sidenav__menu-socials { gap: 1em; }
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
</style>
