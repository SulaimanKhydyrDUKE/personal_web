import Link from "next/link";

export default function Writing() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Writing</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Thoughts on technology, education, and building things.
        </p>
      </div>

      <div className="space-y-12">
        {posts.map((post) => (
          <article key={post.slug} className="group relative flex flex-col items-start">
            <h2 className="text-xl font-semibold tracking-tight">
              <Link href={post.href} target="_blank" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                {post.title}
              </Link>
            </h2>
            <time className="order-first mb-3 flex items-center text-sm text-gray-400 dark:text-gray-500 pl-3.5" dateTime={post.date}>
              <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                <span className="h-4 w-0.5 rounded-full bg-gray-200 dark:bg-gray-800" />
              </span>
              {post.formattedDate}
            </time>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {post.excerpt}
            </p>
            <Link 
              href={post.href} 
              target="_blank" 
              className="mt-4 flex items-center text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline"
            >
              Read article
              <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

const posts = [
  {
    title: "Why SWE will not get you far in life",
    slug: "why-swe-will-not-get-you-far",
    date: "2024-03-20",
    formattedDate: "March 20, 2024",
    excerpt: "There's a belief among Computer Science students that studying the subject well - better than others - will land you a cushy job right after graduation; and that this sequence will also give them stable $300k per year for at least 10 years. That's simply not true.",
    href: "https://brianjenney.medium.com/a-tale-of-two-ai-realities-ai-took-away-high-paying-tech-jobs-right-ad0358378872",
  },
];
