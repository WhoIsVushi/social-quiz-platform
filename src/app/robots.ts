import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/api",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/quiz/",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
