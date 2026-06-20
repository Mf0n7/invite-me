import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://convida.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/login", "/register"];
  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));
}
