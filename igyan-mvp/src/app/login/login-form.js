'use client';

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/logo";
import { useAuth } from "../utils/auth_context";

const VARIANT_COPY = {
  institutionalSuite: {
    badge: "Institutional Suite • Institutions",
    title: "Welcome back, visionary school leaders",
    subtitle:
      "Access the unified control center for Sudarshan Ai copilots, compliance, and innovation programs tailored to your campus.",
  highlight: "Institutional Suite",
    accentRing: "from-sky-500/20 via-cyan-400/10 to-transparent",
    gradient: "from-white via-sky-50 to-white",
    helper:
      "Need to onboard new principals or connect additional campuses? Our strategy team can tailor governance, provisioning, and integrations for your network.",
    helperLink: { href: "/contact", label: "Talk to strategists" },
    signupHref: "/register",
    signupLabel: "Request workspace access",
    footerPrompt: "Need to invite your leadership team?",
  },
  b2c: {
    badge: "B2C • Learners & Families",
    title: "Log in to your Sudarshan learner copilots",
    subtitle:
      "Stay on top of daily learning plans, passion projects, and venture studio challenges curated for curious minds and ambitious families.",
    highlight: "learner portal",
    accentRing: "from-sky-400/30 via-blue-400/10 to-transparent",
    gradient: "from-white via-sky-50 to-white",
    helper:
      "Looking to join as a new learner, parent, or mentor? Request access in minutes and unlock guided roadmaps for the skills you want to master.",
    helperLink: { href: "/contact", label: "Request an invite" },
    signupHref: "/register",
    signupLabel: "Create your personal account",
    footerPrompt: "First time discovering iGyanAI?",
  },
};

export default function LoginForm({ variant = "institutionalSuite" }) {
  const config = VARIANT_COPY[variant] ?? VARIANT_COPY.institutionalSuite;
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[72vh] w-full max-w-2xl flex-col justify-center px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/92 p-10 shadow-2xl shadow-sky-500/15 dark:border-slate-900 dark:bg-slate-950/80">
        <div
          className={`pointer-events-none absolute -top-24 right-[-15%] h-56 w-56 rounded-full bg-linear-to-br ${config.accentRing} blur-3xl`}
        />
        <div className="pointer-events-none absolute -bottom-28 left-[-10%] h-56 w-56 rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-500/20" />
        <div className="relative">
          <div className="mb-6 flex justify-center">
            <Logo variant="card" />
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-sky-300">
            {config.badge}
          </p>
          <h1 className="mt-5 text-2xl font-semibold text-zinc-900 dark:text-white">{config.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{config.subtitle}</p>

          {error ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@school.com"
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:-translate-y-0.5 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : `Access ${config.highlight}`}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-sky-200/60 bg-linear-to-br from-white via-sky-50 to-white px-5 py-4 text-xs text-zinc-600 shadow-inner dark:border-slate-800 dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-900 dark:text-zinc-400">
            <p className="font-semibold text-sky-600 dark:text-sky-300">{config.footerPrompt}</p>
            <p className="mt-1 leading-relaxed">
              {config.helper}
              {config.helperLink ? (
                <>
                  {" "}
                  <Link href={config.helperLink.href} className="font-semibold text-sky-500 hover:text-sky-400">
                    {config.helperLink.label}
                  </Link>
                  .
                </>
              ) : null}
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            No access yet?{" "}
            <Link href={config.signupHref} className="font-semibold text-sky-500 transition-colors hover:text-sky-400">
              {config.signupLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
