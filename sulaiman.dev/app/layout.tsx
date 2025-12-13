import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"

export const metadata = {
  title: "Sulaiman Khydyr uulu",
  description: "Builder. Writer. CS + Math @ Duke.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {children}
        </div>
      </body>
    </html>
  )
}

