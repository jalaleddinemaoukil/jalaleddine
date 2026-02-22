<template>
  <component
    :is="tag"
    :href="resolvedHref"
    :to="to"
    :type="type"
    :disabled="disabled"
    :aria-label="resolvedAriaLabel"
    class="btn-animate-chars"
    :class="customClass"
    :style="computedStyle"
    @click="handleClick"
  >
    <div class="btn-animate-chars__bg" />
    <span class="btn-animate-chars__dot-wrap" aria-hidden="true">
      <span class="btn-animate-chars__dot"></span>
    </span>
    <span ref="textElement" data-button-animate-chars class="btn-animate-chars__text">
      <slot>{{ label }}</slot>
    </span>
  </component>
</template>

<script>
export default {
  name: "BtnAnimateChars",
  props: {
    label: { type: String, default: "" },
    tag: { type: String, default: "button" },
    href: String,
    to: [String, Object],
    type: { type: String, default: "button" },
    disabled: Boolean,
    ariaLabel: String,
    customClass: [String, Array, Object],

    staggerDelay: { type: Number, default: 0.01 },
    animationDuration: { type: Number, default: 0.6 },
    animationEasing: { type: String, default: "cubic-bezier(0.625, 0.05, 0, 1)" },

    width: { type: [String, Number], default: null },     // e.g. 220, "14rem", "100%"
    height: { type: [String, Number], default: null },    // e.g. 48, "3rem"
    paddingX: { type: [String, Number], default: "2em" }, // e.g. 24, "1.5rem"
    paddingY: { type: [String, Number], default: "1em" }, // e.g. 14, "0.875rem"

    fontSize: { type: [String, Number], default: "1em" }, // e.g. 16, "0.95rem"
    fontWeight: { type: [String, Number], default: null },// e.g. 600
    letterSpacing: { type: [String, Number], default: null }, // e.g. "0.04em"

    lift: { type: [String, Number], default: "1.3em" } // match your original
  },
  data() {
    return { resolvedHref: this.href };
  },
  computed: {
    hasMailto() {
      return Boolean(this.$attrs?.["data-mailto"]);
    },
    resolvedAriaLabel() {
      if (this.ariaLabel) return this.ariaLabel;
      if (this.label) return this.label;
      return undefined;
    },
    computedStyle() {
      const px = (v) => (typeof v === "number" ? `${v}px` : v);
      const style = {
        "--btn-px": px(this.paddingX),
        "--btn-py": px(this.paddingY),
        "--btn-fs": px(this.fontSize),
        "--btn-lift": px(this.lift),
        "--btn-ease": this.animationEasing,
        "--btn-dur": `${this.animationDuration}s`,
      };

      if (this.width != null) style["--btn-w"] = px(this.width);
      if (this.height != null) style["--btn-h"] = px(this.height);
      if (this.fontWeight != null) style["--btn-fw"] = this.fontWeight;
      if (this.letterSpacing != null) style["--btn-ls"] = px(this.letterSpacing);

      return style;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.applyMailtoHref();
      this.initButtonCharacterStagger();
    });
  },
  watch: {
    href(next) {
      if (!this.hasMailto) this.resolvedHref = next;
    },
    label() {
      this.$nextTick(() => this.initButtonCharacterStagger());
    }
  },
  methods: {
    decodeMailto(encoded = "") {
      return encoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
    },
    applyMailtoHref() {
      if (this.tag !== "a") return;
      if (!this.hasMailto) return;
      const encoded = this.$attrs?.["data-mailto"];
      if (!encoded) return;
      const decoded = this.decodeMailto(String(encoded));
      if (!decoded) return;
      this.resolvedHref = decoded;
    },
    initButtonCharacterStagger() {
      const el = this.$refs.textElement;
      if (!el) return;

      const text = el.textContent || "";
      el.innerHTML = "";

      [...text].forEach((char, index) => {
        const span = document.createElement("span");
        span.textContent = char;

        // per-char stagger timing (unchanged)
        span.style.transitionDelay = `${index * this.staggerDelay}s`;
        span.style.transitionDuration = `var(--btn-dur)`;
        span.style.transitionTimingFunction = `var(--btn-ease)`;

        if (char === " ") span.style.whiteSpace = "pre";

        el.appendChild(span);
      });
    },
    handleClick(event) {
      if (!this.disabled) this.$emit("click", event);
    }
  }
};
</script>

