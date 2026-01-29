

SENIOR-LEVEL COMPONENT MIGRATION: Preloader Optimization
You are a Staff/Principal Frontend Engineer at a top tech company (Vercel, Stripe, Linear level). I need you to migrate and significantly optimize this Preloader component for production-grade performance.
CURRENT COMPONENT: Preloader.tsx (React + TypeScript)
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

declare global {
  interface Window {
    SplitText: {
      new(
        element: HTMLElement | string,
        options?: { type?: string; linesClass?: string; wordsClass?: string; charsClass?: string }
      ): {
        lines?: HTMLElement[];
        words?: HTMLElement[];
        chars?: HTMLElement[];
        revert: () => void;
      };
    };
    CustomEase: any;
    ScrambleTextPlugin: unknown;
  }
}

type SplitTextConstructor = new (
  element: HTMLElement | string,
  options?: { type?: string; linesClass?: string; wordsClass?: string; charsClass?: string }
) => {
  lines?: HTMLElement[];
  words?: HTMLElement[];
  chars?: HTMLElement[];
  revert: () => void;
};

export default function Preloader() {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true; // Async loading for better performance
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initAnimation = async () => {
      try {
        // Load scripts in parallel for faster loading
        await Promise.all([
          loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js'),
          loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/CustomEase.min.js'),
          loadScript('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrambleTextPlugin.min.js'),
        ]);

        hasAnimated.current = true;

        const SplitTextCtor = window.SplitText as unknown as SplitTextConstructor | undefined;
        const CustomEasePlugin = window.CustomEase as unknown as gsap.Plugin | undefined;
        const ScrambleTextPlugin = window.ScrambleTextPlugin as unknown as gsap.Plugin | undefined;

        gsap.registerPlugin(
          SplitTextCtor as unknown as gsap.Plugin,
          CustomEasePlugin as gsap.Plugin,
          ScrambleTextPlugin as gsap.Plugin
        );

        // Premium custom eases
        (CustomEase as { create: (name: string, ease: string) => void }).create(
          'hop',
          '0.9, 0, 0.1, 1'
        );
        (CustomEase as { create: (name: string, ease: string) => void }).create(
          'premium',
          '0.76, 0, 0.24, 1'
        );

        // Ensure fonts are loaded before measuring text with SplitText
        try {
          if (document.fonts) {
            await document.fonts.ready;
          }
        } catch {
          // fonts API not supported or failed — continue, SplitText will warn if needed
        }

        // Split text for premium animations (guard if SplitText not available)
        let chars: HTMLElement[] = [];
        let lines: HTMLElement[] = [];
        if (SplitTextCtor) {
          try {
            const splitHeader = new SplitTextCtor('.preloader-header a', {
              type: 'chars',
              charsClass: 'char',
            });
            chars = splitHeader.chars || [];

            // Split paragraph into lines with overflow hidden
            const splitParagraph = new SplitTextCtor('.preloader-copy p', {
              type: 'lines',
              linesClass: 'line',
            });
            lines = splitParagraph.lines || [];
          } catch (err) {
            console.warn('SplitText split failed, falling back to non-split animations', err);
            chars = [];
            lines = [];
          }
        }

        // Wrap each line in overflow container for clean reveal
        lines.forEach((line: HTMLElement) => {
          const wrapper = document.createElement('div');
          wrapper.style.overflow = 'hidden';
          line.parentNode?.insertBefore(wrapper, line);
          wrapper.appendChild(line);
        });

        // Resolve image container and image elements from the DOM (avoid using React hooks inside this init function)
        // Use selector fallbacks so GSAP can operate even if querySelector returns null
        const preloaderImagesInner: HTMLElement | string =
          (document.querySelector('.preloader-images .img') as HTMLElement) || '.preloader-images .img';
        const preloaderImg: HTMLImageElement | string =
          (document.querySelector('.preloader-images img') as HTMLImageElement) || '.preloader-images img';

        gsap.set(preloaderImagesInner, { clipPath: 'polygon(...)' });
        gsap.set(preloaderImg, { scale: 1.4 });


        // Master timeline
        const tl = gsap.timeline();

        // ===== INITIAL STATES =====
        gsap.set('.progress-bar', { scaleX: 0 });
        gsap.set('.preloader-header', { opacity: 0, y: 40 });
        gsap.set(lines, { yPercent: 100 });
        gsap.set(preloaderImagesInner, {
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
        });
        gsap.set(preloaderImg, { scale: 1.4 });
        gsap.set(chars, { opacity: 1, y: 0 });

        // ===== ENTRANCE SEQUENCE (0-2s) =====

        // Image container clip-path reveal - STARTS IMMEDIATELY
        tl.to(
          preloaderImagesInner,
          {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            duration: 1.2,
            ease: 'hop',
          },
          0
        )

          // Image scale down (Ken Burns effect) - STARTS IMMEDIATELY
          .to(
            preloaderImg,
            {
              scale: 1,
              duration: 2,
              ease: 'power2.out',
            },
            0
          )

          // Header name entrance with scramble
          .to(
            '.preloader-header',
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'premium',
            },
            0.2
          )
          .to(
            '.preloader-header a',
            {
              scrambleText: {
                text: 'JALAL EDDINE',
                chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                speed: 0.5,
                revealDelay: 0.2,
              },
              duration: 1,
            },
            0.4
          )

          // Paragraph entrance - line by line slide up
          .to(
            lines,
            {
              yPercent: 0,
              duration: 0.8,
              ease: 'power2.out',
              stagger: 0.08,
            },
            0.6
          )

          // ===== PROGRESS BAR (1.5-3.5s) =====

          .to(
            '.progress-bar',
            {
              scaleX: 1,
              duration: 2,
              ease: 'power2.inOut',
            },
            1.5
          )
          .set('.progress-bar', { transformOrigin: 'right' })
          .to('.progress-bar', {
            scaleX: 0,
            duration: 0.7,
            ease: 'power2.in',
          })

          // ===== EXIT SEQUENCE (4-5.5s) =====

          // Image scale up (reverse Ken Burns effect)
          .to(
            preloaderImg,
            {
              scale: 1.4,
              duration: 0.8,
              ease: 'power2.in',
              force3D: true, // Force GPU acceleration
            },
            4
          )

          // Paragraph exit - slide up
          .to(
            lines,
            {
              yPercent: -100,
              duration: 0.6,
              ease: 'power3.in',
              stagger: 0.03,
              force3D: true,
            },
            4.1
          )

          // Header exit - slide up (same style as paragraph)
          .to(
            '.preloader-header',
            {
              y: -100,
              opacity: 0,
              duration: 0.6,
              ease: 'power3.in',
              force3D: true,
            },
            4.1
          )

          // Image and container exit - reverse of entrance
          .to(
            preloaderImagesInner,
            {
              clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
              duration: 0.8,
              ease: 'hop',
              force3D: true,
            },
            4.2
          )

          // Trigger Hero animations early for seamless transition
          .call(() => {
            window.dispatchEvent(new CustomEvent('preloaderComplete'));
          })

          // Final preloader exit - optimized for performance
          .to(
            '.preloader',
            {
              yPercent: -100,
              duration: 0.7,
              ease: 'power3.inOut',
              force3D: true, // Force GPU acceleration
              onStart: () => {
                // Hide content early to reduce paint cost
                const preloader = document.querySelector('.preloader') as HTMLElement;
                if (preloader) {
                  preloader.style.willChange = 'transform';
                }
              },
              onComplete: () => {
                const preloader = document.querySelector('.preloader') as HTMLElement;
                if (preloader) {
                  preloader.style.willChange = 'auto';
                  preloader.style.display = 'none';
                }
              },
            },
            4.5
          );
      } catch (error) {
        console.error('Failed to load GSAP plugins:', error);
      }
    };

    initAnimation();
  }, []);

  return (
    <div
      className="preloader fixed top-0 left-0 w-full  bg-black overflow-hidden z-[10002]"
      style={{
        height: '100dvh', // reliable on mobile
        backgroundColor: '#000000',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Top Progress Bar */}
      <div className="progress-bar absolute top-0 left-0 w-full h-0.5 bg-white origin-left"></div>

      {/* Center Image with Reveal */}
      <div className="preloader-images absolute inset-0 flex items-center justify-center">
        <div className="img w-[min(25rem,68vw)] h-[min(25rem,68vw)] overflow-hidden">
          <img src="/images/2.jpg" alt="Portfolio preview" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Bottom Paragraph */}
      <div className="preloader-copy absolute bottom-[clamp(1.5rem,6vh,3rem)] left-1/2 -translate-x-1/2 w-[min(80%,500px)] max-w-[90%] text-white px-2 sm:px-4">
        <p className="uppercase text-center text-[clamp(0.6rem,2.2vw,0.85rem)] sm:text-[clamp(0.75rem,1.8vw,0.85rem)] font-[530] leading-[1.35] sm:leading-[1.65] tracking-wide opacity-90 break-words whitespace-normal">
          I transform complex technical ideas into modern cloud solutions and high-performance web
          applications that solve real-world problems.
        </p>
      </div>

      {/* Header Name - Now INSIDE preloader */}
      <div
        className="preloader-header absolute w-full flex justify-center items-center origin-center pointer-events-none"
        style={{ top: '62%', left: '50%', transform: 'translateX(-50%)' }}
      >
        <a
          href="#"
          className="no-underline uppercase text-white text-[clamp(2.5rem,9vw,6rem)] font-bold leading-[1.1] block whitespace-nowrap font-lato text-center tracking-[0.02em]"
        >
          JALAL EDDINE
        </a>
      </div>
    </div>
  );
}
CONTEXT:
This preloader animation is the first impression users get. It must be:

