let initialized = false;

export const initHoverSfx = (options = {}) => {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  const config = {
    volume: 0.6,
    minInterval: 120,
    src: "/pop.mp3",
    poolSize: 4,
    playbackRate: 0.88,
    ...options,
  };

  const prefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    navigator.connection?.saveData === true;

  if (prefersReduced) return;

  let audioPool = [];
  let poolIndex = 0;
  let enabled = false;
  let lastHover = null;
  let lastPlay = 0;

  const ensureAudio = () => {
    if (!audioPool.length) {
      audioPool = Array.from({ length: config.poolSize }, () => {
        const audio = new Audio(config.src);
        audio.preload = "auto";
        audio.volume = config.volume;
        return audio;
      });
      // Warm up decode
      audioPool[0]?.load?.();
    }
    enabled = true;
  };

  const unlockAudio = () => {
    ensureAudio();
  };

  window.addEventListener("pointerdown", unlockAudio, { passive: true, once: true });
  window.addEventListener("keydown", unlockAudio, { passive: true, once: true });

  const matchTarget = (el) => {
    if (!el || !el.closest) return null;
    if (el.closest('[data-sfx="off"]')) return null;
    return el.closest('a, button, [role="button"], [data-sfx="hover"]');
  };

  const playPop = () => {
    if (!enabled || !audioPool.length) return;
    const now = performance.now();
    if (now - lastPlay < config.minInterval) return;
    lastPlay = now;

    const audio = audioPool[poolIndex];
    poolIndex = (poolIndex + 1) % audioPool.length;
    if (!audio) return;
    audio.volume = config.volume;
    audio.playbackRate = config.playbackRate;
    audio.preservesPitch = false;
    audio.mozPreservesPitch = false;
    audio.webkitPreservesPitch = false;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const onPointerOver = (event) => {
    if (event.pointerType === "touch") return;
    const target = matchTarget(event.target);
    if (!target || target === lastHover) return;
    lastHover = target;
    playPop();
  };

  const onPointerOut = (event) => {
    if (!lastHover) return;
    const related = event.relatedTarget;
    if (related && lastHover.contains(related)) return;
    lastHover = null;
  };

  document.addEventListener("pointerover", onPointerOver, { passive: true });
  document.addEventListener("pointerout", onPointerOut, { passive: true });
};
