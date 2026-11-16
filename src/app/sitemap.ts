import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/config";
import { templateCatalog } from "@/features/templates/catalog";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/explore",
    "/privacy",
    "/terms",
    ...templateCatalog.map((t) => `/templates/${t.slug}`),
  ].map((path) => ({
    url: `${appUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