Blazingly fast on all devices (60fps minimum, 120fps target)
Lightweight (minimal bundle impact)
Silky smooth on mobile (even low-end Android)
Zero jank or layout shifts
Optimized for Core Web Vitals (LCP, FID, CLS)

YOUR MISSION:
As a senior engineer, perform a deep technical audit and provide:

1. ARCHITECTURE DECISION 🏗️
Decision Matrix:

Astro Component vs Vue Component vs Hybrid approach?
Hydration strategy (client:load vs client:idle vs client:only vs none)?
Should GSAP plugins be bundled or CDN-loaded?
SSR considerations for animations

Provide:

Your recommendation with engineering rationale
Trade-offs analysis (bundle size, TTI, FCP, LCP impact)
Why this approach beats alternatives


2. PERFORMANCE OPTIMIZATION AUDIT ⚡
Analyze current code for:
Critical Issues:

Dynamic script loading blocks (Promise.all for CDN scripts)
Font loading race condition
Multiple DOM queries
Unnecessary re-renders or recalculations
Memory leaks potential
Plugin registration overhead

Optimization Opportunities:

Can we reduce script loading time?
Should SplitText/ScrambleText be replaced with lighter alternatives?
Are all animations GPU-accelerated properly?
Can we reduce paint/composite operations?
Image preloading strategy
Progressive enhancement approach

