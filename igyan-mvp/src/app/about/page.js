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

const problemStatements = [
  {
    icon: "🎓",
    text: "Education systems focus on completion.",
    contrast: "Markets demand real capability.",
  },
  {
    icon: "🔍",
    text: "Students often discover their strengths too late.",
    contrast: "Early skill discovery changes trajectories.",
  },
  {
    icon: "📋",
    text: "Parents rely on grades to measure growth.",
    contrast: "Transparent insights reveal true potential.",
  },
  {
    icon: "🏛️",
    text: "Institutions struggle to align learning with opportunity.",
    contrast: "Structured access bridges the gap.",
  },
];

const milestones = [
  {
    year: "2022",
    title: "The Seed",
    detail: "Founded iGyanAI to reimagine the EdTech OS for emerging market schools.",
    icon: "🌱",
  },
  {
    year: "2023",
    title: "First Light",
    detail: "Launched the Sudarshan Ai Suite across 20 innovation-first campuses in India and Southeast Asia.",
    icon: "🚀",
  },
  {
    year: "2024",
    title: "Expansion",
    detail: "Expanded into entrepreneurship tracks with industry-backed venture studios and mentorship networks.",
    icon: "🌍",
  },
  {
    year: "2025",
    title: "Scale",
    detail: "Deploying intelligent micro-campuses and cross-border learning exchanges powered by AI-native infrastructure.",
    icon: "⚡",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20">
      {/* Hero */}
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

      {/* Values */}
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

      {/* Our Journey — The Story */}
      <section className="mt-20 rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/10 dark:border-slate-900 dark:bg-slate-950/75">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
          📖 Our Journey
        </div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Why I-GYAN AI exists
        </h2>

        <div className="mt-8 space-y-6">
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            Across the world, millions of students spend years earning degrees, yet
            industries continue to report a growing skills gap.
          </p>

          {/* Problem-contrast cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {problemStatements.map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50/80 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/10 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm dark:bg-slate-800">
                  {item.icon}
                </span>
                <p className="text-sm font-medium text-zinc-500 line-through decoration-zinc-300 dark:text-zinc-400 dark:decoration-zinc-600">
                  {item.text}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-sky-600 dark:text-sky-400">
                  {item.contrast}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-6 dark:border-sky-900/40 dark:bg-sky-950/20">
            <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-200">
              At the same time, artificial intelligence is reshaping how value is
              created and how careers begin.
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              The real problem is not education itself.{" "}
              <span className="font-semibold text-zinc-900 dark:text-white">
                It is the gap between learning and capability.
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-linear-to-r from-sky-50 to-indigo-50 p-6 dark:border-sky-800 dark:from-sky-950/30 dark:to-indigo-950/30">
            <p className="text-base font-medium leading-relaxed text-zinc-800 dark:text-zinc-100">
              I-GYAN AI was built to bridge that gap — by enabling{" "}
              <span className="text-sky-600 dark:text-sky-400">early skill discovery</span>,{" "}
              <span className="text-sky-600 dark:text-sky-400">transparent growth insights</span> for parents,
              and{" "}
              <span className="text-sky-600 dark:text-sky-400">structured access to innovation and opportunity</span>.
            </p>
          </div>

          <p className="text-center text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
            Because the future will not be defined by degrees alone —{" "}
            <span className="bg-linear-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
              but by capability.
            </span>
          </p>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="mt-12 rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/10 dark:border-slate-900 dark:bg-slate-950/75">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Milestones
        </h2>
        <div className="relative mt-10">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-2 bottom-2 hidden w-0.5 bg-linear-to-b from-sky-400 via-sky-500 to-indigo-500 sm:block" />

          <div className="space-y-8 sm:pl-14">
            {milestones.map((event) => (
              <div key={event.year} className="relative flex gap-4 sm:gap-0">
                {/* Timeline dot — desktop */}
                <div className="absolute -left-14 hidden h-10 w-10 items-center justify-center rounded-full border-2 border-sky-400 bg-white text-lg shadow-md shadow-sky-500/20 dark:border-sky-500 dark:bg-slate-900 sm:flex">
                  {event.icon}
                </div>
                {/* Timeline dot — mobile */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-sky-400 bg-white text-lg shadow-md dark:border-sky-500 dark:bg-slate-900 sm:hidden">
                  {event.icon}
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-5 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/10 dark:border-slate-800 dark:bg-slate-900/60 sm:w-full">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                      {event.year}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {event.title}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {event.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-sky-700 px-8 py-16 text-white shadow-2xl shadow-sky-900/30">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-3xl font-semibold">
            Join our coalition of builders, educators, and dreamers.
          </h2>
          <p className="text-base text-sky-100/90">
            We are actively partnering with school networks, governments, impact
            investors, and ecosystem catalysts. Let's architect AI-first
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
