const SANITY_PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID ?? "5x33ctz8";
const SANITY_DATASET = import.meta.env.VITE_SANITY_DATASET ?? "production";
const SANITY_API_VERSION = "2023-10-01";
const USE_PROXY =
  !import.meta.env.SSR &&
  String(import.meta.env.VITE_SANITY_USE_PROXY ?? "true").toLowerCase() !== "false";

const SANITY_QUERIES = {
  homeWork:
    '*[_type=="work"]|order(_createdAt desc){_id,title,description,href,alt,client,category,"src":videoSrc.asset->url,"bg":bgSrc.asset->url}',
  worksGallery:
    '*[_type=="work"]|order(_createdAt desc){_id,title,alt,"image":bgSrc.asset->url,"video":videoSrc.asset->url}',
};

const queryCache = new Map();

const fetchSanity = async (queryKey) => {
  const query = SANITY_QUERIES[queryKey];
  if (!query) return [];
  if (queryCache.has(queryKey)) return queryCache.get(queryKey);

  const encodedQuery = encodeURIComponent(query);
  const apiHost = "apicdn.sanity.io";
  const directUrl = `https://${SANITY_PROJECT_ID}.${apiHost}/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`;
  const queryUrl = USE_PROXY
    ? `/api/sanity?query=${encodedQuery}`
    : directUrl;

  const parseResponse = async (response) => {
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data?.result) ? data.result : [];
  };

  const request = (async () => {
    try {
      const response = await fetch(queryUrl);
      const parsed = await parseResponse(response);
      if (parsed) return parsed;

      if (USE_PROXY) {
        const directResponse = await fetch(directUrl);
        const directParsed = await parseResponse(directResponse);
        if (directParsed) return directParsed;
      }

      return [];
    } catch {
      if (USE_PROXY) {
        try {
          const directResponse = await fetch(directUrl);
          const directParsed = await parseResponse(directResponse);
          if (directParsed) return directParsed;
        } catch {
          // Fall through to empty result.
        }
      }
      return [];
    }
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