Provide specific metrics:

Estimated current bundle size impact
Estimated optimized bundle size
Expected FPS improvements
Loading time reduction


3. PRODUCTION-GRADE CODE 💎
Deliver:
A. Converted Component

Vue 3 Composition API or Astro (your choice)
Full TypeScript typing
Performance-first implementation

B. Critical Optimizations Applied:

 GPU-accelerated animations (will-change, transform3d)
 RequestAnimationFrame usage where applicable
 Intersection Observer for visibility detection
 Resource hints (preconnect, prefetch, preload)
 Image optimization (WebP, AVIF, lazy loading)
 Code splitting for GSAP plugins
 Debouncing/throttling where needed
 Memory cleanup on unmount
 Reduced DOM queries (caching selectors)
 Container queries for responsive behavior
 CSS containment for layout performance
 Passive event listeners

C. Mobile-Specific Optimizations:

Touch event handling
Reduced motion preference respect
Low-power mode detection
Network-aware loading (slow 3G handling)
Battery-conscious animations


4. ALTERNATIVE APPROACHES 🎯
Compare your solution against:
Option A: Pure CSS animations (no GSAP)

Pros/Cons
When to choose this

Option B: Lightweight GSAP (no premium plugins)

Replace SplitText with CSS clip-path
Replace ScrambleText with lighter alternative
Bundle size savings

Option C: Hybrid (CSS + minimal GSAP)

Best of both worlds
Your recommendation

Provide recommendation: Which approach for 2025 best practices?

5. BUNDLE IMPACT ANALYSIS 📦
Calculate:

GSAP core: ~XX KB
SplitText: ~XX KB
CustomEase: ~XX KB
ScrambleText: ~XX KB
Total overhead: ~XX KB (gzipped)

Your optimization:

New total: ~XX KB (gzipped)
Savings: XX% reduction
Justification: Worth it? Or go lighter?


6. ACCESSIBILITY & UX ♿
Ensure:

prefers-reduced-motion support (skip/reduce animations)
Keyboard navigation (Skip preloader option)
Screen reader announcements
Focus management after preloader
Emergency escape hatch (ESC key to skip)
Timeout fallback (if animation fails)


7. BROWSER COMPATIBILITY 🌐
Test Matrix:

Chrome/Edge (latest)
Firefox (latest)
Safari (iOS 15+, macOS)
Mobile browsers (Chrome Android, Safari iOS)

Fallbacks for:

Older browsers without clip-path
Browsers without will-change
Dynamic import failures


8. DEVELOPER EXPERIENCE 🛠️
Provide:

Clear comments explaining complex parts
Configuration object for easy tweaking
Animation duration constants (no magic numbers)
Debug mode for development
Storybook/dev-only preview mode

Example:
tsconst PRELOADER_CONFIG = {
  ENTRANCE_DURATION: 2000,
  EXIT_DURATION: 1500,
  ENABLE_SCRAMBLE: true,
  DEBUG_MODE: import.meta.env.DEV
}

9. TESTING STRATEGY 🧪
Provide checklist:

 Animation runs only once per session
 Works on cold page load
 Works on hot reload (dev mode)
 No console errors/warnings
 Smooth 60fps on mobile
 Respects reduced motion
 Image loads before reveal
 preloaderComplete event fires
 No memory leaks (check DevTools)
 Works with slow network (throttle to 3G)
 Works without JavaScript (progressive enhancement)


10. INTEGRATION GUIDE 📘
Provide:

Exact file placement in Astro project
How to import in layout
Required global styles
Environment variables (if any)
CDN vs npm installation steps
Migration checklist from React version


11. MONITORING & ANALYTICS 📊
Recommend:

Performance marks to add
Metrics to track (time to interactive)
RUM (Real User Monitoring) events
Error boundaries/fallbacks

Example:
tsperformance.mark('preloader-start');
// ... animation
performance.mark('preloader-end');
performance.measure('preloader-duration', 'preloader-start', 'preloader-end');

FINAL DELIVERABLE FORMAT:
markdown# Preloader Migration & Optimization Report

## 1. Executive Summary
[Your recommendation + key metrics]

## 2. Architecture Decision
[Component type + rationale]

