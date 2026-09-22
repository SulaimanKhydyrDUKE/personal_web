import type { MetadataRoute } from "next"
import { siteUrl } from "./lib/site-url"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/projects`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/writing`, changeFrequency: "monthly", priority: 0.5 },
  ]
}
