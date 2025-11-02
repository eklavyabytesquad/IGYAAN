import Link from "next/link";
import Logo from "@/components/logo";

const OPTIONS = [
  {
    href: "/login/institutional-suite",
    label: "Institutional Suite",
    badge: "Institutional Suite • Institutions",
    description:
      "School and network leaders sign in to manage Sudarshan Ai copilots, automate operations, and orchestrate campus-wide innovation.",
  },
  {
    href: "/login/launch-pad",
    label: "iGyan AI Launch",
    badge: "iGyan AI Launch • Personal",
    description: "Students and families sign in to personalize copilots, access learning journeys, and track progress across devices.",
  },
];

export default function LoginLandingPage() {
  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-5xl flex-col justify-center px-6 py-24">
      <div className="pointer-events-none absolute left-14 top-10 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-8 bottom-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="theme-surface relative overflow-hidden rounded-3xl border p-10 shadow-2xl shadow-sky-500/10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-5">
            <Logo variant="card" />
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-sky-300">
              Choose your portal
            </p>
            <h1 className="theme-heading text-3xl font-semibold">
              Sign in to continue your iGyanAI journey.
            </h1>
            <p className="theme-muted text-sm leading-relaxed">
              Pick the login experience that matches your role. You can switch anytime—both connect to the same secure platform.
            </p>
          </div>

          <div className="grid w-full max-w-xl gap-5">
            {OPTIONS.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className="theme-surface group relative overflow-hidden rounded-2xl border p-6 text-left shadow-lg shadow-sky-500/10 transition-transform hover:-translate-y-1"
              >
                <div className="pointer-events-none absolute -right-12 top-6 h-24 w-24 rounded-full bg-sky-400/15 blur-3xl transition-opacity group-hover:opacity-100" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-500 dark:text-sky-300">
                  {option.badge}
                </p>
                <h2 className="theme-heading mt-3 text-xl font-semibold transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-300">
                  {option.label}
                </h2>
                <p className="theme-muted mt-3 text-sm">{option.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-500 transition group-hover:translate-x-1 group-hover:text-sky-400">
                  Continue
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