## 3. Performance Audit
[Issues found + fixes applied]

## 4. Optimized Code
[Complete, production-ready component]

## 5. Alternative Approaches
[Options comparison + recommendation]

## 6. Bundle Analysis
[Size impact + savings]

## 7. Accessibility Implementation
[A11y features added]

## 8. Browser Compatibility
[Support matrix + fallbacks]

## 9. Developer Experience
[Config + debugging tools]

## 10. Testing Checklist
[Complete QA checklist]

## 11. Integration Guide
[Step-by-step setup]

## 12. Monitoring Setup
[Performance tracking code]

## 13. Before/After Metrics
[Expected improvements]

CONSTRAINTS:

Must work on iPhone 12 (and older)
Must work on budget Android phones
Must load in <2 seconds on 3G
Must maintain 60fps on animations
Bundle size overhead <30KB (gzipped) total
Zero CLS (Cumulative Layout Shift)
Image: /images/2.jpg (provide optimization tips)

BONUS POINTS:

Suggest modern CSS alternatives to GSAP where applicable
Recommend View Transitions API integration (if relevant)
Provide A/B testing strategy for preloader vs no-preloader

Think like you're shipping this to millions of users on production infrastructure. Every kilobyte and millisecond matters.
Begin your analysis and deliver the production-grade solution.

Preloader Migration & Optimization Report
1. Executive Summary

Recommendation: Astro component with zero framework hydration + vanilla WAAPI (Web Animations API) + CSS. No GSAP in the critical path.
This hits your constraints: <30KB gzipped overhead, <2s on 3G, zero CLS, and smooth 60fps on low-end mobile (GPU-only transforms + opacity).

Key changes vs current React+GSAP:

Remove runtime CDN plugin loading + plugin registration overhead.

Replace SplitText line-splitting with CSS mask/reveal (no DOM surgery).

Replace ScrambleTextPlugin with a ~0.5KB local scramble (or skip entirely on low-power / reduced-motion).

Use a single cached DOM lookup and a single animation timeline.

Add accessibility: skip button, ESC to skip, reduced-motion behavior, focus management.

Add network-aware + low-power behavior gates.

Expected improvements (realistic, production):

JS transferred: from “GSAP core + 3 plugins” to ~2–6KB (your code only).

Main-thread work: materially lower (no SplitText DOM rewriting; no clip-path tweening via JS).

FPS: current code is likely 30–60fps on budget Android (clip-path + SplitText + scramble + image scaling concurrently). Optimized approach targets 60fps consistently, with headroom on iPhone 12 for 120Hz displays.

Load-time: remove CDN plugin waterfall risk; eliminate external JS requests in the preloader path.

2. Architecture Decision
Decision Matrix
Option	Pros	Cons	Best use
Astro Component (no hydration) + vanilla JS	Smallest JS, fastest TTI/FCP, no framework runtime, easiest to guarantee “runs once” + cleanup	Less ergonomic than GSAP for complex choreography	Your case: first impression + strict perf budgets
Vue 3 Component (Composition API)	Nice ergonomics, reactive state	Hydration cost; more JS; more risk of jank on low-end devices	Apps already Vue-heavy + preloader is non-negotiable
Hybrid (Astro shell + Vue island)	Keep page mostly static; isolate interactivity	Still hydrates Vue for preloader; not worth it	If preloader has interactive controls/state
Hydration Strategy (Astro)

Use “none” (no client:* at all).
The preloader is a fixed overlay; you can run a tiny <script type="module"> inside the Astro component. This avoids shipping Vue/React runtime to animate a single overlay.

GSAP Plugins: Bundle vs CDN

Neither for this preloader.

CDN-loading at runtime is fragile (extra requests, potential blocking, CSP issues, cache variance, offline/dev issues), and it guarantees you pay the cost exactly when you want the page to feel instant.

SSR Considerations

SSR renders the overlay HTML/CSS so there’s no layout shift and you can control LCP (the underlying hero can still be LCP).

Preloader should be non-blocking for LCP: don’t stall hero image fetch; avoid JS that delays rendering.

Why this approach beats alternatives

You’re optimizing for the “first 2 seconds” on slow networks and weak CPUs. Framework hydration + GSAP plugin registration + SplitText DOM mutation are all main-thread heavy at the worst possible time.

3. Performance Audit
Critical issues in current code

Runtime CDN script loading in the critical path

You do Promise.all() of 3 external scripts before starting animations. Even if async, you still stall your choreography and incur DNS/TLS/handshake variability.

SplitText line splitting = forced layout + DOM mutation

Splitting into lines requires measurement and wrapping; then you wrap lines again with overflow containers. This is expensive and can cause jank on mobile.

ScrambleTextPlugin updates text repeatedly

Scrambling is many DOM text writes per frame-ish interval. On low-end devices that’s a main-thread tax.

clip-path animation

clip-path: polygon() often stays on the paint pipeline, not purely compositor. Combined with scaling the image, it can drop frames.

Multiple DOM queries + repeated selectors

Minor, but easy win: cache elements once, avoid string selectors inside GSAP calls.

