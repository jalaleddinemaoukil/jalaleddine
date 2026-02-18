<template>
  <!-- OUTER provides scroll distance -->
  <section class="repetition-outer" ref="outerRef">
    <!-- INNER is what gets pinned -->
    <div class="repetition" ref="sectionRef">

      <div class="repetition-stage">

        <!-- Top Paragraph -->
        <p class="rep-intro">
          {{ paragraph }}
        </p>

        <!-- Animated Heading -->
        <div class="rep-block" ref="blockRef">
          <!-- Ghost used for height measurement -->
          <span class="rep-ghost" ref="ghostRef">
            {{ heading1 }} {{ heading2 }}
          </span>

          <div
            v-for="(_, i) in STRIPS"
            :key="i"
            class="rep-strip"
            :ref="el => stripRefs[i] = el"
          >
            <div class="rep-strip__inner">
              <span class="rep-text">
                {{ heading1 }} {{ heading2 }}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  heading1: { type: String, default: 'Built to be' },
  heading2: { type: String, default: 'Remembered.' },
  paragraph: {
    type: String,
    default:
      'I work with founders and studios who refuse to settle for average. Every project starts with a question: what will make someone stop scrolling? The answer is never a template.'
  }
})

const STRIPS = 10
const UNIT = 55 // dramatic spread like original demo

const outerRef = ref(null)
const sectionRef = ref(null)
const blockRef = ref(null)
const ghostRef = ref(null)

const stripRefs = []

let ctx

onMounted(async () => {
  await nextTick()

  const ghost = ghostRef.value
  const strips = stripRefs

  if (!ghost || !strips.length) return

  const blockHeight = ghost.getBoundingClientRect().height
  const stripHeight = blockHeight / STRIPS

  // Set up strips
  strips.forEach((strip, i) => {
    gsap.set(strip, {
      position: 'absolute',
      top: i * stripHeight,
      height: stripHeight,
      width: '100%',
      overflow: 'hidden'
    })

    const inner = strip.querySelector('.rep-strip__inner')

    gsap.set(inner, {
      y: -i * stripHeight,
      height: blockHeight,
      display: 'flex',
      alignItems: 'center'
    })
  })

  const center = (STRIPS - 1) / 2

  ctx = gsap.context(() => {

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: outerRef.value,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        pin: sectionRef.value,
        anticipatePin: 1
      }
    })

    strips.forEach((strip, i) => {
      const dist = i - center

      tl.to(strip, {
        y: dist * UNIT,
        ease: 'none'
      }, 0)
    })

  }, outerRef.value)

  ScrollTrigger.refresh()
})

onBeforeUnmount(() => {
  ctx?.revert()
  ScrollTrigger.getAll().forEach(t => t.kill())
})
</script>

<style scoped>

/* OUTER — creates scroll distance */
.repetition-outer {
  position: relative;
  height: 260vh; /* enough room to scrub */
  background: #000;
}

/* INNER — pinned content */
.repetition {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background: #000;

  display: grid;
  place-items: center;
}

/* Swiss-inspired centered stage */
.repetition-stage {
  width: min(1400px, 92vw);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2rem, 5vw, 6rem);
}

/* Intro paragraph */
.rep-intro {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(0.8rem, 1vw, 0.95rem);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.55;
  margin: 0;
}

/* Heading block */
.rep-block {
  position: relative;
}

/* Invisible measuring text */
.rep-ghost {
  visibility: hidden;
  display: block;
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  line-height: 0.88;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  font-size: clamp(4rem, 13vw, 16rem);
  white-space: nowrap;
}

/* Strips */
.rep-strip {
  background: #000;
  will-change: transform;
}

.rep-strip__inner {
  will-change: transform;
}

.rep-text {
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  line-height: 0.88;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  font-size: clamp(4rem, 13vw, 16rem);
  color: #fff;
  white-space: nowrap;
  user-select: none;
}

/* Responsive */
@media (max-width: 768px) {

  .repetition-outer {
    height: 220vh;
  }

  .rep-ghost,
  .rep-text {
    white-space: normal;
    word-break: break-word;
    font-size: clamp(3rem, 16vw, 6rem);
  }

  .rep-strip__inner {
    align-items: flex-start;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .rep-strip {
    transform: none !important;
  }
}

</style>
