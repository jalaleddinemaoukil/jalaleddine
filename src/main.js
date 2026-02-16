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
  if (to.hash) {
    return new Promise((resolve) => {
      const target = to.hash;
      let attempts = 0;
      const maxAttempts = 60;

      const tryScroll = () => {
        const el = document.querySelector(target);
        if (el) {
          resolve({ el: target, behavior: "smooth" });
          return;
        }

        if (attempts >= maxAttempts) {
          resolve({ top: 0, left: 0, behavior: "auto" });
          return;
        }

        attempts += 1;
        requestAnimationFrame(tryScroll);
      };

      tryScroll();
    });
  }
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

      const prefetchSanity = () => {
        prefetchHomeWorkItems();
        prefetchWorksItems();
      };

      if (typeof window !== "undefined") {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(prefetchSanity, { timeout: 2000 });
        } else {
          window.setTimeout(prefetchSanity, 250);
        }
      }

      router.afterEach((to) => {
        if (!to.hash) {
          window.__lenis?.scrollTo?.(0, { immediate: true, force: true });
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }

        requestAnimationFrame(() => {
          window.dispatchEvent(new Event("app:route-change"));
          window.dispatchEvent(new Event("content:loaded"));
        });
      });
    }
  }
);