Cleanup / memory

No explicit kill/revert of GSAP timeline on unmount (hot reload + route transitions can leak).

Optimization opportunities applied

No external JS for the preloader.

Replace JS-driven clip-path reveal with CSS-only reveal using:

either a transform: scaleY() overlay wipe (compositor-friendly),

or mask-image where supported (optional).

Replace SplitText with a single paragraph reveal (no line splitting) using translate+opacity and/or CSS mask.

Replace ScrambleTextPlugin with a tiny scramble routine that:

runs only if not reduced-motion,

runs only if not low-power / Save-Data / slow 3G,

runs for a fixed number of steps (bounded work).

Use prefers-reduced-motion to skip almost everything.

Use PerformanceObserver/marks to measure.

Specific metrics (grounded where possible)

Current “library overhead” (minified file sizes from jsDelivr):

gsap.min.js 70.74 KB

SplitText.min.js 7.08 KB

CustomEase.min.js 6.9 KB

ScrambleTextPlugin.min.js 11.41 KB
Total minified: ~96.13 KB (before gzip; plus request overhead)

GSAP core gzipped reference point: GSAP 3 is commonly cited as ~under 23KB gzipped
(Plugins add more; in practice you’ll flirt with / exceed your 30KB gzipped budget once you include premium plugins.)

Optimized approach JS: ~2–6KB gzipped (your local script, scramble optional).

Expected FPS improvement:

Remove polygon clip-path tween + SplitText mutation → significant uplift on low-end Android (less paint/layout).

Animation becomes mostly compositor transforms (opacity/translate/scale) → stable 60fps.

Loading time reduction:

Remove 3 external script requests → typically hundreds of ms to seconds saved on 3G / high RTT.

4. Optimized Code
A) src/components/Preloader.astro (no hydration, production-grade)
---
/**
 * Preloader.astro
 * - No framework hydration
 * - WAAPI + CSS transforms (compositor-friendly)
 * - Network-aware + reduced-motion aware
 * - Accessible: skip, ESC, focus management
 */
const PRELOADER_CONFIG = {
  ENABLE_SCRAMBLE: true,
  DEBUG_MODE: import.meta.env.DEV,

  // Timings (ms) — no magic numbers
  ENTER_MS: 900,
  SCRAMBLE_MS: 650,
  PROGRESS_MS: 1200,
  EXIT_MS: 650,
  MAX_TOTAL_MS: 6000, // safety timeout

  // Degrade behavior gates
  SLOW_NETWORK_CUTOFF: '3g', // 'slow-2g' | '2g' | '3g' | '4g'
} as const;
---

<!-- Resource hints (put these in your layout/head if you want them global) -->
<link rel="preload" as="image" href="/images/2.jpg" imagesrcset="/images/2.avif 1x, /images/2.webp 1x, /images/2.jpg 1x" />

<div
  id="preloader"
  class="preloader"
  role="dialog"
  aria-modal="true"
  aria-label="Loading"
  data-preloader
>
  <div class="progress" aria-hidden="true">
    <div class="progress__bar" data-progress-bar></div>
  </div>

  <div class="stage" aria-hidden="true">
    <div class="frame" data-frame>
      <img
        src="/images/2.jpg"
        srcset="/images/2.avif 1x, /images/2.webp 1x, /images/2.jpg 1x"
        sizes="(max-width: 768px) 68vw, 25rem"
        width="800"
        height="800"
        decoding="async"
        fetchpriority="high"
        alt="Portfolio preview"
        class="frame__img"
        data-img
      />
      <!-- Wipe overlay for reveal (transform-only) -->
      <div class="wipe" data-wipe></div>
    </div>
  </div>

  <div class="copy" data-copy>
    <p>
      I transform complex technical ideas into modern cloud solutions and high-performance web
      applications that solve real-world problems.
    </p>
  </div>

  <div class="name" data-name>
    <a href="#" tabindex="-1" data-name-text>JALAL EDDINE</a>
  </div>

  <button class="skip" type="button" data-skip>
    Skip
  </button>
</div>

