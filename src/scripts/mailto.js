const decodeMailto = (encoded = "") =>
  encoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const applyMailto = () => {
  document.querySelectorAll("[data-mailto]").forEach((el) => {
    const encoded = el.getAttribute("data-mailto");
    if (!encoded) return;
    const decoded = decodeMailto(encoded);
    if (!decoded) return;
    el.setAttribute("href", decoded);
  });
};

const scheduleApply = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(applyMailto);
  });
};

// Run after islands hydrate to avoid Vue hydration mismatches.
window.addEventListener("astro:page-load", scheduleApply, { passive: true });
window.addEventListener("astro:after-swap", scheduleApply, { passive: true });
window.addEventListener("load", scheduleApply, { once: true, passive: true });

if (document.readyState === "complete") scheduleApply();
