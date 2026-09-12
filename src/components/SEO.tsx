import { useEffect } from "react";
import { useLocation } from "react-router";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: string;
}

export default function SEO({
  title,
  description,
  image = "/images/dps/logo.webp",
  type = "website",
}: SEOProps) {
  const { pathname } = useLocation();
  const fullTitle = `${title} | Delhi Public School Indirapuram`;

  useEffect(() => {
    document.title = fullTitle;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://dpsindirapuram.vercel.app";
    const canonicalUrl = `${origin}${pathname}`;
    const fullImageUrl = image.startsWith("http") ? image : `${origin}${image}`;

    const setMeta = (name: string, content: string, isProp = false) => {
      const attr = isProp ? `property="${name}"` : `name="${name}"`;
      let el = document.querySelector(`meta[${attr}]`);
      if (!el) {
        el = document.createElement("meta");
        if (isProp) el.setAttribute("property", name);
        else el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("og:image", fullImageUrl, true);
    setMeta("og:type", type, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", fullImageUrl);

    let linkCanonical = document.querySelector("link[rel='canonical']");
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute("href", canonicalUrl);
  }, [fullTitle, description, pathname, image, type]);

  return null;
}
