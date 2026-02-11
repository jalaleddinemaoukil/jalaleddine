<template>
  <div
    id="preloader"
    class="preloader"
    role="dialog"
    aria-modal="true"
    aria-label="Loading content"
    data-preloader
    :data-config="CONFIG_JSON"
  >
    <div class="progress" aria-hidden="true">
      <div class="progress__track">
        <div class="progress__bar" data-progress-bar></div>
        <div class="progress__glow" data-progress-glow></div>
      </div>
    </div>

    <div class="stage" aria-hidden="true">
      <div class="stage__bg" data-stage-bg></div>
      <div class="frame" data-frame>
        <div class="frame__inner">
          <img
            data-img
            :src="profileImageSrc"
            sizes="(max-width: 768px) 68vw, 25rem"
            width="800"
            height="800"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            alt="Portfolio preview"
            class="frame__img"
          />
          <div class="frame__overlay" data-frame-overlay></div>
        </div>
        <div class="wipe" data-wipe></div>
      </div>

      <div class="accent accent--top" data-accent-top></div>
      <div class="accent accent--bottom" data-accent-bottom></div>
    </div>

    <div class="text-stack" data-text-stack>
      <div class="name" data-name>
        <span data-name-text>
          JALAL EDDINE
        </span>
      </div>

      <div class="copy" data-copy>
        <p data-copy-text>
          I transform complex technical ideas into modern cloud solutions and
          high-performance web applications that solve real-world problems.
        </p>
      </div>
    </div>

    <div class="sr-status" role="status" aria-live="polite" data-sr-status>
      Loading
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import profileImage from "../assets/images/profile.webp";

const PRELOADER_CONFIG = {
  ENTER_MS: 1100,
  PROGRESS_MS: 1400,
  EXIT_MS: 850,
  MAX_TOTAL_MS: 7000,
  SESSION_KEY: "preloaderShown_v7",
  SKIP_ON_CLIENT_SWAPS: true,
};

const CONFIG_JSON = JSON.stringify(PRELOADER_CONFIG);
const profileImageSrc = typeof profileImage === "string" ? profileImage : profileImage?.src;

