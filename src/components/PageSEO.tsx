import { useEffect } from "react";

const SITE_URL = "https://tryramadan.app";

export interface PageSEOProps {
  /** Page title (e.g. "Middle Eastern Power Bowl | TryRamadan Recipes") */
  title: string;
  /** Meta description for SEO and social previews */
  description: string;
  /** Optional path for canonical and og:url (e.g. "/recipe/suhoor/1") */
  path?: string;
  /** Optional image URL for og:image (defaults to site og-image) */
  image?: string;
  /** Optional type for og:type (default "website") */
  type?: "website" | "article";
}

/**
 * Sets document title and meta tags for SEO and AEO (accessibility + SEO).
 * Use on every recipe and country page for unique, indexable content.
 */
export function PageSEO({ title, description, path = "", image, type = "website" }: PageSEOProps) {
  const url = path ? `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}` : SITE_URL;
  const imageUrl = image ? (image.startsWith("http") ? image : `${SITE_URL}${image}`) : `${SITE_URL}/og-image.jpg`;

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

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", imageUrl);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", imageUrl);

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
  }, [title, description, url, imageUrl, type, path]);

  return null;
}
