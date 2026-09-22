/**
 * Canonical origin for absolute URLs (metadata, sitemap, JSON-LD), without a
 * trailing slash. Set NEXT_PUBLIC_SITE_URL once the custom domain is live;
 * until then Vercel's production URL is used, and localhost in development.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, "")
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel}`
  return "http://localhost:3000"
}
