import Logo from "@/components/logo";

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-20">
      <header className="max-w-2xl">
        <Logo variant="card" className="mb-6" />
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Let’s design your AI-first learning ecosystem.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
          Share a few details and our strategy team will connect within 24 hours
          to co-create your campus transformation roadmap.
        </p>
      </header>

      <section className="mt-16 grid gap-10 rounded-3xl border border-zinc-200 bg-white/90 p-10 shadow-2xl shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/70 lg:grid-cols-[1.1fr_0.9fr]">
        <form className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Priya Sharma"
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              required
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Work email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@igyan.ai"
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                required
              />
            </div>
            <div>
              <label htmlFor="organization" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Institution or organization
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                placeholder="Nova World School"
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="goal" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Primary goal
            </label>
            <select
              id="goal"
              name="goal"
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option>Launch AI copilots across operations</option>
              <option>Personalize learning and careers</option>
              <option>Build entrepreneurship and venture labs</option>
              <option>Co-create a custom initiative</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              How can we support you?
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Share your priorities, timelines, or challenges."
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-indigo-400"
          >
            Request strategy session
          </button>
        </form>

        <aside className="space-y-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
            Need an immediate walkthrough?
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Schedule a 30-minute live demo with our product strategists. We’ll
            map your objectives to the right copilots and launch plan.
          </p>
          <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
            <p>
              <span className="font-semibold">Email:</span> hello@igyan.ai
            </p>
            <p>
              <span className="font-semibold">Phone:</span> +91 98765 43210
            </p>
            <p>
              <span className="font-semibold">HQ:</span> Bengaluru & Singapore
            </p>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            By submitting this form, you agree to receive communications about
            iGyanAI products, events, and research. You can opt out anytime.
          </p>
        </aside>
      </section>
    </div>
  );
}