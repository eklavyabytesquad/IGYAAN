// #aniket

import Link from "next/link";
import Logo from "@/components/logo";

const highlights = [
  "Unified operating system for schools",
  "Sudarshan Ai copilots for every learner and educator",
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
  "Adaptive Sudarshan Ai copilots curate lesson plans, mastery checks, and mentorship tailored to each learner's aspirations.",
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
  name: "Principal Sudarshan Ai",
    description:
      "Forecast admissions, manage compliance, and orchestrate school-wide OKRs with executive dashboards.",
  },
  {
  name: "Faculty Sudarshan Ai",
    description:
      "Generate lesson plans, formative assessments, and differentiated content in seconds.",
  },
  {
  name: "Student Sudarshan Ai",
    description:
      "Chat-based mentor guiding daily learning goals, career exploration, and venture pitch feedback.",
  },
];

const heroSignals = [
  {
    title: "Leadership cockpit",
    metric: "+32% forecast accuracy",
    description:
      "Auto-generate OKRs, board decks, and funding readiness reports in minutes with trusted data.",
  },
  {
  title: "Sudarshan Ai copilots live",
    metric: "142 lessons launched",
    description:
      "Differentiated lesson plans, mastery checks, and engagement nudges delivered in real time.",
  },
  {
    title: "Venture studio pipeline",
    metric: "48 demos this week",
    description:
      "Student founders receive mentor feedback, capital readiness scores, and alumni connections instantly.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-72 -z-20 h-160 bg-linear-to-b from-indigo-200/40 via-white to-transparent blur-3xl dark:from-indigo-950/70 dark:via-zinc-950/40 dark:to-transparent" />
      <div className="pointer-events-none absolute left-[12%] top-20 -z-10 h-64 w-64 rounded-full bg-indigo-400/25 blur-3xl animate-float dark:bg-indigo-900/40" />
      <div className="pointer-events-none absolute right-[8%] top-36 -z-10 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl animate-spin-slow dark:bg-indigo-700/40" />
      <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-24 sm:pt-28">
        <div className="relative grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-8 mt-2 flex justify-start sm:justify-start">
              <Logo variant="hero" priority />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600 shadow-sm dark:border-indigo-900/60 dark:bg-zinc-900/70 dark:text-indigo-300">
              AI-Native Learning OS
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
              Build <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-sky-500 bg-clip-text text-transparent">future-first schools</span> with Sudarshan Ai copilots for every journey.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
              iGyanAI unifies school operations, personalized learning, and venture incubation into a single intelligent fabric. Empower your community to learn, launch, and lead with confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-400"
              >
                <span>Book a demo</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6-6m6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/features"
                className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
              >
                Explore features
              </Link>
            </div>
          </div>
          <div className="relative isolate overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/80 p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-700/30" />
            <div className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-sky-200/30 blur-3xl dark:bg-blue-900/30" />
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                  Live campus snapshot
                </span>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Auto-sync every 5 minutes</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                Leadership Sudarshan Ai copilots surface opportunities and risks before they appear. See how your school evolves in real time.
              </p>
              <div className="space-y-3">
                {heroSignals.map((signal, index) => (
                  <div
                    key={signal.title}
                    className="flex items-start justify-between rounded-2xl border border-zinc-200/70 bg-white/70 px-4 py-4 shadow-sm shadow-indigo-500/10 transition-transform animate-float dark:border-zinc-800/70 dark:bg-zinc-900/80"
                    style={{ animationDelay: `${index * 0.3}s` }}
                  >
                    <div className="max-w-[220px]">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">{signal.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{signal.description}</p>
                    </div>
                    <span className="ml-4 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-300">
                      {signal.metric}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="animate-float rounded-xl border border-white/70 bg-white/70 p-4 text-sm font-medium text-zinc-600 shadow-lg shadow-indigo-100/40 backdrop-blur transition-transform hover:-translate-y-1 dark:border-zinc-800/60 dark:bg-zinc-900/80 dark:text-zinc-300"
              style={{ animationDelay: `${index * 0.25}s` }}
            >
              {highlight}
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 rounded-3xl bg-white/85 p-10 shadow-2xl shadow-indigo-500/10 ring-1 ring-white/60 backdrop-blur dark:bg-zinc-900/70 dark:ring-zinc-800/50 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              One platform to orchestrate every moment of the learning lifecycle
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              From admissions to alumni ventures, iGyanAI syncs your data, workflows, and community into a responsive system that learns with you.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="animate-float rounded-lg border border-indigo-100 bg-indigo-50/60 p-5 text-center shadow-sm dark:border-indigo-900/60 dark:bg-indigo-900/20"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300">{stat.value}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-indigo-700/80 dark:text-indigo-200/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-200 bg-linear-to-br from-white via-indigo-50 to-indigo-100 p-8 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/40">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              What if your school had its own AI mission control?
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              iGyanAI fuses data across academics, operations, and community to surface recommendations in real time. Discover opportunities, prevent drop-offs, and launch passion-driven ventures with ease.
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
          Whether you are scaling a network or reimagining a single campus, our modular Sudarshan Ai copilots adapt to your unique vision.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featureCards.map((feature, index) => (
            <article
              key={feature.title}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg shadow-indigo-500/10 transition-transform hover:-translate-y-1.5 hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900/70"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-lg font-semibold text-zinc-900 transition-colors group-hover:text-indigo-500 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{feature.description}</p>
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
              Meet the iGyanAI Sudarshan Ai Suite
            </h2>
            <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              Seamless assistants tuned for every stakeholder, powered by your data and large language models with enterprise-grade governance.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-500 transition-colors hover:text-indigo-400"
            >
              Request a custom pilot →
            </Link>
          </div>
          <div className="grid gap-4">
            {copilots.map((copilot, index) => (
              <div
                key={copilot.name}
                className="animate-float rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/30"
                style={{ animationDelay: `${index * 0.25}s` }}
              >
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">{copilot.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{copilot.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-900 via-indigo-800 to-indigo-500 px-8 py-16 text-center text-white shadow-2xl animate-glow">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent)]" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">Ready to launch your AI-first campus?</h2>
            <p className="text-base text-indigo-100">
              We partner with visionary schools to design future-forward experiences—from curriculum to capital access.
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
