export async function GET() {
  const siteUrl = import.meta.env.PUBLIC_SITE_URL ?? "https://example.com";
  const now = new Date().toISOString();

  const urls = [
    {
      loc: new URL("/", siteUrl).toString(),
      lastmod: now,
      changefreq: "monthly",
      priority: "1.0",
    },
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n` +
          `    <loc>${u.loc}</loc>\n` +
          `    <lastmod>${u.lastmod}</lastmod>\n` +
          `    <changefreq>${u.changefreq}</changefreq>\n` +
          `    <priority>${u.priority}</priority>\n` +
          `  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}