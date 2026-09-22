import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps): IconProps {
  return {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  }
}

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)
export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
)
export const MoonIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
)
export const MonitorIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
)
export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
)
export const FolderIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>
)
export const PenIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
)
export const CodeIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" /></svg>
)
export const LinkIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>
)
export const CopyIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
)
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m5 12 5 5L20 7" /></svg>
)
export const ArrowUpRightIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M7 17 17 7M8 7h9v9" /></svg>
)
export const GithubIcon = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 .5A11.5 11.5 0 0 0 8.4 22.9c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)
export const YoutubeIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.5 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-3.8 31 31 0 0 0-.5-3.8Z" /><path d="m10 9 5 3-5 3Z" fill="currentColor" /></svg>
)
export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
)
export const AwardIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="5" /><path d="m8.5 12.5-1.5 8 5-3 5 3-1.5-8" /></svg>
)
export const BriefcaseIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></svg>
)
export const GraduationIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m2 9 10-5 10 5-10 5Z" /><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" /><path d="M22 9v6" /></svg>
)
export const LinkedinIcon = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M20.4 2H3.6A1.6 1.6 0 0 0 2 3.6v16.8A1.6 1.6 0 0 0 3.6 22h16.8a1.6 1.6 0 0 0 1.6-1.6V3.6A1.6 1.6 0 0 0 20.4 2ZM8 19H5v-9h3Zm-1.5-10.3a1.8 1.8 0 1 1 0-3.5 1.8 1.8 0 0 1 0 3.5ZM19 19h-3v-4.4c0-1.1 0-2.5-1.5-2.5S12.8 13.3 12.8 14.5V19h-3v-9h2.9v1.2a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.6 2 3.6 4.6Z" />
  </svg>
)
export const MessageIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.4-4.2A8 8 0 1 1 21 12Z" /></svg>
)
export const SendIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
)
export const StopIcon = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
)
export const XIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
)
