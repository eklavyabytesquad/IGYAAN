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
  professionalSuite: {
    badge: "Professional Suite • Learners & Families",
    title: "Log in to your Sudarshan learner copilots",
    subtitle:
      "Stay on top of daily learning plans, passion projects, and venture studio challenges curated for curious minds and ambitious families.",
    highlight: "Professional Suite",
    accentRing: "from-sky-400/30 via-blue-400/10 to-transparent",
    gradient: "from-white via-sky-50 to-white",
    helper:
      "Looking to join as a new learner, parent, or mentor? Request access in minutes and unlock guided roadmaps for the skills you want to master.",
    helperLink: { href: "/contact", label: "Request an invite" },
    signupHref: "/register",
    signupLabel: "Create your personal account",
  footerPrompt: "First time discovering Professional Suite?",
  },
};

export default function LoginForm({ variant = "institutionalSuite" }) {
  const config = VARIANT_COPY[variant] ?? VARIANT_COPY.institutionalSuite;
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    // Pass variant to login function for role-based access control
    const result = await login(email, password, variant);

    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
    // Role validation is handled in auth context
    // Successful login redirects to dashboard automatically
  };

  return (
    <div className="mx-auto flex min-h-[72vh] w-full max-w-2xl flex-col justify-center px-6 py-20">
      <div className="theme-surface relative overflow-hidden rounded-3xl border p-10 shadow-2xl shadow-sky-500/15">
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
          <h1 className="theme-heading mt-5 text-2xl font-semibold">{config.title}</h1>
          <p className="theme-muted mt-3 text-sm leading-relaxed">{config.subtitle}</p>

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
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
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
