import Link from "next/link";

const highlights = [
  "Unified operating system for schools",
  "AI copilots for every learner and educator",
  "Career and venture incubators built in",
];

const featureCards = [
  {
    title: "Holistic School Management",
    description:
      "Automate admissions, fees, attendance, and accreditation workflows with predictive insights for administrators.",
  },
  {
    title: "Personalized Learning Paths",
    description:
      "Adaptive AI copilots curate lesson plans, mastery checks, and mentorship tailored to each learner's aspirations.",
  },
  {
    title: "Career & Entrepreneurship Studio",
    description:
      "Real-world industry projects, venture labs, and alumni networks help students design audacious futures.",
  },
];

const stats = [
  { label: "Hours saved weekly", value: "32" },
  { label: "Student success boost", value: "+48%" },
  { label: "Partner schools onboard", value: "120" },
];

const copilots = [
  {
    name: "Principal Copilot",
    description:
      "Forecast admissions, manage compliance, and orchestrate school-wide OKRs with executive dashboards.",
  },
  {
    name: "Faculty Copilot",
    description:
      "Generate lesson plans, formative assessments, and differentiated content in seconds.",
  },
  {
    name: "Student Copilot",
    description:
      "Chat-based mentor guiding daily learning goals, career exploration, and venture pitch feedback.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
  <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-indigo-100 via-white to-white dark:from-indigo-950/40 dark:via-black dark:to-black" />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 pb-24 pt-20 sm:pt-28">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600 shadow-sm dark:border-indigo-900/60 dark:bg-zinc-900 dark:text-indigo-300">
            AI-Native Learning OS
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
            Build future-first schools with AI copilots for every journey.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
            iGyanAI brings together school operations, personalized learning, and
            entrepreneurship incubation into one intelligent platform. Empower
            your community to learn, launch, and lead with confidence.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:-translate-y-0.5 hover:bg-indigo-400"
            >
              Book a demo
            </Link>
            <Link
              href="/features"
              className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
            >
              Explore features
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map((highlight) => (
            <div
              key={highlight}
              className="rounded-xl border border-white/70 bg-white/60 p-4 text-sm font-medium text-zinc-600 shadow-lg shadow-indigo-100/40 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-900/80 dark:text-zinc-300"
            >
              {highlight}
            </div>
          ))}
        </div>
        <div className="grid gap-6 rounded-3xl bg-white/80 p-10 shadow-2xl shadow-indigo-500/10 ring-1 ring-white/60 backdrop-blur dark:bg-zinc-900/70 dark:ring-zinc-800/50 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              One platform to orchestrate every moment of the learning lifecycle
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              From admissions to alumni ventures, iGyanAI syncs your data,
              workflows, and community into a responsive system that learns with
              you.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-5 text-center shadow-sm dark:border-indigo-900/60 dark:bg-indigo-900/20"
                >
                  <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-indigo-700/80 dark:text-indigo-200/80">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-linear-to-br from-white via-indigo-50 to-indigo-100 p-8 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/40">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              What if your school had its own AI mission control?
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              iGyanAI fuses data across academics, operations, and community to
              surface recommendations in real time. Discover opportunities,
              prevent drop-offs, and launch passion-driven ventures with ease.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Talk to our strategists
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <h2 className="text-center text-3xl font-semibold text-zinc-900 dark:text-white">
          Designed for modern school leaders
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-base text-zinc-600 dark:text-zinc-300">
          Whether you are scaling a network or reimagining a single campus, our
          modular copilots adapt to your unique vision.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article
              key={feature.title}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 transition-transform hover:-translate-y-1 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <h3 className="text-lg font-semibold text-zinc-900 transition-colors group-hover:text-indigo-500 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {feature.description}
              </p>
              <Link
                href="/features"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-500 transition-colors hover:text-indigo-400"
              >
                Learn more →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="grid gap-10 rounded-3xl border border-zinc-200 bg-white/90 p-10 shadow-2xl shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/70 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-zinc-900 dark:text-white">
              Meet the iGyanAI Copilot Suite
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              Seamless assistants tuned for every stakeholder, powered by your
              data and large language models with enterprise-grade governance.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-500 transition-colors hover:text-indigo-400"
            >
              Request a custom pilot →
            </Link>
          </div>
          <div className="grid gap-4">
            {copilots.map((copilot) => (
              <div
                key={copilot.name}
                className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/30"
              >
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                  {copilot.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {copilot.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-28">
  <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-indigo-800 to-indigo-500 px-8 py-16 text-center text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent)]" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Ready to launch your AI-first campus?
            </h2>
            <p className="text-base text-indigo-100">
              We partner with visionary schools to design future-forward
              experiences—from curriculum to capital access.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg shadow-indigo-900/40 transition-transform hover:-translate-y-0.5"
              >
                Connect with us
              </Link>
              <Link
                href="/about"
                className="rounded-lg border border-white/60 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Discover our mission
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
