import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");

const collectHtmlFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(next));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(next);
    }
  }
  return files;
};

const extractHref = (tag) => {
  const match = tag.match(/href=["']([^"']+)["']/i);
  return match ? match[1] : null;
};

const resolveCssPath = (href, htmlDir) => {
  if (!href || /^https?:\/\//i.test(href)) return null;
  const clean = href.split("?")[0].split("#")[0];
  if (clean.startsWith("/")) {
    return path.join(distDir, clean.slice(1));
  }
  return path.resolve(htmlDir, clean);
};

const inlineCssInHtml = (html, htmlDir) => {
  const inlinedHrefs = new Set();
  const stylesheetPattern = /<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi;
  let changed = false;

  const withInline = html.replace(stylesheetPattern, (tag) => {
    const href = extractHref(tag);
    const cssPath = resolveCssPath(href, htmlDir);
    if (!cssPath || !fs.existsSync(cssPath)) return tag;
    const css = fs.readFileSync(cssPath, "utf8");
    inlinedHrefs.add(href);
    changed = true;
    return `<style data-inline-css="true">${css}</style>`;
  });

  const preloadPattern = /<link\b[^>]*rel=["']preload["'][^>]*as=["']style["'][^>]*>/gi;
  const withoutPreload = withInline.replace(preloadPattern, (tag) => {
    const href = extractHref(tag);
    if (!href || !inlinedHrefs.has(href)) return tag;
    changed = true;
    return "";
  });

  return { html: withoutPreload, changed };
};

if (!fs.existsSync(distDir)) {
  process.exit(0);
}

const htmlFiles = collectHtmlFiles(distDir);
htmlFiles.forEach((file) => {
  const contents = fs.readFileSync(file, "utf8");
  const { html, changed } = inlineCssInHtml(contents, path.dirname(file));
  if (changed) fs.writeFileSync(file, html, "utf8");
});
