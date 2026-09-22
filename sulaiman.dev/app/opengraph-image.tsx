import { ImageResponse } from "next/og"
import { site } from "./data/site"

export const alt = `${site.name} — ${site.handle}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** Social preview card: name, tagline, and the site handle on a dark ground. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#000000",
          color: "#eeeeee",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, color: "#8b8b8b" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#2dd4bf" }} />
          {site.handle}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{site.name}</div>
          <div style={{ fontSize: 34, color: "#8b8b8b", lineHeight: 1.35, maxWidth: 980 }}>{site.tagline}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#8b8b8b" }}>{site.location}</div>
      </div>
    ),
    size,
  )
}
