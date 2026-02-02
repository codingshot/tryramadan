import { useEffect } from "react";

const SITE_URL = "https://tryramadan.app";

const META_DESCRIPTION_MAX_LENGTH = 160;

export interface PageSEOProps {
  /** Page title (e.g. "Middle Eastern Power Bowl | TryRamadan Recipes") */
  title: string;
  /** Meta description for SEO and social previews (truncated to 160 chars) */
  description: string;
  /** Optional path for canonical and og:url (e.g. "/recipe/suhoor/1") */
  path?: string;
  /** Optional image URL for og:image (defaults to site og-image) */
  image?: string;
  /** Optional alt text for og:image (accessibility and SEO) */
  imageAlt?: string;
  /** Optional type for og:type (default "website") */
  type?: "website" | "article";
  /** Optional robots (e.g. "noindex, nofollow" for 404). Default: index, follow */
  robots?: string;
}

/**
 * Sets document title and meta tags for SEO and AEO (accessibility + SEO).
 * Use on every recipe and country page for unique, indexable content.
 */
const DEFAULT_OG_IMAGE_ALT = "TryRamadan.app — Fast like a Muslim for the holy month of Ramadan. Prayer times, suhoor & iftar, cultural education.";

export function PageSEO({ title, description, path = "", image, imageAlt = DEFAULT_OG_IMAGE_ALT, type = "website", robots }: PageSEOProps) {
  const url = path ? `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}` : SITE_URL;
  const imageUrl = image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : `${SITE_URL}/og-image.jpg`;
  const metaDescription =
    description.length > META_DESCRIPTION_MAX_LENGTH
      ? description.slice(0, META_DESCRIPTION_MAX_LENGTH - 3).trim() + "..."
      : description;

  useEffect(() => {
    document.title = title;

    const setMeta = (attr: "name" | "property", key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    setMeta("name", "description", metaDescription);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", metaDescription);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:image:alt", imageAlt);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", metaDescription);
    setMeta("name", "twitter:image", imageUrl);

    setMeta("name", "robots", robots ?? "index, follow");

    if (path) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = url;
    }

    return () => {
      // Optionally reset to default on unmount; for SPA we often leave as-is until next page
    };
  }, [title, metaDescription, url, imageUrl, imageAlt, type, path, robots]);

  return null;
}
