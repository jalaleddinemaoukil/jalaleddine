<!-- src/components/MagneticButton.vue -->
<template>
  <a
    ref="buttonRef"
    :href="href"
    class="magnetic-button"
    :style="buttonStyle"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    {{ text }}
  </a>
</template>

<script setup>
import { ref, computed } from 'vue';
import gsap from 'gsap';

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  width: {
    type: String,
    default: '200px',
  },
  height: {
    type: String,
    default: '60px',
  },
  fontSize: {
    type: String,
    default: '16px',
  },
  href: {
    type: String,
    default: '#',
  },
  variant: {
    type: String,
    default: 'light',
  },
});

const buttonRef = ref(null);

const buttonStyle = computed(() => ({
  width: props.width,
  height: props.height,
  fontSize: props.fontSize,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: props.variant === 'light' ? '#fff' : '#000',
  color: props.variant === 'light' ? '#000' : '#fff',
  borderRadius: '8px',
  textDecoration: 'none',
  transition: 'background-color 0.3s ease',
  cursor: 'pointer',
}));

const onMouseEnter = () => {
  gsap.to(buttonRef.value, {
    scale: 1.05,
    duration: 0.3,
    ease: 'power2.out',
  });
};

const onMouseMove = (e) => {
  if (!buttonRef.value) return;

  const rect = buttonRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;

  gsap.to(buttonRef.value, {
    x: x * 0.3,
    y: y * 0.3,
    duration: 0.3,
    ease: 'power2.out',
  });
};

const onMouseLeave = () => {
  gsap.to(buttonRef.value, {
    x: 0,
    y: 0,
    scale: 1,
    duration: 0.5,
    ease: 'elastic.out(1, 0.3)',
  });
};
</script>

<style scoped>
.magnetic-button:hover {
  background-color: rgba(255, 255, 255, 0.9);
}
</style>