import "./styles/global.css";
import { ViteSSG } from "vite-ssg";
import App from "@/App.vue";
import { routes } from "@/router/routes.js";
import { initLenis } from "@/scripts/lenis-init.js";
import {
  fetchHomeWorkItems,
  fetchWorksItems,
  prefetchHomeWorkItems,
  prefetchWorksItems,
} from "@/lib/sanity.js";

const hydrateInitialState = () => {
  if (typeof window === "undefined") return;

  const raw = window.__INITIAL_STATE__;
  if (typeof raw === "string" && raw.trim()) return;

  if (raw && typeof raw.textContent === "string" && raw.textContent.trim()) {
    window.__INITIAL_STATE__ = raw.textContent.trim();
    return;
  }

  const stateEl = document.getElementById("__INITIAL_STATE__");
  if (stateEl?.textContent?.trim()) {
    window.__INITIAL_STATE__ = stateEl.textContent.trim();
  }
};

hydrateInitialState();

const scrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) return savedPosition;
  // Hash scrolling is handled via Lenis in router.afterEach to avoid
  // conflicts between native scrollIntoView and Lenis's virtual scroll.
  if (to.hash) return false;
  return { top: 0, left: 0, behavior: "auto" };
};

export const createApp = ViteSSG(
  App,
  { routes, scrollBehavior },
  async ({ router, isClient, initialState, routePath }) => {
    if (import.meta.env.SSR) {
      if (routePath === "/") {
        initialState.homeWorkItems = await fetchHomeWorkItems();
      }
      if (routePath === "/works") {
        initialState.worksItems = await fetchWorksItems();
      }
    }

    if (isClient) {
      initLenis();

      const runSanityPrefetch = () => {
        const path = window.location.pathname;

        if (path !== "/") {
          prefetchHomeWorkItems();
        }

        if (path !== "/works") {
          prefetchWorksItems();
        }
      };

      const prefetchSanity = () => {
        const schedule = () => {
          if ("requestIdleCallback" in window) {
            window.requestIdleCallback(runSanityPrefetch, { timeout: 3000 });
          } else {
            window.setTimeout(runSanityPrefetch, 1200);
          }
        };

        if (document.readyState === "complete") {
          schedule();
        } else {
          window.addEventListener("load", schedule, { once: true });
        }
      };

      if (typeof window !== "undefined") {
        prefetchSanity();
      }

      router.afterEach((to) => {
        const forceScrollTop = () => {
          window.__lenis?.scrollTo?.(0, { immediate: true, force: true });
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        };

        if (!to.hash) {
          const activeElement = document.activeElement;
          if (activeElement instanceof HTMLElement) {
            activeElement.blur();
          }

          forceScrollTop();
          requestAnimationFrame(forceScrollTop);
          window.setTimeout(forceScrollTop, 90);
        } else {
          // Hash navigation: use Lenis to scroll so it stays in sync.
          const hash = to.hash;
          let attempts = 0;
          const maxAttempts = 80;

          const tryLenisScroll = () => {
            const el = document.querySelector(hash);
            if (el) {
              window.__lenis?.resize?.();
              if (window.__lenis) {
                window.__lenis.scrollTo(el, { offset: 0, duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
              } else {
                el.scrollIntoView({ behavior: "smooth" });
              }
              return;
            }
            if (attempts >= maxAttempts) return;
            attempts += 1;
            requestAnimationFrame(tryLenisScroll);
          };

          requestAnimationFrame(tryLenisScroll);
        }

        requestAnimationFrame(() => {
          window.dispatchEvent(new Event("app:route-change"));
          window.dispatchEvent(new Event("content:loaded"));
        });
      });
    }
  }
);
