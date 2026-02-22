<template>
  <section class="hero" ref="heroRef" :style="heroStyleVars">
    <div class="noise" aria-hidden="true"></div>

    <div class="hero__type" ref="typeBlock" aria-label="hero-heading">
      <div v-if="hasLineOne" class="line line--1">
        <span class="word-wrap"><span class="word word--line" ref="wordsL1">{{ normalizedLineOne }}</span></span>
      </div>

      <div v-if="hasLineTwo" class="line line--2">
        <span class="word-wrap"><span class="word word--line" ref="wordsL2">{{ normalizedLineTwo }}</span></span>
      </div>

      <div class="line line--3" aria-hidden="true">
        <span class="line3-side line3-side--left">
          <span v-if="lineThreeMark" class="line3-mark">{{ lineThreeMark }}</span>
        </span>

        <div class="line3-center">
          <span class="paren paren--open" ref="parenOpen">{{ parenOpen }}</span>

          <div class="retro-frame" ref="frameRef">
            <div class="retro-frame__inner">
              <div
                v-for="(img, i) in images"
                :key="i"
                class="retro-frame__slide"
                :class="{ 'is-active': i === activeIndex }"
              >
                <img :src="img.src" :alt="img.alt" loading="lazy" decoding="async" />
              </div>
            </div>
          </div>

          <span class="paren paren--close" ref="parenClose">{{ parenClose }}</span>
        </div>

        <span class="line3-side line3-side--right">
          <span v-if="lineThreeLabel" class="line3-label">{{ lineThreeLabel }}</span>
        </span>
      </div>

      <div v-if="hasLineFour" class="line line--4">
        <span class="word-wrap"><span class="word word--line" ref="wordsL4">{{ normalizedLineFour }}</span></span>
      </div>
    </div>

  </section>
</template>

<script>
import { gsap } from 'gsap'

export default {
  name: 'Section',

  props: {
    lineOne: {
      type: String,
      default: '',
    },

    lineTwo: {
      type: String,
      default: '',
    },

    parenOpen: {
      type: String,
      default: '(',
    },
    parenClose: {
      type: String,
      default: ')',
    },

    lineFour: {
      type: String,
      default: '',
    },

    lineThreeMark: {
      type: String,
      default: '',
    },

    lineThreeLabel: {
      type: String,
      default: '',
    },

    sectionHeight: {
      type: String,
      default: '100svh',
    },

    sectionBg: {
      type: String,
      default: 'var(--color-white)',
    },

    sectionTextColor: {
      type: String,
      default: 'var(--color-ink)',
    },

    images: {
      type: Array,
      default: () => [
        {
          src: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80',
          alt: 'Project 01',
        },
        {
          src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
          alt: 'Project 02',
        },
        {
          src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
          alt: 'Project 03',
        },
        {
          src: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&q=80',
          alt: 'Project 04',
        },
      ],
    },
    slideDuration: {
      type: Number,
      default: 1800,
    },
  },

  data() {
    return {
      activeIndex: 0,
      slideTimer: null,
      heroObserver: null,
    }
  },

  computed: {
    normalizedLineOne() {
      return (this.lineOne || '').trim()
    },

    normalizedLineTwo() {
      return (this.lineTwo || '').trim()
    },

    normalizedLineFour() {
      return (this.lineFour || '').trim()
    },

    hasLineOne() {
      return this.normalizedLineOne.length > 0
    },

    hasLineTwo() {
      return this.normalizedLineTwo.length > 0
    },

    hasLineFour() {
      return this.normalizedLineFour.length > 0
    },

    heroStyleVars() {
      return {
        '--section-height': this.sectionHeight || '100svh',
        '--section-bg': this.sectionBg || 'var(--color-white)',
        '--section-text': this.sectionTextColor || 'var(--color-ink)',
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.initReveal()
      this.initVisibilityObserver()
      this.startSlideshow()
    })
  },

  watch: {
    images: {
      deep: true,
      handler() {
        this.activeIndex = 0
        this.startSlideshow()
      },
    },
  },

  beforeUnmount() {
    clearInterval(this.slideTimer)
    this.heroObserver?.disconnect()
    this.heroObserver = null
  },

  methods: {
    prefersReducedMotion() {
      return (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
      )
    },

    initVisibilityObserver() {
      if (typeof window === 'undefined') return
      if (!('IntersectionObserver' in window)) return
      if (!this.$refs.heroRef) return

      this.heroObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting)
          if (visible) {
            this.startSlideshow()
          } else {
            clearInterval(this.slideTimer)
            this.slideTimer = null
          }
        },
        { threshold: 0.15 }
      )

      this.heroObserver.observe(this.$refs.heroRef)
    },

    initReveal() {
      const words = this.$el.querySelectorAll('.word')
      const parens = [this.$refs.parenOpen, this.$refs.parenClose]

      if (this.prefersReducedMotion()) {
        gsap.set(words, { yPercent: 0, opacity: 1 })
        gsap.set(parens, { yPercent: 0, opacity: 1 })
        gsap.set(this.$refs.frameRef, { scale: 1, opacity: 1, rotateZ: 0 })
        return
      }

      gsap.set(words, { yPercent: 115, opacity: 0 })
      gsap.set(parens, { yPercent: 115, opacity: 0 })
      gsap.set(this.$refs.frameRef, { scale: 0.55, opacity: 0, rotateZ: -5 })

      const tl = gsap.timeline({
        defaults: { ease: 'power4.out' },
        delay: 0.1,
      })
      tl.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 1.15,
        stagger: 0.06,
      })
        .to(parens, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08 }, '-=0.95')
        .to(
          this.$refs.frameRef,
          { scale: 1, opacity: 1, rotateZ: 0, duration: 1.05, ease: 'back.out(1.6)' },
          '-=0.9'
        )
    },

    startSlideshow() {
      clearInterval(this.slideTimer)
      if (this.images.length <= 1) return
      if (this.prefersReducedMotion()) return
      this.slideTimer = setInterval(() => {
        this.activeIndex = (this.activeIndex + 1) % this.images.length
      }, this.slideDuration)
    },
  },
}
</script>