onMounted(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const PRELOADER_ID = "preloader";
  const GLOBAL_FLAG = "__preloader_running__";
  const EASE_FLAG = "__preloader_ease__";

  function splitToMaskedWords(node) {
    if (!node) return [];
    const original = node.dataset.originalText ?? node.textContent ?? "";
    if (!node.dataset.originalText) node.dataset.originalText = original;
    const text = original.trim();
    if (!text) return [];
    node.textContent = "";

    const frag = document.createDocumentFragment();
    const words = text.split(/\s+/).filter(Boolean);
    const targets = [];

    for (let i = 0; i < words.length; i++) {
      const mask = document.createElement("span");
      mask.className = "word-mask";

      const w = document.createElement("span");
      w.className = "word";
      w.textContent = words[i];

      mask.appendChild(w);
      frag.appendChild(mask);
      targets.push(w);

      if (i !== words.length - 1) {
        const sp = document.createElement("span");
        sp.className = "space";
        sp.textContent = " ";
        frag.appendChild(sp);
      }
    }

    node.appendChild(frag);
    return targets;
  }

  const waitForGsap = async (timeoutMs = 1200) => {
    const start = performance.now();
    while (performance.now() - start < timeoutMs) {
      if (window.gsap) return { gsap: window.gsap, CustomEase: window.CustomEase };
      await new Promise((r) => setTimeout(r, 50));
    }
    return { gsap: window.gsap, CustomEase: window.CustomEase };
  };

  function getNavType() {
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav && typeof nav.type === "string") return nav.type;
    } catch {}
    return "navigate";
  }

  function runPreloaderOnce() {
    const preloader = document.getElementById(PRELOADER_ID);
    if (!preloader) return;

    if (window[GLOBAL_FLAG]) return;
    window[GLOBAL_FLAG] = true;

    const CONFIG = JSON.parse(preloader.getAttribute("data-config") || "{}");

    const navType = getNavType();
    const isReload = navType === "reload";
    const isBackForward = navType === "back_forward";
    const isHome = window.location.pathname === "/" || window.location.pathname === "";

    if (isBackForward) {
      preloader.style.display = "none";
      preloader.setAttribute("aria-hidden", "true");
      window[GLOBAL_FLAG] = false;
      return;
    }

    if (!isHome) {
      preloader.style.display = "none";
      preloader.setAttribute("aria-hidden", "true");
      window[GLOBAL_FLAG] = false;
      return;
    }

    try {
      if (isReload) {
        sessionStorage.removeItem(CONFIG.SESSION_KEY);
      } else if (CONFIG.SKIP_ON_CLIENT_SWAPS) {
        const already = sessionStorage.getItem(CONFIG.SESSION_KEY);
        if (already === "1") {
          preloader.style.display = "none";
          preloader.setAttribute("aria-hidden", "true");
          window[GLOBAL_FLAG] = false;
          return;
        }
        sessionStorage.setItem(CONFIG.SESSION_KEY, "1");
      }
    } catch {}

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = matchMedia("(pointer: coarse)")?.matches;
    const saveData = navigator.connection?.saveData === true;
    const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
    const lowCpu = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
    const lowPower = reduceMotion || isCoarsePointer || saveData || lowMemory || lowCpu;

    const el = {
      bar: $("[data-progress-bar]", preloader),
      glow: $("[data-progress-glow]", preloader),
      wipe: $("[data-wipe]", preloader),
      img: $("[data-img]", preloader),
      overlay: $("[data-frame-overlay]", preloader),
      stageBg: $("[data-stage-bg]", preloader),
      accentTop: $("[data-accent-top]", preloader),
      accentBottom: $("[data-accent-bottom]", preloader),
      nameText: $("[data-name-text]", preloader),
      copyText: $("[data-copy-text]", preloader),
      sr: $("[data-sr-status]", preloader),
    };
    const showText = () => {
      if (el.nameText) {
        el.nameText.style.visibility = "visible";
        if (!el.nameText.textContent?.trim() && el.nameText.dataset.originalText) {
          el.nameText.textContent = el.nameText.dataset.originalText;
        }
      }
      if (el.copyText) {
        el.copyText.style.visibility = "visible";
        if (!el.copyText.textContent?.trim() && el.copyText.dataset.originalText) {
          el.copyText.textContent = el.copyText.dataset.originalText;
        }
      }
    };
    const accents = [el.accentTop, el.accentBottom].filter(Boolean);

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    let done = false;
    const finish = (reason) => {
      if (done) return;
      done = true;
      preloader.style.display = "none";
      preloader.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = prevOverflow;
      window[GLOBAL_FLAG] = false;
      window.dispatchEvent(
        new CustomEvent("preloaderComplete", { detail: { reason } }),
      );
    };

    const timeoutId = window.setTimeout(
      () => finish("timeout"),
      CONFIG.MAX_TOTAL_MS || 7000,
    );

    (async () => {
      if (lowPower) {
        showText();
        preloader.classList.add("is-simple");
        window.clearTimeout(timeoutId);
        const MIN_SHOW_MS = 900;
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("preloaderExit", { detail: { reason: "simple" } }));
          preloader.classList.add("is-exiting");
          setTimeout(() => finish("simple"), 380);
        }, MIN_SHOW_MS);
        return;
      }

      const pack = await waitForGsap();
      const gsap = pack?.gsap;
      const CustomEase = pack?.CustomEase;
      if (!gsap) {
        showText();
        window.clearTimeout(timeoutId);
        finish("no-gsap");
        return;
      }
      if (CustomEase?.create && !window[EASE_FLAG]) {
        gsap.registerPlugin(CustomEase);
        CustomEase.create("osmoEase", "0.625, 0.05, 0, 1");
        window[EASE_FLAG] = true;
      }

      try {
        await document.fonts?.ready;
      } catch {}
      try {
        await el.img?.decode?.();
      } catch {}

      gsap.set([el.nameText, el.copyText].filter(Boolean), { visibility: "visible" });
      const headingWords = splitToMaskedWords(el.nameText);
      const copyWords = splitToMaskedWords(el.copyText);

      if (!headingWords.length && el.nameText) {
        el.nameText.textContent = el.nameText.dataset.originalText || el.nameText.textContent;
        el.nameText.style.visibility = "visible";
      }
      if (!copyWords.length && el.copyText) {
        el.copyText.textContent = el.copyText.dataset.originalText || el.copyText.textContent;
        el.copyText.style.visibility = "visible";
      }

      if (!headingWords.length && !copyWords.length) {
        showText();
        window.clearTimeout(timeoutId);
        finish("split-failed");
        return;
      }

      if (el.sr) el.sr.textContent = "Loading...";

      const enter = (CONFIG.ENTER_MS || 1100) / 1000;
      const prog = (CONFIG.PROGRESS_MS || 1400) / 1000;
      const exit = (CONFIG.EXIT_MS || 850) / 1000;

      gsap.set(preloader, { opacity: 1, yPercent: 0, display: "block" });
      if (el.stageBg) gsap.set(el.stageBg, { opacity: 0 });
      gsap.set(el.wipe, { scaleY: 1, transformOrigin: "50% 100%" });
      gsap.set(el.img, { scale: 1.45, filter: "blur(8px) brightness(0.92)" });
      gsap.set(el.overlay, { opacity: 1 });
      if (accents.length) {
        gsap.set(accents, {
          scaleX: 0,
          opacity: 0,
          transformOrigin: "50% 50%",
        });
      }
      gsap.set(headingWords, { yPercent: 110 });
      gsap.set(copyWords, { yPercent: 110 });
      if (el.bar) gsap.set(el.bar, { scaleX: 0, transformOrigin: "0 50%" });
      if (el.glow) gsap.set(el.glow, { opacity: 0, x: -30 });

      const tl = gsap.timeline({
        defaults: { ease: window[EASE_FLAG] ? "osmoEase" : "power2.out" },
        onComplete: () => {
          window.clearTimeout(timeoutId);
          finish("completed");
        },
      });

      if (el.stageBg) {
        tl.to(
          el.stageBg,
          { opacity: 1, duration: 0.35, ease: "power2.out" },
          0.05,
        );
      }
      tl.to(el.wipe, { scaleY: 0, duration: enter, ease: "power2.inOut" }, 0.0);
      tl.to(
        el.img,
        {
          scale: 1,
          filter: "blur(0px) brightness(1)",
          duration: enter + 0.5,
          ease: "expo.out",
        },
        0.05,
      );
      tl.to(
        el.overlay,
        { opacity: 0, duration: enter * 0.7, ease: "power2.out" },
        0.12,
      );

      if (el.accentTop) {
        tl.to(
          el.accentTop,
          { scaleX: 1, opacity: 0.6, duration: 0.55, ease: "power2.inOut" },
          0.32,
        );
      }
      if (el.accentBottom) {
        tl.to(
          el.accentBottom,
          { scaleX: 1, opacity: 0.6, duration: 0.55, ease: "power2.inOut" },
          0.38,
        );
      }

      tl.to(headingWords, { yPercent: 0, duration: 0.6, stagger: 0.11 }, 0.2);
      tl.to(copyWords, { yPercent: 0, duration: 0.6, stagger: 0.04 }, 0.4);

      if (el.bar) {
        tl.to(el.bar, { scaleX: 1, duration: prog, ease: "power1.out" }, 0.6);
      }
      if (el.glow) {
        tl.to(
          el.glow,
          { opacity: 1, x: 0, duration: 0.22, ease: "power1.out" },
          0.7,
        );
        tl.to(
          el.glow,
          { opacity: 0, x: 30, duration: 0.22, ease: "power1.in" },
          1.0,
        );
      }

      tl.add(() => {
        if (el.sr) el.sr.textContent = "Almost ready...";
      }, ">-0.2");
      tl.add(() => {
        window.dispatchEvent(new CustomEvent("preloaderExit", { detail: { reason: "completed" } }));
      }, ">");

      if (accents.length) {
        tl.to(
          accents,
          { opacity: 0, duration: 0.18, ease: "power2.out" },
          ">-0.1",
        );
      }

      tl.to(
        headingWords,
        {
          yPercent: -30,
          opacity: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: "expo.out",
        },
        "+=0.3",
      );
      tl.to(
        copyWords,
        {
          yPercent: -20,
          opacity: 0,
          duration: 0.35,
          stagger: 0.02,
          ease: "expo.out",
        },
        "<+0.05",
      );

      if (el.stageBg) {
        tl.to(
          el.stageBg,
          { opacity: 0, duration: 0.25, ease: "power2.in" },
          "<+0.05",
        );
      }
      tl.to(
        el.img,
        {
          scale: 1.18,
          opacity: 0.9,
          filter: "blur(2px) brightness(0.9)",
          duration: exit,
          ease: "power2.inOut",
        },
        "<",
      );

      tl.to(
        el.wipe,
        {
          scaleY: 1,
          transformOrigin: "50% 0%",
          duration: exit * 0.9,
          ease: "power2.inOut",
        },
        "<+0.08",
      );
      tl.to(
        preloader,
        { yPercent: -100, opacity: 0.96, duration: exit, ease: "expo.out" },
        ">-0.05",
      );
    })().catch((err) => {
      console.error("[Preloader] error:", err);
      window.clearTimeout(timeoutId);
      finish("error");
    });
  }

  runPreloaderOnce();
  const ensureHeadingVisible = () => {
    const preloader = document.getElementById(PRELOADER_ID);
    if (!preloader) return;
    const name = preloader.querySelector("[data-name-text]");
    if (!name) return;

    const word = name.querySelector(".word");
    const mask = word?.parentElement;
    let outOfMask = false;
    if (word && mask) {
      const w = word.getBoundingClientRect();
      const m = mask.getBoundingClientRect();
      outOfMask = w.bottom <= m.top + 1 || w.top >= m.bottom - 1;
    }

    if (!name.textContent?.trim()) {
      name.textContent = name.dataset.originalText || name.textContent || "JALAL EDDINE";
    }
    name.style.visibility = "visible";
    name.style.opacity = "1";

    if (outOfMask) {
      name.querySelectorAll(".word").forEach((node) => {
        node.style.transform = "translate3d(0, 0, 0)";
        node.style.opacity = "1";
      });
    }
  };
  setTimeout(ensureHeadingVisible, 450);
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    const preloader = document.getElementById(PRELOADER_ID);
    if (!preloader) return;
    preloader.style.display = "none";
    preloader.setAttribute("aria-hidden", "true");
    window[GLOBAL_FLAG] = false;
  }, { passive: true });

  window.addEventListener(
    "app:route-change",
    () => {
      if (window[GLOBAL_FLAG]) return;
      const preloader = document.getElementById(PRELOADER_ID);
      if (!preloader) return;
      preloader.style.display = "none";
      preloader.setAttribute("aria-hidden", "true");
      window[GLOBAL_FLAG] = false;
    },
    { passive: true }
  );
});

