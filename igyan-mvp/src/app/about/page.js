// #aniket


import Link from "next/link";
import Logo from "@/components/logo";

const values = [
  {
    title: "Learner-first innovation",
    description:
      "We design with students, educators, and founders to ensure every feature accelerates human potential, not just automation.",
  },
  {
    title: "Intelligent infrastructure",
    description:
  "Our AI stack fuses campus data, skill ontologies, and LLM Sudarshan Ai copilots with rigorous safety, privacy, and compliance.",
  },
  {
    title: "Inclusive ecosystems",
    description:
      "We partner with schools, industries, and investors to nurture equitable access to career pathways and venture capital.",
  },
];

const timeline = [
  {
    year: "2022",
    detail: "Founded iGyanAI to reimagine the EdTech OS for emerging market schools.",
  },
  {
    year: "2023",
  detail: "Launched the Sudarshan Ai Suite across 20 innovation-first campuses in India and Southeast Asia.",
  },
  {
    year: "2024",
    detail: "Expanded into entrepreneurship tracks with industry-backed venture studios and mentorship networks.",
  },
  {
    year: "2025",
    detail: "Deploying intelligent micro-campuses and cross-border learning exchanges powered by AI-native infrastructure.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20">
      <div className="max-w-3xl">
        <Logo variant="card" className="mb-6 scale-250 transform-gpu origin-left" />
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Building the intelligent backbone for next-generation schools.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          iGyanAI was created by a collective of educators, entrepreneurs, and
          technologists on a mission to craft a future where every learner can
          discover, design, and deploy world-changing ideas. We believe AI should
          be a co-pilot for community-led progress.
        </p>
      </div>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {values.map((value) => (
          <article
            key={value.title}
            className="rounded-2xl border border-zinc-200 bg-white/85 p-6 shadow-md shadow-sky-500/15 transition-transform hover:-translate-y-1 dark:border-slate-900 dark:bg-slate-950/70"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {value.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {value.description}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-20 rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/10 dark:border-slate-900 dark:bg-slate-950/75">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Our journey
        </h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          {timeline.map((event) => (
            <div key={event.year} className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-500">
                {event.year}
              </p>
              <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                {event.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

  <section className="mt-20 rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-sky-700 px-8 py-16 text-white shadow-2xl shadow-sky-900/30">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-3xl font-semibold">
            Join our coalition of builders, educators, and dreamers.
          </h2>
          <p className="text-base text-sky-100/90">
            We are actively partnering with school networks, governments, impact
            investors, and ecosystem catalysts. Let’s architect AI-first
            education at scale.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-sky-700 shadow-lg shadow-sky-900/30 transition-transform hover:-translate-y-0.5"
            >
              Partner with us
            </Link>
            <Link
              href="/features"
              className="rounded-lg border border-white/60 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Explore the platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}