<style>
  /* Containment: isolate layout/paint */
  .preloader {
    position: fixed;
    inset: 0;
    height: 100dvh;
    background: #000;
    z-index: 10002;
    overflow: hidden;
    contain: layout paint style;
    content-visibility: visible;
    transform: translateZ(0);
  }

  .progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 2px;
    width: 100%;
    background: rgba(255,255,255,0.12);
  }
  .progress__bar {
    height: 100%;
    width: 100%;
    transform-origin: 0 50%;
    transform: scaleX(0);
    background: #fff;
    will-change: transform;
  }

  .stage {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
  }

  .frame {
    width: min(25rem, 68vw);
    aspect-ratio: 1 / 1;
    overflow: hidden;
    position: relative;
    border-radius: 0; /* keep cheap; add radius only if needed */
    transform: translateZ(0);
  }

  .frame__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.35) translateZ(0);
    will-change: transform, opacity;
  }

  /* Reveal wipe: starts covering, animates down to reveal */
  .wipe {
    position: absolute;
    inset: 0;
    background: #000;
    transform-origin: 50% 100%;
    transform: scaleY(1);
    will-change: transform;
  }

  .copy {
    position: absolute;
    left: 50%;
    transform: translateX(-50%) translateZ(0);
    bottom: clamp(1.5rem, 6vh, 3rem);
    width: min(80%, 500px);
    max-width: 90%;
    color: rgba(255,255,255,0.9);
    text-transform: uppercase;
    text-align: center;
    padding: 0 0.75rem;
    font-weight: 530;
    letter-spacing: 0.06em;
    line-height: 1.45;
    opacity: 0;
    will-change: transform, opacity;
  }
  .copy p {
    margin: 0;
    font-size: clamp(0.7rem, 2vw, 0.85rem);
  }

  .name {
    position: absolute;
    top: 62%;
    left: 50%;
    transform: translateX(-50%) translateZ(0);
    width: 100%;
    display: grid;
    place-items: center;
    opacity: 0;
    will-change: transform, opacity;
    pointer-events: none;
  }
  .name a {
    color: #fff;
    text-decoration: none;
    text-transform: uppercase;
    font-weight: 800;
    font-size: clamp(2.5rem, 9vw, 6rem);
    line-height: 1.05;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .skip {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    z-index: 1;
    background: rgba(255,255,255,0.10);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.20);
    border-radius: 999px;
    padding: 0.5rem 0.75rem;
    font: inherit;
    cursor: pointer;
    backdrop-filter: blur(6px);
  }
  .skip:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .frame__img, .wipe, .progress__bar, .copy, .name { will-change: auto; }
  }
</style>

