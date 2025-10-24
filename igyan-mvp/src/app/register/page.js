import Link from "next/link";

export default function RegisterPage() {
	return (
		<div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center px-6 py-20">
			<div className="rounded-3xl border border-zinc-200 bg-white/90 p-10 shadow-2xl shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/70">
				<h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
					Create your iGyanAI workspace
				</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
					Set up access for your institution and invite your leadership team in
					minutes.
				</p>
				<form className="mt-8 space-y-5">
					<div className="grid gap-5 sm:grid-cols-2">
						<div>
							<label htmlFor="firstName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
								First name
							</label>
							<input
								id="firstName"
								type="text"
								placeholder="Priya"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
								required
							/>
						</div>
						<div>
							<label htmlFor="lastName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
								Last name
							</label>
							<input
								id="lastName"
								type="text"
								placeholder="Sharma"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
								required
							/>
						</div>
					</div>
					<div>
						<label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
							Work email
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
						<label htmlFor="institution" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
							Institution name
						</label>
						<input
							id="institution"
							type="text"
							placeholder="Nova World School"
							className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							required
						/>
					</div>
					<div className="grid gap-5 sm:grid-cols-2">
						<div>
							<label htmlFor="role" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
								Your role
							</label>
							<select
								id="role"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							>
								<option>Founder / Chairperson</option>
								<option>Principal / Academic Head</option>
								<option>Operations Leader</option>
								<option>Innovation Lead</option>
							</select>
						</div>
						<div>
							<label htmlFor="size" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
								Students served
							</label>
							<select
								id="size"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
							>
								<option>0 - 1,000</option>
								<option>1,000 - 5,000</option>
								<option>5,000 - 10,000</option>
								<option>10,000+</option>
							</select>
						</div>
					</div>
					<button
						type="submit"
						className="w-full rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-indigo-400"
					>
						Create workspace
					</button>
				</form>
				<p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
					Already have access? {" "}
					<Link
						href="/login"
						className="font-semibold text-indigo-500 transition-colors hover:text-indigo-400"
					>
						Log in here
					</Link>
				</p>
			</div>
		</div>
	);
}