<style scoped>
.hero {
  position: relative;
  z-index: 2;
  isolation: isolate;
  width: 100%;
  min-height: var(--section-height, 100svh);
  background-color: transparent;
  color: var(--section-text, var(--color-ink));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background-color: var(--section-bg, var(--color-white));
}

.hero__type {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.08;
  padding: 0 var(--gutter);
}

.line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.18em;
  overflow: hidden;
}

.word {
  display: inline-block;
  font-size: clamp(3rem, 12vw, 11rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--section-text, var(--color-ink));
  will-change: transform;
}

.word--line {
  white-space: pre-wrap;
}

.line--3 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  width: 100%;
  max-width: min(100%, 72rem);
  margin: clamp(-0.5rem, -1vw, -1rem) 0;
  overflow: visible;
}

.line3-side {
  min-width: 0;
}

.line3-side--left {
  display: flex;
  justify-content: flex-end;
  padding-right: clamp(0.45rem, 1vw, 0.75rem);
}

.line3-side--right {
  display: flex;
  justify-content: flex-start;
  padding-left: clamp(0.45rem, 1vw, 0.75rem);
}

.line3-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.55rem, 1.9vw, 1.4rem);
}

.line3-mark {
  font-size: clamp(2.2rem, 5.2vw, 4.8rem);
  line-height: 1;
  font-weight: 700;
  color: var(--section-text, var(--color-ink));
  margin-right: clamp(0.2rem, 1vw, 0.6rem);
}

.line3-label {
  font-size: clamp(0.95rem, 1.15vw, 1.8rem);
  line-height: 1.1;
  color: var(--section-text, var(--color-ink));
  margin-left: clamp(0.2rem, 1vw, 0.6rem);
  opacity: 0.9;
}

.paren {
  font-size: clamp(3.2rem, 11.8vw, 11rem);
  font-weight: 700;
  color: var(--section-text, var(--color-ink));
  line-height: 1;
  user-select: none;
}

.retro-frame {
  position: relative;
  flex-shrink: 0;
  width: clamp(180px, 22vw, 360px);
  aspect-ratio: 16 / 10;
  will-change: transform;
}

.retro-frame__inner {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ededed;
  overflow: hidden;
}

.retro-frame__slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.45s ease;
}

.retro-frame__slide.is-active {
  opacity: 1;
}

.retro-frame__slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

@media (max-width: 640px) {
  .hero {
    min-height: auto;
    padding-top: clamp(3rem, 8svh, 5rem);
    padding-bottom: clamp(3rem, 8svh, 5rem);
    box-sizing: border-box;
  }

  .hero__type {
    line-height: 1.2;
    /* breathing room between lines */
    gap: clamp(0.3rem, 2vw, 0.55rem);
  }

  .line--3 {
    max-width: 100%;
    /* flip the desktop negative pull to a positive gap on mobile */
    margin: clamp(0.25rem, 1.5vw, 0.5rem) 0;
  }

  .line3-center { gap: clamp(0.18rem, 1.2vw, 0.4rem); }

  .retro-frame {
    width: clamp(90px, 22vw, 160px);
    aspect-ratio: 16 / 10;
  }

  .line3-mark {
    font-size: clamp(1.55rem, 8vw, 2.3rem);
    margin-right: 0.1rem;
  }

  .line3-label {
    display: none;
  }
}

@media (max-width: 360px) {
  /* At 320-360px the mark overflows its ~9px side column — hide it */
  .line3-mark {
    display: none;
  }

  .retro-frame {
    width: clamp(72px, 20vw, 100px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .retro-frame__slide { transition: none; }
}
</style>