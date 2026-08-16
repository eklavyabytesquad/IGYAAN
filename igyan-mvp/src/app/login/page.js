import Link from "next/link";
import { ArrowRight, Building2, GraduationCap } from "lucide-react";
import Logo from "@/components/logo";

const OPTIONS = [
  {
    href: "/login/institutional-suite",
    label: "Institutional Suite",
    eyebrow: "For schools & institutions",
    description: "Manage your campus, teams, workflows, and AI-powered learning programs.",
    icon: Building2,
  },
  {
    href: "/login/launch-pad",
    label: "Launch Pad",
    eyebrow: "For learners & families",
    description: "Student and parent access for personalized learning and family progress.",
    icon: GraduationCap,
  },
];

export default function LoginLandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fbff] px-6 py-10 text-slate-900 sm:px-10 lg:px-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(37,99,235,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.055)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="login-backdrop-drift absolute -left-40 top-1/4 h-[34rem] w-[34rem] rounded-full bg-blue-300/35 blur-[120px]" />
        <div className="login-backdrop-drift-reverse absolute -right-36 bottom-[-8rem] h-[34rem] w-[34rem] rounded-full bg-violet-300/35 blur-[130px]" />
        <svg className="absolute right-[5%] top-[12%] h-[30rem] w-[42rem] max-w-[70vw] opacity-35" viewBox="0 0 680 480" fill="none">
          <path className="login-path-flow" d="M52 382C156 312 160 172 286 197C388 218 368 343 486 308C548 289 576 212 638 112" stroke="#2563eb" strokeWidth="2" strokeDasharray="7 10" />
          <path className="login-path-flow login-path-flow-slow" d="M96 86C176 117 223 72 307 117C399 167 417 111 554 157" stroke="#7c3aed" strokeWidth="2" strokeDasharray="7 10" />
          <circle className="login-node" cx="52" cy="382" r="9" fill="#2563eb" /><circle className="login-node login-node-delay" cx="286" cy="197" r="12" fill="#06b6d4" /><circle className="login-node" cx="486" cy="308" r="9" fill="#7c3aed" /><circle className="login-node login-node-delay" cx="638" cy="112" r="12" fill="#2563eb" />
          <circle className="login-node login-node-delay" cx="96" cy="86" r="9" fill="#7c3aed" /><circle className="login-node" cx="307" cy="117" r="12" fill="#06b6d4" /><circle className="login-node login-node-delay" cx="554" cy="157" r="9" fill="#2563eb" />
        </svg>
      </div>
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center">
        <Link href="/" className="mb-12 flex w-fit items-center gap-3 text-[#0f1d3c]">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm"><Logo variant="compact" /></span>
          <span className="text-2xl font-extrabold tracking-tight">IGYAN AI</span>
        </Link>

        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <section>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0955b9]">Welcome back</p>
            <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[#0f1d3c] sm:text-5xl">Choose your sign-in experience.</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate-600">Select the workspace that best matches how you learn, lead, and grow with IGYAN AI.</p>
          </section>

          <section className="grid gap-5">
            {OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <Link key={option.href} href={option.href} className="group flex items-center gap-5 rounded-2xl border border-[#d9e3f3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0955b9] hover:shadow-lg hover:shadow-blue-900/10">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#0955b9]"><Icon className="h-7 w-7" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#0955b9]">{option.eyebrow}</span>
                    <span className="mt-1 block text-xl font-bold text-[#0f1d3c]">{option.label}</span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-slate-600">{option.description}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-[#0955b9] transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </section>
        </div>
      </div>
    </main>
  );
}
