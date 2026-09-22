import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { ChatWidget } from "./components/chat-widget"
import { CommandPalette } from "./components/command-palette"
import Footer from "./components/footer"
import Header from "./components/header"
import { site } from "./data/site"
import { siteUrl } from "./lib/site-url"
import { themeInitScript } from "./lib/theme"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const origin = siteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.tagline,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.handle,
    title: site.name,
    description: site.tagline,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: site.name, description: site.tagline },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: origin,
  description: site.tagline,
  affiliation: { "@type": "CollegeOrUniversity", name: "Duke University", url: "https://duke.edu" },
  homeLocation: { "@type": "Place", name: site.location },
  sameAs: [site.links.github, site.links.linkedin, site.links.youtube, site.links.lab],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: data-theme is set on the client before hydration.
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background font-sans text-foreground antialiased`}>
        <a
          href="#main"
          className="sr-only rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-12">
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Suspense fallback={<footer className="mt-24 border-t border-border pt-8 text-sm text-muted">© {new Date().getFullYear()} {site.name}</footer>}>
            <Footer />
          </Suspense>
        </div>
        <CommandPalette />
        <ChatWidget />
      </body>
    </html>
  )
}
