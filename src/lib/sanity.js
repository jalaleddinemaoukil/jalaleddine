const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID ?? "5x33ctz8";
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET ?? "production";
const SANITY_API_VERSION = "2023-10-01";
const SANITY_API_HOST = import.meta.env.VITE_SANITY_API_HOST ?? "api.sanity.io";
const USE_PROXY =
  !import.meta.env.SSR &&
  String(import.meta.env.VITE_SANITY_USE_PROXY ?? "true").toLowerCase() !== "false";

const SANITY_QUERIES = {
  homeWork:
    '*[_type=="work"]|order(_createdAt desc){_id,title,description,href,alt,client,category,"src":videoSrc.asset->url,"bg":bgSrc.asset->url}',
  worksGallery:
    '*[_type=="work"]|order(_createdAt desc){_id,title,description,href,alt,"image":bgSrc.asset->url,"video":videoSrc.asset->url}',
};

const queryCache = new Map();

const SANITY_HOSTS = Array.from(
  new Set([SANITY_API_HOST, "api.sanity.io", "apicdn.sanity.io"].filter(Boolean))
);

const fetchSanity = async (queryKey) => {
  const query = SANITY_QUERIES[queryKey];
  if (!query) return [];
  if (queryCache.has(queryKey)) return queryCache.get(queryKey);

  const encodedQuery = encodeURIComponent(query);
  const directUrls = SANITY_HOSTS.map(
    (host) =>
      `https://${SANITY_PROJECT_ID}.${host}/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`
  );
  const queryUrls = USE_PROXY
    ? [`/api/sanity?query=${encodedQuery}`, ...directUrls]
    : directUrls;

  const parseResponse = async (response) => {
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data?.result) ? data.result : [];
  };

  const request = (async () => {
    for (const url of queryUrls) {
      try {
        const response = await fetch(url);
        const parsed = await parseResponse(response);
        if (parsed) return parsed;
      } catch {
        // Try next host/url.
      }
    }

    return [];
  })();

  queryCache.set(queryKey, request);
  return request;
};

export const fetchHomeWorkItems = async () => {
  const result = await fetchSanity("homeWork");
  return result.filter((item) => item?.bg && item?.title);
};

export const fetchWorksItems = async () => {
  const result = await fetchSanity("worksGallery");
  return result.filter((item) => item?.image || item?.video);
};

export const prefetchHomeWorkItems = () => fetchHomeWorkItems();
export const prefetchWorksItems = () => fetchWorksItems();