<style scoped>
.btn-animate-chars {

  width: fit-content;
  min-width: var(--btn-w, 0px);
  height: var(--btn-h, auto);
  padding: var(--btn-py, 1em) var(--btn-px, 2em);
  text-transform: uppercase;
  font-size: var(--btn-fs, 1em);
  font-weight: var(--btn-fw, inherit);
  letter-spacing: var(--btn-ls, 0.04em);

  color: var(--color-ink, #000000);
  cursor: pointer;
  border-radius: 0.25em;
  justify-content: center;
  align-items: center;
  line-height: 1;
  text-decoration: none;
  display: inline-flex;
  gap: 0.75em;
  position: relative;
  border: none;
  background: transparent;
  font-family: inherit;
  white-space: nowrap;
  max-width: 100%;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  --btn-dot-size: 0.6em;
  --btn-dot-stroke: 1.5px;
  --btn-dot-fill-scale: 0.2;
  --btn-dot-fill-scale-hover: 0.6;
  --btn-dot-outline-scale-hover: 0.92;

  /* if height is set, ensure vertical centering behaves */
  box-sizing: border-box;
}

.btn-animate-chars:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-animate-chars__text {
  white-space: nowrap;
  line-height: 1.2;
  position: relative;
  z-index: 1;
}

.btn-animate-chars__dot-wrap {
  width: var(--btn-dot-size);
  height: var(--btn-dot-size);
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  z-index: 1;
}

.btn-animate-chars__dot {
  position: relative;
  width: var(--btn-dot-size);
  height: var(--btn-dot-size);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--btn-dur, 0.6s) var(--btn-ease, cubic-bezier(0.625, 0.05, 0, 1));
}

.btn-animate-chars__dot::before,
.btn-animate-chars__dot::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 999px;
  transition: transform var(--btn-dur, 0.6s) var(--btn-ease, cubic-bezier(0.625, 0.05, 0, 1)),
    opacity var(--btn-dur, 0.6s) var(--btn-ease, cubic-bezier(0.625, 0.05, 0, 1));
}

.btn-animate-chars__dot::before {
  border: var(--btn-dot-stroke) solid currentColor;
  background: transparent;
}

.btn-animate-chars__dot::after {
  background: currentColor;
  transform: scale(var(--btn-dot-fill-scale));
  opacity: 0;
}

.btn-animate-chars [data-button-animate-chars] {
  overflow: hidden;
  position: relative;
  display: inline-block;
}

/* KEY CHANGE: lift distance is now a variable */
.btn-animate-chars [data-button-animate-chars] :deep(span) {
  display: inline-block;
  position: relative;
  text-shadow: 0 var(--btn-lift, 1.3em) currentColor;
  transform: translateY(0) rotate(0.001deg);
  transition-property: transform;
  will-change: transform;
}

@media (hover: hover) {
  .btn-animate-chars:hover [data-button-animate-chars] :deep(span) {
    transform: translateY(calc(-1 * var(--btn-lift, 1.3em))) rotate(0.001deg);
  }

  .btn-animate-chars:hover .btn-animate-chars__dot {
    transform: scale(var(--btn-dot-outline-scale-hover));
  }

  .btn-animate-chars:hover .btn-animate-chars__dot::after {
    transform: scale(var(--btn-dot-fill-scale-hover));
    opacity: 1;
  }

  .btn-animate-chars:hover .btn-animate-chars__bg {
    inset: 0.125em;
  }
}

.btn-animate-chars__bg {
  background-color: var(--color-cta-bg, #ededed);
  border-radius: 0.25em;
  position: absolute;
  inset: 0;
  transition-property: inset;
  transition-duration: var(--btn-dur, 0.6s);
  transition-timing-function: var(--btn-ease, cubic-bezier(0.625, 0.05, 0, 1));
  will-change: inset;
}

.btn-animate-chars:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .btn-animate-chars [data-button-animate-chars] :deep(span),
  .btn-animate-chars__bg,
  .btn-animate-chars__dot {
    transition-duration: 0.01ms !important;
  }
}
</style>


