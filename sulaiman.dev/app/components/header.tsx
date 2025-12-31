import Link from "next/link";

export default function Header() {
  return (
    <header className="mb-12 flex items-center justify-between">
      <Link href="/" className="font-semibold tracking-tight hover:opacity-70 transition-opacity">
        sulaiman.dev
      </Link>
      <nav className="flex gap-6 text-sm font-medium text-gray-500">
        <Link href="/projects" className="hover:text-black dark:hover:text-white transition-colors">Projects</Link>
        <Link href="/writing" className="hover:text-black dark:hover:text-white transition-colors">Writing</Link>
        <a 
          href="https://github.com/SulaimanKhydyrDUKE" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-black dark:hover:text-white transition-colors"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}

