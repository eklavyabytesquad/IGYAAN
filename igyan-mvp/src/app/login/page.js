import Link from "next/link";

export default function LoginPage() {
	return (
		<div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-20">
			<div className="rounded-3xl border border-zinc-200 bg-white/90 p-10 shadow-2xl shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/70">
				<h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
					Welcome back
				</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
					Access your iGyanAI dashboard and copilots.
				</p>
				<form className="mt-8 space-y-5">
					<div>
						<label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
							Email address
						</label>
						<input
							id="email"
							type="email"
							placeholder="you@school.com"
							className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							required
						/>
					</div>
					<div>
						<label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
							Password
						</label>
						<input
							id="password"
							type="password"
							placeholder="••••••••"
							className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							required
						/>
					</div>
					<button
						type="submit"
						className="w-full rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-indigo-400"
					>
						Log in
					</button>
				</form>
						<p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
							Need an account? {" "}
							<Link
								href="/register"
								className="font-semibold text-indigo-500 transition-colors hover:text-indigo-400"
							>
								Create one
							</Link>
						</p>
			</div>
		</div>
	);
}
