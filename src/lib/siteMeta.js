const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL ?? "https://example.com";
const metaTitle = "Jalal Eddine Maoukil | Software Engineer & Web Designer | Rabat, Morocco";
const metaDescription =
  "Jalal Eddine Maoukil - Full Stack Developer and Software Engineer specializing in web development and design. Based in Rabat, serving Casablanca, Tangier & clients worldwide.";
const metaKeywords =
  "Jalal Eddine Maoukil, Full Stack Developer Morocco, Software Engineer Rabat, Web Designer Morocco, Web Developer Casablanca, Front-end Developer Tangier, Freelance Developer Morocco";

const ogImageUrl = new URL("/images/profile.webp", siteUrl).toString();

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}#person`,
      name: "Jalal Eddine Maoukil",
      url: siteUrl,
      image: ogImageUrl,
      jobTitle: [
        "Software Engineer",
        "Full Stack Developer",
        "Web Designer",
        "Web Developer",
      ],
      knowsAbout: [
        "Web Development",
        "Web Design",
        "Full Stack Development",
        "Software Engineering",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Rabat",
        addressRegion: "Rabat-Sale-Kenitra",
        addressCountry: "MA",
      },
      workLocation: [
        { "@type": "Place", name: "Rabat" },
        { "@type": "Place", name: "Casablanca" },
        { "@type": "Place", name: "Tangier" },
        { "@type": "Place", name: "Morocco" },
      ],
      sameAs: [
        "https://www.linkedin.com/in/jalal-eddine-maoukil/",
        "https://github.com/jalaleddinemaoukil",
        "https://www.instagram.com/jalal.edn/",
      ],
      geo: {
        "@type": "GeoCoordinates",
        latitude: 34.020882,
        longitude: -6.84165,
      },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}#service`,
      name: "Jalal Eddine Maoukil - Software Engineer & Web Designer",
      url: siteUrl,
      image: ogImageUrl,
      description: metaDescription,
      serviceType: [
        "Web Development",
        "Web Design",
        "Full Stack Development",
        "Software Engineering",
      ],
      areaServed: { "@type": "Country", name: "Morocco" },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Rabat",
        addressRegion: "Rabat-Sale-Kenitra",
        addressCountry: "MA",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 34.020882,
        longitude: -6.84165,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
      ],
      provider: { "@id": `${siteUrl}#person` },
    },
  ],
};

const structuredDataJson = JSON.stringify(structuredData);

const baseMeta = {
  metaTitle,
  metaDescription,
  metaKeywords,
  ogImageUrl,
  siteUrl,
  structuredDataJson,
};

const buildHead = (path, overrides = {}) => {
  const canonicalUrl = new URL(path, siteUrl).toString();
  const title = overrides.title ?? metaTitle;
  const description = overrides.description ?? metaDescription;
  const keywords = overrides.keywords ?? metaKeywords;

  return {
    title,
    link: [
      { rel: "canonical", href: canonicalUrl },
      { rel: "alternate", hreflang: "ar-MA", href: new URL("/?lang=ar-MA", siteUrl).toString() },
    ],
    meta: [
      { name: "description", content: description },
      { name: "keywords", content: keywords },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:alt", content: "Jalal Eddine Maoukil portfolio preview" },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "ar_MA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImageUrl },
    ],
    script: [
      {
        type: "application/ld+json",
        children: structuredDataJson,
      },
    ],
  };
};

export { baseMeta, buildHead };
