import Link from "next/link";
import Logo from "./logo";

export default function Footer() {
	return (
		<footer className="border-t border-zinc-200 bg-white/90 py-10 text-sm text-zinc-600 dark:border-slate-900 dark:bg-slate-950/85 dark:text-zinc-400">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-4">
					<Link
						href="/"
						className="flex items-center gap-3 text-lg font-semibold text-zinc-900 transition-colors hover:text-sky-500 dark:text-zinc-100 dark:hover:text-sky-400"
					>
						<Logo variant="footer" />
						<span className="leading-tight">iGyanAI</span>
					</Link>
					<p className="max-w-sm leading-relaxed">
						The AI-native operating system for schools, empowering students with
						personalized learning, career pathways, and entrepreneurship
						readiness.
					</p>
				</div>
				<div className="grid flex-1 grid-cols-2 gap-8 sm:max-w-md sm:grid-cols-3">
					<div className="space-y-3">
						<h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
							Explore
						</h3>
						<nav className="flex flex-col gap-2">
							<FooterLink href="/features" label="Features" />
							<FooterLink href="/about" label="About Us" />
							<FooterLink href="/contact" label="Contact" />
						</nav>
					</div>
					<div className="space-y-3">
						<h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
							Platform
						</h3>
						<nav className="flex flex-col gap-2">
							<FooterLink href="/login" label="Log in" />
							<FooterLink href="/register" label="Get Started" />
							<FooterLink href="mailto:hello@igyan.ai" label="Partner with us" />
						</nav>
					</div>
					<div className="space-y-3">
						<h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
							Updates
						</h3>
						<p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
							Join our newsletter to hear about new Sudarshan Ai copilots and curriculum
							launches.
						</p>
						<form className="flex gap-2">
							<input
								type="email"
								placeholder="email@school.com"
								className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
							/>
							<button
								type="submit"
								className="rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:-translate-y-0.5 hover:bg-sky-400"
							>
								Join
							</button>
						</form>
					</div>
				</div>
			</div>
			<div className="mx-auto mt-10 flex w-full max-w-6xl flex-col gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
				<p>© {new Date().getFullYear()} iGyanAI. All rights reserved.</p>
				<div className="flex flex-wrap gap-4">
					<FooterLink href="#" label="Terms" />
					<FooterLink href="#" label="Privacy" />
					<FooterLink href="#" label="Security" />
				</div>
			</div>
		</footer>
	);
}

function FooterLink({ href, label }) {
	return (
		<Link
			href={href}
			className="transition-colors hover:text-sky-500 dark:hover:text-sky-400"
		>
			{label}
		</Link>
	);
}
