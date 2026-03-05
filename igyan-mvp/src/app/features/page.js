// #aniket

import Logo from "@/components/logo";

const featureGroups = [
  {
    title: "Intelligent Operations",
    items: [
      "Predictive admissions forecasting and seat planning",
      "Automated fee collection with financial aid simulations",
  "Attendance, transport, and compliance Sudarshan Ai copilots",
    ],
  },
  {
    title: "Learning Intelligence",
    items: [
      "Adaptive curricula mapped to national and global standards",
      "Realtime mastery dashboards for faculty and parents",
      "AI generated lesson plans, assessments, and remediation loops",
    ],
  },
  {
    title: "Career & Venture Lab",
    items: [
      "Skill passports aligned to industry micro-credentials",
      "Startup studio with mentorship, grants, and investor demos",
      "Global community exchanges and virtual internships",
    ],
  },
];

const academicIntelligence = [
  {
    name: "OmniSight Live Classroom System",
    detail:
      "Live classes, digital whiteboard, soft board & real-time monitoring.",
    icon: "📡",
  },
  {
    name: "AI Bulk Report Card Generator",
    detail:
      "One-click class-wide report creation with performance analytics & AI-generated remarks.",
    icon: "📊",
  },
  {
    name: "Parent Engagement Module",
    detail:
      "Attendance alerts, report access & direct teacher communication.",
    icon: "👨‍👩‍👧",
  },
];

const smartAdmin = [
  {
    name: "Smart Timetable & Substitution System",
    detail:
      "Clash-free scheduling with auto substitute allocation & instant updates.",
    icon: "📅",
  },
  {
    name: "Code Tutor Tools",
    detail:
      "AI-assisted coding practice, evaluation & skill tracking.",
    icon: "💻",
  },
  {
    name: "IdeaSpark – 96 Govt Program Navigator",
    detail:
      "AI-powered idea generation with mapped access to 96+ government incubation & funding schemes.",
    icon: "💡",
  },
];

const automations = [
  {
    name: "Pulse Streams",
    detail:
  "Unified data lake that feeds Sudarshan Ai copilots with contextual insights from academics, finance, and wellbeing trackers.",
  },
  {
    name: "Blueprint Designer",
    detail:
      "Low-code workflow designer to tailor approvals, accreditation milestones, and event orchestration.",
  },
  {
    name: "Impact Graphs",
    detail:
      "Real-time dashboards that highlight risk flags, high-performing cohorts, and ROI of new initiatives.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <header className="max-w-3xl">
        <Logo variant="card" className="mb-6 scale-250 transform-gpu origin-left" />
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          The AI-native platform that orchestrates your entire campus.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          iGyanAI blends intelligent operations, personalized learning, and
          entrepreneurship enablement into a single experience. Every module is
          modular, interoperable, and governed for trust.
        </p>
      </header>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {featureGroups.map((group) => (
          <article
            key={group.title}
            className="rounded-2xl border border-zinc-200 bg-white/85 p-6 shadow-lg shadow-sky-500/15 transition-transform hover:-translate-y-1 dark:border-slate-900 dark:bg-slate-950/70"
          >
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {group.title}
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {group.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* Academic & Learning Intelligence */}
      <section className="mt-20 rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/10 dark:border-slate-900 dark:bg-slate-950/75">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
          🧠 Academic & Learning Intelligence
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-white">
          Supercharge teaching with intelligent classroom tools
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          From live classes to automated report cards and parent engagement — everything educators need, powered by AI.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {academicIntelligence.map((item) => (
            <div
              key={item.name}
              className="group rounded-2xl border border-sky-100 bg-sky-50/75 p-6 shadow-sm shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/15 dark:border-sky-900/40 dark:bg-slate-900/50"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-slate-800">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-300">
                {item.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Administration & Innovation Suite */}
      <section className="mt-12 rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/10 dark:border-slate-900 dark:bg-slate-950/75">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          🏫 Smart Administration & Innovation Suite
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-zinc-900 dark:text-white">
          Streamline operations and spark innovation
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          Intelligent scheduling, coding education, and government scheme navigation — all in one platform.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {smartAdmin.map((item) => (
            <div
              key={item.name}
              className="group rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 shadow-sm shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/15 dark:border-indigo-900/40 dark:bg-slate-900/50"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-slate-800">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                {item.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/10 dark:border-slate-900 dark:bg-slate-950/75">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Automate mission-critical workflows
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {automations.map((automation) => (
            <div
              key={automation.name}
              className="rounded-2xl border border-sky-100 bg-sky-50/75 p-6 shadow-sm shadow-sky-500/10 dark:border-sky-900/40 dark:bg-slate-900/50"
            >
              <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-300">
                {automation.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {automation.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-sky-700 px-8 py-16 text-white shadow-2xl shadow-sky-900/30">
        <div className="max-w-3xl space-y-6">
          <h2 className="text-3xl font-semibold">
            Enterprise-grade AI governance
          </h2>
          <ul className="space-y-3 text-base text-sky-100/90">
            <li>Granular role-based access controls and consent management</li>
            <li>End-to-end encryption, audit logs, and compliance certifications</li>
            <li>Model observability with human-in-the-loop review workflows</li>
          </ul>
          <p className="text-sm text-sky-100/80">
            Deploy on iGyanAI cloud or within your secure infrastructure. All
            Sudarshan Ai copilots respect your policies and adapt to regulatory shifts.
          </p>
        </div>
      </section>
    </div>
  );
}