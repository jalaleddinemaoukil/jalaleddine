const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "5x33ctz8";
const SANITY_DATASET = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production";
const SANITY_API_VERSION = "2023-10-01";
const SANITY_TOKEN = process.env.SANITY_TOKEN;
const SANITY_API_HOST = process.env.SANITY_API_HOST || process.env.VITE_SANITY_API_HOST || "api.sanity.io";

const ALLOWED_QUERIES = new Set([
  '*[_type=="work"]|order(_createdAt desc){_id,title,description,href,alt,client,category,"src":videoSrc.asset->url,"bg":bgSrc.asset->url}',
  '*[_type=="work"]|order(_createdAt desc){_id,title,description,href,alt,"image":bgSrc.asset->url,"video":videoSrc.asset->url}',
]);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const query = typeof req.query?.query === "string" ? req.query.query : "";

  if (!query) {
    res.status(400).json({ error: "Missing query parameter." });
    return;
  }

  if (!ALLOWED_QUERIES.has(query)) {
    res.status(400).json({ error: "Query not allowed." });
    return;
  }

  const encodedQuery = encodeURIComponent(query);
  const hosts = Array.from(new Set([SANITY_API_HOST, "api.sanity.io", "apicdn.sanity.io"].filter(Boolean)));
  const urls = hosts.map(
    (host) => `https://${SANITY_PROJECT_ID}.${host}/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`
  );

  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetch(
        url,
        SANITY_TOKEN ? { headers: { Authorization: `Bearer ${SANITY_TOKEN}` } } : undefined
      );
      const body = await response.text();
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      res.setHeader("Content-Type", "application/json");
      res.status(response.status).send(body);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  res.status(500).json({ error: "Sanity proxy request failed.", detail: String(lastError?.message || "unknown") });
}
