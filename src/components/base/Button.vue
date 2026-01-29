<template>
  <component
    :is="tag"
    :href="href"
    :to="to"
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel || label"
    class="btn-animate-chars"
    :class="customClass"
    @click="handleClick"
  >
    <div class="btn-animate-chars__bg" />
    <span ref="textElement" data-button-animate-chars class="btn-animate-chars__text">
      <slot>{{ label }}</slot>
    </span>
  </component>
</template>

<script>
export default {
  name: 'Button',
  props: {
    label: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: 'button'
    },
    href: String,
    to: [String, Object],
    type: {
      type: String,
      default: 'button'
    },
    disabled: Boolean,
    ariaLabel: String,
    customClass: [String, Array, Object],
    staggerDelay: {
      type: Number,
      default: 0.01
    },
    animationDuration: {
      type: Number,
      default: 0.6
    },
    animationEasing: {
      type: String,
      default: 'cubic-bezier(0.625, 0.05, 0, 1)'
    }
  },
  data() {
    return {
      observer: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initButtonCharacterStagger()
      this.setupMutationObserver()
    })
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect()
    }
  },
  watch: {
    label() {
      this.$nextTick(() => {
        this.initButtonCharacterStagger()
      })
    }
  },
  methods: {
    initButtonCharacterStagger() {
      if (!this.$refs.textElement) return

      const text = this.$refs.textElement.textContent
      this.$refs.textElement.innerHTML = ''

      ;[...text].forEach((char, index) => {
        const span = document.createElement('span')
        span.textContent = char
        span.style.transitionDelay = `${index * this.staggerDelay}s`
        span.style.transitionDuration = `${this.animationDuration}s`
        span.style.transitionTimingFunction = this.animationEasing

        if (char === ' ') {
          span.style.whiteSpace = 'pre'
        }

        this.$refs.textElement.appendChild(span)
      })
    },
    setupMutationObserver() {
      if (!this.$refs.textElement) return

      this.observer = new MutationObserver(() => {
        this.$nextTick(() => {
          this.initButtonCharacterStagger()
        })
      })

      this.observer.observe(this.$refs.textElement, {
        childList: true,
        characterData: true,
        subtree: true
      })
    },
    handleClick(event) {
      if (!this.disabled) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.btn-animate-chars {
  color: #131313;
  cursor: pointer;
  border-radius: 0.25em;
  justify-content: center;
  align-items: center;
  width: fit-content;
  padding: 1em 2em;
  font-size: 1em;
  line-height: 1;
  text-decoration: none;
  display: inline-flex;
  position: relative;
  border: none;
  background: transparent;
  font-family: inherit;
  white-space: nowrap;
}

.btn-animate-chars:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-animate-chars__text {
  white-space: nowrap;
  line-height: 1.3;
  position: relative;
  z-index: 1;
}

.btn-animate-chars [data-button-animate-chars] {
  overflow: hidden;
  position: relative;
  display: inline-block;
}

.btn-animate-chars [data-button-animate-chars] :deep(span) {
  display: inline-block;
  position: relative;
  text-shadow: 0 1.3em currentColor;
  transform: translateY(0) rotate(0.001deg);
  transition-property: transform;
  will-change: transform;
}

.btn-animate-chars:hover [data-button-animate-chars] :deep(span) {
  transform: translateY(-1.3em) rotate(0.001deg);
}

.btn-animate-chars__bg {
  background-color: #efeeec;
  border-radius: 0.25em;
  position: absolute;
  inset: 0;
  transition-property: inset;
  transition-duration: 0.6s;
  transition-timing-function: cubic-bezier(0.625, 0.05, 0, 1);
  will-change: inset;
}

.btn-animate-chars:hover .btn-animate-chars__bg {
  inset: 0.125em;
}

.btn-animate-chars:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .btn-animate-chars [data-button-animate-chars] :deep(span),
  .btn-animate-chars__bg {
    transition-duration: 0.01ms !important;
  }
}
</style>