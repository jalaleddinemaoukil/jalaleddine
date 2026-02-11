const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "5x33ctz8";
const SANITY_DATASET = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production";
const SANITY_API_VERSION = "2023-10-01";
const SANITY_TOKEN = process.env.SANITY_TOKEN || process.env.VITE_SANITY_TOKEN;

export default async function handler(req, res) {
  const query = typeof req.query?.query === "string" ? req.query.query : "";

  if (!query) {
    res.status(400).json({ error: "Missing query parameter." });
    return;
  }

  const apiHost = SANITY_TOKEN ? "api.sanity.io" : "apicdn.sanity.io";
  const encodedQuery = encodeURIComponent(query);
  const url = `https://${SANITY_PROJECT_ID}.${apiHost}/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`;

  try {
    const response = await fetch(
      url,
      SANITY_TOKEN ? { headers: { Authorization: `Bearer ${SANITY_TOKEN}` } } : undefined
    );
    const body = await response.text();
    res.setHeader("Content-Type", "application/json");
    res.status(response.status).send(body);
  } catch (error) {
    res.status(500).json({ error: "Sanity proxy request failed." });
  }
}