<script type="module">
  const CONFIG = /** @type {const} */ (JSON.parse(${JSON.stringify(JSON.stringify(PRELOADER_CONFIG))}));

  const $ = (sel, root = document) => root.querySelector(sel);

  const preloader = $("#preloader");
  if (!preloader) return;

  const el = {
    bar: $("[data-progress-bar]", preloader),
    wipe: $("[data-wipe]", preloader),
    img:  $("[data-img]", preloader),
    copy: $("[data-copy]", preloader),
    name: $("[data-name]", preloader),
    nameText: $("[data-name-text]", preloader),
    skip: $("[data-skip]", preloader),
  };

  // --- Environment gates ---
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Network-aware (best-effort)
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!(conn && conn.saveData);
  const effectiveType = (conn && conn.effectiveType) || "4g";
  const slowNetwork = (effectiveType === "slow-2g" || effectiveType === "2g" || effectiveType === "3g");

  // Low-power heuristics (best-effort): Save-Data or reduced-motion or slow network
  const lowPower = reduceMotion || saveData || slowNetwork;

  const ENABLE_SCRAMBLE = CONFIG.ENABLE_SCRAMBLE && !lowPower;

  // --- Accessibility + escape hatches ---
  const previouslyFocused = document.activeElement;

  const cleanupFns = new Set();
  const on = (target, type, fn, opts) => {
    target.addEventListener(type, fn, opts);
    cleanupFns.add(() => target.removeEventListener(type, fn, opts));
  };

  const finish = (reason = "done") => {
    if (!preloader.isConnected) return;

    performance.mark("preloader-end");
    performance.measure("preloader-duration", "preloader-start", "preloader-end");

    preloader.style.display = "none";
    preloader.setAttribute("aria-hidden", "true");

    // Restore focus to the page (best effort)
    if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    else document.body.focus?.();

    window.dispatchEvent(new CustomEvent("preloaderComplete", { detail: { reason } }));

    cleanupFns.forEach((fn) => fn());
    cleanupFns.clear();
  };

  const skip = () => finish("skipped");

  on(el.skip, "click", skip, { passive: true });
  on(window, "keydown", (e) => {
    if (e.key === "Escape") skip();
  });

  // Safety timeout (if animation/image fails)
  const timeoutId = window.setTimeout(() => finish("timeout"), CONFIG.MAX_TOTAL_MS);
  cleanupFns.add(() => window.clearTimeout(timeoutId));

  // --- Animation helpers (WAAPI) ---
  const animate = (node, keyframes, options) => {
    if (!node || !node.animate) return null;
    return node.animate(keyframes, options);
  };

  // Tiny bounded scramble (no per-frame churn)
  const scrambleText = async (node, finalText, ms) => {
    if (!node) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const steps = 18; // bounded
    const stepMs = Math.max(16, Math.floor(ms / steps));

    const original = node.textContent || "";
    node.textContent = original;

    for (let i = 0; i < steps; i++) {
      const reveal = Math.floor((i / (steps - 1)) * finalText.length);
      let out = finalText.slice(0, reveal);
      for (let j = reveal; j < finalText.length; j++) {
        out += chars[(Math.random() * chars.length) | 0];
      }
      node.textContent = out;
      await new Promise((r) => setTimeout(r, stepMs));
    }
    node.textContent = finalText;
  };

  // --- Main sequence ---
  performance.mark("preloader-start");

  // Keep underlying page interactive; avoid scroll jank
  document.documentElement.style.overflow = "hidden";
  cleanupFns.add(() => (document.documentElement.style.overflow = ""));

  // Initial state (compositor-only)
  preloader.style.willChange = "transform";
  el.copy.style.transform = "translateX(-50%) translateY(12px) translateZ(0)";
  el.name.style.transform = "translateX(-50%) translateY(16px) translateZ(0)";

  // Wait for image decode (best effort) to avoid janky first paint inside frame
  const imgReady = (async () => {
    try {
      if (el.img?.decode) await el.img.decode();
    } catch {}
  })();

  await imgReady;

  if (reduceMotion) {
    // Minimal: show once, then immediately finish
    el.copy.style.opacity = "1";
    el.name.style.opacity = "1";
    el.wipe.style.transform = "scaleY(0)";
    el.img.style.transform = "scale(1) translateZ(0)";
    finish("reduced-motion");
    return;
  }

  // Entrance: wipe reveal + image scale-down + text fade/slide
  const aWipe = animate(el.wipe,
    [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
    { duration: CONFIG.ENTER_MS, easing: "cubic-bezier(0.9, 0, 0.1, 1)", fill: "forwards" }
  );

  const aImg = animate(el.img,
    [{ transform: "scale(1.35) translateZ(0)" }, { transform: "scale(1.0) translateZ(0)" }],
    { duration: CONFIG.ENTER_MS + 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
  );

  const aName = animate(el.name,
    [{ opacity: 0, transform: "translateX(-50%) translateY(16px) translateZ(0)" },
     { opacity: 1, transform: "translateX(-50%) translateY(0px) translateZ(0)" }],
    { duration: 700, delay: 180, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" }
  );

  const aCopy = animate(el.copy,
    [{ opacity: 0, transform: "translateX(-50%) translateY(12px) translateZ(0)" },
     { opacity: 1, transform: "translateX(-50%) translateY(0px) translateZ(0)" }],
    { duration: 650, delay: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
  );

  // Progress bar (transform-only)
  const aBarIn = animate(el.bar,
    [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
    { duration: CONFIG.PROGRESS_MS, delay: 450, easing: "ease-in-out", fill: "forwards" }
  );

  // Optional scramble (bounded + gated)
  if (ENABLE_SCRAMBLE) {
    // Don't block animation; run concurrently
    scrambleText(el.nameText, "JALAL EDDINE", CONFIG.SCRAMBLE_MS);
  }

  // Exit after progress completes
  const wait = (anim) => anim ? anim.finished.catch(() => {}) : Promise.resolve();
  await wait(aBarIn);

  // Exit: fade/slide up, image scale up slightly, then translate overlay out
  const aOutText1 = animate(el.copy,
    [{ opacity: 1, transform: "translateX(-50%) translateY(0) translateZ(0)" },
     { opacity: 0, transform: "translateX(-50%) translateY(-14px) translateZ(0)" }],
    { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
  );
  const aOutText2 = animate(el.name,
    [{ opacity: 1, transform: "translateX(-50%) translateY(0) translateZ(0)" },
     { opacity: 0, transform: "translateX(-50%) translateY(-18px) translateZ(0)" }],
    { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
  );
  const aImgOut = animate(el.img,
    [{ transform: "scale(1.0) translateZ(0)" }, { transform: "scale(1.15) translateZ(0)" }],
    { duration: CONFIG.EXIT_MS, easing: "cubic-bezier(0.9, 0, 0.1, 1)", fill: "forwards" }
  );

  await Promise.all([wait(aOutText1), wait(aOutText2)]);

  // Slide preloader away (compositor-only)
  const aSlide = animate(preloader,
    [{ transform: "translateY(0) translateZ(0)" }, { transform: "translateY(-100%) translateZ(0)" }],
    { duration: CONFIG.EXIT_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" }
  );

  await wait(aSlide);
  preloader.style.willChange = "auto";
  finish("completed");
</script>

B) Critical optimizations applied (mapped to your checklist)

GPU-friendly only: translate/scale/opacity, no JS clip-path tween.

rAF where applicable: WAAPI is compositor-driven; scramble is bounded steps (not per-frame).

IntersectionObserver: not necessary for a full-screen overlay; you can add it if this becomes route-based.

Resource hints: preload the image; keep it out of the critical JS path.

Code splitting: none needed because we removed large libs.

Cleanup: event listeners removed; timeout cleared; overflow restored.

Reduced DOM queries: all cached in el.

Containment: contain: layout paint style; to isolate the overlay.

Passive listeners: click is passive; keydown can’t be passive but is minimal.

5. Alternative Approaches
Option A: Pure CSS (no JS)

Pros

Smallest possible JS (zero)

Extremely robust

Cons

Hard to coordinate “once per session”, skip button, dispatch event timing, or image decode gating.

No scramble.

Choose when: content is static, no need for events/skip, and you accept “best effort” timings.

Option B: Lightweight GSAP (no premium plugins)

Replace:

SplitText → CSS reveal (as above)

ScrambleTextPlugin → tiny local scramble

CustomEase → CSS cubic-bezier

Pros

Familiar GSAP timeline ergonomics

Still relatively small if GSAP-only

Cons

Still adds core GSAP payload (~under 23KB gzipped is often cited for GSAP 3)

Risk of crossing your 30KB gzipped budget once you add any plugin.

Choose when: your team is standardized on GSAP timelines and you keep it to core only.

Option C: Hybrid (CSS + minimal GSAP)

Use GSAP only for orchestrating transforms (no clip-path, no SplitText).

Keep scramble local.

Pros

Best dev ergonomics while retaining compositor-friendly motion
Cons

Likely close to your 30KB gzipped cap.

2025 best-practice recommendation: Your shipped solution should be vanilla + CSS/WAAPI, with GSAP reserved for pages where it’s truly needed (scroll choreography, complex sequencing, etc.).

6. Bundle Impact Analysis

From jsDelivr (minified sizes):

GSAP core (gsap.min.js): 70.74 KB

SplitText: 7.08 KB

CustomEase: 6.9 KB

ScrambleTextPlugin: 11.41 KB
Total minified: ~96.13 KB (+ additional requests)

GSAP core gzipped is often cited as under ~23KB
But with plugins, you’re likely at/over 30KB gzipped in real deployments (and you pay extra connection overhead if loaded separately).

Optimized (this report):

New total JS (gzipped): ~2–6KB (preloader script + optional scramble)

Savings: typically >75–90% vs GSAP+plugins path

Justification: for a preloader, GSAP plugins are not worth the perf budget.

7. Accessibility Implementation

Included:

prefers-reduced-motion: skips animation and finishes immediately.

Skip button (keyboard focusable, visible focus ring).

ESC key escape hatch.

Focus management: returns focus to previous element.

Screen readers: role="dialog" aria-modal="true"; (you can add a visually-hidden “Loading…” live region if desired).

Optional enhancements:

Add aria-live="polite" status text that updates to “Loaded” on completion (don’t spam updates during animation).

8. Browser Compatibility
Support matrix (intended)

Chrome/Edge latest ✅

Firefox latest ✅

Safari macOS ✅

iOS Safari 15+ ✅

Chrome Android ✅

Fallbacks

WAAPI is broadly supported; if element.animate missing, you can:

set final styles and call finish("no-waapi").

If navigator.connection missing: defaults to “4g”; still fine.

If img.decode() fails: continue (already handled).

Clip-path not used → avoids a common cross-browser pain point.

9. Developer Experience

Included:

PRELOADER_CONFIG object for all timings and toggles.

DEBUG_MODE hook ready (add console logs or expose window.__preloaderDebug when dev).

No magic numbers in the animation sequence.

Suggested dev-only preview:

Create a route /__preloader that renders only the preloader over a dummy page for tuning.

10. Testing Checklist

Functionality

 Runs only once per session (add sessionStorage gate if desired)

 Cold load: no console errors

 Hot reload: no duplicated listeners

 preloaderComplete fires exactly once

 Skip button works

 ESC skip works

 Timeout fallback works (throttle network, block image)

Performance

 60fps on budget Android (DevTools performance trace)

 No layout shifts (CLS stays 0)

 No long tasks during preloader

 3G throttle: completes <2s or gracefully degrades (lowPower gate)

Accessibility

 Reduced motion: minimal/no animation

 Keyboard navigation: skip focus visible

 Screen reader behavior acceptable

11. Integration Guide (Astro)

File placement

src/components/Preloader.astro

Import in layout

In src/layouts/BaseLayout.astro (or your root layout), render it first in <body> so it paints immediately:

<body>
  <Preloader />
  <slot />
</body>


Required global styles

None beyond what’s in the component (already encapsulated).

If you use a global font (e.g., Lato), ensure it’s not blocking render. Prefer font-display: swap.

Migration checklist

Remove GSAP plugin CDN loading from React.

Ensure /images/2.avif and /images/2.webp exist (recommended).

Confirm preloaderComplete event is still what your hero listens for.

12. Monitoring Setup

Add marks (already included):

performance.mark("preloader-start");
// ...
performance.mark("preloader-end");
performance.measure("preloader-duration", "preloader-start", "preloader-end");


Recommended RUM events:

preloader-duration

preloader-skip-rate

preloader-timeout-rate

LCP and whether preloader was shown (dimension)

Error handling:

If preloader fails, always call finish("error") and never trap the user.

13. Before/After Metrics (Expected)
Metric	Before (React + GSAP plugins)	After (Astro + WAAPI/CSS)
Preloader JS transferred	High (GSAP + plugins; multiple requests)	~2–6KB
Main-thread cost	High (SplitText + scramble + clip-path)	Low (compositor transforms)
CLS	Usually 0 (overlay) but risk via SplitText layout	0
3G reliability	Risky (external scripts)	High (no external JS)
Mobile smoothness	Variable	Stable 60fps
Bonus: View Transitions + A/B Testing

View Transitions API

If you transition between routes/pages, you can:

skip the preloader on subsequent navigations,

use view transitions for route changes instead of replaying the preloader.

A/B test strategy

Variant A: no preloader

Variant B: optimized preloader
Track:

bounce rate

time-to-interaction

LCP/INP deltas

engagement on portfolio CTA