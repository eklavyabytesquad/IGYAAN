import Logo from "@/components/logo";

export default function ContactPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-sky-950">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/5" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/5" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-300/10 blur-3xl dark:bg-purple-500/5" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 lg:py-24">
        {/* Header */}
        <header className="max-w-2xl">
          <Logo variant="card" className="mb-6 scale-250 transform-gpu origin-left" />
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-600 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
            </span>
            We respond within 24 hours
          </div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white lg:text-5xl">
            Let&apos;s design your{' '}
            <span className="bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
              AI-first
            </span>{' '}
            learning ecosystem.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-zinc-600 dark:text-zinc-400 lg:text-lg">
            Share a few details and our strategy team will connect within 24 hours
            to co-create your campus transformation roadmap.
          </p>
        </header>

        {/* Main section */}
        <section className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form card */}
          <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-7 shadow-xl shadow-zinc-900/5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 lg:p-9">
            <h2 className="mb-6 text-lg font-bold text-zinc-900 dark:text-white">
              📬 Get in touch
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Priya Sharma"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-sky-500 dark:focus:bg-slate-800"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Work email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@school.edu"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-sky-500 dark:focus:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="organization" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Institution
                  </label>
                  <input
                    id="organization"
                    name="organization"
                    type="text"
                    placeholder="Nova World School"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-sky-500 dark:focus:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="goal" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Primary goal
                </label>
                <select
                  id="goal"
                  name="goal"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 transition-all focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-zinc-100 dark:focus:border-sky-500 dark:focus:bg-slate-800"
                >
                  <option>Launch Sudarshan AI copilots across operations</option>
                  <option>Personalize learning and careers</option>
                  <option>Build entrepreneurship and venture labs</option>
                  <option>Co-create a custom initiative</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  How can we support you?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  placeholder="Share your priorities, timelines, or challenges."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 transition-all placeholder:text-zinc-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-sky-500 dark:focus:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/30"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Request strategy session
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-transform duration-300 group-hover:translate-x-0" />
              </button>
            </form>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-5">
            {/* Demo CTA card */}
            <div className="rounded-2xl border border-sky-200/60 bg-gradient-to-br from-sky-50 to-indigo-50 p-6 shadow-lg shadow-sky-500/5 dark:border-sky-800/40 dark:from-sky-950/50 dark:to-indigo-950/50">
              <div className="mb-3 inline-flex rounded-lg bg-sky-100 p-2 dark:bg-sky-900/50">
                <svg className="h-5 w-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Need an immediate walkthrough?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Schedule a 30-minute live demo with our product strategists. We&apos;ll
                map your objectives to the right Sudarshan AI copilots and launch plan.
              </p>
            </div>

            {/* Contact details card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-lg shadow-zinc-900/5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Reach us directly
              </h3>
              <div className="space-y-3">
                <a href="mailto:hello@igyan.ai" className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-sky-50 dark:hover:bg-sky-950/30">
                  <div className="rounded-lg bg-sky-100 p-2 dark:bg-sky-900/50">
                    <svg className="h-4 w-4 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Email</p>
                    <p className="text-sm font-semibold text-zinc-900 group-hover:text-sky-600 dark:text-zinc-100 dark:group-hover:text-sky-400">hello@igyan.ai</p>
                  </div>
                </a>

                <a href="tel:+919262932333" className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-sky-50 dark:hover:bg-sky-950/30">
                  <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/50">
                    <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Phone</p>
                    <p className="text-sm font-semibold text-zinc-900 group-hover:text-sky-600 dark:text-zinc-100 dark:group-hover:text-sky-400">+91 - 9262932333</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Offices card */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-6 shadow-lg shadow-zinc-900/5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Our offices
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-amber-200/50 bg-amber-50/50 p-3 dark:border-amber-800/30 dark:bg-amber-950/20">
                  <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/50">
                    <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">🏢 Headquarters</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Mumbai, Maharashtra, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl p-3">
                  <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900/50">
                    <svg className="h-4 w-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-violet-600 dark:text-violet-400">📍 Sub Branches</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">Delhi, India</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">Patna, Bihar, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="px-1 text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
              By submitting this form, you agree to receive communications about
              iGyanAI products, events, and research. You can opt out anytime.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
