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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyMailto, { once: true });
} else {
  applyMailto();
}
