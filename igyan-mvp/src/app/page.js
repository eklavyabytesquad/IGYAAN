// #aniket

import Link from "next/link";
import Logo from "@/components/logo";
import { CheckCircle, XCircle } from "lucide-react";

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

const offeringMatrix = [
  {
    feature: "School-Level Innovation Cell & Startup Lab",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "yes" },
  },
  {
    feature: "AI Tutor (Daily Task Automation, Mentor Chatbot)",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "yes", note: "Co-pilot" },
  },
  {
    feature: "Homework Task Delivery & Tracking",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "no" },
  },
  {
    feature: "Viva Mock Interview & AI Skill Evaluation",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "no" },
  },
  {
    feature: "Centralized Events, Competitions, Hackathons",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "yes" },
  },
  {
    feature: "AI Counsellor & Roadmap Generator",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "yes" },
  },
  {
    feature: "AI Timetable & Smart Substitution Scheduler",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "no" },
  },
  {
    feature: "Assignment/Test Creation (AI Assessment Builder)",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "no" },
  },
  {
    feature: "Editable AI Report Cards (Smart Evaluation System)",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "no" },
  },
  {
    feature: "AI Assessment Builder",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "no" },
  },
  {
    feature: "Real-Time Pitch Deck Feedback (AI Shark Simulation)",
    institutionalSuite: { status: "yes" },
  igyanAiLaunch: { status: "yes", note: "Premium" },
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
  <div
    className="pointer-events-none absolute inset-x-0 -top-72 -z-20 h-160 blur-3xl"
    style={{ background: "var(--hero-gradient-top)" }}
    aria-hidden="true"
  />
  <div
    className="pointer-events-none absolute left-[12%] top-20 -z-10 h-64 w-64 rounded-full blur-3xl animate-float"
    style={{ background: "var(--hero-bubble-left)" }}
    aria-hidden="true"
  />
  <div
    className="pointer-events-none absolute right-[8%] top-36 -z-10 h-80 w-80 rounded-full blur-3xl animate-spin-slow"
    style={{ background: "var(--hero-bubble-right)" }}
    aria-hidden="true"
  />
      <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-24 sm:pt-28">
        <div className="relative grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-8 mt-2 flex justify-start sm:justify-start">
              <Logo variant="hero" priority />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-sky-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-sky-300">
              AI-Native Learning OS
            </span>
            <h1 className="theme-heading mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Build <span className="bg-linear-to-r from-sky-500 via-cyan-400 to-sky-300 bg-clip-text text-transparent">future-first schools</span> with Sudarshan Ai copilots for every journey.
            </h1>
            <p className="theme-muted mt-6 max-w-2xl text-lg leading-relaxed">
              iGyanAI unifies school operations, personalized learning, and venture incubation into a single intelligent fabric. Empower your community to learn, launch, and lead with confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-400/40 transition-all hover:-translate-y-0.5 hover:bg-sky-400"
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
                className="rounded-lg border border-sky-200 px-5 py-3 text-sm font-semibold text-sky-700 transition-colors hover:border-sky-400 hover:text-sky-500 dark:border-slate-700 dark:text-zinc-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              >
                Explore features
              </Link>
            </div>
          </div>
          <div className="theme-surface relative isolate overflow-hidden rounded-3xl border p-8 shadow-2xl shadow-sky-500/10 backdrop-blur">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
              style={{ background: "var(--hero-card-spark-top)" }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full blur-3xl"
              style={{ background: "var(--hero-card-spark-bottom)" }}
              aria-hidden="true"
            />
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sky-600 dark:bg-sky-500/20 dark:text-sky-300">
                  Live campus snapshot
                </span>
                <span className="theme-muted text-xs font-medium">Auto-sync every 5 minutes</span>
              </div>
              <p className="theme-muted text-sm leading-relaxed">
                Leadership Sudarshan Ai copilots surface opportunities and risks before they appear. See how your school evolves in real time.
              </p>
              <div className="space-y-3">
                {heroSignals.map((signal, index) => (
                  <div
                    key={signal.title}
                    className="theme-surface flex items-start justify-between rounded-2xl border px-4 py-4 shadow-sm shadow-sky-500/10 transition-transform animate-float"
                    style={{ animationDelay: `${index * 0.3}s` }}
                  >
                    <div className="max-w-[220px]">
                      <p className="theme-heading text-sm font-semibold">{signal.title}</p>
                      <p className="theme-muted mt-1 text-xs leading-relaxed">{signal.description}</p>
                    </div>
                    <span className="ml-4 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-500 dark:bg-sky-500/20 dark:text-sky-300">
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
              className="theme-surface-muted animate-float rounded-xl border p-4 text-sm font-medium shadow-lg shadow-sky-100/40 backdrop-blur transition-transform hover:-translate-y-1 dark:border-slate-800/60"
              style={{ animationDelay: `${index * 0.25}s` }}
            >
              {highlight}
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="theme-heading text-3xl font-semibold">
            Tailored journeys for institutions and individual learners
          </h2>
          <p className="theme-muted mt-3 max-w-3xl text-base">
            Choose the pathway that fits your community. Every feature below is mapped directly from the iGyan.ai offering matrix so your teams know exactly what is included.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[
              {
                key: "institutionalSuite",
                title: "Institutional Suite • Institutions",
                description: "Full-stack automation and innovation infrastructure for schools, districts, and education networks.",
                badge: "Most comprehensive",
                cardClass:
                  "border-slate-900/70 bg-linear-to-br from-slate-950 via-slate-900 to-zinc-950 text-sky-50 shadow-sky-500/20 dark:border-slate-800/80",
              },
              {
                key: "igyanAiLaunch",
                title: "iGyan AI Launch • Learners & Families",
                description: "Personal Sudarshan copilots that amplify growth for ambitious students and parents.",
                badge: "Popular choice",
                cardClass:
                  "border-sky-200/70 bg-linear-to-br from-sky-600 via-cyan-500 to-sky-400 text-white shadow-[0_30px_60px_-25px_rgba(56,189,248,0.45)]",
              },
            ].map((plan) => {
              const isDark = plan.key === "institutionalSuite";

              return (
                <div
                  key={plan.key}
                  className={`flex h-full flex-col overflow-hidden rounded-3xl border p-8 backdrop-blur ${plan.cardClass}`}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                        isDark
                          ? "bg-sky-500/15 text-sky-100"
                          : "bg-white/20 text-white/90"
                      }`}
                    >
                      {plan.badge}
                    </p>
                  </div>
                  <div className="mt-6 space-y-3">
                    <h3 className="text-2xl font-semibold">{plan.title}</h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDark ? "text-sky-100/80" : "text-white/80"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>
                  <div className="mt-8 flex-1">
                    <ul className="space-y-3">
                      {offeringMatrix.map((feature) => {
                        const status = feature[plan.key];
                        const isAvailable = status.status === "yes";
                        const Icon = isAvailable ? CheckCircle : XCircle;
                        const statusLabel = isAvailable
                          ? status.note
                            ? `Yes · ${status.note}`
                            : "Yes"
                          : "Not included";

                        return (
                          <li
                            key={`${plan.key}-${feature.feature}`}
                            className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                              isDark
                                ? "border-sky-500/15 bg-slate-900/70"
                                : "border-white/20 bg-white/15"
                            }`}
                          >
                            <Icon
                              className={`mt-0.5 h-5 w-5 ${
                                isAvailable
                                  ? isDark
                                    ? "text-sky-300"
                                    : "text-white"
                                  : isDark
                                    ? "text-sky-200/40"
                                    : "text-white/50"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-medium leading-snug text-white">
                                {feature.feature}
                              </p>
                              <p
                                className={`text-xs font-medium ${
                                  isDark ? "text-sky-200/70" : "text-white/75"
                                }`}
                              >
                                {statusLabel}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <Link
                    href={plan.key === "institutionalSuite" ? "/login/institutional-suite" : "/login/launch-pad"}
                    className={`mt-10 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5 ${
                        isDark
                          ? "bg-sky-500 text-white shadow-sky-400/40 hover:bg-sky-400"
                          : "bg-white/90 text-sky-700 shadow-black/20 hover:bg-white"
                      }`}
                  >
                    Continue to sign in
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className="theme-surface mt-12 grid gap-6 rounded-3xl border p-10 shadow-2xl shadow-sky-500/10 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h2 className="theme-heading text-2xl font-semibold">
              One platform to orchestrate every moment of the learning lifecycle
            </h2>
            <p className="theme-muted text-base leading-relaxed">
              From admissions to alumni ventures, iGyanAI syncs your data, workflows, and community into a responsive system that learns with you.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="animate-float rounded-lg border border-sky-100 bg-sky-50/60 p-5 text-center shadow-sm shadow-sky-500/10 dark:border-sky-900/40 dark:bg-slate-900/40"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <p className="text-2xl font-semibold text-sky-600 dark:text-sky-300">{stat.value}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-sky-700/80 dark:text-sky-200/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="theme-surface-muted flex h-full flex-col justify-between rounded-2xl border bg-linear-to-br from-white via-sky-50 to-white p-8 shadow-inner shadow-sky-100/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <h3 className="theme-heading text-lg font-semibold">
              What if your school had its own AI mission control?
            </h3>
            <p className="theme-muted mt-4 text-sm leading-relaxed">
              iGyanAI fuses data across academics, operations, and community to surface recommendations in real time. Discover opportunities, prevent drop-offs, and launch passion-driven ventures with ease.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:-translate-y-0.5 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Talk to our strategists
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <h2 className="theme-heading text-center text-3xl font-semibold">
          Designed for modern school leaders
        </h2>
        <p className="theme-muted mx-auto mt-4 max-w-3xl text-center text-base">
          Whether you are scaling a network or reimagining a single campus, our modular Sudarshan Ai copilots adapt to your unique vision.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featureCards.map((feature, index) => (
            <article
              key={feature.title}
              className="theme-surface group flex flex-col rounded-2xl border p-6 shadow-lg shadow-sky-500/10 transition-transform hover:-translate-y-1.5 hover:border-sky-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="theme-heading text-lg font-semibold transition-colors group-hover:text-sky-500">
                {feature.title}
              </h3>
              <p className="theme-muted mt-4 flex-1 text-sm leading-relaxed">{feature.description}</p>
              <Link
                href="/features"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-500 transition-colors hover:text-sky-400"
              >
                Learn more →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="theme-surface grid gap-10 rounded-3xl border p-10 shadow-2xl shadow-sky-500/10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <h2 className="theme-heading text-3xl font-semibold">
              Meet the iGyanAI Sudarshan Ai Suite
            </h2>
            <p className="theme-muted text-base leading-relaxed">
              Seamless assistants tuned for every stakeholder, powered by your data and large language models with enterprise-grade governance.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-500 transition-colors hover:text-sky-400"
            >
              Request a custom pilot →
            </Link>
          </div>
          <div className="grid gap-4">
            {copilots.map((copilot, index) => (
              <div
                key={copilot.name}
                className="theme-surface-muted animate-float rounded-2xl border p-6 shadow-sm shadow-sky-500/10"
                style={{ animationDelay: `${index * 0.25}s` }}
              >
                <h3 className="theme-heading text-lg font-semibold">{copilot.name}</h3>
                <p className="theme-muted mt-2 text-sm leading-relaxed">{copilot.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-sky-700 px-8 py-16 text-center text-white shadow-2xl animate-glow">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent)]" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">Ready to launch your AI-first campus?</h2>
            <p className="text-base text-sky-100/90">
              We partner with visionary schools to design future-forward experiences—from curriculum to capital access.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-sky-700 shadow-lg shadow-sky-950/40 transition-transform hover:-translate-y-0.5"
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