onBeforeUnmount(() => {
  window.removeEventListener("pageshow", () => {});
});
</script>

<style>
  .preloader [data-name-text],
  .preloader [data-copy-text] {
    visibility: visible;
  }

  .word-mask {
    display: inline-block;
    overflow: hidden;
    vertical-align: bottom;
  }

  .word {
    display: inline-block;
    will-change: transform;
  }

  .space {
    display: inline-block;
    width: 0.36em;
  }

  .preloader {
    position: fixed;
    inset: 0;
    height: 100dvh;
    background: linear-gradient(165deg, #000 0%, #0a0a0a 100%);
    z-index: 10002;
    overflow: hidden;
    font-family: var(--font-main);
    contain: layout paint style;
    transform: translateZ(0);
    opacity: 1;
  }

  .progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 3px;
    width: 100%;
    z-index: 10;
  }
  .progress__track {
    position: relative;
    height: 100%;
    width: 100%;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }
  .progress__bar {
    position: absolute;
    inset: 0;
    transform-origin: 0 50%;
    transform: scaleX(0);
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.6) 0%,
      rgba(255, 255, 255, 0.95) 50%,
      rgba(255, 255, 255, 1) 100%
    );
    will-change: transform;
  }
  .progress__glow {
    position: absolute;
    right: -60px;
    top: 50%;
    width: 60px;
    height: 120%;
    transform: translateY(-50%) translateZ(0);
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%
    );
    opacity: 0;
    will-change: opacity, transform;
    filter: blur(8px);
  }

  .stage {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
    z-index: 1;
  }
  .stage__bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 80% 60% at 50% 45%,
      rgba(255, 255, 255, 0.03) 0%,
      transparent 70%
    );
    opacity: 0;
    will-change: opacity;
  }

  .frame {
    width: min(25rem, 68vw);
    aspect-ratio: 1 / 1;
    position: relative;
    transform: translateZ(0);
    filter: drop-shadow(0 20px 60px rgba(0, 0, 0, 0.6));
  }
  .frame__inner {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 2px;
  }
  .frame__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.45) translateZ(0);
    opacity: 1;
    will-change: transform, opacity, filter;
    display: block;
    filter: blur(0px) brightness(0.92);
  }
  .frame__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.15) 0%,
      transparent 40%,
      transparent 60%,
      rgba(0, 0, 0, 0.25) 100%
    );
    opacity: 1;
    will-change: opacity;
  }
  .wipe {
    position: absolute;
    inset: 0;
    background: #000;
    transform-origin: 50% 100%;
    transform: scaleY(1);
    will-change: transform;
  }

  .accent {
    position: absolute;
    width: 140%;
    height: 1px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    transform-origin: 50% 50%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.25) 50%,
      transparent 100%
    );
    will-change: transform, opacity;
    opacity: 0;
    display: none;
  }
  .accent--top {
    top: 28%;
  }
  .accent--bottom {
    bottom: 24%;
  }

  .text-stack {
    position: absolute;
    left: 50%;
    bottom: clamp(1.5rem, 6.5vh, 3.5rem);
    transform: translateX(-50%) translateZ(0);
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(0.75rem, 2.2vh, 1.75rem);
    pointer-events: none;
    z-index: 3;
  }

  .copy {
    width: min(88%, 580px);
    max-width: 94%;
    padding: 0 1rem;
    color: rgba(255, 255, 255, 0.88);
    text-transform: uppercase;
    text-align: center;
    letter-spacing: var(--tracking-label);
    line-height: var(--lh-base);
    overflow: hidden;
    pointer-events: none;
  }
  .copy p {
    margin: 0;
    font-size: clamp(0.9rem, 1.6vw, 1.1rem);
    font-weight: 400;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
  }

  .name {
    width: 100%;
    display: grid;
    place-items: center;
    pointer-events: none;
    overflow: visible;
    max-width: min(92vw, 1200px);
    margin-inline: auto;
  }
  .name [data-name-text] {
    color: #fff;
    text-transform: uppercase;
    font-weight: 600;
    font-size: clamp(1.85rem, 8.5vw, 7.5rem);
    letter-spacing: var(--tracking-display);
    padding: 0 clamp(0.75rem, 3vw, 2rem);
    line-height: 1.02;
    white-space: normal;
    text-align: center;
    text-shadow:
      0 2px 18px rgba(0, 0, 0, 0.6),
      0 0 40px rgba(255, 255, 255, 0.08);
  }
  @media (max-width: 540px) {
    .name [data-name-text] {
      line-height: 1.08;
    }
  }

  .sr-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
    padding: 0;
    margin: -1px;
  }

  .preloader.is-simple .progress__glow,
  .preloader.is-simple .accent,
  .preloader.is-simple .stage__bg,
  .preloader.is-simple .wipe {
    display: none;
  }

  .preloader.is-simple .frame__img {
    filter: none;
    transform: scale(1.1);
  }

  .preloader.is-simple {
    transition: opacity 0.35s ease, transform 0.35s ease;
  }

  .preloader.is-simple.is-exiting {
    opacity: 0;
    transform: translate3d(0, -8px, 0);
  }
</style>
