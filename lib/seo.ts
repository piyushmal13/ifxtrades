import type { Metadata } from "next";

const SITE_URL = "https://www.ifxtrades.com";
const SITE_NAME = "IFXTrades";

export function buildMetadata({
  title,
  description,
  path,
  image = "/logo.png",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const canonical = new URL(path, SITE_URL).toString();
  const imageUrl = new URL(image, SITE_URL).toString();

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [imageUrl],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  url: string;
  image?: string | null;
  datePublished?: string | null;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: input.url,
    image: input.image ? [input.image] : undefined,
    datePublished: input.datePublished ?? undefined,
    author: {
      "@type": "Person",
      name: input.authorName ?? "IFX Research Desk",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

export function eventJsonLd(input: {
  name: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
  locationName?: string | null;
  url: string;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    description: input.description,
    startDate: input.startDate ?? undefined,
    endDate: input.endDate ?? undefined,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: input.locationName
      ? {
          "@type": "Place",
          name: input.locationName,
        }
      : undefined,
    image: input.image ? [input.image] : undefined,
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: input.url,
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  url: string;
  price?: number;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    image: input.image ? [input.image] : undefined,
    offers:
      typeof input.price === "number"
        ? {
            "@type": "Offer",
            priceCurrency: "USD",
            price: input.price,
            availability: "https://schema.org/InStock",
            url: input.url,
          }
        : undefined,
  };
}

export function courseJsonLd(input: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    url: input.url,
  };
}
