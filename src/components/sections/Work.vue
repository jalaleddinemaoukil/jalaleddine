<template>
  <section id="work" class="work" ref="sectionRef" @pointerleave="handleSectionPointerLeave">
    <div class="work__top">
      <h2 class="work__heading">Featured Work</h2>
    </div>

    <nav class="work__list">
      <a v-for="(item, idx) in items" :key="item._id || item.title" class="work__item" :class="{
        'is-hovered': hoveredIndex === idx,
        'is-dimmed': hoveredIndex !== -1 && hoveredIndex !== idx
      }" :href="item.href" target="_blank" rel="noopener noreferrer" @pointerenter="handleItemPointerEnter(idx)">
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

        <div class="work__item-cta work__item-cta--desktop">
          <div class="slide-inner">
            <span class="slide-text slide-text--a">View Live</span>
            <span class="slide-text slide-text--b">View Live</span>
          </div>
        </div>

        <div class="work__item-thumb" :style="{ backgroundImage: `url(${item.bg || item.image})` }"
          aria-hidden="true" />
      </a>
    </nav>

    <div class="link-container">
      <Button tag="a" href="/works" customClass="view-all-btn" :staggerDelay="0.02" :animationDuration="0.5"
        :animationEasing="'cubic-bezier(0.22, 1, 0.36, 1)'">
        Learn More
      </Button>
    </div>


  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from '../base/Button.vue'

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const items = computed(() => props.items || [])

const sectionRef = ref(null)
const hoveredIndex = ref(-1)

function handleItemPointerEnter(index) {
  hoveredIndex.value = index
}

function handleItemPointerLeave() {
  hoveredIndex.value = -1
}

function handleSectionPointerLeave() {
  handleItemPointerLeave()
}

const formatOrder = i => String(i + 1).padStart(2, '0')




</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

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

.work__list {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.work__item {
  display: flex;
  align-items: center;
  padding: clamp(32px, 4vw, 56px) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  text-decoration: none;
  color: #fff;
  position: relative;
}

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

.work__item-title--a {
  transform: translateY(0%);
}

.work__item-title--b {
  transform: translateY(100%);
}

.work__item:hover .work__item-title--a {
  transform: translateY(-100%);
}

.work__item:hover .work__item-title--b {
  transform: translateY(0%);
}

.work__item-cta {
  position: relative;
  z-index: 4;
  width: clamp(120px, 12vw, 200px);
  display: flex;
  justify-content: flex-end;
}



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

.slide-text--a {
  transform: translateY(0%);
}

.slide-text--b {
  transform: translateY(100%);
}

.work__item:hover .slide-text--a {
  transform: translateY(-100%);
}

.work__item:hover .slide-text--b {
  transform: translateY(0%);
}


.link-container {
  display: none;
}

@media (max-width: 767px) {
  .work {
    min-height: unset;
  }

  .link-container {
    display: flex;
    justify-content: center;
    margin-top: clamp(40px, 10vw, 64px);
  }
}

.work__item-thumb {
  display: none;
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





@media (hover: none),
(pointer: coarse) {
  .work__item-thumb {
    display: block;
  }

  .work__item-cta--desktop {
    display: none;
  }

  .work__item {
    padding: clamp(20px, 5vw, 36px) 0;
    gap: 12px;
    align-items: flex-start;
  }

  .work__item-client {
    width: clamp(36px, 8vw, 56px);
  }

  .work__item-title-wrap {
    justify-content: flex-start;
    min-width: 0;
  }

  .work__item-title-inner {
    width: 100%;
  }

  .work__item-title {
    white-space: normal;
    overflow-wrap: anywhere;
    line-height: 1.08;
  }

  .work__item-title--b,
  .work__item .slide-text--b {
    display: none;
  }

  .work__item:active .work__item-thumb {
    opacity: 1;
    transform: scale(0.97);
  }


}
</style>