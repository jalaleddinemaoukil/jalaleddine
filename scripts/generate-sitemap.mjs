import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = process.env.VITE_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "https://example.com";
const now = new Date().toISOString();
const urls = [
  { loc: new URL("/", siteUrl).toString(), changefreq: "monthly", priority: "1.0" },
  { loc: new URL("/works", siteUrl).toString(), changefreq: "monthly", priority: "0.7" },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (u) =>
        `  <url>\n` +
        `    <loc>${u.loc}</loc>\n` +
        `    <lastmod>${now}</lastmod>\n` +
        `    <changefreq>${u.changefreq}</changefreq>\n` +
        `    <priority>${u.priority}</priority>\n` +
        `  </url>`
    )
    .join("\n") +
  `\n</urlset>\n`;

const robots = `User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap.xml", siteUrl).toString()}\n`;

await writeFile(resolve("public/sitemap.xml"), sitemap, "utf8");
await writeFile(resolve("public/robots.txt"), robots, "utf8");
