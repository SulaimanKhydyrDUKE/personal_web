import Image from "next/image"

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="flex flex-col-reverse md:flex-row items-start gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Sulaiman Khydyr
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            CS + Math @ Duke University. I build algorithms and write about technology, motivations, and education.  
          </p>
        </div>
        <Image
          src="/profilephoto.png"
          alt="Sulaiman Khydyr"
          width={112}
          height={112}
          className="rounded-full grayscale hover:grayscale-0 transition-all duration-300"
          priority
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">
          GitHub Activity
        </h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-gray-900/50">
          <img
            src="https://ghchart.rshah.org/50abab5/SulaimanKhydyrDUKE"
            alt="GitHub contribution chart"
            className="w-full h-auto dark:invert dark:hue-rotate-180"
          />
        </div>
      </section>
    </div>
  )
}
