<template>
  <section id="work" class="work" ref="sectionRef" @pointerleave="handleSectionPointerLeave">
    <div class="work__top">
      <h2 class="work__heading">Featured Work</h2>
    </div>

    <nav class="work__list">
      <a
        v-for="(item, idx) in items"
        :key="item._id || item.title"
        class="work__item"
        :class="{
          'is-hovered': hoveredIndex === idx,
          'is-dimmed': hoveredIndex !== -1 && hoveredIndex !== idx
        }"
        :href="item.href"
        @click="handleItemClick(item.href, $event)"
        @pointerenter="handleItemPointerEnter(idx, item, $event)"
        @pointermove="handlePointerMove"
      >
        <!-- Order number -->
        <div class="work__item-client">
          <div class="slide-inner">
            <span class="slide-text slide-text--a">({{ formatOrder(idx) }})</span>
            <span class="slide-text slide-text--b">({{ formatOrder(idx) }})</span>
          </div>
        </div>

        <div class="work__item-title-wrap">
          <div class="work__item-title-inner">
            <span class="work__item-title work__item-title--a">{{ item.title }}</span>
            <span class="work__item-title work__item-title--b">{{ item.title }}</span>
          </div>
        </div>

        <!-- Desktop CTA -->
        <div class="work__item-cta work__item-cta--desktop">
          <div class="slide-inner">
            <span class="slide-text slide-text--a">View Live</span>
            <span class="slide-text slide-text--b">View Live</span>
          </div>
        </div>

        <!-- Mobile thumbnail -->
        <div
          class="work__item-thumb"
          :style="{ backgroundImage: `url(${item.bg || item.image})` }"
          aria-hidden="true"
        />
      </a>
    </nav>

    <div
      class="hover-reveal"
      ref="revealRef"
      :class="{ 'is-visible': isRevealVisible && activePreviewBg }"
      aria-hidden="true"
    >
      <div class="hover-reveal__inner">
        <div
          class="hover-reveal__img"
          :style="{ backgroundImage: `url(${activePreviewBg})` }"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const router = useRouter()
const items = computed(() => props.items || [])

const sectionRef    = ref(null)
const hoveredIndex  = ref(-1)
const revealRef     = ref(null)
const isRevealVisible = ref(false)
const activePreviewBg = ref('')

const canUseHoverPreview = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches

/* ==========================================================
   PHYSICS SYSTEM
   – lerp 0.08 → 0.13 (less drag, tighter tracking)
   – offsets applied in ONE place only (updateMouse)
   – rAF loop runs continuously while visible to avoid
     restart-stutter on fast mouse re-entries
========================================================== */

const OFFSET_X = 24
const OFFSET_Y = -140
const LERP     = 0.13

let mouse   = { x: 0, y: 0 }
let current = { x: 0, y: 0 }
let prev    = { x: 0, y: 0 }
let rafId   = null
let looping = false

// Single source of truth for offset so enter & move stay in sync
function updateMouse(clientX, clientY) {
  mouse.x = clientX + OFFSET_X
  mouse.y = clientY + OFFSET_Y
}

function startLoop() {
  if (looping) return
  looping = true
  rafId = requestAnimationFrame(loop)
}

