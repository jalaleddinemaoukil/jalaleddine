const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID ?? "5x33ctz8";
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET ?? "production";
const SANITY_API_VERSION = "2023-10-01";
const SANITY_TOKEN = import.meta.env.VITE_SANITY_TOKEN;
const USE_PROXY =
  !import.meta.env.SSR &&
  String(import.meta.env.VITE_SANITY_USE_PROXY ?? "true").toLowerCase() !== "false";

const queryCache = new Map();

const fetchSanity = async (query) => {
  if (!query) return [];
  if (queryCache.has(query)) return queryCache.get(query);

  const encodedQuery = encodeURIComponent(query);
  const apiHost = SANITY_TOKEN ? "api.sanity.io" : "apicdn.sanity.io";
  const queryUrl = USE_PROXY
    ? `/api/sanity?query=${encodedQuery}`
    : `https://${SANITY_PROJECT_ID}.${apiHost}/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`;

  const request = (async () => {
    try {
      const response = await fetch(
        queryUrl,
        !USE_PROXY && SANITY_TOKEN
          ? { headers: { Authorization: `Bearer ${SANITY_TOKEN}` } }
          : undefined
      );
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data?.result) ? data.result : [];
    } catch {
      return [];
    }
  })();

  queryCache.set(query, request);
  return request;
};

export const fetchHomeWorkItems = async () => {
  const workQuery =
    '*[_type=="work"]|order(_createdAt desc){_id,title,description,href,alt,client,category,"src":videoSrc.asset->url,"bg":bgSrc.asset->url}';
  const result = await fetchSanity(workQuery);
  return result.filter((item) => item?.bg && item?.title);
};

export const fetchWorksItems = async () => {
  const galleryQuery =
    '*[_type=="work"]|order(_createdAt desc){_id,title,alt,"image":bgSrc.asset->url,"video":videoSrc.asset->url}';
  const result = await fetchSanity(galleryQuery);
  return result.filter((item) => item?.image || item?.video);
};

export const prefetchHomeWorkItems = () => fetchHomeWorkItems();
export const prefetchWorksItems = () => fetchWorksItems();