function stopLoop() {
  looping = false
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function loop() {
  if (!looping) return

  const el = revealRef.value
  if (el && isRevealVisible.value) {
    prev.x = current.x
    prev.y = current.y

    current.x += (mouse.x - current.x) * LERP
    current.y += (mouse.y - current.y) * LERP

    const dx     = current.x - prev.x
    const rotate = dx * 0.12
    const speed  = Math.sqrt(dx * dx + (current.y - prev.y) ** 2)
    const scaleX = 1 + Math.min(speed * 0.003, 0.06)
    const scaleY = 1 - Math.min(speed * 0.002, 0.04)

    el.style.transform =
      `translate3d(${current.x}px, ${current.y}px, 0) ` +
      `rotate(${rotate}deg) ` +
      `scale(${scaleX}, ${scaleY})`
  }

  rafId = requestAnimationFrame(loop)
}

/* ==========================================================
   EVENT HANDLERS
========================================================== */

function handlePointerMove(e) {
  if (!canUseHoverPreview()) return
  updateMouse(e.clientX, e.clientY)
}

function handleItemPointerEnter(index, item, e) {
  if (!canUseHoverPreview()) return

  hoveredIndex.value = index
  const imageUrl = item?.bg || item?.image || ''
  if (!imageUrl) return

  // Snap current position to match mouse immediately — no jump
  updateMouse(e.clientX, e.clientY)
  current.x = mouse.x
  current.y = mouse.y
  prev.x    = mouse.x
  prev.y    = mouse.y

  activePreviewBg.value = imageUrl
  isRevealVisible.value  = true

  startLoop()
}

function handleItemPointerLeave() {
  hoveredIndex.value    = -1
  isRevealVisible.value = false
  stopLoop()
}

function handleSectionPointerLeave() {
  handleItemPointerLeave()
}

function handleViewportScroll() {
  if (isRevealVisible.value) handleItemPointerLeave()
}

function handleItemClick(href, e) {
  if (!href?.startsWith('/')) return
  e.preventDefault()
  router.push(href)
}

const formatOrder = i => String(i + 1).padStart(2, '0')

/* ==========================================================
   LIFECYCLE
========================================================== */

onMounted(() => {
  if (!canUseHoverPreview()) return

  window.addEventListener('scroll',    handleViewportScroll, { passive: true })
  window.addEventListener('wheel',     handleViewportScroll, { passive: true })
  window.addEventListener('touchmove', handleViewportScroll, { passive: true })

  // Preload first 6 images on idle
  const preload = () => {
    items.value
      .map(item => item?.bg || item?.image)
      .filter(Boolean)
      .slice(0, 6)
      .forEach(url => {
        const img = new Image()
        img.decoding = 'async'
        img.src = url
      })
  }

  'requestIdleCallback' in window
    ? window.requestIdleCallback(preload, { timeout: 1200 })
    : setTimeout(preload, 250)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll',    handleViewportScroll)
  window.removeEventListener('wheel',     handleViewportScroll)
  window.removeEventListener('touchmove', handleViewportScroll)
  stopLoop()
})
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ==========================================================
   SECTION
========================================================== */

.work {
  position: relative;
  z-index: 1;
  background: #000;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: clamp(64px, 7vw, 100px) clamp(32px, 4vw, 64px);
}

/* ==========================================================
   HEADER
========================================================== */

.work__top {
  position: relative;
  z-index: 3;
  margin-bottom: clamp(40px, 5vw, 80px);
}

.work__heading {
  font-size: clamp(3rem, 6vw, 6rem);
  font-weight: 800;
  text-transform: uppercase;
  line-height: 1;
}

/* ==========================================================
   LIST
========================================================== */

.work__list {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

/* ==========================================================
   ROW
========================================================== */

.work__item {
  display: flex;
  align-items: center;
  padding: clamp(32px, 4vw, 56px) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  text-decoration: none;
  color: #fff;
  position: relative;
}

/* ==========================================================
   ORDER NUMBER
========================================================== */

.work__item-client {
  position: relative;
  z-index: 4;
  width: clamp(90px, 10vw, 160px);
  font-size: clamp(12px, 1vw, 15px);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

/* ==========================================================
   TITLE
========================================================== */

.work__item-title-wrap {
  position: relative;
  z-index: 4;
  flex: 1;
  display: flex;
  justify-content: center;
}

.work__item-title-inner {
  position: relative;
  display: inline-grid;
  overflow: hidden;
  padding: 0.18em 0;
}

.work__item-title {
  grid-area: 1 / 1;
  font-size: clamp(32px, 5.5vw, 84px);
  font-weight: 800;
  line-height: 1.15;
  padding: 0.12em 0;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.work__item-title--a { transform: translateY(0%); }
.work__item-title--b { transform: translateY(100%); }

.work__item:hover .work__item-title--a { transform: translateY(-100%); }
.work__item:hover .work__item-title--b { transform: translateY(0%); }

/* ==========================================================
   CTA
========================================================== */

.work__item-cta {
  position: relative;
  z-index: 4;
  width: clamp(120px, 12vw, 200px);
  display: flex;
  justify-content: flex-end;
}

/* ==========================================================
   HOVER REVEAL
   – No clip-path animation (triggers paint every frame)
   – Reveal/hide via opacity + scale only (compositor-only)
   – will-change limited to transform + opacity
========================================================== */

.hover-reveal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;

  width: clamp(180px, 14vw, 260px);
  aspect-ratio: 16 / 10;

  pointer-events: none;
  border-radius: 12px;
  overflow: hidden;

  opacity: 0;
  /* scale(0.92) when hidden → scale(1) when visible, no clip-path */
  transform: translate3d(0, 0, 0) scale(0.92);
  transition:
    opacity 0.18s ease,
    transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);

  will-change: transform, opacity;
  backface-visibility: hidden;
  contain: layout paint style;
}

.hover-reveal.is-visible {
  opacity: 1;
  /* JS overrides transform; this baseline just ensures it's visible */
  transform: translate3d(0, 0, 0) scale(1);
}

.hover-reveal__inner {
  width: 100%;
  height: 100%;
}

.hover-reveal__img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center center;
  /* Subtle inner scale for depth — CSS only, no JS needed */
  transform: scale(1.04);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
  contain: layout paint style;
}

.hover-reveal.is-visible .hover-reveal__img {
  transform: scale(1);
}

/* ==========================================================
   SLIDE TEXT
========================================================== */

.slide-inner {
  position: relative;
  display: inline-grid;
  overflow: hidden;
}

.slide-text {
  grid-area: 1 / 1;
  display: block;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.slide-text--a { transform: translateY(0%); }
.slide-text--b { transform: translateY(100%); }

.work__item:hover .slide-text--a { transform: translateY(-100%); }
.work__item:hover .slide-text--b { transform: translateY(0%); }

/* ==========================================================
   MOBILE THUMBNAIL
   Shown on touch devices in place of the hover-reveal
========================================================== */

.work__item-thumb {
  display: none; /* hidden on desktop */
  width: clamp(64px, 18vw, 96px);
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  overflow: hidden;
  opacity: 0.85;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

/* ==========================================================
   REDUCED MOTION
========================================================== */

@media (prefers-reduced-motion: reduce) {
  .hover-reveal {
    transition: opacity 0.12s ease;
    transform: translate3d(0, 0, 0) scale(1);
  }
  .hover-reveal__img {
    transition: none;
    transform: none;
  }
}

/* ==========================================================
   MOBILE — swap hover-reveal for inline thumbnail
========================================================== */

@media (hover: none), (pointer: coarse) {
  /* Show thumbnail, hide desktop CTA */
  .work__item-thumb        { display: block; }
  .work__item-cta--desktop { display: none; }

  /* Tighten row padding on small screens */
  .work__item {
    padding: clamp(20px, 5vw, 36px) 0;
    gap: 12px;
  }

  /* Shrink order number column */
  .work__item-client {
    width: clamp(36px, 8vw, 56px);
  }

  /* Slight dim → full opacity on active (tap feedback) */
  .work__item:active .work__item-thumb {
    opacity: 1;
    transform: scale(0.97);
  }

  /* Hover-reveal panel is never shown on touch */
  .hover-reveal { display: none; }
}
</style>